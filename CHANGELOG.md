# CHANGELOG.md — Lens Development History

All notable changes to the Lens project are documented here, reconstructed from git history.

## [0.4.0] — 2026-02-15

### Fixed
- **Dashboard persona count**: Total Personas now shows all published personas in the database (shared library) instead of filtering by user_id, which was returning 0 for all existing personas
- **Personalized user stats**: Chat Sessions, Total Messages, and Avg Latency are now filtered to the logged-in user's data

### Changed
- **Streamlined signup flow**: Removed email confirmation requirement — users are now automatically logged in and redirected to the homepage immediately after signup
- Removed the "check your email" confirmation screen from signup
- Simplified OAuth redirect URLs (removed unnecessary `next` parameter encoding)
- Auth callback now redirects to homepage `/` instead of `/auth/confirmed`

## [0.3.0] — 2026-02-14 (late evening)

### Added
- **User authentication system**: Full Supabase Auth integration with cookie-based sessions
- Login page with email/password and Google OAuth button
- Signup page with email/password and Google OAuth button
- Next.js middleware for route protection (`/onboarding`, `/dashboard`, `/chat/*`, `/panel`)
- `AuthProvider` React context for global auth state (`user`, `loading`, `signOut`)
- OAuth callback handler at `/auth/callback`
- Post-confirmation page at `/auth/confirmed` with countdown redirect

### Changed
- Root layout now wrapped with `<AuthProvider>`
- Landing page shows login/signup buttons when unauthenticated, dashboard/create/logout when authenticated
- Dashboard sidebar shows user email and sign out button
- API routes (`consent`, `complete`, `stats`) now link data to authenticated user via `getAuthUser()`
- All post-auth redirects go to homepage `/` instead of dashboard

### Database
- Migration `002_add_auth.sql`: Added `user_id` (UUID, nullable) to `persona_profiles`, `contributors`, and `chat_sessions`
- Updated RLS policies from anonymous-permissive to auth-aware (still permissive for MVP)

## [0.2.1] — 2026-02-14

### Added
- Saved working version snapshot before auth changes (tagged in git)
- `VERSION-LOG.md` with restore instructions

### Fixed
- Dashboard stats caching issue: Added `export const dynamic = 'force-dynamic'` to stats route

## [0.2.0] — 2026-02-13 (evening)

### Fixed
- **Vercel timeout errors**: Increased `maxDuration` to 30s for chat and evaluation routes, 60s for persona extraction
- **Claude API reliability**: Added retry logic (one retry) for persona extraction failures
- **Evaluation fallback**: Word-count heuristic scoring when Claude API is unavailable
- **Error handling**: Improved error responses across all API routes with consistent `{ error }` shape
- **Non-critical DB operations**: Chat and logging wrapped in try/catch — chat works even if database operations fail

## [0.1.0] — 2026-02-13

### Added — Initial MVP Release
- **Onboarding system**: 9-question interview wizard with consent tracking, per-answer AI scoring, and persona extraction via Claude
- **Persona extraction**: Claude analyzes all answers and produces structured JSON with narrative, demographics, values, behavioral patterns, interests, life context, decision style, communication style, taste signals, and confidence scores
- **Persona comparison**: After onboarding, Claude generates predicted answers to 5 comparison questions, displayed alongside the user's actual responses
- **Persona library**: Browse all personas with search (full-text across narrative and attributes) and decision-style filtering (analytical, emotional, social, practical)
- **Persona profiles**: Detailed view with narrative, values/patterns tags, taste signals, and confidence score bars
- **1:1 chat**: Conversational interface with a persona, showing confidence level (high/medium/low) and expandable explanations per message
- **Multi-persona panel**: Select 2-5 personas, ask one question, get individual responses plus consensus analysis (agreement level, common themes, key differences, insights)
- **Dashboard**: Stats overview (total personas, chat sessions, messages, avg latency) plus recent persona cards
- **Landing page**: Hero section with gradient background, feature highlights, and CTA
- **Demo seeding**: API route (`POST /api/seed`) seeds 4 demo personas; CLI script (`scripts/seed.ts`) seeds 6 detailed personas with full interview responses
- **Database**: 6-table PostgreSQL schema via Supabase (contributors, raw_responses, persona_profiles, chat_sessions, messages, query_logs)
- **State management**: Zustand stores for onboarding wizard and chat
- **Validation**: Zod schemas on all API inputs
- **Styling**: Custom Tailwind theme with accent colors, gradients, confidence badges
- **Deployment**: Vercel auto-deploy from GitHub at `lens-app-ivory.vercel.app`
