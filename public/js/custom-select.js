// Reusable Custom Select Dropdown Converter
function convertToCustomSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Exclude language selects from form-select-wrapper conversion (they have built-in custom rounded dropdowns)
  if (selectId === "dashLangSelect" || selectId === "topLanguageSelect" || select.className.includes("dash-lang-select")) {
    return;
  }

  // If already custom-converted, don't convert again
  if (select.dataset.customConverted === "true") return;
  select.dataset.customConverted = "true";

  // Hide native select
  select.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = "form-select-wrapper";
  
  // Set wrapper classes or widths depending on select class
  if (select.className.includes("dash-lang-select") || select.id === "topLanguageSelect") {
    wrapper.style.display = "inline-block";
    wrapper.style.width = "auto";
    wrapper.style.minWidth = "120px";
  }

  const trigger = document.createElement("div");
  trigger.className = "form-select-trigger";
  trigger.tabIndex = 0;
  
  const labelSpan = document.createElement("span");
  labelSpan.textContent = select.options[select.selectedIndex]?.text || "";
  trigger.appendChild(labelSpan);
  
  const optionsContainer = document.createElement("div");
  optionsContainer.className = "form-select-options";
  
  function populateOptions() {
    optionsContainer.innerHTML = "";
    Array.from(select.options).forEach((opt) => {
      const optDiv = document.createElement("div");
      optDiv.className = "form-select-option";
      if (opt.value === select.value) {
        optDiv.classList.add("selected");
      }
      optDiv.textContent = opt.text;
      optDiv.dataset.value = opt.value;
      
      // Mouse/Hover listeners to guarantee color highlight regardless of browser defaults
      optDiv.addEventListener("mouseenter", () => optDiv.classList.add("hover-state"));
      optDiv.addEventListener("mouseleave", () => optDiv.classList.remove("hover-state"));
      
      // Touch/Tap support for mobile viewports
      optDiv.addEventListener("touchstart", () => optDiv.classList.add("hover-state"), {passive: true});
      optDiv.addEventListener("touchend", () => optDiv.classList.remove("hover-state"), {passive: true});
      
      optDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        select.value = opt.value;
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        labelSpan.textContent = opt.text;
        wrapper.querySelectorAll(".form-select-option").forEach(el => el.classList.remove("selected"));
        optDiv.classList.add("selected");
        wrapper.classList.remove("open");
      });
      optionsContainer.appendChild(optDiv);
    });
  }

  populateOptions();

  // Watch for changes in native options (e.g. language translation repopulating)
  const observer = new MutationObserver(() => {
    populateOptions();
    labelSpan.textContent = select.options[select.selectedIndex]?.text || "";
  });
  observer.observe(select, { childList: true, characterData: true, subtree: true });
  
  wrapper.appendChild(trigger);
  wrapper.appendChild(optionsContainer);
  select.parentNode.insertBefore(wrapper, select.nextSibling);
  
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".form-select-wrapper").forEach(w => {
      if (w !== wrapper) w.classList.remove("open");
    });
    wrapper.classList.toggle("open");
  });
  
  document.addEventListener("click", () => {
    wrapper.classList.remove("open");
  });
}

// Convert all selects automatically
function autoConvertAllSelects() {
  const selects = document.querySelectorAll("select");
  selects.forEach(select => {
    if (select.id) {
      convertToCustomSelect(select.id);
    } else {
      // Assign dynamic ID if none exists
      const tempId = "custom_select_" + Math.floor(Math.random() * 1000000);
      select.id = tempId;
      convertToCustomSelect(tempId);
    }
  });
}

window.addEventListener("DOMContentLoaded", autoConvertAllSelects);
// Run immediately as script loads for pre-rendered elements
setTimeout(autoConvertAllSelects, 100);

// Global touchstart listener to enable CSS :active pseudo-class state on mobile touch screens
document.addEventListener("touchstart", function() {}, {passive: true});

// Generic touch/hover state helper for other custom dropdown classes using delegation
function applyHoverStateHelper(selector) {
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest(selector);
    if (el) el.classList.add("hover-state");
  });
  document.addEventListener("mouseout", (e) => {
    const el = e.target.closest(selector);
    if (el) el.classList.remove("hover-state");
  });
  document.addEventListener("touchstart", (e) => {
    const el = e.target.closest(selector);
    if (el) el.classList.add("hover-state");
  }, {passive: true});
  document.addEventListener("touchend", (e) => {
    const el = e.target.closest(selector);
    if (el) el.classList.remove("hover-state");
  }, {passive: true});
}

// Bind delegates for all custom select/dropdown menus on the website
applyHoverStateHelper(".profile-dropdown-item");
applyHoverStateHelper(".custom-select-option");
applyHoverStateHelper(".autocomplete-item");
applyHoverStateHelper(".model-dropdown-item");
