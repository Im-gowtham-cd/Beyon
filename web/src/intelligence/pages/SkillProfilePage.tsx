import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { SkillIntelligence } from '../types/intelligence';
import styles from './Intelligence.module.css';

export function SkillProfilePage() {
  const [skills, setSkills] = useState<SkillIntelligence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { intelligenceApi.getMySkillProfile().then(setSkills).catch(() => {}).finally(() => setLoading(false)); }, []);

  const levelColor: Record<string, string> = {
    EXPERT: '#16a34a', ADVANCED: '#2563eb', INTERMEDIATE: '#ca8a04', ELEMENTARY: '#ea580c', BEGINNER: '#6b7280'
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading skill profile...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Skill Intelligence</h1>
        <p className={styles.subtitle}>Your unified skill profile across practice, assessments, projects, and certifications</p>
      </div>

      {skills.length === 0 ? (
        <div className={styles.empty}><p>Start practicing or take assessments to build your skill profile.</p></div>
      ) : (
        <div className={styles.skillGrid}>
          {skills.map(s => (
            <div className={styles.skillCard} key={s.id}>
              <div className={styles.skillHeader}>
                <span className={styles.skillName}>{s.skillName || 'Skill'}</span>
                <span className={styles.levelBadge} style={{ background: levelColor[s.proficiencyLevel] || '#6b7280' }}>
                  {s.proficiencyLevel}
                </span>
              </div>
              <div className={styles.skillStats}>
                <div className={styles.stat}><span className={styles.statLabel}>Confidence</span><span className={styles.statValue}>{s.confidenceScore}%</span></div>
                <div className={styles.stat}><span className={styles.statLabel}>Accuracy</span><span className={styles.statValue}>{s.accuracy}%</span></div>
                <div className={styles.stat}><span className={styles.statLabel}>Solved</span><span className={styles.statValue}>{s.totalQuestionsSolved}</span></div>
                <div className={styles.stat}><span className={styles.statLabel}>Assessments</span><span className={styles.statValue}>{s.assessmentCount}</span></div>
              </div>
              <div className={styles.evidenceRow}>
                {s.certificationCount > 0 && <span className={styles.evidenceTag}>✓ Certification</span>}
                {s.projectCount > 0 && <span className={styles.evidenceTag}>✓ Projects ({s.projectCount})</span>}
                {s.assessmentCount > 0 && <span className={styles.evidenceTag}>✓ Assessments ({s.assessmentCount})</span>}
              </div>
              <div className={styles.trendRow}>
                <span className={styles.trendLabel}>Trend: {s.improvementTrend}</span>
                {s.verified && <span className={styles.verifiedBadge}>✓ Verified</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
