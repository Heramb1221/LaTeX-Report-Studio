# Contributing to LaTeX Report Studio

Thank you for your interest in contributing. This is a solo-built open-source
project and contributions of all sizes are welcome — bug reports, documentation
improvements, small fixes, and new features.

---

## Before You Start

1. Check the [Issues](https://github.com/Heramb1221/latex-report-studio/issues)
   to see if your bug or feature request already exists.
2. For significant changes, open an issue first to discuss the approach before
   writing code. This saves both our time.
3. Small fixes (typos, broken links, minor bugs) can go straight to a PR.

---

## Local Development Setup

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- A free [MongoDB Atlas](https://cloud.mongodb.com) account
- A [Vercel](https://vercel.com) account for Blob storage
- A Gmail account with [App Passwords](https://myaccount.google.com/security) enabled

### Steps

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/latex-report-studio.git
cd latex-report-studio

# 2. Install dependencies
npm install

# 3. Install shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button input card dialog label badge \
  dropdown-menu toast separator scroll-area sheet tooltip \
  alert avatar skeleton tabs textarea alert-dialog select switch

# 4. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in all values (see below)

# 5. Start the development server
npm run dev
```

### Environment Variables

See `.env.example` for the full list. The minimum set needed to run locally:

| Variable | How to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Compass → copy string |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ENCRYPTION_KEY` | Same command as above |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Project → Storage → create Blob |
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | Gmail → Security → App Passwords → generate |

---

## Code Standards

This project uses strict TypeScript. Every pull request must pass:

```bash
npm run build   # must complete with zero errors
```

**Style rules:**
- Files under ~250 lines (split components if they grow larger)
- Atomic git commits (one logical change per commit)
- Conventional commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- No `console.log` in production code (use `console.error` for server errors only)
- All new API routes must use the `withAuth()` middleware pattern
- All mutations must go through TanStack Query `useMutation` — no bare `fetch` in components

---

## Project Structure

```
src/
├── app/
│   ├── api/          ← Next.js API routes (backend)
│   ├── (auth)/       ← Login, register, verify, reset
│   ├── (main)/       ← Dashboard, settings
│   └── editor/       ← Full-screen editor
├── components/
│   ├── auth/         ← Auth form components
│   ├── dashboard/    ← Dashboard UI
│   ├── editor/       ← All editor panels and modals
│   ├── landing/      ← Landing page sections
│   ├── settings/     ← Settings page components
│   └── ui/           ← shadcn/ui primitives (do not edit)
├── config/templates/ ← LaTeX template configs
├── hooks/            ← TanStack Query hooks
├── lib/              ← Pure utilities (auth, r2, bibtex, latex, etc.)
├── store/            ← Zustand editor store
└── types/            ← Shared TypeScript interfaces
```

---

## Submitting a Pull Request

1. Create a feature branch: `git checkout -b feat/your-feature-name`
2. Make your changes, keeping commits atomic
3. Run `npm run build` and fix any errors
4. Push and open a PR against `main`
5. Fill in the PR template (describe what changed and why)

PRs that fail `npm run build` will not be reviewed until the build is fixed.

---

## Reporting Bugs

Use the GitHub Issues template. Include:
- Browser and OS
- Steps to reproduce (numbered list)
- Expected vs actual behaviour
- Any relevant error messages from the browser console or terminal

---

## Feature Requests

Open an issue with the `enhancement` label. Describe:
- The problem you're trying to solve (not just "add X feature")
- How you'd expect it to work from a user perspective
- Any relevant examples from other tools

---

## Questions

Open a GitHub Discussion or reach out via the Issues tab. Response time is
best-effort — this is a solo project maintained alongside university coursework.
