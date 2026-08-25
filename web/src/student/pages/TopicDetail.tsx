import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taxonomyApi, studentLearningApi } from '../services/taxonomyApi';
import type { SkillTopic, SkillSubtopic, StudentLearningTopic } from '../types/taxonomy';
import styles from './SkillExplorer.module.css';

export function TopicDetail() {
  const { skillSlug, topicSlug } = useParams<{ skillSlug: string; topicSlug: string }>();
  const [topic, setTopic] = useState<SkillTopic | null>(null);
  const [subtopics, setSubtopics] = useState<SkillSubtopic[]>([]);
  const [learningEntry, setLearningEntry] = useState<StudentLearningTopic | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!skillSlug || !topicSlug) return;
    try {
      setLoading(true);
      const [t, st, lt] = await Promise.all([
        taxonomyApi.getTopic(skillSlug, topicSlug),
        taxonomyApi.getSubtopics(skillSlug, topicSlug),
        studentLearningApi.getTopics().catch(() => []),
      ]);
      setTopic(t);
      setSubtopics(st);
      const existing = lt.find(l => l.topicId === t.id) || null;
      setLearningEntry(existing);
    } catch { /* */ }
    setLoading(false);
  }, [skillSlug, topicSlug]);

  useEffect(() => { load(); }, [load]);

  async function handleStartLearning() {
    if (!topic) return;
    try {
      const entry = await studentLearningApi.addTopic(topic.id);
      setLearningEntry(entry);
    } catch { /* */ }
  }

  async function handleStopLearning() {
    if (!learningEntry) return;
    try {
      await studentLearningApi.removeTopic(learningEntry.id);
      setLearningEntry(null);
    } catch { /* */ }
  }

  async function handleStatusChange(status: string) {
    if (!learningEntry) return;
    try {
      const updated = await studentLearningApi.updateStatus(learningEntry.id, status);
      setLearningEntry(updated);
    } catch { /* */ }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ width: 300, height: 24 }} />
          <div className={styles.skeleton} style={{ width: '100%', height: 48 }} />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Topic not found</p>
          <Link to="/student/skills" className={styles.categoryChip}>Back to Skills</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/student/skills" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
          Skills
        </Link>
        <span style={{ color: 'var(--color-text-muted)', margin: '0 var(--space-sm)' }}>/</span>
        <Link to={`/student/skills/${skillSlug}`} style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
          {skillSlug}
        </Link>
        <span style={{ color: 'var(--color-text-muted)', margin: '0 var(--space-sm)' }}>/</span>
        <span style={{ color: 'var(--color-text)', fontSize: 'var(--text-sm)' }}>{topic.name}</span>
      </nav>

      <div className={styles.pageHeader}>
        <h1 className={styles.title}>{topic.name}</h1>
      </div>

      {topic.description && (
        <div className={styles.skillCard} style={{ cursor: 'default' }}>
          <p className={styles.skillDescription}>{topic.description}</p>
        </div>
      )}

      <div className={styles.skillCard} style={{ cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-semibold)' }}>
              Your Learning Status
            </h3>
            {learningEntry ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>
                  ● {learningEntry.status.replace('_', ' ')}
                </span>
                <select
                  value={learningEntry.status}
                  onChange={e => handleStatusChange(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <option value="LEARNING">Learning</option>
                  <option value="PRACTICING">Practicing</option>
                  <option value="ASSESSMENT_READY">Assessment Ready</option>
                  <option value="MASTERED">Mastered</option>
                </select>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-xs)' }}>
                You haven't started this topic yet
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {learningEntry ? (
              <button className={styles.categoryChip} onClick={handleStopLearning}>
                Stop Learning
              </button>
            ) : (
              <button className={styles.categoryChipActive} style={{ cursor: 'pointer' }} onClick={handleStartLearning}>
                Start Learning
              </button>
            )}
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)', margin: 0 }}>
        Subtopics
      </h2>

      {subtopics.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No subtopics available yet.</p>
        </div>
      ) : (
        <div className={styles.skillsGrid}>
          {subtopics.map(sub => (
            <div key={sub.id} className={styles.skillCard} style={{ cursor: 'default' }}>
              <h3 className={styles.skillName}>{sub.name}</h3>
              {sub.description && <p className={styles.skillDescription}>{sub.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
