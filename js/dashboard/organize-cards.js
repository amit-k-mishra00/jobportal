(() => {
  "use strict";
  const PREF_KEY = "talentbridge.employer.preferences.v1";
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
  const $ = id => document.getElementById(id);
  let preferences = { theme: "light", accent: "#2868e8", fontFamily: "dm-sans", fontScale: 100, customCards: [], compact: false, layout: DEFAULT_LAYOUT.map(card => ({ ...card })), dateRange: "30", chartMetric: "applications", organizerMode: false };
  let arranging = false;
  let dirty = false;
  let toastTimer;

  function showToast(message) {
    const toast = $("organizerToast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }
  function status(message, changed = false) {
    $("organizerStatus").textContent = message;
    $("organizerStatus").classList.toggle("is-dirty", changed);
  }
  function markChanged() { dirty = true; status("Unsaved changes", true); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function defaultPosition(index) {
    return { x: 0.025 + (index % 3) * 0.325, y: 35 + Math.floor(index / 3) * 230 };
  }
  function normalizePosition(card, index) {
    const point = card.position && typeof card.position === "object" ? card.position : defaultPosition(index);
    card.position = { x: clamp(Number(point.x) || 0, 0, 1 - widthRatio(card.size)), y: clamp(Number(point.y) || 0, 0, 10000) };
  }
  function normalize() {
    const savedLayout = Array.isArray(preferences.layout) ? preferences.layout : [];
    const known = new Map(DEFAULT_LAYOUT.map(card => [card.id, card]));
    preferences.layout = savedLayout.filter(card => card && known.has(card.id)).map(card => ({ ...known.get(card.id), ...card }));
    DEFAULT_LAYOUT.forEach(card => { if (!preferences.layout.some(item => item.id === card.id)) preferences.layout.push({ ...card }); });
    preferences.layout.forEach((card, index) => {
      card.visible = card.visible !== false;
      card.size = ["compact", "standard", "wide"].includes(card.size) ? card.size : "standard";
      card.isPublic = Boolean(card.isPublic);
      normalizePosition(card, index);
    });
    preferences.customCards = Array.isArray(preferences.customCards) ? preferences.customCards.slice(0, 8) : [];
    preferences.customCards.forEach((card, index) => {
      card.size = ["compact", "standard", "wide"].includes(card.size) ? card.size : "standard";
      card.isPublic = Boolean(card.isPublic);
      normalizePosition(card, DEFAULT_LAYOUT.length + index);
    });
    preferences.fontScale = clamp(Number(preferences.fontScale) || 100, 90, 125);
  }
  function applySavedAppearance() {
    if (!/^#[0-9a-f]{6}$/i.test(preferences.accent)) preferences.accent = "#2868e8";
    if (!["light", "dark", "system"].includes(preferences.theme)) preferences.theme = "light";
    let theme = preferences.theme;
    if (theme === "system") theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.body.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("compact-layout", Boolean(preferences.compact));
    const fonts = { "dm-sans": "DM Sans, sans-serif", manrope: "Manrope, sans-serif", system: "system-ui, sans-serif" };
    document.documentElement.style.setProperty("--user-font", fonts[preferences.fontFamily] || fonts["dm-sans"]);
    document.documentElement.style.zoom = String(preferences.fontScale || 100) + "%";
    const color = preferences.accent.slice(1);
    const rgb = [0, 2, 4].map(index => parseInt(color.slice(index, index + 2), 16));
    document.documentElement.style.setProperty("--accent", preferences.accent);
    document.documentElement.style.setProperty("--accent-rgb", rgb.join(","));
    document.documentElement.style.setProperty("--accent-soft", "rgba(" + rgb.join(",") + ",.11)");
  }
  function safeRead() {
    try { const raw = localStorage.getItem(PREF_KEY); return raw ? JSON.parse(raw) : null; }
    catch (_) { showToast("Browser storage is unavailable. Open this page using Live Server to save your layout."); return null; }
  }
  function persist({ floating = true } = {}) {
    preferences.organizerMode = floating;
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(preferences));
      dirty = false;
      status("Layout saved in this browser.");
      return true;
    } catch (error) {
      console.error("Could not save the card layout.", error);
      status("Could not save. Try removing a large image.", true);
      showToast("The layout could not be saved. Try removing a large card image.");
      return false;
    }
  }
  function widthRatio(size) { return size === "wide" ? 0.51 : size === "compact" ? 0.25 : 0.31; }
  function setPosition(element, card) {
    element.style.left = (card.position.x * 100) + "%";
    element.style.top = card.position.y + "px";
    element.style.zIndex = String(Math.round(card.position.y / 10) + 1);
  }
  function makeCard(card, type) {
    const article = document.createElement("article");
    article.className = "organizer-card size-" + (card.size || "standard");
    article.dataset.cardId = card.id;
    article.dataset.cardType = type;
    article.setAttribute("aria-label", (type === "custom" ? card.title : card.label) + " card");
    article.setAttribute("role", "group");
    article.tabIndex = 0;
    setPosition(article, card);

    const heading = document.createElement("div"); heading.className = "organizer-card-heading";
    const drag = document.createElement("button"); drag.type = "button"; drag.className = "organizer-drag-handle"; drag.dataset.dragHandle = ""; drag.title = "Drag to move"; drag.setAttribute("aria-label", "Drag card to move"); drag.innerHTML = '<i data-lucide="move"></i>';
    const iconWrap = document.createElement("span"); iconWrap.className = "organizer-card-icon";
    const icon = document.createElement("i"); icon.dataset.lucide = card.icon || "notebook-pen"; iconWrap.appendChild(icon);
    const title = document.createElement("h2"); title.textContent = type === "custom" ? (card.title || "My card") : card.label;
    heading.append(drag, iconWrap, title);

    const imageUrl = typeof card.imageUrl === "string" && (/^https?:\/\//i.test(card.imageUrl) || /^data:image\/(png|jpeg|webp);base64,/i.test(card.imageUrl)) ? card.imageUrl : "";
    const children = [];
    if (imageUrl) { const image = document.createElement("img"); image.className = "organizer-card-image"; image.src = imageUrl; image.alt = ""; children.push(image); }
    const copy = document.createElement("p"); copy.className = "organizer-card-copy"; copy.textContent = type === "custom" ? (card.body || "") : (card.description || ""); children.push(copy);
    const orderControls = document.createElement("span"); orderControls.className = "organizer-order-controls";
    [[-1, "Move card up", "arrow-up"], [1, "Move card down", "arrow-down"]].forEach(([direction, label, iconName]) => {
      const button = document.createElement("button"); button.type = "button"; button.dataset.moveCard = String(direction); button.title = label; button.setAttribute("aria-label", label + ": " + title.textContent); button.innerHTML = '<i data-lucide="' + iconName + '"></i>'; orderControls.appendChild(button);
    });
    const controls = document.createElement("div"); controls.className = "organizer-card-controls";
    const resize = document.createElement("select"); resize.dataset.resizeCard = ""; resize.title = "Choose card size"; resize.setAttribute("aria-label", "Resize " + title.textContent);
    [["compact", "Small"], ["standard", "Medium"], ["wide", "Large"]].forEach(([value, label]) => { const option = document.createElement("option"); option.value = value; option.textContent = label; option.selected = value === (card.size || "standard"); resize.appendChild(option); });
    const sizeControl = document.createElement("label"); sizeControl.className = "organizer-size-control"; sizeControl.title = "Resize card"; const sizeIcon = document.createElement("i"); sizeIcon.dataset.lucide = "scaling"; const sizeText = document.createElement("span"); sizeText.textContent = "Size"; sizeControl.append(sizeIcon, sizeText, resize);
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "remove-card-btn"; remove.dataset.removeCard = ""; remove.title = type === "custom" ? "Delete personal card" : "Remove section from dashboard"; remove.innerHTML = '<i data-lucide="trash-2"></i><span>' + (type === "custom" ? "Delete" : "Remove") + '</span>';
    controls.append(orderControls, sizeControl, remove);
    article.append(heading, ...children, controls);
    return article;
  }
  function allVisibleCards() {
    const items = preferences.layout.filter(card => card.visible).map(card => ({ card, type: "layout" }))
      .concat(preferences.customCards.map(card => ({ card, type: "custom" })));
    return items.sort((a, b) => a.card.position.y - b.card.position.y || a.card.position.x - b.card.position.x);
  }
  function updateBoardHeight() {
    const items = allVisibleCards();
    const maxY = items.reduce((max, item) => Math.max(max, item.card.position.y), 0);
    $("organizerBoard").style.minHeight = Math.max(900, Math.ceil(maxY + 240)) + "px";
  }
  function renderBoard() {
    const host = $("organizerCards"); host.replaceChildren();
    const items = allVisibleCards();
    $("organizerEmpty").hidden = items.length > 0;
    items.forEach(item => host.appendChild(makeCard(item.card, item.type)));
    updateBoardHeight();
    if (window.lucide) window.lucide.createIcons();
  }
  function renderAvailable() {
    const host = $("availableCards"); host.replaceChildren();
    const hidden = preferences.layout.filter(card => !card.visible);
    if (!hidden.length) {
      const note = document.createElement("p"); note.className = "organizer-no-available"; note.textContent = "All dashboard sections are already on the board."; host.appendChild(note); return;
    }
    hidden.forEach(card => {
      const row = document.createElement("div"); row.className = "available-organizer-card";
      const iconWrap = document.createElement("span"); iconWrap.className = "custom-card-icon";
      const icon = document.createElement("i"); icon.dataset.lucide = card.icon; iconWrap.appendChild(icon);
      const info = document.createElement("span");
      const title = document.createElement("strong"); title.textContent = card.label;
      const description = document.createElement("small"); description.textContent = card.description;
      info.append(title, description);
      const add = document.createElement("button"); add.type = "button"; add.dataset.addDashboardCard = card.id; add.setAttribute("aria-label", "Add " + card.label); add.innerHTML = '<i data-lucide="plus"></i>';
      row.append(iconWrap, info, add); host.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
  }
  function openAddDialog() { renderAvailable(); $("addCardDialog").showModal(); }
  function setArrangeMode(value) {
    arranging = Boolean(value);
    if (!arranging) Array.from($("organizerCards").children).forEach(element => { const card = findCard(element); if (card) setPosition(element, card); });
    $("organizerBoard").classList.toggle("is-arranging", arranging);
    $("arrangeModeBtn").setAttribute("aria-pressed", String(arranging));
    $("arrangeModeBtn").innerHTML = arranging ? '<i data-lucide="check"></i> Done arranging' : '<i data-lucide="move"></i> Start arranging';
    if (window.lucide) window.lucide.createIcons();
  }
  function findCard(element) {
    const type = element.dataset.cardType;
    const list = type === "custom" ? preferences.customCards : preferences.layout;
    return list.find(card => card.id === element.dataset.cardId);
  }
  function setCardSize(element, size) {
    if (!["compact", "standard", "wide"].includes(size)) return;
    const card = findCard(element); if (!card || card.size === size) return;
    card.size = size;
    card.position.x = Math.min(card.position.x, 1 - widthRatio(card.size));
    markChanged(); renderBoard(); setArrangeMode(arranging);
    const resized = Array.from($("organizerCards").children).find(item => item.dataset.cardId === card.id);
    resized?.querySelector("[data-resize-card]")?.focus();
  }
  function removeCard(element) {
    const card = findCard(element); if (!card) return;
    if (element.dataset.cardType === "custom") preferences.customCards = preferences.customCards.filter(item => item.id !== card.id);
    else card.visible = false;
    markChanged(); renderBoard(); renderAvailable();
    showToast(element.dataset.cardType === "custom" ? "Personal card deleted." : "Section removed. You can add it again from Add a card.");
  }
  function moveCard(element, direction) {
    const items = allVisibleCards();
    const index = items.findIndex(item => item.card.id === element.dataset.cardId && item.type === element.dataset.cardType);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;
    const currentPosition = { ...items[index].card.position };
    items[index].card.position = { ...items[target].card.position };
    items[target].card.position = currentPosition;
    markChanged();
    renderBoard();
    setArrangeMode(arranging);
    const moved = Array.from($("organizerCards").children).find(card => card.dataset.cardId === element.dataset.cardId);
    moved?.querySelector(direction < 0 ? '[data-move-card="-1"]' : '[data-move-card="1"]')?.focus();
  }
  function createCustomCard(event) {
    event.preventDefault();
    const title = $("organizerCardTitle").value.trim();
    const body = $("organizerCardBody").value.trim();
    if (!title || !body) return;
    if (preferences.customCards.length >= 8) { showToast("You can create up to eight personal cards."); return; }
    preferences.customCards.push({ id: "custom-" + Date.now(), title, body, icon: $("organizerCardIcon").value, size: "standard", imageUrl: "", isPublic: false, position: defaultPosition(DEFAULT_LAYOUT.length + preferences.customCards.length) });
    event.currentTarget.reset(); $("addCardDialog").close(); markChanged(); renderBoard();
    showToast("Card added to your board. Save layout to keep it.");
  }
  function beginDrag(event) {
    if (!arranging) return;
    const handle = event.target.closest("[data-drag-handle]");
    const element = handle && handle.closest(".organizer-card");
    if (!element) return;
    const card = findCard(element); if (!card) return;
    event.preventDefault();
    const rect = $("organizerBoard").getBoundingClientRect();
    const startX = event.clientX; const startY = event.clientY;
    const originX = card.position.x; const originY = card.position.y;
    element.classList.add("is-dragging"); element.style.zIndex = "9999"; handle.setPointerCapture?.(event.pointerId);
    function move(moveEvent) {
      const widthMax = Math.max(0, 1 - widthRatio(card.size));
      card.position.x = clamp(originX + (moveEvent.clientX - startX) / rect.width, 0, widthMax);
      const pageScale = Math.max(0.5, (Number(preferences.fontScale) || 100) / 100);
      card.position.y = clamp(originY + (moveEvent.clientY - startY) / pageScale, 0, 10000);
      setPosition(element, card); element.style.zIndex = "9999"; updateBoardHeight(); markChanged();
    }
    function end() {
      element.classList.remove("is-dragging"); setPosition(element, card);
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end);
    }
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", end); window.addEventListener("pointercancel", end);
  }
  function init() {
    const saved = safeRead(); if (saved && typeof saved === "object") preferences = { ...preferences, ...saved };
    normalize(); applySavedAppearance(); renderBoard(); renderAvailable();
    $("organizerBoard").addEventListener("click", event => {
      const element = event.target.closest(".organizer-card"); if (!element) return;
      if (!arranging) { setArrangeMode(true); return; }

      const move = event.target.closest("[data-move-card]");
      if (move) { moveCard(element, Number(move.dataset.moveCard)); return; }
      if (event.target.closest("[data-remove-card]")) removeCard(element);
    });
    $("organizerBoard").addEventListener("keydown", event => {
      const element = event.target.closest(".organizer-card");
      if (!element) return;
      if (!arranging && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setArrangeMode(true); return; }
      if (!arranging || event.target !== element) return;
      const delta = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[event.key];
      if (!delta) return;
      const card = findCard(element); if (!card) return;
      card.position.x = clamp(card.position.x + delta[0] / Math.max(1, $("organizerBoard").clientWidth), 0, 1 - widthRatio(card.size));
      card.position.y = clamp(card.position.y + delta[1], 0, 10000);
      setPosition(element, card); element.style.zIndex = "9999"; updateBoardHeight(); markChanged(); event.preventDefault();
    });
    $("organizerBoard").addEventListener("change", event => {
      const select = event.target.closest("[data-resize-card]"); if (!select) return;
      const element = select.closest(".organizer-card"); if (element) setCardSize(element, select.value);
    });
    $("organizerBoard").addEventListener("pointerdown", beginDrag);
    $("addCardBtn").addEventListener("click", openAddDialog);
    document.querySelector("[data-open-add]").addEventListener("click", openAddDialog);
    $("closeAddDialog").addEventListener("click", () => $("addCardDialog").close());
    $("addCardDialog").addEventListener("click", event => { if (event.target === $("addCardDialog")) $("addCardDialog").close(); });
    $("availableCards").addEventListener("click", event => {
      const button = event.target.closest("[data-add-dashboard-card]"); if (!button) return;
      const card = preferences.layout.find(item => item.id === button.dataset.addDashboardCard); if (!card) return;
      card.visible = true;
      if (!card.position) card.position = defaultPosition(preferences.layout.indexOf(card));
      $("addCardDialog").close(); markChanged(); renderBoard(); renderAvailable();
    });
    $("organizerCustomForm").addEventListener("submit", createCustomCard);
    $("arrangeModeBtn").addEventListener("click", () => setArrangeMode(!arranging));
    $("saveLayoutBtn").addEventListener("click", () => { if (persist({ floating: true })) showToast("Floating layout saved. Open the dashboard to see it."); });
    $("standardLayoutBtn").addEventListener("click", () => {
      if (!window.confirm("Switch back to the standard dashboard rows? Your floating card positions will stay saved.")) return;
      if (persist({ floating: false })) window.location.href = "cdashboard.html";
    });
    document.querySelectorAll('a[href="customize.html"],a[href="cdashboard.html"]').forEach(link => link.addEventListener("click", () => {
      if (dirty) persist({ floating: link.getAttribute("href") === "cdashboard.html" ? true : preferences.organizerMode });
    }));
  }
  document.addEventListener("DOMContentLoaded", () => {
    try { init(); if (window.lucide) window.lucide.createIcons(); }
    catch (error) { console.error("Card organizer failed to start.", error); showToast("The card organizer could not load. Check the page and asset links."); }
  });
})();