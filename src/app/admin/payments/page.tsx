'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import TablePagination from '@/components/common/TablePagination';
import {
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Zap,
  Lock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Clock
} from 'lucide-react';
import { formatINR } from '@/lib/rfq-calculator';
import { PhonePeConfig, PhonePeTransactionRecord } from '@/lib/phonepe';

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [config, setConfig] = useState<PhonePeConfig>({
    merchantId: 'PGTESTPAYUAT',
    saltKey: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
    saltIndex: '1',
    environment: 'SANDBOX',
    enableSimulator: true,
    defaultCallbackUrl: 'https://cbh.store/api/payment/phonepe/callback',
    defaultRedirectUrl: 'http://localhost:3000/order-success',
    autoConfirmOrders: true,
  });

  const [transactions, setTransactions] = useState<PhonePeTransactionRecord[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return transactions.slice(start, start + itemsPerPage);
  }, [transactions, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [confRes, txnRes] = await Promise.all([
        fetch('/api/payment/phonepe/config').then((r) => r.json()),
        fetch('/api/payment/phonepe/status').then((r) => r.json()),
      ]);

      if (confRes.success && confRes.data) {
        setConfig(confRes.data);
      }
      if (txnRes.success && txnRes.data) {
        setTransactions(txnRes.data);
      }
    } catch {
      showNotification('Failed to load PhonePe configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/payment/phonepe/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('PhonePe Gateway settings saved successfully!');
        if (data.data) setConfig((prev) => ({ ...prev, ...data.data }));
      } else {
        showNotification(data.error || 'Failed to save settings', 'error');
      }
    } catch {
      showNotification('Error saving configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestPing = async () => {
    try {
      setTesting(true);
      const res = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100, // ₹1 test transaction
          customerName: 'CBH Admin Test Ping',
          customerPhone: '9888021000',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(
          data.isSimulated
            ? 'PhonePe Sandbox Verified (Simulation Mode Active)'
            : 'PhonePe PG API Connected Successfully!'
        );
        fetchData();
      } else {
        showNotification(data.error || 'Connection test failed', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Connection test failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const totalVolume = transactions
    .filter((t) => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#D8DFE7] p-12 text-center shadow-sm">
        <RefreshCw className="w-8 h-8 text-[#5f259f] animate-spin mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#0F172A]">Loading PhonePe Gateway Terminal...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Strip */}
      <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              PhonePe Payment Gateway Console
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                config.environment === 'PRODUCTION'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-purple-50 text-[#5f259f] border-purple-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#5f259f] animate-pulse" />
              <span>{config.environment} MODE</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            RBI-authorized digital payment settlement for UPI, Google Pay, PhonePe UPI, Cards, and NetBanking with automated order confirmation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestPing}
            disabled={testing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Zap size={14} className="text-[#5f259f]" />
            <span>{testing ? 'Pinging Gateway...' : 'Test PG Ping (₹1.00)'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-5 py-2.5 bg-[#5f259f] hover:bg-[#4a1c7d] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save PG Settings'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Settled Volume</span>
          <div className="text-2xl font-black text-[#0F172A] font-mono mt-1">{formatINR(totalVolume)}</div>
          <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Real-time PhonePe Settlement</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Transactions</span>
          <div className="text-2xl font-black text-[#5f259f] font-mono mt-1">{transactions.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-2">
            {transactions.filter((t) => t.status === 'SUCCESS').length} Successful Dispatches
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Merchant ID</span>
          <div className="text-xl font-black text-[#0F172A] font-mono mt-1">{config.merchantId}</div>
          <div className="text-xs text-slate-500 font-medium mt-2">Salt Index: {config.saltIndex}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Public Checkout</span>
          <div className="text-xl font-black text-[#0052CC] mt-1">Ready</div>
          <Link href="/checkout" target="_blank" className="text-xs text-[#0052CC] font-bold mt-2 inline-flex items-center gap-1 hover:underline">
            Test Storefront Checkout <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-base font-black text-[#0F172A]">API Credentials &amp; Key Vault</h3>
            <p className="text-xs text-slate-500">
              Configure your official PhonePe Merchant ID, SHA256 Salt Key, and Salt Index from the PhonePe Merchant Dashboard.
            </p>
          </div>
          <a
            href="https://merchant.phonepe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:text-black flex items-center gap-1"
          >
            <span>PhonePe Merchant Dashboard</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Environment Mode</label>
            <select
              value={config.environment}
              onChange={(e: any) => setConfig({ ...config, environment: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#5f259f]"
            >
              <option value="SANDBOX">SANDBOX (UAT Testing - Safe for Demos)</option>
              <option value="PRODUCTION">PRODUCTION (Live Hermes - Real Banking Settlement)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Merchant ID</label>
            <input
              type="text"
              value={config.merchantId}
              onChange={(e) => setConfig({ ...config, merchantId: e.target.value })}
              placeholder="PGTESTPAYUAT"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:border-[#5f259f]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#0F172A]">Salt Key (AES / SHA-256 Secret)</label>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px]"
              >
                {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                <span>{showSecret ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>
            <input
              type={showSecret ? 'text' : 'password'}
              value={config.saltKey}
              onChange={(e) => setConfig({ ...config, saltKey: e.target.value })}
              placeholder="099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#5f259f]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Salt Key Index</label>
            <input
              type="text"
              value={config.saltIndex}
              onChange={(e) => setConfig({ ...config, saltIndex: e.target.value })}
              placeholder="1"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#5f259f]"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <label className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
            <div>
              <span>Enable Sandbox Simulator</span>
              <p className="text-[11px] text-slate-500 font-normal">
                Allows instant end-to-end payment simulation when testing on localhost.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.enableSimulator}
              onChange={(e) => setConfig({ ...config, enableSimulator: e.target.checked })}
              className="w-4 h-4 text-[#5f259f] rounded"
            />
          </label>

          <label className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
            <div>
              <span>Auto-Confirm Orders Upon S2S Callback</span>
              <p className="text-[11px] text-slate-500 font-normal">
                Automatically transition order to &apos;CONFIRMED&apos; when PhonePe webhook fires.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.autoConfirmOrders}
              onChange={(e) => setConfig({ ...config, autoConfirmOrders: e.target.checked })}
              className="w-4 h-4 text-[#5f259f] rounded"
            />
          </label>
        </div>

        {/* Webhook Endpoint Strip */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider text-slate-500">
            S2S Server Webhook Endpoint
          </h4>
          <p className="text-[11px] text-slate-500">
            Paste this URL into your PhonePe Merchant Portal under Developer Settings ➔ Webhooks:
          </p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 text-white font-mono text-xs">
            <span className="flex-1 truncate text-emerald-400">
              {config.defaultCallbackUrl}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(config.defaultCallbackUrl, 'webhook')}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1"
            >
              {copiedKey === 'webhook' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-[#D8DFE7] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#D8DFE7] flex items-center justify-between">
          <div>
            <h3 className="font-black text-[#0F172A] text-base">PhonePe Settlement Ledger</h3>
            <p className="text-xs text-slate-500">Live payment audit trail and PhonePe transaction IDs.</p>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            title="Refresh Ledger"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-[#D8DFE7] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Customer / Firm</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Mode</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTransactions.map((txn) => (
                <tr key={txn.transactionId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                    <div>{txn.transactionId}</div>
                    <span className="text-[10px] text-slate-400 font-normal">{txn.orderNumber}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0F172A]">{txn.customerName}</div>
                    <span className="text-[11px] text-slate-500 font-mono">{txn.customerPhone}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-black text-[#0052CC]">
                    {formatINR(txn.amount)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      {txn.paymentMode || 'UPI / Gateway'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        txn.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : txn.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                    {txn.createdAt ? new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No transactions recorded yet. Click &apos;Test PG Ping&apos; to generate your first test transaction!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={transactions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          pageSizeOptions={[5, 10, 20, 50]}
          itemLabel="settlement transactions"
        />
      </div>
    </div>
  );
}
