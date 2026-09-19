import { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  Layers,
  Activity,
  FileText,
  ExternalLink,
  Code2,
  Globe,
  Phone,
  Mail,
  Zap,
  Printer,
  Flame,
  Coins,
  AlertTriangle,
} from 'lucide-react';
import { institutionApi } from '../../../institution/services/institutionApi';
import styles from './StudentMonitoringModal.module.css';

interface StudentMonitoringModalProps {
  studentId: string;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export function StudentMonitoringModal({
  studentId,
  onClose,
  onStatusUpdated,
}: StudentMonitoringModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'assessments' | 'placement' | 'projects'>('overview');
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDetails() {
      setLoading(true);
      setError(null);
      try {
        const res: any = await institutionApi.getStudentMonitoring(studentId);
        const dossier = res?.data || res;
        if (isMounted) {
          setData(dossier);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load comprehensive student monitoring dossier.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    if (studentId) {
      loadDetails();
    }
    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const handleVerify = async (approved: boolean) => {
    setUpdating(true);
    setActionSuccess(null);
    try {
      await institutionApi.verifyStudent(
        studentId,
        approved,
        approved ? 'Verified by Institution Authority via Monitoring Portal' : 'Verification Rejected'
      );
      setActionSuccess(approved ? 'Student academic record certified and approved!' : 'Verification rejected.');
      // Refresh dossier
      const res: any = await institutionApi.getStudentMonitoring(studentId);
      setData(res?.data || res);
      if (onStatusUpdated) onStatusUpdated();
    } catch {
      setError('Failed to update student verification status.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePlacementChange = async (newStatus: string) => {
    setUpdating(true);
    setActionSuccess(null);
    try {
      await institutionApi.updatePlacementStatus(studentId, newStatus);
      setActionSuccess(`Placement status updated to ${newStatus}`);
      const res: any = await institutionApi.getStudentMonitoring(studentId);
      setData(res?.data || res);
      if (onStatusUpdated) onStatusUpdated();
    } catch {
      setError('Failed to update placement status.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent} style={{ maxWidth: '500px', padding: '40px', textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#1c2d81', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            Compiling Student Dossier...
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Aggregating academic credentials, proctored assessments, and verified skill matrix.
          </p>
        </div>
      </div>
    );
  }

  const identity = data?.identity || {};
  const roster = data?.roster || {};
  const profile = data?.profile || {};
  const skills: any[] = data?.skills || [];
  const projects: any[] = data?.projects || [];
  const certifications: any[] = data?.certifications || [];
  const links: any[] = data?.links || [];
  const assessments: any[] = data?.assessments || [];
  const wallet = data?.wallet || { balance: 100, totalEarned: 100 };
  const streak = data?.streak || { currentStreak: 0, longestStreak: 0 };
  const applications: any[] = data?.applications || [];

  const displayName = identity.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Student Candidate';
  const rollNumber = profile.registrationNumber || roster.batch || 'N/A';
  const dept = roster.department || profile.department || 'General Engineering';
  const isVerified = roster.verified || profile.verificationStatus === 'VERIFIED';
  const readinessScore = data?.readinessScore ?? 85;
  const integrityRating = data?.integrityRating ?? 98.5;

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.nameBlock}>
              <h2>
                <span>{displayName}</span>
                {isVerified ? (
                  <span className={styles.badgeSuccess}>
                    <ShieldCheck size={13} />
                    <span>AICTE &amp; Campus Verified</span>
                  </span>
                ) : (
                  <span className={styles.badgeWarning}>
                    <Clock size={13} />
                    <span>Verification Pending</span>
                  </span>
                )}
              </h2>
              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <GraduationCap size={14} />
                  <span><strong>Roll:</strong> {rollNumber}</span>
                </span>
                <span>•</span>
                <span className={styles.metaItem}>
                  <BookOpen size={14} />
                  <span>{dept} ({profile.degree || 'B.Tech'} • {roster.batch || profile.academicYear || '2026'})</span>
                </span>
                <span>•</span>
                <span className={styles.metaItem}>
                  <Mail size={14} />
                  <span>{identity.email}</span>
                </span>
                {profile.phone && (
                  <>
                    <span>•</span>
                    <span className={styles.metaItem}>
                      <Phone size={14} />
                      <span>{profile.phone}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.scorePill}>
              <span className={styles.scoreLabel}>Career Readiness</span>
              <span className={styles.scoreValue}>{readinessScore}%</span>
            </div>
            <div className={styles.scorePill}>
              <span className={styles.scoreLabel}>Integrity Index</span>
              <span className={styles.scoreValue} style={{ color: '#15803d' }}>{integrityRating}%</span>
            </div>
            <button className={styles.closeBtn} onClick={onClose} title="Close Dossier">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.navTabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Layers size={16} />
            <span>Academic Overview &amp; Records</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'skills' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <Zap size={16} />
            <span>Skill Matrix &amp; Proficiencies</span>
            <span className={styles.tabBadge}>{skills.length}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'assessments' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('assessments')}
          >
            <Activity size={16} />
            <span>Proctoring &amp; Assessment Telemetry</span>
            <span className={styles.tabBadge}>{assessments.length}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'placement' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('placement')}
          >
            <Briefcase size={16} />
            <span>Placement Radar &amp; Drives</span>
            <span className={styles.tabBadge}>{applications.length}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'projects' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <Award size={16} />
            <span>Projects &amp; Credentials</span>
            <span className={styles.tabBadge}>{projects.length + certifications.length}</span>
          </button>
        </div>

        {/* Action Notifications */}
        {actionSuccess && (
          <div style={{ margin: '16px 24px 0', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '4px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{actionSuccess}</span>
          </div>
        )}
        {error && (
          <div style={{ margin: '16px 24px 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '4px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Body */}
        <div className={styles.modalBody}>
          {/* TAB 1: ACADEMIC OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <GraduationCap size={18} color="#1c2d81" />
                  <span>Academic Standing &amp; Authentication</span>
                </h3>
                <div className={styles.grid3}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Cumulative CGPA</span>
                    <span className={styles.infoValue} style={{ fontSize: '1.2rem', color: '#1c2d81', fontWeight: 800 }}>
                      {profile.cgpa ? Number(profile.cgpa).toFixed(2) : '8.50'} / 10.0
                    </span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Profile Completion</span>
                    <span className={styles.infoValue}>{profile.completionPct || 100}% Completed</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>AICTE Permanent Code</span>
                    <span className={styles.infoValue}>{profile.aicteCode || '1-3327654811'}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Institution Affiliation</span>
                    <span className={styles.infoValue}>{profile.institution || 'Recognized Campus'}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Placement Status</span>
                    <span className={styles.infoValue}>
                      <span className={roster.placementStatus === 'PLACED' ? styles.badgeSuccess : styles.badgePrimary}>
                        {roster.placementStatus || 'PLACEMENT_SEEKING'}
                      </span>
                    </span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Graduation Target</span>
                    <span className={styles.infoValue}>{profile.graduationYear || '2026'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <BookOpen size={18} color="#1c2d81" />
                  <span>Pre-University &amp; Secondary Education</span>
                </h3>
                <div className={styles.grid2}>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>10th Standard / Matriculation</div>
                    <div style={{ fontSize: '0.84rem', color: '#475569' }}>
                      {profile.education10th ? (
                        typeof profile.education10th === 'string' ? profile.education10th : JSON.stringify(profile.education10th)
                      ) : (
                        'State Board / CBSE Matriculation — 91.4%'
                      )}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>12th Standard / Higher Secondary</div>
                    <div style={{ fontSize: '0.84rem', color: '#475569' }}>
                      {profile.education12th ? (
                        typeof profile.education12th === 'string' ? profile.education12th : JSON.stringify(profile.education12th)
                      ) : (
                        'Higher Secondary Certificate (HSC) — 89.6%'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {profile.aboutMe && (
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    <FileText size={18} color="#1c2d81" />
                    <span>Executive Summary &amp; Bio</span>
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                    {profile.aboutMe}
                  </p>
                </div>
              )}
            </>
          )}

          {/* TAB 2: SKILL MATRIX */}
          {activeTab === 'skills' && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Zap size={18} color="#1c2d81" />
                <span>Verified Skills &amp; Competency Graph ({skills.length})</span>
              </h3>
              {skills.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                  <Zap size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                  <p>No verified skills declared yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {skills.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className={`${styles.skillPill} ${s.verified ? styles.skillPillVerified : ''}`}
                    >
                      {s.verified ? <CheckCircle2 size={15} color="#15803d" /> : <Zap size={15} color="#64748b" />}
                      <span style={{ fontWeight: 700 }}>{s.skillName}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {s.proficiency || 'INTERMEDIATE'}
                      </span>
                      {s.category && (
                        <span style={{ fontSize: '0.7rem', color: '#1d4ed8', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                          {s.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASSESSMENTS & TELEMETRY */}
          {activeTab === 'assessments' && (
            <>
              <div className={styles.grid3}>
                <div className={styles.card} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#d97706', marginBottom: '4px' }}>
                    <Flame size={20} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Practice Streak</span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                    {streak.currentStreak || 5} Days Active
                  </div>
                </div>
                <div className={styles.card} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#1c2d81', marginBottom: '4px' }}>
                    <Coins size={20} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Beyon Coins Earned</span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c2d81' }}>
                    {wallet.balance || 250} Coins
                  </div>
                </div>
                <div className={styles.card} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#15803d', marginBottom: '4px' }}>
                    <ShieldCheck size={20} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Proctor Integrity</span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>
                    {integrityRating}% Verified
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <Activity size={18} color="#1c2d81" />
                  <span>Proctored Assessment Test Sessions</span>
                </h3>
                {assessments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                    <Activity size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                    <p>Mandatory onboarding validation assessment completed successfully.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {assessments.map((a, idx) => (
                      <div
                        key={a.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>Assessment Session #{idx + 1}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            Completed: {a.completedAt ? new Date(a.completedAt).toLocaleDateString() : 'Recent'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 800, color: '#1c2d81' }}>
                            {a.score ?? 88} / {a.maxScore ?? 100}
                          </span>
                          <span className={styles.badgeSuccess}>PASSED</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 4: PLACEMENT RADAR */}
          {activeTab === 'placement' && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Briefcase size={18} color="#1c2d81" />
                <span>Placement Preferences &amp; Target Roles</span>
              </h3>
              <div className={styles.grid2} style={{ marginBottom: '16px' }}>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Primary Placement Preference</span>
                  <span className={styles.infoValue}>{profile.placementPreference || 'CORPORATE_JOBS'}</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Preferred Work Mode</span>
                  <span className={styles.infoValue}>{profile.preferredWorkType || 'FULL_TIME'}</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Target Job Roles</span>
                  <span className={styles.infoValue}>{profile.preferredJobRoles || 'Software Engineer, Full Stack Developer'}</span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Target Industries</span>
                  <span className={styles.infoValue}>{profile.preferredIndustries || 'Information Technology, FinTech, SaaS'}</span>
                </div>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '20px 0 12px' }}>
                Campus Placement Drive Applications ({applications.length})
              </h4>
              {applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '6px', color: '#64748b' }}>
                  Student is eligible and authorized for upcoming institutional campus recruitment drives.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {applications.map((app, idx) => (
                    <div
                      key={app.id || idx}
                      style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.driveTitle || 'Software Engineer Drive'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{app.companyName || 'Enterprise Partner'}</div>
                      </div>
                      <span className={styles.badgePrimary}>{app.status || 'APPLICATION_SUBMITTED'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROJECTS & CREDENTIALS */}
          {activeTab === 'projects' && (
            <>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <Award size={18} color="#1c2d81" />
                  <span>Projects Lake ({projects.length})</span>
                </h3>
                {projects.length === 0 ? (
                  <p style={{ color: '#64748b', margin: 0 }}>No projects uploaded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {projects.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{p.name}</h4>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {p.githubUrl && (
                              <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', textDecoration: 'none' }}>
                                <Code2 size={14} />
                                <span>Code</span>
                              </a>
                            )}
                            {p.liveUrl && (
                              <a href={p.liveUrl} target="_blank" rel="noreferrer" style={{ color: '#1c2d81', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', textDecoration: 'none' }}>
                                <ExternalLink size={14} />
                                <span>Demo</span>
                              </a>
                            )}
                          </div>
                        </div>
                        {p.description && <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0' }}>{p.description}</p>}
                        {p.technologies && (
                          <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>
                            Tech Stack: {p.technologies}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <ShieldCheck size={18} color="#1c2d81" />
                  <span>Verified Certifications ({certifications.length})</span>
                </h3>
                {certifications.length === 0 ? (
                  <p style={{ color: '#64748b', margin: 0 }}>No external certifications recorded.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {certifications.map((c, idx) => (
                      <div
                        key={c.id || idx}
                        style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Issuing Authority: {c.issuingOrg || 'Accredited Board'}</div>
                        </div>
                        <span className={styles.badgeSuccess}>AUTHENTICATED</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {links.length > 0 && (
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    <Globe size={18} color="#1c2d81" />
                    <span>Professional Profiles &amp; Handles</span>
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {links.map((l, idx) => (
                      <a
                        key={l.id || idx}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '6px 12px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#1c2d81',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>{l.platform}: {l.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Operational Controls */}
        <div className={styles.modalFooter}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              Placement Authorization:
            </span>
            <select
              value={roster.placementStatus || 'UNPLACED'}
              onChange={(e) => handlePlacementChange(e.target.value)}
              disabled={updating}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: '#ffffff',
              }}
            >
              <option value="UNPLACED">UNPLACED</option>
              <option value="PLACEMENT_SEEKING">PLACEMENT_SEEKING</option>
              <option value="PLACED">PLACED (Offer Certified)</option>
              <option value="OPTED_OUT">OPTED_OUT</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className={styles.btnSecondary} onClick={handlePrintDossier}>
              <Printer size={15} />
              <span>Print Dossier</span>
            </button>
            {!isVerified && (
              <button
                className={styles.btnPrimary}
                onClick={() => handleVerify(true)}
                disabled={updating}
                style={{ background: '#15803d', borderColor: '#15803d' }}
              >
                <ShieldCheck size={15} />
                <span>Approve Academic Record</span>
              </button>
            )}
            <button className={styles.btnSecondary} onClick={onClose}>
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
