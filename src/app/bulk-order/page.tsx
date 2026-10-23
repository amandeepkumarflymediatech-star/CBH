'use client';

import React, { useState } from 'react';
import MainHeader from '@/components/header/MainHeader';
import NavSubBar from '@/components/header/NavSubBar';
import RapidRFQWidget from '@/components/home/RapidRFQWidget';
import CartDrawer from '@/components/cart/CartDrawer';
import { GlobalUnit, RfqLineItem } from '@/lib/types';
import { ShieldCheck, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function BulkOrderPage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  return (
    <main>
      <MainHeader
        unit={globalUnit}
        onUnitToggle={(u) => setGlobalUnit(u)}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />
      <NavSubBar />

      <div style={{ background: '#FFFFFF', padding: '30px 0 20px', borderBottom: '1px solid var(--color-surface-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '6px' }}>
            <span>DIRECT FACTORY OEM INTAKE</span>
            <span>//</span>
            <span>BULK TARIFF CALCULATOR</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '38px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)' }}>
            Enterprise Bulk Fastener Procurement & RFQ Engine
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', maxWidth: '720px', marginTop: '6px' }}>
            Multi-line metric matrix with real-time volume tier discounting (up to 25% on ₹1,00,000+ purchase). Dual conversion between PCS and KGS with direct mill test inspection certificates included.
          </p>

          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-dark-800)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669' }}>
              <CheckCircle2 size={15} /> Instant PDF Quotation Generation
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FileSpreadsheet size={15} color="#D2051E" /> CSV / Excel Batch Upload Supported
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#D97706' }}>
              <ShieldCheck size={15} /> 100% Guaranteed Thread Tolerance 6g
            </span>
          </div>
        </div>
      </div>

      <RapidRFQWidget />

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
