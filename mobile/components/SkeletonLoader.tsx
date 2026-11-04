import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ViewStyle,
  StyleProp,
  DimensionValue,
} from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

// ============================================================================
// PRE-BUILT COMPONENT SKELETONS MATCHING CBH FASTENERS UI
// ============================================================================

/**
 * Product Card Skeleton (Matching Catalog & Home Storefront)
 */
export const ProductCardSkeleton: React.FC = () => (
  <View style={styles.productCard}>
    <View style={styles.productImgWrap}>
      <Skeleton width="100%" height="100%" borderRadius={12} />
    </View>
    <View style={styles.productBody}>
      <View style={styles.rowBetween}>
        <Skeleton width="65%" height={16} borderRadius={4} />
        <Skeleton width="22%" height={16} borderRadius={4} />
      </View>
      <View style={styles.rowGap6}>
        <Skeleton width="45%" height={12} borderRadius={4} />
        <Skeleton width="30%" height={12} borderRadius={4} />
      </View>
      <View style={[styles.rowBetween, { marginTop: 8 }]}>
        <Skeleton width="38%" height={20} borderRadius={6} />
        <Skeleton width={90} height={32} borderRadius={16} />
      </View>
    </View>
  </View>
);

/**
 * Metric Card Skeleton (Matching Admin Dashboard & KPI blocks)
 */
export const MetricCardSkeleton: React.FC = () => (
  <View style={styles.metricCard}>
    <View style={styles.rowBetween}>
      <Skeleton width={36} height={36} borderRadius={10} />
      <Skeleton width={50} height={16} borderRadius={8} />
    </View>
    <View style={{ marginTop: 12, gap: 6 }}>
      <Skeleton width="70%" height={22} borderRadius={4} />
      <Skeleton width="50%" height={12} borderRadius={4} />
    </View>
  </View>
);

/**
 * Order / Quotation Card Skeleton
 */
export const OrderCardSkeleton: React.FC = () => (
  <View style={styles.orderCard}>
    <View style={styles.rowBetween}>
      <View style={{ gap: 4 }}>
        <Skeleton width={140} height={16} borderRadius={4} />
        <Skeleton width={90} height={12} borderRadius={4} />
      </View>
      <Skeleton width={80} height={24} borderRadius={12} />
    </View>
    <View style={styles.divider} />
    <View style={styles.rowBetween}>
      <View style={{ gap: 4 }}>
        <Skeleton width={120} height={13} borderRadius={4} />
        <Skeleton width={70} height={12} borderRadius={4} />
      </View>
      <Skeleton width={85} height={18} borderRadius={4} />
    </View>
  </View>
);

/**
 * List / Table Row Skeleton
 */
export const ListRowSkeleton: React.FC = () => (
  <View style={styles.listRow}>
    <Skeleton width={44} height={44} borderRadius={10} />
    <View style={{ flex: 1, gap: 6 }}>
      <Skeleton width="60%" height={14} borderRadius={4} />
      <Skeleton width="40%" height={11} borderRadius={4} />
    </View>
    <Skeleton width={60} height={16} borderRadius={4} />
  </View>
);

/**
 * Category Chip Carousel Skeleton (Home screen)
 */
export const CategoryChipsSkeleton: React.FC = () => (
  <View style={styles.chipsRow}>
    {[75, 85, 70, 95, 80].map((w, idx) => (
      <Skeleton key={idx} width={w} height={34} borderRadius={18} />
    ))}
  </View>
);

/**
 * Screen Header Hero Skeleton
 */
export const HeroBannerSkeleton: React.FC = () => (
  <View style={styles.heroBanner}>
    <Skeleton width="40%" height={12} borderRadius={4} />
    <Skeleton width="75%" height={20} borderRadius={6} />
    <Skeleton width="90%" height={14} borderRadius={4} />
    <View style={[styles.rowGap6, { marginTop: 8 }]}>
      <Skeleton width={110} height={34} borderRadius={18} />
      <Skeleton width={110} height={34} borderRadius={18} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#CBD5E1',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowGap6: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 14,
    marginTop: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 10,
  },
  productImgWrap: {
    width: 76,
    height: 76,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productBody: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 4,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    marginBottom: 8,
  },
});

