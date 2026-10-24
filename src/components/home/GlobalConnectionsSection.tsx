'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ArrowUpRight, Globe2, Building2, ShieldCheck, MapPin } from 'lucide-react';

export default function GlobalConnectionsSection() {
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const exhibitionImgRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const row1Logos = [
    { name: 'IndianOil', src: '/assets/client-logos/indianoil.webp' },
    { name: 'MPPGCL', src: '/assets/client-logos/mppgcl.webp' },
    { name: 'NALCO', src: '/assets/client-logos/nalco.webp' },
    { name: 'PSPCL', src: '/assets/client-logos/pspcl.webp' },
    { name: 'Tata Projects Limited', src: '/assets/client-logos/tata_projects.webp' },
    { name: 'Tata Power', src: '/assets/client-logos/tata_power.webp' },
    { name: 'Bharat Petroleum', src: '/assets/client-logos/bpcl.webp' },
    { name: 'NTPC', src: '/assets/client-logos/ntpc.webp' },
    { name: 'BSTPTC', src: '/assets/client-logos/bstptc.webp' },
    { name: 'DRDO', src: '/assets/client-logos/drdo.webp' },
    { name: 'Indian Railways', src: '/assets/client-logos/indian_railway.webp' },
  ];

  const row2Logos = [
    { name: 'BSES Yamuna Power', src: '/assets/client-logos/bses.webp' },
    { name: 'MPPKVVCL', src: '/assets/client-logos/mppkvvcl.webp' },
    { name: 'NHPC', src: '/assets/client-logos/nhpc.webp' },
    { name: 'RRVUN', src: '/assets/client-logos/rrvun.webp' },
    { name: 'Tata Motors', src: '/assets/client-logos/tata_motors.webp' },
    { name: 'Delhi Metro Rail Corporation', src: '/assets/client-logos/dmrc.webp' },
    { name: 'BHEL', src: '/assets/client-logos/bhel.webp' },
    { name: 'Larsen & Toubro (L&T)', src: '/assets/client-logos/lnt.webp' },
    { name: 'Delhi Transco Limited', src: '/assets/client-logos/dtl.webp' },
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
    <section className="cbh-trust-block cbh-global-connections-section" id="global-connections" ref={sectionRef}>
      <div className="container">
        {/* Section Header */}
        <div className="cbh-trust-heading">
          <div className="cbh-trust-heading-left">
            <p className="cbh-eyebrow">
              <span className="cbh-eyebrow-dot"></span>
              GLOBAL CONNECTIONS
            </p>
            <h2 className="cbh-trust-title">Trusted across markets</h2>
          </div>
          <p className="cbh-trust-heading-note">
            Supplying critical infrastructure, energy grids, defense programs, and heavy automotive assembly lines across India and global export corridors.
          </p>
        </div>

        {/* Client Marquees (Continuous Smooth Double Marquee) */}
        <div className="cbh-client-marquees">
          {/* Row 1: Leftward Marquee */}
          <div className="cbh-marquee-track-wrap">
            <div className="cbh-marquee-track track-left">
              <div className="cbh-logo-run">
                {row1Logos.map((logo, idx) => (
                  <div key={`r1-1-${idx}`} className="cbh-client-logo-item">
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
                  <div key={`r1-2-${idx}`} className="cbh-client-logo-item">
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
                  <div key={`r2-1-${idx}`} className="cbh-client-logo-item">
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
                  <div key={`r2-2-${idx}`} className="cbh-client-logo-item">
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

        {/* Exhibitions & Industry Presence Showcase */}
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
                Exhibitions bring product conversations, industry connections and new business opportunities into focus.
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
  );
}
