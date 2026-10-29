import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileProduct } from '../../types';

export const AdminProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProduct, setActiveProduct] = useState<MobileProduct | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editStockPcs, setEditStockPcs] = useState<number>(0);
  const [editPricePcs, setEditPricePcs] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState('');

  const categories = [
    'All',
    'Hex Screws',
    'Socket Screws',
    'Flange Bolts',
    'Nuts & Lock Nuts',
    'Washers',
  ];

  const fetchProducts = async () => {
    try {
      const res = await mobileApi.products.getAll({
        search: searchQuery || undefined,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
      });
      if (res.products) setProducts(res.products);
    } catch (err) {
      console.warn('[Admin Products] Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const handleOpenStockEdit = (product: MobileProduct) => {
    setActiveProduct(product);
    setEditStockPcs(product.stockPcs);
    setEditPricePcs(product.pricePerPiece);
    setIsStockModalOpen(true);
  };

  const handleSaveStock = async () => {
    if (!activeProduct) return;
    try {
      const updated = {
        ...activeProduct,
        stockPcs: editStockPcs,
        pricePerPiece: editPricePcs,
      };
      await mobileApi.products.update(updated);
      setProducts((prev) =>
        prev.map((p) => (p.id === activeProduct.id ? updated : p))
      );
      setToastMsg(`Stock updated for ${activeProduct.sku}!`);
      setTimeout(() => setToastMsg(''), 3000);
      setIsStockModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search SKU, DIN 933, Grade 8.8..."
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {products.map((product) => (
        <MobileCard key={product.id}>
          <View style={styles.rowBetween}>
            <Text style={styles.skuTag}>{product.sku}</Text>
            <MobileBadge
              label={product.isInStock ? 'IN STOCK' : 'LOW STOCK'}
              variant={product.isInStock ? 'success' : 'danger'}
              size="sm"
            />
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productSpecs}>
            Standard: {product.standard} • Grade: {product.grade}
          </Text>

          <View style={styles.stockBox}>
            <View>
              <Text style={styles.boxLabel}>Current Stock</Text>
              <Text style={styles.boxVal}>{product.stockPcs?.toLocaleString()} Pcs</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.boxLabel}>Base Rate</Text>
              <Text style={styles.boxVal}>₹{product.pricePerPiece} / Pc</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.moqText}>MOQ: {product.moq || '1,000 Pcs'}</Text>
            <TouchableOpacity
              onPress={() => handleOpenStockEdit(product)}
              style={styles.adjustBtn}
            >
              <Text style={styles.adjustBtnText}>✎ Adjust Stock</Text>
            </TouchableOpacity>
          </View>
        </MobileCard>
      ))}

      <MobileModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Adjust Stock: ${activeProduct?.sku}`}
        subtitle={activeProduct?.name}
        footer={
          <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => setIsStockModalOpen(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveStock}
              style={styles.modalConfirmBtn}
            >
              <Text style={styles.modalConfirmText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text style={styles.inputLabel}>Available Stock (Pcs)</Text>
        <TextInput
          keyboardType="numeric"
          value={String(editStockPcs)}
          onChangeText={(v) => setEditStockPcs(Number(v) || 0)}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Price Per Piece (₹)</Text>
        <TextInput
          keyboardType="numeric"
          value={String(editPricePcs)}
          onChangeText={(v) => setEditPricePcs(Number(v) || 0)}
          style={styles.input}
        />
      </MobileModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  chipsRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#0052CC',
    borderColor: '#0052CC',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skuTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0052CC',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  productSpecs: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  stockBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boxLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  boxVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  moqText: {
    fontSize: 11,
    color: '#64748B',
  },
  adjustBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  adjustBtnText: {
    color: '#0052CC',
    fontSize: 11,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    height: 40,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0052CC',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default AdminProductsScreen;
