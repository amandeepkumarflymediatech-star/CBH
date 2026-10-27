'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Truck,
  Package,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Search,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  Printer,
  X,
  FileCheck,
  RefreshCw,
  QrCode,
  ArrowUpRight,
  Filter,
  Check,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { CustomerOrder, BulkQuotation, RfqLineItem } from '@/lib/types';
import { INITIAL_ORDERS, INITIAL_QUOTES } from '@/lib/mock-data';
import { formatINR } from '@/lib/rfq-calculator';
import { getStoredUser, AuthUser } from '@/lib/auth';
import PhonePeModal from '@/components/payment/PhonePeModal';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [quotes, setQuotes] = useState<BulkQuotation[]>(INITIAL_QUOTES);
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_TRANSIT' | 'PROCESSING' | 'DELIVERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isPhonePeModalOpen, setIsPhonePeModalOpen] = useState(false);
  const [phonePePayAmount, setPhonePePayAmount] = useState(76180);
  const [phonePeOrderId, setPhonePeOrderId] = useState('CBH-ORD-2025-9281');
  const [activeMtcModal, setActiveMtcModal] = useState<CustomerOrder | null>(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<CustomerOrder | null>(null);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    const handleAuthChange = () => setCurrentUser(getStoredUser());
    window.addEventListener('cbh_auth_change', handleAuthChange);

    Promise.allSettled([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/rfq').then((r) => r.json()),
    ]).then(([ordRes, rfqRes]) => {
      if (ordRes.status === 'fulfilled' && ordRes.value?.data && Array.isArray(ordRes.value.data)) {
        setOrders(ordRes.value.data);
      }
      if (rfqRes.status === 'fulfilled' && rfqRes.value?.data && Array.isArray(rfqRes.value.data)) {
        setQuotes(rfqRes.value.data);
      }
    });

    return () => window.removeEventListener('cbh_auth_change', handleAuthChange);
  }, []);

  const clientName = currentUser?.fullName || 'Rajesh Sharma';
  const clientCompany = currentUser?.companyName || 'Apex Heavy Infra Ltd.';
  const clientGstin = currentUser?.gstin || '03AAACL1206M1ZN';
  const clientEmail = currentUser?.email || 'procurement@apexinfra.com';
  const clientPhone = currentUser?.phone || '+91 98880 21000';

  // Metrics
  const totalSpent = useMemo(() => orders.reduce((sum, o) => sum + (o.netAmount || 0), 0), [orders]);
  const totalWeightKg = useMemo(() => orders.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0), [orders]);
  const activeDispatches = useMemo(
    () => orders.filter((o) => o.status === 'PROCESSING' || o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED'),
    [orders]
  );
  const pendingQuotes = useMemo(() => quotes.filter((q) => q.status === 'PENDING' || q.status === 'QUOTED'), [quotes]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (activeTab !== 'ALL') {
      list = list.filter((o) => o.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.carrier.toLowerCase().includes(q) ||
          o.shippingAddress.toLowerCase().includes(q) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, activeTab, searchQuery]);

  // Trigger PhonePe payment for specific order
  const handlePayOrder = (order: CustomerOrder) => {
    setPhonePePayAmount(order.netAmount);
    setPhonePeOrderId(order.orderNumber);
    setIsPhonePeModalOpen(true);
  };

  // Frequently Ordered Catalog Fasteners
  const frequentFasteners = [
    {
      id: 1,
      sku: 'CBH-933-M10-100-8.8',
      name: 'Hex Screws DIN 933 M10x1.5x100mm Grade 8.8 High Tensile BP',
      standard: 'DIN 933',
      grade: 'Grade 8.8 HT',
      pricePerPc: 14.50,
      pricePerKg: 241.25,
      weightPerPcKg: 0.0601,
      stockPcs: 125000,
      minQty: 1000,
    },
    {
      id: 2,
      sku: 'CBH-934-M10-8.8-HDG',
      name: 'Hex Nuts DIN 934 M10x1.5 Grade 8.8 Hot Dip Galvanized',
      standard: 'DIN 934',
      grade: 'Grade 8.8 HDG',
      pricePerPc: 4.80,
      pricePerKg: 413.79,
      weightPerPcKg: 0.0116,
      stockPcs: 450000,
      minQty: 2500,
    },
    {
      id: 3,
      sku: 'CBH-125-M10-SS304',
      name: 'Plain Flat Washer DIN 125 M10 AISI 304 Stainless Steel',
      standard: 'DIN 125',
      grade: 'AISI 304 (A2-70)',
      pricePerPc: 2.40,
      pricePerKg: 585.36,
      weightPerPcKg: 0.0041,
      stockPcs: 850000,
      minQty: 5000,
    },
    {
      id: 4,
      sku: 'CBH-4014-M16-120-10.9',
      name: 'Heavy Hex Structural Bolt ISO 4014 M16x120mm Grade 10.9 Black',
      standard: 'ISO 4014',
      grade: 'Grade 10.9 Alloy',
      pricePerPc: 38.60,
      pricePerKg: 218.00,
      weightPerPcKg: 0.1770,
      stockPcs: 65000,
      minQty: 500,
    },
  ];

  const handleQuickReorder = (item: typeof frequentFasteners[0]) => {
    setReorderSuccessMsg(`Added ${item.minQty.toLocaleString()} PCS of ${item.standard} to RFQ Cart!`);
    setTimeout(() => setReorderSuccessMsg(null), 3500);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-7 pb-12">
      {/* ================================================================ */}
      {/* 1. EXECUTIVE WELCOME & PROCUREMENT COMMAND BANNER                */}
      {/* ================================================================ */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative background fastener mesh */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono tracking-wider uppercase font-bold text-[#FF8533]">
              <span className="flex items-center gap-1.5 bg-[#FF6B00]/15 text-[#FF8533] px-2.5 py-0.5 rounded-full border border-[#FF6B00]/30">
                <Sparkles size={11} /> CBH DIRECT MILL ALLOCATION
              </span>
              <span>•</span>
              <span className="text-slate-300">GST REGISTERED ENTERPRISE (HSN 7318)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Welcome back, {clientName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Building2 size={14} className="text-[#0052CC]" /> {clientCompany}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300">GSTIN: {clientGstin}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                <CheckCircle2 size={12} /> Verified OEM
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                VIP TIER 1 • 8% REBATE
              </span>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/bulk-order"
              className="px-4 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-102 no-underline"
            >
              <Plus size={15} />
              <span>New Bulk RFQ</span>
            </Link>

            <Link
              href="/products"
              target="_blank"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition-all no-underline"
            >
              <Package size={15} className="text-slate-400" />
              <span>Browse Catalog</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setPhonePePayAmount(orders[0]?.netAmount || 76180);
                setPhonePeOrderId(orders[0]?.orderNumber || `CBH-ORD-${Date.now()}`);
                setIsPhonePeModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#5f259f] hover:bg-[#4a1c7d] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
            >
              <QrCode size={15} />
              <span>Pay via PhonePe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reorder feedback notification */}
      {reorderSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{reorderSuccessMsg}</span>
          </div>
          <Link href="/checkout" className="text-xs text-[#0052CC] hover:underline font-extrabold flex items-center gap-1">
            <span>Proceed to Checkout</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* ================================================================ */}
      {/* 2. FOUR HIGH-IMPACT COMMERCIAL PROCUREMENT KPIS                  */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Procurement Spend */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Total Spend (YTD)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] text-[#0052CC] flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A] font-mono tracking-tight">
            {formatINR(totalSpent)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <ArrowUpRight size={13} /> +14.8% vs last Qtr
            </span>
            <span className="text-slate-400 font-mono">18% GST Input</span>
          </div>
        </div>

        {/* KPI 2: Active Mill Consignments */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Active Consignments
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A] font-mono tracking-tight">
            {activeDispatches.length} In Transit
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-600 font-semibold">TCI &amp; Safexpress Fleet</span>
            <span className="font-bold text-emerald-600">100% On-Time</span>
          </div>
        </div>

        {/* KPI 3: Steel Tonnage Procured */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Delivered Tonnage
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A] font-mono tracking-tight">
            {(totalWeightKg / 1000).toFixed(2)} MT Net
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-600 font-semibold">EN 10204 3.1 MTC</span>
            <span className="font-bold text-slate-500">6g Thread Spec</span>
          </div>
        </div>

        {/* KPI 4: 30-Day Revolving Credit Line */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Credit Facility
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#5f259f]/10 text-[#5f259f] flex items-center justify-center">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A] font-mono tracking-tight">
            ₹37,50,000
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-gradient-to-r from-[#0052CC] to-emerald-500 h-full w-[25%]" />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-500">
            <span>Utilized: ₹12.50L (25%)</span>
            <span className="font-bold text-emerald-700">Limit: ₹50.00L</span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 3. SPLIT ROW: KEY ACCOUNT MANAGER & QUICK RE-ORDER MATRIX        */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dedicated CBH Account Executive & Metallurgy Support (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Assigned Key Account Desk
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                ACTIVE SUPPORT
              </span>
            </div>

            <div className="flex items-center gap-3.5 mt-4">
              <div className="w-13 h-13 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-lg shadow-sm border border-slate-200 shrink-0">
                HS
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#0F172A]">Harpreet Singh</h4>
                <p className="text-[11px] text-[#0052CC] font-semibold">Chief Metallurgist &amp; Key Accounts</p>
                <p className="text-[10px] text-slate-400 mt-0.5">CBH Central Works (Ludhiana Plant)</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Direct Desk:</span>
                <span className="font-mono font-bold text-[#0F172A]">+91 98880 21000</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono font-medium text-slate-700 truncate max-w-[170px]">
                  harpreet@cbhfasteners.com
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Hours:</span>
                <span className="font-medium text-slate-700">Mon - Sat (8 AM - 8 PM IST)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href="https://wa.me/919888021000?text=Hello%20Harpreet%2C%20I%20need%20urgent%20fastener%20dispatch%20assistance%20for%20Apex%20Heavy%20Infra."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs no-underline"
            >
              <MessageSquare size={14} />
              <span>Direct WhatsApp Support</span>
            </a>

            <a
              href="tel:+919888021000"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors no-underline"
            >
              <Phone size={14} />
              <span>Call Account Manager</span>
            </a>
          </div>
        </div>

        {/* Right: Frequent Fasteners 1-Click Reorder (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-[#0F172A]">
                Frequently Procured Fasteners (Rapid Re-Order)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard ISO / DIN metric fasteners pre-calibrated for your fabrication yard
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1 no-underline"
            >
              <span>View Full 48+ SKUs</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {frequentFasteners.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#0052CC]/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-extrabold bg-[#0052CC]/10 text-[#0052CC] px-2 py-0.5 rounded">
                      {item.standard}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {item.stockPcs.toLocaleString()} PCS Ready
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#0F172A] mt-2 line-clamp-1" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    {item.grade} • ₹{item.pricePerPc.toFixed(2)} / PC (₹{item.pricePerKg.toFixed(2)} / KG)
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-mono">
                    MOQ: {item.minQty.toLocaleString()} PCS
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickReorder(item)}
                    className="px-3 py-1.5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Re-Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 4. PURCHASE ORDERS & LIVE CONSIGNMENT LOGISTICS DISPATCH COMMAND */}
      {/* ================================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header Bar with Tabs & Search */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-[#0F172A] tracking-tight">
                  Purchase Orders &amp; Mill Consignments
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                  {orders.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time freight logistics, LR docket tracking, and NABL EN 10204 3.1 Mill Test Certificates
              </p>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'IN_TRANSIT', label: 'In Transit' },
                { id: 'PROCESSING', label: 'Processing' },
                { id: 'DELIVERED', label: 'Delivered' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-[#0052CC] shadow-xs font-extrabold'
                      : 'hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by PO #, Transporter, Docket #, or Yard location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC]"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Consignment Items List */}
        <div className="divide-y divide-slate-200">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Package size={32} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No matching purchase orders found.</p>
              <p className="text-xs text-slate-400">Try modifying your search or switching filter tabs.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isInTransit = order.status === 'IN_TRANSIT';
              const isDelivered = order.status === 'DELIVERED';
              const isProcessing = order.status === 'PROCESSING';

              return (
                <div key={order.id} className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
                  {/* Row Top: Order ID, Date, Amount, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-black text-sm text-[#0052CC] bg-[#EBF3FC] px-3 py-1 rounded-lg">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Date: {order.date}
                      </span>
                      <span className="text-xs text-slate-600 font-mono font-semibold">
                        {order.itemsCount} Line Items • {order.totalWeightKg.toFixed(1)} KG Net
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-mono">Payable Total</span>
                        <span className="text-base font-black text-[#0F172A] font-mono">
                          {formatINR(order.netAmount)}
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono flex items-center gap-1.5 ${
                          isInTransit
                            ? 'bg-blue-100 text-[#0052CC] border border-blue-200'
                            : isDelivered
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isInTransit && <Truck size={13} className="animate-pulse" />}
                        {isDelivered && <CheckCircle2 size={13} />}
                        {isProcessing && <Clock size={13} />}
                        <span>{order.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Consignment Specs & Transporter Docket */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Fastener Specifications</span>
                      <span className="font-bold text-[#0F172A] line-clamp-1 mt-0.5">
                        High Tensile DIN 933 8.8 Hex Bolts &amp; DIN 934 Nuts
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                        Direct EN 10204 3.1 NABL Lab Heat #CBH-HT-882
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Carrier &amp; LR Docket</span>
                      <span className="font-bold text-[#0F172A] mt-0.5 block">
                        {order.carrier}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                        Docket: {order.trackingNumber || 'PENDING DISPATCH'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Factory Delivery Address</span>
                      <span className="text-slate-700 line-clamp-2 mt-0.5" title={order.shippingAddress}>
                        {order.shippingAddress}
                      </span>
                    </div>
                  </div>

                  {/* Visual 5-Stage Logistics Stepper */}
                  <div className="pt-2">
                    <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                      {[
                        { label: 'PO Approved', done: true },
                        { label: 'Heat Treatment', done: true },
                        { label: 'Weighbridge Calibrated', done: isInTransit || isDelivered },
                        { label: 'In Transit (GPS)', done: isInTransit || isDelivered, active: isInTransit },
                        { label: 'Yard Delivered', done: isDelivered },
                      ].map((step, idx) => (
                        <div key={idx} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              step.done
                                ? 'bg-emerald-500'
                                : step.active
                                ? 'bg-[#0052CC] animate-pulse'
                                : 'bg-slate-200'
                            }`}
                          />
                          <span className={step.done || step.active ? 'text-[#0F172A]' : 'text-slate-400'}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: MTC Download, Invoice, PhonePe */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Calibration Docket: {order.mtcCertNumber}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveMtcModal(order)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileCheck size={13} className="text-[#0052CC]" />
                        <span>View EN 10204 3.1 MTC</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveInvoiceModal(order)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText size={13} className="text-slate-500" />
                        <span>Tax Invoice (GST)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePayOrder(order)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#5f259f] hover:bg-[#4a1c7d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <QrCode size={13} />
                        <span>Pay via PhonePe</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* 5. ACTIVE BULK RFQS & TENDER PROFORMA DESK                       */}
      {/* ================================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-black text-base text-[#0F172A] tracking-tight">
              Active Bulk RFQ Inquiries &amp; Tenders
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Wholesale volume tier discount matrix with direct proforma invoice settlement
            </p>
          </div>

          <Link
            href="/customer/rfqs"
            className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1 no-underline"
          >
            <span>View All RFQs</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.slice(0, 2).map((quote) => (
            <div
              key={quote.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#0052CC] bg-[#EBF3FC] px-2.5 py-1 rounded">
                    {quote.rfqNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold font-mono">
                    {quote.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="text-xs font-bold text-[#0F172A]">
                    Commercial Fastener Schedule ({quote.itemsCount} SKUs)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Gross: {formatINR(quote.grossAmount)} • Rebate (-{quote.discountPct}%): -{formatINR((quote.grossAmount * quote.discountPct) / 100)}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Quoted Net Payable</span>
                    <span className="text-lg font-black text-[#0F172A] font-mono">
                      {formatINR(quote.netTotal)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono font-medium">
                    Valid till: {quote.validUntil}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPhonePePayAmount(quote.netTotal);
                    setPhonePeOrderId(quote.rfqNumber);
                    setIsPhonePeModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-[#5f259f] hover:bg-[#4a1c7d] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <QrCode size={13} />
                  <span>Accept &amp; Pay via PhonePe</span>
                </button>

                <Link
                  href="/customer/rfqs"
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center no-underline"
                >
                  <span>Review Proforma</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* 6. METALLURGICAL QUALITY & NABL COMPLIANCE STRIP                 */}
      {/* ================================================================ */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF8533]">
              <ShieldCheck size={16} />
              <span>NABL Accredited Quality Assurance &amp; ISO 9001:2015</span>
            </div>
            <h4 className="text-base font-extrabold text-white mt-1">
              Guaranteed Metallurgical Compliance &amp; Traceability
            </h4>
          </div>
          <Link
            href="/customer/certificates"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 self-start md:self-auto no-underline transition-colors"
          >
            <span>Quality Certification Dossier</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-medium">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Thread Inspection</span>
            <span className="text-white font-bold block">Class 6g Go / No-Go Gauge</span>
            <span className="text-[11px] text-emerald-400">100% Optical Sorted</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Proof Load &amp; Yield</span>
            <span className="text-white font-bold block">IS 1367 / ISO 898-1</span>
            <span className="text-[11px] text-emerald-400">800 - 1040 N/mm² Tested</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Corrosion Protection</span>
            <span className="text-white font-bold block">HDG 86µm / Zinc-Nickel</span>
            <span className="text-[11px] text-emerald-400">1000h Salt Spray Grade</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Environmental Standard</span>
            <span className="text-white font-bold block">RoHS &amp; REACH Compliant</span>
            <span className="text-[11px] text-emerald-400">Directive 2011/65/EU</span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 7. INTERACTIVE PHONEPE PAYMENT MODAL                             */}
      {/* ================================================================ */}
      <PhonePeModal
        isOpen={isPhonePeModalOpen}
        onClose={() => setIsPhonePeModalOpen(false)}
        amount={phonePePayAmount}
        orderNumber={phonePeOrderId}
        customerName={clientName}
        customerPhone={clientPhone}
        customerEmail={clientEmail}
        companyName={clientCompany}
        onSuccess={(data) => {
          setIsPhonePeModalOpen(false);
          router.push(
            `/order-success?txnId=${data.txnId}&orderNumber=${data.orderNumber}&amount=${data.amount}&mode=${encodeURIComponent(
              data.mode
            )}`
          );
        }}
      />

      {/* ================================================================ */}
      {/* 8. EN 10204 3.1 MTC INSPECTION CERTIFICATE PREVIEW MODAL         */}
      {/* ================================================================ */}
      {activeMtcModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#FF8533] font-bold">
                  EN 10204 3.1 INSPECTION CERTIFICATE
                </span>
                <h3 className="text-base font-black">NABL Metallurgical Test Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMtcModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Certificate #</span>
                  <span className="font-bold text-[#0052CC]">{activeMtcModal.mtcCertNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Order PO #</span>
                  <span className="font-bold text-[#0F172A]">{activeMtcModal.orderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Heat Treatment Batch</span>
                  <span className="font-bold text-[#0F172A]">HT-2026-LUD-882</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Test Standard</span>
                  <span className="font-bold text-emerald-700">ISO 898-1 / IS 1367</span>
                </div>
              </div>

              {/* Chemical Analysis Table */}
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1.5">Chemical Composition Analysis (%)</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Element</th>
                        <th className="p-2">Carbon (C)</th>
                        <th className="p-2">Manganese (Mn)</th>
                        <th className="p-2">Phosphorus (P)</th>
                        <th className="p-2">Sulfur (S)</th>
                        <th className="p-2">Chromium (Cr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 font-bold text-slate-500">Specified</td>
                        <td className="p-2">0.25 - 0.40</td>
                        <td className="p-2">0.60 - 0.90</td>
                        <td className="p-2">&le; 0.025</td>
                        <td className="p-2">&le; 0.025</td>
                        <td className="p-2">&ge; 0.20</td>
                      </tr>
                      <tr className="bg-emerald-50/50 font-bold text-emerald-800">
                        <td className="p-2">Observed</td>
                        <td className="p-2">0.34 %</td>
                        <td className="p-2">0.78 %</td>
                        <td className="p-2">0.012 %</td>
                        <td className="p-2">0.009 %</td>
                        <td className="p-2">0.28 %</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mechanical Properties */}
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1.5">Mechanical Strength Calibration</h4>
                <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Tensile Strength (Rm)</span>
                    <strong className="text-xs text-[#0F172A]">840 N/mm²</strong>
                    <span className="text-[10px] text-emerald-600 block">Pass (Min 800)</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Yield Stress (Rp 0.2)</span>
                    <strong className="text-xs text-[#0F172A]">675 N/mm²</strong>
                    <span className="text-[10px] text-emerald-600 block">Pass (Min 640)</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Hardness (HRC)</span>
                    <strong className="text-xs text-[#0F172A]">28.5 HRC</strong>
                    <span className="text-[10px] text-emerald-600 block">Pass (22 - 32)</span>
                  </div>
                </div>
              </div>

              {/* Inspection sign off */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Authorized QC Inspector: <strong>Harpreet Singh, NABL Lab Ludhiana</strong></span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  CERTIFIED 3.1 COMPLIANT
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print MTC</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMtcModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold text-xs transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 9. GST TAX INVOICE PREVIEW MODAL                                 */}
      {/* ================================================================ */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="bg-[#0052CC] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-200 font-bold">
                  TAX INVOICE • HSN 7318
                </span>
                <h3 className="text-base font-black">Capital Bolts &amp; Hardwares (CBH)</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="flex justify-between border-b pb-3 text-slate-600">
                <div>
                  <strong className="text-sm text-[#0F172A] block font-sans">CBH Central Fastener Works</strong>
                  <span>G.T. Road, Industrial Area-A, Ludhiana, Punjab - 141003</span>
                  <span className="block mt-0.5">GSTIN: 03AAACL1206M1ZN</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#0052CC] text-sm block">Invoice #{activeInvoiceModal.orderNumber}</span>
                  <span>Date: {activeInvoiceModal.date}</span>
                  <span className="block text-emerald-600 font-bold">Paid via Gateway</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Billed &amp; Shipped To:</span>
                <strong className="font-sans text-sm text-[#0F172A]">{clientCompany}</strong>
                <p className="text-[11px] mt-0.5">{activeInvoiceModal.shippingAddress}</p>
                <p className="text-[11px] font-bold mt-0.5">Buyer GSTIN: {clientGstin}</p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">HSN Code</th>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Taxable Amt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-bold">7318 15 00</td>
                      <td className="p-2">Industrial Metric Fasteners DIN 933 8.8 / DIN 934</td>
                      <td className="p-2 text-right">{activeInvoiceModal.totalWeightKg.toFixed(1)} KG</td>
                      <td className="p-2 text-right">{formatINR(activeInvoiceModal.netAmount / 1.18)}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="p-2 text-right font-bold">CGST (9%):</td>
                      <td className="p-2 text-right font-bold">{formatINR((activeInvoiceModal.netAmount / 1.18) * 0.09)}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="p-2 text-right font-bold">SGST (9%):</td>
                      <td className="p-2 text-right font-bold">{formatINR((activeInvoiceModal.netAmount / 1.18) * 0.09)}</td>
                    </tr>
                    <tr className="bg-blue-50 font-black text-sm text-[#0052CC]">
                      <td colSpan={3} className="p-2 text-right">Total Net Invoice Amount:</td>
                      <td className="p-2 text-right">{formatINR(activeInvoiceModal.netAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInvoiceModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
