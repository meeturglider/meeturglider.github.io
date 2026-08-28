/**
 * Hari visit tracker — anonymous client beacon.
 *
 * Drops a first-party `vid` cookie (returning-visitor detection), then pings
 * the tracker Worker with referrer/page/timezone. The Worker adds the IP-derived
 * city/country server-side. Fully inert — if the endpoint is a placeholder or
 * unreachable, the page behaves exactly as before.
 */

(function () {
    "use strict";

    /* After deploying the tracker Worker, paste its URL here. */
    var TRACKER_ENDPOINT = "__TRACKER_ENDPOINT__";

    var VID_COOKIE = "vid";

    function readCookie(name) {
        var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
        return match ? decodeURIComponent(match[1]) : null;
    }

    function writeCookie(name, value, days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + encodeURIComponent(value) +
            ";expires=" + date.toUTCString() + ";path=/;SameSite=Lax";
    }

    function getVid() {
        var vid = readCookie(VID_COOKIE);
        if (!vid) {
            vid = (window.crypto && crypto.randomUUID)
                ? crypto.randomUUID()
                : "v-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
            writeCookie(VID_COOKIE, vid, 365);
        }
        return vid;
    }

    function endpointReady() {
        return !!TRACKER_ENDPOINT && TRACKER_ENDPOINT !== "__TRACKER_ENDPOINT__";
    }

    function urlFor(path) {
        return TRACKER_ENDPOINT.replace(/\/+$/, "") + path;
    }

    function trackHit() {
        if (!endpointReady()) return;
        var payload = JSON.stringify({
            vid: getVid(),
            referrer: document.referrer || null,
            page: location.pathname,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone || null
        });
        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(urlFor("/hit"), new Blob([payload], { type: "application/json" }));
            } else {
                fetch(urlFor("/hit"), { method: "POST", body: payload, keepalive: true });
            }
        } catch (e) { /* last resort — the page must never break */ }
    }

    function postNote(payload) {
        if (!endpointReady()) return Promise.resolve(false);
        var body = {
            vid: getVid(),
            name: payload.name || null,
            company: payload.company || null,
            note: payload.note || ""
        };
        return fetch(urlFor("/note"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            keepalive: true
        }).then(function (res) { return res.json().then(function (data) { return !!data.ok; }); })
          .catch(function () { return false; });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", trackHit, { once: true });
    } else {
        trackHit();
    }

    window.__tracker = { trackHit: trackHit, postNote: postNote };
})();