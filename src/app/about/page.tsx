'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Award,
  Factory,
  Globe2,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Building2,
  Sparkles,
  Phone,
  Mail,
  Scale
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import LeadershipSection from '@/components/home/LeadershipSection';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

export default function AboutPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  const milestones = [
    { year: '1959', title: 'Foundation of CBH', desc: 'Established in Punjab as Capital Bolts & Hardwares to supply standard fasteners for regional machinery and rail expansion.' },
    { year: '1984', title: 'Industrial Cold Forging', desc: 'Commissioned high-speed multi-station cold headers and thread rollers to scale production into high-tensile Grade 8.8 bolts.' },
    { year: '2001', title: 'ISO 9001 & BIS Certification', desc: 'Awarded formal ISO 9001 Quality Management and BIS conformity licenses for Indian infrastructure and power projects.' },
    { year: '2015', title: 'Govt. One Star Export House', desc: 'Recognized as an official Export House by Ministry of Commerce & Industry, dispatching fasteners to 18+ nations.' },
    { year: '2024', title: 'Digital Procurement Platform', desc: 'Pioneered India’s premier digital B2B fastener matrix with dual PCS/KGS unit pricing, 3D interactive depot, and live RFQ.' },
  ];

  const pillars = [
    {
      icon: Factory,
      title: 'Integrated Manufacturing & Warehousing',
      desc: 'Extensive cold forging capacity spanning M3 to M64 metric diameters, alongside 2,00,000+ SKUs ready for immediate dispatch across India.',
      badge: '2L+ SKUs'
    },
    {
      icon: ShieldCheck,
      title: 'TÜV & BIS Accredited Quality Lab',
      desc: 'In-house optical sorting, universal tensile testing machines, metallurgical hardness verification, and 1000-hr salt-spray corrosion chambers.',
      badge: '100% Calibrated'
    },
    {
      icon: Scale,
      title: 'Dual Unit PCS / KGS Precision Pricing',
      desc: 'Transparent pricing with weight-to-piece algorithmic conversion, empowering structural engineers and procurement heads to budget accurately.',
      badge: 'Dual Unit'
    },
    {
      icon: Globe2,
      title: 'Trusted by India’s Premier Infrastructure',
      desc: 'Approved vendor for IndianOil, Tata Projects, NTPC, BHEL, DMRC, L&T, Bharat Petroleum, and Delhi Transco Limited.',
      badge: 'PSU Approved'
    }
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <MainHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartItems.length} />

      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A2E4E 0%, #0052CC 100%)',
          padding: '64px 0 54px',
          color: '#FFFFFF',
          borderBottom: '4px solid #FF6B00',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#93C5FD', marginBottom: '20px' }}>
            <Link href="/" style={{ color: '#93C5FD', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>About Us</span>
          </div>

          <div style={{ maxWidth: '840px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: '#FED7AA', marginBottom: '16px', backdropFilter: 'blur(6px)' }}>
              <Award size={15} color="#FF6B00" />
              <span>SIX DECADES OF FASTENER ENGINEERING · EST. 1959</span>
            </div>

            <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 46px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.02em' }}>
              Precision Fastening the Infrastructure That Moves the Nation
            </h1>

            <p style={{ fontSize: '16px', lineHeight: 1.65, color: '#DBEAFE', maxWidth: '720px', marginBottom: '28px' }}>
              Capital Bolts &amp; Hardwares (CBH) is India’s benchmark industrial fastener manufacturer and digital distributor. Supplying certified DIN, ISO, and ASTM precision fasteners to government defense, thermal power grids, metro rail, and heavy automotive OEMs.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Link
                href="/products"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FF6B00',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                <span>Explore 2L+ SKUs Catalog</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/certificate"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  padding: '12px 22px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.25)'
                }}
              >
                <FileCheck2 size={16} />
                <span>View Quality Certifications</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Stats Bar */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#0052CC', fontFamily: 'var(--font-mono)' }}>65+</div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Years of Engineering</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#0052CC', fontFamily: 'var(--font-mono)' }}>2,00,000+</div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Active SKUs in Catalog</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>100%</div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>BIS &amp; DIN Tested</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#FF6B00', fontFamily: 'var(--font-mono)' }}>18+</div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Global Export Corridors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Pillars */}
      <section style={{ padding: '70px 0', background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0052CC', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Why Industry Leaders Trust CBH</span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px', letterSpacing: '-0.02em' }}>
              Built for High-Tensile Structural Reliability
            </h2>
            <p style={{ color: '#64748B', fontSize: '15px', marginTop: '12px', lineHeight: 1.6 }}>
              From atomic energy installations to metro rail viaducts, our fasteners undergo multi-stage metallurgical verification to eliminate downtime and mechanical fatigue.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
            {pillars.map((pillar, i) => {
              const IconComp = pillar.icon;
              return (
                <div
                  key={i}
                  style={{
                    padding: '30px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(0, 82, 204, 0.08)', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={24} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', background: '#F1F5F9', color: '#334155', borderRadius: '20px' }}>
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>{pillar.title}</h3>
                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6 }}>{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Historical Milestones */}
      <section style={{ padding: '70px 0', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0052CC', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Our Heritage</span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>Six Decades of Continuous Innovation</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {milestones.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'flex-start',
                  background: '#FFFFFF',
                  padding: '24px 28px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ minWidth: '80px', fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 800, color: '#FF6B00' }}>
                  {item.year}
                </div>
                <div style={{ borderLeft: '2px solid #E2E8F0', paddingLeft: '20px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP: Guided by experience. Built across generations */}
      <LeadershipSection />

      {/* CTA Section */}
      <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '60px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Ready to Partner with CBH Fasteners?</h2>
          <p style={{ color: '#94A3B8', fontSize: '16px', lineHeight: 1.6, marginBottom: '28px' }}>
            Upload your bill of materials (BOM), schedule technical consultation, or request instant wholesale quotation with dual PCS/KGS unit pricing.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href="/bulk-order"
              style={{
                background: '#FF6B00',
                color: '#FFFFFF',
                padding: '14px 28px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none'
              }}
            >
              Start Rapid RFQ Matrix
            </Link>
            <Link
              href="/contact"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                padding: '14px 26px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '15px',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              Contact Sales Team
            </Link>
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={() => {}}
        onRemoveItem={() => {}}
      />
    </div>
  );
}
