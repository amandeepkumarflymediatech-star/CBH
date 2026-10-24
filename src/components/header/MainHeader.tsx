'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  Zap,
  User,
  Home,
  Layers,
  Menu,
  X,
  Flame,
  ShieldCheck,
  Cpu,
  Globe,
  Award,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { GlobalUnit } from '@/lib/types';

interface MainHeaderProps {
  unit: GlobalUnit;
  onUnitToggle: (unit: GlobalUnit) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export default function MainHeader({
  unit,
  onUnitToggle,
  cartCount,
  onOpenCart,
}: MainHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="main-header">
        <div className="container header-core">
          {/* Brand Identity */}
          <Link href="/" className="brand-block" title="CBH Fasteners - Home">
            <img
              src="/assets/logo_blue.png"
              alt="CBH Fasteners - Industrial Precision Fastener Platform"
              className="brand-logo-img"
            />
          </Link>

          {/* Precision Search Matrix */}
          <div className="search-matrix">
            <select className="search-spec-select" defaultValue="ALL">
              <option value="ALL">All Specs (DIN / ISO)</option>
              <option value="DIN933">DIN 933 / ISO 4017</option>
              <option value="DIN912">DIN 912 / ISO 4762</option>
              <option value="DIN934">DIN 934 / ISO 4032</option>
              <option value="ASTMA193">ASTM A193 B7</option>
            </select>
            <input
              type="text"
              className="search-input"
              placeholder="Search fastener DIN, M3-M64, 8.8, 10.9..."
            />
            <button className="search-btn" title="Search catalog">
              <Search size={18} />
            </button>
          </div>

          {/* Header Actions */}
          <div className="header-actions">
            {/* Dual Unit Global Switcher */}
            <div className="unit-switcher">
              <button
                type="button"
                className={unit === 'PCS' ? 'active' : ''}
                onClick={() => onUnitToggle('PCS')}
              >
                PCS
              </button>
              <button
                type="button"
                className={unit === 'KGS' ? 'active' : ''}
                onClick={() => onUnitToggle('KGS')}
              >
                KGS
              </button>
            </div>

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              className="cart-trigger"
              onClick={onOpenCart}
              title="View RFQ Order Cart"
            >
              <ShoppingBag size={18} />
              <span className="cart-counter">{cartCount}</span>
            </button>

            {/* Rapid RFQ Matrix Red CTA (Desktop) */}
            <Link
              href="/bulk-order"
              className="btn-primary hide-mobile"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              <span>Rapid RFQ Matrix</span>
              <Zap size={16} />
            </Link>

            {/* Account Icon (Desktop) */}
            <Link
              href="/customer"
              className="hide-mobile"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#D2051E',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title="My Account"
            >
              <User size={18} />
            </Link>

            {/* Mobile & Tablet Fixed Menu Icon Button */}
            <button
              type="button"
              className="mobile-menu-trigger show-tablet-down"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Mobile & Tablet Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <Link
                href="/"
                className="brand-block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <img
                  src="/assets/logo_blue.png"
                  alt="CBH Fasteners"
                  className="brand-logo-img"
                  style={{ height: '32px' }}
                />
              </Link>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="mobile-drawer-body">
              {/* Unit Switcher */}
              <div className="drawer-unit-bar">
                <span className="unit-caption">Procurement Unit:</span>
                <div className="unit-switcher">
                  <button
                    type="button"
                    className={unit === 'PCS' ? 'active' : ''}
                    onClick={() => onUnitToggle('PCS')}
                  >
                    PCS
                  </button>
                  <button
                    type="button"
                    className={unit === 'KGS' ? 'active' : ''}
                    onClick={() => onUnitToggle('KGS')}
                  >
                    KGS
                  </button>
                </div>
              </div>

              {/* Primary RFQ CTA */}
              <Link
                href="/bulk-order"
                className="drawer-rfq-button"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="rfq-button-icon">
                  <Zap size={18} />
                </div>
                <div className="rfq-button-text">
                  <strong>Rapid RFQ Matrix</strong>
                  <span>Instant CSV upload &amp; direct quotes</span>
                </div>
                <ChevronRight size={18} />
              </Link>

              {/* Navigation Links */}
              <nav className="mobile-drawer-links">
                <div className="nav-group-title">DIRECT STOREFRONT</div>

                <Link
                  href="/"
                  className="drawer-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>

                <Link
                  href="/#catalog"
                  className="drawer-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Layers size={18} />
                  <span>Fasteners Catalog Matrix</span>
                </Link>

                <Link
                  href="/surplus"
                  className="drawer-nav-item surplus-highlight"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Flame size={18} color="#D2051E" />
                  <span>Clearance &amp; Surplus Stock</span>
                  <span className="drawer-badge-red">-60%</span>
                </Link>

                <div className="nav-group-title">COMPANY &amp; STANDARDS</div>

                <Link
                  href="/#quality"
                  className="drawer-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShieldCheck size={18} />
                  <span>Quality &amp; ISO 9001 / BIS Certificates</span>
                </Link>

                <Link
                  href="/#applications"
                  className="drawer-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Cpu size={18} />
                  <span>Applications (19 Industry Sectors)</span>
                </Link>

                <Link
                  href="/#global-connections"
                  className="drawer-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Globe size={18} />
                  <span>Global Connections &amp; Exhibitions</span>
                </Link>

                <Link
                  href="/#director"
                  className="drawer-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Award size={18} />
                  <span>Leadership &amp; Heritage (Since 1959)</span>
                </Link>

                <div className="nav-group-title">CUSTOMER SERVICES</div>

                <Link
                  href="/customer"
                  className="drawer-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Customer Portal &amp; Order History</span>
                </Link>

                <button
                  type="button"
                  className="drawer-nav-item drawer-cart-link"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCart();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShoppingBag size={18} />
                    <span>View RFQ Cart</span>
                  </div>
                  <span className="drawer-cart-pill">{cartCount} items</span>
                </button>
              </nav>

              {/* Direct Dispatch Support Contact */}
              <div className="drawer-dispatch-card">
                <div className="dispatch-badge">
                  <Phone size={13} />
                  <span>Direct Dispatch Works Helpline</span>
                </div>
                <a href="tel:+919888021000" className="dispatch-phone">
                  +91 98880 21000
                </a>
                <div className="dispatch-email">rfq@cbh.store</div>
                <div className="dispatch-hours">
                  Mon – Sat: 08:00 – 20:00 IST • Multimodal Freight Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
