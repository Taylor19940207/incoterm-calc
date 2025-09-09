import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FxPreferencesProps {
  onFxFeeChange: (fee: number) => void;
  initialFee?: number;
}

const FxPreferences: React.FC<FxPreferencesProps> = ({ onFxFeeChange, initialFee = 0 }) => {
  const { t } = useLanguage();
  const [fxFee, setFxFee] = useState(initialFee);

  useEffect(() => {
    // 從 localStorage 讀取保存的手續費設定
    const savedFee = localStorage.getItem('fx-fee-percentage');
    if (savedFee) {
      const fee = parseFloat(savedFee);
      setFxFee(fee);
      onFxFeeChange(fee);
    }
  }, [onFxFeeChange]);

  const handleFeeChange = (fee: number) => {
    setFxFee(fee);
    onFxFeeChange(fee);
    localStorage.setItem('fx-fee-percentage', fee.toString());
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">匯率手續費設定</h4>
      <div className="space-y-2">
        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-600">手續費百分比:</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={fxFee}
            onChange={(e) => handleFeeChange(parseFloat(e.target.value) || 0)}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-500">%</span>
        </div>
        <div className="text-xs text-gray-500">
          建議設定: 0.5% (銀行匯差) - 2% (手續費)
        </div>
      </div>
    </div>
  );
};

export default FxPreferences;
