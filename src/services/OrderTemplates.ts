import { TaskTemplate, DocTemplate } from '../types/order';

// 任務模板定義
export const TaskTemplates: Record<string, Record<string, TaskTemplate[]>> = {
  FOB: {
    sea: [
      { title: "供應商數量/裝箱確認", assignee: "supplier", offsetDays: 2, required: true, description: "確認最終出貨數量和裝箱明細" },
      { title: "安排拖車到港", assignee: "forwarder", offsetDays: 5, required: true, description: "安排拖車到港口並預約時段" },
      { title: "Invoice/PL 準備", assignee: "exporter", offsetTo: "ETD", offsetDays: -3, required: true, description: "準備商業發票和裝箱單" },
      { title: "出口報關資料提交", assignee: "exporter", offsetTo: "ETD", offsetDays: -2, required: true, description: "提交出口報關所需文件" },
      { title: "取得提單/電放", assignee: "forwarder", offsetTo: "ETD", offsetDays: 2, required: true, description: "取得海運提單或電放指示" },
      { title: "通知進口商到貨", assignee: "exporter", offsetTo: "ETA", offsetDays: 0, required: true, description: "通知進口商貨物到港" }
    ],
    air: [
      { title: "供應商數量確認", assignee: "supplier", offsetDays: 1, required: true, description: "確認最終出貨數量" },
      { title: "安排空運訂艙", assignee: "forwarder", offsetDays: 2, required: true, description: "向航空公司訂艙" },
      { title: "Invoice/PL 準備", assignee: "exporter", offsetTo: "ETD", offsetDays: -1, required: true, description: "準備商業發票和裝箱單" },
      { title: "航空提單 AWB", assignee: "forwarder", offsetTo: "ETD", offsetDays: 1, required: true, description: "取得航空提單" },
      { title: "通知進口商到貨", assignee: "exporter", offsetTo: "ETA", offsetDays: 0, required: true, description: "通知進口商貨物到港" }
    ]
  },
  CIF: {
    sea: [
      { title: "供應商數量/裝箱確認", assignee: "supplier", offsetDays: 2, required: true, description: "確認最終出貨數量和裝箱明細" },
      { title: "安排拖車到港", assignee: "forwarder", offsetDays: 5, required: true, description: "安排拖車到港口並預約時段" },
      { title: "保險加保", assignee: "exporter", offsetTo: "ETD", offsetDays: -3, required: true, description: "為貨物投保運輸險" },
      { title: "Invoice/PL 準備", assignee: "exporter", offsetTo: "ETD", offsetDays: -3, required: true, description: "準備商業發票和裝箱單" },
      { title: "出口報關資料提交", assignee: "exporter", offsetTo: "ETD", offsetDays: -2, required: true, description: "提交出口報關所需文件" },
      { title: "取得提單/電放", assignee: "forwarder", offsetTo: "ETD", offsetDays: 2, required: true, description: "取得海運提單或電放指示" },
      { title: "通知進口商到貨", assignee: "exporter", offsetTo: "ETA", offsetDays: 0, required: true, description: "通知進口商貨物到港" }
    ],
    air: [
      { title: "供應商數量確認", assignee: "supplier", offsetDays: 1, required: true, description: "確認最終出貨數量" },
      { title: "安排空運訂艙", assignee: "forwarder", offsetDays: 2, required: true, description: "向航空公司訂艙" },
      { title: "保險加保", assignee: "exporter", offsetTo: "ETD", offsetDays: -1, required: true, description: "為貨物投保運輸險" },
      { title: "Invoice/PL 準備", assignee: "exporter", offsetTo: "ETD", offsetDays: -1, required: true, description: "準備商業發票和裝箱單" },
      { title: "航空提單 AWB", assignee: "forwarder", offsetTo: "ETD", offsetDays: 1, required: true, description: "取得航空提單" },
      { title: "通知進口商到貨", assignee: "exporter", offsetTo: "ETA", offsetDays: 0, required: true, description: "通知進口商貨物到港" }
    ]
  },
  DDP: {
    sea: [
      { title: "供應商數量/裝箱確認", assignee: "supplier", offsetDays: 2, required: true, description: "確認最終出貨數量和裝箱明細" },
      { title: "安排拖車到港", assignee: "forwarder", offsetDays: 5, required: true, description: "安排拖車到港口並預約時段" },
      { title: "保險加保", assignee: "exporter", offsetTo: "ETD", offsetDays: -3, required: true, description: "為貨物投保運輸險" },
      { title: "Invoice/PL 準備", assignee: "exporter", offsetTo: "ETD", offsetDays: -3, required: true, description: "準備商業發票和裝箱單" },
      { title: "出口報關資料提交", assignee: "exporter", offsetTo: "ETD", offsetDays: -2, required: true, description: "提交出口報關所需文件" },
      { title: "取得提單/電放", assignee: "forwarder", offsetTo: "ETD", offsetDays: 2, required: true, description: "取得海運提單或電放指示" },
      { title: "目的港清關安排", assignee: "forwarder", offsetTo: "ETA", offsetDays: 1, required: true, description: "安排目的港清關手續" },
      { title: "末端配送安排", assignee: "forwarder", offsetTo: "ETA", offsetDays: 3, required: true, description: "安排貨物末端配送" },
      { title: "通知進口商到貨", assignee: "exporter", offsetTo: "Delivery", offsetDays: 0, required: true, description: "通知進口商貨物送達" }
    ],
    air: [
      { title: "供應商數量確認", assignee: "supplier", offsetDays: 1, required: true, description: "確認最終出貨數量" },
      { title: "安排空運訂艙", assignee: "forwarder", offsetDays: 2, required: true, description: "向航空公司訂艙" },
      { title: "保險加保", assignee: "exporter", offsetTo: "ETD", offsetDays: -1, required: true, description: "為貨物投保運輸險" },
      { title: "Invoice/PL 準備", assignee: "exporter", offsetTo: "ETD", offsetDays: -1, required: true, description: "準備商業發票和裝箱單" },
      { title: "航空提單 AWB", assignee: "forwarder", offsetTo: "ETD", offsetDays: 1, required: true, description: "取得航空提單" },
      { title: "目的港清關安排", assignee: "forwarder", offsetTo: "ETA", offsetDays: 1, required: true, description: "安排目的港清關手續" },
      { title: "末端配送安排", assignee: "forwarder", offsetTo: "ETA", offsetDays: 2, required: true, description: "安排貨物末端配送" },
      { title: "通知進口商到貨", assignee: "exporter", offsetTo: "Delivery", offsetDays: 0, required: true, description: "通知進口商貨物送達" }
    ]
  }
};

// 文件模板定義
export const DocTemplates: Record<string, DocTemplate[]> = {
  FOB: [
    { type: "Invoice", required: true, description: "商業發票" },
    { type: "PackingList", required: true, description: "裝箱單" },
    { type: "BL", required: true, description: "海運提單" }
  ],
  CIF: [
    { type: "Invoice", required: true, description: "商業發票" },
    { type: "PackingList", required: true, description: "裝箱單" },
    { type: "BL", required: true, description: "海運提單" },
    { type: "Insurance", required: true, description: "保險單" }
  ],
  DDP: [
    { type: "Invoice", required: true, description: "商業發票" },
    { type: "PackingList", required: true, description: "裝箱單" },
    { type: "AWB", required: true, description: "航空提單" },
    { type: "Insurance", required: true, description: "保險單" },
    { type: "Others", required: true, description: "進口許可證" },
    { type: "Others", required: true, description: "稅費單據" }
  ]
};

// 根據 Incoterm 和運輸方式獲取任務模板
export function getTaskTemplates(incoterm: string, transportMode: string): TaskTemplate[] {
  return TaskTemplates[incoterm]?.[transportMode] || [];
}

// 根據 Incoterm 獲取文件模板
export function getDocTemplates(incoterm: string): DocTemplate[] {
  return DocTemplates[incoterm] || [];
}
