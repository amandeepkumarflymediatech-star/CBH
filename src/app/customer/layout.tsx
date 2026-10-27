'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BarChart2,
  Users,
  Calendar,
  Zap,
  Award,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Building2,
  Truck,
  FileText,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  User
} from 'lucide-react';
import { getStoredUser, logout, AuthUser } from '@/lib/auth';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hasLoadedAuth, setHasLoadedAuth] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    setHasLoadedAuth(true);

    // If unauthenticated on /customer/* routes, immediately redirect to /
    if (!user && typeof window !== 'undefined') {
      window.location.replace('/');
      return;
    }

    const handleAuthChange = () => {
      const u = getStoredUser();
      setCurrentUser(u);
      if (!u && typeof window !== 'undefined') {
        window.location.replace('/');
      }
    };
    window.addEventListener('cbh_auth_change', handleAuthChange);

    // Close popups when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('cbh_auth_change', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Case 1: Unauthenticated -> Immediately redirect to home /
  if (hasLoadedAuth && !currentUser) {
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
    return (
      <div style={{ background: '#F4F5F9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 600 }}>Redirecting to home...</p>
      </div>
    );
  }

  const clientCompany = currentUser?.companyName || 'Apex Infrastructure Corp';
  const clientName = currentUser?.fullName || 'Rajesh Sharma';
  const clientAvatar =
    currentUser?.avatar ||
    (typeof window !== 'undefined' ? localStorage.getItem('cbh_customer_avatar') : null) ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces';

  // Navigation Items
  const railNav = [
    { label: 'Overview', href: '/customer', icon: Home, exact: true },
    { label: 'Purchase Orders', href: '/customer/orders', icon: BarChart2 },
    { label: 'Procurement Team', href: '/customer/team', icon: Users },
    { label: 'Project Sites', href: '/customer/sites', icon: Calendar },
    { label: 'Bulk RFQs', href: '/customer/rfqs', icon: Zap },
    { label: 'NABL Certificates', href: '/customer/certificates', icon: Award },
    { label: 'Enterprise Profile', href: '/customer/profile', icon: User },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div style={{ background: '#F4F5F9', minHeight: '100vh', display: 'flex' }}>
      {/* ================================================================ */}
      {/* DESKTOP & TABLET SLIM ICON RAIL (width: 76px)                    */}
      {/* ================================================================ */}
      <aside
        className="hidden md:flex flex-col items-center justify-between py-6 sticky top-0 h-screen shrink-0 border-r border-[#E5E7EB] bg-white z-40"
        style={{ width: '76px' }}
      >
        {/* Top: CBH Logo (Square branded container with real logo icon) */}
        <div className="flex flex-col items-center gap-7 w-full">
          <Link
            href="/customer"
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-center p-2 hover:scale-105 hover:shadow-md transition-all no-underline group"
            title="CBH Fastener Procurement"
          >
            <img
              src="/assets/cbh-logo-icon.png"
              alt="CBH"
              className="w-full h-full object-contain transition-transform group-hover:scale-110"
            />
          </Link>

          {/* Navigation Stack */}
          <nav className="flex flex-col items-center gap-3 w-full px-3">
            {railNav.map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group relative no-underline ${
                    active
                      ? 'bg-[#EEF0FD] text-[#5B4DF6] font-bold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                  title={item.label}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.9} />
                  
                  {/* Tooltip on hover */}
                  <span className="absolute left-[70px] bg-[#0F172A] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Notification Bell with interactive popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors relative group ${
                  isNotificationsOpen ? 'bg-[#EEF0FD] text-[#5B4DF6]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
                title="Notifications"
              >
                <Bell size={20} strokeWidth={1.9} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#5B4DF6] ring-2 ring-white" />
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute left-[74px] top-0 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-xs text-[#0F172A]">Recent Activity &amp; Alerts</span>
                    <span className="text-[10px] font-extrabold text-[#5B4DF6] bg-[#EEF0FD] px-2 py-0.5 rounded-full">3 New</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs mt-2 max-h-72 overflow-y-auto">
                    <div className="py-2.5">
                      <div className="font-bold text-[#0F172A]">Consignment In Transit</div>
                      <div className="text-[11px] text-slate-500">TCI Express docket #782910 dispatched from Ludhiana Works.</div>
                      <div className="text-[10px] text-[#5B4DF6] font-semibold mt-1">20 mins ago</div>
                    </div>
                    <div className="py-2.5">
                      <div className="font-bold text-[#0F172A]">MTC Certificate Ready</div>
                      <div className="text-[11px] text-slate-500">NABL chemical test report issued for PO #CBH-2026-881.</div>
                      <div className="text-[10px] text-[#5B4DF6] font-semibold mt-1">2 hours ago</div>
                    </div>
                    <div className="py-2.5">
                      <div className="font-bold text-[#0F172A]">Credit Facility Active</div>
                      <div className="text-[11px] text-slate-500">Monthly revolving credit renewed: ₹37.5L available.</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">Yesterday</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom: Settings & User Profile Avatar */}
        <div className="flex flex-col items-center gap-4 w-full relative" ref={userMenuRef}>
          {/* Settings Icon (Links to /customer/settings) */}
          <Link
            href="/customer/settings"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors group relative no-underline ${
              pathname === '/customer/settings'
                ? 'bg-[#EEF0FD] text-[#5B4DF6]'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
            title="Account Settings"
          >
            <Settings size={20} strokeWidth={1.9} />
            <span className="absolute left-[70px] bg-[#0F172A] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Account Settings
            </span>
          </Link>

          {/* User Profile Avatar with Online Dot */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm hover:ring-2 hover:ring-[#5B4DF6] transition-all cursor-pointer focus:outline-none"
            title={`${clientName} (${clientCompany})`}
          >
            <img
              src={clientAvatar}
              alt={clientName}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </button>

          {/* User Account Popover Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute left-[74px] bottom-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 text-left animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="p-2 border-b border-slate-100 mb-2">
                <div className="text-xs font-bold text-[#0F172A] truncate">{clientCompany}</div>
                <div className="text-[11px] text-slate-500 truncate">{clientName}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    VIP TIER • 8% REBATE
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  href="/customer/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#5B4DF6] bg-[#EEF0FD]/60 hover:bg-[#EEF0FD] no-underline"
                >
                  <User size={14} className="text-[#5B4DF6]" />
                  <span>Enterprise Profile</span>
                </Link>
                <Link
                  href="/customer/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                >
                  <Settings size={14} className="text-[#5B4DF6]" />
                  <span>Account Settings</span>
                </Link>
                <Link
                  href="/customer/orders"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                >
                  <BarChart2 size={14} className="text-[#5B4DF6]" />
                  <span>My Orders</span>
                </Link>
                <Link
                  href="/products"
                  target="_blank"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                >
                  <ExternalLink size={14} className="text-[#5B4DF6]" />
                  <span>Open Fastener Catalog</span>
                </Link>
                <Link
                  href="/"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 no-underline"
                >
                  <Home size={14} className="text-[#5B4DF6]" />
                  <span>Return to Storefront</span>
                </Link>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout('/');
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
      </aside>

      {/* ================================================================ */}
      {/* MOBILE TOP BAR (< 768px)                                         */}
      {/* ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-white border-b border-[#E5E7EB] px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
              title="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                <img
                  src="/assets/cbh-logo-icon.png"
                  alt="CBH"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-sm text-[#0F172A]">Customer Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => logout('/')}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            <img
              src={clientAvatar}
              alt={clientName}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
          </div>
        </header>

        {/* Mobile Slide-In Drawer Navigation */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="fixed top-0 bottom-0 left-0 w-[280px] bg-white p-5 flex flex-col justify-between shadow-2xl z-50 animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-xs">
                      <img
                        src="/assets/cbh-logo-icon.png"
                        alt="CBH"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#0F172A]">CBH Fasteners</div>
                      <div className="text-[10px] text-slate-500">{clientCompany}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>

                <nav className="mt-5 space-y-1.5">
                  {railNav.map((item) => {
                    const active = isLinkActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                          active
                            ? 'bg-[#EEF0FD] text-[#5B4DF6]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  <Link
                    href="/customer/settings"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all no-underline"
                  >
                    <Settings size={18} strokeWidth={1.9} />
                    <span>Account Settings</span>
                  </Link>
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Link
                  href="/products"
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-slate-700 text-xs font-semibold no-underline"
                >
                  <span>Procure Fasteners</span>
                  <ExternalLink size={14} className="text-slate-400" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    logout('/');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* MAIN BODY CANVAS                                                 */}
        {/* ================================================================ */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
