# MILESTONES.md — Lens Development Progress

## Completed Milestones

### Milestone 1: Core MVP (Feb 13, 2026)
The foundational platform with the complete user journey from onboarding to chat.

- [x] Database schema design (6 tables in Supabase)
- [x] 9-question onboarding wizard with step-by-step UI
- [x] AI-powered answer scoring (Claude evaluates each response 1-10)
- [x] Persona extraction via Claude (narrative + structured attributes + confidence scores)
- [x] Persona comparison step (predicted answers vs. actual)
- [x] Persona library page with search and decision-style filtering
- [x] Individual persona profile pages with confidence bars
- [x] 1:1 chat with personas (conversation history, confidence indicators, explanations)
- [x] Multi-persona panel (2-5 personas, consensus analysis)
- [x] Dashboard with stats overview
- [x] Landing page with hero section
- [x] Demo persona seeding (API route + CLI script)
- [x] Zustand state management for onboarding and chat
- [x] Zod validation on all API inputs
- [x] Custom Tailwind theme with accent colors and gradients
- [x] Deploy to Vercel

### Milestone 2: Production Hardening (Feb 13-14, 2026)
Fixes for real-world deployment issues discovered after launch.

- [x] Fix Vercel serverless timeouts (increase maxDuration to 30-60s)
- [x] Add retry logic for Claude API calls in persona extraction
- [x] Word-count fallback heuristic when AI scoring fails
- [x] Improve error handling across all API routes
- [x] Fix dashboard stats caching (force-dynamic)
- [x] Non-critical DB operations wrapped in try/catch (chat still works if DB fails)

### Milestone 3: User Authentication (Feb 14-15, 2026)
Full auth system enabling multi-user support.

- [x] Supabase Auth integration with `@supabase/ssr` (cookie-based)
- [x] Login page (email/password + Google OAuth button)
- [x] Signup page (email/password + Google OAuth button)
- [x] Next.js middleware for route protection
- [x] AuthProvider context (user, loading, signOut)
- [x] OAuth callback handler (/auth/callback)
- [x] Database migration: add user_id columns to persona_profiles, contributors, chat_sessions
- [x] Updated RLS policies for auth-aware access
- [x] API routes updated to link data to authenticated users
- [x] Dashboard personalized stats (sessions/messages per user, personas global)
- [x] UI updates: login/signup buttons on landing, user email + sign out in dashboard sidebar
- [x] Streamlined signup: auto-login without email confirmation
- [x] Post-login/signup redirects to homepage

## Current Milestone

### Milestone 4: Google OAuth + Polish (In Progress)
Completing the Google sign-in setup and polishing the auth experience.

- [x] Google OAuth code wired up in login/signup pages
- [x] Auth callback route handles OAuth code exchange
- [ ] Add Google Cloud OAuth credentials to Supabase dashboard
- [ ] Test full Google sign-in flow end-to-end
- [ ] Link chat sessions to user_id on creation (currently missing in chat/route.ts)
- [ ] Clean up /auth/confirmed page (no longer in main flow)

## Suggested Future Milestones

### Milestone 5: UX & Component Quality
Improve the user experience and code maintainability.

- [ ] Extract shared sidebar into reusable layout component (currently duplicated 5x)
- [ ] Add mobile responsive design (currently desktop-only)
- [ ] Add loading skeletons and error boundaries
- [ ] Add toast notifications for success/error feedback
- [ ] Improve onboarding progress indicator
- [ ] Add persona avatar/image generation

### Milestone 6: Persona Management
Enable users to manage and refine their personas.

- [ ] Edit persona attributes after creation
- [ ] Re-run persona extraction with updated answers
- [ ] Delete personas
- [ ] Persona versioning UI (currently version is stored but not exposed)
- [ ] Export persona as PDF or JSON
- [ ] Share persona via link

### Milestone 7: Advanced Chat Features
Deepen the chat experience and add collaboration.

- [ ] Chat session history (list past conversations)
- [ ] Resume previous chat sessions
- [ ] Chat export (download conversation)
- [ ] Suggested follow-up questions
- [ ] Chat with custom context (e.g., "evaluate this product idea")
- [ ] Real-time streaming responses (SSE)

### Milestone 8: Security & Scale
Prepare for production traffic and proper multi-tenancy.

- [ ] Tighten RLS policies (user-scoped instead of "always true")
- [ ] Rate limiting on API routes
- [ ] API key management for Claude usage tracking
- [ ] Server-side persona filtering (currently client-side)
- [ ] Database indexes for performance
- [ ] Monitoring and alerting (Sentry, Vercel Analytics)
- [ ] Proper error logging service

### Milestone 9: Growth Features
Features to support product-market fit and user acquisition.

- [ ] Team/workspace support (multiple users share personas)
- [ ] Custom onboarding question sets
- [ ] Persona templates (pre-built archetypes)
- [ ] API access for programmatic persona queries
- [ ] Usage analytics dashboard
- [ ] Invite flow for contributors
- [ ] White-label / embeddable widget
