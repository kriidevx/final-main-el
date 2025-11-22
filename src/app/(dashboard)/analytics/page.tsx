"use client";

import Sidebar from "../../../components/dashboard/sidebar";
import Navbar from "../../../components/dashboard/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AnalyticsPage() {
  const detectionTrends = [
    { date: "Mon", detections: 45 },
    { date: "Tue", detections: 52 },
    { date: "Wed", detections: 38 },
    { date: "Thu", detections: 61 },
    { date: "Fri", detections: 55 },
    { date: "Sat", detections: 42 },
    { date: "Sun", detections: 48 },
  ];

  const objectDistribution = [
    { name: "Person", value: 35 },
    { name: "Vehicle", value: 25 },
    { name: "Furniture", value: 20 },
    { name: "Electronics", value: 15 },
    { name: "Other", value: 5 },
  ];

  const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detection Trends */}
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Detection Trends</CardTitle>
                <CardDescription className="text-gray-400">
                  Last 7 days activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={detectionTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="detections" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Object Distribution */}
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Object Distribution</CardTitle>
                <CardDescription className="text-gray-400">
                  Most detected objects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={objectDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {objectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* TTS Usage */}
            <Card className="glass-effect border-white/10 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">TTS Usage Patterns</CardTitle>
                <CardDescription className="text-gray-400">
                  Text-to-speech requests over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={detectionTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="detections" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}