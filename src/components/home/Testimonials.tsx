'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Star,
  CheckCircle2,
  Building,
  MapPin,
  Quote,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  MessageCircle,
  FileCheck2,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Testimonial } from '@/lib/types';
import { INITIAL_TESTIMONIALS } from '@/lib/testimonials-data';

const CATEGORY_CHIPS = [
  'All Reviews',
  'Heavy Engineering',
  'Automotive',
  'Infrastructure',
  'Solar & PEB',
  'Stainless Steel',
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [activeCategory, setActiveCategory] = useState('All Reviews');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCards, setVisibleCards] = useState(3);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Responsive visible cards count: 1 on mobile, 2 on tablet, 3 on desktop
  useEffect(() => {
    const updateVisible = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  // Fetch dynamic testimonials from database / API
  useEffect(() => {
    let isMounted = true;
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setTestimonials(data.data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch dynamic testimonials, using default cache:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered list
  const filteredTestimonials = useMemo(() => {
    if (activeCategory === 'All Reviews') {
      return testimonials;
    }
    return testimonials.filter(
      (t) => (t.category || '').toLowerCase() === activeCategory.toLowerCase()
    );
  }, [testimonials, activeCategory]);

  const maxIndex = Math.max(0, filteredTestimonials.length - visibleCards);

  // Keep currentIndex in bounds when list or screen size changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(0);
    }
  }, [maxIndex, currentIndex]);

  // Automatic one-by-one card swipe timer (every 3.5 seconds)
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Touch Swipe for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-50 via-white to-slate-50/70 border-t border-slate-200/80 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-7 sm:space-y-8">
        {/* Top Header & Trust Score Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/90">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Award size={14} className="text-blue-600" />
              <span>Verified Industrial Buyer Feedback</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Pan-India Dispatches</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Trusted by 2,400+ Industrial OEMs & EPC Contractors
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Read authentic feedback from project directors, chief works engineers, and central procurement leads who rely on CBH Fasteners for certified proof-load performance.
            </p>
          </div>

          {/* Overall Rating Score Card */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs shrink-0">
            <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-amber-600">
              <span className="text-xl font-black leading-none">4.9</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">/ 5.0</span>
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-900">
                100% Genuine Verified Purchases
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>NABL Test Lab Certified MTC 3.1</span>
              </p>
            </div>
          </div>
        </div>

        {/* Filter Chips Bar + Carousel Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <span className="text-xs font-extrabold uppercase text-slate-400 mr-2 shrink-0">
              Industry:
            </span>
            {CATEGORY_CHIPS.map((chip) => {
              const isActive = activeCategory === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setActiveCategory(chip);
                    setCurrentIndex(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            {/* Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-600 shadow-xs transition-all cursor-pointer active:scale-95"
                title="Previous Testimonial"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-600 shadow-xs transition-all cursor-pointer active:scale-95"
                title="Next Testimonial"
                aria-label="Next Testimonial"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Viewport: ONLY 3 CARDS IN VIEW, NO HORIZONTAL SCROLLBAR, SWIPES ONE BY ONE */}
        <div
          className="relative overflow-hidden -mx-2.5 select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
            }}
          >
            {filteredTestimonials.map((item) => (
              <div
                key={item.id}
                className="w-full sm:w-1/2 lg:w-1/3 min-w-full sm:min-w-[50%] lg:min-w-[33.333333%] flex-shrink-0 px-2.5 py-1"
              >
                <div className="h-full bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:border-blue-300 relative overflow-hidden">
                  {/* Subtle top decoration badge */}
                  {item.featured && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-bl-lg shadow-2xs flex items-center gap-1">
                      <Sparkles size={10} />
                      <span>Featured Partner</span>
                    </div>
                  )}

                  {/* Reviewer Header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Profile Avatar / Photo with Initials Fallback */}
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200/90 shadow-xs ring-2 ring-blue-50 bg-slate-100 flex items-center justify-center">
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.home-avatar-initials');
                                if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div
                            className={`home-avatar-initials w-full h-full bg-gradient-to-br from-slate-900 to-blue-900 text-white font-black text-base flex items-center justify-center ${
                              item.avatar ? 'hidden' : ''
                            }`}
                          >
                            {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs font-medium text-slate-600 truncate">
                            {item.role || 'Executive'}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate mt-0.5">
                            <Building size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{item.company}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rating Stars & Location */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            fill={i < (item.rating || 5) ? 'currentColor' : 'none'}
                            className={i < (item.rating || 5) ? 'text-amber-500' : 'text-slate-200'}
                          />
                        ))}
                        <span className="text-[11px] font-black text-amber-700 ml-1">
                          {item.rating || 5}.0
                        </span>
                      </div>

                      {item.location && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <MapPin size={11} className="text-slate-400" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>

                    {/* Feedback Quote */}
                    <div className="relative pt-1">
                      <Quote size={20} className="text-blue-100 absolute -top-1 -left-1 -z-0 select-none opacity-60" />
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic relative z-10 line-clamp-4">
                        "{item.feedback}"
                      </p>
                    </div>
                  </div>

                  {/* Verified Purchase Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                    {item.verifiedPurchase && (
                      <div className="text-[11px] text-slate-600 leading-snug">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Procured Spec:</span>
                        <strong className="text-slate-800 font-bold truncate block">{item.verifiedPurchase}</strong>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 size={12} />
                        <span>{item.badge || 'Verified OEM Buyer'}</span>
                      </span>

                      {item.category && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Indicator Dots */}
        {maxIndex > 0 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'w-7 bg-blue-600'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Industrial Quality Assurance Strip */}
        {/* <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="flex items-start gap-3 pt-3 md:pt-0 md:px-3">
              <FileCheck2 className="w-8 h-8 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">MTC 3.1 Certified</h4>
                <p className="text-[11px] text-slate-400 mt-1">Full metallurgical chemical & mechanical proof load documentation with every shipment.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 md:pt-0 md:px-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Zero Slip Guarantee</h4>
                <p className="text-[11px] text-slate-400 mt-1">Optical thread inspection ensuring zero pitch drift and seamless robotic nut running.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 md:pt-0 md:px-3">
              <Clock className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">24-48h Fast Dispatch</h4>
                <p className="text-[11px] text-slate-400 mt-1">Ready stock of 2,00,000+ SKUs maintained across regional logistics hubs for express dispatch.</p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2 pt-3 md:pt-0 md:px-3">
              <a
                href="https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20want%20to%20procure%20industrial%20fasteners%20for%20my%20factory.%20Please%20share%20bulk%20quotes."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition-colors no-underline"
              >
                <MessageCircle size={15} />
                <span>Talk to Fastener Specialist</span>
              </a>
              <Link
                href="/bulk-order"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors no-underline"
              >
                <span>Submit Procurement RFQ</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
