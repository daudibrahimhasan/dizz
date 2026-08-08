import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { ChooseGenderScreen } from './ChooseGenderScreen';
import { DIZZStatsScreen } from './DIZZStatsScreen';

interface OnboardingScreenProps {
  onComplete: (gender: string) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [onboardingStage, setOnboardingStage] = useState<'video' | 'gender' | 'stats'>('video');
  const [selectedGender, setSelectedGender] = useState<string>('Skipped');
  const videoFadeAnim = useRef(new Animated.Value(1)).current;

  const handleVideoFinish = () => {
    Animated.timing(videoFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setOnboardingStage('gender');
    });
  };

  if (onboardingStage === 'gender') {
    return (
      <ChooseGenderScreen
        onSelectGender={(gender) => {
          setSelectedGender(gender);
          setOnboardingStage('stats');
        }}
        onSkip={() => {
          setSelectedGender('Skipped');
          setOnboardingStage('stats');
        }}
      />
    );
  }

  if (onboardingStage === 'stats') {
    return (
      <DIZZStatsScreen
        onContinue={() => onComplete(selectedGender)}
        onSkip={() => onComplete(selectedGender)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Clean Fullscreen Video / Splash Container (No Bottom Button) */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleVideoFinish}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View style={[styles.videoContainer, { opacity: videoFadeAnim }]}>
          <Image
            source={require('../../public/Dizz.png')}
            style={styles.fullSplashLogo}
            resizeMode="contain"
          />
          <Text style={styles.tapHint}>⚡ Tap to continue ⚡</Text>
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  fullSplashLogo: {
    width: 240,
    height: 160,
  },
  tapHint: {
    position: 'absolute',
    bottom: 40,
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
  },
});
