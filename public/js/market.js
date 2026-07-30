function $(id) {
  return document.getElementById(id);
}

const farmerPhone = localStorage.getItem("farmerPhone") || "";
const farmerEmail = localStorage.getItem("farmerEmail") || "";
const farmerUsername = localStorage.getItem("farmerUsername") || "";
const farmerLang = localStorage.getItem("uiLang") || localStorage.getItem("farmerLang") || "en";
if ((!farmerPhone && !farmerEmail && !farmerUsername) || !localStorage.getItem("sessionToken")) {
  performLogout();
}

const profileInitials = $("profileInitials");
const profilePhoneShort = $("profilePhoneShort");
const profileButton = $("profileButton");
const profileDropdown = $("profileDropdown");
const profileLogoutBtn = $("profileLogoutBtn");
const profileBackDashboard = $("profileBackDashboard");

if (profileInitials) {
  const savedPic = localStorage.getItem("farmerProfilePic");
  if (savedPic) {
    profileInitials.innerHTML = `<img src="${savedPic}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
  } else {
    const farmerName = localStorage.getItem("farmerName") || "";
    profileInitials.textContent = farmerName ? farmerName.charAt(0).toUpperCase() : "F";
  }
  if (profilePhoneShort) {
    const lastDigits = farmerPhone.slice(-4);
    profilePhoneShort.textContent = lastDigits ? `+91‑***${lastDigits}` : "+91‑";
  }
}

function performLogout() {
  localStorage.removeItem("farmerPhone");
  localStorage.removeItem("farmerName");
  localStorage.removeItem("farmerLang");
  localStorage.removeItem("uiLang");
  localStorage.removeItem("sessionToken");
  window.location.href = "index.html";
}

if (profileLogoutBtn) {
  profileLogoutBtn.addEventListener("click", performLogout);
}
if (profileBackDashboard) {
  profileBackDashboard.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
}
if (profileButton && profileDropdown) {
  profileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("hidden");
  });
  document.addEventListener("click", () => {
    profileDropdown.classList.add("hidden");
  });
}

const locationInputMarket = $("locationInputMarket");
const detectLocationMarketBtn = $("detectLocationMarketBtn");
const loadMarketBtn = $("loadMarketBtn");
const locationMarketError = $("locationMarketError");
const marketContent = $("marketContent");

function autoDetectLocation() {
  locationInputMarket.value = "Detecting...";

  if (!navigator.geolocation) {
    console.warn("Navigator Geolocation not supported. Falling back to IP detection.");
    detectLocationByIP();
    return;
  }

  // Request actual live GPS/device coordinates first (live location)
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      // Prevent overwrite if the user already started typing
      if (locationInputMarket.value !== "Detecting..." && locationInputMarket.value !== "") {
        console.log("User changed location input, ignoring auto-detect GPS.");
        return;
      }
      const { latitude, longitude } = pos.coords;
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const geoData = await geoRes.json();
        
        let areaParts = [];
        // Parse admin levels for rich detailed village / sub-district / district names
        if (geoData.localityInfo && geoData.localityInfo.administrative) {
          const sortedAdmin = geoData.localityInfo.administrative
            .filter(item => item.name && item.name !== geoData.countryName && item.name !== "India")
            .sort((a, b) => b.order - a.order);
            
          sortedAdmin.forEach(item => {
            if (areaParts.length < 3 && !areaParts.includes(item.name)) {
              if (!item.name.toLowerCase().includes("zone") && !item.name.toLowerCase().includes("region")) {
                areaParts.push(item.name);
              }
            }
          });
        }
        
        if (areaParts.length === 0) {
          if (geoData.locality) areaParts.push(geoData.locality);
          if (geoData.city) areaParts.push(geoData.city);
        }
        if (geoData.principalSubdivision && !areaParts.includes(geoData.principalSubdivision)) {
          areaParts.push(geoData.principalSubdivision);
        }
        
        // Re-check value before writing
        if (locationInputMarket.value === "Detecting...") {
          locationInputMarket.value = areaParts.join(", ") || `Lat ${latitude.toFixed(3)}, Lon ${longitude.toFixed(3)}`;
        }
      } catch (err) {
        if (locationInputMarket.value === "Detecting...") {
          locationInputMarket.value = `Lat ${latitude.toFixed(3)}, Lon ${longitude.toFixed(3)}`;
        }
      }
    },
    (err) => {
      console.warn("HTML5 live GPS Geolocation failed or timed out. Falling back to IP geolocation...", err);
      if (locationInputMarket.value === "Detecting...") {
        detectLocationByIP();
      }
    },
    { enableHighAccuracy: true, timeout: 6000, maximumAge: 10000 }
  );
}

async function detectLocationByIP() {
  // 1. Try ipinfo.io (HTTPS, free, no key)
  try {
    const res = await fetch("https://ipinfo.io/json");
    if (res.ok) {
      const data = await res.json();
      if (data && data.city) {
        const areaName = [data.city, data.region, data.country].filter(Boolean).join(", ");
        if (locationInputMarket.value === "Detecting..." || locationInputMarket.value === "") {
          locationInputMarket.value = areaName;
        }
        return;
      }
    }
  } catch (err) {
    console.warn("ipinfo lookup failed", err);
  }

  // 2. Try freeipapi.com (HTTPS, free, no key)
  try {
    const res = await fetch("https://freeipapi.com/api/json");
    if (res.ok) {
      const data = await res.json();
      if (data && data.cityName) {
        const areaName = [data.cityName, data.regionName, data.countryName].filter(Boolean).join(", ");
        if (locationInputMarket.value === "Detecting..." || locationInputMarket.value === "") {
          locationInputMarket.value = areaName;
        }
        return;
      }
    }
  } catch (err) {
    console.warn("freeipapi lookup failed", err);
  }

  // 3. Try ip-api.com (HTTP fallback, free, no key)
  try {
    const res = await fetch("http://ip-api.com/json");
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === "success") {
        const areaName = [data.city, data.regionName, data.country].filter(Boolean).join(", ");
        if (locationInputMarket.value === "Detecting..." || locationInputMarket.value === "") {
          locationInputMarket.value = areaName;
        }
        return;
      }
    }
  } catch (err) {
    console.warn("ip-api lookup failed", err);
  }

  if (locationInputMarket.value === "Detecting...") {
    locationInputMarket.value = "";
    if (locationMarketError) {
      locationMarketError.textContent = "Could not detect location automatically. Please type your location manually.";
    }
  }
}

autoDetectLocation();

if (detectLocationMarketBtn) {
  detectLocationMarketBtn.addEventListener("click", autoDetectLocation);
}

const cropSearchInput = $("cropSearchInput");

const cardTranslations = {
  en: { market: "Market", arrivals: "Arrivals", price: "Price", range: "Range", date: "Report Date" },
  te: { market: "మార్కెట్", arrivals: "రాకడ (వాల్యూమ్)", price: "ధర", range: "పరిధి", date: "నివేదిక తేదీ" },
  hi: { market: "मंडी", arrivals: "आवक (मात्रा)", price: "दर", range: "सीमा", date: "रिपोर्ट दिनांक" },
  mr: { market: "बाजार", arrivals: "आवक (प्रमाण)", price: "दर", range: "मर्यादा", date: "अहवाल तारीख" },
  ml: { market: "മാർക്കറ്റ്", arrivals: "വരവ് (അളവ്)", price: "വില", range: "പരിധി", date: "റിപ്പോർട്ട് തീയതി" }
};

function getDemandBadge(demand) {
  const uiLang = localStorage.getItem("uiLang") || "en";
  const translations = {
    en: { High: "High", Rising: "Rising", Medium: "Medium", Low: "Low" },
    te: { High: "ఎక్కువ", Rising: "పెరుగుతోంది", Medium: "మధ్యస్థం", Low: "తక్కువ" },
    hi: { High: "उच्च", Rising: "बढ़ रही है", Medium: "मध्यम", Low: "कम" },
    mr: { High: "जास्त", Rising: "वाढत आहे", Medium: "मध्यम", Low: "कमी" },
    ml: { High: "കൂടിയത്", Rising: "കൂടുന്നു", Medium: "മിതത്വം", Low: "കുറഞ്ഞത്" }
  };
  const label = (translations[uiLang] || translations.en)[demand] || demand;
  
  let styles = "display: inline-block; padding: 0.15rem 0.5rem; font-size: 0.75rem; font-weight: 700; border-radius: 4px; margin-left: 0.5rem;";
  if (demand === 'High') {
    styles += "background: #e6f9ed; color: #1f7a42; border: 1px solid #ccefd8;";
  } else if (demand === 'Rising') {
    styles += "background: #fef8e7; color: #b27a00; border: 1px solid #fdf0cd;";
  } else if (demand === 'Low') {
    styles += "background: #fff0f0; color: #c92a2a; border: 1px solid #ffc9c9;";
  } else {
    styles += "background: #f1f3f5; color: #495057; border: 1px solid #e9ecef;";
  }
  return `<span style="${styles}">${label}</span>`;
}

if (loadMarketBtn) {
  loadMarketBtn.addEventListener("click", async () => {
    const loc = (locationInputMarket.value || "").trim() || "Your area";
    const searchVal = cropSearchInput ? (cropSearchInput.value || "").trim() : "";
    locationMarketError.textContent = "";
    
    const uiLang = localStorage.getItem("uiLang") || "en";
    const ct = cardTranslations[uiLang] || cardTranslations.en;
    const mt = marketTranslations[uiLang] || marketTranslations.en;
    
    // Clear previous results
    marketContent.innerHTML = "";
    
    // Show top loader
    const marketLoaderTop = document.getElementById("marketLoaderTop");
    if (marketLoaderTop) {
      const textEl = marketLoaderTop.querySelector(".agri-loader-text");
      if (textEl) {
        textEl.textContent = uiLang === 'te' ? "మార్కెట్ సమాచారాన్ని లోడ్ చేస్తున్నాము..." : 
                             uiLang === 'hi' ? "बाजार की जानकारी लोड हो रही है..." : 
                             uiLang === 'mr' ? "बाजार माहिती लोड होत आहे..." : 
                             uiLang === 'ml' ? "മാർക്കറ്റ് വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു..." : 
                             "Loading market information...";
      }
      marketLoaderTop.style.display = "flex";
    }
                                
    try {
      const res = await fetch(
        `/api/market-demand?location=${encodeURIComponent(loc)}&search=${encodeURIComponent(searchVal)}`
      );
      const data = await res.json();
      
      // Hide top loader
      if (marketLoaderTop) marketLoaderTop.style.display = "none";

      if (!data.ok) {
        marketContent.textContent = "Error loading market data.";
        return;
      }
      
      if (!data.crops || data.crops.length === 0) {
        marketContent.innerHTML = `<p class="muted" style="margin-top: 1rem;">${mt.noCropsFound}</p>`;
        return;
      }

      const list = document.createElement("div");
      list.className = "market-grid";
      list.style.cssText = "display: grid !important; gap: 1.5rem !important; margin-top: 1.5rem !important; width: 100% !important;";
      const maxCropsToShow = window.innerWidth <= 768 ? 6 : 8;
      data.crops.slice(0, maxCropsToShow).forEach((c) => {
        const d = document.createElement("div");
        d.className = "recommendation-card";
        d.style.background = "white"; // Override any background color conflicts
        
        d.innerHTML = `
          <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; height: 100%; box-sizing: border-box;">
            <!-- Card Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
              <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; line-height: 1.3;">${c.name}</h3>
              ${getDemandBadge(c.demand)}
            </div>

            <!-- Divider -->
            <div style="height: 1px; background: #e2e8f0; opacity: 0.6; margin: 0.25rem 0;"></div>

            <!-- Details Grid/List -->
            <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.9rem; color: #475569;">
              <!-- Market Row -->
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--primary-color)" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; color: var(--primary-color);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span><strong>${ct.market}:</strong> ${c.market}</span>
              </div>

              <!-- Arrivals Row -->
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--primary-color)" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; color: var(--primary-color);"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                <span><strong>${ct.arrivals}:</strong> ${c.arrivals || '0 tonnes'}</span>
              </div>

              <!-- Price Box -->
              <div style="margin-top: 0.4rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem;">
                <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 0.2rem;">
                  ${ct.price} (Modal)
                </div>
                <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary-color); line-height: 1.2;">
                  ${c.price}
                </div>
                <div style="font-size: 0.8rem; margin-top: 0.4rem; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 0.4rem;">
                  <span>Min: <strong style="color: #475569;">${c.minPrice}</strong></span>
                  <span>Max: <strong style="color: #475569;">${c.maxPrice}</strong></span>
                </div>
              </div>
            </div>

            <!-- Footer Date -->
            <div style="margin-top: auto; padding-top: 0.5rem; font-size: 0.78rem; color: #94a3b8; display: flex; align-items: center; gap: 0.35rem;">
              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #94a3b8;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>${ct.date}: ${c.date}</span>
            </div>
          </div>
        `;
        list.appendChild(d);
      });
      
      const locLabelText = uiLang === 'te' ? "స్థానం" : uiLang === 'hi' ? "स्थान" : uiLang === 'mr' ? "स्थान" : uiLang === 'ml' ? "സ്ഥലം" : "Location";
      marketContent.innerHTML = `<p class="muted">${locLabelText}: ${data.location}</p>`;
      marketContent.appendChild(list);
    } catch (err) {
      if (marketLoaderTop) marketLoaderTop.style.display = "none";
      marketContent.textContent = "Unable to reach market service.";
    }
  });
}

// Popular tags click handlers
const tagButtons = document.querySelectorAll(".crop-tag-btn");
if (tagButtons) {
  tagButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const crop = btn.getAttribute("data-crop");
      if (cropSearchInput) {
        cropSearchInput.value = crop;
      }
      if (loadMarketBtn) {
        loadMarketBtn.click();
      }
    });
  });
}

// Global localization logic for Market Demand page
const marketTranslations = {
  en: {
    dashLogoSubtitle: "Market Demand Near You",
    navHome: "Home",
    navContactUs: "Contact Us",
    navProfile: "Profile",
    marketPageTitle: "Market Demand Near You",
    marketPageIntro: "We use your location to show demand and approximate prices for key crops in nearby markets.",
    locLabel: "Location",
    locPlaceholder: "Detecting location...",
    detectLocationMarketBtn: "Detect location",
    loadMarketBtn: "Show Market Demand",
    cropSearchLabel: "Search Commodity (Optional)",
    cropSearchPlaceholder: "Search specific crop (e.g., Tomato, Cotton)...",
    popularTagsLabel: "Popular:",
    noCropsFound: "No crops found matching your search query."
  },
  te: {
    dashLogoSubtitle: "మీ దగ్గర మార్కెట్ డిమాండ్",
    navHome: "హోమ్",
    navContactUs: "సంప్రదించండి",
    navProfile: "ప్రొఫైల్",
    marketPageTitle: "మీ దగ్గర మార్కెట్ డిమాండ్",
    marketPageIntro: "మీ సమీప మార్కెట్‌లలో ప్రధాన పంటల డిమాండ్ మరియు అంచనా ధరలను చూపించడానికి మేము మీ స్థానాన్ని ఉపയോగిస్తాము.",
    locLabel: "స్థానం",
    locPlaceholder: "స్థానం గుర్తిస్తున్నాము...",
    detectLocationMarketBtn: "స్థానాన్ని గుర్తించండి",
    loadMarketBtn: "మార్కెట్ డిమాండ్ చూపించండి",
    cropSearchLabel: "పంట శోధన (ఐచ్ఛికం)",
    cropSearchPlaceholder: "నిర్దిష్ట పంట కోసం వెతకండి (ఉదా: టమోటా, పత్తి)...",
    popularTagsLabel: "జనాదరణ పొందినవి:",
    noCropsFound: "మీ శోధనకు తగిన పంటలు ఏవీ కనుగొనబడలేదు."
  },
  hi: {
    dashLogoSubtitle: "आपके क्षेत्र की बाजार मांग",
    navHome: "होम",
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    marketPageTitle: "आपके क्षेत्र की बाजार मांग",
    marketPageIntro: "हम आपके आस-पास के बाजारों में प्रमुख फसलों की मांग और अनुमानित कीमतें दिखाने के लिए आपके स्थान का उपयोग करते हैं।",
    locLabel: "स्थान",
    locPlaceholder: "स्थान का पता लगा रहे हैं...",
    detectLocationMarketBtn: "स्थान का पता लगाएँ",
    loadMarketBtn: "बाजार की मांग दिखाएं",
    cropSearchLabel: "फसल खोज (वैकल्पिक)",
    cropSearchPlaceholder: "विशिष्ट फसल खोजें (जैसे, टमाटर, कपास)...",
    popularTagsLabel: "लोकप्रिय:",
    noCropsFound: "आपके चयन से मेल खाती कोई फसल नहीं मिली।"
  },
  mr: {
    dashLogoSubtitle: "तुमच्या भागातील बाजार मागणी",
    navHome: "होम",
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    marketPageTitle: "तुमच्या भागातील बाजार मागणी",
    marketPageIntro: "आम्ही तुमच्या जवळील बाजारपेठांमध्ये प्रमुख पिकांची मागणी आणि अंदाजित किंमती दर्शविण्यासाठी तुमचे स्थान वापरतो.",
    locLabel: "स्थान",
    locPlaceholder: "स्थान शोधत आहे...",
    detectLocationMarketBtn: "स्थान शोधा",
    loadMarketBtn: "बाजार मागणी दाखवा",
    cropSearchLabel: "पिकाचा शोध (पर्यायी)",
    cropSearchPlaceholder: "विशिष्ट पीक शोधा (उदा. टोमॅटो, कापूस)...",
    popularTagsLabel: "लोकप्रिय:",
    noCropsFound: "तुमच्या निवडीशी जुळणारे कोणतेही पीक आढळले नाही."
  },
  ml: {
    dashLogoSubtitle: "നിങ്ങളുടെ പ്രദേശത്തെ മാർക്കറ്റ് ഡിമാൻഡ്",
    navHome: "ഹോം",
    navContactUs: "ബന്ധപ്പെടുക",
    navProfile: "പ്രൊഫൈൽ",
    marketPageTitle: "നിങ്ങളുടെ പ്രദേശത്തെ മാർക്കറ്റ് ഡിമാൻഡ്",
    marketPageIntro: "സമീപമുള്ള മാർക്കറ്റുകളിലെ പ്രധാന വിളകളുടെ ഡിമാൻഡും ഏകദേശ വിലയും കാണിക്കുന്നതിന് ഞങ്ങൾ നിങ്ങളുടെ സ്ഥലം ഉപയോഗിക്കുന്നു.",
    locLabel: "സ്ഥലം",
    locPlaceholder: "സ്ഥലം കണ്ടെത്തുന്നു...",
    detectLocationMarketBtn: "സ്ഥലം കണ്ടെത്തുക",
    loadMarketBtn: "മാർക്കറ്റ് ഡിമാൻഡ് കാണിക്കുക",
    cropSearchLabel: "വിള തിരയുക (ഓപ്ഷണൽ)",
    cropSearchPlaceholder: "പ്രത്യേക വിള തിരയുക (ഉദാ: തക്കാളി, പരുത്തി)...",
    popularTagsLabel: "ജനപ്രിയമായവ:",
    noCropsFound: "നിങ്ങൾ തിരഞ്ഞെടുത്ത വിളകൾ ഒന്നും കണ്ടെത്താനായില്ല."
  }
};

function applyMarketLanguage() {
  const farmerLang = localStorage.getItem("uiLang") || "en";
  const t = marketTranslations[farmerLang] || marketTranslations.en;
  
  if ($('dashLogoSubtitle')) $('dashLogoSubtitle').textContent = t.dashLogoSubtitle;
  if ($('navHome')) $('navHome').textContent = t.navHome;
  if ($('navContactUs')) $('navContactUs').textContent = t.navContactUs;
  if ($('navProfile')) $('navProfile').textContent = t.navProfile;
  
  if ($('marketPageTitle')) $('marketPageTitle').textContent = t.marketPageTitle;
  if ($('marketPageIntro')) $('marketPageIntro').textContent = t.marketPageIntro;
  if ($('locLabel')) $('locLabel').textContent = t.locLabel;
  if (locationInputMarket) locationInputMarket.placeholder = t.locPlaceholder;
  if (detectLocationMarketBtn) {
    detectLocationMarketBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${t.detectLocationMarketBtn}`;
  }
  if (loadMarketBtn) loadMarketBtn.textContent = t.loadMarketBtn;
  
  if ($('cropSearchLabel')) $('cropSearchLabel').textContent = t.cropSearchLabel;
  if (cropSearchInput) cropSearchInput.placeholder = t.cropSearchPlaceholder;
  if ($('popularTagsLabel')) $('popularTagsLabel').textContent = t.popularTagsLabel;
}

applyMarketLanguage();

