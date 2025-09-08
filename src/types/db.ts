export type ID = string;

export interface QuoteItem {
  productId: ID;
  name: string;
  inputMode: "perBox" | "perUnit";
  boxPrice?: number;
  unitPrice?: number;
  totalQuantity?: number;
  boxQuantity?: number;
  orderBoxes?: number;
  lengthM: number;
  widthM: number;
  heightM: number;
  weightKg: number;
  // 計算結果
  cbmPerBox: number;
  totalCBM: number;
  volumetricWeightPerBox: number;
  totalVolumetricWeight: number;
  unitCost: number;
  suggestedQuote: number;
  totalProductValue: number;
}

export interface Quote {
  id: ID;
  code: string;            // Q2025-0001
  status: "draft" | "sent" | "won" | "lost";
  createdAt: string;        // ISO
  updatedAt: string;
  
  // 客戶/單據元資料（不參與計算）
  meta: {
    customerName: string;
    customerId?: ID;
    contactInfo?: string;
    paymentTerms?: string;
    validUntil?: string;
    notes?: string;
  };
  
  // 計算參數（唯一事實來源）
  inputs: {
    incotermFrom: "EXW" | "FOB" | "CFR" | "CIF" | "DAP" | "DDP";
    incotermTo: "EXW" | "FOB" | "CFR" | "CIF" | "DAP" | "DDP";
    markupMode: "markup" | "margin";
    markupPct: number;
    marginPct: number;
    currency: "JPY" | "USD" | "TWD";
    products: any[];        // 商品列表
    costs: any;            // 成本參數
    [key: string]: any;    // 其他計算參數
  };
  
  // 計算結果快照（用於展示和歷史記錄）
  derived: {
    items: QuoteItem[];
    totals: {
      qty: number;
      totalGoodsValue: number;
      totalExportCosts: number;
      shipmentCostInclGoods: number;
      totalQuote: number;
      totalProfit: number;
    };
  };
}

export interface CreateQuoteInput {
  meta: {
    customerName: string;
    customerId?: ID;
    contactInfo?: string;
    paymentTerms?: string;
    validUntil?: string;
    notes?: string;
  };
  inputs: Quote['inputs'];
}

export interface UpdateQuoteInput {
  meta?: Partial<Quote['meta']>;
  inputs?: Partial<Quote['inputs']>;
  status?: Quote['status'];
}

// 用於 Dashboard 統計
export interface QuoteStats {
  totalQuotes: number;
  openQuotes: number;
  avgMarginPct: number;
  quotedValue: number;
  pendingShipments: number;
  winRate: number;
}

// 用於趨勢圖
export interface TrendData {
  date: string;
  count: number;
  totalQuote: number;
}

// 用於費用結構
export interface CostShare {
  label: string;
  value: number;
  color: string;
}
