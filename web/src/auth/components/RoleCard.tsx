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
  const isIconClass = icon.includes('bx') || icon.includes('fa-');
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={() => onSelect(role)}
      aria-pressed={selected}
    >
      <div className={styles.icon}>
        {isIconClass ? <i className={icon} style={{ fontSize: '1.5rem', color: '#1c2d81' }} /> : icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </button>
  );
}
