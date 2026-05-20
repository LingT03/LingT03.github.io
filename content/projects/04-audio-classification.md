---
id: audio-classification
title: Audio Classification Pipeline
role: ML Engineer / Researcher
timeframe: "Spring 2025"
status: completed
short_description_md: A machine learning project for classifying audio clips into predefined categories using modern deep learning models. Explores data preprocessing, model training, and evaluation for audio classification tasks.
tech_stack:
  - python
  - pytorch
  - huggingface
  - git
links:
  github: "https://github.com/LingT03/AudioClassification"
tags:
  - machine learning
  - audio
  - deep learning
  - classification
---

## Goal

Build a reproducible pipeline that ingests raw audio, computes log-mel
spectrograms, and trains a convolutional / transformer hybrid model
for multi-class clip classification. The repo serves as both a working
benchmark and a teaching artifact for audio-domain ML.

## Components

- **Data**: librosa-based loader, train/val/test splits, per-class
  balancing utilities.
- **Features**: log-mel spectrograms, SpecAugment, dynamic-range
  normalization.
- **Models**: CNN baseline + a Hugging Face audio transformer
  (`facebook/wav2vec2-base` family) fine-tuned with a classification
  head.
- **Evaluation**: confusion matrices, per-class F1, ROC-AUC, and
  bootstrap confidence intervals on top-1 accuracy.

## Status

Experimental. Baseline CNN trained end-to-end; transformer head fine-tunes
cleanly on small datasets. Future work: streaming inference, lightweight
on-device export (ONNX / CoreML).
