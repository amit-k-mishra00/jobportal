/* TalentBridge AI - dashboard customization
   Requires customize.html, customize.css, and the same-folder cdashboard.html.
   Preferences are saved per browser in localStorage for this front-end prototype. */
(() => {
  "use strict";

  const PREF_KEY = "talentbridge.employer.preferences.v1";
  const $ = (id) => document.getElementById(id);
  const DEFAULT_LAYOUT = [
    { id: "stats", label: "Hiring statistics", icon: "chart-no-axes-column", visible: true, group: "overview", description: "Active jobs, applicants, shortlisted candidates and hires." },
    { id: "analytics", label: "Applications overview", icon: "chart-no-axes-combined", visible: true, group: "analytics", description: "Hiring trends, metrics and date filters." },
    { id: "applicants", label: "Recent applicants", icon: "users", visible: true, group: "analytics", description: "Recently received candidate applications." },
    { id: "jobs", label: "Active jobs", icon: "briefcase-business", visible: true, group: "jobs", description: "Manage active job listings and applicant counts." },
    { id: "pipeline", label: "Hiring pipeline", icon: "git-branch", visible: true, group: "jobs", description: "Candidate progress through hiring stages." },
    { id: "documents", label: "Documents & reports", icon: "folder-open", visible: true, group: "resources", description: "Company reports, contracts and helpful files." },
    { id: "team", label: "Team members", icon: "users-round", visible: true, group: "resources", description: "Recruiters and colleagues helping with hiring." },
    { id: "profile", label: "Company profile card", icon: "building-2", visible: true, group: "resources", description: "Company details, website, location and profile completion." }
  ];
  const GROUP_LABELS = { overview: "Overview", analytics: "Analytics row", jobs: "Jobs row", resources: "Resources row" };
  let toastTimer;
  let preferences = {
    theme: "light", accent: "#2868e8", compact: false,
    layout: DEFAULT_LAYOUT.map(item => ({ ...item })), dateRange: "30", chartMetric: "applications"
  };

  function byId(id) {
    const node = $(id);
    if (!node) throw new Error(`Missing required element #${id} in customize.html`);
    return node;
  }

  function showToast(message) {
    const toast = $("toast");
    if (!toast) { window.alert(message); return; }
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function readSavedPreferences() {
    try {
      const raw = window.localStorage.getItem(PREF_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("TalentBridge preferences could not be read from localStorage.", error);
      showToast("Browser storage is blocked. Open this page using VS Code Live Server to save preferences.");
      return null;
    }
  }

  function savePreferencesToBrowser() {
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error("Unable to save TalentBridge preferences.", error);
      showToast("Preferences could not be saved. Use VS Code Live Server and check browser storage settings.");
      return false;
    }
  }

  function normalizeLayout(savedLayout) {
    const defaultsById = new Map(DEFAULT_LAYOUT.map(item => [item.id, item]));
    const source = Array.isArray(savedLayout) ? savedLayout : [];
    const result = [];
    const included = new Set();

    // Preserve the user's order while filling any fields introduced in a newer version.
    source.forEach(item => {
      if (!item || !defaultsById.has(item.id) || included.has(item.id)) return;
      result.push({ ...defaultsById.get(item.id), ...item });
      included.add(item.id);
    });
    DEFAULT_LAYOUT.forEach(item => {
      if (!included.has(item.id)) result.push({ ...item });
    });
    return result;
  }

  function hexToRgb(hex) {
    const match = /^#?([0-9a-f]{6})$/i.exec(String(hex || ""));
    if (!match) return { r: 40, g: 104, b: 232 };
    const value = match[1];
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function markUnsaved() {
    const status = $("saveStatus");
    if (!status) return;
    status.textContent = "You have changes to save.";
    status.parentElement?.classList.remove("saved");
  }

  function applyTheme({ save = false, markChanged = false } = {}) {
    let effectiveTheme = preferences.theme;
    if (effectiveTheme === "system") {
      effectiveTheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.body.classList.toggle("dark", effectiveTheme === "dark");
    document.body.classList.toggle("compact-layout", Boolean(preferences.compact));

    const { r, g, b } = hexToRgb(preferences.accent);
    document.documentElement.style.setProperty("--accent", preferences.accent);
    document.documentElement.style.setProperty("--accent-rgb", `${r},${g},${b}`);
    document.documentElement.style.setProperty("--accent-soft", `rgba(${r},${g},${b},.11)`);

    if ($("themeSelectPage")) $("themeSelectPage").value = preferences.theme;
    if ($("customAccentPage")) $("customAccentPage").value = preferences.accent;
    if ($("accentHex")) $("accentHex").value = preferences.accent.toUpperCase();

    document.querySelectorAll("[data-theme]").forEach(button => {
      const active = button.dataset.theme === preferences.theme;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-accent]").forEach(button => {
      const active = button.dataset.accent.toLowerCase() === preferences.accent.toLowerCase();
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (window.lucide?.createIcons) window.lucide.createIcons();
    if (save) savePreferencesToBrowser();
    if (markChanged) markUnsaved();
  }

  function moveCard(id, delta) {
    const card = preferences.layout.find(item => item.id === id);
    if (!card || !card.visible) return;
    const groupItems = preferences.layout.filter(item => item.group === card.group && item.visible);
    const currentIndex = groupItems.findIndex(item => item.id === id);
    const destinationIndex = currentIndex + delta;
    if (destinationIndex < 0 || destinationIndex >= groupItems.length) return;

    const otherId = groupItems[destinationIndex].id;
    const indexA = preferences.layout.findIndex(item => item.id === id);
    const indexB = preferences.layout.findIndex(item => item.id === otherId);
    [preferences.layout[indexA], preferences.layout[indexB]] = [preferences.layout[indexB], preferences.layout[indexA]];
    renderCards();
    markUnsaved();
  }

  function createActiveCardRow(item, groupItems) {
    const row = document.createElement("div");
    row.className = "custom-card-row";
    row.innerHTML = `
      <span class="custom-card-icon"><i data-lucide="${item.icon}"></i></span>
      <span class="custom-card-info"><strong></strong><small></small></span>
      <span class="custom-card-actions">
        <button type="button" class="mini-btn" data-move="${item.id}" data-delta="-1" aria-label="Move card up" title="Move up"><i data-lucide="arrow-up"></i></button>
        <button type="button" class="mini-btn" data-move="${item.id}" data-delta="1" aria-label="Move card down" title="Move down"><i data-lucide="arrow-down"></i></button>
        <button type="button" class="hide-card-btn" data-hide="${item.id}"><i data-lucide="eye-off"></i> Hide</button>
      </span>`;
    row.querySelector(".custom-card-info strong").textContent = item.label;
    row.querySelector(".custom-card-info small").textContent = item.description;

    const position = groupItems.findIndex(entry => entry.id === item.id);
    const moveButtons = row.querySelectorAll("[data-delta]");
    moveButtons[0].disabled = position <= 0;
    moveButtons[1].disabled = position >= groupItems.length - 1;
    return row;
  }

  function renderCards() {
    const activeContainer = byId("activeCards");
    const availableContainer = byId("availableCards");
    const reorderContainer = byId("reorderCards");
    activeContainer.replaceChildren();
    availableContainer.replaceChildren();
    reorderContainer.replaceChildren();

    const visible = preferences.layout.filter(item => item.visible);
    const hidden = preferences.layout.filter(item => !item.visible);
    byId("visibleCount").textContent = `${visible.length} card${visible.length === 1 ? "" : "s"} visible`;

    if (visible.length === 0) {
      activeContainer.innerHTML = '<div class="no-hidden-cards"><i data-lucide="circle-alert"></i><span>All cards are hidden. Add at least one from “Available to add” below.</span></div>';
    }

    ["overview", "analytics", "jobs", "resources"].forEach(group => {
      const groupItems = preferences.layout.filter(item => item.group === group && item.visible);
      if (!groupItems.length) return;

      const heading = document.createElement("div");
      heading.className = "group-subheading";
      heading.textContent = GROUP_LABELS[group];
      activeContainer.appendChild(heading);
      groupItems.forEach(item => activeContainer.appendChild(createActiveCardRow(item, groupItems)));

      const orderHeading = document.createElement("div");
      orderHeading.className = "reorder-group-title";
      orderHeading.textContent = GROUP_LABELS[group];
      reorderContainer.appendChild(orderHeading);
      groupItems.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "reorder-card-row";
        row.innerHTML = `
          <span class="drag-grip"><i data-lucide="grip-vertical"></i></span>
          <span class="reorder-card-name"></span>
          <span class="reorder-group-name"></span>
          <div class="reorder-buttons">
            <button type="button" data-move="${item.id}" data-delta="-1" aria-label="Move card up" title="Move up"><i data-lucide="arrow-up"></i></button>
            <button type="button" data-move="${item.id}" data-delta="1" aria-label="Move card down" title="Move down"><i data-lucide="arrow-down"></i></button>
          </div>`;
        row.querySelector(".reorder-card-name").textContent = item.label;
        row.querySelector(".reorder-group-name").textContent = GROUP_LABELS[group];
        const buttons = row.querySelectorAll("[data-delta]");
        buttons[0].disabled = index === 0;
        buttons[1].disabled = index === groupItems.length - 1;
        reorderContainer.appendChild(row);
      });
    });

    if (hidden.length) {
      hidden.forEach(item => {
        const card = document.createElement("div");
        card.className = "available-card";
        card.innerHTML = `
          <span class="custom-card-icon"><i data-lucide="${item.icon}"></i></span>
          <span class="custom-card-info"><strong></strong><small></small><button type="button" class="add-card-btn" data-add="${item.id}"><i data-lucide="plus"></i> Add to dashboard</button></span>`;
        card.querySelector(".custom-card-info strong").textContent = item.label;
        card.querySelector(".custom-card-info small").textContent = item.description;
        availableContainer.appendChild(card);
      });
    } else {
      availableContainer.innerHTML = '<div class="no-hidden-cards"><i data-lucide="check-circle-2"></i><span>All available cards are on your dashboard. Hide a card above to make it available here.</span></div>';
    }
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }

  function saveAndReturn() {
    preferences.compact = byId("compactTogglePage").checked;
    if (!savePreferencesToBrowser()) return;
    const status = byId("saveStatus");
    status.textContent = "Preferences saved for this browser.";
    status.parentElement?.classList.add("saved");
    showToast("Preferences saved. Returning to your dashboard…");
    window.setTimeout(() => { window.location.href = "cdashboard.html"; }, 450);
  }

  function initialize() {
    const saved = readSavedPreferences();
    if (saved && typeof saved === "object") {
      preferences = { ...preferences, ...saved };
      preferences.layout = normalizeLayout(saved.layout);
      if (!/^#[0-9a-f]{6}$/i.test(preferences.accent)) preferences.accent = "#2868e8";
      if (!["light", "dark", "system"].includes(preferences.theme)) preferences.theme = "light";
    }

    applyTheme();
    byId("compactTogglePage").checked = Boolean(preferences.compact);
    renderCards();

    document.querySelectorAll("[data-theme]").forEach(button => button.addEventListener("click", () => {
      preferences.theme = button.dataset.theme;
      applyTheme({ save: true, markChanged: true });
    }));
    byId("themeSelectPage").addEventListener("change", event => {
      preferences.theme = event.target.value;
      applyTheme({ save: true, markChanged: true });
    });
    document.querySelectorAll("[data-accent]").forEach(button => button.addEventListener("click", () => {
      preferences.accent = button.dataset.accent;
      applyTheme({ save: true, markChanged: true });
    }));
    byId("customAccentPage").addEventListener("input", event => {
      preferences.accent = event.target.value;
      applyTheme({ save: true, markChanged: true });
    });
    byId("accentHex").addEventListener("change", event => {
      const value = event.target.value.trim();
      if (!/^#[0-9a-f]{6}$/i.test(value)) {
        event.target.value = preferences.accent.toUpperCase();
        showToast("Enter a six-digit color, for example #2868E8.");
        return;
      }
      preferences.accent = value;
      applyTheme({ save: true, markChanged: true });
    });
    byId("compactTogglePage").addEventListener("change", event => {
      preferences.compact = event.target.checked;
      applyTheme({ save: true, markChanged: true });
    });

    byId("activeCards").addEventListener("click", event => {
      const hide = event.target.closest("[data-hide]");
      const move = event.target.closest("[data-move]");
      if (hide) {
        const item = preferences.layout.find(entry => entry.id === hide.dataset.hide);
        if (item) { item.visible = false; renderCards(); markUnsaved(); }
        return;
      }
      if (move) moveCard(move.dataset.move, Number(move.dataset.delta));
    });
    byId("availableCards").addEventListener("click", event => {
      const add = event.target.closest("[data-add]");
      if (!add) return;
      const item = preferences.layout.find(entry => entry.id === add.dataset.add);
      if (item) { item.visible = true; renderCards(); markUnsaved(); showToast(`${item.label} added. Save to keep this change.`); }
    });
    byId("reorderCards").addEventListener("click", event => {
      const move = event.target.closest("[data-move]");
      if (move) moveCard(move.dataset.move, Number(move.dataset.delta));
    });

    byId("savePreferencesBtn").addEventListener("click", saveAndReturn);
    byId("previewDashboardBtn").addEventListener("click", () => {
      if (savePreferencesToBrowser()) window.location.href = "cdashboard.html";
    });
    byId("resetAllBtn").addEventListener("click", () => {
      if (!window.confirm("Reset your personal dashboard cards, theme, and spacing to the defaults?")) return;
      preferences = {
        theme: "light", accent: "#2868e8", compact: false,
        layout: DEFAULT_LAYOUT.map(item => ({ ...item })), dateRange: "30", chartMetric: "applications"
      };
      applyTheme({ save: false, markChanged: true });
      byId("compactTogglePage").checked = false;
      renderCards();
      showToast("Default settings loaded. Press Save preferences to apply them.");
    });

    document.querySelectorAll('a[href="cdashboard.html"]').forEach(link => link.addEventListener("click", () => {
      // Keep current edits if a user exits with a dashboard/back link.
      savePreferencesToBrowser();
    }));
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
      if (preferences.theme === "system") applyTheme();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      initialize();
    } catch (error) {
      console.error("TalentBridge customization page failed to initialize:", error);
      showToast("Customization did not load. Check that customize.html, customize.css and customize.js are in the same folder.");
    }
  });
})();
