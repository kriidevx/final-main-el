"use client";

import { useState } from "react";
import Sidebar from "../../../components/dashboard/sidebar";
import Navbar from "../../../components/dashboard/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [vibrationFeedback, setVibrationFeedback] = useState(true);

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-slate-900 border border-white/10">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="ai">AI Models</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Notifications</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Email Notifications</p>
                      <p className="text-xs text-gray-400">Receive updates via email</p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Audio Feedback</p>
                      <p className="text-xs text-gray-400">Enable sound alerts</p>
                    </div>
                    <Switch checked={audioFeedback} onCheckedChange={setAudioFeedback} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Vibration Feedback</p>
                      <p className="text-xs text-gray-400">Enable haptic alerts</p>
                    </div>
                    <Switch checked={vibrationFeedback} onCheckedChange={setVibrationFeedback} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Device Settings */}
            <TabsContent value="devices" className="space-y-6">
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Camera Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure your camera feed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Frame Rate</label>
                    <Select defaultValue="30">
                      <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="60">60 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Resolution</label>
                    <Select defaultValue="1080">
                      <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720">720p</SelectItem>
                        <SelectItem value="1080">1080p</SelectItem>
                        <SelectItem value="4k">4K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Model Settings */}
            <TabsContent value="ai" className="space-y-6">
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Detection Models</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure AI model settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">YOLO Model</label>
                    <Select defaultValue="yolov8n">
                      <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yolov8n">YOLOv8n (Fast)</SelectItem>
                        <SelectItem value="yolov8s">YOLOv8s (Balanced)</SelectItem>
                        <SelectItem value="yolov8m">YOLOv8m (Accurate)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Confidence Threshold</label>
                    <Select defaultValue="0.75">
                      <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">50%</SelectItem>
                        <SelectItem value="0.75">75%</SelectItem>
                        <SelectItem value="0.9">90%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button className="w-full md:w-auto">Save Changes</Button>
          </div>
        </main>
      </div>
    </div>
  );
}