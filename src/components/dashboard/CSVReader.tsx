"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Trash2, Play, Volume2 } from 'lucide-react';
import Papa from 'papaparse';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CSVFile {
  id: string;
  name: string;
  data: any[];
  uploadedAt: string;
}

interface DetectedObject {
  id: string;
  name: string;
  confidence: number;
  position: { x: number; y: number; width: number; height: number };
  distance: number;
  timestamp: string;
}

interface CSVReaderProps {
  onDataLoaded: (data: CSVFile[]) => void;
  onObjectDetected: (object: DetectedObject) => void;
}

export default function CSVReader({ onDataLoaded, onObjectDetected }: CSVReaderProps) {
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CSVFile | null>(null);
  const [isReading, setIsReading] = useState(false);

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI('AIzaSyApJ4tEhag95ADlVeNFVjcpA-5E1mB6_e0');
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  }, []);

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    const newFiles: CSVFile[] = [];
    
    for (const file of files) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        try {
          const result = await new Promise<any[]>((resolve, reject) => {
            Papa.parse(file, {
              complete: (results: Papa.ParseResult<any>) => {
                console.log(`📄 Parsed CSV file: ${file.name}`);
                console.log('📋 Raw headers:', results.meta.fields);
                console.log('📊 First row:', results.data[0]);
                console.log('📊 Total rows:', results.data.length);
                resolve(results.data);
              },
              header: true,
              skipEmptyLines: true,
              error: (error: any) => reject(error)
            });
          });

          const csvFile: CSVFile = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            data: result,
            uploadedAt: new Date().toLocaleString()
          };
          
          newFiles.push(csvFile);
        } catch (error) {
          console.error('Error parsing CSV file:', error);
        }
      }
    }
    
    const updatedFiles = [...csvFiles, ...newFiles].slice(-5); // Keep only last 5 files
    setCsvFiles(updatedFiles);
    onDataLoaded(updatedFiles);
    setIsProcessing(false);
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = csvFiles.filter(file => file.id !== fileId);
    setCsvFiles(updatedFiles);
    onDataLoaded(updatedFiles);
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const analyzeCSVWithGemini = async (file: CSVFile) => {
    setIsReading(true);
    try {
      // Prepare CSV data for analysis
      const csvText = file.data.slice(0, 10).map(row => 
        Object.values(row).join(', ')
      ).join('\n');

      const prompt = `Analyze this CSV data and describe the objects detected with their confidence levels. 
      Format the response as a clear, spoken description for a visually impaired user:
      
      CSV Data:
      ${csvText}
      
      Please provide:
      1. What type of objects are detected
      2. Confidence levels for each detection
      3. Any patterns or important information
      Keep it concise and easy to understand.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Use speech synthesis to read the analysis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }

      // Create a mock detected object from the analysis
      const mockObject: DetectedObject = {
        id: Date.now().toString(),
        name: 'CSV Analysis Result',
        confidence: 0.95,
        position: { x: 0, y: 0, width: 100, height: 100 },
        distance: 2.5,
        timestamp: new Date().toLocaleString()
      };

      onObjectDetected(mockObject);
    } catch (error) {
      console.error('Error analyzing CSV with Gemini:', error);
    } finally {
      setIsReading(false);
    }
  };

  const speakObjectInfo = (object: any) => {
    if ('speechSynthesis' in window) {
      const text = `Detected ${object.name || 'object'} with confidence ${(object.confidence * 100).toFixed(1)} percent`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="border-border/40 backdrop-blur-xl bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          CSV Reader ({csvFiles.length}/5)
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-border/50 hover:border-border/80'
          } ${csvFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
            disabled={csvFiles.length >= 5}
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {csvFiles.length >= 5 
                ? 'Maximum 5 files reached' 
                : isProcessing 
                  ? 'Processing files...' 
                  : 'Drag & drop CSV files here or click to browse'
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum 5 files • CSV format only
            </p>
          </label>
        </div>

        {/* File List */}
        {csvFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files:</h4>
            {csvFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  selectedFile?.id === file.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border/30'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.data.length} rows • {file.uploadedAt}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedFile(file)}
                    className="h-8 w-8 p-0"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => analyzeCSVWithGemini(file)}
                    disabled={isReading}
                    className="h-8 w-8 p-0"
                  >
                    <Volume2 className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-black">Preview: {selectedFile.name}</h4>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2 text-xs">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {Object.keys(selectedFile.data[0] || {}).map((key) => (
                      <th key={key} className="text-left p-1 text-black font-semibold">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedFile.data.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="p-1 truncate text-black">{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="text-xs text-muted-foreground">
          <p>🤖 Gemini AI: Ready for analysis</p>
          <p>📊 Files: {csvFiles.length}/5 loaded</p>
          <p>🔊 Speech: {isReading ? 'Reading...' : 'Ready'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
