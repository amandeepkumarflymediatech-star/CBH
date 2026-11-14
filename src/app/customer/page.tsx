'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Zap,
  CreditCard,
  Award,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Boxes,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Plus,
  X,
  ChevronRight,
  Printer
} from 'lucide-react';
import { CustomerOrder, BulkQuotation } from '@/lib/types';
import { formatINR, toTitleCase } from '@/lib/rfq-calculator';
import { getStoredUser, AuthUser } from '@/lib/auth';
import { showToast } from '@/lib/swal';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Invoices'>('Overview');

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [quotes, setQuotes] = useState<BulkQuotation[]>([]);
  const [totalProductsProcured, setTotalProductsProcured] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [creditAvailable, setCreditAvailable] = useState(2500000);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    if (user?.creditLimit) {
      setCreditAvailable(user.creditLimit);
    }

    const orderApiUrl = user?.email
      ? `/api/orders?customerEmail=${encodeURIComponent(user.email)}`
      : user?.id
      ? `/api/orders?customerId=${user.id}`
      : '/api/orders';

    Promise.allSettled([
      fetch(orderApiUrl).then((r) => r.json()),
      fetch('/api/rfq').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([ordRes, rfqRes, prodRes]) => {
      if (ordRes.status === 'fulfilled' && ordRes.value?.data) {
        const ordList = Array.isArray(ordRes.value.data) ? ordRes.value.data : [];
        setOrders(ordList);
        const sum = ordList.reduce((acc: number, o: any) => acc + (o.netAmount || 0), 0);
        setTotalSpend(sum);
        if (user?.creditLimit) {
          setCreditAvailable(Math.max(0, user.creditLimit - sum));
        }
      }
      if (rfqRes.status === 'fulfilled' && rfqRes.value?.data) {
        const rfqList = Array.isArray(rfqRes.value.data) ? rfqRes.value.data : [];
        setQuotes(rfqList);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
        const prodList = Array.isArray(prodRes.value.data) ? prodRes.value.data : [];
        setTotalProductsProcured(prodList.length);
      }
    });
  }, []);

  // Sync tab with URL search parameter (?tab=invoices)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && tabParam.toLowerCase() === 'invoices') {
        setActiveTab('Invoices');
      } else if (tabParam && ['orders', 'rfqs', 'certificates', 'sites', 'team', 'profile', 'settings'].includes(tabParam.toLowerCase())) {
        router.push(`/customer/${tabParam.toLowerCase()}`);
      } else {
        setActiveTab('Overview');
      }
    }
  }, [router]);

  const setTab = (tab: 'Overview' | 'Invoices') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tab === 'Invoices') {
        url.searchParams.set('tab', 'invoices');
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const clientCompany = currentUser?.companyName || 'Apex Heavy Infrastructure Ltd.';
  const clientGstin = currentUser?.gstin || '03AAACA1122C1Z4';
  const creditLimit = Number(currentUser?.creditLimit || 2500000);
  const creditPercent = Math.min(100, Math.round((totalSpend / Math.max(1, creditLimit)) * 100));
  const activeConsignments = orders.filter((o) => o.status === 'IN_TRANSIT');

  return (
    <div className="space-y-4">
      {/* Sleek Top Ops Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] text-[#5B4DF6] flex items-center justify-center shrink-0 border border-[#D5D8FA]">
            <Building2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">
                {clientCompany}
              </h1>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={11} /> GST: {clientGstin}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Enterprise Procurement Terminal • Revolving Net-30 Facility Active
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setTab('Overview')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'Overview'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setTab('Invoices')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'Invoices'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invoices &amp; Credit
            </button>
          </div>

          <Link
            href="/bulk-order"
            className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 no-underline cursor-pointer"
          >
            <Plus size={13} />
            <span>New Bulk RFQ</span>
          </Link>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TAB 1: OVERVIEW                                                  */}
      {/* ================================================================ */}
      {activeTab === 'Overview' && (
        <div className="space-y-4">
          {/* Compact 1-Row Metric Strip (4 KPIs) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Metric 1: Total Fasteners */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Procured Volume</div>
                <div className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight mt-0.5">
                  {totalProductsProcured.toLocaleString()} SKUs
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {(orders.reduce((acc, o) => acc + (o.totalWeightKg || 0), 0) / 1000).toFixed(2)} MT Tonnage
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] text-[#5B4DF6] flex items-center justify-center shrink-0">
                <Boxes size={16} />
              </div>
            </div>

            {/* Metric 2: Active Consignments */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Active Shipments</div>
                <div className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight mt-0.5">
                  {activeConsignments.length} In Transit
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">
                  {activeConsignments.length > 0 ? 'Live GPS Dispatched' : 'No Active Dispatches'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Truck size={16} />
              </div>
            </div>

            {/* Metric 3: Total Spend (YTD) */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">YTD Spend</div>
                <div className="text-base sm:text-lg font-black text-[#0F172A] font-mono tracking-tight mt-0.5">
                  {formatINR(totalSpend)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">18% GST Input Credit</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ArrowDownLeft size={16} />
              </div>
            </div>

            {/* Metric 4: Revolving Credit Facility */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Available Credit</div>
                <div className="text-base sm:text-lg font-black text-[#0F172A] font-mono tracking-tight mt-0.5">
                  {formatINR(creditAvailable)}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">Net 30-Day Revolving</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center shrink-0">
                <CreditCard size={16} />
              </div>
            </div>
          </div>

          {/* 2-Column Operational Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column (7 Cols): Live Plant Dispatches */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-[#0052CC]" />
                    <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Live Plant Dispatches &amp; Consignments
                    </h2>
                  </div>
                  <Link
                    href="/customer/orders"
                    className="text-[11px] font-bold text-[#0052CC] hover:underline flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <Truck size={24} className="mx-auto mb-1 text-slate-300" />
                    <span>No active consignments on file.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {orders.slice(0, 4).map((ord) => (
                      <div key={ord.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-lg px-1 transition-colors">
                        <div>
                          <div className="font-mono font-bold text-xs text-[#0052CC] flex items-center gap-1.5">
                            <span>#{ord.orderNumber}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              ord.status === 'IN_TRANSIT'
                                ? 'bg-blue-50 text-[#0052CC]'
                                : ord.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {ord.status === 'IN_TRANSIT' ? 'In Transit' : ord.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {ord.carrier || 'Express Logistics'} • Docket: {ord.trackingNumber || 'Pending'} • {ord.totalWeightKg.toFixed(1)} KG
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3 shrink-0">
                          <div>
                            <span className="text-xs font-mono font-black text-[#0F172A] block">
                              {formatINR(ord.netAmount)}
                            </span>
                            <span className="text-[9px] text-slate-400 block">{ord.date}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveInvoiceModal(ord)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer transition-colors"
                          >
                            Tax Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 Cols): Bulk Quotes + Quick Vault Ribbon */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card 1: Bulk RFQ Submissions */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Zap size={15} className="text-amber-600" />
                    <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Recent Bulk RFQ Quotes
                    </h2>
                  </div>
                  <Link
                    href="/customer/rfqs"
                    className="text-[11px] font-bold text-[#0052CC] hover:underline flex items-center gap-1"
                  >
                    <span>View RFQs</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>

                {quotes.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    <span>No RFQs requested yet. Upload your fastener BOM anytime.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {quotes.slice(0, 3).map((q) => (
                      <div key={q.id} className="py-2 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-mono font-bold text-xs text-[#0F172A]">
                            RFQ #{q.rfqNumber}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {q.itemsCount || 1} Lines • {q.date || 'Recent'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-emerald-700">
                            {formatINR(q.netTotal || 0)}
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800">
                            {q.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 2: Quick Vault Access Ribbon */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Procurement Facilities &amp; Vaults
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href="/customer/certificates"
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-colors text-center no-underline block"
                  >
                    <Award size={16} className="mx-auto mb-1 text-emerald-600" />
                    <div className="text-[11px] font-bold">NABL MTCs</div>
                    <div className="text-[9px] text-slate-400">3.1 Vault</div>
                  </Link>

                  <Link
                    href="/customer/sites"
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-800 border border-slate-200 transition-colors text-center no-underline block"
                  >
                    <Building2 size={16} className="mx-auto mb-1 text-orange-600" />
                    <div className="text-[11px] font-bold">Sites</div>
                    <div className="text-[9px] text-slate-400">Gate Passes</div>
                  </Link>

                  <Link
                    href="/customer/team"
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 transition-colors text-center no-underline block"
                  >
                    <Users size={16} className="mx-auto mb-1 text-indigo-600" />
                    <div className="text-[11px] font-bold">Team</div>
                    <div className="text-[9px] text-slate-400">Signatories</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: INVOICES & CREDIT LEDGER                                  */}
      {/* ================================================================ */}
      {activeTab === 'Invoices' && (
        <div className="space-y-4">
          {/* Credit Progress Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">
                  Revolving Credit Limit (Net-30)
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                  {formatINR(creditLimit)}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Utilized</span>
                  <div className="text-sm font-bold font-mono text-slate-200">
                    {formatINR(totalSpend)} ({creditPercent}%)
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-mono block">Available Balance</span>
                  <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
                    {formatINR(creditAvailable)}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#5B4DF6] to-emerald-400 h-full transition-all"
                style={{ width: `${creditPercent}%` }}
              />
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <FileText size={15} className="text-[#0052CC]" />
                <span>Tax Invoices (HSN 7318 Compliant)</span>
              </h2>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {orders.length} Invoices
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <FileText size={28} className="mx-auto mb-1 text-slate-300 stroke-1" />
                <p className="font-semibold text-slate-600">No GST tax invoices issued yet</p>
                <p className="text-[10px] text-slate-400">Electronic tax invoices compliant with HSN 7318 appear automatically when orders are confirmed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Tax Invoice #</th>
                      <th className="py-2.5 px-3">Billing Date</th>
                      <th className="py-2.5 px-3">Consignment Weight</th>
                      <th className="py-2.5 px-3">Net Invoice Amount</th>
                      <th className="py-2.5 px-3 text-center">Statutory Compliance</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-[#0052CC] text-xs">
                            INV-{ord.orderNumber}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {ord.date}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                          {ord.totalWeightKg.toFixed(1)} KG
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black text-[#0F172A]">
                          {formatINR(ord.netAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            HSN 7318 • 18% ITC
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveInvoiceModal(ord)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              View Invoice
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast(`Downloaded Tax Invoice PDF (INV-${ord.orderNumber})`, 'success')}
                              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Download size={11} /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tax Invoice Inspection Modal */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-xl w-full p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="bg-[#0052CC] text-white p-3.5 -m-5 mb-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-200 font-bold block">
                  Original Tax Invoice (HSN 7318)
                </span>
                <span className="font-extrabold text-sm sm:text-base">
                  Invoice #INV-{activeInvoiceModal.orderNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Consignee</span>
                  <span className="font-bold text-[#0F172A] block">{clientCompany}</span>
                  <span className="font-mono text-slate-500">GST: {clientGstin}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Dispatch Details</span>
                  <span className="font-mono block">Date: {activeInvoiceModal.date}</span>
                  <span className="text-emerald-600 font-bold">18% Input Credit Verified</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-2">HSN</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Net Weight</th>
                      <th className="p-2 text-right">Base Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-mono font-bold text-slate-600">7318 15 00</td>
                      <td className="p-2">
                        <span className="font-bold text-[#0F172A] block">High Tensile Industrial Fasteners</span>
                        <span className="text-[10px] text-slate-400 font-mono">DIN / ISO Specification</span>
                      </td>
                      <td className="p-2 text-right font-mono font-bold">{activeInvoiceModal.totalWeightKg.toFixed(1)} KG</td>
                      <td className="p-2 text-right font-mono font-bold">{formatINR(activeInvoiceModal.netAmount / 1.18)}</td>
                    </tr>
                    <tr className="bg-slate-50 text-[10px]">
                      <td colSpan={3} className="p-2 text-right font-bold text-slate-600">CGST (9%):</td>
                      <td className="p-2 text-right font-bold font-mono">{formatINR((activeInvoiceModal.netAmount / 1.18) * 0.09)}</td>
                    </tr>
                    <tr className="bg-slate-50 text-[10px]">
                      <td colSpan={3} className="p-2 text-right font-bold text-slate-600">SGST (9%):</td>
                      <td className="p-2 text-right font-bold font-mono">{formatINR((activeInvoiceModal.netAmount / 1.18) * 0.09)}</td>
                    </tr>
                    <tr className="bg-blue-50 font-black text-xs text-[#0052CC]">
                      <td colSpan={3} className="p-2 text-right">Total Net Invoice Amount:</td>
                      <td className="p-2 text-right font-mono">{formatINR(activeInvoiceModal.netAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Tax Invoice INV-${activeInvoiceModal.orderNumber} sent to printer`, 'info');
                  window.print();
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={12} />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Downloaded Tax Invoice PDF (INV-${activeInvoiceModal.orderNumber})`, 'success');
                  setActiveInvoiceModal(null);
                }}
                className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={12} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
