# hari-tracker

Anonymous visit tracker + guestbook notes for `hari.is-a.dev`, deployed as a
Cloudflare Worker. The site pings `POST /hit` on load (with a `vid` first-party
cookie for returning-visitor detection); Dory's "✎ Leave a note" sends
`POST /note`. Both endpoints resolve IP → **city/country** server-side via
Cloudflare's free `request.cf` enrichment — no external geo API, no raw IPs kept
(only a truncated SHA-256 hash).

## One-time deploy (you, once)

Requires Node 18+ and a free Cloudflare account.

```bash
cd tracker
npm install

# 1. Log in
npx wrangler login

# 2. Create the KV namespace and copy its "id" into wrangler.toml
npx wrangler kv namespace create HITS

# 3. Protect the /admin dashboard - choose any long random string
npx wrangler secret put ADMIN_KEY

# 4. Ship it
npm run deploy
```

The deploy prints a worker URL like `https://hari-tracker.<account>.workers.dev`.

## Wire the site to it

In `js/tracker.js`, replace the placeholder:

```js
const TRACKER_ENDPOINT = "https://hari-tracker.<account>.workers.dev";
```

Then commit + push — the GitHub Actions deploy ships the site, and the tracker
source is excluded from the Pages publish automatically.

## Viewing visits

Bookmark:

```
https://hari-tracker.<account>.workers.dev/admin?key=<your ADMIN_KEY>
```

Groups visits by day and by city/country, lists referrers, flags returning
visitors, and shows the guestbook notes.

## Local dev

```bash
cd tracker
npx wrangler dev
```

Then POST test hits (sendBeacon-style, no Origin check needed from curl):

```bash
curl -X POST http://localhost:8787/hit -H "Content-Type: application/json" \
  -d '{"vid":"test-123","page":"/","referrer":"https://example.com"}'
curl -X POST http://localhost:8787/note -H "Content-Type: application/json" \
  -d '{"vid":"test-123","name":"Ada","company":"ACME","note":"Great site!"}'
curl "http://localhost:8787/admin?key=devkey"   # set ADMIN_KEY via .dev.vars for local
```

For local runs, create `tracker/.dev.vars` (git-ignored) with:
`ADMIN_KEY=devkey`

## Endpoints

| Method | Path    | Purpose                                          |
|--------|---------|--------------------------------------------------|
| POST   | `/hit`  | Record a visit (vid, referrer, page, tz)         |
| POST   | `/note` | Guestbook note (vid, name?, company?, note)       |
| GET    | `/admin` | Password-protected dashboard (`?key=ADMIN_KEY`) |

CORS is allowed only for `https://hari.is-a.dev` (plus localhost for testing);
`/admin` is not CORS-enabled.