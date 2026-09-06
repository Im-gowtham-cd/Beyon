import logging
import cv2
import numpy as np
from typing import Tuple, Dict, Any

logger = logging.getLogger(__name__)

_cnn_model = None
_cnn_initialized = False

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F

    class CheatingCNN(nn.Module):
        def __init__(self):
            super(CheatingCNN, self).__init__()
            self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
            self.bn1 = nn.BatchNorm2d(32)
            self.pool1 = nn.MaxPool2d(2, 2)

            self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
            self.bn2 = nn.BatchNorm2d(64)
            self.pool2 = nn.MaxPool2d(2, 2)

            self.fc1 = nn.Linear(64 * 12 * 12, 512)
            self.dropout = nn.Dropout(0.25)
            self.fc2 = nn.Linear(512, 128)
            self.fc3 = nn.Linear(128, 2)

        def forward(self, x):
            x = self.pool1(F.relu(self.bn1(self.conv1(x))))
            x = self.pool2(F.relu(self.bn2(self.conv2(x))))
            x = x.view(x.size(0), -1)
            x = F.relu(self.fc1(x))
            x = self.dropout(x)
            x = F.relu(self.fc2(x))
            x = self.fc3(x)
            return x

    def init_cnn_model():
        global _cnn_model, _cnn_initialized
        if _cnn_initialized:
            return _cnn_model
        try:
            model = CheatingCNN()
            model.eval()
            _cnn_model = model
            _cnn_initialized = True
            logger.info("CheatingCNN PyTorch model initialized successfully")
            return _cnn_model
        except Exception as e:
            logger.warning(f"Could not initialize PyTorch CheatingCNN: {e}")
            _cnn_initialized = True
            return None

except ImportError:
    logger.info("PyTorch not present; using CV feature & heuristic engine")
    def init_cnn_model():
        return None

def detect_cheating_cnn(image_bgr: np.ndarray) -> Tuple[bool, float, Dict[str, Any]]:
    """
    Extracts 48x48 normalized grayscale frame from webcam feed,
    evaluates using the Cheating CNN and multi-cue spatial orientation features.

    Returns:
        (is_cheating: bool, cheat_probability: float, details: dict)
    """
    if image_bgr is None:
        return False, 0.0, {"reason": "no_image"}

    h, w = image_bgr.shape[:2]
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

    resized_48 = cv2.resize(gray, (48, 48))
    norm_frame = (resized_48.astype(np.float32) / 255.0 - 0.5) / 0.5

    cheat_probability = 0.0
    cues = []

    top_zone = gray[0:int(h * 0.35), :]
    left_peripheral = gray[:, 0:int(w * 0.25)]
    right_peripheral = gray[:, int(w * 0.75):]
    bottom_zone = gray[int(h * 0.65):, :]

    left_energy = float(np.mean(left_peripheral))
    right_energy = float(np.mean(right_peripheral))
    asymmetry = abs(left_energy - right_energy) / max(left_energy + right_energy, 1.0)

    if asymmetry > 0.35:
        cues.append("HEAD_TURN_OR_LEAN")
        cheat_probability += 0.35 * min(asymmetry * 2.0, 1.0)

    bottom_movement = float(np.std(bottom_zone))
    if bottom_movement > 45.0:
        cues.append("DESK_OBJECT_INTERACTION")
        cheat_probability += 0.25

    model = init_cnn_model()
    if model is not None:
        try:
            import torch
            tensor_in = torch.from_numpy(norm_frame).unsqueeze(0).unsqueeze(0).float()
            with torch.no_grad():
                logits = model(tensor_in)
                probs = torch.softmax(logits, dim=1)[0].numpy()
                cnn_cheat_score = float(probs[1])
                cheat_probability = max(cheat_probability, cnn_cheat_score * 0.8 + cheat_probability * 0.2)
        except Exception as e:
            logger.debug(f"PyTorch inference pass: {e}")

    cheat_probability = min(max(round(cheat_probability, 3), 0.0), 0.99)
    is_cheating = cheat_probability >= 0.65

    return is_cheating, cheat_probability, {
        "cues": cues,
        "asymmetry": round(asymmetry, 3),
        "desk_motion_var": round(bottom_movement, 2)
    }
