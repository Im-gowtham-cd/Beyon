import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { intelligenceApi } from '../services/intelligenceApi';
import styles from './CareerIntel.module.css';

export function CareerIntelligenceDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    intelligenceApi.getCareerDashboard().then(setDashboard).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.container}><div className={styles.loading}><div className={styles.loadingSpinner} /> Loading dashboard...</div></div>;
  if (!dashboard) return <div className={styles.container}><div className={styles.empty}>Unable to load dashboard.</div></div>;

  const avgProf = Math.round(dashboard.averageProficiency || 0);
  const skillCount = dashboard.skillCount || 0;
  const verifiedCount = dashboard.verifiedSkills || 0;
  const weakSkills = dashboard.weakSkills?.weakestSkills || [];
  const strengths = dashboard.strengths?.strengths || [];
  const portfolio = dashboard.portfolio?.analysis || null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Career Intelligence</h1>
        <p className={styles.subtitle}>Your comprehensive career readiness overview</p>
      </div>

      <div className={styles.dashGrid}>
        <div className={styles.dashCard}>
          <div className={styles.dashValue}>{skillCount}</div>
          <div className={styles.dashLabel}>Skills in Graph</div>
        </div>
        <div className={styles.dashCard}>
          <div className={styles.dashValue}>{avgProf}%</div>
          <div className={styles.dashLabel}>Average Proficiency</div>
        </div>
        <div className={styles.dashCard}>
          <div className={styles.dashValue}>{verifiedCount}</div>
          <div className={styles.dashLabel}>Verified Skills</div>
        </div>
        <div className={styles.dashCard}>
          <div className={styles.dashValue}>{portfolio?.overallScore ? Math.round(portfolio.overallScore) : 0}%</div>
          <div className={styles.dashLabel}>Portfolio Strength</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Strengths */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>💪 Top Strengths</div>
          {strengths.length > 0 ? strengths.slice(0, 5).map((s: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' }}>
              <span style={{ color: '#0a0a0f' }}>{s.skillName}</span>
              <span className={styles.graphLevel} style={{ background: '#16a34a', fontSize: '0.7rem' }}>{s.level}</span>
            </div>
          )) : <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Start practicing to build strengths.</div>}
        </div>

        {/* Weak Skills */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>⚠ Areas to Improve</div>
          {weakSkills.length > 0 ? weakSkills.map((w: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' }}>
              <span style={{ color: '#0a0a0f' }}>{w.skillName}</span>
              <span style={{ color: '#ca8a04', fontSize: '0.85rem' }}>{Math.round(w.proficiencyPct || 0)}%</span>
            </div>
          )) : <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>No weak skills identified.</div>}
        </div>

        {/* Portfolio Analysis */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>📋 Portfolio Analysis</div>
          {portfolio ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6366f1' }}>{Math.round(portfolio.skillCoverage || 0)}%</div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Skill Coverage</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6366f1' }}>{Math.round(portfolio.projectStrength || 0)}%</div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Project Strength</div>
                </div>
              </div>
              <button className={styles.btnPrimary} onClick={() => navigate('/career-paths')} style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}>
                View Career Paths
              </button>
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Analyze your portfolio to see insights.</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.sectionCard} style={{ marginTop: '1.5rem' }}>
        <div className={styles.sectionTitle}>🚀 Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <button className={styles.btnSecondary} onClick={() => navigate('/skill-graph')}>Skill Graph</button>
          <button className={styles.btnSecondary} onClick={() => navigate('/skill-gaps')}>Skill Gap Analysis</button>
          <button className={styles.btnSecondary} onClick={() => navigate('/career-advisor')}>Career Advisor</button>
          <button className={styles.btnSecondary} onClick={() => navigate('/adaptive-learning')}>Adaptive Learning</button>
          <button className={styles.btnSecondary} onClick={() => navigate('/career-paths')}>Career Paths</button>
          <button className={styles.btnSecondary} onClick={() => navigate('/skill-taxonomy')}>Skill Taxonomy</button>
        </div>
      </div>
    </div>
  );
}
