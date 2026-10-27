'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Truck,
  FileText,
  Package,
  CheckCircle2,
  MapPin,
  Users2,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Download,
  Award,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { CustomerOrder, BulkQuotation } from '@/lib/types';
import { INITIAL_ORDERS, INITIAL_QUOTES } from '@/lib/mock-data';
import { formatINR } from '@/lib/rfq-calculator';

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [quotes, setQuotes] = useState<BulkQuotation[]>(INITIAL_QUOTES);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/rfq').then((r) => r.json()),
    ]).then(([ordRes, rfqRes]) => {
      if (ordRes.status === 'fulfilled' && ordRes.value?.data) setOrders(ordRes.value.data);
      if (rfqRes.status === 'fulfilled' && rfqRes.value?.data) setQuotes(rfqRes.value.data);
    });
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + (o.netAmount || 0), 0);
  const totalWeightKg = orders.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0);
  const activeDispatches = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'DISPATCHED');
  const pendingQuotes = quotes.filter((q) => q.status === 'PENDING' || q.status === 'QUOTED');

  return (
    <div className="space-y-6">
      {/* Enterprise Account Welcome & Credit Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Enterprise Procurement Station
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              ⭐ VIP TIER • 8% REBATE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck size={12} /> GST Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Direct mill dispatches, EN 10204 3.1 NABL-certified fasteners, and active revolving credit account.
          </p>
        </div>

        {/* Credit Card Utilization Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full lg:w-auto shrink-0 max-w-full">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600 flex items-center gap-1.5">
              <CreditCard size={14} className="text-[#0052CC]" /> Approved Credit Limit
            </span>
            <span className="text-[#0052CC] font-mono">₹37.5L Available</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#0052CC] to-[#059669] h-full w-[25%]" />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
            <span>Utilized: ₹12.50L (25%)</span>
            <span>Limit: ₹50.00L (30 Days)</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Procurement</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A] font-mono">{formatINR(totalSpent)}</div>
          <div className="text-xs text-emerald-600 font-bold mt-2">
            Saved {formatINR(totalSpent * 0.08)} via VIP Rebate
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivered Fasteners</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A] font-mono">{(totalWeightKg / 1000).toFixed(1)} MT</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Across {orders.length} dispatched PO consignments
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Shipments</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">{activeDispatches.length} In Transit</div>
          <Link href="/customer/orders" className="text-xs text-[#0052CC] font-bold mt-2 inline-flex items-center gap-1 hover:underline">
            View live tracking <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active RFQ Quotes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">{pendingQuotes.length} Pending</div>
          <Link href="/customer/rfqs" className="text-xs text-[#0052CC] font-bold mt-2 inline-flex items-center gap-1 hover:underline">
            Review formal quotes <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Partitioned Dedicated Sections Cards */}
      <div>
        <h2 className="text-base font-extrabold text-[#0F172A] mb-3">Enterprise Buyer Portal Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Section: Purchase Orders & Live Tracking */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0052CC] flex items-center justify-center">
                    <Truck size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Purchase Orders &amp; Tracking</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] text-xs font-bold font-mono">
                  {orders.length} Orders
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track road fleet LR dockets (TCI Express, Safexpress), review weighbridge tonnage slips, download formal GST Tax Invoices, and monitor site delivery status.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/customer/orders"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>View All Purchase Orders</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section: Bulk RFQs & BOM Desk */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#FF6B00] flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Bulk RFQs &amp; BOM Desk</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                  {pendingQuotes.length} Quotes
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload project Bill of Materials (BOM) Excel sheets, get instant volume tier discounts, review signed PDF quotes, and convert quotations into approved purchase orders.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/customer/rfqs"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Open Quotations &amp; RFQ Desk</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section: NABL MTC & Certificates */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Award size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">NABL MTC 3.1 Quality Vault</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                  100% NABL
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search and download certified EN 10204 3.1 Mill Test Certificates with chemical heat spectrometry (OES), proof load tensile rupture verification, and ASTM B117 salt spray reports.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/customer/certificates"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Access Certificates Vault</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section: Project Delivery Sites */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Project Delivery Sites</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6B00] text-xs font-bold font-mono">
                  Locations
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage infrastructure consignee addresses across India (Delhi Metro, Jamnagar, Bengaluru), assign site in-charge contacts, and pre-authorize road freight gate passes.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/customer/sites"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Manage Project Sites</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section: Procurement Team */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users2 size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Procurement Team &amp; Access</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold font-mono">
                  Corporate
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Invite project site engineers, QA/QC inspectors, and accounts personnel with role-based permissions (MTC download view-only, billing review, or full PO authority).
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/customer/team"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Manage Team Permissions</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section: Direct Procurement Storefront */}
          <div className="bg-gradient-to-br from-[#0F172A] to-[#0052CC] text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-[#FF6B00] flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
                <h3 className="font-extrabold text-white text-base">Direct Fastener Procurement</h3>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                Browse 2 Lac+ SKUs in DIN, ISO, ASTM, and BIS standards. Benefit from live PCS &amp; KGS dual unit pricing, immediate warehouse dispatch, and automatic VIP volume rebates.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/15">
              <Link
                href="/products"
                target="_blank"
                className="w-full py-2.5 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs flex items-center justify-between transition-colors shadow"
              >
                <span>Browse Live Fastener Catalog</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
