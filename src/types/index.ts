export const TERMS = ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"] as const;
export type Term = "EXW" | "FOB" | "CFR" | "CIF" | "DAP" | "DDP";
export type Lang = "zh" | "ja";
export type Owner = "factory" | "exporter" | "importer";
export type PricingMode = "markup" | "margin";
export type InputMode = "perUnit" | "total";
export type ProductInputMode = "perBox" | "perUnit";

// 第二層：出口費用包含方式
export type ExportCostInclusion = "exclude" | "include";

// 第三層：分攤方式選擇
export type AllocationMethod = "quantity" | "volume" | "value" | "hybrid";

export interface Product {
  id: string;
  name: string;
  // 輸入模式選擇
  inputMode: ProductInputMode;
  // 單箱模式輸入
  boxPrice?: number;      // 單箱價格
  boxQuantity?: number;   // 單箱數量（一箱幾個）
  orderBoxes?: number;    // 訂購箱數
  // 單個模式輸入
  unitPrice?: number;     // 單個價格
  totalQuantity?: number; // 總數量
  // 其他屬性
  volume: number;         // 單箱體積
  weight: number;         // 單箱重量
}

export interface Inputs {
  // 基本設置
  currency: string;
  lang: Lang;
  
  // 商品管理
  products: Product[];
  
  // 貿易條件
  supplierTerm: Term;
  targetTerm: Term;
  
  // 輸入模式
  inputMode: InputMode;
  
  // 第一層：定價設置
  pricingMode: PricingMode;
  markupPct: number;
  marginPct: number;
  bankFeePct: number;
  rounding: number;
  
  // 第二層：出口費用包含方式
  exportCostInclusion: ExportCostInclusion;
  
  // 第三層：分攤方式選擇（僅在包含出口費用時顯示）
  allocationMethod: AllocationMethod;
  
  // 成本參數（整票固定費用）
  exportDocsClearance: number;  // 報關費
  documentFees: number;         // 文件費
  inlandToPort: number;         // 拖車費
  originPortFees: number;       // 港口雜費
  mainFreight: number;          // 海運費
  insuranceRatePct: number;     // 保險費率
  destPortFees: number;
  importBroker: number;
  lastMileDelivery: number;
  dutyPct: number;
  vatPct: number;
  miscPerUnit: number;
  includeBrokerInTaxBase: boolean;
  exportDocsMode: "perUnit" | "total";
  numOfShipments: number;
}

export interface ProductQuote {
  id: string;
  name: string;
  qty: number;
  supplierUnitPrice: number;
  unitCost: number;
  suggestedQuote: number;
  unitProfit: number;
  totalProductValue: number;
}

export interface Responsibility {
  key: string;
  factory: boolean;
  exporter: boolean;
  importer: boolean;
}

