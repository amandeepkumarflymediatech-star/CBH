'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';

export default function SurplusSection() {
  return (
    <section className="surplus-section" id="surplus">
      <div className="container">
        <div className="surplus-grid">
          {/* Left Details */}
          <div>
            <div className="surplus-badge">
              <Flame size={14} color="#FF334B" />
              <span>Certified Factory-Direct Clearance Depot</span>
            </div>

            <h2 className="surplus-title">
              Direct Factory Clearance & Surplus Inventory
            </h2>

            <p style={{ fontSize: '15px', color: '#B2BECF', lineHeight: 1.6, maxWidth: '580px' }}>
              Direct factory-cleared and plant surplus fasteners at up to <strong>60% below standard tariffs</strong>. Owned, stocked, and tested directly by CBH Fasteners with authentic NABL 3.1 Mill Test Certificates and immediate dispatch.
            </p>

            {/* 3 Pillars */}
            <div className="surplus-features">
              <div className="surplus-feature-card">
                <strong>01. NABL LAB CERTIFIED</strong>
                <p>100% Optical sorting & thread-gauge calibrated in CBH testing labs.</p>
              </div>
              <div className="surplus-feature-card">
                <strong style={{ color: '#D97706' }}>02. DIRECT FACTORY DISPATCH</strong>
                <p>Shipped directly from CBH central warehouses within 24-48 hours.</p>
              </div>
              <div className="surplus-feature-card">
                <strong style={{ color: '#FF334B' }}>03. ZERO MIDDLEMEN</strong>
                <p>Direct customer pricing with zero broker fees and authentic batch traceability.</p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/surplus" className="btn-primary">
                <span>Browse Clearance Lots</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/bulk-order" className="btn-outline" style={{ color: '#FFFFFF', borderColor: '#404B5C' }}>
                <span>Direct RFQ for Tonnage</span>
              </Link>
            </div>
          </div>

          {/* Right Spotlight Clearance Card */}
          <div className="spotlight-card">
            <span className="spotlight-header">CURRENT CLEARANCE SPOTLIGHT</span>
            <h3 className="spotlight-title">EPC Surplus Lot: ASTM A193 B7</h3>
            <p className="spotlight-desc">
              M24x3000mm Continuous Threaded Rods + 2H Heavy Hex Nuts (Hot Dip Galvanized). Ready at Hazira Logistics Yard.
            </p>

            <div className="spotlight-metrics">
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Quantity:</span>
                <strong>18.4 Metric Tonnes</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Market Price:</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>₹ 182 / Kg</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Clearance:</span>
                <strong style={{ color: '#D2051E', fontSize: '15px' }}>₹ 114 / Kg (-37%)</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn-dark"
              style={{ width: '100%', padding: '10px' }}
              onClick={() => alert('Inquiry logged for ASTM A193 B7 Surplus Lot #CBH-LOT-889. Dispatch manager will call within 15 mins.')}
            >
              <span>Claim Lot Allocation</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
