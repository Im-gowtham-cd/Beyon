import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';

const SAMPLE_JOBS = [
  {
    id: 'job-1',
    company: 'Anthropic AI Systems',
    role: 'GPU Systems & Triton Kernel Engineer',
    type: 'FULL_TIME',
    location: 'San Francisco / Remote',
    stipend: '$180k - $240k',
    matchScore: 96,
    tags: ['CUDA', 'Triton', 'C++', 'NCCL'],
    posted: '2 days ago',
  },
  {
    id: 'job-2',
    company: 'NVIDIA Acceleration Labs',
    role: 'Distributed Deep Learning Intern',
    type: 'INTERNSHIP',
    location: 'Santa Clara / Hybrid',
    stipend: '$65 / hr',
    matchScore: 92,
    tags: ['DeepSpeed', 'PyTorch', 'ZeRO-3', 'vLLM'],
    posted: 'Just now',
  },
  {
    id: 'job-3',
    company: 'Scale AI Intelligence',
    role: 'High-Throughput Distributed Infrastructure Engineer',
    type: 'FULL_TIME',
    location: 'Remote',
    stipend: '$160k - $210k',
    matchScore: 89,
    tags: ['Kafka', 'gRPC', 'Golang', 'Kubernetes'],
    posted: '3 days ago',
  },
];

export const OpportunitiesScreen: React.FC = () => {
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const handleApply = (id: string, role: string, company: string) => {
    setAppliedIds(prev => [...prev, id]);
    Alert.alert(
      'Application Submitted!',
      `Your verified Beyon competency profile and 109 Skills Matrix have been submitted to ${company} for ${role}.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.tag}>RECRUITMENT &amp; PLACEMENT</Text>
        <Text style={styles.title}>Career &amp; Internship Opportunities</Text>
        <Text style={styles.subtitle}>
          Verified job matches based on your assessed skill benchmarks and engineering portfolio.
        </Text>
      </View>

      {/* Jobs list */}
      <View style={styles.jobsList}>
        {SAMPLE_JOBS.map(job => {
          const isApplied = appliedIds.includes(job.id);
          return (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.companyRow}>
                  <View style={styles.companyAvatar}>
                    <Text style={styles.companyAvatarText}>{job.company[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.companyName}>{job.company}</Text>
                    <Text style={styles.jobRole}>{job.role}</Text>
                  </View>
                </View>
                <View style={styles.matchPill}>
                  <Text style={styles.matchText}>{job.matchScore}% Match</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaItem}>📍 {job.location}</Text>
                <Text style={styles.metaItem}>💰 {job.stipend}</Text>
                <Text style={styles.metaItem}>🕒 {job.posted}</Text>
              </View>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {job.tags.map(t => (
                  <View key={t} style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{t}</Text>
                  </View>
                ))}
              </View>

              {/* Action */}
              <TouchableOpacity
                style={[styles.applyBtn, isApplied && styles.applyBtnDone]}
                onPress={() => handleApply(job.id, job.role, job.company)}
                disabled={isApplied}
              >
                <Text style={[styles.applyBtnText, isApplied && styles.applyBtnTextDone]}>
                  {isApplied ? '✓ Application Submitted' : 'Apply with Verified Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
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
  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    padding: 16,
    marginBottom: 16,
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
  jobsList: {
    gap: 14,
  },
  jobCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyRow: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  companyAvatar: {
    width: 34,
    height: 34,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyAvatarText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
  },
  companyName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  jobRole: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
  },
  matchPill: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.success,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  metaItem: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tagPill: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
  },
  applyBtnDone: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  applyBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  applyBtnTextDone: {
    color: colors.success,
  },
});
