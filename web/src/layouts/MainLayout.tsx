import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import styles from './MainLayout.module.css';

export function MainLayout() {
  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>Skip to main content</a>
      <Header />
      <main id="main-content" className={styles.main} role="main">
        <Outlet />
      </main>
      <footer className={styles.footer} role="contentinfo">
        <p>&copy; 2026 Beyon. All rights reserved.</p>
      </footer>
    </div>
  );
}
