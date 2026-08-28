import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { StudentSidebar } from './StudentSidebar';
import styles from './StudentLayout.module.css';

export function StudentLayout() {
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
          <i className="bx bx-menu-alt-left" style={{ fontSize: '1.3rem' }} />
          <span>Menu</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#1c2d81', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fed601', fontWeight: 900, fontSize: '0.9rem' }}>
            B
          </div>
          <span style={{ fontWeight: 800, color: '#1c2d81', fontSize: '1rem', letterSpacing: '-0.02em' }}>BEYON</span>
        </div>
      </div>

      <div className={styles.bodyWrapper}>
        {/* Full-Height Fixed Left Sidebar */}
        <StudentSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Primary Main Workspace Canvas (Offset from fixed sidebar) */}
        <main
          className={`${styles.mainContent} ${sidebarCollapsed ? styles.mainContentCollapsed : ''}`}
        >
          {/* Subtle Top Utility Bar */}
          <header className={styles.topUtilityBar}>
            <div className={styles.utilityLeft}>
              <span className={styles.portalTag}>🚀 Enterprise Student Workspace</span>
            </div>
            <div className={styles.utilityRight}>
              <button
                type="button"
                className={styles.utilityBtn}
                onClick={() => navigate('/notifications')}
                title="Notifications"
              >
                <i className="bx bx-bell" />
                <span className={styles.dotBadge} />
              </button>
              <button
                type="button"
                className={styles.utilityBtn}
                onClick={() => navigate('/student/profile')}
                title="Profile & Settings"
              >
                <i className="bx bx-user" />
              </button>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => { logout(); navigate('/login'); }}
                title="Sign out"
              >
                <i className="bx bx-log-out" />
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
