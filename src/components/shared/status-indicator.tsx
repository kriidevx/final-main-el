"use client";

import { cn } from "../../lib/utils/cn";

interface StatusIndicatorProps {
  status: "online" | "offline" | "error" | "warning";
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StatusIndicator({
  status,
  label,
  showLabel = true,
  size = "md",
}: StatusIndicatorProps) {
  const statusColors = {
    online: "bg-green-400",
    offline: "bg-gray-400",
    error: "bg-red-400",
    warning: "bg-yellow-400",
  };

  const statusLabels = {
    online: "Online",
    offline: "Offline",
    error: "Error",
    warning: "Warning",
  };

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("rounded-full animate-pulse-glow", sizeClasses[size], statusColors[status])} />
      {showLabel && (
        <span className="text-sm text-gray-400">
          {label || statusLabels[status]}
        </span>
      )}
    </div>
  );
}