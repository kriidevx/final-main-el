# Deaf Mode - Speech-to-Text Setup

## Current Implementation

The Deaf Mode is currently using a **mock implementation** for speech-to-text transcription. This means:

- ✅ Audio recording works perfectly
- ✅ UI displays transcripts and conversation history
- ✅ All features are functional for testing
- ⚠️ Transcriptions are simulated (random mock text)

## How It Works Now

1. **Recording**: Click the Record button to capture audio (works with any microphone)
2. **Processing**: Audio is processed for 2 seconds (simulated API delay)
3. **Mock Transcription**: Random sample text is displayed as the "transcript"
4. **Features**: All UI features work (conversation history, text-to-speech, etc.)

## Setting Up Real Speech-to-Text (Production)

To replace the mock implementation with real speech recognition, choose one of these options:

### Option 1: Google Cloud Speech-to-Text (Recommended)

1. **Install the package**:
   ```bash
   npm install @google-cloud/speech
   ```

2. **Set up authentication**:
   - Create a Google Cloud project
   - Enable the Speech-to-Text API
   - Create a service account and download the JSON key
   - Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json`

3. **Update the API route**:
   - Uncomment the Google Cloud implementation in `/src/app/api/gemini/speech-to-text/route.ts`
   - Comment out the mock implementation

### Option 2: OpenAI Whisper API

1. **Get an OpenAI API key** and add to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Update the API route** with OpenAI implementation

### Option 3: AssemblyAI

1. **Sign up for AssemblyAI** and get an API key
2. **Install the package**: `npm install assemblyai`
3. **Update the API route** with AssemblyAI implementation

## Testing the Current Implementation

1. Navigate to `/dashboard/deaf-mode`
2. Click the **Record** button
3. Speak for a few seconds (any audio works)
4. Click **Stop** 
5. Wait 2 seconds for processing
6. See the mock transcript appear with all features working

## Features Available

- 🎤 **Audio Recording**: High-quality audio capture with echo cancellation
- 🎵 **Audio Playback**: Listen to your recordings
- 💬 **Live Transcripts**: See text appear after processing
- 📜 **Conversation History**: Full history with timestamps
- 🔊 **Text-to-Speech**: Hear transcribed text
- 💾 **Export**: Save conversations to text files
- 🎛️ **Audio Controls**: Volume, speech rate, auto-play settings

## Production Deployment Notes

- Replace mock implementation before production deployment
- Ensure proper API rate limits and error handling
- Consider audio file size limits and processing timeouts
- Add user authentication for API access
- Monitor API usage and costs

## Troubleshooting

**Microphone not working?**
- Check browser permissions
- Ensure HTTPS is used (required for microphone access)
- Try a different browser

**No transcript appearing?**
- Check the browser console for errors
- Verify the API endpoint is responding
- Check network connection

**Audio playback issues?**
- Ensure audio files are generated correctly
- Check browser audio permissions
- Verify audio format compatibility
