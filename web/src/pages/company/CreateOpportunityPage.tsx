import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api/client';
import {
  ArrowLeft,
  Plus,
  List,
  AlertCircle,
  Send,
  Check,
  Building2,
  CheckSquare,
  Square,
} from 'lucide-react';
import styles from '../../practice/pages/CreateQuestionPage.module.css';

interface ActiveInstitution {
  id: string;
  name: string;
  code?: string;
  city?: string;
  state?: string;
  grade?: string;
}

interface OptionItem {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

interface CustomQuestion {
  id: string;
  title: string;
  description: string;
  questionType: string;
  difficulty: string;
  explanation: string;
  options: OptionItem[];
}

const SAMPLE_QUESTIONS: CustomQuestion[] = [
  {
    id: 'sample-1',
    title: 'Which data structure guarantees O(1) average lookup time in concurrent hash-based lookups?',
    description: 'Which data structure guarantees O(1) average lookup time in concurrent hash-based lookups?',
    questionType: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    explanation: 'ConcurrentHashMap utilizes lock striping and CAS primitives to achieve O(1) concurrent performance.',
    options: [
      { id: 'opt-1', optionText: 'ConcurrentHashMap', isCorrect: true },
      { id: 'opt-2', optionText: 'Binary Search Tree', isCorrect: false },
      { id: 'opt-3', optionText: 'Singly Linked List', isCorrect: false },
      { id: 'opt-4', optionText: 'AVL Tree with global lock', isCorrect: false },
    ],
  },
  {
    id: 'sample-2',
    title: 'In RESTful architectural design, which HTTP method is idempotent and used to replace a target resource?',
    description: 'In RESTful architectural design, which HTTP method is idempotent and used to replace a target resource?',
    questionType: 'MCQ_SINGLE',
    difficulty: 'EASY',
    explanation: 'PUT replaces all current representations of the target resource and is strictly idempotent.',
    options: [
      { id: 'opt-1', optionText: 'POST', isCorrect: false },
      { id: 'opt-2', optionText: 'PUT', isCorrect: true },
      { id: 'opt-3', optionText: 'PATCH', isCorrect: false },
      { id: 'opt-4', optionText: 'CONNECT', isCorrect: false },
    ],
  },
  {
    id: 'sample-3',
    title: 'What is the worst-case time complexity of QuickSort when using naive pivot selection on already sorted data?',
    description: 'What is the worst-case time complexity of QuickSort when using naive pivot selection on already sorted data?',
    questionType: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    explanation: 'Naive pivot selection on already sorted data degrades QuickSort partitions into O(N^2).',
    options: [
      { id: 'opt-1', optionText: 'O(N log N)', isCorrect: false },
      { id: 'opt-2', optionText: 'O(N^2)', isCorrect: true },
      { id: 'opt-3', optionText: 'O(N)', isCorrect: false },
      { id: 'opt-4', optionText: 'O(log N)', isCorrect: false },
    ],
  },
  {
    id: 'sample-4',
    title: 'In database ACID transactions, which property ensures uncommitted changes from one transaction are invisible to others?',
    description: 'In database ACID transactions, which property ensures uncommitted changes from one transaction are invisible to others?',
    questionType: 'MCQ_SINGLE',
    difficulty: 'MEDIUM',
    explanation: 'Isolation guarantees that concurrent transactions execute without cross-contamination before committing.',
    options: [
      { id: 'opt-1', optionText: 'Atomicity', isCorrect: false },
      { id: 'opt-2', optionText: 'Consistency', isCorrect: false },
      { id: 'opt-3', optionText: 'Isolation', isCorrect: true },
      { id: 'opt-4', optionText: 'Durability', isCorrect: false },
    ],
  },
  {
    id: 'sample-5',
    title: 'Which Spring Boot annotation is used to create a global exception handling component for REST controllers?',
    description: 'Which Spring Boot annotation is used to create a global exception handling component for REST controllers?',
    questionType: 'MCQ_SINGLE',
    difficulty: 'EASY',
    explanation: '@RestControllerAdvice combines @ControllerAdvice and @ResponseBody for clean REST exception handling.',
    options: [
      { id: 'opt-1', optionText: '@RestControllerAdvice', isCorrect: true },
      { id: 'opt-2', optionText: '@ExceptionHandlerAdvice', isCorrect: false },
      { id: 'opt-3', optionText: '@GlobalService', isCorrect: false },
      { id: 'opt-4', optionText: '@ResponseStatusHandler', isCorrect: false },
    ],
  },
];

export function CreateOpportunityPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeInstitutions, setActiveInstitutions] = useState<ActiveInstitution[]>([]);
  const [selectedInstIds, setSelectedInstIds] = useState<string[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  const [assessmentConfig, setAssessmentConfig] = useState({
    durationMinutes: 60,
    passingScore: 65,
    proctoredDualCamera: true,
    adaptiveEnabled: false,
  });

  const [questions, setQuestions] = useState<CustomQuestion[]>(SAMPLE_QUESTIONS);

  const [form, setForm] = useState({
    title: '',
    description: '',
    opportunityType: 'CAMPUS_DRIVE',
    location: '',
    remote: false,
    minCgpa: 7.5,
    eligibleDepartments: 'Computer Science, Information Technology, AI & Data Science, Electronics',
    eligibleGraduationYears: '2026, 2027',
    requiredSkills: '',
    preferredSkills: '',
    minBeyonCoins: 0,
    status: 'PUBLISHED',
  });

  useEffect(() => {
    async function loadActiveInstitutions() {
      setLoadingInstitutions(true);
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const res = await fetch('/api/v1/opportunities/active-institutions', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            setActiveInstitutions(data.data);
            // Default select all active institutions
            setSelectedInstIds(data.data.map((i: ActiveInstitution) => i.id));
          }
        }
      } catch {
        /* fallback */
      } finally {
        setLoadingInstitutions(false);
      }
    }
    loadActiveInstitutions();
  }, []);

  const toggleInstitution = (id: string) => {
    setSelectedInstIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllInstitutions = () => {
    if (selectedInstIds.length === activeInstitutions.length) {
      setSelectedInstIds([]);
    } else {
      setSelectedInstIds(activeInstitutions.map((i) => i.id));
    }
  };

  const handleAddQuestion = () => {
    const newQ: CustomQuestion = {
      id: `q-custom-${Date.now()}`,
      title: '',
      description: '',
      questionType: 'MCQ_SINGLE',
      difficulty: 'MEDIUM',
      explanation: '',
      options: [
        { id: `opt-${Date.now()}-1`, optionText: '', isCorrect: true },
        { id: `opt-${Date.now()}-2`, optionText: '', isCorrect: false },
        { id: `opt-${Date.now()}-3`, optionText: '', isCorrect: false },
        { id: `opt-${Date.now()}-4`, optionText: '', isCorrect: false },
      ],
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      setError('An assessment must have at least one question.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof CustomQuestion, value: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    const opts = [...updated[qIdx].options];
    opts[optIdx] = { ...opts[optIdx], optionText: text };
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setQuestions(updated);
  };

  const handleSetCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    const opts = updated[qIdx].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIdx,
    }));
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setQuestions(updated);
  };

  const handleLoadSampleQuestions = () => {
    setQuestions(SAMPLE_QUESTIONS);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Job / Placement drive title is required.');
      return;
    }

    if (form.opportunityType === 'CAMPUS_DRIVE' && activeInstitutions.length > 0 && selectedInstIds.length === 0) {
      setError('Please select at least one verified partner institution for this campus drive.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.title.trim()) {
        setError(`Question #${i + 1} statement is empty. Please enter question text.`);
        return;
      }
      const hasCorrect = q.options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        setError(`Question #${i + 1} does not have a correct answer selected.`);
        return;
      }
      const hasEmptyOpt = q.options.some((o) => !o.optionText.trim());
      if (hasEmptyOpt) {
        setError(`Question #${i + 1} has blank option choices. Please fill all options.`);
        return;
      }
    }

    const selectedNames = activeInstitutions
      .filter((i) => selectedInstIds.includes(i.id))
      .map((i) => i.name)
      .join(', ');

    const payload = {
      ...form,
      durationMinutes: assessmentConfig.durationMinutes,
      passingScore: assessmentConfig.passingScore,
      totalQuestions: questions.length,
      adaptiveEnabled: assessmentConfig.adaptiveEnabled,
      questions: questions.map((q) => ({
        title: q.title,
        description: q.description || q.title,
        questionType: q.questionType,
        difficulty: q.difficulty,
        explanation: q.explanation,
        options: q.options.map((opt, oIdx) => ({
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          displayOrder: oIdx + 1,
        })),
      })),
      targetInstitutionIds: form.opportunityType === 'CAMPUS_DRIVE' ? selectedInstIds.join(',') : '',
      targetInstitutionNames: form.opportunityType === 'CAMPUS_DRIVE' ? selectedNames : '',
    };

    setSubmitting(true);
    setError(null);
    try {
      try {
        await api.post('/opportunities', payload);
      } catch (clientErr: any) {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const res = await fetch('/api/v1/opportunities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || clientErr.message || 'Failed to create opportunity.');
        }
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error publishing placement drive.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <Check size={28} />
          </div>
          <h2 className={styles.successTitle}>Placement Drive Published Successfully</h2>
          <p className={styles.successDesc}>
            Your opportunity is now live and visible to 100+ verified candidates across partner institutions.
          </p>
          <div className={styles.successActions}>
            <button
              className={styles.btnPrimary}
              onClick={() => {
                setSuccess(false);
                setForm({
                  title: '',
                  description: '',
                  opportunityType: 'CAMPUS_DRIVE',
                  location: 'Chennai / Bangalore',
                  remote: false,
                  minCgpa: 8.0,
                  eligibleDepartments: 'CSE, IT, ECE, AI & DS',
                  eligibleGraduationYears: '2026, 2027',
                  requiredSkills: '',
                  preferredSkills: '',
                  minBeyonCoins: 100,
                  status: 'PUBLISHED',
                });
              }}
            >
              <Plus size={15} />
              <span>Post Another Drive</span>
            </button>
            <Link to="/company/opportunities" className={styles.btnSecondary}>
              <List size={15} />
              <span>View All Postings</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <Link to="/company/opportunities" className={styles.backLink}>
            <ArrowLeft size={15} />
            <span>Back to Drives</span>
          </Link>
          <h1 className={styles.pageTitle}>Post New Campus Placement Drive / Job</h1>
          <p className={styles.pageSubtitle}>
            Configure eligibility criteria, minimum academic CGPA, and required competency matrix for candidates
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.formLayout}>
        {/* Core Opportunity Details */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>1. Role &amp; Drive Overview</h3>
          <p className={styles.cardSubtitle}>Specify the job role, posting type, and work arrangement</p>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Drive / Role Title *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 2026 Batch Campus Recruitment Drive - Software Engineer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Opportunity Type</label>
              <select
                className={styles.select}
                value={form.opportunityType}
                onChange={(e) => setForm({ ...form, opportunityType: e.target.value })}
              >
                <option value="CAMPUS_DRIVE">Campus Placement Drive</option>
                <option value="FULL_TIME">Full-Time Career Opportunity</option>
                <option value="INTERNSHIP">Industrial Internship</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Location / Work Base</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Chennai, Bangalore, Hyderabad"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Role Description &amp; Scope</label>
              <textarea
                className={styles.textarea}
                placeholder="Describe key responsibilities, technical stack, interview process, and compensation structure..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Campus Drive: Target Verified Partner Institutions */}
        {form.opportunityType === 'CAMPUS_DRIVE' && (
          <div className={styles.card} style={{ borderLeft: '4px solid #1c2d81' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} style={{ color: '#1c2d81' }} />
                  <span>Target Verified Partner Institutions *</span>
                </h3>
                <p className={styles.cardSubtitle}>
                  Select verified partner universities and colleges where this campus recruitment drive will be published
                </p>
              </div>
              {activeInstitutions.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAllInstitutions}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#1c2d81',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '4px 10px',
                    cursor: 'pointer',
                  }}
                >
                  {selectedInstIds.length === activeInstitutions.length ? 'Deselect All' : 'Select All Active'}
                </button>
              )}
            </div>

            {loadingInstitutions ? (
              <div style={{ padding: '16px', color: '#64748b', fontSize: '0.84rem' }}>
                Loading verified institutions...
              </div>
            ) : activeInstitutions.length === 0 ? (
              <div
                style={{
                  padding: '16px 20px',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.84rem',
                }}
              >
                No verified partner institutions available yet. Campus placement drives can only be targeted to institutions verified and approved by the Super Admin.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px', marginTop: '12px' }}>
                {activeInstitutions.map((inst) => {
                  const isChecked = selectedInstIds.includes(inst.id);
                  return (
                    <div
                      key={inst.id}
                      onClick={() => toggleInstitution(inst.id)}
                      style={{
                        padding: '10px 14px',
                        background: isChecked ? '#f0f4ff' : '#ffffff',
                        border: isChecked ? '1px solid #1c2d81' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ color: isChecked ? '#1c2d81' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
                        {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inst.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                          {inst.city ? `${inst.city}, ${inst.state || ''}` : 'Verified Partner'}
                          {inst.grade ? ` · NAAC ${inst.grade}` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Candidate Eligibility Criteria */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>2. Academic &amp; Batch Eligibility</h3>
          <p className={styles.cardSubtitle}>Automate candidate filtering by setting academic cutoffs</p>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Minimum CGPA Cutoff</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                className={styles.input}
                value={form.minCgpa}
                onChange={(e) => setForm({ ...form, minCgpa: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Beyon Coins Application Cost</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                value={form.minBeyonCoins}
                onChange={(e) => setForm({ ...form, minBeyonCoins: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Eligible Graduation Batches</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 2026, 2027"
                value={form.eligibleGraduationYears}
                onChange={(e) => setForm({ ...form, eligibleGraduationYears: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Eligible Departments</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. CSE, IT, ECE, AI & DS"
                value={form.eligibleDepartments}
                onChange={(e) => setForm({ ...form, eligibleDepartments: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Skill Matrix */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>3. Required Technical Skills</h3>
          <p className={styles.cardSubtitle}>Specify skills verified against platform benchmark assessments</p>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Required Core Skills (comma separated)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Java, Spring Boot, MySQL, Data Structures"
                value={form.requiredSkills}
                onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Preferred Nice-to-Have Skills (comma separated)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. AWS, Docker, Kubernetes, GraphQL"
                value={form.preferredSkills}
                onChange={(e) => setForm({ ...form, preferredSkills: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 4. Proctored Drive Assessment & Custom Question Authoring */}
        <div className={styles.card} style={{ borderLeft: '4px solid #fed601' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
            <div>
              <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                4. Proctored Drive Assessment &amp; Custom Questions
              </h3>
              <p className={styles.cardSubtitle}>
                Author your custom technical questions for this drive. Candidates taking the proctored exam will be served and evaluated on these exact questions.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleLoadSampleQuestions}
                style={{
                  padding: '6px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#1c2d81',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Load 5 Standard SWE Questions
              </button>
              <button
                type="button"
                onClick={handleAddQuestion}
                style={{
                  padding: '6px 14px',
                  background: '#1c2d81',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={14} /> Add Question
              </button>
            </div>
          </div>

          {/* Assessment Global Parameters */}
          <div className={styles.formGrid} style={{ background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Assessment Duration (Minutes)</label>
              <input
                type="number"
                min="10"
                max="240"
                className={styles.input}
                value={assessmentConfig.durationMinutes}
                onChange={(e) => setAssessmentConfig({ ...assessmentConfig, durationMinutes: parseInt(e.target.value) || 60 })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Passing Score Percentage (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                className={styles.input}
                value={assessmentConfig.passingScore}
                onChange={(e) => setAssessmentConfig({ ...assessmentConfig, passingScore: parseInt(e.target.value) || 65 })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Total Questions to Answer</label>
              <input
                type="text"
                disabled
                className={styles.input}
                style={{ background: '#f1f5f9', color: '#64748b' }}
                value={`${questions.length} Questions Configured`}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Proctoring Protocol</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '42px', fontSize: '0.82rem', fontWeight: 700, color: '#15803d' }}>
                <Check size={16} color="#15803d" />
                <span>Dual-Camera AI Proctoring (Desktop + Mobile)</span>
              </div>
            </div>
          </div>

          {/* Interactive List of Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                style={{
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: '#1c2d81', color: '#fed601', padding: '2px 8px', fontSize: '0.78rem', fontWeight: 800 }}>
                      Question #{qIdx + 1}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                      Single Choice MCQ
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      value={q.difficulty}
                      onChange={(e) => handleQuestionChange(qIdx, 'difficulty', e.target.value)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: '#f8fafc',
                      }}
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Statement */}
                <div>
                  <label className={styles.label} style={{ marginBottom: '4px', display: 'block' }}>Question Statement</label>
                  <textarea
                    rows={2}
                    className={styles.input}
                    placeholder="Enter the question statement / problem text..."
                    value={q.title}
                    onChange={(e) => handleQuestionChange(qIdx, 'title', e.target.value)}
                    style={{ width: '100%', resize: 'vertical' }}
                    required
                  />
                </div>

                {/* Question Options */}
                <div>
                  <label className={styles.label} style={{ marginBottom: '6px', display: 'block' }}>
                    Answer Options (Select the radio button next to the correct answer)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      return (
                        <div
                          key={opt.id || optIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: opt.isCorrect ? '#f0fdf4' : '#f8fafc',
                            border: opt.isCorrect ? '1.5px solid #22c55e' : '1px solid #e2e8f0',
                            padding: '6px 10px',
                          }}
                        >
                          <input
                            type="radio"
                            name={`correct-opt-${qIdx}`}
                            checked={opt.isCorrect}
                            onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                            style={{ cursor: 'pointer', accentColor: '#16a34a' }}
                            title="Mark as correct option"
                          />
                          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: opt.isCorrect ? '#166534' : '#475569' }}>
                            {letter}.
                          </span>
                          <input
                            type="text"
                            value={opt.optionText}
                            onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${letter} text...`}
                            style={{
                              flex: 1,
                              border: 'none',
                              background: 'transparent',
                              fontSize: '0.82rem',
                              outline: 'none',
                              color: '#0f172a',
                            }}
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className={styles.label} style={{ marginBottom: '4px', display: 'block' }}>Explanation / Solution Key (Optional)</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Brief explanation of why the correct option is right..."
                    value={q.explanation || ''}
                    onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className={styles.formFooter}>
          <button type="submit" className={styles.btnPrimary} disabled={submitting}>
            <Send size={15} />
            <span>{submitting ? 'Publishing Drive...' : 'Publish Campus Drive'}</span>
          </button>
          <Link to="/company/opportunities" className={styles.btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
