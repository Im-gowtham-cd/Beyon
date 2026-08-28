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

  // Combine standard options and custom selected options
  const allDisplayOptions = Array.from(new Set([...options, ...selected]));

  return (
    <div className={styles.field} id={id}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <div className={styles.chipsContainer}>
        {allDisplayOptions.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
              onClick={() => toggle(opt)}
            >
              <span className={styles.chipCheck}>{isSelected ? '✓' : '+'}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {allowCustom && (
        <div className={styles.customRow}>
          <input
            type="text"
            className={styles.customInput}
            value={customValue}
            onChange={e => setCustomValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Type other role / industry and press Add..."
          />
          <button type="button" className={styles.addCustomBtn} onClick={addCustom}>
            + Add Option
          </button>
        </div>
      )}

      {error && <span className={styles.errorText} role="alert">{error}</span>}
    </div>
  );
}
