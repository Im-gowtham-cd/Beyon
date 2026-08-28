import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  UserCheck,
  GitCommit,
  Brain,
  ShieldCheck,
  FileEdit,
  Video,
  LineChart,
  Building2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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
        { to: '/company/home', icon: LayoutDashboard, label: 'Executive Dashboard' },
        { to: '/company/opportunities', icon: Briefcase, label: 'Job & Campus Drives', badge: activeJobsCount ? `${activeJobsCount} Active` : undefined, badgeType: 'primary' },
        { to: '/company/opportunities/create', icon: PlusCircle, label: 'Post New Drive / Job' },
      ],
    },
    {
      title: 'Talent & AI Screening',
      items: [
        { to: '/company/candidates', icon: UserCheck, label: 'AI Candidate Discovery', badge: '100+ Verified', badgeType: 'gold' },
        { to: '/company/pipeline', icon: GitCommit, label: 'Recruitment Pipeline' },
        { to: '/company/candidate-intelligence', icon: Brain, label: 'Candidate Intelligence' },
      ],
    },
    {
      title: 'Assessments & Interviews',
      items: [
        { to: '/company/assessments', icon: ShieldCheck, label: 'Benchmark Tests' },
        { to: '/company/assessment-builder', icon: FileEdit, label: 'Assessment Builder' },
        { to: '/company/interview-management', icon: Video, label: 'Interview Scheduler' },
      ],
    },
    {
      title: 'Analytics & Settings',
      items: [
        { to: '/company/analytics', icon: LineChart, label: 'Hiring Analytics' },
        { to: '/company/profile', icon: Building2, label: 'Company Profile' },
        { to: '/company/messages', icon: MessageSquare, label: 'Direct Messaging' },
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
                <Briefcase size={13} style={{ display: 'inline', marginRight: '4px' }} />
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
            {section.items.map((item) => {
              const IconComp = item.icon;
              return (
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
                      <IconComp size={18} className={styles.navIcon} />
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
  );
}
