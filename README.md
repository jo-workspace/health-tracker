# 身體疼痛與健康追蹤器

離線優先的個人健康追蹤 PWA，用於記錄疼痛日誌、長期健康追蹤項目與回診提醒。

## 功能

- 🩺 **疼痛日誌**：記錄部位、指數、觸發原因、備忘
- 📅 **長期健康追蹤**：追蹤腺瘤大小、回診預約倒計時
- 📊 **歷史數據**：搜尋、篩選、編輯、刪除所有記錄
- ☁️ **選用雲端同步**：透過 Google Apps Script REST API 同步至 Google 試算表

## 檔案結構

```
health-tracker/
├── index.html      # 主頁面
├── styles.css      # 樣式表（莫蘭迪配色）
├── scripts.js      # 主控邏輯
├── modals.html     # 彈窗 HTML 片段（動態載入）
├── Code.gs         # Google Apps Script 後端（選用，供雲端同步）
├── styles.html     # GAS 原始樣式檔（保留備用）
└── scripts.html    # GAS 原始腳本檔（保留備用）
```

## 本機開發

由於 `modals.html` 透過 `fetch()` 動態載入，請使用本機伺服器（避免 `file://` CORS 限制）：

```bash
npx serve .
# 或
python -m http.server 8080
```

## 啟用雲端同步

1. 將 `Code.gs` 部署為 Google Apps Script Web App（執行身份：我、存取：任何人）
2. 取得 Web App URL
3. 在瀏覽器 Console 執行：

```js
localStorage.setItem('pain_tracker_sync_url', 'YOUR_GAS_WEB_APP_URL');
location.reload();
```

## 部署至 Vercel

1. Push 此資料夾至 GitHub
2. 在 Vercel 匯入 repo
3. Framework Preset 選 **Other**，Build Command 留空，Output Directory 設為 `./`
4. Deploy
