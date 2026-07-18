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
            .map(
                tech => `
                    <span class="tech-pill">
                        ${tech}
                    </span>
                `
            )
            .join("");

        const highlights = (exp.highlights || [])
            .map(
                item => `
                    <li>
                        <span class="highlight-icon">✓</span>
                        <span>${item}</span>
                    </li>
                `
            )
            .join("");

        return `
            <article class="timeline-card ${exp.current ? "current" : ""}">

                <div class="timeline-node">
                    <div class="timeline-dot"></div>
                    <div class="timeline-line"></div>
                </div>

                <div class="timeline-content">

                    <div class="timeline-top">

                        <span class="timeline-year">
                            ${exp.year}
                        </span>

                        ${
                            exp.current
                                ? `
                                    <span class="current-badge">
                                        ● CURRENT
                                    </span>
                                `
                                : ""
                        }

                    </div>

                    <h3 class="timeline-role">
                        ${exp.role}
                    </h3>

                    <h4 class="timeline-company">
                        ${exp.company}
                    </h4>

                    <p class="timeline-location">
                        📍 ${exp.location}
                    </p>

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