# Implementation Phases - Moona Client Portal

Complete each phase fully (typecheck clean, committed) before the next.

## Phase 0: Foundation
- `npx create-next-app@16.1.1 moona-portal` (TypeScript, App Router, Tailwind, src dir).
- Create the Supabase project; add keys to `.env.local` and `.env.example`.
- `npx shadcn@latest init`; set radius to 0 and wire Moona tokens (DESIGN_SYSTEM.md).
- Load Amiri, Tajawal, Cormorant Garamond, Outfit via next/font.
- Root layout: `<html lang="ar" dir="rtl">`, Moona globals.css, starfield background layer.
- `src/proxy.ts` for Supabase session refresh (function named `proxy`, NOT middleware).
- Supabase server/client helpers in `src/lib/supabase/`.

## Phase 1: Auth + Roles
- Apply DATABASE_SCHEMA.md as the first migration. Generate types.
- Login page (email + password) in the Moona login design from the prototype.
- `handle_new_user` trigger creates profiles; promote one admin by SQL.
- Protected layouts: `(client)` and `(admin)`, each checks `getUser()` then `profiles.role`.
- Redirect by role after login. Logout. Invite-accept page for client onboarding.

## Phase 2: Core Data + Client Read
- Seed AlTaifour using `reference/seed.sql` (also a second empty client for testing).
- Client dashboard shell: top bar (client name, role, company, logout) + side nav.
- Overview page: counters (pending / approved / revision), plan label, phase, next milestone, recent activity. All from the DB.
- Deliverables page: list with status chips, from `deliverables`.
- Profile page: read-only account fields.

## Phase 3: Content Approvals (the core feature)
- Approvals page renders the plan grouped by `content_groups` (weeks + series), ordered by `sort_order`, posts by `seq`.
- Each post card expands to show why-now, form, hook, body (render each JSONB paragraph; lines starting with "- " or "N- " get the indent style), tags.
- Approve / Request-edit buttons call a Server Action that writes only `decision`, `decided_at`, `decided_by`.
- Comment box inserts into `post_comments`; show the latest note. Optimistic UI, then revalidate.
- Progress counter + "copy notes" / "download notes" report (mirror the prototype's export).
- Series group keeps the silver accent and part badges.

## Phase 4: Admin Dashboard
- Clients list; create/edit `client_accounts`; invite a client user (Supabase `inviteUserByEmail`) and set their `client_id`.
- Plan builder: create a plan, add groups (week/series), add posts (all fields), reorder.
- Deliverables manager: add/edit/reorder, upload file to Supabase Storage, set status.
- Feedback view: per client, every post decision + comments in one place.

## Phase 5: Polish
- Loading skeletons, error boundaries, empty states (new client with no plan yet).
- Responsive: side nav collapses to a top row under 780px (match prototype).
- Verify RLS by logging in as each client; confirm cross-account access is impossible.
- Accessibility pass on the RTL forms and buttons.

## Phase 6: Deployment
- Vercel project; production env vars; Supabase production keys.
- Point the app at moona.id (or a `app.` / `portal.` subdomain) and configure DNS.
- Smoke test: invite a real client, run one full approval cycle.

## Later (not MVP)
- Stripe billing and the customer portal (engagement is sold offline today).
- Email/realtime notifications. In-app deliverable preview viewer. Multi-user client teams.
