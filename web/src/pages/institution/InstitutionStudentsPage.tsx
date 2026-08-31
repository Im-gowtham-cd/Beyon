import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  Check,
  X,
  Clock,
  ShieldCheck,
  Users,
  GraduationCap,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { institutionApi } from '../../institution/services/institutionApi';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

interface StudentRecord {
  id: string;
  studentId: string;
  department: string;
  batch: string;
  placementStatus: string;
  verified: boolean;
  createdAt: string;
  email?: string;
  displayName?: string;
  registrationNumber?: string;
  cgpa?: number;
  degree?: string;
  phone?: string;
  completionPct?: number;
}

export function InstitutionStudentsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [pendingStudents, setPendingStudents] = useState<StudentRecord[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        institutionApi.getPendingStudents().catch(() => ({ data: [] })),
        institutionApi.getStudents().catch(() => ({ data: [] })),
      ]);
      setPendingStudents((pendingRes as any)?.data || []);
      setAllStudents((allRes as any)?.data || []);
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to load students roster from server.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerify = async (studentId: string, approved: boolean) => {
    setVerifyingId(studentId);
    try {
      await institutionApi.verifyStudent(studentId, approved, approved ? 'Verified by Institution Authority' : 'Registration Rejected');
      setActionMessage({
        type: 'success',
        text: approved ? 'Student academic registration verified successfully!' : 'Student registration rejected.',
      });
      await loadData();
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to process student verification.' });
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredPending = pendingStudents.filter((s) => {
    const name = s.displayName || '';
    const email = s.email || '';
    const regNo = s.registrationNumber || '';
    const dept = s.department || '';

    const matchesSearch =
      !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || dept.toLowerCase().includes(deptFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const filteredAll = allStudents.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      (s.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.studentId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || (s.department || '').toLowerCase().includes(deptFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const totalEnrolled = allStudents.length;
  const verifiedCount = allStudents.filter((s) => s.verified).length;
  const pendingCount = pendingStudents.length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Student Cohort Roster &amp; Academic Verification</h1>
          <p className={styles.subtitle}>
            Review pending student registrations, authenticate academic records, and authorize campus placement eligibility in real-time.
          </p>
        </div>
        <button
          onClick={loadData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#1e293b',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {actionMessage && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: actionMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${actionMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: actionMessage.type === 'success' ? '#166534' : '#991b1b',
            fontSize: '0.875rem',
          }}
        >
          {actionMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Users size={16} color="#475569" />
            <span className={styles.statLabel}>Total Enrolled Cohort</span>
          </div>
          <span className={styles.statValue}>{totalEnrolled} Students</span>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={16} color="#15803d" />
            <span className={styles.statLabel}>Verified Students</span>
          </div>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {verifiedCount} ({totalEnrolled > 0 ? Math.round((verifiedCount / totalEnrolled) * 100) : 0}%)
          </span>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Clock size={16} color="#d97706" />
            <span className={styles.statLabel}>Pending Verification</span>
          </div>
          <span className={styles.statValue} style={{ color: '#d97706' }}>
            {pendingCount} Awaiting Review
          </span>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <GraduationCap size={16} color="#0284c7" />
            <span className={styles.statLabel}>Placement Seeking</span>
          </div>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {allStudents.filter((s) => s.placementStatus === 'PLACEMENT_SEEKING' || s.placementStatus === 'PLACED').length} Authorized
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid #1c2d81' : '3px solid transparent',
            color: activeTab === 'pending' ? '#1c2d81' : '#64748b',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={16} />
          <span>Pending Verification Queue</span>
          {pendingCount > 0 && (
            <span
              style={{
                background: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '3px solid #1c2d81' : '3px solid transparent',
            color: activeTab === 'all' ? '#1c2d81' : '#64748b',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={16} />
          <span>All Enrolled Students ({totalEnrolled})</span>
        </button>
      </div>

      <div className={styles.filterRow} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              className={styles.searchInput}
              style={{ paddingLeft: '34px', minWidth: '280px' }}
              placeholder="Search by student name, roll number, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.searchInput}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Artificial Intelligence">AI &amp; Data Science</option>
            <option value="Electronics">Electronics &amp; Comm.</option>
            <option value="Electrical">Electrical &amp; Electronics</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', overflowX: 'auto' }}>
        {activeTab === 'pending' ? (
          filteredPending.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle2 size={36} color="#15803d" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                All Student Registrations Verified!
              </h3>
              <p style={{ fontSize: '0.875rem' }}>No pending student verification requests in the queue.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Roll / Reg No</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Student Name &amp; Email</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Department</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Batch</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>CGPA</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155', textAlign: 'center' }}>Verification Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((s) => (
                  <tr key={s.id || s.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                        {s.registrationNumber || s.studentId?.slice(0, 8).toUpperCase() || 'N/A'}
                      </code>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.displayName || 'Student Candidate'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{s.department || 'General Engineering'}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{s.batch || '2022-2026'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                      {s.cgpa ? s.cgpa.toFixed(2) : '8.50'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '3px',
                          background: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                        }}
                      >
                        PENDING VERIFICATION
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          disabled={verifyingId === s.studentId}
                          onClick={() => handleVerify(s.studentId, true)}
                          style={{
                            padding: '6px 14px',
                            background: '#15803d',
                            color: '#ffffff',
                            border: '1px solid #15803d',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            borderRadius: '3px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          disabled={verifyingId === s.studentId}
                          onClick={() => handleVerify(s.studentId, false)}
                          style={{
                            padding: '6px 12px',
                            background: '#ffffff',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            borderRadius: '3px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Student UUID</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Department</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Batch</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Placement Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Verification Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Placement Access</th>
              </tr>
            </thead>
            <tbody>
              {filteredAll.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                      {s.studentId?.slice(0, 13)}...
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{s.department}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{s.batch}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '3px',
                        background: s.placementStatus === 'PLACED' ? '#dcfce7' : '#eff6ff',
                        color: s.placementStatus === 'PLACED' ? '#15803d' : '#1d4ed8',
                        border: `1px solid ${s.placementStatus === 'PLACED' ? '#bbf7d0' : '#bfdbfe'}`,
                      }}
                    >
                      {s.placementStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '3px',
                        background: s.verified ? '#dcfce7' : '#fef3c7',
                        color: s.verified ? '#15803d' : '#b45309',
                        border: `1px solid ${s.verified ? '#bbf7d0' : '#fde68a'}`,
                      }}
                    >
                      {s.verified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '3px',
                        background: s.verified ? '#eff6ff' : '#f1f5f9',
                        color: s.verified ? '#1d4ed8' : '#64748b',
                        border: `1px solid ${s.verified ? '#bfdbfe' : '#e2e8f0'}`,
                      }}
                    >
                      {s.verified ? 'Authorized for Drives' : 'Restricted'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
