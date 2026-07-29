// Landing page: login modal + simple voice instructions + fake login flow

// Check if user is already logged in (Indefinite login persistence)
const savedPhone = localStorage.getItem("farmerPhone") || "";
const savedToken = localStorage.getItem("sessionToken") || "";
if (savedPhone && savedToken) {
  window.location.href = "dashboard.html";
}

function $(id) {
  return document.getElementById(id);
}

const loginModal = $("loginModal");
const topLoginBtn = $("topLoginBtn");
const bottomLoginBtn = $("bottomLoginBtn");
const heroLoginBtn = $("heroLoginBtn");
const closeLoginModal = $("closeLoginModal");
const loginSubmitBtn = $("loginSubmitBtn");
const languageSelect = $("languageSelect");
const topLanguageSelect = $("topLanguageSelect");
const phoneInput = $("phoneInput");
const passwordInput = $("passwordInput");
const loginError = $("loginError");
const playLoginInstructions = $("playLoginInstructions");
const loginFormInputs = $("loginFormInputs");

function openLogin() {
  loginModal.classList.remove("hidden");
  loginError.textContent = "";
  if (phoneInput) phoneInput.value = "";
  if (passwordInput) passwordInput.value = "";
}

function closeLogin() {
  loginModal.classList.add("hidden");
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

if (topLoginBtn) topLoginBtn.onclick = openLogin;
if (bottomLoginBtn) bottomLoginBtn.onclick = openLogin;
if (heroLoginBtn) heroLoginBtn.onclick = openLogin;
if (closeLoginModal) closeLoginModal.onclick = closeLogin;



// Voice instructions using Web Speech API (where supported)
let availableVoices = [];

if ("speechSynthesis" in window) {
  const loadVoices = () => {
    availableVoices = window.speechSynthesis.getVoices() || [];
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoiceForLang(langCode) {
  if (!availableVoices || !availableVoices.length) return null;
  let matches = availableVoices.filter(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
  if (!matches.length) {
    const base = langCode.split("-")[0];
    matches = availableVoices.filter(v => v.lang.toLowerCase().startsWith(base.toLowerCase()));
  }
  if (matches.length) {
    // Attempt to pick a male/deeper voice (e.g. "ballaya" style request for clarity)
    const deepVoice = matches.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("ravi") || v.name.toLowerCase().includes("bal"));
    return deepVoice || matches[0];
  }
  return null;
}

function speak(text, langCode) {
  try {
    if (!("speechSynthesis" in window)) return;
    const lc = langCode || "en-IN";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lc;

    // Try to pick a concrete system voice for better pronunciation
    const voice = pickVoiceForLang(lc);
    if (voice) {
      utterance.voice = voice;
    }

    // A unified slower, clearer, deeper voice for all languages ("ballaya" style requirement)
    utterance.rate = 0.75;
    utterance.pitch = 0.85;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // ignore errors silently for unsupported browsers
  }
}

if (playLoginInstructions) {
  playLoginInstructions.addEventListener("click", () => {
    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    const lang = topLanguageSelect ? topLanguageSelect.value : "en";
    let message =
      "Please enter your phone number and password, then press the Login button.";
    let langCode = "en-IN";

    if (lang === "te") {
      message =
        "Mee phone number mariyu password nidhanaanga type cheyyandi. Aakaasham lo unna pacha button, ante Login button meeda mellaga click cheyyandi.";
      langCode = "te-IN";
    } else if (lang === "hi") {
      message =
        "Apna phone number aur password bhar kar login button dabayen.";
      langCode = "hi-IN";
    } else if (lang === "mr") {
      message =
        "Tumcha phone number आणि password टाका आणि Login बटण दाबा.";
      langCode = "mr-IN";
    } else if (lang === "ml") {
      message =
        "നിങ്ങളുടെ ഫോൺ നമ്പർയും പാസ്‌വേഡും ടൈപ്പ് ചെയ്യുക. അതിന് ശേഷം താഴെ കാണുന്ന ലോഗിൻ ബട്ടൺ അമർത്തുക.";
      langCode = "ml-IN";
    }
    speak(message, langCode);
  });
}

// Login call to backend
if (loginSubmitBtn) {
  loginSubmitBtn.addEventListener("click", async () => {
    loginError.textContent = "";
    loginError.style.color = "";
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    const language = topLanguageSelect ? topLanguageSelect.value : "en";

    if (!phone || !password) {
      loginError.textContent = "Please enter email/username and password.";
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail: phone, password, language }),
      });
      const data = await res.json();
      if (!data.ok) {
        loginError.textContent = data.message || "Login failed.";
        return;
      }

      const finalName = data.name || "";
      const finalPhone = data.phone || phone;
      const finalUsername = data.username || "";
      const finalEmail = data.email || "";

      // Save session basics to localStorage
      localStorage.setItem("farmerPhone", finalPhone);
      if (data.token) {
        localStorage.setItem("sessionToken", data.token);
      }
      if (finalName) {
        localStorage.setItem("farmerName", finalName);
      } else {
        localStorage.removeItem("farmerName");
      }
      if (finalUsername) {
        localStorage.setItem("farmerUsername", finalUsername);
      } else {
        localStorage.removeItem("farmerUsername");
      }
      if (finalEmail) {
        localStorage.setItem("farmerEmail", finalEmail);
      } else {
        localStorage.removeItem("farmerEmail");
      }
      localStorage.setItem("farmerLang", language);
      localStorage.setItem("uiLang", language);
      window.location.href = "dashboard.html";
    } catch (err) {
      loginError.textContent = "Unable to reach server. Check if it is running.";
    }
  });
}

// Simple translation dictionary (English + 4 Indian languages)
const landingTranslations = {
  en: {
    logoTitle: "SAARTHI",
    logoSubtitle: "Crop Guidance for Every Farmer",
    navAbout: "About",
    navFeatures: "Features",
    navContact: "Contact",
    heroTitle: "Right Crop. Right Time. Right Guidance.",
    heroIntro:
      "SAARTHI helps farmers choose the best crop for their land by using soil type, water source, climate, market demand, and previous years data – in simple local languages.",
    heroPoint1:
      "Multi‑language support: Telugu, Hindi, English, Marathi, Malayalam",
    heroPoint2: "Crop recommendation with budget estimation",
    heroPoint3: "Market demand near you",
    heroPoint4: "Chatbox guidance and disease detection",
    heroLoginText: "Get Started – Login",
    heroCardTitle: "Farmer‑first Design",
    heroCardText:
      "Clean, simple screens with big buttons, clear colors, and optional voice instructions so every farmer can use it comfortably.",
    heroCardFeat1: "Optional Voice Guidance",
    heroCardFeat2: "High-Contrast & Big Buttons",
    heroCardFeat3: "Offline-Ready Models",
    heroCardFeat4: "100% Mobile Responsive",
    aboutTitle: "About Our Project",
    aboutIntro:
      "This crop recommendation website is built to support farmers with data‑driven decisions. Our system combines:",
    pill1: "Soil type & water availability",
    pill2: "Local climate & groundwater level",
    pill3: "Market demand & price trends",
    pill4: "Previous years yield data",
    pill5: "Timely crop health monitoring",
    aboutTech:
      "Technologies used include Node.js, Express.js, HTML, CSS, JavaScript on the web side, with Python and machine learning models planned for the recommendation and disease detection engines, and MySQL/Firebase/Django backends for data storage and analytics.",
    featuresTitle: "Main Features",
    feat1Title: "Crop Recommendation",
    feat1Text:
      "Suggests 4–5 best crops and estimated budget based on your soil, water source, acres, and local conditions.",
    feat2Title: "Market Demand Near You",
    feat2Text:
      "Shows demand and price trends of important crops in nearby markets.",
    feat3Title: "Chatbox Guidance",
    feat3Text:
      "Gemini‑like conversational assistant for quick farming questions and guidance (prototype version here).",
    feat4Title: "Disease Detector",
    feat4Text:
      "Upload crop or leaf photos and get likely disease and precaution suggestions (ML model integration planned).",
    contactTitle: "Contact & Team Details",
    contactIntro:
      "SAARTHI is a student-developed project by second-year Computer Science students of CMRCET (CMR College of Engineering & Technology). Our goal is to leverage technology to support farmers with intelligent crop recommendations, market insights, and AI-powered assistance. This project is built as part of our academic learning initiative to explore real-world problem solving in agriculture using web development and data-driven solutions.",
    teamTitle: "Our Team",
    teamMember1: "1. Syed Ayyan – Backend Developer",
    teamMember2: "2. Jadi Santhosh – Frontend Developer",
    teamMember3: "3. Suryavamshi Sridhar Patil – UI/UX Designer, Database Handler",
    getInTouchTitle: "Get in touch",
    emailLabel: "Email: saarthiforus2071@gmail.com",
    phoneLabel: "Phone: +91-9618301301",
    footerText: "© 2026 SAARTHI – All rights reserved.",
    loginTitle: "Select Language & Login",
    languageLabel: "Language",
    nameLabelLogin: "Your name",
    phoneLabelLogin: "Phone number",
    passwordLabelLogin: "Password",
    loginButton: "Login",
  },
  te: {
    logoTitle: "స్మార్ట్ కృషి అసిస్టు",
    logoSubtitle: "ప్రతి రైతుకి పంట మార్గదర్శిని",
    navAbout: "మన గురించి",
    navFeatures: "సేవలు",
    navContact: "సంప్రదించండి",
    heroTitle: "సమయానికి సరైన పంట – సరైన మార్గం.",
    heroIntro:
      "స్మార్ట్ కృషి అసిస్టు మీ నేల రకం, నీటి వనరులు, వాతావరణం, మార్కెట్ డిమాండ్, గత సంవత్సరాల డేటా ఆధారంగా మీ భూమికి సరైన పంటను సులభమైన భాషలో సూచిస్తుంది.",
    heroPoint1:
      "అనేక భాషలు: తెలుగు, హిందీ, ఇంగ్లీష్, మరాఠీ, మలయాళం",
    heroPoint2: "పంట సిఫారసులు & అంచనా ఖర్చు",
    heroPoint3: "మీ ప్రాంతంలో మార్కెట్ డిమాండ్",
    heroPoint4: "చాట్ ద్వారా సలహాలు & వ్యాధి గుర్తింపు",
    heroLoginText: "ప్రారంభించండి – లాగిన్",
    heroCardTitle: "రైతు కోసం రూపొందించిన డిజైన్",
    heroCardText:
      "పెద్ద అక్షరాలు, పెద్ద బటన్లు, కాంతివంతమైన రంగులు, అవసరమైతే వాయిస్ సూచనలు – ప్రతి రైతు సులభంగా వాడుకునేలా.",
    heroCardFeat1: "వాయిస్ సహాయం (వినండి)",
    heroCardFeat2: "పెద్ద బటన్లు & స్పష్టమైన రంగులు",
    heroCardFeat3: "ఆఫ్‌లైన్ నెట్‌వర్క్ పద్ధతి",
    heroCardFeat4: "అన్ని మొబైల్స్ కి అనుకూలం",
    aboutTitle: "మన ప్రాజెక్ట్ గురించి",
    aboutIntro:
      "రైతులు సరైన నిర్ణయం తీసుకోవడానికి ఈ పంట సిఫారసు వెబ్‌సైట్ డేటా ఆధారంగా సహాయం చేస్తుంది. మా వ్యవస్థ చూస్తున్న అంశాలు:",
    pill1: "నేల రకం & నీటి లభ్యత",
    pill2: "లోకల్ వాతావరణం & గ్రౌండ్ వాటర్ స్థాయి",
    pill3: "మార్కెట్ డిమాండ్ & ధరలు",
    pill4: "గత సంవత్సరాల దిగుబడి డేటా",
    pill5: "సమయానికి పంట ఆరోగ్య పర్యవేక్షణ",
    aboutTech:
      "నోడ్.జెఎస్, ఎక్స్‌ప్రెస్, HTML, CSS, జావాస్క్రిప్ట్‌తో ముందుభాగం (ఫ్రంట్ ఎండ్), పైథాన్ & మెషీన్ లెర్నింగ్ మోడల్స్‌తో పంట సిఫారసు, వ్యాధి గుర్తింపు సేవలు, అలాగే MySQL / Firebase / Django బ్యాక్ ఎండ్‌గా ఉపయోగించవచ్చు.",
    featuresTitle: "ప్రధాన సేవలు",
    feat1Title: "పంట సిఫారసు",
    feat1Text:
      "మీ నేల, నీటి వనరు, ఎకరాలు, స్థానిక పరిస్థితుల ఆధారంగా 4–5 ఉత్తమ పంటలు మరియు అంచనా బడ్జెట్ సూచిస్తుంది.",
    feat2Title: "మీ దగ్గర మార్కెట్ డిమాండ్",
    feat2Text:
      "మీ సమీప మార్కెట్‌లలో ముఖ్య పంటల డిమాండ్ & సుమారు ధరల వివరాలు చూపిస్తుంది.",
    feat3Title: "చాట్ సలహాలు",
    feat3Text:
      "సాధారణ భాషలో అడిగే ప్రశ్నలకు సమాధానాలు ఇచ్చే జెమిని లాంటి చాట్ అసిస్టెంట్ (ప్రోటోటైప్).",
    feat4Title: "వ్యాధి గుర్తింపు",
    feat4Text:
      "పంట లేదా ఆకు ఫోటోలను అప్‌లోడ్ చేసి, సాధ్యమైన వ్యాధి & జాగ్రత్తల సూచనలు (ML మోడల్ కలిపినప్పుడు).",
    contactTitle: "సంప్రదించండి & టీం వివరాలు",
    contactIntro:
      "సారథి CMRCET (CMRC కాలేజ్ ఆఫ్ ఇంజనీరింగ్ అండ్ టెక్నాలజీ) యొక్క కంప్యూటర్ సైన్స్ రెండవ సంవత్సరం విద్యార్థులు అభివృద్ధి చేసిన ప్రాజెక్ట్. తెలివైన పంట సిఫార్సులు, మార్కెట్ అంతర్దృష్టులు దొరకడానికి రైతులను ఆదుకోవడానికి మా లక్ష్యం.",
    teamTitle: "ప్రాజెక్ట్ టీం",
    teamMember1: "1. సయ్యద్ అయ్యన్ – బ్యాక్ ఎండ్ డెవలపర్",
    teamMember2: "2. జాడి సంతోష్ – ఫ్రంట్ ఎండ్ డెవలపర్",
    teamMember3: "3. సూర్యవంశీ శ్రీధర్ పాటిల్ – UI/UX డిజైనర్, డేటాబేస్ హ్యాండ్లర్",
    getInTouchTitle: "మమ్మల్ని సంప్రదించండి",
    emailLabel: "ఈమెయిల్: saarthiforus2071@gmail.com",
    phoneLabel: "ఫోన్: +91‑XXXXXXXXXX",
    footerText: "© 2026 స్మార్ట్ కృషి అసిస్టు – అన్ని హక్కులుสง",
    loginTitle: "భాష ఎంచుకుని లాగిన్ అవ్వండి",
    languageLabel: "భాష",
    nameLabelLogin: "మీ పేరు",
    phoneLabelLogin: "ఫోన్ నంబర్",
    passwordLabelLogin: "పాస్‌వర్డ్",
    loginButton: "లాగిన్",
  },
  hi: {
    logoTitle: "स्मार्ट कृषि असिस्ट",
    logoSubtitle: "हर किसान के लिए फसल मार्गदर्शन",
    navAbout: "हमारे बारे में",
    navFeatures: "विशेषताएँ",
    navContact: "संपर्क",
    heroTitle: "सही फसल, सही समय, सही मार्गदर्शन।",
    heroIntro:
      "स्मार्ट कृषि असिस्ट आपकी मिट्टी, पानी के स्रोत, मौसम, बाजार की मांग और पिछले वर्षों के डेटा के आधार पर आपकी ज़मीन के लिए सही फसल सुझाता है।",
    heroPoint1:
      "कई भाषाएँ: तेलुगू, हिंदी, इंग्लिश, मराठी, मलयालम",
    heroPoint2: "फसल सुझाव और अनुमानित बजट",
    heroPoint3: "आपके क्षेत्र में बाजार की मांग",
    heroPoint4: "चैट के माध्यम से सलाह और रोग पहचान",
    heroLoginText: "शुरू करें – लॉगिन",
    heroCardTitle: "किसान‑केंद्रित डिजाइन",
    heroCardText:
      "बड़े बटन, साफ रंग, साधारण भाषा और जरूरत होने पर वॉइस निर्देश – हर किसान आसानी से उपयोग कर सके ऐसा डिजाइन।",
    heroCardFeat1: "वैकल्पिक वॉयस निर्देश",
    heroCardFeat2: "बड़े बटन और स्पष्ट रंग",
    heroCardFeat3: "ऑफ़लाइन अनुकूल मॉडल",
    heroCardFeat4: "सभी मोबाइल के लिए सही",
    aboutTitle: "हमारा प्रोजेक्ट",
    aboutIntro:
      "यह फसल सिफारिश वेबसाइट किसानों को डेटा‑आधारित निर्णय लेने में मदद करने के लिए बनाई गई है। हमारा सिस्टम इन बातों पर ध्यान देता है:",
    pill1: "मिट्टी का प्रकार और पानी की उपलब्धता",
    pill2: "स्थानीय मौसम और भू‑जल स्तर",
    pill3: "बाजार की मांग और कीमतें",
    pill4: "पिछले वर्षों की उत्पादन जानकारी",
    pill5: "समय‑समय पर फसल स्वास्थ्य निगरानी",
    aboutTech:
      "फ्रंटएंड के लिए Node.js, Express.js, HTML, CSS, JavaScript और फसल सिफारिश व रोग पहचान के लिए Python व मशीन लर्निंग मॉडल; डेटा स्टोरेज के लिए MySQL / Firebase / Django का उपयोग किया जा सकता है।",
    featuresTitle: "मुख्य सुविधाएँ",
    feat1Title: "फसल सिफारिश",
    feat1Text:
      "आपकी मिट्टी, पानी के स्रोत, एकड़ और स्थानीय परिस्थितियों के आधार पर 4–5 बेहतरीन फसलें और अनुमानित बजट सुझाती है।",
    feat2Title: "आपके क्षेत्र की बाजार मांग",
    feat2Text:
      "आपके नज़दीकी बाज़ारों में महत्वपूर्ण फसलों की मांग और लगभग कीमतें दिखाती है।",
    feat3Title: "चैट सलाह",
    feat3Text:
      "साधारण भाषा में पूछे गए सवालों के लिए जेमिनी जैसे चैट असिस्टेंट से जवाब (यहाँ प्रोटोटाइप)।",
    feat4Title: "रोग पहचान",
    feat4Text:
      "फसल या पत्तों की फ़ोटो अपलोड कर संभावित रोग और सावधानियों के सुझाव (एमएल मॉडल जोड़ने पर)।",
    contactTitle: "संपर्क एवं टीम विवरण",
    contactIntro:
      "सारथी CMRCET (CMR कॉलेज ऑफ इंजीनियरिंग एंड टेक्नोलॉजी) के कंप्यूटर साइंस के द्वितीय वर्ष के छात्रों द्वारा विकसित एक प्रोजेक्ट है। हमारा लक्ष्य किसानों को तकनीक और एआई की सहायता से फसल की सिफारिशें और बाज़ार की जानकारी प्रदान करना है।",
    teamTitle: "प्रोजेक्ट टीम",
    teamMember1: "1. सैयद अय्यान – बैकएंड डेवलपर",
    teamMember2: "2. जाडी संतोष – फ्रंटएंड डेवलपर",
    teamMember3: "3. सूर्यवंशी श्रीधर पाटिल – UI/UX डिज़ाइनर, डेटाबेस हैंडलर",
    getInTouchTitle: "संपर्क करें",
    emailLabel: "ईमेल: saarthiforus2071@gmail.com",
    phoneLabel: "फ़ोन: +91‑XXXXXXXXXX",
    footerText: "© 2026 स्मार्ट कृषि असिस्ट – सर्वाधिकार सुरक्षित।",
    loginTitle: "भाषा चुनें और लॉगिन करें",
    languageLabel: "भाषा",
    nameLabelLogin: "आपका नाम",
    phoneLabelLogin: "फ़ोन नंबर",
    passwordLabelLogin: "पासवर्ड",
    loginButton: "लॉगिन",
  },
  mr: {
    logoTitle: "स्मार्ट कृषी असिस्ट",
    logoSubtitle: "प्रत्येक शेतकऱ्यासाठी पीक मार्गदर्शन",
    navAbout: "आमच्याबद्दल",
    navFeatures: "सुविधा",
    navContact: "संपर्क",
    heroTitle: "योग्य पीक, योग्य वेळ, योग्य मार्गदर्शन.",
    heroIntro:
      "स्मार्ट कृषी असिस्ट तुमची माती, पाण्याचा स्रोत, हवामान, बाजारातील मागणी आणि मागील वर्षांचा डेटा पाहून तुमच्या जमिनीसाठी योग्य पिके सुचवते.",
    heroPoint1:
      "अनेक भाषा: तेलुगू, हिंदी, इंग्रजी, मराठी, मल्याळम",
    heroPoint2: "पीक सुचवणी आणि अंदाजित खर्च",
    heroPoint3: "तुमच्या भागातील बाजार मागणी",
    heroPoint4: "चॅटद्वारे सल्ला आणि रोग ओळख",
    heroLoginText: "सुरू करा – लॉगिन",
    heroCardTitle: "शेतकरी‑केंद्रित डिझाइन",
    heroCardText:
      "मोठी बटणे, स्वच्छ रंग, सोपी भाषा आणि आवश्यक असल्यास व्हॉइस सूचना – प्रत्येक शेतकरी सहज वापरू शकेल असे डिझाइन.",
    heroCardFeat1: "व्हॉईस मार्गदर्शन सुविधा",
    heroCardFeat2: "मोठी बटणे आणि स्पष्ट रंग",
    heroCardFeat3: "ऑफलाईन-रेडी मॉडेल्स",
    heroCardFeat4: "सर्व मोबाईलवर चालणारे",
    aboutTitle: "आमचा प्रोजेक्ट",
    aboutIntro:
      "शेतकऱ्यांना डेटा‑आधारित निर्णय घेण्यासाठी मदत करण्यासाठी ही पीक सुचवणीची वेबसाईट तयार केली आहे. आमची प्रणाली पुढील गोष्टी पाहते:",
    pill1: "मातीचा प्रकार आणि पाण्याची उपलब्धता",
    pill2: "स्थानिक हवामान व भूजल पातळी",
    pill3: "बाजार मागणी आणि दर",
    pill4: "मागील वर्षांचा उत्पादन डेटा",
    pill5: "योग्य वेळेस पीक आरोग्य तपासणी",
    aboutTech:
      "फ्रंटएंडसाठी Node.js, Express.js, HTML, CSS, JavaScript आणि पीक सुचवणी व रोग ओळख यासाठी Python व मशीन लर्निंग मॉडेल; डेटा साठवणुकीसाठी MySQL / Firebase / Django वापरू शकतो.",
    featuresTitle: "मुख्य सुविधा",
    feat1Title: "पीक सुचवणी",
    feat1Text:
      "तुमची माती, पाण्याचा स्रोत, एकर आणि स्थानिक परिस्थिती यांच्या आधारे 4–5 उत्तम पिके आणि अंदाजित बजेट सुचवते.",
    feat2Title: "तुमच्या भागातील बाजार मागणी",
    feat2Text:
      "तुमच्या जवळच्या बाजारात महत्त्वाच्या पिकांची मागणी आणि साधारण दर दाखवते.",
    feat3Title: "चॅट सल्ला",
    feat3Text:
      "सोप्या भाषेत विचारलेल्या प्रश्नांसाठी जेमिनी सारखा चॅट असिस्टंट (येथे प्रोटोटाईप).",
    feat4Title: "रोग ओळख",
    feat4Text:
      "पीक किंवा पानांच्या फोटोद्वारे संभाव्य रोग आणि काळजीचे उपाय (एमएल मॉडेल जोडल्यावर).",
    contactTitle: "संपर्क व टीम तपशील",
    contactIntro:
      "सारथी हा CMRCET (सीएम्आर कॉलेज ऑफ इंजिनीअरिंग अँड टेक्नॉलॉजी) च्या संगणक विज्ञान शाखेतील द्वितीय वर्षाच्या विद्यार्थ्यांनी विकसित केलेला प्रकल्प आहे. आमचे उद्दिष्ट तंत्रज्ञानाच्या मदतीने शेतकऱ्यांना योग्य पीक शिफारसी, बाजारपेठेची माहिती आणि एआय-सपोर्ट प्रदान करणे हे आहे.",
    teamTitle: "प्रोजेक्ट टीम",
    teamMember1: "1. सय्यद अय्यान – बॅकएंड डेव्हलपर",
    teamMember2: "2. जाडी संतोष – फ्रंटएंड डेव्हलपर",
    teamMember3: "3. सूर्यवंशी श्रीधर पाटील – UI/UX डिझायनर, डेटाबेस हँडलर",
    getInTouchTitle: "आमच्याशी संपर्क साधा",
    emailLabel: "ईमेल: saarthiforus2071@gmail.com",
    phoneLabel: "फोन: +91‑XXXXXXXXXX",
    footerText: "© 2026 स्मार्ट कृषी असिस्ट – सर्व हक्क राखीव.",
    loginTitle: "भाषा निवडा आणि लॉगिन करा",
    languageLabel: "भाषा",
    nameLabelLogin: "तुमचे नाव",
    phoneLabelLogin: "फोन नंबर",
    passwordLabelLogin: "पासवर्ड",
    loginButton: "लॉगिन",
  },
  ml: {
    logoTitle: "സ്മാർട്ട് കൃഷി അസിസ്റ്റ്",
    logoSubtitle: "എല്ലാ കർഷകനും വേണ്ട വിള മാർഗനിർദേശം",
    navAbout: "ഞങ്ങളേക്കുറിച്ച്",
    navFeatures: "സേവനങ്ങൾ",
    navContact: "ബന്ധപ്പെടുക",
    heroTitle: "ശരിയായ വിള, ശരിയായ സമയം, ശരിയായ മാർഗനിർദേശം.",
    heroIntro:
      "സ്മാർട്ട് കൃഷി അസിസ്റ്റ് മണ്ണിന്റെ തരം, ജലസ്രോതസ്സ്, കാലാവസ്ഥ, മാർക്കറ്റ് ഡിമാൻഡ്, കഴിഞ്ഞ വർഷങ്ങളിലെ ഡാറ്റ എന്നിവ ഉപയോഗിച്ച് നിങ്ങളുടെ വയലിന് ഏറ്റവും അനുയോജ്യമായ വിളകൾ നിർദേശിക്കുന്നു.",
    heroPoint1:
      "പല ഭാഷകൾ: തെലുങ്ക്, ഹിന്ദി, ഇംഗ്ലീഷ്, മറാത്തി, മലയാളം",
    heroPoint2: "വിള നിർദേശം, ചെലവ് കണക്ക്",
    heroPoint3: "നിങ്ങളുടെ പ്രദേശത്തെ മാർക്കറ്റ് ഡിമാൻഡ്",
    heroPoint4: "ചാറ്റ് വഴി നിർദേശങ്ങളും രോഗ നിർണ്ണയവും",
    heroLoginText: "ആരംഭിക്കാം – ലോഗിൻ",
    heroCardTitle: "കർഷകനെ മുൻനിർത്തിയുള്ള രൂപകൽപ്പന",
    heroCardText:
      "വലിയ ബട്ടണുകൾ, വ്യക്തമായ നിറങ്ങൾ, ലളിതമായ ഭാഷ, ആവശ്യമെങ്കിൽ ശബ്ദ നിർദ്ദേശങ്ങൾ – ഏതു കർഷകനും എളുപ്പത്തിൽ ഉപയോഗിക്കാൻ പറ്റുന്ന വിധം.",
    heroCardFeat1: "ശബ്ദ നിർദ്ദേശ സഹായി",
    heroCardFeat2: "വലിയ ബട്ടണുകളും മികച്ച നിറങ്ങളും",
    heroCardFeat3: "ഓഫ്‌ലൈൻ പിന്തുണയുള്ള മോഡലുകൾ",
    heroCardFeat4: "എല്ലാ മൊബൈലിലും പ്രവർത്തിക്കും",
    aboutTitle: "ഞങ്ങളുടെ പ്രോജക്ട്",
    aboutIntro:
      "ഡാറ്റയെത്തുടർന്നുള്ള തീരുമാനങ്ങൾ എടുക്കാൻ കർഷകർക്ക് സഹായമായി ഈ വിള നിർദേശ വെബ്‌സൈറ്റ് രൂപകൽപ്പന ചെയ്തിരിക്കുന്നു. ഞങ്ങളുടെ സിസ്റ്റം നോക്കുന്ന കാര്യങ്ങൾ:",
    pill1: "മണ്ണിന്റെ തരം & ജലലഭ്യത",
    pill2: "പ്രാദേശിക കാലാവസ്ഥ & ഭൂഗർഭജലം",
    pill3: "മാർക്കറ്റ് ഡിമാൻഡ് & വില പ്രവണത",
    pill4: "കഴിഞ്ഞ വർഷങ്ങളിലെ ഉൽപാദന ഡാറ്റ",
    pill5: "സമയോചിതമായ വിളാരോഗ്യ നിരീക്ഷണം",
    aboutTech:
      "ഫ്രണ്ട്എൻഡിന് Node.js, Express.js, HTML, CSS, JavaScript, വിള നിർദേശം, രോഗ നിർണ്ണയം എന്നിവയ്ക്ക് Python & Machine Learning മോഡലുകൾ, ഡാറ്റ സംഭരണത്തിന് MySQL / Firebase / Django എന്നിവ ഉപയോഗിക്കാം.",
    featuresTitle: "പ്രധാന സേവനങ്ങൾ",
    feat1Title: "വിള നിർദേശം",
    feat1Text:
      "നിങ്ങളുടെ മണ്ണ്, ജലസ്രോതസ്സ്, ഏക്കർ, പ്രാദേശിക സാഹചര്യങ്ങൾ എന്നിവയെ അടിസ്ഥാനമാക്കി 4–5 മികച്ച വിളകളും ഏകദേശ ബജറ്റും നിർദേശിക്കുന്നു.",
    feat2Title: "നിങ്ങളുടെ പ്രദേശത്തെ മാർക്കറ്റ് ഡിമാൻഡ്",
    feat2Text:
      "നിങ്ങളുടെ അടുത്തുള്ള മാർക്കറ്റുകളിൽ പ്രധാന വിളകളുടെ ഡിമാൻഡും ഏകദേശ വിലയും കാണിക്കുന്നു.",
    feat3Title: "ചാറ്റ് നിർദേശങ്ങൾ",
    feat3Text:
      "ലളിതമായ ഭാഷയിൽ ചോദിക്കുന്ന ചോദ്യങ്ങൾക്ക് ജെമിനിയെ പോലെ പ്രതികരിക്കുന്ന ചാറ്റ് അസിസ്റ്റന്റ് (ഡെമോ പതിപ്പ്).",
    feat4Title: "രോഗ നിർണ്ണയം",
    feat4Text:
      "വിളയുടേയും ഇലകളുടെയും ഫോട്ടോ അപ്‌ലോഡ് ചെയ്ത് സാധ്യതയുള്ള രോഗവും മുൻകരുതലുകളും അറിയാം (എം.എൽ. മോഡൽ ചേർത്താൽ).",
    contactTitle: "ബന്ധപ്പെടുക & ടീം വിശദാംശങ്ങൾ",
    contactIntro:
      "സാരഥി CMRCET യിലെ (CMR കോളേജ് ഓഫ് എഞ്ചിനീയറിംഗ് ആൻഡ് ടെക്നോളജി) കമ്പ്യൂട്ടർ സയൻസ് രണ്ടാം വർഷ വിദ്യാർത്ഥികൾ വികസിപ്പിച്ച ഒരു പ്രോജക്റ്റാണ്. സാങ്കേതികവിദ്യയുടെ സഹായത്തോടെ കർഷകർക്ക് മികച്ച വിള നിർദ്ദേശങ്ങളും മാർക്കറ്റ് വിവരങ്ങളും നൽകുക എന്നതാണ് ഞങ്ങളുടെ ലക്ഷ്യം.",
    teamTitle: "പ്രോജക്ട് ടീം",
    teamMember1: "1. സയ്യിദ് അയ്യാൻ – ബാക്ക്എൻഡ് ഡെവലപ്പർ",
    teamMember2: "2. ജാഡി സന്തോഷ് – ഫ്രണ്ട്എൻഡ് ഡെവലപ്പർ",
    teamMember3: "3. സൂര്യവംശി ശ്രീധർ പാട്ടീൽ – UI/UX ഡിസൈനർ, ഡാറ്റാബേസ് ഹാൻഡ്‌ലർ",
    getInTouchTitle: "ബന്ധപ്പെടുക",
    emailLabel: "ഇമെയിൽ: saarthiforus2071@gmail.com",
    phoneLabel: "ഫോൺ: +91‑XXXXXXXXXX",
    footerText: "© 2026 സ്മാർട്ട് കൃഷി അസിസ്റ്റ് – എല്ലാ അവകാശങ്ങളും സംരക്ഷിതം.",
    loginTitle: "ഭാഷ തിരഞ്ഞെടുക്കുക, ലോഗിൻ ചെയ്യുക",
    languageLabel: "ഭാഷ",
    nameLabelLogin: "നിങ്ങളുടെ പേര്",
    phoneLabelLogin: "ഫോൺ നമ്പർ",
    passwordLabelLogin: "പാസ്‌വേഡ്",
    loginButton: "ലോഗിൻ",
  },
};

function applyLandingLanguage(lang) {
  const t = landingTranslations[lang] || landingTranslations.en;
  
  const el = (id) => document.getElementById(id);
  
  const logoTitle = el("logoTitle");
  if (logoTitle) logoTitle.textContent = t.logoTitle;
  const logoSubtitle = el("logoSubtitle");
  if (logoSubtitle) logoSubtitle.textContent = t.logoSubtitle;

  const navFeatures = el("navFeatures");
  if (navFeatures) navFeatures.textContent = t.navFeatures;
  const navContact = el("navContact");
  if (navContact) navContact.textContent = t.navContact;
  const heroTitle = el("heroTitle");
  if (heroTitle) heroTitle.textContent = t.heroTitle;
  const heroIntro = el("heroIntro");
  if (heroIntro) heroIntro.textContent = t.heroIntro;
  const heroPoint1 = el("heroPoint1");
  if (heroPoint1) heroPoint1.textContent = t.heroPoint1;
  const heroPoint2 = el("heroPoint2");
  if (heroPoint2) heroPoint2.textContent = t.heroPoint2;
  const heroPoint3 = el("heroPoint3");
  if (heroPoint3) heroPoint3.textContent = t.heroPoint3;
  const heroPoint4 = el("heroPoint4");
  if (heroPoint4) heroPoint4.textContent = t.heroPoint4;
  const heroLoginText = el("heroLoginText");
  if (heroLoginText) heroLoginText.textContent = t.heroLoginText;
  const heroCardTitle = el("heroCardTitle");
  if (heroCardTitle) heroCardTitle.textContent = t.heroCardTitle;
  const heroCardText = el("heroCardText");
  if (heroCardText) heroCardText.textContent = t.heroCardText;
  const heroCardFeat1 = el("heroCardFeat1");
  if (heroCardFeat1) heroCardFeat1.textContent = t.heroCardFeat1 || "Optional Voice Guidance";
  const heroCardFeat2 = el("heroCardFeat2");
  if (heroCardFeat2) heroCardFeat2.textContent = t.heroCardFeat2 || "High-Contrast & Big Buttons";
  const heroCardFeat3 = el("heroCardFeat3");
  if (heroCardFeat3) heroCardFeat3.textContent = t.heroCardFeat3 || "Offline-Ready Models";
  const heroCardFeat4 = el("heroCardFeat4");
  if (heroCardFeat4) heroCardFeat4.textContent = t.heroCardFeat4 || "100% Mobile Responsive";

  const featuresTitle = el("featuresTitle");
  if (featuresTitle) featuresTitle.textContent = t.featuresTitle;
  const feat1Title = el("feat1Title");
  if (feat1Title) feat1Title.textContent = t.feat1Title;
  const feat1Text = el("feat1Text");
  if (feat1Text) feat1Text.textContent = t.feat1Text;
  const feat2Title = el("feat2Title");
  if (feat2Title) feat2Title.textContent = t.feat2Title;
  const feat2Text = el("feat2Text");
  if (feat2Text) feat2Text.textContent = t.feat2Text;
  const feat3Title = el("feat3Title");
  if (feat3Title) feat3Title.textContent = t.feat3Title;
  const feat3Text = el("feat3Text");
  if (feat3Text) feat3Text.textContent = t.feat3Text;
  const feat4Title = el("feat4Title");
  if (feat4Title) feat4Title.textContent = t.feat4Title;
  const feat4Text = el("feat4Text");
  if (feat4Text) feat4Text.textContent = t.feat4Text;
  const contactTitle = el("contactTitle");
  if (contactTitle) contactTitle.textContent = t.contactTitle;
  const contactIntro = el("contactIntro");
  if (contactIntro) contactIntro.textContent = t.contactIntro;
  const teamTitle = el("teamTitle");
  if (teamTitle) teamTitle.textContent = t.teamTitle;
  const teamMember1 = el("teamMember1");
  if (teamMember1) teamMember1.textContent = t.teamMember1;
  const teamMember2 = el("teamMember2");
  if (teamMember2) teamMember2.textContent = t.teamMember2;
  const teamMember3 = el("teamMember3");
  if (teamMember3) teamMember3.textContent = t.teamMember3;

  const getInTouchTitle = el("getInTouchTitle");
  if (getInTouchTitle) getInTouchTitle.textContent = t.getInTouchTitle;
  const footerText = el("footerText");
  if (footerText) footerText.textContent = t.footerText;
  const loginTitle = el("loginTitle");
  if (loginTitle) loginTitle.textContent = t.loginTitle;
  const languageLabel = el("languageLabel");
  if (languageLabel) languageLabel.textContent = t.languageLabel;
  const nameLabelLogin = el("nameLabelLogin");
  if (nameLabelLogin) nameLabelLogin.textContent = t.nameLabelLogin || "Your name";
  const phoneLabelLogin = el("phoneLabelLogin");
  if (phoneLabelLogin) phoneLabelLogin.textContent = t.phoneLabelLogin;
  const passwordLabelLogin = el("passwordLabelLogin");
  if (passwordLabelLogin) passwordLabelLogin.textContent = t.passwordLabelLogin;
  if (loginSubmitBtn) loginSubmitBtn.textContent = t.loginButton;
}

// Apply saved language on load
const savedLang = localStorage.getItem("uiLang") || "en";
if (languageSelect) {
  languageSelect.value = savedLang;
}
if (topLanguageSelect) {
  topLanguageSelect.value = savedLang;
}
applyLandingLanguage(savedLang);

// Update language live when user changes dropdown
if (languageSelect) {
  languageSelect.addEventListener("change", () => {
    const lang = languageSelect.value;
    localStorage.setItem("uiLang", lang);
    if (topLanguageSelect) {
      topLanguageSelect.value = lang;
      topLanguageSelect.dispatchEvent(new Event('change'));
    }
    applyLandingLanguage(lang);
  });
}
if (topLanguageSelect) {
  topLanguageSelect.addEventListener("change", () => {
    const lang = topLanguageSelect.value;
    localStorage.setItem("uiLang", lang);
    if (languageSelect) {
      languageSelect.value = lang;
      languageSelect.dispatchEvent(new Event('change'));
    }
    applyLandingLanguage(lang);
  });
}

// --- Password Visibility Toggle Logic ---
function setupPasswordToggle(inputEl, btnEl) {
  if (!inputEl || !btnEl) return;
  btnEl.addEventListener("click", () => {
    const isPassword = inputEl.type === "password";
    inputEl.type = isPassword ? "text" : "password";
    
    // Toggle the slash line on eye icon
    const slash = btnEl.querySelector(".eye-slash");
    if (slash) {
      if (isPassword) {
        slash.classList.remove("hidden");
      } else {
        slash.classList.add("hidden");
      }
    }
  });
}

setupPasswordToggle(document.getElementById("passwordInput"), document.getElementById("togglePasswordBtn"));
setupPasswordToggle(document.getElementById("confirmPasswordInput"), document.getElementById("toggleConfirmPasswordBtn"));
setupPasswordToggle(document.getElementById("forgotNewPasswordInput"), document.getElementById("toggleForgotNewPasswordBtn"));
setupPasswordToggle(document.getElementById("forgotConfirmPasswordInput"), document.getElementById("toggleForgotConfirmPasswordBtn"));

const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const backToLoginLink = document.getElementById("backToLoginLink");
const forgotPasswordSection = document.getElementById("forgotPasswordSection");

const sendOtpBtn = document.getElementById("sendOtpBtn");
const resetPasswordSubmitBtn = document.getElementById("resetPasswordSubmitBtn");
const forgotEmailInput = document.getElementById("forgotEmailInput");
const forgotOtpInput = document.getElementById("forgotOtpInput");
const forgotNewPasswordInput = document.getElementById("forgotNewPasswordInput");
const forgotConfirmPasswordInput = document.getElementById("forgotConfirmPasswordInput");

const forgotPhoneStep = document.getElementById("forgotPhoneStep");
const forgotOtpStep = document.getElementById("forgotOtpStep");
const forgotResetStep = document.getElementById("forgotResetStep");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", () => {
    loginFormInputs.classList.add("hidden");
    forgotPasswordSection.classList.remove("hidden");
    loginError.textContent = "";
    loginError.style.color = "";
    // Reset steps
    forgotPhoneStep.classList.remove("hidden");
    forgotOtpStep.classList.add("hidden");
    forgotResetStep.classList.add("hidden");
  });
}

if (backToLoginLink) {
  backToLoginLink.addEventListener("click", () => {
    forgotPasswordSection.classList.add("hidden");
    loginFormInputs.classList.remove("hidden");
    loginError.textContent = "";
    loginError.style.color = "";
  });
}

if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", async () => {
    loginError.textContent = "";
    loginError.style.color = "";
    const email = forgotEmailInput.value.trim();
    if (!email) {
      loginError.textContent = "Please enter email address.";
      return;
    }
    try {
      const res = await fetch("/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.ok) {
        loginError.textContent = data.message || "Failed to send OTP.";
        return;
      }
      
      // Successfully sent OTP
      forgotPhoneStep.classList.add("hidden");
      forgotOtpStep.classList.remove("hidden");
      forgotResetStep.classList.add("hidden");
      
      loginError.style.color = "green";
      loginError.textContent = "OTP sent successfully to your email.";
    } catch (e) {
      loginError.textContent = "Error communicating with server.";
    }
  });
}

if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", async () => {
    loginError.textContent = "";
    loginError.style.color = "";
    const email = forgotEmailInput.value.trim();
    const otp = forgotOtpInput.value.trim();
    if (!otp) {
      loginError.textContent = "Please enter the OTP code.";
      return;
    }
    try {
      const res = await fetch("/api/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!data.ok) {
        loginError.textContent = data.message || "Incorrect or expired OTP.";
        return;
      }
      
      // Successfully verified OTP: proceed to password change
      forgotOtpStep.classList.add("hidden");
      forgotResetStep.classList.remove("hidden");
      loginError.style.color = "green";
      loginError.textContent = "OTP verified. Set a new password below.";
    } catch (e) {
      loginError.textContent = "Error communicating with server.";
    }
  });
}

if (resetPasswordSubmitBtn) {
  resetPasswordSubmitBtn.addEventListener("click", async () => {
    loginError.style.color = "";
    loginError.textContent = "";
    const email = forgotEmailInput.value.trim();
    const otp = forgotOtpInput.value.trim();
    const newPassword = forgotNewPasswordInput.value.trim();
    const confirmPassword = forgotConfirmPasswordInput.value.trim();
    
    if (!newPassword || !confirmPassword) {
      loginError.textContent = "Please enter and confirm your new password.";
      return;
    }
    if (newPassword.length < 6) {
      loginError.textContent = "Password must be at least 6 characters.";
      return;
    }
    if (newPassword !== confirmPassword) {
      loginError.textContent = "Passwords do not match.";
      return;
    }
    
    try {
      const res = await fetch("/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!data.ok) {
        loginError.textContent = data.message || "Reset failed.";
        return;
      }
      
      // Reset successful
      loginError.style.color = "green";
      loginError.textContent = "Password changed successfully! Redirecting...";
      setTimeout(() => {
        loginError.style.color = "";
        loginError.textContent = "";
        forgotPasswordSection.classList.add("hidden");
        loginFormInputs.classList.remove("hidden");
        // Clear forms
        forgotEmailInput.value = "";
        forgotOtpInput.value = "";
        forgotNewPasswordInput.value = "";
        forgotConfirmPasswordInput.value = "";
      }, 2000);
    } catch (e) {
      loginError.textContent = "Error communicating with server.";
    }
  });
}

// --- Google Auth Flow (Official Google Identity Services + Mock Selector Fallback) ---
const googleLoginBtn = document.getElementById("googleLoginBtn");
const googleBtnContainer = document.getElementById("googleBtnContainer");
const googleMockModal = document.getElementById("googleMockModal");
const googleMockCancelBtn = document.getElementById("googleMockCancelBtn");
const closeGoogleMockBackdrop = document.getElementById("closeGoogleMockBackdrop");
const googleMockFallbackLinkContainer = document.getElementById("googleMockFallbackLinkContainer");
const useMockGoogleBtn = document.getElementById("useMockGoogleBtn");

// Google Link setup inputs
const googleRegisterSection = document.getElementById("googleRegisterSection");
const googleUsernameInput = document.getElementById("googleUsernameInput");
const googlePasswordInput = document.getElementById("googlePasswordInput");
const googleConfirmPasswordInput = document.getElementById("googleConfirmPasswordInput");
const googleRegisterSubmitBtn = document.getElementById("googleRegisterSubmitBtn");
const cancelGoogleRegisterLink = document.getElementById("cancelGoogleRegisterLink");

let pendingGoogleEmail = "";
let pendingGoogleName = "";
let pendingGooglePicture = "";

// Enable password visibility togglers for Google linking fields
setupPasswordToggle(googlePasswordInput, document.getElementById("toggleGooglePasswordBtn"));
setupPasswordToggle(googleConfirmPasswordInput, document.getElementById("toggleGoogleConfirmPasswordBtn"));

// Shared callback function to handle login verification success
function handleGoogleLoginSuccess(data, language) {
  if (data.needsRegistration) {
    // Show username/password setting screen
    pendingGoogleEmail = data.email || "";
    pendingGoogleName = data.name || "Google User";
    pendingGooglePicture = data.picture || "";

    // Generate clean prefilled suggested username from their name
    const cleanPrefix = pendingGoogleName.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    googleUsernameInput.value = cleanPrefix + Math.floor(100 + Math.random() * 900);

    loginFormInputs.classList.add("hidden");
    googleRegisterSection.classList.remove("hidden");
    loginError.textContent = "";
    loginError.style.color = "";
  } else {
    // Save session
    localStorage.setItem("farmerPhone", data.phone);
    if (data.token) {
      localStorage.setItem("sessionToken", data.token);
    }
    localStorage.setItem("farmerName", data.name);
    if (data.email) {
      localStorage.setItem("farmerEmail", data.email);
    }
    if (data.username) {
      localStorage.setItem("farmerUsername", data.username);
    }
    if (data.picture) {
      localStorage.setItem("farmerProfilePic", data.picture);
    }
    localStorage.setItem("farmerLang", language);
    localStorage.setItem("uiLang", language);

    loginModal.classList.add("hidden");
    window.location.href = "dashboard.html";
  }
}

// Complete Google Linking Setup
if (googleRegisterSubmitBtn) {
  googleRegisterSubmitBtn.addEventListener("click", async () => {
    loginError.textContent = "";
    loginError.style.color = "";
    const username = googleUsernameInput.value.trim();
    const password = googlePasswordInput.value.trim();
    const confirm = googleConfirmPasswordInput.value.trim();
    const language = (topLanguageSelect ? topLanguageSelect.value : "") || "en";

    if (!username || !password) {
      loginError.textContent = "Username and password are required.";
      return;
    }
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      loginError.textContent = "Username must be 3-20 characters (alphanumeric, underscores, or dashes).";
      return;
    }
    if (password.length < 6) {
      loginError.textContent = "Password must be at least 6 characters.";
      return;
    }
    if (password !== confirm) {
      loginError.textContent = "Passwords do not match.";
      return;
    }

    try {
      const res = await fetch("/api/google-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingGoogleEmail,
          name: pendingGoogleName,
          picture: pendingGooglePicture,
          username,
          password,
          language
        })
      });
      const data = await res.json();
      if (!data.ok) {
        loginError.style.color = "red";
        loginError.textContent = data.message || "Linking configuration failed.";
        return;
      }

      // Google Account Link Success
      localStorage.setItem("farmerPhone", data.phone);
      if (data.token) {
        localStorage.setItem("sessionToken", data.token);
      }
      localStorage.setItem("farmerName", data.name);
      if (data.email) {
        localStorage.setItem("farmerEmail", data.email);
      }
      if (data.username) {
        localStorage.setItem("farmerUsername", data.username);
      }
      if (data.picture) {
        localStorage.setItem("farmerProfilePic", data.picture);
      }
      localStorage.setItem("farmerLang", language);
      localStorage.setItem("uiLang", language);

      loginModal.classList.add("hidden");
      window.location.href = "dashboard.html";
    } catch (err) {
      loginError.style.color = "red";
      loginError.textContent = "Communication error while linking account.";
    }
  });
}

if (cancelGoogleRegisterLink) {
  cancelGoogleRegisterLink.addEventListener("click", () => {
    googleRegisterSection.classList.add("hidden");
    loginFormInputs.classList.remove("hidden");
    loginError.textContent = "";
    loginError.style.color = "";
    pendingGoogleEmail = "";
    pendingGoogleName = "";
    pendingGooglePicture = "";
  });
}

// Callback for official Google SDK login
async function handleCredentialResponse(response) {
  loginError.textContent = "Verifying Google account...";
  loginError.style.color = "orange";
  const language = (topLanguageSelect ? topLanguageSelect.value : "") || "en";

  try {
    const res = await fetch("/api/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: response.credential, language })
    });
    const data = await res.json();
    if (!data.ok) {
      loginError.style.color = "red";
      loginError.textContent = data.message || "Google Sign-in failed verification.";
      return;
    }

    handleGoogleLoginSuccess(data, language);
  } catch (err) {
    loginError.style.color = "red";
    loginError.textContent = "Error communicating with server during Google login.";
  }
}

// Check configuration status on load
async function setupGoogleSignIn() {
  try {
    const res = await fetch("/api/config");
    const data = await res.json();

    if (data.realGoogleAuth && window.google) {
      // Credentials are set in .env: Initialize and mount official SDK button
      google.accounts.id.initialize({
        client_id: data.googleClientId,
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        googleBtnContainer,
        { theme: "outline", size: "large", width: 280 }
      );
      // Show official container, hide fallback button, show mock link fallback
      if (googleBtnContainer) googleBtnContainer.classList.remove("hidden");
      if (googleLoginBtn) googleLoginBtn.classList.add("hidden");
      if (googleMockFallbackLinkContainer) googleMockFallbackLinkContainer.classList.remove("hidden");
    } else {
      // Credentials are missing: Show fallback button (opens simulation dialog)
      if (googleBtnContainer) googleBtnContainer.classList.add("hidden");
      if (googleLoginBtn) googleLoginBtn.classList.remove("hidden");
      if (googleMockFallbackLinkContainer) googleMockFallbackLinkContainer.classList.remove("hidden");
    }
  } catch (e) {
    console.warn("Unable to fetch configuration for Google Sign-in:", e);
    // Graceful fallback to mock selector
    if (googleBtnContainer) googleBtnContainer.classList.add("hidden");
    if (googleLoginBtn) googleLoginBtn.classList.remove("hidden");
    if (googleMockFallbackLinkContainer) googleMockFallbackLinkContainer.classList.remove("hidden");
  }
}

// Call Google initializer
if (window.addEventListener) {
  window.addEventListener("load", setupGoogleSignIn);
} else {
  window.onload = setupGoogleSignIn;
}

if (googleLoginBtn && googleMockModal) {
  googleLoginBtn.addEventListener("click", () => {
    googleMockModal.classList.remove("hidden");
  });
}
// Toggle login forms and handle registration
const showEmailSignupBtn = document.getElementById("showEmailSignupBtn");
const backToLoginFromSignupBtn = document.getElementById("backToLoginFromSignupBtn");
const loginFormInputs = document.getElementById("loginFormInputs");
const emailSignupSection = document.getElementById("emailSignupSection");

if (showEmailSignupBtn && loginFormInputs && emailSignupSection) {
  showEmailSignupBtn.addEventListener("click", () => {
    loginFormInputs.classList.add("hidden");
    emailSignupSection.classList.remove("hidden");
    loginError.textContent = "";
  });
}

if (backToLoginFromSignupBtn && loginFormInputs && emailSignupSection) {
  backToLoginFromSignupBtn.addEventListener("click", () => {
    emailSignupSection.classList.add("hidden");
    loginFormInputs.classList.remove("hidden");
    loginError.textContent = "";
  });
}

// Email Signup Form Submit Handling
const signupEmailInput = document.getElementById("signupEmailInput");
const signupPasswordInput = document.getElementById("signupPasswordInput");
const signupConfirmPasswordInput = document.getElementById("signupConfirmPasswordInput");
const emailSignupSubmitBtn = document.getElementById("emailSignupSubmitBtn");

if (emailSignupSubmitBtn && signupEmailInput && signupPasswordInput && signupConfirmPasswordInput) {
  emailSignupSubmitBtn.addEventListener("click", async () => {
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value;
    const confirmPassword = signupConfirmPasswordInput.value;

    if (!email || !password || !confirmPassword) {
      loginError.style.color = "red";
      loginError.textContent = "All fields are required.";
      return;
    }

    if (password !== confirmPassword) {
      loginError.style.color = "red";
      loginError.textContent = "Passwords do not match.";
      return;
    }

    loginError.textContent = "";
    loginError.style.color = "";
    emailSignupSubmitBtn.disabled = true;
    emailSignupSubmitBtn.textContent = "Registering...";

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword })
      });
      const data = await res.json();
      
      if (!data.ok) {
        loginError.style.color = "red";
        loginError.textContent = data.message || "Registration failed.";
        emailSignupSubmitBtn.disabled = false;
        emailSignupSubmitBtn.textContent = "Register Account";
        return;
      }

      // Successful registration & auto-login
      localStorage.setItem("sessionToken", data.token);
      localStorage.setItem("farmerPhone", data.phone);
      localStorage.setItem("farmerName", data.name);
      localStorage.setItem("uiLang", data.language || "en");
      
      window.location.href = "dashboard.html";
    } catch (err) {
      loginError.style.color = "red";
      loginError.textContent = "Connection error. Please try again.";
      emailSignupSubmitBtn.disabled = false;
      emailSignupSubmitBtn.textContent = "Register Account";
    }
  });
}

function closeGoogleMock() {
  if (googleMockModal) googleMockModal.classList.add("hidden");
}

if (googleMockCancelBtn) googleMockCancelBtn.addEventListener("click", closeGoogleMock);
if (closeGoogleMockBackdrop) closeGoogleMockBackdrop.addEventListener("click", closeGoogleMock);

document.querySelectorAll(".google-account-option-btn").forEach(btn => {
  btn.addEventListener("click", async (e) => {
    const targetBtn = e.currentTarget;
    const email = targetBtn.getAttribute("data-email");
    const name = targetBtn.getAttribute("data-name");
    const language = topLanguageSelect ? topLanguageSelect.value : "en";

    closeGoogleMock();
    loginError.textContent = "";
    loginError.style.color = "";

    try {
      const res = await fetch("/api/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, language })
      });
      const data = await res.json();
      if (!data.ok) {
        loginError.style.color = "red";
        loginError.textContent = data.message || "Google Sign-in failed.";
        return;
      }

      handleGoogleLoginSuccess(data, language);
    } catch (err) {
      loginError.style.color = "red";
      loginError.textContent = "Error communicating with server.";
    }
  });
});

// Custom select dropdown converter
function initCustomSelects() {
  const selects = document.querySelectorAll('select.dash-lang-select, select#topLanguageSelect, select#languageSelect');
  
  selects.forEach(select => {
    // Avoid double initialization
    if (select.nextElementSibling && select.nextElementSibling.classList.contains('custom-select-wrapper')) {
      return;
    }
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    if (select.id) {
      wrapper.id = select.id + '-custom-wrapper';
    }
    if (select.style.width) {
      wrapper.style.width = select.style.width;
    }
    
    // Create trigger
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    const triggerText = document.createElement('span');
    // Get text of currently selected option
    const activeOption = select.options[select.selectedIndex];
    triggerText.textContent = activeOption ? activeOption.textContent : '';
    trigger.appendChild(triggerText);
    
    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options';
    
    // Populate options
    Array.from(select.options).forEach(opt => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'custom-select-option';
      if (opt.value === select.value) {
        optionDiv.classList.add('selected');
      }
      optionDiv.textContent = opt.textContent;
      optionDiv.setAttribute('data-value', opt.value);
      
      optionDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = opt.value;
        // Trigger the change event on the native select
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        
        // Update trigger text
        triggerText.textContent = opt.textContent;
        
        // Update selection class
        wrapper.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected'));
        optionDiv.classList.add('selected');
        
        // Close dropdown
        wrapper.classList.remove('open');
      });
      
      optionsContainer.appendChild(optionDiv);
    });
    
    // Hide original select and insert custom wrapper
    select.style.display = 'none';
    select.parentNode.insertBefore(wrapper, select.nextSibling);
    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsContainer);
    
    // Toggle on click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close all other custom selects first
      document.querySelectorAll('.custom-select-wrapper').forEach(w => {
        if (w !== wrapper) w.classList.remove('open');
      });
      wrapper.classList.toggle('open');
    });
    
    // Listen for changes (both user and triggered programmatically)
    select.addEventListener('change', () => {
      const currentOpt = select.options[select.selectedIndex];
      if (currentOpt) {
        triggerText.textContent = currentOpt.textContent;
        wrapper.querySelectorAll('.custom-select-option').forEach(el => {
          if (el.getAttribute('data-value') === select.value) {
            el.classList.add('selected');
          } else {
            el.classList.remove('selected');
          }
        });
      }
    });
  });
}

// Close dropdowns on click outside
document.addEventListener('click', () => {
  document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
});

// Run initialization
initCustomSelects();

