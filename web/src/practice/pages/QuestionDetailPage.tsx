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
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; explanation?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [q, opts] = await Promise.all([
        practiceApi.getQuestion(id),
        questionApi.getOptions(id),
      ]);
      setQuestion(q);
      setOptions(opts);
    } catch { /* */ }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit() {
    if (!id || !selectedAnswer && !codeAnswer) return;
    const answer = question?.questionType === 'MCQ' || question?.questionType === 'TRUE_FALSE'
      ? selectedAnswer : codeAnswer;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    try {
      const attempt = await practiceApi.submit(id, answer, timeSpent);
      setSubmitted(true);
      setResult({ correct: !!attempt.correct, explanation: question?.explanation });
    } catch { /* */ }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ height: 24, width: 300 }} />
          <div className={styles.skeleton} style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Question not found</p>
          <Link to="/practice" className={styles.filterChip}>Back to Practice</Link>
        </div>
      </div>
    );
  }

  const isMCQ = ['MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE'].includes(question.questionType);
  const diffColor = question.difficulty === 'EASY' ? 'var(--color-secondary)' : question.difficulty === 'MEDIUM' ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/practice">Practice</Link>
        <span>/</span>
        <span>Question</span>
      </div>

      <div className={styles.questionDetail}>
        <div className={styles.questionHeader}>
          <h1 className={styles.title}>{question.title}</h1>
          <div className={styles.questionMeta}>
            <span style={{ color: diffColor, fontWeight: 'var(--font-semibold)' }}>{question.difficulty}</span>
            <span className={styles.typeBadge}>{question.questionType.replace('_', ' ')}</span>
          </div>
        </div>

        <p className={styles.questionDesc}>{question.description}</p>

        {isMCQ ? (
          <div className={styles.optionsList}>
            {options.map((opt, i) => (
              <button
                key={opt.id}
                className={`${styles.optionBtn} ${selectedAnswer === opt.optionText ? styles.optionSelected : ''} ${submitted && opt.correct ? styles.optionCorrect : ''} ${submitted && selectedAnswer === opt.optionText && !opt.correct ? styles.optionIncorrect : ''}`}
                onClick={() => !submitted && setSelectedAnswer(opt.optionText)}
                disabled={submitted}
              >
                <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                <span>{opt.optionText}</span>
              </button>
            ))}
          </div>
        ) : (
          <textarea
            className={styles.codeArea}
            value={codeAnswer}
            onChange={e => setCodeAnswer(e.target.value)}
            placeholder="Write your answer here..."
            disabled={submitted}
          />
        )}

        {question.codeTemplate && !isMCQ && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)' }}>Template:</p>
            <pre style={{ padding: 'var(--space-md)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', overflow: 'auto' }}>
              {question.codeTemplate}
            </pre>
          </div>
        )}

        {!submitted ? (
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!selectedAnswer && !codeAnswer}
          >
            Submit Answer
          </button>
        ) : (
          <div className={`${styles.resultBanner} ${result?.correct ? styles.resultCorrect : styles.resultIncorrect}`}>
            {result?.correct ? '✓ Correct!' : '✗ Incorrect'}
          </div>
        )}

        {submitted && result?.explanation && (
          <div className={styles.explanation}>
            <strong>Explanation:</strong> {result.explanation}
          </div>
        )}

        {submitted && (
          <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
            <Link to="/practice" className={styles.filterChip}>Back to Practice</Link>
            <button className={styles.filterChip} onClick={() => { setSubmitted(false); setResult(null); setSelectedAnswer(''); setCodeAnswer(''); }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
