import { useState } from 'react';
import styles from './MultiSelect.module.css';

interface Props {
  id: string;
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  required?: boolean;
  error?: string;
  allowCustom?: boolean;
}

export function MultiSelect({ id, label, options, selected, onChange, required, error, allowCustom }: Props) {
  const [customValue, setCustomValue] = useState('');

  function toggle(val: string) {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val));
    } else {
      onChange([...selected, val]);
    }
  }

  function addCustom() {
    const trimmed = customValue.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setCustomValue('');
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.options} id={id}>
        {options.map(opt => (
          <button key={opt} type="button" className={`${styles.option} ${selected.includes(opt) ? styles.selected : ''}`} onClick={() => toggle(opt)}>
            {opt}
          </button>
        ))}
      </div>
      {allowCustom && (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
          <input
            type="text"
            value={customValue}
            onChange={e => setCustomValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            placeholder="Add custom..."
            style={{ flex: 1, padding: '8px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 'var(--text-sm)' }}
          />
          <button type="button" onClick={addCustom} style={{ padding: '8px 16px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            Add
          </button>
        </div>
      )}
      {selected.length > 0 && (
        <div className={styles.options}>
          {selected.map(val => (
            <button key={val} type="button" className={`${styles.option} ${styles.selected}`} onClick={() => toggle(val)}>
              {val} ✕
            </button>
          ))}
        </div>
      )}
      {error && <span className={styles.errorText} role="alert">{error}</span>}
    </div>
  );
}
