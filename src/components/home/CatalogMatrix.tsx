'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, CheckCircle2, PackageCheck, ArrowRight } from 'lucide-react';
import { Product, GlobalUnit } from '@/lib/types';
import { formatINR, clampQty, formatQtyDisplay, MIN_QTY_PCS, MIN_QTY_KGS } from '@/lib/rfq-calculator';

interface CatalogMatrixProps {
  products: Product[];
  onAddToCart: (product: Product, qty: number, unit: GlobalUnit) => void;
}

export default function CatalogMatrix({ products, onAddToCart }: CatalogMatrixProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'bolts' | 'socket' | 'surplus'>('all');
  const [cardUnits, setCardUnits] = useState<{ [id: number]: GlobalUnit }>({});
  const [cardQtys, setCardQtys] = useState<{ [id: number]: number }>({});

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'surplus') return p.isSurplus;
    if (activeTab === 'bolts') return p.category === 'Bolts' || p.standard === 'DIN 931' || p.name.includes('DIN 931');
    if (activeTab === 'socket') return p.standard === 'DIN 912' || p.name.includes('DIN 912');
    return true;
  });

  // Limit to exactly 8 cards on homepage
  const visibleProducts = filteredProducts.slice(0, 8);

  const getUnit = (id: number): GlobalUnit => cardUnits[id] || 'PCS';
  const getQty = (id: number): number => {
    const unit = getUnit(id);
    if (cardQtys[id] !== undefined) return cardQtys[id];
    return unit === 'PCS' ? MIN_QTY_PCS : MIN_QTY_KGS;
  };

  const toggleUnit = (id: number, unit: GlobalUnit) => {
    setCardUnits((prev) => ({ ...prev, [id]: unit }));
    setCardQtys((prev) => ({
      ...prev,
      [id]: unit === 'PCS' ? MIN_QTY_PCS : MIN_QTY_KGS,
    }));
  };

  const adjustQty = (id: number, delta: number) => {
    const current = getQty(id);
    const unit = getUnit(id);
    if (unit === 'KGS') {
      if (delta < 0) {
        if (current <= MIN_QTY_KGS) return;
        const step = current <= 1 ? 0.25 : 0.5;
        const nextVal = Math.max(MIN_QTY_KGS, Math.round((current - step) * 100) / 100);
        setCardQtys((prev) => ({ ...prev, [id]: nextVal }));
      } else {
        const step = current < 1 ? 0.25 : 0.5;
        const nextVal = Math.round((current + step) * 100) / 100;
        setCardQtys((prev) => ({ ...prev, [id]: nextVal }));
      }
    } else {
      if (delta < 0) {
        if (current <= MIN_QTY_PCS) return;
        const step = current > 1000 ? 500 : 100;
        const nextVal = Math.max(MIN_QTY_PCS, current - step);
        setCardQtys((prev) => ({ ...prev, [id]: nextVal }));
      } else {
        const step = current >= 1000 ? 500 : 100;
        setCardQtys((prev) => ({ ...prev, [id]: current + step }));
      }
    }
  };

  return (
    <section className="catalog-section" id="catalog">
      <div className="container">
        {/* Header & Tabs */}
        <div className="catalog-header">
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-muted)'
            }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>READY STOCK INVENTORY</span>
              <span>•</span>
              <span>DISPATCH IN 24-48 HRS</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '32px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--color-dark-900)',
              marginTop: '4px'
            }}>
              Popular Fasteners In Stock <span style={{ color: 'var(--color-primary)', fontSize: '24px' }}>(फैक्टरी में तैयार सामान)</span>
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="catalog-tabs">
            <button
              type="button"
              className={`catalog-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Hex Screws (DIN 933)
            </button>
            <button
              type="button"
              className={`catalog-tab ${activeTab === 'bolts' ? 'active' : ''}`}
              onClick={() => setActiveTab('bolts')}
            >
              Hex Bolts (DIN 931)
            </button>
            <button
              type="button"
              className={`catalog-tab ${activeTab === 'socket' ? 'active' : ''}`}
              onClick={() => setActiveTab('socket')}
            >
              Socket Caps (DIN 912)
            </button>
            <button
              type="button"
              className={`catalog-tab ${activeTab === 'surplus' ? 'active' : ''}`}
              onClick={() => setActiveTab('surplus')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)' }} />
              <span>Surplus Lots</span>
            </button>
          </div>
        </div>

        {/* 8 Product Cards Grid */}
        <div className="product-grid">
          {visibleProducts.map((p) => {
            const currentUnit = getUnit(p.id);
            const currentQty = getQty(p.id);

            return (
              <div
                key={p.id}
                className={`product-card ${p.isSurplus ? 'surplus-deal' : ''}`}
              >
                <div>
                  <div className="card-top">
                    <span className="badge badge-din">{p.standard}</span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#059669',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      <CheckCircle2 size={13} />
                      In Stock
                    </span>
                  </div>

                  {/* Image */}
                  <Link href={`/product/${p.id}`} className="card-img-wrap" style={{ display: 'block' }}>
                    <Image
                      src={p.imageUrl || '/assets/bolt_zinc.jpg'}
                      alt={p.name}
                      width={180}
                      height={120}
                      unoptimized={Boolean(p.imageUrl && p.imageUrl.startsWith('http'))}
                      style={{ objectFit: 'contain' }}
                      onError={(e) => {
                        try {
                          (e.target as any).src = '/assets/bolt_zinc.jpg';
                        } catch {}
                      }}
                    />
                  </Link>

                  {/* Specs Strip */}
                  <div className="specs-strip">
                    <div>
                      <span>GRADE</span>
                      <strong>{p.grade}</strong>
                    </div>
                    <div>
                      <span>PITCH</span>
                      <strong>{p.pitchMm} mm</strong>
                    </div>
                    <div>
                      <span>THREAD</span>
                      <strong>{p.threadType}</strong>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="card-title" title={p.name}>
                    <Link href={`/product/${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {p.name}
                    </Link>
                  </h3>

                  {/* Dual Price Box */}
                  <div className="dual-price-box">
                    <div className="price-row primary-row">
                      <span className="label">Per Kg:</span>
                      <div>
                        <span className="value">{formatINR(p.pricePerKg)}</span>
                        {p.originalPricePerKg && p.originalPricePerKg > p.pricePerKg && (
                          <span className="strike">{formatINR(p.originalPricePerKg)}</span>
                        )}
                      </div>
                    </div>
                    <div className="price-row">
                      <span className="label">Per Piece:</span>
                      <div>
                        <span className="value" style={{ fontSize: '13px', color: 'var(--color-dark-800)' }}>
                          {formatINR(p.pricePerPiece)}
                        </span>
                        {p.originalPricePerPiece && p.originalPricePerPiece > p.pricePerPiece && (
                          <span className="strike">{formatINR(p.originalPricePerPiece)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Quantity:</span>
                    <span style={{ color: '#0052CC', fontWeight: 700 }}>
                      {currentUnit === 'KGS' ? 'Min: 250 gm (0.25 Kg)' : 'Min: 100 Pcs'}
                    </span>
                  </div>

                  <div className="qty-unit-row">
                    <div className="qty-stepper">
                      <button
                        type="button"
                        disabled={currentQty <= (currentUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS)}
                        onClick={() => adjustQty(p.id, -1)}
                        style={{
                          opacity: currentQty <= (currentUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS) ? 0.35 : 1,
                          cursor: currentQty <= (currentUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS) ? 'not-allowed' : 'pointer'
                        }}
                        title={currentQty <= (currentUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS) ? 'Minimum order reached' : 'Decrease'}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={currentUnit === 'KGS' ? (currentQty === 0.25 ? '250 gm' : `${currentQty} Kg`) : `${currentQty} Pcs`}
                        readOnly
                        style={{ textAlign: 'center', fontWeight: 700, fontSize: '11px', cursor: 'default' }}
                      />
                      <button type="button" onClick={() => adjustQty(p.id, 1)}>
                        +
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', background: 'var(--color-surface-bg)', padding: '2px', borderRadius: '4px' }}>
                      <button
                        type="button"
                        style={{
                          padding: '2px 6px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          borderRadius: '2px',
                          background: currentUnit === 'PCS' ? 'var(--color-dark-800)' : 'transparent',
                          color: currentUnit === 'PCS' ? '#FFFFFF' : 'var(--color-text-muted)',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleUnit(p.id, 'PCS')}
                      >
                        PCS
                      </button>
                      <button
                        type="button"
                        style={{
                          padding: '2px 6px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          borderRadius: '2px',
                          background: currentUnit === 'KGS' ? 'var(--color-dark-800)' : 'transparent',
                          color: currentUnit === 'KGS' ? '#FFFFFF' : 'var(--color-text-muted)',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleUnit(p.id, 'KGS')}
                      >
                        KGS
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-card-add"
                    onClick={() => onAddToCart(p, clampQty(currentQty, currentUnit), currentUnit)}
                  >
                    <span>Add to RFQ Cart</span>
                    <ShoppingCart size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Redirect CTA */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '36px',
          textAlign: 'center'
        }}>
          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#0052CC',
              color: '#FFFFFF',
              padding: '14px 34px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 800,
              textDecoration: 'none',
              letterSpacing: '0.01em',
              boxShadow: '0 4px 14px rgba(0, 82, 204, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>View All Fasteners ({products.length > 0 ? products.length : '57+'} Products)</span>
            <ArrowRight size={18} />
          </Link>
          <span style={{ fontSize: '12px', color: '#64748B', marginTop: '10px' }}>
            Browse full procurement catalog with parametric filters, diameter sizes &amp; DIN/ISO standard drawings
          </span>
        </div>

        {/* Load More Banner */}
        <div style={{
          marginTop: '28px',
          background: '#FFFFFF',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <PackageCheck size={28} color="var(--color-primary)" />
            <div>
              <strong style={{ fontSize: '15px', color: 'var(--color-dark-900)', display: 'block' }}>
                Need customized thread pitch or non-standard metric lengths?
              </strong>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                We forge M6 to M64 in 4.6, 5.8, 8.8, 10.9, 12.9, and Stainless A2/A4 with certified mill tolerances.
              </span>
            </div>
          </div>

          <Link href="/products" className="btn-dark" style={{ textDecoration: 'none' }}>
            <span>Explore Entire Fastener Catalog</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
