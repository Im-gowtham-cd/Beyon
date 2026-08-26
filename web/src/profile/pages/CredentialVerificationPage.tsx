import { useState } from 'react';
import { api } from '../../services/api/client';
import styles from './ProfilePages.module.css';

export function CredentialVerificationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verify = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.get(`/professional/verify/${searchQuery.trim()}`);
      setResult(data);
    } catch {
      setError('Certificate not found. Please check the credential ID.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Beyon Credential Verification</h1>
        <p className={styles.subtitle}>Verify the authenticity of any Beyon credential</p>
      </div>

      <div className={styles.verifySearch}>
        <input
          className={styles.input}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && verify()}
          placeholder="Enter credential ID (e.g., BYN-SKL-XXXXXXXX)"
          style={{ flex: 1, fontSize: '1.1rem', padding: '1rem' }}
        />
        <button className={styles.btnPrimary} onClick={verify} disabled={loading} style={{ padding: '1rem 2rem' }}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {result && (
        <div className={styles.verifyCard}>
          <div className={styles.verifyIcon}>{result.verified ? '✅' : '❌'}</div>
          <div className={styles.verifyStatus}>{result.verified ? 'Verified Credential' : 'Invalid Credential'}</div>

          <div className={styles.verifyDetails}>
            <div className={styles.verifyRow}>
              <span className={styles.verifyLabel}>Student</span>
              <span className={styles.verifyValue}>{result.studentName}</span>
            </div>
            <div className={styles.verifyRow}>
              <span className={styles.verifyLabel}>Credential</span>
              <span className={styles.verifyValue}>{result.title}</span>
            </div>
            {result.skillName && (
              <div className={styles.verifyRow}>
                <span className={styles.verifyLabel}>Skill</span>
                <span className={styles.verifyValue}>{result.skillName}</span>
              </div>
            )}
            <div className={styles.verifyRow}>
              <span className={styles.verifyLabel}>Issued By</span>
              <span className={styles.verifyValue}>{result.issuerName}</span>
            </div>
            {result.score && (
              <div className={styles.verifyRow}>
                <span className={styles.verifyLabel}>Score</span>
                <span className={styles.verifyValue}>{result.score}%</span>
              </div>
            )}
            <div className={styles.verifyRow}>
              <span className={styles.verifyLabel}>Issued</span>
              <span className={styles.verifyValue}>{result.issuedAt ? new Date(result.issuedAt).toLocaleDateString() : '—'}</span>
            </div>
            {result.expiresAt && (
              <div className={styles.verifyRow}>
                <span className={styles.verifyLabel}>Expires</span>
                <span className={styles.verifyValue}>{new Date(result.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
            <div className={styles.verifyRow}>
              <span className={styles.verifyLabel}>Credential ID</span>
              <span className={styles.verifyValue} style={{ fontFamily: 'monospace' }}>{result.certificateNumber}</span>
            </div>
            <div className={styles.verifyRow}>
              <span className={styles.verifyLabel}>Status</span>
              <span className={styles.verifyValue}>
                <span className={styles.verifiedBadge}>{result.verificationStatus}</span>
              </span>
            </div>
            {result.skillsCovered && (
              <div className={styles.verifyRow}>
                <span className={styles.verifyLabel}>Skills Covered</span>
                <span className={styles.verifyValue}>{result.skillsCovered}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!result && !error && !loading && (
        <div className={styles.empty}>
          <p>Enter a credential ID or scan a QR code to verify any Beyon certificate.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Credential IDs start with BYN- followed by the type prefix and a unique identifier.</p>
        </div>
      )}
    </div>
  );
}
