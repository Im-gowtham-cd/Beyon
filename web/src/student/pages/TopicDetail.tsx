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
} from 'lucide-react';
import styles from './SkillExplorer.module.css';

export function TopicDetail() {
  const { skillSlug, topicSlug } = useParams<{ skillSlug: string; topicSlug: string }>();
  const [topic, setTopic] = useState<SkillTopic | null>(null);
  const [subtopics, setSubtopics] = useState<SkillSubtopic[]>([]);
  const [learningEntry, setLearningEntry] = useState<StudentLearningTopic | null>(null);
  const [loading, setLoading] = useState(true);

  const [allSkillTopics, setAllSkillTopics] = useState<any[]>([]);
  const [allLearningTopics, setAllLearningTopics] = useState<any[]>([]);

  // Knowledge Verification Quiz State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
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
    } catch { /* */ }
    setLoading(false);
  }, [skillSlug, topicSlug]);

  useEffect(() => { load(); }, [load]);

  async function handleStartLearning() {
    if (!topic) return;
    try {
      const entry = await studentLearningApi.addTopic(topic.id);
      setLearningEntry(entry);
    } catch { /* */ }
  }

  async function handleStopLearning() {
    if (!learningEntry) return;
    try {
      await studentLearningApi.removeTopic(learningEntry.id);
      setLearningEntry(null);
    } catch { /* */ }
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
    } catch { /* */ }
  }

  function handleAnswerSelect(qId: number, optionIdx: number) {
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
    } catch { /* */ }
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

      {/* Lesson Header Card */}
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

        {/* Study Status Controls */}
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

      {/* Lesson Documentation & Technical Context */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} color="#1c2d81" /> Architecture &amp; Core Concept Breakdown
        </h2>

        <div style={{ color: '#334155', fontSize: '0.925rem', lineHeight: 1.8 }}>
          <p>
            This module covers the core design principles and production standards for <strong>{topic.name}</strong>.
            Understanding these patterns is essential for technical interviews, coding assessments, and scalable system implementations.
          </p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '20px 0 8px' }}>
            Key Competencies &amp; Industry Standards
          </h3>
          <ul style={{ paddingLeft: '20px', margin: '8px 0 16px' }}>
            <li>Master fundamental syntax, runtime execution model, and memory guarantees.</li>
            <li>Implement enterprise design patterns and error handling strategies.</li>
            <li>Analyze time and space complexity bottlenecks during high-throughput workloads.</li>
            <li>Write clean, testable, and maintainable production code following SOLID principles.</li>
          </ul>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '20px 0 8px' }}>
            Production Blueprint &amp; Code Implementation
          </h3>
          <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '16px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', overflowX: 'auto', margin: '12px 0 16px' }}>
<code>{`// Production Implementation Pattern for ${topic.name}
public class ${topic.name.replace(/[^a-zA-Z0-9]/g, '')}Handler {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    public ExecutionResult execute(Context context) {
        logger.info("Executing validated logic for ${topic.name}...");
        try {
            // 1. Validate inputs and state preconditions
            Objects.requireNonNull(context, "Execution context must not be null");
            
            // 2. Perform core high-performance business processing
            return ExecutionResult.success("Operation verified");
        } catch (Exception ex) {
            logger.error("Error during execution", ex);
            throw new ProcessingException("Failed to process ${topic.name}", ex);
        }
    }
}`}</code>
          </pre>
        </div>
      </div>

      {/* Subtopics & Granular Topics */}
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

      {/* Proctored Certification Callout */}
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

      {/* Knowledge Verification Quiz Modal */}
      {showQuizModal && (() => {
        const quizQuestions = [
          {
            id: 1,
            question: `What is the primary architectural principle governing ${topic.name}?`,
            options: [
              `Enforcing deterministic state management, idempotent execution, and robust boundary validation`,
              `Disabling input validation and relying exclusively on runtime exception bypasses`,
              `Storing transient computation variables in unsecured mutable global structures`,
              `Bypassing connection pooling and spawning unbounded raw threads synchronously`,
            ],
            correctIndex: 0,
            explanation: `Production architectures require strict boundary validation, idempotency, and deterministic state transitions.`,
          },
          {
            id: 2,
            question: `When optimizing systems implementing ${topic.name} in high-throughput environments, which strategy is recommended?`,
            options: [
              `Running unindexed linear table scans across all database queries`,
              `Implementing asynchronous non-blocking pipelines, connection pooling, and structured telemetry`,
              `Hardcoding access credentials directly in client-side code constants`,
              `Disabling all logging and transaction isolation levels entirely`,
            ],
            correctIndex: 1,
            explanation: `High-concurrency systems rely on asynchronous non-blocking pipelines, connection pools, and structured telemetry.`,
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
                      Verify your technical comprehension in {topic.name} to complete the lesson
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
                    <strong>1 or more answers were incorrect.</strong> Review the core documentation above and select the correct architectural principles to pass.
                  </div>
                )}

                {quizQuestions.map((q, qIndex) => {
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
                        {q.options.map((opt, optIndex) => {
                          const isSelected = selected === optIndex;
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
                              <span>{opt}</span>
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
                  onClick={() => handleSubmitQuiz(quizQuestions)}
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

