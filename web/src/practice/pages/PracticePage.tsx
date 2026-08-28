import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { practiceApi, questionApi } from '../services/practiceApi';
import type { Question } from '../types/practice';
import { PlusCircle, ArrowRight } from 'lucide-react';
import styles from './PracticePages.module.css';

export function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [q, s] = await Promise.all([
        practiceApi.getQuestions(difficulty ? { difficulty } : undefined),
        questionApi.getStats(),
      ]);
      setQuestions(q);
      setStats({ total: s.total || 0, easy: s.easy || 0, medium: s.medium || 0, hard: s.hard || 0 });
    } catch { /* fallback */ }
    setLoading(false);
  }, [difficulty]);

  useEffect(() => { load(); }, [load]);

  const diffColors: Record<string, string> = {
    EASY: '#16a34a',
    MEDIUM: '#d97706',
    HARD: '#dc2626',
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className={styles.title} style={{ margin: 0 }}>Practice Arena</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px', fontWeight: 400 }}>
            Solve multiple-choice, SQL, and coding challenges across domain topics.
          </p>
        </div>
        <Link
          to="/practice/create"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #1c2d81 0%, #253cac 100%)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '0px',
            fontWeight: 600,
            fontSize: '0.84rem',
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(28, 45, 129, 0.2)',
          }}
        >
          <PlusCircle size={16} />
          <span>Create New Question</span>
        </Link>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Questions</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Easy</span>
          <span className={styles.statValue} style={{ color: diffColors.EASY }}>{stats.easy}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Medium</span>
          <span className={styles.statValue} style={{ color: diffColors.MEDIUM }}>{stats.medium}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Hard</span>
          <span className={styles.statValue} style={{ color: diffColors.HARD }}>{stats.hard}</span>
        </div>
      </div>

      <div className={styles.filters}>
        {['', 'EASY', 'MEDIUM', 'HARD'].map(d => (
          <button
            key={d}
            className={`${styles.filterChip} ${difficulty === d ? styles.filterActive : ''}`}
            onClick={() => setDifficulty(d)}
          >
            {d || 'All Difficulties'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 60, borderRadius: '0px' }} />)}
        </div>
      ) : questions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No questions available yet. Click &quot;Create New Question&quot; to author one.</p>
        </div>
      ) : (
        <div className={styles.questionList}>
          {questions.map(q => (
            <Link key={q.id} to={`/practice/${q.id}`} className={styles.questionCard}>
              <div className={styles.questionInfo}>
                <h3 className={styles.questionTitle}>{q.title}</h3>
                <div className={styles.questionMeta}>
                  <span className={styles.diffBadge} style={{ color: diffColors[q.difficulty] || '#0f172a' }}>
                    {q.difficulty}
                  </span>
                  <span className={styles.typeBadge}>{q.questionType.replace('_', ' ')}</span>
                </div>
              </div>
              <span className={styles.arrow}>
                <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
