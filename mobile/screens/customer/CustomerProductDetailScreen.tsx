import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileProduct } from '../../types';

interface CustomerProductDetailScreenProps {
  product: MobileProduct;
  onBack: () => void;
  onAddToCart: (product: MobileProduct, unit: 'PCS' | 'KGS', qty: number) => void;
  onNavigateToCart: () => void;
}

export const CustomerProductDetailScreen: React.FC<CustomerProductDetailScreenProps> = ({
  product,
  onBack,
  onAddToCart,
  onNavigateToCart,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<'PCS' | 'KGS'>('PCS');
  const [quantity, setQuantity] = useState<number>(1000);
  const [isAddedToast, setIsAddedToast] = useState(false);

  const weightPerPc = product.weightPerPcKg || 0.05;
  const totalWeightKg =
    selectedUnit === 'PCS'
      ? +(quantity * weightPerPc).toFixed(2)
      : quantity;

  const unitRate = selectedUnit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
  const grossTotal = +(quantity * unitRate).toFixed(2);
  const discountAmount = +(grossTotal * 0.18).toFixed(2);
  const netEstimatedTotal = +(grossTotal - discountAmount).toFixed(2);

  const handleAdd = () => {
    onAddToCart(product, selectedUnit, quantity);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Banner */}
        <View style={styles.banner}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.bannerTag}>CBH METRIC FASTENER LAB</Text>
          <Text style={styles.bannerTitle}>{product.name}</Text>
          <Text style={styles.bannerSku}>SKU: {product.sku}</Text>
        </View>

        {isAddedToast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>✓ Added to RFQ Cart!</Text>
            <TouchableOpacity onPress={onNavigateToCart}>
              <Text style={styles.toastLink}>View Cart →</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Pricing Card */}
        <MobileCard>
          <View style={styles.rowBetween}>
            <Text style={styles.pricingTitle}>PROCUREMENT MODE</Text>
            <View style={styles.unitPills}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedUnit('PCS');
                  setQuantity(1000);
                }}
                style={[
                  styles.unitBtn,
                  selectedUnit === 'PCS' ? styles.unitBtnActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.unitBtnText,
                    selectedUnit === 'PCS' ? styles.unitBtnTextActive : null,
                  ]}
                >
                  BY PCS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSelectedUnit('KGS');
                  setQuantity(50);
                }}
                style={[
                  styles.unitBtn,
                  selectedUnit === 'KGS' ? styles.unitBtnActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.unitBtnText,
                    selectedUnit === 'KGS' ? styles.unitBtnTextActive : null,
                  ]}
                >
                  BY KGS
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.mainPrice}>
              ₹{selectedUnit === 'PCS' ? product.pricePerPiece : product.pricePerKg}
            </Text>
            <Text style={styles.perUnitText}>/ {selectedUnit} + 18% GST</Text>
          </View>

          {/* Stepper */}
          <View style={styles.stepperContainer}>
            <Text style={styles.stepperLabel}>SELECT QUANTITY ({selectedUnit})</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() =>
                  setQuantity((q) =>
                    Math.max(
                      selectedUnit === 'PCS' ? 100 : 10,
                      q - (selectedUnit === 'PCS' ? 500 : 25)
                    )
                  )
                }
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>-</Text>
              </TouchableOpacity>

              <TextInput
                keyboardType="numeric"
                value={String(quantity)}
                onChangeText={(val) => setQuantity(Math.max(1, Number(val) || 0))}
                style={styles.stepInput}
              />

              <TouchableOpacity
                onPress={() =>
                  setQuantity((q) => q + (selectedUnit === 'PCS' ? 500 : 25))
                }
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weightRow}>
              <Text style={styles.weightText}>Weight: {totalWeightKg} Kg</Text>
              <Text style={styles.weightText}>MOQ: {product.moq || '1K Pcs'}</Text>
            </View>
          </View>
        </MobileCard>

        {/* Specs Table */}
        <MobileCard>
          <Text style={styles.specsTitle}>NABL Technical Specifications</Text>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Standard:</Text>
            <Text style={styles.specVal}>{product.standard}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Grade:</Text>
            <Text style={styles.specVal}>{product.grade}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Finish:</Text>
            <Text style={styles.specVal}>{product.finish}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Diameter:</Text>
            <Text style={styles.specVal}>{product.diameter}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Length:</Text>
            <Text style={styles.specVal}>{product.lengthMm} mm</Text>
          </View>
        </MobileCard>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.netLabel}>Estimated Net</Text>
          <Text style={styles.netValue}>₹{netEstimatedTotal.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity onPress={handleAdd} style={styles.ctaBtn}>
          <Text style={styles.ctaBtnText}>🛒 Add to RFQ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  banner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bannerTag: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '700',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  bannerSku: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toastText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  toastLink: {
    color: '#0052CC',
    fontWeight: '700',
    fontSize: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  unitPills: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
  },
  unitBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  unitBtnActive: {
    backgroundColor: '#0052CC',
  },
  unitBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 10,
  },
  mainPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0052CC',
  },
  perUnitText: {
    fontSize: 11,
    color: '#64748B',
  },
  stepperContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginTop: 12,
  },
  stepperLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepInput: {
    flex: 1,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  weightText: {
    fontSize: 11,
    color: '#64748B',
  },
  specsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  specKey: {
    fontSize: 11,
    color: '#64748B',
  },
  specVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  netValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0052CC',
  },
  ctaBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default CustomerProductDetailScreen;
