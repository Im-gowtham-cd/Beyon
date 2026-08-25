import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './AuthInput.module.css';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={styles.group}>
        <label className={styles.label} htmlFor={props.id}>
          {label}
        </label>
        <input
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <span className={styles.error} id={`${props.id}-error`} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
