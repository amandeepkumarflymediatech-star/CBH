'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Copy,
  Check,
  RefreshCw,
  Flame,
  Layers,
  FileText,
  Sliders,
  Compass,
  DollarSign,
  Package,
  Camera,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  CheckCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { Product } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';

const FASTENER_IMAGE_PRESETS = [
  { label: 'Hex Bolt (DIN 933 Zinc)', url: '/assets/bolt_zinc.jpg' },
  { label: 'Anchor Bolt (Heavy Duty)', url: '/assets/anchor_bolt.jpg' },
  { label: 'Socket Cap (DIN 912)', url: '/assets/products/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g.png' },
  { label: 'Flange Bolt (High-Tensile)', url: '/assets/products/1ITZ9-R797BC3OIbAZD4utchxvf4eUwRT.png' },
  { label: 'Stud Bolt & Heavy Hex Nut', url: '/assets/products/1cM0hddDO7TQq_s7ceszHilx-XZYgqnHE.png' },
  { label: 'HDG Structural Bolt', url: '/assets/products/13HRW3hq2RbTFB-gMmEZuvPDxL4hItUrY.png' },
];

export interface FastenerFormProps {
  mode: 'new' | 'edit';
  productId?: number;
}

const SECTIONS = [
  { id: 'section-01', num: '01', title: 'Classification & Brand', icon: Layers },
  { id: 'section-02', num: '02', title: 'Standards (DIN/ISO)', icon: FileText },
  { id: 'section-03', num: '03', title: 'Dimensions & Size', icon: Compass },
  { id: 'section-04', num: '04', title: 'Grade & Finish', icon: Sliders },
  { id: 'section-05', num: '05', title: 'Weights & Pricing', icon: DollarSign },
  { id: 'section-06', num: '06', title: 'Packaging & Supply', icon: Package },
  { id: 'section-07', num: '07', title: 'Photo & CAD', icon: Camera },
  { id: 'section-08', num: '08', title: 'Review & Audit Matrix', icon: ClipboardCheck },
];

export default function FastenerForm({ mode, productId }: FastenerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedSku, setCopiedSku] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('section-01');

  // Form Fields State
  const [form, setForm] = useState({
    sku: '',
    name: '',
    subGroup: 'SCREW',
    category: 'Hex Screws',
    subCategory: 'SOCKET SET SCREWS',
    standard: 'DIN 933',
    din: 'DIN 933',
    isoStandard: 'ISO 4017',
    bsStandard: '',
    asmeStandard: '',
    threadType: 'Full Thread',
    threadLength: 'FULL THREAD',
    diameter: 'M10',
    pitchMm: '1.5',
    lengthMm: '100',
    sizeFormatted: 'M10X1.5X100',
    grade: '8.8',
    finish: 'Black Passivated (BP)',
    weightPerPcKg: '0.0601',
    weightPer1000PcsKg: '60.1',
    pricePerPiece: '6.50',
    pricePerKg: '108.00',
    price100Pcs: '650.00',
    price1000Pcs: '6500.00',
    pcsPerBox: '500',
    smallBoxWeightKg: '2.5',
    pcsPerMasterCtn: '4000',
    masterCtnWeightKg: '20.0',
    moq: '25 KGS',
    leadTimeDays: '10',
    productionDays: '7',
    packingDays: '3',
    stockPcs: '15000',
    isSurplus: false,
    surplusDiscountPct: '35',
    brand: 'CBH',
    hsnCode: '73181500',
    drawingUrl: '',
    gdriveImageUrl: '',
    imageUrl: '/assets/bolt_zinc.jpg',
    descriptionHtml: '',
  });

  // Image Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [isCustomUrlOpen, setIsCustomUrlOpen] = useState(false);
  const [withWatermark, setWithWatermark] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load product if editing
  useEffect(() => {
    if (mode === 'edit' && productId) {
      setIsLoading(true);
      fetch(`/api/products?id=${productId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const p: Product = json.data[0];
            setForm({
              sku: p.sku || '',
              name: p.name || '',
              subGroup: p.subGroup || 'SCREW',
              category: p.category || 'Hex Screws',
              subCategory: p.subCategory || '',
              standard: p.standard || 'DIN 933',
              din: p.din || '',
              isoStandard: p.isoStandard || '',
              bsStandard: p.bsStandard || '',
              asmeStandard: p.asmeStandard || '',
              threadType: p.threadType || 'Full Thread',
              threadLength: p.threadLength || 'FULL THREAD',
              diameter: p.diameter || 'M10',
              pitchMm: String(p.pitchMm || 1.5),
              lengthMm: String(p.lengthMm || 100),
              sizeFormatted: p.sizeFormatted || `${p.diameter}x${p.lengthMm}`,
              grade: p.grade || '8.8',
              finish: p.finish || 'Black Passivated (BP)',
              weightPerPcKg: String(p.weightPerPcKg || 0.06),
              weightPer1000PcsKg: String(p.weightPer1000PcsKg || 60),
              pricePerPiece: String(p.pricePerPiece || 5),
              pricePerKg: String(p.pricePerKg || 100),
              price100Pcs: String(p.price100Pcs || 500),
              price1000Pcs: String(p.price1000Pcs || 5000),
              pcsPerBox: String(p.pcsPerBox || 500),
              smallBoxWeightKg: String(p.smallBoxWeightKg || 2.5),
              pcsPerMasterCtn: String(p.pcsPerMasterCtn || 4000),
              masterCtnWeightKg: String(p.masterCtnWeightKg || 20),
              moq: p.moq || '25 KGS',
              leadTimeDays: String(p.leadTimeDays || 10),
              productionDays: String(p.productionDays || 7),
              packingDays: String(p.packingDays || 3),
              stockPcs: String(p.stockPcs || 0),
              isSurplus: Boolean(p.isSurplus),
              surplusDiscountPct: String(p.surplusDiscountPct || 0),
              brand: p.brand || 'CBH',
              hsnCode: p.hsnCode || '73181500',
              drawingUrl: p.drawingUrl || '',
              gdriveImageUrl: p.gdriveImageUrl || '',
              imageUrl: p.imageUrl || '/assets/bolt_zinc.jpg',
              descriptionHtml: p.descriptionHtml || '',
            });
          } else {
            showNotification('Could not load product details', 'error');
          }
        })
        .catch(() => {
          showNotification('Error loading fastener from database', 'error');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [mode, productId]);

  // Scroll spy for sticky section navigator
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90; // offset for sticky top bar
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const copySkuToClipboard = () => {
    const skuToCopy = form.sku || 'AUTO-SKU';
    navigator.clipboard.writeText(skuToCopy);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (withWatermark) {
        formData.append('watermark', 'true');
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
        showNotification(withWatermark ? 'Fastener image uploaded with CBH Watermark!' : 'Fastener image uploaded successfully!');
      } else {
        showNotification(data.error || 'Upload failed', 'error');
      }
    } catch {
      showNotification('Network error uploading file', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const weight = parseFloat(form.weightPerPcKg) || 0.06;
      const stockPcs = parseInt(form.stockPcs) || 0;
      const pricePc = parseFloat(form.pricePerPiece) || 5.0;
      const priceKg = parseFloat(form.pricePerKg) || 100.0;
      const prodDays = parseInt(form.productionDays) || 7;
      const packDays = parseInt(form.packingDays) || 3;
      const leadTime = parseInt(form.leadTimeDays) || prodDays + packDays;

      const generatedSku =
        form.sku.trim() ||
        `CBH-${(form.din || form.standard || 'STD').replace(/\s+/g, '')}-${form.diameter}-${form.lengthMm}-${Math.floor(
          100 + Math.random() * 900
        )}`;

      const formattedSize =
        form.sizeFormatted.trim() || `${form.diameter}X${form.pitchMm}X${form.lengthMm}`;

      const payload = {
        sku: generatedSku.toUpperCase(),
        name:
          form.name.trim() ||
          `${form.standard} ${form.diameter}x${form.lengthMm}mm Grade ${form.grade} ${form.finish}`,
        subGroup: form.subGroup,
        category: form.category,
        subCategory: form.subCategory,
        standard: form.standard,
        din: form.din,
        isoStandard: form.isoStandard,
        bsStandard: form.bsStandard,
        asmeStandard: form.asmeStandard,
        grade: form.grade,
        finish: form.finish,
        threadType: form.threadType,
        threadLength: form.threadLength,
        diameter: form.diameter,
        lengthMm: parseInt(form.lengthMm) || 100,
        pitchMm: parseFloat(form.pitchMm) || 1.5,
        sizeFormatted: formattedSize,
        weightPerPcKg: weight,
        weightPer1000PcsKg: parseFloat(form.weightPer1000PcsKg) || +(weight * 1000).toFixed(3),
        pricePerPiece: pricePc,
        originalPricePerPiece: +(pricePc * 1.15).toFixed(2),
        pricePerKg: priceKg,
        originalPricePerKg: +(priceKg * 1.15).toFixed(2),
        price100Pcs: parseFloat(form.price100Pcs) || +(pricePc * 100).toFixed(2),
        price1000Pcs: parseFloat(form.price1000Pcs) || +(pricePc * 1000).toFixed(2),
        stockPcs: stockPcs,
        stockKg: +(stockPcs * weight).toFixed(2),
        stockUom: 'Nos',
        isInStock: stockPcs > 0,
        isSurplus: form.isSurplus,
        surplusDiscountPct: form.isSurplus ? parseInt(form.surplusDiscountPct) || 35 : 0,
        pcsPerBox: form.pcsPerBox,
        smallBoxWeightKg: parseFloat(form.smallBoxWeightKg) || 2.5,
        pcsPerMasterCtn: form.pcsPerMasterCtn,
        masterCtnWeightKg: parseFloat(form.masterCtnWeightKg) || 20.0,
        moq: form.moq || '25 KGS',
        leadTimeDays: leadTime,
        productionDays: prodDays,
        packingDays: packDays,
        brand: form.brand || 'CBH',
        hsnCode: form.hsnCode || '73181500',
        drawingUrl: form.drawingUrl,
        gdriveImageUrl: form.gdriveImageUrl,
        imageUrl: form.imageUrl || '/assets/bolt_zinc.jpg',
        descriptionHtml: form.descriptionHtml,
      };

      if (mode === 'edit' && productId) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: productId }),
        });
        const data = await res.json();
        if (data.success) {
          showNotification(`Fastener SKU "${payload.sku}" updated successfully!`);
          setTimeout(() => {
            router.push('/admin/products');
          }, 800);
        } else {
          showNotification(data.error || 'Failed to update fastener.', 'error');
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification(`Fastener SKU "${payload.sku}" registered in catalog!`);
          setTimeout(() => {
            router.push('/admin/products');
          }, 800);
        } else {
          showNotification(data.error || 'Failed to create fastener.', 'error');
        }
      }
    } catch {
      showNotification('Network error saving fastener', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <RefreshCw className="w-7 h-7 text-[#0052CC] animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Loading Fastener Master Specifications...</h3>
        <p className="text-xs text-slate-400 mt-1">Reading attributes from central catalog</p>
      </div>
    );
  }

  // Completeness check indicators
  const sectionStatus = {
    'section-01': Boolean(form.name.trim() && form.category.trim()),
    'section-02': Boolean(form.standard.trim()),
    'section-03': Boolean(form.diameter.trim() && form.lengthMm),
    'section-04': Boolean(form.grade && form.finish),
    'section-05': Boolean(form.pricePerPiece && form.weightPerPcKg),
    'section-06': Boolean(form.pcsPerBox && form.leadTimeDays),
    'section-07': Boolean(form.imageUrl),
    'section-08': true,
  };

  const completedCount = Object.values(sectionStatus).filter(Boolean).length;

  return (
    <div className="w-full pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={15} className="text-emerald-400" />
          ) : (
            <AlertCircle size={15} className="text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* TOP STICKY BAR: Instant Actions & Live Telemetry */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 -mx-4 -mt-4 px-4 py-3 sm:-mx-6 sm:-mt-6 sm:px-6 mb-5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/admin/products"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0"
              title="Back to Products Catalog"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {mode === 'new' ? 'Register New Fastener' : `Edit Fastener: ${form.sku}`}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0 hidden sm:inline-block">
                  Continuous Sheet (All 7 Sections)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                Single unified view for rapid admin audit, inspection, and specification publishing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <div className="hidden xl:flex items-center gap-2 text-xs font-mono mr-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-sans text-[11px]">Rate:</span>
              <span className="font-bold text-emerald-700">{formatINR(parseFloat(form.pricePerPiece) || 0)}/pc</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-sans text-[11px]">Stock:</span>
              <span className="font-bold text-slate-800">{(parseInt(form.stockPcs) || 0).toLocaleString()}</span>
            </div>

            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              {completedCount}/8 Sections
            </span>

            <Link
              href="/admin/products"
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{isSaving ? 'Saving...' : mode === 'new' ? 'Register Fastener' : 'Update Fastener'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Quick-Jump Pill Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 mt-2 border-t border-slate-100 lg:hidden">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                activeSection === sec.id
                  ? 'bg-[#0052CC] text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec.num}. {sec.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2-COLUMN CONTINUOUS LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Sticky Anchor Navigator & Telemetry Rail */}
        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-20 space-y-4">
          {/* Table of Contents Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5 space-y-1">
            <div className="px-2 py-1 mb-1 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Form Navigation</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                Single Sheet
              </span>
            </div>

            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              const isDone = sectionStatus[sec.id as keyof typeof sectionStatus];

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-[#0052CC] font-bold border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`font-mono text-[10px] ${isActive ? 'text-[#0052CC]' : 'text-slate-400'}`}>
                      {sec.num}
                    </span>
                    <Icon size={13} className={isActive ? 'text-[#0052CC]' : 'text-slate-400 group-hover:text-slate-600'} />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  {isDone ? (
                    <Check size={12} className="text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Live Commercial Quick Preview Card */}
          <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0">
                <Image
                  src={form.imageUrl || '/assets/bolt_zinc.jpg'}
                  alt={form.sku || 'Fastener'}
                  width={34}
                  height={34}
                  className="max-h-full max-w-full object-contain"
                  unoptimized
                  onError={(e) => {
                    try {
                      (e.target as any).src = '/assets/bolt_zinc.jpg';
                    } catch {}
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-bold text-blue-300 truncate" title={form.sku || 'AUTO-SKU'}>
                    {form.sku || 'AUTO-SKU'}
                  </span>
                  <button
                    type="button"
                    onClick={copySkuToClipboard}
                    className="text-slate-400 hover:text-white"
                    title="Copy SKU"
                  >
                    {copiedSku ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  {form.standard} • Grade {form.grade}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Rate / Pc</span>
                <span className="font-bold text-emerald-400">{formatINR(parseFloat(form.pricePerPiece) || 0)}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Rate / Kg</span>
                <span className="font-bold text-blue-300">{formatINR(parseFloat(form.pricePerKg) || 0)}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Live Stock</span>
                <span className="font-bold text-slate-200">{(parseInt(form.stockPcs) || 0).toLocaleString()} pcs</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Dispatch</span>
                <span className="font-bold text-amber-300">{form.leadTimeDays || '10'} Days</span>
              </div>
            </div>

            {form.isSurplus && (
              <div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-[10px] text-amber-300 font-bold flex items-center gap-1">
                <Flame size={12} className="text-amber-400" />
                <span>Surplus Deal: {form.surplusDiscountPct}% OFF</span>
              </div>
            )}
          </div>

          {/* Quick Submit Actions */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs space-y-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{isSaving ? 'Saving...' : mode === 'new' ? 'Register Fastener' : 'Update Fastener'}</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('section-08')}
              className="w-full py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ClipboardCheck size={13} className="text-slate-500" />
              <span>Jump to Audit Matrix</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Continuous Scrollable Master Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-9 space-y-6">
          {/* ========================================================== */}
          {/* SECTION 1: CLASSIFICATION & BRAND */}
          {/* ========================================================== */}
          <div
            id="section-01"
            className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-xs scroll-mt-24 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-[#0052CC] border border-blue-200 font-mono text-xs font-bold flex items-center justify-center">
                  01
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Classification &amp; Brand Origin</h2>
                  <p className="text-xs text-slate-500">Core catalog taxonomy, family grouping, and HSN code.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Identity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div className="sm:col-span-2 md:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">
                  Product Title / Master Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hex Head Screws DIN 933 M10x100mm Grade 8.8 Black Passivated"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC] font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">SKU Code</label>
                <input
                  type="text"
                  placeholder="e.g. CBH-933-M10-100-8.8"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Auto-generated if left blank</span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Sub-Group / Family</label>
                <select
                  value={form.subGroup}
                  onChange={(e) => setForm({ ...form, subGroup: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC] font-semibold"
                >
                  <option value="SCREW">SCREW</option>
                  <option value="BOLT">BOLT</option>
                  <option value="NUT">NUT</option>
                  <option value="WASHER">WASHER</option>
                  <option value="STUD">STUD</option>
                  <option value="ANCHOR">ANCHOR</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Hex Screws, Hex Bolts"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Sub-Category</label>
                <input
                  type="text"
                  value={form.subCategory}
                  onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                  placeholder="e.g. SOCKET SET SCREWS"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Brand Origin</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">HSN Code</label>
                <input
                  type="text"
                  value={form.hsnCode}
                  onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* SECTION 2: STANDARDS (DIN/ISO/BS/ASME) */}
          {/* ========================================================== */}
          <div
            id="section-02"
            className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-xs scroll-mt-24 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-[#0052CC] border border-blue-200 font-mono text-xs font-bold flex items-center justify-center">
                  02
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Standards &amp; Norms Concordance</h2>
                  <p className="text-xs text-slate-500">DIN, ISO, British, and American ASME standard cross-references.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Compliance
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Primary Standard Spec <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.standard}
                  onChange={(e) => setForm({ ...form, standard: e.target.value })}
                  placeholder="e.g. DIN 933"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">DIN Standard Code</label>
                <input
                  type="text"
                  value={form.din}
                  onChange={(e) => setForm({ ...form, din: e.target.value })}
                  placeholder="e.g. DIN 933"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">ISO Standard Equivalence</label>
                <input
                  type="text"
                  value={form.isoStandard}
                  onChange={(e) => setForm({ ...form, isoStandard: e.target.value })}
                  placeholder="e.g. ISO 4017"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">BS Standard (Optional)</label>
                <input
                  type="text"
                  value={form.bsStandard}
                  onChange={(e) => setForm({ ...form, bsStandard: e.target.value })}
                  placeholder="e.g. BS 3692"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">ASME / ANSI Standard (Optional)</label>
                <input
                  type="text"
                  value={form.asmeStandard}
                  onChange={(e) => setForm({ ...form, asmeStandard: e.target.value })}
                  placeholder="e.g. ASME B18.2.1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* SECTION 3: DIMENSIONS & SIZE */}
          {/* ========================================================== */}
          <div
            id="section-03"
            className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-xs scroll-mt-24 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-[#0052CC] border border-blue-200 font-mono text-xs font-bold flex items-center justify-center">
                  03
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Engineering Dimensions &amp; Geometry</h2>
                  <p className="text-xs text-slate-500">Nominal diameter, thread pitch, length, and thread engagement type.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Geometry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nominal Diameter (DIA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.diameter}
                  onChange={(e) => {
                    const dia = e.target.value;
                    setForm({
                      ...form,
                      diameter: dia,
                      sizeFormatted: `${dia}X${form.pitchMm}X${form.lengthMm}`,
                    });
                  }}
                  placeholder="e.g. M10 or 1/2''"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nominal Length (mm) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={form.lengthMm}
                  onChange={(e) => {
                    const len = e.target.value;
                    setForm({
                      ...form,
                      lengthMm: len,
                      sizeFormatted: `${form.diameter}X${form.pitchMm}X${len}`,
                    });
                  }}
                  placeholder="100"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Thread Pitch (mm)</label>
                <input
                  type="number"
                  step="0.05"
                  value={form.pitchMm}
                  onChange={(e) => {
                    const pitch = e.target.value;
                    setForm({
                      ...form,
                      pitchMm: pitch,
                      sizeFormatted: `${form.diameter}X${pitch}X${form.lengthMm}`,
                    });
                  }}
                  placeholder="1.5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Formatted Size String</label>
                <input
                  type="text"
                  value={form.sizeFormatted}
                  onChange={(e) => setForm({ ...form, sizeFormatted: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-[#0052CC] focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Thread Type</label>
                <select
                  value={form.threadType}
                  onChange={(e) => setForm({ ...form, threadType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                >
                  <option value="Full Thread">Full Thread</option>
                  <option value="Half Thread">Half Thread / Partial</option>
                  <option value="Fine Pitch">Fine Pitch</option>
                  <option value="UNC / BSW Coarse">UNC / BSW Coarse</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Thread Length Spec</label>
                <input
                  type="text"
                  value={form.threadLength}
                  onChange={(e) => setForm({ ...form, threadLength: e.target.value })}
                  placeholder="FULL THREAD or 38mm"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* SECTION 4: METALLURGY (GRADE & FINISH) */}
          {/* ========================================================== */}
          <div
            id="section-04"
            className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-xs scroll-mt-24 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-[#0052CC] border border-blue-200 font-mono text-xs font-bold flex items-center justify-center">
                  04
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Metallurgy, Property Class &amp; Coating</h2>
                  <p className="text-xs text-slate-500">Tensile rating, steel alloy class, and corrosion-resistant surface finish.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Material
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Property Class / Grade <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#0052CC]"
                >
                  <option value="4.6">Grade 4.6 (Mild Steel)</option>
                  <option value="8.8">Grade 8.8 (High-Tensile Carbon Steel)</option>
                  <option value="10.9">Grade 10.9 (Structural Heavy Duty)</option>
                  <option value="12.9">Grade 12.9 (Ultra High-Tensile Alloy)</option>
                  <option value="SS 304">SS 304 / A2-70 (Stainless Steel)</option>
                  <option value="SS 316">SS 316 / A4-80 (Marine Acid-Resistant)</option>
                  <option value="B7">ASTM A193 B7 (High Pressure / Temperature)</option>
                  <option value="2H">ASTM A194 Grade 2H</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Surface Coating / Finish <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.finish}
                  onChange={(e) => setForm({ ...form, finish: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                >
                  <option value="Black Passivated (BP)">Black Passivated (BP / Self)</option>
                  <option value="Zinc Plated (Clear / White)">Zinc Plated (Clear / White 5-8 microns)</option>
                  <option value="Yellow Zinc / Trivalent">Yellow Zinc / Trivalent Chromate</option>
                  <option value="Hot-Dip Galvanized (HDG)">Hot-Dip Galvanized (HDG 45+ microns)</option>
                  <option value="PTFE / Xylan Fluoropolymer">PTFE / Xylan Fluoropolymer</option>
                  <option value="Self Natural / Plain">Self Natural / Plain</option>
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* SECTION 5: WEIGHTS & PRICING */}
          {/* ========================================================== */}
          <div
            id="section-05"
            className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-xs scroll-mt-24 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-[#0052CC] border border-blue-200 font-mono text-xs font-bold flex items-center justify-center">
                  05
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Weight Telemetry, Pricing &amp; Inventory</h2>
                  <p className="text-xs text-slate-500">Commercial rates per piece/Kg, live inventory, and surplus clearance status.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Commercials
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Rate Per Piece (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.pricePerPiece}
                  onChange={(e) => {
                    const pc = e.target.value;
                    const numPc = parseFloat(pc) || 0;
                    setForm({
                      ...form,
                      pricePerPiece: pc,
                      price100Pcs: (numPc * 100).toFixed(2),
                      price1000Pcs: (numPc * 1000).toFixed(2),
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-blue-700 focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Rate Per Kg (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.pricePerKg}
                  onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700 focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Weight Per Piece (Kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={form.weightPerPcKg}
                  onChange={(e) => {
                    const w = e.target.value;
                    const numW = parseFloat(w) || 0;
                    setForm({
                      ...form,
                      weightPerPcKg: w,
                      weightPer1000PcsKg: (numW * 1000).toFixed(3),
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Weight / 1000 Pcs (Kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.weightPer1000PcsKg}
                  onChange={(e) => setForm({ ...form, weightPer1000PcsKg: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">100 Pcs Bulk (₹)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.price100Pcs}
                  onChange={(e) => setForm({ ...form, price100Pcs: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">1000 Pcs Bulk (₹)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.price1000Pcs}
                  onChange={(e) => setForm({ ...form, price1000Pcs: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Stock Quantity (Pcs) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={form.stockPcs}
                  onChange={(e) => setForm({ ...form, stockPcs: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Calculated Stock (Kg)</label>
                <input
                  type="text"
                  disabled
                  value={`${((parseInt(form.stockPcs) || 0) * (parseFloat(form.weightPerPcKg) || 0.06)).toFixed(1)} Kg`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Surplus Deal Setting */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isSurplus}
                  onChange={(e) => setForm({ ...form, isSurplus: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <Flame size={14} className="text-amber-600" />
                  Mark as Surplus Clearance Liquidation Deal
                </span>
              </label>

              {form.isSurplus && (
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-700 text-xs whitespace-nowrap">Clearance Discount %:</label>
                  <input
                    type="number"
                    min="15"
                    max="75"
                    value={form.surplusDiscountPct}
                    onChange={(e) => setForm({ ...form, surplusDiscountPct: e.target.value })}
                    className="w-20 px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-mono font-bold text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ========================================================== */}
          {/* SECTION 6: PACKAGING & SUPPLY */}
          {/* ========================================================== */}
          <div
            id="section-06"
            className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-xs scroll-mt-24 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-[#0052CC] border border-blue-200 font-mono text-xs font-bold flex items-center justify-center">
                  06
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">B2B Packaging &amp; Order Quantities</h2>
                  <p className="text-xs text-slate-500">Box count, master carton packing, MOQ, and manufacturing lead times.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Logistics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Small Box Pack (Pcs)</label>
                <input
                  type="number"
                  value={form.pcsPerBox}
                  onChange={(e) => setForm({ ...form, pcsPerBox: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Small Box Weight (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.smallBoxWeightKg}
                  onChange={(e) => setForm({ ...form, smallBoxWeightKg: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Master Carton (Pcs)</label>
                <input
                  type="number"
                  value={form.pcsPerMasterCtn}
                  onChange={(e) => setForm({ ...form, pcsPerMasterCtn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Master Carton Weight (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.masterCtnWeightKg}
                  onChange={(e) => setForm({ ...form, masterCtnWeightKg: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Minimum Order Qty (MOQ)</label>
                <input
                  type="text"
                  value={form.moq}
                  onChange={(e) => setForm({ ...form, moq: e.target.value })}
                  placeholder="25 KGS or 1000 PCS"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Production Days</label>
                <input
                  type="number"
                  value={form.productionDays}
                  onChange={(e) => {
                    const p = e.target.value;
                    const numP = parseInt(p) || 0;
                    const numPack = parseInt(form.packingDays) || 0;
                    setForm({
                      ...form,
                      productionDays: p,
                      leadTimeDays: String(numP + numPack),
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Packing Days</label>
                <input
                  type="number"
                  value={form.packingDays}
                  onChange={(e) => {
                    const pk = e.target.value;
                    const numPk = parseInt(pk) || 0;
                    const numProd = parseInt(form.productionDays) || 0;
                    setForm({
                      ...form,
                      packingDays: pk,
                      leadTimeDays: String(numProd + numPk),
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Total Dispatch Lead Time</label>
                <input
                  type="number"
                  value={form.leadTimeDays}
                  onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* SECTION 7: PHOTO & CAD BLUEPRINTS */}
          {/* ========================================================== */}
          <div
            id="section-07"
            className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-xs scroll-mt-24 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-[#0052CC] border border-blue-200 font-mono text-xs font-bold flex items-center justify-center">
                  07
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Fastener Photo &amp; CAD Blueprints</h2>
                  <p className="text-xs text-slate-500">Upload or link high-resolution product photos and dimensional blueprints.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Media &amp; CAD
              </span>
            </div>

            {/* Photo Selection / Upload Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <label className="block font-bold text-slate-800 text-xs">Product Photo Thumbnail</label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 relative overflow-hidden shadow-xs">
                  <Image
                    src={form.imageUrl || '/assets/bolt_zinc.jpg'}
                    alt="Fastener preview"
                    width={80}
                    height={80}
                    className="max-h-full max-w-full object-contain"
                    unoptimized
                    onError={(e) => {
                      try {
                        (e.target as any).src = '/assets/bolt_zinc.jpg';
                      } catch {}
                    }}
                  />

                  {/* Watermark overlay - transparent & center */}
                  {withWatermark && form.imageUrl && (
                    <div
                      title="CBH Watermark applied transparent & center"
                      className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 z-10"
                    >
                      <img
                        src="/assets/cbh-watermark.png"
                        alt="CBH Watermark"
                        className="w-16 max-w-[60%] h-auto block"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isUploading ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => setIsCustomUrlOpen(!isCustomUrlOpen)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      {isCustomUrlOpen ? 'Hide URL input' : 'Enter Custom Image URL'}
                    </button>
                  </div>

                  {/* Watermark Toggle */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-blue-900">
                      <input
                        type="checkbox"
                        checked={withWatermark}
                        onChange={(e) => setWithWatermark(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                      <span>Apply Transparent Center CBH Watermark</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <img
                        src="/assets/cbh-watermark.png"
                        alt="Watermark preview"
                        className="h-4 w-auto object-contain"
                      />
                      <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                        {withWatermark ? 'Active' : 'Off'}
                      </span>
                    </div>
                  </div>

                  {isCustomUrlOpen && (
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  )}

                  {/* Preset Quick Selectors */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Standard library presets:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {FASTENER_IMAGE_PRESETS.map((p) => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() => setForm({ ...form, imageUrl: p.url })}
                          className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all ${
                            form.imageUrl === p.url
                              ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CAD Drawing URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">CAD Blueprint Drawing URL (PDF/DXF)</label>
                <input
                  type="text"
                  value={form.drawingUrl}
                  onChange={(e) => setForm({ ...form, drawingUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Google Drive Asset Link (Optional)</label>
                <input
                  type="text"
                  value={form.gdriveImageUrl}
                  onChange={(e) => setForm({ ...form, gdriveImageUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* SECTION 8: MASTER AUDIT & REVIEW MATRIX (Continuous Flow) */}
          {/* ========================================================== */}
          <div
            id="section-08"
            className="bg-white rounded-xl border-2 border-blue-600/30 p-4 sm:p-6 shadow-sm scroll-mt-24 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-[#0052CC] text-white font-mono text-xs font-bold flex items-center justify-center">
                  08
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Master Fastener Audit &amp; Review Sheet</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Pre-Publish Inspection
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comprehensive cross-check of all 7 specification dimensions before catalog commit.
                  </p>
                </div>
              </div>
            </div>

            {/* Master Review Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Box 1: Taxonomy */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. Taxonomy &amp; Brand</div>
                <div className="font-bold text-slate-800">{form.name || 'Untitled Fastener'}</div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#0052CC]">{form.subGroup}</span>
                  <span>•</span>
                  <span>{form.category}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Brand: <strong className="text-slate-700">{form.brand}</strong> | HSN: <strong className="font-mono text-slate-700">{form.hsnCode}</strong>
                </div>
              </div>

              {/* Box 2: Standards & Size */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2 &amp; 3. Standards &amp; Size</div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {form.standard || 'DIN'} {form.isoStandard ? `| ${form.isoStandard}` : ''}
                </div>
                <div className="text-slate-700 font-mono font-bold">
                  {form.diameter} x {form.pitchMm}P x {form.lengthMm}mm
                </div>
                <div className="text-[11px] text-slate-500">
                  Format: <span className="font-mono text-blue-700">{form.sizeFormatted}</span> ({form.threadType})
                </div>
              </div>

              {/* Box 3: Grade & Metallurgy */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">4. Metallurgy &amp; Finish</div>
                <div className="font-bold text-slate-800 text-sm">Grade {form.grade}</div>
                <div className="text-slate-600">{form.finish}</div>
                <div className="text-[11px] text-slate-500">
                  Unit Weight: <strong className="font-mono text-slate-800">{form.weightPerPcKg} kg</strong> (
                  {form.weightPer1000PcsKg} kg/1000)
                </div>
              </div>

              {/* Box 4: Commercials & Packaging */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">5 &amp; 6. Pricing &amp; Supply</div>
                <div className="font-bold text-emerald-700 text-sm">
                  {formatINR(parseFloat(form.pricePerPiece) || 0)} / pc
                </div>
                <div className="text-slate-600 font-mono">
                  {formatINR(parseFloat(form.pricePerKg) || 0)} / kg | Stock: {(parseInt(form.stockPcs) || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">
                  Box: <strong>{form.pcsPerBox} pcs</strong> | Lead Time: <strong>{form.leadTimeDays} days</strong>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-700 shrink-0" />
                <span>
                  <strong>Full Continuous Review Complete:</strong> All 7 specification blocks are synchronized and ready for central catalog deployment.
                </span>
              </div>
              <button
                type="button"
                onClick={copySkuToClipboard}
                className="px-2.5 py-1 rounded bg-white border border-blue-300 text-blue-700 font-mono text-[11px] font-bold hover:bg-blue-50 shrink-0"
              >
                {copiedSku ? 'SKU Copied!' : 'Copy SKU'}
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* FINAL BOTTOM ACTION BAR */}
          {/* ========================================================== */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <Link
              href="/admin/products"
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel &amp; Return
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Back to Top
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{isSaving ? 'Saving Master...' : mode === 'new' ? 'Register Fastener in Master' : 'Update Fastener Master'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
