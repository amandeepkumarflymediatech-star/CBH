'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Percent, ArrowRight, MessageCircle } from 'lucide-react';
import VirtualStoreHeroCard from '@/components/home/VirtualStoreHeroCard';

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
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 mt-4 w-full">
              <Link
                href="/products"
                className="btn-primary w-full sm:w-auto justify-center text-center px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all no-underline"
              >
                <span>Browse Products (नट-बोल्ट देखें)</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href="https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20want%20to%20buy%20nuts%20and%20bolts.%20Please%20share%20wholesale%20rates."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto justify-center text-center px-4 sm:px-5 py-3 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 rounded-md text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all no-underline shadow-md shadow-[#25D366]/20"
              >
                <MessageCircle size={17} />
                <span>WhatsApp Order (व्हाट्सएप करें)</span>
              </a>
              <Link
                href="/bulk-order"
                className="btn-dark w-full sm:w-auto justify-center text-center px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all no-underline"
              >
                <span>Bulk RFQ (थोक भाव)</span>
              </Link>
            </div>
          </div>

          {/* Right Technical Virtual Store Card */}
          <div className="w-full">
            <VirtualStoreHeroCard />
          </div>
        </div>
      </div>
    </section>
  );
}
