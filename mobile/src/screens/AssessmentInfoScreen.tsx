import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';

const ASSIGNED_TESTS = [
  {
    id: 'test-gpu-kernel-01',
    title: 'CUDA & GPU Kernel Architecture Benchmark',
    durationMinutes: 45,
    totalQuestions: 25,
    passingScore: 75,
    difficulty: 'HARD',
  },
  {
    id: 'test-llm-fine-tuning-02',
    title: 'LLM Fine-Tuning & Distributed Training (LoRA/DeepSpeed)',
    durationMinutes: 40,
    totalQuestions: 20,
    passingScore: 70,
    difficulty: 'MEDIUM',
  },
  {
    id: 'test-distributed-systems-03',
    title: 'Distributed Consensus & High-Throughput Pipelines',
    durationMinutes: 50,
    totalQuestions: 30,
    passingScore: 80,
    difficulty: 'HARD',
  },
];

export const AssessmentInfoScreen: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    setCopiedId(id);
    Alert.alert('Session Token Copied!', `Token: ${id}\n\nPaste this token into the Beyon Desktop Lockdown Client on your computer to begin.`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Desktop Requirement Banner */}
      <View style={styles.lockdownBanner}>
        <View style={styles.tagRow}>
          <View style={styles.badgeLockdown}>
            <Text style={styles.badgeText}>🛡️ DESKTOP LOCKDOWN REQUIRED</Text>
          </View>
        </View>
        <Text style={styles.bannerTitle}>Proctored Assessment Center</Text>
        <Text style={styles.bannerSubtitle}>
          To maintain strict academic and recruitment standards, examinations run exclusively in the 
          <Text style={{ fontWeight: '900', color: colors.accent }}> Beyon Secure Desktop Client</Text> with AI biometric proctoring and fullscreen kiosk lockdown.
        </Text>
      </View>

      {/* Security Checklist */}
      <View style={styles.checklistCard}>
        <Text style={styles.checklistTitle}>Desktop Examination Guidelines:</Text>
        <View style={styles.checkItem}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.checkText}>Active webcam required for continuous biometric tracking.</Text>
        </View>
        <View style={styles.checkItem}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.checkText}>Kiosk mode prevents minimizing, tab switching, and quitting.</Text>
        </View>
        <View style={styles.checkItem}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.checkText}>Candidate absence for &gt;3 seconds triggers automated termination.</Text>
        </View>
        <View style={styles.checkItem}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.checkText}>Mobile phone detection triggers instant malpractice flags.</Text>
        </View>
      </View>

      {/* Assigned Assessments */}
      <Text style={styles.sectionHeading}>Your Assigned Assessments</Text>
      <View style={styles.testList}>
        {ASSIGNED_TESTS.map(t => (
          <View key={t.id} style={styles.testCard}>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle}>{t.title}</Text>
              <View style={styles.diffPill}>
                <Text style={styles.diffText}>{t.difficulty}</Text>
              </View>
            </View>

            <View style={styles.testMeta}>
              <Text style={styles.metaItem}>⏱️ {t.durationMinutes} mins</Text>
              <Text style={styles.metaItem}>❓ {t.totalQuestions} Questions</Text>
              <Text style={styles.metaItem}>🎯 Pass: {t.passingScore}%</Text>
            </View>

            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>SESSION TOKEN:</Text>
              <Text style={styles.tokenValue}>{t.id}</Text>
            </View>

            <TouchableOpacity
              style={[styles.copyBtn, copiedId === t.id && styles.copyBtnDone]}
              onPress={() => handleCopy(t.id)}
            >
              <Text style={[styles.copyBtnText, copiedId === t.id && styles.copyBtnTextDone]}>
                {copiedId === t.id ? '✓ Token Copied' : '📋 Copy Token for Desktop App'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
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
  lockdownBanner: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    padding: 18,
    marginBottom: 16,
  },
  tagRow: {
    marginBottom: 8,
  },
  badgeLockdown: {
    backgroundColor: 'rgba(254, 214, 1, 0.15)',
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.accent,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  checklistCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 18,
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  checkIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.success,
  },
  checkText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  testList: {
    gap: 14,
  },
  testCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    padding: 16,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
    flex: 1,
    marginRight: 8,
  },
  diffPill: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  diffText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.danger,
  },
  testMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tokenBox: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 12,
  },
  tokenLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: 2,
  },
  tokenValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.primary,
  },
  copyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
  },
  copyBtnDone: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  copyBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  copyBtnTextDone: {
    color: colors.success,
  },
});
