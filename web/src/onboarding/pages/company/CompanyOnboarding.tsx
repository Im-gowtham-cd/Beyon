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

  // New Representative subform
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
    if (!newRep.name.trim() || !newRep.email.trim()) return;
    update('representatives', [...(form.representatives || []), newRep]);
    setNewRep({
      name: '',
      designation: 'Technical Recruiter',
      email: '',
      phone: '',
    });
    setShowAddRep(false);
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
        setError('Corporate Legal Name is required');
        return false;
      }
      if (!form.officialEmail.trim() || !form.officialEmail.includes('@')) {
        setError('Valid official corporate email is required');
        return false;
      }
      if (!form.phone.trim()) {
        setError('Official contact phone number is required');
        return false;
      }
      if (!form.headquarters.trim() || !form.city.trim() || !form.state.trim() || !form.country.trim()) {
        setError('Full headquarters street address, city, state, and country are required');
        return false;
      }
      if (!form.about.trim()) {
        setError('Corporate overview / description is required');
        return false;
      }
    } else if (step === 1) {
      if (!form.hiringTypes || form.hiringTypes.length === 0) {
        setError('Please select at least one campus hiring program');
        return false;
      }
      if (!form.representatives || form.representatives.length === 0) {
        setError('Please provide at least one authorized Talent Acquisition / HR leader');
        return false;
      }
      const primary = form.representatives[0];
      if (!primary.name.trim() || !primary.email.trim() || !primary.phone.trim()) {
        setError('Primary Talent Acquisition Leader Name, Email, and Phone are required');
        return false;
      }
    } else if (step === 2) {
      if (!form.skills || form.skills.length === 0) {
        setError('Please select at least one core recruitment technology / skill');
        return false;
      }
      if (selectedDegrees.length === 0) {
        setError('Please select target candidate degrees');
        return false;
      }
      if (selectedBatches.length === 0) {
        setError('Please select eligible graduation batches');
        return false;
      }
    } else if (step === 3) {
      if (!agreeTerms) {
        setError('Please certify and agree to the corporate recruitment verification terms');
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

  return (
    <div className={styles.pageContainer}>
      {/* ── Top Header ── */}
      <header className={styles.topHeader}>
        <Link to="/" className={styles.brandLink}>
          <div className={styles.brandLogo}>B</div>
          <div className={styles.brandTextGroup}>
            <span className={styles.brandName}>Beyon</span>
            <span className={styles.brandTag}>Company Profile Setup</span>
          </div>
        </Link>
        <div className={styles.headerRight}>
          <div className={styles.rewardBadge}>
            <Briefcase size={14} />
            <span>Super Admin Verification Queue</span>
          </div>
          <div className={styles.stepIndicatorBadge}>
            Step <span className={styles.stepHighlight}>{step + 1}</span> of {STEPS.length}
          </div>
        </div>
      </header>

      {/* ── Hero Welcome Banner ── */}
      <div className={styles.heroWrapper}>
        <div className={styles.welcomeHero}>
          <div className={styles.badgeRow}>
            <span className={styles.portalBadge}>
              <Briefcase size={13} />
              <span>Corporate Employer Onboarding</span>
            </span>
            <span className={styles.verifiedBadge}>
              <ShieldCheck size={13} />
              <span>Enterprise Identity Verification &amp; Campus Authorization</span>
            </span>
          </div>
          <h1 className={styles.welcomeTitle}>
            {form.companyName ? form.companyName : 'Corporate Profile Setup'}
          </h1>
          <p className={styles.welcomeSub}>
            Complete your company credentials, hiring programs, and recruitment requirements to connect with verified partner institutions and talent.
          </p>

          <div className={styles.overallProgressBar}>
            <div
              className={styles.overallProgressFill}
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <main className={styles.mainLayout}>
        {/* Step Navigation Bar */}
        <div className={styles.stepNavContainer}>
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = idx < step;
            const isCurrent = idx === step;
            return (
              <div
                key={s.label}
                className={`${styles.stepNavItem} ${isCurrent ? styles.activeStep : ''} ${
                  isCompleted ? styles.completedStep : ''
                }`}
                onClick={() => {
                  if (idx < step) setStep(idx);
                }}
              >
                <div className={styles.stepNavIcon}>
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <div className={styles.stepNavText}>
                  <span className={styles.stepNavLabel}>{s.label}</span>
                  <span className={styles.stepNavSub}>{s.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: Corporate Identity & HQ ── */}
        {step === 0 && (
          <div className={styles.stepCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <Building2 size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Corporate Identity &amp; Headquarters Details</h2>
                <p className={styles.cardSubtitle}>
                  Provide legal business identity, official website, and corporate location.
                </p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.colSpan2}`}>
                <label className={styles.formLabel}>
                  Company Legal Entity Name <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., TechCorp Global Systems Pvt. Ltd."
                  value={form.companyName}
                  onChange={(e) => update('companyName', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Company Tier &amp; Classification <span className={styles.req}>*</span>
                </label>
                <select
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

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Industry Sector <span className={styles.req}>*</span>
                </label>
                <select
                  value={form.industry}
                  onChange={(e) => update('industry', e.target.value)}
                  className={styles.selectInput}
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Official Corporate Website URL <span className={styles.req}>*</span>
                </label>
                <input
                  type="url"
                  placeholder="e.g., https://www.techcorp.com"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Official Corporate Email <span className={styles.req}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g., careers@techcorp.com"
                  value={form.officialEmail}
                  onChange={(e) => update('officialEmail', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Corporate Hotline / Contact Phone <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., +91 80 4000 1234"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Workforce Size Range <span className={styles.req}>*</span>
                </label>
                <select
                  value={form.companySize}
                  onChange={(e) => update('companySize', e.target.value)}
                  className={styles.selectInput}
                >
                  {COMPANY_SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Founded Year</label>
                <input
                  type="number"
                  placeholder="e.g., 2012"
                  value={form.foundedYear}
                  onChange={(e) => update('foundedYear', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Corporate LinkedIn Page URL</label>
                <input
                  type="url"
                  placeholder="e.g., https://www.linkedin.com/company/techcorp"
                  value={form.linkedin}
                  onChange={(e) => update('linkedin', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.colSpan2}`}>
                <label className={styles.formLabel}>
                  Headquarters Street Address <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Outer Ring Road, Bellandur, Tech Corridor"
                  value={form.headquarters}
                  onChange={(e) => update('headquarters', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  City <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bengaluru"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  State <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Karnataka"
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Country <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => update('country', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.colSpan2}`}>
                <label className={styles.formLabel}>
                  Company Overview &amp; Mission Description <span className={styles.req}>*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of company domain, core engineering products, and university hiring vision..."
                  value={form.about}
                  onChange={(e) => update('about', e.target.value)}
                  className={styles.textareaInput}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Talent Acquisition & Representatives ── */}
        {step === 1 && (
          <div className={styles.stepCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <Users size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Talent Acquisition Leadership &amp; Hiring Programs</h2>
                <p className={styles.cardSubtitle}>
                  Authorized recruiters for campus communications and active hiring formats.
                </p>
              </div>
            </div>

            {/* Campus Hiring Programs */}
            <div style={{ marginBottom: '24px' }}>
              <label className={styles.formLabel}>
                Campus Recruitment Programs Offered <span className={styles.req}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {HIRING_PROGRAMS.map((prog) => {
                  const isSelected = form.hiringTypes?.includes(prog);
                  return (
                    <button
                      type="button"
                      key={prog}
                      onClick={() => toggleHiringProgram(prog)}
                      style={{
                        padding: '8px 16px',
                        background: isSelected ? '#1c2d81' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#1e293b',
                        border: isSelected ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected && <Check size={14} />}
                      <span>{prog}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary HR Leader */}
            <div style={{ background: '#f8fafc', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 12px' }}>
                Primary Talent Acquisition / HR Leader
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Full Name <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Ananya Sharma"
                    value={form.representatives[0]?.name || ''}
                    onChange={(e) => {
                      const updated = [...(form.representatives || [])];
                      updated[0] = { ...updated[0], name: e.target.value };
                      update('representatives', updated);
                    }}
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Designation <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Head of University Relations"
                    value={form.representatives[0]?.designation || ''}
                    onChange={(e) => {
                      const updated = [...(form.representatives || [])];
                      updated[0] = { ...updated[0], designation: e.target.value };
                      update('representatives', updated);
                    }}
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Official Email <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g., ananya.s@techcorp.com"
                    value={form.representatives[0]?.email || ''}
                    onChange={(e) => {
                      const updated = [...(form.representatives || [])];
                      updated[0] = { ...updated[0], email: e.target.value };
                      update('representatives', updated);
                    }}
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Direct Phone / Mobile <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., +91 98800 12345"
                    value={form.representatives[0]?.phone || ''}
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

            {/* Additional Talent Representatives */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c2d81', margin: 0 }}>
                  Additional Recruiter &amp; Technical Contacts ({form.representatives.length - 1 > 0 ? form.representatives.length - 1 : 0})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddRep(true)}
                  style={{
                    padding: '6px 14px',
                    background: '#ffffff',
                    border: '1px solid #1c2d81',
                    color: '#1c2d81',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={14} /> Add Recruiter
                </button>
              </div>

              {showAddRep && (
                <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '16px', marginBottom: '16px' }}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Recruiter Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Vikram Nair"
                        value={newRep.name}
                        onChange={(e) => setNewRep({ ...newRep, name: e.target.value })}
                        className={styles.textInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Designation</label>
                      <input
                        type="text"
                        placeholder="e.g., Senior Technical Recruiter"
                        value={newRep.designation}
                        onChange={(e) => setNewRep({ ...newRep, designation: e.target.value })}
                        className={styles.textInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <input
                        type="email"
                        placeholder="e.g., vikram.n@techcorp.com"
                        value={newRep.email}
                        onChange={(e) => setNewRep({ ...newRep, email: e.target.value })}
                        className={styles.textInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phone</label>
                      <input
                        type="text"
                        placeholder="e.g., +91 97700 54321"
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
                      style={{ padding: '6px 14px', background: '#1c2d81', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Save Contact
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddRep(false)}
                      style={{ padding: '6px 12px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {form.representatives.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {form.representatives.slice(1).map((rep, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#0f172a', fontSize: '0.86rem' }}>{rep.name}</strong>
                        <span style={{ fontSize: '0.76rem', color: '#64748b', marginLeft: '8px' }}>
                          ({rep.designation})
                        </span>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                          {rep.email} &middot; {rep.phone}
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

        {/* ── STEP 3: Recruitment Criteria & Skills ── */}
        {step === 2 && (
          <div className={styles.stepCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <Code2 size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Recruitment Criteria, Target Skills &amp; Degrees</h2>
                <p className={styles.cardSubtitle}>
                  Specify candidate qualifications, cutoffs, and required technical skills.
                </p>
              </div>
            </div>

            {/* Target Degrees */}
            <div style={{ marginBottom: '20px' }}>
              <label className={styles.formLabel}>
                Eligible Degree Programs <span className={styles.req}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {DEGREES_OFFERED.map((deg) => {
                  const isSelected = selectedDegrees.includes(deg);
                  return (
                    <button
                      type="button"
                      key={deg}
                      onClick={() => toggleDegree(deg)}
                      style={{
                        padding: '6px 14px',
                        background: isSelected ? '#1c2d81' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#1e293b',
                        border: isSelected ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected && <Check size={14} />}
                      <span>{deg}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Eligible Batches */}
            <div style={{ marginBottom: '20px' }}>
              <label className={styles.formLabel}>
                Target Graduation Batches <span className={styles.req}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {ELIGIBLE_BATCHES.map((batch) => {
                  const isSelected = selectedBatches.includes(batch);
                  return (
                    <button
                      type="button"
                      key={batch}
                      onClick={() => toggleBatch(batch)}
                      style={{
                        padding: '6px 14px',
                        background: isSelected ? '#1c2d81' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#1e293b',
                        border: isSelected ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected && <Check size={14} />}
                      <span>{batch}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum CGPA */}
            <div className={styles.formGroup} style={{ maxWidth: '300px', marginBottom: '24px' }}>
              <label className={styles.formLabel}>
                Minimum Academic CGPA Cutoff <span className={styles.req}>*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="5.0"
                max="10.0"
                placeholder="e.g., 7.0"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className={styles.textInput}
              />
            </div>

            {/* Target Skills */}
            <div>
              <label className={styles.formLabel}>
                Target Technical Skills &amp; Frameworks <span className={styles.req}>*</span>
              </label>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 10px' }}>
                Select technologies evaluated in candidate discovery and intelligence ranking.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {POPULAR_SKILLS.map((skill) => {
                  const isSelected = form.skills?.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '6px 14px',
                        background: isSelected ? '#1c2d81' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#1e293b',
                        border: isSelected ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected && <Check size={14} />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Review & Super Admin Verification ── */}
        {step === 3 && (
          <div className={styles.stepCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Review Corporate Credentials &amp; Super Admin Verification</h2>
                <p className={styles.cardSubtitle}>
                  Review your company profile before submitting for Super Admin authorization.
                </p>
              </div>
            </div>

            {/* Verification Notice */}
            <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <ShieldCheck size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#854d0e', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    Super Admin Enterprise Verification Protocol
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: '#713f12', margin: 0, lineHeight: 1.5 }}>
                    Upon submission, your corporate account will enter the state <code>PENDING_SUPER_ADMIN_VERIFICATION</code>. The Super Administrator (`superadmin@beyon.io`) will inspect your corporate domain, workforce credentials, and talent representative info. Once authorized, your account becomes ACTIVE, unlocking campus drives, candidate discovery, and intelligence scoring.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 14px' }}>
                Corporate Profile Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Company Legal Name</span>
                  <strong style={{ color: '#0f172a' }}>{form.companyName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Classification &amp; Sector</span>
                  <strong style={{ color: '#0f172a' }}>{form.companyType} &middot; {form.industry}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Corporate Website</span>
                  <strong style={{ color: '#0f172a' }}>{form.website}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Official Email &amp; Phone</span>
                  <strong style={{ color: '#0f172a' }}>{form.officialEmail} &middot; {form.phone}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Headquarters Location</span>
                  <strong style={{ color: '#0f172a' }}>{form.headquarters}, {form.city}, {form.state}, {form.country}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Workforce &amp; Cutoff</span>
                  <strong style={{ color: '#0f172a' }}>{form.companySize} &middot; Min {minCgpa} CGPA</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Primary Recruiter Lead</span>
                  <strong style={{ color: '#0f172a' }}>{form.representatives[0]?.name} ({form.representatives[0]?.designation})</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Target Batches &amp; Degrees</span>
                  <strong style={{ color: '#0f172a' }}>{selectedBatches.join(', ')} &middot; {selectedDegrees.join(', ')}</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Target Technologies ({form.skills?.length || 0})</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {form.skills?.map((sk) => (
                    <span key={sk} style={{ padding: '3px 8px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.74rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '20px' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.4 }}>
                I certify that I am an authorized talent acquisition representative of {form.companyName || 'this corporate entity'}, and that all corporate details, hiring policies, and domain verification records are authentic for Super Admin review.
              </span>
            </label>
          </div>
        )}

        {/* ── Navigation Buttons Footer ── */}
        <div className={styles.navActionsRow}>
          {step > 0 ? (
            <button type="button" onClick={handlePrev} className={styles.prevBtn}>
              <ChevronLeft size={16} />
              <span>Previous Step</span>
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={handleNext} className={styles.nextBtn}>
              <span>Continue to {STEPS[step + 1].label}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !agreeTerms}
              className={styles.submitBtn}
            >
              {loading ? (
                <span>Submitting Corporate Profile...</span>
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
  );
}
