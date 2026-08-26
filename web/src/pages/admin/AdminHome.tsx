import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AdminHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 700, fontSize: '1.75rem', color: '#0a0a0f', marginBottom: '0.25rem' }}>
        Welcome back, {user?.name?.split(' ')[0]}.
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Admin control center</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <button onClick={() => navigate('/admin/dashboard')} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
          <div style={{ fontWeight: 600, color: '#0a0a0f' }}>Dashboard</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Platform overview</div>
        </button>
        <button onClick={() => navigate('/admin/feedback')} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💬</div>
          <div style={{ fontWeight: 600, color: '#0a0a0f' }}>Feedback</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Manage reports</div>
        </button>
        <button onClick={() => navigate('/admin/reports')} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
          <div style={{ fontWeight: 600, color: '#0a0a0f' }}>Reports</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Generate reports</div>
        </button>
        <button onClick={() => navigate('/admin/moderation')} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛡️</div>
          <div style={{ fontWeight: 600, color: '#0a0a0f' }}>Moderation</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Content review</div>
        </button>
      </div>
    </div>
  );
}
