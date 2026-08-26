import { useState, useEffect } from 'react';
import { communityApi } from '../services/communityApi';
import type { ContentResource } from '../types/community';
import styles from './Community.module.css';

const RESOURCE_TYPES = ['ARTICLE', 'TUTORIAL', 'VIDEO', 'COURSE', 'BOOK', 'TOOL'];
const TYPE_ICONS: Record<string, string> = { ARTICLE: '📝', TUTORIAL: '📖', VIDEO: '🎬', COURSE: '🎓', BOOK: '📚', TOOL: '🔧' };

export function ResourcesPage() {
  const [resources, setResources] = useState<ContentResource[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => { communityApi.getPublishedResources().then(setResources).catch(() => {}).finally(() => setLoading(false)); }, []);

  const filtered = filter === 'ALL' ? resources : resources.filter(r => r.resourceType === filter);

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading resources...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Learning Resources</h1>
        <p className={styles.subtitle}>Curated articles, tutorials, courses, and tools</p>
      </div>

      <div className={styles.filterRow}>
        <button className={`${styles.filterBtn} ${filter === 'ALL' ? styles.filterActive : ''}`} onClick={() => setFilter('ALL')}>All</button>
        {RESOURCE_TYPES.map(t => (
          <button key={t} className={`${styles.filterBtn} ${filter === t ? styles.filterActive : ''}`} onClick={() => setFilter(t)}>
            {TYPE_ICONS[t]} {t}
          </button>
        ))}
      </div>

      <div className={styles.resourceGrid}>
        {filtered.map(r => (
          <a className={styles.resourceCard} key={r.id} href={r.url} target="_blank" rel="noopener noreferrer">
            <div className={styles.resourceType}>{TYPE_ICONS[r.resourceType]} {r.resourceType}</div>
            <div className={styles.resourceTitle}>{r.title}</div>
            {r.description && <div className={styles.resourceDesc}>{r.description}</div>}
            <div className={styles.resourceMeta}>
              {r.difficulty && <span className={styles.difficultyBadge}>{r.difficulty}</span>}
              {r.isFree && <span className={styles.freeBadge}>Free</span>}
              <span>{r.viewCount} views</span>
              {r.rating && <span>⭐ {r.rating}</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
