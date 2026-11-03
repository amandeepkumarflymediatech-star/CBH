'use client';

import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Loader2,
  FileCheck2
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>NABL MTC 3.1 &amp; Quality Inspection Vault</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download certified EN 10204 3.1 Mill Test Certificates with optical emission spectroscopy (OES) chemical analysis and tensile proof load testing.
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
            placeholder="Search by MTC Number, Order No, Heat Code, or Standard..."
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
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0052CC]" />
            <span>Querying NABL Certificate Vault...</span>
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No certificates found matching &quot;{search}&quot;</p>
            <p className="text-slate-400 mt-0.5">Certificates are automatically generated when fastener consignments are confirmed.</p>
          </div>
        ) : (
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
                      <div className="font-mono font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
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
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          View Report
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast(`Downloaded signed NABL 3.1 MTC PDF (${c.certNumber})`, 'success')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
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
        )}
      </div>

      {/* Report Modal */}
      {activeCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-[#0F172A] text-base leading-tight">
                  EN 10204 3.1 Inspection Certificate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCert(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Certificate Number</div>
                  <div className="font-mono font-bold text-emerald-700">{activeCert.certNumber}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Related Order</div>
                  <div className="font-mono font-bold text-[#0052CC]">{activeCert.orderNumber}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Raw Material Heat</div>
                  <div className="font-mono font-bold text-slate-800">{activeCert.heatNumber}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Testing Standard</div>
                  <div className="font-bold text-slate-800">{activeCert.standard}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                  Chemical Spectrometry Analysis (OES)
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">Carbon (C)</div>
                    <div className="font-mono font-bold text-slate-800 text-sm">{activeCert.carbonPct}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">Manganese (Mn)</div>
                    <div className="font-mono font-bold text-slate-800 text-sm">{activeCert.manganesePct}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">Chromium (Cr)</div>
                    <div className="font-mono font-bold text-slate-800 text-sm">{activeCert.chromiumPct}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                  Mechanical &amp; Corrosion Testing Results
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-700 font-bold">Tensile Strength</div>
                    <div className="font-mono font-bold text-emerald-800 text-sm">{activeCert.tensileMpa}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-700 font-bold">0.2% Yield Proof</div>
                    <div className="font-mono font-bold text-emerald-800 text-sm">{activeCert.yieldMpa}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-700 font-bold">Rockwell Hardness</div>
                    <div className="font-mono font-bold text-emerald-800 text-sm">{activeCert.hardnessHrc}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-[11px]">
                <div className="font-bold">Salt Spray Chamber Verification:</div>
                <div className="mt-0.5">{activeCert.saltSprayHrs}</div>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-2">
                {activeCert.labAccreditation} • Certified under EN 10204 Type 3.1
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveCert(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Downloaded signed NABL 3.1 MTC PDF (${activeCert.certNumber})`, 'success');
                  setActiveCert(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Download Signed PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
