<div align="center">

<!-- Animated title using SVG via readme-typing-svg -->
<a href="https://github.com/shaikhshahnawaz13/otakuvault">
  <img src="https://readme-typing-svg.demolab.com?font=Bebas+Neue&size=72&duration=3000&pause=1000&color=E63946&center=true&vCenter=true&width=700&height=100&lines=OTAKU+VAULT;TRACK.+REVIEW.+DISCUSS.;THE+ANIME+COMMUNITY." alt="OtakuVault" />
</a>

<br/>

<img src="https://img.shields.io/badge/STATUS-LIVE-e63946?style=for-the-badge&logo=netlify&logoColor=white" />
<img src="https://img.shields.io/badge/LICENSE-MIT-7c3aed?style=for-the-badge" />
<img src="https://img.shields.io/badge/VANILLA_JS-NO_FRAMEWORK-f4a261?style=for-the-badge&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/SUPABASE-BACKEND-3ecf8e?style=for-the-badge&logo=supabase&logoColor=black" />
<img src="https://img.shields.io/github/last-commit/shaikhshahnawaz13/otakuvault?style=for-the-badge&color=2563eb&label=LAST+COMMIT" />

<br/><br/>

> **OtakuVault** is a full-stack anime community platform — track what you're watching, rate and review anime, pin your favourites, earn achievements, and discuss with other otakus in real-time threads. No framework. No build step. Just fast, clean vanilla JavaScript.

<br/>

<a href="https://otakuvault.netlify.app">
  <img src="https://img.shields.io/badge/🌐 VISIT LIVE SITE-otakuvault.netlify.app-E63946?style=for-the-badge" />
</a>
&nbsp;
<a href="https://github.com/shaikhshahnawaz13/otakuvault/issues/new">
  <img src="https://img.shields.io/badge/🐛 REPORT BUG-Open Issue-7c3aed?style=for-the-badge" />
</a>
&nbsp;
<a href="https://github.com/shaikhshahnawaz13/otakuvault/issues/new">
  <img src="https://img.shields.io/badge/✨ REQUEST FEATURE-Open Issue-f4a261?style=for-the-badge" />
</a>

</div>

---

## ⚡ Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🗄 Database Schema](#-database-schema)
- [🏆 Achievements System](#-achievements-system)
- [📱 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔥 Trending & Discovery
- Browse **Airing Now**, **Most Popular**, and **All Time** top anime
- Powered by the free [Jikan API](https://jikan.moe) (MyAnimeList data)
- Smart search with **quick-chip suggestions**
- Lazy-loaded anime grid with skeleton loading states

</td>
<td width="50%">

### 📋 Personal List
- Track anime as **Watching**, **Completed**, or **Plan to Watch**
- Star ratings (1–5) per anime
- Write personal reviews — optionally **anonymous**
- Visual status badges on grid cards

</td>
</tr>
<tr>
<td width="50%">

### 💬 Community Threads
- Create discussion threads linked to specific anime
- Upvote threads, reply anonymously or publicly
- **Hot Threads** section surfaces the most upvoted posts
- Prefill threads from conversation starter prompts

</td>
<td width="50%">

### 👤 Rich User Profiles
- Custom **profile picture** upload (Supabase Storage)
- **Banner colour** picker (15 colours)
- Bio, pinned anime (up to 6), and favourite genres
- **Yearly watching goal** with animated progress bar

</td>
</tr>
<tr>
<td width="50%">

### 🏆 Achievements & Titles
- 16 unlockable achievements across 4 rarities: Common, Rare, Epic, Legendary
- Animated **unlock toast** when you earn a title
- Equip any earned achievement as your visible profile title
- OG Member badge for the first 10 users

</td>
<td width="50%">

### 🛡 Admin Panel
- Community stats dashboard (members, reviews, threads, tracked)
- Full reviews and anime-list table views
- **One-click Excel export** (.xlsx) of all data
- Secured via Supabase Edge Function + UID fallback

</td>
</tr>
</table>

---

## 🛠 Tech Stack

<div align="center">

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Vanilla HTML · CSS · JavaScript (ES2020+) | Zero dependencies, instant load, no build step |
| **Fonts** | Bebas Neue · Nunito (Google Fonts) | Strong anime-aesthetic typographic pairing |
| **Auth & DB** | [Supabase](https://supabase.com) | Postgres + realtime + auth + storage in one |
| **Anime Data** | [Jikan API v4](https://docs.api.jikan.moe) | Free, no API key, full MAL dataset |
| **Excel Export** | [SheetJS / xlsx](https://sheetjs.com) (CDN) | Client-side .xlsx generation for admin |
| **Hosting** | [Netlify](https://netlify.com) | Git-connected, instant CDN, free tier |
| **CI** | GitHub Actions | HTML lint + file checks on every push |

</div>

---

## 📁 Project Structure

```
otakuvault/
│
├── 📄 index.html              # All markup — auth, pages, modals, nav
├── 🎨 style.css               # CSS variables, components, responsive layout
├── ⚡ script.js               # All app logic — auth, API, Supabase, UI, achievements
│
├── 📋 package.json            # Stack documentation & dev scripts
├── 🚫 .gitignore              # Ignores node_modules, .env, build output
├── 📜 LICENSE                 # MIT
├── 🤝 CONTRIBUTING.md         # Contribution guide
│
└── 🤖 .github/
    └── workflows/
        └── ci.yml             # GitHub Actions — lint + file validation
```

---

## 🚀 Getting Started

### Prerequisites

- A modern browser (Chrome, Firefox, Safari, Edge)
- [Node.js](https://nodejs.org) ≥ 18 (optional — only needed for local server)
- A [Supabase](https://supabase.com) project (for full functionality)

### Run locally

```bash
# 1. Clone the repo
git clone https://github.com/shaikhshahnawaz13/otakuvault.git
cd otakuvault

# 2. Serve it (any static server works)
npx serve .

# 3. Open http://localhost:3000
```

> **No build step. No `npm install`. No webpack.** Open and it works.

### Deploy to Netlify

```bash
# One-time setup
npm install -g netlify-cli
netlify login

# Deploy
netlify deploy --prod --dir=.
```

Or connect via the [Netlify dashboard](https://app.netlify.com) → **Import from GitHub** → set publish directory to `.`

---

## 🗄 Database Schema

> Hosted on Supabase (PostgreSQL). Row Level Security enabled on all tables.

```sql
profiles          -- user profiles, bio, avatar, banner, pinned anime, goals
anime_list        -- per-user tracked anime (status, rating, MAL data)
reviews           -- anime reviews with optional anonymity
threads           -- community discussion threads
thread_replies    -- replies within threads
achievements      -- achievement definitions (id, title, icon, rarity)
user_achievements -- join table — which user earned which achievement
```

---

## 🏆 Achievements System

<div align="center">

| Icon | Title | Requirement | Rarity |
|------|-------|-------------|--------|
| ✍️ | First Impressions | Write your first review | Common |
| 📖 | Prolific Reviewer | Write 10 reviews | Common |
| 🎯 | Critic | Write 25 reviews | Rare |
| 📚 | Encyclopaedia | Write 50 reviews | Epic |
| 📋 | Getting Started | Track 10 anime | Common |
| 🗂 | List Master | Track 50 anime | Rare |
| ✅ | Completionist | Complete 25 anime | Rare |
| 🏅 | True Completionist | Complete 50 anime | Epic |
| 💬 | Conversation Starter | Create 5 threads | Common |
| 🗣 | Community Pillar | Post 20 replies | Rare |
| ⚔️ | Action Fan | Review 5 Action anime | Common |
| 💕 | Romance Fan | Review 5 Romance anime | Common |
| 👻 | Horror Fan | Review 5 Horror anime | Common |
| 🌀 | Isekai Fan | Review 5 Isekai anime | Common |
| 🌐 | Genre Master | Review across 5+ genres | Epic |
| 🌟 | OG Member | Among first 10 users | **Legendary** |

</div>

---

## 📱 Screenshots

<div align="center">

| Trending | My List | Threads |
|---------|---------|---------|
| 🔥 Live airing grid with skeleton loading | 📋 Status-filtered anime list with ratings | 💬 Hot threads + upvotes + replies |

| Profile | Achievements | Admin |
|---------|-------------|-------|
| 👤 Banner, pinned anime, goal bar | 🏆 Rarity tiers with equip system | 🛡 Stats dashboard + xlsx export |

</div>

---

## 🤝 Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) first.

```bash
# Fork → clone → branch
git checkout -b feat/your-feature

# Make changes, test in browser, commit
git commit -m "feat: describe your change"

# Push and open a PR
git push origin feat/your-feature
```

**Found a bug?** [Open an issue](https://github.com/shaikhshahnawaz13/otakuvault/issues/new) with steps to reproduce.

---

## 📜 License

This project is licensed under the **MIT License** — see [`LICENSE`](LICENSE) for details.

---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Nunito&weight=800&size=18&duration=4000&pause=1000&color=7777A0&center=true&vCenter=true&width=500&lines=Built+with+%E2%9D%A4%EF%B8%8F+for+the+anime+community;No+framework.+No+excuses.;Track+it.+Review+it.+Discuss+it." alt="footer typing" />

<br/>

**Made by [shaikhshahnawaz13](https://github.com/shaikhshahnawaz13)**

⭐ Star this repo if you found it useful!

</div>
