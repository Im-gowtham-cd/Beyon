import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import type { ApiError } from '../../services/api/client';
import styles from './LoginPage.module.css';

interface VerifiedOrgData {
  aicteId?: string;
  cin?: string;
  alreadyRegistered?: boolean;
  instituteName?: string;
  institutionName?: string;
  companyName?: string;
  institutionType?: string;
  address?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  region?: string;
  userGroup?: string;
  status?: string;
  category?: string;
  class?: string;
  officialWebsite?: string;
  officialEmail?: string;
  contactPhone?: string;
  affiliatedUniversity?: string;
  representativeName?: string;
  coursesOffered?: string[];
  sourceUrls?: string[];
  missingFields?: string[];
  confidenceScore?: number;
  message?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const initialRole = (() => {
    const r = searchParams.get('role')?.toUpperCase();
    if (r === 'INSTITUTION' || r === 'COMPANY') return r;
    return 'STUDENT';
  })();

  const [role, setRole] = useState<'STUDENT' | 'INSTITUTION' | 'COMPANY'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Verification & dataset-driven organization fields
  const [uniqueCode, setUniqueCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOrgVerified, setIsOrgVerified] = useState(false);
  const [verifiedOrgData, setVerifiedOrgData] = useState<VerifiedOrgData | null>(null);
  const [orgLookupError, setOrgLookupError] = useState('');
  const [website, setWebsite] = useState('');
  const [representativeName, setRepresentativeName] = useState('');

  // Editable institution fields auto-populated from AICTE lookup
  const [instName, setInstName] = useState('');
  const [instType, setInstType] = useState('UGC Autonomous Engineering Institute');
  const [instAddress, setInstAddress] = useState('');
  const [instCity, setInstCity] = useState('');
  const [instDistrict, setInstDistrict] = useState('');
  const [instState, setInstState] = useState('');
  const [instPincode, setInstPincode] = useState('');
  const [instPhone, setInstPhone] = useState('');
  const [instAffiliatedUni, setInstAffiliatedUni] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    terms?: string;
    uniqueCode?: string;
    website?: string;
    representativeName?: string;
    instName?: string;
    instCity?: string;
    instState?: string;
  }>({});
  const [toast, setToast] = useState({ show: false, message: '', isError: false });
  const [loading, setLoading] = useState(false);

  // Reset role-specific verification state when switching roles
  useEffect(() => {
    setUniqueCode('');
    setIsOrgVerified(false);
    setVerifiedOrgData(null);
    setOrgLookupError('');
    setWebsite('');
    setRepresentativeName('');
    setInstName('');
    setInstAddress('');
    setInstCity('');
    setInstDistrict('');
    setInstState('');
    setInstPincode('');
    setInstPhone('');
    setInstAffiliatedUni('');
    setIsEditingDetails(false);
    setErrors({});
  }, [role]);

  function showToast(message: string, isError = false) {
    setToast({ show: true, message, isError });
    setTimeout(() => setToast({ show: false, message: '', isError: false }), 4000);
  }

  async function handleVerifyInstitution() {
    const cleanCode = uniqueCode.trim();
    if (!cleanCode) {
      setOrgLookupError('Please enter your AICTE Permanent Institute ID.');
      return;
    }

    setIsVerifying(true);
    setOrgLookupError('');

    try {
      const res = await fetch(`/api/v1/onboarding/institutions/verify-aicte?code=${encodeURIComponent(cleanCode)}`);
      const json = await res.json();

      if (res.ok && json.data && json.data.verified) {
        const data = json.data as VerifiedOrgData;
        if (data.alreadyRegistered) {
          setIsOrgVerified(false);
          setVerifiedOrgData(null);
          setOrgLookupError(
            `Institution "${data.instituteName || data.institutionName || cleanCode}" is already registered on the platform. Each institution may only register once. Please sign in with existing credentials.`
          );
          return;
        }

        setIsOrgVerified(true);
        setVerifiedOrgData(data);
        
        // Auto-populate all corresponding registration fields
        const fetchedName = data.institutionName || data.instituteName || '';
        setInstName(fetchedName);
        if (data.institutionType) setInstType(data.institutionType);
        if (data.address) setInstAddress(data.address);
        if (data.city) setInstCity(data.city);
        if (data.district) setInstDistrict(data.district);
        if (data.state) setInstState(data.state);
        if (data.pincode) setInstPincode(data.pincode);
        if (data.officialWebsite) setWebsite(data.officialWebsite);
        if (data.contactPhone) setInstPhone(data.contactPhone);
        if (data.affiliatedUniversity) setInstAffiliatedUni(data.affiliatedUniversity);
        if (data.officialEmail) setEmail(data.officialEmail);
        if (data.representativeName) setRepresentativeName(data.representativeName);

        // Store into session for subsequent onboarding wizard
        try {
          sessionStorage.setItem('beyon_verified_aicte_data', JSON.stringify(data));
        } catch {}

        setErrors((prev) => ({ ...prev, uniqueCode: '', representativeName: '', email: '', website: '' }));
        showToast('Institution details retrieved via Google Search & AICTE public records!');
      } else {
        setIsOrgVerified(false);
        setVerifiedOrgData(null);
        setOrgLookupError(
          json.data?.message ||
            json.message ||
            `AICTE Permanent ID "${cleanCode}" not found in accredited institution records. Please enter details manually.`
        );
      }
    } catch {
      setIsOrgVerified(false);
      setVerifiedOrgData(null);
      setOrgLookupError('Failed to query AICTE registry / Google Search service. Please check your network.');
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleVerifyCompany() {
    const cleanCin = uniqueCode.trim().toUpperCase();
    if (!cleanCin) {
      setOrgLookupError('Please enter your 21-character Corporate Identification Number (CIN).');
      return;
    }

    const cinRegex = /^[LUlu][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;
    if (!cinRegex.test(cleanCin)) {
      setOrgLookupError('Invalid CIN format. Expected 21 alphanumeric characters (e.g. U72900KA1981PLC004246).');
      return;
    }

    setIsVerifying(true);
    setOrgLookupError('');

    try {
      const res = await fetch(`/api/v1/company/verification/mca/lookup/${encodeURIComponent(cleanCin)}`);
      const json = await res.json();

      if (res.ok && json.data && json.data.found) {
        const comp = json.data;
        if (comp.alreadyRegistered) {
          setIsOrgVerified(false);
          setVerifiedOrgData(null);
          setOrgLookupError(
            `Corporate legal entity "${comp.companyName || cleanCin}" is already registered on the platform. Each corporate CIN may only register once. Please sign in with existing credentials.`
          );
          return;
        }
        if (comp.status && comp.status.toLowerCase() !== 'active') {
          setIsOrgVerified(false);
          setVerifiedOrgData(null);
          setOrgLookupError(`Company status is "${comp.status}". Only Active entities are eligible to register.`);
          return;
        }

        setIsOrgVerified(true);
        setVerifiedOrgData(comp);
        if (comp.officialWebsite && !website) {
          setWebsite(comp.officialWebsite);
        }
        setErrors((prev) => ({ ...prev, uniqueCode: '' }));
        showToast('Ministry of Corporate Affairs (MCA) entity verified successfully!');
      } else {
        setIsOrgVerified(false);
        setVerifiedOrgData(null);
        setOrgLookupError(
          json.data?.message ||
            json.message ||
            `CIN "${cleanCin}" not found in Ministry of Corporate Affairs company master database.`
        );
      }
    } catch {
      setIsOrgVerified(false);
      setVerifiedOrgData(null);
      setOrgLookupError('Failed to query MCA database. Please check your connection.');
    } finally {
      setIsVerifying(false);
    }
  }

  function validate() {
    const nextErrors: typeof errors = {};

    if (role === 'STUDENT') {
      if (!name.trim()) nextErrors.name = 'Full name is required';
    } else if (role === 'INSTITUTION') {
      if (!isOrgVerified || !verifiedOrgData) {
        nextErrors.uniqueCode = 'AICTE Institute ID must be verified against official records before registering';
      }
      if (!instName.trim()) {
        nextErrors.instName = 'Institution name is required';
      }
      if (!representativeName.trim()) {
        nextErrors.representativeName = 'Representative / Coordinator full name is required';
      }
      if (!instCity.trim()) {
        nextErrors.instCity = 'City is required';
      }
      if (!instState.trim()) {
        nextErrors.instState = 'State is required';
      }
    } else if (role === 'COMPANY') {
      if (!isOrgVerified || !verifiedOrgData) {
        nextErrors.uniqueCode = 'Company CIN must be verified with MCA before registering';
      }
      if (!representativeName.trim()) {
        nextErrors.representativeName = 'Representative / HR Leader full name is required';
      }
      if (!website.trim()) {
        nextErrors.website = 'Official corporate website URL is required';
      }
    }

    if (!email.trim()) nextErrors.email = 'Email is required';
    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      nextErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      nextErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      nextErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
      nextErrors.password = 'Password must contain at least one special character (!@#$%^&*)';
    }

    if (!agreeTerms) nextErrors.terms = 'You must agree to the terms';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const effectiveName =
      role === 'STUDENT'
        ? name.trim()
        : representativeName.trim() ||
          (role === 'INSTITUTION' ? instName.trim() || verifiedOrgData?.institutionName || verifiedOrgData?.instituteName || '' : verifiedOrgData?.companyName || '');

    const orgName =
      role === 'INSTITUTION'
        ? instName.trim() || verifiedOrgData?.institutionName || verifiedOrgData?.instituteName
        : role === 'COMPANY'
        ? verifiedOrgData?.companyName
        : undefined;

    const orgState =
      role === 'INSTITUTION'
        ? instState.trim() || verifiedOrgData?.state
        : verifiedOrgData?.state;

    const orgCity =
      role === 'INSTITUTION'
        ? instCity.trim() || verifiedOrgData?.city
        : verifiedOrgData?.city;

    try {
      await authApi.register({
        name: effectiveName,
        email: email.trim().toLowerCase(),
        password,
        confirmPassword: password,
        role,
        cin: role === 'COMPANY' ? verifiedOrgData?.cin : undefined,
        aicteCode: role === 'INSTITUTION' ? verifiedOrgData?.aicteId : undefined,
        organizationName: orgName,
        website: website.trim() || undefined,
        representativeName: role !== 'STUDENT' ? representativeName.trim() : undefined,
        state: orgState || undefined,
        city: orgCity || undefined,
      });

      try {
        const loginRes = await authApi.login({ email: email.trim().toLowerCase(), password });
        login(loginRes.accessToken, loginRes.user);
        showToast('Account created! Proceeding to setup your profile...');
        setTimeout(() => {
          navigate(`/onboarding/${role.toLowerCase()}`);
        }, 500);
      } catch {
        showToast('Registration successful! Please sign in.');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr.message || '';
      if (apiErr.status === 409 || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already been registered')) {
        if (msg.includes('CIN') || msg.toLowerCase().includes('corporate')) {
          showToast(msg, true);
          setOrgLookupError(msg);
          setIsOrgVerified(false);
        } else if (msg.includes('AICTE') || msg.toLowerCase().includes('institution')) {
          showToast(msg, true);
          setOrgLookupError(msg);
          setIsOrgVerified(false);
        } else {
          showToast('An account with this email already exists. Please sign in or use another email.', true);
          setErrors((prev) => ({ ...prev, email: 'This email is already registered' }));
        }
      } else {
        showToast(msg || 'Registration failed. Please check your credentials and try again.', true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginPage}>
      <main className={styles.loginMain}>
        <div className={styles.loginCard}>
          <aside className={styles.loginAside}>
            <div className={styles.asideBrand}>
              <span className={styles.asideMark} aria-hidden="true" />
              <div className={styles.asideBrandText}>
                <span className={styles.asideName}>Beyon</span>
                <span className={styles.asideSub}>Next-Gen Skills &amp; Career Architecture</span>
              </div>
            </div>

            <div className={styles.asideBody}>
              <h2>Intelligent Talent Assessment &amp; Career Growth Platform</h2>
              <p>
                Create your candidate or organization account to access AI-powered skill assessments and career
                opportunities.
              </p>
              <ul className={styles.asideFeatures}>
                <li>
                  <i className="bx bx-shield-quarter" /> Proctored Skill Assessments
                </li>
                <li>
                  <i className="bx bx-brain" /> AI-Powered Career Intelligence
                </li>
                <li>
                  <i className="bx bx-briefcase-alt-2" /> Direct Enterprise Placements
                </li>
              </ul>
            </div>

            <div className={styles.asideFoot}>
              <i className="bx bx-envelope" /> support@beyon.app
            </div>
          </aside>

          <section className={styles.loginPanel}>
            <span className="section-label">Beyon Portal</span>
            <h1>Create Account</h1>
            <p className={styles.loginIntro}>
              Register for portal access to start learning, taking assessments, and discovering career opportunities.
            </p>

            <form
              className={styles.loginForm}
              id="registerForm"
              onSubmit={handleSubmit}
              autoComplete="off"
              noValidate
            >
              {/* Account Role Selector Tabs */}
              <div className={styles.roleSelectorContainer}>
                <span className={styles.roleSelectorLabel}>Select Account Role</span>
                <div className={styles.roleTabsGrid}>
                  <button
                    type="button"
                    className={`${styles.roleTabBtn} ${role === 'STUDENT' ? styles.roleTabBtnActive : ''}`}
                    onClick={() => setRole('STUDENT')}
                  >
                    <i className={`bx bx-user ${styles.roleTabIcon}`} />
                    <span className={styles.roleTabTitle}>Student / Scholar</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.roleTabBtn} ${role === 'INSTITUTION' ? styles.roleTabBtnActive : ''}`}
                    onClick={() => setRole('INSTITUTION')}
                  >
                    <i className={`bx bx-buildings ${styles.roleTabIcon}`} />
                    <span className={styles.roleTabTitle}>Faculty / Institution</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.roleTabBtn} ${role === 'COMPANY' ? styles.roleTabBtnActive : ''}`}
                    onClick={() => setRole('COMPANY')}
                  >
                    <i className={`bx bx-briefcase ${styles.roleTabIcon}`} />
                    <span className={styles.roleTabTitle}>Company / Industry</span>
                  </button>
                </div>
              </div>

              {/* STUDENT ROLE: Standard Full Name */}
              {role === 'STUDENT' && (
                <div className={styles.inputGroup}>
                  <label htmlFor="regName">Full Name</label>
                  <div className={`${styles.inputWrapper} ${errors.name ? styles.error : ''}`}>
                    <i className={`bx bx-user ${styles.inputIcon}`} />
                    <input
                      id="regName"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="Enter your full name"
                      required
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && <span className={styles.inputError}>{errors.name}</span>}
                </div>
              )}

              {/* INSTITUTION ROLE: AICTE Code Lookup & Auto-fill */}
              {role === 'INSTITUTION' && (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="regAicteCode">AICTE Permanent Institute ID</label>
                    <div className={styles.verifyRow}>
                      <div className={`${styles.inputWrapper} ${errors.uniqueCode ? styles.error : ''}`}>
                        <i className={`bx bx-id-card ${styles.inputIcon}`} />
                        <input
                          id="regAicteCode"
                          type="text"
                          value={uniqueCode}
                          onChange={(e) => {
                            setUniqueCode(e.target.value);
                            setIsOrgVerified(false);
                            setVerifiedOrgData(null);
                            setOrgLookupError('');
                            setErrors((prev) => ({ ...prev, uniqueCode: '' }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleVerifyInstitution();
                            }
                          }}
                          placeholder="e.g. 1-44468535196"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.verifyActionBtn}
                        onClick={handleVerifyInstitution}
                        disabled={isVerifying || !uniqueCode.trim()}
                      >
                        {isVerifying ? (
                          <>
                            <i className="bx bx-loader-alt bx-spin" /> Verifying...
                          </>
                        ) : (
                          <>
                            <i className="bx bx-check-shield" /> Verify Institute ID
                          </>
                        )}
                      </button>
                    </div>
                    {errors.uniqueCode && <span className={styles.inputError}>{errors.uniqueCode}</span>}
                    {orgLookupError && <span className={styles.inputError}>{orgLookupError}</span>}
                  </div>

                  {/* Verified Institution Details Card */}
                  {isOrgVerified && verifiedOrgData && (
                    <div className={styles.verifiedEntityCard}>
                      <div className={styles.verifiedCardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={styles.verifiedBadge}>
                            <i className="bx bx-check-circle" /> AICTE VERIFIED
                          </span>
                          <span className={styles.groundedTag}>
                            <i className="bx bx-search-alt-2" /> Google Search Grounded
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.editToggleBtn}
                          onClick={() => setIsEditingDetails(!isEditingDetails)}
                        >
                          <i className={`bx ${isEditingDetails ? 'bx-check' : 'bx-edit'}`} />
                          {isEditingDetails ? 'Done Reviewing' : 'Edit / Review Details'}
                        </button>
                      </div>

                      <h4 className={styles.verifiedEntityName}>{instName || verifiedOrgData.instituteName || verifiedOrgData.institutionName}</h4>

                      {/* Grounded Source Citations */}
                      {verifiedOrgData.sourceUrls && verifiedOrgData.sourceUrls.length > 0 && (
                        <div className={styles.groundedSources}>
                          <span style={{ fontWeight: 600 }}>Sources:</span>
                          {verifiedOrgData.sourceUrls.map((url, idx) => {
                            let domain = url;
                            try {
                              domain = new URL(url).hostname;
                            } catch {}
                            return (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.sourcePill}
                                title={url}
                              >
                                <i className="bx bx-link-external" /> {domain}
                              </a>
                            );
                          })}
                        </div>
                      )}

                      {/* Meta Information Overview */}
                      {!isEditingDetails && (
                        <div className={styles.verifiedMetaGrid}>
                          <div className={styles.verifiedMetaItem}>
                            <span className={styles.verifiedMetaLabel}>State</span>
                            <span className={styles.verifiedMetaVal}>{instState || verifiedOrgData.state || 'N/A'}</span>
                          </div>
                          <div className={styles.verifiedMetaItem}>
                            <span className={styles.verifiedMetaLabel}>City / District</span>
                            <span className={styles.verifiedMetaVal}>
                              {[instCity || verifiedOrgData.city, instDistrict || verifiedOrgData.district].filter(Boolean).join(', ') || 'N/A'}
                            </span>
                          </div>
                          <div className={styles.verifiedMetaItem}>
                            <span className={styles.verifiedMetaLabel}>Institute Type</span>
                            <span className={styles.verifiedMetaVal}>{instType || verifiedOrgData.institutionType || 'Autonomous'}</span>
                          </div>
                          <div className={styles.verifiedMetaItem}>
                            <span className={styles.verifiedMetaLabel}>Affiliated University</span>
                            <span className={styles.verifiedMetaVal}>{instAffiliatedUni || verifiedOrgData.affiliatedUniversity || 'N/A'}</span>
                          </div>
                          {instPincode && (
                            <div className={styles.verifiedMetaItem}>
                              <span className={styles.verifiedMetaLabel}>Pincode</span>
                              <span className={styles.verifiedMetaVal}>{instPincode}</span>
                            </div>
                          )}
                          {website && (
                            <div className={styles.verifiedMetaItem}>
                              <span className={styles.verifiedMetaLabel}>Website</span>
                              <span className={styles.verifiedMetaVal}>{website}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Missing Fields Banner */}
                      {verifiedOrgData.missingFields && verifiedOrgData.missingFields.length > 0 && (
                        <div className={styles.missingFieldsAlert}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="bx bx-info-circle" />
                            <strong>Unretrieved Fields:</strong> The following details could not be found in public records. Please verify/input them manually:
                          </div>
                          <div className={styles.missingFieldsChips}>
                            {verifiedOrgData.missingFields.map((f, i) => (
                              <span key={i} className={styles.missingFieldChip}>
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Editing Grid for Institution Owner Verification */}
                      {isEditingDetails && (
                        <div className={styles.fieldEditGrid}>
                          <div className={styles.fieldEditGridFull}>
                            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#166534' }}>Institution Name</label>
                            <input
                              type="text"
                              value={instName}
                              onChange={(e) => setInstName(e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #86efac' }}
                            />
                            {errors.instName && <span className={styles.inputError}>{errors.instName}</span>}
                          </div>

                          <div>
                            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#166534' }}>City</label>
                            <input
                              type="text"
                              value={instCity}
                              onChange={(e) => setInstCity(e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #86efac' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#166534' }}>District</label>
                            <input
                              type="text"
                              value={instDistrict}
                              onChange={(e) => setInstDistrict(e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #86efac' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#166534' }}>State</label>
                            <input
                              type="text"
                              value={instState}
                              onChange={(e) => setInstState(e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #86efac' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#166534' }}>Pincode</label>
                            <input
                              type="text"
                              value={instPincode}
                              onChange={(e) => setInstPincode(e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #86efac' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#166534' }}>Official Contact Phone</label>
                            <input
                              type="text"
                              value={instPhone}
                              onChange={(e) => setInstPhone(e.target.value)}
                              placeholder="e.g. 04294-226555"
                              style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #86efac' }}
                            />
                          </div>

                          <div className={styles.fieldEditGridFull}>
                            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#166534' }}>Campus Address / Street</label>
                            <input
                              type="text"
                              value={instAddress}
                              onChange={(e) => setInstAddress(e.target.value)}
                              placeholder="e.g. Perundurai Road, Thoppupalayam"
                              style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #86efac' }}
                            />
                          </div>

                          <div className={styles.fieldEditGridFull}>
                            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#166534' }}>Affiliated University</label>
                            <input
                              type="text"
                              value={instAffiliatedUni}
                              onChange={(e) => setInstAffiliatedUni(e.target.value)}
                              placeholder="e.g. Anna University, Chennai"
                              style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #86efac' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Confirmation & Review Notice */}
                      <div className={styles.reviewNoticeBox}>
                        <i className="bx bx-check-shield" />
                        <span>Data auto-populated from Google Search &amp; AICTE. Please confirm accuracy before registration.</span>
                      </div>
                    </div>
                  )}

                  {/* Representative Contact Details for Institution */}
                  {isOrgVerified && (
                    <>
                      <div className={styles.inputGroup}>
                        <label htmlFor="regRepName">Representative Full Name</label>
                        <div className={`${styles.inputWrapper} ${errors.representativeName ? styles.error : ''}`}>
                          <i className={`bx bx-user ${styles.inputIcon}`} />
                          <input
                            id="regRepName"
                            type="text"
                            value={representativeName}
                            onChange={(e) => {
                              setRepresentativeName(e.target.value);
                              setErrors((prev) => ({ ...prev, representativeName: '' }));
                            }}
                            placeholder="e.g. Dr. Rajesh Kumar (TPO / Principal)"
                            required
                          />
                        </div>
                        {errors.representativeName && (
                          <span className={styles.inputError}>{errors.representativeName}</span>
                        )}
                        {verifiedOrgData?.representativeName && representativeName === verifiedOrgData.representativeName && (
                          <span className={styles.autofillBanner}>
                            <i className="bx bx-check" /> Auto-populated from Google Search &amp; AICTE public records
                          </span>
                        )}
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="regInstWebsite">Official Campus Website</label>
                        <div className={styles.inputWrapper}>
                          <i className={`bx bx-globe ${styles.inputIcon}`} />
                          <input
                            id="regInstWebsite"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://www.institution.edu.in"
                          />
                        </div>
                        {verifiedOrgData?.officialWebsite && website === verifiedOrgData.officialWebsite && (
                          <span className={styles.autofillBanner}>
                            <i className="bx bx-check" /> Auto-populated from Google Search &amp; AICTE public records
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* COMPANY ROLE: MCA CIN Lookup & Auto-fill */}
              {role === 'COMPANY' && (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="regCinCode">Company CIN (21-Character)</label>
                    <div className={styles.verifyRow}>
                      <div className={`${styles.inputWrapper} ${errors.uniqueCode ? styles.error : ''}`}>
                        <i className={`bx bx-buildings ${styles.inputIcon}`} />
                        <input
                          id="regCinCode"
                          type="text"
                          value={uniqueCode}
                          onChange={(e) => {
                            setUniqueCode(e.target.value.toUpperCase());
                            setIsOrgVerified(false);
                            setVerifiedOrgData(null);
                            setOrgLookupError('');
                            setErrors((prev) => ({ ...prev, uniqueCode: '' }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleVerifyCompany();
                            }
                          }}
                          placeholder="e.g. U72900KA1981PLC004246"
                          maxLength={21}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.verifyActionBtn}
                        onClick={handleVerifyCompany}
                        disabled={isVerifying || !uniqueCode.trim()}
                      >
                        {isVerifying ? (
                          <>
                            <i className="bx bx-loader-alt bx-spin" /> Verifying...
                          </>
                        ) : (
                          <>
                            <i className="bx bx-check-shield" /> Verify with MCA
                          </>
                        )}
                      </button>
                    </div>
                    {errors.uniqueCode && <span className={styles.inputError}>{errors.uniqueCode}</span>}
                    {orgLookupError && <span className={styles.inputError}>{orgLookupError}</span>}
                    <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Standard 21-character Corporate Identification Number registered with Ministry of Corporate Affairs.
                    </span>
                  </div>

                  {/* Verified Company Details Card */}
                  {isOrgVerified && verifiedOrgData && (
                    <div className={styles.verifiedEntityCard}>
                      <div className={styles.verifiedCardHeader}>
                        <span className={styles.verifiedBadge}>
                          <i className="bx bx-check-circle" /> MCA REGISTERED ENTERPRISE VERIFIED
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>
                          Status: {verifiedOrgData.status || 'Active'}
                        </span>
                      </div>
                      <h4 className={styles.verifiedEntityName}>{verifiedOrgData.companyName}</h4>
                      <div className={styles.verifiedMetaGrid}>
                        <div className={styles.verifiedMetaItem}>
                          <span className={styles.verifiedMetaLabel}>CIN</span>
                          <span className={styles.verifiedMetaVal}>{verifiedOrgData.cin}</span>
                        </div>
                        <div className={styles.verifiedMetaItem}>
                          <span className={styles.verifiedMetaLabel}>State</span>
                          <span className={styles.verifiedMetaVal}>{verifiedOrgData.state || 'N/A'}</span>
                        </div>
                        <div className={styles.verifiedMetaItem}>
                          <span className={styles.verifiedMetaLabel}>Class</span>
                          <span className={styles.verifiedMetaVal}>{verifiedOrgData.class || 'Public'}</span>
                        </div>
                        <div className={styles.verifiedMetaItem}>
                          <span className={styles.verifiedMetaLabel}>Category</span>
                          <span className={styles.verifiedMetaVal}>{verifiedOrgData.category || 'Company'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Representative and Official Website for Company */}
                  {isOrgVerified && (
                    <>
                      <div className={styles.inputGroup}>
                        <label htmlFor="regCompWebsite">Official Corporate Website</label>
                        <div className={`${styles.inputWrapper} ${errors.website ? styles.error : ''}`}>
                          <i className={`bx bx-globe ${styles.inputIcon}`} />
                          <input
                            id="regCompWebsite"
                            type="url"
                            value={website}
                            onChange={(e) => {
                              setWebsite(e.target.value);
                              setErrors((prev) => ({ ...prev, website: '' }));
                            }}
                            placeholder="https://www.company.com"
                            required
                          />
                        </div>
                        {errors.website && <span className={styles.inputError}>{errors.website}</span>}
                        {verifiedOrgData?.officialWebsite && (
                          <span className={styles.autofillBanner}>
                            <i className="bx bx-check" /> Auto-populated from MCA open data records
                          </span>
                        )}
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="regRepCompName">Representative Full Name</label>
                        <div className={`${styles.inputWrapper} ${errors.representativeName ? styles.error : ''}`}>
                          <i className={`bx bx-user ${styles.inputIcon}`} />
                          <input
                            id="regRepCompName"
                            type="text"
                            value={representativeName}
                            onChange={(e) => {
                              setRepresentativeName(e.target.value);
                              setErrors((prev) => ({ ...prev, representativeName: '' }));
                            }}
                            placeholder="e.g. Priya Sharma (Lead Technical Recruiter)"
                            required
                          />
                        </div>
                        {errors.representativeName && (
                          <span className={styles.inputError}>{errors.representativeName}</span>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Email Address */}
              <div className={styles.inputGroup}>
                <label htmlFor="regEmail">
                  {role === 'COMPANY'
                    ? 'Corporate Email Address'
                    : role === 'INSTITUTION'
                    ? 'Official Institutional Email'
                    : 'Email Address'}
                </label>
                <div className={`${styles.inputWrapper} ${errors.email ? styles.error : ''}`}>
                  <i className={`bx bx-envelope ${styles.inputIcon}`} />
                  <input
                    id="regEmail"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder={
                      role === 'COMPANY'
                        ? 'name@company.com'
                        : role === 'INSTITUTION'
                        ? 'coordinator@institution.edu.in'
                        : 'Enter your email'
                    }
                    required
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className={styles.inputError}>{errors.email}</span>}
                {role === 'INSTITUTION' && verifiedOrgData?.officialEmail && email === verifiedOrgData.officialEmail && (
                  <span className={styles.autofillBanner}>
                    <i className="bx bx-check" /> Auto-populated from Google Search &amp; AICTE public records
                  </span>
                )}
              </div>

              {/* Password */}
              <div className={styles.inputGroup}>
                <label htmlFor="regPassword">Password</label>
                <div className={`${styles.inputWrapper} ${errors.password ? styles.error : ''}`}>
                  <i className={`bx bx-lock-alt ${styles.inputIcon}`} />
                  <input
                    id="regPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <i className={showPassword ? 'bx bx-hide' : 'bx bx-show'} />
                  </button>
                </div>
                {errors.password && <span className={styles.inputError}>{errors.password}</span>}
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Must be 8+ characters with uppercase, lowercase, number, and special character.
                </span>
              </div>

              {/* Terms Checkbox */}
              <div className={styles.loginOptions}>
                <label className={styles.rememberMe}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      setErrors((prev) => ({ ...prev, terms: '' }));
                    }}
                  />
                  <span className={styles.checkmark} />
                  I agree to the Portal Terms &amp; Privacy Policy
                </label>
              </div>
              {errors.terms && <span className={styles.inputError}>{errors.terms}</span>}

              {/* Blocked Notice if Institution/Company not yet verified */}
              {role !== 'STUDENT' && !isOrgVerified && (
                <div className={styles.blockedNotice}>
                  <i className="bx bx-shield-quarter" />
                  <span>
                    {role === 'INSTITUTION'
                      ? 'Please verify your AICTE Permanent Institute ID against the official registry to unlock account creation.'
                      : 'Please verify your Corporate Identification Number (CIN) with MCA to unlock account creation.'}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.loginBtn}
                disabled={loading || (role !== 'STUDENT' && !isOrgVerified)}
              >
                {!loading ? (
                  <span>Create Account</span>
                ) : (
                  <i className="bx bx-loader-alt bx-spin" />
                )}
              </button>

              <div className={styles.switchAuth}>
                <span>Already registered?</span>
                <Link to="/login" className={styles.switchLink}>
                  Sign In
                </Link>
              </div>
            </form>

            <div className={styles.loginHelp}>
              <i className="bx bx-shield-quarter" />
              <span>
                Authoritative verification enabled. Registered entities cross-checked with AICTE and Ministry of
                Corporate Affairs.
              </span>
            </div>

            <div
              className={`${styles.loginToast} ${toast.show ? styles.show : ''} ${
                toast.isError ? styles.toastError : ''
              }`}
              role="status"
              aria-live="polite"
            >
              <i className={toast.isError ? 'bx bx-x-circle' : 'bx bx-check-circle'} />
              <span>{toast.message}</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
