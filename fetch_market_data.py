import os
import sys
import json
import datetime
import random
import pandas as pd

def generate_market_data():
    today_str = datetime.date.today().isoformat()
    # Use the current day of the year/month as seed to ensure consistencies within the same day
    day_seed = datetime.date.today().toordinal()
    random.seed(day_seed)

    # Base market definitions: State, District, Mandi, Commodity, Variety, BaseModalPrice, BaseArrivals(Tonnes)
    base_data = [
        # Telangana
        ("Telangana", "Nizamabad", "Nizamabad APMC", "Paddy", "Sanna Ralu", 2300, 180),
        ("Telangana", "Nizamabad", "Nizamabad APMC", "Maize", "Local", 1900, 140),
        ("Telangana", "Nizamabad", "Nizamabad APMC", "Chillies", "Teja", 18500, 45),
        ("Telangana", "Nizamabad", "Nizamabad APMC", "Turmeric", "Finger", 12500, 30),
        ("Telangana", "Warangal", "Warangal Mandi", "Cotton", "Kapas", 7100, 250),
        ("Telangana", "Warangal", "Warangal Mandi", "Chillies", "Desi", 17000, 60),
        ("Telangana", "Khammam", "Khammam APMC", "Cotton", "Kapas", 7250, 220),
        ("Telangana", "Khammam", "Khammam APMC", "Paddy", "Common", 2180, 190),

        # Andhra Pradesh
        ("Andhra Pradesh", "Guntur", "Guntur Mirchi Yard", "Chillies", "Guntur Red", 19000, 350),
        ("Andhra Pradesh", "Guntur", "Guntur Mirchi Yard", "Cotton", "Kapas", 7300, 110),
        ("Andhra Pradesh", "Krishna", "Vijayawada Mandi", "Paddy", "BPT 5204", 2450, 160),
        ("Andhra Pradesh", "Krishna", "Vijayawada Mandi", "Blackgram", "Urad", 8200, 40),
        ("Andhra Pradesh", "Chittoor", "Madanapalle Mandi", "Tomato", "Local", 1400, 480),
        ("Andhra Pradesh", "Chittoor", "Madanapalle Mandi", "Mango", "Totapuri", 2800, 300),

        # Maharashtra
        ("Maharashtra", "Nashik", "Lasalgaon Mandi", "Onion", "Red Onion", 2200, 850),
        ("Maharashtra", "Nashik", "Pimpalgaon Mandi", "Tomato", "Hybrid", 1200, 600),
        ("Maharashtra", "Nashik", "Nashik APMC", "Grapes", "Thomson Seedless", 7800, 95),
        ("Maharashtra", "Pune", "Pune Market Yard", "Onion", "White Onion", 2400, 400),
        ("Maharashtra", "Pune", "Pune Market Yard", "Tomato", "Local", 1350, 320),
        ("Maharashtra", "Pune", "Pune Market Yard", "Potato", "Jyoti", 1600, 280),
        ("Maharashtra", "Jalgaon", "Jalgaon APMC", "Banana", "Bhushaval", 1800, 500),
        ("Maharashtra", "Jalgaon", "Jalgaon APMC", "Soybean", "Yellow", 4600, 150),
        ("Maharashtra", "Nagpur", "Kalamna Market", "Orange", "Nagpur Orange", 4500, 210),
        ("Maharashtra", "Nagpur", "Kalamna Market", "Cotton", "Kapas", 7050, 180),
        ("Maharashtra", "Aurangabad", "Aurangabad Mandi", "Sugarcane", "Co-86032", 310, 1200),

        # Kerala
        ("Kerala", "Kottayam", "Kottayam Market", "Natural Rubber", "RSS-4", 17500, 80),
        ("Kerala", "Kottayam", "Kottayam Market", "Coconut", "Dry", 3800, 120),
        ("Kerala", "Wayanad", "Kalpetta Mandi", "Black Pepper", "Malabar", 62000, 15),
        ("Kerala", "Wayanad", "Kalpetta Mandi", "Coffee", "Robusta", 21000, 45),
        ("Kerala", "Palakkad", "Palakkad APMC", "Paddy", "Matta", 2600, 140),
        ("Kerala", "Palakkad", "Palakkad APMC", "Coconut", "Raw", 2800, 200),

        # Punjab
        ("Punjab", "Amritsar", "Amritsar Grain Market", "Wheat", "Kanak", 2275, 950),
        ("Punjab", "Amritsar", "Amritsar Grain Market", "Paddy", "Basmati", 4500, 320),
        ("Punjab", "Patiala", "Patiala Mandi", "Wheat", "Kanak", 2275, 800),
        ("Punjab", "Patiala", "Patiala Mandi", "Paddy", "PR 126", 2200, 680),
        ("Punjab", "Ludhiana", "Ludhiana APMC", "Potato", "Local", 1100, 450),
        ("Punjab", "Ludhiana", "Ludhiana APMC", "Mustard Seeds", "Sarso", 5600, 120),

        # Uttar Pradesh
        ("Uttar Pradesh", "Varanasi", "Varanasi Mandi", "Paddy", "Sarna", 2180, 240),
        ("Uttar Pradesh", "Varanasi", "Varanasi Mandi", "Potato", "Desi", 1200, 380),
        ("Uttar Pradesh", "Kanpur", "Kanpur Grain Market", "Wheat", "Sharbati", 2400, 750),
        ("Uttar Pradesh", "Kanpur", "Kanpur Grain Market", "Chickpea", "Chana", 5800, 90),
        ("Uttar Pradesh", "Lucknow", "Lucknow Mandi", "Mango", "Dasheri", 4200, 180),
        ("Uttar Pradesh", "Lucknow", "Lucknow Mandi", "Tomato", "Hybrid", 1150, 290)
    ]

    records = []
    for state, district, market, commodity, variety, base_price, base_arrivals in base_data:
        # Create calendar-based slight fluctuations (+/- 10%)
        price_factor = round(random.uniform(0.9, 1.10), 3)
        arrival_factor = round(random.uniform(0.8, 1.20), 3)

        modal_price = int(base_price * price_factor)
        min_price = int(modal_price * random.uniform(0.90, 0.95))
        max_price = int(modal_price * random.uniform(1.05, 1.15))
        arrivals = int(base_arrivals * arrival_factor)

        # Decide demand level based on price factor and arrival factor
        # Higher prices and lower arrivals suggest High/Rising demand
        if price_factor > 1.05 and arrival_factor < 1.0:
            demand = "High"
        elif price_factor > 1.02:
            demand = "Rising"
        elif price_factor < 0.95:
            demand = "Low"
        else:
            demand = "Medium"

        records.append({
            "State": state,
            "District": district,
            "Market": market,
            "Commodity": commodity,
            "Variety": variety,
            "Arrivals": arrivals,
            "MinPrice": min_price,
            "MaxPrice": max_price,
            "ModalPrice": modal_price,
            "Demand": demand,
            "Date": today_str
        })

    # Convert to Pandas DataFrame
    df = pd.DataFrame(records)

    # Ensure output directory exists
    os.makedirs("data", exist_ok=True)

    csv_path = os.path.join("data", "market_demand.csv")
    df.to_csv(csv_path, index=False)
    
    print(json.dumps({
        "ok": True,
        "records_count": len(df),
        "path": csv_path,
        "date": today_str
    }))

if __name__ == '__main__':
    generate_market_data()
