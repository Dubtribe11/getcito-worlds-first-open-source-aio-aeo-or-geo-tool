# 🚀 Deploy to the open web — Firebase App Hosting

This app is a **Next.js server app** (it has a live backend — Firebase Admin +
OpenAI run server-side), so it needs a host that runs Node. **Firebase App
Hosting** is the recommended target: it stays inside your existing
`aivisbilitytracker` project, costs ~$0 at low traffic, and needs no
service-account key (it uses built-in credentials).

> Don't confuse **App Hosting** (SSR, what we want) with classic **Firebase
> Hosting** (static files only — would break every API route).

---

## Before you deploy — go-live checklist 🔴

These are not optional. Do them before sharing the URL.

1. **Rotate the keys** that were shared during setup (OpenAI key + the Firebase
   service-account key). New OpenAI key: platform.openai.com/api-keys. New
   service-account key: Firebase Console > Project settings > Service accounts.
   *(App Hosting uses built-in credentials, so you only need the OpenAI key as a
   secret — see step 5.)*

2. **Set an OpenAI spend cap**: platform.openai.com > Settings > Limits → set a
   monthly hard usage limit + a lower soft-limit email alert. Each tracked query
   is a paid call; a public app with no cap can run up real money.

3. **Deploy the tightened Firestore rules** (this repo now ships safe rules that
   replaced the old "world-readable" ones):
   ```bash
   firebase deploy --only firestore:rules --project aivisbilitytracker
   ```
   Verify in Console > Firestore > Rules that there's no `allow ... if true`.

4. **Lock down who can sign up** (otherwise strangers can self-register and use
   your AI budget). Easiest: set an email allowlist — add this env var in step 5:
   `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=nelsononeill.com.au` (comma-separate more).
   Also consider `NEXT_PUBLIC_NEW_USER_CREDITS=20` to cap new accounts.

---

## Deploy steps

### 1. Enable billing (Blaze)
App Hosting requires the **Blaze (pay-as-you-go)** plan. Firebase Console >
gear > Usage and billing > Modify plan > **Blaze**, attach a billing account.
(At low traffic the bill is typically ~$0 — set a budget alert to be safe.)

### 2. Install the CLI and log in
```bash
npm install -g firebase-tools
firebase --version      # need v14.4.0 or newer
firebase login
```

### 3. Create the App Hosting backend (connect GitHub)
In Firebase Console > **Build > App Hosting > Get started**:
- Authorize/install the Firebase GitHub app on your forked repo.
- Pick the repository and the **live branch** (e.g. `main`).
- Choose a region (e.g. `australia-southeast1`) and create the backend.

Every push to the live branch now builds and deploys automatically. The repo
already includes `apphosting.yaml` with the build config + public Firebase
values, so there's nothing else to configure there.

### 4. (One-time) create the OpenAI secret
```bash
firebase apphosting:secrets:set OPENAI_API_KEY
# paste your (rotated) key when prompted; say yes to granting backend access
```
`apphosting.yaml` already references this secret. Add `PERPLEXITY_API_KEY` etc.
the same way if/when you want those engines (then uncomment them in the yaml).

### 5. Add the hardening env vars (optional but recommended)
Either uncomment them in `apphosting.yaml` (commit), or add them in the Console
under the backend's settings:
- `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=nelsononeill.com.au`
- `NEXT_PUBLIC_NEW_USER_CREDITS=20`

### 6. Deploy
Push to your live branch, or run a one-off:
```bash
firebase deploy --only apphosting --project aivisbilitytracker
```
When the rollout finishes, the Console shows your live URL, e.g.
`https://<backend>--aivisbilitytracker.<region>.hosted.app`.

### 7. ⚠️ Authorize the live domain for sign-in (the #1 gotcha)
Firebase Console > **Authentication > Settings > Authorized domains > Add
domain** → paste the bare host (no `https://`, no trailing slash), e.g.
`<backend>--aivisbilitytracker.<region>.hosted.app`. **Without this, login
fails.** Add your custom domain here too once you set one.

### 8. (Optional) custom domain
App Hosting > select backend > Settings > **Add custom domain** → add the DNS
records it shows at your registrar. Managed SSL is automatic. Then re-do step 7
for the custom domain.

---

## Visiting it
Once steps 6–7 are done, open the live URL, sign up (with an allowed email),
and you're on the dashboard. That URL is your public app — share it with whoever
you've allowlisted.

---

## Alternative: Vercel
If you prefer Vercel: import the GitHub repo, add the same env vars in Project
Settings (paste `FIREBASE_PRIVATE_KEY` as the single-line `\n`-escaped value,
**no surrounding quotes**), deploy, then set `NEXT_PUBLIC_APP_URL` to the
resulting URL and redeploy. Note: Vercel's free **Hobby** tier is
**non-commercial only** — agency/client use requires **Pro ($20/seat/month)**.
You'd still do the go-live checklist above (rules, OpenAI cap, authorized
domains, signup lockdown).
