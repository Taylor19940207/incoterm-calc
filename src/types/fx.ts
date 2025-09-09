export type Currency = 'JPY' | 'USD' | 'EUR' | 'TWD';

export interface FxRates {
  base: Currency;             // 例如 'JPY'
  timestamp: number;          // epoch ms
  rates: Record<Currency, number>; // 例：{ USD: 0.0065, EUR: 0.0060, JPY: 1 }
}

export interface FxSnapshot {
  rates: FxRates;
  fxFeePct: number;          // 匯率手續費百分比
  createdAt: number;         // 快照建立時間
}

export interface FxProvider {
  getLatest(base: Currency): Promise<FxRates>;
}

export interface FxConversionResult {
  originalAmount: number;
  originalCurrency: Currency;
  convertedAmount: number;
  convertedCurrency: Currency;
  rate: number;
  fxFeePct: number;
  timestamp: number;
}
