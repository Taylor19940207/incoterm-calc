import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { SheetClose } from "./ui/sheet";
import { Product } from "../types";

// helper to coerce any numeric-ish value to a non-negative number
const toNum = (v: unknown, fallback = 0) => {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

// when switching mode we want mutually exclusive fields cleared
function normalizeProduct(p: Product): Product {
  const base: Product = {
    ...p,
    inputMode: (p as any).inputMode ?? ("perBox" as const),
    boxPrice: toNum((p as any).boxPrice),
    boxQuantity: toNum((p as any).boxQuantity, 1),
    orderBoxes: toNum((p as any).orderBoxes),
    unitPrice: toNum((p as any).unitPrice),
    totalQuantity: toNum((p as any).totalQuantity),
    lengthM: toNum((p as any).lengthM),
    widthM: toNum((p as any).widthM),
    heightM: toNum((p as any).heightM),
    weightKg: toNum((p as any).weightKg),
  } as Product;

  // harden numeric fields so calculators never see undefined/NaN
  base.boxQuantity = Math.max(1, toNum(base.boxQuantity, 1));
  base.boxPrice = toNum(base.boxPrice, 0);
  base.orderBoxes = Math.max(0, toNum(base.orderBoxes, 0));
  base.unitPrice = toNum(base.unitPrice, 0);
  base.totalQuantity = Math.max(0, toNum(base.totalQuantity, 0));
  base.lengthM = toNum(base.lengthM, 0);
  base.widthM = toNum(base.widthM, 0);
  base.heightM = toNum(base.heightM, 0);
  base.weightKg = toNum(base.weightKg, 0);

  // clear mutually exclusive fields
  if (base.inputMode === "perBox") {
    base.unitPrice = 0;
    base.totalQuantity = 0;
  } else {
    base.boxPrice = 0;
    base.boxQuantity = Math.max(1, base.boxQuantity || 1);
    base.orderBoxes = 0;
  }
  return base;
}

interface ProductEditorProps {
  initial: Product;
  onSubmit: (p: Product) => void;
}

export function ProductEditor({ initial, onSubmit }: ProductEditorProps) {
  const [draft, setDraft] = useState<Product>(() => normalizeProduct(initial));

  // keep in sync if the incoming initial changes (e.g., editing another product)
  React.useEffect(() => {
    setDraft(normalizeProduct(initial));
  }, [initial]);

  // 即時計算體積 (m^3)
  const cbm = useMemo(() => {
    const L = Math.max(0, toNum((draft as any).lengthM));
    const W = Math.max(0, toNum((draft as any).widthM));
    const H = Math.max(0, toNum((draft as any).heightM));
    const v = L * W * H;
    return Number.isFinite(v) && v > 0 ? Number(v.toFixed(6)) : 0;
  }, [draft]);

  // 即時計算體積重（空運係數6000： cm^3 / 6000）
  const volumetricWeight = useMemo(() => {
    const volumeCm3 = cbm * 1_000_000; // m^3 -> cm^3
    const vw = volumeCm3 > 0 ? volumeCm3 / 6000 : 0;
    return Number.isFinite(vw) && vw > 0 ? Number(vw.toFixed(4)) : 0;
  }, [cbm]);

  // 計費重量（取實際重量和體積重的較大值）
  const chargeableWeight = useMemo(() => {
    const w = Math.max(0, toNum(draft.weightKg));
    const cw = Math.max(w, volumetricWeight);
    return Number.isFinite(cw) ? cw : 0;
  }, [draft.weightKg, volumetricWeight]);

  function set<K extends keyof Product>(k: K, v: Product[K]) {
    const value: any = typeof v === "number" ? toNum(v) : v === "" ? "" : v;
    setDraft(prev => ({ ...prev, [k]: value }));
  }

  function handleSave() {
    const p = normalizeProduct(draft);

    // final hardening: never let NaN/undefined go out
    (['boxPrice','boxQuantity','orderBoxes','unitPrice','totalQuantity','lengthM','widthM','heightM','weightKg'] as const).forEach((key) => {
      (p as any)[key] = toNum((p as any)[key], 0);
    });
    p.boxQuantity = Math.max(1, p.boxQuantity || 1);
    p.orderBoxes = Math.max(0, p.orderBoxes || 0);

    if (!p.name?.trim()) {
      alert("請輸入商品名稱");
      return;
    }

    if (p.lengthM <= 0 || p.widthM <= 0 || p.heightM <= 0) {
      alert("請輸入有效的尺寸");
      return;
    }

    if (p.weightKg <= 0) {
      alert("請輸入有效的重量");
      return;
    }

    if (p.inputMode === 'perBox') {
      if ((p.boxPrice || 0) <= 0) {
        alert('請輸入有效的單箱價格');
        return;
      }
      if ((p.boxQuantity || 0) <= 0) {
        alert('請輸入有效的單箱數量');
        return;
      }
      if ((p.orderBoxes || 0) < 0) {
        alert('訂購箱數不可為負');
        return;
      }
    } else {
      if ((p.unitPrice || 0) <= 0) {
        alert('請輸入有效的單個價格');
        return;
      }
      if ((p.totalQuantity || 0) <= 0) {
        alert('請輸入有效的總數量');
        return;
      }
    }

    onSubmit(p);
  }

  const toMmString = (m?: number) => {
    const n = toNum(m, 0);
    const mm = Math.round(n * 1000);
    return Number.isFinite(mm) && mm > 0 ? String(mm) : "";
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">編輯商品</h2>
        <p className="text-sm text-muted-foreground">只在此處編輯，列表保持乾淨。</p>
      </div>

      <Separator className="my-3" />

      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">商品名稱</Label>
          <Input 
            id="name" 
            value={draft.name ?? ""} 
            onChange={e => set("name", e.target.value)} 
          />
        </div>

        {/* 輸入模式選擇按鈕 */}
        <div className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-1 shadow-sm w-fit mx-auto">
          <button 
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              draft.inputMode === "perBox" 
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105" 
                : "text-blue-700 hover:text-blue-900 hover:bg-blue-100 hover:shadow-md"
            }`}
            onClick={() => setDraft(prev => normalizeProduct({ ...prev, inputMode: "perBox" as const }))}
          >
            單箱模式
          </button>
          <button 
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              draft.inputMode === "perUnit" 
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105" 
                : "text-blue-700 hover:text-blue-900 hover:bg-blue-100 hover:shadow-md"
            }`}
            onClick={() => setDraft(prev => normalizeProduct({ ...prev, inputMode: "perUnit" as const }))}
          >
            單個模式
          </button>
        </div>

        {/* 單箱模式輸入 */}
        {draft.inputMode === "perBox" && (
          <div className="pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>單箱價格</Label>
                <Input
                  inputMode="decimal"
                  value={draft.boxPrice ?? ""}
                  onChange={(e) => set("boxPrice", toNum(e.target.value))}
                />
              </div>
              <div>
                <Label>單箱數量</Label>
                <Input
                  inputMode="numeric"
                  value={draft.boxQuantity ?? ""}
                  onChange={(e) => set("boxQuantity", toNum(e.target.value))}
                />
              </div>
              <div>
                <Label>訂購箱數</Label>
                <Input
                  inputMode="numeric"
                  value={draft.orderBoxes ?? ""}
                  onChange={(e) => set("orderBoxes", toNum(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {/* 單個模式輸入 */}
        {draft.inputMode === "perUnit" && (
          <div className="pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>單個價格</Label>
                <Input
                  inputMode="decimal"
                  value={draft.unitPrice ?? ""}
                  onChange={(e) => set("unitPrice", toNum(e.target.value))}
                />
              </div>
              <div>
                <Label>總數量</Label>
                <Input
                  inputMode="numeric"
                  value={draft.totalQuantity ?? ""}
                  onChange={(e) => set("totalQuantity", toNum(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* 尺寸 / 重量（mm / kg） */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>長 (mm)</Label>
            <Input 
              inputMode="numeric"
              value={toMmString(draft.lengthM)}
              onChange={(e) => set("lengthM", toNum(e.target.value) / 1000)}
            />
          </div>
          <div>
            <Label>寬 (mm)</Label>
            <Input 
              inputMode="numeric"
              value={toMmString(draft.widthM)}
              onChange={(e) => set("widthM", toNum(e.target.value) / 1000)}
            />
          </div>
          <div>
            <Label>高 (mm)</Label>
            <Input 
              inputMode="numeric"
              value={toMmString(draft.heightM)}
              onChange={(e) => set("heightM", toNum(e.target.value) / 1000)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>單箱重量 (kg)</Label>
            <Input 
              inputMode="decimal"
              value={draft.weightKg ?? ""}
              onChange={(e) => set("weightKg", toNum(e.target.value))}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="text-sm text-muted-foreground">
              CBM (m³)：<b>{Number.isFinite(cbm) ? cbm.toFixed(3) : '0.000'}</b>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <div className="text-sm text-muted-foreground">
              計費重(空運)：<b>{Number.isFinite(chargeableWeight) ? chargeableWeight.toFixed(2) : '0.00'} kg</b>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 pt-4">
        <SheetClose asChild>
          <Button variant="ghost">取消</Button>
        </SheetClose>
        <SheetClose asChild>
          <Button onClick={handleSave}>儲存</Button>
        </SheetClose>
      </div>
    </div>
  );
}
