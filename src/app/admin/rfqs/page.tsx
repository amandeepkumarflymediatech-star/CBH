'use client';

import React, { useState, useEffect } from 'react';
import AdminRfqsSection from '@/components/admin/AdminRfqsSection';
import { BulkQuotation } from '@/lib/types';
import { INITIAL_QUOTES } from '@/lib/mock-data';
import { CheckCircle2 } from 'lucide-react';

export default function AdminRfqsPage() {
  const [quotes, setQuotes] = useState<BulkQuotation[]>(INITIAL_QUOTES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadRfqs = async () => {
    try {
      const res = await fetch('/api/rfq');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setQuotes(json.data);
      }
    } catch (err) {
      console.error('Failed to load RFQs:', err);
    }
  };

  useEffect(() => {
    loadRfqs();
  }, []);

  const handleAddQuote = async (quoteData: Omit<BulkQuotation, 'id'>) => {
    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setQuotes((prev) => [data.data, ...prev]);
        showToast(`Quotation ${quoteData.rfqNumber} registered successfully.`);
      } else {
        const localQuote: BulkQuotation = { ...quoteData, id: `RFQ-${Date.now()}` };
        setQuotes((prev) => [localQuote, ...prev]);
        showToast(`Quotation ${quoteData.rfqNumber} created.`);
      }
    } catch {
      const localQuote: BulkQuotation = { ...quoteData, id: `RFQ-${Date.now()}` };
      setQuotes((prev) => [localQuote, ...prev]);
      showToast(`Quotation ${quoteData.rfqNumber} created.`);
    }
  };

  const handleUpdateQuote = async (updated: BulkQuotation) => {
    try {
      const res = await fetch('/api/rfq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setQuotes((prev) => prev.map((q) => (q.id === updated.id ? data.data : q)));
        showToast(`Quotation ${updated.rfqNumber} marked as ${updated.status}.`);
      } else {
        setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
        showToast(`Quotation ${updated.rfqNumber} updated.`);
      }
    } catch {
      setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      showToast(`Quotation ${updated.rfqNumber} updated.`);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    try {
      const res = await fetch(`/api/rfq?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQuotes((prev) => prev.filter((q) => q.id !== id));
        showToast('Quotation removed from registry.');
      } else {
        setQuotes((prev) => prev.filter((q) => q.id !== id));
        showToast('Quotation deleted.');
      }
    } catch {
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      showToast('Quotation deleted.');
    }
  };

  return (
    <div>
      <AdminRfqsSection
        quotes={quotes}
        onAdd={handleAddQuote}
        onUpdate={handleUpdateQuote}
        onDelete={handleDeleteQuote}
        showToast={showToast}
      />

      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={16} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
