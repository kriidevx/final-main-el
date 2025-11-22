// Sign Language Detection Client

export interface SignLanguageDetection {
  detected_sign: string | null;
  confidence: number;
  landmarks: any[];
  timestamp: string;
}

export interface SignLanguageResponse {
  success: boolean;
  detected_sign: string | null;
  confidence: number;
  landmarks: any[];
  timestamp: string;
}

class SignLanguageClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '/api/ml-inference/sign-language';
  }

  async detect(image: string): Promise<SignLanguageResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image })
      });

      if (!response.ok) {
        throw new Error(`Sign language detection failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Sign language detection error:', error);
      throw error;
    }
  }

  async detectFromVideoFrame(
    videoElement: HTMLVideoElement
  ): Promise<SignLanguageResponse> {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(videoElement, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    return this.detect(imageData);
  }

  async detectBatch(frames: string[]): Promise<SignLanguageResponse[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frames })
      });

      if (!response.ok) {
        throw new Error('Batch detection failed');
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Batch detection error:', error);
      throw error;
    }
  }

  async getStatus(): Promise<{
    status: string;
    model: string;
    available_signs: string[];
  }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to get sign language model status');
      }

      return await response.json();
    } catch (error) {
      console.error('Sign language status error:', error);
      return {
        status: 'offline',
        model: 'unknown',
        available_signs: []
      };
    }
  }

  // Helper to build phrase from continuous detection
  buildPhrase(detections: SignLanguageDetection[]): string {
    return detections
      .filter(d => d.detected_sign && d.confidence > 0.7)
      .map(d => d.detected_sign)
      .join('');
  }

  // Real-time detection stream handler
  async startDetectionStream(
    videoElement: HTMLVideoElement,
    onDetection: (detection: SignLanguageResponse) => void,
    intervalMs: number = 1000
  ): Promise<() => void> {
    let isActive = true;

    const detectLoop = async () => {
      while (isActive) {
        try {
          const detection = await this.detectFromVideoFrame(videoElement);
          onDetection(detection);
        } catch (error) {
          console.error('Detection stream error:', error);
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    };

    detectLoop();

    // Return stop function
    return () => {
      isActive = false;
    };
  }
}

export const signLanguageClient = new SignLanguageClient();
export default SignLanguageClient;