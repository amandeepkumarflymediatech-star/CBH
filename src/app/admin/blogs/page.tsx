'use client';

import React, { useState, useEffect } from 'react';
import AdminBlogSection from '@/components/admin/AdminBlogSection';
import { BlogPost } from '@/lib/types';
import { INITIAL_BLOG_POSTS } from '@/lib/mock-data';
import { CheckCircle2 } from 'lucide-react';

export default function AdminBlogsPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadBlogs = async () => {
    try {
      const res = await fetch('/api/blogs?all=true');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBlogPosts(json.data);
      }
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleAddBlog = async (blogData: Omit<BlogPost, 'id'>) => {
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBlogPosts((prev) => [data.data, ...prev]);
        showToast(`Article "${blogData.title}" published.`);
      } else {
        const localBlog: BlogPost = { ...blogData, id: `blog-${Date.now()}` };
        setBlogPosts((prev) => [localBlog, ...prev]);
        showToast(`Article "${blogData.title}" created.`);
      }
    } catch {
      const localBlog: BlogPost = { ...blogData, id: `blog-${Date.now()}` };
      setBlogPosts((prev) => [localBlog, ...prev]);
      showToast(`Article "${blogData.title}" created.`);
    }
  };

  const handleUpdateBlog = async (updated: BlogPost) => {
    try {
      const res = await fetch('/api/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBlogPosts((prev) => prev.map((b) => (b.id === updated.id ? data.data : b)));
        showToast(`Article "${updated.title}" updated.`);
      } else {
        setBlogPosts((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        showToast(`Article "${updated.title}" updated.`);
      }
    } catch {
      setBlogPosts((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      showToast(`Article "${updated.title}" updated.`);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBlogPosts((prev) => prev.filter((b) => b.id !== id && b.slug !== id));
        showToast('Article deleted successfully.');
      } else {
        setBlogPosts((prev) => prev.filter((b) => b.id !== id && b.slug !== id));
        showToast('Article removed.');
      }
    } catch {
      setBlogPosts((prev) => prev.filter((b) => b.id !== id && b.slug !== id));
      showToast('Article removed.');
    }
  };

  return (
    <div>
      <AdminBlogSection
        blogPosts={blogPosts}
        onAddBlog={handleAddBlog}
        onUpdateBlog={handleUpdateBlog}
        onDeleteBlog={handleDeleteBlog}
      />

      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={16} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
