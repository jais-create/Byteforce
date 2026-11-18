import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Bell,
  Bot,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  X,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useStockSense } from '../context/StockSenseContext';
import { PageId } from '../types/inventory';
import { formatCurrency, getDaysToStockout } from '../utils/inventoryEngine';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'forecasting', label: 'AI Forecasting', icon: TrendingUp },
  { id: 'replenishment', label: 'Replenishment', icon: SlidersHorizontal },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
  { id: 'suppliers', label: 'Suppliers', icon: Building2 },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'assistant', label: 'AI Assistant', icon: Bot },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activePage,
    setActivePage,
    products,
    suppliers,
    purchaseOrders,
    alerts,
    kpis,
    toasts,
    dismissToast,
    openProductForecast,
  } = useStockSense();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return { products: [], suppliers: [], pos: [] };
    return {
      products: products
        .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
        .slice(0, 5),
      suppliers: suppliers.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 3),
      pos: purchaseOrders
        .filter(
          (po) =>
            po.id.toLowerCase().includes(q) || po.productName.toLowerCase().includes(q)
        )
        .slice(0, 3),
    };
  }, [globalQuery, products, suppliers, purchaseOrders]);

  const hasResults =
    searchResults.products.length > 0 ||
    searchResults.suppliers.length > 0 ||
    searchResults.pos.length > 0;

  const unresolvedAlerts = useMemo(() => alerts.filter((a) => !a.resolved), [alerts]);

  const handleNavClick = (id: PageId) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Persistent Dark Navy Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1426] text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Block */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-base font-bold tracking-tight text-white leading-none">
                StockSense
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-none">
                AI Replenishment Agent
              </div>
            </div>
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const badgeCount =
              item.id === 'alerts'
                ? kpis.unresolvedAlertsCount
                : item.id === 'replenishment'
                  ? kpis.criticalCount + kpis.outOfStockCount
                  : 0;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                {badgeCount > 0 && (
                  <span
                    className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : item.id === 'alerts'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Tagline Card */}
        <div className="p-4 border-t border-slate-800/80 shrink-0">
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3">
            <div className="text-xs font-medium text-white">StockSense Intelligence</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Predict Smarter. Restock Faster. Never Run Out.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="font-display font-bold text-slate-900 text-sm whitespace-nowrap">
                StockSense
              </span>
            </div>

            {/* Global Search */}
            <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setGlobalQuery(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Search SKUs, products, suppliers, or POs..."
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
              {globalQuery && (
                <button
                  onClick={() => setGlobalQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Search Quick-Jump Dropdown */}
              {searchFocused && globalQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                  {!hasResults ? (
                    <div className="p-4 text-sm text-slate-500 text-center">
                      No matching SKUs, suppliers, or purchase orders found.
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {searchResults.products.length > 0 && (
                        <div className="p-2">
                          <div className="px-2 py-1 text-[11px] font-medium text-slate-400">
                            Products
                          </div>
                          {searchResults.products.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                openProductForecast(p.id, 'forecast');
                                setSearchFocused(false);
                                setGlobalQuery('');
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors"
                            >
                              <div className="min-w-0 pr-3">
                                <div className="text-sm font-medium text-slate-900 truncate">
                                  {p.name}
                                </div>
                                <div className="text-xs text-slate-500 font-mono">
                                  {p.sku} · {p.category}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-mono tabular-nums font-medium text-slate-900">
                                  {p.currentStock} units
                                </div>
                                <div className="text-[11px] text-slate-500 tabular-nums">
                                  {getDaysToStockout(p)}d left
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.suppliers.length > 0 && (
                        <div className="p-2">
                          <div className="px-2 py-1 text-[11px] font-medium text-slate-400">
                            Suppliers
                          </div>
                          {searchResults.suppliers.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setActivePage('suppliers');
                                setSearchFocused(false);
                                setGlobalQuery('');
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-slate-50"
                            >
                              <span className="text-sm font-medium text-slate-900">{s.name}</span>
                              <span className="text-xs text-slate-500 tabular-nums">
                                {s.avgDeliveryDays}d lead · {s.reliabilityScore}% rel
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.pos.length > 0 && (
                        <div className="p-2">
                          <div className="px-2 py-1 text-[11px] font-medium text-slate-400">
                            Purchase Orders
                          </div>
                          {searchResults.pos.map((po) => (
                            <button
                              key={po.id}
                              onClick={() => {
                                setActivePage('purchase-orders');
                                setSearchFocused(false);
                                setGlobalQuery('');
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-slate-50"
                            >
                              <span className="text-sm font-mono text-slate-900">
                                {po.id} · {po.productName}
                              </span>
                              <span className="text-xs font-mono tabular-nums text-slate-600">
                                {formatCurrency(po.totalCost)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Date + Notifications + User Profile */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="hidden md:block text-xs text-slate-500 tabular-nums whitespace-nowrap">
              Nov 18, 2026
            </div>

            <div className="h-4 w-px bg-slate-200 hidden md:block" />

            {/* Notification Bell Popover */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="Open notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {unresolvedAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-mono tabular-nums flex items-center justify-center">
                    {unresolvedAlerts.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      Active Alerts ({unresolvedAlerts.length})
                    </span>
                    <button
                      onClick={() => {
                        setActivePage('alerts');
                        setNotifOpen(false);
                      }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                    >
                      View All
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {unresolvedAlerts.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        All alerts are resolved.
                      </div>
                    ) : (
                      unresolvedAlerts.slice(0, 5).map((alt) => (
                        <button
                          key={alt.id}
                          onClick={() => {
                            setActivePage('alerts');
                            setNotifOpen(false);
                          }}
                          className="w-full p-3.5 text-left hover:bg-slate-50 transition-colors flex items-start gap-3"
                        >
                          <AlertCircle
                            className={`h-4 w-4 mt-0.5 shrink-0 ${
                              alt.severity === 'Critical'
                                ? 'text-red-600'
                                : alt.severity === 'Warning'
                                  ? 'text-amber-600'
                                  : 'text-blue-600'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 truncate">
                              {alt.title}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {alt.description}
                            </p>
                            <div className="text-[11px] text-slate-400 mt-1">{alt.timestamp}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                  <img
                    src="/src/assets/images/avatar_operations_lead_1794992467414.jpg"
                    alt="Claire Mercer, VP of Supply Chain"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight whitespace-nowrap">
                    Claire Mercer
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight whitespace-nowrap">
                    VP Supply Chain
                  </div>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-900">Claire Mercer</div>
                    <div className="text-[11px] text-slate-500">c.mercer@apextech.io</div>
                  </div>
                  <button
                    onClick={() => {
                      setActivePage('settings');
                      setProfileOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    Workspace Settings
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('assistant');
                      setProfileOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Bot className="h-3.5 w-3.5 text-slate-400" />
                    Ask StockSense AI
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Scrollable Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-slate-200 rounded-xl shadow-lg p-3.5 flex items-start gap-3 transition-all"
          >
            {toast.variant === 'success' && (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            )}
            {toast.variant === 'warning' && (
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            )}
            {toast.variant === 'error' && (
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            )}
            {toast.variant === 'info' && (
              <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900">{toast.title}</div>
              {toast.description && (
                <div className="text-xs text-slate-600 mt-0.5 leading-snug">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
