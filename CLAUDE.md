# CLAUDE.md — Lens MVP Briefing

> **For new sessions**: Start by reading this file, ARCHITECTURE.md, and MILESTONES.md.
> Compare against current codebase and git log. Report any drift before proceeding.
> At end of session, update all docs to reflect work done.

## Project Overview

Lens is an AI-powered consumer persona platform that transforms interview-style questionnaires into rich, chat-capable persona profiles. Users answer 9 onboarding questions, Claude (Anthropic's LLM) extracts a structured persona with narrative, attributes, and confidence scores, and the persona is stored in Supabase. Users can then chat with individual personas or run multi-persona "panel" queries to compare perspectives side-by-side.

## Tech Stack

- **Framework**: Next.js 14.2.29 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1 with custom theme (accent colors, gradients)
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js` 2.49.4
- **Auth**: Supabase Auth via `@supabase/ssr` 0.8.0 (cookie-based, Google OAuth + email/password)
- **AI/LLM**: Anthropic Claude API via `@anthropic-ai/sdk` 0.52.0, model `claude-sonnet-4-5-20250929`
- **Validation**: Zod 3.24.3
- **State**: Zustand 5.0.5 (onboarding + chat stores)
- **Icons**: Lucide React 0.468.0
- **Deployment**: Vercel (auto-deploy from GitHub, live at `lens-app-ivory.vercel.app`)

## How to Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev          # → http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint

# Seed demo personas (requires Supabase credentials)
npx tsx scripts/seed.ts
```

### Required Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://zpwzhkocgsabjxqyxzpy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
ANTHROPIC_API_KEY=<anthropic api key>
```

## Project Structure

```
lens-app/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # Landing page (hero + auth buttons)
│   │   ├── layout.tsx                # Root layout (AuthProvider wrapper)
│   │   ├── globals.css               # Tailwind + custom styles
│   │   ├── login/page.tsx            # Email/password + Google login
│   │   ├── signup/page.tsx           # Email/password + Google signup
│   │   ├── onboarding/page.tsx       # 9-question interview wizard
│   │   ├── dashboard/page.tsx        # Stats overview + recent personas
│   │   ├── personas/
│   │   │   ├── page.tsx              # Persona library with search/filter
│   │   │   └── [id]/page.tsx         # Individual persona profile
│   │   ├── chat/[personaId]/page.tsx # 1:1 chat with a persona
│   │   ├── panel/page.tsx            # Multi-persona comparison panel
│   │   ├── auth/
│   │   │   ├── callback/route.ts     # OAuth callback handler
│   │   │   └── confirmed/page.tsx    # Post-confirmation redirect page
│   │   └── api/                      # API routes
│   │       ├── onboarding/
│   │       │   ├── consent/route.ts  # Record contributor consent
│   │       │   ├── response/route.ts # Save individual answers
│   │       │   ├── evaluate/route.ts # AI-score each answer (1-10)
│   │       │   ├── complete/route.ts # Extract full persona via Claude
│   │       │   └── compare/route.ts  # Generate comparison answers
│   │       ├── chat/
│   │       │   ├── route.ts          # 1:1 persona chat
│   │       │   └── multi/route.ts    # Multi-persona panel query
│   │       ├── personas/
│   │       │   ├── route.ts          # List/filter personas
│   │       │   └── [id]/route.ts     # Get single persona
│   │       ├── dashboard/
│   │       │   └── stats/route.ts    # Dashboard statistics
│   │       └── seed/route.ts         # Seed 4 demo personas
│   ├── lib/
│   │   ├── claude.ts                 # Claude API helpers (extractPersona, chatWithPersona, multiPersonaChat)
│   │   ├── constants.ts              # Onboarding questions, comparison questions, app config
│   │   ├── prompts.ts                # System prompt templates for persona chat
│   │   ├── validation.ts             # Zod schemas for all API inputs
│   │   ├── utils.ts                  # Shared utilities (cn helper)
│   │   ├── auth-context.tsx          # React context for auth state (user, loading, signOut)
│   │   └── supabase/
│   │       ├── client.ts             # Browser-side Supabase client
│   │       └── server.ts             # Server-side clients (admin, anon, auth, getAuthUser)
│   ├── stores/
│   │   ├── onboarding.ts            # Zustand store for onboarding wizard state
│   │   └── chat.ts                  # Zustand store for chat state
│   └── types/
│       └── database.ts              # TypeScript types for DB tables
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql           # Initial schema (6 tables)
│       └── 002_add_auth.sql         # Auth migration (user_id columns + RLS)
├── scripts/
│   └── seed.ts                      # Seed script with 6 detailed demo personas
├── public/                          # Static assets (SVGs)
└── package.json
```

## Key Design Decisions

1. **Admin client for API routes**: All API routes use `createAdminClient()` (service role key) to bypass RLS, since server-side code handles its own auth checks. The cookie-based `createAuthClient()` is used only in middleware and `getAuthUser()`.

2. **Dual data strategy in onboarding**: The `/api/onboarding/complete` route accepts answers directly from the frontend (Strategy 1) OR fetches from Supabase via contributor_id (Strategy 2). This allows the app to work even if database tables have issues.

3. **Non-critical DB operations**: Chat and logging DB operations are wrapped in try/catch with `console.warn` — if the DB fails, the chat still works via in-memory history from the frontend.

4. **AI-powered answer scoring**: Each onboarding answer is scored 1-10 by Claude with a calibrated prompt (most reasonable answers score 5-7). Falls back to a word-count heuristic if the API fails.

5. **Multi-persona panel**: A unique feature where 2-5 personas answer the same question, followed by a consensus analysis with agreement levels, common themes, and key differences.

6. **Cookie-based auth**: Uses `@supabase/ssr` for server-side auth rather than client-side tokens, enabling middleware-based route protection.

7. **Email confirmation disabled**: Signup creates a session immediately (no confirmation email). Google OAuth is also supported.

## Current State

### Working
- Full onboarding flow (consent → 9 questions → AI evaluation → persona extraction)
- Persona library with search and decision-style filtering
- Individual persona profiles with narrative, attributes, confidence scores
- 1:1 chat with personas (with conversation history and confidence indicators)
- Multi-persona panel queries with consensus analysis
- Dashboard with personalized stats (persona count is global; sessions/messages are per-user)
- Authentication (email/password + Google OAuth via Supabase)
- Middleware route protection (protected: /onboarding, /dashboard, /chat, /panel)
- Demo persona seeding (4 via API, 6 via seed script)
- Deployed to Vercel at `lens-app-ivory.vercel.app`

### Partially Done
- Google OAuth: Code is wired up, awaiting credentials in Supabase dashboard
- `user_id` linking: New personas and chat sessions get user_id, but older data has null user_id
- RLS policies: Enabled but permissive ("always true") — adequate for MVP

### Known Issues / TODOs
- Chat sessions don't have `user_id` set on creation (the `chat/route.ts` insert doesn't include user_id)
- The `/auth/confirmed` page exists but is no longer in the main flow (email confirmation disabled)
- Sidebar navigation is duplicated across dashboard, personas, chat, and panel pages (could be extracted to a shared component)
- No loading skeleton on the landing page when auth state is resolving
- Persona search filtering happens client-side (fine for MVP, won't scale to thousands of personas)
- `scripts/seed.ts` seeds 6 personas; `/api/seed` seeds 4 different ones — duplicates possible

## Next Steps

1. **Complete Google OAuth setup** — Add Google Cloud credentials to Supabase
2. **Link chat sessions to users** — Add `user_id` to chat session creation in `chat/route.ts`
3. **Extract shared sidebar** — Create a reusable layout component
4. **Add persona editing** — Allow users to refine or re-run extraction
5. **Tighten RLS policies** — Move from "always true" to proper user-scoped policies
6. **Add error boundaries** — Graceful fallback UI for API failures
7. **Mobile responsive** — Current UI is desktop-only
8. **Analytics** — Track usage patterns for product decisions

## Conventions

- **File naming**: kebab-case for files, PascalCase for React components
- **API routes**: RESTful patterns with Zod validation, consistent error shapes `{ error: string }`
- **Styling**: Tailwind utility classes inline, custom CSS variables for accent/theme colors
- **State**: Zustand for complex client state (onboarding, chat); React useState for simple local state; AuthContext for global auth
- **Supabase clients**: `createAdminClient()` for API routes, `createClient()` for browser, `createAuthClient()` for auth-aware server operations
- **Error handling**: API routes return `{ error }` with appropriate HTTP status codes; LLM calls have retry logic and fallbacks
- **AI model**: All Claude calls use `claude-sonnet-4-5-20250929` with structured JSON output parsing
