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
  Platform,
} from 'react-native';
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
  onNavigateToBulkOrder?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToPolicies?: () => void;
  onNavigateToCatalog?: () => void;
}

// Same palette as the product detail screen
const GRAPHITE = '#1C2228';
const STEEL = '#5E6A74';
const MIST = '#EDEFF1';
const HAIR = '#D6DBE0';
const WHITE = '#FFFFFF';
const ORANGE = '#F26B1D';
const GREEN = '#17803D';
const RED = '#C62828';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const DEFAULT_ADDRESS = 'Plot 42, Peenya Industrial Area Phase II, Bengaluru, KA - 560058';
const DEFAULT_CREDIT = 2500000;

export const CustomerProfileScreen: React.FC<CustomerProfileScreenProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onSwitchToAdmin,
  onNavigateToCertificates,
  onNavigateToContact,
  onNavigateToBulkOrder,
  onNavigateToPolicies,
  onNavigateToCatalog,
}) => {
  const initialUser: MobileAuthUser = user || getMobileStoredUser() || DEMO_MOBILE_CUSTOMER;
  const [currentUser, setCurrentUser] = useState<MobileAuthUser>(initialUser);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [totalSpend, setTotalSpend] = useState<number>(0);

  const [dispatchSites, setDispatchSites] = useState<DispatchSite[]>([
    {
      id: 'site_1',
      name: 'Primary Factory Depot',
      address: initialUser.address || DEFAULT_ADDRESS,
      isPrimary: true,
    },
    {
      id: 'site_2',
      name: 'Regional Fabrication Yard',
      address: 'Plot 108, Whitefield Logistics Corridor, Bengaluru, KA - 560066',
      isPrimary: false,
    },
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>(currentUser.fullName || '');
  const [editCompanyName, setEditCompanyName] = useState<string>(currentUser.companyName || '');
  const [editPhone, setEditPhone] = useState<string>(currentUser.phone || '');
  const [editGstin, setEditGstin] = useState<string>(currentUser.gstin || '');
  const [editAddress, setEditAddress] = useState<string>(currentUser.address || DEFAULT_ADDRESS);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState<boolean>(false);
  const [newSiteName, setNewSiteName] = useState<string>('');
  const [newSiteAddress, setNewSiteAddress] = useState<string>('');
  const [isSavingSite, setIsSavingSite] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setEditFullName(user.fullName || '');
      setEditCompanyName(user.companyName || '');
      setEditPhone(user.phone || '');
      setEditGstin(user.gstin || '');
      setEditAddress(user.address || DEFAULT_ADDRESS);
    }
  }, [user]);

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
            if (matched.deliverySites && Array.isArray(matched.deliverySites) && matched.deliverySites.length > 0) {
              setDispatchSites(matched.deliverySites as any);
            }
          }
        }
      }
      try {
        const ords = await mobileApi.orders.getAll();
        if (ords.orders && Array.isArray(ords.orders)) {
          const sum = ords.orders.reduce((acc, o) => acc + (o.netAmount || 0), 0);
          setTotalSpend(sum);
        }
      } catch {}
    } catch (err) {
      console.warn('[Customer Profile] Live fetch sync error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentUser.email]);

  useEffect(() => {
    fetchLiveProfile(false);
  }, []);

  const handleOpenEdit = () => {
    setEditFullName(currentUser.fullName);
    setEditCompanyName(currentUser.companyName);
    setEditPhone(currentUser.phone || '');
    setEditGstin(currentUser.gstin || '');
    setEditAddress(currentUser.address || DEFAULT_ADDRESS);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim() || !editCompanyName.trim()) {
      Alert.alert('Missing details', 'Enter your full name and registered company name.');
      return;
    }

    if (editGstin.trim() && editGstin.trim().length !== 15) {
      Alert.alert('Invalid GSTIN', 'A GSTIN has exactly 15 characters.');
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

      setDispatchSites((prev) =>
        prev.map((site) =>
          site.isPrimary ? { ...site, address: updatedData.address || site.address } : site
        )
      );

      setIsEditModalOpen(false);
      showToast('Profile updated');
    } catch (err: any) {
      Alert.alert('Could not save', err.message || 'Your changes were not saved. Try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddSite = () => {
    if (!newSiteName.trim() || !newSiteAddress.trim()) {
      Alert.alert('Missing details', 'Enter a site name and a full address.');
      return;
    }
    const newSite: DispatchSite = {
      id: `site_${Date.now()}`,
      name: newSiteName.trim(),
      address: newSiteAddress.trim(),
      isPrimary: false,
    };
    const updated = [...dispatchSites, newSite];
    setDispatchSites(updated);
    setNewSiteName('');
    setNewSiteAddress('');
    setIsAddSiteModalOpen(false);
    showToast(`${newSite.name} added`);
    if (currentUser.id) {
      mobileApi.users.update({ id: currentUser.id, deliverySites: updated } as any).catch(() => {});
    }
  };

  const handleDeleteSite = (siteId: string) => {
    Alert.alert(
      'Remove this site?',
      'It will no longer appear as a delivery location on your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = dispatchSites.filter((s) => s.id !== siteId);
            setDispatchSites(updated);
            showToast('Site removed');
            if (currentUser.id) {
              mobileApi.users.update({ id: currentUser.id, deliverySites: updated } as any).catch(() => {});
            }
          },
        },
      ]
    );
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      'Deactivate your account?',
      'Pending RFQs and order records will be archived.',
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

  const getInitials = (name?: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const tierName = (currentUser.tier || 'DIAMOND').toUpperCase();
  const tierLabel = tierName.charAt(0) + tierName.slice(1).toLowerCase();
  const rebatePct =
    currentUser.tierDiscountPct ||
    (tierName === 'DIAMOND' ? 18 : tierName === 'PLATINUM' ? 12 : tierName === 'GOLD' ? 8 : 5);

  const creditLimit = Number(currentUser.creditLimit || DEFAULT_CREDIT);
  const available = Math.max(0, creditLimit - totalSpend);
  const usedPct = Math.min(100, Math.round((totalSpend / creditLimit) * 100));
  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const resources: { show: boolean; onPress?: () => void; title: string; sub: string }[] = [
    { show: !!onNavigateToCatalog, onPress: onNavigateToCatalog, title: 'Fastener catalog & matrix', sub: '2,00,000+ certified DIN, ISO and ASTM specifications' },
    { show: !!onNavigateToBulkOrder, onPress: onNavigateToBulkOrder, title: 'Bulk order and BOM upload', sub: 'Send a tender or project line list for quotation' },
    { show: !!onNavigateToContact, onPress: onNavigateToContact, title: 'Factory contact and bank details', sub: 'Ludhiana hub, direct phone, RTGS and IFSC' },
    { show: !!onNavigateToPolicies, onPress: onNavigateToPolicies, title: 'Terms and policies', sub: 'B2B terms, data privacy and freight SLA' },
  ].filter((r) => r.show);

  return (
    <ScrollView
      style={{ backgroundColor: WHITE }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchLiveProfile(true)} colors={[ORANGE]} />
      }
      showsVerticalScrollIndicator={false}
    >
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      ) : null}

      {/* Identity */}
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(currentUser.fullName)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName} numberOfLines={1}>
            {currentUser.fullName}
          </Text>
          <Text style={styles.userCompany} numberOfLines={1}>
            {currentUser.companyName}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {currentUser.email}
          </Text>
        </View>
        <TouchableOpacity onPress={handleOpenEdit} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.link}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statusLine}>
        <Text style={styles.statusText}>
          {tierLabel} tier, {rebatePct}% rebate
        </Text>
        <Text style={[styles.statusText, { color: GREEN }]}>Verified business</Text>
      </View>

      {/* Credit: the signature element */}
      <View style={styles.section}>
        <Text style={styles.label}>Credit available</Text>
        <Text style={styles.creditValue}>{inr(available)}</Text>
        <View style={styles.meter}>
          <View style={[styles.meterFill, { width: `${usedPct}%` as any }, usedPct >= 85 && { backgroundColor: RED }]} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.meterText}>
            {inr(totalSpend)} used ({usedPct}%)
          </Text>
          <Text style={styles.meterText}>Limit {inr(creditLimit)}</Text>
        </View>
        <Text style={styles.note}>Net 30-day billing on all orders.</Text>
      </View>

      {/* Business details */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.h2}>Business details</Text>
          <TouchableOpacity onPress={handleOpenEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.link}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.table}>
          <View style={[styles.kv, { borderTopWidth: 0 }]}>
            <Text style={styles.k}>Company</Text>
            <Text style={styles.v}>{currentUser.companyName}</Text>
          </View>
          <View style={styles.kv}>
            <Text style={styles.k}>GSTIN</Text>
            <Text style={[styles.v, { fontFamily: MONO, fontSize: 13 }]}>
              {currentUser.gstin || '29AABCA1234F1Z5'}
            </Text>
          </View>
          <View style={styles.kv}>
            <Text style={styles.k}>Phone</Text>
            <Text style={styles.v}>{currentUser.phone || '+91 98880 21000'}</Text>
          </View>
          <View style={styles.kv}>
            <Text style={styles.k}>Account ID</Text>
            <Text style={[styles.v, { fontFamily: MONO, fontSize: 13 }]}>
              CBH-CUST-{currentUser.id || '101'}
            </Text>
          </View>
        </View>
      </View>

      {/* Delivery sites */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.h2}>Delivery sites</Text>
          <TouchableOpacity onPress={() => setIsAddSiteModalOpen(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.link}>Add site</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.table}>
          {dispatchSites.map((site, i) => (
            <View key={site.id} style={[styles.siteRow, i === 0 && { borderTopWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <View style={styles.siteTitleRow}>
                  <Text style={styles.siteName}>{site.name}</Text>
                  {site.isPrimary ? <Text style={styles.primaryTag}>Primary</Text> : null}
                </View>
                <Text style={styles.siteAddress}>{site.address}</Text>
              </View>
              {!site.isPrimary ? (
                <TouchableOpacity onPress={() => handleDeleteSite(site.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.removeLink}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      {/* Certificates */}
      <TouchableOpacity onPress={onNavigateToCertificates} style={styles.certRow} activeOpacity={0.85}>
        <View style={styles.certTag}>
          <Text style={styles.certTagText}>MTC</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.certTitle}>Lab certificates</Text>
          <Text style={styles.certSub}>NABL reports and Type 3.1 mill test certificates</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* Resources */}
      {resources.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.h2}>Resources</Text>
          <View style={styles.table}>
            {resources.map((r, i) => (
              <TouchableOpacity
                key={r.title}
                onPress={r.onPress}
                style={[styles.menuRow, i === 0 && { borderTopWidth: 0 }]}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuTitle}>{r.title}</Text>
                  <Text style={styles.menuSub}>{r.sub}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {/* Account actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeactivateAccount} style={styles.deactivateBtn} activeOpacity={0.85}>
          <Text style={styles.deactivateText}>Request account deactivation</Text>
        </TouchableOpacity>
      </View>

      {/* Edit profile modal */}
      <MobileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit business profile"
        subtitle="Contact person and registration details"
      >
        <View style={styles.modalBody}>
          <Text style={styles.inputLabel}>Full name</Text>
          <TextInput
            style={styles.input}
            value={editFullName}
            onChangeText={setEditFullName}
            placeholder="Vikram Malhotra"
            placeholderTextColor="#8D98A1"
          />

          <Text style={styles.inputLabel}>Registered company name</Text>
          <TextInput
            style={styles.input}
            value={editCompanyName}
            onChangeText={setEditCompanyName}
            placeholder="Larsen Turbo & Engineering Ltd."
            placeholderTextColor="#8D98A1"
          />

          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={editPhone}
            onChangeText={setEditPhone}
            placeholder="+91 98880 21000"
            placeholderTextColor="#8D98A1"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>GSTIN (15 characters)</Text>
          <TextInput
            style={[styles.input, { fontFamily: MONO }]}
            value={editGstin}
            onChangeText={setEditGstin}
            placeholder="29AABCA1234F1Z5"
            placeholderTextColor="#8D98A1"
            maxLength={15}
            autoCapitalize="characters"
          />

          <Text style={styles.inputLabel}>Primary dispatch address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editAddress}
            onChangeText={setEditAddress}
            placeholder="Plot or street, industrial area, city, state, PIN"
            placeholderTextColor="#8D98A1"
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => setIsEditModalOpen(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveProfile}
              style={[styles.saveBtn, isSavingProfile && styles.disabled]}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? (
                <ActivityIndicator color={WHITE} size="small" />
              ) : (
                <Text style={styles.saveText}>Save changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </MobileModal>

      {/* Add site modal */}
      <MobileModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        title="Add delivery site"
        subtitle="Orders can be dispatched to any site on your account"
      >
        <View style={styles.modalBody}>
          <Text style={styles.inputLabel}>Site name</Text>
          <TextInput
            style={styles.input}
            value={newSiteName}
            onChangeText={setNewSiteName}
            placeholder="Metro Phase II fabrication yard"
            placeholderTextColor="#8D98A1"
          />

          <Text style={styles.inputLabel}>Address and gate</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={newSiteAddress}
            onChangeText={setNewSiteAddress}
            placeholder="Plot no., gate, industrial estate, PIN"
            placeholderTextColor="#8D98A1"
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => setIsAddSiteModalOpen(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddSite}
              style={[styles.saveBtn, isSavingSite && styles.disabled]}
              disabled={isSavingSite}
            >
              <Text style={styles.saveText}>Add site</Text>
            </TouchableOpacity>
          </View>
        </View>
      </MobileModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 40, backgroundColor: WHITE },

  toast: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: GRAPHITE,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toastText: { color: WHITE, fontSize: 14, fontWeight: '600' },

  // Identity
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: WHITE },
  userName: { fontSize: 20, fontWeight: '700', color: GRAPHITE },
  userCompany: { fontSize: 14, color: GRAPHITE, marginTop: 2 },
  userEmail: { fontSize: 13, color: STEEL, marginTop: 2 },
  statusLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  statusText: { fontSize: 13, fontWeight: '600', color: STEEL },
  link: { fontSize: 14, fontWeight: '700', color: ORANGE },

  // Sections: hairline-separated, no cards
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  h2: { fontSize: 16, fontWeight: '700', color: GRAPHITE },
  label: { fontSize: 13, color: STEEL },
  note: { fontSize: 12, color: STEEL, marginTop: 10 },

  // Credit meter
  creditValue: {
    fontSize: 34,
    fontWeight: '800',
    color: GRAPHITE,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  meter: { height: 8, borderRadius: 4, backgroundColor: MIST, marginTop: 14, marginBottom: 8, overflow: 'hidden' },
  meterFill: { height: '100%', backgroundColor: ORANGE, borderRadius: 4 },
  meterText: { fontSize: 12, color: STEEL, fontVariant: ['tabular-nums'] },

  // Key/value tables
  table: { marginTop: 8 },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: MIST,
  },
  k: { fontSize: 14, color: STEEL },
  v: { fontSize: 14, fontWeight: '600', color: GRAPHITE, flexShrink: 1, textAlign: 'right', marginLeft: 16 },

  // Sites
  siteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: MIST,
  },
  siteTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  siteName: { fontSize: 14, fontWeight: '700', color: GRAPHITE },
  primaryTag: { fontSize: 12, fontWeight: '600', color: GREEN },
  siteAddress: { fontSize: 13, color: STEEL, marginTop: 3, lineHeight: 19 },
  removeLink: { fontSize: 13, fontWeight: '600', color: RED },

  // Certificates
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: MIST,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  certTag: {
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  certTagText: { fontSize: 12, fontWeight: '700', color: GRAPHITE, fontFamily: MONO },
  certTitle: { fontSize: 15, fontWeight: '700', color: GRAPHITE },
  certSub: { fontSize: 13, color: STEEL, marginTop: 2 },
  chevron: { fontSize: 24, color: STEEL, marginLeft: 6 },

  // Resources
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: MIST,
  },
  menuTitle: { fontSize: 14, fontWeight: '600', color: GRAPHITE },
  menuSub: { fontSize: 12, color: STEEL, marginTop: 2 },

  // Actions
  actions: { paddingHorizontal: 20, paddingTop: 24, gap: 6 },
  logoutBtn: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: GRAPHITE },
  deactivateBtn: { paddingVertical: 14, alignItems: 'center' },
  deactivateText: { fontSize: 13, color: STEEL, textDecorationLine: 'underline' },

  // Modals
  modalBody: { paddingBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: GRAPHITE, marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: HAIR,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 15,
    color: GRAPHITE,
    backgroundColor: WHITE,
  },
  textArea: { height: 84, paddingTop: 12, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: GRAPHITE },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { fontSize: 15, fontWeight: '700', color: WHITE },
  disabled: { opacity: 0.6 },
});

export default CustomerProfileScreen;