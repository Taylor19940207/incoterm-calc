import React, { useEffect, useMemo, useState } from "react";

// 🧮 國際貿易報價計算器（v4.4 - 多品項上半部）
// - 上半部改為：貨幣（獨立一行）→「商品數量」→ 依數字自動產生 N 列（商品1/2/...：數量、單價）
// - 總數量 = 各商品數量加總；供應商單價 = 加權平均（Σ qty×單價 / Σ qty）
// - 當 productCount > 1 時，原本「數量、供應商單價」顯示為自動計算，不再手動輸入
// - 右側成本邏輯維持不變（僅改用合計數量與加權平均單價）

const TERMS = ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"] as const;
type Term = typeof TERMS[number];
type InputMode = "perUnit" | "total";
type Lang = "zh" | "ja";

const STEP_ORDER: Term[] = ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"];
const idx = (t: Term) => STEP_ORDER.indexOf(t);

// === 字典（中文 / 日本語） ===
const dict = {
  zh: {
    title: "國際貿易報價計算器（EXW / FOB / CFR / CIF / DAP / DDP）",
    reset: "重置為範例",
    params: "基本參數",
    currency: "貨幣",
    productCount: "商品數量",
    product: (i: number) => `商品 ${i}`,
    qty: "數量（單位）",
    supplierTerm: "供應商條件",
    supplierUnitPrice: "供應商單價（每單位）",
    targetTerm: "我的報價條件",
    pricingMode: "定價模式",
    markup: "Markup（對成本加價%）",
    margin: "Margin（目標毛利率%）",
    inputMode: "輸入模式",
    perUnit: "每單位",
    total: "整票總額（自動/數量）",
    bankFee: "銀行費/匯損 %",
    rounding: "四捨五入粒度",
    // 右側
    costParamsUnit: "費用參數（每單位）",
    costParamsTotal: "費用參數（整票總額 → 自動換算每單位）",
    hintPath: (from: Term, to: Term) => `系統會依 ${from}→${to} 的路徑自動啟用需要的費用；灰色代表在該條件下不適用。`,
    inlandToPort: "內陸拖運（工廠→起運港）",
    exportDocs: "出口文件/報關（每票）",
    numOfShipments: "報關單數量",
    originPort: "起運港費（THC/碼頭等）",
    mainFreight: "主運費（海/空）",
    insuranceRate: "保險費率 %",
    destPort: "目的港費（THC/D-O）",
    importBroker: "進口通關/代辦",
    lastMile: "末端配送（到指定地點）",
    misc: "雜項/包材/倉租/標籤等",
    duty: "關稅 %",
    vat: "VAT/GST %",
    includeBrokerInTaxBase: "稅基包含代辦/港費",
    includeNote: "將計入成本",
    supplierCovered: "供應商段（預設不計入）",
    notApplicable: "此條件下不適用",
    // 結果
    results: "計算結果",
    unitQuote: "建議報價/單",
    costPerUnit: "成本/單",
    marginAfterBank: "毛利率（扣銀行費）",
    bankRateLabel: "銀行費率",
    totalQuote: "總報價",
    totalCost: "總成本",
    totalProfit: "總毛利（含銀行費後）",
    qtyLabel: "數量",
    totalProfitNote: "= 總報價 - 總成本 - 銀行費",
    breakdownCol1: "構成項目（每單位）",
    amount: "金額",
    note: "說明",
    supplierValue: "供應商交易價值",
    startValue: "起點（交易價值）",
    segEXWFOB: "內陸拖運 + 出口文件 + 起運港費",
    segFOBCFR: "主運費",
    segCFRCIF: "保險（貨值+運費 × 率）",
    segCIFDAP: "目的港費 + 進口代辦 + 末端配送",
    dutyRow: "關稅（CIF 基礎）",
    vatRow: "VAT/GST（CIF+Duty 基礎）",
    miscRow: "雜項/包材/標籤等",
    cifBase: "CIF 稅基（每單位）",
    footer: "注意：此工具為估算模型；各國稅則、港雜費命名可能不同，請依實際操作調整。",
    langLabel: "語言",
    zh: "中文",
    ja: "日本語",
    respTitle: "責任對照",
    factory: "工廠",
    exporter: "出口商（我）",
    importer: "進口商（買家）",
    r_inland: "內陸拖運",
    r_export: "出口文件/報關",
    r_origin: "起運港費/裝船",
    r_freight: "主運費",
    r_insurance: "保險",
    r_dest: "目的港費",
    r_import: "進口通關",
    r_lastmile: "末端配送",
    r_duty: "關稅",
    r_vat: "VAT/GST",
  },
  ja: {
    title: "外国貿易における取引条件見積（EXW / FOB / CFR / CIF / DAP / DDP）",
    reset: "サンプルにリセット",
    params: "基本パラメータ",
    currency: "通貨",
    productCount: "商品数",
    product: (i: number) => `商品 ${i}`,
    qty: "数量（単位）",
    supplierTerm: "仕入条件",
    supplierUnitPrice: "仕入単価（1単位あたり）",
    targetTerm: "販売条件",
    pricingMode: "価格設定モード",
    markup: "マークアップ（コスト加算%）",
    margin: "マージン（目標利益率%）",
    inputMode: "入力モード",
    perUnit: "単位ごと",
    total: "総額入力（数量で自動換算）",
    bankFee: "銀行手数料/為替損 %",
    rounding: "丸め単位",
    // 右側
    costParamsUnit: "費用パラメータ（単位あたり）",
    costParamsTotal: "費用パラメータ（総額入力 → 自動換算）",
    hintPath: (from: Term, to: Term) => `システムは ${from}→${to} の経路に応じて必要な費用のみ有効化。グレーは当該条件では不要。`,
    inlandToPort: "内陸輸送（工場→出港）",
    exportDocs: "輸出書類/通関（1票あたり）",
    numOfShipments: "通関書類数",
    originPort: "出港費用（THC/ターミナル等）",
    mainFreight: "本船運賃（海/空）",
    insuranceRate: "保険料率 %",
    destPort: "到着港費用（THC/D-O）",
    importBroker: "輸入通関/代行",
    lastMile: "最終配送（指定地まで）",
    misc: "雑費/資材/保管/ラベル等",
    duty: "関税 %",
    vat: "VAT/GST %",
    includeBrokerInTaxBase: "課税基準に代行/港費を含む",
    includeNote: "コストに計上",
    supplierCovered: "仕入側の区間（計上しない）",
    notApplicable: "当条件では不要",
    // 結果
    results: "計算結果",
    unitQuote: "推奨単価",
    costPerUnit: "コスト/単位",
    marginAfterBank: "利益率（銀行手数料控除後）",
    bankRateLabel: "銀行手数料率",
    totalQuote: "見積総額",
    totalCost: "総コスト",
    totalProfit: "総利益（手数料控除後）",
    qtyLabel: "数量",
    totalProfitNote: "= 総額 - 総コスト - 銀行手数料",
    breakdownCol1: "内訳（単位あたり）",
    amount: "金額",
    note: "備考",
    supplierValue: "仕入価値",
    startValue: "起点（取引価値）",
    segEXWFOB: "内陸輸送 + 輸出書類 + 出港費用",
    segFOBCFR: "本船運賃",
    segCFRCIF: "保険（貨値+運賃 × 率）",
    segCIFDAP: "到着港費 + 通関代行 + 最終配送",
    dutyRow: "関税（CIF基準）",
    vatRow: "VAT/GST（CIF+関税 基準）",
    miscRow: "雑費/資材/ラベル等",
    cifBase: "CIF 課税標準（単位あたり）",
    footer: "注意：本ツールは概算モデルです。国・港により費目や名称が異なる場合があります。",
    langLabel: "言語",
    zh: "中文",
    ja: "日本語",
    respTitle: "責任マトリクス",
    factory: "工場",
    exporter: "輸出者（自社）",
    importer: "輸入者（買主）",
    r_inland: "内陸輸送",
    r_export: "輸出書類/通関",
    r_origin: "出港費/船積",
    r_freight: "本船運賃",
    r_insurance: "保険",
    r_dest: "到着港費",
    r_import: "輸入通関",
    r_lastmile: "最終配送",
    r_duty: "関税",
    r_vat: "VAT/GST",
  },
} as const;

// === 型別 ===
type Product = { qty: number; price: number };

interface Inputs {
  currency: string;
  // 單品模式用；多品項時會被覆蓋為合計/加權平均
  qty: number;
  supplierTerm: Term;
  supplierUnitPrice: number;

  // 多品項控制
  productCount: number;
  products: Product[];

  // 右側費用
  inlandToPort: number;
  exportDocsClearance: number;
  numOfShipments: number;
  originPortFees: number;
  mainFreight: number;
  insuranceRatePct: number;
  destPortFees: number;
  importBroker: number;
  lastMileDelivery: number;
  dutyPct: number;
  vatPct: number;
  miscPerUnit: number;
  bankFeePct: number;
  targetTerm: Term;
  pricingMode: "markup" | "margin";
  markupPct: number;
  marginPct: number;
  rounding: number;
  inputMode: InputMode;
  includeBrokerInTaxBase: boolean;
  exportDocsMode: InputMode;
}

const defaultInputs: Inputs = {
  currency: "JPY",
  qty: 0, // 單品模式時可用；多品項會覆蓋
  supplierTerm: "FOB",
  supplierUnitPrice: 0,

  productCount: 1,
  products: [{ qty: 0, price: 0 }],

  inlandToPort: 0,
  exportDocsClearance: 0,
  numOfShipments: 0,
  originPortFees: 0,
  mainFreight: 0,
  insuranceRatePct: 0,
  destPortFees: 0,
  importBroker: 0,
  lastMileDelivery: 0,
  dutyPct: 0,
  vatPct: 0,
  miscPerUnit: 0,
  bankFeePct: 0.6,
  targetTerm: "FOB",
  pricingMode: "markup",
  markupPct: 15,
  marginPct: 12,
  rounding: 1,
  inputMode: "perUnit",
  includeBrokerInTaxBase: false,
  exportDocsMode: "total",
};

function segmentsToAdd(from: Term, to: Term) {
  const s = idx(from), t = idx(to);
  if (t <= s) return [] as Term[];
  return STEP_ORDER.slice(s + 1, t + 1);
}
const roundTo = (x: number, step: number) => (step > 0 ? Math.round(x / step) * step : x);

// 哪些欄位屬於「每單位費用」（可支援整票模式自動換算）
const perUnitFields = new Set([
  "inlandToPort",
  "originPortFees",
  "mainFreight",
  "destPortFees",
  "importBroker",
  "lastMileDelivery",
  "miscPerUnit",
]);

export default function IncotermQuoteCalculator() {
  const [inputs, setInputs] = useState<Inputs>(() => {
    try {
      const saved = localStorage.getItem("incoterm_calc_v4.4");
      return saved ? { ...defaultInputs, ...JSON.parse(saved) } : defaultInputs;
    } catch { return defaultInputs; }
  });
  const [lang, setLang] = useState<Lang>("zh");
  const t = dict[lang];

  useEffect(() => { localStorage.setItem("incoterm_calc_v4.4", JSON.stringify(inputs)); }, [inputs]);
  const update = (patch: Partial<Inputs>) => setInputs((p) => ({ ...p, ...patch }));

  // 認定的合計數量 / 加權平均單價（多品項優先）
  const derived = useMemo(() => {
    const count = Math.max(1, inputs.productCount || 1);
    const items = (inputs.products || []).slice(0, count);
    const sumQty = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
    const sumVal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
    const qty = (inputs.productCount > 1) ? sumQty : (Number(inputs.qty) || 0);
    const unit = (inputs.productCount > 1)
      ? (sumQty > 0 ? sumVal / sumQty : 0)
      : (Number(inputs.supplierUnitPrice) || 0);
    return { qty, unit, sumQty, sumVal };
  }, [inputs.productCount, inputs.products, inputs.qty, inputs.supplierUnitPrice]);

  const segs = useMemo(
    () => segmentsToAdd(inputs.supplierTerm, inputs.targetTerm),
    [inputs.supplierTerm, inputs.targetTerm],
  );

  // 以輸入模式決定顯示值與寫回方式（用合計 qty）
  const getDisplayValue = (name: keyof Inputs) => {
    const val = Number((inputs as any)[name]) || 0;
    // 報關費顯示總額
    if (name === "exportDocsClearance" && inputs.exportDocsMode === "total") {
      const per = Number(inputs.exportDocsClearance) || 0;
      return String(per * Math.max(0, inputs.numOfShipments || 0));
    }
    if (name === "qty") return String(derived.qty); // 以合計數量顯示
    // 右側若是「整票模式」，以合計 qty 做換算
    if (inputs.inputMode === "total" && perUnitFields.has(name as string)) {
      return String(val * Math.max(1, derived.qty || 1));
    }
    return String(val);
  };

  const setFromDisplay = (name: keyof Inputs, raw: string) => {
    const num = Number(raw);
    if (Number.isNaN(num) || num < 0) return;

    if (name === "numOfShipments") {
      update({ numOfShipments: Math.max(0, Math.floor(num)) });
      return;
    }
    if (name === "exportDocsClearance" && inputs.exportDocsMode === "total") {
      const perShipment = (inputs.numOfShipments || 0) > 0 ? (num / inputs.numOfShipments) : 0;
      update({ exportDocsClearance: perShipment });
      return;
    }
    if (inputs.inputMode === "total" && perUnitFields.has(name as string)) {
      const perUnit = num / Math.max(1, derived.qty || 1);
      update({ [name]: perUnit } as any);
      return;
    }
    update({ [name]: num } as any);
  };

  // 調整商品列數
  const applyProductCount = (n: number) => {
    const count = Math.max(1, Math.floor(n));
    const arr = [...(inputs.products || [])];
    if (arr.length < count) {
      while (arr.length < count) arr.push({ qty: 0, price: 0 });
    } else if (arr.length > count) {
      arr.length = count;
    }
    update({ productCount: count, products: arr });
  };

  // 計算邏輯（用 derived.qty / derived.unit）
  const calc = useMemo(() => {
    const q = Math.max(1, Number(derived.qty) || 1);
    const baseGoods = Number(derived.unit) || 0;
    const sTerm = inputs.supplierTerm;
    const tTerm = inputs.targetTerm;

    let add = {
      inlandToPort: false,
      originPortFees: false,
      exportDocs: false,
      mainFreight: false,
      insurance: false,
      destPortFees: false,
      importBroker: false,
      lastMile: false,
      duty: false,
      vat: false,
    };
    add.inlandToPort = sTerm === "EXW" && idx(tTerm) >= idx("FOB");
    add.originPortFees = sTerm === "EXW" && idx(tTerm) >= idx("FOB");
    add.exportDocs = idx(tTerm) >= idx("FOB");
    add.mainFreight = idx(tTerm) >= idx("CFR") && idx(sTerm) < idx("CFR");
    add.insurance = idx(tTerm) >= idx("CIF") && idx(sTerm) < idx("CIF");
    add.destPortFees = idx(tTerm) >= idx("DAP") && idx(sTerm) < idx("DAP");
    add.importBroker = tTerm === "DDP" && idx(sTerm) < idx("DDP");
    add.lastMile = idx(tTerm) >= idx("DAP") && idx(sTerm) < idx("DAP");
    add.duty = tTerm === "DDP" && idx(sTerm) < idx("DDP");
    add.vat = tTerm === "DDP" && idx(sTerm) < idx("DDP");

    const inlandToPort = add.inlandToPort ? (inputs.inlandToPort || 0) : 0;
    const originPortFees = add.originPortFees ? (inputs.originPortFees || 0) : 0;

    const exportDocsClearanceTotal =
      add.exportDocs ? (inputs.exportDocsClearance || 0) * Math.max(0, inputs.numOfShipments || 0) : 0;
    const exportDocsClearance = exportDocsClearanceTotal / q;

    const mainFreight = add.mainFreight ? (inputs.mainFreight || 0) : 0;

    const insuranceBase = baseGoods + inlandToPort + originPortFees + mainFreight;
    const insurancePU = add.insurance ? (insuranceBase * ((inputs.insuranceRatePct || 0) / 100)) : 0;

    const destPortFees = add.destPortFees ? (inputs.destPortFees || 0) : 0;
    const importBroker = add.importBroker ? (inputs.importBroker || 0) : 0;
    const lastMileDelivery = add.lastMile ? (inputs.lastMileDelivery || 0) : 0;

    let cifBase = baseGoods + inlandToPort + originPortFees + exportDocsClearance + mainFreight + insurancePU;
    if (inputs.includeBrokerInTaxBase) {
      cifBase += destPortFees + importBroker;
    }

    const dutyPerUnit = add.duty ? cifBase * ((inputs.dutyPct || 0) / 100) : 0;
    const vatPerUnit = add.vat ? (cifBase + dutyPerUnit) * ((inputs.vatPct || 0) / 100) : 0;
    const miscPerUnit = inputs.miscPerUnit || 0;

    const exwToFob = inlandToPort + exportDocsClearance + originPortFees;
    const fobToCfr = mainFreight;
    const cifToDap = destPortFees + importBroker + lastMileDelivery;

    const need_EXW_to_FOB = idx(tTerm) >= idx("FOB");
    const need_FOB_to_CFR = idx(tTerm) >= idx("CFR");
    const need_CFR_to_CIF = idx(tTerm) >= idx("CIF");
    const need_CIF_to_DAP = idx(tTerm) >= idx("DAP");
    const need_DAP_to_DDP = idx(tTerm) >= idx("DDP");

    const costPerUnit =
      baseGoods +
      inlandToPort +
      exportDocsClearance +
      originPortFees +
      mainFreight +
      insurancePU +
      destPortFees +
      importBroker +
      lastMileDelivery +
      miscPerUnit +
      dutyPerUnit +
      vatPerUnit;

    const cifUnitValue = cifBase;

    const bankRate = (inputs.bankFeePct || 0) / 100;
    const costWithBank = costPerUnit / Math.max(1e-9, 1 - bankRate);
    const rawUnitQuote =
      inputs.pricingMode === "markup"
        ? costWithBank * (1 + (inputs.markupPct || 0) / 100)
        : costWithBank / Math.max(1e-9, 1 - (inputs.marginPct || 0) / 100);

    const unitQuote = roundTo(rawUnitQuote, Math.max(0.1, inputs.rounding || 1));
    const unitProfit = unitQuote - costPerUnit - unitQuote * bankRate;
    const profitMargin = unitQuote > 0 ? unitProfit / unitQuote : 0;

    return {
      exwToFob,
      fobToCfr,
      insurancePU,
      cifToDap,
      cifUnitValue,
      dutyPerUnit,
      vatPerUnit,
      need_EXW_to_FOB,
      need_FOB_to_CFR,
      need_CFR_to_CIF,
      need_CIF_to_DAP,
      need_DAP_to_DDP,
      costPerUnit,
      unitQuote,
      unitProfit,
      profitMargin,
      bankRate,
      totalCost: costPerUnit * q,
      totalQuote: unitQuote * q,
      totalProfit: unitProfit * q,
      q,
      baseGoods,
    };
  }, [inputs, derived.qty, derived.unit]);

  const labelCurrency = (n: number) => `${inputs.currency} ${n.toLocaleString()}`;
  const labelPct = (n: number) => `${(n * 100).toFixed(2)}%`;

  const unitFor = (name: keyof Inputs) => {
    if (name === "qty" || name === "numOfShipments" || name === "productCount") return "";
    if (
      name === "insuranceRatePct" ||
      name === "dutyPct" ||
      name === "vatPct" ||
      name === "markupPct" ||
      name === "marginPct" ||
      name === "bankFeePct"
    ) return "%";
    return inputs.currency;
  };

  // 共用數字欄位
  const field = (
    name: keyof Inputs,
    label: string,
    opts: { step?: number; min?: number; disabled?: boolean; note?: string; type?: string } = {}
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="flex w-full items-center whitespace-nowrap">
        <input
          type={opts.type ?? "number"}
          step={opts.step ?? 0.01}
          min={opts.min ?? 0}
          disabled={opts.disabled}
          className={`min-w-0 flex-1 rounded-l-2xl border px-3 py-2 ${opts.disabled ? "bg-gray-100 text-gray-400" : ""}`}
          value={getDisplayValue(name)}
          onChange={(e) => setFromDisplay(name, e.target.value)}
        />
        <span className={`shrink-0 rounded-r-2xl border border-l-0 bg-gray-100 px-3 py-2 text-sm ${opts.disabled ? "text-gray-400" : "text-gray-600"}`}>
          {unitFor(name)}
        </span>
      </div>
      {opts.note && <div className="text-xs text-gray-400">{opts.note}</div>}
    </div>
  );

  // === 責任對照 ===
  type Owner = "factory" | "exporter" | "importer";
  const responsibilities = [
    { key: "r_inland", step: idx("FOB") },
    { key: "r_export", step: idx("FOB") },
    { key: "r_origin", step: idx("FOB") },
    { key: "r_freight", step: idx("CFR") },
    { key: "r_insurance", step: idx("CIF") },
    { key: "r_dest", step: idx("DAP") },
    { key: "r_import", step: idx("DAP") },
    { key: "r_lastmile", step: idx("DAP") },
    { key: "r_duty", step: idx("DDP") },
    { key: "r_vat", step: idx("DDP") },
  ] as const;

  const ownerForResp = (rkey: string): Owner => {
    if (rkey === "r_inland" || rkey === "r_origin") {
      if (inputs.supplierTerm === "EXW") return "exporter";
      return "factory";
    }
    if (rkey === "r_export") return "exporter";
    if (rkey === "r_freight") return idx(inputs.targetTerm) >= idx("CFR") ? "exporter" : "importer";
    if (rkey === "r_insurance") return idx(inputs.targetTerm) >= idx("CIF") ? "exporter" : "importer";
    if (rkey === "r_dest" || rkey === "r_lastmile") return idx(inputs.targetTerm) >= idx("DAP") ? "exporter" : "importer";
    if (rkey === "r_import") return inputs.targetTerm === "DDP" ? "exporter" : "importer";
    if (rkey === "r_duty" || rkey === "r_vat") return inputs.targetTerm === "DDP" ? "exporter" : "importer";
    return "importer";
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">{t.langLabel}：</span>
              <button className={`rounded-full px-3 py-1 border ${lang === "zh" ? "bg-gray-900 text-white" : "bg-white"}`} onClick={() => setLang("zh")}>{t.zh}</button>
              <button className={`rounded-full px-3 py-1 border ${lang === "ja" ? "bg-gray-900 text-white" : "bg-white"}`} onClick={() => setLang("ja")}>{t.ja}</button>
            </div>
          </div>
          <button className="rounded-2xl border px-3 py-2 text-sm hover:bg-white" onClick={() => setInputs(defaultInputs)}>
            {t.reset}
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 基本參數（上半部） */}
          <section className="lg:col-span-1 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">{t.params}</h2>

            {/* 貨幣（獨立一行） */}
            <div className="mb-3">
              <label className="text-sm text-gray-600">{t.currency}</label>
              <select
                className="mt-1 w-full rounded-2xl border px-3 py-2"
                value={inputs.currency}
                onChange={(e) => update({ currency: e.target.value })}
              >
                <option value="JPY">JPY</option>
                <option value="USD">USD</option>
                <option value="CNY">CNY</option>
                <option value="EUR">EUR</option>
                <option value="TWD">TWD</option>
              </select>
            </div>

            {/* 商品數量控制 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">{t.productCount}</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="w-full rounded-2xl border px-3 py-2"
                  value={inputs.productCount}
                  onChange={(e) => applyProductCount(Number(e.target.value))}
                />
              </div>

              {/* 合計數量（自動顯示） */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">{t.qty}</label>
                <input
                  type="number"
                  className="w-full rounded-2xl border px-3 py-2 bg-gray-100 text-gray-500"
                  value={derived.qty}
                  disabled
                />
              </div>
            </div>

            {/* 動態商品列：商品 i → 數量、單價 */}
            <div className="mt-4 space-y-3">
              {Array.from({ length: inputs.productCount || 1 }).map((_, i) => {
                const item = inputs.products[i] || { qty: 0, price: 0 };
                return (
                  <div key={i} className="rounded-xl border p-3">
                    <div className="mb-2 text-sm font-medium">{t.product(i + 1)}</div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* 數量 */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">{t.qty}</label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          className="w-full rounded-2xl border px-3 py-2"
                          value={item.qty}
                          onChange={(e) => {
                            const arr = [...inputs.products];
                            arr[i] = { ...item, qty: Math.max(0, Math.floor(Number(e.target.value) || 0)) };
                            update({ products: arr });
                          }}
                        />
                      </div>
                      {/* 單價 */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">{t.supplierUnitPrice}</label>
                        <div className="flex">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            className="min-w-0 flex-1 rounded-l-2xl border px-3 py-2"
                            value={item.price}
                            onChange={(e) => {
                              const arr = [...inputs.products];
                              arr[i] = { ...item, price: Math.max(0, Number(e.target.value) || 0) };
                              update({ products: arr });
                            }}
                          />
                          <span className="shrink-0 rounded-r-2xl border border-l-0 bg-gray-100 px-3 py-2 text-sm text-gray-600">
                            {inputs.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 供應商條件 / 我的報價條件 / 定價模式 */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">{t.supplierTerm}</label>
                <select className="w-full rounded-2xl border px-3 py-2" value={inputs.supplierTerm} onChange={(e) => update({ supplierTerm: e.target.value as Term })}>
                  {TERMS.map((term) => (<option key={term} value={term}>{term}</option>))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">{t.targetTerm}</label>
                <select className="w-full rounded-2xl border px-3 py-2" value={inputs.targetTerm} onChange={(e) => update({ targetTerm: e.target.value as Term })}>
                  {TERMS.map((term) => (<option key={term} value={term}>{term}</option>))}
                </select>
              </div>
            </div>

            {/* 當只有 1 個商品時，保留手動輸入單價/數量（兼容單品情境） */}
            {inputs.productCount <= 1 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {field("qty", t.qty, { step: 1, min: 0 })}
                {field("supplierUnitPrice", t.supplierUnitPrice)}
              </div>
            )}

            {/* 價格模式 + 輸入模式 + 其它 */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-gray-600">{t.inputMode}：</span>
              <div className="flex items-center gap-2">
                <button className={`rounded-full px-3 py-1 text-sm border ${inputs.inputMode === "perUnit" ? "bg-gray-900 text-white" : "bg-white"}`} onClick={() => update({ inputMode: "perUnit" })}>{t.perUnit}</button>
                <button className={`rounded-full px-3 py-1 text-sm border ${inputs.inputMode === "total" ? "bg-gray-900 text-white" : "bg-white"}`} onClick={() => update({ inputMode: "total" })}>{t.total}</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">{t.pricingMode}</label>
                <select className="w-full rounded-2xl border px-3 py-2" value={inputs.pricingMode} onChange={(e) => update({ pricingMode: e.target.value as any })}>
                  <option value="markup">{t.markup}</option>
                  <option value="margin">{t.margin}</option>
                </select>
              </div>
              {field("bankFeePct", t.bankFee)}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">{t.rounding}</label>
                <select
                  className="w-full rounded-2xl border px-3 py-2"
                  value={String(inputs.rounding)}
                  onChange={(e) => update({ rounding: Number(e.target.value) })}
                >
                  <option value="0.1">0.1</option>
                  <option value="1">1</option>
                  <option value="10">10</option>
                </select>
              </div>
              {field("markupPct", t.markup, { disabled: inputs.pricingMode !== "markup" })}
              {field("marginPct", t.margin, { disabled: inputs.pricingMode !== "margin" })}
            </div>
          </section>

          {/* 成本明細輸入（右側） */}
          <section className="lg:col-span-2 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">{inputs.inputMode === "perUnit" ? t.costParamsUnit : t.costParamsTotal}</h2>
            <p className="mb-4 text-sm text-gray-600">{t.hintPath(inputs.supplierTerm, inputs.targetTerm)}</p>

            {(() => {
              const targetIdx = idx(inputs.targetTerm);
              const f = calc;
              const inlandToPortDisabled = targetIdx < idx("FOB") || ["FOB", "CFR", "CIF", "DAP", "DDP"].includes(inputs.supplierTerm);
              const inlandToPortNote = targetIdx < idx("FOB") ? t.notApplicable : ["FOB", "CFR", "CIF", "DAP", "DDP"].includes(inputs.supplierTerm) ? t.supplierCovered : t.includeNote;
              const originPortFeesDisabled = targetIdx < idx("FOB") || ["FOB", "CFR", "CIF", "DAP", "DDP"].includes(inputs.supplierTerm);
              const originPortFeesNote = targetIdx < idx("FOB") ? t.notApplicable : ["FOB", "CFR", "CIF", "DAP", "DDP"].includes(inputs.supplierTerm) ? t.supplierCovered : t.includeNote;
              const exportDocsDisabled = targetIdx < idx("FOB");
              const exportDocsNote = targetIdx < idx("FOB") ? t.notApplicable : t.includeNote;
              return (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  {field("inlandToPort", t.inlandToPort, { disabled: inlandToPortDisabled, note: inlandToPortNote })}
                  {field("exportDocsClearance", t.exportDocs, { disabled: exportDocsDisabled, note: exportDocsNote })}
                  {field("numOfShipments", t.numOfShipments, { step: 1, min: 0, note: "每票報關費用 × 票數（可為 0）" })}
                  {field("originPortFees", t.originPort, { disabled: originPortFeesDisabled, note: originPortFeesNote })}
                  {field("mainFreight", t.mainFreight, {
                    disabled: targetIdx < idx("CFR"),
                    note: targetIdx < idx("CFR") ? t.notApplicable : (f.need_FOB_to_CFR ? t.includeNote : t.supplierCovered),
                  })}
                  {field("insuranceRatePct", t.insuranceRate, {
                    disabled: targetIdx < idx("CIF"),
                    note: targetIdx < idx("CIF") ? t.notApplicable : (f.need_CFR_to_CIF ? t.includeNote : t.supplierCovered),
                  })}
                  {field("destPortFees", t.destPort, {
                    disabled: !f.need_CIF_to_DAP,
                    note: !f.need_CIF_to_DAP ? t.notApplicable : t.includeNote,
                  })}
                  {field("importBroker", t.importBroker, {
                    disabled: !f.need_DAP_to_DDP,
                    note: !f.need_DAP_to_DDP ? t.notApplicable : t.includeNote,
                  })}
                  {field("lastMileDelivery", t.lastMile, {
                    disabled: !f.need_CIF_to_DAP,
                    note: !f.need_CIF_to_DAP ? t.notApplicable : t.includeNote,
                  })}
                  {field("miscPerUnit", t.misc)}
                  {field("dutyPct", t.duty, {
                    disabled: !f.need_DAP_to_DDP,
                    note: !f.need_DAP_to_DDP ? t.notApplicable : t.includeNote,
                  })}
                  {field("vatPct", t.vat, {
                    disabled: !f.need_DAP_to_DDP,
                    note: !f.need_DAP_to_DDP ? t.notApplicable : t.includeNote,
                  })}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{t.includeBrokerInTaxBase}</label>
                    <input
                      type="checkbox"
                      checked={inputs.includeBrokerInTaxBase}
                      onChange={(e) => update({ includeBrokerInTaxBase: e.target.checked })}
                      className="rounded border px-3 py-2"
                    />
                  </div>
                </div>
              );
            })()}
          </section>
        </div>

        {/* 責任對照 */}
        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">{t.respTitle}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2 w-1/3">項目</th>
                  <th className="px-3 py-2 w-1/5">{t.factory}</th>
                  <th className="px-3 py-2 w-1/5">{t.exporter}</th>
                  <th className="px-3 py-2 w-1/5">{t.importer}</th>
                </tr>
              </thead>
              <tbody>
                {responsibilities.map((r) => {
                  const owner = ownerForResp(r.key);
                  const label = (t as any)[r.key] as string;
                  const cell = (k: Owner) => (
                    <td className={`px-3 py-2 ${owner === k ? "text-green-700 font-semibold" : "text-gray-400"}`}>
                      {owner === k ? "●" : "—"}
                    </td>
                  );
                  return (
                    <tr key={r.key} className="border-b">
                      <td className="px-3 py-2">{label}</td>
                      {cell("factory")}
                      {cell("exporter")}
                      {cell("importer")}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 計算結果 */}
        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{t.results}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-500">{t.unitQuote}</div>
              <div className="text-2xl font-bold">{labelCurrency(calc.unitQuote)}</div>
              <div className="mt-1 text-xs text-gray-500">→ {inputs.targetTerm}</div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-500">{t.costPerUnit}</div>
              <div className="text-2xl font-bold">{labelCurrency(calc.costPerUnit)}</div>
              <div className="mt-1 text-xs text-gray-500">{t.miscRow}</div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-500">{t.marginAfterBank}</div>
              <div className="text-2xl font-bold">{labelPct(calc.profitMargin)}</div>
              <div className="mt-1 text-xs text-gray-500">{t.bankRateLabel}：{(calc.bankRate * 100).toFixed(2)}%</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-500">{t.totalQuote}</div>
              <div className="text-2xl font-bold">{labelCurrency(calc.totalQuote)}</div>
              <div className="mt-1 text-xs text-gray-500">{t.qtyLabel}：{calc.q.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-500">{t.totalCost}</div>
              <div className="text-2xl font-bold">{labelCurrency(calc.totalCost)}</div>
              <div className="mt-1 text-xs text-gray-500">CIF ≈ {labelCurrency(calc.cifUnitValue)}</div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-500">{t.totalProfit}</div>
              <div className="text-2xl font-bold">{labelCurrency(calc.totalProfit)}</div>
              <div className="mt-1 text-xs text-gray-500">{t.totalProfitNote}</div>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2">{t.breakdownCol1}</th>
                  <th className="px-3 py-2">{t.amount}</th>
                  <th className="px-3 py-2">{t.note}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-3 py-2">{t.supplierValue}（{inputs.supplierTerm}）</td>
                  <td className="px-3 py-2">{labelCurrency(calc.baseGoods)}</td>
                  <td className="px-3 py-2">{t.startValue}</td>
                </tr>
                {segs.includes("FOB") && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t.segEXWFOB}</td>
                    <td className="px-3 py-2">{labelCurrency(calc.exwToFob)}</td>
                    <td className="px-3 py-2">EXW→FOB</td>
                  </tr>
                )}
                {segs.includes("CFR") && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t.segFOBCFR}</td>
                    <td className="px-3 py-2">{labelCurrency(calc.fobToCfr)}</td>
                    <td className="px-3 py-2">FOB→CFR</td>
                  </tr>
                )}
                {segs.includes("CIF") && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t.segCFRCIF}</td>
                    <td className="px-3 py-2">{labelCurrency(calc.insurancePU)}</td>
                    <td className="px-3 py-2">CFR→CIF</td>
                  </tr>
                )}
                {segs.includes("DAP") && (
                  <tr className="border-b">
                    <td className="px-3 py-2">{t.segCIFDAP}</td>
                    <td className="px-3 py-2">{labelCurrency(calc.cifToDap)}</td>
                    <td className="px-3 py-2">CIF→DAP</td>
                  </tr>
                )}
                {segs.includes("DDP") && (
                  <>
                    <tr className="border-b">
                      <td className="px-3 py-2">{t.dutyRow}</td>
                      <td className="px-3 py-2">{labelCurrency(calc.dutyPerUnit)}</td>
                      <td className="px-3 py-2">DAP→DDP</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2">{t.vatRow}</td>
                      <td className="px-3 py-2">{labelCurrency(calc.vatPerUnit)}</td>
                      <td className="px-3 py-2">DAP→DDP</td>
                    </tr>
                  </>
                )}
                <tr className="border-b">
                  <td className="px-3 py-2">{t.miscRow}</td>
                  <td className="px-3 py-2">{labelCurrency(inputs.miscPerUnit)}</td>
                  <td className="px-3 py-2">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-8 text-sm text-gray-500">
          <p>{t.footer}</p>
        </footer>
      </div>
    </div>
  );
}