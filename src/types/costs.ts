export type CostItem = {
  shipmentTotal: number;      // 主存一律整票金額
  scaleWithQty?: boolean;     // 預設 false
};

export type ExportDocsMode = 'byShipment' | 'byCustomsEntries';

export type Costs = {
  inlandToPort: CostItem;
  originPortFees: CostItem;
  destPortFees: CostItem;
  importBroker: CostItem;
  lastMileDelivery: CostItem;
  misc: CostItem;

  mainFreight: CostItem;
  insurance: CostItem;

  documentFees: CostItem;
  exportDocsMode: ExportDocsMode;
  exportDocsClearance: CostItem;

  vatPct?: number;
  tariffPct?: number;
};

export const DEFAULT_COST_ITEM: CostItem = { shipmentTotal: 0, scaleWithQty: false };

export const DEFAULT_COSTS: Costs = {
  inlandToPort:      { ...DEFAULT_COST_ITEM },
  originPortFees:    { ...DEFAULT_COST_ITEM },
  destPortFees:      { ...DEFAULT_COST_ITEM },
  importBroker:      { ...DEFAULT_COST_ITEM },
  lastMileDelivery:  { ...DEFAULT_COST_ITEM },
  misc:              { ...DEFAULT_COST_ITEM },

  mainFreight:       { ...DEFAULT_COST_ITEM },
  insurance:         { ...DEFAULT_COST_ITEM },

  documentFees:      { ...DEFAULT_COST_ITEM },
  exportDocsMode:    'byShipment',
  exportDocsClearance:{ ...DEFAULT_COST_ITEM },

  vatPct: 0,
  tariffPct: 0,
};
