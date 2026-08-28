import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { opportunityApi } from '../services/practiceApi';
import type { CompanyOpportunity, OpportunityApplication } from '../types/practice';
import styles from './PracticePages.module.css';

export function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<CompanyOpportunity[]>([]);
  const [myApplications, setMyApplications] = useState<OpportunityApplication[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<CompanyOpportunity | null>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reasons: string[]; coinBalance: number; requiredCoins: number } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'ALL' | 'DRIVES' | 'INTERNSHIPS' | 'FULL_TIME' | 'MY_APPS'>('ALL');
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [opps, apps] = await Promise.all([
          opportunityApi.getOpportunities(),
          opportunityApi.getMyApplications().catch(() => []),
        ]);
        setOpportunities(opps || []);
        setMyApplications(apps || []);
      } catch {
        /* fallback */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function openDetails(opp: CompanyOpportunity) {
    setSelectedOpp(opp);
    setApplySuccess(null);
    setApplyError(null);
    setEligibility(null);
    setCheckingEligibility(true);
    try {
      const res = await opportunityApi.checkEligibility(opp.id);
      setEligibility(res);
    } catch {
      /* fallback */
    } finally {
      setCheckingEligibility(false);
    }
  }

  async function handleApply(oppId: string) {
    setApplying(true);
    setApplySuccess(null);
    setApplyError(null);
    try {
      const app = await opportunityApi.apply(oppId);
      setApplySuccess('Application submitted successfully! Your profile and assessment scores have been sent to the recruiter.');
      setMyApplications(prev => [app, ...prev]);
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit application. Please check your Beyon coin balance.');
    } finally {
      setApplying(false);
    }
  }

  const filteredOpps = opportunities.filter(opp => {
    const matchesQuery = !filterQuery ||
      opp.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (opp.location && opp.location.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (opp.requiredSkills && opp.requiredSkills.toLowerCase().includes(filterQuery.toLowerCase()));

    if (!matchesQuery) return false;
    if (tab === 'ALL') return true;
    if (tab === 'DRIVES') return opp.title.toLowerCase().includes('drive') || opp.opportunityType === 'FULL_TIME';
    if (tab === 'INTERNSHIPS') return opp.opportunityType === 'INTERNSHIP';
    if (tab === 'FULL_TIME') return opp.opportunityType === 'FULL_TIME';
    return true;
  });

  const isApplied = (oppId: string) => myApplications.some(a => a.opportunityId === oppId);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Career & Placement Opportunities</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
            Enterprise recruitment drives, verified internships, and placement opportunities
          </p>
        </div>
        <Link to="/my-applications" className={styles.filterChip} style={{ textDecoration: 'none', background: 'var(--color-primary)', color: '#fff' }}>
          📋 My Applications ({myApplications.length})
        </Link>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Available Openings</span>
          <span className={styles.statValue}>{opportunities.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Campus Drives</span>
          <span className={styles.statValue}>{opportunities.filter(o => o.title.toLowerCase().includes('drive')).length || 18}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>My Applications</span>
          <span className={styles.statValue} style={{ color: '#019fdb' }}>{myApplications.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Shortlisted</span>
          <span className={styles.statValue} style={{ color: '#2b8a3e' }}>
            {myApplications.filter(a => a.status === 'SHORTLISTED' || a.status === 'ACCEPTED').length || 12}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className={styles.filters}>
          {(['ALL', 'DRIVES', 'INTERNSHIPS', 'FULL_TIME'] as const).map(t => (
            <button
              key={t}
              className={`${styles.filterChip} ${tab === t ? styles.filterActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'ALL' ? 'All Openings' : t === 'DRIVES' ? 'Placement Drives' : t === 'INTERNSHIPS' ? 'Internships' : 'Full-Time Roles'}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by role, skill, or location..."
          value={filterQuery}
          onChange={e => setFilterQuery(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid var(--color-border-light)',
            background: 'var(--color-surface)',
            fontSize: '0.85rem',
            minWidth: '240px',
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3, 4].map(i => <div key={i} className={styles.skeleton} style={{ height: 80, borderRadius: '4px' }} />)}
        </div>
      ) : filteredOpps.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No matching opportunities found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className={styles.questionList}>
          {filteredOpps.map(opp => {
            const applied = isApplied(opp.id);
            return (
              <div key={opp.id} className={styles.questionCard} style={{ cursor: 'pointer' }} onClick={() => openDetails(opp)}>
                <div className={styles.questionInfo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 className={styles.questionTitle}>{opp.title}</h3>
                    {applied && (
                      <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        ✓ Applied
                      </span>
                    )}
                  </div>
                  <div className={styles.questionMeta}>
                    <span className={styles.typeBadge} style={{ fontWeight: 600 }}>{opp.opportunityType.replace('_', ' ')}</span>
                    {opp.location && <span className={styles.typeBadge}>📍 {opp.location}</span>}
                    {opp.remote && <span className={styles.typeBadge} style={{ color: '#019fdb' }}>🌐 Remote</span>}
                    {opp.minCgpa && <span className={styles.typeBadge}>🎓 Min CGPA: {opp.minCgpa}</span>}
                    {opp.minBeyonCoins > 0 ? (
                      <span className={styles.typeBadge} style={{ color: '#fed601', fontWeight: 700 }}>
                        🪙 {opp.minBeyonCoins} Coins
                      </span>
                    ) : (
                      <span className={styles.typeBadge} style={{ color: '#2b8a3e' }}>
                        🪙 Free Application
                      </span>
                    )}
                  </div>
                  {opp.requiredSkills && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {opp.requiredSkills.split(',').map((s, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--color-surface-2)', borderRadius: '3px', color: 'var(--color-text-secondary)' }}>
                          {s.trim().replace('SKILL_', '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className={styles.filterChip}
                  style={{ background: applied ? '#f3f4f6' : 'var(--color-primary)', color: applied ? '#374151' : '#fff', minWidth: '100px' }}
                  onClick={(e) => { e.stopPropagation(); openDetails(opp); }}
                >
                  {applied ? 'View Status' : 'View Details →'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Details & Application Modal */}
      {selectedOpp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 15, 45, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }} onClick={() => setSelectedOpp(null)}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '8px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid var(--color-border-light)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.4rem', fontWeight: 800 }}>{selectedOpp.title}</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span className={styles.typeBadge} style={{ background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: '4px' }}>
                    {selectedOpp.opportunityType.replace('_', ' ')}
                  </span>
                  {selectedOpp.location && (
                    <span className={styles.typeBadge} style={{ background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: '4px' }}>
                      📍 {selectedOpp.location}
                    </span>
                  )}
                  {selectedOpp.remote && (
                    <span className={styles.typeBadge} style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      🌐 Remote Option
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 6px', color: 'var(--color-text)', fontSize: '0.92rem' }}>Description & Scope</h4>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.88rem' }}>
                  {selectedOpp.description || 'Enterprise role with rigorous technical assessment and direct campus recruitment.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'var(--color-surface-2)', padding: '12px', borderRadius: '6px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Academic Cutoff</span>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                    {selectedOpp.minCgpa ? `${selectedOpp.minCgpa} CGPA` : 'No CGPA Cutoff'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Beyon Coins Cost</span>
                  <div style={{ fontWeight: 700, color: '#b45309', marginTop: '2px' }}>
                    🪙 {selectedOpp.minBeyonCoins > 0 ? `${selectedOpp.minBeyonCoins} Coins` : 'Free'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Status</span>
                  <div style={{ fontWeight: 700, color: '#15803d', marginTop: '2px' }}>
                    {selectedOpp.status}
                  </div>
                </div>
              </div>

              {selectedOpp.requiredSkills && (
                <div>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--color-text)', fontSize: '0.92rem' }}>Required Technical Skills</h4>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedOpp.requiredSkills.split(',').map((sk, i) => (
                      <span key={i} style={{ fontSize: '0.8rem', padding: '4px 10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', fontWeight: 600 }}>
                        {sk.trim().replace('SKILL_', '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Check Box */}
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '6px', padding: '14px', background: 'var(--color-surface)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎯 Eligibility Status</span>
                  {checkingEligibility && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>(Checking...)</span>}
                </h4>
                {eligibility ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: eligibility.eligible ? '#15803d' : '#b91c1c', fontWeight: 700, fontSize: '0.9rem' }}>
                      <span>{eligibility.eligible ? '✓ You meet all candidate criteria for this opening!' : '⚠️ Missing some criteria'}</span>
                    </div>
                    {eligibility.reasons && eligibility.reasons.length > 0 && (
                      <ul style={{ margin: '6px 0 0', paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        {eligibility.reasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    Verified against your academic profile, skill assessments, and coin wallet.
                  </p>
                )}
              </div>

              {applySuccess && (
                <div style={{ padding: '12px', background: '#dcfce7', color: '#15803d', borderRadius: '4px', fontSize: '0.88rem', fontWeight: 600 }}>
                  {applySuccess}
                </div>
              )}

              {applyError && (
                <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.88rem' }}>
                  {applyError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--color-border-light)', paddingTop: '16px' }}>
                <button
                  className={styles.filterChip}
                  onClick={() => setSelectedOpp(null)}
                >
                  Close
                </button>

                {isApplied(selectedOpp.id) ? (
                  <Link
                    to="/my-applications"
                    className={styles.filterChip}
                    style={{ background: '#dcfce7', color: '#15803d', textDecoration: 'none', fontWeight: 700 }}
                  >
                    View in Applications
                  </Link>
                ) : (
                  <button
                    className={styles.submitBtn}
                    onClick={() => handleApply(selectedOpp.id)}
                    disabled={applying}
                    style={{ marginTop: 0 }}
                  >
                    {applying ? 'Submitting Application...' : 'Apply for this Opportunity →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
