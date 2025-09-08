import { v4 as uuidv4 } from 'uuid';
import { Quote, CreateQuoteInput, UpdateQuoteInput, QuoteStats, TrendData, CostShare } from '../types/db';
import { QuoteRepo } from './QuoteRepo';
import { calculateAllProductQuotes } from '../utils/calculations';
import { normalizeQuote } from '../utils/normalize';

const STORAGE_KEY = 'incoterm-quotes';
const SEQUENCE_KEY = 'incoterm-quote-sequence';

export class LocalQuoteRepo implements QuoteRepo {
  private getQuotes(): Quote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const rawQuotes = data ? JSON.parse(data) : [];
      console.log('LocalQuoteRepo.getQuotes() - Raw data from localStorage:', data ? 'exists' : 'null');
      console.log('LocalQuoteRepo.getQuotes() - Parsed quotes count:', rawQuotes.length);
      
      // 正規化所有報價數據
      const normalizedQuotes = rawQuotes.map((q: any) => normalizeQuote(q));
      
      // 選擇性：把 normalized 回寫，完成一次性遷移
      if (rawQuotes.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedQuotes));
        console.log('LocalQuoteRepo.getQuotes() - Data normalized and saved back to localStorage');
      }
      
      return normalizedQuotes;
    } catch (error) {
      console.error('Failed to load quotes from localStorage', error);
      return [];
    }
  }

  private saveQuotes(quotes: Quote[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch (error) {
      console.error('Failed to save quotes to localStorage', error);
      throw new Error('Failed to save quotes');
    }
  }

  private getNextSequence(): number {
    try {
      const current = localStorage.getItem(SEQUENCE_KEY);
      const next = current ? parseInt(current) + 1 : 1;
      localStorage.setItem(SEQUENCE_KEY, next.toString());
      return next;
    } catch (error) {
      console.error('Failed to get next sequence', error);
      return Date.now(); // fallback
    }
  }

  private calculateDerived(inputs: Quote['inputs']): Quote['derived'] {
    // 使用真正的計算邏輯
    const { calculateAllProductQuotes } = require('../utils/calculations');
    
    // 計算所有商品的報價
    const productQuotes = calculateAllProductQuotes(inputs);
    
    // 轉換為 Quote['derived']['items'] 格式
    const items: Quote['derived']['items'] = productQuotes.products.map((product: any) => {
      const cbmPerBox = product.lengthM * product.widthM * product.heightM;
      const boxes = product.inputMode === 'perBox' ? (product.orderBoxes || 0) : Math.ceil((product.totalQuantity || 0) / (product.boxQuantity || 1));
      const totalCBM = cbmPerBox * boxes;
      const volumetricWeightPerBox = cbmPerBox * 1000000 / 6000;
      const totalVolumetricWeight = volumetricWeightPerBox * boxes;

      return {
        productId: product.id || `product-${Date.now()}`,
        name: product.name || '未命名商品',
        inputMode: product.inputMode || 'perBox',
        boxPrice: product.boxPrice,
        unitPrice: product.unitPrice,
        totalQuantity: product.totalQuantity,
        boxQuantity: product.boxQuantity,
        orderBoxes: product.orderBoxes,
        lengthM: product.lengthM || 0.1,
        widthM: product.widthM || 0.1,
        heightM: product.heightM || 0.1,
        weightKg: product.weightKg || 1,
        cbmPerBox,
        totalCBM,
        volumetricWeightPerBox,
        totalVolumetricWeight,
        unitCost: product.unitCost || 0,
        suggestedQuote: product.suggestedQuote || 0,
        totalProductValue: product.totalProductValue || 0
      };
    });

    // 使用真正的計算結果
    const totalQty = productQuotes.products.reduce((sum: number, p: any) => sum + p.qty, 0);
    const totalGoodsValue = productQuotes.costBreakdown.totalGoodsValue;
    const totalExportCosts = productQuotes.costBreakdown.totalExportCosts;
    const shipmentCostInclGoods = productQuotes.costBreakdown.shipmentCostInclGoods;
    const totalQuote = productQuotes.products.reduce((sum: number, p: any) => sum + p.totalProductValue, 0);
    const totalProfit = productQuotes.products.reduce((sum: number, p: any) => sum + (p.unitProfit * p.qty), 0);

    return {
      items,
      totals: {
        qty: totalQty,
        totalGoodsValue,
        totalExportCosts,
        shipmentCostInclGoods,
        totalQuote,
        totalProfit
      }
    };
  }

  async list(): Promise<Quote[]> {
    const quotes = this.getQuotes();
    console.log('LocalQuoteRepo.list() - Found quotes:', quotes.length);
    return quotes;
  }

  async get(id: string): Promise<Quote | undefined> {
    const quotes = this.getQuotes();
    return quotes.find(q => q.id === id);
  }

  async create(input: CreateQuoteInput): Promise<Quote> {
    const quotes = this.getQuotes();
    const sequence = this.getNextSequence();
    const year = new Date().getFullYear();
    const code = `Q${year}-${sequence.toString().padStart(4, '0')}`;
    
    const now = new Date().toISOString();
    
    // 創建新報價並正規化
    const newQuote: Quote = normalizeQuote({
      id: uuidv4(),
      code,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      ...input,
    });
    
    // 計算 derived 數據
    const derived = this.calculateDerived(newQuote.inputs);
    newQuote.derived = derived;

    quotes.push(newQuote);
    this.saveQuotes(quotes);
    console.log('LocalQuoteRepo.create() - Created quote:', newQuote.code);
    
    return newQuote;
  }

  async update(id: string, patch: UpdateQuoteInput): Promise<Quote> {
    const quotes = this.getQuotes();
    const index = quotes.findIndex(q => q.id === id);
    
    if (index === -1) {
      throw new Error(`Quote with id ${id} not found`);
    }

    const existingQuote = quotes[index];
    
    // 合併更新
    const updatedInputs = { ...existingQuote.inputs, ...patch.inputs };
    const updatedMeta = { ...existingQuote.meta, ...patch.meta };
    
    // 重新計算 derived 數據
    const derived = this.calculateDerived(updatedInputs);

    const updatedQuote: Quote = normalizeQuote({
      ...existingQuote,
      meta: updatedMeta,
      inputs: updatedInputs,
      derived,
      status: patch.status || existingQuote.status,
      updatedAt: new Date().toISOString()
    });

    quotes[index] = updatedQuote;
    this.saveQuotes(quotes);
    
    return updatedQuote;
  }

  async remove(id: string): Promise<void> {
    const quotes = this.getQuotes();
    const filtered = quotes.filter(q => q.id !== id);
    
    if (filtered.length === quotes.length) {
      throw new Error(`Quote with id ${id} not found`);
    }
    
    this.saveQuotes(filtered);
  }

  async duplicate(id: string): Promise<Quote> {
    const original = await this.get(id);
    if (!original) {
      throw new Error(`Quote with id ${id} not found`);
    }

    const sequence = this.getNextSequence();
    const year = new Date().getFullYear();
    const code = `Q${year}-${sequence.toString().padStart(4, '0')}-COPY`;

    const duplicated: Quote = {
      ...original,
      id: uuidv4(),
      code,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const quotes = this.getQuotes();
    quotes.push(duplicated);
    this.saveQuotes(quotes);
    
    return duplicated;
  }

  async getStats(): Promise<QuoteStats> {
    const quotes = this.getQuotes();
    console.log('LocalQuoteRepo.getStats() - Processing quotes:', quotes.length);
    
    const totalQuotes = quotes.length;
    const openQuotes = quotes.filter(q => q.status === 'draft' || q.status === 'sent').length;
    const avgMarginPct = totalQuotes > 0 
      ? quotes.reduce((sum, q) => sum + (q?.inputs?.marginPct || 0), 0) / totalQuotes 
      : 0;
    const quotedValue = quotes.reduce((sum, q) => sum + (q?.derived?.totals?.totalQuote || 0), 0);
    const pendingShipments = quotes.filter(q => q.status === 'won').length;
    const wonQuotes = quotes.filter(q => q.status === 'won').length;
    const winRate = totalQuotes > 0 ? (wonQuotes / totalQuotes) * 100 : 0;

    const stats = {
      totalQuotes,
      openQuotes,
      avgMarginPct,
      quotedValue,
      pendingShipments,
      winRate
    };
    
    console.log('LocalQuoteRepo.getStats() - Calculated stats:', stats);
    return stats;
  }

  async getTrendData(days: number = 30): Promise<TrendData[]> {
    const quotes = this.getQuotes();
    const today = new Date();
    const trendData: { [key: string]: { count: number; totalQuote: number } } = {};

    // 初始化過去 N 天的數據
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendData[dateStr] = { count: 0, totalQuote: 0 };
    }

    // 聚合報價數據
    quotes.forEach(quote => {
      const dateStr = (quote?.createdAt || '').split('T')[0];
      if (trendData[dateStr]) {
        trendData[dateStr].count++;
        trendData[dateStr].totalQuote += (quote?.derived?.totals?.totalQuote || 0);
      }
    });

    return Object.keys(trendData)
      .sort()
      .map(date => ({
        date: date.substring(5), // MM-DD
        count: trendData[date].count,
        totalQuote: trendData[date].totalQuote
      }));
  }

  async getCostShareData(): Promise<CostShare[]> {
    // 這裡可以根據實際的費用數據計算，目前返回固定數據
    return [
      { label: '運費', value: 45, color: '#6366F1' },
      { label: '保險費', value: 15, color: '#06B6D4' },
      { label: '文件費', value: 10, color: '#F59E0B' },
      { label: '港雜費', value: 20, color: '#EF4444' },
      { label: '其他', value: 10, color: '#8B5CF6' }
    ];
  }

  async getRecentQuotes(limit: number = 5): Promise<Quote[]> {
    const quotes = this.getQuotes();
    console.log('LocalQuoteRepo.getRecentQuotes() - Found quotes:', quotes.length);
    console.log('LocalQuoteRepo.getRecentQuotes() - Sample quote:', quotes[0]);
    
    const recent = quotes
      .sort((a, b) => {
        const dateA = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
        const dateB = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
    console.log('LocalQuoteRepo.getRecentQuotes() - Returning recent quotes:', recent.length);
    return recent;
  }

  async generateCode(): Promise<string> {
    const sequence = this.getNextSequence();
    const year = new Date().getFullYear();
    return `Q${year}-${sequence.toString().padStart(4, '0')}`;
  }

  async exportData(): Promise<string> {
    const quotes = this.getQuotes();
    return JSON.stringify(quotes, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const quotes = JSON.parse(jsonData);
      if (!Array.isArray(quotes)) {
        throw new Error('Invalid data format');
      }
      this.saveQuotes(quotes);
    } catch (error) {
      throw new Error('Failed to import data: ' + error);
    }
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SEQUENCE_KEY);
  }
}
