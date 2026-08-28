import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Admin.module.css';

export function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard/overview').then(setOverview).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading admin dashboard...</div></div>;
  if (!overview) return <div className={styles.container}><div className={styles.empty}>Unable to load dashboard.</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Platform overview and management</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{overview.totalUsers || 0}</div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{overview.activeUsers || 0}</div>
          <div className={styles.statLabel}>Active Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{overview.newRegistrations || 0}</div>
          <div className={styles.statLabel}>New Registrations</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{overview.totalAssessments || 0}</div>
          <div className={styles.statLabel}>Total Assessments</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{overview.totalApplications || 0}</div>
          <div className={styles.statLabel}>Applications</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{overview.totalPlacements || 0}</div>
          <div className={styles.statLabel}>Placements</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{overview.activeCompanies || 0}</div>
          <div className={styles.statLabel}>Active Companies</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{overview.activeInstitutions || 0}</div>
          <div className={styles.statLabel}>Active Institutions</div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Coin Economy</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{overview.totalCoinsEarned || 0}</div>
            <div className={styles.statLabel}>Coins Earned</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{overview.totalCoinsSpent || 0}</div>
            <div className={styles.statLabel}>Coins Spent</div>
          </div>
        </div>
      </div>
    </div>
  );
}
