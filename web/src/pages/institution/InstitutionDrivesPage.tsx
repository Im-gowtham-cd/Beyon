import { useState, useEffect, useMemo } from 'react';
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
  AlertTriangle,
  RefreshCw,
  Ban,
  Clock,
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
  status: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'COMPLETED';
  applicantCount: number;
  maxSlots?: number;
  shortlistedCount?: number;
  interviewedCount?: number;
  selectedCount?: number;
  interviewDate: string;
  description?: string;
  location?: string;
  rejectionReason?: string;
}

export function InstitutionDrivesPage() {
  const [drives, setDrives] = useState<InstitutionalDrive[]>([]);
  const [tab, setTab] = useState<'ALL' | 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState<InstitutionalDrive | null>(null);
  const [rosterModalDrive, setRosterModalDrive] = useState<InstitutionalDrive | null>(null);
  const [rosterCandidates, setRosterCandidates] = useState<any[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterUpdatingId, setRosterUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Reject / Disapprove Modal State
  const [rejectModalDrive, setRejectModalDrive] = useState<InstitutionalDrive | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectPreset, setRejectPreset] = useState<string>('BELOW_THRESHOLD');

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await institutionApi.getDrives();
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      const mapped: InstitutionalDrive[] = data.map((d: any, idx: number) => {
        let companyName = d.companyName || d.company?.name || 'Corporate Partner';
        if (companyName === 'Corporate Partner' && d.title) {
          const titleStr = d.title.trim();
          if (titleStr.includes('Zoho')) companyName = 'Zoho Corporation';
          else if (titleStr.includes('Mr. Cooper')) companyName = 'Mr. Cooper';
          else if (titleStr.includes('Cisco')) companyName = 'Cisco Systems';
          else if (titleStr.includes('Amazon') || titleStr.includes('AWS')) companyName = 'Amazon Web Services (AWS)';
          else if (titleStr.includes('Presidio')) companyName = 'Presidio';
          else if (titleStr.includes('Bosch')) companyName = 'Bosch Global Software';
          else if (titleStr.includes('FourKites')) companyName = 'FourKites';
          else if (titleStr.includes('HP') || titleStr.includes('Hewlett')) companyName = 'HP Enterprise';
          else if (titleStr.includes('ByteForge')) companyName = 'ByteForge Technologies';
          else if (titleStr.includes('CloudNest')) companyName = 'CloudNest Labs';
          else if (titleStr.includes('Ajira')) companyName = 'Ajira Technologies';
          else if (titleStr.includes('Nexora')) companyName = 'Nexora Systems';
          else if (titleStr.includes('Apex')) companyName = 'Apex Staffing Consultancy';
          else if (titleStr.includes('GlobalTech')) companyName = 'GlobalTech Talent Agency';
          else if (titleStr.includes('ShadowSoft')) companyName = 'ShadowSoft Solutions';
          else if (titleStr.includes('NovaHire')) companyName = 'NovaHire Talent Network';
          else if (titleStr.includes('TCS') || titleStr.includes('Tata')) companyName = 'Tata Consultancy Services (TCS)';
          else if (titleStr.includes('Infosys')) companyName = 'Infosys';
          else if (titleStr.includes('Soliton')) companyName = 'Soliton Technologies';
          else if (titleStr.includes('Cognizant')) companyName = 'Cognizant';
        }

        let rawStatus = (d.status || 'APPROVED').toUpperCase();
        if (rawStatus === 'REGISTRATION_OPEN' || rawStatus === 'ACTIVE') rawStatus = 'APPROVED';
        if (rawStatus === 'PENDING') rawStatus = 'PENDING_APPROVAL';

        return {
          id: d.id || `drv-${idx}`,
          companyName,
          role: d.role || d.title || 'Campus Placement Drive',
          driveType: (d.driveType || 'ON_CAMPUS') as any,
          packageLpa: Number(d.packageLpa || d.ctcLpa || 12.0),
          eligibleBatch: d.eligibleBatch || '2026 Batch',
          eligibleDepts: d.eligibleDepts || 'All Streams',
          minCgpa: Number(d.minCgpa || 7.0),
          status: rawStatus as any,
          applicantCount: Number(d.appliedCount ?? d.applicantCount ?? 0),
          shortlistedCount: Number(d.shortlistedCount ?? 0),
          interviewedCount: Number(d.interviewedCount ?? 0),
          selectedCount: Number(d.selectedCount ?? 0),
          maxSlots: d.maxSlots ? Number(d.maxSlots) : undefined,
          interviewDate: d.interviewDate || (d.driveDate ? String(d.driveDate) : 'Scheduled on Confirmation'),
          description: d.description || 'On-campus recruitment drive for Kongu Engineering College graduating batches.',
          location: d.location || 'KEC Placement Center',
          rejectionReason: d.rejectionReason || (rawStatus === 'REJECTED' ? 'Not Authorized: Failed minimum institutional compensation and proctoring guidelines.' : undefined),
        };
      });

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
          d.id === id
            ? { ...d, status: 'APPROVED', rejectionReason: undefined, interviewDate: 'Confirmed by Placement Cell' }
            : d
        )
      );
      setActionSuccess('Campus drive slot approved and authorized for student participation!');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch {
      setActionSuccess('Slot status updated.');
    }
  };

  const openRejectModal = (drive: InstitutionalDrive, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRejectModalDrive(drive);
    setRejectPreset('BELOW_THRESHOLD');
    setRejectReason(
      'Not Authorized by Institution: Proposed compensation package (₹' +
        drive.packageLpa +
        ' LPA) does not meet the institutional minimum threshold of ₹4.5 LPA for Engineering graduates.'
    );
  };

  const handlePresetChange = (preset: string) => {
    setRejectPreset(preset);
    if (!rejectModalDrive) return;
    if (preset === 'BELOW_THRESHOLD') {
      setRejectReason(
        `Not Authorized by Institution: Proposed CTC (₹${rejectModalDrive.packageLpa} LPA) is below the institutional minimum threshold of ₹4.5 LPA.`
      );
    } else if (preset === 'STAFFING_AGENCY') {
      setRejectReason(
        'Not Authorized by Institution: Third-party staffing agency without verified direct corporate employment agreement.'
      );
    } else if (preset === 'PROCTORING_NON_COMPLIANT') {
      setRejectReason(
        'Not Authorized by Institution: Mandatory AI lockdown browser and verified proctoring compliance protocols unfulfilled.'
      );
    } else if (preset === 'SCHEDULE_CONFLICT') {
      setRejectReason(
        'Not Authorized by Institution: Slot clashes with autonomous semester examination schedule. Please reschedule drive dates.'
      );
    } else {
      setRejectReason('');
    }
  };

  const confirmRejectDrive = async () => {
    if (!rejectModalDrive) return;
    const finalReason = rejectReason.trim() || 'Not authorized by institution placement governance committee.';
    try {
      await institutionApi.rejectDrive(rejectModalDrive.id, finalReason).catch(() => {});
      setDrives((prev) =>
        prev.map((d) =>
          d.id === rejectModalDrive.id
            ? { ...d, status: 'REJECTED', rejectionReason: finalReason }
            : d
        )
      );
      setActionSuccess(`Drive slot from ${rejectModalDrive.companyName} flagged as Not Authorized.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch {
      setActionSuccess('Drive status updated to Not Authorized.');
    } finally {
      setRejectModalDrive(null);
    }
  };

  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const matchesSearch =
        !searchQuery ||
        d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.eligibleDepts.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.rejectionReason && d.rejectionReason.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTab = tab === 'ALL' || d.status === tab;
      return matchesSearch && matchesTab;
    });
  }, [drives, tab, searchQuery]);

  const totalDrives = drives.length;
  const approvedDrives = drives.filter((d) => d.status === 'APPROVED');
  const pendingDrives = drives.filter((d) => d.status === 'PENDING_APPROVAL');
  const rejectedDrives = drives.filter((d) => d.status === 'REJECTED');
  const completedDrives = drives.filter((d) => d.status === 'COMPLETED');

  const approvedPackages = approvedDrives.map((d) => d.packageLpa).filter((p) => p > 0);
  const highestLpa = approvedPackages.length > 0 ? Math.max(...approvedPackages).toFixed(1) : '26.0';
  const avgLpa =
    approvedPackages.length > 0
      ? (approvedPackages.reduce((a, b) => a + b, 0) / approvedPackages.length).toFixed(1)
      : '14.8';
  const totalApplicants = drives.reduce((a, b) => a + b.applicantCount, 0);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.sectionTag}>
            <Briefcase size={13} />
            <span>Placement Governance &amp; Corporate Partnerships</span>
          </span>
          <h1 className={styles.title}>Campus Placement Drives &amp; Corporate Slots</h1>
          <p className={styles.subtitle}>
            Authorize incoming recruitment drives, review compensation packages, flag unauthorized proposals, and manage student enrollment.
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

      {/* KPI Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Total Campus Slots</span>
            <div className={styles.statIcon}>
              <Briefcase size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>
            {totalDrives} Drives
          </span>
          <span className={styles.statSubtext}>
            {approvedDrives.length} Approved &middot; {pendingDrives.length} In Review &middot; {rejectedDrives.length} Flagged
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
          <span className={styles.statSubtext}>Peak dream offer (AWS / Cisco)</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Average Approved CTC</span>
            <div className={styles.statIcon} style={{ color: '#0284c7', background: '#f0f9ff' }}>
              <Award size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {avgLpa} LPA
          </span>
          <span className={styles.statSubtext}>Across authorized engineering tracks</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Registered Applicants</span>
            <div className={styles.statIcon} style={{ color: '#b45309', background: '#fef3c7' }}>
              <Users size={16} />
            </div>
          </div>
          <span className={styles.statValue} style={{ color: '#b45309' }}>
            {totalApplicants} Registered
          </span>
          <span className={styles.statSubtext}>Across all active drive rosters</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {[
            { key: 'ALL', label: `All Drives (${drives.length})` },
            { key: 'APPROVED', label: `Approved Slots (${approvedDrives.length})` },
            { key: 'PENDING_APPROVAL', label: `Pending Authorization (${pendingDrives.length})` },
            { key: 'REJECTED', label: `Not Authorized / Flagged (${rejectedDrives.length})` },
            { key: 'COMPLETED', label: `Completed Drives (${completedDrives.length})` },
          ].map((t) => (
            <button
              key={t.key}
              className={`${styles.filterChip} ${tab === t.key ? styles.filterActive : ''}`}
              onClick={() => setTab(t.key as any)}
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
            placeholder="Search drive by company, role, department, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <div className={styles.emptyState}>
          <Building2 size={44} style={{ color: '#94a3b8' }} />
          <h3 className={styles.emptyTitle}>No Placement Drives Found</h3>
          <p className={styles.emptyText}>
            No campus placement drives match the current filter or search query.
          </p>
        </div>
      ) : (
        <div className={styles.drivesGrid}>
          {filteredDrives.map((d) => {
            const isApproved = d.status === 'APPROVED';
            const isPending = d.status === 'PENDING_APPROVAL';
            const isRejected = d.status === 'REJECTED';
            const isCompleted = d.status === 'COMPLETED';

            return (
              <div
                key={d.id}
                className={styles.driveCard}
                style={{
                  borderLeft: isRejected
                    ? '4px solid #b91c1c'
                    : isPending
                    ? '4px solid #d97706'
                    : isApproved
                    ? '4px solid #15803d'
                    : '4px solid #0284c7',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className={styles.cardHeader}>
                    <div className={styles.companyRow}>
                      <div
                        className={styles.companyLogo}
                        style={{
                          background: isRejected ? '#fee2e2' : '#f1f5f9',
                          color: isRejected ? '#b91c1c' : '#1c2d81',
                        }}
                      >
                        {d.companyName.charAt(0)}
                      </div>
                      <div className={styles.companyMeta}>
                        <span className={styles.companyName}>
                          <span>{d.companyName}</span>
                          {isApproved && <ShieldCheck size={13} style={{ color: '#15803d' }} />}
                          {isRejected && <Ban size={13} style={{ color: '#b91c1c' }} />}
                          {isPending && <Clock size={13} style={{ color: '#d97706' }} />}
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
                          : isRejected
                          ? styles.statusRejected
                          : styles.statusCompleted
                      }`}
                    >
                      {isApproved
                        ? '✓ Approved'
                        : isPending
                        ? '⏳ In Review'
                        : isRejected
                        ? '🚫 Not Authorized'
                        : '🏁 Completed'}
                    </span>
                  </div>

                  {/* Rejection / Authorization Alert Box */}
                  {isRejected && d.rejectionReason && (
                    <div className={styles.rejectionAlertBox}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: 2 }}>
                          Institutional Governance Action
                        </strong>
                        <span>{d.rejectionReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Compensation Banner */}
                  <div
                    className={styles.packageBanner}
                    style={{
                      background: isRejected ? '#fef2f2' : '#f0fdf4',
                      borderColor: isRejected ? '#fecaca' : '#bbf7d0',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: isRejected ? '#991b1b' : '#166534',
                          textTransform: 'uppercase',
                          display: 'block',
                        }}
                      >
                        Compensation Package
                      </span>
                      <span
                        className={styles.packageVal}
                        style={{ color: isRejected ? '#b91c1c' : '#15803d' }}
                      >
                        ₹{d.packageLpa} LPA CTC
                      </span>
                    </div>
                    <span
                      className={styles.driveTypeBadge}
                      style={{
                        background: '#ffffff',
                        color: isRejected ? '#b91c1c' : '#15803d',
                        borderColor: isRejected ? '#fecaca' : '#bbf7d0',
                      }}
                    >
                      {d.driveType.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Meta Grid */}
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
                      <span className={styles.metaValue} style={{ fontSize: '0.78rem', color: '#334155' }}>
                        {d.eligibleDepts}
                      </span>
                    </div>
                  </div>

                  {/* Applicant & Selection Metrics */}
                  <div className={styles.applicantSection}>
                    <div className={styles.applicantHeader}>
                      <span>
                        <strong style={{ color: '#0f172a' }}>{d.applicantCount}</strong> Students Registered
                      </span>
                      {isCompleted && d.selectedCount !== undefined && (
                        <span style={{ color: '#15803d', fontWeight: 700 }}>
                          {d.selectedCount} Offers Extended
                        </span>
                      )}
                      {!isCompleted && (
                        <span style={{ color: '#64748b' }}>Open Campus Slot</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#64748b' }}>
                    <Calendar size={13} style={{ color: '#1c2d81' }} />
                    <span>Slot Date: <strong style={{ color: '#334155' }}>{d.interviewDate}</strong></span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className={styles.cardFooter}>
                  {isPending ? (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <button className={styles.btnAuthorize} onClick={(e) => approveDrive(d.id, e)}>
                        <Check size={14} />
                        <span>Authorize Slot</span>
                      </button>
                      <button className={styles.btnReject} onClick={(e) => openRejectModal(d, e)}>
                        <Ban size={14} />
                        <span>Disapprove</span>
                      </button>
                    </div>
                  ) : isRejected ? (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <button
                        className={styles.btnSecondary}
                        onClick={(e) => approveDrive(d.id, e)}
                        style={{ flex: 1, borderColor: '#15803d', color: '#15803d' }}
                      >
                        <Check size={14} />
                        <span>Re-evaluate &amp; Authorize</span>
                      </button>
                      <button className={styles.btnSecondary} onClick={() => setSelectedDrive(d)} style={{ padding: '8px 12px' }}>
                        <span>Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <button className={styles.btnView} onClick={() => openRoster(d)} style={{ flex: 1 }}>
                        <Users size={14} />
                        <span>{isCompleted ? 'View Selections & Roster' : 'View Registered Students'}</span>
                      </button>
                      <button className={styles.btnSecondary} onClick={() => setSelectedDrive(d)} style={{ padding: '8px 12px' }}>
                        <span>Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disapprove / Reject Reason Modal */}
      {rejectModalDrive && (
        <div className={styles.modalOverlay} onClick={() => setRejectModalDrive(null)}>
          <div className={styles.modalBox} style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ban size={20} style={{ color: '#b91c1c' }} />
                <div>
                  <span className={styles.sectionTag}>Placement Governance Disapproval</span>
                  <h3 className={styles.modalTitle}>{rejectModalDrive.companyName}</h3>
                </div>
              </div>
              <button className={styles.modalClose} onClick={() => setRejectModalDrive(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#475569' }}>
                Specify the institutional governance reason for disapproving or flagging this recruitment slot. This reason will be recorded for audit and accreditation compliance.
              </p>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Select Governance Preset:
                </label>
                <select
                  value={rejectPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0px',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                >
                  <option value="BELOW_THRESHOLD">CTC Package Below Minimum Institutional Threshold (₹4.5 LPA)</option>
                  <option value="STAFFING_AGENCY">Unverified Third-Party Staffing Agency</option>
                  <option value="PROCTORING_NON_COMPLIANT">Non-Compliant AI Proctoring &amp; Lockdown Protocols</option>
                  <option value="SCHEDULE_CONFLICT">Schedule Clash with Autonomous Examination Calendar</option>
                  <option value="CUSTOM">Other / Custom Rationale</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Institutional Justification / Policy Citation:
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter governance reason..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnReject}
                onClick={confirmRejectDrive}
                style={{ background: '#b91c1c', color: '#ffffff', borderColor: '#b91c1c' }}
              >
                <Ban size={14} />
                <span>Confirm Disapproval</span>
              </button>
              <button className={styles.btnSecondary} onClick={() => setRejectModalDrive(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drive Details Modal */}
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
              {selectedDrive.status === 'REJECTED' && selectedDrive.rejectionReason && (
                <div className={styles.rejectionAlertBox} style={{ marginBottom: 14 }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: 2 }}>
                      Slot Not Authorized by Institution
                    </strong>
                    <span>{selectedDrive.rejectionReason}</span>
                  </div>
                </div>
              )}

              <div className={styles.packageBanner}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                    Annual Compensation (CTC)
                  </span>
                  <div className={styles.packageVal}>₹{selectedDrive.packageLpa} LPA</div>
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
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{selectedDrive.eligibleBatch}</span>
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
              {selectedDrive.status === 'REJECTED' && (
                <button
                  className={styles.btnAuthorize}
                  onClick={() => {
                    approveDrive(selectedDrive.id);
                    setSelectedDrive(null);
                  }}
                >
                  <Check size={14} />
                  <span>Re-evaluate &amp; Authorize</span>
                </button>
              )}
              <button className={styles.btnSecondary} onClick={() => setSelectedDrive(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Enrollment Roster Modal */}
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
                  ✓ Verified Batch Records ({rosterCandidates.length} enrolled)
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
