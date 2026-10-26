'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MainHeader from '@/components/header/MainHeader';
import RapidRFQWidget from '@/components/home/RapidRFQWidget';
import CartDrawer from '@/components/cart/CartDrawer';
import { GlobalUnit, RfqLineItem } from '@/lib/types';
import { ShieldCheck, FileSpreadsheet, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';

export default function BulkOrderPage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  return (
    <main style={{ background: 'var(--color-surface-bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <MainHeader
        unit={globalUnit}
        onUnitToggle={(u) => setGlobalUnit(u)}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Responsive Breadcrumbs */}
      <div style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-surface-border)', padding: '10px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={13} />
          <Link href="/#catalog" style={{ color: 'inherit', textDecoration: 'none' }}>Catalog</Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Bulk Fastener RFQ Engine</span>
        </div>
      </div>

      {/* Responsive Hero Banner */}
      <section className="bulk-order-hero">
        <div className="container">
          <div className="bulk-order-badge">
            <span>DIRECT FACTORY OEM INTAKE</span>
            <span className="dot">//</span>
            <span>BULK TARIFF CALCULATOR</span>
          </div>

          <h1 className="bulk-order-title">
            Enterprise Bulk Fastener Procurement & RFQ Engine
          </h1>

          <p className="bulk-order-desc">
            Multi-line metric matrix with real-time volume tier discounting (up to 25% on ₹1,00,000+ purchase).
            Dual conversion between PCS and KGS with direct mill test inspection certificates included.
          </p>

          <div className="bulk-order-trust-strip">
            <span className="trust-item green">
              <CheckCircle2 size={15} /> Instant PDF Quotation Generation
            </span>
            <span className="trust-item red">
              <FileSpreadsheet size={15} /> CSV / Excel Batch Upload Supported
            </span>
            <span className="trust-item amber">
              <ShieldCheck size={15} /> 100% Guaranteed Thread Tolerance 6g
            </span>
          </div>
        </div>
      </section>

      {/* Rapid RFQ Component */}
      <div className="bulk-order-widget-wrap">
        <RapidRFQWidget hideHeader={true} />
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={() => {}}
        onRemoveItem={() => {}}
      />
    </main>
  );
}
