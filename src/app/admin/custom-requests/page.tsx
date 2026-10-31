'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Package,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Flame,
  X,
  AlertTriangle,
  ArrowRight,
  FileText,
  DollarSign
} from 'lucide-react';
import TablePagination from '@/components/common/TablePagination';
import { CustomProductRequest, CustomRequestStatus } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';

const STATUS_CONFIG: Record<
  CustomRequestStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: 'PENDING',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  UNDER_REVIEW: {
    label: 'UNDER REVIEW',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  APPROVED: {
    label: 'APPROVED',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  ADDED_TO_CATALOG: {
    label: 'ON CATALOG',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  REJECTED: {
    label: 'INFEASIBLE',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<CustomProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [viewRequest, setViewRequest] = useState<CustomProductRequest | null>(null);
  const [convertTarget, setConvertTarget] = useState<CustomProductRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomProductRequest | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Convert Form Fields
  const [convertSku, setConvertSku] = useState('');
  const [convertName, setConvertName] = useState('');
  const [convertPricePiece, setConvertPricePiece] = useState('14.50');
  const [convertPriceKg, setConvertPriceKg] = useState('180.00');
  const [convertWeight, setConvertWeight] = useState('0.065');
  const [convertStock, setConvertStock] = useState('10000');
  const [convertMoq, setConvertMoq] = useState('25 KGS');
  const [convertLeadTime, setConvertLeadTime] = useState('10');
  const [convertIsSurplus, setConvertIsSurplus] = useState(false);
  const [convertSurplusDiscount, setConvertSurplusDiscount] = useState('35');
  const [convertSyncErp, setConvertSyncErp] = useState(true);
  const [convertAdminNotes, setConvertAdminNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/custom-product-requests');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error('Failed to load custom product requests:', err);
      showToast('Error loading requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // When opening convert modal, pre-fill form fields
  useEffect(() => {
    if (convertTarget) {
      const cleanStd = (convertTarget.standard || 'DIN 933').replace(/\s+/g, '-');
      const cleanCat = (convertTarget.category || 'BOLT').replace(/\s+/g, '-').slice(0, 8);
      const cleanGrade = (convertTarget.grade || '8.8').split(' ')[0];
      const cleanFinish = (convertTarget.finish || 'SELF').split(' ')[0];
      const autoSku = `CBH-${cleanCat}-${cleanStd}-${convertTarget.sizeFormatted}-${cleanGrade}-${cleanFinish}`.toUpperCase();

      setConvertSku(autoSku);
      setConvertName(convertTarget.productName);
      setConvertPricePiece(convertTarget.targetPrice ? String(convertTarget.targetPrice) : '15.50');
      setConvertWeight('0.065');
      setConvertPriceKg('185.00');
      setConvertStock(String(convertTarget.quantityRequired || 5000));
      setConvertIsSurplus(convertTarget.urgencyLevel === 'SURPLUS_IMMEDIATE');
      setConvertSyncErp(true);
      setConvertAdminNotes(`Approved for customer ${convertTarget.customerName} (${convertTarget.requestNumber})`);
    }
  }, [convertTarget]);

  // Telemetry counts
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const underReview = requests.filter((r) => r.status === 'UNDER_REVIEW').length;
    const addedToCatalog = requests.filter((r) => r.status === 'ADDED_TO_CATALOG').length;
    const rejected = requests.filter((r) => r.status === 'REJECTED').length;
    return { total, pending, underReview, addedToCatalog, rejected };
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    let list = [...requests];
    if (statusFilter !== 'ALL') {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.requestNumber.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          (r.companyName && r.companyName.toLowerCase().includes(q)) ||
          r.standard.toLowerCase().includes(q) ||
          r.diameter.toLowerCase().includes(q) ||
          r.customerPhone.includes(q) ||
          (r.convertedSku && r.convertedSku.toLowerCase().includes(q))
      );
    }
    return list;
  }, [requests, statusFilter, search]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  const handleUpdateStatus = async (id: number, newStatus: CustomRequestStatus) => {
    try {
      const res = await fetch('/api/custom-product-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
        showToast(`Request #${id} marked as ${newStatus}`);
      }
    } catch {
      showToast('Error updating status');
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/custom-product-requests?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        showToast(`Request ${deleteTarget.requestNumber} deleted`);
        setDeleteTarget(null);
      }
    } catch {
      showToast('Error deleting request');
    }
  };

  const handleExecuteConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertTarget) return;
    setIsConverting(true);

    try {
      const payload = {
        requestId: convertTarget.id,
        sku: convertSku.trim().toUpperCase(),
        name: convertName.trim(),
        pricePerPiece: parseFloat(convertPricePiece),
        pricePerKg: parseFloat(convertPriceKg),
        weightPerPcKg: parseFloat(convertWeight) || 0.05,
        stockPcs: parseInt(convertStock) || 5000,
        moq: convertMoq,
        leadTimeDays: parseInt(convertLeadTime) || 10,
        isSurplus: convertIsSurplus,
        surplusDiscountPct: convertIsSurplus ? parseInt(convertSurplusDiscount) || 35 : 0,
        syncToErpNext: convertSyncErp,
        adminNotes: convertAdminNotes,
      };

      const res = await fetch('/api/custom-product-requests/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`✓ Fastener SKU ${data.data.product.sku} successfully added to live catalog!`);
        setConvertTarget(null);
        fetchRequests();
      } else {
        alert(data.error || 'Failed to convert request');
      }
    } catch (err: any) {
      alert(err.message || 'Error converting request');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 bg-slate-900 text-white border-slate-700 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-[#0052CC] rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Custom Product &amp; Non-Listed Item Requests
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Customer inquiries for non-standard fasteners, custom dimensions, and clearance lots with 1-click catalog onboarding and ERPNext Item synchronization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchRequests}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Refresh Inquiries"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Custom Inquiries</span>
            <div className="text-2xl font-black text-[#0F172A] font-mono mt-1">{stats.total}</div>
            <div className="text-xs text-slate-500 mt-1">Catalog &amp; Surplus Desk</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0052CC] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Review</span>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1 flex items-center gap-2">
              <span>{stats.pending}</span>
              {stats.pending > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <div className="text-xs text-amber-600 font-semibold mt-1">Awaiting Factory Costing</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Onboarded to Catalog</span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{stats.addedToCatalog}</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Live SKUs Created</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Under Feasibility Study</span>
            <div className="text-2xl font-black text-indigo-600 font-mono mt-1">{stats.underReview}</div>
            <div className="text-xs text-slate-500 mt-1">Tooling &amp; Alloy Verification</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Console Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search & Status Filters Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Request #, Spec, Customer, Standard, or Diameter..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'ADDED_TO_CATALOG', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-[#0052CC] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Docket &amp; Date</th>
                <th className="py-3.5 px-4">Client / Company</th>
                <th className="py-3.5 px-4">Target Fastener Spec</th>
                <th className="py-3.5 px-3 text-center">Dimensions</th>
                <th className="py-3.5 px-3 text-right">Required Volume</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Catalog Onboarding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-[#0052CC]" />
                    <p className="font-semibold text-slate-600">Loading custom inquiries...</p>
                  </td>
                </tr>
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-600">No custom fastener inquiries found.</p>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req) => {
                  const badge = STATUS_CONFIG[req.status] || {
                    label: req.status,
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                  };

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#0052CC]">{req.requestNumber}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0F172A]">{req.customerName}</div>
                        <div className="text-[11px] text-slate-500">{req.companyName || 'Private Procurement'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{req.customerPhone}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-[#0F172A] truncate" title={req.productName}>
                          {req.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {req.standard} • Grade {req.grade} • {req.finish}
                        </div>
                        {req.drawingUrl && (
                          <a
                            href={req.drawingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#0052CC] font-bold hover:underline inline-flex items-center gap-0.5 mt-0.5"
                          >
                            <span>View CAD Drawing</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                        <div>{req.diameter} x {req.lengthMm} mm</div>
                        <div className="text-[10px] text-slate-400 font-normal">P: {req.pitchMm}mm • {req.threadType}</div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono">
                        <div className="font-bold text-slate-900">
                          {req.quantityRequired} {req.quantityUom}
                        </div>
                        {req.targetPrice ? (
                          <div className="text-[11px] text-emerald-600 font-bold">
                            Target: {formatINR(req.targetPrice)}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">Best Factory Rate</div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                        {req.convertedSku && (
                          <div className="text-[9px] font-mono text-emerald-700 font-bold mt-1 truncate max-w-[120px]">
                            SKU: {req.convertedSku}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {req.status !== 'ADDED_TO_CATALOG' ? (
                            <button
                              type="button"
                              onClick={() => setConvertTarget(req)}
                              className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                              title="Convert to live catalog product and ERPNext item"
                            >
                              <Plus size={12} />
                              <span>Onboard Product</span>
                            </button>
                          ) : (
                            <Link
                              href="/admin/products"
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 flex items-center gap-1"
                            >
                              <CheckCircle2 size={12} />
                              <span>Live on Catalog</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewRequest(req)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Inspect complete request"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(req)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete request"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredRequests.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          pageSizeOptions={[5, 10, 20, 50]}
          itemLabel="custom fastener requests"
        />
      </div>

      {/* Convert to Catalog Modal */}
      {convertTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 text-[#0052CC] rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F172A]">
                    Convert Request to Catalog Product
                  </h3>
                  <p className="text-xs text-slate-500">
                    Docket #{convertTarget.requestNumber} • Requested by {convertTarget.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConvertTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteConversion} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Generated Product SKU</label>
                <input
                  type="text"
                  value={convertSku}
                  onChange={(e) => setConvertSku(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0052CC]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Live Catalog Product Name</label>
                <input
                  type="text"
                  value={convertName}
                  onChange={(e) => setConvertName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#0052CC]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Standard Rate (₹ / Piece)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={convertPricePiece}
                    onChange={(e) => setConvertPricePiece(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-[#0052CC] focus:outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tariff Rate (₹ / Kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={convertPriceKg}
                    onChange={(e) => setConvertPriceKg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-[#0052CC] focus:outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Piece Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={convertWeight}
                    onChange={(e) => setConvertWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Initial Stock (Pcs)</label>
                  <input
                    type="number"
                    value={convertStock}
                    onChange={(e) => setConvertStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">MOQ / Pack Size</label>
                  <input
                    type="text"
                    value={convertMoq}
                    onChange={(e) => setConvertMoq(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800">Sync to ERPNext Master</span>
                    <p className="text-[11px] text-slate-500">
                      Creates Item Code and standard selling price in ERPNext.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={convertSyncErp}
                    onChange={(e) => setConvertSyncErp(e.target.checked)}
                    className="w-4 h-4 text-[#0052CC] rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800">Add to Factory Surplus Lots</span>
                    <p className="text-[11px] text-slate-500">
                      Flags product with clearance discount banner in Surplus Depot.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={convertIsSurplus}
                    onChange={(e) => setConvertIsSurplus(e.target.checked)}
                    className="w-4 h-4 text-[#0052CC] rounded"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isConverting}
                  onClick={() => setConvertTarget(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-6 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isConverting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{isConverting ? 'Onboarding & Syncing...' : 'Publish to Live Catalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Request Details Modal */}
      {viewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#0F172A]">
                  Custom Request Details: {viewRequest.requestNumber}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Submitted {new Date(viewRequest.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="font-bold text-[#0052CC] font-mono text-sm">{viewRequest.productName}</div>
                <div className="text-slate-600 mt-1">
                  Category: <strong>{viewRequest.category}</strong> • Standard: <strong>{viewRequest.standard}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono">
                <div>Diameter: <strong>{viewRequest.diameter}</strong></div>
                <div>Length: <strong>{viewRequest.lengthMm} mm</strong></div>
                <div>Pitch: <strong>{viewRequest.pitchMm} mm</strong></div>
                <div>Thread: <strong>{viewRequest.threadType}</strong></div>
                <div>Grade: <strong>{viewRequest.grade}</strong></div>
                <div>Finish: <strong>{viewRequest.finish}</strong></div>
                <div>Volume: <strong>{viewRequest.quantityRequired} {viewRequest.quantityUom}</strong></div>
                <div>Target Price: <strong>{viewRequest.targetPrice ? formatINR(viewRequest.targetPrice) : 'Open'}</strong></div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">
                  Customer &amp; Dispatch Destination
                </span>
                <div className="font-semibold text-slate-900">{viewRequest.customerName} ({viewRequest.companyName || 'Private'})</div>
                <div className="text-slate-500 font-mono mt-0.5">{viewRequest.customerPhone} • {viewRequest.customerEmail}</div>
                {viewRequest.shippingPincode && (
                  <div className="text-slate-500 font-mono mt-0.5">Pincode: {viewRequest.shippingPincode}</div>
                )}
                {viewRequest.notes && (
                  <div className="mt-2 text-slate-600 bg-white p-2 rounded border border-slate-200">
                    &ldquo;{viewRequest.notes}&rdquo;
                  </div>
                )}
              </div>

              {viewRequest.drawingUrl && (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-semibold text-slate-700">CAD Drawing Attachment</span>
                  <a
                    href={viewRequest.drawingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#0052CC] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1"
                  >
                    <span>Open Drawing</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold text-[11px]">Status:</span>
                <select
                  value={viewRequest.status}
                  onChange={(e) => handleUpdateStatus(viewRequest.id, e.target.value as CustomRequestStatus)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="ADDED_TO_CATALOG">ADDED TO CATALOG</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setViewRequest(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Request?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to remove request <strong>{deleteTarget.requestNumber}</strong>?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRequest}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Delete Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

