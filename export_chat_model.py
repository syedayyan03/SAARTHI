import os
import joblib
import json

def main():
    model_path = os.path.join("models", "chat_intent_pipeline.pkl")
    if not os.path.exists(model_path):
        print("Pipeline file not found.")
        return

    pipeline = joblib.load(model_path)
    vectorizer = pipeline.named_steps['vectorizer']
    classifier = pipeline.named_steps['classifier']

    # vocabulary_ maps terms to indices
    # Convert index from numpy int to native int
    vocabulary = {term: int(idx) for term, idx in vectorizer.vocabulary_.items()}
    idf = [float(val) for val in vectorizer.idf_]

    # coef_ is shape (1, n_features) for binary classification
    coef = [float(val) for val in classifier.coef_[0]]
    intercept = float(classifier.intercept_[0])

    model_json = {
        "vocabulary": vocabulary,
        "idf": idf,
        "coef": coef,
        "intercept": intercept,
        "ngram_range": vectorizer.ngram_range,
        "sublinear_tf": vectorizer.sublinear_tf
    }

    out_path = os.path.join("models", "chat_intent_model.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(model_json, f, indent=2)
    print(f"Successfully exported model to {out_path}")

if __name__ == "__main__":
    main()
