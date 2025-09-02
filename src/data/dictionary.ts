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
    "商品": "商品",
    "商品名稱": "商品名稱",
    "上移": "上移",
    "下移": "下移",
    
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
    "金額": "金額",
    "說明": "說明",
    
    // 成本明細
    supplierValue: "供應商貨值",
    startValue: "起始貨值",
    segEXWFOB: "EXW→FOB",
    "所有成本項目總計": "所有成本項目總計",
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
    
    // 三層架構相關詞彙
    "1 報價模式（決定利潤計算方式）": "1 報價模式（決定利潤計算方式）",
    "2 出口費用包含方式（決定單位成本定義）": "2 出口費用包含方式（決定單位成本定義）",
    "3 分攤方式選擇（多產品混裝時用）": "3 分攤方式選擇（多產品混裝時用）",
    "定價模式": "定價模式",
    "加價率": "加價率",
    "毛利率": "毛利率",
    "不含出口費用": "不含出口費用",
    "含出口費用": "含出口費用",
    "單位成本 = 供應商單價": "單位成本 = 供應商單價",
    "單位成本 = 供應商單價 + 分攤的出口成本": "單位成本 = 供應商單價 + 分攤的出口成本",
    "數量比例法": "數量比例法",
    "體積/重量比例法": "體積/重量比例法",
    "貨值比例法": "貨值比例法",
    "智能混合法（推薦）": "智能混合法（推薦）",
    "適合：產品體積/重量差不多": "適合：產品體積/重量差不多",
    "適合：產品大小差異大": "適合：產品大小差異大",
    "適合：高價+低價混裝": "適合：高價+低價混裝",
    "文件按貨值，物流按體積": "文件按貨值，物流按體積",
    
    // 商品報價相關詞彙
    "商品個別報價": "商品個別報價",
    "數量": "數量",
    "供應商單價": "供應商單價",
    "單位成本": "單位成本",
    "建議報價": "建議報價",
    "單位利潤": "單位利潤",
    "商品總價": "商品總價",
    
    // 總計相關詞彙
    "總計": "總計",
    "總數量": "總數量",
    "總利潤": "總利潤",
    "總報價": "總報價",
    
    // 公式說明
    "報價 = 單位成本 × (1 + 加價率%)": "報價 = 單位成本 × (1 + 加價率%)",
    "報價 = 單位成本 ÷ (1 - 毛利率%)": "報價 = 單位成本 ÷ (1 - 毛利率%)",
    
    // 成本明細相關詞彙
    "成本明細 (整票)": "成本明細 (整票)",
    "成本項目": "成本項目",
    "內陸拖運": "內陸拖運",
    "工廠到港口": "工廠到港口",
    "出口文件": "出口文件",
    "報關文件費用": "報關文件費用",
    "起運港費用": "起運港費用",
    "港口雜費": "港口雜費",
    "主運費": "主運費",
    "海運/空運費用": "海運/空運費用",
    "保險費": "保險費",
    "貨物保險": "貨物保險",
    "目的港費用": "目的港費用",
    "目的港雜費": "目的港雜費",
    "進口代理": "進口代理",
    "進口代理費": "進口代理費",
    "末端配送": "末端配送",
    "最後一哩配送": "最後一哩配送",
    "關稅 (%)": "關稅 (%)",
    "VAT (%)": "VAT (%)",
    "雜項費用": "雜項費用",
    "其他雜費": "其他雜費",
    "將代理費計入稅基": "將代理費計入稅基",
    "總成本": "總成本",
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
    perBox: "箱単位モード",
    perUnit: "個単位モード",
    boxPrice: "箱単価",
    boxQuantity: "箱入り数量",
    orderBoxes: "注文箱数",
    unitPrice: "単価",
    totalQuantity: "総数量",
    volume: "箱体積",
    weight: "箱重量",
    addProduct: "商品追加",
    deleteProduct: "商品削除",
    "商品": "商品",
    "商品名稱": "商品名",
    "上移": "上へ",
    "下移": "下へ",
    
    // 貿易條件
    supplierTerm: "サプライヤー条件",
    targetTerm: "見積条件",
    
    // 輸入模式
    inputMode: "入力モード",
    total: "総額",
    
    // 定價模式
    pricingMode: "価格設定モード",
    markup: "マークアップ率",
    margin: "マージン",
    markupPct: "マークアップ率 (%)",
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
    "金額": "金額",
    "說明": "説明",
    
    // 成本明細
    supplierValue: "サプライヤー価値",
    startValue: "開始価値",
    segEXWFOB: "EXW→FOB",
    "所有成本項目總計": "全コスト項目合計",
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
    
    // 三層架構相關詞彙
    "1 報價模式（決定利潤計算方式）": "1 見積モード（利益計算方式を決定）",
    "2 出口費用包含方式（決定單位成本定義）": "2 輸出費用の含め方（単位コスト定義を決定）",
    "3 分攤方式選擇（多產品混裝時用）": "3 按分方法の選択（複数商品混載時に使用）",
    "定價模式": "価格設定モード",
    "加價率": "マークアップ率",
    "毛利率": "マージン",
    "不含出口費用": "輸出費用を含まない",
    "含出口費用": "輸出費用を含む",
    "單位成本 = 供應商單價": "単位コスト = サプライヤー単価",
    "單位成本 = 供應商單價 + 分攤的出口成本": "単位コスト = サプライヤー単価 + 按分された輸出コスト",
    "數量比例法": "数量比例法",
    "體積/重量比例法": "体積/重量比例法",
    "貨值比例法": "貨物価値比例法",
    "智能混合法（推薦）": "インテリジェント混合法（推奨）",
    "適合：產品體積/重量差不多": "適合：商品の体積/重量がほぼ同じ",
    "適合：產品大小差異大": "適合：商品のサイズ差が大きい",
    "適合：高價+低價混裝": "適合：高価格+低価格の混載",
    "文件按貨值，物流按體積": "書類は貨物価値、物流は体積で按分",
    
    // 商品報價相關詞彙
    "商品個別報價": "商品別見積",
    "數量": "数量",
    "供應商單價": "サプライヤー単価",
    "單位成本": "単位コスト",
    "建議報價": "推奨見積価格",
    "單位利潤": "単位利益",
    "商品總價": "商品合計価格",
    
    // 總計相關詞彙
    "總計": "総計",
    "總數量": "総数量",
    "總利潤": "総利益",
    "總報價": "総見積",
    
    // 公式說明
    "報價 = 單位成本 × (1 + 加價率%)": "見積 = 単位コスト × (1 + マークアップ率%)",
    "報價 = 單位成本 ÷ (1 - 毛利率%)": "見積 = 単位コスト ÷ (1 - マージン%)",
    
    // 成本明細相關詞彙
    "成本明細 (整票)": "コスト明細（総額）",
    "成本項目": "コスト項目",
    "內陸拖運": "内陸輸送",
    "工廠到港口": "工場から港まで",
    "出口文件": "輸出書類",
    "報關文件費用": "通関書類費用",
    "起運港費用": "出発港費用",
    "港口雜費": "港湾諸掛り",
    "主運費": "主要運賃",
    "海運/空運費用": "海運/空運費用",
    "保險費": "保険料",
    "貨物保險": "貨物保険",
    "目的港費用": "到着港費用",
    "目的港雜費": "目的港諸掛り",
    "進口代理": "輸入通関業者費用",
    "進口代理費": "輸入通関業者手数料",
    "末端配送": "ラストマイル配送",
    "最後一哩配送": "最終配送",
    "關稅 (%)": "関税（%）",
    "VAT (%)": "VAT（%）",
    "雜項費用": "雑費",
    "其他雜費": "その他雑費",
    "將代理費計入稅基": "通関業者費用を課税対象に含む",
    "總成本": "総コスト",
  }
};
