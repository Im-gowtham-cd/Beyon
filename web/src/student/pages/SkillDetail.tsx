import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taxonomyApi, studentLearningApi } from '../services/taxonomyApi';
import type { TaxonomySkill, SkillTopic, StudentLearningTopic } from '../types/taxonomy';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  Lock,
} from 'lucide-react';
import styles from './SkillExplorer.module.css';

export function SkillDetail() {
  const { skillSlug } = useParams<{ skillSlug: string }>();
  const [skill, setSkill] = useState<TaxonomySkill | null>(null);
  const [topics, setTopics] = useState<SkillTopic[]>([]);
  const [learningTopics, setLearningTopics] = useState<StudentLearningTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingSkill, setEnrollingSkill] = useState(false);
  const [enrolledSuccess, setEnrolledSuccess] = useState(false);

  const load = useCallback(async () => {
    if (!skillSlug) return;
    try {
      setLoading(true);
      const [s, t, lt] = await Promise.all([
        taxonomyApi.getSkill(skillSlug),
        taxonomyApi.getTopics(skillSlug),
        studentLearningApi.getTopics().catch(() => []),
      ]);
      setSkill(s);
      setTopics(t);
      setLearningTopics(lt);
    } catch { /* */ }
    setLoading(false);
  }, [skillSlug]);

  useEffect(() => { load(); }, [load]);

  async function handleAddLearning(topicId: string) {
    try {
      await studentLearningApi.addTopic(topicId);
      const lt = await studentLearningApi.getTopics();
      setLearningTopics(lt);
    } catch { /* */ }
  }

  async function handleRemoveLearning(learningId: string) {
    try {
      await studentLearningApi.removeTopic(learningId);
      setLearningTopics(prev => prev.filter(l => l.id !== learningId));
    } catch { /* */ }
  }

  async function handleEnrollAllTopics() {
    if (!topics.length || !skill) return;
    setEnrollingSkill(true);
    try {
      await studentLearningApi.addSkill(skill.id, skill.name).catch(() => {});
      for (const t of topics) {
        if (!learningTopics.some(l => l.topicId === t.id)) {
          await studentLearningApi.addTopic(t.id).catch(() => {});
        }
      }
      const lt = await studentLearningApi.getTopics();
      setLearningTopics(lt);
      setEnrolledSuccess(true);
      setTimeout(() => setEnrolledSuccess(false), 4000);
    } catch { /* */ }
    finally {
      setEnrollingSkill(false);
    }
  }

  const completedCount = learningTopics.filter(
    l => l.status === 'COMPLETED' && topics.some(t => t.id === l.topicId)
  ).length;

  const totalTopics = topics.length || 1;
  const progressPercent = Math.round((completedCount / totalTopics) * 100);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ width: 240, height: 28 }} />
          <div className={styles.skeleton} style={{ width: '100%', height: 120 }} />
          <div className={styles.skeleton} style={{ width: '100%', height: 80 }} />
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Skill not found in taxonomy.</p>
          <Link to="/student/skills" className={styles.categoryChip}>Back to Skill Matrix</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
        <Link to="/student/skills" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
          Skills Matrix
        </Link>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <span style={{ color: '#1c2d81', fontWeight: 700 }}>{skill.name}</span>
      </nav>

      {/* Skill Banner & Actions */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
              <Sparkles size={12} /> {skill.category || 'Core Technology'}
            </div>
            <h1 className={styles.title} style={{ margin: '0 0 6px' }}>{skill.name}</h1>
            <p style={{ color: '#475569', fontSize: '0.9rem', maxWidth: '720px', lineHeight: 1.6, margin: 0 }}>
              {skill.description || `Comprehensive learning track, documentation, and verified coding curriculum for ${skill.name}.`}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
            <button
              onClick={handleEnrollAllTopics}
              disabled={enrollingSkill}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: enrolledSuccess ? '#15803d' : '#1c2d81',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {enrolledSuccess ? (
                <>
                  <CheckCircle2 size={16} /> Added to Study Roadmap!
                </>
              ) : enrollingSkill ? (
                'Enrolling Topics...'
              ) : (
                <>
                  <PlusCircle size={16} /> I Wish to Study This Skill
                </>
              )}
            </button>

            {completedCount > 0 && completedCount >= totalTopics ? (
              <Link
                to="/assessment"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: 'linear-gradient(135deg, #1c2d81 0%, #253cac 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(28,45,129,0.25)',
                }}
              >
                <ShieldCheck size={16} /> 🔓 Take Proctored Certification Exam
              </Link>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  textAlign: 'center',
                  cursor: 'not-allowed',
                }}
                title="Complete 100% of all lessons to unlock the AI-proctored certification exam"
              >
                <Lock size={14} color="#94a3b8" />
                <span>Locked: Complete 100% ({completedCount}/{totalTopics}) to Unlock Exam</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '160px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: '#1c2d81', transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
              {completedCount} / {totalTopics} Topics Completed ({progressPercent}%)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
            <span>📖 {topics.length} Structured Lessons</span>
            <span>⚡ +250 Skill XP on Completion</span>
            <span>🎓 Verified Skill Badge</span>
          </div>
        </div>
      </div>

      {/* Topics & Study Modules */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Study Lessons &amp; Documentation Modules
        </h2>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Click any lesson to read documentation, blueprints &amp; solve exercises
        </span>
      </div>

      <div className={styles.skillsGrid}>
        {topics.map((topic, idx) => {
          const isLearning = learningTopics.some(l => l.topicId === topic.id);
          const learningEntry = learningTopics.find(l => l.topicId === topic.id);
          const isDone = learningEntry?.status === 'COMPLETED';

          return (
            <div
              key={topic.id}
              className={styles.skillCard}
              style={{
                cursor: 'default',
                background: '#ffffff',
                border: isDone ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1c2d81', background: '#eff6ff', padding: '2px 8px', borderRadius: '10px' }}>
                    Lesson {idx + 1}
                  </span>
                  {isDone && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#15803d', fontSize: '0.75rem', fontWeight: 700 }}>
                      <CheckCircle2 size={13} /> Completed
                    </span>
                  )}
                </div>

                <Link
                  to={`/student/skills/${skillSlug}/${topic.slug}`}
                  style={{ textDecoration: 'none', color: '#0f172a' }}
                >
                  <h3 className={styles.skillName} style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700 }}>
                    {topic.name}
                  </h3>
                </Link>
                {topic.description && (
                  <p className={styles.skillDescription} style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#475569' }}>
                    {topic.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link
                  to={`/student/skills/${skillSlug}/${topic.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#1c2d81',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <BookOpen size={14} /> Read Docs &amp; Code <ArrowRight size={13} />
                </Link>

                {isLearning ? (
                  <button
                    onClick={() => learningEntry && handleRemoveLearning(learningEntry.id)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #cbd5e1',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      color: '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ● Enrolled
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddLearning(topic.id)}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      color: '#1d4ed8',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Add to Study
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {topics.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No lessons available for this skill yet.</p>
        </div>
      )}
    </div>
  );
}

