import React from 'react';
import { Truck } from 'lucide-react';

const LogisticsConfig: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">物流配置</h1>
        <p className="text-gray-600">設定物流參數和運輸模式</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Truck className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">物流配置功能</h3>
        <p className="mt-1 text-sm text-gray-500">此功能正在開發中...</p>
      </div>
    </div>
  );
};

export default LogisticsConfig;
