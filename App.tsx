import React, { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DizzMainScreen } from './src/screens/DizzMainScreen';

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: isOnboarded ? '#E8ECFF' : '#000000' }}>
        <StatusBar style={isOnboarded ? 'dark' : 'light'} />
        {isOnboarded ? (
          <DizzMainScreen />
        ) : (
          <OnboardingScreen onComplete={() => setIsOnboarded(true)} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
