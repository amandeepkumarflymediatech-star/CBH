'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  Users,
  TrendingUp,
  Folder,
  ArrowRight,
  Database,
  LogOut,
  ShieldAlert,
  RefreshCw,
  Menu,
  X,
  CheckCircle2,
  Zap,
  BookOpen,
  Globe,
  User,
  CreditCard,
  Bell,
  Search,
  ChevronDown,
  Moon,
  Sun,
  SlidersHorizontal,
  FileCheck2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Award,
  Calendar,
  Settings,
  ShieldCheck,
  Building2,
  PackageCheck
} from 'lucide-react';
import { getStoredUser, setStoredUser, logout, DEMO_CLIENT, AuthUser } from '@/lib/auth';
import { GlobalUnit } from '@/lib/types';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hasLoadedAuth, setHasLoadedAuth] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Telemetry badge counts
  const [telemetry, setTelemetry] = useState({
    ordersCount: 3,
    rfqsCount: 2,
    certsCount: 5,
    sitesCount: 4,
    teamCount: 6,
  });

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      setCurrentUser(null);
      setHasLoadedAuth(true);
      router.replace('/login');
      return;
    }
    if (user.role === 'admin') {
      setCurrentUser(user);
      setHasLoadedAuth(true);
      router.replace('/admin');
      return;
    }
    setCurrentUser(user);
    setHasLoadedAuth(true);

    const handleAuthChange = () => {
      const u = getStoredUser();
      if (!u) {
        setCurrentUser(null);
        router.replace('/login');
      } else if (u.role === 'admin') {
        setCurrentUser(u);
        router.replace('/admin');
      } else {
        setCurrentUser(u);
      }
    };
    window.addEventListener('cbh_auth_change', handleAuthChange);

    fetchTelemetry();

    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('cbh_auth_change', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pathname]);

  const fetchTelemetry = async () => {
    try {
      const [ordRes, rfqRes] = await Promise.allSettled([
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/rfq').then((r) => r.json()),
      ]);

      setTelemetry((prev) => ({
        ...prev,
        ordersCount: ordRes.status === 'fulfilled' && ordRes.value?.data ? ordRes.value.data.length : prev.ordersCount,
        rfqsCount: rfqRes.status === 'fulfilled' && rfqRes.value?.data ? rfqRes.value.data.length : prev.rfqsCount,
      }));
    } catch {
      // background telemetry error ignored
    }
  };

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const clientName = currentUser?.fullName || 'Rajesh Sharma';
  const clientCompany = currentUser?.companyName || 'Apex Heavy Infra Ltd.';
  const clientAvatar =
    currentUser?.avatar ||
    (typeof window !== 'undefined' ? localStorage.getItem('cbh_customer_avatar') : null) ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces';

  // Get Page Title from Route
  const getPageTitle = () => {
    if (pathname === '/customer') return 'Dashboard';
    if (pathname.startsWith('/customer/orders')) return 'Purchase Orders & Consignments';
    if (pathname.startsWith('/customer/rfqs')) return 'Bulk RFQ Inquiries & Tenders';
    if (pathname.startsWith('/customer/certificates')) return 'NABL Quality Certificates';
    if (pathname.startsWith('/customer/sites')) return 'Project Sites & Delivery Yards';
    if (pathname.startsWith('/customer/team')) return 'Procurement Team';
    if (pathname.startsWith('/customer/profile')) return 'Enterprise Profile';
    if (pathname.startsWith('/customer/settings')) return 'Account Settings';
    return 'Dashboard';
  };

  // Case 0: Still checking authentication on client
  if (!hasLoadedAuth) {
    return (
      <div className="bg-[#0F172A] min-h-screen flex flex-col items-center justify-center text-white gap-3">
        <RefreshCw className="w-8 h-8 text-[#5B4DF6] animate-spin" />
        <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Verifying Client Session...</p>
      </div>
    );
  }

  // Case 1: Unauthenticated -> Immediately redirect to /login
  if (!currentUser) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return (
      <div className="bg-[#0F172A] min-h-screen flex flex-col items-center justify-center text-white gap-3">
        <RefreshCw className="w-8 h-8 text-[#5B4DF6] animate-spin" />
        <p className="text-slate-400 text-xs font-semibold">Redirecting to Sign In...</p>
      </div>
    );
  }

  // Case 2: Logged in as Admin -> Redirect to /admin operations terminal
  if (currentUser.role === 'admin') {
    if (typeof window !== 'undefined') {
      router.replace('/admin');
    }
    return (
      <div className="bg-[#0F172A] min-h-screen flex flex-col items-center justify-center text-white gap-3">
        <RefreshCw className="w-8 h-8 text-[#0052CC] animate-spin" />
        <p className="text-slate-400 text-xs font-semibold">Redirecting to Admin Operations Terminal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F9] flex font-sans text-slate-800 antialiased">
      {/* ================================================================ */}
      {/* DESKTOP SIDEBAR (Clean 260px matching Admin Panel design)         */}
      {/* ================================================================ */}
      <aside
        className={`hidden md:flex flex-col justify-between sticky top-0 h-screen shrink-0 bg-white border-r border-[#EAEAEA] transition-all duration-200 z-30 ${
          isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]'
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Top Brand Logo */}
          <div className="flex items-center justify-around px-2">
            <Link href="/customer" className="flex items-center gap-2 no-underline" title="CBH Client Portal">
              {isSidebarCollapsed ? (
                <img
                  src="/assets/cbh-logo-icon.png"
                  alt="CBH Fasteners"
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/cbh-logo-stacked.png"
                    alt="CBH Fasteners"
                    className="h-10 w-auto max-w-[150px] object-contain"
                  />
                  <span className="text-[9px] font-extrabold text-[#5B4DF6] bg-[#EEF0FD] px-1.5 py-0.5 rounded tracking-wider">CLIENT</span>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>

         

          {/* Navigation Stack */}
          <div className="space-y-6">
            {/* Group: MAIN */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  MAIN
                </div>
              )}

              {/* 1. Dashboard */}
              <Link
                href="/customer"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/customer', true)
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Dashboard"
              >
                <LayoutDashboard size={18} strokeWidth={isLinkActive('/customer', true) ? 2.4 : 1.9} />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </Link>

              {/* 2. Purchase Orders with Sub-Tree */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isLinkActive('/customer/orders')
                      ? 'bg-slate-100 text-[#0F172A]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title="Purchase Orders"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Truck size={18} strokeWidth={1.9} />
                    {!isSidebarCollapsed && <span>Orders</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${isOrdersExpanded ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {!isSidebarCollapsed && isOrdersExpanded && (
                  <div className="mt-1 ml-6 pl-3 border-l border-slate-200 space-y-1 py-1">
                    <Link
                      href="/customer/orders"
                      className={`block px-2.5 py-1.5 rounded-lg text-xs font-medium no-underline transition-colors ${
                        pathname === '/customer/orders'
                          ? 'text-[#5B4DF6] font-bold bg-[#EEF0FD]/60'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Orders ({telemetry.ordersCount})
                    </Link>
                    
                  </div>
                )}
              </div>

              {/* 3. Bulk RFQs / Quotations */}
              <Link
                href="/customer/rfqs"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/customer/rfqs')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Bulk RFQs & Tenders"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Zap size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>Bulk RFQs</span>}
                </div>
                {!isSidebarCollapsed && telemetry.rfqsCount > 0 && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {telemetry.rfqsCount}
                  </span>
                )}
              </Link>

              {/* 4. NABL Mill Certificates */}
              <Link
                href="/customer/certificates"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/customer/certificates')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="NABL Certificates"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Award size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>NABL 3.1 Vault</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    ISO 9001
                  </span>
                )}
              </Link>

              {/* 5. Invoices & Revolving Credit */}
              <Link
                href="/customer?tab=invoices"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  pathname === '/customer' && typeof window !== 'undefined' && window.location.search.includes('tab=invoices')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Invoices & Credit Facility"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CreditCard size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>Invoices &amp; Credit</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ₹37.5L
                  </span>
                )}
              </Link>

              {/* 6. Project Sites & Delivery Yards */}
              <Link
                href="/customer/sites"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/customer/sites')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Project Sites"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Building2 size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>Delivery Yards</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {telemetry.sitesCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Group: MANAGEMENT & ACCOUNT */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  ACCOUNT &amp; TEAM
                </div>
              )}

              {/* Procurement Team */}
              <Link
                href="/customer/team"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/customer/team')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Procurement Team"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Users size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>Team Officers</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {telemetry.teamCount}
                  </span>
                )}
              </Link>

              {/* Enterprise Profile */}
              <Link
                href="/customer/profile"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/customer/profile')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Enterprise Profile"
              >
                <User size={18} strokeWidth={1.9} />
                {!isSidebarCollapsed && <span>Enterprise Profile</span>}
              </Link>

              {/* Account Settings */}
              <Link
                href="/customer/settings"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/customer/settings')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Account Settings"
              >
                <Settings size={18} strokeWidth={1.9} />
                {!isSidebarCollapsed && <span>Account Settings</span>}
              </Link>

              {/* Fastener Catalog */}
              <Link
                href="/products"
                target="_blank"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all no-underline"
                title="Open Fastener Catalog"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ExternalLink size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>Fastener Catalog</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-[#0052CC]">
                    LIVE
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

      
      </aside>

      {/* ================================================================ */}
      {/* MAIN VIEWPORT CANVAS (Header + Body)                             */}
      {/* ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Row matching Admin Panel */}
        <header className="bg-white border-b border-[#EAEAEA] sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right: Team Stack + Notifications + Search + User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            

            {/* Notification Bell with Badge (3) */}
            <div className="relative" ref={notifRef}>
              {/* <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell size={19} />
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  3
                </span>
              </button> */}

              {/* Notification Popover */}
              {/* {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-76 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 text-left animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-[#0F172A]">Consignment Alerts</span>
                    <span className="text-[10px] font-extrabold text-[#5B4DF6] bg-[#EEF0FD] px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs mt-2 max-h-60 overflow-y-auto">
                    <div className="py-2">
                      <div className="font-bold text-[#0F172A]">Consignment In Transit</div>
                      <div className="text-[11px] text-slate-500">TCI Express docket #782910 dispatched from Ludhiana Works.</div>
                      <div className="text-[10px] text-[#5B4DF6] font-semibold mt-1">20m ago</div>
                    </div>
                    <div className="py-2">
                      <div className="font-bold text-emerald-700">MTC Certificate Ready</div>
                      <div className="text-[11px] text-slate-500">NABL chemical test report issued for PO #CBH-2026-881.</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">2h ago</div>
                    </div>
                    <div className="py-2">
                      <div className="font-bold text-[#0F172A]">Credit Facility Active</div>
                      <div className="text-[11px] text-slate-500">Monthly revolving credit renewed: ₹37.5L available.</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">Yesterday</div>
                    </div>
                  </div>
                </div>
              )} */}
            </div>

            {/* Global Search Bar (with ⌘K) */}
            {/* <div className="relative hidden md:flex items-center">
              <Search size={15} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, dockets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-60 pl-9 pr-9 py-2 rounded-xl bg-slate-100 border border-transparent text-xs text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none transition-all"
              />
              <span className="absolute right-2.5 text-[10px] font-bold text-slate-400 border border-slate-300 rounded px-1.5 py-0.5 bg-white">
                ⌘K
              </span>
            </div> */}

            {/* User Profile Avatar with Online Dot + Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                  <img
                    src={clientAvatar}
                    alt={clientName}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 text-left animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-slate-100 mb-2">
                    <div className="text-xs font-bold text-[#0F172A] truncate">{clientCompany}</div>
                    <div className="text-[11px] text-slate-500 truncate">{clientName}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] font-extrabold bg-[#EEF0FD] text-[#5B4DF6] px-2 py-0.5 rounded-full">
                        CLIENT ACCOUNT
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {pathname !== '/customer/profile' && (
                      <Link
                        href="/customer/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                      >
                        <User size={14} className="text-slate-500" />
                        <span>Enterprise Profile</span>
                      </Link>
                    )}
                    <Link
                      href="/customer/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                    >
                      <Truck size={14} className="text-slate-500" />
                      <span>Purchase Orders</span>
                    </Link>
                    <Link
                      href="/customer/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                    >
                      <CreditCard size={14} className="text-slate-500" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      href="/products"
                      target="_blank"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                    >
                      <ExternalLink size={14} className="text-slate-500" />
                      <span>Fastener Catalog</span>
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                    >
                      <Globe size={14} className="text-slate-500" />
                      <span>Return to Storefront</span>
                    </Link>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout('/login');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Slide-In Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="fixed top-0 bottom-0 left-0 w-[280px] bg-white p-5 flex flex-col justify-between shadow-2xl z-50 animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/cbh-logo-stacked.png"
                      alt="CBH Fasteners"
                      className="h-9 w-auto max-w-[140px] object-contain"
                    />
                    <span className="text-[9px] font-extrabold text-[#5B4DF6] bg-[#EEF0FD] px-1.5 py-0.5 rounded tracking-wider">
                      CLIENT
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>

                <nav className="mt-5 space-y-1">
                  {[
                    { label: 'Dashboard', href: '/customer', icon: LayoutDashboard, exact: true },
                    { label: 'Orders & Dispatches', href: '/customer/orders', icon: Truck },
                    { label: 'Bulk RFQs & Tenders', href: '/customer/rfqs', icon: Zap },
                    { label: 'NABL 3.1 Vault', href: '/customer/certificates', icon: Award },
                    { label: 'Invoices & Credit', href: '/customer?tab=invoices', icon: CreditCard },
                    { label: 'Delivery Yards', href: '/customer/sites', icon: Building2 },
                    { label: 'Procurement Team', href: '/customer/team', icon: Users },
                    { label: 'Enterprise Profile', href: '/customer/profile', icon: User },
                    { label: 'Account Settings', href: '/customer/settings', icon: Settings },
                  ].map((item) => {
                    const active = isLinkActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                          active
                            ? 'bg-[#0F172A] text-white'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Link
                  href="/products"
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-slate-700 text-xs font-semibold no-underline"
                >
                  <span>Fastener Catalog</span>
                  <ExternalLink size={14} className="text-slate-400" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    logout('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Body Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
