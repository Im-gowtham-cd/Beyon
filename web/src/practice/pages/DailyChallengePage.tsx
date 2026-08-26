import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dailyChallengeApi, questionApi } from '../services/practiceApi';
import type { DailyChallenge, Question } from '../types/practice';
import styles from './PracticePages.module.css';

export function DailyChallengePage() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<{ id: string; optionText: string }[]>([]);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await dailyChallengeApi.getToday();
        setChallenge(c);
        if (c.questionId) {
          const [q, opts] = await Promise.all([
            questionApi.getQuestion(c.questionId),
            questionApi.getOptions(c.questionId),
          ]);
          setQuestion(q);
          setOptions(opts);
        }
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleStart() {
    if (!challenge) return;
    await dailyChallengeApi.start(challenge.id);
    setChallenge({ ...challenge, status: 'IN_PROGRESS' });
  }

  async function handleSubmit() {
    if (!challenge || !selected) return;
    const correct = options.some(o => o.optionText === selected && true);
    await dailyChallengeApi.complete(challenge.id, correct);
    setSubmitted(true);
    setChallenge({ ...challenge, status: 'COMPLETED', correct });
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ height: 24, width: 200 }} />
          <div className={styles.skeleton} style={{ height: 150 }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Daily Challenge</h1>

      {!challenge && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No challenge available today. Check back tomorrow!</p>
          <Link to="/practice" className={styles.filterChip}>Practice Instead</Link>
        </div>
      )}

      {challenge && challenge.status === 'PENDING' && (
        <div className={styles.questionDetail}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Today's challenge is ready! Solve one question to maintain your streak.
          </p>
          <button className={styles.submitBtn} onClick={handleStart}>Start Challenge</button>
        </div>
      )}

      {challenge && challenge.status === 'IN_PROGRESS' && question && (
        <div className={styles.questionDetail}>
          <p className={styles.questionDesc}>{question.description}</p>
          <div className={styles.optionsList}>
            {options.map((opt, i) => (
              <button
                key={opt.id}
                className={`${styles.optionBtn} ${selected === opt.optionText ? styles.optionSelected : ''}`}
                onClick={() => setSelected(opt.optionText)}
              >
                <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                <span>{opt.optionText}</span>
              </button>
            ))}
          </div>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={!selected}>Submit</button>
        </div>
      )}

      {submitted && (
        <div className={styles.questionDetail}>
          <div className={`${styles.resultBanner} ${challenge?.correct ? styles.resultCorrect : styles.resultIncorrect}`}>
            {challenge?.correct ? '✓ Challenge Completed! +20 Coins' : '✗ Challenge Failed'}
          </div>
          <Link to="/practice" className={styles.filterChip} style={{ marginTop: 'var(--space-md)', display: 'inline-block' }}>
            Continue Practice
          </Link>
        </div>
      )}
    </div>
  );
}
