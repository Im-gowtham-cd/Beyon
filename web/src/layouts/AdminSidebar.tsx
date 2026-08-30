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
  const navSections = [
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
      ],
    },
  ];

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${
        mobileOpen ? styles.sidebarMobileOpen : ''
      }`}
    >
      <div className={styles.sidebarHeader}>
        <Link to="/admin/home" className={styles.logoArea}>
          <div className={styles.logoIcon}>B</div>
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
