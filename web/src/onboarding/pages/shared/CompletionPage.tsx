import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/context/AuthContext';
import { getRoleTier } from '../../../auth/types/auth';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import styles from './CompletionPage.module.css';

const ROLE_MESSAGES: Record<string, { title: string; subtitle: string; cta: string; path: string }> = {
  STUDENT: {
    title: 'Student Profile Registered',
    subtitle: 'Your profile has been submitted to your institution for placement verification. You can now take assessments and practice coding.',
    cta: 'Go to Student Hub',
    path: '/student/home',
  },
  INSTITUTION: {
    title: 'Registration Submitted for Super Admin Verification',
    subtitle: 'Your institutional credentials have been submitted to the Super Admin verification queue. Placement workflows will be activated upon approval.',
    cta: 'View Institutional Dashboard',
    path: '/institution/home',
  },
  COMPANY: {
    title: 'Corporate Account Submitted for Verification',
    subtitle: 'Your corporate registration is undergoing Super Admin verification. You will be able to post drives and access candidate rosters once approved.',
    cta: 'View Company Dashboard',
    path: '/company/home',
  },
  SUPER_ADMIN: {
    title: 'Platform Administrator Initialized',
    subtitle: 'Your administrative portal is ready for system governance and verification oversight.',
    cta: 'Go to Admin Portal',
    path: '/admin/home',
  },
};

export function CompletionPage() {
  const { user } = useAuth();
  const tier = getRoleTier(user?.role);
  const msg = ROLE_MESSAGES[tier] || ROLE_MESSAGES.STUDENT;

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

