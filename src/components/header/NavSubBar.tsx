'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default function NavSubBar() {
  const pathname = usePathname();

  return (
    <div className="header-nav-bar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <nav className="nav-links">
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            All Catalog
          </Link>
          <Link href="/#catalog" className="nav-item">
            Hex Screws
          </Link>
          <Link href="/#catalog" className="nav-item">
            Bolts
          </Link>
          <Link href="/#catalog" className="nav-item">
            Nuts
          </Link>
          <Link href="/#catalog" className="nav-item">
            Anchors
          </Link>
          <Link href="/#catalog" className="nav-item">
            Threaded Rods
          </Link>
          <Link href="/surplus" className={`nav-item ${pathname === '/surplus' ? 'active' : ''}`} style={{ color: '#D2051E' }}>
            <span>Surplus Stock</span>
            <span className="nav-pill-badge">-60%</span>
          </Link>
        </nav>

        <div className="hide-tablet" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5A6678', fontFamily: 'var(--font-mono)' }}>
          <ShieldCheck size={14} color="#059669" />
          <span>Direct Mill Traceability 3.1 Certs Included</span>
        </div>
      </div>
    </div>
  );
}
