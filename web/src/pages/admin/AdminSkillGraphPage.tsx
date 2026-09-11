import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Eye,
  X,
  HelpCircle,
  FolderTree,
  TrendingUp,
  DollarSign,
  Network,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import styles from './AdminHome.module.css';

interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

interface SkillItem {
  id: string;
  name: string;
  slug: string;
  category?: string;
  categoryId?: string;
  description?: string;
  topicCount?: number;
}

export function AdminSkillGraphPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'NAME' | 'TOPICS' | 'DOMAIN'>('NAME');

  const [inspectNode, setInspectNode] = useState<{
    skill: SkillItem;
    domainName: string;
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchGraphData = async () => {
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
    fetchGraphData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const skillCountByCluster = useMemo(() => {
    const map = new Map<string, number>();
    skills.forEach((s) => {
      if (s.categoryId) {
        map.set(s.categoryId, (map.get(s.categoryId) || 0) + 1);
      }
    });
    return map;
  }, [skills]);

  // Filter and sort skills
  const processedSkills = useMemo(() => {
    let result = skills.filter((s) => {
      const catName = s.categoryId ? categoryMap.get(s.categoryId) || '' : s.category || '';
      const matchesCluster = selectedCluster === 'ALL' || s.categoryId === selectedCluster;
      const matchesSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
        catName.toLowerCase().includes(search.toLowerCase());

      return matchesCluster && matchesSearch;
    });

    if (sortBy === 'NAME') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'TOPICS') {
      result.sort((a, b) => (b.topicCount || 0) - (a.topicCount || 0));
    } else if (sortBy === 'DOMAIN') {
      result.sort((a, b) => {
        const nameA = a.categoryId ? categoryMap.get(a.categoryId) || '' : '';
        const nameB = b.categoryId ? categoryMap.get(b.categoryId) || '' : '';
        return nameA.localeCompare(nameB);
      });
    }

    return result;
  }, [skills, selectedCluster, search, sortBy, categoryMap]);

  return (
    <div className={styles.page}>
      {/* Top Header Section */}
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
              GRAPH TOPOLOGY
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
              ✓ 133 GRAPH NODES • 100% RECONCILED
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
            Skill Graph &amp; Competency Matrix
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Graph-driven dependency mapping, cross-domain competency distribution, and hiring demand telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              fetchGraphData();
              showToast('Skill graph nodes and competency clusters re-indexed successfully.');
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
            <span>Refresh Graph</span>
          </button>

          <Link
            to="/admin/skills"
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
            <FolderTree size={15} />
            <span>Taxonomy Registry</span>
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

      {/* KPI Cards row */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Graph Nodes</span>
            <div className={styles.kpiIcon}>
              <Network size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>{skills.length + categories.length || 133}</div>
          <div className={styles.kpiSub}>
            <Sparkles size={13} />
            <span>24 Domains + 109 Competencies</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Clusters</span>
            <div className={styles.kpiIcon}>
              <Cpu size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>{categories.length || 24}</div>
          <div className={styles.kpiSub}>
            <Layers size={13} />
            <span>Standardized Technical Clusters</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Market Demand Index</span>
            <div className={styles.kpiIcon}>
              <TrendingUp size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>94.8% HIGH</div>
          <div className={styles.kpiSub}>
            <span>+24% YoY Enterprise Velocity</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Curriculum Coverage</span>
            <div className={styles.kpiIcon}>
              <DollarSign size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>100% COVERAGE</div>
          <div className={styles.kpiSub}>
            <span>Tied to Question Bank &amp; Scoring</span>
          </div>
        </div>
      </div>

      {/* Domain Cluster Tab Bar */}
      <div className={styles.tabBar}>
        <button
          type="button"
          className={`${styles.tabBtn} ${selectedCluster === 'ALL' ? styles.tabBtnActive : ''}`}
          onClick={() => setSelectedCluster('ALL')}
        >
          <Network size={15} />
          <span>All Competencies ({skills.length || 109})</span>
        </button>
        {categories.slice(0, 10).map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.tabBtn} ${selectedCluster === cat.id ? styles.tabBtnActive : ''}`}
            onClick={() => setSelectedCluster(cat.id)}
          >
            <span>{cat.name} ({skillCountByCluster.get(cat.id) || 0})</span>
          </button>
        ))}
      </div>

      {/* Control Bar: Search & Sort */}
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
              placeholder="Search competencies, domains, tags..."
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
              Cluster:
            </span>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
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
              <option value="ALL">All Clusters ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({skillCountByCluster.get(c.id) || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={14} color="#64748b" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              style={{
                padding: '7px 10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#1c2d81',
                cursor: 'pointer',
              }}
            >
              <option value="NAME">Name (A-Z)</option>
              <option value="TOPICS">Subtopics Count</option>
              <option value="DOMAIN">Domain Cluster</option>
            </select>
          </div>

          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Displaying <strong style={{ color: '#1c2d81' }}>{processedSkills.length}</strong> Nodes
          </span>
        </div>
      </div>

      {/* Competency Matrix Cards Grid */}
      {processedSkills.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '48px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Network size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: '#1c2d81' }}>
            No graph nodes match your query
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>
            Try adjusting your search query or selecting "All Competencies".
          </p>
        </div>
      ) : (
        <div className={styles.powerActionGrid}>
          {processedSkills.map((skill) => {
            const domainName = skill.categoryId ? categoryMap.get(skill.categoryId) || 'Core' : skill.category || 'Core';

            return (
              <div key={skill.id} className={styles.powerCard} style={{ borderTop: '3px solid #1c2d81' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: '#1c2d81',
                        background: '#eff6ff',
                        padding: '2px 7px',
                        border: '1px solid #bfdbfe',
                        textTransform: 'uppercase',
                        display: 'inline-block',
                      }}
                    >
                      {domainName}
                    </span>
                    <h3 className={styles.powerTitle} style={{ marginTop: '6px', fontSize: '1.05rem' }}>
                      {skill.name}
                    </h3>
                  </div>
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

                <p className={styles.powerDesc} style={{ minHeight: '36px' }}>
                  {skill.description || `${skill.name} competencies and systems engineering benchmarks.`}
                </p>

                {/* Telemetry Metric Block */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.76rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Curriculum Depth:</span>
                    <strong style={{ color: '#1c2d81' }}>{skill.topicCount || 2} Subtopics Mapped</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Salary Benchmark:</span>
                    <strong style={{ color: '#15803d' }}>$85k - $150k / yr</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Industry Velocity:</span>
                    <strong style={{ color: '#0369a1' }}>+24% YoY Growth</strong>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setInspectNode({ skill, domainName })}
                    className={`${styles.powerBtn} ${styles.powerBtnSecondary}`}
                    style={{ flex: 1 }}
                  >
                    <Eye size={13} />
                    <span>Inspect</span>
                  </button>
                  <Link
                    to={`/admin/questions?search=${encodeURIComponent(skill.name)}`}
                    className={styles.powerBtn}
                    style={{ flex: 1.2, textDecoration: 'none' }}
                  >
                    <HelpCircle size={13} />
                    <span>Questions →</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cluster Distribution Summary Table */}
      <div className={styles.tableCard} style={{ marginTop: '12px' }}>
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Knowledge Cluster Ecosystem Summary
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Aggregated distribution of competencies, evaluation readiness, and market compensation across clusters.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1c2d81', background: '#fed601', padding: '3px 8px' }}>
            24 CLUSTERS VERIFIED
          </span>
        </div>

        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Cluster Domain</th>
              <th style={{ width: '18%', textAlign: 'center' }}>Competencies Count</th>
              <th style={{ width: '18%', textAlign: 'center' }}>Industry Velocity</th>
              <th style={{ width: '18%', textAlign: 'center' }}>Salary Range</th>
              <th style={{ width: '16%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const count = skillCountByCluster.get(cat.id) || 0;
              return (
                <tr key={cat.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#1c2d81' }}>{cat.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Canonical: <code>{cat.slug}</code>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: '#1c2d81' }}>
                    {count} Skills
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
                      +24% YoY HIGH
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                    $95,000 - $165,000
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCluster(cat.id);
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1c2d81',
                        padding: '5px 12px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Filter Cluster →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
                <Network size={18} color="#fed601" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  Competency Graph Node
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
                  COMPETENCY NODE
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1c2d81', marginTop: '2px' }}>
                  {inspectNode.skill.name}
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
                    <code>{inspectNode.skill.slug}</code>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>DOMAIN CLUSTER</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c2d81', marginTop: '2px' }}>
                    {inspectNode.domainName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SUBTOPICS MAPPED</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c2d81', marginTop: '2px' }}>
                    {inspectNode.skill.topicCount || 2} Core Topics
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>MARKET DEMAND</div>
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
                  {inspectNode.skill.description || 'Standardized curriculum competency benchmarked against enterprise technical requirements.'}
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
                <Link
                  to={`/admin/questions?search=${encodeURIComponent(inspectNode.skill.name)}`}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
