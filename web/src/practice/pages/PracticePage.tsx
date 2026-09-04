import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { practiceApi, questionApi } from '../services/practiceApi';
import { useAuth } from '../../auth/context/AuthContext';
import type { Question } from '../types/practice';
import { PlusCircle, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './PracticePages.module.css';

export function PracticePage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [stats, setStats] = useState({ total: 412, easy: 174, medium: 177, hard: 61 });

  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'INSTITUTION' || user?.role === 'COMPANY';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [q, s] = await Promise.all([
        practiceApi.getQuestions({
          difficulty: difficulty || undefined,
          size: 500, // Load all questions so client has full catalog access
        }),
        questionApi.getStats().catch(() => ({ total: 412, easy: 174, medium: 177, hard: 61 })),
      ]);
      setQuestions(q || []);
      setStats({
        total: s.total || 412,
        easy: s.easy || 174,
        medium: s.medium || 177,
        hard: s.hard || 61,
      });
    } catch {
      /* fallback */
    }
    setLoading(false);
  }, [difficulty]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset page when difficulty, category, or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [difficulty, selectedCategory, search, pageSize]);

  // Categorize skill from title or metadata
  function detectSkillCategory(q: Question): string {
    const t = q.title.toLowerCase();
    if (t.includes('java:') || t.includes('jvm') || t.includes('spring') || t.includes('concurrent') || t.includes('virtual thread') || t.includes('jmm')) return 'Java';
    if (t.includes('angular') || t.includes('ngrx') || t.includes('rxjs') || t.includes('standalone component')) return 'Angular';
    if (t.includes('react') || t.includes('useeffect') || t.includes('hook') || t.includes('fiber')) return 'React';
    if (t.includes('dsa') || t.includes('linked list') || t.includes('tree') || t.includes('binary') || t.includes('lru') || t.includes('graph') || t.includes('coin change')) return 'DSA';
    if (t.includes('python') || t.includes('gil')) return 'Python';
    if (t.includes('sql') || t.includes('cte') || t.includes('join') || t.includes('select') || t.includes('window function') || q.questionType === 'SQL') return 'SQL';
    if (t.includes('system design') || t.includes('cap theorem') || t.includes('docker') || t.includes('devops')) return 'System Design / DevOps';
    return 'General';
  }

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Category filter
      if (selectedCategory !== 'ALL') {
        const cat = detectSkillCategory(q);
        if (selectedCategory === 'Java' && cat !== 'Java') return false;
        if (selectedCategory === 'Angular' && cat !== 'Angular') return false;
        if (selectedCategory === 'React' && cat !== 'React') return false;
        if (selectedCategory === 'DSA' && cat !== 'DSA') return false;
        if (selectedCategory === 'Python' && cat !== 'Python') return false;
        if (selectedCategory === 'SQL' && cat !== 'SQL') return false;
        if (selectedCategory === 'System Design' && !cat.includes('System Design')) return false;
        if (selectedCategory === 'General' && cat !== 'General') return false;
      }

      // Search filter
      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const matchesTitle = q.title.toLowerCase().includes(term);
        const matchesType = q.questionType.toLowerCase().includes(term);
        const matchesDiff = q.difficulty.toLowerCase().includes(term);
        return matchesTitle || matchesType || matchesDiff;
      }

      return true;
    });
  }, [questions, selectedCategory, search]);

  // Pagination calculation
  const totalFiltered = filteredQuestions.length;
  const isAllPages = pageSize >= 500;
  const totalPages = isAllPages ? 1 : Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedQuestions = useMemo(() => {
    if (isAllPages) return filteredQuestions;
    const startIndex = (safePage - 1) * pageSize;
    return filteredQuestions.slice(startIndex, startIndex + pageSize);
  }, [filteredQuestions, safePage, pageSize, isAllPages]);

  const diffColors: Record<string, string> = {
    EASY: '#16a34a',
    MEDIUM: '#d97706',
    HARD: '#dc2626',
  };

  const categories = [
    'ALL',
    'Java',
    'Angular',
    'React',
    'DSA',
    'Python',
    'SQL',
    'System Design',
    'General',
  ];

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title} style={{ margin: 0 }}>Practice Arena</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px', fontWeight: 400 }}>
            Master all {stats.total} interactive MCQs, SQL queries, and algorithmic coding challenges
          </p>
        </div>
        {isStaffOrAdmin && (
          <Link
            to="/practice/create"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #1c2d81 0%, #253cac 100%)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '0.84rem',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(28, 45, 129, 0.2)',
            }}
          >
            <PlusCircle size={16} />
            <span>Create New Question</span>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className={styles.statsRow}>
        <div
          className={styles.statCard}
          style={{ cursor: 'pointer', borderColor: !difficulty ? '#1c2d81' : '#e2e8f0', background: !difficulty ? '#eff6ff' : '#ffffff' }}
          onClick={() => setDifficulty('')}
        >
          <span className={styles.statLabel}>Total Questions</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div
          className={styles.statCard}
          style={{ cursor: 'pointer', borderColor: difficulty === 'EASY' ? '#16a34a' : '#e2e8f0', background: difficulty === 'EASY' ? '#f0fdf4' : '#ffffff' }}
          onClick={() => setDifficulty(difficulty === 'EASY' ? '' : 'EASY')}
        >
          <span className={styles.statLabel}>Easy Questions</span>
          <span className={styles.statValue} style={{ color: diffColors.EASY }}>{stats.easy}</span>
        </div>
        <div
          className={styles.statCard}
          style={{ cursor: 'pointer', borderColor: difficulty === 'MEDIUM' ? '#d97706' : '#e2e8f0', background: difficulty === 'MEDIUM' ? '#fffbeb' : '#ffffff' }}
          onClick={() => setDifficulty(difficulty === 'MEDIUM' ? '' : 'MEDIUM')}
        >
          <span className={styles.statLabel}>Medium Questions</span>
          <span className={styles.statValue} style={{ color: diffColors.MEDIUM }}>{stats.medium}</span>
        </div>
        <div
          className={styles.statCard}
          style={{ cursor: 'pointer', borderColor: difficulty === 'HARD' ? '#dc2626' : '#e2e8f0', background: difficulty === 'HARD' ? '#fff1f2' : '#ffffff' }}
          onClick={() => setDifficulty(difficulty === 'HARD' ? '' : 'HARD')}
        >
          <span className={styles.statLabel}>Hard Questions</span>
          <span className={styles.statValue} style={{ color: diffColors.HARD }}>{stats.hard}</span>
        </div>
      </div>

      {/* Toolbar & Instant Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search all 412 questions by title, concept, or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Difficulty Chips */}
        <div className={styles.filters}>
          {['', 'EASY', 'MEDIUM', 'HARD'].map(d => (
            <button
              key={d}
              className={`${styles.filterChip} ${difficulty === d ? styles.filterActive : ''}`}
              onClick={() => setDifficulty(d)}
            >
              {d === '' ? `All (${stats.total})` : `${d} (${stats[d.toLowerCase() as keyof typeof stats] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Skill / Domain Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: selectedCategory === cat ? '#1c2d81' : '#cbd5e1',
              background: selectedCategory === cat ? '#1c2d81' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : '#475569',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {cat === 'ALL' ? 'All Domains' : cat}
          </button>
        ))}
      </div>

      {/* Pagination Top Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 500 }}>
          Showing <strong>{totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, totalFiltered)}</strong> of <strong>{totalFiltered}</strong> questions
          {difficulty && <span style={{ color: diffColors[difficulty], fontWeight: 700, marginLeft: '6px' }}>({difficulty})</span>}
          {selectedCategory !== 'ALL' && <span style={{ color: '#1c2d81', fontWeight: 700, marginLeft: '6px' }}>[{selectedCategory}]</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Per Page:</span>
          <select
            className={styles.pageSizeSelect}
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={500}>View All (412)</option>
          </select>
        </div>
      </div>

      {/* Question List */}
      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={styles.skeleton} style={{ height: 64, borderRadius: '4px' }} />
          ))}
        </div>
      ) : paginatedQuestions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            No questions found matching your filter criteria. Try clearing search or selecting a different domain.
          </p>
        </div>
      ) : (
        <div className={styles.questionList}>
          {paginatedQuestions.map((q, idx) => {
            const globalIndex = (safePage - 1) * pageSize + idx + 1;
            const skillCat = detectSkillCategory(q);

            return (
              <Link key={q.id} to={`/practice/${q.id}`} className={styles.questionCard}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', height: '32px', borderRadius: '4px', background: '#eff6ff', color: '#1c2d81', fontWeight: 800, fontSize: '0.75rem', border: '1px solid #bfdbfe' }}>
                    #{globalIndex}
                  </span>

                  <div className={styles.questionInfo}>
                    <h3 className={styles.questionTitle} title={q.title}>
                      {q.title}
                    </h3>
                    <div className={styles.questionMeta}>
                      <span
                        className={styles.diffBadge}
                        style={{
                          color: diffColors[q.difficulty] || '#0f172a',
                          background: q.difficulty === 'EASY' ? '#f0fdf4' : q.difficulty === 'MEDIUM' ? '#fffbeb' : '#fff1f2',
                          borderColor: q.difficulty === 'EASY' ? '#bbf7d0' : q.difficulty === 'MEDIUM' ? '#fef3c7' : '#fecdd3',
                          border: '1px solid',
                          fontWeight: 700,
                        }}
                      >
                        {q.difficulty}
                      </span>
                      <span className={styles.typeBadge}>
                        {q.questionType.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '2px', fontWeight: 500 }}>
                        {skillCat}
                      </span>
                    </div>
                  </div>
                </div>

                <span className={styles.arrow} style={{ marginLeft: '10px' }}>
                  <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls Bottom */}
      {!loading && totalPages > 1 && (
        <div className={styles.paginationBar}>
          <div className={styles.pageInfo}>
            Page {safePage} of {totalPages} ({totalFiltered} total questions)
          </div>

          <div className={styles.paginationControls}>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && safePage > 3) {
                pageNum = safePage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - 4 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`${styles.pageBtn} ${safePage === pageNum ? styles.pageBtnActive : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
