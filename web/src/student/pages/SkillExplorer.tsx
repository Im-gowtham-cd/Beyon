import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { taxonomyApi, studentLearningApi } from '../services/taxonomyApi';
import type { SkillCategory, TaxonomySkill, StudentLearningTopic } from '../types/taxonomy';
import { Search, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './SkillExplorer.module.css';

export function SkillExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<TaxonomySkill[]>([]);
  const [allSkills, setAllSkills] = useState<TaxonomySkill[]>([]);
  const [learningSkills, setLearningSkills] = useState<any[]>([]);
  const [learningTopics, setLearningTopics] = useState<StudentLearningTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const activeCategory = searchParams.get('category') || '';

  const loadCategories = useCallback(async () => {
    try {
      const [cats, lt, ls] = await Promise.all([
        taxonomyApi.getCategories().catch(() => []),
        studentLearningApi.getTopics().catch(() => []),
        studentLearningApi.getSkills().catch(() => []),
      ]);
      setCategories(cats || []);
      setLearningTopics(lt || []);
      setLearningSkills(ls || []);
    } catch { /* fallback */ }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    let isCancelled = false;
    async function fetchSkills() {
      setLoading(true);
      try {
        const params: { categoryId?: string; search?: string } = {};
        if (activeCategory) {
          const cat = categories.find(c => c.slug === activeCategory);
          if (cat) params.categoryId = cat.id;
        }
        if (search.trim().length >= 1) params.search = search.trim();
        const result = await taxonomyApi.getSkills(params);
        if (!isCancelled) {
          setSkills(result || []);
          if (!activeCategory && !search.trim()) {
            setAllSkills(result || []);
          }
        }
      } catch {
        /* fallback */
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchSkills();
    return () => { isCancelled = true; };
  }, [activeCategory, categories, search]);

  function handleCategoryClick(slug: string) {
    const params = new URLSearchParams(searchParams);
    if (!slug || slug === activeCategory) {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    setSearchParams(params);
  }

  // Instant client-side search filtering if search term exists
  const displayedSkills = search.trim()
    ? skills.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase().trim())) ||
        (typeof s.category === 'string' && s.category.toLowerCase().includes(search.toLowerCase().trim()))
      )
    : skills;

  // Active / Wished skills that the student has started learning
  const wishedSkills = (allSkills.length > 0 ? allSkills : skills).filter(skill =>
    learningSkills.some(ls => ls.skillId === skill.id || ls.skillName?.toLowerCase() === skill.name?.toLowerCase()) ||
    learningTopics.some(lt => (lt as any).skillId === skill.id || (lt as any).topicName?.toLowerCase().includes(skill.name.toLowerCase()))
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Skill Taxonomy &amp; Engineering Matrix</h1>
          <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '4px 0 0', fontWeight: 400 }}>
            Master core technologies verified across platform coding challenges and proctored benchmark assessments
          </p>
        </div>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search skills (e.g. Java, Spring, React)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Wished / Active Study Skills Section */}
      {wishedSkills.length > 0 && !activeCategory && !search && (
        <div style={{ marginBottom: '28px', background: '#f8fafc', border: '1.5px solid #1c2d81', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#1c2d81', color: '#ffffff', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                🎯 Active
              </span>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                My Wished &amp; Active Study Skills ({wishedSkills.length})
              </h2>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Complete 100% of topics to unlock the proctored exam</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {wishedSkills.map(skill => (
              <Link
                key={skill.id}
                to={`/student/skills/${skill.slug}`}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{skill.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> Active Study Track
                  </div>
                </div>
                <ArrowRight size={16} color="#1c2d81" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className={styles.categories}>
        <button
          className={`${styles.categoryChip} ${!activeCategory ? styles.categoryChipActive : ''}`}
          onClick={() => handleCategoryClick('')}
        >
          All Skills
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${styles.categoryChip} ${activeCategory === cat.slug ? styles.categoryChipActive : ''}`}
            onClick={() => handleCategoryClick(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={styles.skeleton} style={{ height: 100, borderRadius: '0px' }} />
          ))}
        </div>
      ) : displayedSkills.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No skills found matching &quot;{search}&quot;.</p>
        </div>
      ) : (
        <div className={styles.skillsGrid}>
          {displayedSkills.map(skill => {
            const count = skill.topicCount != null && skill.topicCount > 0 ? skill.topicCount : 2;
            return (
              <Link key={skill.id} to={`/student/skills/${skill.slug}`} className={styles.skillCard}>
                <div className={styles.skillHeader}>
                  <h3 className={styles.skillName}>{skill.name}</h3>
                  {skill.category && (
                    <span className={styles.skillCategory}>
                      {typeof skill.category === 'object' ? (skill.category as any).name : skill.category}
                    </span>
                  )}
                </div>
                {skill.description && (
                  <p className={styles.skillDescription}>{skill.description}</p>
                )}
                <div className={styles.topicCount}>
                  <BookOpen size={13} style={{ color: '#1c2d81' }} />
                  <span>{count} Topics &amp; Practice Tracks</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

