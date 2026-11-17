'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { CatalogCategory } from '@/lib/catalog-types';
import { INITIAL_CATEGORIES } from '@/lib/catalog-data';

export default function SimpleVisualCategories() {
  const [categories, setCategories] = useState<CatalogCategory[]>(
    INITIAL_CATEGORIES.filter((c) => c.featured !== false).slice(0, 8)
  );

  // Fetch dynamic categories from the API / Database
  useEffect(() => {
    let isMounted = true;
    fetch('/api/catalog/categories')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Priority to featured categories, sorted by sortOrder
          const featured = data.data.filter((c: CatalogCategory) => c.featured !== false);
          const sorted = (featured.length > 0 ? featured : data.data)
            .sort((a: CatalogCategory, b: CatalogCategory) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .slice(0, 8);
          setCategories(sorted);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch dynamic categories, using default cache:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-12 bg-white border-b border-slate-200" id="visual-categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0052CC] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>WHAT WE OFFER // हम क्या बेचते हैं</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Choose Fasteners by Type <span className="text-[#0052CC]">(तस्वीर देखकर चुनें)</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
              Factory wholesale rates directly from manufacturer. Click any category below to view all sizes, weights, and instant prices per piece or kilogram.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 self-start md:self-auto text-sm font-bold text-[#0052CC] hover:text-[#003E99] transition-colors"
          >
            <span>View Full 2,00,000+ SKU Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* 8-Card Visual Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {categories.map((cat) => {
            const cardLink = cat.link || `/products?category=${encodeURIComponent(cat.name)}`;
            const badgeTag = cat.tag || 'READY STOCK';
            const badgeColor = cat.tagColor || '#0052CC';
            const cardImg = cat.imageUrl || '/assets/bolt_zinc.jpg';

            return (
              <Link
                key={cat.id || cat.slug}
                href={cardLink}
                className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#0052CC] rounded-2xl p-3 sm:p-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Tag */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded text-white tracking-wide truncate max-w-[120px]"
                    style={{ backgroundColor: badgeColor }}
                  >
                    {badgeTag}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#0052CC] transition-colors flex items-center gap-0.5">
                    Explore <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>

                {/* Photo Frame */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 mb-3 border border-slate-200/80">
                  <Image
                    src={cardImg}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Titles & Description */}
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#0052CC] transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  {cat.nameHi && (
                    <span className="text-xs font-bold text-amber-700 block mb-1">
                      {cat.nameHi}
                    </span>
                  )}
                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description || cat.tagline}
                  </p>
                </div>

                {/* Bottom Quick Indicator */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Ready Stock</span>
                  </span>
                  <span className="font-mono text-slate-500 font-bold">Kg / Pcs</span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
