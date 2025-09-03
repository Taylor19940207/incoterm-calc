#!/bin/bash

echo "🚀 啟動 PWA HTTPS 伺服器（僅用於手機安裝測試）"
echo "⚠️  注意：這只是為了測試 PWA 安裝，平時開發請用 npm start"

# 檢查 mkcert 證書是否存在
if [ ! -f "./localhost+2.pem" ] || [ ! -f "./localhost+2-key.pem" ]; then
    echo "🔐 創建 mkcert 證書..."
    mkcert localhost 192.168.1.5 192.168.43.67
    echo "✅ mkcert 證書創建完成！"
fi

# 設置環境變數並啟動 HTTPS 開發伺服器
export HTTPS=true
export SSL_CRT_FILE=./localhost+2.pem
export SSL_KEY_FILE=./localhost+2-key.pem
export HOST=0.0.0.0
export DANGEROUSLY_DISABLE_HOST_CHECK=true

echo "🌐 啟動 HTTPS 開發伺服器..."
echo "📱 在手機上訪問：https://192.168.1.5:3000"
echo "💻 本地訪問：https://localhost:3000"
echo ""
echo "按 Ctrl+C 停止伺服器"

npm start
