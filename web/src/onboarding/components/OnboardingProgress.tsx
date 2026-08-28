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
    <div className={styles.progressContainer}>
      <div className={styles.stepper}>
        {steps.map((step, i) => {
          const isCompleted = i < currentStepIndex;
          const isActive = i === currentStepIndex;
          return (
            <div key={i} className={styles.stepItem}>
              <div className={styles.stepHeader}>
                <div
                  className={`${styles.stepCircle} ${isActive ? styles.circleActive : ''} ${isCompleted ? styles.circleCompleted : ''}`}
                >
                  {isCompleted ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : ''}`}
                  />
                )}
              </div>
              <span
                className={`${styles.stepLabel} ${isActive ? styles.labelActive : ''} ${isCompleted ? styles.labelCompleted : ''}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
