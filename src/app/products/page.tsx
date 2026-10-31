'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
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
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Plus,
  HelpCircle,
  Link2,
  PackageCheck,
  Compass,
  Check
} from 'lucide-react';
import CustomProductRequestModal from '@/components/common/CustomProductRequestModal';

// ============================================================================
// SEARCH QUERY PARSER & ATTRIBUTE DETECTOR
// ============================================================================

interface DetectedFastenerAttributes {
  rawQuery: string;
  cleanQuery: string;
  tokens: string[];
  diameter?: string;
  lengthMm?: number;
  standard?: string;
  grade?: string;
  finish?: string;
  category?: string;
}

function parseFastenerQuery(query: string): DetectedFastenerAttributes {
  const rawQuery = (query || '').trim();
  if (!rawQuery) {
    return { rawQuery: '', cleanQuery: '', tokens: [] };
  }

  // Normalize common variations:
  // "DIN-933" -> "DIN 933", "ISO-4017" -> "ISO 4017", "M 10" -> "M10"
  let clean = rawQuery
    .replace(/DIN[-\s]?(\d{3,4})/gi, 'DIN $1')
    .replace(/ISO[-\s]?(\d{4,5})/gi, 'ISO $1')
    .replace(/\bM\s*(\d{1,2})\b/gi, 'M$1')
    .replace(/,/g, ' ')
    .replace(/[()]/g, ' ')
    .trim();

  const tokens = clean
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  let diameter: string | undefined;
  let lengthMm: number | undefined;
  let standard: string | undefined;
  let grade: string | undefined;
  let finish: string | undefined;
  let category: string | undefined;

  // 1. Diameter (e.g. M4..M48, 1/4", 1/2", 3/4", 1")
  const diaMatch = clean.match(/\b(M\d{1,2}|(?:\d+\/)?\d+["'])\b/i);
  if (diaMatch) {
    diameter = diaMatch[1].toUpperCase();
  }

  // 2. Length (e.g. M10X50, M12x75, 50mm, or x 50)
  const lengthMatch = clean.match(/(?:x|\*|\s)\s*(\d{2,3})(?:mm)?\b/i) || clean.match(/\b(\d{2,3})mm\b/i);
  if (lengthMatch) {
    lengthMm = parseInt(lengthMatch[1], 10);
  }

  // 3. Standard
  const stdMatch = clean.match(/\b(DIN\s*\d{3,4}|ISO\s*\d{4,5}|ASTM\s*[A-Z0-9]+|ASME\s*[A-Z0-9.]+)\b/i);
  if (stdMatch) {
    standard = stdMatch[1].toUpperCase();
  }

  // 4. Grade
  const gradeMatch = clean.match(/\b(4\.6|8\.8|10\.9|12\.9|SS\s*304|SS\s*316|304|316|A2-70|A4-80|A2|A4|B7)\b/i);
  if (gradeMatch) {
    grade = gradeMatch[1].toUpperCase();
  }

  // 5. Finish
  const finishMatch = clean.match(/\b(zinc|wzp|yzp|hdg|galvanized|galvanised|black|bp|passivated|geomet|dacromet)\b/i);
  if (finishMatch) {
    finish = finishMatch[1].toLowerCase();
  }

  // 6. Category
  if (/\b(nut|nuts)\b/i.test(clean)) category = 'Hex Nuts';
  else if (/\b(washer|washers)\b/i.test(clean)) category = 'Washers';
  else if (/\b(socket|cap)\b/i.test(clean)) category = 'Socket Caps';
  else if (/\b(flange)\b/i.test(clean)) category = 'HEX FLANGE BOLTS';
  else if (/\b(bolt|screw)\b/i.test(clean)) category = 'Hex Screws';

  return {
    rawQuery,
    cleanQuery: clean,
    tokens,
    diameter,
    lengthMm,
    standard,
    grade,
    finish,
    category,
  };
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================

interface FastenerCardProps {
  product: Product;
  currentUnit: GlobalUnit;
  currentQty: number;
  onToggleUnit: (u: GlobalUnit) => void;
  onAdjustQty: (delta: number) => void;
  onAddToCart: (p: Product) => void;
  relatedBadge?: string;
  badgeTone?: 'blue' | 'amber' | 'emerald' | 'purple';
}

function FastenerCard({
  product: p,
  currentUnit,
  currentQty,
  onToggleUnit,
  onAdjustQty,
  onAddToCart,
  relatedBadge,
  badgeTone = 'blue',
}: FastenerCardProps) {
  const currentPrice = currentUnit === 'PCS' ? p.pricePerPiece : p.pricePerKg;

  const toneClass = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
  }[badgeTone];

  return (
    <div
      className={`bg-white rounded-xl border ${
        p.isSurplus
          ? 'border-amber-300 ring-1 ring-amber-200'
          : relatedBadge
          ? 'border-blue-200 shadow-sm'
          : 'border-slate-200'
      } p-3.5 sm:p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex justify-between items-center mb-2 gap-1.5 flex-wrap">
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

        {/* Optional Related Reason Badge */}
        {relatedBadge && (
          <div className={`mb-2 px-2 py-1 rounded-md text-[10px] font-extrabold border ${toneClass} flex items-center gap-1 leading-tight`}>
            <Sparkles size={11} className="shrink-0" />
            <span className="truncate">{relatedBadge}</span>
          </div>
        )}

        {/* Product Image */}
        <Link href={`/product/${p.id}`} className="block text-center my-2 sm:my-3 group">
          <div className="relative w-full h-32 sm:h-36 transition-transform group-hover:scale-105 duration-200">
            <Image
              src={p.imageUrl || '/assets/bolt_zinc.jpg'}
              alt={p.name}
              fill
              unoptimized={Boolean(p.imageUrl && p.imageUrl.startsWith('http'))}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain"
              onError={(e) => {
                try {
                  (e.target as any).src = '/assets/bolt_zinc.jpg';
                } catch {}
              }}
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

        {/* Meta details */}
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
              onClick={() => onToggleUnit('PCS')}
              className={`px-2 py-1 rounded transition-colors ${
                currentUnit === 'PCS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PCS
            </button>
            <button
              type="button"
              onClick={() => onToggleUnit('KGS')}
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
              onClick={() => onAdjustQty(-1)}
              className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="font-bold text-slate-900">{currentQty}</span>
            <button
              type="button"
              onClick={() => onAdjustQty(1)}
              className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to RFQ Button */}
        <button
          type="button"
          onClick={() => onAddToCart(p)}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 sm:py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-[0.98]"
        >
          <ShoppingCart size={14} />
          <span>Add to RFQ Quote</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN INNER CATALOG COMPONENT (CONSUMES URL SEARCH PARAMS)
// ============================================================================

function ProductsPageInner() {
  const searchParams = useSearchParams();

  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);

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

  // Show all related products toggle when search has direct matches
  const [showAllRelated, setShowAllRelated] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Card Unit & Quantity Overrides
  const [cardUnits, setCardUnits] = useState<{ [id: number]: GlobalUnit }>({});
  const [cardQtys, setCardQtys] = useState<{ [id: number]: number }>({});

  // Cart State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  // Sync state from URL query parameters on load / update
  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('q');
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
    }
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const std = searchParams.get('standard');
    if (std) setSelectedStandard(std);
    const grd = searchParams.get('grade');
    if (grd) setSelectedGrade(grd);
    const dia = searchParams.get('diameter');
    if (dia) setSelectedDiameter(dia);
    const fin = searchParams.get('finish');
    if (fin) setSelectedFinish(fin);
  }, [searchParams]);

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

  // Parsed Search Attributes
  const parsedSearch = useMemo(() => {
    return parseFastenerQuery(searchQuery);
  }, [searchQuery]);

  // Intelligent Search & Related Products Engine
  const { directMatches, relatedProducts } = useMemo(() => {
    if (!products.length) return { directMatches: [], relatedProducts: [] };

    const query = searchQuery.trim();
    if (!query) {
      // No search active: all products filtered by category/dropdowns
      let all = [...products];

      // Category / Tab filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'surplus') {
          all = all.filter((p) => p.isSurplus);
        } else if (selectedCategory === 'din933') {
          all = all.filter((p) => p.standard === 'DIN 933' || p.name.includes('DIN 933'));
        } else if (selectedCategory === 'din931') {
          all = all.filter((p) => p.standard === 'DIN 931' || p.name.includes('DIN 931'));
        } else if (selectedCategory === 'din912') {
          all = all.filter((p) => p.standard === 'DIN 912' || p.name.includes('DIN 912'));
        } else if (selectedCategory === 'nuts') {
          all = all.filter((p) => p.category === 'Hex Nuts' || p.standard === 'DIN 934' || p.name.includes('DIN 934'));
        }
      }

      // Dropdown filters
      if (selectedStandard !== 'all') all = all.filter((p) => p.standard === selectedStandard);
      if (selectedGrade !== 'all') all = all.filter((p) => p.grade.toLowerCase().includes(selectedGrade.toLowerCase()));
      if (selectedFinish !== 'all') all = all.filter((p) => p.finish === selectedFinish);
      if (selectedDiameter !== 'all') all = all.filter((p) => p.diameter === selectedDiameter);
      if (inStockOnly) all = all.filter((p) => p.isInStock && p.stockPcs > 0);

      // Sort
      if (sortBy === 'price_asc') all.sort((a, b) => a.pricePerPiece - b.pricePerPiece);
      else if (sortBy === 'price_desc') all.sort((a, b) => b.pricePerPiece - a.pricePerPiece);
      else if (sortBy === 'stock_desc') all.sort((a, b) => b.stockPcs - a.stockPcs);

      return { directMatches: all, relatedProducts: [] };
    }

    const { tokens, diameter: targetDia, lengthMm: targetLen, standard: targetStd, grade: targetGrd, category: targetCat } = parsedSearch;

    const directList: { product: Product; score: number }[] = [];
    const relatedList: { product: Product; score: number; reason: string; tone: 'blue' | 'amber' | 'emerald' | 'purple' }[] = [];

    const lowerQuery = query.toLowerCase();

    for (const p of products) {
      const pSku = p.sku.toLowerCase();
      const pName = p.name.toLowerCase();
      const pCategory = (p.category || '').toLowerCase();
      const pStandard = (p.standard || '').toLowerCase();
      const pDin = (p.din || '').toLowerCase();
      const pGrade = (p.grade || '').toLowerCase();
      const pFinish = (p.finish || '').toLowerCase();
      const pDia = (p.diameter || '').toLowerCase();
      const pSize = (p.sizeFormatted || '').toLowerCase();
      const pThread = (p.threadType || '').toLowerCase();

      const haystack = `${pSku} ${pName} ${pCategory} ${pStandard} ${pDin} ${pGrade} ${pFinish} ${pDia} ${pSize} ${pThread}`;

      // Check how many tokens match
      const matchedTokens = tokens.filter((t) => haystack.includes(t));
      const allTokensMatch = tokens.length > 0 && matchedTokens.length === tokens.length;

      if (allTokensMatch) {
        // DIRECT MATCH
        let score = 100;
        if (pSku === lowerQuery) score += 150;
        if (pName.includes(lowerQuery)) score += 60;
        if (targetDia && pDia === targetDia.toLowerCase()) score += 30;
        if (targetLen && p.lengthMm === targetLen) score += 25;
        if (targetStd && (pStandard.includes(targetStd.toLowerCase()) || pDin.includes(targetStd.toLowerCase()))) score += 20;
        if (p.isInStock && p.stockPcs > 0) score += 10;

        directList.push({ product: p, score });
      } else {
        // Check for RELATED Fasteners & Complementary Specifications
        let isRelated = false;
        let score = 0;
        let reason = '';
        let tone: 'blue' | 'amber' | 'emerald' | 'purple' = 'blue';

        // 1. Same Metric Diameter (Crucial for Fastener Assembly)
        if (targetDia && pDia === targetDia.toLowerCase()) {
          isRelated = true;

          // Mating Nut?
          if (pCategory.includes('nut') || pStandard.includes('934') || pName.includes('nut')) {
            reason = `🔗 Compatible ${p.diameter} Hex Nut (DIN 934)`;
            score = 95;
            tone = 'emerald';
          }
          // Mating Washer?
          else if (pCategory.includes('washer') || pName.includes('washer')) {
            reason = `⚙️ Compatible ${p.diameter} Plain Washer`;
            score = 90;
            tone = 'emerald';
          }
          // Same Standard, Alternative Length?
          else if (targetStd && (pStandard.includes(targetStd.toLowerCase()) || pDin.includes(targetStd.toLowerCase()))) {
            reason = `⚡ Same ${p.standard} · ${p.diameter}x${p.lengthMm}mm (Alt Length)`;
            score = 80;
            tone = 'blue';
          }
          // Same Diameter, Similar Category
          else {
            reason = `📏 Same ${p.diameter} Diameter (${p.standard || p.category})`;
            score = 70;
            tone = 'blue';
          }
        }
        // 2. Same Standard (e.g. DIN 933 or DIN 912)
        else if (targetStd && (pStandard.includes(targetStd.toLowerCase()) || pDin.includes(targetStd.toLowerCase()))) {
          isRelated = true;
          reason = `📋 Same ${p.standard} Specification (${p.sizeFormatted || p.diameter})`;
          score = 60;
          tone = 'purple';
        }
        // 3. High Token Overlap (e.g. matched 2 of 3 words)
        else if (tokens.length >= 2 && matchedTokens.length >= Math.ceil(tokens.length * 0.5)) {
          isRelated = true;
          reason = `🔍 Matches ${matchedTokens.length}/${tokens.length} search specs`;
          score = 50 + matchedTokens.length * 5;
          tone = 'amber';
        }
        // 4. Same Grade & Category
        else if (targetGrd && pGrade.includes(targetGrd.toLowerCase()) && targetCat && pCategory.includes(targetCat.toLowerCase())) {
          isRelated = true;
          reason = `🛡️ Same Grade ${p.grade} Fastener`;
          score = 45;
          tone = 'amber';
        }

        if (isRelated) {
          relatedList.push({ product: p, score, reason, tone });
        }
      }
    }

    // Sort Direct Matches
    directList.sort((a, b) => b.score - a.score);
    let finalDirect = directList.map((d) => d.product);

    // Apply active secondary filters to direct matches
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'surplus') {
        finalDirect = finalDirect.filter((p) => p.isSurplus);
      } else if (selectedCategory === 'din933') {
        finalDirect = finalDirect.filter((p) => p.standard === 'DIN 933' || p.name.includes('DIN 933'));
      } else if (selectedCategory === 'din931') {
        finalDirect = finalDirect.filter((p) => p.standard === 'DIN 931' || p.name.includes('DIN 931'));
      } else if (selectedCategory === 'din912') {
        finalDirect = finalDirect.filter((p) => p.standard === 'DIN 912' || p.name.includes('DIN 912'));
      } else if (selectedCategory === 'nuts') {
        finalDirect = finalDirect.filter((p) => p.category === 'Hex Nuts' || p.standard === 'DIN 934' || p.name.includes('DIN 934'));
      }
    }
    if (selectedStandard !== 'all') finalDirect = finalDirect.filter((p) => p.standard === selectedStandard);
    if (selectedGrade !== 'all') finalDirect = finalDirect.filter((p) => p.grade.toLowerCase().includes(selectedGrade.toLowerCase()));
    if (selectedFinish !== 'all') finalDirect = finalDirect.filter((p) => p.finish === selectedFinish);
    if (selectedDiameter !== 'all') finalDirect = finalDirect.filter((p) => p.diameter === selectedDiameter);
    if (inStockOnly) finalDirect = finalDirect.filter((p) => p.isInStock && p.stockPcs > 0);

    // Sort direct matches according to sortBy
    if (sortBy === 'price_asc') finalDirect.sort((a, b) => a.pricePerPiece - b.pricePerPiece);
    else if (sortBy === 'price_desc') finalDirect.sort((a, b) => b.pricePerPiece - a.pricePerPiece);
    else if (sortBy === 'stock_desc') finalDirect.sort((a, b) => b.stockPcs - a.stockPcs);

    // Sort Related Products by Score
    relatedList.sort((a, b) => b.score - a.score);

    // Deduplicate related items (make sure none appear in direct)
    const directIds = new Set(finalDirect.map((p) => p.id));
    const finalRelated = relatedList
      .filter((r) => !directIds.has(r.product.id))
      .slice(0, 24);

    return {
      directMatches: finalDirect,
      relatedProducts: finalRelated,
    };
  }, [
    products,
    searchQuery,
    parsedSearch,
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
    itemsPerPage,
  ]);

  // Paginated slice for direct matches
  const totalPages = Math.max(1, Math.ceil(directMatches.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return directMatches.slice(start, start + itemsPerPage);
  }, [directMatches, currentPage, itemsPerPage]);

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

  // Render Filter Form Content
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

          {/* Search Bar */}
          <div className="mt-4 sm:mt-6 relative max-w-3xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, SKU, Standard (DIN 933), Diameter (M10), Grade (8.8), or Finish..."
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

          {/* Quick search hints */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-blue-200 flex-wrap">
            <span className="font-semibold text-slate-300">Popular searches:</span>
            {['Hex Bolt M10', 'DIN 933 8.8', 'Socket Cap M8', 'DIN 934 Nut M12', 'SS 304 Bolt', 'Zinc Plated M16'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchQuery(term)}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              >
                {term}
              </button>
            ))}
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
                View ({directMatches.length}) Results
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
            <button
              type="button"
              onClick={() => setIsCustomRequestOpen(true)}
              className="inline-flex items-center gap-1.5 text-sky-400 font-bold hover:text-sky-300 transition-colors"
            >
              <span>Submit Custom Spec Request</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* PRODUCT GRID CONTAINER                                          */}
        {/* ============================================================== */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          
          {/* Status strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {searchQuery ? (
                <span>
                  Search results for &ldquo;<strong className="text-slate-900">{searchQuery}</strong>&rdquo;: <strong className="text-blue-700">{directMatches.length}</strong> direct {directMatches.length === 1 ? 'match' : 'matches'}
                  {relatedProducts.length > 0 && (
                    <span className="text-slate-500 ml-1.5">
                      (+ <strong className="text-amber-700 font-semibold">{relatedProducts.length}</strong> related specifications)
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  Showing <strong className="text-slate-900">{directMatches.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> - <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, directMatches.length)}</strong> of <strong className="text-slate-900">{directMatches.length}</strong> matching fasteners
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustomRequestOpen(true)}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] font-bold text-xs rounded-lg transition-colors border border-blue-200 flex items-center gap-1"
                title="Can't find your required fastener? Request custom dimensions."
              >
                <Plus size={13} />
                <span>Request Custom Spec</span>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-red-600 font-semibold hover:underline flex items-center gap-1 text-xs"
                >
                  <span>Clear filters</span>
                  <span>&times;</span>
                </button>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* CASE 1: ZERO DIRECT MATCHES -> HELPFUL RELATED RECOMMENDATIONS  */}
          {/* ============================================================== */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 h-80 animate-pulse" />
              ))}
            </div>
          ) : directMatches.length === 0 ? (
            <div className="space-y-6">
              {/* Notice Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/90 p-4 sm:p-6 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                    <HelpCircle size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mb-1">
                      No exact catalog match for &ldquo;{searchQuery || 'selected criteria'}&rdquo;
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                      {relatedProducts.length > 0 ? (
                        <>
                          We could not find an exact catalog item with that identical name or dimension. However, we found{' '}
                          <strong className="text-slate-900 font-bold">{relatedProducts.length} related fasteners</strong>{' '}
                          matching your specifications
                          {parsedSearch.diameter ? ` (Metric Diameter: ${parsedSearch.diameter})` : ''}
                          {parsedSearch.standard ? ` (Standard: ${parsedSearch.standard})` : ''}
                          {parsedSearch.grade ? ` (Grade: ${parsedSearch.grade})` : ''}:
                        </>
                      ) : (
                        <>
                          Looking for a non-standard length, custom thread pitch, or special alloy grade? Our manufacturing facility forges custom fasteners and onboards new ERP specs.
                        </>
                      )}
                    </p>

                    {/* Action buttons inside banner */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsCustomRequestOpen(true)}
                        className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <Sparkles size={14} />
                        <span>Request Custom Specification (1-Click)</span>
                      </button>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-3 py-2 rounded-xl text-xs transition-colors"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Render Related Products when zero direct matches */}
              {relatedProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Compass size={17} className="text-[#0052CC]" />
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        Related Fasteners &amp; Alternative Specifications ({relatedProducts.length})
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Similar diameter, standard, or mating nuts/washers
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                    {relatedProducts.map(({ product: p, reason, tone }) => (
                      <FastenerCard
                        key={`zero-rel-${p.id}`}
                        product={p}
                        currentUnit={getCardUnit(p.id)}
                        currentQty={getCardQty(p.id)}
                        onToggleUnit={(u) => toggleCardUnit(p.id, u)}
                        onAdjustQty={(delta) => adjustCardQty(p.id, delta)}
                        onAddToCart={handleAddToCart}
                        relatedBadge={reason}
                        badgeTone={tone}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* CASE 2: DIRECT MATCHES GRID + RELATED SPECIFICATIONS SECTION    */
            /* ============================================================== */
            <div className="space-y-8">
              {/* Direct Matches Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {paginatedProducts.map((p) => (
                  <FastenerCard
                    key={p.id}
                    product={p}
                    currentUnit={getCardUnit(p.id)}
                    currentQty={getCardQty(p.id)}
                    onToggleUnit={(u) => toggleCardUnit(p.id, u)}
                    onAdjustQty={(delta) => adjustCardQty(p.id, delta)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Responsive Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
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
                      <option value={directMatches.length || 100}>All ({directMatches.length})</option>
                    </select>
                    <span className="text-slate-400 text-[11px]">
                      (Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>)
                    </span>
                  </div>

                  {/* Page Navigation Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
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

              {/* ============================================================== */}
              {/* DEDICATED RELATED FASTENERS & COMPLEMENTARY SECTION            */}
              {/* ============================================================== */}
              {searchQuery && relatedProducts.length > 0 && (
                <div className="pt-6 border-t-2 border-slate-200/80">
                  <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 rounded-2xl border border-blue-200/70 p-4 sm:p-5 mb-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link2 size={18} className="text-[#0052CC]" />
                          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                            Related Fasteners &amp; Complementary Specifications
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Fasteners with compatible {parsedSearch.diameter || 'matching'} diameter, mating hex nuts &amp; washers, and alternative DIN lengths for &ldquo;{searchQuery}&rdquo;.
                        </p>
                      </div>

                      {relatedProducts.length > 8 && (
                        <button
                          type="button"
                          onClick={() => setShowAllRelated((prev) => !prev)}
                          className="self-start sm:self-center px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-[#0052CC] font-bold text-xs rounded-xl transition-colors shadow-2xs whitespace-nowrap"
                        >
                          {showAllRelated ? 'Show Fewer' : `View All (${relatedProducts.length})`}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                    {(showAllRelated ? relatedProducts : relatedProducts.slice(0, 8)).map(
                      ({ product: p, reason, tone }) => (
                        <FastenerCard
                          key={`related-${p.id}`}
                          product={p}
                          currentUnit={getCardUnit(p.id)}
                          currentQty={getCardQty(p.id)}
                          onToggleUnit={(u) => toggleCardUnit(p.id, u)}
                          onAdjustQty={(delta) => adjustCardQty(p.id, delta)}
                          onAddToCart={handleAddToCart}
                          relatedBadge={reason}
                          badgeTone={tone}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
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

      {/* Custom Fastener Request Modal */}
      <CustomProductRequestModal
        isOpen={isCustomRequestOpen}
        onClose={() => setIsCustomRequestOpen(false)}
        sourceContext="CATALOG"
        initialCategory={parsedSearch.category || (selectedCategory !== 'all' ? selectedCategory : undefined)}
        initialDiameter={parsedSearch.diameter}
        initialLengthMm={parsedSearch.lengthMm}
        initialStandard={parsedSearch.standard}
        initialSearchQuery={searchQuery || undefined}
      />
    </div>
  );
}

// ============================================================================
// MAIN PAGE EXPORT WITH SUSPENSE BOUNDARY (NEXT.JS APP ROUTER)
// ============================================================================

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-600 font-mono">Loading Fasteners Catalog Grid...</p>
        </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}
