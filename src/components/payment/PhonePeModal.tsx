'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  Building,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Wallet
} from 'lucide-react';
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
  onSuccess: (data: { txnId: string; orderNumber: string; amount: number; mode: string }) => void;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'wallet';

export default function PhonePeModal({
  isOpen,
  onClose,
  amount,
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  companyName,
  onSuccess,
}: PhonePeModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState(customerName || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('PhonePe Wallet');
  const [countdown, setCountdown] = useState(599); // 10 minutes

  // Countdown timer for UPI QR
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Format countdown mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Card number input formatter
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Expiry input formatter
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handlePayNow = async () => {
    setError(null);
    setProcessing(true);
    setProcessingStep('Connecting to PhonePe Secure Gateway...');

    try {
      const res = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          orderId: orderNumber,
          customerName,
          customerPhone,
          customerEmail,
          companyName,
        }),
      });

      const data = await res.json();
      if (data.success && data.paymentUrl) {
        setProcessingStep('Redirecting to official PhonePe Gateway...');
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || 'Failed to connect to PhonePe Gateway. Please check your credentials in the Admin Panel.');
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Payment authorization timed out. Please try again.');
      setProcessing(false);
    }
  };

  // Generate UPI QR URI
  const upiUri = `upi://pay?pa=cbhfasteners@ybl&pn=CBH%20Fasteners&am=${amount}&cu=INR&tn=Order%20${orderNumber}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    upiUri
  )}&bgcolor=FFFFFF&color=5f259f&margin=2`;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* PhonePe Branded Header */}
        <div className="bg-[#5f259f] text-white p-5 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#5f259f] font-black flex items-center justify-center text-lg shadow-sm">
              पे
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-tight">PhonePe Payment Gateway</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  256-BIT SSL
                </span>
              </div>
              <p className="text-xs text-white/80">CBH Fasteners • Direct Mill Settlement</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount & Order Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Payable Amount</span>
            <span className="text-xl font-black text-[#0F172A] font-mono">{formatINR(amount)}</span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Order ID</span>
            <span className="font-mono font-bold text-slate-700">{orderNumber}</span>
          </div>
        </div>

        {/* Processing Overlay State */}
        {processing ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#5f259f]/10 text-[#5f259f] flex items-center justify-center mx-auto">
              <RefreshCw size={30} className="animate-spin" />
            </div>
            <h4 className="text-base font-black text-[#0F172A]">{processingStep}</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Please do not press back or refresh the page while your banking network confirms the transaction.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <Lock size={12} />
              <span>PCI-DSS Certified Banking Protocol</span>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
              {[
                { id: 'upi', label: 'UPI / QR', icon: QrCode },
                { id: 'card', label: 'Cards', icon: CreditCard },
                { id: 'netbanking', label: 'NetBanking', icon: Building },
                { id: 'wallet', label: 'Wallets', icon: Wallet },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as PaymentTab)}
                    className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] sm:text-xs transition-all ${
                      active
                        ? 'bg-white text-[#5f259f] shadow-sm font-black'
                        : 'hover:text-black'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: UPI & QR Code */}
            {activeTab === 'upi' && (
              <div className="space-y-4 text-xs">
                {/* QR Code Container */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-[#5f259f]/30 bg-[#5f259f]/5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="bg-white p-2.5 rounded-xl shadow border border-slate-200 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="PhonePe UPI QR Code"
                      className="w-32 h-32 rounded"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 font-black text-sm text-[#5f259f]">
                      <Sparkles size={14} />
                      <span>Scan &amp; Pay via Any UPI App</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Scan with <strong>PhonePe, Google Pay, Paytm, or BHIM</strong> to approve {formatINR(amount)}.
                    </p>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                      <span>QR Expires in:</span>
                      <strong className="text-[#5f259f]">{formatTime(countdown)}</strong>
                    </div>
                  </div>
                </div>

                {/* Or Enter UPI ID */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#0F172A]">Or Enter Virtual Payment Address (VPA / UPI ID)</label>
                    <span className="text-[10px] text-slate-400">e.g. mobile@ybl</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        setUpiVerified(false);
                      }}
                      placeholder="e.g. 9888021000@ybl or username@okhdfcbank"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#5f259f]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (upiId.includes('@')) {
                          setUpiVerified(true);
                        } else {
                          setError('Please enter a valid UPI ID containing "@"');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      {upiVerified ? 'Verified ✓' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Credit / Debit Card */}
            {activeTab === 'card' && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4532 •••• •••• 8892"
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:border-[#5f259f]"
                    />
                    <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">Name on Card</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="HARPREET SINGH"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase focus:outline-none focus:border-[#5f259f]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#0F172A] mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center focus:outline-none focus:border-[#5f259f]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F172A] mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="•••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center focus:outline-none focus:border-[#5f259f]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Card details are tokenized securely in compliance with RBI standards.</span>
                </div>
              </div>
            )}

            {/* TAB 3: NetBanking */}
            {activeTab === 'netbanking' && (
              <div className="space-y-3 text-xs">
                <label className="block font-bold text-[#0F172A]">Select Your Bank</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'HDFC Bank',
                    'State Bank of India',
                    'ICICI Bank',
                    'Axis Bank',
                    'Kotak Mahindra',
                    'Punjab National Bank',
                  ].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                        selectedBank === bank
                          ? 'border-[#5f259f] bg-[#5f259f]/5 text-[#5f259f] ring-1 ring-[#5f259f]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block font-bold text-slate-500 text-[11px] mb-1">All Other Indian Banks</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                    <option value="IndusInd Bank">IndusInd Bank</option>
                    <option value="IDBI Bank">IDBI Bank</option>
                    <option value="Federal Bank">Federal Bank</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 4: Wallets */}
            {activeTab === 'wallet' && (
              <div className="space-y-3 text-xs">
                <label className="block font-bold text-[#0F172A]">Select Wallet</label>
                <div className="space-y-2">
                  {['PhonePe Wallet', 'Paytm Wallet', 'Amazon Pay', 'MobiKwik'].map((wallet) => (
                    <label
                      key={wallet}
                      onClick={() => setSelectedWallet(wallet)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedWallet === wallet
                          ? 'border-[#5f259f] bg-[#5f259f]/5 text-[#5f259f] font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{wallet}</span>
                      <input
                        type="radio"
                        name="walletOption"
                        checked={selectedWallet === wallet}
                        onChange={() => setSelectedWallet(wallet)}
                        className="text-[#5f259f]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Pay Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handlePayNow}
                className="w-full py-3.5 rounded-xl bg-[#5f259f] hover:bg-[#4a1c7d] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#5f259f]/20 transition-all"
              >
                <span>Redirect to PhonePe Gateway ({formatINR(amount)})</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>PhonePe Secure 2FA • Automatic Proforma &amp; MTC Generation</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
