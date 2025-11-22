"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import Sidebar from "../../../components/dashboard/sidebar";
import Navbar from "../../../components/dashboard/navbar";
import { Eye, AlertTriangle, Volume2, Activity } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Detections",
      value: "1,284",
      change: "+12.5%",
      icon: Eye,
      color: "blue",
    },
    {
      title: "Safety Alerts",
      value: "47",
      change: "-8.2%",
      icon: AlertTriangle,
      color: "red",
    },
    {
      title: "TTS Requests",
      value: "326",
      change: "+23.1%",
      icon: Volume2,
      color: "green",
    },
    {
      title: "System Status",
      value: "Online",
      change: "99.9% uptime",
      icon: Activity,
      color: "purple",
    },
  ];

  const recentActivity = [
    { type: "Detection", object: "Person", confidence: "98%", time: "2 mins ago" },
    { type: "Alert", object: "Obstacle", confidence: "95%", time: "5 mins ago" },
    { type: "TTS", object: "Message sent", confidence: "100%", time: "8 mins ago" },
    { type: "Detection", object: "Chair", confidence: "92%", time: "12 mins ago" },
  ];

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="glass-effect border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">
                Your latest detections and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={activity.type === "Alert" ? "destructive" : "default"}
                      >
                        {activity.type}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-white">{activity.object}</p>
                        <p className="text-xs text-gray-500">Confidence: {activity.confidence}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}