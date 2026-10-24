'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ArrowUpRight, X, ExternalLink, ShieldCheck, Award } from 'lucide-react';

interface Certificate {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  fullImage: string;
  isPdf?: boolean;
}

export default function QualityRecognitionSection() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const certificates: Certificate[] = [
    {
      id: 'ce',
      category: 'CE MARKING',
      title: 'CE',
      subtitle: 'CE mark shown on the supplied certificate',
      thumbnail: '/assets/certificates/cert_ce.webp',
      fullImage: '/assets/certificates/cert_ce.webp',
    },
    {
      id: 'star',
      category: 'STARHOUSE',
      title: 'One Star Export House',
      subtitle: 'Certificate of Recognition · Govt. of India',
      thumbnail: '/assets/certificates/cert_star_export.jpg',
      fullImage: '/assets/certificates/cert_star_export.jpg',
    },
    {
      id: 'tuv',
      category: 'CERTIFICATION',
      title: 'TÜV',
      subtitle: 'ISO 9001:2015 · valid through 7 February 2029',
      thumbnail: '/assets/certificates/cert_tuv_iso.jpg',
      fullImage: '/assets/certificates/cert_tuv_iso.jpg',
    },
    {
      id: 'bis-licence',
      category: 'BIS PRODUCT LICENCE',
      title: 'CM/L-9700253821',
      subtitle: 'IS 1364 Part 1:2023 · supplied licence',
      thumbnail: '/assets/certificates/cert_bis_licence.jpg',
      fullImage: '/assets/certificates/cert_bis_licence.jpg',
    },
    {
      id: 'bis-grant',
      category: 'BIS CERTIFICATION LETTER',
      title: 'BIS Standard Mark licence',
      subtitle: 'Grant letter for CM/L-9700253821',
      thumbnail: '/assets/certificates/cert_bis_grant.jpg',
      fullImage: '/assets/certificates/cert_bis_grant.jpg',
    },
    {
      id: 'aqc',
      category: 'EXPIRED CERTIFICATE',
      title: 'ISO 9001:2015 · AQC Global',
      subtitle: 'Historical reference certification',
      thumbnail: '/assets/certificates/cert_aqc_iso.png',
      fullImage: '/assets/certificates/cert_aqc_iso.png',
    },
    {
      id: 'msme',
      category: 'NOMINATION',
      title: 'ET MSME Awards 2022',
      subtitle: 'Automobile & OEM MSME of the Year nomination',
      thumbnail: '/assets/certificates/cert_msme_awards.jpg',
      fullImage: '/assets/certificates/cert_msme_awards.jpg',
    },
  ];

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        gsap.from('.cbh-cert-card', {
          opacity: 0,
          y: 35,
          scale: 0.95,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="cbh-trust-block cbh-certification-section" id="quality" ref={sectionRef}>
      <div className="container">
        {/* Section Header */}
        <div className="cbh-trust-heading">
          <div className="cbh-trust-heading-left">
            <p className="cbh-eyebrow">
              <span className="cbh-eyebrow-dot"></span>
              QUALITY &amp; RECOGNITION
            </p>
            <h2 className="cbh-trust-title">Certified for quality</h2>
          </div>
          <p className="cbh-trust-heading-note">
            TÜV states validity through February 2029. BIS documents valid under Indian standard specifications; verified for cold-forging, proof load and metallurgical compliance.
          </p>
        </div>

        {/* Certificate Cards Grid (Visual Showcases) */}
        <div className="cbh-certification-grid" ref={cardsRef}>
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="cbh-cert-card"
              onClick={() => setSelectedCert(cert)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCert(cert);
                }
              }}
              aria-label={`View full certificate: ${cert.title}`}
            >
              <div className="cbh-cert-thumbnail-wrap">
                <Image
                  src={cert.thumbnail}
                  alt={cert.title}
                  width={340}
                  height={440}
                  className="cbh-cert-thumbnail"
                  loading="lazy"
                />
                <span className="cbh-cert-open-badge">
                  <ArrowUpRight size={14} />
                </span>
              </div>

              <div className="cbh-cert-copy">
                <span className="cbh-cert-category">{cert.category}</span>
                <strong className="cbh-cert-title">{cert.title}</strong>
                <span className="cbh-cert-subtitle">{cert.subtitle}</span>
              </div>

              <div className="cbh-cert-action">
                <span>View full size</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Modal / Lightbox for Certificate View */}
        {selectedCert && (
          <div className="cbh-dialog-backdrop" onClick={() => setSelectedCert(null)}>
            <div
              className="cbh-dialog-content"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cert-dialog-title"
            >
              <div className="cbh-dialog-header">
                <div>
                  <span className="cbh-cert-category">{selectedCert.category}</span>
                  <h3 id="cert-dialog-title" style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800 }}>
                    {selectedCert.title}
                  </h3>
                </div>
                <button
                  type="button"
                  className="cbh-dialog-close"
                  onClick={() => setSelectedCert(null)}
                  aria-label="Close certificate viewer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="cbh-dialog-body">
                <Image
                  src={selectedCert.fullImage}
                  alt={selectedCert.title}
                  width={900}
                  height={1200}
                  className="cbh-dialog-image"
                  priority
                />
              </div>

              <div className="cbh-dialog-footer">
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  {selectedCert.subtitle}
                </span>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setSelectedCert(null)}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
