import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taxonomyApi, studentLearningApi } from '../services/taxonomyApi';
import type { SkillTopic, SkillSubtopic, StudentLearningTopic } from '../types/taxonomy';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowRight,
  Lock,
  HelpCircle,
  X,
  AlertCircle,
  Check,
  Layers,
  Terminal,
  Cpu,
  Code2,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import { TOPIC_CONTENT_REGISTRY } from '../data/topicElaborateContent';
import styles from './SkillExplorer.module.css';

export function TopicDetail() {
  const { skillSlug, topicSlug } = useParams<{ skillSlug: string; topicSlug: string }>();
  const [topic, setTopic] = useState<SkillTopic | null>(null);
  const [subtopics, setSubtopics] = useState<SkillSubtopic[]>([]);
  const [learningEntry, setLearningEntry] = useState<StudentLearningTopic | null>(null);
  const [loading, setLoading] = useState(true);

  const [allSkillTopics, setAllSkillTopics] = useState<any[]>([]);
  const [allLearningTopics, setAllLearningTopics] = useState<any[]>([]);
  const [topicQuestions, setTopicQuestions] = useState<any[]>([]);

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string | number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!skillSlug || !topicSlug) return;
    try {
      setLoading(true);
      const [t, st, lt, allTopicsRes] = await Promise.all([
        taxonomyApi.getTopic(skillSlug, topicSlug),
        taxonomyApi.getSubtopics(skillSlug, topicSlug),
        studentLearningApi.getTopics().catch(() => []),
        taxonomyApi.getTopics(skillSlug).catch(() => []),
      ]);
      setTopic(t);
      setSubtopics(st);
      setAllSkillTopics(allTopicsRes || []);
      setAllLearningTopics(lt || []);
      const existing = (lt || []).find((l: any) => l.topicId === t.id) || null;
      setLearningEntry(existing);

      if (t?.id) {
        try {
          const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
          const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
          const qRes = await fetch(`/api/v1/practice/questions?topicId=${t.id}`, { headers }).then(r => r.json()).catch(() => ({ data: [] }));
          if (qRes?.data && Array.isArray(qRes.data) && qRes.data.length > 0) {
            setTopicQuestions(qRes.data);
          }
        } catch {  }
      }
    } catch {  }
    setLoading(false);
  }, [skillSlug, topicSlug]);

  useEffect(() => { load(); }, [load]);

  async function handleStartLearning() {
    if (!topic) return;
    try {
      const entry = await studentLearningApi.addTopic(topic.id);
      setLearningEntry(entry);
    } catch {  }
  }

  async function handleStopLearning() {
    if (!learningEntry) return;
    try {
      await studentLearningApi.removeTopic(learningEntry.id);
      setLearningEntry(null);
    } catch {  }
  }

  function handleOpenQuiz() {
    if (isCompleted) return;
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizPassed(false);
    setQuizError(null);
    setShowQuizModal(true);
  }

  async function handleMarkComplete() {
    if (!topic) return;
    try {
      if (!learningEntry) {
        const entry = await studentLearningApi.addTopic(topic.id);
        const updated = await studentLearningApi.updateStatus(entry.id, 'COMPLETED');
        setLearningEntry(updated);
      } else {
        const updated = await studentLearningApi.updateStatus(learningEntry.id, 'COMPLETED');
        setLearningEntry(updated);
      }
    } catch {  }
  }

  function handleAnswerSelect(qId: string | number, optionIdx: number) {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    setQuizError(null);
  }

  function handleSubmitQuiz(quizQuestions: any[]) {
    if (Object.keys(selectedAnswers).length < quizQuestions.length) {
      setQuizError('Please answer all verification questions before submitting.');
      return;
    }

    const allCorrect = quizQuestions.every(q => selectedAnswers[q.id] === q.correctIndex);
    setQuizSubmitted(true);

    if (allCorrect) {
      setQuizPassed(true);
      handleMarkComplete();
      setTimeout(() => {
        setShowQuizModal(false);
      }, 2000);
    } else {
      setQuizPassed(false);
    }
  }

  async function handleStatusChange(status: string) {
    if (!learningEntry) return;
    try {
      const updated = await studentLearningApi.updateStatus(learningEntry.id, status);
      setLearningEntry(updated);
    } catch {  }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ width: 300, height: 28 }} />
          <div className={styles.skeleton} style={{ width: '100%', height: 160 }} />
          <div className={styles.skeleton} style={{ width: '100%', height: 120 }} />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Topic not found.</p>
          <Link to={`/student/skills/${skillSlug}`} className={styles.categoryChip}>Back to Skill Topics</Link>
        </div>
      </div>
    );
  }

  const isCompleted = learningEntry?.status === 'COMPLETED';

  return (
    <div className={styles.page}>
      <nav style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
        <Link to="/student/skills" style={{ color: '#64748b', textDecoration: 'none' }}>
          Skills Matrix
        </Link>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <Link to={`/student/skills/${skillSlug}`} style={{ color: '#64748b', textDecoration: 'none', textTransform: 'capitalize' }}>
          {skillSlug}
        </Link>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <span style={{ color: '#1c2d81', fontWeight: 700 }}>{topic.name}</span>
      </nav>

      <div style={{ background: '#ffffff', border: isCompleted ? '1.5px solid #16a34a' : '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
              <Sparkles size={12} /> Technical Study Guide &amp; Lesson
            </div>
            <h1 className={styles.title} style={{ margin: '0 0 8px' }}>{topic.name}</h1>
            <p style={{ color: '#475569', fontSize: '0.925rem', maxWidth: '780px', lineHeight: 1.6, margin: 0 }}>
              {topic.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
            <button
              onClick={handleOpenQuiz}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: isCompleted ? '#dcfce7' : '#1c2d81',
                color: isCompleted ? '#15803d' : '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: isCompleted ? 'default' : 'pointer',
              }}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 size={16} /> Verified Mastery (+25 XP)
                </>
              ) : (
                <>
                  <HelpCircle size={16} /> Verify Mastery &amp; Complete
                </>
              )}
            </button>

            <Link
              to="/daily-challenge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Flame size={14} color="#f59e0b" /> Solve Practice Challenges
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Learning Status:</span>
            {learningEntry ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={learningEntry.status}
                  onChange={e => handleStatusChange(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#1e293b',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="LEARNING">● In Progress / Learning</option>
                  <option value="PRACTICING">● Practicing Code</option>
                  <option value="ASSESSMENT_READY">● Assessment Ready</option>
                  <option value="COMPLETED">✓ Completed</option>
                </select>
                <button
                  onClick={handleStopLearning}
                  style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '4px', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Leave
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartLearning}
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: '4px', color: '#1d4ed8', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                + Start Learning Topic
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
            <span>⏱ ~45 Mins Study Time</span>
            <span>⚡ +25 Topic XP</span>
            <span>📝 Proctored Exam Aligned</span>
          </div>
        </div>
      </div>

      {(() => {
        const elaborateData = topicSlug ? TOPIC_CONTENT_REGISTRY[topicSlug] : null;

        if (elaborateData) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '24px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#eff6ff', color: '#1c2d81', padding: '8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                        {elaborateData.title}
                      </h2>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1c2d81', background: '#eff6ff', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Technical Reference &amp; Core Architecture
                  </span>
                </div>

                <div style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.75, margin: '0 0 20px', background: '#f8fafc', padding: '16px 20px', borderRadius: '4px', borderLeft: '3px solid #1c2d81' }}>
                  {elaborateData.overview}
                </div>

                {elaborateData.sdeQuestions && elaborateData.sdeQuestions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
                    {elaborateData.sdeQuestions.map((q) => (
                      <div key={q.number} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '22px', background: '#ffffff', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '28px', height: '28px', borderRadius: '4px', background: '#eff6ff', color: '#1c2d81', fontWeight: 800, fontSize: '0.82rem', border: '1px solid #bfdbfe' }}>
                            {q.number}
                          </span>
                          <h3 style={{ fontFamily: 'var(--font-heading, Montserrat)', margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.45 }}>
                            {q.question}
                          </h3>
                        </div>

                        {q.officialDefinition && (
                          <div style={{ background: '#f8fafc', borderLeft: '3px solid #1c2d81', padding: '12px 16px', borderRadius: '2px', margin: '0 0 14px', fontSize: '0.89rem', color: '#334155', lineHeight: 1.65 }}>
                            <div style={{ fontWeight: 700, color: '#1c2d81', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                              Official Definition
                            </div>
                            {q.officialDefinition}
                          </div>
                        )}

                        {q.whyNeeded && (
                          <div style={{ margin: '0 0 14px', color: '#334155', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Why do we need it?</div>
                            {q.whyNeeded}
                          </div>
                        )}

                        {q.problemBefore && (
                          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderLeft: '3px solid #e11d48', borderRadius: '4px', padding: '12px 16px', margin: '0 0 14px', fontSize: '0.885rem', color: '#9f1239', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                            <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.04em', marginBottom: '4px' }}>Problem before:</div>
                            {q.problemBefore}
                          </div>
                        )}

                        {q.solution && (
                          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '3px solid #16a34a', borderRadius: '4px', padding: '12px 16px', margin: '0 0 14px', fontSize: '0.885rem', color: '#166534', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                            <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.04em', marginBottom: '4px' }}>Solution:</div>
                            {q.solution}
                          </div>
                        )}

                        {q.realWorldExample && (
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '3px solid #64748b', borderRadius: '4px', padding: '12px 16px', margin: '0 0 14px', fontSize: '0.885rem', color: '#334155', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', fontSize: '0.82rem' }}>Real-World Example:</div>
                            {q.realWorldExample}
                          </div>
                        )}

                        {q.diagram && (
                          <div style={{ background: '#0f172a', color: '#38bdf8', padding: '14px 16px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.835rem', margin: '14px 0', overflowX: 'auto', lineHeight: 1.5, whiteSpace: 'pre', border: '1px solid #1e293b' }}>
                            {q.diagram}
                          </div>
                        )}

                        {q.whereUsed && q.whereUsed.length > 0 && (
                          <div style={{ margin: '14px 0', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '4px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1c2d81', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Where is it used?
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                              {q.whereUsed.map((item, iIdx) => (
                                <div key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#334155' }}>
                                  <CheckCircle2 size={13} color="#1c2d81" /> {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {q.explanation && (
                          <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.7, margin: '10px 0', whiteSpace: 'pre-line' }}>
                            {q.explanation}
                          </p>
                        )}

                        {q.keyPoints && q.keyPoints.length > 0 && (
                          <ul style={{ paddingLeft: '18px', margin: '10px 0 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {q.keyPoints.map((kp, kpIdx) => (
                              <li key={kpIdx} style={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                {kp}
                              </li>
                            ))}
                          </ul>
                        )}

                        {q.code && (
                          <div style={{ marginTop: '12px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <div style={{ background: '#1e293b', color: '#cbd5e1', padding: '7px 14px', fontSize: '0.76rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Terminal size={13} color="#38bdf8" /> Code Implementation
                            </div>
                            <pre style={{ margin: 0, background: '#0f172a', color: '#f8fafc', padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.825rem', overflowX: 'auto', lineHeight: 1.55 }}>
                              <code>{q.code}</code>
                            </pre>
                            {q.output && (
                              <div style={{ background: '#0b1120', padding: '10px 14px', borderTop: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '0.81rem', color: '#4ade80' }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>Expected Output:</div>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{q.output}</pre>
                              </div>
                            )}
                          </div>
                        )}

                        {q.table && (
                          <div style={{ marginTop: '14px', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                  {q.table.headers.map((h, hIdx) => (
                                    <th key={hIdx} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {q.table.rows.map((row, rIdx) => (
                                  <tr key={rIdx} style={{ borderBottom: rIdx === q.table!.rows.length - 1 ? 'none' : '1px solid #f1f5f9', background: rIdx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} style={{ padding: '10px 14px', color: cIdx === 0 ? '#0f172a' : '#475569', fontWeight: cIdx === 0 ? 600 : 400 }}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {q.interviewAnswer && (
                          <div style={{ marginTop: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '3px solid #16a34a', borderRadius: '4px', padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                              <Lightbulb size={14} /> Interview Response (2 Minutes)
                            </div>
                            <div style={{ color: '#14532d', fontSize: '0.885rem', lineHeight: 1.7, fontWeight: 500 }}>
                              {q.interviewAnswer}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {elaborateData.comprehensiveDemo && (
                  <div style={{ marginTop: '28px', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: '#1c2d81', color: '#ffffff', padding: '12px 18px', fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-heading, Montserrat)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Code2 size={18} /> {elaborateData.comprehensiveDemo.title}
                    </div>
                    <pre style={{ margin: 0, background: '#0f172a', color: '#f8fafc', padding: '16px 18px', fontFamily: 'monospace', fontSize: '0.83rem', overflowX: 'auto', lineHeight: 1.55 }}>
                      <code>{elaborateData.comprehensiveDemo.code}</code>
                    </pre>
                    <div style={{ background: '#0b1120', padding: '12px 18px', borderTop: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '0.82rem', color: '#4ade80' }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', fontWeight: 700 }}>Output:</div>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{elaborateData.comprehensiveDemo.output}</pre>
                    </div>
                    {elaborateData.comprehensiveDemo.deepDiveNotes && (
                      <div style={{ background: '#f8fafc', padding: '12px 18px', borderTop: '1px solid #e2e8f0', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
                        {elaborateData.comprehensiveDemo.deepDiveNotes.map((note, nIdx) => (
                          <div key={nIdx} style={{ fontWeight: nIdx === 0 ? 700 : 400, color: nIdx === 0 ? '#1c2d81' : '#334155' }}>{note}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {elaborateData.sdeTraps && elaborateData.sdeTraps.length > 0 && (
                  <div style={{ marginTop: '28px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} color="#d97706" /> Technical Traps &amp; Edge Cases
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {elaborateData.sdeTraps.map((trap, tIdx) => (
                        <div key={tIdx} style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderLeft: '3px solid #f59e0b', borderRadius: '4px', padding: '16px 18px' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#92400e', marginBottom: '6px' }}>
                            {trap.title}
                          </div>
                          {trap.code && (
                            <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '10px 12px', borderRadius: '4px', fontSize: '0.81rem', fontFamily: 'monospace', margin: '8px 0', overflowX: 'auto' }}>
                              <code>{trap.code}</code>
                            </pre>
                          )}
                          {trap.answer && (
                            <div style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: 1.6 }}>
                              <strong>Answer:</strong> {trap.answer}
                            </div>
                          )}
                          {trap.output && (
                            <div style={{ fontSize: '0.85rem', color: '#92400e', marginTop: '4px' }}>
                              <strong>Output:</strong> <code>{trap.output}</code>
                            </div>
                          )}
                          {trap.reason && (
                            <div style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '4px', fontStyle: 'italic' }}>
                              <strong>Reason:</strong> {trap.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {elaborateData.mentalModel && (
                  <div style={{ marginTop: '28px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Cpu size={18} color="#1c2d81" /> {elaborateData.mentalModel.title}
                    </h3>
                    {elaborateData.mentalModel.diagram && (
                      <div style={{ background: '#0f172a', color: '#38bdf8', padding: '14px 16px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.825rem', overflowX: 'auto', lineHeight: 1.5, margin: '0 0 16px', whiteSpace: 'pre', border: '1px solid #1e293b' }}>
                        {elaborateData.mentalModel.diagram}
                      </div>
                    )}
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1c2d81', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      Key Takeaways:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {elaborateData.mentalModel.keyTakeaways.map((point, pIdx) => (
                        <li key={pIdx} style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {elaborateData.coreConcepts && elaborateData.coreConcepts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '24px' }}>
                    {elaborateData.coreConcepts.map((concept, idx) => (
                      <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '20px', background: '#ffffff' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Code2 size={16} color="#1c2d81" /> {concept.heading}
                        </h3>
                        <p style={{ color: '#475569', fontSize: '0.89rem', lineHeight: 1.65, margin: '0 0 12px' }}>
                          {concept.description}
                        </p>
                        {concept.bulletPoints && (
                          <ul style={{ paddingLeft: '18px', margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {concept.bulletPoints.map((bp, bpIdx) => (
                              <li key={bpIdx} style={{ color: '#334155', fontSize: '0.865rem', lineHeight: 1.55 }}>
                                {bp}
                              </li>
                            ))}
                          </ul>
                        )}
                        {concept.codeSnippet && (
                          <div style={{ marginTop: '12px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', color: '#cbd5e1', padding: '7px 14px', fontSize: '0.76rem', fontWeight: 600 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Terminal size={13} color="#38bdf8" /> {concept.codeSnippet.title}
                              </span>
                              <span style={{ textTransform: 'uppercase', color: '#94a3b8', fontSize: '0.68rem' }}>{concept.codeSnippet.language}</span>
                            </div>
                            <pre style={{ margin: 0, background: '#0f172a', color: '#f8fafc', padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.825rem', overflowX: 'auto', lineHeight: 1.55 }}>
                              <code>{concept.codeSnippet.code}</code>
                            </pre>
                            <div style={{ background: '#0b1120', padding: '8px 14px', fontSize: '0.78rem', color: '#94a3b8', borderTop: '1px solid #1e293b' }}>
                              💡 {concept.codeSnippet.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {elaborateData.comparisons && (
                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Cpu size={16} color="#1c2d81" /> {elaborateData.comparisons.title}
                    </h3>
                    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            {elaborateData.comparisons.headers.map((h, hIdx) => (
                              <th key={hIdx} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {elaborateData.comparisons.rows.map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: rIdx === elaborateData.comparisons!.rows.length - 1 ? 'none' : '1px solid #f1f5f9', background: rIdx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} style={{ padding: '10px 14px', color: cIdx === 0 ? '#0f172a' : '#475569', fontWeight: cIdx === 0 ? 600 : 400 }}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {elaborateData.subtopicBreakdowns && Object.keys(elaborateData.subtopicBreakdowns).length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 14px', flexWrap: 'wrap', gap: '8px' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} color="#1c2d81" /> Granular Concept Modules ({subtopics.length})
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                      Subtopic Specifications
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {subtopics.map((sub, sIdx) => {
                      const breakdown = elaborateData.subtopicBreakdowns?.[sub.name];
                      return (
                        <div key={sub.id || sIdx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '18px', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '4px', background: '#eff6ff', color: '#1c2d81', fontWeight: 700, fontSize: '0.78rem', border: '1px solid #bfdbfe' }}>
                              {sIdx + 1}
                            </span>
                            <h3 style={{ fontFamily: 'var(--font-heading, Montserrat)', margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                              {sub.name}
                            </h3>
                          </div>

                          <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 12px' }}>
                            {breakdown?.conceptSummary || sub.description || 'Comprehensive conceptual module.'}
                          </p>

                          {breakdown?.keyPoints && (
                            <div style={{ margin: '0 0 12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.74rem', color: '#1c2d81', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                                Core Architectural Guarantees:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {breakdown.keyPoints.map((kp, kpIdx) => (
                                  <li key={kpIdx} style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>{kp}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {breakdown?.interviewQA && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '3px solid #16a34a', borderRadius: '4px', padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#15803d', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                                <Lightbulb size={13} /> Technical Interview Q&amp;A
                              </div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#14532d', marginBottom: '6px' }}>
                                Q: {breakdown.interviewQA.question}
                              </div>
                              <div style={{ fontSize: '0.84rem', color: '#166534', lineHeight: 1.6 }}>
                                <strong>Answer:</strong> {breakdown.interviewQA.answer}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="#1c2d81" /> Architecture &amp; Core Concept Breakdown
              </h2>

              <div style={{ color: '#334155', fontSize: '0.925rem', lineHeight: 1.8 }}>
                <p>
                  This curriculum module provides in-depth technical analysis and production-grade implementation standards for <strong>{topic.name}</strong>.
                  Mastering these architectural concepts is critical for SDE coding assessments, system design interviews, and scalable cloud engineering.
                </p>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '20px 0 8px' }}>
                  Key Engineering Competencies
                </h3>
                <ul style={{ paddingLeft: '20px', margin: '8px 0 16px' }}>
                  <li>Understand internal runtime execution mechanics, memory layouts, and thread safety.</li>
                  <li>Design clean, decoupled abstractions using established SOLID principles and GoF design patterns.</li>
                  <li>Optimize algorithmic efficiency, CPU cache locality, and latency during high-throughput workloads.</li>
                  <li>Implement robust error handling, boundary validation, and deterministic state transitions.</li>
                </ul>
              </div>
            </div>

            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
              Granular Subtopics ({subtopics.length})
            </h2>

            {subtopics.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>All core concepts are included in the primary lesson overview above.</p>
              </div>
            ) : (
              <div className={styles.skillsGrid}>
                {subtopics.map(sub => (
                  <div key={sub.id} className={styles.skillCard} style={{ cursor: 'default', background: '#ffffff' }}>
                    <h3 className={styles.skillName} style={{ fontSize: '0.95rem', fontWeight: 700 }}>{sub.name}</h3>
                    {sub.description && <p className={styles.skillDescription} style={{ fontSize: '0.85rem' }}>{sub.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        );
      })()}

      {(() => {
        const completedSkillTopicsCount = allSkillTopics.filter(st =>
          allLearningTopics.some(lt => lt.topicId === st.id && (lt.status === 'COMPLETED' || (topic && lt.topicId === topic.id && isCompleted)))
        ).length;
        const totalTopicsInSkill = allSkillTopics.length > 0 ? allSkillTopics.length : 1;
        const isSkill100Percent = allSkillTopics.length > 0 && completedSkillTopicsCount >= totalTopicsInSkill;
        const nextTopic = allSkillTopics.find(st => st.id !== topic?.id && !allLearningTopics.some(lt => lt.topicId === st.id && lt.status === 'COMPLETED'));

        return (
          <div style={{ marginTop: '28px', background: isSkill100Percent ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: isSkill100Percent ? '1.5px solid #86efac' : '1px solid #bfdbfe', borderRadius: '8px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: isSkill100Percent ? '#15803d' : '#1d4ed8', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <ShieldCheck size={14} /> AI-Proctored Skill Certification Gate
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: isSkill100Percent ? '#14532d' : '#1e3a8a', margin: '4px 0' }}>
                {isSkill100Percent
                  ? `🎉 100% Mastery Reached in ${skillSlug ? skillSlug.toUpperCase() : 'Skill'}!`
                  : `Skill Progress: ${completedSkillTopicsCount} / ${totalTopicsInSkill} Lessons Completed (${Math.round((completedSkillTopicsCount / totalTopicsInSkill) * 100)}%)`}
              </h3>
              <p style={{ color: isSkill100Percent ? '#166534' : '#3b82f6', fontSize: '0.875rem', margin: 0 }}>
                {isSkill100Percent
                  ? `All ${totalTopicsInSkill} curriculum lessons completed. You have unlocked the official AI-proctored certification exam!`
                  : `Certification exams unlock ONLY after completing 100% of all lessons in this skill roadmap. Finish the remaining lessons to unlock.`}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {isSkill100Percent ? (
                <Link
                  to="/assessment"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: '#15803d',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                  }}
                >
                  <ShieldCheck size={16} /> 🔓 Take Proctored Certification Exam <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  {nextTopic && isCompleted && (
                    <Link
                      to={`/student/skills/${skillSlug}/${nextTopic.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        background: '#1c2d81',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Next: {nextTopic.name}</span>
                      <ArrowRight size={14} />
                    </Link>
                  )}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      background: '#cbd5e1',
                      color: '#475569',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.825rem',
                    }}
                  >
                    <Lock size={15} color="#475569" />
                    <span>Locked: Complete 100% ({completedSkillTopicsCount}/{totalTopicsInSkill}) to Unlock Exam</span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {showQuizModal && (() => {
        const activeQuizQuestions = (topicQuestions && topicQuestions.length > 0)
          ? topicQuestions.map((q: any) => {
              const optionsList = Array.isArray(q.options) && q.options.length > 0
                ? q.options.map((o: any) => ({
                    text: o.optionText || o.text,
                    isCorrect: o.isCorrect === 1 || o.isCorrect === true || o.correct === true,
                  }))
                : [
                    { text: 'Bypasses boundary validation and ignores thread-safety', isCorrect: false },
                    { text: 'Follows deterministic language standards and memory safety guarantees', isCorrect: true },
                    { text: 'Disables transaction isolation levels to maximize raw throughput', isCorrect: false },
                    { text: 'Bypasses type checking at runtime', isCorrect: false },
                  ];

              const correctIndex = optionsList.findIndex((o: any) => o.isCorrect);

              return {
                id: q.id,
                question: q.title || q.description,
                options: optionsList.map((o: any) => o.text),
                correctIndex: correctIndex !== -1 ? correctIndex : 1,
                explanation: q.explanation || 'Verified against core language and architecture specifications.',
              };
            })
          : [
              {
                id: 'fb-1',
                question: `What is the primary architectural principle governing ${topic.name}?`,
                options: [
                  'Disables input validation and relies exclusively on runtime exception bypasses',
                  'Enforces deterministic state management, memory safety, and robust boundary validation',
                  'Stores transient computation variables in unsecured mutable global structures',
                  'Bypasses connection pooling and spawns unbounded raw threads synchronously',
                ],
                correctIndex: 1,
                explanation: 'Production architectures require strict boundary validation, idempotency, and deterministic state transitions.',
              },
              {
                id: 'fb-2',
                question: `When implementing ${topic.name} in enterprise high-throughput services, which strategy is recommended?`,
                options: [
                  'Running unindexed linear table scans across all database queries',
                  'Hardcoding access credentials directly in client-side code constants',
                  'Implementing asynchronous non-blocking pipelines, connection pooling, and structured telemetry',
                  'Disabling all logging and transaction isolation levels entirely',
                ],
                correctIndex: 2,
                explanation: 'High-concurrency systems rely on asynchronous non-blocking pipelines, connection pools, and structured telemetry.',
              },
            ];

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderTop: '4px solid #1c2d81',
                borderRadius: '8px',
                maxWidth: '640px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} style={{ color: '#1c2d81' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      Topic Mastery Knowledge Check
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                      Verify your technical comprehension in {topic.name} to complete the lesson ({activeQuizQuestions.length} Questions)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuizModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {quizError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#b91c1c',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={16} /> {quizError}
                  </div>
                )}

                {quizSubmitted && quizPassed && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '6px',
                      padding: '16px',
                      textAlign: 'center',
                      color: '#15803d',
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🎉</div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800 }}>Mastery Verified (100% Score)!</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                      Lesson marked as completed! You earned <strong>+25 XP</strong> and advanced toward certification unlock.
                    </p>
                  </div>
                )}

                {quizSubmitted && !quizPassed && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      padding: '12px 14px',
                      color: '#b91c1c',
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong>1 or more answers were incorrect.</strong> Review the core documentation above and select the correct answers to pass.
                  </div>
                )}

                {activeQuizQuestions.map((q, qIndex) => {
                  const selected = selectedAnswers[q.id];
                  const isWrong = quizSubmitted && !quizPassed && selected !== q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      style={{
                        background: '#f8fafc',
                        border: isWrong ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '16px',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '12px' }}>
                        {qIndex + 1}. {q.question}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options.map((opt: string, optIndex: number) => {
                          const isSelected = selected === optIndex;
                          const optionLetter = String.fromCharCode(65 + optIndex);
                          return (
                            <label
                              key={optIndex}
                              onClick={() => handleAnswerSelect(q.id, optIndex)}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 12px',
                                background: isSelected ? '#eff6ff' : '#ffffff',
                                border: isSelected ? '1.5px solid #1c2d81' : '1px solid #cbd5e1',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.835rem',
                                color: '#1e293b',
                                lineHeight: 1.4,
                              }}
                            >
                              <input
                                type="radio"
                                name={`quiz-q-${q.id}`}
                                checked={isSelected}
                                onChange={() => handleAnswerSelect(q.id, optIndex)}
                                style={{ marginTop: '2px' }}
                              />
                              <div>
                                <strong style={{ color: isSelected ? '#1c2d81' : '#475569', marginRight: '6px' }}>
                                  {optionLetter}.
                                </strong>
                                <span>{opt}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      {quizSubmitted && isWrong && (
                        <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#64748b', background: '#ffffff', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid #1c2d81' }}>
                          💡 <strong>Key Principle:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  padding: '16px 24px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <button
                  onClick={() => setShowQuizModal(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    color: '#64748b',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleSubmitQuiz(activeQuizQuestions)}
                  disabled={quizPassed}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    background: '#1c2d81',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: quizPassed ? 'default' : 'pointer',
                  }}
                >
                  <Check size={16} /> Submit &amp; Verify Mastery
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

