import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Collaboration.module.css';

interface ResearchProposal {
  id: string;
  title: string;
  description?: string;
  domain?: string;
  requiredSkills?: string;
  expectedOutcome?: string;
  durationWeeks?: number;
  budgetAmount?: number;
  maxParticipants: number;
  status: string;
}

export function ResearchPage() {
  const [proposals, setProposals] = useState<ResearchProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const p = await api.get<ResearchProposal[]>('/research');
        setProposals(p);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleJoin(proposalId: string) {
    try {
      await api.post(`/research/${proposalId}/join`, { role: 'RESEARCHER' });
    } catch { /* */ }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2].map(i => <div key={i} className={styles.skeleton} style={{ height: 120 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Research & Consultancy</h1>
      </div>

      {proposals.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔬</div>
          <h3 className={styles.emptyTitle}>No research proposals</h3>
          <p className={styles.emptyText}>Institutions and faculty post research and consultancy projects here.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {proposals.map(p => (
            <div key={p.id} className={styles.postCard}>
              <div className={styles.postHeader}>
                <div>
                  <h3 className={styles.postTitle}>🔬 {p.title}</h3>
                  <span className={styles.postMeta}>{p.domain || 'Research'} · {p.durationWeeks || '?'} weeks</span>
                </div>
                <span className={styles.tagBadge}>{p.status}</span>
              </div>
              {p.description && <p className={styles.postContent}>{p.description}</p>}
              {p.expectedOutcome && <p className={styles.postContent}>Expected: {p.expectedOutcome}</p>}
              <div className={styles.postMeta}>
                {p.budgetAmount && <span>💰 Budget: ₹{p.budgetAmount.toLocaleString()}</span>}
                <span>👥 Max {p.maxParticipants} participants</span>
              </div>
              {p.requiredSkills && (
                <div className={styles.tagsRow}>
                  {p.requiredSkills.split(',').map(s => (
                    <span key={s.trim()} className={styles.tagBadge}>{s.trim()}</span>
                  ))}
                </div>
              )}
              {p.status === 'PUBLISHED' && (
                <button className={styles.followBtn} onClick={() => handleJoin(p.id)}>Join Research</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
