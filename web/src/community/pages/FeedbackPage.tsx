import { useState, useEffect, useCallback } from 'react';
import { feedbackApi } from '../services/feedbackApi';
import type { FeedbackReport } from '../types/feedback';
import styles from './Community.module.css';

const REPORT_TYPES = [
  { value: 'BUG', icon: 'bx bx-bug', label: 'Report a Bug', desc: 'Something is broken or not working' },
  { value: 'IMPROVEMENT', icon: 'bx bx-bulb', label: 'Suggest Improvement', desc: 'Feature or workflow enhancement' },
  { value: 'ASSESSMENT', icon: 'bx bx-shield-quarter', label: 'Assessment Issue', desc: 'Problem with assessment or proctoring' },
  { value: 'PERFORMANCE', icon: 'bx bx-tachometer', label: 'Performance Issue', desc: 'Something is slow or unresponsive' },
];

const CATEGORIES = ['Account', 'Profile', 'Practice', 'Coins', 'Opportunity', 'Application', 'Assessment', 'Proctoring', 'Portfolio', 'Community', 'Institution', 'Company', 'Notification', 'Performance', 'Other'];
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const PRIORITY_LABELS: Record<string, string> = { LOW: 'Low', NORMAL: 'Normal', HIGH: 'High', URGENT: 'Urgent — critical issue' };

export function FeedbackPage() {
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [selectedReport, setSelectedReport] = useState<FeedbackReport | null>(null);
  const [form, setForm] = useState({ reportType: 'BUG', category: 'Other', title: '', description: '', userPriority: 'NORMAL' });
  const [similarReports, setSimilarReports] = useState<FeedbackReport[]>([]);
  const [_loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { feedbackApi.getMyReports().then(setReports).catch(() => {}).finally(() => setLoading(false)); }, []);

  const checkSimilar = useCallback(async (title: string) => {
    if (title.length < 5) { setSimilarReports([]); return; }
    try { setSimilarReports(await feedbackApi.findSimilar(title)); } catch { setSimilarReports([]); }
  }, []);

  useEffect(() => { const t = setTimeout(() => checkSimilar(form.title), 500); return () => clearTimeout(t); }, [form.title, checkSimilar]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const ctx = {
        browserInfo: navigator.userAgent,
        osInfo: navigator.platform,
        screenSize: `${window.screen.width}×${window.screen.height}`,
        page: window.location.pathname,
        applicationVersion: '1.0.0',
      };
      const report = await feedbackApi.submitReport({ ...form, ...ctx });
      setReports([report, ...reports]);
      setForm({ reportType: 'BUG', category: 'Other', title: '', description: '', userPriority: 'NORMAL' });
      setView('list');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch { setError('Unable to submit your report. Your information has not been lost.'); }
    finally { setSubmitting(false); }
  };

  const STATUS_COLORS: Record<string, string> = {
    SUBMITTED: '#ca8a04', UNDER_REVIEW: '#2563eb', INVESTIGATING: '#7c3aed',
    'NEED_MORE_INFO': '#f59e0b', PLANNED: '#0ea5e9', RESOLVED: '#16a34a', CLOSED: '#6b7280', REJECTED: '#dc2626',
  };

  if (_loading) return <div className={styles.container}><div className={styles.empty}>Loading reports...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Help & Feedback</h1>
          <p className={styles.subtitle}>Report issues, suggest improvements, or get help</p>
        </div>
        {view === 'list' && (
          <button className={styles.createBtn} onClick={() => { setView('form'); setError(''); }}>+ Report Issue</button>
        )}
        {view !== 'list' && (
          <button className={styles.backBtn} onClick={() => { setView('list'); setSelectedReport(null); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <i className="bx bx-arrow-back" /> Back to Reports
          </button>
        )}
      </div>

      {submitted && (
        <div className={styles.successBanner} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="bx bx-check-circle" style={{ fontSize: '1.2rem' }} />
          <span>Your report has been submitted. We'll review it shortly.</span>
        </div>
      )}
      {error && <div className={styles.errorBanner}>{error} <button onClick={handleSubmit} className={styles.retryBtn}>Try Again</button></div>}

      {view === 'form' && (
        <div className={styles.createForm}>
          <div className={styles.feedbackTypeGrid}>
            {REPORT_TYPES.map(rt => (
              <button key={rt.value} className={`${styles.feedbackTypeCard} ${form.reportType === rt.value ? styles.feedbackTypeActive : ''}`}
                onClick={() => setForm({ ...form, reportType: rt.value })}>
                <div className={styles.feedbackTypeLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className={rt.icon} />
                  <span>{rt.label}</span>
                </div>
                <div className={styles.feedbackTypeDesc}>{rt.desc}</div>
              </button>
            ))}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>Category *</label>
              <select className={styles.formSelect} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>Priority</label>
              <select className={styles.formSelect} value={form.userPriority} onChange={e => setForm({ ...form, userPriority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title *</label>
            <input className={styles.formInput} placeholder="Brief summary of the issue" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          {similarReports.length > 0 && (
            <div className={styles.similarBox}>
              <div className={styles.similarTitle}>Possible existing issues found:</div>
              {similarReports.map(r => (
                <div key={r.id} className={styles.similarItem}>
                  <span className={styles.similarId}>BEYON-{r.reportNumber}</span>
                  <span className={styles.similarText}>{r.title}</span>
                  <span className={styles.statusBadge} style={{ background: STATUS_COLORS[r.status] || '#6b7280', fontSize: '0.65rem' }}>{r.status}</span>
                </div>
              ))}
              <div className={styles.similarHint}>If this matches your issue, you don't need to submit a new report.</div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description *</label>
            <textarea className={styles.formTextarea} placeholder="Describe the issue in detail. What happened? What did you expect?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={6} />
          </div>

          <div className={styles.contextInfo}>
            <div className={styles.contextTitle}>Technical Context (auto-captured)</div>
            <div className={styles.contextGrid}>
              <span>Browser: {navigator.userAgent.split(' ').pop()}</span>
              <span>OS: {navigator.platform}</span>
              <span>Screen: {window.screen.width}×{window.screen.height}</span>
              <span>Version: 1.0.0</span>
              <span>Page: {window.location.pathname}</span>
            </div>
          </div>

          <button className={styles.submitBtn} onClick={handleSubmit} disabled={!form.title.trim() || !form.description.trim() || submitting}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      )}

      {view === 'list' && (
        <div className={styles.feedbackList}>
          {reports.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>No reports yet</div>
              <div className={styles.emptyDesc}>If something doesn't work, you can report it here.</div>
              <button className={styles.createBtn} onClick={() => setView('form')}>Report a Problem</button>
            </div>
          ) : (
            reports.map(r => (
              <div className={styles.feedbackCard} key={r.id} onClick={() => { setSelectedReport(r); setView('detail'); }} style={{ cursor: 'pointer' }}>
                <div className={styles.feedbackHeader}>
                  <span className={styles.reportNumber}>BEYON-{r.reportNumber}</span>
                  <span className={styles.statusBadge} style={{ background: STATUS_COLORS[r.status] || '#6b7280' }}>{r.status.replace(/_/g, ' ')}</span>
                </div>
                <div className={styles.feedbackTitle}>{r.title}</div>
                <div className={styles.feedbackMeta}>
                  <span className={styles.categoryBadge}>{r.category}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bx bx-time" /> {new Date(r.createdAt).toLocaleDateString()}</span>
                  {r.updatedAt !== r.createdAt && <span>Updated {new Date(r.updatedAt).toLocaleDateString()}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'detail' && selectedReport && (
        <FeedbackDetailView report={selectedReport} />
      )}
    </div>
  );
}

function FeedbackDetailView({ report }: { report: FeedbackReport }) {
  const [comments, setComments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([feedbackApi.getComments(report.id), feedbackApi.getStatusHistory(report.id)])
      .then(([c, h]) => { setComments(c); setHistory(h); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [report.id]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    await feedbackApi.addComment(report.id, newComment);
    setComments([...comments, { id: Date.now().toString(), content: newComment, createdAt: new Date().toISOString() }]);
    setNewComment('');
  };

  const SEVERITY_COLORS: Record<string, string> = { S0: '#dc2626', S1: '#f97316', S2: '#ca8a04', S3: '#6b7280' };
  const STATUS_COLORS: Record<string, string> = {
    SUBMITTED: '#ca8a04', UNDER_REVIEW: '#2563eb', INVESTIGATING: '#7c3aed',
    RESOLVED: '#16a34a', CLOSED: '#6b7280', REJECTED: '#dc2626',
  };

  return (
    <div className={styles.detailView}>
      <div className={styles.detailHeader}>
        <div>
          <span className={styles.reportNumber}>BEYON-{report.reportNumber}</span>
          <h2 className={styles.detailTitle}>{report.title}</h2>
        </div>
        <div className={styles.detailBadges}>
          <span className={styles.statusBadge} style={{ background: STATUS_COLORS[report.status] || '#6b7280' }}>{report.status.replace(/_/g, ' ')}</span>
          <span className={styles.severityBadge} style={{ background: SEVERITY_COLORS[report.systemSeverity] || '#6b7280' }}>{report.systemSeverity}</span>
          <span className={styles.categoryBadge}>{report.category}</span>
        </div>
      </div>

      <div className={styles.detailSection}>
        <h3 className={styles.detailSectionTitle}>Description</h3>
        <p className={styles.detailContent}>{report.description}</p>
      </div>

      <div className={styles.detailSection}>
        <h3 className={styles.detailSectionTitle}>Technical Context</h3>
        <div className={styles.contextGrid}>
          <div><strong>Browser:</strong> {report.browserInfo || 'N/A'}</div>
          <div><strong>OS:</strong> {report.osInfo || 'N/A'}</div>
          <div><strong>Screen:</strong> {report.screenSize || 'N/A'}</div>
          <div><strong>Version:</strong> {report.applicationVersion || 'N/A'}</div>
          <div><strong>Page:</strong> {report.page || 'N/A'}</div>
          {report.requestId && <div><strong>Request ID:</strong> {report.requestId}</div>}
        </div>
      </div>

      {history.length > 0 && (
        <div className={styles.detailSection}>
          <h3 className={styles.detailSectionTitle}>Status History</h3>
          <div className={styles.timeline}>
            {history.map(h => (
              <div className={styles.timelineItem} key={h.id}>
                <div className={styles.timelineDot} />
                <div>
                  <span className={styles.timelineStatus}>{h.newStatus.replace(/_/g, ' ')}</span>
                  {h.note && <span className={styles.timelineNote}> — {h.note}</span>}
                  <div className={styles.timelineTime}>{new Date(h.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.detailSection}>
        <h3 className={styles.detailSectionTitle}>Comments</h3>
        {comments.length === 0 && <p className={styles.emptyDesc}>No additional comments yet.</p>}
        {comments.map(c => (
          <div className={styles.commentItem} key={c.id}>
            <div className={styles.commentContent}>{c.content}</div>
            <div className={styles.commentTime}>{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        ))}
        <div className={styles.commentInput}>
          <textarea placeholder="Add additional information..." value={newComment} onChange={e => setNewComment(e.target.value)} rows={2} />
          <button className={styles.createBtn} onClick={handleComment} disabled={!newComment.trim()}>Add Comment</button>
        </div>
      </div>
    </div>
  );
}
