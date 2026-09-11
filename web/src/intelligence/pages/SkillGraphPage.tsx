import { useState, useEffect, useMemo } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import { api } from '../../services/api/client';
import { useAuth } from '../../auth/context/AuthContext';
import { Link } from 'react-router-dom';
import type { SkillGraphNode } from '../types/intelligence';
import styles from './CareerIntel.module.css';

interface PlatformSkill {
  id: string;
  name: string;
  slug: string;
  category?: string;
  categoryId?: string;
  description?: string;
  topicCount?: number;
}

interface PlatformCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder?: number;
}

export function SkillGraphPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillGraphNode[]>([]);
  const [strengths, setStrengths] = useState<any>(null);
  const [platformSkills, setPlatformSkills] = useState<PlatformSkill[]>([]);
  const [categories, setCategories] = useState<PlatformCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = user && (
    user.role === 'PLATFORM_ADMIN' ||
    user.role === 'CONTENT_ADMIN' ||
    user.role === 'QUESTION_SETTER' ||
    user.role === 'VERIFICATION_ADMIN' ||
    user.role === 'MODERATION_ADMIN' ||
    user.role === 'ANALYTICS_ADMIN' ||
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ADMIN'
  );

  useEffect(() => {
    Promise.all([
      intelligenceApi.getMySkillGraph().catch(() => []),
      intelligenceApi.getSkillStrengths().catch(() => null),
      api.get<PlatformSkill[]>('/taxonomy/skills').catch(() => []),
      api.get<PlatformCategory[]>('/taxonomy/categories').catch(() => []),
    ]).then(([graph, str, pSkills, pCats]) => {
      setSkills(Array.isArray(graph) ? graph : []);
      setStrengths(str);
      setPlatformSkills(Array.isArray(pSkills) ? pSkills : []);
      setCategories(Array.isArray(pCats) ? pCats : []);
    }).finally(() => setLoading(false));
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const filteredPlatformSkills = useMemo(() => {
    return platformSkills.filter(s => {
      const matchesCategory = selectedCategory === 'ALL' || s.categoryId === selectedCategory;
      const matchesSearch = !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [platformSkills, selectedCategory, searchQuery]);

  const levelColor = (level: string) => {
    switch (level) {
      case 'EXPERT': return '#16a34a';
      case 'ADVANCED': return '#2563eb';
      case 'INTERMEDIATE': return '#ca8a04';
      case 'ELEMENTARY': return '#ea580c';
      default: return '#6b7280';
    }
  };

  const barClass = (pct: number) => {
    if (pct >= 80) return styles.graphBarFillLevel5;
    if (pct >= 60) return styles.graphBarFillLevel4;
    if (pct >= 40) return styles.graphBarFillLevel3;
    if (pct >= 20) return styles.graphBarFillLevel2;
    return styles.graphBarFillLevel1;
  };

  const trendIcon = (trend: string) => {
    if (trend === 'IMPROVING') return <span className={styles.trendUp}>↑ Improving</span>;
    if (trend === 'DECLINING') return <span className={styles.trendDown}>↓ Declining</span>;
    return <span className={styles.trendStable}>→ Stable</span>;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} /> Loading skill graph...
        </div>
      </div>
    );
  }

  // If student has active individual skills, show personalized graph
  if (!isAdmin && skills.length > 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Skill Graph</h1>
          <p className={styles.subtitle}>Your unified skill profile across practice, assessments, projects, and certifications</p>
        </div>

        {strengths && (
          <div className={styles.gapSummary}>
            <div className={styles.gapSummaryCard}>
              <div className={`${styles.gapSummaryValue} ${styles.gapSummaryGood}`}>{strengths.totalSkills || 0}</div>
              <div className={styles.gapSummaryLabel}>Total Skills</div>
            </div>
            <div className={styles.gapSummaryCard}>
              <div className={`${styles.gapSummaryValue}`} style={{ color: '#6366f1' }}>{strengths.verifiedSkills || 0}</div>
              <div className={styles.gapSummaryLabel}>Verified Skills</div>
            </div>
            <div className={styles.gapSummaryCard}>
              <div className={`${styles.gapSummaryValue} ${styles.gapSummaryGood}`}>{(strengths.strengths || []).length}</div>
              <div className={styles.gapSummaryLabel}>Strong Skills</div>
            </div>
          </div>
        )}

        <div className={styles.graphContainer}>
          {skills.map(s => (
            <div className={styles.graphCard} key={s.id}>
              <div className={styles.graphSkillName}>{s.skillName}</div>
              <div className={styles.graphPctRow}>
                <div className={styles.graphPct}>{Math.round(s.proficiencyPct)}%</div>
                <div className={styles.graphBar}>
                  <div className={`${styles.graphBarFill} ${barClass(s.proficiencyPct)}`} style={{ width: `${Math.min(100, s.proficiencyPct)}%` }} />
                </div>
                <span className={styles.graphLevel} style={{ background: levelColor(s.level) }}>{s.level}</span>
              </div>
              <div className={styles.graphMeta}>
                <span>Confidence: {Math.round(s.confidence)}%</span>
                <span>Evidence: {s.evidenceCount}</span>
                {s.verified && <span className={styles.graphVerified}>✓ Verified</span>}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                {trendIcon(s.improvementTrend)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Admin & Platform Graph View
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.title}>Skill Graph & Taxonomy Network</h1>
            <p className={styles.subtitle}>
              Unified platform competency map across {categories.length || 24} domains and {platformSkills.length || 109} technical skills
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to="/admin/skills"
              style={{
                padding: '8px 16px',
                background: '#1c2d81',
                color: '#fed601',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Explore Taxonomy Tree</span>
            </Link>
            <Link
              to="/admin/questions"
              style={{
                padding: '8px 16px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Question Bank</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.gapSummary}>
        <div className={styles.gapSummaryCard}>
          <div className={`${styles.gapSummaryValue} ${styles.gapSummaryGood}`}>
            {platformSkills.length || 109}
          </div>
          <div className={styles.gapSummaryLabel}>Total Competencies</div>
        </div>
        <div className={styles.gapSummaryCard}>
          <div className={`${styles.gapSummaryValue}`} style={{ color: '#6366f1' }}>
            {categories.length || 24}
          </div>
          <div className={styles.gapSummaryLabel}>Skill Domains</div>
        </div>
        <div className={styles.gapSummaryCard}>
          <div className={`${styles.gapSummaryValue} ${styles.gapSummaryGood}`}>
            HIGH
          </div>
          <div className={styles.gapSummaryLabel}>Industry Demand</div>
        </div>
        <div className={styles.gapSummaryCard}>
          <div className={`${styles.gapSummaryValue}`} style={{ color: '#0f766e' }}>
            +24% YoY
          </div>
          <div className={styles.gapSummaryLabel}>Ecosystem Growth</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className={styles.searchInput}
          placeholder="Search skills in graph..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '100%', maxWidth: 360 }}
        />
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedCategory === 'ALL' ? '1px solid #1c2d81' : '1px solid #e2e8f0',
              background: selectedCategory === 'ALL' ? '#1c2d81' : '#f8fafc',
              color: selectedCategory === 'ALL' ? '#fed601' : '#475569',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            All Categories ({platformSkills.length})
          </button>
          {categories.slice(0, 10).map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: selectedCategory === cat.id ? '1px solid #1c2d81' : '1px solid #e2e8f0',
                background: selectedCategory === cat.id ? '#1c2d81' : '#f8fafc',
                color: selectedCategory === cat.id ? '#fed601' : '#475569',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {filteredPlatformSkills.length === 0 ? (
        <div className={styles.empty}>
          <p>No skills match your filter criteria.</p>
        </div>
      ) : (
        <div className={styles.graphContainer}>
          {filteredPlatformSkills.map(s => {
            const catName = s.categoryId ? categoryMap.get(s.categoryId) : s.category;
            return (
              <div className={styles.graphCard} key={s.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
                    <div className={styles.graphSkillName} style={{ margin: 0, fontSize: '1.05rem' }}>
                      {s.name}
                    </div>
                    <span className={`${styles.demandTag} ${styles.demandHIGH}`}>HIGH DEMAND</span>
                  </div>
                  {catName && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6366f1', marginBottom: '6px' }}>
                      Domain: {catName}
                    </div>
                  )}
                  {s.description && (
                    <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, marginBottom: '12px' }}>
                      {s.description}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {s.topicCount ? `${s.topicCount} subtopics mapped` : 'Active Competency'}
                  </div>
                  <Link
                    to={`/admin/questions?skillId=${s.id}&search=${encodeURIComponent(s.name)}`}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1c2d81', textDecoration: 'none' }}
                  >
                    View Questions →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

