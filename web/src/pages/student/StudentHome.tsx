import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
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
} from 'lucide-react';
import styles from './StudentHome.module.css';

export function StudentHome() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        if (token) {
          const [profRes, chalRes] = await Promise.all([
            fetch('/api/v1/student/profile', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
            fetch('/api/v1/daily-challenge/today', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          ]);
          if (profRes && profRes.ok) {
            const data = await profRes.json();
            setProfileData(data.data || null);
          }
          if (chalRes && chalRes.ok) {
            const data = await chalRes.json();
            setDailyChallenge(data.data || null);
          }
        }
      } catch {
        /* fallback gracefully */
      }
    }
    loadData();
  }, []);

  const displayName = profileData?.fullName || user?.name || 'Candidate';
  const firstName = displayName.split(' ')[0];

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
      {/* Hero Welcome Banner */}
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
              <Coins size={16} style={{ color: '#b45309' }} /> {profileData?.beyonCoins || 250}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Daily Streak</span>
            <span className={styles.statMetricValue}>
              <Flame size={16} style={{ color: '#ea580c', display: 'inline' }} /> 18 Days
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Accuracy</span>
            <span className={styles.statMetricValue}>87.4%</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Modules & Side Widgets */}
      <div className={styles.dashboardGrid}>
        <div className={styles.mainContent}>
          {/* Daily Challenge Spotlight Banner */}
          <div className={styles.spotlightBanner}>
            <div className={styles.spotlightIcon}>
              <Target size={24} style={{ color: '#fed601' }} />
            </div>
            <div className={styles.spotlightBody}>
              <span className={styles.spotlightTag}>
                Today&apos;s Featured Challenge &middot; +50 Coins
              </span>
              <h3>
                {dailyChallenge?.question?.title ||
                  'CUDA Kernel Memory Divergence & Shared Memory Bank Optimization'}
              </h3>
              <p>
                {dailyChallenge?.question?.description?.slice(0, 120) ||
                  'Analyze warp scheduling bottlenecks, optimize memory coalescing, and earn verified competence badges.'}
                ...
              </p>
            </div>
            <Link to="/daily-challenge" className={styles.spotlightAction}>
              <span>Solve Challenge</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Core Modules Grid */}
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

        {/* Sidebar Column */}
        <div className={styles.sideCol}>
          {/* Active Learning Widget */}
          <LearningWidget />

          {/* Quick Benchmark Test Card */}
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

          {/* Cohort Enrollment Card */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <BookOpen size={18} style={{ color: '#1c2d81' }} />
              <h4>Cohort Enrollment</h4>
            </div>
            <div className={styles.enrollmentMeta}>
              <div>
                <strong>Track:</strong> Advanced Parallel &amp; GPU Systems
              </div>
              <div>
                <strong>Institution:</strong> Premier Engineering Consortium
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span className={styles.statusLive}>
                  <Radio size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Active Scholar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
