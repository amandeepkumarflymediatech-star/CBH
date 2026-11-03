import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  ViewStyle,
  ImageStyle,
  Text,
} from 'react-native';
import { resolveMediaUrl } from '../config/api';

interface FastenerProductImageProps {
  imageUrl?: string;
  drawingUrl?: string;
  category?: string;
  subGroup?: string;
  name?: string;
  productName?: string;
  standard?: string;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  height?: number;
  size?: number;
  showCadBadge?: boolean;
}

const LOCAL_3D_ASSETS = {
  bolt: require('../assets/hex_bolt_3d.jpg'),
  nut: require('../assets/hex_nut_3d.jpg'),
  screw: require('../assets/csk_screw_3d.jpg'),
  washer: require('../assets/flat_washer_3d.jpg'),
};

function getCategoryFallbackAsset(category?: string, productName?: string, standard?: string) {
  const combined = `${category || ''} ${productName || ''} ${standard || ''}`.toLowerCase();
  if (combined.includes('nut') || combined.includes('din 934') || combined.includes('din 985')) {
    return LOCAL_3D_ASSETS.nut;
  }
  if (combined.includes('washer') || combined.includes('din 125') || combined.includes('din 9021')) {
    return LOCAL_3D_ASSETS.washer;
  }
  if (
    combined.includes('csk') ||
    combined.includes('countersunk') ||
    combined.includes('din 965') ||
    combined.includes('din 7991') ||
    combined.includes('wood screw') ||
    combined.includes('self tapping')
  ) {
    return LOCAL_3D_ASSETS.screw;
  }
  return LOCAL_3D_ASSETS.bolt;
}

/**
 * FastenerProductImage
 * Renders product images matching the CBH website design.
 * Automatically resolves relative URLs (/assets/...) against Next.js host,
 * handles network error fallbacks, and displays CAD drawing indicators.
 */
export const FastenerProductImage: React.FC<FastenerProductImageProps> = ({
  imageUrl,
  drawingUrl,
  category,
  subGroup,
  name,
  productName,
  standard,
  containerStyle,
  imageStyle,
  height,
  size,
  showCadBadge = false,
}) => {
  const effectiveCategory = category || subGroup;
  const effectiveName = productName || name;
  const effectiveHeight = size !== undefined ? size : (height !== undefined ? height : 140);
  const effectiveWidth = size !== undefined ? size : undefined;
  const localFallback = getCategoryFallbackAsset(effectiveCategory, effectiveName, standard);
  
  // If the product is specifically a nut, washer, or screw but the database gave it generic bolt_zinc.jpg,
  // prefer the accurate 3D category render
  const combined = `${effectiveCategory || ''} ${effectiveName || ''} ${standard || ''}`.toLowerCase();
  const isGenericBolt = !imageUrl || imageUrl.includes('bolt_zinc') || imageUrl.includes('anchor_bolt');
  const isNonProductAsset = Boolean(
    imageUrl &&
      (imageUrl.includes('quality_') ||
        imageUrl.includes('global_') ||
        imageUrl.includes('hero') ||
        imageUrl.includes('logistics') ||
        imageUrl.includes('banner'))
  );
  const isNonBolt =
    combined.includes('nut') ||
    combined.includes('din 934') ||
    combined.includes('washer') ||
    combined.includes('din 125') ||
    combined.includes('csk') ||
    combined.includes('countersunk') ||
    combined.includes('din 965');
  const shouldUseLocalFallback = (isGenericBolt && isNonBolt) || isNonProductAsset;

  const [loading, setLoading] = useState(Boolean(imageUrl) && !shouldUseLocalFallback);
  const [hasError, setHasError] = useState(!imageUrl || shouldUseLocalFallback);

  const resolvedUri = imageUrl && !shouldUseLocalFallback ? resolveMediaUrl(imageUrl) : null;

  return (
    <View style={[styles.container, { height: effectiveHeight }, effectiveWidth !== undefined ? { width: effectiveWidth } : null, containerStyle]}>
      {hasError || !resolvedUri ? (
        <Image
          source={localFallback}
          style={[styles.image, imageStyle]}
          resizeMode="contain"
        />
      ) : (
        <>
          {loading && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#0052CC" />
            </View>
          )}

          <Image
            source={{ uri: resolvedUri }}
            style={[styles.image, imageStyle]}
            resizeMode="contain"
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setHasError(true);
              setLoading(false);
            }}
          />
        </>
      )}

      {showCadBadge && drawingUrl ? (
        <View style={styles.cadBadge}>
          <Text style={styles.cadBadgeText}>CAD 2D</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 8,
  },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  blueprintFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  fallbackIcon: {
    fontSize: 34,
    marginBottom: 4,
  },
  fallbackText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0052CC',
    letterSpacing: 0.5,
  },
  fallbackSub: {
    fontSize: 8,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  cadBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cadBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default FastenerProductImage;

