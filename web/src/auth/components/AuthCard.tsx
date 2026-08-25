import type { ReactNode } from 'react';
import styles from './AuthCard.module.css';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, footer, children }: AuthCardProps) {
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {children}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
