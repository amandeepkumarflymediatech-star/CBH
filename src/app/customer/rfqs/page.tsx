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
  Printer
} from 'lucide-react';
import TablePagination from '@/components/common/TablePagination';
import { BulkQuotation } from '@/lib/types';
import { INITIAL_QUOTES } from '@/lib/mock-data';
import { formatINR } from '@/lib/rfq-calculator';

export default function CustomerRfqsPage() {
  const [quotes, setQuotes] = useState<BulkQuotation[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
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
      alert('Your Bill of Materials (BOM) has been submitted! Our chief metallurgist and pricing engine will review the index rates within 30 minutes.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0052CC]" />
            <span>Industrial Quotations &amp; Bulk RFQ Desk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit Bill of Materials (BOM) spreadsheets, review wholesale tier discounts, and convert finalized quotations into purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsBOMModalOpen(true)}
            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <UploadCloud size={14} />
            <span>+ Upload BOM Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search RFQs by RFQ Number, Contact, or Project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {[
            { label: 'ALL', value: 'ALL' },
            { label: 'UNDER REVIEW', value: 'PENDING' },
            { label: 'QUOTES READY', value: 'QUOTED' },
            { label: 'PO ISSUED', value: 'PO_ISSUED' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-[#0052CC] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[720px]">
          <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">RFQ Ref &amp; Date</th>
              <th className="py-3 px-4">Project Contact</th>
              <th className="py-3 px-3 text-center">Items</th>
              <th className="py-3 px-3 text-right">Quoted Net Total</th>
              <th className="py-3 px-3 text-center">Rebate Slab</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedQuotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-slate-600">No quotation requests found matching filter.</p>
                </td>
              </tr>
            ) : (
              paginatedQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-[#0052CC] text-sm">{q.rfqNumber}</div>
                    <div className="text-[11px] text-slate-400">{q.date || 'Active RFQ'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0F172A]">{q.customerName || 'Enterprise Buyer'}</div>
                    <div className="text-[11px] text-slate-500">{q.companyName || 'Corporate Client'}</div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                    {q.itemsCount || 4} SKUs
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-extrabold text-[#0F172A]">
                    {formatINR(q.netTotal)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-bold text-emerald-600 font-mono">
                      -{q.discountPct}% Vol
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      q.status === 'PO_ISSUED' || q.status === 'CONVERTED_TO_PO'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : q.status === 'QUOTED'
                        ? 'bg-blue-50 text-[#0052CC] border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {q.status === 'CONVERTED_TO_PO' || q.status === 'PO_ISSUED'
                        ? 'PO ISSUED'
                        : q.status === 'QUOTED'
                        ? 'QUOTE READY'
                        : 'UNDER REVIEW'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setActiveQuoteModal(q)}
                      className="px-3 py-1 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white text-[11px] font-bold transition-colors"
                    >
                      View Formal Quote
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {filteredQuotes.length > 0 && (
          <div className="p-4 border-t border-slate-200">
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredQuotes.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setCurrentPage(1);
              }}
              itemLabel="quotations"
            />
          </div>
        )}
      </div>

      {/* Quote Detail Modal */}
      {activeQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-[#0F172A] text-base">Formal Wholesale Quotation: {activeQuoteModal.rfqNumber}</h3>
                <span className="text-xs text-slate-500">Status: {activeQuoteModal.status} • Valid until {activeQuoteModal.validUntil || '14 Days'}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuoteModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Consignee Enterprise</span>
                  <strong className="text-[#0F172A]">{activeQuoteModal.companyName || 'Corporate Client'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Tonnage</span>
                  <strong className="text-[#0F172A]">{(activeQuoteModal.totalWeightKg || 0).toFixed(1)} Kg</strong>
                </div>
              </div>

              {/* Items summary */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase block mb-2">Quoted Line Items ({activeQuoteModal.itemsCount} SKUs):</span>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <strong className="text-slate-800">Hex Head Bolt ISO 4014 / DIN 931</strong>
                      <div className="text-[11px] text-slate-500 font-mono">DIN 931 • Class 8.8 High-Tensile Steel</div>
                    </div>
                    <div className="text-right font-mono">
                      <div>5,000 PCS</div>
                      <strong className="text-slate-900">{formatINR(Math.round(activeQuoteModal.grossAmount * 0.45))}</strong>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <strong className="text-slate-800">Heavy Hex Nut ISO 4032 / DIN 934</strong>
                      <div className="text-[11px] text-slate-500 font-mono">DIN 934 • Grade 8 Hot-Dip Galvanized</div>
                    </div>
                    <div className="text-right font-mono">
                      <div>10,000 PCS</div>
                      <strong className="text-slate-900">{formatINR(Math.round(activeQuoteModal.grossAmount * 0.35))}</strong>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <strong className="text-slate-800">Hardened Plain Washer ISO 7089 / DIN 125A</strong>
                      <div className="text-[11px] text-slate-500 font-mono">DIN 125A • 200 HV Zinc Flake Geomet</div>
                    </div>
                    <div className="text-right font-mono">
                      <div>15,000 PCS</div>
                      <strong className="text-slate-900">{formatINR(Math.round(activeQuoteModal.grossAmount * 0.20))}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Goods Total:</span>
                  <span className="font-mono">{formatINR(activeQuoteModal.grossAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Volume Slab Rebate ({activeQuoteModal.discountPct}%):</span>
                  <span className="font-mono">- {formatINR(Math.round(activeQuoteModal.grossAmount * (activeQuoteModal.discountPct / 100)))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GST (18% IGST):</span>
                  <span className="font-mono">{formatINR(Math.round((activeQuoteModal.netTotal * 0.18) / 1.18))}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 text-[#0052CC]">
                  <span>Net Commercial PO Amount:</span>
                  <span className="font-mono">{formatINR(activeQuoteModal.netTotal)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-200 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveQuoteModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {activeQuoteModal.status === 'QUOTED' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/rfq', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: activeQuoteModal.id,
                            status: 'CONVERTED_TO_PO',
                          }),
                        });
                        const data = await res.json();
                        const soId = data.data?.erpnextSalesOrderId;
                        alert(
                          `Quotation ${activeQuoteModal.rfqNumber} accepted!\n` +
                          (soId
                            ? `ERPNext Sales Order ${soId} generated and stock allocated in warehouse.`
                            : `Purchase Order registered successfully into system.`)
                        );
                        loadQuotes();
                      } catch {
                        alert(`Quotation ${activeQuoteModal.rfqNumber} accepted and marked as PO.`);
                      }
                      setActiveQuoteModal(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> Accept Quote &amp; Generate PO
                  </button>
                ) : activeQuoteModal.status === 'CONVERTED_TO_PO' || activeQuoteModal.status === 'PO_ISSUED' ? (
                  <Link
                    href="/customer/orders"
                    onClick={() => setActiveQuoteModal(null)}
                    className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow no-underline"
                  >
                    <span>View in Purchase Orders</span>
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 font-semibold">
                    <Clock size={14} className="text-amber-600" />
                    <span>Awaiting CBH Metallurgy Review &amp; Quotation</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOM Uploader Modal */}
      {isBOMModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-[#0052CC]" />
                <h3 className="font-extrabold text-[#0F172A] text-base">Upload Bill of Materials (BOM)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBOMModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadBOM} className="py-4 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your project procurement spreadsheet (.XLSX, .CSV, or .PDF). Our automated parsing engine will match standard metric fastener sizes, compute dual PCS/KGS weights, and apply maximum volume tier discounts.
              </p>

              <div className="border-2 border-dashed border-slate-300 hover:border-[#0052CC] p-8 rounded-2xl text-center bg-slate-50 transition-colors cursor-pointer">
                <UploadCloud size={36} className="text-[#0052CC] mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-700 block">Drag &amp; drop your BOM file here</span>
                <span className="text-[11px] text-slate-400 mt-1 block">Supports .xlsx, .xls, .csv, .pdf (Max 25 MB)</span>
                <input type="file" required className="hidden" id="bomFileInput" />
                <label
                  htmlFor="bomFileInput"
                  className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer shadow-sm hover:bg-slate-100"
                >
                  Browse Computer
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBOMModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  {isUploading ? 'Parsing BOM File...' : 'Submit BOM for Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
