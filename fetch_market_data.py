import os
import sys
import json
import datetime
import re
import urllib.request
import urllib.error
import pandas as pd

def get_gemini_api_key():
    if os.environ.get('GEMINI_API_KEY'):
        return os.environ.get('GEMINI_API_KEY')
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            content = f.read()
            match = re.search(r'GEMINI_API_KEY\s*=\s*([^\s]+)', content)
            if match:
                # Remove quotes if present
                val = match.group(1).strip()
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                return val
    return None

def generate_market_data():
    today_str = datetime.date.today().isoformat()
    api_key = get_gemini_api_key()
    
    if not api_key:
        print(json.dumps({"ok": False, "error": "No GEMINI_API_KEY found in environment or .env file"}))
        return

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    prompt = f"""Search Google for today's (around {today_str}) wholesale mandi prices in India (from Agmarknet or recent commodity news). Collect the daily prices (ModalPrice, MinPrice, MaxPrice, and arrivals) for crops like Tomato, Potato, Onion, Paddy, Wheat, Cotton, Maize, Chilli, Mango, Coconut, Banana across states like Delhi, Punjab, Haryana, Uttar Pradesh, Rajasthan, Gujarat, Madhya Pradesh, Maharashtra, Andhra Pradesh, Telangana, Karnataka, Tamil Nadu, Kerala, West Bengal.
    Return ONLY a valid JSON object matching this structure:
    {{
      "records": [
        {{
          "State": "State Name",
          "District": "District Name",
          "Market": "Mandi Name APMC",
          "Commodity": "Crop Name",
          "Variety": "Variety Name",
          "Arrivals": 120, // arrivals in tonnes
          "MinPrice": 1400, // min price in Rs.
          "MaxPrice": 1800, // max price in Rs.
          "ModalPrice": 1600, // modal price in Rs.
          "Demand": "High", // High/Rising/Medium/Low
          "Date": "{today_str}"
        }}
      ]
    }}
    Include at least 60-80 records to cover all major states and districts. Ensure the JSON is complete and valid. Do not write any conversational text, write ONLY the JSON."""

    req_body = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "tools": [{"googleSearch": {}}]
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(req_body).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            
            candidates = res_json.get('candidates', [])
            if not candidates:
                raise ValueError("No candidates returned from Gemini API")
            
            text = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            
            # Extract JSON block
            json_match = re.search(r'(\{.*\})', text, re.DOTALL)
            if json_match:
                clean_json = json_match.group(1)
            else:
                clean_json = text
                
            data_dict = json.loads(clean_json)
            records = data_dict.get('records', [])
            
            if not records:
                raise ValueError("No records found in parsed JSON")
                
            df = pd.DataFrame(records)
            os.makedirs("data", exist_ok=True)
            csv_path = os.path.join("data", "market_demand.csv")
            df.to_csv(csv_path, index=False)
            
            print(json.dumps({
                "ok": True,
                "records_count": len(df),
                "path": csv_path,
                "date": today_str
            }))
            
    except Exception as e:
        # Print raw output on error for debugging
        print(json.dumps({
            "ok": False,
            "error": str(e),
            "raw_response_text": text if 'text' in locals() else None
        }))

if __name__ == '__main__':
    generate_market_data()
