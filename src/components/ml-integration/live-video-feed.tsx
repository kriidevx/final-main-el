"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Video, VideoOff, RefreshCw } from "lucide-react";

export default function LiveVideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connectToStream = async () => {
    setIsLoading(true);
    try {
      // Simulate connecting to Raspberry Pi stream
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectStream = () => {
    setIsConnected(false);
  };

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Live Camera Feed</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "outline"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          {isConnected ? (
            <Button size="sm" variant="destructive" onClick={disconnectStream}>
              <VideoOff className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={connectToStream} disabled={isLoading}>
              <Video className="w-4 h-4 mr-2" />
              {isLoading ? "Connecting..." : "Start"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
          {isConnected ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            >
              <source src="/demo-video.mp4" type="video/mp4" />
            </video>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Video className="w-16 h-16 text-gray-600 mx-auto" />
                <p className="text-gray-400">Camera feed disconnected</p>
                <Button onClick={connectToStream}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Connect to Camera
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sensor Data */}
        {isConnected && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-white/5">
              <p className="text-xs text-gray-400">Temperature</p>
              <p className="text-lg font-bold text-white">24.5°C</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-white/5">
              <p className="text-xs text-gray-400">Humidity</p>
              <p className="text-lg font-bold text-white">62%</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-white/5">
              <p className="text-xs text-gray-400">Proximity</p>
              <p className="text-lg font-bold text-white">1.2m</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}