import { calculateQuote, calculateDerivedValues } from './calculations';
import { Product } from '../types';

describe('calculateDerivedValues', () => {
  it('should calculate total quantity and value for perBox products', () => {
    const products: Product[] = [{
      id: "1",
      name: "Product 1",
      inputMode: "perBox",
      boxPrice: 100,
      boxQuantity: 10,
      orderBoxes: 10,
      lengthM: 0.1,
      widthM: 0.1,
      heightM: 0.1,
      weightKg: 1.0
    }];

    const result = calculateDerivedValues(products);
    
    expect(result.qty).toBe(100); // 10 boxes * 10 items per box
    expect(result.sumVal).toBe(1000); // 10 boxes * 100 price per box
    expect(result.totalVolume).toBe(0.01); // 10 boxes * 0.1^3
    expect(result.totalWeight).toBe(10); // 10 boxes * 1.0 kg
  });

  it('should calculate total quantity and value for mixed input modes', () => {
    const products: Product[] = [
      {
        id: "1",
        name: "Product 1",
        inputMode: "perBox",
        boxPrice: 100,
        boxQuantity: 10,
        orderBoxes: 5,
        lengthM: 0.1,
        widthM: 0.1,
        heightM: 0.1,
        weightKg: 1.0
      },
      {
        id: "2",
        name: "Product 2",
        inputMode: "perUnit",
        unitPrice: 5,
        totalQuantity: 200,
        boxQuantity: 20,
        lengthM: 0.05,
        widthM: 0.05,
        heightM: 0.05,
        weightKg: 0.5
      }
    ];

    const result = calculateDerivedValues(products);
    
    expect(result.qty).toBe(250); // 50 + 200
    expect(result.sumVal).toBe(1500); // 500 + 1000
    expect(result.totalVolume).toBe(0.005 + 0.025); // 5 * 0.1^3 + 10 * 0.05^3
    expect(result.totalWeight).toBe(5 + 5); // 5 * 1.0 + 10 * 0.5
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
    exportDocsMode: 'byShipment' as const,
    exportCostInclusion: 'include' as const,
    allocationMethod: 'hybrid' as const,
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

