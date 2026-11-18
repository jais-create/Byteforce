import React from 'react';
import { Check, ClipboardCheck, ShieldAlert, Truck, X } from 'lucide-react';
import { useStockSense } from '../context/StockSenseContext';
import { ReplenishmentRecommendation } from '../types/inventory';
import { formatCurrencyExact, getPredictedStockoutDate } from '../utils/inventoryEngine';
import { PriorityLabel, RecStatusLabel } from './StatusBadge';

interface RecommendationDrawerProps {
  recommendation: ReplenishmentRecommendation | null;
  onClose: () => void;
}

export const RecommendationDrawer: React.FC<RecommendationDrawerProps> = ({
  recommendation,
  onClose,
}) => {
  const {
    approveRecommendation,
    rejectRecommendation,
    generatePoFromRecommendation,
    settings,
    setActivePage,
  } = useStockSense();

  if (!recommendation) return null;

  const isActionable =
    recommendation.status === 'Pending' || recommendation.status === 'Approved';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <div className="bg-white w-full max-w-lg h-full border-l border-slate-200 shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-xs font-mono text-slate-500">{recommendation.sku}</div>
            <h2 className="font-display text-base font-semibold text-slate-900 truncate">
              {recommendation.productName} — AI Reasoning
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PriorityLabel priority={recommendation.priority} />
              <RecStatusLabel status={recommendation.status} />
            </div>
            <span className="text-xs text-slate-500">{recommendation.generatedAt}</span>
          </div>

          {/* Why replenishment is needed */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <ShieldAlert className="h-4 w-4 text-blue-600" />
              Why This Product Needs Replenishment
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {recommendation.reasoning}
            </p>
          </div>

          {/* Key Quantitative Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500">Current Inventory</div>
              <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-1">
                {recommendation.currentStock} units
              </div>
              <div className="text-[11px] text-red-600 mt-0.5 tabular-nums">
                {recommendation.daysToStockout === 0
                  ? 'Out of stock now'
                  : `Stockout in ${recommendation.daysToStockout} days (${getPredictedStockoutDate(
                      recommendation.daysToStockout
                    )})`}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500">Predicted 15-Day Demand</div>
              <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-1">
                {recommendation.predictedDemand15d} units
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                {recommendation.dailyAvgDemand}/day avg ·{' '}
                {recommendation.demandTrendPct >= 0
                  ? `+${recommendation.demandTrendPct}%`
                  : `${recommendation.demandTrendPct}%`}{' '}
                trend
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500">Supplier Delivery Time</div>
              <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-1">
                {recommendation.supplierDeliveryDays} days
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {recommendation.supplierName}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500">Recommended Reorder</div>
              <div className="text-lg font-semibold font-mono tabular-nums text-blue-600 mt-1">
                {recommendation.recommendedQty} units
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                Est. Cost: {formatCurrencyExact(recommendation.estimatedCost)}
              </div>
            </div>
          </div>

          {/* Transparent Order Formula */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-900">
              Replenishment Quantity Calculation
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span>
                  Lead Time Coverage ({recommendation.supplierDeliveryDays}d ×{' '}
                  {recommendation.dailyAvgDemand}/day)
                </span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  +{recommendation.leadTimeDemandUnits} units
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span>
                  Safety Stock Buffer ({settings.safetyBufferDays}d ×{' '}
                  {recommendation.dailyAvgDemand}/day)
                </span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  +{recommendation.safetyBufferUnits} units
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span>Less Current On-Hand Stock</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  −{recommendation.currentStock} units
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 font-semibold text-slate-900">
                <span>Final Recommended Reorder Quantity</span>
                <span className="font-mono tabular-nums text-blue-600">
                  {recommendation.recommendedQty} units
                </span>
              </div>
            </div>
          </div>

          {recommendation.linkedPoId && (
            <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-blue-900">
                <Truck className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  Linked Purchase Order: <strong className="font-mono">{recommendation.linkedPoId}</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setActivePage('purchase-orders');
                }}
                className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap"
              >
                Track PO
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          {isActionable ? (
            <>
              <div className="flex items-center gap-2">
                {recommendation.status === 'Pending' && (
                  <button
                    onClick={() => approveRecommendation(recommendation.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 text-xs font-medium hover:bg-teal-100"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                )}
                <button
                  onClick={() => {
                    rejectRecommendation(recommendation.id);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Reject
                </button>
              </div>
              <button
                onClick={() => {
                  generatePoFromRecommendation(recommendation.id);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                Generate Purchase Order
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
