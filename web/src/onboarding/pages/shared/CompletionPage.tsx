import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/context/AuthContext';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import styles from './CompletionPage.module.css';

const ROLE_MESSAGES: Record<string, { title: string; subtitle: string; cta: string; path: string }> = {
  STUDENT: {
    title: 'You\'re ready for Beyon.',
    subtitle: 'Start building your skills. Earn Beyon Coins. Unlock opportunities.',
    cta: 'Go to Dashboard',
    path: '/student/home',
  },
  INSTITUTION: {
    title: 'You\'re ready for Beyon.',
    subtitle: 'Start building your institution\'s talent ecosystem.',
    cta: 'Go to Dashboard',
    path: '/institution/home',
  },
  COMPANY: {
    title: 'You\'re ready for Beyon.',
    subtitle: 'Start connecting with skilled talent.',
    cta: 'Go to Dashboard',
    path: '/company/home',
  },
};

export function CompletionPage() {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';
  const msg = ROLE_MESSAGES[role] || ROLE_MESSAGES.STUDENT;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <OnboardingLayout currentStep={5} totalSteps={5}>
      <div className={styles.container}>
        <div className={styles.checkmark}>
          <i className="bx bx-check" />
        </div>
        <h1 className={styles.title}>{msg.title}</h1>
        <p className={styles.subtitle}>{msg.subtitle}</p>
        <Link to={msg.path} className={styles.cta}>
          <span>{msg.cta}</span>
          <i className="bx bx-right-arrow-alt" style={{ marginLeft: '6px' }} />
        </Link>
      </div>
    </OnboardingLayout>
  );
}
