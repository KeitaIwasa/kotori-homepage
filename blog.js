(() => {
  const langSelect = document.getElementById("langSelect");
  if (!langSelect) return;

  const flagPaths = {
    ja: "/assets/flags/jp.svg",
    en: "/assets/flags/gb.svg",
    "zh-TW": "/assets/flags/tw.svg",
    th: "/assets/flags/th.svg",
  };
  const globeIconPath = "/assets/globe.svg";
  const triggerLabel = "LANGUAGE";

  let customSelectEl;
  let customOptionsEl;
  let customTriggerEl;
  let customTriggerFlagEl;
  let customTriggerTextEl;

  function getPathLang(pathname) {
    const segment = pathname.split("/").filter(Boolean)[0];
    if (!segment) return "ja";
    const value = segment.toLowerCase();
    if (value === "en") return "en";
    if (value === "zh-tw" || value === "zh_tw") return "zh-TW";
    if (value === "th") return "th";
    return "ja";
  }

  function stripLangPrefix(pathname) {
    return pathname.replace(/^\/(?:en|zh-tw|th)(?=\/|$)/i, "") || "/";
  }

  function targetPrefix(lang) {
    if (lang === "ja") return "";
    if (lang === "zh-TW") return "/zh-tw";
    if (lang === "th") return "/th";
    return "/en";
  }

  function navigateToLang(lang) {
    const corePath = stripLangPrefix(window.location.pathname);
    const nextPath = `${targetPrefix(lang)}${corePath}` || "/";
    const url = new URL(nextPath, window.location.origin);
    window.location.href = url.toString();
  }

  function toggleOptions(forceOpen) {
    if (!customSelectEl || !customTriggerEl || !customOptionsEl) return;
    const willOpen =
      typeof forceOpen === "boolean"
        ? forceOpen
        : !customSelectEl.classList.contains("open");
    customSelectEl.classList.toggle("open", willOpen);
    customTriggerEl.setAttribute("aria-expanded", String(willOpen));
  }

  function updateCustomSelected(lang) {
    if (!customTriggerEl || !customTriggerFlagEl || !customTriggerTextEl) return;
    const selectedOption =
      Array.from(langSelect.options).find((opt) => opt.value === lang) ||
      langSelect.options[0];

    customTriggerFlagEl.src = globeIconPath;
    customTriggerTextEl.textContent = triggerLabel;

    if (customOptionsEl) {
      Array.from(customOptionsEl.children).forEach((li) => {
        const isActive = li.dataset.value === lang;
        li.classList.toggle("active", isActive);
        li.setAttribute("aria-selected", String(isActive));
      });
    }

    if (selectedOption) {
      langSelect.value = selectedOption.value;
      const flagUrl = flagPaths[selectedOption.value] || flagPaths.ja;
      const cssUrl = `url("${flagUrl}")`;
      langSelect.style.setProperty("--flag-image", cssUrl);
    }
  }

  function buildCustomSelect() {
    langSelect.style.display = "none";

    customSelectEl = document.createElement("div");
    customSelectEl.className = "lang-select-custom";

    customTriggerEl = document.createElement("button");
    customTriggerEl.type = "button";
    customTriggerEl.className = "lang-select-trigger";
    customTriggerEl.setAttribute("aria-haspopup", "listbox");
    customTriggerEl.setAttribute("aria-expanded", "false");
    customTriggerEl.setAttribute("aria-label", "Language selector");

    customTriggerFlagEl = document.createElement("img");
    customTriggerFlagEl.className = "lang-globe";
    customTriggerFlagEl.alt = "";
    customTriggerFlagEl.src = globeIconPath;

    customTriggerTextEl = document.createElement("span");
    customTriggerTextEl.className = "lang-selected-label";
    customTriggerTextEl.textContent = triggerLabel;

    const arrowEl = document.createElement("span");
    arrowEl.className = "lang-select-arrow";
    arrowEl.textContent = "▾";

    customTriggerEl.append(customTriggerFlagEl, customTriggerTextEl, arrowEl);

    customOptionsEl = document.createElement("ul");
    customOptionsEl.className = "lang-select-options";
    customOptionsEl.setAttribute("role", "listbox");

    Array.from(langSelect.options).forEach((opt) => {
      const li = document.createElement("li");
      li.className = "lang-select-option";
      li.dataset.value = opt.value;
      li.setAttribute("role", "option");

      const flagImg = document.createElement("img");
      flagImg.className = "lang-flag";
      flagImg.alt = "";
      flagImg.src = flagPaths[opt.value] || flagPaths.ja;

      const text = document.createElement("span");
      text.textContent = opt.textContent;

      li.append(flagImg, text);
      li.addEventListener("click", () => {
        navigateToLang(opt.value);
        toggleOptions(false);
      });

      customOptionsEl.appendChild(li);
    });

    customSelectEl.append(customTriggerEl, customOptionsEl);
    langSelect.insertAdjacentElement("afterend", customSelectEl);

    customTriggerEl.addEventListener("click", () => toggleOptions());
    document.addEventListener("click", (event) => {
      if (!customSelectEl.contains(event.target)) toggleOptions(false);
    });
  }

  buildCustomSelect();
  langSelect.addEventListener("change", (event) => navigateToLang(event.target.value));
  updateCustomSelected(getPathLang(window.location.pathname));
})();
