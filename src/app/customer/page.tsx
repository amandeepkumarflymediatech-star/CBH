'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Truck,
  FileText,
  FileDown,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
  UploadCloud,
  FileSpreadsheet,
  Layers,
  MapPin,
  Users2,
  CreditCard,
  Bell,
  Search,
  Scale,
  ArrowRight,
  TrendingUp,
  Download,
  AlertCircle,
  Eye,
  RefreshCw,
  ShoppingBag,
  Filter,
  Lock,
  LogOut,
  ShieldAlert,
  Plus,
  Trash2,
  X,
  Printer,
  ChevronRight,
  Menu
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import TablePagination from '@/components/common/TablePagination';
import { GlobalUnit, RfqLineItem, CustomerOrder, BulkQuotation } from '@/lib/types';
import { INITIAL_ORDERS, INITIAL_QUOTES } from '@/lib/mock-data';
import { formatINR } from '@/lib/rfq-calculator';
import { getStoredUser, setStoredUser, logout, DEMO_CLIENT, AuthUser } from '@/lib/auth';

interface DeliverySite {
  id: string;
  name: string;
  address: string;
  incharge: string;
  phone: string;
  activeDeliveries: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  access: string;
  status: string;
}

const DEFAULT_SITES: DeliverySite[] = [
  { id: 'site-1', name: 'Delhi Metro Rail Project (DMRC Package 4)', address: 'Gate 2, Anand Vihar Depot, New Delhi - 110092', incharge: 'Vikram Joshi (Site Engineer)', phone: '+91 98112 45890', activeDeliveries: 2 },
  { id: 'site-2', name: 'Jamnagar Petrochem Expansion Unit', address: 'Plot 104, GIDC Estate Phase 3, Jamnagar, GJ - 361004', incharge: 'Karan Patel (Materials Manager)', phone: '+91 98250 88123', activeDeliveries: 1 },
  { id: 'site-3', name: 'Bengaluru Highway Elevated Corridor', address: 'NH-44 Flyover Works, Peenya, Bengaluru, KA - 560058', incharge: 'S. N. Rao (Project Head)', phone: '+91 98450 11994', activeDeliveries: 0 },
];

const DEFAULT_TEAM: TeamMember[] = [
  { id: 'tm-1', name: 'Rajesh Sharma', role: 'Chief Procurement Officer', email: 'rajesh.sharma@apexinfra.in', access: 'Admin (Full PO & Credit)', status: 'Active' },
  { id: 'tm-2', name: 'Vikram Joshi', role: 'Site Lead Engineer', email: 'vikram.j@apexinfra.in', access: 'Inspection & MTC Download', status: 'Active' },
  { id: 'tm-3', name: 'Pooja Verma', role: 'Accounts & Billing Lead', email: 'pooja.v@apexinfra.in', access: 'Invoices & Ledger', status: 'Active' },
];

export default function CustomerPortalPage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [activeMenu, setActiveMenu] = useState<'overview' | 'orders' | 'rfqs' | 'bom-uploader' | 'certs' | 'invoices' | 'sites' | 'team'>('overview');
  const [accountMode, setAccountMode] = useState<'B2B' | 'B2C'>('B2B');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);
  const [isUploadingBOM, setIsUploadingBOM] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hasLoadedAuth, setHasLoadedAuth] = useState(false);

  // Live Dynamic Data State
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [quotes, setQuotes] = useState<BulkQuotation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Dynamic Sites & Team (persisted in localStorage)
  const [sites, setSites] = useState<DeliverySite[]>(DEFAULT_SITES);
  const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);

  // Modals state
  const [activeMtcModal, setActiveMtcModal] = useState<CustomerOrder | null>(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<CustomerOrder | null>(null);
  const [isNewRfqModalOpen, setIsNewRfqModalOpen] = useState(false);
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination States for all customer sections
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);
  const [rfqsPage, setRfqsPage] = useState(1);
  const [rfqsPerPage, setRfqsPerPage] = useState(5);
  const [certsPage, setCertsPage] = useState(1);
  const [certsPerPage, setCertsPerPage] = useState(5);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [invoicesPerPage, setInvoicesPerPage] = useState(5);
  const [sitesPage, setSitesPage] = useState(1);
  const [sitesPerPage, setSitesPerPage] = useState(6);
  const [teamPage, setTeamPage] = useState(1);
  const [teamPerPage, setTeamPerPage] = useState(5);

  // Form states
  const [newRfqForm, setNewRfqForm] = useState({
    standard: 'DIN 933 High Tensile Hex Set Screws',
    spec: 'M16 x 60mm (Grade 8.8 / 10.9)',
    quantity: '5000',
    unit: 'PCS' as GlobalUnit,
    deliverySite: 'Delhi Metro Rail Project (DMRC Package 4)',
    notes: 'Urgent consignment dispatch required with 3.1 MTC.',
  });

  const [newSiteForm, setNewSiteForm] = useState({
    name: '',
    address: '',
    incharge: '',
    phone: '',
  });

  const [newTeamForm, setNewTeamForm] = useState({
    name: '',
    role: '',
    email: '',
    access: 'Inspection & MTC Download',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Load Auth & Listen to session
  useEffect(() => {
    setCurrentUser(getStoredUser());
    setHasLoadedAuth(true);

    const handleAuthChange = () => setCurrentUser(getStoredUser());
    window.addEventListener('cbh_auth_change', handleAuthChange);
    return () => window.removeEventListener('cbh_auth_change', handleAuthChange);
  }, []);

  // 2. Fetch Live Dynamic Orders and Quotes from APIs
  const fetchPortalData = async () => {
    setIsLoadingData(true);
    try {
      const [ordersRes, rfqRes] = await Promise.allSettled([
        fetch('/api/orders').then((res) => res.json()),
        fetch('/api/rfq').then((res) => res.json()),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
        setOrders(ordersRes.value.data);
      } else {
        setOrders(INITIAL_ORDERS);
      }

      if (rfqRes.status === 'fulfilled' && rfqRes.value?.data) {
        setQuotes(rfqRes.value.data);
      } else {
        setQuotes(INITIAL_QUOTES);
      }
    } catch (err) {
      console.error('Error loading live customer portal data:', err);
      setOrders(INITIAL_ORDERS);
      setQuotes(INITIAL_QUOTES);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  // 3. Load Dynamic Sites and Team from localStorage
  useEffect(() => {
    try {
      const savedSites = localStorage.getItem('cbh_delivery_sites');
      if (savedSites) setSites(JSON.parse(savedSites));

      const savedTeam = localStorage.getItem('cbh_team_members');
      if (savedTeam) setTeam(JSON.parse(savedTeam));
    } catch {
      // ignore
    }
  }, []);

  // Save Sites
  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteForm.name || !newSiteForm.address) return;
    const newSite: DeliverySite = {
      id: `site-${Date.now()}`,
      name: newSiteForm.name,
      address: newSiteForm.address,
      incharge: newSiteForm.incharge || 'Site Lead',
      phone: newSiteForm.phone || '+91 98880 21000',
      activeDeliveries: 0,
    };
    const updated = [newSite, ...sites];
    setSites(updated);
    localStorage.setItem('cbh_delivery_sites', JSON.stringify(updated));
    setIsNewSiteModalOpen(false);
    setNewSiteForm({ name: '', address: '', incharge: '', phone: '' });
    showToast(`Project site "${newSite.name}" registered successfully.`);
  };

  const handleDeleteSite = (id: string) => {
    const updated = sites.filter((s) => s.id !== id);
    setSites(updated);
    localStorage.setItem('cbh_delivery_sites', JSON.stringify(updated));
    showToast('Project site removed from procurement directory.');
  };

  // Save Team
  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamForm.name || !newTeamForm.email) return;
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newTeamForm.name,
      role: newTeamForm.role || 'Procurement Officer',
      email: newTeamForm.email,
      access: newTeamForm.access,
      status: 'Active',
    };
    const updated = [newMember, ...team];
    setTeam(updated);
    localStorage.setItem('cbh_team_members', JSON.stringify(updated));
    setIsNewTeamModalOpen(false);
    setNewTeamForm({ name: '', role: '', email: '', access: 'Inspection & MTC Download' });
    showToast(`Team member "${newMember.name}" invited with ${newMember.access} access.`);
  };

  const handleDeleteTeam = (id: string) => {
    const updated = team.filter((m) => m.id !== id);
    setTeam(updated);
    localStorage.setItem('cbh_team_members', JSON.stringify(updated));
    showToast('Team member access revoked.');
  };

  // Create new RFQ dynamically (POST to /api/rfq)
  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const weight = newRfqForm.unit === 'KGS' ? parseFloat(newRfqForm.quantity) : (parseFloat(newRfqForm.quantity) * 0.08);
      const estGross = weight * 145; // estimated benchmark price

      const payload = {
        rfqNumber: `RFQ-CBH-${Date.now().toString().slice(-4)}`,
        customerName: currentUser?.fullName || 'Procurement Executive',
        companyName: currentUser?.companyName || 'Enterprise Buyer',
        gstin: currentUser?.gstin || '29AABCA1234F1Z5',
        phone: currentUser?.phone || '+91 98880 21000',
        email: currentUser?.email || 'procurement@client.com',
        itemsCount: 1,
        totalWeightKg: weight,
        grossAmount: estGross,
        discountPct: currentUser?.tierDiscountPct || 18,
        status: 'PENDING' as BulkQuotation['status'],
      };

      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setQuotes((prev) => [data.data, ...prev]);
        showToast(`Quotation request ${data.data.rfqNumber} registered with CBH Sales Desk.`);
      } else {
        const fallback: BulkQuotation = {
          id: `quote-${Date.now()}`,
          ...payload,
          date: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          netTotal: estGross * 0.82,
        };
        setQuotes((prev) => [fallback, ...prev]);
        showToast(`Quotation request ${fallback.rfqNumber} registered.`);
      }

      setIsNewRfqModalOpen(false);
      setActiveMenu('rfqs');
    } catch {
      showToast('Error creating RFQ. Saved locally.');
      setIsNewRfqModalOpen(false);
    }
  };

  // Accept Quote dynamically
  const handleAcceptQuote = async (quote: BulkQuotation) => {
    try {
      const res = await fetch('/api/rfq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id, status: 'PO_ISSUED' }),
      });
      const data = await res.json();
      if (data.success) {
        setQuotes((prev) => prev.map((q) => (q.id === quote.id ? { ...q, status: 'PO_ISSUED' as BulkQuotation['status'] } : q)));
      } else {
        setQuotes((prev) => prev.map((q) => (q.id === quote.id ? { ...q, status: 'PO_ISSUED' as BulkQuotation['status'] } : q)));
      }
      showToast(`Quotation ${quote.rfqNumber} accepted! Converted to active PO.`);
    } catch {
      setQuotes((prev) => prev.map((q) => (q.id === quote.id ? { ...q, status: 'PO_ISSUED' as BulkQuotation['status'] } : q)));
      showToast(`Quotation ${quote.rfqNumber} accepted!`);
    }
  };

  // Live Metrics Calculations
  const activeConsignmentsCount = useMemo(() => {
    return orders.filter((o) => o.status !== 'DELIVERED').length;
  }, [orders]);

  const pendingQuotesCount = useMemo(() => {
    return quotes.filter((q) => q.status === 'PENDING' || q.status === 'QUOTED').length;
  }, [quotes]);

  const totalWeightDispatchedKg = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0);
  }, [orders]);

  const totalSpentAmount = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.netAmount || 0), 0);
  }, [orders]);

  // Filtered orders & quotes by search
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.trackingNumber?.toLowerCase().includes(q) ||
        o.carrier.toLowerCase().includes(q) ||
        o.shippingAddress?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const filteredQuotes = useMemo(() => {
    if (!searchQuery.trim()) return quotes;
    const q = searchQuery.toLowerCase();
    return quotes.filter(
      (qt) =>
        qt.rfqNumber.toLowerCase().includes(q) ||
        qt.customerName?.toLowerCase().includes(q) ||
        qt.companyName?.toLowerCase().includes(q)
    );
  }, [quotes, searchQuery]);

  // Reset pagination when search query changes
  useEffect(() => {
    setOrdersPage(1);
    setRfqsPage(1);
    setCertsPage(1);
    setInvoicesPage(1);
  }, [searchQuery]);

  // Paginated data slices for each view
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, ordersPage, ordersPerPage]);

  const paginatedQuotes = useMemo(() => {
    const start = (rfqsPage - 1) * rfqsPerPage;
    return filteredQuotes.slice(start, start + rfqsPerPage);
  }, [filteredQuotes, rfqsPage, rfqsPerPage]);

  const paginatedCerts = useMemo(() => {
    const start = (certsPage - 1) * certsPerPage;
    return filteredOrders.slice(start, start + certsPerPage);
  }, [filteredOrders, certsPage, certsPerPage]);

  const paginatedInvoices = useMemo(() => {
    const start = (invoicesPage - 1) * invoicesPerPage;
    return filteredOrders.slice(start, start + invoicesPerPage);
  }, [filteredOrders, invoicesPage, invoicesPerPage]);

  const paginatedSites = useMemo(() => {
    const start = (sitesPage - 1) * sitesPerPage;
    return sites.slice(start, start + sitesPerPage);
  }, [sites, sitesPage, sitesPerPage]);

  const paginatedTeam = useMemo(() => {
    const start = (teamPage - 1) * teamPerPage;
    return team.slice(start, start + teamPerPage);
  }, [team, teamPage, teamPerPage]);

  // Handle BOM upload simulation
  const handleSimulateBOMUpload = () => {
    setIsUploadingBOM(true);
    setTimeout(() => {
      setIsUploadingBOM(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    }, 1200);
  };

  // Case 1: Unauthenticated Guard Gate
  if (hasLoadedAuth && !currentUser) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <MainHeader
          unit={globalUnit}
          onUnitToggle={(u) => setGlobalUnit(u)}
          cartCount={cartItems.length}
          onOpenCart={() => setIsCartOpen(true)}
        />
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
            borderTop: '5px solid #FF6B00'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Lock size={30} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Client Portal Authentication Required
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
              Please sign in with your enterprise buyer credentials to access live Lorry Receipt (LR) tracking, custom wholesale tier discounts, and official MTC 3.1 Mill Test Certificates.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/login"
                className="btn-primary"
                style={{ padding: '12px', justifyContent: 'center', textDecoration: 'none' }}
              >
                <span>Sign In to Client Portal</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/register"
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
                Register New OEM / Contractor Account
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
                    border: '1px dashed #FFD8A8',
                    background: '#FFF7ED',
                    color: '#C2410C',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ One-Click Demo: Sign In as Apex Heavy Infra (OEM)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Primary Sticky Header */}
      <MainHeader
        unit={globalUnit}
        onUnitToggle={(u) => setGlobalUnit(u)}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #10B981'
        }}>
          <CheckCircle2 size={16} color="#34D399" />
          <span>{toastMessage}</span>
        </div>
      )}

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
        zIndex: 30
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
            <span>Portal Menu</span>
          </button>

          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
            {currentUser?.companyName || 'Client Portal'}
          </span>
          <span style={{ background: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
            {currentUser?.tier ? `${currentUser.tier} OEM` : 'DIAMOND OEM (-18%)'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchPortalData}
            title="Refresh Live Consignments & Quotes"
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0052CC',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={isLoadingData ? 'spin' : ''} />
            <span>Sync Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewRfqModalOpen(true)}
            style={{
              background: '#0052CC',
              color: '#FFFFFF',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            <span>New RFQ</span>
          </button>
        </div>
      </div>

      {/* Main Portal Canvas with Responsive Sidebar */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto',
        padding: '20px',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        
        {/* ============================================================== */}
        {/* RESPONSIVE ENTERPRISE SIDEBAR                                   */}
        {/* ============================================================== */}
        <aside style={{
          width: '300px',
          flexShrink: 0,
          display: isMobileNavOpen ? 'flex' : 'none',
          flexDirection: 'column',
          gap: '18px'
        }}
        className="portal-sidebar-responsive"
        >
          {/* Profile Card */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>
                {currentUser?.companyName ? currentUser.companyName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', margin: 0 }}>
                  {currentUser?.companyName || 'Apex Heavy Infra Ltd.'}
                </h2>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontFamily: 'var(--font-mono)' }}>
                  {currentUser?.gstin ? `GSTIN: ${currentUser.gstin}` : 'GSTIN: 29AABCA1234F1Z5'}
                </span>
              </div>
            </div>

            {/* Wholesale Tier Card */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase' }}>Wholesale Slab</span>
                <span style={{ background: '#FF6B00', color: '#FFFFFF', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
                  {currentUser?.tier ? `${currentUser.tier} OEM` : 'DIAMOND OEM (-18%)'}
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#FFEDD5', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (totalWeightDispatchedKg / 20000) * 100)}%`, height: '100%', background: '#EA580C' }} />
              </div>
              <p style={{ fontSize: '11px', color: '#9A3412', marginTop: '6px', lineHeight: 1.4, margin: 0 }}>
                Dispatched: <strong>{(totalWeightDispatchedKg / 1000).toFixed(2)} MT</strong> of 20 MT annual slab.
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '14px', display: 'flex', flexDirection: 'column', gap: '3px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px 2px' }}>
              OPERATIONS
            </span>

            <button
              type="button"
              onClick={() => { setActiveMenu('overview'); setIsMobileNavOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeMenu === 'overview' ? 700 : 500,
                background: activeMenu === 'overview' ? '#0052CC' : 'transparent',
                color: activeMenu === 'overview' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <TrendingUp size={16} />
              <span>Dashboard Overview</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveMenu('orders'); setIsMobileNavOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeMenu === 'orders' ? 700 : 500,
                background: activeMenu === 'orders' ? '#0052CC' : 'transparent',
                color: activeMenu === 'orders' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={16} />
                <span>Orders &amp; Live LR Track</span>
              </div>
              <span style={{ background: activeMenu === 'orders' ? '#FFFFFF' : '#E2E8F0', color: activeMenu === 'orders' ? '#0052CC' : '#475569', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveMenu('rfqs'); setIsMobileNavOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeMenu === 'rfqs' ? 700 : 500,
                background: activeMenu === 'rfqs' ? '#0052CC' : 'transparent',
                color: activeMenu === 'rfqs' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={16} />
                <span>Quotes &amp; RFQs</span>
              </div>
              <span style={{ background: '#FF6B00', color: '#FFFFFF', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                {quotes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveMenu('bom-uploader'); setIsMobileNavOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeMenu === 'bom-uploader' ? 700 : 500,
                background: activeMenu === 'bom-uploader' ? '#0052CC' : 'transparent',
                color: activeMenu === 'bom-uploader' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <FileSpreadsheet size={16} />
              <span>Bulk BOM / CSV Uploader</span>
            </button>

            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 10px 2px' }}>
              COMPLIANCE &amp; FINANCE
            </span>

            <button
              type="button"
              onClick={() => { setActiveMenu('certs'); setIsMobileNavOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeMenu === 'certs' ? 700 : 500,
                background: activeMenu === 'certs' ? '#0052CC' : 'transparent',
                color: activeMenu === 'certs' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <ShieldCheck size={16} />
              <span>MTC 3.1 Test Reports</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveMenu('invoices'); setIsMobileNavOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeMenu === 'invoices' ? 700 : 500,
                background: activeMenu === 'invoices' ? '#0052CC' : 'transparent',
                color: activeMenu === 'invoices' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <CreditCard size={16} />
              <span>Invoices &amp; E-Way Bills</span>
            </button>

            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 10px 2px' }}>
              PROJECT SETUP
            </span>

            <button
              type="button"
              onClick={() => { setActiveMenu('sites'); setIsMobileNavOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeMenu === 'sites' ? 700 : 500,
                background: activeMenu === 'sites' ? '#0052CC' : 'transparent',
                color: activeMenu === 'sites' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <MapPin size={16} />
              <span>Delivery Sites ({sites.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveMenu('team'); setIsMobileNavOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeMenu === 'team' ? 700 : 500,
                background: activeMenu === 'team' ? '#0052CC' : 'transparent',
                color: activeMenu === 'team' ? '#FFFFFF' : '#334155',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Users2 size={16} />
              <span>Procurement Team ({team.length})</span>
            </button>

            {/* Session Management */}
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
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
                  color: '#EF4444',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={14} />
                <span>Sign Out ({currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'Client'})</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* ============================================================== */}
        {/* RIGHT MAIN CONTENT CANVAS                                      */}
        {/* ============================================================== */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Command Bar */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '14px 18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px' }}>
              <Search size={16} color="#64748B" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, PO#, DIN 933, LR number..."
                style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#0F172A' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Live Dual Unit Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '3px 6px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Unit:</span>
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

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setIsNewRfqModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  background: '#0052CC',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Zap size={14} />
                <span>+ New Bulk RFQ</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: OVERVIEW DASHBOARD */}
          {activeMenu === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active Consignments</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0052CC', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {activeConsignmentsCount} In-Transit
                  </div>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>TCI Express &amp; VRL Transport</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active RFQ Quotes</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#FF6B00', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {pendingQuotesCount} Ready
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Steel Index Locked</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Weight Dispatched</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {globalUnit === 'PCS' ? `${(totalWeightDispatchedKg * 14.2).toFixed(0)} Pcs` : `${(totalWeightDispatchedKg / 1000).toFixed(2)} MT`}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>100% EN 10204 3.1 Traceable</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Procurement Volume</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {formatINR(totalSpentAmount)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>30 Days Net Terms</span>
                </div>
              </div>

              {/* Recent Orders Strip */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Latest Dispatches &amp; Lorry Receipts</h3>
                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>Track live shipment locations and view batch metallurgical sheets</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMenu('orders')}
                    style={{ fontSize: '12px', color: '#0052CC', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View All Orders <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        background: '#F8FAFC',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '13px', color: '#0F172A' }}>{order.orderNumber}</strong>
                          <span style={{
                            background: order.status === 'DELIVERED' ? '#ECFDF5' : order.status === 'IN_TRANSIT' ? '#EFF6FF' : '#FEF3C7',
                            color: order.status === 'DELIVERED' ? '#047857' : order.status === 'IN_TRANSIT' ? '#0052CC' : '#B45309',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 800
                          }}>
                            {order.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                          Carrier: <strong>{order.carrier}</strong> • LR #: <strong style={{ color: '#0052CC' }}>{order.trackingNumber}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                          {formatINR(order.netAmount)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {globalUnit === 'PCS' ? `${order.itemsCount || 2} SKUs` : `${order.totalWeightKg} Kg (${(order.totalWeightKg / 1000).toFixed(2)} MT)`}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setActiveMtcModal(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <FileDown size={14} color="#0052CC" />
                          <span>MTC 3.1</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveInvoiceModal(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <CreditCard size={14} color="#059669" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulk BOM Upload Callout */}
              <div style={{ background: 'linear-gradient(135deg, #0A2E4E 0%, #0052CC 100%)', color: '#FFFFFF', borderRadius: '12px', padding: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ maxWidth: '580px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>
                    <FileSpreadsheet size={13} color="#FF6B00" />
                    <span>HAVE AN EXCEL OR CSV BILL OF MATERIALS (BOM)?</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0' }}>Upload Your Fastener Schedule for Instant Slab Quotation</h3>
                  <p style={{ color: '#DBEAFE', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                    Drag &amp; drop standard spreadsheets. Our system parses DIN standards, diameter (M3–M64), and calculates total kilograms with up to 25% bulk slabs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMenu('bom-uploader')}
                  style={{
                    background: '#FF6B00',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Open BOM Tool
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: ACTIVE ORDERS & LIVE LR TRACKING */}
          {activeMenu === 'orders' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Active Purchase Orders &amp; Logistics Tracking</h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                  Track live carrier dockets, truck weighbridge gross weights, and download batch-traceable test certificates.
                </p>
              </div>

              {filteredOrders.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  No orders match your search query.
                </div>
              ) : (
                <>
                  {paginatedOrders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '18px',
                        background: '#F8FAFC'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 800, background: '#0F172A', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', marginRight: '8px', fontFamily: 'var(--font-mono)' }}>
                            {order.orderNumber}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>Booked on {order.date}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            background: order.status === 'DELIVERED' ? '#ECFDF5' : order.status === 'IN_TRANSIT' ? '#EFF6FF' : '#FEF3C7',
                            color: order.status === 'DELIVERED' ? '#047857' : order.status === 'IN_TRANSIT' ? '#0052CC' : '#B45309',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 800
                          }}>
                            {order.status}
                          </span>
                          <strong style={{ fontSize: '17px', color: '#0052CC', fontFamily: 'var(--font-mono)' }}>
                            {formatINR(order.netAmount)}
                          </strong>
                        </div>
                      </div>

                      {/* Milestone Tracker */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '8px',
                        margin: '14px 0 16px',
                        background: '#FFFFFF',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '11px', fontWeight: 700 }}>✓</div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>Confirmed</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '11px', fontWeight: 700 }}>✓</div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>Calibrated</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: order.status !== 'PROCESSING' ? '#10B981' : '#FF6B00', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '11px', fontWeight: 700 }}>
                            {order.status !== 'PROCESSING' ? '✓' : '3'}
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>Dispatched</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: order.status === 'DELIVERED' ? '#10B981' : order.status === 'IN_TRANSIT' ? '#0052CC' : '#E2E8F0', color: order.status === 'DELIVERED' || order.status === 'IN_TRANSIT' ? '#FFFFFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '11px', fontWeight: 700 }}>
                            {order.status === 'DELIVERED' ? '✓' : '4'}
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>In Transit</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: order.status === 'DELIVERED' ? '#10B981' : '#E2E8F0', color: order.status === 'DELIVERED' ? '#FFFFFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '11px', fontWeight: 700 }}>
                            {order.status === 'DELIVERED' ? '✓' : '5'}
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>Delivered</div>
                        </div>
                      </div>

                      {/* Shipment Details Matrix */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#FFFFFF', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                        <div>
                          <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>CARRIER / TRANSPORTER:</span>
                          <strong>{order.carrier}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>DOCKET / LR NUMBER:</span>
                          <strong style={{ color: '#0052CC' }}>{order.trackingNumber}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>TOTAL WEIGHT:</span>
                          <strong>
                            {globalUnit === 'PCS' ? `${(order.totalWeightKg * 14.2).toFixed(0)} Pcs` : `${order.totalWeightKg} Kg (${(order.totalWeightKg / 1000).toFixed(2)} MT)`}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setActiveMtcModal(order)}
                            style={{ color: '#0052CC', fontWeight: 700, border: '1px solid #BFDBFE', background: '#EFF6FF', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                          >
                            <FileDown size={12} /> View MTC
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveInvoiceModal(order)}
                            style={{ color: '#059669', fontWeight: 700, border: '1px solid #A7F3D0', background: '#ECFDF5', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                          >
                            <CreditCard size={12} /> Tax Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <TablePagination
                    currentPage={ordersPage}
                    totalItems={filteredOrders.length}
                    itemsPerPage={ordersPerPage}
                    onPageChange={setOrdersPage}
                    onItemsPerPageChange={setOrdersPerPage}
                    itemLabel="orders"
                    pageSizeOptions={[3, 5, 10, 20]}
                  />
                </>
              )}
            </div>
          )}

          {/* VIEW 3: BULK RFQs & FORMAL QUOTES */}
          {activeMenu === 'rfqs' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Bulk Quotations &amp; Price Approvals</h3>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                    Formal quotations issued by CBH sales desk. Prices are index-locked for 7 days against steel commodity fluctuation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewRfqModalOpen(true)}
                  style={{
                    background: '#0052CC',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={14} />
                  <span>Request New Quote</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1', color: '#334155' }}>
                      <th style={{ padding: '12px' }}>RFQ Reference</th>
                      <th style={{ padding: '12px' }}>Date</th>
                      <th style={{ padding: '12px' }}>Items</th>
                      <th style={{ padding: '12px' }}>Volume Slab</th>
                      <th style={{ padding: '12px' }}>Commercial Net</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                          No quotations found matching your search.
                        </td>
                      </tr>
                    ) : (
                      paginatedQuotes.map((q) => (
                        <tr key={q.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0F172A' }}>
                            {q.rfqNumber}
                          </td>
                          <td style={{ padding: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>{q.date}</td>
                          <td style={{ padding: '12px' }}>{q.itemsCount} SKUs ({q.totalWeightKg} Kg)</td>
                          <td style={{ padding: '12px', color: '#059669', fontWeight: 700 }}>
                            -{q.discountPct}% OEM Tier
                          </td>
                          <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0052CC' }}>
                            {formatINR(q.netTotal)}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              background: q.status === 'PO_ISSUED' ? '#ECFDF5' : q.status === 'QUOTED' ? '#EFF6FF' : '#FEF3C7',
                              color: q.status === 'PO_ISSUED' ? '#047857' : q.status === 'QUOTED' ? '#0052CC' : '#B45309',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 800
                            }}>
                              {q.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {q.status !== 'PO_ISSUED' ? (
                              <button
                                type="button"
                                onClick={() => handleAcceptQuote(q)}
                                style={{ background: '#0052CC', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Accept &amp; Order
                              </button>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>PO Confirmed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={rfqsPage}
                totalItems={filteredQuotes.length}
                itemsPerPage={rfqsPerPage}
                onPageChange={setRfqsPage}
                onItemsPerPageChange={setRfqsPerPage}
                itemLabel="quotations"
                pageSizeOptions={[3, 5, 10, 20]}
              />
            </div>
          )}

          {/* VIEW 4: BULK BOM CSV UPLOADER */}
          {activeMenu === 'bom-uploader' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Batch Bill of Materials (BOM) Uploader</h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                  Upload your procurement spreadsheet. Our algorithm parses DIN/ISO standards, diameters, and provides dual conversion between pieces and tonnage.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onClick={handleSimulateBOMUpload}
                style={{
                  border: '2px dashed #93C5FD',
                  borderRadius: '12px',
                  background: '#F0F9FF',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <UploadCloud size={44} color="#0052CC" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {isUploadingBOM ? 'Parsing Bill of Materials with Dual Weight Algorithms...' : 'Click to Upload BOM Spreadsheet or Drag & Drop'}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                  Supported Formats: .xlsx, .xls, .csv • Template columns: Standard, Diameter, Length, Grade, Quantity, Unit (PCS/KGS)
                </p>
              </div>

              {uploadSuccess && (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '14px', borderRadius: '8px', color: '#065F46', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <div style={{ fontSize: '13px' }}>
                    <strong>BOM Successfully Parsed!</strong> 18 Line Items matched • Total Calculated Weight: <strong>1,420 Kg (1.42 MT)</strong> • Volume Slab: <strong>25% Flat OFF</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: MTC 3.1 TEST REPORTS VAULT */}
          {activeMenu === 'certs' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Batch Metallurgical Test Certificates (EN 10204 3.1)</h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                  All shipments are etched with batch cast numbers. Download certified physical and chemical lab sheets.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredOrders.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                    No certificates matched your search criteria.
                  </div>
                ) : (
                  paginatedCerts.map((ord) => (
                    <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{ord.mtcCertNumber}</strong>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Linked PO: {ord.orderNumber} • Batch Heat #{ord.trackingNumber?.slice(-5) || '8829'} • High Tensile EN 10204
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveMtcModal(ord)}
                        style={{ background: '#0052CC', color: '#FFFFFF', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={13} /> View Certificate
                      </button>
                    </div>
                  ))
                )}
              </div>
              <TablePagination
                currentPage={certsPage}
                totalItems={filteredOrders.length}
                itemsPerPage={certsPerPage}
                onPageChange={setCertsPage}
                onItemsPerPageChange={setCertsPerPage}
                itemLabel="certificates"
                pageSizeOptions={[3, 5, 10, 20]}
              />
            </div>
          )}

          {/* VIEW 6: INVOICES & E-WAY BILLS */}
          {activeMenu === 'invoices' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>GST Tax Invoices &amp; E-Way Bills</h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                  HSN 7318 certified industrial tax invoices with input tax credit (ITC) compliance.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredOrders.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                    No invoices matched your search criteria.
                  </div>
                ) : (
                  paginatedInvoices.map((ord) => (
                    <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>INV-CBH-2025-{ord.id}</strong>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Ref Order: {ord.orderNumber} • HSN: 7318 (Fasteners 18% GST) • Total: {formatINR(ord.netAmount)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveInvoiceModal(ord)}
                        style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={13} color="#0052CC" /> View Tax Invoice
                      </button>
                    </div>
                  ))
                )}
              </div>
              <TablePagination
                currentPage={invoicesPage}
                totalItems={filteredOrders.length}
                itemsPerPage={invoicesPerPage}
                onPageChange={setInvoicesPage}
                onItemsPerPageChange={setInvoicesPerPage}
                itemLabel="tax invoices"
                pageSizeOptions={[3, 5, 10, 20]}
              />
            </div>
          )}

          {/* VIEW 7: DELIVERY SITES (B2B Multi-Site) */}
          {activeMenu === 'sites' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Enterprise Project Delivery Sites</h3>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                    Manage multiple jobsite unloading points across India for heavy consignment routing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewSiteModalOpen(true)}
                  style={{ background: '#0052CC', color: '#FFFFFF', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Add Project Site
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {sites.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', gridColumn: '1 / -1' }}>
                    No delivery sites configured.
                  </div>
                ) : (
                  paginatedSites.map((site) => (
                    <div key={site.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#F8FAFC', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '14px', color: '#0F172A' }}>{site.name}</strong>
                        <button
                          type="button"
                          onClick={() => handleDeleteSite(site.id)}
                          title="Remove project site"
                          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, margin: '0 0 10px 0' }}>{site.address}</p>
                      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px', fontSize: '11px' }}>
                        <div>Incharge: <strong>{site.incharge}</strong></div>
                        <div style={{ color: '#0052CC', fontFamily: 'var(--font-mono)' }}>{site.phone}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <TablePagination
                currentPage={sitesPage}
                totalItems={sites.length}
                itemsPerPage={sitesPerPage}
                onPageChange={setSitesPage}
                onItemsPerPageChange={setSitesPerPage}
                itemLabel="project sites"
                pageSizeOptions={[3, 6, 12, 24]}
              />
            </div>
          )}

          {/* VIEW 8: TEAM SUB-ACCOUNTS */}
          {activeMenu === 'team' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Procurement &amp; Site Team Permissions</h3>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                    Delegate access to site engineers for MTC downloading and purchase officers for PO approval.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewTeamModalOpen(true)}
                  style={{ background: '#0052CC', color: '#FFFFFF', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Add Team Member
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1', color: '#334155' }}>
                      <th style={{ padding: '12px' }}>Name &amp; Role</th>
                      <th style={{ padding: '12px' }}>Email</th>
                      <th style={{ padding: '12px' }}>Permission Level</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                          No team members registered.
                        </td>
                      </tr>
                    ) : (
                      paginatedTeam.map((m) => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '12px' }}>
                            <strong>{m.name}</strong>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{m.role}</div>
                          </td>
                          <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: '#0052CC' }}>{m.email}</td>
                          <td style={{ padding: '12px' }}>{m.access}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                              {m.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteTeam(m.id)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                              title="Revoke access"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={teamPage}
                totalItems={team.length}
                itemsPerPage={teamPerPage}
                onPageChange={setTeamPage}
                onItemsPerPageChange={setTeamPerPage}
                itemLabel="team members"
                pageSizeOptions={[3, 5, 10, 20]}
              />
            </div>
          )}

        </main>
      </div>

      {/* ================================================================= */}
      {/* MODAL 1: MTC 3.1 METALLURGICAL TEST CERTIFICATE MODAL             */}
      {/* ================================================================= */}
      {activeMtcModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            borderTop: '6px solid #0052CC'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0052CC', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  EN 10204 3.1 INSPECTION CERTIFICATE
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '4px 0 0' }}>
                  Mill Test Certificate (MTC)
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                  Cert #{activeMtcModal.mtcCertNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveMtcModal(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Certificate Header details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
              <div><strong>Buyer:</strong> {activeMtcModal.companyName}</div>
              <div><strong>PO Ref:</strong> {activeMtcModal.orderNumber}</div>
              <div><strong>Standard:</strong> DIN 933 / ISO 4017</div>
              <div><strong>Material Grade:</strong> High Tensile Grade 8.8</div>
              <div><strong>Heat Batch No:</strong> HT-9821-LDH</div>
              <div><strong>Inspection Date:</strong> {activeMtcModal.date}</div>
            </div>

            {/* Chemical Composition Table */}
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              1. Chemical Analysis (% by Weight)
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '18px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '8px' }}>Element</th>
                    <th style={{ padding: '8px' }}>Carbon (C)</th>
                    <th style={{ padding: '8px' }}>Manganese (Mn)</th>
                    <th style={{ padding: '8px' }}>Silicon (Si)</th>
                    <th style={{ padding: '8px' }}>Phosphorus (P)</th>
                    <th style={{ padding: '8px' }}>Sulfur (S)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>Actual %</td>
                    <td style={{ padding: '8px', color: '#0052CC', fontWeight: 700 }}>0.36%</td>
                    <td style={{ padding: '8px', color: '#0052CC', fontWeight: 700 }}>0.78%</td>
                    <td style={{ padding: '8px', color: '#0052CC', fontWeight: 700 }}>0.24%</td>
                    <td style={{ padding: '8px', color: '#0052CC', fontWeight: 700 }}>0.018%</td>
                    <td style={{ padding: '8px', color: '#0052CC', fontWeight: 700 }}>0.015%</td>
                  </tr>
                  <tr style={{ color: '#64748B', fontSize: '11px' }}>
                    <td style={{ padding: '8px' }}>Spec Limit</td>
                    <td style={{ padding: '8px' }}>0.25 - 0.40</td>
                    <td style={{ padding: '8px' }}>Min 0.60</td>
                    <td style={{ padding: '8px' }}>Max 0.35</td>
                    <td style={{ padding: '8px' }}>Max 0.025</td>
                    <td style={{ padding: '8px' }}>Max 0.025</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mechanical Properties Table */}
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              2. Mechanical Test Calibration
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '18px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '8px' }}>Tensile Strength</th>
                    <th style={{ padding: '8px' }}>Yield Stress</th>
                    <th style={{ padding: '8px' }}>Elongation (A5)</th>
                    <th style={{ padding: '8px' }}>Hardness (Rockwell C)</th>
                    <th style={{ padding: '8px' }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>835 MPa</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>660 MPa</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>14.2%</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>28 HRC</td>
                    <td style={{ padding: '8px', color: '#059669', fontWeight: 800 }}>PASS (PASSED)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Seal & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                <span>NABL Accredited Quality Works • Metallurgist Certified</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                style={{
                  background: '#0052CC',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={15} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: GST TAX INVOICE MODAL                                    */}
      {/* ================================================================= */}
      {activeInvoiceModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            borderTop: '6px solid #059669'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ORIGINAL FOR RECIPIENT • TAX INVOICE
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '4px 0 0' }}>
                  CBH Fasteners Tech Pvt. Ltd.
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  GSTIN: 03AABCC1234F1Z8 • Miller Ganj, Ludhiana, Punjab
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
              <div><strong>Invoice No:</strong> INV-CBH-2025-{activeInvoiceModal.id}</div>
              <div><strong>Invoice Date:</strong> {activeInvoiceModal.date}</div>
              <div><strong>Billed To:</strong> {activeInvoiceModal.companyName}</div>
              <div><strong>Buyer GSTIN:</strong> {currentUser?.gstin || '29AABCA1234F1Z5'}</div>
              <div><strong>Transport Docket:</strong> {activeInvoiceModal.trackingNumber} ({activeInvoiceModal.carrier})</div>
              <div><strong>HSN Code:</strong> 7318 (Threaded Fasteners)</div>
            </div>

            {/* Financial Summary */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', fontSize: '12px', borderBottom: '1px solid #E2E8F0' }}>
                <span>Taxable Fastener Consignment Subtotal:</span>
                <strong>{formatINR(activeInvoiceModal.netAmount * 0.8475)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', fontSize: '12px', borderBottom: '1px solid #E2E8F0' }}>
                <span>Integrated GST (IGST 18%):</span>
                <strong>{formatINR(activeInvoiceModal.netAmount * 0.1525)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#ECFDF5', fontSize: '14px', fontWeight: 800, color: '#065F46' }}>
                <span>Total Invoice Amount (INR):</span>
                <span>{formatINR(activeInvoiceModal.netAmount)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Eligible for 100% GSTR-2B Input Tax Credit</span>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ background: '#059669', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={15} /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 3: NEW BULK RFQ CREATION MODAL                              */}
      {/* ================================================================= */}
      {isNewRfqModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '26px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            borderTop: '6px solid #0052CC'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Submit Formal Bulk RFQ
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                  Direct factory-gate pricing with steel commodity price index lock.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRfqModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateRfq} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Fastener DIN / ISO Standard
                </label>
                <select
                  value={newRfqForm.standard}
                  onChange={(e) => setNewRfqForm({ ...newRfqForm, standard: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value="DIN 933 High Tensile Hex Set Screws">DIN 933 High Tensile Hex Set Screws (Full Thread)</option>
                  <option value="DIN 912 Hexagon Socket Head Cap">DIN 912 Hexagon Socket Head Cap Screws</option>
                  <option value="DIN 934 Heavy Hex Nuts">DIN 934 Heavy Hex Structural Nuts</option>
                  <option value="ASTM A193 B7 Heavy Continuous Studs">ASTM A193 B7 High-Temp Continuous Thread Studs</option>
                  <option value="Mechanical Wedge Anchors">Heavy Duty Mechanical Wedge Anchors (Zinc Flake)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Specification / Diameter / Length
                </label>
                <input
                  type="text"
                  required
                  value={newRfqForm.spec}
                  onChange={(e) => setNewRfqForm({ ...newRfqForm, spec: e.target.value })}
                  placeholder="e.g. M16 x 60mm (Grade 8.8)"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Required Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newRfqForm.quantity}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Unit
                  </label>
                  <select
                    value={newRfqForm.unit}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, unit: e.target.value as GlobalUnit })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="KGS">KGS (Weight)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Target Delivery Project Site
                </label>
                <select
                  value={newRfqForm.deliverySite}
                  onChange={(e) => setNewRfqForm({ ...newRfqForm, deliverySite: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Special Notes &amp; MTC Calibration
                </label>
                <textarea
                  rows={2}
                  value={newRfqForm.notes}
                  onChange={(e) => setNewRfqForm({ ...newRfqForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewRfqModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '6px', border: 'none', background: '#0052CC', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Submit RFQ to CBH Sales Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 4: NEW DELIVERY SITE MODAL                                  */}
      {/* ================================================================= */}
      {isNewSiteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
              Register Enterprise Project Site
            </h3>
            <form onSubmit={handleAddSite} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Project Site Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai Coastal Road Package 2"
                  value={newSiteForm.name}
                  onChange={(e) => setNewSiteForm({ ...newSiteForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Unloading Address &amp; Pincode</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Full delivery destination for freight carrier dockets"
                  value={newSiteForm.address}
                  onChange={(e) => setNewSiteForm({ ...newSiteForm, address: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Site In-Charge</label>
                  <input
                    type="text"
                    placeholder="e.g. R. K. Nair"
                    value={newSiteForm.incharge}
                    onChange={(e) => setNewSiteForm({ ...newSiteForm, incharge: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98880 21000"
                    value={newSiteForm.phone}
                    onChange={(e) => setNewSiteForm({ ...newSiteForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewSiteModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0052CC', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Project Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 5: NEW TEAM MEMBER MODAL                                    */}
      {/* ================================================================= */}
      {isNewTeamModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
              Invite Procurement Team Member
            </h3>
            <form onSubmit={handleAddTeam} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Kapoor"
                  value={newTeamForm.name}
                  onChange={(e) => setNewTeamForm({ ...newTeamForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Official Company Email</label>
                <input
                  type="email"
                  required
                  placeholder="amit.k@apexinfra.in"
                  value={newTeamForm.email}
                  onChange={(e) => setNewTeamForm({ ...newTeamForm, email: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Role / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Site QA Engineer"
                    value={newTeamForm.role}
                    onChange={(e) => setNewTeamForm({ ...newTeamForm, role: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Permission Level</label>
                  <select
                    value={newTeamForm.access}
                    onChange={(e) => setNewTeamForm({ ...newTeamForm, access: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="Inspection & MTC Download">Inspection &amp; MTC Only</option>
                    <option value="RFQ Request & Quotes">RFQ &amp; Quotes</option>
                    <option value="Full PO & Credit Admin">Full PO &amp; Credit Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewTeamModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0052CC', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Invite Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={() => {}}
        onRemoveItem={() => {}}
      />
    </div>
  );
}
