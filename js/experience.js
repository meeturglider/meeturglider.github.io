class ExperienceRenderer {
    constructor(dataUrl, containerId) {
        this.dataUrl = dataUrl;
        this.container = document.getElementById(containerId);
    }

    async init() {
        try {
            const response = await fetch(this.dataUrl);

            if (!response.ok) {
                throw new Error(`Unable to load ${this.dataUrl}`);
            }

            const experiences = await response.json();

            this.render(experiences);

        } catch (error) {
            console.error("Experience Timeline:", error);

            this.container.innerHTML = `
                <p class="timeline-error">
                    Unable to load career journey.
                </p>
            `;
        }
    }

    render(experiences) {

        this.container.innerHTML = experiences
            .map(exp => this.createCard(exp))
            .join("");

    }

        createCard(exp) {

        const techStack = (exp.technologies || [])
            .map(tech => `
                <span class="tech-pill">${tech}</span>
            `)
            .join("");

        const highlights = (exp.highlights || [])
            .map(item => `
                <li>
                    <span class="highlight-icon">✓</span>
                    <span>${item}</span>
                </li>
            `)
            .join("");

        return `
        <article class="timeline-item ${exp.id % 2 === 0 ? "right" : "left"}">
        <div class="timeline-card ${exp.current ? "current" : ""}">

        <div class="timeline-header">

            <div class="company-block">

                <img
                    class="company-logo"
                    src="${exp.logo}"
                    alt="${exp.company}"
                >

                <div class="company-details">

                    <div class="timeline-year">
                        ${exp.year}
                    </div>

                    <h3 class="timeline-role">
                        ${exp.role}
                    </h3>

                    <div class="timeline-company">
                        ${exp.company}
                    </div>

                    <div class="timeline-location">
                        📍 ${exp.location}
                    </div>

                </div>

            </div>

            ${
                exp.current
                ? `<span class="current-status">
                        <span class="present-dot"></span>
                        <span>Present</span>
                    </span>`
                : ""
            }

        </div>

                <p class="timeline-impact">
                    ${exp.impact}
                </p>

                <ul class="timeline-highlights">
                    ${highlights}
                </ul>

                <div class="timeline-tech">
                    ${techStack}
                </div>

                <button class="project-button">
                    View Projects →
                </button>

            </div>

        </article>
        </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const experience = new ExperienceRenderer(
        "data/experience.json",
        "timeline"
    );

    experience.init();
});