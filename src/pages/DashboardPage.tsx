import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  PackageX,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStockSense } from '../context/StockSenseContext';
import {
  formatCurrency,
  getDaysToStockout,
  getStockStatus,
} from '../utils/inventoryEngine';

const PIE_COLORS = ['#2563EB', '#0D9488', '#7C3AED', '#D97706', '#DC2626', '#0284C7', '#475569'];

export const DashboardPage: React.FC = () => {
  const {
    products,
    recommendations,
    settings,
    kpis,
    lastAnalysisTime,
    isAnalyzing,
    runAiAnalysis,
    setActivePage,
    openProductForecast,
  } = useStockSense();

  // 1. Sales & Demand Trends Line Chart (14-day aggregate velocity)
  const demandTrendSeries = useMemo(() => {
    const baseDaily = products.reduce((sum, p) => sum + p.dailyAvgDemand, 0);
    const days = [
      'Nov 5',
      'Nov 7',
      'Nov 9',
      'Nov 11',
      'Nov 13',
      'Nov 15',
      'Nov 17',
      'Nov 19 (Est)',
      'Nov 21 (Est)',
      'Nov 23 (Est)',
      'Nov 25 (Est)',
    ];
    return days.map((label, idx) => {
      const isForecast = idx >= 7;
      const wave = Math.sin(idx * 0.8) * 18;
      const growth = idx * 9;
      const actual = !isForecast ? Math.round(baseDaily * 0.92 + wave + growth) : undefined;
      const forecast =
        idx >= 6 ? Math.round(baseDaily * 0.95 + wave * 0.7 + growth * 1.15) : undefined;
      return {
        date: label,
        actualSales: actual,
        predictedDemand: forecast,
      };
    });
  }, [products]);

  // 2. Inventory Distribution Pie Chart by Category Value
  const categoryDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const val = p.currentStock * p.unitPrice;
      map.set(p.category, (map.get(p.category) ?? 0) + val);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  // 3. Top-Selling Products Bar Chart
  const topSellingData = useMemo(() => {
    return [...products]
      .sort((a, b) => b.dailyAvgDemand - a.dailyAvgDemand)
      .slice(0, 7)
      .map((p) => ({
        name: p.name.length > 18 ? `${p.name.slice(0, 17)}…` : p.name,
        fullName: p.name,
        dailyDemand: p.dailyAvgDemand,
        currentStock: p.currentStock,
      }));
  }, [products]);

  // 4. Stock Level Monitoring Chart (At-risk & Hero SKUs vs Min Threshold)
  const stockMonitorData = useMemo(() => {
    return [...products]
      .sort((a, b) => getDaysToStockout(a) - getDaysToStockout(b))
      .slice(0, 7)
      .map((p) => ({
        name: p.name.length > 15 ? `${p.name.slice(0, 14)}…` : p.name,
        currentStock: p.currentStock,
        minThreshold: p.minStock,
        status: getStockStatus(p, settings),
      }));
  }, [products, settings]);

  // Dynamic AI Insights aligned with demo scenario
  const aiInsights = useMemo(() => {
    const wirelessMouse = products.find((p) => p.id === 'prod-001');
    const headphones = products.find((p) => p.id === 'prod-002');
    const keyboards = products.find((p) => p.id === 'prod-003');
    const immediateCount = recommendations.filter(
      (r) => (r.priority === 'Critical' || r.priority === 'High') && r.status === 'Pending'
    ).length;

    const list = [];

    if (wirelessMouse) {
      const days = getDaysToStockout(wirelessMouse);
      list.push({
        id: 'ins-1',
        title: `Wireless Mouse is expected to run out of stock in ${days} days.`,
        detail: `${wirelessMouse.currentStock} units on hand · ${wirelessMouse.dailyAvgDemand} units/day burn · 5-day supplier lead time.`,
        severity: 'Critical' as const,
        actionLabel: 'Inspect Reorder',
        onClick: () => setActivePage('replenishment'),
      });
    }

    if (headphones) {
      list.push({
        id: 'ins-2',
        title: `Demand for Bluetooth Headphones has increased by ${headphones.demandTrendPct}%.`,
        detail: `Velocity trending above seasonal baseline (${headphones.dailyAvgDemand} units/day). Update 15-day forecast buffer.`,
        severity: 'Warning' as const,
        actionLabel: 'View Forecast',
        onClick: () => openProductForecast(headphones.id, 'forecast'),
      });
    }

    if (keyboards) {
      const rec = recommendations.find((r) => r.productId === keyboards.id);
      list.push({
        id: 'ins-3',
        title: `Consider replenishing ${rec?.recommendedQty ?? 120} units of Mechanical Keyboards.`,
        detail: `${keyboards.currentStock} units remaining against ${keyboards.minStock}-unit minimum safety floor.`,
        severity: 'Info' as const,
        actionLabel: 'Review Plan',
        onClick: () => setActivePage('replenishment'),
      });
    }

    list.push({
      id: 'ins-4',
      title: `${immediateCount} high-priority products require immediate attention.`,
      detail: `Review AI-calculated reorder quantities and generate purchase orders before supplier cutoffs.`,
      severity: immediateCount > 0 ? ('Warning' as const) : ('Healthy' as const),
      actionLabel: 'Open Replenishment',
      onClick: () => setActivePage('replenishment'),
    });

    return list;
  }, [products, recommendations, setActivePage, openProductForecast]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Inventory Operations Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock health, demand velocity, and automated replenishment intelligence across{' '}
            <span className="font-mono tabular-nums font-medium text-slate-700">
              {kpis.totalProducts}
            </span>{' '}
            SKUs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => openProductForecast('prod-001', 'simulation')}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            What-If Simulator
          </button>
          <button
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing Inventory...' : 'Run AI Inventory Analysis'}
          </button>
        </div>
      </div>

      {/* Prominent AI Agent Status Card */}
      <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-sm font-semibold text-white">
                StockSense AI Replenishment Agent
              </h2>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Active Monitoring
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Continuously evaluating lead-time risk, 14-day demand elasticity, and safety buffers.
              Critical alert detected on <span className="text-white font-medium">Wireless Mouse</span>{' '}
              (1.5 days to stockout vs. 5-day supplier lead time).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 shrink-0">
          <div>
            <div className="text-[11px] text-slate-400">Products Analyzed</div>
            <div className="text-lg font-semibold font-mono tabular-nums text-white mt-0.5">
              {kpis.totalProducts}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Recommendations</div>
            <div className="text-lg font-semibold font-mono tabular-nums text-teal-400 mt-0.5">
              {recommendations.length}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Last Analysis</div>
            <div className="text-xs font-mono tabular-nums text-slate-200 mt-1.5 whitespace-nowrap">
              {lastAnalysisTime}
            </div>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <button
          onClick={() => setActivePage('inventory')}
          className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Products</span>
            <Boxes className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {kpis.totalProducts}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active catalog SKUs</div>
        </button>

        <button
          onClick={() => setActivePage('inventory')}
          className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Inventory Value</span>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {formatCurrency(kpis.totalInventoryValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Wholesale valuation</div>
        </button>

        <button
          onClick={() => setActivePage('inventory')}
          className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Low Stock Items</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 mt-2">
            {kpis.lowStockCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {kpis.criticalCount} critical · below floor
          </div>
        </button>

        <button
          onClick={() => setActivePage('alerts')}
          className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-red-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Out of Stock</span>
            <PackageX className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-600 mt-2">
            {kpis.outOfStockCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Zero units available</div>
        </button>

        <button
          onClick={() => setActivePage('purchase-orders')}
          className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Pending Reorders</span>
            <ClipboardList className="h-4 w-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {kpis.pendingReordersCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">AI queue + active POs</div>
        </button>

        <button
          onClick={() => setActivePage('forecasting')}
          className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-red-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Predicted Stockouts</span>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-600 mt-2">
            {kpis.predictedStockoutsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Within next 7 days</div>
        </button>
      </div>

      {/* Main Analytics Row: Demand Trends + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales and Demand Trends Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Sales & Demand Trends
              </h2>
              <p className="text-xs text-slate-500">
                Aggregate daily unit consumption vs. AI 7-day demand forecast
              </p>
            </div>
            <button
              onClick={() => setActivePage('forecasting')}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
            >
              Deep-Dive Forecasting
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandTrendSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="actualSales"
                  name="Actual Units Sold"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predictedDemand"
                  name="AI Predicted Demand"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h2 className="font-display text-base font-semibold text-slate-900">AI Insights</h2>
            </div>
            <span className="text-xs text-slate-500">Live Signals</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-900 leading-snug">
                    {insight.title}
                  </div>
                  <span
                    className={`shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                      insight.severity === 'Critical'
                        ? 'bg-red-50 text-red-700'
                        : insight.severity === 'Warning'
                          ? 'bg-amber-50 text-amber-800'
                          : insight.severity === 'Healthy'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {insight.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{insight.detail}</p>
                <button
                  onClick={insight.onClick}
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  {insight.actionLabel}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts Grid: Distribution Pie, Top-Selling Bar, Stock Level Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Inventory Value Distribution
          </h2>
          <p className="text-xs text-slate-500 mb-3">Capital allocation by product category</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top-Selling Products Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Top-Selling Products
          </h2>
          <p className="text-xs text-slate-500 mb-3">Highest daily unit demand velocity</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topSellingData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: '#334155' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="dailyDemand" name="Units / Day" fill="#0D9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Level Monitoring Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Stock Level Monitoring
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Current stock vs. minimum threshold for at-risk SKUs
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stockMonitorData}
                margin={{ top: 4, right: 12, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={44}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="currentStock" name="Current Stock" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="minThreshold" name="Min Threshold" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
