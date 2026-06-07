# Moona Client Portal

## One-Line Summary
A private, bilingual client portal where Moona's executive clients log in to review and approve their content, track deliverables, and see their engagement, while the Moona team manages everything from an admin dashboard.

## Problem
Moona delivers content plans, identity assets, and presence work to executives in Saudi Arabia and the Gulf. Today these go out as one-off files (HTML, PDF) with no single place for a client to log in, see their work, approve content, and leave notes. Feedback is scattered and there is no record of what was approved.

## Solution
A web app with two sides on one codebase:
- Client side: each client signs in and sees only their own dashboard: content awaiting their approval, approved and revision-requested items, deliverables, profile, and engagement status.
- Admin side: the Moona team signs in, creates client accounts, builds content plans and posts, uploads deliverables, and reads every client decision and comment.

## Target Users
- Clients: executives, CEOs, and business owners. Arabic-first, non-technical. They review content and tap approve / request-edit, and write short notes.
- Admins: the Moona team (operators). They manage clients and content.

## MVP Features
1. Email + password auth (Supabase), with two roles: `client` and `admin`.
2. Client dashboard: overview counters, content approvals (per-post approve / request edit / comment), deliverables list, profile.
3. Content approvals data model: plans, groups (weeks and series), posts with verbatim Arabic fields; decisions and comments persist server-side.
4. Admin: create client accounts and invite client users; create plans, groups, posts, and deliverables; view all client feedback.
5. Bilingual, RTL-first Arabic UI in the Moona visual identity.

## Out of Scope for MVP (later phases)
- Stripe billing / client payments (engagement is sold offline today).
- Realtime notifications, email digests.
- File/asset preview viewer (deliverables link out or download for now).
- Multi-user client teams (one client account = one primary contact at launch).

## Tech Stack
- Framework: Next.js 16.1.1 (App Router, Turbopack)
- Database + Auth + Storage: Supabase (PostgreSQL)
- UI: shadcn/ui + Tailwind CSS 4, restyled to Moona tokens
- Forms: React Hook Form + Zod
- Icons: Lucide React
- Deployment: Vercel

## Success Metrics
- A client can log in and approve or request edits on every post in their plan, with notes saved.
- An admin can stand up a new client (account + plan + posts + deliverables) without touching SQL.
- Each client sees only their own data, enforced by row-level security.
