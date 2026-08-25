import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { FormSection } from '../../components/FormSection';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { MultiSelect } from '../../components/MultiSelect';
import { SkillSelector } from '../../components/SkillSelector';
import { StepNavigation } from '../../components/StepNavigation';
import type { StudentFormData } from '../../types/onboarding';
import { EMPTY_STUDENT_FORM } from '../../types/onboarding';
import { api } from '../../../services/api/client';

const STEPS = [
  { label: 'Personal' },
  { label: 'Academic' },
  { label: 'Career' },
  { label: 'Skills' },
  { label: 'Review' },
];

const JOB_ROLES = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'Data Scientist', 'AI Engineer', 'ML Engineer', 'Cloud Engineer', 'DevOps Engineer', 'Cybersecurity Engineer', 'UI/UX Designer', 'Product Engineer'];
const INDUSTRIES = ['FinTech', 'HealthTech', 'EdTech', 'SaaS', 'Automotive', 'Manufacturing', 'Consulting', 'Government', 'E-commerce'];
const DEGREES = ['B.E', 'B.Tech', 'B.Sc', 'M.E', 'M.Tech', 'MCA', 'BCA', 'B.Com', 'MBA'];
const DEPARTMENTS = ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Other'];
const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduation Year'];

export function StudentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<StudentFormData>({ ...EMPTY_STUDENT_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof StudentFormData>(key: K, value: StudentFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      await api.post('/onboarding/student', form);
      navigate('/onboarding/complete');
    } catch {
      setError('We couldn\'t save your profile. Your information is still here.');
    } finally {
      setLoading(false);
    }
  }

  const reviewRows = [
    { label: 'Phone', value: form.phone },
    { label: 'Country', value: form.country },
    { label: 'City', value: form.city },
    { label: 'Institution', value: form.institution },
    { label: 'Department', value: form.department },
    { label: 'Academic Year', value: form.academicYear },
    { label: 'CGPA', value: form.cgpa },
    { label: 'Placement', value: form.placementPreference?.replace('_', ' ') },
    { label: 'Job Roles', value: form.preferredJobRoles.join(', ') },
    { label: 'Work Type', value: form.preferredWorkType?.replace('_', ' ') },
    { label: 'Skills', value: form.skills.map(s => `${s.skillName} (${s.proficiency})`).join(', ') },
    { label: 'Certifications', value: `${form.certifications.length} added` },
    { label: 'Projects', value: `${form.projects.length} added` },
    { label: 'About', value: form.aboutMe },
  ];

  return (
    <OnboardingLayout currentStep={step + 1} totalSteps={5}>
      <OnboardingProgress steps={STEPS} currentStepIndex={step} />

      {error && (
        <div style={{ padding: 'var(--space-md)', background: 'rgba(255, 92, 92, 0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-sm)', color: 'var(--color-error)', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'var(--space-sm)', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', textDecoration: 'underline' }}>Dismiss</button>
        </div>
      )}

      {step === 0 && (
        <>
          <FormSection title="Personal Information" subtitle="Tell us who you are.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
              <FormField id="phone" label="Phone Number" placeholder="+91 98765 43210" value={form.phone} onChange={v => update('phone', v)} required />
              <SelectField id="gender" label="Gender" value={form.gender} onChange={v => update('gender', v)} options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }, { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }]} placeholder="Optional" />
              <FormField id="country" label="Country" placeholder="India" value={form.country} onChange={v => update('country', v)} required />
              <FormField id="state" label="State" placeholder="Tamil Nadu" value={form.state} onChange={v => update('state', v)} />
              <FormField id="city" label="City" placeholder="Chennai" value={form.city} onChange={v => update('city', v)} />
              <FormField id="dob" label="Date of Birth" type="date" value={form.dateOfBirth} onChange={v => update('dateOfBirth', v)} />
            </div>
          </FormSection>
        </>
      )}

      {step === 1 && (
        <>
          <FormSection title="Academic Information" subtitle="Tell us about your education.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
              <FormField id="institution" label="Institution" placeholder="Your college/university" value={form.institution} onChange={v => update('institution', v)} required />
              <FormField id="regNumber" label="Registration / Roll Number" placeholder="e.g., 20CS001" value={form.registrationNumber} onChange={v => update('registrationNumber', v)} />
              <SelectField id="degree" label="Degree" value={form.degree} onChange={v => update('degree', v)} options={DEGREES.map(d => ({ value: d, label: d }))} placeholder="Select degree" />
              <SelectField id="department" label="Department" value={form.department} onChange={v => update('department', v)} options={DEPARTMENTS.map(d => ({ value: d, label: d }))} placeholder="Select department" />
              <SelectField id="academicYear" label="Academic Year" value={form.academicYear} onChange={v => update('academicYear', v)} options={ACADEMIC_YEARS.map(y => ({ value: y, label: y }))} placeholder="Select year" required />
              <FormField id="cgpa" label="CGPA" type="number" placeholder="0.00 — 10.00" value={form.cgpa} onChange={v => update('cgpa', v)} hint="Out of 10" />
            </div>
          </FormSection>
          <FormSection title="Placement Information" subtitle="This helps institutions and companies understand your preferences.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
              <SelectField id="placement" label="Placement Preference" value={form.placementPreference} onChange={v => update('placementPreference', v as StudentFormData['placementPreference'])} options={[{ value: 'PLACEMENT_WILLING', label: 'Willing for placement' }, { value: 'PLACEMENT_NOT_WILLING', label: 'Not willing for placement' }]} placeholder="Select preference" required />
            </div>
          </FormSection>
        </>
      )}

      {step === 2 && (
        <>
          <FormSection title="Career Preferences" subtitle="Tell Beyon where you want to go.">
            <MultiSelect id="jobRoles" label="Preferred Job Roles" options={JOB_ROLES} selected={form.preferredJobRoles} onChange={v => update('preferredJobRoles', v)} allowCustom />
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <MultiSelect id="industries" label="Preferred Industries" options={INDUSTRIES} selected={form.preferredIndustries} onChange={v => update('preferredIndustries', v)} allowCustom />
            </div>
            <div style={{ marginTop: 'var(--space-lg)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
              <SelectField id="workType" label="Preferred Work Type" value={form.preferredWorkType} onChange={v => update('preferredWorkType', v as StudentFormData['preferredWorkType'])} options={[{ value: 'ON_SITE', label: 'On-site' }, { value: 'HYBRID', label: 'Hybrid' }, { value: 'REMOTE', label: 'Remote' }, { value: 'ANY', label: 'Any' }]} placeholder="Select work type" />
            </div>
          </FormSection>
          <FormSection title="About You" subtitle="Write a brief summary for your profile.">
            <FormField id="aboutMe" label="About Me" as="textarea" placeholder="Tell us about yourself, your goals, and what you're looking for..." value={form.aboutMe} onChange={v => update('aboutMe', v)} />
          </FormSection>
        </>
      )}

      {step === 3 && (
        <>
          <FormSection title="Skills" subtitle="Add your current skills with self-reported proficiency.">
            <SkillSelector skills={form.skills} onChange={skills => update('skills', skills)} />
          </FormSection>
          <FormSection title="Certifications" subtitle="Add any certifications you hold.">
            {form.certifications.map((cert, i) => (
              <div key={i} style={{ padding: 'var(--space-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--color-text)', fontWeight: 'var(--font-medium)' }}>{cert.name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{cert.issuingOrg || 'No org specified'}</div>
                </div>
                <button type="button" onClick={() => update('certifications', form.certifications.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={() => update('certifications', [...form.certifications, { name: '', issuingOrg: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' }])} style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              + Add Certification
            </button>
          </FormSection>
          <FormSection title="Projects" subtitle="Showcase your projects.">
            {form.projects.map((proj, i) => (
              <div key={i} style={{ padding: 'var(--space-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--color-text)', fontWeight: 'var(--font-medium)' }}>{proj.name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{proj.technologies || 'No technologies'}</div>
                </div>
                <button type="button" onClick={() => update('projects', form.projects.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={() => update('projects', [...form.projects, { name: '', description: '', role: '', technologies: '', githubUrl: '', liveUrl: '', startDate: '', endDate: '' }])} style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              + Add Project
            </button>
          </FormSection>
          <FormSection title="Links" subtitle="Add your online profiles.">
            {form.links.map((link, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)', alignItems: 'center' }}>
                <input value={link.platform} onChange={e => { const updated = [...form.links]; updated[i] = { ...updated[i], platform: e.target.value }; update('links', updated); }} placeholder="Platform" style={{ width: '120px', padding: '8px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 'var(--text-sm)' }} />
                <input value={link.url} onChange={e => { const updated = [...form.links]; updated[i] = { ...updated[i], url: e.target.value }; update('links', updated); }} placeholder="URL" style={{ flex: 1, padding: '8px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 'var(--text-sm)' }} />
                <button type="button" onClick={() => update('links', form.links.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={() => update('links', [...form.links, { platform: '', url: '' }])} style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              + Add Link
            </button>
          </FormSection>
        </>
      )}

      {step === 4 && (
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
        onNext={step < 4 ? () => setStep(step + 1) : handleSubmit}
        nextLabel={step === 4 ? 'Create Profile' : 'Continue'}
        loading={loading}
        loadingLabel="Creating profile..."
      />
    </OnboardingLayout>
  );
}
