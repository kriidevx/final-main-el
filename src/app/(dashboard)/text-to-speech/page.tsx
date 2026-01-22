"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../../components/dashboard/sidebar";
import Navbar from "../../../components/dashboard/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Download, Loader2, Settings2, Volume2 } from "lucide-react";
import { useTTS } from "../../../hooks/use-tts";
import VoiceSelector from "../../../components/text-to-speech/voice-selector";
import VoiceControls from "../../../components/text-to-speech/voice-controls";

export default function TextToSpeechPage() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { convertTextToSpeech, getVoices, downloadAudio, isConverting, error, voices, audioBlob } = useTTS();

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const fetchedVoices = await getVoices();
      if (fetchedVoices.length > 0) {
        setSelectedVoice(fetchedVoices[0].voice_id);
      }
    } catch (err) {
      console.error("Failed to load voices:", err);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      // setError would be handled in the hook
      return;
    }

    if (!selectedVoice) {
      // setError would be handled in the hook
      return;
    }

    setIsGenerating(true);
    try {
      await convertTextToSpeech(text, {
        voiceId: selectedVoice,
      });
    } catch (err) {
      console.error("TTS conversion failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (audioBlob) {
      downloadAudio(audioBlob, "speech.mp3");
    }
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-600 p-3 rounded-2xl">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Text-to-Speech Converter
              </h1>
              <p className="text-gray-400">
                Transform your text into natural-sounding speech with AI-powered voices
              </p>
            </div>

            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Text Input</CardTitle>
                <CardDescription>Enter the text you want to convert to speech</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Enter Your Text
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste your text here... No word limit!"
                    className="w-full h-48 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-white"
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      {text.length} characters • {text.trim().split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/10">
              <CardContent className="space-y-6 pt-6">
                <VoiceSelector
                  voices={voices}
                  selectedVoice={selectedVoice}
                  onVoiceChange={setSelectedVoice}
                />

                <div className="border-t border-white/10 pt-6">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Settings2 className="w-4 h-4" />
                    Advanced Settings
                  </button>
                  {showAdvanced && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                      <VoiceControls
                        stability={stability}
                        similarityBoost={similarityBoost}
                        onStabilityChange={setStability}
                        onSimilarityBoostChange={setSimilarityBoost}
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">Error: {error}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !text.trim() || !selectedVoice}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        Generate Voice
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleDownload}
                    disabled={!audioBlob}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download MP3
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white">How to Use Your API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex gap-2">
                    <span className="font-semibold text-blue-400 min-w-[24px]">1.</span>
                    <p>Get your Murf AI API key from <a href="https://murf.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">murf.ai</a></p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-blue-400 min-w-[24px]">2.</span>
                    <p>Open the <code className="px-2 py-1 bg-gray-800 rounded text-xs">.env.local</code> file in your project root</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-blue-400 min-w-[24px]">3.</span>
                    <p>Replace the dummy key in <code className="px-2 py-1 bg-gray-800 rounded text-xs">MURF_AI_API_KEY</code> with your actual API key</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-blue-400 min-w-[24px]">4.</span>
                    <p>Restart your development server for changes to take effect</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-300">
                    <strong>Note:</strong> The application is set up with a dummy API key. Once you replace it with your real key, all features will work seamlessly.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-gray-500">
              <p>Powered by Murf AI Voice Technology</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}