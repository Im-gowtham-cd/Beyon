import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  HelpCircle,
  ShieldAlert,
  Coins,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

import { useAuth } from '../auth/context/AuthContext';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  mobileOpen = false,
  collapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const { user } = useAuth();
  const userRole = user?.role || 'PLATFORM_ADMIN';

  const getAdminNavSections = () => {
    if (userRole === 'VERIFICATION_ADMIN') {
      return [
        {
          title: 'Verification Center',
          items: [
            { to: '/admin/institutions', icon: Building2, label: 'Accreditation Queue' },
            { to: '/admin/companies', icon: Briefcase, label: 'Corporate Approvals' },
            { to: '/admin/users', icon: Users, label: 'Student Verifications' },
          ],
        },
      ];
    }

    if (userRole === 'QUESTION_SETTER') {
      return [
        {
          title: 'Question Authoring',
          items: [
            { to: '/admin/questions', icon: HelpCircle, label: 'Question Bank (357)' },
            { to: '/admin/questions/create', icon: Sparkles, label: 'Author Question' },
          ],
        },
      ];
    }

    if (userRole === 'MODERATION_ADMIN') {
      return [
        {
          title: 'Trust & Safety',
          items: [
            { to: '/admin/moderation', icon: ShieldAlert, label: 'Content Moderation' },
            { to: '/admin/feedback', icon: FileText, label: 'Abuse Reports & Tickets' },
            { to: '/admin/reports', icon: FileText, label: 'Incident History' },
          ],
        },
      ];
    }

    if (userRole === 'ANALYTICS_ADMIN') {
      return [
        {
          title: 'Platform Intelligence',
          items: [
            { to: '/admin/home', icon: LayoutDashboard, label: 'Executive Telemetry' },
            { to: '/admin/dashboard', icon: Activity, label: 'Platform Trends' },
            { to: '/admin/reports', icon: FileText, label: 'System Analytics' },
          ],
        },
      ];
    }

    if (userRole === 'CONTENT_ADMIN') {
      return [
        {
          title: 'Content & Skills',
          items: [
            { to: '/admin/questions', icon: HelpCircle, label: 'Skill Taxonomy & Questions' },
            { to: '/admin/home', icon: LayoutDashboard, label: 'Content Overview' },
          ],
        },
      ];
    }

    // Default: PLATFORM_ADMIN / SUPER_ADMIN / ADMIN (Full platform governance)
    return [
      {
        title: 'Platform Command',
        items: [
          { to: '/admin/home', icon: LayoutDashboard, label: 'Command Center' },
          { to: '/admin/dashboard', icon: Activity, label: 'Platform Telemetry' },
        ],
      },
      {
        title: 'Ecosystem & Governance',
        items: [
          { to: '/admin/users', icon: Users, label: 'User & Role Registry' },
          { to: '/admin/institutions', icon: Building2, label: 'Accreditation Queue' },
          { to: '/admin/companies', icon: Briefcase, label: 'Corporate Approvals' },
          { to: '/admin/questions', icon: HelpCircle, label: 'Question Bank (357)' },
        ],
      },
      {
        title: 'Integrity & Economy',
        items: [
          { to: '/admin/economy', icon: Coins, label: 'Coin Economy Ledger' },
          { to: '/admin/moderation', icon: ShieldAlert, label: 'Content Moderation' },
          { to: '/admin/feedback', icon: FileText, label: 'Feedback & Reports' },
          { to: '/admin/reports', icon: FileText, label: 'System Reports' },
        ],
      },
    ];
  };

  const navSections = getAdminNavSections();

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${
        mobileOpen ? styles.sidebarMobileOpen : ''
      }`}
    >
      <div className={styles.sidebarHeader}>
        <Link to="/admin/home" className={styles.logoArea}>
          <div className={styles.logoIcon} style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src="/logo-icon.png" alt="Beyon" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className={styles.logoText}>BEYON</span>
              <span className={styles.adminTag}>ADMIN</span>
            </div>
          )}
        </Link>
      </div>

      <nav className={styles.navContainer}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '14px' }}>
            {!collapsed && <div className={styles.sectionTitle}>{section.title}</div>}
            {section.items.map((item, iIdx) => {
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
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        {!collapsed && (
          <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
            <Sparkles size={13} color="#1c2d81" />
            <span>Dolt Core v1.40.0</span>
          </div>
        )}
        {onToggleCollapse && (
          <button type="button" className={styles.collapseBtn} onClick={onToggleCollapse}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>
    </aside>
  );
}

