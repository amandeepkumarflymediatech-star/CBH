'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  FileCheck2,
  Truck,
  Users,
  TrendingUp,
  Scale,
  Clock,
  Layers,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Zap,
  Folder,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Building2,
  Flame,
  Package,
  Globe,
  CreditCard
} from 'lucide-react';
import { formatINR } from '@/lib/rfq-calculator';
import { INITIAL_PRODUCTS, INITIAL_QUOTES, INITIAL_ORDERS, INITIAL_USERS, INITIAL_SURPLUS_LOTS } from '@/lib/mock-data';

export default function AdminConsolePage() {
  const [productsCount, setProductsCount] = useState(INITIAL_PRODUCTS.length);
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [usersCount, setUsersCount] = useState(INITIAL_USERS.length);
  const [surplusCount, setSurplusCount] = useState(INITIAL_SURPLUS_LOTS.length);
  const [categoriesCount, setCategoriesCount] = useState(4);
  const [subcategoriesCount, setSubcategoriesCount] = useState(12);

  useEffect(() => {
    // Load live telemetry counts
    Promise.allSettled([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/rfq').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/surplus').then((r) => r.json()),
      fetch('/api/catalog/categories').then((r) => r.json()),
      fetch('/api/catalog/subcategories').then((r) => r.json()),
    ]).then(([p, r, o, u, s, c, sub]) => {
      if (p.status === 'fulfilled' && p.value?.data) setProductsCount(p.value.data.length);
      if (r.status === 'fulfilled' && r.value?.data) setQuotes(r.value.data);
      if (o.status === 'fulfilled' && o.value?.data) setOrders(o.value.data);
      if (u.status === 'fulfilled' && u.value?.data) setUsersCount(u.value.data.length);
      if (s.status === 'fulfilled' && s.value?.data) setSurplusCount(s.value.data.length);
      if (c.status === 'fulfilled' && c.value?.data) setCategoriesCount(c.value.data.length);
      if (sub.status === 'fulfilled' && sub.value?.data) setSubcategoriesCount(sub.value.data.length);
    });
  }, []);

  // Compute Operations metrics
  const totalTurnover = orders.reduce((sum, o) => sum + (o.netAmount || 0), 0) + 1250000;
  const totalFreightKg = orders.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0) + 9400;
  const pendingRfqs = quotes.filter((q) => q.status === 'PENDING');
  const activeDispatches = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'DISPATCHED');

  return (
    <div className="space-y-6">
      {/* KPI Top Alert Strip */}
      <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Central Operations KPI Command
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fastener inventory valuation, automated pricing markups, logistics dispatch, and B2B quotation approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/rfqs"
            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <FileCheck2 className="w-4 h-4" /> Review RFQs ({pendingRfqs.length})
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-[#F8FAFC] hover:bg-slate-200 text-[#0F172A] border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Truck className="w-4 h-4 text-[#0052CC]" /> Dispatch Desk
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total B2B Turnover</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A] font-mono">{formatINR(totalTurnover)}</div>
          <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <span>+14.8% vs last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Freight Dispatched</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Scale size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A] font-mono">{(totalFreightKg / 1000).toFixed(1)} MT</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Across {orders.length} commercial dispatches
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Bulk RFQs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#FF6B00] flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#FF6B00] font-mono">{pendingRfqs.length} In Review</div>
          <Link href="/admin/rfqs" className="text-xs text-[#0052CC] font-bold mt-2 inline-flex items-center gap-1 hover:underline">
            Take action on desk <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inventory Catalog</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Boxes size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A] font-mono">{productsCount} Active SKUs</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            {categoriesCount} Categories • {subcategoriesCount} Subcategories
          </div>
        </div>
      </div>

      {/* Partitioned Dedicated Sections Cards */}
      <div>
        <h2 className="text-base font-extrabold text-[#0F172A] mb-3">Operations Desks &amp; Department Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Section Card: Bulk RFQs */}
          <div className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0052CC] flex items-center justify-center">
                    <FileCheck2 size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Bulk RFQs Approvals</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                  {pendingRfqs.length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review client BOM spreadsheets, adjust raw steel index rate margins, apply volume slab rebates, and generate signed PDF quotations.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/admin/rfqs"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Open RFQ Approvals Desk</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section Card: Orders & Dispatch */}
          <div className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Truck size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Dispatch &amp; LR Logistics</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                  {orders.length} Orders
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Assign road transporters (TCI Express, Safexpress, V-Trans), input truck LR docket numbers, attach weighbridge slips, and update live shipment tracking.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/admin/orders"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Open Dispatch &amp; Logistics Desk</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section Card: Categories & Subcategories */}
          <div className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                    <Folder size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Categories &amp; Subcategories</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6B00] text-xs font-bold font-mono">
                  4-Level
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create new root product categories, add subcategories with parent hierarchy, manage product families, and configure technical variant matrices.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/admin/categories"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Manage Categories &amp; Catalog</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section Card: Fastener SKUs (Inventory) */}
          <div className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Boxes size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Fastener Catalog (SKUs)</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold font-mono">
                  {productsCount} SKUs
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add, edit, and update high-tensile bolt SKUs, property grades (4.6, 8.8, 10.9, SS 304), standards (DIN 933, 931, 912), dual pricing (PCS &amp; KGS), and warehouse stock.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/admin/products"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Open Fastener SKU Inventory</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section Card: Surplus Liquidation */}
          <div className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Zap size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Surplus Liquidation Lots</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                  {surplusCount} Lots
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage EPC project liquidation lots, post discounted clearance bulk packages with warehouse yard depot locations and discount percentages.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/admin/surplus"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Open Surplus Clearance Desk</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section Card: OEM Accounts */}
          <div className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Users size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">OEM Accounts &amp; Tiers</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold font-mono">
                  {usersCount} Accounts
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage enterprise buyer accounts, assign wholesale rebate tiers (BRONZE to VIP), verify 15-digit GSTINs, and set approved 30-day revolving credit limits.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/admin/users"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Open OEM Accounts Desk</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section Card: ERPNext Hub */}
          <div className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Database size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">ERPNext Integration Hub</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold font-mono">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Two-way automated synchronization between CBH web store and ERPNext back-office for live inventory balances, sales orders, price lists, and invoices.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/admin/erpnext"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Open ERPNext Control Hub</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section Card: Technical Blog */}
          <div className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <BookOpen size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Technical Metallurgy Blog</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold font-mono">
                  Knowledge Base
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Publish and edit engineering articles on fastener metallurgy, hydrogen embrittlement prevention, torque preload calculations, and ASTM specs.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/admin/blogs"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Manage Technical Articles</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section Card: Dynamic SEO & Schemas */}
          <div className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0052CC] flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">Dynamic SEO &amp; Schemas</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] text-xs font-bold font-mono">
                  &lt;head&gt; Injection
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configure on-page dynamic SEO per route, Schema.org FAQs, global metadata, sitemap.xml, robots.txt, and llms.txt context for AI search spiders.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/admin/seo"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#0052CC] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Open Dynamic SEO Console</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section Card: PhonePe Payment Gateway */}
          <div className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5f259f] flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">PhonePe Gateway</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#5f259f] text-xs font-bold font-mono">
                  UPI &amp; CARDS
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage PhonePe Merchant ID, SHA256 Salt Key, Sandbox/Production modes, live payment telemetry, and automated transaction verification.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href="/admin/payments"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#5f259f] text-[#0F172A] hover:text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Open Payments Console</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
