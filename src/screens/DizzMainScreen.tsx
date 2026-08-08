import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { generateDirectReply, analyzeChatWrapped, ChatWrappedResult } from '../services/directAiService';

const BACKEND_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

export function DizzMainScreen() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'generator' | 'wrapped'>('generator');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([
    "looks like we both have great taste in conversations 😏",
    "are you a parking ticket? cause you've got FINE written all over you.",
  ]);
  const [wrappedData, setWrappedData] = useState<ChatWrappedResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Splash Animation Values
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const mainAppScale = useRef(new Animated.Value(0.95)).current;
  const mainAppOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run Opening Animation Sequence
    Animated.sequence([
      // 1. Logo Scale & Fade In
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. Subtitle Fade In
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 3. Pause for Impact
      Animated.delay(700),
      // 4. Fade Out Splash & Reveal Main App UI
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(mainAppOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(mainAppScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowSplash(false);
    });
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null);
      setWrappedData(null);
    }
  };

  const handleCopy = async (text: string, idx?: number) => {
    await Clipboard.setStringAsync(text);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (idx !== undefined) {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleGenerate = async () => {
    if (!base64Image) {
      Alert.alert('No Image', 'Please upload a chat or profile screenshot first.');
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (activeTab === 'generator') {
        const rawOutput = await generateDirectReply(
          'gemini',
          BACKEND_GEMINI_KEY,
          base64Image,
          2,
          keyword
        );
        setSuggestions(Array.isArray(rawOutput) ? rawOutput : [rawOutput]);
      } else {
        const analytics = await analyzeChatWrapped(
          'gemini',
          BACKEND_GEMINI_KEY,
          base64Image
        );
        setWrappedData(analytics);
      }
    } catch (err: any) {
      Alert.alert('Gemini API Error', err.message || 'Failed to generate via Google Gemini API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0D19' }}>
      {/* Main App Content Container */}
      <Animated.View
        style={{
          flex: 1,
          opacity: mainAppOpacity,
          transform: [{ scale: mainAppScale }],
        }}
      >
        <LinearGradient
          colors={['#E8ECFF', '#F4F0FF', '#E8EEFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.mainContainer}>
              {/* Header Row */}
              <View style={styles.topHeader}>
                <Text style={styles.logoText}>DIZZZ</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={pickImage}
                  style={styles.uploadBtn}
                >
                  <Text style={styles.uploadBtnText}>Upload New +</Text>
                </TouchableOpacity>
              </View>

              {/* Segmented Mode Switcher */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setActiveTab('generator')}
                  style={[
                    styles.tabBtn,
                    activeTab === 'generator' && styles.activeTabBtn,
                  ]}
                >
                  <Text style={styles.tabIcon}>⚡</Text>
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'generator' ? styles.activeTabText : styles.inactiveTabText,
                    ]}
                  >
                    Dizz Generator
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setActiveTab('wrapped')}
                  style={[
                    styles.tabBtn,
                    activeTab === 'wrapped' && styles.activeTabBtn,
                  ]}
                >
                  <Text style={styles.tabIcon}>📊</Text>
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'wrapped' ? styles.activeTabText : styles.inactiveTabText,
                    ]}
                  >
                    Chat Wrapped
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                {/* Dashed Dropzone */}
                {imageUri ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={pickImage}
                    style={styles.imageFrame}
                  >
                    <Image source={{ uri: imageUri }} style={styles.fullImage} resizeMode="cover" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={pickImage}
                    style={styles.dashedDropzone}
                  >
                    <View style={styles.iconBg}>
                      <Text style={{ fontSize: 22 }}>📱</Text>
                    </View>
                    <Text style={styles.dropzoneTitle}>Upload Chat or Profile</Text>
                    <Text style={styles.dropzoneSubtitle}>Tap to choose screenshot</Text>
                  </TouchableOpacity>
                )}

                {activeTab === 'generator' ? (
                  <>
                    {/* Focus Word Input Field */}
                    <View style={styles.inputBox}>
                      <TextInput
                        value={keyword}
                        onChangeText={setKeyword}
                        placeholder="Give us a word or two to focus on"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                      />
                    </View>

                    {/* Lightning Label Divider */}
                    <View style={{ alignItems: 'center', marginVertical: 10 }}>
                      <Text style={styles.dividerText}>
                        ⚡ tap a reply to copy and paste ⚡
                      </Text>
                    </View>

                    {/* Generated Suggestion Cards */}
                    {suggestions.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.8}
                        onPress={() => handleCopy(item, idx)}
                        style={styles.card}
                      >
                        <Text style={styles.cardText}>{item}</Text>
                        <Text style={[styles.copyIcon, copiedIndex === idx && { opacity: 1, color: '#10B981' }]}>
                          {copiedIndex === idx ? '✓ Copied' : '📋'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  /* Chat Wrapped View */
                  <View style={styles.wrappedCard}>
                    <Text style={styles.wrappedTitle}>🔥 Chat Chemistry Report</Text>
                    {wrappedData ? (
                      <>
                        <View style={{ marginBottom: 12 }}>
                          <View style={styles.metricHeader}>
                            <Text style={styles.metricLabel}>Match Interest Level</Text>
                            <Text style={[styles.metricVal, { color: '#4F46E5' }]}>{wrappedData.interestLevelMatch}%</Text>
                          </View>
                          <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${wrappedData.interestLevelMatch}%`, backgroundColor: '#4F46E5' }]} />
                          </View>

                          <View style={[styles.metricHeader, { marginTop: 10 }]}>
                            <Text style={styles.metricLabel}>Compatibility Score</Text>
                            <Text style={[styles.metricVal, { color: '#10B981' }]}>{wrappedData.compatibilityScore}%</Text>
                          </View>
                          <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${wrappedData.compatibilityScore}%`, backgroundColor: '#10B981' }]} />
                          </View>
                        </View>

                        <View style={styles.attachmentBox}>
                          <Text style={styles.attachmentLabel}>ATTACHMENT DYNAMIC</Text>
                          <Text style={styles.attachmentVal}>{wrappedData.attachmentStyle}</Text>
                        </View>

                        <Text style={[styles.flagHeader, { color: '#10B981' }]}>🟢 GREEN FLAGS</Text>
                        {wrappedData.greenFlags.map((flag, i) => (
                          <Text key={i} style={styles.flagText}>• {flag}</Text>
                        ))}

                        <Text style={[styles.flagHeader, { color: '#EF4444', marginTop: 12 }]}>🔴 RED FLAGS</Text>
                        {wrappedData.redFlags.map((flag, i) => (
                          <Text key={i} style={styles.flagText}>• {flag}</Text>
                        ))}
                      </>
                    ) : (
                      <Text style={styles.wrappedPlaceholder}>
                        Tap "Analyze Chat Wrapped" below to calculate chemistry scores & red/green flags.
                      </Text>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Primary Action Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleGenerate}
                disabled={loading}
                style={styles.mainCta}
              >
                <Text style={styles.mainCtaText}>
                  {loading
                    ? '⚡ thinking... ⚡'
                    : activeTab === 'generator'
                    ? "⚡ gimme' more dizz ⚡"
                    : '⚡ Analyze Chat Wrapped ⚡'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      {/* Opening Splash Overlay */}
      {showSplash && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: '#0B0D19',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: splashOpacity,
              zIndex: 999,
            },
          ]}
        >
          <StatusBar barStyle="light-content" />
          <Animated.View
            style={{
              alignItems: 'center',
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <Text style={styles.splashLogo}>DIZZZ</Text>
            <Animated.Text
              style={[
                styles.splashSubtitle,
                { opacity: subtitleOpacity },
              ]}
            >
              ⚡ AI Wingman & Chemistry Analytics ⚡
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 16,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 34,
    fontStyle: 'italic',
    fontWeight: '900',
    letterSpacing: -1.5,
    color: '#121526',
  },
  uploadBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: 4,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIcon: { fontSize: 12, marginRight: 6 },
  tabText: { fontSize: 13, fontWeight: '700' },
  activeTabText: { color: '#12131A' },
  inactiveTabText: { color: '#9CA3AF' },
  dashedDropzone: {
    width: '100%',
    height: 220,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  imageFrame: {
    width: '100%',
    height: 220,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  fullImage: { width: '100%', height: '100%' },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dropzoneTitle: { fontSize: 15, fontWeight: '700', color: '#4F46E5', marginBottom: 2 },
  dropzoneSubtitle: { fontSize: 12, color: '#818CF8', fontWeight: '500' },
  inputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  input: { fontSize: 13, color: '#1F2937', fontWeight: '500' },
  dividerText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justify.content: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardText: { fontSize: 13, fontWeight: '600', color: '#1F2937', flex: 1, marginRight: 12, lineHeight: 18 },
  copyIcon: { fontSize: 14, opacity: 0.5 },
  wrappedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
  },
  wrappedTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#151930',
    marginBottom: 14,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  attachmentBox: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 16,
    marginVertical: 12,
  },
  attachmentLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  attachmentVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
    marginTop: 2,
  },
  flagHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  flagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  wrappedPlaceholder: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  mainCta: {
    width: '100%',
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  mainCtaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  splashLogo: {
    fontSize: 54,
    fontStyle: 'italic',
    fontWeight: '900',
    letterSpacing: -2,
    color: '#FFFFFF',
    textShadowColor: 'rgba(99, 102, 241, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  splashSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
