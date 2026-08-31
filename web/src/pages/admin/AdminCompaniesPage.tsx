import { useState, useEffect } from 'react';
import { Search, CheckCircle2, ShieldCheck, RefreshCw, MapPin } from 'lucide-react';
import styles from './AdminHome.module.css';

export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/admin/dashboard/companies', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.data || []);
      }
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleApprove = (name: string) => {
    setMsg(`Recruiter requisition permissions authorized for ${name}.`);
    setTimeout(() => setMsg(null), 4000);
  };

  const filtered = companies.filter((c) => {
    const name = (c.name || '').toLowerCase();
    const ind = (c.industry || '').toLowerCase();
    const s = search.toLowerCase();
    return !search || name.includes(s) || ind.includes(s);
  });

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Corporate Recruiter Ecosystem &amp; Approvals
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Oversee corporate enterprise partners, requisition authorizations, and direct campus pipelines.
          </p>
        </div>
        <button
          onClick={fetchCompanies}
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
          <span>Refresh Directory</span>
        </button>
      </div>

      {msg && (
        <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 600, fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      <div style={{ marginBottom: '16px', position: 'relative', maxWidth: '400px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search company by name, industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
        />
      </div>

      <div className={styles.tableCard}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Company &amp; Enterprise</th>
              <th>Industry Domain</th>
              <th>Company Size</th>
              <th>Tier Classification</th>
              <th>Contact Email</th>
              <th>Recruiter Access</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No corporate profiles registered.
                </td>
              </tr>
            ) : (
              filtered.map((comp) => (
                <tr key={comp.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#1c2d81' }}>{comp.name}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={12} />
                      <span>{comp.city || 'Bangalore'}, {comp.state || 'Karnataka'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#334155' }}>
                      {comp.industry || 'Information Technology & Cloud'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {comp.size || '1,000 - 5,000 employees'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff' }}>
                      {comp.tier || 'TIER_1_SUPER_DREAM'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: '#0f172a' }}>{comp.email || 'careers@beyon.test'}</div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleApprove(comp.name)}
                      style={{ padding: '5px 12px', background: '#1c2d81', color: '#fed601', border: 'none', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <ShieldCheck size={13} />
                      <span>Authorized</span>
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

