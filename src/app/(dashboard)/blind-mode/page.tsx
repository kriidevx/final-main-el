"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Volume2, Play, Pause, Navigation, Upload, FileText, Brain } from "lucide-react";
import CSVReader from "@/components/dashboard/CSVReader";

interface DetectedObject {
  id: string;
  name: string;
  confidence: number;
  position: { x: number; y: number; width: number; height: number };
  distance: number;
  timestamp: string;
}

interface CSVFile {
  id: string;
  name: string;
  data: any[];
  uploadedAt: string;
}

interface GeminiResponse {
  sentence: string;
  confidence: number;
  obstacles: string[];
  timestamp: string;
}

export default function BlindModePage() {
  const router = useRouter();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([]);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [geminiResponses, setGeminiResponses] = useState<GeminiResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const readingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-read functionality
    if (autoRead && csvData.length > 0 && !isProcessing) {
      readingIntervalRef.current = setInterval(() => {
        readNextRow();
      }, 5000); // Read every 5 seconds
    } else {
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
      }
    }

    return () => {
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
      }
    };
  }, [autoRead, csvData.length, isProcessing]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = volume / 100;
      utterance.rate = speechRate;
      utterance.onstart = () => setIsAudioPlaying(true);
      utterance.onend = () => setIsAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCSVDataLoaded = (files: CSVFile[]) => {
    console.log('📁 CSV Files loaded:', files);
    
    // Log CSV headers to debug mapping issues
    if (files.length > 0 && files[0].data.length > 0) {
      console.log('🔍 CSV HEADERS:', Object.keys(files[0].data[0]));
      console.log('📋 FIRST ROW DATA:', files[0].data[0]);
      console.log('📋 SECOND ROW DATA:', files[0].data[1]);
    }
    
    console.log('📊 File data samples:', files.map(f => ({
      name: f.name,
      rows: f.data.length,
      sampleRow: f.data[0]
    })));
    
    setCsvFiles(files);
    // Combine all CSV data for processing
    const allData = files.flatMap(file => file.data);
    console.log('📋 Combined CSV data (first 3 rows):', allData.slice(0, 3));
    setCsvData(allData);
    setCurrentRowIndex(0);
    speakText(`Loaded ${files.length} CSV files with ${allData.length} total obstacle detections.`);
  };

  const processWithGemini = async (rowData: any) => {
    if (!rowData) return null;

    try {
      setIsProcessing(true);
      
      console.log('🎯 Raw CSV row data:', rowData);
      
      // Map CSV headers correctly - handle both cases (Title Case and lowercase)
      const obstacle = rowData.Label || rowData.label || rowData.object || 'Unknown object';
      const confidence = parseFloat(rowData.Confidence || rowData.confidence || 0);
      const timestamp = rowData.Timestamp || rowData.timestamp || 'Unknown';
      const x1 = parseInt(rowData.X1 || rowData.x1 || 0);
      const y1 = parseInt(rowData.Y1 || rowData.y1 || 0);
      const x2 = parseInt(rowData.X2 || rowData.x2 || 0);
      const y2 = parseInt(rowData.Y2 || rowData.y2 || 0);
      
      const position = {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1
      };
      
      console.log('🔧 Mapped data:', {
        obstacle,
        confidence,
        timestamp,
        position
      });
      
      // Calculate distance based on object size (larger = closer)
      const objectArea = position.width * position.height;
      const maxArea = 640 * 480; // Assuming 640x480 resolution
      const normalizedSize = objectArea / maxArea;
      
      let distance = 'unknown';
      let urgency = 'low';
      
      if (normalizedSize > 0.3) {
        distance = 'very close';
        urgency = 'high';
      } else if (normalizedSize > 0.1) {
        distance = 'nearby';
        urgency = 'medium';
      } else if (normalizedSize > 0.05) {
        distance = 'moderate distance';
        urgency = 'low';
      } else {
        distance = 'far away';
        urgency = 'low';
      }
      
      // Create a structured prompt for Gemini with accurate data
      const prompt = `
        You are an AI assistant for visually impaired users. Analyze this obstacle detection data and provide a clear, helpful navigation description:
        
        ACCURATE DETECTION DATA:
        - Object Type: ${obstacle}
        - Confidence Level: ${(confidence * 100).toFixed(1)}%
        - Position: X=${position.x}, Y=${position.y}
        - Object Size: ${position.width} × ${position.height} pixels
        - Estimated Distance: ${distance}
        - Urgency Level: ${urgency}
        - Detection Time: ${timestamp}
        
        INSTRUCTIONS:
        1. Create a natural, spoken-friendly sentence describing what this means for navigation
        2. Include the confidence level and distance in simple terms
        3. Provide clear guidance on what action to take
        4. Keep sentences short and easy to understand
        5. Use urgency-appropriate language (calm for low, alert for high)
        
        Respond in JSON format exactly like this:
        {
          "sentence": "Clear navigation guidance sentence here",
          "confidence": ${confidence},
          "obstacles": ["${obstacle}"],
          "urgency": "${urgency}",
          "distance": "${distance}",
          "position": ${JSON.stringify(position)}
        }
      `;

      console.log('🎯 Processing CSV row with Gemini:', {
        obstacle,
        confidence: (confidence * 100).toFixed(1),
        position,
        distance,
        urgency
      });

      // Call Gemini API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          data: {
            obstacle,
            confidence,
            position,
            distance,
            urgency,
            timestamp
          }
        })
      });

      let geminiResponse: GeminiResponse;

      if (response.ok) {
        const geminiResult = await response.json();
        
        geminiResponse = {
          sentence: geminiResult.sentence || `${obstacle} detected with ${(confidence * 100).toFixed(1)}% confidence at ${distance}`,
          confidence: geminiResult.confidence || confidence,
          obstacles: geminiResult.obstacles || [obstacle],
          timestamp: new Date().toLocaleTimeString()
        };

        console.log('✅ Gemini AI Response:', geminiResponse);
      } else {
        // Fallback if Gemini API fails - create intelligent sentence based on data
        let sentence = '';
        
        if (urgency === 'high') {
          sentence = `⚠️ Alert: ${obstacle} detected very close at ${distance} with high confidence. Stop immediately and assess surroundings.`;
        } else if (urgency === 'medium') {
          sentence = `Caution: ${obstacle} detected nearby at ${distance} with ${(confidence * 100).toFixed(1)}% confidence. Proceed with care.`;
        } else {
          sentence = `Notice: ${obstacle} detected at ${distance} with ${(confidence * 100).toFixed(1)}% confidence. Continue monitoring.`;
        }
        
        geminiResponse = {
          sentence,
          confidence,
          obstacles: [obstacle],
          timestamp: new Date().toLocaleTimeString()
        };

        console.log('🔄 Using fallback response:', geminiResponse);
      }

      setGeminiResponses(prev => [geminiResponse, ...prev.slice(0, 9)]);
      
      // Speak the framed sentence
      speakText(geminiResponse.sentence);
      
      return geminiResponse;
    } catch (error) {
      console.error('❌ Error processing with Gemini:', error);
      
      // Enhanced fallback response with proper data extraction
      const obstacle = rowData.Label || rowData.label || rowData.object || 'Unknown object';
      const confidence = parseFloat(rowData.Confidence || rowData.confidence || 0);
      
      const fallbackResponse: GeminiResponse = {
        sentence: `Detection alert: ${obstacle} detected with ${(confidence * 100).toFixed(1)}% confidence. Please proceed with caution.`,
        confidence,
        obstacles: [obstacle],
        timestamp: new Date().toLocaleTimeString()
      };

      setGeminiResponses(prev => [fallbackResponse, ...prev.slice(0, 9)]);
      speakText(fallbackResponse.sentence);
      
      return fallbackResponse;
    } finally {
      setIsProcessing(false);
    }
  };

  const readNextRow = async () => {
    if (csvData.length === 0 || currentRowIndex >= csvData.length) {
      speakText("End of CSV data reached.");
      setAutoRead(false);
      return;
    }

    const rowData = csvData[currentRowIndex];
    await processWithGemini(rowData);
    setCurrentRowIndex(prev => prev + 1);
  };

  const readPreviousRow = async () => {
    if (currentRowIndex > 0) {
      const prevIndex = currentRowIndex - 1;
      const rowData = csvData[prevIndex];
      await processWithGemini(rowData);
      setCurrentRowIndex(prevIndex);
    }
  };

  const stopReading = () => {
    setAutoRead(false);
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
    }
  };

  const clearHistory = () => {
    setGeminiResponses([]);
    speakText("Reading history cleared.");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Blind Mode - Obstacle Detection</h1>
              <p className="text-muted-foreground">AI-powered navigation assistance with CSV data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push('/navigation')}
              className="flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Navigation Assist
            </Button>
            <Badge variant={csvData.length > 0 ? "default" : "secondary"} className="text-green-600">
              {csvData.length > 0 ? "Data Loaded" : "No Data"}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CSV Upload Section - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    CSV Data Upload & Preview
                  </div>
                  <Badge variant={autoRead ? "default" : "secondary"}>
                    {autoRead ? "Auto-Reading" : "Manual"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CSVReader 
                  onDataLoaded={handleCSVDataLoaded}
                  onObjectDetected={() => {}}
                />
                
                {csvData.length > 0 && (
                  <>
                    {/* CSV Preview Table */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">📋 CSV Data Preview</h3>
                      <div className="mb-2 text-xs text-gray-600">
                        Debug: Showing {csvData.length} rows from CSV files
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-3 py-2 text-left font-medium text-gray-700">Row</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700">Timestamp</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700">Obstacle</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700">Confidence</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700">Position</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700">Size</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {csvData.slice(0, 10).map((row, index) => (
                              <tr 
                                key={index} 
                                className={`border-b hover:bg-gray-100 ${
                                  index === currentRowIndex ? 'bg-blue-100 font-semibold' : ''
                                }`}
                              >
                                <td className="px-3 py-2">{index + 1}</td>
                                <td className="px-3 py-2">{row.Timestamp || row.timestamp || 'N/A'}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    (parseFloat(row.Confidence || row.confidence || 0) > 0.8) ? 'bg-red-100 text-red-800' :
                                    (parseFloat(row.Confidence || row.confidence || 0) > 0.6) ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {row.Label || row.label || row.object || 'Unknown'}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`font-medium ${
                                    (parseFloat(row.Confidence || row.confidence || 0) > 0.8) ? 'text-red-600' :
                                    (parseFloat(row.Confidence || row.confidence || 0) > 0.6) ? 'text-yellow-600' :
                                    'text-green-600'
                                  }`}>
                                    {(parseFloat(row.Confidence || row.confidence || 0) * 100).toFixed(1)}%
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-xs">
                                  ({parseInt(row.X1 || row.x1 || 0)}, {parseInt(row.Y1 || row.y1 || 0)})
                                </td>
                                <td className="px-3 py-2 text-xs">
                                  {(parseInt(row.X2 || row.x2 || 0) - parseInt(row.X1 || row.x1 || 0)) || 0} × {(parseInt(row.Y2 || row.y2 || 0) - parseInt(row.Y1 || row.y1 || 0)) || 0}
                                </td>
                                <td className="px-3 py-2">
                                  {index === currentRowIndex && (
                                    <Badge variant="default" className="text-xs">
                                      Reading
                                    </Badge>
                                  )}
                                  {index < currentRowIndex && (
                                    <Badge variant="secondary" className="text-xs">
                                      Read
                                    </Badge>
                                  )}
                                  {index > currentRowIndex && (
                                    <Badge variant="outline" className="text-xs">
                                      Pending
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {csvData.length > 10 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Showing first 10 rows of {csvData.length} total rows
                        </p>
                      )}
                      
                      {/* Debug Info */}
                      {csvData.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                          <p className="text-sm text-yellow-800">
                            ⚠️ No CSV data loaded. Please upload a CSV file with obstacle detection data.
                          </p>
                          <p className="text-xs text-yellow-600 mt-2">
                            Expected CSV format: timestamp, label, confidence, x1, y1, x2, y2
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Reading Progress */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-blue-800">Reading Progress</h3>
                        <div className="text-sm text-blue-600">
                          Row {currentRowIndex + 1} of {csvData.length}
                        </div>
                      </div>
                      
                      <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentRowIndex + 1) / csvData.length) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={readPreviousRow}
                          disabled={currentRowIndex === 0 || isProcessing}
                          variant="outline"
                          size="sm"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={readNextRow}
                          disabled={currentRowIndex >= csvData.length || isProcessing}
                          variant="default"
                          size="sm"
                        >
                          {isProcessing ? "Processing..." : "Read Next"}
                        </Button>
                        <Button
                          onClick={() => setAutoRead(!autoRead)}
                          variant={autoRead ? "destructive" : "outline"}
                          size="sm"
                        >
                          {autoRead ? "Stop Auto" : "Start Auto"}
                        </Button>
                        <Button
                          onClick={stopReading}
                          variant="outline"
                          size="sm"
                        >
                          <Pause className="w-4 h-4" />
                          Stop
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Gemini AI Analysis Box */}
            {geminiResponses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {geminiResponses.map((response, index) => (
                      <div key={`${response.timestamp}-${index}`} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 mb-2">
                              🎯 {response.sentence}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Obstacles:</span> {response.obstacles.join(', ')}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Confidence: {(response.confidence * 100).toFixed(1)}%</span>
                              <span>{response.timestamp}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => speakText(response.sentence)}
                            variant="outline"
                            size="sm"
                            className="ml-2"
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side Panel - 1 column */}
          <div className="space-y-4">
            {/* Audio Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio Guidance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant={isAudioPlaying ? "default" : "secondary"}>
                    {isAudioPlaying ? "Playing" : "Idle"}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Volume</span>
                    <span className="text-sm">{volume}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Speech Rate</span>
                    <span className="text-sm">{speechRate}x</span>
                  </div>
                  <Slider
                    value={[speechRate]}
                    onValueChange={(value) => setSpeechRate(value[0])}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="pt-3 border-t">
                  <Button
                    onClick={() => speakText("Audio guidance system test. All systems operational.")}
                    variant="outline"
                    className="w-full"
                  >
                    Test Audio
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>📁 CSV Files:</span>
                    <span className="font-medium">{csvFiles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📊 Total Rows:</span>
                    <span className="font-medium">{csvData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🧠 AI Analysis:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📖 Current Row:</span>
                    <span className="font-medium">{currentRowIndex + 1}/{csvData.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🔄 Auto-Read:</span>
                    <span className={`font-medium ${autoRead ? 'text-green-600' : 'text-gray-600'}`}>
                      {autoRead ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>🎯 AI Responses:</span>
                    <span className="font-medium">{geminiResponses.length}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t space-y-2">
                  <Button
                    onClick={clearHistory}
                    variant="outline"
                    className="w-full"
                    disabled={geminiResponses.length === 0}
                  >
                    Clear History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
