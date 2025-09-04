import React from 'react';

export function NewFeaturesDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            🎉 新功能展示
          </h1>
          <p className="text-xl text-blue-700">
            物流方式配置、智能驗證系統、產品管理優化
          </p>
        </div>

        {/* 功能卡片網格 */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* 物流配置 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">物流方式配置</h3>
            <p className="text-gray-600 mb-4">
              支援空運、快遞、海運、卡車等多種運輸方式，可自定義體積重係數
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div>空運：係數 6000</div>
              <div>快遞：係數 5000</div>
              <div>海運：無體積重</div>
              <div>卡車：係數 6000</div>
            </div>
          </div>

          {/* 智能驗證 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">智能驗證系統</h3>
            <p className="text-gray-600 mb-4">
              實時驗證產品數據，區分硬錯誤和警告，確保數據準確性
            </p>
            <div className="space-y-2 text-sm">
              <div className="text-red-600">🔴 硬錯誤：阻止提交</div>
              <div className="text-yellow-600">🟡 警告：提醒注意</div>
            </div>
          </div>

          {/* 產品管理 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">產品管理優化</h3>
            <p className="text-gray-600 mb-4">
              長寬高分開輸入，自動計算體積，支援批量操作和單位轉換
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div>📏 長度、寬度、高度 (mm/cm)</div>
              <div>⚖️ 重量 (kg/g)</div>
              <div>🔄 自動單位轉換</div>
            </div>
          </div>

          {/* 批量操作 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">批量操作工具</h3>
            <p className="text-gray-600 mb-4">
              選中多個產品進行批量設置，提高工作效率
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div>🎯 批量選擇產品</div>
              <div>🔧 批量應用設置</div>
              <div>📋 批量清空數據</div>
            </div>
          </div>

          {/* 用戶偏好 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">用戶偏好記憶</h3>
            <p className="text-gray-600 mb-4">
              記住用戶的常用設置和偏好，自動保存到本地存儲
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div>💾 自動保存設置</div>
              <div>🔄 記住常用值</div>
              <div>📱 跨設備同步</div>
            </div>
          </div>

          {/* 實時計算 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-teal-500">
            <div className="text-4xl mb-4">🧮</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">實時計算顯示</h3>
            <p className="text-gray-600 mb-4">
              輸入數據時實時顯示計算結果，包括體積、重量、費用等
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div>📊 即時更新結果</div>
              <div>💰 費用預覽</div>
              <div>📈 趨勢分析</div>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📖 如何使用新功能
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-3">1. 物流配置</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 選擇運輸方式（空運/快遞/海運/卡車）</li>
                <li>• 系統自動設置對應的體積重係數</li>
                <li>• 可自定義覆寫係數值</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-700 mb-3">2. 產品管理</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 輸入長度、寬度、高度（毫米或釐米）</li>
                <li>• 輸入重量（公斤或克）</li>
                <li>• 系統自動計算體積和體積重</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-700 mb-3">3. 智能驗證</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 實時檢查數據有效性</li>
                <li>• 紅色錯誤阻止提交</li>
                <li>• 黃色警告提醒注意</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-700 mb-3">4. 批量操作</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 勾選多個產品</li>
                <li>• 使用批量工具欄</li>
                <li>• 一次性應用設置</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 返回按鈕 */}
        <div className="mt-12 text-center">
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            ← 返回主應用
          </button>
        </div>
      </div>
    </div>
  );
}
