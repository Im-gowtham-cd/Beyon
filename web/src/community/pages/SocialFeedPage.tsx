import { useState, useEffect } from 'react';
import { communityApi } from '../services/communityApi';
import type { SocialPost, SocialComment } from '../types/community';
import styles from './Community.module.css';

export function SocialFeedPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, SocialComment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { communityApi.getFeed().then(setPosts).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    const post = await communityApi.createPost(newPost);
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleLike = async (postId: string) => {
    const res = await communityApi.toggleLike('POST', postId);
    setPosts(posts.map(p => p.id === postId ? { ...p, likeCount: res.likeCount } : p));
  };

  const loadComments = async (postId: string) => {
    if (expandedPost === postId) { setExpandedPost(null); return; }
    setExpandedPost(postId);
    if (!comments[postId]) {
      const c = await communityApi.getComments(postId);
      setComments({ ...comments, [postId]: c });
    }
  };

  const handleComment = async (postId: string) => {
    if (!newComment.trim()) return;
    const c = await communityApi.addComment(postId, newComment);
    setComments({ ...comments, [postId]: [...(comments[postId] || []), c] });
    setNewComment('');
    setPosts(posts.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading feed...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Community Feed</h1>
      </div>

      <div className={styles.compose}>
        <textarea className={styles.composeInput} placeholder="Share something with the community..." value={newPost} onChange={e => setNewPost(e.target.value)} rows={3} />
        <button className={styles.composeBtn} onClick={handlePost} disabled={!newPost.trim()}>Post</button>
      </div>

      <div className={styles.postList}>
        {posts.map(post => (
          <div className={styles.postCard} key={post.id}>
            <div className={styles.postHeader}>
              <span className={styles.postType}>{post.postType}</span>
              <span className={styles.postTime}>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            {post.title && <div className={styles.postTitle}>{post.title}</div>}
            <div className={styles.postContent}>{post.content}</div>
            <div className={styles.postActions}>
              <button className={styles.actionBtn} onClick={() => handleLike(post.id)}>♡ {post.likeCount}</button>
              <button className={styles.actionBtn} onClick={() => loadComments(post.id)}>💬 {post.commentCount}</button>
            </div>
            {expandedPost === post.id && (
              <div className={styles.commentsSection}>
                {(comments[post.id] || []).map(c => (
                  <div className={styles.commentItem} key={c.id}>
                    <div className={styles.commentContent}>{c.content}</div>
                    <div className={styles.commentTime}>{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
                <div className={styles.commentInput}>
                  <input placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment(post.id)} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
