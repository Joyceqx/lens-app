-- Lens MVP Database Schema

-- Contributors (persona sources)
CREATE TABLE IF NOT EXISTS contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_status TEXT DEFAULT 'pending',
  consent_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Raw interview responses (immutable)
CREATE TABLE IF NOT EXISTS raw_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  question_number INT NOT NULL CHECK (question_number BETWEEN 1 AND 9),
  response_text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contributor_id, question_number)
);

-- Persona profiles (LLM-generated from raw responses)
CREATE TABLE IF NOT EXISTS persona_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID REFERENCES contributors(id) ON DELETE SET NULL,
  narrative TEXT,
  attributes_json JSONB DEFAULT '{}',
  confidence_scores JSONB DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_personas_published ON persona_profiles(published, created_at DESC);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES persona_profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_created ON chat_sessions(created_at DESC);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  confidence TEXT,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at ASC);

-- Query logs for analytics
CREATE TABLE IF NOT EXISTS query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  model_used TEXT DEFAULT 'claude-sonnet-4-5-20250929',
  latency_ms INT,
  tokens INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
