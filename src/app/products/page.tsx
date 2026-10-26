'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainHeader from '@/components/header/MainHeader';
import { CatalogCategory } from '@/lib/catalog-types';
import { INITIAL_CATEGORIES } from '@/lib/catalog-data';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  FileCheck2,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Wrench,
  Building2
} from 'lucide-react';

export default function ProductsRootPage() {
  const [categories, setCategories] = useState<CatalogCategory[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/catalog/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.tagline.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#14181E] flex flex-col font-sans">
      <MainHeader />

      {/* Hero Header - Deep Technical Charcoal with CBH Red Accents */}
      <section className="relative bg-[#121518] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#242B35]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#FF6B00] font-semibold">Products</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,107,0,0.15)] text-[#FF6B00] text-xs font-semibold tracking-wide uppercase mb-4 border border-[#FF6B00]/40">
                <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                Fischer & Hilti Grade Certified Anchoring Systems
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                Industrial Fasteners & Fixings Catalog
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
                Engineered for maximum tensile and shear performance in cracked concrete, structural steel, and masonry. Explore ETA-assessed anchoring technology with full technical matrix specs.
              </p>

              {/* Fast Finder Search Bar */}
              <div className="mt-8 relative max-w-2xl">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by category, standard, anchor type (e.g., Steel fixings, Bolt anchor, FAZ II)..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:bg-white/20 transition-all shadow-xl"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 text-xs text-slate-300 hover:text-white bg-white/10 px-2 py-1 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Trust Badges Counter */}
            <div className="lg:col-span-4 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(0,82,204,0.2)] flex items-center justify-center text-[#2684FF] border border-[#0052CC]/40">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">ETA Option 1</div>
                  <div className="text-xs text-slate-300">Cracked Concrete Certified</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Seismic C1 & C2</div>
                  <div className="text-xs text-slate-300">Earthquake-Resistant Testing</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-400/30">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">120 Years</div>
                  <div className="text-xs text-slate-300">Extended Service Life ETA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#D8DFE7]">
          <div>
            <h2 className="text-2xl font-bold text-[#14181E] tracking-tight">Product Categories</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a category to view specialized anchoring lines and technical dimensions
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-white border border-[#D8DFE7] px-3 py-1.5 rounded-lg">
            Showing {filteredCategories.length} Categories
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#D8DFE7] p-8">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700">No product categories found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Try adjusting your search terms or view our standard fastener catalog.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-[#D8DFE7] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0052CC] transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Category Thumbnail Image */}
                <div className="relative h-52 w-full bg-[#121518] overflow-hidden">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121518] via-[#121518]/30 to-transparent" />
                  
                  {category.featured && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF6B00] text-white text-[11px] font-bold tracking-wide uppercase shadow-lg">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FF8533]">
                      Category Level 1
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#2684FF] transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#0052CC] mb-2 leading-relaxed">
                      {category.tagline}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Footer link & count */}
                  <div className="mt-6 pt-4 border-t border-[#EDF1F5] flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#0052CC]" />
                      {category.subcategoriesCount || 4} Subcategories
                    </span>
                    <span className="text-[#0052CC] group-hover:text-[#0747A6] flex items-center gap-1 group-hover:translate-x-1 transition-all">
                      Explore Line <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Application Engineering Highlights */}
        <section className="mt-16 bg-white rounded-2xl border border-[#D8DFE7] p-8 shadow-sm">
          <div className="max-w-3xl mb-8">
            <div className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest mb-1">
              Field Of Application
            </div>
            <h3 className="text-xl font-bold text-[#14181E]">
              Anchoring Solutions Tailored to Structural Requirements
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Every fastener in our technical catalog comes backed by certified European Technical Assessments (ETA) and strict factory production controls (FPC).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[#F4F6F9] border border-[#D8DFE7] flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-[rgba(0,82,204,0.1)] text-[#0052CC] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#14181E]">Cracked Concrete</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Guaranteed expansion clip grip even under dynamic crack opening up to 0.8 mm.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F4F6F9] border border-[#D8DFE7] flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#14181E]">Seismic Zones C1 & C2</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Evaluated under cyclically reversing shear and tension loads for earthquake safety.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F4F6F9] border border-[#D8DFE7] flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#14181E]">Fire Resistance R120</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Certified load bearing during 120 minutes of exposure to direct furnace flame.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
