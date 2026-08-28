import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './CreateQuestionPage.module.css';

interface SkillOption {
  id: string;
  name: string;
  slug: string;
}

export function CreateQuestionPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [skillId, setSkillId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionType, setQuestionType] = useState<'MCQ' | 'SQL' | 'CODING'>('MCQ');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [explanation, setExplanation] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [codeTemplate, setCodeTemplate] = useState('');

  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  const [loading, setLoading] = useState(false);
  const [createdQuestionId, setCreatedQuestionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadSkills() {
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const res = await fetch('/api/v1/taxonomy/skills', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          setSkills(list);
          if (list.length > 0) setSkillId(list[0].id);
        }
      } catch {
        /* fallback */
      }
    }
    loadSkills();
  }, []);

  function handleOptionChange(index: number, val: string) {
    const updated = [...options];
    updated[index].text = val;
    setOptions(updated);
  }

  function handleSetCorrect(index: number) {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(updated);
  }

  function handleAddOption() {
    if (options.length < 6) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  }

  function handleRemoveOption(index: number) {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== index);
      if (!updated.some(o => o.isCorrect)) updated[0].isCorrect = true;
      setOptions(updated);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide both question title and description.');
      return;
    }

    if (questionType === 'MCQ') {
      const validOpts = options.filter(o => o.text.trim().length > 0);
      if (validOpts.length < 2) {
        setErrorMsg('Please provide at least 2 non-empty option choices for MCQ.');
        return;
      }
      if (!options.some(o => o.isCorrect)) {
        setErrorMsg('Please select which option is the correct answer.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const payload = {
        skillId: skillId || null,
        title: title.trim(),
        description: description.trim(),
        questionType,
        difficulty,
        explanation: explanation.trim() || null,
        expectedOutput: questionType === 'SQL' ? expectedOutput.trim() : null,
        codeTemplate: questionType === 'CODING' ? codeTemplate.trim() : null,
        options: questionType === 'MCQ'
          ? options.map(o => ({ optionText: o.text.trim(), isCorrect: o.isCorrect }))
          : [],
      };

      const res = await fetch('/api/v1/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save question to database');
      }

      const resData = await res.json();
      const savedId = resData.data?.id;
      setCreatedQuestionId(savedId || 'saved');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <Link to="/practice" className={styles.backLink}>
            <i className="bx bx-arrow-back" /> Back to Practice Arena
          </Link>
          <h1 className={styles.pageTitle}>Create Question &amp; Seed Database</h1>
          <p className={styles.pageSubtitle}>
            Add technical computer science, database, or algorithmic questions directly to the platform database.
          </p>
        </div>
      </div>

      {createdQuestionId ? (
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <i className="bx bx-check" />
          </div>
          <h2 className={styles.successTitle}>Question Saved to Database Successfully!</h2>
          <p className={styles.successDesc}>
            Your question is now published in the Question Bank and live in the Practice Arena.
          </p>
          <div className={styles.successActions}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => navigate(`/practice/${createdQuestionId}`)}
            >
              <i className="bx bx-play-circle" /> Test &amp; Solve Now
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setCreatedQuestionId(null);
                setTitle('');
                setDescription('');
                setExplanation('');
                setOptions([
                  { text: '', isCorrect: true },
                  { text: '', isCorrect: false },
                  { text: '', isCorrect: false },
                  { text: '', isCorrect: false },
                ]);
              }}
            >
              <i className="bx bx-plus" /> Create Another Question
            </button>
            <Link to="/practice" className={styles.btnOutline}>
              Go to Practice Arena
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.formLayout}>
          {errorMsg && (
            <div className={styles.errorBanner}>
              <i className="bx bx-error-circle" /> {errorMsg}
            </div>
          )}

          {/* Core Metadata */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>1. Question Metadata</h3>
            
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Skill / Domain</label>
                <select
                  className={styles.select}
                  value={skillId}
                  onChange={e => setSkillId(e.target.value)}
                >
                  {skills.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                  {skills.length === 0 && <option value="">General Computer Science</option>}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Question Type</label>
                <select
                  className={styles.select}
                  value={questionType}
                  onChange={e => setQuestionType(e.target.value as any)}
                >
                  <option value="MCQ">Multiple Choice Question (MCQ)</option>
                  <option value="SQL">Database Query (SQL)</option>
                  <option value="CODING">Programming / Algorithm (Coding)</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Difficulty Level</label>
                <select
                  className={styles.select}
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                >
                  <option value="EASY">Easy (Foundational)</option>
                  <option value="MEDIUM">Medium (Intermediate)</option>
                  <option value="HARD">Hard (Advanced / Expert)</option>
                </select>
              </div>
            </div>

            <div className={styles.fieldGroup} style={{ marginTop: '16px' }}>
              <label className={styles.label}>Question Title / Short Summary *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. TCP Three-Way Handshake Connection Sequence"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldGroup} style={{ marginTop: '16px' }}>
              <label className={styles.label}>Full Problem Statement / Description *</label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Write the complete question description, scenario, or code snippet..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Options Section for MCQ */}
          {questionType === 'MCQ' && (
            <div className={styles.card}>
              <div className={styles.cardHeaderWithAction}>
                <div>
                  <h3 className={styles.cardTitle}>2. Answer Choices &amp; Correct Key</h3>
                  <p className={styles.cardSubtitle}>
                    Enter option choices and select the radio button for the correct answer.
                  </p>
                </div>
                {options.length < 6 && (
                  <button
                    type="button"
                    className={styles.addOptBtn}
                    onClick={handleAddOption}
                  >
                    + Add Choice
                  </button>
                )}
              </div>

              <div className={styles.optionsStack}>
                {options.map((opt, idx) => (
                  <div key={idx} className={`${styles.optionRow} ${opt.isCorrect ? styles.optionRowCorrect : ''}`}>
                    <label className={styles.radioLabel} title="Mark as correct answer">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={opt.isCorrect}
                        onChange={() => handleSetCorrect(idx)}
                      />
                      <span className={styles.optionLetterBadge}>{String.fromCharCode(65 + idx)}</span>
                    </label>
                    <input
                      type="text"
                      className={styles.optionInput}
                      placeholder={`Choice ${String.fromCharCode(65 + idx)} description...`}
                      value={opt.text}
                      onChange={e => handleOptionChange(idx, e.target.value)}
                      required
                    />
                    {opt.isCorrect && (
                      <span className={styles.correctTag}>
                        <i className="bx bx-check" style={{ marginRight: '3px' }} />
                        Correct Key
                      </span>
                    )}
                    {options.length > 2 && (
                      <button
                        type="button"
                        className={styles.removeOptBtn}
                        onClick={() => handleRemoveOption(idx)}
                        title="Remove choice"
                      >
                        <i className="bx bx-trash" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SQL / Coding specific fields */}
          {questionType === 'SQL' && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>2. Expected SQL Query</h3>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Standard Solution SQL Query</label>
                <textarea
                  className={styles.textareaCode}
                  rows={4}
                  placeholder="SELECT department_id, COUNT(*) FROM employees GROUP BY department_id;"
                  value={expectedOutput}
                  onChange={e => setExpectedOutput(e.target.value)}
                />
              </div>
            </div>
          )}

          {questionType === 'CODING' && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>2. Starter Code Template</h3>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Function Signature / Starter Template</label>
                <textarea
                  className={styles.textareaCode}
                  rows={6}
                  placeholder="function solve(input: number[]): number {\n  // your code here\n}"
                  value={codeTemplate}
                  onChange={e => setCodeTemplate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Solution & Explanation */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>3. Explanation &amp; Solution Rationale</h3>
            <p className={styles.cardSubtitle}>
              Help students understand why the answer is correct with detailed rationale.
            </p>
            <div className={styles.fieldGroup} style={{ marginTop: '12px' }}>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="e.g. TCP connection initialization requires a 3-way handshake where SYN synchronizes sequence numbers, SYN-ACK acknowledges and replies, and final ACK confirms..."
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className={styles.formFooter}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading}
            >
              <i className="bx bx-save" />
              <span>{loading ? 'Saving to Database...' : 'Save Question to Database'}</span>
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => navigate('/practice')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
