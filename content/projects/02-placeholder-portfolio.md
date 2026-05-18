---
id: project-portfolio
title: This Portfolio Site
short_description_md: A React + Vite + Tailwind portfolio with Framer-Motion micro-interactions and a Python-driven Markdown content pipeline.
tech_stack:
  - typescript
  - react
  - tailwind
  - framer-motion
  - python
  - git
links:
  github: "https://github.com/LingT03/PLACEHOLDER-portfolio"  # TODO
  live: ""  # TODO
status: in_progress
---

A personal portfolio site built to spec, separating content from presentation:

- **Frontend**: React + TypeScript, Tailwind CSS for utility-first styling,
  Framer Motion for animations.
- **Content layer**: Markdown files with YAML front matter, compiled to typed
  JSON by a Python build script with Pydantic validation.
- **Interactions**: evasive tech-stack bubbles (cursor-distance physics),
  hover tooltips on coursework, click-to-modal book and project detail cards,
  filter/sort toolbars, lightbox photo viewer.
- **Accessibility**: keyboard focus parity for hover-only data, `aria-modal`
  on all dialogs, `aria-expanded` on disclosure widgets, and audited color
  contrast.

The full implementation specification lives in `Portfolio_Website_Guideline.pdf`.
