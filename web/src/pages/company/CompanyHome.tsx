import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Building2,
  ShieldCheck,
  Briefcase,
  Users,
  UserCheck,
  TrendingUp,
  Check,
  Calendar,
  Award,
  Rocket,
  PlusCircle,
  Search,
  GitCommit,
  ListChecks,
  ArrowRight,
  Brain,
} from 'lucide-react';
import styles from './CompanyHome.module.css';

export function CompanyHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        if (token) {
          const [profRes, oppRes, appRes] = await Promise.all([
            fetch('/api/v1/profile', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
            fetch('/api/v1/opportunities', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
            fetch('/api/v1/recruitment/applications', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          ]);
          if (profRes && profRes.ok) {
            const p = await profRes.json();
            setProfileData(p.data?.companyProfile?.profile || null);
          }
          if (oppRes && oppRes.ok) {
            const o = await oppRes.json();
            if (Array.isArray(o.data)) {
              setOpportunities(o.data);
            }
          }
          if (appRes && appRes.ok) {
            const a = await appRes.json();
            if (Array.isArray(a.data)) {
              setApplicants(a.data);
            }
          }
        }
      } catch {
        /* fallback */
      }
    }
    loadData();
  }, []);

  const companyName = profileData?.companyName || user?.name || 'Enterprise Recruiter';
  const recruiterName = user?.name?.split(' ')[0] || 'Recruiter';

  const shortlistedCount = applicants.filter(
    (a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW_SCHEDULED'
  ).length;

  const validScores = applicants.filter((a) => a.assessmentScore !== undefined && a.assessmentScore !== null);
  const avgScore =
    validScores.length > 0
      ? (validScores.reduce((sum, a) => sum + Number(a.assessmentScore), 0) / validScores.length).toFixed(1) + '%'
      : '0.0%';

  return (
    <div className={styles.page}>
      {/* Executive Welcome Hero */}
      <section className={styles.welcomeHero}>
        <div className={styles.welcomeInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.portalBadge}>
              <Building2 size={13} />
              <span>Beyon Corporate Recruitment Portal</span>
            </span>
            <span className={styles.verifiedBadge}>
              <ShieldCheck size={13} style={{ color: '#15803d' }} />
              <span>Verified Enterprise Partner</span>
            </span>
          </div>
          <h1 className={styles.welcomeTitle}>
            Welcome back, <span className={styles.highlightName}>{recruiterName}</span>
          </h1>
          <p className={styles.welcomeSub}>
            {companyName} &middot; Executive Talent Acquisition &amp; Verified Campus Hiring Hub
          </p>
        </div>

        <div className={styles.statsSummary}>
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Active Openings</span>
            <span className={`${styles.statMetricValue} ${styles.blueVal}`}>
              {opportunities.length}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Total Applicants</span>
            <span className={styles.statMetricValue}>{applicants.length}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Offer Acceptance</span>
            <span className={`${styles.statMetricValue} ${styles.greenVal}`}>
              {applicants.filter(a => a.status === 'OFFERED' || a.status === 'ACCEPTED').length > 0 ? '100%' : '0.0%'}
            </span>
          </div>
        </div>
      </section>

      {/* 4 KPI Metrics */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Job Openings</span>
            <div className={styles.kpiIcon}>
              <Briefcase size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{opportunities.length}</div>
          <span className={styles.kpiSub}>
            <TrendingUp size={14} /> {opportunities.length} active opportunities
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#0284c7' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Pipeline Candidates</span>
            <div className={styles.kpiIcon} style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <Users size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{applicants.length}</div>
          <span className={styles.kpiSub}>
            <Check size={14} /> {applicants.length} Total Applicants
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#15803d' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Shortlisted for Tech Interview</span>
            <div className={styles.kpiIcon} style={{ background: '#f0fdf4', color: '#15803d' }}>
              <UserCheck size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{shortlistedCount}</div>
          <span className={styles.kpiSub}>
            <Calendar size={14} /> {shortlistedCount} in evaluation
          </span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#d97706' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Avg Assessment Score</span>
            <div className={styles.kpiIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
              <Award size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{avgScore}</div>
          <span className={styles.kpiSub}>
            <ShieldCheck size={14} /> 100% Proctored Integrity
          </span>
        </div>
      </div>

      {/* Fast Action Banner */}
      <div className={styles.actionBanner}>
        <div className={styles.actionBannerLeft}>
          <div className={styles.actionBannerIcon}>
            <Rocket size={24} style={{ color: '#fed601' }} />
          </div>
          <div className={styles.actionBannerText}>
            <h3>Ready to scale your technical hiring?</h3>
            <p>Publish instant campus placement drives, search 100+ verified scholars, and create proctored coding assessments.</p>
          </div>
        </div>
        <div className={styles.actionBannerButtons}>
          <Link to="/company/opportunities/create" className={styles.btnGold}>
            <PlusCircle size={15} />
            <span>Post New Drive</span>
          </Link>
          <Link to="/company/candidates" className={styles.btnOutlineWhite}>
            <Search size={15} />
            <span>Discover Candidates</span>
          </Link>
          <Link to="/company/pipeline" className={styles.btnOutlineWhite}>
            <GitCommit size={15} />
            <span>View Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Applications Table + Right Sidebar */}
      <div className={styles.dashboardGrid}>
        <div className={styles.mainColumn}>
          {/* Applications Table Header */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <ListChecks size={18} style={{ color: '#1c2d81' }} /> Live Candidate Application Stream
            </h2>
            <span className={styles.sectionMeta}>{applicants.length} Total Applicants</span>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.appsTable}>
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Target Role</th>
                  <th>Institution</th>
                  <th>CGPA</th>
                  <th>Test Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.94rem', color: '#1e293b', marginBottom: '6px' }}>
                        No candidate applications received yet
                      </div>
                      <div style={{ fontSize: '0.82rem', maxWidth: '420px', margin: '0 auto 16px' }}>
                        When students apply to your opportunities and complete technical assessments, their verified profiles and benchmark scores will appear here in real-time.
                      </div>
                      <Link
                        to="/company/opportunities/create"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#1c2d81',
                          color: '#ffffff',
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <PlusCircle size={14} /> Create Opportunity Drive
                      </Link>
                    </td>
                  </tr>
                ) : (
                  applicants.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className={styles.candidateName}>{app.studentName || app.name || 'Candidate'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{app.appliedAt || 'Recent'}</div>
                      </td>
                      <td>{app.opportunityTitle || app.role || 'General Application'}</td>
                      <td>{app.institutionName || app.college || 'Engineering College'}</td>
                      <td><strong>{app.cgpa || '-'}</strong></td>
                      <td>
                        <span style={{ color: '#15803d', fontWeight: 600 }}>
                          {app.assessmentScore !== undefined ? `${app.assessmentScore}%` : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          app.status === 'SHORTLISTED' ? styles.statusShortlisted :
                          app.status === 'INTERVIEW_SCHEDULED' ? styles.statusInterview :
                          styles.statusApplied
                        }`}>
                          {app.status ? app.status.replace('_', ' ') : 'APPLIED'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.actionBtn}
                          onClick={() => navigate('/company/pipeline')}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Aside */}
        <div className={styles.sideColumn}>
          {/* Active Campus Drives Card */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <Briefcase size={18} style={{ color: '#1c2d81' }} />
              <h4>Active Campus Drives</h4>
            </div>
            {opportunities.length === 0 ? (
              <div style={{ padding: '16px 0', fontSize: '0.82rem', color: '#64748b' }}>
                No active recruitment drives created yet.
              </div>
            ) : (
              <div className={styles.drivesList}>
                {opportunities.slice(0, 4).map((opp) => (
                  <div key={opp.id} className={styles.driveItem}>
                    <div className={styles.driveItemTitle}>{opp.title}</div>
                    <div className={styles.driveItemMeta}>
                      <span>{opp.jobType || 'Full-time'}</span>
                      <span>{opp.location || 'Remote/Campus'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              to="/company/opportunities"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#1c2d81', fontWeight: 600, marginTop: '12px', textDecoration: 'none' }}
            >
              <span>Manage Opportunities</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* AI Recommended Talent Card */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <Brain size={18} style={{ color: '#1c2d81' }} />
              <h4>Candidate Intelligence</h4>
            </div>
            <div style={{ padding: '12px 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              AI skill-matching activates automatically when candidates submit code solutions and proctored benchmark tests.
            </div>
            <Link
              to="/company/candidates"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#1c2d81', fontWeight: 600, marginTop: '8px', textDecoration: 'none' }}
            >
              <span>Explore Talent Discovery</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
