import { useAuth } from '../../auth/context/AuthContext';

export function StudentHome() {
  const { user } = useAuth();

  return (
    <div style={{ padding: 'var(--space-2xl)', maxWidth: 'var(--max-content)', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-3xl)', color: 'var(--color-text)', marginBottom: 'var(--space-md)' }}>
        Welcome back, {user?.name?.split(' ')[0]}.
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>
        Your Student workspace will appear here.
      </p>
    </div>
  );
}
