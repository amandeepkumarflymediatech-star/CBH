'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function NavSubBar() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const navCategories = [
    { label: 'All Catalog', href: '/' },
    { label: 'Fixings & Anchors', href: '/products', badge: 'NEW' },
    { label: 'Steel Fixings', href: '/products/steel-fixings' },
    { label: 'Hex Screws DIN 933', href: '/#catalog' },
    { label: 'Heavy Hex Bolts', href: '/#catalog' },
    { label: 'Nuts & Washers', href: '/#catalog' },
    { label: 'Threaded Studs B7', href: '/#catalog' },
    { label: 'High Tensile 10.9', href: '/#catalog' },
    { label: 'Surplus Clearance', href: '/surplus', badge: '-60%', isSurplus: true },
  ];

  return (
    <div className="header-nav-bar">
      <div className="container nav-sub-container">
        {/* Left Arrow (Desktop / Tablet when scrollable) */}
        {canScrollLeft && (
          <button
            type="button"
            className="nav-scroll-arrow left"
            onClick={() => handleScroll('left')}
            title="Scroll categories left"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Swipeable Horizontal Categories Strip */}
        <nav
          className="nav-links"
          ref={scrollRef}
          onScroll={checkScroll}
          aria-label="Fastener Categories"
        >
          {navCategories.map((item, idx) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname === item.href;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''} ${item.isSurplus ? 'nav-item-surplus' : ''}`}
              >
                <span>{item.label}</span>
                {item.badge && <span className="nav-pill-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Right Arrow (Desktop / Tablet when scrollable) */}
        {canScrollRight && (
          <button
            type="button"
            className="nav-scroll-arrow right"
            onClick={() => handleScroll('right')}
            title="Scroll categories right"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Traceability Trust Badge (Desktop Only) */}
        <div className="nav-mill-cert-badge hide-tablet">
          <ShieldCheck size={14} color="#059669" />
          <span>Direct Mill Traceability 3.1 Certs Included</span>
        </div>
      </div>
    </div>
  );
}
