"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, Target, Clock } from "lucide-react";

export default function DetectionStats() {
  const stats = [
    {
      label: "Avg Confidence",
      value: "94.2%",
      icon: Target,
      color: "text-blue-400",
    },
    {
      label: "FPS",
      value: "30",
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      label: "Response Time",
      value: "45ms",
      icon: Clock,
      color: "text-purple-400",
    },
  ];

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Detection Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-gray-400">{stat.label}</span>
                </div>
                <span className="text-lg font-bold text-white">{stat.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}