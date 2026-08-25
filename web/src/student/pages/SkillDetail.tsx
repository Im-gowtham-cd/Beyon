import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taxonomyApi, studentLearningApi } from '../services/taxonomyApi';
import type { TaxonomySkill, SkillTopic, StudentLearningTopic } from '../types/taxonomy';
import styles from './SkillExplorer.module.css';

export function SkillDetail() {
  const { skillSlug } = useParams<{ skillSlug: string }>();
  const [skill, setSkill] = useState<TaxonomySkill | null>(null);
  const [topics, setTopics] = useState<SkillTopic[]>([]);
  const [learningTopics, setLearningTopics] = useState<StudentLearningTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!skillSlug) return;
    try {
      setLoading(true);
      const [s, t, lt] = await Promise.all([
        taxonomyApi.getSkill(skillSlug),
        taxonomyApi.getTopics(skillSlug),
        studentLearningApi.getTopics().catch(() => []),
      ]);
      setSkill(s);
      setTopics(t);
      setLearningTopics(lt);
    } catch { /* */ }
    setLoading(false);
  }, [skillSlug]);

  useEffect(() => { load(); }, [load]);

  async function handleAddLearning(topicId: string) {
    try {
      await studentLearningApi.addTopic(topicId);
      const lt = await studentLearningApi.getTopics();
      setLearningTopics(lt);
    } catch { /* */ }
  }

  async function handleRemoveLearning(learningId: string) {
    try {
      await studentLearningApi.removeTopic(learningId);
      setLearningTopics(prev => prev.filter(l => l.id !== learningId));
    } catch { /* */ }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ width: 200, height: 24 }} />
          <div className={styles.skeleton} style={{ width: '100%', height: 48 }} />
          <div className={styles.skeleton} style={{ width: '100%', height: 48 }} />
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Skill not found</p>
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
        <span style={{ color: 'var(--color-text)', fontSize: 'var(--text-sm)' }}>{skill.name}</span>
      </nav>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{skill.name}</h1>
          <span className={styles.skillCategory}>{skill.category}</span>
        </div>
      </div>

      {skill.description && (
        <div className={styles.skillCard} style={{ cursor: 'default' }}>
          <p className={styles.skillDescription}>{skill.description}</p>
        </div>
      )}

      <div className={styles.skillsGrid}>
        {topics.map(topic => {
          const isLearning = learningTopics.some(l => l.topicId === topic.id);
          const learningEntry = learningTopics.find(l => l.topicId === topic.id);

          return (
            <div key={topic.id} className={styles.skillCard} style={{ cursor: 'default' }}>
              <Link
                to={`/student/skills/${skillSlug}/${topic.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <h3 className={styles.skillName}>{topic.name}</h3>
              </Link>
              {topic.description && <p className={styles.skillDescription}>{topic.description}</p>}
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                {isLearning ? (
                  <button
                    className={styles.categoryChipActive}
                    style={{ cursor: 'pointer' }}
                    onClick={() => learningEntry && handleRemoveLearning(learningEntry.id)}
                  >
                    ● Learning
                  </button>
                ) : (
                  <button
                    className={styles.categoryChip}
                    onClick={() => handleAddLearning(topic.id)}
                  >
                    + Start Learning
                  </button>
                )}
                <Link
                  to={`/student/skills/${skillSlug}/${topic.slug}`}
                  className={styles.categoryChip}
                >
                  View →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {topics.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No topics available for this skill yet.</p>
        </div>
      )}
    </div>
  );
}
