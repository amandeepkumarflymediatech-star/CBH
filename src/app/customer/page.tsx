'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  CreditCard,
  Users2,
  Eye,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Plus,
  Search,
  ChevronDown,
  X,
  Check,
  CheckSquare2,
  Square,
  Sparkles,
  Download,
  Building2,
  ShieldCheck,
  Truck,
  ArrowRight,
  Clock,
  Package,
  Layers,
  ArrowUpDown,
  Filter,
  Trash2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { CustomerOrder, BulkQuotation } from '@/lib/types';
import { INITIAL_ORDERS, INITIAL_QUOTES } from '@/lib/mock-data';
import { formatINR } from '@/lib/rfq-calculator';
import { getStoredUser, AuthUser } from '@/lib/auth';

interface VendorItem {
  id: string;
  name: string;
  domain: string;
  logoBg: string;
  logoColor: string;
  logoText: string;
  performance: number; // 0 - 100
  title: string;
  subtitle: string;
  category: string;
  lastChecked: string;
  status: 'Paid' | 'Failed' | 'Pending';
}

const INITIAL_VENDORS: VendorItem[] = [
  {
    id: 'v1',
    name: 'Blox',
    domain: 'getblox.com',
    logoBg: '#10B981',
    logoColor: '#FFFFFF',
    logoText: 'B',
    performance: 28,
    title: 'AI Content Creation App',
    subtitle: 'Makes magic with the power of AI/ML',
    category: 'Software & Tools',
    lastChecked: 'July 15, 2026',
    status: 'Paid',
  },
  {
    id: 'v2',
    name: 'Brotha Platforms',
    domain: 'brotha.gg',
    logoBg: '#EC4899',
    logoColor: '#FFFFFF',
    logoText: 'B',
    performance: 12,
    title: 'AI Billing And Invoicing App',
    subtitle: 'Makes invoice and billing with AIML',
    category: 'Billing & ERP',
    lastChecked: 'July 8, 2026',
    status: 'Failed',
  },
  {
    id: 'v3',
    name: 'Layerz Softwares',
    domain: 'layerz.io',
    logoBg: '#84CC16',
    logoColor: '#FFFFFF',
    logoText: 'L',
    performance: 71,
    title: 'Data Aggregation App',
    subtitle: 'Compile and manage data seamlessly',
    category: 'Analytics',
    lastChecked: 'July 1, 2026',
    status: 'Pending',
  },
  {
    id: 'v4',
    name: 'Linez Technologies',
    domain: 'linez.tech',
    logoBg: '#8B5CF6',
    logoColor: '#FFFFFF',
    logoText: 'L',
    performance: 20,
    title: 'Social Media App',
    subtitle: "The world's best social media app",
    category: 'Marketing',
    lastChecked: 'June 28, 2026',
    status: 'Paid',
  },
  {
    id: 'v5',
    name: 'Planet X',
    domain: 'planetx.gg',
    logoBg: '#3B82F6',
    logoColor: '#FFFFFF',
    logoText: 'P',
    performance: 30,
    title: 'Rocket Management App',
    subtitle: 'Manages your rocket easily',
    category: 'Operations',
    lastChecked: 'June 11, 2026',
    status: 'Paid',
  },
  {
    id: 'v6',
    name: 'Apex Infrastructure Procurement',
    domain: 'apexinfra.com',
    logoBg: '#5B4DF6',
    logoColor: '#FFFFFF',
    logoText: 'A',
    performance: 92,
    title: 'High Tensile 10.9 Fasteners',
    subtitle: 'NABL Certified IS-1367 DIN 933 dispatch batch',
    category: 'Fasteners & Hardware',
    lastChecked: 'May 30, 2026',
    status: 'Paid',
  },
  {
    id: 'v7',
    name: 'L&T Metro Construction Hub',
    domain: 'lntinfra.in',
    logoBg: '#F59E0B',
    logoColor: '#FFFFFF',
    logoText: 'L',
    performance: 86,
    title: 'SS-316 Marine Grade Studs',
    subtitle: 'ASTM A193 B8M Anchor Bolts & Washers',
    category: 'Fasteners & Hardware',
    lastChecked: 'May 18, 2026',
    status: 'Pending',
  },
];

export default function CustomerDashboardPage() {
  const [vendors, setVendors] = useState<VendorItem[]>(INITIAL_VENDORS);
  const [activeTab, setActiveTab] = useState<'Overview' | 'General' | 'List View' | 'Grid View' | 'Normal View'>('Normal View');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>(['v2', 'v3', 'v5']);
  const [sortField, setSortField] = useState<'name' | 'performance' | 'lastChecked'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Live dynamic order data & auth user
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [quotes, setQuotes] = useState<BulkQuotation[]>(INITIAL_QUOTES);
  const [liveProductsCount, setLiveProductsCount] = useState(48);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    const handleAuthChange = () => setCurrentUser(getStoredUser());
    window.addEventListener('cbh_auth_change', handleAuthChange);

    Promise.allSettled([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/rfq').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([ordRes, rfqRes, prodRes]) => {
      if (ordRes.status === 'fulfilled' && ordRes.value?.data) setOrders(ordRes.value.data);
      if (rfqRes.status === 'fulfilled' && rfqRes.value?.data) setQuotes(rfqRes.value.data);
      if (prodRes.status === 'fulfilled' && prodRes.value?.data) setLiveProductsCount(prodRes.value.data.length);
    });

    return () => window.removeEventListener('cbh_auth_change', handleAuthChange);
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + (o.netAmount || 0), 0);
  const totalWeightKg = orders.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0);
  const activeDispatches = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'DISPATCHED');
  const pendingQuotes = quotes.filter((q) => q.status === 'PENDING' || q.status === 'QUOTED');

  // New Vendor Form State
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('Software & Tools');
  const [newPerformance, setNewPerformance] = useState(45);
  const [newStatus, setNewStatus] = useState<'Paid' | 'Failed' | 'Pending'>('Paid');

  // Dynamic filter & sort
  const filteredVendors = useMemo(() => {
    let result = vendors.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortField === 'performance') {
        return sortDirection === 'asc' ? a.performance - b.performance : b.performance - a.performance;
      }
      return 0;
    });

    return result;
  }, [vendors, searchQuery, statusFilter, categoryFilter, sortField, sortDirection]);

  const toggleSort = (field: 'name' | 'performance' | 'lastChecked') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredVendors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVendors.map((v) => v.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
  };

  const handleExportCSV = () => {
    const headers = ['Company Name', 'Domain', 'Performance (%)', 'Title', 'Subtitle', 'Category', 'Last Checked', 'Status'];
    const rows = filteredVendors.map((v) => [
      `"${v.name}"`,
      v.domain,
      v.performance.toString(),
      `"${v.title}"`,
      `"${v.subtitle}"`,
      `"${v.category}"`,
      v.lastChecked,
      v.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_overview_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkSelectedAsPaid = () => {
    setVendors((prev) =>
      prev.map((v) => (selectedIds.includes(v.id) ? { ...v, status: 'Paid' } : v))
    );
  };

  const handleDeleteSelected = () => {
    setVendors((prev) => prev.filter((v) => !selectedIds.includes(v.id)));
    setSelectedIds([]);
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const colors = ['#10B981', '#EC4899', '#84CC16', '#8B5CF6', '#3B82F6', '#5B4DF6', '#F59E0B'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newVendor: VendorItem = {
      id: `v_${Date.now()}`,
      name: newCompanyName.trim(),
      domain: newDomain.trim() || `${newCompanyName.toLowerCase().replace(/\s+/g, '')}.com`,
      logoBg: randomColor,
      logoColor: '#FFFFFF',
      logoText: newCompanyName.trim().charAt(0).toUpperCase(),
      performance: Number(newPerformance) || 30,
      title: newTitle.trim() || 'Procurement Service',
      subtitle: newSubtitle.trim() || 'Managed vendor supply and logistics',
      category: newCategory,
      lastChecked: 'Today',
      status: newStatus,
    };

    setVendors([newVendor, ...vendors]);
    setIsAddModalOpen(false);

    // Reset Form
    setNewCompanyName('');
    setNewDomain('');
    setNewTitle('');
    setNewSubtitle('');
    setNewPerformance(45);
    setNewStatus('Paid');
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* ================================================================ */}
      {/* TOP HEADER: Title, Sub-Tabs, Export Pill & Profile Avatar        */}
      {/* ================================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Customer Overview
          </h1>

          {/* Subnav Tabs Matching Screenshot */}
          <div className="flex items-center gap-6 mt-3 border-b border-transparent">
            {(['Overview', 'General', 'List View', 'Grid View', 'Normal View'] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-semibold pb-2.5 transition-all relative cursor-pointer ${
                    active
                      ? 'text-[#0F172A] font-bold'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {tab}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B4DF6] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Right: Export Button & Profile Avatar */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#5B4DF6] hover:bg-[#4D3FF0] text-white text-xs font-bold rounded-full shadow-sm transition-all cursor-pointer active:scale-95"
            title="Export CSV Data"
          >
            <UploadCloud size={15} />
            <span>Export</span>
          </button>

          <Link
            href="/customer/profile"
            className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 shadow-xs cursor-pointer block hover:ring-2 hover:ring-[#5B4DF6] transition-all"
            title="View Profile"
          >
            <img
              src={
                currentUser?.avatar ||
                (typeof window !== 'undefined' ? localStorage.getItem('cbh_customer_avatar') : null) ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
          </Link>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 3 METRIC KPI CARDS (Matching Screenshot Row)                     */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Customers */}
        <div className="bg-white rounded-2xl p-6 border border-[#ECEEF3] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#5B4DF6] flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <button
              type="button"
              className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-md transition-colors"
              title="Options"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="text-xs font-semibold text-[#64748B]">Total Customers</div>
          <div className="flex items-baseline justify-between gap-2 mt-1.5">
            <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              21,877
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={13} />
              <span>18% vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Members (Highlighted active card in mockup) */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-sm hover:border-[#5B4DF6] transition-all relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#5B4DF6] flex items-center justify-center">
              <Users2 size={18} />
            </div>
            <button
              type="button"
              className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-md transition-colors"
              title="Options"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="text-xs font-semibold text-[#64748B]">Total Members</div>
          <div className="flex items-baseline justify-between gap-2 mt-1.5">
            <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              871
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
              <ArrowDownRight size={13} />
              <span>-88% vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Users with Avatar Stack */}
        <div className="bg-white rounded-2xl p-6 border border-[#ECEEF3] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#5B4DF6] flex items-center justify-center">
              <Eye size={18} />
            </div>
            <button
              type="button"
              className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-md transition-colors"
              title="Options"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="text-xs font-semibold text-[#64748B]">Active Users</div>
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              28
            </div>

            {/* Avatar Stack in Mockup */}
            <div className="flex items-center -space-x-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=faces"
                alt="User 1"
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=faces"
                alt="User 2"
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=faces"
                alt="User 3"
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=faces"
                alt="User 4"
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
              <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                +4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* DYNAMIC TAB VIEWS                                                */}
      {/* ================================================================ */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {/* Live Order Dispatch Pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase Orders</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] text-xs font-bold font-mono">
                  {orders.length} Active
                </span>
              </div>
              <div className="text-2xl font-black text-[#0F172A] font-mono">{formatINR(totalSpent)}</div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Direct dispatch from Ludhiana Works via TCI Express &amp; Safexpress. Total freight: {(totalWeightKg / 1000).toFixed(1)} MT.
              </p>
            </div>
            <Link
              href="/customer/orders"
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-[#5B4DF6] flex items-center justify-between no-underline"
            >
              <span>Track Live Purchase Orders</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Credit Facility Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credit Available</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold font-mono">
                  30 Days
                </span>
              </div>
              <div className="text-2xl font-black text-[#0F172A] font-mono">₹37,50,000</div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-gradient-to-r from-[#5B4DF6] to-emerald-500 h-full w-[25%]" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">
                Limit: ₹50.00L • Utilized: ₹12.50L (25%)
              </p>
            </div>
            <Link
              href="/customer/settings"
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-[#5B4DF6] flex items-center justify-between no-underline"
            >
              <span>Review Credit Facility</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Active RFQ Desk */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bulk RFQ Desk</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold font-mono">
                  {pendingQuotes.length} Pending
                </span>
              </div>
              <div className="text-2xl font-black text-[#0F172A] font-mono">{quotes.length} Quotes</div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Custom DIN / ISO fastener schedules, mill test certification, and container FOB pricing desk.
              </p>
            </div>
            <Link
              href="/customer/rfqs"
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-[#5B4DF6] flex items-center justify-between no-underline"
            >
              <span>View Bulk RFQ Inquiries</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'General' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Enterprise Account Information</h2>
              <p className="text-xs text-slate-500">Verified corporate entity credentials on CBH procurement matrix</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck size={14} /> GST Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Enterprise Entity</span>
              <div className="text-sm font-bold text-[#0F172A] mt-0.5">Apex Infrastructure Corp</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">GSTIN / Tax ID</span>
              <div className="text-sm font-bold text-[#0F172A] font-mono mt-0.5">07AAAAA0000A1Z5</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Commercial Tier</span>
              <div className="text-sm font-bold text-amber-700 mt-0.5">⭐ VIP Tier • 8% Rebate</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Account Manager</span>
              <div className="text-sm font-bold text-[#0F172A] mt-0.5">Harpreet Singh (Chief Operations)</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Primary Contact Email</span>
              <div className="text-sm font-bold text-[#0F172A] mt-0.5">procurement@apexinfra.com</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Registered Delivery Sites</span>
              <div className="text-sm font-bold text-[#0F172A] mt-0.5">3 Active Metro &amp; Highway Sites</div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* VENDOR ACTIVITY HISTORY CARD (TABLE SECTION)                     */}
      {/* ================================================================ */}
      {(activeTab === 'Normal View' || activeTab === 'List View' || activeTab === 'Grid View') && (
        <div className="bg-white rounded-2xl border border-[#ECEEF3] shadow-xs p-6 space-y-5">
          {/* Card Header: Title + Badge + Subtitle + Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Vendor Activity History
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EEF0FD] text-[#5B4DF6] text-[11px] font-extrabold font-mono">
                  {vendors.length} Total
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Here you can track your vendor&apos;s performance everyday.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                <span>Filter</span>
              </button>

              {/* Add Customer Button (Matching Purple Pill) */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#5B4DF6] hover:bg-[#4D3FF0] text-white text-xs font-bold rounded-full shadow-sm transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Customer</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
              {/* Search Input with Magnifier */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search Order"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#5B4DF6] transition-colors"
                />
                <Search
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>

              {/* Status Dropdown Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusDropdownOpen(!isStatusDropdownOpen);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>$ {statusFilter === 'All' ? 'Paid' : statusFilter}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-36 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-30">
                    {['All', 'Paid', 'Pending', 'Failed'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setStatusFilter(st);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${
                          statusFilter === st ? 'text-[#5B4DF6] font-bold bg-[#EEF0FD]' : 'text-slate-700'
                        }`}
                      >
                        <span>{st}</span>
                        {statusFilter === st && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Dropdown Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                    setIsStatusDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Users2 size={13} className="text-slate-400" />
                  <span>{categoryFilter === 'All' ? 'All Category' : categoryFilter}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-30">
                    {['All', 'Software & Tools', 'Billing & ERP', 'Analytics', 'Marketing', 'Operations', 'Fasteners & Hardware'].map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${
                            categoryFilter === cat ? 'text-[#5B4DF6] font-bold bg-[#EEF0FD]' : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                          {categoryFilter === cat && <Check size={12} />}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Clear All Filter Button */}
            {(searchQuery || statusFilter !== 'All' || categoryFilter !== 'All') && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0F172A] cursor-pointer"
              >
                <span>Clear All</span>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Batch Actions Toolbar when rows are selected */}
          {selectedIds.length > 0 && (
            <div className="bg-[#EEF0FD] border border-[#C7D2FE] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
              <span className="font-bold text-[#5B4DF6]">
                {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkSelectedAsPaid}
                  className="px-3 py-1 rounded-lg bg-white border border-[#C7D2FE] text-emerald-700 font-bold hover:bg-emerald-50 transition-colors"
                >
                  Mark as Paid
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-slate-500 hover:text-slate-700 font-semibold ml-2"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* VIEW: Grid View */}
          {activeTab === 'Grid View' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xs"
                        style={{ background: vendor.logoBg, color: vendor.logoColor }}
                      >
                        {vendor.logoText}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          vendor.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : vendor.status === 'Failed'
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-[#0F172A]">{vendor.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{vendor.domain}</div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-xs font-bold text-[#0F172A]">{vendor.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{vendor.subtitle}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{vendor.lastChecked}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5B4DF6]">{vendor.performance}%</span>
                      <div className="w-16 bg-[#EEF0FD] h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-[#5B4DF6] rounded-full" style={{ width: `${vendor.performance}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VIEW: Normal View & List View (Table) */
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[780px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 tracking-wider">
                    <th className="py-3 px-3 w-10">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="flex items-center justify-center text-slate-400 hover:text-[#5B4DF6]"
                      >
                        {selectedIds.length === filteredVendors.length && filteredVendors.length > 0 ? (
                          <CheckSquare2 size={16} className="text-[#5B4DF6]" />
                        ) : selectedIds.length > 0 ? (
                          <div className="w-4 h-4 rounded bg-[#5B4DF6] flex items-center justify-center text-white text-[10px] font-bold">
                            -
                          </div>
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('name')}
                        className="flex items-center gap-1 text-slate-600 font-bold hover:text-[#5B4DF6]"
                      >
                        <span>Company Name</span>
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('performance')}
                        className="flex items-center gap-1 text-slate-600 font-bold hover:text-[#5B4DF6]"
                      >
                        <span>Performance</span>
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Last Checked</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 w-10 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No vendor activity matching &quot;{searchQuery}&quot; found.
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((vendor) => {
                      const isSelected = selectedIds.includes(vendor.id);
                      return (
                        <tr
                          key={vendor.id}
                          className={`hover:bg-[#F9FAFD] transition-colors ${
                            isSelected ? 'bg-[#F5F6FF]/40' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3">
                            <button
                              type="button"
                              onClick={() => toggleSelectRow(vendor.id)}
                              className="flex items-center justify-center text-slate-300 hover:text-[#5B4DF6]"
                            >
                              {isSelected ? (
                                <CheckSquare2 size={16} className="text-[#5B4DF6]" />
                              ) : (
                                <Square size={16} />
                              )}
                            </button>
                          </td>

                          {/* Company Name & Squircle Logo */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs"
                                style={{
                                  background: vendor.logoBg,
                                  color: vendor.logoColor,
                                }}
                              >
                                {vendor.logoText}
                              </div>
                              <div className="leading-tight">
                                <div className="font-bold text-[#0F172A]">{vendor.name}</div>
                                <div className="text-[11px] text-slate-400 font-medium">
                                  {vendor.domain}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Performance Bar (Purple with %) */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5 w-36">
                              <div className="flex-1 bg-[#EEF0FD] h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#5B4DF6] rounded-full transition-all duration-300"
                                  style={{ width: `${vendor.performance}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-600 font-mono w-8 text-right">
                                {vendor.performance}%
                              </span>
                            </div>
                          </td>

                          {/* Description: Bold title + muted subtitle */}
                          <td className="py-3.5 px-3 max-w-xs">
                            <div className="leading-tight">
                              <div className="font-bold text-[#0F172A]">{vendor.title}</div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {vendor.subtitle}
                              </div>
                            </div>
                          </td>

                          {/* Last Checked Date */}
                          <td className="py-3.5 px-3 text-slate-500 font-medium whitespace-nowrap">
                            {vendor.lastChecked}
                          </td>

                          {/* Status Pill Badge (Paid, Failed, Pending) */}
                          <td className="py-3.5 px-3">
                            {vendor.status === 'Paid' && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                Paid
                              </span>
                            )}
                            {vendor.status === 'Failed' && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                Failed
                              </span>
                            )}
                            {vendor.status === 'Pending' && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                              title="Actions"
                            >
                              <MoreVertical size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: ADD CUSTOMER / VENDOR                                     */}
      {/* ================================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] text-[#5B4DF6] flex items-center justify-center font-bold">
                  +
                </div>
                <h3 className="font-bold text-base text-[#0F172A]">Add New Vendor / Customer</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Fasteners"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Website Domain</label>
                <input
                  type="text"
                  placeholder="e.g. apexfasteners.in"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service / Fastener Description</label>
                <input
                  type="text"
                  placeholder="e.g. High Tensile Grade 10.9 Bolts"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Specification</label>
                <input
                  type="text"
                  placeholder="e.g. NABL Tested DIN 933 dispatch batch"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  >
                    <option value="Software & Tools">Software &amp; Tools</option>
                    <option value="Billing & ERP">Billing &amp; ERP</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Fasteners & Hardware">Fasteners &amp; Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Performance Rating</span>
                  <span className="font-mono text-[#5B4DF6]">{newPerformance}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={newPerformance}
                  onChange={(e) => setNewPerformance(Number(e.target.value))}
                  className="w-full accent-[#5B4DF6]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5B4DF6] hover:bg-[#4D3FF0] text-white shadow-sm transition-all"
                >
                  Add to Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
