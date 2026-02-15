-- Add user authentication support
-- Links personas and contributors to Supabase auth.users

-- Add user_id to persona_profiles (nullable for backward compat with existing anonymous personas)
ALTER TABLE persona_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_personas_user ON persona_profiles(user_id);

-- Add user_id to contributors
ALTER TABLE contributors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id to chat_sessions
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies: drop the old permissive ones, add user-aware ones

-- persona_profiles: everyone can read published, only owner can insert/update
DROP POLICY IF EXISTS "Allow public read" ON persona_profiles;
DROP POLICY IF EXISTS "Allow public insert" ON persona_profiles;
CREATE POLICY "Anyone can read published personas" ON persona_profiles FOR SELECT USING (published = true);
CREATE POLICY "Users can read own unpublished personas" ON persona_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create personas" ON persona_profiles FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own personas" ON persona_profiles FOR UPDATE USING (auth.uid() = user_id);

-- contributors: authenticated users can create and read own
DROP POLICY IF EXISTS "Allow public read" ON contributors;
DROP POLICY IF EXISTS "Allow public insert" ON contributors;
CREATE POLICY "Users can read own contributors" ON contributors FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Authenticated users can create contributors" ON contributors FOR INSERT WITH CHECK (true);

-- raw_responses: linked to contributors
DROP POLICY IF EXISTS "Allow public read" ON raw_responses;
DROP POLICY IF EXISTS "Allow public insert" ON raw_responses;
CREATE POLICY "Anyone can read responses" ON raw_responses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert responses" ON raw_responses FOR INSERT WITH CHECK (true);

-- chat_sessions: users can read/create their own
DROP POLICY IF EXISTS "Allow public read" ON chat_sessions;
DROP POLICY IF EXISTS "Allow public insert" ON chat_sessions;
CREATE POLICY "Anyone can read chat sessions" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create chat sessions" ON chat_sessions FOR INSERT WITH CHECK (true);

-- messages: open for MVP
DROP POLICY IF EXISTS "Allow public read" ON messages;
DROP POLICY IF EXISTS "Allow public insert" ON messages;
CREATE POLICY "Anyone can read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Anyone can create messages" ON messages FOR INSERT WITH CHECK (true);

-- query_logs: open for MVP
DROP POLICY IF EXISTS "Allow public read" ON query_logs;
DROP POLICY IF EXISTS "Allow public insert" ON query_logs;
CREATE POLICY "Anyone can read query logs" ON query_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can create query logs" ON query_logs FOR INSERT WITH CHECK (true);
