import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { mobileApi } from '../../config/api';
import { MobileProduct } from '../../types';

interface CustomerCatalogScreenProps {
  onSelectProduct: (product: MobileProduct) => void;
  onAddToCart: (product: MobileProduct, unit: 'PCS' | 'KGS', qty: number) => void;
}

export const CustomerCatalogScreen: React.FC<CustomerCatalogScreenProps> = ({
  onSelectProduct,
  onAddToCart,
}) => {
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [toastMsg, setToastMsg] = useState('');

  const standards = ['All', 'DIN 933', 'DIN 912', 'DIN 6921', 'DIN 934', 'DIN 125A'];
  const grades = ['All', '8.8 High Tensile', '12.9 Ultra HT', 'Class 8', 'SS 304'];

  const fetchCatalog = async () => {
    try {
      const res = await mobileApi.products.getAll({
        search: searchQuery || undefined,
        standard: selectedStandard === 'All' ? undefined : selectedStandard,
        grade: selectedGrade === 'All' ? undefined : selectedGrade,
      });
      if (res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.warn('[Customer Catalog] Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [searchQuery, selectedStandard, selectedGrade]);

  const handleQuickAdd = (product: MobileProduct) => {
    onAddToCart(product, 'PCS', 1000);
    setToastMsg(`Added 1,000 Pcs of ${product.sku} to cart!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search DIN standard, Grade, Diameter..."
      />

      {/* Standards */}
      <View>
        <Text style={styles.filterTitle}>STANDARDS (DIN / ISO)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {standards.map((std) => {
            const isActive = selectedStandard === std;
            return (
              <TouchableOpacity
                key={std}
                onPress={() => setSelectedStandard(std)}
                style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                  {std}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grades */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {grades.map((gr) => {
          const isActive = selectedGrade === gr;
          return (
            <TouchableOpacity
              key={gr}
              onPress={() => setSelectedGrade(gr)}
              style={[
                styles.gradeChip,
                isActive ? styles.gradeChipActive : styles.gradeChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.gradeChipText,
                  isActive ? styles.gradeChipTextActive : null,
                ]}
              >
                {gr}
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

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          Found {products.length} industrial fasteners
        </Text>
        <TouchableOpacity onPress={fetchCatalog}>
          <Text style={styles.reloadText}>↻ Reload</Text>
        </TouchableOpacity>
      </View>

      {/* Products list */}
      {products.map((product) => (
        <MobileCard key={product.id} onPress={() => onSelectProduct(product)}>
          <View style={styles.cardTop}>
            <Text style={styles.skuPill}>{product.sku}</Text>
            <MobileBadge
              label={product.isInStock ? 'IN STOCK' : 'PRE-ORDER'}
              variant={product.isInStock ? 'success' : 'warning'}
              size="sm"
            />
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productSpecs}>
            Grade: {product.grade} • Size: {product.sizeFormatted || `${product.diameter}x${product.lengthMm}`}
          </Text>

          <View style={styles.cardDivider} />

          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.pricePc}>
                ₹{product.pricePerPiece}
                <Text style={styles.priceSub}> / Pc</Text>
              </Text>
              <Text style={styles.priceKg}>₹{product.pricePerKg} / Kg</Text>
            </View>

            <TouchableOpacity
              onPress={() => handleQuickAdd(product)}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </MobileCard>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
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
  gradeChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  gradeChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6B00',
  },
  gradeChipInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  gradeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  gradeChipTextActive: {
    color: '#C2410C',
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
    fontSize: 12,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  reloadText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '600',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skuPill: {
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
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricePc: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0052CC',
  },
  priceSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  priceKg: {
    fontSize: 10,
    color: '#64748B',
  },
  addBtn: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default CustomerCatalogScreen;
