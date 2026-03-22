# Contributing to OtakuVault

Thanks for your interest in contributing! OtakuVault is a vanilla-JS anime community platform — no build step, no framework. Contributions of all kinds are welcome.

---

## Quick start

```bash
git clone https://github.com/shaikhshahnawaz13/otakuvault.git
cd otakuvault
npx serve .        # serves on http://localhost:3000
```

Open `index.html` in a browser (or via the local server above). Edits to `style.css` or `script.js` are reflected on the next page reload.

---

## Project structure

```
otakuvault/
├── index.html          # All markup / page structure
├── style.css           # All styles (CSS variables, components, responsive)
├── script.js           # All app logic (auth, API calls, Supabase, UI)
├── LICENSE             # MIT
├── .gitignore
├── package.json        # Stack documentation & dev scripts
├── CONTRIBUTING.md     # This file
└── .github/
    └── workflows/
        └── ci.yml      # HTML lint + file presence checks
```

---

## How to contribute

### Bug reports
Open an issue with:
- What you expected to happen
- What actually happened
- Browser & OS
- Steps to reproduce

### Feature requests
Open an issue tagged `enhancement`. Describe the use-case, not just the solution.

### Pull requests

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b fix/my-bug-description
   ```

2. **Make your change** — keep it focused. One PR per concern.

3. **Test manually** — open the site in a browser and verify nothing is broken. Check mobile too (DevTools → responsive mode).

4. **Commit clearly**:
   ```
   fix: prevent duplicate review submission on double-click
   feat: add watch-time estimate to anime modal
   style: tighten mobile padding on thread cards
   ```

5. **Open a PR** against `main`. Fill in the PR template and link any related issue.

---

## Style guide

- **HTML** — semantic elements where possible; keep IDs for JS hooks and classes for styling.
- **CSS** — use the existing CSS variables (`--bg`, `--accent`, `--muted`, etc.). Avoid magic numbers.
- **JavaScript** — plain ES2020+, no bundler. Keep functions small and named. Async/await for all Supabase calls.

---

## External services

| Service | Purpose | Docs |
|---------|---------|------|
| [Supabase](https://supabase.com) | Auth, database, storage | [docs.supabase.com](https://supabase.com/docs) |
| [Jikan API](https://jikan.moe) | Anime data (no key needed) | [docs.api.jikan.moe](https://docs.api.jikan.moe) |

Never commit Supabase keys or credentials. The anon key in the source is safe to expose (it's public-facing by design), but service-role keys must never appear in client code.

---

## Code of Conduct

Be respectful. We're all here because we like anime. Harassment, hate speech, or bad-faith behaviour will result in a ban.

---

*Happy coding! 🎌*
