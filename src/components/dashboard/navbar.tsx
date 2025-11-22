"use client";

import { Bell, User } from "lucide-react";
import { Button } from "../ui/button";

export default function Navbar() {
  return (
    <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}