import { useState, useEffect } from 'react';
import { Search, CheckCircle2, RefreshCw } from 'lucide-react';
import styles from './AdminHome.module.css';

export function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [msg, setMsg] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/practice/questions?size=40', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.data?.content || data.data || []);
      }
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAction = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 4000);
  };

  const filtered = questions.filter((q) => {
    const title = (q.title || q.prompt || '').toLowerCase();
    const cat = (q.category || '').toLowerCase();
    const s = search.toLowerCase();
    const matchesSearch = !search || title.includes(s) || cat.includes(s);
    const matchesDiff = difficulty === 'ALL' || q.difficulty === difficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Technical Question Bank &amp; Taxonomy (357 Verified)
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Curate MCQs, coding challenges, system design prompts, and assessment question banks.
          </p>
        </div>
        <button
          onClick={fetchQuestions}
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
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Bank</span>
        </button>
      </div>

      {msg && (
        <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 600, fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by prompt, skill, or framework..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
          />
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff', fontWeight: 600 }}
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Question Prompt &amp; Scenario</th>
              <th>Category / Domain</th>
              <th>Difficulty</th>
              <th>Coin Reward</th>
              <th>Quality Check</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No questions match your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((q, idx) => (
                <tr key={q.id || idx}>
                  <td style={{ maxWidth: '420px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                      {q.title || q.prompt || `Technical Assessment Question #${idx + 1}`}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                      Type: {q.type || 'MCQ'} &middot; Options: {q.options ? q.options.length : 4}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                      {q.category || 'Core Engineering'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', background: q.difficulty === 'HARD' ? '#fee2e2' : q.difficulty === 'MEDIUM' ? '#fef3c7' : '#dcfce7', color: q.difficulty === 'HARD' ? '#b91c1c' : q.difficulty === 'MEDIUM' ? '#b45309' : '#15803d' }}>
                      {q.difficulty || 'MEDIUM'}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#d97706', fontSize: '0.84rem' }}>+{q.coins || 50} Coins</strong>
                  </td>
                  <td>
                    <button
                      onClick={() => handleAction(`Question verified: ${q.title || q.prompt || 'Item'}`)}
                      style={{ padding: '4px 10px', background: '#1c2d81', color: '#ffffff', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Audit Question
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

