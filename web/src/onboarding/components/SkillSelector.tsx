import { useState } from 'react';
import type { SkillEntry } from '../types/onboarding';
import styles from './SkillSelector.module.css';

const SKILL_CATEGORIES = ['Programming', 'Frontend', 'Backend', 'Database', 'Cloud / DevOps', 'Other'];
const PROFICIENCY_LEVELS: SkillEntry['proficiency'][] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

interface Props {
  skills: SkillEntry[];
  onChange: (skills: SkillEntry[]) => void;
}

export function SkillSelector({ skills, onChange }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [proficiency, setProficiency] = useState<SkillEntry['proficiency']>('BEGINNER');

  function addSkill() {
    if (!name.trim()) return;
    if (skills.some(s => s.skillName.toLowerCase() === name.trim().toLowerCase())) return;
    onChange([...skills, { skillName: name.trim(), category, proficiency }]);
    setName('');
    setCategory('');
    setProficiency('BEGINNER');
  }

  function removeSkill(index: number) {
    onChange(skills.filter((_, i) => i !== index));
  }

  return (
    <div className={styles.container}>
      {skills.length > 0 && (
        <div className={styles.skillsList}>
          {skills.map((skill, i) => (
            <div key={i} className={styles.skillRow}>
              <span style={{ color: 'var(--color-text)', fontSize: 'var(--text-sm)' }}>{skill.skillName}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{skill.category || '—'}</span>
              <span style={{ color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)' }}>{skill.proficiency}</span>
              <button type="button" className={styles.removeBtn} onClick={() => removeSkill(i)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.addRow}>
        <input type="text" placeholder="Skill name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Category</option>
          {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={proficiency} onChange={e => setProficiency(e.target.value as SkillEntry['proficiency'])}>
          {PROFICIENCY_LEVELS.map(p => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
        </select>
        <button type="button" className={styles.addBtn} onClick={addSkill}>Add</button>
      </div>
    </div>
  );
}
