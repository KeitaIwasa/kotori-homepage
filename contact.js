(() => {
  const KOTORI_API_BASE = "https://h2xf6dwz5e.execute-api.ap-northeast-1.amazonaws.com/prod";

  const langSelect = document.getElementById("langSelect");
  const form = document.getElementById("contactForm");
  const emailInput = document.getElementById("contactEmail");
  const messageInput = document.getElementById("contactMessage");
  const honeypotInput = document.getElementById("contactWebsite");
  const localeInput = document.getElementById("contactLocale");
  const submitButton = document.getElementById("contactSubmit");
  const statusEl = document.getElementById("contactStatus");

  if (!langSelect || !form || !emailInput || !messageInput || !submitButton || !statusEl) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const flagPaths = {
    ja: "/assets/flags/jp.svg",
    en: "/assets/flags/gb.svg",
    "zh-TW": "/assets/flags/tw.svg",
    th: "/assets/flags/th.svg",
  };
  const globeIconPath = "/assets/globe.svg";
  const triggerLabel = "LANGUAGE";

  const langPaths = {
    ja: "/contact.html",
    en: "/en/contact.html",
    "zh-TW": "/zh-tw/contact.html",
    th: "/th/contact.html",
  };

  const texts = {
    ja: {
      submitDefault: "送信する",
      submitSending: "送信中...",
      success: "お問い合わせを送信しました。通常1〜2営業日以内にご返信します。",
      invalid: "入力内容をご確認ください。",
      emailRequired: "メールアドレスを入力してください。",
      emailInvalid: "メールアドレスの形式が正しくありません。",
      emailTooLong: "メールアドレスは254文字以内で入力してください。",
      messageRequired: "お問い合わせ内容を入力してください。",
      messageTooShort: "お問い合わせ内容は5文字以上で入力してください。",
      messageTooLong: "お問い合わせ内容は2000文字以内で入力してください。",
      tooMany: "短時間に送信が集中しています。しばらく待ってから再度お試しください。",
      serverError: "送信に失敗しました。時間をおいて再度お試しください。",
    },
    en: {
      submitDefault: "Send",
      submitSending: "Sending...",
      success: "Your inquiry has been sent. We usually reply within 1-2 business days.",
      invalid: "Please check your input.",
      emailRequired: "Please enter your email address.",
      emailInvalid: "Please enter a valid email address.",
      emailTooLong: "Email address must be 254 characters or fewer.",
      messageRequired: "Please enter your message.",
      messageTooShort: "Message must be at least 5 characters.",
      messageTooLong: "Message must be 2000 characters or fewer.",
      tooMany: "Too many requests in a short time. Please try again later.",
      serverError: "Failed to send your inquiry. Please try again later.",
    },
    "zh-TW": {
      submitDefault: "送出",
      submitSending: "傳送中...",
      success: "您的詢問已送出。我們通常會在 1-2 個工作天內回覆。",
      invalid: "請確認輸入內容。",
      emailRequired: "請輸入電子郵件。",
      emailInvalid: "電子郵件格式不正確。",
      emailTooLong: "電子郵件請在 254 個字元以內。",
      messageRequired: "請輸入詢問內容。",
      messageTooShort: "詢問內容至少需 5 個字元。",
      messageTooLong: "詢問內容請在 2000 個字元以內。",
      tooMany: "短時間內送出過於頻繁，請稍後再試。",
      serverError: "送出失敗，請稍後再試。",
    },
    th: {
      submitDefault: "ส่งข้อความ",
      submitSending: "กำลังส่ง...",
      success: "ส่งคำถามเรียบร้อยแล้ว โดยปกติเราจะตอบกลับภายใน 1-2 วันทำการ",
      invalid: "กรุณาตรวจสอบข้อมูลที่กรอก",
      emailRequired: "กรุณากรอกอีเมล",
      emailInvalid: "รูปแบบอีเมลไม่ถูกต้อง",
      emailTooLong: "อีเมลต้องมีความยาวไม่เกิน 254 ตัวอักษร",
      messageRequired: "กรุณากรอกรายละเอียด",
      messageTooShort: "รายละเอียดต้องมีอย่างน้อย 5 ตัวอักษร",
      messageTooLong: "รายละเอียดต้องมีความยาวไม่เกิน 2000 ตัวอักษร",
      tooMany: "มีการส่งถี่เกินไปในช่วงสั้น ๆ กรุณาลองใหม่อีกครั้งภายหลัง",
      serverError: "ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้งภายหลัง",
    },
  };

  let currentLang = getPathLang(window.location.pathname);
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

  function getLocaleText(lang) {
    return texts[lang] || texts.ja;
  }

  function setStatus(type, text) {
    statusEl.className = `contact-status ${type}`;
    statusEl.textContent = text;
  }

  function setSubmitting(submitting) {
    const localeText = getLocaleText(currentLang);
    submitButton.disabled = submitting;
    submitButton.textContent = submitting ? localeText.submitSending : localeText.submitDefault;
  }

  function isValidEmailForApi(email) {
    const atIndex = email.lastIndexOf("@");
    if (atIndex <= 0 || atIndex !== email.indexOf("@")) return false;
    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    if (!local || !domain) return false;
    if (domain.startsWith(".") || domain.endsWith(".")) return false;
    if (!domain.includes(".")) return false;
    if (/\s/.test(email)) return false;
    return true;
  }

  function validateContactInput(email, message, localeText) {
    if (!email) {
      return localeText.emailRequired;
    }
    if (email.length > 254) {
      return localeText.emailTooLong;
    }
    if (!isValidEmailForApi(email)) {
      return localeText.emailInvalid;
    }
    if (!message) {
      return localeText.messageRequired;
    }
    if (message.length < 5) {
      return localeText.messageTooShort;
    }
    if (message.length > 2000) {
      return localeText.messageTooLong;
    }
    return null;
  }

  function navigateToLang(lang) {
    const targetPath = langPaths[lang] || "/contact.html";
    if (window.location.pathname !== targetPath) {
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
    customTriggerFlagEl.src = globeIconPath;
    customTriggerTextEl.textContent = triggerLabel;

    if (customOptionsEl) {
      Array.from(customOptionsEl.children).forEach((li) => {
        const isActive = li.dataset.value === lang;
        li.classList.toggle("active", isActive);
        li.setAttribute("aria-selected", String(isActive));
      });
    }

    const flagUrl = flagPaths[lang] || flagPaths.ja;
    const cssUrl = `url("${flagUrl}")`;
    langSelect.style.setProperty("--flag-image", cssUrl);
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

  async function submitContact(event) {
    event.preventDefault();
    const localeText = getLocaleText(currentLang);
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    const website = honeypotInput ? honeypotInput.value : "";

    const validationError = validateContactInput(email, message, localeText);
    if (validationError) {
      setStatus("error", validationError);
      return;
    }

    setSubmitting(true);
    setStatus("", "");

    try {
      const response = await fetch(buildApiUrl("/contact"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          message,
          locale: currentLang,
          website,
        }),
      });

      if (response.ok) {
        form.reset();
        if (localeInput) {
          localeInput.value = currentLang;
        }
        setStatus("success", localeText.success);
        return;
      }

      if (response.status === 400) {
        setStatus("error", localeText.invalid);
        return;
      }
      if (response.status === 429) {
        setStatus("error", localeText.tooMany);
        return;
      }
      setStatus("error", localeText.serverError);
    } catch (error) {
      console.warn("Failed to submit contact form", error);
      setStatus("error", localeText.serverError);
    } finally {
      setSubmitting(false);
    }
  }

  currentLang = getPathLang(window.location.pathname);
  langSelect.value = currentLang;
  if (localeInput) {
    localeInput.value = currentLang;
  }
  setSubmitting(false);

  buildCustomSelect();
  updateCustomSelected(currentLang);

  langSelect.addEventListener("change", (e) => navigateToLang(e.target.value));
  form.addEventListener("submit", submitContact);
})();
