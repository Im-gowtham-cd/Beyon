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

const STEPS = [
  { label: 'Basic Info' },
  { label: 'Academic' },
  { label: 'Placement' },
  { label: 'Review' },
];

const INSTITUTION_TYPES = ['University', 'Engineering College', 'Arts & Science College', 'Medical College', 'Polytechnic', 'Management Institution', 'Other'];
const ACCREDITATIONS = ['NAAC', 'NBA', 'NIRF', 'ISO', 'Other'];

export function InstitutionOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<InstitutionFormData>({ ...EMPTY_INSTITUTION_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof InstitutionFormData>(key: K, value: InstitutionFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      await api.post('/onboarding/institution', form);
      navigate('/onboarding/complete');
    } catch {
      setError('We couldn\'t save your profile. Your information is still here.');
    } finally {
      setLoading(false);
    }
  }

  const reviewRows = [
    { label: 'Institution Name', value: form.institutionName },
    { label: 'Type', value: form.institutionType },
    { label: 'Official Email', value: form.officialEmail },
    { label: 'Phone', value: form.phone },
    { label: 'Website', value: form.website },
    { label: 'Country', value: form.country },
    { label: 'City', value: form.city },
    { label: 'Accreditations', value: form.accreditations.join(', ') },
    { label: 'Established', value: form.establishedYear },
    { label: 'Placement Rate', value: form.placementRate ? `${form.placementRate}%` : undefined },
    { label: 'Representatives', value: `${form.representatives.length} added` },
  ];

  return (
    <OnboardingLayout currentStep={step + 1} totalSteps={4}>
      <OnboardingProgress steps={STEPS} currentStepIndex={step} />

      {error && (
        <div style={{ padding: 'var(--space-md)', background: 'rgba(255, 92, 92, 0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-sm)', color: 'var(--color-error)', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'var(--space-sm)', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', textDecoration: 'underline' }}>Dismiss</button>
        </div>
      )}

      {step === 0 && (
        <FormSection title="Basic Information" subtitle="Tell us about your institution.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
            <FormField id="instName" label="Institution Name" placeholder="e.g., ABC Engineering College" value={form.institutionName} onChange={v => update('institutionName', v)} required />
            <SelectField id="instType" label="Institution Type" value={form.institutionType} onChange={v => update('institutionType', v)} options={INSTITUTION_TYPES.map(t => ({ value: t, label: t }))} placeholder="Select type" />
            <FormField id="instCode" label="Institution Code" placeholder="e.g., NAAC-1234" value={form.institutionCode} onChange={v => update('institutionCode', v)} />
            <FormField id="offEmail" label="Official Email" type="email" placeholder="admin@college.edu" value={form.officialEmail} onChange={v => update('officialEmail', v)} required />
            <FormField id="phone" label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={v => update('phone', v)} required />
            <FormField id="website" label="Website" placeholder="https://college.edu" value={form.website} onChange={v => update('website', v)} />
            <FormField id="country" label="Country" placeholder="India" value={form.country} onChange={v => update('country', v)} />
            <FormField id="state" label="State" placeholder="Tamil Nadu" value={form.state} onChange={v => update('state', v)} />
            <FormField id="city" label="City" placeholder="Chennai" value={form.city} onChange={v => update('city', v)} />
            <FormField id="address" label="Address" placeholder="Full address" value={form.address} onChange={v => update('address', v)} />
          </div>
        </FormSection>
      )}

      {step === 1 && (
        <>
          <FormSection title="Academic Information" subtitle="Accreditation and academic details.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
              <FormField id="affiliated" label="Affiliated University" placeholder="e.g., Anna University" value={form.affiliatedUniversity} onChange={v => update('affiliatedUniversity', v)} />
              <FormField id="estYear" label="Established Year" type="number" placeholder="1990" value={form.establishedYear} onChange={v => update('establishedYear', v)} />
              <SelectField id="accGrade" label="Accreditation Grade" value={form.accreditationGrade} onChange={v => update('accreditationGrade', v)} options={[{ value: 'A++', label: 'A++' }, { value: 'A+', label: 'A+' }, { value: 'A', label: 'A' }, { value: 'B++', label: 'B++' }, { value: 'B+', label: 'B+' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }]} placeholder="Select grade" />
            </div>
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <MultiSelect id="accreditations" label="Accreditations" options={ACCREDITATIONS} selected={form.accreditations} onChange={v => update('accreditations', v)} allowCustom />
            </div>
          </FormSection>
          <FormSection title="Authorized Representative" subtitle="Primary contact person at your institution.">
            {form.representatives.length > 0 && form.representatives.map((rep, i) => (
              <div key={i} style={{ padding: 'var(--space-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-sm)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
                  <FormField id={`repName${i}`} label="Name" value={rep.name} onChange={v => { const updated = [...form.representatives]; updated[i] = { ...updated[i], name: v }; update('representatives', updated); }} required />
                  <FormField id={`repDesig${i}`} label="Designation" value={rep.designation} onChange={v => { const updated = [...form.representatives]; updated[i] = { ...updated[i], designation: v }; update('representatives', updated); }} placeholder="e.g., Placement Officer" />
                  <FormField id={`repEmail${i}`} label="Email" type="email" value={rep.email} onChange={v => { const updated = [...form.representatives]; updated[i] = { ...updated[i], email: v }; update('representatives', updated); }} />
                  <FormField id={`repPhone${i}`} label="Phone" value={rep.phone} onChange={v => { const updated = [...form.representatives]; updated[i] = { ...updated[i], phone: v }; update('representatives', updated); }} />
                </div>
                <button type="button" onClick={() => update('representatives', form.representatives.filter((_, j) => j !== i))} style={{ marginTop: 'var(--space-sm)', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => update('representatives', [...form.representatives, { name: '', designation: '', email: '', phone: '', department: '' }])} style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              + Add Representative
            </button>
          </FormSection>
        </>
      )}

      {step === 2 && (
        <FormSection title="Placement Information" subtitle="Current placement metrics (can be updated later).">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
            <FormField id="totalStudents" label="Total Students" type="number" placeholder="e.g., 1200" value={form.totalStudents} onChange={v => update('totalStudents', v)} />
            <FormField id="placementRate" label="Placement Rate (%)" type="number" placeholder="e.g., 85" value={form.placementRate} onChange={v => update('placementRate', v)} />
            <FormField id="avgPkg" label="Average Package (LPA)" type="number" placeholder="e.g., 4.5" value={form.averagePackage} onChange={v => update('averagePackage', v)} />
            <FormField id="highPkg" label="Highest Package (LPA)" type="number" placeholder="e.g., 45" value={form.highestPackage} onChange={v => update('highestPackage', v)} />
            <FormField id="willCount" label="Placement Willing Students" type="number" value={form.placementWillingCount} onChange={v => update('placementWillingCount', v)} />
            <FormField id="notWillCount" label="Placement Not Willing Students" type="number" value={form.placementNotWillingCount} onChange={v => update('placementNotWillingCount', v)} />
          </div>
        </FormSection>
      )}

      {step === 3 && (
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
        onNext={step < 3 ? () => setStep(step + 1) : handleSubmit}
        nextLabel={step === 3 ? 'Create Profile' : 'Continue'}
        loading={loading}
        loadingLabel="Creating profile..."
      />
    </OnboardingLayout>
  );
}
