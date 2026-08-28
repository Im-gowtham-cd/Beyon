import { useState } from 'react';
import {
  TrendingUp,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

export function InstitutionAnalyticsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const deptPerformances = [
    { name: 'Computer Science & Engg.', placedPct: 96.2, students: 240, avgSalary: '19.4 LPA' },
    { name: 'AI & Data Science', placedPct: 94.8, students: 120, avgSalary: '21.0 LPA' },
    { name: 'Information Technology', placedPct: 92.5, students: 180, avgSalary: '17.8 LPA' },
    { name: 'Electronics & Comm. Engg.', placedPct: 89.4, students: 210, avgSalary: '16.5 LPA' },
    { name: 'Mechanical & Robotics', placedPct: 84.0, students: 190, avgSalary: '13.2 LPA' },
  ];

  const nirfParameters = [
    { param: 'Teaching, Learning & Resources (TLR)', score: '88.4 / 100', weight: '30%' },
    { param: 'Graduation Outcomes & Placement (GO)', score: '94.2 / 100', weight: '20%' },
    { param: 'Research & Professional Practice (RP)', score: '79.6 / 100', weight: '30%' },
    { param: 'Outreach and Inclusivity (OI)', score: '82.0 / 100', weight: '10%' },
    { param: 'Peer Perception & Corporate Trust (PR)', score: '91.5 / 100', weight: '10%' },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Institutional Placement Intelligence &amp; NIRF Analytics</h1>
          <p className={styles.subtitle}>
            Accreditation metrics, department placement outcomes, salary trends, and recruiter participation analytics
          </p>
        </div>
        <button className={styles.btnSecondary} onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? styles.spin : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh NIRF Intelligence'}</span>
        </button>
      </div>

      {/* 4 Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Placed Rate</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>91.4%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Highest CTC Package</span>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>28.5 LPA</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Median Salary</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>18.2 LPA</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Recruiting Corporates</span>
          <span className={styles.statValue} style={{ color: '#7c3aed' }}>48 Partners</span>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className={styles.formCard} style={{ marginTop: '16px' }}>
        <h2 className={styles.sectionHeading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} style={{ color: '#1c2d81' }} />
          <span>Department Placement Performance &amp; Average Compensation</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {deptPerformances.map((d, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                <span>{d.name} ({d.students} Students)</span>
                <span><strong>{d.placedPct}% Placed</strong> &middot; Avg {d.avgSalary}</span>
              </div>
              <div style={{ height: '12px', background: '#f1f5f9', width: '100%', borderRadius: '0px', overflow: 'hidden' }}>
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
      </div>

      {/* NIRF Scorecard Table */}
      <div className={styles.formCard} style={{ marginTop: '16px' }}>
        <h2 className={styles.sectionHeading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap size={18} style={{ color: '#1c2d81' }} />
          <span>National Institutional Ranking Framework (NIRF) Metric Scorecard</span>
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>NIRF Evaluation Parameter</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Institutional Score</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>NIRF Weightage</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Performance Tier</th>
              </tr>
            </thead>
            <tbody>
              {nirfParameters.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{p.param}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#15803d' }}>{p.score}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{p.weight}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', background: '#dcfce7', color: '#15803d' }}>
                      Top 5% National
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
