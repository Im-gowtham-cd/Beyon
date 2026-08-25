import styles from './FormField.module.css';

interface Props {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
  as?: 'input' | 'textarea';
  disabled?: boolean;
  hint?: string;
}

export function FormField({ id, label, type = 'text', placeholder, value, onChange, error, required, as = 'input', disabled, hint }: Props) {
  const cls = `${styles.input} ${error ? styles.inputError : ''} ${as === 'textarea' ? styles.textarea : ''}`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea id={id} className={cls} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} />
      ) : (
        <input id={id} type={type} className={cls} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} />
      )}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.errorText} role="alert">{error}</span>}
    </div>
  );
}
