import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileCategory } from '../../types';

export const AdminCategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<MobileCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Form inputs (100% all fields)
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catTagline, setCatTagline] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImageUrl, setCatImageUrl] = useState('');
  const [catFeatured, setCatFeatured] = useState(false);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<MobileCategory | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadCategories = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await mobileApi.catalog.getCategories();
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      } else {
        // Fallback default taxonomy categories
        setCategories([
          {
            slug: 'hex-screws',
            name: 'Hex Screws & Bolts',
            tagline: 'DIN 933, 931 & ISO 4017 Full/Partial Thread',
            description: 'Precision hot-forged and cold-headed bolts for heavy infrastructure.',
            productsCount: 320,
            featured: true,
          },
          {
            slug: 'socket-screws',
            name: 'Socket Head Cap Screws',
            tagline: 'DIN 912 Grade 10.9 & 12.9 High-Tensile',
            description: 'Allen socket caps for machinery and precision die equipment.',
            productsCount: 160,
            featured: true,
          },
          {
            slug: 'anchor-systems',
            name: 'Heavy Duty Anchor Bolts',
            tagline: 'ETA Option 1 & 7 Cracked Concrete Fixings',
            description: 'Through-bolts, drop-in anchors, and chemical injection capsules.',
            productsCount: 75,
            featured: false,
          },
          {
            slug: 'threaded-rods',
            name: 'Threaded Rods & Studs',
            tagline: 'DIN 975 / 976 Grade 4.6, 8.8, SS304/316',
            description: '1-meter and 3-meter all-thread rods and flange double-end studs.',
            productsCount: 50,
            featured: false,
          },
        ]);
      }
    } catch (err) {
      console.warn('[Admin Categories] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setActiveSlug(null);
    setCatName('');
    setCatSlug('');
    setCatTagline('');
    setCatDescription('');
    setCatImageUrl('https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80');
    setCatFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: MobileCategory) => {
    setIsEditing(true);
    setActiveSlug(cat.slug);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatTagline(cat.tagline || '');
    setCatDescription(cat.description || '');
    setCatImageUrl(cat.imageUrl || '');
    setCatFeatured(Boolean(cat.featured));
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      Alert.alert('Validation Error', 'Category name is required.');
      return;
    }

    setIsSubmitting(true);
    const slug = catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const payload: MobileCategory = {
      name: catName.trim(),
      slug,
      tagline: catTagline.trim(),
      description: catDescription.trim(),
      imageUrl: catImageUrl.trim() || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      featured: catFeatured,
      productsCount: isEditing ? (categories.find((c) => c.slug === activeSlug)?.productsCount || 0) : 0,
    };

    try {
      if (isEditing && activeSlug) {
        await mobileApi.catalog.updateCategory({ slug: activeSlug, ...payload });
        setCategories((prev) =>
          prev.map((c) => (c.slug === activeSlug ? { ...c, ...payload } : c))
        );
        showToast(`Category "${payload.name}" updated!`);
      } else {
        await mobileApi.catalog.createCategory(payload);
        setCategories((prev) => [payload, ...prev]);
        showToast(`Category "${payload.name}" created!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!catToDelete) return;
    setIsSubmitting(true);
    try {
      await mobileApi.catalog.deleteCategory(catToDelete.slug);
      setCategories((prev) => prev.filter((c) => c.slug !== catToDelete.slug));
      setIsDeleteModalOpen(false);
      showToast(`Category "${catToDelete.name}" removed.`);
      setCatToDelete(null);
    } catch (err: any) {
      Alert.alert('Delete Error', err.message || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    return (
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tagline && c.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadCategories(true)}
          colors={['#0052CC']}
        />
      }
    >
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <Text style={styles.bannerTitle}>CATALOG TAXONOMY CONTROL</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>605 SKUs CLUSTERED</Text>
          </View>
        </View>
        <Text style={styles.bannerSub}>
          Structured categories, subcategories, and product families synchronized across web and mobile.
        </Text>
      </View>

      {/* Action Header */}
      <View style={styles.rowBetween}>
        <Text style={styles.countText}>{filteredCategories.length} Categories Registered</Text>
        <TouchableOpacity onPress={handleOpenAdd} style={styles.addBtn} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>➕ Add Category</Text>
        </TouchableOpacity>
      </View>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* Search */}
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search category name or slug..."
      />

      {/* Category Cards */}
      {filteredCategories.map((cat) => (
        <MobileCard key={cat.slug}>
          <View style={styles.rowBetween}>
            <Text style={styles.catName}>{cat.name}</Text>
            {cat.featured ? (
              <MobileBadge label="FEATURED" variant="primary" size="sm" />
            ) : (
              <MobileBadge label="STANDARD" variant="neutral" size="sm" />
            )}
          </View>

          <Text style={styles.catSlug}>slug: /{cat.slug}</Text>

          {cat.tagline ? <Text style={styles.catTagline}>{cat.tagline}</Text> : null}
          {cat.description ? <Text style={styles.catDesc}>{cat.description}</Text> : null}

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.prodCountText}>
              🔩 {cat.productsCount || 0} Products in Family
            </Text>
            <View style={styles.rowInline}>
              <TouchableOpacity
                onPress={() => handleOpenEdit(cat)}
                style={styles.editBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.editBtnText}>✏ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setCatToDelete(cat);
                  setIsDeleteModalOpen(true);
                }}
                style={styles.deleteBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </MobileCard>
      ))}

      {/* ================================================================ */}
      {/* ADD / EDIT CATEGORY MODAL (100% All Inputs)                      */}
      {/* ================================================================ */}
      <MobileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Category: ${catName}` : '➕ Add Catalog Category'}
      >
        <ScrollView style={styles.modalScroll}>
          <Text style={styles.fieldLabel}>Category Display Name *</Text>
          <TextInput
            style={styles.input}
            value={catName}
            onChangeText={(text) => {
              setCatName(text);
              if (!isEditing && !catSlug) {
                setCatSlug(text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
              }
            }}
            placeholder="e.g. Hex Screws &amp; Structural Bolts"
          />

          <Text style={styles.fieldLabel}>URL Slug Identifier *</Text>
          <TextInput
            style={styles.input}
            value={catSlug}
            onChangeText={setCatSlug}
            placeholder="e.g. hex-screws"
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Technical Tagline</Text>
          <TextInput
            style={styles.input}
            value={catTagline}
            onChangeText={setCatTagline}
            placeholder="e.g. DIN 933, DIN 931 &amp; ISO 4017 Range"
          />

          <Text style={styles.fieldLabel}>Engineering Description</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            value={catDescription}
            onChangeText={setCatDescription}
            placeholder="Detailed application standards and metallurgy specs..."
            multiline
          />

          <Text style={styles.fieldLabel}>Cover Image URL</Text>
          <TextInput
            style={styles.input}
            value={catImageUrl}
            onChangeText={setCatImageUrl}
            placeholder="https://..."
            autoCapitalize="none"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Feature on Mobile Storefront</Text>
            <TouchableOpacity
              onPress={() => setCatFeatured(!catFeatured)}
              style={[styles.toggleBtn, catFeatured && styles.toggleBtnActive]}
            >
              <Text style={styles.toggleText}>{catFeatured ? 'YES' : 'NO'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSaveCategory}
            disabled={isSubmitting}
            style={styles.modalSubmitBtn}
          >
            <Text style={styles.modalSubmitText}>
              {isSubmitting ? 'Saving Category...' : isEditing ? 'Save Changes' : 'Create Category'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* DELETE MODAL */}
      <MobileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Category Deletion"
      >
        <View style={{ padding: 6, gap: 12 }}>
          <Text style={styles.deleteWarning}>
            Are you sure you want to delete category{' '}
            <Text style={{ fontWeight: '800' }}>{catToDelete?.name}</Text>?
          </Text>
          <View style={styles.rowBetween}>
            <TouchableOpacity
              onPress={() => setIsDeleteModalOpen(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmDelete}
              disabled={isSubmitting}
              style={styles.confirmDeleteBtn}
            >
              <Text style={styles.confirmDeleteText}>
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Category'}
              </Text>
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
  banner: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  badgePill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
  },
  bannerSub: {
    fontSize: 11,
    color: '#F1F5F9',
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  addBtn: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  catName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  catSlug: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#0052CC',
    marginTop: 2,
  },
  catTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
  },
  catDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  prodCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  editBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
  },
  deleteBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: {
    fontSize: 12,
  },
  modalScroll: {
    maxHeight: 480,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  switchLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  toggleBtn: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#0052CC',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  modalSubmitBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  deleteWarning: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  confirmDeleteBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
