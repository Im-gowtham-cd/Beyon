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

const STEPS = [
  { label: 'Basic Info' },
  { label: 'Hiring' },
  { label: 'Review' },
];

const COMPANY_TYPES = ['Startup', 'Private Company', 'Public Company', 'Government', 'MNC', 'Non-profit', 'Consultancy', 'Other'];
const INDUSTRIES = ['Information Technology', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'Automotive', 'Manufacturing', 'Consulting', 'Telecommunications', 'Banking', 'Other'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];
const HIRING_TYPES = ['Full-time', 'Internship', 'Apprenticeship', 'Contract', 'Graduate Program', 'Trainee'];
const PREFERRED_LEVELS = ['Fresher', 'Entry Level', 'Experienced'];
const SKILLS = ['Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Spring Boot', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis'];

export function CompanyOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CompanyFormData>({ ...EMPTY_COMPANY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof CompanyFormData>(key: K, value: CompanyFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      await api.post('/onboarding/company', form);
      navigate('/onboarding/complete');
    } catch {
      setError('We couldn\'t save your profile. Your information is still here.');
    } finally {
      setLoading(false);
    }
  }

  const reviewRows = [
    { label: 'Company Name', value: form.companyName },
    { label: 'Type', value: form.companyType },
    { label: 'Industry', value: form.industry },
    { label: 'Website', value: form.website },
    { label: 'Official Email', value: form.officialEmail },
    { label: 'Phone', value: form.phone },
    { label: 'Country', value: form.country },
    { label: 'City', value: form.city },
    { label: 'Company Size', value: form.companySize },
    { label: 'Hiring Types', value: form.hiringTypes.join(', ') },
    { label: 'Skills', value: form.skills.join(', ') },
    { label: 'Representatives', value: `${form.representatives.length} added` },
  ];

  return (
    <OnboardingLayout currentStep={step + 1} totalSteps={3}>
      <OnboardingProgress steps={STEPS} currentStepIndex={step} />

      {error && (
        <div style={{ padding: 'var(--space-md)', background: 'rgba(255, 92, 92, 0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-sm)', color: 'var(--color-error)', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'var(--space-sm)', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', textDecoration: 'underline' }}>Dismiss</button>
        </div>
      )}

      {step === 0 && (
        <>
          <FormSection title="Company Information" subtitle="Tell us about your company.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
              <FormField id="companyName" label="Company Name" placeholder="e.g., TechCorp Inc." value={form.companyName} onChange={v => update('companyName', v)} required />
              <SelectField id="companyType" label="Company Type" value={form.companyType} onChange={v => update('companyType', v)} options={COMPANY_TYPES.map(t => ({ value: t, label: t }))} placeholder="Select type" />
              <SelectField id="industry" label="Industry" value={form.industry} onChange={v => update('industry', v)} options={INDUSTRIES.map(i => ({ value: i, label: i }))} placeholder="Select industry" required />
              <FormField id="website" label="Website" placeholder="https://company.com" value={form.website} onChange={v => update('website', v)} required />
              <FormField id="offEmail" label="Official Email" type="email" placeholder="hr@company.com" value={form.officialEmail} onChange={v => update('officialEmail', v)} required />
              <FormField id="phone" label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={v => update('phone', v)} required />
              <FormField id="linkedin" label="LinkedIn" placeholder="https://linkedin.com/company/..." value={form.linkedin} onChange={v => update('linkedin', v)} />
              <SelectField id="companySize" label="Company Size" value={form.companySize} onChange={v => update('companySize', v)} options={COMPANY_SIZES.map(s => ({ value: s, label: `${s} employees` }))} placeholder="Select size" required />
              <FormField id="foundedYear" label="Founded Year" type="number" placeholder="2015" value={form.foundedYear} onChange={v => update('foundedYear', v)} />
              <FormField id="headquarters" label="Headquarters" placeholder="Bangalore, India" value={form.headquarters} onChange={v => update('headquarters', v)} />
              <FormField id="country" label="Country" placeholder="India" value={form.country} onChange={v => update('country', v)} />
              <FormField id="state" label="State" placeholder="Karnataka" value={form.state} onChange={v => update('state', v)} />
              <FormField id="city" label="City" placeholder="Bangalore" value={form.city} onChange={v => update('city', v)} />
            </div>
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <FormField id="about" label="About Company" as="textarea" placeholder="Describe what your company does..." value={form.about} onChange={v => update('about', v)} required />
            </div>
          </FormSection>
        </>
      )}

      {step === 1 && (
        <>
          <FormSection title="Recruitment Preferences" subtitle="How does your company hire?">
            <MultiSelect id="hiringTypes" label="Hiring Types" options={HIRING_TYPES} selected={form.hiringTypes} onChange={v => update('hiringTypes', v)} />
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <MultiSelect id="levels" label="Preferred Candidate Levels" options={PREFERRED_LEVELS} selected={form.preferredLevels} onChange={v => update('preferredLevels', v)} />
            </div>
          </FormSection>
          <FormSection title="Hiring Skills" subtitle="Common skills your company recruits for.">
            <MultiSelect id="skills" label="Skills" options={SKILLS} selected={form.skills} onChange={v => update('skills', v)} allowCustom />
          </FormSection>
          <FormSection title="Authorized Representative" subtitle="Primary contact person.">
            {form.representatives.map((rep, i) => (
              <div key={i} style={{ padding: 'var(--space-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-sm)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
                  <FormField id={`repName${i}`} label="Name" value={rep.name} onChange={v => { const updated = [...form.representatives]; updated[i] = { ...updated[i], name: v }; update('representatives', updated); }} required />
                  <FormField id={`repDesig${i}`} label="Designation" value={rep.designation} onChange={v => { const updated = [...form.representatives]; updated[i] = { ...updated[i], designation: v }; update('representatives', updated); }} placeholder="e.g., HR Manager" />
                  <FormField id={`repEmail${i}`} label="Email" type="email" value={rep.email} onChange={v => { const updated = [...form.representatives]; updated[i] = { ...updated[i], email: v }; update('representatives', updated); }} />
                  <FormField id={`repPhone${i}`} label="Phone" value={rep.phone} onChange={v => { const updated = [...form.representatives]; updated[i] = { ...updated[i], phone: v }; update('representatives', updated); }} />
                </div>
                <button type="button" onClick={() => update('representatives', form.representatives.filter((_, j) => j !== i))} style={{ marginTop: 'var(--space-sm)', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => update('representatives', [...form.representatives, { name: '', designation: '', email: '', phone: '' }])} style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              + Add Representative
            </button>
          </FormSection>
        </>
      )}

      {step === 2 && (
        <FormSection title="Review Your Profile" subtitle="Check everything looks correct before submitting.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {reviewRows.filter(r => r.value).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-sm) var(--space-md)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{row.label}</span>
                <span style={{ color: 'var(--color-text)' }}>{String(row.value)}</span>
              </div>
            ))}
          </div>
        </FormSection>
      )}

      <StepNavigation
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={step < 2 ? () => setStep(step + 1) : handleSubmit}
        nextLabel={step === 2 ? 'Create Profile' : 'Continue'}
        loading={loading}
        loadingLabel="Creating profile..."
      />
    </OnboardingLayout>
  );
}
