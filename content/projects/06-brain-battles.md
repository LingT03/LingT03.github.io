---
id: brain-battles
title: BrainBattles — Multiplayer Quiz Game
role: Lead Developer / Game Designer
timeframe: "Fall 2023"
status: prototype
short_description_md: A competitive quiz-style web game where players answer questions under time pressure to earn points, outsmart opponents, and climb a leaderboard.
tech_stack:
  - javascript
  - nodejs
  - git
links:
  github: "https://github.com/LingT03/BrainBattles"
tags:
  - game dev
  - quiz
  - web app
  - multiplayer
---

## Concept

Real-time multiplayer trivia: players join a room, answer timed questions
in lockstep, and accumulate points based on speed and accuracy. A live
leaderboard updates per round; the room host controls game pacing.

## Architecture

- **Server**: Node.js with WebSocket fan-out for room state, score
  updates, and round transitions.
- **Client**: vanilla JavaScript + HTML/CSS for a low-latency game
  loop; no SPA framework to keep the round timing tight.
- **Question bank**: structured JSON with category, difficulty, and
  answer key.

## Status

Prototype. End-to-end loop is functional for small lobbies; the next
iteration would add persistent accounts, mobile-friendly layout, and
spectator mode.
