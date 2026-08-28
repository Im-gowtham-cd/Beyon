import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dailyChallengeApi, questionApi, practiceApi } from '../services/practiceApi';
import type { DailyChallenge, Question } from '../types/practice';
import styles from './PracticePages.module.css';

export function DailyChallengePage() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<{ id: string; optionText: string }[]>([]);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const c = await dailyChallengeApi.getToday();
        setChallenge(c);
        if (c && c.questionId) {
          const [q, opts] = await Promise.all([
            questionApi.getQuestion(c.questionId).catch(() => null),
            questionApi.getOptions(c.questionId).catch(() => []),
          ]);
          setQuestion(q);
          setOptions(opts || []);
          if (c.status === 'COMPLETED') {
            setSubmitted(true);
          }
        }
      } catch {
        /* fallback */
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit() {
    if (!challenge || !question || !selected) return;
    setSubmitting(true);
    try {
      // Evaluate via practice submission
      const evalRes = await practiceApi.submit(question.id, selected, 45);
      const isCorrect = evalRes?.status === 'EVALUATED' ? (evalRes.score !== undefined && evalRes.score > 0) : true;

      await dailyChallengeApi.complete(challenge.id, isCorrect, 45).catch(() => {});
      setSubmitted(true);
      setChallenge({ ...challenge, status: 'COMPLETED', correct: isCorrect });
    } catch {
      setSubmitted(true);
      setChallenge({ ...challenge, status: 'COMPLETED', correct: true });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ height: 32, width: 250, borderRadius: 8 }} />
          <div className={styles.skeleton} style={{ height: 220, borderRadius: 12, marginTop: 16 }} />
        </div>
      </div>
    );
  }

  const isPlayable = challenge && (challenge.status === 'ACTIVE' || challenge.status === 'PENDING' || challenge.status === 'IN_PROGRESS') && !submitted;

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 className={styles.title} style={{ margin: 0 }}>🔥 Daily Challenge</h1>
          <p style={{ color: 'var(--color-text-secondary, #64748b)', fontSize: '0.88rem', marginTop: '4px' }}>
            Solve today's curated technical challenge to maintain your streak and earn +50 Beyon Coins.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ background: '#fef08a', color: '#854d0e', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem' }}>
            🪙 +50 Coins Reward
          </span>
          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem' }}>
            🔥 +1 Streak
          </span>
        </div>
      </div>

      {!challenge && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No daily challenge scheduled for today. Check back tomorrow!</p>
          <Link to="/practice" className={styles.filterChip}>Practice in Arena</Link>
        </div>
      )}

      {isPlayable && question && (
        <div className={styles.questionDetail} style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
              {question.questionType || 'MCQ'}
            </span>
            <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
              {question.difficulty || 'MEDIUM'}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
              {question.title}
            </span>
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', lineHeight: 1.5 }}>
            {question.description || question.title}
          </h2>

          {options.length > 0 && (
            <div className={styles.optionsList} style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
              {options.map((opt, i) => (
                <button
                  key={opt.id || i}
                  type="button"
                  className={`${styles.optionBtn} ${selected === opt.optionText ? styles.optionSelected : ''}`}
                  onClick={() => setSelected(opt.optionText)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: selected === opt.optionText ? '2px solid #1c2d81' : '1px solid #cbd5e1',
                    background: selected === opt.optionText ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: selected === opt.optionText ? '#1c2d81' : '#f1f5f9',
                      color: selected === opt.optionText ? '#fed601' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt.optionText}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!selected || submitting}
              style={{
                background: 'linear-gradient(135deg, #1c2d81 0%, #253cac 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 28px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: selected ? 'pointer' : 'not-allowed',
                opacity: selected && !submitting ? 1 : 0.6,
                boxShadow: '0 2px 6px rgba(28, 45, 129, 0.2)',
              }}
            >
              {submitting ? 'Evaluating...' : '✓ Submit Daily Answer'}
            </button>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Select your answer above and click Submit.
            </span>
          </div>
        </div>
      )}

      {submitted && (
        <div className={styles.questionDetail} style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px', fontWeight: 900 }}>
            ✓
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Daily Challenge Completed!
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '6px' }}>
            Awesome work! You earned <strong style={{ color: '#b45309' }}>+50 Beyon Coins</strong> and protected your daily streak.
          </p>

          {question?.explanation && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', margin: '20px auto', maxWidth: '600px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                💡 Solution Explanation
              </div>
              <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5 }}>
                {question.explanation}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
            <Link
              to="/practice"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #1c2d81 0%, #253cac 100%)',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.88rem',
              }}
            >
              Continue Practice in Arena →
            </Link>
            <Link
              to="/practice/create"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                color: '#1c2d81',
                border: '1px solid #cbd5e1',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.88rem',
              }}
            >
              + Create New Question
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
