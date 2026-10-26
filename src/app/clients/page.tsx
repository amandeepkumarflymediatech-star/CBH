'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import {
  Globe2,
  Building2,
  ShieldCheck,
  Award,
  Users2,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Phone,
  FileSpreadsheet,
  Handshake,
  Star
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

export default function ClientsPage() {
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const exhibitionImgRef = useRef<HTMLDivElement>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  const row1Logos = [
    { name: 'IndianOil', src: '/assets/client-logos/indianoil.webp', sector: 'Oil & Gas PSU' },
    { name: 'MPPGCL', src: '/assets/client-logos/mppgcl.webp', sector: 'Thermal Power' },
    { name: 'NALCO', src: '/assets/client-logos/nalco.webp', sector: 'Metals & Mining' },
    { name: 'PSPCL', src: '/assets/client-logos/pspcl.webp', sector: 'State Electricity' },
    { name: 'Tata Projects Limited', src: '/assets/client-logos/tata_projects.webp', sector: 'EPC Heavy Infra' },
    { name: 'Tata Power', src: '/assets/client-logos/tata_power.webp', sector: 'Power Utility' },
    { name: 'Bharat Petroleum', src: '/assets/client-logos/bpcl.webp', sector: 'Hydrocarbon Refineries' },
    { name: 'NTPC', src: '/assets/client-logos/ntpc.webp', sector: 'Power Corporation' },
    { name: 'BSTPTC', src: '/assets/client-logos/bstptc.webp', sector: 'Transmission Corporation' },
    { name: 'DRDO', src: '/assets/client-logos/drdo.webp', sector: 'Defense Research' },
    { name: 'Indian Railways', src: '/assets/client-logos/indian_railway.webp', sector: 'National Rail Transit' },
  ];

  const row2Logos = [
    { name: 'BSES Yamuna Power', src: '/assets/client-logos/bses.webp', sector: 'Power Distribution' },
    { name: 'MPPKVVCL', src: '/assets/client-logos/mppkvvcl.webp', sector: 'State Utility' },
    { name: 'NHPC', src: '/assets/client-logos/nhpc.webp', sector: 'Hydro Power' },
    { name: 'RRVUN', src: '/assets/client-logos/rrvun.webp', sector: 'Electricity Board' },
    { name: 'Tata Motors', src: '/assets/client-logos/tata_motors.webp', sector: 'Automotive OEM' },
    { name: 'Delhi Metro Rail Corporation', src: '/assets/client-logos/dmrc.webp', sector: 'Urban Mass Transit' },
    { name: 'BHEL', src: '/assets/client-logos/bhel.webp', sector: 'Heavy Electricals' },
    { name: 'Larsen & Toubro (L&T)', src: '/assets/client-logos/lnt.webp', sector: 'Multinational EPC' },
    { name: 'Delhi Transco Limited', src: '/assets/client-logos/dtl.webp', sector: 'High Voltage Grid' },
  ];

  const clientSegments = [
    {
      title: 'Power Generation & High-Voltage Transmission',
      clients: 'NTPC, NHPC, Tata Power, DTL, BSES, MPPGCL, RRVUN',
      desc: 'Supplying heavy-duty structural tower bolts (Grade 5.6 & 8.8) with high-micron hot-dip galvanization designed to resist extreme weather, high-voltage induction, and wind shear.',
      icon: Building2
    },
    {
      title: 'Metro Rail & Railway Infrastructure',
      clients: 'Delhi Metro Rail Corporation (DMRC), Indian Railways',
      desc: 'Precision DIN 933 and DIN 931 track and structural fixings engineered for cyclic vibration, high proof load, and passenger safety compliance.',
      icon: ShieldCheck
    },
    {
      title: 'Hydrocarbon Refineries & Petrochemicals',
      clients: 'IndianOil (IOCL), Bharat Petroleum (BPCL)',
      desc: 'ASTM A193 B7 stud bolts and 2H heavy hex nuts fabricated for high-pressure flanges, cryogenic valves, and sour crude environments.',
      icon: Globe2
    },
    {
      title: 'Heavy EPC & Industrial Assembly',
      clients: 'Larsen & Toubro (L&T), Tata Projects Limited, BHEL',
      desc: 'Consolidated turnkey fastener procurement with batch EN 10204 3.1 mill test certificates, dual PCS/KGS logistics, and 24-48hr pan-India site delivery.',
      icon: Handshake
    }
  ];

  const exhibitionPhotos = [
    {
      id: 0,
      src: '/assets/exhibitions/exhibition_stand_branded.jpg',
      alt: 'CBH Tech India exhibition stand with branded fastener product panels',
      title: 'CBH Tech Global Trade Pavilion',
      desc: 'Showcasing high-tensile structural DIN fasteners and custom cold-forged industrial hardware at national manufacturing expos.',
    },
    {
      id: 1,
      src: '/assets/exhibitions/exhibition_stand_photo.jpg',
      alt: 'CBH Tech India exhibition booth and product displays on the show floor',
      title: 'Technical Consultation Booth',
      desc: 'Direct interaction with EPC contractors, structural engineers, and automotive procurement heads.',
    },
    {
      id: 2,
      src: '/assets/exhibitions/exhibition_conversation.jpg',
      alt: 'Live client conversation at CBH exhibition booth',
      title: 'Strategic Supply Partnerships',
      desc: 'Discussing annual enterprise fastener contracts, vendor consolidation, and custom dimensional prototyping.',
    },
  ];

  // GSAP image switch animation
  useEffect(() => {
    if (exhibitionImgRef.current) {
      gsap.fromTo(
        exhibitionImgRef.current,
        { opacity: 0.35, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }
      );
    }
  }, [activePhotoIdx]);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <MainHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartItems.length} />

      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A2E4E 0%, #0052CC 100%)',
          padding: '60px 0 50px',
          color: '#FFFFFF',
          borderBottom: '4px solid #FF6B00'
        }}
      >
        <div className="container">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#93C5FD', marginBottom: '18px' }}>
            <Link href="/" style={{ color: '#93C5FD', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Our Clients &amp; Global Connections</span>
          </div>

          <div style={{ maxWidth: '840px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#FED7AA', marginBottom: '16px', backdropFilter: 'blur(6px)' }}>
              <Users2 size={15} color="#FF6B00" />
              <span>GLOBAL CONNECTIONS · TRUSTED ACROSS MARKETS</span>
            </div>

            <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Trusted Across Markets &amp; Strategic National Infrastructure
            </h1>

            <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#DBEAFE', maxWidth: '720px' }}>
              From atomic research installations and ultra-mega power plants to interstate metro lines and heavy automotive assembly, CBH Fasteners is an approved and verified supply partner for India’s premier organizations.
            </p>
          </div>
        </div>
      </section>

      {/* Client Marquees Section */}
      <section className="cbh-trust-block cbh-global-connections-section" style={{ padding: '60px 0 40px' }}>
        <div className="container">
          <div className="cbh-trust-heading" style={{ marginBottom: '32px' }}>
            <div className="cbh-trust-heading-left">
              <p className="cbh-eyebrow">
                <span className="cbh-eyebrow-dot"></span>
                APPROVED PSU &amp; ENTERPRISE VENDOR
              </p>
              <h2 className="cbh-trust-title">Our Strategic Client Network</h2>
            </div>
            <p className="cbh-trust-heading-note">
              Approved vendor across India’s core public sector undertakings, defense agencies, energy utilities, and multinational construction conglomerates.
            </p>
          </div>

          {/* Client Marquees (Continuous Smooth Double Marquee) */}
          <div className="cbh-client-marquees">
            {/* Row 1: Leftward Marquee */}
            <div className="cbh-marquee-track-wrap">
              <div className="cbh-marquee-track track-left">
                <div className="cbh-logo-run">
                  {row1Logos.map((logo, idx) => (
                    <div key={`r1-1-${idx}`} className="cbh-client-logo-item" title={`${logo.name} - ${logo.sector}`}>
                      <Image
                        src={logo.src}
                        alt={logo.name}
                        width={160}
                        height={60}
                        className="cbh-client-logo-img"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                <div className="cbh-logo-run" aria-hidden="true">
                  {row1Logos.map((logo, idx) => (
                    <div key={`r1-2-${idx}`} className="cbh-client-logo-item" title={`${logo.name} - ${logo.sector}`}>
                      <Image
                        src={logo.src}
                        alt={logo.name}
                        width={160}
                        height={60}
                        className="cbh-client-logo-img"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Rightward Reverse Marquee */}
            <div className="cbh-marquee-track-wrap" style={{ marginTop: '16px' }}>
              <div className="cbh-marquee-track track-right">
                <div className="cbh-logo-run">
                  {row2Logos.map((logo, idx) => (
                    <div key={`r2-1-${idx}`} className="cbh-client-logo-item" title={`${logo.name} - ${logo.sector}`}>
                      <Image
                        src={logo.src}
                        alt={logo.name}
                        width={160}
                        height={60}
                        className="cbh-client-logo-img"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                <div className="cbh-logo-run" aria-hidden="true">
                  {row2Logos.map((logo, idx) => (
                    <div key={`r2-2-${idx}`} className="cbh-client-logo-item" title={`${logo.name} - ${logo.sector}`}>
                      <Image
                        src={logo.src}
                        alt={logo.name}
                        width={160}
                        height={60}
                        className="cbh-client-logo-img"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sector Breakdown Grid */}
      <section style={{ padding: '60px 0', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0052CC', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Industry Applications</span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
              Serving Core Sectors with Zero Mechanical Failure
            </h2>
            <p style={{ color: '#64748B', fontSize: '15px', marginTop: '10px' }}>
              Fasteners engineered and tested to withstand high vibration, extreme temperature gradients, and aggressive corrosion environments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {clientSegments.map((segment, idx) => {
              const IconComp = segment.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    padding: '28px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(0, 82, 204, 0.08)', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <IconComp size={22} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>{segment.title}</h3>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#FF6B00', marginBottom: '12px' }}>
                    Clients: {segment.clients}
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>{segment.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exhibitions & Industry Presence Showcase */}
      <section style={{ padding: '70px 0', background: '#FFFFFF' }}>
        <div className="container">
          <div className="cbh-exhibition-card">
            <div className="cbh-exhibition-layout">
              {/* Visual Photo (GSAP Animated Switcher) */}
              <div className="cbh-exhibition-feature-wrap" ref={exhibitionImgRef}>
                <Image
                  src={exhibitionPhotos[activePhotoIdx].src}
                  alt={exhibitionPhotos[activePhotoIdx].alt}
                  width={720}
                  height={460}
                  className="cbh-exhibition-img"
                  priority
                />
                <div className="cbh-exhibition-badge">
                  <span className="pulse-dot"></span>
                  <span>GLOBAL INDUSTRIAL PRESENCE</span>
                </div>
              </div>

              {/* Content & Interactive Switcher */}
              <div className="cbh-exhibition-copy">
                <p className="cbh-eyebrow">
                  <span className="cbh-eyebrow-dot"></span>
                  EXHIBITIONS &amp; INDUSTRY PRESENCE
                </p>
                <h3 className="cbh-exhibition-title">Meeting the people behind the products.</h3>
                <p className="cbh-exhibition-desc">
                  National manufacturing trade fairs bring technical conversations, supply chain alignments, and contract opportunities into direct focus.
                </p>

                <div className="cbh-exhibition-detail-box">
                  <strong>{exhibitionPhotos[activePhotoIdx].title}</strong>
                  <p>{exhibitionPhotos[activePhotoIdx].desc}</p>
                </div>

                {/* Photo Selector Buttons */}
                <div className="cbh-exhibition-thumbnails">
                  {exhibitionPhotos.map((photo, idx) => {
                    const isActive = activePhotoIdx === idx;
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        className={`cbh-exhibition-thumb-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setActivePhotoIdx(idx)}
                        aria-label={`View photo ${idx + 1}: ${photo.title}`}
                      >
                        <Image
                          src={photo.src}
                          alt=""
                          width={90}
                          height={60}
                          className="cbh-exhibition-thumb-img"
                        />
                        <span>0{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Procurement Partnership CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '60px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>
            Consolidate Your Enterprise Fastener Vendor Base
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '16px', lineHeight: 1.6, marginBottom: '28px' }}>
            Schedule an on-site technical consultation, negotiate annual rate contracts (ARC), or connect with our institutional supply desk for bulk OEM pricing.
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
              Submit Enterprise RFQ
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
              Contact OEM Supply Desk
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
