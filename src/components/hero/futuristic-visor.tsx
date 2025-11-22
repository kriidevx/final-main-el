"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ArrowRight, Zap, Eye, Cpu } from "lucide-react";

interface VisorProps {
  className?: string;
}

const FuturisticVisor: React.FC<VisorProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="visorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6">
              <animate
                attributeName="stop-color"
                values="#3b82f6; #60a5fa; #93c5fd; #3b82f6"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="33%" stopColor="#60a5fa">
              <animate
                attributeName="stop-color"
                values="#60a5fa; #93c5fd; #3b82f6; #60a5fa"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="66%" stopColor="#93c5fd">
              <animate
                attributeName="stop-color"
                values="#93c5fd; #3b82f6; #60a5fa; #93c5fd"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#3b82f6">
              <animate
                attributeName="stop-color"
                values="#3b82f6; #60a5fa; #93c5fd; #3b82f6"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Head outline */}
        <ellipse
          cx="200"
          cy="220"
          rx="90"
          ry="120"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* Ear */}
        <ellipse
          cx="110"
          cy="200"
          rx="15"
          ry="25"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />

        {/* Neck */}
        <rect
          x="170"
          y="320"
          width="60"
          height="60"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* Nose */}
        <path
          d="M 200 200 L 185 220 L 200 225"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Mouth */}
        <line
          x1="185"
          y1="260"
          x2="215"
          y2="260"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Visor frame - top */}
        <path
          d="M 120 180 Q 200 165 280 180"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          opacity="0.8"
        />

        {/* Visor frame - bottom */}
        <path
          d="M 120 210 Q 200 195 280 210"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          opacity="0.8"
        />

        {/* Visor glass */}
        <path
          d="M 120 180 Q 200 165 280 180 L 280 210 Q 200 195 120 210 Z"
          fill="hsl(var(--primary))"
          opacity="0.15"
        />

        {/* LED light bar */}
        <path
          d="M 130 195 Q 200 182 270 195"
          fill="none"
          stroke="url(#visorGlow)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#glow)"
        >
          <animate
            attributeName="opacity"
            values="0.6; 1; 0.6"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Visor side connectors */}
        <circle cx="120" cy="195" r="5" fill="hsl(var(--foreground))" opacity="0.7" />
        <circle cx="280" cy="195" r="5" fill="hsl(var(--foreground))" opacity="0.7" />
      </svg>
    </div>
  );
};

export default FuturisticVisor;