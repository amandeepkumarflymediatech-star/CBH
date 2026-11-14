import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AdminErpSyncScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ERP Integration Decommissioned</Text>
      <Text style={styles.sub}>
        All ERPNext sync pipelines have been detached. Product catalog, orders, and RFQs operate directly via the local database.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
