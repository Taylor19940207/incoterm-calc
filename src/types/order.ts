export type ID = string;

export type OrderStatus = "accepted" | "booked" | "customs_ready" | "shipped" | "arrived" | "completed" | "canceled";
export type TaskStatus = "todo" | "doing" | "done" | "blocked";
export type TaskAssignee = "buyer" | "exporter" | "forwarder" | "importer" | "supplier";
export type DocType = "PI" | "Invoice" | "PackingList" | "BL" | "AWB" | "CO" | "Fumigation" | "Insurance" | "Others";
export type DocStatus = "missing" | "draft" | "review" | "final";
export type TransportMode = "air" | "sea" | "express" | "truck";

export interface Order {
  id: ID;
  quoteId: ID;
  code: string;                 // SO2025-00012
  status: OrderStatus;
  incotermFrom: "EXW" | "FOB" | "CFR" | "CIF" | "DAP" | "DDP";
  incotermTo: "EXW" | "FOB" | "CFR" | "CIF" | "DAP" | "DDP";
  transportMode: TransportMode;
  currency: "JPY" | "USD" | "EUR" | "TWD";

  parties: {
    supplier: { name: string; contact?: string };
    exporter: { name: string; contact?: string };     // 你
    importer: { name: string; contact?: string };
    forwarder?: { name: string; contact?: string };   // 貨代（可後填）
  };

  plan: {
    estPickupAt?: string;       // 預計提貨
    estPortETD?: string;        // 預計離港
    estPortETA?: string;        // 預計到港
    estDeliveryAt?: string;     // 預計送達
  };

  tasks: Task[];                // 待辦
  docs: DocRef[];               // 檔案清單
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: ID;
  title: string;                // 例如：向供應商索取形式發票
  dueAt?: string;               // 截止日
  assignee?: TaskAssignee;
  status: TaskStatus;
  related?: { type: "doc" | "milestone"; refId?: string };
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocRef {
  id: ID;
  type: DocType;
  status: DocStatus;
  url?: string;                 // 之後可用真後端/雲存儲
  required: boolean;
  description?: string;
  uploadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 任務模板定義
export interface TaskTemplate {
  title: string;
  assignee: TaskAssignee;
  offsetDays?: number;          // 相對於訂單建立日
  offsetTo?: "ETD" | "ETA" | "Pickup" | "Delivery"; // 相對於某個里程碑
  required: boolean;
  description?: string;
}

// 文件模板定義
export interface DocTemplate {
  type: DocType;
  required: boolean;
  description?: string;
}

// 訂單建立輸入
export interface CreateOrderInput {
  quoteId: ID;
  transportMode: TransportMode;
  parties: Order['parties'];
  plan?: Partial<Order['plan']>;
  notes?: string;
}
