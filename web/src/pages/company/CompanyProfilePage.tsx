import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import styles from './CompanyProfilePage.module.css';

export function CompanyProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        if (token) {
          const res = await fetch('/api/v1/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setProfileData(data.data?.companyProfile || null);
          }
        }
      } catch {
        /* fallback */
      }
    }
    loadProfile();
  }, []);

  const profile = profileData?.profile;
  const hiringPref = profileData?.hiringPreferences;
  const companySkills = profileData?.skills || [];
  const representatives = profileData?.representatives || [];

  const companyName = profile?.companyName || user?.name || 'Enterprise Technologies Inc.';
  const initials = companyName
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CO';

  return (
    <div className={styles.page}>
      {/* Profile Header */}
      <section className={styles.profileHeader}>
        <div className={styles.avatarBox}>
          <span>{initials}</span>
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.tierBadge}>Tier 1 Corporate Partner</span>
            <span className={styles.verifiedBadge}>
              <i className="bx bx-check-shield" /> Verified Enterprise
            </span>
          </div>

          <h1 className={styles.companyName}>{companyName}</h1>

          <div className={styles.companyMeta}>
            <span className={styles.metaItem}>
              <i className="bx bx-briefcase" /> {profile?.industry || 'Technology & Software'}
            </span>
            <span className={styles.metaItem}>
              <i className="bx bx-map-pin" /> {profile?.headquarters || 'Bangalore, India'}
            </span>
            <span className={styles.metaItem}>
              <i className="bx bx-globe" /> {profile?.website || 'https://company.beyon.io'}
            </span>
            <span className={styles.metaItem}>
              <i className="bx bx-group" /> {profile?.companySize || '5,000+ Employees'}
            </span>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* About Company */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="bx bx-info-circle" /> Company Overview
            </h3>
            <p className={styles.cardText}>
              {profile?.about ||
                'Leading technology enterprise building scalable AI infrastructure, cloud platforms, and distributed systems. Partnered with top academic institutions for verified merit-based recruitment drives and industrial mentorship programs.'}
            </p>
          </div>

          {/* Hiring Preferences */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="bx bx-target-lock" /> Campus Hiring Policies &amp; Preferences
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Preferred Degree Programs</span>
                <span className={styles.infoValue}>B.E / B.Tech / M.Tech / MCA</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Academic Cutoff Baseline</span>
                <span className={styles.infoValue}>{hiringPref?.minCgpa ? `${hiringPref.minCgpa} CGPA` : '7.50 CGPA'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Target Graduation Batches</span>
                <span className={styles.infoValue}>Class of 2026, 2027</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Assessment Requirement</span>
                <span className={styles.infoValue}>Mandatory Proctored Benchmark</span>
              </div>
            </div>
          </div>

          {/* Required Technology Matrix */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="bx bx-chip" /> Core Tech Stack &amp; Skill Taxonomy
            </h3>
            <div className={styles.skillsList}>
              {companySkills.length > 0 ? (
                companySkills.map((s: any, idx: number) => (
                  <span key={idx} className={styles.skillBadge}>
                    {s.skillName || s}
                  </span>
                ))
              ) : (
                ['Java', 'Spring Boot', 'Python', 'CUDA / GPU Architecture', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'System Design'].map((s) => (
                  <span key={s} className={styles.skillBadge}>
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Aside: Contact & Representatives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="bx bx-envelope" /> Official Contact Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Corporate Email</span>
                <span className={styles.infoValue}>{profile?.officialEmail || user?.email || 'careers@company.com'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Official Phone</span>
                <span className={styles.infoValue}>{profile?.phone || '+91 80 4928 1000'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Headquarters</span>
                <span className={styles.infoValue}>{profile?.headquarters || 'Electronic City, Bangalore, KA'}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="bx bx-user-check" /> Lead Recruitment Representatives
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {representatives.length > 0 ? (
                representatives.map((rep: any, idx: number) => (
                  <div key={idx} style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{rep.name}</span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{rep.designation || 'Head of Campus Talent Acquisition'}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{user?.name || 'Rajesh'}</span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Senior Director of Campus Hiring</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
