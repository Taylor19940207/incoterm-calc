import React, { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { SheetClose } from "./ui/sheet";
import { Product, ProductInputMode } from "../types";

interface ProductEditorProps {
  initial: Product;
  onSubmit: (p: Product) => void;
}

export function ProductEditor({ initial, onSubmit }: ProductEditorProps) {
  const [draft, setDraft] = useState<Product>({ ...initial });

  // 即時計算體積
  const cbm = useMemo(
    () => draft.lengthM * draft.widthM * draft.heightM,
    [draft.lengthM, draft.widthM, draft.heightM]
  );

  // 即時計算體積重（空運係數6000）
  const volumetricWeight = useMemo(() => {
    const volumeCm3 = cbm * 1000000; // 轉換為 cm³
    return volumeCm3 / 6000; // 空運係數
  }, [cbm]);

  // 計費重量（取實際重量和體積重的較大值）
  const chargeableWeight = useMemo(() => {
    return Math.max(draft.weightKg || 0, volumetricWeight);
  }, [draft.weightKg, volumetricWeight]);

  function set<K extends keyof Product>(k: K, v: Product[K]) {
    setDraft(prev => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    // 基本驗證
    if (!draft.name?.trim()) {
      alert("請輸入商品名稱");
      return;
    }
    
    if (draft.lengthM <= 0 || draft.widthM <= 0 || draft.heightM <= 0) {
      alert("請輸入有效的尺寸");
      return;
    }
    
    if (draft.weightKg <= 0) {
      alert("請輸入有效的重量");
      return;
    }

    onSubmit(draft);
  }

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

        <Tabs value={draft.inputMode ?? "perBox"} onValueChange={(v: string) => set("inputMode", v as ProductInputMode)}>
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value="perBox">單箱模式</TabsTrigger>
            <TabsTrigger className="flex-1" value="perUnit">單個模式</TabsTrigger>
          </TabsList>

          <TabsContent value="perBox" className="pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>單箱價格</Label>
                <Input
                  inputMode="decimal"
                  value={draft.boxPrice ?? ""}
                  onChange={(e) => set("boxPrice", Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>單箱數量</Label>
                <Input
                  inputMode="numeric"
                  value={draft.boxQuantity ?? ""}
                  onChange={(e) => set("boxQuantity", Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>訂購箱數</Label>
                <Input
                  inputMode="numeric"
                  value={draft.orderBoxes ?? ""}
                  onChange={(e) => set("orderBoxes", Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="perUnit" className="pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>單個價格</Label>
                <Input
                  inputMode="decimal"
                  value={draft.unitPrice ?? ""}
                  onChange={(e) => set("unitPrice", Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>總數量</Label>
                <Input
                  inputMode="numeric"
                  value={draft.totalQuantity ?? ""}
                  onChange={(e) => set("totalQuantity", Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* 尺寸 / 重量（mm / kg） */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>長 (mm)</Label>
            <Input 
              inputMode="numeric"
              value={Math.round((draft.lengthM ?? 0) * 1000) || ""}
              onChange={(e) => set("lengthM", (Number(e.target.value) || 0) / 1000)}
            />
          </div>
          <div>
            <Label>寬 (mm)</Label>
            <Input 
              inputMode="numeric"
              value={Math.round((draft.widthM ?? 0) * 1000) || ""}
              onChange={(e) => set("widthM", (Number(e.target.value) || 0) / 1000)}
            />
          </div>
          <div>
            <Label>高 (mm)</Label>
            <Input 
              inputMode="numeric"
              value={Math.round((draft.heightM ?? 0) * 1000) || ""}
              onChange={(e) => set("heightM", (Number(e.target.value) || 0) / 1000)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>單箱重量 (kg)</Label>
            <Input 
              inputMode="decimal"
              value={draft.weightKg ?? ""}
              onChange={(e) => set("weightKg", Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="text-sm text-muted-foreground">
              CBM (m³)：<b>{cbm.toFixed(3)}</b>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <div className="text-sm text-muted-foreground">
              計費重(空運)：<b>{chargeableWeight.toFixed(2)} kg</b>
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
