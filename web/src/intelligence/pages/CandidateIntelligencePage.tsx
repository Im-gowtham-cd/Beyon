import { useState } from 'react';
import { Search } from 'lucide-react';
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
  const [candidates] = useState<RankedCandidate[]>([
    {
      id: 'ci-01',
      name: 'Aravind Swaminathan',
      college: 'PSG College of Technology',
      academicScore: 94,
      skillScore: 98,
      assessmentScore: 94,
      totalScore: 95.3,
      recommendation: 'STRONG_MATCH',
    },
    {
      id: 'ci-02',
      name: 'Divya Ramesh',
      college: 'College of Engineering, Guindy',
      academicScore: 92,
      skillScore: 96,
      assessmentScore: 96,
      totalScore: 94.6,
      recommendation: 'STRONG_MATCH',
    },
    {
      id: 'ci-03',
      name: 'Sneha Sundaram',
      college: 'Thiagarajar College of Engineering',
      academicScore: 93,
      skillScore: 94,
      assessmentScore: 93,
      totalScore: 93.3,
      recommendation: 'STRONG_MATCH',
    },
    {
      id: 'ci-04',
      name: 'Pooja Narayanan',
      college: 'Sri Sivasubramaniya Nadar College',
      academicScore: 91,
      skillScore: 92,
      assessmentScore: 91,
      totalScore: 91.3,
      recommendation: 'GOOD_MATCH',
    },
    {
      id: 'ci-05',
      name: 'Karthik Subramanian',
      college: 'Vellore Institute of Technology',
      academicScore: 88,
      skillScore: 90,
      assessmentScore: 88,
      totalScore: 88.6,
      recommendation: 'GOOD_MATCH',
    },
    {
      id: 'ci-06',
      name: 'Rahul Venkat',
      college: 'Amrita Vishwa Vidyapeetham',
      academicScore: 86,
      skillScore: 88,
      assessmentScore: 84,
      totalScore: 86.0,
      recommendation: 'MODERATE',
    },
  ]);

  const [sortBy, setSortBy] = useState<'total' | 'skill' | 'academic' | 'assessment'>('total');
  const [searchQuery, setSearchQuery] = useState('');
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set(['ci-01', 'ci-02']));

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

  const toggleShortlist = (id: string) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

      {/* 4 Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Intelligence Model</span>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>Multi-Vector v3.4</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Top Ranked Scholars</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {candidates.filter((c) => c.recommendation === 'STRONG_MATCH').length} Strong Match
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Talent Index</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>91.5 / 100</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Shortlisted</span>
          <span className={styles.statValue} style={{ color: '#7c3aed' }}>{shortlisted.size} Candidates</span>
        </div>
      </div>

      {/* Controls */}
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

      {/* Candidates Table Card */}
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
    </div>
  );
}
