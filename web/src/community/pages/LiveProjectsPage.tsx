import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Collaboration.module.css';

interface Project {
  id: string;
  title: string;
  description?: string;
  requiredSkills?: string;
  difficulty: string;
  durationWeeks: number;
  maxParticipants: number;
  currentParticipants: number;
  coinReward: number;
  xpReward: number;
  status: string;
}

export function LiveProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const p = await api.get<Project[]>('/projects');
        setProjects(p);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleApply(projectId: string) {
    try {
      await api.post(`/projects/${projectId}/apply`, { coverLetter: 'I am interested in this project.' });
    } catch { /* */ }
  }

  const diffColors: Record<string, string> = {
    EASY: 'var(--color-secondary)',
    MEDIUM: 'var(--color-warning)',
    HARD: 'var(--color-error)',
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2].map(i => <div key={i} className={styles.skeleton} style={{ height: 120 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Live Industry Projects</h1>
      </div>

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><i className="bx bx-layer" style={{ fontSize: '2.5rem', color: '#1c2d81' }} /></div>
          <h3 className={styles.emptyTitle}>No projects available</h3>
          <p className={styles.emptyText}>Companies post practical projects for students to work on.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {projects.map(p => (
            <div key={p.id} className={styles.postCard}>
              <div className={styles.postHeader}>
                <div>
                  <h3 className={styles.postTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bx bx-briefcase-alt-2" style={{ color: '#1c2d81' }} />
                    <span>{p.title}</span>
                  </h3>
                  <span className={styles.postMeta}>
                    <span style={{ color: diffColors[p.difficulty] || 'var(--color-text)' }}>{p.difficulty}</span>
                    {' · '}{p.durationWeeks} weeks
                  </span>
                </div>
                <span className={styles.tagBadge}>{p.currentParticipants}/{p.maxParticipants} spots</span>
              </div>
              {p.description && <p className={styles.postContent}>{p.description}</p>}
              <div className={styles.postMeta}>
                {p.coinReward > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bx bx-coin-stack" /> {p.coinReward} coins</span>}
                {p.xpReward > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bx bx-bolt" /> {p.xpReward} XP</span>}
              </div>
              {p.requiredSkills && (
                <div className={styles.tagsRow}>
                  {p.requiredSkills.split(',').map(s => (
                    <span key={s.trim()} className={styles.tagBadge}>{s.trim()}</span>
                  ))}
                </div>
              )}
              {p.status === 'PUBLISHED' && p.currentParticipants < p.maxParticipants && (
                <button className={styles.followBtn} onClick={() => handleApply(p.id)}>Apply</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
