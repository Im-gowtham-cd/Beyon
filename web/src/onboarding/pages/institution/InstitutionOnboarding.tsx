import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Landmark,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Award,
  BookOpen,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import { api } from '../../../services/api/client';
import type { InstitutionFormData, InstitutionRepresentativeEntry } from '../../types/onboarding';
import { EMPTY_INSTITUTION_FORM } from '../../types/onboarding';
import styles from '../student/StudentOnboarding.module.css';

const STEPS = [
  { label: 'Campus Details', sub: 'AISHE code & address', icon: Landmark },
  { label: 'Academic Governance', sub: 'NAAC, NIRF & programs', icon: GraduationCap },
  { label: 'Leadership & TPO', sub: 'Principal & placement cell', icon: UserCheck },
  { label: 'Review & Verify', sub: 'Super Admin review', icon: ShieldCheck },
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

  const [showAddRep, setShowAddRep] = useState(false);
  const [newRep, setNewRep] = useState<InstitutionRepresentativeEntry>({
    name: '',
    designation: 'Department Placement Coordinator',
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
    if (!newRep.name || !newRep.email) {
      setError('Please provide at least coordinator name and official email.');
      return;
    }
    const current = form.representatives || [];
    update('representatives', [...current, { ...newRep }]);
    setNewRep({
      name: '',
      designation: 'Department Placement Coordinator',
      email: '',
      phone: '',
      department: 'Computer Science and Engineering',
    });
    setShowAddRep(false);
    setError('');
  };

  const removeRepresentative = (idx: number) => {
    const current = form.representatives || [];
    update('representatives', current.filter((_, i) => i !== idx));
  };

  const validateStep = () => {
    setError('');
    if (step === 0) {
      if (!form.institutionName.trim()) {
        setError('Please enter your official institution name.');
        return false;
      }
      if (!form.institutionCode.trim()) {
        setError('Please provide your AISHE / UGC / AICTE institution code.');
        return false;
      }
      if (!form.officialEmail.trim()) {
        setError('Please provide your official institutional email.');
        return false;
      }
      if (!form.address.trim() || !form.city.trim() || !form.state.trim()) {
        setError('Please complete the campus address, city, and state.');
        return false;
      }
    }
    if (step === 1) {
      if (!form.affiliatedUniversity.trim()) {
        setError('Please specify the affiliating university or governing board.');
        return false;
      }
      if (!form.establishedYear) {
        setError('Please enter the established year.');
        return false;
      }
      if (!form.totalStudents) {
        setError('Please enter total student capacity.');
        return false;
      }
      if (!form.departmentsOffered || form.departmentsOffered.length === 0) {
        setError('Please select at least one active department offered on campus.');
        return false;
      }
    }
    if (step === 2) {
      if (!form.principalName.trim() || !form.principalEmail.trim()) {
        setError('Please provide Principal / Dean leadership contact details.');
        return false;
      }
      if (!form.placementOfficerName.trim() || !form.placementOfficerEmail.trim()) {
        setError('Please provide Training & Placement Officer (TPO) contact details.');
        return false;
      }
    }
    if (step === 3) {
      if (!agreeTerms) {
        setError('Please certify that the institutional credentials are accurate.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(STEPS.length - 1, prev + 1));
    }
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => Math.max(0, prev - 1));
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
            <span className={styles.brandTag}>Institution Onboarding</span>
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
              Higher Education Institution Portal
            </div>
            <div className={styles.verifiedBadge}>
              <CheckCircle2 size={12} />
              AISHE &amp; NAAC Institutional Verification
            </div>
          </div>
          <h1 className={styles.welcomeTitle}>
            {form.institutionName ? form.institutionName : 'Setup Institutional Campus Profile'}
          </h1>
          <p className={styles.welcomeSub}>
            Complete your academic accreditation, NAAC credentials, and training &amp; placement cell leadership details for Super Admin platform authorization and corporate drive scheduling.
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
              {step === 0 && 'Provide your official legal campus identity, AISHE regulatory code, and physical location.'}
              {step === 1 && 'Record your affiliating university, NAAC accreditation, NIRF ranking, and active engineering departments.'}
              {step === 2 && 'Register authorized campus leadership, Training & Placement Officer (TPO), and departmental coordinators.'}
              {step === 3 && 'Perform a final audit of all campus credentials before submission for Super Admin verification.'}
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
              <HelpCircle size={14} color="#1c2d81" /> Institutional Standards
            </div>
            <ul className={styles.benefitsList}>
              <li className={styles.benefitItem}>
                <Award size={14} className={styles.benefitIcon} />
                <span>Verified <strong>AISHE Code</strong> unlocks autonomous drive hosting.</span>
              </li>
              <li className={styles.benefitItem}>
                <Building2 size={14} className={styles.benefitIcon} />
                <span>Direct integration with <strong>120+ corporate recruiters</strong>.</span>
              </li>
              <li className={styles.benefitItem}>
                <BookOpen size={14} className={styles.benefitIcon} />
                <span>AI-powered curriculum syllabus &amp; industry skill taxonomy.</span>
              </li>
              <li className={styles.benefitItem}>
                <ShieldCheck size={14} className={styles.benefitIcon} />
                <span>Super Admin verified placement and offer audit ledgers.</span>
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
                  <Landmark size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>1. Campus Identity &amp; Administrative Details</h2>
                  <p className={styles.sectionSubtitle}>
                    Official legal identity and communication channels verified by the Super Administrator.
                  </p>
                </div>
              </div>

              <div className={styles.fieldsGrid}>
                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel} htmlFor="instName">
                    <Building2 size={13} /> Institution / College Legal Name <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="instName"
                    type="text"
                    placeholder="e.g., PSG College of Technology, Coimbatore"
                    value={form.institutionName}
                    onChange={(e) => update('institutionName', e.target.value)}
                    className={styles.textInput}
                  />
                  <span className={styles.fieldHint}>Official registered name under UGC / AICTE records</span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="instType">
                    Institution Classification <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <select
                    id="instType"
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

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="instCode">
                    AISHE / UGC / AICTE Code <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="instCode"
                    type="text"
                    placeholder="e.g., C-16524 / AISHE-TN-2024"
                    value={form.institutionCode}
                    onChange={(e) => update('institutionCode', e.target.value)}
                    className={styles.textInput}
                  />
                  <span className={styles.fieldHint}>Regulatory institution identification code</span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="instEmail">
                    <Mail size={13} /> Official Institutional Email <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="instEmail"
                    type="email"
                    placeholder="e.g., principal@psgtech.edu"
                    value={form.officialEmail}
                    onChange={(e) => update('officialEmail', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="instPhone">
                    <Phone size={13} /> Administrative Board Phone <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="instPhone"
                    type="tel"
                    placeholder="e.g., +91 422 2572177"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel} htmlFor="instWeb">
                    <Globe size={13} /> Official Institutional Website URL <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="instWeb"
                    type="url"
                    placeholder="e.g., https://www.psgtech.edu"
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel} htmlFor="instAddress">
                    <MapPin size={13} /> Full Campus Physical Street Address <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="instAddress"
                    type="text"
                    placeholder="e.g., Avinashi Road, Peelamedu"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
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
                    placeholder="e.g., Coimbatore"
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
                    placeholder="e.g., Tamil Nadu"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="pin">
                    Postal PIN Code <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="pin"
                    type="text"
                    placeholder="e.g., 641004"
                    value={form.postalCode}
                    onChange={(e) => update('postalCode', e.target.value)}
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
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <GraduationCap size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>2. Academic Governance &amp; Accreditation</h2>
                  <p className={styles.sectionSubtitle}>
                    Accreditation metrics and undergraduate/postgraduate engineering departments offered on campus.
                  </p>
                </div>
              </div>

              <div className={styles.fieldsGrid}>
                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel} htmlFor="affUniv">
                    Affiliating University / Governing Board <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="affUniv"
                    type="text"
                    placeholder="e.g., Anna University, Chennai"
                    value={form.affiliatedUniversity}
                    onChange={(e) => update('affiliatedUniversity', e.target.value)}
                    className={styles.textInput}
                  />
                  <span className={styles.fieldHint}>State, Central, or Deemed governing body</span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="naac">
                    NAAC Accreditation Grade <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <select
                    id="naac"
                    value={form.accreditationGrade}
                    onChange={(e) => update('accreditationGrade', e.target.value)}
                    className={styles.selectInput}
                  >
                    {NAAC_GRADES.map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="nirf">
                    NIRF National Ranking Band
                  </label>
                  <input
                    id="nirf"
                    type="text"
                    placeholder="e.g., Rank 63 / Band 51-100"
                    value={form.nirfRank}
                    onChange={(e) => update('nirfRank', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="estYear">
                    Established Year <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="estYear"
                    type="number"
                    placeholder="e.g., 1951"
                    value={form.establishedYear}
                    onChange={(e) => update('establishedYear', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="totStud">
                    Total Student Enrollment Capacity <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="totStud"
                    type="number"
                    placeholder="e.g., 8500"
                    value={form.totalStudents}
                    onChange={(e) => update('totalStudents', e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel}>
                    Active Academic Departments Offered on Campus <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <span className={styles.fieldHint} style={{ marginBottom: '8px' }}>
                    Select all engineering &amp; technology branches active for recruitment drives:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                    {DEPARTMENTS_LIST.map((dept) => {
                      const isSelected = form.departmentsOffered?.includes(dept);
                      return (
                        <button
                          type="button"
                          key={dept}
                          onClick={() => toggleDepartment(dept)}
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
                            {dept}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <UserCheck size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>3. Campus Leadership &amp; Training &amp; Placement Cell</h2>
                  <p className={styles.sectionSubtitle}>
                    Designate institutional authorities for recruitment drives, schedule approvals, and scholar audits.
                  </p>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px 20px', border: '1px solid #cbd5e1', borderLeft: '4px solid #1c2d81' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <User size={16} color="#1c2d81" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Head of Institution (Principal / Director / Dean)
                  </h3>
                </div>
                <div className={styles.fieldsGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Principal / Director Name <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Dr. K. Prakasan"
                      value={form.principalName}
                      onChange={(e) => update('principalName', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Principal Email <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g., principal@psgtech.edu"
                      value={form.principalEmail}
                      onChange={(e) => update('principalEmail', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Direct Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g., +91 422 2572177"
                      value={form.principalPhone}
                      onChange={(e) => update('principalPhone', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px 20px', border: '1px solid #cbd5e1', borderLeft: '4px solid #15803d' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <UserCheck size={16} color="#15803d" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Head of Training &amp; Placement (TPO)
                  </h3>
                </div>
                <div className={styles.fieldsGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      TPO / Placement Head Name <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Dr. R. Suresh Kumar"
                      value={form.placementOfficerName}
                      onChange={(e) => update('placementOfficerName', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      TPO Official Email <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g., placement@psgtech.edu"
                      value={form.placementOfficerEmail}
                      onChange={(e) => update('placementOfficerEmail', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>TPO Direct Mobile</label>
                    <input
                      type="tel"
                      placeholder="e.g., +91 98422 12345"
                      value={form.placementOfficerPhone}
                      onChange={(e) => update('placementOfficerPhone', e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px 20px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="#1c2d81" />
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Department Placement Coordinators ({form.representatives?.length || 0})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddRep(true)}
                    className={styles.backButton}
                    style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  >
                    <Plus size={14} /> Add Coordinator
                  </button>
                </div>

                {showAddRep && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', marginBottom: '16px' }}>
                    <div className={styles.fieldsGrid}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Coordinator Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Prof. Anand M."
                          value={newRep.name}
                          onChange={(e) => setNewRep({ ...newRep, name: e.target.value })}
                          className={styles.textInput}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Designation</label>
                        <input
                          type="text"
                          placeholder="e.g., Assistant Professor / CSE Coordinator"
                          value={newRep.designation}
                          onChange={(e) => setNewRep({ ...newRep, designation: e.target.value })}
                          className={styles.textInput}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Official Email</label>
                        <input
                          type="email"
                          placeholder="e.g., anand.cse@psgtech.edu"
                          value={newRep.email}
                          onChange={(e) => setNewRep({ ...newRep, email: e.target.value })}
                          className={styles.textInput}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Department</label>
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
                        className={styles.nextButton}
                        style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                      >
                        Save Coordinator
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

                {form.representatives && form.representatives.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {form.representatives.map((rep, idx) => (
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

          {step === 3 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox}>
                  <ShieldCheck size={20} />
                </div>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>4. Review Credentials &amp; Super Admin Verification</h2>
                  <p className={styles.sectionSubtitle}>
                    Review your campus profile details before final submission for Super Admin platform authorization.
                  </p>
                </div>
              </div>

              <div className={styles.rewardCallout}>
                <div className={styles.rewardCalloutIcon}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className={styles.rewardCalloutTitle}>Super Administrator Verification Protocol</h4>
                  <p className={styles.rewardCalloutText}>
                    Upon submission, your institution enters <code>PENDING_SUPER_ADMIN_VERIFICATION</code>. The Super Administrator (`superadmin@beyon.io`) inspects your AISHE code, affiliating university status, and placement cell leadership before enabling corporate recruitment drives.
                  </p>
                </div>
              </div>

              <div className={styles.reviewGrid}>
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <span className={styles.reviewCardTitle}>
                      <Building2 size={13} /> Campus Identity
                    </span>
                    <button type="button" onClick={() => setStep(0)} className={styles.editLinkBtn}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewRowsList}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Institution Name</span>
                      <span className={styles.reviewValue}>{form.institutionName}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Type</span>
                      <span className={styles.reviewValue}>{form.institutionType}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>AISHE / UGC Code</span>
                      <span className={styles.reviewValue}>{form.institutionCode}</span>
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
                      <GraduationCap size={13} /> Academic Metrics
                    </span>
                    <button type="button" onClick={() => setStep(1)} className={styles.editLinkBtn}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewRowsList}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Affiliating Board</span>
                      <span className={styles.reviewValue}>{form.affiliatedUniversity}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>NAAC Grade</span>
                      <span className={styles.reviewValue}>Grade {form.accreditationGrade}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>NIRF Ranking</span>
                      <span className={styles.reviewValue}>{form.nirfRank || 'N/A'}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Total Enrollment</span>
                      <span className={styles.reviewValue}>{form.totalStudents} Students</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Active Departments</span>
                      <span className={styles.reviewValue}>{form.departmentsOffered?.length || 0} Branches</span>
                    </div>
                  </div>
                </div>

                <div className={styles.reviewCard} style={{ gridColumn: '1 / -1' }}>
                  <div className={styles.reviewCardHeader}>
                    <span className={styles.reviewCardTitle}>
                      <UserCheck size={13} /> Leadership &amp; TPO Contacts
                    </span>
                    <button type="button" onClick={() => setStep(2)} className={styles.editLinkBtn}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewRowsList}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Head of Institution</span>
                      <span className={styles.reviewValue}>{form.principalName} ({form.principalEmail})</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Placement Officer (TPO)</span>
                      <span className={styles.reviewValue}>{form.placementOfficerName} ({form.placementOfficerEmail})</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Department Coordinators</span>
                      <span className={styles.reviewValue}>{form.representatives?.length || 0} Staff Appointed</span>
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
                  I certify under regulatory penalty that the institutional information, AISHE codes, NAAC accreditation, and placement contact details provided are authentic and authorized by campus leadership for Super Admin validation.
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

