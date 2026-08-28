import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

const SKILL_DOMAINS = [
  {
    domain: 'GPU & Systems Engineering',
    color: colors.primary,
    skills: [
      { name: 'CUDA Kernel Optimization', level: 'ADVANCED', mastery: 88 },
      { name: 'Triton Compiler & DSL', level: 'INTERMEDIATE', mastery: 72 },
      { name: 'NCCL Distributed Comm', level: 'ADVANCED', mastery: 84 },
      { name: 'TensorRT Inference Engines', level: 'INTERMEDIATE', mastery: 65 },
      { name: 'Vulkan Compute Pipelines', level: 'FOUNDATIONAL', mastery: 45 },
    ],
  },
  {
    domain: 'Applied AI & LLM Systems',
    color: '#0284c7',
    skills: [
      { name: 'LoRA & PEFT Adaptation', level: 'EXPERT', mastery: 94 },
      { name: 'DeepSpeed ZeRO-3 Memory', level: 'ADVANCED', mastery: 82 },
      { name: 'vLLM PagedAttention Serving', level: 'ADVANCED', mastery: 89 },
      { name: 'FlashAttention-2 Kernels', level: 'INTERMEDIATE', mastery: 70 },
      { name: 'Quantization (AWQ/GPTQ)', level: 'INTERMEDIATE', mastery: 68 },
    ],
  },
  {
    domain: 'Distributed Infrastructure',
    color: '#15803d',
    skills: [
      { name: 'Raft & Paxos Consensus', level: 'ADVANCED', mastery: 85 },
      { name: 'Kafka Streaming Pipelines', level: 'ADVANCED', mastery: 90 },
      { name: 'gRPC & Protobuf RPCs', level: 'EXPERT', mastery: 95 },
      { name: 'Kubernetes Operator Design', level: 'INTERMEDIATE', mastery: 64 },
      { name: 'Dolt Versioned SQL Database', level: 'ADVANCED', mastery: 80 },
    ],
  },
];

export const SkillsScreen: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  const filtered = selectedDomain === 'ALL'
    ? SKILL_DOMAINS
    : SKILL_DOMAINS.filter(d => d.domain === selectedDomain);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header card */}
      <View style={styles.headerCard}>
        <Text style={styles.tag}>CURRICULUM &amp; TAXONOMY</Text>
        <Text style={styles.title}>109 Verified Skills Matrix</Text>
        <Text style={styles.subtitle}>
          Track your technical competency progress across GPU architecture, AI systems, and distributed platforms.
        </Text>
      </View>

      {/* Domain filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterPill, selectedDomain === 'ALL' && styles.filterPillActive]}
          onPress={() => setSelectedDomain('ALL')}
        >
          <Text style={[styles.filterText, selectedDomain === 'ALL' && styles.filterTextActive]}>All Domains (109)</Text>
        </TouchableOpacity>
        {SKILL_DOMAINS.map(d => (
          <TouchableOpacity
            key={d.domain}
            style={[styles.filterPill, selectedDomain === d.domain && styles.filterPillActive]}
            onPress={() => setSelectedDomain(d.domain)}
          >
            <Text style={[styles.filterText, selectedDomain === d.domain && styles.filterTextActive]}>{d.domain}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Domain groups */}
      {filtered.map(group => (
        <View key={group.domain} style={styles.domainCard}>
          <View style={styles.domainHeader}>
            <View style={[styles.domainIndicator, { backgroundColor: group.color }]} />
            <Text style={styles.domainTitle}>{group.domain}</Text>
          </View>

          <View style={styles.skillsList}>
            {group.skills.map(s => (
              <View key={s.name} style={styles.skillItem}>
                <View style={styles.skillTop}>
                  <Text style={styles.skillName}>{s.name}</Text>
                  <Text style={styles.masteryText}>{s.mastery}%</Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${s.mastery}%`, backgroundColor: group.color }]} />
                </View>

                <View style={styles.skillMeta}>
                  <Text style={styles.levelTag}>{s.level}</Text>
                  <Text style={styles.statusVerified}>✓ Verified</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
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
  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    padding: 16,
    marginBottom: 14,
  },
  tag: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  domainCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  domainIndicator: {
    width: 10,
    height: 10,
  },
  domainTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  skillsList: {
    gap: 12,
  },
  skillItem: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  skillTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  masteryText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.border,
    marginBottom: 6,
  },
  progressBarFill: {
    height: 4,
  },
  skillMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statusVerified: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
});
