import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { taxonomyApi } from '../services/taxonomyApi';
import type { SkillCategory, TaxonomySkill } from '../types/taxonomy';
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
    } catch { /* */ }
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
    } catch { /* */ }
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
        <h1 className={styles.title}>Skills</h1>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search skills..."
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
          All
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
          <div className={styles.skeleton} style={{ width: '100%', height: 60 }} />
          <div className={styles.skeleton} style={{ width: '100%', height: 60 }} />
          <div className={styles.skeleton} style={{ width: '100%', height: 60 }} />
        </div>
      ) : skills.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No skills found</p>
        </div>
      ) : (
        <div className={styles.skillsGrid}>
          {skills.map(skill => (
            <Link
              key={skill.id}
              to={`/student/skills/${skill.slug}`}
              className={styles.skillCard}
            >
              <span className={styles.skillCategory}>{skill.category || 'Skill'}</span>
              <h3 className={styles.skillName}>{skill.name}</h3>
              {skill.description && <p className={styles.skillDescription}>{skill.description}</p>}
              {skill.topicCount !== undefined && skill.topicCount > 0 && (
                <span className={styles.topicCount}>{skill.topicCount} Topics</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
