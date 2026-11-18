import React, { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { useStockSense } from '../context/StockSenseContext';
import { AppSettings } from '../types/inventory';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useStockSense();
  const [form, setForm] = useState<AppSettings>(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Platform Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure AI forecasting models, safety stock buffers, and automated alert rules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetDemoData();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 self-start sm:self-auto whitespace-nowrap"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Demo Data
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Workspace Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Workspace & Fulfillment Facility
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Primary Warehouse
              </label>
              <input
                type="text"
                value={form.warehouseName}
                onChange={(e) => setForm({ ...form, warehouseName: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* AI Replenishment & Forecasting Rules */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-slate-900">
            AI Replenishment & Threshold Rules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Default Safety Buffer (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={form.safetyBufferDays}
                onChange={(e) =>
                  setForm({ ...form, safetyBufferDays: Math.max(1, Number(e.target.value)) })
                }
                className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm tabular-nums"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Extra days of demand added on top of supplier transit lead time.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Critical Stockout Threshold (Days)
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={form.criticalDaysThreshold}
                onChange={(e) =>
                  setForm({ ...form, criticalDaysThreshold: Math.max(1, Number(e.target.value)) })
                }
                className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm tabular-nums"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                SKUs with fewer days of cover are flagged as Critical.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Forecasting Engine
              </label>
              <select
                value={form.forecastConfidenceModel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    forecastConfidenceModel: e.target.value as AppSettings['forecastConfidenceModel'],
                  })
                }
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm"
              >
                <option value="Ensemble Prophet + XGBoost">Ensemble Prophet + XGBoost</option>
                <option value="Seasonal ARIMA">Seasonal ARIMA</option>
                <option value="Adaptive Exponential">Adaptive Exponential</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Auto-Approve PO Cap (USD)
              </label>
              <input
                type="number"
                min={0}
                step={250}
                value={form.autoApproveThresholdUsd}
                onChange={(e) =>
                  setForm({
                    ...form,
                    autoApproveThresholdUsd: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Alert Dispatch Preferences
          </h2>

          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900">Daily Executive Stock Digest</div>
              <div className="text-xs text-slate-500">
                Receive morning summary of predicted stockouts and pending purchase orders.
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.emailDigestEnabled}
              onChange={(e) => setForm({ ...form, emailDigestEnabled: e.target.checked })}
              className="h-4 w-4 accent-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between py-2 border-t border-slate-100 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900">
                Instant Critical Stockout Webhooks
              </div>
              <div className="text-xs text-slate-500">
                Notify procurement channels immediately when days-to-stockout drops below lead time.
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.slackAlertsEnabled}
              onChange={(e) => setForm({ ...form, slackAlertsEnabled: e.target.checked })}
              className="h-4 w-4 accent-blue-600 rounded"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
