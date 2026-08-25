import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { InstitutionAnalytics } from '../types/intelligence';
import styles from './Intelligence.module.css';

export function InstitutionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<InstitutionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    intelligenceApi.getInstitutionAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const data = await intelligenceApi.generateInstitutionAnalytics();
      setAnalytics(data);
    } catch {}
    setGenerating(false);
  };

  const deptStats = analytics?.departmentStats ? JSON.parse(analytics.departmentStats as string) : null;
  const skillDemand = analytics?.skillDemand ? JSON.parse(analytics.skillDemand as string) : null;

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading analytics...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Institution Placement Analytics</h1>
          <p className={styles.subtitle}>Deep placement intelligence for your institution</p>
        </div>
        <button className={styles.startBtn} onClick={generate} disabled={generating}>
          {generating ? 'Generating...' : 'Refresh Analytics'}
        </button>
      </div>

      {analytics ? (
        <>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.totalStudents.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Students</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.placementSeeking.toLocaleString()}</div>
              <div className={styles.statLabel}>Placement Seeking</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.placed.toLocaleString()}</div>
              <div className={styles.statLabel}>Placed</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: '#16a34a' }}>{analytics.placementRate}%</div>
              <div className={styles.statLabel}>Placement Rate</div>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>₹{analytics.averagePackage} LPA</div>
              <div className={styles.statLabel}>Average Package</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>₹{analytics.highestPackage} LPA</div>
              <div className={styles.statLabel}>Highest Package</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.companiesVisited}</div>
              <div className={styles.statLabel}>Companies Visited</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.tier1Count + analytics.tier2Count}</div>
              <div className={styles.statLabel}>Total Drives</div>
            </div>
          </div>

          {deptStats && (
            <div className={styles.chartSection}>
              <h3 className={styles.sectionTitle}>Department Performance</h3>
              <div className={styles.deptGrid}>
                {Object.entries(deptStats).map(([dept, rate]: [string, any]) => (
                  <div className={styles.deptCard} key={dept}>
                    <div className={styles.deptName}>{dept}</div>
                    <div className={styles.deptBar}>
                      <div className={styles.deptBarFill} style={{ width: `${rate}%` }} />
                    </div>
                    <div className={styles.deptRate}>{rate}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skillDemand && (
            <div className={styles.chartSection}>
              <h3 className={styles.sectionTitle}>Skill Demand</h3>
              <div className={styles.skillDemandGrid}>
                {Object.entries(skillDemand.topSkills || {}).slice(0, 10).map(([skill, count]: [string, any]) => (
                  <div className={styles.demandItem} key={skill}>
                    <span className={styles.demandSkill}>Skill #{skill.slice(0, 8)}</span>
                    <span className={styles.demandCount}>{count} students</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <p>No analytics data available yet. Generate your first analytics snapshot.</p>
        </div>
      )}
    </div>
  );
}
