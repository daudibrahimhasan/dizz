import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const StarIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="#FFC966" style={{ marginHorizontal: 2 }}>
    <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </Svg>
);

// Vector graphic mimicking the laurel wreath curve
const LaurelWreathLeft = () => (
  <Svg width="50" height="130" viewBox="0 0 50 130" fill="none">
    <Path d="M45,125 C 10,105 0,55 25,5" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <Path d="M42,118 Q 22,118 25,130 Q 42,125 42,118 Z" fill="#FFFFFF" />
    <Path d="M31,93 Q 11,93 14,105 Q 31,100 31,93 Z" fill="#FFFFFF" />
    <Path d="M21,68 Q 1,68 4,80 Q 21,75 21,68 Z" fill="#FFFFFF" />
    <Path d="M15,43 Q -5,43 -2,55 Q 15,50 15,43 Z" fill="#FFFFFF" />
    <Path d="M18,18 Q -2,18 1,30 Q 18,25 18,18 Z" fill="#FFFFFF" />
    <Path d="M25,5 Q 15,-5 35,5 Z" fill="#FFFFFF" />
  </Svg>
);

interface DIZZStatsScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

export function DIZZStatsScreen({ onContinue, onSkip }: DIZZStatsScreenProps) {
  const handleReviewAction = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onContinue();
  };

  const handleSkipAction = async () => {
    await Haptics.selectionAsync();
    onSkip();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar} />
        <View style={[styles.progressBar, styles.progressActive]} />
        <View style={styles.progressBar} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitleText}>#1 AI Dating Assistant</Text>

      {/* Main Content Area */}
      <View style={styles.content}>
        
        {/* Official Dizz Logo Image (no-bg) */}
        <Image
          source={require('../../public/Dizz-no-bg.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        {/* Stats Block with Wreaths */}
        <View style={styles.statsRow}>
          <LaurelWreathLeft />
          
          <View style={styles.statsCenter}>
            <Text style={styles.statsNumber}>50M+</Text>
            <Text style={styles.statsLabel}>Bullishit Generated</Text>
            
            {/* 5-Star Rating */}
            <View style={styles.starsContainer}>
              <StarIcon />
              <StarIcon />
              <StarIcon />
              <StarIcon />
              <StarIcon />
            </View>
          </View>
          
          <View style={styles.flipRight}>
            <LaurelWreathLeft />
          </View>
        </View>

      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.ctaWrapper}
          onPress={handleReviewAction}
        >
          <LinearGradient
            colors={['#F3A3B9', '#8B9DF8']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Leave a review</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.6} 
          style={styles.skipButton}
          onPress={handleSkipAction}
        >
          <Text style={styles.skipText}>skip</Text>
        </TouchableOpacity>
      </View>

      {/* iOS Home Indicator Spacer */}
      {Platform.OS === 'ios' && <View style={styles.homeIndicator} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginHorizontal: 4,
  },
  progressActive: {
    backgroundColor: '#FFFFFF',
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 'auto', 
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -80, // Centers it visually accounting for the top bars
  },
  maskedViewContainer: {
    height: 80,
    width: '100%',
    marginBottom: 10,
  },
  maskWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 170,
    height: 75,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  statsCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  statsNumber: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 5,
  },
  statsLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipRight: {
    transform: [{ scaleX: -1 }], // Flips the left wreath to point right
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  ctaWrapper: {
    width: '85%',
    height: 56,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
  },
  ctaGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipText: {
    color: '#555555',
    fontSize: 16,
    fontWeight: '600',
  },
  homeIndicator: {
    height: 4,
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
  }
});
