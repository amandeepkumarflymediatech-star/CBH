'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Percent, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container">
        {/* Status Line */}
        <div className="hero-status-line">
          <div className="hero-status-tags">
            <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>CBH-OPS // DISPATCH-READY</span>
            <span className="hide-mobile" style={{ color: '#8290A2' }}>/</span>
            <span className="hide-mobile">DIN EN ISO COMPLIANT</span>
            <span style={{ color: '#8290A2' }}>/</span>
            <span style={{ color: '#0B132B', fontWeight: 700 }}>PAN-INDIA DISPATCH</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-certified">
              <CheckCircle2 size={13} />
              BIS Lab Certified
            </span>
            <span className="badge badge-vip">
              <Percent size={13} />
              OEM Slab Discounts Active
            </span>
          </div>
        </div>

        {/* Main Industrial Split Hero */}
        <div className="hero-grid">
          {/* Left Hero Details */}
          <div className="hero-content">
            <div className="hero-pill">
              <span className="hero-pulse-dot" style={{ background: 'var(--color-accent)' }} />
              <span>Direct Factory Depot • 2,00,000+ Industrial Fastener SKUs</span>
            </div>

            <h1 className="hero-title">
              India's Premier Digital Fastener <span>Procurement</span> <span style={{ color: 'var(--color-accent)' }}>Platform</span>
            </h1>

            <p className="hero-desc">
              2 Lacs+ SKUs under one roof. BIS Certified DIN & ISO precision fasteners engineered for heavy infrastructure, automotive assemblies, and industrial fabrication. Direct mill traceability with EN 10204 3.1 inspection certificates.
            </p>

            {/* Industrial Metrics Grid */}
            <div className="hero-stats-grid">
              <div className="stat-box highlight">
                <span className="stat-number" style={{ color: 'var(--color-primary)' }}>2,00,000+</span>
                <span className="stat-label">SKUs In Stock</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">24-48 HR</span>
                <span className="stat-label">Pan-India Freight</span>
              </div>
              <div className="stat-box">
                <span className="stat-number" style={{ color: '#059669' }}>100% BIS</span>
                <span className="stat-label">Tested & Calibrated</span>
              </div>
              <div className="stat-box">
                <span className="stat-number" style={{ color: 'var(--color-accent)' }}>UP TO 25%</span>
                <span className="stat-label">Bulk Slab Tier</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
              <Link href="/bulk-order" className="btn-primary">
                <span>Start Rapid Bulk RFQ</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/surplus" className="btn-dark">
                <span>Browse Surplus Lots</span>
              </Link>
            </div>
          </div>

          {/* Right Technical Blueprint Card */}
          <div className="blueprint-card">
            <div className="blueprint-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-din">DIN 933</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: '13px' }}>
                  GRADE 8.8 / 10.9
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#8E9BAE' }}>
                TOLERANCE 6g // ISO 4017
              </span>
            </div>

            <div className="blueprint-img-wrap">
              <Image
                src="/assets/hero.jpg"
                alt="Industrial Fasteners Workbench"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
              <div className="blueprint-overlay-pill">
                <CheckCircle2 size={13} color="#059669" />
                <span>Calibrated Pitch 1.5mm Verified</span>
              </div>
            </div>

            <div className="blueprint-specs-table">
              <div>
                <span>TENSILE STRENGTH</span>
                <strong>800-830 N/mm²</strong>
              </div>
              <div>
                <span>PROOF STRESS</span>
                <strong>640 N/mm²</strong>
              </div>
              <div>
                <span>SURFACE TREATMENT</span>
                <strong>Black Zinc Phosphated</strong>
              </div>
              <div>
                <span>DUAL BILLING</span>
                <strong style={{ color: 'var(--color-accent)' }}>PCS / KGS Live</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
