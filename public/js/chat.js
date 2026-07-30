function $(id) {
  return document.getElementById(id);
}

const farmerPhone = localStorage.getItem("farmerPhone") || "";
const farmerEmail = localStorage.getItem("farmerEmail") || "";
const farmerLang = localStorage.getItem("uiLang") || localStorage.getItem("farmerLang") || "en";
if ((!farmerPhone && !farmerEmail) || !localStorage.getItem("sessionToken")) {
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
  localStorage.removeItem("farmerSoil");
  localStorage.removeItem("farmerWater");
  localStorage.removeItem("farmerAcres");
  localStorage.removeItem("farmerProfilePic");
  localStorage.removeItem("selectedCrops");
  localStorage.removeItem("selectedCrop");
  window.location.href = "index.html";
}

if (profileLogoutBtn) profileLogoutBtn.addEventListener("click", performLogout);
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

// Chat Elements
const chatWindow = $("chatWindow");
const chatInput = $("chatInput");
const chatSendBtn = $("chatSendBtn");

// Sidebar & Session Elements
const chatSidebar = $("chatSidebar");
const sidebarToggleBtn = $("sidebarToggleBtn");
const newChatBtn = $("newChatBtn");
const chatHistoryList = $("chatHistoryList");

// Attachment Elements
const chatImageInput = $("chatImageInput");
const attachBtn = $("attachBtn");
const imagePreviewContainer = $("imagePreviewContainer");
const chatImagePreview = $("chatImagePreview");
const removeImageBtn = $("removeImageBtn");

let conversationHistory = [];
let chatSessions = JSON.parse(localStorage.getItem(`saarthi_chats_${farmerPhone}`)) || [];
let activeSessionId = null;
let selectedImageFile = null;

// Search & filter state
let searchQuery = "";
let renamingSessionId = null;

// Accordion toggle states for Pinned and Recents sections
let pinnedSectionExpanded = true;
let recentsSectionExpanded = true;

const chatSearchInput = $("chatSearchInput");
const clearSearchBtn = $("clearSearchBtn");
const closeSidebarBtn = $("closeSidebarBtn");

// UI Initialization
if (sidebarToggleBtn) {
  sidebarToggleBtn.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      chatSidebar.classList.toggle("open");
      chatSidebar.classList.remove("collapsed");
    } else {
      chatSidebar.classList.toggle("collapsed");
      chatSidebar.classList.remove("open");
    }
  });
}

if (closeSidebarBtn) {
  closeSidebarBtn.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      chatSidebar.classList.remove("open");
    } else {
      chatSidebar.classList.add("collapsed");
    }
  });
}

if (newChatBtn) {
  newChatBtn.addEventListener("click", () => {
    startNewChat();
    if (window.innerWidth <= 768) chatSidebar.classList.remove("open");
  });
}

// Search Inputs
if (chatSearchInput) {
  chatSearchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    if (searchQuery) {
      clearSearchBtn.classList.remove("hidden");
    } else {
      clearSearchBtn.classList.add("hidden");
    }
    renderSidebar();
  });
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener("click", () => {
    chatSearchInput.value = "";
    searchQuery = "";
    clearSearchBtn.classList.add("hidden");
    renderSidebar();
  });
}

// Tab listeners removed

// Attachment Handlers
if (attachBtn && chatImageInput) {
  attachBtn.addEventListener("click", () => chatImageInput.click());
  
  chatImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        chatImagePreview.src = e.target.result;
        imagePreviewContainer.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });
}

if (removeImageBtn) {
  removeImageBtn.addEventListener("click", () => {
    selectedImageFile = null;
    chatImageInput.value = "";
    imagePreviewContainer.classList.add("hidden");
  });
}

// Session Management
async function saveSessions() {
  localStorage.setItem(`saarthi_chats_${farmerPhone}`, JSON.stringify(chatSessions));
  renderSidebar();

  const token = localStorage.getItem("sessionToken");
  if (token) {
    try {
      await fetch("/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ sessions: chatSessions })
      });
    } catch (e) {
      console.warn("Failed to backup chat sessions to server database:", e);
    }
  }
}

function showPopup({ title, message, showCancel = true, onConfirm, onCancel }) {
  const popup = document.getElementById("customPopup");
  const titleEl = document.getElementById("popupTitle");
  const msgEl = document.getElementById("popupMessage");
  const confirmBtn = document.getElementById("popupConfirmBtn");
  const cancelBtn = document.getElementById("popupCancelBtn");
  
  if (!popup) return;
  
  titleEl.textContent = title;
  msgEl.innerHTML = message;
  
  if (showCancel) {
    cancelBtn.classList.remove("hidden");
  } else {
    cancelBtn.classList.add("hidden");
  }
  
  // Clone nodes to remove previous event listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  const newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  
  popup.classList.remove("hidden");
  
  newConfirmBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    if (onConfirm) onConfirm();
  });
  
  newCancelBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    if (onCancel) onCancel();
  });
}

function renderSidebar() {
  if (!chatHistoryList) return;
  chatHistoryList.innerHTML = "";

  // Sort sessions: archived sessions at the top, followed by active ones
  const sortedSessions = [...chatSessions].sort((a, b) => {
    const aArchived = !!a.archived;
    const bArchived = !!b.archived;
    if (aArchived && !bArchived) return -1;
    if (!aArchived && bArchived) return 1;
    return 0;
  });

  // Filter sessions based on Search query
  const filteredSessions = sortedSessions.filter(session => {
    if (searchQuery) {
      const title = (session.title || "New Chat").toLowerCase();
      return title.includes(searchQuery);
    }
    return true;
  });

  // Group into Pinned (Archived) and Recent (Active)
  const pinnedSessions = filteredSessions.filter(s => !!s.archived);
  const recentSessions = filteredSessions.filter(s => !s.archived);

  // Helper to create a single session DOM element
  function createSessionDOMElement(session) {
    const item = document.createElement("div");
    item.className = `chat-history-item ${session.id === activeSessionId ? 'active' : ''}`;
    
    // If we are currently renaming this session
    if (renamingSessionId === session.id) {
      item.className += " renaming";
      
      const renameInput = document.createElement("input");
      renameInput.type = "text";
      renameInput.className = "chat-rename-input";
      renameInput.value = session.title || "New Chat";
      
      renameInput.onclick = (e) => e.stopPropagation();
      
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "chat-item-actions";
      
      // Save Button
      const saveBtn = document.createElement("button");
      saveBtn.className = "chat-action-btn save-btn";
      saveBtn.title = "Save";
      saveBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      saveBtn.onclick = (e) => {
        e.stopPropagation();
        const newTitle = renameInput.value.trim();
        session.title = newTitle || "New Chat";
        renamingSessionId = null;
        saveSessions();
      };

      // Cancel Button
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "chat-action-btn cancel-btn";
      cancelBtn.title = "Cancel";
      cancelBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      cancelBtn.onclick = (e) => {
        e.stopPropagation();
        renamingSessionId = null;
        renderSidebar();
      };

      actionsDiv.appendChild(saveBtn);
      actionsDiv.appendChild(cancelBtn);
      
      item.appendChild(renameInput);
      item.appendChild(actionsDiv);
      
      // Focus and select input text
      setTimeout(() => {
        renameInput.focus();
        renameInput.select();
      }, 50);

      // Handle Enter / Escape keys
      renameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const newTitle = renameInput.value.trim();
          session.title = newTitle || "New Chat";
          renamingSessionId = null;
          saveSessions();
        } else if (e.key === "Escape") {
          e.preventDefault();
          renamingSessionId = null;
          renderSidebar();
        }
      });
      
    } else {
      // Normal display mode
      const mainDiv = document.createElement("div");
      mainDiv.className = "chat-item-main";
      
      // Icon: message bubble SVG
      const iconSpan = document.createElement("span");
      iconSpan.className = "chat-item-icon";
      iconSpan.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      
      const titleSpan = document.createElement("span");
      titleSpan.className = "chat-item-title";
      titleSpan.textContent = session.title || "New Chat";
      
      mainDiv.appendChild(iconSpan);
      mainDiv.appendChild(titleSpan);
      
      // Action buttons container
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "chat-item-actions";
      
      // Rename (pencil icon)
      const renameBtn = document.createElement("button");
      renameBtn.className = "chat-action-btn rename-btn";
      renameBtn.title = "Rename";
      renameBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      `;
      renameBtn.onclick = (e) => {
        e.stopPropagation();
        renamingSessionId = session.id;
        renderSidebar();
      };
      
      // Archive (archive/unarchive tray icon)
      const archiveBtn = document.createElement("button");
      archiveBtn.className = "chat-action-btn archive-btn";
      archiveBtn.title = session.archived ? "Unarchive" : "Archive";
      archiveBtn.innerHTML = session.archived ? `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        </svg>
      ` : `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <rect x="1" y="3" width="22" height="5" rx="1"></rect>
          <line x1="10" y1="12" x2="14" y2="12"></line>
        </svg>
      `;
      archiveBtn.onclick = (e) => {
        e.stopPropagation();
        session.archived = !session.archived;
        saveSessions();
      };
      
      // Delete (trash icon)
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "chat-action-btn delete-btn";
      deleteBtn.title = "Delete";
      deleteBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      `;
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        const confirmMsg = 
          farmerLang === "te" ? "మీరు ఈ చాట్‌ను తొలగించాలనుకుంటున్నారా?" :
          farmerLang === "hi" ? "क्या आप वाकई इस चैट को हटाना चाहते हैं?" :
          farmerLang === "mr" ? "तुम्ही नक्की ही चॅट हटवू इच्छिता?" :
          farmerLang === "ml" ? "ഈ ചാറ്റ് ഇല്ലാതാക്കാൻ നിങ്ങൾ തീർച്ചയായും ആഗ്രഹിക്കുന്നുണ്ടോ?" :
          "Are you sure you want to delete this chat?";
          
        showPopup({
          title: farmerLang === "te" ? "చాట్‌ను తొలగించు" :
                 farmerLang === "hi" ? "चैट हटाएं" :
                 farmerLang === "mr" ? "चॅट हटवा" :
                 farmerLang === "ml" ? "ചാറ്റ് ഇല്ലാതാക്കുക" :
                 "Delete Chat",
          message: confirmMsg,
          showCancel: true,
          onConfirm: () => {
            chatSessions = chatSessions.filter(s => s.id !== session.id);
            saveSessions();
            if (session.id === activeSessionId) {
              if (chatSessions.length > 0) {
                loadSession(chatSessions[0].id);
              } else {
                startNewChat();
              }
            }
          }
        });
      };
      
      actionsDiv.appendChild(renameBtn);
      actionsDiv.appendChild(archiveBtn);
      actionsDiv.appendChild(deleteBtn);
      
      item.appendChild(mainDiv);
      item.appendChild(actionsDiv);
      
      item.onclick = () => {
        loadSession(session.id);
        if (window.innerWidth <= 768) chatSidebar.classList.remove("open");
      };
    }
    
    return item;
  }

  // 1. Render Pinned Section
  if (pinnedSessions.length > 0) {
    const pinnedHeader = document.createElement("div");
    pinnedHeader.className = `sidebar-section-header ${pinnedSectionExpanded ? 'expanded' : 'collapsed'}`;
    pinnedHeader.innerHTML = `
      <span class="section-title-text">${farmerLang === "te" ? "పిన్ చేయబడినవి" : farmerLang === "hi" ? "पिन किए गए" : farmerLang === "mr" ? "पिन केलेले" : farmerLang === "ml" ? "പിൻ ചെയ്തവ" : "Pinned"}</span>
      <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="${pinnedSectionExpanded ? '6 9 12 15 18 9' : '9 18 15 12 9 6'}"></polyline>
      </svg>
    `;
    pinnedHeader.onclick = () => {
      pinnedSectionExpanded = !pinnedSectionExpanded;
      renderSidebar();
    };
    chatHistoryList.appendChild(pinnedHeader);

    const pinnedContent = document.createElement("div");
    pinnedContent.className = `sidebar-section-content ${pinnedSectionExpanded ? '' : 'collapsed'}`;
    pinnedSessions.forEach(session => {
      pinnedContent.appendChild(createSessionDOMElement(session));
    });
    chatHistoryList.appendChild(pinnedContent);
  }

  // 2. Render Recents Section
  const recentsHeader = document.createElement("div");
  recentsHeader.className = `sidebar-section-header ${recentsSectionExpanded ? 'expanded' : 'collapsed'}`;
  recentsHeader.innerHTML = `
    <span class="section-title-text">${farmerLang === "te" ? "ఇటీవలివి" : farmerLang === "hi" ? "हाल के" : farmerLang === "mr" ? "अलीकडील" : farmerLang === "ml" ? "സമീപകാലം" : "Recents"}</span>
    <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="${recentsSectionExpanded ? '6 9 12 15 18 9' : '9 18 15 12 9 6'}"></polyline>
    </svg>
  `;
  recentsHeader.onclick = () => {
    recentsSectionExpanded = !recentsSectionExpanded;
    renderSidebar();
  };
  chatHistoryList.appendChild(recentsHeader);

  const recentsContent = document.createElement("div");
  recentsContent.className = `sidebar-section-content ${recentsSectionExpanded ? '' : 'collapsed'}`;
  
  if (recentSessions.length > 0) {
    recentSessions.forEach(session => {
      recentsContent.appendChild(createSessionDOMElement(session));
    });
  } else {
    const noChats = document.createElement("div");
    noChats.className = "no-chats-placeholder";
    noChats.textContent = farmerLang === "te" ? "చాట్‌లు లేవు" : farmerLang === "hi" ? "कोई चैट नहीं" : farmerLang === "mr" ? "चॅट्स नाहीत" : farmerLang === "ml" ? "ചാറ്റുകൾ ഇല്ല" : "No chats yet";
    recentsContent.appendChild(noChats);
  }
  chatHistoryList.appendChild(recentsContent);
}

const welcomeMessages = {
  en: "Hello! I am SAARTHI, your agricultural assistant. How can I help you today?",
  te: "నమస్కారం! నేను సారథిని, మీ వ్యవసాయ సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
  hi: "नमस्ते! मैं सारथी हूँ, आपका कृषि सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ?",
  mr: "नमस्कार! मी सारथी आहे, तुमचा कृषी सहाय्यक। आज मी तुम्हाला कशी मदत करू शकतो?",
  ml: "നമസ്കാരം! ഞാൻ സാരഥിയാണ്, നിങ്ങളുടെ കാർഷിക സഹായി. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?"
};

const chatSuggestionsData = {
  en: [
    { text: "How do I diagnose leaf spot disease in paddy?", label: "Diagnose Paddy Disease" },
    { text: "What is the best fertilizer for cotton crop in black soil?", label: "Cotton Fertilizer Advice" },
    { text: "Is the current weather suitable for harvesting crops?", label: "Weather Suitability" },
    { text: "Which crops are in high market demand right now?", label: "High-Demand Crops" }
  ],
  te: [
    { text: "వరిలో ఆకుమచ్చ తెగులును ఎలా నివారించాలి?", label: "వరి తెగుళ్ళ నివారణ" },
    { text: "నల్ల రేగడి నేలలో పత్తి పంటకు ఏ ఎరువులు వేయాలి?", label: "పత్తి ఎరువుల గైడ్" },
    { text: "ప్రస్తుత వాతావరణం పంట కోతకు అనుకూలమేనా?", label: "వాతావరణ అనుకూలత" },
    { text: "ప్రస్తుతం మార్కెట్లో ఏ పంటలకు మంచి డిమాండ్ ఉంది?", label: "అధిక డిమాండ్ పంటలు" }
  ],
  hi: [
    { text: "धान में पत्ती धब्बा रोग का इलाज कैसे करें?", label: "धान रोग पहचान" },
    { text: "काली मिट्टी में कपास की फसल के लिए सबसे अच्छा उर्वरक क्या है?", label: "कपास उर्वरक सलाह" },
    { text: "क्या वर्तमान मौसम फसल की कटाई के लिए उपयुक्त है?", label: "मौसम अनुकूलता" },
    { text: "अभी बाजार में किन फसलों की सबसे ज्यादा मांग है?", label: "उच्च मांग वाली फसलें" }
  ],
  mr: [
    { text: "भातावरील पानांवरील ठिपके रोगाचे नियंत्रण कसे करावे?", label: "भात रोग ओळख" },
    { text: "काळी मातीत कापूस पिकासाठी सर्वोत्तम खत कोणते आहे?", label: "कापूस खत सल्ला" },
    { text: "सध्याचे हवामान पीक कापणीसाठी योग्य आहे का?", label: "हवामान अनुकूलता" },
    { text: "सध्या बाजारात कोणत्या पिकांना चांगली मागणी आहे?", label: "उच्च मागणी पिके" }
  ],
  ml: [
    { text: "നെല്ലിലെ ഇലപ്പുള്ളി രോഗം എങ്ങനെ തടയാം?", label: "നെൽ രോഗ പ്രതിരോധം" },
    { text: "കരിമണ്ണിൽ പരുത്തി കൃഷിക്ക് ഏറ്റവും അനുയോജ്യമായ വളം ഏതാണ്?", label: "പരുത്തി വളം ഉപദേശം" },
    { text: "നിലവിലെ കാലാവസ്ഥ വിളവെടുപ്പിന് അനുയോജ്യമാണോ?", label: "കാലാവസ്ഥാ അനുയോജ്യത" },
    { text: "ഇപ്പോൾ വിപണിയിൽ ഏത് വിളകൾക്കാണ് കൂടുതൽ ഡിമാൻഡ് ഉള്ളത്?", label: "കൂടുതൽ ഡിമാൻഡുള്ള വിളകൾ" }
  ]
};

const chatSuggestionIcons = [
  `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block; color: var(--primary-color);"><path d="M2 22c1.25-6.73 6.77-12 14-12 1.25 0 2.5.18 3.75.54M2 22C4.33 13.88 10.12 8 18 8c1.25 0 2.5.1 3.75.29M2 22C5.45 15.65 11.23 11 19 11c1 0 2 .06 3 .17"></path><path d="M12 22V12"></path></svg>`,
  `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block; color: var(--primary-color);"><path d="M6 3h12M8 3v7l-5.66 9.4A2 2 0 0 0 4 22h16a2 2 0 0 0 1.66-2.6L16 10V3M8 14h8"></path></svg>`,
  `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block; color: var(--primary-color);"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`,
  `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block; color: var(--primary-color);"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`
];

function renderSuggestionCards() {
  const existing = $("suggestionContainer");
  if (existing) existing.remove();

  const lang = localStorage.getItem("uiLang") || "en";
  const suggestions = chatSuggestionsData[lang] || chatSuggestionsData.en;
  
  const container = document.createElement("div");
  container.id = "suggestionContainer";
  container.className = "chat-suggestion-container";
  
  suggestions.forEach((item, index) => {
    const card = document.createElement("button");
    card.className = "chat-suggestion-card";
    const iconSvg = chatSuggestionIcons[index] || "";
    card.innerHTML = `
      <div class="suggestion-label" style="display: flex; align-items: center; gap: 0.35rem; font-weight: 600;">${iconSvg}<span>${item.label}</span></div>
      <div class="suggestion-text">"${item.text}"</div>
    `;
    card.addEventListener("click", () => {
      chatInput.value = item.text;
      sendChat();
    });
    container.appendChild(card);
  });
  
  chatWindow.appendChild(container);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function loadSession(id) {
  activeSessionId = id;
  const session = chatSessions.find(s => s.id === id);
  conversationHistory = session ? [...session.history] : [];
  chatWindow.innerHTML = "";
  
  if (conversationHistory.length === 0) {
    const welcomeText = welcomeMessages[farmerLang] || welcomeMessages.en;
    conversationHistory.push({ role: "model", text: welcomeText });
    if (session) {
      session.history = [...conversationHistory];
      saveSessions();
    }
  }
  
  // Re-render bubbles
  conversationHistory.forEach(msg => {
    // If msg.text contains an image-only placeholder, avoid empty html
    if (msg.text) {
      addChatBubble(msg.text, msg.role === 'user');
    }
  });
  
  // Render suggestion cards if it is a new chat
  if (conversationHistory.length === 1 && conversationHistory[0].role === 'model') {
    renderSuggestionCards();
  }
  
  renderSidebar();
}

function startNewChat() {
  // Reuse the existing top session if it has not been used yet (contains only the model welcome message)
  if (chatSessions.length > 0) {
    const topSession = chatSessions[0];
    if (topSession.history && topSession.history.length === 1 && topSession.history[0].role === "model") {
      activeSessionId = topSession.id;
      loadSession(activeSessionId);
      return;
    }
  }

  activeSessionId = Date.now().toString();
  const welcomeText = welcomeMessages[farmerLang] || welcomeMessages.en;
  chatSessions.unshift({ 
    id: activeSessionId, 
    title: "New Chat", 
    history: [{ role: "model", text: welcomeText }] 
  });
  saveSessions();
  loadSession(activeSessionId);
}

// Bubble rendering
function addChatBubble(text, isUser, animate = false) {
  const wrapper = document.createElement("div");
  wrapper.className = `chatgpt-message ${isUser ? "user" : "bot"}`;

  const inner = document.createElement("div");
  inner.className = "chatgpt-message-inner";

  const content = document.createElement("div");
  content.className = "chatgpt-content";

  // Minimal Markdown-to-HTML parser for Gemini output
  let parsedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  parsedText = parsedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  parsedText = parsedText.replace(/\n/g, '<br/>');

  let cardsContainer = null;
  // Insert interactive crop recommendation cards if the response matches agricultural purposes
  if (!isUser) {
    cardsContainer = parseChatCropRecommendations(text);
  }

  if (animate && !isUser) {
    content.innerHTML = "";
    let i = 0;
    let isTag = false;
    let currentHTML = "";
    function type() {
      if (i < parsedText.length) {
        if (parsedText.charAt(i) === '<') {
          // Fast-forward to the end of the HTML tag to avoid typing it out or causing recursion stack overflow
          let tagEnd = parsedText.indexOf('>', i);
          if (tagEnd === -1) tagEnd = parsedText.length - 1;
          currentHTML += parsedText.substring(i, tagEnd + 1);
          i = tagEnd + 1;
        } else {
          currentHTML += parsedText.charAt(i);
          i++;
        }
        
        content.innerHTML = currentHTML;
        chatWindow.scrollTop = chatWindow.scrollHeight;
        
        // Fast real-time typing speed
        setTimeout(type, 15); 
      } else {
        if (cardsContainer) {
          content.appendChild(cardsContainer);
          chatWindow.scrollTop = chatWindow.scrollHeight;
        }
      }
    }
    type();
  } else {
    content.innerHTML = parsedText;
    if (cardsContainer) {
      content.appendChild(cardsContainer);
    }
  }
  inner.appendChild(content);
  wrapper.appendChild(inner);

  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  return wrapper;
}

// Send Logic
async function sendChat() {
  const msg = chatInput.value.trim();
  if (!msg && !selectedImageFile) return;

  // Clear suggestions if they exist
  const sugContainer = $("suggestionContainer");
  if (sugContainer) {
    sugContainer.remove();
  }

  // Render User Bubble
  let bubbleText = msg;
  if (selectedImageFile && !msg) bubbleText = "<em>[Attached Image]</em>";
  else if (selectedImageFile && msg) bubbleText = msg + "<br/><em>[Attached Image]</em>";
  
  addChatBubble(bubbleText, true);

  // Grab values inside closure before resetting UI
  const currentMessage = msg || "Please describe this image.";
  const fileToUpload = selectedImageFile;

  chatInput.value = "";
  selectedImageFile = null;
  if (chatImageInput) chatImageInput.value = "";
  if (imagePreviewContainer) imagePreviewContainer.classList.add("hidden");

  // Show a temporary loading indicator
  const loaderId = "loader_" + Date.now();
  const loadingDiv = addChatBubble(`
    <div class="agri-loader-wrapper" id="${loaderId}" style="margin: 0; background: transparent; border: none; padding: 0.2rem 0; box-shadow: none; align-items: flex-start; backdrop-filter: none;">
      <div class="agri-loader-sprout" style="display: flex; align-items: center; gap: 0.5rem; flex-direction: row;">
        <svg class="plant-drawing-loader" viewBox="0 0 32 32" style="width: 24px; height: 24px; flex-shrink: 0;"><path class="plant-ground" d="M 6 30 L 26 30" /><path class="plant-stem" d="M 16 30 Q 14 20, 16 10" /><path class="plant-leaf leaf-left" d="M 15 20 Q 7 18, 10 13 Q 14 14, 15 17 Z" /><path class="plant-leaf leaf-right" d="M 16 14 Q 24 12, 21 7 Q 17 8, 16 11 Z" /><path class="plant-leaf leaf-top" d="M 16 10 Q 11 5, 16 2 Q 21 5, 16 10 Z" /></svg>
        <span class="agri-loader-text" style="font-size: 0.95rem; font-weight: 500; display: inline-flex; align-items: center;">
          Planting your question in our agricultural database...
        </span>
      </div>
    </div>
  `, false);
  loadingDiv.style.opacity = "0.9";

  const agriLoadingMessages = [
    `Planting your question in our agricultural database...`,
    `Tilling the soil of knowledge to find the best answer...`,
    `Watering the seeds of information...`,
    `Waiting for the sun to shine on the results...`,
    `Harvesting the best farming advice for you...`,
    `Composting the data to enrich the recommendation...`,
    `Cross-pollinating insights from precision agronomy...`
  ];

  let messageIndex = 0;
  const intervalId = setInterval(() => {
    const loaderEl = document.getElementById(loaderId);
    if (loaderEl) {
      messageIndex = (messageIndex + 1) % agriLoadingMessages.length;
      const textEl = loaderEl.querySelector(".agri-loader-text");
      if (textEl) {
        textEl.textContent = agriLoadingMessages[messageIndex];
      }
    } else {
      clearInterval(intervalId);
    }
  }, 2500);

  // Construct payload
  const formData = new FormData();
  formData.append("message", currentMessage);
  formData.append("conversationHistory", JSON.stringify(conversationHistory));
  formData.append("lang", farmerLang || 'en');
  if (fileToUpload) {
    formData.append("image", fileToUpload);
  }

  try {
        const token = localStorage.getItem("sessionToken") || "";
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      // Do NOT set Content-Type header so browser applies boundary automatically
      body: formData,
    });
    const data = await res.json();

    // Remove the loading indicator
    clearInterval(intervalId);
    chatWindow.removeChild(loadingDiv);

    if (!res.ok) {
      if (res.status === 429) {
        addChatBubble("Rate limit exceeded. Please wait a minute before sending more messages.", false);
        return;
      }
      if (res.status === 401 || res.status === 403) {
        addChatBubble(`Authentication Error (${res.status}): ${data.message || "Session expired. Please login again."}`, false);
        return;
      }
      addChatBubble("Error: " + (data.message || data.reply || "Server error"), false);
      return;
    }

    if (!data.ok) {
      addChatBubble("Error: " + (data.message || data.reply || "Server error"), false);
      return;
    }

    addChatBubble(data.reply || "No reply.", false, true);

    // Save history
    conversationHistory.push({ role: "user", text: currentMessage });
    conversationHistory.push({ role: "model", text: data.reply });
    
    // Auto-name Session
    const session = chatSessions.find(s => s.id === activeSessionId);
    if (session) {
      if ((!session.title || session.title === "New Chat" || session.title === "New chat") && currentMessage) {
        session.title = currentMessage.substring(0, 30) + (currentMessage.length > 30 ? "..." : "");
      }
      session.history = [...conversationHistory];
      saveSessions();
    }

  } catch (err) {
    clearInterval(intervalId);
    chatWindow.removeChild(loadingDiv);
    addChatBubble("Unable to reach chat service.", false);
  }
}

if (chatSendBtn) {
  chatSendBtn.addEventListener("click", sendChat);
}
if (chatInput) {
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  });
}

async function fetchChatHistoryFromServer() {
  const token = localStorage.getItem("sessionToken");
  if (!token) return;
  try {
    const res = await fetch("/api/chat/sessions", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.sessions)) {
        chatSessions = data.sessions;
        localStorage.setItem(`saarthi_chats_${farmerPhone}`, JSON.stringify(chatSessions));
        if (typeof renderSidebar === 'function') renderSidebar();
      }
    }
  } catch (e) {
    console.warn("Failed to fetch chat history from server database:", e);
  }
}

// Initial session logic
fetchChatHistoryFromServer().then(() => {
  startNewChat();
});

// Global localization logic for Chatbox page
const chatTranslations = {
  en: {
    dashLogoSubtitle: "Chatbox (Prototype)",
    navHome: "Home",
    navContactUs: "Contact Us",
    navProfile: "Profile",
    newChatBtnText: "New chat",
    chatUiTitle: "SAARTHI AI Chatbox",
    chatInput: "Message SAARTHI AI...",
    chatDisclaimer: "SAARTHI AI can make mistakes. Please verify critical farming recommendations contextually.",
    statusText: "Online | Crop Support"
  },
  te: {
    dashLogoSubtitle: "చాట్‌బాక్స్ (డెమో)",
    navHome: "హోమ్",
    navContactUs: "సంప్రదించండి",
    navProfile: "ప్రొఫైల్",
    newChatBtnText: "కొత్త చాట్",
    chatUiTitle: "SAARTHI AI చాట్‌బాక్స్",
    chatInput: "SAARTHI కి సందేశం పంపండి...",
    chatDisclaimer: "SAARTHI AI తప్పులు చేయవచ్చు. దయచేసి ముఖ్యమైన వ్యవసాయ సిఫార్సులను సరిచూసుకోండి.",
    statusText: "ఆన్‌లైన్ | పంటల మద్దతు"
  },
  hi: {
    dashLogoSubtitle: "चैटबॉक्स (डेमो)",
    navHome: "होम",
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    newChatBtnText: "नया चैट",
    chatUiTitle: "SAARTHI AI चैटबॉक्स",
    chatInput: "SAARTHI को संदेश भेजें...",
    chatDisclaimer: "SAARTHI AI गलतियां कर सकता है। कृपया महत्वपूर्ण खेती की सिफारिशों को सत्यापित करें।",
    statusText: "ऑनलाइन | फसल सहायता"
  },
  mr: {
    dashLogoSubtitle: "चॅटबॉक्स (डेमो)",
    navHome: "होम",
    navContactUs: "संपर्क",
    navProfile: "प्रोफाइल",
    newChatBtnText: "नवीन चॅट",
    chatUiTitle: "SAARTHI AI चॅटबॉक्स",
    chatInput: "SAARTHI ला संदेश पाठवा...",
    chatDisclaimer: "SAARTHI AI चुका करू शकतो. कृपया महत्त्वाच्या शेतीविषयक शिफारसी तपासून पहा.",
    statusText: "ऑनलाइन | पीक सहाय्य"
  },
  ml: {
    dashLogoSubtitle: "ചാറ്റ്ബോക്സ് (ഡെമോ)",
    navHome: "ഹോം",
    navContactUs: "ബന്ധപ്പെടുക",
    navProfile: "പ്രൊഫൈൽ",
    newChatBtnText: "പുതിയ ചാറ്റ്",
    chatUiTitle: "SAARTHI AI ചാറ്റ്ബോക്സ്",
    chatInput: "SAARTHI യ്ക്ക് സന്ദേശം അയക്കുക...",
    chatDisclaimer: "SAARTHI AI തെറ്റുകൾ വരുത്തിയേക്കാം. കാർഷിക നിർദ്ദേശങ്ങൾ ദയവായി പരിശോധിക്കുക.",
    statusText: "ഓൺലൈൻ | വിള സഹായം"
  }
};

function applyChatLanguage() {
  const farmerLang = localStorage.getItem("uiLang") || "en";
  const t = chatTranslations[farmerLang] || chatTranslations.en;
  
  if ($('dashLogoSubtitle')) $('dashLogoSubtitle').textContent = t.dashLogoSubtitle;
  if ($('navHome')) $('navHome').textContent = t.navHome;
  if ($('navContactUs')) $('navContactUs').textContent = t.navContactUs;
  if ($('navProfile')) $('navProfile').textContent = t.navProfile;
  
  if ($('newChatBtnText')) $('newChatBtnText').textContent = t.newChatBtnText;
  if ($('chatUiTitle')) $('chatUiTitle').textContent = t.chatUiTitle;
  if (chatInput) chatInput.placeholder = t.chatInput;
  if ($('chatDisclaimer')) $('chatDisclaimer').textContent = t.chatDisclaimer;
  if ($('statusText')) $('statusText').textContent = t.statusText;
}

applyChatLanguage();

// Chat Crop Recommendation Parsing & Interactive Cards
function parseChatCropRecommendations(text) {
  // Normalize potential squished category titles (missing newline)
  let normalizedText = text;
  const categoriesToSplit = [
    { pattern: /🌾\s*(?:\*\*)?Main Food Grains(?:\*\*)?/gi, replace: "\n🌾 Main Food Grains\n" },
    { pattern: /💰\s*(?:\*\*)?Cash\s*&\s*Commercial Crops(?:\*\*)?/gi, replace: "\n💰 Cash & Commercial Crops\n" },
    { pattern: /🥦\s*(?:\*\*)?Fast-Growing Vegetables(?:\*\*)?/gi, replace: "\n🥦 Fast-Growing Vegetables\n" },
    { pattern: /🌱\s*(?:\*\*)?Soil-Enriching Pulses(?:\s*\([^\)]*\))?(?:\*\*)?/gi, replace: "\n🌱 Soil-Enriching Pulses\n" }
  ];

  categoriesToSplit.forEach(cat => {
    normalizedText = normalizedText.replace(cat.pattern, cat.replace);
  });

  const lines = normalizedText.split('\n');
  let currentCategory = null;
  const categories = {
    grains: [],
    cash: [],
    vegetables: [],
    pulses: []
  };

  const categoryHeaders = [
    { key: "grains", matches: ["main food grains", "food grains", "grains"] },
    { key: "cash", matches: ["cash & commercial crops", "cash & commercial", "cash crops", "commercial crops"] },
    { key: "vegetables", matches: ["fast-growing vegetables", "vegetables", "solanaceous"] },
    { key: "pulses", matches: ["soil-enriching pulses", "pulses", "crop rotation"] }
  ];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check if it's a category header
    let matchedCat = null;
    const lowerLine = trimmed.toLowerCase();
    for (const cat of categoryHeaders) {
      if (cat.matches.some(m => lowerLine.includes(m))) {
        matchedCat = cat.key;
        break;
      }
    }

    if (matchedCat) {
      currentCategory = matchedCat;
      return;
    }

    // Parse the crop line if we are inside a category block
    if (currentCategory) {
      // Look for a ":" separating crop name/class and description
      const match = trimmed.match(/^(?:-\s*|\*\s*)?(?:\*\*)?([^*:]+)(?:\*\*)?\s*:\s*(.+)$/);
      if (match) {
        let name = match[1].trim();
        let desc = match[2].trim();
        name = name.replace(/^\*+/, '').replace(/\*+$/, '').trim();
        categories[currentCategory].push({ name, desc });
      }
    }
  });

  // Verify if we found any items in any category
  const hasCrops = Object.values(categories).some(arr => arr.length > 0);
  if (!hasCrops) return null;

  // Render container
  const container = document.createElement("div");
  container.className = "chat-categories-container";

  const getCropImg = (name, desc) => {
    const cropNameKey = ((name || "") + " " + (desc || "")).toLowerCase().trim();
    
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

  const CROP_BUTTON_MAPPINGS = [
    { keywords: ['paddy', 'rice'], label: '🌾 Rice', value: 'rice' },
    { keywords: ['maize', 'corn'], label: '🌽 Maize', value: 'maize' },
    { keywords: ['sugarcane'], label: '🎋 Sugarcane', value: 'sugarcane' },
    { keywords: ['turmeric'], label: '💛 Turmeric', value: 'turmeric' },
    { keywords: ['tomato', 'tomatoes'], label: '🍅 Tomato', value: 'tomato' },
    { keywords: ['brinjal', 'eggplant', 'brinjals', 'eggplants'], label: '🍆 Brinjal', value: 'brinjal' },
    { keywords: ['chilli', 'chillies'], label: '🌶️ Chilli', value: 'chilli' },
    { keywords: ['bitter gourd'], label: '🥒 Bitter Gourd', value: 'bittergourd' },
    { keywords: ['bottle gourd'], label: '🥒 Bottle Gourd', value: 'bottlegourd' },
    { keywords: ['snake gourd'], label: '🥒 Snake Gourd', value: 'snakegourd' },
    { keywords: ['black gram', 'blackgram'], label: '🌱 Black Gram', value: 'blackgram' },
    { keywords: ['green gram', 'greengram', 'mungbean', 'mung'], label: '🌱 Green Gram', value: 'mungbean' },
    { keywords: ['pigeonpea', 'pigeonpeas', 'tur dal', 'arhar'], label: '🌱 Pigeonpeas', value: 'pigeonpeas' },
    { keywords: ['mothbean', 'mothbeans'], label: '🌱 Mothbeans', value: 'mothbeans' },
    { keywords: ['chickpea', 'chickpeas'], label: '🌱 Chickpeas', value: 'chickpea' },
    { keywords: ['lentil', 'lentils'], label: '🌱 Lentils', value: 'lentil' },
    { keywords: ['pomegranate'], label: '🍎 Pomegranate', value: 'pomegranate' },
    { keywords: ['banana'], label: '🍌 Banana', value: 'banana' },
    { keywords: ['mango'], label: '🥭 Mango', value: 'mango' },
    { keywords: ['grape', 'grapes'], label: '🍇 Grapes', value: 'grapes' },
    { keywords: ['watermelon'], label: '🍉 Watermelon', value: 'watermelon' },
    { keywords: ['muskmelon'], label: '🍈 Muskmelon', value: 'muskmelon' },
    { keywords: ['apple'], label: '🍎 Apple', value: 'apple' },
    { keywords: ['orange'], label: '🍊 Orange', value: 'orange' },
    { keywords: ['papaya'], label: '🥭 Papaya', value: 'papaya' },
    { keywords: ['coconut'], label: '🥥 Coconut', value: 'coconut' },
    { keywords: ['cotton'], label: '🌾 Cotton', value: 'cotton' },
    { keywords: ['jute'], label: '🌾 Jute', value: 'jute' },
    { keywords: ['coffee'], label: '☕ Coffee', value: 'coffee' }
  ];

  const catNames = {
    grains: {
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
        </svg>Main Food Grains`,
      color: "#fefcf0",
      border: "#fef08a"
    },
    cash: {
      title: `
        <svg viewBox="0 0 64 64" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px; display: inline-block;">
          <circle cx="32" cy="36" r="18" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
          <circle cx="32" cy="36" r="13" fill="#facc15" stroke="#ca8a04" stroke-width="1" stroke-dasharray="3 2"/>
          <path d="M28 30H36M28 34H34M32 30C35 30 35 38 32 38H28M31 38L35 44" stroke="#854d0e" stroke-width="2" stroke-linecap="round"/>
          <path d="M32 20C32 20 26 15 26 10C26 8 28 6 30 8C32 10 32 20 32 20Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <path d="M32 20C32 20 38 15 38 10C38 8 36 6 34 8C32 10 32 20 32 20Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <path d="M32 30V20" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
        </svg>Cash & Commercial Crops`,
      color: "#f0fdf4",
      border: "#bbf7d0"
    },
    vegetables: {
      title: `
        <svg viewBox="0 0 64 64" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px; display: inline-block;">
          <path d="M32 50C43.0457 50 52 41.9411 52 32C52 22.0589 43.0457 14 32 14C20.9543 14 12 22.0589 12 32C12 41.9411 20.9543 50 32 50Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
          <path d="M32 14C32 14 30 6 26 8C22 10 28 16 28 16Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <path d="M32 14C32 14 34 6 38 8C42 10 36 16 36 16Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <path d="M32 14C32 14 32 5 32 5" stroke="#15803d" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M20 24C17 28 17 34 20 38" stroke="#fee2e2" stroke-width="1.5" stroke-linecap="round"/>
        </svg>Fast-Growing Vegetables`,
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
        </svg>Soil-Enriching Pulses`,
      color: "#faf5ff",
      border: "#e9d5ff"
    }
  };

  for (const [catKey, cropList] of Object.entries(categories)) {
    if (cropList.length === 0) continue;
    
    const catData = catNames[catKey] || { title: catKey, color: "#f8fafc", border: "#cbd5e1" };

    const catDiv = document.createElement("div");
    catDiv.className = "chat-crop-category-block";
    catDiv.style.border = `1px solid ${catData.border}`;
    catDiv.style.background = catData.color;

    const catTitle = document.createElement("div");
    catTitle.className = "chat-crop-category-title";
    catTitle.innerHTML = catData.title;
    catDiv.appendChild(catTitle);

    const grid = document.createElement("div");
    grid.className = "chat-crop-grid";

    cropList.forEach(crop => {
      // Find matching crops to provide action buttons
      const combinedLower = (crop.name + " " + crop.desc).toLowerCase();
      const matchedActions = [];
      CROP_BUTTON_MAPPINGS.forEach(mapping => {
        if (mapping.keywords.some(kw => combinedLower.includes(kw))) {
          if (!matchedActions.some(act => act.value === mapping.value)) {
            matchedActions.push(mapping);
          }
        }
      });

      const card = document.createElement("div");
      card.className = "chat-crop-card";

      const img = document.createElement("div");
      img.className = "chat-crop-card-image";
      img.style.backgroundImage = `url('${getCropImg(crop.name, crop.desc)}')`;

      const content = document.createElement("div");
      content.className = "chat-crop-card-content";

      const nameEl = document.createElement("h3");
      nameEl.className = "chat-crop-card-title";
      nameEl.textContent = crop.name;

      const descEl = document.createElement("p");
      descEl.className = "chat-crop-card-desc";
      descEl.textContent = crop.desc;

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "chat-crop-actions";

      matchedActions.forEach(action => {
        const btn = document.createElement("button");
        btn.className = "chat-crop-select-btn";
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:2px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Select ${action.label}`;
        btn.onclick = () => selectCropFromChat(action.value);
        actionsDiv.appendChild(btn);
      });

      content.appendChild(nameEl);
      content.appendChild(descEl);
      if (matchedActions.length > 0) {
        content.appendChild(actionsDiv);
      }

      card.appendChild(img);
      card.appendChild(content);
      grid.appendChild(card);
    });

    catDiv.appendChild(grid);
    container.appendChild(catDiv);
  }

  return container;
}

async function selectCropFromChat(cropName) {
  try {
    const token = localStorage.getItem("sessionToken") || "";
    // Call server API to select crop
    const res = await fetch("/api/select-crop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        crop: cropName,
        acres: 1.0 // default acres
      })
    });
    
    const data = await res.json();
    if (data.ok) {
      // Save locally
      localStorage.setItem("selectedCrop", JSON.stringify({
        name: cropName,
        acres: 1.0,
        at: new Date().toISOString()
      }));
      
      // Show confirmation toast
      showToastNotification(`Successfully selected ${cropName.toUpperCase()} as your active crop!`);
    } else {
      showToastNotification(`Failed to select crop: ${data.message || 'Error'}`, true);
    }
  } catch (err) {
    console.error("Error selecting crop from chat:", err);
    showToastNotification("Could not save crop selection.", true);
  }
}

function showToastNotification(message, isError = false) {
  let toast = document.getElementById("chatToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "chatToast";
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

// Model Selector Dropdown logic
(function initModelSelector() {
  const modelSelectBtn = document.getElementById("modelSelectBtn");
  const modelDropdown = document.getElementById("modelDropdown");
  const modelSelector = document.getElementById("modelSelector");
  const chatInputEl = document.getElementById("chatInput");
  const chatUiTitleEl = document.getElementById("chatUiTitle");

  if (modelSelectBtn && modelDropdown && modelSelector) {
    // Toggle dropdown visibility
    modelSelectBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = modelDropdown.classList.contains("hidden");
      if (isHidden) {
        modelDropdown.classList.remove("hidden");
        modelSelector.classList.add("open");
      } else {
        modelDropdown.classList.add("hidden");
        modelSelector.classList.remove("open");
      }
    });

    // Handle selection of a model
    const dropdownItems = modelDropdown.querySelectorAll(".model-dropdown-item");
    dropdownItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Remove active class from all and add to clicked
        dropdownItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        const selectedModel = item.getAttribute("data-model");
        const modelTitle = item.querySelector(".model-item-title").textContent;

        // Update selector text
        if (chatUiTitleEl) {
          chatUiTitleEl.textContent = modelTitle;
        } else {
          const nameSpan = modelSelectBtn.querySelector(".model-name");
          if (nameSpan) nameSpan.textContent = modelTitle;
        }

        // Update placeholder contextually
        if (chatInputEl) {
          switch (selectedModel) {
            case "saarthi-ai":
              chatInputEl.placeholder = "Message SAARTHI AI...";
              break;
            case "crop-support":
              chatInputEl.placeholder = "Ask about soil, water, crops, or fertilizers...";
              break;
            case "disease-detection":
              chatInputEl.placeholder = "Upload leaf image or ask about plant diseases...";
              break;
            case "market-prices":
              chatInputEl.placeholder = "Enter crop name or location for mandi prices...";
              break;
            default:
              chatInputEl.placeholder = "Message SAARTHI AI...";
          }
        }

        // Close dropdown
        modelDropdown.classList.add("hidden");
        modelSelector.classList.remove("open");
      });
    });

    // Close dropdown on click outside
    document.addEventListener("click", (e) => {
      if (!modelSelector.contains(e.target)) {
        modelDropdown.classList.add("hidden");
        modelSelector.classList.remove("open");
      }
    });
  }
})();
