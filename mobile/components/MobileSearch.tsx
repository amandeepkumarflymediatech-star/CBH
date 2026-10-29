import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';

interface MobileSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
}

export const MobileSearch: React.FC<MobileSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search DIN, ISO, Grade, SKU...',
  onFilterPress,
  isFilterActive = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.inputBox, value ? styles.inputBoxActive : null]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />
        {value ? (
          <TouchableOpacity onPress={() => onChange('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {onFilterPress ? (
        <TouchableOpacity
          onPress={onFilterPress}
          style={[styles.filterBtn, isFilterActive ? styles.filterBtnActive : null]}
        >
          <Text style={styles.filterIcon}>⚙</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
  },
  inputBoxActive: {
    borderColor: '#0052CC',
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0052CC',
  },
  filterIcon: {
    fontSize: 16,
    color: '#0052CC',
  },
});

export default MobileSearch;
