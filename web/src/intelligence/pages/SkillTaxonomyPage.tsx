import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { SkillTaxonomyNode } from '../types/intelligence';
import styles from './CareerIntel.module.css';

export function SkillTaxonomyPage() {
  const [roots, setRoots] = useState<SkillTaxonomyNode[]>([]);
  const [children, setChildren] = useState<SkillTaxonomyNode[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    intelligenceApi.getTaxonomyRoots().then(setRoots).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const navigateTo = async (node: SkillTaxonomyNode) => {
    setBreadcrumb(prev => [...prev, { id: node.id, name: node.name }]);
    const data = await intelligenceApi.getTaxonomyTree(node.id);
    setChildren(data.children || []);
  };

  const goBack = (index: number) => {
    setBreadcrumb(prev => prev.slice(0, index));
    if (index === 0) {
      setChildren([]);
    }
  };

  const handleSearch = async () => {
    if (search.length < 2) { setSearchResults([]); return; }
    const results = await intelligenceApi.searchTaxonomy(search);
    setSearchResults(results);
  };

  useEffect(() => { handleSearch(); }, [search]);

  const demandColor = (d: string) => d === 'HIGH' ? styles.demandHIGH : d === 'MEDIUM' ? styles.demandMEDIUM : styles.demandLOW;

  if (loading) return <div className={styles.container}><div className={styles.loading}><div className={styles.loadingSpinner} /> Loading taxonomy...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Skill Taxonomy</h1>
        <p className={styles.subtitle}>Explore the unified skill hierarchy — from categories to individual competencies</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          className={styles.searchInput}
          placeholder="Search skills..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 400 }}
        />
      </div>

      {searchResults.length > 0 && (
        <div className={styles.taxonomyTree}>
          {searchResults.map((r: any) => (
            <div className={styles.taxonomyNode} key={r.id}>
              <div className={styles.taxonomyIcon}>🔍</div>
              <div className={styles.taxonomyInfo}>
                <div className={styles.taxonomyName}>{r.name}</div>
                <div className={styles.taxonomyMeta}>
                  <span className={`${styles.demandTag} ${demandColor(r.industryDemand)}`}>{r.industryDemand}</span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{r.level}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {breadcrumb.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className={styles.breadcrumb} onClick={() => { setBreadcrumb([]); setChildren([]); }}>
            Root
          </span>
          {breadcrumb.map((b, i) => (
            <span key={b.id} className={styles.breadcrumb} onClick={() => goBack(i + 1)}>
              / {b.name}
            </span>
          ))}
        </div>
      )}

      <div className={styles.taxonomyTree}>
        {children.length > 0
          ? children.map(node => (
              <div className={styles.taxonomyNode} key={node.id} onClick={() => navigateTo(node)}>
                <div className={styles.taxonomyIcon}>📁</div>
                <div className={styles.taxonomyInfo}>
                  <div className={styles.taxonomyName}>{node.name}</div>
                  {node.description && <div className={styles.taxonomyDesc}>{node.description}</div>}
                  <div className={styles.taxonomyMeta}>
                    <span className={`${styles.demandTag} ${demandColor(node.industryDemand)}`}>{node.industryDemand}</span>
                    {node.avgSalaryRange && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>💰 {node.avgSalaryRange}</span>}
                    {node.growthOutlook && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>📈 {node.growthOutlook}</span>}
                  </div>
                </div>
              </div>
            ))
          : roots.map(node => (
              <div className={styles.taxonomyNode} key={node.id} onClick={() => navigateTo(node)}>
                <div className={styles.taxonomyIcon}>📁</div>
                <div className={styles.taxonomyInfo}>
                  <div className={styles.taxonomyName}>{node.name}</div>
                  {node.description && <div className={styles.taxonomyDesc}>{node.description}</div>}
                  <div className={styles.taxonomyMeta}>
                    <span className={`${styles.demandTag} ${demandColor(node.industryDemand)}`}>{node.industryDemand}</span>
                    {node.avgSalaryRange && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>💰 {node.avgSalaryRange}</span>}
                    {node.growthOutlook && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>📈 {node.growthOutlook}</span>}
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {!loading && roots.length === 0 && children.length === 0 && searchResults.length === 0 && (
        <div className={styles.empty}>
          <p>No taxonomy nodes available yet. The skill tree will be populated as the platform grows.</p>
        </div>
      )}
    </div>
  );
}
