'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Images,
  ChevronRight,
  Maximize2,
  X,
  ChevronLeft,
  MapPin,
  CheckCircle2,
  Download,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem, GalleryItem } from '@/lib/types';
import INITIAL_GALLERY_ITEMS from '@/data/gallery-data.json';

const CATEGORY_TABS = [
  { key: 'all', label: 'All Media' },
  { key: 'manufacturing', label: 'Forging & Plant' },
  { key: 'quality', label: 'Testing & Lab' },
  { key: 'logistics', label: 'Warehouse & Dispatch' },
  { key: 'applications', label: 'Project Sites' },
  { key: 'exhibitions', label: 'Exhibitions & Expos' },
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS as GalleryItem[]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  // Fetch dynamic items from API
  useEffect(() => {
    let isMounted = true;
    async function fetchGallery() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/gallery');
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setItems(json.data);
        }
      } catch (err) {
        console.warn('Could not fetch gallery items from API, using fallback data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter items by active tab
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  // Dynamic category tabs with counts
  const categories = useMemo(() => {
    return CATEGORY_TABS.map((tab) => {
      const count =
        tab.key === 'all'
          ? items.length
          : items.filter((item) => item.category === tab.key).length;
      return { ...tab, count };
    });
  }, [items]);

  // Lightbox touch swipe & navigation
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedItem || filteredItems.length === 0) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedItem(filteredItems[prevIndex]);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedItem || filteredItems.length === 0) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedItem(filteredItems[nextIndex]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [selectedItem, filteredItems]);

  const currentItemIndex = useMemo(() => {
    if (!selectedItem) return 0;
    return filteredItems.findIndex((i) => i.id === selectedItem.id);
  }, [selectedItem, filteredItems]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans">
      <MainHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartItems.length} />

      {/* ============================================================== */}
      {/* HERO BANNER SECTION (Clean, Minimalist, No Extra Text Walls)  */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0052CC] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-300 mb-3 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <span className="text-[#FF6B00] font-bold">Facility Gallery</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 border border-white/15">
              <Images size={13} className="text-[#FF6B00]" />
              <span>Infrastructure &amp; Manufacturing</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Facility &amp; Infrastructure Gallery
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed max-w-2xl">
              High-resolution photo documentation of our cold forging lines, NABL testing laboratories, automated logistics hubs, and global industrial expos.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FILTER TABS BAR                                                */}
      {/* ============================================================== */}
      <section className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-xs px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-[#0052CC] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-400 hidden md:block shrink-0">
            {filteredItems.length} Photographs
          </span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PHOTO GRID CANVAS                                              */}
      {/* ============================================================== */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0052CC]" />
            <p className="text-xs font-bold">Loading media gallery...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8">
            <Images className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No media found in this category</h3>
            <p className="text-xs text-slate-500 mt-1">Please select another category tab above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
              >
                {/* Image Preview Container */}
                <div className="relative h-56 sm:h-60 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-md bg-[#0F172A]/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                      {item.categoryLabel || item.category}
                    </span>
                  </div>

                  {/* Hover Maximize Icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white text-[#0052CC] flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                      <Maximize2 size={18} />
                    </div>
                  </div>

                  {item.date && (
                    <div className="absolute bottom-2.5 right-3 text-[10px] text-white/90 font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      {item.date}
                    </div>
                  )}
                </div>

                {/* Card Meta Content (Clean, streamlined) */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {item.location && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1">
                        <MapPin size={12} className="text-[#FF6B00] shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                    <h3 className="font-extrabold text-[#0F172A] text-sm leading-snug group-hover:text-[#0052CC] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Specs Pill */}
                  {item.specs && item.specs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-[#0052CC] font-bold flex items-center gap-1 truncate max-w-[200px]">
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{item.specs[0]}</span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#0052CC] transition-colors flex items-center gap-0.5 shrink-0">
                        View <ArrowRight size={12} />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* INTERACTIVE LIGHTBOX MODAL                                     */}
      {/* ============================================================== */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overscroll-contain animate-fade-in"
          onClick={() => setSelectedItem(null)}
          style={{ overscrollBehavior: 'contain' }}
        >
          <div
            className="bg-[#0F172A] text-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-4xl max-h-[94dvh] sm:max-h-[90vh] overflow-hidden shadow-2xl border border-white/10 flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Mobile Drag Indicator */}
            <div className="sm:hidden w-12 h-1 bg-white/20 rounded-full mx-auto my-2 shrink-0" />

            {/* Modal Header */}
            <div className="px-4 py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between border-b border-white/10 bg-black/40 shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="px-2 sm:px-2.5 py-0.5 rounded bg-[#0052CC] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shrink-0">
                  {selectedItem.categoryLabel || selectedItem.category}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-300 font-mono shrink-0">
                  {currentItemIndex + 1} / {filteredItems.length}
                </span>
                {selectedItem.date && (
                  <span className="text-xs text-slate-400 font-mono hidden md:inline truncate">
                    • {selectedItem.date}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedItem.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  title="Download High-Res Media"
                >
                  <Download size={15} />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close (Esc)"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main Image Frame with Touch Swipe & Prev/Next Controls */}
            <div
              className="relative w-full h-[36vh] sm:h-auto sm:flex-1 min-h-[200px] max-h-[50vh] sm:min-h-[380px] md:min-h-[460px] bg-black flex items-center justify-center overflow-hidden shrink-0 sm:shrink select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={selectedItem.image}
                alt={selectedItem.title}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-contain pointer-events-none"
                priority
              />

              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-[#0052CC] active:scale-95 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg z-10 cursor-pointer"
                title="Previous photo (Left Arrow)"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-[#0052CC] active:scale-95 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg z-10 cursor-pointer"
                title="Next photo (Right Arrow)"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Footer & Technical Spec Sheet */}
            <div className="p-4 sm:p-5 md:p-6 bg-[#141C2E] border-t border-white/10 overflow-y-auto min-h-0 flex-1 overscroll-contain">
              {selectedItem.location && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#FF6B00] font-bold mb-1">
                  <MapPin size={13} className="shrink-0" />
                  <span className="truncate">{selectedItem.location}</span>
                </div>
              )}
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-white leading-snug">
                {selectedItem.title}
              </h3>
              {selectedItem.description && (
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                  {selectedItem.description}
                </p>
              )}

              {selectedItem.specs && selectedItem.specs.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Technical Specifications:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.specs.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-semibold text-sky-200"
                      >
                        <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                        <span>{spec}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={() => {}}
        onRemoveItem={() => {}}
      />
    </div>
  );
}
