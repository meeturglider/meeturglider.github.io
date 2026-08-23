# Hari.dev 🌌

## Why "Hari.dev"?

Hari.dev isn't just a portfolio.

It's an engineering lab—a place to document ideas, build automation, experiment with AI, and share practical solutions developed through real-world cloud engineering experience.

Every project on this site is built with one principle:

**Learn. Build. Automate. Share.**

> Building cloud platforms, engineering intelligent automation, and sharing the journey.

![Status](https://img.shields.io/badge/status-under%20development-blue)
![License](https://img.shields.io/badge/license-GPLv3-green)
![Hosted on](https://img.shields.io/badge/Hosted-GitHub%20Pages-black)

---

## 📖 About

**Hari.dev** is my personal engineering portfolio and digital workspace.

Rather than being a traditional résumé website, this project is designed to showcase my engineering philosophy, cloud architecture experience, AI experimentation, platform engineering projects, and continuous learning journey.

The objective is simple:

> **Build a portfolio that reflects how I engineer systems—not just where I've worked.**

---

## 🎯 Vision

This website is evolving into an **Engineering Lab** where visitors can explore:

- ☁️ Cloud Architecture
- 🚀 Platform Engineering
- 🤖 AI Infrastructure
- ⚙️ DevOps Automation
- 📚 Engineering Notes
- 🧠 AI Experiments
- 🏗️ Personal Projects
- 📄 Resume Variants

---

## 🛣️ Roadmap

### Phase 1 — Foundation

- [x] Project structure
- [x] Responsive HTML layout
- [ ] Modern landing page
- [ ] Navigation
- [ ] Hero section

---

### Phase 2 — Professional Identity

- [ ] About
- [ ] Mission
- [ ] Career Highlights
- [ ] Engineering Philosophy

---

### Phase 3 — Experience

- [ ] Interactive career timeline
- [ ] Enterprise achievements
- [ ] Technical leadership

---

### Phase 4 — Projects

Featured engineering projects including:

- OpenClaw
- Job Apply Assist
- Local AI Lab
- Cloud Automation
- AI Experiments

---

### Phase 5 — AI Lab

A dedicated section documenting:

- Local LLM setup
- Ollama
- Open WebUI
- AI agents
- Automation workflows
- Experiments

---

### Phase 6 — Resume Center

Multiple recruiter-focused resumes:

- Cloud Architect
- Platform Engineer
- DevOps Engineer
- AI Infrastructure Engineer
- Technical Account Manager

---

### Phase 7 — Meet Nemo ✅ (shipped)

Nemo is the little animated clownfish living on this site. He answers questions
about Hari using **retrieval over his portfolio knowledge**, optionally
sharpened by Gemini Flash.

How it works:

```
visitor question ──► TF-IDF retrieval over data/nemo-knowledge.json
                        │
              top 4 passages + strict system prompt
                        │
                Gemini Flash (browser REST call)
                        │
        answer ◄── or, on any API failure/quota limit,
                   the retrieved passages shown verbatim
```

- Zero dependencies, no backend server.
- Without an API key (or if quota runs out), Nemo still works in
  **retrieval mode** — he shows the matching knowledge chunks directly.

#### Enable Gemini answers

1. Open [Google AI Studio](https://aistudio.google.com/) → *Get API key*.
   Use a **dedicated Google Cloud project with no billing attached** so the
   worst case is a free-quota limit, never a charge.
2. Restrict the key by **HTTP referrer** to `meeturglider.github.io/*`
   (and your local dev origin while testing).
3. Paste the key into `CONFIG.apiKey` in `js/nemo.js`.

```js
const CONFIG = {
    apiKey: "",                 // ← paste your key here
    model: "gemini-2.5-flash",
    ...
};
```

> Note: this is a client-side key by design (static GitHub Pages hosting).
> Referrer restriction + no-billing project keeps the blast radius at zero.
> To edit what Nemo knows, update `data/nemo-knowledge.json`.

---

## 🏛️ Project Structure

```
meeturglider.github.io
│
├── assets/
│   ├── icons/
│   ├── images/
│   └── resume.pdf
│
├── css/
│   └── styles.css
│
├── js/
│   └── script.js
│
├── data/
│   ├── projects.json
│   ├── experience.json
│   ├── certifications.json
│   └── skills.json
│
├── index.html
└── README.md
```

---

## 🎨 Design Principles

The website is intentionally designed to be:

- Minimal
- Fast
- Mobile-first
- Accessible
- Recruiter-friendly
- Story-driven

Inspired by:

- Apple
- Vercel
- Linear
- GitHub

---

## 🧩 Engineering Philosophy

I believe the best engineering is invisible.

Well-designed platforms should be:

- Secure by default
- Highly automated
- Observable
- Reliable
- Scalable

My passion is building systems that remove operational complexity and allow engineers to focus on solving meaningful problems.

---

## 🌐 Ecosystem

Hari.dev is part of a larger engineering ecosystem.

```
                   Hari.dev
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼

 Job Apply Assist   OpenClaw     Local AI Lab

        │             │             │

 ATS Optimization  Telegram AI   Ollama
 Resume Builder    Automation    Open WebUI
 Career Analytics  Workflows     LLM Experiments
```

---

## 🚀 Future Vision

The long-term vision is to evolve this website into a living engineering platform.

Future enhancements include:

- AI-powered portfolio assistant (Nemo)
- Dynamic project rendering
- Interactive architecture diagrams
- Engineering blog
- Automated project updates
- GitHub activity integration
- Resume generation
- AI-assisted recruiter experience

---

## 🛠️ Built With

- HTML5
- CSS3
- JavaScript
- GitHub Pages

Future additions may include:

- JSON-driven content
- SVG animations
- Mermaid diagrams
- Lightweight APIs
- AI integrations

---

## 📬 Connect

🌐 Portfolio  
https://meeturglider.github.io

💼 LinkedIn  
https://linkedin.com/in/pnhari

🐙 GitHub  
https://github.com/meeturglider

---

## ⭐ Current Status

🚧 Portfolio v2 is actively under development.

Each sprint focuses on one production-quality improvement, following a Git-based engineering workflow.

---

> *"Build systems that make engineers happier."*# meeturglider.github.io
