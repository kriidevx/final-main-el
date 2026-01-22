"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  AlertTriangle, 
  Lightbulb, 
  Zap, 
  Eye,
  Settings,
  Activity,
  Power,
  Palette
} from 'lucide-react';

interface LEDPattern {
  id: string;
  name: string;
  description: string;
  colors: string[];
  speed: number;
  intensity: number;
  active: boolean;
}

interface LEDWarningControlsProps {
  isActive: boolean;
}

export function LEDWarningControls({ isActive }: LEDWarningControlsProps) {
  const [patterns, setPatterns] = useState<LEDPattern[]>([
    {
      id: 'proximity',
      name: 'Proximity Warning',
      description: 'Flashing red when obstacles are close',
      colors: ['#FF0000', '#FF6600'],
      speed: 2,
      intensity: 80,
      active: true
    },
    {
      id: 'direction',
      name: 'Direction Indicator',
      description: 'Blue lights showing obstacle direction',
      colors: ['#0066FF', '#00CCFF'],
      speed: 1,
      intensity: 60,
      active: true
    },
    {
      id: 'status',
      name: 'Status Indicator',
      description: 'Green when system is active',
      colors: ['#00FF00', '#00FF66'],
      speed: 0.5,
      intensity: 40,
      active: true
    },
    {
      id: 'emergency',
      name: 'Emergency Alert',
      description: 'Rapid red flashing for critical obstacles',
      colors: ['#FF0000', '#FFFF00'],
      speed: 4,
      intensity: 100,
      active: false
    }
  ]);

  const [globalIntensity, setGlobalIntensity] = useState([75]);
  const [ledEnabled, setLedEnabled] = useState(true);
  const [currentPattern, setCurrentPattern] = useState<string | null>(null);

  // Simulate LED activation based on obstacles
  useEffect(() => {
    if (!isActive || !ledEnabled) {
      setPatterns(prev => prev.map(p => ({ ...p, active: false })));
      setCurrentPattern(null);
      return;
    }

    // Simulate different patterns activating
    const interval = setInterval(() => {
      const randomPattern = Math.random();
      
      if (randomPattern < 0.3) {
        // Proximity warning
        setPatterns(prev => prev.map(p => ({
          ...p,
          active: p.id === 'proximity' || p.id === 'status'
        })));
        setCurrentPattern('proximity');
      } else if (randomPattern < 0.6) {
        // Direction indicator
        setPatterns(prev => prev.map(p => ({
          ...p,
          active: p.id === 'direction' || p.id === 'status'
        })));
        setCurrentPattern('direction');
      } else if (randomPattern < 0.7) {
        // Emergency alert
        setPatterns(prev => prev.map(p => ({
          ...p,
          active: p.id === 'emergency'
        })));
        setCurrentPattern('emergency');
      } else {
        // Status only
        setPatterns(prev => prev.map(p => ({
          ...p,
          active: p.id === 'status'
        })));
        setCurrentPattern('status');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive, ledEnabled]);

  const togglePattern = (patternId: string) => {
    setPatterns(prev => prev.map(p => 
      p.id === patternId ? { ...p, active: !p.active } : p
    ));
  };

  const updatePatternIntensity = (patternId: string, intensity: number) => {
    setPatterns(prev => prev.map(p => 
      p.id === patternId ? { ...p, intensity } : p
    ));
  };

  const updatePatternSpeed = (patternId: string, speed: number) => {
    setPatterns(prev => prev.map(p => 
      p.id === patternId ? { ...p, speed } : p
    ));
  };

  const getPatternColor = (pattern: LEDPattern) => {
    if (!pattern.active) return 'bg-gray-200 dark:bg-gray-700';
    
    const primaryColor = pattern.colors[0];
    return {
      backgroundColor: primaryColor,
      opacity: pattern.intensity / 100
    };
  };

  const getPatternStatus = (pattern: LEDPattern) => {
    if (!ledEnabled) return 'disabled';
    if (!isActive) return 'inactive';
    if (pattern.active) return 'active';
    return 'ready';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-orange-600" />
          LED Warning Controls
        </CardTitle>
        <CardDescription>
          Visual warning system using LED indicators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Global Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Power className="w-4 h-4" />
            <span className="text-sm font-medium">LED System</span>
          </div>
          <div className="flex items-center gap-3">
            <Switch 
              checked={ledEnabled}
              onCheckedChange={setLedEnabled}
            />
            <Badge variant={ledEnabled ? "default" : "secondary"}>
              {ledEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>

        {/* Global Intensity */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Global Intensity</label>
          <div className="flex items-center gap-2">
            <Slider
              value={globalIntensity}
              onValueChange={setGlobalIntensity}
              max={100}
              step={5}
              className="w-24"
            />
            <span className="text-sm w-10">{globalIntensity[0]}%</span>
          </div>
        </div>

        {/* LED Visualization */}
        <div className="grid grid-cols-4 gap-2">
          {patterns.map((pattern) => (
            <div
              key={pattern.id}
              className="h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all duration-300"
              style={pattern.active ? {
                backgroundColor: pattern.colors[0],
                opacity: (pattern.intensity / 100) * (globalIntensity[0] / 100),
                borderColor: pattern.colors[1]
              } : {}}
            >
              {pattern.active && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Pattern Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">LED Patterns</h4>
          <div className="space-y-3">
            {patterns.map((pattern) => (
              <div key={pattern.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {pattern.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{pattern.name}</p>
                      <p className="text-xs text-muted-foreground">{pattern.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      currentPattern === pattern.id ? "default" : 
                      getPatternStatus(pattern) === 'active' ? "secondary" : "outline"
                    }>
                      {getPatternStatus(pattern)}
                    </Badge>
                    <Switch 
                      checked={pattern.active}
                      onCheckedChange={() => togglePattern(pattern.id)}
                      disabled={!ledEnabled || !isActive}
                    />
                  </div>
                </div>

                {pattern.active && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Speed</label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[pattern.speed]}
                          onValueChange={(value) => updatePatternSpeed(pattern.id, value[0])}
                          max={5}
                          min={0.5}
                          step={0.5}
                          className="w-20"
                        />
                        <span className="text-xs w-8">{pattern.speed}x</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Intensity</label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[pattern.intensity]}
                          onValueChange={(value) => updatePatternIntensity(pattern.id, value[0])}
                          max={100}
                          step={5}
                          className="w-20"
                        />
                        <span className="text-xs w-8">{pattern.intensity}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPatterns(prev => prev.map(p => ({ ...p, active: false })));
              setCurrentPattern(null);
            }}
            disabled={!ledEnabled || !isActive}
          >
            <Eye className="w-4 h-4 mr-1" />
            Clear All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPatterns(prev => prev.map(p => ({ 
                ...p, 
                active: p.id === 'emergency' 
              })));
              setCurrentPattern('emergency');
            }}
            disabled={!ledEnabled || !isActive}
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Test Alert
          </Button>
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {patterns.filter(p => p.active).length}
            </div>
            <div className="text-xs text-muted-foreground">Active Patterns</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{globalIntensity[0]}%</div>
            <div className="text-xs text-muted-foreground">Global Intensity</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {currentPattern || 'None'}
            </div>
            <div className="text-xs text-muted-foreground">Current Pattern</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
