import { calculateQuote, calculateDerivedValues } from './calculations';
import { Product } from '../types';

describe('calculateDerivedValues', () => {
  it('should calculate derived values for single product', () => {
    const products: Product[] = [{
      id: 'test-1',
      name: '商品1',
      inputMode: 'perBox',
      boxPrice: 500,
      boxQuantity: 10,
      orderBoxes: 10,
      volume: 0.1,
      weight: 1.0
    }];

    const result = calculateDerivedValues(products);
    
    expect(result.qty).toBe(100); // 10 boxes * 10 units per box
    expect(result.sumVal).toBe(50000); // 10 boxes * 500 per box
    expect(result.totalVolume).toBe(10); // 10 boxes * 0.1 volume per box
    expect(result.totalWeight).toBe(10); // 10 boxes * 1.0 weight per box
  });

  it('should calculate derived values for multiple products', () => {
    const products: Product[] = [
      {
        id: 'test-1',
        name: '商品1',
        inputMode: 'perBox',
        boxPrice: 500,
        boxQuantity: 10,
        orderBoxes: 5,
        volume: 0.1,
        weight: 1.0
      },
      {
        id: 'test-2',
        name: '商品2',
        inputMode: 'perUnit',
        unitPrice: 25,
        totalQuantity: 200,
        boxQuantity: 20,
        volume: 0.05,
        weight: 0.5
      }
    ];

    const result = calculateDerivedValues(products);
    
    expect(result.qty).toBe(250); // 5*10 + 200
    expect(result.sumVal).toBe(37500); // 5*500 + 200*25
    expect(result.totalVolume).toBe(12.5); // 5*0.1 + 200*0.05
    expect(result.totalWeight).toBe(105); // 5*1.0 + 200*0.5
  });
});

describe('calculateQuote', () => {
  const baseInputs = {
    supplierTerm: 'FOB' as const,
    targetTerm: 'CIF' as const,
    qty: 100,
    unitPrice: 500,
    inputMode: 'total' as const,
    pricingMode: 'markup' as const,
    markupPct: 15,
    marginPct: 12,
    bankFeePct: 0.6,
    rounding: 1,
    inlandToPort: 0,
    exportDocsClearance: 0,
    documentFees: 0,  // 新增：文件費
    numOfShipments: 0,
    originPortFees: 0,
    mainFreight: 10,
    insuranceRatePct: 2,
    destPortFees: 0,
    importBroker: 0,
    lastMileDelivery: 0,
    dutyPct: 0,
    vatPct: 0,
    miscPerUnit: 5,
    includeBrokerInTaxBase: false,
  };

  it('should calculate FOB to CIF quote', () => {
    const result = calculateQuote(baseInputs);
    
    expect(result.unitQuote).toBeGreaterThan(0);
    expect(result.costPerUnit).toBeGreaterThan(0);
    expect(result.totalQuote).toBeGreaterThan(0);
    expect(result.profitMargin).toBeGreaterThan(0);
  });
});

