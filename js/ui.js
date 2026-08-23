/**
 * Page chrome: navigation, scroll spy, header state and reveal animations.
 */

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");

/* --------------------------------------------------------------------------
   Mobile navigation
   -------------------------------------------------------------------------- */

export function initNav() {

    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");

    if (!toggle || !links) return;

    const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        links.classList.toggle("open", open);
    };

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after navigating to a section
    links.addEventListener("click", (event) => {
        if (event.target.closest("a")) setOpen(false);
    });

    // Close on Escape, and return focus to the toggle
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
            setOpen(false);
            toggle.focus();
        }
    });

    // Reset state when the menu stops being a menu
    window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
        if (event.matches) setOpen(false);
    });
}

/* --------------------------------------------------------------------------
   Sticky header background
   -------------------------------------------------------------------------- */

export function initHeaderState() {

    const header = document.getElementById("siteHeader");
    if (!header) return;

    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    document.body.prepend(sentinel);

    new IntersectionObserver(
        ([entry]) => header.classList.toggle("scrolled", !entry.isIntersecting),
        { rootMargin: "0px" }
    ).observe(sentinel);
}

/* --------------------------------------------------------------------------
   Scroll spy
   -------------------------------------------------------------------------- */

export function initScrollSpy() {

    const links = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
    if (!links.length) return;

    // Only track sections a nav link actually points at. The previous
    // implementation walked every <section>, including the id-less stats
    // band, which nulled out the active state while scrolling past it.
    const targets = links
        .map((link) => {
            const id = link.getAttribute("href").slice(1);
            const section = id ? document.getElementById(id) : null;
            return section ? { link, section } : null;
        })
        .filter(Boolean);

    if (!targets.length) return;

    const setActive = (activeLink) => {
        for (const { link } of targets) {
            link.classList.toggle("active", link === activeLink);
        }
    };

    const observer = new IntersectionObserver((entries) => {

        // Pick the entry closest to the top of the viewport that is visible.
        const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (!visible.length) return;

        const match = targets.find((t) => t.section === visible[0].target);
        if (match) setActive(match.link);

    }, {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0
    });

    for (const { section } of targets) {
        observer.observe(section);
    }
}

/* --------------------------------------------------------------------------
   Reveal on scroll
   -------------------------------------------------------------------------- */

const DEFAULT_REVEAL = ".section, .stat-card, .case-study, .lab-card";

/**
 * Fade content in on scroll.
 *
 * `.reveal` sets opacity to 0, so nothing here may leave an element in that
 * state. Two guards make that impossible:
 *
 *   1. Anything already within the viewport is revealed synchronously, before
 *      the observer is attached — there is no frame where above-the-fold
 *      content is transparent.
 *   2. A timeout reveals everything still pending, so a missed or delayed
 *      observer callback degrades to "no animation" rather than "no content".
 *
 * @param {ParentNode} [root]
 * @param {string} [selector]
 */
export function initReveal(root = document, selector = DEFAULT_REVEAL) {

    const nodes = Array.from(root.querySelectorAll(selector))
        .filter((node) => !node.classList.contains("reveal"));

    if (!nodes.length) return;

    const show = (node) => {
        node.classList.add("visible");
    };

    // Respect the user's motion preference: show everything, animate nothing.
    if (REDUCED_MOTION.matches) {
        nodes.forEach(show);
        return;
    }

    const inViewport = (node) => {
        const rect = node.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    };

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            show(entry.target);
            observer.unobserve(entry.target);
        }
    }, { threshold: 0.12 });

    const pending = [];

    for (const node of nodes) {
        node.classList.add("reveal");

        // Guard 1 — already on screen, so reveal now rather than waiting.
        if (inViewport(node)) {
            show(node);
            continue;
        }

        pending.push(node);
        observer.observe(node);
    }

    // Guard 2 — never leave content stuck at opacity 0.
    if (pending.length) {
        window.setTimeout(() => {
            for (const node of pending) {
                if (!node.classList.contains("visible")) show(node);
            }
        }, 2500);
    }
}

/**
 * Apply reveal to content injected after first paint.
 *
 * @param {ParentNode} root
 * @param {string} selector
 */
export function revealWithin(root, selector) {
    initReveal(root, selector);
}

/* --------------------------------------------------------------------------
   Footer year
   -------------------------------------------------------------------------- */

export function initYear() {
    const node = document.getElementById("year");
    if (node) node.textContent = String(new Date().getFullYear());
}

/* --------------------------------------------------------------------------
   Hero "Start Conversation"
   -------------------------------------------------------------------------- */

/**
 * There is no chat backend to open, so route the intent somewhere real:
 * the contact footer, with the email link focused and ready.
 */
export function initMeetHari() {

    const button = document.getElementById("meetHariBtn");
    const contact = document.getElementById("contact");
    if (!button || !contact) return;

    button.addEventListener("click", () => {
        contact.scrollIntoView({
            behavior: REDUCED_MOTION.matches ? "auto" : "smooth",
            block: "start"
        });

        const email = contact.querySelector("a[href^='mailto']");
        if (email) email.focus({ preventScroll: true });
    });
}
