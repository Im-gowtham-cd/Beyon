import { useState } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Building2,
} from 'lucide-react';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

export function CompanyAnalyticsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const funnelData = [
    { label: '1. Candidate Applications', count: 148, pct: '100%', color: '#1c2d81' },
    { label: '2. Proctored Assessments Passed', count: 96, pct: '64.8%', color: '#0284c7' },
    { label: '3. Technical Shortlisted', count: 36, pct: '24.3%', color: '#15803d' },
    { label: '4. Video Interviews Completed', count: 24, pct: '16.2%', color: '#d97706' },
    { label: '5. Offers Released & Accepted', count: 18, pct: '12.1%', color: '#7c3aed' },
  ];

  const collegeSources = [
    { name: 'PSG College of Technology', candidates: 42, hired: 6, avgCgpa: '9.15' },
    { name: 'College of Engineering, Guindy (Anna University)', candidates: 38, hired: 5, avgCgpa: '9.22' },
    { name: 'Sri Sivasubramaniya Nadar College of Engineering', candidates: 29, hired: 4, avgCgpa: '8.98' },
    { name: 'Vellore Institute of Technology', candidates: 24, hired: 2, avgCgpa: '8.80' },
    { name: 'Thiagarajar College of Engineering', candidates: 15, hired: 1, avgCgpa: '9.02' },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Recruitment Analytics &amp; Talent Conversion Funnel</h1>
          <p className={styles.subtitle}>
            Executive metrics on campus drive throughput, assessment pass ratios, and candidate offer conversion
          </p>
        </div>
        <button className={styles.btnSecondary} onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? styles.spin : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* 4 Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Funnel Volume</span>
          <span className={styles.statValue}>148 Candidates</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Assessment Pass Rate</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>64.8%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Offer Acceptance</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>92.4%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Time-To-Hire</span>
          <span className={styles.statValue} style={{ color: '#d97706' }}>4.2 Days</span>
        </div>
      </div>

      {/* Funnel Section */}
      <div className={styles.formCard} style={{ marginTop: '16px' }}>
        <h2 className={styles.sectionHeading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} style={{ color: '#1c2d81' }} />
          <span>Recruitment Conversion Pipeline Funnel</span>
        </h2>

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
      </div>

      {/* Institution Source Table */}
      <div className={styles.formCard} style={{ marginTop: '16px' }}>
        <h2 className={styles.sectionHeading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} style={{ color: '#1c2d81' }} />
          <span>Partner Institution Hiring Performance</span>
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Institution Name</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Applicants</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Avg Candidate CGPA</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Offers Released</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>Quality Rating</th>
              </tr>
            </thead>
            <tbody>
              {collegeSources.map((col, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{col.name}</td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{col.candidates}</td>
                  <td style={{ padding: '10px 14px', color: '#1c2d81', fontWeight: 600 }}>{col.avgCgpa}</td>
                  <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: 700 }}>{col.hired} Offers</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', background: '#dcfce7', color: '#15803d' }}>
                      Tier 1 Outstanding
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
