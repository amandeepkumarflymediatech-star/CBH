'use client';

import React, { useState } from 'react';
import MainHeader from '@/components/header/MainHeader';
import NavSubBar from '@/components/header/NavSubBar';
import SurplusSection from '@/components/home/SurplusSection';
import CartDrawer from '@/components/cart/CartDrawer';
import { GlobalUnit } from '@/lib/types';
import { Flame, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { formatINR } from '@/lib/rfq-calculator';

export default function SurplusPage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const surplusLots = [
    {
      id: 'LOT-889',
      title: 'ASTM A193 B7 Continuous Stud Rods + 2H Nuts',
      spec: 'M24 x 3000mm • Hot Dip Galvanized',
      location: 'Hazira Logistics Depot, Gujarat',
      weight: '18.4 Metric Tonnes',
      marketRate: 182,
      clearanceRate: 114,
      discount: 37,
      status: 'AVAILABLE'
    },
    {
      id: 'LOT-904',
      title: 'DIN 933 Grade 10.9 Structural Hex Screws BP',
      spec: 'M16 x 2.0 x 120mm • Black Passivated',
      location: 'Peenya Industrial Yard, Bengaluru',
      weight: '9.2 Metric Tonnes',
      marketRate: 195,
      clearanceRate: 122,
      discount: 37,
      status: 'AVAILABLE'
    },
    {
      id: 'LOT-912',
      title: 'Stainless Steel SS-316 Socket Cap Screws DIN 912',
      spec: 'M12 x 1.75 x 80mm • Pickled & Passivated',
      location: 'Manesar Central Warehouse, NCR',
      weight: '4.8 Metric Tonnes',
      marketRate: 460,
      clearanceRate: 285,
      discount: 38,
      status: 'AVAILABLE'
    }
  ];

  return (
    <main>
      <MainHeader
        unit={globalUnit}
        onUnitToggle={(u) => setGlobalUnit(u)}
        cartCount={0}
        onOpenCart={() => setIsCartOpen(true)}
      />
      <NavSubBar />

      <div style={{ background: '#121518', color: '#FFFFFF', padding: '40px 0 30px', borderBottom: '2px solid var(--color-primary)' }}>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            <Flame size={15} />
            <span>CERTIFIED DIRECT FACTORY CLEARANCE DEPOT</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '42px', fontWeight: 800, textTransform: 'uppercase', margin: '8px 0 12px' }}>
            Direct CBH Warehouse Clearance Lots
          </h1>
          <p style={{ fontSize: '15px', color: '#B0BCCB', maxWidth: '680px', lineHeight: 1.6 }}>
            Direct access to verified factory liquidation inventory and plant surplus fasteners at up to 60% below standard tariffs. Owned, stocked, and tested directly by CBH Fasteners with 100% authentic NABL 3.1 Mill Test Certificates.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 60px' }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '26px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px' }}>
          Available Ready-to-Dispatch Surplus Batches
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {surplusLots.map((lot) => (
            <div
              key={lot.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-surface-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid var(--color-primary)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-din">{lot.id}</span>
                  <span className="badge badge-surplus">-{lot.discount}% OFF</span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, color: 'var(--color-dark-900)', lineHeight: 1.25 }}>
                  {lot.title}
                </h3>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', margin: '4px 0 8px' }}>
                  {lot.spec}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  <MapPin size={14} />
                  <span>{lot.location}</span>
                </div>

                <div style={{ background: 'var(--color-surface-bg)', border: '1px solid var(--color-surface-border)', borderRadius: '4px', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Lot Size:</span>
                    <strong>{lot.weight}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Market Rate:</span>
                    <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>{formatINR(lot.marketRate)} / Kg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Clearance Price:</span>
                    <strong style={{ color: 'var(--color-accent)', fontSize: '15px' }}>{formatINR(lot.clearanceRate)} / Kg</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px' }}
                  onClick={() => alert(`Allocation Request submitted for Lot ${lot.id}. Our depot manager will issue proforma within 15 minutes.`)}
                >
                  <span>Claim Lot Allocation</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <SurplusSection />
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
