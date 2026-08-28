import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
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
  const [coins, setCoins] = useState<number>(250);
  const [streak, setStreak] = useState<number>(18);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        if (!token) return;
        const res = await fetch('/api/v1/practice/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            if (data.data.currentStreak !== undefined) setStreak(data.data.currentStreak);
            if (data.data.coinsBalance !== undefined) setCoins(data.data.coinsBalance);
          }
        }
      } catch {
        /* fallback */
      }
    }
    fetchStats();
  }, []);

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
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <Link to="/student/home" className={styles.brandLink}>
            <div className={styles.brandLogo}>
              <span>B</span>
            </div>
            {!collapsed && (
              <div className={styles.brandInfo}>
                <span className={styles.brandName}>BEYON</span>
                <span className={styles.brandSub}>Candidate Portal</span>
              </div>
            )}
          </Link>
        </div>

        {/* Sidebar Scrollable Body */}
        <div className={styles.sidebarScroll}>
          {/* User Card */}
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
              <div className={styles.userStatsBar}>
                <div className={styles.userStatItem}>
                  <Coins size={14} className={styles.goldIcon} />
                  <span>{coins} Coins</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.userStatItem}>
                  <Flame size={14} className={styles.fireIcon} />
                  <span>{streak}d Streak</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Sections */}
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

        {/* Footer Utility Actions */}
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
