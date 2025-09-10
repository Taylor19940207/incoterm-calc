import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order, Task, DocRef, OrderStatus, TaskStatus, DocStatus } from '../types/order';
import { OrdersService } from '../services/OrdersService';
import { ArrowLeft, Calendar, CheckCircle, Clock, AlertCircle, FileText, Upload, Plus } from 'lucide-react';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plan' | 'tasks' | 'docs'>('plan');

  useEffect(() => {
    if (id) {
      const orderData = OrdersService.getOrder(id);
      setOrder(orderData);
      setLoading(false);
    }
  }, [id]);

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!order) return;
    
    const updatedOrder = OrdersService.updateOrderStatus(order.id, newStatus);
    if (updatedOrder) {
      setOrder(updatedOrder);
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (!order) return;
    
    const updatedOrder = OrdersService.updateTaskStatus(order.id, taskId, newStatus);
    if (updatedOrder) {
      setOrder(updatedOrder);
    }
  };

  const handleDocStatusChange = (docId: string, newStatus: DocStatus, url?: string) => {
    if (!order) return;
    
    const updatedOrder = OrdersService.updateDocStatus(order.id, docId, newStatus, url);
    if (updatedOrder) {
      setOrder(updatedOrder);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'booked': return 'bg-purple-100 text-purple-800';
      case 'customs_ready': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'arrived': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getTaskStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'doing': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return '待辦';
      case 'doing': return '進行中';
      case 'done': return '已完成';
      case 'blocked': return '受阻';
      default: return status;
    }
  };

  const getDocStatusColor = (status: DocStatus) => {
    switch (status) {
      case 'missing': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'final': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocStatusText = (status: DocStatus) => {
    switch (status) {
      case 'missing': return '缺失';
      case 'draft': return '草稿';
      case 'review': return '審核中';
      case 'final': return '最終版';
      default: return status;
    }
  };

  const getDocTypeText = (type: string) => {
    switch (type) {
      case 'PI': return '形式發票';
      case 'Invoice': return '商業發票';
      case 'PackingList': return '裝箱單';
      case 'BL': return '海運提單';
      case 'AWB': return '航空提單';
      case 'CO': return '產地證';
      case 'Fumigation': return '燻蒸證';
      case 'Insurance': return '保險單';
      case 'Others': return '其他文件';
      default: return type;
    }
  };

  const getAssigneeText = (assignee: string) => {
    switch (assignee) {
      case 'buyer': return '買方';
      case 'exporter': return '出口商';
      case 'forwarder': return '貨代';
      case 'importer': return '進口商';
      case 'supplier': return '供應商';
      default: return assignee;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: OrderStatus[] = ['accepted', 'booked', 'customs_ready', 'shipped', 'arrived', 'completed'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入訂單中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">找不到訂單</h2>
          <p className="mt-2 text-gray-600">請檢查訂單 ID 是否正確</p>
        </div>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            返回訂單列表
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              訂單 {order.code}
            </h1>
            <p className="text-gray-600">
              {order.incotermFrom} → {order.incotermTo} | {order.transportMode === 'sea' ? '海運' : '空運'} | {order.currency}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
          {nextStatus && (
            <button
              onClick={() => handleStatusChange(nextStatus)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              下一步: {getStatusText(nextStatus)}
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">訂單進度</h3>
        <div className="flex items-center space-x-4">
          {['accepted', 'booked', 'customs_ready', 'shipped', 'arrived', 'completed'].map((status, index) => {
            const isActive = status === order.status;
            const isCompleted = ['accepted', 'booked', 'customs_ready', 'shipped', 'arrived', 'completed'].indexOf(order.status) > index;
            
            return (
              <React.Fragment key={status}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : 
                     isActive ? <Clock className="h-5 w-5" /> : 
                     <AlertCircle className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                    {getStatusText(status as OrderStatus)}
                  </span>
                </div>
                {index < 5 && (
                  <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'plan', label: '計畫', icon: Calendar },
              { id: 'tasks', label: '任務', icon: CheckCircle },
              { id: 'docs', label: '文件', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Plan Tab */}
          {activeTab === 'plan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">相關方資訊</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">供應商</label>
                      <p className="text-sm text-gray-900">{order.parties.supplier.name}</p>
                      {order.parties.supplier.contact && (
                        <p className="text-xs text-gray-500">{order.parties.supplier.contact}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">出口商</label>
                      <p className="text-sm text-gray-900">{order.parties.exporter.name}</p>
                      {order.parties.exporter.contact && (
                        <p className="text-xs text-gray-500">{order.parties.exporter.contact}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">進口商</label>
                      <p className="text-sm text-gray-900">{order.parties.importer.name}</p>
                      {order.parties.importer.contact && (
                        <p className="text-xs text-gray-500">{order.parties.importer.contact}</p>
                      )}
                    </div>
                    {order.parties.forwarder && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600">貨代</label>
                        <p className="text-sm text-gray-900">{order.parties.forwarder.name}</p>
                        {order.parties.forwarder.contact && (
                          <p className="text-xs text-gray-500">{order.parties.forwarder.contact}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">重要日期</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">預計提貨</label>
                      <p className="text-sm text-gray-900">{order.plan.estPickupAt || '未設定'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">預計離港</label>
                      <p className="text-sm text-gray-900">{order.plan.estPortETD || '未設定'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">預計到港</label>
                      <p className="text-sm text-gray-900">{order.plan.estPortETA || '未設定'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">預計送達</label>
                      <p className="text-sm text-gray-900">{order.plan.estDeliveryAt || '未設定'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">任務清單</h4>
                <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  新增任務
                </button>
              </div>
              <div className="space-y-3">
                {order.tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>負責人: {getAssigneeText(task.assignee || '')}</span>
                          {task.dueAt && (
                            <span>截止: {new Date(task.dueAt).toLocaleDateString('zh-TW')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>
                          {getTaskStatusText(task.status)}
                        </span>
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value as TaskStatus)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="todo">待辦</option>
                          <option value="doing">進行中</option>
                          <option value="done">已完成</option>
                          <option value="blocked">受阻</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Docs Tab */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">文件清單</h4>
                <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  上傳文件
                </button>
              </div>
              <div className="space-y-3">
                {order.docs.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{getDocTypeText(doc.type)}</h5>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        )}
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            查看文件
                          </a>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.required && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            必交
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDocStatusColor(doc.status)}`}>
                          {getDocStatusText(doc.status)}
                        </span>
                        <select
                          value={doc.status}
                          onChange={(e) => handleDocStatusChange(doc.id, e.target.value as DocStatus)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="missing">缺失</option>
                          <option value="draft">草稿</option>
                          <option value="review">審核中</option>
                          <option value="final">最終版</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
