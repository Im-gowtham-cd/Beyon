import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Code,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface ExtractedOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface ExtractedQuestion {
  id?: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED' | 'EXPERT';
  questionType: string;
  codeTemplate?: string;
  explanation?: string;
  options: ExtractedOption[];
}

export const LEVEL_CONFIG: Record<string, { bg: string; border: string; text: string; label: string; dot: string }> = {
  BEGINNER: { bg: '#e0f2fe', border: '#bae6fd', text: '#0369a1', label: 'Level 1: Beginner', dot: '#0ea5e9' },
  EASY: { bg: '#dcfce7', border: '#bbf7d0', text: '#15803d', label: 'Level 2: Easy', dot: '#10b981' },
  MEDIUM: { bg: '#fef3c7', border: '#fde68a', text: '#b45309', label: 'Level 3: Medium', dot: '#f59e0b' },
  HARD: { bg: '#fee2e2', border: '#fecaca', text: '#b91c1c', label: 'Level 4: Hard', dot: '#f43f5e' },
  ADVANCED: { bg: '#f3e8ff', border: '#e9d5ff', text: '#7e22ce', label: 'Level 5: Advanced', dot: '#8b5cf6' },
  EXPERT: { bg: '#e0e7ff', border: '#c7d2fe', text: '#4338ca', label: 'Level 6: Expert', dot: '#6366f1' },
};

export interface SkillOption {
  id: string;
  name: string;
  slug?: string;
  category?: string;
}

interface JsonQuestionExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSkillId?: string;
  initialSkillName?: string;
  allSkills: SkillOption[];
  onImportSuccess?: (importedCount: number, skillName: string) => void;
}

const SAMPLE_AI_JSON = `[
  {
    "title": "Level 1: Pointer Dereferencing Syntax & Value Access",
    "description": "Examine the following C snippet. What is printed to standard output upon successful execution?",
    "difficulty": "BEGINNER",
    "questionType": "SINGLE_CHOICE",
    "codeTemplate": "#include <stdio.h>\\n\\nint main(void) {\\n    int value = 42;\\n    int *ptr = &value;\\n    printf(\\"%d\\\\n\\", *ptr);\\n    return 0;\\n}",
    "explanation": "The asterisk * before a pointer variable in an expression dereferences the pointer, fetching the integer value 42 stored at address &value.",
    "options": [
      { "text": "42", "isCorrect": true, "explanation": "Dereferencing ptr yields the integer value 42 directly." },
      { "text": "Memory address of value", "isCorrect": false, "explanation": "Printing ptr directly without * would print an address." },
      { "text": "0", "isCorrect": false, "explanation": "The variable was initialized to 42, not zero." },
      { "text": "Compilation Error", "isCorrect": false, "explanation": "The syntax and pointer types match perfectly." }
    ]
  },
  {
    "title": "Level 2: Pointer Arithmetic & Array Index Invariants",
    "description": "What values are printed when the code below is compiled with GCC and executed?",
    "difficulty": "EASY",
    "questionType": "SINGLE_CHOICE",
    "codeTemplate": "#include <stdio.h>\\n\\nint main(void) {\\n    int arr[] = {10, 20, 30, 40, 50};\\n    int *ptr = arr + 3;\\n    printf(\\"%d %d\\\\n\\", *(ptr - 1), ptr[-2]);\\n    return 0;\\n}",
    "explanation": "ptr points to arr[3] (value 40). *(ptr - 1) accesses arr[2] (value 30). In C, ptr[-2] is identical to *(ptr - 2), which accesses arr[1] (value 20).",
    "options": [
      { "text": "30 20", "isCorrect": true, "explanation": "ptr-1 is offset arr[2] (30), ptr[-2] is offset arr[1] (20)." },
      { "text": "40 30", "isCorrect": false, "explanation": "Off-by-one error." },
      { "text": "20 10", "isCorrect": false, "explanation": "Subtracted too many elements." },
      { "text": "Undefined Behavior", "isCorrect": false, "explanation": "Both pointers remain within bounds of arr." }
    ]
  },
  {
    "title": "Level 3: Struct Memory Padding & Alignment Invariants",
    "description": "On a standard 64-bit LP64 architecture (e.g. Linux x86_64), what will sizeof(struct Packet) evaluate to?",
    "difficulty": "MEDIUM",
    "questionType": "SINGLE_CHOICE",
    "codeTemplate": "#include <stdio.h>\\n\\nstruct Packet {\\n    char flag;      // 1 byte\\n    int sequence;   // 4 bytes\\n    short checksum; // 2 bytes\\n};\\n\\nint main(void) {\\n    printf(\\"%zu\\\\n\\", sizeof(struct Packet));\\n    return 0;\\n}",
    "explanation": "char flag takes 1 byte + 3 padding bytes to align sequence on a 4-byte boundary. short checksum takes 2 bytes + 2 trailing padding bytes to make the total struct size a multiple of its largest member alignment (4 bytes). Total: 4 + 4 + 4 = 12 bytes.",
    "options": [
      { "text": "12", "isCorrect": true, "explanation": "1 + 3 (pad) + 4 + 2 + 2 (pad) = 12 bytes under standard 4-byte alignment." },
      { "text": "7", "isCorrect": false, "explanation": "7 is raw byte count without hardware padding." },
      { "text": "8", "isCorrect": false, "explanation": "Underestimates struct member alignment rules." },
      { "text": "16", "isCorrect": false, "explanation": "Padding does not align to 8 bytes since max member is 4-byte int." }
    ]
  }
]`;

export function JsonQuestionExtractorModal({
  isOpen,
  onClose,
  initialSkillId,
  initialSkillName,
  allSkills,
  onImportSuccess
}: JsonQuestionExtractorModalProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(initialSkillId || '');
  const [rawInput, setRawInput] = useState('');
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showSchemaDrawer, setShowSchemaDrawer] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Sync initial skill on open
  useEffect(() => {
    if (initialSkillId) {
      setSelectedSkillId(initialSkillId);
    } else if (allSkills.length > 0 && !selectedSkillId) {
      setSelectedSkillId(allSkills[0].id);
    }
  }, [initialSkillId, allSkills]);

  const activeSkill = useMemo(() => {
    return allSkills.find((s) => s.id === selectedSkillId) || null;
  }, [allSkills, selectedSkillId]);

  const activeSkillName = activeSkill ? activeSkill.name : (initialSkillName || 'Selected Competency');

  // Generate standardized prompt for external AI
  const promptTemplate = useMemo(() => {
    return `Generate 6 authentic, compiler-tested technical assessment questions for the skill "${activeSkillName}".

REQUIREMENTS:
1. Provide questions across the 6 proficiency tiers:
   - Level 1: BEGINNER (Syntax, core primitives, foundational definitions)
   - Level 2: EASY (Control flow, standard libraries, basic operations)
   - Level 3: MEDIUM (Algorithms, memory layout, data structures, state lifecycles)
   - Level 4: HARD (Concurrency, optimization, error recovery, complex patterns)
   - Level 5: ADVANCED (Low-level architecture, internals, distributed systems, cache coherency)
   - Level 6: EXPERT (Kernel-level invariants, compiler optimizations, edge-case failure modes)
2. Include realistic code snippets in "codeTemplate" where relevant.
3. Every question must have exactly 4 options with clear explanations.
4. Mark the single correct option with "isCorrect": true.

Return ONLY a valid JSON array matching this exact schema (no conversational pleasantries or markdown wrapper):
[
  {
    "title": "Level X: Descriptive Concept Title",
    "description": "The exact problem statement or question prompt",
    "difficulty": "BEGINNER", // Exactly one of: BEGINNER, EASY, MEDIUM, HARD, ADVANCED, EXPERT
    "questionType": "SINGLE_CHOICE", // Exactly one of: SINGLE_CHOICE, MULTI_CHOICE, SQL, CODING
    "codeTemplate": "// Optional authentic code snippet\\nint x = 42;",
    "explanation": "Comprehensive explanation of why the correct answer is valid.",
    "options": [
      { "text": "Option A text", "isCorrect": true, "explanation": "Why this is correct" },
      { "text": "Option B text", "isCorrect": false, "explanation": "Why this is incorrect" },
      { "text": "Option C text", "isCorrect": false, "explanation": "Why this is incorrect" },
      { "text": "Option D text", "isCorrect": false, "explanation": "Why this is incorrect" }
    ]
  }
]`;
  }, [activeSkillName]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptTemplate);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Robust parser function to extract questions from any AI output
  const extractQuestions = (text: string) => {
    setParseError(null);
    setImportSuccessMsg(null);
    if (!text.trim()) {
      setExtractedQuestions([]);
      return;
    }

    try {
      let cleaned = text.trim();

      // Step 1: Strip markdown fences if present (e.g. ```json ... ``` or ``` ... ```)
      const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (fenceMatch && fenceMatch[1]) {
        cleaned = fenceMatch[1].trim();
      }

      // Step 2: If there is still leading/trailing text, locate the outermost JSON structure
      const firstBracket = cleaned.indexOf('[');
      const lastBracket = cleaned.lastIndexOf(']');
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');

      let jsonString = cleaned;
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        jsonString = cleaned.substring(firstBracket, lastBracket + 1);
      } else if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = cleaned.substring(firstBrace, lastBrace + 1);
      }

      // Clean common syntax anomalies (trailing commas before ] or })
      jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');

      let parsed: any;
      try {
        parsed = JSON.parse(jsonString);
      } catch (innerErr: any) {
        throw new Error(`JSON syntax error: ${innerErr.message}. Make sure the AI output contains valid JSON syntax.`);
      }

      const list: any[] = Array.isArray(parsed) ? parsed : [parsed];
      if (list.length === 0) {
        throw new Error('No question objects were found in the provided JSON.');
      }

      const normalized: ExtractedQuestion[] = list.map((item, idx) => {
        // Normalize difficulty across all 6 tiers
        let diff: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED' | 'EXPERT' = 'MEDIUM';
        const rawDiff = String(item.difficulty || item.level || '').toUpperCase();
        if (rawDiff.includes('BEGINNER') || rawDiff === 'L1' || rawDiff.includes('LEVEL 1')) {
          diff = 'BEGINNER';
        } else if (rawDiff.includes('EASY') || rawDiff === 'L2' || rawDiff.includes('LEVEL 2')) {
          diff = 'EASY';
        } else if (rawDiff.includes('MEDIUM') || rawDiff.includes('INTERMEDIATE') || rawDiff === 'L3' || rawDiff.includes('LEVEL 3')) {
          diff = 'MEDIUM';
        } else if (rawDiff.includes('HARD') || rawDiff === 'L4' || rawDiff.includes('LEVEL 4')) {
          diff = 'HARD';
        } else if (rawDiff.includes('ADVANCED') || rawDiff === 'L5' || rawDiff.includes('LEVEL 5')) {
          diff = 'ADVANCED';
        } else if (rawDiff.includes('EXPERT') || rawDiff.includes('MASTER') || rawDiff === 'L6' || rawDiff.includes('LEVEL 6')) {
          diff = 'EXPERT';
        } else {
          diff = 'MEDIUM';
        }

        // Normalize question type
        let qType = 'SINGLE_CHOICE';
        const rawType = String(item.questionType || item.type || '').toUpperCase();
        if (rawType.includes('MULTI') || rawType.includes('CHECKBOX')) {
          qType = 'MULTI_CHOICE';
        } else if (rawType.includes('SQL')) {
          qType = 'SQL';
        } else if (rawType.includes('COD')) {
          qType = 'CODING';
        }

        // Normalize title & description
        const title = item.title || item.name || item.heading || `Question ${idx + 1}: ${activeSkillName}`;
        const description = item.description || item.prompt || item.body || item.text || title;
        const codeTemplate = item.codeTemplate || item.code || item.snippet || item.codeSnippet || undefined;
        const explanation = item.explanation || item.solution || item.reasoning || undefined;

        // Normalize options
        const rawOpts = item.options || item.choices || item.answers || [];
        const options: ExtractedOption[] = [];

        if (Array.isArray(rawOpts)) {
          rawOpts.forEach((opt: any, optIdx: number) => {
            if (typeof opt === 'string') {
              const isCorrect = (item.correctAnswer === opt || item.correctAnswer === optIdx || item.answer === opt || item.answer === optIdx);
              options.push({ text: opt, isCorrect: !!isCorrect });
            } else if (typeof opt === 'object' && opt !== null) {
              const optText = opt.text || opt.optionText || opt.choice || opt.label || opt.value || `Option ${optIdx + 1}`;
              const isCorrect = Boolean(opt.isCorrect || opt.correct || opt.is_correct || opt.isAnswer);
              options.push({
                text: String(optText),
                isCorrect,
                explanation: opt.explanation || opt.reason || undefined,
              });
            }
          });
        }

        return {
          id: `extracted-${Date.now()}-${idx}`,
          title,
          description,
          difficulty: diff,
          questionType: qType,
          codeTemplate,
          explanation,
          options,
        };
      });

      setExtractedQuestions(normalized);
    } catch (err: any) {
      setParseError(err.message || 'Unable to parse JSON from the provided input.');
      setExtractedQuestions([]);
    }
  };

  const handleInputChange = (val: string) => {
    setRawInput(val);
    if (val.trim()) {
      extractQuestions(val);
    } else {
      setExtractedQuestions([]);
      setParseError(null);
    }
  };

  const handleLoadSample = () => {
    setRawInput(SAMPLE_AI_JSON);
    extractQuestions(SAMPLE_AI_JSON);
  };

  const handleRemoveQuestion = (idx: number) => {
    setExtractedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Bulk import extracted questions to backend
  const handleImportToDatabase = async () => {
    if (!selectedSkillId) {
      setParseError('Please select a Target Competency to import these questions into.');
      return;
    }
    if (extractedQuestions.length === 0) {
      setParseError('No extracted questions to import. Paste your AI response first.');
      return;
    }

    setImporting(true);
    setParseError(null);
    setImportSuccessMsg(null);

    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');

      // Map to backend schema
      const payloadQuestions = extractedQuestions.map((q) => ({
        skillId: selectedSkillId,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        questionType: q.questionType,
        codeTemplate: q.codeTemplate,
        explanation: q.explanation,
        options: q.options.map((opt, optOrder) => ({
          optionText: opt.text,
          isCorrect: opt.isCorrect,
          displayOrder: optOrder + 1,
          explanation: opt.explanation,
        })),
      }));

      // Try batch endpoint first
      let importedCount = 0;
      const batchRes = await fetch('/api/v1/questions/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          skillId: selectedSkillId,
          questions: payloadQuestions,
        }),
      });

      if (batchRes.ok) {
        const data = await batchRes.json();
        importedCount = data.data?.importedCount || payloadQuestions.length;
      } else {
        // Fallback: Post one by one if batch endpoint is unavailable
        for (const q of payloadQuestions) {
          const singleRes = await fetch('/api/v1/questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(q),
          });
          if (singleRes.ok) importedCount++;
        }
      }

      setImportSuccessMsg(`Successfully imported ${importedCount} authentic questions into "${activeSkillName}"!`);
      if (onImportSuccess) {
        onImportSuccess(importedCount, activeSkillName);
      }

      setTimeout(() => {
        setRawInput('');
        setExtractedQuestions([]);
      }, 2500);
    } catch (err: any) {
      setParseError(err.message || 'Error occurred while saving questions to the database. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '1040px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            background: '#1c2d81',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #fed601',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                background: '#fed601',
                color: '#1c2d81',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
                AI JSON Question Extractor &amp; Bulk Importer
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#e2e8f0' }}>
                Generate questions with ChatGPT, Claude, DeepSeek, or Gemini, then paste the AI response to extract and ingest questions into database.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* STEP 1: Standard AI Prompt & Schema Exporter */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #fed601',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#1c2d81', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step 1 • AI Prompt &amp; Standard JSON Format
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                  Target Competency: <span style={{ color: '#1c2d81' }}>{activeSkillName}</span>
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowSchemaDrawer((prev) => !prev)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <Code size={14} color="#1c2d81" />
                  <span>{showSchemaDrawer ? 'Hide JSON Schema' : 'View Standard JSON Schema'}</span>
                  {showSchemaDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#1e40af',
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={14} color="#2563eb" />
                  <span>Load Sample AI Response</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isCopied ? '#166534' : '#1c2d81',
                    border: '1px solid #1c2d81',
                    color: isCopied ? '#ffffff' : '#fed601',
                    padding: '7px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isCopied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{isCopied ? 'Copied Prompt & Schema!' : 'Copy Prompt & Schema for AI'}</span>
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Click <strong>"Copy Prompt &amp; Schema for AI"</strong>, paste it into ChatGPT or Claude, and copy whatever answer the AI gives back directly into the box below. The extractor automatically handles conversational text, markdown code blocks, and field variations.
            </p>

            {/* Collapsible Schema Drawer */}
            {showSchemaDrawer && (
              <div style={{ marginTop: '14px', background: '#0f172a', color: '#f8fafc', padding: '14px 16px', borderRadius: '4px', fontSize: '0.76rem', fontFamily: 'monospace', overflowX: 'auto', border: '1px solid #334155' }}>
                <div style={{ color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>// Expected JSON Output Structure:</div>
                <pre style={{ margin: 0, color: '#38bdf8' }}>{`[
  {
    "title": "Level 1..6: Title of Question",
    "description": "Problem statement and question prompt",
    "difficulty": "BEGINNER" | "EASY" | "MEDIUM" | "HARD" | "ADVANCED" | "EXPERT",
    "questionType": "SINGLE_CHOICE" | "MULTI_CHOICE" | "SQL" | "CODING",
    "codeTemplate": "// optional code snippet",
    "explanation": "Why correct answer is right",
    "options": [
      { "text": "Option A text", "isCorrect": true, "explanation": "Why option is correct" },
      { "text": "Option B text", "isCorrect": false, "explanation": "Why option is incorrect" }
    ]
  }
]`}</pre>
              </div>
            )}
          </div>

          {/* STEP 2: Input Box & Extractor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Step 2 • Paste Raw AI Text / JSON Here:
              </label>
              {rawInput && (
                <button
                  type="button"
                  onClick={() => handleInputChange('')}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Clear Box
                </button>
              )}
            </div>

            <textarea
              rows={8}
              value={rawInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste ChatGPT / Claude / DeepSeek response here (raw JSON, markdown ```json codeblock, or conversational text with embedded JSON)..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid #334155',
                borderRadius: '4px',
                fontSize: '0.82rem',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                lineHeight: 1.5,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            {parseError && (
              <div style={{ marginTop: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <AlertCircle size={16} color="#ef4444" />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          {/* STEP 3: Target Skill Selector & Extracted Preview */}
          <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase' }}>
                  Target Competency:
                </span>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#1c2d81',
                    borderRadius: '3px',
                    minWidth: '220px',
                  }}
                >
                  {allSkills.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name} {sk.category ? `(${sk.category})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {extractedQuestions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                    }}
                  >
                    {extractedQuestions.length} Questions Extracted &amp; Validated
                  </span>
                </div>
              )}
            </div>

            {/* Extracted Questions Preview Cards */}
            {extractedQuestions.length === 0 ? (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  padding: '36px 20px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                <Code size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>
                  No questions extracted yet.
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>
                  Click <strong>"Load Sample AI Response"</strong> above or paste your AI text to see the live question cards.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {extractedQuestions.map((q, idx) => {
                  const levelColor = LEVEL_CONFIG[q.difficulty] || LEVEL_CONFIG.MEDIUM;
                  const hasCorrect = q.options.some((o) => o.isCorrect);

                  return (
                    <div
                      key={q.id || idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderLeft: `4px solid ${levelColor.dot}`,
                        padding: '16px 18px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: levelColor.bg,
                                color: levelColor.text,
                                border: `1px solid ${levelColor.border}`,
                                padding: '2px 8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: levelColor.dot }} />
                              {levelColor.label}
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                padding: '2px 8px',
                              }}
                            >
                              {q.questionType}
                            </span>
                            {!hasCorrect && (
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={12} />
                                No correct option set
                              </span>
                            )}
                          </div>
                          <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#1c2d81' }}>
                            {idx + 1}. {q.title}
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          title="Discard this question"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #fee2e2',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>

                      <p style={{ margin: '0 0 10px', fontSize: '0.84rem', color: '#334155', lineHeight: 1.45 }}>
                        {q.description}
                      </p>

                      {q.codeTemplate && (
                        <div
                          style={{
                            background: '#020617',
                            border: '1px solid #1e293b',
                            padding: '10px 14px',
                            borderRadius: '3px',
                            marginBottom: '12px',
                            overflowX: 'auto',
                          }}
                        >
                          <pre
                            style={{
                              margin: 0,
                              fontSize: '0.78rem',
                              fontFamily: 'Consolas, Monaco, monospace',
                              color: '#38bdf8',
                              lineHeight: 1.4,
                            }}
                          >
                            {q.codeTemplate}
                          </pre>
                        </div>
                      )}

                      {/* Options Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px', marginTop: '8px' }}>
                        {q.options.map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          return (
                            <div
                              key={optIdx}
                              style={{
                                padding: '8px 12px',
                                background: opt.isCorrect ? '#f0fdf4' : '#f8fafc',
                                border: `1px solid ${opt.isCorrect ? '#86efac' : '#e2e8f0'}`,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                              }}
                            >
                              <span
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: opt.isCorrect ? '#16a34a' : '#cbd5e1',
                                  color: '#ffffff',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  marginTop: '1px',
                                }}
                              >
                                {opt.isCorrect ? '✓' : letter}
                              </span>
                              <div style={{ fontSize: '0.8rem', flex: 1 }}>
                                <div style={{ fontWeight: opt.isCorrect ? 800 : 500, color: opt.isCorrect ? '#166534' : '#1e293b' }}>
                                  {opt.text}
                                </div>
                                {opt.explanation && (
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                    {opt.explanation}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div style={{ marginTop: '10px', fontSize: '0.76rem', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderLeft: '3px solid #cbd5e1' }}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            {importSuccessMsg ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 800, fontSize: '0.86rem' }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <span>{importSuccessMsg}</span>
              </div>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {extractedQuestions.length} questions ready to import into <strong>{activeSkillName}</strong>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleImportToDatabase}
              disabled={importing || extractedQuestions.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: importing || extractedQuestions.length === 0 ? '#94a3b8' : '#1c2d81',
                color: '#fed601',
                border: '1px solid #1c2d81',
                padding: '8px 22px',
                fontSize: '0.86rem',
                fontWeight: 900,
                cursor: importing || extractedQuestions.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Download size={16} className={importing ? 'spin' : ''} />
              <span>{importing ? 'Importing Questions...' : `Import All (${extractedQuestions.length}) into Database`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
