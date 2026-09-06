import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <img src="/logo-transparent.png" alt="Beyon" className={styles.logoImg} />
        </Link>
        {children}
      </div>
    </div>
  );
}

