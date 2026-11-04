import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileAuthUser } from '../../types';
import { mobileApi } from '../../config/api';

interface CustomerBulkOrderScreenProps {
  user?: MobileAuthUser | null;
  onBack?: () => void;
  onOrderSubmitted?: (rfqNumber: string) => void;
}

interface FastenerRow {
  standard: string;
  diameter: string;
  length: string;
  grade: string;
  finish: string;
  quantity: string;
  unit: 'KG' | 'PCS';
}

export const CustomerBulkOrderScreen: React.FC<CustomerBulkOrderScreenProps> = ({
  user,
  onBack,
  onOrderSubmitted,
}) => {
  const [projectName, setProjectName] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState(user?.address || '');
  const [requiredDate, setRequiredDate] = useState('Within 15 Days');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fastenerRows, setFastenerRows] = useState<FastenerRow[]>([
    {
      standard: 'DIN 933',
      diameter: 'M16',
      length: '65mm',
      grade: '8.8',
      finish: 'Hot-Dip Galv (HDG)',
      quantity: '2500',
      unit: 'KG',
    },
  ]);

  const handleAddRow = () => {
    setFastenerRows((prev) => [
      ...prev,
      {
        standard: 'DIN 934',
        diameter: 'M16',
        length: 'Standard',
        grade: '8.8',
        finish: 'Hot-Dip Galv (HDG)',
        quantity: '1000',
        unit: 'KG',
      },
    ]);
  };

  const handleRemoveRow = (idx: number) => {
    if (fastenerRows.length === 1) return;
    setFastenerRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRow = (idx: number, field: keyof FastenerRow, val: string) => {
    setFastenerRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
    );
  };

  const handleAttachDemoFile = (name: string) => {
    setAttachedFileName(name);
  };

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      Alert.alert('Missing Project Info', 'Please specify the Project Name or Tender Reference.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create live RFQ payload
      const rfqPayload = {
        companyName: user?.companyName || 'Enterprise Buyer',
        contactName: user?.fullName || 'Procurement Officer',
        email: user?.email || 'procurement@client.com',
        phone: user?.phone || '+91 98880 21000',
        deliveryLocation,
        projectReference: projectName,
        targetTimeline: requiredDate,
        attachmentName: attachedFileName || undefined,
        notes: notes || undefined,
        items: fastenerRows.map((r) => ({
          standard: r.standard,
          size: `${r.diameter}x${r.length}`,
          grade: r.grade,
          finish: r.finish,
          quantity: Number(r.quantity) || 1000,
          unit: r.unit,
        })),
      };

      const res = await mobileApi.rfq.create(rfqPayload);
      setIsSubmitting(false);

      const generatedNum = res?.rfqNumber || `CBH-RFQ-${Math.floor(100000 + Math.random() * 900000)}`;

      Alert.alert(
        'Project Tender RFQ Submitted',
        `Your bulk procurement request has been generated under ${generatedNum}. An official stamped quotation with wholesale discount margins will be issued shortly.`,
        [
          {
            text: 'Return to Home',
            onPress: () => {
              if (onBack) onBack();
              else if (onOrderSubmitted) onOrderSubmitted('home');
            },
            style: 'cancel',
          },
          {
            text: 'View My Orders',
            onPress: () => {
              if (onOrderSubmitted) onOrderSubmitted('orders');
            },
          },
        ]
      );
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Submission Error', err.message || 'Could not submit bulk RFQ.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      ) : null} */}

      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BULK PROCUREMENT & TENDER SPECIFICATION</Text>
        </View>
        <Text style={styles.bannerTitle}>Project Tender & High-Tonnage RFQ</Text>
        <Text style={styles.bannerSubtitle}>
          Direct mill pricing for bridge fabricators, solar contractors, metro rail tenders, and heavy machinery OEMs.
        </Text>
      </View>

      {/* Project Information */}
      <Text style={styles.sectionHeader}>1. Project & Delivery Context</Text>
      <MobileCard>
        <Text style={styles.label}>Project Name / Tender Ref *</Text>
        <TextInput
          style={styles.input}
          value={projectName}
          onChangeText={setProjectName}
          placeholder="e.g. NHAI Bridge Package 4 / 250MW Solar Array"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>Delivery Site / Godown Destination</Text>
        <TextInput
          style={styles.input}
          value={deliveryLocation}
          onChangeText={setDeliveryLocation}
          placeholder="Delivery city, state, pin code"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>Required Delivery Timeline</Text>
        <View style={styles.timelineRow}>
          {['Within 7 Days', 'Within 15 Days', 'Within 30 Days', 'Scheduled Call-offs'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setRequiredDate(t)}
              style={[styles.timelinePill, requiredDate === t && styles.timelinePillActive]}
            >
              <Text style={[styles.timelineText, requiredDate === t && styles.timelineTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </MobileCard>

      {/* Fastener Schedule Matrix */}
      <View style={styles.rowBetween}>
        <Text style={styles.sectionHeader}>2. Fastener Specification Schedule</Text>
        <TouchableOpacity onPress={handleAddRow} style={styles.addRowBtn}>
          <Text style={styles.addRowBtnText}>＋ Add Item</Text>
        </TouchableOpacity>
      </View>

      {fastenerRows.map((row, idx) => (
        <MobileCard key={idx}>
          <View style={styles.rowBetween}>
            <Text style={styles.rowItemTitle}>Fastener Line #{idx + 1}</Text>
            {fastenerRows.length > 1 ? (
              <TouchableOpacity onPress={() => handleRemoveRow(idx)}>
                <Text style={styles.removeText}>✕ Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.rowGrid}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.miniLabel}>Standard</Text>
              <TextInput
                style={styles.miniInput}
                value={row.standard}
                onChangeText={(v) => handleUpdateRow(idx, 'standard', v)}
                placeholder="DIN 933"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.miniLabel}>Diameter</Text>
              <TextInput
                style={styles.miniInput}
                value={row.diameter}
                onChangeText={(v) => handleUpdateRow(idx, 'diameter', v)}
                placeholder="M16"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.miniLabel}>Length</Text>
              <TextInput
                style={styles.miniInput}
                value={row.length}
                onChangeText={(v) => handleUpdateRow(idx, 'length', v)}
                placeholder="65mm"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.rowGrid}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.miniLabel}>Grade / Class</Text>
              <TextInput
                style={styles.miniInput}
                value={row.grade}
                onChangeText={(v) => handleUpdateRow(idx, 'grade', v)}
                placeholder="8.8 / 10.9"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={{ flex: 1.5 }}>
              <Text style={styles.miniLabel}>Coating / Finish</Text>
              <TextInput
                style={styles.miniInput}
                value={row.finish}
                onChangeText={(v) => handleUpdateRow(idx, 'finish', v)}
                placeholder="HDG / Zinc Flake"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.rowGrid}>
            <View style={{ flex: 1.5, marginRight: 6 }}>
              <Text style={styles.miniLabel}>Quantity</Text>
              <TextInput
                style={styles.miniInput}
                value={row.quantity}
                onChangeText={(v) => handleUpdateRow(idx, 'quantity', v)}
                keyboardType="numeric"
                placeholder="2500"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.miniLabel}>Unit</Text>
              <View style={styles.unitToggleRow}>
                <TouchableOpacity
                  onPress={() => handleUpdateRow(idx, 'unit', 'KG')}
                  style={[styles.unitToggleBtn, row.unit === 'KG' && styles.unitToggleBtnActive]}
                >
                  <Text style={[styles.unitToggleText, row.unit === 'KG' && styles.unitToggleTextActive]}>
                    KGS
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleUpdateRow(idx, 'unit', 'PCS')}
                  style={[styles.unitToggleBtn, row.unit === 'PCS' && styles.unitToggleBtnActive]}
                >
                  <Text style={[styles.unitToggleText, row.unit === 'PCS' && styles.unitToggleTextActive]}>
                    PCS
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </MobileCard>
      ))}

      {/* Bill of Materials (BOM) Attachment */}
      <Text style={styles.sectionHeader}>3. Technical Blueprint / Excel BOM</Text>
      <MobileCard>
        <Text style={styles.subtext}>
          Have an existing Excel Bill of Materials (BOM) or 2D technical CAD drawing? Attach below for automated line matching.
        </Text>

        {attachedFileName ? (
          <View style={styles.attachedBox}>
            
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.attachedName}>{attachedFileName}</Text>
              <Text style={styles.attachedStatus}>Ready for engineering upload</Text>
            </View>
            <TouchableOpacity onPress={() => setAttachedFileName('')}>
              <Text style={styles.removeAttached}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sampleBOMsRow}>
            <TouchableOpacity
              onPress={() => handleAttachDemoFile('BOM_Fastener_Schedule_Package_4.xlsx')}
              style={styles.attachBtn}
            >
              <Text style={styles.attachBtnText}>Attach Excel BOM (.xlsx)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAttachDemoFile('Custom_Anchor_Drawing_DWG_Rev2.pdf')}
              style={styles.attachBtn}
            >
              <Text style={styles.attachBtnText}>Attach CAD Drawing (.pdf)</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 12 }]}>Special Technical Notes / Testing Requirements</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. 1000-hr salt spray test certificate, 100% optical sorting, third-party inspection (SGS/TÜV) required..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={3}
        />
      </MobileCard>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
      >
        <Text style={styles.submitBtnText}>
          {isSubmitting ? 'Generating Official RFQ...' : 'Submit Bulk Tender RFQ →'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  backBtn: {
    marginBottom: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0052CC',
  },
  banner: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 107, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFB066',
    fontSize: 10,
    fontWeight: '800',
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addRowBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  addRowBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0052CC',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 10,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  timelineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timelinePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  timelinePillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0052CC',
  },
  timelineText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  timelineTextActive: {
    color: '#0052CC',
    fontWeight: '800',
  },
  rowItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0052CC',
  },
  removeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  rowGrid: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  miniInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0F172A',
  },
  unitToggleRow: {
    flexDirection: 'row',
    height: 33,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  unitToggleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  unitToggleBtnActive: {
    backgroundColor: '#0052CC',
  },
  unitToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  unitToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sampleBOMsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  attachBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0052CC',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  attachBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
  },
  attachedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
  },
  attachedIcon: {
    fontSize: 18,
  },
  attachedName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  attachedStatus: {
    fontSize: 10,
    color: '#047857',
  },
  removeAttached: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '800',
    padding: 4,
  },
  submitBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

