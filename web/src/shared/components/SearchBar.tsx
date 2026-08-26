import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../services/api/client';
import styles from './SearchBar.module.css';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  score: number;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const t = await api.get<SearchResult[]>('/search/trending?limit=5');
      setTrending(t);
    } catch { /* */ }
  }, []);

  useEffect(() => {
    if (open && trending.length === 0) fetchTrending();
  }, [open, trending.length, fetchTrending]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await api.get<SearchResult[]>(`/search?q=${encodeURIComponent(query)}&limit=10`);
        setResults(r);
      } catch { /* */ }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const typeIcons: Record<string, string> = {
    STUDENT: '👤', COMPANY: '🏢', INSTITUTION: '🎓', JOB: '💼',
    OPPORTUNITY: '🎯', CHALLENGE: '🏆', EVENT: '📅', QUESTION: '❓',
    SKILL: '⚡', POST: '📝',
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Search Beyon..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {loading && <span className={styles.loading}>⏳</span>}
      </div>

      {open && (
        <div className={styles.dropdown}>
          {query.length < 2 && trending.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Trending</span>
              {trending.map(t => (
                <div key={t.id} className={styles.resultItem}>
                  <span className={styles.resultIcon}>{typeIcons[t.type] || '📌'}</span>
                  <div className={styles.resultInfo}>
                    <span className={styles.resultTitle}>{t.title}</span>
                    <span className={styles.resultType}>{t.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {query.length >= 2 && results.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Results</span>
              {results.map(r => (
                <div key={r.id} className={styles.resultItem}>
                  <span className={styles.resultIcon}>{typeIcons[r.type] || '📌'}</span>
                  <div className={styles.resultInfo}>
                    <span className={styles.resultTitle}>{r.title}</span>
                    {r.description && <span className={styles.resultDesc}>{r.description.slice(0, 80)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {query.length >= 2 && results.length === 0 && !loading && (
            <div className={styles.empty}>No results for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}
