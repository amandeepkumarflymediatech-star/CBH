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
import { MobileBadge } from '../../components/MobileBadge';

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
      title: 'Fastener Standards Explained: Complete Guide to DIN, ISO, and ASTM Equivalencies',
      category: 'Standards & Compliance',
      author: 'Technical Team',
      date: 'Oct 20, 2024',
      status: 'PUBLISHED',
      views: 1420,
    },
    {
      id: 'high-tensile-grade-8-8-10-9-12-9',
      title: 'High-Tensile Fasteners: When to Specify Grade 8.8, 10.9, or 12.9 in Structural Assemblies',
      category: 'Engineering & Design',
      author: 'Quality Lab',
      date: 'Oct 02, 2024',
      status: 'PUBLISHED',
      views: 1250,
    },
    {
      id: 'ss304-vs-ss316-corrosion',
      title: 'SS 304 vs SS 316 Fasteners: Corrosion Resistance in Marine & Chemical Infrastructure',
      category: 'Material Metallurgy',
      author: 'Er. R. K. Singla',
      date: 'Oct 14, 2024',
      status: 'PUBLISHED',
      views: 980,
    },
    {
      id: 'bis-mandatory-qco-fasteners',
      title: 'Mandatory BIS Quality Control Orders (QCO) for Fasteners in India',
      category: 'Standards & Compliance',
      author: 'Compliance Cell',
      date: 'Sep 24, 2024',
      status: 'PUBLISHED',
      views: 740,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Standards & Compliance');
  const [newAuthor, setNewAuthor] = useState('CBH Metallurgy Desk');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleToggleStatus = (id: string) => {
    setBlogs((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: b.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : b
      )
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Article', 'Are you sure you want to remove this published technical guide?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setBlogs((prev) => prev.filter((b) => b.id !== id)),
      },
    ]);
  };

  const handlePublishNew = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Incomplete Article', 'Please provide at least a Title and Content.');
      return;
    }

    const created: BlogPostAdmin = {
      id: `post-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      author: newAuthor.trim(),
      date: 'Today',
      status: 'PUBLISHED',
      views: 1,
    };

    setBlogs([created, ...blogs]);
    setIsCreating(false);
    setNewTitle('');
    setNewExcerpt('');
    setNewContent('');
    Alert.alert('Published', `"${created.title}" is now live in the mobile & web technical library!`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Admin Console</Text>
        </TouchableOpacity>
      ) : null}

      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Technical Blog Management</Text>
          <Text style={styles.subtitle}>Author, review & publish fastener metallurgy articles</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsCreating(!isCreating)}
          style={[styles.createBtn, isCreating && styles.createBtnCancel]}
        >
          <Text style={styles.createBtnText}>{isCreating ? '✕ Cancel' : '＋ New Article'}</Text>
        </TouchableOpacity>
      </View>

      {/* Create New Form */}
      {isCreating ? (
        <MobileCard>
          <Text style={styles.formHeading}>Publish New Technical Article</Text>

          <Text style={styles.label}>Article Title *</Text>
          <TextInput
            style={styles.input}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="e.g. Zinc Nickel Plating vs Geomet 500 for Offshore Bolting"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={newCategory}
            onChangeText={setNewCategory}
            placeholder="Standards & Compliance"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Author Name</Text>
          <TextInput
            style={styles.input}
            value={newAuthor}
            onChangeText={setNewAuthor}
            placeholder="e.g. Quality Control Department"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Summary / Excerpt</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            value={newExcerpt}
            onChangeText={setNewExcerpt}
            placeholder="Brief 2-sentence summary for preview cards..."
            placeholderTextColor="#94A3B8"
            multiline
          />

          <Text style={styles.label}>Full Article Content (Markdown supported) *</Text>
          <TextInput
            style={[styles.input, { height: 120 }]}
            value={newContent}
            onChangeText={setNewContent}
            placeholder="Write engineering guidelines, chemical specs, and application standards..."
            placeholderTextColor="#94A3B8"
            multiline
          />

          <TouchableOpacity onPress={handlePublishNew} style={styles.publishBtn}>
            <Text style={styles.publishBtnText}>Publish to Live Library →</Text>
          </TouchableOpacity>
        </MobileCard>
      ) : null}

      {/* Blogs List */}
      <Text style={styles.listTitle}>Published Technical Guides ({blogs.length})</Text>

      {blogs.map((b) => (
        <MobileCard key={b.id}>
          <View style={styles.rowBetween}>
            <View style={styles.catPill}>
              <Text style={styles.catText}>{b.category}</Text>
            </View>
            <TouchableOpacity onPress={() => handleToggleStatus(b.id)}>
              <MobileBadge
                label={b.status}
                variant={b.status === 'PUBLISHED' ? 'success' : 'neutral'}
                size="sm"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.postTitle}>{b.title}</Text>
          <Text style={styles.postMeta}>
            By {b.author} · {b.date} · {b.views} views
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => handleToggleStatus(b.id)} style={styles.statusToggleBtn}>
              <Text style={styles.statusToggleText}>
                {b.status === 'PUBLISHED' ? 'Switch to Draft' : 'Make Live'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDelete(b.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </MobileCard>
      ))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  createBtn: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  createBtnCancel: {
    backgroundColor: '#64748B',
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  formHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 3,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#0F172A',
  },
  publishBtn: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 10,
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  catText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0052CC',
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  postMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  statusToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
});

