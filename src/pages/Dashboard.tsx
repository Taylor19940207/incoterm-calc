import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Package,
  Eye,
  Edit,
  Calendar,
  User
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuotes } from '../repo/RepoProvider';
import { QuoteStats, TrendData, CostShare, Quote } from '../types/db';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const quotes = useQuotes();
  
  // 真實數據狀態
  const [stats, setStats] = useState<QuoteStats>({
    totalQuotes: 0,
    openQuotes: 0,
    avgMarginPct: 0,
    quotedValue: 0,
    pendingShipments: 0,
    winRate: 0
  });

  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [costShareData, setCostShareData] = useState<CostShare[]>([]);
  const [loading, setLoading] = useState(true);

  // 載入數據
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Dashboard: Loading data...');
        
        const [statsData, recentData, trendDataResult, costShareResult] = await Promise.all([
          quotes.getStats(),
          quotes.getRecentQuotes(5),
          quotes.getTrendData(30),
          quotes.getCostShareData()
        ]);
        
        console.log('Dashboard: Loaded data:', {
          stats: statsData,
          recent: recentData.length,
          trend: trendDataResult.length,
          costShare: costShareResult.length
        });
        
        setStats(statsData);
        setRecentQuotes(recentData);
        setTrendData(trendDataResult);
        setCostShareData(costShareResult);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quotes]);

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
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-600 mt-1">報價系統總覽與關鍵指標</p>
        </div>
        <button
          onClick={() => navigate('/quotes/new')}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 w-fit"
        >
          <FileText className="mr-2 h-5 w-5" />
          新增報價
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">開放報價數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openQuotes}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均毛利率</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgMarginPct.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總報價金額</p>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  // 使用第一個報價的貨幣，如果沒有則使用 JPY
                  const firstQuote = recentQuotes[0];
                  const currency = firstQuote?.inputs?.currency || 'JPY';
                  return `${currency} ${stats.quotedValue.toLocaleString()}`;
                })()}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-xl shadow-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">待出貨</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingShipments}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl shadow-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 報價趨勢圖 */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50 min-w-0 hover:shadow-xl transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">報價趨勢</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'count' ? `${value} 筆` : `$${value.toLocaleString()}`,
                  name === 'count' ? '報價數量' : '報價金額'
                ]}
              />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="totalQuote" stroke="#10B981" strokeWidth={2} />
            </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 費用結構占比 */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/50 min-w-0 hover:shadow-xl transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">費用結構占比</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costShareData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {costShareData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, '占比']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              />
            </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {costShareData.map((item, index) => (
              <div key={index} className="flex items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div 
                  className="w-4 h-4 rounded-full mr-3 shadow-sm border border-white" 
                  style={{ 
                    backgroundColor: item.color,
                    boxShadow: `0 2px 4px ${item.color}30`
                  }}
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="ml-2 text-gray-500">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Quotes Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 min-w-0 hover:shadow-xl transition-all duration-200">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">最近報價</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">客戶</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">貿易條件</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">報價金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">毛利率</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">建立時間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quote?.meta?.customerName || '未知'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote?.inputs?.incotermTo || '未知'}</td>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote?.status || 'draft')}`}>
                      {getStatusText(quote?.status || 'draft')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {quote?.createdAt ? new Date(quote.createdAt).toLocaleDateString('zh-TW') : '未知'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/quotes/${quote?.id}`)}
                        className="text-blue-600 hover:text-blue-900 flex items-center px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </button>
                      <button
                        onClick={() => navigate(`/quotes/${quote?.id}/edit`)}
                        className="text-gray-600 hover:text-gray-900 flex items-center px-2 py-1 rounded-lg hover:bg-gray-50 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        編輯
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;