"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils/cn";
import { Home, Video, BarChart3, Settings, Eye, Volume2, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { supabase } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Live Feed", href: "/live-feed", icon: Video },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Text-to-Speech", href: "/text-to-speech", icon: Volume2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-white/10 h-screen">
      <div className="flex items-center gap-2 p-6 border-b border-white/10">
        <Eye className="w-8 h-8 text-blue-400" />
        <span className="text-xl font-bold text-white">Vision Beyond</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}