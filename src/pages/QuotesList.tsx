import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  MoreVertical,
  CheckCircle,
  Send,
  XCircle
} from 'lucide-react';
import { useQuotes } from '../repo/RepoProvider';
import { Quote } from '../types/db';
import { useLanguage } from '../contexts/LanguageContext';

const QuotesList: React.FC = () => {
  const navigate = useNavigate();
  const quotes = useQuotes();
  
  // 使用全局語言 Context
  const { lang, t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [quotesList, setQuotesList] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // 載入報價列表
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setLoading(true);
        const allQuotes = await quotes.list();
        setQuotesList(allQuotes);
      } catch (error) {
        console.error('載入報價列表失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, [quotes]);

  const deleteQuote = async (id: string) => {
    if (window.confirm('確定要刪除這筆報價嗎？')) {
      try {
        await quotes.remove(id);
        // 重新載入列表
        const updatedQuotes = await quotes.list();
        setQuotesList(updatedQuotes);
        alert('報價已刪除');
      } catch (error) {
        console.error('刪除報價失敗:', error);
        alert('刪除失敗，請重試');
      }
    }
  };

  const updateQuoteStatus = async (id: string, newStatus: 'draft' | 'sent' | 'won' | 'lost') => {
    try {
      await quotes.update(id, { status: newStatus });
      // 重新載入列表
      const updatedQuotes = await quotes.list();
      setQuotesList(updatedQuotes);
      alert('狀態已更新');
    } catch (error) {
      console.error('更新狀態失敗:', error);
      alert('狀態更新失敗，請重試');
    }
  };

  const filteredQuotes = quotesList.filter(quote => {
    const matchesSearch = (quote?.meta?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (quote?.inputs?.incotermTo?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || quote?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      case 'draft': return t['草稿'] || '草稿';
      case 'sent': return t['已發送'] || '已發送';
      case 'won': return t['已成交'] || '已成交';
      case 'lost': return t['已流失'] || '已流失';
      default: return status;
    }
  };

  const getTotalStats = () => {
    const total = filteredQuotes.length;
    const totalValue = filteredQuotes.reduce((sum, q) => sum + (q?.derived?.totals?.totalQuote || 0), 0);
    const avgMargin = filteredQuotes.length > 0 
      ? filteredQuotes.reduce((sum, q) => {
          const totalQuote = q?.derived?.totals?.totalQuote || 0;
          const totalCost = q?.derived?.totals?.shipmentCostInclGoods || 0;
          const actualMargin = totalQuote > 0 ? (totalQuote - totalCost) / totalQuote * 100 : 0;
          return sum + actualMargin;
        }, 0) / filteredQuotes.length 
      : 0;
    
    return { total, totalValue, avgMargin };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t['載入報價列表中...'] || '載入報價列表中...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t['報價管理'] || '報價管理'}</h1>
          <p className="text-gray-600">{t['管理所有報價單據'] || '管理所有報價單據'}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/quotes/new')}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t['新增報價'] || '新增報價'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t['總報價數'] || '總報價數'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t['總報價金額'] || '總報價金額'}</p>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  // 使用第一個報價的貨幣，如果沒有則使用 JPY
                  const firstQuote = filteredQuotes[0];
                  const currency = firstQuote?.inputs?.currency || 'JPY';
                  return `${currency} ${stats.totalValue.toLocaleString()}`;
                })()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t['平均毛利率'] || '平均毛利率'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgMargin.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t['搜尋客戶名稱或貿易條件...'] || '搜尋客戶名稱或貿易條件...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t['全部狀態'] || '全部狀態'}</option>
              <option value="draft">{t['草稿'] || '草稿'}</option>
              <option value="sent">{t['已發送'] || '已發送'}</option>
              <option value="won">{t['已成交'] || '已成交'}</option>
              <option value="lost">{t['已流失'] || '已流失'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t['客戶'] || '客戶'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t['貿易條件'] || '貿易條件'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t['報價金額'] || '報價金額'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t['毛利率'] || '毛利率'}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t['狀態'] || '狀態'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t['建立時間'] || '建立時間'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t['操作'] || '操作'}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quote?.meta?.customerName || (t['未知'] || '未知')}</div>
                        <div className="text-sm text-gray-500">#{quote?.code || (t['未知'] || '未知')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote?.inputs?.incotermTo || (t['未知'] || '未知')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(() => {
                      const currency = quote?.inputs?.currency || 'JPY';
                      const amount = quote?.derived?.totals?.totalQuote || 0;
                      return `${currency} ${amount.toLocaleString()}`;
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(() => {
                      const totalQuote = quote?.derived?.totals?.totalQuote || 0;
                      const totalCost = quote?.derived?.totals?.shipmentCostInclGoods || 0;
                      if (totalQuote > 0) {
                        return ((totalQuote - totalCost) / totalQuote * 100).toFixed(1);
                      }
                      return '0.0';
                    })()}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-full">
                    <div className="w-full flex items-center justify-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote?.status || 'draft')}`}>
                        {getStatusText(quote?.status || 'draft')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {quote?.createdAt || '未知'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/quotes/${quote?.id}`)}
                        className="text-blue-600 hover:text-blue-900 flex items-center px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t['查看'] || '查看'}
                      </button>
                      <button
                        onClick={() => navigate(`/quotes/${quote?.id}/edit`)}
                        className="text-gray-600 hover:text-gray-900 flex items-center px-2 py-1 rounded-lg hover:bg-gray-50 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t['編輯'] || '編輯'}
                      </button>
                      
                      {/* 狀態更新按鈕 */}
                      {quote?.status === 'draft' && (
                        <button
                          onClick={() => updateQuoteStatus(quote?.id || '', 'sent')}
                          className="text-green-600 hover:text-green-900 flex items-center px-2 py-1 rounded-lg hover:bg-green-50 transition-all duration-200"
                          title="發送報價"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          發送
                        </button>
                      )}
                      
                      {quote?.status === 'sent' && (
                        <>
                          <button
                            onClick={() => updateQuoteStatus(quote?.id || '', 'won')}
                            className="text-green-600 hover:text-green-900 flex items-center px-2 py-1 rounded-lg hover:bg-green-50 transition-all duration-200"
                            title="標記為成交"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            成交
                          </button>
                          <button
                            onClick={() => updateQuoteStatus(quote?.id || '', 'lost')}
                            className="text-red-600 hover:text-red-900 flex items-center px-2 py-1 rounded-lg hover:bg-red-50 transition-all duration-200"
                            title="標記為流失"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            流失
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => deleteQuote(quote?.id || '')}
                        className="text-red-600 hover:text-red-900 flex items-center px-2 py-1 rounded-lg hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t['刪除'] || '刪除'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t['沒有找到報價'] || '沒有找到報價'}</h3>
              <p className="mt-1 text-sm text-gray-500">{t['嘗試調整搜尋條件或新增報價'] || '嘗試調整搜尋條件或新增報價'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotesList;
