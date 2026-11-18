import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  PackageCheck,
  Plus,
  Search,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import { POStatusLabel } from '../components/StatusBadge';
import { useStockSense } from '../context/StockSenseContext';
import { POStatus, PurchaseOrder } from '../types/inventory';
import { formatCurrencyExact } from '../utils/inventoryEngine';

export const PurchaseOrdersPage: React.FC = () => {
  const {
    purchaseOrders,
    products,
    suppliers,
    createPurchaseOrder,
    updatePoStatus,
    cancelPurchaseOrder,
  } = useStockSense();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | POStatus>('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingPo, setViewingPo] = useState<PurchaseOrder | null>(null);

  // Create PO Form State
  const [formProductId, setFormProductId] = useState(products[0]?.id ?? '');
  const [formSupplierId, setFormSupplierId] = useState(products[0]?.supplierId ?? suppliers[0]?.id ?? '');
  const [formQty, setFormQty] = useState(85);
  const [formNotes, setFormNotes] = useState('');

  const selectedFormProduct = useMemo(
    () => products.find((p) => p.id === formProductId) ?? products[0],
    [products, formProductId]
  );

  const selectedFormSupplier = useMemo(
    () => suppliers.find((s) => s.id === formSupplierId) ?? suppliers[0],
    [suppliers, formSupplierId]
  );

  const expectedDatePreview = useMemo(() => {
    const base = new Date('2026-11-18T00:00:00');
    const lead = selectedFormSupplier?.avgDeliveryDays ?? 5;
    return new Date(base.getTime() + lead * 86400000).toISOString().slice(0, 10);
  }, [selectedFormSupplier]);

  const filteredPos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return purchaseOrders.filter((po) => {
      if (statusFilter !== 'All' && po.status !== statusFilter) return false;
      if (q) {
        return (
          po.id.toLowerCase().includes(q) ||
          po.productName.toLowerCase().includes(q) ||
          po.supplierName.toLowerCase().includes(q) ||
          po.sku.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [purchaseOrders, statusFilter, searchQuery]);

  const summary = useMemo(() => {
    const active = purchaseOrders.filter((p) => p.status !== 'Cancelled' && p.status !== 'Delivered');
    const totalSpend = purchaseOrders
      .filter((p) => p.status !== 'Cancelled')
      .reduce((sum, p) => sum + p.totalCost, 0);
    return {
      totalOrders: purchaseOrders.length,
      activeOrders: active.length,
      deliveredCount: purchaseOrders.filter((p) => p.status === 'Delivered').length,
      totalSpend,
    };
  }, [purchaseOrders]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormProduct || !selectedFormSupplier || formQty < 1) return;
    createPurchaseOrder({
      productId: selectedFormProduct.id,
      supplierId: selectedFormSupplier.id,
      quantity: formQty,
      expectedDeliveryDate: expectedDatePreview,
      notes: formNotes.trim() || undefined,
    });
    setCreateOpen(false);
    setFormNotes('');
  };

  const getNextStatus = (status: POStatus): POStatus | null => {
    if (status === 'Pending') return 'Approved';
    if (status === 'Approved') return 'Shipped';
    if (status === 'Shipped') return 'Delivered';
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Purchase Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, approve, track inbound shipments, and auto-reconcile delivered stock into inventory.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Purchase Order
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Purchase Orders</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {summary.totalOrders}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Active In-Flight POs</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 mt-1">
            {summary.activeOrders}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Delivered & Stocked</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {summary.deliveredCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Committed Spend</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatCurrencyExact(summary.totalSpend)}
          </div>
        </div>
      </div>

      {/* Search & Status Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by PO ID, product, SKU, or supplier..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['All', 'Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'] as const).map(
            (st) => (
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
            )
          )}
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filteredPos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-sm font-semibold text-slate-900">No purchase orders found</div>
            <p className="text-xs text-slate-500 mt-1">
              Create a new purchase order or generate one directly from Smart Replenishment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Products</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Total Cost</th>
                  <th className="py-3 px-3">Order Date</th>
                  <th className="py-3 px-3">Expected Delivery</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPos.map((po) => {
                  const nextStatus = getNextStatus(po.status);
                  return (
                    <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => setViewingPo(po)}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {po.id}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{po.supplierName}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900">{po.productName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{po.sku}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-slate-900">
                        {po.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {formatCurrencyExact(po.totalCost)}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {po.orderDate}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {po.expectedDeliveryDate}
                      </td>
                      <td className="py-3 px-3">
                        <POStatusLabel status={po.status} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingPo(po)}
                            className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                            title="View order details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {nextStatus && (
                            <button
                              onClick={() => updatePoStatus(po.id, nextStatus)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-800"
                            >
                              {nextStatus === 'Delivered' ? (
                                <>
                                  <PackageCheck className="h-3 w-3" />
                                  Mark Delivered
                                </>
                              ) : nextStatus === 'Shipped' ? (
                                <>
                                  <Truck className="h-3 w-3" />
                                  Mark Shipped
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Approve
                                </>
                              )}
                            </button>
                          )}

                          {po.status === 'Pending' && (
                            <button
                              onClick={() => cancelPurchaseOrder(po.id)}
                              title="Cancel pending order"
                              className="p-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Purchase Order Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Create Purchase Order
              </h2>
              <button
                onClick={() => setCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Product</label>
                <select
                  value={formProductId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setFormProductId(id);
                    const p = products.find((item) => item.id === id);
                    if (p) setFormSupplierId(p.supplierId);
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — {formatCurrencyExact(p.unitPrice)}/unit
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Supplier</label>
                <select
                  value={formSupplierId}
                  onChange={(e) => setFormSupplierId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.avgDeliveryDays}d delivery)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Order Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formQty}
                    onChange={(e) => setFormQty(Math.max(1, Number(e.target.value)))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Expected Delivery
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={expectedDatePreview}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 font-mono text-sm text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Receiving bay instructions or expedite request..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Estimated PO Total</span>
                <span className="font-mono text-base font-bold tabular-nums text-slate-900">
                  {formatCurrencyExact(formQty * (selectedFormProduct?.unitPrice ?? 0))}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                >
                  Submit Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View PO Details Modal */}
      {viewingPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-slate-500">Purchase Order</div>
                <h2 className="font-display text-lg font-bold font-mono text-slate-900">
                  {viewingPo.id}
                </h2>
              </div>
              <button
                onClick={() => setViewingPo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-y border-slate-100">
              <span className="text-xs text-slate-500">Fulfillment Status</span>
              <POStatusLabel status={viewingPo.status} />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier</span>
                <span className="font-medium text-slate-900">{viewingPo.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product</span>
                <span className="font-medium text-slate-900">
                  {viewingPo.productName} ({viewingPo.sku})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {viewingPo.quantity} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Cost</span>
                <span className="font-mono tabular-nums text-slate-900">
                  {formatCurrencyExact(viewingPo.unitPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Cost</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {formatCurrencyExact(viewingPo.totalCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Date</span>
                <span className="font-mono tabular-nums text-slate-700">
                  {viewingPo.orderDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Delivery</span>
                <span className="font-mono tabular-nums text-slate-700">
                  {viewingPo.expectedDeliveryDate}
                </span>
              </div>
            </div>

            {viewingPo.notes && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                {viewingPo.notes}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingPo(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
