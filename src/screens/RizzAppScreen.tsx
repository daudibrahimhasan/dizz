import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { generateDirectReply, analyzeChatWrapped, ChatWrappedResult } from '../services/directAiService';

const BACKEND_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

export function RizzAppScreen() {
  const [activeTab, setActiveTab] = useState<'generator' | 'wrapped'>('generator');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([
    "looks like we both have great taste in conversations 😏",
    "are you a parking ticket? cause you've got FINE written all over you.",
    "let's skip the small talk and grab coffee this friday.",
  ]);
  const [wrappedData, setWrappedData] = useState<ChatWrappedResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const handleCopy = async (text: string, idx: number) => {
    await Clipboard.setStringAsync(text);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
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
      Alert.alert('Error', err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#E6ECFF', '#F4F0FF', '#E8EEFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.container}>
          {/* Header Bar */}
          <View style={styles.header}>
            <Text style={styles.logoText}>DIZZZ</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickImage}
              style={styles.uploadNewBtn}
            >
              <Text style={styles.uploadNewText}>Upload New +</Text>
            </TouchableOpacity>
          </View>

          {/* Segmented Tab Switcher */}
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
                  activeTab === 'generator'
                    ? styles.activeTabText
                    : styles.inactiveTabText,
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
                  activeTab === 'wrapped'
                    ? styles.activeTabText
                    : styles.inactiveTabText,
                ]}
              >
                Chat Wrapped
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Dashed Dropzone */}
            {imageUri ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={pickImage}
                style={styles.imagePreviewFrame}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={pickImage}
                style={styles.dashedDropzone}
              >
                <View style={styles.dropzoneIconBg}>
                  <Text style={{ fontSize: 22 }}>📱</Text>
                </View>
                <Text style={styles.dropzoneTitle}>Upload Chat or Profile</Text>
                <Text style={styles.dropzoneSubtitle}>Tap to choose screenshot</Text>
              </TouchableOpacity>
            )}

            {activeTab === 'generator' ? (
              <>
                {/* Focus Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    value={keyword}
                    onChangeText={setKeyword}
                    placeholder="Give us a word or two to focus on"
                    placeholderTextColor="#9AA0A6"
                    style={styles.textInput}
                  />
                </View>

                {/* Lightning Label Divider */}
                <View style={styles.dividerRow}>
                  <Text style={styles.dividerText}>
                    ⚡ tap a reply to copy and paste ⚡
                  </Text>
                </View>

                {/* Generated Reply Cards */}
                {suggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => handleCopy(item, idx)}
                    style={styles.replyCard}
                  >
                    <Text style={styles.replyText}>{item}</Text>
                    <Text style={[styles.copyIcon, copiedIndex === idx && { color: '#10B981', opacity: 1 }]}>
                      {copiedIndex === idx ? '✓ Copied' : '📋'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              /* Chat Wrapped Analytics View */
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

          {/* Bottom Dock CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGenerate}
            disabled={loading}
            style={styles.mainCtaBtn}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontStyle: 'italic',
    fontWeight: '900',
    letterSpacing: -1.5,
    color: '#151930',
  },
  uploadNewBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  uploadNewText: {
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
    borderColor: 'rgba(255, 255, 255, 0.8)',
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#12131A',
  },
  inactiveTabText: {
    color: '#9CA3AF',
  },
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
  imagePreviewFrame: {
    width: '100%',
    height: 220,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  dropzoneIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justify.content: 'center',
    marginBottom: 8,
  },
  dropzoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 2,
  },
  dropzoneSubtitle: {
    fontSize: 12,
    color: '#818CF8',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  textInput: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  dividerRow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  replyCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  replyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
    lineHeight: 18,
  },
  copyIcon: {
    fontSize: 14,
    opacity: 0.5,
  },
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
  mainCtaBtn: {
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
  },
  mainCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
