"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Scan } from "lucide-react";

export default function YoloDetectionOverlay() {
  const detections = [
    { object: "Person", confidence: 98.5, distance: 2.3, color: "blue" },
    { object: "Chair", confidence: 95.2, distance: 1.5, color: "green" },
    { object: "Table", confidence: 92.8, distance: 3.1, color: "yellow" },
    { object: "Laptop", confidence: 89.4, distance: 2.7, color: "purple" },
  ];

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Scan className="w-5 h-5" />
          Detected Objects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {detections.map((detection, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${detection.color}-400`} />
                <div>
                  <p className="text-sm font-medium text-white">{detection.object}</p>
                  <p className="text-xs text-gray-400">{detection.distance}m away</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {detection.confidence.toFixed(1)}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}