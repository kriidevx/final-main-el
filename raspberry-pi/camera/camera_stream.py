import cv2
import numpy as np
import time
import logging
import threading
import queue
from typing import Dict, Optional, Callable, Tuple
from dataclasses import dataclass
import json
from pathlib import Path

@dataclass
class CameraConfig:
    """Camera configuration"""
    width: int = 640
    height: int = 480
    fps: int = 30
    brightness: float = 0.5
    contrast: float = 0.5
    saturation: float = 0.5
    auto_exposure: bool = True
    exposure: float = 0.0
    gain: float = 0.5
    white_balance: float = 0.5

@dataclass
class FrameInfo:
    """Frame information"""
    frame: np.ndarray
    timestamp: float
    frame_id: int
    resolution: Tuple[int, int]
    fps: float

class CameraStream:
    """Camera streaming system for Raspberry Pi"""
    
    def __init__(self, camera_id: int = 0, config: Optional[CameraConfig] = None):
        """Initialize camera stream"""
        self.camera_id = camera_id
        self.config = config or CameraConfig()
        
        # Camera state
        self.camera = None
        self.is_streaming = False
        self.capture_thread = None
        self.frame_queue = queue.Queue(maxsize=30)
        
        # Frame tracking
        self.frame_count = 0
        self.last_frame_time = 0
        self.current_fps = 0
        
        # Callbacks
        self.frame_callbacks = []
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        self.logger.info(f"Camera stream initialized for camera {camera_id}")
    
    def initialize_camera(self) -> bool:
        """Initialize camera with configuration"""
        try:
            # For Raspberry Pi, try picamera first, fallback to cv2
            try:
                import picamera
                import picamera.array
                
                self.camera = picamera.PiCamera()
                self.camera.resolution = (self.config.width, self.config.height)
                self.camera.framerate = self.config.fps
                self.camera.brightness = self.config.brightness
                self.camera.contrast = self.config.contrast
                self.camera.saturation = self.config.saturation
                
                if not self.config.auto_exposure:
                    self.camera.exposure_mode = 'off'
                    self.camera.exposure_compensation = int(self.config.exposure * 10)
                
                self.camera.awb_mode = 'auto'
                self.camera.shutter_speed = 0
                
                self.logger.info("PiCamera initialized successfully")
                return True
                
            except ImportError:
                # Fallback to OpenCV
                self.camera = cv2.VideoCapture(self.camera_id)
                
                if not self.camera.isOpened():
                    raise Exception("Could not open camera")
                
                # Set camera properties
                self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.config.width)
                self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.config.height)
                self.camera.set(cv2.CAP_PROP_FPS, self.config.fps)
                self.camera.set(cv2.CAP_PROP_BRIGHTNESS, self.config.brightness)
                self.camera.set(cv2.CAP_PROP_CONTRAST, self.config.contrast)
                self.camera.set(cv2.CAP_PROP_SATURATION, self.config.saturation)
                
                if not self.config.auto_exposure:
                    self.camera.set(cv2.CAP_PROP_AUTO_EXPOSURE, 0.25)  # Manual mode
                    self.camera.set(cv2.CAP_PROP_EXPOSURE, self.config.exposure)
                
                self.logger.info("OpenCV camera initialized successfully")
                return True
                
        except Exception as e:
            self.logger.error(f"Failed to initialize camera: {str(e)}")
            return False
    
    def start_stream(self) -> bool:
        """Start camera streaming"""
        if self.is_streaming:
            self.logger.warning("Camera is already streaming")
            return True
        
        if not self.initialize_camera():
            return False
        
        self.is_streaming = True
        self.frame_count = 0
        self.last_frame_time = time.time()
        
        self.capture_thread = threading.Thread(target=self._capture_worker)
        self.capture_thread.daemon = True
        self.capture_thread.start()
        
        self.logger.info("Camera streaming started")
        return True
    
    def stop_stream(self):
        """Stop camera streaming"""
        self.is_streaming = False
        
        if self.capture_thread and self.capture_thread.is_alive():
            self.capture_thread.join(timeout=2)
        
        if self.camera:
            if hasattr(self.camera, 'close'):
                self.camera.close()
            else:
                self.camera.release()
            self.camera = None
        
        self.logger.info("Camera streaming stopped")
    
    def _capture_worker(self):
        """Worker thread for frame capture"""
        try:
            if hasattr(self.camera, 'capture_continuous'):
                # PiCamera capture
                self._picamera_capture_worker()
            else:
                # OpenCV capture
                self._opencv_capture_worker()
        except Exception as e:
            self.logger.error(f"Capture worker error: {str(e)}")
    
    def _picamera_capture_worker(self):
        """PiCamera capture worker"""
        import picamera.array
        
        with picamera.array.PiRGBArray(self.camera, size=(self.config.width, self.config.height)) as stream:
            for _ in self.camera.capture_continuous(stream, format='bgr', use_video_port=True):
                if not self.is_streaming:
                    break
                
                frame = stream.array
                self._process_frame(frame)
                
                stream.truncate(0)
                stream.seek(0)
    
    def _opencv_capture_worker(self):
        """OpenCV capture worker"""
        while self.is_streaming:
            ret, frame = self.camera.read()
            
            if not ret:
                self.logger.warning("Failed to capture frame")
                time.sleep(0.01)
                continue
            
            self._process_frame(frame)
    
    def _process_frame(self, frame: np.ndarray):
        """Process captured frame"""
        current_time = time.time()
        
        # Calculate FPS
        if self.last_frame_time > 0:
            frame_time = current_time - self.last_frame_time
            self.current_fps = 1.0 / frame_time if frame_time > 0 else 0
        
        self.last_frame_time = current_time
        self.frame_count += 1
        
        # Create frame info
        frame_info = FrameInfo(
            frame=frame,
            timestamp=current_time,
            frame_id=self.frame_count,
            resolution=(frame.shape[1], frame.shape[0]),
            fps=self.current_fps
        )
        
        # Add to queue
        try:
            self.frame_queue.put_nowait(frame_info)
        except queue.Full:
            # Remove oldest frame
            try:
                self.frame_queue.get_nowait()
                self.frame_queue.put_nowait(frame_info)
            except queue.Empty:
                pass
        
        # Call callbacks
        for callback in self.frame_callbacks:
            try:
                callback(frame_info)
            except Exception as e:
                self.logger.error(f"Frame callback error: {str(e)}")
    
    def get_frame(self, timeout: float = 1.0) -> Optional[FrameInfo]:
        """Get latest frame"""
        try:
            return self.frame_queue.get(timeout=timeout)
        except queue.Empty:
            return None
    
    def get_latest_frame(self) -> Optional[FrameInfo]:
        """Get latest frame without blocking"""
        try:
            # Clear queue and get latest
            latest_frame = None
            while not self.frame_queue.empty():
                latest_frame = self.frame_queue.get_nowait()
            return latest_frame
        except queue.Empty:
            return None
    
    def add_frame_callback(self, callback: Callable[[FrameInfo], None]):
        """Add frame processing callback"""
        self.frame_callbacks.append(callback)
    
    def remove_frame_callback(self, callback: Callable[[FrameInfo], None]):
        """Remove frame processing callback"""
        if callback in self.frame_callbacks:
            self.frame_callbacks.remove(callback)
    
    def update_config(self, new_config: CameraConfig):
        """Update camera configuration"""
        self.config = new_config
        
        if self.camera:
            try:
                if hasattr(self.camera, 'resolution'):
                    # PiCamera
                    self.camera.resolution = (new_config.width, new_config.height)
                    self.camera.framerate = new_config.fps
                    self.camera.brightness = new_config.brightness
                    self.camera.contrast = new_config.contrast
                    self.camera.saturation = new_config.saturation
                else:
                    # OpenCV
                    self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, new_config.width)
                    self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, new_config.height)
                    self.camera.set(cv2.CAP_PROP_FPS, new_config.fps)
                    self.camera.set(cv2.CAP_PROP_BRIGHTNESS, new_config.brightness)
                    self.camera.set(cv2.CAP_PROP_CONTRAST, new_config.contrast)
                    self.camera.set(cv2.CAP_PROP_SATURATION, new_config.saturation)
                
                self.logger.info("Camera configuration updated")
                
            except Exception as e:
                self.logger.error(f"Failed to update config: {str(e)}")
    
    def get_camera_info(self) -> Dict:
        """Get camera information"""
        info = {
            'camera_id': self.camera_id,
            'is_streaming': self.is_streaming,
            'config': {
                'width': self.config.width,
                'height': self.config.height,
                'fps': self.config.fps,
                'brightness': self.config.brightness,
                'contrast': self.config.contrast,
                'saturation': self.config.saturation,
                'auto_exposure': self.config.auto_exposure
            },
            'current_fps': self.current_fps,
            'frame_count': self.frame_count,
            'queue_size': self.frame_queue.qsize()
        }
        
        if self.camera:
            if hasattr(self.camera, 'revision'):
                info['camera_type'] = 'picamera'
                info['camera_revision'] = self.camera.revision
            else:
                info['camera_type'] = 'opencv'
                info['backend'] = self.camera.getBackendName()
        
        return info
    
    def capture_photo(self, filename: str, quality: int = 95) -> bool:
        """Capture single photo"""
        try:
            frame_info = self.get_latest_frame()
            
            if frame_info:
                frame = frame_info.frame
                
                # Save image
                if filename.lower().endswith('.jpg') or filename.lower().endswith('.jpeg'):
                    cv2.imwrite(filename, frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
                elif filename.lower().endswith('.png'):
                    cv2.imwrite(filename, frame, [cv2.IMWRITE_PNG_COMPRESSION, 9])
                else:
                    cv2.imwrite(filename, frame)
                
                self.logger.info(f"Photo saved to {filename}")
                return True
            else:
                self.logger.error("No frame available for photo capture")
                return False
                
        except Exception as e:
            self.logger.error(f"Failed to capture photo: {str(e)}")
            return False
    
    def start_recording(self, filename: str, codec: str = 'XVID') -> bool:
        """Start video recording"""
        try:
            frame_info = self.get_latest_frame()
            
            if frame_info:
                frame = frame_info.frame
                height, width = frame.shape[:2]
                
                fourcc = cv2.VideoWriter_fourcc(*codec)
                video_writer = cv2.VideoWriter(
                    filename, fourcc, self.config.fps, (width, height)
                )
                
                if video_writer.isOpened():
                    self.video_writer = video_writer
                    self.is_recording = True
                    self.recording_filename = filename
                    
                    # Add recording callback
                    self.add_frame_callback(self._recording_callback)
                    
                    self.logger.info(f"Recording started: {filename}")
                    return True
                else:
                    self.logger.error("Failed to open video writer")
                    return False
            else:
                self.logger.error("No frame available for recording")
                return False
                
        except Exception as e:
            self.logger.error(f"Failed to start recording: {str(e)}")
            return False
    
    def _recording_callback(self, frame_info: FrameInfo):
        """Callback for video recording"""
        if self.is_recording and hasattr(self, 'video_writer'):
            self.video_writer.write(frame_info.frame)
    
    def stop_recording(self) -> bool:
        """Stop video recording"""
        try:
            if hasattr(self, 'is_recording') and self.is_recording:
                self.is_recording = False
                
                # Remove recording callback
                # Note: This is simplified - you'd need to track the callback properly
                
                if hasattr(self, 'video_writer'):
                    self.video_writer.release()
                    del self.video_writer
                
                self.logger.info(f"Recording stopped: {getattr(self, 'recording_filename', 'unknown')}")
                return True
            else:
                self.logger.warning("No active recording")
                return False
                
        except Exception as e:
            self.logger.error(f"Failed to stop recording: {str(e)}")
            return False
    
    def get_stream_stats(self) -> Dict:
        """Get streaming statistics"""
        return {
            'frames_captured': self.frame_count,
            'current_fps': self.current_fps,
            'target_fps': self.config.fps,
            'queue_size': self.frame_queue.qsize(),
            'dropped_frames': max(0, self.frame_count - self.frame_queue.qsize()),
            'average_frame_time': (time.time() - self.last_frame_time) / max(1, self.frame_count) if self.frame_count > 0 else 0
        }

# Example usage
if __name__ == "__main__":
    try:
        # Initialize camera
        config = CameraConfig(width=640, height=480, fps=30)
        camera = CameraStream(camera_id=0, config=config)
        
        # Start streaming
        if camera.start_stream():
            print("Camera streaming started")
            
            # Capture some frames
            for i in range(30):
                frame_info = camera.get_frame(timeout=1.0)
                
                if frame_info:
                    print(f"Frame {frame_info.frame_id}: {frame_info.resolution} @ {frame_info.fps:.1f}fps")
                    
                    # Save a photo every 10 frames
                    if i % 10 == 0:
                        camera.capture_photo(f"test_photo_{i}.jpg")
                else:
                    print("No frame received")
                
                time.sleep(0.1)
            
            # Get camera info
            info = camera.get_camera_info()
            print(f"Camera info: {info}")
            
            # Get streaming stats
            stats = camera.get_stream_stats()
            print(f"Streaming stats: {stats}")
            
            # Stop streaming
            camera.stop_stream()
        
    except KeyboardInterrupt:
        print("Stopping...")
        camera.stop_stream()
    except Exception as e:
        print(f"Error: {str(e)}")
        if 'camera' in locals():
            camera.stop_stream()
