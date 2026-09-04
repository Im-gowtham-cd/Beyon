import { useState, useEffect } from 'react';
import { feedbackApi } from '../services/feedbackApi';
import type { FeedbackReport, FeedbackStats, FeedbackInternalNote } from '../types/feedback';
import styles from './Community.module.css';

const STATUSES = ['', 'SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING', 'NEED_MORE_INFO', 'PLANNED', 'RESOLVED', 'CLOSED', 'REJECTED'];
const CATEGORIES = ['', 'Account', 'Profile', 'Practice', 'Coins', 'Opportunity', 'Application', 'Assessment', 'Proctoring', 'Portfolio', 'Community', 'Institution', 'Company', 'Notification', 'Performance', 'Other'];
const SEVERITIES = ['', 'S0', 'S1', 'S2', 'S3'];
const ROLES = ['', 'STUDENT', 'INSTITUTION', 'COMPANY'];
const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#ca8a04', UNDER_REVIEW: '#2563eb', INVESTIGATING: '#7c3aed',
  NEED_MORE_INFO: '#f59e0b', PLANNED: '#0ea5e9', RESOLVED: '#16a34a', CLOSED: '#6b7280', REJECTED: '#dc2626',
};
const SEVERITY_COLORS: Record<string, string> = { S0: '#dc2626', S1: '#f97316', S2: '#ca8a04', S3: '#6b7280' };

export function AdminFeedbackPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [selected, setSelected] = useState<FeedbackReport | null>(null);
  const [filters, setFilters] = useState({ status: '', category: '', severity: '', role: '', search: '' });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');

  useEffect(() => { feedbackApi.getStats().then(setStats).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    feedbackApi.adminGetAll({ ...filters, page, size: 20 })
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setReports(list);
        setTotalPages(res?.pagination?.totalPages || (list.length > 0 ? 1 : 0));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, page]);

  const handleUpdate = async (id: string, data: { status?: string; severity?: string }) => {
    await feedbackApi.adminUpdate(id, data);
    setReports(reports.map(r => r.id === id ? { ...r, ...data } : r));
    if (selected?.id === id) setSelected({ ...selected, ...data } as FeedbackReport);
  };

  const loadDetail = async (report: FeedbackReport) => {
    const full = await feedbackApi.getReport(report.id);
    setSelected(full);
    setView('detail');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Feedback Management</h1>
      </div>

      {view === 'dashboard' && stats && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}><div className={styles.statValue}>{stats.total}</div><div className={styles.statLabel}>Total Reports</div></div>
          <div className={styles.statCard}><div className={styles.statValue} style={{ color: '#ca8a04' }}>{stats.submitted + stats.underReview}</div><div className={styles.statLabel}>Open</div></div>
          <div className={styles.statCard}><div className={styles.statValue} style={{ color: '#7c3aed' }}>{stats.investigating}</div><div className={styles.statLabel}>Investigating</div></div>
          <div className={styles.statCard}><div className={styles.statValue} style={{ color: '#dc2626' }}>{stats.critical}</div><div className={styles.statLabel}>Critical (S0)</div></div>
          <div className={styles.statCard}><div className={styles.statValue} style={{ color: '#16a34a' }}>{stats.resolved}</div><div className={styles.statLabel}>Resolved</div></div>
        </div>
      )}

      {view === 'dashboard' && (
        <>
          <div className={styles.filterRow}>
            <select className={styles.filterSelect} value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(0); }}>
              {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
            </select>
            <select className={styles.filterSelect} value={filters.category} onChange={e => { setFilters({ ...filters, category: e.target.value }); setPage(0); }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
            </select>
            <select className={styles.filterSelect} value={filters.severity} onChange={e => { setFilters({ ...filters, severity: e.target.value }); setPage(0); }}>
              {SEVERITIES.map(s => <option key={s} value={s}>{s || 'All Severities'}</option>)}
            </select>
            <select className={styles.filterSelect} value={filters.role} onChange={e => { setFilters({ ...filters, role: e.target.value }); setPage(0); }}>
              {ROLES.map(r => <option key={r} value={r}>{r || 'All Roles'}</option>)}
            </select>
            <input className={styles.searchInput} placeholder="Search reports..." value={filters.search} onChange={e => { setFilters({ ...filters, search: e.target.value }); setPage(0); }} />
          </div>

          {loading ? <div className={styles.empty}>Loading...</div> : (
            <div className={styles.feedbackList}>
              {reports.map(r => (
                <div className={styles.feedbackCard} key={r.id} onClick={() => loadDetail(r)} style={{ cursor: 'pointer' }}>
                  <div className={styles.feedbackHeader}>
                    <span className={styles.reportNumber}>BEYON-{r.reportNumber}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className={styles.severityBadge} style={{ background: SEVERITY_COLORS[r.systemSeverity] }}>{r.systemSeverity}</span>
                      <span className={styles.statusBadge} style={{ background: STATUS_COLORS[r.status] }}>{r.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className={styles.feedbackTitle}>{r.title}</div>
                  <div className={styles.feedbackMeta}>
                    <span className={styles.categoryBadge}>{r.category}</span>
                    <span>{r.userRole}</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {reports.length === 0 && <div className={styles.empty}>No reports match your filters.</div>}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page === 0} onClick={() => setPage(page - 1)}>← Previous</button>
              <span>Page {page + 1} of {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {view === 'detail' && selected && (
        <AdminDetailView report={selected} onBack={() => setView('dashboard')} onUpdate={handleUpdate} />
      )}
    </div>
  );
}

function AdminDetailView({ report, onBack, onUpdate }: { report: FeedbackReport; onBack: () => void; onUpdate: (id: string, data: any) => void }) {
  const [notes, setNotes] = useState<FeedbackInternalNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    feedbackApi.adminGetNotes(report.id).then(setNotes).catch(() => {});
    feedbackApi.getStatusHistory(report.id).then(setHistory).catch(() => {});
  }, [report.id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await feedbackApi.adminAddNote(report.id, newNote);
    setNotes([...notes, { id: Date.now().toString(), content: newNote, createdAt: new Date().toISOString() } as any]);
    setNewNote('');
  };

  return (
    <div className={styles.detailView}>
      <button className={styles.backBtn} onClick={onBack}>← Back to Dashboard</button>

      <div className={styles.detailHeader}>
        <div>
          <span className={styles.reportNumber}>BEYON-{report.reportNumber}</span>
          <h2 className={styles.detailTitle}>{report.title}</h2>
        </div>
        <div className={styles.detailBadges}>
          <span className={styles.severityBadge} style={{ background: SEVERITY_COLORS[report.systemSeverity] }}>{report.systemSeverity}</span>
          <span className={styles.statusBadge} style={{ background: STATUS_COLORS[report.status] }}>{report.status.replace(/_/g, ' ')}</span>
        </div>
      </div>

      <div className={styles.adminActions}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Status</label>
          <select className={styles.formSelect} value={report.status} onChange={e => onUpdate(report.id, { status: e.target.value })}>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Severity</label>
          <select className={styles.formSelect} value={report.systemSeverity} onChange={e => onUpdate(report.id, { severity: e.target.value })}>
            {SEVERITIES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.detailSection}>
        <h3 className={styles.detailSectionTitle}>Report Information</h3>
        <div className={styles.contextGrid}>
          <div><strong>User Role:</strong> {report.userRole}</div>
          <div><strong>Category:</strong> {report.category}</div>
          <div><strong>Type:</strong> {report.reportType}</div>
          <div><strong>Priority:</strong> {report.userPriority}</div>
          <div><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</div>
          <div><strong>Updated:</strong> {new Date(report.updatedAt).toLocaleString()}</div>
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
                  <span className={styles.timelineStatus}>{(h.oldStatus || 'Created')?.replace(/_/g, ' ')} → {h.newStatus.replace(/_/g, ' ')}</span>
                  {h.note && <span className={styles.timelineNote}> — {h.note}</span>}
                  <div className={styles.timelineTime}>{new Date(h.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.detailSection}>
        <h3 className={styles.detailSectionTitle}>Internal Notes (Admin Only)</h3>
        {notes.map(n => (
          <div className={styles.internalNote} key={n.id}>
            <div className={styles.noteContent}>{n.content}</div>
            <div className={styles.noteTime}>{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
        <div className={styles.commentInput}>
          <textarea placeholder="Add internal note..." value={newNote} onChange={e => setNewNote(e.target.value)} rows={2} />
          <button className={styles.createBtn} onClick={handleAddNote} disabled={!newNote.trim()}>Add Note</button>
        </div>
      </div>
    </div>
  );
}
