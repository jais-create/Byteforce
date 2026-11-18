export type PageId =
  | 'dashboard'
  | 'inventory'
  | 'forecasting'
  | 'replenishment'
  | 'purchase-orders'
  | 'suppliers'
  | 'alerts'
  | 'assistant'
  | 'settings';

export type ProductCategory =
  | 'Peripherals'
  | 'Audio'
  | 'Laptops & Computing'
  | 'Monitors & Displays'
  | 'Networking'
  | 'Storage & Memory'
  | 'Accessories & Power';

export type StockStatus =
  | 'Out of Stock'
  | 'Critical'
  | 'Low Stock'
  | 'Healthy'
  | 'Excess';

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  avgDeliveryDays: number;
  reliabilityScore: number; // 0 - 100
  priceCompetitiveness: number; // 0 - 100
  priceMultiplier: number; // e.g. 0.94 to 1.08 relative to baseline
  categories: ProductCategory[];
  paymentTerms: string;
  activeContracts: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  currentStock: number;
  minStock: number;
  maxStock: number;
  dailyAvgDemand: number;
  demandTrendPct: number; // e.g. +25 or -8
  supplierId: string;
  unitPrice: number; // wholesale / replenishment cost per unit
  retailPrice: number;
  warehouseLocation: string;
  lastRestocked: string;
}

export type RecommendationPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type RecommendationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Ordered';

export interface ReplenishmentRecommendation {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  dailyAvgDemand: number;
  predictedDemand15d: number;
  daysToStockout: number;
  supplierId: string;
  supplierName: string;
  supplierDeliveryDays: number;
  recommendedQty: number;
  safetyBufferUnits: number;
  leadTimeDemandUnits: number;
  estimatedCost: number;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  reasoning: string;
  demandTrendPct: number;
  generatedAt: string;
  linkedPoId?: string;
}

export type POStatus = 'Pending' | 'Approved' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  orderDate: string;
  expectedDeliveryDate: string;
  status: POStatus;
  notes?: string;
}

export type AlertCategory =
  | 'Critical Stock'
  | 'Low Inventory'
  | 'Predicted Stockout'
  | 'Delayed Delivery'
  | 'Excess Inventory';

export type AlertSeverity = 'Critical' | 'Warning' | 'Info';

export interface SmartAlert {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  severity: AlertSeverity;
  timestamp: string;
  productId?: string;
  sku?: string;
  resolved: boolean;
}

export interface AppSettings {
  companyName: string;
  warehouseName: string;
  safetyBufferDays: number;
  criticalDaysThreshold: number;
  lowStockBufferMultiplier: number;
  autoApproveThresholdUsd: number;
  emailDigestEnabled: boolean;
  slackAlertsEnabled: boolean;
  forecastConfidenceModel: 'Ensemble Prophet + XGBoost' | 'Seasonal ARIMA' | 'Adaptive Exponential';
}

export interface ToastNotification {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'info' | 'warning' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionLink?: {
    label: string;
    page: PageId;
    focusProductId?: string;
  };
}
