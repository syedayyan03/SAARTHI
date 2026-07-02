import os
import sys
import json
import joblib

def main():
    if len(sys.argv) >= 2:
        query = sys.argv[1].strip()
    else:
        try:
            query = sys.stdin.buffer.read().decode('utf-8').strip()
        except Exception:
            query = sys.stdin.read().strip()

    if not query:
        print(json.dumps({"intent": "unrelated", "confidence": 1.0}))
        return

    model_path = os.path.join("models", "chat_intent_pipeline.pkl")
    if not os.path.exists(model_path):
        # Fallback to agriculture if the model is not trained/accessible to prevent crashing
        print(json.dumps({"intent": "agriculture", "confidence": 0.5, "error": "Model file not found"}))
        return

    try:
        pipeline = joblib.load(model_path)
        # Class probabilities: [P(0), P(1)]
        prob = pipeline.predict_proba([query])[0]
        pred = int(pipeline.predict([query])[0])
        
        intent = "agriculture" if pred == 1 else "unrelated"
        confidence = float(prob[pred])
        
        print(json.dumps({
            "intent": intent,
            "confidence": confidence
        }))
    except Exception as e:
        print(json.dumps({
            "intent": "agriculture",
            "confidence": 0.5,
            "error": str(e)
        }))

if __name__ == "__main__":
    main()
