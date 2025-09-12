import React, { useState, useEffect, useRef } from 'react';
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
import { OrdersService } from '../services/OrdersService';
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
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openDropdown && !target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

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
      if (newStatus === 'won') {
        // 檢查是否已經有對應的訂單
        const existingOrder = OrdersService.getOrderByQuoteId(id);
        if (existingOrder) {
          alert('此報價已經有對應的訂單了');
          return;
        }
        
        // 獲取報價資料
        const quote = await quotes.get(id);
        if (!quote) {
          alert('找不到報價資料');
          return;
        }
        
        // 建立訂單（使用預設值）
        const order = OrdersService.createFromQuote(quote, {
          quoteId: quote.id,
          transportMode: 'sea',
          parties: {
            supplier: { name: quote.meta?.customerName || '供應商', contact: quote.meta?.contactInfo || '' },
            exporter: { name: '本公司', contact: '' },
            importer: { name: quote.meta?.customerName || '進口商', contact: quote.meta?.contactInfo || '' }
          },
          notes: quote.meta?.notes || ''
        });
        
        alert('報價已成交，訂單已自動建立！');
        
        // 導向新建立的訂單
        navigate(`/orders/${order.id}`);
      }
      
      await quotes.update(id, { status: newStatus });
      // 重新載入列表
      const updatedQuotes = await quotes.list();
      setQuotesList(updatedQuotes);
      
      if (newStatus !== 'won') {
        alert('狀態已更新');
      }
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

  // 選擇功能
  const handleSelectQuote = (quoteId: string) => {
    const newSelected = new Set(selectedQuotes);
    if (newSelected.has(quoteId)) {
      newSelected.delete(quoteId);
    } else {
      newSelected.add(quoteId);
    }
    setSelectedQuotes(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuotes.size === filteredQuotes.length) {
      setSelectedQuotes(new Set());
    } else {
      setSelectedQuotes(new Set(filteredQuotes.map(q => q.id)));
    }
  };

  const formatCurrency = (amount: number, currency: string = 'JPY') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 下拉選單處理
  const handleDropdownToggle = (quoteId: string) => {
    setOpenDropdown(openDropdown === quoteId ? null : quoteId);
  };

  const handleDropdownClose = () => {
    setOpenDropdown(null);
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

      {/* Batch Actions Toolbar */}
      {selectedQuotes.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-700">
                已選擇 {selectedQuotes.size} 個報價
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // 批量發送功能
                  const selectedQuotesList = quotesList.filter(q => selectedQuotes.has(q.id));
                  const draftQuotes = selectedQuotesList.filter(q => q.status === 'draft');
                  if (draftQuotes.length > 0) {
                    if (window.confirm(`確定要發送 ${draftQuotes.length} 個草稿報價嗎？`)) {
                      draftQuotes.forEach(quote => {
                        updateQuoteStatus(quote.id, 'sent');
                      });
                      setSelectedQuotes(new Set());
                    }
                  } else {
                    alert('沒有可發送的草稿報價');
                  }
                }}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                批量發送
              </button>
              <button
                onClick={() => {
                  // 批量刪除功能
                  if (window.confirm(`確定要刪除 ${selectedQuotes.size} 個報價嗎？`)) {
                    selectedQuotes.forEach(quoteId => {
                      deleteQuote(quoteId);
                    });
                    setSelectedQuotes(new Set());
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                批量刪除
              </button>
              <button
                onClick={() => setSelectedQuotes(new Set())}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
              >
                取消選擇
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedQuotes.size === filteredQuotes.length && filteredQuotes.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">報價單號</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客戶</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">貿易條件</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">報價金額</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">建立日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">到期日期</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotes.map((quote) => {
                const isSelected = selectedQuotes.has(quote.id);
                return (
                  <tr 
                    key={quote.id} 
                    className={`transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectQuote(quote.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{quote?.code || quote.id.slice(-6)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quote?.meta?.customerName || (t['未知'] || '未知')}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quote?.inputs?.incotermTo || (t['未知'] || '未知')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(
                        quote?.derived?.totals?.totalQuote || 0,
                        quote?.inputs?.currency || 'JPY'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote?.status || 'draft')}`}>
                        {getStatusText(quote?.status || 'draft')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quote?.createdAt || '')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        // 計算到期日期（建立日期 + 30天）
                        if (quote?.createdAt) {
                          const createdDate = new Date(quote.createdAt);
                          const dueDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                          return formatDate(dueDate.toISOString());
                        }
                        return '未知';
                      })()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="relative dropdown-container">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownToggle(quote.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {openDropdown === quote.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/quotes/${quote?.id}`);
                                  handleDropdownClose();
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4 mr-3" />
                                {t['查看'] || '查看'}
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/quotes/${quote?.id}/edit`);
                                  handleDropdownClose();
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4 mr-3" />
                                {t['編輯'] || '編輯'}
                              </button>
                              
                              {/* 狀態更新按鈕 */}
                              {quote?.status === 'draft' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuoteStatus(quote?.id || '', 'sent');
                                    handleDropdownClose();
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                >
                                  <Send className="h-4 w-4 mr-3" />
                                  發送
                                </button>
                              )}
                              
                              {quote?.status === 'sent' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuoteStatus(quote?.id || '', 'won');
                                      handleDropdownClose();
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-3" />
                                    成交
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuoteStatus(quote?.id || '', 'lost');
                                      handleDropdownClose();
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-3" />
                                    流失
                                  </button>
                                </>
                              )}
                              
                              <div className="border-t border-gray-100"></div>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteQuote(quote?.id || '');
                                  handleDropdownClose();
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                {t['刪除'] || '刪除'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
