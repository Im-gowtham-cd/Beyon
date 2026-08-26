import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { LearningWidget } from '../../student/components/LearningWidget';
import styles from './StudentHome.module.css';

export function StudentHome() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        Welcome back, {user?.name?.split(' ')[0]}.
      </h1>
      <div className={styles.dashboardGrid}>
        <div className={styles.cards}>
          <Link to="/student/profile" className={styles.card}>
            <span className={styles.cardIcon}>👤</span>
            <span className={styles.cardTitle}>Profile</span>
            <span className={styles.cardDesc}>View and edit your profile</span>
          </Link>
          <Link to="/student/skills" className={styles.card}>
            <span className={styles.cardIcon}>⚡</span>
            <span className={styles.cardTitle}>Skills</span>
            <span className={styles.cardDesc}>Explore skill taxonomy</span>
          </Link>
          <Link to="/practice" className={styles.card}>
            <span className={styles.cardIcon}>📝</span>
            <span className={styles.cardTitle}>Practice</span>
            <span className={styles.cardDesc}>Solve questions</span>
          </Link>
          <Link to="/daily-challenge" className={styles.card}>
            <span className={styles.cardIcon}>🎯</span>
            <span className={styles.cardTitle}>Daily Challenge</span>
            <span className={styles.cardDesc}>Today's challenge</span>
          </Link>
          <Link to="/stats" className={styles.card}>
            <span className={styles.cardIcon}>📊</span>
            <span className={styles.cardTitle}>Stats</span>
            <span className={styles.cardDesc}>Your progress</span>
          </Link>
          <Link to="/leaderboard" className={styles.card}>
            <span className={styles.cardIcon}>🏅</span>
            <span className={styles.cardTitle}>Leaderboard</span>
            <span className={styles.cardDesc}>Global rankings</span>
          </Link>
          <Link to="/opportunities" className={styles.card}>
            <span className={styles.cardIcon}>💼</span>
            <span className={styles.cardTitle}>Opportunities</span>
            <span className={styles.cardDesc}>Company openings</span>
          </Link>
        </div>
        <LearningWidget />
      </div>
    </div>
  );
}
