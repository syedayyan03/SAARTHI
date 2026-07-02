function $(id) {
  return document.getElementById(id);
}

const farmerPhone = localStorage.getItem("farmerPhone") || "";
const farmerLang = localStorage.getItem("uiLang") || "en";

if (!farmerPhone || !localStorage.getItem("sessionToken")) {
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
      resetUpload();
      handleFileSelected(diseaseFile.files[0]);
    }
  });
}

function handleFileSelected(file) {
  if (!file.type.startsWith("image/")) {
    diseaseResult.innerHTML = `<p class="error-text">Please upload an image file.</p>`;
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
        <div class="agri-loader-sprout" style="display: flex; align-items: center; gap: 0.4rem;">
          <span class="agri-loader-text" style="font-size: 1rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem;">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color); vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M2 22c1.25-6.73 6.77-12 14-12 1.25 0 2.5.18 3.75.54M2 22C4.33 13.88 10.12 8 18 8c1.25 0 2.5.1 3.75.29M2 22C5.45 15.65 11.23 11 19 11c1 0 2 .06 3 .17"></path><path d="M12 22V12"></path></svg> Inspecting plant tissue and cell structure...
          </span>
        </div>
      </div>
    `;

    const diseaseLoadingMessages = [
      `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color); vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M2 22c1.25-6.73 6.77-12 14-12 1.25 0 2.5.18 3.75.54M2 22C4.33 13.88 10.12 8 18 8c1.25 0 2.5.1 3.75.29M2 22C5.45 15.65 11.23 11 19 11c1 0 2 .06 3 .17"></path><path d="M12 22V12"></path></svg> Scanning leaf surfaces for fungal or bacterial pathogens...`,
      `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color); vertical-align: middle; margin-right: 4px; display: inline-block;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Analyzing pigmentation and leaf lesion patterns...`,
      `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color); vertical-align: middle; margin-right: 4px; display: inline-block;"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg> Matching anomalies against crop disease database...`,
      `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color); vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Formulating organic treatments and soil remedies...`
    ];

    let diseaseMessageIndex = 0;
    const diseaseIntervalId = setInterval(() => {
      const loaderEl = document.getElementById(loaderId);
      if (loaderEl) {
        diseaseMessageIndex = (diseaseMessageIndex + 1) % diseaseLoadingMessages.length;
        const textEl = loaderEl.querySelector(".agri-loader-text");
        if (textEl) {
          textEl.innerHTML = diseaseLoadingMessages[diseaseMessageIndex];
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
          /* alert(farmerLang === 'te' ? "మీ సెషన్ ముగిసింది. దయచేసి మళ్ళీ లాగిన్ అవ్వండి." :
                farmerLang === 'hi' ? "आपका सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।" :
                farmerLang === 'mr' ? "तुमचे सत्र संपले आहे. कृपया पुन्हा लॉगिन करा." :
                farmerLang === 'ml' ? "നിങ്ങളുടെ സെഷൻ കാലഹരണപ്പെട്ടു. ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക." :
                "Session expired. Please login again."); */
          performLogout();
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
}

// Global localization logic for Disease Detector page
const diseaseTranslations = {
  en: {
    dashLogoSubtitle: "Disease Detector (Demo)",
    navHome: "Home",
    navContactUs: "Contact Us",
    navProfile: "Profile",
    diseasePageTitle: "Disease Detection",
    diseasePageIntro: "Upload a crop or leaf photo below. Our built-in Gemini AI model will analyze your photo in real-time to detect possible diseases and offer reliable advice.",
    detectDiseaseBtn: "Detect Disease",
    analysisResult: "Analysis Result:",
    uploadSubtext: "Supports PNG, JPG, JPEG files",
    adviceTitle: "Recommended Action Plan:",
    selectAlert: "Please select an image file first."
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
    uploadSubtext: "PNG, JPG, JPEG ఫైల్‌లు మాత్రమే సపోర్ట్ చేయబడతాయి",
    adviceTitle: "సిఫార్సు చేయబడిన చర్యలు:",
    selectAlert: "దయచేసి ముందుగా ఒక చిత్రాన్ని ఎంచుకోండి."
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
    uploadSubtext: "PNG, JPG, JPEG फाइलों का समर्थन करता है",
    adviceTitle: "अनुशंसित कार्रवाई कदम:",
    selectAlert: "कृपया पहले एक छवि फ़ाइल चुनें।"
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
    uploadSubtext: "PNG, JPG, JPEG फाईल्सना सपोर्ट करते",
    adviceTitle: "शिफारस केलेले उपाय:",
    selectAlert: "कृपया प्रथम एक प्रतिमा फाइल निवडा."
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
    uploadSubtext: "PNG, JPG, JPEG ഫയലുകൾ സപ്പോർട്ട് ചെയ്യും",
    adviceTitle: "ശുപാർശ ചെയ്യുന്ന നടപടികൾ:",
    selectAlert: "ദയവായി ആദ്യം ഒരു ചിത്ര ഫയൽ തിരഞ്ഞെടുക്കുക."
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
