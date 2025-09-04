import React, { useMemo, useState } from 'react';
import { TransportMode, ShippingConfig } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';

// 體積重係數預設值
const VOL_DIVISOR_DEFAULT: Record<TransportMode, number | null> = {
  air: 6000,
  courier: 5000,
  sea: null,
  truck: 6000
};

// 運輸方式標籤
const TRANSPORT_LABELS: Record<TransportMode, string> = {
  air: '空運',
  courier: '快遞',
  sea: '海運',
  truck: '卡車'
};

interface TransportModeCardProps {
  config: ShippingConfig;
  onConfigChange: (config: ShippingConfig) => void;
  t: any; // 字典
}

export function TransportModeCard({ config, onConfigChange, t }: TransportModeCardProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // 計算當前體積重係數
  const currentDivisor = useMemo(() => {
    return config.userOverride ?? VOL_DIVISOR_DEFAULT[config.mode];
  }, [config]);

  // 處理運輸方式變更
  const handleModeChange = (mode: string) => {
    onConfigChange({
      ...config,
      mode: mode as TransportMode,
      // 如果切換到海運，清除用戶覆寫
      userOverride: mode === 'sea' ? undefined : config.userOverride
    });
  };

  // 處理係數覆寫
  const handleDivisorOverride = (value: string) => {
    const numValue = Number(value) || 0;
    onConfigChange({
      ...config,
      userOverride: numValue > 0 ? numValue : undefined
    });
  };

  return (
    <Card className="space-y-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span>物流方式</span>
          <Badge variant="secondary" className="ml-auto">
            {currentDivisor ? `體積重係數 ${currentDivisor}` : '無體積重（海運）'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 運輸方式選擇 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">選擇運輸方式</Label>
          <RadioGroup 
            value={config.mode} 
            onValueChange={handleModeChange}
            className="grid grid-cols-2 gap-3"
          >
            {Object.entries(TRANSPORT_LABELS).map(([mode, label]) => (
              <div key={mode} className="flex items-center space-x-2">
                <RadioGroupItem value={mode} id={mode} />
                <Label htmlFor={mode} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* 進階設定 */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-sm text-muted-foreground"
            >
              <span>進階設定</span>
              <span>⚙️</span>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-3 space-y-3 pt-3 border-t">
            <div className="space-y-2">
              <Label htmlFor="divisor-override" className="text-sm">
                覆寫體積重係數
              </Label>
              <Input
                id="divisor-override"
                type="number"
                min={0}
                step={1}
                placeholder={String(VOL_DIVISOR_DEFAULT[config.mode] || '')}
                value={config.userOverride || ''}
                onChange={(e) => handleDivisorOverride(e.target.value)}
                disabled={config.mode === 'sea'}
                className="w-full"
              />
              {config.mode === 'sea' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>⚠️</span>
                  <span>海運不使用體積重</span>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <p>未選擇物流方式時，系統預設使用空運係數 6000 計算</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
