import { create } from 'zustand';

interface OnboardingState {
  contributorId: string | null;
  currentStage: 'consent' | 'privacy' | 'hook' | 'mode' | 'questions' | 'rewards' | 'comparison' | 'final';
  mode: 'voice' | 'text' | null;
  answers: Record<number, string>;
  enrichmentScore: number;
  consentGiven: boolean;
  isLoading: boolean;
  personaResult: any | null;

  setContributorId: (id: string) => void;
  setStage: (stage: OnboardingState['currentStage']) => void;
  setMode: (mode: 'voice' | 'text') => void;
  setAnswer: (questionNumber: number, answer: string) => void;
  setEnrichmentScore: (score: number) => void;
  setConsent: (consent: boolean) => void;
  setLoading: (loading: boolean) => void;
  setPersonaResult: (result: any) => void;
  reset: () => void;
}

const initialState = {
  contributorId: null,
  currentStage: 'consent' as const,
  mode: null,
  answers: {},
  enrichmentScore: 0,
  consentGiven: false,
  isLoading: false,
  personaResult: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setContributorId: (id) => set({ contributorId: id }),
  setStage: (stage) => set({ currentStage: stage }),
  setMode: (mode) => set({ mode }),
  setAnswer: (questionNumber, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionNumber]: answer },
    })),
  setEnrichmentScore: (score) => set({ enrichmentScore: score }),
  setConsent: (consent) => set({ consentGiven: consent }),
  setLoading: (loading) => set({ isLoading: loading }),
  setPersonaResult: (result) => set({ personaResult: result }),
  reset: () => set(initialState),
}));
