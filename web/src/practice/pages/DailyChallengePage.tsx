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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className={styles.title} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="bx bx-flame" style={{ color: '#ea580c' }} />
            <span>Daily Technical Challenge</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Solve today's curated problem to protect your learning streak and earn verified reward coins.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.8rem' }}>
            <i className="bx bx-coin-stack" /> +50 Coins Reward
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.8rem' }}>
            <i className="bx bx-flame" /> +1 Streak Bonus
          </span>
        </div>
      </div>

      {!challenge && (
        <div className={styles.emptyState}>
          <i className="bx bx-calendar-x" style={{ fontSize: '2.5rem', color: '#94a3b8' }} />
          <p className={styles.emptyText}>No daily challenge scheduled for today. Check back tomorrow!</p>
          <Link to="/practice" className={styles.filterChip}>
            <i className="bx bx-code-block" style={{ marginRight: '6px' }} /> Practice in Arena
          </Link>
        </div>
      )}

      {isPlayable && question && (
        <div className={styles.questionDetail}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '4px' }}>
              {question.questionType || 'MCQ'}
            </span>
            <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '4px' }}>
              {question.difficulty || 'MEDIUM'}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
              {question.title}
            </span>
          </div>

          <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', marginBottom: '18px', lineHeight: 1.5 }}>
            {question.description || question.title}
          </h2>

          {options.length > 0 && (
            <div className={styles.optionsList} style={{ margin: '20px 0' }}>
              {options.map((opt, i) => (
                <button
                  key={opt.id || i}
                  type="button"
                  className={`${styles.optionBtn} ${selected === opt.optionText ? styles.optionSelected : ''}`}
                  onClick={() => setSelected(opt.optionText)}
                >
                  <span className={styles.optionLetter}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt.optionText}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!selected || submitting}
            >
              <i className="bx bx-check-circle" style={{ marginRight: '6px' }} />
              {submitting ? 'Evaluating...' : 'Submit Challenge Answer'}
            </button>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Select your choice above and click submit to evaluate.
            </span>
          </div>
        </div>
      )}

      {submitted && (
        <div className={styles.questionDetail} style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>
            <i className="bx bx-check" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Daily Challenge Completed!
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '6px' }}>
            Great effort! You earned <strong style={{ color: '#b45309' }}>+50 Beyon Coins</strong> and advanced your learning streak.
          </p>

          {question?.explanation && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', margin: '24px auto', maxWidth: '640px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="bx bx-bulb" style={{ fontSize: '1rem' }} /> Solution Explanation
              </div>
              <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                {question.explanation}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
            <Link
              to="/practice"
              className={styles.submitBtn}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', margin: 0 }}
            >
              <span>Continue Practice in Arena</span>
              <i className="bx bx-right-arrow-alt" />
            </Link>
            <Link
              to="/practice/create"
              className={styles.filterChip}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="bx bx-plus" />
              <span>Create New Question</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
