import { Lang } from '../types';

export const dict: Record<Lang, any> = {
  zh: {
    // 基本
    title: "出口商報價系統",
    zh: "中文",
    ja: "日文",
    langLabel: "語言",
    reset: "重置",
    params: "基本參數",
    results: "計算結果",
    
    // 貨幣
    currency: "貨幣",
    
    // 商品管理
    productName: "產品名稱",
    productInputMode: "輸入模式",
    perBox: "單箱模式",
    perUnit: "單個模式",
    boxPrice: "單箱價格",
    boxQuantity: "單箱數量",
    orderBoxes: "訂購箱數",
    unitPrice: "單個價格",
    totalQuantity: "總數量",
    volume: "單箱體積",
    weight: "單箱重量",
    addProduct: "新增商品",
    deleteProduct: "刪除商品",
    
    // 貿易條件
    supplierTerm: "供應商條件",
    targetTerm: "報價條件",
    
    // 輸入模式
    inputMode: "輸入模式",
    total: "整票總額",
    
    // 定價模式
    pricingMode: "定價模式",
    markup: "加價率",
    margin: "毛利率",
    markupPct: "加價率 (%)",
    marginPct: "毛利率 (%)",
    bankFee: "銀行費用",
    bankFeePct: "銀行費率 (%)",
    rounding: "四捨五入",
    
    // 分攤模式
    allocationMethod: "分攤方式",
    allocationQuantity: "數量比例",
    allocationVolume: "體積比例",
    allocationValue: "貨值比例",
    allocationHybrid: "混合分攤",
    allocationHint: "混合分攤：固定費用按貨值，物流費用按體積",
    
    // 成本參數
    costParamsUnit: "成本參數（每單位）",
    costParamsTotal: "成本參數（整票總額）",
    exportDocsClearance: "報關費",
    documentFees: "文件費",
    inlandToPort: "拖車費",
    originPortFees: "港口雜費",
    mainFreight: "海運費",
    insuranceRatePct: "保險費率 (%)",
    destPortFees: "目的港費用",
    importBroker: "進口代理",
    lastMileDelivery: "末端配送",
    dutyPct: "關稅 (%)",
    vatPct: "VAT (%)",
    miscPerUnit: "雜項費用",
    includeBrokerInTaxBase: "將代理費計入稅基",
    
    // 計算結果
    unitQuote: "單位報價",
    costPerUnit: "單位成本",
    totalQuote: "總報價",
    marginAfterBank: "毛利率",
    bankRateLabel: "銀行費率",
    
    // 責任對照
    respTitle: "責任對照表",
    factory: "工廠",
    exporter: "出口商",
    importer: "進口商",
    breakdownCol1: "項目",
    amount: "金額",
    note: "說明",
    
    // 成本明細
    supplierValue: "供應商貨值",
    startValue: "起始貨值",
    segEXWFOB: "EXW→FOB",
    segFOBCFR: "FOB→CFR",
    segCFRCIF: "CFR→CIF",
    segCIFDAP: "CIF→DAP",
    dutyRow: "關稅",
    vatRow: "VAT/GST",
    totalCost: "總成本",
    totalProfitNote: "總利潤",
    qtyLabel: "數量",
    
    // 提示
    hintPath: (from: string, to: string) => `費用路徑：${from} → ${to}`,
    notApplicable: "不適用",
    includeNote: "包含在內",
    
    // 其他
    numOfShipments: "報關票數",
  },
  
  ja: {
    // 基本
    title: "輸出業者見積システム",
    zh: "中文",
    ja: "日本語",
    langLabel: "言語",
    reset: "リセット",
    params: "基本パラメータ",
    results: "計算結果",
    
    // 貨幣
    currency: "通貨",
    
    // 商品管理
    productName: "商品名",
    productInputMode: "入力モード",
    perBox: "箱単位",
    perUnit: "個別単位",
    boxPrice: "箱単価",
    boxQuantity: "箱内数量",
    orderBoxes: "注文箱数",
    unitPrice: "個別単価",
    totalQuantity: "総数量",
    volume: "箱容積",
    weight: "箱重量",
    addProduct: "商品追加",
    deleteProduct: "商品削除",
    
    // 貿易條件
    supplierTerm: "サプライヤー条件",
    targetTerm: "見積条件",
    
    // 輸入模式
    inputMode: "入力モード",
    total: "総額",
    
    // 定價模式
    pricingMode: "価格設定",
    markup: "マークアップ",
    margin: "マージン",
    markupPct: "マークアップ (%)",
    marginPct: "マージン (%)",
    bankFee: "銀行手数料",
    bankFeePct: "銀行手数料率 (%)",
    rounding: "端数処理",
    
    // 分攤模式
    allocationMethod: "配分方法",
    allocationQuantity: "数量比例",
    allocationVolume: "容積比例",
    allocationValue: "価値比例",
    allocationHybrid: "ハイブリッド配分",
    allocationHint: "ハイブリッド配分：固定費用は価値比例、物流費用は容積比例",
    
    // 成本參數
    costParamsUnit: "コストパラメータ（単位当たり）",
    costParamsTotal: "コストパラメータ（総額）",
    exportDocsClearance: "通関手数料",
    documentFees: "書類手数料",
    inlandToPort: "トラック料金",
    originPortFees: "港雑費",
    mainFreight: "海運料金",
    insuranceRatePct: "保険料率 (%)",
    destPortFees: "仕向港費用",
    importBroker: "輸入代理店",
    lastMileDelivery: "最終配送",
    dutyPct: "関税 (%)",
    vatPct: "VAT (%)",
    miscPerUnit: "雑費",
    includeBrokerInTaxBase: "代理店手数料を税基に含める",
    
    // 計算結果
    unitQuote: "単位見積",
    costPerUnit: "単位コスト",
    totalQuote: "総見積",
    marginAfterBank: "マージン",
    bankRateLabel: "銀行手数料率",
    
    // 責任對照
    respTitle: "責任対照表",
    factory: "工場",
    exporter: "輸出業者",
    importer: "輸入業者",
    breakdownCol1: "項目",
    amount: "金額",
    note: "説明",
    
    // 成本明細
    supplierValue: "サプライヤー価値",
    startValue: "開始価値",
    segEXWFOB: "EXW→FOB",
    segFOBCFR: "FOB→CFR",
    segCFRCIF: "CFR→CIF",
    segCIFDAP: "CIF→DAP",
    dutyRow: "関税",
    vatRow: "VAT/GST",
    totalCost: "総コスト",
    totalProfitNote: "総利益",
    qtyLabel: "数量",
    
    // 提示
    hintPath: (from: string, to: string) => `費用パス：${from} → ${to}`,
    notApplicable: "該当なし",
    includeNote: "含む",
    
    // 其他
    numOfShipments: "通関件数",
  }
};
