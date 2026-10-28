'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Zap,
  User,
  Home,
  Info,
  Package,
  Award,
  Users2,
  BookOpen,
  Menu,
  X,
  Phone,
  ChevronRight,
  ShieldCheck,
  Flame,
  ArrowRight,
  Building2,
  ChevronDown,
  LogOut,
  ShieldAlert,
  Images
} from 'lucide-react';
import { GlobalUnit } from '@/lib/types';
import { getStoredUser, logout, AuthUser } from '@/lib/auth';

interface MainHeaderProps {
  unit?: GlobalUnit;
  onUnitToggle?: (unit: GlobalUnit) => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function MainHeader({
  unit = 'PCS',
  onUnitToggle = () => { },
  cartCount = 0,
  onOpenCart = () => { },
}: MainHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    const handleAuth = () => setCurrentUser(getStoredUser());
    window.addEventListener('cbh_auth_change', handleAuth);
    return () => window.removeEventListener('cbh_auth_change', handleAuth);
  }, []);

  // Scroll detection for sticky shadow & elevation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchExpanded(false);
    }
  };

  // Nav Links List
  const navLinks = [
    { label: 'Home', href: '/', icon: Home, exact: true },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Product', href: '/products', icon: Package },
    { label: 'Certificates', href: '/certificate', icon: Award },
    { label: 'Our Clients', href: '/clients', icon: Users2 },
    { label: 'Blogs', href: '/blog', icon: BookOpen },
    { label: 'Gallery', href: '/gallery', icon: Images },
    
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    if (href.startsWith('/#')) {
      return false;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className={`main-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="container header-core">
          {/* Brand Identity */}
          <Link href="/" className="brand-block" title="CBH.STORE - Fastening Solutions At Your Fingertips">
            <img
              src="/assets/cbh-logo-stacked.png"
              alt="CBH.STORE - Fastening Solutions At Your Fingertips"
              className="brand-logo-img"
            />
          </Link>

          {/* Desktop Primary Navigation Menu */}
          <nav className="header-nav-menu hide-tablet-down" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href, link.exact);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`header-nav-link ${active ? 'active' : ''}`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Actions & Utilities */}
          <div className="header-actions">
            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="header-search-form hide-mobile">
              <div className={`header-search-wrap ${isSearchExpanded ? 'expanded' : ''}`}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchExpanded(true)}
                  onBlur={() => {
                    if (!searchQuery) setIsSearchExpanded(false);
                  }}
                  placeholder="Search DIN, M3-M64..."
                  className="header-search-field"
                />
              </div>
            </form>

            {/* Dual Unit Global Switcher (PCS / KGS) */}
            <div className="unit-switcher hide-mobile">
              <button
                type="button"
                className={unit === 'PCS' ? 'active' : ''}
                onClick={() => onUnitToggle('PCS')}
                title="Switch procurement unit to Pieces"
              >
                PCS
              </button>
              <button
                type="button"
                className={unit === 'KGS' ? 'active' : ''}
                onClick={() => onUnitToggle('KGS')}
                title="Switch procurement unit to Kilograms"
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

            {/* Rapid RFQ Matrix CTA (Desktop) */}
            <Link
              href="/bulk-order"
              className="btn-primary hide-tablet-down"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              title="Open Bulk RFQ Engine"
            >
              <span>Rapid RFQ</span>
              <Zap size={15} />
            </Link>

            {/* Gold-Standard Unified Account & Sign In Hub (Desktop) */}
            <div style={{ position: 'relative' }} className="hide-tablet-down">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '24px',
                    border: currentUser.role === 'admin' ? '1px solid #BFDBFE' : '1px solid #FED7AA',
                    background: currentUser.role === 'admin' ? '#EFF6FF' : '#FFF7ED',
                    color: currentUser.role === 'admin' ? '#0052CC' : '#C2410C',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}
                  title="My Account & Operations"
                >
                  {currentUser.role === 'admin' ? <ShieldCheck size={15} /> : <Building2 size={15} />}
                  <span style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.role === 'admin' ? 'Admin' : (currentUser.companyName ? currentUser.companyName.split(' ')[0] : 'My Account')}
                  </span>
                  <ChevronDown size={13} style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 15px',
                    borderRadius: '24px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <User size={15} color="#475569" />
                  <span>Sign In</span>
                  <ChevronDown size={13} color="#94A3B8" style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                </button>
              )}

              {/* Account Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '260px',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                    padding: '8px',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    animation: 'fade-in 0.15s ease'
                  }}>
                    {currentUser ? (
                      <>
                        {/* Authenticated User Header Card */}
                        <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', marginBottom: '6px', border: '1px solid #F1F5F9' }}>
                          <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {currentUser.role === 'admin' ? 'CENTRAL HQ STATION' : 'VERIFIED OEM ACCOUNT'}
                          </span>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {currentUser.companyName || currentUser.fullName}
                          </strong>
                          <span style={{ fontSize: '11px', color: currentUser.role === 'admin' ? '#0052CC' : '#EA580C', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                            {currentUser.role === 'admin' ? 'Harpreet Singh (Chief Operations)' : (currentUser.tier ? `${currentUser.tier} OEM (-${currentUser.tierDiscountPct || 18}%)` : 'Procurement Buyer')}
                          </span>
                        </div>

                        <Link
                          href={currentUser.role === 'admin' ? '/admin' : '/customer'}
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A', textDecoration: 'none', background: '#F8FAFC' }}
                        >
                          <Building2 size={15} color={currentUser.role === 'admin' ? '#0052CC' : '#FF6B00'} />
                          <span>{currentUser.role === 'admin' ? 'Admin Dashboard' : 'Client Dashboard'}</span>
                        </Link>
                        <Link
                          href="/bulk-order"
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, color: '#475569', textDecoration: 'none' }}
                        >
                          <Zap size={15} color="#FF6B00" />
                          <span>Rapid RFQ Engine</span>
                        </Link>

                        <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '6px', paddingTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout('/');
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#EF4444',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                          >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid #F1F5F9', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            PROCUREMENT &amp; CLIENT ACCESS
                          </span>
                        </div>
                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            background: '#FFF7ED',
                            border: '1px solid #FFEDD5',
                            textDecoration: 'none',
                            marginBottom: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={15} color="#FF6B00" />
                            <strong style={{ fontSize: '13px', color: '#9A3412' }}>Sign In to Client Portal</strong>
                          </div>
                          <span style={{ fontSize: '11px', color: '#C2410C', paddingLeft: '23px' }}>
                            Track live LR shipments, MTCs &amp; RFQs
                          </span>
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, color: '#334155', textDecoration: 'none' }}
                        >
                          <User size={15} color="#0284C7" />
                          <span>Register OEM Company</span>
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile & Tablet Fixed Menu Hamburger Button */}
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
                  src="/assets/cbh-logo-stacked.png"
                  alt="CBH.STORE"
                  className="brand-logo-img"
                  style={{ height: '56px' }}
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
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px' }}>
                  <Search size={16} color="#64748B" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search DIN, bolts, anchors..."
                    style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '8px', fontSize: '13px', width: '100%', color: '#0F172A' }}
                  />
                  <button type="submit" style={{ fontSize: '12px', fontWeight: 700, color: '#0052CC', padding: '0 4px' }}>Go</button>
                </div>
              </form>

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

              {/* Main Navigation Links */}
              <nav className="mobile-drawer-links">
                <div className="nav-group-title">NAVIGATION MENU</div>

                {navLinks.map((item) => {
                  const IconComp = item.icon;
                  const active = isLinkActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`drawer-nav-item ${active ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconComp size={18} />
                      <span style={{ fontWeight: active ? 700 : 500 }}>{item.label}</span>
                    </Link>
                  );
                })}

                <div className="nav-group-title">SPECIALIZED CATALOGS</div>

                <Link
                  href="/products"
                  className="drawer-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShieldCheck size={18} />
                  <span>Fixings &amp; Structural Anchors</span>
                </Link>

                <Link
                  href="/surplus"
                  className="drawer-nav-item surplus-highlight"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Flame size={18} color="#FF6B00" />
                  <span>Clearance &amp; Surplus Stock</span>
                  <span className="drawer-badge-red" style={{ background: '#FF6B00' }}>-60%</span>
                </Link>

                <Link
                  href="/virtual-store"
                  className="drawer-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package size={18} />
                  <span>3D Virtual Depot (Interactive)</span>
                </Link>

                <div className="nav-group-title">PORTALS &amp; ACCOUNT</div>

                {currentUser ? (
                  <>
                    <div style={{ padding: '8px 16px', background: '#F8FAFC', borderRadius: '8px', margin: '4px 0 8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Signed in as:</span>
                      <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>{currentUser.fullName}</strong>
                      <span style={{ fontSize: '11px', color: currentUser.role === 'admin' ? '#0052CC' : '#EA580C', fontWeight: 700 }}>
                        {currentUser.role === 'admin' ? 'HQ Admin' : currentUser.companyName}
                      </span>
                    </div>

                    <Link
                      href={currentUser.role === 'admin' ? '/admin' : '/customer'}
                      className="drawer-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Building2 size={18} color={currentUser.role === 'admin' ? '#0052CC' : '#FF6B00'} />
                      <span>{currentUser.role === 'admin' ? 'Admin Operations Terminal' : 'Client Portal & Order History'}</span>
                    </Link>



                    <button
                      type="button"
                      className="drawer-nav-item"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout('/');
                      }}
                      style={{ color: '#EF4444' }}
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="drawer-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Building2 size={18} color="#FF6B00" />
                      <span>Sign In to Client Portal</span>
                    </Link>

                    <Link
                      href="/register"
                      className="drawer-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={18} color="#0284C7" />
                      <span>Register OEM Account</span>
                    </Link>
                  </>
                )}

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
