'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Zap,
  FileSpreadsheet,
  CheckCircle2,
  Tag,
  Package,
} from 'lucide-react';
import { RfqLineItem } from '@/lib/types';
import {
  calculateRfqSummary,
  formatINR,
  clampQty,
  formatQtyDisplay,
  getMinQty,
  MIN_QTY_PCS,
  MIN_QTY_KGS,
} from '@/lib/rfq-calculator';
import { getStoredUser } from '@/lib/auth';
import { setStoredCart } from '@/lib/cart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: RfqLineItem[];
  onUpdateQty: (id: string | number, qty: number) => void;
  onRemoveItem: (id: string | number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
}: CartDrawerProps) {
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const summary = calculateRfqSummary(items);

  const handleStepQty = (item: RfqLineItem, delta: number) => {
    const isKgs = item.unit === 'KGS';
    if (isKgs) {
      if (delta < 0) {
        if (item.quantity <= MIN_QTY_KGS) return;
        const step = item.quantity <= 1 ? 0.25 : 0.5;
        const next = Math.max(MIN_QTY_KGS, Math.round((item.quantity - step) * 100) / 100);
        onUpdateQty(item.id, next);
      } else {
        const step = item.quantity < 1 ? 0.25 : 0.5;
        const next = Math.round((item.quantity + step) * 100) / 100;
        onUpdateQty(item.id, next);
      }
    } else {
      if (delta < 0) {
        if (item.quantity <= MIN_QTY_PCS) return;
        const next = Math.max(MIN_QTY_PCS, item.quantity - 100);
        onUpdateQty(item.id, next);
      } else {
        const next = item.quantity + 100;
        onUpdateQty(item.id, next);
      }
    }
  };

  const handleCheckout = () => {
    setStoredCart(items);
    onClose();
    const user = getStoredUser();
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  const handlePhonePePay = async () => {
    try {
      setIsPaying(true);
      setPayError(null);
      setStoredCart(items);

      const user = getStoredUser();
      if (!user) {
        onClose();
        router.push('/login?redirect=/checkout');
        return;
      }

      const newOrderId = `CBH-ORD-${Date.now()}`;
      const checkoutItems = items.map((it) => ({
        sku: it.sku,
        name: it.name,
        standard: it.standard,
        quantity: it.quantity,
        unit: it.unit,
        rate: it.unitRate,
        weightKg: it.weightPerPcKg,
      }));

      const res = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: summary.netTotal,
          orderId: newOrderId,
          customerName: user.fullName || 'Commercial Fastener Buyer',
          customerPhone: user.phone || '9888021000',
          customerEmail: user.email || 'procurement@buyer.in',
          companyName: user.companyName || 'Verified Enterprise Client',
          shippingAddress: user.address || 'Plot 12, Industrial Area',
          totalWeightKg: summary.totalWeightKg,
          grossAmount: summary.grossAmount,
          discountAmount: summary.slabDiscountAmount,
          gstAmount: summary.gstAmount,
          items: checkoutItems,
        }),
      });
      const data = await res.json();
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setIsPaying(false);
        setPayError(data.error || 'Failed to initiate PhonePe payment.');
      }
    } catch (err: any) {
      setIsPaying(false);
      setPayError(err.message || 'Payment connection error.');
    }
  };

  return (
    <>
      {/* Background Dimmer Backdrop */}
      <div
        className={`drawer-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Drawer Panel */}
      <div
        className={`drawer-panel ${isOpen ? 'active' : ''} flex flex-col h-[100dvh] max-w-[480px] w-full bg-white text-slate-900 shadow-2xl z-[2001] fixed top-0 right-0 overflow-hidden font-sans`}
      >
        {/* ========================================================== */}
        {/* HEADER: Title, Item Count & Close Trigger                  */}
        {/* ========================================================== */}
        <div className="px-5 py-4 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShoppingBag size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 leading-none">
                  RFQ Order Cart
                </h3>
                <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono block mt-1">
                Dual PCS &amp; KGS Live Commercial Billing
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ========================================================== */}
        {/* BODY: Scrollable Products List (flex-1 min-h-0)            */}
        {/* ========================================================== */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 overscroll-contain bg-slate-50/40">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
                <Package size={28} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-base">Your RFQ cart is empty</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[240px] leading-relaxed">
                Add fasteners in pieces (pcs) or kilograms (kg) to generate instant live proforma quotes.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isKgs = item.unit === 'KGS';
              const minLimit = isKgs ? MIN_QTY_KGS : MIN_QTY_PCS;
              const isAtMin = item.quantity <= minLimit;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-2xs hover:border-slate-300 transition-all flex flex-col gap-2.5 relative group"
                >
                  {/* Item Top Row: Thumbnail + Title/Standard + Remove Button */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={item.imageUrl || '/assets/bolt_zinc.jpg'}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/bolt_zinc.jpg';
                        }}
                      />
                    </div>

                    {/* Spec, Name & SKU */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono border border-blue-200/60">
                          {item.standard}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.sku}
                        </span>
                      </div>
                      <h4
                        className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug line-clamp-2"
                        title={item.name}
                      >
                        {item.name}
                      </h4>
                    </div>

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                      title="Remove from quote"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Item Bottom Row: Stepper (Left) & Price Calculation (Right) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    {/* Stepper Control */}
                    <div>
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5 shadow-2xs">
                        <button
                          type="button"
                          disabled={isAtMin}
                          onClick={() => handleStepQty(item, -1)}
                          className="w-6 h-6 flex items-center justify-center font-black text-slate-700 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs"
                          title={isAtMin ? `Minimum order reached (${isKgs ? '250 gm' : '100 pcs'})` : 'Decrease'}
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-900 px-2.5 text-center min-w-[76px] whitespace-nowrap">
                          {formatQtyDisplay(item.quantity, item.unit)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepQty(item, 1)}
                          className="w-6 h-6 flex items-center justify-center font-black text-slate-700 hover:bg-white rounded transition-colors cursor-pointer text-xs"
                          title="Increase"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[9px] text-slate-600 font-medium block mt-0.5 pl-0.5">
                        {isKgs ? 'Min: 250 gm (0.25 Kg)' : 'Min: 100 pcs'}
                      </span>
                    </div>

                    {/* Line Total & Tariff */}
                    <div className="text-right shrink-0 font-mono">
                      <span className="text-sm font-extrabold text-blue-700 block leading-tight">
                        {formatINR(item.rowTotal)}
                      </span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">
                        {formatINR(item.unitRate)} / {isKgs ? 'Kg' : 'Pc'}
                        {item.totalWeightKg ? ` • ${item.totalWeightKg.toFixed(1)}kg` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ========================================================== */}
        {/* FOOTER: Compact Financial Summary & Two-Way Action Strip   */}
        {/* ========================================================== */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-white px-4 sm:px-5 py-3.5 shrink-0 shadow-lg space-y-3">
            {/* Financial Overview (Clean 2-Column Compact Matrix) */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 font-mono text-xs space-y-1">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>
                  Gross Subtotal ({summary.totalWeightKg.toFixed(1)} kg):
                </span>
                <span className="font-bold text-slate-800">
                  {formatINR(summary.grossAmount)}
                </span>
              </div>

              {summary.slabDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 text-[11px] font-bold">
                  <span>Volume Rebate (-{summary.slabDiscountPct}%):</span>
                  <span>-{formatINR(summary.slabDiscountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Applicable GST (18%):</span>
                <span>+{formatINR(summary.gstAmount)}</span>
              </div>

              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-tight">
                  Estimated Net:
                </span>
                <strong className="text-base font-black text-blue-700">
                  {formatINR(summary.netTotal)}
                </strong>
              </div>
            </div>

            {/* Error Message if Payment/API fails */}
            {payError && (
              <div className="text-red-600 text-[11px] font-bold text-center bg-red-50 p-2 rounded-lg border border-red-200">
                {payError}
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Full Commercial Checkout &amp; GST Details</span>
              <ArrowRight size={15} />
            </button>

            {/* Secondary Split Actions: Instant PhonePe & RFQ Matrix */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isPaying}
                onClick={handlePhonePePay}
                className="bg-[#5f259f] hover:bg-[#501f87] text-white py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                title="Instant online settlement via PhonePe gateway"
              >
                <Zap size={13} className="text-amber-300 shrink-0" />
                <span className="truncate">
                  {isPaying ? 'Redirecting...' : 'Pay via PhonePe'}
                </span>
              </button>

              <Link
                href="/bulk-order"
                onClick={onClose}
                className="bg-slate-900 hover:bg-black text-white py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                title="View full itemized procurement proforma spreadsheet"
              >
                <FileSpreadsheet size={13} className="text-slate-300 shrink-0" />
                <span className="truncate">RFQ Proforma Matrix</span>
              </Link>
            </div>

            {/* Certification Trust Pill */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium pt-0.5">
              <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
              <span>NABL 3.1 Mill Certificate &amp; Tax Invoice Generated On Order</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
