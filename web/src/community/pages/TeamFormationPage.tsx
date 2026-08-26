import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Community.module.css';

export function TeamFormationPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', maxMembers: '4', lookingFor: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teams/open').then((r: any) => setTeams(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createTeam = async () => {
    await api.post('/teams', { projectId: '00000000-0000-0000-0000-000000000000', ...form, maxMembers: parseInt(form.maxMembers) });
    setShowForm(false);
    setForm({ name: '', description: '', maxMembers: '4', lookingFor: '' });
    const r: any = await api.get('/teams/open');
    setTeams(Array.isArray(r) ? r : []);
  };

  const joinTeam = async (teamId: string) => {
    await api.post(`/teams/${teamId}/join`, {});
    const r: any = await api.get('/teams/open');
    setTeams(Array.isArray(r) ? r : []);
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading teams...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Team Formation</h1>
        <p className={styles.subtitle}>Find teammates for projects and challenges</p>
      </div>

      <button className={styles.composeBtn} onClick={() => setShowForm(true)} style={{ marginBottom: '1.5rem' }}>+ Create Team</button>

      {showForm && (
        <div className={styles.postCard} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Create a Team</h3>
          <input className={styles.searchInput} placeholder="Team name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', marginBottom: '0.75rem' }} />
          <textarea className={styles.composeInput} placeholder="Description & what you're looking for" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ width: '100%', marginBottom: '0.75rem' }} />
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <input className={styles.searchInput} type="number" placeholder="Max members" value={form.maxMembers} onChange={e => setForm({ ...form, maxMembers: e.target.value })} style={{ width: 120 }} />
            <input className={styles.searchInput} placeholder="Looking for (e.g., Frontend, ML)" value={form.lookingFor} onChange={e => setForm({ ...form, lookingFor: e.target.value })} style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={styles.composeBtn} onClick={createTeam}>Create</button>
            <button className={styles.actionBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {teams.length > 0 ? (
        <div className={styles.postList}>
          {teams.map(t => (
            <div className={styles.postCard} key={t.id}>
              <div className={styles.postHeader}>
                <span className={styles.postType}>TEAM</span>
                <span className={styles.postTime}>{t.currentMembers}/{t.maxMembers} members</span>
              </div>
              <div className={styles.postTitle}>{t.name}</div>
              {t.description && <div className={styles.postContent}>{t.description}</div>}
              {t.lookingFor && <div className={styles.postContent}>Looking for: {t.lookingFor}</div>}
              <div className={styles.postActions}>
                <button className={styles.actionBtn} onClick={() => joinTeam(t.id)}>Join Team</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No open teams. Create one to get started!</div>
      )}
    </div>
  );
}
