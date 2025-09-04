import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, TransportMode } from '../types';

// 預設偏好
const DEFAULT_PREFERENCES: UserPreferences = {
  dimensionUnit: 'mm',
  weightUnit: 'kg',
  defaultTransport: 'air',
  divisorOverrides: {
    air: 6000,
    courier: 5000,
    sea: null,
    truck: 6000
  },
  showAdvanced: false,
  rounding: { cbm: 3, weight: 2 },
  currency: 'JPY'
};

// 舊版本偏好 key（用於遷移）
const OLD_PREFERENCES_KEY = 'incoterm_calc_preferences';

// 新版本偏好 key
const NEW_PREFERENCES_KEY = 'incoterm:prefs:v2';

// 從舊版本遷移到新版本
function migrateOldPreferences(): UserPreferences {
  try {
    const oldPrefs = localStorage.getItem(OLD_PREFERENCES_KEY);
    if (!oldPrefs) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(oldPrefs);
    
    // 映射舊版本到新版本
    return {
      dimensionUnit: parsed.dimensionUnit || 'mm',
      weightUnit: parsed.weightUnit || 'kg',
      defaultTransport: parsed.defaultTransport || 'air',
      divisorOverrides: {
        air: 6000,
        courier: 5000,
        sea: null,
        truck: 6000
      },
      showAdvanced: parsed.showAdvanced || false,
      rounding: { cbm: 3, weight: 2 },
      currency: parsed.currency || 'JPY'
    };
  } catch (error) {
    console.warn('Failed to migrate old preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

// 讀取偏好
function loadPreferences(): UserPreferences {
  try {
    // 先嘗試讀取新版本
    const newPrefs = localStorage.getItem(NEW_PREFERENCES_KEY);
    if (newPrefs) {
      return JSON.parse(newPrefs);
    }

    // 如果沒有新版本，嘗試遷移舊版本
    const migratedPrefs = migrateOldPreferences();
    
    // 保存遷移後的偏好到新 key
    localStorage.setItem(NEW_PREFERENCES_KEY, JSON.stringify(migratedPrefs));
    
    // 清理舊版本
    localStorage.removeItem(OLD_PREFERENCES_KEY);
    
    return migratedPrefs;
  } catch (error) {
    console.warn('Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

// 保存偏好
function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(NEW_PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初始化時載入偏好
  useEffect(() => {
    const loadedPrefs = loadPreferences();
    setPreferences(loadedPrefs);
    setIsLoaded(true);
  }, []);

  // 更新偏好
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, ...updates };
      savePreferences(newPrefs);
      return newPrefs;
    });
  }, []);

  // 重置偏好
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
  }, []);

  // 更新特定偏好
  const updateDimensionUnit = useCallback((unit: 'mm' | 'cm') => {
    updatePreferences({ dimensionUnit: unit });
  }, [updatePreferences]);

  const updateWeightUnit = useCallback((unit: 'kg' | 'g') => {
    updatePreferences({ weightUnit: unit });
  }, [updatePreferences]);

  const updateDefaultTransport = useCallback((mode: TransportMode) => {
    updatePreferences({ defaultTransport: mode });
  }, [updatePreferences]);

  const updateDivisorOverride = useCallback((mode: TransportMode, value: number | null) => {
    updatePreferences({
      divisorOverrides: {
        ...preferences.divisorOverrides,
        [mode]: value
      }
    });
  }, [preferences.divisorOverrides, updatePreferences]);

  const toggleAdvanced = useCallback(() => {
    updatePreferences({ showAdvanced: !preferences.showAdvanced });
  }, [preferences.showAdvanced, updatePreferences]);

  const updateRounding = useCallback((type: 'cbm' | 'weight', value: number) => {
    updatePreferences({
      rounding: {
        ...preferences.rounding,
        [type]: value
      }
    });
  }, [preferences.rounding, updatePreferences]);

  const updateCurrency = useCallback((currency: string) => {
    updatePreferences({ currency });
  }, [updatePreferences]);

  return {
    preferences,
    isLoaded,
    updatePreferences,
    resetPreferences,
    updateDimensionUnit,
    updateWeightUnit,
    updateDefaultTransport,
    updateDivisorOverride,
    toggleAdvanced,
    updateRounding,
    updateCurrency
  };
}
