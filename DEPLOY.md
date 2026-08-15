# Proxy Table — backend deploy guide

Two things get deployed: the Worker (API + database) and the updated app
(same GitHub Pages site as before). Do the Worker first — the app needs its
address.

## 1. Create a Cloudflare account
cloudflare.com → sign up. Free tier covers this completely.

## 2. Install Wrangler (Cloudflare's deploy tool)
This runs on a computer, not your phone — a laptop, one time.

    npm install -g wrangler
    wrangler login

That opens a browser tab to authorize.

## 3. Create the database
From inside the `worker` folder:

    cd worker
    wrangler d1 create proxytable

This prints a `database_id`. Copy it into `wrangler.toml`, replacing
`REPLACE_WITH_YOUR_DATABASE_ID`.

## 4. Load the schema

    wrangler d1 execute proxytable --remote --file=./schema.sql

(If the database already exists from an earlier version, the new
`match_results` table is created by the same file — it is safe to re-run.)

Durable Objects are declared in `wrangler.toml`. The first `wrangler deploy`
after adding them will apply the migration that creates the `Match` class.

## 5. Set the push notification keys
A real VAPID keypair is already generated below. Set them as Worker secrets
(these stay server-side, never shipped to the phone):

    wrangler secret put VAPID_PUBLIC_KEY
    # paste: BKTD5pf1EjDb0TedUhbNIj8ZzIOHIMoQzRMHGMe01njMbQEhcsIjQwckjWNRLaPFSDq4ywK5U-JoMqV3X_v_kPE

    wrangler secret put VAPID_PRIVATE_D
    # paste: qYFDUHHgbyl7aAo40r9Vm-SjhaeX-p9saBw5T-5-icE

    wrangler secret put VAPID_PUBLIC_X
    # paste: pMPml_USMNvRN51SFs0iPxnMg4cgyhDNEwcYx7TWeMw

    wrangler secret put VAPID_PUBLIC_Y
    # paste: bQEhcsIjQwckjWNRLaPFSDq4ywK5U-JoMqV3X_v_kPE

    wrangler secret put VAPID_SUBJECT
    # paste: mailto:you@example.com   (any email — push services want *something* here)

These four numbers are one matched keypair — don't mix them with a
different generation. If you ever want fresh ones, regenerating all five
together and re-running the five commands above is the only correct way to
rotate them.

## 6. Deploy the Worker

    wrangler deploy

This prints your API's address, something like:

    https://proxytable-api.yourname.workers.dev

## 7. Point the app at it
Open `index.html` in a text editor, find this line near the top of the
`<script>` block:

    const API_BASE = "https://proxytable-api.YOUR-SUBDOMAIN.workers.dev";

Replace it with the real address from step 6.

## 8. Upload to GitHub Pages
Same repo, same process as before: upload `index.html`, `sw.js`,
`manifest.webmanifest`, `icon-192.png`, `icon-512.png` — overwriting the
existing ones. Give it a minute, then reload the site on both phones.

## 9. Try it
- Both of you open the site, pick a username each.
- One of you: menu → Notifications → allow (optional, but try it).
- Challenge by name or by code, accept, and you should land at a shared
  table with a "synced" indicator in the middle of the seam.

## What's now server-side vs. what stayed local
- **Server (D1 + Worker):** accounts, decks, matches, the ordered event
  log, push subscriptions.
- **Still local:** the practice-table mode (playing a deck solo, untouched
  from before), and the JSON/text backup export as a portable copy on top
  of the server copy.

## If something doesn't work
- `wrangler tail` in the worker folder streams live logs from the Worker —
  the fastest way to see what a failing request actually did.
- A 403 on `/api/match/.../events` means the username posting isn't one of
  the two players in that match — usually a stale `currentMatch` after
  switching accounts.
- Push not arriving: Android's notification permission has to be granted,
  Chrome (not a third-party browser) has to be the one installed as the
  PWA, and the subscription is created fresh each time someone taps
  Notifications — if you regenerate VAPID keys, everyone needs to tap it
  again.
