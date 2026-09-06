import { useState, useEffect } from 'react';
import {
  Search,
  ChevronRight,
  Users,
  LayoutGrid,
  List,
  Building2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
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
  studentId?: string;
  opportunityId?: string;
  name: string;
  college: string;
  role: string;
  cgpa: number;
  score: number;
  stage: PipelineStage;
  skills: string[];
  appliedAt?: string;
}

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'APPLIED', label: '1. Applied', color: '#64748b' },
  { key: 'SCREENING', label: '2. Screening', color: '#0284c7' },
  { key: 'SHORTLISTED', label: '3. Shortlisted', color: '#1c2d81' },
  { key: 'ASSESSMENT', label: '4. Assessment', color: '#d97706' },
  { key: 'INTERVIEW', label: '5. Interview', color: '#7c3aed' },
  { key: 'SELECTED', label: '6. Selected', color: '#15803d' },
  { key: 'REJECTED', label: '7. Rejected', color: '#dc2626' },
];

export function PipelinePage() {
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');

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
    async function fetchPipelineData() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [oppsRes, appsRes] = await Promise.all([
          fetch('/api/v1/opportunities', { headers }).catch(() => null),
          fetch('/api/v1/recruitment/applications', { headers }).catch(() => null),
        ]);

        if (oppsRes && oppsRes.ok) {
          const oppsJson = await oppsRes.json();
          if (Array.isArray(oppsJson?.data)) {
            setOpportunities(oppsJson.data);
          }
        }

        if (appsRes && appsRes.ok) {
          const json = await appsRes.json();
          const items = Array.isArray(json) ? json : json?.data || [];
          if (items.length > 0) {
            const mapped: PipelineCandidate[] = items.map((app: any, idx: number) => ({
              id: app.id || `app-${idx}`,
              studentId: app.studentId,
              opportunityId: app.opportunityId,
              name: app.studentName || app.name || 'Verified Scholar',
              college: app.institutionName || app.college || 'Partner Institution',
              role: app.opportunityTitle || app.role || 'Corporate Opening',
              cgpa: Number(app.cgpa) || 0,
              score: app.assessmentScore != null ? Number(app.assessmentScore) : 0,
              stage: mapBackendStatusToStage(app.status),
              skills: Array.isArray(app.skills) ? app.skills : [],
              appliedAt: app.appliedAt,
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
    fetchPipelineData();
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
        body: JSON.stringify({ status: newStage, notes: `Status updated to ${newStage}` }),
      });
    } catch {

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
      c.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage = activeStageFilter === 'ALL' || c.stage === activeStageFilter;
    const matchesOpp = selectedOppId === 'ALL' || c.opportunityId === selectedOppId;

    return matchesSearch && matchesStage && matchesOpp;
  });

  const totalInPipeline = candidates.length;
  const inEvaluation = candidates.filter(
    (c) => c.stage === 'SHORTLISTED' || c.stage === 'ASSESSMENT' || c.stage === 'SCREENING'
  ).length;
  const inInterview = candidates.filter((c) => c.stage === 'INTERVIEW').length;
  const selectedCount = candidates.filter((c) => c.stage === 'SELECTED').length;

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.portalBadge}>Recruitment Operations</span>
            <span className={styles.verifiedBadge}>
              <ShieldCheck size={12} />
              <span>Real-Time Stage Sync</span>
            </span>
          </div>
          <h1 className={styles.title}>Corporate Hiring &amp; Candidate Pipeline</h1>
          <p className={styles.subtitle}>
            Manage candidate evaluations, technical assessments, and interview progression in real time
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.viewSwitcher}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'KANBAN' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('KANBAN')}
            >
              <LayoutGrid size={14} />
              <span>Kanban</span>
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'TABLE' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('TABLE')}
            >
              <List size={14} />
              <span>List Table</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total In Pipeline</span>
          <span className={styles.statValue}>{totalInPipeline}</span>
          <span className={styles.statSub}>Active talent submissions</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Screening &amp; Assessment</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {inEvaluation}
          </span>
          <span className={styles.statSub}>Under technical review</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Interview Rounds</span>
          <span className={styles.statValue} style={{ color: '#7c3aed' }}>
            {inInterview}
          </span>
          <span className={styles.statSub}>Scheduled &amp; ongoing panels</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Final Selections</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {selectedCount}
          </span>
          <span className={styles.statSub}>Offers &amp; accepted candidates</span>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.filterGroup}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search candidate, role, college, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.selectInput}
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
          >
            <option value="ALL">All Campus Drives &amp; Opportunities</option>
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title} ({opp.opportunityType?.replace('_', ' ') || 'DRIVE'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.stageFilterRow}>
        <button
          className={`${styles.stageFilterChip} ${activeStageFilter === 'ALL' ? styles.stageFilterActive : ''}`}
          onClick={() => setActiveStageFilter('ALL')}
        >
          All Stages ({candidates.length})
        </button>
        {STAGES.map((s) => {
          const count = candidates.filter((c) => c.stage === s.key).length;
          return (
            <button
              key={s.key}
              className={`${styles.stageFilterChip} ${activeStageFilter === s.key ? styles.stageFilterActive : ''}`}
              onClick={() => setActiveStageFilter(s.key)}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: s.color,
                  display: 'inline-block',
                }}
              />
              <span>{s.label}</span>
              <span style={{ opacity: 0.75 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className={styles.emptyGlobal}>
          <Clock size={32} style={{ color: '#1c2d81', animation: 'spin 2s linear infinite' }} />
          <p className={styles.emptyGlobalSub}>Loading real-time candidate pipeline data...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className={styles.emptyGlobal}>
          <Users size={40} style={{ color: '#cbd5e1' }} />
          <h3 className={styles.emptyGlobalTitle}>No candidates in pipeline yet</h3>
          <p className={styles.emptyGlobalSub}>
            When students apply to your corporate campus drives or jobs, their profiles will immediately appear here.
          </p>
        </div>
      ) : viewMode === 'KANBAN' ? (

        <div className={styles.kanbanBoard}>
          {STAGES.map((stg) => {
            const stageCandidates = filteredCandidates.filter((c) => c.stage === stg.key);
            return (
              <div key={stg.key} className={styles.kanbanCol}>
                <div className={styles.kanbanColHeader}>
                  <div className={styles.colTitleGroup}>
                    <span className={styles.colIndicator} style={{ background: stg.color }} />
                    <h3 className={styles.colTitle}>{stg.label}</h3>
                  </div>
                  <span className={styles.colBadge}>{stageCandidates.length}</span>
                </div>

                <div className={styles.candidateList}>
                  {stageCandidates.length === 0 ? (
                    <div className={styles.emptyCol}>No candidates in this stage</div>
                  ) : (
                    stageCandidates.map((c) => (
                      <div key={c.id} className={styles.candidateCard}>
                        <div className={styles.cardTop}>
                          <div className={styles.avatar}>
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className={styles.candidateInfo}>
                            <h4 className={styles.candidateName}>{c.name}</h4>
                            <div className={styles.candidateRole}>{c.role}</div>
                            <div className={styles.candidateCollege}>
                              <Building2 size={12} />
                              <span>{c.college}</span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.metricsBar}>
                          {c.cgpa > 0 && (
                            <div className={styles.metricItem}>
                              <GraduationCap size={12} style={{ color: '#1c2d81' }} />
                              <span className={styles.cgpaPill}>{c.cgpa} CGPA</span>
                            </div>
                          )}
                          {c.score > 0 && (
                            <div className={styles.metricItem}>
                              <Sparkles size={12} style={{ color: '#15803d' }} />
                              <span className={styles.scorePill}>{c.score}% Score</span>
                            </div>
                          )}
                        </div>

                        {c.skills.length > 0 && (
                          <div className={styles.skillsRow}>
                            {c.skills.slice(0, 4).map((sk, idx) => (
                              <span key={idx} className={styles.skillPill}>
                                {sk.replace('SKILL_', '')}
                              </span>
                            ))}
                            {c.skills.length > 4 && (
                              <span className={styles.skillPill}>+{c.skills.length - 4}</span>
                            )}
                          </div>
                        )}

                        <div className={styles.cardFooter}>
                          <select
                            className={styles.stageSelect}
                            value={c.stage}
                            onChange={(e) => updateCandidateStage(c.id, e.target.value as PipelineStage)}
                          >
                            {STAGES.map((s) => (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            ))}
                          </select>

                          {c.stage !== 'SELECTED' && c.stage !== 'REJECTED' && (
                            <button
                              className={styles.btnAdvance}
                              onClick={() => advanceStage(c.id, c.stage)}
                              title="Advance to next stage"
                            >
                              <span>Advance</span>
                              <ChevronRight size={12} />
                            </button>
                          )}

                          {c.stage !== 'REJECTED' && c.stage !== 'SELECTED' && (
                            <button
                              className={styles.btnReject}
                              onClick={() => updateCandidateStage(c.id, 'REJECTED')}
                              title="Mark as Rejected"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Candidate</th>
                <th className={styles.th}>Institution</th>
                <th className={styles.th}>Opportunity / Role</th>
                <th className={styles.th}>Academic CGPA</th>
                <th className={styles.th}>Assessment</th>
                <th className={styles.th}>Verified Skills</th>
                <th className={styles.th}>Current Stage</th>
                <th className={styles.th}>Pipeline Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c) => (
                <tr key={c.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.avatar}>{c.name.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td} style={{ color: '#475569' }}>
                    {c.college}
                  </td>
                  <td className={styles.td} style={{ fontWeight: 600, color: '#1c2d81' }}>
                    {c.role}
                  </td>
                  <td className={styles.td}>
                    {c.cgpa > 0 ? (
                      <span className={styles.cgpaPill}>{c.cgpa} CGPA</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    {c.score > 0 ? (
                      <span className={styles.scorePill}>{c.score}%</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Pending</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skillsRow}>
                      {c.skills.slice(0, 3).map((sk, idx) => (
                        <span key={idx} className={styles.skillPill}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <select
                      className={styles.stageSelect}
                      value={c.stage}
                      onChange={(e) => updateCandidateStage(c.id, e.target.value as PipelineStage)}
                      style={{ minWidth: '130px' }}
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {c.stage !== 'SELECTED' && c.stage !== 'REJECTED' && (
                        <button
                          className={styles.btnAdvance}
                          onClick={() => advanceStage(c.id, c.stage)}
                        >
                          <span>Advance</span>
                          <ChevronRight size={12} />
                        </button>
                      )}
                      {c.stage === 'SELECTED' && (
                        <span style={{ color: '#15803d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                          <CheckCircle2 size={13} /> Selected
                        </span>
                      )}
                      {c.stage !== 'REJECTED' && c.stage !== 'SELECTED' && (
                        <button
                          className={styles.btnReject}
                          onClick={() => updateCandidateStage(c.id, 'REJECTED')}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

