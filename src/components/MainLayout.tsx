import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Truck, 
  BarChart3, 
  Settings,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 使用全局語言 Context
  const { lang, setLang, t } = useLanguage();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: t['報價管理'] || '報價管理', href: '/quotes', icon: FileText },
    { name: t['客戶管理'] || '客戶管理', href: '/customers', icon: Users },
    { name: t['商品管理'] || '商品管理', href: '/products', icon: Package },
    { name: t['物流配置'] || '物流配置', href: '/logistics', icon: Truck },
    { name: t['報表分析'] || '報表分析', href: '/reports', icon: BarChart3 },
    { name: t['系統設定'] || '系統設定', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-[#bbbfc4] to-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-14 px-6 border-b border-slate-700/50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Incoterm ERP</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg p-1 transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <button
              onClick={() => {
                navigate('/quotes/new');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t['新增報價'] || '新增報價'}
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1 transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="text-sm text-gray-600 font-medium">
              {new Date().toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'zh-TW', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
            
            {/* 語言選擇器 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">{t.langLabel}：</span>
              <button 
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  lang === "zh" 
                    ? "bg-blue-500 text-white shadow-md hover:bg-blue-600" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                }`} 
                onClick={() => setLang("zh")}
              >
                {t.zh}
              </button>
              <button 
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  lang === "ja" 
                    ? "bg-blue-500 text-white shadow-md hover:bg-blue-600" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                }`} 
                onClick={() => setLang("ja")}
              >
                {t.ja}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-6 max-w-full overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
