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

  const navSections = [
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
        { to: '/institution/profile', icon: Building2, label: 'Institution Profile' },
        { to: '/institution/messages', icon: MessageSquare, label: 'Recruiter Outreach' },
      ],
    },
  ];

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

