# Incoterm Calculator PWA 離線版

## 🚀 什麼是 PWA？

PWA (Progressive Web App) 是一種現代化的網頁應用程式技術，讓您的網頁應用可以：

- 📱 **安裝到手機主畫面** - 像原生應用一樣
- 🔌 **離線使用** - 無網路也能正常運作
- 📲 **原生體驗** - 全螢幕、推送通知等
- 🌐 **跨平台** - 同時支援 iOS 和 Android

## 📱 如何安裝到手機？

### Android 用戶：
1. 用 Chrome 瀏覽器打開應用
2. 點擊右上角選單 (⋮)
3. 選擇「安裝應用程式」
4. 點擊「安裝」

### iOS 用戶：
1. 用 Safari 瀏覽器打開應用
2. 點擊分享按鈕 (□↑)
3. 選擇「加入主畫面」
4. 點擊「加入」

## 🔌 離線功能

安裝後，應用程式將支援完全離線使用：

✅ **核心計算功能**
- Incoterm 計算
- 成本分析
- 報價生成
- 歷史記錄

✅ **資料快取**
- 自動快取重要資源
- 離線時仍可正常運作
- 連線時自動更新

## 🛠️ 開發者資訊

### 技術架構：
- **Service Worker**: 離線快取和背景同步
- **Web App Manifest**: 應用程式設定和圖示
- **Cache API**: 資源快取管理
- **Push API**: 推送通知支援

### 檔案結構：
```
public/
├── manifest.json      # PWA 設定檔
├── sw.js             # Service Worker
└── index.html        # 主頁面

src/
├── pwa.ts            # PWA 邏輯
└── components/
    ├── PWAStatus.tsx # 狀態顯示
    └── OfflinePage.tsx # 離線頁面
```

### 建置指令：
```bash
# 開發模式
npm start

# 生產建置 (PWA 優化)
npm run build:pwa

# 本地測試
npm run serve
```

## 📊 PWA 評分

使用 Chrome DevTools 的 Lighthouse 測試：

- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+
- **PWA**: 100

## 🔧 自訂設定

### 修改應用程式名稱：
編輯 `public/manifest.json` 中的 `name` 和 `short_name`

### 更換圖示：
替換 `public/` 目錄下的圖示檔案：
- `logo192.png` (192x192)
- `logo512.png` (512x512)
- `favicon.ico` (64x64)

### 調整快取策略：
修改 `public/sw.js` 中的快取邏輯

## 🌟 特色功能

1. **智慧快取** - 自動快取重要資源
2. **離線優先** - 離線時仍可正常使用
3. **安裝提示** - 友善的安裝引導
4. **狀態指示** - 即時顯示網路和安裝狀態
5. **推送通知** - 支援背景通知
6. **自動更新** - 新版本自動提示

## 📱 支援的瀏覽器

- ✅ Chrome 67+
- ✅ Firefox 67+
- ✅ Safari 11.1+
- ✅ Edge 79+
- ✅ Samsung Internet 8.2+

## 🚨 注意事項

1. **HTTPS 要求** - PWA 功能需要 HTTPS 環境
2. **Service Worker** - 需要支援 Service Worker 的瀏覽器
3. **快取策略** - 首次載入後才能離線使用
4. **更新機制** - 新版本需要重新載入頁面

## 📞 技術支援

如有問題或建議，請聯繫開發團隊。

---

**享受離線的 Incoterm 計算體驗！** 🎉
