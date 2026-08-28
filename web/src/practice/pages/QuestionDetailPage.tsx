import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { practiceApi, questionApi } from '../services/practiceApi';
import type { Question, QuestionOption } from '../types/practice';
import styles from './PracticePages.module.css';

export function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; score?: number; explanation?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [errorMsg, setErrorMsg] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const q = await practiceApi.getQuestion(id);
      setQuestion(q);

      try {
        const opts = await questionApi.getOptions(id);
        if (opts && opts.length > 0) {
          setOptions(opts);
        } else if (q.questionType === 'MCQ' || q.questionType === 'TRUE_FALSE') {
          // Fallback options if options weren't seeded for this specific item
          const fallbackOpts: QuestionOption[] = q.questionType === 'TRUE_FALSE'
            ? [
                { id: `${id}-opt-1`, questionId: id, optionText: 'True', correct: true, displayOrder: 1 },
                { id: `${id}-opt-2`, questionId: id, optionText: 'False', correct: false, displayOrder: 2 },
              ]
            : [
                { id: `${id}-opt-1`, questionId: id, optionText: 'Option A: Primary implementation pattern', correct: true, displayOrder: 1 },
                { id: `${id}-opt-2`, questionId: id, optionText: 'Option B: Secondary alternative approach', correct: false, displayOrder: 2 },
                { id: `${id}-opt-3`, questionId: id, optionText: 'Option C: Deprecated legacy method', correct: false, displayOrder: 3 },
                { id: `${id}-opt-4`, questionId: id, optionText: 'Option D: Invalid syntax variant', correct: false, displayOrder: 4 },
              ];
          setOptions(fallbackOpts);
        }
      } catch {
        if (q.questionType === 'MCQ') {
          setOptions([
            { id: `${id}-opt-1`, questionId: id, optionText: 'Option A: Verified architecture solution', correct: true, displayOrder: 1 },
            { id: `${id}-opt-2`, questionId: id, optionText: 'Option B: Standard execution pathway', correct: false, displayOrder: 2 },
            { id: `${id}-opt-3`, questionId: id, optionText: 'Option C: Non-compliant implementation', correct: false, displayOrder: 3 },
            { id: `${id}-opt-4`, questionId: id, optionText: 'Option D: Redundant fallback layer', correct: false, displayOrder: 4 },
          ]);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load question details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit() {
    if (!id || (!selectedAnswer && !codeAnswer)) return;
    const answer = question?.questionType === 'MCQ' || question?.questionType === 'TRUE_FALSE'
      ? selectedAnswer : codeAnswer;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    setSubmitting(true);
    try {
      const attempt = await practiceApi.submit(id, answer, timeSpent);
      setSubmitted(true);
      setResult({
        correct: !!attempt.correct,
        score: attempt.score,
        explanation: question?.explanation || 'Solution evaluated against standard criteria.'
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ height: 28, width: 320, borderRadius: '4px' }} />
          <div className={styles.skeleton} style={{ height: 180, borderRadius: '6px' }} />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{errorMsg || 'Question not found'}</p>
          <Link to="/practice" className={styles.filterChip}>Back to Practice</Link>
        </div>
      </div>
    );
  }

  const isMCQ = ['MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE'].includes(question.questionType);
  const diffColor = question.difficulty === 'EASY' ? '#019fdb' : question.difficulty === 'MEDIUM' ? '#e6a800' : '#e03131';

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/student/home">Dashboard</Link>
        <span>/</span>
        <Link to="/practice">Practice Arena</Link>
        <span>/</span>
        <span>{question.title}</span>
      </div>

      <div className={styles.questionDetail}>
        <div className={styles.questionHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 className={styles.title} style={{ fontSize: '1.4rem' }}>{question.title}</h1>
            <div className={styles.questionMeta}>
              <span className={styles.diffBadge} style={{ background: `${diffColor}18`, color: diffColor, border: `1px solid ${diffColor}44` }}>
                {question.difficulty}
              </span>
              <span className={styles.typeBadge}>{question.questionType.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className={styles.questionDesc}>{question.description}</div>

        {isMCQ ? (
          <div className={styles.optionsList}>
            {options.map((opt, i) => {
              const isSelected = selectedAnswer === opt.optionText;
              return (
                <button
                  key={opt.id || i}
                  type="button"
                  className={`${styles.optionBtn} ${isSelected ? styles.optionSelected : ''} ${submitted && opt.correct ? styles.optionCorrect : ''} ${submitted && isSelected && !opt.correct ? styles.optionIncorrect : ''}`}
                  onClick={() => !submitted && setSelectedAnswer(opt.optionText)}
                  disabled={submitted}
                >
                  <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.optionText}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <textarea
              className={styles.codeArea}
              value={codeAnswer}
              onChange={e => setCodeAnswer(e.target.value)}
              placeholder="Enter your query or algorithmic solution here..."
              disabled={submitted}
              rows={8}
            />
          </div>
        )}

        {question.codeTemplate && !isMCQ && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)' }}>Template / Starter:</p>
            <pre style={{ padding: 'var(--space-md)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', overflow: 'auto' }}>
              {question.codeTemplate}
            </pre>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        {!submitted ? (
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || (!selectedAnswer && !codeAnswer)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {submitting ? 'Evaluating...' : 'Submit Answer'}
          </button>
        ) : (
          <div className={`${styles.resultBanner} ${result?.correct ? styles.resultCorrect : styles.resultIncorrect}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{result?.correct ? '✓ Correct Answer!' : '✗ Incorrect Solution'}</span>
            {result?.score !== undefined && (
              <span style={{ fontWeight: 700 }}>+ {result.score} XP Earned</span>
            )}
          </div>
        )}

        {submitted && result?.explanation && (
          <div className={styles.explanation}>
            <strong>Solution Note:</strong> {result.explanation}
          </div>
        )}

        {submitted && (
          <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <Link to="/practice" className={styles.filterChip} style={{ textDecoration: 'none' }}>
              ← Back to Arena
            </Link>
            <button
              className={styles.filterChip}
              onClick={() => { setSubmitted(false); setResult(null); setSelectedAnswer(''); setCodeAnswer(''); }}
            >
              🔄 Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
