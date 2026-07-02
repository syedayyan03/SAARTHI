import os
import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 1. Balanced Multilingual Dataset (Agriculture vs Unrelated)
# Class 1 = Agriculture (in-scope), Class 0 = Unrelated (out-of-scope)
DATASET = [
    # --- AGRICULTURAL QUERIES (Class 1) ---
    # English
    ("what is the best fertilizer for red soil?", 1),
    ("how much urea should I add to my wheat crop?", 1),
    ("what crops grow best in black soil?", 1),
    ("NPK requirement for paddy and sugarcane", 1),
    ("how to treat leaf spot disease on tomato leaves?", 1),
    ("weather forecast for harvesting cotton next week", 1),
    ("what is the current mandi price of maize in Hyderabad?", 1),
    ("how often should I water my banana plantation?", 1),
    ("symptoms of stem borer in rice field", 1),
    ("best pest control for chickpeas", 1),
    ("laterite soil crop recommendations", 1),
    ("open well irrigation water demand for organic ragi", 1),
    ("how to improve crop yield in sandy loam soil?", 1),
    ("organic farming methods for growing vegetables", 1),
    ("how to check soil pH levels at home?", 1),
    ("crop rotation advice for soil nitrogen fixation", 1),
    ("what is the price of basmati rice at APMC mandi?", 1),
    ("chilli crop leaf curl virus treatment", 1),
    ("when is the best season to sow groundnuts?", 1),
    ("how to grow turmeric in wet clayey soil?", 1),
    
    # Telugu
    ("పత్తి సాగుకు ఏ నేലలు అనుకూలం?", 1),
    ("వరి పంటలో వచ్చే అగ్గి తెగులు నివారణ ఎలా?", 1),
    ("నల్ల రేగడి నేలలో ఏ పంటలు బాగా పండుతాయి?", 1),
    ("సమీప మండిలో మొక్కజొన్న ధర ఎంత ఉంది?", 1),
    ("టమోటా ఆకు ముడుత తెగులు నివారణకు ఏ మందులు వాడాలి?", 1),
    ("వరి నాట్లు వేసేటప్పుడు వేయవలసిన ఎరువులు ఏమిటి?", 1),
    ("వ్యవసాయంలో బిందు సేద్యం (drip irrigation) ప్రయోజనాలు ఏమిటి?", 1),
    ("పత్తి ఆకులు ఎర్రబడటానికి कारणం ఏమిటి?", 1),
    ("నేల పిహెచ్ (soil pH) ఎలా పరీక్షించాలి?", 1),
    ("శనగ పంటకు నీటి పారుదల ఎలా కల్పించాలి?", 1),

    # Hindi
    ("मिट्टी में यूरिया और डीएपी कितना डालना चाहिए?", 1),
    ("धान की फसल में लगने वाले झुलसा रोग का इलाज क्या है?", 1),
    ("काली मिट्टी में कौन-कौन सी फसलें उगाई जा सकती हैं?", 1),
    ("कपास के लिए एनपीके (NPK) खाद की सही मात्रा क्या है?", 1),
    ("मक्का की खेती के लिए उपयुक्त जलवायु और मौसम कैसा होना चाहिए?", 1),
    ("गेहूं की कटाई के बाद खेत की तैयारी कैसे करें?", 1),
    ("टमाटर के पौधों में पत्ती धब्बा रोग को कैसे रोकें?", 1),
    ("निकटतम मंडी में सरसों और गेहूं का आज का भाव क्या है?", 1),
    ("गन्ने की फसल में सिंचाई कब और कितनी बार करनी चाहिए?", 1),
    ("मिट्टी का स्वास्थ्य सुधारने के लिए जैविक खाद कैसे बनाएं?", 1),

    # Marathi
    ("कापूस लागवडीसाठी कोणती जमीन योग्य आहे?", 1),
    ("भातावरील करपा रोगाचे नियंत्रण कसे करावे?", 1),
    ("काळी माती कापसासाठी का चांगली मानली जाते?", 1),
    ("जवळच्या बाजार समितीत मक्याचा आजचा दर काय आहे?", 1),
    ("टोमॅटोच्या पानांवर काळे ठिपके पडले आहेत उपाय सांगा", 1),
    ("ऊसाच्या शेतीसाठी पाणी व्यवस्थापन कसे करावे?", 1),
    ("खतांचा अतिवापर टाळण्यासाठी काय करावे?", 1),
    ("जमिनीचा सामू (pH) कसा मोजावा?", 1),
    ("रब्बी हंगामात कोणती पिके घ्यावीत?", 1),
    ("मिरची पिकावरील चुरडा-मुरडा रोगाचे नियंत्रण कसे करावे?", 1),

    # Malayalam
    ("നെൽകൃഷിക്ക് ഏറ്റവും അനുയോജ്യമായ വളം ഏതാണ്?", 1),
    ("പച്ചക്കറി കൃഷിയിൽ കീടങ്ങളെ എങ്ങനെ നിയന്ത്രിക്കാം?", 1),
    ("പരുത്തി കൃഷി ചെയ്യാൻ കരിമണ്ണ് വേണോ?", 1),
    ("വിപണിയിൽ ഇന്നത്തെ നാളികേരത്തിന്റെ വില എത്രയാണ്?", 1),
    ("തക്കാളി ഇലപ്പുള്ളി രോഗത്തിനുള്ള പ്രതിവിധി എന്താണ്?", 1),
    ("മണ്ണിന്റെ പിഎച്ച് മൂല്യം എങ്ങനെ പരിശോധിക്കാം?", 1),
    ("മഴക്കാലത്ത് വിളവെടുപ്പ് മാറ്റിവെക്കണോ?", 1),
    ("തെങ്ങിന്റെ മണ്ടയഴുകൽ രോഗം തടയാൻ എന്തുചെയ്യണം?", 1),
    ("കപ്പ കൃഷി ചെയ്യാൻ പറ്റിയ മണ്ണ് ഏതാണ്?", 1),
    ("ജൈവ വളങ്ങൾ എങ്ങനെ തയാറാക്കാം?", 1),

    # --- UNRELATED QUERIES (Class 0) ---
    # English
    ("how to write a javascript function?", 0),
    ("what is standard deviation in mathematics?", 0),
    ("who directed the movie Inception?", 0),
    ("tell me a joke about computer programming", 0),
    ("explain the history of the Indian national congress", 0),
    ("how to write an essay on environment pollution?", 0),
    ("what is the boiling point of ethanol?", 0),
    ("who is the current prime minister of India?", 0),
    ("explain JavaScript promises and async await", 0),
    ("write a python script to search a file for text", 0),
    ("how to create a React component step by step", 0),
    ("tell me about the solar system planets", 0),
    ("what is the capital city of France?", 0),
    ("can you solve this algebra equation?", 0),
    ("how to make a website using HTML and CSS", 0),
    ("who wrote the play Romeo and Juliet?", 0),
    ("what is the speed of light in vacuum?", 0),
    ("explain the difference between SQL and NoSQL databases", 0),
    ("how to install node modules in windows?", 0),
    ("tell me a famous poem by Robert Frost", 0),

    # Telugu
    ("జావాస్క్రిప్ట్ కోడ్ ఎలా రాయాలి?", 0),
    ("ఈరోజు విడుదలైన కొత్త సినిమా రివ्यू చెప్పు", 0),
    ("గణితంలో బీజగణితం (algebra) అంటే ఏమిటి?", 0),
    ("భారతదేశ మొదటి ప్రధానమంత్రి ఎవరు?", 0),
    ("నాకో మంచి జోక్ లేదా కథ చెప్పు", 0),
    ("ఫేస్బుక్ లేదా వాట్సాప్ అకౌంట్ ఎలా క్రియేట్ చేయాలి?", 0),
    ("ఆంగ్ల వ్యాకరణం (English grammar) ఎలా నేర్చుకోవాలి?", 0),
    ("భూమి గుండ్రంగా ఉందా లేదా చదునుగా ఉందా?", 0),
    ("కంప్యూటర్ నెట్వర్కింగ్ గురించి వివరించు", 0),
    ("హైదరాబాద్ చరిత్ర ఏమిటి?", 0),

    # Hindi
    ("पाइथन में लूप कैसे लिखते हैं?", 0),
    ("भारत का राष्ट्रगान किसने लिखा था?", 0),
    ("एक अच्छा सा चुटकुला सुनाओ ना", 0),
    ("जावास्क्रिप्ट और जावा में क्या अंतर है?", 0),
    ("ताजमहल किस राज्य में स्थित है?", 0),
    ("वेबसाइट डिजाइन करने के लिए क्या सीखना होगा?", 0),
    ("गणित में त्रिकोणमिति (trigonometry) के सूत्र बताओ", 0),
    ("आज का ताजा समाचार या क्रिकेट स्कोर क्या है?", 0),
    ("फेसबुक पासवर्ड कैसे रीसेट करें?", 0),
    ("महात्मा गांधी का जन्म कब हुआ था?", 0),

    # Marathi
    ("प्रोग्रामिंग शिकण्यासाठी कोणते पुस्तक वाचू?", 0),
    ("महाराष्ट्राची राजधानी कोणती आहे?", 0),
    ("मला एखादा विनोद सांग", 0),
    ("एचटीएमएल (HTML) वापरून वेबपेज कसे बनवावे?", 0),
    ("शिवाजी महाराजांचा इतिहास सांगा", 0),
    ("संगणक नेटवर्क म्हणजे काय?", 0),
    ("भारताच्या राष्ट्रपतींचे नाव काय आहे?", 0),
    ("गुगल सर्च इंजिन कसे काम करते?", 0),
    ("गणितातील त्रिकोणमिती म्हणजे काय?", 0),
    ("मोबाईल चार्ज कसा करावा?", 0),

    # Malayalam
    ("എങ്ങനെയാണ് ഒരു പൈത്തൺ പ്രോഗ്രാം എഴുതുക?", 0),
    ("കേരളത്തിന്റെ തലസ്ഥാനം ഏതാണ്?", 0),
    ("എനിക്കൊരു തമാശ പറഞ്ഞു തരാമോ?", 0),
    ("ആരാണ് ഇന്ത്യയുടെ രാഷ്ട്രപതി?", 0),
    ("കമ്പ്യൂട്ടർ പ്രോഗ്രാമിംഗ് എന്നാൽ എന്താണ്?", 0),
    ("ഒരു വെബ്സൈറ്റ് എങ്ങനെ ഉണ്ടാക്കാം?", 0),
    ("മാവേലിയുടെ ചരിത്രം എന്താണ്?", 0),
    ("ഭൂമിയുടെ ആകൃതി എന്താണ്?", 0),
    ("ഇംഗ്ലീഷ് വ്യാകരണം എങ്ങനെ പഠിക്കാം?", 0),
    ("സിനിമകൾ ഡൗൺലോഡ് ചെയ്യുന്നത് എങ്ങനെ?", 0)
]

def main():
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
        
    print("============================================================")
    print("  SAARTHI Chatbox Intent Classifier Model Training")
    print("============================================================")
    
    # 2. Extract texts and labels
    texts = [item[0] for item in DATASET]
    labels = [item[1] for item in DATASET]

    # 3. Create models directory if it doesn't exist
    model_dir = "models"
    os.makedirs(model_dir, exist_ok=True)

    # 4. Define TF-IDF + Logistic Regression Pipeline
    # Using character and word n-grams to handle multilingual prefixes/suffixes
    pipeline = Pipeline([
        ('vectorizer', TfidfVectorizer(
            analyzer='word',
            token_pattern=r"(?u)[a-zA-Z0-9_\u0900-\u097F\u0C00-\u0C7F\u0D00-\u0D7F]{2,}",
            ngram_range=(1, 2),
            stop_words=None, # None to avoid throwing out keywords in regional languages
            sublinear_tf=True
        )),
        ('classifier', LogisticRegression(
            C=10.0,
            random_state=42,
            max_iter=1000
        ))
    ])

    # 5. Split and evaluate test accuracy
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    pipeline.fit(X_train, y_train)
    train_acc = accuracy_score(y_train, pipeline.predict(X_train))
    test_acc = accuracy_score(y_test, pipeline.predict(X_test))
    
    print(f"      Train Set Size: {len(X_train)} instances")
    print(f"      Test Set Size:  {len(X_test)} instances")
    print(f"      Train Accuracy: {train_acc*100:.2f}%")
    print(f"      Test Accuracy:  {test_acc*100:.2f}%")

    # 6. Fit on FULL dataset for production use
    print("\n[Fitting pipeline on full dataset...]")
    pipeline.fit(texts, labels)

    # 7. Persist pipeline
    model_path = os.path.join(model_dir, 'chat_intent_pipeline.pkl')
    joblib.dump(pipeline, model_path)
    print(f"      Saved chat intent pipeline -> {model_path}")

    # 8. Test predictions
    test_queries = [
        "NPK for ragi crop",
        "how to write a Python list",
        "వరి పంట కీటకాలు",
        "मंडी का भाव क्या है?",
        "what is standard deviation?",
        "कापूस पीक"
    ]
    
    print("\n[Running sanity checks...]")
    for q in test_queries:
        prob = pipeline.predict_proba([q])[0] # [P(0), P(1)]
        pred = pipeline.predict([q])[0]
        label = "Agriculture (IN-SCOPE)" if pred == 1 else "Unrelated (OUT-OF-SCOPE)"
        print(f"  Query: '{q}'")
        print(f"    -> Classified as: {label} (Prob: {prob[pred]*100:.1f}%)")

    print("\n" + "=" * 60)
    print("  Training complete.")
    print("=" * 60)

if __name__ == "__main__":
    main()
