'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  UploadCloud,
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  X,
  FileDown,
  Printer,
  Sparkles,
  Zap,
  Building2
} from 'lucide-react';
import TablePagination from '@/components/common/TablePagination';
import CustomProductRequestModal from '@/components/common/CustomProductRequestModal';
import { BulkQuotation } from '@/lib/types';
import { getStoredUser } from '@/lib/auth';
import { formatINR } from '@/lib/rfq-calculator';
import { showSuccessAlert, showToast } from '@/lib/swal';

const STATUS_FILTERS = [
  { label: 'All Quotes', value: 'ALL' },
  { label: 'Quotes Ready', value: 'QUOTED' },
  { label: 'Under Review', value: 'PENDING' },
  { label: 'PO Issued', value: 'PO_ISSUED' },
];

export default function CustomerRfqsPage() {
  const [quotes, setQuotes] = useState<BulkQuotation[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);
  const [activeQuoteModal, setActiveQuoteModal] = useState<BulkQuotation | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadQuotes = () => {
    fetch('/api/rfq')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setQuotes(data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const filteredQuotes = useMemo(() => {
    let list = [...quotes];
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PO_ISSUED') {
        list = list.filter((q) => q.status === 'PO_ISSUED' || q.status === 'CONVERTED_TO_PO');
      } else if (statusFilter === 'PENDING') {
        list = list.filter((q) => q.status === 'PENDING' || q.status === 'IN_REVIEW');
      } else {
        list = list.filter((q) => q.status === statusFilter);
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.rfqNumber.toLowerCase().includes(q) ||
          (item.companyName && item.companyName.toLowerCase().includes(q)) ||
          (item.customerName && item.customerName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [quotes, statusFilter, search]);

  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuotes.slice(start, start + itemsPerPage);
  }, [filteredQuotes, currentPage, itemsPerPage]);

  const handleUploadBOM = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setIsBOMModalOpen(false);
      showSuccessAlert(
        'BOM Submitted Successfully',
        'Your Bill of Materials (BOM) has been submitted! Our chief metallurgist and pricing engine will review the index rates within 30 minutes.'
      );
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUOTED':
        return { label: 'QUOTE READY', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PO_ISSUED':
      case 'CONVERTED_TO_PO':
        return { label: 'PO ISSUED', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'UNDER REVIEW', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <div className="space-y-4">
      {/* INTEGRATED TOP BAR */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-[#0052CC] rounded-lg shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Bulk RFQs &amp; Tenders Desk
              </h1>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {quotes.length} RFQs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant contractor pricing, BOM spreadsheets, and wholesale rate contracts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setIsCustomRequestOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Sparkles size={13} className="text-[#0052CC]" />
            <span>+ Custom Spec</span>
          </button>
          <button
            type="button"
            onClick={() => setIsBOMModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <UploadCloud size={13} />
            <span>+ Upload BOM</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search RFQ #, project or contact..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0052CC] focus:bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {STATUS_FILTERS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#0052CC] text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* HIGH-DENSITY RFQ TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">RFQ Code &amp; Date</th>
                <th className="py-2.5 px-3">Company / Project</th>
                <th className="py-2.5 px-3 text-center">BOM Items</th>
                <th className="py-2.5 px-3 text-right">Quoted Value</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <h3 className="text-xs font-bold text-slate-700">No RFQ records found</h3>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                      Submit an RFQ or upload a BOM spreadsheet to generate rate contracts.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedQuotes.map((q) => {
                  const badge = getStatusBadge(q.status);
                  const isQuoted = q.status === 'QUOTED';

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => setActiveQuoteModal(q)}
                          className="font-mono font-bold text-[#0052CC] hover:underline text-xs block text-left"
                        >
                          {q.rfqNumber}
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono">{q.date || 'Recent'}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{q.companyName || q.customerName}</div>
                        <div className="text-[10px] text-slate-400">{q.customerName}</div>
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                        {q.itemsCount || q.items?.length || 1} SKUs
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {q.netTotal ? formatINR(q.netTotal) : 'Evaluating'}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveQuoteModal(q)}
                            className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200"
                          >
                            Inspect
                          </button>
                          {isQuoted && (
                            <Link
                              href="/checkout"
                              className="px-2.5 py-1 rounded bg-[#0052CC] hover:bg-[#0747A6] text-white text-[11px] font-bold"
                            >
                              Issue PO →
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredQuotes.length > itemsPerPage && (
          <div className="p-3 border-t border-slate-100">
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredQuotes.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* INSPECT QUOTE MODAL */}
      {activeQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono">Quotation {activeQuoteModal.rfqNumber}</h3>
                <p className="text-xs text-slate-400">{activeQuoteModal.companyName}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuoteModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-blue-700">{activeQuoteModal.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fastener Lines:</span>
                <span className="font-bold text-slate-800">{activeQuoteModal.itemsCount || 1} Lines</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Total:</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">
                  {formatINR(activeQuoteModal.netTotal || 0)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveQuoteModal(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Quotation PDF downloading...', 'success');
                  setActiveQuoteModal(null);
                }}
                className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Download Quote PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOM UPLOAD MODAL */}
      {isBOMModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upload BOM Spreadsheet</h3>
                <p className="text-xs text-slate-400">Supported formats: .XLSX, .CSV</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBOMModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadBOM} className="space-y-4 text-xs">
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <FileSpreadsheet className="w-8 h-8 text-[#0052CC] mx-auto mb-2" />
                <p className="font-semibold text-slate-800">Drag &amp; drop your BOM file here</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Or click to select from your device</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBOMModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-xs font-bold"
                >
                  {isUploading ? 'Uploading...' : 'Submit for Pricing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM SPEC MODAL */}
      <CustomProductRequestModal
        isOpen={isCustomRequestOpen}
        onClose={() => {
          setIsCustomRequestOpen(false);
          loadQuotes();
        }}
        sourceContext="CUSTOMER_PORTAL"
      />
    </div>
  );
}
