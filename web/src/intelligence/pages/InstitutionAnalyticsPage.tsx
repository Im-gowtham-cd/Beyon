import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  GraduationCap,
  RefreshCw,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { institutionApi } from '../../institution/services/institutionApi';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

export function InstitutionAnalyticsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [rating, setRating] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      const [studentsRes, metricsRes, drivesRes, ratingRes] = await Promise.all([
        institutionApi.getStudents().catch(() => []),
        institutionApi.getMetrics().catch(() => null),
        institutionApi.getDrives().catch(() => []),
        institutionApi.getRating().catch(() => null),
      ]);

      setStudents(Array.isArray(studentsRes) ? studentsRes : (studentsRes as any)?.data || []);
      setMetrics(metricsRes && (metricsRes as any).data !== undefined ? (metricsRes as any).data : metricsRes);
      setDrives(Array.isArray(drivesRes) ? drivesRes : (drivesRes as any)?.data || []);
      setRating(ratingRes && (ratingRes as any).data !== undefined ? (ratingRes as any).data : ratingRes);
    } catch {

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
  };

  const totalStudents = metrics?.totalStudents !== undefined ? metrics.totalStudents : students.length;
  const placedStudents = students.filter(
    (s) => s.placementStatus === 'PLACED' || s.placementStatus === 'OFFERED'
  );
  const placedCount = metrics?.studentsPlaced !== undefined ? metrics.studentsPlaced : placedStudents.length;
  const placedRate = totalStudents > 0 ? ((placedCount / totalStudents) * 100).toFixed(1) + '%' : null;

  const placedPackages = placedStudents
    .map((s) => Number(s.packageLpa || s.ctcLpa))
    .filter((p) => !isNaN(p) && p > 0);
  const highestPkg = placedPackages.length > 0 ? Math.max(...placedPackages).toFixed(1) + ' LPA' : null;
  const avgPkg =
    placedPackages.length > 0
      ? (placedPackages.reduce((a, b) => a + b, 0) / placedPackages.length).toFixed(1) + ' LPA'
      : null;
  const recruitingCorporates = drives.length > 0 ? `${drives.length} Partners` : null;

  const deptMap = new Map<string, { count: number; placed: number; totalPkg: number; pkgCount: number }>();
  students.forEach((s) => {
    const d = s.department || 'Unassigned Department';
    const entry = deptMap.get(d) || { count: 0, placed: 0, totalPkg: 0, pkgCount: 0 };
    entry.count += 1;
    if (s.placementStatus === 'PLACED' || s.placementStatus === 'OFFERED') {
      entry.placed += 1;
      const p = Number(s.packageLpa || s.ctcLpa);
      if (!isNaN(p) && p > 0) {
        entry.totalPkg += p;
        entry.pkgCount += 1;
      }
    }
    deptMap.set(d, entry);
  });

  const deptPerformances = Array.from(deptMap.entries()).map(([name, data]) => {
    const placedPct = data.count > 0 ? Number(((data.placed / data.count) * 100).toFixed(1)) : 0;
    const avgSalary = data.pkgCount > 0 ? `${(data.totalPkg / data.pkgCount).toFixed(1)} LPA` : 'Pending Data';
    return {
      name,
      students: data.count,
      placedPct,
      avgSalary,
    };
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Institutional Placement Intelligence &amp; NIRF Analytics</h1>
          <p className={styles.subtitle}>
            Accreditation metrics, department placement outcomes, salary trends, and recruiter participation analytics
          </p>
        </div>
        <button
          className={styles.btnSecondary}
          onClick={handleRefresh}
          disabled={refreshing || loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={refreshing ? styles.spin : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh NIRF Intelligence'}</span>
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Placed Rate</span>
          <span className={styles.statValue} style={{ color: placedRate ? '#15803d' : '#64748b' }}>
            {placedRate || 'No data available'}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Highest CTC Package</span>
          <span className={styles.statValue} style={{ color: highestPkg ? '#1c2d81' : '#64748b' }}>
            {highestPkg || 'No data available'}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Median Salary</span>
          <span className={styles.statValue} style={{ color: avgPkg ? '#0284c7' : '#64748b' }}>
            {avgPkg || 'No data available'}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Recruiting Corporates</span>
          <span className={styles.statValue} style={{ color: recruitingCorporates ? '#7c3aed' : '#64748b' }}>
            {recruitingCorporates || '0 Partners'}
          </span>
        </div>
      </div>

      <div className={styles.formCard} style={{ marginTop: '16px' }}>
        <h2
          className={styles.sectionHeading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <TrendingUp size={18} style={{ color: '#1c2d81' }} />
          <span>Department Placement Performance &amp; Average Compensation</span>
        </h2>

        {deptPerformances.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.86rem' }}>
            <Building2 size={32} style={{ color: '#94a3b8', margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
              No department placement data available yet
            </div>
            <div>
              Department statistics will formulate automatically as student profiles are verified and placement offers are recorded.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {deptPerformances.map((d, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    color: '#0f172a',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {d.name} <span style={{ color: '#64748b', fontWeight: 400 }}>({d.students} Students)</span>
                  </span>
                  <span>
                    <strong style={{ color: d.placedPct > 0 ? '#15803d' : '#64748b' }}>
                      {d.placedPct}% Placed
                    </strong>{' '}
                    &middot; <span style={{ color: '#64748b' }}>Avg {d.avgSalary}</span>
                  </span>
                </div>
                <div
                  style={{
                    height: '12px',
                    background: '#f1f5f9',
                    width: '100%',
                    borderRadius: '0px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${d.placedPct}%`,
                      background: '#1c2d81',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.formCard} style={{ marginTop: '16px' }}>
        <h2
          className={styles.sectionHeading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <GraduationCap size={18} style={{ color: '#1c2d81' }} />
          <span>National Institutional Ranking Framework (NIRF) Metric Scorecard</span>
        </h2>

        {rating?.parameters && rating.parameters.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>
                    NIRF Evaluation Parameter
                  </th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>
                    Institutional Score
                  </th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>
                    NIRF Weightage
                  </th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>
                    Performance Tier
                  </th>
                </tr>
              </thead>
              <tbody>
                {rating.parameters.map((p: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{p.param || p.name}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#15803d' }}>{p.score}</td>
                    <td style={{ padding: '10px 14px', color: '#64748b', fontWeight: 400 }}>{p.weight || p.weightage}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '0px',
                          background: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        {p.tier || 'Verified Tier'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.86rem' }}>
            <AlertCircle size={32} style={{ color: '#94a3b8', margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
              Insufficient data for NIRF accreditation scoring
            </div>
            <div>
              Institutional NIRF parameters require verified cohort graduation rates, student diversity data, and authorized campus placement outcomes.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

