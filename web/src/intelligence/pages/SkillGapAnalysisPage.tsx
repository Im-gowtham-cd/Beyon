import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { intelligenceApi } from '../services/intelligenceApi';
import type { CareerPath } from '../types/intelligence';
import {
  Sparkles,
  BrainCircuit,
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Flame,
  Award,
  Terminal,
  Compass
} from 'lucide-react';
import styles from './CareerIntel.module.css';

interface TargetProfession {
  id: string;
  name: string;
  category: string;
  description: string;
}

export function SkillGapAnalysisPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [professions, setProfessions] = useState<TargetProfession[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<string>('Full Stack Java Developer');
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const [customProfession, setCustomProfession] = useState<string>('');
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showReasoning, setShowReasoning] = useState(false);

  useEffect(() => {
    Promise.all([
      intelligenceApi.getAllCareerPaths().catch(() => []),
      intelligenceApi.getTargetProfessions().catch(() => [])
    ]).then(([fetchedPaths, fetchedProfessions]) => {
      setPaths(fetchedPaths || []);
      const profList = fetchedProfessions && fetchedProfessions.length > 0 ? fetchedProfessions : [
        { id: 'fullstack-java', name: 'Full Stack Java Developer', category: 'Software Engineering', description: 'Spring Boot, React, Dolt/MySQL, Microservices, REST APIs, Cloud Deployment' },
        { id: 'cloud-devops', name: 'Cloud DevOps Engineer', category: 'Cloud & Infrastructure', description: 'Docker, Kubernetes, AWS, CI/CD Pipelines, Infrastructure as Code, Linux' },
        { id: 'ai-data-science', name: 'AI & Data Science Engineer', category: 'Artificial Intelligence', description: 'Python, Machine Learning, Deep Learning, SQL, Ollama/LLM Engineering' },
        { id: 'backend-engineer', name: 'Backend Systems Engineer', category: 'Software Engineering', description: 'Java, High-concurrency Systems, SQL Optimization, Messaging Queues' },
        { id: 'frontend-engineer', name: 'Frontend Experience Engineer', category: 'Web Development', description: 'TypeScript, React, Next.js, State Management, UI/UX Systems' }
      ];
      setProfessions(profList);
      if (profList.length > 0) {
        setSelectedProfession(profList[0].name);
      }
    }).finally(() => setLoading(false));
  }, []);

  const runAiAnalysis = async (professionName?: string, pathId?: string) => {
    const prof = professionName || customProfession.trim() || selectedProfession;
    if (!prof) return;

    setAnalyzing(true);
    setAnalysisStep(1);

    const stepTimer1 = setTimeout(() => setAnalysisStep(2), 800);
    const stepTimer2 = setTimeout(() => setAnalysisStep(3), 2000);

    try {
      const result = await intelligenceApi.analyzeSkillGapsWithAi(prof, pathId || selectedPathId || undefined);
      setAnalysis(result);
    } catch {
      setAnalysis(null);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'STRONG') return styles.gapStatusStrong;
    if (status === 'CRITICAL') return styles.gapStatusCritical;
    return styles.gapStatusNeedsWork;
  };

  const barColor = (pct: number) => pct >= 60 ? '#16a34a' : pct >= 30 ? '#ca8a04' : '#dc2626';

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p style={{ marginTop: '1rem', color: '#475569' }}>Connecting to AI Intelligence Service &amp; Skill Baselines...</p>
        </div>
      </div>
    );
  }

  const aiData = analysis?.aiAnalysis || {};
  const recSkills = aiData?.recommended_skills || [];
  const roadmap = aiData?.milestone_roadmap || [];
  const criticalGaps = analysis?.criticalGaps || [];
  const skillsList = analysis?.skills || [];
  const readiness = aiData?.overall_readiness_pct ?? analysis?.readinessScore ?? 0;

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <div className={styles.header}>
        <div className={styles.aiBadgeRow}>
          <div>
            <h1 className={styles.title}>AI Skill Gap Analysis &amp; Profession Recommendations</h1>
            <p className={styles.subtitle}>
              Benchmark your verified skills against industry career standards and generate actionable roadmaps to achieve your target profession.
            </p>
          </div>
          <div className={styles.aiBadge}>
            <span className={styles.aiPulse} />
            <BrainCircuit size={16} />
            <span>Ollama Model: qwen3.5:4b (Active)</span>
          </div>
        </div>
      </div>

      {!analysis && (
        <div className={styles.professionSelectorContainer}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="#4f46e5" /> Step 1: Select Your Target Profession
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Choose a target role or input your specific career aspiration to run the multi-dimensional AI gap diagnostic.
          </p>

          <div className={styles.professionGrid}>
            {professions.map(p => {
              const isSelected = selectedProfession === p.name && !customProfession;
              return (
                <div
                  key={p.id}
                  className={`${styles.professionCard} ${isSelected ? styles.professionCardSelected : ''}`}
                  onClick={() => {
                    setSelectedProfession(p.name);
                    setCustomProfession('');
                    const matchingPath = paths.find(pth => pth.name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(pth.name.toLowerCase()));
                    setSelectedPathId(matchingPath ? matchingPath.id : '');
                  }}
                >
                  <div>
                    <div className={styles.professionCategory}>{p.category}</div>
                    <div className={styles.professionName}>{p.name}</div>
                    <div className={styles.professionDesc}>{p.description}</div>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? '#4f46e5' : '#64748b' }}>
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                    <ArrowRight size={14} color={isSelected ? '#4f46e5' : '#94a3b8'} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle} style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Or Enter a Custom Profession / Industry Role:
            </div>
            <div className={styles.customRoleRow}>
              <input
                type="text"
                placeholder="e.g. SRE / Cloud Platform Engineer, Cyber Threat Specialist..."
                value={customProfession}
                onChange={e => {
                  setCustomProfession(e.target.value);
                  if (e.target.value) setSelectedProfession(e.target.value);
                }}
                className={styles.customRoleInput}
              />
              <button
                className={styles.aiAnalyzeBtn}
                onClick={() => runAiAnalysis()}
                disabled={analyzing}
              >
                <Sparkles size={16} />
                {analyzing ? 'Analyzing with Qwen 3.5...' : 'Run AI Gap Analysis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progressive AI Analysis Loading State */}
      {analyzing && (
        <div className={styles.sectionCard} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div className={styles.loadingSpinner} style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
            Qwen 3.5 AI Skill Gap Engine Running
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            {analysisStep === 1 && 'Step 1/3: Reading verified student competencies and skill graph...'}
            {analysisStep === 2 && `Step 2/3: Benchmarking against industry standards for ${selectedProfession}...`}
            {analysisStep === 3 && 'Step 3/3: Synthesizing customized gap reduction roadmap with Ollama...'}
          </p>
          <div style={{ display: 'inline-flex', gap: '8px', background: '#f1f5f9', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
            <Terminal size={14} /> Local Ollama CPU Inference in Progress
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {analysis && !analyzing && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <button className={styles.btnSecondary} onClick={() => setAnalysis(null)}>
              ← Select Another Target Profession
            </button>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} /> Target Profession: <strong>{analysis.targetProfession || selectedProfession}</strong>
            </div>
          </div>

          {/* Executive Diagnostic Summary */}
          <div className={styles.executiveCard}>
            <div className={styles.executiveHeader}>
              <div className={styles.executiveTitle}>
                <Sparkles size={20} color="#2563eb" />
                <span>Executive Diagnostic &amp; Career Readiness Evaluation</span>
              </div>
              <div className={styles.executiveScoreBadge}>
                {readiness}% Readiness Match
              </div>
            </div>
            <p className={styles.executiveText}>
              {aiData?.executive_summary || 'Your technical profile shows solid foundational concepts with high potential to transition into your desired profession. Focus on the high-yield skill areas below to bridge enterprise requirements.'}
            </p>
            {aiData?.interview_readiness_advice && (
              <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#1e40af' }}>
                <strong>Enterprise Interview Strategy:</strong> {aiData.interview_readiness_advice}
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className={styles.gapSummary}>
            <div className={styles.gapSummaryCard}>
              <div className={`${styles.gapSummaryValue} ${readiness >= 65 ? styles.gapSummaryGood : styles.gapSummaryWarn}`}>
                {readiness}%
              </div>
              <div className={styles.gapSummaryLabel}>Profession Readiness</div>
            </div>
            <div className={styles.gapSummaryCard}>
              <div className={styles.gapSummaryValue} style={{ color: '#16a34a' }}>
                {analysis.acquiredSkills ?? 0}
              </div>
              <div className={styles.gapSummaryLabel}>Competencies Met</div>
            </div>
            <div className={styles.gapSummaryCard}>
              <div className={styles.gapSummaryValue} style={{ color: '#4f46e5' }}>
                {analysis.totalSkills ?? skillsList.length}
              </div>
              <div className={styles.gapSummaryLabel}>Total Requirements</div>
            </div>
            <div className={styles.gapSummaryCard}>
              <div className={`${styles.gapSummaryValue} ${criticalGaps.length > 0 ? styles.gapSummaryBad : styles.gapSummaryGood}`}>
                {criticalGaps.length}
              </div>
              <div className={styles.gapSummaryLabel}>Critical Gaps</div>
            </div>
          </div>

          {/* Recommended Skills to Achieve Profession */}
          {recSkills.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} color="#4f46e5" /> Recommended Skills to Achieve {analysis.targetProfession || selectedProfession}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Ranked strictly by gap reduction impact</span>
              </div>

              <div className={styles.recommendedSkillsGrid}>
                {recSkills.map((rec: any, idx: number) => {
                  const isCritical = rec.priority === 'CRITICAL' || idx === 0;
                  return (
                    <div className={styles.recommendedCard} key={idx}>
                      <div>
                        <div className={styles.recHeader}>
                          <div className={styles.recSkillName}>{rec.skill_name}</div>
                          <span className={`${styles.recBadge} ${isCritical ? styles.recCritical : styles.recModerate}`}>
                            {rec.priority || (isCritical ? 'Critical' : 'High Priority')}
                          </span>
                        </div>
                        <p className={styles.recWhy}>{rec.importance}</p>
                        {rec.key_topics && Array.isArray(rec.key_topics) && (
                          <div className={styles.recTopics}>
                            <strong>Core Focus:</strong> {rec.key_topics.join(' • ')}
                          </div>
                        )}
                        {rec.suggested_project && (
                          <div className={styles.recProject}>
                            <strong>Portfolio Project Idea:</strong> {rec.suggested_project}
                          </div>
                        )}
                      </div>
                      <div className={styles.recMetaRow}>
                        <span className={styles.recHours}>
                          <Clock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                          ~{rec.estimated_hours || 30}h practice
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Link to="/daily-challenge" className={styles.recActionBtn}>
                            <Flame size={13} /> Practice
                          </Link>
                          <Link to="/career-roadmap" className={styles.recActionBtn} style={{ background: '#10b981' }}>
                            <BookOpen size={13} /> Modules
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strategic Milestone Roadmap */}
          {roadmap.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} color="#4f46e5" /> Strategic Milestone Roadmap
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Sequential progression phases designed by Qwen 3.5 to systematically bridge all technical requirements.
              </p>
              <div className={styles.roadmapContainer}>
                {roadmap.map((step: any, idx: number) => (
                  <div className={styles.roadmapCard} key={idx}>
                    <div>
                      <div className={styles.roadmapPhase}>{step.phase || `Phase ${idx + 1}`}</div>
                      <div className={styles.roadmapTitle}>{step.title}</div>
                      <div className={styles.roadmapDesc}>{step.description}</div>
                    </div>
                    <div className={styles.roadmapDuration}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                      {step.duration || '2-3 Weeks'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Gaps Alert Box */}
          {criticalGaps.length > 0 && (
            <div className={styles.sectionCard} style={{ borderLeft: '4px solid #dc2626' }}>
              <div className={styles.sectionTitle} style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> Critical Skill Deficits Requiring Immediate Resolution
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {criticalGaps.map((g: any) => (
                  <div
                    key={g.skillId}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#fef2f2',
                      borderRadius: 8,
                      fontSize: '0.875rem',
                      color: '#991b1b',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    <span>
                      <strong>{g.skillName}</strong>: Required {g.requiredLevel} level, currently evaluated at {g.currentLevel}.
                    </span>
                    <span style={{ fontWeight: 600 }}>~{g.estimatedHours || 40}h required effort</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Skill Breakdown Table */}
          {skillsList.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionTitle}>Full Competency Gap Breakdown</div>
              <div className={styles.gapList}>
                {skillsList.map((s: any) => (
                  <div className={styles.gapItem} key={s.skillId}>
                    <span className={`${styles.gapStatus} ${statusColor(s.status)}`}>
                      {s.status.replace('_', ' ')}
                    </span>
                    <span className={styles.gapSkillName}>{s.skillName}</span>
                    <div className={styles.gapBar}>
                      <div className={styles.gapBarTrack}>
                        <div
                          className={styles.gapBarFill}
                          style={{
                            width: `${Math.min(100, s.proficiencyPct || 0)}%`,
                            background: barColor(s.proficiencyPct || 0)
                          }}
                        />
                      </div>
                    </div>
                    <span className={styles.gapLevels}>{s.currentLevel} → {s.requiredLevel}</span>
                    {s.estimatedHours && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', minWidth: '45px', textAlign: 'right' }}>
                        ~{s.estimatedHours}h
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasoning / Thinking Steps */}
          {aiData?.reasoning_steps && (
            <div className={styles.reasoningBox}>
              <button
                className={styles.reasoningToggle}
                onClick={() => setShowReasoning(!showReasoning)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <BrainCircuit size={16} color="#4f46e5" />
                  <span>Inspect Qwen 3.5 Strategic Thinking &amp; Reasoning Process</span>
                </span>
                {showReasoning ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showReasoning && (
                <div className={styles.reasoningContent}>
                  {aiData.reasoning_steps}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
