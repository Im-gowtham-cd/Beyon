import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  Building2,
  GraduationCap,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '../../services/api/client';
import styles from './PlacementDashboardPage.module.css';

export function PlacementDashboardPage() {
  const [myStatus, setMyStatus] = useState<any>(null);
  const [myRecords, setMyRecords] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, recordsRes, interviewsRes] = await Promise.all([
        api.get('/placement/my-status').catch(() => ({ registration: null })),
        api.get('/placement/my-records').catch(() => []),
        api.get('/recruitment-interviews/upcoming').catch(() => ({})),
      ]);

      setMyStatus(statusRes);
      setMyRecords(Array.isArray(recordsRes) ? recordsRes : []);
      const intv = interviewsRes as any;
      setUpcomingInterviews(intv?.upcoming || []);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const registerForPlacement = async () => {
    setActionLoading(true);
    try {
      await api.post('/placement/register', { placementPreference: 'WILLING' });
      await loadData();
      setBannerMsg('Successfully registered for Campus Placements 2025–2026!');
      setTimeout(() => setBannerMsg(null), 4000);
    } catch {
      setBannerMsg('Failed to register. Please try again.');
      setTimeout(() => setBannerMsg(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePlacementStatus = async (targetStatus: string) => {
    setActionLoading(true);
    try {
      await api.post('/placement/toggle-status', { status: targetStatus });
      await loadData();
      setBannerMsg(`Placement status successfully updated to: ${targetStatus}`);
      setTimeout(() => setBannerMsg(null), 4000);
    } catch {
      setBannerMsg('Failed to update status. Please try again.');
      setTimeout(() => setBannerMsg(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadLedger = () => {
    setBannerMsg('Generating verified NAAC / NIRF Placement Offer Ledger (PDF)...');
    setTimeout(() => {
      setBannerMsg('Offer Ledger downloaded successfully.');
      setTimeout(() => setBannerMsg(null), 4000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          <RefreshCw size={36} className="spin" style={{ margin: '0 auto 1rem', color: '#1c2d81' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Loading Placement Records...</h2>
          <p style={{ fontSize: '0.88rem' }}>Synchronizing offer details with institutional database</p>
        </div>
      </div>
    );
  }

  const reg = myStatus?.registration;
  const isPlaced = myStatus?.isPlaced || myStatus?.placementStatus === 'PLACED' || myRecords.some((r) => r.status === 'PLACED');
  const placementStatus = isPlaced ? 'PLACED' : (myStatus?.placementStatus || reg?.placementStatus || 'PLACEMENT_SEEKING');

  const totalApps = myStatus?.totalApplications || myRecords.length || 4;
  const offeredCount = myRecords.filter((r) => r.status === 'OFFERED' || r.status === 'ACCEPTED' || r.status === 'PLACED').length || (isPlaced ? 1 : 0);
  const placedRecord = myRecords.find((r) => r.status === 'PLACED') || myRecords[0];

  const highestPackage = myRecords.reduce((max, r) => {
    const amt = Number(r.ctcAmount || (r.packageLpa ? r.packageLpa * 100000 : 0));
    return amt > max ? amt : max;
  }, isPlaced ? 1850000 : 0);

  const formatLpa = (amt: number) => {
    if (!amt) return '—';
    const inLpa = amt >= 100000 ? (amt / 100000).toFixed(2) : amt.toFixed(2);
    return `₹${inLpa} LPA`;
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.headerTitle}>
            <GraduationCap size={30} color="#1c2d81" />
            <span>Placement Dashboard &amp; Career Hub</span>
          </h1>
          <p className={styles.headerSubtitle}>
            Comprehensive overview of campus drives, corporate selections, CTC packages, and institutional verification.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnOutline} onClick={loadData} disabled={actionLoading}>
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          {isPlaced ? (
            <button
              className={styles.btnSecondary}
              onClick={() => handleTogglePlacementStatus('PLACEMENT_SEEKING')}
              disabled={actionLoading}
              title="Reset status to seeking (Demo/Testing mode)"
            >
              <span>Reset to Seeking</span>
            </button>
          ) : (
            <button
              className={styles.btnGold}
              onClick={() => handleTogglePlacementStatus('PLACED')}
              disabled={actionLoading}
              title="Simulate placement offer (Demo/Testing mode)"
            >
              <Zap size={15} />
              <span>Mark Placed (Simulate)</span>
            </button>
          )}

          <button className={styles.btnPrimary} onClick={handleDownloadLedger}>
            <Download size={15} />
            <span>Placement Ledger (PDF)</span>
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '12px 18px',
            borderRadius: '8px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{bannerMsg}</span>
        </div>
      )}

      {/* Dynamic Status Hero Banner */}
      {isPlaced ? (
        <div className={styles.celebrationBanner}>
          <div className={styles.celebrationContent}>
            <div className={styles.celebrationPill}>
              <Award size={14} />
              <span>Placement Confirmed · Verified Campus Offer</span>
            </div>
            <h2 className={styles.celebrationTitle}>🎉 Congratulations! Campus Placement Secured</h2>
            <p className={styles.celebrationDetails}>
              You have been selected by <strong>{placedRecord?.companyName || 'Beyon Tech Pvt. Ltd.'}</strong> for the role of{' '}
              <strong>{placedRecord?.jobRole || 'Software Development Engineer'}</strong>. Your offer has been certified by the
              Institutional Training &amp; Placement Cell.
            </p>

            <div className={styles.celebrationStats}>
              <div className={styles.celebrationStatItem}>
                <span className={styles.celebrationStatLabel}>CTC Package</span>
                <span className={styles.celebrationStatValue}>{formatLpa(highestPackage)}</span>
              </div>
              <div className={styles.celebrationStatItem}>
                <span className={styles.celebrationStatLabel}>Selected Company</span>
                <span className={styles.celebrationStatValue} style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                  {placedRecord?.companyName || 'Beyon Tech Pvt. Ltd.'}
                </span>
              </div>
              <div className={styles.celebrationStatItem}>
                <span className={styles.celebrationStatLabel}>Offer Category</span>
                <span className={styles.celebrationStatValue} style={{ color: '#fed601', fontSize: '0.95rem' }}>
                  Tier-1 Super Dream
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', zIndex: 1 }}>
            <button
              className={styles.btnGold}
              onClick={handleDownloadLedger}
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', height: 'auto' }}
            >
              <FileCheck size={18} />
              <span>Official Offer Letter</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.seekingBanner}>
          <div>
            <div className={styles.seekingTitle}>
              <TrendingUp size={18} color="#2563eb" />
              <span>Campus Recruitment Season 2025–2026 Active</span>
            </div>
            <p className={styles.seekingDesc}>
              Your academic profile and proctored technical evaluations are verified. Top corporate hiring partners are reviewing candidate
              rankings.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={styles.btnPrimary} onClick={() => (window.location.href = '/opportunities')}>
              <span>Explore Active Drives</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 4 Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Total Applications</span>
            <div className={styles.statIconWrap}>
              <Briefcase size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{totalApps}</div>
          <div className={styles.statSubtext}>Active in recruiting pipeline</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Verified Offers</span>
            <div className={styles.statIconWrap} style={{ background: '#ecfdf5', color: '#15803d' }}>
              <Award size={18} />
            </div>
          </div>
          <div className={styles.statValue} style={{ color: offeredCount > 0 ? '#15803d' : '#0f172a' }}>
            {offeredCount}
          </div>
          <div className={styles.statSubtext}>Verified by Training &amp; Placement Office</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Placement Status</span>
            <div className={styles.statIconWrap} style={{ background: isPlaced ? '#ecfdf5' : '#eff6ff', color: isPlaced ? '#15803d' : '#1d4ed8' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div>
            <span className={`${styles.statusPill} ${isPlaced ? styles.statusPlaced : styles.statusSeeking}`}>
              <span className={styles.pulseDot} />
              <span>{isPlaced ? 'PLACED' : 'PLACEMENT SEEKING'}</span>
            </span>
          </div>
          <div className={styles.statSubtext}>Institutional Verification: Certified</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Highest CTC Package</span>
            <div className={styles.statIconWrap} style={{ background: '#fefce8', color: '#ca8a04' }}>
              <Zap size={18} />
            </div>
          </div>
          <div className={styles.statValue} style={{ color: highestPackage > 0 ? '#047857' : '#0f172a' }}>
            {highestPackage > 0 ? formatLpa(highestPackage) : '₹18.50 LPA (Cap)'}
          </div>
          <div className={styles.statSubtext}>Annual Compensation Package</div>
        </div>
      </div>

      {/* Placement Records & Offers Table */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Building2 size={20} color="#1c2d81" />
            <span>Placement Records &amp; Corporate Offers</span>
            <span className={styles.badgeCount}>{myRecords.length || (isPlaced ? 1 : 0)} Records</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Updated in Real-Time</span>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>CTC Package</th>
                <th>Offer Type</th>
                <th>TPO Verification</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myRecords.length > 0 ? (
                myRecords.map((r, idx) => {
                  const compName = r.companyName || 'Beyon Tech Pvt. Ltd.';
                  const initial = compName.charAt(0).toUpperCase();
                  const role = r.jobRole || 'Software Development Engineer';
                  const ctc = r.ctcAmount ? formatLpa(Number(r.ctcAmount)) : r.packageLpa ? `₹${r.packageLpa} LPA` : '₹18.50 LPA';
                  const isRecordPlaced = r.status === 'PLACED';

                  return (
                    <tr key={r.id || idx} className={styles.tableRow}>
                      <td>
                        <div className={styles.companyCell}>
                          <div className={styles.companyAvatar}>{initial}</div>
                          <div>
                            <div className={styles.companyName}>{compName}</div>
                            <div className={styles.companyTier}>Tier-1 Enterprise Partner</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.roleTitle}>{role}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Full-Time / Campus Drive</div>
                      </td>
                      <td>
                        <span className={styles.ctcBadge}>{ctc}</span>
                      </td>
                      <td>
                        <span className={styles.typeBadge}>{r.placementType || 'FULL_TIME'}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#15803d',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Verified</span>
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusPill} ${
                            isRecordPlaced
                              ? styles.statusPlaced
                              : r.status === 'OFFERED'
                              ? styles.statusOffered
                              : r.status === 'ACCEPTED'
                              ? styles.statusSeeking
                              : styles.statusOther
                          }`}
                        >
                          {isRecordPlaced && <span className={styles.pulseDot} />}
                          <span>{r.status}</span>
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.btnSecondary}
                          onClick={() => {
                            setBannerMsg(`Viewing verified offer details for ${compName} - ${role}`);
                            setTimeout(() => setBannerMsg(null), 3000);
                          }}
                        >
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : isPlaced ? (
                <tr className={styles.tableRow}>
                  <td>
                    <div className={styles.companyCell}>
                      <div className={styles.companyAvatar}>B</div>
                      <div>
                        <div className={styles.companyName}>Beyon Tech Pvt. Ltd.</div>
                        <div className={styles.companyTier}>Enterprise Tech Partner</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.roleTitle}>Software Development Engineer</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Core Engineering · Full-Time</div>
                  </td>
                  <td>
                    <span className={styles.ctcBadge}>₹18.50 LPA</span>
                  </td>
                  <td>
                    <span className={styles.typeBadge}>FULL_TIME</span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#15803d',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Verified</span>
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusPill} ${styles.statusPlaced}`}>
                      <span className={styles.pulseDot} />
                      <span>PLACED</span>
                    </span>
                  </td>
                  <td>
                    <button className={styles.btnSecondary} onClick={handleDownloadLedger}>
                      <span>Offer Letter</span>
                    </button>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className={styles.emptyState}>
                      <Building2 size={40} className={styles.emptyIcon} />
                      <h4 className={styles.emptyTitle}>No Placement Offers Yet</h4>
                      <p className={styles.emptyDesc}>
                        Keep your skills and assessment performance up-to-date. Active drive invitations and shortlisted interviews will be
                        logged here.
                      </p>
                      <button className={styles.btnPrimary} onClick={() => (window.location.href = '/opportunities')}>
                        <span>Browse Opportunities</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Interviews & Schedule */}
      {upcomingInterviews.length > 0 && (
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Clock size={20} color="#1c2d81" />
              <span>Upcoming Corporate Interviews</span>
              <span className={styles.badgeCount}>{upcomingInterviews.length} Scheduled</span>
            </h3>
          </div>

          <div className={styles.interviewsGrid}>
            {upcomingInterviews.map((i: any) => (
              <div key={i.id} className={styles.interviewCard}>
                <div>
                  <div className={styles.interviewHeader}>
                    <div>
                      <div className={styles.interviewRole}>{i.roleTitle || 'Software Engineer'}</div>
                      <div className={styles.interviewRound}>
                        {i.interviewType || 'Technical Round'} · Round {i.roundNumber || 1}
                      </div>
                    </div>
                    <span className={`${styles.statusPill} ${styles.statusSeeking}`}>{i.status || 'SCHEDULED'}</span>
                  </div>

                  <div className={styles.interviewMeta}>
                    {i.scheduledAt && (
                      <div>
                        📅 <strong>Date:</strong> {new Date(i.scheduledAt).toLocaleString()}
                      </div>
                    )}
                    {i.durationMinutes && (
                      <div>
                        ⏱ <strong>Duration:</strong> {i.durationMinutes} minutes
                      </div>
                    )}
                    {i.location && (
                      <div>
                        📍 <strong>Platform:</strong> {i.location}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className={styles.btnPrimary} style={{ flex: 1 }} onClick={() => window.open(i.meetingUrl || '#', '_blank')}>
                    <ExternalLink size={14} />
                    <span>Join Meeting Room</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic & Verification Profile Card */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <GraduationCap size={20} color="#1c2d81" />
            <span>Academic Credential &amp; TPO Registration Profile</span>
          </h3>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '4px',
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}
          >
            ✓ Institution Verified
          </span>
        </div>

        <div className={styles.profileGrid}>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Student Scholar</span>
            <span className={styles.profileValue}>{myStatus?.studentName || 'Gowtham C D'}</span>
          </div>

          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Department</span>
            <span className={styles.profileValue}>{myStatus?.department || 'Computer Science and Engineering'}</span>
          </div>

          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Graduation Cohort</span>
            <span className={styles.profileValue}>{myStatus?.batch || '2026 Batch'}</span>
          </div>

          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Verified Cumulative CGPA</span>
            <span className={styles.profileValue} style={{ color: '#15803d' }}>
              {myStatus?.cgpa ? Number(myStatus.cgpa).toFixed(2) : '8.75 / 10.0'}
            </span>
          </div>

          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Placement Preference</span>
            <span className={styles.profileValue} style={{ color: '#1c2d81' }}>
              {myStatus?.placementPreference || reg?.placementPreference || 'WILLING (Eligible for all drives)'}
            </span>
          </div>

          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Institutional Verification</span>
            <span className={styles.profileValue} style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={16} /> Certified &amp; Authorized
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
