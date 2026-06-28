---
id: kunyi
title: kunyi
role: Backend Engineer
timeframe: "Spring 2025"
date: 2025-03-01
status: active
short_description_md: A Python package that generates Anki `.apkg` decks from structured card data — MCQ via JSON or basic front/back via TSV — designed as the export layer for the Seya study companion.
tech_stack:
  - python
  - genanki
  - hatchling
links:
  github: "https://github.com/LingT03/Kunyi"
  pypi: "https://pypi.org/project/kunyi/0.1.0/"
tags:
  - anki
  - spaced repetition
  - cli
  - python-package
  - seya
---

## Motivation

[Seya](https://github.com/LingT03/Seya) generates study content from a student's own materials using a local LLM — quizzes, problem sets, and explanations. Those outputs need to become Anki decks without coupling the Dart/Flutter codebase to any Python dependency. kunyi is the dedicated, single-responsibility export tool that closes that gap.

The name `kunyi` is the romanization of ကူညီ, the Burmese word for "to help/assist" — consistent with the parent project Seya (ဆရာ, "teacher").

## Approach

kunyi is structured as a proper Python package with two input modes:

- **JSON → MCQ cards** — a structured format with question, multiple-choice options, correct answer (validated against the choices list at parse time), and an explanation shown on the card back.
- **TSV → basic cards** — a minimal two-column format (`front\tback`) for simple recall cards; the header row is auto-detected and skipped.

The package separates concerns across four layers:

- `card_types.py` — pure dataclasses (`MCQCard`, `BasicCard`) with reserved `tags` and `media_paths` fields for future extension, no genanki dependency.
- `models.py` — genanki model factories, one per card type, isolating Anki-specific template logic.
- `parsers.py` — stateless file parsers that return typed card lists with clear error messages on malformed input.
- `deck.py` — `AnkiCardDeck` orchestration layer that dispatches on card type and collects media for registration at save time.

## CLI and Seya integration

The CLI is the primary integration surface for Seya (a Dart/Flutter subprocess caller):

```bash
kunyi "Deck Name" cards.json --output /path/to/deck.apkg
```

The contract is strict: the resolved `.apkg` path on stdout and exit 0 on success; a human-readable message on stderr and exit 1 on failure. Seya checks the exit code and reads stdout as the file path — no parsing of path conventions required.

`--format {json,tsv}` overrides extension-based detection for callers that pass temp files with non-standard extensions.

## Status

v0.1.0 — live on PyPI at [pypi.org/project/kunyi](https://pypi.org/project/kunyi/0.1.0/) (`pip install kunyi`). 17 unit tests passing. Dependency tree (`genanki` and its transitive dependencies) carries no known CVEs.

## Future work

- Image and audio card support (media_paths field is reserved; wiring into genanki Package is the remaining step).
- Integration test exercising the full Seya subprocess call.
