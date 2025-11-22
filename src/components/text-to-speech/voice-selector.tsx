"use client";

import { ChevronDown } from 'lucide-react';
import { Voice } from '../../hooks/use-tts';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
}

export default function VoiceSelector({ 
  voices, 
  selectedVoice, 
  onVoiceChange 
}: VoiceSelectorProps) {
  const groupedVoices = voices.reduce((acc, voice) => {
    const language = voice.labels.language || 'Other';
    if (!acc[language]) {
      acc[language] = [];
    }
    acc[language].push(voice);
    return acc;
  }, {} as Record<string, Voice[]>);

  const selectedVoiceData = voices.find(v => v.voice_id === selectedVoice);
  
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Voice
      </label>
      <div className="relative">
        <select
          value={selectedVoice}
          onChange={(e) => onVoiceChange(e.target.value)}
          className="w-full px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all text-white"
        >
          {Object.entries(groupedVoices).map(([language, voicesInGroup]) => (
            <optgroup key={language} label={language}>
              {voicesInGroup.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name} {voice.labels.gender ? `(${voice.labels.gender})` : ''} {voice.labels.accent ? `- ${voice.labels.accent}` : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      {selectedVoiceData && (
        <div className="mt-2 text-sm text-gray-400">
          <span className="font-medium">{selectedVoiceData.name}</span>
          {selectedVoiceData.labels.age && ` • ${selectedVoiceData.labels.age}`}
          {selectedVoiceData.labels.accent && ` • ${selectedVoiceData.labels.accent} accent`}
        </div>
      )}
    </div>
  );
}