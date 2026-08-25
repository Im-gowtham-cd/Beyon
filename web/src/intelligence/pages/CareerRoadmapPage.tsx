import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Intelligence.module.css';

const STATE_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  LOCKED: { icon: '🔒', color: '#9ca3af', bg: '#f3f4f6', label: 'Locked' },
  AVAILABLE: { icon: '🟢', color: '#059669', bg: '#ecfdf5', label: 'Available' },
  IN_PROGRESS: { icon: '🔵', color: '#2563eb', bg: '#eff6ff', label: 'In Progress' },
  COMPLETED: { icon: '✅', color: '#16a34a', bg: '#f0fdf4', label: 'Completed' },
};

export function CareerRoadmapPage() {
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/career-paths').then(setCareerPaths).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadRoadmap = async (pathId: string) => {
    setSelectedPath(pathId);
    try {      setRoadmap(await api.get<any[]>(`/roadmap/${pathId}`)); }
    catch { setRoadmap([]); }
  };

  const generateRoadmap = async (pathId: string) => {
    try {
      const items = await api.post<any[]>(`/roadmap/${pathId}/generate`);
      setRoadmap(items);
      setSelectedPath(pathId);
    } catch {}
  };

  const startItem = async (itemId: string) => {
    try { await api.post(`/roadmap/${itemId}/start`); loadRoadmap(selectedPath!); } catch {}
  };

  const completeItem = async (itemId: string) => {
    try { await api.post(`/roadmap/${itemId}/complete`); loadRoadmap(selectedPath!); } catch {}
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading career paths...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Career Roadmap</h1>
        <p className={styles.subtitle}>Your personalized path from current skills to career goal</p>
      </div>

      {!selectedPath ? (
        <div className={styles.pathGrid}>
          {careerPaths.map((cp: any) => (
            <div className={styles.pathCard} key={cp.id} onClick={() => loadRoadmap(cp.id)}>
              <div className={styles.pathTitle}>{cp.title || cp.name}</div>
              {cp.description && <div className={styles.pathDesc}>{cp.description}</div>}
              <button className={styles.createBtn} onClick={(e) => { e.stopPropagation(); generateRoadmap(cp.id); }}>
                Generate Roadmap
              </button>
            </div>
          ))}
          {careerPaths.length === 0 && <div className={styles.empty}>No career paths available yet.</div>}
        </div>
      ) : (
        <div>
          <button className={styles.backBtn} onClick={() => setSelectedPath(null)}>← Back to Career Paths</button>

          {roadmap.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>No roadmap items</div>
              <div className={styles.emptyDesc}>Generate a roadmap to see your learning path.</div>
              <button className={styles.createBtn} onClick={() => generateRoadmap(selectedPath)}>Generate Roadmap</button>
            </div>
          ) : (
            <div className={styles.roadmapTimeline}>
              {roadmap.map((item: any) => {
                const cfg = STATE_CONFIG[item.state] || STATE_CONFIG.LOCKED;
                return (
                  <div className={styles.roadmapItem} key={item.id} style={{ borderLeftColor: cfg.color }}>
                    <div className={styles.roadmapIcon}>{cfg.icon}</div>
                    <div className={styles.roadmapContent}>
                      <div className={styles.roadmapHeader}>
                        <span className={styles.roadmapSkill}>{item.skillName}</span>
                        <span className={styles.roadmapState} style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                      </div>
                      {item.requiredCoins > 0 && <div className={styles.roadmapCoins}>🪙 {item.requiredCoins} coins</div>}
                      <div className={styles.roadmapProgress}>
                        <div className={styles.skillBarTrack}>
                          <div className={styles.skillBarFill} style={{ width: `${item.progress}%`, background: cfg.color }} />
                        </div>
                        <span className={styles.roadmapPercent}>{Math.round(item.progress)}%</span>
                      </div>
                      {item.state === 'AVAILABLE' && (
                        <button className={styles.createBtn} onClick={() => startItem(item.id)} style={{ marginTop: '0.5rem' }}>Start Learning</button>
                      )}
                      {item.state === 'IN_PROGRESS' && (
                        <button className={styles.createBtn} onClick={() => completeItem(item.id)} style={{ marginTop: '0.5rem', background: '#16a34a' }}>Mark Complete</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
