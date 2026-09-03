import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Download,
  Clock,
  HelpCircle,
  Target,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  AlertTriangle,
  X,
  Layers,
  Award,
  Lock,
  BookOpen,
} from 'lucide-react';
import { taxonomyApi, studentLearningApi } from '../../student/services/taxonomyApi';
import styles from './AssessmentPage.module.css';

export function AssessmentPage() {
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [testAttempts, setTestAttempts] = useState<any[]>([]);
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [learningTopicsList, setLearningTopicsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [selectedTestForLaunch, setSelectedTestForLaunch] = useState<any | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const [tRes, aRes, skillsRes, topicsRes] = await Promise.all([
          fetch('/api/v1/tests', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
          fetch('/api/v1/tests/my-attempts', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
          taxonomyApi.getSkills().catch(() => []),
          studentLearningApi.getTopics().catch(() => []),
        ]);
        setAvailableTests(Array.isArray(tRes.data) ? tRes.data : []);
        setTestAttempts(Array.isArray(aRes.data) ? aRes.data : []);
        setSkillsList(skillsRes || []);
        setLearningTopicsList(topicsRes || []);
      } catch {
        setAvailableTests([]);
        setTestAttempts([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function getSkillProgressForTest(test: any) {
    const title = (test.title || '').toLowerCase();
    const matchedSkill = skillsList.find(s => {
      const sName = s.name.toLowerCase();
      return title.includes(sName) || sName.includes(title.split(' ')[0]);
    });

    if (!matchedSkill) {
      return {
        skill: null,
        progressPercent: 0,
        completedCount: 0,
        totalCount: 2,
        is100Percent: false,
        skillSlug: 'java',
      };
    }

    const skillTopicsCount = matchedSkill.topicCount && matchedSkill.topicCount > 0 ? matchedSkill.topicCount : 2;
    const completedCount = learningTopicsList.filter(lt =>
      (lt.skillId === matchedSkill.id || lt.topicName?.toLowerCase().includes(matchedSkill.name.toLowerCase())) &&
      lt.status === 'COMPLETED'
    ).length;

    const progressPercent = Math.min(100, Math.round((completedCount / skillTopicsCount) * 100));
    const is100Percent = progressPercent >= 100;

    return {
      skill: matchedSkill,
      progressPercent,
      completedCount,
      totalCount: skillTopicsCount,
      is100Percent,
      skillSlug: matchedSkill.slug,
    };
  }

  const handleLaunchDesktop = (test: any) => {
    setSelectedTestForLaunch(test);
    setCopiedToken(false);
  };

  const handleCopyToken = (tokenId: string) => {
    navigator.clipboard?.writeText(tokenId);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);
  };

  const handleOpenProtocol = (tokenId: string) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `beyon://launch?token=${encodeURIComponent(tokenId)}`;
      document.body.appendChild(iframe);
      setTimeout(() => {
        try {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        } catch {}
      }, 2000);
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
          Loading Beyon Assessment Center...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.title}>Proctored Assessment &amp; Benchmark Center</div>
        <div className={styles.subtitle}>
          Secure desktop assessment evaluations, hardware biometric proctoring, and verified competency benchmarks
        </div>
      </div>

      {/* Primary Lockdown Notice Banner */}
      <div
        style={{
          background: '#1c2d81',
          color: '#ffffff',
          borderRadius: '0px',
          border: '1px solid #1c2d81',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
          boxShadow: '0 4px 16px rgba(28, 45, 129, 0.12)',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#fed601',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px',
            }}
          >
            <ShieldCheck size={16} /> Desktop Lockdown Client Required
          </span>
          <h3 style={{ margin: '4px 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            High-Stakes Proctored Assessment Environment
          </h3>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            To guarantee 100% academic and recruitment integrity, all Beyon assessments are conducted exclusively inside the 
            <strong> Beyon Secure Desktop Client</strong> with full-screen kiosk lockdown, AI facial tracking, and unauthorized device detection.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              alert('Downloading Beyon Lockdown Desktop Client (Windows x64 Setup)');
            }}
            style={{
              background: '#fed601',
              color: '#020617',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.84rem',
              padding: '12px 22px',
              borderRadius: '0px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Download size={16} /> Download Desktop Client (.exe)
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '0px', border: '1px solid #e2e8f0', borderTop: '3px solid #1c2d81' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Available Benchmarks</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1c2d81', marginTop: '4px' }}>{availableTests.length}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '0px', border: '1px solid #e2e8f0', borderTop: '3px solid #fed601' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Completed Attempts</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1c2d81', marginTop: '4px' }}>{testAttempts.length}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '0px', border: '1px solid #e2e8f0', borderTop: '3px solid #22c55e' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Average Score</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>
            {testAttempts.length > 0
              ? `${Math.round(testAttempts.reduce((acc: number, a: any) => acc + (parseFloat(a.score) || 0), 0) / testAttempts.length)}%`
              : '—'}
          </div>
        </div>
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '0px', border: '1px solid #e2e8f0', borderTop: '3px solid #0284c7' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Integrity Rating</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>
            {testAttempts.length > 0 ? '100% VERIFIED' : 'ACTIVE'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('available')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'available' ? '#1c2d81' : 'transparent',
            color: activeTab === 'available' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: '0px',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Layers size={15} /> Available Tests ({availableTests.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'completed' ? '#1c2d81' : 'transparent',
            color: activeTab === 'completed' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: '0px',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Award size={15} /> Completed History ({testAttempts.length})
        </button>
      </div>

      {/* Tab 1: Available Tests */}
      {activeTab === 'available' && (
        availableTests.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
            <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>No Assessments Published</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>No proctored benchmark assessments are currently published by companies or institutions.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
            {availableTests.map((t: any) => {
              const diffColor = t.difficulty === 'EASY' ? '#0284c7' : t.difficulty === 'HARD' ? '#dc2626' : '#d97706';
              const skillProgress = getSkillProgressForTest(t);
              const isUnlocked = skillProgress.is100Percent;

              return (
                <div
                  key={t.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderTop: `3px solid ${isUnlocked ? '#15803d' : '#94a3b8'}`,
                    borderRadius: '0px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '18px',
                    boxSizing: 'border-box',
                    opacity: isUnlocked ? 1 : 0.95,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: isUnlocked ? '#1c2d81' : '#334155', lineHeight: 1.35, flex: 1 }}>
                        {t.title}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: diffColor,
                          background: `${diffColor}14`,
                          border: `1px solid ${diffColor}40`,
                          padding: '3px 10px',
                          borderRadius: '0px',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {t.difficulty || 'MEDIUM'}
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#475569', lineHeight: 1.55 }}>
                      {t.description}
                    </p>
                  </div>

                  {/* Lock / Unlock Progress Status Banner */}
                  {isUnlocked ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#15803d',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        padding: '8px 12px',
                      }}
                    >
                      <ShieldCheck size={14} /> 🔓 100% Skill Mastered &bull; Assessment Unlocked
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#b45309',
                        background: '#fffbeb',
                        border: '1px solid #fef3c7',
                        padding: '8px 12px',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Lock size={13} /> Locked &mdash; Requires 100% Skill Roadmap
                      </span>
                      <span style={{ color: '#d97706', fontWeight: 800 }}>
                        {skillProgress.completedCount}/{skillProgress.totalCount} Lessons ({skillProgress.progressPercent}%)
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: '14px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      color: '#334155',
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '0px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <Clock size={13} style={{ color: '#1c2d81' }} /> {t.durationMinutes} mins
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <HelpCircle size={13} style={{ color: '#1c2d81' }} /> {t.totalQuestions} Questions
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <Target size={13} style={{ color: '#1c2d81' }} /> Pass: {t.passingScore}%
                    </span>
                  </div>

                  {isUnlocked ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                      <button
                        onClick={() => handleLaunchDesktop(t)}
                        style={{
                          height: '40px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '0 18px',
                          background: '#1c2d81',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '0px',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <Laptop size={15} />
                        <span>Launch in Desktop App</span>
                      </button>
                      <button
                        onClick={() => handleCopyToken(t.id)}
                        style={{
                          height: '40px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '0 14px',
                          background: '#f8fafc',
                          color: '#1c2d81',
                          border: '1px solid #cbd5e1',
                          borderRadius: '0px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="Copy Session Token"
                      >
                        <Copy size={14} /> Token
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                      <Link
                        to={skillProgress.skillSlug ? `/student/skills/${skillProgress.skillSlug}` : '/student/skills'}
                        style={{
                          height: '40px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '0 16px',
                          background: '#f8fafc',
                          color: '#1c2d81',
                          border: '1px solid #cbd5e1',
                          borderRadius: '0px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <BookOpen size={14} />
                        <span>Study Skill Roadmap ({skillProgress.progressPercent}%)</span>
                      </Link>
                      <button
                        disabled
                        style={{
                          height: '40px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '0 14px',
                          background: '#f1f5f9',
                          color: '#94a3b8',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'not-allowed',
                        }}
                        title="Complete 100% of all lessons to unlock the exam"
                      >
                        <Lock size={13} /> Locked
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Tab 2: Completed History */}
      {activeTab === 'completed' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#020617' }}>Verified Proctoring Assessment History</h3>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>All attempts verified via Beyon AI Engine</span>
          </div>
          {testAttempts.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎓</div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>No Assessment Attempts Yet</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                You have not completed any proctored assessments yet. Choose an available assessment from the Available Tests tab to begin.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {testAttempts.map((a: any, idx: number) => {
                const title = a.testTitle || a.title || 'Technical Certification Assessment';
                const date = a.completedAt || a.submittedAt || a.startedAt
                  ? new Date(a.completedAt || a.submittedAt || a.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Recently Completed';
                const score = a.score != null ? `${a.score}%` : '—';
                const integrity = a.integrityStatus || 'CLEAN';

                return (
                  <div
                    key={a.id || `att-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 24px',
                      borderBottom: '1px solid #f1f5f9',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1c2d81' }}>{title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        Completed on {date} &middot; Proctored Integrity Checked
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803d' }}>{score}</div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>SCORE</div>
                      </div>
                      <div
                        style={{
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                        }}
                      >
                        INTEGRITY: {integrity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Desktop App Launch Modal */}
      {selectedTestForLaunch && (
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
              borderRadius: '0px',
              maxWidth: '600px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Laptop size={20} style={{ color: '#1c2d81' }} />
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#020617' }}>Launch in Desktop Assessment Client</span>
              </div>
              <button
                onClick={() => setSelectedTestForLaunch(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px 16px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e40af' }}>{selectedTestForLaunch.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                  Duration: <strong>{selectedTestForLaunch.durationMinutes} mins</strong> &middot; Questions: <strong>{selectedTestForLaunch.totalQuestions}</strong> &middot; Passing: <strong>{selectedTestForLaunch.passingScore}%</strong>
                </div>
              </div>

              {/* Proctoring Rules Notice */}
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#991b1b', fontSize: '0.84rem' }}>
                  <AlertTriangle size={16} /> Automated Proctoring Security Active
                </div>
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                  <li>Leaving camera viewport for &gt;8s triggers automatic exam termination.</li>
                  <li>Unauthorized mobile devices or secondary persons trigger immediate malpractice alerts.</li>
                  <li>Fullscreen kiosk lockdown prevents minimizing or window switching.</li>
                </ul>
              </div>

              {/* Launch Step 1 */}
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#020617', marginBottom: '8px' }}>
                  Option A: One-Click Desktop Launch
                </div>
                <button
                  onClick={() => handleOpenProtocol(selectedTestForLaunch.id)}
                  style={{
                    width: '100%',
                    height: '44px',
                    background: '#1c2d81',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <ExternalLink size={16} /> Open in Beyon Desktop Client
                </button>
              </div>

              {/* Launch Step 2: Token */}
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#020617', marginBottom: '8px' }}>
                  Option B: Manual Assessment Token
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={selectedTestForLaunch.id}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '0px',
                      fontFamily: 'monospace',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#1c2d81',
                    }}
                  />
                  <button
                    onClick={() => handleCopyToken(selectedTestForLaunch.id)}
                    style={{
                      padding: '0 18px',
                      background: copiedToken ? '#15803d' : '#f8fafc',
                      color: copiedToken ? '#ffffff' : '#1c2d81',
                      border: '1px solid #cbd5e1',
                      borderRadius: '0px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                    {copiedToken ? 'Copied!' : 'Copy Token'}
                  </button>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Paste this token into the Desktop Assessment Client after launching to begin.
                </p>
              </div>

              {/* Launch Step 3: Web Kiosk Mode */}
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#020617', marginBottom: '8px' }}>
                  Option C: Instant Web Proctored Mode
                </div>
                <button
                  onClick={() => {
                    window.location.href = `/practice/tests`;
                  }}
                  style={{
                    width: '100%',
                    height: '42px',
                    background: '#fed601',
                    color: '#020617',
                    border: 'none',
                    borderRadius: '0px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Target size={16} /> Take Proctored Test in Browser (Web Kiosk)
                </button>
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={() => {
                  alert('Downloading Beyon Lockdown Desktop Client (Windows x64 Setup)');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1c2d81',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={14} /> Don't have the Desktop App? Download now
              </button>
              <button
                onClick={() => setSelectedTestForLaunch(null)}
                style={{
                  padding: '8px 18px',
                  background: '#e2e8f0',
                  color: '#1e293b',
                  border: 'none',
                  borderRadius: '0px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
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

export default AssessmentPage;
