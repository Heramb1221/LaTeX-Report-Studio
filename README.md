# LaTeX Report Studio

> The unified engineering report workspace — write, humanize, diagram, cite, compile, and export, without leaving the browser.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/built%20with-Next.js%2016-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![CI](https://img.shields.io/badge/CI-typecheck%20%2B%20build-informational)](.github/workflows/ci.yml)

---

## About The Project

Engineering students writing a technical report today juggle five separate tools:
Overleaf for LaTeX, draw.io for diagrams, a Grammarly-style humanizer for AI-flagged
text, a reference manager for BibTeX, and a PDF converter to ship the final file.
**LaTeX Report Studio** collapses that workflow into a single authenticated,
per-project workspace.

| Task | Tool normally used | Built into this project |
|---|---|---|
| Write & preview LaTeX | Overleaf | Monaco editor + on-demand PDF compile |
| Draw diagrams | draw.io (separate tab) | Embedded draw.io canvas, exports straight into the doc |
| Clean up AI-sounding prose | Grammarly / humanizer sites | Gemini-powered Humanize + Convert-to-LaTeX panel |
| Manage citations | Zotero / manual BibTeX | Form-driven IEEE citation manager |
| Ship the final report | Manual file collection | One-click zip: `main.tex`, `references.bib`, `images/`, `diagrams/` |

**AI is opt-in and narrow by design.** The Humanizer and LaTeX-Convert panel call
Google Gemini using **the user's own API key** (encrypted at rest with AES-256).
Nothing generates report content or chapters — the model only reformats or
rephrases text the user has already written. This was a deliberate scope
decision, not a missing feature.

---

## Live Demo

**Live Application:** https://la-te-x-report-studio.vercel.app/

---

## Project Type

Full-stack SaaS-style web application — authenticated multi-tenant document
workspace with a real backend (MongoDB), external API integrations (Gemini,
YtoTech LaTeX compiler, AWS S3), and a rich client-side editor.

---

## Project Status

**Actively developed, single-maintainer project.** Core editing, compilation,
diagramming, citations, and export are implemented end-to-end. Not yet
deployed to a public production URL; treat as a portfolio-stage / pre-launch
build rather than a live SaaS product.

---

## Why I Built This

As a student regularly producing IEEE-format seminar and project reports, the
actual bottleneck was never LaTeX syntax — it was context-switching between
five different tools for one document. This project was built to answer a
specific engineering question: *can a single Next.js app own the entire
report-authoring lifecycle — editing, compiling, diagramming, citing, and
exporting — behind one auth boundary, on entirely free-tier infrastructure?*
It's also a deliberate exercise in shipping a non-trivial full-stack system
solo: custom auth (no Clerk/Auth0), a real database schema, external API
orchestration, and a file-export pipeline.

---

## Features

**Core**
- Monaco-based LaTeX editor with syntax highlighting, chapter add/rename/reorder/delete, and 1.5s debounced auto-save
- On-demand PDF compilation via a hosted LaTeX-on-HTTP service (no local TeX install required)
- Embedded draw.io canvas supporting all 9 diagram types (DFD, UML, ER, Sequence, Activity, State Machine, Component, Architecture, Flowchart), exporting to PNG and auto-inserting `\includegraphics{}`
- Spreadsheet-style table builder that generates `\begin{table}...\end{table}` blocks at the cursor
- Image manager: upload to S3, browse gallery, insert `\begin{figure}...\end{figure}` blocks
- IEEE citation manager with form-driven BibTeX generation and auto cite-key assignment
- Four report templates: IEEE Standard Report, Mini Project, Seminar, Final Year Project
- Project export as a structured zip (`main.tex`, `references.bib`, `images/`, `diagrams/`)

**AI (opt-in, BYO key)**
- Gemini-powered text humanizer
- Plain-paragraph → IEEE-format LaTeX converter
- Per-user Gemini API key, AES-256 encrypted before it touches the database

**Security & Auth**
- Custom JWT auth (`jose` + `bcryptjs`) — no third-party auth provider
- Email verification and password-reset flows via Nodemailer/Gmail SMTP
- Edge middleware gating `/dashboard`, `/editor`, `/settings` behind a valid signed cookie (`lrs-auth-token`)

**Developer Experience**
- Strict TypeScript throughout, App Router conventions
- GitHub Actions CI running typecheck + production build on every push/PR
- Zustand for editor state, TanStack Query for server-state caching

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) | Server + client rendering in one codebase; API routes double as the backend |
| Styling | Tailwind CSS + shadcn/ui + Radix primitives | Accessible primitives without hand-rolling every component |
| Editor | Monaco Editor (`@monaco-editor/react`) | VS Code-grade editing experience in the browser, familiar to any dev |
| Diagrams | Embedded draw.io (`embed.diagrams.net`) | Full diagramming power without building a canvas engine from scratch |
| State | Zustand + TanStack Query v5 | Zustand for local editor state, Query for server cache/invalidation |
| Database | MongoDB Atlas (Mongoose) | Flexible document schema fits nested project/chapter/citation structures well |
| File Storage | AWS S3 (`@aws-sdk/client-s3`) | Public-read object storage for images/diagrams referenced inside compiled PDFs |
| LaTeX Compiler | YtoTech LaTeX-on-HTTP | Free, no-Docker, hosted `pdflatex`/`latexmk` — no server to operate |
| AI | Google Gemini (`gemini-2.5-flash`, user-supplied key) | Free tier, per-user quota isolation, no shared API cost |
| Auth | Custom JWT (`jose` + `bcryptjs`) | Full control over the auth flow; no vendor lock-in |
| Email | Nodemailer + Gmail SMTP | Zero-cost transactional email for a student project's traffic volume |
| CI | GitHub Actions | Typecheck + build gate on every push/PR |
| Deployment (target) | Vercel | Native Next.js hosting, generous free tier |

> **Note on the storage layer:** earlier project docs (and the CI workflow's
> dummy env vars) reference Vercel Blob and Cloudflare R2 respectively — both
> are leftovers from earlier iterations. The storage client that actually
> ships (`src/lib/storage/client.ts`) is AWS S3. See **Technical Debt** below.

---

## Architecture

```
┌──────────────┐      HTTPS       ┌────────────────────┐
│   Browser    │ ───────────────► │  Next.js App Router │
│ (Monaco, PDF │ ◄─────────────── │  (pages + API routes)│
│  viewer,     │                  └─────────┬────────────┘
│  draw.io)    │                            │
└──────────────┘                            │
                                              ▼
                  ┌───────────────────────────────────────────────┐
                  │                Edge Middleware                │
                  │   verifies JWT cookie for /dashboard,/editor,  │
                  │   /settings before the request reaches a page │
                  └───────────────────┬─────────────────────────────┘
                                       │
        ┌──────────────────────────────┼───────────────────────────────┐
        ▼                              ▼                                ▼
┌───────────────┐            ┌──────────────────┐              ┌──────────────────┐
│ MongoDB Atlas │            │   AWS S3 bucket   │              │  External APIs    │
│ users,        │            │ images, diagrams  │              │ • YtoTech compile  │
│ projects,     │            │ (public-read)     │              │ • Google Gemini    │
│ chapters,     │            └──────────────────┘              │ • Gmail SMTP       │
│ citations     │                                                └──────────────────┘
└───────────────┘
```

**Request lifecycle (compile action, as an example):**
1. Client sends the current chapters + citations to `POST /api/projects/[id]/compile`.
2. The route assembles a single `main.tex` from chapter content + the BibTeX file (`src/lib/latex/assembler.ts`).
3. Any images/diagrams referenced are resolved to their S3 URLs and passed as compiler resources.
4. The assembled document is POSTed to YtoTech's LaTeX-on-HTTP endpoint (`src/lib/latex/compiler.ts`).
5. On success, the raw PDF bytes stream back to the client for preview; on failure, the compiler's structured log is surfaced in the UI instead of a raw stack trace.

---

## Deployment Architecture

- **Frontend + API routes:** Vercel (Next.js native target) — serverless functions per API route, 10s execution limit on the Hobby tier
- **Database:** MongoDB Atlas free tier, network access opened to `0.0.0.0/0` to accommodate Vercel's dynamic egress IPs
- **File storage:** AWS S3, public-read bucket policy (not per-object ACLs, since post-2023 buckets default to "Bucket owner enforced")
- **LaTeX compilation:** stateless HTTP call to a third-party service — no compute or container managed by this project
- **Email:** Gmail SMTP via an App Password — fine at student-project volume (500/day cap), not meant to scale past that
- **CI/CD:** GitHub Actions runs typecheck + `next build` on every push/PR to `main`; no automated deploy step is wired up yet — deploys are manual via Vercel's Git integration

---

## Folder Structure

```
src/
├── app/
│   ├── api/                    ← Backend: auth, projects, chapters, citations,
│   │                              diagrams, images, export, compile, AI, user
│   ├── (auth)/                 ← login, register, verify-email, forgot/reset password
│   ├── (main)/                 ← dashboard, settings
│   └── editor/[projectId]/     ← full-screen LaTeX editor
├── components/
│   ├── editor/tools/           ← Monaco panel, PDF viewer, diagram/table/image modals
│   ├── dashboard/               ← project cards, create-project modal
│   ├── auth/                   ← auth forms
│   ├── landing/                 ← marketing/landing sections
│   └── ui/                      ← shadcn/ui primitives
├── config/templates/            ← IEEE / Mini / Seminar / FYP template definitions
├── hooks/                        ← TanStack Query hooks per resource
├── lib/
│   ├── auth/                    ← JWT issuing/verification, crypto helpers
│   ├── db/                      ← Mongoose connection + Project/User models
│   ├── storage/                 ← S3 client (upload/delete/fetch)
│   ├── gemini/                   ← Gemini client + friendly error mapping
│   ├── latex/                    ← assembler, compiler, Monaco language def, table generator
│   ├── bibtex/                   ← BibTeX field config + generator
│   ├── diagram/                  ← draw.io slug/constants helpers
│   └── email/                    ← Nodemailer wrapper
├── store/                        ← Zustand editor store
└── types/                        ← Shared TypeScript interfaces
middleware.ts                      ← Edge auth gate for protected routes
```

---

## Installation

```bash
git clone https://github.com/Heramb1221/latex-report-studio.git
cd latex-report-studio

npm install
cp .env.example .env.local
# Fill in every value in .env.local — see below

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster (free tier is enough)
- An AWS account with an S3 bucket + an IAM user scoped to `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on that bucket
- A Gmail account with an App Password generated

---

## Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/latex-report-studio

# JWT — generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=

# AES-256 key used to encrypt each user's Gemini API key at rest (same generation command as above)
ENCRYPTION_KEY=

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
# AWS_S3_PUBLIC_URL_BASE=   # optional CDN/CloudFront override

# Gmail SMTP (App Password, not your normal password)
GMAIL_USER=
GMAIL_APP_PASSWORD=
EMAIL_FROM="LaTeX Report Studio <you@gmail.com>"

# Optional: override the default Gemini model (default gemini-2.5-flash)
# GEMINI_MODEL=
```

Gemini itself needs no server-side key — each user supplies and stores their
own via **Settings**, encrypted with `ENCRYPTION_KEY` before it's saved.

---

## Usage

1. **Register** and verify your email (or log in).
2. **Create a project** from the dashboard, picking one of four templates.
3. Inside the **editor**, write chapters in the Monaco panel; the doc auto-saves.
4. Insert a **table**, a **figure**, or a **diagram** from the tool panel — each
   inserts the correct LaTeX block at the cursor automatically.
5. Add references through the **citation manager**; BibTeX is generated for you.
6. Optionally run a paragraph through **Humanize** or **Convert to LaTeX**
   (requires a Gemini key added in Settings).
7. Hit **Compile** to get a live PDF preview.
8. **Export** the finished project as a zip ready to hand in or push to your own repo.

---

## API Documentation

Representative endpoints (all project-scoped routes require a valid auth cookie):

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET    /api/projects
POST   /api/projects
GET    /api/projects/:projectId
DELETE /api/projects/:projectId

POST /api/projects/:projectId/chapters
PUT  /api/projects/:projectId/chapters/reorder

POST /api/projects/:projectId/citations
POST /api/projects/:projectId/images
POST /api/projects/:projectId/diagrams

POST /api/projects/:projectId/compile      # returns application/pdf on success
GET  /api/projects/:projectId/export       # returns a zip archive

POST /api/ai/humanize                       # requires a stored Gemini key
POST /api/ai/convert
```

Example compile response on a LaTeX error:

```json
{
  "success": false,
  "errorLog": "! Undefined control sequence.\nl.42 \\includegraphic\n              {diagram1.png}"
}
```

---

## Screenshots

| Feature | Screenshot |
|---------|------------|
| Landing Page | <img src="https://github.com/user-attachments/assets/cebd5e05-0d95-43f7-8985-0673eee1429c" alt="Landing Page" width="700"/> |
| Dashboard | <img src="https://github.com/user-attachments/assets/cd7a6b77-a857-46a4-bbc5-7b97b5be5a76" alt="Dashboard" width="700"/> |
| Editor — Monaco + Live PDF | <img src="https://github.com/user-attachments/assets/5cddae4f-8ae0-4344-b5b3-c12f6f7c9455" alt="Editor — Monaco + Live PDF" width="700"/> |
| Diagram Editor | <img src="https://github.com/user-attachments/assets/608af355-3bbb-4591-84ea-e044b964c93f" alt="Diagram Editor" width="700"/> |
| Citation Manager | <img src="https://github.com/user-attachments/assets/0be3575d-93c2-4c56-b1d8-32a84fb5eb44" alt="Citation Manager" width="700"/> |

---

## Performance Considerations

- Auto-save is debounced at 1.5s to avoid hammering the API on every keystroke
- PDF compilation is fully delegated to an external service — no CPU-heavy LaTeX process runs on the app's own compute
- TanStack Query caches project/chapter/citation reads client-side, reducing redundant API calls during editing sessions
- No current caching layer (e.g. Redis) in front of MongoDB — every read hits Atlas directly

---

## Security Considerations

- Passwords hashed with `bcryptjs`; sessions are signed JWTs stored in an httpOnly cookie, verified in edge middleware before protected pages render
- Gemini API keys are AES-256 encrypted before storage, never returned to the client in plaintext after the initial save
- S3 bucket relies on a bucket policy for public reads rather than per-object ACLs (required by AWS's post-2023 "Bucket owner enforced" default)
- No rate limiting currently implemented on auth or AI endpoints — a known gap under **Known Issues**

---

## Tradeoffs & Limitations

- **No self-hosted LaTeX compilation** — depends entirely on YtoTech's uptime and undocumented rate limits. A `latex.ytotech.com` outage means compilation stops working for every user, with no fallback.
- **AI features require a user-supplied key** — this keeps the app's own cost at zero but adds setup friction for non-technical users.
- **Gmail SMTP caps at 500 emails/day** — fine for a student project's traffic, not for real growth.
- **No automated tests** — CI currently checks typecheck + build only, not unit or integration coverage.

---

## Technical Debt

- **Storage provider documentation drift** (see above) — indicates at least one unlogged migration between Blob → R2 → S3 that was never fully reflected across `.env.example`, `CONTRIBUTING.md`, and `ci.yml`. Worth a single PR to align all three.
- Single external compiler dependency with no fallback/self-hosted path
- No shared validation layer reused between client forms and API route handlers beyond Zod schemas in `lib/validations`
- No test suite to catch regressions in the LaTeX assembler or BibTeX generator, both of which are string-templating logic that's easy to silently break

---

## Scalability Discussion

Current design comfortably serves the target audience (individual students,
one project at a time). Scaling considerations if usage grew:
- MongoDB Atlas free tier (512 MB) would need an upgrade before real growth
- Serverless function cold starts + a 10s Vercel Hobby timeout could clip large compile jobs — a queued/async compile job would be the next architectural step
- Gmail SMTP would need replacing (e.g. Resend) well before 500 emails/day is reached at any real scale

---

## Challenges Faced

- Assembling a single valid `main.tex` from independently-edited chapters, images, diagrams, and a generated `.bib` file without producing subtle LaTeX ordering bugs
- Handling AWS's post-2023 default of disabled per-object ACLs, which required switching from ACL-based public reads to a bucket-policy approach
- Mapping opaque errors from a third-party LaTeX compiler and the Gemini SDK into actionable, user-facing messages instead of raw stack traces
- Keeping a solo-maintained fullstack app's docs, CI config, and actual code in sync as the storage layer changed providers

---

## What I Learned

- Designing an edge-middleware auth gate that verifies a JWT before a protected page even renders, rather than checking auth per-component
- Practical tradeoffs of depending on free third-party infrastructure (LaTeX-on-HTTP, Gemini free tier) versus self-hosting, and how to design the calling code so the dependency can be swapped later
- The real cost of documentation drift in a solo project — without a second reviewer, stale docs (Blob/R2/S3) can persist for a long time unnoticed
- Structuring a moderately complex Next.js App Router project (30+ API routes) so that auth, data access, and external API clients stay cleanly separated in `lib/`


---
## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

© 2026 Heramb Chaudhari · GitHub: [@Heramb1221](https://github.com/Heramb1221)

---

## Contact

**Heramb Chaudhari**

[![GitHub](https://img.shields.io/badge/GitHub-Heramb1221-black?style=for-the-badge&logo=github)](https://github.com/Heramb1221)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Heramb%20Chaudhari-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/heramb-chaudhari)

[![Email](https://img.shields.io/badge/Email-hchaudhari1221%40gmail.com-red?style=for-the-badge&logo=gmail)](mailto:hchaudhari1221@gmail.com)
