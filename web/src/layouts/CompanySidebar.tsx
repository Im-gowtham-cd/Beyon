import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import styles from './CompanySidebar.module.css';

interface CompanySidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CompanySidebar({
  mobileOpen = false,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
}: CompanySidebarProps) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0);

  useEffect(() => {
    async function loadCompanyData() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        if (!token) return;
        const [profRes, oppRes] = await Promise.all([
          fetch('/api/v1/profile', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          fetch('/api/v1/opportunities', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        ]);
        if (profRes && profRes.ok) {
          const p = await profRes.json();
          setProfileData(p.data?.companyProfile?.profile || null);
        }
        if (oppRes && oppRes.ok) {
          const o = await oppRes.json();
          if (Array.isArray(o.data)) {
            setActiveJobsCount(o.data.length);
          }
        }
      } catch {
        /* fallback */
      }
    }
    loadCompanyData();
  }, []);

  const navSections = [
    {
      title: 'Recruitment Command',
      items: [
        { to: '/company/home', icon: 'bx bx-home-alt-2', label: 'Executive Dashboard' },
        { to: '/company/opportunities', icon: 'bx bx-briefcase-alt-2', label: 'Job & Campus Drives', badge: activeJobsCount ? `${activeJobsCount} Active` : undefined, badgeType: 'primary' },
        { to: '/company/opportunities/create', icon: 'bx bx-plus-circle', label: 'Post New Drive / Job' },
      ],
    },
    {
      title: 'Talent & AI Screening',
      items: [
        { to: '/company/candidates', icon: 'bx bx-user-check', label: 'AI Candidate Discovery', badge: '100+ Verified', badgeType: 'gold' },
        { to: '/company/pipeline', icon: 'bx bx-git-commit', label: 'Recruitment Pipeline' },
        { to: '/company/candidate-intelligence', icon: 'bx bx-brain', label: 'Candidate Intelligence' },
      ],
    },
    {
      title: 'Assessments & Interviews',
      items: [
        { to: '/company/assessments', icon: 'bx bx-shield-quarter', label: 'Benchmark Tests' },
        { to: '/company/assessment-builder', icon: 'bx bx-edit', label: 'Assessment Builder' },
        { to: '/company/interview-management', icon: 'bx bx-video', label: 'Interview Scheduler' },
      ],
    },
    {
      title: 'Analytics & Settings',
      items: [
        { to: '/company/analytics', icon: 'bx bx-line-chart', label: 'Hiring Analytics' },
        { to: '/company/profile', icon: 'bx bx-buildings', label: 'Company Profile' },
        { to: '/company/messages', icon: 'bx bx-chat', label: 'Direct Messaging' },
      ],
    },
  ];

  const companyName = profileData?.companyName || user?.name || 'Enterprise Recruiter';
  const initials = companyName
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CO';

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${mobileOpen ? styles.sidebarMobileOpen : ''}`}
    >
      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <Link to="/company/home" className={styles.brandLink}>
          <div className={styles.brandLogo}>
            <span>B</span>
          </div>
          {!collapsed && (
            <div className={styles.brandInfo}>
              <span className={styles.brandName}>Beyon</span>
              <span className={styles.brandSub}>Corporate Portal</span>
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
                <span className={styles.userName}>{companyName}</span>
                <span className={styles.userBadge}>Verified Enterprise</span>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className={styles.companyStatsBar}>
              <span className={styles.statsTag}>
                <i className="bx bx-briefcase" />
                <span>Openings</span>
              </span>
              <span className={styles.highlightTag}>{activeJobsCount || '30+'} Drives</span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        {navSections.map((section) => (
          <div key={section.title} className={styles.navSection}>
            {!collapsed && <span className={styles.sectionTitle}>{section.title}</span>}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/company/home'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className={styles.activeIndicator} />}
                    <i className={`${item.icon} ${styles.navIcon}`} />
                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className={`${styles.badge} ${styles[`badge_${item.badgeType || 'primary'}`]}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
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
            <i className={collapsed ? 'bx bx-chevrons-right' : 'bx bx-chevrons-left'} />
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
