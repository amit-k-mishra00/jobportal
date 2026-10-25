/* TalentBridge AI - dashboard customization
   Requires pages/dashboard/customize.html, pages/dashboard/cdashboard.html, and the linked dashboard assets.
   Preferences are saved per browser in localStorage for this front-end prototype. */
(() => {
  "use strict";

  const PREF_KEY = "talentbridge.employer.preferences.v1";
  const $ = (id) => document.getElementById(id);
  const publicHeader = document.querySelector(".navbar");
  if (publicHeader) {
    const updateHeaderOffset = () => document.documentElement.style.setProperty("--public-header-height", Math.ceil(publicHeader.getBoundingClientRect().height) + "px");
    updateHeaderOffset();
    if ("ResizeObserver" in window) new ResizeObserver(updateHeaderOffset).observe(publicHeader);
    window.addEventListener("resize", updateHeaderOffset, { passive: true });
  }
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
  let selectedCard = null;
  let preferences = {
    theme: "light", accent: "#2868e8", fontFamily: "dm-sans", fontScale: 100, customCards: [], compact: false,
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
    const fontStack={"dm-sans":"DM Sans, sans-serif",manrope:"Manrope, sans-serif",system:"system-ui, sans-serif"}[preferences.fontFamily]||"DM Sans, sans-serif";
    document.documentElement.style.setProperty("--user-font",fontStack);
    document.documentElement.style.zoom = String(preferences.fontScale || 100) + "%";
    if ($("fontScaleSelect")) $("fontScaleSelect").value=String(preferences.fontScale || 100);
    if ($("fontScaleOutput")) $("fontScaleOutput").textContent=String(preferences.fontScale || 100) + "%";
    if ($("fontFamilySelect")) $("fontFamilySelect").value=preferences.fontFamily;

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

  function safeCardImage(value) {
    const url = String(value || "").trim();
    if (!url) return "";
    if (/^data:image\/(png|jpeg|webp);base64,/i.test(url)) return url;
    try {
      const parsed = new URL(url, window.location.href);
      return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "";
    } catch (_) { return ""; }
  }

  function normalizeCardSettings() {
    preferences.layout.forEach(card => {
      if (!["compact", "standard", "wide"].includes(card.size)) card.size = "standard";
      card.imageUrl = safeCardImage(card.imageUrl);
      card.isPublic = Boolean(card.isPublic);
    });
    preferences.customCards.forEach(card => {
      if (!["compact", "standard", "wide"].includes(card.size)) card.size = "standard";
      card.imageUrl = safeCardImage(card.imageUrl);
      card.isPublic = Boolean(card.isPublic);
    });
  }

  function updateCardImagePreview(value) {
    const preview = $("cardImagePreview");
    const safe = safeCardImage(value);
    preview.hidden = !safe;
    preview.style.backgroundImage = safe ? "url(\"" + safe.replace(/\"/g, "%22") + "\")" : "";
  }

  function openCardEditor(type, id) {
    const card = type === "custom"
      ? preferences.customCards.find(item => item.id === id)
      : preferences.layout.find(item => item.id === id);
    if (!card) return;
    selectedCard = { type, id };
    byId("cardEditorTitle").textContent = "Customize " + (card.title || card.label || "card");
    byId("editorCardSize").value = card.size || "standard";
    byId("editorCardImageUrl").value = card.imageUrl && !card.imageUrl.startsWith("data:") ? card.imageUrl : "";
    byId("editorCardImageFile").value = "";
    byId("editorCardPublic").checked = Boolean(card.isPublic);
    updateCardImagePreview(card.imageUrl);
    byId("cardAppearanceEditor").hidden = false;
    byId("cardAppearanceEditor").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function updateSelectedCard(field, value) {
    if (!selectedCard) return;
    const list = selectedCard.type === "custom" ? preferences.customCards : preferences.layout;
    const card = list.find(item => item.id === selectedCard.id);
    if (!card) return;
    card[field] = value;
    markUnsaved();
  }

  function moveCustomCard(id, delta) {
    const index = preferences.customCards.findIndex(card => card.id === id);
    const destination = index + delta;
    if (index < 0 || destination < 0 || destination >= preferences.customCards.length) return;
    [preferences.customCards[index], preferences.customCards[destination]] = [preferences.customCards[destination], preferences.customCards[index]];
    renderCustomCards();
    markUnsaved();
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

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }
  function createActiveCardRow(item, groupItems) {
    const safeId = escapeHtml(item.id);
    const safeIcon = escapeHtml(item.icon);
    const safeLabel = escapeHtml(item.label);
    const row = document.createElement("div");
    row.className = "custom-card-row";
    row.innerHTML = `
      <span class="custom-card-icon"><i data-lucide="${safeIcon}"></i></span>
      <span class="custom-card-info"><strong></strong><small></small></span>
      <span class="custom-card-actions">
        <button type="button" class="mini-btn" data-move="${safeId}" data-delta="-1" aria-label="Move card up" title="Move up"><i data-lucide="arrow-up"></i></button>
        <button type="button" class="mini-btn" data-move="${safeId}" data-delta="1" aria-label="Move card down" title="Move down"><i data-lucide="arrow-down"></i></button>
        <button type="button" class="mini-btn card-edit-btn" data-edit-card="${safeId}" aria-label="Edit ${safeLabel}" title="Edit card"><i data-lucide="settings-2"></i><span>Edit</span></button>
        <button type="button" class="hide-card-btn" data-hide="${safeId}"><i data-lucide="eye-off"></i> Hide</button>
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
        const safeId = escapeHtml(item.id);
        const row = document.createElement("div");
        row.className = "reorder-card-row";
        row.innerHTML = `
          <span class="drag-grip"><i data-lucide="grip-vertical"></i></span>
          <span class="reorder-card-name"></span>
          <span class="reorder-group-name"></span>
          <div class="reorder-buttons">
            <button type="button" data-move="${safeId}" data-delta="-1" aria-label="Move card up" title="Move up"><i data-lucide="arrow-up"></i></button>
            <button type="button" data-move="${safeId}" data-delta="1" aria-label="Move card down" title="Move down"><i data-lucide="arrow-down"></i></button>
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
        const safeId = escapeHtml(item.id);
        const safeIcon = escapeHtml(item.icon);
        const card = document.createElement("div");
        card.className = "available-card";
        card.innerHTML = `
          <span class="custom-card-icon"><i data-lucide="${safeIcon}"></i></span>
          <span class="custom-card-info"><strong></strong><small></small><button type="button" class="add-card-btn" data-add="${safeId}"><i data-lucide="plus"></i> Add to dashboard</button></span>`;
        card.querySelector(".custom-card-info strong").textContent = item.label;
        card.querySelector(".custom-card-info small").textContent = item.description;
        availableContainer.appendChild(card);
      });
    } else {
      availableContainer.innerHTML = '<div class="no-hidden-cards"><i data-lucide="check-circle-2"></i><span>All available cards are on your dashboard. Hide a card above to make it available here.</span></div>';
    }
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }

  function renderCustomCards() {
    const list = $("customCardsList");
    if (!list) return;
    list.replaceChildren();
    if (!preferences.customCards.length) {
      const empty = document.createElement("p");
      empty.className = "custom-card-empty";
      empty.textContent = "No personal cards yet.";
      list.appendChild(empty);
      return;
    }
    preferences.customCards.forEach(card => {
      const row = document.createElement("div");
      row.className = "custom-card-item";
      const icon = document.createElement("i");
      icon.dataset.lucide = card.icon || "notebook-pen";
      const info = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = card.title;
      const body = document.createElement("small");
      body.textContent = card.body;
      info.append(title, body);
      const actions = document.createElement("span"); actions.className = "custom-card-actions";
      const up = document.createElement("button"); up.type = "button"; up.className = "mini-btn"; up.dataset.moveCustom = card.id; up.dataset.delta = "-1"; up.title = "Move up"; up.setAttribute("aria-label", "Move card up"); up.innerHTML = '<i data-lucide="arrow-up"></i>';
      const down = document.createElement("button"); down.type = "button"; down.className = "mini-btn"; down.dataset.moveCustom = card.id; down.dataset.delta = "1"; down.title = "Move down"; down.setAttribute("aria-label", "Move card down"); down.innerHTML = '<i data-lucide="arrow-down"></i>';
      const edit = document.createElement("button"); edit.type = "button"; edit.className = "mini-btn card-edit-btn"; edit.dataset.editCustom = card.id; edit.title = "Edit card"; edit.setAttribute("aria-label", "Edit " + card.title); edit.innerHTML = '<i data-lucide="settings-2"></i><span>Edit</span>';
      const position = preferences.customCards.findIndex(item => item.id === card.id); up.disabled = position <= 0; down.disabled = position >= preferences.customCards.length - 1;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "custom-card-remove";
      remove.dataset.removeCustom = card.id;
      remove.textContent = "Remove";
      actions.append(up, down, edit, remove);
      row.append(icon, info, actions);
      list.appendChild(row);
    });
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

    preferences.layout = normalizeLayout(preferences.layout);
    preferences.customCards = Array.isArray(preferences.customCards) ? preferences.customCards.slice(0, 8) : [];
    preferences.fontScale = Math.max(90, Math.min(125, Number(preferences.fontScale) || 100));
    normalizeCardSettings();
    if (!["dm-sans", "manrope", "system"].includes(preferences.fontFamily)) preferences.fontFamily = "dm-sans";
    applyTheme();
    renderCustomCards();
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
    byId("fontFamilySelect").addEventListener("change", event => {
      preferences.fontFamily = event.target.value;
      applyTheme({ save: true, markChanged: true });
    });
    byId("fontScaleSelect").addEventListener("input", event => {
      preferences.fontScale = Number(event.target.value) || 100;
      applyTheme({ save: false, markChanged: true });
    });
    byId("customCardForm").addEventListener("submit", event => {
      event.preventDefault();
      const title = byId("customCardTitle").value.trim();
      const body = byId("customCardBody").value.trim();
      if (!title || !body) return;
      if (preferences.customCards.length >= 8) {
        showToast("You can add up to eight personal cards.");
        return;
      }
      preferences.customCards.push({ id: "custom-" + Date.now(), title, body, icon: byId("customCardIcon").value, size: "standard", imageUrl: "", isPublic: false });
      event.target.reset();
      renderCustomCards();
      markUnsaved();
      showToast("Card added. Save preferences to add it to the dashboard.");
    });
    byId("customCardsList").addEventListener("click", event => {
      const button = event.target.closest("[data-remove-custom]");
      if (!button) return;
      preferences.customCards = preferences.customCards.filter(card => card.id !== button.dataset.removeCustom);
      if (selectedCard && selectedCard.type === "custom" && selectedCard.id === button.dataset.removeCustom) { selectedCard = null; byId("cardAppearanceEditor").hidden = true; }
      renderCustomCards();
      markUnsaved();
    });
    byId("customCardsList").addEventListener("click", event => {
      const edit = event.target.closest("[data-edit-custom]");
      const move = event.target.closest("[data-move-custom]");
      if (edit) { openCardEditor("custom", edit.dataset.editCustom); return; }
      if (move) moveCustomCard(move.dataset.moveCustom, Number(move.dataset.delta));
    });
    byId("activeCards").addEventListener("click", event => {
      const edit = event.target.closest("[data-edit-card]");
      if (edit) openCardEditor("layout", edit.dataset.editCard);
    });
    byId("closeCardEditor").addEventListener("click", () => { byId("cardAppearanceEditor").hidden = true; });
    byId("editorCardSize").addEventListener("change", event => updateSelectedCard("size", event.target.value));
    byId("editorCardPublic").addEventListener("change", event => updateSelectedCard("isPublic", event.target.checked));
    byId("editorCardImageUrl").addEventListener("change", event => {
      const raw = event.target.value.trim();
      const safe = safeCardImage(raw);
      if (raw && !safe) { event.target.value = ""; updateSelectedCard("imageUrl", ""); updateCardImagePreview(""); showToast("Enter a valid HTTP or HTTPS image link."); return; }
      event.target.value = safe; updateSelectedCard("imageUrl", safe); updateCardImagePreview(safe);
    });
    byId("editorCardImageFile").addEventListener("change", event => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 150 * 1024) { event.target.value = ""; showToast("Choose a PNG, JPEG, or WebP image under 150 KB."); return; }
      const targetCard = selectedCard ? { ...selectedCard } : null;
      const reader = new FileReader();
      reader.onload = () => { const safe = safeCardImage(reader.result); if (!safe || !targetCard) return; const list = targetCard.type === "custom" ? preferences.customCards : preferences.layout; const card = list.find(item => item.id === targetCard.id); if (!card) return; card.imageUrl = safe; markUnsaved(); if (selectedCard && selectedCard.type === targetCard.type && selectedCard.id === targetCard.id) { byId("editorCardImageUrl").value = ""; updateCardImagePreview(safe); } };
      reader.onerror = () => showToast("The image could not be read. Try another file.");
      reader.readAsDataURL(file);
    });
    byId("clearCardImage").addEventListener("click", () => { byId("editorCardImageUrl").value = ""; byId("editorCardImageFile").value = ""; updateSelectedCard("imageUrl", ""); updateCardImagePreview(""); });
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
      preferences.compact = byId("compactTogglePage").checked;
      savePreferencesToBrowser();
      window.location.href = "cdashboard.html";
    });
    byId("resetAllBtn").addEventListener("click", () => {
      if (!window.confirm("Reset your personal dashboard cards, theme, and spacing to the defaults?")) return;
      preferences = {
        theme: "light", accent: "#2868e8", fontFamily: "dm-sans", fontScale: 100, customCards: [], compact: false,
        layout: DEFAULT_LAYOUT.map(item => ({ ...item })), dateRange: "30", chartMetric: "applications"
      };
      applyTheme({ save: false, markChanged: true });
      byId("compactTogglePage").checked = false;
      selectedCard = null;
      byId("cardAppearanceEditor").hidden = true;
      renderCards();
      renderCustomCards();
      showToast("Default settings loaded. Press Save preferences to apply them.");
    });


    document.querySelectorAll('a[href="cdashboard.html"]').forEach(link => link.addEventListener("click", () => {
      // Keep current edits if a user exits with a dashboard/back link.
      savePreferencesToBrowser();
    }));
    const sidebarLinks = Array.from(document.querySelectorAll('.customize-sidebar .main-nav a[href^="#"]'));
    const sidebarSections = sidebarLinks.map(link => $(link.getAttribute("href").slice(1))).filter(Boolean);
    sidebarLinks.forEach(link => link.addEventListener("click", event => {
      const target = $(link.getAttribute("href").slice(1));
      if (!target) return;
      event.preventDefault();

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      sidebarLinks.forEach(item => item.classList.toggle("active", item === link));
    }));
    if ("IntersectionObserver" in window) {
      const sectionObserver = new IntersectionObserver(entries => {
        const active = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!active) return;
        sidebarLinks.forEach(link => {
          const selected = link.getAttribute("href") === "#" + active.target.id;
          link.classList.toggle("active", selected);
          if (selected) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
        });
      }, { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.2, 0.5] });
      sidebarSections.forEach(section => sectionObserver.observe(section));
    }
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
      if (preferences.theme === "system") applyTheme();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      initialize();
    } catch (error) {
      console.error("TalentBridge customization page failed to initialize:", error);
      showToast("Customization did not load. Check the customization page and its CSS and JavaScript links.");
    }
  });
})();
