import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

interface ProfileScreenProps {
  onOpenSettings: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenSettings }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Beyon Mobile?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name ? user.name[0] : 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Gowtham K'}</Text>
        <Text style={styles.userRole}>
          {user?.headline || 'AI & GPU Systems Engineering Student'}
        </Text>
        <Text style={styles.userInstitution}>
          🎓 {user?.institutionName || 'National Institute of Technology'}
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Identity Verified</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'STUDENT'}</Text>
          </View>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.statsCard}>
        <View style={styles.statCol}>
          <Text style={styles.statVal}>{user?.xpPoints ?? 1850}</Text>
          <Text style={styles.statLbl}>TOTAL XP</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statVal}>{user?.coins ?? 340}</Text>
          <Text style={styles.statLbl}>BEYON COINS</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statVal}>Top 4%</Text>
          <Text style={styles.statLbl}>GLOBAL RANK</Text>
        </View>
      </View>

      {/* Verified Certifications & Badges */}
      <Text style={styles.sectionHeader}>Verified Credentials &amp; Certifications</Text>
      <View style={styles.certList}>
        {[
          { title: 'NVIDIA CUDA Kernel Master', date: 'Aug 2026', code: 'CERT-CUDA-9812' },
          { title: 'Distributed Systems & Raft Consensus', date: 'Jul 2026', code: 'CERT-DIST-4401' },
          { title: 'LoRA & PEFT Fine-Tuning Specialist', date: 'Jun 2026', code: 'CERT-LLM-7729' },
        ].map(cert => (
          <View key={cert.code} style={styles.certCard}>
            <View style={styles.certIcon}>
              <Text style={styles.certIconText}>🏆</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.certTitle}>{cert.title}</Text>
              <Text style={styles.certMeta}>Issued {cert.date} &middot; {cert.code}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Settings & Logout */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.settingsBtn} onPress={onOpenSettings}>
          <Text style={styles.settingsBtnText}>⚙️ Backend Service Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>🚪 Log Out</Text>
        </TouchableOpacity>
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
  profileCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  userInstitution: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  verifiedBadge: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  roleBadge: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    paddingVertical: 14,
    marginBottom: 18,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  statLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  certList: {
    gap: 10,
    marginBottom: 20,
  },
  certCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  certIcon: {
    width: 32,
    height: 32,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certIconText: {
    fontSize: 16,
  },
  certTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  certMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  btnRow: {
    gap: 10,
  },
  settingsBtn: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  settingsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  logoutBtn: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.danger,
  },
});
