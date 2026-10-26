'use client';

import React, { useState, useMemo, useEffect } from 'react';
import TablePagination from '@/components/common/TablePagination';
import { UserAccount } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Building,
  CreditCard,
  UserCheck,
  UserX
} from 'lucide-react';

interface AdminUsersSectionProps {
  users: UserAccount[];
  onAdd: (user: Omit<UserAccount, 'id'>) => Promise<void>;
  onUpdate: (user: UserAccount) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  showToast: (msg: string) => void;
}

export default function AdminUsersSection({
  users,
  onAdd,
  onUpdate,
  onDelete,
  showToast,
}: AdminUsersSectionProps) {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedVerified, setSelectedVerified] = useState('all');
  const [sortBy, setSortBy] = useState('credit_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserAccount | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserAccount | null>(null);

  // Add form fields
  const [addForm, setAddForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    gstin: '',
    role: 'CUSTOMER' as UserAccount['role'],
    tier: 'DIAMOND' as UserAccount['tier'],
    tierDiscountPct: '18',
    creditLimit: '2500000',
    isVerified: true,
    city: 'Bengaluru, KA',
  });

  // Filtered & Sorted users
  const filteredUsers = useMemo(() => {
    let list = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.companyName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.gstin.toLowerCase().includes(q) ||
          u.phone.includes(q)
      );
    }

    if (selectedRole !== 'all') {
      list = list.filter((u) => u.role.toLowerCase() === selectedRole.toLowerCase());
    }

    if (selectedTier !== 'all') {
      list = list.filter((u) => u.tier.toLowerCase() === selectedTier.toLowerCase());
    }

    if (selectedVerified === 'true') {
      list = list.filter((u) => u.isVerified);
    } else if (selectedVerified === 'false') {
      list = list.filter((u) => !u.isVerified);
    }

    if (sortBy === 'credit_desc') {
      list.sort((a, b) => b.creditLimit - a.creditLimit);
    } else if (sortBy === 'discount_desc') {
      list.sort((a, b) => b.tierDiscountPct - a.tierDiscountPct);
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortBy === 'company_asc') {
      list.sort((a, b) => a.companyName.localeCompare(b.companyName));
    }

    return list;
  }, [users, search, selectedRole, selectedTier, selectedVerified, sortBy]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRole, selectedTier, selectedVerified, sortBy]);

  // Sliced paginated users
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedRole('all');
    setSelectedTier('all');
    setSelectedVerified('all');
    setSortBy('credit_desc');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['Full Name', 'Company Name', 'Email', 'Phone', 'GSTIN', 'City', 'Role', 'Tier', 'Discount %', 'Credit Limit (INR)', 'Verified', 'Created At'];
    const rows = filteredUsers.map((u) => [
      `"${u.fullName}"`,
      `"${u.companyName}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      `"${u.gstin}"`,
      `"${u.city || ''}"`,
      `"${u.role}"`,
      `"${u.tier}"`,
      u.tierDiscountPct,
      u.creditLimit,
      u.isVerified ? 'Yes' : 'No',
      `"${u.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cbh_enterprise_accounts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredUsers.length} OEM accounts to CSV`);
  };

  const submitAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      fullName: addForm.fullName.trim(),
      companyName: addForm.companyName.trim() || 'Enterprise Client',
      email: addForm.email.trim().toLowerCase(),
      phone: addForm.phone.trim(),
      gstin: addForm.gstin.trim().toUpperCase() || 'UNREGISTERED',
      role: addForm.role,
      tier: addForm.tier,
      tierDiscountPct: parseFloat(addForm.tierDiscountPct) || 15,
      creditLimit: parseFloat(addForm.creditLimit) || 1000000,
      isVerified: addForm.isVerified,
      city: addForm.city || 'Mumbai, MH',
      createdAt: new Date().toISOString().split('T')[0],
    });

    setIsAddOpen(false);
    setAddForm({
      fullName: '',
      companyName: '',
      email: '',
      phone: '',
      gstin: '',
      role: 'CUSTOMER',
      tier: 'DIAMOND',
      tierDiscountPct: '18',
      creditLimit: '2500000',
      isVerified: true,
      city: 'Bengaluru, KA',
    });
  };

  const submitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    await onUpdate(editUser);
    setEditUser(null);
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    await onDelete(deleteUser.id);
    setDeleteUser(null);
  };

  const toggleVerification = async (user: UserAccount) => {
    const nextVerified = !user.isVerified;
    await onUpdate({
      ...user,
      isVerified: nextVerified,
    });
    showToast(`Account ${user.fullName} verification set to ${nextVerified ? 'VERIFIED' : 'PENDING'}`);
  };

  return (
    <div className="portal-main-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Registered Enterprise Accounts & Tier Credit ({users.length} OEM Clients)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Manage OEM plant procurement accounts, custom volume discount slabs, and revolving trade credit limits
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-outline"
            style={{ padding: '8px 14px', fontSize: '12px' }}
            onClick={handleExportCSV}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setIsAddOpen(true)}
          >
            <Plus size={15} />
            <span>Register OEM Account</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <div className="admin-search-wrap">
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search Name, Company, Email, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="admin-select"
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
          >
            <option value="all">Tier: All Tiers</option>
            <option value="BRONZE">Bronze (Base 0%)</option>
            <option value="SILVER">Silver (5% Off)</option>
            <option value="GOLD">Gold (10% Off)</option>
            <option value="PLATINUM">Platinum (15% Off)</option>
            <option value="DIAMOND">Diamond (18% Off)</option>
            <option value="VIP">VIP Master (22%+ Off)</option>
          </select>

          <select
            className="admin-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">Role: All Roles</option>
            <option value="CUSTOMER">OEM Customer</option>
            <option value="ADMIN">System Admin</option>
            <option value="METALLURGIST">Metallurgist / QC</option>
          </select>

          <select
            className="admin-select"
            value={selectedVerified}
            onChange={(e) => setSelectedVerified(e.target.value)}
          >
            <option value="all">KYC: All Accounts</option>
            <option value="true">Verified (GSTIN Active)</option>
            <option value="false">Pending Verification</option>
          </select>

          <select
            className="admin-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="credit_desc">Credit Limit: High to Low</option>
            <option value="discount_desc">Tier Discount: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="company_asc">Company: A to Z</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="admin-filter-count">
            Showing {filteredUsers.length} of {users.length} Accounts
          </span>
          {(search || selectedRole !== 'all' || selectedTier !== 'all' || selectedVerified !== 'all' || sortBy !== 'credit_desc') && (
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={handleResetFilters}
            >
              <RefreshCw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Contact Person & City</th>
              <th>Company & GSTIN</th>
              <th>System Role</th>
              <th>Procurement Tier</th>
              <th>Tier Discount</th>
              <th>Revolving Credit Limit</th>
              <th>GSTIN KYC</th>
              <th>Registered</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="admin-empty-state">
                    <AlertTriangle size={32} color="#D97706" style={{ margin: '0 auto' }} />
                    <h4>No Enterprise Accounts Matched</h4>
                    <p>No user accounts match your filter criteria.</p>
                    <button type="button" className="btn-outline" onClick={handleResetFilters}>
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => {
                return (
                  <tr key={u.id}>
                    <td>
                      <strong style={{ color: 'var(--color-dark-900)' }}>
                        {u.fullName}
                      </strong>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {u.email} | {u.phone}
                      </div>
                      <div style={{ fontSize: '11px', color: '#0284C7', fontWeight: 600 }}>
                        {u.city || 'India Depot'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-dark-900)' }}>
                        {u.companyName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        GST: {u.gstin}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-surplus' : 'badge-certified'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-vip">
                        {u.tier} TIER
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#059669' }}>
                      -{u.tierDiscountPct}% Slab
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {formatINR(u.creditLimit)}
                    </td>
                    <td>
                      {u.isVerified ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '12px', fontWeight: 700 }}>
                          <CheckCircle2 size={13} /> Verified
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#D97706', fontSize: '12px', fontWeight: 600 }}>
                          <AlertTriangle size={13} /> Pending
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                        {u.createdAt}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-toggle"
                          onClick={() => toggleVerification(u)}
                          title={u.isVerified ? 'Mark Pending' : 'Verify GSTIN'}
                        >
                          {u.isVerified ? <UserX size={12} /> : <UserCheck size={12} />}
                          <span>{u.isVerified ? 'Unverify' : 'Verify'}</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-edit"
                          onClick={() => setEditUser({ ...u })}
                          title="Edit Account & Tier Details"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-delete"
                          onClick={() => setDeleteUser(u)}
                          title="Suspend / Delete Account"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="client accounts"
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="modal-overlay active" onClick={() => setIsAddOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                Register Enterprise OEM Client Account
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitAddForm}>
              <div className="admin-modal-grid">
                <div className="admin-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Sengupta"
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Company / Plant Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Larsen & Infra Works Ltd."
                    value={addForm.companyName}
                    onChange={(e) => setAddForm({ ...addForm, companyName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. procurement@larseninfra.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98220 54321"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>GSTIN Tax ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 24AABCL8810M1Z4"
                    value={addForm.gstin}
                    onChange={(e) => setAddForm({ ...addForm, gstin: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Plant City & State</label>
                  <input
                    type="text"
                    placeholder="e.g. Gandhinagar, GJ"
                    value={addForm.city}
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Account Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as any })}
                  >
                    <option value="CUSTOMER">CUSTOMER (OEM Procurement)</option>
                    <option value="METALLURGIST">METALLURGIST (Quality Audit)</option>
                    <option value="ADMIN">ADMIN (Central Console)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Procurement Tier</label>
                  <select
                    value={addForm.tier}
                    onChange={(e) => {
                      const tier = e.target.value as UserAccount['tier'];
                      let disc = '0';
                      if (tier === 'SILVER') disc = '5';
                      else if (tier === 'GOLD') disc = '10';
                      else if (tier === 'PLATINUM') disc = '15';
                      else if (tier === 'DIAMOND') disc = '18';
                      else if (tier === 'VIP') disc = '22';
                      setAddForm({ ...addForm, tier, tierDiscountPct: disc });
                    }}
                  >
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                    <option value="DIAMOND">DIAMOND</option>
                    <option value="VIP">VIP MASTER</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Tier Discount Slab (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={addForm.tierDiscountPct}
                    onChange={(e) => setAddForm({ ...addForm, tierDiscountPct: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Revolving Trade Credit Limit (₹)</label>
                  <input
                    type="number"
                    step="50000"
                    value={addForm.creditLimit}
                    onChange={(e) => setAddForm({ ...addForm, creditLimit: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <ShieldCheck size={15} />
                  <span>Register OEM Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal-overlay active" onClick={() => setEditUser(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                  Edit Account: {editUser.fullName}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {editUser.companyName}
                </span>
              </div>
              <button type="button" onClick={() => setEditUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitEditForm}>
              <div className="admin-modal-grid">
                <div className="admin-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editUser.fullName}
                    onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={editUser.companyName}
                    onChange={(e) => setEditUser({ ...editUser, companyName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Procurement Tier</label>
                  <select
                    value={editUser.tier}
                    onChange={(e) => setEditUser({ ...editUser, tier: e.target.value as any })}
                  >
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                    <option value="DIAMOND">DIAMOND</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Tier Discount Slab (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={editUser.tierDiscountPct}
                    onChange={(e) => setEditUser({ ...editUser, tierDiscountPct: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Credit Limit (₹)</label>
                  <input
                    type="number"
                    step="50000"
                    value={editUser.creditLimit}
                    onChange={(e) => setEditUser({ ...editUser, creditLimit: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>GSTIN KYC Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '40px' }}>
                    <input
                      type="checkbox"
                      id="editVerifyCheck"
                      checked={editUser.isVerified}
                      onChange={(e) => setEditUser({ ...editUser, isVerified: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="editVerifyCheck" style={{ margin: 0, textTransform: 'none', cursor: 'pointer' }}>
                      Verified GSTIN & Credit Approved
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setEditUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <CheckCircle2 size={15} />
                  <span>Save Account Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="modal-overlay active" onClick={() => setDeleteUser(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '440px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: 'var(--color-dark-900)' }}>
                Suspend / Remove Account?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                Are you sure you want to suspend account <strong>{deleteUser.fullName}</strong> ({deleteUser.companyName})?
                This will revoke their trade credit and procurement portal access.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => setDeleteUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, background: '#DC2626' }}
                onClick={confirmDelete}
              >
                Yes, Suspend Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
