import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { api } from '../services/api/client';
import {
  LayoutDashboard,
  User,
  Cpu,
  Code2,
  Target,
  ShieldCheck,
  Timer,
  Briefcase,
  FileText,
  LineChart,
  Trophy,
  BarChart2,
  Award,
  Bell,
  MessageSquare,
  Flame,
  Coins,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import styles from './StudentSidebar.module.css';

interface StudentSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function StudentSidebar({
  mobileOpen = false,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
}: StudentSidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [coins, setCoins] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const [coinBalance, streakData] = await Promise.all([
          api.get<number>('/coins/balance').catch(() => null),
          api.get<any>('/gamification/streak').catch(() => null),
        ]);
        if (!mounted) return;
        if (typeof coinBalance === 'number') {
          setCoins(coinBalance);
        } else if (coinBalance && typeof (coinBalance as any).data === 'number') {
          setCoins((coinBalance as any).data);
        }
        if (streakData && typeof streakData.currentStreak === 'number') {
          setStreak(streakData.currentStreak);
        } else if (streakData?.data && typeof streakData.data.currentStreak === 'number') {
          setStreak(streakData.data.currentStreak);
        }
      } catch (err) {
        console.error('Failed to load sidebar student stats:', err);
      }
    }
    fetchStats();

    window.addEventListener('beyon-stats-refresh', fetchStats);
    window.addEventListener('focus', fetchStats);
    return () => {
      mounted = false;
      window.removeEventListener('beyon-stats-refresh', fetchStats);
      window.removeEventListener('focus', fetchStats);
    };
  }, [user?.id, location.pathname]);

  const navSections = [
    {
      title: 'Workspace',
      items: [
        { to: '/student/home', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/student/profile', icon: User, label: 'Portfolio & Profile' },
        { to: '/student/skills', icon: Cpu, label: 'Skill Taxonomy', badge: '109', badgeType: 'primary' },
      ],
    },
    {
      title: 'Practice & Tests',
      items: [
        { to: '/practice', icon: Code2, label: 'Practice Arena', badge: '300+ Qs', badgeType: 'primary' },
        { to: '/daily-challenge', icon: Target, label: 'Daily Challenge', badge: '+50 Coins', badgeType: 'gold' },
        { to: '/assessment', icon: ShieldCheck, label: 'Proctored Assessments', badge: '16 Tests', badgeType: 'primary' },
        { to: '/weekly-tests', icon: Timer, label: 'Benchmark Tests' },
      ],
    },
    {
      title: 'Career & Drives',
      items: [
        { to: '/opportunities', icon: Briefcase, label: 'Opportunities & Drives', badge: '35 Open', badgeType: 'primary' },
        { to: '/my-applications', icon: FileText, label: 'My Applications' },
        { to: '/placement', icon: LineChart, label: 'Placement Intel' },
      ],
    },
    {
      title: 'Progress & Social',
      items: [
        { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { to: '/stats', icon: BarChart2, label: 'Analytics & Stats' },
        { to: '/achievements', icon: Award, label: 'Achievements' },
        { to: '/messages', icon: MessageSquare, label: 'Messages & Outreach' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
      ],
    },
  ];

  const displayName = user?.name || 'Candidate';
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {mobileOpen && <div className={styles.mobileOverlay} onClick={onCloseMobile} />}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${mobileOpen ? styles.sidebarOpenMobile : ''}`}
      >

        <div className={styles.brandHeader}>
          <Link to="/student/home" className={styles.brandLink}>
            <div className={styles.brandLogo} style={{ background: 'transparent', boxShadow: 'none' }}>
              <img src="/logo-icon.png" alt="Beyon" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            {!collapsed && (
              <div className={styles.brandInfo}>
                <span className={styles.brandName}>BEYON</span>
                <span className={styles.brandSub}>Candidate Portal</span>
              </div>
            )}
          </Link>
        </div>

        <div className={styles.sidebarScroll}>

          <div className={`${styles.userCard} ${collapsed ? styles.userCardCollapsed : ''}`}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                <span>{initials}</span>
              </div>
              {!collapsed && (
                <div className={styles.userMeta}>
                  <span className={styles.userName}>{displayName}</span>
                  <span className={styles.userBadge}>Verified Scholar</span>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className={styles.walletBar}>
                <div className={styles.coinTag}>
                  <Coins size={14} style={{ color: '#fed601' }} />
                  <span>{coins} Coins</span>
                </div>
                <div className={styles.streakTag}>
                  <Flame size={14} style={{ color: streak > 0 ? '#ea580c' : '#ffffff' }} />
                  <span>{streak}d Streak</span>
                </div>
              </div>
            )}
            {collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', color: '#fed601', fontWeight: 800 }} title={`${coins} Coins`}>
                  <Coins size={12} />
                  <span>{coins}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', color: '#ffffff', fontWeight: 700 }} title={`${streak} Day Streak`}>
                  <Flame size={12} color={streak > 0 ? '#ea580c' : '#94a3b8'} />
                  <span>{streak}d</span>
                </div>
              </div>
            )}
          </div>

          {navSections.map((section) => (
            <div key={section.title} className={styles.navSection}>
              {!collapsed && <span className={styles.sectionTitle}>{section.title}</span>}
              {section.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/student/home'}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                    }
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className={styles.activeIndicator} />}
                        <IconComponent size={18} className={styles.navIcon} />
                        {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                        {!collapsed && item.badge && (
                          <span className={`${styles.badge} ${styles[`badge_${item.badgeType || 'primary'}`]}`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        <div className={styles.footerSection}>
          {onToggleCollapse && (
            <button
              type="button"
              className={styles.collapseBtn}
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!collapsed && <span>Collapse Sidebar</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

