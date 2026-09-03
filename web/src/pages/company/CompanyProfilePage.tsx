import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Briefcase,
  MapPin,
  Globe,
  Users,
  Info,
  Target,
  Cpu,
  Mail,
  ShieldCheck,
  Clock,
  UserCheck,
} from 'lucide-react';
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

  const companyName = profile?.companyName || user?.name || 'Company Account';
  const initials = companyName
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CO';

  const status = (user as any)?.status || (profile?.status) || 'ACTIVE';
  const isPending = status === 'PENDING_SUPER_ADMIN_VERIFICATION';

  return (
    <div className={styles.page}>
      {/* Profile Header */}
      <section className={styles.profileHeader}>
        <div className={styles.avatarBox}>
          <span>{initials}</span>
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.badgeRow}>
            {isPending ? (
              <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '3px 8px', background: '#fef3c7', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} />
                <span>Verification Pending</span>
              </span>
            ) : (
              <span className={styles.verifiedBadge}>
                <ShieldCheck size={13} />
                <span>Verified Enterprise</span>
              </span>
            )}
          </div>

          <h1 className={styles.companyName}>{companyName}</h1>

          <div className={styles.companyMeta}>
            <span className={styles.metaItem}>
              <Briefcase size={14} /> {profile?.industry || 'Industry: Not provided'}
            </span>
            <span className={styles.metaItem}>
              <MapPin size={14} /> {profile?.headquarters || profile?.address || 'Location: Not provided'}
            </span>
            <span className={styles.metaItem}>
              <Globe size={14} /> {profile?.website ? <a href={profile.website} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{profile.website}</a> : 'Website: Not provided'}
            </span>
            <span className={styles.metaItem}>
              <Users size={14} /> {profile?.companySize ? `${profile.companySize} Employees` : 'Size: Not provided'}
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
              <Info size={18} style={{ color: '#1c2d81' }} />
              <span>Company Overview</span>
            </h3>
            <p className={styles.cardText}>
              {profile?.about || profile?.description || 'No company overview provided yet.'}
            </p>
          </div>

          {/* Hiring Preferences */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Target size={18} style={{ color: '#1c2d81' }} />
              <span>Campus Hiring Policies &amp; Preferences</span>
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Preferred Degree Programs</span>
                <span className={styles.infoValue}>{hiringPref?.preferredDegrees || profile?.preferredDegrees || 'Not provided'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Academic Cutoff Baseline</span>
                <span className={styles.infoValue}>{hiringPref?.minCgpa ? `${hiringPref.minCgpa} CGPA` : profile?.minCgpa ? `${profile.minCgpa} CGPA` : 'Not set'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Target Graduation Batches</span>
                <span className={styles.infoValue}>{hiringPref?.targetBatches || profile?.eligibleBatches || 'Not specified'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Assessment Requirement</span>
                <span className={styles.infoValue}>{profile?.assessmentRequirement || 'Standard Technical Assessment'}</span>
              </div>
            </div>
          </div>

          {/* Required Technology Matrix */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Cpu size={18} style={{ color: '#1c2d81' }} />
              <span>Core Tech Stack &amp; Skill Taxonomy</span>
            </h3>
            <div className={styles.skillsList}>
              {companySkills.length > 0 ? (
                companySkills.map((s: any, idx: number) => (
                  <span key={idx} className={styles.skillBadge}>
                    {s.skillName || s}
                  </span>
                ))
              ) : profile?.skills ? (
                profile.skills.split(',').map((s: string) => (
                  <span key={s.trim()} className={styles.skillBadge}>
                    {s.trim()}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No skill taxonomy configured yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Aside: Contact & Representatives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Mail size={18} style={{ color: '#1c2d81' }} />
              <span>Official Contact Info</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Corporate Email</span>
                <span className={styles.infoValue}>{profile?.officialEmail || user?.email || 'Not provided'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Official Phone</span>
                <span className={styles.infoValue}>{profile?.phone || 'Not provided'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Headquarters</span>
                <span className={styles.infoValue}>{profile?.headquarters || profile?.address || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <UserCheck size={18} style={{ color: '#1c2d81' }} />
              <span>Lead Recruitment Representatives</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {representatives.length > 0 ? (
                representatives.map((rep: any, idx: number) => (
                  <div key={idx} style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{rep.name}</span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{rep.designation || 'Recruitment Officer'}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{user?.name || 'Primary Recruiter'}</span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Corporate Representative</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
