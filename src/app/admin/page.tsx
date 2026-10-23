'use client';

import React, { useState } from 'react';
import MainHeader from '@/components/header/MainHeader';
import NavSubBar from '@/components/header/NavSubBar';
import { INITIAL_PRODUCTS, INITIAL_QUOTES, INITIAL_ORDERS } from '@/lib/mock-data';
import { Product, GlobalUnit } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import { 
  Boxes, 
  TrendingUp, 
  FileText, 
  Truck, 
  Plus, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Flame, 
  Save 
} from 'lucide-react';

export default function AdminConsolePage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [adminTab, setAdminTab] = useState<'inventory' | 'rfqs' | 'orders'>('inventory');

  // New Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newStandard, setNewStandard] = useState('DIN 933');
  const [newGrade, setNewGrade] = useState('8.8');
  const [newPricePc, setNewPricePc] = useState('12.50');
  const [newPriceKg, setNewPriceKg] = useState('165.00');
  const [newWeight, setNewWeight] = useState('0.0750');
  const [newStock, setNewStock] = useState('10000');
  const [isSurplus, setIsSurplus] = useState(false);

  // Handle Add Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Product = {
      id: Date.now(),
      sku: newSku || `CBH-SKU-${Math.floor(100 + Math.random() * 900)}`,
      name: newName || `${newStandard} Metric Hex Fastener Grade ${newGrade}`,
      category: 'Hex Screws',
      standard: newStandard,
      grade: newGrade,
      finish: 'Black Zinc Phosphated',
      threadType: 'Full Thread',
      diameter: 'M12',
      lengthMm: 100,
      pitchMm: 1.75,
      weightPerPcKg: parseFloat(newWeight) || 0.075,
      pricePerPiece: parseFloat(newPricePc) || 12.5,
      pricePerKg: parseFloat(newPriceKg) || 165.0,
      stockPcs: parseInt(newStock) || 10000,
      stockKg: (parseInt(newStock) || 10000) * (parseFloat(newWeight) || 0.075),
      isInStock: true,
      isSurplus: isSurplus,
      surplusDiscountPct: isSurplus ? 35 : 0,
      imageUrl: '/assets/bolt_zinc.jpg',
    };

    setProducts([created, ...products]);
    setIsAddModalOpen(false);
    alert(`SKU ${created.sku} added to CBH inventory! Immediately available on storefront and bulk RFQ matrix.`);
  };

  // Toggle Surplus status
  const handleToggleSurplus = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextSurplus = !p.isSurplus;
          return {
            ...p,
            isSurplus: nextSurplus,
            surplusDiscountPct: nextSurplus ? 40 : 0,
          };
        }
        return p;
      })
    );
  };

  return (
    <main style={{ background: 'var(--color-surface-bg)' }}>
      <MainHeader
        unit={globalUnit}
        onUnitToggle={(u) => setGlobalUnit(u)}
        cartCount={0}
        onOpenCart={() => {}}
      />
      <NavSubBar />

      <div className="portal-container">
        {/* Header */}
        <div className="portal-header">
          <div className="portal-title">
            <h2>CBH Central Admin Control Console</h2>
            <p>Direct Inventory Catalog, RFQ Margins, and Pan-India Dispatch Management</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} />
              <span>Add Fastener SKU</span>
            </button>
          </div>
        </div>

        {/* KPI Dashboard */}
        <div className="admin-kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">TOTAL GROSS TURNOVER</span>
            <div className="kpi-value" style={{ color: '#D2051E' }}>₹ 84,52,400</div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>+18.4% month-on-month</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">TOTAL FREIGHT DISPATCHED</span>
            <div className="kpi-value">142.8 MT</div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Pan-India logistics depot</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">ACTIVE BULK RFQs</span>
            <div className="kpi-value" style={{ color: '#D97706' }}>8 Pending</div>
            <span style={{ fontSize: '11px', color: '#0284C7' }}>3 requires metallurgist review</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">REGISTERED OEM ACCOUNTS</span>
            <div className="kpi-value">124 Plants</div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>Diamond & VIP Tier</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            className={`catalog-tab ${adminTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setAdminTab('inventory')}
          >
            Fastener Inventory ({products.length} SKUs)
          </button>
          <button
            type="button"
            className={`catalog-tab ${adminTab === 'rfqs' ? 'active' : ''}`}
            onClick={() => setAdminTab('rfqs')}
          >
            Bulk RFQ Quotation Approvals
          </button>
          <button
            type="button"
            className={`catalog-tab ${adminTab === 'orders' ? 'active' : ''}`}
            onClick={() => setAdminTab('orders')}
          >
            Orders & Carrier Dispatch
          </button>
        </div>

        {/* Inventory View */}
        {adminTab === 'inventory' && (
          <div className="portal-main-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase' }}>
                Active Fastener Inventory Catalog
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                Direct live synchronization with Storefront & RFQ Matrix
              </span>
            </div>

            <table className="rfq-table">
              <thead>
                <tr>
                  <th>SKU & Name</th>
                  <th>Standard</th>
                  <th>Grade</th>
                  <th>Rate / Pc</th>
                  <th>Rate / Kg</th>
                  <th>Stock Levels</th>
                  <th>Surplus Lot</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.sku}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{p.name}</div>
                    </td>
                    <td>
                      <span className="badge badge-din">{p.standard}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{p.grade}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(p.pricePerPiece)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#D2051E' }}>{formatINR(p.pricePerKg)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {p.stockPcs.toLocaleString()} Pcs ({p.stockKg.toFixed(1)} Kg)
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleSurplus(p.id)}
                        className={`badge ${p.isSurplus ? 'badge-surplus' : 'badge-certified'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle surplus liquidation deal"
                      >
                        {p.isSurplus ? `SURPLUS (-${p.surplusDiscountPct}%)` : 'STANDARD'}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => alert(`Editing price margins for SKU ${p.sku}`)}
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* RFQ Approvals View */}
        {adminTab === 'rfqs' && (
          <div className="portal-main-card">
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px' }}>
              Pending Bulk RFQs & Custom Quotation Approvals
            </h3>

            <table className="rfq-table">
              <thead>
                <tr>
                  <th>RFQ Reference</th>
                  <th>Client / Plant</th>
                  <th>Quantity & Weight</th>
                  <th>Gross Est</th>
                  <th>Tier Slab</th>
                  <th>Net Quoted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_QUOTES.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <strong>{q.rfqNumber}</strong>
                    </td>
                    <td>
                      <strong>Apex Heavy Infra Ltd.</strong>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>GST: 29AABCA1234F1Z5</div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{q.itemsCount} SKUs (485 Kg)</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(q.grossAmount)}</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>-{q.discountPct}% OEM Slab</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#D2051E' }}>{formatINR(q.netTotal)}</td>
                    <td>
                      <span className="badge badge-vip">{q.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                          onClick={() => alert(`Quotation ${q.rfqNumber} approved! Issued to client portal with valid MTC spec.`)}
                        >
                          Approve Quote
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders View */}
        {adminTab === 'orders' && (
          <div className="portal-main-card">
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px' }}>
              Dispatched Orders & Logistics Management
            </h3>

            <table className="rfq-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Client</th>
                  <th>Weight</th>
                  <th>Carrier</th>
                  <th>Docket #</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_ORDERS.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <strong>{ord.orderNumber}</strong>
                    </td>
                    <td>Apex Heavy Infra Ltd.</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{ord.totalWeightKg} Kg</td>
                    <td>{ord.carrier}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#0284C7' }}>{ord.trackingNumber}</td>
                    <td>
                      <span className="badge badge-certified">{ord.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-dark"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => alert(`Updating logistics status for ${ord.orderNumber}`)}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Fastener SKU Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', color: 'var(--color-dark-900)' }}>
              Add New Fastener Product SKU
            </h3>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="finder-field">
                  <label>SKU Code</label>
                  <input
                    type="text"
                    className="finder-select"
                    placeholder="e.g. CBH-933-M12-100-8.8"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                  />
                </div>

                <div className="finder-field">
                  <label>Standard Spec</label>
                  <select
                    className="finder-select"
                    value={newStandard}
                    onChange={(e) => setNewStandard(e.target.value)}
                  >
                    <option value="DIN 933">DIN 933 (Full Thread)</option>
                    <option value="DIN 931">DIN 931 (Half Thread)</option>
                    <option value="DIN 912">DIN 912 (Socket Cap)</option>
                    <option value="DIN 934">DIN 934 (Hex Nut)</option>
                    <option value="ASTM A193">ASTM A193 B7</option>
                  </select>
                </div>
              </div>

              <div className="finder-field">
                <label>Product Title / Description</label>
                <input
                  type="text"
                  className="finder-select"
                  placeholder="e.g. Hex Screws Full Thread M12x1.75x100mm Grade 8.8 Blkzp"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="finder-field">
                  <label>Grade</label>
                  <input
                    type="text"
                    className="finder-select"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                  />
                </div>

                <div className="finder-field">
                  <label>Price Per Piece (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="finder-select"
                    value={newPricePc}
                    onChange={(e) => setNewPricePc(e.target.value)}
                  />
                </div>

                <div className="finder-field">
                  <label>Price Per Kg (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="finder-select"
                    value={newPriceKg}
                    onChange={(e) => setNewPriceKg(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="finder-field">
                  <label>Weight Per Piece (Kg)</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="finder-select"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>

                <div className="finder-field">
                  <label>Initial Stock (Pieces)</label>
                  <input
                    type="number"
                    className="finder-select"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                <input
                  type="checkbox"
                  id="surplusCheck"
                  checked={isSurplus}
                  onChange={(e) => setIsSurplus(e.target.checked)}
                />
                <label htmlFor="surplusCheck" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-dark-800)' }}>
                  Mark as Surplus Clearance Lot (-35% Market Deal)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  <span>Save SKU to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
