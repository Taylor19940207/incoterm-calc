import React from 'react';

interface ProductQuote {
  id: string;
  name: string;
  qty: number;
  supplierUnitPrice: number;
  unitCost: number;
  suggestedQuote: number;
  unitProfit: number;
  totalProductValue: number;
}

interface CostBreakdown {
  fixedCosts: {
    exportDocsClearance: number;
    documentFees: number;
    originPortFees: number;
    destPortFees: number;
    importBroker: number;
    lastMileDelivery: number;
    misc: number;
  };
  logisticsCosts: {
    inlandToPort: number;
    mainFreight: number;
    insurance: number;
  };
  totalFixedCosts: number;
  totalLogisticsCosts: number;
  // 統一的三個指標欄位
  totalGoodsValue: number;      // 貨值總額
  totalExportCosts: number;     // 出口費用總額（不含貨值）
  shipmentCostInclGoods: number; // 含貨值的整票總成本
  totalCosts: number;           // 保持向後兼容
}

interface ProductQuotesProps {
  products: ProductQuote[];
  currency: string;
  t: any;
  costBreakdown?: CostBreakdown;
}

const ProductQuotes: React.FC<ProductQuotesProps> = ({ products, currency, t, costBreakdown }) => {
  const formatCurrency = (value: number) => 
    `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatNumber = (value: number) => 
    value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t["商品個別報價"]}</h2>
      
      {/* 商品報價卡片 */}
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="rounded-2xl border p-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <div className="text-sm text-gray-600">
                {t["數量"]}：{formatNumber(product.qty)} | {t["供應商單價"]}：{formatCurrency(product.supplierUnitPrice)}
              </div>
            </div>
            
            {/* 計算結果卡片 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">{t["單位成本"]}</div>
                <div className="text-lg font-bold">{formatCurrency(product.unitCost)}</div>
              </div>
              
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">{t["建議報價"]}</div>
                <div className="text-lg font-bold text-blue-600">{formatCurrency(product.suggestedQuote)}</div>
              </div>
              
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">{t["單位利潤"]}</div>
                <div className="text-lg font-bold text-green-600">{formatCurrency(product.unitProfit)}</div>
              </div>
              
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">{t["商品總價"]}</div>
                <div className="text-lg font-bold">{formatCurrency(product.totalProductValue)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 總計 */}
      {products.length >= 1 && (
        <div className="rounded-2xl border p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">{t["總計"]}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">{t["總數量"]}</div>
              <div className="text-xl font-bold">{formatNumber(products.reduce((sum, p) => sum + p.qty, 0))}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">{t["總利潤"]}</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(products.reduce((sum, p) => sum + p.unitProfit * p.qty, 0))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">{t["總報價"]}</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(products.reduce((sum, p) => sum + p.totalProductValue, 0))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成本明細表 */}
      {costBreakdown && (
        <div className="rounded-2xl border p-4">
          <h3 className="text-lg font-semibold mb-3">{t["成本明細 (整票)"]}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2">{t["成本項目"]}</th>
                  <th className="px-3 py-2 text-left">{t["金額"]}</th>
                  <th className="px-3 py-2">{t["說明"]}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-3 py-2">{t["內陸拖運"]}</td>
                  <td className="px-3 py-2 text-left">{formatCurrency(costBreakdown.logisticsCosts.inlandToPort)}</td>
                  <td className="px-3 py-2 text-gray-600">{t["工廠到港口"]}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-2">{t["出口文件"]}</td>
                  <td className="px-3 py-2 text-left">{formatCurrency(costBreakdown.fixedCosts.exportDocsClearance)}</td>
                  <td className="px-3 py-2 text-gray-600">{t["報關文件費用"]}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-2">{t["起運港費用"]}</td>
                  <td className="px-3 py-2 text-left">{formatCurrency(costBreakdown.fixedCosts.originPortFees)}</td>
                  <td className="px-3 py-2 text-gray-600">{t["港口雜費"]}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-2">{t["主運費"]}</td>
                  <td className="px-3 py-2 text-left">{formatCurrency(costBreakdown.logisticsCosts.mainFreight)}</td>
                  <td className="px-3 py-2 text-gray-600">{t["海運/空運費用"]}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-2">{t["保險費"]}</td>
                  <td className="px-3 py-2 text-left">{formatCurrency(costBreakdown.logisticsCosts.insurance)}</td>
                  <td className="px-3 py-2 text-gray-600">{t["貨物保險"]}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-2">{t["目的港費用"]}</td>
                  <td className="px-3 py-2 text-left">{formatCurrency(costBreakdown.fixedCosts.destPortFees)}</td>
                  <td className="px-3 py-2 text-gray-600">{t["目的港雜費"]}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-2">{t["進口代理"]}</td>
                  <td className="px-3 py-2 text-left">{formatCurrency(costBreakdown.fixedCosts.importBroker)}</td>
                  <td className="px-3 py-2 text-gray-600">{t["進口代理費"]}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-2">{t["末端配送"]}</td>
                  <td className="px-3 py-2 text-left">{formatCurrency(costBreakdown.fixedCosts.lastMileDelivery)}</td>
                  <td className="px-3 py-2 text-gray-600">{t["最後一哩配送"]}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-2">{t["雜項費用"]}</td>
                  <td className="px-3 py-2 text-left">{formatCurrency(costBreakdown.fixedCosts.misc)}</td>
                  <td className="px-3 py-2 text-gray-600">{t["其他雜費"]}</td>
                </tr>
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-3 py-2">{t["總成本"]}</td>
                  <td className="px-3 py-2 text-right"></td>
                  <td className="px-3 py-2 text-right">{formatCurrency(costBreakdown.totalCosts)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductQuotes;
