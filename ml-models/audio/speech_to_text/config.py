# Speech-to-Text Configuration

# Google Speech-to-Text Settings
google_stt:
  api_key: null  # Set your Google Cloud API key
  default_language: "en-US"
  timeout: 5
  phrase_time_limit: 30
  energy_threshold: 300
  dynamic_energy_threshold: true
  pause_threshold: 0.8
  phrase_threshold: 0.3
  non_speaking_duration: 0.5

# Whisper Settings
whisper:
  model_size: "base"  # tiny, base, small, medium, large
  device: "auto"  # auto, cpu, cuda
  sample_rate: 16000
  chunk_duration: 30
  language_detection: true
  translation_enabled: true

# Audio Settings
audio:
  sample_rate: 16000
  channels: 1
  bit_depth: 16
  buffer_size: 1024
  input_device: null  # Auto-detect if null

# Streaming Settings
streaming:
  enabled: true
  chunk_size: 1024
  overlap_duration: 0.5  # seconds
  silence_threshold: 0.1
  min_speech_duration: 0.5
  max_silence_duration: 2.0

# Post-processing Settings
post_processing:
  punctuation: true
  capitalization: true
  number_formatting: true
  profanity_filter: false
  confidence_threshold: 0.5

# Output Settings
output:
  include_timestamps: true
  include_confidence: true
  include_alternatives: false
  max_alternatives: 3
  format: "json"  # json, text, srt

# Performance Settings
performance:
  batch_processing: false
  batch_size: 8
  num_workers: 4
  cache_enabled: true
  cache_size: 100

# Supported Languages
languages:
  google:
    - "en-US"
    - "en-GB"
    - "en-AU"
    - "en-CA"
    - "en-IN"
    - "es-ES"
    - "es-MX"
    - "fr-FR"
    - "de-DE"
    - "it-IT"
    - "pt-BR"
    - "ja-JP"
    - "ko-KR"
    - "zh-CN"
    - "ar-SA"
    - "hi-IN"
  
  whisper:
    - "en"
    - "es"
    - "fr"
    - "de"
    - "it"
    - "pt"
    - "ja"
    - "ko"
    - "zh"
    - "ar"
    - "hi"
    - "ru"
    - "nl"
    - "sv"
    - "no"
    - "da"
    - "fi"
    - "pl"
    - "tr"
    - "th"
    - "vi"

# Quality Settings
quality:
  noise_reduction: true
  echo_cancellation: false
  auto_gain_control: true
  high_pass_filter: 80  # Hz
  low_pass_filter: 8000  # Hz

# Security Settings
security:
  encrypt_audio: false
  log_audio_data: false
  retention_days: 30
  gdpr_compliant: true
