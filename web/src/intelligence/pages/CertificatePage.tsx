import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { StudentCertificate } from '../types/intelligence';
import styles from '../../practice/pages/Gamification.module.css';

export function CertificatePage() {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const certs = await intelligenceApi.getMyCertificates();
        setCertificates(certs);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2].map(i => <div key={i} className={styles.skeleton} style={{ height: 100 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>My Certificates</h1>
          <p className={styles.subtitle}>Verified digital certifications earned through Beyon</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Certificates</span>
          <span className={styles.statValue}>{certificates.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Verified</span>
          <span className={styles.statValue}>{certificates.filter(c => !c.expiresAt || new Date(c.expiresAt) > new Date()).length}</span>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎓</div>
          <h3 className={styles.emptyTitle}>No certificates yet</h3>
          <p className={styles.emptyText}>Complete learning programs and pass assessments to earn verified certificates.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {certificates.map(c => (
            <div key={c.id} className={styles.certCard}>
              <div className={styles.certIcon}>🎓</div>
              <div className={styles.certInfo}>
                <h3 className={styles.certTitle}>{c.title}</h3>
                <span className={styles.certIssuer}>Issued by {c.issuerName}</span>
                {c.skillsCovered && <span className={styles.certDate}>Skills: {c.skillsCovered}</span>}
                {c.score != null && <span className={styles.certDate}>Score: {c.score}%</span>}
                <span className={styles.certNumber}>ID: {c.certificateNumber}</span>
                <span className={styles.certDate}>Issued: {new Date(c.issuedAt).toLocaleDateString()}</span>
                {c.verificationUrl && (
                  <a href={c.verificationUrl} className={styles.certVerifyLink} target="_blank" rel="noopener noreferrer">
                    Verify Certificate →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
