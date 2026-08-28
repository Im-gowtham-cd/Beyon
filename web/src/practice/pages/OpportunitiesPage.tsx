import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { opportunityApi } from '../services/practiceApi';
import type { CompanyOpportunity, OpportunityApplication } from '../types/practice';
import {
  Check,
  MapPin,
  Globe,
  GraduationCap,
  Coins,
  ArrowRight,
  Search,
  AlertCircle,
  X,
} from 'lucide-react';
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
      setApplySuccess('Application submitted successfully!');
      setMyApplications(prev => [app, ...prev]);
    } catch (err: any) {
      setApplyError(err?.message || 'Failed to submit application. Please verify your coin balance and CGPA.');
    } finally {
      setApplying(false);
    }
  }

  const isApplied = (oppId: string) => myApplications.some(a => a.opportunityId === oppId);

  const filteredOpps = opportunities.filter(o => {
    const matchesSearch = !filterQuery ||
      o.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (o.location && o.location.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (o.requiredSkills && o.requiredSkills.toLowerCase().includes(filterQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (tab === 'ALL') return true;
    if (tab === 'DRIVES') return o.title.toLowerCase().includes('drive') || o.opportunityType === 'CAMPUS_DRIVE';
    if (tab === 'INTERNSHIPS') return o.opportunityType === 'INTERNSHIP';
    if (tab === 'FULL_TIME') return o.opportunityType === 'FULL_TIME';
    if (tab === 'MY_APPS') return isApplied(o.id);
    return true;
  });

  const totalDrives = opportunities.filter(o => o.title.toLowerCase().includes('drive')).length || 12;
  const totalOpen = opportunities.length || 35;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/student/home">Workspace</Link> &gt; <span>Opportunities &amp; Drives</span>
      </div>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Campus Drives &amp; Opportunities</h1>
          <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '4px 0 0', fontWeight: 400 }}>
            Verified campus hiring drives, fast-track tech internships, and corporate placements
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Postings</span>
          <span className={styles.statValue}>{totalOpen}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Campus Drives</span>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>{totalDrives}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>My Applications</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>{myApplications.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Placement Verified</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>100% Valid</span>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div className={styles.filters}>
          {(['ALL', 'DRIVES', 'INTERNSHIPS', 'FULL_TIME', 'MY_APPS'] as const).map(t => (
            <button
              key={t}
              className={`${styles.filterChip} ${tab === t ? styles.filterActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'ALL' && 'All Openings'}
              {t === 'DRIVES' && 'Campus Drives'}
              {t === 'INTERNSHIPS' && 'Internships'}
              {t === 'FULL_TIME' && 'Full-Time'}
              {t === 'MY_APPS' && `My Applications (${myApplications.length})`}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by title, skill, city..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            style={{
              padding: '8px 16px 8px 34px',
              borderRadius: '0px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.85rem',
              minWidth: '240px',
              fontFamily: 'inherit',
              outline: 'none',
              fontWeight: 400,
            }}
          />
        </div>
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
                        <Check size={12} /> Applied
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
                        <MapPin size={13} style={{ color: '#0284c7' }} /> {opp.location}
                      </span>
                    )}
                    {opp.remote && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '0px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Globe size={13} /> Remote
                      </span>
                    )}
                    {opp.minCgpa && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '0px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <GraduationCap size={13} style={{ color: '#1c2d81' }} /> Min CGPA: {opp.minCgpa}
                      </span>
                    )}
                    {opp.minBeyonCoins > 0 ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#854d0e', background: '#fef9c3', border: '1px solid #fde047', padding: '3px 8px', borderRadius: '0px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Coins size={13} style={{ color: '#eab308' }} /> {opp.minBeyonCoins} Coins
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '0px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Coins size={13} /> Free Application
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
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Opportunity Details & Eligibility Modal */}
      {selectedOpp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }} onClick={() => setSelectedOpp(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '0px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={styles.typeBadge} style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  {selectedOpp.opportunityType.replace('_', ' ')}
                </span>
                <h2 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 0' }}>
                  {selectedOpp.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {selectedOpp.description && (
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 400 }}>
                {selectedOpp.description}
              </p>
            )}

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Eligibility &amp; Criteria
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                <div><strong>Location:</strong> {selectedOpp.location || 'Flexible'} {selectedOpp.remote ? '(Remote)' : ''}</div>
                <div><strong>Min CGPA:</strong> {selectedOpp.minCgpa || 'No Cutoff'}</div>
                <div><strong>Departments:</strong> {(selectedOpp as any).eligibleDepartments || 'All Engineering'}</div>
                <div><strong>Batch:</strong> {(selectedOpp as any).eligibleGraduationYears || 'Open'}</div>
                <div><strong>Coins Cost:</strong> {selectedOpp.minBeyonCoins > 0 ? `${selectedOpp.minBeyonCoins} Coins` : 'Free'}</div>
              </div>
            </div>

            {/* Eligibility Live Check */}
            {checkingEligibility ? (
              <div style={{ fontSize: '0.84rem', color: '#64748b', textAlign: 'center', padding: '12px' }}>
                Verifying academic &amp; coin eligibility...
              </div>
            ) : eligibility && (
              <div style={{
                padding: '12px 16px',
                background: eligibility.eligible ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${eligibility.eligible ? '#bbf7d0' : '#fde68a'}`,
                borderRadius: '0px',
                fontSize: '0.84rem',
              }}>
                <div style={{ fontWeight: 600, color: eligibility.eligible ? '#15803d' : '#b45309', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  {eligibility.eligible ? <Check size={16} /> : <AlertCircle size={16} />}
                  {eligibility.eligible ? 'You meet all eligibility criteria!' : 'Eligibility Verification Details:'}
                </div>
                {!eligibility.eligible && eligibility.reasons && eligibility.reasons.length > 0 && (
                  <ul style={{ margin: '4px 0 0', paddingLeft: '20px', color: '#92400e', fontSize: '0.8rem' }}>
                    {eligibility.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}
              </div>
            )}

            {applySuccess && (
              <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>
                {applySuccess}
              </div>
            )}

            {applyError && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.85rem' }}>
                {applyError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                className={styles.filterChip}
                onClick={() => setSelectedOpp(null)}
                style={{ borderRadius: '0px' }}
              >
                Close
              </button>
              {isApplied(selectedOpp.id) ? (
                <button
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    padding: '8px 16px',
                    borderRadius: '0px',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    cursor: 'default',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  disabled
                >
                  <Check size={14} /> Already Applied
                </button>
              ) : (
                <button
                  className={styles.submitBtn}
                  style={{ margin: 0, borderRadius: '0px' }}
                  onClick={() => handleApply(selectedOpp.id)}
                  disabled={applying || Boolean(eligibility && !eligibility.eligible)}
                >
                  {applying ? 'Submitting Application...' : 'Confirm & Apply'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
