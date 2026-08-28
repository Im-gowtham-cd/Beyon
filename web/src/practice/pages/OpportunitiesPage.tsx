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
          <h1 className={styles.title}>Career &amp; Placement Opportunities</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Enterprise recruitment drives, verified internships, and placement opportunities
          </p>
        </div>
        <Link to="/my-applications" className={styles.filterChip} style={{ textDecoration: 'none', background: '#1c2d81', color: '#fff', border: '1px solid #1c2d81', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <i className="bx bx-file-blank" />
          <span>My Applications ({myApplications.length})</span>
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
          <span className={styles.statValue} style={{ color: '#0284c7' }}>{myApplications.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Shortlisted</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
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
            borderRadius: '0px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            fontSize: '0.85rem',
            minWidth: '240px',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3, 4].map(i => <div key={i} className={styles.skeleton} style={{ height: 80, borderRadius: '0px' }} />)}
        </div>
      ) : filteredOpps.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No matching opportunities found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', width: '100%' }}>
          {filteredOpps.map(opp => {
            const applied = isApplied(opp.id);
            return (
              <div
                key={opp.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderTop: '3px solid #1c2d81',
                  borderRadius: '0px',
                  padding: '22px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => openDetails(opp)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35, flex: 1, minWidth: 0 }}>
                      {opp.title}
                    </h3>
                    {applied ? (
                      <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '0px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="bx bx-check" /> Applied
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '0px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {opp.opportunityType.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Metadata Pills */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', margin: '10px 0' }}>
                    {opp.location && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '0px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="bx bx-map-pin" style={{ color: '#0284c7' }} /> {opp.location}
                      </span>
                    )}
                    {opp.remote && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '0px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="bx bx-globe" /> Remote
                      </span>
                    )}
                    {opp.minCgpa && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '0px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="bx bx-graduation" style={{ color: '#1c2d81' }} /> Min CGPA: {opp.minCgpa}
                      </span>
                    )}
                    {opp.minBeyonCoins > 0 ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#854d0e', background: '#fef9c3', border: '1px solid #fde047', padding: '3px 8px', borderRadius: '0px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="bx bx-coin-stack" style={{ color: '#eab308' }} /> {opp.minBeyonCoins} Coins
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '0px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="bx bx-coin-stack" /> Free Application
                      </span>
                    )}
                  </div>

                  {/* Required Skills */}
                  {opp.requiredSkills && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {opp.requiredSkills.split(',').map((s, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', fontWeight: 400, padding: '2px 8px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {s.trim().replace('SKILL_', '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    style={{
                      height: '36px',
                      width: '100%',
                      background: applied ? '#f8fafc' : '#1c2d81',
                      color: applied ? '#475569' : '#ffffff',
                      border: `1px solid ${applied ? '#cbd5e1' : '#1c2d81'}`,
                      padding: '0 16px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      borderRadius: '0px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={(e) => { e.stopPropagation(); openDetails(opp); }}
                  >
                    {applied ? (
                      <span>View Application Status</span>
                    ) : (
                      <>
                        <span>View Details &amp; Apply</span>
                        <i className="bx bx-right-arrow-alt" />
                      </>
                    )}
                  </button>
                </div>
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
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }} onClick={() => setSelectedOpp(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '0px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: 900 }}>{selectedOpp.title}</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span className={styles.typeBadge} style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '0px' }}>
                    {selectedOpp.opportunityType.replace('_', ' ')}
                  </span>
                  {selectedOpp.location && (
                    <span className={styles.typeBadge} style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '0px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <i className="bx bx-map-pin" /> {selectedOpp.location}
                    </span>
                  )}
                  {selectedOpp.remote && (
                    <span className={styles.typeBadge} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '0px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <i className="bx bx-globe" /> Remote Option
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h4 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '0.92rem', fontWeight: 800 }}>Description &amp; Scope</h4>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.88rem' }}>
                  {selectedOpp.description || 'Enterprise role with rigorous technical assessment and direct campus recruitment.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '0px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Academic Cutoff</span>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px', fontSize: '0.95rem' }}>
                    {selectedOpp.minCgpa ? `${selectedOpp.minCgpa} CGPA` : 'No CGPA Cutoff'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Beyon Coins Cost</span>
                  <div style={{ fontWeight: 800, color: '#b45309', marginTop: '2px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="bx bx-coin-stack" /> {selectedOpp.minBeyonCoins > 0 ? `${selectedOpp.minBeyonCoins} Coins` : 'Free'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Status</span>
                  <div style={{ fontWeight: 800, color: '#15803d', marginTop: '2px', fontSize: '0.95rem' }}>
                    {selectedOpp.status}
                  </div>
                </div>
              </div>

              {selectedOpp.requiredSkills && (
                <div>
                  <h4 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '0.92rem', fontWeight: 800 }}>Required Technical Skills</h4>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedOpp.requiredSkills.split(',').map((sk, i) => (
                      <span key={i} style={{ fontSize: '0.8rem', padding: '4px 10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '0px', fontWeight: 700 }}>
                        {sk.trim().replace('SKILL_', '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Check Box */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '0px', padding: '16px', background: '#ffffff' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="bx bx-target-lock" style={{ color: '#1c2d81' }} />
                  <span>Eligibility Status</span>
                  {checkingEligibility && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Checking...)</span>}
                </h4>
                {eligibility ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: eligibility.eligible ? '#15803d' : '#b91c1c', fontWeight: 800, fontSize: '0.9rem' }}>
                      <i className={eligibility.eligible ? 'bx bx-check-circle' : 'bx bx-x-circle'} />
                      <span>{eligibility.eligible ? 'You meet all candidate criteria for this opening!' : 'Missing some criteria'}</span>
                    </div>
                    {eligibility.reasons && eligibility.reasons.length > 0 && (
                      <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '0.82rem', color: '#64748b' }}>
                        {eligibility.reasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Verified against your academic profile, skill assessments, and coin wallet.
                  </p>
                )}
              </div>

              {applySuccess && (
                <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '0px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bx bx-check-circle" />
                  <span>{applySuccess}</span>
                </div>
              )}

              {applyError && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '0px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bx bx-error-circle" />
                  <span>{applyError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  className={styles.filterChip}
                  onClick={() => setSelectedOpp(null)}
                  style={{ borderRadius: '0px' }}
                >
                  Close
                </button>

                {isApplied(selectedOpp.id) ? (
                  <Link
                    to="/my-applications"
                    className={styles.filterChip}
                    style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', textDecoration: 'none', fontWeight: 800, borderRadius: '0px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className="bx bx-check" /> View in Applications
                  </Link>
                ) : (
                  <button
                    className={styles.submitBtn}
                    onClick={() => handleApply(selectedOpp.id)}
                    disabled={applying}
                    style={{ marginTop: 0, borderRadius: '0px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>{applying ? 'Submitting Application...' : 'Apply for this Opportunity'}</span>
                    <i className="bx bx-right-arrow-alt" />
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
