import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import styles from './Intelligence.module.css';

const ROUND_TYPES = ['TECHNICAL', 'HR', 'GROUP_DISCUSSION', 'CASE_STUDY', 'CODING', 'PRESENTATION', 'F2F'];

export function InterviewManagementPage() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [opportunityId, setOpportunityId] = useState('');
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newRound, setNewRound] = useState({ name: '', roundType: 'TECHNICAL', durationMinutes: 60, maxScore: 100, description: '', isEliminative: true });
  const [scorecard, setScorecard] = useState({ scores: '{}', strengths: '', weaknesses: '', notes: '', recommendation: 'HIRE' });
  const [message, setMessage] = useState('');

  const loadRounds = async () => {
    if (!opportunityId) return;
    setLoading(true);
    try {
      const data = await intelligenceApi.getInterviewRounds(opportunityId);
      setRounds(data);
    } catch { setRounds([]); }
    setLoading(false);
  };

  useEffect(() => { if (opportunityId) loadRounds(); }, [opportunityId]);

  const createRound = async () => {
    if (!opportunityId || !newRound.name) return;
    try {
      await intelligenceApi.createInterviewRound({ ...newRound, opportunityId, sortOrder: rounds.length });
      setShowCreate(false);
      setNewRound({ name: '', roundType: 'TECHNICAL', durationMinutes: 60, maxScore: 100, description: '', isEliminative: true });
      setMessage('Round created successfully');
      loadRounds();
    } catch { setMessage('Failed to create round'); }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Interview Management</h1>
        <p className={styles.subtitle}>Configure interview rounds, schedule interviews, and submit scorecards</p>
      </div>

      {message && <div className={styles.toast}>{message}</div>}

      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Enter Opportunity ID..."
          value={opportunityId}
          onChange={e => setOpportunityId(e.target.value)}
        />
        <button className={styles.filterBtn} onClick={loadRounds}>Load Rounds</button>
        {opportunityId && (
          <button className={styles.filterBtn} style={{ background: '#6366f1', color: '#fff' }} onClick={() => setShowCreate(true)}>
            + New Round
          </button>
        )}
      </div>

      {showCreate && (
        <div className={styles.modal}>
          <h3 className={styles.modalTitle}>Create Interview Round</h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Round Name</label>
            <input className={styles.input} value={newRound.name} onChange={e => setNewRound({ ...newRound, name: e.target.value })} placeholder="e.g., Technical Round 1" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Type</label>
              <select className={styles.input} value={newRound.roundType} onChange={e => setNewRound({ ...newRound, roundType: e.target.value })}>
                {ROUND_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Duration (min)</label>
              <input className={styles.input} type="number" value={newRound.durationMinutes} onChange={e => setNewRound({ ...newRound, durationMinutes: +e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Max Score</label>
              <input className={styles.input} type="number" value={newRound.maxScore} onChange={e => setNewRound({ ...newRound, maxScore: +e.target.value })} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea className={styles.textarea} value={newRound.description} onChange={e => setNewRound({ ...newRound, description: e.target.value })} rows={2} />
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setShowCreate(false)}>Cancel</button>
            <button className={styles.startBtn} onClick={createRound}>Create</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>Loading rounds...</div>
      ) : rounds.length === 0 ? (
        <div className={styles.empty}>{opportunityId ? 'No interview rounds configured yet.' : 'Enter an opportunity ID to begin.'}</div>
      ) : (
        <div className={styles.roundGrid}>
          {rounds.map((r: any, idx: number) => (
            <div className={`${styles.roundCard} ${selectedRound === r.id ? styles.roundActive : ''}`} key={r.id} onClick={() => setSelectedRound(r.id)}>
              <div className={styles.roundNumber}>Round {idx + 1}</div>
              <div className={styles.roundName}>{r.name}</div>
              <div className={styles.roundType}>{r.roundType?.replace('_', ' ')}</div>
              <div className={styles.roundMeta}>
                <span>⏱ {r.durationMinutes}min</span>
                <span>📊 {r.maxScore}pts</span>
                {r.eliminative !== false && <span className={styles.elimTag}>Eliminative</span>}
              </div>
              {r.description && <div className={styles.roundDesc}>{r.description}</div>}
            </div>
          ))}
        </div>
      )}

      {selectedRound && (
        <div className={styles.roundDetail}>
          <h3 className={styles.sectionTitle}>Scorecard Template</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Recommendation</label>
              <select className={styles.input} value={scorecard.recommendation} onChange={e => setScorecard({ ...scorecard, recommendation: e.target.value })}>
                {['STRONG_HIRE', 'HIRE', 'MAYBE', 'NO_HIRE', 'STRONG_NO_HIRE'].map(r => (
                  <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Strengths</label>
              <textarea className={styles.textarea} value={scorecard.strengths} onChange={e => setScorecard({ ...scorecard, strengths: e.target.value })} rows={3} placeholder="Candidate strengths..." />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Weaknesses</label>
              <textarea className={styles.textarea} value={scorecard.weaknesses} onChange={e => setScorecard({ ...scorecard, weaknesses: e.target.value })} rows={3} placeholder="Areas for improvement..." />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Notes</label>
            <textarea className={styles.textarea} value={scorecard.notes} onChange={e => setScorecard({ ...scorecard, notes: e.target.value })} rows={2} />
          </div>
        </div>
      )}
    </div>
  );
}
