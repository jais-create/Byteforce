import React, { useEffect, useState } from 'react';
import { X, TrendingUp, SlidersHorizontal, Package } from 'lucide-react';
import { useStockSense } from '../context/StockSenseContext';
import { Product, ProductCategory } from '../types/inventory';
import {
  formatCurrencyExact,
  getDaysToStockout,
  getPredictedStockoutDate,
  getStockStatus,
} from '../utils/inventoryEngine';
import { StockStatusLabel } from './StatusBadge';

const CATEGORIES: ProductCategory[] = [
  'Peripherals',
  'Audio',
  'Laptops & Computing',
  'Monitors & Displays',
  'Networking',
  'Storage & Memory',
  'Accessories & Power',
];

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  editingProduct,
  onClose,
}) => {
  const { suppliers, addProduct, updateProduct } = useStockSense();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Peripherals');
  const [currentStock, setCurrentStock] = useState(50);
  const [minStock, setMinStock] = useState(30);
  const [maxStock, setMaxStock] = useState(150);
  const [dailyAvgDemand, setDailyAvgDemand] = useState(5);
  const [demandTrendPct, setDemandTrendPct] = useState(8);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? 'sup-1');
  const [unitPrice, setUnitPrice] = useState(45);
  const [retailPrice, setRetailPrice] = useState(79);
  const [warehouseLocation, setWarehouseLocation] = useState('Aisle A-10');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setSku(editingProduct.sku);
      setCategory(editingProduct.category);
      setCurrentStock(editingProduct.currentStock);
      setMinStock(editingProduct.minStock);
      setMaxStock(editingProduct.maxStock);
      setDailyAvgDemand(editingProduct.dailyAvgDemand);
      setDemandTrendPct(editingProduct.demandTrendPct);
      setSupplierId(editingProduct.supplierId);
      setUnitPrice(editingProduct.unitPrice);
      setRetailPrice(editingProduct.retailPrice);
      setWarehouseLocation(editingProduct.warehouseLocation);
    } else {
      setName('');
      setSku(`SS-NEW-${Math.floor(101 + Math.random() * 899)}`);
      setCategory('Peripherals');
      setCurrentStock(40);
      setMinStock(25);
      setMaxStock(140);
      setDailyAvgDemand(4);
      setDemandTrendPct(10);
      setSupplierId(suppliers[0]?.id ?? 'sup-1');
      setUnitPrice(45);
      setRetailPrice(75);
      setWarehouseLocation('Aisle B-04');
    }
  }, [editingProduct, isOpen, suppliers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: name.trim(),
        sku: sku.trim(),
        category,
        currentStock: Math.max(0, Number(currentStock)),
        minStock: Math.max(1, Number(minStock)),
        maxStock: Math.max(10, Number(maxStock)),
        dailyAvgDemand: Math.max(0, Number(dailyAvgDemand)),
        demandTrendPct: Number(demandTrendPct),
        supplierId,
        unitPrice: Math.max(0.5, Number(unitPrice)),
        retailPrice: Math.max(1, Number(retailPrice)),
        warehouseLocation: warehouseLocation.trim() || 'Aisle A-01',
      });
    } else {
      addProduct({
        name: name.trim(),
        sku: sku.trim(),
        category,
        currentStock: Math.max(0, Number(currentStock)),
        minStock: Math.max(1, Number(minStock)),
        maxStock: Math.max(10, Number(maxStock)),
        dailyAvgDemand: Math.max(0, Number(dailyAvgDemand)),
        demandTrendPct: Number(demandTrendPct),
        supplierId,
        unitPrice: Math.max(0.5, Number(unitPrice)),
        retailPrice: Math.max(1, Number(retailPrice)),
        warehouseLocation: warehouseLocation.trim() || 'Aisle A-01',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-slate-900">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Product Name
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Wireless Ergonomic Mouse"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">SKU</label>
              <input
                required
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Current Stock (Units)
              </label>
              <input
                required
                type="number"
                min={0}
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm tabular-nums focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Minimum Stock Threshold
              </label>
              <input
                required
                type="number"
                min={1}
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm tabular-nums focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Daily Avg Demand (Units/Day)
              </label>
              <input
                required
                type="number"
                min={0}
                step={0.5}
                value={dailyAvgDemand}
                onChange={(e) => setDailyAvgDemand(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm tabular-nums focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Unit Cost Price ($)
              </label>
              <input
                required
                type="number"
                min={0.5}
                step={0.01}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 font-mono text-sm tabular-nums focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.avgDeliveryDays}d)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Warehouse Location
              </label>
              <input
                type="text"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
            >
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ProductDetailsDrawerProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductDetailsDrawer: React.FC<ProductDetailsDrawerProps> = ({
  product,
  onClose,
  onEdit,
}) => {
  const { suppliers, settings, recommendations, openProductForecast, setActivePage } =
    useStockSense();

  if (!product) return null;

  const supplier = suppliers.find((s) => s.id === product.supplierId);
  const status = getStockStatus(product, settings);
  const daysLeft = getDaysToStockout(product);
  const rec = recommendations.find((r) => r.productId === product.id);
  const inventoryValue = product.currentStock * product.unitPrice;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <div className="bg-white w-full max-w-md h-full border-l border-slate-200 shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Package className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base font-semibold text-slate-900 truncate">
                {product.name}
              </h2>
              <div className="text-xs font-mono text-slate-500">
                {product.sku} · {product.warehouseLocation}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{product.category}</span>
            <StockStatusLabel status={status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500">Current Stock</div>
              <div className="text-xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
                {product.currentStock} units
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Min {product.minStock} · Max {product.maxStock}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500">Days to Stockout</div>
              <div
                className={`text-xl font-semibold font-mono tabular-nums mt-1 ${
                  daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {daysLeft === 0 ? '0.0d' : `${daysLeft}d`}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {getPredictedStockoutDate(daysLeft)}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500">Daily Avg Demand</div>
              <div className="text-xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
                {product.dailyAvgDemand}/day
              </div>
              <div
                className={`text-[11px] mt-0.5 font-medium ${
                  product.demandTrendPct >= 0 ? 'text-teal-700' : 'text-slate-500'
                }`}
              >
                {product.demandTrendPct >= 0 ? `+${product.demandTrendPct}%` : `${product.demandTrendPct}%`} 14d velocity
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500">On-Hand Value</div>
              <div className="text-xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
                {formatCurrencyExact(inventoryValue)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                {formatCurrencyExact(product.unitPrice)} / unit cost
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-900">Supplier & Logistics</h3>
            <div className="text-sm font-medium text-slate-800">{supplier?.name}</div>
            <div className="text-xs text-slate-500 space-y-1">
              <div>
                Lead Time: <span className="font-mono text-slate-800">{supplier?.avgDeliveryDays} days</span> · Reliability:{' '}
                <span className="font-mono text-slate-800">{supplier?.reliabilityScore}%</span>
              </div>
              <div>
                Contact: {supplier?.contactName} ({supplier?.email})
              </div>
              <div>Last Restocked: {product.lastRestocked}</div>
            </div>
          </div>

          {rec && (
            <div className="border-t border-slate-200 pt-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900">AI Replenishment Signal</h3>
                <span className="text-xs font-mono text-blue-600 font-medium">
                  Order {rec.recommendedQty} units
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{rec.reasoning}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-2">
          <button
            onClick={() => {
              onClose();
              openProductForecast(product.id, 'forecast');
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            View Forecast
          </button>
          <button
            onClick={() => {
              onClose();
              setActivePage('replenishment');
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Replenishment
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 whitespace-nowrap"
          >
            Edit SKU
          </button>
        </div>
      </div>
    </div>
  );
};
