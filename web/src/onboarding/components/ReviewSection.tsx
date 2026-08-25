import { useState } from 'react';
import styles from './ReviewSection.module.css';

interface ReviewRow {
  label: string;
  value: string | number | undefined;
}

interface Props {
  title: string;
  rows: ReviewRow[];
  onEdit: () => void;
}

export function ReviewSection({ title, rows, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.section}>
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>{title}</span>
          <span className={styles.badge}>✓</span>
        </div>
        <button type="button" className={styles.editBtn} onClick={e => { e.stopPropagation(); onEdit(); }}>Edit</button>
      </div>
      {expanded && (
        <div className={styles.body}>
          {rows.filter(r => r.value !== undefined && r.value !== '' && r.value !== null).map((row, i) => (
            <div key={i} className={styles.row}>
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={styles.rowValue}>{String(row.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
