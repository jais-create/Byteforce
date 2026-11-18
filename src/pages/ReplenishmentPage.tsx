import React, { useMemo, useState } from 'react';
import {
  Check,
  ClipboardCheck,
  Eye,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { RecommendationDrawer } from '../components/RecommendationDrawer';
import { PriorityLabel, RecStatusLabel } from '../components/StatusBadge';
import { useStockSense } from '../context/StockSenseContext';
import {
  RecommendationPriority,
  RecommendationStatus,
  ReplenishmentRecommendation,
} from '../types/inventory';
import { formatCurrencyExact } from '../utils/inventoryEngine';

export const ReplenishmentPage: React.FC = () => {
  const {
    recommendations,
    isAnalyzing,
    lastAnalysisTime,
    runAiAnalysis,
    approveRecommendation,
    rejectRecommendation,
    generatePoFromRecommendation,
    setActivePage,
  } = useStockSense();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RecommendationStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | RecommendationPriority>('All');
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);

  const selectedRec = useMemo(
    () => recommendations.find((r) => r.id === selectedRecId) ?? null,
    [recommendations, selectedRecId]
  );

  const filteredRecs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recommendations.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;
      if (q) {
        return (
          r.productName.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.supplierName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [recommendations, statusFilter, priorityFilter, searchQuery]);

  const summary = useMemo(() => {
    const pending = recommendations.filter((r) => r.status === 'Pending' || r.status === 'Approved');
    const critical = pending.filter((r) => r.priority === 'Critical');
    const totalUnits = pending.reduce((sum, r) => sum + r.recommendedQty, 0);
    const totalCost = pending.reduce((sum, r) => sum + r.estimatedCost, 0);
    return {
      pendingCount: pending.length,
      criticalCount: critical.length,
      totalUnits,
      totalCost,
    };
  }, [recommendations]);

  const wirelessMouseRec = useMemo(
    () => recommendations.find((r) => r.productId === 'prod-001'),
    [recommendations]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Smart AI Replenishment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated reorder quantities calibrated for supplier lead times, demand velocity, and safety buffers.
          </p>
        </div>

        <button
          onClick={runAiAnalysis}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Running AI Analysis...' : 'Run AI Inventory Analysis'}
        </button>
      </div>

      {/* Featured Demo Alert Banner for Wireless Mouse */}
      {wirelessMouseRec && wirelessMouseRec.status !== 'Ordered' && (
        <div className="bg-white border border-red-200 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  Critical Priority Detected: Wireless Mouse ({wirelessMouseRec.sku})
                </span>
                <PriorityLabel priority="Critical" />
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Only <strong className="font-mono">{wirelessMouseRec.currentStock}</strong> units left at{' '}
                <strong className="font-mono">{wirelessMouseRec.dailyAvgDemand}/day</strong> demand (~
                <strong className="font-mono text-red-600">{wirelessMouseRec.daysToStockout} days</strong> to stockout) vs.{' '}
                <strong className="font-mono">{wirelessMouseRec.supplierDeliveryDays}-day</strong> delivery from{' '}
                {wirelessMouseRec.supplierName}. AI recommends{' '}
                <strong className="font-mono text-blue-600">{wirelessMouseRec.recommendedQty} units</strong> (
                {formatCurrencyExact(wirelessMouseRec.estimatedCost)}).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedRecId(wirelessMouseRec.id)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              View AI Reasoning
            </button>
            <button
              onClick={() => generatePoFromRecommendation(wirelessMouseRec.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 whitespace-nowrap"
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              Generate Purchase Order
            </button>
          </div>
        </div>
      )}

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Open Recommendations</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {summary.pendingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Last scan: {lastAnalysisTime}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Critical Priority</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-600 mt-1">
            {summary.criticalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Lead-time stockout risk</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Recommended Order Units</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {summary.totalUnits.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across pending SKUs</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Estimated Reorder Cost</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 mt-1">
            {formatCurrencyExact(summary.totalCost)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Wholesale supplier pricing</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter recommendations by product, SKU, or supplier..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'All' | RecommendationPriority)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Pending', 'Approved', 'Ordered', 'Rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Replenishment Recommendations Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isAnalyzing ? (
          <div className="p-10 space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredRecs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-sm font-semibold text-slate-900">
              No recommendations match your filter
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Adjust your status filter or click "Run AI Inventory Analysis" to scan stock.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3 text-right">Current Stock</th>
                  <th className="py-3 px-3 text-right">Predicted Demand (15d)</th>
                  <th className="py-3 px-3 text-right">Recommended Reorder</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3 text-right">Est. Cost</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecs.map((rec: ReplenishmentRecommendation) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedRecId(rec.id)}
                        className="text-left group"
                      >
                        <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                          {rec.productName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {rec.sku} ·{' '}
                          {rec.daysToStockout === 0
                            ? '0d cover'
                            : `${rec.daysToStockout}d cover`}
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {rec.currentStock}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {rec.predictedDemand15d}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-blue-600">
                      {rec.recommendedQty} units
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="truncate max-w-[155px]">{rec.supplierName}</div>
                      <div className="text-[11px] text-slate-400">
                        {rec.supplierDeliveryDays}d lead time
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-slate-900">
                      {formatCurrencyExact(rec.estimatedCost)}
                    </td>
                    <td className="py-3 px-3">
                      <PriorityLabel priority={rec.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <RecStatusLabel status={rec.status} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedRecId(rec.id)}
                          title="View AI reasoning"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3 w-3" />
                          Reasoning
                        </button>

                        {rec.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => approveRecommendation(rec.id)}
                              title="Approve recommendation"
                              className="p-1.5 rounded-md border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => rejectRecommendation(rec.id)}
                              title="Reject recommendation"
                              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}

                        {(rec.status === 'Pending' || rec.status === 'Approved') && (
                          <button
                            onClick={() => generatePoFromRecommendation(rec.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700"
                          >
                            <ClipboardCheck className="h-3 w-3" />
                            Create PO
                          </button>
                        )}

                        {rec.status === 'Ordered' && rec.linkedPoId && (
                          <button
                            onClick={() => setActivePage('purchase-orders')}
                            className="px-2 py-1 rounded-md text-[11px] font-mono font-medium text-blue-600 hover:underline"
                          >
                            {rec.linkedPoId}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RecommendationDrawer
        recommendation={selectedRec}
        onClose={() => setSelectedRecId(null)}
      />
    </div>
  );
};
