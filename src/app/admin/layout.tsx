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
  ChevronRight
} from 'lucide-react';
import { getStoredUser, setStoredUser, logout, DEMO_ADMIN, AuthUser } from '@/lib/auth';
import { GlobalUnit } from '@/lib/types';

export default function AdminLayout({
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Telemetry badge counts
  const [telemetry, setTelemetry] = useState({
    productsCount: 48,
    rfqsCount: 3,
    ordersCount: 8,
    usersCount: 5,
    surplusCount: 6,
    blogsCount: 5,
  });

  useEffect(() => {
    // Initialize dark mode from localStorage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('cbh_admin_theme');
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    let user = getStoredUser();
    // In admin operations terminal, automatically grant DEMO_ADMIN access
    if (!user || user.role !== 'admin') {
      user = DEMO_ADMIN;
      setStoredUser(DEMO_ADMIN);
    }
    setCurrentUser(user);
    setHasLoadedAuth(true);

    const handleAuthChange = () => {
      const u = getStoredUser();
      setCurrentUser(u && u.role === 'admin' ? u : DEMO_ADMIN);
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

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cbh_admin_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      window.dispatchEvent(new CustomEvent('cbh_theme_change', { detail: { dark: next } }));
    }
  };

  const fetchTelemetry = async () => {
    try {
      const [prodRes, rfqRes, ordRes] = await Promise.allSettled([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/rfq').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
      ]);

      setTelemetry((prev) => ({
        ...prev,
        productsCount: prodRes.status === 'fulfilled' && prodRes.value?.data ? prodRes.value.data.length : prev.productsCount,
        rfqsCount: rfqRes.status === 'fulfilled' && rfqRes.value?.data ? rfqRes.value.data.filter((q: any) => q.status === 'PENDING').length : prev.rfqsCount,
        ordersCount: ordRes.status === 'fulfilled' && ordRes.value?.data ? ordRes.value.data.length : prev.ordersCount,
      }));
    } catch {
      // ignore background telemetry errors
    }
  };

  // If viewing admin login page, don't wrap with executive shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Case 1: Unauthenticated -> Immediately redirect to home /
  if (hasLoadedAuth && !currentUser) {
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
    return (
      <div className="bg-[#0F172A] min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-xs font-semibold">Redirecting to home...</p>
      </div>
    );
  }

  // Case 2: Logged in as Customer -> Access Denied / 403 Forbidden Gate
  if (hasLoadedAuth && currentUser && currentUser.role !== 'admin') {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex flex-col">
        <header className="bg-[#0F172A] px-6 py-3.5 flex items-center justify-between border-b border-white/10">
          <Link href="/" className="no-underline flex items-center gap-2">
            <span className="text-lg font-black text-white">CBH<span className="text-[#FF6B00]">.</span></span>
            <span className="text-[11px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded">RESTRICTED ACCESS</span>
          </Link>
          <Link href="/customer" className="text-slate-400 text-xs font-semibold no-underline hover:text-white">
            &larr; Back to Client Portal
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-red-200 rounded-2xl max-w-lg w-full p-8 text-center shadow-xl border-t-4 border-t-red-600">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={30} />
            </div>
            <div className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-extrabold mb-2">
              403 FORBIDDEN • PRIVILEGE RESTRICTED
            </div>
            <h2 className="text-xl font-black text-[#0F172A] mb-2">
              Administrative Privileges Required
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              You are currently logged in as <strong>{currentUser.companyName}</strong> ({currentUser.fullName}) with <strong>Client/Buyer</strong> privileges. This terminal is strictly reserved for CBH operations and management.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/customer"
                className="w-full py-2.5 rounded-xl bg-[#5B4DF6] text-white text-xs font-bold no-underline hover:bg-[#4D3FF0]"
              >
                Return to Enterprise Client Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setStoredUser(DEMO_ADMIN);
                  setCurrentUser(DEMO_ADMIN);
                }}
                className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                One-Click Super Admin Clearance
              </button>
              <button
                type="button"
                onClick={() => logout('/admin/login')}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Sign Out &amp; Go to Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const adminAvatar =
    currentUser?.avatar ||
    (typeof window !== 'undefined' ? localStorage.getItem('cbh_admin_avatar') : null) ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces';

  // Get Page Title from Route
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/products')) return 'Products';
    if (pathname.startsWith('/admin/orders')) return 'Orders & Dispatch';
    if (pathname.startsWith('/admin/rfqs')) return 'Reports & RFQs';
    if (pathname.startsWith('/admin/users')) return 'Customers';
    if (pathname.startsWith('/admin/categories')) return 'Categories';
    if (pathname.startsWith('/admin/surplus')) return 'Surplus Stock';
    if (pathname.startsWith('/admin/payments')) return 'Payment Gateways';
    if (pathname.startsWith('/admin/erpnext')) return 'Marketplace Sync';
    if (pathname.startsWith('/admin/seo')) return 'SEO & Schemas';
    if (pathname.startsWith('/admin/profile')) return 'Operator Profile';
    if (pathname.startsWith('/admin/blogs')) return 'Metallurgy Blog';
    return 'Dashboard';
  };

  return (
    <div className={`min-h-screen flex font-sans antialiased transition-colors duration-200 ${
      isDarkMode ? 'dark bg-[#0B0F19] text-[#F1F5F9]' : 'bg-[#F4F5F9] text-slate-800'
    }`}>
      {/* ================================================================ */}
      {/* DESKTOP SIDEBAR (Clean 260px matching Prodex mockup)             */}
      {/* ================================================================ */}
      <aside
        className={`hidden md:flex flex-col justify-between sticky top-0 h-screen shrink-0 border-r transition-all duration-200 z-30 ${
          isDarkMode ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#EAEAEA]'
        } ${isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]'}`}
      >
        <div className="flex flex-col min-h-0 flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Top Brand Logo */}
          <div className="flex items-center justify-start px-2 py-1">
            <Link href="/admin" className="flex items-center no-underline" title="CBH Admin">
              {isSidebarCollapsed ? (
                <img
                  src="/assets/cbh-logo-icon.png"
                  alt="CBH Fasteners"
                  className="w-9 h-9 object-contain"
                />
              ) : (
                <img
                  src="/assets/cbh-logo-stacked.png"
                  alt="CBH Fasteners"
                  className={`h-12 w-auto max-w-[210px] object-contain transition-all ${
                    isDarkMode ? 'brightness-0 invert' : ''
                  }`}
                />
              )}
            </Link>
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
                href="/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin', true)
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Dashboard"
              >
                <LayoutDashboard size={18} strokeWidth={isLinkActive('/admin', true) ? 2.4 : 1.9} />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </Link>

              {/* 2. Products */}
              <Link
                href="/admin/products"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/products')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Products"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Boxes size={18} strokeWidth={isLinkActive('/admin/products') ? 2.4 : 1.9} />
                  {!isSidebarCollapsed && <span>Products</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {telemetry.productsCount}
                  </span>
                )}
              </Link>

              {/* 3. Orders with sub-tree */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isLinkActive('/admin/orders')
                      ? 'bg-slate-100 text-[#0F172A]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title="Orders"
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
                      href="/admin/orders"
                      className={`block px-2.5 py-1.5 rounded-lg text-xs font-medium no-underline transition-colors ${
                        pathname === '/admin/orders'
                          ? 'text-[#5B4DF6] font-bold bg-[#EEF0FD]/60'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      All Orders
                    </Link>
                    <Link
                      href="/admin/orders?status=PENDING"
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 no-underline"
                    >
                      Returns
                    </Link>
                    <Link
                      href="/admin/orders?status=PROCESSING"
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 no-underline"
                    >
                      Order Tracking
                    </Link>
                  </div>
                )}
              </div>

              {/* 4. Sales / Pricing */}
              <Link
                href="/admin/surplus"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/surplus')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Sales"
              >
                <TrendingUp size={18} strokeWidth={1.9} />
                {!isSidebarCollapsed && <span>Sales</span>}
              </Link>

              {/* 5. Customers / OEM Accounts */}
              <Link
                href="/admin/users"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/users')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Customers"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Users size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>Customers</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {telemetry.usersCount}
                  </span>
                )}
              </Link>

              {/* 6. Reports / RFQs */}
              <Link
                href="/admin/rfqs"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/rfqs')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Reports"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileCheck2 size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>Reports</span>}
                </div>
                {!isSidebarCollapsed && telemetry.rfqsCount > 0 && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {telemetry.rfqsCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Group: SETTINGS */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  SETTINGS
                </div>
              )}

              {/* Marketplace / ERPNext Sync */}
              <Link
                href="/admin/erpnext"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/erpnext')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Marketplace Sync"
              >
                <Database size={18} strokeWidth={1.9} />
                {!isSidebarCollapsed && <span>Marketplace Sync</span>}
              </Link>

              {/* Payment Gateways */}
              <Link
                href="/admin/payments"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/payments')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Payment Gateways"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CreditCard size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>Payment Gateways</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                    UPI
                  </span>
                )}
              </Link>

              {/* SEO & Schemas / Settings */}
              <Link
                href="/admin/seo"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/seo')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Settings"
              >
                <Globe size={18} strokeWidth={1.9} />
                {!isSidebarCollapsed && <span>Settings</span>}
              </Link>

              {/* Help Center / Operator Profile */}
              <Link
                href="/admin/profile"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/profile')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Help Center"
              >
                <User size={18} strokeWidth={1.9} />
                {!isSidebarCollapsed && <span>Help Center</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Dark Mode Toggle */}
        <div className={`p-4 border-t space-y-3 shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          {/* Dark Mode Row */}
          {!isSidebarCollapsed ? (
            <div
              onClick={toggleDarkMode}
              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                isDarkMode ? 'text-slate-200 hover:bg-slate-800/80' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-500" />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDarkMode();
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  isDarkMode ? 'bg-[#5B4DF6]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                    isDarkMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer mx-auto"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-500" />}
            </button>
          )}
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MAIN VIEWPORT CANVAS (Header + Body)                             */}
      {/* ================================================================ */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen ${isDarkMode ? 'bg-[#0B0F19]' : 'bg-[#F4F5F9]'}`}>
        {/* Single Top Header Row (Matching exact Prodex mockup) */}
        <header className={`border-b sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors ${
          isDarkMode ? 'bg-[#0F172A] border-[#1E293B] text-white' : 'bg-white border-[#EAEAEA] text-slate-800'
        }`}>
          {/* Left: Mobile hamburger + Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${
              isDarkMode ? 'text-white' : 'text-[#0F172A]'
            }`}>
              {getPageTitle()}
            </h1>
          </div>

          {/* Right: Team Stack + Notifications + Search + User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Active Team Stack (+2) */}
            <div className="hidden sm:flex items-center -space-x-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces"
                alt="Member"
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces"
                alt="Member"
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
              <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white text-slate-700 text-[10px] font-extrabold flex items-center justify-center">
                +2
              </div>
            </div>

            {/* Notification Bell with Badge (24) */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell size={19} />
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  24
                </span>
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 text-left animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-[#0F172A]">Console Alerts</span>
                    <span className="text-[10px] font-extrabold text-[#5B4DF6] bg-[#EEF0FD] px-2 py-0.5 rounded-full">
                      24 New
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs mt-2 max-h-60 overflow-y-auto">
                    <div className="py-2">
                      <div className="font-bold text-[#0F172A]">High Tensile Order #2048</div>
                      <div className="text-[11px] text-slate-500">John Doe placed order for ₹99,900.</div>
                      <div className="text-[10px] text-[#5B4DF6] font-semibold mt-1">5m ago</div>
                    </div>
                    <div className="py-2">
                      <div className="font-bold text-red-600">Low Stock Alert: DIN 933 M16</div>
                      <div className="text-[11px] text-slate-500">Only 240 pcs remaining in Ludhiana Unit.</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">20m ago</div>
                    </div>
                    <div className="py-2">
                      <div className="font-bold text-[#0F172A]">Payment Verified: PhonePe UPI</div>
                      <div className="text-[11px] text-slate-500">Transaction TXN-9981 confirmed.</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">1h ago</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Global Search Bar (Prodex style with ⌘K) */}
            <div className="relative hidden md:flex items-center">
              <Search size={15} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything"
                className="w-48 xl:w-64 pl-9 pr-10 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6] focus:bg-white transition-all"
              />
              <div className="absolute right-2.5 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>

            {/* User Profile Avatar with dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#5B4DF6]/30 transition-all cursor-pointer focus:outline-none"
                title={`${currentUser?.fullName || 'Harpreet Singh'} (Super Admin)`}
              >
                <img
                  src={adminAvatar}
                  alt="Admin"
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
              </button>

              {/* User Popover Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 text-left animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-slate-100 mb-2">
                    <div className="text-xs font-bold text-[#0F172A]">{currentUser?.fullName || 'Harpreet Singh'}</div>
                    <div className="text-[11px] text-slate-500">Super Administrator</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        HQ Clearances
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/admin/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                    >
                      <User size={14} className="text-[#5B4DF6]" />
                      <span>Operator Profile</span>
                    </Link>
                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                    >
                      <ExternalLink size={14} className="text-[#5B4DF6]" />
                      <span>View Live Storefront</span>
                    </Link>
                    <Link
                      href="/customer"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                    >
                      <LayoutDashboard size={14} className="text-[#5B4DF6]" />
                      <span>Switch to Customer Portal</span>
                    </Link>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout('/');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
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

        {/* ================================================================ */}
        {/* MOBILE DRAWER NAVIGATION                                         */}
        {/* ================================================================ */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="fixed top-0 bottom-0 left-0 w-[280px] bg-white p-5 flex flex-col justify-between shadow-2xl z-50 animate-in slide-in-from-left duration-200">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Link href="/admin" onClick={() => setIsMobileNavOpen(false)} className="flex items-center no-underline" title="CBH Admin">
                    <img
                      src="/assets/cbh-logo-stacked.png"
                      alt="CBH Fasteners"
                      className={`h-10 w-auto object-contain ${isDarkMode ? 'brightness-0 invert' : ''}`}
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1">
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#0F172A] bg-slate-100 no-underline"
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/admin/products"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <Boxes size={16} />
                    <span>Products</span>
                  </Link>
                  <Link
                    href="/admin/orders"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <Truck size={16} />
                    <span>Orders</span>
                  </Link>
                  <Link
                    href="/admin/users"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <Users size={16} />
                    <span>Customers</span>
                  </Link>
                  <Link
                    href="/admin/rfqs"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <FileCheck2 size={16} />
                    <span>Reports</span>
                  </Link>
                  <Link
                    href="/admin/payments"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <CreditCard size={16} />
                    <span>Payment Gateways</span>
                  </Link>
                  <Link
                    href="/admin/profile"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <User size={16} />
                    <span>Help Center / Profile</span>
                  </Link>
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    logout('/');
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

        {/* ================================================================ */}
        {/* MAIN BODY CANVAS (No duplicate headers!)                         */}
        {/* ================================================================ */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-[1400px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
