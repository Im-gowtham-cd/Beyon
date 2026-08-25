import type { UserRole } from '../types/auth';
import styles from './RoleCard.module.css';

interface RoleCardProps {
  role: Exclude<UserRole, 'ADMIN'>;
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: (role: Exclude<UserRole, 'ADMIN'>) => void;
}

export function RoleCard({ role, icon, title, description, selected, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={() => onSelect(role)}
      aria-pressed={selected}
    >
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </button>
  );
}
