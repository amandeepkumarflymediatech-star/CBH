'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import AdminTestimonialsSection from '@/components/admin/AdminTestimonialsSection';
import { Testimonial } from '@/lib/types';
import { INITIAL_TESTIMONIALS } from '@/lib/testimonials-data';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTestimonials = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/testimonials?all=true');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTestimonials(json.data);
      }
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleAdd = async (data: Partial<Testimonial>) => {
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success && json.data) {
      setTestimonials((prev) => [json.data, ...prev]);
    } else {
      throw new Error(json.error || 'Failed to add testimonial');
    }
  };

  const handleUpdate = async (id: string | number, data: Partial<Testimonial>) => {
    const res = await fetch('/api/testimonials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      setTestimonials((prev) =>
        prev.map((t) => (String(t.id) === String(id) ? json.data : t))
      );
    } else {
      throw new Error(json.error || 'Failed to update testimonial');
    }
  };

  const handleDelete = async (id: string | number) => {
    const res = await fetch(`/api/testimonials?id=${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (json.success) {
      setTestimonials((prev) => prev.filter((t) => String(t.id) !== String(id)));
    } else {
      throw new Error(json.error || 'Failed to delete testimonial');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 border border-slate-700">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">
              Admin Portal
            </Link>
            <ChevronRight size={13} />
            <span className="text-slate-800 dark:text-slate-200 font-bold">Client Testimonials</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Award className="text-blue-600 w-6 h-6" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Client Testimonials & Feedback
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage verified industrial buyer reviews, ratings, verified fastener purchases, and frontpage highlights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadTestimonials}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Section */}
      <AdminTestimonialsSection
        testimonials={testimonials}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        showToast={showToast}
        isLoading={isLoading}
        onRefresh={loadTestimonials}
      />
    </div>
  );
}
