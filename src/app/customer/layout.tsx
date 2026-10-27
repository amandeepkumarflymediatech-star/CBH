'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  AlertCircle,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Menu,
  Award,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { getStoredUser, setStoredUser, logout, DEMO_CLIENT, AuthUser } from '@/lib/auth';
import { formatINR } from '@/lib/rfq-calculator';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hasLoadedAuth, setHasLoadedAuth] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    setHasLoadedAuth(true);

    const handleAuthChange = () => setCurrentUser(getStoredUser());
    window.addEventListener('cbh_auth_change', handleAuthChange);
    return () => window.removeEventListener('cbh_auth_change', handleAuthChange);
  }, []);

  // Case 1: Unauthenticated -> Require Client Login
  if (hasLoadedAuth && !currentUser) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#0F172A', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>CBH<span style={{ color: '#FF6B00' }}>.</span></span>
            <span style={{ fontSize: '11px', fontWeight: 800, background: '#0052CC', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px' }}>ENTERPRISE CLIENT STATION</span>
          </Link>
          <Link href="/" style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
            &larr; Return to Storefront
          </Link>
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px 20px' }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)',
            borderTop: '5px solid #0052CC'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Building2 size={30} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Enterprise Client Authorization Required
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
              Please sign in to access your company purchase orders, live dispatch logistics, approved credit limits, and certified NABL MTC test reports.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/login"
                className="btn-primary"
                style={{ padding: '12px', justifyContent: 'center', background: '#0052CC', textDecoration: 'none' }}
              >
                <span>Sign In to Client Portal</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/"
                style={{
                  padding: '11px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Return to Storefront
              </Link>
              <div style={{ margin: '16px 0 6px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                  Developer &amp; Testing Access
                </span>
                <button
                  type="button"
                  onClick={() => setStoredUser(DEMO_CLIENT)}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px dashed #BFDBFE',
                    background: '#EFF6FF',
                    color: '#0052CC',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ One-Click Demo: Sign In as Apex Infrastructure Corp (VIP Tier)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const clientCompany = currentUser?.companyName || 'Apex Infrastructure Corp';
  const clientName = currentUser?.fullName || 'Rajesh Sharma';
  const clientGstin = currentUser?.gstin || '07AAAAA0000A1Z5';
  const clientTier = currentUser?.tier || 'VIP';

  // Navigation Links for Customer
  const customerNav = [
    { label: 'Buyer Overview', href: '/customer', icon: Building2, exact: true },
    { label: 'Purchase Orders', href: '/customer/orders', icon: Truck },
    { label: 'Bulk RFQs & Quotes', href: '/customer/rfqs', icon: FileText },
    { label: 'NABL MTC & Quality', href: '/customer/certificates', icon: Award },
    { label: 'Project Delivery Sites', href: '/customer/sites', icon: MapPin },
    { label: 'Procurement Team', href: '/customer/team', icon: Users2 },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Enterprise Buyer Portal Top Header */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-[1600px] mx-auto">
          {/* Left: Mobile Toggle + Logo + Badges */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors shrink-0"
              title="Toggle Portal Navigation"
              aria-label="Toggle Portal Navigation"
            >
              <Menu size={18} />
            </button>

            <Link href="/customer" className="flex items-center gap-1.5 sm:gap-2 shrink-0 no-underline">
              <span className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
                CBH<span className="text-[#0052CC]">.</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-extrabold bg-[#0052CC] text-white px-2 py-0.5 rounded tracking-wider uppercase">
                Buyer Portal
              </span>
              <span className="sm:hidden text-[9px] font-extrabold bg-[#0052CC] text-white px-1.5 py-0.5 rounded uppercase">
                Client
              </span>
            </Link>

            {/* GST Verified Badge - Visible on wide screens */}
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>GST Verified: {clientGstin}</span>
            </span>
          </div>

          {/* Right: Available Credit + Procure Button + Account & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Credit Limit Badge: Compact on mobile, full on tablet/desktop */}
            <div className="hidden md:flex items-center gap-2 sm:gap-2.5 bg-slate-50 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs">
              <CreditCard size={15} className="text-[#0052CC] shrink-0" />
              <div className="leading-tight">
                <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider">Credit Available</div>
                <strong className="text-xs text-[#0F172A] font-mono font-bold">₹37.5L <span className="hidden lg:inline text-slate-400 font-normal">/ 50L</span></strong>
              </div>
              <span className="hidden xl:inline text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                30D
              </span>
            </div>

            {/* Direct Storefront Procure Fasteners button */}
            <Link
              href="/products"
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition-colors shadow-sm no-underline"
              title="Open Storefront Fastener Catalog"
            >
              <span className="hidden sm:inline">Procure Fasteners</span>
              <span className="sm:hidden">Store</span>
              <ArrowRight size={13} />
            </Link>

            {/* Account Info & Logout */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right leading-tight max-w-[130px] lg:max-w-[180px]">
                <div className="text-xs font-extrabold text-[#0F172A] truncate">{clientCompany}</div>
                <div className="text-[10px] text-slate-500 truncate">{clientName}</div>
              </div>

              <button
                type="button"
                onClick={() => logout()}
                title="Sign Out of Buyer Portal"
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 45
          }}
        />
      )}

      {/* Main Customer Layout Canvas with Dedicated Sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto p-3 sm:p-5 lg:p-6 gap-4 lg:gap-6">
        {/* Left Customer Sidebar */}
        <aside
          className={`customer-portal-sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}
          style={{
            width: '280px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Mobile Drawer Top Bar with Close Button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-200">
            <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
              Procurement Menu
            </span>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
              title="Close Menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Client Account Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#EFF6FF',
                color: '#0052CC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px'
              }}>
                <Building2 size={22} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {clientCompany}
                </h3>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <ShieldCheck size={12} color="#059669" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clientGstin}</span>
                </span>
              </div>
            </div>

            {/* Tier Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400E' }}>
                ⭐ {clientTier} TIER ACCOUNT
              </span>
              <span style={{ fontSize: '10px', fontWeight: 800, background: '#F59E0B', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px' }}>
                8% REBATE
              </span>
            </div>

            {/* 30-Day Revolving Credit Gauge */}
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Revolving Credit</span>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#059669' }}>30D Net</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                ₹37,50,000 <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>/ ₹50L</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #0052CC, #059669)', borderRadius: '3px' }} />
              </div>
            </div>
          </div>

          {/* Vertical Sidebar Navigation */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 12px' }}>
              Buyer Portal Navigation
            </span>
            {customerNav.map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: active ? 800 : 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: active ? '#0052CC' : 'transparent',
                    color: active ? '#FFFFFF' : '#334155',
                    transition: 'all 0.15s ease'
                  }}
                  className={active ? '' : 'hover:bg-slate-100'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} color={active ? '#FFFFFF' : '#64748B'} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ArrowRight size={14} color="#FFFFFF" />}
                </Link>
              );
            })}
          </div>

          {/* Custom BOM Schedule Callout */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#38BDF8" />
              <span style={{ fontSize: '12px', fontWeight: 800 }}>Need Custom Fasteners?</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              Upload BOM schedules or request customized DIN / ISO non-standard fasteners directly.
            </p>
            <Link
              href="/bulk-order"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: '#0052CC',
                color: '#FFFFFF',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              <span>Submit Custom BOM</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </aside>

        {/* Customer Page Body Viewport */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        @media (max-width: 1023px) {
          .customer-mobile-toggle {
            display: flex !important;
          }
          .customer-portal-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: min(320px, 86vw) !important;
            z-index: 50 !important;
            background: #F8FAFC !important;
            padding: 20px !important;
            overflow-y: auto !important;
            box-shadow: 6px 0 24px rgba(15, 23, 42, 0.15) !important;
            transform: translateX(-100%);
            transition: transform 0.25s ease-in-out !important;
          }
          .customer-portal-sidebar.mobile-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
}
