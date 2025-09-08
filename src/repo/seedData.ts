import { CreateQuoteInput } from '../types/db';

export const seedQuotes: CreateQuoteInput[] = [
  {
    meta: {
      customerName: 'ABC 貿易公司',
      contactInfo: 'contact@abc.com',
      paymentTerms: 'T/T 30 days'
    },
    inputs: {
      incotermFrom: 'EXW',
      incotermTo: 'FOB',
      markupMode: 'markup',
      markupPct: 15,
      marginPct: 12.5,
      currency: 'USD',
      products: [
        {
          id: 'product-1',
          name: '電子產品 A',
          inputMode: 'perBox',
          boxPrice: 500,
          boxQuantity: 10,
          orderBoxes: 5,
          lengthM: 0.3,
          widthM: 0.2,
          heightM: 0.15,
          weightKg: 2.5
        }
      ],
      costs: {}
    }
  },
  {
    meta: {
      customerName: 'XYZ 企業',
      contactInfo: 'info@xyz.com',
      paymentTerms: 'L/C at sight'
    },
    inputs: {
      incotermFrom: 'FOB',
      incotermTo: 'CIF',
      markupMode: 'margin',
      markupPct: 20,
      marginPct: 16.7,
      currency: 'USD',
      products: [
        {
          id: 'product-2',
          name: '機械零件 B',
          inputMode: 'perUnit',
          unitPrice: 25,
          totalQuantity: 100,
          boxQuantity: 20,
          lengthM: 0.1,
          widthM: 0.08,
          heightM: 0.05,
          weightKg: 0.8
        }
      ],
      costs: {}
    }
  },
  {
    meta: {
      customerName: 'DEF 集團',
      contactInfo: 'sales@def.com',
      paymentTerms: 'T/T 15 days'
    },
    inputs: {
      incotermFrom: 'EXW',
      incotermTo: 'DDP',
      markupMode: 'markup',
      markupPct: 18,
      marginPct: 15.3,
      currency: 'USD',
      products: [
        {
          id: 'product-3',
          name: '紡織品 C',
          inputMode: 'perBox',
          boxPrice: 200,
          boxQuantity: 50,
          orderBoxes: 10,
          lengthM: 0.4,
          widthM: 0.3,
          heightM: 0.2,
          weightKg: 5.0
        }
      ],
      costs: {}
    }
  },
  {
    meta: {
      customerName: 'GHI 有限公司',
      contactInfo: 'contact@ghi.com',
      paymentTerms: 'T/T 45 days'
    },
    inputs: {
      incotermFrom: 'FOB',
      incotermTo: 'CFR',
      markupMode: 'markup',
      markupPct: 12,
      marginPct: 10.7,
      currency: 'USD',
      products: [
        {
          id: 'product-4',
          name: '化工原料 D',
          inputMode: 'perUnit',
          unitPrice: 8,
          totalQuantity: 500,
          boxQuantity: 25,
          lengthM: 0.05,
          widthM: 0.05,
          heightM: 0.05,
          weightKg: 0.2
        }
      ],
      costs: {}
    }
  },
  {
    meta: {
      customerName: 'JKL 國際',
      contactInfo: 'info@jkl.com',
      paymentTerms: 'L/C 30 days'
    },
    inputs: {
      incotermFrom: 'EXW',
      incotermTo: 'CIF',
      markupMode: 'margin',
      markupPct: 25,
      marginPct: 20.0,
      currency: 'USD',
      products: [
        {
          id: 'product-5',
          name: '食品 E',
          inputMode: 'perBox',
          boxPrice: 150,
          boxQuantity: 12,
          orderBoxes: 8,
          lengthM: 0.25,
          widthM: 0.2,
          heightM: 0.1,
          weightKg: 1.5
        }
      ],
      costs: {}
    }
  }
];

export const initializeSeedData = async (quotesRepo: any) => {
  try {
    console.log('Checking for existing quotes...');
    const existingQuotes = await quotesRepo.list();
    console.log('Found existing quotes:', existingQuotes.length);
    
    // 檢查是否有損壞的數據（缺少 customerName）
    const hasCorruptedData = existingQuotes.some((quote: any) => 
      !quote?.meta?.customerName || quote.meta.customerName === '未知'
    );
    
    if (existingQuotes.length === 0 || hasCorruptedData) {
      if (hasCorruptedData) {
        console.log('Detected corrupted data, clearing and reinitializing...');
        // 清除損壞的數據
        localStorage.removeItem('incoterm-quotes');
        localStorage.removeItem('incoterm-quote-sequence');
      } else {
        console.log('No existing quotes found. Initializing seed data...');
      }
      
      for (const seedQuote of seedQuotes) {
        console.log('Creating seed quote:', seedQuote.meta.customerName);
        const created = await quotesRepo.create(seedQuote);
        console.log('Created quote:', created);
      }
      console.log('Seed data initialized successfully');
    } else {
      console.log('Seed data already exists and is valid, skipping initialization');
      // 檢查現有數據的結構
      existingQuotes.forEach((quote: any, index: number) => {
        console.log(`Quote ${index + 1}:`, {
          id: quote.id,
          customerName: quote?.meta?.customerName,
          hasMeta: !!quote.meta,
          hasInputs: !!quote.inputs,
          hasDerived: !!quote.derived
        });
      });
    }
  } catch (error) {
    console.error('Failed to initialize seed data:', error);
  }
};
