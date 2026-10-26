'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminProductsSection from '@/components/admin/AdminProductsSection';
import AdminRfqsSection from '@/components/admin/AdminRfqsSection';
import AdminOrdersSection from '@/components/admin/AdminOrdersSection';
import AdminUsersSection from '@/components/admin/AdminUsersSection';
import AdminSurplusSection from '@/components/admin/AdminSurplusSection';
import AdminCatalogSection from '@/components/admin/AdminCatalogSection';
import AdminErpNextSection from '@/components/admin/AdminErpNextSection';
import {
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_SURPLUS_LOTS
} from '@/lib/mock-data';
import {
  Product,
  GlobalUnit,
  BulkQuotation,
  CustomerOrder,
  UserAccount,
  SurplusLot
} from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  Boxes,
  FileCheck2,
  Truck,
  Users,
  Flame,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Scale,
  Clock,
  Layers,
  Search,
  ShieldCheck,
  Building2,
  Plus,
  ArrowRight,
  Database,
  Lock,
  LogOut,
  ShieldAlert,
  RefreshCw,
  Menu
} from 'lucide-react';
import { getStoredUser, setStoredUser, logout, DEMO_ADMIN, AuthUser } from '@/lib/auth';

export default function AdminConsolePage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [activeTab, setActiveTab] = useState<'kpi' | 'inventory' | 'catalog' | 'rfqs' | 'orders' | 'users' | 'surplus' | 'erpnext'>('kpi');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hasLoadedAuth, setHasLoadedAuth] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    setHasLoadedAuth(true);

    const handleAuthChange = () => setCurrentUser(getStoredUser());
    window.addEventListener('cbh_auth_change', handleAuthChange);
    return () => window.removeEventListener('cbh_auth_change', handleAuthChange);
  }, []);

  // Main collections state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [quotes, setQuotes] = useState<BulkQuotation[]>(INITIAL_QUOTES);
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [surplusLots, setSurplusLots] = useState<SurplusLot[]>(INITIAL_SURPLUS_LOTS);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load initial data from APIs
  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [prodRes, rfqRes, ordRes, usrRes, surpRes] = await Promise.allSettled([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/rfq').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/surplus').then((r) => r.json()),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value?.data) setProducts(prodRes.value.data);
      if (rfqRes.status === 'fulfilled' && rfqRes.value?.data) setQuotes(rfqRes.value.data);
      if (ordRes.status === 'fulfilled' && ordRes.value?.data) setOrders(ordRes.value.data);
      if (usrRes.status === 'fulfilled' && usrRes.value?.data) setUsers(usrRes.value.data);
      if (surpRes.status === 'fulfilled' && surpRes.value?.data) setSurplusLots(surpRes.value.data);
      showToast('Live inventory, RFQs, and orders synced.');
    } catch (err) {
      console.error('Failed to load live admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live KPI aggregations
  const totalTurnover = orders.reduce((sum, o) => sum + (o.netAmount || 0), 0);
  const totalFreightKg = orders.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0);
  const pendingRfqsCount = quotes.filter((q) => q.status === 'PENDING' || q.status === 'IN_REVIEW').length;
  const activeOemCount = users.filter((u) => u.isVerified).length;

  // CRUD Handlers
  const handleAddProduct = async (newP: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts((prev) => [data.data, ...prev]);
        showToast(`SKU ${data.data.sku} created successfully.`);
      } else {
        const fallback: Product = { ...newP, id: Date.now() };
        setProducts((prev) => [fallback, ...prev]);
        showToast(`SKU ${fallback.sku} created locally.`);
      }
    } catch {
      const fallback: Product = { ...newP, id: Date.now() };
      setProducts((prev) => [fallback, ...prev]);
      showToast(`SKU ${fallback.sku} created locally.`);
    }
  };

  const handleUpdateProduct = async (updated: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? data.data : p)));
        showToast(`SKU ${updated.sku} updated.`);
      } else {
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast(`SKU ${updated.sku} updated.`);
      }
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(`SKU ${updated.sku} updated.`);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast(`Product deleted from database.`);
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast(`Product removed locally.`);
      }
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Product removed locally.`);
    }
  };

  const handleToggleSurplus = async (id: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const nextVal = !product.isSurplus;
    const updated: Product = {
      ...product,
      isSurplus: nextVal,
      surplusDiscountPct: nextVal ? 50 : undefined,
    };
    await handleUpdateProduct(updated);
    showToast(`SKU ${product.sku} surplus status: ${nextVal ? 'SURPLUS CLEARANCE (-50%)' : 'STANDARD STOCK'}`);
  };

  const handleAddQuote = async (newQ: Omit<BulkQuotation, 'id'>) => {
    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setQuotes((prev) => [data.data, ...prev]);
        showToast(`Quote ${data.data.rfqNumber} registered.`);
      } else {
        const fallback: BulkQuotation = { ...newQ, id: String(Date.now()) };
        setQuotes((prev) => [fallback, ...prev]);
        showToast(`Quote ${fallback.rfqNumber} registered.`);
      }
    } catch {
      const fallback: BulkQuotation = { ...newQ, id: String(Date.now()) };
      setQuotes((prev) => [fallback, ...prev]);
      showToast(`Quote ${fallback.rfqNumber} registered.`);
    }
  };

  const handleUpdateQuote = async (updated: BulkQuotation) => {
    try {
      const res = await fetch('/api/rfq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setQuotes((prev) => prev.map((q) => (q.id === updated.id ? data.data : q)));
        showToast(`Quotation ${updated.rfqNumber} status updated.`);
      } else {
        setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
        showToast(`Quotation ${updated.rfqNumber} updated.`);
      }
    } catch {
      setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      showToast(`Quotation ${updated.rfqNumber} updated.`);
    }
  };

  const handleDeleteQuote = async (id: string | number) => {
    try {
      const res = await fetch(`/api/rfq?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQuotes((prev) => prev.filter((q) => q.id !== String(id)));
        showToast(`Quotation record deleted.`);
      } else {
        setQuotes((prev) => prev.filter((q) => q.id !== String(id)));
        showToast(`Quotation removed.`);
      }
    } catch {
      setQuotes((prev) => prev.filter((q) => q.id !== String(id)));
      showToast(`Quotation removed.`);
    }
  };

  const handleAddOrder = async (newO: Omit<CustomerOrder, 'id'>) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newO),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrders((prev) => [data.data, ...prev]);
        showToast(`Order ${data.data.orderNumber} added.`);
      } else {
        const fallback: CustomerOrder = { ...newO, id: String(Date.now()) };
        setOrders((prev) => [fallback, ...prev]);
        showToast(`Order ${fallback.orderNumber} created.`);
      }
    } catch {
      const fallback: CustomerOrder = { ...newO, id: String(Date.now()) };
      setOrders((prev) => [fallback, ...prev]);
      showToast(`Order ${fallback.orderNumber} created.`);
    }
  };

  const handleUpdateOrder = async (updated: CustomerOrder) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? data.data : o)));
        showToast(`Order ${updated.orderNumber} status updated.`);
      } else {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        showToast(`Order ${updated.orderNumber} updated.`);
      }
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast(`Order ${updated.orderNumber} updated.`);
    }
  };

  const handleDeleteOrder = async (id: string | number) => {
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== String(id)));
        showToast(`Order deleted.`);
      } else {
        setOrders((prev) => prev.filter((o) => o.id !== String(id)));
        showToast(`Order removed.`);
      }
    } catch {
      setOrders((prev) => prev.filter((o) => o.id !== String(id)));
      showToast(`Order removed.`);
    }
  };

  const handleAddUser = async (newU: Omit<UserAccount, 'id'>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newU),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUsers((prev) => [data.data, ...prev]);
        showToast(`User ${data.data.companyName} registered.`);
      } else {
        const fallback: UserAccount = { ...newU, id: Date.now() };
        setUsers((prev) => [fallback, ...prev]);
        showToast(`User ${fallback.companyName} created.`);
      }
    } catch {
      const fallback: UserAccount = { ...newU, id: Date.now() };
      setUsers((prev) => [fallback, ...prev]);
      showToast(`User ${fallback.companyName} created.`);
    }
  };

  const handleUpdateUser = async (updated: UserAccount) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? data.data : u)));
        showToast(`Account ${updated.companyName} updated.`);
      } else {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        showToast(`Account ${updated.companyName} updated.`);
      }
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`Account ${updated.companyName} updated.`);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast(`User record deleted.`);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast(`User removed.`);
      }
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast(`User removed.`);
    }
  };

  const handleAddSurplusLot = async (newLot: Omit<SurplusLot, 'id'>) => {
    try {
      const res = await fetch('/api/surplus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLot),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSurplusLots((prev) => [data.data, ...prev]);
        showToast(`Lot ${data.data.sku} created.`);
      } else {
        const fallback: SurplusLot = { ...newLot, id: Date.now() };
        setSurplusLots((prev) => [fallback, ...prev]);
        showToast(`Lot ${fallback.sku} created.`);
      }
    } catch {
      const fallback: SurplusLot = { ...newLot, id: Date.now() };
      setSurplusLots((prev) => [fallback, ...prev]);
      showToast(`Lot ${fallback.sku} created.`);
    }
  };

  const handleUpdateSurplusLot = async (updated: SurplusLot) => {
    try {
      const res = await fetch('/api/surplus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSurplusLots((prev) => prev.map((l) => (l.id === updated.id ? data.data : l)));
        showToast(`Lot ${updated.sku} updated.`);
      } else {
        setSurplusLots((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        showToast(`Lot ${updated.sku} updated.`);
      }
    } catch {
      setSurplusLots((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      showToast(`Lot ${updated.sku} updated.`);
    }
  };

  const handleDeleteSurplusLot = async (id: number) => {
    try {
      const res = await fetch(`/api/surplus?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSurplusLots((prev) => prev.filter((l) => l.id !== id));
        showToast(`Surplus lot deleted.`);
      } else {
        setSurplusLots((prev) => prev.filter((l) => l.id !== id));
        showToast(`Surplus lot removed.`);
      }
    } catch {
      setSurplusLots((prev) => prev.filter((l) => l.id !== id));
      showToast(`Surplus lot removed.`);
    }
  };

  const handleToggleSurplusActive = async (lot: SurplusLot) => {
    const nextActive = !lot.isActive;
    const updated: SurplusLot = {
      ...lot,
      isActive: nextActive,
    };
    await handleUpdateSurplusLot(updated);
    showToast(`Lot ${lot.sku} storefront listing ${nextActive ? 'ACTIVATED' : 'PAUSED'}.`);
  };

  // Case 1: Unauthenticated -> Require Admin Sign In
  if (hasLoadedAuth && !currentUser) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#0F172A', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>CBH<span style={{ color: '#FF6B00' }}>.</span></span>
            <span style={{ fontSize: '11px', fontWeight: 800, background: '#0052CC', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px' }}>OPERATIONS TERMINAL</span>
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
              <ShieldAlert size={30} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              CBH Operations Clearance Required
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
              Access to central fastener inventories, pricing margin multipliers, bulk RFQ quotations, and fleet transport dispatch is restricted to authorized CBH platform operators.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/admin/login"
                className="btn-primary"
                style={{ padding: '12px', justifyContent: 'center', background: '#0052CC', textDecoration: 'none' }}
              >
                <span>Authorize at Operations Terminal</span>
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
                  onClick={() => setStoredUser(DEMO_ADMIN)}
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
                  ⚡ One-Click Demo: Sign In as Harpreet Singh (Chief Operations)
                </button>
              </div>
            </div>
          </div>
        </div>
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
                  logout();
                  window.location.href = '/admin/login';
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

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dedicated Executive Admin Header (No public e-commerce navbar) */}
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
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

          {/* Dual Unit Selector */}
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
            <span style={{ fontSize: '12px', color: '#E2E8F0', fontWeight: 700 }}>
              {currentUser?.fullName?.split(' ')[0] || 'Harpreet'} (Admin)
            </span>
            <button
              type="button"
              onClick={() => logout()}
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

      {/* RESPONSIVE SUB-HEADER / MOBILE NAV TOGGLE */}
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
            onClick={fetchData}
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
            <RefreshCw size={13} className={isLoadingData ? 'spin' : ''} />
            <span>Sync Live Data</span>
          </button>
        </div>
      </div>

      {/* QUICK HORIZONTAL TABS ON MOBILE / TABLET */}
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
        <button
          type="button"
          onClick={() => setActiveTab('kpi')}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'kpi' ? '#0052CC' : '#F1F5F9',
            color: activeTab === 'kpi' ? '#FFFFFF' : '#334155'
          }}
        >
          📊 KPI Hub
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rfqs')}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'rfqs' ? '#0052CC' : '#F1F5F9',
            color: activeTab === 'rfqs' ? '#FFFFFF' : '#334155'
          }}
        >
          📑 RFQs ({pendingRfqsCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'orders' ? '#0052CC' : '#F1F5F9',
            color: activeTab === 'orders' ? '#FFFFFF' : '#334155'
          }}
        >
          🚚 Orders ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'inventory' ? '#0052CC' : '#F1F5F9',
            color: activeTab === 'inventory' ? '#FFFFFF' : '#334155'
          }}
        >
          📦 Fastener SKUs ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('surplus')}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'surplus' ? '#0052CC' : '#F1F5F9',
            color: activeTab === 'surplus' ? '#FFFFFF' : '#334155'
          }}
        >
          🏷️ Surplus ({surplusLots.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'users' ? '#0052CC' : '#F1F5F9',
            color: activeTab === 'users' ? '#FFFFFF' : '#334155'
          }}
        >
          👥 OEM Accounts ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'catalog' ? '#0052CC' : '#F1F5F9',
            color: activeTab === 'catalog' ? '#FFFFFF' : '#334155'
          }}
        >
          📖 Catalog Hierarchy
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('erpnext')}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'erpnext' ? '#FF6B00' : '#F1F5F9',
            color: activeTab === 'erpnext' ? '#FFFFFF' : '#334155'
          }}
        >
          ⚡ ERPNext Hub
        </button>
      </div>

      {/* Main Admin Console Canvas with Sidebar */}
      <div style={{ flex: 1, display: 'flex', maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '20px', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* ============================================================== */}
        {/* LEFT OPERATIONS SIDEBAR                                         */}
        {/* ============================================================== */}
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
                <strong style={{ color: '#38BDF8', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{formatINR(totalTurnover)}</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block' }}>FREIGHT DISPATCH</span>
                <strong style={{ color: '#34D399', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{(totalFreightKg / 1000).toFixed(1)} MT</strong>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 12px 2px' }}>
              EXECUTIVE &amp; SALES
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('kpi')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'kpi' ? 700 : 500,
                background: activeTab === 'kpi' ? '#0052CC' : 'transparent',
                color: activeTab === 'kpi' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <TrendingUp size={16} />
              <span>Operations KPI Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rfqs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'rfqs' ? 700 : 500,
                background: activeTab === 'rfqs' ? '#0052CC' : 'transparent',
                color: activeTab === 'rfqs' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck2 size={16} />
                <span>Bulk RFQ Approvals</span>
              </div>
              <span style={{ background: activeTab === 'rfqs' ? '#FFFFFF' : '#FF6B00', color: activeTab === 'rfqs' ? '#0052CC' : '#FFFFFF', padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                {pendingRfqsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'orders' ? 700 : 500,
                background: activeTab === 'orders' ? '#0052CC' : 'transparent',
                color: activeTab === 'orders' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={16} />
                <span>Orders &amp; Dispatch Desk</span>
              </div>
              <span style={{ background: activeTab === 'orders' ? '#FFFFFF' : '#E2E8F0', color: activeTab === 'orders' ? '#0052CC' : '#475569', padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                {orders.length}
              </span>
            </button>

            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 12px 2px' }}>
              CATALOG &amp; DUAL WEIGHTS
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'inventory' ? 700 : 500,
                background: activeTab === 'inventory' ? '#0052CC' : 'transparent',
                color: activeTab === 'inventory' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Boxes size={16} />
                <span>Fastener Catalog (SKUs)</span>
              </div>
              <span style={{ background: activeTab === 'inventory' ? '#FFFFFF' : '#E2E8F0', color: activeTab === 'inventory' ? '#0052CC' : '#475569', padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'catalog' ? 700 : 500,
                background: activeTab === 'catalog' ? '#0052CC' : 'transparent',
                color: activeTab === 'catalog' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={16} />
                <span>Fischer 4-Level Matrix</span>
              </div>
              <span style={{ background: '#FF6B00', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 800 }}>
                PRO
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('surplus')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'surplus' ? 700 : 500,
                background: activeTab === 'surplus' ? '#0052CC' : 'transparent',
                color: activeTab === 'surplus' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Flame size={16} color={activeTab === 'surplus' ? '#FFFFFF' : '#FF6B00'} />
                <span>Surplus Lots (-60%)</span>
              </div>
              <span style={{ background: activeTab === 'surplus' ? '#FFFFFF' : '#E2E8F0', color: activeTab === 'surplus' ? '#0052CC' : '#475569', padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                {surplusLots.length}
              </span>
            </button>

            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 12px 2px' }}>
              CLIENTS &amp; CREDITS
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'users' ? 700 : 500,
                background: activeTab === 'users' ? '#0052CC' : 'transparent',
                color: activeTab === 'users' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={16} />
                <span>OEM Accounts &amp; Tiers</span>
              </div>
              <span style={{ background: activeTab === 'users' ? '#FFFFFF' : '#E2E8F0', color: activeTab === 'users' ? '#0052CC' : '#475569', padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                {users.length}
              </span>
            </button>

            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 12px 2px' }}>
              ENTERPRISE &amp; ERP
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('erpnext')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'erpnext' ? 700 : 500,
                background: activeTab === 'erpnext' ? '#0052CC' : 'transparent',
                color: activeTab === 'erpnext' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={16} color={activeTab === 'erpnext' ? '#FFFFFF' : '#0052CC'} />
                <span>ERPNext Live Sync</span>
              </div>
              <span style={{ background: activeTab === 'erpnext' ? '#FFFFFF' : '#ECFDF5', color: activeTab === 'erpnext' ? '#0052CC' : '#047857', padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 800 }}>
                SYNC
              </span>
            </button>

            {/* Operator Session & Sign Out */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ padding: '4px 10px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  Operator: {currentUser?.fullName?.split(' ')[0] || 'Harpreet'} (Admin)
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={14} color="#EF4444" />
                <span>Sign Out Station</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* ============================================================== */}
        {/* RIGHT MAIN OPERATIONS CANVAS                                   */}
        {/* ============================================================== */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Command Bar */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
              <Search size={16} color="#64748B" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across SKUs, quotes, invoices, heat numbers..."
                style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#0F172A' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Dual Unit Global Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Telemetry Unit:</span>
                <button
                  type="button"
                  onClick={() => setGlobalUnit('PCS')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: globalUnit === 'PCS' ? '#0052CC' : 'transparent',
                    color: globalUnit === 'PCS' ? '#FFFFFF' : '#64748B'
                  }}
                >
                  PCS
                </button>
                <button
                  type="button"
                  onClick={() => setGlobalUnit('KGS')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: globalUnit === 'KGS' ? '#0052CC' : 'transparent',
                    color: globalUnit === 'KGS' ? '#FFFFFF' : '#64748B'
                  }}
                >
                  KGS
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#0052CC',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} />
                <span>Add Fastener SKU</span>
              </button>
            </div>
          </div>

          {/* VIEW: KPI DASHBOARD */}
          {activeTab === 'kpi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Gross Orders Turnover</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0052CC', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {formatINR(totalTurnover)}
                  </div>
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Live from {orders.length} Dispatched Orders</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Cargo Freight</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {(totalFreightKg / 1000).toFixed(1)} MT
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>{totalFreightKg.toLocaleString()} Kg Total Shipped</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active Bulk RFQs</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#FF6B00', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {pendingRfqsCount} Pending
                  </div>
                  <span style={{ fontSize: '12px', color: '#0052CC', fontWeight: 600 }}>{quotes.length} total quotations on file</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Registered OEM Plants</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {users.length} Plants
                  </div>
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>{activeOemCount} GSTIN Verified B2B Accounts</span>
                </div>
              </div>

              {/* Quick Jump Operations Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <FileCheck2 size={20} color="#0052CC" />
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Bulk RFQ Review Desk</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '16px' }}>
                    Review incoming BOM spreadsheets, adjust raw steel index markups, and issue formal PDF quotations with WhatsApp dispatch links.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rfqs')}
                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    Open RFQ Desk ({pendingRfqsCount} Pending) <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Truck size={20} color="#059669" />
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Dispatch &amp; LR Logistics</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '16px' }}>
                    Assign transporters (TCI Express, Safexpress, VRL), input truck LR docket numbers, and link weighbridge slips to client orders.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    Open Dispatch Desk <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: FASTENER INVENTORY CATALOG */}
          {activeTab === 'inventory' && (
            <AdminProductsSection
              products={products}
              onAdd={handleAddProduct}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
              onToggleSurplus={handleToggleSurplus}
              showToast={showToast}
            />
          )}

          {/* VIEW: FISCHER 4-LEVEL CATALOG */}
          {activeTab === 'catalog' && (
            <AdminCatalogSection />
          )}

          {/* VIEW: BULK RFQs APPROVALS */}
          {activeTab === 'rfqs' && (
            <AdminRfqsSection
              quotes={quotes}
              onAdd={handleAddQuote}
              onUpdate={handleUpdateQuote}
              onDelete={handleDeleteQuote}
              showToast={showToast}
            />
          )}

          {/* VIEW: ORDERS & DISPATCH LOGISTICS */}
          {activeTab === 'orders' && (
            <AdminOrdersSection
              orders={orders}
              onAdd={handleAddOrder}
              onUpdate={handleUpdateOrder}
              onDelete={handleDeleteOrder}
              showToast={showToast}
            />
          )}

          {/* VIEW: OEM ACCOUNTS & TIERS */}
          {activeTab === 'users' && (
            <AdminUsersSection
              users={users}
              onAdd={handleAddUser}
              onUpdate={handleUpdateUser}
              onDelete={handleDeleteUser}
              showToast={showToast}
            />
          )}

          {/* VIEW: SURPLUS LOTS */}
          {activeTab === 'surplus' && (
            <AdminSurplusSection
              lots={surplusLots}
              onAdd={handleAddSurplusLot}
              onUpdate={handleUpdateSurplusLot}
              onDelete={handleDeleteSurplusLot}
              onToggleActive={handleToggleSurplusActive}
              showToast={showToast}
            />
          )}

          {/* VIEW: ERPNEXT INTEGRATION & SYNC HUB */}
          {activeTab === 'erpnext' && (
            <AdminErpNextSection
              products={products}
              onProductsSync={(newProds) => {
                setProducts(newProds);
                showToast(`Catalog updated with ${newProds.length} items from ERPNext.`);
              }}
              showToast={showToast}
            />
          )}

        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={16} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
