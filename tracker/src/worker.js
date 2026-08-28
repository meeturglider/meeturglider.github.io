/* Hari visit tracker — Cloudflare Worker
 *
 * Records portfolio visits (city/country resolved server-side from the
 * request via Cloudflare's free `request.cf` enrichment), stores
 * anonymous hits + guestbook notes in KV, and serves a private /admin
 * dashboard. No raw IP addresses are kept (only a truncated hash), no
 * third-party cookies are touched.
 *
 * Secrets (set with `npx wrangler secret put ADMIN_KEY`):
 *   ADMIN_KEY  — password for /admin?key=...
 */

const ALLOWED_ORIGINS = new Set(["https://hari.is-a.dev"]);

const PREFIX_DAY = "day:";
const PREFIX_NOTES = "notes:";
const PREFIX_VID = "vid:";

function isAllowedOrigin(origin) {
    if (!origin) return false;
    if (ALLOWED_ORIGINS.has(origin)) return true;
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function corsHeaders(origin) {
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin",
    };
}

async function sha256Hex(text) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function todayKey(prefix) {
    return prefix + new Date().toISOString().slice(0, 10);
}

async function readList(env, key) {
    const raw = await env.HITS.get(key);
    return raw ? JSON.parse(raw) : [];
}

async function appendToList(env, key, entry) {
    const list = await readList(env, key);
    list.push(entry);
    await env.HITS.put(key, JSON.stringify(list));
}

function send(origin, status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
}

/* ------------------------------------------------------------------ */

async function handleHit(request, env, origin) {
    let body = {};
    try { body = await request.json(); } catch (e) { /* tolerated */ }

    const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
    const cf = request.cf || {};
    const vid = typeof body.vid === "string" && body.vid ? body.vid.slice(0, 64) : null;

    let returning = false;
    if (vid) {
        const prev = await env.HITS.get(PREFIX_VID + vid);
        returning = Boolean(prev);
        await env.HITS.put(PREFIX_VID + vid,
            JSON.stringify({ lastSeen: new Date().toISOString() }));
    }

    await appendToList(env, todayKey(PREFIX_DAY), {
        ts: new Date().toISOString(),
        vid,
        returning,
        ipHash: (await sha256Hex(ip)).slice(0, 16),
        country: cf.country || null,
        region: cf.region || null,
        city: cf.city || null,
        tz: cf.timezone || (typeof body.tz === "string" ? body.tz.slice(0, 64) : null),
        ua: (request.headers.get("User-Agent") || "unknown").slice(0, 300),
        referrer: typeof body.referrer === "string" ? decodeURIComponent(body.referrer).slice(0, 300) : null,
        page: typeof body.page === "string" ? body.page.slice(0, 200) : "/",
    });

    return send(origin, 200, { ok: true, returning });
}

async function handleNote(request, env, origin) {
    let body = {};
    try { body = await request.json(); } catch (e) {
        return send(origin, 400, { ok: false, error: "malformed body" });
    }

    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (!note || note.length > 2000) {
        return send(origin, 400, { ok: false, error: "note is required (max 2000 chars)" });
    }

    const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
    const cf = request.cf || {};

    await appendToList(env, todayKey(PREFIX_NOTES), {
        ts: new Date().toISOString(),
        vid: typeof body.vid === "string" ? body.vid.slice(0, 64) : null,
        name: typeof body.name === "string" ? body.name.trim().slice(0, 80) || null : null,
        company: typeof body.company === "string" ? body.company.trim().slice(0, 120) || null : null,
        note,
        country: cf.country || null,
        city: cf.city || null,
        ipHash: (await sha256Hex(ip)).slice(0, 16),
    });

    return send(origin, 200, { ok: true });
}

/* ------------------------------------------------------------------ */
/* Admin dashboard                                                     */
/* ------------------------------------------------------------------ */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function hostOf(referrer) {
    try { return new URL(referrer).hostname.replace(/^www\./, ""); }
    catch (e) { return referrer || "—"; }
}

function parseUA(ua) {
    ua = ua || "";
    const info = { browser: "Unknown", os: "Unknown", device: "—" };
    if (/Edg\//.test(ua)) info.browser = "Edge";
    else if (/OPR\//.test(ua)) info.browser = "Opera";
    else if (/Chrome\//.test(ua)) info.browser = "Chrome";
    else if (/Firefox\//.test(ua)) info.browser = "Firefox";
    else if (/Safari\//.test(ua)) info.browser = "Safari";
    if (/Windows/.test(ua)) info.os = "Windows";
    else if (/Mac OS X/.test(ua)) info.os = "macOS";
    else if (/Android/.test(ua)) info.os = "Android";
    else if (/iPhone|iPad/.test(ua)) info.os = "iOS";
    else if (/Linux/.test(ua)) info.os = "Linux";
    info.device = /Mobi|Android|iPhone|iPad/.test(ua) ? "Mobile" : "Desktop";
    return info;
}

function fmtDate(iso) {
    return new Date(iso).toUTCString().replace(/GMT$/, "UTC");
}

async function loadAll(env, prefix) {
    const out = [];
    const { keys } = await env.HITS.list({ prefix });
    for (const key of keys) {
        try { out.push(...await readList(env, key.name)); } catch (e) { /* skip bad key */ }
    }
    return out;
}

async function handleAdmin(request, env) {
    const url = new URL(request.url);
    if (!env.ADMIN_KEY || url.searchParams.get("key") !== env.ADMIN_KEY) {
        return new Response("Forbidden", { status: 401 });
    }

    const hits = await loadAll(env, PREFIX_DAY);
    const notes = await loadAll(env, PREFIX_NOTES);

    hits.sort((a, b) => (a.ts < b.ts ? 1 : -1));
    notes.sort((a, b) => (a.ts < b.ts ? 1 : -1));

    const uniqueVids = new Set(hits.filter((h) => h.vid).map((h) => h.vid));
    const dayMap = new Map();
    const cityMap = new Map();
    const referrers = new Map();

    for (const h of hits) {
        const day = (h.ts || "").slice(0, 10) || "unknown";
        let d = dayMap.get(day);
        if (!d) dayMap.set(day, d = { hits: 0, vids: new Set() });
        d.hits += 1;
        if (h.vid) d.vids.add(h.vid);

        const city = [h.city, h.country].filter(Boolean).join(", ") || "Unknown";
        let c = cityMap.get(city);
        if (!c) cityMap.set(city, c = { count: 0 });
        c.count += 1;

        if (h.referrer) {
            const host = hostOf(h.referrer);
            referrers.set(host, (referrers.get(host) || 0) + 1);
        }
    }

    const locationRows = [...cityMap.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .map(([city, c]) => `<tr><td>${escapeHTML(city)}</td><td class="num">${c.count}</td></tr>`)
        .join("");

    const dayRows = [...dayMap.entries()].sort().reverse()
        .map(([day, d]) => `<tr><td>${escapeHTML(day)}</td>` +
            `<td class="num">${d.hits}</td>` +
            `<td class="num">${d.vids.size}</td></tr>`)
        .join("");

    const refRows = [...referrers.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([host, count]) => `<tr><td>${escapeHTML(host)}</td><td class="num">${count}</td></tr>`)
        .join("") || `<tr><td colspan="2">—</td></tr>`;

    const recentRows = hits.slice(0, 300).map((h) => {
        const ua = parseUA(h.ua);
        const city = [h.city, h.region, h.country].filter(Boolean).join(", ") || "—";
        return `<tr class="${h.returning ? "return" : ""}">` +
            `<td class="num">${escapeHTML(fmtDate(h.ts))}</td>` +
            `<td class="num">${escapeHTML((h.ts || "").slice(0, 10))}</td>` +
            `<td>${escapeHTML(city)} <span class="muted">${escapeHTML(h.tz || "")}</span></td>` +
            `<td>${escapeHTML(ua.browser)} · ${escapeHTML(ua.os)}<br><span class="muted">${escapeHTML(ua.device)}</span></td>` +
            `<td>${escapeHTML(referrerLabel(h.referrer))}</td>` +
            `<td>${escapeHTML(h.page)}</td>` +
            `<td>${h.returning ? "returning" : ""}</td>` +
            `</tr>`;
    }).join("") || `<tr><td colspan="7" class="muted">No visits yet.</td></tr>`;

    function referrerLabel(ref) {
        if (!ref) return "direct";
        const h = hostOf(ref);
        return h === "—" ? escapeHTML(ref.slice(0, 60)) : h;
    }

    const noteRows = notes.map((n) =>
        `<tr><td class="num">${escapeHTML(fmtDate(n.ts))}</td>` +
        `<td>${escapeHTML([n.name, n.company].filter(Boolean).join(" — ") || "Anonymous")}</td>` +
        `<td>${escapeHTML([n.city, n.country].filter(Boolean).join(", ") || "—")}</td>` +
        `<td>${escapeHTML(noteExcerpt(n.note))}</td></tr>`
    ).join("") || `<tr><td colspan="4" class="muted">No notes yet.</td></tr>`;

    function noteExcerpt(note) {
        note = String(note);
        return note.length > 160 ? note.slice(0, 160) + "…" : note;
    }

    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hari tracker</title>
<style>
body{background:#060b18;color:#dbe4f5;font:13px/1.5 -apple-system,"Segoe UI",Roboto,sans-serif;margin:0;padding:2rem;max-width:1100px}
h1{font-size:20px;margin:0 0 .2rem}h1 small{color:#8aa2c8;font-weight:400;font-size:12px}
.cards{display:flex;flex-wrap:wrap;gap:1rem;margin:1.2rem 0}
.card{background:#0d1526;border:1px solid #1d2c4a;border-radius:12px;padding:.8rem 1.1rem;min-width:130px}
.card b{display:block;font-size:22px;color:#7fb2ff}
.card span{font-size:11px;color:#8aa2c8;text-transform:uppercase;letter-spacing:.06em}
h2{font-size:14px;margin:1.6rem 0 .6rem;color:#a9c2ec}
table{width:100%;border-collapse:collapse;background:#0d1526;border:1px solid #1d2c4a;border-radius:12px;overflow:hidden}
th{text-align:left;font-size:11px;color:#8aa2c8;text-transform:uppercase;letter-spacing:.05em;padding:.5rem .7rem;border-bottom:1px solid #1d2c4a;background:#0a1020}
td{padding:.5rem .7rem;border-bottom:1px solid #141d33;vertical-align:top}
tr:last-child td{border-bottom:0}
.num{white-space:nowrap;font-variant-numeric:tabular-nums}
.muted{color:#6b7fa3;font-size:11px}
.return td{background:rgba(127,178,255,.06)}
@media (max-width:700px){body{padding:1rem}table{font-size:12px}}
</style></head><body>
<h1>Hari.is-a.dev visits <small>anonymous · city-level</small></h1>
<div class="cards">
<div class="card"><b>${hits.length}</b><span>visits</span></div>
<div class="card"><b>${uniqueVids.size}</b><span>unique visitors</span></div>
<div class="card"><b>${notes.length}</b><span>guestbook notes</span></div>
<div class="card"><b>${locationRows ? cityMap.size : 0}</b><span>locations</span></div>
</div>
<h2>By day</h2>
<table><tr><th>Date</th><th>Visits</th><th>Unique</th></tr>${dayRows}</table>
<h2>By location</h2>
<table><tr><th>City, Country</th><th>Visits</th></tr>${locationRows || '<tr><td colspan="2" class="muted">—</td></tr>'}</table>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.6rem">
<div><h2>Referrers</h2><table><tr><th>Source</th><th>Visits</th></tr>${refRows}</table></div>
<div><h2>Guestbook notes</h2><table><tr><th>When</th><th>Name / Company</th><th>Location</th><th>Note</th></tr>${noteRows}</table></div>
</div>
<h2>Recent visits</h2>
<table><tr><th>Time (UTC)</th><th>Day</th><th>Location</th><th>Device</th><th>Referrer</th><th>Page</th><th></th></tr>${recentRows}</table>
</body></html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

/* ------------------------------------------------------------------ */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const origin = request.headers.get("Origin");

        if (request.method === "OPTIONS") {
            if (!isAllowedOrigin(origin)) return new Response("Forbidden", { status: 403 });
            return new Response(null, { status: 204, headers: corsHeaders(origin) });
        }

        if (request.method === "POST" && url.pathname === "/hit") {
            if (!isAllowedOrigin(origin)) return new Response("Forbidden", { status: 403 });
            return handleHit(request, env, origin);
        }

        if (request.method === "POST" && url.pathname === "/note") {
            if (!isAllowedOrigin(origin)) return new Response("Forbidden", { status: 403 });
            return handleNote(request, env, origin);
        }

        if (request.method === "GET" && url.pathname === "/admin") {
            return handleAdmin(request, env);
        }

        return new Response("Not found", { status: 404 });
    },
};