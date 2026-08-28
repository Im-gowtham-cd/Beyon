import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
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
      } catch {
        /* fallback */
      }
    }
    loadData();
  }, []);

  const instName = profileData?.institutionName || user?.name || 'PSG College of Technology';
  const officerName = user?.name?.split(' ')[0] || 'Placement Officer';

  const mockStudents = [
    {
      id: 's-01',
      rollNo: '22CS104',
      name: 'Aravind Swaminathan',
      dept: 'Computer Science & Engg.',
      cgpa: '9.34',
      score: '94%',
      status: 'VERIFIED',
      placement: 'Shortlisted (Amazon Drive)',
    },
    {
      id: 's-02',
      rollNo: '22AI082',
      name: 'Divya Ramesh',
      dept: 'AI & Data Science',
      cgpa: '9.18',
      score: '96%',
      status: 'VERIFIED',
      placement: 'Interviewing (NVIDIA Drive)',
    },
    {
      id: 's-03',
      rollNo: '22IT045',
      name: 'Karthik Subramanian',
      dept: 'Information Technology',
      cgpa: '8.82',
      score: '88%',
      status: 'VERIFIED',
      placement: 'Applied (Microsoft Drive)',
    },
    {
      id: 's-04',
      rollNo: '22EC091',
      name: 'Pooja Narayanan',
      dept: 'Electronics & Comm.',
      cgpa: '9.05',
      score: '91%',
      status: 'PENDING',
      placement: 'Eligible for Phase 2',
    },
    {
      id: 's-05',
      rollNo: '22CS120',
      name: 'Sneha Sundaram',
      dept: 'Computer Science & Engg.',
      cgpa: '9.22',
      score: '93%',
      status: 'VERIFIED',
      placement: 'Offered (24 LPA CTC)',
    },
  ];

  const deptStats = [
    { name: 'Computer Science & Engg.', students: 240, placed: '96.2%', avgCgpa: '8.94' },
    { name: 'AI & Data Science', students: 120, placed: '94.8%', avgCgpa: '9.02' },
    { name: 'Information Technology', students: 180, placed: '92.5%', avgCgpa: '8.78' },
    { name: 'Electronics & Comm.', students: 210, placed: '89.4%', avgCgpa: '8.65' },
    { name: 'Mechanical & Robotics', students: 190, placed: '84.0%', avgCgpa: '8.40' },
  ];

  const activeDrives = [
    { company: 'Enterprise Cloud Technologies', role: 'Full Stack Engineer', pkg: '18 LPA', applicants: 42 },
    { company: 'NVIDIA GPU Acceleration Lab', role: 'CUDA Systems Engineer', pkg: '28 LPA', applicants: 28 },
    { company: 'Amazon Web Services', role: 'Cloud Platform Architect', pkg: '22 LPA', applicants: 64 },
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
              <span>NAAC A++ &middot; NIRF Top 100</span>
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
            <span className={`${styles.statMetricValue} ${styles.blueVal}`}>1,420</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Placement Ratio</span>
            <span className={`${styles.statMetricValue} ${styles.greenVal}`}>91.4%</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Active Drives</span>
            <span className={styles.statMetricValue}>18</span>
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
          <div className={styles.kpiValue}>1,420</div>
          <span className={styles.kpiSub}>
            <Check size={14} /> 100% Identity Verified
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#15803d' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Campus Placement Rate</span>
            <div className={styles.kpiIcon} style={{ background: '#f0fdf4', color: '#15803d' }}>
              <Award size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>91.4%</div>
          <span className={styles.kpiSub}>
            <TrendingUp size={14} /> +4.2% YoY Growth
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#0284c7' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Avg Proctored Score</span>
            <div className={styles.kpiIcon} style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>86.8%</div>
          <span className={styles.kpiSub}>
            <CheckCircle2 size={14} /> Anti-Cheat Integrity Verified
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#d97706' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Placement Drives</span>
            <div className={styles.kpiIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
              <Briefcase size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>18 Drives</div>
          <span className={styles.kpiSub}>
            <Calendar size={14} /> 3 slot interviews today
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
            <span>Verify Students (14 Pending)</span>
          </Link>
          <Link to="/institution/drives" className={styles.btnOutline}>
            <Briefcase size={14} />
            <span>Manage Drives</span>
          </Link>
          <Link to="/institution/analytics" className={styles.btnOutline}>
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
              <Users size={18} style={{ color: '#1c2d81' }} /> Student Cohort Verification Stream
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
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Benchmark</th>
                  <th>Verification</th>
                  <th>Placement Status</th>
                </tr>
              </thead>
              <tbody>
                {mockStudents.map((s) => (
                  <tr key={s.id}>
                    <td><code>{s.rollNo}</code></td>
                    <td>
                      <div className={styles.studentName}>{s.name}</div>
                    </td>
                    <td>{s.dept}</td>
                    <td><strong>{s.cgpa}</strong></td>
                    <td>
                      <span style={{ color: '#15803d', fontWeight: 600 }}>{s.score}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${s.status === 'VERIFIED' ? styles.statusVerified : styles.statusPending}`}>
                        {s.status === 'VERIFIED' ? <CheckCircle2 size={11} /> : null} {s.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.76rem', color: s.placement.includes('Offered') ? '#15803d' : '#1c2d81', fontWeight: 600 }}>
                        {s.placement}
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
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{d.students} Students &middot; Avg {d.avgCgpa}</div>
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
              {activeDrives.map((drv, idx) => (
                <div key={idx} style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{drv.company}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{drv.role} ({drv.pkg})</span>
                    <span style={{ color: '#1c2d81', fontWeight: 600 }}>{drv.applicants} Applicants</span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/institution/drives"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#1c2d81', fontWeight: 600, marginTop: '4px', textDecoration: 'none' }}
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
