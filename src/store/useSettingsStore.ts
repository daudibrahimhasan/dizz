import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type AIProvider = 'openai' | 'gemini' | 'anthropic';

interface SettingsState {
  apiKey: string;
  provider: AIProvider;
  modelName: string;
  isKeyLoaded: boolean;
  setApiKey: (key: string) => Promise<void>;
  setProvider: (provider: AIProvider) => Promise<void>;
  loadSettings: () => Promise<void>;
  clearSettings: () => Promise<void>;
}

const API_KEY_STORAGE_KEY = 'user_direct_api_key';
const PROVIDER_STORAGE_KEY = 'user_ai_provider';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiKey: '',
  provider: 'gemini',
  modelName: 'gemini-2.0-flash',
  isKeyLoaded: false,

  setApiKey: async (key: string) => {
    const trimmed = key.trim();
    await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, trimmed);
    set({ apiKey: trimmed });
  },

  setProvider: async (provider: AIProvider) => {
    await SecureStore.setItemAsync(PROVIDER_STORAGE_KEY, provider);
    const defaultModel = 
      provider === 'openai' ? 'gpt-4o' : 
      provider === 'gemini' ? 'gemini-2.0-flash' : 'claude-3-5-sonnet-20241022';
    set({ provider, modelName: defaultModel });
  },

  loadSettings: async () => {
    const key = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
    const provider = (await SecureStore.getItemAsync(PROVIDER_STORAGE_KEY)) as AIProvider || 'openai';
    const defaultModel = 
      provider === 'openai' ? 'gpt-4o' : 
      provider === 'gemini' ? 'gemini-2.0-flash' : 'claude-3-5-sonnet-20241022';
    
    set({
      apiKey: key || '',
      provider,
      modelName: defaultModel,
      isKeyLoaded: true,
    });
  },

  clearSettings: async () => {
    await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
    await SecureStore.deleteItemAsync(PROVIDER_STORAGE_KEY);
    set({ apiKey: '', provider: 'openai', modelName: 'gpt-4o' });
  },
}));
