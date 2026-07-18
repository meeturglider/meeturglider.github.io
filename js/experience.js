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
            .map(tech => `<span class="tech-badge">${tech}</span>`)
            .join("");

        const highlights = (exp.highlights || [])
            .map(item => `<li>${item}</li>`)
            .join("");

        return `
            <article class="timeline-card ${exp.current ? "current" : ""}">

                <div class="timeline-header">

                    <span class="timeline-year">${exp.year}</span>

                    ${exp.current ? `<span class="current-badge">Current</span>` : ""}

                </div>

                <h3>${exp.role}</h3>

                <h4>${exp.company}</h4>

                <p class="timeline-location">${exp.location}</p>

                <p class="timeline-impact">
                    ${exp.impact}
                </p>

                <ul class="timeline-highlights">
                    ${highlights}
                </ul>

                <div class="timeline-tech">
                    ${techStack}
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