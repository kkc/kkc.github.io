---
title: HPC 上的環境管理，為什麼不像 web service 那麼直覺
description: 從 module load、共用檔案系統到 container，真正難搬的往往還有使用工具的工作方式。
kind: experiment
topics: [systems]
tags: [HPC, containers, environment modules]
createdAt: "2026-11-23"
updatedAt: "2026-11-23"
status: published
sourceDate: "2021-10-25"
sources:
  - label: "Nathan Sheffield · From HPC environment modules to linux containers（2020）"
    url: https://databio.org/posts/modules_to_containers.html
relatedPosts:
  - /2018/04/28/docker-note/
---

2021 年處理的業務比較偏 HPC，跟以前的 web service 差很多。最讓我頭痛的是，原本想用 container 解決 environment 和 dependency 不一致，到了這邊卻不是包好 image 就沒事了。

## 使用者要的是一個能工作的環境

當時接觸的工作方式，是透過 LSF 或 Slurm 把 job 送出去，預期各台機器都有工具，跑出來的 log 也能直接從 disk 上持續查看。

很多人是在使用 tool，不是在維護服務。他們需要的是直接打 command，能搭配其他工具，有些甚至還要 GUI。我們沒辦法期待每個人都先學會 container 的生命週期和 volume mounting。

## module load 很方便，也會互相影響

例如 `module load python3`，使用者可以切換環境，不用自己找安裝路徑。但 module 仍依賴 cluster 上提供的軟體和設定，換到另一個環境不見得能直接搬過去。

當時我還遇到另一種麻煩：程式需要呼叫其他人的 utilities，被動載入 module，卻把原本需要的 Python 版本換掉。每個工具單看都沒問題，放在同一個環境反而炸掉。

## container 還需要一層使用方式

閱讀來源介紹的 Bulker，把 command 對到 container，並處理啟動和 mounting，讓使用者保留類似載入工具環境的操作方式。

這個方向對我的啟發是：除了封裝 dependency，還要讓工具符合大家原本怎麼做事。不能把 infra 端的便利，直接當成使用者也會覺得方便。

## 還想釐清的事

這裡整理的是當時的經驗，沒有把 Bulker 寫成自己已經部署過的解法。若再處理類似問題，我會先列清楚 command、GUI、log 路徑、shared storage 與 scheduler 各自的需求，再決定 container 的邊界。
