---
id: anki-card-generations
title: Anki Card Generations
role: Backend Engineer
timeframe: "Spring 2025"
status: prototype
short_description_md: A toolchain for generating high-quality Anki flashcards programmatically from structured notes or source material, designed to support long-term spaced repetition for technical and academic content.
tech_stack:
  - python
  - git
links:
  github: "https://github.com/LingT03/AnkiCardGenerations"
tags:
  - anki
  - spaced repetition
  - automation
  - productivity
---

## Motivation

Hand-authoring Anki cards from technical readings is slow and breaks the
flow of active study. This toolchain consumes structured notes (Markdown
with explicit headings) and emits Anki-compatible card decks ready for
import.

## Approach

- Parse Markdown headings + bullets into `(front, back)` card tuples.
- Emit cards as APKG / CSV in the Anki-supported deck format.
- Provide deck-level metadata (deck name, model, tags) via a sidecar
  YAML config so the same Markdown source can generate multiple decks.

## Status

Prototype: end-to-end pipeline produces importable decks for math and
ML notes. Future work: image-extraction for inline figures, cloze-card
templates, and integration with Obsidian vault layouts.
