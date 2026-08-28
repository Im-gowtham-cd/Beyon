import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import styles from './OnboardingLayout.module.css';

interface Props {
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
}

export function OnboardingLayout({ currentStep, totalSteps, children }: Props) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.brandLink}>
          <div className={styles.brandLogo}>B</div>
          <div className={styles.brandTextGroup}>
            <span className={styles.brandName}>BEYON</span>
            <span className={styles.brandTag}>Profile Setup</span>
          </div>
        </Link>
        <div className={styles.stepBadge}>
          <span className={styles.stepHighlight}>Step {currentStep}</span> of {totalSteps}
        </div>
      </header>
      <main className={styles.content}>
        <div className={styles.contentCard}>
          {children}
        </div>
      </main>
    </div>
  );
}
