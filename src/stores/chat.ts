import { create } from 'zustand';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: string;
  explanation?: string;
  timestamp: Date;
}

interface ChatState {
  sessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  selectedPersonaId: string | null;

  setSessionId: (id: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setSelectedPersona: (id: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: null,
  messages: [],
  isLoading: false,
  selectedPersonaId: null,

  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedPersona: (id) => set({ selectedPersonaId: id }),
  clearChat: () => set({ sessionId: null, messages: [], selectedPersonaId: null }),
}));
