import React, { useMemo, useState } from 'react';
import {
  Award,
  Building2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { useStockSense } from '../context/StockSenseContext';
import { formatCurrencyExact } from '../utils/inventoryEngine';

export const SuppliersPage: React.FC = () => {
  const { suppliers, products } = useStockSense();
  const [compareProductId, setCompareProductId] = useState(products[0]?.id ?? 'prod-001');
  const [compareQty, setCompareQty] = useState(100);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === compareProductId) ?? products[0],
    [products, compareProductId]
  );

  // Build side-by-side comparison quotes across all 6 suppliers for the selected product
  const comparisonRows = useMemo(() => {
    const basePrice = selectedProduct?.unitPrice ?? 30;
    return suppliers
      .map((s) => {
        const quotedUnitPrice = Math.round(basePrice * s.priceMultiplier * 100) / 100;
        const batchCost = Math.round(quotedUnitPrice * compareQty * 100) / 100;
        const compositeScore = Math.round(
          s.reliabilityScore * 0.4 + s.priceCompetitiveness * 0.35 + (10 - s.avgDeliveryDays) * 2.5
        );
        return {
          supplier: s,
          quotedUnitPrice,
          batchCost,
          compositeScore,
          isAssigned: s.id === selectedProduct?.supplierId,
        };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }, [suppliers, selectedProduct, compareQty]);

  const bestPriceId = useMemo(
    () => [...comparisonRows].sort((a, b) => a.quotedUnitPrice - b.quotedUnitPrice)[0]?.supplier.id,
    [comparisonRows]
  );

  const fastestId = useMemo(
    () =>
      [...comparisonRows].sort(
        (a, b) => a.supplier.avgDeliveryDays - b.supplier.avgDeliveryDays
      )[0]?.supplier.id,
    [comparisonRows]
  );

  const skuCountBySupplier = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.supplierId, (counts.get(p.supplierId) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Supplier Management & Comparison
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Evaluate vendor reliability, average transit times, pricing indices, and compare quotes per SKU.
        </p>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {suppliers.map((sup) => {
          const skuCount = skuCountBySupplier.get(sup.id) ?? 0;
          return (
            <div
              key={sup.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display text-sm font-semibold text-slate-900 truncate">
                        {sup.name}
                      </h2>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{sup.location}</span>
                        <span>·</span>
                        <span>{sup.paymentTerms}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-mono font-medium text-emerald-700 shrink-0">
                    <ShieldCheck className="h-3 w-3" />
                    {sup.reliabilityScore}%
                  </span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <div className="text-slate-500">Avg Delivery</div>
                    <div className="font-mono font-semibold tabular-nums text-slate-900 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-600" />
                      {sup.avgDeliveryDays} days
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Price Score</div>
                    <div className="font-mono font-semibold tabular-nums text-slate-900 mt-0.5">
                      {sup.priceCompetitiveness}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">SKUs Supplied</div>
                    <div className="font-mono font-semibold tabular-nums text-slate-900 mt-0.5">
                      {skuCount} SKUs
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="mt-3 text-xs text-slate-600">
                  <span className="text-slate-400">Categories: </span>
                  {sup.categories.join(' · ')}
                </div>
              </div>

              {/* Contact Info */}
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="font-medium text-slate-800">{sup.contactName}</div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{sup.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span className="font-mono">{sup.phone}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Supplier Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Scale className="h-4.5 w-4.5 text-blue-600 shrink-0" />
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Supplier Cost & Lead-Time Comparison
              </h2>
              <p className="text-xs text-slate-500">
                Compare total batch cost, delivery speed, and reliability across all vendors for a target SKU.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={compareProductId}
              onChange={(e) => setCompareProductId(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
            >
              {products.slice(0, 20).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Order Qty:</span>
              <input
                type="number"
                min={10}
                max={1000}
                step={10}
                value={compareQty}
                onChange={(e) => setCompareQty(Math.max(1, Number(e.target.value)))}
                className="w-20 h-9 px-2.5 rounded-lg border border-slate-200 font-mono text-xs tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-3 text-right">Quoted Unit Price</th>
                <th className="py-3 px-3 text-right">Batch Cost ({compareQty} units)</th>
                <th className="py-3 px-3 text-right">Delivery Time</th>
                <th className="py-3 px-3 text-right">Reliability</th>
                <th className="py-3 px-4">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {comparisonRows.map((row, idx) => {
                const isBestPrice = row.supplier.id === bestPriceId;
                const isFastest = row.supplier.id === fastestId;
                return (
                  <tr
                    key={row.supplier.id}
                    className={idx === 0 ? 'bg-blue-50/40' : 'hover:bg-slate-50'}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{row.supplier.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {row.supplier.location} · {row.supplier.paymentTerms}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatCurrencyExact(row.quotedUnitPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatCurrencyExact(row.batchCost)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {row.supplier.avgDeliveryDays} days
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {row.supplier.reliabilityScore}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {idx === 0 && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                            <Award className="h-3 w-3" />
                            Best Overall
                          </span>
                        )}
                        {isBestPrice && (
                          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            Lowest Price
                          </span>
                        )}
                        {isFastest && (
                          <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                            Fastest Transit
                          </span>
                        )}
                        {row.isAssigned && (
                          <span className="text-[11px] text-slate-500">Current Primary</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
