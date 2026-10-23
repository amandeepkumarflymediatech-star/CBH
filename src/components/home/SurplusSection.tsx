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
              <span>India's 1st Certified Surplus Fastener Exchange</span>
            </div>

            <h2 className="surplus-title">
              Buy & sell surplus fastener stock
            </h2>

            <p style={{ fontSize: '15px', color: '#B2BECF', lineHeight: 1.6, maxWidth: '580px' }}>
              Turn dead inventory into immediate working capital or purchase verified surplus lots at up to <strong>60% below market tariff</strong>. Every listing is physically inspected, thread-gauge verified, and backed by CBH buyback guarantee.
            </p>

            {/* 3 Pillars */}
            <div className="surplus-features">
              <div className="surplus-feature-card">
                <strong>01. LAB VERIFICATION</strong>
                <p>100% Optical sorting & chemical composition checks.</p>
              </div>
              <div className="surplus-feature-card">
                <strong style={{ color: '#D97706' }}>02. INSTANT LIQUIDATION</strong>
                <p>Guaranteed payment within 48 hours for plant overstock.</p>
              </div>
              <div className="surplus-feature-card">
                <strong style={{ color: '#FF334B' }}>03. ESCROW SECURED</strong>
                <p>Zero transaction risk with full NABL mill certificates.</p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => alert('Redirecting to Surplus Lots Intake Form. Upload lot weights, grade, and photos.')}
              >
                <span>List Surplus Fastener Inventory</span>
              </button>
              <Link href="/surplus" className="btn-outline" style={{ color: '#FFFFFF', borderColor: '#404B5C' }}>
                <span>Browse Surplus Deals</span>
                <ArrowRight size={14} />
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
