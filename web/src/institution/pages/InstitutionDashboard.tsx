import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { institutionApi } from '../services/institutionApi';
import type { InstitutionStudent, InstitutionRating } from '../types/institution';
import styles from './InstitutionPages.module.css';

export function InstitutionDashboard() {
  const [students, setStudents] = useState<InstitutionStudent[]>([]);
  const [rating, setRating] = useState<InstitutionRating | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {        const [s, r] = await Promise.all([
          institutionApi.getStudents(),
          institutionApi.getRating().catch(() => null),
        ]);
        setStudents(s);
        setRating(r);

      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className={styles.page}><div className={styles.skeleton} style={{ height: 200 }} /></div>;
  }

  const placed = students.filter(s => s.placementStatus === 'PLACED').length;
  const seeking = students.filter(s => s.placementStatus === 'PLACEMENT_SEEKING').length;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Institution Dashboard</h1>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Students</span>
          <span className={styles.statValue}>{students.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Placement Seeking</span>
          <span className={styles.statValue} style={{ color: 'var(--color-secondary)' }}>{seeking}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Placed</span>
          <span className={styles.statValue} style={{ color: 'var(--color-primary)' }}>{placed}</span>
        </div>
        {rating?.overallRating && (
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Rating</span>
            <span className={styles.statValue}>{rating.overallRating}/5</span>
          </div>
        )}
      </div>

      <div className={styles.grid2}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.actionList}>
            <Link to="/institution/students" className={styles.actionItem}>Manage Students →</Link>
            <Link to="/institution/drives" className={styles.actionItem}>Placement Drives →</Link>
            <button className={styles.actionItem} onClick={() => institutionApi.calculateRating().then(setRating)}>
              Calculate Rating →
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Students</h3>
          {students.slice(0, 5).map(s => (
            <div key={s.id} className={styles.listItem}>
              <span>{s.department || 'Student'}</span>
              <span className={styles.badge} data-status={s.placementStatus}>
                {s.placementStatus.replace('_', ' ')}
              </span>
            </div>
          ))}
          {students.length === 0 && <p className={styles.emptyText}>No students linked yet</p>}
        </div>
      </div>
    </div>
  );
}
