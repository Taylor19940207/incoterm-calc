#!/bin/bash

echo "🧪 測試 PWA 功能..."
echo "========================"

# 檢查應用程式是否運行
echo "1. 檢查應用程式狀態..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ 應用程式正在運行 (端口 3000)"
else
    echo "   ❌ 應用程式未運行"
    exit 1
fi

# 檢查 HTML 標籤
echo "2. 檢查 PWA HTML 標籤..."
if curl -s http://localhost:3000 | grep -q "manifest"; then
    echo "   ✅ manifest.json 標籤存在"
else
    echo "   ❌ manifest.json 標籤缺失"
fi

if curl -s http://localhost:3000 | grep -q "PWA 離線支援"; then
    echo "   ✅ PWA 離線支援標籤存在"
else
    echo "   ❌ PWA 離線支援標籤缺失"
fi

# 檢查 Service Worker
echo "3. 檢查 Service Worker..."
if curl -s http://localhost:3000/sw.js | grep -q "CACHE_NAME"; then
    echo "   ✅ Service Worker 檔案存在"
else
    echo "   ❌ Service Worker 檔案缺失"
fi

# 檢查 Manifest
echo "4. 檢查 Web App Manifest..."
if curl -s http://localhost:3000/manifest.json | grep -q "Incoterm Calc"; then
    echo "   ✅ manifest.json 內容正確"
else
    echo "   ❌ manifest.json 內容錯誤"
fi

# 檢查 JavaScript 檔案
echo "5. 檢查 JavaScript 檔案..."
if curl -s "http://localhost:3000/static/js/bundle.js" | grep -q "webpackBootstrap"; then
    echo "   ✅ JavaScript 檔案載入正常"
else
    echo "   ❌ JavaScript 檔案載入失敗"
fi

echo "========================"
echo "🎉 PWA 功能測試完成！"
echo ""
echo "📱 下一步："
echo "1. 在瀏覽器中打開 http://localhost:3000"
echo "2. 檢查 PWA 安裝提示"
echo "3. 測試離線功能"
echo "4. 在手機上安裝應用程式"
