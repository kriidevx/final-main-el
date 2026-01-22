"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Navigation, 
  AlertTriangle, 
  Shield, 
  Activity,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface ObstacleData {
  id: string;
  type: string;
  distance: number;
  direction: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

interface ObstacleDetectionViewProps {
  isActive: boolean;
}

export function ObstacleDetectionView({ isActive }: ObstacleDetectionViewProps) {
  const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
  const [closestObstacle, setClosestObstacle] = useState<ObstacleData | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Simulate obstacle detection
  useEffect(() => {
    if (!isActive) {
      setObstacles([]);
      setClosestObstacle(null);
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    const interval = setInterval(() => {
      const mockObstacles: ObstacleData[] = [
        {
          id: '1',
          type: 'Person',
          distance: 2.3 + Math.random() * 0.5,
          direction: 'front',
          confidence: 92 + Math.random() * 8,
          severity: 'medium',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'Wall',
          distance: 0.8 + Math.random() * 0.3,
          direction: 'front',
          confidence: 95 + Math.random() * 5,
          severity: 'high',
          timestamp: new Date()
        },
        {
          id: '3',
          type: 'Chair',
          distance: 1.5 + Math.random() * 0.5,
          direction: 'left',
          confidence: 88 + Math.random() * 12,
          severity: 'low',
          timestamp: new Date()
        }
      ];

      // Randomly add/remove obstacles
      const activeObstacles = mockObstacles
        .filter(() => Math.random() > 0.3)
        .slice(0, Math.floor(Math.random() * 3) + 1);

      setObstacles(activeObstacles);

      // Find closest obstacle
      if (activeObstacles.length > 0) {
        const closest = activeObstacles.reduce((prev, current) => 
          prev.distance < current.distance ? prev : current
        );
        setClosestObstacle(closest);
      } else {
        setClosestObstacle(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'front': return <ArrowUp className="w-4 h-4" />;
      case 'back': return <ArrowDown className="w-4 h-4" />;
      case 'left': return <ArrowLeft className="w-4 h-4" />;
      case 'right': return <ArrowRight className="w-4 h-4" />;
      default: return <Navigation className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getDistanceProgress = (distance: number) => {
    // Map distance to progress (closer = higher progress)
    const maxDistance = 5; // 5 meters
    const progress = Math.max(0, Math.min(100, (1 - distance / maxDistance) * 100));
    return progress;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          Obstacle Detection
        </CardTitle>
        <CardDescription>
          Real-time obstacle detection using ultrasonic sensors and YOLO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">
              {isActive ? (isScanning ? 'Scanning...' : 'Active') : 'Inactive'}
            </span>
          </div>
          <Badge variant={obstacles.length > 0 ? "destructive" : "secondary"}>
            {obstacles.length} obstacle{obstacles.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Closest Obstacle Alert */}
        {closestObstacle && (
          <div className={`p-4 rounded-lg border ${getSeverityColor(closestObstacle.severity)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Closest Obstacle</span>
              </div>
              <Badge variant="outline">{closestObstacle.severity}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{closestObstacle.type}</span>
                <span className="text-sm font-bold">{closestObstacle.distance.toFixed(1)}m</span>
              </div>
              <div className="flex items-center gap-2">
                {getDirectionIcon(closestObstacle.direction)}
                <span className="text-sm capitalize">{closestObstacle.direction}</span>
                <span className="text-xs text-muted-foreground">
                  {closestObstacle.confidence.toFixed(0)}% confidence
                </span>
              </div>
              <Progress 
                value={getDistanceProgress(closestObstacle.distance)} 
                className="h-2"
              />
            </div>
          </div>
        )}

        {/* Obstacle List */}
        {obstacles.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">All Obstacles</h4>
            <div className="space-y-2">
              {obstacles.map((obstacle) => (
                <div key={obstacle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDirectionIcon(obstacle.direction)}
                    <div>
                      <p className="text-sm font-medium">{obstacle.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {obstacle.distance.toFixed(1)}m {obstacle.direction}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`text-xs ${getSeverityColor(obstacle.severity)}`}>
                      {obstacle.severity}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {obstacle.confidence.toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isActive ? 'No obstacles detected' : 'Start scanning to detect obstacles'}
            </p>
          </div>
        )}

        {/* Sensor Status */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm font-medium">Front</div>
            <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Left</div>
            <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Right</div>
            <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
