import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { LearningProgram, LearningProgramEnrollment } from '../types/intelligence';
import styles from '../../practice/pages/Gamification.module.css';

export function LearningProgramsPage() {
  const [programs, setPrograms] = useState<LearningProgram[]>([]);
  const [enrollments, setEnrollments] = useState<LearningProgramEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'browse' | 'enrolled'>('browse');

  useEffect(() => {
    async function load() {
      try {
        const [p, e] = await Promise.all([
          intelligenceApi.getLearningPrograms(),
          intelligenceApi.getMyEnrollments(),
        ]);
        setPrograms(p);
        setEnrollments(e);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleEnroll(programId: string) {
    try {
      const enrollment = await intelligenceApi.enrollProgram(programId);
      setEnrollments(prev => [...prev, enrollment]);
    } catch { /* */ }
  }

  const enrolledIds = new Set(enrollments.map(e => e.programId));

  function getDifficultyColor(d: string) {
    const map: Record<string, string> = {
      BEGINNER: 'rgba(99, 179, 237, 0.15)',
      INTERMEDIATE: 'rgba(72, 187, 120, 0.15)',
      ADVANCED: 'rgba(225, 251, 21, 0.15)',
      EXPERT: 'rgba(159, 122, 234, 0.15)',
    };
    return map[d] || 'rgba(99, 179, 237, 0.15)';
  }

  function getDifficultyTextColor(d: string) {
    const map: Record<string, string> = {
      BEGINNER: '#63b3ed',
      INTERMEDIATE: '#48bb78',
      ADVANCED: 'var(--color-primary)',
      EXPERT: '#9f7aea',
    };
    return map[d] || '#63b3ed';
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 100 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Learning Programs</h1>
          <p className={styles.subtitle}>Structured learning paths from companies and institutions</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'browse' ? styles.tabActive : ''}`} onClick={() => setTab('browse')}>Browse</button>
        <button className={`${styles.tab} ${tab === 'enrolled' ? styles.tabActive : ''}`} onClick={() => setTab('enrolled')}>
          My Enrollments ({enrollments.length})
        </button>
      </div>

      {tab === 'browse' && (
        programs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <h3 className={styles.emptyTitle}>No programs available</h3>
            <p className={styles.emptyText}>Learning programs will appear here once created by companies or institutions.</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {programs.map(p => (
              <div key={p.id} className={styles.programCard}>
                <div className={styles.programCardHeader}>
                  <div>
                    <h3 className={styles.programTitle}>{p.title}</h3>
                    <span className={styles.programDifficulty} style={{ background: getDifficultyColor(p.difficulty), color: getDifficultyTextColor(p.difficulty) }}>
                      {p.difficulty}
                    </span>
                  </div>
                  {!enrolledIds.has(p.id) ? (
                    <button className={styles.feedActionBtn} onClick={() => handleEnroll(p.id)}>Enroll</button>
                  ) : (
                    <span className={styles.testBadge}>Enrolled</span>
                  )}
                </div>
                {p.description && <p className={styles.programDescription}>{p.description}</p>}
                <div className={styles.programMeta}>
                  <span>⏱ {p.durationHours}h</span>
                  {p.moduleCount != null && <span>📖 {p.moduleCount} modules</span>}
                  <span>💰 {p.coinReward} coins</span>
                  <span>⚡ {p.xpReward} XP</span>
                  {p.certificateProvided && <span>🎓 Certificate</span>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'enrolled' && (
        enrollments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📖</div>
            <h3 className={styles.emptyTitle}>No enrollments yet</h3>
            <p className={styles.emptyText}>Enroll in a learning program to start your journey.</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {enrollments.map(e => {
              const program = programs.find(p => p.id === e.programId);
              return (
                <div key={e.id} className={styles.programCard}>
                  <div className={styles.programCardHeader}>
                    <h3 className={styles.programTitle}>{program?.title || 'Learning Program'}</h3>
                    <span className={styles.testBadge}>{e.status}</span>
                  </div>
                  <div className={styles.programProgress}>
                    <div className={styles.programProgressFill} style={{ width: `${e.progressPercent}%` }} />
                  </div>
                  <div className={styles.programMeta}>
                    <span>{e.progressPercent}% complete</span>
                    <span>Enrolled {new Date(e.enrolledAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
