'use client';

import React, { useState, useMemo, useEffect } from 'react';
import TablePagination from '@/components/common/TablePagination';
import { BulkQuotation } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  Send,
  Building2,
  Clock
} from 'lucide-react';

interface AdminRfqsSectionProps {
  quotes: BulkQuotation[];
  onAdd: (quote: Omit<BulkQuotation, 'id'>) => Promise<void>;
  onUpdate: (quote: BulkQuotation) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export default function AdminRfqsSection({
  quotes,
  onAdd,
  onUpdate,
  onDelete,
  showToast,
}: AdminRfqsSectionProps) {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editQuote, setEditQuote] = useState<BulkQuotation | null>(null);
  const [deleteQuote, setDeleteQuote] = useState<BulkQuotation | null>(null);

  // Add form fields
  const [addForm, setAddForm] = useState({
    rfqNumber: '',
    customerName: '',
    companyName: '',
    gstin: '',
    phone: '',
    email: '',
    itemsCount: '3',
    totalWeightKg: '450.0',
    grossAmount: '75000.00',
    discountPct: '15',
    status: 'QUOTED' as BulkQuotation['status'],
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  // Filtered & Sorted quotes
  const filteredQuotes = useMemo(() => {
    let list = [...quotes];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.rfqNumber.toLowerCase().includes(q) ||
          item.customerName?.toLowerCase().includes(q) ||
          item.companyName?.toLowerCase().includes(q) ||
          item.gstin?.toLowerCase().includes(q)
      );
    }

    if (selectedStatus !== 'all') {
      list = list.filter((item) => item.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    if (sortBy === 'date_desc') {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'date_asc') {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'amount_desc') {
      list.sort((a, b) => b.netTotal - a.netTotal);
    } else if (sortBy === 'amount_asc') {
      list.sort((a, b) => a.netTotal - b.netTotal);
    }

    return list;
  }, [quotes, search, selectedStatus, sortBy]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus, sortBy]);

  // Sliced paginated quotes
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuotes.slice(start, start + itemsPerPage);
  }, [filteredQuotes, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSortBy('date_desc');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['RFQ Reference', 'Company Name', 'Customer Name', 'GSTIN', 'Items Count', 'Weight (Kg)', 'Gross (INR)', 'Discount %', 'Net Total (INR)', 'Status', 'Date', 'Valid Until'];
    const rows = filteredQuotes.map((q) => [
      `"${q.rfqNumber}"`,
      `"${q.companyName || 'Enterprise Client'}"`,
      `"${q.customerName || 'Procurement'}"`,
      `"${q.gstin || 'UNREGISTERED'}"`,
      q.itemsCount,
      q.totalWeightKg || 0,
      q.grossAmount,
      q.discountPct,
      q.netTotal,
      `"${q.status}"`,
      `"${q.date}"`,
      `"${q.validUntil}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cbh_rfq_approvals_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredQuotes.length} RFQ records to CSV`);
  };

  const submitAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const gross = parseFloat(addForm.grossAmount) || 50000;
    const discount = parseFloat(addForm.discountPct) || 15;
    const net = gross * (1 - discount / 100);

    await onAdd({
      rfqNumber: addForm.rfqNumber || `RFQ-CBH-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      customerName: addForm.customerName || 'Procurement In-Charge',
      companyName: addForm.companyName || 'Apex Heavy Infra Ltd.',
      gstin: addForm.gstin || '29AABCA1234F1Z5',
      phone: addForm.phone || '+91 98880 21000',
      email: addForm.email || 'rfq@enterprise.com',
      itemsCount: parseInt(addForm.itemsCount) || 3,
      totalWeightKg: parseFloat(addForm.totalWeightKg) || 450.0,
      grossAmount: gross,
      discountPct: discount,
      netTotal: net,
      status: addForm.status,
      validUntil: addForm.validUntil,
    });

    setIsAddOpen(false);
    setAddForm({
      rfqNumber: '',
      customerName: '',
      companyName: '',
      gstin: '',
      phone: '',
      email: '',
      itemsCount: '3',
      totalWeightKg: '450.0',
      grossAmount: '75000.00',
      discountPct: '15',
      status: 'QUOTED',
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });
  };

  const submitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuote) return;
    await onUpdate(editQuote);
    setEditQuote(null);
  };

  const confirmDelete = async () => {
    if (!deleteQuote) return;
    await onDelete(deleteQuote.id);
    setDeleteQuote(null);
  };

  const quickUpdateStatus = async (quote: BulkQuotation, newStatus: BulkQuotation['status']) => {
    await onUpdate({
      ...quote,
      status: newStatus,
    });
    showToast(`Quotation ${quote.rfqNumber} updated to ${newStatus}`);
  };

  return (
    <div className="portal-main-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Bulk RFQs & Custom Quotation Approvals ({quotes.length} RFQ Records)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Review metallurgical volume quotations, verify GSTIN exemptions, and approve tiered procurement pricing
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-outline"
            style={{ padding: '8px 14px', fontSize: '12px' }}
            onClick={handleExportCSV}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setIsAddOpen(true)}
          >
            <Plus size={15} />
            <span>Generate Custom RFQ</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <div className="admin-search-wrap">
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search RFQ #, company, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="admin-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Status: All Approvals</option>
            <option value="PENDING">Pending Review</option>
            <option value="IN_REVIEW">In Review (Metallurgy)</option>
            <option value="QUOTED">Quoted (Sent to Client)</option>
            <option value="APPROVED">Approved by Sales</option>
            <option value="PO_ISSUED">Converted to PO</option>
            <option value="REJECTED">Declined / Expired</option>
          </select>

          <select
            className="admin-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_desc">Date: Newest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="amount_desc">Net Value: High to Low</option>
            <option value="amount_asc">Net Value: Low to High</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="admin-filter-count">
            Showing {filteredQuotes.length} of {quotes.length} RFQs
          </span>
          {(search || selectedStatus !== 'all' || sortBy !== 'date_desc') && (
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={handleResetFilters}
            >
              <RefreshCw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>RFQ Reference</th>
              <th>Client / Plant</th>
              <th>Quantity & Weight</th>
              <th>Gross Est.</th>
              <th>Tier Slab</th>
              <th>Net Quoted</th>
              <th>Status</th>
              <th>Valid Until</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="admin-empty-state">
                    <AlertTriangle size={32} color="#D97706" style={{ margin: '0 auto' }} />
                    <h4>No RFQ Records Matched</h4>
                    <p>No quotation records match your filter criteria.</p>
                    <button type="button" className="btn-outline" onClick={handleResetFilters}>
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedQuotes.map((q) => {
                const isApproved = q.status === 'APPROVED' || q.status === 'PO_ISSUED';
                const isPending = q.status === 'PENDING' || q.status === 'IN_REVIEW';

                return (
                  <tr key={q.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-dark-900)' }}>
                        {q.rfqNumber}
                      </strong>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Date: {q.date}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-dark-900)' }}>
                        {q.companyName || 'Enterprise Heavy Infra Ltd.'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Attn: {q.customerName || 'Procurement Dept'} | GST: {q.gstin || '29AABCA1234F1Z5'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {q.itemsCount} SKUs
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {q.totalWeightKg ? `${q.totalWeightKg.toFixed(1)} Kg` : 'Batch Lot'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatINR(q.grossAmount)}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#ECFDF5',
                        color: '#059669',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '11px'
                      }}>
                        -{q.discountPct}% OEM Slab
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-primary)', fontSize: '14px' }}>
                      {formatINR(q.netTotal)}
                    </td>
                    <td>
                      <span className={`badge ${
                        q.status === 'APPROVED' || q.status === 'PO_ISSUED'
                          ? 'badge-certified'
                          : q.status === 'PENDING'
                          ? 'badge-surplus'
                          : 'badge-vip'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                        {q.validUntil}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        {q.status !== 'APPROVED' && q.status !== 'PO_ISSUED' && (
                          <button
                            type="button"
                            className="admin-btn-action admin-btn-toggle"
                            onClick={() => quickUpdateStatus(q, 'APPROVED')}
                            title="1-Click Approve Quote"
                          >
                            <CheckCircle2 size={12} />
                            <span>Approve</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-edit"
                          onClick={() => setEditQuote({ ...q })}
                          title="Edit Quote Details"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-delete"
                          onClick={() => setDeleteQuote(q)}
                          title="Delete / Archive RFQ"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredQuotes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="quotations"
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Add Custom RFQ Modal */}
      {isAddOpen && (
        <div className="modal-overlay active" onClick={() => setIsAddOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                Generate Custom Bulk RFQ Quotation
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitAddForm}>
              <div className="admin-modal-grid">
                <div className="admin-form-group">
                  <label>RFQ Reference #</label>
                  <input
                    type="text"
                    placeholder="e.g. RFQ-CBH-2025-9921"
                    value={addForm.rfqNumber}
                    onChange={(e) => setAddForm({ ...addForm, rfqNumber: e.target.value })}
                  />
                  <span className="hint">Auto-generated if left blank</span>
                </div>

                <div className="admin-form-group">
                  <label>Client Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Larsen Heavy Infrastructure Ltd."
                    value={addForm.companyName}
                    onChange={(e) => setAddForm({ ...addForm, companyName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={addForm.customerName}
                    onChange={(e) => setAddForm({ ...addForm, customerName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>GSTIN / Tax ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 29AABCA1234F1Z5"
                    value={addForm.gstin}
                    onChange={(e) => setAddForm({ ...addForm, gstin: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Gross Estimated Value (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={addForm.grossAmount}
                    onChange={(e) => setAddForm({ ...addForm, grossAmount: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Discount Slab (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={addForm.discountPct}
                    onChange={(e) => setAddForm({ ...addForm, discountPct: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Total Fastener Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={addForm.totalWeightKg}
                    onChange={(e) => setAddForm({ ...addForm, totalWeightKg: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Approval Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="QUOTED">QUOTED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PO_ISSUED">PO_ISSUED</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Validity Until</label>
                  <input
                    type="date"
                    value={addForm.validUntil}
                    onChange={(e) => setAddForm({ ...addForm, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <FileCheck size={15} />
                  <span>Issue Quotation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit RFQ Modal */}
      {editQuote && (
        <div className="modal-overlay active" onClick={() => setEditQuote(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                  Edit RFQ: {editQuote.rfqNumber}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {editQuote.companyName}
                </span>
              </div>
              <button type="button" onClick={() => setEditQuote(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitEditForm}>
              <div className="admin-modal-grid">
                <div className="admin-form-group">
                  <label>Client Company Name</label>
                  <input
                    type="text"
                    value={editQuote.companyName || ''}
                    onChange={(e) => setEditQuote({ ...editQuote, companyName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>GSTIN</label>
                  <input
                    type="text"
                    value={editQuote.gstin || ''}
                    onChange={(e) => setEditQuote({ ...editQuote, gstin: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Gross Estimated Value (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editQuote.grossAmount}
                    onChange={(e) => setEditQuote({ ...editQuote, grossAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Discount Slab (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editQuote.discountPct}
                    onChange={(e) => setEditQuote({ ...editQuote, discountPct: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Approval Status</label>
                  <select
                    value={editQuote.status}
                    onChange={(e) => setEditQuote({ ...editQuote, status: e.target.value as any })}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="QUOTED">QUOTED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PO_ISSUED">PO_ISSUED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Valid Until</label>
                  <input
                    type="date"
                    value={editQuote.validUntil}
                    onChange={(e) => setEditQuote({ ...editQuote, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setEditQuote(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <CheckCircle2 size={15} />
                  <span>Save Quotation Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteQuote && (
        <div className="modal-overlay active" onClick={() => setDeleteQuote(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '440px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: 'var(--color-dark-900)' }}>
                Delete RFQ Record?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                Are you sure you want to delete RFQ <strong>{deleteQuote.rfqNumber}</strong> for {deleteQuote.companyName}?
                This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => setDeleteQuote(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, background: '#DC2626' }}
                onClick={confirmDelete}
              >
                Yes, Delete RFQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
