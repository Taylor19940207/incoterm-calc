#!/bin/bash

echo "🧹 清除快取和 Service Worker..."

# 停止開發伺服器
echo "停止開發伺服器..."
pkill -f "react-scripts"

# 清除 SSL 證書（重新生成）
echo "清除 SSL 證書..."
rm -rf ssl

# 清除 build 資料夾
echo "清除 build 資料夾..."
rm -rf build

# 清除 node_modules（可選）
read -p "是否要清除 node_modules？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "清除 node_modules..."
    rm -rf node_modules
    echo "重新安裝依賴..."
    npm install
fi

echo "✅ 快取清除完成！"
echo ""
echo "現在您可以："
echo "1. 重新啟動 HTTP 開發伺服器：npm start"
echo "2. 測試 PWA 安裝：./start-pwa.sh"
