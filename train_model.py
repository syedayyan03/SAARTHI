"""
expanded_india_crops.py
=======================
Generates an expanded Indian crop agronomic dataset covering 60+ crops
across all major categories: cereals, pulses, oilseeds, cash crops,
spices, vegetables, fruits, and plantation crops.

Each crop entry includes:
  - N, P, K  (kg/ha — representative soil nutrient requirement)
  - temperature_min/max  (°C — viable growing range)
  - temperature_opt  (°C — optimum)
  - humidity_min/max  (%)
  - ph_min/max
  - rainfall_min/max  (mm/year or per season)
  - season  (kharif / rabi / zaid / perennial)
  - preferred_soils
  - water_demand  (low / medium / high)
  - states  (major producing Indian states)
  - category

Sources: FAO Fertilizer Use by Crop in India, ICAR agronomic guides,
Drishti IAS, eAgri TNAU lecture notes, NABARD crop profiles.
"""

import json, os

CROPS = {

    # ─── CEREALS ──────────────────────────────────────────────────────────
    "rice": {
        "N": 120, "P": 60, "K": 60,
        "temperature_min": 20, "temperature_opt": 25, "temperature_max": 35,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 150, "rainfall_max": 300,
        "season": "kharif",
        "preferred_soils": ["alluvial", "clayey", "black", "red"],
        "water_demand": "high",
        "states": ["West Bengal", "Punjab", "Uttar Pradesh", "Andhra Pradesh",
                   "Telangana", "Tamil Nadu", "Odisha", "Bihar", "Assam"],
        "category": "cereal"
    },
    "wheat": {
        "N": 120, "P": 60, "K": 40,
        "temperature_min": 10, "temperature_opt": 20, "temperature_max": 26,
        "humidity_min": 40, "humidity_max": 65,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 75, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "clayey"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Punjab", "Madhya Pradesh", "Haryana",
                   "Rajasthan", "Bihar", "Gujarat"],
        "category": "cereal"
    },
    "maize": {
        "N": 120, "P": 60, "K": 40,
        "temperature_min": 18, "temperature_opt": 27, "temperature_max": 35,
        "humidity_min": 55, "humidity_max": 80,
        "ph_min": 5.8, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["alluvial", "black", "sandy loam", "red"],
        "water_demand": "medium",
        "states": ["Karnataka", "Andhra Pradesh", "Telangana", "Rajasthan",
                   "Madhya Pradesh", "Bihar", "Uttar Pradesh"],
        "category": "cereal"
    },
    "sorghum (jowar)": {
        "N": 90, "P": 40, "K": 30,
        "temperature_min": 25, "temperature_opt": 30, "temperature_max": 40,
        "humidity_min": 30, "humidity_max": 65,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 40, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["black", "alluvial", "red", "sandy loam"],
        "water_demand": "low",
        "states": ["Maharashtra", "Karnataka", "Andhra Pradesh", "Telangana",
                   "Madhya Pradesh", "Rajasthan", "Tamil Nadu"],
        "category": "cereal"
    },
    "pearl millet (bajra)": {
        "N": 80, "P": 40, "K": 30,
        "temperature_min": 25, "temperature_opt": 32, "temperature_max": 42,
        "humidity_min": 25, "humidity_max": 60,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 30, "rainfall_max": 75,
        "season": "kharif",
        "preferred_soils": ["sandy", "sandy loam", "alluvial"],
        "water_demand": "low",
        "states": ["Rajasthan", "Uttar Pradesh", "Haryana", "Gujarat",
                   "Maharashtra", "Madhya Pradesh"],
        "category": "cereal"
    },
    "finger millet (ragi)": {
        "N": 60, "P": 30, "K": 30,
        "temperature_min": 15, "temperature_opt": 27, "temperature_max": 35,
        "humidity_min": 50, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["red", "sandy loam", "black", "loamy"],
        "water_demand": "medium",
        "states": ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Uttarakhand",
                   "Odisha", "Jharkhand"],
        "category": "cereal"
    },
    "barley": {
        "N": 60, "P": 30, "K": 20,
        "temperature_min": 7, "temperature_opt": 15, "temperature_max": 25,
        "humidity_min": 35, "humidity_max": 60,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 60, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["loamy", "sandy loam", "alluvial"],
        "water_demand": "low",
        "states": ["Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Haryana",
                   "Himachal Pradesh"],
        "category": "cereal"
    },

    # ─── PULSES ──────────────────────────────────────────────────────────
    "chickpea (gram)": {
        "N": 20, "P": 60, "K": 30,
        "temperature_min": 15, "temperature_opt": 24, "temperature_max": 30,
        "humidity_min": 30, "humidity_max": 60,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 60, "rainfall_max": 90,
        "season": "rabi",
        "preferred_soils": ["black", "alluvial", "red", "sandy loam"],
        "water_demand": "low",
        "states": ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Uttar Pradesh",
                   "Andhra Pradesh", "Karnataka"],
        "category": "pulse"
    },
    "pigeon pea (arhar/tur)": {
        "N": 20, "P": 50, "K": 30,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 40, "humidity_max": 70,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 150,
        "season": "kharif",
        "preferred_soils": ["black", "alluvial", "red"],
        "water_demand": "low",
        "states": ["Maharashtra", "Uttar Pradesh", "Madhya Pradesh", "Karnataka",
                   "Andhra Pradesh", "Gujarat"],
        "category": "pulse"
    },
    "mung bean (green gram)": {
        "N": 20, "P": 40, "K": 20,
        "temperature_min": 25, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 45, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["sandy loam", "alluvial", "red"],
        "water_demand": "low",
        "states": ["Rajasthan", "Maharashtra", "Andhra Pradesh", "Karnataka",
                   "Madhya Pradesh", "Uttar Pradesh"],
        "category": "pulse"
    },
    "black gram (urad)": {
        "N": 20, "P": 40, "K": 20,
        "temperature_min": 25, "temperature_opt": 30, "temperature_max": 37,
        "humidity_min": 50, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 90,
        "season": "kharif",
        "preferred_soils": ["black", "alluvial", "red", "loamy"],
        "water_demand": "low",
        "states": ["Uttar Pradesh", "Andhra Pradesh", "Madhya Pradesh",
                   "Tamil Nadu", "Maharashtra"],
        "category": "pulse"
    },
    "lentil (masoor)": {
        "N": 20, "P": 40, "K": 20,
        "temperature_min": 15, "temperature_opt": 21, "temperature_max": 27,
        "humidity_min": 30, "humidity_max": 60,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 45, "rainfall_max": 75,
        "season": "rabi",
        "preferred_soils": ["alluvial", "black", "sandy loam"],
        "water_demand": "low",
        "states": ["Madhya Pradesh", "Uttar Pradesh", "Bihar", "Rajasthan",
                   "West Bengal"],
        "category": "pulse"
    },
    "kidney beans (rajma)": {
        "N": 20, "P": 60, "K": 30,
        "temperature_min": 15, "temperature_opt": 22, "temperature_max": 28,
        "humidity_min": 50, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "rabi",
        "preferred_soils": ["alluvial", "black", "red"],
        "water_demand": "medium",
        "states": ["Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand",
                   "Karnataka", "Madhya Pradesh"],
        "category": "pulse"
    },
    "moth bean": {
        "N": 20, "P": 40, "K": 20,
        "temperature_min": 25, "temperature_opt": 35, "temperature_max": 42,
        "humidity_min": 20, "humidity_max": 50,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 25, "rainfall_max": 50,
        "season": "kharif",
        "preferred_soils": ["sandy", "sandy loam"],
        "water_demand": "low",
        "states": ["Rajasthan", "Gujarat", "Madhya Pradesh"],
        "category": "pulse"
    },

    # ─── OILSEEDS ────────────────────────────────────────────────────────
    "groundnut (peanut)": {
        "N": 25, "P": 50, "K": 50,
        "temperature_min": 22, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 50, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 125,
        "season": "kharif",
        "preferred_soils": ["sandy loam", "red", "alluvial", "laterite"],
        "water_demand": "medium",
        "states": ["Gujarat", "Andhra Pradesh", "Tamil Nadu", "Karnataka",
                   "Rajasthan", "Maharashtra"],
        "category": "oilseed"
    },
    "soybean": {
        "N": 30, "P": 60, "K": 40,
        "temperature_min": 20, "temperature_opt": 27, "temperature_max": 33,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["black", "alluvial", "red", "loamy"],
        "water_demand": "medium",
        "states": ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Karnataka",
                   "Andhra Pradesh"],
        "category": "oilseed"
    },
    "mustard (rapeseed)": {
        "N": 80, "P": 40, "K": 30,
        "temperature_min": 10, "temperature_opt": 20, "temperature_max": 27,
        "humidity_min": 40, "humidity_max": 65,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 25, "rainfall_max": 75,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "low",
        "states": ["Rajasthan", "Haryana", "Uttar Pradesh", "Madhya Pradesh",
                   "Gujarat", "West Bengal"],
        "category": "oilseed"
    },
    "sunflower": {
        "N": 90, "P": 60, "K": 60,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 40, "humidity_max": 70,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "black"],
        "water_demand": "medium",
        "states": ["Karnataka", "Andhra Pradesh", "Maharashtra", "Tamil Nadu",
                   "Bihar", "Odisha"],
        "category": "oilseed"
    },
    "sesame (til)": {
        "N": 30, "P": 30, "K": 30,
        "temperature_min": 25, "temperature_opt": 32, "temperature_max": 40,
        "humidity_min": 40, "humidity_max": 65,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["sandy loam", "red", "alluvial"],
        "water_demand": "low",
        "states": ["West Bengal", "Uttar Pradesh", "Rajasthan", "Gujarat",
                   "Tamil Nadu", "Andhra Pradesh"],
        "category": "oilseed"
    },
    "castor": {
        "N": 60, "P": 40, "K": 40,
        "temperature_min": 20, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 40, "humidity_max": 70,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["sandy loam", "red", "alluvial", "black"],
        "water_demand": "low",
        "states": ["Gujarat", "Andhra Pradesh", "Rajasthan", "Karnataka",
                   "Tamil Nadu"],
        "category": "oilseed"
    },
    "linseed (flaxseed)": {
        "N": 40, "P": 30, "K": 20,
        "temperature_min": 10, "temperature_opt": 18, "temperature_max": 25,
        "humidity_min": 40, "humidity_max": 65,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 45, "rainfall_max": 90,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "black"],
        "water_demand": "low",
        "states": ["Madhya Pradesh", "Uttar Pradesh", "Maharashtra", "Bihar",
                   "Chhattisgarh"],
        "category": "oilseed"
    },

    # ─── CASH / FIBRE CROPS ──────────────────────────────────────────────
    "sugarcane": {
        "N": 250, "P": 85, "K": 120,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 65, "humidity_max": 85,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 150, "rainfall_max": 250,
        "season": "perennial",
        "preferred_soils": ["alluvial", "black", "loamy", "red"],
        "water_demand": "high",
        "states": ["Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu",
                   "Andhra Pradesh", "Telangana", "Bihar", "Haryana"],
        "category": "cash_crop"
    },
    "cotton": {
        "N": 120, "P": 60, "K": 60,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 50, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["black", "alluvial", "red"],
        "water_demand": "medium",
        "states": ["Gujarat", "Maharashtra", "Telangana", "Andhra Pradesh",
                   "Haryana", "Punjab", "Rajasthan", "Madhya Pradesh"],
        "category": "cash_crop"
    },
    "jute": {
        "N": 80, "P": 40, "K": 40,
        "temperature_min": 24, "temperature_opt": 30, "temperature_max": 37,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 4.8, "ph_max": 6.5,
        "rainfall_min": 150, "rainfall_max": 200,
        "season": "kharif",
        "preferred_soils": ["alluvial", "clayey", "loamy"],
        "water_demand": "high",
        "states": ["West Bengal", "Bihar", "Odisha", "Assam", "Uttar Pradesh"],
        "category": "fibre_crop"
    },
    "tobacco": {
        "N": 100, "P": 60, "K": 100,
        "temperature_min": 18, "temperature_opt": 27, "temperature_max": 35,
        "humidity_min": 50, "humidity_max": 75,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["sandy loam", "red", "alluvial"],
        "water_demand": "medium",
        "states": ["Andhra Pradesh", "Telangana", "Karnataka", "Gujarat",
                   "Bihar", "Uttar Pradesh"],
        "category": "cash_crop"
    },

    # ─── PLANTATION CROPS ────────────────────────────────────────────────
    "tea": {
        "N": 120, "P": 30, "K": 40,
        "temperature_min": 13, "temperature_opt": 22, "temperature_max": 30,
        "humidity_min": 75, "humidity_max": 90,
        "ph_min": 4.5, "ph_max": 6.0,
        "rainfall_min": 150, "rainfall_max": 300,
        "season": "perennial",
        "preferred_soils": ["laterite", "red", "loamy"],
        "water_demand": "high",
        "states": ["Assam", "West Bengal", "Tamil Nadu", "Kerala",
                   "Himachal Pradesh", "Uttarakhand"],
        "category": "plantation"
    },
    "coffee": {
        "N": 100, "P": 50, "K": 80,
        "temperature_min": 15, "temperature_opt": 25, "temperature_max": 30,
        "humidity_min": 70, "humidity_max": 85,
        "ph_min": 5.5, "ph_max": 6.5,
        "rainfall_min": 150, "rainfall_max": 250,
        "season": "perennial",
        "preferred_soils": ["laterite", "red", "loamy"],
        "water_demand": "high",
        "states": ["Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh",
                   "Telangana"],
        "category": "plantation"
    },
    "rubber": {
        "N": 100, "P": 40, "K": 80,
        "temperature_min": 20, "temperature_opt": 27, "temperature_max": 35,
        "humidity_min": 75, "humidity_max": 90,
        "ph_min": 4.5, "ph_max": 6.5,
        "rainfall_min": 200, "rainfall_max": 350,
        "season": "perennial",
        "preferred_soils": ["laterite", "red", "alluvial"],
        "water_demand": "high",
        "states": ["Kerala", "Tamil Nadu", "Karnataka", "Assam",
                   "Tripura", "Goa"],
        "category": "plantation"
    },
    "coconut": {
        "N": 100, "P": 40, "K": 200,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 70, "humidity_max": 85,
        "ph_min": 5.5, "ph_max": 8.0,
        "rainfall_min": 100, "rainfall_max": 250,
        "season": "perennial",
        "preferred_soils": ["alluvial", "sandy", "laterite", "red"],
        "water_demand": "medium",
        "states": ["Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh",
                   "Odisha", "West Bengal", "Goa"],
        "category": "plantation"
    },

    # ─── FRUITS ──────────────────────────────────────────────────────────
    "mango": {
        "N": 100, "P": 50, "K": 100,
        "temperature_min": 22, "temperature_opt": 30, "temperature_max": 40,
        "humidity_min": 40, "humidity_max": 65,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 75, "rainfall_max": 125,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "laterite", "red"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Andhra Pradesh", "Telangana", "Karnataka",
                   "Bihar", "Gujarat", "Tamil Nadu", "Maharashtra"],
        "category": "fruit"
    },
    "banana": {
        "N": 200, "P": 30, "K": 300,
        "temperature_min": 20, "temperature_opt": 27, "temperature_max": 35,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "black"],
        "water_demand": "high",
        "states": ["Tamil Nadu", "Maharashtra", "Karnataka", "Andhra Pradesh",
                   "Gujarat", "Madhya Pradesh", "Assam"],
        "category": "fruit"
    },
    "grapes": {
        "N": 100, "P": 50, "K": 80,
        "temperature_min": 15, "temperature_opt": 25, "temperature_max": 35,
        "humidity_min": 50, "humidity_max": 70,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 90,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Maharashtra", "Karnataka", "Andhra Pradesh", "Telangana",
                   "Tamil Nadu", "Mizoram"],
        "category": "fruit"
    },
    "papaya": {
        "N": 200, "P": 200, "K": 250,
        "temperature_min": 22, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Andhra Pradesh", "Gujarat", "Maharashtra", "Karnataka",
                   "Tamil Nadu", "West Bengal"],
        "category": "fruit"
    },
    "watermelon": {
        "N": 100, "P": 50, "K": 70,
        "temperature_min": 22, "temperature_opt": 32, "temperature_max": 40,
        "humidity_min": 40, "humidity_max": 65,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 40, "rainfall_max": 80,
        "season": "zaid",
        "preferred_soils": ["sandy", "alluvial", "loamy"],
        "water_demand": "medium",
        "states": ["Andhra Pradesh", "Tamil Nadu", "Karnataka", "Rajasthan",
                   "Uttar Pradesh", "Odisha"],
        "category": "fruit"
    },
    "muskmelon": {
        "N": 80, "P": 40, "K": 60,
        "temperature_min": 24, "temperature_opt": 32, "temperature_max": 40,
        "humidity_min": 35, "humidity_max": 60,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 30, "rainfall_max": 70,
        "season": "zaid",
        "preferred_soils": ["sandy", "alluvial", "loamy"],
        "water_demand": "low",
        "states": ["Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Punjab",
                   "Andhra Pradesh"],
        "category": "fruit"
    },
    "pomegranate": {
        "N": 125, "P": 60, "K": 120,
        "temperature_min": 20, "temperature_opt": 30, "temperature_max": 40,
        "humidity_min": 35, "humidity_max": 60,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 75,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "black", "red"],
        "water_demand": "low",
        "states": ["Maharashtra", "Karnataka", "Andhra Pradesh", "Gujarat",
                   "Rajasthan", "Tamil Nadu"],
        "category": "fruit"
    },
    "apple": {
        "N": 70, "P": 35, "K": 70,
        "temperature_min": 5, "temperature_opt": 18, "temperature_max": 25,
        "humidity_min": 55, "humidity_max": 75,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 150,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "red"],
        "water_demand": "medium",
        "states": ["Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand",
                   "Arunachal Pradesh"],
        "category": "fruit"
    },
    "orange (citrus)": {
        "N": 100, "P": 50, "K": 80,
        "temperature_min": 15, "temperature_opt": 25, "temperature_max": 35,
        "humidity_min": 55, "humidity_max": 75,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 75, "rainfall_max": 150,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "red", "laterite"],
        "water_demand": "medium",
        "states": ["Maharashtra", "Madhya Pradesh", "Rajasthan", "Assam",
                   "Karnataka", "Andhra Pradesh"],
        "category": "fruit"
    },
    "guava": {
        "N": 40, "P": 20, "K": 40,
        "temperature_min": 15, "temperature_opt": 28, "temperature_max": 40,
        "humidity_min": 50, "humidity_max": 75,
        "ph_min": 5.0, "ph_max": 7.5,
        "rainfall_min": 75, "rainfall_max": 150,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "low",
        "states": ["Uttar Pradesh", "Maharashtra", "Bihar", "Andhra Pradesh",
                   "Karnataka", "West Bengal"],
        "category": "fruit"
    },
    "litchi": {
        "N": 60, "P": 40, "K": 50,
        "temperature_min": 20, "temperature_opt": 26, "temperature_max": 32,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "red"],
        "water_demand": "medium",
        "states": ["Bihar", "West Bengal", "Uttar Pradesh", "Jharkhand",
                   "Assam", "Punjab", "Himachal Pradesh"],
        "category": "fruit"
    },
    "sapota (chikoo)": {
        "N": 30, "P": 20, "K": 50,
        "temperature_min": 20, "temperature_opt": 30, "temperature_max": 40,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "sandy", "laterite"],
        "water_demand": "medium",
        "states": ["Gujarat", "Maharashtra", "Karnataka", "Tamil Nadu",
                   "Andhra Pradesh", "West Bengal"],
        "category": "fruit"
    },

    # ─── VEGETABLES ──────────────────────────────────────────────────────
    "potato": {
        "N": 180, "P": 80, "K": 150,
        "temperature_min": 10, "temperature_opt": 18, "temperature_max": 24,
        "humidity_min": 65, "humidity_max": 80,
        "ph_min": 5.0, "ph_max": 6.5,
        "rainfall_min": 75, "rainfall_max": 120,
        "season": "rabi",
        "preferred_soils": ["alluvial", "sandy loam", "loamy"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "West Bengal", "Bihar", "Gujarat",
                   "Madhya Pradesh", "Punjab", "Assam"],
        "category": "vegetable"
    },
    "tomato": {
        "N": 120, "P": 80, "K": 120,
        "temperature_min": 17, "temperature_opt": 24, "temperature_max": 30,
        "humidity_min": 55, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.0,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Andhra Pradesh", "Karnataka", "Maharashtra", "Madhya Pradesh",
                   "Gujarat", "Odisha", "West Bengal"],
        "category": "vegetable"
    },
    "onion": {
        "N": 100, "P": 50, "K": 100,
        "temperature_min": 12, "temperature_opt": 22, "temperature_max": 30,
        "humidity_min": 50, "humidity_max": 70,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam", "black"],
        "water_demand": "medium",
        "states": ["Maharashtra", "Karnataka", "Madhya Pradesh", "Gujarat",
                   "Bihar", "Andhra Pradesh", "Rajasthan"],
        "category": "vegetable"
    },

    # ─── SPICES ──────────────────────────────────────────────────────────
    "turmeric": {
        "N": 60, "P": 50, "K": 120,
        "temperature_min": 20, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 65, "humidity_max": 85,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "red", "laterite"],
        "water_demand": "high",
        "states": ["Andhra Pradesh", "Telangana", "Odisha", "Tamil Nadu",
                   "Karnataka", "West Bengal", "Assam"],
        "category": "spice"
    },
    "ginger": {
        "N": 75, "P": 50, "K": 75,
        "temperature_min": 19, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 5.5, "ph_max": 6.5,
        "rainfall_min": 150, "rainfall_max": 300,
        "season": "kharif",
        "preferred_soils": ["red", "loamy", "laterite", "alluvial"],
        "water_demand": "high",
        "states": ["Kerala", "Meghalaya", "Odisha", "Arunachal Pradesh",
                   "West Bengal", "Andhra Pradesh", "Karnataka"],
        "category": "spice"
    },
    "chilli (mirchi)": {
        "N": 100, "P": 60, "K": 80,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 37,
        "humidity_min": 55, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "black", "red"],
        "water_demand": "medium",
        "states": ["Andhra Pradesh", "Telangana", "Karnataka", "Maharashtra",
                   "Odisha", "Tamil Nadu", "West Bengal"],
        "category": "spice"
    },
    "black pepper": {
        "N": 50, "P": 50, "K": 150,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 75, "humidity_max": 95,
        "ph_min": 5.0, "ph_max": 6.5,
        "rainfall_min": 150, "rainfall_max": 300,
        "season": "perennial",
        "preferred_soils": ["red", "laterite", "loamy"],
        "water_demand": "high",
        "states": ["Kerala", "Karnataka", "Tamil Nadu", "Andhra Pradesh"],
        "category": "spice"
    },
    "cardamom": {
        "N": 75, "P": 75, "K": 75,
        "temperature_min": 10, "temperature_opt": 22, "temperature_max": 30,
        "humidity_min": 75, "humidity_max": 90,
        "ph_min": 5.0, "ph_max": 6.5,
        "rainfall_min": 150, "rainfall_max": 400,
        "season": "perennial",
        "preferred_soils": ["red", "laterite", "loamy"],
        "water_demand": "high",
        "states": ["Kerala", "Karnataka", "Tamil Nadu", "Sikkim"],
        "category": "spice"
    },
    "coriander (dhania)": {
        "N": 60, "P": 30, "K": 30,
        "temperature_min": 15, "temperature_opt": 25, "temperature_max": 30,
        "humidity_min": 45, "humidity_max": 70,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 40, "rainfall_max": 80,
        "season": "rabi",
        "preferred_soils": ["alluvial", "sandy loam", "loamy"],
        "water_demand": "low",
        "states": ["Rajasthan", "Madhya Pradesh", "Andhra Pradesh", "Gujarat",
                   "Tamil Nadu", "Karnataka"],
        "category": "spice"
    },
    "cumin (jeera)": {
        "N": 30, "P": 30, "K": 20,
        "temperature_min": 10, "temperature_opt": 22, "temperature_max": 30,
        "humidity_min": 30, "humidity_max": 55,
        "ph_min": 6.5, "ph_max": 8.0,
        "rainfall_min": 20, "rainfall_max": 45,
        "season": "rabi",
        "preferred_soils": ["sandy loam", "alluvial", "loamy"],
        "water_demand": "low",
        "states": ["Rajasthan", "Gujarat"],
        "category": "spice"
    },
    "fenugreek (methi)": {
        "N": 20, "P": 40, "K": 20,
        "temperature_min": 10, "temperature_opt": 22, "temperature_max": 32,
        "humidity_min": 35, "humidity_max": 65,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 40, "rainfall_max": 80,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "low",
        "states": ["Rajasthan", "Gujarat", "Madhya Pradesh", "Uttar Pradesh",
                   "Tamil Nadu", "Punjab", "Haryana"],
        "category": "spice"
    },

    # ─── FODDER / OTHER ──────────────────────────────────────────────────
    "berseem (clover fodder)": {
        "N": 20, "P": 60, "K": 30,
        "temperature_min": 8, "temperature_opt": 18, "temperature_max": 25,
        "humidity_min": 45, "humidity_max": 65,
        "ph_min": 6.5, "ph_max": 8.0,
        "rainfall_min": 50, "rainfall_max": 90,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "clayey"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Punjab", "Haryana", "Bihar", "Rajasthan"],
        "category": "fodder"
    },
    "amaranth (rajgira)": {
        "N": 80, "P": 40, "K": 40,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 40, "humidity_max": 70,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "sandy loam", "red"],
        "water_demand": "low",
        "states": ["Maharashtra", "Gujarat", "Uttar Pradesh", "Rajasthan",
                   "Karnataka", "Himachal Pradesh"],
        "category": "cereal"
    },

    # ─── VEGETABLES (GOURDS) ─────────────────────────────────────────────
    "bitter gourd (karela)": {
        "N": 80, "P": 60, "K": 60,
        "temperature_min": 25, "temperature_opt": 32, "temperature_max": 40,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.0,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "kharif",
        "preferred_soils": ["alluvial", "sandy loam", "loamy", "red"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Bihar", "West Bengal", "Andhra Pradesh",
                   "Karnataka", "Tamil Nadu", "Maharashtra", "Odisha"],
        "category": "vegetable"
    },
    "bottle gourd (lauki)": {
        "N": 80, "P": 60, "K": 60,
        "temperature_min": 22, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 55, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "zaid",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Bihar", "West Bengal", "Andhra Pradesh",
                   "Haryana", "Punjab", "Rajasthan"],
        "category": "vegetable"
    },
    "ridge gourd (turai)": {
        "N": 80, "P": 50, "K": 50,
        "temperature_min": 25, "temperature_opt": 32, "temperature_max": 40,
        "humidity_min": 60, "humidity_max": 85,
        "ph_min": 6.0, "ph_max": 7.0,
        "rainfall_min": 70, "rainfall_max": 130,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Andhra Pradesh", "Tamil Nadu", "Karnataka", "Maharashtra",
                   "West Bengal", "Odisha", "Bihar"],
        "category": "vegetable"
    },
    "sponge gourd (ghiya turai)": {
        "N": 70, "P": 50, "K": 50,
        "temperature_min": 24, "temperature_opt": 32, "temperature_max": 38,
        "humidity_min": 60, "humidity_max": 85,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["West Bengal", "Bihar", "Uttar Pradesh", "Andhra Pradesh",
                   "Tamil Nadu", "Karnataka"],
        "category": "vegetable"
    },
    "snake gourd (chichinda)": {
        "N": 70, "P": 50, "K": 50,
        "temperature_min": 25, "temperature_opt": 33, "temperature_max": 40,
        "humidity_min": 65, "humidity_max": 85,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 80, "rainfall_max": 140,
        "season": "kharif",
        "preferred_soils": ["loamy", "alluvial", "sandy loam"],
        "water_demand": "medium",
        "states": ["Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh",
                   "West Bengal", "Maharashtra"],
        "category": "vegetable"
    },
    "ash gourd (petha)": {
        "N": 80, "P": 60, "K": 60,
        "temperature_min": 22, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Karnataka", "Andhra Pradesh", "Tamil Nadu",
                   "West Bengal", "Maharashtra"],
        "category": "vegetable"
    },
    "pointed gourd (parwal)": {
        "N": 80, "P": 60, "K": 60,
        "temperature_min": 22, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 70, "rainfall_max": 130,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Bihar", "West Bengal", "Odisha",
                   "Assam", "Madhya Pradesh"],
        "category": "vegetable"
    },
    "ivy gourd (tindora/kundru)": {
        "N": 60, "P": 40, "K": 40,
        "temperature_min": 25, "temperature_opt": 32, "temperature_max": 40,
        "humidity_min": 60, "humidity_max": 85,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 75, "rainfall_max": 150,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "red"],
        "water_demand": "medium",
        "states": ["Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka",
                   "Gujarat", "Maharashtra", "Odisha"],
        "category": "vegetable"
    },
    "spine gourd (kantola)": {
        "N": 60, "P": 40, "K": 40,
        "temperature_min": 25, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 65, "humidity_max": 85,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "kharif",
        "preferred_soils": ["loamy", "alluvial", "red"],
        "water_demand": "medium",
        "states": ["Maharashtra", "Gujarat", "Madhya Pradesh", "Rajasthan",
                   "Odisha", "Chhattisgarh"],
        "category": "vegetable"
    },
    "pumpkin (kaddu)": {
        "N": 80, "P": 60, "K": 80,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 55, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "zaid",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Bihar", "West Bengal", "Odisha",
                   "Assam", "Madhya Pradesh", "Karnataka"],
        "category": "vegetable"
    },
    "cucumber (kheera)": {
        "N": 80, "P": 60, "K": 60,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 55, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.0,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "zaid",
        "preferred_soils": ["sandy loam", "alluvial", "loamy"],
        "water_demand": "medium",
        "states": ["Andhra Pradesh", "Uttar Pradesh", "Karnataka", "Tamil Nadu",
                   "West Bengal", "Maharashtra", "Punjab", "Haryana"],
        "category": "vegetable"
    },

    # ─── VEGETABLES (LEAFY & OTHERS) ─────────────────────────────────────
    "brinjal (eggplant/baingan)": {
        "N": 120, "P": 60, "K": 80,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 55, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "black", "sandy loam"],
        "water_demand": "medium",
        "states": ["West Bengal", "Odisha", "Gujarat", "Maharashtra",
                   "Andhra Pradesh", "Bihar", "Uttar Pradesh", "Karnataka"],
        "category": "vegetable"
    },
    "okra (bhindi/lady finger)": {
        "N": 100, "P": 50, "K": 50,
        "temperature_min": 22, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 55, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "sandy loam", "black"],
        "water_demand": "medium",
        "states": ["Andhra Pradesh", "Uttar Pradesh", "West Bengal", "Gujarat",
                   "Karnataka", "Tamil Nadu", "Maharashtra", "Bihar"],
        "category": "vegetable"
    },
    "cauliflower": {
        "N": 120, "P": 60, "K": 60,
        "temperature_min": 10, "temperature_opt": 18, "temperature_max": 25,
        "humidity_min": 65, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.0,
        "rainfall_min": 60, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["West Bengal", "Bihar", "Uttar Pradesh", "Odisha",
                   "Madhya Pradesh", "Haryana", "Gujarat"],
        "category": "vegetable"
    },
    "cabbage": {
        "N": 120, "P": 60, "K": 60,
        "temperature_min": 10, "temperature_opt": 18, "temperature_max": 24,
        "humidity_min": 65, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["West Bengal", "Odisha", "Bihar", "Assam",
                   "Maharashtra", "Himachal Pradesh", "Karnataka"],
        "category": "vegetable"
    },
    "spinach (palak)": {
        "N": 80, "P": 40, "K": 60,
        "temperature_min": 10, "temperature_opt": 20, "temperature_max": 28,
        "humidity_min": 50, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 40, "rainfall_max": 80,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Punjab", "Haryana", "Rajasthan",
                   "Himachal Pradesh", "Uttarakhand", "Gujarat"],
        "category": "vegetable"
    },
    "fenugreek leaves (methi saag)": {
        "N": 40, "P": 30, "K": 30,
        "temperature_min": 10, "temperature_opt": 20, "temperature_max": 28,
        "humidity_min": 40, "humidity_max": 70,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 40, "rainfall_max": 80,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "low",
        "states": ["Rajasthan", "Gujarat", "Punjab", "Haryana",
                   "Uttar Pradesh", "Madhya Pradesh"],
        "category": "vegetable"
    },
    "carrot (gajar)": {
        "N": 80, "P": 60, "K": 80,
        "temperature_min": 10, "temperature_opt": 18, "temperature_max": 25,
        "humidity_min": 55, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.0,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["sandy loam", "alluvial", "loamy"],
        "water_demand": "medium",
        "states": ["Punjab", "Haryana", "Rajasthan", "Uttar Pradesh",
                   "Himachal Pradesh", "Karnataka", "Andhra Pradesh"],
        "category": "vegetable"
    },
    "radish (mooli)": {
        "N": 60, "P": 40, "K": 60,
        "temperature_min": 10, "temperature_opt": 18, "temperature_max": 25,
        "humidity_min": 50, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.0,
        "rainfall_min": 40, "rainfall_max": 90,
        "season": "rabi",
        "preferred_soils": ["sandy loam", "alluvial", "loamy"],
        "water_demand": "low",
        "states": ["Uttar Pradesh", "Bihar", "Punjab", "West Bengal",
                   "Haryana", "Madhya Pradesh", "Rajasthan"],
        "category": "vegetable"
    },
    "peas (matar)": {
        "N": 20, "P": 60, "K": 40,
        "temperature_min": 8, "temperature_opt": 16, "temperature_max": 24,
        "humidity_min": 50, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["alluvial", "sandy loam", "loamy"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Himachal Pradesh", "Punjab", "Haryana",
                   "Madhya Pradesh", "Bihar", "Uttarakhand"],
        "category": "vegetable"
    },
    "capsicum (shimla mirch)": {
        "N": 100, "P": 60, "K": 80,
        "temperature_min": 18, "temperature_opt": 25, "temperature_max": 32,
        "humidity_min": 55, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.0,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Himachal Pradesh", "Karnataka", "Maharashtra", "Andhra Pradesh",
                   "Uttar Pradesh", "Haryana", "Punjab"],
        "category": "vegetable"
    },
    "garlic (lahsun)": {
        "N": 100, "P": 50, "K": 80,
        "temperature_min": 12, "temperature_opt": 20, "temperature_max": 28,
        "humidity_min": 50, "humidity_max": 70,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam", "black"],
        "water_demand": "medium",
        "states": ["Madhya Pradesh", "Gujarat", "Rajasthan", "Uttar Pradesh",
                   "Maharashtra", "Andhra Pradesh", "Haryana"],
        "category": "vegetable"
    },
    "broccoli": {
        "N": 120, "P": 60, "K": 60,
        "temperature_min": 8, "temperature_opt": 15, "temperature_max": 22,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.0,
        "rainfall_min": 60, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Himachal Pradesh", "Uttarakhand", "Punjab", "Haryana",
                   "Karnataka", "Maharashtra"],
        "category": "vegetable"
    },
    "sweet potato (shakarkand)": {
        "N": 80, "P": 50, "K": 100,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 75, "rainfall_max": 150,
        "season": "kharif",
        "preferred_soils": ["sandy loam", "alluvial", "red"],
        "water_demand": "medium",
        "states": ["Uttar Pradesh", "Bihar", "Odisha", "West Bengal",
                   "Madhya Pradesh", "Andhra Pradesh"],
        "category": "vegetable"
    },
    "colocasia (arbi/taro)": {
        "N": 100, "P": 60, "K": 100,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "clayey"],
        "water_demand": "high",
        "states": ["Uttar Pradesh", "Bihar", "West Bengal", "Kerala",
                   "Andhra Pradesh", "Maharashtra", "Gujarat"],
        "category": "vegetable"
    },
    "drumstick (moringa/sahjan)": {
        "N": 30, "P": 20, "K": 30,
        "temperature_min": 20, "temperature_opt": 30, "temperature_max": 40,
        "humidity_min": 40, "humidity_max": 70,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 50, "rainfall_max": 150,
        "season": "perennial",
        "preferred_soils": ["alluvial", "sandy loam", "red", "loamy"],
        "water_demand": "low",
        "states": ["Andhra Pradesh", "Tamil Nadu", "Karnataka", "Maharashtra",
                   "Gujarat", "Rajasthan", "Uttar Pradesh"],
        "category": "vegetable"
    },
    "cluster beans (guar)": {
        "N": 25, "P": 40, "K": 25,
        "temperature_min": 25, "temperature_opt": 32, "temperature_max": 40,
        "humidity_min": 30, "humidity_max": 65,
        "ph_min": 6.5, "ph_max": 8.5,
        "rainfall_min": 25, "rainfall_max": 60,
        "season": "kharif",
        "preferred_soils": ["sandy loam", "alluvial", "sandy"],
        "water_demand": "low",
        "states": ["Rajasthan", "Haryana", "Punjab", "Gujarat",
                   "Uttar Pradesh", "Madhya Pradesh"],
        "category": "vegetable"
    },
    "french beans (rajmash)": {
        "N": 25, "P": 60, "K": 40,
        "temperature_min": 15, "temperature_opt": 22, "temperature_max": 28,
        "humidity_min": 55, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Himachal Pradesh", "Uttarakhand", "Karnataka", "Tamil Nadu",
                   "Maharashtra", "Punjab", "West Bengal"],
        "category": "vegetable"
    },
    "amaranth leaves (chaulai)": {
        "N": 60, "P": 40, "K": 40,
        "temperature_min": 20, "temperature_opt": 30, "temperature_max": 38,
        "humidity_min": 50, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 120,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "sandy loam", "red"],
        "water_demand": "low",
        "states": ["Uttar Pradesh", "Bihar", "Maharashtra", "Gujarat",
                   "Karnataka", "West Bengal", "Rajasthan"],
        "category": "vegetable"
    },

    # ─── MILLETS (ADDITIONAL) ─────────────────────────────────────────────
    "foxtail millet (kangni)": {
        "N": 40, "P": 20, "K": 20,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 35, "humidity_max": 65,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 40, "rainfall_max": 80,
        "season": "kharif",
        "preferred_soils": ["sandy loam", "red", "alluvial"],
        "water_demand": "low",
        "states": ["Andhra Pradesh", "Telangana", "Tamil Nadu", "Rajasthan",
                   "Maharashtra", "Karnataka", "Gujarat"],
        "category": "millet"
    },
    "kodo millet (kodo)": {
        "N": 40, "P": 20, "K": 20,
        "temperature_min": 22, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 45, "humidity_max": 75,
        "ph_min": 5.0, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["red", "sandy loam", "laterite"],
        "water_demand": "low",
        "states": ["Madhya Pradesh", "Chhattisgarh", "Odisha", "Maharashtra",
                   "Tamil Nadu", "Karnataka"],
        "category": "millet"
    },
    "little millet (kutki)": {
        "N": 40, "P": 20, "K": 20,
        "temperature_min": 20, "temperature_opt": 27, "temperature_max": 35,
        "humidity_min": 45, "humidity_max": 75,
        "ph_min": 5.0, "ph_max": 7.5,
        "rainfall_min": 45, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["red", "sandy loam", "laterite", "alluvial"],
        "water_demand": "low",
        "states": ["Chhattisgarh", "Jharkhand", "Odisha", "Madhya Pradesh",
                   "Maharashtra", "Andhra Pradesh"],
        "category": "millet"
    },
    "proso millet (cheena)": {
        "N": 40, "P": 20, "K": 20,
        "temperature_min": 18, "temperature_opt": 26, "temperature_max": 35,
        "humidity_min": 35, "humidity_max": 65,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 40, "rainfall_max": 80,
        "season": "kharif",
        "preferred_soils": ["sandy loam", "alluvial", "red"],
        "water_demand": "low",
        "states": ["Rajasthan", "Gujarat", "Uttar Pradesh", "Maharashtra",
                   "Tamil Nadu"],
        "category": "millet"
    },
    "barnyard millet (sanwa)": {
        "N": 50, "P": 25, "K": 25,
        "temperature_min": 20, "temperature_opt": 27, "temperature_max": 35,
        "humidity_min": 50, "humidity_max": 80,
        "ph_min": 5.0, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["red", "sandy loam", "alluvial", "laterite"],
        "water_demand": "low",
        "states": ["Uttarakhand", "Himachal Pradesh", "Jharkhand", "Odisha",
                   "Tamil Nadu", "Karnataka"],
        "category": "millet"
    },

    # ─── FRUITS (ADDITIONAL) ──────────────────────────────────────────────
    "pineapple (ananas)": {
        "N": 100, "P": 30, "K": 150,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 4.5, "ph_max": 6.0,
        "rainfall_min": 100, "rainfall_max": 250,
        "season": "perennial",
        "preferred_soils": ["laterite", "sandy loam", "red"],
        "water_demand": "medium",
        "states": ["Assam", "Meghalaya", "Tripura", "West Bengal",
                   "Kerala", "Karnataka", "Manipur"],
        "category": "fruit"
    },
    "jackfruit (kathal)": {
        "N": 60, "P": 30, "K": 60,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 65, "humidity_max": 85,
        "ph_min": 5.0, "ph_max": 7.5,
        "rainfall_min": 100, "rainfall_max": 250,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "red", "laterite"],
        "water_demand": "medium",
        "states": ["Kerala", "Tamil Nadu", "Karnataka", "West Bengal",
                   "Assam", "Bihar", "Odisha"],
        "category": "fruit"
    },
    "custard apple (sitaphal)": {
        "N": 50, "P": 30, "K": 50,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 50, "humidity_max": 75,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 75, "rainfall_max": 150,
        "season": "perennial",
        "preferred_soils": ["alluvial", "sandy loam", "red", "loamy"],
        "water_demand": "low",
        "states": ["Andhra Pradesh", "Telangana", "Gujarat", "Maharashtra",
                   "Karnataka", "Madhya Pradesh", "Rajasthan"],
        "category": "fruit"
    },
    "amla (indian gooseberry)": {
        "N": 50, "P": 25, "K": 50,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 40,
        "humidity_min": 40, "humidity_max": 70,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "perennial",
        "preferred_soils": ["alluvial", "sandy loam", "red", "loamy"],
        "water_demand": "low",
        "states": ["Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Gujarat",
                   "Andhra Pradesh", "Tamil Nadu", "Maharashtra"],
        "category": "fruit"
    },
    "tamarind (imli)": {
        "N": 30, "P": 20, "K": 40,
        "temperature_min": 22, "temperature_opt": 32, "temperature_max": 42,
        "humidity_min": 40, "humidity_max": 70,
        "ph_min": 5.5, "ph_max": 8.0,
        "rainfall_min": 50, "rainfall_max": 150,
        "season": "perennial",
        "preferred_soils": ["alluvial", "sandy loam", "red", "black"],
        "water_demand": "low",
        "states": ["Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka",
                   "Maharashtra", "Madhya Pradesh", "Gujarat"],
        "category": "fruit"
    },
    "fig (anjeer)": {
        "N": 60, "P": 30, "K": 60,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 35, "humidity_max": 65,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "low",
        "states": ["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu",
                   "Uttar Pradesh", "Rajasthan"],
        "category": "fruit"
    },
    "ber (indian jujube)": {
        "N": 40, "P": 20, "K": 40,
        "temperature_min": 20, "temperature_opt": 32, "temperature_max": 45,
        "humidity_min": 25, "humidity_max": 60,
        "ph_min": 6.0, "ph_max": 8.5,
        "rainfall_min": 25, "rainfall_max": 75,
        "season": "perennial",
        "preferred_soils": ["alluvial", "sandy loam", "red", "black"],
        "water_demand": "low",
        "states": ["Rajasthan", "Uttar Pradesh", "Bihar", "Maharashtra",
                   "Gujarat", "Haryana", "Punjab"],
        "category": "fruit"
    },
    "strawberry": {
        "N": 80, "P": 40, "K": 60,
        "temperature_min": 8, "temperature_opt": 18, "temperature_max": 25,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 6.5,
        "rainfall_min": 75, "rainfall_max": 150,
        "season": "rabi",
        "preferred_soils": ["sandy loam", "loamy", "alluvial"],
        "water_demand": "medium",
        "states": ["Himachal Pradesh", "Uttarakhand", "Maharashtra",
                   "Punjab", "Haryana", "Jammu & Kashmir"],
        "category": "fruit"
    },
    "avocado": {
        "N": 80, "P": 40, "K": 80,
        "temperature_min": 15, "temperature_opt": 25, "temperature_max": 33,
        "humidity_min": 65, "humidity_max": 85,
        "ph_min": 5.0, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["loamy", "alluvial", "laterite", "red"],
        "water_demand": "medium",
        "states": ["Tamil Nadu", "Kerala", "Karnataka", "Sikkim",
                   "Nagaland", "Meghalaya"],
        "category": "fruit"
    },
    "passion fruit": {
        "N": 60, "P": 30, "K": 80,
        "temperature_min": 18, "temperature_opt": 25, "temperature_max": 32,
        "humidity_min": 65, "humidity_max": 85,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["loamy", "laterite", "alluvial"],
        "water_demand": "medium",
        "states": ["Kerala", "Tamil Nadu", "Karnataka", "Manipur",
                   "Nagaland", "Meghalaya", "Sikkim"],
        "category": "fruit"
    },
    "dragon fruit": {
        "N": 50, "P": 30, "K": 60,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 40, "humidity_max": 70,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 40, "rainfall_max": 80,
        "season": "perennial",
        "preferred_soils": ["sandy loam", "loamy", "alluvial"],
        "water_demand": "low",
        "states": ["Gujarat", "Karnataka", "Andhra Pradesh", "Maharashtra",
                   "Tamil Nadu", "Telangana"],
        "category": "fruit"
    },
    "kiwi": {
        "N": 80, "P": 40, "K": 80,
        "temperature_min": 5, "temperature_opt": 18, "temperature_max": 25,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["loamy", "alluvial", "sandy loam"],
        "water_demand": "medium",
        "states": ["Himachal Pradesh", "Uttarakhand", "Jammu & Kashmir",
                   "Sikkim", "Arunachal Pradesh", "Nagaland"],
        "category": "fruit"
    },

    # ─── SPICES (ADDITIONAL) ──────────────────────────────────────────────
    "ajwain (carom seeds)": {
        "N": 30, "P": 20, "K": 20,
        "temperature_min": 12, "temperature_opt": 22, "temperature_max": 30,
        "humidity_min": 35, "humidity_max": 60,
        "ph_min": 6.5, "ph_max": 8.0,
        "rainfall_min": 30, "rainfall_max": 60,
        "season": "rabi",
        "preferred_soils": ["sandy loam", "alluvial", "loamy"],
        "water_demand": "low",
        "states": ["Rajasthan", "Gujarat", "Madhya Pradesh", "Uttar Pradesh"],
        "category": "spice"
    },
    "fennel (saunf)": {
        "N": 40, "P": 30, "K": 30,
        "temperature_min": 10, "temperature_opt": 22, "temperature_max": 30,
        "humidity_min": 35, "humidity_max": 65,
        "ph_min": 6.5, "ph_max": 8.0,
        "rainfall_min": 40, "rainfall_max": 80,
        "season": "rabi",
        "preferred_soils": ["alluvial", "sandy loam", "loamy"],
        "water_demand": "low",
        "states": ["Rajasthan", "Gujarat", "Uttar Pradesh", "Andhra Pradesh",
                   "Punjab", "Haryana"],
        "category": "spice"
    },
    "clove (laung)": {
        "N": 30, "P": 30, "K": 50,
        "temperature_min": 15, "temperature_opt": 25, "temperature_max": 32,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 5.0, "ph_max": 6.5,
        "rainfall_min": 150, "rainfall_max": 300,
        "season": "perennial",
        "preferred_soils": ["laterite", "red", "loamy"],
        "water_demand": "high",
        "states": ["Kerala", "Tamil Nadu", "Karnataka"],
        "category": "spice"
    },
    "nutmeg (jaiphal)": {
        "N": 30, "P": 30, "K": 50,
        "temperature_min": 18, "temperature_opt": 27, "temperature_max": 35,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 150, "rainfall_max": 300,
        "season": "perennial",
        "preferred_soils": ["laterite", "red", "loamy"],
        "water_demand": "high",
        "states": ["Kerala", "Tamil Nadu", "Karnataka", "Goa"],
        "category": "spice"
    },
    "star anise": {
        "N": 30, "P": 20, "K": 40,
        "temperature_min": 15, "temperature_opt": 23, "temperature_max": 30,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 150, "rainfall_max": 300,
        "season": "perennial",
        "preferred_soils": ["loamy", "laterite", "red"],
        "water_demand": "high",
        "states": ["Arunachal Pradesh", "Manipur", "Nagaland", "Tamil Nadu"],
        "category": "spice"
    },
    "bay leaf (tejpatta)": {
        "N": 30, "P": 20, "K": 30,
        "temperature_min": 12, "temperature_opt": 22, "temperature_max": 30,
        "humidity_min": 60, "humidity_max": 85,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["loamy", "alluvial", "laterite"],
        "water_demand": "medium",
        "states": ["Uttarakhand", "Meghalaya", "Assam", "Manipur",
                   "Tamil Nadu", "Karnataka"],
        "category": "spice"
    },
    "mustard seeds (rai)": {
        "N": 60, "P": 30, "K": 25,
        "temperature_min": 10, "temperature_opt": 20, "temperature_max": 27,
        "humidity_min": 35, "humidity_max": 65,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 25, "rainfall_max": 75,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "low",
        "states": ["Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "West Bengal",
                   "Haryana", "Bihar"],
        "category": "spice"
    },

    # ─── PLANTATION / NUT CROPS (ADDITIONAL) ─────────────────────────────
    "areca nut (supari)": {
        "N": 80, "P": 30, "K": 120,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 150, "rainfall_max": 300,
        "season": "perennial",
        "preferred_soils": ["alluvial", "laterite", "red", "loamy"],
        "water_demand": "high",
        "states": ["Karnataka", "Kerala", "Assam", "West Bengal",
                   "Tamil Nadu", "Goa", "Meghalaya"],
        "category": "plantation"
    },
    "cashew (kaju)": {
        "N": 30, "P": 20, "K": 30,
        "temperature_min": 20, "temperature_opt": 30, "temperature_max": 40,
        "humidity_min": 60, "humidity_max": 85,
        "ph_min": 4.5, "ph_max": 6.5,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["laterite", "sandy loam", "red"],
        "water_demand": "medium",
        "states": ["Maharashtra", "Kerala", "Goa", "Karnataka",
                   "Andhra Pradesh", "Tamil Nadu", "Odisha"],
        "category": "plantation"
    },
    "betel vine (pan)": {
        "N": 60, "P": 40, "K": 60,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 35,
        "humidity_min": 70, "humidity_max": 90,
        "ph_min": 5.5, "ph_max": 7.0,
        "rainfall_min": 100, "rainfall_max": 250,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "high",
        "states": ["West Bengal", "Bihar", "Odisha", "Andhra Pradesh",
                   "Tamil Nadu", "Uttar Pradesh", "Maharashtra"],
        "category": "plantation"
    },

    # ─── MEDICINAL & AROMATIC CROPS ───────────────────────────────────────
    "ashwagandha": {
        "N": 20, "P": 15, "K": 15,
        "temperature_min": 20, "temperature_opt": 30, "temperature_max": 40,
        "humidity_min": 25, "humidity_max": 60,
        "ph_min": 7.5, "ph_max": 8.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["sandy loam", "red", "alluvial"],
        "water_demand": "low",
        "states": ["Madhya Pradesh", "Rajasthan", "Gujarat", "Uttar Pradesh",
                   "Punjab", "Haryana"],
        "category": "medicinal"
    },
    "aloe vera (ghrita kumari)": {
        "N": 20, "P": 20, "K": 30,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 40,
        "humidity_min": 25, "humidity_max": 65,
        "ph_min": 7.0, "ph_max": 8.5,
        "rainfall_min": 25, "rainfall_max": 60,
        "season": "perennial",
        "preferred_soils": ["sandy loam", "alluvial", "red"],
        "water_demand": "low",
        "states": ["Rajasthan", "Gujarat", "Maharashtra", "Andhra Pradesh",
                   "Tamil Nadu", "Madhya Pradesh"],
        "category": "medicinal"
    },
    "isabgol (psyllium)": {
        "N": 20, "P": 20, "K": 15,
        "temperature_min": 12, "temperature_opt": 20, "temperature_max": 30,
        "humidity_min": 25, "humidity_max": 55,
        "ph_min": 7.0, "ph_max": 8.5,
        "rainfall_min": 20, "rainfall_max": 60,
        "season": "rabi",
        "preferred_soils": ["sandy loam", "alluvial", "loamy"],
        "water_demand": "low",
        "states": ["Gujarat", "Rajasthan", "Madhya Pradesh", "Uttar Pradesh"],
        "category": "medicinal"
    },
    "stevia": {
        "N": 60, "P": 30, "K": 40,
        "temperature_min": 15, "temperature_opt": 25, "temperature_max": 35,
        "humidity_min": 55, "humidity_max": 80,
        "ph_min": 6.5, "ph_max": 7.5,
        "rainfall_min": 100, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["sandy loam", "loamy", "alluvial"],
        "water_demand": "medium",
        "states": ["Maharashtra", "Karnataka", "Himachal Pradesh", "Uttarakhand",
                   "Punjab", "Haryana"],
        "category": "medicinal"
    },
    "tulsi (holy basil)": {
        "N": 30, "P": 20, "K": 20,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 50, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 150,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "low",
        "states": ["Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Gujarat",
                   "Maharashtra", "Karnataka", "Bihar"],
        "category": "medicinal"
    },
    "lemongrass": {
        "N": 80, "P": 40, "K": 40,
        "temperature_min": 20, "temperature_opt": 30, "temperature_max": 40,
        "humidity_min": 55, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 75, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["red", "laterite", "alluvial", "sandy loam"],
        "water_demand": "low",
        "states": ["Kerala", "Assam", "Uttarakhand", "West Bengal",
                   "Karnataka", "Tamil Nadu", "Maharashtra"],
        "category": "medicinal"
    },
    "safflower (kusum)": {
        "N": 60, "P": 40, "K": 20,
        "temperature_min": 15, "temperature_opt": 25, "temperature_max": 35,
        "humidity_min": 30, "humidity_max": 60,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 30, "rainfall_max": 75,
        "season": "rabi",
        "preferred_soils": ["black", "alluvial", "loamy"],
        "water_demand": "low",
        "states": ["Maharashtra", "Karnataka", "Andhra Pradesh", "Telangana",
                   "Madhya Pradesh", "Gujarat", "Rajasthan"],
        "category": "oilseed"
    },
    "niger seed (ramtil)": {
        "N": 40, "P": 20, "K": 20,
        "temperature_min": 18, "temperature_opt": 26, "temperature_max": 32,
        "humidity_min": 60, "humidity_max": 85,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 75, "rainfall_max": 150,
        "season": "kharif",
        "preferred_soils": ["red", "laterite", "sandy loam"],
        "water_demand": "low",
        "states": ["Odisha", "Chhattisgarh", "Jharkhand", "Andhra Pradesh",
                   "Maharashtra", "Gujarat", "Karnataka"],
        "category": "oilseed"
    },

    # ─── FLOWERS ─────────────────────────────────────────────────────────
    "rose": {
        "N": 80, "P": 60, "K": 80,
        "temperature_min": 12, "temperature_opt": 22, "temperature_max": 30,
        "humidity_min": 55, "humidity_max": 75,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Karnataka", "Tamil Nadu", "Maharashtra", "Uttar Pradesh",
                   "Haryana", "Punjab", "Rajasthan"],
        "category": "flower"
    },
    "marigold (genda)": {
        "N": 60, "P": 40, "K": 60,
        "temperature_min": 15, "temperature_opt": 25, "temperature_max": 35,
        "humidity_min": 50, "humidity_max": 75,
        "ph_min": 5.5, "ph_max": 7.5,
        "rainfall_min": 50, "rainfall_max": 100,
        "season": "kharif",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Maharashtra",
                   "Uttar Pradesh", "West Bengal", "Bihar"],
        "category": "flower"
    },
    "jasmine (mogra/chameli)": {
        "N": 40, "P": 30, "K": 40,
        "temperature_min": 18, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 55, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 8.0,
        "rainfall_min": 60, "rainfall_max": 120,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "sandy loam"],
        "water_demand": "medium",
        "states": ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Maharashtra",
                   "Uttar Pradesh", "West Bengal"],
        "category": "flower"
    },
    "tuberose (rajnigandha)": {
        "N": 60, "P": 40, "K": 60,
        "temperature_min": 20, "temperature_opt": 28, "temperature_max": 38,
        "humidity_min": 60, "humidity_max": 80,
        "ph_min": 6.0, "ph_max": 7.5,
        "rainfall_min": 75, "rainfall_max": 150,
        "season": "kharif",
        "preferred_soils": ["alluvial", "sandy loam", "loamy"],
        "water_demand": "medium",
        "states": ["West Bengal", "Karnataka", "Tamil Nadu", "Andhra Pradesh",
                   "Maharashtra", "Uttar Pradesh"],
        "category": "flower"
    },

    # ─── FODDER (ADDITIONAL) ─────────────────────────────────────────────
    "napier grass (elephant grass)": {
        "N": 150, "P": 50, "K": 80,
        "temperature_min": 20, "temperature_opt": 30, "temperature_max": 40,
        "humidity_min": 55, "humidity_max": 85,
        "ph_min": 5.5, "ph_max": 8.0,
        "rainfall_min": 75, "rainfall_max": 200,
        "season": "perennial",
        "preferred_soils": ["alluvial", "loamy", "red", "black"],
        "water_demand": "medium",
        "states": ["Andhra Pradesh", "Tamil Nadu", "Karnataka", "Maharashtra",
                   "Gujarat", "West Bengal", "Bihar"],
        "category": "fodder"
    },
    "lucerne (alfalfa)": {
        "N": 20, "P": 60, "K": 40,
        "temperature_min": 10, "temperature_opt": 22, "temperature_max": 30,
        "humidity_min": 40, "humidity_max": 65,
        "ph_min": 6.5, "ph_max": 8.0,
        "rainfall_min": 60, "rainfall_max": 100,
        "season": "rabi",
        "preferred_soils": ["alluvial", "loamy", "black"],
        "water_demand": "medium",
        "states": ["Punjab", "Haryana", "Uttar Pradesh", "Rajasthan",
                   "Madhya Pradesh", "Gujarat"],
        "category": "fodder"
    },
}



# ─────────────────────────────────────────────
# FEATURE WEIGHTS (agronomic importance)
# Higher weight = more influential in distance calc
# ─────────────────────────────────────────────
FEATURE_WEIGHTS = {
    'N':           1.5,   # Nitrogen – critical for leafy growth
    'P':           1.5,   # Phosphorus – root/flowering
    'K':           1.5,   # Potassium – disease resistance
    'temperature': 2.0,   # Climate – hard constraint
    'humidity':    1.5,   # Atmosphere – hard constraint
    'ph':          2.0,   # Soil pH – hard constraint (enzymes)
    'rainfall':    1.5,   # Water supply
}
FEATURES = list(FEATURE_WEIGHTS.keys())

def generate_synthetic_rows(crop_name, profile, n_samples=150):
    """
    Generate n_samples synthetic agronomic rows for one crop
    using ±15% variation around midpoint values.
    This mimics field-survey data variance for training a ML classifier.
    """
    import random
    random.seed(hash(crop_name) % 2**31)

    N_mean    = profile["N"]
    P_mean    = profile["P"]
    K_mean    = profile["K"]
    T_mean    = (profile["temperature_min"] + profile["temperature_opt"]) / 2
    T_range   = max(1, (profile["temperature_max"] - profile["temperature_min"]) / 2)
    H_mean    = (profile["humidity_min"] + profile["humidity_max"]) / 2
    H_range   = max(1, (profile["humidity_max"] - profile["humidity_min"]) / 2)
    PH_mean   = (profile["ph_min"] + profile["ph_max"]) / 2
    PH_range  = max(0.5, (profile["ph_max"] - profile["ph_min"]) / 2)
    RF_mean   = (profile["rainfall_min"] + profile["rainfall_max"]) / 2
    RF_range  = max(10, (profile["rainfall_max"] - profile["rainfall_min"]) / 2)

    rows = []
    for _ in range(n_samples):
        def jitter(mean, spread, lo=None, hi=None):
            v = mean + random.gauss(0, spread * 0.6)
            if lo is not None: v = max(lo, v)
            if hi is not None: v = min(hi, v)
            return round(v, 2)

        rows.append({
            "label":       crop_name,
            "N":           jitter(N_mean,   N_mean * 0.20, 0),
            "P":           jitter(P_mean,   P_mean * 0.20, 0),
            "K":           jitter(K_mean,   K_mean * 0.20, 0),
            "temperature": jitter(T_mean,   T_range, profile["temperature_min"],
                                  profile["temperature_max"]),
            "humidity":    jitter(H_mean,   H_range, profile["humidity_min"],
                                  min(100, profile["humidity_max"])),
            "ph":          jitter(PH_mean,  PH_range, profile["ph_min"],
                                  profile["ph_max"]),
            "rainfall":    jitter(RF_mean,  RF_range, profile["rainfall_min"] * 0.9,
                                  profile["rainfall_max"] * 1.1),
        })
    return rows

def main():
    import pandas as pd
    import numpy as np
    import json
    import os
    import pickle
    import warnings
    warnings.filterwarnings('ignore')

    print("=" * 60)
    print("  Crop Recommendation - Model Training & Compilation (124 Crops)")
    print("=" * 60)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'data')
    os.makedirs(data_dir, exist_ok=True)

    profiles_path   = os.path.join(data_dir, 'crop_profiles.json')
    knn_dataset_path= os.path.join(data_dir, 'crop_knn_dataset.json')
    model_dir       = os.path.join(base_dir, 'models')
    os.makedirs(model_dir, exist_ok=True)

    # 1. Access the CROPS dictionary
    print(f"      Loaded {len(CROPS)} crops from embedded profiles")

    # 2. Generate Synthetic Data
    print("\n[2/6] Generating synthetic dataset for all crops ...")
    all_rows = []
    for crop, profile in CROPS.items():
        rows = generate_synthetic_rows(crop, profile, n_samples=150)
        all_rows.extend(rows)

    df = pd.DataFrame(all_rows)
    print(f"      Generated {df.shape[0]} rows, {df.shape[1]} columns")

    # 3. Compute per-feature min/max for normalization
    print("\n[3/6] Computing normalization bounds ...")
    min_max_bounds = {}
    for f in FEATURES:
        min_max_bounds[f] = {
            "min": float(df[f].min()),
            "max": float(df[f].max())
        }
        print(f"      {f:>12s}: [{min_max_bounds[f]['min']:.3f}, {min_max_bounds[f]['max']:.3f}]")

    # 4. Save KNN dataset
    print("\n[4/6] Saving KNN dataset ...")
    knn_instances = []
    for _, row in df.iterrows():
        inst = {"label": row['label']}
        for f in FEATURES:
            inst[f] = float(row[f])
        knn_instances.append(inst)

    knn_data = {
        "meta": {
            "features":        FEATURES,
            "weights":         FEATURE_WEIGHTS,
            "normalization":   "minmax",
            "bounds":          min_max_bounds,
            "description":     "Values are raw; use bounds and weights for distance calculation"
        },
        "instances": knn_instances
    }

    with open(knn_dataset_path, 'w', encoding='utf-8') as f:
        json.dump(knn_data, f, indent=2)
    print(f"      Saved {len(knn_instances)} raw instances -> {knn_dataset_path}")

    # 5. Build enriched crop profiles
    print("\n[5/6] Building crop profiles ...")
    profiles = {}
    for crop in sorted(df['label'].unique()):
        sub = df[df['label'] == crop]
        avg_rainfall = float(sub['rainfall'].mean())
        info = CROPS[crop]

        profiles[crop] = {
            "N":        round(float(sub['N'].mean()), 2),
            "P":        round(float(sub['P'].mean()), 2),
            "K":        round(float(sub['K'].mean()), 2),
            "temp":     round(float(sub['temperature'].mean()), 2),
            "humidity": round(float(sub['humidity'].mean()), 2),
            "ph":       round(float(sub['ph'].mean()), 2),
            "rainfall": round(avg_rainfall, 2),

            "N_std":        round(float(sub['N'].std()), 2),
            "P_std":        round(float(sub['P'].std()), 2),
            "K_std":        round(float(sub['K'].std()), 2),
            "temp_std":     round(float(sub['temperature'].std()), 2),
            "humidity_std": round(float(sub['humidity'].std()), 2),
            "ph_std":       round(float(sub['ph'].std()), 2),
            "rainfall_std": round(float(sub['rainfall'].std()), 2),

            "ph_min":   round(float(sub['ph'].min()), 2),
            "ph_max":   round(float(sub['ph'].max()), 2),
            "temp_min": round(float(sub['temperature'].min()), 2),
            "temp_max": round(float(sub['temperature'].max()), 2),

            "preferred_soils": info.get("preferred_soils", ["alluvial", "loamy"]),
            "water_demand":    info.get("water_demand", "medium"),
            "states":          info.get("states", []),
            "category":        info.get("category", "vegetable"),
            "sample_count":    len(sub)
        }

    with open(profiles_path, 'w', encoding='utf-8') as f:
        json.dump(profiles, f, indent=2)
    print(f"      Saved {len(profiles)} enriched crop profiles -> {profiles_path}")

    # 6. Train & persist sklearn models
    print("\n[6/6] Training sklearn models ...")
    try:
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import StandardScaler
        from sklearn.pipeline import Pipeline
        from sklearn.metrics import accuracy_score
        import joblib

        X = df[FEATURES].values
        y = df['label'].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        pipe = Pipeline([
            ('scaler', StandardScaler()),
            ('clf',    RandomForestClassifier(n_estimators=100, max_depth=None,
                                              min_samples_leaf=2, random_state=42,
                                              n_jobs=-1))
        ])

        pipe.fit(X_train, y_train)
        test_acc = accuracy_score(y_test, pipe.predict(X_test))
        print(f"      Random Forest Test Accuracy: {test_acc*100:.2f}%")

        model_path  = os.path.join(model_dir, 'best_model.pkl')
        bounds_path = os.path.join(model_dir, 'bounds.json')

        joblib.dump(pipe, model_path)

        with open(bounds_path, 'w') as f:
            json.dump({"bounds": min_max_bounds, "weights": FEATURE_WEIGHTS,
                       "features": FEATURES, "best_model": "Random Forest"}, f, indent=2)

        print(f"      Saved best model  -> {model_path}")
        print(f"      Saved bounds/meta  -> {bounds_path}")

    except ImportError as e:
        print(f"\n[WARN] scikit-learn / joblib not available; skipping model training: {e}")

    print("\n" + "=" * 60)
    print("  Training complete.")
    print("=" * 60)

if __name__ == '__main__':
    main()
