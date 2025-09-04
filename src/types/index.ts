export const TERMS = ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"] as const;
export type Term = "EXW" | "FOB" | "CFR" | "CIF" | "DAP" | "DDP";
export type Lang = "zh" | "ja";
export type Owner = "factory" | "exporter" | "importer";
export type PricingMode = "markup" | "margin";
export type InputMode = "perUnit" | "total";
export type ProductInputMode = "perBox" | "perUnit";

// 物流方式
export type TransportMode = 'air' | 'courier' | 'sea' | 'truck';

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
  // 尺寸和重量（內部存儲單位）
  lengthM: number;        // 長度 (m)
  widthM: number;         // 寬度 (m)
  heightM: number;        // 高度 (m)
  weightKg: number;       // 每箱重量 (kg)
}

// 新增：成本項目結構
export interface CostItem {
  shipmentTotal: number;   // 主存：整票
  scaleWithQty?: boolean;  // 是否隨數量動
}

// 新增：出口文件模式
export type ExportDocsMode = "byShipment" | "byCustomsEntries";

// 新增：物流配置
export interface ShippingConfig {
  mode: TransportMode;
  volumetricDivisor: number | null;
  userOverride?: number;  // 用戶自定義覆寫
}

// 新增：用戶偏好
export interface UserPreferences {
  dimensionUnit: 'mm' | 'cm';
  weightUnit: 'kg' | 'g';
  defaultTransport: TransportMode;
  divisorOverrides: Record<TransportMode, number | null>;
  showAdvanced: boolean;
  rounding: { cbm: number; weight: number };
  currency: string;
}

// 新增：驗證狀態
export interface ValidationState {
  errors: ValidationError[];    // 硬錯誤（紅）
  warnings: ValidationWarning[]; // 黃牌警告
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface Inputs {
  // 基本設置
  currency: "JPY" | "USD" | "CNY";
  lang: "zh" | "ja";
  
  // 商品管理
  products: Product[];
  
  // 貿易條件
  supplierTerm: Term;
  targetTerm: Term;
  
  // 輸入模式
  inputMode: "total" | "perUnit";
  
  // 定價設置
  pricingMode: "markup" | "margin";
  markupPct: number;
  marginPct: number;
  bankFeePct: number;
  rounding: number;
  
  // 第二層：出口費用包含方式
  exportCostInclusion: "include" | "exclude";
  
  // 第三層：分攤方式選擇
  allocationMethod: AllocationMethod;
  
  // 新增：物流配置
  shippingConfig: ShippingConfig;
  
  // 成本參數（重構為 CostItem）
  exportDocsClearance: CostItem;
  documentFees: CostItem;
  inlandToPort: CostItem;
  originPortFees: CostItem;
  mainFreight: CostItem;
  insuranceRatePct: number;
  destPortFees: CostItem;
  importBroker: CostItem;
  lastMileDelivery: CostItem;
  dutyPct: number;
  vatPct: number;
  misc: CostItem;
  includeBrokerInTaxBase: boolean;
  exportDocsMode: ExportDocsMode;
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

