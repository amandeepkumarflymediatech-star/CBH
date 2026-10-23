'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Zap, User } from 'lucide-react';
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
    <header className="main-header">
      <div className="container header-core">
        {/* Brand Identity */}
        <Link href="/" className="brand-block">
          <div className="brand-symbol">
            <span>CBH</span>
          </div>
          <div className="brand-text">
            <h1>CBH FASTENERS</h1>
            <span>INDUSTRIAL GRADE • BIS CERTIFIED</span>
          </div>
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
            placeholder="Search fastener by spec, thread M3-M64, grade 8.8 / 10.9 / 316..."
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

          {/* Rapid RFQ Matrix Red CTA */}
          <Link href="/bulk-order" className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
            <span>Rapid RFQ Matrix</span>
            <Zap size={16} />
          </Link>

          {/* Account Icon */}
          <Link
            href="/customer"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#D2051E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="My Account"
          >
            <User size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
