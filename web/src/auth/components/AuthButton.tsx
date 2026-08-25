import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './AuthButton.module.css';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

export function AuthButton({ loading, variant = 'primary', children, disabled, ...props }: AuthButtonProps) {
  return (
    <button
      className={`${styles.button} ${variant === 'secondary' ? styles.secondary : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}
