'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  ChevronRight,
  FileText,
  Boxes,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { RfqLineItem, GlobalUnit } from '@/lib/types';
import { calculateRfqSummary, formatINR } from '@/lib/rfq-calculator';
import { getStoredCart } from '@/lib/cart';
import { getStoredUser } from '@/lib/auth';

export default function CheckoutPage() {
  const router = useRouter();
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: 'Harpreet Singh',
    companyName: 'Ludhiana Heavy Engineering Works Pvt. Ltd.',
    gstin: '03AAACL1206M1ZN',
    phone: '9888021000',
    email: 'procurement@ludhianaheavy.com',
    shippingAddress: 'Plot 45-B, Focal Point Phase VII',
    city: 'Ludhiana',
    state: 'Punjab',
    pincode: '141010',
    deliveryInstructions: 'Delivery at Gate #2 with Weighbridge Calibration Slip',
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'PHONEPE' | 'NEFT_RTGS'>('PHONEPE');

  // Order Items
  const [items, setItems] = useState<RfqLineItem[]>([
    {
      id: 1,
      productId: 1,
      sku: 'CBH-933-M10-100-8.8',
      name: 'Hex Screws Full Thread DIN 933 M10x1.5x100mm Grade 8.8 BP',
      standard: 'DIN 933',
      unit: 'PCS',
      unitRate: 14.5,
      quantity: 5000,
      weightPerPcKg: 0.0601,
      totalWeightKg: 5000 * 0.0601,
      rowTotal: 5000 * 14.5,
    },
    {
      id: 2,
      productId: 4,
      sku: 'CBH-934-M10-8.8-HDG',
      name: 'Hex Nuts DIN 934 M10x1.5 Grade 8.8 Hot Dip Galvanized',
      standard: 'DIN 934',
      unit: 'PCS',
      unitRate: 4.8,
      quantity: 5000,
      weightPerPcKg: 0.0116,
      totalWeightKg: 5000 * 0.0116,
      rowTotal: 5000 * 4.8,
    },
    {
      id: 3,
      productId: 8,
      sku: 'CBH-125-M10-SS304',
      name: 'Plain Flat Washer DIN 125 M10 AISI 304 Stainless Steel',
      standard: 'DIN 125',
      unit: 'PCS',
      unitRate: 2.4,
      quantity: 5000,
      weightPerPcKg: 0.0041,
      totalWeightKg: 5000 * 0.0041,
      rowTotal: 5000 * 2.4,
    },
  ]);

  // Load persisted cart from home page and populate customer info if logged in
  useEffect(() => {
    const savedCart = getStoredCart();
    if (savedCart && savedCart.length > 0) {
      setItems(savedCart);
    }

    const user = getStoredUser();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        companyName: user.companyName || prev.companyName,
        gstin: user.gstin || prev.gstin,
        shippingAddress: user.address || prev.shippingAddress,
      }));
    }
  }, []);

  const summary = calculateRfqSummary(items);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhonePeCheckout = async () => {
    setErrorMessage(null);

    // Validate Required Fields
    if (!formData.fullName || !formData.phone || !formData.shippingAddress || !formData.pincode) {
      setErrorMessage('Please fill in your Contact Name, Phone, Delivery Address, and Pincode.');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
      return;
    }

    const orderId = `CBH-ORD-${Date.now()}`;

    if (paymentMethod === 'NEFT_RTGS') {
      // Direct Proforma Generation for NEFT
      router.push(
        `/order-success?orderNumber=${orderId}&mode=NEFT&amount=${summary.netTotal}&company=${encodeURIComponent(
          formData.companyName
        )}`
      );
      return;
    }

    // Direct redirection to official PhonePe Gateway
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: summary.netTotal,
          orderId: orderId,
          customerName: formData.fullName,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          companyName: formData.companyName,
          shippingAddress: `${formData.shippingAddress}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          totalWeightKg: summary.totalWeightKg,
        }),
      });

      const data = await res.json();
      if (data.success && data.paymentUrl) {
        // Direct browser redirection to the official PhonePe Gateway
        window.location.href = data.paymentUrl;
      } else {
        setIsSubmitting(false);
        setErrorMessage(data.error || 'Failed to initiate PhonePe payment. Please check your credentials in the Admin Panel.');
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 120, behavior: 'smooth' });
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error connecting to PhonePe Gateway.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <MainHeader
        unit={globalUnit}
        onUnitToggle={(u) => setGlobalUnit(u)}
        cartCount={items.length}
        onOpenCart={() => {}}
      />

      {/* Breadcrumb Strip */}
      <div className="bg-white border-b border-[#D8DFE7] py-2.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight size={13} />
          <Link href="/bulk-order" className="hover:text-black">Bulk RFQ</Link>
          <ChevronRight size={13} />
          <span className="font-bold text-[#0052CC]">Secure Checkout &amp; PhonePe Gateway</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00] mb-1">
            <span>Direct Mill Procurement Checkout</span>
            <span>•</span>
            <span>Indian GST Compliance (HSN 7318)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Commercial Fastener Checkout &amp; Settlement
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Instant digital payment via PhonePe (UPI, Debit/Credit Card, NetBanking) with automated EN 10204 3.1 Mill Test Certificate dispatch.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Billing, Shipping & Payment Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Enterprise Profile & GSTIN */}
            <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-black text-sm text-[#0F172A]">
                  <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Enterprise Profile &amp; Indian GST Details</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>GST Verified</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">Contact Officer Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">Company / Firm Legal Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">15-Digit Indian GSTIN</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    placeholder="03AAACL1206M1ZN"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">Mobile Phone Number (UPI Linked) *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#0F172A] mb-1">Email Address (For Tax Invoices &amp; MTC)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping & Weighbridge Instructions */}
            <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-black text-sm text-[#0F172A] border-b pb-3">
                <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-xs">
                  2
                </span>
                <span>Factory Yard &amp; Transporter Dispatch Address</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">Complete Street / Yard Address *</label>
                  <input
                    type="text"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#0F172A] mb-1">City / District</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F172A] mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F172A] mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">Transport / LR Docket Notes</label>
                  <textarea
                    rows={2}
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Settlement Gateway */}
            <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-black text-sm text-[#0F172A]">
                  <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Select Payment Settlement Mode</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                  <Lock size={12} className="text-emerald-600" />
                  <span>256-Bit Encrypted</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                {/* PhonePe Option */}
                <label
                  onClick={() => setPaymentMethod('PHONEPE')}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'PHONEPE'
                      ? 'border-[#5f259f] bg-[#5f259f]/5 ring-2 ring-[#5f259f]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'PHONEPE'}
                      onChange={() => setPaymentMethod('PHONEPE')}
                      className="w-4 h-4 text-[#5f259f] focus:ring-[#5f259f]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#5f259f] text-sm tracking-tight">PhonePe</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#5f259f] text-white text-[10px] font-bold">
                          INSTANT SETTLEMENT
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, &amp; NetBanking.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 font-mono">
                    <span className="px-2 py-1 rounded bg-slate-100">UPI</span>
                    <span className="px-2 py-1 rounded bg-slate-100">CARDS</span>
                    <span className="px-2 py-1 rounded bg-slate-100">NETBANKING</span>
                  </div>
                </label>

                {/* NEFT / RTGS Option */}
                <label
                  onClick={() => setPaymentMethod('NEFT_RTGS')}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'NEFT_RTGS'
                      ? 'border-[#0052CC] bg-[#0052CC]/5 ring-2 ring-[#0052CC]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'NEFT_RTGS'}
                      onChange={() => setPaymentMethod('NEFT_RTGS')}
                      className="w-4 h-4 text-[#0052CC] focus:ring-[#0052CC]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#0F172A] text-sm">Corporate NEFT / RTGS</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                          B2B BANK TRANSFER
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Generate official CBH Proforma Invoice with RTGS Virtual Account Number (VAN).
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary: Order Totals & PhonePe Action Button (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#D8DFE7] p-6 shadow-sm sticky top-4 space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-black text-[#0F172A]">Order Commercial Summary</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                  {summary.totalWeightKg.toFixed(1)} KG Net
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={item.imageUrl || '/assets/bolt_zinc.jpg'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/assets/bolt_zinc.jpg';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#0F172A] block line-clamp-1">{item.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {item.quantity.toLocaleString()} {item.unit} • ₹{item.unitRate}/{item.unit}
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold font-mono text-[#0052CC] flex-shrink-0">
                      {formatINR(item.rowTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Numbers Breakdown */}
              <div className="border-t pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Tariff:</span>
                  <span className="font-mono font-bold">{formatINR(summary.grossAmount)}</span>
                </div>

                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Wholesale Volume Rebate (-{summary.slabDiscountPct}%):</span>
                  <span className="font-mono">-{formatINR(summary.slabDiscountAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Freight Delivery (Pan-India):</span>
                  <span className="font-bold text-emerald-600">
                    {summary.freightAmount === 0 ? 'FREE (Above ₹25,000)' : formatINR(summary.freightAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Applicable GST (18% HSN 7318):</span>
                  <span className="font-mono font-bold">{formatINR(summary.gstAmount)}</span>
                </div>

                <div className="pt-3 border-t flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-black text-[#0F172A] block">Net Amount Payable:</span>
                    <span className="text-[10px] text-slate-400">Inclusive of 18% Indian GST &amp; Transit Insurance</span>
                  </div>
                  <span className="text-2xl font-black text-[#0F172A] font-mono text-[#0052CC]">
                    {formatINR(summary.netTotal)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePhonePeCheckout}
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                style={{
                  background: paymentMethod === 'PHONEPE' ? '#5f259f' : '#0052CC',
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to PhonePe Gateway...</span>
                  </>
                ) : paymentMethod === 'PHONEPE' ? (
                  <>
                    <span>Pay {formatINR(summary.netTotal)} via PhonePe</span>
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    <span>Generate Corporate Proforma (NEFT/RTGS)</span>
                    <FileText size={18} />
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <CheckCircle2 size={13} />
                  <span>PhonePe RBI Authorized Payment Aggregator</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#0052CC]" />
                  <span>Direct EN 10204 3.1 Mill Test Certificate dispatched with docket</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
