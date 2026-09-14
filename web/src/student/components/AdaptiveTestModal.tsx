import React, { useState } from 'react';
import { intelligenceApi } from '../../intelligence/services/intelligenceApi';
import {
  X,
  Sparkles,
  Target,
  Award,
  Layers,
  RotateCcw,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface QuestionOption {
  id: string;
  option_text: string;
  display_order: number;
}

interface QuestionItem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags?: string;
  skillName: string;
  options: QuestionOption[];
}

interface TestData {
  testId: string;
  title: string;
  totalQuestions: number;
  targetSkill: string;
  companionSkill: string;
  weakConcept: string;
  weakConceptTitle: string;
  breakdown: {
    targetSkillCount?: number;
    weakConceptTargetQuestions: number;
    otherTargetSkillQuestions: number;
    companionSkillQuestions: number;
    weakConceptPercentageOfTargetSkill: string;
  };
  questions: QuestionItem[];
}

interface AdaptiveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestCompleted?: () => void;
  testData: TestData | null;
  loading: boolean;
}

export const AdaptiveTestModal: React.FC<AdaptiveTestModalProps> = ({
  isOpen,
  onClose,
  onTestCompleted,
  testData,
  loading,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const questions = testData?.questions || [];
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!testData || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        testId: testData.testId,
        targetSkill: testData.targetSkill,
        companionSkill: testData.companionSkill,
        weakConcept: testData.weakConcept,
        answers: Object.entries(selectedAnswers).map(([qId, optId]) => ({
          questionId: qId,
          selectedOptionId: optId,
          timeSpentSeconds: 30,
        })),
      };

      const res = await intelligenceApi.submitAdaptiveTest(payload);
      setResult(res);
      if (onTestCompleted) {
        onTestCompleted();
      }
    } catch (err) {
      console.error('Failed to submit adaptive test:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #cbd5e1'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Target size={12} /> 50/50 Adaptive Diagnostic
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {testData ? `${testData.totalQuestions} Questions` : 'Loading test questions...'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {testData?.title || 'Targeted Weakness Retest'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* 50/50 Blueprint Banner */}
        {testData?.breakdown && !result && (
          <div style={{
            background: '#f1f5f9',
            padding: '10px 24px',
            fontSize: '0.78rem',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#1c2d81" />
              <strong>Blueprint Balance:</strong> {testData.breakdown?.targetSkillCount || 16} {testData.targetSkill || 'Target'} ({testData.breakdown?.weakConceptTargetQuestions || 8} {testData.weakConceptTitle || 'Target Concept'} + {testData.breakdown?.otherTargetSkillQuestions || 8} Other {testData.targetSkill || 'Target'}) + {testData.breakdown?.companionSkillQuestions || 14} {testData.companionSkill || 'Companion'}
            </span>
            <span style={{ color: '#0f766e', fontWeight: 600 }}>
              Weak Concept Allocation: {testData.breakdown?.weakConceptPercentageOfTargetSkill || '50%'} of Target Skill
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Sparkles size={32} color="#1c2d81" style={{ animation: 'spin 2s linear infinite' }} />
              <p style={{ marginTop: '16px', color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}>
                Synthesizing targeted questions with 50% weak concept allocation...
              </p>
            </div>
          ) : result ? (
            /* Results View */
            <div>
              <div style={{
                textAlign: 'center',
                padding: '24px 20px',
                background: result.overallScore >= 60 ? '#f0fdf4' : '#fffbeb',
                borderRadius: '8px',
                border: result.overallScore >= 60 ? '1px solid #bbf7d0' : '1px solid #fef3c7',
                marginBottom: '24px'
              }}>
                <Award size={40} color={result.overallScore >= 60 ? '#16a34a' : '#d97706'} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                  Assessment Score: {result.overallScore}%
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, maxWidth: '580px', marginLeft: 'auto', marginRight: 'auto' }}>
                  {result.feedback}
                </p>
              </div>

              {/* Performance Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                    Target Weak Concept
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1c2d81', marginBottom: '6px' }}>
                    {result.weakConceptPerformance?.concept || testData?.weakConceptTitle || 'Target Concept'}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#334155' }}>
                    Correct: <strong>{result.weakConceptPerformance?.correct} / {result.weakConceptPerformance?.total}</strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#0f766e', fontWeight: 600, marginTop: '4px' }}>
                    Accuracy: {result.weakConceptPerformance?.accuracy}%
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                    Other {result.targetSkill || testData?.targetSkill || 'Target'} Topics
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    {result.otherTargetSkillPerformance?.skill || 'General Topics'}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#334155' }}>
                    Correct: <strong>{result.otherTargetSkillPerformance?.correct} / {result.otherTargetSkillPerformance?.total}</strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, marginTop: '4px' }}>
                    Accuracy: {result.otherTargetSkillPerformance?.accuracy}%
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                    Companion Skill
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    {result.companionSkillPerformance?.skill || testData?.companionSkill || 'Companion Skill'}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#334155' }}>
                    Correct: <strong>{result.companionSkillPerformance?.correct} / {result.companionSkillPerformance?.total}</strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, marginTop: '4px' }}>
                    Accuracy: {result.companionSkillPerformance?.accuracy}%
                  </div>
                </div>
              </div>
            </div>
          ) : currentQ ? (
            /* Active Question View */
            <div>
              {/* Question Navigation Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#0369a1',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    {currentQ.skillName}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#475569',
                    background: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {currentQ.difficulty}
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
                <div style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  height: '100%',
                  background: '#1c2d81',
                  transition: 'width 0.2s ease'
                }} />
              </div>

              {/* Question Title & Description */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                {currentQ.title}
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, marginBottom: '20px', background: '#f8fafc', padding: '14px 16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {currentQ.description}
              </p>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {currentQ.options?.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.id;
                  const letter = String.fromCharCode(65 + idx);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #1c2d81' : '1px solid #cbd5e1',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: isSelected ? '#1c2d81' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#475569',
                      }}>
                        {letter}
                      </span>
                      <span style={{ fontSize: '0.88rem', color: isSelected ? '#0f172a' : '#334155', fontWeight: isSelected ? 600 : 400 }}>
                        {opt.option_text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              No questions found for this adaptive configuration.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          {result ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={14} /> Retake Assessment
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 20px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#1c2d81',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Complete &amp; Return to Matrix
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: currentIndex === 0 ? '#f1f5f9' : '#ffffff',
                    color: currentIndex === 0 ? '#94a3b8' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {answeredCount} of {questions.length} answered
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      background: '#1c2d81',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || answeredCount === 0}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '4px',
                      border: 'none',
                      background: isAllAnswered ? '#16a34a' : '#d97706',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: submitting || answeredCount === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {submitting ? 'Submitting...' : `Submit Assessment (${answeredCount}/${questions.length})`}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
