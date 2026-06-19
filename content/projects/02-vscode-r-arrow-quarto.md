---
id: vscode-r-arrow-quarto
title: VS Code R Arrow
role: Backend Engineer
timeframe: "Spring 2026"
date: 2026-03-01
status: completed
short_description_md: A contribution to an open-source VS Code extension experiment to add quarto file compatibility for keybinds. Submitted for PR to the main repo.
tech_stack:
  - vscode
  - r
  - python
  - typescript
  - git
links:
  github: "https://github.com/LingT03/vscode-r-arrow/tree/Quarto-Markdown"
tags:
  - developer tooling
  - R
  - Quarto
  - VS Code
  - markdown
---

## Motivation

Prior to moving to positron, I was using VS-code as my primary IDE for data science
related work. I had installed an R extension for the asignment and pipe keybinds, but
the extension did not recognize the `.qmd` file format used by Quarto. This project was an
experiment to add basic support for Quarto files in the R extension.

## Scope

- Extension manifest and grammar contributions for `.qmd`.
- Custom command palette entries for chunk navigation.
- JSON-driven user settings for Quarto-specific behavior.

## Outcome

Completed as a proof-of-concept on a feature branch
(`Quarto-Markdown`). The fork captures the working extension state and
served as a learning vehicle for the VS Code extension ecosystem.
