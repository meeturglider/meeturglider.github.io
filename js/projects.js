/**
 * Case study and AI Lab renderer.
 *
 * Each case study collapses to a scannable summary and expands into the full
 * breakdown: problem, approach, architecture diagram, trade-offs, outcomes.
 */

import { el, frag, mount, renderError, loadJSON, bindDisclosure } from "./dom.js";

export class ProjectsRenderer {

    /**
     * @param {string} dataUrl
     * @param {string} projectsContainerId
     * @param {string} labContainerId
     */
    constructor(dataUrl, projectsContainerId, labContainerId) {
        this.dataUrl = dataUrl;
        this.projectsContainer = document.getElementById(projectsContainerId);
        this.labContainer = document.getElementById(labContainerId);
    }

    async init() {

        if (!this.projectsContainer && !this.labContainer) return;

        try {

            const data = await loadJSON(this.dataUrl);

            if (this.projectsContainer) {
                mount(
                    this.projectsContainer,
                    frag((data.featured || []).map((p, i) => this.createCaseStudy(p, i)))
                );
            }

            if (this.labContainer) {
                mount(
                    this.labContainer,
                    frag((data.lab || []).map((item) => this.createLabCard(item)))
                );
            }

        } catch (error) {

            console.error("Projects:", error);

            if (this.projectsContainer) {
                renderError(this.projectsContainer, "Unable to load case studies right now.");
            }
            if (this.labContainer) {
                renderError(this.labContainer, "Unable to load experiments right now.");
            }
        }
    }

    /* ----------------------------------------------------------------------
       Case study
       ---------------------------------------------------------------------- */

    /**
     * @param {Object} project
     * @param {number} index
     * @returns {HTMLElement}
     */
    createCaseStudy(project, index) {

        const detailId = `case-detail-${project.id || index}`;

        const detail = el("div", {
            class: "case-detail",
            id: detailId,
            hidden: true
        }, [
            this.block("The problem", el("p", { class: "case-problem", text: project.problem })),
            this.listBlock("Approach", project.approach, "case-approach"),
            this.architectureBlock(project.architecture),
            this.decisionsBlock(project.decisions),
            this.listBlock("Outcome", project.outcomes, "case-outcomes"),
            this.linksBlock(project.links)
        ]);

        const toggle = el("button", {
            class: "case-toggle",
            type: "button",
            "aria-expanded": "false",
            "aria-controls": detailId
        }, [
            el("span", { class: "case-toggle-icon", "aria-hidden": "true", text: "▸" }),
            el("span", { text: "Read the breakdown" })
        ]);

        const card = el("article", { class: "case-study" }, [
            el("div", { class: "case-summary" }, [
                this.metaRow(project),
                el("h3", { class: "case-title", text: project.title }),
                el("p", { class: "case-tagline", text: project.tagline }),
                project.stack && project.stack.length
                    ? el("ul", { class: "case-stack" },
                        project.stack.map((s) => el("li", { text: s })))
                    : null,
                toggle
            ]),
            detail
        ]);

        bindDisclosure(toggle, detail, (open) => {
            card.classList.toggle("is-open", open);
            toggle.querySelector("span:last-child").textContent =
                open ? "Collapse" : "Read the breakdown";
        });

        return card;
    }

    /**
     * @param {Object} project
     * @returns {HTMLElement}
     */
    metaRow(project) {

        const parts = [];

        if (project.category) {
            parts.push(el("span", { class: "case-category", text: project.category }));
        }
        if (project.status) {
            parts.push(el("span", { class: "case-status", text: project.status }));
        }

        const context = [project.context, project.period].filter(Boolean).join(" · ");
        if (context) {
            parts.push(el("span", { class: "case-context", text: context }));
        }

        return el("div", { class: "case-meta" }, parts);
    }

    /* ----------------------------------------------------------------------
       Detail blocks
       ---------------------------------------------------------------------- */

    /**
     * @param {string} title
     * @param {Node|null} content
     * @returns {HTMLElement|null}
     */
    block(title, content) {
        if (!content) return null;
        return el("div", { class: "case-block" }, [el("h4", { text: title }), content]);
    }

    /**
     * @param {string} title
     * @param {Array<string>} [items]
     * @param {string} className
     * @returns {HTMLElement|null}
     */
    listBlock(title, items = [], className) {
        if (!items.length) return null;
        return this.block(
            title,
            el("ul", { class: className }, items.map((item) => el("li", { text: item })))
        );
    }

    /**
     * Renders the layered architecture as a stacked diagram. Pure markup and
     * CSS — no diagramming library, no runtime cost.
     *
     * @param {{layers: Array<{name: string, nodes: Array<string>}>} | undefined} architecture
     * @returns {HTMLElement|null}
     */
    architectureBlock(architecture) {

        const layers = architecture && architecture.layers;
        if (!layers || !layers.length) return null;

        const rows = [];

        layers.forEach((layer, i) => {

            rows.push(el("div", { class: "arch-layer" }, [
                el("span", { class: "arch-layer-name", text: layer.name }),
                el("div", { class: "arch-nodes" },
                    layer.nodes.map((n) => el("span", { class: "arch-node", text: n })))
            ]));

            if (i < layers.length - 1) {
                rows.push(el("div", {
                    class: "arch-connector",
                    "aria-hidden": "true",
                    text: "▼"
                }));
            }
        });

        return this.block(
            "Architecture",
            el("div", { class: "architecture", role: "img", "aria-label":
                `Architecture layers: ${layers.map((l) => `${l.name} — ${l.nodes.join(", ")}`).join("; ")}`
            }, rows)
        );
    }

    /**
     * The trade-off table. This is the block an engineering manager reads.
     *
     * @param {Array<Object>} [decisions]
     * @returns {HTMLElement|null}
     */
    decisionsBlock(decisions = []) {

        if (!decisions.length) return null;

        const rows = decisions.map((d) => el("div", { class: "decision" }, [
            el("h5", { text: d.title }),
            this.decisionRow("Chose", d.chose, "decision-chose"),
            this.decisionRow("Why", d.why, "decision-why"),
            this.decisionRow("Rejected", d.rejected, "decision-rejected")
        ]));

        return this.block("Trade-offs", el("div", { class: "decisions" }, rows));
    }

    /**
     * @param {string} label
     * @param {string} value
     * @param {string} className
     * @returns {HTMLElement|null}
     */
    decisionRow(label, value, className) {
        if (!value) return null;
        return el("div", { class: "decision-row" }, [
            el("span", { class: "decision-label", text: label }),
            el("span", { class: className, text: value })
        ]);
    }

    /**
     * @param {Array<{label: string, url: string}>} [links]
     * @returns {HTMLElement|null}
     */
    linksBlock(links = []) {

        if (!links.length) return null;

        return el("div", { class: "case-links" }, links.map((link) => el("a", {
            class: "btn btn-secondary",
            href: link.url,
            target: "_blank",
            rel: "noopener noreferrer",
            text: link.label
        })));
    }

    /* ----------------------------------------------------------------------
       AI Lab
       ---------------------------------------------------------------------- */

    /**
     * @param {Object} item
     * @returns {HTMLElement}
     */
    createLabCard(item) {

        return el("article", { class: "lab-card" }, [
            el("div", { class: "lab-card-head" }, [
                el("h3", { text: item.name }),
                item.status
                    ? el("span", {
                        class: "lab-status",
                        dataset: { status: item.status.toLowerCase() },
                        text: item.status
                    })
                    : null
            ]),
            el("p", { text: item.summary }),
            item.stack && item.stack.length
                ? el("ul", { class: "lab-stack" }, item.stack.map((s) => el("li", { text: s })))
                : null
        ]);
    }
}
