import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  School,
  Landmark,
} from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import { api } from '../../../services/api/client';
import type { InstitutionFormData, InstitutionRepresentativeEntry } from '../../types/onboarding';
import { EMPTY_INSTITUTION_FORM } from '../../types/onboarding';
import styles from '../student/StudentOnboarding.module.css';

const STEPS = [
  { label: 'Campus Details', sub: 'AISHE code & location', icon: Landmark },
  { label: 'Academic Governance', sub: 'NAAC, NIRF & programs', icon: GraduationCap },
  { label: 'Leadership & Placement', sub: 'Principal & placement cell', icon: UserCheck },
  { label: 'Review & Verify', sub: 'Submit for Super Admin review', icon: ShieldCheck },
];

const INSTITUTION_TYPES = [
  'UGC Autonomous Engineering Institute',
  'State Government University',
  'Central University / IIT / NIT',
  'Deemed-to-be University',
  'Affiliated Engineering College',
  'Autonomous Arts & Science College',
  'Management & Business School',
  'Polytechnic & Technical Institute',
];

const NAAC_GRADES = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Under Evaluation'];

const DEPARTMENTS_LIST = [
  'Computer Science and Engineering',
  'Information Technology',
  'AI & Data Science',
  'Electronics & Communication Engg.',
  'Electrical & Electronics Engg.',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Robotics & Automation',
  'Chemical Engineering',
  'Management Studies (MBA)',
  'Computer Applications (MCA)',
];

export function InstitutionOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfileStatus } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<InstitutionFormData>({
    ...EMPTY_INSTITUTION_FORM,
    institutionName: user?.name || '',
    officialEmail: user?.email || '',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    institutionType: 'UGC Autonomous Engineering Institute',
    accreditationGrade: 'A++',
    autonomousStatus: 'Autonomous',
    departmentsOffered: ['Computer Science and Engineering', 'Information Technology', 'AI & Data Science'],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // New Representative Modal/Subform State
  const [showAddRep, setShowAddRep] = useState(false);
  const [newRep, setNewRep] = useState<InstitutionRepresentativeEntry>({
    name: '',
    designation: 'Placement Coordinator',
    email: '',
    phone: '',
    department: 'Computer Science and Engineering',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const update = <K extends keyof InstitutionFormData>(key: K, value: InstitutionFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDepartment = (dept: string) => {
    const current = form.departmentsOffered || [];
    if (current.includes(dept)) {
      update('departmentsOffered', current.filter((d) => d !== dept));
    } else {
      update('departmentsOffered', [...current, dept]);
    }
  };

  const addRepresentative = () => {
    if (!newRep.name.trim() || !newRep.email.trim()) return;
    update('representatives', [...(form.representatives || []), newRep]);
    setNewRep({
      name: '',
      designation: 'Placement Coordinator',
      email: '',
      phone: '',
      department: 'Computer Science and Engineering',
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
      if (!form.institutionName.trim()) {
        setError('College / Institution Legal Name is required');
        return false;
      }
      if (!form.institutionType) {
        setError('Institution Type & Classification is required');
        return false;
      }
      if (!form.institutionCode.trim()) {
        setError('Institution / AISHE / UGC Code is required');
        return false;
      }
      if (!form.officialEmail.trim() || !form.officialEmail.includes('@')) {
        setError('Valid official institutional email is required');
        return false;
      }
      if (!form.phone.trim()) {
        setError('Official contact phone is required');
        return false;
      }
      if (!form.website.trim()) {
        setError('Official campus website URL is required');
        return false;
      }
      if (!form.address.trim() || !form.city.trim() || !form.state.trim() || !form.postalCode.trim()) {
        setError('Campus Street Address, City, State, and Postal Code are required');
        return false;
      }
    } else if (step === 1) {
      if (!form.affiliatedUniversity.trim()) {
        setError('Affiliating University (e.g. Anna University, VTU) is required');
        return false;
      }
      if (!form.accreditationGrade) {
        setError('NAAC Accreditation Grade is required');
        return false;
      }
      if (!form.establishedYear.trim()) {
        setError('Established Year is required');
        return false;
      }
      if (!form.totalStudents.trim()) {
        setError('Total Student Capacity / Enrollment is required');
        return false;
      }
      if (!form.departmentsOffered || form.departmentsOffered.length === 0) {
        setError('Please select at least one active department');
        return false;
      }
    } else if (step === 2) {
      if (!form.principalName.trim() || !form.principalEmail.trim() || !form.principalPhone.trim()) {
        setError('Principal / Dean Name, Official Email, and Phone number are required');
        return false;
      }
      if (!form.placementOfficerName.trim() || !form.placementOfficerEmail.trim() || !form.placementOfficerPhone.trim()) {
        setError('Head of Placement (TPO) Name, Email, and Phone number are required');
        return false;
      }
      if (!form.placementCellEmail.trim() || !form.placementCellPhone.trim()) {
        setError('Placement Cell Official Helpdesk Email and Hotline Phone are required');
        return false;
      }
    } else if (step === 3) {
      if (!agreeTerms) {
        setError('Please certify and agree to the institutional regulatory terms');
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
      await api.post('/onboarding/institution', form);
      await refreshProfileStatus();
      navigate('/onboarding/complete');
    } catch {
      setError('We could not submit your institution profile. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.topHeader}>
        <Link to="/" className={styles.brandLink}>
          <div className={styles.brandLogo}>B</div>
          <div className={styles.brandTextGroup}>
            <span className={styles.brandName}>Beyon</span>
            <span className={styles.brandTag}>College Profile Setup</span>
          </div>
        </Link>
        <div className={styles.headerRight}>
          <div className={styles.rewardBadge}>
            <School size={14} />
            <span>Super Admin Verification Queue</span>
          </div>
          <div className={styles.stepIndicatorBadge}>
            Step <span className={styles.stepHighlight}>{step + 1}</span> of {STEPS.length}
          </div>
        </div>
      </header>

      <div className={styles.heroWrapper}>
        <div className={styles.welcomeHero}>
          <div className={styles.badgeRow}>
            <span className={styles.portalBadge}>
              <Landmark size={13} />
              <span>Higher-Education Institution Onboarding</span>
            </span>
            <span className={styles.verifiedBadge}>
              <ShieldCheck size={13} />
              <span>Accreditation Verification &amp; Placement Authorization</span>
            </span>
          </div>
          <h1 className={styles.welcomeTitle}>
            {form.institutionName ? form.institutionName : 'Institution & Campus Setup'}
          </h1>
          <p className={styles.welcomeSub}>
            Complete your institutional profile, academic governance credentials, and placement cell structure to activate company recruitment drives.
          </p>

          <div className={styles.overallProgressBar}>
            <div
              className={styles.overallProgressFill}
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className={styles.mainLayout}>
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

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: Campus Details ── */}
        {step === 0 && (
          <div className={styles.stepCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <Building2 size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Campus Identity &amp; Contact Details</h2>
                <p className={styles.cardSubtitle}>
                  Provide official legal identity and administrative contact information.
                </p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.colSpan2}`}>
                <label className={styles.formLabel}>
                  Institution / College Legal Name <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., PSG College of Technology, Coimbatore"
                  value={form.institutionName}
                  onChange={(e) => update('institutionName', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Institution Type &amp; Classification <span className={styles.req}>*</span>
                </label>
                <select
                  value={form.institutionType}
                  onChange={(e) => update('institutionType', e.target.value)}
                  className={styles.selectInput}
                >
                  {INSTITUTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  AISHE / UGC / AICTE Code <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., C-16524 / AISHE-TN-2024"
                  value={form.institutionCode}
                  onChange={(e) => update('institutionCode', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Official Institutional Email <span className={styles.req}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g., principal@psgtech.edu"
                  value={form.officialEmail}
                  onChange={(e) => update('officialEmail', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Campus Phone / Administrative Board <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., +91 422 2572177"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.colSpan2}`}>
                <label className={styles.formLabel}>
                  Official Institutional Website URL <span className={styles.req}>*</span>
                </label>
                <input
                  type="url"
                  placeholder="e.g., https://www.psgtech.edu"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.colSpan2}`}>
                <label className={styles.formLabel}>
                  Full Campus Street Address <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Avinashi Road, Peelamedu"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  City <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Coimbatore"
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
                  placeholder="e.g., Tamil Nadu"
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Postal PIN Code <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 641004"
                  value={form.postalCode}
                  onChange={(e) => update('postalCode', e.target.value)}
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
            </div>
          </div>
        )}

        {/* ── STEP 2: Academic Governance & NAAC ── */}
        {step === 1 && (
          <div className={styles.stepCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <GraduationCap size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Academic Governance, NAAC &amp; Departments</h2>
                <p className={styles.cardSubtitle}>
                  Accreditation credentials and undergraduate/postgraduate departments offered.
                </p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.colSpan2}`}>
                <label className={styles.formLabel}>
                  Affiliating University <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Anna University, Chennai"
                  value={form.affiliatedUniversity}
                  onChange={(e) => update('affiliatedUniversity', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  NAAC Accreditation Grade <span className={styles.req}>*</span>
                </label>
                <select
                  value={form.accreditationGrade}
                  onChange={(e) => update('accreditationGrade', e.target.value)}
                  className={styles.selectInput}
                >
                  {NAAC_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>NIRF National Ranking Band</label>
                <input
                  type="text"
                  placeholder="e.g., Rank 45 / Rank Band 51-100"
                  value={form.nirfRank}
                  onChange={(e) => update('nirfRank', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Established Year <span className={styles.req}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1951"
                  value={form.establishedYear}
                  onChange={(e) => update('establishedYear', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Total Student Capacity / Strength <span className={styles.req}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 8500"
                  value={form.totalStudents}
                  onChange={(e) => update('totalStudents', e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.colSpan2}`}>
                <label className={styles.formLabel}>
                  Active Academic Departments Offered <span className={styles.req}>*</span>
                </label>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 10px' }}>
                  Select the departments eligible to participate in campus drives and skill assessments.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DEPARTMENTS_LIST.map((dept) => {
                    const isSelected = form.departmentsOffered?.includes(dept);
                    return (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
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
                        <span>{dept}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Leadership & Placement Cell ── */}
        {step === 2 && (
          <div className={styles.stepCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <UserCheck size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Campus Leadership &amp; Training &amp; Placement Cell</h2>
                <p className={styles.cardSubtitle}>
                  Authorized institutional contacts for drive scheduling and credential verification.
                </p>
              </div>
            </div>

            {/* Principal / Dean Info */}
            <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 12px' }}>
                1. Head of Institution (Principal / Director / Dean)
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Principal / Director Full Name <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. K. Prakasan"
                    value={form.principalName}
                    onChange={(e) => update('principalName', e.target.value)}
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Official Email <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g., principal@psgtech.edu"
                    value={form.principalEmail}
                    onChange={(e) => update('principalEmail', e.target.value)}
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Direct Contact Phone <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., +91 422 2572177"
                    value={form.principalPhone}
                    onChange={(e) => update('principalPhone', e.target.value)}
                    className={styles.textInput}
                  />
                </div>
              </div>
            </div>

            {/* Placement Officer Info */}
            <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 12px' }}>
                2. Training &amp; Placement Officer (TPO / Placement Head)
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Placement Officer Full Name <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. R. Suresh Kumar"
                    value={form.placementOfficerName}
                    onChange={(e) => update('placementOfficerName', e.target.value)}
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    TPO Official Email <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g., placement@psgtech.edu"
                    value={form.placementOfficerEmail}
                    onChange={(e) => update('placementOfficerEmail', e.target.value)}
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    TPO Mobile / Phone <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., +91 98422 12345"
                    value={form.placementOfficerPhone}
                    onChange={(e) => update('placementOfficerPhone', e.target.value)}
                    className={styles.textInput}
                  />
                </div>
              </div>
            </div>

            {/* Placement Cell Desk */}
            <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 12px' }}>
                3. Placement Cell Official Helpdesk
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Placement Cell Desk Email <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g., placements@psgtech.edu"
                    value={form.placementCellEmail}
                    onChange={(e) => update('placementCellEmail', e.target.value)}
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Placement Cell Hotline <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., +91 422 2578899"
                    value={form.placementCellPhone}
                    onChange={(e) => update('placementCellPhone', e.target.value)}
                    className={styles.textInput}
                  />
                </div>
              </div>
            </div>

            {/* Additional Representatives */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c2d81', margin: 0 }}>
                  4. Department Placement Coordinators &amp; Staff ({form.representatives?.length || 0})
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
                  <Plus size={14} /> Add Coordinator
                </button>
              </div>

              {showAddRep && (
                <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '16px', marginBottom: '16px' }}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Coordinator Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Prof. Anand M."
                        value={newRep.name}
                        onChange={(e) => setNewRep({ ...newRep, name: e.target.value })}
                        className={styles.textInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Designation</label>
                      <input
                        type="text"
                        placeholder="e.g., Assistant Professor / CSE Coordinator"
                        value={newRep.designation}
                        onChange={(e) => setNewRep({ ...newRep, designation: e.target.value })}
                        className={styles.textInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <input
                        type="email"
                        placeholder="e.g., anand.cse@psgtech.edu"
                        value={newRep.email}
                        onChange={(e) => setNewRep({ ...newRep, email: e.target.value })}
                        className={styles.textInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Department</label>
                      <select
                        value={newRep.department}
                        onChange={(e) => setNewRep({ ...newRep, department: e.target.value })}
                        className={styles.selectInput}
                      >
                        {DEPARTMENTS_LIST.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={addRepresentative}
                      style={{ padding: '6px 14px', background: '#1c2d81', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Save Coordinator
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

              {form.representatives && form.representatives.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {form.representatives.map((rep, idx) => (
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
                          ({rep.designation} &middot; {rep.department})
                        </span>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                          {rep.email} {rep.phone && `&middot; ${rep.phone}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRepresentative(idx)}
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

        {/* ── STEP 4: Review & Super Admin Verification ── */}
        {step === 3 && (
          <div className={styles.stepCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Review Credentials &amp; Super Admin Verification</h2>
                <p className={styles.cardSubtitle}>
                  Please review your campus details before submitting for Super Admin authorization.
                </p>
              </div>
            </div>

            {/* Verification Process Notice */}
            <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <ShieldCheck size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#854d0e', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    Super Admin Institutional Verification Protocol
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: '#713f12', margin: 0, lineHeight: 1.5 }}>
                    Upon submission, your account will enter the state <code>PENDING_SUPER_ADMIN_VERIFICATION</code>. The Super Administrator (`superadmin@beyon.io`) will inspect your AISHE code, affiliating university status, and placement contact records. Once authorized, your campus drive and student placement workflows will immediately become ACTIVE.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Review Grid */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 14px' }}>
                Institutional Profile Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Institution Legal Name</span>
                  <strong style={{ color: '#0f172a' }}>{form.institutionName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Type &amp; Status</span>
                  <strong style={{ color: '#0f172a' }}>{form.institutionType} ({form.autonomousStatus})</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>AISHE / Code</span>
                  <strong style={{ color: '#0f172a' }}>{form.institutionCode}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Affiliating University</span>
                  <strong style={{ color: '#0f172a' }}>{form.affiliatedUniversity}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>NAAC Grade &amp; NIRF</span>
                  <strong style={{ color: '#0f172a' }}>Grade {form.accreditationGrade} {form.nirfRank && `(${form.nirfRank})`}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Established Year &amp; Capacity</span>
                  <strong style={{ color: '#0f172a' }}>Est. {form.establishedYear} &middot; {form.totalStudents} Students</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Campus Location</span>
                  <strong style={{ color: '#0f172a' }}>{form.address}, {form.city}, {form.state} - {form.postalCode}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Principal &amp; TPO Contacts</span>
                  <strong style={{ color: '#0f172a' }}>{form.principalName} &middot; {form.placementOfficerName}</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Active Departments ({form.departmentsOffered?.length || 0})</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {form.departmentsOffered?.map((dept) => (
                    <span key={dept} style={{ padding: '3px 8px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.74rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                      {dept}
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
                I certify under regulatory penalty that the institutional information, AISHE codes, NAAC accreditation, and placement contact details provided are accurate and authorized by campus leadership for Super Admin validation.
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
  );
}
