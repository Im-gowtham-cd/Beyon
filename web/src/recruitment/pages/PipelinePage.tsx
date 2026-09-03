import { useState, useEffect } from 'react';
import {
  Search,
  ChevronRight,
  Users,
} from 'lucide-react';
import styles from './PipelinePage.module.css';

export type PipelineStage =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED';

interface PipelineCandidate {
  id: string;
  name: string;
  college: string;
  role: string;
  cgpa: number;
  score: number;
  stage: PipelineStage;
  skills: string[];
}

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'APPLIED', label: '1. Applied', color: '#64748b' },
  { key: 'SCREENING', label: '2. Screening', color: '#0284c7' },
  { key: 'SHORTLISTED', label: '3. Shortlisted', color: '#0369a1' },
  { key: 'ASSESSMENT', label: '4. Assessment', color: '#d97706' },
  { key: 'INTERVIEW', label: '5. Interview', color: '#b45309' },
  { key: 'SELECTED', label: '6. Selected', color: '#15803d' },
  { key: 'REJECTED', label: '7. Rejected', color: '#dc2626' },
];

export function PipelinePage() {
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const mapBackendStatusToStage = (raw: string): PipelineStage => {
    const s = (raw || '').toUpperCase();
    if (s.includes('REJECT')) return 'REJECTED';
    if (s.includes('SELECT') || s.includes('OFFER') || s.includes('ACCEPTED') || s.includes('HIRED')) return 'SELECTED';
    if (s.includes('INTERVIEW')) return 'INTERVIEW';
    if (s.includes('ASSESS') || s.includes('TEST')) return 'ASSESSMENT';
    if (s.includes('SHORTLIST')) return 'SHORTLISTED';
    if (s.includes('SCREEN')) return 'SCREENING';
    return 'APPLIED';
  };

  useEffect(() => {
    async function fetchLivePipeline() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/v1/recruitment/applications', { headers });
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : json?.data || [];
          if (items.length > 0) {
            const mapped: PipelineCandidate[] = items.map((app: any, idx: number) => ({
              id: app.id || `live-${idx}`,
              name: app.studentName || app.name || `Candidate ${idx + 1}`,
              college: app.institutionName || app.college || 'Partner Institution',
              role: app.opportunityTitle || app.role || 'Campus Opportunity',
              cgpa: Number(app.cgpa) || 0,
              score: app.assessmentScore != null ? Number(app.assessmentScore) : 0,
              stage: mapBackendStatusToStage(app.status),
              skills: Array.isArray(app.skills) ? app.skills : ['Core Technical'],
            }));
            setCandidates(mapped);
          } else {
            setCandidates([]);
          }
        }
      } catch {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLivePipeline();
  }, []);

  const updateCandidateStage = async (id: string, newStage: PipelineStage) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: newStage } : c))
    );

    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      await fetch(`/api/v1/recruitment/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStage, notes: `Moved to ${newStage}` }),
      });
    } catch {
      /* handled */
    }
  };

  const advanceStage = (id: string, currentStage: PipelineStage) => {
    const stageFlow: PipelineStage[] = [
      'APPLIED',
      'SCREENING',
      'SHORTLISTED',
      'ASSESSMENT',
      'INTERVIEW',
      'SELECTED',
    ];
    const idx = stageFlow.indexOf(currentStage);
    if (idx >= 0 && idx < stageFlow.length - 1) {
      updateCandidateStage(id, stageFlow[idx + 1]);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.college.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = activeStageFilter === 'ALL' || c.stage === activeStageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Recruitment Pipeline &amp; Candidate Kanban</h1>
          <p className={styles.subtitle}>
            Manage candidate progression across evaluation stages, technical interviews, and final selection
          </p>
        </div>
      </div>

      {/* 4 Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total In Pipeline</span>
          <span className={styles.statValue}>{candidates.length} Candidates</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>In Evaluation / Tech Rounds</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {candidates.filter((c) => c.stage === 'SHORTLISTED' || c.stage === 'ASSESSMENT' || c.stage === 'INTERVIEW').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Final Selections</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {candidates.filter((c) => c.stage === 'SELECTED').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Rejected / Dropped</span>
          <span className={styles.statValue} style={{ color: '#dc2626' }}>
            {candidates.filter((c) => c.stage === 'REJECTED').length}
          </span>
        </div>
      </div>

      {/* Stage Filter Buttons */}
      <div className={styles.filterRow}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterChip} ${activeStageFilter === 'ALL' ? styles.filterActive : ''}`}
            onClick={() => setActiveStageFilter('ALL')}
          >
            All Candidates ({candidates.length})
          </button>
          {STAGES.map((s) => {
            const count = candidates.filter((c) => c.stage === s.key).length;
            return (
              <button
                key={s.key}
                className={`${styles.filterChip} ${activeStageFilter === s.key ? styles.filterActive : ''}`}
                onClick={() => setActiveStageFilter(s.key)}
              >
                {s.label} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className={styles.searchInput}
            style={{ paddingLeft: '34px' }}
            placeholder="Search candidate by name, role, college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          Loading candidate pipeline...
        </div>
      ) : candidates.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Users size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '4px' }}>
            No candidates in pipeline yet
          </div>
          <div style={{ fontSize: '0.84rem', maxWidth: '440px', margin: '0 auto' }}>
            When students from partner institutions apply to your opportunities, their cards will populate the Kanban stages automatically.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', alignItems: 'start' }}>
          {STAGES.map((stg) => {
            const stageCandidates = filteredCandidates.filter((c) => c.stage === stg.key);
            return (
              <div
                key={stg.key}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderTop: `3px solid ${stg.color}`,
                  borderRadius: '0px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  minHeight: '280px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {stg.label}
                  </h3>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', background: '#f1f5f9', color: '#475569' }}>
                    {stageCandidates.length}
                  </span>
                </div>

                {stageCandidates.length === 0 ? (
                  <div style={{ padding: '24px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.76rem' }}>
                    No candidates
                  </div>
                ) : (
                  stageCandidates.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.role}</div>
                        </div>
                        {c.score > 0 && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d' }}>
                            {c.score}%
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                        {c.college} {c.cgpa > 0 ? `· ${c.cgpa} CGPA` : ''}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        {c.stage !== 'SELECTED' && c.stage !== 'REJECTED' && (
                          <button
                            style={{
                              flex: 1,
                              padding: '4px 6px',
                              background: '#1c2d81',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '2px',
                            }}
                            onClick={() => advanceStage(c.id, c.stage)}
                          >
                            <span>Advance</span>
                            <ChevronRight size={12} />
                          </button>
                        )}
                        {c.stage !== 'REJECTED' && c.stage !== 'SELECTED' && (
                          <button
                            style={{
                              padding: '4px 8px',
                              background: '#fff1f2',
                              color: '#dc2626',
                              border: '1px solid #fecdd3',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            onClick={() => updateCandidateStage(c.id, 'REJECTED')}
                            title="Reject candidate"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
