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

  const handleCreateOrder = () => {
    if (!orderForm.transportMode || !orderForm.parties) {
      alert('請填寫完整的訂單資訊');
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

  const getStatusOptions = () => {
    const currentStatus = quote.status || 'draft';
    
    switch (currentStatus) {
      case 'draft':
        return [
          { value: 'sent', label: '發送報價', color: 'bg-blue-600' },
          { value: 'won', label: '報價成交', color: 'bg-green-600' },
          { value: 'lost', label: '報價流失', color: 'bg-red-600' }
        ];
      case 'sent':
        return [
          { value: 'won', label: '報價成交', color: 'bg-green-600' },
          { value: 'lost', label: '報價流失', color: 'bg-red-600' }
        ];
      case 'won':
        return [
          { value: 'lost', label: '改為流失', color: 'bg-red-600' }
        ];
      case 'lost':
        return [
          { value: 'won', label: '重新成交', color: 'bg-green-600' }
        ];
      default:
        return [];
    }
  };

  const statusOptions = getStatusOptions();

  if (statusOptions.length === 0) {
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
