import { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  Check,
} from 'lucide-react';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

export function CandidateDiscoveryPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minCgpaFilter, setMinCgpaFilter] = useState<number>(0);
  const [shortlistedSet, setShortlistedSet] = useState<Set<string>>(new Set(['c-01', 'c-04']));

  const mockCandidates = [
    {
      id: 'c-01',
      name: 'Aravind Swaminathan',
      college: 'PSG College of Technology',
      degree: 'B.E Computer Science',
      batch: '2026',
      cgpa: 9.34,
      skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'React'],
      benchmarkScore: 94,
      skillMatch: 98,
      overallScore: 96,
      avatar: 'AS',
    },
    {
      id: 'c-02',
      name: 'Divya Ramesh',
      college: 'College of Engineering, Guindy',
      degree: 'B.Tech AI & Data Science',
      batch: '2026',
      cgpa: 9.18,
      skills: ['CUDA', 'PyTorch', 'C++', 'Linux', 'GPU Architecture'],
      benchmarkScore: 96,
      skillMatch: 95,
      overallScore: 95,
      avatar: 'DR',
    },
    {
      id: 'c-03',
      name: 'Karthik Subramanian',
      college: 'Vellore Institute of Technology',
      degree: 'B.Tech Information Technology',
      batch: '2026',
      cgpa: 8.82,
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
      benchmarkScore: 88,
      skillMatch: 92,
      overallScore: 90,
      avatar: 'KS',
    },
    {
      id: 'c-04',
      name: 'Pooja Narayanan',
      college: 'Sri Sivasubramaniya Nadar College',
      degree: 'B.E Electronics & Comm.',
      batch: '2026',
      cgpa: 9.05,
      skills: ['Network Security', 'Python', 'SIEM', 'OWASP', 'Linux'],
      benchmarkScore: 91,
      skillMatch: 94,
      overallScore: 92,
      avatar: 'PN',
    },
    {
      id: 'c-05',
      name: 'Rahul Venkat',
      college: 'Amrita Vishwa Vidyapeetham',
      degree: 'B.Tech Computer Science',
      batch: '2026',
      cgpa: 8.65,
      skills: ['PostgreSQL', 'Apache Spark', 'Python', 'ETL', 'Docker'],
      benchmarkScore: 84,
      skillMatch: 88,
      overallScore: 86,
      avatar: 'RV',
    },
    {
      id: 'c-06',
      name: 'Sneha Sundaram',
      college: 'Thiagarajar College of Engineering',
      degree: 'B.E Computer Science',
      batch: '2026',
      cgpa: 9.22,
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Tailwind'],
      benchmarkScore: 93,
      skillMatch: 96,
      overallScore: 94,
      avatar: 'SS',
    },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const res = await fetch('/api/v1/opportunities', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data) && data.data.length > 0) {
            setOpportunities(data.data);
            setSelectedOppId(data.data[0].id);
          }
        }
      } catch {
        /* fallback */
      }
    }
    loadData();
  }, []);

  const toggleShortlist = (id: string) => {
    setShortlistedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredCandidates = mockCandidates.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCgpa = c.cgpa >= minCgpaFilter;
    return matchesSearch && matchesCgpa;
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>AI Candidate Discovery &amp; Talent Search</h1>
          <p className={styles.subtitle}>
            Search across 100+ verified scholars with authenticated academic CGPAs, benchmark test scores, and AI skill matching
          </p>
        </div>
      </div>

      {/* 4 KPI Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Verified Candidate Pool</span>
          <span className={styles.statValue}>100+ Scholars</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Benchmark Score</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>89.2%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Shortlisted for Tech Rounds</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>{shortlistedSet.size} Candidates</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Integrity Verified</span>
          <span className={styles.statValue} style={{ color: '#854d0e' }}>100% Proctored</span>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className={styles.filterRow}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className={styles.searchInput}
              style={{ paddingLeft: '34px', minWidth: '280px' }}
              placeholder="Search by candidate name, skill, college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.searchInput}
            style={{ minWidth: '180px' }}
            value={minCgpaFilter}
            onChange={(e) => setMinCgpaFilter(Number(e.target.value))}
          >
            <option value="0">All CGPA Cutoffs</option>
            <option value="8.0">Min 8.0+ CGPA</option>
            <option value="8.5">Min 8.5+ CGPA</option>
            <option value="9.0">Min 9.0+ CGPA (Elite)</option>
          </select>
        </div>

        {opportunities.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Active Drive:</span>
            <select
              className={styles.searchInput}
              style={{ minWidth: '220px' }}
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
            >
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Candidates Grid */}
      <div className={styles.grid}>
        {filteredCandidates.map((cand) => {
          const isShortlisted = shortlistedSet.has(cand.id);
          return (
            <div key={cand.id} className={styles.card}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '38px', height: '38px', background: '#1c2d81', color: '#fed601', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.88rem' }}>
                      {cand.avatar}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        {cand.name}
                      </h3>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {cand.college} &middot; Class of {cand.batch}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                    {cand.skillMatch}% Match
                  </span>
                </div>

                {/* Score Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', margin: '10px 0', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>CGPA</span>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>{cand.cgpa}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Test Score</span>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#15803d' }}>{cand.benchmarkScore}%</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>AI Match</span>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0284c7' }}>{cand.overallScore}%</div>
                  </div>
                </div>

                {/* Skills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {cand.skills.map((s, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  style={{
                    height: '36px',
                    width: '100%',
                    background: isShortlisted ? '#f0fdf4' : '#1c2d81',
                    color: isShortlisted ? '#15803d' : '#ffffff',
                    border: `1px solid ${isShortlisted ? '#bbf7d0' : '#1c2d81'}`,
                    padding: '0 16px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  onClick={() => toggleShortlist(cand.id)}
                >
                  {isShortlisted ? (
                    <>
                      <Check size={14} />
                      <span>Shortlisted for Interview</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={14} />
                      <span>Shortlist Candidate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
