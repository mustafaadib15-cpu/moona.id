# Deploying Moona to Vercel (Phase 6)

The whole site (marketing + portal) is one Next.js app and deploys as a single
Vercel project on `moona.id`.

## 1. Push to GitHub
The repo is local-only. Create a GitHub repo and push:
```
git remote add origin https://github.com/<you>/moona-portal.git
git push -u origin master
```
`.env.local` is git-ignored, so the keys are never pushed.

## 2. Import into Vercel
- New Project -> import the GitHub repo.
- Framework preset: **Next.js** (auto-detected). Root directory: the repo root.
- Build command / output: defaults (Next.js).

## 3. Environment variables (Vercel -> Settings -> Environment Variables)
Add the three from `.env.local`, for Production (and Preview):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    (the sb_publishable_... key)
SUPABASE_SERVICE_ROLE_KEY        (the sb_secret_... key — keep it secret)
```

## 4. Supabase Auth configuration (Dashboard -> Authentication -> URL Configuration)
- **Site URL:** `https://moona.id`
- **Redirect URLs:** add `https://moona.id/confirm`, `https://moona.id/set-password`
  (and `http://localhost:3000/confirm`, `http://localhost:3000/set-password` for local dev).
- **SMTP:** configure an SMTP provider (Auth -> Emails) so `inviteUserByEmail`
  actually delivers invites. Until then, invited users are created but no email is sent.

## 5. Domain
- Vercel -> Settings -> Domains -> add `moona.id` (and `www.moona.id`).
- Update DNS at your registrar to the records Vercel shows (A / CNAME).

## 6. Smoke test (production)
- `/` marketing home, `/en` (EN), `/about`, `/audience` (submit a test inquiry).
- `/portal` login as the admin -> lands on `/admin`.
- Admin: create a client, build a small plan, add a deliverable.
- Invite a real client by email; the client follows the link -> `/set-password`
  -> `/dashboard`; runs one approval cycle.
- Confirm a client sees only their own data.

## Notes
- The post-login redirect and invite link build their URLs from the request host,
  so no domain is hard-coded.
- After go-live: rotate the Supabase access token used during setup, and change
  the admin's auto-generated password.
