import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Download,
} from 'lucide-react';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

interface PlacementRecord {
  id: string;
  studentName: string;
  rollNo: string;
  dept: string;
  companyName: string;
  roleTitle: string;
  packageLpa: number;
  offerDate: string;
  verified: boolean;
}

export function InstitutionPlacementsPage() {
  const [records] = useState<PlacementRecord[]>([
    {
      id: 'pl-01',
      studentName: 'Sneha Sundaram',
      rollNo: '22CS120',
      dept: 'Computer Science & Engg.',
      companyName: 'NVIDIA GPU Acceleration Lab',
      roleTitle: 'CUDA Systems Engineer',
      packageLpa: 28.5,
      offerDate: 'Aug 24, 2026',
      verified: true,
    },
    {
      id: 'pl-02',
      studentName: 'Aravind Swaminathan',
      rollNo: '22CS104',
      dept: 'Computer Science & Engg.',
      companyName: 'Amazon Web Services',
      roleTitle: 'Software Development Engineer',
      packageLpa: 24.0,
      offerDate: 'Aug 20, 2026',
      verified: true,
    },
    {
      id: 'pl-03',
      studentName: 'Divya Ramesh',
      rollNo: '22AI082',
      dept: 'AI & Data Science',
      companyName: 'Qualcomm Technologies',
      roleTitle: 'AI Kernel Optimization Engineer',
      packageLpa: 21.5,
      offerDate: 'Aug 18, 2026',
      verified: true,
    },
    {
      id: 'pl-04',
      studentName: 'Karthik Subramanian',
      rollNo: '22IT045',
      dept: 'Information Technology',
      companyName: 'Enterprise Cloud Technologies',
      roleTitle: 'Cloud Platform Engineer',
      packageLpa: 16.0,
      offerDate: 'Aug 12, 2026',
      verified: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filtered = records.filter(
    (r) =>
      !searchQuery ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Campus Placement Records &amp; Offer Ledger</h1>
          <p className={styles.subtitle}>
            Verified institutional repository of employment offers, CTC packages, and recruitment partner audits
          </p>
        </div>
        <button
          className={styles.btnSecondary}
          onClick={() => alert('Exporting NAAC/NIRF Compliant Placement Ledger PDF...')}
        >
          <Download size={15} />
          <span>Export Accreditation Ledger</span>
        </button>
      </div>

      {/* 4 Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Verified Offers</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            182 Placed
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Highest CTC Package</span>
          <span className={styles.statValue} style={{ color: '#1c2d81' }}>
            28.5 LPA
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average Salary Package</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            18.2 LPA
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tier 1 Corporate Offers</span>
          <span className={styles.statValue} style={{ color: '#7c3aed' }}>
            78.4%
          </span>
        </div>
      </div>

      {/* Search */}
      <div className={styles.filterRow}>
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
            placeholder="Search placed candidate, company, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Roll No</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Candidate</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Department</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Hiring Corporate</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Role</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Package</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Offer Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px' }}><code>{r.rollNo}</code></td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{r.studentName}</td>
                <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 400 }}>{r.dept}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1c2d81' }}>{r.companyName}</td>
                <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 400 }}>{r.roleTitle}</td>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: '#15803d' }}>{r.packageLpa} LPA</td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 400 }}>{r.offerDate}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '0px',
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Verified Offer</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
