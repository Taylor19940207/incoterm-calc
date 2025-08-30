import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 獲取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 返回一個包裝過的 setter 函數，同時更新 localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允許 value 是一個函數，這樣我們就有和 useState 一樣的 API
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
