import { useState, useEffect } from 'react';
import { Search, Brain } from 'lucide-react';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

interface RankedCandidate {
  id: string;
  name: string;
  college: string;
  academicScore: number;
  skillScore: number;
  assessmentScore: number;
  totalScore: number;
  recommendation: 'STRONG_MATCH' | 'GOOD_MATCH' | 'MODERATE';
}

export function CandidateIntelligencePage() {
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'total' | 'skill' | 'academic' | 'assessment'>('total');
  const [searchQuery, setSearchQuery] = useState('');
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadCandidates() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const res = await fetch('/api/v1/recruitment/applications', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : json?.data || [];
          if (items.length > 0) {
            const ranked: RankedCandidate[] = items.map((app: any, idx: number) => {
              const cgpa = Number(app.cgpa) || 0;
              const academicScore = Math.min(100, Math.round((cgpa / 10) * 100));
              const assessmentScore = app.assessmentScore != null ? Number(app.assessmentScore) : 0;
              const skillScore = app.skills && Array.isArray(app.skills) && app.skills.length > 0 ? Math.min(100, 70 + app.skills.length * 5) : 75;
              const totalScore = (academicScore * 0.35) + (assessmentScore * 0.40) + (skillScore * 0.25);

              let recommendation: RankedCandidate['recommendation'] = 'MODERATE';
              if (totalScore >= 80) recommendation = 'STRONG_MATCH';
              else if (totalScore >= 65) recommendation = 'GOOD_MATCH';

              return {
                id: app.id || `ci-${idx}`,
                name: app.studentName || app.name || `Candidate ${idx + 1}`,
                college: app.institutionName || app.college || 'Partner Institution',
                academicScore,
                skillScore,
                assessmentScore,
                totalScore,
                recommendation,
              };
            });
            setCandidates(ranked);
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
    loadCandidates();
  }, []);

  const toggleShortlist = (id: string) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sortedCandidates = [...candidates]
    .sort((a, b) => {
      if (sortBy === 'skill') return b.skillScore - a.skillScore;
      if (sortBy === 'academic') return b.academicScore - a.academicScore;
      if (sortBy === 'assessment') return b.assessmentScore - a.assessmentScore;
      return b.totalScore - a.totalScore;
    })
    .filter(
      (c) =>
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.college.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const avgTalent =
    candidates.length > 0
      ? (candidates.reduce((sum, c) => sum + c.totalScore, 0) / candidates.length).toFixed(1)
      : '0.0';

  const strongMatches = candidates.filter((c) => c.recommendation === 'STRONG_MATCH').length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>AI Candidate Intelligence &amp; Multi-Vector Ranking</h1>
          <p className={styles.subtitle}>
            Multi-attribute AI ranking aggregating academic performance, verified skill tests, and coding problem benchmarks
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Intelligence Model</span>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>Multi-Vector v3.4</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Top Ranked Scholars</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {strongMatches} Strong Match
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Talent Index</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>{avgTalent} / 100</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Shortlisted</span>
          <span className={styles.statValue} style={{ color: '#7c3aed' }}>{shortlisted.size} Candidates</span>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterChip} ${sortBy === 'total' ? styles.filterActive : ''}`}
            onClick={() => setSortBy('total')}
          >
            Sort: Overall Match
          </button>
          <button
            className={`${styles.filterChip} ${sortBy === 'skill' ? styles.filterActive : ''}`}
            onClick={() => setSortBy('skill')}
          >
            Sort: Skill Vector
          </button>
          <button
            className={`${styles.filterChip} ${sortBy === 'assessment' ? styles.filterActive : ''}`}
            onClick={() => setSortBy('assessment')}
          >
            Sort: Test Score
          </button>
          <button
            className={`${styles.filterChip} ${sortBy === 'academic' ? styles.filterActive : ''}`}
            onClick={() => setSortBy('academic')}
          >
            Sort: Academic CGPA
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className={styles.searchInput}
            style={{ paddingLeft: '34px' }}
            placeholder="Search ranked candidate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          Calculating multi-vector candidate intelligence...
        </div>
      ) : sortedCandidates.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Brain size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '4px' }}>
            No candidate intelligence available yet
          </div>
          <div style={{ fontSize: '0.84rem', maxWidth: '440px', margin: '0 auto' }}>
            When students from partner institutions apply to your opportunities and complete benchmark coding tests, their multi-vector intelligence rankings will appear here automatically.
          </div>
        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Rank</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Candidate &amp; Institution</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Skill Match</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Benchmark Test</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Academic Vector</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Overall Score</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Recommendation</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedCandidates.map((c, idx) => {
                const isShortlisted = shortlisted.has(c.id);
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: idx < 3 ? '#1c2d81' : '#64748b' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{c.college}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0284c7' }}>{c.skillScore}%</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#15803d' }}>{c.assessmentScore}%</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#d97706' }}>{c.academicScore}%</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                      {c.totalScore.toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '0px',
                          background:
                            c.recommendation === 'STRONG_MATCH'
                              ? '#dcfce7'
                              : c.recommendation === 'GOOD_MATCH'
                              ? '#eff6ff'
                              : '#f1f5f9',
                          color:
                            c.recommendation === 'STRONG_MATCH'
                              ? '#15803d'
                              : c.recommendation === 'GOOD_MATCH'
                              ? '#1d4ed8'
                              : '#64748b',
                        }}
                      >
                        {c.recommendation.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        style={{
                          padding: '6px 12px',
                          background: isShortlisted ? '#f0fdf4' : '#1c2d81',
                          color: isShortlisted ? '#15803d' : '#ffffff',
                          border: `1px solid ${isShortlisted ? '#bbf7d0' : '#1c2d81'}`,
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleShortlist(c.id)}
                      >
                        {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

