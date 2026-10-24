'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MainHeader from '@/components/header/MainHeader';
import NavSubBar from '@/components/header/NavSubBar';
import CartDrawer from '@/components/cart/CartDrawer';
import { GlobalUnit } from '@/lib/types';
import { INITIAL_ORDERS, INITIAL_QUOTES } from '@/lib/mock-data';
import { formatINR } from '@/lib/rfq-calculator';
import { 
  Building2, 
  ShieldCheck, 
  Truck, 
  FileText, 
  FileDown, 
  Package, 
  CheckCircle2, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

export default function CustomerPortalPage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [activeTab, setActiveTab] = useState<'orders' | 'rfqs' | 'certs'>('orders');
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <main style={{ background: 'var(--color-surface-bg)' }}>
      <MainHeader
        unit={globalUnit}
        onUnitToggle={(u) => setGlobalUnit(u)}
        cartCount={0}
        onOpenCart={() => setIsCartOpen(true)}
      />
      <NavSubBar />

      <div className="portal-container">
        {/* Header */}
        <div className="portal-header">
          <div className="portal-title">
            <h2>Customer Enterprise Portal</h2>
            <p>Welcome back, Rajesh Sharma • Apex Heavy Infrastructure Ltd.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/bulk-order" className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              <span>Create New Bulk RFQ</span>
            </Link>
          </div>
        </div>

        {/* Portal Bento Grid */}
        <div className="portal-bento-grid">
          {/* Left Sidebar Profile & Tier Status */}
          <div className="portal-sidebar-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--color-surface-subtle)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-headline)',
                fontSize: '22px',
                fontWeight: 800
              }}>
                A
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-900)' }}>
                  Apex Heavy Infra Ltd.
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  GSTIN: 29AABCA1234F1Z5
                </span>
              </div>
            </div>

            {/* Tier Widget */}
            <div style={{ background: 'var(--color-surface-bg)', border: '1px solid var(--color-surface-border)', borderRadius: '6px', padding: '14px', margin: '18px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Procurement Tier
                </span>
                <span className="badge badge-vip">
                  DIAMOND OEM (-18%)
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--color-surface-border)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: '#D97706' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                Procure <strong>1.8 MT</strong> more fasteners this quarter to unlock <strong>VIP OEM (25% Flat)</strong> tier!
              </p>
            </div>

            {/* Quick Profile Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--color-dark-800)' }}>
              <div>
                <span style={{ color: 'var(--color-text-subtle)', display: 'block', fontSize: '11px' }}>PRIMARY CONTACT</span>
                <strong>Rajesh Sharma (Procurement Lead)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-subtle)', display: 'block', fontSize: '11px' }}>DELIVERY DEPOT</span>
                <strong>Plot 44, Peenya Phase 2, Bengaluru, KA - 560058</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-subtle)', display: 'block', fontSize: '11px' }}>APPROVED CREDIT LINE</span>
                <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>₹ 25,00,000 (30 Days Net)</strong>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-surface-subtle)' }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: activeTab === 'orders' ? 'var(--color-dark-900)' : 'transparent',
                  color: activeTab === 'orders' ? '#FFFFFF' : 'var(--color-dark-800)',
                  textAlign: 'left'
                }}
                onClick={() => setActiveTab('orders')}
              >
                <Truck size={16} />
                <span>Active Orders & Tracking</span>
              </button>

              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: activeTab === 'rfqs' ? 'var(--color-dark-900)' : 'transparent',
                  color: activeTab === 'rfqs' ? '#FFFFFF' : 'var(--color-dark-800)',
                  textAlign: 'left'
                }}
                onClick={() => setActiveTab('rfqs')}
              >
                <FileText size={16} />
                <span>Saved RFQs & Quotations</span>
              </button>

              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: activeTab === 'certs' ? 'var(--color-dark-900)' : 'transparent',
                  color: activeTab === 'certs' ? '#FFFFFF' : 'var(--color-dark-800)',
                  textAlign: 'left'
                }}
                onClick={() => setActiveTab('certs')}
              >
                <ShieldCheck size={16} />
                <span>NABL Test Certificates</span>
              </button>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="portal-main-card">
            {activeTab === 'orders' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px' }}>
                  Purchase Orders & Live Freight Tracking
                </h3>

                {INITIAL_ORDERS.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      border: '1px solid var(--color-surface-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '20px',
                      marginBottom: '20px',
                      background: 'var(--color-surface-bg)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <span className="badge badge-din" style={{ marginRight: '8px' }}>
                          {order.orderNumber}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          Placed on {order.date}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${order.status === 'DELIVERED' ? 'badge-certified' : 'badge-vip'}`}>
                          {order.status}
                        </span>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--color-primary)' }}>
                          {formatINR(order.netAmount)}
                        </strong>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="timeline-tracker">
                      <div className="step-node completed">
                        <div className="step-circle">✓</div>
                        <span className="step-label">Order Placed</span>
                      </div>
                      <div className="step-node completed">
                        <div className="step-circle">✓</div>
                        <span className="step-label">Lab Calibration</span>
                      </div>
                      <div className={`step-node ${order.status !== 'PROCESSING' ? 'completed' : 'active'}`}>
                        <div className="step-circle">✓</div>
                        <span className="step-label">Dispatched</span>
                      </div>
                      <div className={`step-node ${order.status === 'IN_TRANSIT' ? 'active' : order.status === 'DELIVERED' ? 'completed' : ''}`}>
                        <div className="step-circle">4</div>
                        <span className="step-label">In Transit</span>
                      </div>
                      <div className={`step-node ${order.status === 'DELIVERED' ? 'completed' : ''}`}>
                        <div className="step-circle">5</div>
                        <span className="step-label">Delivered</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)', background: '#FFFFFF', padding: '12px', borderRadius: '4px', border: '1px solid var(--color-surface-border)' }}>
                      <div>
                        <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>CARRIER / TRUCK:</span>
                        <strong>{order.carrier}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>DOCKET TRACKING #:</span>
                        <strong style={{ color: '#0284C7' }}>{order.trackingNumber}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>TOTAL LOT WEIGHT:</span>
                        <strong>{order.totalWeightKg} Kg ({ (order.totalWeightKg / 1000).toFixed(2) } MT)</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>MTC CERTIFICATE:</span>
                        <button
                          type="button"
                          style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => alert(`Downloading NABL Accredited Mill Test Certificate #${order.mtcCertNumber} with EN 10204 3.1 inspection lot specs.`)}
                        >
                          <FileDown size={14} /> Download 3.1 PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'rfqs' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px' }}>
                  Saved RFQs & Formal Commercial Quotations
                </h3>

                <table className="rfq-table">
                  <thead>
                    <tr>
                      <th>RFQ Reference</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Discount Slab</th>
                      <th>Net Quote Est</th>
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
                        <td>{q.date}</td>
                        <td>{q.itemsCount} SKUs</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>-{q.discountPct}% OEM Slab</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-primary)' }}>
                          {formatINR(q.netTotal)}
                        </td>
                        <td>
                          <span className="badge badge-certified">{q.status}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-dark"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                            onClick={() => alert(`Converting Quotation ${q.rfqNumber} into Enterprise Purchase Order.`)}
                          >
                            <span>Convert to PO</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'certs' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px' }}>
                  NABL Metallurgical Inspection Certificates
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  All CBH fasteners are batch-etched with traceable heat numbers. Download certified EN 10204 3.1 chemical composition and tensile proof load reports.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-bg)', padding: '14px', borderRadius: '4px', border: '1px solid var(--color-surface-border)' }}>
                    <div>
                      <strong>MTC-CBH-2025-4491-NABL</strong>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>DIN 933 High Tensile 8.8 BP • Batch Heat #HT-8829-KA</div>
                    </div>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => alert('Downloaded MTC-CBH-2025-4491-NABL.pdf')}
                    >
                      <FileDown size={14} /> Download PDF
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-bg)', padding: '14px', borderRadius: '4px', border: '1px solid var(--color-surface-border)' }}>
                    <div>
                      <strong>MTC-CBH-2025-3810-NABL</strong>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ASTM A193 B7 Heavy Continuous Rods • Batch Heat #HT-3914-GJ</div>
                    </div>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => alert('Downloaded MTC-CBH-2025-3810-NABL.pdf')}
                    >
                      <FileDown size={14} /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={[]}
        onUpdateQty={() => {}}
        onRemoveItem={() => {}}
      />
    </main>
  );
}
