import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuotes } from '../repo/RepoProvider';
import { Quote } from '../types/db';
import { Edit, ArrowLeft, Copy, Trash2 } from 'lucide-react';

const QuoteView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quotes = useQuotes();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadQuote = async () => {
        try {
          setLoading(true);
          const quoteData = await quotes.get(id);
          if (quoteData) {
            setQuote(quoteData);
          } else {
            alert('找不到指定的報價');
            navigate('/quotes');
          }
        } catch (error) {
          console.error('載入報價失敗:', error);
          alert('載入報價失敗');
        } finally {
          setLoading(false);
        }
      };
      loadQuote();
    }
  }, [id, quotes, navigate]);

  const handleDuplicate = async () => {
    if (!quote) return;
    
    try {
      const duplicated = await quotes.duplicate(quote.id);
      alert('報價已複製！');
      navigate(`/quotes/${duplicated.id}/edit`);
    } catch (error) {
      console.error('複製報價失敗:', error);
      alert('複製失敗，請重試');
    }
  };

  const handleDelete = async () => {
    if (!quote) return;
    
    if (window.confirm('確定要刪除這筆報價嗎？')) {
      try {
        await quotes.remove(quote.id);
        alert('報價已刪除');
        navigate('/quotes');
      } catch (error) {
        console.error('刪除報價失敗:', error);
        alert('刪除失敗，請重試');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'sent': return '已發送';
      case 'won': return '已成交';
      case 'lost': return '已流失';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入報價中...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入報價中...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">找不到報價</h2>
          <p className="mt-2 text-gray-600">請檢查報價 ID 是否正確</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/quotes')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            返回列表
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              報價 #{quote?.code || '未知'}
            </h1>
            <p className="text-gray-600">
              客戶：{quote?.meta?.customerName || '未知'} | 建立時間：{quote?.createdAt ? new Date(quote.createdAt).toLocaleString('zh-TW') : '未知'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(quote?.status || 'draft')}`}>
            {getStatusText(quote?.status || 'draft')}
          </span>
          <button
            onClick={handleDuplicate}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Copy className="h-4 w-4 mr-2" />
            複製
          </button>
          {quote?.status === 'draft' && (
            <button
              onClick={() => navigate(`/quotes/${quote?.id}/edit`)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              編輯
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            刪除
          </button>
        </div>
      </div>

      {/* Quote Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">客戶名稱</label>
                <p className="mt-1 text-sm text-gray-900">{quote?.meta?.customerName || '未知'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">聯絡資訊</label>
                <p className="mt-1 text-sm text-gray-900">{quote?.meta?.contactInfo || '未提供'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">付款條件</label>
                <p className="mt-1 text-sm text-gray-900">{quote?.meta?.paymentTerms || '未設定'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">有效期</label>
                <p className="mt-1 text-sm text-gray-900">{quote?.meta?.validUntil || '未設定'}</p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">商品清單</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">商品名稱</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">數量</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">單價</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">總價</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(quote?.derived?.items || []).map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.inputMode === 'perBox' 
                          ? `${item.orderBoxes} 箱 (${item.boxQuantity} 件/箱)`
                          : `${item.totalQuantity} 件`
                        }
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        ${item.inputMode === 'perBox' ? item.boxPrice : item.unitPrice}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        ${item.totalProductValue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">報價摘要</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">商品總值</span>
                <span className="text-sm font-medium">${quote?.derived?.totals?.totalGoodsValue?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">出口費用</span>
                <span className="text-sm font-medium">${quote?.derived?.totals?.totalExportCosts?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">運費含貨</span>
                <span className="text-sm font-medium">${quote?.derived?.totals?.shipmentCostInclGoods?.toLocaleString() || '0'}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">總報價</span>
                  <span className="text-base font-bold text-blue-600">${quote?.derived?.totals?.totalQuote?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600">預估利潤</span>
                  <span className="text-sm font-medium text-green-600">${quote?.derived?.totals?.totalProfit?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600">毛利率</span>
                  <span className="text-sm font-medium text-green-600">
                    {(() => {
                      const totalQuote = quote?.derived?.totals?.totalQuote || 0;
                      const totalCost = quote?.derived?.totals?.shipmentCostInclGoods || 0;
                      if (totalQuote > 0) {
                        return ((totalQuote - totalCost) / totalQuote * 100).toFixed(1);
                      }
                      return '0.0';
                    })()}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">時間記錄</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">建立時間：</span>
                <span className="text-gray-900">{quote?.createdAt ? new Date(quote.createdAt).toLocaleString('zh-TW') : '未知'}</span>
              </div>
              <div>
                <span className="text-gray-600">最後更新：</span>
                <span className="text-gray-900">{quote?.updatedAt ? new Date(quote.updatedAt).toLocaleString('zh-TW') : '未知'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteView;
