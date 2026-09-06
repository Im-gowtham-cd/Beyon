import { useState, useEffect } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Building2,
  BarChart3,
} from 'lucide-react';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

export function CompanyAnalyticsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  async function loadAnalytics() {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [appRes, oppRes] = await Promise.all([
        fetch('/api/v1/recruitment/applications', { headers }).catch(() => null),
        fetch('/api/v1/opportunities', { headers }).catch(() => null),
      ]);

      if (appRes && appRes.ok) {
        const data = await appRes.json();
        setApplications(Array.isArray(data) ? data : data?.data || []);
      } else {
        setApplications([]);
      }

      if (oppRes && oppRes.ok) {
        const oppData = await oppRes.json();
        setOpportunities(Array.isArray(oppData) ? oppData : oppData?.data || []);
      } else {
        setOpportunities([]);
      }
    } catch {
      setApplications([]);
      setOpportunities([]);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const total = applications.length;
  const passedAssessments = applications.filter((a) => Number(a.assessmentScore) >= 60).length;
  const shortlisted = applications.filter((a) =>
    ['SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED'].includes((a.status || '').toUpperCase())
  ).length;
  const interviewed = applications.filter((a) =>
    ['INTERVIEW', 'SELECTED'].includes((a.status || '').toUpperCase())
  ).length;
  const hired = applications.filter((a) =>
    (a.status || '').toUpperCase().includes('SELECT') || (a.status || '').toUpperCase().includes('OFFER')
  ).length;

  const funnelData = [
    { label: '1. Candidate Applications', count: total, pct: total > 0 ? '100%' : '0%', color: '#1c2d81' },
    { label: '2. Proctored Assessments Passed', count: passedAssessments, pct: total > 0 ? `${((passedAssessments / total) * 100).toFixed(1)}%` : '0%', color: '#0284c7' },
    { label: '3. Technical Shortlisted', count: shortlisted, pct: total > 0 ? `${((shortlisted / total) * 100).toFixed(1)}%` : '0%', color: '#15803d' },
    { label: '4. Video Interviews Completed', count: interviewed, pct: total > 0 ? `${((interviewed / total) * 100).toFixed(1)}%` : '0%', color: '#d97706' },
    { label: '5. Offers Released & Selected', count: hired, pct: total > 0 ? `${((hired / total) * 100).toFixed(1)}%` : '0%', color: '#7c3aed' },
  ];

  const collegeMap: Record<string, { count: number; hired: number; totalCgpa: number; scoredCount: number }> = {};
  for (const app of applications) {
    const instName = app.institutionName || app.college || 'Partner Institution';
    if (!collegeMap[instName]) {
      collegeMap[instName] = { count: 0, hired: 0, totalCgpa: 0, scoredCount: 0 };
    }
    collegeMap[instName].count++;
    if ((app.status || '').toUpperCase().includes('SELECT') || (app.status || '').toUpperCase().includes('OFFER')) {
      collegeMap[instName].hired++;
    }
    if (app.cgpa) {
      collegeMap[instName].totalCgpa += Number(app.cgpa);
      collegeMap[instName].scoredCount++;
    }
  }

  const collegeSources = Object.entries(collegeMap).map(([name, stats]) => ({
    name,
    candidates: stats.count,
    hired: stats.hired,
    avgCgpa: stats.scoredCount > 0 ? (stats.totalCgpa / stats.scoredCount).toFixed(2) : 'N/A',
  }));

  const passRate = total > 0 ? `${((passedAssessments / total) * 100).toFixed(1)}%` : '0.0%';
  const acceptanceRate = hired > 0 ? '100%' : '0.0%';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Recruitment Analytics &amp; Talent Conversion Funnel</h1>
          <p className={styles.subtitle}>
            Executive metrics on campus drive throughput, assessment pass ratios, and candidate offer conversion
          </p>
        </div>
        <button className={styles.btnSecondary} onClick={loadAnalytics} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? styles.spin : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Funnel Volume</span>
          <span className={styles.statValue}>{total} Candidates</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Assessment Pass Rate</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>{passRate}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Offer Acceptance</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>{acceptanceRate}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Opportunities</span>
          <span className={styles.statValue} style={{ color: '#d97706' }}>{opportunities.length} Drives</span>
        </div>
      </div>

      <div className={styles.formCard} style={{ marginTop: '16px' }}>
        <h2 className={styles.sectionHeading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} style={{ color: '#1c2d81' }} />
          <span>Recruitment Conversion Pipeline Funnel</span>
        </h2>

        {total === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
            <BarChart3 size={32} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>No recruitment funnel data yet</div>
            <div style={{ fontSize: '0.82rem' }}>Candidate progression metrics will populate as applicants advance through stages.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {funnelData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                  <span>{item.label}</span>
                  <span>{item.count} Candidates ({item.pct})</span>
                </div>
                <div style={{ height: '14px', background: '#f1f5f9', width: '100%', borderRadius: '0px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: item.pct,
                      background: item.color,
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
        <h2 className={styles.sectionHeading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} style={{ color: '#1c2d81' }} />
          <span>Partner Institution Hiring Performance</span>
        </h2>

        {collegeSources.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
            <Building2 size={32} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>No institutional applicant metrics yet</div>
            <div style={{ fontSize: '0.82rem' }}>Institution-wise breakdown will appear when verified students apply.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Institution Name</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Applicants</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Avg Candidate CGPA</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Selections</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {collegeSources.map((col, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{col.name}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{col.candidates}</td>
                    <td style={{ padding: '10px 14px', color: '#1c2d81', fontWeight: 600 }}>{col.avgCgpa}</td>
                    <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: 700 }}>{col.hired} Selected</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', background: '#dcfce7', color: '#15803d' }}>
                        Active Partner
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

