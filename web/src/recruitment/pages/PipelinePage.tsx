import { useState } from 'react';
import {
  Search,
  ChevronRight,
} from 'lucide-react';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

interface PipelineCandidate {
  id: string;
  name: string;
  college: string;
  role: string;
  cgpa: number;
  score: number;
  stage: 'APPLIED' | 'ASSESSMENT_COMPLETED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED';
  skills: string[];
}

export function PipelinePage() {
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([
    {
      id: 'p-01',
      name: 'Aravind Swaminathan',
      college: 'PSG College of Technology',
      role: 'Full Stack Java Engineer',
      cgpa: 9.34,
      score: 94,
      stage: 'SHORTLISTED',
      skills: ['Java', 'Spring Boot', 'MySQL'],
    },
    {
      id: 'p-02',
      name: 'Divya Ramesh',
      college: 'College of Engineering, Guindy',
      role: 'CUDA AI Kernel Engineer',
      cgpa: 9.18,
      score: 96,
      stage: 'INTERVIEW_SCHEDULED',
      skills: ['CUDA', 'PyTorch', 'C++'],
    },
    {
      id: 'p-03',
      name: 'Karthik Subramanian',
      college: 'Vellore Institute of Technology',
      role: 'Cloud Platform DevOps',
      cgpa: 8.82,
      score: 88,
      stage: 'ASSESSMENT_COMPLETED',
      skills: ['Docker', 'Kubernetes', 'AWS'],
    },
    {
      id: 'p-04',
      name: 'Pooja Narayanan',
      college: 'Sri Sivasubramaniya Nadar College',
      role: 'Cybersecurity Operations',
      cgpa: 9.05,
      score: 91,
      stage: 'SHORTLISTED',
      skills: ['Network Security', 'Python', 'SIEM'],
    },
    {
      id: 'p-05',
      name: 'Rahul Venkat',
      college: 'Amrita Vishwa Vidyapeetham',
      role: 'Data Pipeline Specialist',
      cgpa: 8.65,
      score: 84,
      stage: 'APPLIED',
      skills: ['PostgreSQL', 'Spark', 'Python'],
    },
    {
      id: 'p-06',
      name: 'Manoj Varman',
      college: 'Thiagarajar College of Engineering',
      role: 'Full Stack Engineer',
      cgpa: 9.10,
      score: 92,
      stage: 'OFFERED',
      skills: ['React', 'Node.js', 'Go'],
    },
  ]);

  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const advanceStage = (id: string) => {
    const stageOrder: PipelineCandidate['stage'][] = [
      'APPLIED',
      'ASSESSMENT_COMPLETED',
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'OFFERED',
    ];

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const currentIdx = stageOrder.indexOf(c.stage);
        if (currentIdx < stageOrder.length - 1) {
          return { ...c, stage: stageOrder[currentIdx + 1] };
        }
        return c;
      })
    );
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

  const stages: { key: PipelineCandidate['stage']; label: string; color: string }[] = [
    { key: 'APPLIED', label: '1. Applied', color: '#64748b' },
    { key: 'ASSESSMENT_COMPLETED', label: '2. Test Passed', color: '#0284c7' },
    { key: 'SHORTLISTED', label: '3. Shortlisted', color: '#15803d' },
    { key: 'INTERVIEW_SCHEDULED', label: '4. Interview', color: '#b45309' },
    { key: 'OFFERED', label: '5. Offer Released', color: '#7c3aed' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Recruitment Pipeline &amp; Candidate Kanban</h1>
          <p className={styles.subtitle}>
            Manage candidate workflow across evaluation stages, technical interviews, and employment offer releases
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
          <span className={styles.statLabel}>Tests Cleared</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {candidates.filter((c) => c.stage !== 'APPLIED').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Interviews Active</span>
          <span className={styles.statValue} style={{ color: '#b45309' }}>
            {candidates.filter((c) => c.stage === 'INTERVIEW_SCHEDULED').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Offers Released</span>
          <span className={styles.statValue} style={{ color: '#7c3aed' }}>
            {candidates.filter((c) => c.stage === 'OFFERED').length}
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
          {stages.map((s) => {
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
            placeholder="Search candidate by name, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
        {stages.map((stg) => {
          const stageCandidates = filteredCandidates.filter((c) => c.stage === stg.key);
          return (
            <div
              key={stg.key}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderTop: `3px solid ${stg.color}`,
                borderRadius: '0px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '300px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {stg.label}
                </h3>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', background: '#f1f5f9', color: '#475569' }}>
                  {stageCandidates.length}
                </span>
              </div>

              {stageCandidates.length === 0 ? (
                <div style={{ padding: '20px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
                  No candidates in this stage.
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
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{c.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{c.role}</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d' }}>
                        {c.score}%
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                      {c.college} &middot; <strong>{c.cgpa} CGPA</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {c.skills.map((s, idx) => (
                        <span key={idx} style={{ fontSize: '0.66rem', padding: '1px 5px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569' }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    {c.stage !== 'OFFERED' && (
                      <button
                        style={{
                          marginTop: '4px',
                          padding: '5px 8px',
                          background: '#1c2d81',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                        onClick={() => advanceStage(c.id)}
                      >
                        <span>Advance Stage</span>
                        <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
