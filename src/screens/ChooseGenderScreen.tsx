import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ChooseGenderScreenProps {
  onSelectGender: (gender: string) => void;
  onSkip: () => void;
}

export function ChooseGenderScreen({ onSelectGender, onSkip }: ChooseGenderScreenProps) {
  const handleSelect = async (gender: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSelectGender(gender);
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
        <View style={[styles.progressBar, styles.progressActive]} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
      </View>

      {/* Header */}
      <Text style={styles.headerText}>Choose gender</Text>

      {/* Main Content (Buttons) */}
      <View style={styles.content}>
        
        {/* Male Button */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.buttonWrapper}
          onPress={() => handleSelect('Male')}
        >
          <LinearGradient
            colors={['#8B9DF8', '#F3A3B9']} // Gradient matching the purple-to-pink hue
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradientBorder}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>Male</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Female Button */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.buttonWrapper}
          onPress={() => handleSelect('Female')}
        >
          <LinearGradient
            colors={['#8B9DF8', '#F3A3B9']} 
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradientBorder}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>Female</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Footer Skip Button */}
      <TouchableOpacity activeOpacity={0.6} onPress={handleSkipAction}>
        <Text style={styles.skipText}>skip</Text>
      </TouchableOpacity>

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
    width: 140, // Keeps the bars centered and contained
    marginTop: 20,
    marginBottom: 35,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333333', // Inactive gray
    borderRadius: 2,
    marginHorizontal: 4,
  },
  progressActive: {
    backgroundColor: '#FFFFFF', // Active white
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System', 
    marginTop: 10,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20, // Space between Male and Female buttons
  },
  buttonWrapper: {
    width: '85%',
    height: 56,
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 30, // Capsule shape
    padding: 2, // Controls the thickness of the gradient border
    alignItems: 'center',
    justify.content: 'center',
  },
  buttonInner: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000000', // Matches the app background to hollow it out
    borderRadius: 28, // Slightly less than the wrapper to keep the border smooth
    alignItems: 'center',
    justify.content: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipText: {
    color: '#555555', // Dim grey matching the UI
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  homeIndicator: {
    height: 4,
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
  }
});
