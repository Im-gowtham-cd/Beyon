import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { studentProfileApi } from '../services/studentProfileApi';
import type {
  StudentProfile, StudentSkill, StudentProject, StudentCertification,
  StudentAchievement, StudentLink, StudentLearningSkill, StudentCareerPreferences
} from '../types/studentProfile';
import styles from './StudentProfilePage.module.css';

type Tab = 'overview' | 'academic' | 'skills' | 'projects' | 'certifications' | 'achievements' | 'career' | 'links';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'academic', label: 'Academic' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'career', label: 'Career' },
  { id: 'links', label: 'Links' },
];

export function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [certs, setCerts] = useState<StudentCertification[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [links, setLinks] = useState<StudentLink[]>([]);
  const [learningSkills, setLearningSkills] = useState<StudentLearningSkill[]>([]);
  const [careerPrefs, setCareerPrefs] = useState<StudentCareerPreferences | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [p, s, pr, c, a, l, ls, cp] = await Promise.all([
        studentProfileApi.getProfile(),
        studentProfileApi.getSkills(),
        studentProfileApi.getProjects(),
        studentProfileApi.getCertifications(),
        studentProfileApi.getAchievements(),
        studentProfileApi.getLinks(),
        studentProfileApi.getLearningSkills(),
        studentProfileApi.getCareerPreferences(),
      ]);
      setProfile(p);
      setSkills(s);
      setProjects(pr);
      setCerts(c);
      setAchievements(a);
      setLinks(l);
      setLearningSkills(ls);
      setCareerPrefs(cp);
    } catch (err) {
      setError('Unable to load your profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ width: 200, height: 24 }} />
          <div className={styles.skeleton} style={{ width: 300, height: 16 }} />
          <div className={styles.skeleton} style={{ width: 160, height: 16 }} />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.page}>
        <div className={styles.section}>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>{error || 'Profile not found'}</p>
            <button className={styles.sectionAction} onClick={loadProfile}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const completion = profile.completionPct;
  const initials = (profile.institution || 'S').substring(0, 2).toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {profile.profilePhotoUrl ? (
              <img src={profile.profilePhotoUrl} alt="Profile" />
            ) : initials}
          </div>
        </div>
        <div className={styles.infoSection}>
          <h1 className={styles.name}>{profile.username || profile.institution || 'Student'}</h1>
          <p className={styles.subtitle}>
            {profile.degree ? `${profile.degree} ${profile.department ? `- ${profile.department}` : ''}` : 'Student'}
          </p>
          {profile.institution && <p className={styles.institution}>{profile.institution}</p>}
          <div className={styles.statusRow}>
            {profile.placementPreference && (
              <span className={`${styles.statusBadge} ${profile.placementPreference === 'PLACEMENT_WILLING' ? styles.placementBadge : styles.notSeekingBadge}`}>
                {profile.placementPreference === 'PLACEMENT_WILLING' ? '● Open to Placement' : '● Not Seeking'}
              </span>
            )}
            <span className={`${styles.statusBadge} ${styles.placementBadge}`}>
              ● {completion}% Complete
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link to="/settings" className={styles.editBtn}>Edit Profile</Link>
          <button className={styles.shareBtn} onClick={() => navigator.clipboard?.writeText(window.location.href)}>
            Share Profile
          </button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Profile Strength</span>
          <span className={styles.statValue}>{completion}%</span>
          <div className={styles.statBar}>
            <div className={styles.statBarFill} style={{ width: `${completion}%` }} />
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Skills</span>
          <span className={styles.statValue}>{skills.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Projects</span>
          <span className={styles.statValue}>{projects.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Certifications</span>
          <span className={styles.statValue}>{certs.length}</span>
        </div>
      </div>

      <nav className={styles.tabsNav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <OverviewSection profile={profile} skills={skills} learningSkills={learningSkills} careerPrefs={careerPrefs} />
      )}
      {activeTab === 'academic' && (
        <AcademicSection profile={profile} />
      )}
      {activeTab === 'skills' && (
        <SkillsSection
          skills={skills}
          learningSkills={learningSkills}
          onReload={loadProfile}
        />
      )}
      {activeTab === 'projects' && (
        <ProjectsSection projects={projects} onReload={loadProfile} />
      )}
      {activeTab === 'certifications' && (
        <CertificationsSection certs={certs} onReload={loadProfile} />
      )}
      {activeTab === 'achievements' && (
        <AchievementsSection achievements={achievements} onReload={loadProfile} />
      )}
      {activeTab === 'career' && (
        <CareerSection careerPrefs={careerPrefs} onReload={loadProfile} />
      )}
      {activeTab === 'links' && (
        <LinksSection links={links} onReload={loadProfile} />
      )}
    </div>
  );
}

function OverviewSection({ profile, skills, learningSkills, careerPrefs }: {
  profile: StudentProfile;
  skills: StudentSkill[];
  learningSkills: StudentLearningSkill[];
  careerPrefs: StudentCareerPreferences | null;
}) {
  return (
    <>
      {profile.aboutMe && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>About</h3>
          <p className={styles.aboutText}>{profile.aboutMe}</p>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Top Skills</h3>
        {skills.length === 0 ? (
          <p className={styles.emptyText}>No skills added yet</p>
        ) : (
          <div className={styles.skillChips}>
            {skills.slice(0, 10).map(s => (
              <span key={s.id} className={styles.skillChip}>
                <span className={styles.skillChipName}>{s.skillName}</span>
                {s.proficiency && <span className={styles.skillChipProf}>{s.proficiency}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {learningSkills.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Currently Learning</h3>
          <div className={styles.skillChips}>
            {learningSkills.map(ls => (
              <span key={ls.id} className={styles.learningChip}>{ls.skillName}</span>
            ))}
          </div>
        </div>
      )}

      {careerPrefs && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Career Preferences</h3>
          <div className={styles.grid2}>
            {careerPrefs.preferredWorkType && (
              <div className={styles.careerField}>
                <span className={styles.careerLabel}>Work Type</span>
                <span className={styles.careerValue}>{careerPrefs.preferredWorkType}</span>
              </div>
            )}
            {careerPrefs.preferredRoles && (
              <div className={styles.careerField}>
                <span className={styles.careerLabel}>Job Roles</span>
                <span className={styles.careerValue}>{careerPrefs.preferredRoles}</span>
              </div>
            )}
            {careerPrefs.careerGoal && (
              <div className={styles.careerField}>
                <span className={styles.careerLabel}>Career Goal</span>
                <span className={styles.careerValue}>{careerPrefs.careerGoal}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Beyon Coins</h3>
        <p className={styles.emptyText}>Coming soon</p>
      </div>
    </>
  );
}

function AcademicSection({ profile }: { profile: StudentProfile }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Academic Information</h3>
      <div className={styles.grid2}>
        <div className={styles.careerField}>
          <span className={styles.careerLabel}>Institution</span>
          <span className={styles.careerValue}>{profile.institution || '—'}</span>
        </div>
        <div className={styles.careerField}>
          <span className={styles.careerLabel}>Degree</span>
          <span className={styles.careerValue}>{profile.degree || '—'}</span>
        </div>
        <div className={styles.careerField}>
          <span className={styles.careerLabel}>Department</span>
          <span className={styles.careerValue}>{profile.department || '—'}</span>
        </div>
        <div className={styles.careerField}>
          <span className={styles.careerLabel}>Academic Year</span>
          <span className={styles.careerValue}>{profile.academicYear || '—'}</span>
        </div>
        <div className={styles.careerField}>
          <span className={styles.careerLabel}>Graduation Year</span>
          <span className={styles.careerValue}>{profile.graduationYear || '—'}</span>
        </div>
        <div className={styles.careerField}>
          <span className={styles.careerLabel}>CGPA</span>
          <span className={styles.careerValue}>{profile.cgpa || '—'}</span>
        </div>
      </div>
    </div>
  );
}

function SkillsSection({ skills, learningSkills, onReload }: {
  skills: StudentSkill[];
  learningSkills: StudentLearningSkill[];
  onReload: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [proficiency, setProficiency] = useState('BEGINNER');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleAddSkills() {
    if (selectedSkills.length === 0) return;
    setSaving(true);
    try {
      for (const name of selectedSkills) {
        await studentProfileApi.addSkill({ skillName: name, proficiency });
      }
      setShowAdd(false);
      setSearch('');
      setSelectedSkills([]);
      onReload();
    } catch { /* */ }
    setSaving(false);
  }

  async function handleRemove(id: string) {
    await studentProfileApi.removeSkill(id);
    onReload();
  }



  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Skills ({skills.length})</h3>
        <button className={styles.sectionAction} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Skills'}
        </button>
      </div>

      {showAdd && (
        <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              placeholder="Search skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {selectedSkills.length > 0 && (
            <div className={styles.skillChips}>
              {selectedSkills.map(name => (
                <span key={name} className={styles.skillChip}>
                  {name}
                  <button className={styles.skillChipRemove} onClick={() => setSelectedSkills(prev => prev.filter(s => s !== name))}>×</button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <select className={styles.formSelect} value={proficiency} onChange={e => setProficiency(e.target.value)}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
            <button className={styles.saveBtn} disabled={selectedSkills.length === 0 || saving} onClick={handleAddSkills}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {skills.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No skills added yet. Add the technologies you know.</p>
          <button className={styles.sectionAction} onClick={() => setShowAdd(true)}>+ Add Skills</button>
        </div>
      ) : (
        <div className={styles.skillChips}>
          {skills.map(s => (
            <span key={s.id} className={styles.skillChip}>
              <span className={styles.skillChipName}>{s.skillName}</span>
              {s.proficiency && <span className={styles.skillChipProf}>{s.proficiency}</span>}
              {s.verified && <span className={styles.skillChipProf}>✓</span>}
              <button className={styles.skillChipRemove} onClick={() => handleRemove(s.id)}>×</button>
            </span>
          ))}
        </div>
      )}

      {learningSkills.length > 0 && (
        <>
          <h3 className={styles.sectionTitle} style={{ marginTop: 'var(--space-xl)' }}>Currently Learning</h3>
          <div className={styles.skillChips}>
            {learningSkills.map(ls => (
              <span key={ls.id} className={styles.learningChip}>
                {ls.skillName}
                <button className={styles.skillChipRemove} onClick={async () => {
                  await studentProfileApi.removeLearningSkill(ls.id);
                  onReload();
                }} style={{ color: 'var(--color-info)' }}>×</button>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectsSection({ projects, onReload }: { projects: StudentProject[]; onReload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<StudentProject | null>(null);
  const [form, setForm] = useState({ name: '', description: '', role: '', technologies: '', githubUrl: '', liveUrl: '' });
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setForm({ name: '', description: '', role: '', technologies: '', githubUrl: '', liveUrl: '' });
    setEditProject(null);
    setShowForm(false);
  }

  function openEdit(p: StudentProject) {
    setEditProject(p);
    setForm({ name: p.name, description: p.description || '', role: p.role || '', technologies: p.technologies || '', githubUrl: p.githubUrl || '', liveUrl: p.liveUrl || '' });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editProject) {
        await studentProfileApi.updateProject(editProject.id, form);
      } else {
        await studentProfileApi.addProject(form);
      }
      resetForm();
      onReload();
    } catch { /* */ }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await studentProfileApi.removeProject(id);
    onReload();
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Projects ({projects.length})</h3>
        <button className={styles.sectionAction} onClick={() => { resetForm(); setShowForm(true); }}>+ Add Project</button>
      </div>

      {showForm && (
        <div className={styles.modalOverlay} onClick={resetForm}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editProject ? 'Edit Project' : 'Add Project'}</h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Name *</label>
              <input className={styles.formInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project name" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea className={styles.formTextarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does this project do?" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Role</label>
              <input className={styles.formInput} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Frontend Developer" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Technologies</label>
              <input className={styles.formInput} value={form.technologies} onChange={e => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js, MongoDB" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>GitHub URL</label>
              <input className={styles.formInput} value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Live URL</label>
              <input className={styles.formInput} value={form.liveUrl} onChange={e => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={resetForm}>Cancel</button>
              <button className={styles.saveBtn} disabled={saving || !form.name.trim()} onClick={handleSave}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No projects yet. Showcase the work you're proud of.</p>
          <button className={styles.sectionAction} onClick={() => setShowForm(true)}>+ Add Project</button>
        </div>
      ) : (
        <div className={styles.grid2}>
          {projects.map(p => (
            <div key={p.id} className={styles.projectCard}>
              <p className={styles.projectName}>
                {p.name}
                {p.featured && <span className={styles.featuredBadge}>Featured</span>}
              </p>
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
              <div className={styles.projectActions}>
                <button className={styles.actionBtn} onClick={() => openEdit(p)}>Edit</button>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CertificationsSection({ certs, onReload }: { certs: StudentCertification[]; onReload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', issuingOrg: '', credentialUrl: '', credentialId: '' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await studentProfileApi.addCertification(form);
      setShowForm(false);
      setForm({ name: '', issuingOrg: '', credentialUrl: '', credentialId: '' });
      onReload();
    } catch { /* */ }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await studentProfileApi.removeCertification(id);
    onReload();
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Certifications ({certs.length})</h3>
        <button className={styles.sectionAction} onClick={() => setShowForm(true)}>+ Add Certification</button>
      </div>

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Add Certification</h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Certification Name *</label>
              <input className={styles.formInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. AWS Solutions Architect" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Issuing Organization</label>
              <input className={styles.formInput} value={form.issuingOrg} onChange={e => setForm({ ...form, issuingOrg: e.target.value })} placeholder="e.g. Amazon Web Services" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Credential URL</label>
              <input className={styles.formInput} value={form.credentialUrl} onChange={e => setForm({ ...form, credentialUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Credential ID</label>
              <input className={styles.formInput} value={form.credentialId} onChange={e => setForm({ ...form, credentialId: e.target.value })} placeholder="e.g. ABC123XYZ" />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.saveBtn} disabled={saving || !form.name.trim()} onClick={handleSave}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {certs.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No certifications added yet.</p>
          <button className={styles.sectionAction} onClick={() => setShowForm(true)}>+ Add Certification</button>
        </div>
      ) : (
        <div className={styles.grid2}>
          {certs.map(c => (
            <div key={c.id} className={styles.certCard}>
              <div className={styles.certIcon}>🏆</div>
              <div className={styles.certInfo}>
                <p className={styles.certName}>{c.name}</p>
                {c.issuingOrg && <p className={styles.certOrg}>{c.issuingOrg}</p>}
                <span className={`${styles.certStatus} ${c.status === 'VERIFIED' ? styles.statusVerified : styles.statusPending}`}>
                  {c.status === 'VERIFIED' ? '✓ Verified' : 'Pending'}
                </span>
              </div>
              <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(c.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AchievementsSection({ achievements, onReload }: { achievements: StudentAchievement[]; onReload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'OTHER', organization: '' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await studentProfileApi.addAchievement(form);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'OTHER', organization: '' });
      onReload();
    } catch { /* */ }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await studentProfileApi.removeAchievement(id);
    onReload();
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Achievements ({achievements.length})</h3>
        <button className={styles.sectionAction} onClick={() => setShowForm(true)}>+ Add Achievement</button>
      </div>

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Add Achievement</h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Title *</label>
              <input className={styles.formInput} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Won 1st place at HackMIT" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <select className={styles.formSelect} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="HACKATHON">Hackathon</option>
                <option value="ACADEMIC">Academic</option>
                <option value="COMPETITION">Competition</option>
                <option value="RESEARCH">Research</option>
                <option value="PUBLICATION">Publication</option>
                <option value="LEADERSHIP">Leadership</option>
                <option value="OPEN_SOURCE">Open Source</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Organization</label>
              <input className={styles.formInput} value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} placeholder="e.g. MIT" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea className={styles.formTextarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your achievement..." />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.saveBtn} disabled={saving || !form.title.trim()} onClick={handleSave}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {achievements.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No achievements yet.</p>
          <button className={styles.sectionAction} onClick={() => setShowForm(true)}>+ Add Achievement</button>
        </div>
      ) : (
        <div className={styles.grid2}>
          {achievements.map(a => (
            <div key={a.id} className={styles.achievementCard}>
              <p className={styles.achievementTitle}>
                {a.title}
                <span className={styles.achievementCategory}>{a.category.replace('_', ' ')}</span>
              </p>
              {a.organization && <p className={styles.achievementOrg}>{a.organization}</p>}
              {a.description && <p className={styles.projectDesc}>{a.description}</p>}
              <div className={styles.projectActions}>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CareerSection({ careerPrefs, onReload }: { careerPrefs: StudentCareerPreferences | null; onReload: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    preferredWorkType: careerPrefs?.preferredWorkType || 'ANY',
    careerGoal: careerPrefs?.careerGoal || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await studentProfileApi.updateCareerPreferences(form);
      setEditing(false);
      onReload();
    } catch { /* */ }
    setSaving(false);
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Career Preferences</h3>
        <button className={styles.sectionAction} onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Preferred Work Type</label>
            <select className={styles.formSelect} value={form.preferredWorkType} onChange={e => setForm({ ...form, preferredWorkType: e.target.value })}>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-site</option>
              <option value="ANY">Any</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Career Goal</label>
            <textarea className={styles.formTextarea} value={form.careerGoal} onChange={e => setForm({ ...form, careerGoal: e.target.value })} placeholder="Describe your career aspirations..." />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.saveBtn} disabled={saving} onClick={handleSave}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.grid2}>
          <div className={styles.careerField}>
            <span className={styles.careerLabel}>Work Type</span>
            <span className={styles.careerValue}>{careerPrefs?.preferredWorkType || '—'}</span>
          </div>
          <div className={styles.careerField}>
            <span className={styles.careerLabel}>Career Goal</span>
            <span className={styles.careerValue}>{careerPrefs?.careerGoal || '—'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LinksSection({ links, onReload }: { links: StudentLink[]; onReload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ platform: 'GitHub', url: '' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.url.trim()) return;
    setSaving(true);
    try {
      await studentProfileApi.addLink(form);
      setShowForm(false);
      setForm({ platform: 'GitHub', url: '' });
      onReload();
    } catch { /* */ }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await studentProfileApi.removeLink(id);
    onReload();
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Developer Links</h3>
        <button className={styles.sectionAction} onClick={() => setShowForm(true)}>+ Add Link</button>
      </div>

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Add Link</h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Platform</label>
              <select className={styles.formSelect} value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                <option>GitHub</option>
                <option>LinkedIn</option>
                <option>Portfolio</option>
                <option>LeetCode</option>
                <option>HackerRank</option>
                <option>CodeChef</option>
                <option>Kaggle</option>
                <option>Twitter</option>
                <option>Medium</option>
                <option>YouTube</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL *</label>
              <input className={styles.formInput} value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.saveBtn} disabled={saving || !form.url.trim()} onClick={handleSave}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {links.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No links added yet.</p>
          <button className={styles.sectionAction} onClick={() => setShowForm(true)}>+ Add Link</button>
        </div>
      ) : (
        <div>
          {links.map(l => (
            <div key={l.id} className={styles.linkItem}>
              <span className={styles.linkPlatform}>{l.platform}</span>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className={styles.linkUrl}>{l.url}</a>
              <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(l.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
