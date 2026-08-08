import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useSettingsStore, AIProvider } from '../store/useSettingsStore';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

export const KeySettingsModal: React.FC<ModalProps> = ({ visible, onClose }) => {
  const { apiKey, provider, setApiKey, setProvider, clearSettings } = useSettingsStore();
  const [inputKey, setInputKey] = useState(apiKey);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey, visible]);

  const placeholders: Record<AIProvider, string> = {
    openai: 'sk-proj-...',
    gemini: 'AIzaSy...',
    anthropic: 'sk-ant-api...',
  };

  const handleSave = async () => {
    await setApiKey(inputKey);
    onClose();
  };

  const handleClear = async () => {
    await clearSettings();
    setInputKey('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 shadow-xl">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-gray-900">Bring Your Own Key (BYOK)</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Text className="text-gray-400 font-bold text-lg">✕</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-gray-500 mb-6 leading-relaxed">
            Your key is saved locally in secure device storage. Requests are sent directly to the AI provider without intermediate servers.
          </Text>

          {/* Provider Selection Tabs */}
          <Text className="text-sm font-semibold text-gray-700 mb-2">Select Provider:</Text>
          <View className="flex-row mb-4 bg-gray-100 p-1 rounded-xl">
            {(['openai', 'gemini', 'anthropic'] as AIProvider[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setProvider(p)}
                className={`flex-1 py-2.5 rounded-lg items-center ${
                  provider === p ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text className={`font-semibold capitalize text-xs ${provider === p ? 'text-black' : 'text-gray-400'}`}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Key Input with Dynamic Placeholder */}
          <Text className="text-sm font-semibold text-gray-700 mb-2">API Key:</Text>
          <TextInput
            value={inputKey}
            onChangeText={setInputKey}
            placeholder={placeholders[provider]}
            placeholderTextColor="#A1A1AA"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            className="border border-gray-200 bg-gray-50 rounded-xl p-4 text-base text-gray-800 mb-6"
          />

          {/* Actions */}
          <TouchableOpacity
            onPress={handleSave}
            className="bg-[#FF5252] py-4 rounded-full items-center mb-3 shadow-sm"
          >
            <Text className="text-white font-bold text-base">Save Key</Text>
          </TouchableOpacity>

          {apiKey ? (
            <TouchableOpacity
              onPress={handleClear}
              className="py-2 items-center"
            >
              <Text className="text-red-500 text-xs font-semibold">Remove Stored Key</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};
