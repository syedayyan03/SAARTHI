import sys
import os
import json
import warnings

# Suppress PyTorch/Python warnings for cleaner JSON output
warnings.filterwarnings("ignore")

try:
    try:
        from train_disease_model_v2 import predict_disease
    except ImportError:
        from train_disease_model import predict_disease
except ImportError:
    print(json.dumps({"ok": False, "error": "Training scripts or PyTorch dependencies missing"}))
    sys.exit(1)

def predict(image_path):
    # Determine model directory
    model_dir = 'models'
    model_exists = (
        os.path.exists(os.path.join(model_dir, 'best_disease_model.pth')) or
        os.path.exists(os.path.join(model_dir, 'last_disease_model.pth')) or
        os.path.exists(os.path.join(model_dir, 'plant_disease_model.pth')) or
        os.path.exists('best_disease_model.pth') or
        os.path.exists('plant_disease_model.pth')
    )
    if not model_exists:
        print(json.dumps({"ok": False, "error": "Model file best_disease_model.pth or plant_disease_model.pth not found"}))
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
