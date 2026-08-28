import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { RoleCard } from '../components/RoleCard';
import { AuthButton } from '../components/AuthButton';
import type { UserRole } from '../types/auth';

type SelectableRole = Exclude<UserRole, 'ADMIN'>;

const ROLE_ROUTES: Record<SelectableRole, string> = {
  STUDENT: '/student/home',
  INSTITUTION: '/institution/home',
  COMPANY: '/company/home',
};

export function RoleSelectPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<SelectableRole | null>(null);

  function handleContinue() {
    if (role) navigate(ROLE_ROUTES[role]);
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Choose your path"
        subtitle="Select your role to continue"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <RoleCard
            role="STUDENT"
            icon="bx bx-graduation"
            title="Student"
            description="Build verified skills, earn Beyon Coins, and unlock enterprise career drives."
            selected={role === 'STUDENT'}
            onSelect={setRole}
          />
          <RoleCard
            role="INSTITUTION"
            icon="bx bx-buildings"
            title="Institution"
            description="Develop talent ecosystems, track student readiness metrics, and connect with recruiters."
            selected={role === 'INSTITUTION'}
            onSelect={setRole}
          />
          <RoleCard
            role="COMPANY"
            icon="bx bx-briefcase-alt-2"
            title="Company"
            description="Find pre-assessed engineering talent and run proctored recruitment drives."
            selected={role === 'COMPANY'}
            onSelect={setRole}
          />
        </div>

        <AuthButton onClick={handleContinue} disabled={!role}>
          Continue
        </AuthButton>
      </AuthCard>
    </AuthLayout>
  );
}
