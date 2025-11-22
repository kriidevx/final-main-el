// Raspberry Pi Stream Client

export interface SensorData {
  ultrasonic_front: { distance: number; unit: string };
  ultrasonic_left: { distance: number; unit: string };
  ultrasonic_right: { distance: number; unit: string };
  ldr: { intensity: number; unit: string };
  timestamp: string;
}

export interface RaspberryPiStatus {
  status: string;
  ip: string;
  uptime: string;
  lastSeen: string;
}

class RaspberryPiClient {
  private baseUrl: string;
  private streamUrl: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '/api/raspberry-pi';
  }

  async getStatus(): Promise<RaspberryPiStatus> {
    try {
      const response = await fetch(`${this.baseUrl}?action=status`);
      
      if (!response.ok) {
        throw new Error('Failed to get Raspberry Pi status');
      }

      return await response.json();
    } catch (error) {
      console.error('Raspberry Pi status error:', error);
      return {
        status: 'offline',
        ip: 'unknown',
        uptime: '0m',
        lastSeen: new Date().toISOString()
      };
    }
  }

  async getStreamUrl(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?action=stream`);
      
      if (!response.ok) {
        throw new Error('Failed to get stream URL');
      }

      const data = await response.json();
      this.streamUrl = data.streamUrl;
      return data.streamUrl;
    } catch (error) {
      console.error('Stream URL error:', error);
      throw error;
    }
  }

  async startStream(): Promise<{ success: boolean; streamId: number }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'start_stream'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start stream');
      }

      return await response.json();
    } catch (error) {
      console.error('Start stream error:', error);
      throw error;
    }
  }

  async stopStream(): Promise<{ success: boolean }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'stop_stream'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to stop stream');
      }

      return await response.json();
    } catch (error) {
      console.error('Stop stream error:', error);
      throw error;
    }
  }

  async captureFrame(): Promise<{ success: boolean; frameUrl: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'capture_frame'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to capture frame');
      }

      return await response.json();
    } catch (error) {
      console.error('Capture frame error:', error);
      throw error;
    }
  }

  async getSensorData(): Promise<SensorData> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'get_sensors'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get sensor data');
      }

      const data = await response.json();
      return data.sensors;
    } catch (error) {
      console.error('Sensor data error:', error);
      throw error;
    }
  }

  // Poll sensor data at regular intervals
  startSensorPolling(
    onData: (data: SensorData) => void,
    intervalMs: number = 1000
  ): () => void {
    let isActive = true;

    const pollLoop = async () => {
      while (isActive) {
        try {
          const data = await this.getSensorData();
          onData(data);
        } catch (error) {
          console.error('Sensor polling error:', error);
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    };

    pollLoop();

    // Return stop function
    return () => {
      isActive = false;
    };
  }

  // Connect to WebSocket for real-time data
  connectWebSocket(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ): WebSocket | null {
    if (!this.streamUrl) {
      console.error('Stream URL not set. Call getStreamUrl() first.');
      return null;
    }

    try {
      const ws = new WebSocket(this.streamUrl);

      ws.onopen = () => {
        console.log('WebSocket connected to Raspberry Pi');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected from Raspberry Pi');
      };

      return ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return null;
    }
  }
}

export const raspberryPiClient = new RaspberryPiClient();
export default RaspberryPiClient;