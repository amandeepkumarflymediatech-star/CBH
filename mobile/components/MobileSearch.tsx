import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ReturnKeyTypeOptions,
} from 'react-native';
import { NavIcon } from './NavIcon';

interface MobileSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
  onSubmit?: () => void;
  returnKeyType?: ReturnKeyTypeOptions;
  autoFocus?: boolean;
}

export const MobileSearch: React.FC<MobileSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search DIN, ISO, Grade, SKU...',
  onFilterPress,
  isFilterActive = false,
  onSubmit,
  returnKeyType = 'search',
  autoFocus = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.inputBox, value ? styles.inputBoxActive : null]}>
        <View style={styles.searchIconWrap}>
          <NavIcon name="search" color="#64748B" size={15} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={styles.input}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmit}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value ? (
          <TouchableOpacity
            onPress={() => onChange('')}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {onFilterPress ? (
        <TouchableOpacity
          onPress={onFilterPress}
          style={[styles.filterBtn, isFilterActive ? styles.filterBtnActive : null]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <NavIcon name="filter" color={isFilterActive ? '#FFFFFF' : '#0F172A'} size={16} />
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
  searchIconWrap: {
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
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
