import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { CareerPath, CareerPathSkill, CareerReadiness } from '../types/intelligence';
import styles from './Intelligence.module.css';

export function CareerPathsPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [readiness, setReadiness] = useState<CareerReadiness | null>(null);
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { intelligenceApi.getAllCareerPaths().then(setPaths).catch(() => {}).finally(() => setLoading(false)); }, []);

  const selectPath = async (path: CareerPath) => {
    const detail = await intelligenceApi.getCareerPathDetail(path.id);
    setSelectedPath(detail);
    try {
      const r = await intelligenceApi.getCareerReadiness(path.id);
      setReadiness(r);
    } catch { setReadiness(null); }
    try {
      const g = await intelligenceApi.getSkillGaps(path.id);
      setGaps(g);
    } catch { setGaps([]); }
  };

  const startPath = async (pathId: string) => {
    await intelligenceApi.startCareerPath(pathId);
    const detail = await intelligenceApi.getCareerPathDetail(pathId);
    setSelectedPath(detail);
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading career paths...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Career Paths</h1>
        <p className={styles.subtitle}>Discover your personalized career roadmap</p>
      </div>

      {!selectedPath ? (
        <div className={styles.pathGrid}>
          {paths.map(p => (
            <div className={styles.pathCard} key={p.id} onClick={() => selectPath(p)}>
              <div className={styles.pathName}>{p.name}</div>
              <div className={styles.pathCategory}>{p.category}</div>
              <div className={styles.pathDesc}>{p.description}</div>
              <div className={styles.pathMeta}>
                {p.salaryRange && <span>💰 {p.salaryRange}</span>}
                {p.growthOutlook && <span>📈 {p.growthOutlook}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button className={styles.backBtn} onClick={() => { setSelectedPath(null); setReadiness(null); }}>← Back to paths</button>
          <div className={styles.pathDetail}>
            <h2 className={styles.pathDetailName}>{selectedPath.careerPath?.name}</h2>
            <p className={styles.pathDetailDesc}>{selectedPath.careerPath?.description}</p>

            {readiness && (
              <div className={styles.readinessCard}>
                <div className={styles.readinessScore}>{readiness.readinessScore}%</div>
                <div className={styles.readinessLabel}>Career Readiness</div>
                <div className={styles.readinessMeta}>{readiness.skillsAcquired}/{readiness.skillsTotal} skills acquired</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${readiness.readinessScore}%` }} />
                </div>
              </div>
            )}

            <h3 className={styles.sectionTitle}>Required Skills</h3>
            <div className={styles.skillList}>
              {(selectedPath.skills as CareerPathSkill[]).map((s: any) => (
                <div className={`${styles.skillItem} ${s.acquired ? styles.skillAcquired : styles.skillMissing}`} key={s.skillId}>
                  <span className={styles.skillItemIcon}>{s.acquired ? '✓' : '○'}</span>
                  <span className={styles.skillItemName}>{s.skillName}</span>
                  <span className={styles.skillItemLevel}>{s.currentLevel} → {s.requiredLevel}</span>
                </div>
              ))}
            </div>

            {gaps.length > 0 && (
              <>
                <h3 className={styles.sectionTitle}>Skill Gaps to Address</h3>
                <div className={styles.gapList}>
                  {gaps.filter((g: any) => g.gapSeverity !== 'NONE').map((g: any) => (
                    <div className={styles.gapItem} key={g.skillId}>
                      <span className={`${styles.severityBadge} ${styles[`sev${g.gapSeverity}`]}`}>{g.gapSeverity}</span>
                      <span>Current: {g.currentLevel} → Required: {g.requiredLevel}</span>
                      <span className={styles.gapHours}>~{g.estimatedEffortHours}h</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button className={styles.startBtn} onClick={() => startPath(selectedPath.careerPath.id)}>Start This Path</button>
          </div>
        </div>
      )}
    </div>
  );
}
