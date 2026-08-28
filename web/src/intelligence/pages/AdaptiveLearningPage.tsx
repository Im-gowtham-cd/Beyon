import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { CareerPath, AdaptiveLearningStep } from '../types/intelligence';
import styles from './CareerIntel.module.css';

export function AdaptiveLearningPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [activePath, setActivePath] = useState<any>(null);
  const [myPaths, setMyPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      intelligenceApi.getAllCareerPaths(),
      intelligenceApi.getMyAdaptivePaths()
    ]).then(([cps, mp]) => {
      setPaths(cps);
      setMyPaths(mp);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const startPath = async (careerPathId: string) => {
    const result = await intelligenceApi.getOrCreateAdaptivePath(careerPathId);
    setActivePath(result);
    const mp = await intelligenceApi.getMyAdaptivePaths();
    setMyPaths(mp);
  };

  const completeStep = async (stepId: string) => {
    await intelligenceApi.completeAdaptiveStep(stepId);
    if (activePath) {
      const careerPathId = activePath.path?.careerPathId;
      if (careerPathId) {
        const result = await intelligenceApi.getOrCreateAdaptivePath(careerPathId);
        setActivePath(result);
      }
    }
  };

  if (loading) return <div className={styles.container}><div className={styles.loading}><div className={styles.loadingSpinner} /> Loading...</div></div>;

  if (activePath) {
    const path = activePath.path;
    const steps: AdaptiveLearningStep[] = activePath.steps || [];
    const progress = Number(path?.overallProgress || 0);

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{activePath.careerPathName || 'Learning Path'}</h1>
          <p className={styles.subtitle}>Your adaptive learning roadmap</p>
        </div>

        <button className={styles.btnSecondary} onClick={() => setActivePath(null)} style={{ marginBottom: '1.5rem' }}>← Back</button>

        <div className={styles.adaptivePath}>
          <div className={styles.adaptiveProgress}>
            <div className={styles.adaptiveProgressPct}>{Math.round(progress)}%</div>
            <div className={styles.adaptiveProgressBar}>
              <div className={styles.adaptiveProgressFill} style={{ width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              {activePath.completedSteps}/{activePath.totalSteps} steps completed
            </span>
          </div>

          <div className={styles.stepList}>
            {steps.map(step => (
              <div key={step.id} className={`${styles.stepItem} ${
                step.state === 'COMPLETED' ? styles.stepCompleted :
                step.state === 'IN_PROGRESS' ? styles.stepInProgress :
                styles.stepLocked
              }`}>
                <div className={styles.stepIcon}>
                  {step.state === 'COMPLETED' ? (
                    <i className="bx bx-check-circle" style={{ color: '#10b981', fontSize: '1.2rem' }} />
                  ) : step.state === 'IN_PROGRESS' ? (
                    <i className="bx bx-book-open" style={{ color: '#1c2d81', fontSize: '1.2rem' }} />
                  ) : (
                    <i className="bx bx-lock" style={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                  )}
                </div>
                <div className={styles.stepInfo}>
                  <div className={styles.stepName}>{step.skillName}</div>
                  <div className={styles.stepConcept}>{step.concept}</div>
                </div>
                <span className={`${styles.stepState} ${
                  step.state === 'COMPLETED' ? styles.stepCompleteBadge :
                  step.state === 'IN_PROGRESS' ? styles.stepInProgressBadge :
                  styles.stepLockedBadge
                }`}>{step.state.replace('_', ' ')}</span>
                {step.state === 'IN_PROGRESS' && (
                  <button className={styles.btnPrimary} onClick={() => completeStep(step.id)} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                    Mark Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Adaptive Learning</h1>
        <p className={styles.subtitle}>Personalized learning paths that adapt to your skill level</p>
      </div>

      {myPaths.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0a0f', marginBottom: '1rem' }}>My Active Paths</h3>
          <div className={styles.graphContainer}>
            {myPaths.map((mp: any) => (
              <div className={styles.graphCard} key={mp.id} style={{ cursor: 'pointer' }} onClick={() => startPath(mp.careerPathId)}>
                <div style={{ fontWeight: 600, color: '#0a0a0f', marginBottom: '0.5rem' }}>Path</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Progress: {Math.round(mp.overallProgress || 0)}%</div>
                <div className={styles.graphBar} style={{ marginTop: '0.5rem' }}>
                  <div className={styles.graphBarFill} style={{ width: `${mp.overallProgress || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0a0f', marginBottom: '1rem' }}>Start a New Learning Path</h3>
      <div className={styles.graphContainer}>
        {paths.map(p => (
          <div className={styles.graphCard} key={p.id} style={{ cursor: 'pointer' }} onClick={() => startPath(p.id)}>
            <div style={{ fontWeight: 600, color: '#0a0a0f', marginBottom: '0.25rem' }}>{p.name}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>{p.description}</div>
            <div style={{ fontSize: '0.8rem', color: '#6366f1' }}>Start learning →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
