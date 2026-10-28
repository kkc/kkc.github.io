# 網站管理與發布

- 原始碼儲存庫：https://github.com/kkc/kkc.github.io
- 日常維護分支：`astro`
- 網站：https://kkc.github.io/
- 舊靜態網站保留在 `master`；舊 Hexo 原始碼仍在 https://github.com/kkc/blog 。

## 日常更新

1. 在 `src/content/posts/` 新增或編輯 Markdown。
2. 產品介紹與下載連結編輯 `src/data/site.ts`，圖片放在 `public/images/`。
3. 本機以 `npm run dev` 預覽。
4. 執行 `npm run check`、`npm run build`、`npm run verify`。
5. `git add`、`git commit`，然後 `git push origin astro`。
6. GitHub Actions 的 Publish Astro site 會自動檢查並發布。若建置失敗，不會部署新版本。

也可以直接用 GitHub 的檔案編輯器修改 Markdown 並 commit 到 `astro`。Pull request 會建置驗證，但不會發布。

## 回復

一般修改可用 `git revert` 回復指定 commit，再推送到 `astro`，Actions 會重新發布。舊版整站仍保留在 `master`；要切回舊站，可在儲存庫 Settings → Pages 將來源改為 Deploy from a branch，選 `master` 的根目錄。

## 首次部署後

Search Console 提交 `https://kkc.github.io/sitemap-index.xml`。既有文章的 permalink 不要任意更改。此流程不需要額外儲存 GitHub token 或部署 SSH key。
