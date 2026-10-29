'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TablePagination from '@/components/common/TablePagination';
import { Product } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link2,
  Key,
  Database,
  ArrowRight,
  Copy,
  Server,
  Zap,
  ExternalLink,
  ShieldCheck,
  Boxes,
  Eye,
  EyeOff,
  Flame,
  Clock,
  Trash2,
  Loader2,
  AlertTriangle,
  X
} from 'lucide-react';

interface AdminErpNextSectionProps {
  products: Product[];
  onProductsSync: (newProducts: Product[]) => void;
  onDeleteProduct?: (id: number) => Promise<void>;
  onBulkDeleteProducts?: (ids: number[]) => Promise<void>;
  showToast: (msg: string) => void;
}

export default function AdminErpNextSection({
  products,
  onProductsSync,
  onDeleteProduct,
  onBulkDeleteProducts,
  showToast,
}: AdminErpNextSectionProps) {
  // Configuration State
  const [erpUrl, setErpUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [priceList, setPriceList] = useState('Standard Selling');
  const [warehouse, setWarehouse] = useState('Stores - CBH');
  const [autoSync, setAutoSync] = useState(true);

  // Status & Telemetry
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'STANDBY' | 'ERROR' | 'SYNCING'>('STANDBY');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [syncedCount, setSyncedCount] = useState(0);
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);

  // UI state
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Webhook URL
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/erpnext/webhook`
    : 'https://cbh.store/api/erpnext/webhook';

  // Load active ERPNext configuration on mount
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setIsLoadingConfig(true);
      const res = await fetch('/api/erpnext/status');
      const data = await res.json();
      if (data.success && data.data) {
        setErpUrl(data.data.erpnextUrl || '');
        setApiKey(data.data.apiKey || '');
        setPriceList(data.data.defaultPriceList || 'Standard Selling');
        setWarehouse(data.data.defaultWarehouse || 'Stores - CBH');
        setAutoSync(data.data.autoSync ?? true);
        setConnectionStatus(data.data.lastSyncStatus || 'STANDBY');
        setLastSyncTime(data.data.lastSyncTime || null);
        setLastError(data.data.lastError || null);
        setSyncedCount(data.data.syncedItemsCount || products.length);
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // Test ERPNext Connection
  const handleTestConnection = async () => {
    if (!erpUrl || !apiKey || (!apiSecret && !testResult)) {
      showToast('Please provide ERPNext URL, API Key, and Secret to test.');
      return;
    }

    try {
      setIsTestingConnection(true);
      setTestResult(null);

      const res = await fetch('/api/erpnext/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          erpnextUrl: erpUrl,
          apiKey,
          apiSecret,
          testOnly: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConnectionStatus('CONNECTED');
        setAuthenticatedUser(data.user || 'Authenticated API User');
        setTestResult({
          success: true,
          message: data.message || `Connected to ERPNext as ${data.user}`,
        });
        showToast('ERPNext connection test succeeded!');
      } else {
        setConnectionStatus('ERROR');
        setTestResult({
          success: false,
          message: data.error || 'Connection failed',
        });
        showToast('Connection failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      setConnectionStatus('ERROR');
      setTestResult({
        success: false,
        message: err.message || 'Network error connecting to ERPNext API',
      });
      showToast('Test failed: Network error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Save ERPNext Configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/erpnext/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          erpnextUrl: erpUrl,
          apiKey,
          apiSecret,
          defaultPriceList: priceList,
          defaultWarehouse: warehouse,
          autoSync,
          testOnly: false,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConnectionStatus('CONNECTED');
        showToast('ERPNext configuration saved and verified!');
      } else {
        showToast(data.message || 'Saved with connection warning.');
      }
    } catch (err: any) {
      showToast('Error saving configuration: ' + err.message);
    }
  };

  // Sync Products & Stock from ERPNext
  const handleSyncProducts = async (simulateDemo = false) => {
    try {
      setIsSyncing(true);
      setConnectionStatus('SYNCING');

      const res = await fetch('/api/erpnext/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulateDemo }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setConnectionStatus('CONNECTED');
        setLastSyncTime(new Date().toISOString());
        setSyncedCount(data.count || data.data.length);
        onProductsSync(data.data);
        showToast(data.message || `Successfully synced ${data.count} items from ERPNext!`);
      } else {
        setConnectionStatus(erpUrl ? 'ERROR' : 'STANDBY');
        showToast(data.error || 'Sync failed.');
      }
    } catch (err: any) {
      setConnectionStatus('ERROR');
      showToast('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(true);
    showToast('Webhook URL copied to clipboard!');
    setTimeout(() => setCopiedWebhook(false), 3000);
  };

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.standard.toLowerCase().includes(q) ||
        p.grade.toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Selection & Deletion State
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [deleteTargetProduct, setDeleteTargetProduct] = useState<Product | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelectProduct = (id: number) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllPageSelected = useMemo(() => {
    if (paginatedProducts.length === 0) return false;
    return paginatedProducts.every((p) => selectedProductIds.has(p.id));
  }, [paginatedProducts, selectedProductIds]);

  const toggleSelectAllOnPage = () => {
    if (isAllPageSelected) {
      setSelectedProductIds((prev) => {
        const next = new Set(prev);
        paginatedProducts.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedProductIds((prev) => {
        const next = new Set(prev);
        paginatedProducts.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const selectAllFiltered = () => {
    const next = new Set<number>();
    filteredProducts.forEach((p) => next.add(p.id));
    setSelectedProductIds(next);
  };

  const selectAllProducts = () => {
    const next = new Set<number>();
    products.forEach((p) => next.add(p.id));
    setSelectedProductIds(next);
  };

  const clearSelection = () => {
    setSelectedProductIds(new Set());
  };

  const executeDeleteSingle = async (p: Product) => {
    try {
      setIsDeleting(true);
      if (onDeleteProduct) {
        await onDeleteProduct(p.id);
      } else {
        const res = await fetch(`/api/products?id=${p.id}`, { method: 'DELETE' });
        const data = await res.json();
        showToast(data.message || `Deleted SKU ${p.sku} successfully.`);
      }
      setSelectedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
      setDeleteTargetProduct(null);
    } catch (err: any) {
      showToast(`Error deleting SKU: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedProductIds.size === 0) return;
    const ids = Array.from(selectedProductIds);
    try {
      setIsDeleting(true);
      if (onBulkDeleteProducts) {
        await onBulkDeleteProducts(ids);
      } else {
        const isAll = ids.length >= products.length;
        const res = await fetch('/api/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isAll ? { all: true } : { ids }),
        });
        const data = await res.json();
        showToast(data.message || `Deleted ${ids.length} items successfully.`);
      }
      setSelectedProductIds(new Set());
      setIsBulkDeleteModalOpen(false);
    } catch (err: any) {
      showToast(`Error deleting items: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ============================================================== */}
      {/* TOP INTEGRATION STATUS BANNER                                  */}
      {/* ============================================================== */}
      <div style={{
        background: connectionStatus === 'CONNECTED' 
          ? 'linear-gradient(135deg, #0A2E4E 0%, #0052CC 100%)' 
          : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
        color: '#FFFFFF',
        borderRadius: '14px',
        padding: '24px',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, marginBottom: '12px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: connectionStatus === 'CONNECTED' ? '#10B981' : connectionStatus === 'SYNCING' ? '#F59E0B' : '#EF4444',
              boxShadow: connectionStatus === 'CONNECTED' ? '0 0 8px #10B981' : 'none'
            }} />
            <span>
              {connectionStatus === 'CONNECTED' ? 'ERPNEXT LIVE CONNECTED' : connectionStatus === 'SYNCING' ? 'SYNCING DATA IN PROGRESS...' : connectionStatus === 'ERROR' ? 'ERPNEXT CONNECTION ERROR' : 'STANDBY (AWAITING CREDENTIALS)'}
            </span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
            ERPNext Dynamic Product &amp; Stock Hub
          </h2>
          <p style={{ color: '#DBEAFE', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
            Connect CBH digital procurement with your ERPNext server. Synchronize Item Masters, live warehouse Bin stocks, Price Lists, and receive instant Webhooks whenever products change.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
          <button
            type="button"
            onClick={() => handleSyncProducts(false)}
            disabled={isSyncing}
            style={{
              background: '#FF6B00',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(255, 107, 0, 0.35)',
              opacity: isSyncing ? 0.7 : 1
            }}
          >
            <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'Pulling from ERPNext...' : 'Sync Live Products Now'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSyncProducts(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Zap size={13} color="#FBBF24" />
            <span>Load Demo ERPNext Feed</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TELEMETRY STATS CARDS                                          */}
      {/* ============================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>ERP Server Host</span>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {erpUrl || 'Not Configured Yet'}
          </div>
          <span style={{ fontSize: '11px', color: authenticatedUser ? '#059669' : '#64748B', fontWeight: 600 }}>
            {authenticatedUser ? `Auth: ${authenticatedUser}` : 'Token Authorization'}
          </span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active Products / SKUs</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0052CC', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {products.length} SKUs
          </div>
          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
            100% Dynamic Dual-Weight Matrix
          </span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Default Price List</span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {priceList}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Warehouse: {warehouse}
          </span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Last Synchronized</span>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '6px' }}>
            {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            {lastSyncTime ? new Date(lastSyncTime).toLocaleDateString() : 'Manual or Webhook trigger'}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2-COLUMN SETUP: CREDENTIALS & WEBHOOKS                         */}
      {/* ============================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* PANEL 1: CREDENTIALS & API CONNECTION */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={18} color="#0052CC" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                ERPNext API Credentials
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Generate Token API Key &amp; Secret in ERPNext &gt; Users &gt; API Access
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                ERPNext Server URL:
              </label>
              <input
                type="url"
                value={erpUrl}
                onChange={(e) => setErpUrl(e.target.value)}
                placeholder="https://yourcompany.frappe.cloud or https://erp.yourdomain.com"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  API Key:
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g. 7f12a8bc93e4"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    API Secret:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0052CC', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showSecret ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Selling Price List:
                </label>
                <input
                  type="text"
                  value={priceList}
                  onChange={(e) => setPriceList(e.target.value)}
                  placeholder="Standard Selling"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Default Warehouse:
                </label>
                <input
                  type="text"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  placeholder="Stores - CBH"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {testResult && (
              <div style={{
                background: testResult.success ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${testResult.success ? '#A7F3D0' : '#FECACA'}`,
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '12px',
                color: testResult.success ? '#065F46' : '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {testResult.success ? <CheckCircle2 size={16} color="#059669" /> : <AlertCircle size={16} color="#DC2626" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                style={{
                  flex: 1,
                  background: '#F1F5F9',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  padding: '9px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: isTestingConnection ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={13} className={isTestingConnection ? 'spin' : ''} />
                <span>{isTestingConnection ? 'Pinging ERPNext...' : 'Test Connection'}</span>
              </button>

              <button
                type="submit"
                style={{
                  flex: 1,
                  background: '#0052CC',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Save Credentials
              </button>
            </div>
          </form>
        </div>

        {/* PANEL 2: REAL-TIME WEBHOOK INSTRUCTIONS */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#D97706" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Real-Time 2-Way Webhook
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Automatic instant sync whenever items or stock change in ERPNext
              </p>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: '0 0 12px 0' }}>
            Configure a Webhook in your client&apos;s ERPNext instance so your digital catalog stays updated in real time without manual sync:
          </p>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>YOUR WEBHOOK LISTENER URL:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <code style={{ flex: 1, fontSize: '12px', color: '#0052CC', background: '#FFFFFF', padding: '6px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {webhookUrl}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(webhookUrl)}
                style={{
                  background: copiedWebhook ? '#ECFDF5' : '#FFFFFF',
                  color: copiedWebhook ? '#059669' : '#0F172A',
                  border: `1px solid ${copiedWebhook ? '#A7F3D0' : '#CBD5E1'}`,
                  borderRadius: '4px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copiedWebhook ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <strong style={{ color: '#0052CC' }}>1.</strong>
              <span>In ERPNext, search for <strong>&quot;Webhook&quot;</strong> &rarr; Click <strong>&quot;+ Add Webhook&quot;</strong>.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <strong style={{ color: '#0052CC' }}>2.</strong>
              <span>DocType: <strong>Item</strong> | Doc Event: <strong>after_insert, on_update</strong>.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <strong style={{ color: '#0052CC' }}>3.</strong>
              <span>Paste Request URL above | Method: <strong>POST</strong> | Click <strong>Save</strong>.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <strong style={{ color: '#0052CC' }}>4.</strong>
              <span>Repeat for DocType <strong>Bin</strong> to enable real-time warehouse stock level sync!</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* LIVE SYNCED CATALOG PREVIEW TABLE                              */}
      {/* ============================================================== */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Live Synchronized Fastener Items ({products.length})
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              Dynamic catalog feeds automatically displayed on customer portal, categories, and bulk RFQ engine
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search synced SKU / Standard..."
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                width: '240px'
              }}
            />
          </div>
        </div>

        {/* Batch Action Bar */}
        {selectedProductIds.size > 0 && (
          <div
            style={{
              marginBottom: '14px',
              background: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#0052CC',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {selectedProductIds.size} Selected
              </span>
              <span style={{ fontSize: '12px', color: '#E2E8F0', fontWeight: 600 }}>
                {selectedProductIds.size === 1
                  ? '1 item selected'
                  : `${selectedProductIds.size} items selected`}
              </span>
              {selectedProductIds.size < filteredProducts.length && (
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#60A5FA',
                    fontSize: '12px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  Select all {filteredProducts.length} filtered items
                </button>
              )}
              {selectedProductIds.size < products.length && filteredProducts.length < products.length && (
                <button
                  type="button"
                  onClick={selectAllProducts}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#93C5FD',
                    fontSize: '12px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  Select all {products.length} in catalog
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={clearSelection}
                style={{
                  background: '#1E293B',
                  border: '1px solid #475569',
                  color: '#CBD5E1',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                style={{
                  background: '#DC2626',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                }}
              >
                <Trash2 size={13} />
                <span>
                  {selectedProductIds.size === products.length && products.length > 0
                    ? `Delete Entire Catalog (${products.length} SKUs)`
                    : `Delete Selected (${selectedProductIds.size})`}
                </span>
              </button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1', color: '#334155' }}>
                <th style={{ width: '38px', textAlign: 'center', padding: '10px 8px' }}>
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={toggleSelectAllOnPage}
                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    title={isAllPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
                  />
                </th>
                <th style={{ padding: '10px 12px' }}>SKU Code</th>
                <th style={{ padding: '10px 12px' }}>Item Name</th>
                <th style={{ padding: '10px 12px' }}>Standard &amp; Grade</th>
                <th style={{ padding: '10px 12px' }}>Weight / Pc</th>
                <th style={{ padding: '10px 12px' }}>Rate (₹ / Pc)</th>
                <th style={{ padding: '10px 12px' }}>Rate (₹ / Kg)</th>
                <th style={{ padding: '10px 12px' }}>Stock Balance</th>
                <th style={{ padding: '10px 12px' }}>Source Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', width: '70px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                    {products.length === 0
                      ? 'Catalog is currently empty (0 items).'
                      : `No synchronized fastener items match "${searchTerm}".`}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #E2E8F0',
                      background: selectedProductIds.has(p.id) ? '#EFF6FF' : undefined,
                    }}
                  >
                    <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(p.id)}
                        onChange={() => toggleSelectProduct(p.id)}
                        style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                        title="Select item"
                      />
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0052CC' }}>
                      {p.sku}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>
                      <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                        {p.standard}
                      </span>
                      <span style={{ marginLeft: '6px', color: '#059669', fontWeight: 700 }}>
                        Gr {p.grade}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>
                      {p.weightPerPcKg} Kg
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0F172A' }}>
                      ₹{p.pricePerPiece.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#059669' }}>
                      ₹{p.pricePerKg.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>
                      <span style={{
                        color: p.stockPcs > 10000 ? '#059669' : p.stockPcs > 0 ? '#D97706' : '#DC2626',
                        fontWeight: 800
                      }}>
                        {p.stockPcs.toLocaleString()} Pcs
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: '#ECFDF5',
                        color: '#047857',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ShieldCheck size={11} />
                        <span>ERP Dynamic</span>
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetProduct(p)}
                        title={`Delete SKU ${p.sku}`}
                        style={{
                          background: '#FEE2E2',
                          border: '1px solid #FECACA',
                          color: '#DC2626',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          pageSizeOptions={[10, 20, 50, 100]}
          itemLabel="synced items"
        />
      </div>

      {/* SINGLE ITEM DELETE CONFIRMATION MODAL */}
      {deleteTargetProduct && (
        <div
          className="modal-overlay active"
          onClick={() => {
            if (!isDeleting) setDeleteTargetProduct(null);
          }}
        >
          <div
            className="modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', maxWidth: '440px', width: '95%' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: '#0F172A' }}>
                Delete Synced Fastener SKU?
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px' }}>
                Are you sure you want to delete this fastener item from the live synchronized catalog and database?
              </p>
              <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                <strong style={{ color: '#0052CC', fontFamily: 'var(--font-mono)' }}>{deleteTargetProduct.sku}</strong>
                <div style={{ color: '#334155', marginTop: '4px' }}>{deleteTargetProduct.name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => setDeleteTargetProduct(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{
                  flex: 1,
                  background: '#DC2626',
                  borderColor: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={() => executeDeleteSingle(deleteTargetProduct)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete SKU</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div
          className="modal-overlay active"
          onClick={() => {
            if (!isDeleting) setIsBulkDeleteModalOpen(false);
          }}
        >
          <div
            className="modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', maxWidth: '480px', width: '95%' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: '#0F172A' }}>
                {selectedProductIds.size === products.length && products.length > 0
                  ? `Delete Entire Catalog (${products.length} SKUs)?`
                  : `Delete ${selectedProductIds.size} Selected Items?`}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px' }}>
                {selectedProductIds.size === products.length && products.length > 0
                  ? 'CAUTION: This will delete all products in the database and catalog. The inventory will become empty.'
                  : `Are you sure you want to permanently delete these ${selectedProductIds.size} items from the central database and synchronized catalog?`}
              </p>

              {/* Preview chips */}
              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '8px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  justifyContent: 'center',
                }}
              >
                {Array.from(selectedProductIds).slice(0, 12).map((id) => {
                  const p = products.find((item) => item.id === id);
                  return (
                    <span
                      key={id}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: '#334155',
                      }}
                    >
                      {p?.sku || `#${id}`}
                    </span>
                  );
                })}
                {selectedProductIds.size > 12 && (
                  <span style={{ fontSize: '11px', color: '#64748B', alignSelf: 'center', fontWeight: 600 }}>
                    + {selectedProductIds.size - 12} more
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{
                  flex: 1,
                  background: '#DC2626',
                  borderColor: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={executeBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete {selectedProductIds.size} SKUs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
