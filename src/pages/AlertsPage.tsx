import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  RotateCcw,
} from 'lucide-react';
import { SeverityLabel } from '../components/StatusBadge';
import { useStockSense } from '../context/StockSenseContext';
import { AlertCategory } from '../types/inventory';

const ALERT_CATEGORIES: Array<'All' | AlertCategory> = [
  'All',
  'Critical Stock',
  'Low Inventory',
  'Predicted Stockout',
  'Delayed Delivery',
  'Excess Inventory',
];

export const AlertsPage: React.FC = () => {
  const { alerts, resolveAlert, reopenAlert, setActivePage } = useStockSense();
  const [categoryFilter, setCategoryFilter] = useState<'All' | AlertCategory>('All');
  const [showResolved, setShowResolved] = useState<'Active' | 'Resolved' | 'All'>('Active');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
      if (showResolved === 'Active' && a.resolved) return false;
      if (showResolved === 'Resolved' && !a.resolved) return false;
      return true;
    });
  }, [alerts, categoryFilter, showResolved]);

  const counts = useMemo(() => {
    const active = alerts.filter((a) => !a.resolved);
    return {
      activeTotal: active.length,
      critical: active.filter((a) => a.severity === 'Critical').length,
      warning: active.filter((a) => a.severity === 'Warning').length,
      resolved: alerts.filter((a) => a.resolved).length,
    };
  }, [alerts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Smart Alert Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Categorized stockout warnings, supplier delays, and overstock anomalies.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
          {(['Active', 'Resolved', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setShowResolved(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                showResolved === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Summary Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Active Alerts</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {counts.activeTotal}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Critical Severity</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-600 mt-1">
            {counts.critical}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Warnings</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 mt-1">
            {counts.warning}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Resolved</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {counts.resolved}
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
        {ALERT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-900">
              No {showResolved.toLowerCase()} alerts in this category
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Everything in this view has been addressed.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                alert.resolved ? 'border-slate-200 opacity-75' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {alert.severity === 'Critical' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : alert.severity === 'Warning' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Info className="h-5 w-5 text-blue-600" />
                  )}
                </div>

                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-sm font-semibold text-slate-900">
                      {alert.title}
                    </h2>
                    <SeverityLabel severity={alert.severity} />
                    {alert.resolved && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span>{alert.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{alert.timestamp}</span>
                    {alert.sku && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-500">{alert.sku}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {alert.category !== 'Excess Inventory' && !alert.resolved && (
                  <button
                    onClick={() =>
                      setActivePage(
                        alert.category === 'Delayed Delivery' ? 'purchase-orders' : 'replenishment'
                      )
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  >
                    Take Action
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}

                {!alert.resolved ? (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 whitespace-nowrap"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => reopenAlert(alert.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
