<div align="center">

```
 ██████╗ ████████╗ █████╗ ██╗  ██╗██╗   ██╗    ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
██╔═══██╗╚══██╔══╝██╔══██╗██║ ██╔╝██║   ██║    ██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
██║   ██║   ██║   ███████║█████╔╝ ██║   ██║    ██║   ██║███████║██║   ██║██║     ██║   
██║   ██║   ██║   ██╔══██║██╔═██╗ ██║   ██║    ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   
╚██████╔╝   ██║   ██║  ██║██║  ██╗╚██████╔╝     ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   
 ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝       ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
```

**Track. Review. Discuss. — The Anime Community Platform**

[![Live](https://img.shields.io/badge/LIVE-otakuvault.netlify.app-E63946?style=for-the-badge&logo=netlify&logoColor=white)](https://otakuvault.netlify.app)
[![CI/CD](https://img.shields.io/github/actions/workflow/status/shaikhshahnawaz13/otakuvault/ci.yml?style=for-the-badge&label=CI%2FCD&logo=githubactions&logoColor=white)](https://github.com/shaikhshahnawaz13/otakuvault/actions)
[![License](https://img.shields.io/badge/LICENSE-MIT-7c3aed?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/VANILLA_JS-NO_FRAMEWORK-F4A261?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Supabase](https://img.shields.io/badge/SUPABASE-BACKEND-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)](https://supabase.com)
[![Coverage](https://img.shields.io/badge/COVERAGE-80%25-22C55E?style=for-the-badge&logo=jest&logoColor=white)](tests/)

<br/>

> **OtakuVault** is a full-stack anime community platform built without a single framework.
> Track your watchlist, write reviews, earn achievements, discuss with the community — all powered by Supabase, secured with JWTs, and deployed automatically via GitHub Actions.

</div>

---

## Index

- [Live Demo](#live-demo)
- [Architecture Overview](#architecture-overview)
- [Feature Breakdown](#feature-breakdown)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication & Security](#authentication--security)
- [API Integration](#api-integration)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Setup & Installation](#setup--installation)
- [Deploying to Netlify](#deploying-to-netlify)
- [Using Your Own Supabase Backend](#using-your-own-supabase-backend)
- [Achievements System](#achievements-system)
- [Admin Panel](#admin-panel)
- [Security Headers](#security-headers)
- [Contributing](#contributing)
- [License](#license)

---

## Live Demo

**[https://otakuvault.netlify.app](https://otakuvault.netlify.app)**

Create an account with any email to explore the entire platform — watchlist tracking, reviews, community threads, achievement unlocks, and profile customisation are all fully functional in production.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                                                                 │
│   index.html  ──────────  src/script.js  ──────  src/style.css  │
│   (markup)               (all app logic)         (all styles)   │
│        │                       │                                │
│        └───────────────────────┘                                │
│                       │                                         │
│              src/utils.js (pure utilities, tested)              │
└───────────────────────┬─────────────────────────────────────────┘
                        │  HTTPS / REST / Realtime
          ┌─────────────┴──────────────────────┐
          │           SUPABASE PLATFORM          │
          │                                      │
          │  ┌──────────┐  ┌──────────────────┐  │
          │  │ Auth JWT │  │  Postgres DB      │  │
          │  │ (signup/ │  │  (profiles, list, │  │
          │  │  login)  │  │  reviews,threads) │  │
          │  └──────────┘  └──────────────────┘  │
          │  ┌──────────────────────────────────┐ │
          │  │   Edge Function: verify-admin    │ │
          │  │   (server-side admin gating)     │ │
          │  └──────────────────────────────────┘ │
          └─────────────────────────────────────┘
                        │
          ┌─────────────┴──────────────┐
          │      JIKAN API v4           │
          │  (anime data, no key needed)│
          └────────────────────────────┘
```

No build step. No bundler. No framework. The browser loads one HTML file, one JS file, and one CSS file — and every feature works from there.

---

## Feature Breakdown

### Trending & Discovery
Browse anime pulled live from the Jikan API v4. Three curated views — **Airing Now**, **Most Popular**, and **All Time Top** — give you instant access to what the community is watching. Each card links to a full detail page with synopsis, score, type, and episode count.

### My List (Watchlist)
Add any anime to your personal list with one click. Set the status — `Watching`, `Completed`, or `Plan to Watch` — and attach a star rating from 1 to 5. Your list persists in Supabase, synced across any device you sign in from.

### Reviews
Write structured reviews for any anime. Each review includes a star rating, a text body, your genre tags, and an optional anonymity toggle. Reviews are public and browseable by other users.

### Community Threads
Start discussion threads tied to an anime or a general topic. Other users can reply. Threads support upvotes and track reply counts. Anonymous posting is supported for both threads and replies.

### Profile & Customisation
Every user gets a full profile: avatar URL, banner colour picker, bio text, favourite genres, and a pinned anime slot shown at the top of the profile. You can set an annual watch goal and track your progress with a percentage bar.

### Achievements
Sixteen unlockable titles across four rarity tiers (Common / Rare / Epic / Legendary) are automatically checked on every significant action — writing a review, completing anime, posting threads. Earned titles appear on your profile, and you can equip one as your displayed title.

### Admin Panel
A protected dashboard — gated by a Supabase Edge Function — shows platform-wide stats and lets the admin export all data to Excel via SheetJS.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES2020+) | All UI, routing, state |
| Auth | Supabase Auth (JWT, email/password) | Signup, login, sessions |
| Database | Supabase Postgres | All persistent data |
| Edge Functions | Supabase Deno Edge Functions | Admin verification (server-side) |
| Anime Data API | Jikan API v4 | Anime search, trending, details |
| Excel Export | SheetJS via CDN | Admin data export |
| Hosting | Netlify | Static site hosting + CDN |
| Tests | Jest 29 + jest-environment-jsdom | Unit + DOM integrity tests |
| CI/CD | GitHub Actions | Test → Lint → Deploy pipeline |
| HTML Lint | HTMLHint | Markup validation in CI |

---

## Project Structure

```
otakuvault/
├── index.html                    # Single HTML file — all markup and CDN imports
├── src/
│   ├── script.js                 # All application logic (~1,158 lines)
│   │   ├── Auth (login/signup/logout)
│   │   ├── Profile CRUD
│   │   ├── Watchlist management
│   │   ├── Reviews (create/read)
│   │   ├── Threads & replies
│   │   ├── Achievement engine
│   │   └── Admin panel
│   ├── style.css                 # All styles + responsive layout (~405 lines)
│   └── utils.js                  # Pure, testable utility functions
│       ├── escH()                # XSS-safe HTML escaping
│       ├── timeAgo()             # Relative timestamps
│       ├── goalPercent()         # Watch goal progress
│       ├── safeParse()           # Safe JSON parsing with fallback
│       ├── clamp()               # Numeric range clamping
│       ├── starsDisplay()        # Star rating renderer
│       ├── isValidUsername()     # Username format validation
│       └── truncate()            # Text truncation with ellipsis
├── tests/
│   ├── utils.test.js             # 40+ unit tests for utils.js
│   └── dom.test.js               # DOM integrity — verifies all element IDs exist
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions: Test → Lint → Deploy
├── netlify.toml                  # Netlify config, security headers, caching rules
├── jest.config.js                # Jest config with jsdom environment + coverage thresholds
├── .htmlhintrc                   # HTMLHint lint rules
├── package.json                  # Dev dependencies: jest, htmlhint
├── CONTRIBUTING.md
├── LICENSE
└── .gitignore
```

---

## Database Schema

All tables live in a single Supabase Postgres project. Row-Level Security (RLS) should be enabled per table — see the Supabase dashboard for policy configuration.

```sql
-- User profiles (extended auth.users)
CREATE TABLE profiles (
  id            UUID REFERENCES auth.users PRIMARY KEY,
  username      TEXT UNIQUE,
  bio           TEXT,
  avatar_url    TEXT,
  banner_colour TEXT,
  pinned_anime  JSONB,
  fav_genres    TEXT,
  watch_goal    INT,
  equipped_title TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Per-user tracked anime
CREATE TABLE anime_list (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id),
  mal_id      INT,
  title       TEXT,
  image       TEXT,
  type        TEXT,
  mal_score   NUMERIC,
  status      TEXT,                         -- 'Watching' | 'Completed' | 'Plan to Watch'
  user_rating INT,                          -- 1-5
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mal_id)
);

-- Anime reviews
CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id),
  mal_id       INT,
  anime_title  TEXT,
  anime_image  TEXT,
  rating       INT,
  body         TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  genres       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Community discussion threads
CREATE TABLE threads (
  id           BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id      UUID REFERENCES profiles(id),
  title        TEXT,
  body         TEXT,
  anime_title  TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  upvotes      INT DEFAULT 0,
  reply_count  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Thread replies
CREATE TABLE thread_replies (
  id           BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  thread_id    BIGINT REFERENCES threads(id),
  user_id      UUID REFERENCES profiles(id),
  body         TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Achievement definitions (seed once)
CREATE TABLE achievements (
  id           TEXT PRIMARY KEY,
  title        TEXT,
  description  TEXT,
  requirement  TEXT,
  icon         TEXT,
  rarity       TEXT,            -- 'Common' | 'Rare' | 'Epic' | 'Legendary'
  sort_order   INT
);

-- Junction: which user earned which achievement
CREATE TABLE user_achievements (
  user_id        UUID REFERENCES profiles(id),
  achievement_id TEXT REFERENCES achievements(id),
  earned_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);
```

### Stored Procedure

```sql
-- Used for username-based login (keeps email column server-side only)
CREATE OR REPLACE FUNCTION get_email_by_username(uname TEXT)
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT email FROM auth.users
  JOIN profiles ON profiles.id = auth.users.id
  WHERE profiles.username = uname
  LIMIT 1;
$$;
```

---

## Authentication & Security

OtakuVault uses **Supabase Auth** with JWT-based sessions. All client calls to the database are made using the anon public key — which only allows what Postgres Row-Level Security policies permit.

### Auth Flow

```
User submits login form
        │
        ├── Input is email?  ──► sb.auth.signInWithPassword({ email, password })
        │
        └── Input is username?
                  │
                  └── sb.rpc('get_email_by_username', { uname })   ← SECURITY DEFINER fn
                            │
                            └── sb.auth.signInWithPassword({ email, password })
                                        │
                                        └── JWT session stored ──► loadUser()
```

### Admin Gating

Admin access uses a **two-layer verification system**:

1. **Primary**: A Supabase Edge Function (`verify-admin`) validates the JWT server-side and checks the user's role in the database. This runs in Deno on Supabase's infrastructure — the client never sees the admin list.

2. **Fallback**: If the Edge Function is unreachable (network error), the client falls back to a hardcoded UID comparison. This is still secure — UIDs are random UUIDs and are not guessable.

```js
// Primary: Edge Function call
const res = await fetch(`${SUPA_URL}/functions/v1/verify-admin`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Fallback: UID match
isAdmin = user?.id === ADMIN_UID;
```

### XSS Protection

All user-generated content is passed through `escH()` before rendering into the DOM. This function HTML-encodes `&`, `<`, `>`, `"`, and `'` characters. It is unit-tested with 8 test cases including null/undefined coercion.

---

## API Integration

OtakuVault integrates with **Jikan API v4** — a free, unofficial MyAnimeList REST API. No API key is required.

| Endpoint | Used For |
|---|---|
| `GET /top/anime?filter=airing` | Airing Now section |
| `GET /top/anime?filter=bypopularity` | Most Popular section |
| `GET /top/anime` | All Time Top section |
| `GET /anime/{id}` | Individual anime detail page |
| `GET /anime?q={query}` | Anime search |

API responses are cached in a module-level `animeCache` object to avoid redundant requests during a session. Each Jikan response is normalised before use to handle missing or null fields gracefully.

---

## Testing

Tests are written in **Jest 29** with the `jest-environment-jsdom` environment.

```bash
npm test                  # Run all tests
npm run test:coverage     # Run with Istanbul coverage report
npm run lint:html         # HTMLHint markup validation
```

### Coverage Thresholds (enforced in CI)

| Metric | Threshold |
|---|---|
| Statements | 80% |
| Functions | 80% |
| Branches | 75% |
| Lines | 80% |

If coverage drops below any threshold, the CI pipeline fails and the deployment is blocked.

### Test Files

**`tests/utils.test.js`** — 40+ unit tests across all utility functions:

```
escH()           — 8 tests: HTML entity encoding, null/undefined coercion, number coercion
timeAgo()        — 5 tests: seconds, minutes, hours, days, ISO string input
goalPercent()    — 6 tests: null goal, zero, 50%, 100% clamp, exact goal, zero completed
safeParse()      — 5 tests: array passthrough, JSON string, null fallback, bad JSON, object passthrough
clamp()          — 5 tests: within range, below min, above max, at min, at max
starsDisplay()   — 6 tests: 0/3/5 stars, null, clamping above 5, negative
isValidUsername() — tests: alphanumeric, underscore, space rejection, special chars
truncate()       — tests: short string, long string, exact boundary
```

**`tests/dom.test.js`** — Structural integrity tests that parse `index.html` and assert every critical element ID is present. This catches accidental removal of IDs that JavaScript depends on.

### Jest Configuration

```js
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['src/utils.js'],
  coverageThreshold: {
    global: { statements: 80, functions: 80, branches: 75, lines: 80 }
  }
};
```

---

## CI/CD Pipeline

Every push to `main` or `master` triggers a three-job GitHub Actions pipeline. Deployment only proceeds if both testing and linting pass.

```
git push ──► GitHub Actions
                │
                ├── [Job 1] Test (ubuntu-latest, Node 20)
                │     ├── npm install
                │     ├── npm run test:coverage
                │     └── Upload coverage artifact (7-day retention)
                │
                ├── [Job 2] Lint & Validate (ubuntu-latest, Node 20)
                │     ├── htmlhint index.html
                │     ├── Check all required files exist
                │     └── Verify no .env files are committed
                │
                └── [Job 3] Deploy to Netlify (only if Job 1 + Job 2 pass)
                      ├── Only runs on push to main (not on PRs)
                      ├── Uses nwtgck/actions-netlify@v3
                      └── Posts deploy status comment on commits and PRs
```

### Pipeline Configuration

The workflow file lives at `.github/workflows/ci.yml`. The deploy job requires two GitHub repository secrets:

| Secret | Where to get it |
|---|---|
| `NETLIFY_SITE_ID` | Netlify dashboard → Site configuration → API ID |
| `NETLIFY_AUTH_TOKEN` | Netlify dashboard → User settings → Personal access tokens |

Add both at: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

---

## Setup & Installation

### Prerequisites

- Any modern browser (Chrome, Firefox, Safari, Edge)
- Node.js v18+ — only needed to run tests locally, not for the site itself

### 1. Clone the Repository

```bash
git clone https://github.com/shaikhshahnawaz13/otakuvault.git
cd otakuvault
```

### 2. Install Dev Dependencies

```bash
npm install
```

This installs only `jest`, `jest-environment-jsdom`, and `htmlhint`. There are zero runtime dependencies — the site uses CDN scripts loaded in `index.html`.

### 3. Run Tests

```bash
npm test
```

All 40+ tests should pass. To see a coverage report:

```bash
npm run test:coverage
# Open coverage/lcov-report/index.html in a browser
```

### 4. Run Locally

```bash
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000). The Supabase backend is already connected to the live project, so auth and all features work immediately.

Alternatively with Python:

```bash
python3 -m http.server 3000
```

Or with any static server — there is no build step required.

---

## Deploying to Netlify

### Option A — Netlify CLI (manual)

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.
```

### Option B — GitHub Actions (automatic, recommended)

1. Push the repo to GitHub
2. Connect the repo in the Netlify dashboard (New site → Import from Git)
3. Add `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN` as GitHub secrets (see [CI/CD Pipeline](#cicd-pipeline))
4. Every push to `main` now runs tests, then deploys automatically

### Netlify Configuration

The `netlify.toml` file configures:

```toml
[build]
  publish = "."       # Serve from root — no build command needed
  command = ""

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200        # SPA fallback routing
```

Security headers and cache rules are also set in `netlify.toml` — see [Security Headers](#security-headers).

---

## Using Your Own Supabase Backend

To run OtakuVault with your own isolated Supabase project:

### 1. Create a Supabase Project

Sign up at [supabase.com](https://supabase.com) and create a new project. Note your **Project URL** and **anon public key** from the API settings page.

### 2. Update Credentials

In `src/script.js`, replace the top two lines:

```js
const SUPA_URL = 'https://YOUR-PROJECT-ID.supabase.co';
const SUPA_KEY = 'your-anon-public-key';
```

### 3. Run the SQL Schema

Open the Supabase SQL editor and run the full schema from the [Database Schema](#database-schema) section above, including the `get_email_by_username` stored procedure.

### 4. Seed Achievement Definitions

```sql
INSERT INTO achievements (id, title, description, requirement, icon, rarity, sort_order) VALUES
  ('first_review',     'First Impressions',    'Write your first review',          'Write 1 review',      '[W]', 'Common',    1),
  ('ten_reviews',      'Prolific Reviewer',    'Write 10 reviews',                 'Write 10 reviews',    '[R]', 'Common',    2),
  ('twentyfive_reviews','Critic',              'Write 25 reviews',                 'Write 25 reviews',    '[C]', 'Rare',      3),
  ('fifty_reviews',    'Encyclopaedia',        'Write 50 reviews',                 'Write 50 reviews',    '[E]', 'Epic',      4),
  ('ten_tracked',      'Getting Started',      'Track 10 anime',                   'Track 10 anime',      '[G]', 'Common',    5),
  ('fifty_tracked',    'List Master',          'Track 50 anime',                   'Track 50 anime',      '[L]', 'Rare',      6),
  ('twentyfive_complete','Completionist',      'Complete 25 anime',                'Complete 25 anime',   '[D]', 'Rare',      7),
  ('fifty_complete',   'True Completionist',   'Complete 50 anime',                'Complete 50 anime',   '[T]', 'Epic',      8),
  ('five_threads',     'Conversation Starter', 'Create 5 threads',                 'Create 5 threads',    '[S]', 'Common',    9),
  ('twenty_replies',   'Community Pillar',     'Post 20 replies',                  'Post 20 replies',     '[P]', 'Rare',      10),
  ('action_fan',       'Action Fan',           'Write 5 Action genre reviews',     '5 Action reviews',    '[A]', 'Common',    11),
  ('romance_fan',      'Romance Fan',          'Write 5 Romance genre reviews',    '5 Romance reviews',   '[O]', 'Common',    12),
  ('isekai_fan',       'Isekai Fan',           'Write 5 Isekai genre reviews',     '5 Isekai reviews',    '[I]', 'Common',    13),
  ('genre_master',     'Genre Master',         'Review anime across 5+ genres',    '5+ genre variety',    '[M]', 'Epic',      14),
  ('og_member',        'OG Member',            'Be among the first 10 users',      'First 10 users',      '[X]', 'Legendary', 15);
```

### 5. Configure Admin Access

In `src/script.js`, set your own UID and email:

```js
const ADMIN_UID   = 'your-user-uuid-from-supabase-auth';
const ADMIN_EMAIL = 'your@email.com';
```

Your UID can be found in the Supabase dashboard under Authentication → Users.

### 6. Enable Row-Level Security

In the Supabase dashboard, enable RLS on each table and add policies. At minimum:

```sql
-- Allow users to read all profiles
CREATE POLICY "Profiles are public" ON profiles FOR SELECT USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Allow users to read all reviews
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);

-- Allow authenticated users to insert reviews
CREATE POLICY "Auth users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
```

Repeat similar policies for `anime_list`, `threads`, `thread_replies`, and `user_achievements`.

---

## Achievements System

The achievement engine runs automatically after every tracked user action. It queries the user's current stats from Supabase and cross-references against the achievement requirements table.

| Title | Requirement | Rarity |
|---|---|---|
| First Impressions | Write your first review | Common |
| Prolific Reviewer | Write 10 reviews | Common |
| Critic | Write 25 reviews | Rare |
| Encyclopaedia | Write 50 reviews | Epic |
| Getting Started | Track 10 anime | Common |
| List Master | Track 50 anime | Rare |
| Completionist | Complete 25 anime | Rare |
| True Completionist | Complete 50 anime | Epic |
| Conversation Starter | Create 5 threads | Common |
| Community Pillar | Post 20 replies | Rare |
| Action Fan | Write 5 Action genre reviews | Common |
| Romance Fan | Write 5 Romance genre reviews | Common |
| Isekai Fan | Write 5 Isekai genre reviews | Common |
| Genre Master | Review anime across 5+ genres | Epic |
| OG Member | Be among the first 10 users to sign up | **Legendary** |

Earned achievements are stored in `user_achievements`. Users can equip any earned title to display on their public profile.

---

## Admin Panel

The admin panel is accessible only to the verified admin user. It is gated by the `verify-admin` Supabase Edge Function and shows:

- Total registered users
- Total anime tracked across all lists
- Total reviews written
- Total threads and replies
- Excel export of all platform data via SheetJS

The export button generates a `.xlsx` file on the client using the SheetJS CDN library, populated with a fresh Supabase query at time of export.

---

## Security Headers

Configured in `netlify.toml` and applied to all responses:

| Header | Value | Purpose |
|---|---|---|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Cache-Control` (JS/CSS) | `public, max-age=31536000, immutable` | Long-term asset caching |

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

```bash
# Fork the repo, then:
git clone https://github.com/YOUR_USERNAME/otakuvault.git
cd otakuvault
npm install

git checkout -b feat/your-feature

# Make changes, then verify all tests still pass
npm test
npm run lint:html

git commit -m "feat: describe your change"
git push origin feat/your-feature
# Open a Pull Request on GitHub
```

All PRs must pass the full CI pipeline (tests + lint) before they can be merged. The deploy job only runs on pushes to `main`, so your PR will be tested but not deployed until it is merged.

---

## License

MIT — see [LICENSE](LICENSE) for the full text.

---

<div align="center">

**No framework. No build step. No excuses.**

Built by [shaikhshahnawaz13](https://github.com/shaikhshahnawaz13)

[Star this repo](https://github.com/shaikhshahnawaz13/otakuvault) if you found it useful.

</div>
