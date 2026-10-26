'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { CatalogProductFamily, TechnicalVariant } from '@/lib/catalog-types';
import { INITIAL_FAMILIES } from '@/lib/catalog-data';
import { RfqLineItem } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  ChevronRight,
  Award,
  ShieldCheck,
  CheckCircle2,
  FileDown,
  ShoppingCart,
  Plus,
  Minus,
  Info,
  Search,
  Filter,
  Layers,
  Wrench,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export default function ProductFamilyDetailPage() {
  const params = useParams();
  const categorySlug = params?.category as string;
  const subcategorySlug = params?.subcategory as string;
  const familySlug = params?.family as string;

  const [family, setFamily] = useState<CatalogProductFamily | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'installation' | 'downloads' | 'applications'>('matrix');

  // Cart integration
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);
  const [addedAlert, setAddedAlert] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/catalog/families?slug=${familySlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFamily(data.data);
        } else {
          const fallback = INITIAL_FAMILIES.find((f) => f.slug === familySlug) || INITIAL_FAMILIES[0];
          setFamily(fallback);
        }
      })
      .catch(() => {
        const fallback = INITIAL_FAMILIES.find((f) => f.slug === familySlug) || INITIAL_FAMILIES[0];
        setFamily(fallback);
      });
  }, [familySlug]);

  const activeFamily = family || INITIAL_FAMILIES[0];

  // Material filtering
  const allVariants = activeFamily.variants || [];
  const filteredVariants = allVariants.filter((v) => {
    const matchesMaterial = selectedMaterial === 'all' || v.materialCode === selectedMaterial;
    const matchesSearch =
      !searchFilter ||
      v.itemNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.artName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.thread.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(v.drillHoleDiameterMm).includes(searchFilter);
    return matchesMaterial && matchesSearch;
  });

  const getVariantQuantity = (variantId: string, packQty: number) => {
    return quantities[variantId] || packQty || 50;
  };

  const handleQuantityChange = (variantId: string, packQty: number, delta: number) => {
    const current = getVariantQuantity(variantId, packQty);
    const step = packQty || 10;
    const next = Math.max(step, current + delta * step);
    setQuantities((prev) => ({ ...prev, [variantId]: next }));
  };

  const handleAddToCart = (variant: TechnicalVariant) => {
    const qty = getVariantQuantity(variant.id, variant.packQty);
    const lineItem: RfqLineItem = {
      id: Date.now(),
      productId: Number(variant.itemNo) || 101,
      sku: variant.itemNo,
      name: `${variant.artName} (${variant.thread})`,
      standard: 'ETA-19/0520 Option 1',
      unit: 'PCS',
      unitRate: variant.unitPriceInr,
      quantity: qty,
      weightPerPcKg: (variant.drillHoleDiameterMm * variant.totalLengthMm * 0.00008) || 0.08,
      totalWeightKg: ((variant.drillHoleDiameterMm * variant.totalLengthMm * 0.00008) || 0.08) * qty,
      rowTotal: variant.unitPriceInr * qty,
    };

    setCartItems((prev) => [lineItem, ...prev]);
    setAddedAlert(`Added ${qty} pcs of ${variant.artName} to your RFQ.`);
    setTimeout(() => setAddedAlert(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#14181E] flex flex-col font-sans">
      <MainHeader />

      {/* Floating Add Notification */}
      {addedAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121518] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#0052CC]/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{addedAlert}</span>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="ml-3 px-3 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white text-[11px] font-bold rounded-lg transition-colors"
          >
            View RFQ Cart
          </button>
        </div>
      )}

      {/* Hero Family Header - Technical Navy & CBH Blue/Orange */}
      <section className="bg-[#121518] text-white border-b border-[#242B35] pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href={`/products/${categorySlug}`} className="hover:text-white transition-colors capitalize">
              {categorySlug ? categorySlug.replace(/-/g, ' ') : 'Category'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href={`/products/${categorySlug}/${subcategorySlug}`} className="hover:text-white transition-colors capitalize">
              {subcategorySlug ? subcategorySlug.replace(/-/g, ' ') : 'Subcategory'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#FF6B00] font-semibold">{activeFamily.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Product Info & Top Claim */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {activeFamily.approvals?.map((app) => (
                  <span
                    key={app.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(255,107,0,0.15)] text-[#FF6B00] text-xs font-bold border border-[#FF6B00]/40"
                  >
                    <Award className="w-3.5 h-3.5 text-[#FF6B00]" />
                    {app.badgeText} ({app.code})
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
                {activeFamily.name}
              </h1>

              <p className="text-base sm:text-lg font-semibold text-[#2684FF] mb-4 leading-snug">
                {activeFamily.headline}
              </p>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                {activeFamily.description}
              </p>

              {/* Key Technical Highlights */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 mb-6">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B00]" /> Key Engineering Advantages
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeFamily.topFeatures?.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Hero Image Gallery */}
            <div className="lg:col-span-5 bg-[#1A1F26] rounded-2xl p-6 border border-white/10 flex flex-col items-center">
              <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-[#121518] border border-[#242B35]">
                <Image
                  src={activeFamily.heroImageUrl}
                  alt={activeFamily.name}
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                />
              </div>

              {/* Action CTAs */}
              <div className="mt-5 w-full grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('downloads')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-white/10"
                >
                  <FileDown className="w-4 h-4 text-[#2684FF]" /> ETA Documents
                </button>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4" /> View Cart ({cartItems.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Bar */}
      <div className="relative z-10 bg-white border-b border-[#D8DFE7] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'matrix'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Technical Matrix & Ordering ({filteredVariants.length})
            </button>
            <button
              onClick={() => setActiveTab('installation')}
              className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'installation'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" /> Installation Guide
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'applications'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Approvals & Materials
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'downloads'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileDown className="w-4 h-4" /> Certificates & CAD
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* ========================================================================= */}
        {/* TAB 1: TECHNICAL MATRIX & ORDERING TABLE (Fischer Exact Matrix)           */}
        {/* ========================================================================= */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            {/* Filters Bar: Material Pills + Search */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DFE7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Material Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Material:
                </span>
                <button
                  onClick={() => setSelectedMaterial('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedMaterial === 'all'
                      ? 'bg-[#0052CC] text-white shadow'
                      : 'bg-[#F4F6F9] text-slate-700 hover:bg-slate-200 border border-[#D8DFE7]'
                  }`}
                >
                  All Materials ({allVariants.length})
                </button>
                {activeFamily.materialsAvailable?.map((mat) => {
                  const count = allVariants.filter((v) => v.materialCode === mat.code).length;
                  return (
                    <button
                      key={mat.id}
                      onClick={() => setSelectedMaterial(mat.code)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        selectedMaterial === mat.code
                          ? 'bg-[#121518] text-white shadow'
                          : 'bg-[#F4F6F9] text-slate-700 hover:bg-slate-200 border border-[#D8DFE7]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mat.badgeColor }} />
                      {mat.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Fast Matrix Search */}
              <div className="relative min-w-[260px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter by Art No, Thread, Diameter..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D8DFE7] bg-[#F4F6F9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-white rounded-2xl border border-[#D8DFE7] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#121518] text-white font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Item No. / Article Name</th>
                      <th className="py-3.5 px-3 text-center" title="Drill hole diameter d0">
                        d<sub>0</sub> [mm]
                      </th>
                      <th className="py-3.5 px-3 text-center" title="Min drill hole depth h2">
                        h<sub>2</sub> [mm]
                      </th>
                      <th className="py-3.5 px-3 text-center" title="Effective anchorage depth hef">
                        h<sub>ef</sub> [mm]
                      </th>
                      <th className="py-3.5 px-3 text-center" title="Max fixture thickness tfix">
                        t<sub>fix</sub> [mm]
                      </th>
                      <th className="py-3.5 px-3 text-center">Thread</th>
                      <th className="py-3.5 px-3 text-center" title="Width across flats SW">
                        SW [mm]
                      </th>
                      <th className="py-3.5 px-3 text-center" title="Installation torque Tinst">
                        T<sub>inst</sub> [Nm]
                      </th>
                      <th className="py-3.5 px-3 text-center" title="Total length l">
                        l [mm]
                      </th>
                      <th className="py-3.5 px-3 text-center">Packaging</th>
                      <th className="py-3.5 px-4 text-right">Unit Price</th>
                      <th className="py-3.5 px-4 text-center">Quantity & Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8DFE7]">
                    {filteredVariants.map((v) => {
                      const isExpanded = expandedVariantId === v.id;
                      const qty = getVariantQuantity(v.id, v.packQty);
                      const rowTotal = v.unitPriceInr * qty;

                      return (
                        <React.Fragment key={v.id}>
                          <tr className={`hover:bg-blue-50/40 transition-colors ${isExpanded ? 'bg-blue-50/60' : ''}`}>
                            {/* Art Name & SKU */}
                            <td className="py-3.5 px-4 font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setExpandedVariantId(isExpanded ? null : v.id)}
                                  className="text-slate-400 hover:text-[#0052CC] transition-colors"
                                  title="Expand technical details"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                <div>
                                  <div className="font-bold text-[#14181E] text-xs">{v.artName}</div>
                                  <div className="text-[11px] text-[#0052CC] font-mono">Art. No. {v.itemNo}</div>
                                </div>
                              </div>
                            </td>

                            {/* Technical Params */}
                            <td className="py-3.5 px-3 text-center font-semibold text-slate-700">{v.drillHoleDiameterMm}</td>
                            <td className="py-3.5 px-3 text-center text-slate-600">{v.minDrillHoleDepthMm}</td>
                            <td className="py-3.5 px-3 text-center font-bold text-[#14181E]">{v.effectiveAnchorageDepthMm}</td>
                            <td className="py-3.5 px-3 text-center font-semibold text-[#0052CC]">{v.maxFixtureThicknessMm}</td>
                            <td className="py-3.5 px-3 text-center font-mono text-slate-700">{v.thread}</td>
                            <td className="py-3.5 px-3 text-center text-slate-600">{v.widthAcrossFlatsMm}</td>
                            <td className="py-3.5 px-3 text-center text-slate-600">{v.installationTorqueNm}</td>
                            <td className="py-3.5 px-3 text-center text-slate-700">{v.totalLengthMm}</td>

                            {/* Packaging */}
                            <td className="py-3.5 px-3 text-center text-slate-600">
                              <span className="inline-block px-2 py-0.5 rounded bg-[#F4F6F9] border border-[#D8DFE7] font-semibold text-[11px]">
                                {v.salesUnit}
                              </span>
                            </td>

                            {/* Pricing */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="font-bold text-[#0052CC] text-sm">{formatINR(v.unitPriceInr)}</div>
                              <div className="text-[10px] text-slate-500">Box: {formatINR(v.boxPriceInr)}</div>
                            </td>

                            {/* Quantity & Add Button */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="flex items-center border border-[#D8DFE7] rounded-lg bg-white shadow-sm overflow-hidden">
                                  <button
                                    onClick={() => handleQuantityChange(v.id, v.packQty, -1)}
                                    className="px-2 py-1 hover:bg-[#F4F6F9] text-slate-600 transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 text-xs font-bold text-slate-800 min-w-[36px] text-center">
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(v.id, v.packQty, 1)}
                                    className="px-2 py-1 hover:bg-[#F4F6F9] text-slate-600 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleAddToCart(v)}
                                  className="p-2 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white transition-all shadow-sm hover:shadow"
                                  title="Add to RFQ Cart"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Variant Specifications */}
                          {isExpanded && (
                            <tr className="bg-[#F4F6F9] text-xs">
                              <td colSpan={12} className="p-4 border-t border-[#D8DFE7]">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-[#D8DFE7]">
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                                      Material & Corrosion
                                    </span>
                                    <div className="font-semibold text-slate-800">{v.materialName} ({v.materialCode})</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">Fire resistance: {v.fireResistance || 'R 120'}</div>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                                      Seismic & ETA Assessment
                                    </span>
                                    <div className="font-semibold text-emerald-700 flex items-center gap-1">
                                      <ShieldCheck className="w-3.5 h-3.5" /> ETA Option 1 (Cracked Concrete)
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">Seismic Performance: {v.seismicApproved || 'C1/C2'}</div>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                                      GTIN / Global Identification
                                    </span>
                                    <div className="font-mono text-slate-800 text-xs font-semibold">{v.gtin}</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">Stock: {v.stockPcs.toLocaleString()} Pcs Available</div>
                                  </div>
                                  <div className="flex items-center justify-end">
                                    <button
                                      onClick={() => handleAddToCart(v)}
                                      className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow"
                                    >
                                      <ShoppingCart className="w-3.5 h-3.5" /> Add {qty} pcs ({formatINR(rowTotal)})
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INSTALLATION & ASSEMBLY INSTRUCTIONS                               */}
        {/* ========================================================================= */}
        {activeTab === 'installation' && (
          <div className="bg-white rounded-2xl p-8 border border-[#D8DFE7] shadow-sm space-y-8">
            <div>
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest">
                Jobsite Assembly Instructions
              </span>
              <h3 className="text-xl font-bold text-[#14181E] mt-1">
                Standard Push-Through Installation in Concrete
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Follow these approved ETA procedures to guarantee rated pull-out and shear load performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {activeFamily.installationSteps?.map((step) => (
                <div key={step.step} className="p-5 rounded-xl bg-[#F4F6F9] border border-[#D8DFE7] flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center mb-3">
                      {step.step}
                    </div>
                    <h4 className="text-sm font-bold text-[#14181E] mb-2">{step.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.instruction}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[rgba(0,82,204,0.06)] border border-[#0052CC]/20 text-xs text-[#14181E] flex items-start gap-3">
              <Info className="w-5 h-5 text-[#0052CC] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Notice regarding hollow drill bits:</span> When using Fischer hollow suction drill bits (FHD), the hole is cleaned simultaneously during the drilling process, completely eliminating the manual brushing and blowing step.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: APPLICATIONS & BUILDING MATERIALS                                  */}
        {/* ========================================================================= */}
        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-[#D8DFE7] shadow-sm">
              <h3 className="text-lg font-bold text-[#14181E] mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#0052CC]" /> Suitable Applications
              </h3>
              <ul className="space-y-3">
                {activeFamily.applications?.map((app, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-[#D8DFE7] shadow-sm">
              <h3 className="text-lg font-bold text-[#14181E] mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Building Materials
              </h3>
              <ul className="space-y-3">
                {activeFamily.buildingMaterials?.map((bm, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                    <span>{bm}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CERTIFICATES & CAD DOWNLOADS                                       */}
        {/* ========================================================================= */}
        {activeTab === 'downloads' && (
          <div className="bg-white rounded-2xl p-8 border border-[#D8DFE7] shadow-sm">
            <h3 className="text-lg font-bold text-[#14181E] mb-6 flex items-center gap-2">
              <FileDown className="w-5 h-5 text-[#0052CC]" /> Official Technical Documentation & CAD Files
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeFamily.documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-xl bg-[#F4F6F9] border border-[#D8DFE7] flex flex-col justify-between hover:border-[#0052CC] transition-all"
                >
                  <div>
                    <div className="inline-block px-2 py-0.5 rounded bg-[rgba(0,82,204,0.1)] text-[#0052CC] text-[10px] font-bold uppercase mb-2">
                      {doc.category}
                    </div>
                    <h4 className="text-xs font-bold text-[#14181E] line-clamp-2 mb-2">{doc.title}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {doc.fileType} • {doc.fileSize} • {doc.language}
                    </span>
                  </div>
                  <a
                    href={doc.fileUrl}
                    download
                    className="mt-4 px-3 py-1.5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download File
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={(id, qty) => {
          setCartItems((prev) =>
            prev
              .map((item) => (item.id === id ? { ...item, quantity: qty } : item))
              .filter((item) => item.quantity > 0)
          );
        }}
        onRemoveItem={(id) => {
          setCartItems((prev) => prev.filter((item) => item.id !== id));
        }}
      />
    </div>
  );
}
