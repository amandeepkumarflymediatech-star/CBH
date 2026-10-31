'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  Truck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload,
  ExternalLink,
  Flame,
  Layers,
  Building,
  Phone,
  Mail,
  User,
  MapPin,
  ChevronRight,
  Info
} from 'lucide-react';
import { getStoredUser } from '@/lib/auth';
import { formatINR } from '@/lib/rfq-calculator';

interface CustomProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialSearchQuery?: string;
  initialDiameter?: string;
  initialLengthMm?: number | string;
  initialStandard?: string;
  initialGrade?: string;
  sourceContext?: 'SURPLUS' | 'CATALOG' | 'CUSTOMER_PORTAL';
}

const CATEGORIES = [
  'Hex Screws',
  'HEX FLANGE BOLTS',
  'SOCKET HEAD CAP SCREWS',
  'STUD BOLTS & RODS',
  'HEX NUTS',
  'WASHERS',
  'ANCHOR BOLTS',
  'STRUCTURAL BOLTS',
  'CUSTOM INDUSTRIAL FASTENERS',
];

const STANDARDS = [
  'DIN 933',
  'DIN 931',
  'DIN 6921',
  'DIN 912',
  'DIN 7991',
  'ISO 4017',
  'ISO 4014',
  'ASTM A193 B7',
  'ASTM A194 2H',
  'ASME B18.2.1',
  'IS 1363 / IS 1364',
  'Custom Plant Drawing',
];

const GRADES = [
  '4.6 Mild Steel',
  '8.8 High Tensile',
  '10.9 High Tensile',
  '12.9 Alloy Steel',
  'SS 304 (A2-70)',
  'SS 316 (A4-80)',
  'SS 316L',
  'ASTM A193 B7 Alloy',
  'Brass',
  'Duplex / Super Duplex',
];

const FINISHES = [
  'SELF / Natural Black',
  'White Zinc Plated (WZP)',
  'Yellow Zinc Passivated (YZP)',
  'Hot Dip Galvanized (HDG)',
  'Black Passivated (BP)',
  'Dacromet / Geomet',
  'PTFE / Teflon Coated',
];

const THREAD_TYPES = [
  'Full Thread',
  'Partial / Half Thread',
  'Metric Fine Pitch',
  'UNC (Coarse)',
  'UNF (Fine)',
];

const DIAMETERS = [
  'M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M14', 'M16', 'M18', 'M20',
  'M22', 'M24', 'M27', 'M30', 'M33', 'M36', 'M42', 'M48',
  '1/4"', '5/16"', '3/8"', '1/2"', '5/8"', '3/4"', '7/8"', '1"', '1-1/4"', '1-1/2"',
];

export default function CustomProductRequestModal({
  isOpen,
  onClose,
  initialCategory,
  initialSearchQuery,
  initialDiameter,
  initialLengthMm,
  initialStandard,
  initialGrade,
  sourceContext = 'SURPLUS',
}: CustomProductRequestModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ requestNumber: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState(initialCategory || 'Hex Screws');
  const [standard, setStandard] = useState(initialStandard || 'DIN 933');
  const [grade, setGrade] = useState(initialGrade || '8.8 High Tensile');
  const [finish, setFinish] = useState('SELF / Natural Black');
  const [threadType, setThreadType] = useState('Full Thread');
  const [diameter, setDiameter] = useState(initialDiameter || 'M12');
  const [lengthMm, setLengthMm] = useState<number | string>(initialLengthMm || 50);
  const [pitchMm, setPitchMm] = useState<number | string>(1.75);
  const [productTitle, setProductTitle] = useState('');

  // Commercials
  const [quantity, setQuantity] = useState<number | string>(2500);
  const [quantityUom, setQuantityUom] = useState('Nos');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<'SURPLUS_IMMEDIATE' | 'STANDARD' | 'SCHEDULED'>(
    sourceContext === 'SURPLUS' ? 'SURPLUS_IMMEDIATE' : 'STANDARD'
  );

  // Drawing & Notes
  const [drawingUrl, setDrawingUrl] = useState('');
  const [notes, setNotes] = useState(initialSearchQuery ? `Customer search term: ${initialSearchQuery}` : '');

  // Contact
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');

  // Auto-fill logged in user
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      if (user.fullName) setCustomerName(user.fullName);
      if (user.companyName) setCompanyName(user.companyName);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [isOpen]);

  // Sync initialCategory & search term when reopened
  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setCategory(initialCategory);
    }
    if (initialSearchQuery) {
      setNotes((prev) => prev || `Search keyword: ${initialSearchQuery}`);
    }
    if (initialDiameter) {
      setDiameter(initialDiameter);
    }
    if (initialLengthMm) {
      setLengthMm(initialLengthMm);
    }
    if (initialStandard) {
      setStandard(initialStandard);
    }
    if (initialGrade) {
      setGrade(initialGrade);
    }
  }, [initialCategory, initialSearchQuery, initialDiameter, initialLengthMm, initialStandard, initialGrade, isOpen]);

  // Dynamic formatted size & auto title preview
  const formattedSize = useMemo(() => {
    return `${diameter}X${pitchMm ? `${pitchMm}X` : ''}${lengthMm}`;
  }, [diameter, pitchMm, lengthMm]);

  const generatedTitle = useMemo(() => {
    const stdClean = standard.replace('DIN ', 'DIN-').replace('ISO ', 'ISO-');
    const gradeClean = grade.split(' ')[0] + (grade.includes('SS') ? ` ${grade.split(' ')[1]}` : '');
    const finishClean = finish.split(' ')[0];
    return `${category.toUpperCase()}-(${stdClean})-${threadType.toUpperCase()}-${formattedSize}-${gradeClean}-${finishClean}`.toUpperCase();
  }, [category, standard, threadType, formattedSize, grade, finish]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your name, email, and phone number.');
      return;
    }

    if (!diameter || !lengthMm) {
      setErrorMessage('Please specify Diameter and Length.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productName: productTitle.trim() || generatedTitle,
        category,
        subCategory: category,
        standard,
        grade,
        finish,
        threadType,
        diameter,
        lengthMm: Number(lengthMm) || 50,
        pitchMm: parseFloat(String(pitchMm)) || 1.5,
        sizeFormatted: formattedSize,
        quantityRequired: Number(quantity) || 1000,
        quantityUom,
        targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
        urgencyLevel,
        drawingUrl: drawingUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        customerName: customerName.trim(),
        companyName: companyName.trim() || undefined,
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingPincode: shippingPincode.trim() || undefined,
      };

      const res = await fetch('/api/custom-product-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSuccessData({ requestNumber: data.data.requestNumber });
      } else {
        setErrorMessage(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 my-auto sm:my-8 max-h-[96dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Strip */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2.5 bg-slate-50/70">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-blue-50 text-[#0052CC] rounded-xl shrink-0">
              {sourceContext === 'SURPLUS' ? (
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              ) : (
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0052CC]" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-[#0F172A] tracking-tight truncate">
                {sourceContext === 'SURPLUS'
                  ? 'Request Factory Surplus Lot'
                  : 'Request Custom Fastener Spec'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block">
                Can&apos;t find your exact size or grade? We onboard custom tooling &amp; clearance runs.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        {successData ? (
          <div className="p-6 sm:p-10 text-center space-y-4 overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#0F172A]">Request Registered Successfully!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your custom fastener inquiry has been registered in our factory queue. Our engineering desk will review tooling and add this product to the live catalog or generate your proforma invoice.
            </p>
            <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-sm mx-auto font-mono text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Docket Reference Number</span>
              <strong className="text-base sm:text-lg text-[#0052CC]">{successData.requestNumber}</strong>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold transition-all shadow"
              >
                Done / Back to Catalog
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto overscroll-contain flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-5 text-xs">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 text-xs">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Generated Fastener Spec Preview Banner */}
            <div className="p-2.5 sm:p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5">
                Target Fastener Specification Preview
              </span>
              <div className="font-mono font-extrabold text-[#0052CC] text-[11px] sm:text-xs break-all leading-snug">
                {productTitle || generatedTitle}
              </div>
            </div>

            {/* Section 1: Fastener Type & Standard */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <Layers size={13} className="text-[#0052CC] shrink-0" />
                <span>1. Fastener Category &amp; Standard</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Fastener Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Standard / Specification</label>
                  <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                  >
                    {STANDARDS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Dimensional Engineering Specs */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <Info size={13} className="text-[#0052CC] shrink-0" />
                <span>2. Dimensions &amp; Geometry</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Diameter (DIA)</label>
                  <select
                    value={diameter}
                    onChange={(e) => setDiameter(e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                  >
                    {DIAMETERS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Length (mm)</label>
                  <input
                    type="number"
                    value={lengthMm}
                    onChange={(e) => setLengthMm(e.target.value)}
                    placeholder="e.g. 65"
                    className="w-full px-2.5 sm:px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Pitch (mm)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pitchMm}
                    onChange={(e) => setPitchMm(e.target.value)}
                    placeholder="e.g. 1.5"
                    className="w-full px-2.5 sm:px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Thread Profile</label>
                  <select
                    value={threadType}
                    onChange={(e) => setThreadType(e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                  >
                    {THREAD_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Material Grade & Finish */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#0052CC] shrink-0" />
                <span>3. Material Metallurgy &amp; Coating</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Material Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Surface Finish / Coating</label>
                  <select
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                  >
                    {FINISHES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Quantity & Target Rate */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <Truck size={13} className="text-[#0052CC] shrink-0" />
                <span>4. Volume &amp; Target Pricing</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Required Volume</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                      required
                    />
                    <select
                      value={quantityUom}
                      onChange={(e) => setQuantityUom(e.target.value)}
                      className="w-20 shrink-0 px-2 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                    >
                      <option value="Nos">Nos</option>
                      <option value="Kgs">Kgs</option>
                      <option value="Boxes">Boxes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Target Rate (₹ optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g. 18.50"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Dispatch Urgency</label>
                  <select
                    value={urgencyLevel}
                    onChange={(e: any) => setUrgencyLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                  >
                    <option value="SURPLUS_IMMEDIATE">Surplus Depot Lot (Immediate)</option>
                    <option value="STANDARD">Standard Procurement (10-15 Days)</option>
                    <option value="SCHEDULED">Plant Schedule (30+ Days)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: CAD Drawing / Attachment URL */}
            <div className="space-y-1">
              <label className="block text-slate-500 font-bold mb-1 flex items-center justify-between text-[11px]">
                <span>Drawing URL / Technical Spec Sheet Link (Optional)</span>
                <span className="text-[10px] text-slate-400 font-normal">Google Drive / Dropbox</span>
              </label>
              <input
                type="url"
                value={drawingUrl}
                onChange={(e) => setDrawingUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            {/* Section 6: Client Contact Details */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px] sm:text-[11px] flex items-center gap-1.5">
                <User size={13} className="text-[#0052CC] shrink-0" />
                <span>5. Client Procurement Coordinates</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Full Contact Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Company / Enterprise Firm</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Larsen &amp; Toubro Ltd."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Email Address *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px]">Mobile Phone (WhatsApp) *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-semibold text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 text-[11px]">Special Engineering Notes / Delivery Location</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specify application temperature, salt-spray requirements, project delivery location, or special head marking..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 text-xs transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold rounded-xl shadow transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs"
              >
                {submitting ? 'Registering Request...' : 'Submit Custom Request to Admin'}
                <ChevronRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
