(() => {
  const langSelect = document.getElementById("langSelect");
  const statusText = document.getElementById("statusText");
  const scheduleText = document.getElementById("scheduleText");
  const errorText = document.getElementById("errorText");
  const currentPlanValue = document.getElementById("currentPlanValue");
  const buyStandardBtn = document.getElementById("buyStandardBtn");
  const buyProBtn = document.getElementById("buyProBtn");
  const periodSelect = document.getElementById("periodSelect");
  const intervalButtons = document.querySelectorAll("[data-interval]");
  const contactLink = document.getElementById("contactLink");
  const statusPanel = document.querySelector(".pro-status-panel");
  const priceFields = document.querySelectorAll("[data-price-month][data-price-year]");
  const planCards = document.querySelectorAll("[data-plan-card]");

  const params = new URLSearchParams(window.location.search);
  const st = (params.get("st") || "").trim();
  const apiBaseParam = (params.get("api_base") || params.get("apiBase") || "").trim();
  const flagPaths = {
    ja: "/assets/flags/jp.svg",
    en: "/assets/flags/gb.svg",
    "zh-TW": "/assets/flags/tw.svg",
    th: "/assets/flags/th.svg",
  };
  const globeIconPath = "/assets/globe.svg";
  const triggerLabel = "LANGUAGE";

  const LANG_PATHS = {
    ja: "/pro.html",
    en: "/en/pro.html",
    "zh-TW": "/zh-tw/pro.html",
    th: "/th/pro.html",
  };

  const MESSAGES = {
    ja: {
      noToken: "LINEボットからアクセスしてください。グループ情報トークンが見つかりません。",
      invalidToken: "トークンが無効または期限切れです。LINEボットの案内リンクを開き直してください。",
      unknown: "状態の取得に失敗しました。時間をおいて再試行してください。",
      changing: "処理中です...",
      checkoutCreated: "決済ページへ移動します。",
      changedImmediately: "プラン変更を反映しました。",
      scheduled: "次回更新時のプラン変更を予約しました。",
      alreadyCurrent: "このプランは既に適用されています。",
      currentFree: "Free",
      currentStandard: "Standard",
      currentPro: "Pro",
      statusPrefix: "現在のプラン:",
      schedulePrefix: "予約中の変更:",
      priorityContact: "お問い合わせ",
    },
    en: {
      noToken: "Open this page from the LINE bot. Group token is missing.",
      invalidToken: "Token is invalid or expired. Please reopen the link from the LINE bot.",
      unknown: "Failed to fetch subscription status. Please try again later.",
      changing: "Processing...",
      checkoutCreated: "Redirecting to checkout...",
      changedImmediately: "Plan change applied.",
      scheduled: "Plan change is scheduled for the next renewal.",
      alreadyCurrent: "This plan is already active.",
      currentFree: "Free",
      currentStandard: "Standard",
      currentPro: "Pro",
      statusPrefix: "Current plan:",
      schedulePrefix: "Scheduled change:",
      priorityContact: "Contact",
    },
    "zh-TW": {
      noToken: "請從 LINE 機器人的連結開啟此頁面，找不到群組憑證。",
      invalidToken: "憑證無效或已過期，請重新從 LINE 機器人開啟連結。",
      unknown: "無法取得訂閱狀態，請稍後再試。",
      changing: "處理中...",
      checkoutCreated: "正在前往結帳頁面...",
      changedImmediately: "已套用方案變更。",
      scheduled: "已預約於下次續約時變更方案。",
      alreadyCurrent: "此方案已在使用中。",
      currentFree: "Free",
      currentStandard: "Standard",
      currentPro: "Pro",
      statusPrefix: "目前方案:",
      schedulePrefix: "預約變更:",
      priorityContact: "聯絡我們",
    },
    th: {
      noToken: "กรุณาเปิดหน้านี้จากลิงก์ใน LINE bot ไม่พบโทเค็นกลุ่ม",
      invalidToken: "โทเค็นไม่ถูกต้องหรือหมดอายุ กรุณาเปิดลิงก์จาก LINE bot อีกครั้ง",
      unknown: "ไม่สามารถดึงสถานะการสมัครได้ กรุณาลองใหม่อีกครั้ง",
      changing: "กำลังดำเนินการ...",
      checkoutCreated: "กำลังไปยังหน้าชำระเงิน...",
      changedImmediately: "อัปเดตแพ็กเกจเรียบร้อยแล้ว",
      scheduled: "ตั้งเวลาการเปลี่ยนแพ็กเกจในรอบถัดไปแล้ว",
      alreadyCurrent: "แพ็กเกจนี้ถูกใช้งานอยู่แล้ว",
      currentFree: "Free",
      currentStandard: "Standard",
      currentPro: "Pro",
      statusPrefix: "แพ็กเกจปัจจุบัน:",
      schedulePrefix: "การเปลี่ยนที่ตั้งเวลาไว้:",
      priorityContact: "ติดต่อเรา",
    },
  };

  let currentLang = getPathLang(window.location.pathname);
  let currentStatus = null;
  let customSelectEl;
  let customOptionsEl;
  let customTriggerEl;
  let customTriggerFlagEl;
  let customTriggerTextEl;

  function t(key) {
    const table = MESSAGES[currentLang] || MESSAGES.ja;
    return table[key] || MESSAGES.ja[key] || "";
  }

  function getPathLang(pathname) {
    const segment = pathname.split("/").filter(Boolean)[0];
    if (!segment) return "ja";
    const value = segment.toLowerCase();
    if (value === "en") return "en";
    if (value === "zh-tw" || value === "zh_tw") return "zh-TW";
    if (value === "th") return "th";
    return "ja";
  }

  function buildApiUrl(path) {
    const base = apiBaseParam.replace(/\/+$/, "");
    if (!base) {
      return path;
    }
    return `${base}${path}`;
  }

  function withSharedParams(path) {
    const url = new URL(path, window.location.origin);
    if (st) {
      url.searchParams.set("st", st);
    }
    if (apiBaseParam) {
      url.searchParams.set("api_base", apiBaseParam);
    }
    return url.toString();
  }

  function toggleLangOptions(forceOpen) {
    if (!customSelectEl || !customTriggerEl || !customOptionsEl) return;
    const willOpen =
      typeof forceOpen === "boolean"
        ? forceOpen
        : !customSelectEl.classList.contains("open");
    customSelectEl.classList.toggle("open", willOpen);
    customTriggerEl.setAttribute("aria-expanded", String(willOpen));
  }

  function updateCustomLangSelected(lang) {
    if (!customTriggerEl || !customTriggerFlagEl || !customTriggerTextEl) return;
    const selectedOption =
      Array.from(langSelect.options).find((opt) => opt.value === lang) || langSelect.options[0];
    customTriggerFlagEl.src = globeIconPath;
    customTriggerTextEl.textContent = triggerLabel;

    if (customOptionsEl) {
      Array.from(customOptionsEl.children).forEach((li) => {
        const isActive = li.dataset.value === lang;
        li.classList.toggle("active", isActive);
        li.setAttribute("aria-selected", String(isActive));
      });
    }

    if (!selectedOption) return;
    langSelect.value = selectedOption.value;
    const flagUrl = flagPaths[selectedOption.value] || flagPaths.ja;
    const cssUrl = `url("${flagUrl}")`;
    langSelect.style.setProperty("--flag-image", cssUrl);
  }

  function buildLangCustomSelect() {
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
        const path = LANG_PATHS[opt.value] || LANG_PATHS.ja;
        window.location.href = withSharedParams(path);
        toggleLangOptions(false);
      });

      customOptionsEl.appendChild(li);
    });

    customSelectEl.append(customTriggerEl, customOptionsEl);
    langSelect.insertAdjacentElement("afterend", customSelectEl);

    customTriggerEl.addEventListener("click", () => toggleLangOptions());
    document.addEventListener("click", (event) => {
      if (!customSelectEl.contains(event.target)) toggleLangOptions(false);
    });
  }

  function setError(message) {
    if (!errorText) return;
    errorText.textContent = message || "";
  }

  function setStatus(message) {
    if (!statusText) return;
    statusText.textContent = message || "";
  }

  function setSchedule(message) {
    if (!scheduleText) return;
    scheduleText.textContent = message || "";
  }

  function setStatusPanelVisible(visible) {
    if (!statusPanel) return;
    statusPanel.hidden = !visible;
    statusPanel.setAttribute("aria-hidden", String(!visible));
  }

  function setButtonsEnabled(enabled) {
    [buyStandardBtn, buyProBtn].forEach((btn) => {
      if (!btn) return;
      btn.disabled = !enabled;
      btn.setAttribute("aria-disabled", String(!enabled));
    });
  }

  function normalizePlan(plan) {
    const value = (plan || "").toLowerCase();
    if (value === "standard") return "standard";
    if (value === "pro") return "pro";
    return "free";
  }

  function displayPlan(plan) {
    const normalized = normalizePlan(plan);
    if (normalized === "standard") return t("currentStandard");
    if (normalized === "pro") return t("currentPro");
    return t("currentFree");
  }

  function applyIntervalPrice() {
    const interval = getCurrentInterval();
    const key = interval === "year" ? "priceYear" : "priceMonth";
    priceFields.forEach((node) => {
      const value = node.dataset[key] || "";
      node.textContent = value;
    });
  }

  function getCurrentInterval() {
    const active = document.querySelector("[data-interval].is-active");
    if (active) {
      return active.dataset.interval === "year" ? "year" : "month";
    }
    return periodSelect ? periodSelect.value : "month";
  }

  function setIntervalState(interval) {
    const normalized = interval === "year" ? "year" : "month";
    intervalButtons.forEach((btn) => {
      const isActive = btn.dataset.interval === normalized;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
    if (periodSelect) {
      periodSelect.value = normalized;
    }
    applyIntervalPrice();
  }

  function highlightCurrentPlan(plan) {
    const current = normalizePlan(plan);
    planCards.forEach((card) => {
      if (!card) return;
      const isCurrent = normalizePlan(card.dataset.plan || "") === current;
      card.classList.toggle("is-current", isCurrent);
    });
  }

  async function fetchStatus() {
    if (!st) {
      setStatusPanelVisible(false);
      setError(t("noToken"));
      setButtonsEnabled(false);
      return null;
    }
    setStatusPanelVisible(true);
    try {
      const res = await fetch(buildApiUrl(`/checkout?mode=status&st=${encodeURIComponent(st)}`), {
        method: "GET",
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError(t("invalidToken"));
        } else {
          setError(t("unknown"));
        }
        setButtonsEnabled(false);
        return null;
      }
      const data = await res.json();
      setButtonsEnabled(true);
      currentStatus = data;
      renderStatus(data);
      return data;
    } catch (_err) {
      setError(t("unknown"));
      setButtonsEnabled(false);
      return null;
    }
  }

  function renderStatus(data) {
    const effectivePlan = normalizePlan(data?.effectivePlan || data?.entitlementPlan);
    const scheduleId = data?.scheduledTargetPriceId || "";
    const scheduleAt = data?.scheduledEffectiveAt || "";

    if (currentPlanValue) {
      currentPlanValue.textContent = displayPlan(effectivePlan);
    }
    setStatus(`${t("statusPrefix")} ${displayPlan(effectivePlan)}`);

    if (scheduleId && scheduleAt) {
      setSchedule(`${t("schedulePrefix")} ${scheduleId} (${scheduleAt})`);
    } else {
      setSchedule("");
    }

    if (buyStandardBtn) {
      buyStandardBtn.dataset.currentPlan = effectivePlan;
    }
    if (buyProBtn) {
      buyProBtn.dataset.currentPlan = effectivePlan;
    }
    highlightCurrentPlan(effectivePlan);
  }

  function selectedTarget(basePlan) {
    const interval = getCurrentInterval();
    if (basePlan === "standard") {
      return interval === "year" ? "standard_yearly" : "standard_monthly";
    }
    return interval === "year" ? "pro_yearly" : "pro_monthly";
  }

  async function startChange(target) {
    if (!st) {
      setError(t("noToken"));
      return;
    }
    setError("");
    setStatus(t("changing"));
    try {
      const url = buildApiUrl(
        `/checkout?mode=start&st=${encodeURIComponent(st)}&target=${encodeURIComponent(target)}`
      );
      const res = await fetch(url, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          setError(t("invalidToken"));
        } else {
          setError(data.message || t("unknown"));
        }
        return;
      }

      const result = data.result;
      if (result === "checkout_created" && data.redirectUrl) {
        setStatus(t("checkoutCreated"));
        window.location.href = data.redirectUrl;
        return;
      }
      if (result === "changed_immediately") {
        setStatus(t("changedImmediately"));
      } else if (result === "scheduled") {
        setStatus(t("scheduled"));
      } else if (result === "already_current") {
        setStatus(t("alreadyCurrent"));
      }
      await fetchStatus();
    } catch (_err) {
      setError(t("unknown"));
    }
  }

  function handleBuyClick(planKey) {
    const target = selectedTarget(planKey);
    startChange(target);
  }

  function initLangSelector() {
    if (!langSelect) return;
    buildLangCustomSelect();
    langSelect.value = currentLang;
    updateCustomLangSelected(currentLang);
    langSelect.addEventListener("change", (event) => {
      const selected = event.target.value;
      const path = LANG_PATHS[selected] || LANG_PATHS.ja;
      window.location.href = withSharedParams(path);
    });
  }

  function initContactLink() {
    if (!contactLink) return;
    const href = contactLink.getAttribute("href") || "/contact.html";
    contactLink.setAttribute("href", withSharedParams(href));
    contactLink.textContent = t("priorityContact");
  }

  function initActions() {
    if (buyStandardBtn) {
      buyStandardBtn.addEventListener("click", () => handleBuyClick("standard"));
    }
    if (buyProBtn) {
      buyProBtn.addEventListener("click", () => handleBuyClick("pro"));
    }
    if (periodSelect) {
      periodSelect.addEventListener("change", () => setIntervalState(periodSelect.value));
    }
    intervalButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        setIntervalState(btn.dataset.interval || "month");
      });
    });
  }

  initLangSelector();
  initContactLink();
  initActions();
  setIntervalState(getCurrentInterval());
  fetchStatus();
})();
