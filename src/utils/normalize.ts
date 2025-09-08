import { Costs, DEFAULT_COSTS, DEFAULT_COST_ITEM, CostItem } from '../types/costs';
import { Quote } from '../types/db';

function normCostItem(ci: any): CostItem {
  if (!ci || typeof ci !== 'object') return { ...DEFAULT_COST_ITEM };
  return {
    shipmentTotal: Number.isFinite(ci.shipmentTotal) ? ci.shipmentTotal : 0,
    scaleWithQty: !!ci.scaleWithQty,
  };
}

export function normalizeCosts(raw: any): Costs {
  const src = raw ?? {};
  return {
    inlandToPort:       normCostItem(src.inlandToPort),
    originPortFees:     normCostItem(src.originPortFees),
    destPortFees:       normCostItem(src.destPortFees),
    importBroker:       normCostItem(src.importBroker),
    lastMileDelivery:   normCostItem(src.lastMileDelivery),
    misc:               normCostItem(src.misc),

    mainFreight:        normCostItem(src.mainFreight),
    insurance:          normCostItem(src.insurance),

    documentFees:       normCostItem(src.documentFees),
    exportDocsMode:     src.exportDocsMode === 'byCustomsEntries' ? 'byCustomsEntries' : 'byShipment',
    exportDocsClearance:normCostItem(src.exportDocsClearance),

    vatPct:             Number.isFinite(src.vatPct) ? src.vatPct : 0,
    tariffPct:          Number.isFinite(src.tariffPct) ? src.tariffPct : 0,
  };
}

export function normalizeQuote(q: any): Quote {
  // 這裡略過 Product 的硬化，你 ProductEditor 已經做得不錯
  const n: Quote = {
    ...q,
    inputs: {
      ...q.inputs,
      costs: normalizeCosts(q?.inputs?.costs),
    },
  };
  return n;
}
