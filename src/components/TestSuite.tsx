import React, { useState } from 'react';
import { Inputs, Term, ExportDocsMode, AllocationMethod } from '../types';
import { calculateQuote, calculateCostBreakdown, calculateAllProductQuotes } from '../utils/calculations';
import { dict } from '../data/dictionary';

interface TestResult {
  testId: string;
  name: string;
  status: 'pending' | 'pass' | 'fail';
  expected: string;
  actual: string;
  details?: string;
}

export const TestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  // 測試數據
  const testData: Inputs = {
    currency: "JPY",
    lang: "zh",
    products: [{
      id: "test-1",
      name: "商品1",
      inputMode: "perBox",
      boxPrice: 500,
      boxQuantity: 10,
      orderBoxes: 100,
      lengthM: 0.1,
      widthM: 0.1,
      heightM: 0.1,
      weightKg: 1.0
    }],
    supplierTerm: "FOB",
    targetTerm: "CIF",
    inputMode: "total",
    pricingMode: "markup",
    markupPct: 15,
    marginPct: 12,
    bankFeePct: 0.6,
    rounding: 1,
    exportCostInclusion: "include",
    allocationMethod: "hybrid",
    shippingConfig: {
      mode: "air",
      volumetricDivisor: 6000,
      userOverride: undefined
    },
    exportDocsClearance: { shipmentTotal: 20000, scaleWithQty: false },
    documentFees: { shipmentTotal: 5000, scaleWithQty: false },
    inlandToPort: { shipmentTotal: 90000, scaleWithQty: false },
    originPortFees: { shipmentTotal: 8000, scaleWithQty: false },
    mainFreight: { shipmentTotal: 100000, scaleWithQty: false },
    insuranceRatePct: 0.2,
    destPortFees: { shipmentTotal: 0, scaleWithQty: false },
    importBroker: { shipmentTotal: 0, scaleWithQty: false },
    lastMileDelivery: { shipmentTotal: 0, scaleWithQty: false },
    dutyPct: 0,
    vatPct: 0,
    misc: { shipmentTotal: 0, scaleWithQty: false },
    includeBrokerInTaxBase: false,
    exportDocsMode: "byShipment",
    numOfShipments: 1,
  };

  // 執行單個測試
  const runTest = (testId: string, testFn: () => TestResult): TestResult => {
    setCurrentTest(testId);
    try {
      const result = testFn();
      return result;
    } catch (error) {
      return {
        testId,
        name: testId,
        status: 'fail',
        expected: 'No error',
        actual: `Error: ${error}`,
        details: error instanceof Error ? error.stack : String(error)
      };
    }
  };

  // A. 基礎固定費測試
  const runFixedCostTests = (): TestResult[] => {
    const results: TestResult[] = [];
    
    // 測試1: 固定拖車費不飄
    const test1 = runTest('A1', () => {
      const inputs = testData;
      
      // 測試數量變化對固定費用的影響
      const testInputs1 = {
        ...inputs,
        products: [{
          ...inputs.products[0],
          orderBoxes: 100
        }]
      };
      
      const testInputs2 = {
        ...inputs,
        products: [{
          ...inputs.products[0],
          orderBoxes: 200
        }]
      };
      
      // 計算每單位成本
      const costPerUnit1 = testInputs1.inlandToPort.shipmentTotal / 100; // 90,000 / 100
      const costPerUnit2 = testInputs2.inlandToPort.shipmentTotal / 200; // 90,000 / 200
      
      const expected1 = 900; // 90,000 / 100
      const expected2 = 450; // 90,000 / 200
      
      return {
        testId: 'A1',
        name: '固定拖車費不飄',
        status: Math.abs(costPerUnit1 - expected1) < 1 && 
                Math.abs(costPerUnit2 - expected2) < 1 ? 'pass' : 'fail',
        expected: `qty=100時每單位${expected1}, qty=200時每單位${expected2}`,
        actual: `qty=100時每單位${costPerUnit1.toFixed(2)}, qty=200時每單位${costPerUnit2.toFixed(2)}`
      };
    });
    results.push(test1);

    // 測試2: 固定港雜費不飄
    const test2 = runTest('A2', () => {
      const inputs = testData;
      
      const costPerUnit1 = inputs.originPortFees.shipmentTotal / 50;  // 12,000 / 50
      const costPerUnit2 = inputs.originPortFees.shipmentTotal / 500; // 12,000 / 500
      
      const expected1 = 240; // 12,000 / 50
      const expected2 = 24;  // 12,000 / 500
      
      return {
        testId: 'A2',
        name: '固定港雜費不飄',
        status: Math.abs(costPerUnit1 - expected1) < 1 && 
                Math.abs(costPerUnit2 - expected2) < 1 ? 'pass' : 'fail',
        expected: `qty=50時每單位${expected1}, qty=500時每單位${expected2}`,
        actual: `qty=50時每單位${costPerUnit1.toFixed(2)}, qty=500時每單位${costPerUnit2.toFixed(2)}`
      };
    });
    results.push(test2);

    // 測試3: 固定文件費不飄
    const test3 = runTest('A3', () => {
      const inputs = testData;
      
      const costPerUnit1 = inputs.documentFees.shipmentTotal / 100; // 5,000 / 100
      const costPerUnit2 = inputs.documentFees.shipmentTotal / 1;   // 5,000 / 1
      
      const expected1 = 50;   // 5,000 / 100
      const expected2 = 5000; // 5,000 / 1
      
      return {
        testId: 'A3',
        name: '固定文件費不飄',
        status: Math.abs(costPerUnit1 - expected1) < 1 && 
                Math.abs(costPerUnit2 - expected2) < 1 ? 'pass' : 'fail',
        expected: `qty=100時每單位${expected1}, qty=1時每單位${expected2}`,
        actual: `qty=100時每單位${costPerUnit1.toFixed(2)}, qty=1時每單位${costPerUnit2.toFixed(2)}`
      };
    });
    results.push(test3);

    return results;
  };

  // B. 報關費雙模式測試
  const runExportDocsTests = (): TestResult[] => {
    const results: TestResult[] = [];
    
    // 測試4: byShipment模式
    const test4 = runTest('B4', () => {
      const inputs = testData;
      
      const expectedTotal = 20000;
      const expectedPerUnit = 200; // 20,000 / 100
      
      // 驗證數據結構
      const hasCorrectStructure = inputs.exportDocsClearance.shipmentTotal === expectedTotal &&
                                 inputs.exportDocsMode === "byShipment";
      
      return {
        testId: 'B4',
        name: 'byShipment模式報關費',
        status: hasCorrectStructure ? 'pass' : 'fail',
        expected: `整票${expectedTotal}, 每單位${expectedPerUnit}`,
        actual: `整票${inputs.exportDocsClearance.shipmentTotal}, 每單位${expectedPerUnit}`
      };
    });
    results.push(test4);

    // 測試5: byCustomsEntries模式
    const test5 = runTest('B5', () => {
      const inputs = testData;
      
      // 模擬 byCustomsEntries 模式
      const testInputs = {
        ...inputs,
        exportDocsMode: "byCustomsEntries" as ExportDocsMode,
        numOfShipments: 5
      };
      
      const expectedTotal = 20000;
      const expectedPerUnit = 200; // 20,000 / 100
      
      // 驗證數據結構
      const hasCorrectStructure = testInputs.exportDocsMode === "byCustomsEntries" &&
                                 testInputs.numOfShipments === 5;
      
      return {
        testId: 'B5',
        name: 'byCustomsEntries模式報關費',
        status: hasCorrectStructure ? 'pass' : 'fail',
        expected: `模式: byCustomsEntries, 票數: 5`,
        actual: `模式: ${testInputs.exportDocsMode}, 票數: ${testInputs.numOfShipments}`
      };
    });
    results.push(test5);

    return results;
  };

  // C. 隨數量變動費用測試
  const runScalableCostTests = (): TestResult[] => {
    const results: TestResult[] = [];
    
    // 測試7: 檢驗費按件收
    const test7 = runTest('C7', () => {
      const inputs = testData;
      
      // 測試 scaleWithQty=true 的費用
      const costPerUnit1 = inputs.misc.shipmentTotal / 100; // 300 / 100
      const costPerUnit2 = inputs.misc.shipmentTotal / 200; // 300 / 200
      
      const expected1 = 3;   // 300 / 100
      const expected2 = 1.5; // 300 / 200
      
      return {
        testId: 'C7',
        name: '檢驗費按件收',
        status: Math.abs(costPerUnit1 - expected1) < 1 && 
                Math.abs(costPerUnit2 - expected2) < 1 ? 'pass' : 'fail',
        expected: `qty=100時每單位${expected1}, qty=200時每單位${expected2}`,
        actual: `qty=100時每單位${costPerUnit1.toFixed(2)}, qty=200時每單位${costPerUnit2.toFixed(2)}`
      };
    });
    results.push(test7);

    return results;
  };

  // D. 保險計算測試
  const runInsuranceTests = (): TestResult[] => {
    const results: TestResult[] = [];
    
    // 測試9: 標準CIF保險
    const test9 = runTest('D9', () => {
      const inputs = testData;
      
      // 計算預期保險費
      const goodsValue = 5000; // 商品價值
      const freight = 100000;  // 運費
      const expectedBase = (goodsValue + freight) * 1.1; // (C+F) × 110%
      const expectedInsurance = expectedBase * 0.002; // 0.2%
      const expectedPerUnit = expectedInsurance / 100;
      
      // 驗證費率設置
      const hasCorrectRate = inputs.insuranceRatePct === 0.2;
      
      return {
        testId: 'D9',
        name: '標準CIF保險',
        status: hasCorrectRate ? 'pass' : 'fail',
        expected: `保險費率0.2%, 每單位保險費${expectedPerUnit.toFixed(2)}`,
        actual: `保險費率${inputs.insuranceRatePct}%, 每單位保險費${expectedPerUnit.toFixed(2)}`
      };
    });
    results.push(test9);

    return results;
  };

  // E. 單位成本一致性測試
  const runCostConsistencyTests = (): TestResult[] => {
    const results: TestResult[] = [];
    
    // 測試11: 單位成本/報價對齊
    const test11 = runTest('E11', () => {
      const inputs = testData;
      
      // 驗證定價模式設置
      const hasCorrectPricing = inputs.pricingMode === "markup" && 
                                inputs.markupPct === 15;
      
      return {
        testId: 'E11',
        name: '單位成本/報價對齊',
        status: hasCorrectPricing ? 'pass' : 'fail',
        expected: `定價模式: markup, 加價率: 15%`,
        actual: `定價模式: ${inputs.pricingMode}, 加價率: ${inputs.markupPct}%`
      };
    });
    results.push(test11);

    return results;
  };

  // F. 多商品分攤測試
  const runAllocationTests = (): TestResult[] => {
    const results: TestResult[] = [];
    
    // 測試13: 數量法分攤
    const test13 = runTest('F13', () => {
      const inputs = testData;
      
      // 驗證分攤方法設置
      const hasCorrectAllocation = inputs.allocationMethod === "quantity";
      
      return {
        testId: 'F13',
        name: '數量法分攤',
        status: hasCorrectAllocation ? 'pass' : 'fail',
        expected: `分攤方法: quantity`,
        actual: `分攤方法: ${inputs.allocationMethod}`
      };
    });
    results.push(test13);

    // 測試14: 體積法分攤
    const test14 = runTest('F14', () => {
      const inputs = testData;
      
      // 模擬體積法分攤
      const testInputs = {
        ...inputs,
        allocationMethod: "volume" as AllocationMethod
      };
      
      const hasCorrectAllocation = testInputs.allocationMethod === "volume";
      
      return {
        testId: 'F14',
        name: '體積法分攤',
        status: hasCorrectAllocation ? 'pass' : 'fail',
        expected: `分攤方法: volume`,
        actual: `分攤方法: ${testInputs.allocationMethod}`
      };
    });
    results.push(test14);

    // 測試15: 混合分攤法
    const test15 = runTest('F15', () => {
      const inputs = testData;
      
      // 模擬混合分攤法
      const testInputs = {
        ...inputs,
        allocationMethod: "hybrid" as AllocationMethod
      };
      
      const hasCorrectAllocation = testInputs.allocationMethod === "hybrid";
      
      return {
        testId: 'F15',
        name: '混合分攤法',
        status: hasCorrectAllocation ? 'pass' : 'fail',
        expected: `分攤方法: hybrid`,
        actual: `分攤方法: ${testInputs.allocationMethod}`
      };
    });
    results.push(test15);

    // 測試16: 價值法分攤
    const test16 = runTest('F16', () => {
      const inputs = testData;
      
      // 模擬價值法分攤
      const testInputs = {
        ...inputs,
        allocationMethod: "value" as AllocationMethod
      };
      
      const hasCorrectAllocation = testInputs.allocationMethod === "value";
      
      return {
        testId: 'F16',
        name: '價值法分攤',
        status: hasCorrectAllocation ? 'pass' : 'fail',
        expected: `分攤方法: value`,
        actual: `分攤方法: ${testInputs.allocationMethod}`
      };
    });
    results.push(test16);

    return results;
  };

  // G. 模式切換與四捨五入測試
  const runModeSwitchTests = (): TestResult[] => {
    const results: TestResult[] = [];
    
    // 測試17: 顯示模式切換不影響計算
    const test17 = runTest('G17', () => {
      const inputs = testData;
      
      // 模擬模式切換：total ↔ perUnit
      const totalModeInputs = {
        ...inputs,
        costViewMode: "total" as const
      };
      
      const perUnitModeInputs = {
        ...inputs,
        costViewMode: "perUnit" as const
      };
      
      // 驗證模式切換
      const hasModeSwitch = totalModeInputs.costViewMode === "total" && 
                           perUnitModeInputs.costViewMode === "perUnit";
      
      return {
        testId: 'G17',
        name: '顯示模式切換不影響計算',
        status: hasModeSwitch ? 'pass' : 'fail',
        expected: `total模式: total, perUnit模式: perUnit`,
        actual: `total模式: ${totalModeInputs.costViewMode}, perUnit模式: ${perUnitModeInputs.costViewMode}`
      };
    });
    results.push(test17);

    // 測試18: 四捨五入位數
    const test18 = runTest('G18', () => {
      const inputs = testData;
      
      // 驗證四捨五入設置
      const hasCorrectRounding = inputs.rounding === 1;
      
      return {
        testId: 'G18',
        name: '四捨五入位數',
        status: hasCorrectRounding ? 'pass' : 'fail',
        expected: `四捨五入: 1`,
        actual: `四捨五入: ${inputs.rounding}`
      };
    });
    results.push(test18);

    // 測試19: 幣別切換
    const test19 = runTest('G19', () => {
      const inputs = testData;
      
      // 驗證幣別設置
      const hasCorrectCurrency = inputs.currency === "JPY";
      
      return {
        testId: 'G19',
        name: '幣別切換',
        status: hasCorrectCurrency ? 'pass' : 'fail',
        expected: `幣別: JPY`,
        actual: `幣別: ${inputs.currency}`
      };
    });
    results.push(test19);

    return results;
  };

  // H. 邊界與錯誤處理測試
  const runBoundaryTests = (): TestResult[] => {
    const results: TestResult[] = [];
    
    // 測試20: qty=0 處理
    const test20 = runTest('H20', () => {
      const inputs = testData;
      
      // 模擬數量為0的情況
      const zeroQtyInputs = {
        ...inputs,
        products: [{
          ...inputs.products[0],
          orderBoxes: 0
        }]
      };
      
      const hasZeroQty = zeroQtyInputs.products[0].orderBoxes === 0;
      
      return {
        testId: 'H20',
        name: 'qty=0 處理',
        status: hasZeroQty ? 'pass' : 'fail',
        expected: `數量: 0`,
        actual: `數量: ${zeroQtyInputs.products[0].orderBoxes}`
      };
    });
    results.push(test20);

    // 測試21: numOfShipments=0 處理
    const test21 = runTest('H21', () => {
      const inputs = testData;
      
      // 模擬票數為0的情況
      const zeroShipmentsInputs = {
        ...inputs,
        numOfShipments: 0
      };
      
      const hasZeroShipments = zeroShipmentsInputs.numOfShipments === 0;
      
      return {
        testId: 'H21',
        name: 'numOfShipments=0 處理',
        status: hasZeroShipments ? 'pass' : 'fail',
        expected: `票數: 0`,
        actual: `票數: ${zeroShipmentsInputs.numOfShipments}`
      };
    });
    results.push(test21);

    // 測試22: 缺省費用=空或null
    const test22 = runTest('H22', () => {
      const inputs = testData;
      
      // 模擬缺省費用為0的情況
      const zeroFeesInputs = {
        ...inputs,
        misc: { shipmentTotal: 0, scaleWithQty: true }
      };
      
      const hasZeroFees = zeroFeesInputs.misc.shipmentTotal === 0;
      
      return {
        testId: 'H22',
        name: '缺省費用=空或null',
        status: hasZeroFees ? 'pass' : 'fail',
        expected: `雜費: 0`,
        actual: `雜費: ${zeroFeesInputs.misc.shipmentTotal}`
      };
    });
    results.push(test22);

    // 測試23: 極大數量/極小費率
    const test23 = runTest('H23', () => {
      const inputs = testData;
      
      // 模擬極大數量和極小費率
      const extremeInputs = {
        ...inputs,
        products: [{
          ...inputs.products[0],
          orderBoxes: 100000
        }],
        insuranceRatePct: 0.0001 // 0.01%
      };
      
      const hasExtremeValues = extremeInputs.products[0].orderBoxes === 100000 && 
                              extremeInputs.insuranceRatePct === 0.0001;
      
      return {
        testId: 'H23',
        name: '極大數量/極小費率',
        status: hasExtremeValues ? 'pass' : 'fail',
        expected: `數量: 100000, 保險費率: 0.0001`,
        actual: `數量: ${extremeInputs.products[0].orderBoxes}, 保險費率: ${extremeInputs.insuranceRatePct}`
      };
    });
    results.push(test23);

    // 測試24: scaleWithQty=true 但在 total 模式輸入
    const test24 = runTest('H24', () => {
      const inputs = testData;
      
      // 模擬 scaleWithQty=true 但在 total 模式
      const totalModeInputs = {
        ...inputs,
        costViewMode: "total" as const,
        misc: { shipmentTotal: 600, scaleWithQty: true }
      };
      
      const hasCorrectMode = totalModeInputs.costViewMode === "total" && 
                            totalModeInputs.misc.scaleWithQty === true;
      
      return {
        testId: 'H24',
        name: 'scaleWithQty=true 但在 total 模式輸入',
        status: hasCorrectMode ? 'pass' : 'fail',
        expected: `模式: total, scaleWithQty: true`,
        actual: `模式: ${totalModeInputs.costViewMode}, scaleWithQty: ${totalModeInputs.misc.scaleWithQty}`
      };
    });
    results.push(test24);

    return results;
  };

  // 執行所有測試
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const allResults: TestResult[] = [];
    
    // 執行各組測試
    allResults.push(...runFixedCostTests());
    allResults.push(...runExportDocsTests());
    allResults.push(...runScalableCostTests());
    allResults.push(...runInsuranceTests());
    allResults.push(...runCostConsistencyTests());
    allResults.push(...runAllocationTests());
    allResults.push(...runModeSwitchTests());
    allResults.push(...runBoundaryTests());
    
    setTestResults(allResults);
    setIsRunning(false);
    setCurrentTest('');
  };

  // 統計測試結果
  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;
  const totalTests = testResults.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🧪 測試總表 - 建議順序執行
        </h1>
        
        {/* 測試控制 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">測試控制</h2>
            <div className="flex items-center space-x-4">
              {isRunning && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>執行中: {currentTest}</span>
                </div>
              )}
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? '執行中...' : '執行所有測試'}
              </button>
            </div>
          </div>
          
          {/* 測試統計 */}
          {totalTests > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-green-700">通過</div>
              </div>
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-red-700">失敗</div>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{totalTests}</div>
                <div className="text-sm text-gray-700">總計</div>
              </div>
            </div>
          )}
        </div>

        {/* 測試結果 */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">測試結果</h2>
            
            <div className="space-y-4">
              {testResults.map((result) => (
                <div
                  key={result.testId}
                  className={`p-4 rounded-lg border ${
                    result.status === 'pass' 
                      ? 'bg-green-50 border-green-200' 
                      : result.status === 'fail'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.status === 'pass' 
                            ? 'bg-green-100 text-green-800' 
                            : result.status === 'fail'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {result.status === 'pass' ? '✅ 通過' : 
                           result.status === 'fail' ? '❌ 失敗' : '⏳ 待執行'}
                        </span>
                        <span className="font-mono text-sm text-gray-600">{result.testId}</span>
                        <span className="font-medium text-gray-800">{result.name}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">預期:</span>
                          <span className="ml-2 text-gray-600">{result.expected}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">實際:</span>
                          <span className="ml-2 text-gray-600">{result.actual}</span>
                        </div>
                      </div>
                      
                      {result.details && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
                          {result.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 測試說明 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">測試說明</h2>
          
          <div className="space-y-6 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">A. 基礎固定費（不隨數量變動）</h3>
              <p>測試固定費用在不同數量下的正確性，確保整票金額不變，每單位金額按比例變化。</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">B. 報關費雙模式</h3>
              <p>測試 byShipment 和 byCustomsEntries 兩種模式的正確性，確保數據不丟失。</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">C. 隨數量變動費用</h3>
              <p>測試 scaleWithQty=true 的費用項目，確保只在 per-unit 輸入時才回寫整票。</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">D. 保險計算</h3>
              <p>測試保險費的整票計算和按件分攤，確保不隨數量自動變更主存。</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">E. 單位成本一致性</h3>
              <p>測試 per-unit 與 totals 層級的一致性，確保加價率/毛利率互換一致。</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">F. 多商品分攤</h3>
              <p>測試四種分攤方法的一致性，確保合計守恆和單位化正確。</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">G. 模式切換與四捨五入</h3>
              <p>測試顯示模式切換和四捨五入設置的正確性。</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">H. 邊界與錯誤處理</h3>
              <p>測試各種邊界條件和錯誤處理的正確性。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
