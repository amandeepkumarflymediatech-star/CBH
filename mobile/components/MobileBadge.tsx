import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface MobileBadgeProps {
  label?: string;
  text?: string;
  variant?:
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | 'primary'
    | 'accent';
  size?: 'sm' | 'md';
}

export const MobileBadge: React.FC<MobileBadgeProps> = ({
  label,
  text,
  variant = 'neutral',
  size = 'md',
}) => {
  const badgeText = label || text || '';
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
      case 'warning':
        return { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' };
      case 'danger':
        return { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' };
      case 'info':
        return { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' };
      case 'primary':
        return { bg: '#EFF6FF', text: '#0052CC', border: '#BFDBFE' };
      case 'accent':
        return { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' };
      case 'neutral':
      default:
        return { bg: '#F1F5F9', text: '#334155', border: '#E2E8F0' };
    }
  };

  const c = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          paddingVertical: isSm ? 2 : 3,
          paddingHorizontal: isSm ? 6 : 8,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: c.text,
            fontSize: isSm ? 10 : 11,
          },
        ]}
      >
        {badgeText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default MobileBadge;
