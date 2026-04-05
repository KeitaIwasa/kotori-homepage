(() => {
  const langSelect = document.getElementById("langSelect");
  const statusText = document.getElementById("statusText");
  const scheduleText = document.getElementById("scheduleText");
  const errorText = document.getElementById("errorText");
  const currentPlanValue = document.getElementById("currentPlanValue");
  const translationCountValue = document.getElementById("translationCountValue");
  const buyStandardBtn = document.getElementById("buyStandardBtn");
  const buyProBtn = document.getElementById("buyProBtn");
  const buyFreeBtn = document.querySelector('[data-plan-card][data-plan="free"] .plan-btn');
  const periodSelect = document.getElementById("periodSelect");
  const intervalButtons = document.querySelectorAll("[data-interval]");
  const contactLink = document.getElementById("contactLink");
  const statusPanel = document.querySelector(".pro-status-panel");
  const priceFields = document.querySelectorAll("[data-price-month][data-price-year]");
  const planCards = document.querySelectorAll("[data-plan-card]");
  const operationOverlay = document.getElementById("operationOverlay");
  const operationOverlayText = document.getElementById("operationOverlayText");
  const planButtons = {
    free: buyFreeBtn,
    standard: buyStandardBtn,
    pro: buyProBtn,
  };

  const params = new URLSearchParams(window.location.search);
  const st = (params.get("st") || "").trim();
  const cs = (params.get("cs") || "").trim();
  const pageError = (params.get("error") || "").trim();
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
      loginRequired: "LINEログインで本人確認しています。",
      ownerOnly: "決済者以外は請求管理を開けません。",
      notMember: "このLINEグループのメンバーのみアクセスできます。",
      unknown: "状態の取得に失敗しました。時間をおいて再試行してください。",
      changing: "処理中です...",
      checkoutCreated: "決済ページへ移動します。",
      changedImmediately: "プラン変更を反映しました。",
      scheduled: "次回更新時のプラン変更を予約しました。",
      alreadyCurrent: "このプランは既に適用されています。",
      currentFree: "Free",
      currentStandard: "Standard",
      currentPro: "Pro",
      statusLoaded: "契約状態を取得しました。",
      schedulePrefix: "予約中の変更:",
      priorityContact: "お問い合わせ",
      continueCurrent: "現在の利用を継続",
      manageBilling: "請求を管理",
      selectStandard: "Standardを選択",
      selectPro: "Proを選択",
      downgradeToStandard: "Standardへダウングレード",
      downgradeToFree: "Freeへダウングレード",
      portalRedirecting: "ダウングレード手続きページへ移動します。",
      portalUnavailable: "ダウングレード手続きページの作成に失敗しました。時間をおいて再試行してください。",
      authHint: "プラン変更の前にLINEログインで本人確認します。",
    },
    en: {
      noToken: "Open this page from the LINE bot. Group token is missing.",
      invalidToken: "Token is invalid or expired. Please reopen the link from the LINE bot.",
      loginRequired: "Verifying your identity with LINE Login.",
      ownerOnly: "Only the billing owner can open billing management.",
      notMember: "Only members of this LINE group can access this page.",
      unknown: "Failed to fetch subscription status. Please try again later.",
      changing: "Processing...",
      checkoutCreated: "Redirecting to checkout...",
      changedImmediately: "Plan change applied.",
      scheduled: "Plan change is scheduled for the next renewal.",
      alreadyCurrent: "This plan is already active.",
      currentFree: "Free",
      currentStandard: "Standard",
      currentPro: "Pro",
      statusLoaded: "Subscription status loaded.",
      schedulePrefix: "Scheduled change:",
      priorityContact: "Contact",
      continueCurrent: "Keep Current Setup",
      manageBilling: "Manage Billing",
      selectStandard: "Choose Standard",
      selectPro: "Choose Pro",
      downgradeToStandard: "Downgrade to Standard",
      downgradeToFree: "Downgrade to Free",
      portalRedirecting: "Redirecting to downgrade flow...",
      portalUnavailable: "Failed to open the downgrade flow. Please try again later.",
      authHint: "You will sign in with LINE before changing this plan.",
    },
    "zh-TW": {
      noToken: "請從 LINE 機器人的連結開啟此頁面，找不到群組憑證。",
      invalidToken: "憑證無效或已過期，請重新從 LINE 機器人開啟連結。",
      loginRequired: "正在使用 LINE Login 驗證身分。",
      ownerOnly: "只有付款人本人可以開啟帳單管理。",
      notMember: "只有此 LINE 群組的成員可以開啟此頁面。",
      unknown: "無法取得訂閱狀態，請稍後再試。",
      changing: "處理中...",
      checkoutCreated: "正在前往結帳頁面...",
      changedImmediately: "已套用方案變更。",
      scheduled: "已預約於下次續約時變更方案。",
      alreadyCurrent: "此方案已在使用中。",
      currentFree: "Free",
      currentStandard: "Standard",
      currentPro: "Pro",
      statusLoaded: "已取得訂閱狀態。",
      schedulePrefix: "預約變更:",
      priorityContact: "聯絡我們",
      continueCurrent: "維持目前設定",
      manageBilling: "管理帳單",
      selectStandard: "選擇 Standard",
      selectPro: "選擇 Pro",
      downgradeToStandard: "降級至 Standard",
      downgradeToFree: "降級至 Free",
      portalRedirecting: "正在前往降級流程...",
      portalUnavailable: "無法開啟降級流程，請稍後再試。",
      authHint: "變更方案前會先使用 LINE Login 驗證身分。",
    },
    th: {
      noToken: "กรุณาเปิดหน้านี้จากลิงก์ใน LINE bot ไม่พบโทเค็นกลุ่ม",
      invalidToken: "โทเค็นไม่ถูกต้องหรือหมดอายุ กรุณาเปิดลิงก์จาก LINE bot อีกครั้ง",
      loginRequired: "กำลังยืนยันตัวตนด้วย LINE Login",
      ownerOnly: "มีเพียงผู้ชำระเงินเท่านั้นที่เปิดหน้าจัดการการเรียกเก็บเงินได้",
      notMember: "เฉพาะสมาชิกของกลุ่ม LINE นี้เท่านั้นที่เข้าถึงหน้านี้ได้",
      unknown: "ไม่สามารถดึงสถานะการสมัครได้ กรุณาลองใหม่อีกครั้ง",
      changing: "กำลังดำเนินการ...",
      checkoutCreated: "กำลังไปยังหน้าชำระเงิน...",
      changedImmediately: "อัปเดตแพ็กเกจเรียบร้อยแล้ว",
      scheduled: "ตั้งเวลาการเปลี่ยนแพ็กเกจในรอบถัดไปแล้ว",
      alreadyCurrent: "แพ็กเกจนี้ถูกใช้งานอยู่แล้ว",
      currentFree: "Free",
      currentStandard: "Standard",
      currentPro: "Pro",
      statusLoaded: "โหลดสถานะการสมัครแล้ว",
      schedulePrefix: "การเปลี่ยนที่ตั้งเวลาไว้:",
      priorityContact: "ติดต่อเรา",
      continueCurrent: "คงการตั้งค่าปัจจุบัน",
      manageBilling: "จัดการการเรียกเก็บเงิน",
      selectStandard: "เลือก Standard",
      selectPro: "เลือก Pro",
      downgradeToStandard: "ดาวน์เกรดเป็น Standard",
      downgradeToFree: "ดาวน์เกรดเป็น Free",
      portalRedirecting: "กำลังไปยังขั้นตอนดาวน์เกรด...",
      portalUnavailable: "ไม่สามารถเปิดหน้าดาวน์เกรดได้ กรุณาลองใหม่ภายหลัง",
      authHint: "ระบบจะให้คุณเข้าสู่ระบบ LINE ก่อนเปลี่ยนแพ็กเกจ",
    },
  };

  let currentLang = getPathLang(window.location.pathname);
  let currentStatus = null;
  let customSelectEl;
  let customOptionsEl;
  let customTriggerEl;
  let customTriggerFlagEl;
  let customTriggerTextEl;
  const PREPARE_WARMUP_TTL_MS = 15000;
  const prepareWarmupCache = new Map();

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
    return `/api${path}`;
  }

  function withSharedParams(path) {
    const url = new URL(path, window.location.origin);
    if (st) {
      url.searchParams.set("st", st);
    }
    if (cs) {
      url.searchParams.set("cs", cs);
    }
    return url.toString();
  }

  function addHintLink(rel, href) {
    if (!href) return;
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    if (rel === "preconnect") {
      link.crossOrigin = "anonymous";
    }
    document.head.appendChild(link);
  }

  function warmConnections() {
    try {
      const apiOrigin = new URL(buildApiUrl("/checkout"), window.location.origin).origin;
      addHintLink("dns-prefetch", apiOrigin);
      addHintLink("preconnect", apiOrigin);
    } catch (_err) {
      // noop
    }
    addHintLink("dns-prefetch", "https://checkout.stripe.com");
    addHintLink("preconnect", "https://checkout.stripe.com");
    addHintLink("dns-prefetch", "https://billing.stripe.com");
    addHintLink("preconnect", "https://billing.stripe.com");
  }

  function createPrepareRequest(target) {
    const url = buildApiUrl(
      `/checkout?mode=prepare&st=${encodeURIComponent(st)}&cs=${encodeURIComponent(cs)}&target=${encodeURIComponent(target)}`
    );
    return fetch(url, { method: "GET" }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      return { res, data };
    }).catch(() => null);
  }

  function createStartRequest(target) {
    const url = buildApiUrl(
      `/checkout?mode=start&st=${encodeURIComponent(st)}&cs=${encodeURIComponent(cs)}&target=${encodeURIComponent(target)}`
    );
    return fetch(url, { method: "GET" }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      return { res, data };
    });
  }

  function maybeWarmupPrepare(planKey) {
    if (!st || !cs) return;
    const button = planButtons[planKey];
    if (!button) return;
    if ((button.dataset.action || "none") !== "start") return;

    const target = selectedTarget(planKey);
    const now = Date.now();
    const cached = prepareWarmupCache.get(target);
    if (cached && now - cached.startedAt < PREPARE_WARMUP_TTL_MS) {
      return;
    }
    prepareWarmupCache.set(target, { startedAt: now, promise: createPrepareRequest(target) });
  }

  function consumePrepareRequest(target) {
    const cached = prepareWarmupCache.get(target);
    if (cached && Date.now() - cached.startedAt < PREPARE_WARMUP_TTL_MS) {
      prepareWarmupCache.delete(target);
    }
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
    Object.values(planButtons).forEach((btn) => {
      if (!btn) return;
      btn.disabled = !enabled;
      btn.setAttribute("aria-disabled", String(!enabled));
    });
  }

  function setButtonsVisible(visible) {
    Object.values(planButtons).forEach((btn) => {
      if (!btn) return;
      btn.hidden = !visible;
      btn.setAttribute("aria-hidden", String(!visible));
    });
  }

  function setOperationLoading(active, message) {
    if (!operationOverlay) return;
    operationOverlay.hidden = !active;
    operationOverlay.setAttribute("aria-hidden", String(!active));
    if (operationOverlayText && message) {
      operationOverlayText.textContent = message;
    }
  }

  function normalizePlan(plan) {
    const value = (plan || "").toLowerCase();
    if (value === "standard") return "standard";
    if (value === "pro") return "pro";
    return "free";
  }

  function planRank(plan) {
    const normalized = normalizePlan(plan);
    if (normalized === "standard") return 1;
    if (normalized === "pro") return 2;
    return 0;
  }

  function displayPlan(plan) {
    const normalized = normalizePlan(plan);
    if (normalized === "standard") return t("currentStandard");
    if (normalized === "pro") return t("currentPro");
    return t("currentFree");
  }

  function formatCount(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return "-";
    }
    return new Intl.NumberFormat(currentLang).format(Math.floor(numeric));
  }

  function applyIntervalPrice() {
    const interval = getCurrentInterval();
    const key = interval === "year" ? "priceYear" : "priceMonth";
    priceFields.forEach((node) => {
      const value = node.dataset[key] || "";
      renderPriceLabel(node, value);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderPriceLabel(node, value) {
    const text = (value || "").trim();
    if (!text) {
      node.textContent = "";
      return;
    }
    const slashIndex = text.lastIndexOf("/");
    if (slashIndex <= 0 || slashIndex === text.length - 1) {
      node.textContent = text;
      return;
    }
    const main = text.slice(0, slashIndex).trimEnd();
    const unit = text.slice(slashIndex).trimStart();
    node.innerHTML = `<span class="plan-price-main">${escapeHtml(main)}</span> <span class="plan-price-unit">${escapeHtml(unit)}</span>`;
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
      setButtonsVisible(false);
      setStatusPanelVisible(false);
      setError(t("noToken"));
      setButtonsEnabled(false);
      return null;
    }
    if (!cs) {
      if (pageError === "not_member") {
        setButtonsVisible(false);
        setStatusPanelVisible(false);
        setError(t("notMember"));
        setButtonsEnabled(false);
        return null;
      }
      setButtonsVisible(false);
      setStatusPanelVisible(false);
      setError(t("authHint"));
      startAuth();
      return null;
    }
    setButtonsVisible(true);
    setStatusPanelVisible(true);
    try {
      const res = await fetch(buildApiUrl(`/checkout?mode=status&st=${encodeURIComponent(st)}&cs=${encodeURIComponent(cs)}`), {
        method: "GET",
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError(t("loginRequired"));
          startAuth();
        } else if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          setError(data.reason === "not_member" ? t("notMember") : t("ownerOnly"));
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
    if (translationCountValue) {
      translationCountValue.textContent = formatCount(data?.translationCount);
    }
    setStatus(t("statusLoaded"));

    if (scheduleId && scheduleAt) {
      setSchedule(`${t("schedulePrefix")} ${scheduleId} (${scheduleAt})`);
    } else {
      setSchedule("");
    }

    Object.values(planButtons).forEach((btn) => {
      if (!btn) return;
      btn.dataset.currentPlan = effectivePlan;
    });
    applyPlanButtonStates(effectivePlan);
    highlightCurrentPlan(effectivePlan);
  }

  function setPlanButtonState(planKey, state) {
    const button = planButtons[planKey];
    if (!button) return;
    button.disabled = !!state.disabled;
    button.setAttribute("aria-disabled", String(!!state.disabled));
    button.textContent = state.label || "";
    button.dataset.action = state.action || "none";
  }

  function applyPlanButtonStates(currentPlan) {
    const current = normalizePlan(currentPlan);
    const currentRank = planRank(current);
    ["free", "standard", "pro"].forEach((planKey) => {
      const rank = planRank(planKey);
      if (rank === currentRank) {
        if (currentRank > 0) {
          setPlanButtonState(planKey, {
            disabled: false,
            label: t("manageBilling"),
            action: "portal",
          });
          return;
        }
        setPlanButtonState(planKey, {
          disabled: true,
          label: t("continueCurrent"),
          action: "none",
        });
        return;
      }
      if (rank < currentRank) {
        const isFree = planKey === "free";
        setPlanButtonState(planKey, {
          disabled: false,
          label: isFree ? t("downgradeToFree") : t("downgradeToStandard"),
          action: isFree ? "portal" : "start",
        });
        return;
      }
      setPlanButtonState(planKey, {
        disabled: false,
        label: planKey === "standard" ? t("selectStandard") : t("selectPro"),
        action: "start",
      });
    });
  }

  function selectedTarget(basePlan) {
    const interval = getCurrentInterval();
    if (basePlan === "standard") {
      return interval === "year" ? "standard_yearly" : "standard_monthly";
    }
    return interval === "year" ? "pro_yearly" : "pro_monthly";
  }

  async function startChange(target) {
    setOperationLoading(true, t("changing"));
    if (!st) {
      setError(t("noToken"));
      setOperationLoading(false);
      return;
    }
    if (!cs) {
      setError(t("loginRequired"));
      startAuth();
      return;
    }
    setError("");
    setStatus(t("changing"));
    try {
      consumePrepareRequest(target);
      const { res, data } = await createStartRequest(target);
      if (!res.ok) {
        setOperationLoading(false);
        if (res.status === 401) {
          setError(t("loginRequired"));
          startAuth();
        } else if (res.status === 403) {
          setError(data.reason === "not_member" ? t("notMember") : t("ownerOnly"));
        } else {
          setError(data.message || t("unknown"));
        }
        return;
      }

      const result = data.result;
      if (result === "checkout_created" && data.redirectUrl) {
        setStatus(t("checkoutCreated"));
        setOperationLoading(true, t("checkoutCreated"));
        window.location.href = data.redirectUrl;
        return;
      }
      if (result === "already_current") {
        setStatus(t("alreadyCurrent"));
      }
      await fetchStatus();
      setOperationLoading(false);
    } catch (_err) {
      setError(t("unknown"));
      setOperationLoading(false);
    }
  }

  async function startPortalFlow() {
    setOperationLoading(true, t("portalRedirecting"));
    if (!st) {
      setError(t("noToken"));
      setOperationLoading(false);
      return;
    }
    if (!cs) {
      setError(t("loginRequired"));
      startAuth();
      return;
    }
    setError("");
    setStatus(t("portalRedirecting"));
    setButtonsEnabled(false);
    try {
      const url = buildApiUrl(`/checkout?mode=portal&st=${encodeURIComponent(st)}&cs=${encodeURIComponent(cs)}`);
      const res = await fetch(url, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOperationLoading(false);
        if (res.status === 401) {
          setError(t("loginRequired"));
          startAuth();
        } else if (res.status === 403) {
          setError(data.reason === "not_member" ? t("notMember") : t("ownerOnly"));
        } else {
          setError(data.message || t("portalUnavailable"));
        }
        await fetchStatus();
        return;
      }
      if (data.result === "portal_created" && data.redirectUrl) {
        setOperationLoading(true, t("portalRedirecting"));
        window.location.href = data.redirectUrl;
        return;
      }
      setError(t("portalUnavailable"));
      await fetchStatus();
      setOperationLoading(false);
    } catch (_err) {
      setError(t("portalUnavailable"));
      await fetchStatus();
      setOperationLoading(false);
    }
  }

  function handleBuyClick(planKey) {
    const target = selectedTarget(planKey);
    startChange(target);
  }

  function handlePlanClick(planKey) {
    const button = planButtons[planKey];
    const action = button?.dataset.action || "none";
    if (action === "none") {
      setStatus(t("alreadyCurrent"));
      return;
    }
    if (action === "portal") {
      startPortalFlow();
      return;
    }
    handleBuyClick(planKey);
  }

  function startAuth() {
    if (!st) return;
    const url = buildApiUrl(
      `/checkout?mode=auth_start&st=${encodeURIComponent(st)}&return_to=${encodeURIComponent(window.location.pathname)}`
    );
    window.location.href = url;
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
    if (buyFreeBtn) {
      buyFreeBtn.dataset.action = "none";
    }
    if (buyFreeBtn) {
      buyFreeBtn.addEventListener("click", () => handlePlanClick("free"));
    }
    if (buyStandardBtn) {
      buyStandardBtn.addEventListener("click", () => handlePlanClick("standard"));
      buyStandardBtn.addEventListener("pointerenter", () => maybeWarmupPrepare("standard"), { passive: true });
      buyStandardBtn.addEventListener("focus", () => maybeWarmupPrepare("standard"), { passive: true });
      buyStandardBtn.addEventListener("touchstart", () => maybeWarmupPrepare("standard"), { passive: true });
    }
    if (buyProBtn) {
      buyProBtn.addEventListener("click", () => handlePlanClick("pro"));
      buyProBtn.addEventListener("pointerenter", () => maybeWarmupPrepare("pro"), { passive: true });
      buyProBtn.addEventListener("focus", () => maybeWarmupPrepare("pro"), { passive: true });
      buyProBtn.addEventListener("touchstart", () => maybeWarmupPrepare("pro"), { passive: true });
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
  warmConnections();
  initActions();
  setIntervalState(getCurrentInterval());
  fetchStatus();
})();
