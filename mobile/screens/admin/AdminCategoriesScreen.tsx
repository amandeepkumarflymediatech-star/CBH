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
  Platform,
} from 'react-native';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileCategory } from '../../types';

const GRAPHITE = '#0F172A';
const STEEL = '#475569';
const LIGHT_STEEL = '#94A3B8';
const WHITE = '#FFFFFF';
const BLUE = '#0052CC';
const RED = '#DC2626';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

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

  // Form inputs
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catTagline, setCatTagline] = useState('');
  const [catDescription, setCatDescription] = useState('');
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
        setCategories([
          {
            slug: 'hex-screws',
            name: 'Hex Screws & Bolts',
            tagline: 'DIN 933, 931 & ISO 4017 Full/Partial Thread',
            description: 'Precision hot-forged and cold-headed bolts.',
            productsCount: 320,
            featured: true,
          },
          {
            slug: 'socket-screws',
            name: 'Socket Head Cap Screws',
            tagline: 'DIN 912 Grade 10.9 & 12.9 High-Tensile',
            description: 'Allen socket caps for machinery.',
            productsCount: 160,
            featured: true,
          },
          {
            slug: 'anchor-systems',
            name: 'Heavy Duty Anchor Bolts',
            tagline: 'ETA Option 1 & 7 Concrete Fixings',
            description: 'Through-bolts, drop-in anchors.',
            productsCount: 75,
            featured: false,
          },
          {
            slug: 'threaded-rods',
            name: 'Threaded Rods & Studs',
            tagline: 'DIN 975 / 976 Grade 4.6, 8.8, SS304/316',
            description: 'All-thread rods and flange double-end studs.',
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
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      featured: catFeatured,
      productsCount: isEditing ? (categories.find((c) => c.slug === activeSlug)?.productsCount || 0) : 0,
    };

    try {
      if (isEditing && activeSlug) {
        await mobileApi.catalog.updateCategory({ slug: activeSlug, ...payload });
        setCategories((prev) =>
          prev.map((c) => (c.slug === activeSlug ? { ...c, ...payload } : c))
        );
        showToast(`"${payload.name}" updated`);
      } else {
        await mobileApi.catalog.createCategory(payload);
        setCategories((prev) => [payload, ...prev]);
        showToast(`"${payload.name}" registered`);
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
      showToast(`Category removed`);
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
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Search & Add Bar */}
      <View style={styles.topHeader}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <MobileSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search category or standard..."
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Category</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* High Density Category List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadCategories(true)} colors={[BLUE]} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.countRow}>
          <Text style={styles.countText}>{filteredCategories.length} Categories Registered</Text>
        </View>

        {filteredCategories.map((cat) => (
          <View key={cat.slug} style={styles.catCard}>
            <View style={styles.catTopRow}>
              <View style={styles.nameGroup}>
                <Text style={styles.catName} numberOfLines={1}>
                  {cat.name}
                </Text>
                {cat.featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredText}>FEATURED</Text>
                  </View>
                )}
              </View>
              <Text style={styles.productCount}>{cat.productsCount || 0} SKUs</Text>
            </View>

            <Text style={styles.tagline} numberOfLines={1}>
              {cat.tagline || cat.description}
            </Text>

            <View style={styles.catBottomRow}>
              <Text style={styles.slugText}>/{cat.slug}</Text>

              <View style={styles.actionGroup}>
                <TouchableOpacity
                  onPress={() => {
                    setCatToDelete(cat);
                    setIsDeleteModalOpen(true);
                  }}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleOpenEdit(cat)}
                  style={styles.editBtn}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add / Edit Category Modal */}
      <MobileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit ${catName}` : 'Add Taxonomy Category'}
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Category Name *</Text>
          <TextInput
            style={styles.input}
            value={catName}
            onChangeText={setCatName}
            placeholder="Hex Screws & Bolts"
          />

          <Text style={styles.inputLabel}>URL Slug</Text>
          <TextInput
            style={[styles.input, { fontFamily: MONO }]}
            value={catSlug}
            onChangeText={setCatSlug}
            placeholder="hex-screws"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Standard Norms Tagline</Text>
          <TextInput
            style={styles.input}
            value={catTagline}
            onChangeText={setCatTagline}
            placeholder="DIN 933, 931 & ISO 4017"
          />

          <View style={styles.toggleRow}>
            <Text style={styles.inputLabel}>Feature on Customer Home Screen</Text>
            <TouchableOpacity
              onPress={() => setCatFeatured(!catFeatured)}
              style={[styles.toggleBtn, catFeatured && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleBtnText, catFeatured && styles.toggleBtnTextActive]}>
                {catFeatured ? 'YES' : 'NO'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveCategory}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Category'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Delete Confirmation Modal */}
      <MobileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Category"
      >
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, color: STEEL, marginBottom: 14 }}>
            Delete category <Text style={{ fontWeight: '800', color: GRAPHITE }}>{catToDelete?.name}</Text>?
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setIsDeleteModalOpen(false)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: STEEL }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmDelete}
              disabled={isSubmitting}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: RED, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: WHITE }}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </MobileModal>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
  countRow: {
    paddingVertical: 4,
    marginBottom: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: STEEL,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  catCard: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: 6,
  },
  catName: {
    fontSize: 12,
    fontWeight: '800',
    color: GRAPHITE,
  },
  featuredBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  featuredText: {
    fontSize: 8,
    fontWeight: '800',
    color: BLUE,
  },
  productCount: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: MONO,
    color: STEEL,
  },
  tagline: {
    fontSize: 11,
    color: STEEL,
    marginBottom: 6,
  },
  catBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 6,
  },
  slugText: {
    fontSize: 10,
    fontFamily: MONO,
    color: LIGHT_STEEL,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteBtn: {
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: RED,
  },
  editBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAPHITE,
  },
  toast: {
    backgroundColor: GRAPHITE,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginTop: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  toastText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
  modalScroll: {
    paddingVertical: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: STEEL,
    marginBottom: 4,
  },
  input: {
    height: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    color: GRAPHITE,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 8,
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  toggleBtnActive: {
    backgroundColor: '#DCFCE7',
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: STEEL,
  },
  toggleBtnTextActive: {
    color: '#16A34A',
  },
  saveBtn: {
    backgroundColor: BLUE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
});
