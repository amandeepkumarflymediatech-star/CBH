'use client';

import React, { useState, useEffect } from 'react';
import AdminUsersSection from '@/components/admin/AdminUsersSection';
import { UserAccount } from '@/lib/types';
import { INITIAL_USERS } from '@/lib/mock-data';
import { CheckCircle2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (userData: Omit<UserAccount, 'id'>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUsers((prev) => [data.data, ...prev]);
        showToast(`Account for ${userData.companyName} created.`);
      } else {
        const localUser: UserAccount = { ...userData, id: Date.now() };
        setUsers((prev) => [localUser, ...prev]);
        showToast(`Account for ${userData.companyName} created.`);
      }
    } catch {
      const localUser: UserAccount = { ...userData, id: Date.now() };
      setUsers((prev) => [localUser, ...prev]);
      showToast(`Account for ${userData.companyName} created.`);
    }
  };

  const handleUpdateUser = async (updated: UserAccount) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? data.data : u)));
        showToast(`Account for ${updated.companyName} updated.`);
      } else {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        showToast(`Account for ${updated.companyName} updated.`);
      }
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`Account for ${updated.companyName} updated.`);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast('Account removed.');
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast('Account deleted.');
      }
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('Account deleted.');
    }
  };

  return (
    <div>
      <AdminUsersSection
        users={users}
        onAdd={handleAddUser}
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
        showToast={showToast}
      />

      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={16} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
