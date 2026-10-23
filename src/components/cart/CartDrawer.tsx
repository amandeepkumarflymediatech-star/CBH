'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { RfqLineItem } from '@/lib/types';
import { calculateRfqSummary, formatINR } from '@/lib/rfq-calculator';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: RfqLineItem[];
  onUpdateQty: (id: string | number, qty: number) => void;
  onRemoveItem: (id: string | number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
}: CartDrawerProps) {
  const summary = calculateRfqSummary(items);

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      <div className={`drawer-panel ${isOpen ? 'active' : ''}`}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-surface-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-surface-bg)'
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase' }}>
              RFQ Order Cart ({items.length})
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Dual PCS & KGS Live Billing
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ color: 'var(--color-dark-700)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
              <p>Your RFQ cart is empty.</p>
              <button
                type="button"
                className="btn-dark"
                style={{ marginTop: '14px' }}
                onClick={onClose}
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--color-surface-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-din" style={{ marginBottom: '4px' }}>
                        {item.standard}
                      </span>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-dark-900)', lineHeight: 1.3 }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
                        SKU: {item.sku}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      style={{ color: 'var(--color-text-subtle)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-surface-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        style={{ width: '22px', height: '22px', background: 'var(--color-surface-subtle)', border: '1px solid var(--color-surface-border)', borderRadius: '2px', fontWeight: 700 }}
                        onClick={() => onUpdateQty(item.id, Math.max(10, item.quantity - 100))}
                      >
                        -
                      </button>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, minWidth: '40px', textAlign: 'center' }}>
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        type="button"
                        style={{ width: '22px', height: '22px', background: 'var(--color-surface-subtle)', border: '1px solid var(--color-surface-border)', borderRadius: '2px', fontWeight: 700 }}
                        onClick={() => onUpdateQty(item.id, item.quantity + 100)}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {formatINR(item.rowTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--color-surface-border)',
            background: 'var(--color-surface-bg)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Subtotal ({summary.totalWeightKg.toFixed(1)} kg):</span>
                <span>{formatINR(summary.grossAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                <span>Volume Slab Rebate (-{summary.slabDiscountPct}%):</span>
                <span>-{formatINR(summary.slabDiscountAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>GST (18%):</span>
                <span>{formatINR(summary.gstAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-900)', paddingTop: '6px', borderTop: '1px solid var(--color-surface-border)' }}>
                <span>Estimated Net:</span>
                <span style={{ color: '#D2051E' }}>{formatINR(summary.netTotal)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/bulk-order"
                className="btn-primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={onClose}
              >
                <span>Complete Bulk Order Matrix</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
              <ShieldCheck size={14} color="#059669" />
              <span>NABL 3.1 Traceability Certificate Generated Upon Checkout</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
