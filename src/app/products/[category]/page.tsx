'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import { CatalogCategory, CatalogSubcategory } from '@/lib/catalog-types';
import { INITIAL_CATEGORIES, INITIAL_SUBCATEGORIES } from '@/lib/catalog-data';
import {
  ChevronRight,
  ArrowRight,
  Layers,
  Wrench,
  ArrowLeft
} from 'lucide-react';

export default function CategoryDetailPage() {
  const params = useParams();
  const categorySlug = params?.category as string;

  const [category, setCategory] = useState<CatalogCategory | null>(null);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);

  useEffect(() => {
    fetch('/api/catalog/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const match = data.data.find((c: CatalogCategory) => c.slug === categorySlug);
          if (match) setCategory(match);
          else {
            const fallback = INITIAL_CATEGORIES.find((c) => c.slug === categorySlug) || INITIAL_CATEGORIES[0];
            setCategory(fallback);
          }
        }
      })
      .catch(() => {
        const fallback = INITIAL_CATEGORIES.find((c) => c.slug === categorySlug) || INITIAL_CATEGORIES[0];
        setCategory(fallback);
      });

    fetch(`/api/catalog/subcategories?category=${categorySlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setSubcategories(data.data);
        } else {
          const fallback = INITIAL_SUBCATEGORIES.filter((s) => s.categorySlug === categorySlug);
          setSubcategories(fallback.length > 0 ? fallback : INITIAL_SUBCATEGORIES);
        }
      })
      .catch(() => {
        setSubcategories(INITIAL_SUBCATEGORIES);
      });
  }, [categorySlug]);

  const activeCategory = category || INITIAL_CATEGORIES.find((c) => c.slug === categorySlug) || INITIAL_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#14181E] flex flex-col font-sans">
      <MainHeader />

      {/* Hero Category Banner - Dark Charcoal & CBH Red */}
      <section className="relative bg-[#121518] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#242B35]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#FF6B00] font-semibold">{activeCategory.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,107,0,0.15)] text-[#FF6B00] text-xs font-semibold tracking-wide uppercase mb-3 border border-[#FF6B00]/40">
                <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
                Category Overview
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
                {activeCategory.name}
              </h1>
              <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
                {activeCategory.description}
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20"
              >
                <ArrowLeft className="w-4 h-4" /> Back to All Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategory Grid Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#D8DFE7]">
          <div>
            <h2 className="text-2xl font-bold text-[#14181E] tracking-tight">
              Subcategories in {activeCategory.name}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select an anchor technology to view product families and engineering matrix charts
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-white border border-[#D8DFE7] px-3 py-1.5 rounded-lg">
            {subcategories.length} Subcategories
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/products/${activeCategory.slug}/${sub.slug}`}
              className="group flex flex-col bg-white rounded-2xl border border-[#D8DFE7] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0052CC] transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Subcategory Thumbnail */}
              <div className="relative h-48 w-full bg-[#121518] overflow-hidden">
                <Image
                  src={sub.imageUrl}
                  alt={sub.name}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121518] via-[#121518]/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8533]">
                    Subcategory
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#2684FF] transition-colors">
                    {sub.name}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#0052CC] mb-2 leading-relaxed">
                    {sub.tagline}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EDF1F5] flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#0052CC]" />
                    {sub.familiesCount || 2} Product Families
                  </span>
                  <span className="text-[#0052CC] group-hover:text-[#0747A6] flex items-center gap-1 group-hover:translate-x-1 transition-all">
                    View Families <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
