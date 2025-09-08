import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuotes } from '../repo/RepoProvider';
import { CreateQuoteInput, UpdateQuoteInput, Quote } from '../types/db';
import IncotermQuoteCalculatorOptimized from '../AppOptimized';
import { AppErrorBoundary } from '../components/AppErrorBoundary';
import { ArrowLeft, Save, X } from 'lucide-react';

interface QuoteEditorProps {
  mode: 'create' | 'edit';
}

interface QuoteDraft {
  meta: {
    customerName: string;
    contactInfo?: string;
    paymentTerms?: string;
    validUntil?: string;
    notes?: string;
  };
  inputs: {
    incotermFrom: 'EXW' | 'FOB' | 'CFR' | 'CIF' | 'DAP' | 'DDP';
    incotermTo: 'EXW' | 'FOB' | 'CFR' | 'CIF' | 'DAP' | 'DDP';
    markupMode: 'markup' | 'margin';
    markupPct: number;
    marginPct: number;
    currency: 'JPY' | 'USD' | 'TWD';
    products: any[];
    costs: any;
    [key: string]: any;
  };
}

const QuoteEditor: React.FC<QuoteEditorProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quotes = useQuotes();
  
  const [original, setOriginal] = useState<Quote | undefined>();
  const [form, setForm] = useState<QuoteDraft>({
    meta: {
      customerName: '',
      contactInfo: '',
      paymentTerms: '',
      validUntil: '',
      notes: ''
    },
    inputs: {
      incotermFrom: 'EXW',
      incotermTo: 'FOB',
      markupMode: 'markup',
      markupPct: 15,
      marginPct: 12.5,
      currency: 'USD',
      products: [],
      costs: {}
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');
  const [dirty, setDirty] = useState(false);

  // 載入預設值或現有報價
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (mode === 'edit' && id) {
          // 編輯模式：載入現有報價
          const existingQuote = await quotes.get(id);
          if (existingQuote) {
            setOriginal(existingQuote);
            setForm({
              meta: existingQuote.meta,
              inputs: existingQuote.inputs
            });
            
            // 載入計算器數據到 localStorage（確保數據正規化）
            const normalizedInputs = {
              ...existingQuote.inputs,
              // 確保基本屬性有預設值
              lang: existingQuote.inputs.lang || "zh",
              currency: existingQuote.inputs.currency || "JPY",
              supplierTerm: existingQuote.inputs.supplierTerm || "FOB",
              targetTerm: existingQuote.inputs.targetTerm || "CIF",
              inputMode: existingQuote.inputs.inputMode || "total",
              pricingMode: existingQuote.inputs.pricingMode || "markup",
              markupPct: existingQuote.inputs.markupPct || 15,
              marginPct: existingQuote.inputs.marginPct || 12,
              bankFeePct: existingQuote.inputs.bankFeePct || 0.6,
              rounding: existingQuote.inputs.rounding || 1,
              exportCostInclusion: existingQuote.inputs.exportCostInclusion || "include",
              allocationMethod: existingQuote.inputs.allocationMethod || "hybrid",
              insuranceRatePct: existingQuote.inputs.insuranceRatePct || 0.2,
              dutyPct: existingQuote.inputs.dutyPct || 0,
              vatPct: existingQuote.inputs.vatPct || 0,
              includeBrokerInTaxBase: existingQuote.inputs.includeBrokerInTaxBase || false,
              exportDocsMode: existingQuote.inputs.exportDocsMode || "byShipment",
              numOfShipments: existingQuote.inputs.numOfShipments || 1,
              // 確保所有成本項目都有 shipmentTotal
              inlandToPort: existingQuote.inputs.inlandToPort || { shipmentTotal: 0, scaleWithQty: false },
              exportDocsClearance: existingQuote.inputs.exportDocsClearance || { shipmentTotal: 0, scaleWithQty: false },
              documentFees: existingQuote.inputs.documentFees || { shipmentTotal: 0, scaleWithQty: false },
              originPortFees: existingQuote.inputs.originPortFees || { shipmentTotal: 0, scaleWithQty: false },
              mainFreight: existingQuote.inputs.mainFreight || { shipmentTotal: 0, scaleWithQty: false },
              destPortFees: existingQuote.inputs.destPortFees || { shipmentTotal: 0, scaleWithQty: false },
              importBroker: existingQuote.inputs.importBroker || { shipmentTotal: 0, scaleWithQty: false },
              lastMileDelivery: existingQuote.inputs.lastMileDelivery || { shipmentTotal: 0, scaleWithQty: false },
              misc: existingQuote.inputs.misc || { shipmentTotal: 0, scaleWithQty: false },
            };
            localStorage.setItem('incoterm-inputs', JSON.stringify(normalizedInputs));
          } else {
            alert('找不到指定的報價');
            navigate('/quotes');
            return;
          }
        } else {
          // 新增模式：載入預設值
          const defaultInputs = localStorage.getItem('incoterm-inputs');
          if (defaultInputs) {
            const inputs = JSON.parse(defaultInputs);
            // 確保載入的數據也有完整的成本項目結構
            const normalizedInputs = {
              ...inputs,
              // 確保基本屬性有預設值
              lang: inputs.lang || "zh",
              currency: inputs.currency || "JPY",
              supplierTerm: inputs.supplierTerm || "FOB",
              targetTerm: inputs.targetTerm || "CIF",
              inputMode: inputs.inputMode || "total",
              pricingMode: inputs.pricingMode || "markup",
              markupPct: inputs.markupPct || 15,
              marginPct: inputs.marginPct || 12,
              bankFeePct: inputs.bankFeePct || 0.6,
              rounding: inputs.rounding || 1,
              exportCostInclusion: inputs.exportCostInclusion || "include",
              allocationMethod: inputs.allocationMethod || "hybrid",
              insuranceRatePct: inputs.insuranceRatePct || 0.2,
              dutyPct: inputs.dutyPct || 0,
              vatPct: inputs.vatPct || 0,
              includeBrokerInTaxBase: inputs.includeBrokerInTaxBase || false,
              exportDocsMode: inputs.exportDocsMode || "byShipment",
              numOfShipments: inputs.numOfShipments || 1,
              // 確保所有成本項目都有 shipmentTotal
              inlandToPort: inputs.inlandToPort || { shipmentTotal: 0, scaleWithQty: false },
              exportDocsClearance: inputs.exportDocsClearance || { shipmentTotal: 0, scaleWithQty: false },
              documentFees: inputs.documentFees || { shipmentTotal: 0, scaleWithQty: false },
              originPortFees: inputs.originPortFees || { shipmentTotal: 0, scaleWithQty: false },
              mainFreight: inputs.mainFreight || { shipmentTotal: 0, scaleWithQty: false },
              destPortFees: inputs.destPortFees || { shipmentTotal: 0, scaleWithQty: false },
              importBroker: inputs.importBroker || { shipmentTotal: 0, scaleWithQty: false },
              lastMileDelivery: inputs.lastMileDelivery || { shipmentTotal: 0, scaleWithQty: false },
              misc: inputs.misc || { shipmentTotal: 0, scaleWithQty: false },
            };
            setForm(prev => ({
              ...prev,
              inputs: { ...prev.inputs, ...normalizedInputs }
            }));
          }
        }
      } catch (error) {
        console.error('載入數據失敗:', error);
        alert('載入數據失敗');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mode, id, quotes, navigate]);

  // 監聽 localStorage 變化並同步更新 form
  useEffect(() => {
    const handleStorageChange = () => {
      const calculatorInputs = localStorage.getItem('incoterm-inputs');
      if (calculatorInputs) {
        try {
          const inputs = JSON.parse(calculatorInputs);
          setForm(prev => ({
            ...prev,
            inputs: { ...prev.inputs, ...inputs }
          }));
        } catch (error) {
          console.error('解析 localStorage 數據失敗:', error);
        }
      }
    };

    // 監聽 storage 事件（跨標籤頁）
    window.addEventListener('storage', handleStorageChange);
    
    // 定期檢查 localStorage 變化（同標籤頁內）
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 檢測變更
  useEffect(() => {
    if (mode === 'edit' && original) {
      // 比較 meta 部分
      const metaChanged = JSON.stringify(form.meta) !== JSON.stringify(original.meta);
      
      // 比較關鍵的 inputs 部分（會影響計算和顯示的設定）
      const inputsChanged = 
        form.inputs.currency !== original.inputs.currency ||
        form.inputs.lang !== original.inputs.lang ||
        form.inputs.supplierTerm !== original.inputs.supplierTerm ||
        form.inputs.targetTerm !== original.inputs.targetTerm ||
        form.inputs.inputMode !== original.inputs.inputMode ||
        form.inputs.pricingMode !== original.inputs.pricingMode ||
        form.inputs.markupPct !== original.inputs.markupPct ||
        form.inputs.marginPct !== original.inputs.marginPct ||
        form.inputs.bankFeePct !== original.inputs.bankFeePct ||
        form.inputs.rounding !== original.inputs.rounding ||
        form.inputs.exportCostInclusion !== original.inputs.exportCostInclusion ||
        form.inputs.allocationMethod !== original.inputs.allocationMethod ||
        form.inputs.insuranceRatePct !== original.inputs.insuranceRatePct ||
        form.inputs.dutyPct !== original.inputs.dutyPct ||
        form.inputs.vatPct !== original.inputs.vatPct ||
        form.inputs.includeBrokerInTaxBase !== original.inputs.includeBrokerInTaxBase ||
        form.inputs.exportDocsMode !== original.inputs.exportDocsMode ||
        form.inputs.numOfShipments !== original.inputs.numOfShipments;
      
      // 比較成本項目
      const costItemsChanged = 
        JSON.stringify(form.inputs.inlandToPort) !== JSON.stringify(original.inputs.inlandToPort) ||
        JSON.stringify(form.inputs.exportDocsClearance) !== JSON.stringify(original.inputs.exportDocsClearance) ||
        JSON.stringify(form.inputs.documentFees) !== JSON.stringify(original.inputs.documentFees) ||
        JSON.stringify(form.inputs.originPortFees) !== JSON.stringify(original.inputs.originPortFees) ||
        JSON.stringify(form.inputs.mainFreight) !== JSON.stringify(original.inputs.mainFreight) ||
        JSON.stringify(form.inputs.destPortFees) !== JSON.stringify(original.inputs.destPortFees) ||
        JSON.stringify(form.inputs.importBroker) !== JSON.stringify(original.inputs.importBroker) ||
        JSON.stringify(form.inputs.lastMileDelivery) !== JSON.stringify(original.inputs.lastMileDelivery) ||
        JSON.stringify(form.inputs.misc) !== JSON.stringify(original.inputs.misc);
      
      // 比較商品資訊
      const productsChanged = JSON.stringify(form.inputs.products) !== JSON.stringify(original.inputs.products);
      
      // 比較物流配置
      const shippingConfigChanged = JSON.stringify(form.inputs.shippingConfig) !== JSON.stringify(original.inputs.shippingConfig);
      
      const isDirty = metaChanged || inputsChanged || costItemsChanged || productsChanged || shippingConfigChanged;
      setDirty(isDirty);
    } else if (mode === 'create') {
      // 新增模式：只要有任何 meta 欄位有值就設為 dirty
      const hasMetaData = form?.meta?.customerName?.trim() || 
                         form?.meta?.contactInfo?.trim() || 
                         form?.meta?.paymentTerms?.trim() || 
                         form?.meta?.validUntil?.trim() || 
                         form?.meta?.notes?.trim();
      setDirty(!!hasMetaData);
    }
  }, [form, original, mode]);

  // 離開前確認
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '您有未儲存的變更，確定要離開嗎？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const handleSave = async () => {
    if (!form?.meta?.customerName?.trim()) {
      alert('請輸入客戶名稱');
      return;
    }

    setIsSaving(true);
    
    try {
      // 從 localStorage 讀取最新的計算器數據
      const calculatorInputs = localStorage.getItem('incoterm-inputs');
      const inputs = calculatorInputs ? JSON.parse(calculatorInputs) : {};
      
      if (mode === 'create') {
        // 新增報價
        const createInput: CreateQuoteInput = {
          meta: {
            customerName: form?.meta?.customerName?.trim() || '',
            contactInfo: form?.meta?.contactInfo || '',
            paymentTerms: form?.meta?.paymentTerms || '',
            validUntil: form?.meta?.validUntil || '',
            notes: form?.meta?.notes || ''
          },
          inputs: {
            ...form.inputs,
            ...inputs
          }
        };

        const newQuote = await quotes.create(createInput);
        console.log('新增報價成功:', newQuote);
        setDirty(false);
        alert('報價已儲存！');
        navigate(`/quotes/${newQuote.id}`);
      } else {
        // 更新報價
        const updateInput: UpdateQuoteInput = {
          meta: {
            customerName: form?.meta?.customerName?.trim() || '',
            contactInfo: form?.meta?.contactInfo || '',
            paymentTerms: form?.meta?.paymentTerms || '',
            validUntil: form?.meta?.validUntil || '',
            notes: form?.meta?.notes || ''
          },
          inputs: {
            ...form.inputs,
            ...inputs
          }
        };

        const updatedQuote = await quotes.update(id!, updateInput);
        console.log('更新報價成功:', updatedQuote);
        setOriginal(updatedQuote);
        setDirty(false);
        alert('報價已更新！');
      }
    } catch (error) {
      console.error('儲存報價失敗:', error);
      alert('儲存失敗，請重試');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (dirty && !window.confirm('您有未儲存的變更，確定要離開嗎？')) {
      return;
    }
    navigate('/quotes');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入報價數據中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            返回列表
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? '新增報價' : `編輯報價 #${original?.code}`}
            </h1>
            <p className="text-gray-600">
              {mode === 'create' ? '建立新的報價單據' : '編輯現有報價單據'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {dirty && (
            <span className="flex items-center text-sm text-orange-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              有未儲存的變更
            </span>
          )}
          <button
            onClick={handleCancel}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !form?.meta?.customerName?.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '儲存中...' : '儲存報價'}
          </button>
        </div>
      </div>

      {/* 基本資訊表單 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              客戶名稱 *
            </label>
            <input
              type="text"
              value={form?.meta?.customerName || ''}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                meta: { ...prev?.meta, customerName: e.target.value }
              }))}
              placeholder="請輸入客戶名稱"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              聯絡資訊
            </label>
            <input
              type="text"
              value={form?.meta?.contactInfo || ''}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                meta: { ...prev?.meta, contactInfo: e.target.value }
              }))}
              placeholder="請輸入聯絡資訊"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              付款條件
            </label>
            <input
              type="text"
              value={form?.meta?.paymentTerms || ''}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                meta: { ...prev?.meta, paymentTerms: e.target.value }
              }))}
              placeholder="請輸入付款條件"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              有效期
            </label>
            <input
              type="date"
              value={form?.meta?.validUntil || ''}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                meta: { ...prev?.meta, validUntil: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備註
            </label>
            <textarea
              value={form?.meta?.notes || ''}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                meta: { ...prev?.meta, notes: e.target.value }
              }))}
              placeholder="請輸入備註"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 報價計算器內容 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <AppErrorBoundary>
          <IncotermQuoteCalculatorOptimized />
        </AppErrorBoundary>
      </div>
    </div>
  );
};

export default QuoteEditor;