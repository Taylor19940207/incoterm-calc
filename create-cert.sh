#!/bin/bash

echo "🔐 創建更安全的本地 SSL 證書..."

# 創建 SSL 目錄
mkdir -p ssl

# 創建 openssl 配置文件
cat > ssl/openssl.conf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = TW
ST = Taiwan
L = Taipei
O = IncotermCalc
OU = Development
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = 192.168.1.5
IP.3 = 192.168.43.67
EOF

# 生成私鑰
echo "生成私鑰..."
openssl genrsa -out ssl/key.pem 2048

# 生成證書簽名請求
echo "生成證書簽名請求..."
openssl req -new -key ssl/key.pem -out ssl/cert.csr -config ssl/openssl.conf

# 生成自簽名證書
echo "生成自簽名證書..."
openssl x509 -req -in ssl/cert.csr -signkey ssl/key.pem -out ssl/cert.pem -days 365 -extensions v3_req -extfile ssl/openssl.conf

# 清理臨時文件
rm ssl/cert.csr ssl/openssl.conf

echo "✅ SSL 證書創建完成！"
echo "📁 證書位置：ssl/cert.pem"
echo "🔑 私鑰位置：ssl/key.pem"
echo ""
echo "現在可以使用 ./start-pwa.sh 啟動 HTTPS 伺服器"
