import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api } from '../../services/api/client';
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
  Phone,
} from 'lucide-react';
import styles from '../company/CompanyProfilePage.module.css';

export function InstitutionProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        if (token) {
          let data: any = null;
          try {
            data = await api.get('/profile');
          } catch {
            const res = await fetch('/api/v1/profile', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const json = await res.json();
              data = json.data;
            }
          }

          if (isMounted && data) {
            const instData = data.institutionProfile || data;
            setProfileData(instData);
          }
        }
      } catch {

      }
    }
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  const rawProfile = profileData?.profile || (profileData?.institutionName ? profileData : {});

  const instName = rawProfile.institutionName || user?.name || 'Beyon Engineering College';
  const initials =
    instName
      .split(' ')
      .filter(Boolean)
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'BE';

  const institutionType = rawProfile.institutionType || 'UGC Autonomous Engineering Institute';
  const institutionCode = rawProfile.institutionCode || 'C-68012';

  const locationParts = [rawProfile.city, rawProfile.state, rawProfile.country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(', ') : 'Erode, Tamil Nadu, India';

  const website = rawProfile.website || 'https://repofy-application.vercel.app/';
  const studentNum = rawProfile.totalStudents || 5000;
  const enrolledCount = `${studentNum.toLocaleString()} Enrolled Scholars`;

  const accreditationGrade = rawProfile.accreditationGrade || 'A++';
  const naacAccreditation = `NAAC Grade ${accreditationGrade}`;
  const affiliatedUniversity = rawProfile.affiliatedUniversity || 'Anna University , Chennai';
  const establishedYear = rawProfile.establishedYear || 2005;

  const autonomyStatus =
    rawProfile.autonomyStatus ||
    (institutionType.toLowerCase().includes('autonomous')
      ? 'Autonomous (UGC Approved)'
      : 'Autonomous');

  const overview =
    rawProfile.about ||
    rawProfile.description ||
    `${instName} is a premier ${institutionType} affiliated with ${affiliatedUniversity}, established in ${establishedYear}. Accredited with ${naacAccreditation}, the institution provides cutting-edge technical education, structured industry-readiness programs, and transparent campus placement governance for over ${studentNum.toLocaleString()} enrolled scholars.`;

  const officeEmail = rawProfile.officialEmail || user?.email || 'beyonengineeringcollege@beyon.init';
  const phone = rawProfile.phone || '226555';

  const campusAddress = rawProfile.address
    ? `${rawProfile.address}${rawProfile.postalCode ? `, PIN: ${rawProfile.postalCode.trim()}` : ''}`
    : 'Perundurai, Erode, Tamil Nadu, PIN: 638060';

  const representatives = profileData?.representatives || [];

  return (
    <div className={styles.page}>

      <section className={styles.profileHeader}>
        <div className={styles.avatarBox}>
          <span>{initials}</span>
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.tierBadge}>
              {naacAccreditation}
            </span>
            <span className={styles.verifiedBadge}>
              <ShieldCheck size={13} />
              <span>Verified Academic Partner</span>
            </span>
            <span className={styles.tierBadge} style={{ background: '#f8fafc', color: '#334155', borderColor: '#cbd5e1' }}>
              AISHE: {institutionCode}
            </span>
            <span className={styles.tierBadge} style={{ background: '#f8fafc', color: '#334155', borderColor: '#cbd5e1' }}>
              Est. {establishedYear}
            </span>
          </div>

          <h1 className={styles.companyName}>{instName}</h1>

          <div className={styles.companyMeta}>
            <span className={styles.metaItem}>
              <GraduationCap size={14} /> {institutionType}
            </span>
            <span className={styles.metaItem}>
              <MapPin size={14} /> {location}
            </span>
            <span className={styles.metaItem}>
              <Globe size={14} />{' '}
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                {website}
              </a>
            </span>
            <span className={styles.metaItem}>
              <Users size={14} /> {enrolledCount}
            </span>
          </div>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Info size={18} style={{ color: '#1c2d81' }} />
              <span>Institutional Overview</span>
            </h3>
            <p className={styles.cardText}>{overview}</p>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Award size={18} style={{ color: '#1c2d81' }} />
              <span>Accreditations &amp; Institutional Governance</span>
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NAAC Accreditation</span>
                <span className={styles.infoValue} style={{ fontWeight: 600, color: '#1e40af' }}>
                  {naacAccreditation}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Affiliating University</span>
                <span className={styles.infoValue}>{affiliatedUniversity}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Governance &amp; Autonomy</span>
                <span className={styles.infoValue}>{autonomyStatus}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>AISHE Institution Code</span>
                <span className={styles.infoValue}>{institutionCode}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Established Year</span>
                <span className={styles.infoValue}>
                  {establishedYear} ({new Date().getFullYear() - establishedYear} Years of Excellence)
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Institutional Category</span>
                <span className={styles.infoValue}>{institutionType}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Mail size={18} style={{ color: '#1c2d81' }} />
              <span>Placement Cell Contact</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Office Email</span>
                <a
                  href={`mailto:${officeEmail}`}
                  className={styles.infoValue}
                  style={{ color: '#1c2d81', wordBreak: 'break-all' }}
                >
                  {officeEmail}
                </a>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Placement Hotline</span>
                <span className={styles.infoValue}>
                  <Phone size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: '#1c2d81' }} />
                  {phone}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Campus Address</span>
                <span className={styles.infoValue}>{campusAddress}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <UserCheck size={18} style={{ color: '#1c2d81' }} />
              <span>Authorized Placement Officers</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {representatives.length > 0 ? (
                representatives.map((rep: any, idx: number) => (
                  <div
                    key={rep.id || idx}
                    style={{
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    }}
                  >
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                      {rep.name || rep.fullName || 'Authorized Officer'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {rep.designation || rep.role || 'Placement Representative'}
                    </span>
                    {rep.email && (
                      <span style={{ fontSize: '0.72rem', color: '#1c2d81' }}>{rep.email}</span>
                    )}
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: '12px 14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a' }}>
                    {user?.name || instName}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    Authorized Institutional Representative &amp; Placement Cell Head
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#1c2d81', marginTop: '2px' }}>
                    {officeEmail} &bull; Hotline: {phone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

