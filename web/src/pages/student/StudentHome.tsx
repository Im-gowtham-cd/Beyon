import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import styles from './StudentHome.module.css';

export function StudentHome() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        Welcome back, {user?.name?.split(' ')[0]}.
      </h1>
      <div className={styles.cards}>
        <Link to="/student/profile" className={styles.card}>
          <span className={styles.cardIcon}>👤</span>
          <span className={styles.cardTitle}>Profile</span>
          <span className={styles.cardDesc}>View and edit your profile</span>
        </Link>
        <div className={`${styles.card} ${styles.cardDisabled}`}>
          <span className={styles.cardIcon}>⚡</span>
          <span className={styles.cardTitle}>Challenges</span>
          <span className={styles.cardDesc}>Coming soon</span>
        </div>
        <div className={`${styles.card} ${styles.cardDisabled}`}>
          <span className={styles.cardIcon}>🏆</span>
          <span className={styles.cardTitle}>Assessments</span>
          <span className={styles.cardDesc}>Coming soon</span>
        </div>
        <div className={`${styles.card} ${styles.cardDisabled}`}>
          <span className={styles.cardIcon}>🪙</span>
          <span className={styles.cardTitle}>Coins</span>
          <span className={styles.cardDesc}>Coming soon</span>
        </div>
      </div>
    </div>
  );
}
