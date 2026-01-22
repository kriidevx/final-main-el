import os
import json
import logging
from typing import Dict, Any, Optional
import importlib.util
import torch
import tensorflow as tf
import numpy as np
from pathlib import Path

class ModelLoader:
    """Universal model loader for different ML frameworks"""
    
    def __init__(self, models_dir="models"):
        """Initialize model loader"""
        self.models_dir = Path(models_dir)
        self.loaded_models = {}
        self.model_configs = {}
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Create models directory if it doesn't exist
        self.models_dir.mkdir(exist_ok=True)
    
    def load_model_config(self, config_path: str) -> Dict[str, Any]:
        """Load model configuration from JSON file"""
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            return config
        except Exception as e:
            self.logger.error(f"Error loading config {config_path}: {str(e)}")
            return {}
    
    def load_pytorch_model(self, model_path: str, config: Optional[Dict] = None) -> Any:
        """Load PyTorch model"""
        try:
            if config and 'model_class' in config:
                # Load custom model class
                module_path = config.get('module_path')
                class_name = config['model_class']
                
                if module_path and class_name:
                    spec = importlib.util.spec_from_file_location(
                        class_name, module_path
                    )
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    
                    model_class = getattr(module, class_name)
                    model = model_class(**config.get('model_args', {}))
                    
                    # Load state dict
                    state_dict_path = config.get('state_dict_path', model_path)
                    if os.path.exists(state_dict_path):
                        state_dict = torch.load(state_dict_path, map_location='cpu')
                        model.load_state_dict(state_dict)
                    
                    return model
            
            # Load standard PyTorch model
            model = torch.load(model_path, map_location='cpu')
            
            # Set to evaluation mode
            if hasattr(model, 'eval'):
                model.eval()
            
            return model
            
        except Exception as e:
            self.logger.error(f"Error loading PyTorch model {model_path}: {str(e)}")
            return None
    
    def load_tensorflow_model(self, model_path: str, config: Optional[Dict] = None) -> Any:
        """Load TensorFlow/Keras model"""
        try:
            if model_path.endswith('.h5') or model_path.endswith('.keras'):
                # Load Keras model
                model = tf.keras.models.load_model(model_path)
            elif os.path.isdir(model_path):
                # Load SavedModel
                model = tf.saved_model.load(model_path)
            else:
                # Try loading as TensorFlow Lite
                interpreter = tf.lite.Interpreter(model_path=model_path)
                interpreter.allocate_tensors()
                model = interpreter
            
            return model
            
        except Exception as e:
            self.logger.error(f"Error loading TensorFlow model {model_path}: {str(e)}")
            return None
    
    def load_sklearn_model(self, model_path: str, config: Optional[Dict] = None) -> Any:
        """Load scikit-learn model"""
        try:
            import joblib
            model = joblib.load(model_path)
            return model
        except Exception as e:
            self.logger.error(f"Error loading scikit-learn model {model_path}: {str(e)}")
            return None
    
    def load_onnx_model(self, model_path: str, config: Optional[Dict] = None) -> Any:
        """Load ONNX model"""
        try:
            import onnxruntime as ort
            session = ort.InferenceSession(model_path)
            return session
        except Exception as e:
            self.logger.error(f"Error loading ONNX model {model_path}: {str(e)}")
            return None
    
    def load_custom_model(self, model_path: str, config: Optional[Dict] = None) -> Any:
        """Load custom model"""
        try:
            if config and 'loader_function' in config:
                # Use custom loader function
                module_path = config.get('module_path')
                function_name = config['loader_function']
                
                if module_path and function_name:
                    spec = importlib.util.spec_from_file_location(
                        function_name, module_path
                    )
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    
                    loader_func = getattr(module, function_name)
                    return loader_func(model_path, config)
            
            # Try to import as Python module
            spec = importlib.util.spec_from_file_location("model", model_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Look for a class or function
            if hasattr(module, 'Model'):
                return module.Model()
            elif hasattr(module, 'load_model'):
                return module.load_model()
            else:
                return module
            
        except Exception as e:
            self.logger.error(f"Error loading custom model {model_path}: {str(e)}")
            return None
    
    def load_model(self, model_name: str, model_type: str = "auto", 
                  config_path: Optional[str] = None) -> Any:
        """Load model by name and type"""
        try:
            # Check if already loaded
            if model_name in self.loaded_models:
                return self.loaded_models[model_name]
            
            # Load configuration
            config = {}
            if config_path and os.path.exists(config_path):
                config = self.load_model_config(config_path)
            
            # Determine model path
            model_path = config.get('model_path', model_name)
            if not os.path.isabs(model_path):
                model_path = self.models_dir / model_path
            
            # Determine model type
            if model_type == "auto":
                model_type = self._detect_model_type(model_path)
            
            # Load model based on type
            if model_type == "pytorch":
                model = self.load_pytorch_model(str(model_path), config)
            elif model_type == "tensorflow":
                model = self.load_tensorflow_model(str(model_path), config)
            elif model_type == "sklearn":
                model = self.load_sklearn_model(str(model_path), config)
            elif model_type == "onnx":
                model = self.load_onnx_model(str(model_path), config)
            elif model_type == "custom":
                model = self.load_custom_model(str(model_path), config)
            else:
                raise ValueError(f"Unsupported model type: {model_type}")
            
            if model is not None:
                self.loaded_models[model_name] = model
                self.model_configs[model_name] = config
                
                self.logger.info(f"Loaded model {model_name} ({model_type})")
                return model
            else:
                raise Exception("Model loading failed")
                
        except Exception as e:
            self.logger.error(f"Error loading model {model_name}: {str(e)}")
            return None
    
    def _detect_model_type(self, model_path: str) -> str:
        """Detect model type from file extension and content"""
        model_path = str(model_path)
        
        if model_path.endswith(('.pt', '.pth', '.pkl')):
            return "pytorch"
        elif model_path.endswith(('.h5', '.keras')) or os.path.isdir(model_path):
            return "tensorflow"
        elif model_path.endswith(('.joblib', '.pkl')):
            return "sklearn"
        elif model_path.endswith('.onnx'):
            return "onnx"
        elif model_path.endswith('.py'):
            return "custom"
        else:
            # Try to detect by content
            try:
                with open(model_path, 'rb') as f:
                    content = f.read(100)
                    
                if b'PK' in content:  # ZIP file (could be SavedModel)
                    return "tensorflow"
                elif b'numpy' in content or b'sklearn' in content:
                    return "sklearn"
                else:
                    return "custom"
            except:
                return "custom"
    
    def get_model(self, model_name: str) -> Any:
        """Get loaded model"""
        return self.loaded_models.get(model_name)
    
    def get_model_config(self, model_name: str) -> Dict[str, Any]:
        """Get model configuration"""
        return self.model_configs.get(model_name, {})
    
    def unload_model(self, model_name: str) -> bool:
        """Unload model from memory"""
        try:
            if model_name in self.loaded_models:
                model = self.loaded_models[model_name]
                
                # Cleanup based on model type
                if hasattr(model, 'cpu'):
                    model.cpu()
                elif hasattr(model, 'close'):
                    model.close()
                
                del self.loaded_models[model_name]
                if model_name in self.model_configs:
                    del self.model_configs[model_name]
                
                # Clear CUDA cache if using PyTorch
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                
                self.logger.info(f"Unloaded model {model_name}")
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error unloading model {model_name}: {str(e)}")
            return False
    
    def list_loaded_models(self) -> list:
        """List all loaded models"""
        return list(self.loaded_models.keys())
    
    def get_model_info(self, model_name: str) -> Dict[str, Any]:
        """Get information about a loaded model"""
        try:
            model = self.get_model(model_name)
            if model is None:
                return {}
            
            config = self.get_model_config(model_name)
            
            info = {
                'name': model_name,
                'type': config.get('model_type', 'unknown'),
                'loaded': True,
                'memory_usage': self._get_model_memory_usage(model),
                'parameters': self._get_model_parameters(model)
            }
            
            return info
            
        except Exception as e:
            self.logger.error(f"Error getting model info {model_name}: {str(e)}")
            return {}
    
    def _get_model_memory_usage(self, model: Any) -> Dict[str, Any]:
        """Get memory usage of model"""
        try:
            if hasattr(model, 'parameters'):
                # PyTorch model
                param_size = 0
                buffer_size = 0
                
                for param in model.parameters():
                    param_size += param.nelement() * param.element_size()
                
                for buffer in model.buffers():
                    buffer_size += buffer.nelement() * buffer.element_size()
                
                return {
                    'parameters_mb': param_size / (1024 ** 2),
                    'buffers_mb': buffer_size / (1024 ** 2),
                    'total_mb': (param_size + buffer_size) / (1024 ** 2)
                }
            
            return {'total_mb': 'unknown'}
            
        except Exception:
            return {'total_mb': 'unknown'}
    
    def _get_model_parameters(self, model: Any) -> Dict[str, Any]:
        """Get parameter count of model"""
        try:
            if hasattr(model, 'parameters'):
                # PyTorch model
                total_params = sum(p.numel() for p in model.parameters())
                trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
                
                return {
                    'total': total_params,
                    'trainable': trainable_params,
                    'non_trainable': total_params - trainable_params
                }
            
            return {'total': 'unknown'}
            
        except Exception:
            return {'total': 'unknown'}
    
    def cleanup(self):
        """Cleanup all loaded models"""
        try:
            for model_name in list(self.loaded_models.keys()):
                self.unload_model(model_name)
            
            self.logger.info("Model loader cleaned up")
            
        except Exception as e:
            self.logger.error(f"Cleanup error: {str(e)}")

# Global model loader instance
model_loader = ModelLoader()

# Example usage
if __name__ == "__main__":
    loader = ModelLoader()
    
    # Example: Load a PyTorch model
    # model = loader.load_model("yolov8n", "pytorch", "config.json")
    
    # Example: Load a TensorFlow model
    # model = loader.load_model("isl_mlp_model.h5", "tensorflow")
    
    print("Model loader initialized")
    print(f"Loaded models: {loader.list_loaded_models()}")
    
    loader.cleanup()
