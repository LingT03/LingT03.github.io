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
  - git
links:
  github: "https://github.com/LingT03/AudioClassification"
tags:
  - machine learning
  - audio
  - deep learning
  - classification
---

## Context

Build a reproducible pipeline that ingests raw audio, computes log-mel
spectrograms, and trains a convolutional / transformer hybrid model
for multi-class clip classification. The repo serves as both a working
benchmark and a teaching artifact for audio-domain ML.

## Components

- **Data**: Google audioset , train/val/test splits, per-class
  balancing utilities.
- **Features**: log-mel spectrograms, SpecAugment, dynamic-range
  normalization.
- **Model**: Deep CNN
- **Evaluation**: confusion matrices, per-class F1, ROC-AUC

## Status

Comleted. The repo includes a trained model checkpoint and a Jupyter
notebook walkthrough of the training and evaluation process.
