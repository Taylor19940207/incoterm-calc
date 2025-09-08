import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系統設定</h1>
        <p className="text-gray-600">管理系統偏好設定</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">系統設定功能</h3>
        <p className="mt-1 text-sm text-gray-500">此功能正在開發中...</p>
      </div>
    </div>
  );
};

export default Settings;
