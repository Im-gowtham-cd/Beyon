import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import { api } from '../../services/api/client';
import type { LearningProgram, LearningProgramEnrollment } from '../types/intelligence';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  X,
  PlayCircle,
  FileText,
} from 'lucide-react';
import styles from '../../practice/pages/Gamification.module.css';

export function LearningProgramsPage() {
  const [programs, setPrograms] = useState<LearningProgram[]>([]);
  const [enrollments, setEnrollments] = useState<LearningProgramEnrollment[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'recommended' | 'browse' | 'enrolled'>('recommended');

  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [programModules, setProgramModules] = useState<any[]>([]);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [loadingModules, setLoadingModules] = useState<boolean>(false);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const [p, e, profRes] = await Promise.all([
          intelligenceApi.getLearningPrograms(),
          intelligenceApi.getMyEnrollments(),
          api.get('/student/profile').catch(() => null),
        ]);
        setPrograms(Array.isArray(p) ? p : []);
        setEnrollments(Array.isArray(e) ? e : []);
        const pData = (profRes as any)?.data || profRes;
        setStudentProfile(pData);
      } catch {  }
      setLoading(false);
    }
    load();
  }, []);

  async function handleEnroll(programId: string) {
    try {
      const enrollment = await intelligenceApi.enrollProgram(programId);
      setEnrollments(prev => [...prev, enrollment]);
    } catch {  }
  }

  async function openProgramDocs(prog: LearningProgram) {
    setSelectedProgram(prog);
    setLoadingModules(true);
    try {
      const res = await api.get(`/learning-programs/${prog.id}`);
      const data = (res as any)?.data || res;
      const mods = data?.modules || [];
      setProgramModules(mods);
      setActiveModuleIndex(0);
    } catch {
      setProgramModules([]);
    } finally {
      setLoadingModules(false);
    }
  }

  function handleMarkModuleComplete(moduleId: string) {
    setCompletedModules(prev => new Set([...prev, moduleId]));
  }

  const enrolledIds = new Set(enrollments.map(e => e.programId));

  const preferredRoles = studentProfile?.preferredJobRoles || 'Full Stack Developer';
  const filteredRecommended = programs.filter(p => {
    const title = p.title.toLowerCase();
    if (preferredRoles.toLowerCase().includes('frontend') || preferredRoles.toLowerCase().includes('full stack')) {
      return title.includes('react') || title.includes('frontend') || title.includes('next');
    }
    if (preferredRoles.toLowerCase().includes('ai') || preferredRoles.toLowerCase().includes('data')) {
      return title.includes('ai') || title.includes('generative');
    }
    return title.includes('java') || title.includes('spring') || title.includes('microservices');
  });

  const displayPrograms = tab === 'recommended' ? (filteredRecommended.length > 0 ? filteredRecommended : programs) : programs;

  function getDifficultyColor(d: string) {
    const map: Record<string, string> = {
      BEGINNER: 'rgba(99, 179, 237, 0.15)',
      INTERMEDIATE: 'rgba(72, 187, 120, 0.15)',
      ADVANCED: 'rgba(225, 251, 21, 0.15)',
      EXPERT: 'rgba(159, 122, 234, 0.15)',
    };
    return map[d] || 'rgba(99, 179, 237, 0.15)';
  }

  function getDifficultyTextColor(d: string) {
    const map: Record<string, string> = {
      BEGINNER: '#63b3ed',
      INTERMEDIATE: '#48bb78',
      ADVANCED: '#1c2d81',
      EXPERT: '#9f7aea',
    };
    return map[d] || '#63b3ed';
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 100 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
            <Sparkles size={13} /> Tailored for {preferredRoles} Track
          </div>
          <h1 className={styles.title}>Courses &amp; Structured Learning Programs</h1>
          <p className={styles.subtitle}>
            Industry-aligned curriculum with step-by-step documentation, architecture blueprints, and code exercises.
          </p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'recommended' ? styles.tabActive : ''}`} onClick={() => setTab('recommended')}>
          🎯 Recommended For Your Profile
        </button>
        <button className={`${styles.tab} ${tab === 'browse' ? styles.tabActive : ''}`} onClick={() => setTab('browse')}>
          Browse All Tracks ({programs.length})
        </button>
        <button className={`${styles.tab} ${tab === 'enrolled' ? styles.tabActive : ''}`} onClick={() => setTab('enrolled')}>
          My Enrollments ({enrollments.length})
        </button>
      </div>

      {tab !== 'enrolled' && (
        displayPrograms.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <h3 className={styles.emptyTitle}>No programs available</h3>
            <p className={styles.emptyText}>Learning programs will appear here once published.</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {displayPrograms.map(p => {
              const isEnrolled = enrolledIds.has(p.id);
              return (
                <div key={p.id} className={styles.programCard} style={{ border: tab === 'recommended' ? '1.5px solid #1c2d81' : undefined }}>
                  <div className={styles.programCardHeader}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 className={styles.programTitle} style={{ margin: 0 }}>{p.title}</h3>
                        {tab === 'recommended' && (
                          <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                            ✓ 95% Profile Match
                          </span>
                        )}
                      </div>
                      <span className={styles.programDifficulty} style={{ background: getDifficultyColor(p.difficulty), color: getDifficultyTextColor(p.difficulty) }}>
                        {p.difficulty} &middot; {(p as any).provider || 'Beyon Engineering Guild'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openProgramDocs(p)}
                        style={{
                          padding: '8px 16px',
                          background: '#1c2d81',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <BookOpen size={14} /> Study Course &amp; Docs
                      </button>

                      {!isEnrolled && (
                        <button
                          className={styles.feedActionBtn}
                          onClick={() => handleEnroll(p.id)}
                          style={{
                            padding: '8px 14px',
                            background: !(p as any).isFree && (p as any).cost > 0 ? '#f59e0b' : undefined,
                            color: !(p as any).isFree && (p as any).cost > 0 ? '#000000' : undefined,
                            fontWeight: 700,
                          }}
                        >
                          {!(p as any).isFree && (p as any).cost > 0
                            ? `🪙 Unlock Course (${(p as any).cost} Coins)`
                            : 'Enroll Track (Free)'}
                        </button>
                      )}
                      {isEnrolled && (
                        <span className={styles.testBadge} style={{ alignSelf: 'center', background: '#dcfce7', color: '#15803d' }}>
                          ✓ Enrolled &amp; Unlocked
                        </span>
                      )}
                    </div>
                  </div>

                  {p.description && <p className={styles.programDescription}>{p.description}</p>}

                  <div className={styles.programMeta}>
                    <span style={{ fontWeight: 700, color: '#1c2d81', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                      🏅 {(p as any).credits || 3} Academic &amp; Placement Credits (UGC/AICTE Aligned)
                    </span>
                    <span>⏱ {p.durationHours} Hours</span>
                    <span>📖 4 Modules</span>
                    <span>💰 {p.coinReward || 100} Coins</span>
                    <span>⚡ {p.xpReward || 250} XP</span>
                    <span>🎓 Verified Certificate</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'enrolled' && (
        enrollments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📖</div>
            <h3 className={styles.emptyTitle}>No enrollments yet</h3>
            <p className={styles.emptyText}>Enroll in a learning program from the Recommended tab to start your journey.</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {enrollments.map(e => {
              const program = programs.find(p => p.id === e.programId);
              return (
                <div key={e.id} className={styles.programCard}>
                  <div className={styles.programCardHeader}>
                    <div>
                      <h3 className={styles.programTitle}>{program?.title || 'Learning Track'}</h3>
                      <span className={styles.testBadge}>{e.status}</span>
                    </div>
                    {program && (
                      <button
                        onClick={() => openProgramDocs(program)}
                        style={{
                          padding: '8px 16px',
                          background: '#1c2d81',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <PlayCircle size={14} /> Resume Lessons &amp; Code
                      </button>
                    )}
                  </div>
                  <div className={styles.programProgress}>
                    <div className={styles.programProgressFill} style={{ width: `${e.progressPercent || 25}%` }} />
                  </div>
                  <div className={styles.programMeta}>
                    <span>{e.progressPercent || 25}% Complete</span>
                    <span>Enrolled {new Date(e.enrolledAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {selectedProgram && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '1080px', height: '85vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>

            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  {selectedProgram.provider || 'Beyon Engineering Guild'} &middot; {selectedProgram.difficulty}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  {selectedProgram.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, overflow: 'hidden' }}>

              <div style={{ borderRight: '1px solid #e2e8f0', background: '#fafafa', overflowY: 'auto', padding: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Course Syllabus ({programModules.length} Modules)
                </div>

                {loadingModules ? (
                  <div style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>Loading curriculum...</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {programModules.map((m, idx) => {
                      const isActive = activeModuleIndex === idx;
                      const isDone = completedModules.has(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => setActiveModuleIndex(idx)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: isActive ? '#ffffff' : 'transparent',
                            border: isActive ? '1.5px solid #1c2d81' : '1px solid #e2e8f0',
                            boxShadow: isActive ? '0 2px 8px rgba(28,45,129,0.08)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ marginTop: '2px', color: isDone ? '#15803d' : isActive ? '#1c2d81' : '#94a3b8' }}>
                              {isDone ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 600, color: isActive ? '#0f172a' : '#334155', lineHeight: 1.3 }}>
                                {m.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                ⏱ {m.durationMinutes || 60} mins &middot; {m.moduleType || 'LECTURE'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ overflowY: 'auto', padding: '32px 40px', background: '#ffffff' }}>
                {programModules.length > 0 && programModules[activeModuleIndex] ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1c2d81', background: '#eff6ff', padding: '3px 10px', borderRadius: '12px' }}>
                          Module {activeModuleIndex + 1} of {programModules.length}
                        </span>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
                          {programModules[activeModuleIndex].title}
                        </h1>
                      </div>

                      <button
                        onClick={() => handleMarkModuleComplete(programModules[activeModuleIndex].id)}
                        style={{
                          padding: '8px 18px',
                          background: completedModules.has(programModules[activeModuleIndex].id) ? '#dcfce7' : '#1c2d81',
                          color: completedModules.has(programModules[activeModuleIndex].id) ? '#15803d' : '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {completedModules.has(programModules[activeModuleIndex].id) ? (
                          <>
                            <CheckCircle2 size={16} /> Completed (+50 XP)
                          </>
                        ) : (
                          'Mark Module Completed'
                        )}
                      </button>
                    </div>

                    <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.7 }}>
                      <div
                        style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
                        dangerouslySetInnerHTML={{
                          __html: (programModules[activeModuleIndex].description || '')
                            .replace(/### (.*)/g, '<h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin: 20px 0 8px;">$1</h3>')
                            .replace(/```(java|tsx|ts|sql|json|python)?\n([\s\S]*?)```/g, '<pre style="background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 0.85rem; overflow-x: auto; margin: 16px 0;"><code>$2</code></pre>')
                            .replace(/- (.*)/g, '<li style="margin-left: 20px; list-style-type: disc;">$1</li>')
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Select a module from the sidebar to start reading.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

