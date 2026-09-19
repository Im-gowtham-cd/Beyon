import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  Users,
  ShieldCheck,
  Clock,
  GraduationCap,
  Search,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { institutionApi } from '../../institution/services/institutionApi';
import { StudentMonitoringModal } from './components/StudentMonitoringModal';
import styles from './InstitutionMonitoringPage.module.css';

export function InstitutionMonitoringPage() {
  const { studentId: routeStudentId } = useParams<{ studentId?: string }>();
  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(routeStudentId || null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await institutionApi.getStudents();
      const list = Array.isArray(res) ? res : res?.data || [];
      setStudents(list);
    } catch {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (routeStudentId) {
      setSelectedStudentId(routeStudentId);
    }
  }, [routeStudentId]);

  const handleOpenStudent = (id: string) => {
    setSelectedStudentId(id);
  };

  const handleCloseModal = () => {
    setSelectedStudentId(null);
    if (routeStudentId) {
      navigate('/institution/monitoring');
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const name = (s.displayName || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const roll = (s.registrationNumber || s.rollNumber || s.studentId || '').toLowerCase();
    const dept = (s.department || '').toLowerCase();

    const matchesSearch = !q || name.includes(q) || email.includes(q) || roll.includes(q) || dept.includes(q);

    let matchesDept = true;
    if (deptFilter !== 'ALL') {
      const f = deptFilter.toLowerCase();
      matchesDept = dept.includes(f) || (f.includes('computer') && (dept.includes('cse') || dept.includes('computer')));
    }

    let matchesStatus = true;
    if (statusFilter === 'VERIFIED') {
      matchesStatus = s.verified === true;
    } else if (statusFilter === 'PENDING') {
      matchesStatus = s.verified !== true;
    } else if (statusFilter === 'PLACEMENT_SEEKING') {
      matchesStatus = s.placementStatus === 'PLACEMENT_SEEKING';
    } else if (statusFilter === 'PLACED') {
      matchesStatus = s.placementStatus === 'PLACED';
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalCohort = students.length;
  const verifiedCount = students.filter((s) => s.verified).length;
  const pendingCount = students.filter((s) => !s.verified).length;
  const placedCount = students.filter((s) => s.placementStatus === 'PLACED').length;
  const activeSeekingCount = students.filter((s) => s.placementStatus === 'PLACEMENT_SEEKING').length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>
            <Activity size={26} color="#1c2d81" />
            <span>Cohort Live Monitoring Hub</span>
          </h1>
          <p className={styles.subtitle}>
            Continuous real-time surveillance of student academic progression, skill proficiencies, proctoring integrity, and placement readiness across all departments. Click any student to launch their live dossier dashboard.
          </p>
        </div>
        <button
          onClick={loadStudents}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#1e293b',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* Cohort Telemetry Stat Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Users size={16} color="#475569" />
            <span className={styles.statLabel}>Total Monitored Cohort</span>
          </div>
          <span className={styles.statValue}>{totalCohort} Students</span>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={16} color="#15803d" />
            <span className={styles.statLabel}>Authenticated &amp; Verified</span>
          </div>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {verifiedCount} ({totalCohort > 0 ? Math.round((verifiedCount / totalCohort) * 100) : 0}%)
          </span>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Clock size={16} color="#d97706" />
            <span className={styles.statLabel}>Needs Verification</span>
          </div>
          <span className={styles.statValue} style={{ color: '#d97706' }}>
            {pendingCount} Candidates
          </span>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <GraduationCap size={16} color="#0284c7" />
            <span className={styles.statLabel}>Placement Ready / Placed</span>
          </div>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {activeSeekingCount + placedCount} Active
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={styles.filterRow}>
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
              style={{ paddingLeft: '34px', minWidth: '300px' }}
              placeholder="Search candidate name, roll number, department..."
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
            <option value="Computer Science">Computer Science &amp; Engg</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Artificial Intelligence">AI &amp; Data Science</option>
            <option value="Electronics">Electronics &amp; Comm.</option>
            <option value="Electrical">Electrical &amp; Electronics</option>
          </select>

          <select
            className={styles.searchInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="PENDING">Pending Verification</option>
            <option value="PLACEMENT_SEEKING">Placement Seeking</option>
            <option value="PLACED">Placed</option>
          </select>
        </div>
      </div>

      {/* Student Cohort Monitoring Table */}
      <div className={styles.tableContainer}>
        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
            <Users size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              No Monitored Students Match Filters
            </h3>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Try clearing search keywords or department filters.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Roll / Reg No</th>
                <th className={styles.th}>Student Candidate</th>
                <th className={styles.th}>Department &amp; Batch</th>
                <th className={styles.th}>Academic CGPA</th>
                <th className={styles.th}>Verification Status</th>
                <th className={styles.th}>Placement Authorization</th>
                <th className={styles.th} style={{ textAlign: 'center' }}>Live Monitoring</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const sId = s.studentId || s.id;
                return (
                  <tr
                    key={sId}
                    className={styles.tr}
                    onClick={() => handleOpenStudent(sId)}
                    title="Click to inspect student profile monitoring dashboard"
                  >
                    <td className={styles.td}>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', fontWeight: 600, color: '#0f172a' }}>
                        {s.registrationNumber || s.rollNumber || (sId ? sId.slice(0, 8).toUpperCase() : 'N/A')}
                      </code>
                    </td>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {s.displayName || 'Student Candidate'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.email}</div>
                    </td>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 600, color: '#1c2d81' }}>{s.department || 'CSE'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Batch of {s.batch || '2026'}</div>
                    </td>
                    <td className={styles.td}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>
                        {s.cgpa ? Number(s.cgpa).toFixed(2) : '8.50'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={s.verified ? styles.badgeSuccess : styles.badgeWarning}>
                        {s.verified ? <ShieldCheck size={12} /> : <Clock size={12} />}
                        <span>{s.verified ? 'VERIFIED' : 'PENDING'}</span>
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={s.placementStatus === 'PLACED' ? styles.badgeSuccess : styles.badgePrimary}>
                        {s.placementStatus || 'PLACEMENT_SEEKING'}
                      </span>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'center' }}>
                      <button
                        className={styles.btnAction}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudent(sId);
                        }}
                      >
                        <Eye size={13} />
                        <span>Monitor Profile</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Profile Dashboard */}
      {selectedStudentId && (
        <StudentMonitoringModal
          studentId={selectedStudentId}
          onClose={handleCloseModal}
          onStatusUpdated={loadStudents}
        />
      )}
    </div>
  );
}
