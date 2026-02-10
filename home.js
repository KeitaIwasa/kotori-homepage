(() => {
  const KOTORI_API_BASE = "https://h2xf6dwz5e.execute-api.ap-northeast-1.amazonaws.com/prod";

  const langSelect = document.getElementById("langSelect");
  if (!langSelect) return;
  const totalUsersSection = document.getElementById("totalUsersSection");
  const totalUsersValue = document.getElementById("totalUsersValue");
  const params = new URLSearchParams(window.location.search);

  const langPaths = {
    ja: "/",
    en: "/en/",
    "zh-TW": "/zh-tw/",
    th: "/th/",
  };

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
  let currentLang = "ja";

  function getPathLang(pathname) {
    const segment = pathname.split("/").filter(Boolean)[0];
    if (!segment) return "ja";
    const value = segment.toLowerCase();
    if (value === "en") return "en";
    if (value === "zh-tw" || value === "zh_tw") return "zh-TW";
    if (value === "th") return "th";
    return "ja";
  }

  function resolveApiBase() {
    const override = params.get("api_base") || params.get("apiBase");
    const base = (override || KOTORI_API_BASE || "").trim();
    return base.replace(/\/+$/, "");
  }

  function buildApiUrl(path) {
    const base = resolveApiBase();
    if (!base) return "";
    return `${base}${path}`;
  }

  async function fetchTotalUsers() {
    const url = buildApiUrl("/stats/total-users");
    if (!url) return null;
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) return null;
    const payload = await response.json();
    const value = payload?.totalUsers;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
    return Math.trunc(value);
  }

  function formatUserCount(value) {
    const localeMap = {
      ja: "ja-JP",
      en: "en-US",
      "zh-TW": "zh-TW",
      th: "th-TH",
    };
    const locale = localeMap[currentLang] || "en-US";
    return value.toLocaleString(locale);
  }

  function hideTotalUsers() {
    if (!totalUsersSection) return;
    totalUsersSection.hidden = true;
  }

  function animateCount(target) {
    if (!totalUsersValue) return;
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      totalUsersValue.textContent = formatUserCount(current);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function showTotalUsers(value) {
    if (!totalUsersSection || !totalUsersValue) return;
    totalUsersSection.hidden = false;

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(value);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(totalUsersSection);
    } else {
      animateCount(value);
    }
  }

  function initTotalUsers() {
    if (!totalUsersSection || !totalUsersValue) return;
    fetchTotalUsers()
      .then((totalUsers) => {
        if (totalUsers === null) {
          hideTotalUsers();
          return;
        }
        showTotalUsers(totalUsers);
      })
      .catch(() => {
        hideTotalUsers();
      });
  }

  function navigateToLang(lang) {
    const targetPath = langPaths[lang] || "/";
    const currentPath = window.location.pathname;
    if (currentPath !== targetPath) {
      window.location.href = new URL(targetPath, window.location.origin).toString();
    }
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
    document.addEventListener("click", (e) => {
      if (!customSelectEl.contains(e.target)) toggleOptions(false);
    });
  }

  buildCustomSelect();
  langSelect.addEventListener("change", (e) => navigateToLang(e.target.value));
  currentLang = getPathLang(window.location.pathname);
  updateCustomSelected(currentLang);
  initTotalUsers();
})();
