/**
 * Career timeline renderer.
 *
 * Reads data/experience.json and builds the alternating timeline. Each card
 * exposes its per-role projects behind a disclosure button.
 */

import { el, frag, mount, renderError, loadJSON, bindDisclosure } from "./dom.js";

export class ExperienceRenderer {

    /**
     * @param {string} dataUrl
     * @param {string} containerId
     */
    constructor(dataUrl, containerId) {
        this.dataUrl = dataUrl;
        this.container = document.getElementById(containerId);
    }

    async init() {

        if (!this.container) return;

        try {
            const experiences = await loadJSON(this.dataUrl);
            this.render(experiences);
        } catch (error) {
            console.error("Experience timeline:", error);
            renderError(this.container, "Unable to load the career journey right now.");
        }
    }

    /**
     * @param {Array<Object>} experiences
     */
    render(experiences) {
        mount(
            this.container,
            frag(experiences.map((exp, index) => this.createCard(exp, index)))
        );
    }

    /**
     * Side is derived from position, not from `id` — reordering or removing a
     * role would otherwise break the zigzag.
     *
     * @param {Object} exp
     * @param {number} index
     * @returns {HTMLElement}
     */
    createCard(exp, index) {

        const side = index % 2 === 0 ? "left" : "right";

        const card = el("div", {
            class: `timeline-card${exp.current ? " current" : ""}`
        }, [
            this.createHeader(exp),
            el("p", { class: "timeline-impact", text: exp.impact }),
            this.createHighlights(exp.highlights),
            this.createTech(exp.technologies)
        ]);

        const projects = this.createProjects(exp, index);
        if (projects) card.append(projects.button, projects.panel);

        return el("article", {
            class: `timeline-item ${side}${exp.current ? " is-current" : ""}`
        }, [card]);
    }

    /**
     * @param {Object} exp
     * @returns {HTMLElement}
     */
    createHeader(exp) {

        const details = el("div", { class: "company-details" }, [
            el("span", { class: "timeline-year", text: exp.year }),
            el("h3", { class: "timeline-role", text: exp.role }),
            el("span", { class: "timeline-company", text: exp.company }),
            el("span", { class: "timeline-location" }, [
                el("span", { "aria-hidden": "true", text: "📍 " }),
                el("span", { text: exp.location })
            ])
        ]);

        const block = el("div", { class: "company-block" }, [
            el("img", {
                class: "company-logo",
                src: exp.logo,
                alt: `${exp.company} logo`,
                width: "48",
                height: "48",
                loading: "lazy",
                decoding: "async"
            }),
            details
        ]);

        const children = [block];

        if (exp.current) {
            children.push(el("span", { class: "current-status" }, [
                el("span", { class: "present-dot", "aria-hidden": "true" }),
                el("span", { text: "Present" })
            ]));
        }

        return el("div", { class: "timeline-header" }, children);
    }

    /**
     * @param {Array<string>} [highlights]
     * @returns {HTMLElement|null}
     */
    createHighlights(highlights = []) {

        if (!highlights.length) return null;

        return el("ul", { class: "timeline-highlights" },
            highlights.map((item) => el("li", {}, [
                el("span", { class: "highlight-icon", "aria-hidden": "true", text: "✓" }),
                el("span", { text: item })
            ]))
        );
    }

    /**
     * @param {Array<string>} [technologies]
     * @returns {HTMLElement|null}
     */
    createTech(technologies = []) {

        if (!technologies.length) return null;

        return el("ul", { class: "timeline-tech" },
            technologies.map((tech) => el("li", { class: "tech-pill", text: tech }))
        );
    }

    /**
     * Builds the disclosure button and its panel, or null when the role has
     * no project detail to show.
     *
     * @param {Object} exp
     * @param {number} index
     * @returns {{button: HTMLElement, panel: HTMLElement}|null}
     */
    createProjects(exp, index) {

        const projects = exp.projects || [];
        if (!projects.length) return null;

        const panelId = `timeline-projects-${index}`;

        const panel = el("div", {
            class: "timeline-projects",
            id: panelId,
            hidden: true
        }, projects.map((project) => el("div", { class: "timeline-project" }, [
            el("h4", { text: project.name }),
            project.highlights && project.highlights.length
                ? el("ul", {}, project.highlights.map((h) => el("li", { text: h })))
                : null
        ])));

        const count = projects.length;

        const button = el("button", {
            class: "project-button",
            type: "button",
            "aria-expanded": "false",
            "aria-controls": panelId
        }, [
            el("span", { class: "project-button-icon", "aria-hidden": "true", text: "▸" }),
            el("span", { text: `${count} ${count === 1 ? "project" : "projects"}` })
        ]);

        bindDisclosure(button, panel);

        return { button, panel };
    }
}
