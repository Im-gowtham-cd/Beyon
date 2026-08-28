import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import styles from './StudentSidebar.module.css';

interface StudentSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function StudentSidebar({ mobileOpen = false, onCloseMobile }: StudentSidebarProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
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
        { to: '/student/home', icon: 'bx bx-home-alt-2', label: 'Dashboard' },
        { to: '/student/profile', icon: 'bx bx-user-pin', label: 'Portfolio & Profile' },
        { to: '/student/skills', icon: 'bx bx-chip', label: 'Skill Taxonomy', badge: '109', badgeType: 'primary' },
      ],
    },
    {
      title: 'Practice & Tests',
      items: [
        { to: '/practice', icon: 'bx bx-code-block', label: 'Practice Arena', badge: '300+ Qs', badgeType: 'primary' },
        { to: '/daily-challenge', icon: 'bx bx-target-lock', label: 'Daily Challenge', badge: '+50 🪙', badgeType: 'gold' },
        { to: '/assessment', icon: 'bx bx-shield-quarter', label: 'Proctored Assessments', badge: '16 Tests', badgeType: 'primary' },
        { to: '/weekly-tests', icon: 'bx bx-timer', label: 'Benchmark Tests' },
      ],
    },
    {
      title: 'Career & Drives',
      items: [
        { to: '/opportunities', icon: 'bx bx-briefcase-alt-2', label: 'Opportunities & Drives', badge: '35 Open', badgeType: 'primary' },
        { to: '/my-applications', icon: 'bx bx-file', label: 'My Applications' },
        { to: '/placement', icon: 'bx bx-line-chart', label: 'Placement Intel' },
      ],
    },
    {
      title: 'Progress & Social',
      items: [
        { to: '/leaderboard', icon: 'bx bx-trophy', label: 'Leaderboard' },
        { to: '/stats', icon: 'bx bx-bar-chart-alt-2', label: 'Analytics & Stats' },
        { to: '/achievements', icon: 'bx bx-medal', label: 'Achievements' },
        { to: '/notifications', icon: 'bx bx-bell', label: 'Notifications' },
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

        <div className={styles.sidebarScroll}>
          {/* User Mini Card */}
          <div className={`${styles.userCard} ${collapsed ? styles.userCardCollapsed : ''}`}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{initials}</div>
              {!collapsed && (
                <div className={styles.userMeta}>
                  <span className={styles.userName}>{displayName}</span>
                  <span className={styles.userBadge}>Verified Scholar</span>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className={styles.walletBar}>
                <div className={styles.coinTag} title="Beyon Coins Balance">
                  <span>🪙</span>
                  <span>{coins} Coins</span>
                </div>
                <div className={styles.streakTag} title="Active Daily Streak">
                  <span>🔥</span>
                  <span>{streak}d Streak</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          {navSections.map((sec, idx) => (
            <div key={idx} className={styles.navSection}>
              {!collapsed && <span className={styles.sectionTitle}>{sec.title}</span>}
              {sec.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <i className={`${item.icon} ${styles.navIcon}`} />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span
                      className={`${styles.navBadge} ${item.badgeType === 'gold' ? styles.navBadgeGold : styles.navBadgePrimary}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <i className={`bx ${collapsed ? 'bx-chevron-right' : 'bx-chevron-left'}`} />
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
