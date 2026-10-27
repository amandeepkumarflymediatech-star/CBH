'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Images,
  ChevronRight,
  Filter,
  Maximize2,
  X,
  ChevronLeft,
  ShieldCheck,
  Factory,
  Truck,
  Award,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  Download
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

interface GalleryItem {
  id: string;
  title: string;
  category: 'manufacturing' | 'quality' | 'logistics' | 'applications' | 'exhibitions';
  categoryLabel: string;
  image: string;
  location: string;
  date: string;
  description: string;
  specs?: string[];
}

const GALLERY_DATA: GalleryItem[] = [
  {
    id: 'gal-quality-1',
    title: 'Universal Tensile & Proof Load Testing Machine',
    category: 'quality',
    categoryLabel: 'Quality & Testing Lab',
    image: '/assets/quality_lab_tensile.jpg',
    location: 'Central Metallurgy Lab, Ludhiana Works',
    date: 'Certified Q4 2025',
    description: 'Computer-controlled 1000 kN Universal Tensile Testing machine executing ISO 898-1 proof load and ultimate tensile rupture verification on Grade 8.8, 10.9, and 12.9 metric fasteners.',
    specs: ['Calibrated under NABL standards', 'Full stress-strain digital curve logging', 'Wedge tensile testing for finished bolts']
  },
  {
    id: 'gal-quality-2',
    title: 'High-Speed 360° Optical Sorting & Dimension Inspection',
    category: 'quality',
    categoryLabel: 'Quality & Testing Lab',
    image: '/assets/quality_optical_sorting.jpg',
    location: 'Automated Inspection Bay #3',
    date: 'Daily In-Line QC',
    description: 'High-speed glass disc optical sorting lines verifying thread pitch, shank straightness, head concentricity, and total length at up to 600 pieces per minute with 0.01mm tolerance.',
    specs: ['Six-camera multi-angle telecentric lens system', 'Zero-defect automotive OEM PPM sorting', 'Automated laser dimensional gauging']
  },
  {
    id: 'gal-quality-3',
    title: 'ASTM B117 Neutral Salt Spray Corrosion Chamber',
    category: 'quality',
    categoryLabel: 'Quality & Testing Lab',
    image: '/assets/quality_salt_spray.jpg',
    location: 'Surface Protection Testing Cell',
    date: 'Batch Test Chamber',
    description: 'Continuous ASTM B117 salt fog exposure chamber evaluating red rust resistance on Hot Dip Galvanized (HDG), Black Passivated (BP), and Clear Zinc electroplated fasteners.',
    specs: ['Up to 1000 hours without red rust', 'Cyclic humidity and temperature programming', 'Conforms to ISO 9227 & ASTM B117']
  },
  {
    id: 'gal-quality-4',
    title: 'EN 10204 3.1 Chemical Spectroscopy & MTC Verification',
    category: 'quality',
    categoryLabel: 'Quality & Testing Lab',
    image: '/assets/quality_cert_inspection.jpg',
    location: 'Spectrometry Laboratory',
    date: 'Heat-by-Heat Verification',
    description: 'Optical Emission Spectrometry (OES) analyzing raw carbon, boron, chromium, and molybdenum alloy percentages for complete heat code traceability on every production lot.',
    specs: ['100% heat traceability back to primary steel mills', 'Complete Mill Test Certificate (MTC 3.1) issuance', 'Hardness testing: Rockwell HRC & Vickers HV']
  },
  {
    id: 'gal-logistics-1',
    title: 'Central High-Density Automated Storage & Logistics Hub',
    category: 'logistics',
    categoryLabel: 'Warehouse & Logistics',
    image: '/assets/global_logistics_hub.jpg',
    location: 'National Central Depot, GT Road Ludhiana',
    date: '2,00,000+ SKUs In Stock',
    description: 'High-bay racking depot housing 2 Lacs+ Fastener SKUs in designated barcoded bin locations for rapid same-day dispatches via TCI Express, Safexpress, and V-Trans fleet.',
    specs: ['Over 10,000 MT active inventory holding', 'Dual weighbridge digital tally integration', 'Real-time ERPNext barcode picking system']
  },
  {
    id: 'gal-manufacturing-1',
    title: 'High-Tensile Cold Forging & Thread Rolling Lines',
    category: 'manufacturing',
    categoryLabel: 'Manufacturing Plant',
    image: '/assets/hero.jpg',
    location: 'Plant Unit #1 - Forging Division',
    date: 'Continuous Production',
    description: 'Multi-station cold headers and planetary cylindrical thread rollers forming M6 through M36 metric bolts and hex screws with continuous grain flow and superior fatigue strength.',
    specs: ['Cold heading capacity: 25 MT / day', 'Grain-flow preserved uninterrupted threads', 'Automated wire uncoiling & phosphate pre-coating']
  },
  {
    id: 'gal-manufacturing-2',
    title: 'Precision Metric Hex Bolt & Fastener Sizing Matrix',
    category: 'manufacturing',
    categoryLabel: 'Manufacturing Plant',
    image: '/assets/bolt_zinc.jpg',
    location: 'Finished Goods Assembly',
    date: 'DIN 933 / DIN 931 / ISO 4017',
    description: 'Finished Class 8.8 and 10.9 high-tensile hexagonal screws with clear zinc and black passivated corrosion barriers packaged in reinforced master cartons.',
    specs: ['Full and partial thread variations', 'Clean deburred lead-in chamfer', 'Compliant with Indian BIS 1364 specifications']
  },
  {
    id: 'gal-manufacturing-3',
    title: 'Heavy Structural Anchors & Mechanical Expansion Fixings',
    category: 'manufacturing',
    categoryLabel: 'Manufacturing Plant',
    image: '/assets/anchor_bolt.jpg',
    location: 'Anchor Bolt Assembly Line',
    date: 'ETA Option 7 & Heavy Duty',
    description: 'Fischer-engineered heavy mechanical concrete expansion anchors and high-load torque-controlled through bolts with anti-corrosion zinc protection sleeves.',
    specs: ['Option 7 cracked/non-cracked concrete approval', 'High shear and pull-out resistance', 'Precision machined expansion clip mechanism']
  },
  {
    id: 'gal-applications-1',
    title: 'Mega Infrastructure & Highway Suspension Bridge Fasteners',
    category: 'applications',
    categoryLabel: 'Project Applications',
    image: '/assets/global_infra_bridge.jpg',
    location: 'National Highway Infrastructure Works',
    date: 'EPC Project Supply',
    description: 'Supply of Class 10.9 hot-dip galvanized structural bolts, heavy hex nuts, and hardened round washers for highway overpasses, flyovers, and cable-stayed river crossings.',
    specs: ['HDG coating thickness: >65 microns', 'Extreme vibration resistance under live traffic loads', 'Full NABL lab test batch traceability']
  },
  {
    id: 'gal-applications-2',
    title: 'Petrochemical Refineries & Offshore High-Pressure Piping',
    category: 'applications',
    categoryLabel: 'Project Applications',
    image: '/assets/global_oil_gas.jpg',
    location: 'Jamnagar & Hazira Refineries Zone',
    date: 'ASTM A193 B7 / A194 2H',
    description: 'Chromium-molybdenum high-temperature alloy stud bolts and heavy hex nuts deployed in oil & gas catalytic cracking towers, offshore manifolds, and high-pressure steam flanges.',
    specs: ['Operating temperature range: -40°C to +400°C', '100% MPI magnetic particle crack inspected', 'Certified for corrosive offshore saline environment']
  },
  {
    id: 'gal-applications-3',
    title: 'Utility-Scale Solar PV Farms & Wind Turbine Towers',
    category: 'applications',
    categoryLabel: 'Project Applications',
    image: '/assets/global_solar_wind.jpg',
    location: 'Bhadla Solar Park, Rajasthan',
    date: 'Renewable Clean Energy',
    description: 'Dacromet and hot-dip galvanized mounting foundation bolts, serrated flange nuts, and ground-mount tracker torque tubes fastened across 500+ MW solar installations.',
    specs: ['High wind uplift tensile certification', 'Long-term 25-year corrosion life expectancy', 'Rapid batch deliveries directly to desert sites']
  },
  {
    id: 'gal-exhibitions-1',
    title: 'Fastener Fair & Industrial Engineering Expo Showcase',
    category: 'exhibitions',
    categoryLabel: 'Exhibitions & Events',
    image: '/assets/exhibitions/exhibition_stand_branded.jpg',
    location: 'Bombay Exhibition Centre, Mumbai',
    date: 'Fastener Fair India Expo',
    description: 'The CBH Fasteners live interactive booth demonstrating our 2 Lacs+ SKU digital B2B procurement matrix, live MTC traceability QR generator, and dual PCS/KGS wholesale rate portal.',
    specs: ['Engaged over 1,200 OEM engineers and EPC procurement leaders', 'Live demonstration of rapid RFQ and BOM spreadsheet parsing', 'Showcased Fischer high-performance anchoring range']
  },
  {
    id: 'gal-exhibitions-2',
    title: 'Technical Metallurgy Consultations & OEM Stakeholder Dialogue',
    category: 'exhibitions',
    categoryLabel: 'Exhibitions & Events',
    image: '/assets/exhibitions/exhibition_conversation.jpg',
    location: 'Engineering Pavilion, Pragati Maidan New Delhi',
    date: 'International Trade Fair',
    description: 'Senior CBH metallurgists and technical sales directors consulting with civil infrastructure consultants, heavy machinery manufacturers, and pre-engineered building (PEB) contractors.',
    specs: ['Discussed custom alloy forging requirements', 'Shared failure analysis and fastener fatigue research papers', 'Demonstrated dual PCS & KGS cost-saving models']
  },
  {
    id: 'gal-exhibitions-3',
    title: 'CBH Fasteners Executive Display & Infrastructure Portfolio',
    category: 'exhibitions',
    categoryLabel: 'Exhibitions & Events',
    image: '/assets/exhibitions/exhibition_stand_photo.jpg',
    location: 'Automotive & Industrial Supply Expo, Pune',
    date: 'National Manufacturing Summit',
    description: 'Comprehensive physical display of over 500 fastener types including DIN 933 full thread, DIN 912 socket caps, DIN 934 heavy hex nuts, and surplus epc liquidation lots.',
    specs: ['Live weight-to-piece digital scale demonstration', 'BIS 1364 standard compliance documentation desk', 'One-on-one wholesale dealer onboardings']
  }
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return GALLERY_DATA;
    return GALLERY_DATA.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const categories = [
    { key: 'all', label: 'All Facility Media', count: GALLERY_DATA.length },
    { key: 'manufacturing', label: 'Forging & Plant', count: GALLERY_DATA.filter((i) => i.category === 'manufacturing').length },
    { key: 'quality', label: 'Testing & Lab', count: GALLERY_DATA.filter((i) => i.category === 'quality').length },
    { key: 'logistics', label: 'Warehouse & Dispatch', count: GALLERY_DATA.filter((i) => i.category === 'logistics').length },
    { key: 'applications', label: 'Project Sites', count: GALLERY_DATA.filter((i) => i.category === 'applications').length },
    { key: 'exhibitions', label: 'Exhibitions & Expos', count: GALLERY_DATA.filter((i) => i.category === 'exhibitions').length },
  ];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedItem(filteredItems[prevIndex]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedItem(filteredItems[nextIndex]);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans">
      <MainHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartItems.length} />

      {/* ============================================================== */}
      {/* HERO BANNER SECTION                                            */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0052CC] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0052CC]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-300 mb-4 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <span className="text-[#FF6B00] font-bold">Media &amp; Infrastructure Gallery</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 border border-white/15">
              <Images size={14} className="text-[#FF6B00]" />
              <span>Ludhiana Works • NABL Testing Bay • Global Logistics &amp; Trade Expos</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              CBH Infrastructure &amp; Facility Media Gallery
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed max-w-2xl">
              Take an inside look at India’s premier fastener ecosystem: multi-station cold forging lines, calibrated NABL metallurgy laboratories, 2 Lac+ SKU automated logistics hubs, and global industrial trade fair expos.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 text-xs">
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Holding Inventory</span>
              <strong className="text-white text-lg font-extrabold">2,00,000+ SKUs</strong>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Testing Accuracy</span>
              <strong className="text-[#38BDF8] text-lg font-extrabold">100% NABL Calibrated</strong>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Forging Experience</span>
              <strong className="text-[#FF6B00] text-lg font-extrabold">Since 1959 (65+ Yrs)</strong>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Global Dispatches</span>
              <strong className="text-emerald-400 text-lg font-extrabold">18+ Nations Exported</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FILTER TABS BAR                                                */}
      {/* ============================================================== */}
      <section className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
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
            Showing {filteredItems.length} Photographs
          </span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PHOTO GRID CANVAS                                              */}
      {/* ============================================================== */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
            >
              {/* Image Preview Container */}
              <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-md bg-[#0F172A]/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                    {item.categoryLabel}
                  </span>
                </div>

                {/* Hover Maximize Icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-white/90 text-[#0052CC] flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                    <Maximize2 size={20} />
                  </div>
                </div>

                <div className="absolute bottom-2 right-3 text-[10px] text-white/80 font-mono bg-black/60 px-2 py-0.5 rounded">
                  {item.date}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1.5">
                    <MapPin size={12} className="text-[#FF6B00] shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-sm leading-snug group-hover:text-[#0052CC] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Specs Pill */}
                {item.specs && item.specs.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-[#0052CC] font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      <span className="truncate max-w-[200px]">{item.specs[0]}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#0052CC] transition-colors flex items-center gap-0.5">
                      View <ArrowRight size={12} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ============================================================== */}
      {/* INTERACTIVE LIGHTBOX MODAL                                     */}
      {/* ============================================================== */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#0F172A] text-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:px-6 flex items-center justify-between border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded bg-[#0052CC] text-white text-[10px] font-bold uppercase tracking-wider">
                  {selectedItem.categoryLabel}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {selectedItem.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Close Lightbox"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Image Frame with Prev/Next Controls */}
            <div className="relative flex-1 bg-black min-h-[300px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
              <Image
                src={selectedItem.image}
                alt={selectedItem.title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />

              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#0052CC] text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
                title="Previous photo"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#0052CC] text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
                title="Next photo"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Modal Footer & Technical Spec Sheet */}
            <div className="p-5 sm:p-6 bg-[#141C2E] border-t border-white/10 overflow-y-auto">
              <div className="flex items-center gap-2 text-xs text-[#FF6B00] font-bold mb-1">
                <MapPin size={13} />
                <span>{selectedItem.location}</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                {selectedItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {selectedItem.description}
              </p>

              {selectedItem.specs && selectedItem.specs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Verified Quality &amp; Technical Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.specs.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-sky-200"
                      >
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        {spec}
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
