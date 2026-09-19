import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { getRoleTier } from '../../auth/types/auth';
import styles from './CreateQuestionPage.module.css';

interface SkillOption {
  id: string;
  name: string;
  slug: string;
}

type QuestionFormat = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'SQL' | 'CODING';

export function CreateQuestionPage() {
  const navigate = useNavigate();
  const { id: editQuestionId } = useParams();
  const isEditMode = Boolean(editQuestionId);
  const { user } = useAuth();
  const isAdminTier = getRoleTier(user?.role || '') === 'SUPER_ADMIN';

  const [searchParams] = useSearchParams();
  const preselectedSkillId = searchParams.get('skillId');

  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [skillId, setSkillId] = useState(preselectedSkillId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionFormat, setQuestionFormat] = useState<QuestionFormat>('SINGLE_CHOICE');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [explanation, setExplanation] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [codeTemplate, setCodeTemplate] = useState('');

  const [options, setOptions] = useState([
    { text: '', isCorrect: true, explanation: '' },
    { text: '', isCorrect: false, explanation: '' },
    { text: '', isCorrect: false, explanation: '' },
    { text: '', isCorrect: false, explanation: '' },
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
          const list: SkillOption[] = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          setSkills(list);
          if (list.length > 0 && !editQuestionId) {
            if (preselectedSkillId && list.some((s: SkillOption) => s.id === preselectedSkillId)) {
              setSkillId(preselectedSkillId);
            } else if (!skillId) {
              setSkillId(list[0].id);
            }
          }
        }
      } catch {

      }
    }
    loadSkills();
  }, [editQuestionId, preselectedSkillId]);

  useEffect(() => {
    if (!editQuestionId) return;
    async function loadQuestionForEdit() {
      setLoading(true);
      try {
        const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const [qRes, optRes] = await Promise.all([
          fetch(`/api/v1/questions/${editQuestionId}`, { headers }),
          fetch(`/api/v1/questions/${editQuestionId}/options`, { headers }),
        ]);

        if (qRes.ok) {
          const qData = await qRes.json();
          const q = qData.data;
          if (q) {
            setTitle(q.title || '');
            setDescription(q.description || '');
            const rawType = (q.questionType || '').toUpperCase();
            if (rawType === 'MULTI_CHOICE' || rawType === 'MULTIPLE_SELECT') {
              setQuestionFormat('MULTI_CHOICE');
            } else if (rawType === 'SQL') {
              setQuestionFormat('SQL');
            } else if (rawType === 'CODING') {
              setQuestionFormat('CODING');
            } else {
              setQuestionFormat('SINGLE_CHOICE');
            }
            if (q.difficulty) setDifficulty(q.difficulty);
            if (q.explanation) setExplanation(q.explanation);
            if (q.expectedOutput) setExpectedOutput(q.expectedOutput);
            if (q.codeTemplate) setCodeTemplate(q.codeTemplate);
            if (q.skillId) setSkillId(q.skillId);
          }
        }

        if (optRes.ok) {
          const optData = await optRes.json();
          const optList = optData.data;
          if (Array.isArray(optList) && optList.length > 0) {
            setOptions(
              optList.map((o: any) => ({
                text: o.optionText || '',
                isCorrect: Boolean(o.correct || o.isCorrect),
                explanation: o.explanation || '',
              }))
            );
          }
        }
      } catch {
        setErrorMsg('Failed to load question details for editing.');
      } finally {
        setLoading(false);
      }
    }
    loadQuestionForEdit();
  }, [editQuestionId]);

  function handleOptionTextChange(index: number, val: string) {
    const updated = [...options];
    updated[index].text = val;
    setOptions(updated);
  }

  function handleOptionExplanationChange(index: number, val: string) {
    const updated = [...options];
    updated[index].explanation = val;
    setOptions(updated);
  }

  function handleSelectSingleCorrect(index: number) {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(updated);
  }

  function handleToggleMultiCorrect(index: number) {
    const updated = [...options];
    updated[index].isCorrect = !updated[index].isCorrect;
    setOptions(updated);
  }

  function handleFormatChange(newFormat: QuestionFormat) {
    setQuestionFormat(newFormat);
    if (newFormat === 'SINGLE_CHOICE') {
      let foundOne = false;
      const updated = options.map(opt => {
        if (opt.isCorrect && !foundOne) {
          foundOne = true;
          return { ...opt, isCorrect: true };
        }
        return { ...opt, isCorrect: false };
      });
      if (!foundOne && updated.length > 0) updated[0].isCorrect = true;
      setOptions(updated);
    }
  }

  function handleAddOption() {
    if (options.length < 8) {
      setOptions([...options, { text: '', isCorrect: false, explanation: '' }]);
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

    const isOptionBased = questionFormat === 'SINGLE_CHOICE' || questionFormat === 'MULTI_CHOICE';

    if (isOptionBased) {
      const validOpts = options.filter(o => o.text.trim().length > 0);
      if (validOpts.length < 2) {
        setErrorMsg('Please provide at least 2 non-empty option choices.');
        return;
      }
      const correctCount = options.filter(o => o.isCorrect).length;
      if (correctCount === 0) {
        setErrorMsg('Please mark at least one option choice as the correct key.');
        return;
      }
      if (questionFormat === 'SINGLE_CHOICE' && correctCount > 1) {
        setErrorMsg('Single choice questions must have exactly one correct answer choice.');
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
        questionType: questionFormat,
        difficulty,
        explanation: explanation.trim() || null,
        expectedOutput: questionFormat === 'SQL' ? expectedOutput.trim() : null,
        codeTemplate: questionFormat === 'CODING' ? codeTemplate.trim() : null,
        options: isOptionBased
          ? options.map(o => ({
              optionText: o.text.trim(),
              isCorrect: o.isCorrect,
              explanation: o.explanation?.trim() || null,
            }))
          : [],
      };

      const endpoint = isEditMode ? `/api/v1/questions/${editQuestionId}` : '/api/v1/questions';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || (isEditMode ? 'Failed to update question in database' : 'Failed to save question to database'));
      }

      const resData = await res.json();
      const savedId = resData.data?.id || editQuestionId;
      setCreatedQuestionId(savedId || 'saved');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  }

  const isOptionBased = questionFormat === 'SINGLE_CHOICE' || questionFormat === 'MULTI_CHOICE';
  const correctOptionsCount = options.filter(o => o.isCorrect).length;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          {isAdminTier ? (
            <Link to="/admin/questions" className={styles.backLink}>
              <i className="bx bx-arrow-back" /> Back to Question Bank
            </Link>
          ) : (
            <Link to="/practice" className={styles.backLink}>
              <i className="bx bx-arrow-back" /> Back to Practice Arena
            </Link>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
            <h1 className={styles.pageTitle}>
              {isEditMode ? 'Edit Technical Question' : 'Post / Author New Question'}
            </h1>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                background: '#1c2d81',
                color: '#fed601',
                padding: '3px 9px',
                borderRadius: '2px',
              }}
            >
              {user?.role?.replace(/_/g, ' ') || 'Content & Skill Admin'}
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                background: '#f1f5f9',
                color: '#475569',
                padding: '3px 9px',
                border: '1px solid #cbd5e1',
                borderRadius: '2px',
              }}
            >
              {user?.email || 'skillcontent@beyon.io'}
            </span>
          </div>

          <p className={styles.pageSubtitle}>
            {isEditMode
              ? 'Update technical question prompts, options, correct keys, explanations, and configurations.'
              : 'Author verified Single Choice MCQs, Multi-Select questions, database queries, and algorithmic benchmarks directly into the database.'}
          </p>
        </div>
      </div>

      {createdQuestionId ? (
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <i className="bx bx-check" />
          </div>
          <h2 className={styles.successTitle}>
            {isEditMode ? 'Question Updated Successfully!' : 'Question Saved to Database Successfully!'}
          </h2>
          <p className={styles.successDesc}>
            {isEditMode
              ? `Your updates to "${title}" have been saved to the database and are now live across all assessments and practice tracks.`
              : `Your ${questionFormat === 'SINGLE_CHOICE' ? 'Single Choice MCQ' : questionFormat === 'MULTI_CHOICE' ? 'Multi-Select Multiple Choice' : questionFormat} question is now published to the platform database and available for assessments and practice sessions.`}
          </p>
          <div className={styles.successActions}>
            {isAdminTier && (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => navigate(skillId ? `/admin/questions?skillId=${skillId}` : '/admin/questions')}
              >
                <i className="bx bx-list-ul" /> View in Question Bank
              </button>
            )}
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => navigate(`/practice/${createdQuestionId}`)}
            >
              <i className="bx bx-play-circle" /> Test &amp; Solve Question
            </button>
            <button
              type="button"
              className={styles.btnOutline}
              onClick={() => {
                setCreatedQuestionId(null);
                setTitle('');
                setDescription('');
                setExplanation('');
                setExpectedOutput('');
                setCodeTemplate('');
                setOptions([
                  { text: '', isCorrect: true, explanation: '' },
                  { text: '', isCorrect: false, explanation: '' },
                  { text: '', isCorrect: false, explanation: '' },
                  { text: '', isCorrect: false, explanation: '' },
                ]);
              }}
            >
              <i className="bx bx-plus" /> Author Another Question
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.formLayout}>
          {errorMsg && (
            <div className={styles.errorBanner}>
              <i className="bx bx-error-circle" /> {errorMsg}
            </div>
          )}

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>1. Question Metadata &amp; Format</h3>

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
                <label className={styles.label}>Question Type / Format</label>
                <select
                  className={styles.select}
                  value={questionFormat}
                  onChange={e => handleFormatChange(e.target.value as QuestionFormat)}
                >
                  <option value="SINGLE_CHOICE">Single Choice Question (1 Correct Answer)</option>
                  <option value="MULTI_CHOICE">Multiple Choice Question (1 or More Correct Answers)</option>
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
                placeholder="e.g. TCP Handshake Connection Protocol Sequence"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldGroup} style={{ marginTop: '16px' }}>
              <label className={styles.label}>Full Problem Statement / Prompt *</label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Write the complete technical question description, scenario, code snippet, or benchmark statement..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          {isOptionBased && (
            <div className={styles.card}>
              <div className={styles.cardHeaderWithAction}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 className={styles.cardTitle}>2. Answer Choices &amp; Correct Key</h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        background: questionFormat === 'MULTI_CHOICE' ? '#fdf4ff' : '#eff6ff',
                        color: questionFormat === 'MULTI_CHOICE' ? '#86198f' : '#1d4ed8',
                        border: questionFormat === 'MULTI_CHOICE' ? '1px solid #f5d0fe' : '1px solid #bfdbfe',
                      }}
                    >
                      {questionFormat === 'MULTI_CHOICE'
                        ? `Multiple Choice (${correctOptionsCount} correct keys selected)`
                        : 'Single Choice (1 correct key)'}
                    </span>
                  </div>
                  <p className={styles.cardSubtitle} style={{ marginTop: '4px' }}>
                    {questionFormat === 'MULTI_CHOICE'
                      ? 'Check all option choices that represent valid correct answers (supports one or more correct options).'
                      : 'Select the single radio button for the unique correct answer choice.'}
                  </p>
                </div>
                {options.length < 8 && (
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
                  <div
                    key={idx}
                    className={`${styles.optionRow} ${opt.isCorrect ? styles.optionRowCorrect : ''}`}
                    style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                      <label
                        className={styles.radioLabel}
                        title={questionFormat === 'MULTI_CHOICE' ? 'Toggle as correct answer' : 'Set as single correct answer'}
                      >
                        {questionFormat === 'MULTI_CHOICE' ? (
                          <input
                            type="checkbox"
                            checked={opt.isCorrect}
                            onChange={() => handleToggleMultiCorrect(idx)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16a34a' }}
                          />
                        ) : (
                          <input
                            type="radio"
                            name="correctOptionRadio"
                            checked={opt.isCorrect}
                            onChange={() => handleSelectSingleCorrect(idx)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16a34a' }}
                          />
                        )}
                        <span
                          className={styles.optionLetterBadge}
                          style={{
                            background: opt.isCorrect ? '#16a34a' : '#f1f5f9',
                            color: opt.isCorrect ? '#ffffff' : '#1e293b',
                            borderColor: opt.isCorrect ? '#15803d' : '#cbd5e1',
                          }}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                      </label>

                      <input
                        type="text"
                        className={styles.optionInput}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text statement...`}
                        value={opt.text}
                        onChange={e => handleOptionTextChange(idx, e.target.value)}
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

                    <div style={{ paddingLeft: '56px', width: '100%', boxSizing: 'border-box' }}>
                      <input
                        type="text"
                        placeholder={`Optional explanation for choice ${String.fromCharCode(65 + idx)}...`}
                        value={opt.explanation || ''}
                        onChange={e => handleOptionExplanationChange(idx, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          fontSize: '0.76rem',
                          color: '#64748b',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px dashed #cbd5e1',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questionFormat === 'SQL' && (
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

          {questionFormat === 'CODING' && (
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

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>3. Explanation &amp; Solution Rationale</h3>
            <p className={styles.cardSubtitle}>
              Help students understand why the answer is correct with comprehensive technical rationale.
            </p>
            <div className={styles.fieldGroup} style={{ marginTop: '12px' }}>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="e.g. In TCP 3-way handshake, host A sends SYN, host B responds with SYN-ACK, and host A completes connection with ACK..."
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formFooter}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading}
            >
              <i className="bx bx-save" />
              <span>
                {loading
                  ? (isEditMode ? 'Updating Question...' : 'Publishing to Database...')
                  : (isEditMode ? 'Save & Update Question' : 'Publish Question to Database')}
              </span>
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => navigate(isAdminTier ? (skillId ? `/admin/questions?skillId=${skillId}` : '/admin/questions') : '/practice')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

