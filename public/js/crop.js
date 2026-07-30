function $(id) {
  return document.getElementById(id);
}

function localizeText(text, lang) {
  if (!text) return "";
  let result = text.toString();
  if (lang === "te") {
    const digits = { "0":"౦", "1":"౧", "2":"౨", "3":"౩", "4":"౪", "5":"౫", "6":"౬", "7":"౭", "8":"౮", "9":"౯" };
    result = result.replace(/[0-9]/g, w => digits[w]);
  } else if (lang === "hi" || lang === "mr") {
    const digits = { "0":"०", "1":"१", "2":"२", "3":"३", "4":"४", "5":"५", "6":"६", "7":"७", "8":"८", "9":"९" };
    result = result.replace(/[0-9]/g, w => digits[w]);
  } else if (lang === "ml") {
    const digits = { "0":"൦", "1":"൧", "2":"൨", "3":"൩", "4":"൪", "5":"൫", "6":"൬", "7":"൭", "8":"൮", "9":"൯" };
    result = result.replace(/[0-9]/g, w => digits[w]);
  }
  return result;
}

function getLocalizedCropName(name, lang) {
  if (!name) return "";
  const key = name.toLowerCase().trim().replace(/\s+/g, '');
  const translations = {
    rice: { en: "Rice", te: "వరి", hi: "चावल", mr: "तांदूळ", ml: "നെല്ല്" },
    paddy: { en: "Paddy", te: "వరి", hi: "धान", mr: "धान", ml: "നെല്ല്" },
    wheat: { en: "Wheat", te: "గోధుమ", hi: "गेहूं", mr: "गहू", ml: "ഗോതമ്പ്" },
    maize: { en: "Maize", te: "మొక్కజొన్న", hi: "मक्का", mr: "मका", ml: "ചോളം" },
    sugarcane: { en: "Sugarcane", te: "చెరకు", hi: "गन्ना", mr: "ऊस", ml: "കриമ്പ്" },
    cotton: { en: "Cotton", te: "పత్తి", hi: "कपास", mr: "कपाशी", ml: "പരുത്തി" },
    jute: { en: "Jute", te: "జనపనార", hi: "जूट", mr: "ताग", ml: "ചണം" },
    chilli: { en: "Chilli", te: "మిరప", hi: "मिर्च", mr: "मिरची", ml: "മുളക്" },
    tomato: { en: "Tomato", te: "టమోటా", hi: "टमाटर", mr: "टोमॅटो", ml: "തക്കാളി" },
    brinjal: { en: "Brinjal", te: "వంకాయ", hi: "बैंगन", mr: "वांगी", ml: "വഴുതനങ്ങ" },
    gourd: { en: "Gourd", te: "ఆనపకాయ", hi: "लौकी", mr: "दुधी भोपळा", ml: "ചുരയ്ക്ക" },
    cucumber: { en: "Cucumber", te: "దోసకాయ", hi: "खीरा", mr: "काकडी", ml: "വെള്ളരിക്ക" },
    ragi: { en: "Ragi", te: "రాగి", hi: "रागी", mr: "नाचणी", ml: "റാഗി" },
    fingermillet: { en: "Finger Millet", te: "రాగి", hi: "रागी", mr: "नाचणी", ml: "റാഗി" },
    barley: { en: "Barley", te: "బార్లీ", hi: "जौ", mr: "जव", ml: "ബാർലി" },
    millets: { en: "Millets", te: "చిరుధాన్యాలు", hi: "बाजरा", mr: "बाजरी", ml: "ചെറുധാന്യങ്ങൾ" },
    groundnuts: { en: "Groundnuts", te: "వేరుశనగ", hi: "मूंगफली", mr: "भूईमूग", ml: "നിലക്കടല" },
    chickpea: { en: "Chickpea", te: "శనగలు", hi: "चना", mr: "हरभरा", ml: "കടല" },
    kidneybeans: { en: "Kidney Beans", te: "రాజ్మా", hi: "राजमा", mr: "राजमा", ml: "രാജ്മ" },
    pigeonpeas: { en: "Pigeon Peas", te: "కందులు", hi: "अरहर", mr: "तूर", ml: "തുവരപ്പയർ" },
    mothbeans: { en: "Moth Beans", te: "మొలకెత్తిన పప్పు", hi: "मोठ", mr: "मटकी", ml: "മ Mothപ്പയർ" },
    mungbean: { en: "Mung Bean", te: "పెసలు", hi: "मूंग", mr: "मूग", ml: "ചെറുപയർ" },
    blackgram: { en: "Black Gram", te: "మినుములు", hi: "उड़द", mr: "उडीद", ml: "ഉഴുന്ന്" },
    lentil: { en: "Lentil", te: "మసూర్ పప్పు", hi: "मसूर", mr: "मसूर", ml: "മസൂർ പരിപ്പ്" },
    pomegranate: { en: "Pomegranate", te: "దానిమ్మ", hi: "अनार", mr: "डाळिंब", ml: "മാതളനാരങ്ങ" },
    banana: { en: "Banana", te: "అరటి", hi: "केला", mr: "केळी", ml: "വാഴപ്പഴം" },
    mango: { en: "Mango", te: "మామిడి", hi: "आम", mr: "आंबा", ml: "മാമ്പഴം" },
    grapes: { en: "Grapes", te: "ద్రాక్ష", hi: "अंगूर", mr: "द्राक्षे", ml: "മുന്തിരി" },
    watermelon: { en: "Watermelon", te: "పుచ్చకాయ", hi: "तरबूज", mr: "कलिंगड", ml: "തണ്ണിമത്തൻ" },
    muskmelon: { en: "Muskmelon", te: "కర్బూజా", hi: "खरबूजा", mr: "खरबूज", ml: "മധുരനാരങ്ങ" },
    apple: { en: "Apple", te: "యాపిల్", hi: "सेब", mr: "सफरचंद", ml: "ആപ്പിൾ" },
    orange: { en: "Orange", te: "నారింజ", hi: "संतरा", mr: "संत्रे", ml: "ഓറഞ്ച്" },
    papaya: { en: "Papaya", te: "బొప్పాయి", hi: "पपीता", mr: "पपई", ml: "പപ്പായ" },
    coconut: { en: "Coconut", te: "కొబ్బరి", hi: "नारियल", mr: "नारळ", ml: "തേങ്ങ" },
    coffee: { en: "Coffee", te: "కాఫీ", hi: "कॉफी", mr: "कॉफी", ml: "കാപ്പി" },
    turmeric: { en: "Turmeric", te: "పసుపు", hi: "हल्दी", mr: "हळद", ml: "മഞ്ഞൾ" },
    "berseem(cloverfodder)": { en: "Berseem (Clover)", te: "బెర్సీమ్ (పశుగ్రాసం)", hi: "बरसीम (चारा)", mr: "बरसीम (चारा)", ml: "ബെർസീം (തീറ്റപ്പുല്ല്)" },
    "betelvine(pan)": { en: "Betel Vine (Pan)", te: "తమలపాకు", hi: "पान", mr: "पान", ml: "വെറ്റില" },
    coriander: { en: "Coriander", te: "కొత్తిమీర", hi: "धनिया", mr: "कोथिंबीर", ml: "മല്ലിയില" },
    mustard: { en: "Mustard", te: "ఆవాలు", hi: "सरसों", mr: "मोहरी", ml: "കടുക്" }
  };
  return translations[key] ? (translations[key][lang] || translations[key].en) : name;
}

// Reuse session and simple header logic from dashboard
const farmerPhone = localStorage.getItem("farmerPhone") || "";
const farmerEmail = localStorage.getItem("farmerEmail") || "";
const farmerUsername = localStorage.getItem("farmerUsername") || "";
const farmerLang = localStorage.getItem("uiLang") || localStorage.getItem("farmerLang") || "en";
if ((!farmerPhone && !farmerEmail && !farmerUsername) || !localStorage.getItem("sessionToken")) {
  performLogout();
}

window.currentlySelectedCrops = [];
async function fetchCurrentlySelectedCrops() {
  const token = localStorage.getItem("sessionToken") || "";
  if (!token) return;
  try {
    const res = await fetch("/api/selected-crop", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && data.selections) {
        window.currentlySelectedCrops = data.selections;
      }
    }
  } catch (e) {
    console.error("Error fetching selected crops:", e);
  }
}
fetchCurrentlySelectedCrops();

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

// Crop recommendation steps (copied from previous dashboard logic)
const cropStepLocation = $("cropStepLocation");
const cropStepDetails = $("cropStepDetails");
const cropStepResults = $("cropStepResults");
const nextFromLocation = $("nextFromLocation");
const backToLocation = $("backToLocation");
const getRecommendationsBtn = $("getRecommendationsBtn");
const detectLocationBtn = $("detectLocationBtn");
const locationInput = $("locationInput");
const locationSuggestions = $("locationSuggestions");
const locationError = $("locationError");
const soilSelect = $("soilSelect");
const waterSelect = $("waterSelect");
const acresInput = $("acresInput");
const detailsError = $("detailsError");
const phInput = $("phInput");
const recommendationsList = $("recommendationsList");
const selectError = $("selectError");

function updateStepper(stepNum) {
  const step1 = $("stepIndicator1");
  const step2 = $("stepIndicator2");
  const step3 = $("stepIndicator3");
  const connector1 = $("connector1");
  const connector2 = $("connector2");

  if (stepNum === 1) {
    if (step1) step1.className = "step active";
    if (step2) step2.className = "step";
    if (step3) step3.className = "step";
    if (connector1) connector1.className = "step-connector";
    if (connector2) connector2.className = "step-connector";
  } else if (stepNum === 2) {
    if (step1) step1.className = "step completed";
    if (step2) step2.className = "step active";
    if (step3) step3.className = "step";
    if (connector1) connector1.className = "step-connector active";
    if (connector2) connector2.className = "step-connector";
  } else if (stepNum === 3) {
    if (step1) step1.className = "step completed";
    if (step2) step2.className = "step completed";
    if (step3) step3.className = "step active";
    if (connector1) connector1.className = "step-connector active";
    if (connector2) connector2.className = "step-connector active";
  }
}

let currentLat = null;
let currentLon = null;
let currentEnvData = { temperature: null, humidity: null };

let lastDetectedAreaName = "";

function autoDetectLocation() {
  locationInput.value = "Detecting location...";

  let ipDetected = false;
  let gpsDetected = false;

  // 1. Immediately start IP-based detection in the background
  detectLocationByIP().then((success) => {
    if (success) {
      ipDetected = true;
    }
  });

  // 2. Simultaneously request live GPS coordinates
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        currentLat = latitude;
        currentLon = longitude;
        gpsDetected = true;
        
        // Prevent overwrite if the user already started editing or typed a custom location
        if (locationInput.value !== "Detecting location..." && locationInput.value !== lastDetectedAreaName && locationInput.value !== "") {
          console.log("User modified location input, ignoring GPS coordinates.");
          return;
        }
        
        // Fetch high-accuracy reverse geocoded location
        fetchLocationAndWeather(latitude, longitude, true);
      },
      (err) => {
        console.warn("GPS Geolocation failed/denied.", err);
        // If IP also failed or has not completed, clear and show helper message
        setTimeout(() => {
          if (!ipDetected && !gpsDetected && locationInput.value === "Detecting location...") {
            locationInput.value = "";
            if (locationError) {
              locationError.textContent = "Could not detect location automatically. Please search or select a district.";
            }
          }
        }, 1500);
      },
      { enableHighAccuracy: true, timeout: 3000, maximumAge: 10000 }
    );
  } else {
    // Geolocation not supported, wait a moment to check IP result
    setTimeout(() => {
      if (!ipDetected && locationInput.value === "Detecting location...") {
        locationInput.value = "";
        if (locationError) {
          locationError.textContent = "Could not detect location automatically. Please search or select a district.";
        }
      }
    }, 1500);
  }
}

async function detectLocationByIP() {
  // 1. Try ipapi.co first (highly reliable HTTPS geolocator, supports IPv6)
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      if (data && data.city) {
        const areaName = [data.city, data.region, data.country_name].filter(Boolean).join(", ");
        currentLat = data.latitude;
        currentLon = data.longitude;
        if (locationInput.value === "Detecting location..." || locationInput.value === "") {
          locationInput.value = areaName;
          await fetchLocationAndWeather(currentLat, currentLon, false, areaName);
        }
        return true;
      }
    }
  } catch (err) {
    console.warn("ipapi.co lookup failed", err);
  }

  // 2. Try ipinfo.io next (HTTPS, free, no key)
  try {
    const res = await fetch("https://ipinfo.io/json");
    if (res.ok) {
      const data = await res.json();
      if (data && data.city) {
        const areaName = [data.city, data.region, data.country].filter(Boolean).join(", ");
        if (data.loc) {
          const parts = data.loc.split(",");
          currentLat = parseFloat(parts[0]);
          currentLon = parseFloat(parts[1]);
        }
        if (locationInput.value === "Detecting location..." || locationInput.value === "") {
          locationInput.value = areaName;
          await fetchLocationAndWeather(currentLat, currentLon, false, areaName);
        }
        return true;
      }
    }
  } catch (err) {
    console.warn("ipinfo lookup failed", err);
  }

  // 3. Try freeipapi.com (HTTPS, free, no key)
  try {
    const res = await fetch("https://freeipapi.com/api/json");
    if (res.ok) {
      const data = await res.json();
      if (data && data.cityName) {
        const areaName = [data.cityName, data.regionName, data.countryName].filter(Boolean).join(", ");
        currentLat = data.latitude;
        currentLon = data.longitude;
        if (locationInput.value === "Detecting location..." || locationInput.value === "") {
          locationInput.value = areaName;
          await fetchLocationAndWeather(currentLat, currentLon, false, areaName);
        }
        return true;
      }
    }
  } catch (err) {
    console.warn("freeipapi lookup failed", err);
  }

  return false;
}

async function fetchLocationAndWeather(lat, lon, updateInput = false, customAreaName = null) {
  try {
    let areaName = customAreaName;
    if (!areaName) {
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          let areaParts = [];
          
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
          
          areaName = areaParts.join(", ") || "Unknown Area";
        }
      } catch (geoErr) {
        console.warn("Reverse geocode lookup failed, fallback to raw coordinates.", geoErr);
      }
      
      if (!areaName) {
        areaName = `Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`;
      }
    }

    if ($("areaNameDisplay")) $("areaNameDisplay").textContent = areaName;
    lastDetectedAreaName = areaName;
    if (updateInput && locationInput) {
      locationInput.value = areaName;
    }

    try {
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        if (weatherData && weatherData.current) {
          const temp = weatherData.current.temperature_2m;
          const hum = weatherData.current.relative_humidity_2m;
          currentEnvData.temperature = temp;
          currentEnvData.humidity = hum;

          if ($("tempDisplay")) $("tempDisplay").textContent = temp + "°C";
          if ($("humidityDisplay")) $("humidityDisplay").textContent = hum + "%";
          if ($("windDisplay")) $("windDisplay").textContent = weatherData.current.wind_speed_10m + " km/h";

          let weatherDesc = "Clear";
          let weatherIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
          const code = weatherData.current.weather_code;
          if (code >= 1 && code <= 3) {
            weatherDesc = "Partly Cloudy";
            weatherIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M4.93 4.93l1.41 1.41M20 10h2M19.07 4.93l-1.41 1.41"></path><path d="M15.9 10.9a5 5 0 1 0-7.3-3.6M22 19a5 5 0 0 0-5-5h-.7a7 7 0 1 0-11.8 4"></path></svg>`;
          }
          else if (code >= 45 && code <= 48) {
            weatherDesc = "Foggy";
            weatherIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="9" x2="19" y2="9"></line><line x1="3" y1="13" x2="21" y2="13"></line><line x1="5" y1="17" x2="19" y2="17"></line></svg>`;
          }
          else if (code >= 51 && code <= 67) {
            weatherDesc = "Rainy";
            weatherIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`;
          }
          else if (code >= 71 && code <= 77) {
            weatherDesc = "Snowy";
            weatherIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="5" y1="5" x2="19" y2="19"></line><line x1="5" y1="19" x2="19" y2="5"></line></svg>`;
          }
          else if (code >= 80 && code <= 82) {
            weatherDesc = "Showers";
            weatherIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`;
          }
          else if (code >= 95) {
            weatherDesc = "Thunderstorm";
            weatherIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 8.58"></path><polyline points="13 11 9 17 12 17 11 23 15 17 12 17 13 11"></polyline></svg>`;
          }

          if ($("weatherDescDisplay")) $("weatherDescDisplay").textContent = weatherDesc;
          if ($("weatherIconDisplay")) $("weatherIconDisplay").innerHTML = weatherIcon;
        }
      }
    } catch (weatherErr) {
      console.warn("Weather fetch failed", weatherErr);
    }

    if ($("weatherInfoCard")) $("weatherInfoCard").classList.remove("hidden");
  } catch (err) {
    console.error("Critical error in fetchLocationAndWeather", err);
    if (updateInput && locationInput && (locationInput.value === "Detecting location..." || locationInput.value === "")) {
      locationInput.value = `Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`;
    }
  }
}

let searchTimeout = null;

if (locationInput) {
  locationInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (!query || query.length < 3) {
      if (locationSuggestions) locationSuggestions.classList.add("hidden");
      return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          locationSuggestions.innerHTML = "";
          data.results.forEach(loc => {
            const div = document.createElement("div");
            div.className = "autocomplete-item";
            let fullName = loc.name;
            if (loc.admin2 && loc.admin2 !== loc.name) fullName += `, ${loc.admin2}`; // District
            if (loc.admin1 && loc.admin1 !== loc.name && loc.admin1 !== loc.admin2) fullName += `, ${loc.admin1}`; // State
            if (loc.country) fullName += `, ${loc.country}`; // Country

            div.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> <strong>${loc.name}</strong> <span style="font-size:0.8em; color:#666;">${loc.admin2 ? loc.admin2 + ', ' : ''}${loc.admin1 ? loc.admin1 + ', ' : ''}${loc.country || ''}</span>`;
            div.onclick = async () => {
              locationInput.value = fullName;
              currentLat = loc.latitude;
              currentLon = loc.longitude;
              lastDetectedAreaName = fullName;
              locationSuggestions.classList.add("hidden");
              recordLocationSelection(fullName, currentLat, currentLon);
              await fetchLocationAndWeather(currentLat, currentLon, false, fullName);
            };
            locationSuggestions.appendChild(div);
          });
          locationSuggestions.classList.remove("hidden");
        } else {
          locationSuggestions.classList.add("hidden");
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }, 400); // 400ms debounce
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target !== locationInput && (!locationSuggestions || !locationSuggestions.contains(e.target))) {
      if (locationSuggestions) locationSuggestions.classList.add("hidden");
    }
  });
}

autoDetectLocation();

if (detectLocationBtn) {
  detectLocationBtn.addEventListener("click", autoDetectLocation);
}

// Helper to track location selection frequency
function recordLocationSelection(loc, lat, lon) {
  if (!loc || !lat || !lon) return;
  
  const parts = loc.split(',');
  const districtName = parts[0].trim();
  let labelName = districtName;
  
  let stateCode = "";
  if (parts.length > 1) {
    const stateName = parts[1].trim().toLowerCase();
    if (stateName.includes("telangana")) stateCode = "TS";
    else if (stateName.includes("andhra")) stateCode = "AP";
    else if (stateName.includes("maharashtra")) stateCode = "MH";
    else if (stateName.includes("kerala")) stateCode = "KL";
    else if (stateName.includes("haryana")) stateCode = "HR";
    else if (stateName.includes("delhi")) stateCode = "DL";
    else if (stateName.includes("karnataka")) stateCode = "KA";
    else if (stateName.includes("tamil")) stateCode = "TN";
    else if (stateName.includes("punjab")) stateCode = "PB";
    else if (stateName.includes("uttar")) stateCode = "UP";
    else if (stateName.includes("rajasthan")) stateCode = "RJ";
    else if (stateName.includes("gujarat")) stateCode = "GJ";
    else if (stateName.includes("madhya")) stateCode = "MP";
  }
  if (stateCode) {
    labelName += ` (${stateCode})`;
  }

  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("frequentLocations") || "[]");
  } catch (e) {}

  const existing = list.find(item => item.label.toLowerCase() === labelName.toLowerCase());
  if (existing) {
    existing.count += 1;
  } else {
    list.push({
      label: labelName,
      loc: loc,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      count: 1
    });
  }

  localStorage.setItem("frequentLocations", JSON.stringify(list));
  renderPopularDistricts();
}

// Render dynamic popular districts (Exactly 3)
function renderPopularDistricts() {
  const container = $("quickLocationsContainer");
  if (!container) return;

  const buttons = container.querySelectorAll("button");
  buttons.forEach(b => b.remove());

  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("frequentLocations") || "[]");
  } catch (e) {}

  list.sort((a, b) => b.count - a.count);

  const uniqueList = [];
  const seenLabels = new Set();
  list.forEach(item => {
    if (!seenLabels.has(item.label.toLowerCase())) {
      seenLabels.add(item.label.toLowerCase());
      uniqueList.push(item);
    }
  });

  const defaults = [
    { label: "Nizamabad (TS)", loc: "Nizamabad, Telangana, India", lat: 18.6725, lon: 78.0941 },
    { label: "Guntur (AP)", loc: "Guntur, Andhra Pradesh, India", lat: 16.3067, lon: 80.4365 },
    { label: "Nashik (MH)", loc: "Nashik, Maharashtra, India", lat: 19.9975, lon: 73.7898 }
  ];

  let i = 0;
  while (uniqueList.length < 3 && i < defaults.length) {
    const def = defaults[i];
    if (!seenLabels.has(def.label.toLowerCase())) {
      seenLabels.add(def.label.toLowerCase());
      uniqueList.push({
        label: def.label,
        loc: def.loc,
        lat: def.lat,
        lon: def.lon,
        count: 0
      });
    }
    i++;
  }

  const final3 = uniqueList.slice(0, 3);

  final3.forEach(item => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quick-loc-btn btn btn-outline";
    btn.setAttribute("data-loc", item.loc);
    btn.setAttribute("data-lat", item.lat);
    btn.setAttribute("data-lon", item.lon);
    btn.style.cssText = "padding: 0.35rem 0.85rem; font-size: 0.85rem; border-radius: 20px; font-weight: 500; cursor: pointer;";
    btn.textContent = item.label;

    btn.addEventListener("click", async (e) => {
      const locVal = e.currentTarget.getAttribute("data-loc");
      const latVal = parseFloat(e.currentTarget.getAttribute("data-lat"));
      const lonVal = parseFloat(e.currentTarget.getAttribute("data-lon"));

      if (locationInput) {
        locationInput.value = locVal;
      }
      currentLat = latVal;
      currentLon = lonVal;
      lastDetectedAreaName = locVal;
      if (locationError) locationError.textContent = "";

      recordLocationSelection(locVal, latVal, lonVal);
      await fetchLocationAndWeather(latVal, lonVal, false, locVal);
    });

    container.appendChild(btn);
  });
}

// Initial trigger to render districts
renderPopularDistricts();


if (nextFromLocation) {
  nextFromLocation.addEventListener("click", async () => {
    const query = locationInput.value.trim();
    if (!query || query === "Detecting location...") {
      locationError.textContent = "Please enter or detect a location.";
      return;
    }

    // If the user picked a suggestion, currentLat and currentLon are already set
    if (currentLat !== null && currentLon !== null && locationInput.value === lastDetectedAreaName) {
      locationError.textContent = "";
      recordLocationSelection(lastDetectedAreaName, currentLat, currentLon);
      cropStepLocation.classList.add("hidden");
      cropStepDetails.classList.remove("hidden");
      updateStepper(2);
    } else {
      locationError.textContent = "Searching location...";
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
        const geoData = await geoRes.json();

        if (geoData.results && geoData.results.length > 0) {
          const loc = geoData.results[0];
          currentLat = loc.latitude;
          currentLon = loc.longitude;

          let newAreaName = loc.name;
          if (loc.admin2 && loc.admin2 !== loc.name) {
            newAreaName += ", " + loc.admin2; // District
          }
          if (loc.admin1 && loc.admin1 !== loc.name && loc.admin1 !== loc.admin2) {
            newAreaName += ", " + loc.admin1; // State
          }
          if (loc.country) {
            newAreaName += ", " + loc.country;
          }

          await fetchLocationAndWeather(currentLat, currentLon, true, newAreaName);
          recordLocationSelection(newAreaName, currentLat, currentLon);

          locationError.textContent = "";
          cropStepLocation.classList.add("hidden");
          cropStepDetails.classList.remove("hidden");
          updateStepper(2);
        } else {
          locationError.textContent = "Location not found. Try a nearby city or village.";
        }
      } catch (err) {
        locationError.textContent = "Error finding location.";
        console.error(err);
      }
    }
  });
}

if (backToLocation) {
  backToLocation.addEventListener("click", () => {
    cropStepDetails.classList.add("hidden");
    cropStepLocation.classList.remove("hidden");
    updateStepper(1);
  });
}

if (getRecommendationsBtn) {
  getRecommendationsBtn.addEventListener("click", async () => {
    const location = locationInput.value.trim();
    const soilType = soilSelect.value;
    const waterSource = waterSelect.value;
    let acres = acresInput.value.trim();
    const phVal = phInput ? phInput.value.trim() : "";

    if (!soilType || !waterSource) {
      detailsError.textContent =
        "Please select soil type and water source.";
      return;
    }

    let ph = undefined;
    if (phVal) {
      const parsedPh = parseFloat(phVal);
      if (isNaN(parsedPh) || parsedPh < 0 || parsedPh > 14) {
        detailsError.textContent = "Please enter a valid pH value between 0 and 14.";
        return;
      }
      ph = parsedPh;
    }

    if (!acres) {
      acres = "1.0";
    } else {
      const parsedAcres = parseFloat(acres);
      if (isNaN(parsedAcres) || parsedAcres <= 0) {
        detailsError.textContent = "Please enter a valid number of acres (greater than 0).";
        return;
      }
    }
    detailsError.textContent = "";
    
    const loaderId = "cropLoader_" + Date.now();
    recommendationsList.innerHTML = `
      <div class="agri-loader-wrapper" id="${loaderId}" style="margin: 2rem auto; align-items: center; text-align: center; justify-content: center; width: 100%;">
        <div class="agri-loader-sprout">
          <svg class="plant-drawing-loader" viewBox="0 0 32 32" style="width: 48px; height: 48px;"><path class="plant-ground" d="M 6 30 L 26 30" /><path class="plant-stem" d="M 16 30 Q 14 20, 16 10" /><path class="plant-leaf leaf-left" d="M 15 20 Q 7 18, 10 13 Q 14 14, 15 17 Z" /><path class="plant-leaf leaf-right" d="M 16 14 Q 24 12, 21 7 Q 17 8, 16 11 Z" /><path class="plant-leaf leaf-top" d="M 16 10 Q 11 5, 16 2 Q 21 5, 16 10 Z" /></svg>
        </div>
        <div class="agri-loader-text" style="font-size: 1.2rem; font-weight: 600; margin-top: 1rem; display: inline-flex; align-items: center; justify-content: center;">
          Analyzing soil profile and matching climate parameters...
        </div>
      </div>
    `;

    const cropLoadingMessages = [
      `Analyzing soil profile and matching climate parameters...`,
      `Running machine learning models for yield prediction...`,
      `Calculating water source efficiency and irrigation budget...`,
      `Checking market prices and demand trends in nearby mandis...`,
      `Preparing precision advice for your farm...`
    ];

    let cropMessageIndex = 0;
    const cropIntervalId = setInterval(() => {
      const loaderEl = document.getElementById(loaderId);
      if (loaderEl) {
        cropMessageIndex = (cropMessageIndex + 1) % cropLoadingMessages.length;
        const textEl = loaderEl.querySelector(".agri-loader-text");
        if (textEl) {
          textEl.textContent = cropLoadingMessages[cropMessageIndex];
        }
      } else {
        clearInterval(cropIntervalId);
      }
    }, 2500);

    cropStepDetails.classList.add("hidden");
    cropStepResults.classList.remove("hidden");

    try {
      const token = localStorage.getItem("sessionToken") || "";
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          location,
          soilType,
          waterSource,
          acres,
          ph,
          temperature: currentEnvData.temperature,
          humidity: currentEnvData.humidity,
          lang: farmerLang || 'en'
        }),
      });
      const data = await res.json();
      clearInterval(cropIntervalId);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          recommendationsList.innerHTML = `<p class="error-text">Authentication Error (${res.status}): ${data.message || "Session expired. Please login again."}</p>`;
          return;
        }
        recommendationsList.textContent = data.message || "Error loading data.";
        return;
      }
      if (!data.ok) {
        recommendationsList.textContent = data.message || "Error loading data.";
        return;
      }
      renderRecommendations(data, acres);
      updateStepper(3);
    } catch (err) {
      clearInterval(cropIntervalId);
      recommendationsList.textContent =
        "Unable to reach recommendation service.";
    }
  });
}

function renderRecommendations(data, acres) {
  const recommendationsList = $("recommendationsList");
  recommendationsList.innerHTML = "";

  const getCropImg = (name) => {
    const cropNameKey = name ? name.toLowerCase().trim() : "default";
    
    // Check exact matches or strong keyword associations first
    if (cropNameKey.includes("rice") || cropNameKey.includes("paddy")) return "/images/rice.jpg";
    if (cropNameKey.includes("wheat") || cropNameKey.includes("barley")) return "/images/wheat.jpg";
    if (cropNameKey.includes("maize") || cropNameKey.includes("corn") || cropNameKey.includes("jowar") || cropNameKey.includes("bajra") || cropNameKey.includes("sorghum")) return "/images/maize.jpg";
    if (cropNameKey.includes("millet") || cropNameKey.includes("ragi") || cropNameKey.includes("sanwa") || cropNameKey.includes("kangni") || cropNameKey.includes("cheena") || cropNameKey.includes("kutki")) return "/images/fingermillet.jpg";
    if (cropNameKey.includes("sugarcane")) return "/images/sugarcane.jpg";
    if (cropNameKey.includes("cotton")) return "/images/cotton.jpg";
    if (cropNameKey.includes("jute") || cropNameKey.includes("tobacco")) return "/images/jute.jpg";
    if (cropNameKey.includes("chilli") || cropNameKey.includes("mirch") || cropNameKey.includes("pepper")) return "/images/chilli.jpg";
    if (cropNameKey.includes("tomato")) return "/images/tomato.jpg";
    if (cropNameKey.includes("brinjal") || cropNameKey.includes("eggplant")) return "/images/brinjal.jpg";
    if (cropNameKey.includes("cucumber")) return "/images/cucumber.jpg";
    
    // Gourds
    if (cropNameKey.includes("gourd") || cropNameKey.includes("petha") || cropNameKey.includes("lauki") || cropNameKey.includes("karela") || cropNameKey.includes("turai") || cropNameKey.includes("chichinda") || cropNameKey.includes("parwal") || cropNameKey.includes("tindora") || cropNameKey.includes("kundru") || cropNameKey.includes("kantola")) return "/images/gourd.jpg";
    
    // Pulses / Beans
    if (cropNameKey.includes("chickpea") || cropNameKey.includes("gram")) return "/images/chickpea.jpg";
    if (cropNameKey.includes("kidney bean") || cropNameKey.includes("rajma") || cropNameKey.includes("moth bean") || cropNameKey.includes("pulse")) return "/images/kidneybeans.jpg";
    if (cropNameKey.includes("pigeonpea") || cropNameKey.includes("pigeon pea") || cropNameKey.includes("arhar") || cropNameKey.includes("tur")) return "/images/pigeonpeas.jpg";
    if (cropNameKey.includes("mung") || cropNameKey.includes("green gram") || cropNameKey.includes("greengram")) return "/images/mungbean.jpg";
    if (cropNameKey.includes("groundnut") || cropNameKey.includes("peanut")) return "/images/groundnut.jpg";
    if (cropNameKey.includes("black gram") || cropNameKey.includes("urad") || cropNameKey.includes("soybean") || cropNameKey.includes("oilseed") || cropNameKey.includes("sesame") || cropNameKey.includes("til") || cropNameKey.includes("castor") || cropNameKey.includes("linseed") || cropNameKey.includes("flaxseed")) return "/images/blackgram.jpg";
    if (cropNameKey.includes("lentil") || cropNameKey.includes("masoor")) return "/images/lentil.jpg";
    
    // Fruits
    if (cropNameKey.includes("apple")) return "/images/apple.jpg";
    if (cropNameKey.includes("banana")) return "/images/banana.jpg";
    if (cropNameKey.includes("pomegranate")) return "/images/pomegranate.jpg";
    if (cropNameKey.includes("watermelon")) return "/images/watermelon.jpg";
    if (cropNameKey.includes("muskmelon")) return "/images/muskmelon.jpg";
    if (cropNameKey.includes("orange") || cropNameKey.includes("lemon") || cropNameKey.includes("citronella") || cropNameKey.includes("turmeric") || cropNameKey.includes("haldi") || cropNameKey.includes("ginger") || cropNameKey.includes("adrak") || cropNameKey.includes("garlic") || cropNameKey.includes("onion")) return "/images/orange.jpg";
    if (cropNameKey.includes("papaya")) return "/images/papaya.jpg";
    if (cropNameKey.includes("coconut") || cropNameKey.includes("arecanut") || cropNameKey.includes("cocoa") || cropNameKey.includes("palm")) return "/images/coconut.jpg";
    if (cropNameKey.includes("grape") || cropNameKey.includes("jamun") || cropNameKey.includes("plum") || cropNameKey.includes("litchi")) return "/images/grape.jpg";
    if (cropNameKey.includes("sapota") || cropNameKey.includes("chikoo")) return "/images/sapota.jpg";
    if (cropNameKey.includes("mango") || cropNameKey.includes("guava") || cropNameKey.includes("jackfruit") || cropNameKey.includes("kathal") || cropNameKey.includes("fig") || cropNameKey.includes("anjeer") || cropNameKey.includes("avocado") || cropNameKey.includes("tamarind") || cropNameKey.includes("carambola") || cropNameKey.includes("rambutan") || cropNameKey.includes("mangosteen") || cropNameKey.includes("karonda") || cropNameKey.includes("phalsa") || /\bber\b/.test(cropNameKey)) return "/images/mango.jpg";
    
    // Plantations / Herbs
    if (cropNameKey.includes("coffee") || cropNameKey.includes("tea") || cropNameKey.includes("rubber") || cropNameKey.includes("spices") || cropNameKey.includes("cardamom") || cropNameKey.includes("clove") || cropNameKey.includes("cinnamon") || cropNameKey.includes("nutmeg") || cropNameKey.includes("anise")) return "/images/coffee.jpg";
    
    // General vegetable/green fallbacks
    if (cropNameKey.includes("cabbage") || cropNameKey.includes("cauliflower") || cropNameKey.includes("spinach") || cropNameKey.includes("palak") || cropNameKey.includes("leaves") || cropNameKey.includes("drumstick") || cropNameKey.includes("moringa") || cropNameKey.includes("carrot") || cropNameKey.includes("radish") || cropNameKey.includes("beetroot") || cropNameKey.includes("potato") || cropNameKey.includes("yam") || cropNameKey.includes("tapioca") || cropNameKey.includes("cassava") || cropNameKey.includes("taro") || cropNameKey.includes("colocasia") || cropNameKey.includes("sweet potato") || cropNameKey.includes("fodder") || cropNameKey.includes("clover") || cropNameKey.includes("grass")) return "/images/cucumber.jpg";
    
    return "/images/rice.jpg"; // Default fallback (pointing to valid existing file)
  };

  const createCardElement = (r) => {
    const div = document.createElement("div");
    div.className = "recommendation-card";
    
    const isAlreadySelected = window.currentlySelectedCrops && window.currentlySelectedCrops.some(
      s => (s.crop || s.name || "").toLowerCase() === r.name.toLowerCase()
    );
    const t = cropTranslations[farmerLang] || cropTranslations.en;
    const btnText = isAlreadySelected ? (t.selectedCropBtn || "✓ Selected") : (t.selectCropBtn || "Select this crop");
    const disabledAttr = isAlreadySelected ? "disabled" : "";
    const extraStyle = isAlreadySelected ? "style='background-color: var(--primary-dark); border-color: var(--primary-dark); cursor: default;'" : "";
    
    const localizedName = getLocalizedCropName(r.name, farmerLang);
    const localizedConfidence = localizeText(r.confidence || 'ML Match', farmerLang);
    const localizedKeyFactors = localizeText(r.keyFactors || 'Suitable based on soil & climate.', farmerLang);
    const localizedInsight = localizeText(r.actionableInsight || 'Ensure standard soil prep.', farmerLang);
    const localizedBudgetPerAcre = localizeText((r.budgetPerAcre || 20000).toLocaleString("en-IN"), farmerLang);
    const localizedTotalBudget = localizeText(((r.budgetPerAcre || 20000) * Number(acres)).toLocaleString("en-IN"), farmerLang);
    const localizedAcres = localizeText(acres, farmerLang);

    div.innerHTML = `
      <div class="crop-card-image" style="background-image: url('${getCropImg(r.name)}')"></div>
      <div class="crop-card-content">
        <h3>${localizedName} <span class="confidence-badge">${localizedConfidence}</span></h3>
        <div class="crop-card-details">
          <p><strong>Key Factors:</strong> ${localizedKeyFactors}</p>
          <p><strong>Advice:</strong> ${localizedInsight}</p>
        </div>
        <div class="crop-card-budget">
          <div>
            <span class="budget-label">Per Acre</span>
            <span class="budget-value">₹${localizedBudgetPerAcre}</span>
          </div>
          <div class="budget-divider"></div>
          <div>
            <span class="budget-label">Total (${localizedAcres} ac)</span>
            <span class="budget-value total-budget-val">₹${localizedTotalBudget}</span>
          </div>
        </div>
        <button class="btn btn-primary select-crop-btn" ${disabledAttr} ${extraStyle}>${btnText}</button>
      </div>
    `;
    
    const selectBtn = div.querySelector(".select-crop-btn");
    selectBtn.onclick = (e) => selectCrop(r, acres, e.currentTarget);
    return div;
  };

  if (data.categorized) {
    const categories = {
      food: {
        title: `
          <svg viewBox="0 0 64 64" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px; display: inline-block;">
            <path d="M32 60V20M24 60C24 40 32 30 32 30M40 60C40 40 32 30 32 30" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
            <path d="M22 26C18 24 16 28 20 30C24 32 26 28 22 26Z" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
            <path d="M24 18C20 16 18 20 22 22C26 24 28 20 24 18Z" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
            <path d="M28 10C24 8 22 12 26 14C30 16 32 12 28 10Z" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
            <path d="M42 26C46 24 48 28 44 30C40 32 38 28 42 26Z" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
            <path d="M40 18C44 16 46 20 42 22C38 24 36 20 40 18Z" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
            <path d="M36 10C40 8 42 12 38 14C34 16 32 12 36 10Z" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
            <path d="M32 8C32 4 34 4 34 8C34 12 32 12 32 8Z" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
            <path d="M30 14C28 11 30 9 32 11C34 13 32 16 30 14Z" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
            <path d="M14 48C24 48 30 36 32 32C28 36 22 42 14 48Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
            <path d="M50 48C40 48 34 36 32 32C36 36 42 42 50 48Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          </svg>Main Food`,
        color: "#fefcf0",
        border: "#fef08a"
      },
      commercial: {
        title: `
          <svg viewBox="0 0 64 64" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px; display: inline-block;">
            <circle cx="32" cy="36" r="18" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
            <circle cx="32" cy="36" r="13" fill="#facc15" stroke="#ca8a04" stroke-width="1" stroke-dasharray="3 2"/>
            <path d="M28 30H36M28 34H34M32 30C35 30 35 38 32 38H28M31 38L35 44" stroke="#854d0e" stroke-width="2" stroke-linecap="round"/>
            <path d="M32 20C32 20 26 15 26 10C26 8 28 6 30 8C32 10 32 20 32 20Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
            <path d="M32 20C32 20 38 15 38 10C38 8 36 6 34 8C32 10 32 20 32 20Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
            <path d="M32 30V20" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
          </svg>Commercial Crops`,
        color: "#f0fdf4",
        border: "#bbf7d0"
      },
      vegetable: {
        title: `
          <svg viewBox="0 0 64 64" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px; display: inline-block;">
            <path d="M32 50C43.0457 50 52 41.9411 52 32C52 22.0589 43.0457 14 32 14C20.9543 14 12 22.0589 12 32C12 41.9411 20.9543 50 32 50Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <path d="M32 14C32 14 30 6 26 8C22 10 28 16 28 16Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
            <path d="M32 14C32 14 34 6 38 8C42 10 36 16 36 16Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
            <path d="M32 14C32 14 32 5 32 5" stroke="#15803d" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M20 24C17 28 17 34 20 38" stroke="#fee2e2" stroke-width="1.5" stroke-linecap="round"/>
          </svg>Vegetables`,
        color: "#eff6ff",
        border: "#bfdbfe"
      },
      pulses: {
        title: `
          <svg viewBox="0 0 64 64" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px; display: inline-block;">
            <path d="M20 54C20 40 32 30 32 18" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
            <path d="M32 18C32 18 20 18 16 24C12 30 24 30 32 18Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
            <path d="M32 18C32 18 44 14 48 18C52 22 40 26 32 18Z" fill="#4ade80" stroke="#15803d" stroke-width="1.5"/>
            <path d="M12 54H52" stroke="#a16207" stroke-width="3" stroke-linecap="round"/>
            <path d="M22 58H42" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>
          </svg>Pulses`,
        color: "#faf5ff",
        border: "#e9d5ff"
      }
    };

    const container = document.createElement("div");
    container.className = "categorized-recommendations-wrapper";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "2rem";
    container.style.width = "100%";

    for (const [catKey, catMeta] of Object.entries(categories)) {
      const crops = data.categorized[catKey] || [];
      if (crops.length === 0) continue;

      const section = document.createElement("div");
      section.className = "recommendation-category-section";
      section.style.border = `1px solid ${catMeta.border}`;
      section.style.background = catMeta.color;
      section.style.borderRadius = "16px";
      section.style.boxShadow = "var(--shadow-sm)";

      const title = document.createElement("h2");
      title.className = "recommendation-category-title";
      title.style.fontSize = "1.4rem";
      title.style.fontWeight = "800";
      title.style.marginBottom = "1.25rem";
      title.style.color = "var(--text-dark)";
      title.style.display = "flex";
      title.style.alignItems = "center";
      title.style.gap = "0.5rem";
      title.innerHTML = `${catMeta.title}`;
      section.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "recommendations-grid";

      crops.forEach(r => {
        grid.appendChild(createCardElement(r));
      });

      section.appendChild(grid);
      container.appendChild(section);
    }

    recommendationsList.appendChild(container);
  } else {
    // Fallback to old flat rendering if categorized is missing
    const recs = Array.isArray(data) ? data : (data.recommendations || []);
    if (recs.length === 0) {
      recommendationsList.textContent = "No recommendations received.";
      return;
    }
    
    const grid = document.createElement("div");
    grid.className = "recommendations-grid";

    recs.forEach(r => {
      grid.appendChild(createCardElement(r));
    });
    
  }
}

async function selectCrop(crop, acres, btnEl) {
  selectError.textContent = "";
  try {
    const token = localStorage.getItem("sessionToken") || "";
    const res = await fetch("/api/select-crop", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        crop: crop.name,
        acres,
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok) {
        if (btnEl) {
          const t = cropTranslations[farmerLang] || cropTranslations.en;
          btnEl.textContent = t.selectedCropBtn || "✓ Selected";
          btnEl.style.backgroundColor = "var(--primary-dark)";
          btnEl.style.borderColor = "var(--primary-dark)";
          btnEl.disabled = true;
        }
        if (data.selections) {
          window.currentlySelectedCrops = data.selections;
        } else {
          if (!window.currentlySelectedCrops) window.currentlySelectedCrops = [];
          window.currentlySelectedCrops.push({ crop: crop.name });
        }
        showToastNotification(`Successfully selected ${crop.name.toUpperCase()} for monitoring!`);
      } else {
        selectError.textContent = "Could not save selected crop.";
      }
    } else {
      selectError.textContent = "Could not save selected crop.";
    }
  } catch (err) {
    selectError.textContent = "Could not save selected crop.";
  }
}

const cropTranslations = {
  en: {
    dashLogoSubtitle: "Crop Recommendation",
    navHome: "Home",
    navContactUs: "Contact Us",
    navProfile: "Profile",
    cropPageTitle: "Crop Recommendation",
    cropPageIntro: "Enter your location and land details. SAARTHI will suggest suitable crops with budget estimates.",
    step1Title: "Step 1: Confirm Your Location",
    step1Desc: "We try to read your location automatically. If it is wrong (common on desktop/broadband), please search and select your city or village above.",
    locLabel: "Location",
    locPlaceholder: "e.g. Hyderabad, India",
    detectLocationBtn: "Detect again",
    nextFromLocation: "Next",
    step2Title: "Step 2: Land & Resource Details",
    soilLabel: "Soil Type",
    phLabel: "Soil pH (Optional)",
    phPlaceholder: "e.g. 6.5 (Leave blank to use Soil Type defaults)",
    waterLabel: "Water Source",
    acresLabel: "Total Acres",
    backToLocation: "Back",
    getRecommendationsBtn: "Get Recommendations",
    step3Title: "Recommended Crops",
    step3Desc: "These are demo results. In the final system, ML models will refine this list using soil, climate, groundwater, resources and market data.",
    selectCropBtn: "Select this crop",
    selectedCropBtn: "✓ Selected"
  },
  te: {
    dashLogoSubtitle: "పంట సిఫారసు",
    navHome: "హోమ్",
    navContactUs: "సంప్రదించండి",
    navProfile: "ప్రొఫైల్",
    cropPageTitle: "పంట సిఫారసు",
    cropPageIntro: "మీ ప్రాంతం మరియు భూవివరాలు నమోదు చేయండి. SAARTHI బడ్జెట్ అంచనాతో అనువైన పంటలను సూచిస్తుంది.",
    step1Title: "దశ 1: మీ స్థానాన్ని నిర్ధారించండి",
    step1Desc: "మేము మీ స్థానాన్ని ఆటోమేటిక్‌గా గుర్తించేందుకు ప్రయత్నిస్తాము. ఒకవేళ అది తప్పుగా ఉంటే (కంప్యూటర్/బ్రాడ్‌బ్యాండ్‌లో సాధారణం), దయచేసి పైన మీ నగరం లేదా గ్రామం పేరును వెతికి ఎంచుకోండి.",
    locLabel: "స్థానం",
    locPlaceholder: "ఉదా. హైదరాబాద్, ఇండియా",
    detectLocationBtn: "మళ్ళీ గుర్తించండి",
    nextFromLocation: "తరువాత",
    step2Title: "దశ 2: భూమి & వనరుల వివరాలు",
    soilLabel: "నేల రకం",
    phLabel: "నేల పిహెచ్ (ఐచ్ఛికం)",
    phPlaceholder: "ఉదా. 6.5 (డిఫాల్ట్ ఉపయోగించడానికి ఖాళీగా ఉంచండి)",
    waterLabel: "నీటి వనరు",
    acresLabel: "మొత్తం ఎకరాలు",
    backToLocation: "వెనుకకు",
    getRecommendationsBtn: "సిఫార్సులు పొందండి",
    step3Title: "సిఫార్సు చేయబడిన పంటలు",
    step3Desc: "ఇవి డెమో ఫలితాలు. తుది వ్యవస్థలో వాతావరణం, నేల ఆధారంగా ML మోడల్స్ పంటలను సూచిస్తాయి.",
    selectCropBtn: "ఈ పంటను ఎంచుకోండి",
    selectedCropBtn: "✓ ఎంపిక చేయబడింది"
  },
  hi: {
    dashLogoSubtitle: "फसल सिफारिश",
    navHome: "होम",
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    cropPageTitle: "फसल सिफारिश",
    cropPageIntro: "अपना स्थान और ज़मीन का विवरण दर्ज करें। SAARTHI अनुमानित बजट के साथ उपयुक्त फसलों का सुझाव देगा।",
    step1Title: "चरण 1: अपने स्थान की पुष्टि करें",
    step1Desc: "हम आपके स्थान का स्वचालित रूप से पता लगाने का प्रयास करते हैं। यदि यह गलत है (कंप्यूटर/ब्रॉडबैंड पर सामान्य), तो कृपया ऊपर अपने शहर या गाँव को खोजें और चुनें।",
    locLabel: "स्थान",
    locPlaceholder: "जैसे: हैदराबाद, भारत",
    detectLocationBtn: "फिर से पता लगाएँ",
    nextFromLocation: "अगला",
    step2Title: "चरण 2: ज़मीन और संसाधन विवरण",
    soilLabel: "मिट्टी का प्रकार",
    phLabel: "मिट्टी का पीएच (वैकल्पिक)",
    phPlaceholder: "जैसे: 6.5 (डिफ़ॉल्ट के लिए खाली छोड़ दें)",
    waterLabel: "जल स्रोत",
    acresLabel: "कुल एकड़",
    backToLocation: "पीछे",
    getRecommendationsBtn: "सिफारिशें प्राप्त करें",
    step3Title: "सुझाई गई फसलें",
    step3Desc: "ये डेमो परिणाम हैं। अंतिम प्रणाली में मिट्टी और जलवायु के आधार पर ML मॉडल फसलें सुझाएंगे।",
    selectCropBtn: "इस फसल को चुनें",
    selectedCropBtn: "✓ चुनी गई"
  },
  mr: {
    dashLogoSubtitle: "पीक सुचवणी",
    navHome: "होम",
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    cropPageTitle: "पीक सुचवणी",
    cropPageIntro: "तुमच्या जमिनीचा तपशील नोंदवा. SAARTHI बजेट अंदाजासह योग्य पिके सुचवेल.",
    step1Title: "पायरी 1: आपल्या स्थानाची पुष्टी करा",
    step1Desc: "आम्ही आपोआप तुमचे स्थान शोधण्याचा प्रयत्न करतो. तुम्ही तुमचे शहर किंवा गाव देखील शोधू शकता.",
    locLabel: "स्थान",
    locPlaceholder: "उदा. हैदराबाद, भारत",
    detectLocationBtn: "पुन्हा शोधा",
    nextFromLocation: "पुढील",
    step2Title: "पायरी 2: जमीन आणि संसाधन तपशील",
    soilLabel: "मातीचा प्रकार",
    phLabel: "मातीचा पीएच (पर्यायी)",
    phPlaceholder: "उदा. 6.5 (डिफॉल्ट वापरण्यासाठी रिकामे ठेवा)",
    waterLabel: "पाण्याचा स्रोत",
    acresLabel: "एकूण एकर",
    backToLocation: "मागे",
    getRecommendationsBtn: "शिफारसी मिळवा",
    step3Title: "शिफारस केलेली पिके",
    step3Desc: "हे डेमो परिणाम आहेत. अंतिम प्रणालीमध्ये हवामान आणि मातीवर आधारित ML मॉडेल्स पिके सुचवतील.",
    selectCropBtn: "हे पीक निवडा",
    selectedCropBtn: "✓ निवडले"
  },
  ml: {
    dashLogoSubtitle: "വിള നിർദേശം",
    navHome: "ഹോം",
    navContactUs: "ബന്ധപ്പെടുക",
    navProfile: "പ്രൊഫൈൽ",
    cropPageTitle: "വിള നിർദേശം",
    cropPageIntro: "നിങ്ങളുടെ ഭൂമിയുടെ വിവരങ്ങൾ നൽകുക. SAARTHI ബജറ്റ് കണക്കിനൊപ്പം വിളകൾ നിർദ്ദേശിക്കും.",
    step1Title: "ഘട്ടം 1: നിങ്ങളുടെ സ്ഥലം സ്ഥിരീകരിക്കുക",
    step1Desc: "ഞങ്ങൾ നിങ്ങളുടെ സ്ഥലം സ്വയമേവ കണ്ടെത്താൻ ശ്രമിക്കുന്നു. നിങ്ങൾക്ക് നഗരമോ ഗ്രാമമോ തിരയാനും കഴിയും.",
    locLabel: "സ്ഥലം",
    locPlaceholder: "ഉദാഹരണത്തിന് ഹൈദരാബാദ്",
    detectLocationBtn: "വീണ്ടും കണ്ടെത്തുക",
    nextFromLocation: "അടുത്തത്",
    step2Title: "ഘട്ടം 2: ഭൂമി വിവരങ്ങൾ",
    soilLabel: "മണ്ണിന്റെ തരം",
    phLabel: "മണ്ണിന്റെ പിഎച്ച് (ഓപ്ഷണൽ)",
    phPlaceholder: "ഉദാ. 6.5 (ഡിഫോൾട്ട് ഉപയോഗിക്കാൻ കാലിയായി ഇടുക)",
    waterLabel: "ജലസ്രോതസ്സ്",
    acresLabel: "ആകെ ഏക്കർ",
    backToLocation: "പിന്നിലേക്ക്",
    getRecommendationsBtn: "നിർദ്ദേശങ്ങൾ നേടുക",
    step3Title: "നിർദ്ദേശിച്ച വിളകൾ",
    step3Desc: "ഇവ ഡെമോ ഫലങ്ങളാണ്. അവസാന സിസ്റ്റത്തിൽ ML മോഡലുകൾ വിവരങ്ങൾ ഉപയോഗിച്ച് കൃത്യമായ വിളകൾ നിർദ്ദേശിക്കും.",
    selectCropBtn: "ഈ വിള തിരഞ്ഞെടുക്കുക",
    selectedCropBtn: "✓ തിരഞ്ഞെടുത്തു"
  }
};

function applyCropLanguage(lang) {
  const t = cropTranslations[lang] || cropTranslations.en;

  if ($('dashLogoSubtitle')) $('dashLogoSubtitle').textContent = t.dashLogoSubtitle;
  if ($('navHome')) $('navHome').textContent = t.navHome;
  if ($('navContactUs')) $('navContactUs').textContent = t.navContactUs;
  if ($('navProfile')) $('navProfile').textContent = t.navProfile;

  if ($('cropPageTitle')) $('cropPageTitle').textContent = t.cropPageTitle;
  if ($('cropPageIntro')) $('cropPageIntro').textContent = t.cropPageIntro;
  if ($('step1Title')) $('step1Title').textContent = t.step1Title;
  if ($('step1Desc')) $('step1Desc').textContent = t.step1Desc;
  if ($('locLabel')) $('locLabel').textContent = t.locLabel;
  if (locationInput) locationInput.placeholder = t.locPlaceholder;
  if (detectLocationBtn) {
    detectLocationBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${t.detectLocationBtn}`;
  }
  if (nextFromLocation) nextFromLocation.textContent = t.nextFromLocation;

  if ($('step2Title')) $('step2Title').textContent = t.step2Title;
  if ($('soilLabel')) $('soilLabel').textContent = t.soilLabel;
  if ($('phLabel')) $('phLabel').textContent = t.phLabel;
  if (phInput) phInput.placeholder = t.phPlaceholder || "e.g. 6.5";
  if ($('waterLabel')) $('waterLabel').textContent = t.waterLabel;
  if ($('acresLabel')) $('acresLabel').textContent = t.acresLabel;

  if (backToLocation) backToLocation.textContent = t.backToLocation;
  if (getRecommendationsBtn) getRecommendationsBtn.textContent = t.getRecommendationsBtn;
  if ($('step3Title')) $('step3Title').textContent = t.step3Title;
  if ($('step3Desc')) $('step3Desc').textContent = t.step3Desc;
}

// Fire application instantly upon module load
applyCropLanguage(farmerLang);

function getCurrentStep() {
  if (cropStepLocation && !cropStepLocation.classList.contains("hidden")) return 1;
  if (cropStepDetails && !cropStepDetails.classList.contains("hidden")) return 2;
  if (cropStepResults && !cropStepResults.classList.contains("hidden")) return 3;
  return 1;
}

const stepIndicator1 = $("stepIndicator1");
const stepIndicator2 = $("stepIndicator2");
const stepIndicator3 = $("stepIndicator3");

if (stepIndicator1) {
  stepIndicator1.addEventListener("click", () => {
    // Going back to step 1 is always allowed
    cropStepDetails.classList.add("hidden");
    cropStepResults.classList.add("hidden");
    cropStepLocation.classList.remove("hidden");
    updateStepper(1);
  });
}

if (stepIndicator2) {
  stepIndicator2.addEventListener("click", () => {
    const currentStep = getCurrentStep();
    if (currentStep === 3) {
      // Going back to step 2 is always allowed
      cropStepLocation.classList.add("hidden");
      cropStepResults.classList.add("hidden");
      cropStepDetails.classList.remove("hidden");
      updateStepper(2);
    } else if (currentStep === 1) {
      // Going forward to step 2 triggers validation of step 1
      if (nextFromLocation) nextFromLocation.click();
    }
  });
}

if (stepIndicator3) {
  stepIndicator3.addEventListener("click", () => {
    const currentStep = getCurrentStep();
    if (currentStep === 2) {
      // Going forward to step 3 triggers validation of step 2 & fetches recommendations
      if (getRecommendationsBtn) getRecommendationsBtn.click();
    } else if (currentStep === 1) {
      // If we are on step 1, validate step 1 first by clicking "Next"
      if (nextFromLocation) nextFromLocation.click();
    }
  });
}

function showToastNotification(message, isError = false) {
  let toast = document.getElementById("cropToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cropToast";
    toast.className = "chat-toast-notification";
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `
    <span class="chat-toast-success-icon" style="color: ${isError ? '#ef4444' : '#10b981'}">
      ${isError ? '✕' : '✓'}
    </span>
    <span>${message}</span>
  `;
  
  toast.classList.remove("show");
  // Force reflow
  void toast.offsetWidth;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}



