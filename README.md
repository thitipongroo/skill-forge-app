# The Skill Forge App

A production-shaped learning tracker: **multiple skills**, **real accounts** (email + password), **Postgres**, **cross-device sync**, **spaced-repetition push reminders**,
**full react-i18next** (English / ไทย / Français), **installable PWA** and a **test suite**.

---

## Quick start

```bash
npm install
cp .env.example .env

# 1. Start Postgres
docker compose up -d

# 2. Secrets
npx auth secret                      # writes AUTH_SECRET
npx web-push generate-vapid-keys     # paste the two keys into .env

# 3. Schema -> database
npx prisma migrate dev --name init   # or: npm run db:push

npm run dev                          # http://localhost:3000
```

Open the app, create an account, and start a skill. Push notifications work once the VAPID keys are set; everything else runs without them.

---

## Architecture

```text
Browser ──► Next.js (App Router)
  │           ├─ middleware.ts            gate every page (Auth.js)
  │           ├─ /login /register         credentials sign-in
  │           ├─ server layout            reads prefs -> no language/theme flash
  │           └─ /api/*  ──► requireUser ──► Prisma ──► PostgreSQL
  └─ service worker (sw.js) ◄── Web Push ◄── /api/cron/reminders
```

### Auth (real accounts)

Auth.js v5 with a **Credentials** provider (email + bcrypt password) and a **JWT** session. The config is split so the edge middleware stays DB-free: `auth.config.ts` (edge-safe, holds the `authorized` gate) and `auth.ts` (Node, adds the credentials provider + Prisma lookup). `middleware.ts` protects all page routes; API routes self-guard via `requireUser()`.
Cross-device sync is now just "sign in on the other device".

### No-flash i18n / theme

`app/layout.tsx` is an async Server Component: it reads the signed-in user's saved `lang`/`theme` and bakes them into the first HTML response (`<html lang>` + `data-theme`).
`AppProviders` seeds its state from those server values and `I18nProvider` sets the language synchronously, so there's no flash of the wrong language or theme on load.
Every surface — including the login, register, and settings pages — is fully localised across English, ไทย, and Français (a locale parity test guards against drift).

### Spaced repetition + push

`lib/review.ts` holds the Leitner ladder (shared by client and cron). Schedule `GET /api/cron/reminders` daily with `Authorization: Bearer $CRON_SECRET`.

### PWA

`public/manifest.webmanifest` + branded icons in `public/icons/` + a service worker with install/activate/fetch handlers make the app installable on mobile ("Add to Home Screen"). `RegisterSW` registers the worker on load.

### Retention features (2026)

The five highest-demand retention levers for 2026, mapped to a learning tracker:

1. **AI personalisation** — `AICoach` calls `POST /api/ai/coach`, which uses `lib/ai.ts` (`buildCoachPrompt` / `parseCoachResponse`) to turn a skill into
  a starter breakdown (sub-skills + review topics + a first-session tip) via the Anthropic API. Hidden when `ANTHROPIC_API_KEY` is unset.
2. **Streaks + achievements** — `lib/streak.ts` and `lib/achievements.ts` power the dashboard `StreakCard` and `Achievements` badges.
3. **Frictionless onboarding** — the empty state offers a one-tap sample skill so a new user reaches a populated ledger in their first session.
4. **Smart re-engagement push** — the cron sends streak-at-risk nudges (not just due-review reminders) and respects each user's `remindersOptIn` setting.
5. **Social accountability** — `ShareSkill` toggles a public, read-only progress link (`/share/[token]`, `shareToken` on the skill); anyone with the link sees
  live progress without signing in.

---

## Testing

```bash
npm test               # unit tests (no database)
npm run test:integration   # API tests against a real Postgres (needs DATABASE_URL)
npm run e2e            # Playwright end-to-end + accessibility (axe) in a browser
```

**Unit (39 tests, all green):** the Leitner scheduler, locale-aware formatters (incl. Thai Buddhist era), locale key parity, the rate limiter, the logger, the AI prompt builder/parser, streaks, and achievements.

**Integration (`api.integration.test.ts`, `data.integration.test.ts`):** drive the real route handlers against a live database — 401-when-unauthenticated, per-user scoping, session logging, Leitner advancement, ownership blocking, and the export/import/delete flows.

**E2E (`e2e/`, Playwright):** register → create a skill → log a focus session → sign out, plus an unauthenticated-redirect check. `e2e/a11y.spec.ts` runs **axe-core** against the login, register, and dashboard pages and fails on any serious/critical WCAG 2 A/AA violation. CI runs all three layers.

## Observability

`lib/logger.ts` is a dependency-free structured logger — one JSON line per event, level configurable via `LOG_LEVEL` (debug/info/warn/error). `lib/api.ts` exposes `withApi(name, handler)`, which wraps a route with request-timing logs and turns an uncaught error into a clean 500 instead of a leaked stack. The cron reminder job is instrumented end-to-end (start/summary failed-push events) and is wrapped with `withApi`; the import route logs failures. Point `LOG_LEVEL` and your log drain at these JSON lines in production.

## Accessibility

Audited with axe-core (automated, in CI) plus manual fixes:

- a `<main>` landmark and a keyboard **skip link**; visible `:focus-visible` rings;
- every input has an accessible name (`aria-label`/label), every icon-only button has an `aria-label` (edit/remove/star/focus-target/collapse), and toggles expose `aria-pressed`/`aria-expanded`;
- status and error messages use `role="status"` / `role="alert"` live regions;
- the celebration overlay is a `role="dialog"` with `aria-modal`; charts and the heatmap are `role="img"` with summarising labels;
- `<html lang>` is set server-side per the user's language.

## Security

- **Rate limiting** (`lib/rate-limit.ts`): registration is throttled per IP and login per email (brute-force protection); password changes per user. It's an in-memory fixed-window limiter — swap in Upstash/Redis (same interface) for multi-instance deployments.
- API routes return a real **401** when unauthenticated and **403/404** when a resource isn't yours; every query is scoped to the session user.

## Engagement & growth features (2026 market-driven)

Built from current retention research for learning/habit apps:

1. **AI coach** — `/api/ai/coach` (Anthropic API) turns a skill into a starter breakdown: vital sub-skills, spaced-review topics, and a first-session tip, written straight into the ledger with one tap. Set `ANTHROPIC_API_KEY`; the
   button degrades gracefully when it's absent. Prompt + parser are pure and unit-tested (`lib/ai.ts`).
2. **Streaks with a forgiveness signal** — `lib/streak.ts` computes the current and longest streak plus a rolling 30-day **consistency %**, so a single missed day doesn't read as total failure (the #1 streak-churn problem).
3. **Achievements** — `lib/achievements.ts` derives milestone badges (first rep, 3/7-day streaks, 10/20 hours, reviews, target reached) purely from the data.
4. **Streak-at-risk reminders** — the cron job nudges users with a live streak who haven't practised yet today, before it breaks (prioritised over review reminders).
5. **One-step onboarding** — an empty-state guided card with a one-tap sample skill, fixing the empty-dashboard drop-off.

`StreakCard` and `Achievements` render on the dashboard; `AICoach` on each skill page. All five strings are localised across EN/TH/FR.

## Account features

Settings includes **profile** (display name), **change password** (verifies the current password), **data export/import** (download everything as JSON; restore with merge or replace), and **account deletion** (cascades to all data), alongside language, theme, push, and sign-out.

Data routes: `/api/export` (GET), `/api/import` (POST, regenerates all IDs and re-links sessions to sub-skills), `/api/account` (GET/PATCH/DELETE).

---

## API surface

| Route                                    | Methods                                         | Purpose                                         |
| ---------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `/api/auth/[...nextauth]`                | GET, POST                                       | Auth.js sign-in/out/session                     |
| `/api/register`                          | POST                                            | Create an account (bcrypt)                      |
| `/api/sync`                              | GET, PATCH                                      | Snapshot · update prefs (lang/theme/weeklyGoal) |
| `/api/skills` · `/api/skills/[id]`       | GET, POST · GET, PATCH, DELETE                  | Skills                                          |
| `/api/subskills` · `/api/subskills/[id]` | POST · PATCH, DELETE                            | Deconstruct list                                |
| `/api/sessions` · `/api/sessions/[id]`   | POST · PATCH, DELETE                            | Practice log                                    |
| `/api/reviews` · `/api/reviews/[id]`     | POST · PATCH, DELETE                            | Review queue                                    |
| `/api/principles`                        | PUT                                             | Upsert a principle note                         |
| `/api/push/subscribe`                    | POST                                            | Save a Web Push subscription                    |
| `/api/cron/reminders`                    | GET                                             | Daily due-review push (Bearer auth)             |

Every data route calls `requireUser()` and scopes queries to the signed-in user.

## UI

The skill page is a complete ledger — Mastery Arc, Pomodoro focus timer, Define, Deconstruct (vital-few), seven-principle checklist, Leitner review queue, activity chart, GitHub-style heatmap, and an editable session log — at full parity with the original `skill-forge.jsx` artifact, all persisting through the API.

## Deployment

**Docker** — the app builds to a self-contained Next standalone server:

```bash
docker build -t practice-ledger .
docker run -p 3000:3000 --env-file .env practice-ledger
```

`Dockerfile` is multi-stage (deps → build → minimal runtime) and copies the Prisma query engine into the runtime image. A `/api/health` endpoint is provided for container liveness probes.

**Vercel** — `vercel.json` registers a daily cron that calls `/api/cron/reminders`. Vercel automatically sends `Authorization: Bearer $CRON_SECRET` when `CRON_SECRET` is set, which the endpoint checks. Set `DATABASE_URL`, `AUTH_SECRET`, the VAPID keys, and `CRON_SECRET` in the project's environment variables.

**CI** — `.github/workflows/ci.yml` spins up a Postgres service, applies the schema (`prisma db push`), runs the Vitest suite, and runs `next build` on every push and PR.

## Production notes

- `DATABASE_URL` points at the docker Postgres for dev; use a managed Postgres in prod.
- Serve over HTTPS (Web Push and PWA install require a secure context).
- Targets Next 14.2.x (sync `headers()`/`params`); 14.2.35 includes the latest security patch.
