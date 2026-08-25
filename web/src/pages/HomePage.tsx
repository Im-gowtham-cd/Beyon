import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Learn <span className={styles.accent}>→</span> Practice{' '}
          <span className={styles.accent}>→</span> Prove{' '}
          <span className={styles.accent}>→</span> Get Hired
        </h1>
        <p className={styles.subtitle}>
          Beyon is an AI-powered skill development and recruitment ecosystem
          connecting students, companies, and educational institutions.
        </p>
      </section>
    </div>
  );
}
