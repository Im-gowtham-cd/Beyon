import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  ShieldCheck,
  CheckCircle2,
  Coins,
  FileText,
  Award,
  FolderGit2,
  Trash2,
  Plus,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  X,
  BookOpen,
  Check,
  UploadCloud,
  Database,
  Server,
  HardDrive,
  FileCheck,
  School,
  Building2,
  Search,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import { api } from '../../../services/api/client';
import type {
  StudentFormData,
  SkillEntry,
  ProjectEntry,
  CertificationEntry,
  InternshipEntry,
  InstitutionOption,
} from '../../types/onboarding';
import { EMPTY_STUDENT_FORM } from '../../types/onboarding';
import styles from './StudentOnboarding.module.css';

const STEPS = [
  { label: 'Campus Affiliation', sub: 'Select approved institution', icon: School },
  { label: 'Personal Identity', sub: 'Contact & Student ID Card', icon: User },
  { label: 'Academic History', sub: 'Current program, 10th, 12th/Diploma', icon: GraduationCap },
  { label: 'Internships & Experience', sub: 'Prior roles & mandatory proof', icon: Briefcase },
  { label: 'Skills & Preferences', sub: 'Target roles & portfolio', icon: Code2 },
  { label: 'Data Architecture Ledger', sub: 'Persistence map & submission', icon: ShieldCheck },
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

export interface SkillRecommendation {
  name: string;
  category: string;
  reason: string;
}

export function getRecommendedSkillsForCandidate(department: string, roles: string[] = []): SkillRecommendation[] {
  const result: SkillRecommendation[] = [];
  const added = new Set<string>();

  const add = (name: string, category: string, reason: string) => {
    const key = name.toLowerCase().trim();
    if (!added.has(key)) {
      added.add(key);
      result.push({ name, category, reason });
    }
  };

  // 1. Role-based recommendations
  roles.forEach(r => {
    const role = r.toLowerCase();
    if (role.includes('frontend') || role.includes('ui/ux')) {
      add('React', 'Frontend', 'Frontend Role');
      add('TypeScript', 'Languages', 'Frontend Role');
      add('CSS', 'Frontend', 'Frontend Role');
      add('JavaScript', 'Languages', 'Frontend Role');
      add('HTML', 'Frontend', 'Frontend Role');
      add('Next.js', 'Frontend', 'Frontend Role');
    }
    if (role.includes('backend')) {
      add('Java', 'Languages', 'Backend Role');
      add('Spring Boot', 'Backend', 'Backend Role');
      add('Python', 'Languages', 'Backend Role');
      add('PostgreSQL', 'Database', 'Backend Role');
      add('Node.js', 'Backend', 'Backend Role');
      add('Docker', 'DevOps', 'Backend Role');
    }
    if (role.includes('full stack')) {
      add('React', 'Frontend', 'Full Stack');
      add('TypeScript', 'Languages', 'Full Stack');
      add('Node.js', 'Backend', 'Full Stack');
      add('Spring Boot', 'Backend', 'Full Stack');
      add('PostgreSQL', 'Database', 'Full Stack');
    }
    if (role.includes('data') || role.includes('ai') || role.includes('machine learning')) {
      add('Python', 'Languages', 'AI/Data Role');
      add('Machine Learning', 'AI_ML', 'AI/Data Role');
      add('SQL', 'Database', 'AI/Data Role');
      add('Data Analysis', 'AI_ML', 'AI/Data Role');
      add('Pandas', 'Tools', 'AI/Data Role');
      add('Deep Learning', 'AI_ML', 'AI/Data Role');
    }
    if (role.includes('cloud') || role.includes('devops')) {
      add('Docker', 'DevOps', 'Cloud/DevOps');
      add('Kubernetes', 'DevOps', 'Cloud/DevOps');
      add('AWS', 'Cloud', 'Cloud/DevOps');
      add('Linux', 'Tools', 'Cloud/DevOps');
      add('Git', 'Tools', 'Cloud/DevOps');
    }
    if (role.includes('cybersecurity')) {
      add('Network Security', 'Security', 'Security Role');
      add('Linux', 'Tools', 'Security Role');
      add('Cryptography', 'Security', 'Security Role');
      add('Python', 'Languages', 'Security Role');
    }
    if (role.includes('mobile')) {
      add('Flutter', 'Mobile', 'Mobile Role');
      add('React Native', 'Mobile', 'Mobile Role');
      add('Kotlin', 'Languages', 'Mobile Role');
    }
  });

  // 2. Department-based recommendations
  const dept = (department || '').toLowerCase();
  if (dept.includes('computer science') || dept.includes('cse') || dept.includes('information tech') || dept.includes('it')) {
    add('Data Structures & Algorithms', 'Languages', 'Department Core');
    add('Java', 'Languages', 'Department Core');
    add('Python', 'Languages', 'Department Core');
    add('Database Systems', 'Database', 'Department Core');
    add('Web Development', 'Frontend', 'Department Core');
  } else if (dept.includes('ai') || dept.includes('data science') || dept.includes('aids')) {
    add('Python', 'Languages', 'Department Core');
    add('Machine Learning', 'AI_ML', 'Department Core');
    add('Data Structures & Algorithms', 'Languages', 'Department Core');
    add('SQL', 'Database', 'Department Core');
    add('Deep Learning', 'AI_ML', 'Department Core');
  } else if (dept.includes('electronic') || dept.includes('ece') || dept.includes('electrical') || dept.includes('eee')) {
    add('C Programming', 'Languages', 'Department Core');
    add('Embedded Systems', 'Tools', 'Department Core');
    add('IoT', 'Tools', 'Department Core');
    add('Digital Electronics', 'Tools', 'Department Core');
    add('Python', 'Languages', 'Department Core');
  } else if (dept.includes('mech')) {
    add('CAD Modeling', 'Tools', 'Department Core');
    add('Engineering Mechanics', 'Tools', 'Department Core');
    add('Thermodynamics', 'Tools', 'Department Core');
    add('Python', 'Languages', 'Department Core');
  } else if (dept.includes('civil')) {
    add('Structural Analysis', 'Tools', 'Department Core');
    add('AutoCAD', 'Tools', 'Department Core');
    add('Surveying', 'Tools', 'Department Core');
  }

  // Common modern baseline
  add('React', 'Frontend', 'Recommended');
  add('TypeScript', 'Languages', 'Recommended');
  add('Java', 'Languages', 'Recommended');
  add('Python', 'Languages', 'Recommended');
  add('Spring Boot', 'Backend', 'Recommended');
  add('PostgreSQL', 'Database', 'Recommended');
  add('Docker', 'DevOps', 'Recommended');
  add('Git', 'Tools', 'Recommended');

  return result.slice(0, 12);
}


export function StudentOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfileStatus } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<StudentFormData>({
    ...EMPTY_STUDENT_FORM,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Approved institutions directory state
  const [institutionsList, setInstitutionsList] = useState<InstitutionOption[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState('');

  // Uploading state
  const [uploadingIdCard, setUploadingIdCard] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCertIndex, setUploadingCertIndex] = useState<number | null>(null);

  // File input refs
  const idCardFileRef = useRef<HTMLInputElement | null>(null);
  const resumeFileRef = useRef<HTMLInputElement | null>(null);

  // Sub-items states
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

  const [customRole, setCustomRole] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Languages');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadData() {
      setLoadingInstitutions(true);
      let fetchedInstitutions: InstitutionOption[] = [];
      try {
        const res = await api.get('/onboarding/institutions');
        const data = (res as any)?.data || res;
        if (Array.isArray(data)) {
          fetchedInstitutions = data;
          setInstitutionsList(data);
        }
      } catch (err) {
        console.error('Failed to load registered institutions', err);
      } finally {
        setLoadingInstitutions(false);
      }

      try {
        const res = await api.get('/student/profile');
        const data = (res as any)?.data || res;
        if (data && typeof data === 'object') {
          const instName = data.institution || data.institutionName;
          const instCode = data.aicteCode;
          const matched = fetchedInstitutions.find(
            i => (instName && i.name.toLowerCase() === instName.toLowerCase()) ||
                 (instCode && i.code === instCode)
          );

          setForm(prev => ({
            ...prev,
            firstName: data.firstName || prev.firstName,
            middleName: data.middleName || prev.middleName,
            lastName: data.lastName || prev.lastName,
            phone: data.phone || prev.phone,
            gender: data.gender || prev.gender,
            country: data.country || prev.country || 'India',
            state: data.state || prev.state || matched?.state || '',
            city: data.city || prev.city || matched?.city || '',
            dateOfBirth: data.dateOfBirth || prev.dateOfBirth,
            institutionId: matched?.id || prev.institutionId,
            institution: instName || matched?.name || prev.institution,
            aicteCode: instCode || matched?.code || prev.aicteCode,
            selectedInstitutionDetails: matched || prev.selectedInstitutionDetails,
            institutionVerified: Boolean(instName || matched),
            studentIdCardUrl: data.studentIdCardUrl || prev.studentIdCardUrl,
            registrationNumber: data.registrationNumber || prev.registrationNumber,
            degree: data.degree || prev.degree || 'B.Tech',
            department: data.department || prev.department || 'Computer Science and Engineering',
            academicYear: data.academicYear || prev.academicYear || '3rd Year',
            cgpa: data.cgpa ? String(data.cgpa) : prev.cgpa,
            aboutMe: data.aboutMe || data.bio || prev.aboutMe,
          }));
        }
      } catch {
        // no profile yet
      }

      try {
        const skillsRes = await api.get('/student/skills');
        const skillsData = (skillsRes as any)?.data || skillsRes;
        if (Array.isArray(skillsData) && skillsData.length > 0) {
          const loadedSkills: SkillEntry[] = skillsData.map((s: any) => ({
            skillName: s.skillName || s.name || '',
            category: s.category || 'Technical',
            proficiency: s.proficiency || 'INTERMEDIATE',
          })).filter((s: SkillEntry) => Boolean(s.skillName));
          if (loadedSkills.length > 0) {
            setForm(prev => ({
              ...prev,
              skills: prev.skills.length > 0 ? prev.skills : loadedSkills,
            }));
          }
        }
      } catch {
        // no skills yet
      }
    }

    loadData();
  }, []);

  function update<K extends keyof StudentFormData>(key: K, value: StudentFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // Institution Selection Handlers
  function handleSelectInstitution(inst: InstitutionOption) {
    setForm(prev => ({
      ...prev,
      institutionId: inst.id,
      institution: inst.name,
      aicteCode: inst.code || '',
      selectedInstitutionDetails: inst,
      institutionVerified: true,
      state: prev.state || inst.state || '',
      city: prev.city || inst.city || '',
    }));
    setError('');
  }

  function handleClearInstitution() {
    setForm(prev => ({
      ...prev,
      institutionId: '',
      institution: '',
      aicteCode: '',
      selectedInstitutionDetails: null,
      institutionVerified: false,
    }));
  }

  const filteredInstitutions = institutionsList.filter(inst => {
    if (!institutionSearch.trim()) return true;
    const q = institutionSearch.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      (inst.city && inst.city.toLowerCase().includes(q)) ||
      (inst.state && inst.state.toLowerCase().includes(q)) ||
      (inst.code && inst.code.toLowerCase().includes(q)) ||
      (inst.type && inst.type.toLowerCase().includes(q))
    );
  });

  // Document Upload Helper
  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

  async function handleUploadFile(file: File, category: string): Promise<string | null> {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Selected file "${file.name}" exceeds the maximum 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please select a smaller file.`);
      return null;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('category', category);

    try {
      const res = await api.upload<{ url?: string; success?: boolean; error?: string }>('/documents/upload', data);
      const resData = (res as any)?.data || res;
      if (resData && resData.url) {
        return resData.url;
      }
      if (resData && resData.error) {
        setError(resData.error);
        return null;
      }
      return null;
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err?.message || 'File upload failed. Please try again.');
      return null;
    }
  }

  // ID Card Upload
  async function onSelectIdCard(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdCard(true);
    setError('');
    const url = await handleUploadFile(file, 'STUDENT_ID_CARD');
    if (url) {
      update('studentIdCardUrl', url);
    }
    setUploadingIdCard(false);
  }

  // Resume Upload
  async function onSelectResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    setError('');
    const url = await handleUploadFile(file, 'RESUME');
    if (url) {
      update('resumeUrl', url);
    }
    setUploadingResume(false);
  }

  // Internship Certificate Upload
  async function onSelectInternshipCert(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCertIndex(idx);
    setError('');
    const url = await handleUploadFile(file, 'INTERNSHIP_CERTIFICATE');
    if (url) {
      const updated = [...form.internships];
      updated[idx] = { ...updated[idx], certificateProofUrl: url };
      update('internships', updated);
    }
    setUploadingCertIndex(null);
  }

  // Internship Handlers
  function handleAddInternship() {
    const newEntry: InternshipEntry = {
      companyName: '',
      role: '',
      description: '',
      duration: '3 Months',
      stipend: 'Unpaid',
      workType: 'REMOTE',
      status: 'COMPLETED',
      certificateProofUrl: '',
    };
    update('internships', [...form.internships, newEntry]);
  }

  function handleUpdateInternship<K extends keyof InternshipEntry>(idx: number, field: K, val: InternshipEntry[K]) {
    const list = [...form.internships];
    list[idx] = { ...list[idx], [field]: val };
    update('internships', list);
  }

  function handleRemoveInternship(idx: number) {
    update('internships', form.internships.filter((_, i) => i !== idx));
  }

  // Roles & Skills
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

  // Navigation & Validation
  function canProceed(): boolean {
    if (step === 0) {
      return form.institutionVerified && Boolean(form.institution);
    }
    if (step === 1) {
      return (
        form.firstName.trim().length > 0 &&
        form.lastName.trim().length > 0 &&
        form.phone.trim().length > 0 &&
        form.studentIdCardUrl.trim().length > 0
      );
    }
    if (step === 2) {
      if (!form.degree || !form.department || !form.academicYear || !form.cgpa) {
        return false;
      }
      if (!form.education10th.schoolName || !form.education10th.percentageOrCgpa) {
        return false;
      }
      if (form.has12th && (!form.education12th.schoolOrCollegeName || !form.education12th.percentageOrCgpa)) {
        return false;
      }
      if (form.hasDiploma && (!form.educationDiploma.instituteName || !form.educationDiploma.percentageOrCgpa)) {
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (form.hasInternship) {
        for (const item of form.internships) {
          if (!item.companyName.trim() || !item.role.trim()) return false;
          if (item.status === 'COMPLETED' && !item.certificateProofUrl) {
            return false;
          }
        }
      }
      return true;
    }
    return true;
  }

  function handleNext() {
    setError('');
    if (!canProceed()) {
      if (step === 0) {
        setError('Please select your registered and approved institution from the directory before continuing.');
      } else if (step === 1) {
        setError('Please complete First Name, Last Name, Phone, and upload your Student ID Card Photo.');
      } else if (step === 2) {
        setError('Please complete your current program, 10th standard marks, and 12th/Diploma qualifications.');
      } else if (step === 3) {
        setError('Completed internships require an official certificate proof document. Please upload certificate for all completed internships or set status to Ongoing.');
      }
      return;
    }
    setStep(s => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setError('');
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        email: user?.email,
      };

      const res = await api.post('/onboarding/student', payload);
      await refreshProfileStatus();

      const resData = (res as any)?.data || res;
      const chosenSkillNames = form.skills.map(s => s.skillName.trim()).filter(Boolean);
      try {
        localStorage.setItem('beyon_onboarding_chosen_skills', JSON.stringify(chosenSkillNames));
      } catch {}

      navigate('/onboarding/skill-assessment', {
        state: {
          role: 'STUDENT',
          coinsAwarded: resData?.coinsAwarded || 100,
          persistenceLedger: resData?.persistenceLedger,
          chosenSkills: chosenSkillNames,
        },
      });

    } catch (err: any) {
      setError(err?.message || 'Failed to submit onboarding profile. Please check your data and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Top Header */}
      <header className={styles.topHeader}>
        <Link to="/" className={styles.brandLink}>
          <div className={styles.brandLogo}>B</div>
          <div className={styles.brandTextGroup}>
            <span className={styles.brandName}>BEYON</span>
            <span className={styles.brandTag}>Student Onboarding</span>
          </div>
        </Link>
        <div className={styles.headerRight}>
          <div className={styles.rewardBadge}>
            <Coins size={15} />
            <span>100 Beyon Coins on Completion</span>
          </div>
          <div className={styles.stepIndicatorBadge}>
            Step <span className={styles.stepHighlight}>{step + 1}</span> of {STEPS.length}
          </div>
        </div>
      </header>

      {/* Hero Welcome */}
      <div className={styles.heroWrapper}>
        <div className={styles.welcomeHero}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <SparklesIcon size={14} />
              <span>Approved Institutional Campus Network</span>
            </div>
            <h1 className={styles.heroTitle}>Student Onboarding & Verification</h1>
            <p className={styles.heroSub}>
              Select your registered institution, attach your verified student ID card photo, document your academic history,
              and claim 100 Welcome Coins.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className={styles.mainWorkspace}>
        {/* Left Side: Step Guide */}
        <aside className={styles.asideGuide}>
          <nav className={styles.stepsNav}>
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isDone = idx < step;
              const isCurrent = idx === step;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    if (idx < step) setStep(idx);
                  }}
                  className={`${styles.stepNavBtn} ${isCurrent ? styles.stepNavBtnActive : ''} ${
                    isDone ? styles.stepNavBtnDone : ''
                  }`}
                  disabled={idx > step}
                >
                  <div className={styles.stepNavIconWrap}>
                    {isDone ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <div className={styles.stepNavTextGroup}>
                    <div className={styles.stepNavHeaderRow}>
                      <span className={styles.stepNavNum}>Step {idx + 1}</span>
                      {isDone && <span className={styles.stepDoneBadge}>Done</span>}
                    </div>
                    <span className={styles.stepNavLabel}>{s.label}</span>
                    <span className={styles.stepNavSub}>{s.sub}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className={styles.asideInfoCard}>
            <div className={styles.asideInfoHeader}>
              <Coins size={16} color="#ca8a04" />
              <span>Completion Bounty</span>
            </div>
            <p className={styles.asideInfoText}>
              Complete all 6 steps to link with your verified campus placement cell and claim <strong>100 Welcome Coins</strong>.
            </p>
            <div className={styles.asideProgressTrack}>
              <div
                className={styles.asideProgressBar}
                style={{ width: `${Math.round(((step + 1) / STEPS.length) * 100)}%` }}
              />
            </div>
            <div className={styles.asideProgressLabel}>
              <span>Progress</span>
              <span>Step {step + 1} of {STEPS.length} ({Math.round(((step + 1) / STEPS.length) * 100)}%)</span>
            </div>
          </div>
        </aside>

        {/* Right Side: Form Wizard Content */}
        <main className={styles.contentArea}>
          <div className={styles.formCard}>
            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 0: SELECT APPROVED INSTITUTION */}
            {step === 0 && (
              <div className={styles.stepSection}>
                <div className={styles.sectionHeadingGroup}>
                  <h2 className={styles.sectionTitle}>Approved Campus &amp; Institution Selection</h2>
                  <p className={styles.sectionSub}>
                    Select your college from our registered and approved institutional network. Your academic credentials,
                    course registration, and placement requests will be linked directly to your campus placement cell.
                  </p>
                </div>

                {/* If selected: Showcase Selected Institution Card */}
                {form.selectedInstitutionDetails ? (
                  <div className={styles.selectedShowcaseCard}>
                    <div className={styles.selectedShowcaseHeader}>
                      <span className={styles.selectedShowcaseBadge}>
                        <CheckCircle2 size={16} />
                        Platform Approved &amp; Verified Institution
                      </span>
                      <button
                        type="button"
                        onClick={handleClearInstitution}
                        className={styles.changeInstBtn}
                      >
                        <X size={14} />
                        <span>Change Campus</span>
                      </button>
                    </div>

                    <h3 className={styles.selectedInstName}>{form.selectedInstitutionDetails.name}</h3>

                    <div className={styles.selectedDetailsGrid}>
                      <div className={styles.selectedDetailItem}>
                        <span className={styles.selectedDetailLabel}>AICTE / Institution Code</span>
                        <span className={styles.selectedDetailVal}>
                          <code>{form.selectedInstitutionDetails.code || 'Registered'}</code>
                        </span>
                      </div>

                      <div className={styles.selectedDetailItem}>
                        <span className={styles.selectedDetailLabel}>Campus Type</span>
                        <span className={styles.selectedDetailVal}>
                          {form.selectedInstitutionDetails.type || 'Engineering Institution'}
                        </span>
                      </div>

                      <div className={styles.selectedDetailItem}>
                        <span className={styles.selectedDetailLabel}>Location</span>
                        <span className={styles.selectedDetailVal}>
                          {form.selectedInstitutionDetails.city}, {form.selectedInstitutionDetails.state}
                        </span>
                      </div>

                      {form.selectedInstitutionDetails.affiliatedUniversity && (
                        <div className={styles.selectedDetailItem}>
                          <span className={styles.selectedDetailLabel}>Affiliated University</span>
                          <span className={styles.selectedDetailVal}>
                            {form.selectedInstitutionDetails.affiliatedUniversity}
                          </span>
                        </div>
                      )}

                      {form.selectedInstitutionDetails.grade && (
                        <div className={styles.selectedDetailItem}>
                          <span className={styles.selectedDetailLabel}>Accreditation Grade</span>
                          <span className={styles.selectedDetailVal}>
                            {form.selectedInstitutionDetails.grade}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={styles.rosterSyncNotice}>
                      <CheckCircle2 size={15} style={{ color: '#15803d', flexShrink: 0 }} />
                      <span>
                        <strong>Automatic Roster Integration:</strong> Your student account is now paired with{' '}
                        {form.selectedInstitutionDetails.name}. Upon profile completion, your account will be enrolled in
                        your campus Training &amp; Placement directory.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* If not selected: Search and Cards Grid */
                  <div className={styles.instSelectionContainer}>
                    <div className={styles.instSearchBox}>
                      <Search size={18} style={{ color: '#64748b' }} />
                      <input
                        type="text"
                        placeholder="Search approved college by name, city, state, or code (e.g. Kongu, Coimbatore, 1-3589631)..."
                        value={institutionSearch}
                        onChange={e => setInstitutionSearch(e.target.value)}
                        className={styles.instSearchInput}
                      />
                      {institutionSearch && (
                        <button
                          type="button"
                          onClick={() => setInstitutionSearch('')}
                          className={styles.iconButton}
                          title="Clear search"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className={styles.instListHeader}>
                      <div className={styles.instHeaderLeft}>
                        <ShieldCheck size={18} color="#15803d" />
                        <span className={styles.instCountBadge}>
                          {loadingInstitutions
                            ? 'Verifying approved institutions...'
                            : `${filteredInstitutions.length} Approved Institution(s) Verified by Beyon`}
                        </span>
                      </div>
                      <span className={styles.instNetworkNotice}>Official Campus Placement Network</span>
                    </div>

                    {filteredInstitutions.length > 0 ? (
                      <div className={styles.instCardsGrid}>
                        {filteredInstitutions.map(inst => (
                          <div
                            key={inst.id}
                            onClick={() => handleSelectInstitution(inst)}
                            className={styles.instCard}
                          >
                            <div className={styles.instCardHeader}>
                              <div className={styles.instCardEmblem}>
                                <Building2 size={20} />
                              </div>
                              <div className={styles.instCardHeaderContent}>
                                <h4 className={styles.instCardTitle}>{inst.name}</h4>
                                <span className={styles.instCardSubtitle}>
                                  Accredited Institutional Partner &bull; Training &amp; Placement Integrated
                                </span>
                              </div>
                              <span className={styles.instApprovedBadge}>
                                <ShieldCheck size={13} />
                                Approved
                              </span>
                            </div>

                            <div className={styles.instCardMetaList}>
                              <div className={styles.instCardMetaRow}>
                                <MapPin size={14} className={styles.instMetaIcon} />
                                <span>{inst.city}, {inst.state}</span>
                              </div>
                              <div className={styles.instCardMetaRow}>
                                <School size={14} className={styles.instMetaIcon} />
                                <span>{inst.type || 'Autonomous Engineering Institution'}</span>
                              </div>
                              {inst.affiliatedUniversity && (
                                <div className={styles.instCardMetaRow}>
                                  <GraduationCap size={14} className={styles.instMetaIcon} />
                                  <span>{inst.affiliatedUniversity}</span>
                                </div>
                              )}
                              <div className={styles.instBadgeRow}>
                                {inst.code && (
                                  <span className={styles.instCardCode}>
                                    AICTE ID: {inst.code}
                                  </span>
                                )}
                                {inst.grade && (
                                  <span className={styles.instCardGrade}>
                                    {inst.grade}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={styles.instSelectAction}>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSelectInstitution(inst);
                                }}
                                className={styles.instSelectBtn}
                              >
                                <span>Select Campus</span>
                                <ChevronRight size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '36px',
                          textAlign: 'center',
                          background: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                        }}
                      >
                        <Building2 size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                        <div style={{ fontWeight: 700, color: '#334155' }}>
                          No Approved Institutions Found
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                          No institution matches &ldquo;{institutionSearch}&rdquo;. Try adjusting your search keywords.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: PERSONAL IDENTITY & STUDENT ID CARD PHOTO */}
            {step === 1 && (
              <div className={styles.stepSection}>
                <div className={styles.sectionHeadingGroup}>
                  <h2 className={styles.sectionTitle}>Personal Identity & ID Verification</h2>
                  <p className={styles.sectionSub}>
                    Provide your legal name and upload a clear photo of your Student ID Card. Uploaded photos are stored
                    securely in Amazon S3 for institutional verification.
                  </p>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formCol3}>
                    <label className={styles.fieldLabel}>
                      First Name <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh"
                      value={form.firstName}
                      onChange={e => update('firstName', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.formCol3}>
                    <label className={styles.fieldLabel}>Middle Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Kumar"
                      value={form.middleName}
                      onChange={e => update('middleName', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.formCol3}>
                    <label className={styles.fieldLabel}>
                      Last Name <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={form.lastName}
                      onChange={e => update('lastName', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>

                  <div className={styles.formCol2}>
                    <label className={styles.fieldLabel}>
                      Phone Number <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>

                  <div className={styles.formCol2}>
                    <label className={styles.fieldLabel}>
                      Date of Birth <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={e => update('dateOfBirth', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>

                  <div className={styles.formCol3}>
                    <label className={styles.fieldLabel}>Gender</label>
                    <select
                      value={form.gender}
                      onChange={e => update('gender', e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className={styles.formCol3}>
                    <label className={styles.fieldLabel}>City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={form.city}
                      onChange={e => update('city', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>

                  <div className={styles.formCol3}>
                    <label className={styles.fieldLabel}>State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={form.state}
                      onChange={e => update('state', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>

                  {/* Student ID Card Upload */}
                  <div className={styles.fullWidth} style={{ marginTop: '10px' }}>
                    <label className={styles.fieldLabel}>
                      Student ID Card Photo <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <div
                      className={styles.dropzoneContainer}
                      onClick={() => idCardFileRef.current?.click()}
                    >
                      <input
                        ref={idCardFileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        onChange={onSelectIdCard}
                        className={styles.dropzoneInput}
                      />
                      <UploadCloud size={32} style={{ color: '#1c2d81', marginBottom: '8px' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                        {uploadingIdCard
                          ? 'Uploading ID Card to S3 Document Lake...'
                          : 'Click or Drag & Drop Student ID Card Photo'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                        Supported formats: PNG, JPG, JPEG, WEBP (Max 50MB)
                      </div>
                    </div>

                    {form.studentIdCardUrl && (
                      <div className={styles.idCardPreviewBox}>
                        <img
                          src={form.studentIdCardUrl}
                          alt="Student ID Preview"
                          className={styles.idCardThumb}
                          onError={e => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className={styles.idCardMeta}>
                          <div className={styles.idCardTitle}>Verified ID Card Document Attached</div>
                          <div className={styles.idCardUrl}>{form.studentIdCardUrl}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => update('studentIdCardUrl', '')}
                          className={styles.iconButton}
                          title="Remove uploaded ID card"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ACADEMIC CREDENTIALS & QUALIFICATIONS */}
            {step === 2 && (
              <div className={styles.stepSection}>
                <div className={styles.sectionHeadingGroup}>
                  <h2 className={styles.sectionTitle}>Academic Qualifications & History</h2>
                  <p className={styles.sectionSub}>
                    Record your current undergraduate/postgraduate program along with secondary (10th) and higher
                    secondary (12th) or diploma qualifications.
                  </p>
                </div>

                {/* Section A: Current Program */}
                <div className={styles.eduSectionCard}>
                  <h3 className={styles.eduSectionTitle}>
                    <School size={18} />
                    Current Academic Program
                  </h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formCol2}>
                      <label className={styles.fieldLabel}>
                        Degree <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <select
                        value={form.degree}
                        onChange={e => update('degree', e.target.value)}
                        className={styles.selectInput}
                      >
                        {DEGREES.map(d => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formCol2}>
                      <label className={styles.fieldLabel}>
                        Department / Branch <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <select
                        value={form.department}
                        onChange={e => update('department', e.target.value)}
                        className={styles.selectInput}
                      >
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formCol3}>
                      <label className={styles.fieldLabel}>
                        Academic Year <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <select
                        value={form.academicYear}
                        onChange={e => update('academicYear', e.target.value)}
                        className={styles.selectInput}
                      >
                        {ACADEMIC_YEARS.map(y => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formCol3}>
                      <label className={styles.fieldLabel}>
                        Current CGPA / Percentage <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 8.75"
                        value={form.cgpa}
                        onChange={e => update('cgpa', e.target.value)}
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.formCol3}>
                      <label className={styles.fieldLabel}>Roll / Registration Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 21CS045"
                        value={form.registrationNumber}
                        onChange={e => update('registrationNumber', e.target.value)}
                        className={styles.textInput}
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: 10th Standard */}
                <div className={styles.eduSectionCard}>
                  <h3 className={styles.eduSectionTitle}>
                    <GraduationCap size={18} />
                    10th Standard (Secondary School)
                  </h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formCol2}>
                      <label className={styles.fieldLabel}>
                        School Name <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kendriya Vidyalaya"
                        value={form.education10th.schoolName}
                        onChange={e =>
                          update('education10th', {
                            ...form.education10th,
                            schoolName: e.target.value,
                          })
                        }
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.formCol2}>
                      <label className={styles.fieldLabel}>Board of Education</label>
                      <input
                        type="text"
                        placeholder="e.g. CBSE / ICSE / State Board"
                        value={form.education10th.board}
                        onChange={e =>
                          update('education10th', {
                            ...form.education10th,
                            board: e.target.value,
                          })
                        }
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.formCol2}>
                      <label className={styles.fieldLabel}>Passing Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2020"
                        value={form.education10th.passingYear}
                        onChange={e =>
                          update('education10th', {
                            ...form.education10th,
                            passingYear: e.target.value,
                          })
                        }
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.formCol2}>
                      <label className={styles.fieldLabel}>
                        Percentage / CGPA <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 92.4% or 9.4 CGPA"
                        value={form.education10th.percentageOrCgpa}
                        onChange={e =>
                          update('education10th', {
                            ...form.education10th,
                            percentageOrCgpa: e.target.value,
                          })
                        }
                        className={styles.textInput}
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: 12th Standard OR Diploma */}
                <div className={styles.eduSectionCard}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                  >
                    <h3 className={styles.eduSectionTitle} style={{ margin: 0 }}>
                      <BookOpen size={18} />
                      Senior Secondary (12th) or Polytechnic Diploma
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          update('has12th', true);
                          update('hasDiploma', false);
                        }}
                        className={`${styles.toggleChip} ${form.has12th ? styles.toggleChipActive : ''}`}
                      >
                        12th Standard (HSC)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          update('has12th', false);
                          update('hasDiploma', true);
                        }}
                        className={`${styles.toggleChip} ${form.hasDiploma ? styles.toggleChipActive : ''}`}
                      >
                        Polytechnic Diploma
                      </button>
                    </div>
                  </div>

                  {form.has12th && (
                    <div className={styles.formGrid}>
                      <div className={styles.formCol2}>
                        <label className={styles.fieldLabel}>
                          School / Junior College Name <span className={styles.requiredAsterisk}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. St. Xavier's Junior College"
                          value={form.education12th.schoolOrCollegeName}
                          onChange={e =>
                            update('education12th', {
                              ...form.education12th,
                              schoolOrCollegeName: e.target.value,
                            })
                          }
                          className={styles.textInput}
                        />
                      </div>

                      <div className={styles.formCol2}>
                        <label className={styles.fieldLabel}>Board</label>
                        <input
                          type="text"
                          placeholder="e.g. CBSE / State Board"
                          value={form.education12th.board}
                          onChange={e =>
                            update('education12th', {
                              ...form.education12th,
                              board: e.target.value,
                            })
                          }
                          className={styles.textInput}
                        />
                      </div>

                      <div className={styles.formCol3}>
                        <label className={styles.fieldLabel}>Stream</label>
                        <input
                          type="text"
                          placeholder="e.g. Science (PCM)"
                          value={form.education12th.stream}
                          onChange={e =>
                            update('education12th', {
                              ...form.education12th,
                              stream: e.target.value,
                            })
                          }
                          className={styles.textInput}
                        />
                      </div>

                      <div className={styles.formCol3}>
                        <label className={styles.fieldLabel}>Passing Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 2022"
                          value={form.education12th.passingYear}
                          onChange={e =>
                            update('education12th', {
                              ...form.education12th,
                              passingYear: e.target.value,
                            })
                          }
                          className={styles.textInput}
                        />
                      </div>

                      <div className={styles.formCol3}>
                        <label className={styles.fieldLabel}>
                          Percentage / Marks <span className={styles.requiredAsterisk}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 89.2%"
                          value={form.education12th.percentageOrCgpa}
                          onChange={e =>
                            update('education12th', {
                              ...form.education12th,
                              percentageOrCgpa: e.target.value,
                            })
                          }
                          className={styles.textInput}
                        />
                      </div>
                    </div>
                  )}

                  {form.hasDiploma && (
                    <div className={styles.formGrid}>
                      <div className={styles.formCol2}>
                        <label className={styles.fieldLabel}>
                          Polytechnic Institute Name <span className={styles.requiredAsterisk}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Government Polytechnic"
                          value={form.educationDiploma.instituteName}
                          onChange={e =>
                            update('educationDiploma', {
                              ...form.educationDiploma,
                              instituteName: e.target.value,
                            })
                          }
                          className={styles.textInput}
                        />
                      </div>

                      <div className={styles.formCol2}>
                        <label className={styles.fieldLabel}>Branch / Specialization</label>
                        <input
                          type="text"
                          placeholder="e.g. Diploma in Computer Engineering"
                          value={form.educationDiploma.branch}
                          onChange={e =>
                            update('educationDiploma', {
                              ...form.educationDiploma,
                              branch: e.target.value,
                            })
                          }
                          className={styles.textInput}
                        />
                      </div>

                      <div className={styles.formCol2}>
                        <label className={styles.fieldLabel}>Passing Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 2022"
                          value={form.educationDiploma.passingYear}
                          onChange={e =>
                            update('educationDiploma', {
                              ...form.educationDiploma,
                              passingYear: e.target.value,
                            })
                          }
                          className={styles.textInput}
                        />
                      </div>

                      <div className={styles.formCol2}>
                        <label className={styles.fieldLabel}>
                          Percentage / CGPA <span className={styles.requiredAsterisk}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 85.5%"
                          value={form.educationDiploma.percentageOrCgpa}
                          onChange={e =>
                            update('educationDiploma', {
                              ...form.educationDiploma,
                              percentageOrCgpa: e.target.value,
                            })
                          }
                          className={styles.textInput}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: INTERNSHIPS & INDUSTRIAL EXPERIENCE */}
            {step === 3 && (
              <div className={styles.stepSection}>
                <div className={styles.sectionHeadingGroup}>
                  <h2 className={styles.sectionTitle}>Internships & Industrial Experience</h2>
                  <p className={styles.sectionSub}>
                    Record previous or ongoing internships. Note: Certificate proof is mandatory for completed
                    internships and waived for ongoing internships.
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.hasInternship}
                      onChange={e => {
                        const checked = e.target.checked;
                        update('hasInternship', checked);
                        if (checked && form.internships.length === 0) {
                          handleAddInternship();
                        }
                      }}
                      className={styles.checkboxInput}
                    />
                    <span style={{ fontWeight: 700 }}>
                      I have prior or ongoing industrial internship experience
                    </span>
                  </label>
                </div>

                {form.hasInternship && (
                  <div>
                    {form.internships.map((intern, idx) => (
                      <div key={idx} className={styles.internshipCard}>
                        <div className={styles.internshipHeader}>
                          <span className={styles.internshipIndexBadge}>Internship #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInternship(idx)}
                            className={styles.iconButton}
                            title="Remove internship entry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className={styles.formGrid}>
                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>
                              Company / Organization <span className={styles.requiredAsterisk}>*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Google, Infosys, Tech Startup"
                              value={intern.companyName}
                              onChange={e => handleUpdateInternship(idx, 'companyName', e.target.value)}
                              className={styles.textInput}
                            />
                          </div>

                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>
                              Role / Designation <span className={styles.requiredAsterisk}>*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Software Engineering Intern"
                              value={intern.role}
                              onChange={e => handleUpdateInternship(idx, 'role', e.target.value)}
                              className={styles.textInput}
                            />
                          </div>

                          <div className={styles.formCol3}>
                            <label className={styles.fieldLabel}>Work Mode</label>
                            <select
                              value={intern.workType}
                              onChange={e =>
                                handleUpdateInternship(idx, 'workType', e.target.value as any)
                              }
                              className={styles.selectInput}
                            >
                              <option value="REMOTE">Remote</option>
                              <option value="ONSITE">On-site</option>
                              <option value="HYBRID">Hybrid</option>
                            </select>
                          </div>

                          <div className={styles.formCol3}>
                            <label className={styles.fieldLabel}>Duration</label>
                            <input
                              type="text"
                              placeholder="e.g. 3 Months, Jan 2024 - Apr 2024"
                              value={intern.duration}
                              onChange={e => handleUpdateInternship(idx, 'duration', e.target.value)}
                              className={styles.textInput}
                            />
                          </div>

                          <div className={styles.formCol3}>
                            <label className={styles.fieldLabel}>Monthly Stipend</label>
                            <input
                              type="text"
                              placeholder="e.g. INR 15,000 / month or Unpaid"
                              value={intern.stipend}
                              onChange={e => handleUpdateInternship(idx, 'stipend', e.target.value)}
                              className={styles.textInput}
                            />
                          </div>

                          <div className={styles.fullWidth}>
                            <label className={styles.fieldLabel}>Role Description & Responsibilities</label>
                            <textarea
                              rows={2}
                              placeholder="Briefly describe key tasks, tech stack, and accomplishments..."
                              value={intern.description}
                              onChange={e => handleUpdateInternship(idx, 'description', e.target.value)}
                              className={styles.textArea}
                            />
                          </div>

                          {/* Internship Status & Proof Requirement */}
                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>
                              Internship Status <span className={styles.requiredAsterisk}>*</span>
                            </label>
                            <select
                              value={intern.status}
                              onChange={e =>
                                handleUpdateInternship(idx, 'status', e.target.value as any)
                              }
                              className={styles.selectInput}
                            >
                              <option value="COMPLETED">Completed (Certificate Proof Mandatory)</option>
                              <option value="ONGOING">Ongoing (Proof Waived)</option>
                            </select>
                          </div>

                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>
                              Certificate Proof Document{' '}
                              {intern.status === 'COMPLETED' ? (
                                <span className={styles.requiredAsterisk}>* Mandatory</span>
                              ) : (
                                <span style={{ color: '#64748b', fontSize: '0.74rem' }}>(Waived)</span>
                              )}
                            </label>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,application/pdf"
                              onChange={e => onSelectInternshipCert(idx, e)}
                              className={styles.textInput}
                            />
                            {uploadingCertIndex === idx && (
                              <span style={{ fontSize: '0.75rem', color: '#1c2d81', fontWeight: 600 }}>
                                Uploading certificate to S3 document lake...
                              </span>
                            )}
                          </div>
                        </div>

                        {intern.status === 'COMPLETED' && !intern.certificateProofUrl && (
                          <div className={styles.proofAlertWarning}>
                            <AlertCircle size={16} />
                            <span>
                              Certificate proof is mandatory for completed internships. Please upload an official
                              completion certificate.
                            </span>
                          </div>
                        )}

                        {intern.certificateProofUrl && (
                          <div className={styles.proofAlertSuccess}>
                            <FileCheck size={16} />
                            <span>
                              Certificate Document Attached: <code>{intern.certificateProofUrl}</code>
                            </span>
                          </div>
                        )}

                        {intern.status === 'ONGOING' && (
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: '#64748b',
                              marginTop: '8px',
                              fontStyle: 'italic',
                            }}
                          >
                            Certificate proof is waived for ongoing internships. You can upload it later once completed.
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddInternship}
                      className={styles.addSkillBtn}
                      style={{ marginTop: '8px' }}
                    >
                      <Plus size={16} />
                      <span>Add Another Internship</span>
                    </button>
                  </div>
                )}

                {!form.hasInternship && (
                  <div
                    style={{
                      padding: '32px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 'var(--radius-sm, 0px)',
                    }}
                  >
                    <Briefcase size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, color: '#334155' }}>No Prior Internships Selected</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                      You can proceed directly to skills and preferences.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: SKILLS, CAREER PREFERENCES & PORTFOLIO */}
            {step === 4 && (
              <div className={styles.stepSection}>
                <div className={styles.sectionHeadingGroup}>
                  <h2 className={styles.sectionTitle}>Skills, Preferences & Portfolio</h2>
                  <p className={styles.sectionSub}>
                    Highlight your technical proficiencies, placement willingness, preferred job roles, and portfolio
                    links.
                  </p>
                </div>

                {/* Placement Preference */}
                <div className={styles.formGrid}>
                  <div className={styles.formCol2}>
                    <label className={styles.fieldLabel}>Placement Participation</label>
                    <select
                      value={form.placementPreference}
                      onChange={e => update('placementPreference', e.target.value as any)}
                      className={styles.selectInput}
                    >
                      <option value="PLACEMENT_WILLING">Willing to participate in Campus Placements</option>
                      <option value="PLACEMENT_NOT_WILLING">Not Willing (Higher Studies / Entrepreneurship)</option>
                    </select>
                  </div>

                  <div className={styles.formCol2}>
                    <label className={styles.fieldLabel}>Preferred Work Mode</label>
                    <select
                      value={form.preferredWorkType}
                      onChange={e => update('preferredWorkType', e.target.value as any)}
                      className={styles.selectInput}
                    >
                      <option value="ANY">Any Work Mode</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="REMOTE">Remote</option>
                      <option value="ON_SITE">On-site</option>
                    </select>
                  </div>

                  {/* Target Job Roles */}
                  <div className={styles.fullWidth}>
                    <label className={styles.fieldLabel}>Preferred Job Roles</label>
                    <div className={styles.chipsContainer}>
                      {JOB_ROLES.map(r => {
                        const active = form.preferredJobRoles.includes(r);
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => toggleRole(r)}
                            className={`${styles.selectChip} ${active ? styles.selectChipActive : ''}`}
                          >
                            {active ? <Check size={13} /> : <Plus size={13} />}
                            <span>{r}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className={styles.customChipInputRow}>
                      <input
                        type="text"
                        placeholder="Add custom role..."
                        value={customRole}
                        onChange={e => setCustomRole(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomRole();
                          }
                        }}
                        className={styles.textInput}
                        style={{ maxWidth: '300px' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomRole}
                        disabled={!customRole.trim()}
                        className={styles.addCustomBtn}
                      >
                        Add Role
                      </button>
                    </div>
                  </div>

                  {/* Preferred Industries */}
                  <div className={styles.fullWidth}>
                    <label className={styles.fieldLabel}>Preferred Industries</label>
                    <div className={styles.chipsContainer}>
                      {INDUSTRIES.map(ind => {
                        const active = form.preferredIndustries.includes(ind);
                        return (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => toggleIndustry(ind)}
                            className={`${styles.selectChip} ${active ? styles.selectChipActive : ''}`}
                          >
                            {active ? <Check size={13} /> : <Plus size={13} />}
                            <span>{ind}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className={styles.customChipInputRow}>
                      <input
                        type="text"
                        placeholder="Add custom industry..."
                        value={customIndustry}
                        onChange={e => setCustomIndustry(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomIndustry();
                          }
                        }}
                        className={styles.textInput}
                        style={{ maxWidth: '300px' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomIndustry}
                        disabled={!customIndustry.trim()}
                        className={styles.addCustomBtn}
                      >
                        Add Industry
                      </button>
                    </div>
                  </div>

                  {/* Technical Skills */}
                  <div className={styles.fullWidth}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <label className={styles.fieldLabel} style={{ margin: 0 }}>Technical Skills</label>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                        {form.skills.length} skills chosen &middot; Will form your 50-Question Assessment Sections
                      </span>
                    </div>

                    {/* Department & Role Dynamic Recommendations */}
                    {(() => {
                      const dynamicSuggestions = getRecommendedSkillsForCandidate(form.department, form.preferredJobRoles);
                      const unaddedSuggestions = dynamicSuggestions.filter(s =>
                        !form.skills.some(sk => sk.skillName.toLowerCase() === s.name.toLowerCase())
                      );

                      return (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Suggested for {form.department || 'Your Department'}:
                              </span>
                              {form.preferredJobRoles.length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                  ({form.preferredJobRoles.slice(0, 2).join(', ')})
                                </span>
                              )}
                            </div>
                            {unaddedSuggestions.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const toAdd = unaddedSuggestions.map(s => ({
                                    skillName: s.name,
                                    category: s.category,
                                    proficiency: 'INTERMEDIATE' as const,
                                  }));
                                  update('skills', [...form.skills, ...toAdd]);
                                }}
                                style={{
                                  background: '#e0e7ff',
                                  color: '#1c2d81',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '4px 10px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                + Add All Suggested ({unaddedSuggestions.length})
                              </button>
                            )}
                          </div>

                          <div className={styles.popularSkillsRow} style={{ margin: 0 }}>
                            {dynamicSuggestions.map(s => {
                              const added = form.skills.some(
                                sk => sk.skillName.toLowerCase() === s.name.toLowerCase()
                              );
                              return (
                                <button
                                  key={s.name}
                                  type="button"
                                  disabled={added}
                                  onClick={() => {
                                    update('skills', [
                                      ...form.skills,
                                      {
                                        skillName: s.name,
                                        category: s.category,
                                        proficiency: 'INTERMEDIATE',
                                      },
                                    ]);
                                  }}
                                  className={`${styles.skillChip} ${added ? styles.skillChipAdded : ''}`}
                                  title={s.reason}
                                >
                                  <span>{s.name}</span>
                                  {added ? <Check size={12} /> : <Plus size={12} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}


                    <div className={styles.addSkillFormRow}>
                      <input
                        type="text"
                        placeholder="Skill name (e.g. Next.js, Kubernetes)"
                        value={newSkillName}
                        onChange={e => setNewSkillName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        className={styles.textInput}
                        style={{ flex: 2 }}
                      />
                      <select
                        value={newSkillCategory}
                        onChange={e => setNewSkillCategory(e.target.value)}
                        className={styles.selectInput}
                        style={{ flex: 1 }}
                      >
                        <option value="Languages">Languages</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Database">Database</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Cloud">Cloud</option>
                        <option value="AI_ML">AI / ML</option>
                        <option value="Tools">Tools</option>
                      </select>
                      <select
                        value={newSkillProficiency}
                        onChange={e => setNewSkillProficiency(e.target.value as any)}
                        className={styles.selectInput}
                        style={{ flex: 1 }}
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="EXPERT">Expert</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={!newSkillName.trim()}
                        className={styles.addSkillBtn}
                      >
                        Add Skill
                      </button>
                    </div>

                    {form.skills.length > 0 && (
                      <div className={styles.addedSkillsGrid}>
                        {form.skills.map((s, idx) => (
                          <div key={idx} className={styles.addedSkillCard}>
                            <div>
                              <div className={styles.addedSkillName}>{s.skillName}</div>
                              <div className={styles.addedSkillCat}>
                                {s.category} • {s.proficiency}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                update(
                                  'skills',
                                  form.skills.filter((_, i) => i !== idx)
                                )
                              }
                              className={styles.removeSkillBtn}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Projects */}
                  <div className={styles.fullWidth}>
                    <div className={styles.sectionSubHeader}>
                      <h4 className={styles.subHeaderTitle}>
                        <FolderGit2 size={16} />
                        Academic & Personal Projects
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddProject(v => !v)}
                        className={styles.addInlineBtn}
                      >
                        <Plus size={14} />
                        <span>Add Project</span>
                      </button>
                    </div>

                    {showAddProject && (
                      <div className={styles.inlineFormBox}>
                        <div className={styles.formGrid}>
                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>Project Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Distributed Task Scheduler"
                              value={newProject.name}
                              onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                              className={styles.textInput}
                            />
                          </div>
                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>Technologies Used</label>
                            <input
                              type="text"
                              placeholder="e.g. React, Spring Boot, PostgreSQL"
                              value={newProject.technologies}
                              onChange={e =>
                                setNewProject(p => ({ ...p, technologies: e.target.value }))
                              }
                              className={styles.textInput}
                            />
                          </div>
                          <div className={styles.fullWidth}>
                            <label className={styles.fieldLabel}>Description</label>
                            <textarea
                              rows={2}
                              placeholder="Brief description of the project..."
                              value={newProject.description}
                              onChange={e =>
                                setNewProject(p => ({ ...p, description: e.target.value }))
                              }
                              className={styles.textArea}
                            />
                          </div>
                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>GitHub Repository URL</label>
                            <input
                              type="url"
                              placeholder="https://github.com/..."
                              value={newProject.githubUrl}
                              onChange={e =>
                                setNewProject(p => ({ ...p, githubUrl: e.target.value }))
                              }
                              className={styles.textInput}
                            />
                          </div>
                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>Live Demo URL</label>
                            <input
                              type="url"
                              placeholder="https://..."
                              value={newProject.liveUrl}
                              onChange={e =>
                                setNewProject(p => ({ ...p, liveUrl: e.target.value }))
                              }
                              className={styles.textInput}
                            />
                          </div>
                        </div>
                        <div className={styles.inlineFormActions}>
                          <button
                            type="button"
                            onClick={() => setShowAddProject(false)}
                            className={styles.cancelInlineBtn}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveProject}
                            disabled={!newProject.name.trim()}
                            className={styles.saveInlineBtn}
                          >
                            Save Project
                          </button>
                        </div>
                      </div>
                    )}

                    {form.projects.length > 0 && (
                      <div className={styles.itemsList}>
                        {form.projects.map((p, idx) => (
                          <div key={idx} className={styles.itemCard}>
                            <div className={styles.itemMain}>
                              <div className={styles.itemTitle}>{p.name}</div>
                              <div className={styles.itemSub}>{p.technologies}</div>
                              {p.description && (
                                <p className={styles.itemDesc}>{p.description}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                update(
                                  'projects',
                                  form.projects.filter((_, i) => i !== idx)
                                )
                              }
                              className={styles.iconButton}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className={styles.fullWidth}>
                    <div className={styles.sectionSubHeader}>
                      <h4 className={styles.subHeaderTitle}>
                        <Award size={16} />
                        Professional Certifications
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddCert(v => !v)}
                        className={styles.addInlineBtn}
                      >
                        <Plus size={14} />
                        <span>Add Certification</span>
                      </button>
                    </div>

                    {showAddCert && (
                      <div className={styles.inlineFormBox}>
                        <div className={styles.formGrid}>
                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>Certification Name</label>
                            <input
                              type="text"
                              placeholder="e.g. AWS Certified Solutions Architect"
                              value={newCert.name}
                              onChange={e => setNewCert(c => ({ ...c, name: e.target.value }))}
                              className={styles.textInput}
                            />
                          </div>
                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>Issuing Organization</label>
                            <input
                              type="text"
                              placeholder="e.g. Amazon Web Services"
                              value={newCert.issuingOrg}
                              onChange={e =>
                                setNewCert(c => ({ ...c, issuingOrg: e.target.value }))
                              }
                              className={styles.textInput}
                            />
                          </div>
                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>Credential ID</label>
                            <input
                              type="text"
                              placeholder="e.g. AWS-12345"
                              value={newCert.credentialId}
                              onChange={e =>
                                setNewCert(c => ({ ...c, credentialId: e.target.value }))
                              }
                              className={styles.textInput}
                            />
                          </div>
                          <div className={styles.formCol2}>
                            <label className={styles.fieldLabel}>Credential URL</label>
                            <input
                              type="url"
                              placeholder="https://..."
                              value={newCert.credentialUrl}
                              onChange={e =>
                                setNewCert(c => ({ ...c, credentialUrl: e.target.value }))
                              }
                              className={styles.textInput}
                            />
                          </div>
                        </div>
                        <div className={styles.inlineFormActions}>
                          <button
                            type="button"
                            onClick={() => setShowAddCert(false)}
                            className={styles.cancelInlineBtn}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveCert}
                            disabled={!newCert.name.trim()}
                            className={styles.saveInlineBtn}
                          >
                            Save Certification
                          </button>
                        </div>
                      </div>
                    )}

                    {form.certifications.length > 0 && (
                      <div className={styles.itemsList}>
                        {form.certifications.map((c, idx) => (
                          <div key={idx} className={styles.itemCard}>
                            <div className={styles.itemMain}>
                              <div className={styles.itemTitle}>{c.name}</div>
                              <div className={styles.itemSub}>{c.issuingOrg}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                update(
                                  'certifications',
                                  form.certifications.filter((_, i) => i !== idx)
                                )
                              }
                              className={styles.iconButton}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resume Upload */}
                  <div className={styles.fullWidth}>
                    <label className={styles.fieldLabel}>Resume / Curriculum Vitae (PDF)</label>
                    <div
                      className={styles.dropzoneContainer}
                      onClick={() => resumeFileRef.current?.click()}
                    >
                      <input
                        ref={resumeFileRef}
                        type="file"
                        accept="application/pdf"
                        onChange={onSelectResume}
                        className={styles.dropzoneInput}
                      />
                      <FileText size={30} style={{ color: '#1c2d81', marginBottom: '8px' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                        {uploadingResume
                          ? 'Uploading Resume to S3 Document Lake...'
                          : 'Click to upload Resume (PDF, Max 10MB)'}
                      </div>
                    </div>
                    {form.resumeUrl && (
                      <div className={styles.idCardPreviewBox} style={{ marginTop: '10px' }}>
                        <FileText size={28} style={{ color: '#1c2d81' }} />
                        <div className={styles.idCardMeta}>
                          <div className={styles.idCardTitle}>Resume Attached</div>
                          <div className={styles.idCardUrl}>{form.resumeUrl}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => update('resumeUrl', '')}
                          className={styles.iconButton}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: DATA PERSISTENCE ARCHITECTURE LEDGER & ACTIVATION */}
            {step === 5 && (
              <div className={styles.stepSection}>
                <div className={styles.sectionHeadingGroup}>
                  <h2 className={styles.sectionTitle}>Data Persistence Architecture Ledger</h2>
                  <p className={styles.sectionSub}>
                    Transparency audit: Here is the exact architectural ledger showing where every data point you have
                    provided will be persisted in our distributed database cluster and Amazon S3 storage lake.
                  </p>
                </div>

                <div className={styles.ledgerIntro}>
                  <strong>Account Status Notice:</strong> Your student account is initialized with{' '}
                  <code>email_verified = false</code> and <code>verified = false</code> pending official institutional
                  validation by your Training &amp; Placement Officer (TPO).
                </div>

                {/* Ledger Cards Grid */}
                <div className={styles.ledgerGrid}>
                  {/* Table 1: users */}
                  <div className={styles.ledgerCard}>
                    <div className={styles.ledgerCardHeader}>
                      <span className={styles.ledgerTableTitle}>
                        <Database size={15} />
                        Table: users
                      </span>
                      <span className={styles.ledgerLayerBadge}>Identity Layer</span>
                    </div>
                    <div className={styles.ledgerFieldsList}>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>id</span>
                        <span className={styles.ledgerFieldDesc}>UUID primary key</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>email</span>
                        <span className={styles.ledgerFieldDesc}>{user?.email || 'student@university.edu'}</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>display_name</span>
                        <span className={styles.ledgerFieldDesc}>
                          {form.firstName} {form.middleName ? form.middleName + ' ' : ''}
                          {form.lastName}
                        </span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>role</span>
                        <span className={styles.ledgerFieldDesc}>STUDENT</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>email_verified</span>
                        <span className={styles.statusPendingBadge}>false (Unverified)</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>status</span>
                        <span className={styles.statusPendingBadge}>PENDING_VERIFICATION</span>
                      </div>
                    </div>
                  </div>

                  {/* Table 2: student_profiles */}
                  <div className={styles.ledgerCard}>
                    <div className={styles.ledgerCardHeader}>
                      <span className={styles.ledgerTableTitle}>
                        <Server size={15} />
                        Table: student_profiles
                      </span>
                      <span className={styles.ledgerLayerBadge}>Profile Service</span>
                    </div>
                    <div className={styles.ledgerFieldsList}>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>aicte_code</span>
                        <span className={styles.ledgerFieldDesc}>{form.aicteCode ? `${form.aicteCode} (Linked from Approved Campus)` : 'Auto-populated'}</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>institution</span>
                        <span className={styles.ledgerFieldDesc}>{form.institution}</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>student_id_card_url</span>
                        <span className={styles.ledgerFieldDesc} title={form.studentIdCardUrl}>
                          {form.studentIdCardUrl ? 'S3 Key Attached' : 'None'}
                        </span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>education_10th</span>
                        <span className={styles.ledgerFieldDesc}>
                          {form.education10th.schoolName} ({form.education10th.percentageOrCgpa})
                        </span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>
                          {form.has12th ? 'education_12th' : 'education_diploma'}
                        </span>
                        <span className={styles.ledgerFieldDesc}>
                          {form.has12th
                            ? `${form.education12th.schoolOrCollegeName} (${form.education12th.percentageOrCgpa})`
                            : `${form.educationDiploma.instituteName} (${form.educationDiploma.percentageOrCgpa})`}
                        </span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>internship_experience</span>
                        <span className={styles.ledgerFieldDesc}>
                          {form.hasInternship ? `${form.internships.length} recorded` : 'None'}
                        </span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>verification_status</span>
                        <span className={styles.statusPendingBadge}>PENDING</span>
                      </div>
                    </div>
                  </div>

                  {/* Table 3: institution_students */}
                  <div className={styles.ledgerCard}>
                    <div className={styles.ledgerCardHeader}>
                      <span className={styles.ledgerTableTitle}>
                        <School size={15} />
                        Table: institution_students
                      </span>
                      <span className={styles.ledgerLayerBadge}>Campus Roster</span>
                    </div>
                    <div className={styles.ledgerFieldsList}>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>institution_id</span>
                        <span className={styles.ledgerFieldDesc}>{form.institutionId ? 'Linked to Campus Entity' : 'Resolved via Selected Campus'}</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>department</span>
                        <span className={styles.ledgerFieldDesc}>{form.department}</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>batch</span>
                        <span className={styles.ledgerFieldDesc}>{form.academicYear}</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>placement_status</span>
                        <span className={styles.ledgerFieldDesc}>PENDING_VERIFICATION</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>verified</span>
                        <span className={styles.statusPendingBadge}>false (Awaiting TPO)</span>
                      </div>
                    </div>
                  </div>

                  {/* S3 Storage Lake */}
                  <div className={styles.ledgerCard}>
                    <div className={styles.ledgerCardHeader}>
                      <span className={styles.ledgerTableTitle}>
                        <HardDrive size={15} />
                        Amazon S3 Document Lake
                      </span>
                      <span className={styles.ledgerLayerBadge}>Object Storage</span>
                    </div>
                    <div className={styles.ledgerFieldsList}>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>Bucket</span>
                        <span className={styles.ledgerFieldDesc}>s3://beyon-documents</span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>Student ID Card</span>
                        <span className={styles.ledgerFieldDesc}>
                          {form.studentIdCardUrl ? 'documents/STUDENT_ID_CARD/...' : 'None'}
                        </span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>Internship Proofs</span>
                        <span className={styles.ledgerFieldDesc}>
                          {form.internships.filter(i => i.certificateProofUrl).length} Certificate(s)
                        </span>
                      </div>
                      <div className={styles.ledgerFieldRow}>
                        <span className={styles.ledgerFieldName}>Resume Object</span>
                        <span className={styles.ledgerFieldDesc}>
                          {form.resumeUrl ? 'documents/RESUME/...' : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Confirmation Summary */}
                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c2d81', marginBottom: '12px' }}>
                    Student Information Summary
                  </h4>
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      borderRadius: 'var(--radius-sm, 0px)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '12px',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div>
                      <strong>Full Name:</strong> {form.firstName} {form.middleName} {form.lastName}
                    </div>
                    <div>
                      <strong>Institution:</strong> {form.institution}
                    </div>
                    <div>
                      <strong>AICTE Code:</strong> {form.aicteCode}
                    </div>
                    <div>
                      <strong>Program:</strong> {form.degree} - {form.department}
                    </div>
                    <div>
                      <strong>Academic Year:</strong> {form.academicYear} (CGPA: {form.cgpa})
                    </div>
                    <div>
                      <strong>Internships:</strong> {form.hasInternship ? `${form.internships.length} added` : 'None'}
                    </div>
                    <div>
                      <strong>Technical Skills:</strong> {form.skills.length} skills recorded
                    </div>
                    <div>
                      <strong>Projects:</strong> {form.projects.length} projects documented
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className={styles.navigationFooter}>
              {step > 0 ? (
                <button type="button" onClick={handleBack} className={styles.backButton}>
                  <ChevronLeft size={16} />
                  <span>Previous Step</span>
                </button>
              ) : (
                <div />
              )}

              <span className={styles.stepCounterText}>
                Step {step + 1} of {STEPS.length}: {STEPS[step].label}
              </span>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={styles.nextButton}
                >
                  <span>Continue</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={styles.nextButton}
                  style={{ background: '#15803d', borderColor: '#15803d' }}
                >
                  {loading ? 'Persisting Profile...' : 'Complete Onboarding & Claim 100 Coins'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Internal Sparkles fallback icon without emoji
function SparklesIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}
