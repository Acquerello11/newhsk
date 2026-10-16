import { useSyncExternalStore } from 'react';

export type ModelId = 'gemini-2.5-flash' | 'pathumma-thaillm';

export type ModelOption = {
  id: ModelId;
  label: string;
  provider: string;
  description: string;
};

export const MODELS: ModelOption[] = [
  {
    id: 'pathumma-thaillm',
    label: 'Pathumma ThaiLLM 8B',
    provider: 'NECTEC · thaillm.or.th',
    description: 'โมเดลภาษาไทยพัฒนาโดยคนไทย — ค่าเริ่มต้น'
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'OpenRouter',
    description: 'โมเดลทางเลือก เร็วและแม่นยำสูง'
  }
];

const STORAGE_KEY_KEY = 'hsk-openrouter-key';
const STORAGE_KEY_MODEL = 'hsk-model';

export type SettingsState = {
  apiKey: string;
  modelId: ModelId;
  user: {
    username: string;
    isAdmin: boolean;
    role: string;
  } | null;
};

function loadSettings(): SettingsState {
  if (typeof window === 'undefined') {
    return { apiKey: '', modelId: 'pathumma-thaillm', user: { username: 'Learner', isAdmin: true, role: 'admin' } };
  }
  const key = localStorage.getItem(STORAGE_KEY_KEY) || '';
  const storedModel = localStorage.getItem(STORAGE_KEY_MODEL) as ModelId | null;
  const modelId = storedModel && MODELS.some((m) => m.id === storedModel) ? storedModel : 'pathumma-thaillm';
  
  return {
    apiKey: key,
    modelId,
    user: {
      username: 'ผู้เรียน (Guest)',
      isAdmin: true,
      role: 'admin'
    }
  };
}

let currentSettings: SettingsState = loadSettings();
const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== 'undefined') {
    if (currentSettings.apiKey) {
      localStorage.setItem(STORAGE_KEY_KEY, currentSettings.apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEY_KEY);
    }
    localStorage.setItem(STORAGE_KEY_MODEL, currentSettings.modelId);
  }
  listeners.forEach((fn) => fn());
}

export const settingsStore = {
  getSnapshot(): SettingsState {
    return currentSettings;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setApiKey(key: string) {
    currentSettings = { ...currentSettings, apiKey: key.trim() };
    notify();
  },

  setModelId(modelId: ModelId) {
    currentSettings = { ...currentSettings, modelId };
    notify();
  },

  setUser(user: SettingsState['user']) {
    currentSettings = { ...currentSettings, user };
    notify();
  }
};

export function useSettings() {
  const snapshot = useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getSnapshot,
    settingsStore.getSnapshot
  );

  return {
    ...snapshot,
    currentModelOption: MODELS.find((m) => m.id === snapshot.modelId) || MODELS[0],
    setApiKey: settingsStore.setApiKey,
    setModelId: settingsStore.setModelId,
    setUser: settingsStore.setUser
  };
}
