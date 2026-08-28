import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, StatusBar, Modal } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Header } from './src/components/Header';
import { BottomTabBar, TabKey } from './src/components/BottomTabBar';
import { HomeScreen } from './src/screens/HomeScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { SkillsScreen } from './src/screens/SkillsScreen';
import { OpportunitiesScreen } from './src/screens/OpportunitiesScreen';
import { AssessmentInfoScreen } from './src/screens/AssessmentInfoScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { ApiSettingsScreen } from './src/screens/ApiSettingsScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { colors } from './src/theme/colors';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  if (!user && !loading) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={setActiveTab} />;
      case 'practice':
        return <PracticeScreen />;
      case 'skills':
        return <SkillsScreen />;
      case 'opportunities':
        return <OpportunitiesScreen />;
      case 'assessment':
        return <AssessmentInfoScreen />;
      case 'community':
        return <CommunityScreen />;
      case 'profile':
        return <ProfileScreen onOpenSettings={() => setShowSettingsModal(true)} />;
      default:
        return <HomeScreen onNavigate={setActiveTab} />;
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'home': return 'Competency Engineering Hub';
      case 'practice': return 'Practice Arena & MCQs';
      case 'skills': return '109 Verified Skills Matrix';
      case 'opportunities': return 'Engineering Career Opportunities';
      case 'assessment': return 'Desktop Lockdown Center';
      case 'community': return 'Peer & Mentorship Network';
      case 'profile': return 'Verified Candidate Portfolio';
      default: return undefined;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      {/* Top Header */}
      <Header
        subtitle={getSubtitle()}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Screen Body */}
      <View style={styles.body}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      <BottomTabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Backend API Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <SafeAreaView style={styles.safeArea}>
          <ApiSettingsScreen onClose={() => setShowSettingsModal(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
});
