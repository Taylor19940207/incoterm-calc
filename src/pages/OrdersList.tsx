import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../types/order';
import { OrdersService } from '../services/OrdersService';
import { Search, Filter, Plus, Eye, Calendar, Package, Truck } from 'lucide-react';

const OrdersList: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = OrdersService.getAllOrders();
    setOrders(allOrders);
    setLoading(false);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.parties.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.parties.importer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'accepted': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'booked': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'customs_ready': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'shipped': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'arrived': return 'bg-teal-50 text-teal-700 border border-teal-200';
      case 'completed': return 'bg-gray-50 text-gray-700 border border-gray-200';
      case 'canceled': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'accepted': return '已接受';
      case 'booked': return '已訂艙';
      case 'customs_ready': return '報關就緒';
      case 'shipped': return '已出貨';
      case 'arrived': return '已到港';
      case 'completed': return '已完成';
      case 'canceled': return '已取消';
      default: return status;
    }
  };

  const getTransportModeText = (mode: string) => {
    switch (mode) {
      case 'sea': return '海運';
      case 'air': return '空運';
      case 'express': return '快遞';
      case 'truck': return '陸運';
      default: return mode;
    }
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'sea': return <Package className="h-4 w-4" />;
      case 'air': return <Truck className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (order: Order) => {
    const statusFlow = ['accepted', 'booked', 'customs_ready', 'shipped', 'arrived', 'completed'];
    const currentIndex = statusFlow.indexOf(order.status);
    return ((currentIndex + 1) / statusFlow.length) * 100;
  };

  const getUrgentTasks = (order: Order) => {
    const now = new Date();
    return order.tasks.filter(task => {
      if (task.status === 'done') return false;
      if (!task.dueAt) return false;
      const dueDate = new Date(task.dueAt);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0;
    }).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入訂單列表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">訂單管理</h1>
          <p className="text-gray-600">管理您的訂單流程和進度</p>
        </div>
        <button
          onClick={() => navigate('/quotes')}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          從報價建立訂單
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '總訂單數', value: orders.length, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
          { label: '進行中', value: orders.filter(o => !['completed', 'canceled'].includes(o.status)).length, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
          { label: '已完成', value: orders.filter(o => o.status === 'completed').length, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
          { label: '緊急任務', value: orders.reduce((sum, o) => sum + getUrgentTasks(o), 0), color: 'bg-gradient-to-br from-amber-500 to-amber-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
              <div className={`w-16 h-16 rounded-xl ${stat.color} flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-xl">{stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋訂單編號、供應商或進口商..."
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
              <option value="all">全部狀態</option>
              <option value="accepted">已接受</option>
              <option value="booked">已訂艙</option>
              <option value="customs_ready">報關就緒</option>
              <option value="shipped">已出貨</option>
              <option value="arrived">已到港</option>
              <option value="completed">已完成</option>
              <option value="canceled">已取消</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">訂單編號</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">貿易條件</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">運輸方式</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">供應商</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">進口商</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">進度</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">建立時間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.code}</div>
                    <div className="text-sm text-gray-500">{order.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.incotermFrom} → {order.incotermTo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      {getTransportIcon(order.transportMode)}
                      <span className="ml-2">{getTransportModeText(order.transportMode)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.parties.supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.parties.importer.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full shadow-sm" 
                          style={{ width: `${getProgressPercentage(order)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500 font-medium">
                        {Math.round(getProgressPercentage(order))}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full flex items-center justify-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString('zh-TW')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到訂單</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? '請調整搜尋條件或篩選器' 
                : '開始建立您的第一個訂單'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
