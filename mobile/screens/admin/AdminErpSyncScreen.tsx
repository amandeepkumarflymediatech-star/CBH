import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { mobileApi } from '../../config/api';

export const AdminErpSyncScreen: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [syncLogs, setSyncLogs] = useState<Array<{ id: number; time: string; msg: string }>>([
    { id: 1, time: '14:45:10', msg: 'Sales Order SO-2026-00441 pushed to ERPNext' },
    { id: 2, time: '12:20:00', msg: 'Product catalog sync completed (150 items)' },
  ]);

  const handleSync = async (doctype: 'all' | 'item' | 'order') => {
    setIsSyncing(true);
    try {
      await mobileApi.erpnext.triggerSync(doctype);
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        msg: `Manual sync completed for [${doctype.toUpperCase()}]`,
      };
      setSyncLogs((prev) => [newLog, ...prev]);
      setToastMsg(`ERPNext ${doctype.toUpperCase()} sync completed!`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.nodeCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.nodeTitle}>ERPNext Master Node</Text>
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>ACTIVE TLS 1.3</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>Host</Text>
            <Text style={styles.statVal}>erp.cbhfasteners.com</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Latency</Text>
            <Text style={styles.statVal}>38 ms</Text>
          </View>
        </View>
      </View>

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionHeading}>Execute Bi-Directional Sync</Text>

      <TouchableOpacity
        onPress={() => handleSync('all')}
        disabled={isSyncing}
        style={styles.fullSyncBtn}
      >
        <Text style={styles.fullSyncText}>
          {isSyncing ? 'Synchronizing...' : '↻ Sync Full System (All Doctypes)'}
        </Text>
      </TouchableOpacity>

      <View style={styles.splitRow}>
        <TouchableOpacity
          onPress={() => handleSync('order')}
          disabled={isSyncing}
          style={styles.splitBtn}
        >
          <Text style={styles.splitBtnText}>Sync Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSync('item')}
          disabled={isSyncing}
          style={styles.splitBtn}
        >
          <Text style={styles.splitBtnText}>Sync Catalog</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionHeading, { marginTop: 14 }]}>Sync History Log</Text>

      {syncLogs.map((log) => (
        <View key={log.id} style={styles.logCard}>
          <Text style={styles.logMsg}>✓ {log.msg}</Text>
          <Text style={styles.logTime}>{log.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  nodeCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeBadge: {
    backgroundColor: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  statVal: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
    marginTop: 2,
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
    fontWeight: '700',
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  fullSyncBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullSyncText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  splitBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  splitBtnText: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 12,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logMsg: {
    fontSize: 11,
    color: '#0F172A',
    flex: 1,
  },
  logTime: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 8,
  },
});

export default AdminErpSyncScreen;
