'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowUpRight,
  X,
  FileCheck2,
  FileText,
  Download,
  Building2,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

interface Certificate {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  fullImage: string;
  validity?: string;
  issuingBody?: string;
}

export default function CertificatePage() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  const certificates: Certificate[] = [
    {
      id: 'ce',
      category: 'CE MARKING',
      title: 'CE Certificate of Conformity',
      subtitle: 'CE mark verification under European construction product standards',
      thumbnail: '/assets/certificates/cert_ce.webp',
      fullImage: '/assets/certificates/cert_ce.webp',
      validity: 'Active',
      issuingBody: 'European Conformity Notified Body'
    },
    {
      id: 'star',
      category: 'STARHOUSE',
      title: 'One Star Export House',
      subtitle: 'Certificate of Recognition · Govt. of India Ministry of Commerce',
      thumbnail: '/assets/certificates/cert_star_export.jpg',
      fullImage: '/assets/certificates/cert_star_export.jpg',
      validity: 'Active',
      issuingBody: 'Directorate General of Foreign Trade (DGFT)'
    },
    {
      id: 'tuv',
      category: 'CERTIFICATION',
      title: 'TÜV Rheinland ISO 9001:2015',
      subtitle: 'Quality Management System · valid through 7 February 2029',
      thumbnail: '/assets/certificates/cert_tuv_iso.jpg',
      fullImage: '/assets/certificates/cert_tuv_iso.jpg',
      validity: 'Valid to Feb 2029',
      issuingBody: 'TÜV Rheinland Cert GmbH'
    },
    {
      id: 'bis-licence',
      category: 'BIS PRODUCT LICENCE',
      title: 'CM/L-9700253821',
      subtitle: 'IS 1364 Part 1:2023 · supplied official BIS mark licence',
      thumbnail: '/assets/certificates/cert_bis_licence.jpg',
      fullImage: '/assets/certificates/cert_bis_licence.jpg',
      validity: 'Active Under QCO',
      issuingBody: 'Bureau of Indian Standards (BIS)'
    },
    {
      id: 'bis-grant',
      category: 'BIS CERTIFICATION LETTER',
      title: 'BIS Standard Mark Licence Grant',
      subtitle: 'Official grant letter for CM/L-9700253821 compliance',
      thumbnail: '/assets/certificates/cert_bis_grant.jpg',
      fullImage: '/assets/certificates/cert_bis_grant.jpg',
      validity: 'Official Grant',
      issuingBody: 'Bureau of Indian Standards (BIS)'
    },
    {
      id: 'aqc',
      category: 'EXPIRED CERTIFICATE',
      title: 'ISO 9001:2015 · AQC Global',
      subtitle: 'Historical reference quality certification',
      thumbnail: '/assets/certificates/cert_aqc_iso.png',
      fullImage: '/assets/certificates/cert_aqc_iso.png',
      validity: 'Historical Reference',
      issuingBody: 'AQC Middle East LLC'
    },
    {
      id: 'msme',
      category: 'NOMINATION',
      title: 'ET MSME Awards 2022',
      subtitle: 'Automobile & OEM MSME of the Year nomination',
      thumbnail: '/assets/certificates/cert_msme_awards.jpg',
      fullImage: '/assets/certificates/cert_msme_awards.jpg',
      validity: 'Award Finalist',
      issuingBody: 'The Economic Times'
    },
  ];

  const standards = [
    {
      code: 'ISO 9001:2015',
      body: 'TÜV Rheinland',
      desc: 'Certified manufacturing, quality assurance, cold-heading traceability and continuous improvement systems.'
    },
    {
      code: 'IS 1364 / BIS',
      body: 'Bureau of Indian Standards',
      desc: 'Conformity for hex head screws, bolts, and nuts under Government of India mandatory Quality Control Orders.'
    },
    {
      code: 'EN 10204 3.1',
      body: 'Inspection Certificate',
      desc: 'Heat-level chemical spectrometry, proof stress, yield strength, and dimensional calibration documented per batch.'
    },
    {
      code: 'ASTM B117',
      body: 'Salt Spray Lab',
      desc: 'Surface protection testing up to 1000+ hours red rust resistance for hot-dip galvanized & geomet coatings.'
    }
  ];

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#93C5FD', marginBottom: '18px' }}>
            <Link href="/" style={{ color: '#93C5FD', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Certificate &amp; Quality</span>
          </div>

          <div style={{ maxWidth: '840px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#FED7AA', marginBottom: '16px', backdropFilter: 'blur(6px)' }}>
              <ShieldCheck size={15} color="#FF6B00" />
              <span>QUALITY &amp; RECOGNITION · CERTIFIED FOR QUALITY</span>
            </div>

            <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Certified for Quality &amp; Regulatory Compliance
            </h1>

            <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#DBEAFE', maxWidth: '720px' }}>
              TÜV Rheinland ISO 9001:2015 accredited through February 2029. Licensed under Bureau of Indian Standards (BIS) CM/L-9700253821, CE conformity, and Ministry of Commerce One Star Export House standards.
            </p>
          </div>
        </div>
      </section>

      {/* Standards Badges Row */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '36px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {standards.map((std, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '15px', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{std.code}</strong>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', background: '#ECFDF5', color: '#059669', borderRadius: '4px' }}>
                    VERIFIED
                  </span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0052CC', marginBottom: '6px' }}>{std.body}</div>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>{std.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Certificates Showcase Section */}
      <section style={{ padding: '60px 0 80px', background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ marginBottom: '36px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0052CC', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Official Credentials</span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
              Accreditation Documents &amp; Test Approvals
            </h2>
            <p style={{ color: '#64748B', fontSize: '15px', marginTop: '8px' }}>
              Click any certificate to inspect full-size scan, issuing authority validation, and licence numbers.
            </p>
          </div>

          {/* Certificate Cards Grid */}
          <div className="cbh-certification-grid">
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
                  <span>View full document</span>
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
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                      {selectedCert.subtitle}
                    </span>
                    {selectedCert.validity && (
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                        Status: {selectedCert.validity}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setSelectedCert(null)}
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mill Test Certificate MTC Request Banner */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '60px 0' }}>
        <div className="container">
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '40px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px'
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0052CC', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                <FileCheck2 size={16} />
                <span>Need Batch-Specific Inspection Certificates?</span>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                EN 10204 3.1 Mill Test Reports Dispatched with Every Shipment
              </h3>
              <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6 }}>
                Every consignment from CBH includes traceable heat numbers, tensile proof loads, raw material chemical composition, and coating thickness reports. Request an advance sample test report for your EPC tender.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/bulk-order"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#0052CC',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                <span>Request Sample MTC &amp; RFQ</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                  border: '1px solid #CBD5E1'
                }}
              >
                <span>Contact Lab Lead</span>
              </Link>
            </div>
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
