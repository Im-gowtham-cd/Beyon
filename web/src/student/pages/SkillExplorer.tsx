import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { taxonomyApi, studentLearningApi } from '../services/taxonomyApi';
import { studentProfileApi } from '../services/studentProfileApi';
import { api } from '../../services/api/client';
import type { SkillCategory, TaxonomySkill, StudentLearningTopic } from '../types/taxonomy';
import type { StudentSkill } from '../types/studentProfile';
import { computeSkillRecommendations } from '../utils/skillRecommendationEngine';
import { intelligenceApi } from '../../intelligence/services/intelligenceApi';
import { AdaptiveTestModal } from '../components/AdaptiveTestModal';
import {
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  BookmarkCheck,
  Compass,
  Star,
  X,
  Plus,
  Target,
  Briefcase,
  Building2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import styles from './SkillExplorer.module.css';

interface MySkillItem {
  id: string;
  learningSkillId?: string;
  profileSkillId?: string;
  name: string;
  slug: string;
  category?: string;
  status: 'ACTIVE_STUDY' | 'PROFILE_SKILL';
  proficiency?: string;
  topicCount?: number;
  description?: string;
}

export function SkillExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<TaxonomySkill[]>([]);
  const [allSkills, setAllSkills] = useState<TaxonomySkill[]>([]);
  const [learningSkills, setLearningSkills] = useState<Array<{ id: string; userId: string; skillId: string; skillName: string; status: string }>>([]);
  const [learningTopics, setLearningTopics] = useState<StudentLearningTopic[]>([]);
  const [profileSkills, setProfileSkills] = useState<StudentSkill[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[] | null>(null);
  const [aiRecLoading, setAiRecLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unenrollLoading, setUnenrollLoading] = useState<string | null>(null);
  const [enrollLoading, setEnrollLoading] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [weakConcepts, setWeakConcepts] = useState<any[]>([]);
  const [isRetestModalOpen, setIsRetestModalOpen] = useState(false);
  const [adaptiveTestData, setAdaptiveTestData] = useState<any>(null);
  const [adaptiveTestLoading, setAdaptiveTestLoading] = useState(false);
  const [selectedWeakSkillFilter, setSelectedWeakSkillFilter] = useState<string>('ALL');
  const [expandedRemediations, setExpandedRemediations] = useState<Record<string, boolean>>({});
  const activeCategory = searchParams.get('category') || '';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, lt, ls, ps, allTax, weak, opps] = await Promise.all([
        taxonomyApi.getCategories().catch(() => []),
        studentLearningApi.getTopics().catch(() => []),
        studentLearningApi.getSkills().catch(() => []),
        studentProfileApi.getSkills().catch(() => []),
        taxonomyApi.getSkills({ limit: 200 }).catch(() => []),
        intelligenceApi.getWeakConcepts().catch(() => []),
        api.get<any[]>('/opportunities').catch(() => []),
      ]);
      setCategories(cats || []);
      setLearningTopics(lt || []);
      setLearningSkills(ls || []);
      setProfileSkills(ps || []);
      setAllSkills(allTax || []);
      setSkills(allTax || []);
      setWeakConcepts(weak || []);
      setOpportunities(Array.isArray(opps) ? opps : (opps as any)?.data || []);
    } catch {

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const mySkills: MySkillItem[] = useMemo(() => {
    const map = new Map<string, MySkillItem>();

    learningSkills.forEach(ls => {
      const taxSkill = allSkills.find(s => s.id === ls.skillId || s.name.toLowerCase() === ls.skillName?.toLowerCase());
      const slug = taxSkill?.slug || ls.skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
      map.set(slug, {
        id: taxSkill?.id || ls.skillId || ls.id,
        learningSkillId: ls.skillId || ls.id,
        name: ls.skillName || taxSkill?.name || 'Skill',
        slug,
        category: typeof taxSkill?.category === 'object' ? (taxSkill.category as any).name : taxSkill?.category || 'Active Track',
        status: 'ACTIVE_STUDY',
        topicCount: taxSkill?.topicCount || 2,
        description: taxSkill?.description,
      });
    });

    learningTopics.forEach(lt => {
      const skillName = (lt as any).skillName || (lt as any).topicName;
      if (skillName) {
        const taxSkill = allSkills.find(s => s.id === (lt as any).skillId || s.name.toLowerCase().includes(skillName.toLowerCase()));
        if (taxSkill && !map.has(taxSkill.slug)) {
          map.set(taxSkill.slug, {
            id: taxSkill.id,
            learningSkillId: (lt as any).skillId || taxSkill.id,
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

    profileSkills.forEach(ps => {
      const taxSkill = allSkills.find(s => s.name.toLowerCase() === ps.skillName.toLowerCase());
      const slug = taxSkill?.slug || ps.skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!map.has(slug)) {
        map.set(slug, {
          id: taxSkill?.id || ps.id,
          profileSkillId: ps.id,
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
        existing.profileSkillId = ps.id;
        if (ps.proficiency && !existing.proficiency) {
          existing.proficiency = ps.proficiency;
        }
      }
    });

    return Array.from(map.values());
  }, [learningSkills, learningTopics, profileSkills, allSkills]);

  const mySkillIdentifiers = useMemo(() => {
    const names = new Set<string>();
    const slugs = new Set<string>();
    const ids = new Set<string>();

    mySkills.forEach(s => {
      if (s.name) names.add(s.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (s.slug) slugs.add(s.slug.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (s.id) ids.add(s.id);
      if (s.learningSkillId) ids.add(s.learningSkillId);
      if (s.profileSkillId) ids.add(s.profileSkillId);
    });

    return { names, slugs, ids };
  }, [mySkills]);

  const availableSkills = useMemo(() => {
    const pool = skills.length > 0 ? skills : allSkills;
    return pool.filter(skill => {

      if (mySkillIdentifiers.ids.has(skill.id)) return false;

      const normName = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (mySkillIdentifiers.names.has(normName)) return false;

      const normSlug = skill.slug ? skill.slug.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      if (normSlug && (mySkillIdentifiers.slugs.has(normSlug) || mySkillIdentifiers.names.has(normSlug))) {
        return false;
      }

      return true;
    });
  }, [skills, allSkills, mySkillIdentifiers]);

  const displayedSkills = useMemo(() => {
    if (!search.trim()) return availableSkills;
    const term = search.toLowerCase().trim();
    return availableSkills.filter(s =>
      s.name.toLowerCase().includes(term) ||
      (s.description && s.description.toLowerCase().includes(term)) ||
      (typeof s.category === 'string' && s.category.toLowerCase().includes(term)) ||
      (typeof s.category === 'object' && (s.category as any)?.name?.toLowerCase().includes(term))
    );
  }, [availableSkills, search]);

  const deduplicatedProfileSkills = useMemo(() => {
    const map = new Map<string, StudentSkill>();
    profileSkills.forEach(s => {
      const key = (s.skillName || '').toLowerCase().trim();
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, s);
      } else {
        const existing = map.get(key)!;
        if (s.verified && !existing.verified) {
          map.set(key, s);
        } else if ((s.score || 0) > (existing.score || 0)) {
          map.set(key, s);
        }
      }
    });
    return Array.from(map.values());
  }, [profileSkills]);

  const blockedDrives = useMemo(() => {
    const verifiedSkillNames = new Set(
      deduplicatedProfileSkills
        .filter(s => s.verified || (s.score && s.score >= 50))
        .map(s => (s.skillName || '').toLowerCase().trim())
    );
    const driveList = opportunities.filter((o: any) =>
      (o.opportunityType && o.opportunityType.includes('DRIVE')) ||
      (o.title && o.title.toLowerCase().includes('drive'))
    );
    const blocked: Array<{ id: string; title: string; packageLpa?: number; missingSkills: string[] }> = [];
    driveList.forEach((d: any) => {
      const rawReq = (d.requiredSkills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
      const missing = rawReq.filter((req: string) =>
        !Array.from(verifiedSkillNames).some(vn => vn.includes(req.toLowerCase()) || req.toLowerCase().includes(vn))
      );
      if (missing.length > 0) {
        blocked.push({
          id: d.id,
          title: d.title,
          packageLpa: d.packageLpa,
          missingSkills: missing,
        });
      }
    });
    return blocked;
  }, [opportunities, deduplicatedProfileSkills]);

  const assessmentScores = useMemo(() => {
    const scores: Record<string, number> = {};
    deduplicatedProfileSkills.forEach(s => {
      if (s.score != null) {
        scores[s.skillName] = Number(s.score);
      }
    });
    return scores;
  }, [deduplicatedProfileSkills]);

  const recommendationData = useMemo(() => {
    return computeSkillRecommendations(
      deduplicatedProfileSkills,
      learningSkills,
      allSkills,
      8,
      mySkillIdentifiers.names,
      mySkillIdentifiers.ids,
      {
        targetJobRole: selectedRole || undefined,
        targetCompany: selectedCompany || undefined,
        assessmentScores,
        blockedDrives,
        weakConcepts,
      }
    );
  }, [deduplicatedProfileSkills, learningSkills, allSkills, mySkillIdentifiers, selectedRole, selectedCompany, assessmentScores, blockedDrives, weakConcepts]);

  useEffect(() => {
    let isCancelled = false;
    async function fetchAiRecommendations() {
      if (allSkills.length === 0) return;
      try {
        setAiRecLoading(true);
        const currentSkillsPayload = deduplicatedProfileSkills.map(s => ({
          skillName: s.skillName,
          score: s.score,
          proficiency: s.proficiency || 'INTERMEDIATE',
          verified: s.verified
        }));
        const candPayload = allSkills.slice(0, 40).map(s => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          category: typeof s.category === 'object' ? (s.category as any).name : s.category,
          topicCount: s.topicCount,
          description: s.description
        }));
        const response: any = await intelligenceApi.getAiSkillRecommendations({
          current_skills: currentSkillsPayload,
          weak_concepts: weakConcepts,
          target_role: selectedRole || 'Full Stack Software Engineer',
          target_company: selectedCompany || undefined,
          blocked_drives: blockedDrives,
          candidate_skills: candPayload,
          limit: 8
        });
        if (!isCancelled && response && Array.isArray(response.recommendations) && response.recommendations.length > 0) {
          const formatted = response.recommendations.map((r: any) => {
            const taxSkill = allSkills.find(s => s.name.toLowerCase() === (r.skill_name || r.skill?.name || '').toLowerCase()) || r.skill;
            return {
              skill: taxSkill || { id: r.skill_name, name: r.skill_name, slug: r.skill_name.toLowerCase().replace(/[^a-z0-9]/g, '') },
              score: r.score || 90,
              reason: r.reason,
              synergyTag: r.synergy_tag || 'AI Matched',
              domain: r.domain || 'Engineering',
              unblockedDrives: r.unblocked_drives || []
            };
          });
          setAiRecommendations(formatted);
        }
      } catch (err) {
        console.warn('AI recommendation fetch fallback to local engine:', err);
      } finally {
        if (!isCancelled) setAiRecLoading(false);
      }
    }
    fetchAiRecommendations();
    return () => { isCancelled = true; };
  }, [deduplicatedProfileSkills, weakConcepts, selectedRole, selectedCompany, blockedDrives, allSkills]);

  const distinctWeakSkills = useMemo(() => {
    const map: Record<string, number> = {};
    weakConcepts.forEach((item: any) => {
      const name = item.skillName || 'Other';
      map[name] = (map[name] || 0) + 1;
    });
    return map;
  }, [weakConcepts]);

  const filteredWeakConcepts = useMemo(() => {
    if (selectedWeakSkillFilter === 'ALL') return weakConcepts;
    return weakConcepts.filter((item: any) => (item.skillName || '').toLowerCase() === selectedWeakSkillFilter.toLowerCase());
  }, [weakConcepts, selectedWeakSkillFilter]);

  async function handleLaunchAdaptiveRetest(targetSkill = 'CSS', weakConcept = 'css-boxing', companionSkill = 'HTML') {
    setIsRetestModalOpen(true);
    setAdaptiveTestLoading(true);
    try {
      const data = await intelligenceApi.generateAdaptiveTest(targetSkill, companionSkill, weakConcept, 30);
      setAdaptiveTestData(data);
    } catch (err) {
      console.error('Failed to generate adaptive test:', err);
    } finally {
      setAdaptiveTestLoading(false);
    }
  }

  async function handleUnenroll(e: React.MouseEvent, skill: MySkillItem) {
    e.preventDefault();
    e.stopPropagation();
    setUnenrollLoading(skill.slug);

    try {

      if (skill.learningSkillId || skill.id) {
        const idToRemove = skill.learningSkillId || skill.id;
        await studentLearningApi.removeSkill(idToRemove).catch(() => {});
      }

      if (skill.profileSkillId) {
        await studentProfileApi.removeSkill(skill.profileSkillId).catch(() => {});
      }

      setLearningSkills(prev => prev.filter(ls => {
        const matchName = ls.skillName?.toLowerCase() === skill.name.toLowerCase();
        const matchId = ls.skillId === skill.id || ls.id === skill.learningSkillId || ls.id === skill.id;
        return !matchName && !matchId;
      }));

      setProfileSkills(prev => prev.filter(ps => {
        const matchName = ps.skillName?.toLowerCase() === skill.name.toLowerCase();
        const matchId = ps.id === skill.profileSkillId || ps.id === skill.id;
        return !matchName && !matchId;
      }));

      setLearningTopics(prev => prev.filter(lt => {
        const matchSkill = (lt as any).skillId === skill.id;
        const matchTopic = (lt as any).topicName?.toLowerCase().includes(skill.name.toLowerCase());
        return !matchSkill && !matchTopic;
      }));
    } catch (err) {
      console.error('Failed to unenroll skill:', err);
    } finally {
      setUnenrollLoading(null);
    }
  }

  async function handleEnroll(e: React.MouseEvent, skill: TaxonomySkill) {
    e.preventDefault();
    e.stopPropagation();
    setEnrollLoading(skill.slug);

    try {
      const res = await studentLearningApi.addSkill(skill.id, skill.name).catch(() => null);
      setLearningSkills(prev => [
        ...prev,
        {
          id: res?.id || skill.id,
          userId: res?.userId || '',
          skillId: skill.id,
          skillName: skill.name,
          status: 'LEARNING',
        },
      ]);
    } catch (err) {
      console.error('Failed to enroll skill:', err);
    } finally {
      setEnrollLoading(null);
    }
  }

  return (
    <div className={styles.page}>

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={(e) => handleUnenroll(e, skill)}
                        disabled={unenrollLoading === skill.slug}
                        className={styles.unenrollBtn}
                        title="Unenroll and return to available catalog"
                      >
                        {unenrollLoading === skill.slug ? (
                          'Removing...'
                        ) : (
                          <>
                            <X size={12} /> Unenroll
                          </>
                        )}
                      </button>
                      <span style={{ fontSize: '0.78rem', color: '#1c2d81', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        Continue <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {!search && !activeCategory && weakConcepts.length > 0 && (
        <section className={styles.sectionBlock}>
          {/* Critical Drive Blocker Alert Banner */}
          <div style={{
            background: '#fff1f2',
            border: '1.5px solid #fda4af',
            padding: '14px 18px',
            marginBottom: '16px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#f43f5e', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#9f1239' }}>
                  Critical Attention Required · Campus Drive Eligibility Impacted
                </div>
                <div style={{ fontSize: '0.8rem', color: '#881337', marginTop: '2px' }}>
                  Concept weaknesses in your profile are currently restricting eligibility for <strong>Zoho Core Systems</strong>, <strong>Presidio Cloud Architecture</strong>, and <strong>Mr. Cooper FinTech</strong> campus drives.
                </div>
              </div>
            </div>
            <Link
              to="/opportunities?tab=CRITICAL_ATTENTION"
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#9f1239',
                background: '#ffe4e6',
                border: '1px solid #fecdd3',
                padding: '6px 14px',
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Briefcase size={13} /> View Blocked Drives
            </Link>
          </div>

          {/* Skill Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button
              onClick={() => setSelectedWeakSkillFilter('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedWeakSkillFilter === 'ALL' ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                background: selectedWeakSkillFilter === 'ALL' ? '#1c2d81' : '#ffffff',
                color: selectedWeakSkillFilter === 'ALL' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              All Weak Skills ({weakConcepts.length})
            </button>
            {Object.entries(distinctWeakSkills).map(([sName, count]) => {
              const isSelected = selectedWeakSkillFilter.toLowerCase() === sName.toLowerCase();
              return (
                <button
                  key={sName}
                  onClick={() => setSelectedWeakSkillFilter(isSelected ? 'ALL' : sName)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #991b1b' : '1px solid #fecaca',
                    background: isSelected ? '#fee2e2' : '#ffffff',
                    color: isSelected ? '#991b1b' : '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {sName} ({count})
                </button>
              );
            })}
          </div>

          {filteredWeakConcepts.map((item: any, idx: number) => {
            const accuracy = typeof item.accuracy === 'number' ? item.accuracy : 20.0;
            const steps = item.improvementSteps || [];
            const cardKey = `${item.skillName}-${item.conceptKey || 'concept'}-${idx}`;
            const isExpanded = expandedRemediations[cardKey] ?? (idx === 0);

            return (
              <div
                key={cardKey}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '20px 24px',
                  marginBottom: '16px',
                  boxShadow: '0 1px 3px rgba(220, 38, 38, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#991b1b',
                        background: '#fee2e2',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        textTransform: 'uppercase'
                      }}>
                        {item.skillName} Skill
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {item.conceptTitle}
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Diagnostic Accuracy: {accuracy}% ({item.correctAttempts || 0}/{item.totalAttempts || 0} questions correct)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLaunchAdaptiveRetest(item.skillName, item.conceptKey, item.recommendedAdaptiveBlueprint?.companionSkill)}
                    style={{
                      background: '#1c2d81',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '4px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(28, 45, 129, 0.2)'
                    }}
                  >
                    <Target size={15} /> Launch 50/50 Adaptive Retest
                  </button>
                </div>

                {/* Why You Struggled */}
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: '#fef2f2',
                  borderLeft: '4px solid #ef4444',
                  borderRadius: '0 4px 4px 0',
                  fontSize: '0.86rem',
                  color: '#7f1d1d',
                  lineHeight: 1.5
                }}>
                  <strong>Diagnostic Finding:</strong> {item.whyStruggled}
                </div>

                {/* Step-by-Step Remediation Accordion */}
                <div style={{ marginTop: '16px' }}>
                  <button
                    onClick={() => setExpandedRemediations(prev => ({ ...prev, [cardKey]: !isExpanded }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#1c2d81',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isExpanded ? 'Hide Step-by-Step Improvement Plan' : 'View Step-by-Step Improvement Plan'}
                  </button>

                  {isExpanded && (
                    <div style={{
                      marginTop: '12px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid #fee2e2'
                    }}>
                      {steps.map((step: any, stepIdx: number) => (
                        <div
                          key={`step-${cardKey}-${step.stepNumber || stepIdx}`}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            padding: '12px 14px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <span style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: '#1c2d81',
                              color: '#ffffff',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {step.stepNumber}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                              {step.title}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                            {step.guidance}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 50/50 Blueprint Indicator */}
                <div style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#16a34a" />
                    <strong>Adaptive Retest Blueprint:</strong> {item.recommendedAdaptiveBlueprint?.totalQuestions || 30} Questions ({item.recommendedAdaptiveBlueprint?.companionCount || 14} {item.recommendedAdaptiveBlueprint?.companionSkill || 'Companion'} + {item.recommendedAdaptiveBlueprint?.targetSkillCount || 16} {item.skillName}: {item.recommendedAdaptiveBlueprint?.weakConceptCount || 8} {item.conceptTitle} + {item.recommendedAdaptiveBlueprint?.otherConceptsCount || 8} Other {item.skillName} concepts)
                  </span>
                  <span style={{ fontWeight: 700, color: '#15803d' }}>
                    50% Weakness Concentration Rule Enforced
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      )}

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

          {/* Multi-Factor Alignment Filters: Target Role & Target Company */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '110px' }}>
                <Briefcase size={14} color="#1c2d81" /> Target Role:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'All Roles', value: '' },
                  { label: 'Full Stack', value: 'fullstack' },
                  { label: 'Frontend', value: 'frontend' },
                  { label: 'Backend', value: 'backend' },
                  { label: 'Cloud DevOps', value: 'devops' },
                  { label: 'AI & Data Science', value: 'aiml' },
                ].map(r => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRole(r.value)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      fontWeight: selectedRole === r.value ? 700 : 500,
                      borderRadius: '3px',
                      border: selectedRole === r.value ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                      background: selectedRole === r.value ? '#1c2d81' : '#ffffff',
                      color: selectedRole === r.value ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '110px' }}>
                <Building2 size={14} color="#1c2d81" /> Company Stack:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'All Companies', value: '' },
                  { label: 'Amazon', value: 'amazon' },
                  { label: 'Google', value: 'google' },
                  { label: 'Microsoft', value: 'microsoft' },
                  { label: 'Infosys', value: 'infosys' },
                  { label: 'TCS', value: 'tcs' },
                  { label: 'Startups', value: 'startups' },
                ].map(c => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedCompany(c.value)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      fontWeight: selectedCompany === c.value ? 700 : 500,
                      borderRadius: '3px',
                      border: selectedCompany === c.value ? '1px solid #1c2d81' : '1px solid #cbd5e1',
                      background: selectedCompany === c.value ? '#1c2d81' : '#ffffff',
                      color: selectedCompany === c.value ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.topSkillsPanel}>
            <div className={styles.topSkillsHeader}>
              <div className={styles.topSkillsTitle}>
                <Star size={14} color="#1c2d81" /> Top Skills Used for Recommendations
                {aiRecLoading && (
                  <span style={{ marginLeft: 8, fontSize: '0.70rem', fontWeight: 600, color: '#3b82f6', background: '#eff6ff', padding: '1px 6px', borderRadius: 3 }}>
                    ⚡ Analyzing with AI...
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Based on your profile competencies &amp; active stack ({deduplicatedProfileSkills.length} unique skills)
              </span>
            </div>

            {deduplicatedProfileSkills.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                No profile skills added yet. We are recommending foundational engineering skills below.
              </p>
            ) : (
              <div className={styles.topSkillsChips}>
                {deduplicatedProfileSkills.map(s => {
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {(aiRecommendations || recommendationData.recommendedSkills).map((item: any) => {
              const { skill, reason, synergyTag, companyMatch, roleRelevance, unblockedDrives } = item;
              const count = skill.topicCount != null && skill.topicCount > 0 ? skill.topicCount : 2;
              const catName = typeof skill.category === 'object' ? (skill.category as any).name : skill.category;

              return (
                <Link
                  key={skill.id || skill.slug}
                  to={`/student/skills/${skill.slug}`}
                  className={styles.recCard}
                >
                  <div>
                    <div className={styles.recTopRow}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1c2d81', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {synergyTag}
                      </span>
                      {catName && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                          {catName}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-heading, Montserrat)', fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: '10px 0 6px' }}>
                      {skill.name}
                    </h3>

                    {/* Unblocks Placement Drive Badge */}
                    {unblockedDrives && unblockedDrives.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#991b1b',
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <AlertTriangle size={12} color="#dc2626" />
                          🔓 Unblocks: {unblockedDrives[0]}
                        </span>
                      </div>
                    )}

                    {(companyMatch || roleRelevance) && (
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        {companyMatch && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '3px' }}>
                            {companyMatch} Stack
                          </span>
                        )}
                        {roleRelevance && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4338ca', background: '#eef2ff', border: '1px solid #c7d2fe', padding: '1px 6px', borderRadius: '3px' }}>
                            {roleRelevance}
                          </span>
                        )}
                      </div>
                    )}

                    <div className={styles.recReasonBox} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '6px' }}>
                      <Sparkles size={14} color="#1c2d81" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{reason}</span>
                    </div>

                    {skill.description && (
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '10px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {skill.description}
                      </p>
                    )}
                  </div>

                  <div className={styles.recAction}>
                    <span style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={13} color="#1c2d81" /> {count} Topics
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={(e) => handleEnroll(e, skill)}
                        disabled={enrollLoading === skill.slug}
                        className={styles.enrollBtn}
                      >
                        {enrollLoading === skill.slug ? (
                          'Enrolling...'
                        ) : (
                          <>
                            <Plus size={12} /> Enroll Track
                          </>
                        )}
                      </button>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Explore <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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
                Browse new technologies, frameworks, and developer tools to add to your skills
              </p>
            </div>
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
              <div key={i} className={styles.skeleton} style={{ height: 100, borderRadius: '4px' }} />
            ))}
          </div>
        ) : displayedSkills.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              {search
                ? `No available skills found matching "${search}".`
                : 'All skills in this category have been added to your skills! Unenroll any skill above if you wish to return it here.'}
            </p>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <div className={styles.topicCount} style={{ margin: 0 }}>
                      <BookOpen size={13} style={{ color: '#1c2d81' }} />
                      <span>{count} Topics</span>
                    </div>
                    <button
                      onClick={(e) => handleEnroll(e, skill)}
                      disabled={enrollLoading === skill.slug}
                      className={styles.enrollBtn}
                    >
                      {enrollLoading === skill.slug ? (
                        'Enrolling...'
                      ) : (
                        <>
                          <Plus size={12} /> Enroll
                        </>
                      )}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <AdaptiveTestModal
        isOpen={isRetestModalOpen}
        onClose={() => setIsRetestModalOpen(false)}
        onTestCompleted={() => {
          loadData();
        }}
        testData={adaptiveTestData}
        loading={adaptiveTestLoading}
      />
    </div>
  );
}

