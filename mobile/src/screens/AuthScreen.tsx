import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { login, register, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('gowtham@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'STUDENT' | 'INSTITUTION' | 'COMPANY'>('STUDENT');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Brand Header */}
      <View style={styles.brandCard}>
        <View style={styles.logoMark} />
        <Text style={styles.brandTitle}>Beyon Mobile</Text>
        <Text style={styles.brandSubtitle}>
          Verified Technical Competency &amp; Placement Platform
        </Text>
      </View>

      {/* Auth Card */}
      <View style={styles.authCard}>
        {/* Tab switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, !isRegister && styles.tabBtnActive]}
            onPress={() => { setIsRegister(false); setError(''); }}
          >
            <Text style={[styles.tabBtnText, !isRegister && styles.tabBtnTextActive]}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, isRegister && styles.tabBtnActive]}
            onPress={() => { setIsRegister(true); setError(''); }}
          >
            <Text style={[styles.tabBtnText, isRegister && styles.tabBtnTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Inputs */}
        {isRegister && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Gowtham K"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="candidate@university.edu"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.textInput}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
        </View>

        {isRegister && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Role</Text>
            <View style={styles.roleGrid}>
              {[
                { key: 'STUDENT', label: 'Student / Candidate' },
                { key: 'INSTITUTION', label: 'University' },
                { key: 'COMPANY', label: 'Recruiter' },
              ].map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.rolePill, role === r.key && styles.rolePillActive]}
                  onPress={() => setRole(r.key as any)}
                >
                  <Text style={[styles.rolePillText, role === r.key && styles.rolePillTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isRegister ? 'Create Account ➔' : 'Sign In to Portal ➔'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Demo Fast Login */}
        <TouchableOpacity
          style={styles.demoBtn}
          onPress={() => login('gowtham@example.com', 'password123')}
        >
          <Text style={styles.demoBtnText}>⚡ Fast Candidate Demo Login</Text>
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
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoMark: {
    width: 24,
    height: 24,
    backgroundColor: colors.accent,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  authCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
    padding: 20,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  textInput: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
  },
  roleGrid: {
    gap: 6,
  },
  rolePill: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rolePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  rolePillTextActive: {
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  demoBtn: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  demoBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 11,
  },
});
