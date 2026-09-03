import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle2, ShieldCheck, RefreshCw, MapPin, XCircle, Check, AlertCircle } from 'lucide-react';
import styles from './AdminHome.module.css';

export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'>('ALL');
  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleApprove = async (userId: string, name: string) => {
    if (!userId) return;
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/admin/verifications/company/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ notes: 'Verified corporate employer credentials by Super Admin' }),
      });
      if (res.ok) {
        setMsg({ text: `Corporate partner "${name}" has been authorized and activated.` });
        await fetchCompanies();
      } else {
        setMsg({ text: `Failed to authorize "${name}".`, isError: true });
      }
    } catch {
      setMsg({ text: `Network error while approving "${name}".`, isError: true });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(null), 5000);
    }
  };

  const handleReject = async (userId: string, name: string) => {
    if (!userId) return;
    const reason = window.prompt(`Enter rejection reason for ${name}:`, 'Corporate credentials did not meet verification criteria');
    if (reason === null) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/admin/verifications/company/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setMsg({ text: `Corporate registration for "${name}" has been rejected.` });
        await fetchCompanies();
      } else {
        setMsg({ text: `Failed to reject "${name}".`, isError: true });
      }
    } catch {
      setMsg({ text: `Network error while rejecting "${name}".`, isError: true });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(null), 5000);
    }
  };

  const pendingCount = companies.filter(
    (c) => c.status === 'PENDING_SUPER_ADMIN_VERIFICATION' || c.status === 'PENDING_VERIFICATION' || c.status === 'PENDING'
  ).length;

  const filtered = companies.filter((c) => {
    const name = (c.name || '').toLowerCase();
    const ind = (c.industry || '').toLowerCase();
    const status = (c.status || '').toUpperCase();
    const s = search.toLowerCase();
    const matchesSearch = !search || name.includes(s) || ind.includes(s);

    if (!matchesSearch) return false;
    if (tab === 'PENDING') return status.includes('PENDING');
    if (tab === 'ACTIVE') return status === 'ACTIVE';
    if (tab === 'REJECTED') return status === 'REJECTED';
    return true;
  });

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Corporate Recruiter Ecosystem &amp; Verification
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Super Admin command for reviewing corporate credentials, approving employer registrations, and authorizing candidate access.
          </p>
        </div>
        <button
          onClick={fetchCompanies}
          disabled={loading}
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
          <RefreshCw size={14} className={loading ? styles.spin : ''} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {msg && (
        <div
          style={{
            padding: '12px 18px',
            background: msg.isError ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${msg.isError ? '#fecaca' : '#bbf7d0'}`,
            color: msg.isError ? '#b91c1c' : '#166534',
            fontWeight: 600,
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {msg.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setTab('ALL')}
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: tab === 'ALL' ? '#1c2d81' : '#ffffff',
            color: tab === 'ALL' ? '#fed601' : '#475569',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
          }}
        >
          All Companies ({companies.length})
        </button>
        <button
          onClick={() => setTab('PENDING')}
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: tab === 'PENDING' ? '#b45309' : '#fffbeb',
            color: tab === 'PENDING' ? '#ffffff' : '#92400e',
            border: '1px solid #fde68a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Pending Super Admin Review</span>
          <span style={{ background: tab === 'PENDING' ? '#ffffff' : '#b45309', color: tab === 'PENDING' ? '#b45309' : '#ffffff', padding: '1px 6px', fontSize: '0.74rem', borderRadius: '10px' }}>
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setTab('ACTIVE')}
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: tab === 'ACTIVE' ? '#15803d' : '#ffffff',
            color: tab === 'ACTIVE' ? '#ffffff' : '#475569',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
          }}
        >
          Active Approved
        </button>
        <button
          onClick={() => setTab('REJECTED')}
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: tab === 'REJECTED' ? '#b91c1c' : '#ffffff',
            color: tab === 'REJECTED' ? '#ffffff' : '#475569',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
          }}
        >
          Rejected
        </button>
      </div>

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
              <th>Account Status</th>
              <th>Super Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No corporate profiles found matching the filter.
                </td>
              </tr>
            ) : (
              filtered.map((comp) => {
                const isPending = (comp.status || '').includes('PENDING');
                const isActive = comp.status === 'ACTIVE';
                const isRejected = comp.status === 'REJECTED';

                return (
                  <tr key={comp.id} style={{ background: isPending ? '#fffdf7' : undefined }}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#1c2d81' }}>{comp.name || 'Enterprise Employer'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={12} />
                        <span>{comp.city || 'Headquarters'}, {comp.state || 'State'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                        {comp.industry || 'Technology & Software'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {comp.size ? `${comp.size} employees` : 'Enterprise'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff' }}>
                        {comp.tier || 'Enterprise Partner'}
                      </span>
                    </td>
                    <td>
                      {isPending && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                          PENDING VERIFICATION
                        </span>
                      )}
                      {isActive && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                          ACTIVE VERIFIED
                        </span>
                      )}
                      {isRejected && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                          REJECTED
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleApprove(comp.userId, comp.name)}
                              disabled={actionLoading === comp.userId}
                              style={{
                                padding: '5px 10px',
                                background: '#15803d',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Check size={12} />
                              <span>Authorize</span>
                            </button>
                            <button
                              onClick={() => handleReject(comp.userId, comp.name)}
                              disabled={actionLoading === comp.userId}
                              style={{
                                padding: '5px 10px',
                                background: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <XCircle size={12} />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : isActive ? (
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={14} /> Authorized
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApprove(comp.userId, comp.name)}
                            style={{ padding: '4px 8px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.72rem', cursor: 'pointer' }}
                          >
                            Re-authorize
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

