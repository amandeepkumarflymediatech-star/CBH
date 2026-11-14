'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Truck,
  FileText,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  ChevronRight,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Calendar,
  Building,
  CreditCard,
  SlidersHorizontal,
  Package,
  Boxes,
  Eye,
  MapPin,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import TablePagination from '@/components/common/TablePagination';
import { CustomerOrder } from '@/lib/types';
import { getStoredUser } from '@/lib/auth';
import { formatINR } from '@/lib/rfq-calculator';
import { showToast } from '@/lib/swal';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CONFIRMED', label: 'Confirmed' },
];

const STATUS_BADGE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  CONFIRMED: { label: 'CONFIRMED', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  PROCESSING: { label: 'PROCESSING', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  DISPATCHED: { label: 'DISPATCHED', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  IN_TRANSIT: { label: 'IN TRANSIT', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  DELIVERED: { label: 'DELIVERED', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  CANCELLED: { label: 'CANCELLED', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [activeMtcModal, setActiveMtcModal] = useState<CustomerOrder | null>(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<CustomerOrder | null>(null);
  const [activeViewModal, setActiveViewModal] = useState<CustomerOrder | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    const user = getStoredUser();
    const query = user?.email
      ? `?customerEmail=${encodeURIComponent(user.email)}`
      : user?.id
      ? `?customerId=${user.id}`
      : '';

    fetch(`/api/orders${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      })
      .catch((err) => console.warn('Failed to load purchase orders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const inTransit = orders.filter((o) => o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED').length;
    const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
    const processing = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
    const totalSpend = orders.reduce((acc, o) => acc + (o.netAmount || 0), 0);
    const totalWeight = orders.reduce((acc, o) => acc + (o.totalWeightKg || 0), 0);
    return { totalOrders, inTransit, delivered, processing, totalSpend, totalWeight };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'IN_TRANSIT') {
        list = list.filter((o) => o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED');
      } else {
        list = list.filter((o) => o.status === statusFilter);
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.shippingAddress && o.shippingAddress.toLowerCase().includes(q)) ||
          (o.carrier && o.carrier.toLowerCase().includes(q)) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4">
      {/* INTEGRATED COMPACT TOP BAR: Header + KPI Strip + Actions */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-[#0052CC] rounded-lg shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Purchase Orders &amp; Dispatches
              </h1>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {orders.length} Orders
              </span>
            </div>
            {/* 1-Line Compact KPI Metric Strip */}
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-mono">
              <span className="flex items-center gap-1 text-purple-700 font-bold">
                <Truck size={12} /> {stats.inTransit} In Transit
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 size={12} /> {stats.delivered} Delivered
              </span>
              <span>•</span>
              <span>{(stats.totalWeight / 1000).toFixed(1)} MT Tonnage</span>
              <span>•</span>
              <span className="text-slate-800 font-bold">{formatINR(stats.totalSpend)} Invoiced</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Refresh Orders"
          >
            <Clock size={14} />
          </button>
          <Link
            href="/products"
            className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>+ Place New PO</span>
          </Link>
        </div>
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PO #, site, carrier or LR docket..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC] focus:bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Horizontal Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.id === 'ALL'
                ? orders.length
                : tab.id === 'IN_TRANSIT'
                ? stats.inTransit
                : tab.id === 'PROCESSING'
                ? stats.processing
                : tab.id === 'DELIVERED'
                ? stats.delivered
                : orders.filter((o) => o.status === tab.id).length;

            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  isActive
                    ? 'bg-[#0052CC] text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* HIGH-DENSITY PURCHASE ORDERS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">PO Number &amp; Date</th>
                <th className="py-2.5 px-3">Consignee Site</th>
                <th className="py-2.5 px-3 text-right">Net Value</th>
                <th className="py-2.5 px-3 text-center">Gross Weight</th>
                <th className="py-2.5 px-3">Carrier &amp; LR Docket</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Clock className="w-5 h-5 mx-auto mb-1.5 animate-spin text-[#0052CC]" />
                    <p className="font-semibold text-slate-600 text-xs">Loading purchase orders...</p>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <h3 className="text-xs font-bold text-slate-700">No purchase orders found</h3>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                      No purchase orders match your filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => {
                  const badgeStyle = STATUS_BADGE_CONFIG[ord.status] || {
                    label: ord.status,
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                  };

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => setActiveViewModal(ord)}
                          className="font-mono font-bold text-[#0052CC] hover:underline text-xs block text-left"
                        >
                          {ord.orderNumber}
                        </button>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{ord.date || ord.dispatchDate || 'Dispatched'}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 max-w-[200px]">
                        <div className="font-semibold text-slate-800 truncate" title={ord.shippingAddress}>
                          {ord.shippingAddress}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {ord.companyName || ord.customerName || 'Direct Facility'}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatINR(ord.netAmount)}
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                        {ord.totalWeightKg.toFixed(0)} kg
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800 text-[11px]">{ord.carrier || 'Express Logistics'}</div>
                        <div className="font-mono text-[10px] text-[#0052CC] truncate max-w-[140px]">
                          LR: {ord.trackingNumber || 'Pending'}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {ord.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveViewModal(ord)}
                            className="px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200"
                            title="Inspect Order"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveInvoiceModal(ord)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold"
                            title="Tax Invoice"
                          >
                            Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMtcModal(ord)}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-[#0052CC] text-[11px] font-bold border border-blue-200"
                            title="NABL MTC 3.1"
                          >
                            MTC 3.1
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

        {/* Compact Pagination */}
        {filteredOrders.length > itemsPerPage && (
          <div className="p-3 border-t border-slate-100">
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* INSPECT PO MODAL */}
      {activeViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  PO: {activeViewModal.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Dispatched on {activeViewModal.date || activeViewModal.dispatchDate || 'Immediate'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveViewModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery Location</span>
                <span className="font-semibold text-slate-800">{activeViewModal.shippingAddress}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Logistics Partner</span>
                <span className="font-semibold text-slate-800">
                  {activeViewModal.carrier} (LR: {activeViewModal.trackingNumber || 'Pending'})
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Invoice Value</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">{formatINR(activeViewModal.netAmount)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Consignment Weight</span>
                <span className="font-bold text-slate-800 font-mono text-sm">{activeViewModal.totalWeightKg} Kg</span>
              </div>
            </div>

            {/* Fastener Line Items */}
            {activeViewModal.items && activeViewModal.items.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1.5">Fastener Specifications</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-right">Quantity</th>
                        <th className="py-2 px-3 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeViewModal.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold text-slate-800">{item.name || item.sku}</td>
                          <td className="py-2 px-3 text-right font-mono">{item.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatINR(item.rate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveInvoiceModal(activeViewModal);
                  setActiveViewModal(null);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                View Invoice
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMtcModal(activeViewModal);
                  setActiveViewModal(null);
                }}
                className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold"
              >
                NABL MTC 3.1 Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAX INVOICE MODAL */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tax Invoice &amp; E-Way Bill</h3>
                <p className="text-xs text-slate-400 font-mono">INV-{activeInvoiceModal.orderNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Bill To:</span>
                <span className="font-bold text-slate-800">{activeInvoiceModal.companyName || activeInvoiceModal.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Invoice Amount:</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">{formatINR(activeInvoiceModal.netAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST Status:</span>
                <span className="text-emerald-700 font-bold">18% GST Input Credit Included</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Tax invoice PDF downloading...', 'success');
                  setActiveInvoiceModal(null);
                }}
                className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Download Tax Invoice PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NABL MTC MODAL */}
      {activeMtcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">EN 10204 3.1 Mill Test Certificate</h3>
                  <p className="text-xs text-slate-400 font-mono">Heat No: {activeMtcModal.mtcCertNumber || 'NABL-2026-8819'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMtcModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-emerald-900 font-semibold">Spectroscopy Chemistry:</span>
                <span className="font-mono text-emerald-800">C: 0.38% | Mn: 0.72% | Cr: 0.98%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-900 font-semibold">Tensile Proof Load:</span>
                <span className="font-mono text-emerald-800">800 N/mm² (Conforms to ISO 898-1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-900 font-semibold">Laboratory:</span>
                <span className="font-semibold text-emerald-800">CBH NABL Accredited Testing Facility</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast('MTC 3.1 Certificate downloading...', 'success');
                  setActiveMtcModal(null);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Download Certified MTC PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
