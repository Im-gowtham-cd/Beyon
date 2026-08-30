import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { Menu, ShieldCheck, RefreshCw, LogOut, ExternalLink } from 'lucide-react';
import styles from './AdminLayout.module.css';

export function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      <div className={styles.mobileBar}>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          <Menu size={18} />
          <span>Admin Menu</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fed601', fontWeight: 800, fontSize: '0.9rem' }}>
            B
          </div>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>BEYON ADMIN</span>
        </div>
      </div>

      <div className={styles.bodyWrapper}>
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main
          className={`${styles.mainContent} ${sidebarCollapsed ? styles.mainContentCollapsed : ''}`}
        >
          <header className={styles.topUtilityBar}>
            <div className={styles.utilityLeft}>
              <span className={styles.portalTag}>
                <ShieldCheck size={15} color="#15803d" />
                <span>Super Administrator Command &amp; Governance Center</span>
              </span>
            </div>

            <div className={styles.utilityRight}>
              <button
                type="button"
                className={styles.utilityBtn}
                onClick={() => window.open('/', '_blank')}
                title="View Main Platform"
              >
                <ExternalLink size={14} />
                <span>Public Portal</span>
              </button>

              <button
                type="button"
                className={styles.utilityBtn}
                onClick={() => navigate('/admin/home')}
                title="Refresh State"
              >
                <RefreshCw size={14} />
                <span>Reload</span>
              </button>

              <div className={styles.userBadge}>
                <div className={styles.userAvatar}>
                  {user?.name?.slice(0, 2).toUpperCase() || 'SA'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                    {user?.name || 'Super Admin'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    superadmin@beyon.test
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.utilityBtn}
                  onClick={() => logout()}
                  title="Sign Out"
                  style={{ marginLeft: '6px' }}
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
