"use client";

import HeroSection from "../components/hero/hero-section";
import BlindAssistance from "../components/features/blind-assistance";
import DeafAssistance from "../components/features/deaf-assistance";
import MuteAssistance from "../components/features/mute-assistance";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <BlindAssistance />
      <DeafAssistance />
      <MuteAssistance />
    </main>
  );
}