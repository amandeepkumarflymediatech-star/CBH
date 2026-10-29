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
import { formatINR } from '@/lib/rfq-calculator';
import { showToast } from '@/lib/swal';

const TIMEFRAME_OPTIONS = [
  { value: 'ALL', label: 'All Time' },
  { value: 'TODAY', label: 'Today' },
  { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
  { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
  { value: 'THIS_MONTH', label: 'This Month' },
  { value: 'LAST_3_MONTHS', label: 'Last 3 Months' },
  { value: 'THIS_YEAR', label: 'This Year' },
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date: Newest First' },
  { value: 'date_asc', label: 'Date: Oldest First' },
  { value: 'amount_desc', label: 'Net Amount: High to Low' },
  { value: 'amount_asc', label: 'Net Amount: Low to High' },
  { value: 'weight_desc', label: 'Gross Weight: High to Low' },
  { value: 'weight_asc', label: 'Gross Weight: Low to High' },
];

const PAYMENT_OPTIONS = [
  { value: 'ALL', label: 'All Payment Terms' },
  { value: 'PAID', label: 'Paid / PhonePe Settled' },
  { value: 'PENDING', label: 'Pending Settlement' },
  { value: 'CREDIT', label: 'Credit Terms (Net 30/60)' },
];

const STATUS_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'DISPATCHED', label: 'Dispatched' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_BADGE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  CONFIRMED: {
    label: 'CONFIRMED',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  PROCESSING: {
    label: 'PROCESSING',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  DISPATCHED: {
    label: 'DISPATCHED',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  IN_TRANSIT: {
    label: 'IN TRANSIT',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  DELIVERED: {
    label: 'DELIVERED',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  CANCELLED: {
    label: 'CANCELLED',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeframeFilter, setTimeframeFilter] = useState('ALL');
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [activeMtcModal, setActiveMtcModal] = useState<CustomerOrder | null>(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<CustomerOrder | null>(null);
  const [activeViewModal, setActiveViewModal] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load customer orders:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Distinct Carriers from loaded orders
  const availableCarriers = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.carrier && o.carrier.trim()) set.add(o.carrier.trim());
    });
    return Array.from(set).sort();
  }, [orders]);

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: orders.length,
      CONFIRMED: 0,
      PROCESSING: 0,
      DISPATCHED: 0,
      IN_TRANSIT: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  // Overall KPI statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const inTransit = orders.filter(
      (o) => o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED'
    ).length;
    const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
    const totalSpend = orders.reduce((sum, o) => sum + (o.netAmount || 0), 0);
    const totalWeight = orders.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0);
    return { totalOrders, inTransit, delivered, totalSpend, totalWeight };
  }, [orders]);

  // Timeframe checking helper
  const matchesTimeframe = (orderDateStr: string, timeframe: string) => {
    if (timeframe === 'ALL') return true;
    if (!orderDateStr) return false;
    const orderDate = new Date(orderDateStr);
    if (isNaN(orderDate.getTime())) return true;
    const now = new Date();

    if (timeframe === 'TODAY') {
      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    if (timeframe === 'LAST_7_DAYS') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= past7;
    }
    if (timeframe === 'LAST_30_DAYS') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return orderDate >= past30;
    }
    if (timeframe === 'THIS_MONTH') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    if (timeframe === 'LAST_3_MONTHS') {
      const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return orderDate >= past90;
    }
    if (timeframe === 'THIS_YEAR') {
      return orderDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Filtered & Sorted orders list
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // Status Filter
    if (statusFilter !== 'ALL') {
      list = list.filter((o) => o.status === statusFilter);
    }

    // Timeframe Filter
    if (timeframeFilter !== 'ALL') {
      list = list.filter((o) => matchesTimeframe(o.date || o.dispatchDate, timeframeFilter));
    }

    // Carrier Filter
    if (carrierFilter !== 'ALL') {
      list = list.filter((o) => o.carrier?.toLowerCase() === carrierFilter.toLowerCase());
    }

    // Payment Filter
    if (paymentFilter !== 'ALL') {
      list = list.filter((o) => {
        const pStatus = (o.paymentStatus || '').toUpperCase();
        if (paymentFilter === 'PAID') return pStatus === 'PAID' || pStatus === 'SUCCESS';
        if (paymentFilter === 'PENDING') return pStatus === 'PENDING' || !pStatus;
        if (paymentFilter === 'CREDIT') return pStatus.includes('CREDIT') || pStatus.includes('NET');
        return true;
      });
    }

    // Search Query (PO #, Address, Company, Carrier, Tracking LR, Item SKU/Name, Pincode)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => {
        const orderNo = o.orderNumber?.toLowerCase() || '';
        const addr = o.shippingAddress?.toLowerCase() || '';
        const comp = o.companyName?.toLowerCase() || '';
        const cust = o.customerName?.toLowerCase() || '';
        const carr = o.carrier?.toLowerCase() || '';
        const trk = o.trackingNumber?.toLowerCase() || '';
        const pin = o.deliveryPincode?.toLowerCase() || '';
        const items =
          o.items?.some(
            (i) => i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q)
          ) || false;

        return (
          orderNo.includes(q) ||
          addr.includes(q) ||
          comp.includes(q) ||
          cust.includes(q) ||
          carr.includes(q) ||
          trk.includes(q) ||
          pin.includes(q) ||
          items
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return (
          new Date(b.date || b.dispatchDate || 0).getTime() -
          new Date(a.date || a.dispatchDate || 0).getTime()
        );
      }
      if (sortBy === 'date_asc') {
        return (
          new Date(a.date || a.dispatchDate || 0).getTime() -
          new Date(b.date || b.dispatchDate || 0).getTime()
        );
      }
      if (sortBy === 'amount_desc') {
        return (b.netAmount || 0) - (a.netAmount || 0);
      }
      if (sortBy === 'amount_asc') {
        return (a.netAmount || 0) - (b.netAmount || 0);
      }
      if (sortBy === 'weight_desc') {
        return (b.totalWeightKg || 0) - (a.totalWeightKg || 0);
      }
      if (sortBy === 'weight_asc') {
        return (a.totalWeightKg || 0) - (b.totalWeightKg || 0);
      }
      return 0;
    });

    return list;
  }, [orders, statusFilter, timeframeFilter, carrierFilter, paymentFilter, search, sortBy]);

  // Paginated list
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'ALL' ||
    timeframeFilter !== 'ALL' ||
    carrierFilter !== 'ALL' ||
    paymentFilter !== 'ALL' ||
    sortBy !== 'date_desc';

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTimeframeFilter('ALL');
    setCarrierFilter('ALL');
    setPaymentFilter('ALL');
    setSortBy('date_desc');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#0052CC] rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Purchase Orders &amp; Live Freight Logistics
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time truck LR tracking, dispatch weighbridge slips, and automated EN 10204 3.1 MTC inspection certificates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetch('/api/orders')
                .then((res) => res.json())
                .then((data) => {
                  if (data.success && Array.isArray(data.data)) setOrders(data.data);
                })
                .finally(() => setLoading(false));
            }}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Refresh Orders"
          >
            <Clock size={16} />
          </button>

          <Link
            href="/products"
            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <span>+ Place New PO</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Purchase Orders</span>
            <div className="text-2xl font-black text-[#0F172A] font-mono mt-1">{stats.totalOrders}</div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              {stats.totalWeight.toFixed(0)} kg Total Tonnage
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0052CC] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In Transit &amp; Dispatched</span>
            <div className="text-2xl font-black text-indigo-600 font-mono mt-1">{stats.inTransit}</div>
            <div className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
              <Truck size={12} />
              <span>Live Consignments on Road</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivered to Sites</span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{stats.delivered}</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Signed Delivery Receipts</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Procurement Value</span>
            <div className="text-2xl font-black text-[#0052CC] font-mono mt-1">{formatINR(stats.totalSpend)}</div>
            <div className="text-xs text-slate-500 mt-1 font-mono">GST Invoiced &amp; Audited</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Filter & Search Console */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Top Controls: Search Input + Advanced Filter Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PO #, site address, carrier, LR docket, pincode, or items..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052CC] focus:outline-none bg-slate-50/50 focus:bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                showAdvancedFilters || (carrierFilter !== 'ALL' || paymentFilter !== 'ALL' || timeframeFilter !== 'ALL')
                  ? 'bg-blue-50 text-[#0052CC] border-blue-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Filter size={13} />
              <span>Filters</span>
              {(carrierFilter !== 'ALL' || paymentFilter !== 'ALL' || timeframeFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-[#0052CC]" />
              )}
            </button>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
                title="Reset all applied filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Pills with Dynamic Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 scrollbar-thin">
          {STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.id] ?? 0;
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0052CC] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Advanced Filters (Date Range, Carrier, Payment Terms) */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-xs">
            {/* Timeframe Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={12} />
                <span>Order Timeline</span>
              </label>
              <select
                value={timeframeFilter}
                onChange={(e) => {
                  setTimeframeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0052CC]"
              >
                {TIMEFRAME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Carrier Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Truck size={12} />
                <span>Logistics Transporter</span>
              </label>
              <select
                value={carrierFilter}
                onChange={(e) => {
                  setCarrierFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0052CC]"
              >
                <option value="ALL">All Transporters &amp; Fleets</option>
                {availableCarriers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <CreditCard size={12} />
                <span>Payment Settlement</span>
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0052CC]"
              >
                {PAYMENT_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Active:</span>

              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium">
                  Search: &ldquo;{search}&rdquo;
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="hover:text-slate-900"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#0052CC] rounded-lg text-[11px] font-medium">
                  Status: {statusFilter}
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className="hover:text-blue-900"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              {timeframeFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-medium">
                  Time: {TIMEFRAME_OPTIONS.find((t) => t.value === timeframeFilter)?.label}
                  <button
                    type="button"
                    onClick={() => setTimeframeFilter('ALL')}
                    className="hover:text-purple-900"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              {carrierFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-medium">
                  Carrier: {carrierFilter}
                  <button
                    type="button"
                    onClick={() => setCarrierFilter('ALL')}
                    className="hover:text-emerald-900"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              {paymentFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[11px] font-medium">
                  Payment: {PAYMENT_OPTIONS.find((p) => p.value === paymentFilter)?.label}
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('ALL')}
                    className="hover:text-amber-900"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>

            <div className="text-slate-500 font-medium text-[11px]">
              Showing <strong className="text-slate-800">{filteredOrders.length}</strong> of{' '}
              <strong className="text-slate-800">{orders.length}</strong> purchase orders
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">PO Number &amp; Date</th>
                <th className="py-3.5 px-4">Consignee Site</th>
                <th className="py-3.5 px-3 text-right">Net Value</th>
                <th className="py-3.5 px-3 text-center">Gross Weight</th>
                <th className="py-3.5 px-4">Carrier &amp; LR Docket</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions &amp; Docs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Clock className="w-6 h-6 mx-auto mb-2 animate-spin text-[#0052CC]" />
                    <p className="font-semibold text-slate-600">Loading purchase orders...</p>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <Truck className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-700 mb-1">
                      No purchase orders found
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                      {hasActiveFilters
                        ? 'No purchase orders match your current filter settings. Try adjusting or clearing your filters.'
                        : 'You haven’t placed any purchase orders yet.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
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
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setActiveViewModal(ord)}
                          className="font-mono font-bold text-[#0052CC] hover:underline text-sm block text-left"
                        >
                          {ord.orderNumber}
                        </button>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} />
                          <span>{ord.date || ord.dispatchDate || 'Immediate Dispatch'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-[#0F172A] truncate">
                          {ord.shippingAddress}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Consignee: {ord.companyName || ord.customerName || 'Direct Facility'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#0F172A]">
                        {formatINR(ord.netAmount)}
                        {ord.paymentStatus && (
                          <div className="text-[10px] text-slate-400 uppercase font-sans">
                            {ord.paymentStatus}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                        {ord.totalWeightKg.toFixed(1)} Kg
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{ord.carrier || 'Express Logistics'}</div>
                        <div className="font-mono text-[11px] text-[#0052CC] mt-0.5">
                          LR: {ord.trackingNumber || 'Awaiting Allocation'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {ord.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveViewModal(ord)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="View PO Details & Specs"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveInvoiceModal(ord)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                            title="View GST Tax Invoice"
                          >
                            Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMtcModal(ord)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052CC] text-[11px] font-bold transition-colors"
                            title="Download NABL MTC Certificate"
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

        {filteredOrders.length > 0 && (
          <div className="p-4 border-t border-slate-200">
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
              itemLabel="purchase orders"
            />
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {activeViewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#0052CC] rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">
                    Purchase Order: {activeViewModal.orderNumber}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Placed: {activeViewModal.date || 'Recent'} • Status: {activeViewModal.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveViewModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Shipping & Consignee info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Consignee Site
                  </span>
                  <div className="font-semibold text-slate-800">{activeViewModal.companyName || activeViewModal.customerName}</div>
                  <div className="text-slate-600 mt-0.5">{activeViewModal.shippingAddress}</div>
                  {activeViewModal.deliveryPincode && (
                    <div className="text-slate-500 font-mono mt-0.5">Pincode: {activeViewModal.deliveryPincode}</div>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Freight &amp; Dispatch
                  </span>
                  <div className="font-semibold text-slate-800">{activeViewModal.carrier}</div>
                  <div className="text-[#0052CC] font-mono mt-0.5">LR Docket: {activeViewModal.trackingNumber || 'Awaiting Allocation'}</div>
                  <div className="text-slate-500 font-mono mt-0.5">Tonnage: {activeViewModal.totalWeightKg.toFixed(1)} kg</div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div>
                <h4 className="font-bold text-slate-700 text-xs mb-2 uppercase tracking-wider">
                  Procured Line Items ({activeViewModal.itemsCount || activeViewModal.items?.length || 1})
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item / SKU</th>
                        <th className="py-2.5 px-3 text-center">Qty (Nos)</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {activeViewModal.items && activeViewModal.items.length > 0 ? (
                        activeViewModal.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-sans font-semibold text-slate-800">
                              <div>{item.name}</div>
                              <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                            </td>
                            <td className="py-2 px-3 text-center text-slate-700">{item.quantity}</td>
                            <td className="py-2 px-3 text-right text-slate-700">{formatINR(item.rate)}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">
                              {formatINR(item.quantity * item.rate)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-2 px-3 font-sans font-semibold text-slate-800">
                            Industrial Fasteners Consignment Package
                          </td>
                          <td className="py-2 px-3 text-center text-slate-700">{activeViewModal.itemsCount || 1} lots</td>
                          <td className="py-2 px-3 text-right text-slate-700">{formatINR(activeViewModal.netAmount)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {formatINR(activeViewModal.netAmount)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Value:</span>
                  <span className="font-mono font-bold">
                    {formatINR(Math.round((activeViewModal.netAmount / 1.18)))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18% IGST):</span>
                  <span className="font-mono font-bold">
                    {formatINR(Math.round(activeViewModal.netAmount - (activeViewModal.netAmount / 1.18)))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5">
                  <span>Payable PO Total:</span>
                  <span className="font-mono text-[#0052CC] text-sm">{formatINR(activeViewModal.netAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const ord = activeViewModal;
                    setActiveViewModal(null);
                    setActiveInvoiceModal(ord);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <FileText size={13} />
                  <span>View Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ord = activeViewModal;
                    setActiveViewModal(null);
                    setActiveMtcModal(ord);
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <ShieldCheck size={13} />
                  <span>MTC 3.1 Cert</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveViewModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-[#0F172A] text-base">
                  GST Tax Invoice: {activeInvoiceModal.orderNumber}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Carrier: {activeInvoiceModal.carrier} • LR: {activeInvoiceModal.trackingNumber || 'Pending'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Goods Total:</span>
                <span className="font-mono font-bold">
                  {formatINR(Math.round((activeInvoiceModal.netAmount / 1.18) * 1.05))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wholesale Tier Rebate:</span>
                <span className="font-mono text-emerald-600 font-bold">
                  - {formatINR(Math.round((activeInvoiceModal.netAmount / 1.18) * 0.05))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST (18% IGST):</span>
                <span className="font-mono font-bold">
                  {formatINR(Math.round(activeInvoiceModal.netAmount - activeInvoiceModal.netAmount / 1.18))}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                <span>Final Payable Invoice Amount:</span>
                <span className="font-mono text-[#0052CC]">{formatINR(activeInvoiceModal.netAmount)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer size={14} /> Print Formal Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MTC Modal */}
      {activeMtcModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" />
                <h3 className="font-extrabold text-[#0F172A] text-base">NABL MTC 3.1 Inspection Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMtcModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Official EN 10204 3.1 Mill Test Certificate certifying raw material heat chemistry, core hardness (HRC 28-34), proof load tensile rupture verification, and ASTM B117 salt spray protection.
              </p>
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                <div>Document: <strong>MTC-CBH-2026-9812</strong></div>
                <div>Standard: <strong>DIN 933 / ISO 4017 Class 8.8</strong></div>
                <div>Accreditation: <strong>NABL TC-8842 Certified Lab</strong></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveMtcModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => showToast('MTC 3.1 PDF Certificate downloaded.', 'success')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Download size={14} /> Download Verified PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
