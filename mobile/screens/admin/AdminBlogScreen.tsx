import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { MobileModal } from '../../components/MobileModal';

const GRAPHITE = '#0F172A';
const STEEL = '#475569';
const LIGHT_STEEL = '#94A3B8';
const WHITE = '#FFFFFF';
const BLUE = '#0052CC';
const GREEN = '#16A34A';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

interface AdminBlogScreenProps {
  onBack?: () => void;
}

interface BlogPostAdmin {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  status: 'PUBLISHED' | 'DRAFT';
  views: number;
}

export const AdminBlogScreen: React.FC<AdminBlogScreenProps> = ({ onBack }) => {
  const [blogs, setBlogs] = useState<BlogPostAdmin[]>([
    {
      id: 'din-vs-iso-vs-astm',
      title: 'Fastener Standards Guide: DIN, ISO, and ASTM Equivalencies',
      category: 'Standards',
      author: 'Technical Team',
      date: '20 Oct',
      status: 'PUBLISHED',
      views: 1420,
    },
    {
      id: 'high-tensile-grade-8-8-10-9-12-9',
      title: 'High-Tensile Fasteners: When to Specify Grade 8.8 vs 10.9 vs 12.9',
      category: 'Metallurgy',
      author: 'Quality Lab',
      date: '02 Oct',
      status: 'PUBLISHED',
      views: 1250,
    },
    {
      id: 'ss304-vs-ss316-corrosion',
      title: 'SS 304 vs SS 316 Fasteners: Marine & Chemical Infrastructure',
      category: 'Corrosion',
      author: 'Er. R. K. Singla',
      date: '14 Oct',
      status: 'PUBLISHED',
      views: 980,
    },
    {
      id: 'bis-mandatory-qco-fasteners',
      title: 'Mandatory BIS Quality Control Orders (QCO) for Fasteners in India',
      category: 'Compliance',
      author: 'Compliance Cell',
      date: '24 Sep',
      status: 'PUBLISHED',
      views: 740,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Standards');
  const [newAuthor, setNewAuthor] = useState('CBH Technical Desk');
  const [newExcerpt, setNewExcerpt] = useState('');

  const handleToggleStatus = (id: string) => {
    setBlogs((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: b.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : b
      )
    );
  };

  const handleCreateBlog = () => {
    if (!newTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the article.');
      return;
    }

    const newPost: BlogPostAdmin = {
      id: newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: newTitle.trim(),
      category: newCategory.trim(),
      author: newAuthor.trim(),
      date: 'Today',
      status: 'PUBLISHED',
      views: 0,
    };

    setBlogs([newPost, ...blogs]);
    setIsCreating(false);
    setNewTitle('');
    setNewExcerpt('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Engineering Library</Text>
            <Text style={styles.headerSub}>{blogs.length} Technical Knowledge Articles</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsCreating(true)}
            style={styles.addBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnText}>+ Article</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* High Density Articles List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {blogs.map((b) => {
          const isPublished = b.status === 'PUBLISHED';
          return (
            <View key={b.id} style={styles.blogCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{b.category}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleToggleStatus(b.id)}
                  style={[styles.statusPill, isPublished ? styles.pillPub : styles.pillDraft]}
                >
                  <Text style={[styles.statusText, isPublished ? styles.textPub : styles.textDraft]}>
                    {b.status}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.blogTitle} numberOfLines={2}>
                {b.title}
              </Text>

              <View style={styles.cardFooterRow}>
                <Text style={styles.metaText}>
                  {b.author} • {b.date}
                </Text>
                <Text style={styles.viewsText}>{b.views.toLocaleString()} reads</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Create Article Modal */}
      <MobileModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Publish Engineering Article"
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Article Headline *</Text>
          <TextInput
            style={styles.input}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="e.g. Zinc Nickel vs HDG Corrosion Analysis"
          />

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Metallurgy"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Author</Text>
              <TextInput
                style={styles.input}
                value={newAuthor}
                onChangeText={setNewAuthor}
                placeholder="Technical Desk"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Executive Summary</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            value={newExcerpt}
            onChangeText={setNewExcerpt}
            placeholder="Key takeaways for structural procurement engineers..."
            multiline
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleCreateBlog}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>Publish to Storefront</Text>
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GRAPHITE,
  },
  headerSub: {
    fontSize: 10,
    color: STEEL,
    marginTop: 1,
  },
  addBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  blogCard: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: STEEL,
  },
  statusPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  pillPub: {
    backgroundColor: '#DCFCE7',
  },
  pillDraft: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  textPub: {
    color: GREEN,
  },
  textDraft: {
    color: STEEL,
  },
  blogTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: GRAPHITE,
    lineHeight: 17,
    marginBottom: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 4,
  },
  metaText: {
    fontSize: 10,
    color: LIGHT_STEEL,
  },
  viewsText: {
    fontSize: 10,
    fontFamily: MONO,
    color: STEEL,
  },
  modalScroll: {
    paddingVertical: 6,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: STEEL,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    color: GRAPHITE,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: BLUE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
});
