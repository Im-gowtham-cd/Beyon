import React, { useState } from 'react';
import { BrainCircuit, Play, CheckCircle2, XCircle, Clock, Send, Server } from 'lucide-react';

interface EndpointPreset {
  name: string;
  method: string;
  path: string;
  body?: string;
}

const PRESETS: EndpointPreset[] = [
  {
    name: 'AI Engine Health Check',
    method: 'GET',
    path: '/health',
  },
  {
    name: 'Daily Challenge Sprint Synthesis (15 Qs)',
    method: 'POST',
    path: '/api/v1/intelligence/daily-challenge/sprint',
    body: JSON.stringify(
      {
        student_id: '00000000-0000-0000-0000-000000000001',
        learned_skills: ['CSS Box Model', 'Flexbox Layout', 'JavaScript Async/Await'],
        target_company_roles: ['Frontend Engineer', 'Fullstack Developer'],
        lagged_concepts: ['box-sizing content-box vs border-box', 'Event loop microtasks'],
        skill_level: 'INTERMEDIATE',
        count: 15,
      },
      null,
      2
    ),
  },
  {
    name: 'Revise & Recall Synthesis (10 Qs)',
    method: 'POST',
    path: '/api/v1/intelligence/daily-challenge/recall',
    body: JSON.stringify(
      {
        student_id: '00000000-0000-0000-0000-000000000001',
        in_progress_skills: ['CSS Grid Layout', 'React Server Components'],
        lagged_concepts: ['grid-template-areas positioning', 'CSS Box Model vertical margin collapse'],
        skill_level: 'INTERMEDIATE',
        count: 10,
      },
      null,
      2
    ),
  },
  {
    name: 'Fine-Grained Concept Weakness Diagnosis',
    method: 'POST',
    path: '/api/v1/intelligence/weak-concepts/diagnose',
    body: JSON.stringify(
      {
        skill_name: 'CSS Skill',
        incorrect_questions: [
          {
            question_id: 'q1',
            question_text: 'What happens to element width when padding is added under box-sizing: content-box?',
            user_answer: 'Width stays the same',
            correct_answer: 'Element total width increases by the padding amount',
          },
        ],
      },
      null,
      2
    ),
  },
];

export const AiTelemetryTab: React.FC = () => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [method, setMethod] = useState(PRESETS[0].method);
  const [path, setPath] = useState(PRESETS[0].path);
  const [body, setBody] = useState(PRESETS[0].body || '');
  const [running, setRunning] = useState(false);
  const [responseResult, setResponseResult] = useState<{
    success: boolean;
    status: number;
    durationMs: number;
    data?: any;
    error?: string;
  } | null>(null);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const p = PRESETS[idx];
    setMethod(p.method);
    setPath(p.path);
    setBody(p.body || '');
  };

  const handleExecute = async () => {
    setRunning(true);
    setResponseResult(null);
    try {
      let parsedBody: any = undefined;
      if (method === 'POST' && body.trim()) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          parsedBody = body;
        }
      }

      const res = await window.workbenchApi.testAiEndpoint({
        path,
        method,
        body: parsedBody,
      });

      setResponseResult(res);
    } catch (err: any) {
      setResponseResult({
        success: false,
        status: 0,
        durationMs: 0,
        error: err.message,
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-left">
          <h1>Qwen AI Intelligence Engine Diagnostics</h1>
          <p>Direct cognitive testing, endpoint execution, and prompt synthesis inspection (qwen3.5:4b)</p>
        </div>
      </div>

      <div className="split-pane">
        {/* Left: Presets and Request Config */}
        <div className="pane-left" style={{ width: '420px', padding: '16px', gap: '16px', overflowY: 'auto' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              DIAGNOSTIC PRESETS
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PRESETS.map((p, idx) => (
                <div
                  key={p.name}
                  onClick={() => handleSelectPreset(idx)}
                  className={`list-item-btn ${selectedPresetIndex === idx ? 'selected' : ''}`}
                  style={{ borderRadius: '6px', border: '1px solid var(--border-color)', padding: '8px 12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${p.method === 'GET' ? 'badge-sky' : 'badge-violet'}`}>
                      {p.method}
                    </span>
                    <span style={{ fontSize: '12px' }}>{p.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              HTTP METHOD & PATH
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <select
                aria-label="HTTP method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="select-compact"
                style={{ width: '90px' }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="input-text"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
            </div>

            {method === 'POST' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  REQUEST BODY (JSON)
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="code-editor"
                  style={{ height: '180px', fontSize: '11px' }}
                />
              </div>
            )}

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleExecute}
                disabled={running}
                className="action-btn"
                style={{ backgroundColor: 'var(--color-violet)', color: '#ffffff', borderColor: 'transparent', width: '100%', justifyContent: 'center' }}
              >
                <Play size={14} />
                <span>{running ? 'Calling Qwen Engine...' : 'Execute Request'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Response Output */}
        <div className="pane-right">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BrainCircuit size={16} style={{ color: 'var(--color-violet)' }} />
              <div style={{ fontWeight: 700, fontSize: '14px' }}>AI Engine Response</div>
            </div>
            {responseResult && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge ${responseResult.success ? 'badge-emerald' : 'badge-rose'}`}>
                  {responseResult.success ? <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> : <XCircle size={12} style={{ marginRight: '4px' }} />}
                  HTTP {responseResult.status}
                </span>
                <span className="badge badge-sky">
                  <Clock size={12} style={{ marginRight: '4px' }} />
                  {responseResult.durationMs}ms
                </span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            {responseResult ? (
              <div className="json-viewer" style={{ maxHeight: 'none', height: '100%' }}>
                {responseResult.data ? JSON.stringify(responseResult.data, null, 2) : responseResult.error}
              </div>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <BrainCircuit size={36} style={{ color: 'var(--text-muted)' }} />
                <div className="empty-state-title">No Request Sent Yet</div>
                <div className="empty-state-text">
                  Select an endpoint preset or configure a custom API payload, then click Execute Request.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
