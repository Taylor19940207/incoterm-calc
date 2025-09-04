import React, { useState } from 'react';
import { Product, ProductInputMode } from '../types';
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet';
import { Button } from './ui/button';
import { ProductEditor } from './ProductEditor';

interface ProductManagerProps {
  products: Product[];
  onUpdate: (products: Product[]) => void;
}

export default function ProductManager({ products, onUpdate }: ProductManagerProps) {
  // 新增：物流配置狀態
  const [transportMode, setTransportMode] = useState<'air' | 'courier' | 'sea' | 'truck'>('air');
  const [customDivisor, setCustomDivisor] = useState<string>('');

  // 新增：批量操作狀態
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    onUpdate(updatedProducts);
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: '新商品',
      inputMode: 'perBox',
      boxPrice: 0,
      boxQuantity: 1,
      orderBoxes: 1,
      lengthM: 0.1,
      widthM: 0.1,
      heightM: 0.1,
      weightKg: 1.0
    };
    onUpdate([...products, newProduct]);
  };

  // 新增：計算體積和體積重
  const calculateVolume = (product: Product) => {
    return (product.lengthM * product.widthM * product.heightM).toFixed(6);
  };

  const calculateVolumetricWeight = (product: Product) => {
    const volumeCm3 = (product.lengthM * product.widthM * product.heightM) * 1000000; // 轉換為 cm³
    const divisor = transportMode === 'air' ? 6000 : 
                   transportMode === 'courier' ? 5000 : 
                   transportMode === 'truck' ? 6000 : 0;
    
    if (divisor === 0) return 'N/A';
    return (volumeCm3 / divisor).toFixed(2);
  };

  // 新增：批量操作函數
  const toggleProductSelection = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const applyTransportMode = () => {
    if (selectedProducts.size === 0) return;
    
    const updatedProducts = products.map(p => {
      if (selectedProducts.has(p.id)) {
        return { ...p, transportMode };
      }
      return p;
    });
    onUpdate(updatedProducts);
  };

  const clearDimensions = () => {
    if (selectedProducts.size === 0) return;
    
    const updatedProducts = products.map(p => {
      if (selectedProducts.has(p.id)) {
        return { ...p, lengthM: 0, widthM: 0, heightM: 0 };
      }
      return p;
    });
    onUpdate(updatedProducts);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    const updatedProducts = products.map(p =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    onUpdate(updatedProducts);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">產品管理</h2>
        <button
          onClick={addProduct}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 新增產品
        </button>
      </div>

      {/* 新增：物流配置 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">🚚 物流配置</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">運輸方式</label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="air">空運 (係數: 6000)</option>
              <option value="courier">快遞 (係數: 5000)</option>
              <option value="sea">海運 (無體積重)</option>
              <option value="truck">卡車 (係數: 6000)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">自定義係數</label>
            <input
              type="number"
              placeholder="覆寫預設係數"
              value={customDivisor}
              onChange={(e) => setCustomDivisor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={applyTransportMode}
              disabled={selectedProducts.size === 0}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              應用到選中產品
            </button>
          </div>
        </div>
      </div>

      {/* 新增：批量操作工具欄 */}
      {selectedProducts.size > 0 && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <span className="text-purple-700 font-medium">
              已選中 {selectedProducts.size} 個產品
            </span>
            <div className="flex gap-2">
              <button
                onClick={clearDimensions}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                清空尺寸
              </button>
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                取消選擇
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === products.length && products.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(new Set(products.map(p => p.id)));
                    } else {
                      setSelectedProducts(new Set());
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">產品名稱</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">輸入模式</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">價格</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">數量</th>
              {/* 新增：尺寸和重量欄位 */}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">長度 (m)</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">寬度 (m)</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">高度 (m)</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">重量 (kg)</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">體積 (m³)</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">體積重 (kg)</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {product.inputMode === 'perBox' ? '按箱' : '按件'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {product.inputMode === 'perBox' ? product.boxPrice : product.unitPrice}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {product.inputMode === 'perBox' ? product.boxQuantity : product.totalQuantity}
                  </span>
                </td>
                {/* 新增：尺寸和重量顯示 */}
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{product.lengthM}</span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{product.widthM}</span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{product.heightM}</span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{product.weightKg}</span>
                </td>
                {/* 新增：計算結果顯示 */}
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 font-mono">
                    {calculateVolume(product)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 font-mono">
                    {calculateVolumetricWeight(product)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                            <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">編輯</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[520px] sm:w-[640px]">
            <ProductEditor 
              initial={product} 
              onSubmit={handleProductUpdate}
            />
          </SheetContent>
        </Sheet>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
