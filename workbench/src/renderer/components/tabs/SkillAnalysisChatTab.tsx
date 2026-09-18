import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronRight,
  User,
  Compass,
  Cpu,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  durationMs?: number;
  modelUsed?: string;
  reasoningSteps?: string;
}

const INITIAL_STUDENT_SKILLS: Record<string, { score: number; verified: boolean }> = {
  HTML: { score: 80, verified: true },
  JavaScript: { score: 60, verified: true },
  Java: { score: 60, verified: true },
  'Spring Boot': { score: 40, verified: false },
  React: { score: 40, verified: false },
  PostgreSQL: { score: 40, verified: false },
  CSS: { score: 20, verified: false },
  TypeScript: { score: 10, verified: false },
  Python: { score: 10, verified: false },
};

const SUGGESTED_PROMPTS = [
  'Analyze my skill gaps (TypeScript 10%, Spring Boot 40%, HTML 80%)',
  'How can I improve my weak skills in TypeScript to 90%?',
  'What 2 enterprise projects should I build to master Spring Boot and React?',
  'Generate a 3-month milestone roadmap for enterprise Full-Stack readiness',
];

export const SkillAnalysisChatTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'I have weak skills in TypeScript (10%) and Spring Boot (40%), but good HTML (80%). How should I prioritize my learning roadmap to become an enterprise Full-Stack Engineer?',
      timestamp: '17:45:10',
    },
    {
      id: 'm2',
      sender: 'ai',
      text: `**Prioritize TypeScript immediately.** Your current 10% proficiency is a critical bottleneck for enterprise development. HTML (80%) is foundational but insufficient for complex state management or API integration without robust typing.

**Actionable Roadmap:**

1. **Master TypeScript (Target: 90%)**
   * **Focus:** Advanced types (Generics, Utility Types), strict mode configuration, and IDE tooling.
   * **Why:** Enterprise codebases rely on type safety to prevent runtime errors. Weak TS limits your ability to maintain large-scale React applications.
   * **Action:** Build a monorepo project using Nx or Turborepo with strict linting (ESLint + Prettier).

2. **Deepen Spring Boot (Target: 80%)**
   * **Focus:** Microservices architecture, Spring Cloud, reactive programming (WebFlux), and database optimization (JPA/Hibernate tuning).
   * **Why:** 40% indicates you know the basics but lack enterprise-grade deployment experience. Focus on distributed systems rather than CRUD apps.
   * **Action:** Deploy a microservice using Docker/Kubernetes with Spring Boot, implementing circuit breakers and observability (Micrometer/Zipkin).

3. **Leverage HTML/CSS Strategically**
   * **Focus:** Accessibility (a11y), semantic structure, and modern CSS (Grid/Flexbox) for React components.
   * **Why:** Your HTML strength is an asset for frontend performance optimization but should not distract from backend logic mastery.

**Final Step: Integration**
Build an end-to-end full-stack application where TypeScript types strictly enforce Spring Boot REST contracts, backed by PostgreSQL.`,
      timestamp: '17:45:18',
      durationMs: 1240,
      modelUsed: 'qwen3.5:4b',
      reasoningSteps: 'Synthesized verified candidate skills against enterprise Full-Stack Software Engineer rubrics. Evaluated TypeScript (10%) as primary blocker, Spring Boot (40%) as secondary hurdle, and formulated actionable milestone guidance.',
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetProfession] = useState('Full-Stack Software Engineer');
  const [showReasoningMap, setShowReasoningMap] = useState<Record<string, boolean>>({ m2: true });
  const [deepAnalysisResult, setDeepAnalysisResult] = useState<any>(null);
  const [deepAnalysisLoading, setDeepAnalysisLoading] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'matrix' | 'roadmap'>('matrix');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleReasoning = (id: string) => {
    setShowReasoningMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuestion).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    const startTime = Date.now();

    try {
      const chatHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await window.workbenchApi.testAiEndpoint({
        path: '/api/v1/intelligence/advisor/chat',
        method: 'POST',
        body: {
          student_id: '1853170b-89ad-41ec-b73d-14109608e84c',
          target_profession: targetProfession,
          student_skills: INITIAL_STUDENT_SKILLS,
          chat_history: chatHistory,
          question: q,
        },
      });

      const durationMs = Date.now() - startTime;

      if (res.success && res.data) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.data.response || 'No response returned from AI engine.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          durationMs: res.durationMs || durationMs,
          modelUsed: res.data.model_used || 'qwen3.5:4b',
          reasoningSteps: res.data.reasoning_steps || '',
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (aiMsg.reasoningSteps) {
          setShowReasoningMap((prev) => ({ ...prev, [aiMsg.id]: true }));
        }
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `Error contacting Qwen AI Engine: ${res.error || 'HTTP ' + res.status}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          durationMs: Date.now() - startTime,
          modelUsed: 'Error',
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Exception: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        durationMs: Date.now() - startTime,
        modelUsed: 'Exception',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDeepAnalysis = async () => {
    setDeepAnalysisLoading(true);
    setActiveRightTab('roadmap');
    try {
      const res = await window.workbenchApi.testAiEndpoint({
        path: '/api/v1/intelligence/skill-gap/ai-analysis',
        method: 'POST',
        body: {
          student_id: '1853170b-89ad-41ec-b73d-14109608e84c',
          target_profession: targetProfession,
          student_skills: INITIAL_STUDENT_SKILLS,
          gaps: [
            { skill_name: 'TypeScript', gap_score: 90, urgency: 'HIGH' },
            { skill_name: 'Spring Boot', gap_score: 60, urgency: 'HIGH' },
            { skill_name: 'React', gap_score: 60, urgency: 'MEDIUM' },
            { skill_name: 'CSS', gap_score: 80, urgency: 'MEDIUM' },
          ],
          student_interests: ['Enterprise Cloud Architecture', 'Full-Stack Systems'],
        },
      });

      if (res.success && res.data) {
        setDeepAnalysisResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeepAnalysisLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'init',
        sender: 'ai',
        text: `Hello Gowtham! I am your **Beyon AI Career Advisor** powered by **Qwen 3.5:4b**.

I have reviewed your active skills profile:
* **Verified Strengths**: HTML (80%), JavaScript (60%), Java (60%)
* **Priority Skill Gaps**: TypeScript (10%), CSS (20%), Spring Boot (40%), React (40%), PostgreSQL (40%)

Ask me any question regarding your learning roadmap, project architecture, or interview preparation for **${targetProfession}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        modelUsed: 'qwen3.5:4b',
      },
    ]);
  };

  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="tab-header" style={{ flexShrink: 0 }}>
        <div className="tab-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--beyon-navy-subtle)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--beyon-gold)',
              }}
            >
              <MessageSquareCode size={18} />
            </div>
            <div>
              <h1>AI Skill Analysis & Career Advisor Chat</h1>
              <p>Realtime conversational skill gap analysis & cognitive telemetry powered by Ollama Qwen 3.5:4b</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-violet-bg)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              fontSize: '11px',
              color: 'var(--color-violet)',
              fontWeight: 600,
            }}
          >
            <Cpu size={13} />
            <span>Ollama Qwen 3.5:4b</span>
          </div>

          <button
            onClick={handleResetChat}
            className="action-btn"
            title="Reset conversation"
            style={{ padding: '6px 10px', fontSize: '11px' }}
          >
            <RotateCcw size={13} />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Split Layout */}
      <div className="split-pane" style={{ flex: 1, minHeight: 0 }}>
        {/* Left: Interactive Chat Conversation */}
        <div
          className="pane-left"
          style={{
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-card)',
            borderRight: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}
        >
          {/* Quick Prompts Bar */}
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <Sparkles size={12} style={{ color: 'var(--beyon-gold)' }} />
              Prompts:
            </span>
            {SUGGESTED_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                disabled={loading}
                style={{
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--beyon-navy-subtle)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Messages Timeline */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                {/* Sender Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {m.sender === 'user' ? (
                    <>
                      <span>{m.timestamp}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>You (Student)</span>
                      <User size={13} style={{ color: 'var(--color-sky)' }} />
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} style={{ color: 'var(--beyon-gold)' }} />
                      <span style={{ fontWeight: 600, color: 'var(--beyon-gold)' }}>Beyon AI Career Advisor</span>
                      {m.modelUsed && (
                        <span className="badge badge-violet" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {m.modelUsed}
                        </span>
                      )}
                      {m.durationMs && (
                        <span className="badge badge-sky" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          <Clock size={10} style={{ marginRight: '3px' }} />
                          {m.durationMs}ms
                        </span>
                      )}
                      <span>{m.timestamp}</span>
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '14px 16px',
                    borderRadius: m.sender === 'user' ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                    backgroundColor: m.sender === 'user' ? 'var(--beyon-navy)' : 'var(--bg-primary)',
                    border: m.sender === 'user' ? '1px solid var(--beyon-navy-light)' : '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  {/* Collapsible Reasoning Block (if AI has thinking steps) */}
                  {m.reasoningSteps && (
                    <div
                      style={{
                        marginBottom: '10px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                      }}
                    >
                      <div
                        onClick={() => toggleReasoning(m.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontSize: '11px',
                          color: 'var(--color-violet)',
                          fontWeight: 600,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Cpu size={12} />
                          <span>Cognitive Reasoning Telemetry ({m.modelUsed})</span>
                        </div>
                        {showReasoningMap[m.id] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </div>
                      {showReasoningMap[m.id] && (
                        <div
                          style={{
                            marginTop: '6px',
                            paddingTop: '6px',
                            borderTop: '1px dashed rgba(168, 85, 247, 0.2)',
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: '1.4',
                          }}
                        >
                          {m.reasoningSteps}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Formatted Text */}
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {m.text.split('\n\n').map((para, pIdx) => {
                      if (para.startsWith('**') && para.includes('Roadmap')) {
                        return (
                          <h4 key={pIdx} style={{ color: 'var(--beyon-gold)', marginTop: '8px', marginBottom: '4px', fontSize: '13px' }}>
                            {para.replace(/\*\*/g, '')}
                          </h4>
                        );
                      }
                      return (
                        <p key={pIdx} style={{ marginBottom: '8px' }}>
                          {para}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <Sparkles size={13} style={{ color: 'var(--beyon-gold)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--beyon-gold)' }}>Beyon AI Career Advisor</span>
                  <span className="badge badge-violet" style={{ fontSize: '10px' }}>qwen3.5:4b</span>
                </div>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '2px 12px 12px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                  }}
                >
                  <Clock className="spin" size={14} style={{ color: 'var(--beyon-gold)' }} />
                  <span>Synthesizing skill gap analysis via Qwen 3.5:4b...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-header)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask the AI Career Advisor about your skills, learning roadmap, or interview prep... (Press Enter to send)"
                rows={2}
                className="code-editor"
                style={{
                  flex: 1,
                  resize: 'none',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  padding: '10px 12px',
                  borderRadius: '6px',
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputQuestion.trim()}
                className="action-btn"
                style={{
                  backgroundColor: 'var(--beyon-navy)',
                  color: '#ffffff',
                  borderColor: 'var(--beyon-navy-light)',
                  padding: '0 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Target Role Context: <strong style={{ color: 'var(--text-primary)' }}>{targetProfession}</strong></span>
              <span>Candidate: <strong style={{ color: 'var(--text-primary)' }}>Gowtham C D (23CSR068)</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Student Skill Matrix & Deep AI Roadmap */}
        <div
          className="pane-right"
          style={{
            flex: 1.2,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-card)',
            overflow: 'hidden',
          }}
        >
          {/* Sub-tab Navigation Header */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setActiveRightTab('matrix')}
              style={{
                flex: 1,
                padding: '12px 14px',
                border: 'none',
                backgroundColor: activeRightTab === 'matrix' ? 'var(--bg-card)' : 'transparent',
                color: activeRightTab === 'matrix' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: activeRightTab === 'matrix' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                borderBottom: activeRightTab === 'matrix' ? '2px solid var(--beyon-gold)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Layers size={14} />
              <span>Skill Matrix Context</span>
            </button>
            <button
              onClick={() => setActiveRightTab('roadmap')}
              style={{
                flex: 1,
                padding: '12px 14px',
                border: 'none',
                backgroundColor: activeRightTab === 'roadmap' ? 'var(--bg-card)' : 'transparent',
                color: activeRightTab === 'roadmap' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: activeRightTab === 'roadmap' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                borderBottom: activeRightTab === 'roadmap' ? '2px solid var(--color-violet)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Compass size={14} />
              <span>Deep Roadmap JSON</span>
            </button>
          </div>

          {/* Right Sub-View: Skill Matrix */}
          {activeRightTab === 'matrix' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Target Profession Card */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  TARGET PROFESSION GOAL
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                    {targetProfession}
                  </span>
                  <span className="badge badge-gold">Enterprise Tier</span>
                </div>
              </div>

              {/* Skills Breakdown */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    ACTIVE SKILLS & GAPS (DOLT DB)
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>9 Core Skills</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(INITIAL_STUDENT_SKILLS).map(([skill, meta]) => {
                    const isVerified = meta.score >= 60 || meta.verified;
                    const isCritical = meta.score <= 20;

                    return (
                      <div
                        key={skill}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isVerified ? (
                            <CheckCircle2 size={13} style={{ color: 'var(--color-emerald)' }} />
                          ) : (
                            <AlertTriangle size={13} style={{ color: isCritical ? 'var(--color-rose)' : 'var(--color-amber)' }} />
                          )}
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {skill}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: isVerified ? 'var(--color-emerald)' : isCritical ? 'var(--color-rose)' : 'var(--color-amber)',
                            }}
                          >
                            {meta.score}%
                          </span>
                          <span
                            className={`badge ${
                              isVerified ? 'badge-emerald' : isCritical ? 'badge-rose' : 'badge-amber'
                            }`}
                            style={{ fontSize: '10px', padding: '1px 6px' }}
                          >
                            {isVerified ? 'Verified' : isCritical ? 'Critical Gap' : 'Needs Review'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action: Run Deep AI Analysis */}
              <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                <button
                  onClick={handleRunDeepAnalysis}
                  disabled={deepAnalysisLoading}
                  className="action-btn"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-violet)',
                    borderColor: 'transparent',
                    color: '#ffffff',
                    padding: '10px',
                  }}
                >
                  <Sparkles size={14} />
                  <span>
                    {deepAnalysisLoading ? 'Generating Full Roadmap...' : 'Run Deep AI Gap Analysis & Roadmap'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Right Sub-View: Deep Roadmap JSON & Visualizer */}
          {activeRightTab === 'roadmap' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {deepAnalysisLoading ? (
                <div className="empty-state" style={{ padding: '32px 16px' }}>
                  <Clock className="spin" size={32} style={{ color: 'var(--color-violet)' }} />
                  <div className="empty-state-title">Qwen 3.5 Synthesizing Career Roadmap</div>
                  <div className="empty-state-text">
                    Formulating milestone phases, skill impact scores, and enterprise interview recommendations...
                  </div>
                </div>
              ) : deepAnalysisResult ? (
                <>
                  {/* Readiness Banner */}
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Enterprise Readiness Score</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--beyon-gold)' }}>
                        {deepAnalysisResult.overall_readiness_pct || 42}%
                      </div>
                    </div>
                    <span className="badge badge-violet">
                      Model: {deepAnalysisResult.model_used || 'qwen3.5:4b'}
                    </span>
                  </div>

                  {/* Executive Summary */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      EXECUTIVE SUMMARY
                    </div>
                    <p style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                      {deepAnalysisResult.executive_summary}
                    </p>
                  </div>

                  {/* Milestone Roadmap */}
                  {deepAnalysisResult.milestone_roadmap && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                        3-PHASE MILESTONE ROADMAP
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {deepAnalysisResult.milestone_roadmap.map((m: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '6px',
                              backgroundColor: 'var(--bg-primary)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sky)' }}>
                                {m.phase || `Phase ${idx + 1}`}: {m.title}
                              </span>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m.duration}</span>
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              {m.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw JSON Details */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      RAW AI SYNTHESIS PAYLOAD
                    </div>
                    <div className="json-viewer" style={{ maxHeight: '180px' }}>
                      {JSON.stringify(deepAnalysisResult, null, 2)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <Compass size={36} style={{ color: 'var(--text-muted)' }} />
                  <div className="empty-state-title">No Roadmap Generated Yet</div>
                  <div className="empty-state-text">
                    Click "Run Deep AI Gap Analysis & Roadmap" to synthesize an enterprise curriculum with Qwen 3.5.
                  </div>
                  <button
                    onClick={handleRunDeepAnalysis}
                    className="action-btn"
                    style={{ marginTop: '16px', backgroundColor: 'var(--color-violet)', color: '#ffffff', borderColor: 'transparent' }}
                  >
                    <Sparkles size={13} />
                    <span>Generate Now</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
