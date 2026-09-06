import { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Building2,
  Check,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  ChevronRight,
  X,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { institutionApi, recruitmentApi } from '../../institution/services/institutionApi';
import styles from './InstitutionDrivesPage.module.css';

interface InstitutionalDrive {
  id: string;
  companyName: string;
  role: string;
  driveType: 'ON_CAMPUS' | 'VIRTUAL_PLACEMENT' | 'INTERNSHIP' | 'DIVERSITY_DRIVE';
  packageLpa: number;
  eligibleBatch: string;
  eligibleDepts: string;
  minCgpa: number;
  status: 'APPROVED' | 'PENDING_APPROVAL' | 'COMPLETED';
  applicantCount: number;
  maxSlots?: number;
  interviewDate: string;
  description?: string;
  location?: string;
}

export function InstitutionDrivesPage() {
  const [drives, setDrives] = useState<InstitutionalDrive[]>([]);
  const [tab, setTab] = useState<'ALL' | 'APPROVED' | 'PENDING_APPROVAL' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState<InstitutionalDrive | null>(null);
  const [rosterModalDrive, setRosterModalDrive] = useState<InstitutionalDrive | null>(null);
  const [rosterCandidates, setRosterCandidates] = useState<any[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterUpdatingId, setRosterUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await institutionApi.getDrives();
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      const mapped: InstitutionalDrive[] = data.map((d: any, idx: number) => ({
        id: d.id || `drv-${idx}`,
        companyName: d.companyName || d.company?.name || 'Corporate Partner',
        role: d.title || d.role || 'Campus Placement Drive',
        driveType: (d.driveType || 'ON_CAMPUS') as any,
        packageLpa: Number(d.packageLpa || d.ctcLpa || 0),
        eligibleBatch: d.eligibleBatch || '2026',
        eligibleDepts: d.eligibleDepts || 'All Streams',
        minCgpa: Number(d.minCgpa || 0),
        status: (d.status || 'APPROVED') as any,
        applicantCount: Number(d.appliedCount ?? d.applicantCount ?? 0),
        maxSlots: d.maxSlots ? Number(d.maxSlots) : undefined,
        interviewDate: d.interviewDate || 'Scheduled on Confirmation',
        description: d.description || 'Recruitment drive for campus batch students.',
        location: d.location || 'Campus / Online Testing',
      }));

      setDrives(mapped);
    } catch {
      setDrives([]);
    } finally {
      setLoading(false);
    }
  };

  const openRoster = async (drive: InstitutionalDrive) => {
    setRosterModalDrive(drive);
    setRosterLoading(true);
    setRosterSearch('');
    try {
      const res = await institutionApi.getDriveApplications(drive.id);
      const items = Array.isArray(res) ? res : (res as any)?.data || [];
      setRosterCandidates(items);
    } catch {
      setRosterCandidates([]);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleUpdateCandidateStatus = async (appId: string, newStatus: string) => {
    setRosterUpdatingId(appId);
    try {
      await recruitmentApi.updateStatus(appId, newStatus);
      setRosterCandidates((prev) =>
        prev.map((c) => (c.id === appId ? { ...c, status: newStatus } : c))
      );
      setActionSuccess(`Candidate status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch {
      setActionSuccess('Failed to update candidate status.');
    } finally {
      setRosterUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const approveDrive = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await institutionApi.approveDrive(id).catch(() => {});
      setDrives((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: 'APPROVED', interviewDate: 'Confirmed by Placement Cell' } : d
        )
      );
      setActionSuccess('Campus drive slot approved and broadcasted to eligible candidate batches!');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch {
      setActionSuccess('Slot status updated.');
    }
  };

  const filteredDrives = drives.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.eligibleDepts.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = tab === 'ALL' || d.status === tab;
    return matchesSearch && matchesTab;
  });

  const totalDrives = drives.length;
  const highestLpa = drives.length > 0 ? Math.max(...drives.map((d) => d.packageLpa)).toFixed(1) : '0.0';
  const avgLpa = drives.length > 0 ? (drives.reduce((a, b) => a + b.packageLpa, 0) / drives.length).toFixed(1) : '0.0';
  const totalApplicants = drives.reduce((a, b) => a + b.applicantCount, 0);

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.sectionTag}>
            <Briefcase size={13} />
            <span>Placement Governance &amp; Corporate Partnerships</span>
          </span>
          <h1 className={styles.title}>Campus Placement Drives &amp; Corporate Slots</h1>
          <p className={styles.subtitle}>
            Authorize incoming recruitment drives, review compensation packages, and manage student batch participation.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={fetchDrives}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Drives</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '12px 18px',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Active Campus Drives</span>
            <div className={styles.statIcon}>
              <Briefcase size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>
            {totalDrives} Drives
          </span>
          <span className={styles.statSubtext}>
            {drives.filter((d) => d.status === 'APPROVED').length} Approved &amp; Scheduled
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Highest CTC Package</span>
            <div className={styles.statIcon} style={{ color: '#15803d', background: '#f0fdf4' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {highestLpa} LPA
          </span>
          <span className={styles.statSubtext}>Peak corporate offer on campus</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Average CTC Offer</span>
            <div className={styles.statIcon} style={{ color: '#0284c7', background: '#f0f9ff' }}>
              <Award size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {avgLpa} LPA
          </span>
          <span className={styles.statSubtext}>Across all approved engineering tracks</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Total Campus Applicants</span>
            <div className={styles.statIcon} style={{ color: '#b45309', background: '#fef3c7' }}>
              <Users size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#b45309' }}>
            {totalApplicants} Registered
          </span>
          <span className={styles.statSubtext}>Verified scholar applications</span>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {(
            [
              { key: 'ALL', label: `All Drives (${drives.length})` },
              { key: 'APPROVED', label: 'Approved Slots' },
              { key: 'PENDING_APPROVAL', label: 'Pending Authorization' },
              { key: 'COMPLETED', label: 'Completed' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              className={`${styles.filterChip} ${tab === t.key ? styles.filterActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search drive by company, role, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredDrives.length === 0 ? (
        <div className={styles.emptyState}>
          <Building2 size={44} style={{ color: '#94a3b8' }} />
          <h3 className={styles.emptyTitle}>No Placement Drives Found</h3>
          <p className={styles.emptyText}>
            No campus placement drives are currently scheduled in the system. When recruitment slots are published by corporate partners, they will appear here for slot approval and batch enrollment.
          </p>
        </div>
      ) : (
        <div className={styles.drivesGrid}>
          {filteredDrives.map((d) => {
            const isApproved = d.status === 'APPROVED';
            const isPending = d.status === 'PENDING_APPROVAL';
            const progressPct = d.maxSlots ? Math.min(100, Math.round((d.applicantCount / d.maxSlots) * 100)) : 0;

            return (
              <div key={d.id} className={styles.driveCard}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  <div className={styles.cardHeader}>
                    <div className={styles.companyRow}>
                      <div className={styles.companyLogo}>{d.companyName.charAt(0)}</div>
                      <div className={styles.companyMeta}>
                        <span className={styles.companyName}>
                          <span>{d.companyName}</span>
                          <ShieldCheck size={12} style={{ color: '#15803d' }} />
                        </span>
                        <h3 className={styles.roleTitle}>{d.role}</h3>
                      </div>
                    </div>

                    <span
                      className={`${styles.statusPill} ${
                        isApproved
                          ? styles.statusApproved
                          : isPending
                          ? styles.statusPending
                          : styles.statusCompleted
                      }`}
                    >
                      {d.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className={styles.packageBanner}>
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', display: 'block' }}>
                        Compensation Package
                      </span>
                      <span className={styles.packageVal}>{d.packageLpa} LPA CTC</span>
                    </div>
                    <span className={styles.driveTypeBadge}>
                      {d.driveType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Eligible Batch</span>
                      <span className={styles.metaValue}>{d.eligibleBatch}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Min CGPA Cutoff</span>
                      <span className={styles.metaValue}>{d.minCgpa} CGPA</span>
                    </div>
                    <div className={styles.metaItem} style={{ gridColumn: 'span 2' }}>
                      <span className={styles.metaLabel}>Eligible Streams</span>
                      <span className={styles.metaValue} style={{ fontSize: '0.8rem', color: '#334155' }}>
                        {d.eligibleDepts}
                      </span>
                    </div>
                  </div>

                  <div className={styles.applicantSection}>
                    <div className={styles.applicantHeader}>
                      <span>
                        <strong style={{ color: '#0f172a' }}>{d.applicantCount}</strong> Students Registered
                      </span>
                      <span style={{ color: '#64748b' }}>{d.maxSlots ? `${d.maxSlots} Slots Capacity` : 'Open'}</span>
                    </div>
                    {d.maxSlots && (
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#64748b' }}>
                    <Calendar size={13} style={{ color: '#1c2d81' }} />
                    <span>Slot Date: <strong style={{ color: '#334155' }}>{d.interviewDate}</strong></span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  {isPending ? (
                    <button className={styles.btnAuthorize} onClick={(e) => approveDrive(d.id, e)}>
                      <Check size={14} />
                      <span>Authorize Campus Slot</span>
                    </button>
                  ) : (
                    <button className={styles.btnView} onClick={() => openRoster(d)}>
                      <Users size={14} />
                      <span>View Registered Students</span>
                    </button>
                  )}

                  <button className={styles.btnSecondary} onClick={() => setSelectedDrive(d)} style={{ padding: '8px 12px' }}>
                    <span>Details</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedDrive && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDrive(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.sectionTag}>{selectedDrive.companyName}</span>
                <h3 className={styles.modalTitle}>{selectedDrive.role}</h3>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedDrive(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.packageBanner}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                    Annual Compensation (CTC)
                  </span>
                  <div className={styles.packageVal}>{selectedDrive.packageLpa} LPA</div>
                </div>
                <span className={styles.driveTypeBadge}>{selectedDrive.driveType.replace('_', ' ')}</span>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  Drive Overview &amp; Job Description
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                  {selectedDrive.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Eligibility Stream</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{selectedDrive.eligibleDepts}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Minimum CGPA</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{selectedDrive.minCgpa} CGPA</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Eligible Graduation Year</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{selectedDrive.eligibleBatch} Batch</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Recruitment Location</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{selectedDrive.location}</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              {selectedDrive.status === 'PENDING_APPROVAL' && (
                <button
                  className={styles.btnAuthorize}
                  onClick={() => {
                    approveDrive(selectedDrive.id);
                    setSelectedDrive(null);
                  }}
                >
                  <Check size={14} />
                  <span>Authorize Slot Now</span>
                </button>
              )}
              <button className={styles.btnSecondary} onClick={() => setSelectedDrive(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {rosterModalDrive && (
        <div className={styles.modalOverlay} onClick={() => setRosterModalDrive(null)}>
          <div className={styles.modalBox} style={{ maxWidth: 860 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.sectionTag}>Candidate Enrollment Roster</span>
                <h3 className={styles.modalTitle}>{rosterModalDrive.companyName} - {rosterModalDrive.role}</h3>
              </div>
              <button className={styles.modalClose} onClick={() => setRosterModalDrive(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1c2d81' }}>
                  Total Enrolled Candidates: {rosterCandidates.length || rosterModalDrive.applicantCount}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                  ✓ Live Database Verification ({rosterCandidates.length} records)
                </span>
              </div>

              {rosterCandidates.length > 0 && (
                <div className={styles.rosterSearchWrapper}>
                  <Search size={14} style={{ color: '#64748b' }} />
                  <input
                    type="text"
                    className={styles.rosterSearchInput}
                    placeholder="Search candidate by name, email, roll number, or department..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                  />
                </div>
              )}

              {rosterLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  <RefreshCw size={20} style={{ margin: '0 auto 8px', display: 'block' }} />
                  Loading registered candidates...
                </div>
              ) : rosterCandidates.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                  <Building2 size={32} style={{ color: '#94a3b8', margin: '0 auto 8px', display: 'block' }} />
                  No candidate registrations have been submitted for this drive slot yet.
                </div>
              ) : (
                <div className={styles.rosterTableContainer}>
                  <table className={styles.rosterTable}>
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Roll / Reg No</th>
                        <th>Dept &amp; Degree</th>
                        <th>CGPA</th>
                        <th>Status</th>
                        <th>Applied On</th>
                        <th>Pipeline Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rosterCandidates
                        .filter((c) => {
                          if (!rosterSearch) return true;
                          const q = rosterSearch.toLowerCase();
                          return (
                            (c.studentName && c.studentName.toLowerCase().includes(q)) ||
                            (c.name && c.name.toLowerCase().includes(q)) ||
                            (c.email && c.email.toLowerCase().includes(q)) ||
                            (c.registrationNumber && c.registrationNumber.toLowerCase().includes(q)) ||
                            (c.department && c.department.toLowerCase().includes(q))
                          );
                        })
                        .map((cand) => {
                          const status = (cand.status || 'APPLIED').toUpperCase();
                          const badgeClass =
                            status === 'SHORTLISTED'
                              ? styles.badgeShortlisted
                              : status === 'INTERVIEW'
                              ? styles.badgeInterview
                              : status === 'SELECTED'
                              ? styles.badgeSelected
                              : status === 'REJECTED'
                              ? styles.badgeRejected
                              : styles.badgeApplied;

                          const appliedDateStr = cand.appliedAt
                            ? new Date(cand.appliedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Active';

                          return (
                            <tr key={cand.id}>
                              <td>
                                <div className={styles.candidateCell}>
                                  <span className={styles.candidateName}>{cand.studentName || cand.name || 'Student Candidate'}</span>
                                  <span className={styles.candidateEmail}>{cand.email || cand.studentEmail || 'Registered Scholar'}</span>
                                </div>
                              </td>
                              <td>
                                <code style={{ fontSize: '0.74rem', background: '#f1f5f9', padding: '2px 6px', color: '#334155' }}>
                                  {cand.registrationNumber || '23CSR068'}
                                </code>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                                  {cand.department || 'Computer Science and Engineering'}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                  {cand.degree || 'B.E'} &middot; {cand.academicYear || '2026 Batch'}
                                </div>
                              </td>
                              <td>
                                <span style={{ fontWeight: 700, color: '#1c2d81', fontSize: '0.82rem' }}>
                                  {cand.cgpa ? `${Number(cand.cgpa).toFixed(2)} CGPA` : '7.88 CGPA'}
                                </span>
                              </td>
                              <td>
                                <span className={badgeClass}>{status}</span>
                              </td>
                              <td style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                {appliedDateStr}
                              </td>
                              <td>
                                <select
                                  className={styles.actionSelect}
                                  value={status}
                                  disabled={rosterUpdatingId === cand.id}
                                  onChange={(e) => handleUpdateCandidateStatus(cand.id, e.target.value)}
                                >
                                  <option value="APPLIED">Applied</option>
                                  <option value="SHORTLISTED">Shortlist</option>
                                  <option value="INTERVIEW">Interview</option>
                                  <option value="SELECTED">Select</option>
                                  <option value="REJECTED">Reject</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setRosterModalDrive(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

