import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Coins,
  Building2,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Award,
  FolderGit2,
  ExternalLink,
  Trash2,
  Plus,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  X,
  GitBranch,
  Link2,
  Globe,
  BookOpen,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import { api } from '../../../services/api/client';
import type { StudentFormData, SkillEntry, ProjectEntry, CertificationEntry } from '../../types/onboarding';
import { EMPTY_STUDENT_FORM } from '../../types/onboarding';
import styles from './StudentOnboarding.module.css';

const STEPS = [
  { label: 'Personal Details', sub: 'Contact & demographics', icon: User },
  { label: 'Academic Credentials', sub: 'College, branch & CGPA', icon: GraduationCap },
  { label: 'Career Objectives', sub: 'Roles, industries & mode', icon: Briefcase },
  { label: 'Skills & Portfolio', sub: 'Projects, certs & links', icon: Code2 },
  { label: 'Review & Activate', sub: 'Summary & instant verification', icon: ShieldCheck },
];

const JOB_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'AI / ML Engineer',
  'Cloud / DevOps Engineer',
  'Cybersecurity Analyst',
  'UI/UX Designer',
  'Systems Architect',
  'Mobile App Developer',
];

const INDUSTRIES = [
  'Artificial Intelligence & Automation',
  'FinTech & Digital Banking',
  'HealthTech & Biotech',
  'SaaS & Cloud Computing',
  'E-commerce & Consumer Tech',
  'Autonomous Systems & Robotics',
  'Cybersecurity & Defense',
  'Enterprise Software & IT',
];

const DEGREES = ['B.E', 'B.Tech', 'B.Sc', 'M.E', 'M.Tech', 'MCA', 'BCA', 'M.Sc', 'MBA'];

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Other',
];

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated / Alumni'];

const POPULAR_SKILLS = [
  { name: 'React', category: 'Frontend' },
  { name: 'TypeScript', category: 'Languages' },
  { name: 'Java', category: 'Languages' },
  { name: 'Python', category: 'Languages' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'Git', category: 'Tools' },
];

export function StudentOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<StudentFormData>({
    ...EMPTY_STUDENT_FORM,
    country: 'India',
    degree: 'B.Tech',
    department: 'Computer Science and Engineering',
    academicYear: '3rd Year',
    placementPreference: 'PLACEMENT_WILLING',
    preferredWorkType: 'ANY',
    preferredJobRoles: ['Software Engineer'],
    preferredIndustries: ['Artificial Intelligence & Automation'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sub-forms for adding projects and certifications
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState<ProjectEntry>({
    name: '',
    description: '',
    role: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    startDate: '',
    endDate: '',
  });

  const [showAddCert, setShowAddCert] = useState(false);
  const [newCert, setNewCert] = useState<CertificationEntry>({
    name: '',
    issuingOrg: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  });

  // Custom role & industry inputs
  const [customRole, setCustomRole] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Languages');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');

  // Pre-load existing profile data if available
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    async function loadExistingProfile() {
      try {
        const res = await api.get('/student/profile');
        const data = (res as any)?.data || res;
        if (data && typeof data === 'object') {
          setForm(prev => ({
            ...prev,
            phone: data.phone || prev.phone,
            gender: data.gender || prev.gender,
            country: data.country || prev.country || 'India',
            state: data.state || prev.state,
            city: data.city || prev.city,
            dateOfBirth: data.dateOfBirth || prev.dateOfBirth,
            institution: data.institution || data.institutionName || prev.institution,
            registrationNumber: data.registrationNumber || prev.registrationNumber,
            degree: data.degree || prev.degree || 'B.Tech',
            department: data.department || prev.department || 'Computer Science and Engineering',
            academicYear: data.academicYear || prev.academicYear || '3rd Year',
            cgpa: data.cgpa ? String(data.cgpa) : prev.cgpa,
            aboutMe: data.aboutMe || data.bio || prev.aboutMe,
          }));
        }
      } catch {
        // Fallback to initial empty form
      }
    }
    loadExistingProfile();
  }, []);

  function update<K extends keyof StudentFormData>(key: K, value: StudentFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleAddCustomRole() {
    const trimmed = customRole.trim();
    if (trimmed && !form.preferredJobRoles.includes(trimmed)) {
      update('preferredJobRoles', [...form.preferredJobRoles, trimmed]);
      setCustomRole('');
    }
  }

  function handleAddCustomIndustry() {
    const trimmed = customIndustry.trim();
    if (trimmed && !form.preferredIndustries.includes(trimmed)) {
      update('preferredIndustries', [...form.preferredIndustries, trimmed]);
      setCustomIndustry('');
    }
  }

  function toggleRole(role: string) {
    if (form.preferredJobRoles.includes(role)) {
      update('preferredJobRoles', form.preferredJobRoles.filter(r => r !== role));
    } else {
      update('preferredJobRoles', [...form.preferredJobRoles, role]);
    }
  }

  function toggleIndustry(industry: string) {
    if (form.preferredIndustries.includes(industry)) {
      update('preferredIndustries', form.preferredIndustries.filter(i => i !== industry));
    } else {
      update('preferredIndustries', [...form.preferredIndustries, industry]);
    }
  }

  function handleAddSkill() {
    const name = newSkillName.trim();
    if (!name) return;
    if (form.skills.some(s => s.skillName.toLowerCase() === name.toLowerCase())) {
      setNewSkillName('');
      return;
    }
    const newEntry: SkillEntry = {
      skillName: name,
      category: newSkillCategory,
      proficiency: newSkillProficiency,
    };
    update('skills', [...form.skills, newEntry]);
    setNewSkillName('');
  }

  function handleSaveProject() {
    if (!newProject.name.trim()) return;
    update('projects', [...form.projects, { ...newProject }]);
    setNewProject({
      name: '',
      description: '',
      role: '',
      technologies: '',
      githubUrl: '',
      liveUrl: '',
      startDate: '',
      endDate: '',
    });
    setShowAddProject(false);
  }

  function handleSaveCert() {
    if (!newCert.name.trim()) return;
    update('certifications', [...form.certifications, { ...newCert }]);
    setNewCert({
      name: '',
      issuingOrg: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
    });
    setShowAddCert(false);
  }

  function updateLink(platform: string, url: string) {
    const existingIndex = form.links.findIndex(l => l.platform.toLowerCase() === platform.toLowerCase());
    if (existingIndex >= 0) {
      const updated = [...form.links];
      updated[existingIndex] = { platform, url };
      update('links', updated);
    } else {
      update('links', [...form.links, { platform, url }]);
    }
  }

  function getLinkUrl(platform: string): string {
    const found = form.links.find(l => l.platform.toLowerCase() === platform.toLowerCase());
    return found ? found.url : '';
  }

  function validateStep(current: number): boolean {
    setError('');
    if (current === 0) {
      if (!form.phone.trim()) {
        setError('Please provide a valid contact phone number.');
        return false;
      }
      if (!form.country || !form.country.trim()) {
        update('country', 'India');
      }
    } else if (current === 1) {
      if (!form.institution.trim()) {
        setError('Please specify your current college / university name.');
        return false;
      }
      if (!form.degree.trim()) {
        setError('Please select your degree program.');
        return false;
      }
      if (!form.department.trim()) {
        setError('Please select your academic department / major.');
        return false;
      }
      if (!form.academicYear.trim()) {
        setError('Please select your current academic year.');
        return false;
      }
    } else if (current === 2) {
      if (form.preferredJobRoles.length === 0) {
        setError('Please select at least one target job role you want to be discovered for.');
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep(prev => Math.min(prev + 1, 4));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  function handleBack() {
    setError('');
    setStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      // 1. Update Student Profile in Backend
      await api.put('/student/profile', {
        phone: form.phone,
        gender: form.gender,
        country: form.country,
        state: form.state,
        city: form.city,
        institution: form.institution,
        degree: form.degree,
        department: form.department,
        academicYear: form.academicYear,
        cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
        aboutMe: form.aboutMe,
      }).catch(() => {});

      // 2. Submit to Onboarding Endpoint
      await api.post('/onboarding/student', form).catch(() => {});

      // 3. Navigate to Completion
      navigate('/onboarding/complete');
    } catch {
      setError("We encountered an error saving your profile. Your information is preserved; please retry.");
    } finally {
      setLoading(false);
    }
  }

  const progressPercent = Math.round(((step + 1) / 5) * 100);
  const currentStepData = STEPS[step];
  const StepIcon = currentStepData.icon;

  return (
    <div className={styles.pageContainer}>
      {/* ── Top Platform Header ── */}
      <header className={styles.topHeader}>
        <Link to="/" className={styles.brandLink}>
          <div className={styles.brandLogo}>B</div>
          <div className={styles.brandTextGroup}>
            <span className={styles.brandName}>BEYON</span>
            <span className={styles.brandTag}>Scholar Onboarding</span>
          </div>
        </Link>
        <div className={styles.headerRight}>
          <div className={styles.rewardBadge}>
            <Coins size={14} color="#b45309" />
            <span>+100 Beyon Coins on Activation</span>
          </div>
          <div className={styles.stepIndicatorBadge}>
            <span className={styles.stepHighlight}>Step {step + 1}</span> of 5 ({progressPercent}%)
          </div>
        </div>
      </header>

      {/* ── Hero Welcome Banner ── */}
      <div className={styles.heroWrapper}>
        <div className={styles.welcomeHero}>
          <div className={styles.badgeRow}>
            <div className={styles.portalBadge}>
              <Sparkles size={12} />
              Verified Scholar Portal
            </div>
            <div className={styles.verifiedBadge}>
              <CheckCircle2 size={12} />
              Official Campus Network
            </div>
          </div>
          <h1 className={styles.welcomeTitle}>Build Your Verified Scholar Profile</h1>
          <p className={styles.welcomeSub}>
            Complete your verified credentials, academic track, and career targets to access personalized AI assessments, skill benchmarks, and direct enterprise placements.
          </p>
          <div className={styles.progressStrip}>
            <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* ── Main Workspace Grid ── */}
      <div className={styles.mainWorkspace}>
        {/* ── Left Sticky Sidebar Guide ── */}
        <aside className={styles.asideGuide}>
          {/* Active Step Info Card */}
          <div className={styles.currentStepInfoCard}>
            <span className={styles.stepNumLabel}>
              <StepIcon size={14} /> Step {step + 1}
            </span>
            <h3 className={styles.stepHeading}>{currentStepData.label}</h3>
            <p className={styles.stepDesc}>
              {step === 0 && 'Provide your authentic contact and personal details for verified identity matching.'}
              {step === 1 && 'Record your verified institutional enrollment, degree, CGPA, and placement readiness.'}
              {step === 2 && 'Choose the job roles, target industries, and work models you want to be discovered for.'}
              {step === 3 && 'Highlight your verified coding proficiencies, key software projects, and social code repositories.'}
              {step === 4 && 'Perform a final audit of your scholar identity before instant account activation and coin grant.'}
            </p>
          </div>

          {/* Vertical Step Roadmap */}
          <div className={styles.stepTrackerCard}>
            <div className={styles.trackerTitle}>Onboarding Roadmap</div>
            <div className={styles.trackerList}>
              {STEPS.map((s, idx) => {
                const isCompleted = idx < step;
                const isActive = idx === step;
                const SIcon = s.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (idx < step) setStep(idx);
                    }}
                    disabled={idx > step}
                    className={`${styles.trackerItem} ${isActive ? styles.trackerItemActive : ''} ${isCompleted ? styles.trackerItemCompleted : ''} ${idx > step ? styles.trackerItemDisabled : ''}`}
                  >
                    <div
                      className={`${styles.trackerIconBox} ${isActive ? styles.trackerIconBoxActive : ''} ${isCompleted ? styles.trackerIconBoxCompleted : ''}`}
                    >
                      {isCompleted ? <Check size={14} /> : <SIcon size={14} />}
                    </div>
                    <div className={styles.trackerLabelGroup}>
                      <span className={`${styles.trackerStepName} ${isActive ? styles.trackerStepNameActive : ''}`}>
                        {s.label}
                      </span>
                      <span className={styles.trackerStepSub}>{s.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verification Benefits Card */}
          <div className={styles.benefitsCard}>
            <div className={styles.benefitsTitle}>
              <Sparkles size={14} color="#1c2d81" /> Scholar Benefits
            </div>
            <ul className={styles.benefitsList}>
              <li className={styles.benefitItem}>
                <Coins size={14} className={styles.benefitIcon} />
                <span><strong>100 Beyon Coins</strong> deposited upon profile completion.</span>
              </li>
              <li className={styles.benefitItem}>
                <Building2 size={14} className={styles.benefitIcon} />
                <span>Direct shortlisting by <strong>120+ hiring enterprises</strong>.</span>
              </li>
              <li className={styles.benefitItem}>
                <GraduationCap size={14} className={styles.benefitIcon} />
                <span>Academic credentials endorsed by your faculty.</span>
              </li>
              <li className={styles.benefitItem}>
                <Code2 size={14} className={styles.benefitIcon} />
                <span>Personalized AI assessments &amp; skill gap insights.</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* ── Right Form Workspace ── */}
        <main className={styles.formCard}>
          {error && (
            <div className={styles.errorAlert}>
              <span className={styles.errorText}>
                <AlertCircle size={18} />
                {error}
              </span>
              <button type="button" onClick={() => setError('')} className={styles.dismissBtn}>
                Dismiss
              </button>
            </div>
          )}

          {/* ═════════ STEP 0: PERSONAL INFORMATION ═════════ */}
          {step === 0 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <User size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>1. Personal &amp; Contact Details</h2>
                  <p className={styles.sectionSubtitle}>
                    Verified contact details ensure secure assessment proctoring and direct communication from hiring teams.
                  </p>
                </div>
              </div>

              <div className={styles.fieldsGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="phone">
                    <Phone size={13} /> Phone Number <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={styles.textInput}
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                  />
                  <span className={styles.fieldHint}>Used for identity verification and recruitment alerts</span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="gender">
                    Gender Identity
                  </label>
                  <select
                    id="gender"
                    className={styles.selectInput}
                    value={form.gender}
                    onChange={e => update('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="country">
                    <MapPin size={13} /> Country <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    className={styles.textInput}
                    placeholder="India"
                    value={form.country}
                    onChange={e => update('country', e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="state">
                    State / Province
                  </label>
                  <input
                    id="state"
                    type="text"
                    className={styles.textInput}
                    placeholder="e.g. Tamil Nadu, Karnataka, Maharashtra"
                    value={form.state}
                    onChange={e => update('state', e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    className={styles.textInput}
                    placeholder="e.g. Chennai, Bangalore, Mumbai"
                    value={form.city}
                    onChange={e => update('city', e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="dob">
                    <Calendar size={13} /> Date of Birth
                  </label>
                  <input
                    id="dob"
                    type="date"
                    className={styles.textInput}
                    value={form.dateOfBirth}
                    onChange={e => update('dateOfBirth', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════════ STEP 1: ACADEMIC CREDENTIALS ═════════ */}
          {step === 1 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <GraduationCap size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>2. Academic Credentials &amp; Campus Standing</h2>
                  <p className={styles.sectionSubtitle}>
                    Your academic records will be verified against your institutional faculty database.
                  </p>
                </div>
              </div>

              <div className={styles.fieldsGrid}>
                <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.fieldLabel} htmlFor="institution">
                    <Building2 size={13} /> College / University Name <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="institution"
                    type="text"
                    className={styles.textInput}
                    placeholder="e.g. PSG College of Technology, Coimbatore"
                    value={form.institution}
                    onChange={e => update('institution', e.target.value)}
                  />
                  <span className={styles.fieldHint}>Must match your official institutional email domain</span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="regNumber">
                    University Roll / Reg Number
                  </label>
                  <input
                    id="regNumber"
                    type="text"
                    className={styles.textInput}
                    placeholder="e.g. 21CS102"
                    value={form.registrationNumber}
                    onChange={e => update('registrationNumber', e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="degree">
                    Degree Program <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <select
                    id="degree"
                    className={styles.selectInput}
                    value={form.degree}
                    onChange={e => update('degree', e.target.value)}
                  >
                    <option value="">Select Degree</option>
                    {DEGREES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="department">
                    Major / Department <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <select
                    id="department"
                    className={styles.selectInput}
                    value={form.department}
                    onChange={e => update('department', e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="academicYear">
                    Current Academic Year <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <select
                    id="academicYear"
                    className={styles.selectInput}
                    value={form.academicYear}
                    onChange={e => update('academicYear', e.target.value)}
                  >
                    <option value="">Select Year</option>
                    {ACADEMIC_YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="cgpa">
                    <Award size={13} /> Cumulative CGPA (Scale 10.0)
                  </label>
                  <input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className={styles.textInput}
                    placeholder="e.g. 8.75"
                    value={form.cgpa}
                    onChange={e => update('cgpa', e.target.value)}
                  />
                  <span className={styles.fieldHint}>Verified during on-campus drive shortlisting</span>
                </div>
              </div>

              {/* Placement Preference Selection */}
              <div style={{ marginTop: '10px' }}>
                <label className={styles.fieldLabel}>
                  <Briefcase size={13} /> Campus Placement &amp; Internship Intent <span className={styles.requiredAsterisk}>*</span>
                </label>
                <div className={styles.placementChoiceGrid}>
                  <div
                    className={`${styles.placementCard} ${form.placementPreference === 'PLACEMENT_WILLING' ? styles.placementCardActive : ''}`}
                    onClick={() => update('placementPreference', 'PLACEMENT_WILLING')}
                  >
                    <div className={styles.placementCardIcon}>
                      <Briefcase size={18} />
                    </div>
                    <div className={styles.placementCardContent}>
                      <div className={styles.placementCardTitle}>Actively Seeking Placements</div>
                      <div className={styles.placementCardDesc}>
                        Include my verified profile in on-campus drives, virtual recruitment hackathons, and corporate internships.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${styles.placementCard} ${form.placementPreference === 'PLACEMENT_NOT_WILLING' ? styles.placementCardActive : ''}`}
                    onClick={() => update('placementPreference', 'PLACEMENT_NOT_WILLING')}
                  >
                    <div className={styles.placementCardIcon}>
                      <BookOpen size={18} />
                    </div>
                    <div className={styles.placementCardContent}>
                      <div className={styles.placementCardTitle}>Higher Studies / Non-Placement</div>
                      <div className={styles.placementCardDesc}>
                        Pursuing graduate research, competitive exams, or civil services. Exclude from placement pipelines.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ STEP 2: CAREER OBJECTIVES ═════════ */}
          {step === 2 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <Briefcase size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>3. Career Targets &amp; Technical Ambition</h2>
                  <p className={styles.sectionSubtitle}>
                    Select your targeted engineering disciplines to receive tailored practice sets and corporate opportunities.
                  </p>
                </div>
              </div>

              {/* Target Roles Chips */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Target Job Roles <span className={styles.requiredAsterisk}>*</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {JOB_ROLES.map(role => {
                    const selected = form.preferredJobRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          background: selected ? '#1c2d81' : '#ffffff',
                          color: selected ? '#ffffff' : '#334155',
                          border: selected ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                          borderRadius: '0px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: selected ? '0 2px 6px rgba(28, 45, 129, 0.2)' : 'none',
                        }}
                      >
                        {selected && <Check size={13} color="#fed601" />}
                        {role}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Role Input */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="text"
                    className={styles.textInput}
                    placeholder="Add custom role (e.g. Embedded Systems Engineer)"
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomRole();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRole}
                    style={{
                      padding: '10px 18px',
                      background: '#1c2d81',
                      color: '#ffffff',
                      border: '1px solid #1c2d81',
                      borderRadius: '0px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Target Industries Chips */}
              <div className={styles.fieldGroup} style={{ marginTop: '14px' }}>
                <label className={styles.fieldLabel}>Preferred Industries</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {INDUSTRIES.map(ind => {
                    const selected = form.preferredIndustries.includes(ind);
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => toggleIndustry(ind)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          background: selected ? '#1c2d81' : '#ffffff',
                          color: selected ? '#ffffff' : '#334155',
                          border: selected ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                          borderRadius: '0px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {selected && <Check size={13} color="#fed601" />}
                        {ind}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="text"
                    className={styles.textInput}
                    placeholder="Add custom industry (e.g. Aerospace &amp; Defense)"
                    value={customIndustry}
                    onChange={e => setCustomIndustry(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomIndustry();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomIndustry}
                    style={{
                      padding: '10px 18px',
                      background: '#1c2d81',
                      color: '#ffffff',
                      border: '1px solid #1c2d81',
                      borderRadius: '0px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Preferred Work Mode */}
              <div className={styles.fieldGroup} style={{ marginTop: '14px' }}>
                <label className={styles.fieldLabel}>Workplace Flexibility Mode</label>
                <div className={styles.workTypeRow}>
                  {[
                    { val: 'ANY', label: 'Open to All Modes' },
                    { val: 'ON_SITE', label: 'On-site Office' },
                    { val: 'HYBRID', label: 'Hybrid Workspace' },
                    { val: 'REMOTE', label: 'Full Remote' },
                  ].map(w => (
                    <button
                      key={w.val}
                      type="button"
                      className={`${styles.workTypePill} ${form.preferredWorkType === w.val ? styles.workTypePillActive : ''}`}
                      onClick={() => update('preferredWorkType', w.val as any)}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Professional Bio */}
              <div className={styles.fieldGroup} style={{ marginTop: '14px' }}>
                <label className={styles.fieldLabel} htmlFor="aboutMe">
                  <FileText size={13} /> Professional Summary / Bio
                </label>
                <textarea
                  id="aboutMe"
                  className={`${styles.textInput} ${styles.textareaInput}`}
                  placeholder="e.g. 3rd-year Computer Science scholar specializing in distributed cloud infrastructure, microservices with Spring Boot, and competitive algorithmic optimization..."
                  value={form.aboutMe}
                  onChange={e => update('aboutMe', e.target.value)}
                  maxLength={1000}
                />
                <span className={styles.fieldHint}>{form.aboutMe.length}/1000 characters</span>
              </div>
            </div>
          )}

          {/* ═════════ STEP 3: SKILLS & PORTFOLIO ═════════ */}
          {step === 3 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <Code2 size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>4. Technical Skills &amp; Engineering Portfolio</h2>
                  <p className={styles.sectionSubtitle}>
                    Showcase your verified technical strengths, key software projects, and official certifications.
                  </p>
                </div>
              </div>

              {/* Technical Skills Section */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Active Technical Skills</label>

                {/* Popular Skill Quick Add */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, alignSelf: 'center', marginRight: '4px' }}>
                    Quick add:
                  </span>
                  {POPULAR_SKILLS.map(ps => {
                    const alreadyAdded = form.skills.some(s => s.skillName.toLowerCase() === ps.name.toLowerCase());
                    return (
                      <button
                        key={ps.name}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => {
                          if (!alreadyAdded) {
                            update('skills', [...form.skills, { skillName: ps.name, category: ps.category, proficiency: 'INTERMEDIATE' }]);
                          }
                        }}
                        style={{
                          padding: '3px 8px',
                          background: alreadyAdded ? '#f1f5f9' : '#eff6ff',
                          border: alreadyAdded ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                          color: alreadyAdded ? '#94a3b8' : '#1c2d81',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: alreadyAdded ? 'default' : 'pointer',
                          borderRadius: '0px',
                        }}
                      >
                        + {ps.name}
                      </button>
                    );
                  })}
                </div>

                {/* Skill List Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '40px', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0px' }}>
                  {form.skills.length === 0 ? (
                    <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>No skills added yet. Add your core languages and frameworks below.</span>
                  ) : (
                    form.skills.map((s, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: '#1c2d81',
                          color: '#ffffff',
                          borderRadius: '0px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        <span>{s.skillName}</span>
                        <span style={{ fontSize: '0.66rem', color: '#fed601', textTransform: 'uppercase' }}>
                          ({s.proficiency.slice(0, 3)})
                        </span>
                        <button
                          type="button"
                          onClick={() => update('skills', form.skills.filter((_, i) => i !== idx))}
                          style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0, display: 'flex' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Skill Form Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="text"
                    className={styles.textInput}
                    placeholder="Skill name (e.g. Go, GraphQL, Kubernetes)"
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <select
                    className={styles.selectInput}
                    value={newSkillCategory}
                    onChange={e => setNewSkillCategory(e.target.value)}
                  >
                    <option value="Languages">Languages</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Cloud">Cloud</option>
                    <option value="DevOps">DevOps</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="Other">Other</option>
                  </select>
                  <select
                    className={styles.selectInput}
                    value={newSkillProficiency}
                    onChange={e => setNewSkillProficiency(e.target.value as any)}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    style={{
                      padding: '8px 18px',
                      background: '#1c2d81',
                      color: '#ffffff',
                      border: '1px solid #1c2d81',
                      borderRadius: '0px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Key Engineering Projects */}
              <div className={styles.fieldGroup} style={{ marginTop: '16px' }}>
                <label className={styles.fieldLabel}>
                  <FolderGit2 size={13} /> Engineering Projects
                </label>

                {form.projects.map((proj, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemCardInfo}>
                      <div className={styles.itemCardTitle}>{proj.name}</div>
                      <div className={styles.itemCardMeta}>
                        {proj.role && <span className={styles.tagPill}>{proj.role}</span>}
                        {proj.technologies && <span>Stack: {proj.technologies}</span>}
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#1c2d81', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                          >
                            <GitBranch size={12} /> Code <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                          {proj.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => update('projects', form.projects.filter((_, i) => i !== idx))}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {showAddProject ? (
                  <div className={styles.addItemModalBox}>
                    <div className={styles.addItemModalTitle}>
                      <FolderGit2 size={14} /> Add Engineering Project
                    </div>
                    <div className={styles.fieldsGrid}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Project Title *</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="e.g. Distributed In-Memory Cache"
                          value={newProject.name}
                          onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Your Role</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="e.g. Backend Lead"
                          value={newProject.role}
                          onChange={e => setNewProject(p => ({ ...p, role: e.target.value }))}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Tech Stack</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="e.g. Go, Docker, gRPC, Redis"
                          value={newProject.technologies}
                          onChange={e => setNewProject(p => ({ ...p, technologies: e.target.value }))}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>GitHub Repo URL</label>
                        <input
                          type="url"
                          className={styles.textInput}
                          placeholder="https://github.com/yourhandle/repo"
                          value={newProject.githubUrl}
                          onChange={e => setNewProject(p => ({ ...p, githubUrl: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Project Description</label>
                      <textarea
                        className={styles.textInput}
                        rows={2}
                        placeholder="Briefly describe the engineering challenge, throughput metrics, or architecture..."
                        value={newProject.description}
                        onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleSaveProject}
                        style={{
                          padding: '8px 20px',
                          background: '#1c2d81',
                          color: '#ffffff',
                          border: '1px solid #1c2d81',
                          borderRadius: '0px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Save Project
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddProject(false)}
                        style={{
                          padding: '8px 16px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '0px',
                          color: '#475569',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.addBtnTrigger}
                    onClick={() => setShowAddProject(true)}
                  >
                    <Plus size={16} /> Add Engineering Project
                  </button>
                )}
              </div>

              {/* Certifications */}
              <div className={styles.fieldGroup} style={{ marginTop: '16px' }}>
                <label className={styles.fieldLabel}>
                  <Award size={13} /> Industry Certifications &amp; Badges
                </label>

                {form.certifications.map((cert, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemCardInfo}>
                      <div className={styles.itemCardTitle}>{cert.name}</div>
                      <div className={styles.itemCardMeta}>
                        <span className={styles.tagPill}>{cert.issuingOrg}</span>
                        {cert.credentialId && <span>ID: {cert.credentialId}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => update('certifications', form.certifications.filter((_, i) => i !== idx))}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {showAddCert ? (
                  <div className={styles.addItemModalBox}>
                    <div className={styles.addItemModalTitle}>
                      <Award size={14} /> Add Certification
                    </div>
                    <div className={styles.fieldsGrid}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Certification Name *</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="e.g. AWS Certified Solutions Architect"
                          value={newCert.name}
                          onChange={e => setNewCert(c => ({ ...c, name: e.target.value }))}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Issuing Organization</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="e.g. Amazon Web Services, Google Cloud"
                          value={newCert.issuingOrg}
                          onChange={e => setNewCert(c => ({ ...c, issuingOrg: e.target.value }))}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Credential ID</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="e.g. AWS-8291039"
                          value={newCert.credentialId}
                          onChange={e => setNewCert(c => ({ ...c, credentialId: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleSaveCert}
                        style={{
                          padding: '8px 20px',
                          background: '#1c2d81',
                          color: '#ffffff',
                          border: '1px solid #1c2d81',
                          borderRadius: '0px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Save Certification
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCert(false)}
                        style={{
                          padding: '8px 16px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '0px',
                          color: '#475569',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.addBtnTrigger}
                    onClick={() => setShowAddCert(true)}
                  >
                    <Plus size={16} /> Add Certification
                  </button>
                )}
              </div>

              {/* Online Social & Coding Links */}
              <div className={styles.fieldGroup} style={{ marginTop: '16px' }}>
                <label className={styles.fieldLabel}>
                  <Globe size={13} /> Online Coding &amp; Portfolio Profiles
                </label>
                <div className={styles.linksGrid}>
                  <div className={styles.linkInputRow}>
                    <div className={styles.linkPlatformLabel}>
                      <GitBranch size={14} /> GitHub
                    </div>
                    <input
                      type="url"
                      className={styles.linkUrlInput}
                      placeholder="https://github.com/username"
                      value={getLinkUrl('GitHub')}
                      onChange={e => updateLink('GitHub', e.target.value)}
                    />
                  </div>

                  <div className={styles.linkInputRow}>
                    <div className={styles.linkPlatformLabel}>
                      <Link2 size={14} /> LinkedIn
                    </div>
                    <input
                      type="url"
                      className={styles.linkUrlInput}
                      placeholder="https://linkedin.com/in/username"
                      value={getLinkUrl('LinkedIn')}
                      onChange={e => updateLink('LinkedIn', e.target.value)}
                    />
                  </div>

                  <div className={styles.linkInputRow}>
                    <div className={styles.linkPlatformLabel}>
                      <Code2 size={14} /> LeetCode
                    </div>
                    <input
                      type="url"
                      className={styles.linkUrlInput}
                      placeholder="https://leetcode.com/username"
                      value={getLinkUrl('LeetCode')}
                      onChange={e => updateLink('LeetCode', e.target.value)}
                    />
                  </div>

                  <div className={styles.linkInputRow}>
                    <div className={styles.linkPlatformLabel}>
                      <Globe size={14} /> Portfolio
                    </div>
                    <input
                      type="url"
                      className={styles.linkUrlInput}
                      placeholder="https://yourportfolio.dev"
                      value={getLinkUrl('Portfolio')}
                      onChange={e => updateLink('Portfolio', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ STEP 4: REVIEW & ACTIVATE ═════════ */}
          {step === 4 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <ShieldCheck size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>5. Review &amp; Activate Scholar Profile</h2>
                  <p className={styles.sectionSubtitle}>
                    Audit your verified candidate profile before final submission and automatic wallet token credit.
                  </p>
                </div>
              </div>

              {/* Live Candidate Preview Card */}
              <div className={styles.candidatePreviewCard}>
                <div className={styles.candidateInfoLeft}>
                  <div className={styles.candidateAvatar}>
                    {(user?.name || form.institution || 'S').slice(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.candidateMeta}>
                    <div className={styles.verifiedStatusTag}>
                      <CheckCircle2 size={12} /> Verified Scholar Preview
                    </div>
                    <h3 className={styles.candidateName}>{user?.name || 'Verified Scholar'}</h3>
                    <p className={styles.candidateCollege}>{form.institution || 'College not specified'}</p>
                    <span className={styles.candidateDegree}>
                      {form.degree} · {form.department} ({form.academicYear})
                    </span>
                  </div>
                </div>
                <div className={styles.candidateBadgesRight}>
                  {form.cgpa && (
                    <div className={styles.cgpaBadge}>
                      {form.cgpa} / 10.0 CGPA
                    </div>
                  )}
                  <div style={{ fontSize: '0.74rem', color: '#fed601', fontWeight: 700 }}>
                    {form.placementPreference === 'PLACEMENT_WILLING' ? '✓ Actively Seeking Placement' : 'Higher Studies'}
                  </div>
                </div>
              </div>

              {/* Detailed Review Breakdown */}
              <div className={styles.reviewGrid}>
                {/* Personal Card */}
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <span className={styles.reviewCardTitle}>
                      <User size={14} /> Personal Details
                    </span>
                    <button type="button" onClick={() => setStep(0)} className={styles.editLinkBtn}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewRowsList}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Phone:</span>
                      <span className={styles.reviewValue}>{form.phone || '—'}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Location:</span>
                      <span className={styles.reviewValue}>
                        {[form.city, form.state, form.country].filter(Boolean).join(', ') || '—'}
                      </span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Gender:</span>
                      <span className={styles.reviewValue}>{form.gender || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Card */}
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <span className={styles.reviewCardTitle}>
                      <GraduationCap size={14} /> Academic Credentials
                    </span>
                    <button type="button" onClick={() => setStep(1)} className={styles.editLinkBtn}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewRowsList}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Roll Number:</span>
                      <span className={styles.reviewValue}>{form.registrationNumber || '—'}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Degree:</span>
                      <span className={styles.reviewValue}>{form.degree || '—'}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Major:</span>
                      <span className={styles.reviewValue}>{form.department || '—'}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>CGPA:</span>
                      <span className={styles.reviewValue}>{form.cgpa ? `${form.cgpa} / 10.0` : '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Career Goals Card */}
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <span className={styles.reviewCardTitle}>
                      <Briefcase size={14} /> Career Objectives
                    </span>
                    <button type="button" onClick={() => setStep(2)} className={styles.editLinkBtn}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewRowsList}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Target Roles:</span>
                      <span className={styles.reviewValue}>
                        {form.preferredJobRoles.slice(0, 2).join(', ') || 'Any'}
                        {form.preferredJobRoles.length > 2 ? ` +${form.preferredJobRoles.length - 2}` : ''}
                      </span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Work Mode:</span>
                      <span className={styles.reviewValue}>{form.preferredWorkType || 'Open to All'}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Placement:</span>
                      <span className={styles.reviewValue}>
                        {form.placementPreference === 'PLACEMENT_WILLING' ? 'Actively Seeking' : 'Not Seeking'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Portfolio Card */}
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <span className={styles.reviewCardTitle}>
                      <Code2 size={14} /> Technical Portfolio
                    </span>
                    <button type="button" onClick={() => setStep(3)} className={styles.editLinkBtn}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewRowsList}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Verified Skills:</span>
                      <span className={styles.reviewValue}>{form.skills.length} listed</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Key Projects:</span>
                      <span className={styles.reviewValue}>{form.projects.length} added</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Certifications:</span>
                      <span className={styles.reviewValue}>{form.certifications.length} verified</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Social Repos:</span>
                      <span className={styles.reviewValue}>{form.links.filter(l => Boolean(l.url)).length} linked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward Callout Box */}
              <div className={styles.rewardCallout}>
                <div className={styles.rewardCalloutIcon}>
                  <Coins />
                </div>
                <div>
                  <h4 className={styles.rewardCalloutTitle}>Ready for 100 Beyon Coins Welcome Grant!</h4>
                  <p className={styles.rewardCalloutText}>
                    By clicking complete, your scholar profile will be submitted for institutional endorsement and 100 Beyon Coins will be automatically credited to your learning wallet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step Navigation Footer ── */}
          <div className={styles.navigationFooter}>
            {step > 0 ? (
              <button type="button" className={styles.backButton} onClick={handleBack}>
                <ChevronLeft size={16} /> Back to {STEPS[step - 1].label}
              </button>
            ) : (
              <div />
            )}

            <span className={styles.stepCounterText}>
              Step {step + 1} of 5 — {currentStepData.label}
            </span>

            {step < 4 ? (
              <button type="button" className={styles.nextButton} onClick={handleNext}>
                Continue to {STEPS[step + 1].label} <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.nextButton}
                onClick={handleSubmit}
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #1c2d81 0%, #253cac 100%)' }}
              >
                {loading ? (
                  <>Activating Profile...</>
                ) : (
                  <>
                    <Sparkles size={16} color="#fed601" /> Complete &amp; Activate Profile (+100 Coins)
                  </>
                )}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
