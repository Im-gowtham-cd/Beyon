import { useState, useEffect, useMemo } from 'react';
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
  Trash2,
  Copy,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import styles from '../../practice/pages/CreateQuestionPage.module.css';

interface ActiveInstitution {
  id: string;
  name: string;
  code?: string;
  city?: string;
  state?: string;
  grade?: string;
  departments?: string[];
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
  questionType: 'MCQ_SINGLE' | 'MCQ_MULTIPLE' | string;
  difficulty: string;
  explanation: string;
  options: OptionItem[];
}

const PRESET_5_SWE: CustomQuestion[] = [
  {
    id: 'swe-1',
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
    id: 'swe-2',
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
    id: 'swe-3',
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
    id: 'swe-4',
    title: 'Which of the following properties are essential characteristics of ACID database transactions? (Select all that apply)',
    description: 'Which of the following properties are essential characteristics of ACID database transactions?',
    questionType: 'MCQ_MULTIPLE',
    difficulty: 'MEDIUM',
    explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.',
    options: [
      { id: 'opt-1', optionText: 'Atomicity (all operations complete or none execute)', isCorrect: true },
      { id: 'opt-2', optionText: 'Isolation (concurrent transactions execute independently)', isCorrect: true },
      { id: 'opt-3', optionText: 'Durability (committed data survives system crashes)', isCorrect: true },
      { id: 'opt-4', optionText: 'Arbitrage (dynamic price adjustment across distributed nodes)', isCorrect: false },
    ],
  },
  {
    id: 'swe-5',
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

const PRESET_8_FULLSTACK: CustomQuestion[] = [
  ...PRESET_5_SWE,
  {
    id: 'fs-6',
    title: 'Which HTTP status codes indicate successful client requests in standard RFC 7231? (Select all that apply)',
    description: 'Which HTTP status codes indicate successful client requests?',
    questionType: 'MCQ_MULTIPLE',
    difficulty: 'EASY',
    explanation: '200 (OK), 201 (Created), and 204 (No Content) are 2xx Success status codes.',
    options: [
      { id: 'opt-1', optionText: '200 OK', isCorrect: true },
      { id: 'opt-2', optionText: '201 Created', isCorrect: true },
      { id: 'opt-3', optionText: '204 No Content', isCorrect: true },
      { id: 'opt-4', optionText: '304 Not Modified', isCorrect: false },
      { id: 'opt-5', optionText: '400 Bad Request', isCorrect: false },
    ],
  },
  {
    id: 'fs-7',
    title: 'In React, what hook is used to execute side effects after rendering without blocking the browser paint?',
    description: 'In React, what hook is used to execute side effects after rendering?',
    questionType: 'MCQ_SINGLE',
    difficulty: 'EASY',
    explanation: 'useEffect runs asynchronously after browser paint, whereas useLayoutEffect runs synchronously before paint.',
    options: [
      { id: 'opt-1', optionText: 'useEffect', isCorrect: true },
      { id: 'opt-2', optionText: 'useLayoutEffect', isCorrect: false },
      { id: 'opt-3', optionText: 'useMemo', isCorrect: false },
      { id: 'opt-4', optionText: 'useCallback', isCorrect: false },
    ],
  },
  {
    id: 'fs-8',
    title: 'In Redis caching strategies, which methods help mitigate Cache Stampede (Thundering Herd)? (Select all that apply)',
    description: 'In Redis caching strategies, which methods help mitigate Cache Stampede?',
    questionType: 'MCQ_MULTIPLE',
    difficulty: 'HARD',
    explanation: 'Distributed Mutex locking, Probabilistic early expiration (XFetch), and Background cache warming effectively mitigate thundering herd.',
    options: [
      { id: 'opt-1', optionText: 'Distributed Mutex Lock on key miss', isCorrect: true },
      { id: 'opt-2', optionText: 'Probabilistic Early Expiration (XFetch algorithm)', isCorrect: true },
      { id: 'opt-3', optionText: 'Setting TTL to 0 ms across all concurrent requests', isCorrect: false },
      { id: 'opt-4', optionText: 'Background asynchronous cache pre-warming cron', isCorrect: true },
    ],
  },
];

const PRESET_10_SYSTEM_DESIGN: CustomQuestion[] = [
  ...PRESET_8_FULLSTACK,
  {
    id: 'sd-9',
    title: 'In the CAP Theorem, which trade-off does Apache Cassandra traditionally optimize for during network partitions?',
    description: 'In the CAP Theorem, which trade-off does Apache Cassandra traditionally optimize for?',
    questionType: 'MCQ_SINGLE',
    difficulty: 'HARD',
    explanation: 'Cassandra is an AP system focusing on High Availability and Partition Tolerance with eventual consistency.',
    options: [
      { id: 'opt-1', optionText: 'AP (Availability and Partition Tolerance)', isCorrect: true },
      { id: 'opt-2', optionText: 'CP (Strict Consistency and Partition Tolerance)', isCorrect: false },
      { id: 'opt-3', optionText: 'CA without partition support', isCorrect: false },
      { id: 'opt-4', optionText: 'None of the above', isCorrect: false },
    ],
  },
  {
    id: 'sd-10',
    title: 'Which message brokers provide partitioned distributed commit log semantics for replayable stream processing? (Select all that apply)',
    description: 'Which message brokers provide partitioned distributed commit log semantics?',
    questionType: 'MCQ_MULTIPLE',
    difficulty: 'MEDIUM',
    explanation: 'Apache Kafka, Apache Pulsar, and Redpanda are distributed commit log event streaming architectures.',
    options: [
      { id: 'opt-1', optionText: 'Apache Kafka', isCorrect: true },
      { id: 'opt-2', optionText: 'Apache Pulsar', isCorrect: true },
      { id: 'opt-3', optionText: 'RabbitMQ (traditional AMQP broker)', isCorrect: false },
      { id: 'opt-4', optionText: 'Redpanda', isCorrect: true },
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

  const [questions, setQuestions] = useState<CustomQuestion[]>(PRESET_5_SWE);

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    'Computer Science and Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics and Communication Engineering',
  ]);
  const [customDeptInput, setCustomDeptInput] = useState('');
  const [customDepartments, setCustomDepartments] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    opportunityType: 'CAMPUS_DRIVE',
    location: '',
    remote: false,
    packageLpa: 12.0,
    minCgpa: 7.5,
    eligibleDepartments: 'Computer Science and Engineering, Information Technology, Artificial Intelligence & Data Science, Electronics and Communication Engineering',
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
            setSelectedInstIds(data.data.map((i: ActiveInstitution) => i.id));
          }
        }
      } catch {

      } finally {
        setLoadingInstitutions(false);
      }
    }
    loadActiveInstitutions();
  }, []);

  const availableDepartments = useMemo(() => {
    const targetInstitutions =
      form.opportunityType === 'CAMPUS_DRIVE' && selectedInstIds.length > 0
        ? activeInstitutions.filter((inst) => selectedInstIds.includes(inst.id))
        : activeInstitutions;

    const deptsSet = new Set<string>();

    targetInstitutions.forEach((inst) => {
      if (Array.isArray(inst.departments) && inst.departments.length > 0) {
        inst.departments.forEach((dept) => {
          if (dept && dept.trim()) {
            deptsSet.add(dept.trim());
          }
        });
      }
    });

    if (deptsSet.size === 0) {
      [
        'Computer Science and Engineering',
        'Information Technology',
        'Artificial Intelligence & Data Science',
        'Electronics and Communication Engineering',
        'Electrical and Electronics Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Cybersecurity & Digital Forensics',
        'Data Science & Business Systems',
        'Robotics & Automation',
      ].forEach((d) => deptsSet.add(d));
    }

    customDepartments.forEach((d) => deptsSet.add(d));
    return Array.from(deptsSet);
  }, [activeInstitutions, selectedInstIds, form.opportunityType, customDepartments]);

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments((prev) => {
      const next = prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept];
      setForm((f) => ({ ...f, eligibleDepartments: next.join(', ') }));
      return next;
    });
  };

  const selectAllDepartments = () => {
    setSelectedDepartments(availableDepartments);
    setForm((f) => ({ ...f, eligibleDepartments: availableDepartments.join(', ') }));
  };

  const deselectAllDepartments = () => {
    setSelectedDepartments([]);
    setForm((f) => ({ ...f, eligibleDepartments: '' }));
  };

  const selectCsItCircuitOnly = () => {
    const csBranches = availableDepartments.filter((d) =>
      /computer|information|ai|artificial|data|cyber|software|electronics/i.test(d)
    );
    setSelectedDepartments(csBranches);
    setForm((f) => ({ ...f, eligibleDepartments: csBranches.join(', ') }));
  };

  const handleAddCustomDepartment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customDeptInput.trim()) return;
    const newDept = customDeptInput.trim();
    if (!customDepartments.includes(newDept)) {
      setCustomDepartments((prev) => [...prev, newDept]);
    }
    if (!selectedDepartments.includes(newDept)) {
      const next = [...selectedDepartments, newDept];
      setSelectedDepartments(next);
      setForm((f) => ({ ...f, eligibleDepartments: next.join(', ') }));
    }
    setCustomDeptInput('');
  };

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
      id: `q-custom-${Date.now()}-${questions.length + 1}`,
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
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleDuplicateQuestion = (idx: number) => {
    const sourceQ = questions[idx];
    const duplicated: CustomQuestion = {
      ...sourceQ,
      id: `q-dup-${Date.now()}`,
      title: `${sourceQ.title} (Copy)`,
      options: sourceQ.options.map((opt, oIdx) => ({
        ...opt,
        id: `opt-dup-${Date.now()}-${oIdx}`,
      })),
    };
    const updated = [...questions];
    updated.splice(idx + 1, 0, duplicated);
    setQuestions(updated);
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

  const handleQuestionTypeChange = (qIdx: number, newType: string) => {
    const updated = [...questions];
    const q = { ...updated[qIdx], questionType: newType };
    if (newType === 'MCQ_SINGLE') {
      let found = false;
      q.options = q.options.map((opt) => {
        if (opt.isCorrect && !found) {
          found = true;
          return opt;
        }
        return { ...opt, isCorrect: false };
      });
      if (!found && q.options.length > 0) {
        q.options[0].isCorrect = true;
      }
    }
    updated[qIdx] = q;
    setQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...questions];
    const q = { ...updated[qIdx] };
    const nextNum = q.options.length + 1;
    q.options = [
      ...q.options,
      {
        id: `opt-${Date.now()}-${nextNum}`,
        optionText: '',
        isCorrect: false,
      },
    ];
    updated[qIdx] = q;
    setQuestions(updated);
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    const q = { ...updated[qIdx] };
    if (q.options.length <= 2) {
      setError('A multiple-choice question must have at least 2 options.');
      return;
    }
    const removedWasCorrect = q.options[optIdx].isCorrect;
    q.options = q.options.filter((_, i) => i !== optIdx);
    if (removedWasCorrect && !q.options.some((o) => o.isCorrect) && q.options.length > 0) {
      q.options[0].isCorrect = true;
    }
    updated[qIdx] = q;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    const q = { ...updated[qIdx] };
    const opts = [...q.options];
    opts[optIdx] = { ...opts[optIdx], optionText: text };
    q.options = opts;
    updated[qIdx] = q;
    setQuestions(updated);
  };

  const handleToggleCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    const q = { ...updated[qIdx] };
    if (q.questionType === 'MCQ_MULTIPLE') {
      q.options = q.options.map((opt, i) =>
        i === optIdx ? { ...opt, isCorrect: !opt.isCorrect } : opt
      );
    } else {
      q.options = q.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === optIdx,
      }));
    }
    updated[qIdx] = q;
    setQuestions(updated);
  };

  const handleLoadPreset = (preset: CustomQuestion[]) => {
    setQuestions(preset);
  };

  const handleClearAllQuestions = () => {
    setQuestions([
      {
        id: `q-blank-${Date.now()}`,
        title: '',
        description: '',
        questionType: 'MCQ_SINGLE',
        difficulty: 'MEDIUM',
        explanation: '',
        options: [
          { id: `opt-1`, optionText: '', isCorrect: true },
          { id: `opt-2`, optionText: '', isCorrect: false },
          { id: `opt-3`, optionText: '', isCorrect: false },
          { id: `opt-4`, optionText: '', isCorrect: false },
        ],
      },
    ]);
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
                setSelectedDepartments([
                  'Computer Science and Engineering',
                  'Information Technology',
                  'Artificial Intelligence & Data Science',
                  'Electronics and Communication Engineering',
                ]);
                setForm({
                  title: '',
                  description: '',
                  opportunityType: 'CAMPUS_DRIVE',
                  location: 'Chennai / Bangalore',
                  remote: false,
                  packageLpa: 12.0,
                  minCgpa: 8.0,
                  eligibleDepartments: 'Computer Science and Engineering, Information Technology, Artificial Intelligence & Data Science, Electronics and Communication Engineering',
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

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Annual Compensation / Package (LPA in ₹)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className={styles.input}
                placeholder="e.g. 14.5"
                value={form.packageLpa}
                onChange={(e) => setForm({ ...form, packageLpa: parseFloat(e.target.value) || 0 })}
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

        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <h3 className={styles.cardTitle}>2. Academic &amp; Batch Eligibility</h3>
              <p className={styles.cardSubtitle}>Automate candidate filtering by setting academic cutoffs and department criteria</p>
            </div>
          </div>

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
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={18} style={{ color: '#1c2d81' }} />
                  <label className={styles.label} style={{ marginBottom: 0, fontSize: '0.92rem', fontWeight: 700 }}>
                    Eligible Academic Departments
                  </label>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: selectedDepartments.length > 0 ? '#1c2d81' : '#64748b',
                      color: '#ffffff',
                      padding: '2px 8px',
                    }}
                  >
                    {selectedDepartments.length} Selected
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Select from departments available across your target partner institutions. Only candidates in selected branches can apply.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={selectAllDepartments}
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#1c2d81',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  Select All ({availableDepartments.length})
                </button>
                <button
                  type="button"
                  onClick={selectCsItCircuitOnly}
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#0f766e',
                    background: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  CS / IT &amp; AI Only
                </button>
                <button
                  type="button"
                  onClick={deselectAllDepartments}
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#b91c1c',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              {availableDepartments.map((dept) => {
                const isSelected = selectedDepartments.includes(dept);
                return (
                  <div
                    key={dept}
                    onClick={() => toggleDepartment(dept)}
                    style={{
                      padding: '8px 12px',
                      background: isSelected ? '#f0f4ff' : '#ffffff',
                      border: isSelected ? '1.5px solid #1c2d81' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.12s ease',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ color: isSelected ? '#1c2d81' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? '#0f172a' : '#475569',
                        lineHeight: 1.3,
                      }}
                    >
                      {dept}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '12px',
                flexWrap: 'wrap',
                background: '#f8fafc',
                padding: '10px 14px',
                border: '1px dashed #cbd5e1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 320px' }}>
                <input
                  type="text"
                  placeholder="Add custom / specialized department (e.g. Mechatronics, Bio-Informatics)..."
                  value={customDeptInput}
                  onChange={(e) => setCustomDeptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomDepartment();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomDepartment()}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    background: '#1c2d81',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Plus size={13} />
                  <span>Add Department</span>
                </button>
              </div>

              <div style={{ flex: '1 1 100%', fontSize: '0.74rem', color: '#64748b' }}>
                <strong>Saved Filter:</strong>{' '}
                <span style={{ color: '#0f172a' }}>
                  {form.eligibleDepartments || 'None selected (all departments will be restricted)'}
                </span>
              </div>
            </div>
          </div>
        </div>

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

        <div className={styles.card} style={{ borderLeft: '4px solid #fed601' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div>
              <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#1c2d81" /> 4. Proctored Drive Assessment &amp; Custom Questions
              </h3>
              <p className={styles.cardSubtitle}>
                Author as many custom questions as required. Support both Single-Choice (1 correct option) and Multiple-Choice (multiple correct options) formats with customizable option choices.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleLoadPreset(PRESET_5_SWE)}
                style={{
                  padding: '6px 10px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#1c2d81',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                5 Standard SWE
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset(PRESET_8_FULLSTACK)}
                style={{
                  padding: '6px 10px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#1c2d81',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                8 Full-Stack
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset(PRESET_10_SYSTEM_DESIGN)}
                style={{
                  padding: '6px 10px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#1c2d81',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                10 System Design
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
              <label className={styles.label}>Configured Question Count</label>
              <input
                type="text"
                disabled
                className={styles.input}
                style={{ background: '#f1f5f9', color: '#1c2d81', fontWeight: 700 }}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {questions.map((q, qIdx) => {
              const isMulti = q.questionType === 'MCQ_MULTIPLE';

              return (
                <div
                  key={q.id || qIdx}
                  style={{
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    position: 'relative',
                  }}
                >

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#1c2d81', color: '#fed601', padding: '3px 10px', fontSize: '0.8rem', fontWeight: 800 }}>
                        Question #{qIdx + 1}
                      </span>

                      <select
                        value={q.questionType}
                        onChange={(e) => handleQuestionTypeChange(qIdx, e.target.value)}
                        style={{
                          padding: '4px 10px',
                          border: '1.5px solid #1c2d81',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: isMulti ? '#fdf4ff' : '#eff6ff',
                          color: isMulti ? '#86198f' : '#1c2d81',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="MCQ_SINGLE">Single Choice (1 Correct Answer)</option>
                        <option value="MCQ_MULTIPLE">Multiple Choice (Multiple Correct Answers)</option>
                      </select>

                      <select
                        value={q.difficulty}
                        onChange={(e) => handleQuestionChange(qIdx, 'difficulty', e.target.value)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: '#f8fafc',
                          color: '#475569',
                        }}
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleDuplicateQuestion(qIdx)}
                        title="Duplicate Question"
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Copy size={12} /> Duplicate
                      </button>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          title="Remove this question"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={styles.label} style={{ marginBottom: '4px', display: 'block' }}>
                      Question Statement / Problem Prompt *
                    </label>
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

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <span>Answer Option Choices ({q.options.length})</span>
                        <span style={{ fontSize: '0.74rem', color: isMulti ? '#86198f' : '#166534', fontWeight: 600 }}>
                          {isMulti ? '— Check all options that are correct' : '— Select the radio button for the correct option'}
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#1c2d81',
                          cursor: 'pointer',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Plus size={12} /> Add Option
                      </button>
                    </div>

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
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isMulti ? (
                              <input
                                type="checkbox"
                                checked={opt.isCorrect}
                                onChange={() => handleToggleCorrectOption(qIdx, optIdx)}
                                style={{ cursor: 'pointer', accentColor: '#16a34a', width: '16px', height: '16px' }}
                                title="Check if this option is correct (Multiple Choice)"
                              />
                            ) : (
                              <input
                                type="radio"
                                name={`correct-opt-${qIdx}`}
                                checked={opt.isCorrect}
                                onChange={() => handleToggleCorrectOption(qIdx, optIdx)}
                                style={{ cursor: 'pointer', accentColor: '#16a34a', width: '16px', height: '16px' }}
                                title="Mark as the single correct option"
                              />
                            )}

                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                color: opt.isCorrect ? '#166534' : '#475569',
                                width: '20px',
                              }}
                            >
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

                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIdx, optIdx)}
                                title="Delete option"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#94a3b8',
                                  cursor: 'pointer',
                                  padding: '2px',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={styles.label} style={{ marginBottom: '4px', display: 'block' }}>
                      Explanation / Solution Rationale (Optional)
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Brief explanation of why the correct option(s) are right..."
                      value={q.explanation || ''}
                      onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleAddQuestion}
              style={{
                padding: '10px 24px',
                background: '#1c2d81',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Plus size={16} /> Add Another Question
            </button>
            <button
              type="button"
              onClick={handleClearAllQuestions}
              style={{
                padding: '10px 18px',
                background: '#ffffff',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              Reset to Blank Question
            </button>
          </div>
        </div>

        <div className={styles.formFooter}>
          <button type="submit" className={styles.btnPrimary} disabled={submitting}>
            <Send size={15} />
            <span>{submitting ? 'Publishing Drive & Assessment...' : 'Publish Campus Drive & Assessment'}</span>
          </button>
          <Link to="/company/opportunities" className={styles.btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

