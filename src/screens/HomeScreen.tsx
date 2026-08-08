import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Slider from '@react-native-community/slider';

import { generateDirectReply } from '../services/directAiService';

const BACKEND_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

export function HomeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [reply, setReply] = useState<string>('');
  const [spiciness, setSpiciness] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null);
      setReply('');
      setCopied(false);
    }
  };

  const handleGenerate = async () => {
    if (!base64Image) {
      Alert.alert('No Image', 'Please upload a chat screenshot first.');
      return;
    }

    setLoading(true);
    setCopied(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const generated = await generateDirectReply('gemini', BACKEND_GEMINI_KEY, base64Image, spiciness);
      setReply(generated);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!reply) return;
    await Clipboard.setStringAsync(reply);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const spiceLabels = ['', 'Safe & Playful', 'Witty Banter', 'Bold & Direct'];

  return (
    <View className="flex-1 bg-[#DDE9FF] justify-between py-12 px-6">
      {/* Header */}
      <View className="mt-4">
        <Text className="text-2xl font-black text-gray-900 tracking-tight">Plug AI</Text>
        <Text className="text-xs text-gray-500 font-medium">AI Wingman Assistant</Text>
      </View>

      {/* Screenshot Frame / Picker */}
      {imageUri ? (
        <TouchableOpacity onPress={pickImage} activeOpacity={0.9} className="w-full h-[42%] rounded-3xl overflow-hidden shadow-md bg-white border border-white">
          <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={pickImage}
          className="w-full h-[42%] rounded-3xl border-2 border-dashed border-blue-400 bg-white/50 items-center justify-center p-6"
        >
          <Text className="text-blue-600 font-bold text-lg mb-1">Upload Screenshot</Text>
          <Text className="text-blue-400 text-xs text-center">Tap to select a chat or profile image</Text>
        </TouchableOpacity>
      )}

      {/* Generated Speech Bubble Output */}
      {reply ? (
        <TouchableOpacity
          onPress={copyToClipboard}
          activeOpacity={0.8}
          className="w-full bg-[#007AFF] px-5 py-4 rounded-3xl rounded-br-sm shadow-md flex-row justify-between items-center"
        >
          <Text className="text-white text-base font-medium leading-relaxed flex-1 mr-3">{reply}</Text>
          <View className="bg-white/20 px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-semibold">{copied ? '✓ Copied' : '📋 Copy'}</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Spiciness Level Control */}
      <View className="w-full px-2">
        <View className="flex-row justify-between items-center mb-1 px-1">
          <Text className="text-xs font-bold text-gray-600 uppercase tracking-wider">Spiciness Level</Text>
          <Text className="text-xs font-extrabold text-[#FF5252]">{spiceLabels[spiciness]}</Text>
        </View>
        <Slider
          style={{ width: '100%', height: 36 }}
          minimumValue={1}
          maximumValue={3}
          step={1}
          value={spiciness}
          onValueChange={(val) => setSpiciness(val)}
          minimumTrackTintColor="#FF5252"
          maximumTrackTintColor="#FFA726"
          thumbTintColor="#FF5252"
        />
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        onPress={handleGenerate}
        disabled={loading}
        className="w-full bg-[#FF5252] py-4 rounded-full items-center shadow-lg"
      >
        <Text className="text-white font-bold text-lg tracking-wide">
          {loading ? 'Thinking...' : reply ? 'Gimme More' : 'Get Reply'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
