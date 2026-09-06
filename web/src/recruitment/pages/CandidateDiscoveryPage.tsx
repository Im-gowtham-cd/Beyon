import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserCheck,
  Check,
  Building2,
  ShieldCheck,
  Clock,
  MessageSquare,
} from 'lucide-react';
import styles from './CandidateDiscoveryPage.module.css';

interface CandidateProfile {
  id: string;
  studentId: string;
  name: string;
  email?: string;
  college: string;
  degree: string;
  department: string;
  batch?: string;
  cgpa: number;
  skills: string[];
  benchmarkScore: number | null;
  applicationId?: string;
  applicationStatus?: string;
  appliedOpportunityId?: string;
}

export function CandidateDiscoveryPage() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minCgpaFilter, setMinCgpaFilter] = useState<number>(0);
  const [shortlistedSet, setShortlistedSet] = useState<Set<string>>(new Set());
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [oppsRes, candRes, appsRes] = await Promise.all([
          fetch('/api/v1/opportunities', { headers }).catch(() => null),
          fetch('/api/v1/recruitment/candidates', { headers }).catch(() => null),
          fetch('/api/v1/recruitment/applications', { headers }).catch(() => null),
        ]);

        if (oppsRes && oppsRes.ok) {
          const data = await oppsRes.json();
          if (Array.isArray(data.data) && data.data.length > 0) {
            setOpportunities(data.data);
            setSelectedOppId(data.data[0].id);
          }
        }

        let fetchedCandidates: CandidateProfile[] = [];

        if (candRes && candRes.ok) {
          const cData = await candRes.json();
          if (Array.isArray(cData.data) && cData.data.length > 0) {
            fetchedCandidates = cData.data.map((c: any) => ({
              id: c.id || c.studentId,
              studentId: c.studentId || c.id,
              name: c.studentName || c.name || 'Verified Candidate',
              email: c.studentEmail || c.email,
              college: c.institutionName || c.college || 'Partner Institution',
              degree: c.degree || 'Degree Pending',
              department: c.department || 'General',
              batch: c.batch,
              cgpa: Number(c.cgpa) || 0,
              skills: Array.isArray(c.skills) ? c.skills : [],
              benchmarkScore: c.assessmentScore != null ? Number(c.assessmentScore) : null,
              applicationId: c.applicationId,
              applicationStatus: c.applicationStatus,
              appliedOpportunityId: c.appliedOpportunityId,
            }));
          }
        }

        if (fetchedCandidates.length === 0 && appsRes && appsRes.ok) {
          const appData = await appsRes.json();
          if (Array.isArray(appData.data) && appData.data.length > 0) {
            fetchedCandidates = appData.data.map((app: any) => ({
              id: app.id || app.studentId,
              studentId: app.studentId,
              name: app.studentName || app.name || 'Verified Candidate',
              email: app.studentEmail || app.email,
              college: app.institutionName || app.college || 'Partner Institution',
              degree: app.degree || 'Undergraduate',
              department: app.department || 'Computer Science',
              batch: app.batch,
              cgpa: Number(app.cgpa) || 0,
              skills: Array.isArray(app.skills) ? app.skills : [],
              benchmarkScore: app.assessmentScore != null ? Number(app.assessmentScore) : null,
              applicationId: app.id,
              applicationStatus: app.status,
              appliedOpportunityId: app.opportunityId,
            }));
          }
        }

        setCandidates(fetchedCandidates);

        const initialShortlisted = new Set<string>();
        fetchedCandidates.forEach((c) => {
          if (c.applicationStatus === 'SHORTLISTED') {
            initialShortlisted.add(c.id);
          }
        });
        setShortlistedSet(initialShortlisted);
      } catch {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleShortlist = async (candidate: CandidateProfile) => {
    const isCurrentlyShortlisted = shortlistedSet.has(candidate.id);
    const nextSet = new Set(shortlistedSet);

    if (isCurrentlyShortlisted) {
      nextSet.delete(candidate.id);
    } else {
      nextSet.add(candidate.id);
    }
    setShortlistedSet(nextSet);

    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const oppId = selectedOppId || (opportunities.length > 0 ? opportunities[0].id : null);

      if (oppId && token) {
        await fetch('/api/v1/recruitment/shortlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: candidate.studentId,
            opportunityId: oppId,
          }),
        });
      }
    } catch {

    }
  };

  const handleContactCandidate = (candidate: CandidateProfile) => {
    const targetId = candidate.studentId || candidate.id;
    const nameParam = encodeURIComponent(candidate.name || 'Candidate');
    const emailParam = encodeURIComponent(candidate.email || '');
    navigate(`/company/messages?recipientId=${targetId}&name=${nameParam}&email=${emailParam}`);
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCgpa = c.cgpa >= minCgpaFilter;
    return matchesSearch && matchesCgpa;
  });

  const validCgpaCandidates = candidates.filter((c) => c.cgpa > 0);
  const avgCgpa =
    validCgpaCandidates.length > 0
      ? (validCgpaCandidates.reduce((acc, c) => acc + c.cgpa, 0) / validCgpaCandidates.length).toFixed(2)
      : '0.00';

  const scoredCandidates = candidates.filter((c) => c.benchmarkScore !== null);
  const avgBenchmark =
    scoredCandidates.length > 0
      ? (scoredCandidates.reduce((acc, c) => acc + (c.benchmarkScore || 0), 0) / scoredCandidates.length).toFixed(1) + '%'
      : 'Pending';

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.portalBadge}>AI Candidate Discovery</span>
            <span className={styles.verifiedBadge}>
              <ShieldCheck size={12} />
              <span>Verified Partner Campuses</span>
            </span>
          </div>
          <h1 className={styles.title}>AI Candidate Discovery &amp; Talent Search</h1>
          <p className={styles.subtitle}>
            Explore and shortlist verified scholars with verified academic CGPAs, proctored assessments, and verified skills
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Verified Candidate Pool</span>
          <span className={styles.statValue}>{candidates.length} Candidates</span>
          <span className={styles.statSub}>Scholars in partner network</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average Academic CGPA</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {avgCgpa}
          </span>
          <span className={styles.statSub}>Across registered candidates</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Assessment Benchmark</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {avgBenchmark}
          </span>
          <span className={styles.statSub}>Proctored technical tests</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Shortlisted for Tech Rounds</span>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>
            {shortlistedSet.size} Selected
          </span>
          <span className={styles.statSub}>Synchronized to pipeline</span>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.filterGroup}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by candidate name, skill, college, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.selectInput}
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
          >
            <option value="">Target All Active Openings</option>
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title} ({opp.opportunityType?.replace('_', ' ') || 'CAMPUS DRIVE'})
              </option>
            ))}
          </select>

          <select
            className={styles.selectInput}
            value={minCgpaFilter}
            onChange={(e) => setMinCgpaFilter(Number(e.target.value))}
          >
            <option value={0}>All Academic CGPA Ranges</option>
            <option value={7.0}>Min 7.0+ CGPA</option>
            <option value={7.5}>Min 7.5+ CGPA</option>
            <option value={8.0}>Min 8.0+ CGPA</option>
            <option value={8.5}>Min 8.5+ CGPA (High Honor)</option>
          </select>
        </div>

        <span className={styles.resultsCount}>
          {filteredCandidates.length} Candidates Available
        </span>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <Clock size={32} style={{ color: '#1c2d81', animation: 'spin 2s linear infinite' }} />
          <p className={styles.emptySub}>Loading verified candidate directory...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className={styles.emptyState}>
          <UserCheck size={40} style={{ color: '#cbd5e1' }} />
          <h3 className={styles.emptyTitle}>No candidates matched your search criteria</h3>
          <p className={styles.emptySub}>
            Try adjusting your CGPA or keyword filters to browse more verified scholars from our academic network.
          </p>
        </div>
      ) : (
        <div className={styles.candidateGrid}>
          {filteredCandidates.map((c) => {
            const isShortlisted = shortlistedSet.has(c.id);
            return (
              <div
                key={c.id}
                className={`${styles.candidateCard} ${isShortlisted ? styles.candidateCardShortlisted : ''}`}
              >

                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.nameGroup}>
                    <h3 className={styles.candidateName}>{c.name}</h3>
                    <div className={styles.institutionRow}>
                      <Building2 size={12} style={{ color: '#1c2d81', flexShrink: 0 }} />
                      <span>{c.college}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.deptInfo}>
                  <span>{c.degree} · {c.department}</span>
                  {c.batch && <span>Batch {c.batch}</span>}
                </div>

                <div className={styles.metricRow}>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Academic CGPA</span>
                    <span className={styles.metricVal}>
                      {c.cgpa > 0 ? (
                        <span style={{ color: '#0f172a' }}>{c.cgpa}</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>N/A</span>
                      )}
                    </span>
                  </div>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Assessment</span>
                    <span className={styles.metricVal}>
                      {c.benchmarkScore != null ? (
                        <span style={{ color: '#15803d' }}>{c.benchmarkScore}%</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Pending</span>
                      )}
                    </span>
                  </div>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Status</span>
                    <span className={styles.metricVal} style={{ fontSize: '0.78rem', color: isShortlisted ? '#15803d' : '#64748b' }}>
                      {isShortlisted ? 'Shortlisted' : 'Available'}
                    </span>
                  </div>
                </div>

                <div className={styles.skillsContainer}>
                  <span className={styles.skillsLabel}>Verified Technical Skills</span>
                  <div className={styles.skillsList}>
                    {c.skills.length > 0 ? (
                      c.skills.map((s, idx) => (
                        <span key={idx} className={styles.skillBadge}>
                          {s.replace('SKILL_', '')}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Profile skills under verification
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={`${styles.btnShortlist} ${isShortlisted ? styles.btnShortlistedActive : ''}`}
                    onClick={() => toggleShortlist(c)}
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

                  <button
                    type="button"
                    className={styles.btnContact}
                    onClick={() => handleContactCandidate(c)}
                    title={`Open direct chat with ${c.name}`}
                  >
                    <MessageSquare size={14} />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

