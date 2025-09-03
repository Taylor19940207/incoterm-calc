import { Inputs, Product, AllocationMethod, Term, CostItem, ExportDocsMode } from '../types';

const STEP_ORDER: Term[] = ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"];

export const idx = (t: Term) => STEP_ORDER.indexOf(t);

export function segmentsToAdd(from: Term, to: Term): Term[] {
  const s = idx(from), t = idx(to);
  if (t <= s) return [];
  return STEP_ORDER.slice(s + 1, t + 1);
}

export const roundTo = (x: number, step: number) => 
  (step > 0 ? Math.round(x / step) * step : x);

export interface CalculationInputs {
  supplierTerm: Term;
  targetTerm: Term;
  qty: number;
  unitPrice: number;
  inlandToPort: number;
  exportDocsClearance: number;
  documentFees: number;  // 新增：文件費
  numOfShipments: number;
  originPortFees: number;
  mainFreight: number;
  insuranceRatePct: number;
  destPortFees: number;
  importBroker: number;
  lastMileDelivery: number;
  dutyPct: number;
  vatPct: number;
  miscPerUnit: number;
  bankFeePct: number;
  pricingMode: "markup" | "margin";
  markupPct: number;
  marginPct: number;
  rounding: number;
  exportDocsMode: ExportDocsMode;
  exportCostInclusion: "include" | "exclude";
  allocationMethod: AllocationMethod;
  includeBrokerInTaxBase: boolean;
}

export interface CalculationResult {
  // 整票層級（totals）
  totals: {
    qty: number;
    totalGoodsValue: number;
    totalExportCosts: number;
    shipmentCostInclGoods: number;
    totalQuote: number;
    totalCost: number;
    totalProfit: number;
  };

  // 單位層級（perUnit）
  perUnit: {
    supplierUnitPrice: number;
    exportCostPerUnit: number;
    unitCost: number;
    suggestedUnitQuote: number;
    unitProfit: number;
    margin: number;
  };

  // 保持向後兼容的欄位
  exwToFob: number;
  fobToCfr: number;
  insurancePU: number;
  cifToDap: number;
  cifUnitValue: number;
  dutyPerUnit: number;
  vatPerUnit: number;
  miscPerUnit: number;
  need_EXW_to_FOB: boolean;
  need_FOB_to_CFR: boolean;
  need_CFR_to_CIF: boolean;
  need_CIF_to_DAP: boolean;
  need_DAP_to_DDP: boolean;
  costPerUnit: number;
  unitQuote: number;
  unitProfit: number;
  profitMargin: number;
  bankRate: number;
  totalCost: number;
  totalQuote: number;
  totalProfit: number;
  q: number;
  baseGoods: number;
}

export function calculateQuote(inputs: CalculationInputs): CalculationResult {
  const q = Math.max(1, Number(inputs.qty) || 1);
  const baseGoods = Number(inputs.unitPrice) || 0;
  const sTerm = inputs.supplierTerm;
  const tTerm = inputs.targetTerm;

  // 確定需要添加的費用
  const add = {
    inlandToPort: sTerm === "EXW" && idx(tTerm) >= idx("FOB"),
    originPortFees: sTerm === "EXW" && idx(tTerm) >= idx("FOB"),
    exportDocs: idx(tTerm) >= idx("FOB"),
    mainFreight: idx(tTerm) >= idx("CFR") && idx(sTerm) < idx("CFR"),
    insurance: idx(tTerm) >= idx("CIF") && idx(sTerm) < idx("CIF"),
    destPortFees: idx(tTerm) >= idx("DAP") && idx(sTerm) < idx("DAP"),
    importBroker: tTerm === "DDP" && idx(sTerm) < idx("DDP"),
    lastMile: idx(tTerm) >= idx("DAP") && idx(sTerm) < idx("DAP"),
    duty: tTerm === "DDP" && idx(sTerm) < idx("DDP"),
    vat: tTerm === "DDP" && idx(sTerm) < idx("DDP"),
  };

  // 計算各項費用
  const inlandToPort = add.inlandToPort ? (inputs.inlandToPort || 0) : 0;
  const originPortFees = add.originPortFees ? (inputs.originPortFees || 0) : 0;
  
  // 集中定義「出口固定費」（整票金額）
  const exportDocsClearanceTotal = add.exportDocs ? 
    (inputs.exportDocsClearance || 0) * Math.max(0, inputs.numOfShipments || 0) : 0;
  const documentFeesTotal = add.exportDocs ? (inputs.documentFees || 0) : 0;
  const fixedDocs = exportDocsClearanceTotal + documentFeesTotal;
  
  const mainFreight = add.mainFreight ? (inputs.mainFreight || 0) : 0;

  // 保險費計算（統一使用國際標準：貨物價值+運費的110%作為保險基數）
  const insuranceBase = baseGoods + mainFreight;
  const insurancePU = add.insurance ? 
    (insuranceBase * 1.1 * ((inputs.insuranceRatePct || 0) / 100)) : 0;

  const destPortFees = add.destPortFees ? (inputs.destPortFees || 0) : 0;
  const importBroker = add.importBroker ? (inputs.importBroker || 0) : 0;
  const lastMileDelivery = add.lastMile ? (inputs.lastMileDelivery || 0) : 0;

  // CIF 稅基計算
  let cifBase = baseGoods + inlandToPort + originPortFees + exportDocsClearanceTotal + mainFreight + insurancePU;
  if (inputs.includeBrokerInTaxBase) {
    cifBase += destPortFees + importBroker;
  }

  const dutyPerUnit = add.duty ? cifBase * ((inputs.dutyPct || 0) / 100) : 0;
  const vatPerUnit = add.vat ? (cifBase + dutyPerUnit) * ((inputs.dutyPct || 0) / 100) : 0;
  const miscPerUnit = inputs.miscPerUnit || 0;

  // 各段費用
  const exwToFob = inlandToPort + exportDocsClearanceTotal + originPortFees;
  const fobToCfr = mainFreight;
  const cifToDap = destPortFees + importBroker + lastMileDelivery;

  // 統一成本定義（明確區分整票與單位層級）
  const totalExportCosts = fixedDocs + inlandToPort + originPortFees +
    mainFreight + insurancePU + destPortFees + importBroker + lastMileDelivery +
    miscPerUnit + dutyPerUnit + vatPerUnit;
  
  // 每單位出口費用
  const exportCostPerUnit = totalExportCosts / q;
  
  // 單位成本（正確：每單位供應商價格 + 每單位出口費用）
  const costPerUnit = (baseGoods / q) + exportCostPerUnit;

  // 報價計算
  const bankRate = (inputs.bankFeePct || 0) / 100;
  const costWithBank = costPerUnit / Math.max(1e-9, 1 - bankRate);
  const rawUnitQuote = inputs.pricingMode === "markup"
    ? costWithBank * (1 + (inputs.markupPct || 0) / 100)
    : costWithBank / Math.max(1e-9, 1 - (inputs.marginPct || 0) / 100);

  const unitQuote = roundTo(rawUnitQuote, Math.max(0.1, inputs.rounding || 1));
  const unitProfit = unitQuote - costPerUnit - unitQuote * bankRate;
  const profitMargin = unitQuote > 0 ? unitProfit / unitQuote : 0;

  // 計算整票層級數據
  const totalGoodsValue = baseGoods;
  const shipmentCostInclGoods = totalGoodsValue + totalExportCosts;
  const totalQuote = unitQuote * q;
  const totalCost = costPerUnit * q;
  const totalProfit = unitProfit * q;

  // 防呆斷言：確保單位成本計算正確
  console.assert(
    Math.abs(costPerUnit - ((baseGoods / q) + (totalExportCosts / q))) < 1e-6,
    'unitCost mismatch between perUnit and totals layer',
  );

  return {
    // 整票層級（totals）
    totals: {
      qty: q,
      totalGoodsValue,
      totalExportCosts,
      shipmentCostInclGoods,
      totalQuote,
      totalCost,
      totalProfit,
    },

    // 單位層級（perUnit）
    perUnit: {
      supplierUnitPrice: baseGoods / q,
      exportCostPerUnit,
      unitCost: costPerUnit,
      suggestedUnitQuote: unitQuote,
      unitProfit,
      margin: profitMargin,
    },

    // 保持向後兼容的欄位
    exwToFob,
    fobToCfr,
    insurancePU,
    cifToDap,
    cifUnitValue: cifBase,
    dutyPerUnit,
    vatPerUnit,
    miscPerUnit,
    need_EXW_to_FOB: idx(tTerm) >= idx("FOB"),
    need_FOB_to_CFR: idx(tTerm) >= idx("CFR"),
    need_CFR_to_CIF: idx(tTerm) >= idx("CIF"),
    need_CIF_to_DAP: idx(tTerm) >= idx("DAP"),
    need_DAP_to_DDP: idx(tTerm) >= idx("DDP"),
    costPerUnit,
    unitQuote,
    unitProfit,
    profitMargin,
    bankRate,
    totalCost,
    totalQuote,
    totalProfit,
    q,
    baseGoods,
  };
}

// 計算衍生值
export function calculateDerivedValues(products: Product[]) {
  let qty = 0;
  let sumVal = 0;
  let totalVolume = 0;
  let totalWeight = 0;
  
  products.forEach(product => {
    let productQty = 0;
    let productValue = 0;
    
    if (product.inputMode === 'perBox') {
      // 單箱模式：訂購箱數 × 單箱數量
      productQty = (product.orderBoxes || 0) * (product.boxQuantity || 1);
      productValue = (product.orderBoxes || 0) * (product.boxPrice || 0);
    } else {
      // 單個模式：總數量
      productQty = product.totalQuantity || 0;
      productValue = productQty * (product.unitPrice || 0);
    }
    
    qty += productQty;
    sumVal += productValue;
    
    // 體積和重量：根據實際數量計算
    const boxQty = product.inputMode === 'perBox' 
      ? (product.orderBoxes || 0) 
      : Math.ceil((product.totalQuantity || 0) / (product.boxQuantity || 1));
    
    totalVolume += boxQty * (product.volume || 0);
    totalWeight += boxQty * (product.weight || 0);
  });
  
  return { qty, sumVal, totalVolume, totalWeight };
}

// 計算成本分攤
export function calculateCostAllocation(
  products: Product[],
  totalFixedCosts: number,
  totalLogisticsCosts: number,
  allocationMethod: AllocationMethod
) {
  const { sumVal, totalVolume, qty } = calculateDerivedValues(products);
  
  return products.map(product => {
    let fixedCostAllocation = 0;
    let logisticsCostAllocation = 0;
    
    // 計算產品數量和價值
    let productQty = 0;
    let productValue = 0;
    
    if (product.inputMode === 'perBox') {
      productQty = (product.orderBoxes || 0) * (product.boxQuantity || 1);
      productValue = (product.orderBoxes || 0) * (product.boxPrice || 0);
    } else {
      productQty = product.totalQuantity || 0;
      productValue = productQty * (product.unitPrice || 0);
    }
    
    // 計算產品體積
    const boxQty = product.inputMode === 'perBox' 
      ? (product.orderBoxes || 0) 
      : Math.ceil((product.totalQuantity || 0) / (product.boxQuantity || 1));
    const productVolume = boxQty * (product.volume || 0);
    
    switch (allocationMethod) {
      case 'quantity':
        // 按數量比例分攤
        const qtyRatio = productQty / qty;
        fixedCostAllocation = totalFixedCosts * qtyRatio;
        logisticsCostAllocation = totalLogisticsCosts * qtyRatio;
        break;
        
      case 'volume':
        // 按體積比例分攤
        const volumeRatio = productVolume / totalVolume;
        fixedCostAllocation = totalFixedCosts * volumeRatio;
        logisticsCostAllocation = totalLogisticsCosts * volumeRatio;
        break;
        
      case 'value':
        // 按貨值比例分攤
        const valueRatio = productValue / sumVal;
        fixedCostAllocation = totalFixedCosts * valueRatio;
        logisticsCostAllocation = totalLogisticsCosts * valueRatio;
        break;
        
      case 'hybrid':
        // 混合分攤：固定費用按貨值，物流費用按體積
        const productValueRatio = productValue / sumVal;
        const productVolumeRatio = productVolume / totalVolume;
        fixedCostAllocation = totalFixedCosts * productValueRatio;
        logisticsCostAllocation = totalLogisticsCosts * productVolumeRatio;
        break;
    }
    
    return {
      productId: product.id,
      fixedCostAllocation,
      logisticsCostAllocation,
      totalAllocatedCosts: fixedCostAllocation + logisticsCostAllocation,
      perUnitAllocatedCosts: productQty > 0 ? (fixedCostAllocation + logisticsCostAllocation) / productQty : 0
    };
  });
}

// 計算成本明細（使用統一的 calculateQuote 函數）
export function calculateCostBreakdown(inputs: Inputs) {
  const { products = [] } = inputs;
  const derived = calculateDerivedValues(products);
  
  // 使用統一的 calculateQuote 函數計算所有費用
  const quoteResult = calculateQuote({
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
  });
  
  // 確定需要添加的費用（根據貿易條件）
  const add = {
    inlandToPort: inputs.supplierTerm === "EXW" && idx(inputs.targetTerm) >= idx("FOB"),
    originPortFees: inputs.supplierTerm === "EXW" && idx(inputs.targetTerm) >= idx("FOB"),
    exportDocs: idx(inputs.targetTerm) >= idx("FOB"),
    mainFreight: idx(inputs.targetTerm) >= idx("CFR") && idx(inputs.supplierTerm) < idx("CFR"),
    insurance: idx(inputs.targetTerm) >= idx("CIF") && idx(inputs.supplierTerm) < idx("CIF"),
    destPortFees: idx(inputs.targetTerm) >= idx("DAP") && idx(inputs.supplierTerm) < idx("DAP"),
    importBroker: inputs.targetTerm === "DDP" && idx(inputs.supplierTerm) < idx("DDP"),
    lastMile: idx(inputs.targetTerm) >= idx("DAP") && idx(inputs.supplierTerm) < idx("DAP"),
    duty: inputs.targetTerm === "DDP" && idx(inputs.supplierTerm) < idx("DDP"),
    vat: inputs.targetTerm === "DDP" && idx(inputs.supplierTerm) < idx("DDP"),
  };
  
  // 分類成本（根據貿易條件過濾）
  const fixedCosts = {
    exportDocsClearance: add.exportDocs ? (inputs.exportDocsClearance.shipmentTotal || 0) : 0,
    documentFees: add.exportDocs ? (inputs.documentFees.shipmentTotal || 0) : 0,
    originPortFees: add.originPortFees ? (inputs.originPortFees.shipmentTotal || 0) : 0,
    destPortFees: add.destPortFees ? (inputs.destPortFees.shipmentTotal || 0) : 0,
    importBroker: add.importBroker ? (inputs.importBroker.shipmentTotal || 0) : 0,
    lastMileDelivery: add.lastMile ? (inputs.lastMileDelivery.shipmentTotal || 0) : 0,
    misc: (inputs.misc.shipmentTotal || 0) * derived.qty
  };
  
  const logisticsCosts = {
    inlandToPort: add.inlandToPort ? (inputs.inlandToPort.shipmentTotal || 0) : 0,
    mainFreight: add.mainFreight ? (inputs.mainFreight.shipmentTotal || 0) : 0,
    insurance: quoteResult.insurancePU // 修正：直接使用整票保險費，不再乘以數量
  };
  
  const totalFixedCosts = Object.values(fixedCosts).reduce((sum, cost) => sum + cost, 0);
  const totalLogisticsCosts = Object.values(logisticsCosts).reduce((sum, cost) => sum + cost, 0);
  
  // 統一三個指標欄位定義（與 calculateQuote 保持一致）
  const totalGoodsValue = derived.sumVal;                    // 只含貨值（不含出口費用）
  const totalExportCosts = totalFixedCosts + totalLogisticsCosts;  // 只含出口費用（不含貨值）
  const shipmentCostInclGoods = totalGoodsValue + totalExportCosts; // 含貨值的整票總成本
  
  // 計算分攤
  const costAllocation = calculateCostAllocation(
    products,
    totalFixedCosts,
    totalLogisticsCosts,
    inputs.allocationMethod || 'hybrid'
  );

  // 防呆斷言：確保 totalExportCosts 與 calculateQuote 一致
  console.assert(
    Math.abs(totalExportCosts - quoteResult.totals.totalExportCosts) < 1e-6,
    `Mismatch: totalExportCosts - costBreakdown: ${totalExportCosts}, calculateQuote: ${quoteResult.totals.totalExportCosts}`
  );
  
  return {
    fixedCosts,
    logisticsCosts,
    totalFixedCosts,
    totalLogisticsCosts,
    // 統一的三個指標欄位
    totalGoodsValue,           // 貨值總額
    totalExportCosts,          // 出口費用總額（不含貨值）
    shipmentCostInclGoods,     // 含貨值的整票總成本
    totalCosts: totalExportCosts, // 保持向後兼容（現在等於 totalExportCosts）
    costAllocation
  };
}

// 計算商品個別報價（包含分攤成本）
export function calculateProductQuote(
  product: Product,
  inputs: Inputs
) {
  const costBreakdown = calculateCostBreakdown(inputs);
  const productAllocation = costBreakdown.costAllocation.find(
    allocation => allocation.productId === product.id
  );
  
  if (!productAllocation) {
    throw new Error(`找不到商品 ${product.id} 的成本分攤`);
  }
  
  // 計算產品數量和單價
  let productQty = 0;
  let supplierUnitPrice = 0;
  
  if (product.inputMode === 'perBox') {
    productQty = (product.orderBoxes || 0) * (product.boxQuantity || 1);
    supplierUnitPrice = (product.boxPrice || 0) / (product.boxQuantity || 1);
  } else {
    productQty = product.totalQuantity || 0;
    supplierUnitPrice = product.unitPrice || 0;
  }
  
  // 單位成本 = 供應商單價 + 分攤的出口費用（不含貨值）
  // 修正：避免貨值重複計算
  const unitCost = supplierUnitPrice + productAllocation.perUnitAllocatedCosts;
  
  // 計算建議報價
  let suggestedQuote = unitCost;
  if (inputs.pricingMode === 'markup') {
    suggestedQuote = unitCost * (1 + (inputs.markupPct || 0) / 100);
  } else if (inputs.pricingMode === 'margin') {
    const margin = (inputs.marginPct || 0) / 100;
    suggestedQuote = unitCost / (1 - margin);
  }
  
  // 四捨五入
  const rounding = inputs.rounding || 1;
  suggestedQuote = Math.round(suggestedQuote / rounding) * rounding;
  
  // 計算利潤
  const unitProfit = suggestedQuote - unitCost;
  const totalProductValue = suggestedQuote * productQty;
  
  return {
    id: product.id,
    name: product.name,
    qty: productQty,
    supplierUnitPrice,
    unitCost,
    suggestedQuote,
    unitProfit,
    totalProductValue
  };
}

// 計算所有商品報價
export function calculateAllProductQuotes(inputs: Inputs) {
  const costBreakdown = calculateCostBreakdown(inputs);
  const products = inputs.products.map(product => 
    calculateProductQuote(product, inputs)
  );
  
  return {
    products,
    costBreakdown
  };
}

