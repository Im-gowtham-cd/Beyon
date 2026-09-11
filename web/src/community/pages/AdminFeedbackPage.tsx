import React, { useState, useEffect } from 'react';
import {
  Inbox, CheckCircle2, RefreshCw, AlertTriangle, Search,
  X, MessageSquare, Plus, Clock, ShieldCheck, ChevronRight
} from 'lucide-react';
import { feedbackApi } from '../services/feedbackApi';
import { api } from '../../services/api/client';
import type { FeedbackReport, FeedbackStats, FeedbackInternalNote } from '../types/feedback';
import styles from './AdminFeedbackPage.module.css';

const STATUSES = ['', 'SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING', 'NEED_MORE_INFO', 'PLANNED', 'RESOLVED', 'CLOSED', 'REJECTED'];
const CATEGORIES = ['', 'Account', 'Profile', 'Practice', 'Coins', 'Opportunity', 'Application', 'Assessment', 'Proctoring', 'Portfolio', 'Community', 'Institution', 'Company', 'Notification', 'Performance', 'Other'];
const SEVERITIES = ['', 'S0', 'S1', 'S2', 'S3'];
const ROLES = ['', 'STUDENT', 'INSTITUTION', 'COMPANY', 'PLATFORM_ADMIN'];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  SUBMITTED: { bg: '#fef3c7', text: '#b45309' },
  UNDER_REVIEW: { bg: '#eff6ff', text: '#1d4ed8' },
  INVESTIGATING: { bg: '#f3e8ff', text: '#7e22ce' },
  NEED_MORE_INFO: { bg: '#fffbeb', text: '#d97706' },
  PLANNED: { bg: '#e0f2fe', text: '#0369a1' },
  RESOLVED: { bg: '#dcfce7', text: '#15803d' },
  CLOSED: { bg: '#f1f5f9', text: '#475569' },
  REJECTED: { bg: '#fee2e2', text: '#b91c1c' },
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  S0: { bg: '#fee2e2', text: '#dc2626' },
  S1: { bg: '#ffedd5', text: '#ea580c' },
  S2: { bg: '#fef9c3', text: '#ca8a04' },
  S3: { bg: '#f1f5f9', text: '#64748b' },
};

export function AdminFeedbackPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [modReports, setModReports] = useState<any[]>([]);
  const [selected, setSelected] = useState<FeedbackReport | null>(null);
  const [activeTab, setActiveTab] = useState<'feedback' | 'moderation'>('feedback');
  const [filters, setFilters] = useState({ status: '', category: '', severity: '', role: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Ticket Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Assessment');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [submitting, setSubmitting] = useState(false);

  const fetchStats = async () => {
    try {
      const s = await feedbackApi.getStats();
      setStats(s);
    } catch {
      setStats(null);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res: any = await feedbackApi.adminGetAll({ ...filters, page: 0, size: 50 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setReports(list);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchModerationReports = async () => {
    try {
      const res: any = await api.get('/moderation/reports');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setModReports(list);
    } catch {
      setModReports([]);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchReports();
    fetchModerationReports();
  }, [filters]);

  const handleUpdateStatus = async (id: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await feedbackApi.adminUpdate(id, { status: newStatus });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
      setMsg({ type: 'success', text: `Ticket moved to "${newStatus.replace(/_/g, ' ')}"` });
      setTimeout(() => setMsg(null), 3000);
      fetchStats();
    } catch {
      setMsg({ type: 'error', text: 'Failed to update ticket status.' });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleCreateTestTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      await feedbackApi.submitReport({
        reportType: 'BUG',
        category: newCategory,
        title: newTitle.trim(),
        description: newDescription.trim() || 'Sample test ticket generated from Admin Command Center.',
        userPriority: newPriority,
        page: '/practice/assessment',
        browserInfo: 'Chrome 124.0 (Windows 11)',
        osInfo: 'Windows 11 64-bit',
        screenSize: '1920x1080',
        applicationVersion: 'v1.0.0-rc2'
      });
      setShowNewModal(false);
      setNewTitle('');
      setNewDescription('');
      setMsg({ type: 'success', text: 'New test feedback ticket created successfully!' });
      setTimeout(() => setMsg(null), 4000);
      fetchReports();
      fetchStats();
    } catch {
      setMsg({ type: 'error', text: 'Error creating test ticket.' });
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const totalReportsCount = stats?.total ?? reports.length;
  const openCount = (stats?.submitted ?? 0) + (stats?.underReview ?? 0);
  const investigatingCount = stats?.investigating ?? 0;
  const criticalCount = stats?.critical ?? 0;
  const resolvedCount = (stats?.resolved ?? 0) + (stats?.closed ?? 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.headerTitle}>Feedback &amp; Incident Command Center</h1>
          <p className={styles.headerSub}>
            Real-time user feedback, incident reports, technical bug tracking, and moderation review across all roles.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => setShowNewModal(true)} className={styles.btnPrimary}>
            <Plus size={16} />
            <span>Create Test Ticket</span>
          </button>
          <button onClick={() => { fetchReports(); fetchStats(); fetchModerationReports(); }} className={styles.btnSecondary}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {msg && (
        <div style={{
          padding: '12px 18px',
          background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: msg.type === 'success' ? '#166534' : '#991b1b',
          fontWeight: 600,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '4px'
        }}>
          <CheckCircle2 size={16} />
          <span>{msg.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} style={{ borderTopColor: '#1c2d81' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Tickets</span>
            <div className={styles.kpiIcon}>
              <Inbox size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{totalReportsCount}</div>
          <span className={styles.kpiSub}>
            Platform Reports Logged
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#ca8a04' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Open &amp; Pending</span>
            <div className={styles.kpiIcon} style={{ background: '#fef3c7', color: '#ca8a04' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#ca8a04' }}>{openCount}</div>
          <span className={styles.kpiSub}>
            Awaiting Admin Triage
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#7c3aed' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Investigating</span>
            <div className={styles.kpiIcon} style={{ background: '#f3e8ff', color: '#7c3aed' }}>
              <Search size={16} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#7c3aed' }}>{investigatingCount}</div>
          <span className={styles.kpiSub}>
            Under Active Review
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#dc2626' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Critical (S0)</span>
            <div className={styles.kpiIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#dc2626' }}>{criticalCount}</div>
          <span className={styles.kpiSub}>
            Blockers &amp; High Impact
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#16a34a' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Resolved</span>
            <div className={styles.kpiIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ color: '#16a34a' }}>{resolvedCount}</div>
          <span className={styles.kpiSub}>
            Verified Solutions
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabNav}>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`${styles.tabBtn} ${activeTab === 'feedback' ? styles.tabBtnActive : ''}`}
        >
          <MessageSquare size={16} />
          <span>User Feedback &amp; Bug Tickets</span>
          <span className={styles.tabBadge}>{reports.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`${styles.tabBtn} ${activeTab === 'moderation' ? styles.tabBtnActive : ''}`}
        >
          <ShieldCheck size={16} />
          <span>Content Moderation Flags</span>
          <span className={styles.tabBadge}>{modReports.length}</span>
        </button>
      </div>

      {activeTab === 'feedback' && (
        <>
          {/* Filters */}
          <div className={styles.toolbarCard}>
            <div className={styles.filterGrid}>
              <div className={styles.searchBox}>
                <Search size={14} style={{ color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by title, description or BEYON-#..."
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  className={styles.searchInput}
                />
              </div>

              <select
                className={styles.filterSelect}
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All Statuses'}</option>)}
              </select>

              <select
                className={styles.filterSelect}
                value={filters.category}
                onChange={e => setFilters({ ...filters, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
              </select>

              <select
                className={styles.filterSelect}
                value={filters.severity}
                onChange={e => setFilters({ ...filters, severity: e.target.value })}
              >
                {SEVERITIES.map(s => <option key={s} value={s}>{s ? `Severity ${s}` : 'All Severities'}</option>)}
              </select>

              <select
                className={styles.filterSelect}
                value={filters.role}
                onChange={e => setFilters({ ...filters, role: e.target.value })}
              >
                {ROLES.map(r => <option key={r} value={r}>{r ? r.replace(/_/g, ' ') : 'All Roles'}</option>)}
              </select>
            </div>
          </div>

          {/* Ticket List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
              <span>Loading feedback queue...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ShieldCheck size={32} />
              </div>
              <h3 className={styles.emptyTitle}>Trust &amp; Safety Queue Is Clear</h3>
              <p className={styles.emptySub}>
                No pending feedback tickets or technical bug reports match your current filters. All platform systems are operating normally.
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className={styles.btnPrimary}
                style={{ marginTop: '8px' }}
              >
                <Plus size={15} />
                <span>Create Test Feedback Ticket</span>
              </button>
            </div>
          ) : (
            <div className={styles.ticketList}>
              {reports.map(r => {
                const sColor = STATUS_COLORS[r.status] || { bg: '#f1f5f9', text: '#475569' };
                const sevColor = SEVERITY_COLORS[r.systemSeverity] || { bg: '#f1f5f9', text: '#64748b' };

                return (
                  <div
                    key={r.id}
                    className={styles.ticketCard}
                    onClick={() => setSelected(r)}
                  >
                    <div className={styles.ticketCardHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className={styles.ticketId}>BEYON-{r.reportNumber}</span>
                        <span
                          className={styles.severityBadge}
                          style={{ background: sevColor.bg, color: sevColor.text }}
                        >
                          {r.systemSeverity || 'S2'}
                        </span>
                        <span
                          className={styles.statusBadge}
                          style={{ background: sColor.bg, color: sColor.text }}
                        >
                          &bull; {r.status.replace(/_/g, ' ')}
                        </span>
                        <span className={styles.metaTag} style={{ background: '#f1f5f9', color: '#334155' }}>
                          {r.category}
                        </span>
                        <span className={styles.metaTag} style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                          {r.userRole}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {r.status !== 'RESOLVED' && (
                          <button
                            onClick={(e) => handleUpdateStatus(r.id, 'RESOLVED', e)}
                            style={{
                              background: '#f0fdf4',
                              color: '#166534',
                              border: '1px solid #bbf7d0',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Mark Resolved
                          </button>
                        )}
                        <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                      </div>
                    </div>

                    <h4 className={styles.ticketTitle}>{r.title}</h4>
                    <p className={styles.ticketDesc}>{r.description}</p>

                    <div className={styles.ticketFooter}>
                      <div className={styles.metaTags}>
                        {r.browserInfo && <span className={styles.metaTag}>{r.browserInfo}</span>}
                        {r.osInfo && <span className={styles.metaTag}>{r.osInfo}</span>}
                        {r.page && <span className={styles.metaTag}>{r.page}</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} />
                        <span>{new Date(r.createdAt).toLocaleDateString()} {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'moderation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modReports.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ShieldCheck size={32} />
              </div>
              <h3 className={styles.emptyTitle}>Zero Content Violations</h3>
              <p className={styles.emptySub}>
                All community forums, assessment questions, and profile content comply with safety standards. No user reports or moderation flags are active.
              </p>
            </div>
          ) : (
            <div className={styles.ticketList}>
              {modReports.map((mr: any) => (
                <div key={mr.id} className={styles.ticketCard}>
                  <div className={styles.ticketCardHeader}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={styles.ticketId}>MOD-{mr.id?.substring(0, 8)}</span>
                      <span className={styles.metaTag}>{mr.targetType}</span>
                      <span className={styles.statusBadge} style={{ background: '#fef3c7', color: '#b45309' }}>
                        {mr.status || 'PENDING'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {mr.createdAt ? new Date(mr.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <h4 className={styles.ticketTitle}>Violation Reason: {mr.reason}</h4>
                  <p className={styles.ticketDesc}>{mr.description || 'No additional commentary provided.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Details Drawer */}
      {selected && (
        <TicketDetailDrawer
          report={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(newStatus) => handleUpdateStatus(selected.id, newStatus)}
          onSeverityChange={async (newSev) => {
            await feedbackApi.adminUpdate(selected.id, { severity: newSev });
            setSelected(prev => prev ? { ...prev, systemSeverity: newSev } : null);
            setReports(prev => prev.map(r => r.id === selected.id ? { ...r, systemSeverity: newSev } : r));
          }}
        />
      )}

      {/* New Test Ticket Modal */}
      {showNewModal && (
        <div className={styles.drawerBackdrop} onClick={() => setShowNewModal(false)}>
          <div
            style={{
              background: '#ffffff',
              maxWidth: '540px',
              width: '100%',
              margin: 'auto',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ background: '#1c2d81', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} />
                <span style={{ fontWeight: 800 }}>Create Test Feedback Ticket</span>
              </div>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTestTicket} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  Issue Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Assessment video feed dropped during tab-switch"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px', fontSize: '0.84rem' }}
                  >
                    {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px', fontSize: '0.84rem' }}
                  >
                    <option value="CRITICAL">Critical (S0)</option>
                    <option value="HIGH">High (S1)</option>
                    <option value="NORMAL">Normal (S2)</option>
                    <option value="LOW">Low (S3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  Description / Observation
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Provide technical error reproduction details or user commentary..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim()}
                  className={styles.btnPrimary}
                >
                  {submitting ? 'Submitting...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TicketDetailDrawer({
  report,
  onClose,
  onStatusChange,
  onSeverityChange
}: {
  report: FeedbackReport;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onSeverityChange: (severity: string) => void;
}) {
  const [notes, setNotes] = useState<FeedbackInternalNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    feedbackApi.adminGetNotes(report.id).then(setNotes).catch(() => {});
    feedbackApi.getStatusHistory(report.id).then(setHistory).catch(() => {});
  }, [report.id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await feedbackApi.adminAddNote(report.id, newNote.trim());
      setNotes(prev => [...prev, {
        id: String(Date.now()),
        reportId: report.id,
        authorId: 'Current Admin',
        content: newNote.trim(),
        createdAt: new Date().toISOString()
      }]);
      setNewNote('');
    } catch {
      //
    } finally {
      setAddingNote(false);
    }
  };

  const sColor = STATUS_COLORS[report.status] || { bg: '#f1f5f9', text: '#475569' };
  const sevColor = SEVERITY_COLORS[report.systemSeverity] || { bg: '#f1f5f9', text: '#64748b' };

  return (
    <div className={styles.drawerBackdrop} onClick={onClose}>
      <div className={styles.drawerContent} onClick={e => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className={styles.ticketId}>BEYON-{report.reportNumber}</span>
              <span className={styles.severityBadge} style={{ background: sevColor.bg, color: sevColor.text }}>
                {report.systemSeverity}
              </span>
              <span className={styles.statusBadge} style={{ background: sColor.bg, color: sColor.text }}>
                {report.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              {report.title}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {/* Quick Status / Severity Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#f8fafc', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Update Status
              </label>
              <select
                value={report.status}
                onChange={e => onStatusChange(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.84rem', fontWeight: 600 }}
              >
                {STATUSES.filter(Boolean).map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                System Severity
              </label>
              <select
                value={report.systemSeverity}
                onChange={e => onSeverityChange(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.84rem', fontWeight: 600 }}
              >
                {SEVERITIES.filter(Boolean).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}>Description &amp; Reported Issue</h4>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '4px', fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5 }}>
              {report.description}
            </div>
          </div>

          {/* Technical Diagnostics */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}>Technical Client Context</h4>
            <div className={styles.contextBox}>
              <div><strong>User Role:</strong> {report.userRole}</div>
              <div><strong>Category:</strong> {report.category}</div>
              <div><strong>Browser:</strong> {report.browserInfo || 'N/A'}</div>
              <div><strong>OS:</strong> {report.osInfo || 'N/A'}</div>
              <div><strong>Screen:</strong> {report.screenSize || 'N/A'}</div>
              <div><strong>App Version:</strong> {report.applicationVersion || 'v1.0.0'}</div>
              <div><strong>Reported Page:</strong> {report.page || 'N/A'}</div>
              <div><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Status History */}
          {history.length > 0 && (
            <div className={styles.drawerSection}>
              <h4 className={styles.drawerSectionTitle}>Audit &amp; Resolution Trail</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map(h => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1c2d81' }} />
                    <span style={{ fontWeight: 700 }}>{(h.oldStatus || 'Created').replace(/_/g, ' ')} &rarr; {h.newStatus.replace(/_/g, ' ')}</span>
                    <span style={{ color: '#94a3b8' }}>&bull; {new Date(h.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Admin Notes */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}>Internal Engineering &amp; Admin Notes</h4>
            {notes.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>
                No internal notes recorded yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notes.map(n => (
                  <div key={n.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '4px', fontSize: '0.82rem' }}>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>{n.content}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="text"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add confidential internal note..."
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.84rem' }}
              />
              <button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                className={styles.btnSecondary}
                style={{ background: '#1c2d81', color: '#ffffff', borderColor: '#1c2d81' }}
              >
                Add Note
              </button>
            </form>
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <button onClick={onClose} className={styles.btnSecondary}>
            Close
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {report.status !== 'INVESTIGATING' && (
              <button
                onClick={() => onStatusChange('INVESTIGATING')}
                className={styles.btnSecondary}
              >
                Mark Investigating
              </button>
            )}
            {report.status !== 'RESOLVED' && (
              <button
                onClick={() => onStatusChange('RESOLVED')}
                className={styles.btnPrimary}
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
              >
                <CheckCircle2 size={14} />
                <span>Resolve Ticket</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

