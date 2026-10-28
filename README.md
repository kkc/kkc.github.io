# Kakashi · Notes & Works

Astro 靜態個人網站，技術文章與獨立開發產品並重。米白編輯風，繁體中文，自架字型，沒有預設分析追蹤或第三方留言腳本。

## 開發

使用 Node >=22.23.4（建議 Node 24 LTS）。

```sh
npm ci
npm run dev
npm run check
npm run build
npm run verify
```

`npm run preview` 可檢查正式 build。輸出位於 `dist/`，可部署到 GitHub Pages 或其他靜態託管。原始碼放在 `kkc/kkc.github.io` 的 `astro` 分支；推送會透過 GitHub Actions 自動發布，詳見 [發布說明](docs/publishing.md)。舊站 `master` 分支保留作為回復來源。

## 編輯內容

- 文章：`src/content/posts/*.md`。frontmatter 包含 title、date（YYYY-MM-DD 字串）、description、tags、permalink。
- 舊文章保留 `permalink`，不要改成 `/blog/slug/`。新文章也可使用 `/YYYY/MM/DD/slug/`。
- 作品：`src/data/site.ts` 的 products；圖片位於 `public/images/`。
- 聯絡方式與站址：同一個 `src/data/site.ts`；更換域名需同步 `astro.config.mjs` 和 `public/robots.txt`。
- 樣式：`src/styles/global.css`。

## 遷移

60 篇舊文章已遷移，包含從已發布 HTML 補回的 LTO 一篇。`docs/migration-manifest.json` 列出來源與原網址；實際已發布日期與大小寫均依舊站 sitemap 保留。原文章附圖已複製，Hexo codeblock、blockquote、YouTube 語法已轉換。`scripts/migrate-hexo.mjs` 記錄一次性轉換邏輯，重跑需原始碼與 sitemap 暫存檔，不是日常建置需求。

## 上線前資料

產品頁使用本機專案提供的 KakuCut 與 MeowTango 內容與真實截圖，已接上查證過的 App Store 下載網址，並提供 email 支援入口。商店網址集中於 `src/data/site.ts`。未加入未經證實的價格、評價或下載數。

SEO：靜態 HTML、逐頁 title/description、HTTPS canonical、OG/Twitter、BlogPosting JSON-LD、自動 sitemap、RSS、robots。Search Console 與分析工具需用你的帳號另行設定。改版上線後應重新提交 sitemap，檢查舊網址和商店外連；未取得真實使用者 Core Web Vitals。
