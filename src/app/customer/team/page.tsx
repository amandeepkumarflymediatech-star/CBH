'use client';

import React, { useState } from 'react';
import {
  Users2,
  ShieldCheck,
  Plus,
  Mail,
  UserCheck,
  Trash2,
  X,
  Lock
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  access: string;
  status: string;
}

const DEFAULT_TEAM: TeamMember[] = [
  { id: 'tm-1', name: 'Rajesh Sharma', role: 'Chief Procurement Officer', email: 'rajesh.sharma@apexinfra.in', access: 'Admin (Full PO & Credit Limit)', status: 'Active' },
  { id: 'tm-2', name: 'Vikram Joshi', role: 'Site Lead Engineer', email: 'vikram.j@apexinfra.in', access: 'Inspection & MTC Download', status: 'Active' },
  { id: 'tm-3', name: 'Pooja Verma', role: 'Accounts & Billing Lead', email: 'pooja.v@apexinfra.in', access: 'Invoices & Ledger Review', status: 'Active' },
];

export default function CustomerTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', email: '', access: 'Inspection & MTC Download' });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;
    const added: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newMember.name.trim(),
      role: newMember.role.trim() || 'Procurement Member',
      email: newMember.email.trim(),
      access: newMember.access,
      status: 'Active',
    };
    setTeam([...team, added]);
    setNewMember({ name: '', role: '', email: '', access: 'Inspection & MTC Download' });
    setIsInviteModalOpen(false);
  };

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to revoke portal permissions for this member?')) {
      setTeam(team.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Users2 className="w-5 h-5 text-[#0052CC]" />
            <span>Enterprise Procurement Team &amp; Permissions</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize project engineers, quality inspectors, and accounts personnel to download MTCs, review billing ledgers, or authorize purchase orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>+ Authorize Team Member</span>
        </button>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Authorized Member</th>
                <th className="py-3 px-4">Corporate Role</th>
                <th className="py-3 px-4">Permission Tier</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team.map((mem) => (
                <tr key={mem.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-[#0F172A] text-sm">{mem.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Mail size={11} /> {mem.email}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {mem.role}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-[#0052CC] text-[11px] font-bold">
                      <Lock size={11} /> {mem.access}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      {mem.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {mem.id !== 'tm-1' && (
                      <button
                        type="button"
                        onClick={() => handleRemove(mem.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                        title="Revoke access"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h3 className="font-extrabold text-[#0F172A] text-base">Authorize New Team Member</h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="py-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Sengupta"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="amit.s@apexinfra.in"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Company Role / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior QA/QC Inspection Manager"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Portal Access Level</label>
                <select
                  value={newMember.access}
                  onChange={(e) => setNewMember({ ...newMember, access: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800 bg-[#F8FAFC] focus:ring-2 focus:ring-[#0052CC] outline-none"
                >
                  <option value="Inspection & MTC Download">Inspection &amp; MTC Download (View-Only QA)</option>
                  <option value="Invoices & Ledger Review">Invoices &amp; Ledger Review (Finance Team)</option>
                  <option value="Full PO Authorization & Credit">Full PO Authorization &amp; Credit (Senior Procurement)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold shadow"
                >
                  Grant Portal Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
