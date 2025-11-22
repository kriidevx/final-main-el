"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Volume2, Play, Square } from "lucide-react";

export default function TTSConverter() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("Rachel");
  const [speed, setSpeed] = useState([1.0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const voices = [
    { id: "Rachel", name: "Rachel (Female)" },
    { id: "Adam", name: "Adam (Male)" },
    { id: "Bella", name: "Bella (Female)" },
    { id: "Josh", name: "Josh (Male)" },
  ];

  const handleConvert = async () => {
    setIsPlaying(true);
    // Simulate TTS conversion
    setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Text-to-Speech
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Enter Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 px-4 py-2 rounded-md bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Type your message here..."
          />
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Voice</label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voices.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Speed</label>
            <span className="text-sm text-gray-400">{speed[0].toFixed(1)}x</span>
          </div>
          <Slider
            value={speed}
            onValueChange={setSpeed}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Convert Button */}
        <Button
          onClick={handleConvert}
          disabled={!text || isPlaying}
          className="w-full"
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Playing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Convert to Speech
            </>
          )}
        </Button>

        {/* Preset Messages */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Quick Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {["Hello", "Thank you", "Help me", "Goodbye"].map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => setText(preset)}
                className="text-gray-300 border-white/10"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}