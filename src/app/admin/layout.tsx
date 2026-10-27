'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Boxes,
  FileCheck2,
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
  CheckCircle2,
  Zap,
  BookOpen,
  Globe,
  User
} from 'lucide-react';
import { getStoredUser, setStoredUser, logout, DEMO_ADMIN, AuthUser } from '@/lib/auth';
import { GlobalUnit } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hasLoadedAuth, setHasLoadedAuth] = useState(false);

  // Telemetry badge counts
  const [telemetry, setTelemetry] = useState({
    productsCount: 48,
    rfqsCount: 3,
    ordersCount: 8,
    usersCount: 5,
    surplusCount: 6,
    blogsCount: 5,
    totalTurnover: 2845000,
    totalFreightKg: 14200
  });

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    setHasLoadedAuth(true);

    if (pathname !== '/admin/login' && !user && typeof window !== 'undefined') {
      window.location.replace('/');
      return;
    }

    const handleAuthChange = () => {
      const u = getStoredUser();
      setCurrentUser(u);
      if (pathname !== '/admin/login' && !u && typeof window !== 'undefined') {
        window.location.replace('/');
      }
    };
    window.addEventListener('cbh_auth_change', handleAuthChange);

    // Initial telemetry fetch
    fetchTelemetry();

    return () => window.removeEventListener('cbh_auth_change', handleAuthChange);
  }, [pathname]);

  const fetchTelemetry = async () => {
    try {
      setIsSyncing(true);
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
      // Ignore background telemetry errors
    } finally {
      setIsSyncing(false);
    }
  };

  // If viewing admin login page, don't wrap with executive terminal shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Case 1: Unauthenticated -> Immediately redirect to home /
  if (hasLoadedAuth && !currentUser) {
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
    return (
      <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>Redirecting to home...</p>
      </div>
    );
  }

  // Case 2: Logged in as Customer -> Access Denied / 403 Forbidden Gate
  if (hasLoadedAuth && currentUser && currentUser.role !== 'admin') {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#0F172A', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>CBH<span style={{ color: '#FF6B00' }}>.</span></span>
            <span style={{ fontSize: '11px', fontWeight: 800, background: '#DC2626', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px' }}>RESTRICTED ACCESS</span>
          </Link>
          <Link href="/customer" style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
            &larr; Back to Client Portal
          </Link>
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px 20px' }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #FECACA',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 12px 35px rgba(239, 68, 68, 0.08)',
            borderTop: '5px solid #DC2626'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <ShieldAlert size={30} />
            </div>
            <div style={{ display: 'inline-block', background: '#FEE2E2', color: '#B91C1C', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>
              403 FORBIDDEN • PRIVILEGE RESTRICTED
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Administrative Privileges Required
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
              You are currently logged in as <strong>{currentUser.companyName}</strong> ({currentUser.fullName}) with <strong>Client/Buyer</strong> privileges. This station is strictly reserved for CBH operations and management.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/customer"
                className="btn-primary"
                style={{ padding: '12px', justifyContent: 'center', background: '#FF6B00', textDecoration: 'none' }}
              >
                <span>Return to My Client Portal</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout('/admin/login');
                }}
                style={{
                  padding: '11px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sign Out &amp; Switch to Admin Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Links
  const navItems = [
    { label: 'Operations KPI Hub', href: '/admin', icon: TrendingUp, exact: true },
    { label: 'Bulk RFQ Approvals', href: '/admin/rfqs', icon: FileCheck2, badge: telemetry.rfqsCount, badgeColor: '#FF6B00' },
    { label: 'Orders & Dispatch', href: '/admin/orders', icon: Truck, badge: telemetry.ordersCount },
    { label: 'Fastener Catalog (SKUs)', href: '/admin/products', icon: Boxes, badge: telemetry.productsCount },
    { label: 'Categories & Subcategories', href: '/admin/categories', icon: Folder, badge: '4-LEVEL', badgeColor: '#0052CC' },
    { label: 'Surplus Liquidation Lots', href: '/admin/surplus', icon: Zap, badge: telemetry.surplusCount },
    { label: 'OEM Accounts & Tiers', href: '/admin/users', icon: Users, badge: telemetry.usersCount },
    { label: 'ERPNext Two-Way Sync', href: '/admin/erpnext', icon: Database, badge: 'SYNC' },
    { label: 'Technical Metallurgy Blog', href: '/admin/blogs', icon: BookOpen, badge: telemetry.blogsCount },
    { label: 'Dynamic SEO & Schemas', href: '/admin/seo', icon: Globe, badge: 'HEAD' },
    { label: 'Operator Clearance Profile', href: '/admin/profile', icon: User, badge: 'MASTER', badgeColor: '#5B4DF6' },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dedicated Executive Admin Header */}
      <header style={{
        background: '#0F172A',
        color: '#FFFFFF',
        padding: '12px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left: Brand & Portal Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              CBH<span style={{ color: '#FF6B00' }}>.</span>
            </span>
            <span style={{ fontSize: '11px', fontWeight: 800, background: '#0052CC', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
              OPERATIONS TERMINAL
            </span>
          </Link>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#10B981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '12px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
            <span>HQ Node: Ludhiana</span>
          </span>
        </div>

        {/* Right: Store Link, Unit Toggle, Operator Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#94A3B8',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <span>View Live Store</span>
            <ArrowRight size={13} />
          </Link>

          {/* Pricing Unit Selector */}
          <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.08)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              type="button"
              onClick={() => setGlobalUnit('PCS')}
              style={{
                background: globalUnit === 'PCS' ? '#FF6B00' : 'transparent',
                color: '#FFFFFF',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              PCS
            </button>
            <button
              type="button"
              onClick={() => setGlobalUnit('KGS')}
              style={{
                background: globalUnit === 'KGS' ? '#FF6B00' : 'transparent',
                color: '#FFFFFF',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              KGS
            </button>
          </div>

          {/* Operator Profile & Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid rgba(255, 255, 255, 0.15)', paddingLeft: '12px' }}>
            <Link
              href="/admin/profile"
              title="View Operator Clearance Profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#E2E8F0',
                fontWeight: 700,
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '4px 10px',
                borderRadius: '6px'
              }}
            >
              <User size={13} color="#38BDF8" />
              <span>{currentUser?.fullName?.split(' ')[0] || 'Harpreet'} (Admin)</span>
            </Link>
            <button
              type="button"
              onClick={() => logout('/')}
              title="Sign Out of Operations Console"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#F87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Responsive Sub-Header / Mobile Drawer Toggle */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Menu size={16} />
            <span>Console Menu</span>
          </button>

          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
            CBH Operations Terminal
          </span>
          <span style={{ background: '#FF6B00', color: '#FFFFFF', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
            SUPER ADMIN
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchTelemetry}
            title="Sync Live Telemetry, RFQs & Inventory"
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0052CC',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={isSyncing ? 'spin' : ''} />
            <span>Sync Live Data</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Ribbon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        padding: '10px 20px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        whiteSpace: 'nowrap'
      }}>
        {navItems.map((item) => {
          const active = isLinkActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: active ? '#0052CC' : '#F1F5F9',
                color: active ? '#FFFFFF' : '#334155',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span style={{
                  background: active ? 'rgba(255,255,255,0.2)' : (item.badgeColor || '#E2E8F0'),
                  color: active ? '#FFFFFF' : (item.badgeColor ? '#FFFFFF' : '#475569'),
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 800
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Main Admin Console Layout Canvas */}
      <div style={{ flex: 1, display: 'flex', maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '20px', gap: '20px', flexWrap: 'wrap' }}>
        {/* Left Operations Sidebar */}
        <aside
          className="admin-sidebar-responsive"
          style={{
            width: '300px',
            flexShrink: 0,
            display: isMobileNavOpen ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {/* Console Header Card */}
          <div style={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={22} color="#FFFFFF" />
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em' }}>CBH Control Console</h2>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Ludhiana Works • Factory Unit #1</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <span style={{ background: '#FF6B00', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                SUPER ADMIN
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '11px', fontWeight: 700 }}>
                <CheckCircle2 size={13} />
                <span>Sync Active</span>
              </span>
            </div>

            {/* Live Telemetry Tickers */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
              <div>
                <span style={{ color: '#94A3B8', display: 'block' }}>TOTAL REVENUE</span>
                <strong style={{ color: '#38BDF8', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{formatINR(telemetry.totalTurnover)}</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block' }}>FREIGHT DISPATCH</span>
                <strong style={{ color: '#34D399', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{(telemetry.totalFreightKg / 1000).toFixed(1)} MT</strong>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 12px 2px' }}>
              EXECUTIVE &amp; OPERATIONS
            </span>

            {navItems.slice(0, 3).map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    background: active ? '#0052CC' : 'transparent',
                    color: active ? '#FFFFFF' : '#334155',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span style={{
                      background: active ? '#FFFFFF' : (item.badgeColor || '#E2E8F0'),
                      color: active ? '#0052CC' : (item.badgeColor ? '#FFFFFF' : '#475569'),
                      padding: '2px 7px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 12px 2px' }}>
              CATALOG &amp; INVENTORY
            </span>

            {navItems.slice(3, 6).map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    background: active ? '#0052CC' : 'transparent',
                    color: active ? '#FFFFFF' : '#334155',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span style={{
                      background: active ? '#FFFFFF' : (item.badgeColor || '#E2E8F0'),
                      color: active ? '#0052CC' : (item.badgeColor ? '#FFFFFF' : '#475569'),
                      padding: '2px 7px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 12px 2px' }}>
              ENTERPRISE &amp; SYSTEM
            </span>

            {navItems.slice(6).map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    background: active ? '#0052CC' : 'transparent',
                    color: active ? '#FFFFFF' : '#334155',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span style={{
                      background: active ? '#FFFFFF' : (item.badgeColor || '#E2E8F0'),
                      color: active ? '#0052CC' : (item.badgeColor ? '#FFFFFF' : '#475569'),
                      padding: '2px 7px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Page Content Viewport */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
