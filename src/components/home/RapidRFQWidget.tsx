'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileSpreadsheet, 
  Upload, 
  Trash2, 
  Plus, 
  Send, 
  MessageSquare, 
  CheckCircle,
  FileDown,
  ArrowRight
} from 'lucide-react';
import { GlobalUnit, RfqLineItem } from '@/lib/types';
import { calculateRfqSummary, formatINR } from '@/lib/rfq-calculator';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { getStoredCart, setStoredCart } from '@/lib/cart';
import { getStoredUser } from '@/lib/auth';
import { showToast, showSuccessAlert, showErrorAlert } from '@/lib/swal';

interface RapidRFQWidgetProps {
  hideHeader?: boolean;
}

export default function RapidRFQWidget({ hideHeader = false }: RapidRFQWidgetProps) {
  const router = useRouter();
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Dynamic line items (starts empty until customer selects a fastener)
  const [items, setItems] = useState<RfqLineItem[]>([]);

  // Restore cart on mount
  useEffect(() => {
    const saved = getStoredCart();
    if (saved && saved.length > 0) {
      // Ensure any item without an imageUrl is enriched with the catalog image
      const enriched = saved.map((item) => {
        if (!item.imageUrl) {
          const match = INITIAL_PRODUCTS.find((p) => p.sku === item.sku);
          return { ...item, imageUrl: match?.imageUrl || '/assets/bolt_zinc.jpg' };
        }
        return item;
      });
      setItems(enriched);
    } else {
      setItems([]);
    }
  }, []);

  const [selectedSku, setSelectedSku] = useState(INITIAL_PRODUCTS[1].sku);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState('');
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string | number>>(new Set());

  // Multi-selection handlers
  const toggleSelectLine = (id: string | number) => {
    setSelectedLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAllLines = () => {
    if (selectedLineIds.size === items.length && items.length > 0) {
      setSelectedLineIds(new Set());
    } else {
      setSelectedLineIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleDeleteSelectedLines = () => {
    if (selectedLineIds.size === 0) return;
    const count = selectedLineIds.size;
    setItems((prev) => {
      const updated = prev.filter((item) => !selectedLineIds.has(item.id));
      setStoredCart(updated);
      return updated;
    });
    setSelectedLineIds(new Set());
    showToast(`${count} item${count > 1 ? 's' : ''} removed from bulk order`, 'success');
  };

  // Switch between PCS and KGS
  const handleUnitSwitch = (newUnit: GlobalUnit) => {
    setGlobalUnit(newUnit);
    setItems((prev) => {
      const updated = prev.map((item) => {
        const prod = INITIAL_PRODUCTS.find((p) => p.sku === item.sku);
        if (!prod) return item;

        const rate = newUnit === 'PCS' ? prod.pricePerPiece : prod.pricePerKg;
        const qty = newUnit === 'PCS' ? item.quantity : Math.round(item.quantity * prod.weightPerPcKg);
        const weight = newUnit === 'PCS' ? qty * prod.weightPerPcKg : qty;
        const total = qty * rate;

        return {
          ...item,
          unit: newUnit,
          unitRate: rate,
          quantity: qty,
          totalWeightKg: weight,
          rowTotal: total,
        };
      });
      setStoredCart(updated);
      return updated;
    });
  };

  // Adjust quantity
  const handleQtyChange = (id: string | number, newQty: number) => {
    const validQty = Math.max(10, newQty);
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const totalWeight = globalUnit === 'PCS' ? validQty * item.weightPerPcKg : validQty;
          return {
            ...item,
            quantity: validQty,
            totalWeightKg: totalWeight,
            rowTotal: validQty * item.unitRate,
          };
        }
        return item;
      });
      setStoredCart(updated);
      return updated;
    });
  };

  // Add SKU to table
  const handleAddSku = () => {
    const prod = INITIAL_PRODUCTS.find((p) => p.sku === selectedSku);
    if (!prod) return;

    const rate = globalUnit === 'PCS' ? prod.pricePerPiece : prod.pricePerKg;
    const defaultQty = globalUnit === 'PCS' ? 500 : 50;

    const newItem: RfqLineItem = {
      id: Date.now(),
      productId: prod.id,
      sku: prod.sku,
      name: prod.name,
      standard: prod.standard,
      unit: globalUnit,
      unitRate: rate,
      quantity: defaultQty,
      weightPerPcKg: prod.weightPerPcKg,
      totalWeightKg: globalUnit === 'PCS' ? defaultQty * prod.weightPerPcKg : defaultQty,
      rowTotal: defaultQty * rate,
      imageUrl: prod.imageUrl || '/assets/bolt_zinc.jpg',
    };

    setItems((prev) => {
      const updated = [...prev, newItem];
      setStoredCart(updated);
      return updated;
    });
  };

  // Remove row
  const handleRemoveRow = (id: string | number) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      setStoredCart(updated);
      return updated;
    });
    setSelectedLineIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const summary = calculateRfqSummary(items);

  const handleGenerateQuote = () => {
    const rfqNumber = 'RFQ-CBH-2025-' + Math.floor(1000 + Math.random() * 9000);
    setQuoteSuccessMsg(`Official Quotation #${rfqNumber} generated! Sent to client portal.`);
    setTimeout(() => setQuoteSuccessMsg(''), 6000);
  };

  return (
    <section className="rfq-view-container" id="rfq-section" style={{ background: 'var(--color-surface-bg)' }}>
      <div className="container">
        {/* Header Block (Optional for dedicated /bulk-order page) */}
        {!hideHeader && (
          <div className="rfq-header-block">
            <div className="rfq-header-title">
              <span>OEM Rapid Quotation Engine</span>
              <h2>Rapid RFQ & Dual-Unit Matrix</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', maxWidth: '440px' }}>
              Calculate procurement dynamically by pieces or weight tonnage. Automatic tier discounts applied in real time as your batch volume scales.
            </p>
          </div>
        )}

        {/* Layout Bento */}
        <div className="rfq-layout-grid">
          {/* Left: Interactive Fast Table */}
          <div className="rfq-table-card">
            <div className="rfq-card-head">
              <h3>
                <span>Fast Item Intake (DIN / Metric Standard)</span>
              </h3>

              {/* Unit Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Global Unit:
                </span>
                <div className="unit-switcher">
                  <button
                    type="button"
                    className={globalUnit === 'PCS' ? 'active' : ''}
                    onClick={() => handleUnitSwitch('PCS')}
                  >
                    PCS
                  </button>
                  <button
                    type="button"
                    className={globalUnit === 'KGS' ? 'active' : ''}
                    onClick={() => handleUnitSwitch('KGS')}
                  >
                    KGS
                  </button>
                </div>
              </div>
            </div>

            {/* Batch Selection Action Bar */}
            {selectedLineIds.size > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                marginBottom: '14px',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>
                    {selectedLineIds.size} of {items.length} product{items.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedLineIds(new Set())}
                    style={{ fontSize: '12px', color: '#64748B', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Clear selection
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLineIds(new Set(items.map((i) => i.id)))}
                    style={{ fontSize: '12px', color: '#B91C1C', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Select all ({items.length})
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteSelectedLines}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#DC2626',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(220,38,38,0.2)'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete Selected ({selectedLineIds.size})</span>
                </button>
              </div>
            )}

            {/* Desktop & Tablet Parametric Table View */}
            <div className="rfq-table-responsive hide-mobile">
              <table className="rfq-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={items.length > 0 && selectedLineIds.size === items.length}
                        onChange={toggleSelectAllLines}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        title={selectedLineIds.size === items.length ? 'Deselect all' : 'Select all'}
                      />
                    </th>
                    <th>Fastener Spec / Description</th>
                    <th>Standard</th>
                    <th>Unit Rate</th>
                    <th style={{ width: '130px' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Row Total</th>
                    <th style={{ width: '30px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '32px' }}>🛒</span>
                          <strong style={{ fontSize: '15px', color: '#1E293B' }}>Your RFQ Cart is currently empty</strong>
                          <p style={{ margin: 0, fontSize: '12px', maxWidth: '360px', color: '#64748B' }}>
                            Select a fastener SKU from the builder above and click &quot;Add Line to RFQ&quot;, or browse our full fasteners catalog.
                          </p>
                          <a
                            href="/products"
                            className="btn-primary"
                            style={{ marginTop: '10px', padding: '7px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            Browse Products Catalog
                          </a>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                    const itemImage = item.imageUrl || INITIAL_PRODUCTS.find((p) => p.sku === item.sku)?.imageUrl || '/assets/bolt_zinc.jpg';
                    const isSelected = selectedLineIds.has(item.id);
                    return (
                      <tr key={item.id} style={{ backgroundColor: isSelected ? 'rgba(254, 242, 242, 0.6)' : undefined }}>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectLine(item.id)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            title="Select line item"
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '6px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0,
                              padding: '2px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                              <img
                                src={itemImage}
                                alt={item.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain'
                                }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/assets/bolt_zinc.jpg';
                                }}
                              />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div className="rfq-item-desc">{item.name}</div>
                              <div className="rfq-item-sku">SKU: {item.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-din">{item.standard}</span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {formatINR(item.unitRate)} / {item.unit === 'PCS' ? 'Pc' : 'Kg'}
                        </td>
                        <td>
                          <div className="rfq-qty-stepper">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item.id, item.quantity - (globalUnit === 'PCS' ? 500 : 50))}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                            />
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item.id, item.quantity + (globalUnit === 'PCS' ? 500 : 50))}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="rfq-row-total">{formatINR(item.rowTotal)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-remove-row"
                            onClick={() => handleRemoveRow(item.id)}
                            title="Remove line"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>

            {/* Mobile App RFQ Card View (Seamless Phone Experience) */}
            <div className="rfq-mobile-cards show-mobile-only">
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', margin: '10px 0' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748B' }}>Your RFQ Cart is empty</p>
                  <a href="/products" className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-block' }}>
                    Browse Fasteners
                  </a>
                </div>
              ) : (
                items.map((item) => {
                const itemImage = item.imageUrl || INITIAL_PRODUCTS.find((p) => p.sku === item.sku)?.imageUrl || '/assets/bolt_zinc.jpg';
                return (
                  <div className="rfq-mobile-item-card" key={item.id}>
                    <div className="rfq-mob-card-head">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={selectedLineIds.has(item.id)}
                          onChange={() => toggleSelectLine(item.id)}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          title="Select item"
                        />
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px',
                          flexShrink: 0
                        }}>
                          <img
                            src={itemImage}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/assets/bolt_zinc.jpg';
                            }}
                          />
                        </div>
                        <div>
                          <span className="badge badge-din">{item.standard}</span>
                          <span className="rfq-item-sku" style={{ marginLeft: '6px' }}>{item.sku}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-remove-row"
                        onClick={() => handleRemoveRow(item.id)}
                        title="Remove line item"
                        style={{ padding: '6px', color: '#DC2626' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                  <div className="rfq-mob-card-title">{item.name}</div>

                  <div className="rfq-mob-card-pricing">
                    <div className="rfq-mob-rate">
                      <span className="label">Rate:</span>
                      <strong>{formatINR(item.unitRate)} / {item.unit === 'PCS' ? 'Pc' : 'Kg'}</strong>
                    </div>
                    <div className="rfq-mob-subtotal">
                      <span className="label">Total:</span>
                      <strong className="val">{formatINR(item.rowTotal)}</strong>
                    </div>
                  </div>

                  <div className="rfq-mob-card-actions">
                    <div className="mob-stepper">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, item.quantity - (globalUnit === 'PCS' ? 500 : 50))}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                      />
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, item.quantity + (globalUnit === 'PCS' ? 500 : 50))}
                      >
                        +
                      </button>
                    </div>
                    <span className="mob-unit-badge">{globalUnit}</span>
                  </div>
                </div>
              );
            })
          )}
          </div>

            {/* Quick Sku Adder & CSV Bar */}
            <div className="rfq-tools-strip">
              <div className="quick-sku-picker">
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-dark-800)' }}>
                  Add Line Item:
                </span>
                <select
                  className="quick-sku-select"
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                >
                  {INITIAL_PRODUCTS.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.standard} | {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-dark"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                  onClick={handleAddSku}
                >
                  <Plus size={14} />
                  <span>Add SKU</span>
                </button>
              </div>

              {/* CSV Upload */}
              <div className="csv-upload-box">
                <div className="csv-info">
                  <FileSpreadsheet size={20} color="var(--color-primary)" />
                  <span>Upload BOM (.CSV / .XLSX) for 100+ fastener batch quoting</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => showToast('Downloaded CBH_BOM_Template.xlsx (DIN Standard)', 'info')}
                  >
                    <FileDown size={14} />
                    <span>Download BOM Template</span>
                  </button>
                  <button
                    type="button"
                    className="btn-dark"
                    style={{ fontSize: '13px' }}
                    onClick={() => showSuccessAlert('BOM File Parsed', '14 standard fastener items have been imported to your RFQ matrix with dual-unit live pricing.')}
                  >
                    <Upload size={14} />
                    <span>Browse File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: RFQ Summary & Discount Dock */}
          <div className="rfq-summary-card">
            <div className="rfq-summary-header">
              <h3>RFQ Summary</h3>
              <span className="badge badge-certified">
                <CheckCircle size={12} />
                GST Registered
              </span>
            </div>

            {/* Volume Tier Progress Widget */}
            <div className="volume-tier-widget">
              <div className="tier-top">
                <span className="tier-title">Volume Discount Tier</span>
                <span className="tier-badge-val">{summary.tierLabel}</span>
              </div>

              <div className="tier-progress-track">
                <div
                  className="tier-progress-fill"
                  style={{ width: `${summary.progressPercent}%` }}
                />
              </div>

              <div className="tier-milestones">
                <span className={summary.grossAmount >= 25000 ? 'active' : ''}>₹25k (5%)</span>
                <span className={summary.grossAmount >= 50000 ? 'active' : ''}>₹50k (15%)</span>
                <span className={summary.grossAmount >= 100000 ? 'active' : ''}>₹1.0L (25%)</span>
              </div>

              <p className="tier-hint">
                {summary.nextTierDelta > 0 ? (
                  <>
                    Add <strong>{formatINR(summary.nextTierDelta)}</strong> more to unlock next volume rebate level!
                  </>
                ) : (
                  <strong style={{ color: '#059669' }}>
                    Maximum wholesale OEM tier achieved (25% discount)!
                  </strong>
                )}
              </p>
            </div>

            {/* Numbers Breakdown */}
            <div className="rfq-numbers">
              <div className="rfq-num-row">
                <span>Gross Item Total ({summary.totalWeightKg.toFixed(1)} kg):</span>
                <strong>{formatINR(summary.grossAmount)}</strong>
              </div>
              <div className="rfq-num-row discount-row">
                <span>Wholesale Slab Rebate (-{summary.slabDiscountPct}%):</span>
                <span>-{formatINR(summary.slabDiscountAmount)}</span>
              </div>
              <div className="rfq-num-row">
                <span>Estimated Freight (Pan-India):</span>
                <strong style={{ color: '#059669' }}>
                  {summary.freightAmount === 0 ? 'FREE (Above ₹25,000)' : formatINR(summary.freightAmount)}
                </strong>
              </div>
              <div className="rfq-num-row">
                <span>Applicable GST (18%):</span>
                <strong>{formatINR(summary.gstAmount)}</strong>
              </div>
            </div>

            {/* Total Box */}
            <div className="rfq-total-box">
              <span>Net RFQ Est:</span>
              <strong>{formatINR(summary.netTotal)}</strong>
            </div>

            {quoteSuccessMsg && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #059669',
                color: '#065F46',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '12px',
                fontWeight: 600,
              }}>
                {quoteSuccessMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="rfq-action-buttons">
              <button
                type="button"
                disabled={isPaying || items.length === 0}
                onClick={async () => {
                  try {
                    setIsPaying(true);
                    setPayError(null);
                    // Ensure current cart items are stored
                    setStoredCart(items);

                    // Check if user is logged in
                    const user = getStoredUser();
                    if (!user) {
                      router.push('/login?redirect=/checkout');
                      return;
                    }

                    const orderId = `CBH-ORD-${Date.now()}`;
                    const res = await fetch('/api/payment/phonepe/initiate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        amount: summary.netTotal,
                        orderId,
                        customerName: user.fullName || 'Commercial RFQ Buyer',
                        customerPhone: user.phone || '9888021000',
                        customerEmail: user.email || 'rfq@cbhfasteners.com',
                        companyName: user.companyName || 'Industrial Procurement Desk',
                        totalWeightKg: summary.totalWeightKg,
                      }),
                    });
                    const data = await res.json();
                    if (data.success && data.paymentUrl) {
                      window.location.href = data.paymentUrl;
                    } else {
                      setIsPaying(false);
                      setPayError(data.error || 'Failed to initiate PhonePe payment.');
                    }
                  } catch (err: any) {
                    setIsPaying(false);
                    setPayError(err.message || 'Payment connection error.');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: items.length === 0 ? '#94A3B8' : '#5f259f',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: items.length === 0 ? 'not-allowed' : isPaying ? 'wait' : 'pointer',
                  border: 'none',
                  boxShadow: items.length === 0 ? 'none' : '0 4px 12px rgba(95, 37, 159, 0.25)',
                  opacity: isPaying ? 0.8 : items.length === 0 ? 0.6 : 1,
                }}
              >
                <span>{isPaying ? 'Redirecting to PhonePe Gateway...' : '⚡ Pay via PhonePe Gateway'}</span>
                <ArrowRight size={16} />
              </button>

              {payError && (
                <div style={{ color: '#DC2626', fontSize: '11px', textAlign: 'center', fontWeight: 700, padding: '4px 0' }}>
                  {payError}
                </div>
              )}
 
              <button
                type="button"
                className="btn-primary"
                disabled={items.length === 0}
                style={{
                  width: '100%',
                  padding: '10px',
                  opacity: items.length === 0 ? 0.6 : 1,
                  cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                }}
                onClick={handleGenerateQuote}
              >
                <span>Generate Instant Bulk Quote</span>
                <Send size={15} />
              </button>

              <a
                href={`https://wa.me/919888021000?text=Hello%20CBH%20Fasteners%2C%20requesting%20quote%20for%20bulk%20procurement%20of%20fasteners.%20Gross%20Est%3A%20${encodeURIComponent(formatINR(summary.netTotal))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-rfq"
              >
                <MessageSquare size={15} />
                <span>Direct WhatsApp RFQ (+91 98880 21000)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
