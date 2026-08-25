import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api/client';
import type { StudentProfile, StudentSkill, StudentProject, StudentCertification, StudentLink } from '../types/studentProfile';
import styles from './StudentProfilePage.module.css';

interface PublicProfileData {
  profile: StudentProfile;
  skills: StudentSkill[];
  projects: StudentProject[];
  certifications: StudentCertification[];
  links: StudentLink[];
}

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const result = await api.get<PublicProfileData>(`/student/public/${username}`);
        setData(result);
      } catch {
        setError('Profile not found');
      } finally {
        setLoading(false);
      }
    }
    if (username) load();
  }, [username]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ width: 200, height: 24 }} />
          <div className={styles.skeleton} style={{ width: 300, height: 16 }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.section}>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>{error || 'Profile not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { profile, skills, projects, certifications, links } = data;

  return (
    <div className={styles.page}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {profile.profilePhotoUrl ? (
              <img src={profile.profilePhotoUrl} alt="Profile" />
            ) : (profile.username || 'S').substring(0, 2).toUpperCase()}
          </div>
        </div>
        <div className={styles.infoSection}>
          <h1 className={styles.name}>{profile.username || 'Student'}</h1>
          <p className={styles.subtitle}>
            {profile.degree ? `${profile.degree}${profile.department ? ` - ${profile.department}` : ''}` : ''}
          </p>
          {profile.institution && <p className={styles.institution}>{profile.institution}</p>}
          {profile.aboutMe && <p className={styles.aboutText}>{profile.aboutMe}</p>}
        </div>
      </div>

      {skills.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Skills</h3>
          <div className={styles.skillChips}>
            {skills.map(s => (
              <span key={s.id} className={styles.skillChip}>
                <span className={styles.skillChipName}>{s.skillName}</span>
                {s.proficiency && <span className={styles.skillChipProf}>{s.proficiency}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Projects</h3>
          <div className={styles.grid2}>
            {projects.map(p => (
              <div key={p.id} className={styles.projectCard}>
                <p className={styles.projectName}>{p.name}</p>
                {p.description && <p className={styles.projectDesc}>{p.description}</p>}
                {p.technologies && (
                  <div className={styles.projectTech}>
                    {p.technologies.split(/[,·]/).map((t, i) => (
                      <span key={i} className={styles.techTag}>{t.trim()}</span>
                    ))}
                  </div>
                )}
                <div className={styles.projectLinks}>
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>GitHub</a>}
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>Live Demo</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Certifications</h3>
          <div className={styles.grid2}>
            {certifications.map(c => (
              <div key={c.id} className={styles.certCard}>
                <div className={styles.certIcon}>🏆</div>
                <div className={styles.certInfo}>
                  <p className={styles.certName}>{c.name}</p>
                  {c.issuingOrg && <p className={styles.certOrg}>{c.issuingOrg}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Links</h3>
          <div>
            {links.map(l => (
              <div key={l.id} className={styles.linkItem}>
                <span className={styles.linkPlatform}>{l.platform}</span>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className={styles.linkUrl}>{l.url}</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
