import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { api } from '../../services/api/client';
import { LearningWidget } from '../../student/components/LearningWidget';
import {
  UserCheck,
  Cpu,
  Code2,
  Target,
  ShieldCheck,
  Briefcase,
  Trophy,
  BarChart2,
  Sparkles,
  CheckCircle2,
  Coins,
  Flame,
  ArrowRight,
  BookOpen,
  Radio,
  Clock,
} from 'lucide-react';
import styles from './StudentHome.module.css';

export function StudentHome() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [coins, setCoins] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [stats, setStats] = useState<any>(null);
  const [assessmentStatus, setAssessmentStatus] = useState<any>(null);
  const [studentSkills, setStudentSkills] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [profRes, chalRes, coinRes, streakRes, statsRes, assessRes, skillsRes] = await Promise.all([
          api.get<any>('/student/profile').catch(() => null),
          api.get<any>('/daily-challenge/today').catch(() => null),
          api.get<any>('/coins/balance').catch(() => null),
          api.get<any>('/gamification/streak').catch(() => null),
          api.get<any>('/practice/stats').catch(() => null),
          api.get<any>('/skills/assessment/status').catch(() => null),
          api.get<any>('/student/skills').catch(() => null),
        ]);
        if (!mounted) return;
        if (profRes) setProfileData(profRes.data || profRes);
        if (chalRes) setDailyChallenge(chalRes.data || chalRes);
        if (assessRes) setAssessmentStatus(assessRes.data || assessRes);
        if (skillsRes) {
          const sData = (skillsRes as any)?.data || skillsRes;
          if (Array.isArray(sData)) setStudentSkills(sData);
        }
        if (typeof coinRes === 'number') {
          setCoins(coinRes);
        } else if (coinRes?.data !== undefined) {
          setCoins(typeof coinRes.data === 'number' ? coinRes.data : 0);
        }
        if (typeof streakRes?.currentStreak === 'number') {
          setStreak(streakRes.currentStreak);
        } else if (typeof streakRes?.data?.currentStreak === 'number') {
          setStreak(streakRes.data.currentStreak);
        }
        if (statsRes) setStats(statsRes.data || statsRes);
      } catch (err) {
        console.error('Failed to load student home stats:', err);
      }
    }
    loadData();

    window.addEventListener('beyon-stats-refresh', loadData);
    window.addEventListener('focus', loadData);
    return () => {
      mounted = false;
      window.removeEventListener('beyon-stats-refresh', loadData);
      window.removeEventListener('focus', loadData);
    };
  }, [user?.id]);

  const displayName = profileData?.fullName || user?.name || 'Candidate';
  const firstName = displayName.split(' ')[0];

  const hasAssessment = Boolean(
    profileData?.hasCompletedAssessment ||
    assessmentStatus?.hasCompletedAssessment ||
    studentSkills.some(s => s.score != null || s.verified)
  );

  const verifiedSkillsCount = studentSkills.filter(s => s.verified || (s.score != null && Number(s.score) >= 60)).length;
  const testedSkills = studentSkills.filter(s => s.score != null || (s.questionsTested && s.questionsTested > 0));
  const totalQuestionsTested = testedSkills.reduce((sum, s) => sum + (s.questionsTested || 0), 0);
  const totalQuestionsCorrect = testedSkills.reduce((sum, s) => sum + (s.questionsCorrect || 0), 0);
  const overallAccuracy = totalQuestionsTested > 0
    ? ((totalQuestionsCorrect / totalQuestionsTested) * 100).toFixed(1)
    : testedSkills.length > 0
    ? (testedSkills.reduce((sum, s) => sum + (Number(s.score) || 0), 0) / testedSkills.length).toFixed(1)
    : '0.0';

  const quickNavs = [
    {
      to: '/student/profile',
      icon: UserCheck,
      title: 'Portfolio & Profile',
      desc: 'Showcase projects, verified certifications & skills',
      tag: 'Verified',
      tagType: 'success',
    },
    {
      to: '/student/skills',
      icon: Cpu,
      title: 'Skill Taxonomy',
      desc: 'Explore GPU & AI engineering curriculum matrix',
      tag: '109 Skills',
      tagType: 'primary',
    },
    {
      to: '/practice',
      icon: Code2,
      title: 'Practice Arena',
      desc: 'Solve 300+ MCQ, SQL & algorithmic challenges',
      tag: 'Active',
      tagType: 'warning',
    },
    {
      to: '/daily-challenge',
      icon: Target,
      title: 'Daily Challenge',
      desc: 'Solve today’s problem & earn bonus Beyon Coins',
      tag: '+50 Coins',
      tagType: 'gold',
    },
    {
      to: '/assessment',
      icon: ShieldCheck,
      title: 'Proctored Assessment',
      desc: 'Schedule or launch lockdown test browser session',
      tag: 'Proctored',
      tagType: 'primary',
    },
    {
      to: '/opportunities',
      icon: Briefcase,
      title: 'Career Opportunities',
      desc: 'Explore enterprise placements and internships',
      tag: 'Drives',
      tagType: 'success',
    },
    {
      to: '/leaderboard',
      icon: Trophy,
      title: 'Global Leaderboard',
      desc: 'Track cohort rankings, XP milestones & badges',
      tag: 'Live Rank',
      tagType: 'gold',
    },
    {
      to: '/stats',
      icon: BarChart2,
      title: 'Performance Stats',
      desc: 'Analyze accuracy distributions & mastery metrics',
      tag: 'Analytics',
      tagType: 'primary',
    },
  ];

  return (
    <div className={styles.page}>

      <section className={styles.welcomeHero}>
        <div className={styles.welcomeInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.portalBadge}>
              <Sparkles size={13} style={{ color: '#1c2d81' }} />
              <span>Beyon Candidate Workspace</span>
            </span>
            <span className={styles.verifiedBadge}>
              <CheckCircle2 size={13} style={{ color: '#15803d' }} />
              <span>Verified Scholar</span>
            </span>
          </div>
          <h1 className={styles.welcomeTitle}>
            Welcome back, <span className={styles.highlightName}>{firstName}</span>
          </h1>
          <p className={styles.welcomeSub}>
            Ready to solve today’s GPU &amp; AI challenges and climb the cohort ranks?
          </p>
        </div>

        <div className={styles.statsSummary}>
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Beyon Coins</span>
            <span className={`${styles.statMetricValue} ${styles.goldVal}`}>
              <Coins size={16} style={{ color: '#b45309' }} /> {coins}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Daily Streak</span>
            <span className={styles.statMetricValue}>
              <Flame size={16} style={{ color: '#ea580c', display: 'inline' }} /> {streak} {streak === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Accuracy</span>
            <span className={styles.statMetricValue}>
              {testedSkills.length > 0
                ? `${overallAccuracy}%`
                : (stats?.totalAttempted && stats.totalAttempted > 0
                    ? `${((stats.totalSolved / stats.totalAttempted) * 100).toFixed(1)}%`
                    : '0.0%')}
            </span>
          </div>
          {hasAssessment && (
            <>
              <div className={styles.statDivider} />
              <div className={styles.statMetric}>
                <span className={styles.statMetricLabel}>Verified Skills</span>
                <span className={styles.statMetricValue} style={{ color: '#15803d' }}>
                  <ShieldCheck size={16} style={{ color: '#15803d', display: 'inline', marginRight: '4px' }} />
                  {verifiedSkillsCount} / {testedSkills.length || studentSkills.length}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      <div className={styles.dashboardGrid}>
        <div className={styles.mainContent}>

          {/* Skill Validation Assessment Status Card */}
          {hasAssessment ? (
            <div className={styles.assessmentBanner}>
              <div className={styles.assessmentBannerHeader}>
                <div className={styles.assessmentHeaderLeft}>
                  <div className={styles.assessmentIconWrap}>
                    <ShieldCheck size={26} style={{ color: '#15803d' }} />
                  </div>
                  <div>
                    <div className={styles.assessmentTitleRow}>
                      <h3 className={styles.assessmentBannerTitle}>Skill Validation Assessment</h3>
                      <span className={styles.verifiedTagBadge}>
                        <CheckCircle2 size={13} /> Verified Scholar
                      </span>
                    </div>
                    <p className={styles.assessmentBannerDesc}>
                      Technical competency benchmark complete • {verifiedSkillsCount} of {testedSkills.length || studentSkills.length} skills verified against official Beyon taxonomy
                    </p>
                  </div>
                </div>

                <div className={styles.assessmentHeaderRight}>
                  {assessmentStatus?.retestAvailableAt ? (
                    <div className={styles.retestCooldownBadge}>
                      <Clock size={13} />
                      <span>Next Retest: {new Date(assessmentStatus.retestAvailableAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} (7-Day Rule)</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Assessment Benchmark Metrics Bar */}
              <div className={styles.assessmentMetricsBar}>
                <div className={styles.assessmentBarItem}>
                  <span className={styles.assessmentBarLabel}>Benchmark Accuracy</span>
                  <span className={styles.assessmentBarValue} style={{ color: '#15803d' }}>{overallAccuracy}%</span>
                </div>
                <div className={styles.assessmentBarDivider} />
                <div className={styles.assessmentBarItem}>
                  <span className={styles.assessmentBarLabel}>Verified Skills</span>
                  <span className={styles.assessmentBarValue} style={{ color: '#1c2d81' }}>{verifiedSkillsCount} / {testedSkills.length || studentSkills.length}</span>
                </div>
                <div className={styles.assessmentBarDivider} />
                <div className={styles.assessmentBarItem}>
                  <span className={styles.assessmentBarLabel}>Questions Solved</span>
                  <span className={styles.assessmentBarValue}>{totalQuestionsCorrect} / {totalQuestionsTested || 50}</span>
                </div>
                <div className={styles.assessmentBarDivider} />
                <div className={styles.assessmentBarItem}>
                  <span className={styles.assessmentBarLabel}>Verification Status</span>
                  <span className={styles.assessmentBarValue} style={{ color: '#15803d', fontSize: '0.9rem' }}>
                    AICTE / Beyon Lake Validated
                  </span>
                </div>
              </div>

              {/* Assessed Skills Pills */}
              <div className={styles.skillsPillsContainer}>
                {testedSkills.slice(0, 9).map((sk) => (
                  <div key={sk.id || sk.skillName} className={`${styles.skillPill} ${sk.verified ? styles.skillPillVerified : ''}`}>
                    <div className={styles.skillPillTop}>
                      <span className={styles.skillPillName}>{sk.skillName}</span>
                      {sk.verified ? (
                        <span className={styles.pillBadgeSuccess}>
                          <ShieldCheck size={11} /> {Number(sk.score).toFixed(0)}%
                        </span>
                      ) : (
                        <span className={styles.pillBadgeMuted}>
                          {sk.score != null ? `${Number(sk.score).toFixed(0)}%` : 'Pending'}
                        </span>
                      )}
                    </div>
                    <div className={styles.pillProgressBar}>
                      <div
                        className={styles.pillProgressFill}
                        style={{
                          width: `${Math.min(100, Math.max(0, Number(sk.score) || 0))}%`,
                          background: sk.verified ? '#15803d' : '#f59e0b',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.assessmentBannerActions}>
                <Link to="/student/profile" className={styles.assessmentPrimaryBtn}>
                  <ShieldCheck size={14} />
                  <span>View Verified Profile &amp; Skills</span>
                </Link>
                <Link to="/student/skill-assessment" className={styles.assessmentSecondaryBtn}>
                  <span>Assessment Report</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.assessmentInviteBanner}>
              <div className={styles.assessmentIconWrap}>
                <ShieldCheck size={26} style={{ color: '#1c2d81' }} />
              </div>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div className={styles.assessmentTitleRow}>
                  <h3 className={styles.assessmentBannerTitle}>Validate Your Engineering Skills</h3>
                  <span className={styles.verifiedTagBadge} style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
                    Pending Assessment
                  </span>
                </div>
                <p className={styles.assessmentBannerDesc}>
                  Take the 50-question personalized assessment based on your selected skills to unlock full student access and verify your profile for recruiters.
                </p>
              </div>
              <Link to="/student/skill-assessment" className={styles.assessmentPrimaryBtn}>
                <ShieldCheck size={14} />
                <span>Start Skill Assessment</span>
              </Link>
            </div>
          )}

          {dailyChallenge?.question ? (
            <div className={styles.spotlightBanner}>
              <div className={styles.spotlightIcon}>
                <Target size={24} style={{ color: '#fed601' }} />
              </div>
              <div className={styles.spotlightBody}>
                <span className={styles.spotlightTag}>
                  Today&apos;s Featured Challenge &middot; +50 Coins
                </span>
                <h3>{dailyChallenge.question.title}</h3>
                <p>
                  {dailyChallenge.question.description?.slice(0, 140) || 'Solve today’s curated challenge to earn coins.'}...
                </p>
              </div>
              <Link to="/daily-challenge" className={styles.spotlightAction}>
                <span>Solve Challenge</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className={styles.spotlightBanner}>
              <div className={styles.spotlightIcon}>
                <Code2 size={24} style={{ color: '#fed601' }} />
              </div>
              <div className={styles.spotlightBody}>
                <span className={styles.spotlightTag}>
                  Practice Arena Active
                </span>
                <h3>Technical &amp; Coding Challenge Bank</h3>
                <p>
                  Solve practice questions, improve algorithmic proficiency, and earn Beyon Coins across multiple topics.
                </p>
              </div>
              <Link to="/practice" className={styles.spotlightAction}>
                <span>Enter Arena</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Sparkles size={18} style={{ color: '#1c2d81' }} /> Workspace Modules
            </h2>
            <span className={styles.sectionMeta}>8 Core Areas</span>
          </div>

          <div className={styles.cardsGrid}>
            {quickNavs.map((item) => {
              const IconComp = item.icon;
              return (
                <Link key={item.to} to={item.to} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIconBox}>
                      <IconComp size={20} />
                    </div>
                    <span className={`${styles.cardTag} ${styles[`tag_${item.tagType}`]}`}>
                      {item.tag}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.desc}</p>
                  <div className={styles.cardFoot}>
                    <span>Launch Module</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className={styles.sideCol}>

          <LearningWidget />

          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <ShieldCheck size={18} style={{ color: '#1c2d81' }} />
              <h4>Proctored Benchmark Test</h4>
            </div>
            <p className={styles.sideCardText}>
              2026 Batch Campus Assessment &middot; 60 mins lockdown proctored technical evaluation.
            </p>
            <Link to="/assessment" className={styles.sideCardBtn}>
              <ShieldCheck size={14} />
              <span>Launch Test Browser</span>
            </Link>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <BookOpen size={18} style={{ color: '#1c2d81' }} />
              <h4>Academic Enrollment</h4>
            </div>
            <div className={styles.enrollmentMeta}>
              <div>
                <strong>Program:</strong> {profileData?.degree ? `${profileData.degree} · ${profileData.department || 'General'}` : 'Engineering Degree'}
              </div>
              <div>
                <strong>Institution:</strong> {profileData?.institution || 'Campus Not Specified'}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span className={styles.statusLive}>
                  <Radio size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {profileData ? 'Verified Scholar' : 'Active Candidate'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

