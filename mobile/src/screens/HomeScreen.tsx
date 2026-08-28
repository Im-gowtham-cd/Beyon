import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { TabKey } from '../components/BottomTabBar';

interface HomeScreenProps {
  onNavigate: (tab: TabKey) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Candidate';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>⚡ BEYON LEARNING MATRIX</Text>
          </View>
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>🔥 {user?.streakDays ?? 7} Day Streak</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Welcome back, {firstName}!</Text>
        <Text style={styles.heroSubtitle}>
          {user?.headline || 'Continuous GPU, AI & Distributed Systems Competency Engineering'}
        </Text>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user?.xpPoints ?? 1850}</Text>
            <Text style={styles.statLabel}>XP POINTS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user?.coins ?? 340}</Text>
            <Text style={styles.statLabel}>BEYON COINS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>109</Text>
            <Text style={styles.statLabel}>SKILLS MATRIX</Text>
          </View>
        </View>
      </View>

      {/* Daily Challenge Callout */}
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => onNavigate('practice')}
        activeOpacity={0.85}
      >
        <View style={styles.challengeLeft}>
          <Text style={styles.challengeBadge}>DAILY TECHNICAL CHALLENGE</Text>
          <Text style={styles.challengeTitle}>CUDA Warp Divergence &amp; Shared Memory Optimization</Text>
          <Text style={styles.challengeMeta}>Earn +50 XP &amp; +20 Beyon Coins &middot; Est. 10 mins</Text>
        </View>
        <View style={styles.challengeAction}>
          <Text style={styles.challengeActionText}>Solve ➔</Text>
        </View>
      </TouchableOpacity>

      {/* Primary Nav Grid */}
      <Text style={styles.sectionTitle}>Learning &amp; Career Hub</Text>
      <View style={styles.navGrid}>
        <TouchableOpacity
          style={styles.navCard}
          onPress={() => onNavigate('practice')}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>💻</Text>
          <Text style={styles.navCardTitle}>Practice Arena</Text>
          <Text style={styles.navCardDesc}>300+ MCQ, SQL &amp; algorithmic coding problems</Text>
          <View style={styles.navCardFooter}>
            <Text style={styles.navCardTag}>300+ Problems</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => onNavigate('skills')}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>🧬</Text>
          <Text style={styles.navCardTitle}>Skill Taxonomy</Text>
          <Text style={styles.navCardDesc}>Explore 109 GPU, AI &amp; systems engineering skills</Text>
          <View style={styles.navCardFooter}>
            <Text style={styles.navCardTag}>109 Matrix</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => onNavigate('opportunities')}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>💼</Text>
          <Text style={styles.navCardTitle}>Career Opportunities</Text>
          <Text style={styles.navCardDesc}>Verified internships &amp; software engineering roles</Text>
          <View style={styles.navCardFooter}>
            <Text style={styles.navCardTag}>Active Drives</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => onNavigate('assessment')}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>🛡️</Text>
          <Text style={styles.navCardTitle}>Assessment Center</Text>
          <Text style={styles.navCardDesc}>Launch proctored lockdown exams on Desktop</Text>
          <View style={styles.navCardFooter}>
            <Text style={styles.navCardTagLockdown}>Desktop Lockdown</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Community Section */}
      <TouchableOpacity
        style={styles.communityCard}
        onPress={() => onNavigate('community')}
        activeOpacity={0.85}
      >
        <Text style={styles.communityTag}>COLLABORATION &amp; NETWORKING</Text>
        <Text style={styles.communityTitle}>Join Engineering Discussions &amp; Peer Teams</Text>
        <Text style={styles.communityDesc}>
          Connect with 12,000+ AI researchers, software engineers, and university study groups.
        </Text>
      </TouchableOpacity>
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
  heroCard: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    padding: 20,
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTag: {
    backgroundColor: 'rgba(254, 214, 1, 0.15)',
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  heroTagText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  streakPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  streakText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.accent,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#e2e8f0',
    marginTop: 2,
  },
  challengeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.accentDark,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  challengeLeft: {
    flex: 1,
    paddingRight: 12,
  },
  challengeBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.accentDark,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  challengeMeta: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  challengeAction: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  challengeActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  navGrid: {
    gap: 12,
    marginBottom: 20,
  },
  navCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    padding: 16,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  navCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  navCardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  navCardFooter: {
    flexDirection: 'row',
  },
  navCardTag: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  navCardTagLockdown: {
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    fontSize: 10,
    fontWeight: '800',
    color: colors.info,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  communityCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  communityTag: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  communityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  communityDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
