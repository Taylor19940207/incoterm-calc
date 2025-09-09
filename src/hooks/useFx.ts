import { useEffect, useState, useCallback } from 'react';
import { FxProvider, FxRates, Currency, FxConversionResult } from '../types/fx';
import { MockFxProvider } from '../services/fx';

const CACHE_KEY = 'fx_jpy_cache_v1';
const TTL_MS = 12 * 60 * 60 * 1000; // 12小時

interface UseFxResult {
  rates: FxRates | null;
  stale: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  convertToJPY: (amount: number, from: Currency, fxFeePct?: number) => number;
  convertFromJPY: (amount: number, to: Currency, fxFeePct?: number) => number;
  refresh: () => Promise<void>;
  formatJPY: (amount: number) => string;
}

export function useFxToJPY(provider: FxProvider): UseFxResult {
  const [rates, setRates] = useState<FxRates | null>(null);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 從快取載入匯率
  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const fx: FxRates = JSON.parse(cached);
        setRates(fx);
        setLastUpdated(new Date(fx.timestamp));
        setStale(Date.now() - fx.timestamp > TTL_MS);
        return true;
      }
    } catch (error) {
      console.error('Failed to load FX cache:', error);
    }
    return false;
  }, []);

  // 儲存到快取
  const saveToCache = useCallback((fx: FxRates) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(fx));
    } catch (error) {
      console.error('Failed to save FX cache:', error);
    }
  }, []);

  // 刷新匯率
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const latest = await provider.getLatest('JPY');
      saveToCache(latest);
      setRates(latest);
      setLastUpdated(new Date(latest.timestamp));
      setStale(false);
    } catch (err) {
      console.error('FX refresh failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchange rates';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [provider, saveToCache]);

  // 初始化
  useEffect(() => {
    // 先從快取載入
    const hasCache = loadFromCache();
    
    // 如果有快取，先顯示快取數據，然後在背景更新
    if (hasCache) {
      setLoading(false);
      // 如果快取過期，在背景更新
      if (stale) {
        refresh();
      }
    } else {
      // 沒有快取，顯示載入中並獲取數據
      refresh();
    }
  }, []); // 只在組件掛載時執行一次

  // 轉換為日幣
  const convertToJPY = useCallback((amount: number, from: Currency, fxFeePct = 0): number => {
    if (!rates || from === 'JPY') return amount;
    
    const rate = rates.rates[from];
    if (!rate || rate === 0) return 0;
    
    // 轉換：JPY = amount / rate(JPY->from)
    const jpy = amount / rate;
    
    // 加上匯率手續費
    if (fxFeePct > 0) {
      return jpy * (1 + fxFeePct / 100);
    }
    
    return jpy;
  }, [rates]);

  // 從日幣轉換
  const convertFromJPY = useCallback((amount: number, to: Currency, fxFeePct = 0): number => {
    if (!rates || to === 'JPY') return amount;
    
    const rate = rates.rates[to];
    if (!rate || rate === 0) return 0;
    
    // 轉換：target = JPY * rate(JPY->target)
    let converted = amount * rate;
    
    // 加上匯率手續費
    if (fxFeePct > 0) {
      converted = converted * (1 + fxFeePct / 100);
    }
    
    return converted;
  }, [rates]);

  // 格式化日幣顯示
  const formatJPY = useCallback((amount: number): string => {
    return `¥${Math.round(amount).toLocaleString()}`;
  }, []);

  return {
    rates,
    stale,
    loading,
    error,
    lastUpdated,
    convertToJPY,
    convertFromJPY,
    refresh,
    formatJPY
  };
}

// 簡化版 Hook，只提供基本轉換功能
export function useFxConversion(provider: FxProvider) {
  const fx = useFxToJPY(provider);
  
  return {
    convertToJPY: fx.convertToJPY,
    formatJPY: fx.formatJPY,
    loading: fx.loading,
    error: fx.error,
    lastUpdated: fx.lastUpdated,
    stale: fx.stale
  };
}
