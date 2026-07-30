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
    maize: { en: "Maize", te: "మొక్కజొన్న", hi: "మक्का", mr: "मका", ml: "ചോളം" },
    sugarcane: { en: "Sugarcane", te: "చెరకు", hi: "गन्ना", mr: "ऊस", ml: "കരിമ്പ്" },
    cotton: { en: "Cotton", te: "పత్తి", hi: "कपास", mr: "कपाशी", ml: "പരുത്തി" },
    jute: { en: "Jute", te: "జనపనార", hi: "जूट", mr: "ताग", ml: "ചണം" },
    chilli: { en: "Chilli", te: "మిరప", hi: "मिर्च", mr: "मिरची", ml: "മുളക്" },
    tomato: { en: "Tomato", te: "టమోటా", hi: "టमाटर", mr: "टोमॅटो", ml: "തക്കാളി" },
    brinjal: { en: "Brinjal", te: "వంకాయ", hi: "बैंगन", mr: "वांगी", ml: "വഴുതനങ്ങ" },
    gourd: { en: "Gourd", te: "ఆనపకాయ", hi: "लौकी", mr: "दुधी भोपळा", ml: "ചുരയ്ക്ക" },
    cucumber: { en: "Cucumber", te: "దోసకాయ", hi: "खीरा", mr: "काकडी", ml: "വെള്ളരിക്ക" },
    ragi: { en: "Ragi", te: "రాగి", hi: "रागी", mr: "नाचणी", ml: "റാഗി" },
    fingermillet: { en: "Finger Millet", te: "రాగి", hi: "రాगी", mr: "नाचणी", ml: "റാഗി" },
    barley: { en: "Barley", te: "బార్లీ", hi: "जौ", mr: "जव", ml: "ബാർലി" },
    millets: { en: "Millets", te: "చిరుధాన్యాలు", hi: "बाजरा", mr: "बाजरी", ml: "ചെറുധാന്യങ്ങൾ" },
    groundnuts: { en: "Groundnuts", te: "వేరుశనగ", hi: "मूंगफली", mr: "भूईमूग", ml: "നിലക്കടല" },
    chickpea: { en: "Chickpea", te: "శనగలు", hi: "चना", mr: "हरभरा", ml: "കടല" },
    kidneybeans: { en: "Kidney Beans", te: "రాజ్మా", hi: "राजमा", mr: "राजमा", ml: "രാജ്മ" },
    pigeonpeas: { en: "Pigeon Peas", te: "కందులు", hi: "अरहर", mr: "तूर", ml: "തുവരപ്പയർ" },
    mothbeans: { en: "Moth Beans", te: "మొలకెత్తిన పప్పు", hi: "मोठ", mr: "मटकी", ml: "മ Mothപ്പയർ" },
    mungbean: { en: "Mung Bean", te: "పెసలు", hi: "मूंग", mr: "मूग", ml: "ചെറുപयർ" },
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
    coconut: { en: "Coconut", te: "కొబ్బరి", hi: "നാരയൽ", mr: "नारळ", ml: "തേങ്ങ" },
    coffee: { en: "Coffee", te: "కాఫీ", hi: "कॉफी", mr: "कॉफी", ml: "കാപ്പി" },
    turmeric: { en: "Turmeric", te: "పసుపు", hi: "हल्दी", mr: "हळद", ml: "മഞ്ഞൾ" },
    "berseem(cloverfodder)": { en: "Berseem (Clover)", te: "బెర్సీమ్ (పశుగ్రాసం)", hi: "बरसीम (चारा)", mr: "बरसीम (चारा)", ml: "ബെർസീം (തീറ്റപ്പുല്ല്)" },
    "betelvine(pan)": { en: "Betel Vine (Pan)", te: "తమలపాకు", hi: "पान", mr: "पान", ml: "വെറ്റില" },
    coriander: { en: "Coriander", te: "కొత్తిమీర", hi: "धनिया", mr: "कोथिंबीर", ml: "മല്ലിയില" },
    mustard: { en: "Mustard", te: "ఆవాలు", hi: "सरसों", mr: "मोहरी", ml: "കടുക്" }
  };
  return translations[key] ? (translations[key][lang] || translations[key].en) : name;
}

const farmerPhone = localStorage.getItem("farmerPhone") || "";
const farmerEmail = localStorage.getItem("farmerEmail") || "";
let farmerName = localStorage.getItem("farmerName") || "";
let farmerLang =
  localStorage.getItem("uiLang") || localStorage.getItem("farmerLang") || "en";

const welcomeTitle = $("welcomeTitle");
const welcomeSubtitle = $("welcomeSubtitle");
const profileInfo = $("profileInfo");
const dashLogoTitle = $("dashLogoTitle");
const dashLogoSubtitle = $("dashLogoSubtitle");
const cardCropTitle = $("cardCropTitle");
const cardCropText = $("cardCropText");
const cardMarketTitle = $("cardMarketTitle");
const cardMarketText = $("cardMarketText");

// Localized UI elements (declared to prevent ReferenceErrors)
const navHome = $("navHome");
const navContactUs = $("navContactUs");
const navProfile = $("navProfile");
const selectedCropTitle = $("selectedCropTitle");
const selectedCropIntro = $("selectedCropIntro");
const profileTitle = $("profileTitle");
const contactUsTitle = $("contactUsTitle");
const contactUsText = $("contactUsText");
const cardChatTitle = $("cardChatTitle");
const cardChatText = $("cardChatText");
const cardDiseaseTitle = $("cardDiseaseTitle");
const cardDiseaseText = $("cardDiseaseText");
const profileButton = $("profileButton");
const profileDropdown = $("profileDropdown");
const profileLogoutBtn = $("profileLogoutBtn");
const profileViewBtn = $("profileViewBtn");
const profileInitials = $("profileInitials");
const profilePhoneShort = $("profilePhoneShort");
const dashLangSelect = $("dashLangSelect");

// Sidebar Drawer
const sidebarMenuBtn = $("sidebarMenuBtn");
const sidebarMenuDrawer = $("sidebarMenuDrawer");
const closeSidebarDrawerBtn = $("closeSidebarDrawerBtn");
const sidebarDrawerBackdrop = $("sidebarDrawerBackdrop");
const sidebarViewProfileBtn = $("sidebarViewProfileBtn");
const sidebarHelpCenterBtn = $("sidebarHelpCenterBtn");
const sidebarTipsBtn = $("sidebarTipsBtn");
const sidebarSchemesBtn = $("sidebarSchemesBtn");
const sidebarAboutBtn = $("sidebarAboutBtn");
const sidebarLogoutBtn = $("sidebarLogoutBtn");
const drawerLangSelect = $("drawerLangSelect");
const sidebarChangePasswordBtn = $("sidebarChangePasswordBtn");
const changePasswordModal = $("changePasswordModal");
const closeChangePasswordBtn = $("closeChangePasswordBtn");
const closeChangePasswordBackdrop = $("closeChangePasswordBackdrop");

// Profile Modal
const profileModal = $("profileModal");
const closeProfileModalBtn = $("closeProfileModalBtn");
const closeProfileModalBackdrop = $("closeProfileModalBackdrop");
const profileNameInput = $("profileNameInput");
const profilePhoneDisplay = $("profilePhoneDisplay");
const profileSoilSelect = $("profileSoilSelect");
const profileWaterSelect = $("profileWaterSelect");
const profileAcresInput = $("profileAcresInput");
const saveProfileBtn = $("saveProfileBtn");
const profileSaveStatus = $("profileSaveStatus");
const profilePicInput = $("profilePicInput");
const profileModalAvatarImg = $("profileModalAvatarImg");

// Help Center Modal
const helpCenterModal = $("helpCenterModal");
const closeHelpCenterBtn = $("closeHelpCenterBtn");
const closeHelpCenterBackdrop = $("closeHelpCenterBackdrop");
const helpQueryName = $("helpQueryName");
const helpQueryText = $("helpQueryText");
const submitHelpQueryBtn = $("submitHelpQueryBtn");
const helpQueryStatus = $("helpQueryStatus");

// Farming Tips Modal
const tipsModal = $("tipsModal");
const closeTipsBtn = $("closeTipsBtn");
const closeTipsBackdrop = $("closeTipsBackdrop");

// Govt Schemes Modal
const schemesModal = $("schemesModal");
const closeSchemesBtn = $("closeSchemesBtn");
const closeSchemesBackdrop = $("closeSchemesBackdrop");

// Crop Monitoring Timeline Modal
const cropMonitorModal = $("cropMonitorModal");
const closeCropMonitorBtn = $("closeCropMonitorBtn");
const closeCropMonitorBtn2 = $("closeCropMonitorBtn2");
const closeCropMonitorBackdrop = $("closeCropMonitorBackdrop");
const cardSelectedCropMonitor = $("cardSelectedCropMonitor");
const cardSelectedCropBadge = $("cardSelectedCropBadge");
const cardSelectedCropTitle = $("cardSelectedCropTitle");
const cardSelectedCropText = $("cardSelectedCropText");

if ((!farmerPhone && !farmerEmail && !localStorage.getItem("farmerUsername")) || !localStorage.getItem("sessionToken")) {
  performLogout();
}

function setupHeaderAvatar() {
  if (profileInitials) {
    const savedPic = localStorage.getItem("farmerProfilePic");
    if (savedPic) {
      profileInitials.innerHTML = `<img src="${savedPic}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
      if (profileModalAvatarImg) profileModalAvatarImg.src = savedPic;
    } else {
      const currentName = localStorage.getItem("farmerName") || farmerName;
      profileInitials.textContent = currentName
        ? currentName.charAt(0).toUpperCase()
        : "F";
    }
  }
  if (profilePhoneShort) {
    const lastDigits = farmerPhone.slice(-4);
    profilePhoneShort.textContent = lastDigits ? `+91‑***${lastDigits}` : "+91‑";
  }
}
setupHeaderAvatar();

function performLogout() {
  localStorage.removeItem("farmerPhone");
  localStorage.removeItem("farmerName");
  localStorage.removeItem("farmerLang");
  localStorage.removeItem("uiLang");
  localStorage.removeItem("sessionToken");
  localStorage.removeItem("farmerSoil");
  localStorage.removeItem("farmerWater");
  localStorage.removeItem("farmerAcres");
  localStorage.removeItem("farmerProfilePic");
  localStorage.removeItem("selectedCrops");
  localStorage.removeItem("selectedCrop");
  window.location.href = "index.html";
}

if (profileLogoutBtn) profileLogoutBtn.addEventListener("click", performLogout);
if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener("click", performLogout);

if (profileButton && profileDropdown) {
  profileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("hidden");
  });
  document.addEventListener("click", () => {
    profileDropdown.classList.add("hidden");
  });
}

function toggleModal(modalEl, show = true) {
  if (!modalEl) return;
  if (show) {
    modalEl.classList.remove("hidden");
  } else {
    modalEl.classList.add("hidden");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

if (profileViewBtn) {
  profileViewBtn.addEventListener("click", () => {
    populateProfileFields();
    toggleModal(profileModal, true);
  });
}
if (closeProfileModalBtn) closeProfileModalBtn.onclick = () => toggleModal(profileModal, false);
if (closeProfileModalBackdrop) closeProfileModalBackdrop.onclick = () => toggleModal(profileModal, false);

function populateProfileFields() {
  const currentName = localStorage.getItem("farmerName") || farmerName;
  if (profileNameInput) profileNameInput.value = currentName;
  if (profilePhoneDisplay) profilePhoneDisplay.value = farmerPhone;
  if (profileSoilSelect) profileSoilSelect.value = localStorage.getItem("farmerSoil") || "";
  if (profileWaterSelect) profileWaterSelect.value = localStorage.getItem("farmerWater") || "";
  if (profileAcresInput) profileAcresInput.value = localStorage.getItem("farmerAcres") || "";
  
  const savedPic = localStorage.getItem("farmerProfilePic");
  if (savedPic && profileModalAvatarImg) {
    profileModalAvatarImg.src = savedPic;
  } else if (profileModalAvatarImg) {
    profileModalAvatarImg.src = "img/saarthi-logo.png";
  }
}

if (profilePicInput) {
  profilePicInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const base64Img = event.target.result;
        localStorage.setItem("farmerProfilePic", base64Img);
        setupHeaderAvatar();
      };
      reader.readAsDataURL(file);
    }
  });
}

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", () => {
    const name = profileNameInput.value.trim();
    const soil = profileSoilSelect.value;
    const water = profileWaterSelect.value;
    const acres = profileAcresInput.value;

    if (!name) {
      profileSaveStatus.style.color = "red";
      profileSaveStatus.textContent = "Name is required.";
      return;
    }

    const token = localStorage.getItem("sessionToken");
    if (token) {
      profileSaveStatus.style.color = "var(--primary)";
      profileSaveStatus.textContent = "Saving changes...";

      fetch("/api/profile/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          soil,
          water,
          acres,
          profilePic: localStorage.getItem("farmerProfilePic") || ""
        })
      })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          profileSaveStatus.style.color = "red";
          profileSaveStatus.textContent = data.message || "Failed to save profile on database.";
          return;
        }

        localStorage.setItem("farmerName", name);
        localStorage.setItem("farmerSoil", soil);
        localStorage.setItem("farmerWater", water);
        localStorage.setItem("farmerAcres", acres);
        farmerName = name;

        if (typeof welcomeTitle !== 'undefined' && welcomeTitle) {
          applyDashboardLanguage();
        }
        setupHeaderAvatar();

        profileSaveStatus.style.color = "green";
        profileSaveStatus.textContent = "Profile saved successfully!";
        setTimeout(() => {
          profileSaveStatus.textContent = "";
          toggleModal(profileModal, false);
        }, 1200);
      })
      .catch(err => {
        console.error("Failed to save profile on database:", err);
        profileSaveStatus.style.color = "red";
        profileSaveStatus.textContent = "Failed to communicate with server.";
      });
    }
  });
}

if (sidebarMenuBtn) {
  sidebarMenuBtn.addEventListener("click", () => {
    toggleModal(sidebarMenuDrawer, true);
    if (drawerLangSelect) drawerLangSelect.value = farmerLang;
  });
}
const closeSidebar = () => toggleModal(sidebarMenuDrawer, false);
if (closeSidebarDrawerBtn) closeSidebarDrawerBtn.onclick = closeSidebar;
if (sidebarDrawerBackdrop) sidebarDrawerBackdrop.onclick = closeSidebar;

if (sidebarViewProfileBtn) {
  sidebarViewProfileBtn.addEventListener("click", () => {
    closeSidebar();
    populateProfileFields();
    toggleModal(profileModal, true);
  });
}

if (sidebarHelpCenterBtn) {
  sidebarHelpCenterBtn.addEventListener("click", () => {
    closeSidebar();
    toggleModal(helpCenterModal, true);
  });
}
if (closeHelpCenterBtn) closeHelpCenterBtn.onclick = () => toggleModal(helpCenterModal, false);
if (closeHelpCenterBackdrop) closeHelpCenterBackdrop.onclick = () => toggleModal(helpCenterModal, false);

if (sidebarTipsBtn) {
  sidebarTipsBtn.addEventListener("click", () => {
    closeSidebar();
    toggleModal(tipsModal, true);
  });
}
if (closeTipsBtn) closeTipsBtn.onclick = () => toggleModal(tipsModal, false);
if (closeTipsBackdrop) closeTipsBackdrop.onclick = () => toggleModal(tipsModal, false);

if (sidebarSchemesBtn) {
  sidebarSchemesBtn.addEventListener("click", () => {
    closeSidebar();
    toggleModal(schemesModal, true);
  });
}
if (closeSchemesBtn) closeSchemesBtn.onclick = () => toggleModal(schemesModal, false);
if (closeSchemesBackdrop) closeSchemesBackdrop.onclick = () => toggleModal(schemesModal, false);

if (sidebarAboutBtn) {
  sidebarAboutBtn.addEventListener("click", () => {
    closeSidebar();
    const aboutSaarthiModal = $("aboutSaarthiModal");
    if (aboutSaarthiModal) {
      toggleModal(aboutSaarthiModal, true);
      const closeAboutSaarthiModalBtn = $("closeAboutSaarthiModal");
      if (closeAboutSaarthiModalBtn) {
        closeAboutSaarthiModalBtn.onclick = () => toggleModal(aboutSaarthiModal, false);
      }
      const backdrop = aboutSaarthiModal.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.onclick = () => toggleModal(aboutSaarthiModal, false);
      }
    }
  });
}

if (sidebarChangePasswordBtn) {
  sidebarChangePasswordBtn.addEventListener("click", () => {
    closeSidebar();
    if (profileOldPasswordInput) profileOldPasswordInput.value = "";
    if (profileNewPasswordInput) profileNewPasswordInput.value = "";
    if (profileConfirmNewPasswordInput) profileConfirmNewPasswordInput.value = "";
    if (profilePasswordStatus) {
      profilePasswordStatus.textContent = "";
      profilePasswordStatus.style.color = "";
    }
    toggleModal(changePasswordModal, true);
  });
}
if (closeChangePasswordBtn) closeChangePasswordBtn.onclick = () => toggleModal(changePasswordModal, false);
if (closeChangePasswordBackdrop) closeChangePasswordBackdrop.onclick = () => toggleModal(changePasswordModal, false);

function syncDashboardLanguageSelect(select, lang) {
  if (!select) return;
  select.value = lang;

  const wrapper = document.getElementById(`${select.id}-custom-wrapper`);
  if (!wrapper) return;
  const selectedOption = select.options[select.selectedIndex];
  const triggerText = wrapper.querySelector(".custom-select-trigger span");
  if (triggerText && selectedOption) triggerText.textContent = selectedOption.textContent;
  wrapper.querySelectorAll(".custom-select-option").forEach((option) => {
    option.classList.toggle("selected", option.getAttribute("data-value") === lang);
  });
}

function setDashboardLanguage(lang) {
  farmerLang = lang || "en";
  localStorage.setItem("uiLang", farmerLang);
  localStorage.setItem("farmerLang", farmerLang);
  document.documentElement.lang = farmerLang;
  syncDashboardLanguageSelect(dashLangSelect, farmerLang);
  syncDashboardLanguageSelect(drawerLangSelect, farmerLang);
  applyDashboardLanguage(farmerLang);
  updateSelectedCropCard();
}

// Drawer Lang Switcher
if (drawerLangSelect) {
  drawerLangSelect.addEventListener("change", () => {
    setDashboardLanguage(drawerLangSelect.value);
  });
}

// Help Center Agronomist Query Form
if (submitHelpQueryBtn) {
  submitHelpQueryBtn.addEventListener("click", async () => {
    const name = helpQueryName.value.trim();
    const query = helpQueryText.value.trim();
    if (!name || !query) {
      helpQueryStatus.style.color = "red";
      helpQueryStatus.textContent = "Please fill in all fields.";
      return;
    }
    
    helpQueryStatus.style.color = "orange";
    helpQueryStatus.textContent = "Sending query...";
    
    try {
      const res = await fetch("/api/help-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: farmerPhone, query })
      });
      const data = await res.json();
      if (!data.ok) {
        helpQueryStatus.style.color = "red";
        helpQueryStatus.textContent = data.message || "Failed to submit query.";
        return;
      }
      
      helpQueryStatus.style.color = "green";
      helpQueryStatus.textContent = "Query submitted and emailed successfully!";
      helpQueryName.value = "";
      helpQueryText.value = "";
    } catch (err) {
      helpQueryStatus.style.color = "red";
      helpQueryStatus.textContent = "Error communicating with server.";
    }
    setTimeout(() => { helpQueryStatus.textContent = ""; }, 3000);
  });
}

// Help Center FAQs Accordion Logic
document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const answer = e.currentTarget.nextElementSibling;
    const indicator = e.currentTarget.querySelector("span");
    if (answer) {
      const isHidden = answer.classList.contains("hidden");
      answer.classList.toggle("hidden");
      if (indicator) {
        indicator.textContent = isHidden ? "−" : "+";
      }
    }
  });
});


// Apply UI language on dashboard
const dashTranslations = {
  en: {
    dashLogoTitle: "SAARTHI",
    dashLogoSubtitle: "Farmer Dashboard",
    navHome: "Home",
    navContactUs: "Contact Us",
    navProfile: "Profile",
    welcomeSubtitle: "Choose an option below to get guidance for your farm.",
    cardCropTitle: "Crop Recommendation",
    cardCropText:
      "Get 4–5 crop suggestions and budget estimate using your land details.",
    cardMarketTitle: "Market Demand Near You",
    cardMarketText:
      "See which crops have good demand and prices in your nearby markets.",
    cardChatTitle: "SAARTHI AI Chatbox",
    cardChatText:
      "Ask any farming questions in simple language to our intelligent assistant.",
    cardDiseaseTitle: "Disease Detector",
    cardDiseaseText:
      "Upload a crop or leaf photo to detect possible diseases in real-time.",
    selectedCropTitle: "Your Selected Crop & Monitoring",
    selectedCropIntro:
      "After you select one crop from recommendations, it will appear here with simple timeline guidance and reminders.",
    profileTitle: "Profile (Basic Demo)",
    contactUsTitle: "Contact Us",
    contactUsText: "For any questions or support regarding farm guidance, please feel free to reach out to us.",
    currentCropLabel: "Currently Tracking:",
    chooseCropLabel: "Change Crop:",
    playSelectedCropBtnText: "Read Current Crop",
    cardSelectedCropTitleSingular: "My Selected Crop",
    cardSelectedCropTitlePlural: "My Selected Crops",
    cardSelectedCropText: "Track your selected crop timeline, fertilizing schedule, and watering guides.",
    aboutSaarthiTitle: "About SAARTHI",
    aboutSaarthiIntro: "<strong>SAARTHI</strong> (meaning <em>Charioteer</em> or <em>Guide</em>) is an advanced, data-driven agricultural intelligence platform designed to empower Indian farmers with precision agriculture.",
    aboutF1Title: "Precision Recommendation",
    aboutF1Text: "Analyzes your soil, water source, acres, and climate data to suggest the most profitable and suitable crops.",
    aboutF2Title: "Market Demand",
    aboutF2Text: "Provides live market demand and price estimates in nearby mandis based on your location.",
    aboutF3Title: "AI Chat Companion",
    aboutF3Text: "An intelligent, multi-lingual chatbot to answer any crop questions, soil management queries, or pesticide advice.",
    aboutF4Title: "Disease Diagnostics",
    aboutF4Text: "Computer-vision powered diagnosis of plant diseases directly from leaf photos with instant treatment advice.",
    aboutFooterText: "Developed with ❤️ by the CSE Students of <strong>CMRCET</strong> to bridge the gap between AI technology and rural farmers.",
    heroQuote: '"Agriculture is the soul of our nation, and farmers are its heartbeat."',
    heroAuthor: "— Saarthi Agriculture Initiative",
    heroDiscover: "🔍 Click to discover SAARTHI",
    welcomeText: "Welcome",
    welcomeDefault: "Welcome to SAARTHI",
    voiceInstructions: "Voice instructions"
  },
  te: {
    dashLogoTitle: "SAARTHI",
    dashLogoSubtitle: "రైతు డాష్‌బోర్డు",
    navHome: "హోమ్",
    navContactUs: "సంప్రదించండి",
    navProfile: "ప్రొఫైల్",
    welcomeSubtitle:
      "మీ రైతు పొలం కోసం సహాయం కావాలంటే క్రింద ఉన్న ఏదైనా ఎంపికను ఎంచుకోండి.",
    cardCropTitle: "పంట సిఫారసు",
    cardCropText:
      "మీ భూవివరాల ఆధారంగా 4–5 పంటలు మరియు అంచనా ఖర్చు పొందండి.",
    cardMarketTitle: "మీ దగ్గర మార్కెట్ డిమాండ్",
    cardMarketText:
      "మీ సమీప మార్కెట్‌లలో మంచి డిమాండ్ & ధరలున్న పంటలను చూడండి.",
    cardChatTitle: "SAARTHI AI చాట్‌బాక్స్",
    cardChatText:
      "మా ఇంటెలిజెంట్ అసిస్టెంట్‌ని సాధరణ భాషలో వ్యవసాయ ప్రశ్నలు అడగండి.",
    cardDiseaseTitle: "వ్యాధి గుర్తింపు",
    cardDiseaseText:
      "పంట లేదా ఆకుల ఫోటోలను అప్‌లోడ్ చేసి, సాధ్యమైన వ్యాధులను వెంటనే తెలుసుకోండి.",
    selectedCropTitle: "మీ ఎన్నిక చేసిన పంట & మానిటరింగ్",
    selectedCropIntro:
      "సిఫారసుల నుండి మీరు ఒక పంటను ఎంచుకున్న తర్వాత, ఆ పంట ఇక్కడ కనిపిస్తుంది. టైమ్‌లైన్ రిమైండర్లు కూడా చూపిస్తాం.",
    profileTitle: "ప్రొఫైల్ (బేసిక్ డెమో)",
    contactUsTitle: "సంప్రదించండి",
    contactUsText: "పొలం మార్గదర్శకత్వం గురించి ఏవైనా ప్రశ్నలు లేదా మద్దతు కోసం, దయచేసి మమ్మల్ని సంప్రదించడానికి సంకోచించకండి.",
    currentCropLabel: "ప్రస్తుత పంట:",
    chooseCropLabel: "పంటను మార్చండి:",
    playSelectedCropBtnText: "ప్రస్తుత పంటను చదవండి",
    cardSelectedCropTitleSingular: "నేను ఎంచుకున్న పంట",
    cardSelectedCropTitlePlural: "నేను ఎంచుకున్న పంటలు",
    cardSelectedCropText: "మీరు ఎంచుకున్న పంట కాలక్రమం, ఎరువుల షెడ్యూల్ మరియు నీటి సరఫరా మార్గదర్శకాలను పర్యవేక్షించండి.",
    aboutSaarthiTitle: "SAARTHI గురించి",
    aboutSaarthiIntro: "<strong>SAARTHI</strong> (అనగా <em>సారథి</em> లేదా <em>మార్గదర్శి</em>) అనేది భారతీయ రైతులకు ఖచ్చితమైన వ్యవసాయ మార్గదర్శకత్వం అందించడానికి రూపొందించబడిన అధున太న, డేటా ఆధారిత వ్యవసాయ మేధస్సు ప్లాట్‌ఫారమ్.",
    aboutF1Title: "ఖచ్చితమైన సిఫారసు",
    aboutF1Text: "మీ భూసారం, నీటి వనరులు, ఎకరాలు మరియు వాతావరణ వివరాలను విశ్లేషించి మీకు అత్యంత లాభదాయకమైన పంటలను సిఫారసు చేస్తుంది.",
    aboutF2Title: "మార్కెట్ డిమాండ్",
    aboutF2Text: "మీ స్థానం ఆధారంగా సమీప మార్కెట్‌లలో లైవ్ డిమాండ్ మరియు ధరల అంచనాలను అందిస్తుంది.",
    aboutF3Title: "AI చాట్ సహాయకుడు",
    aboutF3Text: "పంటల ప్రశ్నలు, నేల యాజమాన్యం లేదా పురుగుమందుల సలహాల గురించి సమాధానమిచ్చే తెలివైన బహుభాషా చాట్‌బాట్.",
    aboutF4Title: "వ్యాధి నిర్ధారణ",
    aboutF4Text: "ఆకుల ఫోటోల ఆధారంగా కంప్యూటర్-విజన్ ద్వారా పంట వ్యాధులను మరియు చికిత్సా పద్ధతులను వెంటనే తెలియజేస్తుంది.",
    aboutFooterText: "రూరల్ రైతుల కోసం AI సాంకేతికతను సులభతరం చేసేందుకు <strong>CMRCET</strong> యొక్క CSE విద్యార్థులచే ప్రేమతో అభివృద్ధి చేయబడింది.",
    heroQuote: '"వ్యవసాయం మన దేశానికి ఆత్మ, మరియు రైతులు దాని హృదయ స్పందన."',
    heroAuthor: "— సారథి వ్యవసాయ కార్యక్రమం",
    heroDiscover: "🔍 SAARTHI గురించి తెలుసుకోండి",
    welcomeText: "స్వాగతం",
    welcomeDefault: "SAARTHI కి స్వాగతం",
    voiceInstructions: "ఆడియో మార్గదర్శకాలు"
  },
  hi: {
    dashLogoTitle: "SAARTHI",
    dashLogoSubtitle: "किसान डैशबोर्ड",
    navHome: "होम",
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    welcomeSubtitle:
      "अपने खेत के लिए मदद पाने के लिए नीचे दिए गए किसी भी विकल्प को चुनें।",
    cardCropTitle: "फसल सिफारिश",
    cardCropText:
      "आपकी ज़मीन के विवरण के आधार पर 4–5 फसल सुझाव और अनुमानित बजट प्राप्त करें।",
    cardMarketTitle: "आपके क्षेत्र की बाजार मांग",
    cardMarketText:
      "आपके नज़दीकी बाजारों में अच्छी मांग और कीमत वाली फसलें देखें।",
    cardChatTitle: "SAARTHI AI चैटबॉक्स",
    cardChatText:
      "हमारे बुद्धिमान सहायक से सरल भाषा में कोई भी कृषि संबंधी प्रश्न पूछें।",
    cardDiseaseTitle: "रोग पहचान",
    cardDiseaseText:
      "संभावित रोगों का वास्तविक समय में पता लगाने के लिए फसल या पत्तों की फोटो अपलोड करें।",
    selectedCropTitle: "आपकी चुनी हुई फसल और निगरानी",
    selectedCropIntro:
      "सिफारिशों से आप जो फसल चुनते हैं, वह यहाँ दिखाई देगी। उसके साथ साधारण टाइमलाइन रिमाइंडर भी दिखेंगे।",
    profileTitle: "प्रोफाइल (बेसिक डेमो)",
    contactUsTitle: "संपर्क",
    contactUsText:
      "खेत मार्गदर्शन के संबंध में किसी भी प्रश्न या सहायता के लिए, कृपया बेझिझक हमसे संपर्क करें।",
    currentCropLabel: "वर्तमान फसल:",
    chooseCropLabel: "फसल बदलें:",
    playSelectedCropBtnText: "वर्तमान फसल पढ़ें",
    cardSelectedCropTitleSingular: "मेरी चुनी हुई फसल",
    cardSelectedCropTitlePlural: "मेरी चुनी हुई फसलें",
    cardSelectedCropText: "अपनी चुनी हुई फसल की समयसीमा, उर्वरक कार्यक्रम और पानी देने के दिशानिर्देशों को ट्रैक करें।",
    aboutSaarthiTitle: "SAARTHI के बारे में",
    aboutSaarthiIntro: "<strong>SAARTHI</strong> (अर्थात <em>सारथी</em> या <em>मार्गदर्शक</em>) भारतीय किसानों को सटीक कृषि के साथ सशक्त बनाने के लिए डिज़ाइन किया गया एक उन्नत, डेटा-संचालित कृषि इंटेलिजेंस प्लेटफॉर्म है।",
    aboutF1Title: "सटीक फसल सिफारिश",
    aboutF1Text: "सबसे लाभदायक और उपयुक्त फसलों का सुझाव देने के लिए आपके मिट्टी, पानी के स्रोत, एकड़ और जलवायु डेटा का विश्लेषण करता है।",
    aboutF2Title: "बाजार मांग",
    aboutF2Text: "आपके स्थान के आधार पर नजदीकी मंडियों में लाइव बाजार मांग और मूल्य अनुमान प्रदान करता है।",
    aboutF3Title: "AI चैट सहायक",
    aboutF3Text: "कृषि संबंधी किसी भी प्रश्न, मिट्टी प्रबंधन प्रश्नों या कीटनाशक सलाह का उत्तर देने के लिए एक बुद्धिमान, बहुभाषी चैटबॉट।",
    aboutF4Title: "रोग निदान",
    aboutF4Text: "त्वरित उपचार सलाह के साथ पत्ती की तस्वीरों से सीधे पौधों के रोगों का कंप्यूटर-विज़न संचालित निदान।",
    aboutFooterText: "ग्रामीण किसानों और AI तकनीक के बीच की दूरी को कम करने के लिए <strong>CMRCET</strong> के CSE छात्रों द्वारा ❤️ के साथ विकसित किया गया है।",
    heroQuote: '"कृषि हमारे देश की आत्मा है, और किसान इसकी धड़कन हैं।"',
    heroAuthor: "— सारथी कृषि पहल",
    heroDiscover: "🔍 SAARTHI के बारे में जानें",
    welcomeText: "स्वागत है",
    welcomeDefault: "SAARTHI में आपका स्वागत है",
    voiceInstructions: "ऑडियो निर्देश"
  },
  mr: {
    dashLogoTitle: "SAARTHI",
    dashLogoSubtitle: "शेतकरी डॅशबोर्ड",
    navHome: "होम",
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    welcomeSubtitle:
      "तुमच्या शेतासाठी मदत हवी असल्यास खालील पर्यायांपैकी एक निवडा.",
    cardCropTitle: "पीक सुचवणी",
    cardCropText:
      "तुमच्या जमिनीच्या तपशीलावर आधारित 4–5 पिके आणि अंदाजित खर्च मिळवा.",
    cardMarketTitle: "तुमच्या भागातील बाजार मागणी",
    cardMarketText:
      "जवळच्या बाजारात चांगली मागणी आणि दर असलेली पिके पाहा.",
    cardChatTitle: "SAARTHI AI चॅटबॉक्स",
    cardChatText:
      "आमच्या बुद्धिमान सहाय्यकाला सोप्या भाषेत शेतीविषयी कोणतेही प्रश्न विचारा.",
    cardDiseaseTitle: "रोग ओळख",
    cardDiseaseText:
      "संभाव्य रोगांचा रिअल-टाइम शोध घेण्यासाठी पीक किंवा पानांचे फोटो अपलोड करा.",
    selectedCropTitle: "तुमचे निवडलेले पीक आणि मानीटरिंग",
    selectedCropIntro:
      "सुझावांमधून तुम्ही जे पीक निवडता, ते येथे दिसेल. त्याबरोबर साधे टाइमलाइन रिमाइंडरही दिसतील.",
    profileTitle: "प्रोफाइल (बेसिक डेमो)",
    contactUsTitle: "संपर्क",
    contactUsText: "शेताच्या मार्गदर्शनाबाबत काही प्रश्न किंवा मार्गदर्शनासाठी, कृपया आमच्याशी संपर्क साधा.",
    currentCropLabel: "सध्याचे पीक:",
    chooseCropLabel: "पीक बदला:",
    playSelectedCropBtnText: "सध्याचे पीक वाचा",
    cardSelectedCropTitleSingular: "माझे निवडलेले पीक",
    cardSelectedCropTitlePlural: "माझी निवडलेली पिके",
    cardSelectedCropText: "तुमच्या निवडलेल्या पिकाची वेळ, खतांचे वेळापत्रक आणि पाणी देण्याच्या मार्गदर्शक तत्त्वांचा मागोवा घ्या.",
    aboutSaarthiTitle: "SAARTHI बद्दल",
    aboutSaarthiIntro: "<strong>SAARTHI</strong> (म्हणजे <em>सारथी</em> किंवा <em>मार्गदर्शक</em>) हे भारतीय शेतकऱ्यांना अचूक शेतीद्वारे सक्षम करण्यासाठी डिझाइन केलेले एक प्रगत, डेटा-चालित कृषी माहिती व्यासपीठ आहे.",
    aboutF1Title: "अचूक पीक सुचवणी",
    aboutF1Text: "सर्वात फायदेशीर आणि योग्य पिके सुचवण्यासाठी तुमच्या शेतातील माती, पाण्याचे स्त्रोत, एकर आणि हवामान डेटाचे विश्लेषण करते.",
    aboutF2Title: "बाजार मागणी",
    aboutF2Text: "तुमच्या स्थानावर आधारित जवळील मंडईंमध्ये थेट बाजार मागणी आणि किंमतीचे अंदाज प्रदान करते.",
    aboutF3Title: "AI चॅट सहाय्यक",
    aboutF3Text: "शेतीविषयी कोणतेही प्रश्न, माती व्यवस्थापन प्रश्न किंवा कीटकनाशक सल्ल्यांची उत्तरे देण्यासाठी एक बुद्धिमान, बहुभाषिक चॅटबॉट.",
    aboutF4Title: "रोग निदान",
    aboutF4Text: "त्वरित उपचार सल्ल्यासह थेट पानाच्या फोटोंवरून वनस्पतीच्या रोगांचे कॉम्प्युटर-व्हिजन आधारित निदान.",
    aboutFooterText: "ग्रामीण शेतकरी आणि AI तंत्रज्ञानातील अंतर कमी करण्यासाठी <strong>CMRCET</strong> च्या CSE विद्यार्थ्यांनी ❤️ ने विकसित केले आहे.",
    heroQuote: '"शेती हा आपल्या देशाचा आत्मा आहे आणि शेतकरी हे त्याचे हृदय आहेत."',
    heroAuthor: "— सारथी कृषी उपक्रम",
    heroDiscover: "🔍 SAARTHI बद्दल अधिक माहिती",
    welcomeText: "स्वागत आहे",
    welcomeDefault: "SAARTHI मध्ये आपले स्वागत आहे",
    voiceInstructions: "ऑडिओ मार्गदर्शक"
  },
  ml: {
    dashLogoTitle: "SAARTHI",
    dashLogoSubtitle: "കർഷക ഡാഷ്ബോർഡ്",
    navHome: "ഹോം",
    navContactUs: "ബന്ധപ്പെടുക",
    navProfile: "പ്രൊഫൈൽ",
    welcomeSubtitle:
      "നിങ്ങളുടെ വയലിന് വേണ്ട സഹായം ലഭിക്കാൻ താഴെ കാണുന്ന ഓപ്ഷനുകളിൽ ഒന്നെന്തെങ്കിലും തിരഞ്ഞെടുക്കുക.",
    cardCropTitle: "വിള നിർദേശം",
    cardCropText:
      "നിങ്ങളുടെ ഭൂമിയുടെ വിവരങ്ങളുടെ അടിസ്ഥാനത്തിൽ 4–5 വിള നിർദേശംയും ബജറ്റ് കണക്കും നേടുക.",
    cardMarketTitle: "നിങ്ങളുടെ പ്രദേശത്തെ മാർക്കറ്റ് ഡിമാൻഡ്",
    cardMarketText:
      "അടുത്തുള്ള മാർക്കറ്റുകളിൽ നല്ല ഡിമാൻഡും വിലയും ഉള്ള വിളകൾ കാണുക.",
    cardChatTitle: "SAARTHI AI ചാറ്റ്ബോക്സ്",
    cardChatText:
      "ലളിതമായ ഭാഷയിൽ ഞങ്ങളുടെ ബുദ്ധിമാനായ അസിസ്റ്റൻ്റിനോട് കാർഷിക ചോദ്യങ്ങൾ ചോദിക്കുക.",
    cardDiseaseTitle: "രോഗ നിർണ്ണയം",
    cardDiseaseText:
      "വിളയുടെയോ ഇലകളുടെയോ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്ത് സാധ്യതയുള്ള രോഗം കാണുക (ഡെമോ ലാജിക്ക്).",
    selectedCropTitle: "നിങ്ങൾ തെരഞ്ഞെടുത്ത വിളയും നിരീക്ഷണവും",
    selectedCropIntro:
      "നിർദേശങ്ങളിൽ നിന്ന് നിങ്ങൾ തിരഞ്ഞെടുത്ത വിള ഇവിടെ കാണിക്കും. ലളിതമായ ടൈംലൈൻ റിമൈൻഡറുകളും കാണും.",
    profileTitle: "പ്രൊഫൈൽ (ബേസിക് ഡെമോ)",
    contactUsTitle: "ബന്ധപ്പെടുക",
    contactUsText: "ഫാം മാർഗനിർദ്ദേശത്തെക്കുറിച്ചുള്ള എന്തെങ്കിലും ചോദ്യങ്ങൾക്കും പിന്തുണയ്ക്കും, ദയവായി ഞങ്ങളെ ബന്ധപ്പെടാൻ മടിക്കേണ്ടതില്ല.",
    currentCropLabel: "നിലവിലെ വിള:",
    chooseCropLabel: "വിള മാറ്റുക:",
    playSelectedCropBtnText: "നിലവിലെ വിള വായിക്കുക",
    cardSelectedCropTitleSingular: "ഞാൻ തിരഞ്ഞെടുത്ത വിള",
    cardSelectedCropTitlePlural: "ഞാൻ തിരഞ്ഞെടുത്ത വിളകൾ",
    cardSelectedCropText: "നിങ്ങൾ തിരഞ്ഞെടുത്ത വിളയുടെ സമയക്രമം, വളപ്രയോഗം, നനയ്ക്കൽ എന്നിവ ട്രാക്ക് ചെയ്യുക.",
    aboutSaarthiTitle: "SAARTHI യെക്കുറിച്ച്",
    aboutSaarthiIntro: "<strong>SAARTHI</strong> (അർത്ഥം <em>സാരഥി</em> അല്ലെങ്കിൽ <em>വഴികാട്ടി</em>) എന്നത് കൃത്യമായ കൃഷിയിലൂടെ ഇന്ത്യൻ കർഷകരെ ശാക്തീകരിക്കുന്നതിനായി രൂപകൽപ്പന ചെയ്തിട്ടുള്ള ഒരു നൂതന, വിവര-അധിഷ്ഠിത കാർഷിക ഇന്റലിജൻസ് പ്ലാറ്റ്‌ഫോമാണ്.",
    aboutF1Title: "കൃത്യമായ വിള നിർദേശം",
    aboutF1Text: "ഏറ്റവും ലാഭകരവും അനുയോജ്യവുമായ വിളകൾ നിർദ്ദേശിക്കുന്നതിനായി നിങ്ങളുടെ മണ്ണ്, ജലസ്രോതസ്സ്, ഏക്കർ, കാലാവസ്ഥാ വിവരങ്ങൾ എന്നിവ വിശകലനം ചെയ്യുന്നു.",
    aboutF2Title: "മാർക്കറ്റ് ഡിമാൻഡ്",
    aboutF2Text: "നിങ്ങളുടെ ലൊക്കേഷൻ അടിസ്ഥാനമാക്കി അടുത്തുള്ള മണ്ടികളിലെ തത്സമയ വിപണി ആവശ്യകതയും വിലയും ലഭ്യമാക്കുന്നു.",
    aboutF3Title: "AI ചാറ്റ് സഹായി",
    aboutF3Text: "വിളകളെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾക്കോ കീടനാശിനി ഉപദേശങ്ങൾക്കോ ഉത്തരം നൽകാൻ ബുദ്ധിമാനായ മൾട്ടി-ലിംഗ്വൽ ചാറ്റ്ബോട്ട്.",
    aboutF4Title: "രോഗനിർണ്ണയം",
    aboutF4Text: "ഇലകളുടെ ഫോട്ടോകളിൽ നിന്ന് നേരിട്ട് സസ്യരോഗങ്ങൾ നിർണ്ണയിക്കുകയും തൽക്ഷണ ചികിത്സാ ഉപദേശം നൽകുകയും ചെയ്യുന്നു.",
    aboutFooterText: "ഗ്രാമീണ കർഷകരിലേക്ക് AI സാങ്കേതികവിദ്യ എത്തിക്കുന്നതിനായി <strong>CMRCET</strong> സിഎസ്ഇ വിദ്യാർത്ഥികൾ സ്നേഹത്തോടെ നിർമ്മിച്ചത്.",
    heroQuote: '"കൃഷി നമ്മുടെ രാജ്യത്തിന്റെ ആത്മാവാണ്, കർഷകർ അതിന്റെ ഹൃദയമിടിപ്പാണ്."',
    heroAuthor: "— സാരഥി കാർഷിക സംരംഭം",
    heroDiscover: "🔍 SAARTHI യെക്കുറിച്ച് അറിയുക",
    welcomeText: "സ്വാഗതം",
    welcomeDefault: "SAARTHI-ലേക്ക് സ്വാഗതം",
    voiceInstructions: "വോയ്‌സ് നിർദ്ദേശങ്ങൾ"
  }
};

function applyDashboardLanguage(lang = farmerLang) {
  const t = dashTranslations[lang] || dashTranslations.en;
  if (dashLogoTitle) dashLogoTitle.textContent = t.dashLogoTitle;
  if (dashLogoSubtitle) dashLogoSubtitle.textContent = t.dashLogoSubtitle;
  if (navHome) navHome.textContent = t.navHome;
  if (navContactUs) navContactUs.textContent = t.navContactUs;
  if (navProfile) navProfile.textContent = t.navProfile;
  if (welcomeSubtitle) welcomeSubtitle.textContent = t.welcomeSubtitle;
  if (cardCropTitle) cardCropTitle.textContent = t.cardCropTitle;
  if (cardCropText) cardCropText.textContent = t.cardCropText;
  if (cardMarketTitle) cardMarketTitle.textContent = t.cardMarketTitle;
  if (cardMarketText) cardMarketText.textContent = t.cardMarketText;
  if (cardChatTitle) cardChatTitle.textContent = t.cardChatTitle;
  if (cardChatText) cardChatText.textContent = t.cardChatText;
  if (cardDiseaseTitle) cardDiseaseTitle.textContent = t.cardDiseaseTitle;
  if (cardDiseaseText) cardDiseaseText.textContent = t.cardDiseaseText;
  if (selectedCropTitle) selectedCropTitle.textContent = t.selectedCropTitle;
  if (selectedCropIntro) selectedCropIntro.textContent = t.selectedCropIntro;
  if (profileTitle) profileTitle.textContent = t.profileTitle;
  if (contactUsTitle) contactUsTitle.textContent = t.contactUsTitle;
  if (contactUsText) contactUsText.textContent = t.contactUsText;

  if ($('currentCropLabel')) $('currentCropLabel').textContent = t.currentCropLabel;
  if ($('chooseCropLabel')) $('chooseCropLabel').textContent = t.chooseCropLabel;
  if ($('playSelectedCropBtnText')) $('playSelectedCropBtnText').textContent = t.playSelectedCropBtnText;

  const playBtn = $('playDashboardInstructions');
  if (playBtn) {
    playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> ${t.voiceInstructions || 'Voice instructions'}`;
  }

  if (welcomeTitle) {
    const name = farmerName || farmerPhone;
    const username = localStorage.getItem("farmerUsername") || "";
    welcomeTitle.textContent = name
      ? `${t.welcomeText || 'Welcome'}, ${name}`
      : (t.welcomeDefault || "Welcome to SAARTHI");
  }

  // Update hero banner texts
  if ($('heroQuote')) $('heroQuote').textContent = t.heroQuote || '"Agriculture is the soul of our nation, and farmers are its heartbeat."';
  if ($('heroAuthor')) $('heroAuthor').textContent = t.heroAuthor || '— Saarthi Agriculture Initiative';
  if ($('heroDiscover')) $('heroDiscover').textContent = t.heroDiscover || '🔍 Click to discover SAARTHI';

  // Update About SAARTHI modal texts
  if ($('aboutSaarthiTitle')) $('aboutSaarthiTitle').textContent = t.aboutSaarthiTitle || 'About SAARTHI';
  if ($('aboutSaarthiIntro')) $('aboutSaarthiIntro').innerHTML = t.aboutSaarthiIntro || '<strong>SAARTHI</strong> (meaning <em>Charioteer</em> or <em>Guide</em>) is an advanced, data-driven agricultural intelligence platform designed to empower Indian farmers with precision agriculture.';
  if ($('aboutF1Title')) $('aboutF1Title').textContent = t.aboutF1Title || 'Precision Recommendation';
  if ($('aboutF1Text')) $('aboutF1Text').textContent = t.aboutF1Text || 'Analyzes your soil, water source, acres, and climate data to suggest the most profitable and suitable crops.';
  if ($('aboutF2Title')) $('aboutF2Title').textContent = t.aboutF2Title || 'Market Demand';
  if ($('aboutF2Text')) $('aboutF2Text').textContent = t.aboutF2Text || 'Provides live market demand and price estimates in nearby mandis based on your location.';
  if ($('aboutF3Title')) $('aboutF3Title').textContent = t.aboutF3Title || 'AI Chat Companion';
  if ($('aboutF3Text')) $('aboutF3Text').textContent = t.aboutF3Text || 'An intelligent, multi-lingual chatbot to answer any crop questions, soil management queries, or pesticide advice.';
  if ($('aboutF4Title')) $('aboutF4Title').textContent = t.aboutF4Title || 'Disease Diagnostics';
  if ($('aboutF4Text')) $('aboutF4Text').textContent = t.aboutF4Text || 'Computer-vision powered diagnosis of plant diseases directly from leaf photos with instant treatment advice.';
  if ($('aboutFooterText')) $('aboutFooterText').innerHTML = `<p>${t.aboutFooterText || 'Developed with ❤️ by the CSE Students of <strong>CMRCET</strong> to bridge the gap between AI technology and rural farmers.'}</p>`;
  if (profileInfo) {
    const baseText =
      lang === "te"
        ? `మీ పేరు: ${farmerName || "-"}. ఫోన్: ${farmerPhone}. ఎంచుకున్న భాష: ${farmerLang}.`
        : lang === "hi"
          ? `आपका नाम: ${farmerName || "-"}. फ़ोन नंबर: ${farmerPhone}. चुनी हुई भाषा: ${farmerLang}.`
          : lang === "mr"
            ? `तुमचे नाव: ${farmerName || "-"}. फोन नंबर: ${farmerPhone}. निवडलेली भाषा: ${farmerLang}.`
            : lang === "ml"
              ? `നിങ്ങളുടെ പേര്: ${farmerName || "-"}. ഫോൺ നമ്പർ: ${farmerPhone}. തിരഞ്ഞെടുക്കുന്ന ഭാഷ: ${farmerLang}.`
              : `Logged in as ${farmerName || farmerPhone}. Language preference: ${farmerLang}.`;
    profileInfo.textContent = baseText;
  }

  // Selected Crops card translations (supports singular / plural titles)
  if (cardSelectedCropTitle) {
    let cropsList = [];
    try {
      cropsList = JSON.parse(localStorage.getItem("selectedCrops") || "[]");
    } catch { }
    if (!cropsList || !cropsList.length) {
      let legacy = null;
      try {
        legacy = JSON.parse(localStorage.getItem("selectedCrop") || "null");
      } catch {}
      if (legacy && legacy.name) {
        cropsList = [{ crop: legacy.name }];
      }
    }
    if (cropsList.length > 1) {
      cardSelectedCropTitle.textContent = t.cardSelectedCropTitlePlural || t.cardSelectedCropTitleSingular;
    } else {
      cardSelectedCropTitle.textContent = t.cardSelectedCropTitleSingular;
    }
  }
  if (cardSelectedCropText) {
    cardSelectedCropText.textContent = t.cardSelectedCropText;
  }
}

applyDashboardLanguage(farmerLang);
document.documentElement.lang = farmerLang;
document.documentElement.classList.remove("language-loading");

if (dashLangSelect) {
  syncDashboardLanguageSelect(dashLangSelect, farmerLang);
  dashLangSelect.addEventListener("change", () => {
    setDashboardLanguage(dashLangSelect.value);
  });
}

// Voice instructions for dashboard
let availableVoices = [];
if ("speechSynthesis" in window) {
  const loadVoices = () => { availableVoices = window.speechSynthesis.getVoices() || []; };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function speakDashboard(text, langCode) {
  try {
    if (!("speechSynthesis" in window)) return;
    const lc = langCode || "en-IN";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lc;

    let matches = availableVoices.filter(v => v.lang.toLowerCase().startsWith(lc.toLowerCase()));
    if (!matches.length) {
      const base = lc.split("-")[0];
      matches = availableVoices.filter(v => v.lang.toLowerCase().startsWith(base.toLowerCase()));
    }
    if (matches.length) {
      // Prioritize explicit Indian accented voices (e.g. Heera, Ravi, Neerja, India, Google India) so it doesn't sound Americanized
      const indianVoice = matches.find(v => {
        const nameLower = v.name.toLowerCase();
        return nameLower.includes("india") || 
               nameLower.includes("heera") || 
               nameLower.includes("ravi") || 
               nameLower.includes("neerja") || 
               nameLower.includes("dilpreet") || 
               nameLower.includes("ananya") || 
               nameLower.includes("swara") || 
               nameLower.includes("priya");
      });
      utterance.voice = indianVoice || matches[0];
    }

    // Warm, emotional, standard conversational rate & pitch for comfort
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch (e) { }
}

const playDashboardInstructions = $("playDashboardInstructions");
if (playDashboardInstructions) {
  playDashboardInstructions.addEventListener("click", () => {
    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    let msg =
      "On this page you can choose crop recommendation, market demand, chatbox, or disease detection. Then follow the steps on the screen.";
    let langCode = "en-IN";
    if (farmerLang === "te") {
      msg =
        "Ee page lo panta sifaarusu, market demand, chatbox leda vyaadhi gurtimpu ni select chesi, screen lo chupinche steps follow cheyyandi.";
      langCode = "te-IN";
    } else if (farmerLang === "hi") {
      msg =
        "Is page par aap fasal sifaarish, bazaar ki maang, chatbox ya rog pehchaan chun sakte hain. Screen par diye gaye steps follow kijiye.";
      langCode = "hi-IN";
    } else if (farmerLang === "mr") {
      msg =
        "या पेजवर तुम्ही पीक सुचवणी, बाजारातील मागणी, चॅटबॉक्स किंवा रोग ओळख निवडू शकता. Screen वरील स्टेप्स फॉलो करा.";
      langCode = "mr-IN";
    } else if (farmerLang === "ml") {
      msg =
        "ഈ പേജിൽ നിന്നു നിങ്ങൾക്ക് വിള നിർദേശം, മാർക്കറ്റ് ഡിമാൻഡ്, ചാറ്റ്ബോക്സ്, അല്ലെങ്കിൽ രോഗ നിർണ്ണയം തിരഞ്ഞെടുക്കാം. സ്ക്രീനിൽ പതുക്കെ കാണിക്കുന്ന ഘട്ടങ്ങൾ അനുസരിച്ച് മുന്നോട്ട് പോകുക.";
      langCode = "ml-IN";
    }
    speakDashboard(msg, langCode);
  });
}

const cardCropRecommendation = $("cardCropRecommendation");
if (cardCropRecommendation) {
  cardCropRecommendation.addEventListener("click", () => {
    window.location.href = "crop.html";
  });
}

const cardMarketDemand = $("cardMarketDemand");

if (cardMarketDemand) {
  cardMarketDemand.addEventListener("click", () => {
    window.location.href = "market.html";
  });
}

const cardChatbox = $("cardChatbox");

if (cardChatbox) {
  cardChatbox.addEventListener("click", () => {
    window.location.href = "chat.html";
  });
}

const cardDiseaseDetector = $("cardDiseaseDetector");

if (cardDiseaseDetector) {
  cardDiseaseDetector.addEventListener("click", () => {
    window.location.href = "disease.html";
  });
}

// Selected crop monitoring card
const selectedCropContainer = $("selectedCropContainer");

function getLocalizedCropText(localCrop, lang) {
  const date = new Date(localCrop.at);
  const niceDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const translations = {
    en: {
      sel: `Selected crop: ${localCrop.name}`,
      area: `Area: ${localCrop.acres} acres`,
      desc: `Selected on ${niceDate}. Below is a sample timeline of reminders.`,
      l1: "Sowing Phase",
      l2: "Fertilization",
      l3: "Mid-season Irrigation",
      l4: "Health Scan",
      d1: `<strong>${localCrop.name} Sowing Instructions:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>Soil Prep:</strong> Ensure the land is plowed 2-3 times to achieve a fine tilth.</li>
             <li><strong>Seed Treatment:</strong> Treat seeds with Trichoderma (5g/kg) to prevent soil-borne diseases.</li>
             <li><strong>Spacing:</strong> Maintain a row-to-row distance of 45 cm and a plant-to-plant distance of 15 cm.</li>
             <li><strong>Depth:</strong> Sow seeds exactly 2-3 inches deep to ensure proper germination.</li>
             <li><strong>Moisture:</strong> Apply light irrigation immediately after sowing if the soil lacks natural moisture.</li>
           </ul>`,
      d2: `<strong>${localCrop.name} Fertilization Guide:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>Base Dose:</strong> Apply 50% of the recommended NPK fertilizer right after the first weeding (approx. 20-25 days).</li>
             <li><strong>Application Method:</strong> Use the ring method—distribute fertilizer 2 inches away from the base of the stem to avoid burning the plant roots.</li>
             <li><strong>Micronutrients:</strong> Spray 0.5% Zinc Sulphate if yellowing of lower leaves is observed.</li>
             <li><strong>Organic Booster:</strong> Add neem cake or vermicompost to improve soil aeration and microbial activity.</li>
           </ul>`,
      d3: `<strong> Irrigation Protocol:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>Frequency:</strong> Irrigate every 7-10 days depending on local rainfall and soil moisture retention.</li>
             <li><strong>Critical Stages:</strong> Ensure no water stress occurs during the flowering and grain-filling stages.</li>
             <li><strong>Method:</strong> Prefer drip or sprinkler systems to conserve water. If using flood irrigation, ensure proper drainage to prevent waterlogging.</li>
             <li><strong>Test:</strong> Dig 2 inches into the soil; if it feels powdery and dry, trigger the next irrigation cycle.</li>
           </ul>`,
      d4: `<strong> Health Monitoring:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>Visual Inspection:</strong> Check the underside of leaves for whiteflies, aphids, or fungal spores every 15 days.</li>
             <li><strong>Action:</strong> If pests cross the Economic Threshold Level (ETL), spray Neem oil (10,000 ppm) at 2ml/liter of water.</li>
             <li><strong>Disease Scan:</strong> If you spot brown spots, leaf curling, or yellowing, immediately upload a close-up photo to the <em>Disease Detector</em> tab.</li>
             <li><strong>Weeding:</strong> Keep the field weed-free for the first 45 days to eliminate alternate hosts for pests.</li>
           </ul>`,
      l5: "Flowering & Fruiting",
      d5: `<strong>Flowering Phase Guide:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>Water Management:</strong> Ensure optimal water supply; water stress now can cause severe flower drop.</li>
             <li><strong>Nutrient Spray:</strong> Apply a foliar 19:19:19 NPK spray to boost flower retention.</li>
             <li><strong>Pest Alert:</strong> Monitor closely for fruit borers and blossom midges.</li>
           </ul>`,
      l6: "Harvesting",
      d6: `<strong>Harvesting Protocol:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>Timing:</strong> Harvest when the crop reaches 80-90% maturity to prevent shattering losses.</li>
             <li><strong>Weather Check:</strong> Ensure sunny weather for at least 3 days post-harvest for field drying.</li>
             <li><strong>Equipment:</strong> Clean and sanitize sickles or threshers to prevent disease carry-over.</li>
           </ul>`,
      l7: "Post-Harvest Storage",
      d7: `<strong>Storage Instructions:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>Drying:</strong> Sun-dry the yield until moisture content drops below 10-12%.</li>
             <li><strong>Bagging:</strong> Use clean, aerated gunny bags or hermetic storage bags.</li>
             <li><strong>Facility:</strong> Store in a cool, dry place elevated on wooden pallets to prevent ground moisture absorption.</li>
           </ul>`,
      l8: "Market Price & Selling",
      d8: `<strong>Selling Guidance:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>Market Info:</strong> Check local Mandi prices or national e-NAM portals before selling.</li>
             <li><strong>Grading:</strong> Grade your produce by size and quality to command a premium price.</li>
             <li><strong>Transport:</strong> Arrange direct transport to avoid middlemen commissions.</li>
           </ul>`,
      audio: `You are currently tracking ${localCrop.name} for ${localCrop.acres} acres.`
    },
    te: {
      sel: `ఎంచుకున్న పంట: ${localCrop.name}`,
      area: `విస్తీర్ణం: ${localCrop.acres} ఎకరాలు`,
      desc: `${niceDate}న ఎంచుకోబడింది. సమయపాలన రిమైండర్‌లు:`,
      ...(() => {
        // Phonetic Telegu Audio Map (simplification for TTS)
        const t_audio = {
          a1: "Vithanam natadaniki nela thayaru cheyyandi mariyu 2 nunchi 3 angulala lothulo natandi.",
          a2: "Yabubhai shatham NPK eruvulu vesi mokka kandam nunchi 2 angulala dooram lo undandi.",
          a3: "Aedu nunchi padi rojulaku okasari neeru pettandi.",
          a4: "Aakula aduguna purugulu unnayemo chudandi, avasaramaithe vepa nune kottandi.",
          a5: "Pootha dhashalo neetini baaga andinchandi, pookalu ralipokunda 19 19 19 NPK challeandi.",
          a6: "Panta enabhai shatham pakvaniki vachaka kotha koyandi.",
          a7: "Thadi poyantha varaku yendalopetti goli sanchullo bhadraparachandi.",
          a8: "Ammadaniki mundhu local mandi dharalu kachithanga check cheyyandi."
        };
        return t_audio;
      })(),
      l1: "విత్తే దశ",
      d1: `<strong>${localCrop.name} విత్తే సూచనలు:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>నేల తయారీ:</strong> నేలను 2-3 సార్లు బాగా దున్ని చదును చేయాలి.</li>
             <li><strong>విత్తన శుద్ధి:</strong> మట్టి ద్వారా వ్యాపించే తెగుళ్లను నివారించడానికి ట్రైకోడెర్మాతో (5g/kg) విత్తనాలను శుద్ధి చేయండి.</li>
             <li><strong>దూరం:</strong> వరుసల మధ్య 45 సెం.మీ మరియు మొక్కల మధ్య 15 సెం.మీ దూరం పాటించండి.</li>
             <li><strong>లోతు:</strong> విత్తనాలను కచ్చితంగా 2-3 అంగుళాల లోతులో నాటండి.</li>
             <li><strong>తేమ:</strong> మట్టిలో తేమ లేకపోతే విత్తిన వెంటనే పల్చగా నీరు పారించండి.</li>
           </ul>`,
      l2: "ఎరువుల దరఖాస్తు",
      d2: `<strong>ఎరువుల గైడ్:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>మొదటి విడత:</strong> కలుపు తీసిన తర్వాత (20-25 రోజులకు) 50% NPK ఎరువును వేయండి.</li>
             <li><strong>వేసే విధానం:</strong> వేర్లకు హాని కలగకుండా మొక్క కాండం నుండి 2 అంగుళాల దూరంలో ఎరువును వేయండి.</li>
             <li><strong>సూక్ష్మ పోషకాలు:</strong> ఆకులు పసుపు రంగులోకి మారితే 0.5% జింక్ సల్ఫేట్ పిచికారీ చేయండి.</li>
             <li><strong>సేంద్రీయ ఎరువు:</strong> నేల సారాన్ని పెంచడానికి వేప పిండి లేదా వానపాముల ఎరువును కలపండి.</li>
           </ul>`,
      l3: "మధ్యస్థ నీటిపారుదల",
      d3: `<strong>నీటిపారుదల ప్రోటోకాల్:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>సమయం:</strong> వర్షపాతం మరియు నేల తేమను బట్టి ప్రతి 7-10 రోజులకు ఒకసారి నీరు పెట్టండి.</li>
             <li><strong>ముఖ్య దశలు:</strong> పూత మరియు గింజ పాలు పోసుకునే దశలో నీటి ఎద్దడి లేకుండా చూసుకోండి.</li>
             <li><strong>విధానం:</strong> నీటిని ఆదా చేసేందుకు డ్రిప్ లేదా స్ప్రింక్లర్ పద్ధతులను వాడండి.</li>
             <li><strong>తనిఖీ:</strong> పై 2 అంగుళాల మట్టి పొడిగా ఉంటేనే తదుపరి నీటి తడి ఇవ్వండి.</li>
           </ul>`,
      l4: "ఆరోగ్య స్కాన్",
      d4: `<strong>ఆరోగ్య పర్యవేక్షణ:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>పర్యవేక్షణ:</strong> ప్రతి 15 రోజులకు ఒకసారి ఆకుల అడుగున పురుగులు లేదా తెగులు గుడ్లు ఉన్నాయో లేదో గమనించండి.</li>
             <li><strong>చర్య:</strong> పురుగుల ఉధృతి ఎక్కువగా ఉంటే లీటరు నీటికి 2మి.లీ వేప నూనెను కలిపి పిచికారీ చేయండి.</li>
             <li><strong>స్కాన్:</strong> ఆకులపై మచ్చలు కనిపిస్తే, వెంటనే ఫోటో తీసి <em>వ్యాధి గుర్తింపు</em> ట్యాబ్‌లో అప్‌లోడ్ చేయండి.</li>
             <li><strong>కలుపు నివారణ:</strong> మొదటి 45 రోజుల పాటు పొలంలో కలుపు లేకుండా చూసుకోండి.</li>
           </ul>`,
      l5: "పూత మరియు ఫలదీకరణం",
      d5: `<strong>పూత దశ గైడ్:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>నీటి నిర్వహణ:</strong> సరైన నీరు అందించండి; నీటి ఎద్దడి వల్ల పూత రాలిపోతుంది.</li>
             <li><strong>న్యూట్రియంట్ స్ప్రే:</strong> పూత నిలుపుదల పెంచడానికి 19:19:19 NPK ఫోలియర్ స్ప్రే చేయండి.</li>
             <li><strong>తెగులు అలర్ట్:</strong> పండ్ల తొలుచు పురుగుల కోసం పర్యవేక్షించండి.</li>
           </ul>`,
      l6: "పంట కోత",
      d6: `<strong>కోత ప్రోటోకాల్:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>సమయం:</strong> నష్టాలను నివారించడానికి పంట 80-90% పక్వానికి రాగానే కోయాలి.</li>
             <li><strong>వాతావరణ తనిఖీ:</strong> కోసిన తర్వాత కనీసం 3 రోజులు ఎండ ఉండేలా చూసుకోండి.</li>
             <li><strong>సామగ్రి:</strong> కోత యంత్రాలు లేదా కొడవళ్ళను శుభ్రంగా ఉంచాలి.</li>
           </ul>`,
      l7: "కోత తర్వాత నిల్వ",
      d7: `<strong>నిల్వ సూచనలు:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>ఎండబెట్టడం:</strong> తేమ శాతం 10-12% కంటే తగ్గే వరకు పంటను ఎండబెట్టండి.</li>
             <li><strong>ప్యాకింగ్:</strong> గాలి ఆడే గోనె సంచులను ఉపయోగించండి.</li>
             <li><strong>సౌకర్యం:</strong> నేల నుండి తేమ రాకుండా చెక్క పలకలపై చల్లని, పొడి ప్రదేశంలో నిల్వ చేయండి.</li>
           </ul>`,
      l8: "మార్కెట్ ధర & అమ్మకం",
      d8: `<strong>అమ్మకం మార్గదర్శకం:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>మార్కెట్ సమాచారం:</strong> అమ్మే ముందు స్థానిక మార్కెట్ లేదా ఇ-నామ్ (e-NAM) ధరలను తనిఖీ చేయండి.</li>
             <li><strong>గ్రేడింగ్:</strong> నాణ్యత మరియు పరిమాణం ఆధారంగా పంటను గ్రేడ్ చేసి మంచి ధర పొందండి.</li>
             <li><strong>రవాణా:</strong> మధ్యవర్తుల కమిషన్లు నివారించడానికి నేరుగా రవాణా ఏర్పాటు చేయండి.</li>
           </ul>`,
      audio: `Meeru prastutam ${localCrop.acres} ekaralaku ${localCrop.name} panta ni track chestunnaru.`
    },
    hi: {
      sel: `चुनी हुई फसल: ${localCrop.name}`,
      area: `क्षेत्र: ${localCrop.acres} एकड़`,
      desc: `${niceDate} को चुना गया। समयरेखा अनुस्मारक:`,
      ...(() => {
        const h_audio = {
          a1: "Maidaan ki achchi tarah jootai karen aur beejon ko do se teen inch gehra boen.",
          a2: "Pachaas pratishat NPK urwarak ka prayog tanao se do inch door karen.",
          a3: "Har saat se das din mein sinchai karen, phul aane par paani ki kami na hone de.",
          a4: "Aapke paudon mein keet ya bimari to nahi hai, har pandrah din me jaanch karen.",
          a5: "Phul aane par unhe girne se rokne ke liye uchit khad ka chidkav karen.",
          a6: "Fasal assi pratishat pakne par katai karen.",
          a7: "Anaaj ki nami das pratishat tak kam hone tak dhoop me sukhaye.",
          a8: "Fasal bechne se pahle bazaar me uchit moolya ka pata lagayen."
        };
        return h_audio;
      })(),
      l1: "बुवाई का चरण",
      d1: `<strong>${localCrop.name} बुवाई के निर्देश:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>मिट्टी की तैयारी:</strong> सुनिश्चित करें कि खेत की 2-3 बार अच्छी तरह जुताई की गई हो।</li>
             <li><strong>बीज उपचार:</strong> मिट्टी से होने वाली बीमारियों को रोकने के लिए बीजों को ट्राइकोडर्मा (5g/kg) से उपचारित करें।</li>
             <li><strong>दूरी:</strong> कतार-से-कतार की दूरी 45 सेमी और पौधे-से-पौधे की दूरी 15 सेमी बनाए रखें।</li>
             <li><strong>गहराई:</strong> उचित अंकुरण के लिए बीजों को 2-3 इंच गहरा बोएं।</li>
             <li><strong>नमी:</strong> यदि मिट्टी में प्राकृतिक नमी की कमी हो तो बुवाई के तुरंत बाद हल्की सिंचाई करें।</li>
           </ul>`,
      l2: "उर्वरक आवेदन",
      d2: `<strong>${localCrop.name} उर्वरक गाइड:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>पहली खुराक:</strong> पहली निराई के ठीक बाद (लगभग 20-25 दिन) अनुशंसित NPK उर्वरक का 50% डालें।</li>
             <li><strong>प्रयोग विधि:</strong> उर्वरक को तने से 2 इंच दूर वितरित करें ताकि पौधों की जड़ें जलने से बच सकें।</li>
             <li><strong>सूक्ष्म पोषक तत्व:</strong> यदि निचली पत्तियां पीली पड़ रही हों तो 0.5% जिंक सल्फेट का छिड़काव करें।</li>
             <li><strong>जैविक खाद:</strong> मिट्टी के वातन को बेहतर बनाने के लिए नीम की खली या वर्मीकम्पोस्ट मिलाएं।</li>
           </ul>`,
      l3: "मध्य-मौसम सिंचाई",
      d3: `<strong>सिंचाई प्रोटोकॉल:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>आवृत्ति:</strong> स्थानीय वर्षा और मिट्टी की नमी के आधार पर हर 7-10 दिनों में सिंचाई करें।</li>
             <li><strong>महत्वपूर्ण चरण:</strong> फूल आने और दाना भरने के चरण के दौरान पानी की कमी न होने दें।</li>
             <li><strong>जाँच:</strong> मिट्टी में 2 इंच गहरा खोदकर देखें; यदि यह सूखी और भुरभुरी लगे, तो अगला सिंचाई चक्र शुरू करें।</li>
           </ul>`,
      l4: "स्वास्थ्य निगरानी",
      d4: `<strong>स्वास्थ्य निगरानी:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>दृश्य निरीक्षण:</strong> सफेद मक्खियों, एफिड्स या फंगल बीजाणुओं के लिए हर 15 दिन में पत्तियों के निचले हिस्से की जाँच करें।</li>
             <li><strong>कार्रवाई:</strong> यदि कीट आर्थिक सीमा पार कर जाते हैं, तो नीम के तेल (2ml/liter) का छिड़काव करें।</li>
             <li><strong>रोग स्कैन:</strong> यदि भूरे धब्बे दिखाई दें, तो तुरंत एक क्लोज़-अप फोटो लें और <em>रोग पहचान</em> टैब पर अपलोड करें।</li>
             <li><strong>निराई:</strong> कीटों के वैकल्पिक मेजबानों को खत्म करने के लिए पहले 45 दिनों तक खेत को खरपतवार मुक्त रखें।</li>
           </ul>`,
      l5: "फूल और फलना",
      d5: `<strong>फूल आने का चरण:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>जल प्रबंधन:</strong> इष्टतम पानी सुनिश्चित करें; पानी की कमी से फूल गिर सकते हैं।</li>
             <li><strong>पोषक तत्व:</strong> फूल टिकने के लिए 19:19:19 NPK का छिड़काव करें।</li>
             <li><strong>कीट चेतावनी:</strong> फल छेदक कीटों के लिए कड़ी निगरानी रखें।</li>
           </ul>`,
      l6: "कटाई",
      d6: `<strong>कटाई प्रोटोकॉल:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>समय:</strong> नुकसान से बचने के लिए फसल 80-90% पकने पर ही काटें।</li>
             <li><strong>मौसम:</strong> खेत में सुखाने के लिए कटाई के बाद कम से कम 3 दिन तक धूप वाला मौसम सुनिश्चित करें।</li>
             <li><strong>उपकरण:</strong> बीमारियों को फैलने से रोकने के लिए दरांती या थ्रेशर को साफ और सैनिटाइज करें।</li>
           </ul>`,
      l7: "भंडारण",
      d7: `<strong>भंडारण के निर्देश:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>सुखाना:</strong> नमी की मात्रा 10-12% से कम होने तक उपज को धूप में सुखाएं।</li>
             <li><strong>बैगिंग:</strong> साफ और हवादार जूट के बोरे या हेर्मेटिक भंडारण बैग का उपयोग करें।</li>
             <li><strong>सुविधा:</strong> जमीन की नमी सोखने से रोकने के लिए लकड़ी के पैलेट पर ठंडी, सूखी जगह में स्टोर करें।</li>
           </ul>`,
      l8: "बाज़ार मूल्य और बिक्री",
      d8: `<strong>बिक्री मार्गदर्शन:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>बाजार की जानकारी:</strong> बेचने से पहले स्थानीय मंडी की कीमतों या ई-नाम पोर्टल की जाँच करें।</li>
             <li><strong>ग्रेडिंग:</strong> प्रीमियम कीमत पाने के लिए अपनी उपज को आकार और गुणवत्ता के आधार पर ग्रेड करें।</li>
             <li><strong>परिवहन:</strong> बिचौलियों के कमीशन से बचने के लिए सीधे परिवहन की व्यवस्था करें।</li>
           </ul>`,
      audio: `Aap vartamaan mein ${localCrop.acres} ekad ke liye ${localCrop.name} fasal ko track kar rahe hain.`
    },
    mr: {
      sel: `निवडलेले पीक: ${localCrop.name}`,
      area: `क्षेत्र: ${localCrop.acres} एकर`,
      desc: `${niceDate} ला निवडले. टाइमलाइन स्मरणपत्रे:`,
      ...(() => {
        const m_audio = {
          a1: "Jaminichi changli tayari kara aani biyane don te teen inch khol pera.",
          a2: "Pannas takke NPK khat ropapasun don inch antaravar dya.",
          a3: "Dar saat te daha divasanni pani dya, fulorayachya veli pani kami padu deu naka.",
          a4: "Kid kiva rog aslyas tyachi pahani kara, aani kadulimbache tel fawara.",
          a5: "Fule ananya sathi yogya khatanchi fawarani kara.",
          a6: "Pik aynshi takke pakva jhalya var kadhni kara.",
          a7: "Oolawa daha takke hoiparyant dhania unhat valvwa.",
          a8: "Viknya purvi sthanik bajarbhav nakki tapasa."
        };
        return m_audio;
      })(),
      l1: "पेरणीचा टप्पा",
      d1: `<strong>${localCrop.name} पेरणीच्या सूचना:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>मातीची तयारी:</strong> जमीन 2-3 वेळा चांगली नांगरलेली असल्याची खात्री करा.</li>
             <li><strong>बीजप्रक्रिया:</strong> मातीतून पसरणारे रोग टाळण्यासाठी बियांवर ट्रायकोडर्माची (5g/kg) प्रक्रिया करा.</li>
             <li><strong>अंतर:</strong> दोन ओळींमधील अंतर 45 सेमी आणि दोन रोपांमधील अंतर 15 सेमी असावे.</li>
             <li><strong>खोली:</strong> योग्य उगवणीसाठी बियाणे अचूक 2-3 इंच खोलीवर पेरा.</li>
             <li><strong>लावा:</strong> जमिनीत पुरेसा ओलावा नसल्यास पेरणीनंतर लगेच हलके पाणी द्या.</li>
           </ul>`,
      l2: "खत अर्ज",
      d2: `<strong>${localCrop.name} खत व्यवस्थापन:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>पहिला डोस:</strong> पहिल्या खुरपणीनंतर (अंदाजे 20-25 दिवसांनी) शिफारस केलेल्या NPK खताचा 50% भाग द्या.</li>
             <li><strong>खत देण्याची पद्धत:</strong> मुळे जळू नयेत म्हणून रोपाच्या खोडापासून 2 इंच अंतरावर खत द्या.</li>
             <li><strong>सूक्ष्म अन्नद्रव्ये:</strong> खालची पाने पिवळी पडत असल्यास 0.5% झिंक सल्फेटची फवारणी करा.</li>
           </ul>`,
      l3: "मध्य-हंगामी सिंचन",
      d3: `<strong>सिंचन प्रोटोकॉल:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>वेळापत्रक:</strong> स्थानिक पर्जन्यमान आणि मातीच्या ओलाव्यानुसार दर 7-10 दिवसांनी पाणी द्या.</li>
             <li><strong>महत्वाचे टप्पे:</strong> फुले येण्याच्या आणि दाणे भरण्याच्या वेळी पाण्याचे दुर्भिक्ष होणार नाही याची काळजी घ्या.</li>
             <li><strong>तपासणी:</strong> मातीत 2 इंच खोदल्यानंतर कोरडी वाटली तरच पुढील पाणी द्या.</li>
           </ul>`,
      l4: "आरोग्य स्कॅन",
      d4: `<strong>आरोग्य देखरेख:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>तपासणी:</strong> दर 15 दिवसांनी पांढरी माशी किंवा बुरशीसाठी पानांची खालची बाजू तपासा.</li>
             <li><strong>उपाय:</strong> कीटकांचा प्रादुर्भाव वाढल्यास प्रति लिटर पाण्यात 2 मिली कडुलिंबाचे तेल मिसळून फवारणी करा.</li>
             <li><strong>रोग स्कॅन:</strong> तपकिरी डाग आढळल्यास, फोटो काढा आणि तो त्वरित <em>रोग ओळख</em> टॅबवर अपलोड करा.</li>
           </ul>`,
      l5: "फुलोरा आणि फळधारणा",
      d5: `<strong>${localCrop.name} फुलोरा टप्पा:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>पाणी व्यवस्थापन:</strong> पाण्याचा योग्य पुरवठा करा; पाण्याच्या कमतरतेमुळे फुले गळू शकतात।</li>
             <li><strong>अन्नद्रव्ये फवारणी:</strong> फुले टिकवण्यासाठी १९:१९:१९ NPK ची फवारणी करा।</li>
             <li><strong>कीड इशारा:</strong> फळे पोखरणारी अळी आणि इतर अळींसाठी बारीक लक्ष ठेवा।</li>
           </ul>`,
      l6: "काढणी",
      d6: `<strong>काढणी प्रोटोकॉल:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>वेळ:</strong> नुकसान टाळण्यासाठी पीक ८०-९०% पक्व झाल्यावरच काढा।</li>
             <li><strong>हवामान:</strong> शेतात सुकवण्यासाठी काढणीनंतर किमान ३ दिवस ऊन असण्याची खात्री करा।</li>
             <li><strong>उपकरणे:</strong> रोगाचा प्रसार टाळण्यासाठी विळे आणि थ्रेशर स्वच्छ करा।</li>
           </ul>`,
      l7: "साठवणूक",
      d7: `<strong>साठवणुकीच्या सूचना:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>वाळवणे:</strong> ओलावा १०-१२% पेक्षा कमी होईपर्यंत धान्य उन्हात वाळवा।</li>
             <li><strong>पॅकिंग:</strong> स्वच्छ आणि हवेशीर पोती वापरा।</li>
             <li><strong>जागा:</strong> जमिनीतील ओलावा टाळण्यासाठी लाकडी फळ्यांवर थंड आणि कोरड्या जागी साठवा।</li>
           </ul>`,
      l8: "बाजारभाव आणि विक्री",
      d8: `<strong>विक्री मार्गदर्शन:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>बाजार माहिती:</strong> विकण्यापूर्वी स्थानिक मंडईतील भाव किंवा ई-नाम पोर्टल तपासा।</li>
             <li><strong>प्रतवारी (ग्रेडिंग):</strong> चांगला भाव मिळवण्यासाठी दर्जा आणि आकारानुसार प्रतवारी करा।</li>
             <li><strong>वाहतूक:</strong> मध्यस्थाचे कमिशन टाळण्यासाठी थेट वाहतुकीची व्यवस्था करा।</li>
           </ul>`,
      audio: `Tumhi sadhya ${localCrop.acres} ekar sathi ${localCrop.name} peek track karat aahat.`
    },
    ml: {
      sel: `തിരഞ്ഞെടുത്ത വിള: ${localCrop.name}`,
      area: `വിസ്തീർണ്ണം: ${localCrop.acres} ഏക്കർ`,
      desc: `${niceDate} ൽ തെരഞ്ഞെടുത്തു. ടൈംലൈൻ ഓർമ്മപ്പെടുത്തലുകൾ:`,
      ...(() => {
        const ml_audio = {
          a1: "Mannu nannayi orukki randu muthal moonnu inch aazhathil vithu vithakkuka.",
          a2: "Anpathu shathamanam NPK valam chediyude thandil ninnum randu inch akalathil iduka.",
          a3: "Ezhu muthal pathu divasam koodumbol nanakkuka.",
          a4: "Keedangaludo rogangaludo saannidhyam undenna ariyuvanaayi onnamathai parashodikkuka.",
          a5: "Pookkanum kaaykkanum aavashyamaaya valaprayogam nadathuka.",
          a6: "Enpathu shathamanam mooppethumbol vilavedukkuka.",
          a7: "Eerppam pathu shathamanthil thaazhe aakunathu vare unakka.",
          a8: "Vilkunathin munpayi pradeshiya thakkali vila thalam parashodikkuka."
        };
        return ml_audio;
      })(),
      l1: "വിതയ്ക്കുന്ന ഘട്ടം",
      d1: `<strong>${localCrop.name} വിതയ്ക്കുന്നതിനുള്ള നിർദ്ദേശങ്ങൾ:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>മണ്ണൊരുക്കൽ:</strong> മണ്ണ് 2-3 തവണ നന്നായി ഉഴുതുമറിച്ചതാണെന്ന് ഉറപ്പാക്കുക.</li>
             <li><strong>വിത്ത് പരിചരണം:</strong> മണ്ണിലൂടെ പകരുന്ന രോഗങ്ങളെ തടയാൻ ട്രൈക്കോഡെർമ (5g/kg) ഉപയോഗിച്ച് വിത്തുകൾ പരിചരിക്കുക.</li>
             <li><strong>അകലം:</strong> വരികൾ തമ്മിൽ 45 സെന്റീമീറ്ററും ചെടികൾ തമ്മിൽ 15 സെന്റീമീറ്ററും അകലം പാലിക്കുക.</li>
             <li><strong>ആഴം:</strong> നല്ല മുളയ്ക്കൽ ഉറപ്പാക്കാൻ 2-3 ഇഞ്ച് ആഴത്തിൽ വിത്ത് വിതയ്ക്കുക.</li>
           </ul>`,
      l2: "വളം പ്രയോഗിക്കൽ",
      d2: `<strong>${localCrop.name} വളപ്രയോഗ മാർഗ്ഗനിർദ്ദേശം:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>അടിസ്ഥാന വളം:</strong> ആദ്യത്തെ കളപറിക്കലിനു ശേഷം (20-25 ദിവസങ്ങൾ) ശുപാർശ ചെയ്യുന്ന NPK വളത്തിന്റെ 50% നൽകുക.</li>
             <li><strong>പ്രയോഗരീതി:</strong> വേരുകൾ കരിഞ്ഞുപോകാതിരിക്കാൻ തണ്ടിൽ നിന്നും 2 ഇഞ്ച് അകലത്തിൽ വളം നൽകുക.</li>
             <li><strong>സൂക്ഷ്മ മൂലകങ്ങൾ:</strong> ഇലകളിൽ മഞ്ഞളിപ്പ് കണ്ടാൽ 0.5% സിങ്ക് സൾഫേറ്റ് തളിക്കുക.</li>
           </ul>`,
      l3: "മധ്യകാല ജലസേചനം",
      d3: `<strong>ജലസേചന പരിശോധന:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>സമയക്രമം:</strong> മഴയും മണ്ണിലെ ഈർപ്പവും അനുസരിച്ച് എല്ലാ 7-10 ദിവസത്തിലും ജലസേചനം നടത്തുക.</li>
             <li><strong>പ്രധാന ഘട്ടങ്ങൾ:</strong> പൂവിടുന്ന സമയത്തും കതിരിടുന്ന സമയത്തും ജലക്ഷാമം ഉണ്ടാകുന്നില്ലെന്ന് ഉറപ്പാക്കുക.</li>
             <li><strong>പരിശോധന:</strong> മണ്ണിൽ 2 ഇഞ്ച് കുഴിച്ചു നോക്കുമ്പോൾ ഉണങ്ങിയതാണെങ്കിൽ മാത്രം അടുത്ത നനവ് നൽകുക.</li>
           </ul>`,
      l4: "ആരോഗ്യ സ്കാൻ",
      d4: `<strong>ആരോഗ്യ നിരീക്ഷണം:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>പരിശോധന:</strong> എല്ലാ 15 ദിവസത്തിലും ഇലകളുടെ അടിഭാഗത്ത് കീടങ്ങളോ കുമിളുകളോ ഉണ്ടോയെന്ന് പരിശോധിക്കുക.</li>
             <li><strong>പ്രതിവിധി:</strong> കീടങ്ങൾ കൂടുതലായാൽ 1 ലിറ്റർ വെള്ളത്തിൽ 2 മി.ലി വേപ്പെണ്ണ കലക്കി തളിക്കുക.</li>
             <li><strong>രോഗ പരിശോധന:</strong> തവിട്ടു நிறത്തിലുള്ള പാടുകൾ കണ്ടാൽ ഉടനടി <em>രോഗ നിർണ്ണയ</em> ടാബിൽ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.</li>
           </ul>`,
      l5: "പൂക്കുന്നതും കായ്ക്കുന്നതും",
      d5: `<strong>പൂക്കുന്ന ഘട്ടം:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>ജലസേചനം:</strong> കൃത്യമായി വെള്ളം നൽകുക; വെള്ളത്തിന്റെ കുറവ് പൂക്കൾ കൊഴിയാൻ കാരണമാകും.</li>
             <li><strong>വളപ്രയോഗം:</strong> പൂക്കൾ കൊഴിയാതിരിക്കാൻ 19:19:19 NPK തളിക്കുക.</li>
             <li><strong>കീട മുന്നറിയിപ്പ്:</strong> കായ തുരപ്പൻ പുഴുക്കളെ സൂക്ഷ്മമായി നിരീക്ഷിക്കുക.</li>
           </ul>`,
      l6: "വിളവെടുപ്പ്",
      d6: `<strong>വിളവെടുപ്പ് പ്രോട്ടോക്കോൾ:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>സമയം:</strong> നഷ്ടം ഒഴിവാക്കാൻ വിളവ് 80-90% മൂപ്പെത്തുമ്പോൾ വിളവെടുക്കുക.</li>
             <li><strong>കാലാവസ്ഥ:</strong> വിളവെടുത്ത ശേഷം പാടത്ത് ഉണക്കാൻ കുറഞ്ഞത് 3 ദിവസം നല്ല വെയിലുണ്ടെന്ന് ഉറപ്പാക്കുക.</li>
             <li><strong>ഉപകരണങ്ങൾ:</strong> രോഗപകർച്ച തടയാൻ അരിവാളും മറ്റ് ഉപകരണങ്ങളും വൃത്തിയാക്കി ഉപയോഗിക്കുക.</li>
           </ul>`,
      l7: "സംഭരണം",
      d7: `<strong>സംഭരണ നിർദ്ദേശങ്ങൾ:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>ഉണക്കൽ:</strong> ഈർപ്പം 10-12% ത്തിൽ താഴെയാകുന്നതുവരെ വിളകൾ വെയിലത്ത് ഉണക്കുക.</li>
             <li><strong>പാക്കിംഗ്:</strong> നല്ല വായു സഞ്ചാരമുള്ള ചാക്കുകൾ ഉപയോഗിക്കുക.</li>
             <li><strong>സ്ഥലം:</strong> നിലത്തുനിന്നും തണുപ്പുതട്ടാതിരിക്കാൻ മരപ്പലകകൾക്ക് മുകളിൽ ഉണങ്ങിയ സ്ഥലത്ത് സൂക്ഷിക്കുക.</li>
           </ul>`,
      l8: "വിപണി വില & വിൽപ്പന",
      d8: `<strong>വിൽപ്പന മാർഗ്ഗനിർദ്ദേശം:</strong>
           <ul style="margin-top:0.5rem; padding-left:1.2rem;">
             <li><strong>വിപണി വിവരങ്ങൾ:</strong> വിൽക്കുന്നതിന് മുൻപ് പ്രാദേശിക വിപണി വില അല്ലെങ്കിൽ ഇ-നാം (e-NAM) പരിശോധിക്കുക.</li>
             <li><strong>ഗ്രേഡിംഗ്:</strong> മികച്ച വില ലഭിക്കാൻ കായ്കളുടെ വലുപ്പവും ഗുണനിലവാരവും നോക്കി തരംതിരിക്കുക.</li>
             <li><strong>ഗതാഗതം:</strong> ഇടനിലക്കാരുടെ കമ്മീഷൻ ഒഴിവാക്കാൻ നേരിട്ട് വിപണിയിലെത്തിക്കാൻ ശ്രമിക്കുക.</li>
           </ul>`,
      audio: `Ningal ippol ${localCrop.acres} ekkar sthalathu ${localCrop.name} vila track cheyyukayaanu.`
    }
  };

  return translations[lang] || translations.en;
}

function generateCropTimelineHTML(cropSelection, isExpanded, index) {
  const cropName = cropSelection.crop || cropSelection.name || "";
  const acres = cropSelection.acres || 1.0;
  const at = cropSelection.at || cropSelection.createdAt || new Date().toISOString();

  const localizedCrop = getLocalizedCropName(cropName, farmerLang);
  const localizedAcres = localizeText(acres, farmerLang);

  // Create a localized copy of local object for getLocalizedCropText
  const localCopy = { name: localizedCrop, acres: localizedAcres, at };
  const t = getLocalizedCropText(localCopy, farmerLang);

  const now = Date.now();
  const then = new Date(at).getTime();
  const daysElapsed = Math.floor((now - then) / (1000 * 3600 * 24));

  // Define stage boundaries
  const s1Passed = daysElapsed >= 0;
  const s2Passed = daysElapsed >= 20;
  const s3Passed = daysElapsed >= 35;
  const s4Passed = daysElapsed >= 50;
  const s5Passed = daysElapsed >= 65;
  const s6Passed = daysElapsed >= 90;
  const s7Passed = daysElapsed >= 105;
  const s8Passed = daysElapsed >= 120;

  const s1Class = s2Passed ? "completed" : (s1Passed ? "active" : "");
  const s2Class = s3Passed ? "completed" : (s2Passed ? "active" : "");
  const s3Class = s4Passed ? "completed" : (s3Passed ? "active" : "");
  const s4Class = s5Passed ? "completed" : (s4Passed ? "active" : "");
  const s5Class = s6Passed ? "completed" : (s5Passed ? "active" : "");
  const s6Class = s7Passed ? "completed" : (s6Passed ? "active" : "");
  const s7Class = s8Passed ? "completed" : (s7Passed ? "active" : "");
  const s8Class = s8Passed ? "completed" : "";

  // EN Audio generator mapping
  const enAudioMap = {
    a1: "Ensure the soil is properly prepared and seeds are sown at a depth of 2 to 3 inches.",
    a2: "Apply 50 percent NPK fertilizer at 2 inches away from the plant stem.",
    a3: "Irrigate every 7 to 10 days, avoiding water scarcity during flowering.",
    a4: "Check for pests and diseases regularly, and act if economic threshold passes.",
    a5: "Ensure optimal water supply to prevent flower drop.",
    a6: "Harvest crop upon reaching 80 to 90 percent maturity.",
    a7: "Dry your yield until moisture content drops below 10 percent.",
    a8: "Check current market prices locally before selling."
  };

  const a1 = t.a1 || enAudioMap.a1;
  const a2 = t.a2 || enAudioMap.a2;
  const a3 = t.a3 || enAudioMap.a3;
  const a4 = t.a4 || enAudioMap.a4;
  const a5 = t.a5 || enAudioMap.a5;
  const a6 = t.a6 || enAudioMap.a6;
  const a7 = t.a7 || enAudioMap.a7;
  const a8 = t.a8 || enAudioMap.a8;

  // Localize numerical contents inside templates dynamically
  const d1 = localizeText(t.d1, farmerLang);
  const d2 = localizeText(t.d2, farmerLang);
  const d3 = localizeText(t.d3, farmerLang);
  const d4 = localizeText(t.d4, farmerLang);
  const d5 = localizeText(t.d5, farmerLang);
  const d6 = localizeText(t.d6, farmerLang);
  const d7 = localizeText(t.d7, farmerLang);
  const d8 = localizeText(t.d8, farmerLang);

  const dayLabel = farmerLang === 'te' ? 'రోజు' : farmerLang === 'hi' ? 'दिन' : farmerLang === 'mr' ? 'दिवस' : farmerLang === 'ml' ? 'ദിവസം' : 'Day';
  const acresLabel = farmerLang === 'te' ? 'ఎకరాలు' : farmerLang === 'hi' ? 'एकड़' : farmerLang === 'mr' ? 'एकड' : farmerLang === 'ml' ? 'ഏക്കർ' : 'Acres';

  // Render collapsible crop container
  return `
    <div class="crop-monitor-panel" data-index="${index}" style="margin-bottom: 1.5rem; border: var(--card-border); border-radius: var(--radius-md); background: var(--surface-color); overflow: hidden;">
      <div class="crop-monitor-panel-header" style="padding: 1rem; background: var(--primary-light); display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;">
        <div>
          <h3 style="margin: 0; color: var(--text-dark); font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" style="color: var(--primary-dark);"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            ${localizedCrop.toUpperCase()} (${localizedAcres} ${acresLabel})
          </h3>
          <p style="margin: 0.2rem 0 0; font-size: 0.8rem; color: var(--text-muted);">Selected on ${localizeText(new Date(at).toLocaleDateString(), farmerLang)}</p>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button class="remove-crop-btn" data-crop="${cropName}" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; border: 1px solid var(--primary); color: var(--primary); border-radius: 20px; background: white; font-weight: 600; cursor: pointer; outline: none; transition: all 0.2s;">Remove</button>
          <span class="chevron" style="transition: transform 0.2s; transform: ${isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}; color: var(--primary-dark); font-weight: bold; font-size: 1.2rem;">▼</span>
        </div>
      </div>
      <div class="crop-monitor-panel-content" style="padding: 1rem; display: ${isExpanded ? 'block' : 'none'};">
        <ul class="tracker-timeline">
          <li class="tracker-step ${s1Class}">
            <div class="tracker-icon">${localizeText(1, farmerLang)}</div>
            <div class="tracker-content clickable">
              <div class="tracker-header-flex">
                <div class="tracker-title">${t.l1}</div>
                <button class="tracker-audio-btn" data-audio="${a1}" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> Listen</button>
              </div>
              <p class="tracker-desc" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${dayLabel} ${localizeText('0-7', farmerLang)}</p>
              <div class="tracker-details">${d1}</div>
            </div>
          </li>
          <li class="tracker-step ${s2Class}">
            <div class="tracker-icon">${localizeText(2, farmerLang)}</div>
            <div class="tracker-content clickable">
              <div class="tracker-header-flex">
                <div class="tracker-title">${t.l2}</div>
                <button class="tracker-audio-btn" data-audio="${a2}" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> Listen</button>
              </div>
              <p class="tracker-desc" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${dayLabel} ${localizeText('20-25', farmerLang)}</p>
              <div class="tracker-details">${d2}</div>
            </div>
          </li>
          <li class="tracker-step ${s3Class}">
            <div class="tracker-icon">${localizeText(3, farmerLang)}</div>
            <div class="tracker-content clickable">
              <div class="tracker-header-flex">
                <div class="tracker-title">${t.l3}</div>
                <button class="tracker-audio-btn" data-audio="${a3}" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> Listen</button>
              </div>
              <p class="tracker-desc" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${dayLabel} ${localizeText('35-45', farmerLang)}</p>
              <div class="tracker-details">${d3}</div>
            </div>
          </li>
          <li class="tracker-step ${s4Class}">
            <div class="tracker-icon">${localizeText(4, farmerLang)}</div>
            <div class="tracker-content clickable">
              <div class="tracker-header-flex">
                <div class="tracker-title">${t.l4}</div>
                <button class="tracker-audio-btn" data-audio="${a4}" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> Listen</button>
              </div>
              <p class="tracker-desc" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${dayLabel} ${localizeText('50+', farmerLang)}</p>
              <div class="tracker-details">${d4}</div>
            </div>
          </li>
          <li class="tracker-step ${s5Class}">
            <div class="tracker-icon">${localizeText(5, farmerLang)}</div>
            <div class="tracker-content clickable">
              <div class="tracker-header-flex">
                <div class="tracker-title">${t.l5}</div>
                <button class="tracker-audio-btn" data-audio="${a5}" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> Listen</button>
              </div>
              <p class="tracker-desc" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${dayLabel} ${localizeText('65-80', farmerLang)}</p>
              <div class="tracker-details">${d5}</div>
            </div>
          </li>
          <li class="tracker-step ${s6Class}">
            <div class="tracker-icon">${localizeText(6, farmerLang)}</div>
            <div class="tracker-content clickable">
              <div class="tracker-header-flex">
                <div class="tracker-title">${t.l6}</div>
                <button class="tracker-audio-btn" data-audio="${a6}" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> Listen</button>
              </div>
              <p class="tracker-desc" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${dayLabel} ${localizeText('90-100', farmerLang)}</p>
              <div class="tracker-details">${d6}</div>
            </div>
          </li>
          <li class="tracker-step ${s7Class}">
            <div class="tracker-icon">${localizeText(7, farmerLang)}</div>
            <div class="tracker-content clickable">
              <div class="tracker-header-flex">
                <div class="tracker-title">${t.l7}</div>
                <button class="tracker-audio-btn" data-audio="${a7}" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> Listen</button>
              </div>
              <p class="tracker-desc" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${dayLabel} ${localizeText('105+', farmerLang)}</p>
              <div class="tracker-details">${d7}</div>
            </div>
          </li>
          <li class="tracker-step ${s8Class}">
            <div class="tracker-icon">${localizeText(8, farmerLang)}</div>
            <div class="tracker-content clickable">
              <div class="tracker-header-flex">
                <div class="tracker-title">${t.l8}</div>
                <button class="tracker-audio-btn" data-audio="${a8}" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> Listen</button>
              </div>
              <p class="tracker-desc" style="display: inline-flex; align-items: center; gap: 0.25rem;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${farmerLang === 'te' ? 'మార్కెట్ విక్రయం' : farmerLang === 'hi' ? 'बाजार बिक्री' : farmerLang === 'mr' ? 'बाजार विक्री' : farmerLang === 'ml' ? 'വിപണി വിൽപ്പന' : 'Market Sale'}</p>
              <div class="tracker-details">${d8}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `;
}

function bindCollapsibleTimelineListeners() {
  requestAnimationFrame(() => {
    // 1. Audio buttons
    const audioBtns = selectedCropContainer.querySelectorAll('.tracker-audio-btn');
    audioBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          return;
        }
        const msg = e.currentTarget.getAttribute('data-audio');
        if (!msg || !("speechSynthesis" in window)) return;

        const langMap = { en: "en-IN", te: "te-IN", hi: "hi-IN", mr: "mr-IN", ml: "ml-IN" };
        speakDashboard(msg, langMap[farmerLang]);
      });
    });

    // 2. Expand steps inside tracker
    const trackerContents = selectedCropContainer.querySelectorAll('.tracker-content.clickable');
    trackerContents.forEach(content => {
      content.addEventListener('click', (e) => {
        const stepParent = e.currentTarget.closest('.tracker-step');
        if (stepParent) {
          stepParent.classList.toggle('expanded');
        }
      });
    });

    // 3. Expand panels for crops
    const panelHeaders = selectedCropContainer.querySelectorAll('.crop-monitor-panel-header');
    panelHeaders.forEach(header => {
      header.addEventListener('click', (e) => {
        const panel = e.currentTarget.closest('.crop-monitor-panel');
        const content = panel.querySelector('.crop-monitor-panel-content');
        const chevron = panel.querySelector('.chevron');
        const index = parseInt(panel.getAttribute('data-index'));

        const isCurrentlyVisible = content.style.display === 'block';
        content.style.display = isCurrentlyVisible ? 'none' : 'block';
        chevron.style.transform = isCurrentlyVisible ? 'rotate(0deg)' : 'rotate(180deg)';

        if (!isCurrentlyVisible) {
          // Set as active expanded index for Read Aloud button
          window._activeExpandedCropIndex = index;
          
          // Collapse other panels to keep UI clean (accordion style)
          const allPanels = selectedCropContainer.querySelectorAll('.crop-monitor-panel');
          allPanels.forEach(p => {
            const pIdx = parseInt(p.getAttribute('data-index'));
            if (pIdx !== index) {
              p.querySelector('.crop-monitor-panel-content').style.display = 'none';
              p.querySelector('.chevron').style.transform = 'rotate(0deg)';
            }
          });
        }
      });
    });

    // 4. Remove crop buttons
    const removeBtns = selectedCropContainer.querySelectorAll('.remove-crop-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cropName = e.currentTarget.getAttribute('data-crop');
        if (!cropName) return;

        const confirmModal = document.getElementById("confirmRemoveModal");
        const confirmCropText = document.getElementById("confirmRemoveCropName");
        if (confirmModal && confirmCropText) {
          confirmCropText.textContent = cropName.toUpperCase();
          confirmModal.style.display = "flex";
          confirmModal.classList.remove("hidden");
        }

        const okBtn = document.getElementById("okRemoveBtn");
        const cancelBtn = document.getElementById("cancelRemoveBtn");

        // Clone okBtn to strip old listeners
        const newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);

        newOkBtn.addEventListener("click", async () => {
          confirmModal.style.display = "none";
          confirmModal.classList.add("hidden");

          let removedLocally = false;
          const sessionToken = localStorage.getItem("sessionToken");
          if (sessionToken) {
            try {
              const res = await fetch("/api/deselect-crop", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${sessionToken}`
                },
                body: JSON.stringify({ crop: cropName })
              });
              if (res.ok) {
                const data = await res.json();
                if (data && data.ok) {
                  localStorage.setItem("selectedCrops", JSON.stringify(data.selections));
                  const legacy = JSON.parse(localStorage.getItem("selectedCrop") || "null");
                  if (legacy && legacy.name && legacy.name.toLowerCase() === cropName.toLowerCase()) {
                    localStorage.removeItem("selectedCrop");
                  }
                  await updateSelectedCropCard();
                  removedLocally = true;
                }
              }
            } catch (err) {
              console.error("Failed to deselect crop:", err);
            }
          }

          if (!removedLocally) {
            let cropsList = JSON.parse(localStorage.getItem("selectedCrops") || "[]");
            cropsList = cropsList.filter(c => (c.crop || c.name || "").toLowerCase() !== cropName.toLowerCase());
            localStorage.setItem("selectedCrops", JSON.stringify(cropsList));
            
            const legacy = JSON.parse(localStorage.getItem("selectedCrop") || "null");
            if (legacy && legacy.name && legacy.name.toLowerCase() === cropName.toLowerCase()) {
              localStorage.removeItem("selectedCrop");
            }
            await updateSelectedCropCard();
          }
        });

        // Cancel button hides modal
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener("click", () => {
          confirmModal.style.display = "none";
          confirmModal.classList.add("hidden");
        });
      });
    });
  });
}

async function updateSelectedCropCard() {
  const sessionToken = localStorage.getItem("sessionToken");
  if (sessionToken) {
    try {
      const res = await fetch("/api/selected-crop", {
        headers: {
          "Authorization": `Bearer ${sessionToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          if (data.selections) {
            localStorage.setItem("selectedCrops", JSON.stringify(data.selections));
          }
          if (data.selection) {
            localStorage.setItem("selectedCrop", JSON.stringify(data.selection));
          } else {
            localStorage.removeItem("selectedCrop");
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch selected crop from server, falling back to local:", e);
    }
  }

  let cropsList = [];
  try {
    cropsList = JSON.parse(localStorage.getItem("selectedCrops") || "[]");
  } catch { }

  if (!cropsList || !cropsList.length) {
    // Check legacy selectedCrop object
    let legacy = null;
    try {
      legacy = JSON.parse(localStorage.getItem("selectedCrop") || "null");
    } catch {}
    if (legacy && legacy.name) {
      cropsList = [{ crop: legacy.name, acres: legacy.acres, createdAt: legacy.at }];
    }
  }

  if (!cropsList || !cropsList.length) {
    const emptyMsgs = {
      en: "No crop selected yet.",
      te: "ఇంకా ఎలాంటి పంట ఎంచుకోలేదు.",
      hi: "अभी तक कोई फसल नहीं चुनी गई है।",
      mr: "अद्याप कोणतेही पीक निवडलेले नाही.",
      ml: "ഇതുവരെ വിളയൊന്നും തിരഞ്ഞെടുത്തിട്ടില്ല."
    };
    if (cardSelectedCropBadge) {
      cardSelectedCropBadge.textContent = emptyMsgs[farmerLang] || emptyMsgs.en;
      cardSelectedCropBadge.className = "card-status-badge inactive";
    }
    if (selectedCropContainer) {
      selectedCropContainer.innerHTML = `<p class="muted">${emptyMsgs[farmerLang] || emptyMsgs.en}</p>`;
    }
    window._currentAudioCropText = { en: "No crop selected yet.", te: "Eanka yelanti panta enchukoledu.", hi: "Abhi tak koi fasal nahi chuni gayi hai.", mr: "Adyap kontehi peek nivadlele nahi.", ml: "Ithuvare vilayonnum thiranjeduthittilla." };
    return;
  }

  // Update dashboard card details
  if (cardSelectedCropBadge) {
    const cropNames = cropsList.map(c => (c.crop || c.name || "").toUpperCase());
    if (cropNames.length <= 2) {
      cardSelectedCropBadge.textContent = `${cropNames.join(", ")} (Active)`;
    } else {
      cardSelectedCropBadge.textContent = `${cropNames.slice(0, 2).join(", ")} + ${cropNames.length - 2} more (Active)`;
    }
    cardSelectedCropBadge.className = "card-status-badge active";
  }

  const introText = $("selectedCropIntro");
  if (introText) {
    const trackingMsg = {
      en: "Multiple Crops Active Monitoring",
      te: "బహుళ పంటల క్రియాశీల పర్యవేక్షణ",
      hi: "एकाधिक फसल सक्रिय निगरानी",
      mr: "एकाधिक पीक सक्रिय निरीक्षण",
      ml: "വിവിധ വിളകളുടെ തത്സമയ നിരീക്ഷണം"
    };
    introText.textContent = trackingMsg[farmerLang] || trackingMsg.en;
  }

  // Build the list of crops with collapsible panels
  let html = "";
  cropsList.forEach((localCrop, index) => {
    // Default the first crop to be expanded, others collapsed
    const isExpanded = index === 0;
    html += generateCropTimelineHTML(localCrop, isExpanded, index);
  });

  selectedCropContainer.innerHTML = html;

  // Set default active crop audio context (first crop in the list)
  const defaultCrop = cropsList[0];
  const defaultCropCopy = { name: defaultCrop.crop || defaultCrop.name, acres: defaultCrop.acres || 1.0, at: defaultCrop.createdAt || defaultCrop.at };
  const defaultText = getLocalizedCropText(defaultCropCopy, farmerLang);
  window._currentAudioCropText = defaultText.audio;
  window._activeExpandedCropIndex = 0;

  // Bind click listeners for expansions and audio buttons
  bindCollapsibleTimelineListeners();
}

// Click listener on dashboard card option
if (cardSelectedCropMonitor) {
  cardSelectedCropMonitor.addEventListener("click", () => {
    const local = localStorage.getItem("selectedCrop");
    const localMultiple = localStorage.getItem("selectedCrops");
    let hasSelections = false;
    try {
      if (localMultiple && JSON.parse(localMultiple).length > 0) {
        hasSelections = true;
      }
    } catch {}
    if (local) {
      hasSelections = true;
    }

    if (!hasSelections) {
      // Redirect to recommendation if no crop is selected
      window.location.href = "crop.html";
    } else {
      // Open the timeline modal
      toggleModal(cropMonitorModal, true);
    }
  });
}

if (closeCropMonitorBtn) closeCropMonitorBtn.onclick = () => toggleModal(cropMonitorModal, false);
if (closeCropMonitorBtn2) closeCropMonitorBtn2.onclick = () => toggleModal(cropMonitorModal, false);
if (closeCropMonitorBackdrop) closeCropMonitorBackdrop.onclick = () => toggleModal(cropMonitorModal, false);

// Attach a listener to re-render the card whenever lang dropdown changes
if (dashLangSelect) {
  dashLangSelect.addEventListener("change", () => {
    updateSelectedCropCard();
  });
}

// Attach audio voice functionality to read active tracking crop
const playSelectedCropInstructions = $("playSelectedCropInstructions");
if (playSelectedCropInstructions) {
  playSelectedCropInstructions.addEventListener("click", () => {
    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    let msgToSpeak = "No crop selected yet.";
    if (typeof window._currentAudioCropText === 'string') {
      msgToSpeak = window._currentAudioCropText;
    } else if (window._currentAudioCropText && window._currentAudioCropText[farmerLang]) {
      msgToSpeak = window._currentAudioCropText[farmerLang];
    }

    const langMap = { en: "en-IN", te: "te-IN", hi: "hi-IN", mr: "mr-IN", ml: "ml-IN" };
    speakDashboard(msgToSpeak, langMap[farmerLang]);
  });
}

async function fetchUserProfile() {
  const token = localStorage.getItem("sessionToken");
  if (!token) return;
  try {
    const res = await fetch("/api/profile", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok) {
        if (data.name) localStorage.setItem("farmerName", data.name);
        if (data.soil) localStorage.setItem("farmerSoil", data.soil);
        if (data.water) localStorage.setItem("farmerWater", data.water);
        if (data.acres) localStorage.setItem("farmerAcres", data.acres);
        if (data.profilePic) localStorage.setItem("farmerProfilePic", data.profilePic);

        
        if (typeof populateProfileFields === 'function') populateProfileFields();
        setupHeaderAvatar();
        if (welcomeTitle) {
          applyDashboardLanguage(farmerLang);
        }
      }
    }
  } catch (err) {
    console.warn("Failed to fetch user profile from database:", err);
  }
}

// Fetch user profile from database and load selected crop monitoring cards
fetchUserProfile().finally(() => {
  updateSelectedCropCard();
});

// About SAARTHI Banner Modal Handlers
const heroBanner = document.querySelector(".dashboard-hero-banner");
const aboutSaarthiModal = document.getElementById("aboutSaarthiModal");
const closeAboutSaarthiModal = document.getElementById("closeAboutSaarthiModal");

if (heroBanner && aboutSaarthiModal) {
  heroBanner.addEventListener("click", () => {
    aboutSaarthiModal.classList.remove("hidden");
  });
}

if (aboutSaarthiModal && closeAboutSaarthiModal) {
  closeAboutSaarthiModal.addEventListener("click", (e) => {
    e.stopPropagation();
    aboutSaarthiModal.classList.add("hidden");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  });
  
  const backdrop = aboutSaarthiModal.querySelector(".modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      e.stopPropagation();
      aboutSaarthiModal.classList.add("hidden");
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    });
  }
}

// --- Profile Password Change (Old Password Verification) ---
const profileOldPasswordInput = document.getElementById("profileOldPasswordInput");
const profileNewPasswordInput = document.getElementById("profileNewPasswordInput");
const profileConfirmNewPasswordInput = document.getElementById("profileConfirmNewPasswordInput");
const profileChangePasswordBtn = document.getElementById("profileChangePasswordBtn");
const profilePasswordStatus = document.getElementById("profilePasswordStatus");

if (profileChangePasswordBtn) {
  profileChangePasswordBtn.addEventListener("click", async () => {
    if (!profilePasswordStatus) return;
    profilePasswordStatus.textContent = "";
    profilePasswordStatus.style.color = "";

    const oldPassword = profileOldPasswordInput.value;
    const newPassword = profileNewPasswordInput.value;
    const confirmPassword = profileConfirmNewPasswordInput.value;

    if (!oldPassword || !newPassword || !confirmPassword) {
      profilePasswordStatus.style.color = "red";
      profilePasswordStatus.textContent = "All password fields are required.";
      return;
    }

    if (newPassword.length < 6) {
      profilePasswordStatus.style.color = "red";
      profilePasswordStatus.textContent = "New password must be at least 6 characters.";
      return;
    }

    if (newPassword !== confirmPassword) {
      profilePasswordStatus.style.color = "red";
      profilePasswordStatus.textContent = "New passwords do not match.";
      return;
    }

    try {
      const token = localStorage.getItem("sessionToken") || "";
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: farmerPhone,
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          /* alert(farmerLang === 'te' ? "మీ సెషన్ ముగిసింది. దయచేసి మళ్ళీ లాగిన్ అవ్వండి." :
                farmerLang === 'hi' ? "आपका सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।" :
                farmerLang === 'mr' ? "तुमचे सत्र संपले आहे. कृपया पुन्हा लॉगिन करा." :
                farmerLang === 'ml' ? "നിങ്ങളുടെ സെഷൻ കാലഹരണപ്പെട്ടു. ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക." :
                "Session expired. Please login again."); */
          performLogout();
          return;
        }
        profilePasswordStatus.style.color = "red";
        profilePasswordStatus.textContent = data.message || "Failed to change password.";
        return;
      }

      if (!data.ok) {
        profilePasswordStatus.style.color = "red";
        profilePasswordStatus.textContent = data.message || "Failed to change password.";
        return;
      }

      profilePasswordStatus.style.color = "green";
      profilePasswordStatus.textContent = "Password updated successfully!";
      
      // Clear inputs
      profileOldPasswordInput.value = "";
      profileNewPasswordInput.value = "";
      profileConfirmNewPasswordInput.value = "";
    } catch (err) {
      profilePasswordStatus.style.color = "red";
      profilePasswordStatus.textContent = "Error communicating with server.";
    }
  });
}

// --- Help Center Admin Inbox ---
const sidebarInboxBtn = document.getElementById("sidebarInboxBtn");
const inboxModal = document.getElementById("inboxModal");
const closeInboxBtn = document.getElementById("closeInboxBtn");
const closeInboxBackdrop = document.getElementById("closeInboxBackdrop");
const inboxQueryList = document.getElementById("inboxQueryList");

if (sidebarInboxBtn) {
  if (farmerEmail.toLowerCase() === "saarthiforus2071@gmail.com") {
    sidebarInboxBtn.style.display = "";
  } else {
    sidebarInboxBtn.style.display = "none";
  }
}

function toggleInbox(show = true) {
  if (!inboxModal) return;
  if (show) {
    inboxModal.classList.remove("hidden");
    fetchInboxQueries();
  } else {
    inboxModal.classList.add("hidden");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

if (sidebarInboxBtn) {
  sidebarInboxBtn.addEventListener("click", () => {
    closeSidebar();
    toggleInbox(true);
  });
}

if (closeInboxBtn) closeInboxBtn.onclick = () => toggleInbox(false);
if (closeInboxBackdrop) closeInboxBackdrop.onclick = () => toggleInbox(false);

async function fetchInboxQueries() {
  if (!inboxQueryList) return;
  inboxQueryList.innerHTML = `<p class="muted" style="text-align: center; padding: 2rem;">Loading inquiries...</p>`;

  try {
    const res = await fetch("/api/admin/queries");
    const data = await res.json();
    if (!data.ok || !data.queries || data.queries.length === 0) {
      inboxQueryList.innerHTML = `<p class="muted" style="text-align: center; padding: 2rem;">No inquiries received yet.</p>`;
      return;
    }

    inboxQueryList.innerHTML = "";
    // Render queries reverse chronologically (newest first)
    data.queries.slice().reverse().forEach(q => {
      const card = document.createElement("div");
      card.style.background = "var(--surface-color)";
      card.style.border = "1px solid var(--border-color)";
      card.style.borderRadius = "8px";
      card.style.padding = "1rem";
      card.style.boxShadow = "var(--shadow-sm)";
      
      const dateStr = new Date(q.createdAt).toLocaleString();
      
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; border-bottom:1px solid #eef2f3; padding-bottom:0.4rem; align-items: center;">
          <strong style="display: inline-flex; align-items: center; gap: 0.35rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${escapeHTML(q.name)}</strong>
          <span style="font-size:0.75rem; color:#888;">${dateStr}</span>
        </div>
        <div style="font-size:0.85rem; color:#555; margin-bottom:0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.2rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color);"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> <strong>Phone:</strong> ${escapeHTML(q.phone)}</div>
          <div style="display: flex; align-items: center; gap: 0.35rem;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color);"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> <strong>Email:</strong> ${escapeHTML(q.email)}</div>
        </div>
        <div style="background:#f9fbf9; padding:0.8rem; border-left:4px solid var(--primary-color); font-style:italic; font-size:0.9rem; color:#333;">
          ${escapeHTML(q.query)}
        </div>
      `;
      inboxQueryList.appendChild(card);
    });
  } catch (err) {
    inboxQueryList.innerHTML = `<p class="error-text" style="text-align: center; padding: 2rem; color:red;">Failed to retrieve queries.</p>`;
  }
}

// Simple HTML escaping helper for security
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

