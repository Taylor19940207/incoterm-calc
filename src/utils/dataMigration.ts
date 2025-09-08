import { Inputs, Product, CostItem } from '../types';

// 數據版本
export const DATA_VERSION = "2.0.0";

// 舊數據格式的類型定義
interface LegacyInputs {
  currency?: string;
  lang?: string;
  products?: any[];
  supplierTerm?: string;
  targetTerm?: string;
  inputMode?: string;
  pricingMode?: string;
  markupPct?: number;
  marginPct?: number;
  bankFeePct?: number;
  rounding?: number;
  exportCostInclusion?: string;
  allocationMethod?: string;
  shippingConfig?: any;
  // 舊格式的成本參數（可能是數字）
  exportDocsClearance?: number | CostItem;
  documentFees?: number | CostItem;
  inlandToPort?: number | CostItem;
  originPortFees?: number | CostItem;
  mainFreight?: number | CostItem;
  insuranceRatePct?: number;
  destPortFees?: number | CostItem;
  importBroker?: number | CostItem;
  lastMileDelivery?: number | CostItem;
  dutyPct?: number;
  vatPct?: number;
  misc?: number | CostItem;
  includeBrokerInTaxBase?: boolean;
  exportDocsMode?: string;
  numOfShipments?: number;
}

// 將舊格式的成本參數轉換為新格式
function normalizeCostItem(value: number | CostItem | undefined, defaultValue: number = 0): CostItem {
  if (typeof value === 'number') {
    return { shipmentTotal: value, scaleWithQty: false };
  }
  if (value && typeof value === 'object' && 'shipmentTotal' in value) {
    return {
      shipmentTotal: value.shipmentTotal || 0,
      scaleWithQty: value.scaleWithQty || false
    };
  }
  return { shipmentTotal: defaultValue, scaleWithQty: false };
}

// 正規化商品數據
function normalizeProduct(product: any): Product {
  return {
    id: product.id || `product-${Date.now()}-${Math.random()}`,
    name: product.name || "未命名商品",
    inputMode: product.inputMode || "perBox",
    boxPrice: product.boxPrice || 0,
    boxQuantity: product.boxQuantity || 1,
    orderBoxes: product.orderBoxes || 0,
    unitPrice: product.unitPrice || 0,
    totalQuantity: product.totalQuantity || 0,
    lengthM: product.lengthM || 0.1,
    widthM: product.widthM || 0.1,
    heightM: product.heightM || 0.1,
    weightKg: product.weightKg || 1.0,
    transportMode: product.transportMode || "air",
    customDivisor: product.customDivisor
  };
}

// 主要的數據遷移函數
export function migrateInputs(legacyData: any): Inputs {
  console.log('Migrating legacy data:', legacyData);
  
  const migrated: Inputs = {
    // 基本設置
    currency: (legacyData.currency as any) || "JPY",
    lang: (legacyData.lang as any) || "zh",
    
    // 商品管理
    products: (legacyData.products || []).map(normalizeProduct),
    
    // 貿易條件
    supplierTerm: (legacyData.supplierTerm as any) || "FOB",
    targetTerm: (legacyData.targetTerm as any) || "CIF",
    
    // 輸入模式
    inputMode: (legacyData.inputMode as any) || "total",
    
    // 定價設置
    pricingMode: (legacyData.pricingMode as any) || "markup",
    markupPct: legacyData.markupPct || 15,
    marginPct: legacyData.marginPct || 12,
    bankFeePct: legacyData.bankFeePct || 0.6,
    rounding: legacyData.rounding || 1,
    
    // 第二層：出口費用包含方式
    exportCostInclusion: (legacyData.exportCostInclusion as any) || "include",
    
    // 第三層：分攤方式選擇
    allocationMethod: (legacyData.allocationMethod as any) || "hybrid",
    
    // 物流配置
    shippingConfig: legacyData.shippingConfig || {
      mode: "air",
      volumetricDivisor: 6000,
      userOverride: undefined
    },
    
    // 成本參數（遷移舊格式）
    exportDocsClearance: normalizeCostItem(legacyData.exportDocsClearance, 20000),
    documentFees: normalizeCostItem(legacyData.documentFees, 5000),
    inlandToPort: normalizeCostItem(legacyData.inlandToPort, 15000),
    originPortFees: normalizeCostItem(legacyData.originPortFees, 8000),
    mainFreight: normalizeCostItem(legacyData.mainFreight, 100000),
    insuranceRatePct: legacyData.insuranceRatePct || 0.2,
    destPortFees: normalizeCostItem(legacyData.destPortFees, 0),
    importBroker: normalizeCostItem(legacyData.importBroker, 0),
    lastMileDelivery: normalizeCostItem(legacyData.lastMileDelivery, 0),
    dutyPct: legacyData.dutyPct || 0,
    vatPct: legacyData.vatPct || 0,
    misc: normalizeCostItem(legacyData.misc, 0),
    includeBrokerInTaxBase: legacyData.includeBrokerInTaxBase || false,
    exportDocsMode: (legacyData.exportDocsMode as any) || "byShipment",
    numOfShipments: legacyData.numOfShipments || 1,
  };
  
  console.log('Migrated data:', migrated);
  return migrated;
}

// 檢查是否需要遷移
export function needsMigration(data: any): boolean {
  // 檢查是否有舊格式的成本參數
  const costFields = ['exportDocsClearance', 'documentFees', 'inlandToPort', 'originPortFees', 'mainFreight', 'destPortFees', 'importBroker', 'lastMileDelivery', 'misc'];
  
  for (const field of costFields) {
    if (data[field] !== undefined && typeof data[field] === 'number') {
      console.log(`Found legacy format for ${field}:`, data[field]);
      return true;
    }
  }
  
  // 檢查是否缺少必要屬性
  const requiredFields = ['lang', 'currency', 'supplierTerm', 'targetTerm'];
  for (const field of requiredFields) {
    if (data[field] === undefined) {
      console.log(`Missing required field: ${field}`);
      return true;
    }
  }
  
  return false;
}

// 包裝 localStorage 的數據管理器
export class DataManager {
  static load<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      
      const parsed = JSON.parse(stored);
      
      // 檢查是否需要遷移
      if (needsMigration(parsed)) {
        console.log('Data migration needed, migrating...');
        const migrated = migrateInputs(parsed);
        this.save(key, migrated);
        return migrated as T;
      }
      
      return parsed as T;
    } catch (error) {
      console.error('Failed to load data:', error);
      return defaultValue;
    }
  }
  
  static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }
}
