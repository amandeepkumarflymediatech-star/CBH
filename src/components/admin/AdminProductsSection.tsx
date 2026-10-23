'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
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
  Filter
} from 'lucide-react';

interface AdminProductsSectionProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdate: (product: Product) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleSurplus: (id: number) => Promise<void>;
  showToast: (msg: string) => void;
}

export default function AdminProductsSection({
  products,
  onAdd,
  onUpdate,
  onDelete,
  onToggleSurplus,
  showToast,
}: AdminProductsSectionProps) {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');
  const [selectedCatalog, setSelectedCatalog] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // Add form fields
  const [addForm, setAddForm] = useState({
    sku: '',
    name: '',
    category: 'Hex Screws',
    standard: 'DIN 933',
    grade: '8.8',
    finish: 'Black Passivated (BP)',
    threadType: 'Full Thread',
    diameter: 'M10',
    lengthMm: '100',
    pitchMm: '1.5',
    weightPerPcKg: '0.0601',
    pricePerPiece: '6.50',
    pricePerKg: '108.00',
    stockPcs: '15000',
    isSurplus: false,
    surplusDiscountPct: '35',
  });

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.diameter?.toLowerCase().includes(q) ||
          p.standard.toLowerCase().includes(q)
      );
    }

    if (selectedStandard !== 'all') {
      list = list.filter((p) => p.standard.toLowerCase().includes(selectedStandard.toLowerCase()));
    }

    if (selectedGrade !== 'all') {
      list = list.filter((p) => p.grade.toLowerCase().includes(selectedGrade.toLowerCase()));
    }

    if (selectedStock === 'in_stock') {
      list = list.filter((p) => p.stockPcs > 5000);
    } else if (selectedStock === 'low_stock') {
      list = list.filter((p) => p.stockPcs > 0 && p.stockPcs <= 5000);
    } else if (selectedStock === 'out_of_stock') {
      list = list.filter((p) => p.stockPcs === 0);
    }

    if (selectedCatalog === 'surplus') {
      list = list.filter((p) => p.isSurplus);
    } else if (selectedCatalog === 'standard') {
      list = list.filter((p) => !p.isSurplus);
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.pricePerPiece - b.pricePerPiece);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.pricePerPiece - a.pricePerPiece);
    } else if (sortBy === 'stock_desc') {
      list.sort((a, b) => b.stockPcs - a.stockPcs);
    } else if (sortBy === 'sku_asc') {
      list.sort((a, b) => a.sku.localeCompare(b.sku));
    }

    return list;
  }, [products, search, selectedStandard, selectedGrade, selectedStock, selectedCatalog, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStandard('all');
    setSelectedGrade('all');
    setSelectedStock('all');
    setSelectedCatalog('all');
    setSortBy('default');
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Name', 'Standard', 'Grade', 'Rate/Pc (INR)', 'Rate/Kg (INR)', 'Stock Pcs', 'Stock Kg', 'Surplus'];
    const rows = filteredProducts.map((p) => [
      `"${p.sku}"`,
      `"${p.name}"`,
      `"${p.standard}"`,
      `"${p.grade}"`,
      p.pricePerPiece,
      p.pricePerKg,
      p.stockPcs,
      p.stockKg.toFixed(2),
      p.isSurplus ? `Yes (-${p.surplusDiscountPct}%)` : 'No',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cbh_fastener_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredProducts.length} fastener SKUs to CSV`);
  };

  const submitAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(addForm.weightPerPcKg) || 0.06;
    const stockPcs = parseInt(addForm.stockPcs) || 10000;
    const pricePc = parseFloat(addForm.pricePerPiece) || 5.0;
    const priceKg = parseFloat(addForm.pricePerKg) || 100.0;

    await onAdd({
      sku: addForm.sku || `CBH-${addForm.standard.replace(/\s+/g, '')}-${addForm.diameter}-${Math.floor(100 + Math.random() * 900)}`,
      name: addForm.name || `${addForm.standard} Metric Fastener ${addForm.diameter}x${addForm.lengthMm}mm Grade ${addForm.grade}`,
      category: addForm.category,
      standard: addForm.standard,
      grade: addForm.grade,
      finish: addForm.finish,
      threadType: addForm.threadType,
      diameter: addForm.diameter,
      lengthMm: parseInt(addForm.lengthMm) || 100,
      pitchMm: parseFloat(addForm.pitchMm) || 1.5,
      weightPerPcKg: weight,
      pricePerPiece: pricePc,
      originalPricePerPiece: pricePc * 1.15,
      pricePerKg: priceKg,
      originalPricePerKg: priceKg * 1.15,
      stockPcs: stockPcs,
      stockKg: stockPcs * weight,
      isInStock: stockPcs > 0,
      isSurplus: addForm.isSurplus,
      surplusDiscountPct: addForm.isSurplus ? (parseInt(addForm.surplusDiscountPct) || 35) : 0,
      imageUrl: '/assets/bolt_zinc.jpg',
    });

    setIsAddOpen(false);
    setAddForm({
      sku: '',
      name: '',
      category: 'Hex Screws',
      standard: 'DIN 933',
      grade: '8.8',
      finish: 'Black Passivated (BP)',
      threadType: 'Full Thread',
      diameter: 'M10',
      lengthMm: '100',
      pitchMm: '1.5',
      weightPerPcKg: '0.0601',
      pricePerPiece: '6.50',
      pricePerKg: '108.00',
      stockPcs: '15000',
      isSurplus: false,
      surplusDiscountPct: '35',
    });
  };

  const submitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    await onUpdate(editProduct);
    setEditProduct(null);
  };

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    await onDelete(deleteProduct.id);
    setDeleteProduct(null);
  };

  return (
    <div className="portal-main-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Fastener Inventory Catalog ({products.length} Registered SKUs)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Live bidirectional synchronization with storefront matrix, RFQ calculator, and surplus liquidation
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
            <span>Add Fastener SKU</span>
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
              placeholder="Search SKU, name, diameter..."
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
            <option value="DIN 933">DIN 933 (Hex Set Screw)</option>
            <option value="DIN 931">DIN 931 (Hex Bolt)</option>
            <option value="DIN 912">DIN 912 (Socket Cap)</option>
            <option value="DIN 934">DIN 934 (Hex Nut)</option>
            <option value="ISO 4017">ISO 4017</option>
            <option value="ETA Option 7">ETA Option 7 (Anchors)</option>
          </select>

          <select
            className="admin-select"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="all">Grade: All</option>
            <option value="5.8">Class 5.8</option>
            <option value="8.8">Class 8.8 (High Tensile)</option>
            <option value="10.9">Class 10.9 (Alloy)</option>
            <option value="12.9">Class 12.9 (Extreme)</option>
            <option value="SS 304">SS 304 (A2-70)</option>
            <option value="SS 316">SS 316 (A4-80)</option>
          </select>

          <select
            className="admin-select"
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
          >
            <option value="all">Stock: All</option>
            <option value="in_stock">In Stock (&gt;5k pcs)</option>
            <option value="low_stock">Low Stock (1-5k pcs)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          <select
            className="admin-select"
            value={selectedCatalog}
            onChange={(e) => setSelectedCatalog(e.target.value)}
          >
            <option value="all">Catalog: Standard + Surplus</option>
            <option value="standard">Standard Catalog Only</option>
            <option value="surplus">Surplus Lots Only</option>
          </select>

          <select
            className="admin-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Sort: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="stock_desc">Stock: High to Low</option>
            <option value="sku_asc">SKU: A to Z</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="admin-filter-count">
            Showing {filteredProducts.length} of {products.length} SKUs
          </span>
          {(search || selectedStandard !== 'all' || selectedGrade !== 'all' || selectedStock !== 'all' || selectedCatalog !== 'all' || sortBy !== 'default') && (
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
              <th>SKU & Product Details</th>
              <th>Standard</th>
              <th>Grade</th>
              <th>Rate / Pc</th>
              <th>Rate / Kg</th>
              <th>Stock Telemetry</th>
              <th>Status</th>
              <th>Surplus Deal</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="admin-empty-state">
                    <AlertTriangle size={32} color="#D97706" style={{ margin: '0 auto' }} />
                    <h4>No Fastener SKUs Matched</h4>
                    <p>No products match your current search and filter combination.</p>
                    <button type="button" className="btn-outline" onClick={handleResetFilters}>
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isLowStock = p.stockPcs > 0 && p.stockPcs <= 5000;
                const isOutOfStock = p.stockPcs === 0;

                return (
                  <tr key={p.id} className={p.isSurplus ? 'surplus-row' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '4px',
                          border: '1px solid var(--color-surface-border)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: '#F8FAFC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Image
                            src={p.imageUrl || '/assets/bolt_zinc.jpg'}
                            alt={p.sku}
                            width={36}
                            height={36}
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                        <div>
                          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-dark-900)' }}>
                            {p.sku}
                          </strong>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {p.diameter} × {p.lengthMm}mm | Pitch {p.pitchMm}mm | {p.finish}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-din">{p.standard}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{p.grade}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {formatINR(p.pricePerPiece)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#D2051E' }}>
                      {formatINR(p.pricePerKg)}
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        <strong>{p.stockPcs.toLocaleString()}</strong> pcs
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {p.stockKg.toFixed(1)} Kg
                      </div>
                    </td>
                    <td>
                      {isOutOfStock ? (
                        <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="badge" style={{ background: '#FEF3C7', color: '#D97706' }}>
                          Low Stock
                        </span>
                      ) : (
                        <span className="badge badge-certified">
                          Ready Stock
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onToggleSurplus(p.id)}
                        className={`badge ${p.isSurplus ? 'badge-surplus' : 'badge-certified'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle surplus liquidation deal"
                      >
                        {p.isSurplus ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Flame size={11} /> SURPLUS (-{p.surplusDiscountPct}%)
                          </span>
                        ) : (
                          'STANDARD'
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-edit"
                          onClick={() => setEditProduct({ ...p })}
                          title="Edit fastener SKU parameters"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-delete"
                          onClick={() => setDeleteProduct(p)}
                          title="Delete SKU from catalog"
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
      </div>

      {/* Add Fastener Modal */}
      {isAddOpen && (
        <div className="modal-overlay active" onClick={() => setIsAddOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                Register New Fastener SKU
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitAddForm}>
              <div className="admin-modal-grid">
                <div className="admin-form-group">
                  <label>SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CBH-933-M12-100-8.8"
                    value={addForm.sku}
                    onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
                  />
                  <span className="hint">Auto-generated if left blank</span>
                </div>

                <div className="admin-form-group">
                  <label>Category</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  >
                    <option value="Hex Screws">Hex Screws</option>
                    <option value="Hex Bolts">Heavy Hex Bolts</option>
                    <option value="Socket Head Cap">Socket Head Cap Screws</option>
                    <option value="Hex Nuts">Hex Nuts</option>
                    <option value="Plain Washers">Plain Washers</option>
                    <option value="Anchors">Concrete Anchors</option>
                    <option value="Threaded Rods">Threaded Rods</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group" style={{ marginTop: '12px' }}>
                <label>Official Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hex Screws-(Din 933)-Full Thread-M12X1.75X100-Grade 8.8 BZP"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>

              <div className="admin-modal-grid" style={{ marginTop: '12px' }}>
                <div className="admin-form-group">
                  <label>Standard Spec</label>
                  <select
                    value={addForm.standard}
                    onChange={(e) => setAddForm({ ...addForm, standard: e.target.value })}
                  >
                    <option value="DIN 933">DIN 933 (Full Thread)</option>
                    <option value="DIN 931">DIN 931 (Partial Thread)</option>
                    <option value="DIN 912">DIN 912 (Socket Cap)</option>
                    <option value="DIN 934">DIN 934 (Hex Nut)</option>
                    <option value="ISO 4017">ISO 4017</option>
                    <option value="ASTM A193">ASTM A193 (B7)</option>
                    <option value="ETA Option 7">ETA Option 7</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Property Class / Grade</label>
                  <select
                    value={addForm.grade}
                    onChange={(e) => setAddForm({ ...addForm, grade: e.target.value })}
                  >
                    <option value="4.6">Class 4.6</option>
                    <option value="5.8">Class 5.8 BP</option>
                    <option value="8.8">Class 8.8 HT</option>
                    <option value="10.9">Class 10.9 Alloy</option>
                    <option value="12.9">Class 12.9 High Tensile</option>
                    <option value="SS 304">SS 304 (A2-70)</option>
                    <option value="SS 316">SS 316 (A4-80)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Diameter</label>
                  <select
                    value={addForm.diameter}
                    onChange={(e) => setAddForm({ ...addForm, diameter: e.target.value })}
                  >
                    <option value="M6">M6</option>
                    <option value="M8">M8</option>
                    <option value="M10">M10</option>
                    <option value="M12">M12</option>
                    <option value="M14">M14</option>
                    <option value="M16">M16</option>
                    <option value="M20">M20</option>
                    <option value="M24">M24</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Length (mm)</label>
                  <input
                    type="number"
                    value={addForm.lengthMm}
                    onChange={(e) => setAddForm({ ...addForm, lengthMm: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Surface Finish</label>
                  <input
                    type="text"
                    value={addForm.finish}
                    onChange={(e) => setAddForm({ ...addForm, finish: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Unit Weight (Kg/Pc)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={addForm.weightPerPcKg}
                    onChange={(e) => setAddForm({ ...addForm, weightPerPcKg: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Rate / Piece (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={addForm.pricePerPiece}
                    onChange={(e) => setAddForm({ ...addForm, pricePerPiece: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Rate / Kg (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={addForm.pricePerKg}
                    onChange={(e) => setAddForm({ ...addForm, pricePerKg: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Inventory Stock (Pcs)</label>
                  <input
                    type="number"
                    value={addForm.stockPcs}
                    onChange={(e) => setAddForm({ ...addForm, stockPcs: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Surplus Clearance Lot</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '40px' }}>
                    <input
                      type="checkbox"
                      id="addSurplusCheck"
                      checked={addForm.isSurplus}
                      onChange={(e) => setAddForm({ ...addForm, isSurplus: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="addSurplusCheck" style={{ margin: 0, textTransform: 'none', cursor: 'pointer' }}>
                      Mark as Surplus Clearance (-{addForm.surplusDiscountPct}%)
                    </label>
                  </div>
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
                  <Plus size={15} />
                  <span>Register Fastener SKU</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fastener Modal */}
      {editProduct && (
        <div className="modal-overlay active" onClick={() => setEditProduct(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                  Edit Fastener: {editProduct.sku}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Update rate margins, warehouse stock levels, or specifications
                </span>
              </div>
              <button type="button" onClick={() => setEditProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitEditForm}>
              <div className="admin-form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                />
              </div>

              <div className="admin-modal-grid" style={{ marginTop: '12px' }}>
                <div className="admin-form-group">
                  <label>Standard</label>
                  <input
                    type="text"
                    value={editProduct.standard}
                    onChange={(e) => setEditProduct({ ...editProduct, standard: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Property Class / Grade</label>
                  <input
                    type="text"
                    value={editProduct.grade}
                    onChange={(e) => setEditProduct({ ...editProduct, grade: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Rate / Piece (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProduct.pricePerPiece}
                    onChange={(e) => setEditProduct({ ...editProduct, pricePerPiece: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Rate / Kg (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProduct.pricePerKg}
                    onChange={(e) => setEditProduct({ ...editProduct, pricePerKg: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Unit Weight (Kg/Pc)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editProduct.weightPerPcKg}
                    onChange={(e) => setEditProduct({ ...editProduct, weightPerPcKg: parseFloat(e.target.value) || 0.06 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Inventory Stock (Pcs)</label>
                  <input
                    type="number"
                    value={editProduct.stockPcs}
                    onChange={(e) => setEditProduct({ ...editProduct, stockPcs: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Surface Finish</label>
                  <input
                    type="text"
                    value={editProduct.finish}
                    onChange={(e) => setEditProduct({ ...editProduct, finish: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Surplus Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '40px' }}>
                    <input
                      type="checkbox"
                      id="editSurplusCheck"
                      checked={Boolean(editProduct.isSurplus)}
                      onChange={(e) => setEditProduct({ ...editProduct, isSurplus: e.target.checked, surplusDiscountPct: e.target.checked ? 35 : 0 })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="editSurplusCheck" style={{ margin: 0, textTransform: 'none', cursor: 'pointer' }}>
                      Mark as Surplus Clearance (-{editProduct.surplusDiscountPct || 35}%)
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setEditProduct(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <CheckCircle2 size={15} />
                  <span>Save SKU Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProduct && (
        <div className="modal-overlay active" onClick={() => setDeleteProduct(null)}>
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
                Delete Fastener SKU?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                Are you sure you want to delete <strong>{deleteProduct.sku}</strong> ({deleteProduct.name})?
                This will delist the product from both the public catalog matrix and the RFQ engine.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => setDeleteProduct(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, background: '#DC2626' }}
                onClick={confirmDelete}
              >
                Yes, Delete SKU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
