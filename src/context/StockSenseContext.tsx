import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  INITIAL_ALERTS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SUPPLIERS,
} from '../data/mockData';
import {
  AppSettings,
  ChatMessage,
  PageId,
  POStatus,
  Product,
  PurchaseOrder,
  ReplenishmentRecommendation,
  SmartAlert,
  Supplier,
  ToastNotification,
} from '../types/inventory';
import {
  buildRecommendations,
  generateAssistantReply,
  getDaysToStockout,
  getStockStatus,
} from '../utils/inventoryEngine';

interface StockSenseContextValue {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  forecastSubTab: 'forecast' | 'simulation';
  setForecastSubTab: (tab: 'forecast' | 'simulation') => void;
  selectedForecastProductId: string;
  setSelectedForecastProductId: (id: string) => void;

  products: Product[];
  suppliers: Supplier[];
  recommendations: ReplenishmentRecommendation[];
  purchaseOrders: PurchaseOrder[];
  alerts: SmartAlert[];
  settings: AppSettings;

  lastAnalysisTime: string;
  isAnalyzing: boolean;
  runAiAnalysis: () => void;

  addProduct: (product: Omit<Product, 'id' | 'lastRestocked'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  approveRecommendation: (recId: string) => void;
  rejectRecommendation: (recId: string) => void;
  generatePoFromRecommendation: (recId: string) => PurchaseOrder | null;

  createPurchaseOrder: (payload: {
    supplierId: string;
    productId: string;
    quantity: number;
    expectedDeliveryDate: string;
    notes?: string;
  }) => void;
  updatePoStatus: (poId: string, status: POStatus) => void;
  cancelPurchaseOrder: (poId: string) => void;

  resolveAlert: (alertId: string) => void;
  reopenAlert: (alertId: string) => void;

  chatMessages: ChatMessage[];
  isAssistantTyping: boolean;
  sendChatMessage: (text: string) => void;
  clearChat: () => void;

  updateSettings: (partial: Partial<AppSettings>) => void;
  resetDemoData: () => void;

  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  dismissToast: (id: string) => void;

  openProductForecast: (productId: string, tab?: 'forecast' | 'simulation') => void;

  // Derived KPI metrics
  kpis: {
    totalProducts: number;
    totalInventoryValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    criticalCount: number;
    pendingReordersCount: number;
    predictedStockoutsCount: number;
    unresolvedAlertsCount: number;
  };
}

const StockSenseContext = createContext<StockSenseContextValue | undefined>(undefined);

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    role: 'assistant',
    timestamp: '01:00 AM',
    content:
      'Hello! I am StockSense AI, continuously monitoring your 100-SKU electronics inventory. Right now, Wireless Mouse (SS-PER-001) has only 12 units left (1.5 days to stockout) and 4 other high-velocity products need attention. Ask me anything about stockout risks, reorder quantities, supplier pricing, or replenishment budgets.',
    actionLink: {
      label: 'Inspect Critical Reorders',
      page: 'replenishment',
    },
  },
];

export const StockSenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [forecastSubTab, setForecastSubTab] = useState<'forecast' | 'simulation'>('forecast');
  const [selectedForecastProductId, setSelectedForecastProductId] = useState<string>('prod-001');

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [recommendations, setRecommendations] = useState<ReplenishmentRecommendation[]>(() =>
    buildRecommendations(INITIAL_PRODUCTS, INITIAL_SUPPLIERS, [], DEFAULT_SETTINGS)
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [alerts, setAlerts] = useState<SmartAlert[]>(INITIAL_ALERTS);

  const [lastAnalysisTime, setLastAnalysisTime] = useState<string>('Today, 01:00 AM');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isAssistantTyping, setIsAssistantTyping] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastNotification, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const syncRecommendations = useCallback(
    (nextProducts: Product[], nextSettings: AppSettings) => {
      setRecommendations((prevRecs) =>
        buildRecommendations(nextProducts, suppliers, prevRecs, nextSettings)
      );
    },
    [suppliers]
  );

  const runAiAnalysis = useCallback(() => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const nowLabel = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const updated = buildRecommendations(products, suppliers, recommendations, settings).map(
        (rec) => ({
          ...rec,
          generatedAt: `Today, ${nowLabel}`,
        })
      );
      setRecommendations(updated);
      setLastAnalysisTime(`Today, ${nowLabel}`);
      setIsAnalyzing(false);
      addToast({
        title: 'AI Inventory Analysis Complete',
        description: `Scanned ${products.length} SKUs and refreshed ${updated.length} replenishment recommendations.`,
        variant: 'success',
      });
    }, 650);
  }, [isAnalyzing, products, suppliers, recommendations, settings, addToast]);

  const addProduct = useCallback(
    (payload: Omit<Product, 'id' | 'lastRestocked'>) => {
      const newProduct: Product = {
        ...payload,
        id: `prod-${Date.now()}`,
        lastRestocked: '2026-11-18',
      };
      setProducts((prev) => {
        const next = [newProduct, ...prev];
        syncRecommendations(next, settings);
        return next;
      });
      addToast({
        title: 'Product Added',
        description: `${newProduct.name} (${newProduct.sku}) added to inventory.`,
        variant: 'success',
      });
    },
    [settings, syncRecommendations, addToast]
  );

  const updateProduct = useCallback(
    (updated: Product) => {
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === updated.id ? updated : p));
        syncRecommendations(next, settings);
        return next;
      });
      addToast({
        title: 'Product Updated',
        description: `${updated.name} stock and threshold parameters saved.`,
        variant: 'success',
      });
    },
    [settings, syncRecommendations, addToast]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      const target = products.find((p) => p.id === productId);
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== productId);
        syncRecommendations(next, settings);
        return next;
      });
      addToast({
        title: 'Product Removed',
        description: target ? `${target.name} removed from active catalog.` : 'Product removed.',
        variant: 'info',
      });
    },
    [products, settings, syncRecommendations, addToast]
  );

  const approveRecommendation = useCallback(
    (recId: string) => {
      let targetName = '';
      setRecommendations((prev) =>
        prev.map((r) => {
          if (r.id === recId) {
            targetName = r.productName;
            return { ...r, status: 'Approved' };
          }
          return r;
        })
      );
      addToast({
        title: 'Recommendation Approved',
        description: `${targetName} replenishment approved and ready for PO generation.`,
        variant: 'success',
      });
    },
    [addToast]
  );

  const rejectRecommendation = useCallback(
    (recId: string) => {
      let targetName = '';
      setRecommendations((prev) =>
        prev.map((r) => {
          if (r.id === recId) {
            targetName = r.productName;
            return { ...r, status: 'Rejected' };
          }
          return r;
        })
      );
      addToast({
        title: 'Recommendation Dismissed',
        description: `${targetName} recommendation marked as rejected.`,
        variant: 'warning',
      });
    },
    [addToast]
  );

  const generatePoFromRecommendation = useCallback(
    (recId: string): PurchaseOrder | null => {
      const rec = recommendations.find((r) => r.id === recId);
      if (!rec) return null;
      const product = products.find((p) => p.id === rec.productId);
      const unitPrice = product?.unitPrice ?? rec.estimatedCost / Math.max(1, rec.recommendedQty);

      const base = new Date('2026-11-18T00:00:00');
      const deliveryDate = new Date(base.getTime() + rec.supplierDeliveryDays * 86400000)
        .toISOString()
        .slice(0, 10);

      const newPo: PurchaseOrder = {
        id: `PO-2026-${Math.floor(1045 + Math.random() * 8900)}`,
        supplierId: rec.supplierId,
        supplierName: rec.supplierName,
        productId: rec.productId,
        productName: rec.productName,
        sku: rec.sku,
        quantity: rec.recommendedQty,
        unitPrice,
        totalCost: Math.round(rec.recommendedQty * unitPrice * 100) / 100,
        orderDate: '2026-11-18',
        expectedDeliveryDate: deliveryDate,
        status: 'Approved',
        notes: `AI Replenishment Order (${rec.priority} priority) — Covers ${rec.supplierDeliveryDays}d lead time + ${settings.safetyBufferDays}d safety buffer.`,
      };

      setPurchaseOrders((prev) => [newPo, ...prev]);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status: 'Ordered', linkedPoId: newPo.id } : r))
      );

      addToast({
        title: `Purchase Order ${newPo.id} Created`,
        description: `Ordered ${newPo.quantity} units of ${newPo.productName} from ${newPo.supplierName}.`,
        variant: 'success',
      });

      return newPo;
    },
    [recommendations, products, settings.safetyBufferDays, addToast]
  );

  const createPurchaseOrder = useCallback(
    (payload: {
      supplierId: string;
      productId: string;
      quantity: number;
      expectedDeliveryDate: string;
      notes?: string;
    }) => {
      const supplier = suppliers.find((s) => s.id === payload.supplierId);
      const product = products.find((p) => p.id === payload.productId);
      if (!supplier || !product) return;

      const newPo: PurchaseOrder = {
        id: `PO-2026-${Math.floor(1045 + Math.random() * 8900)}`,
        supplierId: supplier.id,
        supplierName: supplier.name,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: payload.quantity,
        unitPrice: product.unitPrice,
        totalCost: Math.round(payload.quantity * product.unitPrice * 100) / 100,
        orderDate: '2026-11-18',
        expectedDeliveryDate: payload.expectedDeliveryDate,
        status: 'Pending',
        notes: payload.notes,
      };

      setPurchaseOrders((prev) => [newPo, ...prev]);
      addToast({
        title: `Purchase Order ${newPo.id} Created`,
        description: `${payload.quantity} units of ${product.name} submitted to ${supplier.name}.`,
        variant: 'success',
      });
    },
    [suppliers, products, addToast]
  );

  const updatePoStatus = useCallback(
    (poId: string, status: POStatus) => {
      const targetPo = purchaseOrders.find((p) => p.id === poId);
      setPurchaseOrders((prev) =>
        prev.map((po) => (po.id === poId ? { ...po, status } : po))
      );

      if (status === 'Delivered' && targetPo && targetPo.status !== 'Delivered') {
        setProducts((prev) => {
          const next = prev.map((prod) =>
            prod.id === targetPo.productId
              ? {
                  ...prod,
                  currentStock: prod.currentStock + targetPo.quantity,
                  lastRestocked: '2026-11-18',
                }
              : prod
          );
          syncRecommendations(next, settings);
          return next;
        });
        setAlerts((prev) =>
          prev.map((alt) =>
            alt.productId === targetPo.productId && alt.category !== 'Excess Inventory'
              ? { ...alt, resolved: true }
              : alt
          )
        );
        addToast({
          title: `Shipment Received (${poId})`,
          description: `+${targetPo.quantity} units added to ${targetPo.productName} stock.`,
          variant: 'success',
        });
      } else {
        addToast({
          title: `Order ${poId} Updated`,
          description: `Status transitioned to ${status}.`,
          variant: 'info',
        });
      }
    },
    [purchaseOrders, settings, syncRecommendations, addToast]
  );

  const cancelPurchaseOrder = useCallback(
    (poId: string) => {
      setPurchaseOrders((prev) =>
        prev.map((po) => (po.id === poId ? { ...po, status: 'Cancelled' } : po))
      );
      addToast({
        title: `Order ${poId} Cancelled`,
        description: 'Pending purchase order has been cancelled.',
        variant: 'warning',
      });
    },
    [addToast]
  );

  const resolveAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)));
      addToast({
        title: 'Alert Resolved',
        description: 'Notification marked as resolved.',
        variant: 'success',
      });
    },
    [addToast]
  );

  const reopenAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, resolved: false } : a)));
  }, []);

  const sendChatMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: `msg-u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setIsAssistantTyping(true);

      setTimeout(() => {
        const reply = generateAssistantReply(trimmed, {
          products,
          suppliers,
          recommendations,
          purchaseOrders,
          alerts,
          settings,
        });
        const botMsg: ChatMessage = {
          id: `msg-a-${Date.now()}`,
          role: 'assistant',
          content: reply.content,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          actionLink: reply.actionLink,
        };
        setChatMessages((prev) => [...prev, botMsg]);
        setIsAssistantTyping(false);
      }, 450);
    },
    [products, suppliers, recommendations, purchaseOrders, alerts, settings]
  );

  const clearChat = useCallback(() => {
    setChatMessages(INITIAL_CHAT_MESSAGES);
  }, []);

  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        syncRecommendations(products, next);
        return next;
      });
      addToast({
        title: 'Settings Saved',
        description: 'Replenishment parameters and alert rules updated.',
        variant: 'success',
      });
    },
    [products, syncRecommendations, addToast]
  );

  const resetDemoData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setSettings(DEFAULT_SETTINGS);
    setRecommendations(
      buildRecommendations(INITIAL_PRODUCTS, INITIAL_SUPPLIERS, [], DEFAULT_SETTINGS)
    );
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setAlerts(INITIAL_ALERTS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setLastAnalysisTime('Today, 01:00 AM');
    addToast({
      title: 'Demo Scenario Restored',
      description: 'Reset to 100-product baseline including Wireless Mouse critical alert.',
      variant: 'info',
    });
  }, [addToast]);

  const openProductForecast = useCallback(
    (productId: string, tab: 'forecast' | 'simulation' = 'forecast') => {
      setSelectedForecastProductId(productId);
      setForecastSubTab(tab);
      setActivePage('forecasting');
    },
    []
  );

  const kpis = useMemo(() => {
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let criticalCount = 0;
    let predictedStockoutsCount = 0;

    for (const p of products) {
      totalInventoryValue += p.currentStock * p.unitPrice;
      const status = getStockStatus(p, settings);
      if (status === 'Out of Stock') outOfStockCount++;
      else if (status === 'Critical') criticalCount++;
      else if (status === 'Low Stock') lowStockCount++;

      const days = getDaysToStockout(p);
      if (p.currentStock > 0 && days <= 7) {
        predictedStockoutsCount++;
      }
    }

    const pendingRecs = recommendations.filter(
      (r) => r.status === 'Pending' || r.status === 'Approved'
    ).length;
    const activePos = purchaseOrders.filter(
      (po) => po.status === 'Pending' || po.status === 'Approved' || po.status === 'Shipped'
    ).length;
    const unresolvedAlertsCount = alerts.filter((a) => !a.resolved).length;

    return {
      totalProducts: products.length,
      totalInventoryValue,
      lowStockCount: lowStockCount + criticalCount,
      outOfStockCount,
      criticalCount,
      pendingReordersCount: pendingRecs + activePos,
      predictedStockoutsCount,
      unresolvedAlertsCount,
    };
  }, [products, settings, recommendations, purchaseOrders, alerts]);

  return (
    <StockSenseContext.Provider
      value={{
        activePage,
        setActivePage,
        forecastSubTab,
        setForecastSubTab,
        selectedForecastProductId,
        setSelectedForecastProductId,
        products,
        suppliers,
        recommendations,
        purchaseOrders,
        alerts,
        settings,
        lastAnalysisTime,
        isAnalyzing,
        runAiAnalysis,
        addProduct,
        updateProduct,
        deleteProduct,
        approveRecommendation,
        rejectRecommendation,
        generatePoFromRecommendation,
        createPurchaseOrder,
        updatePoStatus,
        cancelPurchaseOrder,
        resolveAlert,
        reopenAlert,
        chatMessages,
        isAssistantTyping,
        sendChatMessage,
        clearChat,
        updateSettings,
        resetDemoData,
        toasts,
        addToast,
        dismissToast,
        openProductForecast,
        kpis,
      }}
    >
      {children}
    </StockSenseContext.Provider>
  );
};

export function useStockSense() {
  const ctx = useContext(StockSenseContext);
  if (!ctx) throw new Error('useStockSense must be used inside StockSenseProvider');
  return ctx;
}
