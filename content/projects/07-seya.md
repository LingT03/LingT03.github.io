---
id: seya
title: Seya
role: Solo developer
timeframe: "June 2026 – present"
date: 2026-06-01
status: in_progress
short_description_md: A cross-platform spaced-repetition flashcard app with a built-in, fully on-device LLM study assistant. Reviews are scheduled with the FSRS-5 algorithm, and chat plus AI card-generation run against a local Ollama server, so no study data leaves the machine. A single Flutter/Dart codebase targets macOS, Windows, Linux, iOS, Android, and the web.
tech_stack:
  - dart
  - flutter
  - riverpod
  - drift
  - sqlite
  - ollama
  - git
tags:
  - spaced-repetition
  - flashcards
  - cross-platform
  - local-llm
  - on-device-ai
  - fsrs
  - offline-first
  - flutter
---

## Overview

Seya is a cross-platform spaced-repetition flashcard app with a built-in,
fully on-device LLM study assistant. It schedules reviews with the FSRS-5
algorithm and runs chat and AI flashcard generation against a local Ollama
server, so no study data leaves the user's machine. One Flutter/Dart codebase
targets macOS, Windows, Linux, iOS, Android, and the web. It is a full rewrite
of an earlier native-macOS (SwiftUI) version, chosen to ship everywhere from a
single codebase.

## Approach

The code uses a layered, dependency-inverted (hexagonal) architecture: a
pure-Dart core — domain models, the FSRS-5 scheduler, the study use case, and
repository ports — with no Flutter, database, or HTTP dependencies, surrounded
by adapters (Drift/SQLite, an Ollama client) wired only at a single composition
root. FSRS models memory with a power-law forgetting curve,
R(t, S) = (1 + factor · t / S)^decay, where stability S is the time until recall
probability falls to 90%; 19 population-level weights govern how stability and
difficulty evolve after each graded review. The scheduler is a pure function
(no clocks or I/O), so it is testable in microseconds and pinned by
invariant-based tests (monotonicity, bounds, ordering) ported 1:1 from the
original Swift suite. AI card generation uses constrained JSON-schema
(structured) output rather than free-text parsing, then validates and
de-duplicates results.

## Features

- FSRS-5 scheduling that shows each rating's projected next interval
- Deck and card management (manual entry and AI generation)
- On-device chat assistant, streamed token-by-token from a local model
- Schema-constrained flashcard generation from a topic
- Lazy local-server autostart on desktop that only stops a server it started
- Fully offline decks/study; SQLite persistence on every platform (WASM on web)

## Progress

Working today: the deck/study workflow, manual and AI card generation,
streaming chat, and lazy LLM autostart with "warming up"/"thinking" states.
Verified building and running on macOS. Planned/remaining: web SQLite assets
(sqlite3.wasm / drift_worker.js), per-user FSRS weight optimization via
maximum-likelihood over the review log, a Settings model picker, auto-pulling a
missing model, and per-platform packaging/signing. The other target platforms
are written but not yet verified-run.

## Results

No performance or usage benchmarks yet. Verification status: the unit/widget
test suite (28 tests) passes and `flutter analyze` reports no issues. Licensed
MIT.
