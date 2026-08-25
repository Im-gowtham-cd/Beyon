import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import styles from './AuthInput.module.css';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className={styles.group}>
        <label className={styles.label} htmlFor={props.id}>
          {label}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            style={{ paddingRight: '44px' }}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              padding: '4px',
            }}
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
        {error && (
          <span className={styles.error} id={`${props.id}-error`} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
