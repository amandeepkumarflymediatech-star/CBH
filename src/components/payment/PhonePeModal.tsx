'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { formatINR } from '@/lib/rfq-calculator';

interface PhonePeModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  companyName?: string;
  onSuccess?: (data: { txnId: string; orderNumber: string; amount: number; mode: string }) => void;
}

export default function PhonePeModal({
  isOpen,
  onClose,
  amount,
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  companyName,
}: PhonePeModalProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      return;
    }

    let isMounted = true;

    const startDirectRedirect = async () => {
      setError(null);

      try {
        const res = await fetch('/api/payment/phonepe/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            orderId: orderNumber,
            customerName: customerName || 'CBH Buyer',
            customerPhone: customerPhone || '9999999999',
            customerEmail: customerEmail || 'buyer@cbh.com',
            notes: { companyName: companyName || 'CBH Client' }
          }),
        });

        const data = await res.json();

        if (data.success && data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          if (isMounted) {
            setError(data.message || 'Unable to connect to PhonePe gateway. Please verify merchant credentials.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Network error while reaching PhonePe gateway.');
        }
      }
    };

    startDirectRedirect();

    return () => {
      isMounted = false;
    };
  }, [isOpen, amount, orderNumber, customerName, customerPhone, customerEmail, companyName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
              पे
            </div>
            <span className="font-semibold text-slate-800 text-sm">PhonePe Payment Gateway</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {error ? (
          <div className="py-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-semibold text-slate-800 text-base mb-1">Gateway Connection Issue</h3>
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg mb-4 text-left font-mono">
              {error}
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="py-6">
            <Loader2 size={36} className="animate-spin text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 text-base mb-1">
              Redirecting to PhonePe Gateway
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Transferring you securely to complete payment of <span className="font-semibold text-slate-800">{formatINR(amount)}</span>
            </p>
            <p className="text-[11px] text-slate-400">Order ID: {orderNumber}</p>
          </div>
        )}
      </div>
    </div>
  );
}
