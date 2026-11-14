'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import TablePagination from '@/components/common/TablePagination';
import { SurplusLot } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Download,
  Flame,
  CheckCircle2,
  AlertTriangle,
  X,
  Warehouse,
  Power,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface AdminSurplusSectionProps {
  lots: SurplusLot[];
  onAdd: (lot: Omit<SurplusLot, 'id'>) => Promise<void>;
  onUpdate: (lot: SurplusLot) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleActive: (lot: SurplusLot) => Promise<void>;
  showToast: (msg: string) => void;
}

type KpiFilter = 'all' | 'active' | 'high_discount' | 'heavy' | 'paused';

export default function AdminSurplusSection({
  lots,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
  showToast,
}: AdminSurplusSectionProps) {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [kpiFilter, setKpiFilter] = useState<KpiFilter>('all');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [selectedHub, setSelectedHub] = useState('all');
  const [sortBy, setSortBy] = useState('discount_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editLot, setEditLot] = useState<SurplusLot | null>(null);
  const [deleteLot, setDeleteLot] = useState<SurplusLot | null>(null);

  // Add form fields
  const [addForm, setAddForm] = useState({
    sku: '',
    name: '',
    standard: 'DIN 933',
    grade: '8.8 HT',
    excessQtyPcs: '12000',
    excessQtyKg: '900.0',
    regularPriceKg: '160.00',
    clearanceDiscountPct: '40',
    locationHub: 'Bhiwandi Hub (MH)',
  });

  // KPI telemetry metrics
  const kpiCounts = useMemo(() => {
    return {
      all: lots.length,
      active: lots.filter((l) => l.isActive).length,
      highDiscount: lots.filter((l) => l.clearanceDiscountPct >= 40).length,
      heavy: lots.filter((l) => l.excessQtyKg >= 1000).length,
      paused: lots.filter((l) => !l.isActive).length,
    };
  }, [lots]);

  // Filtered & Sorted lots
  const filteredLots = useMemo(() => {
    let list = [...lots];

    // Quick KPI Tab filter
    if (kpiFilter === 'active') {
      list = list.filter((l) => l.isActive);
    } else if (kpiFilter === 'paused') {
      list = list.filter((l) => !l.isActive);
    } else if (kpiFilter === 'high_discount') {
      list = list.filter((l) => l.clearanceDiscountPct >= 40);
    } else if (kpiFilter === 'heavy') {
      list = list.filter((l) => l.excessQtyKg >= 1000);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.sku.toLowerCase().includes(q) ||
          l.name.toLowerCase().includes(q) ||
          l.grade.toLowerCase().includes(q) ||
          l.locationHub.toLowerCase().includes(q)
      );
    }

    if (selectedStandard !== 'all') {
      list = list.filter((l) => l.standard.toLowerCase().includes(selectedStandard.toLowerCase()));
    }

    if (selectedHub !== 'all') {
      list = list.filter((l) => l.locationHub.toLowerCase().includes(selectedHub.toLowerCase()));
    }

    if (sortBy === 'discount_desc') {
      list.sort((a, b) => b.clearanceDiscountPct - a.clearanceDiscountPct);
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => a.clearancePriceKg - b.clearancePriceKg);
    } else if (sortBy === 'qty_desc') {
      list.sort((a, b) => b.excessQtyKg - a.excessQtyKg);
    }

    return list;
  }, [lots, kpiFilter, search, selectedStandard, selectedHub, sortBy]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, kpiFilter, selectedStandard, selectedHub, sortBy]);

  // Sliced paginated surplus lots
  const paginatedLots = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLots.slice(start, start + itemsPerPage);
  }, [filteredLots, currentPage, itemsPerPage]);

  const hasActiveFilters =
    search.trim() !== '' ||
    kpiFilter !== 'all' ||
    selectedStandard !== 'all' ||
    selectedHub !== 'all' ||
    sortBy !== 'discount_desc';

  const handleResetFilters = () => {
    setSearch('');
    setKpiFilter('all');
    setSelectedStandard('all');
    setSelectedHub('all');
    setSortBy('discount_desc');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Lot Name',
      'Standard',
      'Grade',
      'Excess Pcs',
      'Excess Kg',
      'Regular /Kg (INR)',
      'Discount %',
      'Clearance /Kg (INR)',
      'Warehouse Hub',
      'Active'
    ];
    const rows = filteredLots.map((l) => [
      `"${l.sku}"`,
      `"${l.name}"`,
      `"${l.standard}"`,
      `"${l.grade}"`,
      l.excessQtyPcs,
      l.excessQtyKg,
      l.regularPriceKg,
      l.clearanceDiscountPct,
      l.clearancePriceKg.toFixed(2),
      `"${l.locationHub}"`,
      l.isActive ? 'Yes' : 'No',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cbh_surplus_liquidation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredLots.length} surplus lots to CSV`);
  };

  const submitAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const reg = parseFloat(addForm.regularPriceKg) || 150.0;
    const disc = parseFloat(addForm.clearanceDiscountPct) || 35;
    const clearance = reg * (1 - disc / 100);

    await onAdd({
      sku: addForm.sku.trim() || `SURP-${addForm.standard.replace(/\s+/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      name: addForm.name.trim() || `${addForm.standard} Grade ${addForm.grade} Surplus Lot`,
      standard: addForm.standard,
      grade: addForm.grade,
      excessQtyPcs: parseInt(addForm.excessQtyPcs) || 10000,
      excessQtyKg: parseFloat(addForm.excessQtyKg) || 750.0,
      regularPriceKg: reg,
      clearanceDiscountPct: disc,
      clearancePriceKg: clearance,
      locationHub: addForm.locationHub,
      isActive: true,
    });

    setIsAddOpen(false);
    setAddForm({
      sku: '',
      name: '',
      standard: 'DIN 933',
      grade: '8.8 HT',
      excessQtyPcs: '12000',
      excessQtyKg: '900.0',
      regularPriceKg: '160.00',
      clearanceDiscountPct: '40',
      locationHub: 'Bhiwandi Hub (MH)',
    });
  };

  const submitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLot) return;
    await onUpdate(editLot);
    setEditLot(null);
  };

  const confirmDelete = async () => {
    if (!deleteLot) return;
    await onDelete(deleteLot.id);
    setDeleteLot(null);
  };

  return (
    <div className="space-y-3.5">
      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header & KPI Filter Strip */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 bg-white space-y-3">
          {/* Top Title & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Surplus Liquidation Batches</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {lots.length} Lots
                </span>
              </h2>

              <Link
                href="/surplus"
                target="_blank"
                className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                <span>Live Marketplace</span>
                <ExternalLink size={11} />
              </Link>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <Link
                href="/admin/custom-requests"
                className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                title="Review customer custom requests"
              >
                <Sparkles size={13} className="text-blue-600" />
                <span className="hidden xs:inline">Inquiries</span>
              </Link>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                title="Export filtered lots to CSV"
              >
                <Download size={13} />
                <span>Export</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus size={14} />
                <span>New Batch</span>
              </button>
            </div>
          </div>

          {/* Quick KPI Filter Pills (Single-line touch scroll on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'All Lots', count: kpiCounts.all },
              { id: 'active', label: 'Active', count: kpiCounts.active },
              { id: 'high_discount', label: '≥40% Off', count: kpiCounts.highDiscount },
              { id: 'heavy', label: '≥1 Ton', count: kpiCounts.heavy },
              { id: 'paused', label: 'Paused', count: kpiCounts.paused },
            ].map((tab) => {
              const active = kpiFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setKpiFilter(tab.id as KpiFilter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Toolbar */}
          <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SKU, fastener title, depot..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-[#0052CC]"
              />
            </div>

            {/* Dropdowns & Reset */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <select
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0052CC] shrink-0"
              >
                <option value="all">Standard: All</option>
                <option value="DIN 933">DIN 933</option>
                <option value="DIN 912">DIN 912</option>
                <option value="ISO 4017">ISO 4017</option>
              </select>

              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0052CC] shrink-0"
              >
                <option value="all">Depot: All</option>
                <option value="Bhiwandi">Bhiwandi (MH)</option>
                <option value="Ludhiana">Ludhiana (PB)</option>
                <option value="Chennai">Chennai (TN)</option>
                <option value="Ahmedabad">Ahmedabad (GJ)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0052CC] shrink-0"
              >
                <option value="discount_desc">Discount: High to Low</option>
                <option value="price_asc">Rate: Low to High</option>
                <option value="qty_desc">Stock: High to Low</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1 shrink-0"
                  title="Reset all filters"
                >
                  <RefreshCw size={11} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* High-Density Surplus Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Surplus SKU &amp; Title</th>
                <th className="py-2.5 px-3">Standard / Grade</th>
                <th className="py-2.5 px-3">Available Stock</th>
                <th className="py-2.5 px-3">Clearance Rate</th>
                <th className="py-2.5 px-3">Depot Hub</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <AlertTriangle size={28} className="text-amber-500 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">No surplus lots matched</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your search criteria or filters.</p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLots.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* SKU & Title */}
                    <td className="py-2.5 px-3 align-middle max-w-xs">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {l.sku}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate" title={l.name}>
                        {l.name}
                      </div>
                    </td>

                    {/* Standard / Grade */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                        {l.standard}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 ml-1.5 font-semibold">
                        {l.grade}
                      </span>
                    </td>

                    {/* Stock Quantity */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-800">
                        {l.excessQtyKg.toLocaleString()} Kg
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {l.excessQtyPcs.toLocaleString()} Pcs
                      </div>
                    </td>

                    {/* Rates & Discount */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-orange-600 text-xs">
                          {formatINR(l.clearancePriceKg)}/Kg
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-bold text-[10px] flex items-center gap-0.5">
                          <Flame size={10} /> -{l.clearanceDiscountPct}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-through font-mono">
                        {formatINR(l.regularPriceKg)}/Kg
                      </div>
                    </td>

                    {/* Depot */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                        <Warehouse size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px]">{l.locationHub}</span>
                      </div>
                    </td>

                    {/* Status Toggle Pill */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleActive(l)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                          l.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={l.isActive ? 'Click to Pause' : 'Click to Activate'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            l.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{l.isActive ? 'Active' : 'Paused'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditLot({ ...l })}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Edit Lot Parameters"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteLot(l)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                          title="Delist Surplus Lot"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Compact Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredLots.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="surplus lots"
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Add Surplus Lot Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-fade-in"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Launch Surplus Liquidation Batch
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-black font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitAddForm} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Batch SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. SURP-DIN933-M14"
                    value={addForm.sku}
                    onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Auto-generated if left blank</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Standard Spec</label>
                  <select
                    value={addForm.standard}
                    onChange={(e) => setAddForm({ ...addForm, standard: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                  >
                    <option value="DIN 933">DIN 933 (Hex Set Screw)</option>
                    <option value="DIN 931">DIN 931 (Hex Bolt)</option>
                    <option value="DIN 912">DIN 912 (Socket Cap)</option>
                    <option value="ISO 4017">ISO 4017</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Lot Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hex Head Screws DIN 933 M14x80mm Grade 8.8"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Property Class / Grade</label>
                  <input
                    type="text"
                    value={addForm.grade}
                    onChange={(e) => setAddForm({ ...addForm, grade: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Warehouse Hub</label>
                  <select
                    value={addForm.locationHub}
                    onChange={(e) => setAddForm({ ...addForm, locationHub: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                  >
                    <option value="Bhiwandi Hub (MH)">Bhiwandi Hub (MH)</option>
                    <option value="Ludhiana Central Depot (PB)">Ludhiana Central Depot (PB)</option>
                    <option value="Chennai Harbour Depot (TN)">Chennai Harbour Depot (TN)</option>
                    <option value="Ahmedabad Industrial Depot (GJ)">Ahmedabad Industrial Depot (GJ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={addForm.excessQtyKg}
                    onChange={(e) => setAddForm({ ...addForm, excessQtyKg: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Pieces (Pcs)</label>
                  <input
                    type="number"
                    value={addForm.excessQtyPcs}
                    onChange={(e) => setAddForm({ ...addForm, excessQtyPcs: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Reg. ₹/Kg</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={addForm.regularPriceKg}
                    onChange={(e) => setAddForm({ ...addForm, regularPriceKg: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="15"
                    max="75"
                    required
                    value={addForm.clearanceDiscountPct}
                    onChange={(e) => setAddForm({ ...addForm, clearanceDiscountPct: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>

              {/* Live Price Calculation Pill */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Calculated Clearance Price:</span>
                <span className="font-mono font-bold text-orange-600 text-xs">
                  {formatINR((parseFloat(addForm.regularPriceKg) || 160) * (1 - (parseFloat(addForm.clearanceDiscountPct) || 40) / 100))}/Kg
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Flame size={14} />
                  <span>Launch Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Surplus Modal */}
      {editLot && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-fade-in"
          onClick={() => setEditLot(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Edit Surplus Batch: {editLot.sku}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditLot(null)}
                className="text-slate-400 hover:text-black font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitEditForm} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Lot Title</label>
                <input
                  type="text"
                  value={editLot.name}
                  onChange={(e) => setEditLot({ ...editLot, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Remaining Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editLot.excessQtyKg}
                    onChange={(e) =>
                      setEditLot({ ...editLot, excessQtyKg: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Remaining Pieces</label>
                  <input
                    type="number"
                    value={editLot.excessQtyPcs}
                    onChange={(e) =>
                      setEditLot({ ...editLot, excessQtyPcs: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Standard Rate / Kg (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editLot.regularPriceKg}
                    onChange={(e) => {
                      const reg = parseFloat(e.target.value) || 0;
                      const disc = editLot.clearanceDiscountPct;
                      setEditLot({
                        ...editLot,
                        regularPriceKg: reg,
                        clearancePriceKg: reg * (1 - disc / 100),
                      });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Clearance Discount (%)</label>
                  <input
                    type="number"
                    min="15"
                    max="75"
                    value={editLot.clearanceDiscountPct}
                    onChange={(e) => {
                      const disc = parseFloat(e.target.value) || 0;
                      const reg = editLot.regularPriceKg;
                      setEditLot({
                        ...editLot,
                        clearanceDiscountPct: disc,
                        clearancePriceKg: reg * (1 - disc / 100),
                      });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Warehouse Depot Hub</label>
                <input
                  type="text"
                  value={editLot.locationHub}
                  onChange={(e) => setEditLot({ ...editLot, locationHub: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              {/* Calculated price preview */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Effective Clearance Rate:</span>
                <span className="font-mono font-bold text-orange-600 text-xs">
                  {formatINR(editLot.clearancePriceKg)}/Kg
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditLot(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteLot && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setDeleteLot(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Delist Surplus Batch?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delist <strong>{deleteLot.sku}</strong> ({deleteLot.name})?
                This will remove the liquidation batch from the public catalog.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDeleteLot(null)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Delist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
