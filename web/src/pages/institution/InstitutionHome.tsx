import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { institutionApi } from '../../institution/services/institutionApi';
import {
  GraduationCap,
  ShieldCheck,
  Users,
  Award,
  Briefcase,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';
import styles from './InstitutionHome.module.css';

export function InstitutionHome() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        if (token) {
          const res = await fetch('/api/v1/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null);
          if (res && res.ok) {
            const p = await res.json();
            setProfileData(p.data?.institutionProfile?.profile || null);
          }
        }

        const [metricsRes, studentsRes, pendingRes, drivesRes] = await Promise.all([
          institutionApi.getMetrics().catch(() => null),
          institutionApi.getStudents().catch(() => []),
          institutionApi.getPendingStudents().catch(() => []),
          institutionApi.getDrives().catch(() => []),
        ]);

        setMetrics(metricsRes && (metricsRes as any).data !== undefined ? (metricsRes as any).data : metricsRes);
        setStudents(Array.isArray(studentsRes) ? studentsRes : (studentsRes as any)?.data || []);
        setPendingStudents(Array.isArray(pendingRes) ? pendingRes : (pendingRes as any)?.data || []);
        setDrives(Array.isArray(drivesRes) ? drivesRes : (drivesRes as any)?.data || []);
      } catch {
        /* fallback */
      }
    }
    loadData();
  }, []);

  const instName = profileData?.institutionName || user?.name || 'PSG College of Technology';
  const officerName = user?.name?.split(' ')[0] || 'Placement Officer';

  const totalStudents = metrics?.totalStudents || students.length || 120;
  const placementRate = metrics?.placementPercentage ? Number(metrics.placementPercentage).toFixed(1) : '92.4';
  const studentsPlaced = metrics?.studentsPlaced || 60;
  const activeDrivesCount = drives.length || 6;
  const pendingCount = pendingStudents.length;

  const deptStats = [
    { name: 'Computer Science and Engineering', count: 45, placed: '96.2%', avgCgpa: '9.12' },
    { name: 'Information Technology', count: 32, placed: '94.5%', avgCgpa: '8.85' },
    { name: 'Artificial Intelligence & Data Science', count: 28, placed: '95.0%', avgCgpa: '9.05' },
    { name: 'Electronics and Communication', count: 25, placed: '89.4%', avgCgpa: '8.65' },
  ];

  return (
    <div className={styles.page}>
      {/* Welcome Hero */}
      <section className={styles.welcomeHero}>
        <div className={styles.welcomeInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.portalBadge}>
              <GraduationCap size={13} />
              <span>Higher-Ed Institutional Command</span>
            </span>
            <span className={styles.verifiedBadge}>
              <ShieldCheck size={13} />
              <span>NAAC A++ &middot; NIRF Verified Partner</span>
            </span>
          </div>
          <h1 className={styles.welcomeTitle}>
            Welcome back, <span className={styles.highlightName}>{officerName}</span>
          </h1>
          <p className={styles.welcomeSub}>
            {instName} &middot; Verified Academic Talent Architecture &amp; Placement Command Center
          </p>
        </div>

        <div className={styles.statsSummary}>
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Enrolled Scholars</span>
            <span className={`${styles.statMetricValue} ${styles.blueVal}`}>{totalStudents}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Placement Ratio</span>
            <span className={`${styles.statMetricValue} ${styles.greenVal}`}>{placementRate}%</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Active Drives</span>
            <span className={styles.statMetricValue}>{activeDrivesCount}</span>
          </div>
        </div>
      </section>

      {/* 4 KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Enrolled Students</span>
            <div className={styles.kpiIcon}>
              <Users size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{totalStudents}</div>
          <span className={styles.kpiSub}>
            <Check size={14} /> Cohort Registered
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#15803d' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Campus Placement Rate</span>
            <div className={styles.kpiIcon} style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Award size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{placementRate}%</div>
          <span className={styles.kpiSub}>
            <TrendingUp size={14} /> {studentsPlaced} Offers Secured
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#0284c7' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Avg Dream Package</span>
            <div className={styles.kpiIcon} style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{metrics?.averagePackage ? `₹${Number(metrics.averagePackage).toFixed(1)} LPA` : '₹14.2 LPA'}</div>
          <span className={styles.kpiSub}>
            <CheckCircle2 size={14} /> Highest: ₹48.0 LPA
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#d97706' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending Review Queue</span>
            <div className={styles.kpiIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
              <Briefcase size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{pendingCount} Students</div>
          <span className={styles.kpiSub}>
            <Calendar size={14} /> Awaiting ID verification
          </span>
        </div>
      </div>

      {/* Fast Action Banner */}
      <div className={styles.actionBanner}>
        <div className={styles.actionBannerLeft}>
          <div className={styles.actionBannerIcon}>
            <Sparkles size={22} style={{ color: '#fed601' }} />
          </div>
          <div className={styles.actionBannerText}>
            <h3>Academic Semester &amp; Placement Operations</h3>
            <p>Verify candidate academic CGPA, approve incoming corporate campus drives, and generate NAAC accreditation scorecards.</p>
          </div>
        </div>
        <div className={styles.actionBannerButtons}>
          <Link to="/institution/students" className={styles.btnBlue}>
            <FileCheck size={14} />
            <span>Verify Students ({pendingCount} Pending)</span>
          </Link>
          <Link to="/institution/drives" className={styles.btnOutline}>
            <Briefcase size={14} />
            <span>Manage Drives ({activeDrivesCount})</span>
          </Link>
          <Link to="/institution/placements" className={styles.btnOutline}>
            <TrendingUp size={14} />
            <span>NIRF Reports</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Student Roster + Right Sidebar */}
      <div className={styles.dashboardGrid}>
        <div className={styles.mainColumn}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Users size={18} style={{ color: '#1c2d81' }} />
              <span>Student Cohort Verification Stream</span>
            </h2>
            <Link
              to="/institution/students"
              style={{ fontSize: '0.8rem', color: '#1c2d81', fontWeight: 600, textDecoration: 'none' }}
            >
              View Full Cohort Roster &rarr;
            </Link>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.instTable}>
              <thead>
                <tr>
                  <th>Student Ref</th>
                  <th>Department</th>
                  <th>Batch</th>
                  <th>Placement Status</th>
                  <th>Verification</th>
                  <th>Placement Access</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 8).map((s) => (
                  <tr key={s.id}>
                    <td><code>{s.studentId?.slice(0, 8).toUpperCase()}</code></td>
                    <td>
                      <div className={styles.studentName}>{s.department || 'Computer Science and Engineering'}</div>
                    </td>
                    <td style={{ fontWeight: 400 }}>{s.batch || '2022-2026'}</td>
                    <td>
                      <span style={{ fontSize: '0.76rem', color: s.placementStatus === 'PLACED' ? '#15803d' : '#1c2d81', fontWeight: 600 }}>
                        {s.placementStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${s.verified ? styles.statusVerified : styles.statusPending}`}>
                        {s.verified ? <CheckCircle2 size={11} /> : null} {s.verified ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.76rem', color: s.verified ? '#15803d' : '#d97706', fontWeight: 600 }}>
                        {s.verified ? 'Authorized' : 'Pending Verification'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Aside */}
        <div className={styles.sideColumn}>
          {/* Department Placement Summary */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <Layers size={16} style={{ color: '#1c2d81' }} />
              <span>Department Placement Rates</span>
            </div>
            <div className={styles.deptList}>
              {deptStats.map((d, idx) => (
                <div key={idx} className={styles.deptItem}>
                  <div>
                    <div className={styles.deptName}>{d.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>
                      {d.count} Candidates &middot; Avg {d.avgCgpa} CGPA
                    </div>
                  </div>
                  <span className={styles.deptMeta}>{d.placed}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Campus Drives Card */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <Briefcase size={16} style={{ color: '#1c2d81' }} />
              <span>Visiting Corporate Drives</span>
            </div>
            <div className={styles.driveList}>
              {drives.slice(0, 4).map((drv, idx) => (
                <div
                  key={drv.id || idx}
                  style={{
                    padding: '10px 12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{drv.title || 'Campus Placement Drive'}</div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 400,
                    }}
                  >
                    <span>Status: {drv.status}</span>
                    <span style={{ color: '#1c2d81', fontWeight: 600 }}>{drv.appliedCount || drv.eligibleStudentCount || 25} Candidates</span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/institution/drives"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                color: '#1c2d81',
                fontWeight: 600,
                marginTop: '4px',
                textDecoration: 'none',
              }}
            >
              <span>Manage Campus Slots</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
