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
  Sparkles
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
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left: Brand & Buyer Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/customer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
              CBH<span style={{ color: '#0052CC' }}>.</span>
            </span>
            <span style={{ fontSize: '11px', fontWeight: 800, background: '#0052CC', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
              ENTERPRISE BUYER PORTAL
            </span>
          </Link>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#059669', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
            <ShieldCheck size={12} />
            <span>GST Verified: {clientGstin}</span>
          </span>
        </div>

        {/* Right: Credit Limit Gauge, Storefront Link & User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Credit Limit Balance Gauge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F1F5F9', padding: '5px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
            <CreditCard size={15} color="#0052CC" />
            <div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Available Credit</div>
              <strong style={{ fontSize: '12px', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>₹37,50,000 / ₹50L</strong>
            </div>
            <span style={{ fontSize: '10px', color: '#059669', fontWeight: 800, background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
              30D REVOLVING
            </span>
          </div>

          <Link
            href="/products"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0052CC',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              padding: '7px 14px',
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            <span>Procure Fasteners</span>
            <ArrowRight size={13} />
          </Link>

          {/* User Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #E2E8F0', paddingLeft: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 800 }}>{clientCompany}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{clientName}</div>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out of Buyer Portal"
              style={{
                background: '#FEE2E2',
                color: '#DC2626',
                border: '1px solid #FECACA',
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

      {/* Horizontal Navigation Bar */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        overflowX: 'auto',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {customerNav.map((item) => {
            const active = isLinkActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: active ? '#0052CC' : '#F1F5F9',
                  color: active ? '#FFFFFF' : '#334155',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', background: '#FEF3C7', padding: '3px 8px', borderRadius: '4px' }}>
            ⭐ {clientTier} TIER (8% REBATE)
          </span>
        </div>
      </div>

      {/* Customer Page Body Viewport */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {children}
      </main>
    </div>
  );
}
