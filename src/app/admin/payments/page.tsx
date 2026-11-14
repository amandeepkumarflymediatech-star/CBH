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
  Trash2,
  AlertTriangle,
  X,
  Search,
  RotateCcw
} from 'lucide-react';
import { formatINR } from '@/lib/rfq-calculator';
import { PhonePeConfig, PhonePeTransactionRecord } from '@/lib/phonepe';

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Tab state: 'ledger' (default) vs 'settings'
  const [activeTab, setActiveTab] = useState<'ledger' | 'settings'>('ledger');

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

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');

  // Selection and Deletion states
  const [selectedTxnIds, setSelectedTxnIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<PhonePeTransactionRecord | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      if (selectedMode !== 'all' && (t.paymentMode || 'UPI / Gateway') !== selectedMode) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = t.transactionId?.toLowerCase().includes(q);
        const matchOrder = t.orderNumber?.toLowerCase().includes(q);
        const matchName = t.customerName?.toLowerCase().includes(q);
        const matchPhone = t.customerPhone?.toLowerCase().includes(q);
        if (!matchId && !matchOrder && !matchName && !matchPhone) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_asc') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      if (sortBy === 'amount_desc') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'amount_asc') return (a.amount || 0) - (b.amount || 0);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [transactions, selectedStatus, selectedMode, search, sortBy]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus, selectedMode, sortBy]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const isAllOnPageSelected =
    paginatedTransactions.length > 0 &&
    paginatedTransactions.every((txn) => selectedTxnIds.has(txn.transactionId));

  const handleToggleSelectAllOnPage = () => {
    const next = new Set(selectedTxnIds);
    if (isAllOnPageSelected) {
      paginatedTransactions.forEach((txn) => next.delete(txn.transactionId));
    } else {
      paginatedTransactions.forEach((txn) => next.add(txn.transactionId));
    }
    setSelectedTxnIds(next);
  };

  const handleSelectAllTotal = () => {
    setSelectedTxnIds(new Set(filteredTransactions.map((t) => t.transactionId)));
  };

  const handleClearSelection = () => {
    setSelectedTxnIds(new Set());
  };

  const handleToggleSelectOne = (id: string) => {
    const next = new Set(selectedTxnIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTxnIds(next);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedMode('all');
    setSortBy('date_desc');
    setCurrentPage(1);
  };

  const handleConfirmDeleteSingle = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/payment/phonepe/status?txnId=${encodeURIComponent(deleteTarget.transactionId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Transaction ${deleteTarget.transactionId} removed`);
        setTransactions((prev) => prev.filter((t) => t.transactionId !== deleteTarget.transactionId));
        setSelectedTxnIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteTarget.transactionId);
          return next;
        });
        setDeleteTarget(null);
      } else {
        showNotification(data.error || 'Failed to delete transaction', 'error');
      }
    } catch {
      showNotification('Error deleting transaction', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteBulk = async () => {
    if (selectedTxnIds.size === 0) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedTxnIds);
      const res = await fetch('/api/payment/phonepe/status', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Deleted ${ids.length} transaction records`);
        setTransactions((prev) => prev.filter((t) => !selectedTxnIds.has(t.transactionId)));
        setSelectedTxnIds(new Set());
        setIsBulkDeleteModalOpen(false);
      } else {
        showNotification(data.error || 'Failed to delete transactions', 'error');
      }
    } catch {
      showNotification('Error deleting transactions', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmClearAll = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/payment/phonepe/status?all=true', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotification('All transaction records cleared from ledger');
        setTransactions([]);
        setSelectedTxnIds(new Set());
        setIsDeleteAllModalOpen(false);
      } else {
        showNotification(data.error || 'Failed to clear transactions', 'error');
      }
    } catch {
      showNotification('Error clearing transaction ledger', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

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

  const successCount = transactions.filter((t) => t.status === 'SUCCESS').length;
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
  const failedCount = transactions.filter((t) => t.status === 'FAILED').length;

  const hasActiveFilters = Boolean(
    search.trim() || selectedStatus !== 'all' || selectedMode !== 'all' || sortBy !== 'date_desc'
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
        <RefreshCw className="w-8 h-8 text-[#5f259f] animate-spin mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Loading PhonePe Gateway Terminal...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      {/* MAIN GATEWAY & LEDGER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* 1. TOP HEADER ROW (Clean, Compact, Mobile-First) */}
        <div className="p-3 sm:p-4 md:p-5 border-b border-slate-200/80 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            {/* Title & View Switcher Tabs */}
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2">
                  <span>PhonePe</span>
                  <span className="hidden xs:inline">Gateway</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider flex items-center gap-1 ${
                      config.environment === 'PRODUCTION'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-purple-50 text-[#5f259f] border-purple-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5f259f] animate-pulse" />
                    <span>{config.environment}</span>
                  </span>
                </h2>
              </div>

              {/* View Switcher: Ledger vs Config */}
              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('ledger')}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'ledger'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CreditCard size={13} />
                  <span>Ledger</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {transactions.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShieldCheck size={13} />
                  <span className="hidden xs:inline">Credentials &amp; Config</span>
                  <span className="xs:hidden">Config</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleTestPing}
                disabled={testing}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5f259f] border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title="Send ₹1.00 test ping to PhonePe gateway"
              >
                <Zap size={13} />
                <span>{testing ? 'Pinging...' : 'Test Ping (₹1)'}</span>
              </button>

              {activeTab === 'settings' && (
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-1.5 bg-[#5f259f] hover:bg-[#4a1c7d] text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save size={13} />}
                  <span>Save</span>
                </button>
              )}

              <button
                type="button"
                onClick={fetchData}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                title="Refresh Ledger"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar (Only on Ledger View) */}
          {activeTab === 'ledger' && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              {/* Metric Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 flex-nowrap w-full sm:w-auto">
                {/* Status KPI Tabs */}
                {[
                  { id: 'all', label: 'All', count: transactions.length },
                  { id: 'SUCCESS', label: 'Successful', count: successCount, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { id: 'PENDING', label: 'Pending', count: pendingCount, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { id: 'FAILED', label: 'Failed', count: failedCount, color: 'text-rose-700 bg-rose-50 border-rose-200' },
                ].map((pill) => {
                  const isActive = selectedStatus === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setSelectedStatus(pill.id)}
                      className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#5f259f] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200'
                        }`}
                      >
                        {pill.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Total Settled Volume Badge */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono">
                <span className="text-emerald-600">Settled:</span>
                <strong className="text-emerald-900 font-bold">{formatINR(totalVolume)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* 2. TAB CONTENT: LEDGER VIEW */}
        {activeTab === 'ledger' && (
          <div>
            {/* Filter & Search Toolbar */}
            <div className="p-3 sm:px-4 sm:py-2.5 bg-slate-50/60 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                {/* Search Input */}
                <div className="relative w-full sm:w-auto sm:min-w-[220px] sm:max-w-xs sm:flex-1">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Txn ID, order, customer, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 font-medium"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Dropdowns */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="flex-1 sm:flex-initial h-8 text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="all">All Modes</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="NET_BANKING">NetBanking</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 sm:flex-initial h-8 text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="amount_desc">Amount: High→Low</option>
                    <option value="amount_asc">Amount: Low→High</option>
                  </select>

                  {/* Reset Filters */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="shrink-0 p-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                      title="Clear all filters"
                    >
                      <RotateCcw size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons & Count */}
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                {selectedTxnIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Delete ({selectedTxnIds.size})</span>
                  </button>
                )}

                {transactions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteAllModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Clear all transactions from ledger"
                  >
                    <Trash2 size={12} />
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                )}

                <div className="text-[11px] sm:text-xs text-slate-500 font-medium whitespace-nowrap">
                  Showing {filteredTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
                  <strong className="text-slate-800 font-bold">{filteredTransactions.length}</strong>
                </div>
              </div>
            </div>

            {/* Selection Banner */}
            {selectedTxnIds.size > 0 && (
              <div className="bg-purple-50 border-b border-purple-200 px-4 py-2 flex items-center justify-between text-xs text-purple-900 font-medium">
                <div className="flex items-center gap-2">
                  <span>
                    <strong>{selectedTxnIds.size}</strong> transaction{selectedTxnIds.size > 1 ? 's' : ''} selected.
                  </span>
                  {selectedTxnIds.size < filteredTransactions.length && (
                    <button
                      type="button"
                      onClick={handleSelectAllTotal}
                      className="font-bold underline text-[#5f259f] hover:text-[#421673] ml-1"
                    >
                      Select all {filteredTransactions.length}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-950 underline"
                >
                  Clear selection
                </button>
              </div>
            )}

            {/* High-Density Streamlined Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-9">
                      <input
                        type="checkbox"
                        checked={isAllOnPageSelected}
                        onChange={handleToggleSelectAllOnPage}
                        className="w-3.5 h-3.5 rounded text-[#5f259f] cursor-pointer"
                        title={isAllOnPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
                      />
                    </th>
                    <th className="py-2.5 px-3 font-bold">Transaction ID &amp; Order</th>
                    <th className="py-2.5 px-3 font-bold">Customer / Phone</th>
                    <th className="py-2.5 px-3 font-bold">Amount</th>
                    <th className="py-2.5 px-3 font-bold">Mode</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                    <th className="py-2.5 px-3 font-bold text-right">Timestamp</th>
                    <th className="py-2.5 px-3 font-bold text-center w-14">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTransactions.map((txn) => {
                    const isSelected = selectedTxnIds.has(txn.transactionId);
                    return (
                      <tr
                        key={txn.transactionId}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-purple-50/50' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(txn.transactionId)}
                            className="w-3.5 h-3.5 rounded text-[#5f259f] cursor-pointer"
                          />
                        </td>

                        {/* Transaction ID & Order */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              {txn.transactionId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(txn.transactionId, txn.transactionId)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                              title="Copy transaction ID"
                            >
                              {copiedKey === txn.transactionId ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            </button>
                          </div>
                          {txn.orderNumber && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Order: {txn.orderNumber}
                            </span>
                          )}
                        </td>

                        {/* Customer / Phone */}
                        <td className="py-2 px-3">
                          <div className="font-semibold text-xs text-slate-900">
                            {txn.customerName || 'Direct Checkout'}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {txn.customerPhone || 'N/A'}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-2 px-3 font-mono font-black text-xs text-[#0052CC]">
                          {formatINR(txn.amount)}
                        </td>

                        {/* Mode */}
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold">
                            {txn.paymentMode || 'UPI / PG'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
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

                        {/* Timestamp */}
                        <td className="py-2 px-3 text-right text-slate-500 font-mono text-[11px]">
                          {txn.createdAt ? new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </td>

                        {/* Action */}
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(txn)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete transaction record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <AlertTriangle size={24} className="text-amber-500 mx-auto mb-1.5" />
                        <div className="text-xs font-bold text-slate-800">No Transactions Found</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 mb-2.5">
                          {hasActiveFilters
                            ? 'No records match the current filter.'
                            : 'Click "Test Ping (₹1)" above to generate your first test transaction!'}
                        </div>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Clear Filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Compact Pagination Footer */}
            <div className="p-3 bg-slate-50/60 border-t border-slate-200">
              <TablePagination
                currentPage={currentPage}
                totalItems={filteredTransactions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="transactions"
              />
            </div>
          </div>
        )}

        {/* 3. TAB CONTENT: SETTINGS & CREDENTIALS VIEW */}
        {activeTab === 'settings' && (
          <div className="p-4 sm:p-6 space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">API Credentials &amp; Key Vault</h3>
                <p className="text-xs text-slate-500">
                  Configure official PhonePe Merchant ID, SHA256 Salt Key, and S2S Webhook parameters.
                </p>
              </div>
              <a
                href="https://merchant.phonepe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <span>Merchant Dashboard</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Credentials Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Environment Mode</label>
                <select
                  value={config.environment}
                  onChange={(e: any) => setConfig({ ...config, environment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs focus:outline-none focus:border-[#5f259f]"
                >
                  <option value="SANDBOX">SANDBOX (UAT Testing - Safe for Demos)</option>
                  <option value="PRODUCTION">PRODUCTION (Live Real Banking Settlement)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Merchant ID</label>
                <input
                  type="text"
                  value={config.merchantId}
                  onChange={(e) => setConfig({ ...config, merchantId: e.target.value })}
                  placeholder="PGTESTPAYUAT"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase text-xs focus:outline-none focus:border-[#5f259f]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">Salt Key (AES / SHA-256 Secret)</label>
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-[#5f259f]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Salt Key Index</label>
                <input
                  type="text"
                  value={config.saltIndex}
                  onChange={(e) => setConfig({ ...config, saltIndex: e.target.value })}
                  placeholder="1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-[#5f259f]"
                />
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="border-t border-slate-200/80 pt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
              <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="text-slate-900">Enable Sandbox Simulator</span>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Allows instant end-to-end payment simulation when testing on localhost.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableSimulator}
                  onChange={(e) => setConfig({ ...config, enableSimulator: e.target.checked })}
                  className="w-4 h-4 text-[#5f259f] rounded cursor-pointer"
                />
              </label>

              <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="text-slate-900">Auto-Confirm Orders Upon S2S Callback</span>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Automatically transition order to &apos;CONFIRMED&apos; when PhonePe webhook fires.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoConfirmOrders}
                  onChange={(e) => setConfig({ ...config, autoConfirmOrders: e.target.checked })}
                  className="w-4 h-4 text-[#5f259f] rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Webhook Endpoint Strip */}
            <div className="border-t border-slate-200/80 pt-3.5 space-y-2">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                S2S Server Webhook Endpoint
              </h4>
              <p className="text-[11px] text-slate-500">
                Paste this callback URL into your PhonePe Merchant Portal under Developer Settings ➔ Webhooks:
              </p>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 text-white font-mono text-xs">
                <span className="flex-1 truncate text-emerald-400">
                  {config.defaultCallbackUrl}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(config.defaultCallbackUrl, 'webhook')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'webhook' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
              <Link
                href="/checkout"
                target="_blank"
                className="text-xs text-[#0052CC] font-bold inline-flex items-center gap-1 hover:underline"
              >
                <span>Open Storefront Checkout</span>
                <ExternalLink size={12} />
              </Link>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5f259f] hover:bg-[#4a1c7d] text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save size={13} />}
                <span>Save PG Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal - Single Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Transaction Record?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to delete this payment record from the settlement ledger? This action cannot be undone.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs mb-4 font-mono space-y-1">
              <div className="text-slate-500">
                Txn ID: <strong className="text-slate-900">{deleteTarget.transactionId}</strong>
              </div>
              <div className="text-slate-500">
                Customer: <span className="text-slate-900 font-sans">{deleteTarget.customerName}</span>
              </div>
              <div className="text-slate-500">
                Amount: <span className="text-[#0052CC] font-bold">{formatINR(deleteTarget.amount)}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteSingle}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 size={13} />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Transaction'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Bulk Delete */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Selected Transactions?</h3>
            <p className="text-xs text-slate-500 mb-4">
              You have selected <strong className="text-rose-600">{selectedTxnIds.size}</strong> transaction record(s).
              Deleting them will permanently remove them from the ledger.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteBulk}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 size={13} />}
                <span>{isDeleting ? 'Deleting...' : `Delete ${selectedTxnIds.size} Records`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Clear All */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Clear Entire Payment Ledger?</h3>
            <p className="text-xs text-slate-500 mb-3">
              This will purge all <strong className="text-rose-600">{transactions.length}</strong> transaction record(s) from the PhonePe settlement ledger.
            </p>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 mb-4">
              ⚠️ Note: This only clears stored audit logs in CBH. Actual bank funds in your PhonePe merchant account remain unaffected.
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmClearAll}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 size={13} />}
                <span>{isDeleting ? 'Clearing...' : 'Yes, Purge Ledger'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
