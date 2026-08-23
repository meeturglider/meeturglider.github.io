/**
 * Hari.dev — entry point.
 *
 * Boots page chrome immediately, then renders the JSON-driven sections.
 */

import { initNav, initHeaderState, initScrollSpy, initReveal, initYear, initMeetHari, revealWithin } from "./ui.js";
import { ExperienceRenderer } from "./experience.js";
import { ProjectsRenderer } from "./projects.js";

initNav();
initHeaderState();
initScrollSpy();
initReveal();
initYear();
initMeetHari();

const experience = new ExperienceRenderer("data/experience.json", "timeline");
const projects = new ProjectsRenderer("data/projects.json", "projects-list", "lab-list");

// Render both sections in parallel, then animate in whatever arrived.
Promise.allSettled([experience.init(), projects.init()]).then(() => {
    revealWithin(document, ".case-study, .lab-card");
});
