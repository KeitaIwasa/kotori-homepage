(() => {
  const STORAGE_KEY = "kotori_lang";

  function normalizeLang(raw) {
    if (!raw) return null;
    const value = raw.toLowerCase();
    if (value.startsWith("ja")) return "ja";
    if (value.startsWith("zh")) return "zh-TW";
    if (value.startsWith("th")) return "th";
    return "en";
  }

  const langPaths = {
    ja: "/",
    en: "/en/",
    "zh-TW": "/zh-tw/",
    th: "/th/",
  };
  const proPaths = {
    ja: "/pro.html",
    en: "/en/pro.html",
    "zh-TW": "/zh-tw/pro.html",
    th: "/th/pro.html",
  };

  const params = new URLSearchParams(window.location.search);
  const paramLang = normalizeLang(
    params.get("lang") || params.get("language") || params.get("locale")
  );
  const htmlLang = normalizeLang(document.documentElement.lang);
  const currentLang = paramLang || htmlLang;
  const fromParam = (params.get("from") || params.get("source") || "").toLowerCase();

  if (!currentLang) return;

  try {
    localStorage.setItem(STORAGE_KEY, currentLang);
  } catch (err) {
    // ローカルストレージが使えない場合は無視する
  }

  const backHome = document.querySelector(".back-home");
  if (backHome) {
    let fromPro = fromParam === "pro" || fromParam === "pro-plan";

    if (!fromPro && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        const path = referrerUrl.pathname || "";
        fromPro =
          path === "/pro.html" ||
          path === "/en/pro.html" ||
          path === "/th/pro.html" ||
          path === "/zh-tw/pro.html";
      } catch (err) {
        // リファラーがURLとして解釈できない場合は無視
      }
    }

    backHome.href = (fromPro ? proPaths[currentLang] : langPaths[currentLang]) || "/";
  }
})();
