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
  { label: 'Portfolio' },
  { label: 'Review' },
];

const JOB_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'AI / ML Engineer',
  'Cloud / DevOps Engineer',
  'Cybersecurity Analyst',
  'UI/UX Designer',
  'System Architect',
];

const INDUSTRIES = [
  'Artificial Intelligence',
  'FinTech & Banking',
  'HealthTech',
  'SaaS & Cloud Computing',
  'E-commerce & Retail',
  'Autonomous Systems & Robotics',
  'Cybersecurity',
  'Consulting & Services',
];

const DEGREES = ['B.E', 'B.Tech', 'B.Sc', 'M.E', 'M.Tech', 'MCA', 'BCA', 'M.Sc', 'MBA'];

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other',
];

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated / Alumni'];

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
      setError("We couldn't save your profile right now. Your data has been preserved, please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingLayout currentStep={step + 1} totalSteps={5}>
      <OnboardingProgress steps={STEPS} currentStepIndex={step} />

      {error && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', marginBottom: '20px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step 0: Personal Information */}
      {step === 0 && (
        <>
          <FormSection
            title="1. Personal Information"
            subtitle="Let companies and verified institutions know who you are."
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <FormField
                id="phone"
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={v => update('phone', v)}
                required
              />
              <SelectField
                id="gender"
                label="Gender"
                value={form.gender}
                onChange={v => update('gender', v)}
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
                ]}
                placeholder="Select Gender"
              />
              <FormField
                id="country"
                label="Country"
                placeholder="India"
                value={form.country}
                onChange={v => update('country', v)}
                required
              />
              <FormField
                id="state"
                label="State / Province"
                placeholder="Tamil Nadu"
                value={form.state}
                onChange={v => update('state', v)}
              />
              <FormField
                id="city"
                label="City"
                placeholder="Chennai"
                value={form.city}
                onChange={v => update('city', v)}
              />
              <FormField
                id="dob"
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={v => update('dateOfBirth', v)}
              />
            </div>
          </FormSection>
        </>
      )}

      {/* Step 1: Academic Information */}
      {step === 1 && (
        <>
          <FormSection
            title="2. Academic Credentials"
            subtitle="Enter your current educational enrollment details and performance."
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <FormField
                id="institution"
                label="Institution / University"
                placeholder="e.g. PSG College of Technology"
                value={form.institution}
                onChange={v => update('institution', v)}
                required
              />
              <FormField
                id="regNumber"
                label="Registration / Roll Number"
                placeholder="e.g. 21CS102"
                value={form.registrationNumber}
                onChange={v => update('registrationNumber', v)}
              />
              <SelectField
                id="degree"
                label="Degree Program"
                value={form.degree}
                onChange={v => update('degree', v)}
                options={DEGREES.map(d => ({ value: d, label: d }))}
                placeholder="Select Degree"
              />
              <SelectField
                id="department"
                label="Major / Department"
                value={form.department}
                onChange={v => update('department', v)}
                options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
                placeholder="Select Department"
              />
              <SelectField
                id="academicYear"
                label="Current Academic Year"
                value={form.academicYear}
                onChange={v => update('academicYear', v)}
                options={ACADEMIC_YEARS.map(y => ({ value: y, label: y }))}
                placeholder="Select Academic Year"
                required
              />
              <FormField
                id="cgpa"
                label="Cumulative CGPA"
                type="number"
                placeholder="e.g. 8.75"
                value={form.cgpa}
                onChange={v => update('cgpa', v)}
                hint="Score scale out of 10.0"
              />
            </div>
          </FormSection>

          <FormSection
            title="Placement & Campus Recruitment"
            subtitle="Indicate your willingness for on-campus and enterprise placement drives."
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <SelectField
                id="placement"
                label="Placement Status"
                value={form.placementPreference}
                onChange={v => update('placementPreference', v as StudentFormData['placementPreference'])}
                options={[
                  { value: 'PLACEMENT_WILLING', label: 'Actively seeking placements & internships' },
                  { value: 'PLACEMENT_NOT_WILLING', label: 'Higher studies / Not seeking campus placement' },
                ]}
                placeholder="Select Placement Preference"
                required
              />
            </div>
          </FormSection>
        </>
      )}

      {/* Step 2: Career Preferences & Bio */}
      {step === 2 && (
        <>
          <FormSection
            title="3. Career Objectives"
            subtitle="Select the technical domains and work types you want to be matched with."
          >
            <MultiSelect
              id="jobRoles"
              label="Target Job Roles"
              options={JOB_ROLES}
              selected={form.preferredJobRoles}
              onChange={v => update('preferredJobRoles', v)}
              allowCustom
            />

            <div style={{ marginTop: '20px' }}>
              <MultiSelect
                id="industries"
                label="Preferred Target Industries"
                options={INDUSTRIES}
                selected={form.preferredIndustries}
                onChange={v => update('preferredIndustries', v)}
                allowCustom
              />
            </div>

            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <SelectField
                id="workType"
                label="Preferred Work Mode"
                value={form.preferredWorkType}
                onChange={v => update('preferredWorkType', v as StudentFormData['preferredWorkType'])}
                options={[
                  { value: 'ANY', label: 'Open to All (Remote, Hybrid, On-site)' },
                  { value: 'ON_SITE', label: 'On-site Office' },
                  { value: 'HYBRID', label: 'Hybrid' },
                  { value: 'REMOTE', label: 'Remote / Telecommute' },
                ]}
                placeholder="Select Work Type"
              />
            </div>
          </FormSection>

          <FormSection
            title="Professional Summary"
            subtitle="A brief introduction highlighting your technical strengths and ambitions."
          >
            <FormField
              id="aboutMe"
              label="About Me (Bio)"
              as="textarea"
              placeholder="e.g. Enthusiastic Computer Science student passionate about distributed systems, cloud architecture, and competitive programming. Looking for software engineering opportunities..."
              value={form.aboutMe}
              onChange={v => update('aboutMe', v)}
            />
          </FormSection>
        </>
      )}

      {/* Step 3: Skills, Projects, Certs & Links */}
      {step === 3 && (
        <>
          <FormSection
            title="4. Technical Skills"
            subtitle="Add the programming languages, frameworks, and tools you specialize in."
          >
            <SkillSelector skills={form.skills} onChange={skills => update('skills', skills)} />
          </FormSection>

          {/* Certifications */}
          <FormSection
            title="Certifications & Accreditations"
            subtitle="Add industry certifications (AWS, Google Cloud, Microsoft, Cisco, etc.)."
          >
            {form.certifications.map((cert, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 18px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>
                    {cert.name || 'Untitled Certification'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    {cert.issuingOrg || 'No organization specified'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update('certifications', form.certifications.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  <i className="bx bx-trash" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                update('certifications', [
                  ...form.certifications,
                  { name: 'AWS Certified Solutions Architect', issuingOrg: 'Amazon Web Services', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' },
                ])
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                color: '#1c2d81',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 700,
              }}
            >
              + Add Certification
            </button>
          </FormSection>

          {/* Projects */}
          <FormSection
            title="Key Engineering Projects"
            subtitle="Highlight full-stack, systems, or data projects you've built."
          >
            {form.projects.map((proj, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 18px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>
                    {proj.name || 'Untitled Project'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    Tech Stack: {proj.technologies || 'React, Node.js, PostgreSQL'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update('projects', form.projects.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  <i className="bx bx-trash" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                update('projects', [
                  ...form.projects,
                  { name: 'Distributed Caching Engine', description: 'Built an in-memory key-value cache using Go and Raft consensus.', role: 'Lead Developer', technologies: 'Go, Docker, gRPC', githubUrl: 'https://github.com', liveUrl: '', startDate: '', endDate: '' },
                ])
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                color: '#1c2d81',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 700,
              }}
            >
              + Add Project
            </button>
          </FormSection>

          {/* Links */}
          <FormSection
            title="Online Profiles & Repositories"
            subtitle="Add links to GitHub, LinkedIn, Portfolio, and competitive coding handles."
          >
            {form.links.map((link, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input
                  value={link.platform}
                  onChange={e => {
                    const updated = [...form.links];
                    updated[i] = { ...updated[i], platform: e.target.value };
                    update('links', updated);
                  }}
                  placeholder="Platform (e.g. GitHub)"
                  style={{
                    width: '140px',
                    padding: '8px 12px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#0f172a',
                    fontSize: '0.84rem',
                  }}
                />
                <input
                  value={link.url}
                  onChange={e => {
                    const updated = [...form.links];
                    updated[i] = { ...updated[i], url: e.target.value };
                    update('links', updated);
                  }}
                  placeholder="https://github.com/username"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#0f172a',
                    fontSize: '0.84rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => update('links', form.links.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  <i className="bx bx-trash" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => update('links', [...form.links, { platform: 'GitHub', url: 'https://github.com/' }])}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                color: '#1c2d81',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 700,
                marginTop: '6px',
              }}
            >
              + Add Link
            </button>
          </FormSection>
        </>
      )}

      {/* Step 4: Review & Confirmation */}
      {step === 4 && (
        <FormSection
          title="5. Review & Confirm Profile"
          subtitle="Please verify all your details before activating your verified scholar account."
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Card 1: Personal */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, color: '#1c2d81', fontSize: '0.84rem', textTransform: 'uppercase' }}>👤 Personal</span>
                <button type="button" onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: '#1c2d81', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Phone:</strong> {form.phone || '—'}</div>
                <div><strong>Location:</strong> {[form.city, form.state, form.country].filter(Boolean).join(', ') || '—'}</div>
                <div><strong>Gender:</strong> {form.gender || '—'}</div>
              </div>
            </div>

            {/* Card 2: Academic */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, color: '#1c2d81', fontSize: '0.84rem', textTransform: 'uppercase' }}>🎓 Academic</span>
                <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#1c2d81', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>College:</strong> {form.institution || '—'}</div>
                <div><strong>Department:</strong> {form.department || '—'}</div>
                <div><strong>Degree & Year:</strong> {form.degree} ({form.academicYear})</div>
                <div><strong>CGPA:</strong> {form.cgpa ? `${form.cgpa} / 10.0` : '—'}</div>
              </div>
            </div>

            {/* Card 3: Career */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, color: '#1c2d81', fontSize: '0.84rem', textTransform: 'uppercase' }}>💼 Career Goals</span>
                <button type="button" onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#1c2d81', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Roles:</strong> {form.preferredJobRoles.join(', ') || 'Any'}</div>
                <div><strong>Work Mode:</strong> {form.preferredWorkType?.replace('_', ' ') || 'Any'}</div>
                <div><strong>Placement Status:</strong> {form.placementPreference === 'PLACEMENT_WILLING' ? 'Actively Seeking' : 'Not Seeking'}</div>
              </div>
            </div>

            {/* Card 4: Skills & Portfolio */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, color: '#1c2d81', fontSize: '0.84rem', textTransform: 'uppercase' }}>⚡ Skills & Portfolio</span>
                <button type="button" onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: '#1c2d81', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Skills:</strong> {form.skills.map(s => s.skillName).join(', ') || 'None listed'}</div>
                <div><strong>Projects:</strong> {form.projects.length} added</div>
                <div><strong>Certifications:</strong> {form.certifications.length} added</div>
                <div><strong>Links:</strong> {form.links.length} added</div>
              </div>
            </div>
          </div>
        </FormSection>
      )}

      <StepNavigation
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={step < 4 ? () => setStep(step + 1) : handleSubmit}
        nextLabel={step === 4 ? '🚀 Complete & Activate Profile' : 'Continue →'}
        loading={loading}
        loadingLabel="Creating Profile..."
      />
    </OnboardingLayout>
  );
}
