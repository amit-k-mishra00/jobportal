(() => {
  "use strict";

  const MODE_KEY = "talentbridge.site.theme.v1";
  const DASHBOARD_KEY = "talentbridge.employer.preferences.v1";
  const root = document.documentElement;
  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const validMode = value => value === "light" || value === "dark" || value === "system";

  function readMode(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }
  function readDashboardPreferences(rawValue) {
    try {
      const raw = rawValue === undefined ? window.localStorage.getItem(DASHBOARD_KEY) : rawValue;
      const value = raw ? JSON.parse(raw) : null;
      return value && typeof value === "object" && !Array.isArray(value) ? value : null;
    } catch (_) { return null; }
  }
  function writeMode(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) {}
  }
  function syncDashboardPreference(mode) {
    try {
      const preferences = readDashboardPreferences();
      if (preferences && preferences.theme === mode) return;
      if (!preferences && mode === "light") return;
      const updated = preferences || {};
      updated.theme = mode;
      window.localStorage.setItem(DASHBOARD_KEY, JSON.stringify(updated));
    } catch (_) {}
  }
  function resolveMode(mode) {
    return mode === "system" ? (media && media.matches ? "dark" : "light") : mode;
  }

  let preference = readMode(MODE_KEY);
  if (!validMode(preference)) {
    const dashboardPreferences = readDashboardPreferences();
    preference = dashboardPreferences && validMode(dashboardPreferences.theme) ? dashboardPreferences.theme : "light";
    writeMode(MODE_KEY, preference);
  }

  function renderTheme(mode) {
    preference = validMode(mode) ? mode : "light";
    const resolved = resolveMode(preference);
    root.dataset.colorMode = resolved;
    root.style.colorScheme = resolved;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", resolved === "dark" ? "#101827" : "#ffffff");

    if (document.body && !document.body.hasAttribute("data-public-page")) {
      document.body.classList.toggle("dark", resolved === "dark");
    }

    document.querySelectorAll(".site-theme-toggle").forEach(button => {
      const dark = resolved === "dark";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      button.title = dark ? "Switch to light mode" : "Switch to dark mode";
      const icon = button.querySelector(".site-theme-icon");
      if (icon) icon.textContent = dark ? "\u2600" : "\u263E";
    });
  }

  function setTheme(mode, persist = true) {
    if (!validMode(mode)) return;
    renderTheme(mode);
    if (persist) {
      writeMode(MODE_KEY, mode);
      syncDashboardPreference(mode);
    }
  }

  function updateWorkspaceHeaderHeight(header) {
    if (!header) return;
    const height = header.offsetHeight;
    if (height > 0) root.style.setProperty("--workspace-header-height", height + "px");
  }

  function initialize() {
    renderTheme(preference);

    const header = document.querySelector('body:not([data-public-page]) > .navbar');
    if (header) {
      updateWorkspaceHeaderHeight(header);
      if ("ResizeObserver" in window) {
        const observer = new window.ResizeObserver(() => updateWorkspaceHeaderHeight(header));
        observer.observe(header);
      } else {
        window.addEventListener("resize", () => updateWorkspaceHeaderHeight(header), { passive: true });
      }
    }
  }

  renderTheme(preference);
  syncDashboardPreference(preference);

  document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    const control = target && target.closest("[data-theme], #quickTheme, #resetAllBtn");
    if (!control) return;

    window.setTimeout(() => {
      if (control.hasAttribute("data-theme")) {
        setTheme(control.dataset.theme);
      } else if (control.id === "quickTheme" && document.body) {
        setTheme(document.body.classList.contains("dark") ? "dark" : "light");
      } else if (control.id === "resetAllBtn") {
        const selected = document.querySelector("[data-theme].active")?.dataset.theme ||
          document.getElementById("themeSelectPage")?.value;
        if (validMode(selected)) setTheme(selected);
      }
    }, 0);
  }, true);

  document.addEventListener("change", event => {
    const target = event.target instanceof Element ? event.target : null;
    const control = target && target.closest("#themeSelect, #customThemeSelect, #themeSelectPage");
    if (control) window.setTimeout(() => setTheme(control.value), 0);
  }, true);

  window.addEventListener("storage", event => {
    if (event.key === MODE_KEY) {
      if (validMode(event.newValue)) {
        setTheme(event.newValue, false);
        syncDashboardPreference(event.newValue);
      } else {
        const saved = readDashboardPreferences();
        setTheme(saved && validMode(saved.theme) ? saved.theme : "light", false);
      }
      return;
    }
    if (event.key === DASHBOARD_KEY) {
      const saved = readDashboardPreferences(event.newValue);
      if (saved && validMode(saved.theme)) setTheme(saved.theme);
      else if (!validMode(readMode(MODE_KEY))) setTheme("light", false);
    }
  });

  if (media) {
    const onSystemThemeChange = () => {
      if (preference === "system") renderTheme("system");
    };
    if (media.addEventListener) media.addEventListener("change", onSystemThemeChange);
    else if (media.addListener) media.addListener(onSystemThemeChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();