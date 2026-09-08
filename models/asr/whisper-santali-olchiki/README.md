---
library_name: transformers
language:
- sat
license: apache-2.0
base_model: openai/whisper-small
tags:
- generated_from_trainer
datasets:
- mozilla-foundation/common-voice-santali
model-index:
- name: Whisper Small Santali (Ol Chiki)
  results: []
---

<!-- This model card has been generated automatically according to the information the Trainer had access to. You
should probably proofread and complete it, then remove this comment. -->

# Whisper Small Santali (Ol Chiki)

This model is a fine-tuned version of [openai/whisper-small](https://huggingface.co/openai/whisper-small) on the Common Voice Scripted Speech 24.0 - Santali (Ol Chiki) dataset.
It achieves the following results on the evaluation set:
- eval_loss: 3.1085
- eval_model_preparation_time: 0.0257
- eval_wer: 1.1150
- eval_runtime: 59.2411
- eval_samples_per_second: 2.144
- eval_steps_per_second: 0.27
- step: 0

## Model description

More information needed

## Intended uses & limitations

More information needed

## Training and evaluation data

More information needed

## Training procedure

### Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 1e-05
- train_batch_size: 8
- eval_batch_size: 8
- seed: 42
- gradient_accumulation_steps: 2
- total_train_batch_size: 16
- optimizer: Use OptimizerNames.ADAMW_TORCH_FUSED with betas=(0.9,0.999) and epsilon=1e-08 and optimizer_args=No additional optimizer arguments
- lr_scheduler_type: linear
- lr_scheduler_warmup_steps: 100
- training_steps: 1000
- mixed_precision_training: Native AMP

### Framework versions

- Transformers 4.57.3
- Pytorch 2.9.0+cu126
- Datasets 4.0.0
- Tokenizers 0.22.1
