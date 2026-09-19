import { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

interface Manager {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export function AdminInstitutionManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createdCreds, setCreatedCreds] = useState<any>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/admin/verifications/institution-managers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setManagers(json.data || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/admin/verifications/institution-managers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        setCreatedCreds(json.data);
        setMsg({ type: 'success', text: 'Institution Manager account created successfully!' });
        fetchManagers();
      } else {
        setMsg({ type: 'error', text: json.message || 'Failed to create Institution Manager.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error creating manager.' });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Users size={26} color="#1c2d81" />
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Authorized Institution Managers
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Super Admin management of platform representatives authorized to onboard colleges, validate AICTE credentials, and dispatch Principal OTPs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setShowModal(true); setCreatedCreds(null); }}
          style={{
            padding: '9px 16px',
            background: '#1c2d81',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <UserPlus size={16} />
          <span>Add Institution Manager</span>
        </button>
      </div>

      {msg && (
        <div
          style={{
            background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: msg.type === 'success' ? '#166534' : '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
          }}
        >
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '10px 14px' }}>Name</th>
              <th style={{ padding: '10px 14px' }}>Email</th>
              <th style={{ padding: '10px 14px' }}>Status</th>
              <th style={{ padding: '10px 14px' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Loading authorized managers...
                </td>
              </tr>
            ) : managers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No Institution Managers registered. Add one using the button above.
                </td>
              </tr>
            ) : (
              managers.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>{m.name}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{m.email}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: m.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                        color: m.status === 'ACTIVE' ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1.75rem', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
              Create Institution Manager Account
            </h3>
            {createdCreds ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={24} color="#16a34a" style={{ marginBottom: '6px' }} />
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>Manager Account Ready!</div>
                <div style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '6px' }}>
                  Email: <strong>{createdCreds.email}</strong><br />
                  Temporary Password: <strong>{createdCreds.tempPassword}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ marginTop: '12px', padding: '8px 16px', background: '#1c2d81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Temporary Password (Optional)</label>
                  <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Default: Manager@2026!" style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 2, padding: '9px', borderRadius: '6px', border: 'none', background: '#1c2d81', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Account</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
