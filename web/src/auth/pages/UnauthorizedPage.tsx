import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { AuthButton } from '../components/AuthButton';
import { useAuth } from '../context/AuthContext';

export function UnauthorizedPage() {
  const { user } = useAuth();

  const dashboardPath = user ? `/${user.role.toLowerCase()}/home` : '/';

  return (
    <AuthLayout>
      <AuthCard
        title="Access denied"
        subtitle="You don't have permission to access this area."
      >
        <div style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>🔒</div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xl)' }}>
            If you believe this is a mistake, please contact your administrator.
          </p>
          <Link to={dashboardPath} style={{ textDecoration: 'none' }}>
            <AuthButton variant="secondary">
              Go to Dashboard
            </AuthButton>
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
