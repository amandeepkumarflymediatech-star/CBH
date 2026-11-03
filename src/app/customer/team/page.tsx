'use client';

import React, { useState, useEffect } from 'react';
import {
  Users2,
  ShieldCheck,
  Plus,
  Mail,
  UserCheck,
  Trash2,
  X,
  Lock,
  Phone,
  Loader2,
  User
} from 'lucide-react';
import { getStoredUser, setStoredUser, AuthUser } from '@/lib/auth';
import { TeamMember } from '@/lib/types';
import { showToast } from '@/lib/swal';

export default function CustomerTeamPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    access: 'Inspection & MTC Download',
  });

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);

    if (user?.teamMembers && Array.isArray(user.teamMembers) && user.teamMembers.length > 0) {
      setTeam(user.teamMembers);
    } else if (user?.fullName) {
      // Default to Primary Account Officer
      const primary: TeamMember = {
        id: 'tm-primary',
        name: user.fullName,
        role: user.designation || 'Primary Account Officer',
        email: user.email,
        phone: user.phone || '+91 Contact on File',
        access: 'Admin (Full PO & Credit Sign-off)',
        status: 'Active',
      };
      setTeam([primary]);
    }

    // Refresh from API
    if (user?.id) {
      fetch(`/api/users?search=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.users && data.users.length > 0) {
            const matched = data.users.find((u: any) => u.id === Number(user.id) || u.email === user.email);
            if (matched && Array.isArray(matched.teamMembers) && matched.teamMembers.length > 0) {
              setTeam(matched.teamMembers);
              const updated = { ...user, teamMembers: matched.teamMembers };
              setStoredUser(updated);
              setCurrentUser(updated);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const persistTeam = async (updatedTeam: TeamMember[]) => {
    setTeam(updatedTeam);
    const user = getStoredUser() || currentUser;
    if (user) {
      const updatedUser: AuthUser = { ...user, teamMembers: updatedTeam };
      setStoredUser(updatedUser);
      setCurrentUser(updatedUser);

      if (user.id) {
        setIsSaving(true);
        try {
          await fetch('/api/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              teamMembers: updatedTeam,
            }),
          });
        } catch (err) {
          console.warn('Background sync failed:', err);
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim()) return;

    const added: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newMember.name.trim(),
      role: newMember.role.trim() || 'Procurement Member',
      email: newMember.email.trim(),
      phone: newMember.phone.trim() || '+91 Contact on File',
      access: newMember.access,
      status: 'Active',
    };

    const updated = [...team, added];
    await persistTeam(updated);
    setNewMember({
      name: '',
      role: '',
      email: '',
      phone: '',
      access: 'Inspection & MTC Download',
    });
    setIsInviteModalOpen(false);
    showToast(`Authorized team member "${added.name}"!`, 'success');
  };

  const handleRemove = async (id: string) => {
    if (confirm('Are you sure you want to revoke portal permissions for this member?')) {
      const updated = team.filter((t) => t.id !== id);
      await persistTeam(updated);
      showToast('Team member access revoked.', 'info');
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
          className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          <span>Authorize Team Member</span>
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
                    <div className="font-extrabold text-[#0F172A] text-sm flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {mem.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{mem.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5 ml-9">
                      <Mail size={11} /> {mem.email}
                      {mem.phone && (
                        <>
                          <span className="mx-1">•</span>
                          <Phone size={11} /> {mem.phone}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{mem.role}</td>
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
                    {mem.id !== 'tm-primary' && (
                      <button
                        type="button"
                        onClick={() => handleRemove(mem.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-300 max-w-lg w-full p-4 sm:p-6 shadow-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h3 className="font-extrabold text-[#0F172A] text-base leading-tight">
                Authorize New Team Member
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="py-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Mehta"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Corporate Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QA Inspection Lead"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Official Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="member@company.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="+91 98000 00000"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0052CC] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Permission Tier
                </label>
                <select
                  value={newMember.access}
                  onChange={(e) => setNewMember({ ...newMember, access: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0052CC] focus:outline-none bg-white"
                >
                  <option value="Inspection & MTC Download">Inspection &amp; MTC Download Only</option>
                  <option value="BOM Upload & RFQ Drafting">BOM Upload &amp; RFQ Drafting</option>
                  <option value="Billing & Invoices Audit">Billing &amp; Invoices Audit</option>
                  <option value="Full PO Sign-off & Credit Draw">Full PO Sign-off &amp; Credit Draw</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Authorize Officer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
