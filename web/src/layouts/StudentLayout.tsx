import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StudentSidebar } from './StudentSidebar';
import styles from './StudentLayout.module.css';

export function StudentLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Header />

      {/* Mobile Drawer Trigger Bar */}
      <div className={styles.mobileBar}>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          <i className="bx bx-menu-alt-left" style={{ fontSize: '1.2rem' }} />
          <span>Dashboard Navigation</span>
        </button>
        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
          Beyon Student Portal
        </span>
      </div>

      <div className={styles.bodyWrapper}>
        <StudentSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className={styles.mainContent}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
