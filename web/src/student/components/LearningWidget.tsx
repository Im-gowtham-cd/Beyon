import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentLearningApi, taxonomyApi } from '../services/taxonomyApi';
import type { StudentLearningTopic } from '../types/taxonomy';
import styles from './LearningWidget.module.css';

export function LearningWidget() {
  const [learningTopics, setLearningTopics] = useState<(StudentLearningTopic & { topicName?: string; skillSlug?: string; topicSlug?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const topics = await studentLearningApi.getTopics();
        const enriched = await Promise.all(
          topics.slice(0, 5).map(async (t) => {
            try {
              const allSkills = await taxonomyApi.getSkills({});
              for (const skill of allSkills) {
                const skillTopics = await taxonomyApi.getTopics(skill.slug);
                const found = skillTopics.find(st => st.id === t.topicId);
                if (found) {
                  return { ...t, topicName: found.name, skillSlug: skill.slug, topicSlug: found.slug };
                }
              }
            } catch { /* */ }
            return t;
          })
        );
        setLearningTopics(enriched);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.widget}>
        <div className={styles.skeleton} style={{ width: 160, height: 20 }} />
        <div className={styles.skeleton} style={{ width: '100%', height: 40 }} />
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>Currently Learning</h3>
      {learningTopics.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>You haven't added any learning topics yet.</p>
          <Link to="/student/skills" className={styles.link}>Choose What You're Learning →</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {learningTopics.map(t => (
            <div key={t.id} className={styles.item}>
              <div className={styles.itemInfo}>
                {t.skillSlug && t.topicSlug ? (
                  <Link to={`/student/skills/${t.skillSlug}/${t.topicSlug}`} className={styles.itemName}>
                    {t.topicName || 'Topic'}
                  </Link>
                ) : (
                  <span className={styles.itemName}>{t.topicName || 'Topic'}</span>
                )}
                <span className={styles.itemStatus}>● {t.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
          <Link to="/student/skills" className={styles.viewAll}>View All →</Link>
        </div>
      )}
    </div>
  );
}
