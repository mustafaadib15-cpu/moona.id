# Moona Client Portal - Build Package

Hand this folder to Claude Code. It contains everything needed to build the production portal.

## Read in this order
1. `PROJECT_BRIEF.md` - what we are building and the MVP scope.
2. `DATABASE_SCHEMA.md` - apply the SQL as the first Supabase migration.
3. `DESIGN_SYSTEM.md` - Moona colors, fonts, tokens, layout rules.
4. `PHASES.md` - the build order. Do one phase at a time.
5. `CLAUDE.md` - put this at the repo root. It governs how the agent works.

## Reference (do not ship as-is)
- `reference/moona-client-portal.html` - the approved clickable prototype. This is the visual and UX target for the real build. Match its look, flow, and the approvals interaction.
- `reference/seed.sql` - run AFTER the schema migration. Loads Abdulrahman AlTaifour's full plan (verbatim Arabic, 16 posts, weeks + the 3-part series) and deliverables, plus a second empty client for testing the new-client state.
- `reference/plan_data.json` - the same content as structured data, if you prefer to seed via a script.
- `reference/assets/logo.png` - Moona wordmark. Copy to `public/images/logo.png`.
- `reference/assets/starfield.png` - page background. Copy to `public/images/starfield.png`.

## First commands for Claude Code
```
npx create-next-app@16.1.1 moona-portal
# move CLAUDE.md to repo root; copy assets into public/images/
# create a Supabase project, set env vars
# apply DATABASE_SCHEMA.md, then reference/seed.sql
# promote your own account to admin:
#   UPDATE public.profiles SET role='admin' WHERE email='you@moona.id';
```

## Two things to decide before starting
1. Domain: full site at moona.id, or the portal on a subdomain (app.moona.id / portal.moona.id)? Affects Supabase redirect URLs and Vercel DNS.
2. Client onboarding: invite-by-email (admin invites, client sets password) is assumed in the schema. Confirm that is how you want clients to get in.

## Not in MVP (parked)
Stripe billing, email/realtime notifications, in-app deliverable preview, multi-user client teams. The schema leaves room for these; build them only when needed.
