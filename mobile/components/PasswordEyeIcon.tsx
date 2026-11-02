import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PasswordEyeIconProps {
  visible: boolean;
  color?: string;
  size?: number;
}

/**
 * Enterprise Native Vector Icon for Password Visibility Toggle.
 * Provides pixel-sharp open eye (visible) and slashed eye (hidden) glyphs
 * across all Android & iOS devices without external font dependencies.
 */
export const PasswordEyeIcon: React.FC<PasswordEyeIconProps> = ({
  visible,
  color = '#64748B',
  size = 20,
}) => {
  const eyeColor = visible ? '#0052CC' : color;
  const strokeWidth = 1.8;
  const eyeWidth = size;
  const eyeHeight = size * 0.62;
  const pupilSize = size * 0.32;

  return (
    <View style={[styles.container, { width: size + 6, height: size + 6 }]}>
      {/* Almond eye outline */}
      <View
        style={[
          styles.outline,
          {
            width: eyeWidth,
            height: eyeHeight,
            borderColor: eyeColor,
            borderWidth: strokeWidth,
            borderRadius: eyeWidth / 2,
          },
        ]}
      >
        {/* Center pupil */}
        <View
          style={[
            styles.pupil,
            {
              width: pupilSize,
              height: pupilSize,
              borderRadius: pupilSize / 2,
              backgroundColor: eyeColor,
            },
          ]}
        />
      </View>

      {/* Diagonal slash for hidden (eye-off) */}
      {!visible && (
        <View
          style={[
            styles.slash,
            {
              width: eyeWidth * 1.15,
              height: strokeWidth,
              backgroundColor: eyeColor,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outline: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pupil: {},
  slash: {
    position: 'absolute',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
});

