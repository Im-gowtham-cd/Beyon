import styles from './AssessmentApp.module.css';

export function AssessmentApp() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.logo}>B</span>
        <h1 className={styles.title}>Beyon Assessment</h1>
      </header>
      <main className={styles.main}>
        <p className={styles.placeholder}>Assessment environment — ready for Phase 02</p>
      </main>
    </div>
  );
}
