import React, { memo } from 'react';
import InputField from './InputField';

interface Product {
  qty: number;
  price: number;
}

interface ProductItemProps {
  index: number;
  product: Product;
  currency: string;
  onUpdate: (index: number, product: Product) => void;
  t: any; // 改為 any 類型以匹配字典對象
}

const ProductItem = memo<ProductItemProps>(({
  index,
  product,
  currency,
  onUpdate,
  t
}) => {
  const handleQtyChange = (name: string, value: string) => {
    const qty = Math.max(0, Math.floor(Number(value) || 0));
    onUpdate(index, { ...product, qty });
  };

  const handlePriceChange = (name: string, value: string) => {
    const price = Math.max(0, Number(value) || 0);
    onUpdate(index, { ...product, price });
  };

  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 text-sm font-medium">{t.product(index + 1)}</div>
      <div className="grid grid-cols-2 gap-3">
        <InputField
          name="qty"
          label={t.qty}
          value={String(product.qty)}
          onChange={handleQtyChange}
          step={1}
          min={0}
          type="number"
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">{t.supplierUnitPrice}</label>
          <div className="flex">
            <input
              type="number"
              min={0}
              step={0.01}
              className="min-w-0 flex-1 rounded-l-2xl border px-3 py-2"
              value={product.price}
              onChange={(e) => handlePriceChange('price', e.target.value)}
            />
            <span className="shrink-0 rounded-r-2xl border border-l-0 bg-gray-100 px-3 py-2 text-sm text-gray-600">
              {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductItem.displayName = 'ProductItem';

export default ProductItem;
