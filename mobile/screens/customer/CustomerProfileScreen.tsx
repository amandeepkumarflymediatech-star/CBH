import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { getMobileStoredUser, DEMO_MOBILE_CUSTOMER, setMobileStoredUser } from '../../config/auth';
import { MobileAuthUser } from '../../types';

interface DispatchSite {
  id: string;
  name: string;
  address: string;
  isPrimary: boolean;
}

interface CustomerProfileScreenProps {
  user?: MobileAuthUser | null;
  onUpdateUser?: (updated: MobileAuthUser) => void;
  onLogout: () => void;
  onSwitchToAdmin?: () => void;
  onNavigateToCertificates: () => void;
}

export const CustomerProfileScreen: React.FC<CustomerProfileScreenProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onSwitchToAdmin,
  onNavigateToCertificates,
}) => {
  // 1. DYNAMIC PROFILE STATE (Priority: prop user -> stored user -> fallback)
  const initialUser: MobileAuthUser = user || getMobileStoredUser() || DEMO_MOBILE_CUSTOMER;
  const [currentUser, setCurrentUser] = useState<MobileAuthUser>(initialUser);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // 2. DISPATCH SITES LIST (CRUD for Delivery Locations)
  const [dispatchSites, setDispatchSites] = useState<DispatchSite[]>([
    {
      id: 'site_1',
      name: 'Primary Factory Depot',
      address: initialUser.address || 'Plot 42, Peenya Industrial Area Phase II, Bengaluru, KA - 560058',
      isPrimary: true,
    },
    {
      id: 'site_2',
      name: 'Regional Fabrication Yard',
      address: 'Plot 108, Whitefield Logistics Corridor, Bengaluru, KA - 560066',
      isPrimary: false,
    },
  ]);

  // 3. EDIT PROFILE MODAL STATE
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>(currentUser.fullName || '');
  const [editCompanyName, setEditCompanyName] = useState<string>(currentUser.companyName || '');
  const [editPhone, setEditPhone] = useState<string>(currentUser.phone || '');
  const [editGstin, setEditGstin] = useState<string>(currentUser.gstin || '');
  const [editAddress, setEditAddress] = useState<string>(
    currentUser.address || 'Plot 42, Peenya Industrial Area Phase II, Bengaluru, KA - 560058'
  );
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // 4. ADD DISPATCH SITE MODAL STATE
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState<boolean>(false);
  const [newSiteName, setNewSiteName] = useState<string>('');
  const [newSiteAddress, setNewSiteAddress] = useState<string>('');
  const [isSavingSite, setIsSavingSite] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Sync state whenever parent prop changes (e.g. after login with new credentials)
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setEditFullName(user.fullName || '');
      setEditCompanyName(user.companyName || '');
      setEditPhone(user.phone || '');
      setEditGstin(user.gstin || '');
      setEditAddress(user.address || 'Plot 42, Peenya Industrial Area Phase II, Bengaluru, KA - 560058');
    }
  }, [user]);

  // LIVE SYNC: Fetch fresh profile data directly from database via API
  const fetchLiveProfile = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      if (currentUser.email) {
        const res = await mobileApi.users.getAll({ search: currentUser.email });
        if (res.users && res.users.length > 0) {
          const matched = res.users.find(
            (u) => u.email.toLowerCase() === currentUser.email.toLowerCase()
          );
          if (matched) {
            const synced: MobileAuthUser = {
              ...currentUser,
              id: matched.id,
              fullName: matched.fullName || currentUser.fullName,
              companyName: matched.companyName || currentUser.companyName,
              phone: matched.phone || currentUser.phone,
              gstin: matched.gstin || currentUser.gstin,
              tier: matched.tier || currentUser.tier,
              tierDiscountPct: matched.tierDiscountPct ?? currentUser.tierDiscountPct,
              creditLimit: matched.creditLimit ?? currentUser.creditLimit,
              address: matched.address || currentUser.address,
              role: (matched.role ? matched.role.toLowerCase() : 'customer') as any,
            };
            setCurrentUser(synced);
            setMobileStoredUser(synced);
            if (onUpdateUser) onUpdateUser(synced);
          }
        }
      }
    } catch (err) {
      console.warn('[Customer Profile] Live fetch sync error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentUser.email]);

  useEffect(() => {
    fetchLiveProfile(false);
  }, []);

  // CRUD: UPDATE PROFILE
  const handleOpenEdit = () => {
    setEditFullName(currentUser.fullName);
    setEditCompanyName(currentUser.companyName);
    setEditPhone(currentUser.phone || '');
    setEditGstin(currentUser.gstin || '');
    setEditAddress(
      currentUser.address || 'Plot 42, Peenya Industrial Area Phase II, Bengaluru, KA - 560058'
    );
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim() || !editCompanyName.trim()) {
      Alert.alert('Validation Error', 'Full Name and Registered Company Name are required.');
      return;
    }

    if (editGstin.trim() && editGstin.trim().length !== 15) {
      Alert.alert('Invalid GSTIN', 'GSTIN must be a 15-character Indian tax identification number.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedData: Partial<MobileAuthUser> & { id: number | string } = {
        id: currentUser.id,
        fullName: editFullName.trim(),
        companyName: editCompanyName.trim(),
        phone: editPhone.trim(),
        gstin: editGstin.trim().toUpperCase(),
        address: editAddress.trim(),
      };

      // Call backend PUT /api/users
      await mobileApi.users.update(updatedData as any);

      const mergedUser: MobileAuthUser = {
        ...currentUser,
        fullName: updatedData.fullName || currentUser.fullName,
        companyName: updatedData.companyName || currentUser.companyName,
        phone: updatedData.phone || currentUser.phone,
        gstin: updatedData.gstin || currentUser.gstin,
        address: updatedData.address || currentUser.address,
      };

      setCurrentUser(mergedUser);
      setMobileStoredUser(mergedUser);
      if (onUpdateUser) onUpdateUser(mergedUser);

      // Also update primary dispatch site
      setDispatchSites((prev) =>
        prev.map((site) =>
          site.isPrimary ? { ...site, address: updatedData.address || site.address } : site
        )
      );

      setIsEditModalOpen(false);
      showToast('Profile and business registration updated successfully!');
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // CRUD: CREATE DISPATCH SITE
  const handleAddSite = () => {
    if (!newSiteName.trim() || !newSiteAddress.trim()) {
      Alert.alert('Validation Error', 'Site label and dispatch address are required.');
      return;
    }
    const newSite: DispatchSite = {
      id: `site_${Date.now()}`,
      name: newSiteName.trim(),
      address: newSiteAddress.trim(),
      isPrimary: false,
    };
    setDispatchSites((prev) => [...prev, newSite]);
    setNewSiteName('');
    setNewSiteAddress('');
    setIsAddSiteModalOpen(false);
    showToast(`Added ${newSite.name} to delivery locations!`);
  };

  // CRUD: DELETE DISPATCH SITE
  const handleDeleteSite = (siteId: string) => {
    Alert.alert(
      'Remove Delivery Location',
      'Are you sure you want to remove this dispatch site from your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setDispatchSites((prev) => prev.filter((s) => s.id !== siteId));
            showToast('Delivery location removed.');
          },
        },
      ]
    );
  };

  // CRUD: DELETE / DEACTIVATE ACCOUNT
  const handleDeactivateAccount = () => {
    Alert.alert(
      'Deactivate Procurement Account',
      'Are you sure you want to request account deactivation? All pending RFQs and order records will be archived.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              if (currentUser.id) {
                await mobileApi.users.delete(currentUser.id);
              }
              onLogout();
            } catch {
              onLogout();
            }
          },
        },
      ]
    );
  };

  // Avatar Initials
  const getInitials = (name?: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const tierName = (currentUser.tier || 'DIAMOND').toUpperCase();
  const rebatePct = currentUser.tierDiscountPct || (tierName === 'DIAMOND' ? 18 : tierName === 'PLATINUM' ? 12 : tierName === 'GOLD' ? 8 : 5);
  const creditLimitFormatted = Number(currentUser.creditLimit || 2500000).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => fetchLiveProfile(true)}
          colors={['#0047AB', '#FF6B00']}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* 1. DYNAMIC HEADER PROFILE CARD */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(currentUser.fullName)}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {currentUser.fullName}
            </Text>
            <TouchableOpacity
              onPress={handleOpenEdit}
              style={styles.editPillBtn}
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.editPillBtnText}>✏ Edit</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userCompany} numberOfLines={1}>
            {currentUser.companyName}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            ✉ {currentUser.email}
          </Text>

          <View style={styles.badgesRow}>
            <View style={styles.tierPill}>
              <Text style={styles.tierText}>★ {tierName} TIER ({rebatePct}% Rebate)</Text>
            </View>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedText}>✔ Verified B2B</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. DYNAMIC CORPORATE 30-DAY CREDIT LINE CARD */}
      <MobileCard>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.creditTitle}>Corporate 30D Revolving Credit</Text>
          <View style={styles.creditStatusTag}>
            <Text style={styles.creditStatusText}>Active Facility</Text>
          </View>
        </View>

        <Text style={styles.creditValue}>₹{creditLimitFormatted} Available</Text>
        <Text style={styles.creditSubtext}>
          Approved for Net 30-Day billing terms across all fastener factory orders.
        </Text>

        <View style={styles.barBg}>
          <View style={styles.barFill} />
        </View>
        <View style={styles.creditMetaRow}>
          <Text style={styles.creditMetaKey}>Utilized: ₹0.00</Text>
          <Text style={styles.creditMetaVal}>Drawdown: 100% Available</Text>
        </View>
      </MobileCard>

      {/* 3. COMMERCIAL BUSINESS REGISTRATION DETAILS */}
      <MobileCard>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionHeading}>Business Registration &amp; Tax</Text>
          <TouchableOpacity onPress={handleOpenEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.inlineEditLink}>Edit Details →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Company Name:</Text>
          <Text style={styles.detailVal}>{currentUser.companyName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>GSTIN Tax ID:</Text>
          <Text style={[styles.detailVal, styles.gstinVal]}>
            {currentUser.gstin || '29AABCA1234F1Z5'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Primary Phone:</Text>
          <Text style={styles.detailVal}>{currentUser.phone || '+91 98880 21000'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Client Account ID:</Text>
          <Text style={styles.detailVal}>#CBH-CUST-{currentUser.id || '101'}</Text>
        </View>
      </MobileCard>

      {/* 4. CRUD: REGISTERED DISPATCH & DELIVERY SITES */}
      <MobileCard>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionHeading}>Delivery &amp; Dispatch Godowns</Text>
          <TouchableOpacity
            onPress={() => setIsAddSiteModalOpen(true)}
            style={styles.addSiteHeaderBtn}
          >
            <Text style={styles.addSiteHeaderText}>＋ Add Site</Text>
          </TouchableOpacity>
        </View>

        {dispatchSites.map((site) => (
          <View key={site.id} style={styles.siteItem}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={styles.siteTitleRow}>
                <Text style={styles.siteName}>{site.name}</Text>
                {site.isPrimary ? (
                  <View style={styles.primaryPill}>
                    <Text style={styles.primaryPillText}>PRIMARY</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.siteAddress}>{site.address}</Text>
            </View>

            {!site.isPrimary ? (
              <TouchableOpacity
                onPress={() => handleDeleteSite(site.id)}
                style={styles.deleteSiteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.deleteSiteBtnText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </MobileCard>

      {/* 5. NABL CERTIFICATES LINK */}
      <TouchableOpacity
        onPress={onNavigateToCertificates}
        style={styles.certBtn}
        activeOpacity={0.82}
      >
        <View style={styles.certIconCircle}>
          <Text style={styles.certIconText}>📄</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.certBtnTitle}>NABL Lab Certificates &amp; MTC 3.1</Text>
          <Text style={styles.certBtnSubtitle}>
            Download official mill test reports &amp; spectro analysis curves
          </Text>
        </View>
        <Text style={styles.certChevron}>→</Text>
      </TouchableOpacity>

      {/* 6. SWITCH TO ADMIN (If applicable) */}
      {/* {onSwitchToAdmin ? (
        <TouchableOpacity
          onPress={onSwitchToAdmin}
          style={styles.switchBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.switchBtnText}>⚡ Switch to Admin Console Mode →</Text>
        </TouchableOpacity>
      ) : null} */}

      {/* 7. ACCOUNT ACTIONS (Sign Out & Deactivate) */}
      <View style={styles.actionsBox}>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.85}>
          <Text style={styles.logoutBtnText}>Sign Out Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeactivateAccount}
          style={styles.deactivateBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.deactivateBtnText}>Request Account Deactivation</Text>
        </TouchableOpacity>
      </View>

      {/* =================================================================== */}
      {/* MODAL 1: EDIT PROFILE & BUSINESS REGISTRATION (CRUD UPDATE)         */}
      {/* =================================================================== */}
      <MobileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Business Profile"
        subtitle="Update corporate contact person and registration info"
      >
        <View style={styles.modalScroll}>
          <Text style={styles.inputLabel}>Contact Person Full Name *</Text>
          <TextInput
            style={styles.modalInput}
            value={editFullName}
            onChangeText={setEditFullName}
            placeholder="e.g. Vikram Malhotra"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.inputLabel}>Registered Company / Firm Name *</Text>
          <TextInput
            style={styles.modalInput}
            value={editCompanyName}
            onChangeText={setEditCompanyName}
            placeholder="e.g. Larsen Turbo & Engineering Ltd."
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.inputLabel}>Direct Phone Number *</Text>
          <TextInput
            style={styles.modalInput}
            value={editPhone}
            onChangeText={setEditPhone}
            placeholder="+91 98880 21000"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>GSTIN (15 Digits)</Text>
          <TextInput
            style={[styles.modalInput, { textTransform: 'uppercase' }]}
            value={editGstin}
            onChangeText={setEditGstin}
            placeholder="29AABCA1234F1Z5"
            placeholderTextColor="#94A3B8"
            maxLength={15}
            autoCapitalize="characters"
          />

          <Text style={styles.inputLabel}>Primary Dispatch / Godown Address</Text>
          <TextInput
            style={[styles.modalInput, styles.textAreaInput]}
            value={editAddress}
            onChangeText={setEditAddress}
            placeholder="Plot / Street, Industrial Area, City, State, PIN"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              onPress={() => setIsEditModalOpen(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSaveProfile}
              style={[styles.modalSaveBtn, isSavingProfile && styles.btnDisabled]}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </MobileModal>

      {/* =================================================================== */}
      {/* MODAL 2: ADD DISPATCH SITE LOCATION (CRUD CREATE)                   */}
      {/* =================================================================== */}
      <MobileModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        title="Add Delivery Location"
        subtitle="Register an additional project site or godown for live dispatch"
      >
        <View style={styles.modalScroll}>
          <Text style={styles.inputLabel}>Site / Warehouse Label *</Text>
          <TextInput
            style={styles.modalInput}
            value={newSiteName}
            onChangeText={setNewSiteName}
            placeholder="e.g. Metro Phase II Fabrication Yard"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.inputLabel}>Complete Site Address &amp; Gate *</Text>
          <TextInput
            style={[styles.modalInput, styles.textAreaInput]}
            value={newSiteAddress}
            onChangeText={setNewSiteAddress}
            placeholder="Plot No., Survey Gate, Industrial Estate, PIN Code"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              onPress={() => setIsAddSiteModalOpen(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddSite}
              style={[styles.modalSaveBtn, isSavingSite && styles.btnDisabled]}
              disabled={isSavingSite}
            >
              <Text style={styles.modalSaveBtnText}>Add Site</Text>
            </TouchableOpacity>
          </View>
        </View>
      </MobileModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: '#F8FAFC',
    paddingBottom: 40,
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 10,
    padding: 12,
    elevation: 2,
  },
  toastText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileHeader: {
    backgroundColor: '#0047AB',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 3,
    shadowColor: '#002B6B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0047AB',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  editPillBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  editPillBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  userCompany: {
    fontSize: 12,
    fontWeight: '600',
    color: '#BFDBFE',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 11,
    color: '#E0EEFB',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  tierPill: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  verifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creditTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  creditStatusTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creditStatusText: {
    color: '#0047AB',
    fontSize: 10,
    fontWeight: '800',
  },
  creditValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0047AB',
  },
  creditSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  barBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#10B981',
  },
  creditMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  creditMetaKey: {
    fontSize: 11,
    color: '#64748B',
  },
  creditMetaVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  inlineEditLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0047AB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailKey: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  gstinVal: {
    color: '#0047AB',
    letterSpacing: 0.5,
  },
  addSiteHeaderBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  addSiteHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0047AB',
  },
  siteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  siteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  siteName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  primaryPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  primaryPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  siteAddress: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  deleteSiteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  deleteSiteBtnText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },
  certBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  certIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certIconText: {
    fontSize: 18,
  },
  certBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0047AB',
  },
  certBtnSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  certChevron: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0047AB',
    marginLeft: 6,
  },
  switchBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  switchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  actionsBox: {
    marginTop: 4,
    gap: 8,
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  deactivateBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  deactivateBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalScroll: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  textAreaInput: {
    height: 72,
    textAlignVertical: 'top',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#0047AB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

export default CustomerProfileScreen;
