import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, CheckCircle2, RefreshCw, Eye, X, Code, Check, Plus,
  Edit2, Trash2, AlertTriangle, AlertCircle, Sparkles, Filter, Layers,
  ChevronDown
} from 'lucide-react';
import styles from './AdminHome.module.css';
import { JsonQuestionExtractorModal } from './JsonQuestionExtractorModal';

interface QuestionItem {
  id: string;
  title: string;
  description: string;
  questionType: string;
  difficulty: string;
  explanation?: string;
  codeTemplate?: string;
  expectedOutput?: string;
  tags?: string;
  status?: string;
  skillId?: string;
}

interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  correct: boolean;
  displayOrder: number;
  explanation?: string;
}

interface SkillMeta {
  id: string;
  name: string;
  category?: string;
  slug?: string;
}

export function AdminQuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSkillId = searchParams.get('skillId') || 'ALL';
  const urlSearch = searchParams.get('search') || '';

  const [skills, setSkills] = useState<SkillMeta[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>(urlSkillId);
  const [search, setSearch] = useState(urlSearch);
  const [difficulty, setDifficulty] = useState('ALL');

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommending, setRecommending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [questionToDelete, setQuestionToDelete] = useState<QuestionItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [recommendLevelMenuOpen, setRecommendLevelMenuOpen] = useState(false);
  const [showExtractorModal, setShowExtractorModal] = useState(false);

  // Fetch taxonomy skills for dropdown and mapping labels
  useEffect(() => {
    async function loadTaxonomySkills() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const res = await fetch('/api/v1/taxonomy/skills', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          setSkills(list);
        }
      } catch {
        // Silently handle
      }
    }
    loadTaxonomySkills();
  }, []);

  const skillsMap = useMemo(() => {
    const map = new Map<string, SkillMeta>();
    for (const s of skills) {
      map.set(s.id, s);
    }
    return map;
  }, [skills]);

  const activeSkillMeta = useMemo(() => {
    if (!selectedSkillId || selectedSkillId === 'ALL') return null;
    return skillsMap.get(selectedSkillId) || skills.find((s) => s.id === selectedSkillId) || null;
  }, [selectedSkillId, skillsMap, skills]);

  // Fetch questions from backend with skill and search scoping
  const fetchQuestions = useCallback(async (targetSkillId?: string, targetSearch?: string) => {
    setLoading(true);
    try {
      const activeSkill = targetSkillId !== undefined ? targetSkillId : selectedSkillId;
      const activeSearch = targetSearch !== undefined ? targetSearch : search;
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');

      const params = new URLSearchParams();
      params.set('size', '500');
      if (activeSkill && activeSkill !== 'ALL') {
        params.set('skillId', activeSkill);
      }
      if (activeSearch && activeSearch.trim()) {
        params.set('search', activeSearch.trim());
      }

      const res = await fetch(`/api/v1/questions?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.data || []);
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSkillId, search]);

  // Sync state when URL search params change
  useEffect(() => {
    const pSkillId = searchParams.get('skillId') || 'ALL';
    let pSearch = searchParams.get('search') || '';
    if (pSkillId !== 'ALL') {
      const targetSkill = skillsMap.get(pSkillId) || skills.find((s) => s.id === pSkillId);
      if (targetSkill && pSearch.trim().toLowerCase() === targetSkill.name.toLowerCase()) {
        pSearch = '';
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('search');
        setSearchParams(nextParams, { replace: true });
      }
    }
    setSelectedSkillId(pSkillId);
    setSearch(pSearch);
    fetchQuestions(pSkillId, pSearch);
  }, [searchParams, fetchQuestions, skillsMap, skills]);

  const handleSelectSkill = (newSkillId: string) => {
    setSelectedSkillId(newSkillId);
    setSearch('');
    const nextParams = new URLSearchParams();
    if (newSkillId && newSkillId !== 'ALL') nextParams.set('skillId', newSkillId);
    setSearchParams(nextParams);
    fetchQuestions(newSkillId, '');
  };

  const handleClearSkillFilter = () => {
    setSelectedSkillId('ALL');
    const nextParams = new URLSearchParams();
    if (search.trim()) nextParams.set('search', search.trim());
    setSearchParams(nextParams);
    fetchQuestions('ALL', search.trim());
  };

  const openQuestionAudit = async (q: QuestionItem) => {
    setSelectedQuestion(q);
    setOptions([]);
    setLoadingOptions(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/questions/${q.id}/options`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setOptions(data.data || []);
      }
    } catch {
      setOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleAction = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 5000);
  };

  const handleRecommendSkillQuestions = async (targetSkillId?: string, targetLevel: string = 'ALL') => {
    const skId = targetSkillId || selectedSkillId;
    if (!skId || skId === 'ALL') {
      handleAction('Please select a specific skill from the dropdown to recommend targeted questions.');
      return;
    }
    const targetSkill = skillsMap.get(skId) || skills.find((s) => s.id === skId);
    const skillName = targetSkill ? targetSkill.name : 'Selected Skill';

    setRecommending(true);
    setRecommendLevelMenuOpen(false);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/questions/recommend-for-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          skillId: skId,
          skillName: skillName,
          level: targetLevel,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to recommend questions for skill');
      }
      const data = await res.json();
      const count = (data.data && Array.isArray(data.data)) ? data.data.length : 0;
      if (count === 0) {
        handleAction(`All authentic ${targetLevel === 'ALL' ? 'Level 1-3' : targetLevel} questions for ${skillName} are already in your bank!`);
      } else {
        handleAction(`Successfully recommended & seeded ${count} authentic ${targetLevel === 'ALL' ? 'Level-by-Level' : targetLevel} questions for ${skillName}!`);
      }
      await fetchQuestions(skId, search);
    } catch (err: any) {
      handleAction(err.message || 'Error generating questions. Please try again.');
    } finally {
      setRecommending(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/questions/${questionToDelete.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete question');
      }
      setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id));
      if (selectedQuestion?.id === questionToDelete.id) {
        setSelectedQuestion(null);
      }
      handleAction(`Question "${questionToDelete.title}" was permanently deleted from the database.`);
      setQuestionToDelete(null);
    } catch (err: any) {
      handleAction(err.message || 'Error deleting question. Please check permissions and try again.');
    } finally {
      setDeleting(false);
    }
  };

  const scopedQuestions = useMemo(() => {
    const s = search.toLowerCase().trim();
    return questions.filter((q) => {
      const matchesSkill = selectedSkillId === 'ALL' || q.skillId === selectedSkillId;
      const text = `${q.title || ''} ${q.description || ''} ${q.codeTemplate || ''} ${q.tags || ''}`.toLowerCase();
      const matchesSearch = !s || text.includes(s);
      return matchesSkill && matchesSearch;
    });
  }, [questions, selectedSkillId, search]);

  const filtered = useMemo(() => {
    return scopedQuestions.filter((q) => difficulty === 'ALL' || q.difficulty === difficulty);
  }, [scopedQuestions, difficulty]);

  const allCount = scopedQuestions.length;
  const beginnerCount = scopedQuestions.filter((q) => q.difficulty === 'BEGINNER').length;
  const easyCount = scopedQuestions.filter((q) => q.difficulty === 'EASY').length;
  const mediumCount = scopedQuestions.filter((q) => q.difficulty === 'MEDIUM').length;
  const hardCount = scopedQuestions.filter((q) => q.difficulty === 'HARD').length;
  const advancedCount = scopedQuestions.filter((q) => q.difficulty === 'ADVANCED').length;
  const expertCount = scopedQuestions.filter((q) => q.difficulty === 'EXPERT').length;

  const getDifficultyMeta = (diff?: string) => {
    const d = (diff || '').toUpperCase();
    switch (d) {
      case 'BEGINNER':
        return { label: 'Level 1 • Beginner', dot: '#0ea5e9', bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' };
      case 'EASY':
        return { label: 'Level 2 • Easy', dot: '#10b981', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' };
      case 'MEDIUM':
        return { label: 'Level 3 • Medium', dot: '#f59e0b', bg: '#fffbeb', text: '#92400e', border: '#fde68a' };
      case 'HARD':
        return { label: 'Level 4 • Hard', dot: '#f43f5e', bg: '#fff1f2', text: '#be123c', border: '#fecdd3' };
      case 'ADVANCED':
        return { label: 'Level 5 • Advanced', dot: '#8b5cf6', bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' };
      case 'EXPERT':
        return { label: 'Level 6 • Expert', dot: '#6366f1', bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' };
      default:
        return { label: d || 'Standard', dot: '#64748b', bg: '#f8fafc', text: '#475569', border: '#cbd5e1' };
    }
  };

  const getOptionLetter = (idx: number) => String.fromCharCode(65 + idx);

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Technical Question Bank &amp; Taxonomy ({allCount} Questions)
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Curate verified Single Choice MCQs, Multi-Select questions, coding challenges, and syllabus-aligned benchmarks.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeSkillMeta && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setRecommendLevelMenuOpen((prev) => !prev)}
                disabled={recommending}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#fed601',
                  color: '#1c2d81',
                  border: '1px solid #fed601',
                  padding: '8px 16px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: recommending ? 'not-allowed' : 'pointer',
                }}
              >
                <Sparkles size={15} className={recommending ? 'spin' : ''} />
                <span>{recommending ? 'Generating...' : `Recommend ${activeSkillMeta.name} Questions`}</span>
                <ChevronDown size={14} />
              </button>

              {recommendLevelMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                  zIndex: 100,
                  minWidth: '260px',
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    Select Proficiency Level
                  </div>
                  <button
                    onClick={() => handleRecommendSkillQuestions(activeSkillMeta.id, 'ALL')}
                    style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Layers size={14} color="#1c2d81" />
                    <span>All Levels (Balanced 6 Tiers)</span>
                  </button>
                  <button
                    onClick={() => handleRecommendSkillQuestions(activeSkillMeta.id, 'BEGINNER')}
                    style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#0369a1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f9ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ea5e9' }} />
                    <span>Level 1: Beginner (Syntax &amp; Fundamentals)</span>
                  </button>
                  <button
                    onClick={() => handleRecommendSkillQuestions(activeSkillMeta.id, 'EASY')}
                    style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#065f46', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#ecfdf5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                    <span>Level 2: Easy (APIs &amp; Core Idioms)</span>
                  </button>
                  <button
                    onClick={() => handleRecommendSkillQuestions(activeSkillMeta.id, 'MEDIUM')}
                    style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#92400e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fffbeb')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                    <span>Level 3: Medium (Patterns &amp; State Control)</span>
                  </button>
                  <button
                    onClick={() => handleRecommendSkillQuestions(activeSkillMeta.id, 'HARD')}
                    style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#be123c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fff1f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
                    <span>Level 4: Hard (Edge Cases &amp; Memory)</span>
                  </button>
                  <button
                    onClick={() => handleRecommendSkillQuestions(activeSkillMeta.id, 'ADVANCED')}
                    style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#6d28d9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f3ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} />
                    <span>Level 5: Advanced (Architecture &amp; Internals)</span>
                  </button>
                  <button
                    onClick={() => handleRecommendSkillQuestions(activeSkillMeta.id, 'EXPERT')}
                    style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#4338ca', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#eef2ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
                    <span>Level 6: Expert (Kernel &amp; High-Throughput)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => fetchQuestions()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Bank</span>
          </button>

          <Link
            to={selectedSkillId !== 'ALL' ? `/admin/questions/create?skillId=${selectedSkillId}` : '/admin/questions/create'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#1c2d81',
              color: '#fed601',
              border: '1px solid #1c2d81',
              padding: '8px 18px',
              fontSize: '0.84rem',
              fontWeight: 800,
              textDecoration: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={15} />
            <span>Post / Create Question</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowExtractorModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              color: '#92400e',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={15} color="#b45309" />
            <span>AI JSON Extractor</span>
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 600, fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      {/* Active Skill Focus Banner with Level Breakdown */}
      {activeSkillMeta && (
        <div style={{
          background: 'linear-gradient(135deg, #1c2d81 0%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '6px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 14px rgba(28, 45, 129, 0.16)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              background: 'rgba(254, 214, 1, 0.2)',
              border: '1.5px solid #fed601',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fed601',
              fontWeight: 900,
              fontSize: '1.25rem',
            }}>
              {activeSkillMeta.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fed601' }}>
                  Active Skill Focus
                </span>
                {activeSkillMeta.category && (
                  <span style={{ fontSize: '0.7rem', padding: '1px 7px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px', color: '#e2e8f0', fontWeight: 600 }}>
                    {activeSkillMeta.category}
                  </span>
                )}
              </div>
              <h2 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                {activeSkillMeta.name} — Technical Curriculum ({allCount} Questions Active)
              </h2>

              {/* Level-by-Level Distribution Badges */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', padding: '2px 7px', background: 'rgba(14, 165, 233, 0.25)', border: '1px solid rgba(14, 165, 233, 0.6)', color: '#bae6fd', borderRadius: '3px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0ea5e9' }} />
                  Beginner: {beginnerCount}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 7px', background: 'rgba(16, 185, 129, 0.25)', border: '1px solid rgba(16, 185, 129, 0.6)', color: '#a7f3d0', borderRadius: '3px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Easy: {easyCount}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 7px', background: 'rgba(245, 158, 11, 0.25)', border: '1px solid rgba(245, 158, 11, 0.6)', color: '#fde68a', borderRadius: '3px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                  Medium: {mediumCount}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 7px', background: 'rgba(244, 63, 94, 0.25)', border: '1px solid rgba(244, 63, 94, 0.6)', color: '#fecdd3', borderRadius: '3px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e' }} />
                  Hard: {hardCount}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 7px', background: 'rgba(139, 92, 246, 0.25)', border: '1px solid rgba(139, 92, 246, 0.6)', color: '#ddd6fe', borderRadius: '3px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6' }} />
                  Advanced: {advancedCount}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 7px', background: 'rgba(99, 102, 241, 0.25)', border: '1px solid rgba(99, 102, 241, 0.6)', color: '#c7d2fe', borderRadius: '3px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} />
                  Expert: {expertCount}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => handleRecommendSkillQuestions(activeSkillMeta.id, 'ALL')}
              disabled={recommending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fed601',
                color: '#1c2d81',
                border: 'none',
                padding: '8px 16px',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: recommending ? 'not-allowed' : 'pointer',
                borderRadius: '3px',
              }}
            >
              <Sparkles size={15} className={recommending ? 'spin' : ''} />
              <span>{recommending ? 'Generating...' : 'Recommend Level Questions'}</span>
            </button>

            <Link
              to={`/admin/questions/create?skillId=${activeSkillMeta.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                borderRadius: '3px',
              }}
            >
              <Plus size={14} />
              <span>Post for {activeSkillMeta.name}</span>
            </Link>

            <button
              onClick={handleClearSkillFilter}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'transparent',
                color: '#cbd5e1',
                border: 'none',
                padding: '8px 10px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              <X size={14} />
              <span>Clear Filter</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by prompt, code snippet, or technical concept..."
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              const nextParams = new URLSearchParams();
              if (selectedSkillId && selectedSkillId !== 'ALL') nextParams.set('skillId', selectedSkillId);
              if (val.trim()) nextParams.set('search', val.trim());
              setSearchParams(nextParams);
            }}
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
          />
        </div>

        {/* Skill Taxonomy Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={15} style={{ color: '#64748b' }} />
          <select
            value={selectedSkillId}
            onChange={(e) => handleSelectSkill(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff', fontWeight: 600, minWidth: '220px', color: '#1e293b' }}
          >
            <option value="ALL">All Skills ({skills.length} Available)</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.category ? `(${s.category})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Proficiency Level-by-Level Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Proficiency Level:
        </span>
        {[
          { id: 'ALL', label: 'All Levels', count: allCount },
          { id: 'BEGINNER', label: 'Level 1 • Beginner', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', count: beginnerCount },
          { id: 'EASY', label: 'Level 2 • Easy', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', count: easyCount },
          { id: 'MEDIUM', label: 'Level 3 • Medium', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#92400e', count: mediumCount },
          { id: 'HARD', label: 'Level 4 • Hard', color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3', text: '#be123c', count: hardCount },
          { id: 'ADVANCED', label: 'Level 5 • Advanced', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', count: advancedCount },
          { id: 'EXPERT', label: 'Level 6 • Expert', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca', count: expertCount },
        ].map((lvl) => {
          const isSelected = difficulty === lvl.id;
          return (
            <button
              key={lvl.id}
              onClick={() => setDifficulty(lvl.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: isSelected ? '2px solid #1c2d81' : (lvl.border ? `1px solid ${lvl.border}` : '1px solid #cbd5e1'),
                background: isSelected ? '#1c2d81' : (lvl.bg || '#ffffff'),
                color: isSelected ? '#ffffff' : (lvl.text || '#334155'),
                fontWeight: isSelected ? 800 : 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              {lvl.color && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSelected ? '#ffffff' : lvl.color }} />}
              <span>{lvl.label}</span>
              <span style={{
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                color: isSelected ? '#ffffff' : '#64748b'
              }}>
                {lvl.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.tableCard}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th style={{ width: '40%', paddingLeft: '20px' }}>Question Prompt &amp; Code Snippet</th>
              <th style={{ width: '13%', textAlign: 'center' }}>Skill Taxonomy</th>
              <th style={{ width: '13%', textAlign: 'center' }}>Question Type</th>
              <th style={{ width: '13%', textAlign: 'center' }}>Proficiency Level</th>
              <th style={{ width: '8%', textAlign: 'center' }}>Reward</th>
              <th style={{ width: '13%', textAlign: 'center', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading verified technical questions from database...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 0 }}>
                  {activeSkillMeta ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', background: '#f8fafc' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#fef3c7',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}>
                        <Sparkles size={28} />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                        No {difficulty !== 'ALL' ? difficulty : ''} Questions Found for {activeSkillMeta.name}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '540px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                        There are currently no verified questions for <strong>{activeSkillMeta.name}</strong> at this level.
                        Seed authentic, syllabus-aligned questions across Level 1 (Beginner), Level 2 (Intermediate), and Level 3 (Advanced).
                      </p>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleRecommendSkillQuestions(activeSkillMeta.id, 'ALL')}
                          disabled={recommending}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#1c2d81',
                            color: '#fed601',
                            border: 'none',
                            padding: '10px 22px',
                            fontWeight: 800,
                            fontSize: '0.86rem',
                            cursor: recommending ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <Sparkles size={16} className={recommending ? 'spin' : ''} />
                          <span>{recommending ? `Generating ${activeSkillMeta.name} Questions...` : `Seed Level-by-Level ${activeSkillMeta.name} Questions`}</span>
                        </button>
                        <Link
                          to={`/admin/questions/create?skillId=${activeSkillMeta.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#ffffff',
                            color: '#1c2d81',
                            border: '1px solid #1c2d81',
                            padding: '10px 18px',
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            textDecoration: 'none',
                          }}
                        >
                          <Plus size={15} />
                          <span>Post Custom Question</span>
                        </Link>
                        <button
                          onClick={handleClearSkillFilter}
                          style={{
                            padding: '10px 18px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.86rem',
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          Show All Questions
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      No questions match your filter criteria.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((q, idx) => {
                const rawType = (q.questionType || '').toUpperCase();
                const isMulti = rawType === 'MULTI_CHOICE' || rawType === 'MULTIPLE_SELECT' || rawType === 'MCQ_MULTIPLE';
                const isSingle = rawType === 'SINGLE_CHOICE' || rawType === 'MCQ' || rawType === 'MCQ_SINGLE';
                const isSql = rawType === 'SQL';
                const isCoding = rawType === 'CODING';

                const typeLabel = isMulti
                  ? 'MULTI-CHOICE'
                  : isSingle
                  ? 'SINGLE CHOICE'
                  : isSql
                  ? 'SQL QUERY'
                  : isCoding
                  ? 'CODING'
                  : q.questionType || 'MCQ';

                const isDuplicateDesc =
                  !q.description ||
                  q.description.trim() === q.title?.trim() ||
                  (q.title && q.description && q.title.toLowerCase().startsWith(q.description.toLowerCase().slice(0, 30)));

                const qSkill = q.skillId ? skillsMap.get(q.skillId) : null;
                const diffMeta = getDifficultyMeta(q.difficulty);

                return (
                  <tr key={q.id || idx}>
                    <td style={{ paddingLeft: '20px', cursor: 'pointer' }} onClick={() => openQuestionAudit(q)}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.45, fontSize: '0.88rem' }}>
                          {q.title || `Question #${idx + 1}`}
                        </span>
                        {q.codeTemplate && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: '#0f172a',
                            color: '#38bdf8',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            fontSize: '0.68rem',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                          }}>
                            <Code size={11} /> Code
                          </span>
                        )}
                      </div>

                      {q.description && !isDuplicateDesc && (
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px', lineHeight: 1.35 }}>
                          {q.description}
                        </div>
                      )}

                      {/* Code Snippet Quick Preview in Table */}
                      {q.codeTemplate && (
                        <pre style={{
                          background: '#0f172a',
                          color: '#94a3b8',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          margin: '6px 0 0',
                          maxHeight: '44px',
                          overflow: 'hidden',
                          lineHeight: 1.35,
                          maxWidth: '480px',
                        }}>
                          {q.codeTemplate.split('\n').slice(0, 2).join('\n')}
                        </pre>
                      )}
                    </td>

                    {/* Skill Pill Column */}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {qSkill ? (
                        <button
                          onClick={() => handleSelectSkill(q.skillId!)}
                          title={`Filter questions for ${qSkill.name}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '3px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            cursor: 'pointer',
                            letterSpacing: '0.01em',
                          }}
                        >
                          <Layers size={11} />
                          <span>{qSkill.name}</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          General
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '3px',
                          background: isMulti ? '#fdf4ff' : isSingle ? '#eff6ff' : isSql ? '#f0fdfa' : '#fffbeb',
                          color: isMulti ? '#86198f' : isSingle ? '#1d4ed8' : isSql ? '#0f766e' : '#b45309',
                          border: isMulti ? '1px solid #f5d0fe' : isSingle ? '1px solid #bfdbfe' : isSql ? '1px solid #99f6e4' : '1px solid #fde68a',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {typeLabel}
                      </span>
                    </td>

                    {/* Level-by-Level Proficiency Badge */}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '4px 9px',
                          borderRadius: '4px',
                          background: diffMeta.bg,
                          color: diffMeta.text,
                          border: `1px solid ${diffMeta.border}`,
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: diffMeta.dot }} />
                        <span>{diffMeta.label}</span>
                      </span>
                    </td>

                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: '#d97706', fontSize: '0.84rem' }}>+50 Coins</strong>
                    </td>

                    <td style={{ textAlign: 'center', paddingRight: '20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => openQuestionAudit(q)}
                          title="Inspect question details and answer keys"
                          style={{
                            height: '28px',
                            padding: '0 10px',
                            background: '#1c2d81',
                            color: '#ffffff',
                            border: '1px solid #1c2d81',
                            borderRadius: '3px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>

                        <Link
                          to={`/admin/questions/edit/${q.id}`}
                          title="Edit question prompt, options, and difficulty"
                          style={{
                            height: '28px',
                            padding: '0 10px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: '3px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxSizing: 'border-box',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </Link>

                        <button
                          onClick={() => setQuestionToDelete(q)}
                          title="Delete question permanently"
                          style={{
                            height: '28px',
                            padding: '0 10px',
                            background: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '3px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedQuestion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setSelectedQuestion(null)}
        >
          <div
            style={{
              background: '#ffffff',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                  {selectedQuestion.skillId && skillsMap.get(selectedQuestion.skillId) && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '3px' }}>
                      {skillsMap.get(selectedQuestion.skillId)?.name}
                    </span>
                  )}
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '3px' }}>
                    {selectedQuestion.questionType || 'MCQ'}
                  </span>
                  {(() => {
                    const modalDiff = getDifficultyMeta(selectedQuestion.difficulty);
                    return (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '3px',
                        background: modalDiff.bg,
                        color: modalDiff.text,
                        border: `1px solid ${modalDiff.border}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: modalDiff.dot }} />
                        <span>{modalDiff.label}</span>
                      </span>
                    );
                  })()}
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706' }}>
                    +50 Coins
                  </span>
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedQuestion.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedQuestion.description && (
              <div style={{ marginBottom: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.5 }}>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>Scenario &amp; Problem Statement:</strong>
                {selectedQuestion.description}
              </div>
            )}

            {selectedQuestion.codeTemplate && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                  <Code size={14} /> Code Snippet / Benchmark:
                </strong>
                <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: '14px', fontSize: '0.8rem', overflowX: 'auto', borderRadius: '4px', lineHeight: 1.45 }}>
                  {selectedQuestion.codeTemplate}
                </pre>
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Answer Options &amp; Correct Key
                </h3>
                {options.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      background: options.filter((o) => o.correct).length > 1 ? '#fdf4ff' : '#eff6ff',
                      color: options.filter((o) => o.correct).length > 1 ? '#86198f' : '#1d4ed8',
                      border: options.filter((o) => o.correct).length > 1 ? '1px solid #f5d0fe' : '1px solid #bfdbfe',
                    }}
                  >
                    {options.filter((o) => o.correct).length > 1
                      ? `Multiple Choice (${options.filter((o) => o.correct).length} Correct Keys)`
                      : 'Single Choice (1 Correct Key)'}
                  </span>
                )}
              </div>

              {loadingOptions ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                  Loading question options...
                </div>
              ) : options.length === 0 ? (
                <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.82rem' }}>
                  No predefined MCQ options recorded for this question (Free-form / Coding / Algorithm benchmark).
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {options.map((opt, idx) => (
                    <div
                      key={opt.id || idx}
                      style={{
                        padding: '12px 14px',
                        border: opt.correct ? '2px solid #16a34a' : '1px solid #e2e8f0',
                        background: opt.correct ? '#f0fdf4' : '#ffffff',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: opt.correct ? '#16a34a' : '#f1f5f9',
                          color: opt.correct ? '#ffffff' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {getOptionLetter(idx)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: opt.correct ? 700 : 500, color: opt.correct ? '#14532d' : '#1e293b', fontSize: '0.86rem' }}>
                          {opt.optionText}
                        </div>
                        {opt.explanation && (
                          <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '4px' }}>
                            {opt.explanation}
                          </div>
                        )}
                      </div>
                      {opt.correct && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', background: '#dcfce7', color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={12} /> Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedQuestion.explanation && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: '18px' }}>
                <strong style={{ display: 'block', fontSize: '0.82rem', color: '#1c2d81', marginBottom: '4px' }}>
                  Solution Analysis &amp; Explanation:
                </strong>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  {selectedQuestion.explanation}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to={`/admin/questions/edit/${selectedQuestion.id}`}
                  style={{
                    padding: '8px 14px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={14} />
                  <span>Edit Question</span>
                </Link>

                <button
                  onClick={() => setQuestionToDelete(selectedQuestion)}
                  style={{
                    padding: '8px 14px',
                    background: '#fef2f2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    handleAction(`Question "${selectedQuestion.title}" audited and verified.`);
                    setSelectedQuestion(null);
                  }}
                  style={{
                    padding: '8px 18px',
                    background: '#1c2d81',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>Mark as Verified</span>
                </button>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  style={{
                    padding: '8px 16px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {questionToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={() => !deleting && setQuestionToDelete(null)}
        >
          <div
            style={{
              background: '#ffffff',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Confirm Permanent Deletion
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  This action will delete the question from the database.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
              Are you sure you want to permanently delete:
              <br />
              <strong style={{ color: '#0f172a', display: 'block', marginTop: '6px', background: '#f8fafc', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                {questionToDelete.title}
              </strong>
            </p>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', marginBottom: '20px', fontSize: '0.8rem', color: '#991b1b', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>All associated option keys, explanations, and evaluation records will be permanently erased.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setQuestionToDelete(null)}
                disabled={deleting}
                style={{
                  padding: '9px 18px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuestion}
                disabled={deleting}
                style={{
                  padding: '9px 20px',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={15} />
                <span>{deleting ? 'Deleting Question...' : 'Delete Question'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI JSON QUESTION EXTRACTOR MODAL */}
      <JsonQuestionExtractorModal
        isOpen={showExtractorModal}
        onClose={() => setShowExtractorModal(false)}
        initialSkillId={selectedSkillId !== 'ALL' ? selectedSkillId : undefined}
        initialSkillName={activeSkillMeta ? activeSkillMeta.name : undefined}
        allSkills={skills.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          category: s.category,
        }))}
        onImportSuccess={(count, skillName) => {
          handleAction(`Successfully extracted and imported ${count} authentic questions into "${skillName}"!`);
          setSearch('');
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete('search');
          setSearchParams(nextParams, { replace: true });
          fetchQuestions(selectedSkillId, '');
        }}
      />
    </div>
  );
}
