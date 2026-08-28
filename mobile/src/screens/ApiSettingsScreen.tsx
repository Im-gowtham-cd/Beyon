import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { getApiBaseUrl, setApiBaseUrl, pingBackend, DEFAULT_API_URL } from '../config/api';

interface ApiSettingsScreenProps {
  onClose: () => void;
}

export const ApiSettingsScreen: React.FC<ApiSettingsScreenProps> = ({ onClose }) => {
  const [urlInput, setUrlInput] = useState(getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; latencyMs: number; error?: string } | null>(null);

  useEffect(() => {
    setUrlInput(getApiBaseUrl());
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await pingBackend(urlInput);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = () => {
    if (!urlInput.trim()) {
      Alert.alert('Error', 'Please enter a valid Backend Service URL');
      return;
    }
    setApiBaseUrl(urlInput);
    Alert.alert('Saved', `Backend Service URL updated to:\n${getApiBaseUrl()}`);
    onClose();
  };

  const setPreset = (url: string) => {
    setUrlInput(url);
    setTestResult(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Backend Service Gateway</Text>
          <Text style={styles.subtitle}>Configure mobile API connectivity to local or remote services</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Active Endpoint:</Text>
          <View style={[styles.statusPill, { backgroundColor: testResult?.ok ? colors.successBg : colors.warningBg }]}>
            <Text style={[styles.statusPillText, { color: testResult?.ok ? colors.success : colors.warning }]}>
              {testResult?.ok ? `ONLINE (${testResult.latencyMs}ms)` : 'ACTIVE TARGET'}
            </Text>
          </View>
        </View>
        <Text style={styles.urlDisplay}>{getApiBaseUrl()}</Text>
      </View>

      {/* Input section */}
      <View style={styles.inputSection}>
        <Text style={styles.fieldLabel}>Custom Backend URL:</Text>
        <TextInput
          style={styles.textInput}
          value={urlInput}
          onChangeText={setUrlInput}
          placeholder="http://10.0.2.2:8085/api/v1"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.helpText}>
          Use 10.0.2.2 for Android Studio Emulator (maps to your PC localhost:8085) or your computer LAN IP for physical phones.
        </Text>
      </View>

      {/* Quick Presets */}
      <View style={styles.presetSection}>
        <Text style={styles.presetTitle}>Quick Presets:</Text>
        <View style={styles.presetGrid}>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => setPreset('http://10.0.2.2:8085/api/v1')}
          >
            <Text style={styles.presetBtnText}>📱 Android Emulator (10.0.2.2:8085)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => setPreset('http://localhost:8085/api/v1')}
          >
            <Text style={styles.presetBtnText}>💻 Localhost (8085)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => setPreset('http://10.0.2.2:8080/api/v1')}
          >
            <Text style={styles.presetBtnText}>⚙️ Alternate Port (8080)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.testBtn}
          onPress={handleTest}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={styles.testBtnText}>⚡ Test Connection</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save &amp; Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Test Feedback */}
      {testResult && (
        <View style={[styles.testFeedback, { borderColor: testResult.ok ? colors.successBorder : colors.dangerBorder, backgroundColor: testResult.ok ? colors.successBg : colors.dangerBg }]}>
          <Text style={[styles.testFeedbackTitle, { color: testResult.ok ? colors.success : colors.danger }]}>
            {testResult.ok ? '✓ Connection Verified Successfully' : '✕ Connection Failed'}
          </Text>
          <Text style={styles.testFeedbackDetail}>
            {testResult.ok
              ? `Backend responded with latency: ${testResult.latencyMs}ms`
              : `Error: ${testResult.error || 'Server unreachable. Ensure backend service is running.'}`}
          </Text>
        </View>
      )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    fontWeight: '800',
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    padding: 16,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  urlDisplay: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  helpText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 16,
  },
  presetSection: {
    marginBottom: 24,
  },
  presetTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  presetGrid: {
    gap: 8,
  },
  presetBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  testBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  testFeedback: {
    borderWidth: 1,
    padding: 14,
  },
  testFeedbackTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  testFeedbackDetail: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
