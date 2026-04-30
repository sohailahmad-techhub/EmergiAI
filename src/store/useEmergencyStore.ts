import { create } from 'zustand';

export type Severity = 'Low' | 'Medium' | 'Critical';
export type Language = 'en' | 'ur' | 'ps';

export interface Hospital {
  name: string;
  address: string;
  distance: string;
  link: string;
  lat: number;
  lng: number;
}

interface EmergencyState {
  language: Language;
  input: string;
  isRecording: boolean;
  isProcessing: boolean;
  location: { lat: number; lng: number } | null;
  result: {
    severity: Severity;
    actions: string[];
    nextSteps: string;
    localAdvice?: string;
    hospitals?: Hospital[];
  } | null;
  
  setLanguage: (lang: Language) => void;
  setInput: (input: string) => void;
  setRecording: (isRecording: boolean) => void;
  setProcessing: (isProcessing: boolean) => void;
  setLocation: (loc: { lat: number; lng: number } | null) => void;
  setResult: (result: EmergencyState['result']) => void;
  reset: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  language: 'en',
  input: '',
  isRecording: false,
  isProcessing: false,
  location: null,
  result: null,

  setLanguage: (language) => set({ language }),
  setInput: (input) => set({ input }),
  setRecording: (isRecording) => set({ isRecording }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setLocation: (location) => set({ location }),
  setResult: (result) => set({ result }),
  reset: () => set({ input: '', result: null, isProcessing: false, isRecording: false, location: null }),
}));
