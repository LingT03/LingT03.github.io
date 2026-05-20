---
id: vscode-r-arrow-quarto
title: VS Code R Arrow
role: Backend Engineer
timeframe: "Spring 2026"
status: completed
short_description_md: A VS Code extension experiment to improve editing and rendering workflows for R and Quarto Markdown documents, especially `.qmd` files that mix R, Python, and prose.
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

Quarto's `.qmd` format mixes R, Python, and prose in a single document, but
the default VS Code experience treats them as a single language scope. This
project explores extension hooks to improve syntax highlighting, code-chunk
folding, and arrow-key navigation across chunk boundaries.

## Scope

- Extension manifest and grammar contributions for `.qmd`.
- Custom command palette entries for chunk navigation.
- JSON-driven user settings for Quarto-specific behavior.

## Outcome

Completed as a proof-of-concept on a feature branch
(`Quarto-Markdown`). The fork captures the working extension state and
served as a learning vehicle for the VS Code extension ecosystem.
