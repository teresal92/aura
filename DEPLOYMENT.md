# Deployment Guide

Aura is built to deploy on [Vercel](https://vercel.com) with zero additional configuration — Next.js and Vercel are made by the same team, so everything just works.

---

## Steps

**1. Push your project to GitHub**

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/your-username/aura.git
git push -u origin main
```

**2. Import your repo on Vercel**

- Go to [vercel.com/new](https://vercel.com/new)
- Click **Add New Project** and import your GitHub repo
- Vercel will auto-detect Next.js — no build configuration needed

**3. Add your environment variables**

In the Vercel project dashboard, go to **Settings → Environment Variables** and add:

```env
AI_PROVIDER
OPENAI_API_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

> ⚠️ Never commit `.env.local` to Git. Your API keys should only ever live in Vercel's environment variable settings.

**4. Deploy**

Click **Deploy**. Vercel will build and publish your app. Every subsequent push to `main` triggers an automatic redeployment.

**5. Set your Supabase redirect URL**

Once deployed, copy your production URL (e.g. `https://aura.vercel.app`) and add it to your Supabase project under **Authentication → URL Configuration → Redirect URLs** — this is required for magic link auth to work in production.

