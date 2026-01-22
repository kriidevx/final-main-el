import numpy as np
import cv2
import librosa
from typing import Tuple, List, Dict, Any, Optional
import logging

class AudioPreprocessor:
    """Audio preprocessing utilities"""
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.logger = logging.getLogger(__name__)
    
    def normalize_audio(self, audio: np.ndarray) -> np.ndarray:
        """Normalize audio to [-1, 1] range"""
        if len(audio) == 0:
            return audio
        
        audio = audio.astype(np.float32)
        max_val = np.max(np.abs(audio))
        
        if max_val > 0:
            audio = audio / max_val
        
        return audio
    
    def remove_silence(self, audio: np.ndarray, 
                      threshold: float = 0.01, 
                      frame_length: int = 2048,
                      hop_length: int = 512) -> np.ndarray:
        """Remove silence from audio"""
        if len(audio) == 0:
            return audio
        
        # Compute RMS energy
        rms = librosa.feature.rms(
            y=audio, 
            frame_length=frame_length, 
            hop_length=hop_length
        )[0]
        
        # Find non-silent frames
        non_silent_frames = rms > threshold
        
        if not np.any(non_silent_frames):
            return audio
        
        # Find start and end of non-silent region
        start_frame = np.where(non_silent_frames)[0][0]
        end_frame = np.where(non_silent_frames)[0][-1]
        
        # Convert to sample indices
        start_sample = start_frame * hop_length
        end_sample = min(end_frame * hop_length + frame_length, len(audio))
        
        return audio[start_sample:end_sample]
    
    def apply_noise_reduction(self, audio: np.ndarray, 
                            noise_factor: float = 0.1) -> np.ndarray:
        """Simple noise reduction using spectral subtraction"""
        if len(audio) == 0:
            return audio
        
        # Compute STFT
        stft = librosa.stft(audio)
        magnitude = np.abs(stft)
        phase = np.angle(stft)
        
        # Estimate noise from first few frames
        noise_frames = 5
        noise_magnitude = np.mean(magnitude[:, :noise_frames], axis=1, keepdims=True)
        
        # Spectral subtraction
        clean_magnitude = magnitude - noise_factor * noise_magnitude
        clean_magnitude = np.maximum(clean_magnitude, 0.1 * magnitude)
        
        # Reconstruct audio
        clean_stft = clean_magnitude * np.exp(1j * phase)
        clean_audio = librosa.istft(clean_stft)
        
        return clean_audio
    
    def resample_audio(self, audio: np.ndarray, 
                      target_sr: int) -> np.ndarray:
        """Resample audio to target sample rate"""
        if len(audio) == 0:
            return audio
        
        return librosa.resample(audio, orig_sr=self.sample_rate, target_sr=target_sr)
    
    def apply_bandpass_filter(self, audio: np.ndarray,
                            low_freq: float = 80,
                            high_freq: float = 8000) -> np.ndarray:
        """Apply bandpass filter to audio"""
        if len(audio) == 0:
            return audio
        
        # Design bandpass filter
        nyquist = self.sample_rate / 2
        low = low_freq / nyquist
        high = high_freq / nyquist
        
        # Simple high-pass and low-pass filtering
        # In practice, you'd use scipy.signal for proper filtering
        return audio  # Placeholder
    
    def extract_mel_spectrogram(self, audio: np.ndarray,
                               n_mels: int = 128,
                               n_fft: int = 2048,
                               hop_length: int = 512) -> np.ndarray:
        """Extract mel spectrogram"""
        if len(audio) == 0:
            return np.array([])
        
        mel_spec = librosa.feature.melspectrogram(
            y=audio,
            sr=self.sample_rate,
            n_mels=n_mels,
            n_fft=n_fft,
            hop_length=hop_length
        )
        
        # Convert to log scale
        log_mel = librosa.power_to_db(mel_spec, ref=np.max)
        
        return log_mel
    
    def extract_mfcc(self, audio: np.ndarray,
                    n_mfcc: int = 13,
                    n_fft: int = 2048,
                    hop_length: int = 512) -> np.ndarray:
        """Extract MFCC features"""
        if len(audio) == 0:
            return np.array([])
        
        mfcc = librosa.feature.mfcc(
            y=audio,
            sr=self.sample_rate,
            n_mfcc=n_mfcc,
            n_fft=n_fft,
            hop_length=hop_length
        )
        
        return mfcc

class ImagePreprocessor:
    """Image preprocessing utilities"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def resize_image(self, image: np.ndarray, 
                     target_size: Tuple[int, int],
                     interpolation: int = cv2.INTER_LINEAR) -> np.ndarray:
        """Resize image to target size"""
        return cv2.resize(image, target_size, interpolation=interpolation)
    
    def normalize_image(self, image: np.ndarray, 
                       method: str = "minmax") -> np.ndarray:
        """Normalize image pixel values"""
        if method == "minmax":
            # Normalize to [0, 1]
            return image.astype(np.float32) / 255.0
        elif method == "standard":
            # Standardize (zero mean, unit variance)
            mean = np.mean(image)
            std = np.std(image)
            return (image - mean) / (std + 1e-8)
        else:
            return image
    
    def apply_histogram_equalization(self, image: np.ndarray) -> np.ndarray:
        """Apply histogram equalization"""
        if len(image.shape) == 3:
            # Convert to LAB color space
            lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
            lab[:, :, 0] = cv2.equalizeHist(lab[:, :, 0])
            return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        else:
            return cv2.equalizeHist(image)
    
    def apply_gaussian_blur(self, image: np.ndarray, 
                           kernel_size: int = 5) -> np.ndarray:
        """Apply Gaussian blur"""
        return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)
    
    def apply_edge_detection(self, image: np.ndarray,
                           low_threshold: int = 50,
                           high_threshold: int = 150) -> np.ndarray:
        """Apply Canny edge detection"""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image
        
        return cv2.Canny(gray, low_threshold, high_threshold)
    
    def remove_background(self, image: np.ndarray, 
                         method: str = "grabcut") -> np.ndarray:
        """Remove background from image"""
        if method == "grabcut":
            # Simple GrabCut implementation
            mask = np.zeros(image.shape[:2], np.uint8)
            bgd_model = np.zeros((1, 65), np.float64)
            fgd_model = np.zeros((1, 65), np.float64)
            
            # Define rectangle around object (center of image)
            h, w = image.shape[:2]
            rect = (w//4, h//4, w//2, h//2)
            
            cv2.grabCut(image, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
            
            # Create mask where background is 0, foreground is 1
            mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
            
            # Apply mask to image
            result = image * mask2[:, :, np.newaxis]
            
            return result
        
        return image
    
    def augment_image(self, image: np.ndarray) -> Dict[str, np.ndarray]:
        """Apply various augmentations to image"""
        augmented = {}
        
        # Original
        augmented['original'] = image
        
        # Horizontal flip
        augmented['horizontal_flip'] = cv2.flip(image, 1)
        
        # Rotation
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        matrix = cv2.getRotationMatrix2D(center, 15, 1.0)
        augmented['rotation'] = cv2.warpAffine(image, matrix, (w, h))
        
        # Brightness adjustment
        brightness_factor = 1.2
        augmented['brightness'] = np.clip(image * brightness_factor, 0, 255).astype(np.uint8)
        
        # Contrast adjustment
        contrast_factor = 1.2
        augmented['contrast'] = np.clip((image - 128) * contrast_factor + 128, 0, 255).astype(np.uint8)
        
        return augmented
    
    def detect_faces(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces in image"""
        try:
            # Load face cascade
            face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            else:
                gray = image
            
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            return [(x, y, w, h) for (x, y, w, h) in faces]
            
        except Exception as e:
            self.logger.error(f"Face detection error: {str(e)}")
            return []
    
    def crop_face(self, image: np.ndarray, 
                  face_bbox: Tuple[int, int, int, int],
                  padding: int = 20) -> np.ndarray:
        """Crop face region from image"""
        x, y, w, h = face_bbox
        
        # Add padding
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(image.shape[1] - x, w + 2 * padding)
        h = min(image.shape[0] - y, h + 2 * padding)
        
        return image[y:y+h, x:x+w]

class DataPreprocessor:
    """General data preprocessing utilities"""
    
    def __init__(self):
        self.audio_preprocessor = AudioPreprocessor()
        self.image_preprocessor = ImagePreprocessor()
        self.logger = logging.getLogger(__name__)
    
    def preprocess_audio_for_classification(self, audio: np.ndarray) -> np.ndarray:
        """Preprocess audio for classification models"""
        # Normalize
        audio = self.audio_preprocessor.normalize_audio(audio)
        
        # Remove silence
        audio = self.audio_preprocessor.remove_silence(audio)
        
        # Apply noise reduction
        audio = self.audio_preprocessor.apply_noise_reduction(audio)
        
        return audio
    
    def preprocess_audio_for_speech_recognition(self, audio: np.ndarray) -> np.ndarray:
        """Preprocess audio for speech recognition"""
        # Normalize
        audio = self.audio_preprocessor.normalize_audio(audio)
        
        # Apply bandpass filter for speech frequencies
        audio = self.audio_preprocessor.apply_bandpass_filter(audio, 80, 8000)
        
        return audio
    
    def preprocess_image_for_object_detection(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for object detection"""
        # Normalize
        image = self.image_preprocessor.normalize_image(image)
        
        return image
    
    def preprocess_image_for_face_recognition(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for face recognition"""
        # Detect and crop face
        faces = self.image_preprocessor.detect_faces(image)
        
        if faces:
            face_bbox = faces[0]  # Use first detected face
            face_image = self.image_preprocessor.crop_face(image, face_bbox)
            
            # Resize to standard size
            face_image = self.image_preprocessor.resize_image(face_image, (224, 224))
            
            # Normalize
            face_image = self.image_preprocessor.normalize_image(face_image)
            
            return face_image
        
        return image
    
    def batch_preprocess_audio(self, audio_list: List[np.ndarray],
                              target_length: Optional[int] = None) -> np.ndarray:
        """Preprocess batch of audio files"""
        processed_audio = []
        
        for audio in audio_list:
            # Preprocess individual audio
            processed = self.preprocess_audio_for_classification(audio)
            
            # Pad or truncate to target length
            if target_length:
                if len(processed) < target_length:
                    processed = np.pad(processed, (0, target_length - len(processed)))
                else:
                    processed = processed[:target_length]
            
            processed_audio.append(processed)
        
        return np.array(processed_audio)
    
    def batch_preprocess_images(self, image_list: List[np.ndarray],
                               target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
        """Preprocess batch of images"""
        processed_images = []
        
        for image in image_list:
            # Resize
            image = self.image_preprocessor.resize_image(image, target_size)
            
            # Normalize
            image = self.image_preprocessor.normalize_image(image)
            
            processed_images.append(image)
        
        return np.array(processed_images)

# Example usage
if __name__ == "__main__":
    preprocessor = DataPreprocessor()
    
    # Test audio preprocessing
    audio = np.random.randn(16000)  # 1 second of random audio
    processed_audio = preprocessor.preprocess_audio_for_classification(audio)
    print(f"Audio shape: {processed_audio.shape}")
    
    # Test image preprocessing
    image = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
    processed_image = preprocessor.preprocess_image_for_object_detection(image)
    print(f"Image shape: {processed_image.shape}")
    
    print("Preprocessor initialized successfully")
