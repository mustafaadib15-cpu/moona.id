# Deployment notes

## Production source of truth
Production on Vercel must always be the latest build of `main`. `main` contains,
in order, the client portal, the **Plan approval flow** (Tally embed + stage
stepper, replacing the old calendar builder) and the **invite interstitial**
(`/invite` page + POST-only `/confirm`, so email scanners cannot burn one-time
tokens).

## 2026-07-30 — restore after accidental rollback
Production had been serving deployment `ac1f5a6` ("hero: centered cinematic
redesign"), a build made from a working copy that predated the Plan-approval and
invite work. Going live with it reverted the Plan section to the old calendar
builder and made `/invite` return 404 — even though all of that work was still
present on `main` (`695b086`). No code was lost; the wrong deployment was live.

Restored by redeploying `main` to production.

## How to avoid a repeat
- Only deploy to production from `main`. Before starting new work (e.g. a
  homepage redesign), branch from the current `main` — never from an old local
  copy — so recent features are not silently dropped.
- Do not use Vercel "Instant Rollback" / promote an old deployment as a way to
  change the site; land the change on `main` and let it deploy.
- After any production deploy, sanity-check that `/invite` renders the account
  page and that an admin client Plan tab shows the embedded review form.
