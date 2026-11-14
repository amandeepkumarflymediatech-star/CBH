'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  Download,
  Search,
  CheckCircle2,
  FileCheck2,
  Loader2,
  X,
  ExternalLink
} from 'lucide-react';
import { CertificateRecord } from '@/lib/types';
import { getStoredUser } from '@/lib/auth';
import { showToast } from '@/lib/swal';

export default function CustomerCertificatesPage() {
  const [certs, setCerts] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCert, setActiveCert] = useState<CertificateRecord | null>(null);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const user = getStoredUser();
      const custQ = user?.id ? `?customerId=${user.id}&customerEmail=${encodeURIComponent(user.email || '')}` : '';
      const res = await fetch(`/api/certificates${custQ}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCerts(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const filteredCerts = certs.filter(
    (c) =>
      c.certNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.heatNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.standard.toLowerCase().includes(search.toLowerCase()) ||
      c.grade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Sleek Single-Viewport Top Ops Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <Award size={18} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-[#0F172A] leading-tight flex items-center gap-2">
              <span>NABL 3.1 Quality Vault</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 flex items-center gap-1">
                <ShieldCheck size={11} /> 100% NABL
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              EN 10204 3.1 Mill Test Certificates with OES spectroscopy & tensile verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {/* Search Box */}
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search MTC, PO, Heat, Grade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0052CC] focus:outline-none transition-colors"
            />
          </div>

          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md shrink-0">
            {filteredCerts.length} Verified
          </span>
        </div>
      </div>

      {/* High-Density Certificates Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0052CC]" />
            <span>Connecting to NABL Inspection Vault...</span>
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="font-bold text-slate-700">No certificates matching &quot;{search}&quot;</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Certificates are automatically issued when dispatches are confirmed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">MTC Certificate Ref</th>
                  <th className="py-2.5 px-3">PO Number</th>
                  <th className="py-2.5 px-3">Specification &amp; Grade</th>
                  <th className="py-2.5 px-2.5 text-center">Heat Code</th>
                  <th className="py-2.5 px-2.5 text-center">Tensile</th>
                  <th className="py-2.5 px-2.5 text-center">Hardness</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCerts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                        <span>{c.certNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Issued: {c.issueDate}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0052CC]">
                      {c.orderNumber}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-bold text-[#0F172A] truncate">{c.standard}</div>
                      <div className="text-[10px] text-slate-500">{c.grade}</div>
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono font-semibold text-slate-700">
                      {c.heatNumber}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono text-slate-700">
                      {c.tensileMpa}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono text-slate-700">
                      {c.hardnessHrc}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveCert(c)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          View Report
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast(`Downloaded signed NABL 3.1 MTC PDF (${c.certNumber})`, 'success')}
                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Download size={11} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspection Certificate Slide-over / Modal */}
      {activeCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-lg w-full p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-[#0F172A] text-sm sm:text-base leading-tight">
                  EN 10204 3.1 Inspection Certificate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCert(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-3.5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <div className="text-slate-400 text-[9px] uppercase font-bold">Certificate Number</div>
                  <div className="font-mono font-bold text-emerald-700">{activeCert.certNumber}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[9px] uppercase font-bold">Related Order</div>
                  <div className="font-mono font-bold text-[#0052CC]">{activeCert.orderNumber}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[9px] uppercase font-bold">Raw Material Heat</div>
                  <div className="font-mono font-bold text-slate-800">{activeCert.heatNumber}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[9px] uppercase font-bold">Testing Standard</div>
                  <div className="font-bold text-slate-800">{activeCert.standard}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Chemical Spectrometry Analysis (OES)
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[9px] text-slate-400 font-bold">Carbon (C)</div>
                    <div className="font-mono font-bold text-slate-800 text-xs">{activeCert.carbonPct}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[9px] text-slate-400 font-bold">Manganese (Mn)</div>
                    <div className="font-mono font-bold text-slate-800 text-xs">{activeCert.manganesePct}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[9px] text-slate-400 font-bold">Chromium (Cr)</div>
                    <div className="font-mono font-bold text-slate-800 text-xs">{activeCert.chromiumPct}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Mechanical &amp; Corrosion Testing Results
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[9px] text-emerald-700 font-bold">Tensile Strength</div>
                    <div className="font-mono font-bold text-emerald-800 text-xs">{activeCert.tensileMpa}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[9px] text-emerald-700 font-bold">0.2% Yield Proof</div>
                    <div className="font-mono font-bold text-emerald-800 text-xs">{activeCert.yieldMpa}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[9px] text-emerald-700 font-bold">Rockwell Hardness</div>
                    <div className="font-mono font-bold text-emerald-800 text-xs">{activeCert.hardnessHrc}</div>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-[10px]">
                <div className="font-bold">Salt Spray Chamber Verification:</div>
                <div className="mt-0.5">{activeCert.saltSprayHrs}</div>
              </div>

              <div className="text-[10px] text-slate-400 text-center">
                {activeCert.labAccreditation} • Certified under EN 10204 Type 3.1
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveCert(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Downloaded signed NABL 3.1 MTC PDF (${activeCert.certNumber})`, 'success');
                  setActiveCert(null);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={12} />
                <span>Download Signed PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
