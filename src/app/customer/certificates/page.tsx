'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  ShieldCheck,
  Download,
  Search,
  CheckCircle2,
  FileText,
  Printer,
  X,
  ExternalLink
} from 'lucide-react';
import TablePagination from '@/components/common/TablePagination';
import { showToast } from '@/lib/swal';

interface CertificateRecord {
  id: string;
  certNumber: string;
  orderNumber: string;
  heatNumber: string;
  standard: string;
  grade: string;
  itemsCovered: string;
  issueDate: string;
  labAccreditation: string;
  carbonPct: string;
  manganesePct: string;
  chromiumPct: string;
  tensileMpa: string;
  yieldMpa: string;
  hardnessHrc: string;
  saltSprayHrs: string;
}

const SAMPLE_CERTS: CertificateRecord[] = [];

export default function CustomerCertificatesPage() {
  const [certs, setCerts] = useState<CertificateRecord[]>(SAMPLE_CERTS);
  const [search, setSearch] = useState('');
  const [activeCert, setActiveCert] = useState<CertificateRecord | null>(null);

  const filteredCerts = certs.filter(
    (c) =>
      c.certNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.heatNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.standard.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>NABL MTC 3.1 &amp; Quality Inspection Vault</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download certified EN 10204 3.1 Mill Test Certificates with chemical spectrometry (OES) analysis and proof load tensile testing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={15} /> 100% NABL Accredited
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by MTC Number, Order No, Heat Number, or Standard..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          {filteredCerts.length} Verified Certificates
        </span>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Certificate Ref</th>
                <th className="py-3 px-4">Related PO Number</th>
                <th className="py-3 px-4">Specification &amp; Grade</th>
                <th className="py-3 px-3 text-center">Steel Heat Code</th>
                <th className="py-3 px-3 text-center">Tensile Strength</th>
                <th className="py-3 px-3 text-center">Hardness</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCerts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span>{c.certNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Issued: {c.issueDate}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0052CC]">
                    {c.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-[#0F172A]">{c.standard}</div>
                    <div className="text-[11px] text-slate-500">{c.grade}</div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                    {c.heatNumber}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                    {c.tensileMpa}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                    {c.hardnessHrc}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveCert(c)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                      >
                        View Report
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Downloading signed MTC PDF (${c.certNumber})...`, 'info')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors flex items-center gap-1"
                      >
                        <Download size={12} /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MTC Full Report Modal */}
      {activeCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-2xl w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-[#0F172A] text-base">NABL MTC 3.1 Chemical &amp; Mechanical Inspection Report</h3>
                <span className="text-xs text-slate-500 font-mono">Certificate: {activeCert.certNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveCert(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>Standard: <strong>{activeCert.standard}</strong></div>
                <div>Class/Grade: <strong>{activeCert.grade}</strong></div>
                <div>Primary Heat Code: <strong>{activeCert.heatNumber}</strong></div>
                <div>Accreditation: <strong>{activeCert.labAccreditation}</strong></div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase block mb-2">Spectrometry Chemical Analysis (OES):</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-center">
                  <div className="bg-slate-50 p-2 rounded border">Carbon (C): <strong>{activeCert.carbonPct}</strong></div>
                  <div className="bg-slate-50 p-2 rounded border">Manganese (Mn): <strong>{activeCert.manganesePct}</strong></div>
                  <div className="bg-slate-50 p-2 rounded border">Chromium (Cr): <strong>{activeCert.chromiumPct}</strong></div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase block mb-2">Mechanical &amp; Surface Metallurgy Results:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                  <div className="bg-slate-50 p-2.5 rounded border">Tensile Strength: <strong>{activeCert.tensileMpa}</strong></div>
                  <div className="bg-slate-50 p-2.5 rounded border">Proof Yield Strength: <strong>{activeCert.yieldMpa}</strong></div>
                  <div className="bg-slate-50 p-2.5 rounded border">Core Hardness: <strong>{activeCert.hardnessHrc}</strong></div>
                  <div className="bg-slate-50 p-2.5 rounded border">Salt Fog Protection: <strong>{activeCert.saltSprayHrs}</strong></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveCert(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer size={14} /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
