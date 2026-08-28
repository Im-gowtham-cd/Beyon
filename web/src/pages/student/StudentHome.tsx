import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { LearningWidget } from '../../student/components/LearningWidget';
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
      icon: 'bx bx-user-pin',
      title: 'Portfolio & Profile',
      desc: 'Showcase projects, verified certifications & skills',
      tag: 'Verified',
      tagType: 'success',
    },
    {
      to: '/student/skills',
      icon: 'bx bx-chip',
      title: 'Skill Taxonomy',
      desc: 'Explore GPU & AI engineering curriculum matrix',
      tag: '109 Skills',
      tagType: 'primary',
    },
    {
      to: '/practice',
      icon: 'bx bx-code-block',
      title: 'Practice Arena',
      desc: 'Solve 300+ MCQ, SQL & algorithmic challenges',
      tag: 'Active',
      tagType: 'warning',
    },
    {
      to: '/daily-challenge',
      icon: 'bx bx-target-lock',
      title: 'Daily Challenge',
      desc: 'Solve today’s problem & earn bonus Beyon Coins',
      tag: '+50 Coins',
      tagType: 'gold',
    },
    {
      to: '/assessment',
      icon: 'bx bx-shield-quarter',
      title: 'Proctored Assessment',
      desc: 'Schedule or launch lockdown test browser session',
      tag: 'Proctored',
      tagType: 'primary',
    },
    {
      to: '/opportunities',
      icon: 'bx bx-briefcase-alt-2',
      title: 'Career Opportunities',
      desc: 'Explore enterprise placements and internships',
      tag: 'Drives',
      tagType: 'success',
    },
    {
      to: '/leaderboard',
      icon: 'bx bx-trophy',
      title: 'Global Leaderboard',
      desc: 'Track cohort rankings, XP milestones & badges',
      tag: 'Live Rank',
      tagType: 'gold',
    },
    {
      to: '/stats',
      icon: 'bx bx-bar-chart-alt-2',
      title: 'Performance Stats',
      desc: 'View skill mastery charts & test history',
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
              <i className="bx bx-brain" /> Beyon Candidate Portal
            </span>
            <span className={styles.verifiedBadge}>
              <i className="bx bx-check-shield" /> Verified Beyon Scholar
            </span>
          </div>
          <h1 className={styles.welcomeTitle}>
            Welcome back, <span className={styles.highlightName}>{firstName}</span>
          </h1>
          <p className={styles.welcomeSub}>
            AI Engineering &amp; Skill Development Track &middot; Accelerating Verified Competencies
          </p>
        </div>

        <div className={styles.statsSummary}>
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Academic CGPA</span>
            <span className={styles.statMetricValue}>{profileData?.cgpa ? Number(profileData.cgpa).toFixed(2) : '9.10'}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Beyon Coins</span>
            <span className={`${styles.statMetricValue} ${styles.goldVal}`}>
              <i className="bx bx-coin-stack" /> {profileData?.coins ?? '2,450'}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Status</span>
            <span className={styles.statMetricValue} style={{ color: '#15803d', fontSize: '1rem', fontWeight: 800 }}>ACTIVE</span>
          </div>
        </div>
      </section>

      {/* Main Grid Area */}
      <div className={styles.dashboardGrid}>
        <main className={styles.mainContent}>
          {/* Daily Challenge Spotlight Banner */}
          <div className={styles.spotlightBanner}>
            <div className={styles.spotlightIcon}>
              <i className="bx bx-flame" />
            </div>
            <div className={styles.spotlightBody}>
              <span className={styles.spotlightTag}>Daily Challenge Active</span>
              <h3>{dailyChallenge?.question?.title || dailyChallenge?.title || 'Interactive Technical Daily Challenge'}</h3>
              <p>Solve today's algorithmic puzzle within 30 minutes to claim 50 Beyon Coins and 100 XP.</p>
            </div>
            <Link to="/daily-challenge" className={styles.spotlightAction}>
              <span>Start Challenge</span>
              <i className="bx bx-right-arrow-alt" />
            </Link>
          </div>

          {/* Quick Hub Cards */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <i className="bx bx-grid-alt" /> Core Portals &amp; Tools
            </h2>
            <span className={styles.sectionMeta}>8 Active Modules</span>
          </div>

          <div className={styles.cardsGrid}>
            {quickNavs.map(nav => (
              <Link key={nav.to} to={nav.to} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconBox}>
                    <i className={nav.icon} />
                  </div>
                  <span className={`${styles.cardTag} ${styles[`tag_${nav.tagType}`]}`}>
                    {nav.tag}
                  </span>
                </div>
                <h3 className={styles.cardTitle}>{nav.title}</h3>
                <p className={styles.cardDesc}>{nav.desc}</p>
                <div className={styles.cardFoot}>
                  <span>Access Module</span>
                  <i className="bx bx-chevron-right" />
                </div>
              </Link>
            ))}
          </div>
        </main>

        {/* Aside Sidebar */}
        <aside className={styles.sideCol}>
          <LearningWidget />

          {/* Proctored Exam Quick Launch */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <i className="bx bx-laptop" />
              <h4>Secure Test Client</h4>
            </div>
            <p className={styles.sideCardText}>
              Launch the lockdown desktop proctoring client for verified skill assessments.
            </p>
            <Link to="/assessment" className={styles.sideCardBtn}>
              <i className="bx bx-play-circle" /> Launch Assessment
            </Link>
          </div>

          {/* Academic & Department Info */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <i className="bx bx-buildings" />
              <h4>Institution Enrollment</h4>
            </div>
            <div className={styles.enrollmentMeta}>
              <div>
                <strong>Department:</strong> {profileData?.department || 'Computer Science & Engineering'}
              </div>
              <div>
                <strong>Batch:</strong> Class of {profileData?.graduationYear || '2026'}
              </div>
              <div>
                <strong>Status:</strong> <span className={styles.statusLive}>Enrolled &middot; Good Standing</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
