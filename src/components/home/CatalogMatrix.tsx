'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, CheckCircle2, PackageCheck } from 'lucide-react';
import { Product, GlobalUnit } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';

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
    if (activeTab === 'bolts') return p.category === 'Bolts' || p.standard === 'DIN 931';
    if (activeTab === 'socket') return p.standard === 'DIN 912';
    return true;
  });

  const getUnit = (id: number): GlobalUnit => cardUnits[id] || 'PCS';
  const getQty = (id: number): number => cardQtys[id] || (getUnit(id) === 'PCS' ? 500 : 50);

  const toggleUnit = (id: number, unit: GlobalUnit) => {
    setCardUnits((prev) => ({ ...prev, [id]: unit }));
    setCardQtys((prev) => ({
      ...prev,
      [id]: unit === 'PCS' ? 500 : 50,
    }));
  };

  const adjustQty = (id: number, delta: number) => {
    const current = getQty(id);
    const unit = getUnit(id);
    const step = unit === 'PCS' ? 100 : 10;
    const nextVal = Math.max(step, current + delta * step);
    setCardQtys((prev) => ({ ...prev, [id]: nextVal }));
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
              <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>PARAMETRIC CATALOG</span>
              <span>•</span>
              <span>PRECISION TOLERANCE METRIC</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '32px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--color-dark-900)',
              marginTop: '4px'
            }}>
              Industrial Fasteners Catalog Matrix
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
          {filteredProducts.map((p) => {
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
                      style={{ objectFit: 'contain' }}
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
                  <div className="qty-unit-row">
                    <div className="qty-stepper">
                      <button type="button" onClick={() => adjustQty(p.id, -1)}>
                        -
                      </button>
                      <input
                        type="text"
                        value={currentQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 100;
                          setCardQtys((prev) => ({ ...prev, [p.id]: val }));
                        }}
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
                    onClick={() => onAddToCart(p, currentQty, currentUnit)}
                  >
                    <span>Add to RFQ Cart</span>
                    <ShoppingCart size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Banner */}
        <div style={{
          marginTop: '36px',
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

          <Link href="/bulk-order" className="btn-dark">
            <span>View Entire 2,00,000+ SKU Catalog</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
