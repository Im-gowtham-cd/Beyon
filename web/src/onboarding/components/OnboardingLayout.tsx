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
        <Link to="/" className={styles.headerLeft}>
          <span className={styles.logoIcon}>B</span>
          <span className={styles.logoText}>Beyon</span>
        </Link>
        <div className={styles.stepLabel}>
          <span>Step {currentStep}</span> of {totalSteps}
        </div>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
