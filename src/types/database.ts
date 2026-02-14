export interface Contributor {
  id: string;
  consent_status: boolean;
  consent_timestamp?: string;
  created_at: string;
}

export interface RawResponse {
  id: string;
  contributor_id: string;
  question_number: number;
  question_text: string;
  response_text: string;
  response_word_count?: number;
  timestamp: string;
}

export interface PersonaProfile {
  id: string;
  contributor_id: string;
  name: string;
  age_range: string;
  location: string;
  avatar_emoji: string;
  narrative_summary: string;
  attributes_json: PersonaAttributes;
  confidence_scores: ConfidenceScores;
  published: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface PersonaAttributes {
  demographics: {
    apparent_age_range: string;
    gender: string;
    location: string;
    life_stage: string;
  };
  core_values: Array<{
    value: string;
    description: string;
    importance: number;
  }>;
  behavioral_patterns: Array<{
    pattern: string;
    description: string;
    frequency: 'often' | 'sometimes' | 'rare';
    confidence: number;
  }>;
  decision_style: string;
  purchase_drivers: string[];
  price_sensitivity: 'low' | 'low-medium' | 'medium' | 'medium-high' | 'high';
  brand_loyalty: string;
  influence_channels: string[];
  pain_points: Array<{
    pain_point: string;
    severity: number;
  }>;
  tags: string[];
}

export interface ConfidenceScores {
  overall: number;
  demographics: number;
  values: number;
  behavioral: number;
  decision_style: number;
}

export interface BusinessUser {
  id: string;
  email: string;
  organization?: string;
  plan_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  persona_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  persona?: PersonaProfile;
  message_count?: number;
  last_message?: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'persona';
  content: string;
  confidence_level?: number;
  explanation?: string;
  created_at: string;
}

export interface QueryLog {
  id: string;
  session_id: string;
  message_id: string;
  model_used: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}

// API request/response types
export interface OnboardingConsentRequest {
  consent: boolean;
}

export interface OnboardingResponseRequest {
  contributor_id: string;
  question_number: number;
  response_text: string;
}

export interface OnboardingCompleteRequest {
  contributor_id: string;
}

export interface ChatRequest {
  persona_id: string;
  message: string;
  session_id?: string;
}

export interface MultiChatRequest {
  persona_ids: string[];
  message: string;
}

export interface ChatResponse {
  message_id: string;
  response: string;
  confidence: number;
  explanation: string;
  session_id: string;
}

export interface DashboardStats {
  personas_available: number;
  total_chats: number;
  avg_confidence: number;
  panels_created: number;
  recent_sessions: ChatSession[];
}
