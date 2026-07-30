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

const dropZone = $("dropZone");
const diseaseFile = $("diseaseFile");
const imagePreviewContainer = $("imagePreviewContainer");
const imagePreview = $("imagePreview");
const removeImageBtn = $("removeImageBtn");
const detectDiseaseBtn = $("detectDiseaseBtn");
const diseaseResult = $("diseaseResult");

// File Upload & Drag-and-Drop Handlers
if (dropZone) {
  dropZone.addEventListener("click", () => {
    diseaseFile.click();
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  ["dragleave", "dragend"].forEach(type => {
    dropZone.addEventListener(type, () => {
      dropZone.classList.remove("dragover");
    });
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });
}

// Allow dragging and dropping over the preview container to replace the image
if (imagePreviewContainer) {
  imagePreviewContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    imagePreviewContainer.style.opacity = "0.7";
  });

  ["dragleave", "dragend"].forEach(type => {
    imagePreviewContainer.addEventListener(type, () => {
      imagePreviewContainer.style.opacity = "1";
    });
  });

  imagePreviewContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    imagePreviewContainer.style.opacity = "1";
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      resetUpload(); // clear previous result/state
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  // Also allow clicking the preview to select a new file
  imagePreviewContainer.addEventListener("click", (e) => {
    // If they clicked the remove button, let the remove button handler handle it
    if (e.target !== removeImageBtn && !removeImageBtn.contains(e.target)) {
      diseaseFile.click();
    }
  });
}

if (diseaseFile) {
  diseaseFile.addEventListener("change", () => {
    if (diseaseFile.files && diseaseFile.files.length > 0) {
      const selectedFile = diseaseFile.files[0];
      resetUpload();
      handleFileSelected(selectedFile);
    }
  });
}

function handleFileSelected(file) {
  const textObj = diseaseTranslations[farmerLang] || diseaseTranslations.en;

  if (!file.type.startsWith("image/")) {
    diseaseResult.innerHTML = `<p class="error-text">Please upload an image file.</p>`;
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    diseaseResult.innerHTML = `<p class="error-text">${textObj.sizeAlert || "Image file size exceeds the 10MB limit. Please choose a smaller image."}</p>`;
    resetUpload();
    return;
  }

  // Update file input's files property programmatically
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  diseaseFile.files = dataTransfer.files;

  // Render preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    imagePreviewContainer.classList.remove("hidden");
    dropZone.classList.add("hidden");
    detectDiseaseBtn.removeAttribute("disabled");
  };
  reader.readAsDataURL(file);
}

if (removeImageBtn) {
  removeImageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetUpload();
  });
}

function resetUpload() {
  diseaseFile.value = "";
  imagePreview.src = "";
  imagePreviewContainer.classList.add("hidden");
  dropZone.classList.remove("hidden");
  detectDiseaseBtn.setAttribute("disabled", "true");
  diseaseResult.innerHTML = "";
}

if (detectDiseaseBtn) {
  detectDiseaseBtn.addEventListener("click", async () => {
    if (!diseaseFile.files || diseaseFile.files.length === 0) {
      const textObj = diseaseTranslations[farmerLang] || diseaseTranslations.en;
      diseaseResult.textContent = textObj.selectAlert || "Please select an image file first.";
      return;
    }

    // Wrap the selected file and language preferences in FormData
    const formData = new FormData();
    formData.append("image", diseaseFile.files[0]);
    formData.append("lang", farmerLang);

    const loaderId = "diseaseLoader_" + Date.now();
    diseaseResult.innerHTML = `
      <div class="agri-loader-wrapper" id="${loaderId}" style="margin: 1.5rem 0; align-items: flex-start; text-align: left; max-width: 100%;">
        <div class="agri-loader-sprout" style="display: flex; align-items: center; gap: 0.5rem; flex-direction: row;">
          <svg class="plant-drawing-loader" viewBox="0 0 32 32" style="width: 24px; height: 24px; flex-shrink: 0;"><path class="plant-ground" d="M 6 30 L 26 30" /><path class="plant-stem" d="M 16 30 Q 14 20, 16 10" /><path class="plant-leaf leaf-left" d="M 15 20 Q 7 18, 10 13 Q 14 14, 15 17 Z" /><path class="plant-leaf leaf-right" d="M 16 14 Q 24 12, 21 7 Q 17 8, 16 11 Z" /><path class="plant-leaf leaf-top" d="M 16 10 Q 11 5, 16 2 Q 21 5, 16 10 Z" /></svg>
          <span class="agri-loader-text" style="font-size: 1rem; font-weight: 600; display: inline-flex; align-items: center;">
            Inspecting plant tissue and cell structure...
          </span>
        </div>
      </div>
    `;

    const diseaseLoadingMessages = [
      `Scanning leaf surfaces for fungal or bacterial pathogens...`,
      `Analyzing pigmentation and leaf lesion patterns...`,
      `Matching anomalies against crop disease database...`,
      `Formulating organic treatments and soil remedies...`
    ];

    let diseaseMessageIndex = 0;
    const diseaseIntervalId = setInterval(() => {
      const loaderEl = document.getElementById(loaderId);
      if (loaderEl) {
        diseaseMessageIndex = (diseaseMessageIndex + 1) % diseaseLoadingMessages.length;
        const textEl = loaderEl.querySelector(".agri-loader-text");
        if (textEl) {
          textEl.textContent = diseaseLoadingMessages[diseaseMessageIndex];
        }
      } else {
        clearInterval(diseaseIntervalId);
      }
    }, 2500);

    try {
      const token = localStorage.getItem("sessionToken") || "";
      const res = await fetch("/api/detect-disease", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();
      clearInterval(diseaseIntervalId);

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          diseaseResult.innerHTML = `<p class="error-text">Authentication Error (${res.status}): ${data.message || "Session expired. Please login again."}</p>`;
          return;
        }
        diseaseResult.innerHTML = `<p class="error-text">Error: ${data.message || data.reply || "Unknown error"}</p>`;
        return;
      }

      if (!data.ok) {
        diseaseResult.innerHTML = `<p class="error-text">Error: ${data.message || data.reply || "Unknown error"}</p>`;
        return;
      } else {
        const textObj = diseaseTranslations[farmerLang] || diseaseTranslations.en;
        const severityStr = (data.severity || 'N/A').toLowerCase().trim();
        let severityClass = 'severity-mild';
        
        if (severityStr.includes('moderate')) {
          severityClass = 'severity-moderate';
        } else if (severityStr.includes('severe')) {
          severityClass = 'severity-severe';
        }

        let adviceHTML = '';
        if (Array.isArray(data.advice)) {
          adviceHTML = data.advice.map(item => `
            <li style="display: flex; align-items: flex-start; gap: 0.35rem;">
              <span class="bullet-check" style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; color: var(--primary-color); flex-shrink: 0; margin-top: 2px;">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
              <span class="advice-text">${item}</span>
            </li>
          `).join('');
        }

        diseaseResult.innerHTML = `
          <div class="disease-card">
            <div class="disease-card-header">
              <div class="severity-badge-container">
                <span class="severity-badge ${severityClass}">${data.severity || 'N/A'}</span>
              </div>
              <h2>${data.disease || 'Unknown Disease'}</h2>
            </div>
            <div class="disease-card-body">
              <h3>${textObj.adviceTitle || "Recommended Action Plan:"}</h3>
              <ul class="disease-advice-list">
                ${adviceHTML || '<li>No specific advice available.</li>'}
              </ul>
            </div>
          </div>
        `;
      }
    } catch (err) {
      clearInterval(diseaseIntervalId);
      diseaseResult.innerHTML = `<p class="error-text">Error: Unable to reach disease detection service.</p>`;
    }
  });
} // Global localization logic for Disease Detector page
const diseaseTranslations = {
  en: {
    dashLogoSubtitle: "Disease Detection",
    navHome: "Home",
    navContactUs: "Contact Us",
    navProfile: "Profile",
    diseasePageTitle: "Disease Detection",
    diseasePageIntro: "Upload a crop or leaf photo below. Our built-in Gemini AI model will analyze your photo in real-time to detect possible diseases and offer reliable advice.",
    detectDiseaseBtn: "Detect Disease",
    analysisResult: "Analysis Result:",
    uploadSubtext: "Supports PNG, JPG, JPEG files (Max 10MB)",
    adviceTitle: "Recommended Action Plan:",
    selectAlert: "Please select an image file first.",
    sizeAlert: "Image file size exceeds the 10MB limit. Please choose a smaller image."
  },
  te: {
    dashLogoSubtitle: "వ్యాధి గుర్తింపు",
    navHome: "హోమ్",
    navContactUs: "సంప్రదించండి",
    navProfile: "ప్రొఫైల్",
    diseasePageTitle: "వ్యాధి గుర్తింపు",
    diseasePageIntro: "క్రింద ఒక పంట లేదా ఆకు ఫోటోను అప్‌లోడ్ చేయండి. మా Gemini AI మోడల్ మీ ఫోటోను విశ్లేషించి వ్యాధులను గుర్తిస్తుంది.",
    detectDiseaseBtn: "వ్యాధిని గుర్తించండి",
    analysisResult: "విశ్లేషణ ఫలితం:",
    uploadSubtext: "PNG, JPG, JPEG ఫైల్‌లు మాత్రమే సపోర్ट చేయబడతాయి (గరిష్టంగా 10MB)",
    adviceTitle: "సిఫార్సు చేయబడిన చర్యలు:",
    selectAlert: "దయచేసి ముందుగా ఒక చిత్రాన్ని ఎంచుకోండి.",
    sizeAlert: "చిత్రం సైజు 10MB పరిమితిని మించిపోయింది. దయచేసి చిన్న చిత్రాన్ని ఎంచుకోండి."
  },
  hi: {
    dashLogoSubtitle: "रोग पहचान",
    navHome: "होम",
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    diseasePageTitle: "रोग पहचान",
    diseasePageIntro: "नीचे एक फसल या पत्ते का फोटो अपलोड करें। हमारा Gemini AI मॉडल वास्तविक समय में आपके फोटो का विश्लेषण करेगा।",
    detectDiseaseBtn: "रोग का पता लगाएं",
    analysisResult: "विश्लेषण परिणाम:",
    uploadSubtext: "PNG, JPG, JPEG फाइलों का समर्थन करता है (अधिकतम 10MB)",
    adviceTitle: "अनुशंसित कार्रवाई कदम:",
    selectAlert: "कृपया पहले एक छवि फ़ाइल चुनें।",
    sizeAlert: "छवि फ़ाइल का आकार 10MB की सीमा से अधिक है। कृपया एक छोटी छवि चुनें।"
  },
  mr: {
    dashLogoSubtitle: "रोग ओळख",
    navHome: "होम",
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    diseasePageTitle: "रोग ओळख",
    diseasePageIntro: "खाली पीक किंवा पानाचा फोटो अपलोड करा. आमचे Gemini AI मॉडेल रिअल-टाइममध्ये फोटोचे विश्लेषण करेल.",
    detectDiseaseBtn: "रोग शोधा",
    analysisResult: "विश्लेषण परिणाम:",
    uploadSubtext: "PNG, JPG, JPEG फाईल्सना सपोर्ट करते (कमाल 10MB)",
    adviceTitle: "शिफारस केलेले उपाय:",
    selectAlert: "कृपया प्रथम एक प्रतिमा फाइल निवडा.",
    sizeAlert: "इमेज फाईलचा आकार 10MB मर्यादेपेक्षा जास्त आहे. कृपया लहान प्रतिमा निवडा."
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
    uploadSubtext: "PNG, JPG, JPEG ഫയലുകൾ സപ്പോർട്ട് ചെയ്യും (പരമാവധി 10MB)",
    adviceTitle: "ശുപാർശ ചെയ്യുന്ന നടപടികൾ:",
    selectAlert: "ദയവായി ആദ്യം ഒരു ചിത്ര ഫയൽ തിരഞ്ഞെടുക്കുക.",
    sizeAlert: "ചിത്രത്തിന്റെ ഫയൽ സൈസ് 10MB പരിധി കവിഞ്ഞു. ദയവായി ചെറിയ ചിത്രം തിരഞ്ഞെടുക്കുക."
  }
};

function applyDiseaseLanguage() {
  const t = diseaseTranslations[farmerLang] || diseaseTranslations.en;
  
  if ($('dashLogoSubtitle')) $('dashLogoSubtitle').textContent = t.dashLogoSubtitle;
  if ($('navHome')) $('navHome').textContent = t.navHome;
  if ($('navContactUs')) $('navContactUs').textContent = t.navContactUs;
  if ($('navProfile')) $('navProfile').textContent = t.navProfile;
  
  if ($('diseasePageTitle')) $('diseasePageTitle').textContent = t.diseasePageTitle;
  if ($('diseasePageIntro')) $('diseasePageIntro').textContent = t.diseasePageIntro;
  if (detectDiseaseBtn) detectDiseaseBtn.textContent = t.detectDiseaseBtn;
  if ($('uploadSubtext')) $('uploadSubtext').textContent = t.uploadSubtext;

  if ($('uploadInstruction')) {
    if (farmerLang === 'te') {
      $('uploadInstruction').innerHTML = 'ఆకు ఫోటోను ఇక్కడ డ్రాప్ చేయండి లేదా <span class="browse-link">ఫైల్‌లను ఎంచుకోండి</span>';
    } else if (farmerLang === 'hi') {
      $('uploadInstruction').innerHTML = 'पत्ते का फोटो यहाँ खींचें और छोड़ें या <span class="browse-link">फाइलें ब्राउज़ करें</span>';
    } else if (farmerLang === 'mr') {
      $('uploadInstruction').innerHTML = 'पानाचा फोटो येथे ड्रॅग आणि ड्रॉप करा किंवा <span class="browse-link">ब्राउझ करा</span>';
    } else if (farmerLang === 'ml') {
      $('uploadInstruction').innerHTML = 'ഇലയുടെ ഫോട്ടോ ഇവിടെ ഡ്രാഗ് ചെയ്യുക അല്ലെങ്കിൽ <span class="browse-link">ബ്രൗസ് ചെയ്യുക</span>';
    } else {
      $('uploadInstruction').innerHTML = 'Drag & Drop leaf photo here or <span class="browse-link">browse files</span>';
    }
  }
}

applyDiseaseLanguage();
