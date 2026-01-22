import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
import pickle
import time
from collections import deque, Counter

# ===================== CONFIG & LOAD =====================
import os

# ===================== CONFIG & LOAD =====================
# Get directory of this script to ensure paths work regardless of CWD of terminal
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "isl_mlp_model.h5")
LABEL_ENCODER_PATH = os.path.join(SCRIPT_DIR, "label_encoder(1).pkl")

# Accuracy Thresholds
CONFIDENCE_THRESHOLD = 0.75   # High confidence required
STABILITY_FRAMES = 5          # Number of consistent frames needed for "stable" state
HOLD_TO_TYPE_DURATION = 1.0   # Seconds to hold a sign before it is typed

# UI Colors (BGR)
COLOR_BG = (30, 30, 30)
COLOR_TEXT = (255, 255, 255)
COLOR_ACCENT = (0, 255, 217)  # Cyan
COLOR_WARN = (0, 165, 255)    # Orange

print("Loading Model...")
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    le = pickle.load(open(LABEL_ENCODER_PATH, "rb"))
    CLASSES = le.classes_
    print(f"Model Loaded. Classes: {CLASSES}")
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

# ===================== MEDIAPIPE SETUP =====================
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# ===================== HELPERS =====================
def extract_features(frame):
    """
    Extracts 126 landmarks (x, y, z) for up to 2 hands.
    If only 1 hand, pads with zeros.
    """
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)
    
    features = []
    if result.multi_hand_landmarks:
        # Note: We take up to 2 hands. 
        # Ideally, we should sort by x-position to be consistent (Left-Right), 
        # but for now we follow the training data pattern (likely detection order).
        for hand_landmarks in result.multi_hand_landmarks[:2]:
            for lm in hand_landmarks.landmark:
                features.extend([lm.x, lm.y, lm.z])
    
    # Pad to 126 features if needed (42 landmarks * 3 coords = 126)
    target_len = 126
    while len(features) < target_len:
        features.extend([0.0] * 3) # Pad with zeros
        
    return np.array(features[:target_len]).reshape(1, -1), result

def draw_info(frame, predicted_char, confidence, sentence, typing_progress):
    h, w, _ = frame.shape
    
    # 1. Overlay setup
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 100), COLOR_BG, -1)     # Top Bar
    cv2.rectangle(overlay, (0, h-80), (w, h), COLOR_BG, -1)    # Bottom Bar
    cv2.addWeighted(overlay, 0.8, frame, 0.2, 0, frame)
    
    # 2. Predicted Character (Top Left)
    text = f"Sign: {predicted_char}"
    cv2.putText(frame, text, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, COLOR_ACCENT, 3)
    
    # 3. Confidence (Top Left - smaller)
    conf_text = f"Conf: {confidence:.0%}"
    color = (0, 255, 0) if confidence > CONFIDENCE_THRESHOLD else (0, 0, 255)
    cv2.putText(frame, conf_text, (20, 85), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    
    # 4. Typing Progress Bar (Top, below sign)
    bar_width = 300
    bar_height = 10
    bar_x = 20
    bar_y = 95
    
    # Background
    cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (50,50,50), -1)
    # Fill
    fill_width = int(bar_width * typing_progress)
    cv2.rectangle(frame, (bar_x, bar_y), (bar_x + fill_width, bar_y + bar_height), COLOR_ACCENT, -1)
    
    if typing_progress >= 1.0:
        cv2.putText(frame, "TYPED!", (bar_x + bar_width + 10, bar_y + 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLOR_ACCENT, 2)

    # 5. Sentence (Bottom)
    cv2.putText(frame, f"Sentence: {sentence}", (20, h - 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, COLOR_TEXT, 2)

# ===================== MAIN LOOP =====================
cap = cv2.VideoCapture(0)

sentence = ""
current_word = ""

# State variables
raw_predictions = deque(maxlen=STABILITY_FRAMES)
stable_sign = None
stable_sign_start_time = 0
last_typed_time = 0

print("Starting Real-Time Recognition...")
print("Press 'q' to quit.")
print("Press 'c' to clear sentence.")

while True:
    ret, frame = cap.read()
    if not ret: break
    
    frame = cv2.flip(frame, 1) # Mirror view
    
    # 1. Feature Extraction
    features, result = extract_features(frame)
    
    current_pred = "..."
    current_conf = 0.0
    
    if result.multi_hand_landmarks:
        # Draw Hands
        for hand_landmarks in result.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            
        # Predict
        probs = model.predict(features, verbose=0)[0]
        idx = np.argmax(probs)
        current_conf = probs[idx]
        
        if current_conf > CONFIDENCE_THRESHOLD:
            current_pred = CLASSES[idx]
        else:
            current_pred = "..."
    else:
        current_pred = "..."

    # 2. Stability Logic (Filter Jitter)
    raw_predictions.append(current_pred)
    
    # Get most common prediction in window
    counts = Counter(raw_predictions)
    most_common, count = counts.most_common(1)[0]
    
    # If dominant (e.g., 4/5 frames), consider it "stable candidate"
    if count >= (STABILITY_FRAMES * 0.8) and most_common != "...":
        candidate_sign = most_common
    else:
        candidate_sign = None
        
    # 3. Hold-to-Type Logic
    elapsed = 0
    progress_val = 0.0
    
    if candidate_sign:
        if candidate_sign == stable_sign:
            # Holding the same sign
            elapsed = time.time() - stable_sign_start_time
            progress_val = min(elapsed / HOLD_TO_TYPE_DURATION, 1.0)
            
            if elapsed >= HOLD_TO_TYPE_DURATION:
                # TYPE IT (Once)
                if time.time() - last_typed_time > 1.0: # Prevent rapid fire after lock
                    if candidate_sign == "SPACE":
                        sentence += " "
                    elif candidate_sign == "DELETE":
                        sentence = sentence[:-1]
                    else:
                        sentence += candidate_sign
                    
                    last_typed_time = time.time()
                    stable_sign_start_time = time.time() # Reset timer so you have to release or hold again? 
                    # UX Choice: Reset timer effectively forces "Release to type next". 
                    # Or keep typing if hold? Usually release is safer.
                    progress_val = 0.0 # Visual reset
        else:
            # New sign detected
            stable_sign = candidate_sign
            stable_sign_start_time = time.time()
            progress_val = 0.0
    else:
        # No stable sign (or lost hands)
        stable_sign = None
        progress_val = 0.0

    # 4. Draw UI
    draw_info(frame, current_pred, current_conf, sentence, progress_val)
    
    cv2.imshow("ISL Recognition (Model 3 - MLP)", frame)
    
    key = cv2.waitKey(1)
    if key & 0xFF == ord('q'):
        break
    elif key & 0xFF == ord('c'):
        sentence = ""

cap.release()
cv2.destroyAllWindows()
