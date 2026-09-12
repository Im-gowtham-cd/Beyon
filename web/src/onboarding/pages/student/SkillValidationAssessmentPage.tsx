import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  BarChart3,
  Loader2,
  Monitor,
  Lock,
  Copy,
  Check,
  Layers,
  Target,
} from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import { api } from '../../../services/api/client';
import { getRecommendedSkillsForCandidate } from './StudentOnboarding';
import styles from './SkillValidationAssessment.module.css';

interface SkillScoreResult {
  skillName: string;
  totalQuestions: number;
  correctQuestions: number;
  percentage: number;
  verified: boolean;
  rank: number;
  totalRanked: number;
  retestAvailableAt?: string;
}

interface LaggedTopicItem {
  topicName: string;
  skillName: string;
  accuracy: number;
  status: string;
}

interface AssessmentStatusResponse {
  hasCompletedAssessment: boolean;
  assessmentCompletedAt?: string;
  canRetest: boolean;
  retestAvailableAt?: string;
  cooldownRemainingSeconds: number;
  skills: SkillScoreResult[];
  laggedTopics?: LaggedTopicItem[];
}

export function SkillValidationAssessmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, refreshProfileStatus, refreshUser } = useAuth();

  // Mode: 'LOADING' | 'LAUNCHPAD' | 'RESULTS'
  const [mode, setMode] = useState<'LOADING' | 'LAUNCHPAD' | 'RESULTS'>('LOADING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status and Results
  const [statusData, setStatusData] = useState<AssessmentStatusResponse | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [studentProfile, setStudentProfile] = useState<any | null>(null);
  const [chosenSkills, setChosenSkills] = useState<string[]>([]);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [launchingDesktop, setLaunchingDesktop] = useState(false);

  // Load Status and Profile
  const loadStatusAndProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [statusRes, profRes, skillsRes] = await Promise.all([
        api.get('/skills/assessment/status').catch(() => null),
        api.get('/student/profile').catch(() => null),
        api.get('/student/skills').catch(() => null),
      ]);

      const status: AssessmentStatusResponse | null = (statusRes as any)?.data || statusRes || null;
      if (status) {
        setStatusData(status);
        if (status.retestAvailableAt) {
          setCooldownSeconds(status.cooldownRemainingSeconds || 0);
        }
      }

      const prof = (profRes as any)?.data || profRes || null;
      if (prof) {
        setStudentProfile(prof);
      }

      const dbSkillsData: any[] = (skillsRes as any)?.data || (Array.isArray(skillsRes) ? skillsRes : []);

      // Strictly prioritize the candidate's chosen skills from onboarding:
      // 1. Navigation state from onboarding submission
      // 2. student_skills database records for this student
      // 3. LocalStorage persistence from onboarding
      // 4. Skills reported in assessment status
      // 5. Dynamic department-tailored suggestions (never hardcoded Java/DSA/Python/SQL list!)
      let candidateSkills: string[] = [];

      if (location.state && Array.isArray((location.state as any).chosenSkills) && (location.state as any).chosenSkills.length > 0) {
        candidateSkills = (location.state as any).chosenSkills.map((s: any) => String(s).trim()).filter(Boolean);
      }

      if (candidateSkills.length === 0 && dbSkillsData.length > 0) {
        candidateSkills = dbSkillsData.map((s: any) => (s.skillName || s.name || '').trim()).filter(Boolean);
      }

      if (candidateSkills.length === 0) {
        try {
          const raw = localStorage.getItem('beyon_onboarding_chosen_skills');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              candidateSkills = parsed.map((s: any) => String(s).trim()).filter(Boolean);
            }
          }
        } catch {}
      }

      if (candidateSkills.length === 0 && status && Array.isArray(status.skills) && status.skills.length > 0) {
        candidateSkills = status.skills.map((s: any) => (s.skillName || '').trim()).filter(Boolean);
      }

      if (candidateSkills.length === 0) {
        const dept = prof?.department || (user as any)?.department || 'Computer Science and Engineering';
        const roles = prof?.preferredJobRoles || [];
        const recs = getRecommendedSkillsForCandidate(dept, roles);
        candidateSkills = recs.map(r => r.name);
      }

      // Deduplicate and cap to 5 skills to keep clean section partitions
      const uniqueSkills = Array.from(new Set(candidateSkills));
      const finalSections = uniqueSkills.slice(0, 5);
      setChosenSkills(finalSections);

      if (status?.hasCompletedAssessment) {
        setMode('RESULTS');
      } else {
        setMode('LAUNCHPAD');
      }
    } catch (err: any) {
      console.error('Failed to load assessment status or profile:', err);
      setMode('LAUNCHPAD');
    } finally {
      setLoading(false);
    }
  }, [location.state, (user as any)?.department]);

  useEffect(() => {
    loadStatusAndProfile();
  }, [loadStatusAndProfile]);

  // Live polling for assessment completion when in LAUNCHPAD mode
  useEffect(() => {
    if (mode !== 'LAUNCHPAD') return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get('/skills/assessment/status');
        const status: AssessmentStatusResponse = (res as any)?.data || res;
        if (status?.hasCompletedAssessment) {
          setStatusData(status);
          await refreshProfileStatus();
          await refreshUser();
          setMode('RESULTS');
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [mode, refreshProfileStatus, refreshUser]);

  // Cooldown countdown timer in RESULTS mode
  useEffect(() => {
    if (mode !== 'RESULTS' || cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, cooldownSeconds]);

  // Deep link construction
  const effectiveToken = token || localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token') || '';
  const skillsParam = chosenSkills.length > 0 ? `&skills=${encodeURIComponent(chosenSkills.join(','))}` : '';
  const desktopDeepLink = 'beyon://assessment?token=' + encodeURIComponent(effectiveToken) + '&type=skill-assessment' + skillsParam;

  const handleLaunchDesktop = () => {
    setLaunchingDesktop(true);
    window.location.href = desktopDeepLink;
    setTimeout(() => {
      setLaunchingDesktop(false);
    }, 3000);
  };

  const handleCopyPasscode = () => {
    if (effectiveToken) {
      navigator.clipboard.writeText(effectiveToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  const formatCooldown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return 'Cooldown Expired — Retest Available Now';
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  // ----------------------------------------------------
  // RENDER: LOADING STATE
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '16px' }}>
          <Loader2 size={42} color="#1c2d81" style={{ animation: 'spin 1s linear infinite' }} />
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#1c2d81' }}>
            Checking Skill Validation Assessment Status
          </h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Verifying credential registry and proctoring session configuration...
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: RESULTS & REMEDIATION VIEW
  // ----------------------------------------------------
  if (mode === 'RESULTS') {
    const skillsList: SkillScoreResult[] = statusData?.skills || [];
    const overallPct = skillsList.length > 0
      ? Math.round((skillsList.reduce((acc, s) => acc + (s.percentage || 0), 0) / skillsList.length) * 10) / 10
      : 0;
    const totalCorrect = skillsList.reduce((acc, s) => acc + (s.correctQuestions || 0), 0);
    const totalQuestions = skillsList.reduce((acc, s) => acc + (s.totalQuestions || 0), 0) || 50;
    const canRetestNow = statusData?.canRetest || cooldownSeconds <= 0;
    const laggedTopics = statusData?.laggedTopics || [];

    return (
      <div className={styles.pageContainer}>
        <header className={styles.topBar}>
          <div className={styles.brandGroup}>
            <div className={styles.brandBadge}>B</div>
            <div>
              <span className={styles.brandTitle}>Beyon Career Intelligence</span>
              <span className={styles.brandSub}>Skill Validation &amp; Assessment Registry</span>
            </div>
          </div>
          <div className={styles.topBarRight}>
            <div className={styles.timerBadge}>
              <ShieldCheck size={16} />
              <span>Assessment Verified</span>
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          <div className={styles.resultsContainer}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsBadge}>
                <CheckCircle2 size={16} />
                50-Question Technical Validation Completed
              </div>
              <h1 className={styles.resultsTitle}>Skill Assessment Results &amp; Diagnostic Standing</h1>
              <p className={styles.resultsSub}>
                Your scores have been validated against our central question bank via the secure Beyon Desktop proctored environment.
                Skill-wise section scores and topic-level remediation metrics are registered below.
              </p>
            </div>

            {/* Overall Score Banner */}
            <div style={{ background: '#f8fafc', border: '2px solid #1c2d81', padding: '24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Overall Score
                </span>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1c2d81' }}>{overallPct}%</span>
              </div>

              <div style={{ width: '1px', height: '50px', background: '#cbd5e1' }} />

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Questions Solved
                </span>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#15803d' }}>
                  {totalCorrect} <span style={{ fontSize: '1.2rem', color: '#64748b' }}>/ {totalQuestions}</span>
                </span>
              </div>

              <div style={{ width: '1px', height: '50px', background: '#cbd5e1' }} />

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Validation Status
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={20} /> Verified Student
                </span>
              </div>
            </div>

            {/* Topic Remediation Report */}
            {laggedTopics.length > 0 ? (
              <div className={styles.remediationResultsCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Target size={24} color="#dc2626" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#991b1b' }}>
                      Lagged Topics Identified &middot; 50% Adaptive Remediation Focus Active
                    </h4>
                    <span style={{ fontSize: '0.82rem', color: '#7f1d1d' }}>
                      Diagnostic analysis identified specific topics where accuracy fell below 50%:
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '14px' }}>
                  {laggedTopics.map((lt, idx) => (
                    <div key={idx} style={{ background: '#ffffff', border: '1.5px solid #f87171', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{lt.topicName}</strong>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '2px 6px', background: '#fee2e2', color: '#dc2626' }}>
                          {lt.accuracy}% Accuracy
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Skill Domain: {lt.skillName}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '14px', padding: '12px 16px', background: '#fffbeb', border: '1px solid #fcd34d', fontSize: '0.84rem', color: '#92400e', lineHeight: 1.6 }}>
                  <AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} />
                  <strong>Adaptive Prioritization Rule:</strong> In your subsequent practice sessions and assessments, <strong>50% of questions will focus on these lagged topics</strong> to reinforce your fundamentals, while the remaining <strong>50% will be a balanced mix of other domain topics</strong>.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: '#f0fdf4', border: '1px solid #86efac', marginBottom: '28px' }}>
                <ShieldCheck size={26} color="#15803d" />
                <div>
                  <strong style={{ color: '#15803d', fontSize: '0.96rem', display: 'block' }}>Conceptual Mastery Confirmed</strong>
                  <span style={{ fontSize: '0.84rem', color: '#166534' }}>
                    No lagging topics detected across your chosen skills. You have achieved &gt;= 50% accuracy across all evaluated topics.
                  </span>
                </div>
              </div>
            )}

            {/* Per-Skill Breakdown Grid */}
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1c2d81', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} /> Skill-Wise Section Breakdown &amp; Global Standings
            </h3>

            <div className={styles.skillsGrid}>
              {skillsList.map(skill => {
                const isPass = (skill.percentage || 0) >= 50.0;
                return (
                  <div key={skill.skillName} className={styles.skillScoreCard}>
                    <div>
                      <div className={styles.skillCardTop}>
                        <h4 className={styles.skillNameText}>{skill.skillName}</h4>
                        {isPass ? (
                          <span className={styles.verifiedTag}>
                            <CheckCircle2 size={12} /> VERIFIED
                          </span>
                        ) : (
                          <span className={styles.unverifiedTag}>
                            UNDER REVIEW
                          </span>
                        )}
                      </div>

                      <div className={styles.scorePercentageRow}>
                        <span className={styles.scorePercentage}>{skill.percentage}%</span>
                        <span className={styles.scoreQuestionsRatio}>
                          ({skill.correctQuestions || 0} / {skill.totalQuestions || 0} Correct)
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: '6px', background: '#e2e8f0', margin: '8px 0 14px', borderRadius: '0px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${skill.percentage}%`, background: isPass ? '#15803d' : '#f59e0b' }} />
                      </div>
                    </div>

                    {/* Global Rank Standing */}
                    <div className={styles.rankBadge}>
                      <Trophy size={16} color="#ca8a04" />
                      <span>
                        Global Standing: <strong>#{skill.rank || 1}</strong> in {skill.skillName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 7-Day Retest Cooldown Section */}
            <div className={styles.cooldownBanner}>
              <div className={styles.cooldownLeft}>
                <Clock size={28} color="#1e40af" />
                <div>
                  <h4 className={styles.cooldownTitle}>Evaluation Cooldown Period (1 Week)</h4>
                  <p className={styles.cooldownDesc}>
                    Students are permitted to rewrite the 50-question skill assessment once every 7 days to demonstrate improved mastery.
                    Future tests automatically exclude previously seen questions and prioritize identified weak topics.
                  </p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Cooldown Status
                </span>
                <div className={styles.cooldownTicker}>
                  {formatCooldown(cooldownSeconds)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.resultsActions}>
              <button
                type="button"
                onClick={handleLaunchDesktop}
                disabled={!canRetestNow}
                className={styles.btnSecondary}
                style={{
                  padding: '12px 24px',
                  background: canRetestNow ? '#ffffff' : '#f1f5f9',
                  color: canRetestNow ? '#1c2d81' : '#94a3b8',
                  borderColor: canRetestNow ? '#1c2d81' : '#cbd5e1',
                  cursor: canRetestNow ? 'pointer' : 'not-allowed',
                }}
                title={canRetestNow ? 'Rewrite test in desktop app' : 'Retest unlocks after 7-day cooldown'}
              >
                <RotateCcw size={16} />
                <span>Rewrite in Desktop App (Unlocks in 7 Days)</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/student/home')}
                className={styles.btnPrimary}
                style={{ padding: '12px 32px' }}
              >
                <span>Proceed to Student Hub &amp; Explore Opportunities</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: DESKTOP PROCTORED LAUNCHPAD
  // ----------------------------------------------------
  const studentName = user?.name || studentProfile?.fullName || 'Candidate';
  const departmentName = studentProfile?.department || 'Computer Science and Engineering';
  const degreeName = studentProfile?.degree || 'B.E';
  const institutionName = studentProfile?.institution || 'Kongu Engineering College';
  const registrationNo = studentProfile?.registrationNumber || '23CSR068';

  return (
    <div className={styles.pageContainer}>
      <header className={styles.topBar}>
        <div className={styles.brandGroup}>
          <div className={styles.brandBadge}>B</div>
          <div>
            <span className={styles.brandTitle}>Beyon Career Intelligence</span>
            <span className={styles.brandSub}>Mandatory Skill Validation Assessment</span>
          </div>
        </div>

        <div className={styles.topBarRight}>
          <div className={styles.timerBadge}>
            <Lock size={16} />
            <span>Desktop Proctor Required</span>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.88rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.launchpadContainer}>
          {/* Hero Banner */}
          <div className={styles.launchpadHero}>
            <div className={styles.heroTag}>
              <Monitor size={14} /> Mandatory Proctored Desktop Examination
            </div>
            <h1 className={styles.launchpadTitle}>
              Skill Validation Assessment (50 Questions)
            </h1>
            <p className={styles.launchpadSub}>
              To maintain academic integrity and verifiable credentials for institutional placement drives and enterprise recruitment,
              the 50-Question Skill Validation Assessment must be conducted exclusively inside the secure <strong>Beyon Desktop Application</strong> with kiosk lockdown, webcam verification, and dual-camera monitoring.
            </p>
          </div>

          <div className={styles.launchpadGrid}>
            {/* Left Card: Candidate & Chosen Skill Sections */}
            <div className={styles.cardSection}>
              <div className={styles.cardHeader}>
                <Layers size={20} color="#1c2d81" />
                <h3 className={styles.cardHeaderTitle}>Candidate Profile &amp; Skill Sections</h3>
              </div>

              <div className={styles.candidateInfoList}>
                <div className={styles.candidateInfoRow}>
                  <span className={styles.candidateInfoLabel}>Candidate Name</span>
                  <span className={styles.candidateInfoValue}>{studentName}</span>
                </div>
                <div className={styles.candidateInfoRow}>
                  <span className={styles.candidateInfoLabel}>Institution</span>
                  <span className={styles.candidateInfoValue}>{institutionName}</span>
                </div>
                <div className={styles.candidateInfoRow}>
                  <span className={styles.candidateInfoLabel}>Degree &amp; Department</span>
                  <span className={styles.candidateInfoValue}>{degreeName} &middot; {departmentName}</span>
                </div>
                <div className={styles.candidateInfoRow}>
                  <span className={styles.candidateInfoLabel}>Registration Number</span>
                  <span className={styles.candidateInfoValue}>{registrationNo}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Partitioned Skill Sections ({chosenSkills.length} Sections &middot; 50 Total Questions):
                </span>
                <div className={styles.skillsSectionGrid}>
                  {chosenSkills.map((skill, sIdx) => (
                    <div key={skill} className={styles.skillSectionPill}>
                      <span className={styles.skillSectionNumber}>Section {sIdx + 1}</span>
                      <span className={styles.skillSectionName}>{skill}</span>
                      <span className={styles.skillSectionTag}>
                        <CheckCircle2 size={11} /> Ready
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.remediationInfoBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontWeight: 800, color: '#854d0e' }}>
                  <Target size={16} />
                  <span>Adaptive Remediation Intelligence</span>
                </div>
                Questions are grouped into distinct sections according to your selected skills.
                The assessment engine analyzes your performance at the specific subtopic level.
                If you score under 50% in any topic, subsequent practice tests will <strong>dedicate 50% of the questions to that lagged topic</strong> to ensure mastery.
              </div>
            </div>

            {/* Right Card: Launch Desktop Application */}
            <div className={styles.cardSection}>
              <div className={styles.cardHeader}>
                <Monitor size={20} color="#1c2d81" />
                <h3 className={styles.cardHeaderTitle}>Launch Proctored Desktop Client</h3>
              </div>

              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Click the button below to launch the secure desktop client. If prompted by your browser, choose <strong>Open Beyon</strong>.
              </p>

              <button
                type="button"
                className={styles.btnLaunchDesktop}
                onClick={handleLaunchDesktop}
                disabled={launchingDesktop}
              >
                {launchingDesktop ? (
                  <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Launching Desktop Client...</>
                ) : (
                  <><Monitor size={20} /> Launch Beyon Desktop Application</>
                )}
              </button>

              <div>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Session Passcode / Token (Manual Entry Option):
                </span>
                <div className={styles.passcodeBox}>
                  <span className={styles.passcodeText}>
                    {effectiveToken ? `${effectiveToken.slice(0, 32)}...` : 'Authentication token loaded'}
                  </span>
                  <button
                    type="button"
                    className={styles.btnCopyPasscode}
                    onClick={handleCopyPasscode}
                  >
                    {tokenCopied ? (
                      <><Check size={14} color="#15803d" /> Copied</>
                    ) : (
                      <><Copy size={14} /> Copy Passcode</>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.candidateInfoList}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.82rem', color: '#475569' }}>
                  <div style={{ width: 20, height: 20, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</div>
                  <span>Launch desktop client via the button or local command <code>bun run dev:desktop</code>.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.82rem', color: '#475569' }}>
                  <div style={{ width: 20, height: 20, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</div>
                  <span>Complete the hardware check (webcam, audio, single monitor) and dual-camera QR pairing.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.82rem', color: '#475569' }}>
                  <div style={{ width: 20, height: 20, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</div>
                  <span>Complete all 50 questions across the skill sections and submit.</span>
                </div>
              </div>

              {/* Live Status Polling */}
              <div className={styles.pollingStatusBanner}>
                <span className={styles.pulseDot} />
                <span>Listening for Desktop Assessment submission... This page will update automatically.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
