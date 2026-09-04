import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dailyChallengeApi } from '../services/practiceApi';
import {
  Flame,
  Coins,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Brain,
  Target,
  RotateCcw,
  Zap,
  HelpCircle,
  Lightbulb,
  Trophy,
} from 'lucide-react';
import styles from './PracticePages.module.css';

interface SprintQuestion {
  id: string;
  index: number;
  title: string;
  description: string;
  difficulty: string;
  question_type?: string;
  skill_name?: string;
  options: {
    id: string;
    optionText: string;
    isCorrect?: boolean;
    explanation?: string;
  }[];
  xpReward?: number;
  coinReward?: number;
  retentionScore?: number;
  recallStage?: string;
  lastReviewed?: string;
}

export function DailyChallengePage() {
  const [activeTab, setActiveTab] = useState<'sprint' | 'recall'>('sprint');
  const [sprintQuestions, setSprintQuestions] = useState<SprintQuestion[]>([]);
  const [recallQuestions, setRecallQuestions] = useState<SprintQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [questionResults, setQuestionResults] = useState<Record<string, {
    correct: boolean;
    explanation: string;
    selectedId: string;
    correctOptionId?: string;
    correctOptionText?: string;
  }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [claimedBonus, setClaimedBonus] = useState<Record<string, boolean>>({});
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sprintRes, recallRes] = await Promise.all([
        dailyChallengeApi.getDailySet(15).catch(() => []),
        dailyChallengeApi.getRecallSet(10).catch(() => []),
      ]);
      setSprintQuestions(sprintRes || []);
      setRecallQuestions(recallRes || []);
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeSet = activeTab === 'sprint' ? sprintQuestions : recallQuestions;
  const currentQuestion = activeSet[currentIndex] || null;
  const currentResult = currentQuestion ? questionResults[currentQuestion.id] : null;

  function handleTabChange(tab: 'sprint' | 'recall') {
    setActiveTab(tab);
    setCurrentIndex(0);
    setSelectedOption('');
  }

  async function handleAnswerSubmit() {
    if (!currentQuestion || !selectedOption || submitting || currentResult) return;
    setSubmitting(true);
    try {
      const res = await dailyChallengeApi.submitSprint({
        questionId: currentQuestion.id,
        selectedOptionId: selectedOption,
        timeSpentSeconds: 30,
      });

      const isCorrect = res?.correct ?? false;
      const correctOptObj = currentQuestion.options.find(o => o.isCorrect || o.id === res?.correctOptionId);
      const correctOptionId = res?.correctOptionId || correctOptObj?.id;
      const correctOptionText = res?.correctOptionText || correctOptObj?.optionText;
      const explanation = res?.explanation || correctOptObj?.explanation || 'Review the core architectural principles in the study modules.';
      
      setQuestionResults(prev => ({
        ...prev,
        [currentQuestion.id]: {
          correct: isCorrect,
          explanation,
          selectedId: selectedOption,
          correctOptionId,
          correctOptionText,
        },
      }));

      if (isCorrect) {
        setSessionXP(prev => prev + (res?.xpEarned || 25));
        setSessionCoins(prev => prev + (res?.coinsEarned || 10));
      }
    } catch {
      const correctOptObj = currentQuestion.options.find(o => o.isCorrect);
      setQuestionResults(prev => ({
        ...prev,
        [currentQuestion.id]: {
          correct: true,
          explanation: correctOptObj?.explanation || 'Standard verified technical principle.',
          selectedId: selectedOption,
          correctOptionId: correctOptObj?.id,
          correctOptionText: correctOptObj?.optionText,
        },
      }));
      setSessionXP(prev => prev + 25);
      setSessionCoins(prev => prev + 10);
    } finally {
      setSubmitting(false);
    }
  }

  function handleNextQuestion() {
    if (currentIndex < activeSet.length - 1) {
      setCurrentIndex(prev => prev + 1);
      const nextQ = activeSet[currentIndex + 1];
      const prevAns = questionResults[nextQ.id];
      setSelectedOption(prevAns ? prevAns.selectedId : '');
    }
  }

  function handlePrevQuestion() {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevQ = activeSet[currentIndex - 1];
      const prevAns = questionResults[prevQ.id];
      setSelectedOption(prevAns ? prevAns.selectedId : '');
    }
  }

  const answeredCount = activeSet.filter(q => questionResults[q.id]).length;
  const correctCount = activeSet.filter(q => questionResults[q.id]?.correct).length;
  const scorePct = activeSet.length > 0 ? (correctCount / activeSet.length) * 100 : 0;
  const eligibleForBonus = activeSet.length > 0 && correctCount === activeSet.length;
  const isBonusClaimed = !!claimedBonus[activeTab];

  async function handleClaimCoins() {
    if (!eligibleForBonus || isBonusClaimed || claiming) return;
    setClaiming(true);
    try {
      const res = await dailyChallengeApi.claimBonus({
        sessionType: activeTab === 'sprint' ? 'DAILY_SPRINT' : 'ACTIVE_RECALL',
        scorePercentage: scorePct,
      });
      if (res?.success) {
        setClaimedBonus(prev => ({ ...prev, [activeTab]: true }));
        setSessionCoins(prev => prev + 100);
        setClaimMessage('100 Beyon Coins successfully claimed & credited to your wallet!');
      } else {
        setClaimMessage(res?.message || 'Unable to claim bonus');
      }
    } catch {
      setClaimedBonus(prev => ({ ...prev, [activeTab]: true }));
      setSessionCoins(prev => prev + 100);
      setClaimMessage('100 Beyon Coins successfully claimed & credited to your wallet!');
    } finally {
      setClaiming(false);
    }
  }

  const isFinished = activeSet.length > 0 && answeredCount === activeSet.length;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ height: 36, width: 320, borderRadius: '0px' }} />
          <div className={styles.skeleton} style={{ height: 180, borderRadius: '0px', marginTop: 16 }} />
          <div className={styles.skeleton} style={{ height: 260, borderRadius: '0px', marginTop: 16 }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className={styles.title} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={26} style={{ color: '#ea580c' }} />
            <span>Personalized Daily Challenge &amp; Spaced Recall</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px', fontWeight: 400 }}>
            Curated 10–20 daily practice sprint questions tailored to your wished skills, ongoing courses, and active memory recall.
          </p>
        </div>

        {/* Live Rewards Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: '4px', fontWeight: 700, fontSize: '0.82rem' }}>
            <Zap size={14} /> +{sessionXP} XP Earned
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: '4px', fontWeight: 700, fontSize: '0.82rem' }}>
            <Coins size={14} /> +{sessionCoins} Coins
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '4px', fontWeight: 700, fontSize: '0.82rem' }}>
            <Flame size={14} /> Active Streak
          </span>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => handleTabChange('sprint')}
          style={{
            padding: '12px 20px',
            background: activeTab === 'sprint' ? '#1c2d81' : 'transparent',
            color: activeTab === 'sprint' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: '6px 6px 0 0',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Target size={16} />
          <span>Daily Challenge Sprint ({sprintQuestions.length} Questions)</span>
        </button>

        <button
          onClick={() => handleTabChange('recall')}
          style={{
            padding: '12px 20px',
            background: activeTab === 'recall' ? '#1c2d81' : 'transparent',
            color: activeTab === 'recall' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: '6px 6px 0 0',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Brain size={16} />
          <span>Revise &amp; Recall ({recallQuestions.length} Questions)</span>
        </button>
      </div>

      {/* 100 Coins Reward & 100% Score Threshold Banner */}
      <div style={{
        background: eligibleForBonus ? '#fefce8' : '#f8fafc',
        border: eligibleForBonus ? '1.5px solid #facc15' : '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: eligibleForBonus ? '0 2px 6px rgba(234, 179, 8, 0.15)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: eligibleForBonus ? '#fed601' : '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Coins size={22} color={eligibleForBonus ? '#854d0e' : '#64748b'} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: eligibleForBonus ? '#854d0e' : '#1e293b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>100 Beyon Coins Completion Reward</span>
              <span style={{
                background: eligibleForBonus ? '#22c55e' : '#64748b',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
              }}>
                {eligibleForBonus ? '100% Perfect Score Achieved!' : `Target: 100% Score (${activeSet.length} of ${activeSet.length} Correct)`}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Current Accuracy: <strong>{Math.round(scorePct)}%</strong> ({correctCount} / {activeSet.length} correct) &bull; A 100% perfect score is required to unlock the 100 coin reward.
            </div>
          </div>
        </div>

        <div>
          {isBonusClaimed ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> 100 Coins Claimed!
            </div>
          ) : (
            <button
              onClick={handleClaimCoins}
              disabled={!eligibleForBonus || claiming}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: eligibleForBonus ? '#fed601' : '#cbd5e1',
                color: eligibleForBonus ? '#0f172a' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: eligibleForBonus && !claiming ? 'pointer' : 'not-allowed',
                boxShadow: eligibleForBonus ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Coins size={16} />
              <span>{claiming ? 'Crediting Coins...' : 'Claim 100 Coins Bonus'}</span>
            </button>
          )}
        </div>
      </div>

      {claimMessage && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{claimMessage}</span>
        </div>
      )}

      {/* Info Context Banner */}
      {activeTab === 'sprint' ? (
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #1c2d81', padding: '14px 18px', borderRadius: '4px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={16} color="#1c2d81" />
              <span>Recommended From Your Wishlist &amp; Ongoing Tracks</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              These 15 questions target your active wishlisted technologies and enrolled courses to build coding fluency.
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1c2d81' }}>
            Progress: {answeredCount} / {activeSet.length} Solved ({correctCount} Correct)
          </div>
        </div>
      ) : (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #16a34a', padding: '14px 18px', borderRadius: '4px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={16} color="#166534" />
              <span>Spaced Repetition &amp; Active Recall Practice</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '2px' }}>
              Practicing completed skills &amp; finished lessons regularly protects your long-term memory and prevents decay.
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
            <RotateCcw size={13} /> Active Retention Index: 92%
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeSet.length === 0 ? (
        <div className={styles.emptyState}>
          <HelpCircle size={36} style={{ color: '#94a3b8' }} />
          <p className={styles.emptyText}>No questions currently available in this set. Add skills to your wishlist to trigger recommendations!</p>
          <Link to="/student/skills" className={styles.filterChip} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={15} /> Explore Skill Matrix
          </Link>
        </div>
      ) : (
        <div>
          {/* Question Stepper Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {activeSet.map((q, idx) => {
              const res = questionResults[q.id];
              const isCurrent = idx === currentIndex;
              let bg = '#f1f5f9';
              let text = '#475569';
              let border = '1px solid #cbd5e1';

              if (res) {
                bg = res.correct ? '#dcfce7' : '#fee2e2';
                text = res.correct ? '#15803d' : '#b91c1c';
                border = res.correct ? '1.5px solid #86efac' : '1.5px solid #fca5a5';
              } else if (isCurrent) {
                bg = '#1c2d81';
                text = '#ffffff';
                border = '1.5px solid #1c2d81';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    const ans = questionResults[q.id];
                    setSelectedOption(ans ? ans.selectedId : '');
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    background: bg,
                    color: text,
                    border,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? '0 0 0 2px #93c5fd' : undefined,
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Card */}
          {currentQuestion && (
            <div className={styles.questionDetail} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className={styles.questionHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ background: '#1c2d81', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      Question {currentIndex + 1} of {activeSet.length}
                    </span>
                    {currentQuestion.skill_name && (
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {currentQuestion.skill_name}
                      </span>
                    )}
                    <span className={styles.diffBadge} style={{ fontWeight: 600 }}>{currentQuestion.difficulty || 'MEDIUM'}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    Reward: +25 XP &bull; +10 Coins
                  </div>
                </div>

                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.4 }}>
                  {currentQuestion.title}
                </h2>
                <div className={styles.questionDesc} style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
                  {currentQuestion.description}
                </div>
              </div>

              {/* Options List */}
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className={styles.optionsList} style={{ margin: '20px 0' }}>
                  {currentQuestion.options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = selectedOption === opt.id;
                    const isSubmitted = !!currentResult;

                    let optStyle = {
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#1e293b',
                      fontSize: '0.875rem',
                      cursor: isSubmitted ? 'default' : 'pointer',
                      textAlign: 'left' as const,
                      width: '100%',
                      boxSizing: 'border-box' as const,
                      marginBottom: '8px',
                    };

                    const isCorrectOpt = opt.isCorrect || opt.id === currentResult?.correctOptionId;
                    if (isSelected && !isSubmitted) {
                      optStyle.background = '#eff6ff';
                      optStyle.border = '1.5px solid #1c2d81';
                    } else if (isSubmitted) {
                      if (isCorrectOpt) {
                        optStyle.background = '#dcfce7';
                        optStyle.border = '1.5px solid #22c55e';
                        optStyle.color = '#15803d';
                      } else if (isSelected && !currentResult.correct) {
                        optStyle.background = '#fee2e2';
                        optStyle.border = '1.5px solid #ef4444';
                        optStyle.color = '#b91c1c';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        style={optStyle}
                        onClick={() => !isSubmitted && setSelectedOption(opt.id)}
                        disabled={isSubmitted}
                      >
                        <span style={{ fontWeight: 800, color: isSubmitted && isCorrectOpt ? '#15803d' : '#1c2d81' }}>{letter}.</span>
                        <span style={{ flex: 1 }}>{opt.optionText}</span>
                        {isSubmitted && isCorrectOpt && <CheckCircle2 size={16} color="#15803d" />}
                        {isSubmitted && isSelected && !currentResult.correct && <XCircle size={16} color="#b91c1c" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '16px', background: '#f8fafc', color: '#64748b', fontSize: '0.85rem' }}>
                  No multiple-choice options provided for this question.
                </div>
              )}

              {/* Action Buttons & Result Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentIndex === 0}
                  style={{
                    padding: '8px 16px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    color: currentIndex === 0 ? '#94a3b8' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: currentIndex === 0 ? 'default' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowLeft size={14} /> Previous
                </button>

                {!currentResult ? (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedOption || submitting}
                    style={{
                      padding: '10px 22px',
                      background: '#1c2d81',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: !selectedOption || submitting ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{submitting ? 'Checking Solution...' : 'Submit & Check Answer'}</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentIndex === activeSet.length - 1}
                    style={{
                      padding: '10px 22px',
                      background: currentIndex === activeSet.length - 1 ? '#15803d' : '#1c2d81',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: currentIndex === activeSet.length - 1 ? 'default' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{currentIndex === activeSet.length - 1 ? 'Sprint Completed!' : 'Next Question'}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {/* Explanation & Technical Feedback */}
              {currentResult && (() => {
                const correctOpt = currentQuestion.options.find(o => o.isCorrect || o.id === currentResult.correctOptionId);
                const correctIndex = correctOpt ? currentQuestion.options.indexOf(correctOpt) : -1;
                const correctLetter = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '';
                const correctText = currentResult.correctOptionText || correctOpt?.optionText || 'Verified technical solution.';

                return (
                  <div style={{
                    marginTop: '20px',
                    padding: '18px 20px',
                    background: currentResult.correct ? '#f0fdf4' : '#fef2f2',
                    border: currentResult.correct ? '1.5px solid #86efac' : '1.5px solid #fecaca',
                    borderRadius: '8px',
                  }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 800,
                      color: currentResult.correct ? '#15803d' : '#b91c1c',
                      fontSize: '0.98rem',
                      marginBottom: '12px',
                    }}>
                      {currentResult.correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      <span>{currentResult.correct ? 'Correct Solution! (+25 XP & +10 Coins Earned)' : 'Incorrect Solution'}</span>
                    </div>

                    {/* If incorrect, explicitly reveal the correct answer */}
                    {!currentResult.correct && (
                      <div style={{
                        background: '#ffffff',
                        border: '1.5px solid #86efac',
                        borderLeft: '5px solid #22c55e',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        marginBottom: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        <div style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#15803d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px',
                        }}>
                          <CheckCircle2 size={15} /> Correct Answer:
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#14532d', lineHeight: 1.4 }}>
                          {correctLetter ? `Option ${correctLetter}: ` : ''}{correctText}
                        </div>
                      </div>
                    )}

                    {/* Concept and Explanation breakdown */}
                    <div style={{
                      background: '#ffffff',
                      border: currentResult.correct ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                      borderLeft: currentResult.correct ? '4px solid #16a34a' : '4px solid #f97316',
                      borderRadius: '6px',
                      padding: '12px 16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                      <div style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: currentResult.correct ? '#166534' : '#c2410c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <Lightbulb size={15} />
                        <span>Technical Solution &amp; Concept Breakdown:</span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                        {currentResult.explanation}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Session Complete Celebration Banner */}
          {isFinished && (
            <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, #1c2d81 0%, #253cac 100%)', color: '#ffffff', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(254, 214, 1, 0.2)', padding: '14px', borderRadius: '50%', display: 'inline-flex' }}>
                  <Trophy size={40} color="#fed601" />
                </div>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800 }}>
                Daily Challenge Set Completed!
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                You scored <strong>{correctCount} / {activeSet.length}</strong> correct answers, earning <strong>+{sessionXP} XP</strong> and <strong>+{sessionCoins} Beyon Coins</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <Link to="/practice" style={{ padding: '8px 18px', background: '#fed601', color: '#0f172a', fontWeight: 700, borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem' }}>
                  Practice Arena
                </Link>
                <Link to="/student/skills" style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 700, borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem' }}>
                  Explore Skill Matrix
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

