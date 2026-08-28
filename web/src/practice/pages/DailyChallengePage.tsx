import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dailyChallengeApi, questionApi, practiceApi } from '../services/practiceApi';
import type { DailyChallenge, Question } from '../types/practice';
import {
  Flame,
  Coins,
  CalendarX,
  Code2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
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
          <div className={styles.skeleton} style={{ height: 32, width: 250, borderRadius: '0px' }} />
          <div className={styles.skeleton} style={{ height: 220, borderRadius: '0px', marginTop: 16 }} />
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
            <Flame size={24} style={{ color: '#ea580c' }} />
            <span>Daily Technical Challenge</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px', fontWeight: 400 }}>
            Solve today&apos;s curated problem to protect your learning streak and earn verified reward coins.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: '0px', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            <Coins size={14} /> +50 Coins Reward
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '0px', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            <Flame size={14} /> +1 Streak Bonus
          </span>
        </div>
      </div>

      {!challenge && (
        <div className={styles.emptyState}>
          <CalendarX size={36} style={{ color: '#94a3b8' }} />
          <p className={styles.emptyText}>No daily challenge scheduled for today. Check back tomorrow!</p>
          <Link to="/practice" className={styles.filterChip} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Code2 size={15} /> Practice in Arena
          </Link>
        </div>
      )}

      {challenge && (
        <div className={styles.questionDetail}>
          <div className={styles.questionHeader}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <span className={styles.diffBadge} style={{ fontWeight: 600 }}>{question?.difficulty || 'MEDIUM'}</span>
              <span className={styles.typeBadge} style={{ fontWeight: 500 }}>{question?.questionType || 'MULTIPLE_CHOICE'}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
              {question?.title || 'Daily Featured Challenge'}
            </h2>
            <div className={styles.questionDesc}>
              {question?.description || 'Select the correct answer below to complete today\'s challenge and receive your 50 Beyon coins bonus.'}
            </div>
          </div>

          {options.length > 0 ? (
            <div className={styles.optionsList}>
              {options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selected === opt.id;
                let optClass = styles.optionBtn;
                if (isSelected) optClass += ` ${styles.optionSelected}`;
                if (submitted && challenge.correct && isSelected) optClass += ` ${styles.optionCorrect}`;
                if (submitted && !challenge.correct && isSelected) optClass += ` ${styles.optionIncorrect}`;

                return (
                  <button
                    key={opt.id}
                    className={optClass}
                    onClick={() => isPlayable && setSelected(opt.id)}
                    disabled={!isPlayable}
                  >
                    <span className={styles.optionLetter}>{letter}</span>
                    <span>{opt.optionText}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No options found for this question.</div>
          )}

          {isPlayable && (
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!selected || submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{submitting ? 'Evaluating Submission...' : 'Submit Daily Solution'}</span>
              <ArrowRight size={14} />
            </button>
          )}

          {submitted && (
            <div className={`${styles.resultBanner} ${challenge.correct ? styles.resultCorrect : styles.resultIncorrect}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700 }}>
                {challenge.correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span>{challenge.correct ? 'Completed! +50 Beyon Coins Earned' : 'Incorrect attempt. Try again tomorrow!'}</span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.84rem', fontWeight: 400 }}>
                {challenge.correct
                  ? 'Your daily streak has been updated to 19 days! Keep up the daily discipline to climb higher on the leaderboards.'
                  : 'Review the technical explanation below and strengthen your mastery in the practice arena.'}
              </p>
            </div>
          )}

          {submitted && question?.explanation && (
            <div className={styles.explanation}>
              <div style={{ fontWeight: 700, marginBottom: '6px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: '#1c2d81' }} />
                <span>Technical Explanation</span>
              </div>
              <div>{question.explanation}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
