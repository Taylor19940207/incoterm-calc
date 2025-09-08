import React from 'react';
import { BarChart3 } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">報表分析</h1>
        <p className="text-gray-600">查看報價統計和分析報表</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">報表分析功能</h3>
        <p className="mt-1 text-sm text-gray-500">此功能正在開發中...</p>
      </div>
    </div>
  );
};

export default Reports;
