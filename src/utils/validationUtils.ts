import { Product, TransportMode, ValidationState, ValidationError, ValidationWarning } from '../types';

// 體積重係數預設值
const VOL_DIVISOR_DEFAULT: Record<TransportMode, number | null> = {
  air: 6000,
  courier: 5000,
  sea: null,
  truck: 6000
};

// 驗證規則常量
const VALIDATION_RULES = {
  MAX_DIMENSION_MM: 3000,        // 單邊最大尺寸 (mm)
  MAX_WEIGHT_KG: 100,           // 單箱最大重量 (kg)
  MAX_DIMENSION_RATIO: 8,        // 最大尺寸比例
  MAX_CBM_PER_BOX: 2.0,         // 單箱最大體積 (m³)
  MIN_DIMENSION_MM: 1,           // 最小尺寸 (mm)
  MIN_WEIGHT_KG: 0.001,         // 最小重量 (kg)
} as const;

// 單位轉換函數
export const toMeters = (val: number, unit: 'mm' | 'cm'): number => {
  return unit === 'mm' ? val / 1000 : val / 100;
};

export const toKg = (val: number, unit: 'g' | 'kg'): number => {
  return unit === 'g' ? val / 1000 : val;
};

// 驗證單個產品
export function validateProduct(
  product: Product, 
  transportMode: TransportMode,
  dimensionUnit: 'mm' | 'cm',
  weightUnit: 'kg' | 'g'
): ValidationState {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 轉換為內部單位進行驗證
  const lengthM = toMeters(product.lengthM * (dimensionUnit === 'mm' ? 1000 : 100), dimensionUnit);
  const widthM = toMeters(product.widthM * (dimensionUnit === 'mm' ? 1000 : 100), dimensionUnit);
  const heightM = toMeters(product.heightM * (dimensionUnit === 'mm' ? 1000 : 100), dimensionUnit);
  const weightKg = toKg(product.weightKg * (weightUnit === 'g' ? 1000 : 1), weightUnit);

  // 硬錯誤驗證（紅）
  
  // 1. 尺寸必須為正數
  if (lengthM <= 0) {
    errors.push({ field: 'length', message: '長度必須大於 0' });
  }
  if (widthM <= 0) {
    errors.push({ field: 'width', message: '寬度必須大於 0' });
  }
  if (heightM <= 0) {
    errors.push({ field: 'height', message: '高度必須大於 0' });
  }

  // 2. 重量必須為正數
  if (weightKg <= 0) {
    errors.push({ field: 'weight', message: '重量必須大於 0' });
  }

  // 3. 單邊尺寸上限檢查
  const maxDimensionM = Math.max(lengthM, widthM, heightM);
  if (maxDimensionM > VALIDATION_RULES.MAX_DIMENSION_MM / 1000) {
    errors.push({ 
      field: 'dimensions', 
      message: `單邊尺寸不能超過 ${VALIDATION_RULES.MAX_DIMENSION_MM}mm` 
    });
  }

  // 4. 單箱重量上限檢查
  if (weightKg > VALIDATION_RULES.MAX_WEIGHT_KG) {
    errors.push({ 
      field: 'weight', 
      message: `單箱重量不能超過 ${VALIDATION_RULES.MAX_WEIGHT_KG}kg` 
    });
  }

  // 5. 海運模式下的 CBM 檢查
  if (transportMode === 'sea') {
    const cbmPerBox = lengthM * widthM * heightM;
    if (cbmPerBox <= 0) {
      errors.push({ 
        field: 'dimensions', 
        message: '海運模式下必須填寫尺寸，無法估算運費' 
      });
    }
  }

  // 黃牌警告驗證（黃）
  
  // 1. 尺寸比例異常檢查
  const minDimensionM = Math.min(lengthM, widthM, heightM);
  if (minDimensionM > 0 && maxDimensionM / minDimensionM > VALIDATION_RULES.MAX_DIMENSION_RATIO) {
    warnings.push({ 
      field: 'dimensions', 
      message: '尺寸比例異常，請確認是否單位或數值輸入錯誤' 
    });
  }

  // 2. CBM 異常檢查
  const cbmPerBox = lengthM * widthM * heightM;
  if (cbmPerBox > VALIDATION_RULES.MAX_CBM_PER_BOX) {
    warnings.push({ 
      field: 'dimensions', 
      message: `單箱體積 ${cbmPerBox.toFixed(3)}m³ 異常，請確認尺寸輸入` 
    });
  }

  // 3. 空運/快遞模式下缺少尺寸的警告
  if ((transportMode === 'air' || transportMode === 'courier') && cbmPerBox <= 0) {
    warnings.push({ 
      field: 'dimensions', 
      message: '未填寫尺寸，已以實重估算，運費可能偏低' 
    });
  }

  return { errors, warnings };
}

// 驗證整個商品列表
export function validateProducts(
  products: Product[],
  transportMode: TransportMode,
  dimensionUnit: 'mm' | 'cm',
  weightUnit: 'kg' | 'g'
): ValidationState {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];

  products.forEach((product, index) => {
    const validation = validateProduct(product, transportMode, dimensionUnit, weightUnit);
    
    // 為每個錯誤和警告添加產品索引信息
    validation.errors.forEach(error => {
      allErrors.push({
        field: `product_${index}_${error.field}`,
        message: `商品 ${index + 1}: ${error.message}`
      });
    });

    validation.warnings.forEach(warning => {
      allWarnings.push({
        field: `product_${index}_${warning.field}`,
        message: `商品 ${index + 1}: ${warning.message}`
      });
    });
  });

  return { errors: allErrors, warnings: allWarnings };
}

// 檢查是否可以出報價
export function canGenerateQuote(validationState: ValidationState): boolean {
  return validationState.errors.length === 0;
}

// 獲取驗證摘要
export function getValidationSummary(validationState: ValidationState): {
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
} {
  return {
    hasErrors: validationState.errors.length > 0,
    hasWarnings: validationState.warnings.length > 0,
    errorCount: validationState.errors.length,
    warningCount: validationState.warnings.length
  };
}
