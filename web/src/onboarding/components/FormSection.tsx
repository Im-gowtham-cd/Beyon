import type { ReactNode } from 'react';
import styles from './FormSection.module.css';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function FormSection({ title, subtitle, children }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
      {children}
      <hr className={styles.divider} />
    </section>
  );
}
