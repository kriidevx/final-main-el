"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  EyeOff, 
  VolumeX, 
  MicOff, 
  ChevronDown 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const modes = [
  {
    id: 'blind',
    name: 'Blind Mode',
    description: 'Visual assistance',
    icon: EyeOff,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    href: '/blind-mode'
  },
  {
    id: 'deaf',
    name: 'Deaf Mode',
    description: 'Hearing assistance',
    icon: VolumeX,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    href: '/deaf-mode'
  },
  {
    id: 'mute',
    name: 'Mute Mode',
    description: 'Speech assistance',
    icon: MicOff,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    href: '/mute-mode'
  }
];

export function ModeSelector() {
  const [selectedMode, setSelectedMode] = useState(modes[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <div className={`w-8 h-8 rounded-full ${selectedMode.bgColor} flex items-center justify-center mr-3`}>
            <selectedMode.icon className={`w-4 h-4 ${selectedMode.color}`} />
          </div>
          <div className="text-left">
            <div className="font-medium">{selectedMode.name}</div>
            <div className="text-xs text-muted-foreground">{selectedMode.description}</div>
          </div>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        {modes.map((mode) => (
          <DropdownMenuItem
            key={mode.id}
            onClick={() => setSelectedMode(mode)}
            className="p-3 cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-full ${mode.bgColor} flex items-center justify-center mr-3`}>
              <mode.icon className={`w-5 h-5 ${mode.color}`} />
            </div>
            <div className="flex-1">
              <div className="font-medium">{mode.name}</div>
              <div className="text-sm text-muted-foreground">{mode.description}</div>
            </div>
            {selectedMode.id === mode.id && (
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
