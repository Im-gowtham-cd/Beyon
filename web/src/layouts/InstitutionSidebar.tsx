import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { institutionApi } from '../institution/services/institutionApi';
import {
  LayoutDashboard,
  LineChart,
  Briefcase,
  Users,
  Award,
  GraduationCap,
  BookOpen,
  Building2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import styles from './InstitutionSidebar.module.css';

interface InstitutionSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function InstitutionSidebar({
  mobileOpen = false,
  collapsed = false,
  onToggleCollapse,
}: InstitutionSidebarProps) {
  const { user } = useAuth();
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  const [activeDrivesCount, setActiveDrivesCount] = useState<number>(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const [studentsRes, drivesRes] = await Promise.all([
          institutionApi.getStudents().catch(() => []),
          institutionApi.getDrives().catch(() => []),
        ]);
        const sList = Array.isArray(studentsRes) ? studentsRes : (studentsRes as any)?.data || [];
        const dList = Array.isArray(drivesRes) ? drivesRes : (drivesRes as any)?.data || [];
        setEnrolledCount(sList.length);
        setActiveDrivesCount(dList.length);
      } catch {

      }
    }
    loadStats();
  }, []);

  const userRole = user?.role || 'INSTITUTION_ADMIN';

  const getInstitutionNavSections = () => {
    if (userRole === 'INSTITUTION_VIEWER') {
      return [
        {
          title: 'Institutional Overview',
          items: [
            { to: '/institution/home', icon: LayoutDashboard, label: 'Overview Dashboard' },
            { to: '/institution/analytics', icon: LineChart, label: 'Analytics & Trends' },
            { to: '/institution/students', icon: Users, label: 'Student Directory' },
            { to: '/institution/placements', icon: Award, label: 'Placement Reports' },
          ],
        },
      ];
    }

    if (userRole === 'INSTITUTION_FACULTY' || userRole === 'INSTITUTION_COORDINATOR') {
      return [
        {
          title: 'Department Academic Hub',
          items: [
            { to: '/institution/home', icon: LayoutDashboard, label: 'Faculty Dashboard' },
            { to: '/institution/students', icon: Users, label: 'Department Students', badge: enrolledCount > 0 ? `${enrolledCount}` : undefined, badgeType: 'gold' },
            { to: '/institution/curriculum', icon: BookOpen, label: 'Curriculum & Skill Gaps' },
            { to: '/institution/analytics', icon: LineChart, label: 'Academic Performance' },
          ],
        },
      ];
    }

    if (userRole === 'INSTITUTION_PLACEMENT_OFFICER') {
      return [
        {
          title: 'Placement Operations',
          items: [
            { to: '/institution/home', icon: LayoutDashboard, label: 'Placement Dashboard' },
            { to: '/institution/drives', icon: Briefcase, label: 'Campus Drives', badge: activeDrivesCount > 0 ? `${activeDrivesCount} Active` : undefined, badgeType: 'primary' },
            { to: '/institution/students', icon: Users, label: 'Eligible Candidates', badge: enrolledCount > 0 ? `${enrolledCount}` : undefined, badgeType: 'gold' },
            { to: '/institution/placements', icon: Award, label: 'Placement Outcomes & Offers' },
          ],
        },
        {
          title: 'Industry Outreach',
          items: [
            { to: '/institution/analytics', icon: LineChart, label: 'Placement Analytics' },
            { to: '/institution/messages', icon: MessageSquare, label: 'Corporate Connections' },
          ],
        },
      ];
    }

    // Default: INSTITUTION_ADMIN / INSTITUTION
    return [
      {
        title: 'Campus Command',
        items: [
          { to: '/institution/home', icon: LayoutDashboard, label: 'Executive Dashboard' },
          { to: '/institution/analytics', icon: LineChart, label: 'Institutional Analytics' },
          {
            to: '/institution/drives',
            icon: Briefcase,
            label: 'Placement Drives',
            badge: activeDrivesCount > 0 ? `${activeDrivesCount} Active` : undefined,
            badgeType: 'primary',
          },
        ],
      },
      {
        title: 'Student Cohorts & Verification',
        items: [
          {
            to: '/institution/students',
            icon: Users,
            label: 'Student Cohort Roster',
            badge: enrolledCount > 0 ? `${enrolledCount}` : undefined,
            badgeType: 'gold',
          },
          { to: '/institution/placements', icon: Award, label: 'Placement Records & Offers' },
          { to: '/institution/curriculum', icon: BookOpen, label: 'Skill Matrix & Tracks' },
        ],
      },
      {
        title: 'Institution Hub',
        items: [
          { to: '/institution/profile', icon: Building2, label: 'Institution Profile & Settings' },
          { to: '/institution/messages', icon: MessageSquare, label: 'Recruiter Outreach' },
        ],
      },
    ];
  };

  const navSections = getInstitutionNavSections();

  const instName = user?.name || 'Institution Partner';
  const initials =
    instName
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'IN';

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${
        mobileOpen ? styles.sidebarMobileOpen : ''
      }`}
    >

      <div className={styles.header}>
        {!collapsed ? (
          <Link to="/institution/home" className={styles.brand}>
            <div className={styles.brandLogo} style={{ background: 'transparent', boxShadow: 'none' }}>
              <img src="/logo-icon.png" alt="Beyon" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>BEYON</span>
              <span className={styles.brandSub}>Institution Hub</span>
            </div>
          </Link>
        ) : (
          <div className={styles.brandLogo} style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src="/logo-icon.png" alt="Beyon" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
        )}

        <button
          type="button"
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {!collapsed && (
        <div className={styles.institutionInfo}>
          <div className={styles.avatarBox}>{initials}</div>
          <div className={styles.instDetails}>
            <span className={styles.instName} title={instName}>{instName}</span>
            <span className={styles.instRole}>
              <ShieldCheck size={12} />
              <span>Campus Command</span>
            </span>
          </div>
        </div>
      )}

      <div className={styles.navContainer}>
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className={styles.navSection}>
            {!collapsed && <span className={styles.sectionTitle}>{sec.title}</span>}
            {sec.items.map((item, iIdx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={iIdx}
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <>
                      <span className={styles.navLabel}>{item.label}</span>
                      {item.badge && (
                        <span
                          className={`${styles.badge} ${
                            item.badgeType === 'gold' ? styles.badgeGold : styles.badgePrimary
                          }`}
                        >
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

      {!collapsed && (
        <div className={styles.footer}>
          <div className={styles.accreditationPill}>
            <GraduationCap size={16} style={{ color: '#1c2d81', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>
                {activeDrivesCount > 0 ? `${activeDrivesCount} Active Drives` : 'Verified Institution'}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Institutional Talent Hub</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

