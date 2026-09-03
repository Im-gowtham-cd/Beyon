import { useState } from 'react';
import {
  Search,
  Calendar,
  Building2,
  Check,
  Users,
} from 'lucide-react';
import styles from './InstitutionDrivesPage.module.css';

interface InstitutionalDrive {
  id: string;
  companyName: string;
  role: string;
  driveType: 'ON_CAMPUS' | 'VIRTUAL_PLACEMENT' | 'INTERNSHIP';
  packageLpa: number;
  eligibleBatch: string;
  eligibleDepts: string;
  minCgpa: number;
  status: 'APPROVED' | 'PENDING_APPROVAL' | 'COMPLETED';
  applicantCount: number;
  interviewDate: string;
}

export function InstitutionDrivesPage() {
  const [drives, setDrives] = useState<InstitutionalDrive[]>([
    {
      id: 'drv-01',
      companyName: 'NVIDIA GPU Acceleration Lab',
      role: 'CUDA & Parallel Systems Architecture Engineer',
      driveType: 'ON_CAMPUS',
      packageLpa: 28.5,
      eligibleBatch: '2026',
      eligibleDepts: 'CSE, AI & DS, ECE',
      minCgpa: 8.5,
      status: 'APPROVED',
      applicantCount: 28,
      interviewDate: 'Sept 14, 2026',
    },
    {
      id: 'drv-02',
      companyName: 'Amazon Web Services (AWS)',
      role: 'Cloud Platform & Infrastructure Engineer',
      driveType: 'ON_CAMPUS',
      packageLpa: 22.0,
      eligibleBatch: '2026',
      eligibleDepts: 'All Engineering Streams',
      minCgpa: 8.0,
      status: 'APPROVED',
      applicantCount: 64,
      interviewDate: 'Sept 18, 2026',
    },
    {
      id: 'drv-03',
      companyName: 'Qualcomm Wireless Technologies',
      role: 'Embedded Systems & Firmware Specialist',
      driveType: 'ON_CAMPUS',
      packageLpa: 19.5,
      eligibleBatch: '2026',
      eligibleDepts: 'ECE, CSE, IT',
      minCgpa: 8.0,
      status: 'APPROVED',
      applicantCount: 38,
      interviewDate: 'Sept 22, 2026',
    },
    {
      id: 'drv-04',
      companyName: 'Enterprise Cloud Technologies',
      role: 'Full Stack Java & Spring Boot Trainee',
      driveType: 'VIRTUAL_PLACEMENT',
      packageLpa: 16.0,
      eligibleBatch: '2026, 2027',
      eligibleDepts: 'CSE, IT, AI & DS',
      minCgpa: 7.5,
      status: 'PENDING_APPROVAL',
      applicantCount: 52,
      interviewDate: 'Slot Pending Approval',
    },
  ]);

  const [tab, setTab] = useState<'ALL' | 'APPROVED' | 'PENDING_APPROVAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const approveDrive = (id: string) => {
    setDrives((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: 'APPROVED', interviewDate: 'Sept 28, 2026' } : d
      )
    );
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

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Campus Placement Drives &amp; Corporate Slots</h1>
          <p className={styles.subtitle}>
            Authorize incoming recruitment drives, review compensation packages, and manage student batch participation
          </p>
        </div>
      </div>

      {/* 4 Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Campus Drives</span>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>
            {drives.length} Drives
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Highest CTC Package</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            28.5 LPA
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average CTC Offer</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            18.2 LPA
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Campus Applicants</span>
          <span className={styles.statValue} style={{ color: '#d97706' }}>
            182 Registered
          </span>
        </div>
      </div>

      {/* Filter / Search Row */}
      <div className={styles.filterRow}>
        <div className={styles.filters}>
          {(['ALL', 'APPROVED', 'PENDING_APPROVAL'] as const).map((t) => (
            <button
              key={t}
              className={`${styles.filterChip} ${tab === t ? styles.filterActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'ALL'
                ? `All Drives (${drives.length})`
                : t === 'APPROVED'
                ? 'Approved Slots'
                : 'Pending Approval'}
            </button>
          ))}
        </div>

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
            style={{ paddingLeft: '34px', minWidth: '280px' }}
            placeholder="Search drive by company, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Drives Grid */}
      <div className={styles.grid}>
        {filteredDrives.map((d) => (
          <div key={d.id} className={styles.card}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                  gap: '12px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#1c2d81',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Building2 size={12} />
                    <span>{d.companyName}</span>
                  </span>
                  <h3
                    style={{
                      margin: '4px 0 0',
                      fontSize: '1.08rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      lineHeight: 1.35,
                    }}
                  >
                    {d.role}
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '0px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    background: d.status === 'APPROVED' ? '#dcfce7' : '#fef3c7',
                    color: d.status === 'APPROVED' ? '#15803d' : '#b45309',
                    border: `1px solid ${d.status === 'APPROVED' ? '#bbf7d0' : '#fde68a'}`,
                  }}
                >
                  {d.status.replace('_', ' ')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '10px 0' }}>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#15803d',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '3px 8px',
                    borderRadius: '0px',
                  }}
                >
                  {d.packageLpa} LPA CTC
                </span>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 400,
                    color: '#475569',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '3px 8px',
                    borderRadius: '0px',
                  }}
                >
                  Min {d.minCgpa} CGPA
                </span>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 400,
                    color: '#0284c7',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '3px 8px',
                    borderRadius: '0px',
                  }}
                >
                  Class of {d.eligibleBatch}
                </span>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '6px', fontWeight: 400 }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>Eligible:</span> {d.eligibleDepts}
              </div>
            </div>

            <div
              style={{
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <span
                style={{
                  fontSize: '0.76rem',
                  color: '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: 400,
                }}
              >
                <Calendar size={13} style={{ color: '#1c2d81' }} />
                <span>{d.interviewDate}</span>
              </span>

              {d.status === 'PENDING_APPROVAL' ? (
                <button
                  style={{
                    padding: '6px 14px',
                    background: '#1c2d81',
                    color: '#ffffff',
                    border: '1px solid #1c2d81',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    borderRadius: '0px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={() => approveDrive(d.id)}
                >
                  <Check size={13} />
                  <span>Approve Drive Slot</span>
                </button>
              ) : (
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#1c2d81',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Users size={13} />
                  <span>{d.applicantCount} Candidates Registered</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
