import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Send,
  RefreshCw,
} from 'lucide-react';

interface AicteResult {
  valid: boolean;
  aicteId: string;
  institutionName: string;
  state: string;
  district: string;
  city: string;
  region: string;
  userGroup: string;
}

export function InstitutionOnboardingPage() {
  const [aicteSearch, setAicteSearch] = useState('');
  const [aicteLoading, setAicteLoading] = useState(false);
  const [aicteData, setAicteData] = useState<AicteResult | null>(null);
  const [aicteError, setAicteError] = useState<string | null>(null);

  // Form
  const [formData, setFormData] = useState({
    institutionName: '',
    officialEmail: '',
    phone: '',
    website: '',
    institutionType: 'Autonomous Engineering Institution',
    affiliatedUniversity: '',
    accreditationGrade: 'A++',
    address: '',
    principalName: '',
    principalEmail: '',
    principalMobile: '',
  });

  // State
  const [submitting, setSubmitting] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentOnboardings, setRecentOnboardings] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const fetchRecentInstitutions = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/onboarding/institutions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setRecentOnboardings(json.data || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentInstitutions();
  }, [fetchRecentInstitutions]);

  const handleSearchAicte = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aicteSearch.trim()) return;

    setAicteLoading(true);
    setAicteError(null);
    setAicteData(null);

    try {
      const res = await fetch(`/api/v1/institution/onboard/validate-aicte?aicteId=${encodeURIComponent(aicteSearch.trim())}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setAicteData(json.data);
        setFormData((prev) => ({
          ...prev,
          institutionName: json.data.institutionName || prev.institutionName,
          address: `${json.data.city || ''}, ${json.data.district || ''}, ${json.data.state || ''}`.trim(),
        }));
      } else {
        setAicteError(json.message || 'AICTE ID not recognized in official accreditation database.');
      }
    } catch {
      setAicteError('Failed to query authoritative AICTE registry.');
    } finally {
      setAicteLoading(false);
    }
  };

  const handleInitiateOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!aicteData) {
      setErrorMessage('Please validate the institution AICTE ID first.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/institution/onboard/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          aicteId: aicteData.aicteId,
          institutionName: formData.institutionName || aicteData.institutionName,
          officialEmail: formData.officialEmail,
          phone: formData.phone,
          website: formData.website,
          institutionType: formData.institutionType,
          affiliatedUniversity: formData.affiliatedUniversity,
          accreditationGrade: formData.accreditationGrade,
          city: aicteData.city,
          state: aicteData.state,
          address: formData.address,
          principalName: formData.principalName,
          principalEmail: formData.principalEmail,
          principalMobile: formData.principalMobile,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        setActiveOtpCode(json.data.otpCode || null);
        setOtpModalOpen(true);
        setSuccessMessage('AICTE validation successful! OTP has been generated for Principal verification.');
      } else {
        setErrorMessage(json.message || 'Failed to initiate institution onboarding.');
      }
    } catch {
      setErrorMessage('Network error initiating onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingOtp(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/institution/onboard/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aicteId: aicteData?.aicteId,
          principalEmail: formData.principalEmail,
          otpCode: otpCodeInput.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        setOtpModalOpen(false);
        setSuccessMessage(`Accreditation Complete! Institution "${formData.institutionName}" is officially verified and the Principal account for ${formData.principalEmail} is now ACTIVE.`);
        setAicteData(null);
        setAicteSearch('');
        setOtpCodeInput('');
        setActiveOtpCode(null);
        fetchRecentInstitutions();
      } else {
        setErrorMessage(json.message || 'Invalid or expired OTP code entered.');
      }
    } catch {
      setErrorMessage('Network error during OTP verification.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Building2 size={28} color="#1c2d81" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Authoritative Institution Onboarding &amp; AICTE Validation
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Authorized Institution Managers validate colleges against the authoritative registry (13,694 institutions), assign verified Principal credentials, and trigger secure OTP verification.
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '14px 18px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <CheckCircle2 size={20} color="#16a34a" />
          <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '14px 18px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} color="#dc2626" />
          <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        {/* Left Column: Form */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.75rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' }}>
            Step 1: AICTE Registry Lookup
          </h2>

          <form onSubmit={handleSearchAicte} style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input
                type="text"
                value={aicteSearch}
                onChange={(e) => setAicteSearch(e.target.value)}
                placeholder="Enter AICTE ID (e.g., 1-3589631, 1-3652871, 1-1376841)"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={aicteLoading || !aicteSearch.trim()}
              style={{
                padding: '10px 20px',
                background: '#1c2d81',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: aicteLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={16} className={aicteLoading ? 'animate-spin' : ''} />
              <span>{aicteLoading ? 'Validating...' : 'Validate Code'}</span>
            </button>
          </form>

          {aicteError && (
            <div
              style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#c2410c',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              {aicteError}
            </div>
          )}

          {aicteData && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldCheck size={18} color="#16a34a" />
                <span style={{ fontWeight: 700, color: '#15803d', fontSize: '0.88rem' }}>
                  AICTE Accredited Institution Verified
                </span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                {aicteData.institutionName}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                ID: <strong>{aicteData.aicteId}</strong> &bull; Region: {aicteData.region} &bull; District: {aicteData.district}, {aicteData.state}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleInitiateOnboarding}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', margin: '1.5rem 0 1rem 0' }}>
              Step 2: Institutional &amp; Principal Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  College Name
                </label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  placeholder="Official Institution Name"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Official Email
                </label>
                <input
                  type="email"
                  value={formData.officialEmail}
                  onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                  placeholder="info@institution.edu"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Affiliated University
                </label>
                <input
                  type="text"
                  value={formData.affiliatedUniversity}
                  onChange={(e) => setFormData({ ...formData, affiliatedUniversity: e.target.value })}
                  placeholder="e.g. Anna University, Chennai"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Accreditation Grade
                </label>
                <select
                  value={formData.accreditationGrade}
                  onChange={(e) => setFormData({ ...formData, accreditationGrade: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                >
                  <option value="A++">NAAC A++</option>
                  <option value="A+">NAAC A+</option>
                  <option value="A">NAAC A</option>
                  <option value="B++">NAAC B++</option>
                  <option value="NBA">NBA Tier-1</option>
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#334155', margin: '1.25rem 0 0.75rem 0' }}>
              Principal Official Contact (For Verification OTP &amp; Administrative Account)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Principal Name
                </label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  placeholder="Dr. Principal Full Name"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Principal Official Email
                </label>
                <input
                  type="email"
                  value={formData.principalEmail}
                  onChange={(e) => setFormData({ ...formData, principalEmail: e.target.value })}
                  placeholder="principal@institution.edu"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Principal Official Mobile
              </label>
              <input
                type="tel"
                value={formData.principalMobile}
                onChange={(e) => setFormData({ ...formData, principalMobile: e.target.value })}
                placeholder="+91-9876543210"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !aicteData}
              style={{
                width: '100%',
                padding: '12px',
                background: submitting || !aicteData ? '#94a3b8' : '#1c2d81',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: submitting || !aicteData ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <Send size={18} />
              <span>{submitting ? 'Generating Verification OTP...' : 'Generate & Send Principal OTP'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Information & Recent Onboardings */}
        <div>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
              Institutional Governance Protocol
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <li>Every onboarded college must have an authentic AICTE identifier verified against authoritative databases.</li>
              <li>A cryptographically secure OTP is dispatched to the Principal's official address.</li>
              <li>An institution cannot become active without Principal verification.</li>
              <li>Once verified, the Principal receives platform administrator rights over their institutional domain.</li>
            </ul>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Platform Approved Institutions
              </h3>
              <button
                type="button"
                onClick={fetchRecentInstitutions}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
              >
                <RefreshCw size={14} className={loadingRecent ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {recentOnboardings.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No approved institutions recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentOnboardings.slice(0, 5).map((inst) => (
                  <div
                    key={inst.id || inst.code}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #f1f5f9',
                      background: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem' }}>{inst.name}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#dcfce7',
                          color: '#15803d',
                        }}
                      >
                        ACTIVE
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      Code: {inst.code} &bull; {inst.city}, {inst.state}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Principal OTP Modal */}
      {otpModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                }}
              >
                <KeyRound size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Enter Principal Verification OTP
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                A 6-digit verification code has been dispatched to Principal <strong>{formData.principalEmail}</strong>.
              </p>
            </div>

            {activeOtpCode && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  textAlign: 'center',
                  marginBottom: '1rem',
                }}
              >
                Dev/Demo Verification Code: <strong>{activeOtpCode}</strong>
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: '1.25rem' }}>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCodeInput}
                  onChange={(e) => setOtpCodeInput(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    letterSpacing: '6px',
                    fontWeight: 800,
                    borderRadius: '8px',
                    border: '2px solid #cbd5e1',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingOtp || otpCodeInput.length < 6}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: verifyingOtp || otpCodeInput.length < 6 ? '#94a3b8' : '#1c2d81',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: verifyingOtp || otpCodeInput.length < 6 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
