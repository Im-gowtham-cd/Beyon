import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { taxonomyApi } from '../services/taxonomyApi';
import type { SkillCategory, TaxonomySkill } from '../types/taxonomy';
import { Search, BookOpen } from 'lucide-react';
import styles from './SkillExplorer.module.css';

export function SkillExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<TaxonomySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const activeCategory = searchParams.get('category') || '';

  const loadCategories = useCallback(async () => {
    try {
      const cats = await taxonomyApi.getCategories();
      setCategories(cats);
    } catch { /* fallback */ }
  }, []);

  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);
      const params: { categoryId?: string; search?: string } = {};
      if (activeCategory) {
        const cat = categories.find(c => c.slug === activeCategory);
        if (cat) params.categoryId = cat.id;
      }
      if (search.length >= 2) params.search = search;
      const result = await taxonomyApi.getSkills(params);
      setSkills(result);
    } catch { /* fallback */ }
    setLoading(false);
  }, [activeCategory, categories, search]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { if (categories.length > 0) loadSkills(); }, [loadSkills, categories]);

  function handleCategoryClick(slug: string) {
    const params = new URLSearchParams(searchParams);
    if (slug === activeCategory) {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    setSearchParams(params);
  }

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
            placeholder="Search skills (e.g. CUDA, Spring, React)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

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
      ) : skills.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No skills found matching your query.</p>
        </div>
      ) : (
        <div className={styles.skillsGrid}>
          {skills.map(skill => (
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
                <span>{skill.topicCount || 0} Topics &amp; Practice Tracks</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
