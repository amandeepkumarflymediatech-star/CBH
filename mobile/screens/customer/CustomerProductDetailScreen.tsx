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
import { MobileBadge } from '../../components/MobileBadge';
import { MobileProduct, GlobalUnit } from '../../types';

interface CustomerProductDetailScreenProps {
  product: MobileProduct;
  onBack: () => void;
  onAddToCart: (product: MobileProduct, unit: GlobalUnit, qty: number) => void;
  onNavigateToCart: () => void;
}

export const CustomerProductDetailScreen: React.FC<CustomerProductDetailScreenProps> = ({
  product,
  onBack,
  onAddToCart,
  onNavigateToCart,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<GlobalUnit>('PCS');
  const [quantity, setQuantity] = useState<number>(1000);
  const [isAddedToast, setIsAddedToast] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState('560058');

  // Fastener calculations
  const weightPerPc = product.weightPerPcKg || 0.054;
  const totalWeightKg =
    selectedUnit === 'PCS'
      ? +(quantity * weightPerPc).toFixed(2)
      : quantity;

  // Dynamic Slab Discount Engine
  const getSlabDiscount = (weightKg: number) => {
    if (weightKg >= 2000) return { pct: 18, nextWeight: null, nextPct: null };
    if (weightKg >= 1000) return { pct: 14, nextWeight: 2000, nextPct: 18 };
    if (weightKg >= 500) return { pct: 10, nextWeight: 1000, nextPct: 14 };
    if (weightKg >= 250) return { pct: 5, nextWeight: 500, nextPct: 10 };
    return { pct: 0, nextWeight: 250, nextPct: 5 };
  };

  const slab = getSlabDiscount(totalWeightKg);
  const unitRate = selectedUnit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
  const grossTotal = +(quantity * unitRate).toFixed(2);
  const discountAmount = +(grossTotal * (slab.pct / 100)).toFixed(2);
  const netEstimatedTotal = +(grossTotal - discountAmount).toFixed(2);
  const gstAmount = +(netEstimatedTotal * 0.18).toFixed(2);
  const grandTotal = +(netEstimatedTotal + gstAmount).toFixed(2);

  const handleAdd = () => {
    onAddToCart(product, selectedUnit, quantity);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Header Card (Clean White B2B Style) */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back to Catalog</Text>
            </TouchableOpacity>
            <MobileBadge
              label={product.isInStock ? 'IN STOCK' : 'PRE-ORDER'}
              variant={product.isInStock ? 'success' : 'warning'}
              size="sm"
            />
          </View>

          <View style={styles.badgeRow}>
            <Text style={styles.skuTag}>{product.sku}</Text>
            {product.standard ? (
              <Text style={styles.standardTag}>{product.standard}</Text>
            ) : null}
            {product.isoStandard ? (
              <Text style={styles.isoTag}>{product.isoStandard}</Text>
            ) : null}
          </View>

          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.categorySub}>
            Category: {product.subGroup || product.category || 'Industrial Fasteners'} • Grade {product.grade}
          </Text>

          {product.stockPcs ? (
            <View style={styles.warehouseStockRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.warehouseStockText}>
                {product.stockPcs.toLocaleString()} Pcs ({product.stockKg || 0} Kg) available in Factory Bins
              </Text>
            </View>
          ) : null}
        </View>

        {isAddedToast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>✓ Added to RFQ Cart!</Text>
            <TouchableOpacity onPress={onNavigateToCart}>
              <Text style={styles.toastLink}>View Cart &amp; Checkout →</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Pricing & Procurement Configurator Card */}
        <MobileCard>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>PROCUREMENT MODE</Text>
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
            <View>
              <Text style={styles.mainPrice}>
                ₹{selectedUnit === 'PCS' ? product.pricePerPiece : product.pricePerKg}
              </Text>
              <Text style={styles.perUnitText}>per {selectedUnit} + 18% GST</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.altPriceLabel}>Dual Equivalent</Text>
              <Text style={styles.altPrice}>
                {selectedUnit === 'PCS' ? `₹${product.pricePerKg}/Kg` : `₹${product.pricePerPiece}/Pc`}
              </Text>
            </View>
          </View>

          {/* Stepper with Quick Increment Buttons */}
          <View style={styles.stepperContainer}>
            <Text style={styles.stepperLabel}>ORDER QUANTITY ({selectedUnit})</Text>
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
                onChangeText={(val) => setQuantity(Math.max(1, parseInt(val) || 0))}
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

            {/* Quick Presets */}
            <View style={styles.presetsRow}>
              {selectedUnit === 'PCS' ? (
                <>
                  <TouchableOpacity onPress={() => setQuantity(500)} style={styles.presetChip}>
                    <Text style={styles.presetChipText}>500 Pcs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setQuantity(1000)} style={styles.presetChip}>
                    <Text style={styles.presetChipText}>1,000 Pcs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setQuantity(5000)} style={styles.presetChip}>
                    <Text style={styles.presetChipText}>5,000 Pcs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setQuantity(10000)} style={styles.presetChip}>
                    <Text style={styles.presetChipText}>10K Pcs</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={() => setQuantity(50)} style={styles.presetChip}>
                    <Text style={styles.presetChipText}>50 Kg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setQuantity(250)} style={styles.presetChip}>
                    <Text style={styles.presetChipText}>250 Kg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setQuantity(500)} style={styles.presetChip}>
                    <Text style={styles.presetChipText}>500 Kg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setQuantity(1000)} style={styles.presetChip}>
                    <Text style={styles.presetChipText}>1 Ton</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.weightSummaryRow}>
              <Text style={styles.weightSummaryText}>
                Calculated Weight: <Text style={styles.boldWeight}>{totalWeightKg.toLocaleString()} Kg</Text>
              </Text>
              <Text style={styles.weightSummaryText}>
                Unit Weight: {weightPerPc} kg/pc
              </Text>
            </View>
          </View>

          {/* Dynamic Slab Discount Banner */}
          <View style={styles.slabBox}>
            <View style={styles.slabHeaderRow}>
              <Text style={styles.slabTitle}>
                {slab.pct > 0 ? `✨ VOLUME DISCOUNT: ${slab.pct}% APPLIED` : '⚡ BULK SLAB DISCOUNTS'}
              </Text>
              {slab.pct > 0 ? (
                <Text style={styles.slabSavingsText}>Saved ₹{discountAmount.toLocaleString('en-IN')}</Text>
              ) : null}
            </View>

            {slab.nextWeight ? (
              <Text style={styles.slabNextText}>
                Add {(slab.nextWeight - totalWeightKg).toFixed(1)} Kg more to unlock {slab.nextPct}% discount!
              </Text>
            ) : (
              <Text style={styles.slabNextText}>
                Maximum Volume Tier Active (18% Container Load Discount)
              </Text>
            )}
          </View>
        </MobileCard>

        {/* Technical Specifications (NABL / DIN Verified) */}
        <MobileCard>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>NABL TECHNICAL SPECIFICATIONS</Text>
            <View style={styles.certPill}>
              <Text style={styles.certPillText}>EN 10204 Type 3.1</Text>
            </View>
          </View>

          <View style={styles.specTable}>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Standard</Text>
              <Text style={styles.specVal}>{product.standard || 'DIN 933'}</Text>
            </View>
            {product.isoStandard ? (
              <View style={styles.specRow}>
                <Text style={styles.specKey}>ISO Equivalent</Text>
                <Text style={styles.specVal}>{product.isoStandard}</Text>
              </View>
            ) : null}
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Tensile Grade</Text>
              <Text style={styles.specVal}>{product.grade || '8.8 High Tensile'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Surface Finish</Text>
              <Text style={styles.specVal}>{product.finish || 'Zinc Clear Cr3+'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Diameter</Text>
              <Text style={styles.specVal}>{product.diameter || 'M10'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Length</Text>
              <Text style={styles.specVal}>{product.lengthMm || 50} mm</Text>
            </View>
            {product.pitchMm ? (
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Thread Pitch</Text>
                <Text style={styles.specVal}>{product.pitchMm} mm</Text>
              </View>
            ) : null}
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Thread Type</Text>
              <Text style={styles.specVal}>{product.threadType || 'Metric Full Thread'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>HSN Code</Text>
              <Text style={styles.specVal}>{product.hsnCode || '73181500'}</Text>
            </View>
          </View>
        </MobileCard>

        {/* Dispatch & Delivery Estimator */}
        <MobileCard>
          <Text style={styles.sectionTitle}>DELIVERY ESTIMATE</Text>
          <View style={styles.pincodeRow}>
            <TextInput
              style={styles.pincodeInput}
              value={deliveryPincode}
              onChangeText={setDeliveryPincode}
              placeholder="Enter Pincode"
              keyboardType="numeric"
              maxLength={6}
            />
            <View style={styles.dispatchPill}>
              <Text style={styles.dispatchPillText}>Dispatch in 24-48h</Text>
            </View>
          </View>
          <Text style={styles.deliveryDesc}>
            Direct logistics dispatch via Blue Dart Express, TCI Freight, or V-Trans with live transit tracking.
          </Text>
        </MobileCard>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.netLabel}>Estimated Net (+18% GST)</Text>
          <Text style={styles.netValue}>₹{grandTotal.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity onPress={handleAdd} style={styles.ctaBtn}>
          <Text style={styles.ctaBtnText}>🛒 Add to RFQ Cart</Text>
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
    paddingBottom: 90,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  backBtnText: {
    color: '#0052CC',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
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
  standardTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  isoTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
  },
  categorySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  warehouseStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  warehouseStockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toastText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  toastLink: {
    color: '#0052CC',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  unitPills: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  unitBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  unitBtnActive: {
    backgroundColor: '#0052CC',
  },
  unitBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  mainPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0052CC',
  },
  perUnitText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  altPriceLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  altPrice: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '700',
  },
  stepperContainer: {
    gap: 8,
  },
  stepperLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0052CC',
  },
  stepInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  presetChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  weightSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  weightSummaryText: {
    fontSize: 11,
    color: '#64748B',
  },
  boldWeight: {
    fontWeight: '800',
    color: '#0F172A',
  },
  slabBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  slabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slabTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  slabSavingsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  slabNextText: {
    fontSize: 10,
    color: '#1E40AF',
    marginTop: 2,
    fontWeight: '600',
  },
  certPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  certPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0052CC',
  },
  specTable: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 6,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  specKey: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  pincodeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  pincodeInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dispatchPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dispatchPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  deliveryDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  netLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  netValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0052CC',
  },
  ctaBtn: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default CustomerProductDetailScreen;
