import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

const SAMPLE_QUESTIONS = [
  {
    id: 'q1',
    category: 'GPU & CUDA Architecture',
    difficulty: 'HARD',
    title: 'Warp Divergence in Branch Execution',
    question: 'In NVIDIA CUDA architecture, what happens when threads within the same 32-thread warp execute divergent code paths inside a conditional branch (if-else)?',
    options: [
      { id: 'A', text: 'All threads execute both paths in parallel simultaneously using dual issue.' },
      { id: 'B', text: 'The warp serially executes each branch path, disabling threads that are not on that path.' },
      { id: 'C', text: 'The GPU hardware splits the warp into two independent 16-thread warps permanently.' },
      { id: 'D', text: 'An out-of-memory GPU kernel exception is thrown immediately.' },
    ],
    correctId: 'B',
    explanation: 'When warp divergence occurs, the SIMT warp serially executes each divergent branch path while masking inactive threads, which reduces instruction throughput.',
  },
  {
    id: 'q2',
    category: 'Distributed Systems',
    difficulty: 'MEDIUM',
    title: 'Raft Consensus Leader Election',
    question: 'In the Raft consensus algorithm, how does a candidate node determine if it has successfully won a leader election for term T?',
    options: [
      { id: 'A', text: 'It receives a heartbeat acknowledgment from the previous leader.' },
      { id: 'B', text: 'It receives votes from a strict majority (quorum) of servers in the cluster.' },
      { id: 'C', text: 'It verifies that its local log index has exceeded 1,000 committed entries.' },
      { id: 'D', text: 'It queries the ZooKeeper metadata registry for leadership lock.' },
    ],
    correctId: 'B',
    explanation: 'A candidate wins an election if it receives votes from a strict majority (>50%) of all nodes in the cluster for that specific election term.',
  },
  {
    id: 'q3',
    category: 'LLM Fine-Tuning',
    difficulty: 'MEDIUM',
    title: 'LoRA Parameter-Efficient Adaptation',
    question: 'Low-Rank Adaptation (LoRA) freezes the pretrained model weights and injects trainable rank decomposition matrices into which layers typically?',
    options: [
      { id: 'A', text: 'Only the final classification softmax head.' },
      { id: 'B', text: 'Self-attention projection matrices (Wq, Wk, Wv, Wo).' },
      { id: 'C', text: 'The token vocabulary embedding table only.' },
      { id: 'D', text: 'The RMSNorm / LayerNorm scale and bias parameters.' },
    ],
    correctId: 'B',
    explanation: 'LoRA injects low-rank matrices A and B into the multi-head self-attention projection weights (Query, Key, Value, Output), vastly reducing trainable parameters.',
  },
];

export const PracticeScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const categories = ['ALL', 'GPU & CUDA', 'Distributed Systems', 'LLM Fine-Tuning'];

  const q = SAMPLE_QUESTIONS[currentIdx];
  const isCorrect = selectedOption === q.correctId;

  const handleSelect = (id: string) => {
    if (submitted) return;
    setSelectedOption(id);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    setSubmitted(true);
    if (selectedOption === q.correctId) {
      setScore(prev => prev + 10);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setCurrentIdx((currentIdx + 1) % SAMPLE_QUESTIONS.length);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catPillText, activeCategory === cat && styles.catPillTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress & Score Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>Question {currentIdx + 1} of {SAMPLE_QUESTIONS.length}</Text>
        <Text style={styles.scoreText}>Score: +{score} XP</Text>
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.categoryTag}>{q.category}</Text>
          <Text style={styles.difficultyTag}>{q.difficulty}</Text>
        </View>

        <Text style={styles.questionTitle}>{q.title}</Text>
        <Text style={styles.questionText}>{q.question}</Text>

        {/* Options */}
        <View style={styles.optionsList}>
          {q.options.map(opt => {
            const isSelected = selectedOption === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  submitted && opt.id === q.correctId && styles.optionCorrect,
                  submitted && isSelected && opt.id !== q.correctId && styles.optionWrong,
                ]}
                onPress={() => handleSelect(opt.id)}
                activeOpacity={0.8}
                disabled={submitted}
              >
                <View style={styles.marker}>
                  <Text style={styles.markerText}>{opt.id}</Text>
                </View>
                <Text style={styles.optionText}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation Card */}
        {submitted && (
          <View style={[styles.explanationCard, isCorrect ? styles.explanationCorrect : styles.explanationWrong]}>
            <Text style={styles.explanationTitle}>
              {isCorrect ? '✓ Correct Answer (+10 XP)' : '✕ Incorrect'}
            </Text>
            <Text style={styles.explanationBody}>{q.explanation}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionRow}>
          {!submitted ? (
            <TouchableOpacity
              style={[styles.submitBtn, !selectedOption && styles.submitBtnDisabled]}
              onPress={handleCheck}
              disabled={!selectedOption}
            >
              <Text style={styles.submitBtnText}>Check Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Next Question ➔</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  catPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  catPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  catPillTextActive: {
    color: '#ffffff',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.success,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    padding: 18,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  difficultyTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 6,
  },
  questionText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 16,
  },
  optionsList: {
    gap: 8,
    marginBottom: 16,
  },
  option: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionSelected: {
    backgroundColor: '#f8fafc',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  optionCorrect: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    borderWidth: 2,
  },
  optionWrong: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
    borderWidth: 2,
  },
  marker: {
    width: 22,
    height: 22,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  optionText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  explanationCard: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  explanationCorrect: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  explanationWrong: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  explanationBody: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  actionRow: {
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  nextBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextBtnText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 13,
  },
});
