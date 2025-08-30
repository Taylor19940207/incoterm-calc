# 國際貿易報價計算器 - 優化改進說明

## 🚀 主要優化內容

### 1. **代碼結構重構**
- **組件化設計**：將大型單一組件拆分成多個可重用的小組件
- **類型分離**：將類型定義集中到 `src/types/index.ts`
- **工具函數分離**：將計算邏輯移到 `src/utils/calculations.ts`
- **多語言分離**：將字典移到 `src/data/dictionary.ts`

### 2. **性能優化**
- **React.memo**：使用 `memo` 包裝組件，避免不必要的重新渲染
- **useCallback**：優化函數引用，減少子組件重新渲染
- **useMemo**：緩存計算結果，避免重複計算
- **自定義 Hook**：`useLocalStorage` 統一處理本地儲存邏輯

### 3. **新增組件**

#### `InputField` 組件
```typescript
// 可重用的輸入欄位組件
<InputField
  name="price"
  label="價格"
  value={value}
  onChange={handleChange}
  unit="JPY"
  disabled={false}
  note="說明文字"
/>
```

#### `ProductItem` 組件
```typescript
// 商品項目組件，支援多品項輸入
<ProductItem
  index={0}
  product={product}
  currency="JPY"
  onUpdate={updateProduct}
  t={t}
/>
```

### 4. **自定義 Hook**

#### `useLocalStorage`
```typescript
// 統一處理本地儲存，支援錯誤處理
const [inputs, setInputs] = useLocalStorage<Inputs>("incoterm_calc_v4.4", defaultInputs);
```

### 5. **工具函數優化**

#### 計算邏輯分離
- `calculateQuote()`：主要報價計算邏輯
- `calculateDerivedValues()`：衍生值計算
- `segmentsToAdd()`：貿易條件路徑計算

## 📊 性能提升

### 渲染優化
- **減少重新渲染**：使用 `memo` 和 `useCallback` 減少不必要的組件更新
- **計算緩存**：使用 `useMemo` 緩存複雜計算結果
- **條件渲染**：只在需要時渲染相關組件

### 記憶體優化
- **函數引用穩定**：避免每次渲染都創建新的函數
- **對象引用穩定**：減少不必要的對象創建

## 🛠 使用方式

### 切換到優化版本
```typescript
// 在 index.tsx 中
import IncotermQuoteCalculatorOptimized from './AppOptimized';

// 替換原來的 App 組件
root.render(
  <React.StrictMode>
    <IncotermQuoteCalculatorOptimized />
  </React.StrictMode>
);
```

### 組件使用範例
```typescript
// 使用 InputField 組件
<InputField
  name="inlandToPort"
  label={t.inlandToPort}
  value={getDisplayValue("inlandToPort")}
  onChange={setFromDisplay}
  unit={inputs.currency}
  disabled={calc.need_EXW_to_FOB === false}
  note={calc.need_EXW_to_FOB === false ? t.notApplicable : t.includeNote}
/>

// 使用 ProductItem 組件
<ProductItem
  key={i}
  index={i}
  product={item}
  currency={inputs.currency}
  onUpdate={updateProduct}
  t={t}
/>
```

## 🔧 開發建議

### 1. **進一步優化**
- 考慮使用 `React.lazy()` 進行代碼分割
- 添加錯誤邊界處理
- 實現虛擬滾動（如果商品數量很多）

### 2. **測試**
- 添加單元測試
- 添加整合測試
- 性能測試

### 3. **可訪問性**
- 添加 ARIA 標籤
- 鍵盤導航支援
- 螢幕閱讀器支援

## 📈 預期效果

1. **更快的響應速度**：減少不必要的重新渲染
2. **更好的用戶體驗**：更流暢的交互
3. **更容易維護**：代碼結構更清晰
4. **更好的擴展性**：組件化設計便於功能擴展

## 🎯 下一步計劃

1. **添加單元測試**
2. **實現代碼分割**
3. **添加錯誤處理**
4. **優化移動端體驗**
5. **添加更多貿易條件支援**

