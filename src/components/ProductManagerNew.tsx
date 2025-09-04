import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Product, TransportMode, ValidationState } from '../types';
import { validateProduct } from '../utils/validationUtils';
import { usePreferences } from '../hooks/usePreferences';
import { cn } from '../utils/cn';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ProductManagerNewProps {
  products: Product[];
  onUpdate: (products: Product[]) => void;
  transportMode: TransportMode;
  t: any; // 字典
}

export function ProductManagerNew({ products, onUpdate, transportMode, t }: ProductManagerNewProps) {
  const { preferences } = usePreferences();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [validationStates, setValidationStates] = useState<Record<string, ValidationState>>({});

  // 驗證產品
  const validateProducts = useCallback(() => {
    const newValidationStates: Record<string, ValidationState> = {};
    
    products.forEach(product => {
      const validation = validateProduct(
        product, 
        transportMode,
        preferences.dimensionUnit,
        preferences.weightUnit
      );
      newValidationStates[product.id] = validation;
    });
    
    setValidationStates(newValidationStates);
  }, [products, transportMode, preferences.dimensionUnit, preferences.weightUnit]);

  // 當產品或運輸模式變化時重新驗證
  useEffect(() => {
    validateProducts();
  }, [validateProducts]);

  // 計算產品的 CBM 和體積重
  const calculateProductMetrics = useCallback((product: Product) => {
    const cbmPerBox = (product.lengthM || 0) * (product.widthM || 0) * (product.heightM || 0);
    const totalCBM = cbmPerBox * (product.inputMode === 'perBox' ? (product.orderBoxes || 0) : Math.ceil((product.totalQuantity || 0) / (product.boxQuantity || 1)));
    
    let volumetricWeightPerBox = 0;
    let totalVolumetricWeight = 0;
    
    if (transportMode !== 'sea' && preferences.divisorOverrides?.[transportMode]) {
      const divisor = preferences.divisorOverrides[transportMode] || 6000;
      const lengthCm = (product.lengthM || 0) * 100;
      const widthCm = (product.widthM || 0) * 100;
      const heightCm = (product.heightM || 0) * 100;
      volumetricWeightPerBox = (lengthCm * widthCm * heightCm) / divisor;
      totalVolumetricWeight = volumetricWeightPerBox * (product.inputMode === 'perBox' ? (product.orderBoxes || 0) : Math.ceil((product.totalQuantity || 0) / (product.boxQuantity || 1)));
    }
    
    const actualWeightPerBox = product.weightKg || 0;
    const totalActualWeight = actualWeightPerBox * (product.inputMode === 'perBox' ? (product.orderBoxes || 0) : Math.ceil((product.totalQuantity || 0) / (product.boxQuantity || 1)));
    
    const chargeableWeight = transportMode !== 'sea' ? Math.max(totalActualWeight, totalVolumetricWeight) : totalActualWeight;
    
    return {
      cbmPerBox: cbmPerBox.toFixed(preferences.rounding.cbm),
      totalCBM: totalCBM.toFixed(preferences.rounding.cbm),
      volumetricWeightPerBox: volumetricWeightPerBox.toFixed(preferences.rounding.weight),
      totalVolumetricWeight: totalVolumetricWeight.toFixed(preferences.rounding.weight),
      actualWeightPerBox: actualWeightPerBox.toFixed(preferences.rounding.weight),
      totalActualWeight: totalActualWeight.toFixed(preferences.rounding.weight),
      chargeableWeight: chargeableWeight.toFixed(preferences.rounding.weight)
    };
  }, [transportMode, preferences.divisorOverrides, preferences.rounding]);

  // 更新產品
  const updateProduct = useCallback((index: number, field: keyof Product, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    onUpdate(newProducts);
  }, [products, onUpdate]);

  // 刪除產品
  const deleteProduct = useCallback((index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    onUpdate(newProducts);
  }, [products, onUpdate]);

  // 添加產品
  const addProduct = useCallback(() => {
    const newProduct: Product = {
      id: `product-${Date.now()}-${Math.random()}`,
      name: `${t["商品"]}${products.length + 1}`,
      inputMode: "perBox",
      boxPrice: 0,
      boxQuantity: 1,
      orderBoxes: 0,
      lengthM: 0.1,
      widthM: 0.1,
      heightM: 0.1,
      weightKg: 1.0
    };
    onUpdate([...products, newProduct]);
  }, [products, onUpdate, t]);

  // 選擇產品
  const toggleProductSelection = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  // 全選/取消全選
  const toggleAllSelection = useCallback(() => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  }, [selectedIds.length, products]);

  // 批量操作
  const bulkToggleDimensionUnit = useCallback(() => {
    // TODO: 實現批量單位切換
    console.log('批量切換尺寸單位');
  }, []);

  const bulkToggleWeightUnit = useCallback(() => {
    // TODO: 實現批量重量單位切換
    console.log('批量切換重量單位');
  }, []);

  const bulkApplyTransport = useCallback(() => {
    // TODO: 實現批量套用物流方式
    console.log('批量套用物流方式');
  }, []);

  const bulkClearDimensions = useCallback(() => {
    if (window.confirm(`確定要清空 ${selectedIds.length} 個商品的尺寸嗎？`)) {
      const newProducts = products.map(product => 
        selectedIds.includes(product.id) 
          ? { ...product, lengthM: 0, widthM: 0, heightM: 0 }
          : product
      );
      onUpdate(newProducts);
      setSelectedIds([]);
    }
  }, [selectedIds, products, onUpdate]);

  const bulkApplyBoxSpec = useCallback(() => {
    // TODO: 實現批量套用箱規
    console.log('批量套用箱規');
  }, []);

  return (
    <div className="space-y-4">
      {/* 批量操作工具條 */}
      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
          <div className="flex items-center gap-3 p-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>⚠️</span>
              已選 {selectedIds.length} 項
            </Badge>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={bulkToggleDimensionUnit}
                className="flex items-center gap-1"
              >
                <span>📦</span>
                尺寸單位 {preferences.dimensionUnit === 'mm' ? 'mm↔cm' : 'cm↔mm'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={bulkToggleWeightUnit}
                className="flex items-center gap-1"
              >
                <span>⚖️</span>
                重量單位 {preferences.weightUnit === 'kg' ? 'kg↔g' : 'g↔kg'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={bulkApplyTransport}
                className="flex items-center gap-1"
              >
                套用物流方式
              </Button>
              
              <Button 
                variant="destructive"
                onClick={bulkClearDimensions}
                className="flex items-center gap-1"
              >
                清空尺寸
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 產品列表 */}
      <div className="space-y-4">
        {products.map((product, index) => {
          const validation = validationStates[product.id];
          const metrics = calculateProductMetrics(product);
          
          return (
            <div key={product.id} className="relative border rounded-lg p-4 bg-white shadow-sm">
              {/* 選擇框 */}
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleProductSelection(product.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              {/* 產品名稱和輸入模式 */}
              <div className="ml-8 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    className="text-lg font-medium border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                  />
                  <select
                    value={product.inputMode}
                    onChange={(e) => updateProduct(index, 'inputMode', e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="perBox">單箱模式</option>
                    <option value="perUnit">單個模式</option>
                  </select>
                </div>
              </div>

              {/* 價格和數量輸入 */}
              {product.inputMode === 'perBox' ? (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <Label className="text-sm text-gray-600">單箱價格</Label>
                    <Input
                      type="number"
                      value={product.boxPrice || ''}
                      onChange={(e) => updateProduct(index, 'boxPrice', Number(e.target.value) || 0)}
                      placeholder="0"
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">單箱數量</Label>
                    <Input
                      type="number"
                      value={product.boxQuantity || ''}
                      onChange={(e) => updateProduct(index, 'boxQuantity', Number(e.target.value) || 0)}
                      placeholder="1"
                      min={1}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">訂購箱數</Label>
                    <Input
                      type="number"
                      value={product.orderBoxes || ''}
                      onChange={(e) => updateProduct(index, 'orderBoxes', Number(e.target.value) || 0)}
                      placeholder="0"
                      min={0}
                      step={1}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <Label className="text-sm text-gray-600">單個價格</Label>
                    <Input
                      type="number"
                      value={product.unitPrice || ''}
                      onChange={(e) => updateProduct(index, 'unitPrice', Number(e.target.value) || 0)}
                      placeholder="0"
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">總數量</Label>
                    <Input
                      type="number"
                      value={product.totalQuantity || ''}
                      onChange={(e) => updateProduct(index, 'totalQuantity', Number(e.target.value) || 0)}
                      placeholder="0"
                      min={0}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">單箱數量</Label>
                    <Input
                      type="number"
                      value={product.boxQuantity || ''}
                      onChange={(e) => updateProduct(index, 'boxQuantity', Number(e.target.value) || 0)}
                      placeholder="1"
                      min={1}
                      step={1}
                    />
                  </div>
                </div>
              )}

              {/* 尺寸和重量輸入 */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div>
                  <Label className="text-sm text-gray-600">長度 (m)</Label>
                  <Input
                    type="number"
                    value={product.lengthM || ''}
                    onChange={(e) => updateProduct(index, 'lengthM', Number(e.target.value) || 0)}
                    placeholder="0.1"
                    min={0}
                    step={0.001}
                    className={cn(
                      validation?.errors.some(e => e.field.includes('length')) && "border-red-500 focus-visible:ring-red-500",
                      validation?.warnings.some(w => w.field.includes('length')) && !validation?.errors.some(e => e.field.includes('length')) && "border-amber-400 focus-visible:ring-amber-400"
                    )}
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">寬度 (m)</Label>
                  <Input
                    type="number"
                    value={product.widthM || ''}
                    onChange={(e) => updateProduct(index, 'widthM', Number(e.target.value) || 0)}
                    placeholder="0.1"
                    min={0}
                    step={0.001}
                    className={cn(
                      validation?.errors.some(e => e.field.includes('width')) && "border-red-500 focus-visible:ring-red-500",
                      validation?.warnings.some(w => w.field.includes('width')) && !validation?.errors.some(e => e.field.includes('width')) && "border-amber-400 focus-visible:ring-amber-400"
                    )}
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">高度 (m)</Label>
                  <Input
                    type="number"
                    value={product.heightM || ''}
                    onChange={(e) => updateProduct(index, 'heightM', Number(e.target.value) || 0)}
                    placeholder="0.1"
                    min={0}
                    step={0.001}
                    className={cn(
                      validation?.errors.some(e => e.field.includes('height')) && "border-red-500 focus-visible:ring-red-500",
                      validation?.warnings.some(w => w.field.includes('height')) && !validation?.errors.some(e => e.field.includes('height')) && "border-amber-400 focus-visible:ring-amber-400"
                    )}
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">重量 (kg)</Label>
                  <Input
                    type="number"
                    value={product.weightKg || ''}
                    onChange={(e) => updateProduct(index, 'weightKg', Number(e.target.value) || 0)}
                    placeholder="1.0"
                    min={0}
                    step={0.1}
                    className={cn(
                      validation?.errors.some(e => e.field.includes('weight')) && "border-red-500 focus-visible:ring-red-500",
                      validation?.warnings.some(w => w.field.includes('weight')) && !validation?.errors.some(e => e.field.includes('weight')) && "border-amber-400 focus-visible:ring-amber-400"
                    )}
                  />
                </div>
              </div>

              {/* 驗證錯誤和警告 */}
              {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
                <div className="mb-4 space-y-2">
                  {validation.errors.map((error, i) => (
                    <div key={i} className="flex items-center gap-2 text-red-600 text-sm">
                      <span>⚠️</span>
                      <span>{error.message}</span>
                    </div>
                  ))}
                  {validation.warnings.map((warning, i) => (
                    <div key={i} className="flex items-center gap-2 text-amber-600 text-sm">
                      <span>⚠️</span>
                      <span>{warning.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 實時計算結果 */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-gray-500">CBM/箱</div>
                  <div className="font-medium">{metrics.cbmPerBox} m³</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">總 CBM</div>
                  <div className="font-medium">{metrics.totalCBM} m³</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">計費重</div>
                  <div className="font-medium">{metrics.chargeableWeight} kg</div>
                </div>
              </div>

              {/* 刪除按鈕 */}
              {products.length > 1 && (
                <button
                  onClick={() => deleteProduct(index)}
                  className="absolute top-2 right-2 w-6 h-6 text-xs rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center"
                  title="刪除商品"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 添加商品按鈕 */}
      <button
        onClick={addProduct}
        className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + {t.addProduct}
      </button>

      {/* 全選/取消全選 */}
      {products.length > 1 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.length === products.length}
            onChange={toggleAllSelection}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {selectedIds.length === products.length ? '取消全選' : '全選'}
          </span>
        </div>
      )}
    </div>
  );
}
