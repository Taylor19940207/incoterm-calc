#!/bin/bash

echo "📱 創建 iOS 專用圖示..."

# 檢查是否安裝了 ImageMagick
if ! command -v convert &> /dev/null; then
    echo "❌ 需要安裝 ImageMagick"
    echo "請執行: brew install imagemagick"
    exit 1
fi

# 從 icon512.png 創建不同尺寸的圖示
echo "從 icon512.png 創建 iOS 圖示..."

# 創建 180x180 圖示
convert public/icon512.png -resize 180x180 public/icon180.png
echo "✅ 創建 icon180.png (180x180)"

# 創建 152x152 圖示
convert public/icon512.png -resize 152x152 public/icon152.png
echo "✅ 創建 icon152.png (152x152)"

# 創建 120x120 圖示
convert public/icon512.png -resize 120x120 public/icon120.png
echo "✅ 創建 icon120.png (120x120)"

echo ""
echo "🎉 iOS 圖示創建完成！"
echo "現在可以重新測試 PWA 安裝了"
