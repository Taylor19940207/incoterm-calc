import React, { useCallback } from 'react';
import { Product } from '../types';

interface ProductManagerProps {
  products: Product[];
  currency: string;
  onUpdate: (products: Product[]) => void;
  t: any;
}

const ProductManager: React.FC<ProductManagerProps> = React.memo(({ 
  products, 
  currency, 
  onUpdate, 
  t 
}) => {
  
  // 添加商品
  const addProduct = useCallback(() => {
    const newProduct: Product = {
      id: `product-${Date.now()}-${Math.random()}`,
      name: `商品${products.length + 1}`,
      inputMode: "perBox",
      boxPrice: 0,
      boxQuantity: 1,
      orderBoxes: 0,
      volume: 0,
      weight: 0
    };
    onUpdate([...products, newProduct]);
  }, [products, onUpdate]);

  // 刪除商品
  const deleteProduct = useCallback((index: number) => {
    if (products.length <= 1) return; // 至少保留一個
    const newProducts = products.filter((_, i) => i !== index);
    onUpdate(newProducts);
  }, [products, onUpdate]);

  // 更新商品
  const updateProduct = useCallback((index: number, field: keyof Product, value: string | number) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    onUpdate(newProducts);
  }, [products, onUpdate]);

  // 移動商品
  const moveProduct = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= products.length) return;
    
    const newProducts = [...products];
    const [movedItem] = newProducts.splice(fromIndex, 1);
    newProducts.splice(toIndex, 0, movedItem);
    onUpdate(newProducts);
  }, [products, onUpdate]);

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="p-4 rounded-xl border bg-white relative"
          >
            {/* 商品名稱 - 移到上面 */}
            <div className="mb-3">
              <input
                type="text"
                value={product.name}
                onChange={(e) => updateProduct(index, 'name', e.target.value)}
                className="w-full text-base border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="商品名稱"
              />
            </div>
            
            {/* 移動按鈕 */}
            <div className="absolute top-4 right-4 flex flex-col gap-1">
              <button
                onClick={() => moveProduct(index, index - 1)}
                disabled={index === 0}
                className={`w-6 h-6 text-xs rounded flex items-center justify-center ${
                  index === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="上移"
              >
                ↑
              </button>
              <button
                onClick={() => moveProduct(index, index + 1)}
                disabled={index === products.length - 1}
                className={`w-6 h-6 text-xs rounded flex items-center justify-center ${
                  index === products.length - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="下移"
              >
                ↓
              </button>
            </div>
            
            {/* 輸入模式選擇 */}
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">{t.productInputMode}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateProduct(index, 'inputMode', 'perBox')}
                  className={`px-3 py-1 text-sm rounded border ${
                    product.inputMode === 'perBox' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {t.perBox}
                </button>
                <button
                  onClick={() => updateProduct(index, 'inputMode', 'perUnit')}
                  className={`px-3 py-1 text-sm rounded border ${
                    product.inputMode === 'perUnit' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {t.perUnit}
                </button>
              </div>
            </div>
            
            {/* 單箱模式輸入 */}
            {product.inputMode === 'perBox' && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.boxPrice}</label>
                  <input
                    type="number"
                    value={product.boxPrice || ''}
                    onChange={(e) => updateProduct(index, 'boxPrice', Number(e.target.value) || 0)}
                    className="w-full text-base border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.boxQuantity}</label>
                  <input
                    type="number"
                    value={product.boxQuantity || ''}
                    onChange={(e) => updateProduct(index, 'boxQuantity', Number(e.target.value) || 0)}
                    className="w-full text-base border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min={1}
                    step={1}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.orderBoxes}</label>
                  <input
                    type="number"
                    value={product.orderBoxes || ''}
                    onChange={(e) => updateProduct(index, 'orderBoxes', Number(e.target.value) || 0)}
                    className="w-full text-base border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min={0}
                    step={1}
                  />
                </div>
              </div>
            )}
            
            {/* 單個模式輸入 */}
            {product.inputMode === 'perUnit' && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.unitPrice}</label>
                  <input
                    type="number"
                    value={product.unitPrice || ''}
                    onChange={(e) => updateProduct(index, 'unitPrice', Number(e.target.value) || 0)}
                    className="w-full text-base border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.totalQuantity}</label>
                  <input
                    type="number"
                    value={product.totalQuantity || ''}
                    onChange={(e) => updateProduct(index, 'totalQuantity', Number(e.target.value) || 0)}
                    className="w-full text-base border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min={0}
                    step={1}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.boxQuantity}</label>
                  <input
                    type="number"
                    value={product.boxQuantity || ''}
                    onChange={(e) => updateProduct(index, 'boxQuantity', Number(e.target.value) || 0)}
                    className="w-full text-base border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min={1}
                    step={1}
                  />
                </div>
              </div>
            )}
            
            {/* 體積和重量 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t.volume}</label>
                <input
                  type="number"
                  value={product.volume || ''}
                  onChange={(e) => updateProduct(index, 'volume', Number(e.target.value) || 0)}
                  className="w-full text-base border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min={0}
                  step={0.001}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t.weight}</label>
                <input
                  type="number"
                  value={product.weight || ''}
                  onChange={(e) => updateProduct(index, 'weight', Number(e.target.value) || 0)}
                  className="w-full text-base border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min={0}
                  step={0.1}
                />
              </div>
            </div>
            
            {/* 刪除按鈕 - 小減號在右下角 */}
            {products.length > 1 && (
              <button
                onClick={() => deleteProduct(index)}
                className="absolute bottom-2 right-2 w-6 h-6 text-xs rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center"
                title={t.deleteProduct}
              >
                −
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* 添加商品按鈕 */}
      <button
        onClick={addProduct}
        className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + {t.addProduct}
      </button>
      
      {/* 排序提示 */}
      {products.length > 1 && (
        <div className="text-xs text-gray-400 text-center">
          使用 ↑↓ 按鈕重新排序
        </div>
      )}
    </div>
  );
});

ProductManager.displayName = 'ProductManager';

export default ProductManager;
