import React, { useState } from 'react';
import { Quote } from '../types/db';
import { OrdersService } from '../services/OrdersService';
import { CreateOrderInput } from '../types/order';

interface QuoteStatusManagerProps {
  quote: Quote;
  onStatusChange: (newStatus: string) => void;
  onOrderCreated?: (orderId: string) => void;
}

const QuoteStatusManager: React.FC<QuoteStatusManagerProps> = ({ 
  quote, 
  onStatusChange, 
  onOrderCreated 
}) => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState<Partial<CreateOrderInput>>({
    transportMode: 'sea',
    parties: {
      supplier: { name: '', contact: '' },
      exporter: { name: '', contact: '' },
      importer: { name: '', contact: '' }
    },
    plan: {
      estPickupAt: '',
      estPortETD: '',
      estPortETA: '',
      estDeliveryAt: ''
    }
  });

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'won') {
      // 檢查是否已經有對應的訂單
      const existingOrder = OrdersService.getOrderByQuoteId(quote.id);
      if (existingOrder) {
        alert('此報價已經有對應的訂單了');
        return;
      }
      
      // 顯示建立訂單的表單
      setShowOrderForm(true);
      return;
    }
    
    onStatusChange(newStatus);
  };

  // 日期驗證函數
  const validateDates = () => {
    const { estPickupAt, estPortETD, estPortETA, estDeliveryAt } = orderForm.plan || {};
    
    // 必填欄位檢查
    if (!estPickupAt || !estPortETD) {
      alert('請填寫預計提貨日期和預計離港日期（必填）');
      return false;
    }
    
    // 日期順序驗證
    const pickup = new Date(estPickupAt);
    const etd = new Date(estPortETD);
    
    if (pickup > etd) {
      alert('預計提貨日期不能晚於預計離港日期');
      return false;
    }
    
    if (estPortETA) {
      const eta = new Date(estPortETA);
      if (etd > eta) {
        alert('預計離港日期不能晚於預計到港日期');
        return false;
      }
    }
    
    if (estDeliveryAt) {
      const delivery = new Date(estDeliveryAt);
      if (estPortETA && new Date(estPortETA) > delivery) {
        alert('預計到港日期不能晚於預計送達日期');
        return false;
      }
    }
    
    return true;
  };

  // 一鍵推算功能
  const calculateDates = () => {
    const { estPickupAt, estPortETD, estPortETA } = orderForm.plan || {};
    
    if (estPickupAt && !estPortETD) {
      // ETD = Pickup + 2天（預設）
      const pickup = new Date(estPickupAt);
      pickup.setDate(pickup.getDate() + 2);
      setOrderForm(prev => ({
        ...prev,
        plan: { ...prev.plan!, estPortETD: pickup.toISOString().split('T')[0] }
      }));
    }
    
    if (estPortETD && !estPortETA) {
      // ETA = ETD + 海運天數（預設14天）
      const etd = new Date(estPortETD);
      etd.setDate(etd.getDate() + 14);
      setOrderForm(prev => ({
        ...prev,
        plan: { ...prev.plan!, estPortETA: etd.toISOString().split('T')[0] }
      }));
    }
    
    if (estPortETA && !orderForm.plan?.estDeliveryAt) {
      // Delivery = ETA + 內陸天數（預設3天）
      const eta = new Date(estPortETA);
      eta.setDate(eta.getDate() + 3);
      setOrderForm(prev => ({
        ...prev,
        plan: { ...prev.plan!, estDeliveryAt: eta.toISOString().split('T')[0] }
      }));
    }
  };

  const handleCreateOrder = () => {
    if (!orderForm.transportMode || !orderForm.parties) {
      alert('請填寫完整的訂單資訊');
      return;
    }

    // 驗證日期
    if (!validateDates()) {
      return;
    }

    try {
      const order = OrdersService.createFromQuote(quote, orderForm as CreateOrderInput);
      
      // 更新報價狀態為 won
      onStatusChange('won');
      
      // 通知父組件訂單已建立
      if (onOrderCreated) {
        onOrderCreated(order.id);
      }
      
      setShowOrderForm(false);
      alert('訂單已成功建立！');
    } catch (error) {
      console.error('建立訂單失敗:', error);
      alert('建立訂單失敗，請重試');
    }
  };

  // 定義狀態流轉表 - 只能依照工作流走
  const QuoteStatusFlow: Record<string, string[]> = {
    draft: ["sent"],         // 草稿只能送出
    sent: ["won", "lost"],   // 已送出只能成/敗
    won: [],                 // 成交 → 鎖定（之後轉訂單）
    lost: [],                // 流失 → 鎖定
  };

  const getStatusOptions = () => {
    const currentStatus = quote.status || 'draft';
    const allowedNext = QuoteStatusFlow[currentStatus] || [];
    
    return allowedNext.map(status => {
      switch (status) {
        case 'sent':
          return { value: 'sent', label: '發送報價', color: 'bg-blue-600' };
        case 'won':
          return { value: 'won', label: '報價成交', color: 'bg-green-600' };
        case 'lost':
          return { value: 'lost', label: '報價流失', color: 'bg-red-600' };
        default:
          return null;
      }
    }).filter((option): option is NonNullable<typeof option> => option !== null);
  };

  const statusOptions = getStatusOptions();
  const currentStatus = quote.status || 'draft';

  // 如果沒有可用的狀態變更選項，顯示狀態資訊
  if (statusOptions.length === 0) {
    if (currentStatus === 'won') {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">報價已成交</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>此報價已成交，狀態已鎖定。如需建立訂單，請使用「從報價建立訂單」功能。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentStatus === 'lost') {
      return (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">報價已流失</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>此報價已流失，狀態已鎖定。如需重新處理，請建立新的報價。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 狀態變更按鈕 */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={`px-3 py-1 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity ${option.color}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 建立訂單表單 */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">建立訂單</h3>
            
            <div className="space-y-4">
              {/* 運輸方式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">運輸方式</label>
                <select
                  value={orderForm.transportMode || 'sea'}
                  onChange={(e) => setOrderForm(prev => ({ 
                    ...prev, 
                    transportMode: e.target.value as any 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sea">海運</option>
                  <option value="air">空運</option>
                  <option value="express">快遞</option>
                  <option value="truck">陸運</option>
                </select>
              </div>

              {/* 相關方資訊 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">供應商名稱</label>
                  <input
                    type="text"
                    value={orderForm.parties?.supplier?.name || ''}
                    onChange={(e) => setOrderForm(prev => ({
                      ...prev,
                      parties: {
                        ...prev.parties!,
                        supplier: { ...prev.parties!.supplier, name: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="供應商名稱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">供應商聯絡方式</label>
                  <input
                    type="text"
                    value={orderForm.parties?.supplier?.contact || ''}
                    onChange={(e) => setOrderForm(prev => ({
                      ...prev,
                      parties: {
                        ...prev.parties!,
                        supplier: { ...prev.parties!.supplier, contact: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="聯絡方式"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">出口商名稱</label>
                  <input
                    type="text"
                    value={orderForm.parties?.exporter?.name || ''}
                    onChange={(e) => setOrderForm(prev => ({
                      ...prev,
                      parties: {
                        ...prev.parties!,
                        exporter: { ...prev.parties!.exporter, name: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="出口商名稱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">出口商聯絡方式</label>
                  <input
                    type="text"
                    value={orderForm.parties?.exporter?.contact || ''}
                    onChange={(e) => setOrderForm(prev => ({
                      ...prev,
                      parties: {
                        ...prev.parties!,
                        exporter: { ...prev.parties!.exporter, contact: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="聯絡方式"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">進口商名稱</label>
                  <input
                    type="text"
                    value={orderForm.parties?.importer?.name || ''}
                    onChange={(e) => setOrderForm(prev => ({
                      ...prev,
                      parties: {
                        ...prev.parties!,
                        importer: { ...prev.parties!.importer, name: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="進口商名稱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">進口商聯絡方式</label>
                  <input
                    type="text"
                    value={orderForm.parties?.importer?.contact || ''}
                    onChange={(e) => setOrderForm(prev => ({
                      ...prev,
                      parties: {
                        ...prev.parties!,
                        importer: { ...prev.parties!.importer, contact: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="聯絡方式"
                  />
                </div>
              </div>

              {/* 重要日期 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">重要日期</label>
                  <button
                    type="button"
                    onClick={calculateDates}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    一鍵推算
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      預計提貨 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={orderForm.plan?.estPickupAt || ''}
                      onChange={(e) => setOrderForm(prev => ({
                        ...prev,
                        plan: { ...prev.plan!, estPickupAt: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      預計離港 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={orderForm.plan?.estPortETD || ''}
                      onChange={(e) => setOrderForm(prev => ({
                        ...prev,
                        plan: { ...prev.plan!, estPortETD: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">預計到港</label>
                    <input
                      type="date"
                      value={orderForm.plan?.estPortETA || ''}
                      onChange={(e) => setOrderForm(prev => ({
                        ...prev,
                        plan: { ...prev.plan!, estPortETA: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">預計送達</label>
                    <input
                      type="date"
                      value={orderForm.plan?.estDeliveryAt || ''}
                      onChange={(e) => setOrderForm(prev => ({
                        ...prev,
                        plan: { ...prev.plan!, estDeliveryAt: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-red-500">*</span> 必填欄位。日期順序：提貨 ≤ 離港 ≤ 到港 ≤ 送達
                </p>
              </div>

              {/* 備註 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">備註</label>
                <textarea
                  value={orderForm.notes || ''}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="訂單備註"
                />
              </div>
            </div>

            {/* 按鈕 */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowOrderForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                建立訂單
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteStatusManager;
