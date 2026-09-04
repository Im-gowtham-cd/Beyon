import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { taxonomyApi, studentLearningApi } from '../services/taxonomyApi';
import { studentProfileApi } from '../services/studentProfileApi';
import type { SkillCategory, TaxonomySkill, StudentLearningTopic } from '../types/taxonomy';
import type { StudentSkill } from '../types/studentProfile';
import { computeSkillRecommendations } from '../utils/skillRecommendationEngine';
import {
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  BookmarkCheck,
  Compass,
  Star,
} from 'lucide-react';
import styles from './SkillExplorer.module.css';

export function SkillExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<TaxonomySkill[]>([]);
  const [allSkills, setAllSkills] = useState<TaxonomySkill[]>([]);
  const [learningSkills, setLearningSkills] = useState<Array<{ id: string; userId: string; skillId: string; skillName: string; status: string }>>([]);
  const [learningTopics, setLearningTopics] = useState<StudentLearningTopic[]>([]);
  const [profileSkills, setProfileSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const activeCategory = searchParams.get('category') || '';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, lt, ls, ps, allTax] = await Promise.all([
        taxonomyApi.getCategories().catch(() => []),
        studentLearningApi.getTopics().catch(() => []),
        studentLearningApi.getSkills().catch(() => []),
        studentProfileApi.getSkills().catch(() => []),
        taxonomyApi.getSkills({ limit: 200 }).catch(() => []),
      ]);
      setCategories(cats || []);
      setLearningTopics(lt || []);
      setLearningSkills(ls || []);
      setProfileSkills(ps || []);
      setAllSkills(allTax || []);
      setSkills(allTax || []);
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch or filter skills when activeCategory changes
  useEffect(() => {
    let isCancelled = false;
    async function filterSkillsByCategory() {
      if (!activeCategory) {
        if (allSkills.length > 0) {
          setSkills(allSkills);
        }
        return;
      }
      try {
        const cat = categories.find(c => c.slug === activeCategory);
        if (cat) {
          const result = await taxonomyApi.getSkills({ categoryId: cat.id });
          if (!isCancelled) {
            setSkills(result || []);
          }
        }
      } catch {
        /* fallback */
      }
    }

    filterSkillsByCategory();
    return () => { isCancelled = true; };
  }, [activeCategory, categories, allSkills]);

  function handleCategoryClick(slug: string) {
    const params = new URLSearchParams(searchParams);
    if (!slug || slug === activeCategory) {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    setSearchParams(params);
  }

  // Instant client-side search filtering for All Available Skills
  const displayedSkills = useMemo(() => {
    const pool = skills.length > 0 ? skills : allSkills;
    if (!search.trim()) return pool;
    const term = search.toLowerCase().trim();
    return pool.filter(s =>
      s.name.toLowerCase().includes(term) ||
      (s.description && s.description.toLowerCase().includes(term)) ||
      (typeof s.category === 'string' && s.category.toLowerCase().includes(term)) ||
      (typeof s.category === 'object' && (s.category as any)?.name?.toLowerCase().includes(term))
    );
  }, [skills, allSkills, search]);

  // Section 1: "My Skills" (Deduplicated active learning skills + profile skills)
  const mySkills = useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      slug: string;
      category?: string;
      status: 'ACTIVE_STUDY' | 'PROFILE_SKILL';
      proficiency?: string;
      topicCount?: number;
      description?: string;
    }>();

    // 1. Add active learning skills
    learningSkills.forEach(ls => {
      const taxSkill = allSkills.find(s => s.id === ls.skillId || s.name.toLowerCase() === ls.skillName?.toLowerCase());
      const slug = taxSkill?.slug || ls.skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
      map.set(slug, {
        id: ls.skillId || ls.id,
        name: ls.skillName || taxSkill?.name || 'Skill',
        slug,
        category: typeof taxSkill?.category === 'object' ? (taxSkill.category as any).name : taxSkill?.category || 'Active Track',
        status: 'ACTIVE_STUDY',
        topicCount: taxSkill?.topicCount || 2,
        description: taxSkill?.description,
      });
    });

    // 2. Add skills from learning topics
    learningTopics.forEach(lt => {
      const skillName = (lt as any).skillName || (lt as any).topicName;
      if (skillName) {
        const taxSkill = allSkills.find(s => s.id === (lt as any).skillId || s.name.toLowerCase().includes(skillName.toLowerCase()));
        if (taxSkill && !map.has(taxSkill.slug)) {
          map.set(taxSkill.slug, {
            id: taxSkill.id,
            name: taxSkill.name,
            slug: taxSkill.slug,
            category: typeof taxSkill.category === 'object' ? (taxSkill.category as any).name : taxSkill.category,
            status: 'ACTIVE_STUDY',
            topicCount: taxSkill.topicCount || 2,
            description: taxSkill.description,
          });
        }
      }
    });

    // 3. Add profile skills (the student's claimed/top skills)
    profileSkills.forEach(ps => {
      const taxSkill = allSkills.find(s => s.name.toLowerCase() === ps.skillName.toLowerCase());
      const slug = taxSkill?.slug || ps.skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!map.has(slug)) {
        map.set(slug, {
          id: ps.id,
          name: ps.skillName,
          slug,
          category: ps.category || (typeof taxSkill?.category === 'object' ? (taxSkill.category as any).name : taxSkill?.category) || 'Technical Skill',
          status: 'PROFILE_SKILL',
          proficiency: ps.proficiency,
          topicCount: taxSkill?.topicCount || 2,
          description: taxSkill?.description,
        });
      } else {
        const existing = map.get(slug)!;
        if (ps.proficiency && !existing.proficiency) {
          existing.proficiency = ps.proficiency;
        }
      }
    });

    return Array.from(map.values());
  }, [learningSkills, learningTopics, profileSkills, allSkills]);

  // Section 2: Recommended Skills (Computed based on Top Skills)
  const recommendationData = useMemo(() => {
    return computeSkillRecommendations(profileSkills, learningSkills, allSkills, 8);
  }, [profileSkills, learningSkills, allSkills]);

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Skill Taxonomy &amp; Engineering Matrix</h1>
          <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '4px 0 0', fontWeight: 400 }}>
            Curated competency tracks, dynamic recommendations, and industry verification standards
          </p>
        </div>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search all skills (e.g. React, Spring Boot, Docker)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* SECTION 1: MY SKILLS (Listed First) */}
      {!search && !activeCategory && (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIcon}>
                <BookmarkCheck size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 className={styles.sectionTitle}>My Skills</h2>
                  <span className={styles.sectionBadge}>{mySkills.length} Enrolled</span>
                </div>
                <p className={styles.sectionSubtitle}>
                  Your active learning tracks, enrolled topics, and verified profile skills
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
              Complete 100% of topics to unlock the proctored assessment
            </span>
          </div>

          {mySkills.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                You haven&apos;t enrolled in any skills yet. Explore the recommended skills below to start your track!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {mySkills.map(skill => (
                <Link
                  key={skill.slug}
                  to={`/student/skills/${skill.slug}`}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '16px 18px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#1c2d81')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                        {skill.name}
                      </span>
                      {skill.status === 'ACTIVE_STUDY' ? (
                        <span style={{ fontSize: '0.7rem', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 6px', borderRadius: '3px', fontWeight: 700 }}>
                          Active Track
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '3px', fontWeight: 700 }}>
                          {skill.proficiency || 'Profile Skill'}
                        </span>
                      )}
                    </div>
                    {skill.category && (
                      <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        {skill.category}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={12} color="#1c2d81" /> {skill.topicCount || 2} Topics
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#1c2d81', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      Continue <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: RECOMMENDED SKILLS (Listed Second) */}
      {!search && !activeCategory && (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIcon}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 className={styles.sectionTitle}>Recommended Skills</h2>
                  <span className={styles.sectionBadge} style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
                    AI Matched
                  </span>
                </div>
                <p className={styles.sectionSubtitle}>
                  {recommendationData.focusSummary}
                </p>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1c2d81', background: '#eff6ff', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>
              Primary Path: {recommendationData.primaryFocus}
            </div>
          </div>

          {/* Top Skills Display Bar */}
          <div className={styles.topSkillsPanel}>
            <div className={styles.topSkillsHeader}>
              <div className={styles.topSkillsTitle}>
                <Star size={14} color="#1c2d81" /> Top Skills Used for Recommendations
              </div>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Based on your profile competencies &amp; active stack
              </span>
            </div>

            {profileSkills.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                No profile skills added yet. We are recommending foundational engineering skills below.
              </p>
            ) : (
              <div className={styles.topSkillsChips}>
                {profileSkills.map(s => {
                  const prof = (s.proficiency || 'INTERMEDIATE').toUpperCase();
                  let profClass = styles.profIntermediate;
                  if (prof === 'BEGINNER') profClass = styles.profBeginner;
                  else if (prof === 'ADVANCED') profClass = styles.profAdvanced;
                  else if (prof === 'EXPERT') profClass = styles.profExpert;

                  return (
                    <span key={s.id || s.skillName} className={styles.topSkillChip}>
                      <span className={styles.topSkillName}>{s.skillName}</span>
                      <span className={`${styles.topSkillProf} ${profClass}`}>
                        {prof}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommended Skills Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {recommendationData.recommendedSkills.map(item => {
              const { skill, reason, synergyTag } = item;
              const count = skill.topicCount != null && skill.topicCount > 0 ? skill.topicCount : 2;
              const catName = typeof skill.category === 'object' ? (skill.category as any).name : skill.category;

              return (
                <Link
                  key={skill.id}
                  to={`/student/skills/${skill.slug}`}
                  className={styles.recCard}
                >
                  <div>
                    <div className={styles.recTopRow}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1c2d81', background: '#eff6ff', padding: '2px 8px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {synergyTag}
                      </span>
                      {catName && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                          {catName}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '10px 0 6px' }}>
                      {skill.name}
                    </h3>

                    <div className={styles.recReasonBox}>
                      ⚡ {reason}
                    </div>

                    {skill.description && (
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '10px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {skill.description}
                      </p>
                    )}
                  </div>

                  <div className={styles.recAction}>
                    <span style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={13} color="#1c2d81" /> {count} Topics &amp; Practice
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Explore Track <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 3: ALL AVAILABLE SKILLS (Listed After) */}
      <section className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <div className={styles.sectionIcon}>
              <Compass size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className={styles.sectionTitle}>All Available Skills</h2>
                <span className={styles.sectionBadge}>
                  {displayedSkills.length} Available
                </span>
              </div>
              <p className={styles.sectionSubtitle}>
                Browse verified technologies, runtime environments, and development tools
              </p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
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

        {/* Skills Catalog Grid */}
        {loading ? (
          <div className={styles.loadingContainer}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={styles.skeleton} style={{ height: 100, borderRadius: '4px' }} />
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
      </section>
    </div>
  );
}
