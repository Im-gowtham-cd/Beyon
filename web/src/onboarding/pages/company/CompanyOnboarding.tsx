import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Code2,
  Users,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Globe,
  Phone,
  Mail,
  User,
  Award,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import { api } from '../../../services/api/client';
import type { CompanyFormData, CompanyRepresentativeEntry } from '../../types/onboarding';
import { EMPTY_COMPANY_FORM } from '../../types/onboarding';
import styles from '../student/StudentOnboarding.module.css';

const STEPS = [
  { label: 'Corporate Identity', sub: 'Legal name & headquarters', icon: Building2 },
  { label: 'Talent Acquisition', sub: 'HR leads & hiring models', icon: Users },
  { label: 'Recruitment Criteria', sub: 'Skills, degrees & CGPA', icon: Code2 },
  { label: 'Review & Verify', sub: 'Submit for Super Admin review', icon: ShieldCheck },
];

const COMPANY_TYPES = [
  'Global Enterprise / MNC',
  'Private Limited Entity',
  'High-Growth Tech Unicorn / Scaleup',
  'Public Listed Corporation',
  'Management & IT Consultancy',
  'Public Sector Undertaking (PSU)',
];

const INDUSTRIES = [
  'Information Technology & Cloud Software',
  'FinTech & Digital Banking',
  'HealthTech & BioServices',
  'Artificial Intelligence & DeepTech',
  'E-commerce & Supply Chain',
  'Cybersecurity & Network Systems',
  'Automotive & Autonomous Systems',
  'Management Consulting & Strategy',
  'Telecommunications & 5G Systems',
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+ Employees'];

const HIRING_PROGRAMS = [
  'Full-time Graduate Engineering Trainee (GET)',
  '6-Month Product Development Internship',
  'Pre-Placement Offer (PPO) Fast-track',
  'Summer Analyst / Technology Intern',
  'Direct Enterprise Campus Placement',
];

const DEGREES_OFFERED = ['B.E / B.Tech', 'M.E / M.Tech', 'MCA', 'BCA', 'M.Sc (CS/IT)', 'MBA / Tech-Management'];

const ELIGIBLE_BATCHES = ['2024 Batch', '2025 Batch', '2026 Batch', '2027 Batch'];

const POPULAR_SKILLS = [
  'Java',
  'Spring Boot',
  'Python',
  'React',
  'TypeScript',
  'Node.js',
  'SQL / PostgreSQL',
  'AWS Cloud',
  'Docker & Kubernetes',
  'Machine Learning & PyTorch',
  'Go / Golang',
  'Microservices Architecture',
];

export function CompanyOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfileStatus } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CompanyFormData>({
    ...EMPTY_COMPANY_FORM,
    companyName: user?.name || '',
    officialEmail: user?.email || '',
    companyType: 'Global Enterprise / MNC',
    industry: 'Information Technology & Cloud Software',
    companySize: '501-1000',
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    hiringTypes: ['Full-time Graduate Engineering Trainee (GET)', '6-Month Product Development Internship'],
    skills: ['Java', 'Spring Boot', 'TypeScript', 'React', 'SQL / PostgreSQL'],
    representatives: [
      {
        name: '',
        designation: 'Head of University Relations & Talent Acquisition',
        email: user?.email || '',
        phone: '',
      },
    ],
  });

  const [minCgpa, setMinCgpa] = useState('7.0');
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>(['B.E / B.Tech', 'M.E / M.Tech', 'MCA']);
  const [selectedBatches, setSelectedBatches] = useState<string[]>(['2025 Batch', '2026 Batch']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showAddRep, setShowAddRep] = useState(false);
  const [newRep, setNewRep] = useState<CompanyRepresentativeEntry>({
    name: '',
    designation: 'Technical Recruiter',
    email: '',
    phone: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const update = <K extends keyof CompanyFormData>(key: K, value: CompanyFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleHiringProgram = (prog: string) => {
    const current = form.hiringTypes || [];
    if (current.includes(prog)) {
      update('hiringTypes', current.filter((p) => p !== prog));
    } else {
      update('hiringTypes', [...current, prog]);
    }
  };

  const toggleSkill = (skill: string) => {
    const current = form.skills || [];
    if (current.includes(skill)) {
      update('skills', current.filter((s) => s !== skill));
    } else {
      update('skills', [...current, skill]);
    }
  };

  const toggleDegree = (deg: string) => {
    if (selectedDegrees.includes(deg)) {
      setSelectedDegrees(selectedDegrees.filter((d) => d !== deg));
    } else {
      setSelectedDegrees([...selectedDegrees, deg]);
    }
  };

  const toggleBatch = (batch: string) => {
    if (selectedBatches.includes(batch)) {
      setSelectedBatches(selectedBatches.filter((b) => b !== batch));
    } else {
      setSelectedBatches([...selectedBatches, batch]);
    }
  };

  const addRepresentative = () => {
    if (!newRep.name.trim() || !newRep.email.trim()) {
      setError('Please enter recruiter name and official email.');
      return;
    }
    update('representatives', [...(form.representatives || []), newRep]);
    setNewRep({
      name: '',
      designation: 'Technical Recruiter',
      email: '',
      phone: '',
    });
    setShowAddRep(false);
    setError('');
  };

  const removeRepresentative = (index: number) => {
    update(
      'representatives',
      form.representatives.filter((_, i) => i !== index)
    );
  };

  const validateStep = (): boolean => {
    setError('');
    if (step === 0) {
      if (!form.companyName.trim()) {
        setError('Corporate Legal Name is required.');
        return false;
      }
      if (!form.companyType) {
        setError('Company Classification is required.');
        return false;
      }
      if (!form.industry) {
        setError('Industry Sector is required.');
        return false;
      }
      if (!form.website.trim()) {
        setError('Official corporate website URL is required.');
        return false;
      }
      if (!form.officialEmail.trim() || !form.officialEmail.includes('@')) {
        setError('Valid official corporate email is required.');
        return false;
      }
      if (!form.phone.trim()) {
        setError('Official contact phone number is required.');
        return false;
      }
      if (!form.headquarters.trim() || !form.city.trim() || !form.state.trim() || !form.country.trim()) {
        setError('Full headquarters street address, city, state, and country are required.');
        return false;
      }
      if (!form.about.trim()) {
        setError('Corporate overview / description is required.');
        return false;
      }
    } else if (step === 1) {
      if (!form.hiringTypes || form.hiringTypes.length === 0) {
        setError('Please select at least one campus hiring program.');
        return false;
      }
      if (!form.representatives || form.representatives.length === 0) {
        setError('Please provide at least one authorized Talent Acquisition / HR leader.');
        return false;
      }
      const primary = form.representatives[0];
      if (!primary.name.trim() || !primary.email.trim()) {
        setError('Primary Talent Acquisition Leader Name and Email are required.');
        return false;
      }
    } else if (step === 2) {
      if (!form.skills || form.skills.length === 0) {
        setError('Please select at least one core recruitment technology / skill.');
        return false;
      }
      if (selectedDegrees.length === 0) {
        setError('Please select target candidate degrees.');
        return false;
      }
      if (selectedBatches.length === 0) {
        setError('Please select eligible graduation batches.');
        return false;
      }
    } else if (step === 3) {
      if (!agreeTerms) {
        setError('Please certify and agree to the corporate recruitment verification terms.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/onboarding/company', {
        ...form,
        minCgpa,
        preferredDegrees: selectedDegrees,
        eligibleBatches: selectedBatches,
      });
      await refreshProfileStatus();
      navigate('/onboarding/complete');
    } catch {
      setError('We could not submit your company profile. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = Math.round(((step + 1) / STEPS.length) * 100);
  const currentStepData = STEPS[step];
  const StepIcon = currentStepData.icon;

  return (
    <div className={styles.pageContainer}>

      <header className={styles.topHeader}>
        <Link to="/" className={styles.brandLink}>
          <div className={styles.brandLogo}>B</div>
          <div className={styles.brandTextGroup}>
            <span className={styles.brandName}>BEYON</span>
            <span className={styles.brandTag}>Company Onboarding</span>
          </div>
        </Link>
        <div className={styles.headerRight}>
          <div className={styles.rewardBadge}>
            <ShieldCheck size={14} color="#b45309" />
            <span>Super Admin Verification Queue</span>
          </div>
          <div className={styles.stepIndicatorBadge}>
            <span className={styles.stepHighlight}>Step {step + 1}</span> of {STEPS.length} ({progressPercent}%)
          </div>
        </div>
      </header>

      <div className={styles.heroWrapper}>
        <div className={styles.welcomeHero}>
          <div className={styles.badgeRow}>
            <div className={styles.portalBadge}>
              <Sparkles size={12} />
              Corporate Recruiter Portal
            </div>
            <div className={styles.verifiedBadge}>
              <CheckCircle2 size={12} />
              Enterprise Verification &amp; Campus Authorization
            </div>
          </div>
          <h1 className={styles.welcomeTitle}>
            {form.companyName ? form.companyName : 'Setup Corporate Employer Profile'}
          </h1>
          <p className={styles.welcomeSub}>
            Complete your corporate credentials, talent acquisition leadership, and hiring requirements to connect directly with accredited higher-education institutions and verified scholars.
          </p>
          <div className={styles.progressStrip}>
            <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className={styles.mainWorkspace}>

        <aside className={styles.asideGuide}>

          <div className={styles.currentStepInfoCard}>
            <span className={styles.stepNumLabel}>
              <StepIcon size={14} /> Step {step + 1}
            </span>
            <h3 className={styles.stepHeading}>{currentStepData.label}</h3>
            <p className={styles.stepDesc}>
              {step === 0 && 'Provide official corporate entity details, industry classification, and headquarters address.'}
              {step === 1 && 'Register authorized Talent Acquisition leads, recruiters, and target campus hiring models.'}
              {step === 2 && 'Define technical stack requirements, minimum academic CGPA, and eligible graduation batches.'}
              {step === 3 && 'Perform a final audit of all corporate credentials before submission for Super Admin verification.'}
            </p>
          </div>

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
                    className={`${styles.trackerItem} ${isActive ? styles.trackerItemActive : ''} ${
                      isCompleted ? styles.trackerItemCompleted : ''
                    } ${idx > step ? styles.trackerItemDisabled : ''}`}
                  >
                    <div
                      className={`${styles.trackerIconBox} ${
                        isActive ? styles.trackerIconBoxActive : ''
                      } ${isCompleted ? styles.trackerIconBoxCompleted : ''}`}
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

          <div className={styles.benefitsCard}>
            <div className={styles.benefitsTitle}>
              <HelpCircle size={14} color="#1c2d81" /> Enterprise Benefits
            </div>
            <ul className={styles.benefitsList}>
              <li className={styles.benefitItem}>
                <Award size={14} className={styles.benefitIcon} />
                <span>Verified <strong>Recruiter Badge</strong> on all campus placement drives.</span>
              </li>
              <li className={styles.benefitItem}>
                <Building2 size={14} className={styles.benefitIcon} />
                <span>Access to <strong>100+ accredited university</strong> student rosters.</span>
              </li>
              <li className={styles.benefitItem}>
                <Layers size={14} className={styles.benefitIcon} />
                <span>Automated proctored coding assessments and AI evaluations.</span>
              </li>
              <li className={styles.benefitItem}>
                <ShieldCheck size={14} className={styles.benefitIcon} />
                <span>Direct integration with campus Training &amp; Placement Officers (TPO).</span>
              </li>
            </ul>
          </div>
        </aside>

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

          {step === 0 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <Building2 size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>1. Corporate Identity &amp; Headquarters Details</h2>
                  <p className={styles.sectionSubtitle}>
                    Official registered company credentials verified by the Super Administrator.
                  </p>
                </div>
              </div>

              <div className={styles.fieldsGrid}>
                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel} htmlFor="compName">
                    <Building2 size={13} /> Corporate Legal Name <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="compName"
                    type="text"
                    placeholder="e.g., Microsoft Corporation / Infosys Limited"
                    value={form.companyName}
                    onChange={(e) => update('companyName', e.target.value)}
                    className={styles.textInput}
                  />
                  <span className={styles.fieldHint}>Official registered business name</span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="compType">
                    Entity Classification <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <select
                    id="compType"
                    value={form.companyType}
                    onChange={(e) => update('companyType', e.target.value)}
                    className={styles.selectInput}
                  >
                    {COMPANY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="ind">
                    Industry Sector <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <select
                    id="ind"
                    value={form.industry}
                    onChange={(e) => update('industry', e.target.value)}
                    className={styles.selectInput}
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="compSize">
                    Company Headcount Scale <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <select
                    id="compSize"
                    value={form.companySize}
                    onChange={(e) => update('companySize', e.target.value)}
                    className={styles.selectInput}
                  >
                    {COMPANY_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="compEmail">
                    <Mail size={13} /> Official Corporate Email <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="compEmail"
                    type="email"
                    placeholder="e.g., campus-hiring@microsoft.com"
                    value={form.officialEmail}
                    onChange={(e) => update('officialEmail', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="compPhone">
                    <Phone size={13} /> Corporate Contact Phone <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="compPhone"
                    type="tel"
                    placeholder="e.g., +91 80 6789 1234"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel} htmlFor="compWeb">
                    <Globe size={13} /> Official Corporate Website URL <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="compWeb"
                    type="url"
                    placeholder="e.g., https://careers.microsoft.com"
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel} htmlFor="hq">
                    <MapPin size={13} /> Headquarters Street Address <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="hq"
                    type="text"
                    placeholder="e.g., Outer Ring Road, Bellandur"
                    value={form.headquarters}
                    onChange={(e) => update('headquarters', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="city">
                    City <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="e.g., Bengaluru"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="state">
                    State / Province <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="state"
                    type="text"
                    placeholder="e.g., Karnataka"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="country">
                    Country <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={form.country}
                    onChange={(e) => update('country', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel} htmlFor="about">
                    Corporate Overview &amp; Mission <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <textarea
                    id="about"
                    placeholder="Briefly describe your company culture, technology domains, and career acceleration tracks for fresh engineering graduates..."
                    value={form.about}
                    onChange={(e) => update('about', e.target.value)}
                    className={`${styles.textInput} ${styles.textareaInput}`}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <Users size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>2. Talent Acquisition Leadership &amp; Hiring Programs</h2>
                  <p className={styles.sectionSubtitle}>
                    Designate primary recruiting leads and campus recruitment models offered to partner colleges.
                  </p>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px 20px', border: '1px solid #cbd5e1', borderLeft: '4px solid #1c2d81' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <User size={16} color="#1c2d81" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Head of Talent Acquisition / University Relations
                  </h3>
                </div>
                <div className={styles.fieldsGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Full Name <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Sarah Jenkins"
                      value={form.representatives?.[0]?.name || ''}
                      onChange={(e) => {
                        const updated = [...(form.representatives || [])];
                        updated[0] = { ...updated[0], name: e.target.value };
                        update('representatives', updated);
                      }}
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Official Work Email <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g., sarah.jenkins@company.com"
                      value={form.representatives?.[0]?.email || ''}
                      onChange={(e) => {
                        const updated = [...(form.representatives || [])];
                        updated[0] = { ...updated[0], email: e.target.value };
                        update('representatives', updated);
                      }}
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Direct Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g., +91 98765 43210"
                      value={form.representatives?.[0]?.phone || ''}
                      onChange={(e) => {
                        const updated = [...(form.representatives || [])];
                        updated[0] = { ...updated[0], phone: e.target.value };
                        update('representatives', updated);
                      }}
                      className={styles.textInput}
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px 20px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  Target Campus Hiring Programs <span className={styles.requiredAsterisk}>*</span>
                </h3>
                <span className={styles.fieldHint} style={{ display: 'block', marginBottom: '12px' }}>
                  Select the recruitment tracks your organization conducts on campus:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                  {HIRING_PROGRAMS.map((prog) => {
                    const isSelected = form.hiringTypes?.includes(prog);
                    return (
                      <button
                        type="button"
                        key={prog}
                        onClick={() => toggleHiringProgram(prog)}
                        style={{
                          padding: '10px 14px',
                          background: isSelected ? '#1c2d81' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334155',
                          border: isSelected ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left',
                          borderRadius: '0px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '0px',
                            background: isSelected ? '#fed601' : '#f1f5f9',
                            color: isSelected ? '#1c2d81' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          ✓
                        </div>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prog}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px 20px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={16} color="#1c2d81" />
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Additional Technical Recruiters ({Math.max(0, (form.representatives?.length || 1) - 1)})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddRep(true)}
                    className={styles.backButton}
                    style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  >
                    <Plus size={14} /> Add Recruiter
                  </button>
                </div>

                {showAddRep && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', marginBottom: '16px' }}>
                    <div className={styles.fieldsGrid}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Recruiter Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Alex Rivera"
                          value={newRep.name}
                          onChange={(e) => setNewRep({ ...newRep, name: e.target.value })}
                          className={styles.textInput}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Designation</label>
                        <input
                          type="text"
                          placeholder="e.g., Lead Technical Recruiter"
                          value={newRep.designation}
                          onChange={(e) => setNewRep({ ...newRep, designation: e.target.value })}
                          className={styles.textInput}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Official Email</label>
                        <input
                          type="email"
                          placeholder="e.g., alex.rivera@company.com"
                          value={newRep.email}
                          onChange={(e) => setNewRep({ ...newRep, email: e.target.value })}
                          className={styles.textInput}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Phone</label>
                        <input
                          type="tel"
                          placeholder="e.g., +91 98765 00000"
                          value={newRep.phone}
                          onChange={(e) => setNewRep({ ...newRep, phone: e.target.value })}
                          className={styles.textInput}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={addRepresentative}
                        className={styles.nextButton}
                        style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                      >
                        Save Recruiter
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddRep(false)}
                        className={styles.backButton}
                        style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {form.representatives && form.representatives.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {form.representatives.slice(1).map((rep, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 16px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderLeft: '3px solid #1c2d81',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>{rep.name}</strong>
                          <span style={{ fontSize: '0.76rem', color: '#64748b', marginLeft: '8px' }}>
                            ({rep.designation})
                          </span>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                            {rep.email} {rep.phone && `&middot; ${rep.phone}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRepresentative(idx + 1)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <Code2 size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>3. Recruitment Criteria &amp; Technology Stack</h2>
                  <p className={styles.sectionSubtitle}>
                    Select candidate eligibility parameters, target academic degrees, and core technologies.
                  </p>
                </div>
              </div>

              <div className={styles.fieldsGrid}>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="minCgpa">
                    Minimum CGPA Cutoff <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <select
                    id="minCgpa"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="6.0">6.0 CGPA &amp; Above</option>
                    <option value="6.5">6.5 CGPA &amp; Above</option>
                    <option value="7.0">7.0 CGPA &amp; Above (Standard)</option>
                    <option value="7.5">7.5 CGPA &amp; Above</option>
                    <option value="8.0">8.0 CGPA &amp; Above (High Cutoff)</option>
                    <option value="8.5">8.5 CGPA &amp; Above</option>
                  </select>
                  <span className={styles.fieldHint}>Minimum academic score across semester exams</span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Eligible Graduation Batches <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {ELIGIBLE_BATCHES.map((batch) => {
                      const isSelected = selectedBatches.includes(batch);
                      return (
                        <button
                          type="button"
                          key={batch}
                          onClick={() => toggleBatch(batch)}
                          style={{
                            padding: '8px 12px',
                            background: isSelected ? '#1c2d81' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#334155',
                            border: isSelected ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {batch}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel}>
                    Target Academic Degrees <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <span className={styles.fieldHint} style={{ marginBottom: '8px' }}>
                    Select all undergraduate and postgraduate degrees eligible for your drives:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                    {DEGREES_OFFERED.map((deg) => {
                      const isSelected = selectedDegrees.includes(deg);
                      return (
                        <button
                          type="button"
                          key={deg}
                          onClick={() => toggleDegree(deg)}
                          style={{
                            padding: '9px 12px',
                            background: isSelected ? '#1c2d81' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#334155',
                            border: isSelected ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span style={{ color: isSelected ? '#fed601' : '#94a3b8', fontWeight: 900 }}>
                            {isSelected ? '✓' : '+'}
                          </span>
                          <span>{deg}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel}>
                    Core Technical Stack &amp; Skills <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <span className={styles.fieldHint} style={{ marginBottom: '8px' }}>
                    Choose primary technologies used for screening and AI skill benchmarking:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px' }}>
                    {POPULAR_SKILLS.map((skill) => {
                      const isSelected = form.skills?.includes(skill);
                      return (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          style={{
                            padding: '9px 12px',
                            background: isSelected ? '#1c2d81' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#334155',
                            border: isSelected ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span style={{ color: isSelected ? '#fed601' : '#94a3b8', fontWeight: 900 }}>
                            {isSelected ? '✓' : '+'}
                          </span>
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <ShieldCheck size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>4. Review Credentials &amp; Super Admin Verification</h2>
                  <p className={styles.sectionSubtitle}>
                    Review your corporate profile details before final submission for Super Admin platform authorization.
                  </p>
                </div>
              </div>

              <div className={styles.rewardCallout}>
                <div className={styles.rewardCalloutIcon}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className={styles.rewardCalloutTitle}>Super Administrator Corporate Verification Protocol</h4>
                  <p className={styles.rewardCalloutText}>
                    Upon submission, your corporate account enters <code>PENDING_SUPER_ADMIN_VERIFICATION</code>. The Super Administrator (`superadmin@beyon.io`) inspects your corporate domain, CIN registration, and talent leadership before authorizing campus placement drives and candidate pipeline access.
                  </p>
                </div>
              </div>

              <div className={styles.reviewGrid}>
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <span className={styles.reviewCardTitle}>
                      <Building2 size={13} /> Corporate Identity
                    </span>
                    <button type="button" onClick={() => setStep(0)} className={styles.editLinkBtn}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewRowsList}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Company Name</span>
                      <span className={styles.reviewValue}>{form.companyName}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Type &amp; Industry</span>
                      <span className={styles.reviewValue}>{form.companyType} &middot; {form.industry}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Scale</span>
                      <span className={styles.reviewValue}>{form.companySize}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Official Email</span>
                      <span className={styles.reviewValue}>{form.officialEmail}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Location</span>
                      <span className={styles.reviewValue}>{form.city}, {form.state}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <span className={styles.reviewCardTitle}>
                      <Code2 size={13} /> Recruitment Criteria
                    </span>
                    <button type="button" onClick={() => setStep(2)} className={styles.editLinkBtn}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewRowsList}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Cutoff CGPA</span>
                      <span className={styles.reviewValue}>{minCgpa} CGPA</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Target Batches</span>
                      <span className={styles.reviewValue}>{selectedBatches.join(', ')}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Degrees</span>
                      <span className={styles.reviewValue}>{selectedDegrees.join(', ')}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Tech Skills</span>
                      <span className={styles.reviewValue}>{form.skills?.length || 0} Core Skills</span>
                    </div>
                  </div>
                </div>

                <div className={styles.reviewCard} style={{ gridColumn: '1 / -1' }}>
                  <div className={styles.reviewCardHeader}>
                    <span className={styles.reviewCardTitle}>
                      <Users size={13} /> Talent Acquisition Leadership
                    </span>
                    <button type="button" onClick={() => setStep(1)} className={styles.editLinkBtn}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewRowsList}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Head of University Relations</span>
                      <span className={styles.reviewValue}>
                        {form.representatives?.[0]?.name} ({form.representatives?.[0]?.email})
                      </span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Campus Programs</span>
                      <span className={styles.reviewValue}>{form.hiringTypes?.join('; ')}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Appointed Recruiters</span>
                      <span className={styles.reviewValue}>{form.representatives?.length || 0} Team Members</span>
                    </div>
                  </div>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', background: '#ffffff', padding: '16px', border: '1px solid #cbd5e1' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: '#1c2d81' }}
                />
                <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                  I certify that the corporate identity, official email domains, hiring models, and talent acquisition representatives provided are authentic and authorized for Super Admin verification and campus placement drive scheduling.
                </span>
              </label>
            </div>
          )}

          <div className={styles.navigationFooter}>
            {step > 0 ? (
              <button type="button" onClick={handlePrev} className={styles.backButton}>
                <ChevronLeft size={16} />
                <span>Previous Step</span>
              </button>
            ) : <div />}

            <span className={styles.stepCounterText}>
              Step {step + 1} of {STEPS.length}
            </span>

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={handleNext} className={styles.nextButton}>
                <span>Continue to {STEPS[step + 1].label}</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !agreeTerms}
                className={styles.nextButton}
                style={{ background: '#15803d', borderColor: '#15803d' }}
              >
                {loading ? (
                  <span>Submitting Credentials...</span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Submit for Super Admin Verification</span>
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

