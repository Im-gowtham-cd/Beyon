import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import {
  GraduationCap,
  MapPin,
  Globe,
  Users,
  Info,
  Award,
  ShieldCheck,
  Mail,
  UserCheck,
} from 'lucide-react';
import styles from '../company/CompanyProfilePage.module.css';

export function InstitutionProfilePage() {
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
            setProfileData(data.data?.institutionProfile || null);
          }
        }
      } catch {
        /* fallback */
      }
    }
    loadProfile();
  }, []);

  const instName = profileData?.profile?.institutionName || user?.name || 'PSG College of Technology';
  const initials = instName
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CT';

  return (
    <div className={styles.page}>
      {/* Header */}
      <section className={styles.profileHeader}>
        <div className={styles.avatarBox}>
          <span>{initials}</span>
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.tierBadge}>NAAC A++ Autonomous Institute</span>
            <span className={styles.verifiedBadge}>
              <ShieldCheck size={13} />
              <span>NIRF Ranked #53</span>
            </span>
          </div>

          <h1 className={styles.companyName}>{instName}</h1>

          <div className={styles.companyMeta}>
            <span className={styles.metaItem}>
              <GraduationCap size={14} /> Autonomous Higher Education
            </span>
            <span className={styles.metaItem}>
              <MapPin size={14} /> Coimbatore, Tamil Nadu, India
            </span>
            <span className={styles.metaItem}>
              <Globe size={14} /> https://psgtech.edu
            </span>
            <span className={styles.metaItem}>
              <Users size={14} /> 1,420 Enrolled Engineering Scholars
            </span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className={styles.contentGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Institutional Overview */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Info size={18} style={{ color: '#1c2d81' }} />
              <span>Institutional Overview</span>
            </h3>
            <p className={styles.cardText}>
              Premier autonomous technological institution established in 1951, accredited with NAAC A++ and ranked among the Top 100 Engineering Institutions in India by NIRF. Known for academic excellence, state-of-the-art research laboratories, and verified corporate placement outcomes.
            </p>
          </div>

          {/* Academic Accreditations & Key Ratings */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Award size={18} style={{ color: '#1c2d81' }} />
              <span>Accreditations &amp; Institutional Governance</span>
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NAAC Accreditation</span>
                <span className={styles.infoValue}>Grade A++ (Score 3.78)</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NIRF National Ranking</span>
                <span className={styles.infoValue}>Rank #53 (Engineering)</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Affiliating University</span>
                <span className={styles.infoValue}>Anna University, Chennai</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Autonomy Status</span>
                <span className={styles.infoValue}>UGC Conferred Autonomous</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Aside */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Mail size={18} style={{ color: '#1c2d81' }} />
              <span>Placement Cell Contact</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Office Email</span>
                <span className={styles.infoValue}>placement@psgtech.edu</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Placement Hotline</span>
                <span className={styles.infoValue}>+91 422 257 2177</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Campus Address</span>
                <span className={styles.infoValue}>Avinashi Road, Peelamedu, Coimbatore - 641004</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <UserCheck size={18} style={{ color: '#1c2d81' }} />
              <span>Authorized Placement Officers</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{user?.name || 'Dr. R. Rajesh Kumar'}</span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Head of Training &amp; Corporate Relations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
