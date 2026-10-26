'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import { CatalogProductFamily } from '@/lib/catalog-types';
import { INITIAL_FAMILIES } from '@/lib/catalog-data';
import {
  ChevronRight,
  ArrowRight,
  Award,
  Wrench,
  CheckCircle2,
  ArrowLeft,
  TableProperties
} from 'lucide-react';

export default function SubcategoryDetailPage() {
  const params = useParams();
  const categorySlug = params?.category as string;
  const subcategorySlug = params?.subcategory as string;

  const [families, setFamilies] = useState<CatalogProductFamily[]>(INITIAL_FAMILIES);

  useEffect(() => {
    fetch(`/api/catalog/families?category=${categorySlug}&subcategory=${subcategorySlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setFamilies(data.data);
        } else {
          const filtered = INITIAL_FAMILIES.filter(
            (f) => f.subcategorySlug === subcategorySlug || f.categorySlug === categorySlug
          );
          setFamilies(filtered.length > 0 ? filtered : INITIAL_FAMILIES);
        }
      })
      .catch(() => {
        setFamilies(INITIAL_FAMILIES);
      });
  }, [categorySlug, subcategorySlug]);

  const subcategoryTitle = subcategorySlug
    ? subcategorySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Subcategory';
  const categoryTitle = categorySlug
    ? categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Category';

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#14181E] flex flex-col font-sans">
      <MainHeader />

      {/* Hero Subcategory Banner - Dark Charcoal & CBH Red */}
      <section className="relative bg-[#121518] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#242B35]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href={`/products/${categorySlug}`} className="hover:text-white transition-colors">
              {categoryTitle}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#FF6B00] font-semibold">{subcategoryTitle}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,107,0,0.15)] text-[#FF6B00] text-xs font-semibold tracking-wide uppercase mb-3 border border-[#FF6B00]/40">
                <Wrench className="w-3.5 h-3.5 text-[#FF6B00]" />
                Series Overview
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                {subcategoryTitle}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Engineered for direct push-through installation in concrete. Select a product family below to configure dimensions, review ETA approvals, and download technical data sheets.
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                href={`/products/${categorySlug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20"
              >
                <ArrowLeft className="w-4 h-4" /> Back to {categoryTitle}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Product Families List */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#D8DFE7]">
          <div>
            <h2 className="text-2xl font-bold text-[#14181E] tracking-tight">
              Product Families in {subcategoryTitle}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select an anchor family to view the full technical matrix table, sizes, and certificates
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-white border border-[#D8DFE7] px-3 py-1.5 rounded-lg">
            {families.length} Families Available
          </div>
        </div>

        {/* Product Family Cards */}
        <div className="space-y-8">
          {families.map((family) => (
            <div
              key={family.id}
              className="bg-white rounded-2xl border border-[#D8DFE7] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0052CC] transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Family Visual Preview */}
                <div className="lg:col-span-4 relative min-h-[240px] bg-[#121518] overflow-hidden">
                  <Image
                    src={family.heroImageUrl}
                    alt={family.name}
                    fill
                    unoptimized
                    className="object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121518] via-[#121518]/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8533] bg-[#121518]/90 px-2 py-0.5 rounded border border-[#FF6B00]/30">
                      Technical Family
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{family.name}</h3>
                  </div>
                </div>

                {/* Family Highlights & Approvals */}
                <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {family.approvals?.map((app) => (
                        <span
                          key={app.id}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[rgba(0,82,204,0.08)] text-[#0052CC] text-[11px] font-bold border border-[#0052CC]/20"
                        >
                          <Award className="w-3 h-3 text-[#0052CC]" />
                          {app.badgeText} ({app.code})
                        </span>
                      ))}
                    </div>

                    <h4 className="text-sm font-semibold text-[#0052CC] mb-2">
                      {family.headline}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {family.claim}
                    </p>

                    {/* Bullet features */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                      {family.topFeatures?.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-[#EDF1F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {family.variants?.length || 10} Dimensional Variants
                      </span>
                      <span>•</span>
                      <span>M10 to M16 Diameters</span>
                    </div>

                    <Link
                      href={`/products/${categorySlug}/${subcategorySlug}/${family.slug}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg"
                    >
                      <TableProperties className="w-4 h-4" /> View Technical Matrix & Order
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
