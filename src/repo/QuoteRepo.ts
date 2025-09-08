import { Quote, CreateQuoteInput, UpdateQuoteInput, QuoteStats, TrendData, CostShare } from '../types/db';

export interface QuoteRepo {
  // 基本 CRUD 操作
  list(): Promise<Quote[]>;
  get(id: string): Promise<Quote | undefined>;
  create(input: CreateQuoteInput): Promise<Quote>;
  update(id: string, patch: UpdateQuoteInput): Promise<Quote>;
  remove(id: string): Promise<void>;
  duplicate(id: string): Promise<Quote>;
  
  // 統計和聚合數據
  getStats(): Promise<QuoteStats>;
  getTrendData(days?: number): Promise<TrendData[]>;
  getCostShareData(): Promise<CostShare[]>;
  getRecentQuotes(limit?: number): Promise<Quote[]>;
  
  // 工具方法
  generateCode(): Promise<string>;
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<void>;
  clearAll(): Promise<void>;
}
