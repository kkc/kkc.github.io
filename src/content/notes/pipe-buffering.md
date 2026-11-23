---
title: 為什麼 pipe 接了 grep 後看起來卡住
description: 沒有輸出，不一定是 pipe 壞掉；資料也可能還留在上一個程式的 output buffer。
kind: concept
topics: [systems]
tags: [shell, buffering, pipe]
createdAt: "2026-11-23"
updatedAt: "2026-11-23"
status: published
sourceDate: "2024-12-26"
sources:
  - label: "Julia Evans · Why pipes get stuck: buffering（2024）"
    url: https://jvns.ca/blog/2024/11/29/why-pipes-get-stuck-buffering/
relatedPosts:
  - /2020/08/22/file-descriptor/
---

之前看到 Julia Evans 在講 pipe buffering，這個問題很容易以為是 pipe 卡住，其實上游可能根本還沒把資料寫出來。

## 多接一個 grep 就不一樣

原文的例子是持續看 log，再接兩個 filter：

```sh
tail -f /some/log/file | grep thing1 | grep thing2
```

第一個 `grep` 的 stdout 接到 pipe，不是 terminal，輸出可能改用 block buffering。匹配的資料很少時，就會一直等，看起來像沒在做事。

## 記住要調的是哪一段

支援這個選項的 `grep` 可以改成：

```sh
tail -f /some/log/file | grep --line-buffered thing1 | grep thing2
```

這裡要改的是中間那個 `grep`。只調最後顯示結果的程式，救不到還留在上游的資料。

buffer 大小和選項會依實作不同，不能把一個數字套到所有環境。這裡保留原文用法，還沒補自己的環境測試。

## 下次沒輸出時

先分清楚是條件沒匹配、程式還在等輸入，還是輸出被 buffer 住。都是「沒東西出現」，卡的位置卻完全不同。
