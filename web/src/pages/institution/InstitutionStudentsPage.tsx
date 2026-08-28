import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Check,
} from 'lucide-react';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

interface EnrolledStudent {
  id: string;
  rollNo: string;
  name: string;
  dept: string;
  batch: string;
  cgpa: number;
  benchmarkScore: number;
  status: 'VERIFIED' | 'PENDING' | 'ACTION_REQUIRED';
  placementReady: boolean;
}

export function InstitutionStudentsPage() {
  const [students, setStudents] = useState<EnrolledStudent[]>([
    {
      id: 'st-01',
      rollNo: '22CS104',
      name: 'Aravind Swaminathan',
      dept: 'Computer Science & Engg.',
      batch: '2026',
      cgpa: 9.34,
      benchmarkScore: 94,
      status: 'VERIFIED',
      placementReady: true,
    },
    {
      id: 'st-02',
      rollNo: '22AI082',
      name: 'Divya Ramesh',
      dept: 'AI & Data Science',
      batch: '2026',
      cgpa: 9.18,
      benchmarkScore: 96,
      status: 'VERIFIED',
      placementReady: true,
    },
    {
      id: 'st-03',
      rollNo: '22IT045',
      name: 'Karthik Subramanian',
      dept: 'Information Technology',
      batch: '2026',
      cgpa: 8.82,
      benchmarkScore: 88,
      status: 'VERIFIED',
      placementReady: true,
    },
    {
      id: 'st-04',
      rollNo: '22EC091',
      name: 'Pooja Narayanan',
      dept: 'Electronics & Comm.',
      batch: '2026',
      cgpa: 9.05,
      benchmarkScore: 91,
      status: 'PENDING',
      placementReady: true,
    },
    {
      id: 'st-05',
      rollNo: '22CS120',
      name: 'Sneha Sundaram',
      dept: 'Computer Science & Engg.',
      batch: '2026',
      cgpa: 9.22,
      benchmarkScore: 93,
      status: 'VERIFIED',
      placementReady: true,
    },
    {
      id: 'st-06',
      rollNo: '22ME054',
      name: 'Rahul Venkat',
      dept: 'Mechanical & Robotics',
      batch: '2026',
      cgpa: 8.65,
      benchmarkScore: 84,
      status: 'PENDING',
      placementReady: false,
    },
  ]);

  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const verifyStudent = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'VERIFIED' } : s));
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || s.dept === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const verifiedCount = students.filter(s => s.status === 'VERIFIED').length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Student Cohort Roster &amp; Academic Verification</h1>
          <p className={styles.subtitle}>
            Authenticate student academic records, verify CGPA transcripts, and authorize campus placement eligibility
          </p>
        </div>
      </div>

      {/* 4 Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Enrolled Cohort</span>
          <span className={styles.statValue}>1,420 Students</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Verified Transcripts</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {verifiedCount} Verified ({Math.round((verifiedCount / students.length) * 100)}%)
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Academic Review</span>
          <span className={styles.statValue} style={{ color: '#d97706' }}>
            {students.filter(s => s.status === 'PENDING').length} Students
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Placement Ready</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {students.filter(s => s.placementReady).length} Eligible
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className={styles.searchInput}
              style={{ paddingLeft: '34px', minWidth: '240px' }}
              placeholder="Search by student name, roll number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.searchInput}
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science & Engg.">Computer Science</option>
            <option value="AI & Data Science">AI &amp; Data Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Comm.">ECE</option>
            <option value="Mechanical & Robotics">Mechanical</option>
          </select>

          <select
            className={styles.searchInput}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="PENDING">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Roll No</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Student Name</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Department</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>CGPA</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Benchmark Score</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Verification Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Placement Access</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px' }}><code>{s.rollNo}</code></td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{s.name}</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>{s.dept}</td>
                <td style={{ padding: '12px 16px', fontWeight: 800 }}>{s.cgpa}</td>
                <td style={{ padding: '12px 16px', color: '#15803d', fontWeight: 600 }}>{s.benchmarkScore}%</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '0px',
                    background: s.status === 'VERIFIED' ? '#dcfce7' : '#fef3c7',
                    color: s.status === 'VERIFIED' ? '#15803d' : '#b45309',
                  }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '0px',
                    background: s.placementReady ? '#eff6ff' : '#f1f5f9',
                    color: s.placementReady ? '#1d4ed8' : '#64748b',
                  }}>
                    {s.placementReady ? 'Authorized' : 'Hold'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {s.status === 'PENDING' ? (
                    <button
                      style={{
                        padding: '5px 10px',
                        background: '#1c2d81',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={() => verifyStudent(s.id)}
                    >
                      <Check size={13} /> Verify
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={14} /> Approved
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
