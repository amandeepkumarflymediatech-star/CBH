'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  Box,
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
  Moon,
  Sun,
  SlidersHorizontal,
  FileCheck2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Award,
  Images,
  MessageSquare
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Telemetry badge counts
  const [telemetry, setTelemetry] = useState({
    productsCount: 48,
    rfqsCount: 3,
    ordersCount: 8,
    usersCount: 2,
    surplusCount: 6,
    blogsCount: 5,
    customRequestsCount: 0,
    testimonialsCount: 6,
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

    if (pathname === '/admin/login') {
      setHasLoadedAuth(true);
      return;
    }

    const user = getStoredUser();
    if (!user) {
      setCurrentUser(null);
      setHasLoadedAuth(true);
      router.replace('/admin/login');
      return;
    }

    if (user.role === 'customer') {
      setCurrentUser(user);
      setHasLoadedAuth(true);
      router.replace('/customer');
      return;
    }

    if (user.role !== 'admin') {
      setCurrentUser(user);
      setHasLoadedAuth(true);
      router.replace('/admin/login');
      return;
    }

    setCurrentUser(user);
    setHasLoadedAuth(true);

    const handleAuthChange = () => {
      const u = getStoredUser();
      if (!u) {
        setCurrentUser(null);
        router.replace('/admin/login');
      } else if (u.role === 'customer') {
        setCurrentUser(u);
        router.replace('/customer');
      } else if (u.role !== 'admin') {
        setCurrentUser(u);
        router.replace('/admin/login');
      } else {
        setCurrentUser(u);
      }
    };
    window.addEventListener('cbh_auth_change', handleAuthChange);

    const handleTelemetryRefresh = () => {
      fetchTelemetry();
    };
    window.addEventListener('cbh_telemetry_refresh', handleTelemetryRefresh);

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
      window.removeEventListener('cbh_telemetry_refresh', handleTelemetryRefresh);
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
      const [prodRes, rfqRes, ordRes, usersRes, customRes, testRes] = await Promise.allSettled([
        fetch('/api/products?limit=1').then((r) => r.json()),
        fetch('/api/rfq').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/custom-product-requests?status=PENDING').then((r) => r.json()),
        fetch('/api/testimonials?all=true').then((r) => r.json()),
      ]);

      setTelemetry((prev) => ({
        ...prev,
        productsCount:
          prodRes.status === 'fulfilled' && prodRes.value
            ? (prodRes.value.total ?? prodRes.value.pagination?.total ?? (Array.isArray(prodRes.value.data) ? prodRes.value.data.length : prev.productsCount))
            : prev.productsCount,
        rfqsCount: rfqRes.status === 'fulfilled' && rfqRes.value?.data ? rfqRes.value.data.filter((q: any) => q.status === 'PENDING').length : prev.rfqsCount,
        ordersCount: ordRes.status === 'fulfilled' && ordRes.value?.data ? ordRes.value.data.length : prev.ordersCount,
        usersCount: usersRes.status === 'fulfilled' && usersRes.value?.data ? usersRes.value.data.length : prev.usersCount,
        customRequestsCount: customRes.status === 'fulfilled' && customRes.value?.count !== undefined ? customRes.value.count : prev.customRequestsCount,
        testimonialsCount:
          testRes.status === 'fulfilled' && testRes.value
            ? (testRes.value.count ?? (Array.isArray(testRes.value.data) ? testRes.value.data.length : prev.testimonialsCount))
            : prev.testimonialsCount,
      }));
    } catch {
      // ignore background telemetry errors
    }
  };

  // If viewing admin login page, don't wrap with executive shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Case 0: Still checking authentication on client
  if (!hasLoadedAuth) {
    return (
      <div className="bg-[#0F172A] min-h-screen flex flex-col items-center justify-center text-white gap-3">
        <RefreshCw className="w-8 h-8 text-[#FF6B00] animate-spin" />
        <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Verifying Administrator Clearance...</p>
      </div>
    );
  }

  // Case 1: Unauthenticated -> Immediately redirect to /admin/login
  if (!currentUser) {
    if (typeof window !== 'undefined') {
      router.replace('/admin/login');
    }
    return (
      <div className="bg-[#0F172A] min-h-screen flex flex-col items-center justify-center text-white gap-3">
        <RefreshCw className="w-8 h-8 text-[#FF6B00] animate-spin" />
        <p className="text-slate-400 text-xs font-semibold">Redirecting to Administrator Sign In...</p>
      </div>
    );
  }

  // Case 2: Logged in as Customer -> Redirect to /customer
  if (currentUser.role === 'customer' || currentUser.role !== 'admin') {
    if (typeof window !== 'undefined') {
      router.replace('/customer');
    }
    return (
      <div className="bg-[#0F172A] min-h-screen flex flex-col items-center justify-center text-white gap-3">
        <RefreshCw className="w-8 h-8 text-[#5B4DF6] animate-spin" />
        <p className="text-slate-400 text-xs font-semibold">Redirecting to Enterprise Client Dashboard...</p>
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
    if (pathname === '/admin/products/new') return 'New Fastener';
    if (pathname.includes('/edit') && pathname.startsWith('/admin/products')) return 'Edit Fastener';
    if (pathname.startsWith('/admin/products')) return 'Products';
    if (pathname.startsWith('/admin/orders')) return 'Orders & Dispatch';
    if (pathname.startsWith('/admin/rfqs')) return 'RFQs';
    if (pathname.startsWith('/admin/users')) return 'Customers';
    if (pathname.startsWith('/admin/testimonials')) return 'Testimonials & Reviews';
    if (pathname.startsWith('/admin/categories')) return 'Categories';
    if (pathname.startsWith('/admin/surplus')) return 'Surplus Stock';
    if (pathname.startsWith('/admin/custom-requests')) return 'Custom Product Requests';
    if (pathname.startsWith('/admin/payments')) return 'Payment Gateways';
    if (pathname.startsWith('/admin/seo')) return 'SEO & Schemas';
    if (pathname.startsWith('/admin/profile')) return 'Operator Profile';
    if (pathname.startsWith('/admin/gallery')) return 'Media Gallery';
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
          {/* Top Brand Logo & Sidebar Slider Toggle */}
          <div className="flex items-center justify-around px-2">
            <Link href="/admin" className="flex items-center gap-2 no-underline" title="CBH Admin Portal">
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
                    className={`h-10 w-auto max-w-[150px] object-contain transition-all ${
                      isDarkMode ? 'brightness-0 invert' : ''
                    }`}
                  />
                  <span className="text-[9px] font-extrabold text-[#5B4DF6] bg-[#EEF0FD] dark:bg-[#5B4DF6]/20 px-1.5 py-0.5 rounded tracking-wider">
                    ADMIN
                  </span>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>

          {/* Top-Left Sidebar Back to Main Website */}
          <div className="px-1">
            <Link
              href="/"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all no-underline ${
                isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  : 'text-slate-600 hover:text-[#5B4DF6] hover:bg-[#EEF0FD] border border-slate-200'
              }`}
              title="Return to Main Storefront"
            >
              <ArrowLeft size={15} className="shrink-0" />
              {!isSidebarCollapsed && <span>Back to Store</span>}
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

              {/* 2.1 Fastener Categories ("Choose Fasteners by Type" Home Page) */}
              <Link
                href="/admin/categories"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/categories')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Fastener Categories (Home Page 'Choose Fasteners by Type' cards)"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Layers size={18} strokeWidth={isLinkActive('/admin/categories') ? 2.4 : 1.9} />
                  {!isSidebarCollapsed && <span>Categories</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200">
                    Home
                  </span>
                )}
              </Link>

              {/* 2.2 3D Virtual Depot Manager */}
              <Link
                href="/admin/virtual-store"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/virtual-store')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="3D Virtual Depot & Zones Manager"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Box size={18} strokeWidth={isLinkActive('/admin/virtual-store') ? 2.4 : 1.9} />
                  {!isSidebarCollapsed && <span>3D Virtual Depot</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-orange-50 text-[#FF6B00] border border-orange-200">
                    3D
                  </span>
                )}
              </Link>

              {/* 3. Orders */}
              <Link
                href="/admin/orders"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/orders')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Orders"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Truck size={18} strokeWidth={isLinkActive('/admin/orders') ? 2.4 : 1.9} />
                  {!isSidebarCollapsed && <span>Orders</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isLinkActive('/admin/orders')
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {telemetry.ordersCount}
                  </span>
                )}
              </Link>

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

              {/* 4.1 Custom Fastener Requests */}
              <Link
                href="/admin/custom-requests"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/custom-requests')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Custom Product Requests"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Sparkles size={18} strokeWidth={1.9} className="text-amber-500" />
                  {!isSidebarCollapsed && <span>Custom Requests</span>}
                </div>
                {!isSidebarCollapsed && telemetry.customRequestsCount > 0 && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {telemetry.customRequestsCount}
                  </span>
                )}
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

              {/* 6. RFQs */}
              <Link
                href="/admin/rfqs"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/rfqs')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="RFQs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileCheck2 size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>RFQs</span>}
                </div>
                {!isSidebarCollapsed && telemetry.rfqsCount > 0 && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {telemetry.rfqsCount}
                  </span>
                )}
              </Link>

              {/* 7. Testimonials */}
              <Link
                href="/admin/testimonials"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/testimonials')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Testimonials"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Award size={18} strokeWidth={1.9} />
                  {!isSidebarCollapsed && <span>Testimonials</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {telemetry.testimonialsCount}
                  </span>
                )}
              </Link>

              {/* 8. Media Gallery */}
              <Link
                href="/admin/gallery"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/gallery')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Facility & Infrastructure Media Gallery"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Images size={18} strokeWidth={isLinkActive('/admin/gallery') ? 2.4 : 1.9} />
                  {!isSidebarCollapsed && <span>Media Gallery</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200">
                    Photos
                  </span>
                )}
              </Link>

              {/* 9. Metallurgy Blog */}
              <Link
                href="/admin/blogs"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                  isLinkActive('/admin/blogs')
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Metallurgy & Technical Articles Blog"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BookOpen size={18} strokeWidth={isLinkActive('/admin/blogs') ? 2.4 : 1.9} />
                  {!isSidebarCollapsed && <span>Articles & Blog</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {telemetry.blogsCount}
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
      </aside>

      {/* ================================================================ */}
      {/* MAIN VIEWPORT CANVAS (Header + Body)                             */}
      {/* ================================================================ */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen ${isDarkMode ? 'bg-[#0B0F19]' : 'bg-[#F4F5F9]'}`}>
        {/* Single Top Header Row (Matching exact Prodex mockup) */}
        <header className={`border-b sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors ${
          isDarkMode ? 'bg-[#0F172A] border-[#1E293B] text-white' : 'bg-white border-[#EAEAEA] text-slate-800'
        }`}>
          {/* Left: Mobile Navigation Menu + Page Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              title="Open Navigation"
              aria-label="Open Navigation"
            >
              <Menu size={20} />
            </button>

            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${
              isDarkMode ? 'text-white' : 'text-[#0F172A]'
            }`}>
              {getPageTitle()}
            </h1>
          </div>

          {/* Right: Actions + User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-4">

            {/* Notification Bell with Badge (24) */}
            

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
                    
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout('/admin/login');
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
            <div className="fixed top-0 bottom-0 left-0 w-[280px] max-w-[85vw] bg-white p-5 flex flex-col justify-between shadow-2xl z-50 animate-in slide-in-from-left duration-200 overflow-y-auto">
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
                    href="/"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 mb-2 no-underline"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Store</span>
                  </Link>
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
                    href="/admin/categories"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <Layers size={16} />
                    <span>Categories (Home Section)</span>
                  </Link>
                  <Link
                    href="/admin/virtual-store"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <Box size={16} />
                    <span>3D Virtual Depot</span>
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
                    href="/admin/surplus"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <TrendingUp size={16} />
                    <span>Sales & Surplus</span>
                  </Link>
                  <Link
                    href="/admin/custom-requests"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <Sparkles size={16} className="text-amber-500" />
                    <span>Custom Requests</span>
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
                    <span>RFQs</span>
                  </Link>
                  <Link
                    href="/admin/testimonials"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <Award size={16} />
                    <span>Testimonials</span>
                  </Link>
                  <Link
                    href="/admin/gallery"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <Images size={16} />
                    <span>Media Gallery</span>
                  </Link>
                  <Link
                    href="/admin/blogs"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <BookOpen size={16} />
                    <span>Articles & Blog</span>
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
                    href="/admin/seo"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 no-underline"
                  >
                    <Globe size={16} />
                    <span>Settings & SEO</span>
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
                    logout('/admin/login');
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
