import { useState, useEffect } from 'react';
import { Search, CheckCircle2, RefreshCw, Eye, X, Code, Check } from 'lucide-react';
import styles from './AdminHome.module.css';

interface QuestionItem {
  id: string;
  title: string;
  description: string;
  questionType: string;
  difficulty: string;
  explanation?: string;
  codeTemplate?: string;
  expectedOutput?: string;
  tags?: string;
  status?: string;
  skillId?: string;
}

interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  correct: boolean;
  displayOrder: number;
  explanation?: string;
}

export function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [msg, setMsg] = useState<string | null>(null);

  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/questions?size=100', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.data || []);
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const openQuestionAudit = async (q: QuestionItem) => {
    setSelectedQuestion(q);
    setOptions([]);
    setLoadingOptions(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/questions/${q.id}/options`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setOptions(data.data || []);
      }
    } catch {
      setOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleAction = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 4000);
  };

  const filtered = questions.filter((q) => {
    const title = (q.title || q.description || '').toLowerCase();
    const s = search.toLowerCase();
    const matchesSearch = !search || title.includes(s);
    const matchesDiff = difficulty === 'ALL' || q.difficulty === difficulty;
    return matchesSearch && matchesDiff;
  });

  const getOptionLetter = (idx: number) => String.fromCharCode(65 + idx);

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Technical Question Bank &amp; Taxonomy ({questions.length} Verified)
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Curate MCQs, coding challenges, system design prompts, and assessment question banks.
          </p>
        </div>
        <button
          onClick={fetchQuestions}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            padding: '8px 16px',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Bank</span>
        </button>
      </div>

      {msg && (
        <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 600, fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by prompt, skill, or framework..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
          />
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff', fontWeight: 600 }}
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Question Prompt &amp; Title</th>
              <th>Question Type</th>
              <th>Difficulty</th>
              <th>Coin Reward</th>
              <th>Audit &amp; Options</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading verified technical questions from database...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No questions match your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((q, idx) => (
                <tr key={q.id || idx}>
                  <td style={{ maxWidth: '420px', cursor: 'pointer' }} onClick={() => openQuestionAudit(q)}>
                    <div style={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                      {q.title || `Question #${idx + 1}`}
                    </div>
                    {q.description && (
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {q.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                      {q.questionType || 'MCQ'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', background: q.difficulty === 'HARD' ? '#fee2e2' : q.difficulty === 'MEDIUM' ? '#fef3c7' : '#dcfce7', color: q.difficulty === 'HARD' ? '#b91c1c' : q.difficulty === 'MEDIUM' ? '#b45309' : '#15803d' }}>
                      {q.difficulty || 'MEDIUM'}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#d97706', fontSize: '0.84rem' }}>+50 Coins</strong>
                  </td>
                  <td>
                    <button
                      onClick={() => openQuestionAudit(q)}
                      style={{
                        padding: '5px 12px',
                        background: '#1c2d81',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Eye size={13} />
                      <span>Inspect &amp; Options</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedQuestion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setSelectedQuestion(null)}
        >
          <div
            style={{
              background: '#ffffff',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8' }}>
                    {selectedQuestion.questionType || 'MCQ'}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', background: selectedQuestion.difficulty === 'HARD' ? '#fee2e2' : selectedQuestion.difficulty === 'MEDIUM' ? '#fef3c7' : '#dcfce7', color: selectedQuestion.difficulty === 'HARD' ? '#b91c1c' : selectedQuestion.difficulty === 'MEDIUM' ? '#b45309' : '#15803d' }}>
                    {selectedQuestion.difficulty || 'MEDIUM'}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706' }}>
                    +50 Coins
                  </span>
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedQuestion.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedQuestion.description && (
              <div style={{ marginBottom: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.5 }}>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>Scenario &amp; Problem Statement:</strong>
                {selectedQuestion.description}
              </div>
            )}

            {selectedQuestion.codeTemplate && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  <Code size={14} /> Code Template:
                </strong>
                <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: '12px', fontSize: '0.78rem', overflowX: 'auto' }}>
                  {selectedQuestion.codeTemplate}
                </pre>
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                Answer Options &amp; Correct Key
              </h3>

              {loadingOptions ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                  Loading question options...
                </div>
              ) : options.length === 0 ? (
                <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.82rem' }}>
                  No predefined MCQ options recorded for this question (Free-form / Coding / Algorithm benchmark).
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {options.map((opt, idx) => (
                    <div
                      key={opt.id || idx}
                      style={{
                        padding: '12px 14px',
                        border: opt.correct ? '2px solid #16a34a' : '1px solid #e2e8f0',
                        background: opt.correct ? '#f0fdf4' : '#ffffff',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: opt.correct ? '#16a34a' : '#f1f5f9',
                          color: opt.correct ? '#ffffff' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {getOptionLetter(idx)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: opt.correct ? 700 : 500, color: opt.correct ? '#14532d' : '#1e293b', fontSize: '0.86rem' }}>
                          {opt.optionText}
                        </div>
                        {opt.explanation && (
                          <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '4px' }}>
                            {opt.explanation}
                          </div>
                        )}
                      </div>
                      {opt.correct && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', background: '#dcfce7', color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={12} /> Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedQuestion.explanation && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: '18px' }}>
                <strong style={{ display: 'block', fontSize: '0.82rem', color: '#1c2d81', marginBottom: '4px' }}>
                  Solution Analysis &amp; Explanation:
                </strong>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  {selectedQuestion.explanation}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <button
                onClick={() => {
                  handleAction(`Question "${selectedQuestion.title}" audited and verified.`);
                  setSelectedQuestion(null);
                }}
                style={{
                  padding: '8px 18px',
                  background: '#1c2d81',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={15} />
                <span>Mark as Verified</span>
              </button>
              <button
                onClick={() => setSelectedQuestion(null)}
                style={{
                  padding: '8px 16px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

