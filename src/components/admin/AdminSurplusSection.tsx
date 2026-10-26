'use client';

import React, { useState, useMemo, useEffect } from 'react';
import TablePagination from '@/components/common/TablePagination';
import { SurplusLot } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Flame,
  CheckCircle2,
  AlertTriangle,
  X,
  Warehouse,
  Power
} from 'lucide-react';

interface AdminSurplusSectionProps {
  lots: SurplusLot[];
  onAdd: (lot: Omit<SurplusLot, 'id'>) => Promise<void>;
  onUpdate: (lot: SurplusLot) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleActive: (lot: SurplusLot) => Promise<void>;
  showToast: (msg: string) => void;
}

export default function AdminSurplusSection({
  lots,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
  showToast,
}: AdminSurplusSectionProps) {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [selectedHub, setSelectedHub] = useState('all');
  const [selectedActive, setSelectedActive] = useState('all');
  const [sortBy, setSortBy] = useState('discount_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editLot, setEditLot] = useState<SurplusLot | null>(null);
  const [deleteLot, setDeleteLot] = useState<SurplusLot | null>(null);

  // Add form fields
  const [addForm, setAddForm] = useState({
    sku: '',
    name: '',
    standard: 'DIN 933',
    grade: '8.8 HT',
    excessQtyPcs: '12000',
    excessQtyKg: '900.0',
    regularPriceKg: '160.00',
    clearanceDiscountPct: '40',
    locationHub: 'Bhiwandi Hub (MH)',
  });

  // Filtered & Sorted lots
  const filteredLots = useMemo(() => {
    let list = [...lots];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.sku.toLowerCase().includes(q) ||
          l.name.toLowerCase().includes(q) ||
          l.grade.toLowerCase().includes(q) ||
          l.locationHub.toLowerCase().includes(q)
      );
    }

    if (selectedStandard !== 'all') {
      list = list.filter((l) => l.standard.toLowerCase().includes(selectedStandard.toLowerCase()));
    }

    if (selectedHub !== 'all') {
      list = list.filter((l) => l.locationHub.toLowerCase().includes(selectedHub.toLowerCase()));
    }

    if (selectedActive === 'true') {
      list = list.filter((l) => l.isActive);
    } else if (selectedActive === 'false') {
      list = list.filter((l) => !l.isActive);
    }

    if (sortBy === 'discount_desc') {
      list.sort((a, b) => b.clearanceDiscountPct - a.clearanceDiscountPct);
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => a.clearancePriceKg - b.clearancePriceKg);
    } else if (sortBy === 'qty_desc') {
      list.sort((a, b) => b.excessQtyKg - a.excessQtyKg);
    }

    return list;
  }, [lots, search, selectedStandard, selectedHub, selectedActive, sortBy]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStandard, selectedHub, selectedActive, sortBy]);

  // Sliced paginated surplus lots
  const paginatedLots = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLots.slice(start, start + itemsPerPage);
  }, [filteredLots, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStandard('all');
    setSelectedHub('all');
    setSelectedActive('all');
    setSortBy('discount_desc');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Lot Name', 'Standard', 'Grade', 'Excess Pcs', 'Excess Kg', 'Regular /Kg (INR)', 'Discount %', 'Clearance /Kg (INR)', 'Warehouse Hub', 'Active'];
    const rows = filteredLots.map((l) => [
      `"${l.sku}"`,
      `"${l.name}"`,
      `"${l.standard}"`,
      `"${l.grade}"`,
      l.excessQtyPcs,
      l.excessQtyKg,
      l.regularPriceKg,
      l.clearanceDiscountPct,
      l.clearancePriceKg.toFixed(2),
      `"${l.locationHub}"`,
      l.isActive ? 'Yes' : 'No',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cbh_surplus_liquidation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredLots.length} surplus lots to CSV`);
  };

  const submitAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const reg = parseFloat(addForm.regularPriceKg) || 150.0;
    const disc = parseFloat(addForm.clearanceDiscountPct) || 35;
    const clearance = reg * (1 - disc / 100);

    await onAdd({
      sku: addForm.sku || `SURP-${addForm.standard.replace(/\s+/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      name: addForm.name || `${addForm.standard} Grade ${addForm.grade} Surplus Lot`,
      standard: addForm.standard,
      grade: addForm.grade,
      excessQtyPcs: parseInt(addForm.excessQtyPcs) || 10000,
      excessQtyKg: parseFloat(addForm.excessQtyKg) || 750.0,
      regularPriceKg: reg,
      clearanceDiscountPct: disc,
      clearancePriceKg: clearance,
      locationHub: addForm.locationHub,
      isActive: true,
    });

    setIsAddOpen(false);
    setAddForm({
      sku: '',
      name: '',
      standard: 'DIN 933',
      grade: '8.8 HT',
      excessQtyPcs: '12000',
      excessQtyKg: '900.0',
      regularPriceKg: '160.00',
      clearanceDiscountPct: '40',
      locationHub: 'Bhiwandi Hub (MH)',
    });
  };

  const submitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLot) return;
    await onUpdate(editLot);
    setEditLot(null);
  };

  const confirmDelete = async () => {
    if (!deleteLot) return;
    await onDelete(deleteLot.id);
    setDeleteLot(null);
  };

  return (
    <div className="portal-main-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Surplus Liquidation Deals Management ({lots.length} Clearance Batches)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Direct inventory liquidation channel for overstocked fastener runs, clearance lots, and rapid buyer turnaround
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
            <span>Launch Surplus Batch</span>
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
              placeholder="Search Surplus SKU, spec, depot..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="admin-select"
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
          >
            <option value="all">Standard: All</option>
            <option value="DIN 933">DIN 933</option>
            <option value="DIN 912">DIN 912</option>
            <option value="ISO 4017">ISO 4017</option>
          </select>

          <select
            className="admin-select"
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
          >
            <option value="all">Depot: All Hubs</option>
            <option value="Bhiwandi">Bhiwandi Hub (MH)</option>
            <option value="Ludhiana">Ludhiana Central Depot (PB)</option>
            <option value="Chennai">Chennai Harbour Depot (TN)</option>
          </select>

          <select
            className="admin-select"
            value={selectedActive}
            onChange={(e) => setSelectedActive(e.target.value)}
          >
            <option value="all">Status: All Batches</option>
            <option value="true">Active on Storefront</option>
            <option value="false">Paused / Delisted</option>
          </select>

          <select
            className="admin-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="discount_desc">Discount: High to Low</option>
            <option value="price_asc">Clearance Rate: Low to High</option>
            <option value="qty_desc">Lot Size (Kg): High to Low</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="admin-filter-count">
            Showing {filteredLots.length} of {lots.length} Surplus Lots
          </span>
          {(search || selectedStandard !== 'all' || selectedHub !== 'all' || selectedActive !== 'all' || sortBy !== 'discount_desc') && (
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
              <th>Surplus SKU & Description</th>
              <th>Standard</th>
              <th>Grade</th>
              <th>Surplus Quantity</th>
              <th>Standard Rate / Kg</th>
              <th>Clearance Rate / Kg</th>
              <th>Liquidation Discount</th>
              <th>Warehouse Depot</th>
              <th>Storefront Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLots.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <div className="admin-empty-state">
                    <AlertTriangle size={32} color="#D97706" style={{ margin: '0 auto' }} />
                    <h4>No Surplus Lots Matched</h4>
                    <p>No active liquidation batches match your current filter selection.</p>
                    <button type="button" className="btn-outline" onClick={handleResetFilters}>
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLots.map((l) => {
                return (
                  <tr key={l.id} className="surplus-row">
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-dark-900)' }}>
                        {l.sku}
                      </strong>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {l.name}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-din">{l.standard}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{l.grade}</span>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {l.excessQtyKg.toLocaleString()} Kg
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        ({l.excessQtyPcs.toLocaleString()} Pcs)
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                      {formatINR(l.regularPriceKg)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-accent)', fontSize: '14px' }}>
                      {formatINR(l.clearancePriceKg)}
                    </td>
                    <td>
                      <span className="badge badge-surplus" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Flame size={11} /> -{l.clearanceDiscountPct}% CLEARANCE
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <Warehouse size={13} color="#0284C7" />
                        <span>{l.locationHub}</span>
                      </div>
                    </td>
                    <td>
                      {l.isActive ? (
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> Active
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                          Paused
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-toggle"
                          onClick={() => onToggleActive(l)}
                          title={l.isActive ? 'Pause Storefront Listing' : 'Activate on Storefront'}
                        >
                          <Power size={11} />
                          <span>{l.isActive ? 'Pause' : 'Activate'}</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-edit"
                          onClick={() => setEditLot({ ...l })}
                          title="Edit Lot Parameters"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-delete"
                          onClick={() => setDeleteLot(l)}
                          title="Delist Surplus Lot"
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
          totalItems={filteredLots.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="surplus liquidation lots"
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Add Surplus Lot Modal */}
      {isAddOpen && (
        <div className="modal-overlay active" onClick={() => setIsAddOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                Launch New Surplus Liquidation Batch
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitAddForm}>
              <div className="admin-modal-grid">
                <div className="admin-form-group">
                  <label>Surplus Batch SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. SURP-DIN933-M14-80-8.8"
                    value={addForm.sku}
                    onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
                  />
                  <span className="hint">Auto-generated if left blank</span>
                </div>

                <div className="admin-form-group">
                  <label>Standard Spec</label>
                  <select
                    value={addForm.standard}
                    onChange={(e) => setAddForm({ ...addForm, standard: e.target.value })}
                  >
                    <option value="DIN 933">DIN 933 (Hex Set Screw)</option>
                    <option value="DIN 931">DIN 931 (Hex Bolt)</option>
                    <option value="DIN 912">DIN 912 (Socket Cap)</option>
                    <option value="ISO 4017">ISO 4017</option>
                  </select>
                </div>

                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Lot Title / Fastener Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hex Head Screws DIN 933 M14x80mm Grade 8.8 Black Zinc"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Property Class / Grade</label>
                  <input
                    type="text"
                    value={addForm.grade}
                    onChange={(e) => setAddForm({ ...addForm, grade: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Warehouse Hub Depot</label>
                  <select
                    value={addForm.locationHub}
                    onChange={(e) => setAddForm({ ...addForm, locationHub: e.target.value })}
                  >
                    <option value="Bhiwandi Hub (MH)">Bhiwandi Hub (MH)</option>
                    <option value="Ludhiana Central Depot (PB)">Ludhiana Central Depot (PB)</option>
                    <option value="Chennai Harbour Depot (TN)">Chennai Harbour Depot (TN)</option>
                    <option value="Ahmedabad Industrial Depot (GJ)">Ahmedabad Industrial Depot (GJ)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Excess Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={addForm.excessQtyKg}
                    onChange={(e) => setAddForm({ ...addForm, excessQtyKg: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Excess Pieces (Pcs)</label>
                  <input
                    type="number"
                    value={addForm.excessQtyPcs}
                    onChange={(e) => setAddForm({ ...addForm, excessQtyPcs: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Standard Regular Price / Kg (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={addForm.regularPriceKg}
                    onChange={(e) => setAddForm({ ...addForm, regularPriceKg: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Clearance Discount (%)</label>
                  <input
                    type="number"
                    min="20"
                    max="70"
                    required
                    value={addForm.clearanceDiscountPct}
                    onChange={(e) => setAddForm({ ...addForm, clearanceDiscountPct: e.target.value })}
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
                  <Flame size={15} />
                  <span>Launch Surplus Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Surplus Modal */}
      {editLot && (
        <div className="modal-overlay active" onClick={() => setEditLot(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                  Edit Surplus Batch: {editLot.sku}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Update clearance discounts, remaining tonnage, or warehouse depot
                </span>
              </div>
              <button type="button" onClick={() => setEditLot(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitEditForm}>
              <div className="admin-modal-grid">
                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Lot Title</label>
                  <input
                    type="text"
                    value={editLot.name}
                    onChange={(e) => setEditLot({ ...editLot, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Remaining Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editLot.excessQtyKg}
                    onChange={(e) => setEditLot({ ...editLot, excessQtyKg: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Remaining Pieces</label>
                  <input
                    type="number"
                    value={editLot.excessQtyPcs}
                    onChange={(e) => setEditLot({ ...editLot, excessQtyPcs: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Standard Rate / Kg (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editLot.regularPriceKg}
                    onChange={(e) => {
                      const reg = parseFloat(e.target.value) || 0;
                      const disc = editLot.clearanceDiscountPct;
                      setEditLot({ ...editLot, regularPriceKg: reg, clearancePriceKg: reg * (1 - disc / 100) });
                    }}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Clearance Discount (%)</label>
                  <input
                    type="number"
                    min="15"
                    max="75"
                    value={editLot.clearanceDiscountPct}
                    onChange={(e) => {
                      const disc = parseFloat(e.target.value) || 0;
                      const reg = editLot.regularPriceKg;
                      setEditLot({ ...editLot, clearanceDiscountPct: disc, clearancePriceKg: reg * (1 - disc / 100) });
                    }}
                  />
                </div>

                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Depot Location</label>
                  <input
                    type="text"
                    value={editLot.locationHub}
                    onChange={(e) => setEditLot({ ...editLot, locationHub: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setEditLot(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <CheckCircle2 size={15} />
                  <span>Save Batch Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteLot && (
        <div className="modal-overlay active" onClick={() => setDeleteLot(null)}>
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
                Delist Surplus Batch?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                Are you sure you want to delist surplus batch <strong>{deleteLot.sku}</strong> ({deleteLot.name})?
                This will remove the liquidation deal from the surplus marketplace.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => setDeleteLot(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, background: '#DC2626' }}
                onClick={confirmDelete}
              >
                Yes, Delist Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
