'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Truck,
  FileText,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  ChevronRight
} from 'lucide-react';
import TablePagination from '@/components/common/TablePagination';
import { CustomerOrder } from '@/lib/types';
import { INITIAL_ORDERS } from '@/lib/mock-data';
import { formatINR } from '@/lib/rfq-calculator';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [activeMtcModal, setActiveMtcModal] = useState<CustomerOrder | null>(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setOrders(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== 'ALL') {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.shippingAddress.toLowerCase().includes(q) ||
          o.carrier.toLowerCase().includes(q) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#0052CC]" />
            <span>Purchase Orders &amp; Live Freight Logistics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time truck LR tracking, dispatch weighbridge slips, and automated EN 10204 3.1 MTC inspection certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <span>+ Place New PO</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by PO Number, Pincode, Carrier, or LR Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {['ALL', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#0052CC] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">PO Number &amp; Date</th>
                <th className="py-3 px-4">Consignee Site</th>
                <th className="py-3 px-3 text-right">Net Value</th>
                <th className="py-3 px-3 text-center">Gross Weight</th>
                <th className="py-3 px-4">Carrier &amp; LR Docket</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Documentation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-slate-600">No purchase orders found matching criteria.</p>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-[#0052CC] text-sm">{ord.orderNumber}</div>
                    <div className="text-[11px] text-slate-400">{ord.dispatchDate || 'Immediate Dispatch'}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-[#0F172A] truncate">{ord.shippingAddress}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Consignee: {ord.companyName || ord.customerName || 'Direct Facility'}</div>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#0F172A]">
                    {formatINR(ord.netAmount)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                    {ord.totalWeightKg.toFixed(1)} Kg
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{ord.carrier}</div>
                    <div className="font-mono text-[11px] text-[#0052CC]">
                      LR: {ord.trackingNumber || 'Awaiting Allocation'}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ord.status === 'DISPATCHED'
                        ? 'bg-blue-50 text-[#0052CC] border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveInvoiceModal(ord)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                        title="View GST Tax Invoice"
                      >
                        Invoice
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMtcModal(ord)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052CC] text-[11px] font-bold transition-colors"
                        title="Download NABL MTC Certificate"
                      >
                        MTC 3.1
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {filteredOrders.length > 0 && (
          <div className="p-4 border-t border-slate-200">
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setCurrentPage(1);
              }}
              itemLabel="orders"
            />
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-[#0F172A] text-base">GST Tax Invoice: {activeInvoiceModal.orderNumber}</h3>
                <span className="text-xs text-slate-500 font-mono">Carrier: {activeInvoiceModal.carrier}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Goods Total:</span>
                <span className="font-mono font-bold">{formatINR(Math.round((activeInvoiceModal.netAmount / 1.18) * 1.05))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wholesale Tier Rebate:</span>
                <span className="font-mono text-emerald-600 font-bold">- {formatINR(Math.round((activeInvoiceModal.netAmount / 1.18) * 0.05))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST (18% IGST):</span>
                <span className="font-mono font-bold">{formatINR(Math.round(activeInvoiceModal.netAmount - (activeInvoiceModal.netAmount / 1.18)))}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                <span>Final Payable Invoice Amount:</span>
                <span className="font-mono text-[#0052CC]">{formatINR(activeInvoiceModal.netAmount)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer size={14} /> Print Formal Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MTC Modal */}
      {activeMtcModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" />
                <h3 className="font-extrabold text-[#0F172A] text-base">NABL MTC 3.1 Inspection Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMtcModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Official EN 10204 3.1 Mill Test Certificate certifying raw material heat chemistry, core hardness (HRC 28-34), proof load tensile rupture verification, and ASTM B117 salt spray protection.
              </p>
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                <div>Document: <strong>MTC-CBH-2026-9812</strong></div>
                <div>Standard: <strong>DIN 933 / ISO 4017 Class 8.8</strong></div>
                <div>Accreditation: <strong>NABL TC-8842 Certified Lab</strong></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveMtcModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => alert('MTC PDF downloaded.')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Download size={14} /> Download Verified PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
