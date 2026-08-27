# Deebo! Outreach Coach — setup

No terminal. No code. Everything below happens in a browser, signed in as
**deebo.voting@gmail.com**. Takes about fifteen minutes.

---

## Before you start

Revoke the API key that was pasted into chat. It is no longer safe.

1. Go to platform.claude.com → Settings → API keys
2. Delete the existing key
3. Click **Create key**, name it `deebo-outreach-coach`
4. Copy the new key. It starts with `sk-ant-`. You only see it once.
5. Keep that tab open. You will paste it in step 3 below.

Also in that console: Settings → Billing → add a card and set a monthly
spending limit. £15 is plenty to start. Without billing, the key returns errors.

---

## Step 1 — Put the code on GitHub

1. Go to github.com and sign up as deebo.voting@gmail.com
2. Click **+** (top right) → **New repository**
3. Name it `deebo-outreach-coach`, set it to **Private**, click **Create**
4. On the next screen click **uploading an existing file**
5. Unzip the folder you were given, then drag **everything inside it** into the
   browser window — all the files and folders together
6. Click **Commit changes**

---

## Step 2 — Connect Vercel

1. Go to vercel.com and sign up **with GitHub** as deebo.voting@gmail.com
2. Click **Add New → Project**
3. Find `deebo-outreach-coach` and click **Import**
4. Do not click Deploy yet — go to step 3 first

---

## Step 3 — Add the two secrets

Still on the import screen, open **Environment Variables** and add these two.

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | the new `sk-ant-` key you copied |
| `APP_PASSCODE` | any simple phrase, e.g. `deebo2026` |

The passcode is what Naomi types the first time she opens the page. Send it to
her separately, not in the same message as the link.

Now click **Deploy**. It takes about a minute.

---

## Step 4 — Give it a proper address

Vercel gives you something like `deebo-outreach-coach.vercel.app`. That works
straight away — you can stop here and send it to Naomi.

For `coach.deeboapp.com` instead:

1. In Vercel: Project → Settings → Domains → add `coach.deeboapp.com`
2. Vercel shows you a CNAME record
3. In Cloudflare: DNS → Add record → paste what Vercel showed you
4. Wait a few minutes

---

## Updating the playbook each week

The playbook lives in one file: `lib/playbook.ts`.

1. Open the repo on GitHub
2. Click `lib` → `playbook.ts` → the pencil icon
3. Edit the text, click **Commit changes**
4. Vercel redeploys by itself within a minute

Nothing else needs touching. That file is the whole brain of the tool.

---

## If something breaks

**"The API key was rejected"** — the key is wrong or billing isn't set up.
Vercel → Settings → Environment Variables → update it, then Deployments →
Redeploy.

**"That passcode isn't right"** — check `APP_PASSCODE` in Vercel matches what
Naomi is typing, exactly, including capitals.

**"Couldn't reach the coach"** — usually the spending limit was hit. Check the
billing page on platform.claude.com.

---

## What this tool will not do

It only knows the Deebo! playbook. When Naomi asks about something the playbook
has no evidence for, it says so instead of guessing. That is deliberate — a
confident answer built on nothing is worse than no answer. When it flags a gap,
that gap goes into the next weekly playbook update.
