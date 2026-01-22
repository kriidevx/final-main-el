"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Eye, 
  Volume2, 
  Clock,
  MapPin,
  Target
} from 'lucide-react';

interface RecognizedObject {
  id: string;
  name: string;
  confidence: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  location: string;
  timestamp: Date;
  description?: string;
}

interface ObjectRecognitionViewProps {
  isActive: boolean;
}

export function ObjectRecognitionView({ isActive }: ObjectRecognitionViewProps) {
  const [objects, setObjects] = useState<RecognizedObject[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedObject, setSelectedObject] = useState<RecognizedObject | null>(null);

  // Simulate object recognition
  useEffect(() => {
    if (!isActive) {
      setObjects([]);
      setSelectedObject(null);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    const interval = setInterval(() => {
      const mockObjects: RecognizedObject[] = [
        {
          id: '1',
          name: 'Chair',
          confidence: 92 + Math.random() * 8,
          position: { x: 100, y: 150, width: 80, height: 120 },
          location: 'left side',
          timestamp: new Date(),
          description: 'Wooden chair with armrests'
        },
        {
          id: '2',
          name: 'Door',
          confidence: 88 + Math.random() * 12,
          position: { x: 300, y: 100, width: 100, height: 200 },
          location: 'front',
          timestamp: new Date(),
          description: 'Wooden door with handle'
        },
        {
          id: '3',
          name: 'Table',
          confidence: 95 + Math.random() * 5,
          position: { x: 200, y: 200, width: 150, height: 80 },
          location: 'center',
          timestamp: new Date(),
          description: 'Dining table'
        },
        {
          id: '4',
          name: 'Lamp',
          confidence: 85 + Math.random() * 15,
          position: { x: 50, y: 50, width: 40, height: 60 },
          location: 'corner',
          timestamp: new Date(),
          description: 'Floor lamp'
        }
      ];

      // Randomly select objects
      const activeObjects = mockObjects
        .filter(() => Math.random() > 0.4)
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map(obj => ({
          ...obj,
          confidence: Math.min(100, obj.confidence + (Math.random() - 0.5) * 10)
        }));

      setObjects(activeObjects);
      setIsProcessing(false);
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleSpeakDescription = (object: RecognizedObject) => {
    // Simulate TTS
    console.log(`Speaking: ${object.name} detected at ${object.location}. ${object.description || ''}`);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-green-600" />
          Object Recognition
        </CardTitle>
        <CardDescription>
          AI-powered object recognition with audio descriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">
              {isActive ? (isProcessing ? 'Processing...' : 'Active') : 'Inactive'}
            </span>
          </div>
          <Badge variant="secondary">
            {objects.length} object{objects.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Camera View Simulation */}
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg h-48 overflow-hidden">
          {isActive ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
              
              {/* Object Bounding Boxes */}
              {objects.map((obj) => (
                <div
                  key={obj.id}
                  className="absolute border-2 border-green-500 bg-green-500/10 cursor-pointer"
                  style={{
                    left: `${(obj.position.x / 640) * 100}%`,
                    top: `${(obj.position.y / 480) * 100}%`,
                    width: `${(obj.position.width / 640) * 100}%`,
                    height: `${(obj.position.height / 480) * 100}%`,
                  }}
                  onClick={() => setSelectedObject(obj)}
                >
                  <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    {obj.name} ({obj.confidence.toFixed(0)}%)
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
              <span className="absolute bottom-4 text-sm text-gray-500">Camera inactive</span>
            </div>
          )}
        </div>

        {/* Selected Object Details */}
        {selectedObject && (
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{selectedObject.name}</h4>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleSpeakDescription(selectedObject)}
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Speak
              </Button>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Location: {selectedObject.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Position: ({selectedObject.position.x}, {selectedObject.position.y})</span>
              </div>
              {selectedObject.description && (
                <p className="text-muted-foreground">{selectedObject.description}</p>
              )}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <Badge className={getConfidenceColor(selectedObject.confidence)}>
                  {selectedObject.confidence.toFixed(1)}% confidence
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Object List */}
        {objects.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Recognized Objects</h4>
            <div className="space-y-2">
              {objects.map((obj) => (
                <div 
                  key={obj.id} 
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedObject(obj)}
                >
                  <div className="flex items-center gap-3">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{obj.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {obj.location} • {obj.position.width}x{obj.position.height}px
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getConfidenceColor(obj.confidence)}>
                      {obj.confidence.toFixed(0)}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(obj.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isActive ? 'No objects detected' : 'Start camera to recognize objects'}
            </p>
          </div>
        )}

        {/* Recognition Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {objects.reduce((sum, obj) => sum + obj.confidence, 0) / Math.max(1, objects.length)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {objects.filter(obj => obj.confidence >= 90).length}
            </div>
            <div className="text-xs text-muted-foreground">High Confidence</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
