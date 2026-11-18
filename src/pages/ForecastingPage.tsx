import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  Play,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStockSense } from '../context/StockSenseContext';
import {
  formatCurrencyExact,
  generateForecastData,
  runWhatIfSimulation,
} from '../utils/inventoryEngine';

export const ForecastingPage: React.FC = () => {
  const {
    products,
    suppliers,
    settings,
    forecastSubTab,
    setForecastSubTab,
    selectedForecastProductId,
    setSelectedForecastProductId,
    setActivePage,
  } = useStockSense();

  const [forecastDays, setForecastDays] = useState<7 | 15 | 30>(15);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedForecastProductId) ?? products[0],
    [products, selectedForecastProductId]
  );

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === selectedProduct?.supplierId) ?? suppliers[0],
    [suppliers, selectedProduct]
  );

  const forecast = useMemo(
    () => generateForecastData(selectedProduct, forecastDays),
    [selectedProduct, forecastDays]
  );

  // What-If Simulation State
  const [demandChangePct, setDemandChangePct] = useState<number>(25);
  const [simLeadTime, setSimLeadTime] = useState<number>(selectedSupplier?.avgDeliveryDays ?? 5);
  const [simAvailableStock, setSimAvailableStock] = useState<number>(
    selectedProduct?.currentStock ?? 12
  );
  const [simBufferDays, setSimBufferDays] = useState<number>(settings.safetyBufferDays);
  const [appliedParams, setAppliedParams] = useState({
    demandChangePct: 25,
    supplierDeliveryDays: selectedSupplier?.avgDeliveryDays ?? 5,
    availableStock: selectedProduct?.currentStock ?? 12,
    safetyBufferDays: settings.safetyBufferDays,
  });

  useEffect(() => {
    if (selectedProduct && selectedSupplier) {
      setSimLeadTime(selectedSupplier.avgDeliveryDays);
      setSimAvailableStock(selectedProduct.currentStock);
      setSimBufferDays(settings.safetyBufferDays);
      setAppliedParams({
        demandChangePct,
        supplierDeliveryDays: selectedSupplier.avgDeliveryDays,
        availableStock: selectedProduct.currentStock,
        safetyBufferDays: settings.safetyBufferDays,
      });
    }
  }, [selectedProduct?.id, selectedSupplier?.id]);

  const simulationResult = useMemo(
    () => runWhatIfSimulation(selectedProduct, selectedSupplier, appliedParams),
    [selectedProduct, selectedSupplier, appliedParams]
  );

  const handleRunSimulation = () => {
    setAppliedParams({
      demandChangePct,
      supplierDeliveryDays: simLeadTime,
      availableStock: simAvailableStock,
      safetyBufferDays: simBufferDays,
    });
  };

  const handleResetSimulation = () => {
    setDemandChangePct(0);
    setSimLeadTime(selectedSupplier.avgDeliveryDays);
    setSimAvailableStock(selectedProduct.currentStock);
    setSimBufferDays(settings.safetyBufferDays);
    setAppliedParams({
      demandChangePct: 0,
      supplierDeliveryDays: selectedSupplier.avgDeliveryDays,
      availableStock: selectedProduct.currentStock,
      safetyBufferDays: settings.safetyBufferDays,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header + Sub-Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            AI Demand Forecasting & Simulation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Model: {settings.forecastConfidenceModel} · Predict SKU demand trajectories and stress-test supply shocks.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
          <button
            onClick={() => setForecastSubTab('forecast')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              forecastSubTab === 'forecast'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Demand Forecast
          </button>
          <button
            onClick={() => setForecastSubTab('simulation')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              forecastSubTab === 'simulation'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            What-If Simulation
          </button>
        </div>
      </div>

      {/* Product & Period Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Select Product SKU
          </label>
          <select
            value={selectedProduct.id}
            onChange={(e) => setSelectedForecastProductId(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — {p.currentStock} in stock
              </option>
            ))}
          </select>
        </div>

        {forecastSubTab === 'forecast' && (
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Forecast Horizon
            </label>
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {([7, 15, 30] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setForecastDays(d)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    forecastDays === d
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {forecastSubTab === 'forecast' ? (
        <>
          {/* Forecast KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Predicted Demand ({forecastDays}d)</span>
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                {forecast.totalPredicted} units
              </div>
              <div className="text-xs text-slate-500 mt-1 tabular-nums">
                Avg {(forecast.totalPredicted / forecastDays).toFixed(1)} units/day
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Expected Stockout Date</span>
                <Calendar className="h-4 w-4 text-red-600" />
              </div>
              <div
                className={`text-xl font-bold font-mono tabular-nums mt-2 ${
                  forecast.daysLeft <= 4 ? 'text-red-600' : 'text-slate-900'
                }`}
              >
                {forecast.stockoutDate}
              </div>
              <div className="text-xs text-slate-500 mt-1 tabular-nums">
                {forecast.daysLeft === 0
                  ? 'Immediate depletion'
                  : `~${forecast.daysLeft} days at current stock (${selectedProduct.currentStock} units)`}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Forecast Confidence</span>
                <ShieldCheck className="h-4 w-4 text-teal-600" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-teal-700 mt-2">
                {forecast.confidenceScore}%
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${forecast.confidenceScore}%` }}
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-xs font-medium text-slate-500">Supplier Lead Time</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {selectedSupplier.avgDeliveryDays} days
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500 truncate pr-2">
                  {selectedSupplier.name}
                </span>
                <button
                  onClick={() => setActivePage('replenishment')}
                  className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap"
                >
                  Replenish
                </button>
              </div>
            </div>
          </div>

          {/* Combined Historical + Predicted Demand Line Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="font-display text-base font-semibold text-slate-900">
                  Historical vs. Predicted Demand Trajectory — {selectedProduct.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Past 14 days actual consumption paired with {forecastDays}-day AI projection and confidence interval
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Trend: {selectedProduct.demandTrendPct >= 0 ? `+${selectedProduct.demandTrendPct}%` : `${selectedProduct.demandTrendPct}%`}
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecast.points} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} minTickGap={20} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="confidenceHigh"
                    name="Upper Confidence Bound"
                    stroke="none"
                    fill="#DDD6FE"
                    fillOpacity={0.35}
                  />
                  <Line
                    type="monotone"
                    dataKey="historicalDemand"
                    name="Historical Daily Demand"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 2.5 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedDemand"
                    name="Predicted Future Demand"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 2.5 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Explanation Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 shrink-0">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900">
                AI Demand Drivers & Explanation
              </h3>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                {forecast.aiExplanation}
              </p>
            </div>
          </div>
        </>
      ) : (
        /* What-If Simulation Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Simulation Parameters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust demand, lead time, or stock availability to test stockout resilience.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Expected Demand Shift</span>
                  <span className="font-mono tabular-nums text-blue-600">
                    {demandChangePct >= 0 ? `+${demandChangePct}%` : `${demandChangePct}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={100}
                  step={5}
                  value={demandChangePct}
                  onChange={(e) => setDemandChangePct(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>-50%</span>
                  <span>Baseline (0%)</span>
                  <span>+100%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Supplier Delivery Time (Days)</span>
                  <span className="font-mono tabular-nums text-slate-900">{simLeadTime} days</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={21}
                  step={1}
                  value={simLeadTime}
                  onChange={(e) => setSimLeadTime(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Starting Available Stock (Units)</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {simAvailableStock} units
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={simAvailableStock}
                  onChange={(e) => setSimAvailableStock(Math.max(0, Number(e.target.value)))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm tabular-nums"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Safety Buffer Coverage</span>
                  <span className="font-mono tabular-nums text-slate-900">{simBufferDays} days</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={14}
                  step={1}
                  value={simBufferDays}
                  onChange={(e) => setSimBufferDays(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                onClick={handleRunSimulation}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                <Play className="h-3.5 w-3.5" />
                Run Simulation
              </button>
              <button
                onClick={handleResetSimulation}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Comparison Results + Chart */}
          <div className="lg:col-span-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Situation */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="text-xs font-semibold text-slate-500">Original Baseline</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500">Future Stock (After Lead)</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                      {simulationResult.original.futureStockAtLead} units
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Potential Stockout Date</div>
                    <div className="text-sm font-semibold font-mono tabular-nums text-slate-900 mt-1">
                      {simulationResult.original.stockoutDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Required Reorder Qty</div>
                    <div className="text-base font-semibold font-mono tabular-nums text-slate-900 mt-0.5">
                      {simulationResult.original.requiredReorder} units
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Estimated Cost</div>
                    <div className="text-base font-semibold font-mono tabular-nums text-slate-900 mt-0.5">
                      {formatCurrencyExact(simulationResult.original.estimatedCost)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Situation */}
              <div className="bg-white border border-blue-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700">Simulated Scenario</span>
                  <span className="text-[11px] font-mono text-blue-600">
                    {appliedParams.demandChangePct >= 0
                      ? `+${appliedParams.demandChangePct}%`
                      : `${appliedParams.demandChangePct}%`}{' '}
                    demand · {appliedParams.supplierDeliveryDays}d lead
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500">Future Stock (After Lead)</div>
                    <div
                      className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                        simulationResult.simulated.futureStockAtLead === 0
                          ? 'text-red-600'
                          : 'text-teal-700'
                      }`}
                    >
                      {simulationResult.simulated.futureStockAtLead} units
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Potential Stockout Date</div>
                    <div
                      className={`text-sm font-semibold font-mono tabular-nums mt-1 ${
                        simulationResult.simulated.daysLeft <= appliedParams.supplierDeliveryDays
                          ? 'text-red-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {simulationResult.simulated.stockoutDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Required Reorder Qty</div>
                    <div className="text-base font-semibold font-mono tabular-nums text-blue-600 mt-0.5">
                      {simulationResult.simulated.requiredReorder} units
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Estimated Cost</div>
                    <div className="text-base font-semibold font-mono tabular-nums text-blue-600 mt-0.5">
                      {formatCurrencyExact(simulationResult.simulated.estimatedCost)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 14-Day Stock Depletion Comparison Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-display text-sm font-semibold text-slate-900 mb-1">
                14-Day Inventory Depletion Comparison
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Projected units remaining over next 14 days without replenishment
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={simulationResult.chartData}
                    margin={{ top: 6, right: 16, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
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
                      dataKey="originalStock"
                      name="Original Stock Trajectory"
                      stroke="#64748B"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="simulatedStock"
                      name="Simulated Stock Trajectory"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={{ r: 2.5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
