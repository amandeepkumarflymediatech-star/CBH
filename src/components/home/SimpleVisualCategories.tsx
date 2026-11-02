'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface CategoryCard {
  id: string;
  nameEn: string;
  nameHi: string;
  desc: string;
  tag: string;
  tagColor: string;
  image: string;
  link: string;
}

const VISUAL_CATEGORIES: CategoryCard[] = [
  {
    id: 'hex-bolts',
    nameEn: 'Hex Bolts & Screws',
    nameHi: 'हेक्स बोल्ट',
    desc: 'Full & Half thread bolts in Grade 8.8, 10.9 & SS. Ideal for machinery & PEB structures.',
    tag: 'MOST POPULAR',
    tagColor: '#0052CC',
    image: '/assets/bolt_zinc.jpg',
    link: '/products?category=Hex%20Screws',
  },
  {
    id: 'hex-nuts',
    nameEn: 'Hex Nuts & Lock Nuts',
    nameHi: 'हेक्स नट',
    desc: 'Heavy hex nuts, flange nuts & nyloc nuts (DIN 934) with precision internal threads.',
    tag: 'READY STOCK',
    tagColor: '#059669',
    image: '/assets/bolt_din933_zinc_1792746574604.jpg',
    link: '/products?category=HEX%20NUTS',
  },
  {
    id: 'washers',
    nameEn: 'Industrial Washers',
    nameHi: 'प्लेन व स्प्रिंग वाशर',
    desc: 'Flat plain washers, spring split washers & conical disc washers to prevent bolt loosening.',
    tag: 'ANTI-VIBRATION',
    tagColor: '#4F46E5',
    image: '/assets/quality_optical_sorting.jpg',
    link: '/products?category=WASHERS',
  },
  {
    id: 'socket-screws',
    nameEn: 'Socket Allen Screws',
    nameHi: 'एलन बोल्ट (सॉकेट)',
    desc: 'High-tensile Grade 12.9 & stainless Allen cap screws (DIN 912) for precision tooling.',
    tag: 'GRADE 12.9',
    tagColor: '#D97706',
    image: '/assets/images/grub-screw-real.png',
    link: '/products?category=SOCKET%20HEAD%20CAP%20SCREWS',
  },
  {
    id: 'threaded-rods',
    nameEn: 'Threaded Rods & Studs',
    nameHi: 'स्टड व थ्रेडेड रॉड',
    desc: 'Continuous 1M, 2M, 3M threaded rods and ASTM A193 B7 stud bolts for high-pressure flanges.',
    tag: 'HEAVY TENSILE',
    tagColor: '#0284C7',
    image: '/assets/hero.jpg',
    link: '/products?category=STUD%20BOLTS%20%26%20RODS',
  },
  {
    id: 'anchor-bolts',
    nameEn: 'Anchor & Foundation Bolts',
    nameHi: 'फाउंडेशन व एंकर बोल्ट',
    desc: 'Heavy concrete expansion fasteners & L/J foundation bolts for steel buildings & machines.',
    tag: 'CONSTRUCTION',
    tagColor: '#7C3AED',
    image: '/assets/anchor_bolt.jpg',
    link: '/products?category=ANCHOR%20BOLTS',
  },
  {
    id: 'surplus-depot',
    nameEn: 'Surplus Clearance Depot',
    nameHi: 'सस्ता सरप्लस स्टॉक',
    desc: 'Verified factory over-runs and project surplus lots available at 35% to 60% below standard rates.',
    tag: 'SAVE UP TO 60%',
    tagColor: '#FF6B00',
    image: '/assets/bolt_zinc.jpg',
    link: '/surplus',
  },
  {
    id: 'custom-fasteners',
    nameEn: 'Custom & Special Sizing',
    nameHi: 'मनचाहा साइज बनवाएं',
    desc: 'Have a special drawing, non-standard diameter, or specific pitch? Manufactured directly to order.',
    tag: 'MADE TO ORDER',
    tagColor: '#0B132B',
    image: '/assets/quality_lab_tensile.jpg',
    link: '/bulk-order',
  },
];

export default function SimpleVisualCategories() {
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
          {VISUAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#0052CC] rounded-2xl p-3 sm:p-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Tag */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span
                  className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded text-white tracking-wide"
                  style={{ backgroundColor: cat.tagColor }}
                >
                  {cat.tag}
                </span>
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#0052CC] transition-colors flex items-center gap-0.5">
                  Explore <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

              {/* Photo Frame */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 mb-3 border border-slate-200/80">
                <Image
                  src={cat.image}
                  alt={cat.nameEn}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Titles & Description */}
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#0052CC] transition-colors leading-snug">
                  {cat.nameEn}
                </h3>
                <span className="text-xs font-bold text-amber-700 block mb-1">
                  {cat.nameHi}
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.desc}
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
          ))}
        </div>

      </div>
    </section>
  );
}

