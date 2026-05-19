---
id: portfolio-website-v2
title: This Website
role: Full-Stack Engineer
timeframe: "Spring 2026"
status: active
short_description_md: An interactive portfolio specification engine built on a modular React tree featuring custom layout physics, canvas nodes, and localized markdown curation schemas.
tech_stack:
  - typescript
  - react
  - tailwind
  - framer-motion
  - python
  - git
links:
  github: "https://github.com/LingT03/LingT03.github.io"
tags:
  - portfolio
  - react
  - vite
  - markdown
  - design system
---

## Overview

A personal portfolio site implemented to a versioned specification, separating
**content** from **presentation** through a Python build pipeline that emits
validated JSON consumed by a React frontend.

## Architecture

- **Frontend**: React 18 + TypeScript, Tailwind CSS utility-first styling,
  Framer Motion micro-interactions, react-router-dom for client routing.
- **Content layer**: Markdown files with YAML front-matter, validated by
  Pydantic schemas, rendered to HTML server-side and emitted as typed JSON.
- **Interactions**: evasive tech-stack bubbles, hover tooltips on coursework,
  click-to-modal book and project cards, filter/sort toolbars, lightbox photo
  viewer, persistent theme switch with pre-paint bootstrap.
- **Accessibility**: keyboard focus parity, `aria-modal` on dialogs,
  `aria-expanded` on disclosures, audited contrast.

## Status

Active / feature-complete on the V2 specification: tech-stack-icons integration,
Open Library book ingestion, persistent theme switch, route renames, and the
expanded project schema all landed in this build.
