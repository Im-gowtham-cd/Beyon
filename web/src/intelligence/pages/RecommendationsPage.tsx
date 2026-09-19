import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api/client';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Flame,
  Award,
  Layers,
  RefreshCw,
} from 'lucide-react';
import styles from './Intelligence.module.css';

const TYPE_CONFIG: Record<string, { icon: any; label: string; actionLabel: string; link: string; color: string }> = {
  PRACTICE: { icon: Flame, label: 'Daily Practice', actionLabel: 'Solve Challenge', link: '/daily-challenge', color: '#f59e0b' },
  ASSESSMENT: { icon: Award, label: 'AI Benchmark', actionLabel: 'Take Assessment', link: '/assessment', color: '#3b82f6' },
  COURSE: { icon: BookOpen, label: 'Skill to Master', actionLabel: 'Explore Track', link: '/career-roadmap', color: '#10b981' },
  CERTIFICATION: { icon: Award, label: 'Certification', actionLabel: 'Verify Skill', link: '/certificates', color: '#8b5cf6' },
  PROJECT: { icon: Layers, label: 'Learning Program', actionLabel: 'Start Track', link: '/learning-programs', color: '#ec4899' },
};

export function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'COURSE' | 'PRACTICE' | 'ASSESSMENT' | 'PROJECT'>('ALL');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadRecs(); }, []);

  const loadRecs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recommendations');
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setRecommendations(list);
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/recommendations/generate');
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setRecommendations(list);
    } catch {}
    finally {
      setGenerating(false);
    }
  };

  const markDone = async (id: string, skillName?: string, recType?: string) => {
    try {
      await api.post(`/recommendations/${id}/complete`);
      api.post('/telemetry/feedback', {
        recommendationId: id,
        skillName: skillName || 'Skill',
        recommendationType: recType || 'COURSE',
        feedbackAction: 'COMPLETED'
      }).catch(() => {});
      setRecommendations(recommendations.map(r => r.id === id ? { ...r, status: 'COMPLETED' } : r));
    } catch {}
  };

  const filtered = recommendations.filter(r => filter === 'ALL' || r.recommendationType === filter);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' }}>
          <RefreshCw className={styles.spin} size={28} color="#1c2d81" />
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Analyzing technical profile &amp; generating customized learning milestones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '0px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
            <Sparkles size={14} /> AI Profile Intelligence Engine • Anti-Popular Filter Active
          </div>
          <h1 className={styles.title}>Personalized Learning &amp; Skill Recommendations</h1>
          <p className={styles.subtitle}>
            Calculated strictly from your verified skill gaps, career requirements, and industry benchmarks. Zero generic course spam.
          </p>
        </div>
        <button className={styles.createBtn} onClick={generate} disabled={generating} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '0px' }}>
          <RefreshCw size={15} className={generating ? styles.spin : ''} />
          {generating ? 'Analyzing Profile...' : 'Refresh Suggestions'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: '20px 0', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'All Recommendations' },
          { key: 'COURSE', label: 'Skills to Master' },
          { key: 'PRACTICE', label: 'Daily Challenges' },
          { key: 'PROJECT', label: 'Learning Tracks' },
          { key: 'ASSESSMENT', label: 'AI Benchmarks' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filter === t.key ? '#1c2d81' : '#f1f5f9',
              color: filter === t.key ? '#ffffff' : '#475569',
              border: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <BrainCircuit size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <div className={styles.emptyTitle}>No matching recommendations found</div>
          <div className={styles.emptyDesc}>Click below to re-evaluate your target roles and technical skills.</div>
          <button className={styles.createBtn} onClick={generate} disabled={generating} style={{ marginTop: '16px' }}>
            Generate Recommendations
          </button>
        </div>
      ) : (
        <div className={styles.recommendationList}>
          {filtered.map((rec, i) => {
            const conf = TYPE_CONFIG[rec.recommendationType] || TYPE_CONFIG.PRACTICE;
            const Icon = conf.icon;
            const isDone = rec.status === 'COMPLETED';

            return (
              <div className={`${styles.recommendationCard} ${isDone ? styles.recCompleted : ''}`} key={rec.id || i}>
                <div className={styles.recRank} style={{ background: isDone ? '#e2e8f0' : '#f0f4ff', color: isDone ? '#94a3b8' : '#1c2d81' }}>
                  #{i + 1}
                </div>
                <div className={styles.recContent}>
                  <div className={styles.recHeader}>
                    <span className={styles.recType} style={{ color: conf.color, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Icon size={14} /> {conf.label}
                    </span>
                    <span className={styles.recScore} style={{ background: '#f8fafc', padding: '2px 8px', borderRadius: '0px', border: '1px solid #e2e8f0' }}>
                      {Math.round(Number(rec.score))}% Alignment
                    </span>
                  </div>
                  <div className={styles.recSkill}>{rec.skillName}</div>
                  {rec.reason && <div className={styles.recReason}>{rec.reason}</div>}

                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link
                      to={conf.link}
                      onClick={() => {
                        api.post('/telemetry/feedback', {
                          recommendationId: rec.id,
                          skillName: rec.skillName,
                          recommendationType: rec.recommendationType,
                          feedbackAction: 'CLICKED'
                        }).catch(() => {});
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        background: '#1c2d81',
                        color: '#ffffff',
                        borderRadius: '0px',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      {conf.actionLabel} <ArrowRight size={13} />
                    </Link>

                    {!isDone && (
                      <button
                        className={styles.recAction}
                        onClick={() => {
                          api.post('/telemetry/feedback', {
                            recommendationId: rec.id,
                            skillName: rec.skillName,
                            recommendationType: rec.recommendationType,
                            feedbackAction: 'DISMISSED'
                          }).catch(() => {});
                          markDone(rec.id, rec.skillName, rec.recommendationType);
                        }}
                        style={{ background: 'transparent', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '0px' }}
                      >
                        Dismiss
                      </button>
                    )}

                    {isDone && (
                      <span className={styles.recDoneBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

