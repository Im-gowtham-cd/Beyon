import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { MatchingScore } from '../types/intelligence';
import styles from './Intelligence.module.css';

export function CandidateIntelligencePage() {
  const [candidates, setCandidates] = useState<MatchingScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [opportunityId, setOpportunityId] = useState('');
  const [opportunitySearch, setOpportunitySearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'total' | 'skill' | 'academic' | 'assessment'>('total');
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());

  const loadCandidates = async () => {
    if (!opportunityId) return;
    setLoading(true);
    try {
      const data = await intelligenceApi.getRankedCandidates(opportunityId);
      setCandidates(data);
    } catch {
      setCandidates([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (opportunityId) loadCandidates();
  }, [opportunityId]);

  const sorted = [...candidates].sort((a, b) => {
    switch (sortBy) {
      case 'skill': return b.skillScore - a.skillScore;
      case 'academic': return b.academicScore - a.academicScore;
      case 'assessment': return b.assessmentScore - a.assessmentScore;
      default: return b.totalScore - a.totalScore;
    }
  }).filter(c => {
    if (!searchTerm) return true;
    return c.studentId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleShortlist = (id: string) => {
    setShortlisted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setRejected(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const toggleReject = (id: string) => {
    setRejected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setShortlisted(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const matchColor = (score: number) =>
    score >= 90 ? '#16a34a' : score >= 70 ? '#2563eb' : score >= 50 ? '#ca8a04' : '#dc2626';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Candidate Intelligence</h1>
        <p className={styles.subtitle}>Search, filter, and rank candidates for your opportunities</p>
      </div>

      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Enter Opportunity ID to search candidates..."
          value={opportunitySearch}
          onChange={e => setOpportunitySearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && opportunitySearch) setOpportunityId(opportunitySearch); }}
        />
        <button className={styles.filterBtn} onClick={() => opportunitySearch && setOpportunityId(opportunitySearch)}>
          Search
        </button>
      </div>

      {opportunityId && (
        <>
          <div className={styles.toolbar}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Filter candidates..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ maxWidth: 300 }}
            />
            <div className={styles.filterRow}>
              {(['total', 'skill', 'academic', 'assessment'] as const).map(s => (
                <button
                  key={s}
                  className={`${styles.filterBtn} ${sortBy === s ? styles.filterActive : ''}`}
                  onClick={() => setSortBy(s)}
                >
                  {s === 'total' ? 'Overall' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{candidates.length}</div>
              <div className={styles.statLabel}>Total Candidates</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{shortlisted.size}</div>
              <div className={styles.statLabel}>Shortlisted</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{rejected.size}</div>
              <div className={styles.statLabel}>Rejected</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {candidates.length > 0
                  ? Math.round(candidates.reduce((sum, c) => sum + c.totalScore, 0) / candidates.length)
                  : 0}%
              </div>
              <div className={styles.statLabel}>Avg Match</div>
            </div>
          </div>

          {loading ? (
            <div className={styles.empty}>Loading candidates...</div>
          ) : sorted.length === 0 ? (
            <div className={styles.empty}>No candidates found for this opportunity.</div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span style={{ flex: 1 }}>Candidate</span>
                <span style={{ width: 80, textAlign: 'center' }}>Match</span>
                <span style={{ width: 80, textAlign: 'center' }}>Skills</span>
                <span style={{ width: 80, textAlign: 'center' }}>Academic</span>
                <span style={{ width: 80, textAlign: 'center' }}>Assessment</span>
                <span style={{ width: 80, textAlign: 'center' }}>Experience</span>
                <span style={{ width: 140, textAlign: 'center' }}>Actions</span>
              </div>
              {sorted.map((c, idx) => (
                <div className={`${styles.tableRow} ${shortlisted.has(c.studentId) ? styles.rowShortlisted : rejected.has(c.studentId) ? styles.rowRejected : ''}`} key={c.studentId}>
                  <span style={{ flex: 1, fontWeight: 500 }}>Student #{idx + 1}</span>
                  <span style={{ width: 80, textAlign: 'center' }}>
                    <span style={{ color: matchColor(c.totalScore), fontWeight: 700 }}>{c.totalScore}%</span>
                  </span>
                  <span style={{ width: 80, textAlign: 'center' }}>{c.skillScore}%</span>
                  <span style={{ width: 80, textAlign: 'center' }}>{c.academicScore}%</span>
                  <span style={{ width: 80, textAlign: 'center' }}>{c.assessmentScore}%</span>
                  <span style={{ width: 80, textAlign: 'center' }}>{c.experienceScore}%</span>
                  <span style={{ width: 140, textAlign: 'center', display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button
                      className={`${styles.actionBtn} ${styles.shortlistBtn} ${shortlisted.has(c.studentId) ? styles.shortlistActive : ''}`}
                      onClick={() => toggleShortlist(c.studentId)}
                    >
                      {shortlisted.has(c.studentId) ? '✓ Shortlisted' : 'Shortlist'}
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.rejectBtn} ${rejected.has(c.studentId) ? styles.rejectActive : ''}`}
                      onClick={() => toggleReject(c.studentId)}
                    >
                      {rejected.has(c.studentId) ? 'Rejected' : 'Reject'}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
