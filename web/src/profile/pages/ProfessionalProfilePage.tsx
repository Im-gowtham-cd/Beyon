import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './ProfilePages.module.css';

export function ProfessionalProfilePage() {
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/professional/profile').catch(() => ({})),
      api.get('/professional/endorsements/my').catch(() => []),
      api.get('/professional/projects/my').catch(() => []),
      api.get('/professional/resume/my').catch(() => []),
    ]).then(([p, e, proj, r]) => {
      setProfile(p);
      setCertificates((p as any)?.certificates || []);
      setEndorsements(Array.isArray(e) ? e : []);
      setProjects(Array.isArray(proj) ? proj : []);
      setResumes(Array.isArray(r) ? r : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateProfile = async (updates: any) => {
    const result = await api.post('/professional/profile', updates);
    setProfile(result);
  };

  const generateResume = async () => {
    const result = await api.post('/professional/resume/generate', {});
    setResumes(prev => [result, ...prev]);
  };

  const addProject = async (project: any) => {
    const result = await api.post('/professional/projects', project);
    setProjects(prev => [...prev, result]);
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading professional profile...</div></div>;

  const p = profile?.profile;
  const skills = profile?.skillCount || 0;
  const certCount = profile?.certificates?.length || 0;
  const projCount = profile?.projectCount || 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Professional Profile</h1>
          <p className={styles.subtitle}>Build your verified professional identity</p>
        </div>
      </div>

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileName}>{p?.headline || 'Your Professional Headline'}</div>
        <div className={styles.profileAbout}>{p?.about || 'Add a professional summary to make your profile stand out.'}</div>
        <div className={styles.profileStats}>
          <div className={styles.profileStat}><span className={styles.profileStatValue}>{skills}</span><span className={styles.profileStatLabel}>Skills</span></div>
          <div className={styles.profileStat}><span className={styles.profileStatValue}>{certCount}</span><span className={styles.profileStatLabel}>Certificates</span></div>
          <div className={styles.profileStat}><span className={styles.profileStatValue}>{projCount}</span><span className={styles.profileStatLabel}>Projects</span></div>
          <div className={styles.profileStat}><span className={styles.profileStatValue}>{endorsements.length}</span><span className={styles.profileStatLabel}>Endorsements</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabRow}>
        {['overview', 'certificates', 'endorsements', 'portfolio', 'resume', 'settings'].map(t => (
          <button key={t} className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className={styles.tabContent}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Profile Links</h3>
            <div className={styles.linkGrid}>
              <div className={styles.linkItem}>
                <label className={styles.label}>Headline</label>
                <input className={styles.input} value={p?.headline || ''} onChange={e => updateProfile({ headline: e.target.value })} placeholder="e.g., Full Stack Developer" />
              </div>
              <div className={styles.linkItem}>
                <label className={styles.label}>About</label>
                <textarea className={styles.input} value={p?.about || ''} onChange={e => updateProfile({ about: e.target.value })} rows={3} placeholder="Write a professional summary..." />
              </div>
              <div className={styles.linkItem}>
                <label className={styles.label}>GitHub</label>
                <input className={styles.input} value={p?.githubUrl || ''} onChange={e => updateProfile({ githubUrl: e.target.value })} placeholder="https://github.com/username" />
              </div>
              <div className={styles.linkItem}>
                <label className={styles.label}>LinkedIn</label>
                <input className={styles.input} value={p?.linkedinUrl || ''} onChange={e => updateProfile({ linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/username" />
              </div>
              <div className={styles.linkItem}>
                <label className={styles.label}>Location</label>
                <input className={styles.input} value={p?.location || ''} onChange={e => updateProfile({ location: e.target.value })} placeholder="City, Country" />
              </div>
              <div className={styles.linkItem}>
                <label className={styles.label}>Visibility</label>
                <select className={styles.input} value={p?.visibility || 'PUBLIC'} onChange={e => updateProfile({ visibility: e.target.value })}>
                  <option value="PUBLIC">Public</option>
                  <option value="COMPANIES_ONLY">Companies Only</option>
                  <option value="INSTITUTION_ONLY">Institution Only</option>
                  <option value="FOLLOWERS">Followers Only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificates */}
      {tab === 'certificates' && (
        <div className={styles.tabContent}>
          {certificates.length > 0 ? (
            <div className={styles.cardGrid}>
              {certificates.map(c => (
                <div className={styles.card} key={c.id}>
                  <div className={styles.cardTitle}>{c.title}</div>
                  <div className={styles.cardMeta}>Issued by {c.issuerName}</div>
                  {c.score && <div className={styles.cardScore}>Score: {c.score}%</div>}
                  <div className={styles.cardMeta}>ID: {c.certificateNumber}</div>
                  {c.skillsCovered && <div className={styles.cardMeta}>Skills: {c.skillsCovered}</div>}
                  <div className={styles.cardMeta}>Status: <span className={styles.verifiedBadge}>{c.verificationStatus}</span></div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No certificates yet. Complete assessments and programs to earn certificates.</div>
          )}
        </div>
      )}

      {/* Endorsements */}
      {tab === 'endorsements' && (
        <div className={styles.tabContent}>
          {endorsements.length > 0 ? (
            <div className={styles.cardGrid}>
              {endorsements.map(e => (
                <div className={styles.card} key={e.id}>
                  <div className={styles.cardTitle}>{e.endorserName || 'Anonymous'}</div>
                  <div className={styles.cardMeta}>Type: {e.endorserType}</div>
                  <div className={styles.cardMeta}>Level: <span className={styles.verifiedBadge}>{e.endorsementLevel}</span></div>
                  {e.evidenceDescription && <div className={styles.cardMeta}>{e.evidenceDescription}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No endorsements yet. Mentors and recruiters can endorse your skills.</div>
          )}
        </div>
      )}

      {/* Portfolio */}
      {tab === 'portfolio' && (
        <div className={styles.tabContent}>
          <button className={styles.btnPrimary} onClick={() => addProject({ title: 'New Project', description: 'Add details...' })}>+ Add Project</button>
          {projects.length > 0 ? (
            <div className={styles.cardGrid} style={{ marginTop: '1rem' }}>
              {projects.map(proj => (
                <div className={styles.card} key={proj.id}>
                  <div className={styles.cardTitle}>{proj.title}</div>
                  <div className={styles.cardMeta}>{proj.description}</div>
                  {proj.skillsUsed && <div className={styles.cardMeta}>Skills: {proj.skillsUsed}</div>}
                  <div className={styles.cardMeta}>Status: <span className={styles.verifiedBadge}>{proj.verificationStatus}</span></div>
                  {proj.githubUrl && <div className={styles.cardMeta}>GitHub: {proj.githubUrl}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No projects added yet. Build your portfolio to showcase your work.</div>
          )}
        </div>
      )}

      {/* Resume */}
      {tab === 'resume' && (
        <div className={styles.tabContent}>
          <button className={styles.btnPrimary} onClick={generateResume}>Generate Resume</button>
          {resumes.length > 0 ? (
            <div className={styles.cardGrid} style={{ marginTop: '1rem' }}>
              {resumes.map(r => (
                <div className={styles.card} key={r.id}>
                  <div className={styles.cardTitle}>{r.title || 'My Resume'}</div>
                  <div className={styles.cardMeta}>Status: {r.generationStatus}</div>
                  <div className={styles.cardMeta}>Generated: {new Date(r.createdAt).toLocaleDateString()}</div>
                  {r.fileUrl && <a href={r.fileUrl} className={styles.link} target="_blank" rel="noopener noreferrer">Download</a>}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No resumes generated yet. Generate your first resume from your verified Beyon data.</div>
          )}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className={styles.tabContent}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Profile Visibility</h3>
            <p className={styles.cardMeta}>Control who can see your professional profile and what information is shared.</p>
            <div style={{ marginTop: '1rem' }}>
              <select className={styles.input} value={p?.visibility || 'PUBLIC'} onChange={e => updateProfile({ visibility: e.target.value })} style={{ maxWidth: 300 }}>
                <option value="PUBLIC">Public — Anyone can view</option>
                <option value="COMPANIES_ONLY">Companies Only — Recruiter context</option>
                <option value="INSTITUTION_ONLY">Institution Only — Your institution</option>
                <option value="FOLLOWERS">Followers Only — People you follow back</option>
                <option value="PRIVATE">Private — Only you</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
