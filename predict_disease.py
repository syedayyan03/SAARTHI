import sys
import os
import json
import warnings

# Suppress PyTorch/Python warnings for cleaner JSON output
warnings.filterwarnings("ignore")

try:
    from train_disease_model import predict_disease
except ImportError:
    print(json.dumps({"ok": False, "error": "train_disease_model.py not found or dependencies missing (torch, torchvision, Pillow)"}))
    sys.exit(1)

def predict(image_path):
    # Determine model directory
    model_dir = 'models'
    if not os.path.exists(os.path.join(model_dir, 'plant_disease_model.pth')):
        # Check current directory
        if os.path.exists('plant_disease_model.pth'):
            model_dir = '.'
        else:
            print(json.dumps({"ok": False, "error": "Model file plant_disease_model.pth not found"}))
            return

    try:
        # We redirect stderr temporarily because predict_disease prints loading info to stderr
        old_stderr = sys.stderr
        with open(os.devnull, 'w') as f:
            sys.stderr = f
            results = predict_disease(image_path, model_dir=model_dir, top_k=1)
        sys.stderr = old_stderr
        
        if not results:
            print(json.dumps({"ok": False, "error": "No prediction returned"}))
            return
            
        top_result = results[0]
        # output must match what server.js expects:
        # it expects a raw disease string with "___" (e.g. Tomato___Early_blight)
        # top_result["class_key"] contains exactly this.
        predicted_class = top_result["class_key"]
        confidence = float(top_result["confidence"])

        print(json.dumps({
            "ok": True,
            "disease": predicted_class,
            "confidence": confidence
        }))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "No image path provided"}))
    else:
        predict(sys.argv[1])
