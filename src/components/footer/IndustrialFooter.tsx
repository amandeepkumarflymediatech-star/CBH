'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function IndustrialFooter() {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#D2051E',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-headline)',
                fontWeight: 800,
                fontSize: '18px',
                borderRadius: '3px'
              }}>
                CBH
              </div>
              <span style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800 }}>
                CBH FASTENERS
              </span>
            </div>

            <p style={{ fontSize: '13px', color: '#9BA7B6', lineHeight: 1.6, marginBottom: '16px' }}>
              Precision-engineered fasteners, heavy-duty industrial structural anchors, and calibrated high-tensile hardware manufactured according to DIN, ISO, ASTM, and BIS standards.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(5, 150, 105, 0.15)',
              color: '#34D399',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)'
            }}>
              <ShieldCheck size={14} />
              <span>ISO 9001:2015 & BIS Certified Works</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="footer-col">
            <h4>Core Hardware</h4>
            <ul className="footer-links">
              <li><Link href="/#catalog">DIN 933 High Tensile Hex Set Screws</Link></li>
              <li><Link href="/#catalog">DIN 912 Hexagon Socket Head Cap</Link></li>
              <li><Link href="/#catalog">DIN 934 Heavy Hex & Nylon Lock Nuts</Link></li>
              <li><Link href="/#catalog">Mechanical & Chemical Wedge Anchors</Link></li>
              <li><Link href="/#catalog">Continuous Thread Studs B7 / B8M</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="footer-col">
            <h4>Procurement Support</h4>
            <ul className="footer-links">
              <li><Link href="/bulk-order">Rapid RFQ Matrix & CSV Upload</Link></li>
              <li><Link href="/customer">Enterprise Credit Line & PO Tracking</Link></li>
              <li><Link href="/customer/certificates">EN 10204 3.1 Mill Test Inspection</Link></li>
              <li><Link href="/surplus">EPC Surplus & Liquidation Lots</Link></li>
              <li><Link href="/admin">Admin Control Console</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="footer-col">
            <h4>Direct Dispatch Works</h4>
            <p style={{ fontSize: '13px', color: '#9BA7B6', marginBottom: '12px' }}>
              Central Industrial Logistics Depot, Fasteners Park, Phase IV, Industrial Area, India
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#CED7E2', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><span style={{ color: '#8896A6' }}>Dispatch Line:</span> +91 98880 21000</div>
              <div><span style={{ color: '#8896A6' }}>Technical Sales:</span> rfq@cbh.store</div>
              <div><span style={{ color: '#8896A6' }}>Hours:</span> 08:00 - 20:00 IST (Mon-Sat)</div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© 2026 CBH Store – A Venture of CBH Tech Pvt. Ltd., India. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)' }}>
            <span>DIN EN ISO Standard Compliant</span>
            <span>GST Registered B2B Entity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
