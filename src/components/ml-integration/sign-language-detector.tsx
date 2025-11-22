"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Hand, Play, Square } from "lucide-react";

export default function SignLanguageDetector() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSigns, setDetectedSigns] = useState([
    { sign: "A", confidence: 97.8, timestamp: "2s ago" },
    { sign: "B", confidence: 95.3, timestamp: "5s ago" },
    { sign: "C", confidence: 92.1, timestamp: "8s ago" },
  ]);

  const toggleDetection = () => {
    setIsDetecting(!isDetecting);
  };

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Hand className="w-5 h-5" />
          Sign Language Detection
        </CardTitle>
        <Button
          size="sm"
          variant={isDetecting ? "destructive" : "default"}
          onClick={toggleDetection}
        >
          {isDetecting ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Current Detection */}
        <div className="mb-4 p-4 rounded-lg bg-slate-800/50 border border-white/5 text-center">
          <p className="text-sm text-gray-400 mb-2">Current Sign</p>
          {isDetecting ? (
            <div className="text-6xl font-bold text-blue-400">A</div>
          ) : (
            <p className="text-gray-500">Not detecting</p>
          )}
        </div>

        {/* History */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">Recent Detections</p>
          {detectedSigns.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-400">{item.sign}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Sign: {item.sign}</p>
                  <p className="text-xs text-gray-400">{item.timestamp}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {item.confidence.toFixed(1)}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}