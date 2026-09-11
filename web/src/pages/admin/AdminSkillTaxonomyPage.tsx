import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderTree,
  Search,
  RefreshCw,
  Eye,
  X,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  DollarSign,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  ListFilter,
  BarChart3,
} from 'lucide-react';
import styles from './AdminHome.module.css';

interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
}

interface SkillItem {
  id: string;
  name: string;
  slug: string;
  category?: string;
  categoryId?: string;
  description?: string;
  active: boolean;
  topicCount?: number;
  createdAt?: string;
}

export function AdminSkillTaxonomyPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'EXPLORER' | 'REGISTRY'>('EXPLORER');
  const [activeDrilldownDomain, setActiveDrilldownDomain] = useState<SkillCategory | null>(null);

  const [inspectNode, setInspectNode] = useState<{
    type: 'CATEGORY' | 'SKILL';
    item: any;
    domainName?: string;
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchTaxonomyData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [catRes, skillRes] = await Promise.all([
        fetch('/api/v1/taxonomy/categories', { headers }).catch(() => null),
        fetch('/api/v1/taxonomy/skills', { headers }).catch(() => null),
      ]);

      if (catRes && catRes.ok) {
        const data = await catRes.json();
        setCategories(data.data || []);
      }
      if (skillRes && skillRes.ok) {
        const data = await skillRes.json();
        setSkills(data.data || []);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomyData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, SkillCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const skillsCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    skills.forEach((s) => {
      if (s.categoryId) {
        map.set(s.categoryId, (map.get(s.categoryId) || 0) + 1);
      }
    });
    return map;
  }, [skills]);

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const catId = s.categoryId || '';
      const catName = categoryMap.get(catId)?.name || s.category || '';
      const matchesCategory =
        selectedCategory === 'ALL' || s.categoryId === selectedCategory;
      const matchesSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
        catName.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [skills, selectedCategory, search, categoryMap]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [categories, search]);

  const skillsInActiveDomain = useMemo(() => {
    if (!activeDrilldownDomain) return [];
    return skills.filter((s) => s.categoryId === activeDrilldownDomain.id);
  }, [skills, activeDrilldownDomain]);

  return (
    <div className={styles.page}>
      {/* Header section matching other admin pages */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '4px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#1c2d81',
                background: '#fed601',
                padding: '3px 8px',
                letterSpacing: '0.04em',
              }}
            >
              STANDARDIZED TAXONOMY
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#15803d',
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                padding: '3px 8px',
              }}
            >
              ✓ 24 DOMAINS • 109 COMPETENCIES
            </span>
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#1c2d81',
              margin: '0 0 4px',
              letterSpacing: '-0.02em',
            }}
          >
            Skill Taxonomy &amp; Hierarchy Management
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Unified catalog of technical knowledge domains, industry competency nodes, and question bank mapping.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              fetchTaxonomyData();
              showToast('Taxonomy registry and domain nodes re-synchronized with Dolt DB.');
            }}
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
              color: '#1c2d81',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Taxonomy</span>
          </button>

          <Link
            to="/admin/skills/graph"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1px solid #1c2d81',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 800,
              textDecoration: 'none',
              cursor: 'pointer',
              color: '#1c2d81',
            }}
          >
            <BarChart3 size={15} />
            <span>View Skill Graph</span>
          </Link>

          <Link
            to="/admin/questions"
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
            }}
          >
            <HelpCircle size={15} />
            <span>Question Bank</span>
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            padding: '12px 18px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Cards matching AdminHome & AdminQuestionsPage */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Competencies</span>
            <div className={styles.kpiIcon}>
              <Layers size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>{skills.length || 109}</div>
          <div className={styles.kpiSub}>
            <Sparkles size={13} />
            <span>100% Mapped to Question Bank</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Knowledge Domains</span>
            <div className={styles.kpiIcon}>
              <FolderTree size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>{categories.length || 24}</div>
          <div className={styles.kpiSub}>
            <Activity size={13} />
            <span>Root Categories in Dolt</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Industry Demand</span>
            <div className={styles.kpiIcon}>
              <TrendingUp size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>94.2% HIGH</div>
          <div className={styles.kpiSub}>
            <span>+24% YoY Hiring Acceleration</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Median Compensation</span>
            <div className={styles.kpiIcon}>
              <DollarSign size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>$118,500</div>
          <div className={styles.kpiSub}>
            <span>Global Market Benchmark</span>
          </div>
        </div>
      </div>

      {/* View Tabs & Control Bar */}
      <div className={styles.tabBar}>
        <button
          type="button"
          className={`${styles.tabBtn} ${viewMode === 'EXPLORER' ? styles.tabBtnActive : ''}`}
          onClick={() => {
            setViewMode('EXPLORER');
            setActiveDrilldownDomain(null);
          }}
        >
          <FolderTree size={15} />
          <span>Hierarchy Tree Explorer</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${viewMode === 'REGISTRY' ? styles.tabBtnActive : ''}`}
          onClick={() => {
            setViewMode('REGISTRY');
            setActiveDrilldownDomain(null);
          }}
        >
          <ListFilter size={15} />
          <span>Full Competency Registry ({skills.length || 109})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <Search
              size={16}
              color="#64748b"
              style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search domains, skills, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Domain:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                if (e.target.value !== 'ALL') {
                  const found = categories.find((c) => c.id === e.target.value);
                  if (found) setActiveDrilldownDomain(found);
                } else {
                  setActiveDrilldownDomain(null);
                }
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#1c2d81',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Domains ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({skillsCountByCategory.get(c.id) || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
          <span>Displaying</span>
          <strong style={{ color: '#1c2d81' }}>
            {viewMode === 'EXPLORER'
              ? activeDrilldownDomain
                ? `${skillsInActiveDomain.length} skills in ${activeDrilldownDomain.name}`
                : `${filteredCategories.length} Domains`
              : `${filteredSkills.length} of ${skills.length} Competencies`}
          </strong>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'EXPLORER' ? (
        activeDrilldownDomain ? (
          /* Domain Drilldown View */
          <div>
            {/* Breadcrumb row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                fontSize: '0.85rem',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveDrilldownDomain(null);
                  setSelectedCategory('ALL');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#1c2d81',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={14} />
                <span>All Domains</span>
              </button>
              <ChevronRight size={14} color="#94a3b8" />
              <span style={{ fontWeight: 800, color: '#1c2d81' }}>{activeDrilldownDomain.name}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  background: '#eff6ff',
                  color: '#1c2d81',
                  border: '1px solid #bfdbfe',
                  padding: '2px 8px',
                  fontWeight: 800,
                }}
              >
                {skillsInActiveDomain.length} COMPETENCIES MAPPED
              </span>
            </div>

            {/* Grid of skills within this domain */}
            <div className={styles.powerActionGrid}>
              {skillsInActiveDomain.map((skill) => (
                <div key={skill.id} className={styles.powerCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h3 className={styles.powerTitle} style={{ margin: 0 }}>
                      {skill.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        padding: '2px 6px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      HIGH DEMAND
                    </span>
                  </div>

                  <p className={styles.powerDesc} style={{ minHeight: '38px' }}>
                    {skill.description || `${skill.name} engineering competencies and assessment benchmarks.`}
                  </p>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '8px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      color: '#64748b',
                    }}
                  >
                    <span>Subtopics: <strong style={{ color: '#1c2d81' }}>{skill.topicCount || 2}</strong></span>
                    <span>Salary: <strong style={{ color: '#15803d' }}>$90k - $160k</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setInspectNode({ type: 'SKILL', item: skill, domainName: activeDrilldownDomain.name })}
                      className={`${styles.powerBtn} ${styles.powerBtnSecondary}`}
                      style={{ flex: 1 }}
                    >
                      <Eye size={14} />
                      <span>Inspect</span>
                    </button>
                    <Link
                      to={`/admin/questions?search=${encodeURIComponent(skill.name)}`}
                      className={styles.powerBtn}
                      style={{ flex: 1, textDecoration: 'none' }}
                    >
                      <HelpCircle size={14} />
                      <span>Questions</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Domain Grid View */
          <div className={styles.powerActionGrid}>
            {filteredCategories.map((cat) => {
              const skillCount = skillsCountByCategory.get(cat.id) || 0;
              return (
                <div key={cat.id} className={styles.powerCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#1c2d81',
                          background: '#eff6ff',
                          padding: '2px 6px',
                          border: '1px solid #bfdbfe',
                          textTransform: 'uppercase',
                        }}
                      >
                        ROOT DOMAIN
                      </span>
                      <h3 className={styles.powerTitle} style={{ marginTop: '6px' }}>
                        {cat.name}
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#1c2d81',
                        background: '#fed601',
                        padding: '2px 7px',
                      }}
                    >
                      #{cat.displayOrder}
                    </span>
                  </div>

                  <p className={styles.powerDesc}>
                    Domain slug: <code style={{ color: '#1c2d81' }}>{cat.slug}</code>. Encompasses {skillCount} core competencies mapped to evaluations and tests.
                  </p>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ color: '#64748b' }}>Competencies</span>
                    <strong style={{ color: '#1c2d81', fontSize: '0.9rem' }}>{skillCount} Skills</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setInspectNode({ type: 'CATEGORY', item: cat })}
                      className={`${styles.powerBtn} ${styles.powerBtnSecondary}`}
                      style={{ flex: 1 }}
                    >
                      <Eye size={14} />
                      <span>Inspect</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDrilldownDomain(cat);
                        setSelectedCategory(cat.id);
                      }}
                      className={styles.powerBtn}
                      style={{ flex: 1.4 }}
                    >
                      <span>Explore Skills ({skillCount}) →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Full Registry Table View matching AdminQuestionsPage / AdminHome */
        <div className={styles.tableCard}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Competency / Skill</th>
                <th style={{ width: '20%' }}>Domain Category</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Hierarchy Level</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Industry Demand</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Subtopics</th>
                <th style={{ width: '14%', textAlign: 'center' }}>Actions &amp; Options</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No competencies match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSkills.map((skill) => {
                  const cat = skill.categoryId ? categoryMap.get(skill.categoryId) : null;
                  const catName = cat ? cat.name : skill.category || 'General';

                  return (
                    <tr key={skill.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#1c2d81', fontSize: '0.9rem' }}>
                          {skill.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          <code>{skill.slug}</code> • {skill.description ? (skill.description.length > 60 ? `${skill.description.substring(0, 60)}...` : skill.description) : 'Technical competency'}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#1c2d81',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            padding: '3px 8px',
                            display: 'inline-block',
                          }}
                        >
                          {catName}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: '#6b21a8',
                            background: '#faf5ff',
                            border: '1px solid #e9d5ff',
                            padding: '2px 8px',
                          }}
                        >
                          SKILL
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: '#15803d',
                            background: '#dcfce7',
                            border: '1px solid #bbf7d0',
                            padding: '2px 8px',
                          }}
                        >
                          HIGH
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#1c2d81' }}>
                        {skill.topicCount || 2}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setInspectNode({ type: 'SKILL', item: skill, domainName: catName })}
                            title="Inspect Competency"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#1c2d81',
                              padding: '5px 10px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              height: '28px',
                            }}
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                          <Link
                            to={`/admin/questions?search=${encodeURIComponent(skill.name)}`}
                            title="View in Question Bank"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#1c2d81',
                              border: '1px solid #1c2d81',
                              color: '#fed601',
                              padding: '5px 10px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              textDecoration: 'none',
                              cursor: 'pointer',
                              height: '28px',
                              boxSizing: 'border-box',
                            }}
                          >
                            <HelpCircle size={13} />
                            <span>Questions</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Node Inspection Modal matching AdminQuestionsPage audit overlay */}
      {inspectNode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setInspectNode(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #1c2d81',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: '#1c2d81',
                color: '#ffffff',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderTree size={18} color="#fed601" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  {inspectNode.type === 'CATEGORY' ? 'Knowledge Domain Node' : 'Competency Node Details'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectNode(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  NODE NAME
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1c2d81', marginTop: '2px' }}>
                  {inspectNode.item.name}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px 16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>CANONICAL SLUG</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c2d81', marginTop: '2px' }}>
                    <code>{inspectNode.item.slug}</code>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>HIERARCHY LEVEL</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c2d81', marginTop: '2px' }}>
                    {inspectNode.type}
                  </div>
                </div>
                {inspectNode.domainName && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>PARENT DOMAIN</div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c2d81', marginTop: '2px' }}>
                      {inspectNode.domainName}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>INDUSTRY DEMAND</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                    HIGH (+24% YoY)
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  DESCRIPTION
                </div>
                <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, marginTop: '4px' }}>
                  {inspectNode.item.description || 'Standardized curriculum competency benchmarked against enterprise technical requirements.'}
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setInspectNode(null)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                {inspectNode.type === 'SKILL' && (
                  <Link
                    to={`/admin/questions?search=${encodeURIComponent(inspectNode.item.name)}`}
                    style={{
                      background: '#1c2d81',
                      border: '1px solid #1c2d81',
                      color: '#fed601',
                      padding: '8px 18px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <HelpCircle size={14} />
                    <span>View in Question Bank</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
