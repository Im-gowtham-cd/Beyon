import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';

export const CommunityScreen: React.FC = () => {
  const handlePost = () => {
    Alert.alert('Create Discussion', 'Open new technical topic / hackathon team request.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header card */}
      <View style={styles.headerCard}>
        <Text style={styles.tag}>GLOBAL PEER NETWORK</Text>
        <Text style={styles.title}>Beyon Engineering Community</Text>
        <Text style={styles.subtitle}>
          Connect with 12,000+ AI researchers, find hackathon teammates, and get 1-on-1 industry mentorship.
        </Text>
      </View>

      {/* Action banner */}
      <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
        <Text style={styles.postBtnText}>✍️ Start Technical Discussion or Project</Text>
      </TouchableOpacity>

      {/* Feed items */}
      <Text style={styles.sectionHeader}>Trending Engineering Discussions</Text>
      <View style={styles.feedList}>
        {[
          {
            id: 'post-1',
            author: 'Ananya Sharma',
            college: 'IIT Madras',
            title: 'Optimizing Triton FlashAttention kernel on H100 SXM5',
            summary: 'Benchmarking memory bandwidth vs standard PyTorch SDPA. Observed 3.2x speedup on sequence length 8192 with FP8 precision.',
            likes: 42,
            replies: 15,
            tag: 'GPU / CUDA',
          },
          {
            id: 'post-2',
            author: 'Rahul Verma',
            college: 'BITS Pilani',
            title: 'Looking for 2 teammates: HackMIT Autonomous Agent Track',
            summary: 'We are building an on-device multi-agent code refactor pipeline. Looking for Rust / React Native developers.',
            likes: 28,
            replies: 9,
            tag: 'Hackathon Team',
          },
          {
            id: 'post-3',
            author: 'Dr. Marcus Vance',
            college: 'Industry Mentor @ Meta AI',
            title: 'AMA: Transitioning from Web Dev to LLM Infrastructure',
            summary: 'Answering questions about low-level systems, CUDA fundamentals, and what hiring managers look for in 2026.',
            likes: 89,
            replies: 34,
            tag: 'Mentorship AMA',
          },
        ].map(item => (
          <View key={item.id} style={styles.feedCard}>
            <View style={styles.feedHeader}>
              <View>
                <Text style={styles.authorName}>{item.author}</Text>
                <Text style={styles.authorCollege}>{item.college}</Text>
              </View>
              <View style={styles.feedTag}>
                <Text style={styles.feedTagText}>{item.tag}</Text>
              </View>
            </View>

            <Text style={styles.feedTitle}>{item.title}</Text>
            <Text style={styles.feedSummary}>{item.summary}</Text>

            <View style={styles.feedFooter}>
              <Text style={styles.footerStat}>❤️ {item.likes} Likes</Text>
              <Text style={styles.footerStat}>💬 {item.replies} Replies</Text>
            </View>
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
  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    padding: 16,
    marginBottom: 12,
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
  postBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  postBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  feedList: {
    gap: 12,
  },
  feedCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  authorCollege: {
    fontSize: 10,
    color: colors.textMuted,
  },
  feedTag: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  feedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  feedTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  feedSummary: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  feedFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerStat: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
});
