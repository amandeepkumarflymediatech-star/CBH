'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Percent, ArrowRight, Box, Sparkles, MessageCircle } from 'lucide-react';

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
              <span>Direct Factory Wholesale Depot • 2,00,000+ Fasteners In Ready Stock</span>
            </div>

            <h1 className="hero-title">
              Direct Factory Store for <span>Nuts, Bolts &amp; Screws</span> <span style={{ color: 'var(--color-accent)' }}>(होलसेल रेट पर)</span>
            </h1>

            <p className="hero-desc">
              India&apos;s direct manufacturer &amp; wholesale depot for <strong>Hex Bolts, Heavy Nuts, Washers, Screws &amp; Anchors</strong>. Buy in <strong>Kilograms (Kg) or Pieces (Pcs)</strong> directly at wholesale mill rates with fast 24-48 hr delivery across India.
            </p>

            {/* Industrial Metrics Grid */}
            <div className="hero-stats-grid">
              <div className="stat-box highlight">
                <span className="stat-number" style={{ color: 'var(--color-primary)' }}>2,00,000+</span>
                <span className="stat-label">Fasteners In Stock</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">24-48 HR</span>
                <span className="stat-label">Pan-India Delivery</span>
              </div>
              <div className="stat-box">
                <span className="stat-number" style={{ color: '#059669' }}>100% BIS</span>
                <span className="stat-label">Tested &amp; Certified</span>
              </div>
              <div className="stat-box">
                <span className="stat-number" style={{ color: 'var(--color-accent)' }}>Kg / Pcs</span>
                <span className="stat-label">Flexible Buying</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn-primary" style={{ padding: '12px 22px', fontSize: '14px' }}>
                <span>Browse Products (नट-बोल्ट देखें)</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href="https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20want%20to%20buy%20nuts%20and%20bolts.%20Please%20share%20wholesale%20rates."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#FFFFFF',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                }}
              >
                <MessageCircle size={17} />
                <span>WhatsApp Order (व्हाट्सएप करें)</span>
              </a>
              <Link href="/bulk-order" className="btn-dark" style={{ padding: '12px 20px', fontSize: '14px' }}>
                <span>Bulk RFQ (थोक भाव)</span>
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
