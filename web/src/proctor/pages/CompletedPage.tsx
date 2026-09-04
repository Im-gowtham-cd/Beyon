import React from 'react';
import styles from '../styles/MobileProctor.module.css';

export const CompletedPage: React.FC = () => {
  return (
    <div className={styles.card} style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
      <div style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.75rem' }}>
        ✓
      </div>
      <div>
        <h2 className={styles.title} style={{ marginTop: '1rem' }}>Session Concluded</h2>
        <p className={styles.subtitle} style={{ marginTop: '0.5rem' }}>
          DualView proctoring stream has successfully stopped. You may now close this tab.
        </p>
      </div>
    </div>
  );
};