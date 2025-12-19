(() => {
  const elements = {
    ctaButton: document.getElementById("ctaButton"),
    ctaButtonBottom: document.getElementById("ctaButtonBottom"),
  };

  const langSelect = document.getElementById("langSelect");
  const flagPaths = {
    ja: "/assets/flags/jp.svg",
    en: "/assets/flags/gb.svg",
    "zh-TW": "/assets/flags/tw.svg",
    th: "/assets/flags/th.svg",
  };
  const globeIconPath = "/assets/globe.svg";
  const triggerLabel = "LANGUAGE";
  const langPaths = {
    ja: "/pro.html",
    en: "/en/pro.html",
    "zh-TW": "/zh-tw/pro.html",
    th: "/th/pro.html",
  };

  const lineButtonAssets = {
    ja: {
      src: "https://scdn.line-apps.com/n/line_add_friends/btn/ja.png",
      alt: "友だち追加",
    },
    en: {
      src: "https://scdn.line-apps.com/n/line_add_friends/btn/en.png",
      alt: "Add friend",
    },
    "zh-TW": {
      src: "https://scdn.line-apps.com/n/line_add_friends/btn/zh-Hant.png",
      alt: "加入好友",
    },
    th: {
      src: "https://scdn.line-apps.com/n/line_add_friends/btn/th.png",
      alt: "เพิ่มเพื่อน",
    },
  };

  let customSelectEl;
  let customOptionsEl;
  let customTriggerEl;
  let customTriggerFlagEl;
  let customTriggerTextEl;
  let lineButtonTop;
  let lineButtonBottom;
  let currentLang = "ja";

  const params = new URLSearchParams(window.location.search);
  const checkoutId = params.get("session_id") || params.get("sessionId");
  const checkoutUrlParam = params.get("checkout_url");
  const apiBaseParam = params.get("api_base") || params.get("apiBase");

  function buildApiUrl(path) {
    if (!apiBaseParam) return path;
    const normalized = apiBaseParam.replace(/\/+$/, "");
    return `${normalized}${path}`;
  }
  const checkoutUrl =
    checkoutUrlParam ||
    (checkoutId
      ? buildApiUrl(`/checkout?session_id=${encodeURIComponent(checkoutId)}`)
      : null);

  // 既存購読チェック用エンドポイント
  const checkoutStatusUrl =
    checkoutId && checkoutUrl
      ? buildApiUrl(`/checkout?session_id=${encodeURIComponent(checkoutId)}&mode=status`)
      : null;

  async function fetchCheckoutStatus() {
    if (!checkoutStatusUrl) return null;
    try {
      const res = await fetch(checkoutStatusUrl, { method: "GET" });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn("Failed to fetch checkout status", err);
      return null;
    }
  }

  function normalizeLang(raw) {
    if (!raw) return null;
    const value = raw.toLowerCase();
    if (value.startsWith("ja")) return "ja";
    if (value.startsWith("zh")) return "zh-TW";
    if (value.startsWith("th")) return "th";
    return "en";
  }

  function getPathLang(pathname) {
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];
    if (!first) return null;
    const value = first.toLowerCase();
    if (value === "en") return "en";
    if (value === "zh-tw" || value === "zh_tw") return "zh-TW";
    if (value === "th") return "th";
    return null;
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

  function getLineButtonAsset(lang) {
    return lineButtonAssets[lang] || lineButtonAssets.ja;
  }

  function updateLineButtonAssets(lang) {
    const asset = getLineButtonAsset(lang);
    [lineButtonTop, lineButtonBottom].forEach((btn) => {
      if (!btn) return;
      const img = btn.querySelector("img");
      if (!img) return;
      img.src = asset.src;
      img.alt = asset.alt;
    });
  }

  function updateCustomSelected(lang) {
    if (!customTriggerEl || !customTriggerFlagEl || !customTriggerTextEl) return;
    const selectedOption =
      Array.from(langSelect?.options || []).find((opt) => opt.value === lang) ||
      langSelect?.options?.[0];
    customTriggerFlagEl.src = globeIconPath;
    customTriggerTextEl.textContent = triggerLabel;

    if (customOptionsEl) {
      Array.from(customOptionsEl.children).forEach((li) => {
        const isActive = li.dataset.value === lang;
        li.classList.toggle("active", isActive);
        li.setAttribute("aria-selected", String(isActive));
      });
    }
  }

  function buildCustomSelect() {
    if (!langSelect) return;

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

  function navigateToLang(lang) {
    const targetPath = langPaths[lang] || "/pro.html";
    const currentPath = window.location.pathname;
    if (currentPath !== targetPath) {
      window.location.href = new URL(targetPath, window.location.origin).toString();
      return;
    }
  }

  function createLineAddButton(lang) {
    const anchor = document.createElement("a");
    anchor.href = "https://lin.ee/5roFh0n";
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.className = "line-add-btn";

    const asset = getLineButtonAsset(lang);
    const img = document.createElement("img");
    img.src = asset.src;
    img.alt = asset.alt;
    img.height = 36;
    img.border = 0;

    anchor.appendChild(img);
    return anchor;
  }

  function showLineButton(isCheckoutAvailable) {
    const ctaTop = document.getElementById("cta");
    const ctaBottom = document.getElementById("ctaBottom");

    if (!isCheckoutAvailable) {
      if (!lineButtonTop && ctaTop) {
        lineButtonTop = createLineAddButton(currentLang);
        ctaTop.insertBefore(lineButtonTop, ctaTop.firstChild);
      }
      if (!lineButtonBottom && ctaBottom) {
        lineButtonBottom = createLineAddButton(currentLang);
        ctaBottom.insertBefore(lineButtonBottom, ctaBottom.firstChild);
      }
      updateLineButtonAssets(currentLang);
    } else {
      if (lineButtonTop?.parentNode) lineButtonTop.remove();
      if (lineButtonBottom?.parentNode) lineButtonBottom.remove();
      lineButtonTop = null;
      lineButtonBottom = null;
    }
  }

  function initLanguage() {
    const urlLang = normalizeLang(
      params.get("lang") || params.get("language") || params.get("locale")
    );
    const pathLang = getPathLang(window.location.pathname);
    const initial = pathLang || urlLang || "ja";
    currentLang = initial;
    if (langSelect) {
      langSelect.value = initial;
      const flagUrl = flagPaths[initial] || flagPaths.ja;
      const cssUrl = `url("${flagUrl}")`;
      langSelect.style.setProperty("--flag-image", cssUrl);
    }
    updateCustomSelected(initial);
    updateLineButtonAssets(initial);
  }

  function initCta() {
    if (!checkoutUrl) {
      disableCta();
      showLineButton(false);
      return;
    }

    // デフォルトは有効化。購読済み確認後に上書き。
    enableCta(checkoutUrl);
    showLineButton(true);

    fetchCheckoutStatus().then((status) => {
      if (status?.proActive) {
        disableCta(
          currentLang === "ja"
            ? "このグループは既にProプランに加入済みです"
            : "This group is already on the Pro plan"
        );
        showLineButton(false);
      }
    });
  }

  function enableCta(url) {
    elements.ctaButton.href = url;
    elements.ctaButton.removeAttribute("aria-disabled");
    elements.ctaButton.style.display = "inline-flex";
    if (elements.ctaButtonBottom) {
      elements.ctaButtonBottom.href = url;
      elements.ctaButtonBottom.removeAttribute("aria-disabled");
      elements.ctaButtonBottom.style.display = "inline-flex";
    }
  }

  function disableCta(reasonText) {
    elements.ctaButton.href = "#";
    elements.ctaButton.setAttribute("aria-disabled", "true");
    elements.ctaButton.style.display = "none";
    if (elements.ctaButtonBottom) {
      elements.ctaButtonBottom.href = "#";
      elements.ctaButtonBottom.setAttribute("aria-disabled", "true");
      elements.ctaButtonBottom.style.display = "none";
    }

    if (reasonText) {
      const notice = document.createElement("p");
      notice.className = "cta-notice";
      notice.textContent = reasonText;
      const ctaTop = document.getElementById("cta");
      if (ctaTop) {
        ctaTop.appendChild(notice);
      }
    }
  }

  if (langSelect) {
    buildCustomSelect();
    langSelect.addEventListener("change", (e) => navigateToLang(e.target.value));
  }

  initLanguage();
  initCta();
})();
