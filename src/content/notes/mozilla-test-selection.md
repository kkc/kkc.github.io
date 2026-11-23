---
title: Mozilla 怎麼用歷史資料選擇要跑的測試
description: 測試太多時，不只讓測試跑快一點，也可以先問哪些測試值得現在跑。
kind: reading
topics: [build]
tags: [CI, machine learning, test selection]
createdAt: "2026-11-23"
updatedAt: "2026-11-23"
status: published
sourceDate: "2020-07-15"
sources:
  - label: "Mozilla Hacks · Testing Firefox more efficiently with machine learning（2020）"
    url: https://hacks.mozilla.org/2020/07/testing-firefox-more-efficiently-with-machine-learning/
---

以前看到 Mozilla 用機器學習選擇測試的文章，覺得這個 idea 蠻有趣的，沒想過可以用在這邊。

## 要選的是什麼

基本上就是看這次 patch，預測哪些測試比較可能失敗，先把資源花在那些地方。這是選擇要跑的測試，不是讓模型代替測試判斷程式對不對。

## 我的理解

原文把 test 和 patch 配成一組，用歷史失敗紀錄建立關聯。麻煩的地方是，測試可能沒跑，也可能 flaky，所以失敗不一定能直接歸因到眼前這個 patch。

另外驗證資料要比訓練資料晚，不能把未來的失敗資訊偷偷放回去，不然成績漂亮也沒用。

## 想留下的問題

我會先問：省下多少執行成本，又漏掉多少 regression？這兩個要一起看。

這裡記的是 2020 年文章的設計想法，不是自己實作過的結果。之後若要用在自己的 CI，還得先確認歷史紀錄夠不夠用，以及漏選時怎麼補跑。
