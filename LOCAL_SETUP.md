# 🚀 Running GetCito Locally

A short, no-fluff guide to get this AI visibility tracking tool running on your
machine for client work.

> **TL;DR:** Install Node, set up a free Firebase project, add at least one AI
> provider key, then `npm install && npm run dev`.

---

## 1. Prerequisites

- **Node.js 18+** (20 LTS recommended) — https://nodejs.org
- **A Google account** (for the free Firebase project)
- At least one **AI provider API key** (OpenAI is the easiest to start with)

Check Node is installed:

```bash
node -v    # should print v18+ (or v20+)
```

---

## 2. Install & run

```bash
# from the project folder
npm install
cp .env.example .env.local   # then edit .env.local (see step 3)
npm run dev
```

Open **http://localhost:3000** — you'll be redirected to the sign-in page.

> The repo already includes an `.npmrc` so `npm install` works without extra
> flags. If you ever wipe it, install with `npm install --legacy-peer-deps`.

---

## 3. What you need to provide (the important bit)

Everything goes in **`.env.local`**. There are two groups:

### A) Firebase — REQUIRED (auth + database) 🔴

This is the backbone: it handles user login and stores all the brand/query
data. It's free for this scale.

1. Go to https://console.firebase.google.com → **Add project**.
2. In the project, click the **web icon (`</>`)** to register a web app.
   Copy the config values into the `NEXT_PUBLIC_FIREBASE_*` lines in `.env.local`.
3. Left sidebar → **Build → Authentication → Get started** →
   enable **Email/Password** (and Google if you want).
4. Left sidebar → **Build → Firestore Database → Create database**
   (start in *production* mode; we ship security rules in `firestore.rules`).
5. **Project settings (gear) → Service accounts → Generate new private key.**
   This downloads a JSON file. From it, copy:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key`  → `FIREBASE_PRIVATE_KEY` (keep the surrounding quotes and the
     `\n` escapes exactly as shown in `.env.example`)

> ⚠️ The service-account JSON is a secret. Never commit it. `.env.local` is
> already git-ignored.

### B) AI providers — at least ONE 🟡

These are the engines whose visibility you actually track. Add as many as you
want; each one lights up another data source in the dashboard.

| Provider | Tracks | Where to get a key |
|---|---|---|
| **OpenAI** | ChatGPT Search | https://platform.openai.com/api-keys |
| **Perplexity** | Perplexity answers | https://www.perplexity.ai/settings/api |
| **DataForSEO** | Google AI Overviews | https://dataforseo.com (user + password) |
| **Google Gemini** | Gemini (fallback) | https://aistudio.google.com/app/apikey |
| **Azure OpenAI** | ChatGPT via Azure | Azure Portal (optional alternative) |

**Recommendation to start:** just add `OPENAI_API_KEY`. You can layer in
Perplexity + DataForSEO later for fuller coverage.

> These are usage-billed APIs — you pay the provider per query. Set spend limits
> in each provider's dashboard before running large client batches.

---

## 4. Verify your setup

With the dev server running, check which keys it sees:

```bash
# In another terminal:
node validate-config.js                      # checks required env vars
curl http://localhost:3000/api/debug-providers   # shows which providers are live
```

Then in the browser:

1. Go to **http://localhost:3000/signup** and create your account.
2. You'll land on the dashboard → **Add Brand** to set up your first client.

---

## 5. Common gotchas

- **`npm install` errors about `zod` / peer deps** → make sure `.npmrc` exists,
  or run `npm install --legacy-peer-deps`.
- **Every page shows a 500 / Tailwind PostCSS error** → you're on Tailwind v4;
  this repo is pinned to v3.4 in `package.json`. Run `npm install` again.
- **`Firebase Admin SDK error: Missing required environment variables`** →
  `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` not set (or the private key's
  `\n` escapes got mangled — keep it on one line, wrapped in double quotes).
- **Sign-in does nothing** → you didn't enable Email/Password in Firebase Auth
  (step 3.3).

---

## 6. Going beyond local

When you're ready to host it for the team/clients, the easiest path is
**Vercel** (the project is a standard Next.js app): import the repo, paste the
same `.env.local` values into Vercel's Environment Variables, deploy. See the
main `README.md` for more.
