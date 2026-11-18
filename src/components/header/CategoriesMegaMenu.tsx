'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Hexagon,
  Wrench,
  ShieldCheck,
  Layers,
  Anchor,
  Flame,
  CircleDot,
  Disc,
  Home as HomeIcon,
  Lock,
  Package,
} from 'lucide-react';
import { NAVIGATION_CATEGORIES } from '@/data/navigation-categories';

function renderCategoryIcon(iconName: string, className = 'w-4 h-4') {
  switch (iconName) {
    case 'Hexagon':
      return <Hexagon className={className} />;
    case 'Bolt':
      return <Package className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Anchor':
      return <Anchor className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'CircleDot':
      return <CircleDot className={className} />;
    case 'Disc':
      return <Disc className={className} />;
    case 'Home':
      return <HomeIcon className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    default:
      return <Hexagon className={className} />;
  }
}

export default function ProductsNavMegaMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    NAVIGATION_CATEGORIES[0].id
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isProductsActive =
    pathname === '/products' ||
    pathname.startsWith('/products/') ||
    isOpen;

  const activeCategory =
    NAVIGATION_CATEGORIES.find((c) => c.id === activeCategoryId) ||
    NAVIGATION_CATEGORIES[0];

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Products Navigation Button (Toggles on click/tap; opens on hover for mouse) */}
      <button
        type="button"
        className={`header-nav-link flex items-center gap-1 select-none cursor-pointer bg-transparent border-none ${
          isProductsActive ? 'active' : ''
        }`}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>Products</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 text-slate-400 group-hover:text-blue-600 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Floating Clean Mega Menu Dropdown */}
      {isOpen && (
        <div
          role="region"
          aria-label="Products Categories and Subcategories"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed left-1/2 -translate-x-1/2 top-[68px] w-[96vw] max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-[1000] animate-in fade-in slide-in-from-top-1 duration-150 flex flex-col"
          style={{ maxHeight: 'min(620px, calc(100vh - 84px))' }}
        >
          {/* Invisible hover bridge ensuring uninterrupted mouse traversal */}
          <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent pointer-events-auto" />

          {/* Two-Column Clean Layout - Fully displays all 12 categories */}
          <div
            className="grid grid-cols-12 overflow-hidden flex-1 min-h-0"
            style={{ maxHeight: 'min(620px, calc(100vh - 84px))' }}
          >
            {/* Left Column: All 12 Categories List */}
            <div className="col-span-12 md:col-span-5 lg:col-span-4 bg-slate-50/90 border-r border-slate-200/90 overflow-y-auto p-1.5 space-y-0.5 h-full max-h-[min(620px,calc(100vh-84px))] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              {NAVIGATION_CATEGORIES.map((cat) => {
                const isSelected = cat.id === activeCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    onMouseEnter={() => setActiveCategoryId(cat.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg transition-all flex items-center justify-between gap-2 cursor-pointer select-none border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {renderCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
                      </div>
                      <span className="text-xs font-bold truncate leading-tight">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {cat.badge && (
                        <span
                          className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isSelected
                              ? 'bg-white/25 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {cat.badge}
                        </span>
                      )}
                      <ChevronRight
                        size={12}
                        className={isSelected ? 'text-white' : 'text-slate-400'}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Subcategories for Active Category */}
            <div className="col-span-12 md:col-span-7 lg:col-span-8 bg-white p-4 sm:p-5 overflow-y-auto flex flex-col justify-between h-full max-h-[min(620px,calc(100vh-84px))] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div>
                {/* Active Category Header Bar */}
                <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                      {renderCategoryIcon(activeCategory.iconName, 'w-4 h-4')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 leading-tight truncate">
                        {activeCategory.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {activeCategory.tagline}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={activeCategory.href}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors shrink-0 border border-blue-200"
                  >
                    <span>View All</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                {/* Subcategories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCategory.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-500 bg-white hover:bg-blue-50/50 hover:shadow-xs transition-all text-left"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-blue-700 leading-snug line-clamp-2">
                          {sub.name}
                        </span>
                        {sub.specBadge && (
                          <span className="inline-block text-[10px] font-bold text-blue-600 font-mono mt-0.5">
                            {sub.specBadge}
                          </span>
                        )}
                      </div>
                      <ArrowRight
                        size={13}
                        className="text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 shrink-0"
                      />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bottom Action Strip */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-slate-500 hover:text-blue-700 transition-colors"
                >
                  Browse Full 54,000+ SKU Catalog →
                </Link>

                <Link
                  href={activeCategory.href}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>Explore {activeCategory.shortName}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
