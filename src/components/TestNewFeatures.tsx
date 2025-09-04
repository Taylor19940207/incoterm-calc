import React, { useState } from 'react';
import { Product, TransportMode, ShippingConfig } from '../types';
import { ProductManagerNew } from './ProductManagerNew';
import { TransportModeCard } from './TransportModeCard';

export function TestNewFeatures() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "test-1",
      name: "測試商品1",
      inputMode: "perBox",
      boxPrice: 100,
      boxQuantity: 10,
      orderBoxes: 5,
      lengthM: 0.2,
      widthM: 0.15,
      heightM: 0.1,
      weightKg: 2.5
    },
    {
      id: "test-2",
      name: "測試商品2",
      inputMode: "perUnit",
      unitPrice: 15,
      totalQuantity: 200,
      boxQuantity: 20,
      lengthM: 0.1,
      widthM: 0.08,
      heightM: 0.05,
      weightKg: 0.8
    }
  ]);

  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({
    mode: "air",
    volumetricDivisor: 6000,
    userOverride: undefined
  });

  const t = {
    "商品": "商品",
    "addProduct": "添加商品"
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            新功能測試頁面
          </h1>
          <p className="text-gray-600">
            測試新的產品管理、尺寸輸入和物流配置功能
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 物流方式配置 */}
          <div className="lg:col-span-1">
            <TransportModeCard
              config={shippingConfig}
              onConfigChange={setShippingConfig}
              t={t}
            />
          </div>

          {/* 產品管理 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">產品管理</h2>
              <ProductManagerNew
                products={products}
                onUpdate={setProducts}
                transportMode={shippingConfig.mode}
                t={t}
              />
            </div>
          </div>
        </div>

        {/* 當前狀態顯示 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">當前狀態</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">物流配置</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(shippingConfig, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">產品數據</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(products, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
