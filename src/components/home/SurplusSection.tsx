'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import {
  ArrowRight,
  Flame,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Percent,
  Clock,
  MapPin,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface ClearanceLot {
  id: string;
  badge: string;
  title: string;
  category: string;
  standard: string;
  specs: string;
  location: string;
  totalTonnage: number;
  availableTonnage: number;
  originalPrice: number;
  clearancePrice: number;
  discountPct: number;
  image: string;
}

export default function SurplusSection() {
  const [clearanceLots, setClearanceLots] = useState<ClearanceLot[]>([]);
  const [activeLotId, setActiveLotId] = useState<string>('');
  const [claimedModal, setClaimedModal] = useState<ClearanceLot | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Fetch live dynamic surplus lots
  useEffect(() => {
    fetch('/api/surplus')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ClearanceLot[] = res.data.map((sl: any, idx: number) => {
            const tonnes = +((Number(sl.excessQtyKg) || 1000) / 1000).toFixed(2);
            return {
              id: String(sl.sku || `lot-${sl.id || idx}`),
              badge: sl.isActive ? 'FACTORY DIRECT CLEARANCE' : 'RESERVED ALLOCATION',
              title: sl.name,
              category: 'Surplus Fasteners',
              standard: sl.standard || 'Industrial Spec',
              specs: sl.grade ? `${sl.standard} • Grade ${sl.grade}` : sl.standard,
              location: sl.locationHub || 'Hazira Logistics Hub',
              totalTonnage: +(tonnes * 1.2).toFixed(2),
              availableTonnage: tonnes,
              originalPrice: Number(sl.regularPriceKg) || 180,
              clearancePrice: Number(sl.clearancePriceKg) || 110,
              discountPct: Number(sl.clearanceDiscountPct) || 35,
              image: sl.imageUrl || '/assets/bolt_zinc.jpg',
            };
          });
          setClearanceLots(mapped);
          setActiveLotId(mapped[0]?.id || '');
        }
      })
      .catch((err) => console.warn('SurplusSection live lots fallback:', err));
  }, []);

  const currentLot = clearanceLots.find((l) => l.id === activeLotId) || clearanceLots[0];

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.surplus-anim-fade', {
        opacity: 0,
        y: 28,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // GSAP Animation when switching active clearance lot
  useEffect(() => {
    if (spotlightRef.current) {
      gsap.fromTo(
        spotlightRef.current,
        { opacity: 0.45, y: 14, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [activeLotId]);

  return (
    <section className="surplus-section light-theme" id="surplus" ref={sectionRef}>
      <div className="container">
        <div className="surplus-grid">
          {/* Left Details */}
          <div className="surplus-left-content surplus-anim-fade">
            <div className="surplus-badge light">
              <span className="pulse-icon">
                <Flame size={15} color="#FF6B00" />
              </span>
              <span>Factory-Direct Liquidation Depot</span>
              <span className="badge-pill" style={{ background: '#FF6B00', color: '#FFFFFF' }}>SAVE UP TO 60%</span>
            </div>

            <h2 className="surplus-title light">
              Direct Factory Clearance &amp; Surplus Inventory
            </h2>

            <p className="surplus-lead light">
              Direct factory-cleared and plant surplus fasteners at up to <strong>60% below standard tariffs</strong>. Owned, stocked, and tested directly by CBH Fasteners with authentic NABL 3.1 Mill Test Certificates and immediate dispatch within 24-48 hours.
            </p>

            {/* 3 Pillars */}
            <div className="surplus-features light" ref={featuresRef}>
              <div className="surplus-feature-card light">
                <div className="feature-icon-box" style={{ background: 'rgba(5, 150, 105, 0.12)', color: '#059669' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>01. NABL LAB CERTIFIED</strong>
                  <p>100% Optical vision sorted &amp; thread-gauge calibrated with EN 10204 3.1 test certificates.</p>
                </div>
              </div>

              <div className="surplus-feature-card light">
                <div className="feature-icon-box" style={{ background: 'rgba(0, 82, 204, 0.1)', color: 'var(--color-primary)' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <strong>02. IMMEDIATE 24-48H DISPATCH</strong>
                  <p>Ready on floor at Hazira, NCR &amp; Pune central depots with multimodal freight connectivity.</p>
                </div>
              </div>

              <div className="surplus-feature-card light">
                <div className="feature-icon-box" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284C7' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <strong>03. ZERO BROKER MARKUPS</strong>
                  <p>Direct mill inventory release with transparent per-kilogram wholesale rates.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="surplus-actions-row">
              <Link href="/surplus" className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
                <span>Browse All Clearance Lots</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/bulk-order" className="btn-outline light">
                <span>Request Custom Tonnage Allocation</span>
              </Link>
            </div>
          </div>

          {/* Right Spotlight Clearance Card (Interactive Showcase) */}
          <div className="surplus-right-card surplus-anim-fade">
            {/* Quick Lot Selector Tabs */}
            <div className="clearance-lot-tabs">
              {clearanceLots.map((lot, idx) => (
                <button
                  key={lot.id}
                  type="button"
                  className={`lot-tab-btn ${activeLotId === lot.id ? 'active' : ''}`}
                  onClick={() => setActiveLotId(lot.id)}
                >
                  <span className="tab-idx">Lot #{idx + 1}</span>
                  <span className="tab-name">{lot.standard.split(' ')[0]}</span>
                  <span className="tab-disc">-{lot.discountPct}%</span>
                </button>
              ))}
            </div>

            {/* Active Spotlight Card Body */}
            {currentLot ? (
              <div className="spotlight-card light" ref={spotlightRef}>
                <div className="spotlight-top-strip">
                  <div className="spotlight-badge">
                    <Flame size={13} color="var(--color-accent)" />
                    <span>{currentLot.badge}</span>
                  </div>
                  <div className="spotlight-discount-pill">
                    <Percent size={12} />
                    <span>{currentLot.discountPct}% OFF TARIFF</span>
                  </div>
                </div>

                <h3 className="spotlight-title light">{currentLot.title}</h3>

                <div className="spotlight-specs-box">
                  <div className="spec-line">
                    <Layers size={13} color="#64748B" />
                    <span>{currentLot.specs}</span>
                  </div>
                  <div className="spec-line">
                    <MapPin size={13} color="var(--color-accent)" />
                    <span>Ready at: <strong>{currentLot.location}</strong></span>
                  </div>
                </div>

                {/* Tonnage Remaining Progress Indicator */}
                <div className="tonnage-progress-box">
                  <div className="tonnage-labels">
                    <span>Available Stock:</span>
                    <strong>{currentLot.availableTonnage} MT of {currentLot.totalTonnage} MT</strong>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(currentLot.availableTonnage / currentLot.totalTonnage) * 100}%` }}
                    ></div>
                  </div>
                  <div className="tonnage-footnote">
                    <Clock size={11} color="#059669" />
                    <span>Real-time warehouse yard availability</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="spotlight-price-box light">
                  <div className="price-item">
                    <span className="price-lbl">Standard List Rate</span>
                    <span className="price-old">₹ {currentLot.originalPrice} / Kg</span>
                  </div>
                  <div className="price-item highlight">
                    <span className="price-lbl">Clearance Rate</span>
                    <strong className="price-clearance">₹ {currentLot.clearancePrice} <small>/ Kg</small></strong>
                  </div>
                  <div className="price-savings">
                    <TrendingDown size={14} color="#059669" />
                    <span>Net Savings: ₹ {currentLot.originalPrice - currentLot.clearancePrice} / Kg</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '14.5px' }}
                  onClick={() => setClaimedModal(currentLot)}
                >
                  <span>Reserve Allocation for {currentLot.standard}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="spotlight-card light animate-pulse" style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-slate-400 font-bold text-sm">Loading verified clearance lots...</span>
              </div>
            )}
          </div>
        </div>

        {/* Claim Allocation Modal */}
        {claimedModal && (
          <div className="cbh-dialog-backdrop" onClick={() => setClaimedModal(null)}>
            <div className="cbh-dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div className="cbh-dialog-header">
                <div>
                  <span className="cbh-cert-category" style={{ color: 'var(--color-accent)' }}>LOT RESERVATION</span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800 }}>
                    {claimedModal.title}
                  </h3>
                </div>
              </div>
              <div className="cbh-dialog-body" style={{ background: '#FFFFFF', padding: '24px', color: '#0F172A' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F0FDF4', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Clearance Inquiry Logged</h4>
                  <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '6px' }}>
                    Your request for <strong>{claimedModal.availableTonnage} MT ({claimedModal.standard})</strong> at <strong>₹{claimedModal.clearancePrice}/Kg</strong> has been forwarded directly to our Hazira Yard Dispatch Team.
                  </p>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '12.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Location:</strong> {claimedModal.location}</div>
                  <div><strong>Clearance Rate:</strong> ₹{claimedModal.clearancePrice}/Kg (GST Extra)</div>
                  <div><strong>Included Documents:</strong> NABL EN 10204 3.1 MTC + Weighment Slip</div>
                </div>
              </div>
              <div className="cbh-dialog-footer">
                <button
                  type="button"
                  className="btn-outline light"
                  onClick={() => setClaimedModal(null)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Close &amp; Continue Browsing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
