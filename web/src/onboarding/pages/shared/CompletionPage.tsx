import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/context/AuthContext';
import { getRoleTier } from '../../../auth/types/auth';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import styles from './CompletionPage.module.css';

const ROLE_MESSAGES: Record<string, { title: string; subtitle: string; cta: string; path: string }> = {
  STUDENT: {
    title: 'Student Profile Submitted & Saved',
    subtitle: 'Your profile has been persisted in the database and linked to your institution. To complete validation and access your student dashboard, please complete your 50-Question Skill Validation Assessment.',
    cta: 'Start Skill Validation Assessment',
    path: '/onboarding/skill-assessment',
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
  const location = useLocation();
  const tier = getRoleTier(user?.role);
  const msg = ROLE_MESSAGES[tier] || ROLE_MESSAGES.STUDENT;
  const coinsAwarded = (location.state as any)?.coinsAwarded || 100;
  const persistenceLedger = (location.state as any)?.persistenceLedger;

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

        {tier === 'STUDENT' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#fefce8',
              border: '1px solid #fef08a',
              color: '#854d0e',
              fontSize: '0.86rem',
              fontWeight: 700,
              marginBottom: '24px',
            }}
          >
            <span>Welcome Bonus: {coinsAwarded} Beyon Coins Credited to your Wallet</span>
          </div>
        )}

        {persistenceLedger && (
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '28px',
            }}
          >
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 12px 0' }}>
              Data Persistence Architecture Ledger
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                  Table: users (Identity Service)
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  Role: STUDENT | Account Status: ACTIVE | Verified: false (Unverified)
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                  Table: student_profiles (Core Platform)
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  Names, AICTE Code, 10th/12th/Diploma marks, Internships, S3 ID card photo URL
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                  Table: institution_students (Institutional Roster)
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  Linked to college | Verified: false (Awaiting TPO validation)
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                  Storage: s3://beyon-documents (Amazon S3 Document Lake)
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  Student ID Card photo, Internship completion certificates, Resume PDF
                </div>
              </div>
            </div>
          </div>
        )}

        <Link to={msg.path} className={styles.cta}>
          <span>{msg.cta}</span>
          <i className="bx bx-right-arrow-alt" style={{ marginLeft: '6px' }} />
        </Link>
      </div>
    </OnboardingLayout>
  );
}

