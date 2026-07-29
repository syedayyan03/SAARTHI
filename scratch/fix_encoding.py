import os

file_path = r"D:\cmtcrw (1)\cmtcrw\public\js\disease.js"

# Read with latin-1 or utf-8 errors='ignore'
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Locate the bad block
bad_block = """};,
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    diseasePageTitle: "रोग ओळख",
    diseasePageIntro: "खाली पीक किंवा पानाचा फोटो अपलोड करा. आमचे Gemini AI मॉडेल रिअल-टाइममध्ये फोटोचे विश्लेषण करेल.",
    detectDiseaseBtn: "रोग शोधा",
    analysisResult: "विश्लेषण परिणाम:",
    uploadSubtext: "PNG, JPG, JPEG फाईल्सना सपोर्ट करते (कमाल 5MB)",
    adviceTitle: "शिफारस केलेले उपाय:",
    selectAlert: "कृपया प्रथम एक प्रतिमा फाइल निवडा.",
    sizeAlert: "इमेज फाईलचा आकार 5MB मर्यादेपेक्षा जास्त आहे. कृपया लहान प्रतिमा निवडा."
  },
  ml: {
    dashLogoSubtitle: "രോഗ നിർണ്ണയം",
    navHome: "ഹോം",
    navContactUs: "ബന്ധപ്പെടുക",
    navProfile: "പ്രൊഫൈൽ",
    diseasePageTitle: "രോഗ നിർണ്ണയം",
    diseasePageIntro: "താഴെ വിളയുടെയോ ഇലയുടെയോ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക. പുതിയ Gemini AI മോഡൽ രോഗങ്ങൾ കണ്ടെത്തും.",
    detectDiseaseBtn: "രോഗ നിർണ്ണയം നടത്തുക",
    analysisResult: "വിശകലന ഫലം:",
    uploadSubtext: "PNG, JPG, JPEG ഫയലുകൾ സപ്പോർട്ട് ചെയ്യും (പരമാവധി 5MB)",
    adviceTitle: "ശുപാർശ ചെയ്യുന്ന നടപടികൾ:",
    selectAlert: "ദയവായി ആദ്യം ഒരു ചിത്ര ഫയൽ തിരഞ്ഞെടുക്കുക.",
    sizeAlert: "ചിത്രത്തിന്റെ ഫയൽ സൈസ് 5MB പരിധി കവിഞ്ഞു. ദയവായി ചെറിയ ചിത്രം തിരഞ്ഞെടുക്കുക."
  }
};"""

normalized_content = content.replace("\r\n", "\n")
normalized_bad_block = bad_block.replace("\r\n", "\n")

if normalized_bad_block in normalized_content:
    normalized_content = normalized_content.replace(normalized_bad_block, "};")
    with open(file_path, "w", encoding="utf-8", newline="\r\n") as f:
        f.write(normalized_content)
    print("SUCCESS: Cleaned up disease.js syntax error!")
else:
    print("ERROR: Bad block not found! Trying substring match...")
    if "};," in content:
        # Find where };, is
        idx = content.find("};,")
        # Find where function applyDiseaseLanguage() starts after idx
        target_idx = content.find("function applyDiseaseLanguage()", idx)
        if idx != -1 and target_idx != -1:
            clean_content = content[:idx+2] + "\n\n" + content[target_idx:]
            with open(file_path, "w", encoding="utf-8", newline="\r\n") as f:
                f.write(clean_content)
            print("SUCCESS: Cleaned up via substring replacement!")
        else:
            print("ERROR: Substring bounds not found!")
    else:
        print("ERROR: };, not found in file!")
