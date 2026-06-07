# Moona Client Portal

A bilingual, RTL-first portal where Moona's executive clients review and approve their content and track deliverables, with an admin side for the Moona team.

## Stack
- Next.js 16.1.1 (App Router, Turbopack)
- Supabase (Auth + Database + Storage)
- shadcn/ui + Tailwind CSS 4, restyled to Moona tokens (see DESIGN_SYSTEM.md)
- React Hook Form + Zod, Lucide React

## Key Directories
- `src/app/` - Pages and route handlers
- `src/app/(auth)/` - login, invite-accept (public)
- `src/app/(client)/` - client dashboard (role: client)
- `src/app/(admin)/` - admin dashboard (role: admin)
- `src/components/` - React components (NEVER put components in app/)
- `src/lib/` - utilities, configs
- `src/lib/supabase/` - server.ts, client.ts, middleware/proxy helpers

## Commands
- `npm run dev` - dev server (Turbopack)
- `npm run build` - production build
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript check

## Critical Rules
1. NEVER use emojis in UI or code.
2. NEVER leave placeholder text. Arabic content is verbatim from seed data; do not paraphrase, "fix", or alter any Arabic word, punctuation, or numbering.
3. ALWAYS Server Components by default; add "use client" only for state/effects/events.
4. Push client components to the leaves of the tree.
5. ALWAYS run `npm run typecheck` after changes. COMMIT after each completed feature.
6. Default document direction is RTL (`<html lang="ar" dir="rtl">`). Arabic text uses zero letter-spacing and never italic.

## Auth Pattern (Next.js 16 + Supabase)
- Session refresh in `src/proxy.ts` (NOT middleware.ts). The function is named `proxy`.
- Use `supabase.auth.getUser()` for protected routes (NEVER `getSession()`).
- Role gating in Server Components: read `profiles.role`; route `admin` to `(admin)`, `client` to `(client)`.
- A client must only ever see rows for their own `client_id`. RLS enforces this; do not rely on UI checks alone.

## Database
Read DATABASE_SCHEMA.md before any database work. Apply it as the first migration. Never change a table without updating that doc. After schema changes, regenerate types: `supabase gen types typescript --linked > src/lib/database.types.ts`.

## Content Integrity
Post fields (subject, hook, body, tags) are client-facing Arabic copy and must match the seed exactly. The 21 يونيو post intentionally numbers its steps 1, 3, 4. Keep exclamation marks and double-dot ellipses as-is. If a value looks like a typo, leave it.

## Phase Execution
Read PHASES.md. Complete one phase fully before the next.

## Forbidden Patterns
- NO emojis anywhere. NO placeholder text. NO `console.log` in production code.
- NO `any` in TypeScript. NO inline styles (use Tailwind). NO `localStorage` for auth.
- NO skipping TypeScript errors. NO components in `app/`.
- NO middleware.ts (use proxy.ts). NO getSession() for auth (use getUser()).
- NO heavy logic in proxy.ts. NO altering Arabic source content.

## Debugging Protocol
1. Read the full error. 2. Find file + line. 3. Hypothesize root cause.
4. Test with a minimal change. 5. Document non-obvious fixes.
