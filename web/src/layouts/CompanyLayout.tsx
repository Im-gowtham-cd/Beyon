import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { CompanySidebar } from './CompanySidebar';
import { Menu, Building2, MessageSquare, Bell, LogOut } from 'lucide-react';
import styles from './CompanyLayout.module.css';

export function CompanyLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      {/* Mobile Top Bar */}
      <div className={styles.mobileBar}>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          <Menu size={18} />
          <span>Menu</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#1c2d81', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fed601', fontWeight: 800, fontSize: '0.9rem' }}>
            B
          </div>
          <span style={{ fontWeight: 800, color: '#1c2d81', fontSize: '1rem', letterSpacing: '-0.02em' }}>BEYON</span>
        </div>
      </div>

      <div className={styles.bodyWrapper}>
        {/* Full-Height Fixed Left Sidebar */}
        <CompanySidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Primary Main Workspace Canvas */}
        <main
          className={`${styles.mainContent} ${sidebarCollapsed ? styles.mainContentCollapsed : ''}`}
        >
          {/* Top Utility Bar */}
          <header className={styles.topUtilityBar}>
            <div className={styles.utilityLeft}>
              <span className={styles.portalTag}>
                <Building2 size={14} />
                <span>Enterprise Corporate Workspace</span>
              </span>
            </div>
            <div className={styles.utilityRight}>
              <button
                type="button"
                className={styles.utilityBtn}
                onClick={() => navigate('/company/messages')}
                title="Direct Outreach"
              >
                <MessageSquare size={16} />
              </button>
              <button
                type="button"
                className={styles.utilityBtn}
                onClick={() => navigate('/notifications')}
                title="Notifications"
              >
                <Bell size={16} />
                <span className={styles.dotBadge} />
              </button>
              <button
                type="button"
                className={styles.utilityBtn}
                onClick={() => navigate('/company/profile')}
                title="Company Profile"
              >
                <Building2 size={16} />
              </button>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => { logout(); navigate('/login'); }}
                title="Sign out"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </header>

          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
