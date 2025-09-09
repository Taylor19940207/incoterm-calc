import { FxProvider, FxRates, Currency } from '../types/fx';

export class PublicFxProvider implements FxProvider {
  async getLatest(base: Currency): Promise<FxRates> {
    // 由於免費匯率 API 都不穩定，直接使用模擬數據
    // 模擬延遲
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockRates: Record<Currency, Record<Currency, number>> = {
      JPY: { JPY: 1, USD: 0.0067, EUR: 0.0062, TWD: 0.21 },
      USD: { JPY: 149.25, USD: 1, EUR: 0.92, TWD: 31.5 },
      EUR: { JPY: 161.29, USD: 1.09, EUR: 1, TWD: 34.2 },
      TWD: { JPY: 4.76, USD: 0.032, EUR: 0.029, TWD: 1 }
    };
    
    return {
      base,
      timestamp: Date.now(),
      rates: mockRates[base]
    };
  }
}

// 備用提供者：使用 ECB API（歐洲央行）
export class ECBFxProvider implements FxProvider {
  async getLatest(base: Currency): Promise<FxRates> {
    try {
      // ECB API 以 EUR 為基礎
      const res = await fetch('https://api.exchangerate.host/latest?base=EUR');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      
      if (!json.success) {
        throw new Error(`API error: ${json.error?.info || 'Unknown error'}`);
      }
      
      const now = Date.now();
      const supportedCurrencies: Currency[] = ['JPY', 'USD', 'EUR', 'TWD'];
      
      // 轉換為以指定貨幣為基礎的匯率
      const baseRate = json.rates[base] || 1;
      const rates: Record<Currency, number> = Object.fromEntries(
        supportedCurrencies.map(c => {
          if (c === base) return [c, 1];
          const rate = json.rates[c] || 1;
          return [c, rate / baseRate];
        })
      ) as Record<Currency, number>;
      
      return { 
        base, 
        timestamp: now, 
        rates 
      };
    } catch (error) {
      console.error('Failed to fetch FX rates from ECB:', error);
      throw error;
    }
  }
}

// 模擬提供者（用於測試或離線模式）
export class MockFxProvider implements FxProvider {
  async getLatest(base: Currency): Promise<FxRates> {
    // 模擬延遲
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockRates: Record<Currency, Record<Currency, number>> = {
      JPY: { JPY: 1, USD: 0.0067, EUR: 0.0062, TWD: 0.21 },
      USD: { JPY: 149.25, USD: 1, EUR: 0.92, TWD: 31.5 },
      EUR: { JPY: 161.29, USD: 1.09, EUR: 1, TWD: 34.2 },
      TWD: { JPY: 4.76, USD: 0.032, EUR: 0.029, TWD: 1 }
    };
    
    return {
      base,
      timestamp: Date.now(),
      rates: mockRates[base]
    };
  }
}
