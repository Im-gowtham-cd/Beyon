import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Intelligence.module.css';

const POST_TYPES: Record<string, { icon: string; label: string }> = {
  OPPORTUNITY: { icon: '💼', label: 'Opportunity' },
  WORKSHOP: { icon: '🎓', label: 'Workshop' },
  CHALLENGE: { icon: '🏆', label: 'Challenge' },
  MENTORSHIP: { icon: '🤝', label: 'Mentorship' },
  NEWS: { icon: '📰', label: 'News' },
  UPDATE: { icon: '📢', label: 'Update' },
};

export function EntityFeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/entity-posts/feed').then(setPosts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading feed...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Company & Institution Feed</h1>
        <p className={styles.subtitle}>Updates from companies and institutions you follow</p>
      </div>

      {posts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>No posts yet</div>
          <div className={styles.emptyDesc}>Follow companies and institutions to see their updates here.</div>
        </div>
      ) : (
        <div className={styles.postList}>
          {posts.map(post => {
            const typeInfo = POST_TYPES[post.postType] || { icon: '📌', label: post.postType };
            return (
              <div className={styles.postCard} key={post.id}>
                <div className={styles.postHeader}>
                  <span className={styles.postType}>{typeInfo.icon} {typeInfo.label}</span>
                  <span className={styles.postTime}>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                {post.title && <div className={styles.postTitle}>{post.title}</div>}
                <div className={styles.postContent}>{post.content}</div>
                <div className={styles.postActions}>
                  <span>♡ {post.likeCount}</span>
                  <span>💬 {post.commentCount}</span>
                  {post.actionUrl && <a href={post.actionUrl} className={styles.postLink}>Learn More →</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
