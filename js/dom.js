/**
 * Minimal DOM construction helpers.
 *
 * Everything renders through createElement + textContent rather than
 * innerHTML. The content corpus is first-party today, but string
 * interpolation into markup is the wrong default to build on.
 */

/**
 * Create an element.
 *
 * @param {string} tag
 * @param {Object} [attrs]  - properties: class, text, html-safe attributes,
 *                            `dataset` object, `on` event map
 * @param {Array<Node|string>} [children]
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, children = []) {

    const node = document.createElement(tag);

    for (const [key, value] of Object.entries(attrs)) {

        if (value === null || value === undefined || value === false) continue;

        if (key === "class") {
            node.className = value;
        } else if (key === "text") {
            node.textContent = value;
        } else if (key === "dataset") {
            Object.assign(node.dataset, value);
        } else if (key === "on") {
            for (const [event, handler] of Object.entries(value)) {
                node.addEventListener(event, handler);
            }
        } else if (value === true) {
            node.setAttribute(key, "");
        } else {
            node.setAttribute(key, value);
        }
    }

    for (const child of [].concat(children)) {
        if (child === null || child === undefined || child === false) continue;
        node.append(child);
    }

    return node;
}

/**
 * Build a document fragment from a list of nodes.
 *
 * @param {Array<Node>} nodes
 * @returns {DocumentFragment}
 */
export function frag(nodes) {
    const f = document.createDocumentFragment();
    for (const n of nodes) {
        if (n) f.append(n);
    }
    return f;
}

/**
 * Replace a container's contents in a single reflow.
 *
 * @param {HTMLElement} container
 * @param {Node} content
 */
export function mount(container, content) {
    container.replaceChildren(content);
}

/**
 * Render a consistent error state when a data fetch fails.
 *
 * @param {HTMLElement} container
 * @param {string} message
 */
export function renderError(container, message) {
    mount(container, el("p", { class: "timeline-error", text: message }));
}

/**
 * Fetch and parse JSON with an explicit failure mode.
 *
 * @param {string} url
 * @returns {Promise<unknown>}
 */
export async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} — ${url}`);
    }
    return response.json();
}

/**
 * Wire a button to a collapsible panel, keeping aria-expanded in sync.
 *
 * @param {HTMLButtonElement} button
 * @param {HTMLElement} panel
 * @param {(open: boolean) => void} [onToggle]
 */
export function bindDisclosure(button, panel, onToggle) {

    button.addEventListener("click", () => {

        const open = button.getAttribute("aria-expanded") === "true";

        button.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;

        if (onToggle) onToggle(!open);
    });
}
