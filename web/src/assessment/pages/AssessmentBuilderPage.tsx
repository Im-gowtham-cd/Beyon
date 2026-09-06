import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import {
  ArrowLeft,
  PlusCircle,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  Target,
  Coins,
  Brain,
  Users,
  Edit3,
  Trash2,
  Eye,
  Search,
} from 'lucide-react';
import styles from './AssessmentBuilderPage.module.css';

export function AssessmentBuilderPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [tab, setTab] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [questions, setQuestions] = useState<any[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [qForm, setQForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    difficulty: 'MEDIUM',
    score: 5,
    explanation: '',
  });
  const [savingQuestion, setSavingQuestion] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'SOFTWARE_ENGINEERING',
    durationMinutes: 60,
    totalQuestions: 25,
    passingScore: 65,
    coinCost: 250,
    adaptiveEnabled: true,
    lockdownProctoring: true,
    audioDetection: true,
    status: 'PUBLISHED',
  });

  const fetchAssessments = async () => {
    try {
      const data = await api.get<any[]>('/assessment-builder/assessments');
      if (Array.isArray(data)) {
        setAssessments(data);
      } else {
        setAssessments([]);
      }
    } catch {
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const data = await api.get<any[]>('/assessment-builder/questions');
      if (Array.isArray(data)) {
        setQuestions(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchAssessments();
    fetchQuestions();
  }, []);

  const handleStartNew = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      category: 'SOFTWARE_ENGINEERING',
      durationMinutes: 60,
      totalQuestions: 25,
      passingScore: 65,
      coinCost: 250,
      adaptiveEnabled: true,
      lockdownProctoring: true,
      audioDetection: true,
      status: 'PUBLISHED',
    });
    setView('form');
  };

  const handleConfigure = (a: any) => {
    setEditingId(a.id);
    setForm({
      title: a.title || '',
      description: a.description || '',
      category: a.category || 'SOFTWARE_ENGINEERING',
      durationMinutes: a.durationMinutes || 60,
      totalQuestions: a.totalQuestions || 25,
      passingScore: a.passingScore || 65,
      coinCost: a.coinCost || 0,
      adaptiveEnabled: a.adaptiveEnabled ?? true,
      lockdownProctoring: a.lockdownProctoring ?? true,
      audioDetection: a.audioDetection ?? true,
      status: a.status || 'PUBLISHED',
    });
    setView('form');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await api.patch<any>(`/assessment-builder/assessments/${editingId}`, form).catch(() => ({
          id: editingId,
          ...form,
        }));
        setAssessments(assessments.map(a => a.id === editingId ? { ...a, ...updated, ...form } : a));
      } else {
        const newAssessment = await api.post('/assessment-builder/assessments', form).catch(() => ({
          id: `ab-custom-${Date.now()}`,
          ...form,
          candidatesEvaluated: 0,
        }));
        setAssessments([newAssessment, ...assessments]);
      }

      setEditingId(null);
      setView('list');
    } catch {

    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQForm({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      difficulty: 'MEDIUM',
      score: 5,
      explanation: '',
    });
    setShowQuestionModal(true);
  };

  const parseOptionsFromQuestion = (q: any) => {
    if (!q.options) return [];
    try {
      if (Array.isArray(q.options)) return q.options;
      const parsed = JSON.parse(q.options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestionId(q.id);
    const opts = parseOptionsFromQuestion(q);
    const optA = opts.find((o: any) => o.id === 'A' || o.id === '1')?.text || opts[0]?.text || '';
    const optB = opts.find((o: any) => o.id === 'B' || o.id === '2')?.text || opts[1]?.text || '';
    const optC = opts.find((o: any) => o.id === 'C' || o.id === '3')?.text || opts[2]?.text || '';
    const optD = opts.find((o: any) => o.id === 'D' || o.id === '4')?.text || opts[3]?.text || '';

    setQForm({
      questionText: q.questionText || '',
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctAnswer: q.correctAnswer || 'A',
      difficulty: q.difficulty || 'MEDIUM',
      score: q.score ? Number(q.score) : 5,
      explanation: q.explanation || '',
    });
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!window.confirm('Are you sure you want to delete this question from the test bank?')) return;
    try {
      await api.delete(`/assessment-builder/questions/${qId}`).catch(() => {});
      setQuestions(prev => prev.filter(q => q.id !== qId));
    } catch (e) {
      console.error('Error deleting question:', e);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qForm.questionText.trim()) return;
    setSavingQuestion(true);
    try {
      const optionsArray = [
        { id: 'A', text: qForm.optionA },
        { id: 'B', text: qForm.optionB },
        { id: 'C', text: qForm.optionC },
        { id: 'D', text: qForm.optionD },
      ];
      const payload = {
        questionType: 'MULTIPLE_CHOICE',
        difficulty: qForm.difficulty,
        questionText: qForm.questionText,
        options: JSON.stringify(optionsArray),
        correctAnswer: qForm.correctAnswer,
        explanation: qForm.explanation,
        score: qForm.score,
      };

      if (editingQuestionId) {
        const updated = await api.patch<any>(`/assessment-builder/questions/${editingQuestionId}`, payload);
        setQuestions(prev => prev.map(q => q.id === editingQuestionId ? { ...q, ...updated, ...payload } : q));
      } else {
        const created = await api.post<any>('/assessment-builder/questions', payload);
        setQuestions([created, ...questions]);
      }
      setShowQuestionModal(false);
      setEditingQuestionId(null);
      setQForm({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        difficulty: 'MEDIUM',
        score: 5,
        explanation: '',
      });
    } catch (e) {
      console.error('Error saving question:', e);
    } finally {
      setSavingQuestion(false);
    }
  };

  const publish = async (id: string) => {
    try {
      await api.post(`/assessment-builder/assessments/${id}/publish`).catch(() => {});
      setAssessments(assessments.map(a => a.id === id ? { ...a, status: 'PUBLISHED' } : a));
    } catch {}
  };

  const filtered = assessments.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (tab === 'ALL') return true;
    return a.status === tab;
  });

  const totalPublished = assessments.filter(a => a.status === 'PUBLISHED').length;

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>
            {view === 'form' ? (editingId ? 'Configure Assessment' : 'Create Custom Assessment') : 'Custom Assessment Builder'}
          </h1>
          <p className={styles.subtitle}>
            Author proctored technical benchmark tests, configure adaptive AI scoring, and link assessments to campus drives
          </p>
        </div>
        <button
          className={view === 'form' ? styles.btnSecondary : styles.btnPrimary}
          onClick={() => {
            if (view === 'form') {
              setView('list');
              setEditingId(null);
            } else {
              handleStartNew();
            }
          }}
        >
          {view === 'form' ? <ArrowLeft size={15} /> : <PlusCircle size={15} />}
          <span>{view === 'form' ? 'Back to Assessments' : 'Build New Assessment'}</span>
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Assessments</span>
          <span className={styles.statValue}>{assessments.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Published Tests</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>{totalPublished}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Questions in Bank</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {questions.length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Proctoring Integrity</span>
          <span className={styles.statValue} style={{ color: '#854d0e' }}>
            {assessments.length > 0 ? '100%' : '0.0%'}
          </span>
        </div>
      </div>

      {view === 'form' && (
        <form onSubmit={handleCreate} className={styles.formCard}>
          <h2 className={styles.sectionHeading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} style={{ color: '#1c2d81' }} />
            <span>1. Assessment Parameters &amp; Details {editingId ? '(Editing)' : ''}</span>
          </h2>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Assessment Title *</label>
              <input
                className={styles.input}
                placeholder="e.g. 2026 Batch Campus Recruitment Technical Benchmark"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Domain / Specialization</label>
              <select
                className={styles.select}
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="SOFTWARE_ENGINEERING">Software Engineering &amp; DSA</option>
                <option value="AI_AND_SYSTEMS">AI, CUDA &amp; Machine Learning</option>
                <option value="CLOUD_DEVOPS">Cloud DevOps &amp; Kubernetes</option>
                <option value="CYBER_SECURITY">Cyber Security &amp; Networks</option>
                <option value="DATA_ENGINEERING">Data Engineering &amp; SQL</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Test Duration (Minutes)</label>
              <input
                className={styles.input}
                type="number"
                min="15"
                max="180"
                value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Total Question Count</label>
              <input
                className={styles.input}
                type="number"
                min="5"
                max="100"
                value={form.totalQuestions}
                onChange={e => setForm({ ...form, totalQuestions: Number(e.target.value) })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Passing Cutoff (%)</label>
              <input
                className={styles.input}
                type="number"
                min="30"
                max="100"
                value={form.passingScore}
                onChange={e => setForm({ ...form, passingScore: Number(e.target.value) })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Beyon Coins Entry Cost</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                value={form.coinCost}
                onChange={e => setForm({ ...form, coinCost: Number(e.target.value) })}
              />
            </div>

            <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Assessment Description &amp; Candidate Instructions</label>
              <textarea
                className={styles.textarea}
                placeholder="Detail the topics covered, proctoring requirements, and scoring rubrics..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <h2 className={styles.sectionHeading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: '#1c2d81' }} />
            <span>2. Proctoring &amp; AI Adaptive Rules</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <label className={styles.checkboxCard}>
              <input
                type="checkbox"
                checked={form.lockdownProctoring}
                onChange={e => setForm({ ...form, lockdownProctoring: e.target.checked })}
              />
              <div>
                <h4 className={styles.checkboxTitle}>Lockdown Client Browser &amp; Full Screen</h4>
                <p className={styles.checkboxDesc}>Prevents tab switching, copy-pasting, and secondary monitor usage.</p>
              </div>
            </label>

            <label className={styles.checkboxCard}>
              <input
                type="checkbox"
                checked={form.audioDetection}
                onChange={e => setForm({ ...form, audioDetection: e.target.checked })}
              />
              <div>
                <h4 className={styles.checkboxTitle}>Webcam Eye-Gaze &amp; Audio Telemetry</h4>
                <p className={styles.checkboxDesc}>Automated integrity flagging for multi-person and anomaly presence.</p>
              </div>
            </label>

            <label className={styles.checkboxCard}>
              <input
                type="checkbox"
                checked={form.adaptiveEnabled}
                onChange={e => setForm({ ...form, adaptiveEnabled: e.target.checked })}
              />
              <div>
                <h4 className={styles.checkboxTitle}>AI Adaptive Difficulty Scaling</h4>
                <p className={styles.checkboxDesc}>Dynamically adjusts question complexity based on candidate answers.</p>
              </div>
            </label>
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={18} style={{ color: '#1c2d81' }} />
                  <span>3. Assessment Question Bank Pool ({questions.length} Questions)</span>
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Author and manage custom technical questions. All configured questions will be included in the test pool.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddQuestion}
                style={{
                  padding: '8px 16px',
                  background: '#1c2d81',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(28, 45, 129, 0.2)',
                }}
              >
                <PlusCircle size={15} /> Add New Question
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setQuestionDifficultyFilter(diff)}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      background: questionDifficultyFilter === diff ? '#1c2d81' : '#f8fafc',
                      color: questionDifficultyFilter === diff ? '#ffffff' : '#64748b',
                      border: `1px solid ${questionDifficultyFilter === diff ? '#1c2d81' : '#cbd5e1'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '280px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Filter questions by keyword..."
                  value={questionSearch}
                  onChange={e => setQuestionSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    fontSize: '0.8rem',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {showQuestionModal && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '2px solid #1c2d81',
                  padding: '20px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                    {editingQuestionId ? '✏️ Edit Question in Bank' : '➕ Author New Question'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionModal(false);
                      setEditingQuestionId(null);
                    }}
                    style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#64748b' }}
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className={styles.label}>Question Text / Problem Statement *</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Enter the complete question or problem statement..."
                    value={qForm.questionText}
                    onChange={e => setQForm({ ...qForm, questionText: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className={styles.label}>Option A * {qForm.correctAnswer === 'A' && <span style={{ color: '#15803d', fontWeight: 700 }}>(Correct Answer)</span>}</label>
                    <input
                      className={styles.input}
                      placeholder="Enter text for Option A"
                      value={qForm.optionA}
                      onChange={e => setQForm({ ...qForm, optionA: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Option B * {qForm.correctAnswer === 'B' && <span style={{ color: '#15803d', fontWeight: 700 }}>(Correct Answer)</span>}</label>
                    <input
                      className={styles.input}
                      placeholder="Enter text for Option B"
                      value={qForm.optionB}
                      onChange={e => setQForm({ ...qForm, optionB: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Option C {qForm.correctAnswer === 'C' && <span style={{ color: '#15803d', fontWeight: 700 }}>(Correct Answer)</span>}</label>
                    <input
                      className={styles.input}
                      placeholder="Enter text for Option C"
                      value={qForm.optionC}
                      onChange={e => setQForm({ ...qForm, optionC: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Option D {qForm.correctAnswer === 'D' && <span style={{ color: '#15803d', fontWeight: 700 }}>(Correct Answer)</span>}</label>
                    <input
                      className={styles.input}
                      placeholder="Enter text for Option D"
                      value={qForm.optionD}
                      onChange={e => setQForm({ ...qForm, optionD: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  <div>
                    <label className={styles.label}>Correct Option Key *</label>
                    <select
                      className={styles.select}
                      value={qForm.correctAnswer}
                      onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value })}
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Difficulty Level</label>
                    <select
                      className={styles.select}
                      value={qForm.difficulty}
                      onChange={e => setQForm({ ...qForm, difficulty: e.target.value })}
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Score Points</label>
                    <input
                      className={styles.input}
                      type="number"
                      min="1"
                      value={qForm.score}
                      onChange={e => setQForm({ ...qForm, score: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className={styles.label}>Answer Explanation / Solution Rationale (Optional)</label>
                  <input
                    className={styles.input}
                    placeholder="Provide explanatory context for candidate review or audit..."
                    value={qForm.explanation}
                    onChange={e => setQForm({ ...qForm, explanation: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => {
                      setShowQuestionModal(false);
                      setEditingQuestionId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={handleSaveQuestion}
                    disabled={savingQuestion || !qForm.questionText.trim()}
                  >
                    {savingQuestion
                      ? 'Saving...'
                      : (editingQuestionId ? 'Update Question' : 'Save Question to Bank')}
                  </button>
                </div>
              </div>
            )}

            {(() => {
              const filteredQuestions = questions.filter(q => {
                const matchesDiff = questionDifficultyFilter === 'ALL' || q.difficulty === questionDifficultyFilter;
                const matchesSearch = !questionSearch ||
                  q.questionText.toLowerCase().includes(questionSearch.toLowerCase()) ||
                  (q.explanation && q.explanation.toLowerCase().includes(questionSearch.toLowerCase()));
                return matchesDiff && matchesSearch;
              });

              if (filteredQuestions.length === 0) {
                return (
                  <div style={{ padding: '24px', background: '#f8fafc', border: '1px dashed #cbd5e1', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                    {questions.length === 0
                      ? 'No questions added to the bank yet. Click "Add New Question" above to start authoring.'
                      : 'No questions match the current filter or search criteria.'}
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredQuestions.map((q: any, idx: number) => {
                    const isExpanded = expandedQuestionId === q.id;
                    const opts = parseOptionsFromQuestion(q);
                    return (
                      <div
                        key={q.id || idx}
                        style={{
                          background: '#ffffff',
                          border: `1px solid ${isExpanded ? '#bfdbfe' : '#e2e8f0'}`,
                          borderLeft: `4px solid ${q.difficulty === 'HARD' ? '#dc2626' : q.difficulty === 'EASY' ? '#16a34a' : '#1c2d81'}`,
                          padding: '12px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flex: 1 }}>
                            <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#1c2d81', minWidth: '24px' }}>
                              #{idx + 1}
                            </span>
                            <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.4 }}>
                              {q.questionText}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '2px 7px',
                                fontWeight: 700,
                                background: q.difficulty === 'HARD' ? '#fef2f2' : q.difficulty === 'EASY' ? '#f0fdf4' : '#eff6ff',
                                color: q.difficulty === 'HARD' ? '#dc2626' : q.difficulty === 'EASY' ? '#15803d' : '#1c2d81',
                                border: `1px solid ${q.difficulty === 'HARD' ? '#fca5a5' : q.difficulty === 'EASY' ? '#86efac' : '#bfdbfe'}`,
                              }}
                            >
                              {q.difficulty || 'MEDIUM'}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700 }}>
                              {q.score || 5} pts
                            </span>

                            <button
                              type="button"
                              onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                              title="Toggle Options Preview"
                              style={{
                                padding: '4px 8px',
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                color: '#475569',
                              }}
                            >
                              <Eye size={12} />
                              <span>{isExpanded ? 'Hide' : 'Options'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditQuestion(q)}
                              title="Edit Question"
                              style={{
                                padding: '4px 8px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                color: '#1c2d81',
                                fontWeight: 700,
                              }}
                            >
                              <Edit3 size={12} />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              title="Delete Question"
                              style={{
                                padding: '4px 8px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                color: '#dc2626',
                                fontWeight: 700,
                              }}
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ marginTop: '6px', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                              Answer Options (Correct: Option {q.correctAnswer}):
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                              {opts.map((opt: any, oIdx: number) => {
                                const optKey = opt.id || String.fromCharCode(65 + oIdx);
                                const isCorrect = optKey === q.correctAnswer;
                                return (
                                  <div
                                    key={oIdx}
                                    style={{
                                      padding: '6px 10px',
                                      fontSize: '0.78rem',
                                      background: isCorrect ? '#f0fdf4' : '#ffffff',
                                      border: `1px solid ${isCorrect ? '#86efac' : '#e2e8f0'}`,
                                      color: isCorrect ? '#15803d' : '#334155',
                                      fontWeight: isCorrect ? 700 : 400,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                    }}
                                  >
                                    <span style={{ fontWeight: 800 }}>({optKey})</span>
                                    <span>{opt.text || opt}</span>
                                    {isCorrect && <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>✓ Correct</span>}
                                  </div>
                                );
                              })}
                            </div>
                            {q.explanation && (
                              <div style={{ fontSize: '0.76rem', color: '#475569', fontStyle: 'italic', marginTop: '4px' }}>
                                Explanation: {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          <div className={styles.formFooter}>
            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              <CheckCircle2 size={16} />
              <span>
                {submitting
                  ? (editingId ? 'Saving Changes...' : 'Creating Assessment...')
                  : (editingId ? 'Save Assessment Configuration' : 'Create & Publish Assessment')}
              </span>
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setView('list');
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {view === 'list' && (
        <>
          <div className={styles.filterRow}>
            <div className={styles.filters}>
              {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((t) => (
                <button
                  key={t}
                  className={`${styles.filterChip} ${tab === t ? styles.filterActive : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t === 'ALL' ? 'All Assessments' : t === 'PUBLISHED' ? 'Active Published' : 'Drafts'}
                </button>
              ))}
            </div>

            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '220px', background: '#f1f5f9', border: '1px solid #e2e8f0' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No matching assessments found. Click &quot;Build New Assessment&quot; to create one.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map(a => (
                <div className={styles.card} key={a.id}>
                  <div>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{a.title}</h3>
                      <span className={`${styles.statusBadge} ${a.status === 'PUBLISHED' ? styles.statusPublished : styles.statusDraft}`}>
                        {a.status}
                      </span>
                    </div>

                    {a.description && <p className={styles.cardDesc}>{a.description}</p>}

                    <div className={styles.cardMeta}>
                      <span className={styles.metaItem}>
                        <Clock size={13} style={{ color: '#0284c7' }} />
                        <span>{a.durationMinutes} mins</span>
                      </span>
                      <span className={styles.metaItem}>
                        <HelpCircle size={13} style={{ color: '#1c2d81' }} />
                        <span>{a.totalQuestions} Questions</span>
                      </span>
                      <span className={styles.metaItem}>
                        <Target size={13} style={{ color: '#15803d' }} />
                        <span>{a.passingScore}% to pass</span>
                      </span>
                      {a.coinCost > 0 ? (
                        <span className={styles.metaItem} style={{ color: '#854d0e', background: '#fef9c3', borderColor: '#fde047' }}>
                          <Coins size={13} style={{ color: '#eab308' }} />
                          <span>{a.coinCost} Coins</span>
                        </span>
                      ) : (
                        <span className={styles.metaItem} style={{ color: '#15803d', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                          <Coins size={13} />
                          <span>Free Entry</span>
                        </span>
                      )}
                      {a.adaptiveEnabled && (
                        <span className={styles.metaItem} style={{ color: '#7c3aed', background: '#f3e8ff', borderColor: '#ddd6fe' }}>
                          <Brain size={13} />
                          <span>AI Adaptive</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardFoot}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} /> {a.candidatesEvaluated || 0} Evaluated
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {a.status === 'DRAFT' && (
                        <button className={styles.publishBtn} onClick={() => publish(a.id)}>
                          Publish Test
                        </button>
                      )}
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleConfigure(a)}
                      >
                        <Edit3 size={13} />
                        <span>Configure</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

