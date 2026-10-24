'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Percent, ArrowRight, Box, Sparkles } from 'lucide-react';

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
              <Link href="/virtual-store" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 107, 0, 0.1)',
                border: '1px solid var(--color-accent)',
                color: 'var(--color-accent)',
                padding: '10px 18px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}>
                <Box size={16} />
                <span>Enter 3D Virtual Depot</span>
              </Link>
            </div>
          </div>

          {/* Right Technical Blueprint Card -> Click to Enter 3D Virtual Store */}
          <Link
            href="/virtual-store"
            className="blueprint-card blueprint-card-interactive"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div className="blueprint-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-din" style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}>
                  <Box size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  3D VIRTUAL STORE
                </span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="hero-pulse-dot" style={{ background: 'var(--color-accent)', width: '7px', height: '7px' }} />
                  LIVE DIGITAL TWIN
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                CLICK TO ENTER <ArrowRight size={13} />
              </span>
            </div>

            <div className="blueprint-img-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
              <Image
                src="/assets/hero.jpg"
                alt="CBH 3D Virtual Fastener Depot"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />

              {/* High-Tech 3D Portal Floating Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 107, 0, 0.5)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                <Sparkles size={13} color="#FF6B00" />
                <span>60 FPS GSAP 3D</span>
              </div>

              {/* Bottom Interactive Hover Banner */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  background: 'linear-gradient(135deg, rgba(0, 82, 204, 0.95) 0%, rgba(7, 71, 166, 0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#FFFFFF',
                  boxShadow: '0 6px 20px rgba(0, 82, 204, 0.4)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Box size={16} color="#FF6B00" />
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 900, display: 'block', letterSpacing: '0.02em' }}>
                      40,000 SQ.FT MEGA-DEPOT
                    </span>
                    <span style={{ fontSize: '10px', color: '#93C5FD', fontFamily: 'var(--font-mono)' }}>
                      Interactive Pallet Racks & 3D Bolt Inspector
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#FF6B00',
                    color: '#FFFFFF',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>EXPLORE</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>

            <div className="blueprint-specs-table">
              <div>
                <span>ZONE ARCHITECTURE</span>
                <strong>4 Interactive Bays</strong>
              </div>
              <div>
                <span>3D PRODUCT INSPECTOR</span>
                <strong>FAZ II Plus Bolt Anchor</strong>
              </div>
              <div>
                <span>GSAP ASSEMBLY</span>
                <strong>Exploded View Toggle</strong>
              </div>
              <div>
                <span>LIVE STOCK SYNC</span>
                <strong style={{ color: 'var(--color-accent)' }}>Direct Cart RFQ</strong>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
