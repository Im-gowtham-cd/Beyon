import { useState } from 'react';
import type { SkillEntry } from '../types/onboarding';
import styles from './SkillSelector.module.css';

const SKILL_CATEGORIES = ['Programming', 'Frontend', 'Backend', 'Database', 'Cloud / DevOps', 'AI / ML', 'System Design', 'Other'];
const PROFICIENCY_LEVELS: SkillEntry['proficiency'][] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

interface Props {
  skills: SkillEntry[];
  onChange: (skills: SkillEntry[]) => void;
}

export function SkillSelector({ skills, onChange }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [proficiency, setProficiency] = useState<SkillEntry['proficiency']>('INTERMEDIATE');

  function addSkill() {
    if (!name.trim()) return;
    if (skills.some(s => s.skillName.toLowerCase() === name.trim().toLowerCase())) return;
    onChange([...skills, { skillName: name.trim(), category: category || 'General', proficiency }]);
    setName('');
    setCategory('');
    setProficiency('INTERMEDIATE');
  }

  function removeSkill(index: number) {
    onChange(skills.filter((_, i) => i !== index));
  }

  const profColors: Record<string, { bg: string; text: string }> = {
    BEGINNER: { bg: '#eff6ff', text: '#1d4ed8' },
    INTERMEDIATE: { bg: '#f0fdf4', text: '#15803d' },
    ADVANCED: { bg: '#fef3c7', text: '#b45309' },
    EXPERT: { bg: '#fdf2f8', text: '#be185d' },
  };

  return (
    <div className={styles.container}>
      {skills.length > 0 && (
        <div className={styles.skillsGrid}>
          {skills.map((skill, i) => {
            const pStyle = profColors[skill.proficiency] || { bg: '#f1f5f9', text: '#475569' };
            return (
              <div key={i} className={styles.skillCard}>
                <div className={styles.skillCardInfo}>
                  <span className={styles.skillCardName}>{skill.skillName}</span>
                  <div className={styles.skillCardMeta}>
                    <span className={styles.categoryPill}>{skill.category || 'General'}</span>
                    <span
                      className={styles.profPill}
                      style={{ background: pStyle.bg, color: pStyle.text }}
                    >
                      {skill.proficiency}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeSkill(i)}
                  title="Remove skill"
                >
                  <i className="bx bx-trash" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.addCard}>
        <div className={styles.addCardTitle}>+ Add Technical Skill</div>
        <div className={styles.addInputsGrid}>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. Python, React, PostgreSQL, Docker..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
          />
          <select
            className={styles.select}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {SKILL_CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={proficiency}
            onChange={e => setProficiency(e.target.value as SkillEntry['proficiency'])}
          >
            {PROFICIENCY_LEVELS.map(p => (
              <option key={p} value={p}>
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button type="button" className={styles.addBtn} onClick={addSkill}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
