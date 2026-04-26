# Supabase Setup — One-Time Backend Provisioning

Score Canvas V3 adds **persistence**: sign-in, save my projects, share by URL, and (Phase 4) audio upload. This requires one Supabase project. Estimated setup time: **20 minutes**.

Until this setup is done, the app gracefully no-ops: the demo projects + Hear-It gallery + tutorial all still work, but Sign In / Save / Fork show a friendly "backend not configured" message.

---

## 1. Create the Supabase project

1. Go to https://supabase.com and sign in (GitHub auth is fastest).
2. Click **New project**.
3. Settings:
   - **Name**: `score-canvas-prod`
   - **Region**: closest to your audience (US West for the West Coast / Asia, US East for East Coast / Europe-but-cheap)
   - **Database password**: generate one and save it in 1Password (you won't need it again for this app, but Supabase stores it for direct DB access)
4. Wait ~2 minutes for provisioning to finish.

## 2. Run the schema

In the Supabase dashboard, open **SQL Editor → New Query**, paste this, and click **Run**:

```sql
-- ─── Projects ─────────────────────────────────────────────────────────
create table projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  subtitle text,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index projects_owner_id_idx on projects(owner_id);

-- ─── Share links ──────────────────────────────────────────────────────
create table share_links (
  token text primary key,
  project_id uuid references projects(id) on delete cascade not null,
  permission text not null check (permission in ('view','comment')) default 'view',
  created_at timestamptz default now(),
  expires_at timestamptz
);

create index share_links_project_id_idx on share_links(project_id);

-- ─── Row-Level Security ───────────────────────────────────────────────
alter table projects enable row level security;
alter table share_links enable row level security;

-- Owners can read + write their own projects
create policy "owners read their projects"
  on projects for select using (auth.uid() = owner_id);

create policy "owners write their projects"
  on projects for all using (auth.uid() = owner_id);

-- Anyone with a valid (non-expired) share_link can read the project
create policy "anyone reads projects via valid share_link"
  on projects for select using (
    exists (
      select 1 from share_links
      where share_links.project_id = projects.id
      and (share_links.expires_at is null or share_links.expires_at > now())
    )
  );

-- Owners read + write share_links for their own projects
create policy "owners read share_links for their projects"
  on share_links for select using (
    exists (select 1 from projects where projects.id = share_links.project_id and projects.owner_id = auth.uid())
  );

create policy "owners write share_links for their projects"
  on share_links for all using (
    exists (select 1 from projects where projects.id = share_links.project_id and projects.owner_id = auth.uid())
  );

-- Anonymous visitors can read share_links by token (the token IS the credential)
create policy "anyone reads share_link by token"
  on share_links for select using (true);
```

You should see "Success. No rows returned." Both tables now exist with RLS on.

## 3. Create the storage bucket

In the Supabase dashboard, open **Storage → New bucket**:

- **Name**: `user-audio`
- **Public**: ❌ **Off** (we use signed URLs for shared-project audio)
- **File size limit**: 25 MB (free-tier cap; raise on paid plan)
- **Allowed MIME types**: `audio/mpeg, audio/wav, audio/mp4, audio/ogg`

Then go to **Storage → user-audio → Policies** and add these RLS policies on the `storage.objects` table:

```sql
-- Users can upload to their own folder (path = {user_id}/...)
create policy "users upload to their folder"
on storage.objects for insert
to authenticated
with check (bucket_id = 'user-audio' and (storage.foldername(name))[1] = auth.uid()::text);

-- Users can read their own files
create policy "users read their files"
on storage.objects for select
to authenticated
using (bucket_id = 'user-audio' and (storage.foldername(name))[1] = auth.uid()::text);

-- Users can update / delete their own files
create policy "users update their files"
on storage.objects for update
to authenticated
using (bucket_id = 'user-audio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their files"
on storage.objects for delete
to authenticated
using (bucket_id = 'user-audio' and (storage.foldername(name))[1] = auth.uid()::text);

-- Owners of a shared project can be read by signed URL only — frontend
-- generates signed URLs server-side via createSignedUrl(); no policy
-- needed for share-link audio reads since signed URLs bypass RLS.
```

## 4. Configure email magic-link auth

Supabase Auth is on by default for email. The defaults work, but tighten two things:

1. **Authentication → Providers → Email** — confirm "Enable Email Provider" is on, and "Confirm email" is on (default).
2. **Authentication → URL Configuration**:
   - **Site URL**: `https://scorecanvas.io`
   - **Redirect URLs** (add all three):
     - `https://scorecanvas.io/#app`
     - `https://score-canvas-v2.netlify.app/#app` (staging)
     - `http://localhost:5173/#app` (local dev)

Without those redirect URLs, magic-link clicks will fail with a redirect error.

## 5. Grab your env vars

In **Project Settings → API**, copy:

- **Project URL** (e.g. `https://abcdefghijk.supabase.co`)
- **anon / public key** (the long JWT-looking string under "Project API keys")

The anon key is *safe to expose in client code* — RLS enforces all access. Do **not** copy the `service_role` key into the frontend.

## 6. Wire env vars into Netlify

For **production** (`score-canvas` site, scorecanvas.io):

1. https://app.netlify.com/projects/score-canvas/configuration/env
2. Add two env vars:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Trigger a redeploy: **Deploys → Trigger deploy → Deploy site**

For **staging** (`score-canvas-v2` site):

1. https://app.netlify.com/projects/score-canvas-v2/configuration/env
2. Same two vars (you can point staging at the same Supabase project, or stand up a separate one for clean test data)
3. Trigger a redeploy

For **local dev**:

```bash
# Inside ScoreCanvasV2/
cat > .env.local <<EOF
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
EOF

npm run dev
```

`.env.local` is gitignored. Vite picks it up automatically.

## 7. Smoke test

After the redeploy, on the live site:

1. Click **Sign in** in the top bar → enter your email → check inbox
2. Click the magic link → should land you back at the site, signed in
3. Open any demo project → click **Fork to my projects** → it appears in the sidebar's "My Projects" section
4. Edit a node, then click **Save** → "saved just now" indicator appears
5. Reload the tab → the project loads from the database with your edits intact

If any of that fails, check:

- The browser console for errors (most likely: redirect URL not allowlisted)
- Supabase **Authentication → Logs** for failed magic-link attempts
- Supabase **Database → projects** table to confirm rows are appearing

---

## Cost expectations (Supabase free tier)

For early users (< 50 active accounts, < 500 MB of audio):

- Database: free (500 MB included)
- Auth: free (50,000 monthly active users)
- Storage: free (1 GB included)
- Bandwidth: free (5 GB / month egress)

When you outgrow the free tier (probably around the first paying customer), the **Pro plan is $25/month** and 10× the limits across the board. Add Stripe billing in your own product before you'd hit Supabase Pro pricing.

---

## What's NOT in this setup

- No email-template customization yet (use Supabase defaults — they look fine)
- No SAML / SSO — that's the studio rollout track
- No edge functions — the frontend talks to Supabase directly via supabase-js
- No backups — Supabase Pro includes daily backups; free tier doesn't

---

Once steps 1–6 are done, V3 lights up automatically. Until then, the app shows a friendly "backend not configured" message in the auth modal and continues to serve the demo experience.
