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

### Phase 7 — Meet Dory ✅ (shipped)

Dory is the little animated fish living on this site — a bit forgetful, so she
only ever repeats what Hari's portfolio actually says. She answers questions
using **retrieval over his portfolio knowledge**, optionally sharpened by
an open LLM (GPT-OSS 120B) on Groq's free tier.

How it works:

```
visitor question ──► TF-IDF retrieval over data/dory-knowledge.json
                        │
              top 4 passages + strict system prompt
                        │
           Groq API (OpenAI-compatible browser call)
                        │
        answer ◄── or, on any API failure/quota limit,
                   the retrieved passages shown verbatim
```

- Zero dependencies, no backend server.
- Without an API key (or if quota runs out), Dory still works in
  **retrieval mode** — she shows the matching knowledge chunks directly.

#### Enable LLM answers (deploy-time injection)

The key never lives in the repo — GitHub Push Protection would (rightly)
block it, and public history is forever. Instead the deploy workflow injects
it at build time:

1. Create a free key at [console.groq.com/keys](https://console.groq.com/keys)
   (starts with `gsk_`). Free tier, no card, nothing to bill.
2. Repo **Settings → Secrets and variables → Actions** → add
   `DORY_GROQ_API_KEY`.
3. Done. `.github/workflows/deploy.yml` swaps the `__DORY_API_KEY__`
   placeholder in `js/dory.js` during every deploy. Rotation = update the
   secret and re-run.

Local testing without touching tracked files:

```js
localStorage.setItem("doryKey", "<your gsk_… key>");
```

> Note: the built site ships a client-side key by design (static hosting).
> The free-tier ceiling is the safety net: worst case someone burns Dory's
> daily quota and she gracefully degrades to retrieval mode.
> To edit what Dory knows, update `data/dory-knowledge.json`.

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

- AI-powered portfolio assistant (Dory)
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
