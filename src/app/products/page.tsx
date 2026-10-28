'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { Product, GlobalUnit, RfqLineItem } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  Search,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  SlidersHorizontal,
  X,
  PackageCheck
} from 'lucide-react';

export default function ProductsPage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedFinish, setSelectedFinish] = useState('all');
  const [selectedDiameter, setSelectedDiameter] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'stock_desc'>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Card Unit & Quantity Overrides
  const [cardUnits, setCardUnits] = useState<{ [id: number]: GlobalUnit }>({});
  const [cardQtys, setCardQtys] = useState<{ [id: number]: number }>({});

  // Cart State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  // Fetch real products dynamically
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      })
      .catch((err) => console.error('Failed fetching dynamic products:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Compute available filter options dynamically from real products
  const filterOptions = useMemo(() => {
    const standards = new Set<string>();
    const grades = new Set<string>();
    const finishes = new Set<string>();
    const diameters = new Set<string>();

    products.forEach((p) => {
      if (p.standard) standards.add(p.standard);
      if (p.grade) grades.add(p.grade);
      if (p.finish) finishes.add(p.finish);
      if (p.diameter) diameters.add(p.diameter);
    });

    return {
      standards: Array.from(standards).sort(),
      grades: Array.from(grades).sort(),
      finishes: Array.from(finishes).sort(),
      diameters: Array.from(diameters).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      }),
    };
  }, [products]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.standard.toLowerCase().includes(q) ||
          p.grade.toLowerCase().includes(q) ||
          p.finish.toLowerCase().includes(q) ||
          p.diameter.toLowerCase().includes(q)
      );
    }

    // Category / Tab filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'surplus') {
        result = result.filter((p) => p.isSurplus);
      } else if (selectedCategory === 'din933') {
        result = result.filter((p) => p.standard === 'DIN 933' || p.name.includes('DIN 933'));
      } else if (selectedCategory === 'din931') {
        result = result.filter((p) => p.standard === 'DIN 931' || p.name.includes('DIN 931'));
      } else if (selectedCategory === 'din912') {
        result = result.filter((p) => p.standard === 'DIN 912' || p.name.includes('DIN 912'));
      } else if (selectedCategory === 'nuts') {
        result = result.filter((p) => p.category === 'Hex Nuts' || p.standard === 'DIN 934' || p.name.includes('DIN 934'));
      }
    }

    // Standard
    if (selectedStandard !== 'all') {
      result = result.filter((p) => p.standard === selectedStandard);
    }

    // Grade
    if (selectedGrade !== 'all') {
      result = result.filter((p) => p.grade.toLowerCase().includes(selectedGrade.toLowerCase()));
    }

    // Finish
    if (selectedFinish !== 'all') {
      result = result.filter((p) => p.finish === selectedFinish);
    }

    // Diameter
    if (selectedDiameter !== 'all') {
      result = result.filter((p) => p.diameter === selectedDiameter);
    }

    // In Stock
    if (inStockOnly) {
      result = result.filter((p) => p.isInStock && p.stockPcs > 0);
    }

    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.pricePerPiece - b.pricePerPiece);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.pricePerPiece - a.pricePerPiece);
    } else if (sortBy === 'stock_desc') {
      result.sort((a, b) => b.stockPcs - a.stockPcs);
    }

    return result;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedStandard,
    selectedGrade,
    selectedFinish,
    selectedDiameter,
    inStockOnly,
    sortBy,
  ]);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedStandard,
    selectedGrade,
    selectedFinish,
    selectedDiameter,
    inStockOnly,
    sortBy,
    itemsPerPage
  ]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Page Numbers generator
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Unit and Qty Helpers
  const getCardUnit = (id: number): GlobalUnit => cardUnits[id] || globalUnit;
  const getCardQty = (id: number): number => cardQtys[id] || (getCardUnit(id) === 'PCS' ? 500 : 50);

  const toggleCardUnit = (id: number, u: GlobalUnit) => {
    setCardUnits((prev) => ({ ...prev, [id]: u }));
    setCardQtys((prev) => ({ ...prev, [id]: u === 'PCS' ? 500 : 50 }));
  };

  const adjustCardQty = (id: number, delta: number) => {
    const u = getCardUnit(id);
    const step = u === 'PCS' ? 100 : 10;
    const current = getCardQty(id);
    setCardQtys((prev) => ({ ...prev, [id]: Math.max(step, current + delta * step) }));
  };

  // Add To Quote Cart
  const handleAddToCart = (product: Product) => {
    const unit = getCardUnit(product.id);
    const qty = getCardQty(product.id);
    const rate = unit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
    const weight = unit === 'PCS' ? qty * product.weightPerPcKg : qty;

    const existingIndex = cartItems.findIndex((it) => it.sku === product.sku && it.unit === unit);
    if (existingIndex > -1) {
      setCartItems((prev) => {
        const updated = [...prev];
        const nextQty = updated[existingIndex].quantity + qty;
        const nextWeight = unit === 'PCS' ? nextQty * product.weightPerPcKg : nextQty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: nextQty,
          totalWeightKg: nextWeight,
          rowTotal: nextQty * rate,
        };
        return updated;
      });
    } else {
      const newItem: RfqLineItem = {
        id: Date.now(),
        productId: product.id,
        sku: product.sku,
        name: product.name,
        standard: product.standard,
        unit,
        unitRate: rate,
        quantity: qty,
        weightPerPcKg: product.weightPerPcKg,
        totalWeightKg: weight,
        rowTotal: qty * rate,
      };
      setCartItems((prev) => [newItem, ...prev]);
    }

    setIsCartOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStandard('all');
    setSelectedGrade('all');
    setSelectedFinish('all');
    setSelectedDiameter('all');
    setInStockOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
    setIsMobileFilterOpen(false);
  };

  const activeFilterCount =
    (searchQuery !== '' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedStandard !== 'all' ? 1 : 0) +
    (selectedGrade !== 'all' ? 1 : 0) +
    (selectedFinish !== 'all' ? 1 : 0) +
    (selectedDiameter !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  // Filter Form Content used for both Desktop Sidebar & Mobile Drawer
  const renderFilterControls = () => (
    <div className="space-y-4">
      {/* Standard Filter */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
          Standard (DIN / ISO)
        </label>
        <select
          value={selectedStandard}
          onChange={(e) => setSelectedStandard(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        >
          <option value="all">All Standards ({filterOptions.standards.length})</option>
          {filterOptions.standards.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Grade Filter */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
          Property Class / Grade
        </label>
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        >
          <option value="all">All Grades ({filterOptions.grades.length})</option>
          {filterOptions.grades.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Diameter Filter */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
          Metric Diameter
        </label>
        <select
          value={selectedDiameter}
          onChange={(e) => setSelectedDiameter(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        >
          <option value="all">All Diameters ({filterOptions.diameters.length})</option>
          {filterOptions.diameters.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Surface Finish Filter */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
          Surface Coating / Finish
        </label>
        <select
          value={selectedFinish}
          onChange={(e) => setSelectedFinish(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        >
          <option value="all">All Finishes ({filterOptions.finishes.length})</option>
          {filterOptions.finishes.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* In Stock Toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer pt-3 border-t border-slate-100 text-xs font-semibold text-slate-800 select-none">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
        />
        <span>In Stock Only (Immediate Dispatch)</span>
      </label>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col antialiased">
      <MainHeader
        unit={globalUnit}
        onUnitToggle={(u) => setGlobalUnit(u)}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* ============================================================== */}
      {/* HERO BANNER & SEARCH                                           */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-br from-[#0A192F] via-[#0F2A4A] to-[#0052CC] text-white py-6 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-300 mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <span className="text-[#FF6B00] font-bold">Fasteners Catalog</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold mb-3 border border-white/15">
                <ShieldCheck size={14} className="text-[#FF6B00]" />
                <span className="tracking-wide">100% EN 10204 3.1 CERTIFIED METRIC FASTENERS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Industrial Fasteners Catalog &amp; Procurement Grid
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
                Direct factory supply of high-tensile metric bolts, full-thread hex screws, socket cap fasteners, and heavy hex nuts. Dual pricing available in both <strong>Pieces (Pcs)</strong> and <strong>Kilograms (MT)</strong>.
              </p>
            </div>

            {/* Global Pricing Unit Switcher */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 sm:p-4 self-start lg:self-center shrink-0 w-full sm:w-auto sm:min-w-[240px]">
              <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider block mb-2">
                Procurement Pricing Unit:
              </span>
              <div className="flex bg-black/30 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setGlobalUnit('PCS')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all text-center ${
                    globalUnit === 'PCS'
                      ? 'bg-[#FF6B00] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Pieces (Pcs)
                </button>
                <button
                  type="button"
                  onClick={() => setGlobalUnit('KGS')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all text-center ${
                    globalUnit === 'KGS'
                      ? 'bg-[#FF6B00] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Kilograms (Kg)
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar Bar */}
          <div className="mt-4 sm:mt-6 relative max-w-3xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, Standard (DIN 933), Diameter (M10), Grade (8.8), or Finish (HDG, Zinc)..."
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-xl border border-white/20 bg-white text-slate-900 text-xs sm:text-sm placeholder-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200 hover:bg-slate-300 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                title="Clear search"
              >
                <X size={13} className="text-slate-600" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CATEGORY TABS & MOBILE FILTER TRIGGER (STICKY BAR)             */}
      {/* ============================================================== */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-3 sm:px-6 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Category Horizontal Scrolling Pills */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Fasteners ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('din933')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
                selectedCategory === 'din933'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Hex Screws (DIN 933)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('din931')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
                selectedCategory === 'din931'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Hex Bolts (DIN 931)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('din912')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
                selectedCategory === 'din912'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Socket Caps (DIN 912)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('nuts')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
                selectedCategory === 'nuts'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Nuts (DIN 934)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('surplus')}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
                selectedCategory === 'surplus'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Zap size={13} />
              <span>Surplus Deals (-60%)</span>
            </button>
          </div>

          {/* Right Action Cluster: Sort Dropdown & Mobile Filter Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Filter Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
              title="Open filters"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-[#FF6B00] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="featured">Featured Fasteners</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_desc">Highest Stock First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE FILTER MODAL / DRAWER                                   */}
      {/* ============================================================== */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[2000] lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Slide-in Sheet */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-blue-700" />
                  <h3 className="font-extrabold text-base text-slate-900">Filter Specifications</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Sort Option */}
              <div className="sm:hidden mb-5 pb-5 border-b border-slate-100">
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                  Sort Fasteners
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-semibold"
                >
                  <option value="featured">Featured Fasteners</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="stock_desc">Highest Stock First</option>
                </select>
              </div>

              {/* Form Controls */}
              {renderFilterControls()}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-2.5 px-3 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 shadow-sm"
              >
                View ({filteredProducts.length}) Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN CATALOG BODY (SIDEBAR + GRID)                             */}
      {/* ============================================================== */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 flex gap-6 lg:gap-8">
        
        {/* ============================================================== */}
        {/* DESKTOP SIDEBAR FILTERS (Hidden on Mobile/Tablet)               */}
        {/* ============================================================== */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 gap-4 sticky top-16 self-start">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-blue-700" />
                <h3 className="text-sm font-extrabold text-slate-900">Filter Specifications</h3>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-blue-700 text-[11px] font-bold hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {renderFilterControls()}
          </div>

          {/* Quick Technical Custom RFQ Callout */}
          <div className="bg-slate-900 text-white rounded-xl p-5 text-xs shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-[#FF6B00] font-extrabold">
              <Sparkles size={15} />
              <span>CUSTOM SPECIFICATIONS?</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-3">
              We forge and machine custom fastener lengths, special thread pitches, and exotic alloy grades (Inconel, Monel, Duplex).
            </p>
            <Link
              href="/bulk-order"
              className="inline-flex items-center gap-1.5 text-sky-400 font-bold hover:text-sky-300 transition-colors"
            >
              <span>Submit Custom RFQ</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* PRODUCT GRID CONTAINER                                          */}
        {/* ============================================================== */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          
          {/* Status strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              Showing <strong className="text-slate-900">{filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> - <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> of <strong className="text-slate-900">{filteredProducts.length}</strong> matching fasteners
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-red-600 font-semibold hover:underline flex items-center gap-1 text-xs"
              >
                <span>Clear all active filters</span>
                <span>&times;</span>
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-8 sm:p-14 text-center my-6">
              <Layers size={44} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-1">
                No fastener specifications matched your filter
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
                Try relaxing your diameter, standard, or finish filters to explore more of our stock.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-blue-800 transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {paginatedProducts.map((p) => {
                const currentUnit = getCardUnit(p.id);
                const currentQty = getCardQty(p.id);
                const currentPrice = currentUnit === 'PCS' ? p.pricePerPiece : p.pricePerKg;

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-xl border ${
                      p.isSurplus ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                    } p-3.5 sm:p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-extrabold font-mono tracking-wider">
                          {p.standard}
                        </span>

                        {p.isSurplus ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide">
                            -{p.surplusDiscountPct || 60}% SURPLUS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                            <CheckCircle2 size={13} />
                            <span>In Stock</span>
                          </span>
                        )}
                      </div>

                      {/* Product Image */}
                      <Link href={`/product/${p.id}`} className="block text-center my-2 sm:my-3 group">
                        <div className="relative w-full h-32 sm:h-36 transition-transform group-hover:scale-105 duration-200">
                          <Image
                            src={p.imageUrl || '/assets/bolt_zinc.jpg'}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-contain"
                          />
                        </div>
                      </Link>

                      {/* Specs Matrix Strip */}
                      <div className="grid grid-cols-3 text-center bg-slate-50 rounded-lg p-2 text-[10px] font-mono border border-slate-100 mb-2">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">GRADE</span>
                          <strong className="text-slate-900 truncate block">{p.grade}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">SIZE</span>
                          <strong className="text-slate-900 truncate block">{p.sizeFormatted || `${p.diameter}x${p.lengthMm}`}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">PITCH</span>
                          <strong className="text-slate-900 truncate block">{p.pitchMm}mm</strong>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 min-h-[2rem] sm:min-h-[2.4rem] leading-snug mb-1">
                        <Link href={`/product/${p.id}`} className="hover:text-blue-700 transition-colors" title={p.name}>
                          {p.name}
                        </Link>
                      </h3>

                      {/* Excel Logistics & Packaging Meta */}
                      <div className="flex flex-wrap gap-1 mb-2.5 text-[10px]">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          Box: {p.pcsPerBox || '500'} pcs
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          MOQ: {p.moq || '25 KGS'}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          Lead: {p.leadTimeDays || 10}d
                        </span>
                      </div>

                      {/* Finish */}
                      <div className="text-[11px] text-slate-500 mb-2 truncate">
                        Finish: <strong className="text-slate-700">{p.finish}</strong>
                      </div>
                    </div>

                    {/* Bottom Commercial Section */}
                    <div>
                      {/* Dual Pricing Box */}
                      <div className="bg-slate-50 rounded-lg p-2.5 mb-2.5 border border-slate-200/80">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                            {currentUnit === 'PCS' ? 'Rate / Pc:' : 'Rate / Kg:'}
                          </span>
                          <span className="text-base sm:text-lg font-black text-blue-700 font-mono">
                            {formatINR(currentPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                          <span>
                            Alt: {formatINR(currentUnit === 'PCS' ? p.pricePerKg : p.pricePerPiece)} / {currentUnit === 'PCS' ? 'Kg' : 'Pc'}
                          </span>
                          <span>
                            Wt: {(p.weightPerPcKg * 1000).toFixed(1)}g / pc
                          </span>
                        </div>
                      </div>

                      {/* Procurement Configurator (Unit Toggle + Stepper) */}
                      <div className="flex items-center gap-1.5 mb-2.5">
                        {/* Unit Switcher */}
                        <div className="flex bg-slate-200 p-0.5 rounded text-[10px] font-bold shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleCardUnit(p.id, 'PCS')}
                            className={`px-2 py-1 rounded transition-colors ${
                              currentUnit === 'PCS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            PCS
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleCardUnit(p.id, 'KGS')}
                            className={`px-2 py-1 rounded transition-colors ${
                              currentUnit === 'KGS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            KGS
                          </button>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex-1 flex items-center justify-between border border-slate-300 rounded bg-white px-2 py-1 text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => adjustCardQty(p.id, -1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-900">{currentQty}</span>
                          <button
                            type="button"
                            onClick={() => adjustCardQty(p.id, 1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Add to RFQ Button */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 sm:py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-[0.98]"
                      >
                        <ShoppingCart size={14} />
                        <span>Add to RFQ Quote</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ============================================================== */}
          {/* RESPONSIVE PAGINATION CONTROLS                                 */}
          {/* ============================================================== */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-3 sm:p-4 mt-4 shadow-sm">
              {/* Items Per Page Selector */}
              <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-start">
                <span>Fasteners per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
                >
                  <option value={12}>12 / page</option>
                  <option value={24}>24 / page</option>
                  <option value={48}>48 / page</option>
                  <option value={filteredProducts.length || 100}>All ({filteredProducts.length})</option>
                </select>
                <span className="text-slate-400 text-[11px]">
                  (Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>)
                </span>
              </div>

              {/* Page Navigation Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Prev Button */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                    currentPage === 1
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Number Pills */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">
                          ...
                        </span>
                      );
                    }
                    const isCurrent = page === currentPage;
                    return (
                      <button
                        key={`page-${page}`}
                        type="button"
                        onClick={() => {
                          setCurrentPage(Number(page));
                          window.scrollTo({ top: 380, behavior: 'smooth' });
                        }}
                        className={`min-w-[32px] sm:min-w-[34px] h-8 sm:h-8.5 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center transition-colors ${
                          isCurrent
                            ? 'bg-blue-700 text-white shadow-sm'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                    currentPage === totalPages
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={(id, qty) => {
          setCartItems((prev) =>
            prev.map((item) => {
              if (item.id === id) {
                const nextQty = Math.max(1, qty);
                const nextWeight = item.unit === 'PCS' ? nextQty * item.weightPerPcKg : nextQty;
                return {
                  ...item,
                  quantity: nextQty,
                  totalWeightKg: nextWeight,
                  rowTotal: nextQty * item.unitRate,
                };
              }
              return item;
            })
          );
        }}
        onRemoveItem={(id) => {
          setCartItems((prev) => prev.filter((item) => item.id !== id));
        }}
      />
    </div>
  );
}
