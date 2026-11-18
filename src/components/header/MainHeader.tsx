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
  Images,
  MessageCircle,
  Truck,
  FileText,
  Sparkles
} from 'lucide-react';
import { GlobalUnit } from '@/lib/types';
import { getStoredUser, logout, AuthUser } from '@/lib/auth';
import CategoriesMegaMenu from '@/components/header/CategoriesMegaMenu';
import MobileCategoriesAccordion from '@/components/header/MobileCategoriesAccordion';

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
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);

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
    { label: 'Products', href: '/products', icon: Package },
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

              // Hover on Products opens the Categories & Subcategories Mega Menu
              if (link.href === '/products') {
                return <CategoriesMegaMenu key={link.label} />;
              }

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
                  placeholder="Search Bolts, Nuts"
                  className="header-search-field"
                />
              </div>
            </form>

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
                    width: '240px',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.04)',
                    padding: '6px',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    animation: 'fade-in 0.15s ease'
                  }}>
                    {currentUser ? (() => {
                      const userInitials = (currentUser.companyName || currentUser.fullName || 'CBH')
                        .replace(/[^a-zA-Z0-9 ]/g, '')
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w: string) => w[0].toUpperCase())
                        .join('') || 'CB';

                      const isAdmin = currentUser.role === 'admin';
                      const displayName = currentUser.companyName || currentUser.fullName || 'User';

                      return (
                        <>
                          {/* Authenticated User Header Card - Compact, Clean & Unique */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '9px',
                            padding: '8px 10px',
                            background: isAdmin ? '#F8FAFC' : '#FDFBF7',
                            borderRadius: '8px',
                            border: isAdmin ? '1px solid #E2E8F0' : '1px solid #FED7AA',
                            marginBottom: '4px'
                          }}>
                            {/* Monogram Avatar */}
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: isAdmin
                                ? 'linear-gradient(135deg, #0052CC 0%, #1D4ED8 100%)'
                                : 'linear-gradient(135deg, #FF6B00 0%, #EA580C 100%)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '12px',
                              flexShrink: 0,
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                            }}>
                              {userInitials}
                            </div>

                            {/* Name & Role */}
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <strong style={{
                                display: 'block',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                color: '#0F172A',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.2
                              }}>
                                {displayName}
                              </strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                                <span style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  backgroundColor: isAdmin ? '#0052CC' : '#16A34A',
                                  flexShrink: 0
                                }} />
                                <span style={{
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  color: isAdmin ? '#0052CC' : '#EA580C',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {isAdmin ? 'Central HQ Admin' : (currentUser.tier ? `${currentUser.tier} OEM (-${currentUser.tierDiscountPct || 18}%)` : 'Verified Buyer')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Navigation Links */}
                          <Link
                            href={isAdmin ? '/admin' : '/customer'}
                            onClick={() => setIsUserMenuOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#0F172A',
                              textDecoration: 'none',
                              background: '#F8FAFC',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Building2 size={14} color={isAdmin ? '#0052CC' : '#FF6B00'} />
                              <span>{isAdmin ? 'Admin Dashboard' : 'Client Dashboard'}</span>
                            </div>
                            <ChevronRight size={13} color="#94A3B8" />
                          </Link>

                          <Link
                            href={isAdmin ? '/admin/orders' : '/customer?tab=orders'}
                            onClick={() => setIsUserMenuOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#475569',
                              textDecoration: 'none'
                            }}
                          >
                            <Truck size={14} color="#64748B" />
                            <span>{isAdmin ? 'Orders & Dispatches' : 'My Orders & Tracking'}</span>
                          </Link>

                          <Link
                            href="/bulk-order"
                            onClick={() => setIsUserMenuOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#475569',
                              textDecoration: 'none'
                            }}
                          >
                            <Zap size={14} color="#FF6B00" />
                            <span>Rapid RFQ Engine</span>
                          </Link>

                          {/* Sign Out */}
                          <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '3px', paddingTop: '3px' }}>
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
                                gap: '8px',
                                padding: '7px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#EF4444',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <LogOut size={13} />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </>
                      );
                    })() : (
                      <>
                        <div style={{ padding: '6px 10px 4px', borderBottom: '1px solid #F1F5F9', marginBottom: '3px' }}>
                          <span style={{ fontSize: '9.5px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Procurement Access
                          </span>
                        </div>
                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            background: '#FFF7ED',
                            border: '1px solid #FFEDD5',
                            textDecoration: 'none',
                            marginBottom: '2px'
                          }}
                        >
                          <Building2 size={14} color="#FF6B00" />
                          <strong style={{ fontSize: '12.5px', color: '#9A3412', fontWeight: 700 }}>Sign In to Portal</strong>
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#334155', textDecoration: 'none' }}
                        >
                          <User size={14} color="#0284C7" />
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
              className="mobile-menu-trigger show-tablet-down lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              title="Menu"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                background: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #1E293B',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.12)'
              }}
            >
              <Menu size={22} color="#FFFFFF" strokeWidth={2.4} />
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
                  style={{ height: '48px', width: 'auto' }}
                />
              </Link>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  minWidth: '38px',
                  minHeight: '38px',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  cursor: 'pointer'
                }}
              >
                <X size={20} color="#0F172A" strokeWidth={2.4} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="mobile-drawer-body">
              {/* Quick Search */}
              <form onSubmit={handleSearchSubmit} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px' }}>
                  <Search size={15} color="#0052CC" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search "
                    style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '8px', fontSize: '13px', width: '100%', color: '#0F172A' }}
                  />
                  <button type="submit" style={{ fontSize: '12px', fontWeight: 700, color: '#0052CC', padding: '0 4px', background: 'none', border: 'none', cursor: 'pointer' }}>Search</button>
                </div>
              </form>

              {/* Compact Quick Contact Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <a
                  href="https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20want%20to%20order%20nuts%20and%20bolts.%20Please%20help%20me."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#25D366',
                    color: '#FFFFFF',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    textDecoration: 'none'
                  }}
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="tel:+919888021000"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#F1F5F9',
                    color: '#0F172A',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    textDecoration: 'none',
                    border: '1px solid #CBD5E1'
                  }}
                >
                  <Phone size={14} color="#0052CC" />
                  <span>Helpline</span>
                </a>
              </div>

              {/* Main Navigation Links */}
              <nav className="mobile-drawer-links">
                <div className="nav-group-title">NAVIGATION MENU</div>

                {navLinks.map((item) => {
                  const IconComp = item.icon;
                  const active = isLinkActive(item.href, item.exact);

                  // Expandable Products Accordion in Mobile & Tablet Drawer
                  if (item.href === '/products') {
                    return (
                      <div key={item.label} className="drawer-products-dropdown">
                        <button
                          type="button"
                          onClick={() => setIsMobileProductsOpen((prev) => !prev)}
                          className={`drawer-nav-item ${active || isMobileProductsOpen ? 'active' : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            background: isMobileProductsOpen ? '#EFF6FF' : undefined,
                            color: isMobileProductsOpen ? '#0052CC' : undefined,
                            padding: '8px 10px',
                            borderRadius: '8px',
                          }}
                          aria-expanded={isMobileProductsOpen}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: active || isMobileProductsOpen ? '#DBEAFE' : '#F1F5F9',
                                border: active || isMobileProductsOpen ? '1px solid #93C5FD' : '1px solid #E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <IconComp size={16} color={active || isMobileProductsOpen ? '#1D4ED8' : '#334155'} />
                            </div>
                            <span style={{ fontWeight: active || isMobileProductsOpen ? 700 : 600, fontSize: '13.5px' }}>
                              {item.label}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '12px',
                              background: '#DBEAFE',
                              color: '#1D4ED8'
                            }}>
                              12 Families
                            </span>
                            <ChevronDown
                              size={16}
                              style={{
                                transform: isMobileProductsOpen ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s ease',
                                color: isMobileProductsOpen ? '#0052CC' : '#94A3B8'
                              }}
                            />
                          </div>
                        </button>

                        {/* Accordion panel listing all 12 categories and subcategories */}
                        {isMobileProductsOpen && (
                          <div style={{
                            paddingLeft: '10px',
                            paddingRight: '4px',
                            paddingTop: '6px',
                            paddingBottom: '8px',
                            marginLeft: '12px',
                            borderLeft: '2px solid #2563EB',
                            background: '#F8FAFC',
                            borderRadius: '0 8px 8px 0',
                            marginTop: '2px',
                            marginBottom: '6px'
                          }}>
                            {/* Fast Direct Link to all products */}
                            <Link
                              href="/products"
                              onClick={() => setIsMobileMenuOpen(false)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                borderRadius: '6px',
                                color: '#1D4ED8',
                                fontSize: '12px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                marginBottom: '8px'
                              }}
                            >
                              <span>Browse All 54,000+ Fasteners</span>
                              <ChevronRight size={14} />
                            </Link>

                            <MobileCategoriesAccordion
                              onCloseDrawer={() => setIsMobileMenuOpen(false)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`drawer-nav-item ${active ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: active ? '#EFF6FF' : '#F1F5F9',
                          border: active ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <IconComp size={16} color={active ? '#0052CC' : '#334155'} />
                      </div>
                      <span style={{ fontWeight: active ? 700 : 600, fontSize: '13.5px' }}>{item.label}</span>
                    </Link>
                  );
                })}

                <div className="nav-group-title">PORTALS &amp; ACCOUNT</div>

                {currentUser ? (
                  <>
                    <div style={{ padding: '8px 14px', background: '#F8FAFC', borderRadius: '8px', margin: '4px 0 8px', border: '1px solid #E2E8F0' }}>
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
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: currentUser.role === 'admin' ? '#EFF6FF' : '#FFF7ED',
                          border: currentUser.role === 'admin' ? '1px solid #BFDBFE' : '1px solid #FFEDD5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Building2 size={16} color={currentUser.role === 'admin' ? '#0052CC' : '#FF6B00'} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        {currentUser.role === 'admin' ? 'Admin Operations Terminal' : 'Client Portal & Order History'}
                      </span>
                    </Link>

                    <button
                      type="button"
                      className="drawer-nav-item"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout('/');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        color: '#EF4444'
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#FEF2F2',
                          border: '1px solid #FEE2E2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <LogOut size={16} color="#EF4444" />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="drawer-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#FFF7ED',
                          border: '1px solid #FFEDD5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Building2 size={16} color="#FF6B00" />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Sign In to Client Portal</span>
                    </Link>

                    <Link
                      href="/register"
                      className="drawer-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#F0F9FF',
                          border: '1px solid #E0F2FE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <User size={16} color="#0284C7" />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Register OEM Account</span>
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    marginTop: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <ShoppingBag size={16} color="#FFFFFF" />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>View RFQ Cart</span>
                  </div>
                  <span className="drawer-cart-pill">{cartCount} items</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
