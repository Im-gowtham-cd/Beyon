import styles from './SelectField.module.css';

interface Option {
  value: string;
  label: string;
}

interface Props {
  id: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export function SelectField({ id, label, options, value, onChange, error, required, placeholder }: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <select id={id} className={`${styles.select} ${error ? styles.selectError : ''}`} value={value} onChange={e => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className={styles.errorText} role="alert">{error}</span>}
    </div>
  );
}
