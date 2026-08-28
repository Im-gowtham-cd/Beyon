import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import styles from './CompanyHome.module.css';

export function CompanyHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        if (token) {
          const [profRes, oppRes] = await Promise.all([
            fetch('/api/v1/profile', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
            fetch('/api/v1/opportunities', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
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
        }
      } catch {
        /* fallback */
      }
    }
    loadData();
  }, []);

  const companyName = profileData?.companyName || user?.name || 'Enterprise Recruiter';
  const recruiterName = user?.name?.split(' ')[0] || 'Recruiter';

  // Sample real-time candidate applicants for corporate demonstration
  const recentApplicants = [
    {
      id: 'c-01',
      name: 'Aravind Swaminathan',
      college: 'PSG College of Technology',
      role: 'Full Stack Engineer (Placement Drive)',
      cgpa: '9.34',
      score: '94%',
      skills: 'React, Node.js, Spring Boot, MySQL',
      status: 'SHORTLISTED',
      appliedAt: '2 hours ago',
    },
    {
      id: 'c-02',
      name: 'Divya Ramesh',
      college: 'College of Engineering, Guindy',
      role: 'AI / CUDA Kernel Optimization',
      cgpa: '9.18',
      score: '96%',
      skills: 'C++, CUDA, PyTorch, Linux',
      status: 'INTERVIEW_SCHEDULED',
      appliedAt: '5 hours ago',
    },
    {
      id: 'c-03',
      name: 'Karthik Subramanian',
      college: 'Vellore Institute of Technology',
      role: 'Cloud DevOps & Platform Engineer',
      cgpa: '8.82',
      score: '88%',
      skills: 'AWS, Docker, Kubernetes, Terraform',
      status: 'APPLIED',
      appliedAt: 'Today',
    },
    {
      id: 'c-04',
      name: 'Pooja Narayanan',
      college: 'Sri Sivasubramaniya Nadar College',
      role: 'Cybersecurity Analyst',
      cgpa: '9.05',
      score: '91%',
      skills: 'Network Security, SIEM, Python, OWASP',
      status: 'SHORTLISTED',
      appliedAt: 'Yesterday',
    },
    {
      id: 'c-05',
      name: 'Rahul Venkat',
      college: 'Amrita Vishwa Vidyapeetham',
      role: 'Data Engineer & ETL Pipelines',
      cgpa: '8.65',
      score: '84%',
      skills: 'PostgreSQL, Apache Spark, Python',
      status: 'APPLIED',
      appliedAt: 'Yesterday',
    },
  ];

  return (
    <div className={styles.page}>
      {/* Executive Welcome Hero */}
      <section className={styles.welcomeHero}>
        <div className={styles.welcomeInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.portalBadge}>
              <i className="bx bx-buildings" /> Beyon Corporate Recruitment Portal
            </span>
            <span className={styles.verifiedBadge}>
              <i className="bx bx-check-shield" /> Verified Enterprise Partner
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
              {opportunities.length || 32}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Total Applicants</span>
            <span className={styles.statMetricValue}>148</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statMetric}>
            <span className={styles.statMetricLabel}>Offer Acceptance</span>
            <span className={`${styles.statMetricValue} ${styles.greenVal}`}>92.4%</span>
          </div>
        </div>
      </section>

      {/* 4 KPI Metrics */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Job Openings</span>
            <div className={styles.kpiIcon}><i className="bx bx-briefcase" /></div>
          </div>
          <div className={styles.kpiValue}>{opportunities.length || 32}</div>
          <span className={styles.kpiSub}><i className="bx bx-trending-up" /> +4 posted this week</span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#0284c7' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Pipeline Candidates</span>
            <div className={styles.kpiIcon} style={{ background: '#f0f9ff', color: '#0284c7' }}><i className="bx bx-group" /></div>
          </div>
          <div className={styles.kpiValue}>148</div>
          <span className={styles.kpiSub}><i className="bx bx-check" /> 100% Verified Scholars</span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#15803d' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Shortlisted for Tech Interview</span>
            <div className={styles.kpiIcon} style={{ background: '#f0fdf4', color: '#15803d' }}><i className="bx bx-user-check" /></div>
          </div>
          <div className={styles.kpiValue}>36</div>
          <span className={styles.kpiSub}><i className="bx bx-calendar-event" /> 12 scheduled today</span>
        </div>

        <div className={styles.kpiCard} style={{ borderTopColor: '#d97706' }}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Avg Assessment Score</span>
            <div className={styles.kpiIcon} style={{ background: '#fef3c7', color: '#d97706' }}><i className="bx bx-shield-quarter" /></div>
          </div>
          <div className={styles.kpiValue}>84.2%</div>
          <span className={styles.kpiSub}><i className="bx bx-badge-check" /> 100% Proctored Integrity</span>
        </div>
      </div>

      {/* Fast Action Banner */}
      <div className={styles.actionBanner}>
        <div className={styles.actionBannerLeft}>
          <div className={styles.actionBannerIcon}>
            <i className="bx bx-rocket" />
          </div>
          <div className={styles.actionBannerText}>
            <h3>Ready to scale your technical hiring?</h3>
            <p>Publish instant campus placement drives, search 100+ verified scholars, and create proctored coding assessments.</p>
          </div>
        </div>
        <div className={styles.actionBannerButtons}>
          <Link to="/company/opportunities/create" className={styles.btnGold}>
            <i className="bx bx-plus-circle" />
            <span>Post New Drive</span>
          </Link>
          <Link to="/company/candidates" className={styles.btnOutlineWhite}>
            <i className="bx bx-search-alt-2" />
            <span>Discover Candidates</span>
          </Link>
          <Link to="/company/pipeline" className={styles.btnOutlineWhite}>
            <i className="bx bx-git-commit" />
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
              <i className="bx bx-list-check" /> Live Candidate Application Stream
            </h2>
            <span className={styles.sectionMeta}>{recentApplicants.length} Recent Applicants</span>
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
                {recentApplicants.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className={styles.candidateName}>{app.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{app.appliedAt}</div>
                    </td>
                    <td>{app.role}</td>
                    <td>{app.college}</td>
                    <td><strong>{app.cgpa}</strong></td>
                    <td>
                      <span style={{ color: '#15803d', fontWeight: 600 }}>{app.score}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        app.status === 'SHORTLISTED' ? styles.statusShortlisted :
                        app.status === 'INTERVIEW_SCHEDULED' ? styles.statusInterview :
                        styles.statusApplied
                      }`}>
                        {app.status.replace('_', ' ')}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Aside */}
        <div className={styles.sideColumn}>
          {/* Active Campus Drives Card */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <i className="bx bx-briefcase-alt-2" />
              <h4>Active Campus Drives</h4>
            </div>
            <div className={styles.drivesList}>
              <div className={styles.driveItem}>
                <div className={styles.driveItemTitle}>2026 Batch Software Engineering Drive</div>
                <div className={styles.driveItemMeta}>
                  <span>Target: CSE &amp; IT</span>
                  <span>42 Applicants</span>
                </div>
              </div>
              <div className={styles.driveItem}>
                <div className={styles.driveItemTitle}>GPU &amp; AI Systems Engineering Internship</div>
                <div className={styles.driveItemMeta}>
                  <span>Target: AI &amp; ECE</span>
                  <span>28 Applicants</span>
                </div>
              </div>
              <div className={styles.driveItem}>
                <div className={styles.driveItemTitle}>Cloud DevOps Graduate Trainee</div>
                <div className={styles.driveItemMeta}>
                  <span>Target: All B.E/B.Tech</span>
                  <span>19 Applicants</span>
                </div>
              </div>
            </div>
            <Link
              to="/company/opportunities"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#1c2d81', fontWeight: 600, marginTop: '12px', textDecoration: 'none' }}
            >
              <span>Manage All Drives</span>
              <i className="bx bx-right-arrow-alt" />
            </Link>
          </div>

          {/* AI Recommended Talent Card */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <i className="bx bx-brain" />
              <h4>AI Matched Scholars</h4>
            </div>
            <div className={styles.talentList}>
              <div className={styles.talentItem}>
                <div className={styles.talentInfo}>
                  <div className={styles.talentName}>Siddharth Mohan</div>
                  <div className={styles.talentSub}>CUDA &middot; PyTorch &middot; 9.42 CGPA</div>
                </div>
                <span className={styles.matchBadge}>98% Match</span>
              </div>
              <div className={styles.talentItem}>
                <div className={styles.talentInfo}>
                  <div className={styles.talentName}>Ananya Krishnan</div>
                  <div className={styles.talentSub}>Spring Boot &middot; AWS &middot; 9.25 CGPA</div>
                </div>
                <span className={styles.matchBadge}>95% Match</span>
              </div>
              <div className={styles.talentItem}>
                <div className={styles.talentInfo}>
                  <div className={styles.talentName}>Manoj Varman</div>
                  <div className={styles.talentSub}>Kubernetes &middot; Go &middot; 9.10 CGPA</div>
                </div>
                <span className={styles.matchBadge}>92% Match</span>
              </div>
            </div>
            <Link
              to="/company/candidates"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#1c2d81', fontWeight: 600, marginTop: '12px', textDecoration: 'none' }}
            >
              <span>Search All 100+ Candidates</span>
              <i className="bx bx-right-arrow-alt" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
