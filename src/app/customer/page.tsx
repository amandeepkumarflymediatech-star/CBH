'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Boxes,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpDown,
  Filter,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  Truck,
  ShieldCheck,
  FileCheck2,
  FileText,
  QrCode,
  Printer,
  X,
  Plus,
  Building2,
  Award,
  Calendar,
  Folder,
  Download,
  Search,
  Check,
  LayoutDashboard,
  Users,
  User,
  Mail,
  Phone,
  Layers,
  FileSpreadsheet,
  Zap,
  BarChart2,
  PieChart
} from 'lucide-react';
import { CustomerOrder, BulkQuotation } from '@/lib/types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_QUOTES } from '@/lib/mock-data';
import { formatINR } from '@/lib/rfq-calculator';
import { getStoredUser, AuthUser } from '@/lib/auth';
import { showErrorAlert, showInfoAlert, showLoadingAlert } from '@/lib/swal';

export type CustomerDashboardTab =
  | 'Overview'
  | 'Orders & Consignments'
  | 'Bulk RFQs'
  | 'NABL 3.1 Vault'
  | 'Invoices & Credit'
  | 'Project Sites'
  | 'Procurement Team'
  | 'Enterprise Profile';

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  badge: string;
  badgeType: 'blue' | 'red' | 'purple' | 'gray';
  iconType: 'order' | 'alert' | 'promo' | 'system';
}

interface TopProductItem {
  id: string;
  name: string;
  category: string;
  standard: string;
  stocks: number;
  price: number;
  sales: number;
  earnings: number;
  iconBg: string;
  iconColor: string;
  iconLetter: string;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Customer Related Tabs
  const [activeTab, setActiveTab] = useState<CustomerDashboardTab>('Overview');

  // Chart & Table Filter States
  const [revenueTimeframe, setRevenueTimeframe] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>('Apr');
  const [sortField, setSortField] = useState<'earnings' | 'sales' | 'stocks' | 'price'>('earnings');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Order status sub-filter for Consignments tab
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'IN_TRANSIT' | 'PROCESSING' | 'DELIVERED'>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderCarrierFilter, setOrderCarrierFilter] = useState('ALL');
  const [orderSortBy, setOrderSortBy] = useState('date_desc');

  // Live telemetry counts (dynamic, zero by default)
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [quotes, setQuotes] = useState<BulkQuotation[]>([]);
  const [totalProductsProcured, setTotalProductsProcured] = useState(0);
  const [totalConsignments, setTotalConsignments] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [creditAvailable, setCreditAvailable] = useState(0);
  const [isToppingUpCredit, setIsToppingUpCredit] = useState(false);
  const [activeMtcModal, setActiveMtcModal] = useState<CustomerOrder | null>(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    if (user?.creditLimit) {
      setCreditAvailable(user.creditLimit);
    }
    const handleAuthChange = () => {
      const u = getStoredUser();
      setCurrentUser(u);
      if (u?.creditLimit) setCreditAvailable(u.creditLimit);
    };
    window.addEventListener('cbh_auth_change', handleAuthChange);

    Promise.allSettled([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/rfq').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([ordRes, rfqRes, prodRes]) => {
      if (ordRes.status === 'fulfilled' && ordRes.value?.data) {
        const ordList = Array.isArray(ordRes.value.data) ? ordRes.value.data : [];
        setOrders(ordList);
        const sum = ordList.reduce((acc: number, o: any) => acc + (o.netAmount || 0), 0);
        setTotalSpend(sum);
        setTotalConsignments(ordList.filter((o: any) => o.status === 'IN_TRANSIT').length);
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

    return () => window.removeEventListener('cbh_auth_change', handleAuthChange);
  }, []);

  const clientName = currentUser?.fullName || 'Enterprise Buyer';
  const clientCompany = currentUser?.companyName || 'Enterprise Partner Ltd.';
  const clientGstin = currentUser?.gstin || 'Not Registered';

  // Delivery Yards data (dynamic, empty by default)
  const [deliverySites, setDeliverySites] = useState<any[]>([]);

  // Dynamic Team Members list (from session user or empty by default)
  const teamMembers = useMemo(() => {
    if (currentUser?.fullName) {
      return [
        {
          name: currentUser.fullName,
          role: 'Primary Account Officer',
          access: 'Admin (Full PO & Credit Sign-off)',
          email: currentUser.email || 'officer@client.com',
          phone: currentUser.phone || '+91 Contact on File',
          limit: 'Up to Sanctioned Credit',
          status: 'Active',
          avatar: '',
        },
      ];
    }
    return [];
  }, [currentUser]);

  // Customer Related Tabs Definitions with Badges & Icons
  const customerTabs: {
    id: CustomerDashboardTab;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
    badgeColor?: string;
    param: string;
  }[] = [
    {
      id: 'Overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      param: 'overview',
    },
    {
      id: 'Orders & Consignments',
      label: 'Orders & Consignments',
      icon: Truck,
      badge: `${orders.length} Active`,
      badgeColor: 'bg-blue-100 text-[#0052CC]',
      param: 'orders',
    },
    {
      id: 'Bulk RFQs',
      label: 'Bulk RFQs & Tenders',
      icon: Zap,
      badge: `${quotes.length} Quotes`,
      badgeColor: 'bg-amber-100 text-amber-800',
      param: 'rfqs',
    },
    {
      id: 'NABL 3.1 Vault',
      label: 'NABL 3.1 Vault',
      icon: Award,
      badge: 'ISO 9001',
      badgeColor: 'bg-purple-100 text-purple-700',
      param: 'certificates',
    },
    {
      id: 'Invoices & Credit',
      label: 'Invoices & Credit',
      icon: CreditCard,
      badge: creditAvailable > 0 ? `${(creditAvailable / 100000).toFixed(1)}L Line` : 'Credit Line',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      param: 'invoices',
    },
    {
      id: 'Project Sites',
      label: 'Delivery Yards',
      icon: Building2,
      badge: `${deliverySites.length} ${deliverySites.length === 1 ? 'Site' : 'Sites'}`,
      badgeColor: 'bg-slate-100 text-slate-700',
      param: 'sites',
    },
    {
      id: 'Procurement Team',
      label: 'Procurement Team',
      icon: Users,
      badge: `${teamMembers.length} ${teamMembers.length === 1 ? 'Officer' : 'Officers'}`,
      badgeColor: 'bg-indigo-100 text-indigo-700',
      param: 'team',
    },
    {
      id: 'Enterprise Profile',
      label: 'Enterprise Profile',
      icon: User,
      badge: currentUser?.tier ? `Tier ${currentUser.tier}` : 'Standard Account',
      badgeColor: 'bg-amber-100 text-amber-800',
      param: 'profile',
    },
  ];

  // Sync tab with URL search parameter (?tab=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        const found = customerTabs.find((t) => t.param.toLowerCase() === tabParam.toLowerCase());
        if (found) {
          setActiveTab(found.id);
        }
      }
    }
  }, []);

  const handleTabChange = (tabId: CustomerDashboardTab) => {
    setActiveTab(tabId);
    const tabObj = customerTabs.find((t) => t.id === tabId);
    if (typeof window !== 'undefined' && tabObj) {
      const url = new URL(window.location.href);
      if (tabObj.param === 'overview') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tabObj.param);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Top Procured Fasteners list (empty by default, loaded from real procured items)
  const [productsList, setProductsList] = useState<TopProductItem[]>([]);

  // Dynamic Recent Activity generated from live orders & RFQs
  const activities: ActivityItem[] = useMemo(() => {
    const list: ActivityItem[] = [];
    orders.forEach((ord) => {
      list.push({
        id: `act-ord-${ord.id}`,
        title: `Consignment #${ord.orderNumber} ${ord.status === 'IN_TRANSIT' ? 'Dispatched' : ord.status}`,
        subtitle: `${ord.carrier || 'Express Logistics'} • Docket #${ord.trackingNumber || 'Pending'}`,
        date: ord.date || 'Recent',
        badge: ord.status === 'IN_TRANSIT' ? 'In Transit' : ord.status === 'DELIVERED' ? 'Delivered' : 'Processing',
        badgeType: ord.status === 'IN_TRANSIT' ? 'blue' : ord.status === 'DELIVERED' ? 'purple' : 'gray',
        iconType: 'order',
      });
    });
    quotes.forEach((q) => {
      list.push({
        id: `act-rfq-${q.id}`,
        title: `Bulk RFQ #${q.rfqNumber} ${q.status}`,
        subtitle: `${q.itemsCount || 0} Fastener Lines • ${formatINR(q.netTotal || 0)}`,
        date: q.date || 'Recent',
        badge: q.status,
        badgeType: q.status === 'APPROVED' ? 'blue' : 'purple',
        iconType: 'promo',
      });
    });
    return list;
  }, [orders, quotes]);

  // Dynamic Monthly Spend Bars derived from real orders
  const barData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    return months.map((m) => {
      const matchOrders = orders.filter((o) => {
        if (!o.date) return false;
        const d = new Date(o.date);
        return d.toLocaleString('en-US', { month: 'short' }) === m;
      });
      const orderSpend = matchOrders.reduce((sum, o) => sum + (o.netAmount || 0), 0);
      return {
        month: m,
        oneTime: Math.round(orderSpend / 1000),
        recurring: 0,
        total: Math.round(orderSpend / 1000),
        active: m === selectedMonth,
      };
    });
  }, [orders, selectedMonth]);

  const handleSort = () => {
    const nextOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(nextOrder);
    const sorted = [...productsList].sort((a, b) => {
      if (nextOrder === 'desc') return b[sortField] - a[sortField];
      return a[sortField] - b[sortField];
    });
    setProductsList(sorted);
  };

  const handlePayOrder = async (orderId: string, amount: number) => {
    try {
      const res = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          orderId,
          customerName: currentUser?.fullName || clientName,
          customerPhone: currentUser?.phone || '9888021000',
          customerEmail: currentUser?.email || 'orders@cbh.store',
          companyName: currentUser?.companyName || clientCompany,
        }),
      });

      const data = await res.json();
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        showErrorAlert('Payment Initiation Failed', data.error || 'Failed to initiate PhonePe payment session. Please check credentials in Admin Panel.');
      }
    } catch (err: any) {
      showErrorAlert('Gateway Connection Error', err.message || 'Error connecting to PhonePe Gateway');
    }
  };

  // Distinct carriers for Consignments filter
  const availableCarriers = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.carrier && o.carrier.trim()) set.add(o.carrier.trim());
    });
    return Array.from(set).sort();
  }, [orders]);

  // Filtered orders for Consignments Tab
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (orderStatusFilter !== 'ALL') {
      list = list.filter((o) => o.status === orderStatusFilter);
    }
    if (orderCarrierFilter !== 'ALL') {
      list = list.filter((o) => o.carrier?.toLowerCase() === orderCarrierFilter.toLowerCase());
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.carrier?.toLowerCase().includes(q) ||
          o.shippingAddress?.toLowerCase().includes(q) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (orderSortBy === 'date_desc') {
        return (
          new Date(b.date || b.dispatchDate || 0).getTime() -
          new Date(a.date || a.dispatchDate || 0).getTime()
        );
      }
      if (orderSortBy === 'date_asc') {
        return (
          new Date(a.date || a.dispatchDate || 0).getTime() -
          new Date(b.date || b.dispatchDate || 0).getTime()
        );
      }
      if (orderSortBy === 'amount_desc') {
        return (b.netAmount || 0) - (a.netAmount || 0);
      }
      if (orderSortBy === 'amount_asc') {
        return (a.netAmount || 0) - (b.netAmount || 0);
      }
      return 0;
    });
    return list;
  }, [orders, orderStatusFilter, orderCarrierFilter, orderSearchQuery, orderSortBy]);

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* TOP HEADER BAR: TITLE, CUSTOMER-RELATED TABS & QUICK ACTIONS    */}
      {/* ================================================================ */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Top Info Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase text-[#5B4DF6]">
              <span>ENTERPRISE CLIENT PORTAL</span>
              <span>•</span>
              <span className="text-slate-400">GST: {clientGstin}</span>
              <span>•</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                VERIFIED OEM
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
              {clientCompany}
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/bulk-order"
              className="px-3.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors no-underline shadow-xs"
            >
              <Plus size={14} />
              <span>New Bulk RFQ</span>
            </Link>

          
          </div>
        </div>

        {/* ================================================================ */}
        {/* CUSTOMER-RELATED TABS BAR (Horizontal Navigation)               */}
        {/* ================================================================ */}
       
      </div>

      {/* ================================================================ */}
      {/* TAB 1: OVERVIEW (EXACT ADMIN LAYOUT)                             */}
      {/* ================================================================ */}
      {activeTab === 'Overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* ROW 1: 4 METRIC KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Fasteners Procured */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-semibold text-slate-500">Total Fasteners</div>
                <div className="text-2xl font-black text-[#0F172A] tracking-tight mt-1">
                  {totalProductsProcured.toLocaleString()} PCS
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {(orders.reduce((acc, o) => acc + (o.totalWeightKg || 0), 0) / 1000).toFixed(2)} Metric Tonnes
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#EEF0FD] text-[#5B4DF6] flex items-center justify-center shrink-0">
                <Boxes size={22} />
              </div>
            </div>

            {/* Card 2: Active Consignments */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-semibold text-slate-500">Active Consignments</div>
                <div className="text-2xl font-black text-[#0F172A] tracking-tight mt-1">
                  {totalConsignments} In Transit
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  {totalConsignments > 0 ? 'Live GPS Tracking Active' : 'No Active Dispatches'}
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                <Truck size={22} />
              </div>
            </div>

            {/* Card 3: Total Spend (YTD) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-semibold text-slate-500">Total Spend (YTD)</div>
                <div className="text-2xl font-black text-[#0F172A] tracking-tight mt-1 font-mono">
                  {formatINR(totalSpend)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {totalSpend > 0 ? '18% GST Input Credit' : 'No Invoices Generated'}
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                <ArrowDownLeft size={22} />
              </div>
            </div>

            {/* Card 4: Revolving Credit Facility */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-semibold text-slate-500">Available Credit</div>
                <div className="text-2xl font-black text-[#0F172A] tracking-tight mt-1 font-mono">
                  {formatINR(creditAvailable)}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Net 30-Day Revolving</div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
                <ArrowUpRight size={22} />
              </div>
            </div>
          </div>

          {/* ROW 2: SPEND REVENUE BAR CHART & TOP CATEGORIES DONUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Spend Analytics Bar Chart (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
                <div>
                  <h2 className="text-base font-extrabold text-[#0F172A]">Procurement &amp; Spend Analytics</h2>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#93C5FD]" />
                      <span>Direct Purchase Orders</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                      <span>Bulk RFQ Settlements</span>
                    </div>
                  </div>
                </div>

                <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-500">
                  {(['Monthly', 'Quarterly', 'Yearly'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setRevenueTimeframe(tab)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        revenueTimeframe === tab
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Chart Canvas */}
              <div className="relative pt-6 pb-2 min-h-[256px] flex flex-col justify-end">
                {totalSpend === 0 ? (
                  <div className="my-auto py-12 text-center text-slate-400 space-y-2">
                    <BarChart2 size={36} className="mx-auto text-slate-300 stroke-1" />
                    <p className="text-xs font-semibold text-slate-600">No procurement spend recorded yet</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Place orders or submit Bulk RFQ contracts to track monthly spend and consignment dispatches.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] font-semibold text-slate-400 select-none">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span>₹150K</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span>₹130K</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span>₹100K</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span>₹50K</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span>₹10K</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span>0</span>
                      </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-8 gap-3 sm:gap-6 items-end h-64 pl-12 pr-2">
                      {barData.map((item) => {
                        const isSelected = selectedMonth === item.month;
                        const maxVal = Math.max(150, ...barData.map((b) => b.total || 0));
                        return (
                          <div
                            key={item.month}
                            onClick={() => setSelectedMonth(item.month)}
                            className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                          >
                            {isSelected && item.total > 0 && (
                              <div className="absolute -top-12 z-30 bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-xl whitespace-nowrap text-left animate-in fade-in slide-in-from-bottom-2 duration-150">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#93C5FD]" />
                                  <span>Spend:</span>
                                </div>
                                <div className="text-xs font-extrabold text-[#0F172A] ml-3 mb-1">
                                  ₹{(item.total * 1000).toLocaleString()}
                                </div>
                              </div>
                            )}

                            <div
                              className={`w-full max-w-[42px] rounded-t-xl overflow-hidden flex flex-col justify-end transition-all ${
                                isSelected
                                  ? 'ring-2 ring-[#4F46E5] ring-offset-2 shadow-md'
                                  : 'group-hover:opacity-90'
                              }`}
                              style={{ height: `${item.total > 0 ? (item.total / maxVal) * 100 : 4}%` }}
                            >
                              <div
                                className="w-full bg-[#4F46E5] transition-colors"
                                style={{ height: '100%' }}
                              />
                            </div>

                            <span className="text-xs font-bold text-slate-500 mt-3 group-hover:text-slate-900">
                              {item.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Top Categories Donut (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4">
                <h2 className="text-base font-extrabold text-[#0F172A]">Top Categories</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('Orders & Consignments')}
                  className="text-xs font-bold text-slate-500 hover:text-[#5B4DF6] cursor-pointer"
                >
                  See All
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-2 text-slate-400">
                  <PieChart size={36} className="mx-auto text-slate-300 stroke-1" />
                  <p className="text-xs font-semibold text-slate-600">No category volume breakdown</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Procured fasteners will automatically categorize by DIN/ISO standards here once orders are placed.
                  </p>
                </div>
              ) : (
                <>
                  {/* SVG Donut Chart */}
                  <div className="relative flex items-center justify-center py-4">
                    <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#3B82F6"
                        strokeWidth="11"
                        strokeDasharray="238.7 238.7"
                        strokeDashoffset="0"
                      />
                    </svg>

                    <div className="absolute text-center flex flex-col items-center pointer-events-none">
                      <span className="text-[11px] font-semibold text-slate-400">Total Volume</span>
                      <span className="text-xl font-black text-[#0F172A] tracking-tight mt-0.5">
                        {totalProductsProcured.toLocaleString()} PCS
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs font-semibold text-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                        <span className="text-[#0F172A]">Standard Fasteners</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-normal">{formatINR(totalSpend)}</span>
                        <span className="font-extrabold text-[#0F172A]">100%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ROW 3: RECENT ACTIVITY & TOP PRODUCTS TABLE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Recent Activity (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <span>Recent Activity</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('Orders & Consignments')}
                  className="text-xs font-bold text-slate-500 hover:text-[#5B4DF6] cursor-pointer"
                >
                  See All
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="my-auto py-12 text-center text-slate-400 space-y-2">
                  <Clock size={32} className="mx-auto text-slate-300 stroke-1" />
                  <p className="text-xs font-semibold text-slate-600">No recent operations activity</p>
                  <p className="text-[11px] text-slate-400">
                    Live updates on orders, consignments, and RFQs will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {activities.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            item.iconType === 'order'
                              ? 'bg-[#EEF0FD] text-[#5B4DF6]'
                              : item.iconType === 'alert'
                              ? 'bg-[#FFF1F2] text-[#E11D48]'
                              : item.iconType === 'promo'
                              ? 'bg-[#F3E8FF] text-[#9333EA]'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.iconType === 'order' && <Package size={16} />}
                          {item.iconType === 'alert' && <AlertCircle size={16} />}
                          {item.iconType === 'promo' && <Tag size={16} />}
                          {item.iconType === 'system' && <FileCheck2 size={16} />}
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#5B4DF6] transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                          item.badgeType === 'blue'
                            ? 'bg-[#EEF0FD] text-[#5B4DF6]'
                            : item.badgeType === 'red'
                            ? 'bg-[#FFF1F2] text-[#E11D48]'
                            : item.badgeType === 'purple'
                            ? 'bg-[#F3E8FF] text-[#9333EA]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('Orders & Consignments')}
                  className="text-xs font-bold text-[#5B4DF6] hover:underline cursor-pointer"
                >
                  View Complete Operations Log &rarr;
                </button>
              </div>
            </div>

            {/* Right: Top Products Table (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Boxes size={16} className="text-slate-400" />
                  <span>Top Procured Fasteners</span>
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSort}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <ArrowUpDown size={13} className="text-slate-400" />
                    <span>Sort</span>
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Filter size={13} className="text-slate-400" />
                      <span>Filter</span>
                    </button>

                    {isFilterDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30 animate-in fade-in">
                        {['All', 'DIN 933', 'DIN 934', 'DIN 125', 'ISO 4014'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setCategoryFilter(cat);
                              setIsFilterDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {productsList.length === 0 ? (
                <div className="my-auto py-14 text-center text-slate-400 space-y-2">
                  <Boxes size={32} className="mx-auto text-slate-300 stroke-1" />
                  <p className="text-xs font-semibold text-slate-600">No procured fasteners on record</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Your highest volume purchased SKUs, stock levels, and procurement value will be ranked here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 pl-1">Product Name</th>
                        <th className="py-2.5">Stocks</th>
                        <th className="py-2.5">Price</th>
                        <th className="py-2.5">Total Qty</th>
                        <th className="py-2.5 pr-1 text-right">Spend Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {productsList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-3 pl-1">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                                style={{ background: item.iconBg, color: item.iconColor }}
                              >
                                {item.iconLetter}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#0F172A] truncate group-hover:text-[#5B4DF6] transition-colors">
                                  {item.name}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">{item.standard}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 text-slate-500 font-mono">
                            {item.stocks.toLocaleString()} pcs
                          </td>

                          <td className="py-3 text-slate-700 font-mono font-bold">
                            ₹{item.price.toFixed(2)}
                          </td>

                          <td className="py-3 text-slate-500 font-mono">
                            {item.sales.toLocaleString()} pcs
                          </td>

                          <td className="py-3 pr-1 text-right font-mono font-extrabold text-[#0F172A]">
                            ₹{item.earnings.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {productsList.length > 0 ? `Showing top ${productsList.length} procured fasteners` : 'Zero procured fasteners'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('Orders & Consignments')}
                  className="font-bold text-[#5B4DF6] hover:underline cursor-pointer"
                >
                  View Full Order History &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: ORDERS & CONSIGNMENTS                                     */}
      {/* ================================================================ */}
      {activeTab === 'Orders & Consignments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">Purchase Orders &amp; Mill Consignments</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time freight logistics, LR docket tracking, and NABL EN 10204 3.1 Mill Test Certificates
              </p>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'IN_TRANSIT', label: 'In Transit' },
                { id: 'PROCESSING', label: 'Under Fabrication' },
                { id: 'DELIVERED', label: 'Delivered' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOrderStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    orderStatusFilter === tab.id
                      ? 'bg-white text-[#0F172A] shadow-xs font-extrabold'
                      : 'hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar & Quick Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by PO #, Transporter, Docket #, or Yard location..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#5B4DF6]"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              {orderSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOrderSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {availableCarriers.length > 0 && (
                <select
                  value={orderCarrierFilter}
                  onChange={(e) => setOrderCarrierFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#5B4DF6] cursor-pointer"
                >
                  <option value="ALL">All Transporters</option>
                  {availableCarriers.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={orderSortBy}
                onChange={(e) => setOrderSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#5B4DF6] cursor-pointer"
              >
                <option value="date_desc">Date: Newest First</option>
                <option value="date_asc">Date: Oldest First</option>
                <option value="amount_desc">Amount: High to Low</option>
                <option value="amount_asc">Amount: Low to High</option>
              </select>

              {(orderSearchQuery || orderStatusFilter !== 'ALL' || orderCarrierFilter !== 'ALL' || orderSortBy !== 'date_desc') && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderSearchQuery('');
                    setOrderStatusFilter('ALL');
                    setOrderCarrierFilter('ALL');
                    setOrderSortBy('date_desc');
                  }}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No matching purchase orders found.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isInTransit = order.status === 'IN_TRANSIT';
                const isDelivered = order.status === 'DELIVERED';
                const isProcessing = order.status === 'PROCESSING';

                return (
                  <div key={order.id} className="py-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono font-black text-sm text-[#5B4DF6] bg-[#EEF0FD] px-3 py-1 rounded-lg">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Date: {order.date}</span>
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

                    {/* Consignment Specs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Fastener Specifications</span>
                        <span className="font-bold text-[#0F172A] line-clamp-1 mt-0.5">
                          High Tensile DIN 933 8.8 Hex Bolts &amp; DIN 934 Nuts
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                          Heat #CBH-HT-882 • ISO 898-1 Certified
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Carrier &amp; LR Docket</span>
                        <span className="font-bold text-[#0F172A] mt-0.5 block">{order.carrier}</span>
                        <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                          Docket: {order.trackingNumber || 'PENDING DISPATCH'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Factory Delivery Address</span>
                        <span className="text-slate-700 line-clamp-2 mt-0.5">{order.shippingAddress}</span>
                      </div>
                    </div>

                    {/* Visual 5-Stage Stepper */}
                    <div className="pt-1">
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
                                  ? 'bg-[#5B4DF6] animate-pulse'
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

                    {/* Actions */}
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
                          <FileCheck2 size={13} className="text-[#5B4DF6]" />
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
                          onClick={() => handlePayOrder(order.orderNumber, order.netAmount)}
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
      )}

      {/* ================================================================ */}
      {/* TAB 3: BULK RFQS & TENDERS                                       */}
      {/* ================================================================ */}
      {activeTab === 'Bulk RFQs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">Active Bulk RFQ Inquiries &amp; Tenders</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-line metric matrix with real-time volume tier discounting (up to 25% on ₹1,00,000+ purchase)
              </p>
            </div>

            <Link
              href="/bulk-order"
              className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors no-underline shadow-xs"
            >
              <Plus size={14} />
              <span>Create New RFQ Matrix</span>
            </Link>
          </div>

          {quotes.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <FileSpreadsheet size={36} className="mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">No active Bulk RFQ inquiries</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Submit a custom bill of quantities or project matrix to get volume tier rebates (up to 25% discount).
              </p>
              <Link
                href="/bulk-order"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B4DF6] hover:bg-[#4a3cf0] text-white text-xs font-bold shadow-xs no-underline transition-colors"
              >
                <Plus size={14} />
                <span>Create New RFQ Matrix</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#5B4DF6] bg-[#EEF0FD] px-2.5 py-1 rounded">
                        {quote.rfqNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold font-mono">
                        {quote.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="text-sm font-bold text-[#0F172A]">
                        Commercial Fastener Schedule ({quote.itemsCount} SKUs)
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
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
                      <span className="text-xs text-slate-400 font-mono">
                        Valid till: {quote.validUntil}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handlePayOrder(quote.rfqNumber, quote.netTotal)}
                      className="flex-1 py-2 bg-[#5f259f] hover:bg-[#4a1c7d] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <QrCode size={13} />
                      <span>Accept &amp; Pay via PhonePe</span>
                    </button>

                    <Link
                      href="/customer/rfqs"
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center no-underline"
                    >
                      <span>View Proforma</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 4: NABL 3.1 VAULT                                            */}
      {/* ================================================================ */}
      {activeTab === 'NABL 3.1 Vault' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">EN 10204 3.1 NABL Inspection Certificate Vault</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct mill metallurgical calibration test reports with chemical composition and tensile proof load analysis
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck size={14} /> ISO 9001:2015 Accredited
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShieldCheck size={36} className="mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">No calibration certificates in vault</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                EN 10204 3.1 Mill Test Certificates are generated upon dispatch of your orders and permanently archived here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-xs text-[#0052CC] bg-blue-50 px-2.5 py-1 rounded">
                        {order.mtcCertNumber}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        NABL 17025 VERIFIED
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#0F172A] mt-2">
                      Heat Treatment Batch #HT-2026-LUD-882
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Order: {order.orderNumber} • {order.carrier} (Docket #{order.trackingNumber})
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px] p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Carbon (C)</span>
                      <strong className="text-[#0F172A]">0.34 %</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tensile (Rm)</span>
                      <strong className="text-[#0F172A]">840 N/mm²</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Hardness</span>
                      <strong className="text-emerald-700">28.5 HRC</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveMtcModal(order)}
                    className="w-full py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileCheck2 size={14} />
                    <span>Inspect Full Calibration Certificate</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 5: INVOICES & CREDIT                                         */}
      {/* ================================================================ */}
      {activeTab === 'Invoices & Credit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">Credit Facility &amp; Tax Invoices</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                30-Day revolving enterprise credit line with automated HSN 7318 electronic invoicing
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0052CC] text-xs font-mono font-bold border border-blue-200">
              REVOLVING NET-30
            </span>
          </div>

          {/* Credit Facility Progress Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-mono uppercase">Revolving Credit Limit</span>
                <div className="text-3xl font-black font-mono tracking-tight text-white mt-1">
                  ₹50,00,000.00
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 font-mono">Available Credit</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {formatINR(creditAvailable)}
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#5B4DF6] to-emerald-400 h-full transition-all"
                style={{ width: `${Math.min(100, Math.round((totalSpend / 5000000) * 100))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>Utilized: {formatINR(totalSpend)} ({Math.min(100, Math.round((totalSpend / 5000000) * 100))}%)</span>
              <span>Payment Cycle: Net 30 Days from LR</span>
            </div>
          </div>

          {/* Invoices List */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-sm text-[#0F172A]">Recent Tax Invoices (HSN 7318)</h3>
            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2 border border-slate-200 rounded-2xl">
                <FileText size={32} className="mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">No GST tax invoices issued yet</p>
                <p className="text-[11px] text-slate-400">
                  Electronic tax invoices compliant with HSN 7318 will appear here when orders are confirmed.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#0F172A] font-mono">
                          Invoice #{order.orderNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Date: {order.date} • {order.totalWeightKg.toFixed(1)} KG Net
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-black text-[#0F172A] font-mono block">
                          {formatINR(order.netAmount)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">Paid via Gateway</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveInvoiceModal(order)}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        View Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 6: PROJECT SITES & DELIVERY YARDS                            */}
      {/* ================================================================ */}
      {activeTab === 'Project Sites' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">Customer Project Sites &amp; Delivery Yards</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized unloading bays with weighbridge calibration slips and direct site supervisor contacts
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {deliverySites.length} Registered {deliverySites.length === 1 ? 'Site' : 'Sites'}
            </span>
          </div>

          {deliverySites.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Building2 size={36} className="mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">No delivery sites registered</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Register project delivery yards and weighbridges to streamline multi-point consignments and LR docket tracking.
              </p>
              <button
                type="button"
                onClick={() => showInfoAlert('Project Site Registration', 'To register a new delivery yard, warehouse coordinate, or weighbridge, please contact your dedicated relationship manager or update your account coordinates.')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold shadow-xs hover:bg-slate-800 cursor-pointer"
              >
                <Plus size={14} />
                <span>Register Project Site</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {deliverySites.map((site) => (
                <div
                  key={site.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                        <Building2 size={16} />
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] text-[10px] font-extrabold font-mono">
                        {site.activeOrders} Active Order
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-[#0F172A] mt-3">{site.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{site.address}</p>

                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-400">Supervisor:</span>
                        <span className="font-bold text-[#0F172A]">{site.supervisor}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-mono font-bold text-[#0052CC]">{site.phone}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-400">Weighbridge:</span>
                        <span className="text-[11px] font-bold text-emerald-700">{site.weighbridgeStatus}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${site.phone}`}
                    className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs text-center no-underline transition-colors block"
                  >
                    Contact Site Supervisor
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 7: PROCUREMENT TEAM & APPROVAL AUTHORITIES                   */}
      {/* ================================================================ */}
      {activeTab === 'Procurement Team' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Users size={18} className="text-[#5B4DF6]" />
                <span>Authorized Procurement Team &amp; Approval Roster</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Personnel permitted to issue Purchase Orders, accept delivery challans, and approve revolving credit disbursements.
              </p>
            </div>
            <Link
              href="/customer/team"
              className="px-3.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors no-underline shadow-xs self-start sm:self-auto"
            >
              <Plus size={14} />
              <span>Manage Team Permissions</span>
            </Link>
          </div>

          {/* Key Team Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500">Authorized Signatories</span>
              <div className="text-xl font-black text-[#0F172A] mt-1">
                {teamMembers.length} Active {teamMembers.length === 1 ? 'Officer' : 'Officers'}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">100% KYC Verified</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500">Cumulative PO Limit</span>
              <div className="text-xl font-black text-[#0F172A] mt-1 font-mono">
                {formatINR(currentUser?.creditLimit || 5000000)}
              </div>
              <span className="text-[10px] text-slate-500">Revolving Sign-off</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500">Primary Authority</span>
              <div className="text-xl font-black text-[#0F172A] mt-1 truncate">
                {teamMembers[0]?.name || 'Not Designated'}
              </div>
              <span className="text-[10px] text-[#5B4DF6] font-bold">Chief Procurement Officer</span>
            </div>
          </div>

          {/* Officers Table */}
          {teamMembers.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3 border border-slate-200 rounded-2xl">
              <Users size={36} className="mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">No authorized team members</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Add procurement officers, site engineers, and billing leads to grant role-based order approvals.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Officer Name &amp; Designation</th>
                    <th className="py-3 px-4">Portal Role</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Approval Authority</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamMembers.map((officer) => (
                    <tr key={officer.email} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#5B4DF6]/10 text-[#5B4DF6] flex items-center justify-center font-bold text-xs shrink-0">
                            {officer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#0F172A]">{officer.name}</div>
                            <div className="text-[11px] text-slate-500">{officer.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{officer.access}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700">{officer.email}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{officer.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#0052CC]">{officer.limit}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {officer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 8: ENTERPRISE PROFILE & COMMERCIAL CLEARANCES                */}
      {/* ================================================================ */}
      {activeTab === 'Enterprise Profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Building2 size={18} className="text-[#5B4DF6]" />
                <span>Enterprise Credentials &amp; Commercial Terms</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified buyer profile, tax registrations, revolving credit facilities, and delivery coordinates.
              </p>
            </div>
            <Link
              href="/customer/profile"
              className="px-3.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors no-underline shadow-xs self-start sm:self-auto"
            >
              <span>Edit Enterprise Profile</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Company & Compliance */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Legal Entity Details
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  VERIFIED OEM
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Registered Legal Entity</span>
                  <span className="font-extrabold text-[#0F172A] text-sm">{clientCompany}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">GSTIN (18% ITC)</span>
                    <span className="font-mono font-bold text-[#0F172A]">{clientGstin}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">PAN Number</span>
                    <span className="font-mono font-bold text-[#0F172A]">
                      {currentUser?.pan || (currentUser?.gstin ? currentUser.gstin.substring(2, 12) : 'Not on file')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">MSME Registration</span>
                    <span className="font-mono font-bold text-[#0052CC]">
                      {currentUser?.msmeRegistrationNumber || 'Not Registered'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">VIP Classification</span>
                    <span className="font-bold text-amber-700">
                      {currentUser?.tier ? `Tier ${currentUser.tier}` : 'Standard Account'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Registered Works Address</span>
                  <span className="text-slate-700 leading-relaxed block mt-0.5">
                    {currentUser?.address || 'Address not registered'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Revolving Credit Facility & Payment Methods */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Commercial Credit Facility
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  NET 30 REVOLVING
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Sanctioned Credit Limit:</span>
                    <span className="font-mono font-black text-[#0F172A] text-sm">
                      {formatINR(currentUser?.creditLimit || 5000000)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-500 font-semibold">Available Balance:</span>
                    <span className="font-mono font-black text-emerald-700 text-sm">
                      {formatINR(creditAvailable)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-[#5B4DF6] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.round((totalSpend / (currentUser?.creditLimit || 5000000)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>{formatINR(totalSpend)} Invoiced</span>
                    <span>{Math.max(0, 100 - Math.round((totalSpend / (currentUser?.creditLimit || 5000000)) * 100))}% Capacity Left</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Standard Payment Terms:</span>
                    <span className="font-bold text-[#0F172A]">Net 30 Days from Transporter LR</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">MTC Standard:</span>
                    <span className="font-bold text-[#0F172A]">EN 10204 3.1 Certified</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Instant Settlements:</span>
                    <span className="font-bold text-[#5f259f] flex items-center gap-1">
                      <QrCode size={13} /> PhonePe B2B QR / UPI
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isToppingUpCredit}
                    onClick={async () => {
                      try {
                        setIsToppingUpCredit(true);
                        const res = await fetch('/api/payment/phonepe/initiate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            amount: 50000,
                            orderId: `CBH-CREDIT-TOPUP-${Date.now()}`,
                            customerName: clientName,
                            customerPhone: '9888021000',
                            customerEmail: 'procurement@apexinfra.com',
                            companyName: clientCompany,
                          }),
                        });
                        const data = await res.json();
                        if (data.success && data.paymentUrl) {
                          window.location.href = data.paymentUrl;
                        } else {
                          setIsToppingUpCredit(false);
                          showErrorAlert('Payment Initiation Failed', data.error || 'Failed to initiate PhonePe payment.');
                        }
                      } catch (err: any) {
                        setIsToppingUpCredit(false);
                        showErrorAlert('Connection Error', err.message || 'Connection error to PhonePe.');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#5f259f] hover:bg-[#4a1c7d] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-70"
                  >
                    <QrCode size={14} />
                    <span>{isToppingUpCredit ? 'Redirecting to PhonePe...' : 'Pay / Top-up Revolving Credit via PhonePe'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* EN 10204 3.1 MTC INSPECTION CERTIFICATE PREVIEW MODAL            */}
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

            <div className="p-6 space-y-4 text-xs font-sans">
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
                  <span className="text-[10px] text-slate-400 block">Heat Batch</span>
                  <span className="font-bold text-[#0F172A]">HT-2026-LUD-882</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Standard</span>
                  <span className="font-bold text-emerald-700">ISO 898-1 / IS 1367</span>
                </div>
              </div>

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

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Authorized QC Inspector: <strong>Harpreet Singh, NABL Lab Ludhiana</strong></span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  CERTIFIED 3.1
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
                  className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* GST TAX INVOICE PREVIEW MODAL                                    */}
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
