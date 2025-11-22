"use client";

import Sidebar from "../../../components/dashboard/sidebar";
import Navbar from "../../../components/dashboard/navbar";
import LiveVideoFeed from "../../../components/ml-integration/live-video-feed";
import YoloDetectionOverlay from "../../../components/ml-integration/yolo-detection-overlay";
import DetectionStats from "../../../components/ml-integration/detection-stats";

export default function LiveFeedPage() {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LiveVideoFeed />
            </div>
            <div className="space-y-6">
              <YoloDetectionOverlay />
              <DetectionStats />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}