import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { FormSection } from '../../components/FormSection';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { MultiSelect } from '../../components/MultiSelect';
import { StepNavigation } from '../../components/StepNavigation';
import type { CompanyFormData } from '../../types/onboarding';
import { EMPTY_COMPANY_FORM } from '../../types/onboarding';
import { api } from '../../../services/api/client';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const STEPS = [
  { label: 'Corporate Identity' },
  { label: 'Hiring & Representatives' },
  { label: 'Review & Verify' },
];

const COMPANY_TYPES = ['Enterprise / MNC', 'Private Limited Company', 'High-Growth Tech Startup', 'Public Listed Entity', 'Consultancy & System Integrator', 'Government / PSU'];
const INDUSTRIES = ['Information Technology & Software', 'FinTech & Digital Banking', 'HealthTech & BioServices', 'EdTech', 'E-commerce & Logistics', 'Automotive & DeepTech', 'Management Consulting', 'Telecommunications', 'Cybersecurity'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];
const HIRING_TYPES = ['Full-time Campus Placement', '6-Month Internship', 'Pre-Placement Offer (PPO)', 'Graduate Engineering Trainee (GET)', 'Summer Analyst Program'];
const PREFERRED_LEVELS = ['Final Year Undergraduates', 'Pre-Final Year Interns', 'Postgraduates (M.Tech/MCA/MBA)', 'Fresh Graduates'];
const SKILLS = ['Java', 'Spring Boot', 'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Engineering', 'System Architecture'];

export function CompanyOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CompanyFormData>({ ...EMPTY_COMPANY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof CompanyFormData>(key: K, value: CompanyFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateCurrentStep(): boolean {
    setError('');
    if (step === 0) {
      if (!form.companyName.trim()) {
        setError('Corporate Legal Name is required');
        return false;
      }
      if (!form.companyType) {
        setError('Company Classification is required');
        return false;
      }
      if (!form.industry) {
        setError('Industry Sector is required');
        return false;
      }
      if (!form.website.trim()) {
        setError('Official corporate website is required');
        return false;
      }
      if (!form.officialEmail.trim() || !form.officialEmail.includes('@')) {
        setError('Valid official corporate email is required');
        return false;
      }
      if (!form.phone.trim()) {
        setError('Official phone number is required');
        return false;
      }
      if (!form.companySize) {
        setError('Company Size / Workforce is required');
        return false;
      }
      if (!form.headquarters.trim() || !form.city.trim() || !form.state.trim() || !form.country.trim()) {
        setError('Headquarters address, city, state, and country are required');
        return false;
      }
      if (!form.about.trim()) {
        setError('Company overview description is required');
        return false;
      }
    } else if (step === 1) {
      if (!form.hiringTypes || form.hiringTypes.length === 0) {
        setError('Please select at least one hiring program');
        return false;
      }
      if (!form.skills || form.skills.length === 0) {
        setError('Please select target recruitment skillsets');
        return false;
      }
      if (!form.representatives || form.representatives.length === 0) {
        setError('Please add at least one authorized HR / Talent Acquisition representative');
        return false;
      }
      const primaryRep = form.representatives[0];
      if (!primaryRep.name.trim() || !primaryRep.email.trim() || !primaryRep.phone.trim()) {
        setError('Authorized representative Name, Email, and Phone are required');
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
      await api.post('/onboarding/company', form);
      navigate('/onboarding/complete');
    } catch {
      setError("We couldn't submit your company profile. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  const reviewRows = [
    { label: 'Company Legal Name', value: form.companyName },
    { label: 'Tier & Classification', value: form.companyType },
    { label: 'Industry Sector', value: form.industry },
    { label: 'Corporate Website', value: form.website },
    { label: 'Official Business Email', value: form.officialEmail },
    { label: 'Corporate Hotline', value: form.phone },
    { label: 'Headquarters Location', value: `${form.headquarters}, ${form.city}, ${form.state}, ${form.country}` },
    { label: 'Company Size', value: `${form.companySize} Employees` },
    { label: 'Hiring Programs', value: form.hiringTypes.join(', ') },
    { label: 'Target Skillsets', value: form.skills.join(', ') },
    { label: 'Primary HR Representative', value: form.representatives.length > 0 ? `${form.representatives[0].name} (${form.representatives[0].designation || 'HR'} · ${form.representatives[0].email})` : 'Not specified' },
  ];

  return (
    <OnboardingLayout currentStep={step + 1} totalSteps={3}>
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
        <FormSection title="Corporate Identity &amp; Headquarters" subtitle="Provide verified business information for institutional campus recruitment authorization. Required fields marked with *">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <FormField id="companyName" label="Company Legal Name *" placeholder="e.g., TechCorp Solutions India Pvt Ltd" value={form.companyName} onChange={(v) => update('companyName', v)} required />
            <SelectField id="companyType" label="Company Classification *" value={form.companyType} onChange={(v) => update('companyType', v)} options={COMPANY_TYPES.map((t) => ({ value: t, label: t }))} placeholder="Select classification" />
            <SelectField id="industry" label="Industry Sector *" value={form.industry} onChange={(v) => update('industry', v)} options={INDUSTRIES.map((i) => ({ value: i, label: i }))} placeholder="Select industry" required />
            <FormField id="website" label="Corporate Website URL *" placeholder="https://www.company.com" value={form.website} onChange={(v) => update('website', v)} required />
            <FormField id="offEmail" label="Official Business Email *" type="email" placeholder="campus.recruitment@company.com" value={form.officialEmail} onChange={(v) => update('officialEmail', v)} required />
            <FormField id="phone" label="Corporate Contact Phone *" placeholder="+91 80 4000 5000" value={form.phone} onChange={(v) => update('phone', v)} required />
            <FormField id="linkedin" label="LinkedIn Company URL" placeholder="https://linkedin.com/company/techcorp" value={form.linkedin} onChange={(v) => update('linkedin', v)} />
            <SelectField id="companySize" label="Company Size / Workforce *" value={form.companySize} onChange={(v) => update('companySize', v)} options={COMPANY_SIZES.map((s) => ({ value: s, label: `${s} employees` }))} placeholder="Select size" required />
            <FormField id="foundedYear" label="Founded Year" type="number" placeholder="2012" value={form.foundedYear} onChange={(v) => update('foundedYear', v)} />
            <FormField id="headquarters" label="Headquarters Campus Address *" placeholder="Whitefield Tech Park, EPIP Zone" value={form.headquarters} onChange={(v) => update('headquarters', v)} required />
            <FormField id="country" label="Country *" placeholder="India" value={form.country} onChange={(v) => update('country', v)} required />
            <FormField id="state" label="State *" placeholder="Karnataka" value={form.state} onChange={(v) => update('state', v)} required />
            <FormField id="city" label="City *" placeholder="Bangalore" value={form.city} onChange={(v) => update('city', v)} required />
          </div>
          <div style={{ marginTop: '16px' }}>
            <FormField id="about" label="Company Business Overview *" as="textarea" placeholder="Describe your corporate core business, technology stacks, and enterprise services..." value={form.about} onChange={(v) => update('about', v)} required />
          </div>
        </FormSection>
      )}

      {step === 1 && (
        <>
          <FormSection title="Recruitment &amp; Campus Hiring Programs" subtitle="Define your campus talent engagement model.">
            <MultiSelect id="hiringTypes" label="Campus Hiring Programs *" options={HIRING_TYPES} selected={form.hiringTypes} onChange={(v) => update('hiringTypes', v)} />
            <div style={{ marginTop: '16px' }}>
              <MultiSelect id="levels" label="Target Academic Cohorts" options={PREFERRED_LEVELS} selected={form.preferredLevels} onChange={(v) => update('preferredLevels', v)} />
            </div>
          </FormSection>

          <FormSection title="Target Technical Skillsets" subtitle="Core competencies recruited by your technical teams.">
            <MultiSelect id="skills" label="Primary Skill Matrix *" options={SKILLS} selected={form.skills} onChange={(v) => update('skills', v)} allowCustom />
          </FormSection>

          <FormSection title="Authorized Talent Acquisition Lead" subtitle="Primary corporate contact for campus drives.">
            {form.representatives.map((rep, i) => (
              <div key={i} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <FormField id={`repName${i}`} label="Lead Recruiter Name *" value={rep.name} onChange={(v) => { const updated = [...form.representatives]; updated[i] = { ...updated[i], name: v }; update('representatives', updated); }} required />
                  <FormField id={`repDesig${i}`} label="Designation *" value={rep.designation} onChange={(v) => { const updated = [...form.representatives]; updated[i] = { ...updated[i], designation: v }; update('representatives', updated); }} placeholder="e.g., Head of University Relations" />
                  <FormField id={`repEmail${i}`} label="Official Email *" type="email" value={rep.email} onChange={(v) => { const updated = [...form.representatives]; updated[i] = { ...updated[i], email: v }; update('representatives', updated); }} required />
                  <FormField id={`repPhone${i}`} label="Mobile / Direct Phone *" value={rep.phone} onChange={(v) => { const updated = [...form.representatives]; updated[i] = { ...updated[i], phone: v }; update('representatives', updated); }} required />
                </div>
                <button type="button" onClick={() => update('representatives', form.representatives.filter((_, j) => j !== i))} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  Remove Representative
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update('representatives', [...form.representatives, { name: '', designation: '', email: '', phone: '' }])}
              style={{ padding: '10px 16px', background: '#ffffff', border: '1px dashed #94a3b8', color: '#1c2d81', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700 }}
            >
              + Add Talent Acquisition Officer
            </button>
          </FormSection>
        </>
      )}

      {step === 2 && (
        <FormSection title="Review Corporate Registration Profile" subtitle="Super Admin will review and verify corporate credentials before authorizing campus hiring privileges.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={28} style={{ color: '#1c2d81', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Corporate Verification Workflow</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Upon submission, your corporate account will enter the <strong>Super Admin Verification Queue</strong>. Verified institutions and candidate assessment pipelines will become visible upon authorization.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px' }}>
              {reviewRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ color: '#0f172a', fontWeight: 700, maxWidth: '60%', textAlign: 'right' }}>{String(row.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </FormSection>
      )}

      <StepNavigation
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={step < 2 ? handleNext : handleSubmit}
        nextLabel={step === 2 ? 'Submit for Super Admin Verification' : 'Continue'}
        loading={loading}
        loadingLabel="Submitting for verification..."
      />
    </OnboardingLayout>
  );
}
