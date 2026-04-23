# Bazi Master Web App - Project Status

## Project Overview

A standalone Bazi (Chinese astrology) web application targeting overseas English-speaking market. Separate from the existing Shopify site `bazi-master.com`, this will be deployed to `app.bazi-master.com`.

**Owner**: Non-programmer, works with AI assistants. Please provide clear explanations when asking for decisions.

## Business Goals

- MVP with: email login, profile creation, Bazi chart display, AI-generated base report, Q&A feature
- Commercial model: Free tier uses Gemini 2.5 Flash-Lite; Paid tier uses Gemini 2.5 Pro
- Target revenue: $100K-300K/year as solo operation

## Tech Stack

- **Framework**: Next.js 16 App Router + TypeScript + Tailwind CSS + Turbopack
- **Database + Auth**: Supabase (using new publishable/secret API keys)
- **AI**: Gemini API (key pending)
- **Bazi calculation**: Reusing proven lunar.js + custom business logic from V8.5 Shopify version
- **Deployment target**: Vercel (not yet deployed)

## Current Progress

### ✅ Completed

1. **Supabase project configured**
   - Project ID: `cadedntyqimpqabgkrtg`
   - Email Magic Link auth enabled (email confirmation disabled)
   - URL Config: Site URL = `http://localhost:3000`, Redirect = `http://localhost:3000/**`
   - Google OAuth intentionally deferred

2. **Next.js project initialized**
   - Location: `D:\bazi-master\bazi-app`
   - App directory in project root (NOT in src/)
   - tsconfig paths: `"@/*": ["./*"]`
   - Middleware uses old `middleware.ts` convention — needs migration to `proxy.ts` per Next.js 16:
 npx @next/codemod@canary middleware-to-proxy .

3. **Auth system working end-to-end**
   - `/login` - Magic Link email form
   - `/auth/callback` - exchanges code for session
   - `/dashboard` - protected route with user info and "Create Profile" button
   - Tested with real email, login/logout confirmed working

4. **Database schema created** (see Supabase SQL Editor history)
   - `profiles` table: stores profile info + Bazi results (in Chinese) + AI base_report
   - `questions` table: stores Q&A history
   - RLS policies: 4 per table (SELECT/INSERT/UPDATE/DELETE), all `auth.uid() = user_id`
   - Indexes on user_id, profile_id
   - Trigger: auto-update `updated_at` on profiles

5. **Bazi calculation logic ported**
   - `lib/bazi/lunar.js` - UMD library (unchanged, works in Node via require)
   - `lib/bazi/bazi-calculator-logic.js` - v4.3-nextjs
     - Exports `generateBaziReport(tst, gender)` via module.exports
     - Debug logs toggleable via `DEBUG_BAZI=1` env var
     - Preserves critical business logic:
       - True solar time uses UTC methods on a Date object (caller must pre-calibrate with equation of time + longitude offset)
       - Cang gan (hidden stems) weights: 本气 1.0, 中气 0.5, 余气 0.3
       - 3-pillar mode when time unknown (hour pillar contributions excluded)
       - lunar.js handles lunar calendar conversion

6. **Start of profile creation UI**
   - `/profiles/new` page created with complete form (name, relation, gender, date, time, city)
   - Form currently only console.logs data — no API integration yet
   - City field is plain text input — no autocomplete

### 🚧 Next Steps (MVP to-do)

1. **Migrate middleware to proxy** (Next.js 16 deprecation warning)
2. **City search API** - proxy to OpenCage Geocoding API
   - Existing Shopify API key: `e02ba1c8f7b246628133d374d1b568fe`
   - Backup: `bae025dc64ac45e78886db5d45327972`
   - Should return {name, latitude, longitude, timezone_offset_sec}
3. **Profile submission server action**
   - Apply true solar time calibration (equation of time formula + longitude difference)
   - Call `generateBaziReport(tst, gender)`
   - Save to Supabase `profiles` table
4. **Profile detail page** `/profiles/[id]` — display Bazi chart, 5 elements, AI report
5. **AI base report generation** via Gemini API
   - Reuse proven prompt from V8.5 Shopify version (stored in `central-ai-server.onrender.com` — owner has copies)
   - ~1500-2000 English words, saved to `profiles.base_report`
6. **Q&A feature** - free-form user question → AI answer, save to `questions` table
7. **Profiles list on dashboard** - show user's existing profiles

### ⚠️ Known Issues

- Middleware deprecation warning in dev (not yet migrated to proxy.ts)
- No error handling in auth callback beyond redirect to `/login?error=auth`
- No loading states on most pages
- No mobile responsive testing done yet

## Environment Variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://cadedntyqimpqabgkrtg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
OPENCAGE_API_KEY=e02ba1c8f7b246628133d374d1b568fe

Gemini API key still needs to be added.

## Critical Business Rules — DO NOT REWRITE

The Bazi calculation logic in `lib/bazi/` represents years of refinement. When working on features that touch Bazi calculation:

- **DO NOT** rewrite `lunar.js` or substitute with another library
- **DO NOT** rewrite cang gan weight logic — 1.0 / 0.5 / 0.3 is correct
- **DO** preserve 3-pillar mode for unknown-time cases
- **DO** apply true solar time calibration before calling `generateBaziReport()`
- The Bazi data is stored in Chinese (庚午, 甲, 木, etc.) — English translation happens in the UI layer

## File Structure
D:\bazi-master\bazi-app
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx
│   ├── login/page.tsx              # Magic Link login
│   ├── auth/callback/route.ts      # OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx                # User dashboard
│   │   └── logout-button.tsx
│   └── profiles/
│       └── new/page.tsx            # Create profile form (form only, no submission yet)
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server client with cookies
│   └── bazi/
│       ├── lunar.js                # UMD lunar library
│       └── bazi-calculator-logic.js  # Business logic, exports generateBaziReport
├── middleware.ts                   # Session refresh (needs migration to proxy.ts)
├── .env.local
├── next.config.ts
├── tsconfig.json
└── package.json

## Owner Preferences

- Explanations in Chinese preferred, but code/UI/errors in English
- Small steps, verify each works before the next
- Don't rewrite proven business logic — integrate it
- Prefer pragmatic solutions over architectural perfection for MVP