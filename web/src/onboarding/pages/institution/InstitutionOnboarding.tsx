import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { FormSection } from '../../components/FormSection';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { MultiSelect } from '../../components/MultiSelect';
import { StepNavigation } from '../../components/StepNavigation';
import type { InstitutionFormData } from '../../types/onboarding';
import { EMPTY_INSTITUTION_FORM } from '../../types/onboarding';
import { api } from '../../../services/api/client';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const STEPS = [
  { label: 'Campus Details' },
  { label: 'Governance & NAAC' },
  { label: 'Leadership & Cell' },
  { label: 'Review & Verify' },
];

const INSTITUTION_TYPES = [
  'UGC Autonomous Engineering Institute',
  'State University',
  'Central University',
  'Deemed University',
  'Affiliated Engineering College',
  'Polytechnic College',
  'Management & Business School',
  'Arts & Science College',
];

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
];

const ACCREDITATIONS = ['NAAC', 'NBA', 'NIRF', 'AICTE Approved', 'UGC 12(B)', 'ISO 9001:2015'];

export function InstitutionOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<InstitutionFormData>({ ...EMPTY_INSTITUTION_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof InstitutionFormData>(key: K, value: InstitutionFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateCurrentStep(): boolean {
    setError('');
    if (step === 0) {
      if (!form.institutionName.trim()) {
        setError('Institution Name is required');
        return false;
      }
      if (!form.institutionType) {
        setError('Institution Type is required');
        return false;
      }
      if (!form.institutionCode.trim()) {
        setError('Institution / AISHE Code is required');
        return false;
      }
      if (!form.officialEmail.trim() || !form.officialEmail.includes('@')) {
        setError('Valid official institutional email is required');
        return false;
      }
      if (!form.phone.trim()) {
        setError('Official phone number is required');
        return false;
      }
      if (!form.website.trim()) {
        setError('Official website URL is required');
        return false;
      }
      if (!form.address.trim() || !form.city.trim() || !form.state.trim() || !form.postalCode.trim()) {
        setError('Full campus address, city, state, and postal code are required');
        return false;
      }
    } else if (step === 1) {
      if (!form.affiliatedUniversity.trim()) {
        setError('Affiliating University is required');
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
        setError('Total Student Capacity / Strength is required');
        return false;
      }
      if (!form.departmentsOffered || form.departmentsOffered.length === 0) {
        setError('At least one department must be selected');
        return false;
      }
    } else if (step === 2) {
      if (!form.principalName.trim() || !form.principalEmail.trim() || !form.principalPhone.trim()) {
        setError('Principal / Director Name, Email, and Phone are required');
        return false;
      }
      if (!form.placementOfficerName.trim() || !form.placementOfficerEmail.trim() || !form.placementOfficerPhone.trim()) {
        setError('Placement Officer Name, Email, and Phone are required');
        return false;
      }
      if (!form.placementCellEmail.trim() || !form.placementCellPhone.trim()) {
        setError('Placement Cell official email and hotline phone are required');
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (validateCurrentStep()) {
      setStep((prev) => prev + 1);
    }
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/onboarding/institution', form);
      navigate('/onboarding/complete');
    } catch {
      setError("We couldn't submit your institutional verification profile. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  const reviewSections = [
    {
      title: 'Campus Identity & Location',
      items: [
        { label: 'Institution Name', value: form.institutionName },
        { label: 'Type', value: form.institutionType },
        { label: 'Institution Code', value: form.institutionCode },
        { label: 'Official Email', value: form.officialEmail },
        { label: 'Phone', value: form.phone },
        { label: 'Website', value: form.website },
        { label: 'Campus Address', value: `${form.address}, ${form.city}, ${form.state} - ${form.postalCode}, ${form.country}` },
      ],
    },
    {
      title: 'Academic Governance & Accreditation',
      items: [
        { label: 'Affiliated University', value: form.affiliatedUniversity },
        { label: 'Autonomy Status', value: form.autonomousStatus },
        { label: 'NAAC Grade', value: form.accreditationGrade },
        { label: 'NIRF Ranking', value: form.nirfRank || 'Not Specified' },
        { label: 'Established Year', value: form.establishedYear },
        { label: 'Student Strength', value: `${form.totalStudents} Enrolled Scholars` },
        { label: 'Departments', value: form.departmentsOffered.join(', ') },
      ],
    },
    {
      title: 'Leadership & Placement Officers',
      items: [
        { label: 'Principal / Director', value: `${form.principalName} (${form.principalEmail} · ${form.principalPhone})` },
        { label: 'Head of Placement', value: `${form.placementOfficerName} (${form.placementOfficerEmail} · ${form.placementOfficerPhone})` },
        { label: 'Placement Cell Contacts', value: `${form.placementCellEmail} · ${form.placementCellPhone}` },
      ],
    },
  ];

  return (
    <OnboardingLayout currentStep={step + 1} totalSteps={4}>
      <OnboardingProgress steps={STEPS} currentStepIndex={step} />

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#dc2626',
            marginBottom: '20px',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}
          >
            &times;
          </button>
        </div>
      )}

      {step === 0 && (
        <FormSection title="Campus Identity &amp; Location" subtitle="Provide verified institutional credentials. Required fields marked with *">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <FormField id="instName" label="Institution Full Name *" placeholder="e.g., Coimbatore Institute of Technology" value={form.institutionName} onChange={(v) => update('institutionName', v)} required />
            <SelectField id="instType" label="Institution Classification *" value={form.institutionType} onChange={(v) => update('institutionType', v)} options={INSTITUTION_TYPES.map((t) => ({ value: t, label: t }))} placeholder="Select classification" />
            <FormField id="instCode" label="AISHE / Institution Code *" placeholder="e.g., C-16624 / AISHE-1092" value={form.institutionCode} onChange={(v) => update('institutionCode', v)} required />
            <FormField id="offEmail" label="Official Institutional Email *" type="email" placeholder="principal@institution.edu.in" value={form.officialEmail} onChange={(v) => update('officialEmail', v)} required />
            <FormField id="phone" label="Official Landline / Phone *" placeholder="+91 422 257 4000" value={form.phone} onChange={(v) => update('phone', v)} required />
            <FormField id="website" label="Official Website URL *" placeholder="https://www.institution.edu.in" value={form.website} onChange={(v) => update('website', v)} required />
            <FormField id="country" label="Country *" placeholder="India" value={form.country} onChange={(v) => update('country', v)} required />
            <FormField id="state" label="State *" placeholder="Tamil Nadu" value={form.state} onChange={(v) => update('state', v)} required />
            <FormField id="city" label="City *" placeholder="Coimbatore" value={form.city} onChange={(v) => update('city', v)} required />
            <FormField id="postalCode" label="PIN / Postal Code *" placeholder="641014" value={form.postalCode} onChange={(v) => update('postalCode', v)} required />
          </div>
          <div style={{ marginTop: '16px' }}>
            <FormField id="address" label="Full Campus Address *" placeholder="Campus street address, landmark, avenue..." value={form.address} onChange={(v) => update('address', v)} required />
          </div>
        </FormSection>
      )}

      {step === 1 && (
        <FormSection title="Academic Governance &amp; Accreditations" subtitle="Regulatory compliance, university affiliation, and NAAC/NIRF credentials.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <FormField id="affiliated" label="Affiliating University *" placeholder="e.g., Anna University, Chennai" value={form.affiliatedUniversity} onChange={(v) => update('affiliatedUniversity', v)} required />
            <SelectField id="autonomous" label="Autonomy Status *" value={form.autonomousStatus} onChange={(v) => update('autonomousStatus', v)} options={[{ value: 'Autonomous', label: 'UGC Conferred Autonomous' }, { value: 'Non-Autonomous', label: 'Affiliated Non-Autonomous' }, { value: 'University Campus', label: 'University Department / Constituent' }]} />
            <FormField id="estYear" label="Established Year *" type="number" placeholder="1956" value={form.establishedYear} onChange={(v) => update('establishedYear', v)} required />
            <SelectField id="accGrade" label="NAAC Accreditation Grade *" value={form.accreditationGrade} onChange={(v) => update('accreditationGrade', v)} options={[{ value: 'A++', label: 'Grade A++ (CGPA 3.51 - 4.00)' }, { value: 'A+', label: 'Grade A+ (CGPA 3.26 - 3.50)' }, { value: 'A', label: 'Grade A (CGPA 3.01 - 3.25)' }, { value: 'B++', label: 'Grade B++ (CGPA 2.76 - 3.00)' }, { value: 'B+', label: 'Grade B+ (CGPA 2.51 - 2.75)' }, { value: 'B', label: 'Grade B (CGPA 2.01 - 2.50)' }, { value: 'Not Accredited', label: 'Not Accredited' }]} placeholder="Select NAAC grade" />
            <FormField id="nirfRank" label="NIRF Ranking Band (Optional)" placeholder="e.g., Rank #53 or Band 51-100" value={form.nirfRank} onChange={(v) => update('nirfRank', v)} />
            <FormField id="totalStudents" label="Total Enrolled Student Strength *" type="number" placeholder="e.g., 4200" value={form.totalStudents} onChange={(v) => update('totalStudents', v)} required />
          </div>

          <div style={{ marginTop: '16px' }}>
            <MultiSelect id="departments" label="Academic Departments Offered *" options={DEPARTMENTS_LIST} selected={form.departmentsOffered} onChange={(v) => update('departmentsOffered', v)} allowCustom />
          </div>

          <div style={{ marginTop: '16px' }}>
            <MultiSelect id="accreditations" label="Recognitions &amp; Additional Accreditations" options={ACCREDITATIONS} selected={form.accreditations} onChange={(v) => update('accreditations', v)} allowCustom />
          </div>
        </FormSection>
      )}

      {step === 2 && (
        <>
          <FormSection title="Principal &amp; Executive Leadership" subtitle="Official contact of the head of the institution.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <FormField id="principalName" label="Principal / Director Name *" placeholder="Dr. R. Ramanathan" value={form.principalName} onChange={(v) => update('principalName', v)} required />
              <FormField id="principalEmail" label="Principal Official Email *" type="email" placeholder="principal@college.edu.in" value={form.principalEmail} onChange={(v) => update('principalEmail', v)} required />
              <FormField id="principalPhone" label="Principal Phone / Mobile *" placeholder="+91 94430 12345" value={form.principalPhone} onChange={(v) => update('principalPhone', v)} required />
            </div>
          </FormSection>

          <FormSection title="Placement Cell &amp; Corporate Relations" subtitle="Authorized placement officer and department contact.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <FormField id="poName" label="Placement Officer Name *" placeholder="Prof. K. Venkatesh" value={form.placementOfficerName} onChange={(v) => update('placementOfficerName', v)} required />
              <FormField id="poEmail" label="Placement Officer Email *" type="email" placeholder="placement.head@college.edu.in" value={form.placementOfficerEmail} onChange={(v) => update('placementOfficerEmail', v)} required />
              <FormField id="poPhone" label="Placement Officer Phone *" placeholder="+91 98420 54321" value={form.placementOfficerPhone} onChange={(v) => update('placementOfficerPhone', v)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
              <FormField id="cellEmail" label="Placement Cell General Email *" type="email" placeholder="placements@college.edu.in" value={form.placementCellEmail} onChange={(v) => update('placementCellEmail', v)} required />
              <FormField id="cellPhone" label="Placement Cell Hotline *" placeholder="+91 422 257 4050" value={form.placementCellPhone} onChange={(v) => update('placementCellPhone', v)} required />
            </div>
          </FormSection>
        </>
      )}

      {step === 3 && (
        <FormSection title="Review Institutional Verification Profile" subtitle="Super Admin will review and verify these credentials before activating your campus command center.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={28} style={{ color: '#1c2d81', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Account Verification Workflow</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Upon clicking submit, your institution registration will enter the <strong>Super Admin Verification Queue</strong>. Campus placement drives, candidate rosters, and corporate connections become accessible once verified.
                </div>
              </div>
            </div>

            {reviewSections.map((sec, sIdx) => (
              <div key={sIdx} style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 800, color: '#1c2d81' }}>{sec.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sec.items.map((row, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>{row.label}</span>
                      <span style={{ color: '#0f172a', fontWeight: 700, maxWidth: '60%', textAlign: 'right' }}>{row.value || 'Not provided'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      )}

      <StepNavigation
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={step < 3 ? handleNext : handleSubmit}
        nextLabel={step === 3 ? 'Submit for Super Admin Verification' : 'Continue'}
        loading={loading}
        loadingLabel="Submitting for verification..."
      />
    </OnboardingLayout>
  );
}
