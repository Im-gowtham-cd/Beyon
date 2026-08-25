import type { ReactNode } from 'react';
import styles from './StepNavigation.module.css';

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  rightContent?: ReactNode;
}

export function StepNavigation({ onBack, onNext, nextLabel = 'Continue', nextDisabled, loading, loadingLabel, rightContent }: Props) {
  return (
    <div className={styles.nav}>
      {onBack ? (
        <button type="button" className={styles.backBtn} onClick={onBack}>← Back</button>
      ) : <div />}
      {rightContent || (
        <button type="button" className={`${styles.nextBtn} ${loading ? styles.loading : ''}`} onClick={onNext} disabled={nextDisabled || loading}>
          {loading ? loadingLabel || 'Submitting...' : nextLabel}
        </button>
      )}
    </div>
  );
}
