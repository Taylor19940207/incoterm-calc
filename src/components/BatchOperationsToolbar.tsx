import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface BatchOperationsToolbarProps {
  selectedIds: string[];
  onBulkToggleDimensionUnit: () => void;
  onBulkToggleWeightUnit: () => void;
  onBulkApplyTransport: () => void;
  onBulkClearDimensions: () => void;
  onBulkApplyBoxSpec: () => void;
  dimensionUnit: 'mm' | 'cm';
  weightUnit: 'kg' | 'g';
}

export function BatchOperationsToolbar({
  selectedIds,
  onBulkToggleDimensionUnit,
  onBulkToggleWeightUnit,
  onBulkApplyTransport,
  onBulkClearDimensions,
  onBulkApplyBoxSpec,
  dimensionUnit,
  weightUnit
}: BatchOperationsToolbarProps) {
  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
      <div className="flex items-center gap-3 p-3">
        <Badge variant="secondary" className="flex items-center gap-1">
          <span>⚠️</span>
          已選 {selectedIds.length} 項
        </Badge>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={onBulkToggleDimensionUnit}
            className="flex items-center gap-1"
          >
            <span>↔️</span>
            尺寸單位 {dimensionUnit === 'mm' ? 'mm↔cm' : 'cm↔mm'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={onBulkToggleWeightUnit}
            className="flex items-center gap-1"
          >
            <span>⚖️</span>
            重量單位 {weightUnit === 'kg' ? 'kg↔g' : 'g↔kg'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={onBulkApplyTransport}
            className="flex items-center gap-1"
          >
            <span>🚚</span>
            套用物流方式
          </Button>
          
          <Button 
            variant="outline"
            onClick={onBulkApplyBoxSpec}
            className="flex items-center gap-1"
          >
            <span>📦</span>
            套用箱規
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button 
          variant="destructive"
          onClick={onBulkClearDimensions}
          className="flex items-center gap-1"
        >
          <span>🗑️</span>
          清空尺寸
        </Button>
      </div>
    </div>
  );
}
