import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { InventoryItem } from '../../types/clinic';
import {
  PackageCheck,
  AlertTriangle,
  Plus,
  Search,
  ArrowUpDown,
  Calendar,
  DollarSign,
  TrendingDown,
  Layers,
  X
} from 'lucide-react';

export const InventoryList: React.FC = () => {
  const { inventory, adjustStock, activeRole } = useClinic();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustReason, setAdjustReason] = useState('New shipment received');

  const todayStr = '2026-10-06';

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.genericName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = inventory.filter((i) => i.stockQuantity <= i.reorderLevel).length;

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    const change = adjustType === 'IN' ? Math.abs(adjustAmount) : -Math.abs(adjustAmount);
    adjustStock(adjustItem.id, change, adjustReason);
    setAdjustItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900">Pharmacy & Stock Inventory</h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
              {inventory.length} Tracked Formulations
            </span>
            {lowStockCount > 0 && (
              <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{lowStockCount} Low Stock</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time dispensary tracking, reorder thresholds, batch management, and stock adjustments.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by medication, SKU, generic name, or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Antidiabetic">Antidiabetic</option>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Respiratory">Respiratory</option>
            <option value="Medical Supplies">Medical Supplies</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Item & Generic Name</th>
                <th className="py-3 px-3">SKU & Batch</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Stock on Hand</th>
                <th className="py-3 px-3">Unit Price</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No medication items match the filter.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = item.stockQuantity <= item.reorderLevel;
                  const expTime = new Date(item.expirationDate).getTime();
                  const nowTime = new Date(todayStr).getTime();
                  const daysToExpiry = (expTime - nowTime) / (1000 * 3600 * 24);
                  const isNearExpiry = daysToExpiry <= 30 && daysToExpiry >= 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {item.genericName} • Brand: {item.brand}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] text-slate-700 block">{item.sku}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Lot: {item.batchNumber}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold text-sm ${
                              isLow ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {item.stockQuantity}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.unit}</span>
                        </div>
                        {isLow && (
                          <span className="text-[10px] text-rose-600 font-bold block">
                            Below Reorder ({item.reorderLevel})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">${item.sellingPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 block">Cost: ${item.purchasePrice.toFixed(2)}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`font-medium ${isNearExpiry ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>
                          {item.expirationDate}
                        </span>
                        {isNearExpiry && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.2 rounded border border-amber-200 block w-max mt-0.5">
                            EXPIRING SOON
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {(activeRole === 'pharmacist' || activeRole === 'admin') && (
                          <button
                            onClick={() => {
                              setAdjustItem(item);
                              setAdjustAmount(10);
                              setAdjustType('IN');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            Adjust Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-sm w-full text-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Inventory Adjustment</h3>
              <button onClick={() => setAdjustItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600">
              Item: <strong>{adjustItem.name}</strong> (Current Stock: {adjustItem.stockQuantity} {adjustItem.unit})
            </p>

            <form onSubmit={handleApplyAdjustment} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('IN')}
                  className={`py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                    adjustType === 'IN'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  + Stock In (Add)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('OUT')}
                  className={`py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                    adjustType === 'OUT'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  - Stock Out (Remove)
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Quantity ({adjustItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason / Reference Note</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Shipment PO-991, Damaged vials, Dispensed"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
