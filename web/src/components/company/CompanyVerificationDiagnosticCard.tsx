import { useState, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Clock,
  Check,
  Upload,
  FileText,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { api } from '../../services/api/client';
import styles from './CompanyVerificationDiagnosticCard.module.css';

export interface VerificationCheckItem {
  checkType: string;
  status: 'PASS' | 'FAIL' | string;
  details: string;
}

export interface VerificationDocumentItem {
  id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  verificationStatus?: string;
  createdAt?: string;
}

export interface VerificationData {
  overallStatus: string;
  isVerified: boolean;
  legalName?: string;
  cin?: string;
  companyStatus?: string;
  website?: string;
  websiteDomain?: string;
  corporateEmail?: string;
  emailDomain?: string;
  representativeName?: string;
  representativeDesignation?: string;
  representativePhone?: string;
  failureReasons?: string[] | string;
  checks?: VerificationCheckItem[];
  documents?: VerificationDocumentItem[];
}

interface Props {
  data: VerificationData;
  allowDocumentUpload?: boolean;
  onUploadSuccess?: () => void;
  showSummaryGrid?: boolean;
  adminView?: boolean;
}

const CHECK_NAMES: Record<string, { title: string; subtitle: string }> = {
  CIN_FORMAT_CHECK: {
    title: 'CIN 21-Character Structure',
    subtitle: 'Listing + Industry + State + Year + Class + RegNum format validation',
  },
  MCA_CIN_CHECK: {
    title: 'Ministry of Corporate Affairs Registry',
    subtitle: 'Validation against MCA Company Master database (Open Data MCA 2026)',
  },
  COMPANY_STATUS_CHECK: {
    title: 'Legal Entity Standing',
    subtitle: 'Verification that company status is Active (not Struck Off / Dormant)',
  },
  EMAIL_PROVIDER_CHECK: {
    title: 'Enterprise Email Provider Filter',
    subtitle: 'Exclusion of disposable and public consumer domains (Gmail, Yahoo, Outlook)',
  },
  WEBSITE_DOMAIN_CHECK: {
    title: 'Official Website Root Domain',
    subtitle: 'Parsing and normalization of company web presence',
  },
  EMAIL_DOMAIN_CHECK: {
    title: 'Corporate Email Root Domain',
    subtitle: 'Normalization and domain root extraction from applicant corporate email',
  },
  DOMAIN_MATCH_CHECK: {
    title: 'Domain Ownership Cross-Match',
    subtitle: 'Verification that website root domain matches corporate email root domain',
  },
};

const DOC_TYPES = [
  {
    key: 'CERTIFICATE_OF_INCORPORATION',
    label: 'Certificate of Incorporation',
    desc: 'Official certificate issued by the Registrar of Companies (ROC / MCA).',
  },
  {
    key: 'COMPANY_PAN',
    label: 'Company PAN Card',
    desc: 'Permanent Account Number card issued to the corporate entity by Income Tax Dept.',
  },
  {
    key: 'AUTHORIZATION_LETTER',
    label: 'Representative Authorization Letter',
    desc: 'Signed letterhead or board resolution authorizing this representative.',
  },
];

export function CompanyVerificationDiagnosticCard({
  data,
  allowDocumentUpload = false,
  onUploadSuccess,
  showSummaryGrid = true,
  adminView = false,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentDocTypeRef = useRef<string>('CERTIFICATE_OF_INCORPORATION');

  const isVerified = data.isVerified === true && data.overallStatus === 'VERIFIED';
  const isPending =
    data.overallStatus === 'PENDING' ||
    data.overallStatus === 'PENDING_SUPER_ADMIN_APPROVAL' ||
    data.overallStatus === 'PENDING_SUPER_ADMIN_VERIFICATION' ||
    data.overallStatus === 'MANUAL_REVIEW' ||
    data.overallStatus === 'MANUAL_REVIEW_DOCS_REQUESTED';

  const failureReasonsList: string[] = Array.isArray(data.failureReasons)
    ? data.failureReasons
    : typeof data.failureReasons === 'string' && data.failureReasons.trim()
    ? data.failureReasons.split(';').map((s) => s.trim()).filter(Boolean)
    : [];

  const checks = data.checks || [];
  const allChecksPassed =
    checks.length === 7 &&
    checks.every((c) => c.status === 'PASS') &&
    failureReasonsList.length === 0;

  const handleSelectFileToUpload = (docType: string) => {
    currentDocTypeRef.current = docType;
    setUploadError(null);
    setUploadSuccessMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds the 15 MB limit.');
      return;
    }

    const docType = currentDocTypeRef.current;
    setUploadingType(docType);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);

      await api.post('/company/verification/documents', formData);
      setUploadSuccessMsg(`Successfully uploaded ${file.name} for verification.`);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch {
      setUploadError('Failed to upload document. Please check your network and try again.');
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <div className={styles.cardContainer}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className={styles.hiddenFileInput}
        onChange={handleFileChange}
      />

      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div
            className={`${styles.statusIconBox} ${
              isVerified
                ? styles.statusIconBoxVerified
                : isPending
                ? styles.statusIconBoxPending
                : styles.statusIconBoxFailed
            }`}
          >
            {isVerified ? (
              <ShieldCheck size={26} />
            ) : isPending ? (
              <Clock size={26} />
            ) : (
              <AlertTriangle size={26} />
            )}
          </div>
          <div className={styles.titleArea}>
            <h3>
              <span>Enterprise Representative Verification Standing</span>
              {isVerified && <span style={{ color: '#15803d', fontSize: '0.85rem' }}>[Active Partner]</span>}
              {adminView && <span style={{ color: '#0369a1', fontSize: '0.8rem', marginLeft: '8px' }}>[Admin Inspection]</span>}
            </h3>
            <p className={styles.subtitle}>
              {isVerified
                ? 'Corporate identity, CIN registration, and representative domain match verified against MCA records.'
                : 'Automated 7-step identity and representative authorization verification engine results.'}
            </p>
          </div>
        </div>

        <div className={styles.badgeGroup}>
          <span
            className={`${styles.statusBadge} ${
              isVerified
                ? styles.badgeVerified
                : data.overallStatus === 'DOMAIN_MISMATCH'
                ? styles.badgeMismatch
                : isPending
                ? styles.badgePending
                : styles.badgeFailed
            }`}
          >
            {isVerified
              ? 'VERIFIED'
              : data.overallStatus === 'PENDING_SUPER_ADMIN_APPROVAL'
              ? 'STATUS: PENDING SUPER ADMIN APPROVAL'
              : `STATUS: ${data.overallStatus || 'PENDING_REVIEW'}`}
          </span>
        </div>
      </div>

      {allChecksPassed && !isVerified && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '14px 16px',
            margin: '16px 0',
          }}
        >
          <ShieldCheck size={22} style={{ color: '#1d4ed8', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1e3a8a' }}>
              All 7 Verification Checks Passed &mdash; Awaiting Super Admin Review &amp; Approval
            </div>
            <div style={{ fontSize: '0.78rem', color: '#1e40af', marginTop: '3px', lineHeight: 1.4 }}>
              Corporate credentials, CIN registration, and domain validation have passed all automated cross-checks against MCA records. In accordance with platform governance, all company registrations require mandatory Super Admin review and approval before campus drive and opportunity publishing privileges are unlocked.
            </div>
          </div>
        </div>
      )}

      {showSummaryGrid && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Legal Entity Name</span>
            <span className={styles.summaryValue}>{data.legalName || 'Unregistered Entity'}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Corporate CIN</span>
            <span className={`${styles.summaryValue} ${styles.summaryValueCode}`}>
              {data.cin || 'NOT PROVIDED'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>MCA Status</span>
            <span className={styles.summaryValue}>{data.companyStatus || 'Active'}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Website Domain</span>
            <span className={styles.summaryValue}>
              {data.websiteDomain || (data.website ? data.website.replace(/^https?:\/\//, '') : 'N/A')}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Corporate Email Domain</span>
            <span className={styles.summaryValue}>
              {data.emailDomain || (data.corporateEmail ? data.corporateEmail.split('@')[1] : 'N/A')}
            </span>
          </div>
          {data.representativeName && (
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Authorized Applicant</span>
              <span className={styles.summaryValue}>
                {data.representativeName} {data.representativeDesignation ? `(${data.representativeDesignation})` : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {failureReasonsList.length > 0 && !isVerified && (
        <div className={styles.failureAlertBox}>
          <div className={styles.failureAlertTitle}>
            <XCircle size={16} />
            <span>Verification Criteria Requiring Manual Review ({failureReasonsList.length})</span>
          </div>
          <ul className={styles.failureList}>
            {failureReasonsList.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.sectionBody}>
        <div className={styles.tableTitleRow}>
          <div className={styles.sectionHeading}>
            <ShieldCheck size={16} />
            <span>Automated 7-Check Verification Diagnostic</span>
          </div>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse Details' : 'Expand Details'}
          </button>
        </div>

        {expanded && (
          <table className={styles.checksTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>No.</th>
                <th style={{ width: '240px' }}>Verification Check</th>
                <th style={{ width: '90px' }}>Status</th>
                <th>Diagnostic Details</th>
              </tr>
            </thead>
            <tbody>
              {checks.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                    Verification checks are queued or not yet executed.
                  </td>
                </tr>
              ) : (
                checks.map((c, index) => {
                  const checkMeta = CHECK_NAMES[c.checkType] || {
                    title: c.checkType,
                    subtitle: 'Automated verification check',
                  };
                  const isPass = c.status === 'PASS';

                  return (
                    <tr key={c.checkType || index}>
                      <td style={{ fontWeight: 700, color: '#64748b' }}>{index + 1}</td>
                      <td className={styles.checkNameCol}>
                        <span>{checkMeta.title}</span>
                        <span className={styles.checkCode}>{c.checkType}</span>
                      </td>
                      <td>
                        {isPass ? (
                          <span className={styles.pillPass}>
                            <Check size={12} /> PASS
                          </span>
                        ) : (
                          <span className={styles.pillFail}>
                            <XCircle size={12} /> FAIL
                          </span>
                        )}
                      </td>
                      <td className={styles.detailsCol}>{c.details}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {allowDocumentUpload && (
          <div className={styles.docsSection}>
            <div className={styles.sectionHeading}>
              <Upload size={16} />
              <span>Supporting Entity Proofs (MCA / ROC Compliance)</span>
            </div>
            <p className={styles.docsSubtitle}>
              If your corporate email domain does not match the website or you use an authorized partner domain, upload government-recognized business proofs to expedite Super Admin approval.
            </p>

            {uploadSuccessMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '14px',
                }}
              >
                {uploadSuccessMsg}
              </div>
            )}

            {uploadError && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '14px',
                }}
              >
                {uploadError}
              </div>
            )}

            <div className={styles.uploadRowGrid}>
              {DOC_TYPES.map((dt) => {
                const isUploading = uploadingType === dt.key;
                const existingDoc = data.documents?.find((d) => d.docType === dt.key);

                return (
                  <div key={dt.key} className={styles.uploadCard}>
                    <div>
                      <div className={styles.uploadCardTitle}>
                        <FileText size={16} color="#1c2d81" />
                        <span>{dt.label}</span>
                      </div>
                      <div className={styles.uploadCardDesc}>{dt.desc}</div>
                    </div>

                    <div className={styles.uploadActionArea}>
                      {existingDoc ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={13} /> Uploaded
                          </span>
                          <a
                            href={existingDoc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.docLink}
                            style={{ fontSize: '0.74rem' }}
                          >
                            View <ExternalLink size={11} />
                          </a>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => handleSelectFileToUpload(dt.key)}
                          className={`${styles.uploadBtn} ${isUploading ? styles.uploadBtnDisabled : ''}`}
                        >
                          <Upload size={13} />
                          <span>{isUploading ? 'Uploading...' : 'Upload File (PDF/Image)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {data.documents && data.documents.length > 0 && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Uploaded Repository Files ({data.documents.length})
                </div>
                <table className={styles.docsListTable}>
                  <thead>
                    <tr>
                      <th>Document Type</th>
                      <th>File Name</th>
                      <th>Verification Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.documents.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          {DOC_TYPES.find((d) => d.key === doc.docType)?.label || doc.docType}
                        </td>
                        <td style={{ color: '#64748b' }}>{doc.fileName}</td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              background: doc.verificationStatus === 'VERIFIED' ? '#dcfce7' : '#fef3c7',
                              color: doc.verificationStatus === 'VERIFIED' ? '#15803d' : '#b45309',
                            }}
                          >
                            {doc.verificationStatus || 'PENDING_REVIEW'}
                          </span>
                        </td>
                        <td>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.docLink}
                          >
                            <span>Inspect</span>
                            <ExternalLink size={12} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className={styles.governanceNotice}>
          {isVerified ? (
            <div>
              <span className={styles.governanceNoticeStrong}>Accredited Campus Hiring Access Active:</span>{' '}
              Your corporate identity has satisfied all legal and domain verification checks. Your organization is authorized to post campus placement drives, publish hiring opportunities, create proctored coding assessments, and review verified student profiles.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Lock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span className={styles.governanceNoticeStrong}>Platform Security Guardrail:</span>{' '}
                To protect partner higher education institutions and candidate security, unverified corporate accounts are prohibited from publishing opportunities, launching campus recruitment drives, scheduling assessments, or contacting students. Accounts requiring manual review will be audited by the Super Administrator within 24 hours.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
