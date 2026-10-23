'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Zap, User, Home, Layers } from 'lucide-react';
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

            {/* Rapid RFQ Matrix Red CTA (Hidden on small mobile, accessible via bottom bar) */}
            <Link href="/bulk-order" className="btn-primary hide-mobile" style={{ padding: '8px 16px', fontSize: '14px' }}>
              <span>Rapid RFQ Matrix</span>
              <Zap size={16} />
            </Link>

            {/* Account Icon */}
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
                flexShrink: 0
              }}
              title="My Account"
            >
              <User size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Fixed Bottom Navigation Bar */}
      <nav className="mobile-bottom-dock show-tablet-down" aria-label="Mobile Navigation">
        <Link href="/" className="mobile-dock-btn">
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link href="/#catalog" className="mobile-dock-btn">
          <Layers size={20} />
          <span>Catalog</span>
        </Link>
        <Link href="/bulk-order" className="mobile-dock-btn mobile-dock-rfq">
          <div className="dock-rfq-circle">
            <Zap size={20} />
          </div>
          <span>RFQ</span>
        </Link>
        <button type="button" className="mobile-dock-btn" onClick={onOpenCart}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="dock-counter">{cartCount}</span>}
          </div>
          <span>Cart</span>
        </button>
        <Link href="/customer" className="mobile-dock-btn">
          <User size={20} />
          <span>Portal</span>
        </Link>
      </nav>
    </>
  );
}
