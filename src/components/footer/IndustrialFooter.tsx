'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default function IndustrialFooter() {
  const pathname = usePathname();

  // Hide global consumer footer on internal admin/customer portals, auth pages, and 3D virtual store
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/customer') || pathname === '/login' || pathname === '/register' || pathname === '/virtual-store') {
    return null;
  }

  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1 */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <Link href="/" style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none'
              }}>
                <img
                  src="/assets/cbh-logo-icon.png"
                  alt="CBH.STORE"
                  style={{ height: '78px', width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </Link>
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
            <h4>Useful & Policy Links</h4>
            <ul className="footer-links">
              <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/cancellation-and-refund-policy">Cancellation & Refund Policy</Link></li>
              <li><Link href="/shipping-and-delivery-policy">Shipping & Delivery Policy</Link></li>
              <li><Link href="/contact">Contact Us Desk</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="footer-col">
            <h4>Direct Dispatch Works</h4>
            <p style={{ fontSize: '13px', color: '#9BA7B6', marginBottom: '12px', lineHeight: 1.5 }}>
              Capital Towers, Gill Rd, opp. SBI, Miller Ganj, Ludhiana, Punjab 141003
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#CED7E2', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div><span style={{ color: '#8896A6' }}>Hotline:</span> <a href="tel:+919888021000" style={{ color: '#FF6B00', textDecoration: 'none', fontWeight: 800 }}>+91 98880 21000</a></div>
              <div><span style={{ color: '#8896A6' }}>Sales:</span> <a href="mailto:sales@capitalbolts.co" style={{ color: '#60A5FA', textDecoration: 'none' }}>sales@capitalbolts.co</a></div>
              <div><span style={{ color: '#8896A6' }}>Info:</span> <a href="mailto:info@capitalbolts.in" style={{ color: '#60A5FA', textDecoration: 'none' }}>info@capitalbolts.in</a></div>
              <div><span style={{ color: '#8896A6' }}>Hours:</span> Mon-Sat 10:00 - 18:00 IST</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <a
                href="https://www.facebook.com/CBHcapitalbolts/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/capitalboltsandhardwares/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255, 107, 0, 0.15)',
                  color: '#FF6B00',
                  border: '1px solid rgba(255, 107, 0, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© 2026 CBH Store – A Venture of CBH Tech Pvt. Ltd., India. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px', flexWrap: 'wrap' }}>
            <Link href="/terms-and-conditions" style={{ color: '#8896A6', textDecoration: 'none' }}>Terms</Link>
            <Link href="/privacy-policy" style={{ color: '#8896A6', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/cancellation-and-refund-policy" style={{ color: '#8896A6', textDecoration: 'none' }}>Refunds</Link>
            <Link href="/shipping-and-delivery-policy" style={{ color: '#8896A6', textDecoration: 'none' }}>Shipping</Link>
            <Link href="/contact" style={{ color: '#FF6B00', textDecoration: 'none', fontWeight: 700 }}>Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
