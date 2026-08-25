import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './AssessmentPage.module.css';

export function AssessmentBuilderPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [form, setForm] = useState({ title: '', description: '', durationMinutes: 60, totalQuestions: 20, passingScore: 60, coinCost: 500, adaptiveEnabled: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get<any[]>('/assessment-builder/assessments').then(setAssessments).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      const assessment = await api.post('/assessment-builder/assessments', form);
      setAssessments([assessment, ...assessments]);
      setForm({ title: '', description: '', durationMinutes: 60, totalQuestions: 20, passingScore: 60, coinCost: 500, adaptiveEnabled: false });
      setView('list');
    } catch {}
  };

  const publish = async (id: string) => {
    try {
      await api.post(`/assessment-builder/assessments/${id}/publish`);
      setAssessments(assessments.map(a => a.id === id ? { ...a, status: 'PUBLISHED' } : a));
    } catch {}
  };

  if (loading) return <div className={styles.container}><div className={styles.loading}>Loading assessments...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Assessment Builder</h1>
          <p className={styles.subtitle}>Create and manage assessments for your opportunities</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setView(view === 'form' ? 'list' : 'form')}>
          {view === 'form' ? '← Back' : '+ New Assessment'}
        </button>
      </div>

      {view === 'form' && (
        <div className={styles.formCard}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title *</label>
            <input className={styles.formInput} placeholder="e.g. Software Engineer Assessment" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea className={styles.formTextarea} placeholder="Describe the assessment..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Duration (minutes)</label>
              <input className={styles.formInput} type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Total Questions</label>
              <input className={styles.formInput} type="number" value={form.totalQuestions} onChange={e => setForm({ ...form, totalQuestions: Number(e.target.value) })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Passing Score (%)</label>
              <input className={styles.formInput} type="number" value={form.passingScore} onChange={e => setForm({ ...form, passingScore: Number(e.target.value) })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Coin Cost</label>
              <input className={styles.formInput} type="number" value={form.coinCost} onChange={e => setForm({ ...form, coinCost: Number(e.target.value) })} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={form.adaptiveEnabled} onChange={e => setForm({ ...form, adaptiveEnabled: e.target.checked })} />
              Enable adaptive difficulty
            </label>
          </div>
          <button className={styles.primaryBtn} onClick={handleCreate} disabled={!form.title.trim()}>Create Assessment</button>
        </div>
      )}

      {view === 'list' && (
        <div className={styles.assessmentGrid}>
          {assessments.length === 0 ? (
            <div className={styles.empty}>No assessments yet. Create your first assessment!</div>
          ) : assessments.map(a => (
            <div className={styles.assessmentCard} key={a.id}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{a.title}</h3>
                <span className={`${styles.statusBadge} ${a.status === 'PUBLISHED' ? styles.statusPublished : styles.statusDraft}`}>{a.status}</span>
              </div>
              {a.description && <p className={styles.cardDesc}>{a.description}</p>}
              <div className={styles.cardMeta}>
                <span>⏱️ {a.durationMinutes}min</span>
                <span>📝 {a.totalQuestions} questions</span>
                <span>🎯 {a.passingScore}% to pass</span>
                <span>🪙 {a.coinCost} coins</span>
                {a.adaptiveEnabled && <span>🧠 Adaptive</span>}
              </div>
              <div className={styles.cardActions}>
                {a.status === 'DRAFT' && <button className={styles.primaryBtn} onClick={() => publish(a.id)}>Publish</button>}
                {a.status === 'PUBLISHED' && <span className={styles.publishedLabel}>✓ Published</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
