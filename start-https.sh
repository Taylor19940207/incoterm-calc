#!/bin/bash

# 檢查 SSL 證書是否存在
if [ ! -f "./ssl/cert.pem" ] || [ ! -f "./ssl/key.pem" ]; then
    echo "SSL 證書不存在，正在創建..."
    mkdir -p ssl
    openssl req -x509 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=TW/ST=Taiwan/L=Taipei/O=IncotermCalc/CN=localhost"
    echo "SSL 證書創建完成！"
fi

# 設置環境變數並啟動 HTTPS 開發伺服器
export HTTPS=true
export SSL_CRT_FILE=./ssl/cert.pem
export SSL_KEY_FILE=./ssl/key.pem
export HOST=0.0.0.0
export DANGEROUSLY_DISABLE_HOST_CHECK=true

echo "啟動 HTTPS 開發伺服器..."
echo "證書路徑: $SSL_CRT_FILE"
echo "金鑰路徑: $SSL_KEY_FILE"
echo "監聽地址: $HOST"

npm start
