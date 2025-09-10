import { Order, Task, DocRef, CreateOrderInput, ID } from '../types/order';
import { getTaskTemplates, getDocTemplates } from './OrderTemplates';
import { Quote } from '../types/db';

export class OrdersService {
  private static readonly STORAGE_KEY = 'incoterm-orders';

  // 從報價建立訂單
  static createFromQuote(quote: Quote, input: CreateOrderInput): Order {
    const now = new Date().toISOString();
    const orderId = `order-${Date.now()}`;
    const orderCode = this.generateOrderCode();

    // 建立任務
    const tasks = this.createTasksFromTemplate(
      quote.inputs.incotermTo,
      input.transportMode,
      input.plan,
      now
    );

    // 建立文件清單
    const docs = this.createDocsFromTemplate(quote.inputs.incotermTo);

    const order: Order = {
      id: orderId,
      quoteId: quote.id,
      code: orderCode,
      status: 'accepted',
      incotermFrom: quote.inputs.incotermFrom,
      incotermTo: quote.inputs.incotermTo,
      transportMode: input.transportMode,
      currency: quote.inputs.currency,
      parties: input.parties,
      plan: input.plan || {},
      tasks,
      docs,
      notes: input.notes,
      createdAt: now,
      updatedAt: now
    };

    this.saveOrder(order);
    return order;
  }

  // 從模板建立任務
  private static createTasksFromTemplate(
    incoterm: string,
    transportMode: string,
    plan: Partial<Order['plan']> | undefined,
    createdAt: string
  ): Task[] {
    const templates = getTaskTemplates(incoterm, transportMode);
    
    return templates.map((template, index) => {
      const taskId = `task-${Date.now()}-${index}`;
      let dueAt: string | undefined;

      if (template.offsetTo && plan) {
        // 相對於里程碑計算截止日
        const milestoneDate = this.getMilestoneDate(template.offsetTo, plan);
        if (milestoneDate) {
          const dueDate = new Date(milestoneDate);
          dueDate.setDate(dueDate.getDate() + (template.offsetDays || 0));
          dueAt = dueDate.toISOString();
        }
      } else if (template.offsetDays) {
        // 相對於訂單建立日計算截止日
        const dueDate = new Date(createdAt);
        dueDate.setDate(dueDate.getDate() + template.offsetDays);
        dueAt = dueDate.toISOString();
      }

      return {
        id: taskId,
        title: template.title,
        dueAt,
        assignee: template.assignee,
        status: 'todo',
        description: template.description,
        createdAt,
        updatedAt: createdAt
      };
    });
  }

  // 從模板建立文件清單
  private static createDocsFromTemplate(incoterm: string): DocRef[] {
    const templates = getDocTemplates(incoterm);
    const now = new Date().toISOString();
    
    return templates.map((template, index) => ({
      id: `doc-${Date.now()}-${index}`,
      type: template.type,
      status: 'missing' as const,
      required: template.required,
      description: template.description,
      createdAt: now,
      updatedAt: now
    }));
  }

  // 獲取里程碑日期
  private static getMilestoneDate(milestone: string, plan: Partial<Order['plan']>): string | null {
    switch (milestone) {
      case 'Pickup': return plan.estPickupAt || null;
      case 'ETD': return plan.estPortETD || null;
      case 'ETA': return plan.estPortETA || null;
      case 'Delivery': return plan.estDeliveryAt || null;
      default: return null;
    }
  }

  // 生成訂單編號
  private static generateOrderCode(): string {
    const year = new Date().getFullYear();
    const orders = this.getAllOrders();
    const count = orders.length + 1;
    return `SO${year}-${count.toString().padStart(5, '0')}`;
  }

  // 儲存訂單
  static saveOrder(order: Order): void {
    const orders = this.getAllOrders();
    const index = orders.findIndex(o => o.id === order.id);
    
    if (index >= 0) {
      orders[index] = { ...order, updatedAt: new Date().toISOString() };
    } else {
      orders.push(order);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
  }

  // 獲取所有訂單
  static getAllOrders(): Order[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // 根據 ID 獲取訂單
  static getOrder(id: ID): Order | null {
    const orders = this.getAllOrders();
    return orders.find(o => o.id === id) || null;
  }

  // 根據報價 ID 獲取訂單
  static getOrderByQuoteId(quoteId: ID): Order | null {
    const orders = this.getAllOrders();
    return orders.find(o => o.quoteId === quoteId) || null;
  }

  // 更新訂單狀態
  static updateOrderStatus(id: ID, status: Order['status']): Order | null {
    const order = this.getOrder(id);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.saveOrder(order);
    return order;
  }

  // 更新任務狀態
  static updateTaskStatus(orderId: ID, taskId: ID, status: Task['status']): Order | null {
    const order = this.getOrder(orderId);
    if (!order) return null;

    const task = order.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.status = status;
    task.updatedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    this.saveOrder(order);
    return order;
  }

  // 更新文件狀態
  static updateDocStatus(orderId: ID, docId: ID, status: DocRef['status'], url?: string): Order | null {
    const order = this.getOrder(orderId);
    if (!order) return null;

    const doc = order.docs.find(d => d.id === docId);
    if (!doc) return null;

    doc.status = status;
    if (url) doc.url = url;
    doc.uploadedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    this.saveOrder(order);
    return order;
  }

  // 更新訂單計畫
  static updateOrderPlan(id: ID, plan: Partial<Order['plan']>): Order | null {
    const order = this.getOrder(id);
    if (!order) return null;

    order.plan = { ...order.plan, ...plan };
    order.updatedAt = new Date().toISOString();
    
    // 重新計算任務截止日
    order.tasks = this.recalculateTaskDueDates(order.tasks, order.plan);
    
    this.saveOrder(order);
    return order;
  }

  // 重新計算任務截止日
  private static recalculateTaskDueDates(tasks: Task[], plan: Order['plan']): Task[] {
    return tasks.map(task => {
      // 這裡可以根據新的計畫日期重新計算任務截止日
      // 暫時保持原有邏輯
      return task;
    });
  }

  // 刪除訂單
  static deleteOrder(id: ID): boolean {
    const orders = this.getAllOrders();
    const filtered = orders.filter(o => o.id !== id);
    
    if (filtered.length === orders.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
}
