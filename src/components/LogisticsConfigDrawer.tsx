import React, { useState } from 'react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { AlertTriangle, Truck, Plane, Ship, Package } from 'lucide-react';

interface LogisticsConfigDrawerProps {
  selectedProducts: Set<string>;
  totalProducts: number;
  onApply: (config: LogisticsConfig) => void;
  children: React.ReactNode;
}

export interface LogisticsConfig {
  transportMode: 'air' | 'courier' | 'sea' | 'truck';
  customDivisor: number;
  rememberAsDefault: boolean;
}

const transportModes = [
  { value: 'air', label: '空運', icon: Plane, divisor: 6000 },
  { value: 'courier', label: '快遞', icon: Package, divisor: 5000 },
  { value: 'sea', label: '海運', icon: Ship, divisor: 6000 },
  { value: 'truck', label: '卡車', icon: Truck, divisor: 6000 },
];

export default function LogisticsConfigDrawer({ 
  selectedProducts, 
  totalProducts, 
  onApply, 
  children 
}: LogisticsConfigDrawerProps) {
  const [config, setConfig] = useState<LogisticsConfig>({
    transportMode: 'air',
    customDivisor: 6000,
    rememberAsDefault: false
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const selectedCount = selectedProducts.size;
  const canApplyToSelected = selectedCount > 0;
  const canApplyToAll = totalProducts > 0;

  const validateConfig = (): boolean => {
    const errors: string[] = [];
    
    if (config.customDivisor <= 0) {
      errors.push('體積重係數必須大於0');
    }
    
    if (config.customDivisor > 10000) {
      errors.push('體積重係數過大，請檢查輸入值');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleApply = (applyToAll: boolean = false) => {
    if (!validateConfig()) return;
    
    onApply(config);
    
    // 關閉Drawer
    const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLButtonElement;
    if (closeButton) closeButton.click();
  };

  const handleTransportModeChange = (mode: string) => {
    const selectedMode = transportModes.find(m => m.value === mode);
    if (selectedMode) {
      setConfig(prev => ({
        ...prev,
        transportMode: mode as LogisticsConfig['transportMode'],
        customDivisor: selectedMode.divisor
      }));
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-[480px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            物流配置
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* 運輸方式選擇 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">運輸方式</Label>
            <RadioGroup 
              value={config.transportMode} 
              onValueChange={handleTransportModeChange}
              className="grid grid-cols-2 gap-3"
            >
              {transportModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <div key={mode.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={mode.value} id={mode.value} />
                    <Label htmlFor={mode.value} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="h-4 w-4" />
                      {mode.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* 體積重係數 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">自定義體積重係數</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={config.customDivisor}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  customDivisor: Number(e.target.value) || 0 
                }))}
                className="w-32"
                min="1"
                max="10000"
              />
              <span className="text-sm text-gray-500">覆寫預設</span>
            </div>
            <div className="text-xs text-gray-500">
              預設值：{transportModes.find(m => m.value === config.transportMode)?.divisor}
            </div>
          </div>

          {/* 記住為預設 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberDefault"
              checked={config.rememberAsDefault}
              onCheckedChange={(checked: boolean) => setConfig(prev => ({ 
                ...prev, 
                rememberAsDefault: checked
              }))}
            />
            <Label htmlFor="rememberDefault" className="text-sm cursor-pointer">
              記住為預設設定
            </Label>
          </div>

          {/* 驗證錯誤 */}
          {validationErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">驗證警告</span>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 選中商品資訊 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              <span className="font-medium">已選中：</span>
              {selectedCount} 個商品
              {selectedCount > 0 && (
                <span className="text-blue-600 ml-2">
                  (共 {totalProducts} 個商品)
                </span>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLButtonElement;
              if (closeButton) closeButton.click();
            }}
          >
            取消
          </Button>
          
          <Button
            onClick={() => handleApply(false)}
            disabled={!canApplyToSelected}
            className="bg-blue-600 hover:bg-blue-700"
          >
            套用到選取商品 ({selectedCount})
          </Button>
          
          <Button
            onClick={() => handleApply(true)}
            disabled={!canApplyToAll}
            variant="secondary"
          >
            套用到全部商品 ({totalProducts})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
