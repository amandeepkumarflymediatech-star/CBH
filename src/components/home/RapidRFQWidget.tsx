'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

interface RapidRFQWidgetProps {
  hideHeader?: boolean;
}

export default function RapidRFQWidget({ hideHeader = false }: RapidRFQWidgetProps) {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');

  // Initial line items matching the exact screenshot
  const [items, setItems] = useState<RfqLineItem[]>([
    {
      id: 1,
      productId: 1,
      sku: 'CBH-933-M10-100-BP',
      name: 'Hex Screws Full Thread M10x1.5x100mm Grade 5.8 BP',
      standard: 'DIN 933',
      unit: 'PCS',
      unitRate: 5.39,
      quantity: 2500,
      weightPerPcKg: 0.0601,
      totalWeightKg: 2500 * 0.0601,
      rowTotal: 2500 * 5.39,
    },
    {
      id: 2,
      productId: 3,
      sku: 'CBH-933-M10-120-BZP',
      name: 'Hex Screws Full Thread M10x1.5x120mm Grade 5.8 Blkzp',
      standard: 'DIN 933',
      unit: 'PCS',
      unitRate: 9.84,
      quantity: 3000,
      weightPerPcKg: 0.0680,
      totalWeightKg: 3000 * 0.0680,
      rowTotal: 3000 * 9.84,
    },
    {
      id: 3,
      productId: 7,
      sku: 'CBH-933-M10-140-BZP',
      name: 'Hex Screws Full Thread M10x1.5x140mm Grade 5.8 Blkzp',
      standard: 'DIN 933',
      unit: 'PCS',
      unitRate: 10.62,
      quantity: 2000,
      weightPerPcKg: 0.0775,
      totalWeightKg: 2000 * 0.0775,
      rowTotal: 2000 * 10.62,
    },
  ]);

  const [selectedSku, setSelectedSku] = useState(INITIAL_PRODUCTS[1].sku);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState('');

  // Switch between PCS and KGS
  const handleUnitSwitch = (newUnit: GlobalUnit) => {
    setGlobalUnit(newUnit);
    setItems((prev) =>
      prev.map((item) => {
        const prod = INITIAL_PRODUCTS.find((p) => p.sku === item.sku);
        if (!prod) return item;

        const rate = newUnit === 'PCS' ? prod.pricePerPiece : prod.pricePerKg;
        // Adjust quantity to roughly preserve scale or set standard batch
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
      })
    );
  };

  // Adjust quantity
  const handleQtyChange = (id: string | number, newQty: number) => {
    const validQty = Math.max(10, newQty);
    setItems((prev) =>
      prev.map((item) => {
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
      })
    );
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
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Remove row
  const handleRemoveRow = (id: string | number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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

            {/* Desktop & Tablet Parametric Table View */}
            <div className="rfq-table-responsive hide-mobile">
              <table className="rfq-table">
                <thead>
                  <tr>
                    <th>Fastener Spec / Description</th>
                    <th>Standard</th>
                    <th>Unit Rate</th>
                    <th style={{ width: '130px' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Row Total</th>
                    <th style={{ width: '30px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="rfq-item-desc">{item.name}</div>
                        <div className="rfq-item-sku">SKU: {item.sku}</div>
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile App RFQ Card View (Seamless Phone Experience) */}
            <div className="rfq-mobile-cards show-mobile-only">
              {items.map((item) => (
                <div className="rfq-mobile-item-card" key={item.id}>
                  <div className="rfq-mob-card-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-din">{item.standard}</span>
                      <span className="rfq-item-sku">{item.sku}</span>
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
              ))}
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
                    onClick={() => alert('Downloaded CBH_BOM_Template.xlsx with DIN standard column schemas.')}
                  >
                    <FileDown size={14} />
                    <span>Download BOM Template</span>
                  </button>
                  <button
                    type="button"
                    className="btn-dark"
                    style={{ fontSize: '13px' }}
                    onClick={() => alert('CSV file parsed! 14 standard fastener items added to your RFQ matrix.')}
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
              <Link
                href="/checkout"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#5f259f',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(95, 37, 159, 0.25)',
                }}
              >
                <span>Pay via PhonePe (Instant Order Dispatch)</span>
                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={handleGenerateQuote}
              >
                <span>Generate Instant Bulk Quote</span>
                <Send size={16} />
              </button>

              <a
                href={`https://wa.me/919888021000?text=Hello%20CBH%20Fasteners%2C%20requesting%20quote%20for%20bulk%20procurement%20of%20fasteners.%20Gross%20Est%3A%20${encodeURIComponent(formatINR(summary.netTotal))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-rfq"
              >
                <MessageSquare size={16} />
                <span>Direct WhatsApp RFQ (+91 98880 21000)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
