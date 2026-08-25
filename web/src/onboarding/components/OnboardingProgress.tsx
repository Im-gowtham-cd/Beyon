import styles from './OnboardingProgress.module.css';

interface Step {
  label: string;
}

interface Props {
  steps: Step[];
  currentStepIndex: number;
}

export function OnboardingProgress({ steps, currentStepIndex }: Props) {
  return (
    <div className={styles.progress}>
      {steps.map((step, i) => (
        <div key={i}>
          <div className={`${styles.step} ${i === currentStepIndex ? styles.active : ''} ${i < currentStepIndex ? styles.completed : ''}`}>
            <div className={styles.stepCircle}>
              {i < currentStepIndex ? '✓' : i + 1}
            </div>
            <span className={styles.stepLabel}>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`${styles.connector} ${i < currentStepIndex ? styles.completed : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}
