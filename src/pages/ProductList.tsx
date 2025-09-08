import React from 'react';
import { Package, Plus } from 'lucide-react';

const ProductList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          <p className="text-gray-600">管理商品資料庫</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="mr-2 h-4 w-4" />
          新增商品
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">商品管理功能</h3>
        <p className="mt-1 text-sm text-gray-500">此功能正在開發中...</p>
      </div>
    </div>
  );
};

export default ProductList;
