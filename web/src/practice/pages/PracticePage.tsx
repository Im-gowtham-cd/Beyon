import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { practiceApi, questionApi } from '../services/practiceApi';
import { useAuth } from '../../auth/context/AuthContext';
import { getRoleTier } from '../../auth/types/auth';
import type { Question } from '../types/practice';
import { PlusCircle, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './PracticePages.module.css';

export function PracticePage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalFiltered, setTotalFiltered] = useState(34412);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [stats, setStats] = useState({ total: 34412, easy: 11480, medium: 5757, hard: 17175 });

  const isStaffOrAdmin = user ? getRoleTier(user.role) !== 'STUDENT' : false;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load initial bank stats
  useEffect(() => {
    practiceApi.getBankStats()
      .then(s => {
        if (s && s.total) {
          setStats({
            total: s.total,
            easy: s.easy || 0,
            medium: s.medium || 0,
            hard: s.hard || 0,
          });
        }
      })
      .catch(() => {
        // Fallback to questionApi.getStats if available
        questionApi.getStats().then(s => {
          if (s && s.total) {
            setStats({
              total: s.total,
              easy: s.easy || 0,
              medium: s.medium || 0,
              hard: s.hard || 0,
            });
          }
        }).catch(() => {});
      });
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [difficulty, selectedCategory, debouncedSearch, pageSize]);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const [qList, count] = await Promise.all([
        practiceApi.getQuestions({
          difficulty: difficulty || undefined,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          search: debouncedSearch || undefined,
          page: currentPage - 1,
          size: pageSize,
        }),
        practiceApi.getQuestionsCount({
          difficulty: difficulty || undefined,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          search: debouncedSearch || undefined,
        }).catch(() => null),
      ]);

      setQuestions(qList || []);
      if (count !== null && count !== undefined) {
        setTotalFiltered(count);
      } else if (qList) {
        setTotalFiltered(qList.length);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [difficulty, selectedCategory, debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  function detectSkillCategory(q: Question): string {
    const raw = `${q.tags || ''} ${q.title} ${q.questionType}`.toLowerCase();
    if (raw.includes('java') || raw.includes('spring') || raw.includes('jvm') || raw.includes('hibernate')) return 'Java & Spring';
    if (raw.includes('angular') || raw.includes('rxjs') || raw.includes('ngrx')) return 'Angular';
    if (raw.includes('react') || raw.includes('next') || raw.includes('vue') || raw.includes('css') || raw.includes('html') || raw.includes('javascript') || raw.includes('typescript') || raw.includes('bootstrap') || raw.includes('tailwind')) return 'React & Frontend';
    if (raw.includes('dsa') || raw.includes('algorithm') || raw.includes('data structure') || raw.includes('binary') || raw.includes('tree') || raw.includes('graph') || raw.includes('linked list') || raw.includes('sorting') || raw.includes('recursion')) return 'DSA & Algorithms';
    if (raw.includes('python') || raw.includes('django') || raw.includes('fastapi') || raw.includes('machine learning') || raw.includes('deep learning') || raw.includes('pytorch') || raw.includes('scikit') || raw.includes('nlp') || raw.includes('numpy') || raw.includes('pandas') || raw.includes('matplotlib')) return 'Python & AI';
    if (raw.includes('sql') || raw.includes('mysql') || raw.includes('postgres') || raw.includes('mongodb') || raw.includes('redis') || raw.includes('database') || raw.includes('dbms') || raw.includes('sqlite') || raw.includes('cassandra') || raw.includes('dynamodb') || q.questionType === 'SQL') return 'SQL & Database';
    if (raw.includes('flutter') || raw.includes('react native') || raw.includes('mobile') || raw.includes('android') || raw.includes('ios') || raw.includes('swift') || raw.includes('kotlin')) return 'Mobile & Flutter';
    if (raw.includes('system design') || raw.includes('microservice') || raw.includes('cybersecurity') || raw.includes('security') || raw.includes('wireshark') || raw.includes('burp') || raw.includes('kafka')) return 'System Design & Security';
    if (raw.includes('cloud') || raw.includes('aws') || raw.includes('azure') || raw.includes('google cloud') || raw.includes('gcp') || raw.includes('docker') || raw.includes('kubernetes') || raw.includes('linux') || raw.includes('devops') || raw.includes('jenkins') || raw.includes('git') || raw.includes('heroku')) return 'Cloud & DevOps';
    
    if (q.tags && q.tags.trim()) {
      return q.tags.split(',')[0].trim();
    }
    return 'General';
  }

  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const diffColors: Record<string, string> = {
    EASY: '#16a34a',
    BEGINNER: '#16a34a',
    MEDIUM: '#d97706',
    INTERMEDIATE: '#d97706',
    HARD: '#dc2626',
    ADVANCED: '#dc2626',
    EXPERT: '#7c3aed',
  };

  const categories = [
    'ALL',
    'Java & Spring',
    'React & Frontend',
    'Angular',
    'Python & AI',
    'SQL & Database',
    'DSA & Algorithms',
    'Cloud & DevOps',
    'Mobile & Flutter',
    'System Design & Security',
  ];

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title} style={{ margin: 0 }}>Practice Arena</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px', fontWeight: 400 }}>
            Master all {stats.total?.toLocaleString()} interactive MCQs, SQL queries, and algorithmic coding challenges
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

      <div className={styles.statsRow}>
        <div
          className={styles.statCard}
          style={{ cursor: 'pointer', borderColor: !difficulty ? '#1c2d81' : '#e2e8f0', background: !difficulty ? '#eff6ff' : '#ffffff' }}
          onClick={() => setDifficulty('')}
        >
          <span className={styles.statLabel}>Total Questions</span>
          <span className={styles.statValue}>{stats.total?.toLocaleString()}</span>
        </div>
        <div
          className={styles.statCard}
          style={{ cursor: 'pointer', borderColor: difficulty === 'EASY' ? '#16a34a' : '#e2e8f0', background: difficulty === 'EASY' ? '#f0fdf4' : '#ffffff' }}
          onClick={() => setDifficulty(difficulty === 'EASY' ? '' : 'EASY')}
        >
          <span className={styles.statLabel}>Easy / Beginner</span>
          <span className={styles.statValue} style={{ color: diffColors.EASY }}>{stats.easy?.toLocaleString()}</span>
        </div>
        <div
          className={styles.statCard}
          style={{ cursor: 'pointer', borderColor: difficulty === 'MEDIUM' ? '#d97706' : '#e2e8f0', background: difficulty === 'MEDIUM' ? '#fffbeb' : '#ffffff' }}
          onClick={() => setDifficulty(difficulty === 'MEDIUM' ? '' : 'MEDIUM')}
        >
          <span className={styles.statLabel}>Medium / Intermediate</span>
          <span className={styles.statValue} style={{ color: diffColors.MEDIUM }}>{stats.medium?.toLocaleString()}</span>
        </div>
        <div
          className={styles.statCard}
          style={{ cursor: 'pointer', borderColor: difficulty === 'HARD' ? '#dc2626' : '#e2e8f0', background: difficulty === 'HARD' ? '#fff1f2' : '#ffffff' }}
          onClick={() => setDifficulty(difficulty === 'HARD' ? '' : 'HARD')}
        >
          <span className={styles.statLabel}>Hard / Advanced / Expert</span>
          <span className={styles.statValue} style={{ color: diffColors.HARD }}>{stats.hard?.toLocaleString()}</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder={`Search across ${stats.total?.toLocaleString()} questions by title, keyword, or tag...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          {['', 'EASY', 'MEDIUM', 'HARD'].map(d => (
            <button
              key={d}
              className={`${styles.filterChip} ${difficulty === d ? styles.filterActive : ''}`}
              onClick={() => setDifficulty(d)}
            >
              {d === ''
                ? `All (${stats.total?.toLocaleString()})`
                : d === 'EASY'
                ? `Easy (${stats.easy?.toLocaleString()})`
                : d === 'MEDIUM'
                ? `Medium (${stats.medium?.toLocaleString()})`
                : `Hard (${stats.hard?.toLocaleString()})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '0.8rem',
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 500 }}>
          Showing <strong>{totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, totalFiltered).toLocaleString()}</strong> of <strong>{totalFiltered.toLocaleString()}</strong> questions
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
            <option value={200}>200 per page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={styles.skeleton} style={{ height: 64, borderRadius: '4px' }} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            No questions found matching your filter criteria. Try clearing search or selecting a different domain.
          </p>
        </div>
      ) : (
        <div className={styles.questionList}>
          {questions.map((q, idx) => {
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

