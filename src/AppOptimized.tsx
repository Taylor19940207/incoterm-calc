import React, { useCallback, useMemo, useState } from 'react';
import { Inputs, Product, Term } from './types';
import { calculateQuote, calculateDerivedValues, calculateAllProductQuotes } from './utils/calculations';
import { useLocalStorage } from './hooks/useLocalStorage';
import { dict } from './data/dictionary';
import InputField from './components/InputField';
import ProductManager from './components/ProductManager';
import ProductQuotes from './components/ProductQuotes';
import PerformanceMonitor from './components/PerformanceMonitor';
import { TestSuite } from './components/TestSuite';



const TERMS: Term[] = ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"];

// 默認輸入值
const defaultInputs: Inputs = {
  // 基本設置
  currency: "JPY",
  lang: "zh",
  
  // 商品管理（默認1個商品）
  products: [{
    id: "default-product",
    name: "商品1",
    inputMode: "perBox",
    boxPrice: 500,
    boxQuantity: 10,
    orderBoxes: 10,
    volume: 0.1,
    weight: 1.0
  }],
  
  // 貿易條件
  supplierTerm: "FOB",
  targetTerm: "CIF",
  
  // 輸入模式 - 改為預設整票總額
  inputMode: "total",
  
  // 定價設置
  pricingMode: "markup",
  markupPct: 15,
  marginPct: 12,
  bankFeePct: 0.6,
  rounding: 1,
  
  // 第二層：出口費用包含方式 - 預設包含
  exportCostInclusion: "include",
  
  // 第三層：分攤方式選擇 - 預設智能混合分攤
  allocationMethod: "hybrid",
  
  // 成本參數（重構為 CostItem）
  exportDocsClearance: { shipmentTotal: 20000, scaleWithQty: false },
  documentFees: { shipmentTotal: 5000, scaleWithQty: false },
  inlandToPort: { shipmentTotal: 15000, scaleWithQty: false },
  originPortFees: { shipmentTotal: 8000, scaleWithQty: false },
  mainFreight: { shipmentTotal: 100000, scaleWithQty: false },
  insuranceRatePct: 0.2,
  destPortFees: { shipmentTotal: 0, scaleWithQty: false },
  importBroker: { shipmentTotal: 0, scaleWithQty: false },
  lastMileDelivery: { shipmentTotal: 0, scaleWithQty: false },
  dutyPct: 0,
  vatPct: 0,
  misc: { shipmentTotal: 0, scaleWithQty: false },
  includeBrokerInTaxBase: false,
  exportDocsMode: "byShipment",
  numOfShipments: 1,
};

// 哪些欄位屬於「每單位費用」（可支援整票模式自動換算）
const perUnitFields = new Set([
  "inlandToPort", "originPortFees", "destPortFees", 
  "importBroker", "lastMileDelivery", "miscPerUnit"
]);

const IncotermQuoteCalculatorOptimized: React.FC = () => {
  const [inputs, setInputs] = useLocalStorage<Inputs>("incoterm-inputs", defaultInputs);
  const [showTestSuite, setShowTestSuite] = useState(false);
  const t = dict[inputs.lang];

  // 計算衍生值
  const derived = useMemo(() => 
    calculateDerivedValues(inputs.products), 
    [inputs.products]
  );

  // 計算報價（原有邏輯）
  const calc = useMemo(() => 
    calculateQuote({
      supplierTerm: inputs.supplierTerm,
      targetTerm: inputs.targetTerm,
      qty: derived.qty,
      unitPrice: derived.sumVal / derived.qty,
      inlandToPort: inputs.inlandToPort.shipmentTotal,
      exportDocsClearance: inputs.exportDocsClearance.shipmentTotal,
      documentFees: inputs.documentFees.shipmentTotal,  // 新增：文件費
      numOfShipments: inputs.numOfShipments,
      originPortFees: inputs.originPortFees.shipmentTotal,
      mainFreight: inputs.mainFreight.shipmentTotal,
      insuranceRatePct: inputs.insuranceRatePct,
      destPortFees: inputs.destPortFees.shipmentTotal,
      importBroker: inputs.importBroker.shipmentTotal,
      lastMileDelivery: inputs.lastMileDelivery.shipmentTotal,
      dutyPct: inputs.dutyPct,
      vatPct: inputs.vatPct,
      miscPerUnit: inputs.misc.shipmentTotal,
      bankFeePct: inputs.bankFeePct,
      pricingMode: inputs.pricingMode,
      markupPct: inputs.markupPct,
      marginPct: inputs.marginPct,
      rounding: inputs.rounding,
      exportDocsMode: inputs.exportDocsMode,
      exportCostInclusion: inputs.exportCostInclusion,
      allocationMethod: inputs.allocationMethod,
      includeBrokerInTaxBase: inputs.includeBrokerInTaxBase,
    }), 
    [inputs, derived.qty, derived.sumVal]
  );

  // 計算商品個別報價
  const productQuotes = useMemo(() => 
    calculateAllProductQuotes(inputs), 
    [inputs]
  );

  // 計算毛利率
  const profitMargin = useMemo(() => {
    const product = productQuotes.products[0];
    if (product?.suggestedQuote && product?.unitCost && product.suggestedQuote > 0) {
      const margin = (product.suggestedQuote - product.unitCost) / product.suggestedQuote;
      console.log('毛利率計算:', {
        suggestedQuote: product.suggestedQuote,
        unitCost: product.unitCost,
        supplierUnitPrice: product.supplierUnitPrice,
        margin: margin
      });
      return margin;
    }
    return 0;
  }, [productQuotes.products]);

  // 更新函數
  const update = useCallback((patch: Partial<Inputs>) => {
    setInputs(prev => ({ ...prev, ...patch }));
  }, [setInputs]);

  // 更新商品列表
  const updateProducts = useCallback((products: Product[]) => {
    update({ products });
  }, [update]);

  // 獲取顯示值
  const getDisplayValue = useCallback((name: keyof Inputs) => {
    const value = inputs[name];
    
    // 處理 CostItem 結構
    if (typeof value === 'object' && value !== null && 'shipmentTotal' in (value as any)) {
      const costItem = value as any;
      
      // 報關費特殊處理
      if (name === "exportDocsClearance" && inputs.exportDocsMode === "byShipment") {
        return String(costItem.shipmentTotal);
      }
      if (name === "exportDocsClearance" && inputs.exportDocsMode === "byCustomsEntries") {
        const per = costItem.shipmentTotal;
        return String(per * Math.max(0, inputs.numOfShipments || 0));
      }
      
      // 一般 CostItem 欄位
      if (inputs.inputMode === "total") {
        // 整票模式：顯示整票金額
        return String(costItem.shipmentTotal);
      } else {
        // 每單位模式：顯示每單位金額
        if (perUnitFields.has(name as string)) {
          return String(derived.qty > 0 ? costItem.shipmentTotal / derived.qty : 0);
        }
        return String(costItem.shipmentTotal);
      }
    }
    
    // 處理數字類型（向後兼容）
    if (typeof value === 'number') {
      if (name === "exportDocsClearance" && inputs.exportDocsMode === "byShipment") {
        return String(value);
      }
      if (name === "exportDocsClearance" && inputs.exportDocsMode === "byCustomsEntries") {
        const per = value;
        return String(per * Math.max(0, inputs.numOfShipments || 0));
      }
      
      if (inputs.inputMode === "total" && perUnitFields.has(name as string)) {
        return String(value * derived.qty);
      }
      return String(value);
    }
    
    return String(value || '');
  }, [inputs, derived.qty]);

  // 設置顯示值
  const setFromDisplay = useCallback((name: keyof Inputs, displayValue: string) => {
    const value = Number(displayValue) || 0;
    
    if (name === "exportDocsClearance" && inputs.exportDocsMode === "byShipment") {
      update({ [name]: { shipmentTotal: value, scaleWithQty: false } });
      return;
    }
    
    if (name === "exportDocsClearance" && inputs.exportDocsMode === "byCustomsEntries") {
      const per = derived.qty > 0 ? value / Math.max(0, inputs.numOfShipments || 0) : 0;
      update({ [name]: { shipmentTotal: per, scaleWithQty: false } });
      return;
    }
    
    if (inputs.inputMode === "total" && perUnitFields.has(name as string)) {
      const perUnit = derived.qty > 0 ? value / derived.qty : 0;
      update({ [name]: perUnit });
      return;
    }
    
    update({ [name]: value });
  }, [inputs, derived.qty, update]);

  // 處理輸入變更
  const handleInputChange = useCallback((name: string, value: string) => {
    setFromDisplay(name as keyof Inputs, value);
  }, [setFromDisplay]);

  // 重置
  const handleReset = useCallback(() => {
    if (window.confirm('確定要重置所有數據嗎？')) {
      setInputs(defaultInputs);
    }
  }, [setInputs]);

  // 責任對照
  const ownerForResp = useCallback((rkey: string): "factory" | "exporter" | "importer" => {
    if (rkey === "r_inland" || rkey === "r_origin") {
      if (inputs.supplierTerm === "EXW") return "exporter";
      return "factory";
    }
    if (rkey === "r_export") return "exporter";
    if (rkey === "r_freight") return calc.need_FOB_to_CFR ? "exporter" : "importer";
    if (rkey === "r_insurance") return calc.need_CFR_to_CIF ? "exporter" : "importer";
    if (rkey === "r_dest" || rkey === "r_lastmile") return calc.need_CIF_to_DAP ? "exporter" : "importer";
    if (rkey === "r_duty" || rkey === "r_vat") return "importer";
    return "importer";
  }, [inputs.supplierTerm, calc]);

  // 格式化函數
  const labelCurrency = useCallback((val: number) => 
    `${inputs.currency} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
    [inputs.currency]
  );

  const labelPct = useCallback((val: number) => 
    `${(val * 100).toFixed(2)}%`, 
    []
  );

  // 責任對照表數據
  const responsibilities = useMemo(() => [
    { key: "r_inland", label: "內陸拖運" },
    { key: "r_export", label: "出口文件" },
    { key: "r_origin", label: "起運港費用" },
    { key: "r_freight", label: "主運費" },
    { key: "r_insurance", label: "保險" },
    { key: "r_dest", label: "目的港費用" },
    { key: "r_import", label: "進口通關" },
    { key: "r_lastmile", label: "末端配送" },
    { key: "r_duty", label: "關稅" },
    { key: "r_vat", label: "VAT/GST" },
  ], []);



  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      <PerformanceMonitor name="IncotermCalculator" />
      
      {/* 測試組件 */}
      {showTestSuite && <TestSuite />}
      
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">{t.langLabel}：</span>
              <button 
                className={`rounded-full px-3 py-1 border ${inputs.lang === "zh" ? "bg-gray-900 text-white" : "bg-white"}`} 
                onClick={() => update({ lang: "zh" })}
              >
                {t.zh}
              </button>
              <button 
                className={`rounded-full px-3 py-1 border ${inputs.lang === "ja" ? "bg-gray-900 text-white" : "bg-white"}`} 
                onClick={() => update({ lang: "ja" })}
              >
                {t.ja}
              </button>
            </div>
          </div>
          
          {/* 測試組件切換按鈕 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTestSuite(!showTestSuite)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showTestSuite 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {showTestSuite ? '🧪 隱藏測試' : '🧪 顯示測試'}
            </button>
          </div>
          
          <button 
            className="rounded-2xl border px-3 py-2 text-sm hover:bg-white" 
            onClick={handleReset}
          >
            {t.reset}
          </button>
        </header>


        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 基本參數 */}
          <section className="lg:col-span-1 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">基本參數</h2>

            {/* 貨幣選擇 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">{t.currency}</label>
                              <select
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  value={inputs.currency}
                  onChange={(e) => update({ currency: e.target.value as "JPY" | "USD" | "CNY" })}
                >
                  <option value="JPY">JPY</option>
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                </select>
            </div>

            {/* 商品管理 */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">商品管理</label>
              <ProductManager
                products={inputs.products}
                currency={inputs.currency}
                onUpdate={updateProducts}
                t={t}
              />
            </div>

            {/* 貿易條件 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">{t.supplierTerm}</label>
                <select 
                  className="w-full rounded-2xl border px-3 py-2" 
                  value={inputs.supplierTerm} 
                  onChange={(e) => update({ supplierTerm: e.target.value as Term })}
                >
                  {TERMS.map((term) => (<option key={term} value={term}>{term}</option>))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">{t.targetTerm}</label>
                <select 
                  className="w-full rounded-2xl border px-3 py-2" 
                  value={inputs.targetTerm} 
                  onChange={(e) => update({ targetTerm: e.target.value as Term })}
                >
                  {TERMS.map((term) => (<option key={term} value={term}>{term}</option>))}
                </select>
              </div>
            </div>

            {/* 輸入模式 */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-gray-600">{t.inputMode}：</span>
              <div className="flex items-center gap-2">
                <button 
                  className={`rounded-full px-3 py-1 text-sm border ${inputs.inputMode === "perUnit" ? "bg-gray-900 text-white" : "bg-white"}`} 
                  onClick={() => update({ inputMode: "perUnit" })}
                >
                  {t.perUnit}
                </button>
                <button 
                  className={`rounded-full px-3 py-1 text-sm border ${inputs.inputMode === "total" ? "bg-gray-900 text-white" : "bg-white"}`} 
                  onClick={() => update({ inputMode: "total" })}
                >
                  {t.total}
                </button>
              </div>
            </div>

            {/* 第一層：報價模式 */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
                {t["報價模式（決定利潤計算方式）"]}
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">{t.pricingMode}</label>
                  <select 
                    className="w-full rounded-2xl border px-3 py-2" 
                    value={inputs.pricingMode} 
                    onChange={(e) => update({ pricingMode: e.target.value as any })}
                  >
                    <option value="markup">{t.markup}</option>
                    <option value="margin">{t.margin}</option>
                  </select>
                </div>
                
                <InputField
                  name="bankFeePct"
                  label={t.bankFee}
                  value={getDisplayValue("bankFeePct")}
                  onChange={handleInputChange}
                  unit="%"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  name="markupPct"
                  label={t.markup}
                  value={getDisplayValue("markupPct")}
                  onChange={handleInputChange}
                  unit="%"
                  disabled={inputs.pricingMode !== "markup"}
                />
                
                <InputField
                  name="marginPct"
                  label={t.margin}
                  value={getDisplayValue("marginPct")}
                  onChange={handleInputChange}
                  unit="%"
                  disabled={inputs.pricingMode !== "margin"}
                />
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                {inputs.pricingMode === "markup" 
                  ? t["報價 = 單位成本 × (1 + 加價率%)"]
                  : t["報價 = 單位成本 ÷ (1 - 毛利率%)"]
                }
              </div>
            </div>

            {/* 第二層：出口費用包含方式 */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
                {t["出口費用包含方式（決定單位成本定義）"]}
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="exportCostInclusion"
                    value="exclude"
                    checked={inputs.exportCostInclusion === 'exclude'}
                    onChange={() => update({ exportCostInclusion: 'exclude' })}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{t["不含出口費用"]}</span>
                    <div className="text-xs text-gray-500">{t["單位成本 = 供應商單價"]}</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="exportCostInclusion"
                    value="include"
                    checked={inputs.exportCostInclusion === 'include'}
                    onChange={() => update({ exportCostInclusion: 'include' })}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{t["含出口費用"]}</span>
                    <div className="text-xs text-gray-500">{t["單位成本 = 供應商單價 + 分攤的出口成本"]}</div>
                  </div>
                </label>
              </div>
            </div>

            {/* 第三層：分攤方式選擇（僅在包含出口費用時顯示） */}
            {inputs.exportCostInclusion === 'include' && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
                  {t["分攤方式選擇（多產品混裝時用）"]}
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="allocationMethod"
                      value="quantity"
                      checked={inputs.allocationMethod === 'quantity'}
                      onChange={() => update({ allocationMethod: 'quantity' })}
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{t["數量比例法"]}</span>
                      <div className="text-xs text-gray-500">{t["適合：產品體積/重量差不多"]}</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="allocationMethod"
                      value="volume"
                      checked={inputs.allocationMethod === 'volume'}
                      onChange={() => update({ allocationMethod: 'volume' })}
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{t["體積/重量比例法"]}</span>
                      <div className="text-xs text-gray-500">{t["適合：產品大小差異大"]}</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="allocationMethod"
                      value="value"
                      checked={inputs.allocationMethod === 'value'}
                      onChange={() => update({ allocationMethod: 'value' })}
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{t["貨值比例法"]}</span>
                      <div className="text-xs text-gray-500">{t["適合：高價+低價混裝"]}</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="allocationMethod"
                      value="hybrid"
                      checked={inputs.allocationMethod === 'hybrid'}
                      onChange={() => update({ allocationMethod: 'hybrid' })}
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                                         <div>
                       <span className="text-sm font-medium text-gray-700">{t["智能混合法"]}</span>
                       <div className="text-xs text-gray-500">{t["文件按貨值，物流按體積"]}</div>
                     </div>
                   </label>
                 </div>
               </div>
             )}

            {/* 四捨五入設置 */}
            <div className="mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">{t.rounding}</label>
                <select
                  className="w-full rounded-2xl border px-3 py-2"
                  value={String(inputs.rounding)}
                  onChange={(e) => update({ rounding: Number(e.target.value) })}
                >
                  <option value="0.1">0.1</option>
                  <option value="1">1</option>
                  <option value="10">10</option>
                </select>
              </div>
            </div>
          </section>

          {/* 成本明細輸入 */}
          <section className="lg:col-span-2 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">
              {inputs.inputMode === "perUnit" ? t.costParamsUnit : t.costParamsTotal}
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              {t.hintPath(inputs.supplierTerm, inputs.targetTerm)}
            </p>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <InputField
                name="inlandToPort"
                label={t.inlandToPort}
                value={getDisplayValue("inlandToPort")}
                onChange={handleInputChange}
                unit={inputs.currency}
                disabled={inputs.supplierTerm !== "EXW"}
                note={inputs.supplierTerm !== "EXW" ? t.notApplicable : t.includeNote}
              />
              
              <InputField
                name="exportDocsClearance"
                label={t.exportDocsClearance}
                value={getDisplayValue("exportDocsClearance")}
                onChange={handleInputChange}
                unit={inputs.currency}
              />
              
              <InputField
                name="documentFees"
                label={t.documentFees}
                value={getDisplayValue("documentFees")}
                onChange={handleInputChange}
                unit={inputs.currency}
              />
              
              <InputField
                name="originPortFees"
                label={t.originPortFees}
                value={getDisplayValue("originPortFees")}
                onChange={handleInputChange}
                unit={inputs.currency}
                disabled={inputs.supplierTerm !== "EXW"}
                note={inputs.supplierTerm !== "EXW" ? t.notApplicable : t.includeNote}
              />
              
              <InputField
                name="mainFreight"
                label={t.mainFreight}
                value={getDisplayValue("mainFreight")}
                onChange={handleInputChange}
                unit={inputs.currency}
                disabled={calc.need_FOB_to_CFR === false}
                note={calc.need_FOB_to_CFR === false ? t.notApplicable : t.includeNote}
              />
              
              <InputField
                name="insuranceRatePct"
                label={t.insuranceRatePct}
                value={getDisplayValue("insuranceRatePct")}
                onChange={handleInputChange}
                unit="%"
                disabled={calc.need_CFR_to_CIF === false}
                note={calc.need_CFR_to_CIF === false ? t.notApplicable : t.includeNote}
              />
              
              <InputField
                name="destPortFees"
                label={t.destPortFees}
                value={getDisplayValue("destPortFees")}
                onChange={handleInputChange}
                unit={inputs.currency}
                disabled={calc.need_CIF_to_DAP === false}
                note={calc.need_CIF_to_DAP === false ? t.notApplicable : t.includeNote}
              />
              
              <InputField
                name="importBroker"
                label={t.importBroker}
                value={getDisplayValue("importBroker")}
                onChange={handleInputChange}
                unit={inputs.currency}
                disabled={calc.need_CIF_to_DAP === false}
                note={calc.need_CIF_to_DAP === false ? t.notApplicable : t.includeNote}
              />
              
              <InputField
                name="lastMileDelivery"
                label={t.lastMileDelivery}
                value={getDisplayValue("lastMileDelivery")}
                onChange={handleInputChange}
                unit={inputs.currency}
                disabled={calc.need_CIF_to_DAP === false}
                note={calc.need_CIF_to_DAP === false ? t.notApplicable : t.includeNote}
              />
              
              <InputField
                name="dutyPct"
                label={t.dutyPct}
                value={getDisplayValue("dutyPct")}
                onChange={handleInputChange}
                unit="%"
                disabled={inputs.targetTerm !== "DDP"}
                note={inputs.targetTerm !== "DDP" ? t.notApplicable : t.includeNote}
              />
              
              <InputField
                name="vatPct"
                label={t.vatPct}
                value={getDisplayValue("vatPct")}
                onChange={handleInputChange}
                unit="%"
                disabled={inputs.targetTerm !== "DDP"}
                note={inputs.targetTerm !== "DDP" ? t.notApplicable : t.includeNote}
              />
              
                              <InputField
                  name="misc"
                  label={t.miscPerUnit}
                  value={getDisplayValue("misc")}
                  onChange={handleInputChange}
                  unit={inputs.currency}
                />
            </div>

            {/* 稅基設置 */}
            <div className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="includeBrokerInTaxBase"
                checked={inputs.includeBrokerInTaxBase}
                onChange={(e) => update({ includeBrokerInTaxBase: e.target.checked })}
                className="rounded border px-3 py-2"
              />
              <label htmlFor="includeBrokerInTaxBase" className="text-sm text-gray-600">
                {t.includeBrokerInTaxBase}
              </label>
            </div>

            {/* 商品個別報價 */}
            <div className="mt-6">
              <ProductQuotes
                products={productQuotes.products}
                currency={inputs.currency}
                t={t}
                costBreakdown={productQuotes.costBreakdown}
              />
            </div>
          </section>

        </div>





        {/* 責任對照表 */}
        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">{t.respTitle}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left">{t.breakdownCol1}</th>
                  <th className="px-3 py-2 text-center">{t.factory}</th>
                  <th className="px-3 py-2 text-center">{t.exporter}</th>
                  <th className="px-3 py-2 text-center">{t.importer}</th>
                </tr>
              </thead>
              <tbody>
                {responsibilities.map((r) => {
                  const owner = ownerForResp(r.key);
                  return (
                    <tr key={r.key} className="border-b">
                      <td className="px-3 py-2">{r.label}</td>
                      <td className={`px-3 py-2 ${owner === "factory" ? "text-green-700 font-semibold" : "text-gray-400"}`}>
                        {owner === "factory" ? "✓" : ""}
                      </td>
                      <td className={`px-3 py-2 ${owner === "exporter" ? "text-green-700 font-semibold" : "text-gray-400"}`}>
                        {owner === "exporter" ? "✓" : ""}
                      </td>
                      <td className={`px-3 py-2 ${owner === "importer" ? "text-green-700 font-semibold" : "text-gray-400"}`}>
                        {owner === "importer" ? "✓" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 計算結果 */}
        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">{t.results}</h2>
          
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">{t.unitQuote}</div>
              <div className="text-2xl font-bold">{labelCurrency(productQuotes.products[0]?.suggestedQuote || 0)}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">{t.costPerUnit}</div>
              <div className="text-2xl font-bold">{labelCurrency(productQuotes.products[0]?.unitCost || 0)}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">{t.totalQuote}</div>
              <div className="text-2xl font-bold">{labelCurrency(productQuotes.products.reduce((sum, p) => sum + p.totalProductValue, 0))}</div>
            </div>
            
                          <div className="text-center">
                <div className="text-sm text-gray-500">{t.marginAfterBank}</div>
                              <div className="text-2xl font-bold">{labelPct(profitMargin)}</div>
                <div className="mt-1 text-xs text-gray-500">{t.bankRateLabel}：{(inputs.bankFeePct || 0).toFixed(2)}%</div>
              </div>
          </div>

          {/* 成本明細表 */}
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left">{t.breakdownCol1 || "項目"}</th>
                  <th className="px-3 py-2 text-right">{t.amount || "金額"}</th>
                  <th className="px-3 py-2 text-left">{t.note || "說明"}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-3 py-2">{t.supplierValue}</td>
                  <td className="px-3 py-2 text-right">{labelCurrency(derived.sumVal)}</td>
                  <td className="px-3 py-2">{t.startValue}</td>
                </tr>
                {productQuotes.costBreakdown.logisticsCosts.inlandToPort > 0 && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t.segEXWFOB}</td>
                    <td className="px-3 py-2 text-right">{labelCurrency(productQuotes.costBreakdown.logisticsCosts.inlandToPort)}</td>
                    <td className="px-3 py-2">{t["工廠到港口"]}</td>
                  </tr>
                )}
                {productQuotes.costBreakdown.fixedCosts.exportDocsClearance > 0 && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t["出口文件"]}</td>
                    <td className="px-3 py-2 text-right">{labelCurrency(productQuotes.costBreakdown.fixedCosts.exportDocsClearance)}</td>
                    <td className="px-3 py-2">{t["報關文件費用"]}</td>
                  </tr>
                )}
                {productQuotes.costBreakdown.fixedCosts.originPortFees > 0 && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t.segEXWFOB}</td>
                    <td className="px-3 py-2 text-right">{labelCurrency(productQuotes.costBreakdown.fixedCosts.originPortFees)}</td>
                    <td className="px-3 py-2">{t["港口雜費"]}</td>
                  </tr>
                )}
                {productQuotes.costBreakdown.logisticsCosts.mainFreight > 0 && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t.segFOBCFR}</td>
                    <td className="px-3 py-2 text-right">{labelCurrency(productQuotes.costBreakdown.logisticsCosts.mainFreight)}</td>
                    <td className="px-3 py-2">{t["海運/空運費用"]}</td>
                  </tr>
                )}
                {productQuotes.costBreakdown.logisticsCosts.insurance > 0 && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t.segCFRCIF}</td>
                    <td className="px-3 py-2 text-right">{labelCurrency(productQuotes.costBreakdown.logisticsCosts.insurance)}</td>
                    <td className="px-3 py-2">{t["貨物保險"]}</td>
                  </tr>
                )}
                {productQuotes.costBreakdown.fixedCosts.destPortFees > 0 && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t.segCIFDAP}</td>
                    <td className="px-3 py-2 text-right">{labelCurrency(productQuotes.costBreakdown.fixedCosts.destPortFees)}</td>
                    <td className="px-3 py-2">{t["目的港雜費"]}</td>
                  </tr>
                )}
                {productQuotes.costBreakdown.fixedCosts.importBroker > 0 && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t["進口代理"]}</td>
                    <td className="px-3 py-2 text-right">{labelCurrency(productQuotes.costBreakdown.fixedCosts.importBroker)}</td>
                    <td className="px-3 py-2">{t["進口代理費"]}</td>
                  </tr>
                )}
                {productQuotes.costBreakdown.fixedCosts.lastMileDelivery > 0 && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t["末端配送"]}</td>
                    <td className="px-3 py-2 text-right">{labelCurrency(productQuotes.costBreakdown.fixedCosts.lastMileDelivery)}</td>
                    <td className="px-3 py-2">{t["最後一哩配送"]}</td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="px-3 py-2">{t["雜項費用"]}</td>
                  <td className="px-3 py-2 text-right">{labelCurrency(productQuotes.costBreakdown.fixedCosts.misc)}</td>
                  <td className="px-3 py-2">{t["其他雜費"]}</td>
                </tr>
                <tr className="border-b font-semibold">
                  <td className="px-3 py-2">{t.totalCost}</td>
                  <td className="px-3 py-2 text-right">{labelCurrency(productQuotes.costBreakdown.totalCosts)}</td>
                  <td className="px-3 py-2">{t["所有成本項目總計"]}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IncotermQuoteCalculatorOptimized;
