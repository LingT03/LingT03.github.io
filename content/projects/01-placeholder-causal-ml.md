---
id: project-causal-ml
title: Causal ML Benchmark Suite  # TODO: rename
short_description_md: A reproducible benchmark comparing meta-learners (S, T, X, R, DR) for heterogeneous treatment effect estimation on synthetic and semi-synthetic benchmarks.
tech_stack:
  - python
  - sklearn
  - pytorch
  - dowhy
  - jupyter
  - git
links:
  github: "https://github.com/LingT03/PLACEHOLDER-causal-ml"  # TODO
  paper: ""  # TODO if published
status: in_progress
---

> **PLACEHOLDER — swap with a real project.**

## Motivation

Meta-learners for **conditional average treatment effects (CATE)** vary
substantially in finite-sample performance, and a unified comparison across
modern S-, T-, X-, R-, and DR-learner variants is rare in applied work. This
project assembles a benchmark suite to evaluate them on canonical synthetic
DGPs (Wager–Athey, IHDP, Lalonde) under a shared evaluation harness.

## Methods

- Generative simulators with explicit ground-truth CATE functions.
- Meta-learners built atop `scikit-learn` and `EconML`, with `DoWhy` for
  identification graphs.
- Honest validation via held-out PEHE and policy-value regret metrics.
- Confidence intervals via influence-function-based variance estimators.

## Results

- (Pending) Comparative tables across DGPs with bootstrapped CIs.
- (Pending) Sensitivity-analysis ablations for unmeasured-confounding stress
  tests.

## Reproducibility

The repository pins all dependencies via `pip-tools`, captures random seeds,
and ships a single-command CLI for re-running every experiment end-to-end.
