import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Camera,
  Smartphone,
  CheckCircle,
  Clock,
  ArrowLeft,
  Activity,
  Check,
  AlertOctagon,
} from 'lucide-react';
import { api } from '../../services/api/client';
import styles from './AssessmentBuilderPage.module.css';

interface Incident {
  id: string;
  incidentType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  riskContribution: number;
  questionId?: string;
  sources: string[];
  signalCount: number;
  startedAt: string;
  reviewerAction?: string;
  evidence?: {
    id: string;
    evidenceType: string;
    deviceSource: string;
    storageUrl?: string;
    capturedAt: string;
  }[];
}

interface ProctoringReport {
  procSessionId: string;
  assessmentSessionId: string;
  candidateId: string;
  status: string;
  riskScore: number;
  riskLevel: 'NORMAL' | 'LOW_CONCERN' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL';
  reviewRequired: boolean;
  reviewerDecision?: string;
  reviewedAt?: string;
  laptopCameraHealth: string;
  mobileCameraHealth: string;
  mobilePaired: boolean;
  startedAt?: string;
  completedAt?: string;
  incidentSummary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    pendingReview: number;
  };
  incidents: Incident[];
}

export const ProctoringReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ProctoringReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchReport = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<ProctoringReport>(`/proctoring/dualview/${sessionId}/report`);
      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load proctoring report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const handleReviewIncident = async (incidentId: string, action: string) => {
    if (!report) return;
    try {
      await api.post(
        `/proctoring/dualview/${report.procSessionId}/incidents/${incidentId}/review`,
        { action, notes: reviewNotes }
      );
      setReviewingId(null);
      setReviewNotes('');
      await fetchReport();
    } catch (err: any) {
      alert('Failed to submit review: ' + (err?.message || 'Error occurred'));
    }
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'CRITICAL':
        return '#dc2626';
      case 'HIGH_RISK':
        return '#ea580c';
      case 'SUSPICIOUS':
        return '#d97706';
      case 'LOW_CONCERN':
        return '#2563eb';
      default:
        return '#16a34a';
    }
  };

  if (loading) {
    return (
      <div className={styles.builderContainer}>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading DualView integrity telemetry...
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className={styles.builderContainer}>
        <button
          className={styles.btnSecondary}
          onClick={() => navigate('/company/assessments')}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={16} /> Back to Assessments
        </button>
        <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '0.75rem', color: '#991b1b' }}>
          {error || 'No proctoring report found for this session.'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.builderContainer}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button className={styles.btnSecondary} onClick={() => navigate('/company/assessments')}>
          <ArrowLeft size={16} /> Back to Assessments
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>DualView Session ID:</span>
          <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
            {report.procSessionId}
          </code>
        </div>
      </div>

      {/* Hero Overview */}
      <div className={styles.formCard} style={{ borderLeft: `6px solid ${getRiskColor(report.riskLevel)}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.sectionHeading} style={{ border: 'none', margin: 0, padding: 0 }}>
              DualView AI Proctoring &amp; Integrity Audit
            </h1>
            <p className={styles.formDescription} style={{ marginTop: '0.25rem' }}>
              Multi-signal correlation analysis comparing primary laptop camera with secondary side-angle mobile verification.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                background: `${getRiskColor(report.riskLevel)}15`,
                color: getRiskColor(report.riskLevel),
                fontWeight: 700,
                fontSize: '0.875rem',
                border: `1px solid ${getRiskColor(report.riskLevel)}30`,
              }}
            >
              <ShieldCheck size={16} />
              <span>{report.riskLevel.replace('_', ' ')}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: getRiskColor(report.riskLevel) }}>
              {report.riskScore} <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>/ 100 Risk</span>
            </div>
          </div>
        </div>

        {/* Health Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Camera size={20} color={report.laptopCameraHealth === 'OK' ? '#16a34a' : '#ea580c'} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Laptop Front Camera</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{report.laptopCameraHealth}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Smartphone size={20} color={report.mobilePaired ? '#16a34a' : '#94a3b8'} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mobile Side View</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {report.mobilePaired ? 'Paired & Verified' : 'Not Paired'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={20} color="#2563eb" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Incidents</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {report.incidentSummary.total} ({report.incidentSummary.high} High/Crit)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={20} color="#64748b" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Auditor Verdict</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: report.reviewerDecision ? '#16a34a' : '#d97706' }}>
                {report.reviewerDecision || 'Pending Audit'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Timeline */}
      <div className={styles.formCard} style={{ marginTop: '1.5rem' }}>
        <h2 className={styles.sectionHeading}>
          Correlated Incident Timeline ({report.incidents.length})
        </h2>
        <p className={styles.formDescription}>
          Incidents are generated only when multi-sensor signals (gaze deviation + second screen/person detection) cross correlation thresholds.
        </p>

        {report.incidents.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#16a34a', background: '#f0fdf4', borderRadius: '0.5rem', marginTop: '1rem' }}>
            <CheckCircle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 600 }}>Zero Integrity Incidents Detected</div>
            <div style={{ fontSize: '0.8125rem', color: '#15803d', marginTop: '0.25rem' }}>
              Candidate completed the assessment within standard behavioral tolerance limits.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {report.incidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  background: inc.reviewerAction === 'VIOLATION_CONFIRMED' ? '#fff1f2' : '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          background: `${getRiskColor(inc.severity)}20`,
                          color: getRiskColor(inc.severity),
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {inc.severity}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                        {inc.incidentType.replace(/_/g, ' ')}
                      </h3>
                      {inc.questionId && (
                        <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', color: '#475569' }}>
                          Question {inc.questionId}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.35rem' }}>
                      Timestamp: {new Date(inc.startedAt).toLocaleTimeString()} &middot; Confidence: {(inc.confidence * 100).toFixed(0)}% &middot; Contributing Signals: {inc.signalCount}
                    </div>
                  </div>

                  {inc.reviewerAction ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: inc.reviewerAction === 'VIOLATION_CONFIRMED' ? '#dc2626' : '#16a34a' }}>
                      {inc.reviewerAction === 'VIOLATION_CONFIRMED' ? <AlertOctagon size={16} /> : <Check size={16} />}
                      <span>{inc.reviewerAction.replace('_', ' ')}</span>
                    </div>
                  ) : (
                    <button
                      className={styles.btnSecondary}
                      onClick={() => setReviewingId(inc.id)}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                    >
                      Audit Incident
                    </button>
                  )}
                </div>

                {/* Signals Sources */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {inc.sources?.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.6875rem',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        color: '#334155',
                      }}
                    >
                      {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                {/* Audit Action Panel */}
                {reviewingId === inc.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Recruiter Determination &amp; Notes:
                    </div>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add evidence notes, e.g. 'False alarm due to room glare' or 'Confirmed unauthorized external assistance'."
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8125rem',
                        minHeight: '60px',
                        marginBottom: '0.75rem',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        className={styles.btnSecondary}
                        onClick={() => setReviewingId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className={styles.btnSecondary}
                        style={{ color: '#16a34a' }}
                        onClick={() => handleReviewIncident(inc.id, 'DISMISSED')}
                      >
                        Dismiss False Alarm
                      </button>
                      <button
                        className={styles.btnPrimary}
                        style={{ background: '#dc2626', borderColor: '#dc2626' }}
                        onClick={() => handleReviewIncident(inc.id, 'VIOLATION_CONFIRMED')}
                      >
                        Confirm Violation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};