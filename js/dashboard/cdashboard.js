document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const publicHeader = document.querySelector(".navbar");
  if (publicHeader) {
    const updateHeaderOffset = () => document.documentElement.style.setProperty("--public-header-height", Math.ceil(publicHeader.getBoundingClientRect().height) + "px");
    updateHeaderOffset();
    if ("ResizeObserver" in window) new ResizeObserver(updateHeaderOffset).observe(publicHeader);
    window.addEventListener("resize", updateHeaderOffset, { passive: true });
  }
  const PROFILE_KEY = "talentbridge.employer.profile.v1";
  const PREF_KEY = "talentbridge.employer.preferences.v1";
  const DATA_KEY = "talentbridge.employer.demoData.v1";
  let toastTimer;
  let profileHistory = [];
  let activeDocFilter = "all";
  let uploadedDocuments = [];
  let currentProfileTab = "basic";

  const defaultProfile = {
    companyName:"TechSphere Solutions", industry:"Information Technology",
    companyEmail:"hr@techsphere.example", companyPhone:"+91 98765 43210",
    companyLocation:"Bengaluru, India", website:"https://www.techsphere.example",
    employeeRange:"51–200 employees", founded:"2018",
    tagline:"Building innovative solutions for a better tomorrow.",
    description:"Find top talent and build a stronger team with AI-powered hiring.",
    about:"TechSphere Solutions is a growing technology company focused on building thoughtful, reliable digital products. We value collaboration, curiosity, continuous learning, and inclusive teams.",
    specialties:"AI, SaaS, Product Engineering, Data Analytics", culture:"Collaborative, inclusive, flexible",
    linkedin:"", social:"", logoUrl:"", bannerUrl:"",
    profileAccent:"#2868e8", publicHeadline:"Building innovative solutions for a better tomorrow.",
    publicEmail:false, publicPhone:false, publicLocation:true, discoverable:true
  };
  const defaultLayout = [
    {id:"stats",label:"Hiring statistics",icon:"chart-no-axes-column",visible:true},
    {id:"analytics",label:"Applications overview",icon:"chart-no-axes-combined",visible:true},
    {id:"applicants",label:"Recent applicants",icon:"users",visible:true},
    {id:"jobs",label:"Active jobs",icon:"briefcase-business",visible:true},
    {id:"pipeline",label:"Hiring pipeline",icon:"git-branch",visible:true},
    {id:"documents",label:"Documents & reports",icon:"folder-open",visible:true},
    {id:"team",label:"Team members",icon:"users-round",visible:true},
    {id:"profile",label:"Company profile card",icon:"building-2",visible:true}
  ];
  let profile = {...defaultProfile};
  let preferences = {theme:"light",accent:"#2868e8",fontFamily:"dm-sans",customCards:[],compact:false,layout:JSON.parse(JSON.stringify(defaultLayout)),dateRange:"30",chartMetric:"applications"};
  let demoData = {jobs:null, team:null, notificationsRead:false};

  function safeRead(key) {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : null; }
    catch (_) { return null; }
  }
  function persistProfile() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
    catch (_) { showToast("Could not save in browser storage. Export important details and connect Django for permanent saving."); }
  }
  function persistPreferences() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(preferences)); }
    catch (_) { showToast("Browser storage is unavailable. Preferences may not persist after closing this page."); }
  }
  function persistData() {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(demoData)); }
    catch (_) {}
  }
  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3100);
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }
  function safeImageUrl(value) {
    try {
      const url = new URL(value);
      return ["https:","http:"].includes(url.protocol) ? url.href : "";
    } catch (_) { return ""; }
  }
  function safeCardImageUrl(value) {
    const url = String(value || "").trim();
    if (/^data:image\/(png|jpeg|webp);base64,/i.test(url)) return url;
    return safeImageUrl(url);
  }
  function cssUrl(value) {
    const safe = safeImageUrl(value);
    return safe ? 'url("' + safe.replace(/["\\]/g, "\\$&") + '")' : "";
  }
  function companyInitials(name) {
    const words = String(name || "Company").trim().split(/\s+/).filter(Boolean);
    return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0,2)).toUpperCase();
  }
  function hexRgb(hex) {
    const clean = String(hex).replace("#","");
    return {r:parseInt(clean.slice(0,2),16),g:parseInt(clean.slice(2,4),16),b:parseInt(clean.slice(4,6),16)};
  }
  function setTheme(theme, accent, shouldSave=true) {
    preferences.theme = theme || preferences.theme;
    preferences.accent = accent || preferences.accent;
    let actualTheme = preferences.theme;
    if (actualTheme === "system") actualTheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.body.classList.toggle("dark", actualTheme === "dark");
    document.body.classList.toggle("compact-layout", !!preferences.compact);
    const fontStack={"dm-sans":"DM Sans, sans-serif",manrope:"Manrope, sans-serif",system:"system-ui, sans-serif"}[preferences.fontFamily]||"DM Sans, sans-serif";
    document.documentElement.style.setProperty("--user-font",fontStack);
    document.documentElement.style.zoom = String(preferences.fontScale || 100) + "%";
    const rgb = hexRgb(preferences.accent);
    document.documentElement.style.setProperty("--accent", preferences.accent);
    document.documentElement.style.setProperty("--accent-rgb", `${rgb.r},${rgb.g},${rgb.b}`);
    document.documentElement.style.setProperty("--accent-soft", `rgba(${rgb.r},${rgb.g},${rgb.b},.11)`);
    $("themeSelect").value = preferences.theme;
    $("customThemeSelect").value = preferences.theme;
    $("customAccent").value = preferences.accent;
    $("customAccentModal").value = preferences.accent;
    document.querySelectorAll("[data-accent]").forEach(btn => {
      const selected = btn.dataset.accent.toLowerCase() === preferences.accent.toLowerCase();
      btn.classList.toggle("selected", selected);
      btn.setAttribute("aria-pressed", String(selected));
    });
    const quickTheme = $("quickTheme");
    quickTheme.innerHTML = `<i data-lucide="${actualTheme === "dark" ? "sun" : "moon"}"></i>`;
    if (window.lucide) window.lucide.createIcons();
    if (shouldSave) persistPreferences();
  }
  function applyProfile() {
    const initials = companyInitials(profile.companyName);
    $("sidebarCompanyName").textContent = profile.companyName;
    $("sidebarCompanyLogo").textContent = initials;
    $("topCompanyName").textContent = profile.companyName;
    $("topCompanyAvatar").textContent = initials;
    $("bannerCompanyName").textContent = profile.companyName;
    $("bannerDescription").textContent = profile.description || profile.tagline || "Manage your hiring from one simple workspace.";
    $("profileCompanyName").textContent = profile.companyName;
    $("profileIndustry").textContent = profile.industry || "Industry not added";
    $("profileLocation").textContent = profile.publicLocation ? (profile.companyLocation || "Location not added") : "Location kept private";
    const website = safeImageUrl(profile.website);
    const websiteEl = $("profileWebsite");
    websiteEl.textContent = website ? website.replace(/^https?:\/\//,"").replace(/\/$/,"") : "Add a company website";
    websiteEl.href = website || "#";
    websiteEl.style.pointerEvents = website ? "auto" : "none";
    $("profileLogoLarge").textContent = initials;
    const logo = safeImageUrl(profile.logoUrl);
    [ $("profileLogoLarge"), $("sidebarCompanyLogo"), $("topCompanyAvatar") ].forEach(el => {
      el.style.backgroundImage = logo ? `${cssUrl(logo)}` : "";
      el.style.backgroundSize = "cover"; el.style.backgroundPosition = "center";
      if (logo) el.textContent = "";
    });
    if (!logo) {
      $("profileLogoLarge").textContent = initials;
      $("sidebarCompanyLogo").textContent = initials;
      $("topCompanyAvatar").textContent = initials;
    }
    const bannerUrl = safeImageUrl(profile.bannerUrl);
    $("bannerImage").style.backgroundImage = bannerUrl
      ? `${cssUrl(bannerUrl)}`
      : `url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85")`;
    if (profile.profileAccent) {
      const rgb = hexRgb(profile.profileAccent);
      $("profileLogoLarge").style.boxShadow = `inset 0 0 0 2px rgba(${rgb.r},${rgb.g},${rgb.b},.12)`;
    }
    updateCompletion();
    persistProfile();
  }
  function updateCompletion() {
    const required = ["companyName","industry","companyEmail","companyLocation","website","description","about","specialties","logoUrl"];
    const completed = required.filter(key => String(profile[key] || "").trim().length > 0).length;
    const percent = Math.round((completed / required.length) * 100);
    $("completionPercent").textContent = `${percent}%`;
    $("completionProgress").style.width = `${percent}%`;
  }
  function openProfileEditor(tab="basic") {
    fillProfileForm();
    openProfileTab(tab);
    $("profileModal").showModal();
  }
  function fillProfileForm() {
    const fieldMap = {
      companyName:"companyNameInput",industry:"industryInput",companyEmail:"companyEmailInput",companyPhone:"companyPhoneInput",
      companyLocation:"companyLocationInput",website:"websiteInput",employeeRange:"employeeRangeInput",founded:"foundedInput",
      tagline:"taglineInput",description:"descriptionInput",about:"aboutInput",specialties:"specialtiesInput",culture:"cultureInput",
      linkedin:"linkedinInput",social:"socialInput",logoUrl:"logoUrlInput",bannerUrl:"bannerUrlInput",profileAccent:"profileAccentInput",
      publicHeadline:"publicHeadlineInput"
    };
    Object.entries(fieldMap).forEach(([key,id]) => { $(id).value = profile[key] || ""; });
    ["publicEmail","publicPhone","publicLocation","discoverable"].forEach(key => {
      const field = $(`${key}Input`); if (field) field.checked = !!profile[key];
    });
  }
  function readProfileForm() {
    const result = {...profile};
    const fieldMap = {
      companyName:"companyNameInput",industry:"industryInput",companyEmail:"companyEmailInput",companyPhone:"companyPhoneInput",
      companyLocation:"companyLocationInput",website:"websiteInput",employeeRange:"employeeRangeInput",founded:"foundedInput",
      tagline:"taglineInput",description:"descriptionInput",about:"aboutInput",specialties:"specialtiesInput",culture:"cultureInput",
      linkedin:"linkedinInput",social:"socialInput",logoUrl:"logoUrlInput",bannerUrl:"bannerUrlInput",profileAccent:"profileAccentInput",
      publicHeadline:"publicHeadlineInput"
    };
    Object.entries(fieldMap).forEach(([key,id]) => { result[key] = $(id).value.trim(); });
    ["publicEmail","publicPhone","publicLocation","discoverable"].forEach(key => { result[key] = $(`${key}Input`).checked; });
    return result;
  }
  function openProfileTab(tab) {
    currentProfileTab = tab;
    document.querySelectorAll("[data-profile-tab]").forEach(btn => btn.classList.toggle("active", btn.dataset.profileTab === tab));
    document.querySelectorAll("[data-profile-page]").forEach(section => section.classList.toggle("active", section.dataset.profilePage === tab));
  }
  function openPreview(title, subtitle, htmlContent) {
    $("previewTitle").textContent = title;
    $("previewSubtitle").textContent = subtitle;
    $("previewBody").innerHTML = htmlContent;
    $("previewModal").showModal();
  }
  function publicHighlightsPreviewHtml() {
    const cards = [];
    (Array.isArray(preferences.layout) ? preferences.layout : []).filter(card => card.isPublic).forEach(card => {
      cards.push({ title: card.label, body: card.description, imageUrl: card.imageUrl });
    });
    (Array.isArray(preferences.customCards) ? preferences.customCards : []).filter(card => card.isPublic).forEach(card => {
      cards.push({ title: card.title || "My card", body: card.body || "", imageUrl: card.imageUrl });
    });
    if (!cards.length) return "";
    return `<section class="public-highlights"><h3>Public dashboard cards</h3><div class="public-highlights-grid">${cards.map(card => {
      const image = safeCardImageUrl(card.imageUrl);
      return `<article>${image ? `<img src="${escapeHtml(image)}" alt="">` : ""}<strong>${escapeHtml(card.title)}</strong><p>${escapeHtml(card.body)}</p></article>`;
    }).join("")}</div></section>`;
  }
  function profilePreviewHtml(p) {
    const banner = safeImageUrl(p.bannerUrl);
    const logo = safeImageUrl(p.logoUrl);
    const initials = companyInitials(p.companyName);
    const specialties = (p.specialties || "").split(",").map(s => s.trim()).filter(Boolean);
    return `<div class="preview-banner" style="${banner ? `background-image:${escapeHtml(cssUrl(banner))}` : ""}"></div>
      <div class="preview-company-row"><div class="preview-company-logo" style="${logo ? `background-image:${escapeHtml(cssUrl(logo))}` : ""}">${logo ? "" : escapeHtml(initials)}</div><div><h3>${escapeHtml(p.companyName)}</h3><p>${escapeHtml(p.industry || "Industry not added")} · ${escapeHtml(p.publicLocation ? (p.companyLocation || "Location not added") : "Location private")}</p></div></div>
      <p class="preview-about">${escapeHtml(p.publicHeadline || p.tagline || p.description || "")}\n\n${escapeHtml(p.about || p.description || "No public company description added yet.")}</p>
      <div class="preview-tag-list">${specialties.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      ${publicHighlightsPreviewHtml()}<p class="preview-about">${p.publicEmail ? `Business email: ${escapeHtml(p.companyEmail)}\n` : ""}${p.publicPhone ? `Phone: ${escapeHtml(p.companyPhone)}\n` : ""}${safeImageUrl(p.website) ? `Website: ${escapeHtml(p.website)}` : ""}</p>`;
  }
  function openCustomize() {
    $("compactToggle").checked = !!preferences.compact;
    $("customThemeSelect").value = preferences.theme;
    renderCardSettings();
    $("customizeModal").showModal();
  }
  function renderCardSettings() {
    const settings = $("cardSettings");
    const reorder = $("reorderSettings");
    settings.innerHTML = ""; reorder.innerHTML = "";
    preferences.layout.forEach((item,index) => {
      const row = document.createElement("label");
      row.className = "card-setting";
      row.innerHTML = `<span class="setting-icon"><i data-lucide="${escapeHtml(item.icon)}"></i></span><span>${escapeHtml(item.label)}</span><input type="checkbox" aria-label="Show ${escapeHtml(item.label)}" ${item.visible ? "checked" : ""}>`;
      row.querySelector("input").checked = item.visible;
      row.querySelector("input").addEventListener("change",e => { item.visible = e.target.checked; });
      settings.appendChild(row);

      const orderRow = document.createElement("div");
      orderRow.className = "card-setting";
      orderRow.innerHTML = `<span class="setting-icon"><i data-lucide="grip-vertical"></i></span><span>${escapeHtml(item.label)} ${item.visible ? "" : '<small style="color:var(--muted);font-weight:400">(hidden)</small>'}</span><div class="reorder-buttons"><button type="button" data-order-up="${index}" aria-label="Move ${escapeHtml(item.label)} up"><i data-lucide="arrow-up"></i></button><button type="button" data-order-down="${index}" aria-label="Move ${escapeHtml(item.label)} down"><i data-lucide="arrow-down"></i></button></div>`;
      reorder.appendChild(orderRow);
    });
    if (window.lucide) window.lucide.createIcons();
  }
  function applyLayout() {
    const mainGridIds = ["analytics","applicants"];
    const lowerGridIds = ["jobs","pipeline"];
    const resourceIds = ["documents","team","profile"];
    const cardEls = new Map();
    document.querySelectorAll("[data-card-id]").forEach(el => cardEls.set(el.dataset.cardId,el));
    preferences.layout.forEach(item => {
      const el = cardEls.get(item.id);
      if (!el) return;
      el.classList.toggle("is-hidden", !item.visible);
      el.classList.remove("card-size-compact", "card-size-standard", "card-size-wide");
      el.classList.add("card-size-" + (['compact', 'wide'].includes(item.size) ? item.size : 'standard'));
      let image = Array.from(el.children).find(child => child.classList.contains("card-custom-image"));
      const imageUrl = safeCardImageUrl(item.imageUrl);
      if (imageUrl) {
        if (!image) { image = document.createElement("img"); image.className = "card-custom-image"; el.prepend(image); }
        image.src = imageUrl; image.alt = item.label + " card picture"; image.loading = "lazy";
      } else if (image) image.remove();
      let badge = Array.from(el.children).find(child => child.classList.contains("card-public-badge"));
      if (item.isPublic) {
        if (!badge) { badge = document.createElement("span"); badge.className = "card-public-badge"; el.appendChild(badge); }
        badge.textContent = "Public profile preview";
      } else if (badge) badge.remove();
    });
    const organizerBoard = $("userCards");
    if (organizerBoard) {
      organizerBoard.classList.toggle("organizer-dashboard-board", Boolean(preferences.organizerMode));
      if (preferences.organizerMode) {
        const allBoardCards = preferences.layout.filter(item => item.visible).concat(preferences.customCards || []);
        const maxY = allBoardCards.reduce((max, item) => Math.max(max, Number(item.position && item.position.y) || 0), 0);
        organizerBoard.style.minHeight = Math.max(900, Math.ceil(maxY + 240)) + "px";
        preferences.layout.forEach((item, index) => {
          if (!item.visible) return;
          const el = cardEls.get(item.id); if (!el) return;
          const point = item.position || { x: 0.025 + (index % 3) * 0.325, y: 35 + Math.floor(index / 3) * 230 };
          el.classList.add("floating-dashboard-card");
          el.style.left = (Math.max(0, Math.min(Number(point.x) || 0, item.size === "wide" ? 0.49 : item.size === "compact" ? 0.75 : 0.69)) * 100) + "%";
          el.style.top = Math.max(0, Math.min(Number(point.y) || 0, 10000)) + "px";
          el.style.zIndex = String(Math.round((Number(point.y) || 0) / 10) + 1);
          organizerBoard.appendChild(el);
        });
      } else {
        organizerBoard.classList.remove("organizer-dashboard-board");
        organizerBoard.style.minHeight = "";
        preferences.layout.forEach(item => {
          const el = cardEls.get(item.id); if (!el) return;
          el.classList.remove("floating-dashboard-card");
          el.style.left = ""; el.style.top = ""; el.style.zIndex = "";
          const parent = item.id === "stats" ? document.querySelector(".content-wrap")
            : ["analytics", "applicants"].includes(item.id) ? document.querySelector(".dashboard-grid")
            : ["jobs", "pipeline"].includes(item.id) ? document.querySelector(".lower-grid")
            : document.querySelector(".resource-grid");
          if (parent && el.parentElement !== parent) parent.appendChild(el);
        });
      }
    }
    const ordered = preferences.layout;
    function reorderWithin(parent, ids) {
      if (!parent) return;
      ordered.filter(item => ids.includes(item.id)).forEach(item => {
        const el = cardEls.get(item.id);
        if (el && el.parentElement === parent) parent.appendChild(el);
      });
    }
    // Keep each visual row semantically grouped while honoring order within each row.
    reorderWithin(document.querySelector(".dashboard-grid"),mainGridIds);
    reorderWithin(document.querySelector(".lower-grid"),lowerGridIds);
    reorderWithin(document.querySelector(".resource-grid"),resourceIds);
    persistPreferences();
  }
  function renderUserCards(){
    const host=$("userCards");if(!host)return;host.querySelectorAll(".user-card").forEach(card=>card.remove());host.classList.toggle("organizer-dashboard-board",Boolean(preferences.organizerMode));
    (Array.isArray(preferences.customCards)?preferences.customCards:[]).forEach((card,index)=>{
      const article=document.createElement("article");article.className="user-card card-size-"+(["compact","wide"].includes(card.size)?card.size:"standard")+(preferences.organizerMode?" floating-dashboard-card":"");
      const point=card.position||{x:0.025+((preferences.layout.length+index)%3)*0.325,y:35+Math.floor((preferences.layout.length+index)/3)*230};
      if(preferences.organizerMode){article.style.left=(Math.max(0,Math.min(Number(point.x)||0,card.size==="wide"?0.49:card.size==="compact"?0.75:0.69))*100)+"%";article.style.top=Math.max(0,Math.min(Number(point.y)||0,10000))+"px";article.style.zIndex=String(Math.round((Number(point.y)||0)/10)+1);}
      const imageUrl=safeCardImageUrl(card.imageUrl);
      if(imageUrl){const image=document.createElement("img");image.className="card-custom-image";image.src=imageUrl;image.alt=(card.title||"My card")+" card picture";image.loading="lazy";article.appendChild(image);}
      const heading=document.createElement("div");heading.className="user-card-heading";
      const icon=document.createElement("i");icon.dataset.lucide=card.icon||"notebook-pen";
      const title=document.createElement("h3");title.textContent=card.title||"My card";heading.append(icon,title);
      const body=document.createElement("p");body.textContent=card.body||"";
      article.append(heading,body);
      if(card.isPublic){const badge=document.createElement("span");badge.className="user-card-public";badge.textContent="Public preview";article.appendChild(badge);}
      host.appendChild(article);
    });
    if(window.lucide)window.lucide.createIcons();
  }
  function renderChart() {
    const canvas = $("hiringChart");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1,2);
    const width = Math.max(300,rect.width);
    const height = Math.max(180,rect.height);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    const ctx = canvas.getContext("2d"); ctx.scale(dpr,dpr);
    const style = getComputedStyle(document.body);
    const muted = style.getPropertyValue("--muted").trim() || "#77849a";
    const line = style.getPropertyValue("--line").trim() || "#e4eaf3";
    const accent = style.getPropertyValue("--accent").trim() || "#2868e8";
    const colors = [accent,"#956de6","#20a878"];
    const padding = {left:29,right:8,top:9,bottom:26};
    const plotW=width-padding.left-padding.right, plotH=height-padding.top-padding.bottom;
    const ranges = {
      "7":{labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],a:[9,14,12,19,16,25,22],b:[4,7,5,10,8,13,12],c:[1,2,2,3,2,4,3]},
      "30":{labels:["Wk 1","Wk 2","Wk 3","Wk 4","Wk 5","Wk 6"],a:[28,34,29,47,42,58],b:[17,23,19,32,29,38],c:[6,8,7,12,10,15]},
      "90":{labels:["Jan","Feb","Mar","Apr","May","Jun"],a:[30,42,37,58,49,66],b:[15,24,21,36,31,40],c:[5,9,7,13,10,17]},
      "365":{labels:["Jan","Mar","May","Jul","Sep","Nov"],a:[22,35,32,52,48,71],b:[13,20,18,29,32,45],c:[4,7,6,12,13,19]}
    };
    let data=ranges[preferences.dateRange]||ranges["30"];
    const metric = preferences.chartMetric;
    if(metric==="interviews") data={...data,a:data.b,b:data.c,c:data.c.map(v=>Math.max(1,Math.round(v*.55)))};
    if(metric==="hires") data={...data,a:data.c,b:data.c.map(v=>Math.max(1,Math.round(v*.62))),c:data.c.map(v=>Math.max(1,Math.round(v*.4)))};
    const maxVal=Math.ceil(Math.max(...data.a,...data.b,...data.c)/10)*10 || 10;
    ctx.clearRect(0,0,width,height);
    ctx.font="10px DM Sans, sans-serif";
    ctx.textAlign="right";ctx.textBaseline="middle";ctx.fillStyle=muted;
    for(let i=0;i<=4;i++){
      const y=padding.top+plotH*i/4;
      ctx.strokeStyle=line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(padding.left,y);ctx.lineTo(width-padding.right,y);ctx.stroke();
      ctx.fillText(String(Math.round(maxVal*(1-i/4))),padding.left-8,y);
    }
    data.labels.forEach((label,i)=>{
      const x=padding.left+(plotW*i/(data.labels.length-1));
      ctx.textAlign="center";ctx.textBaseline="top";ctx.fillStyle=muted;ctx.fillText(label,x,height-17);
    });
    const series=[data.a,data.b,data.c];
    series.forEach((values,sIndex)=>{
      const points=values.map((v,i)=>({x:padding.left+plotW*i/(values.length-1),y:padding.top+plotH-(v/maxVal)*plotH}));
      if(sIndex===0){
        const gradient=ctx.createLinearGradient(0,padding.top,0,height-padding.bottom);
        gradient.addColorStop(0,`rgba(${hexRgbToString(accent)},.20)`);gradient.addColorStop(1,`rgba(${hexRgbToString(accent)},0)`);
        ctx.beginPath();ctx.moveTo(points[0].x,padding.top+plotH);points.forEach(p=>ctx.lineTo(p.x,p.y));ctx.lineTo(points[points.length-1].x,padding.top+plotH);ctx.closePath();ctx.fillStyle=gradient;ctx.fill();
      }
      ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.strokeStyle=colors[sIndex];ctx.lineWidth=sIndex===0?2.5:2;ctx.lineJoin="round";ctx.lineCap="round";ctx.stroke();
      points.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,2.3,0,Math.PI*2);ctx.fillStyle=colors[sIndex];ctx.fill();});
    });
  }
  function hexRgbToString(value){
    const rgb=hexRgb(value);return `${rgb.r},${rgb.g},${rgb.b}`;
  }
  function openJobDialog() {$("jobForm").reset();$("jobOpeningsInput").value="1";$("jobModal").showModal();}
  function renderJobs() {
    const defaults = [
      {title:"Frontend Developer",type:"Full-time",location:"Bengaluru, India",applicants:45,status:"Active",icon:"code-2",tone:"blue"},
      {title:"Data Analyst",type:"Full-time",location:"Hyderabad, India",applicants:32,status:"Active",icon:"database",tone:"purple"},
      {title:"UI/UX Designer",type:"Full-time",location:"Remote",applicants:28,status:"Active",icon:"palette",tone:"orange"},
      {title:"Product Manager",type:"Full-time",location:"Bengaluru, India",applicants:23,status:"Active",icon:"layers",tone:"green"}
    ];
    const jobs = Array.isArray(demoData.jobs) ? demoData.jobs : defaults;
    $("jobList").innerHTML = jobs.map((job,index)=>`<div class="job-row" data-job-index="${index}"><span class="job-icon ${escapeHtml(job.tone||"blue")}"><i data-lucide="${escapeHtml(job.icon||"briefcase-business")}"></i></span><div class="job-main"><strong>${escapeHtml(job.title)}</strong><span>${escapeHtml(job.type)} · ${escapeHtml(job.location || "Location flexible")}</span></div><span class="applicant-count">${Number(job.applicants)||0} applicants</span><span class="job-status">${escapeHtml(job.status||"Active")}</span><button class="icon-btn tiny job-menu" data-job-menu="${index}" aria-label="Options for ${escapeHtml(job.title)}"><i data-lucide="more-vertical"></i></button></div>`).join("");
    $("activeJobsValue").textContent=String(jobs.filter(j=>j.status!=="Closed").length).padStart(2,"0");
    if (window.lucide) window.lucide.createIcons();
  }
  function addJob(e) {
    e.preventDefault();
    const job={
      title:$("jobTitleInput").value.trim(),type:$("jobTypeInput").value,location:$("jobLocationInput").value.trim()||"Location flexible",
      applicants:0,status:"Active",icon:"briefcase-business",tone:"blue",
      openings:Number($("jobOpeningsInput").value)||1,level:$("jobLevelInput").value,description:$("jobDescriptionInput").value.trim()
    };
    if(!job.title){showToast("Please enter a job title.");return;}
    if(!Array.isArray(demoData.jobs)) {
      const existing=[...document.querySelectorAll("#jobList .job-row")].map(row=>({
        title:row.querySelector(".job-main strong")?.textContent||"Role",
        type:(row.querySelector(".job-main span")?.textContent||"Full-time").split(" · ")[0],
        location:(row.querySelector(".job-main span")?.textContent||"").split(" · ").slice(1).join(" · "),
        applicants:parseInt(row.querySelector(".applicant-count")?.textContent)||0,status:"Active",icon:"briefcase-business",tone:"blue"
      }));
      demoData.jobs=existing;
    }
    demoData.jobs.unshift(job);persistData();renderJobs();$("jobModal").close();showToast("Job added to your dashboard preview. Connect Django to publish it.");
  }
  function fileIcon(name) {
    const ext=name.split(".").pop().toLowerCase();
    if(ext==="pdf")return {icon:"file-text",cls:"pdf"};
    if(["xls","xlsx","csv"].includes(ext))return {icon:"file-spreadsheet",cls:"excel"};
    if(["doc","docx"].includes(ext))return {icon:"file-text",cls:"word"};
    if(["png","jpg","jpeg"].includes(ext))return {icon:"image",cls:"image"};
    return {icon:"file",cls:"word"};
  }
  function formatBytes(bytes) {
    if(bytes<1024)return `${bytes} B`;
    if(bytes<1048576)return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/1048576).toFixed(1)} MB`;
  }
  function renderUploadedDocs() {
    document.querySelectorAll(".document-row[data-uploaded='true']").forEach(el=>el.remove());
    const list=$("documentList");
    uploadedDocuments.forEach((doc,index)=>{
      const type=doc.type || "other";
      const icon=fileIcon(doc.name);
      const row=document.createElement("div");row.className="document-row";row.dataset.docType=type;row.dataset.uploaded="true";row.dataset.uploadIndex=index;
      row.innerHTML=`<span class="file-type ${icon.cls}"><i data-lucide="${icon.icon}"></i></span><div class="document-main"><strong>${escapeHtml(doc.name)}</strong><small>${escapeHtml(doc.sizeLabel)} · Added just now · browser preview</small></div><button class="icon-btn tiny file-download" data-upload-download="${index}" aria-label="Download ${escapeHtml(doc.name)}"><i data-lucide="download"></i></button><button class="icon-btn tiny file-more" data-upload-remove="${index}" aria-label="Remove ${escapeHtml(doc.name)}"><i data-lucide="trash-2"></i></button>`;
      list.appendChild(row);
    });
    applyDocumentFilter();
    if(window.lucide)window.lucide.createIcons();
  }
  function applyDocumentFilter() {
    document.querySelectorAll(".document-row").forEach(row=>{
      row.hidden=activeDocFilter!=="all" && row.dataset.docType!==activeDocFilter;
    });
    document.querySelectorAll("[data-doc-filter]").forEach(btn=>btn.classList.toggle("active",btn.dataset.docFilter===activeDocFilter));
  }
  function uploadFiles(files) {
    const allowed=/\.(pdf|docx?|xlsx?|csv|png|jpe?g)$/i;
    let added=0;
    Array.from(files).forEach(file=>{
      if(file.size>10*1024*1024){showToast(`${file.name} is larger than 10 MB and was skipped.`);return;}
      if(!allowed.test(file.name)){showToast(`${file.name} is not a supported file type.`);return;}
      const ext=file.name.split(".").pop().toLowerCase();
      let type="other";
      if(["pdf","xls","xlsx","csv"].includes(ext))type="report";
      if(["doc","docx"].includes(ext))type="contract";
      uploadedDocuments.push({name:file.name,size:file.size,sizeLabel:formatBytes(file.size),type,file});
      added++;
    });
    if(added){renderUploadedDocs();showToast(`${added} file(s) added to this demo view. Securely store real files with Django.`);}
  }
  function downloadSampleCsv() {
    const range=$("dateRange").selectedOptions[0].text;
    const rows=[["Metric","Value","Period"],["Active jobs",$("activeJobsValue").textContent,range],["Total applicants",$("applicantsValue").textContent,range],["Shortlisted",$("shortlistedValue").textContent,range],["Hired",$("hiredValue").textContent,range]];
    const csv=rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download="talentbridge-hiring-sample.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    showToast("Downloaded sample dashboard statistics as CSV.");
  }
  function focusSection(id,message){const target=$(id);if(!target){showToast(message);return;}target.scrollIntoView({behavior:"smooth",block:"start"});target.classList.remove("section-focus");void target.offsetWidth;target.classList.add("section-focus");showToast(message);}
  function openTeamManager(){
    const rows=[...document.querySelectorAll("#teamList .team-row")];
    const members=Array.isArray(demoData.team)?demoData.team:rows.map((row,i)=>({name:row.querySelector("strong")?.textContent||`Member ${i+1}`,email:row.querySelector("small")?.textContent||"",role:row.querySelector(".team-role")?.textContent||"Recruiter"}));
    demoData.team=members;
    openPreview("Manage team members","Edit sample roles and add members to this browser preview.",`<form id="teamManagerForm"><p class="preview-about">These are local demo settings. Real permissions must be enforced by Django.</p><div class="team-manager-list">${members.map((m,i)=>`<div class="team-manager-row"><div><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.email)}</small></div><label>Role<select name="role-${i}"><option ${m.role==="Recruiter"?"selected":""}>Recruiter</option><option ${m.role==="Hiring manager"?"selected":""}>Hiring manager</option><option ${m.role==="Admin"?"selected":""}>Admin</option><option ${m.role==="Viewer"?"selected":""}>Viewer</option></select></label></div>`).join("")}</div><div class="form-grid" style="margin-top:14px"><label>New member name<input id="newTeamName" maxlength="80" placeholder="Name"></label><label>Work email<input id="newTeamEmail" type="email" maxlength="254" placeholder="name@company.com"></label></div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button type="button" class="btn btn-outline" id="addTeamMemberDemo">Add member</button></div><div class="modal-footer"><span class="spacer"></span><button type="button" class="btn btn-ghost" data-close="previewModal">Cancel</button><button type="submit" class="btn btn-primary">Save team preview</button></div></form>`);
  }
  function openNotifications(){const notes=[{title:"New applicant received",detail:"A candidate applied for Frontend Developer.",time:"Today"},{title:"Interview reminder",detail:"Review upcoming interviews and candidate notes.",time:"Today"},{title:"Company profile",detail:"Keep your company information up to date.",time:"This week"}];openPreview("Notifications",demoData.notificationsRead?"You're all caught up.":"Recent activity for your workspace.",`${demoData.notificationsRead?'<p class="preview-about">No unread notifications.</p>':`<div class="notification-list">${notes.map(n=>`<div class="notification-item"><span class="notification-dot"></span><div><strong>${n.title}</strong><p>${n.detail}</p><small>${n.time}</small></div></div>`).join("")}</div>`}<div class="modal-footer"><span class="spacer"></span><button type="button" class="btn btn-outline" id="markNotificationsRead">Mark all as read</button><button type="button" class="btn btn-primary" data-close="previewModal">Done</button></div>`);}
  function globalSearch(query) {
    const q=query.trim().toLowerCase();
    document.querySelectorAll(".job-row,.applicant-row,.document-row,.team-row").forEach(row=>{
      row.hidden=!!q && !row.textContent.toLowerCase().includes(q);
    });
    if(q)showToast(`Showing dashboard items matching “${query.trim()}”. Clear search to show everything.`);
  }

  // Restore preferences and saved profile.
  const savedProfile=safeRead(PROFILE_KEY); if(savedProfile)profile={...profile,...savedProfile};
  const savedPrefs=safeRead(PREF_KEY); if(savedPrefs)preferences={...preferences,...savedPrefs,layout:Array.isArray(savedPrefs.layout)?savedPrefs.layout:JSON.parse(JSON.stringify(defaultLayout))};
  const savedData=safeRead(DATA_KEY); if(savedData)demoData={...demoData,...savedData};
  const savedLayout = Array.isArray(preferences.layout) ? preferences.layout : [];
  preferences.layout = [
    ...savedLayout.filter(item => defaultLayout.some(def => def.id === item.id))
      .map(item => ({...defaultLayout.find(def => def.id === item.id), ...item})),
    ...defaultLayout.filter(def => !savedLayout.some(item => item.id === def.id)).map(item => ({...item}))
  ];
  preferences.customCards=Array.isArray(preferences.customCards)?preferences.customCards.slice(0,8):[];
  if(!["dm-sans","manrope","system"].includes(preferences.fontFamily))preferences.fontFamily="dm-sans";
  preferences.fontScale=Math.max(90,Math.min(125,Number(preferences.fontScale)||100));
  preferences.layout.forEach((card,index)=>{card.size=["compact","standard","wide"].includes(card.size)?card.size:"standard";card.imageUrl=safeCardImageUrl(card.imageUrl);card.isPublic=Boolean(card.isPublic);const point=card.position&&typeof card.position==="object"?card.position:{x:0.025+(index%3)*0.325,y:35+Math.floor(index/3)*230};card.position={x:Math.max(0,Math.min(Number(point.x)||0,card.size==="wide"?0.49:card.size==="compact"?0.75:0.69)),y:Math.max(0,Math.min(Number(point.y)||0,10000))};});
  preferences.customCards.forEach((card,index)=>{card.size=["compact","standard","wide"].includes(card.size)?card.size:"standard";card.imageUrl=safeCardImageUrl(card.imageUrl);card.isPublic=Boolean(card.isPublic);const point=card.position&&typeof card.position==="object"?card.position:{x:0.025+((preferences.layout.length+index)%3)*0.325,y:35+Math.floor((preferences.layout.length+index)/3)*230};card.position={x:Math.max(0,Math.min(Number(point.x)||0,card.size==="wide"?0.49:card.size==="compact"?0.75:0.69)),y:Math.max(0,Math.min(Number(point.y)||0,10000))};});
  setTheme(preferences.theme,preferences.accent,false);
  $("compactToggle").checked=!!preferences.compact;
  $("dateRange").value=preferences.dateRange||"30";
  $("chartMetric").value=preferences.chartMetric||"applications";
  applyProfile();renderJobs();applyLayout();renderUserCards();renderChart();
  if(Array.isArray(demoData.team)&&demoData.team.length){const teamList=$("teamList"),colors=["blue","purple","orange","green","pink"];teamList.innerHTML=demoData.team.map((m,i)=>`<div class="team-row"><span class="team-avatar ${colors[i%colors.length]}">${escapeHtml(companyInitials(m.name))}</span><div class="team-main"><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.email)}</small></div><span class="team-role">${escapeHtml(m.role)}</span></div>`).join("");}
  if(window.lucide)window.lucide.createIcons();

  // Theme / visual personalization
  $("themeSelect").addEventListener("change",e=>setTheme(e.target.value,preferences.accent));
  $("customThemeSelect").addEventListener("change",e=>setTheme(e.target.value,preferences.accent));
  document.querySelectorAll("[data-accent]").forEach(btn=>btn.addEventListener("click",()=>setTheme(preferences.theme,btn.dataset.accent)));
  $("customAccent").addEventListener("input",e=>setTheme(preferences.theme,e.target.value));
  $("customAccentModal").addEventListener("input",e=>setTheme(preferences.theme,e.target.value));
  $("quickTheme").addEventListener("click",()=>setTheme(document.body.classList.contains("dark")?"light":"dark",preferences.accent));
  $("compactToggle").addEventListener("change",e=>{preferences.compact=e.target.checked;document.body.classList.toggle("compact-layout",preferences.compact);persistPreferences();});
  $("dateRange").addEventListener("change",e=>{preferences.dateRange=e.target.value;persistPreferences();renderChart();$("chartRangeLabel").textContent=`${e.target.selectedOptions[0].text} · illustrative sample data`;});
  $("chartMetric").addEventListener("change",e=>{preferences.chartMetric=e.target.value;persistPreferences();renderChart();});
  window.addEventListener("resize",()=>{window.clearTimeout(window.__tbChartResize);window.__tbChartResize=setTimeout(renderChart,120);});
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change",()=>{if(preferences.theme==="system")setTheme("system",preferences.accent,false);});

  document.addEventListener("click",e=>{const close=e.target.closest("[data-close]");if(!close)return;const dialog=document.getElementById(close.dataset.close);if(dialog?.open)dialog.close();});
  // Profile editing
  ["editCompanyQuick","profileTrigger","editProfileBtn","editDetailsBtn"].forEach(id=>$(id).addEventListener("click",()=>openProfileEditor()));
  $("editBannerBtn").addEventListener("click",()=>openProfileEditor("branding"));
  $("profileForm").addEventListener("submit",e=>{
    e.preventDefault();
    const next=readProfileForm();
    if(!next.companyName.trim()){showToast("Company name is required.");openProfileTab("basic");$("companyNameInput").focus();return;}
    profileHistory.push({...profile});
    if(profileHistory.length>10)profileHistory.shift();
    profile=next;persistProfile();applyProfile();$("profileModal").close();showToast("Company profile saved in this browser demo.");
  });
  $("undoProfileBtn").addEventListener("click",()=>{
    if(!profileHistory.length){showToast("No saved profile changes to undo in this session.");return;}
    profile=profileHistory.pop();persistProfile();applyProfile();fillProfileForm();showToast("Restored the previous saved company profile.");
  });
  $("previewProfileBtn").addEventListener("click",()=>openPreview("Public company profile preview","Check your changes before saving.",profilePreviewHtml(readProfileForm())));
  $("previewPublicBtn").addEventListener("click",()=>openPreview("Public company profile preview","This is a local preview, not a published profile.",profilePreviewHtml(profile)));
  $("bannerDescription").addEventListener("dblclick",()=>openProfileEditor("about"));
  document.querySelectorAll("[data-profile-tab]").forEach(btn=>btn.addEventListener("click",()=>openProfileTab(btn.dataset.profileTab)));

  // Dashboard customization
  ["customizeBtn","openCustomizeSide"].forEach(id=>$(id).addEventListener("click",()=>{ window.location.href = "customize.html"; }));
  $("customizeForm").addEventListener("submit",e=>{
    e.preventDefault();
    preferences.theme=$("customThemeSelect").value;
    preferences.compact=$("compactToggle").checked;
    setTheme(preferences.theme,preferences.accent,false);
    applyLayout();persistPreferences();$("customizeModal").close();showToast("Your dashboard preferences were saved.");
  });
  $("reorderSettings").addEventListener("click",e=>{
    const up=e.target.closest("[data-order-up]");const down=e.target.closest("[data-order-down]");
    const index=up?Number(up.dataset.orderUp):down?Number(down.dataset.orderDown):-1;
    const other=up?index-1:index+1;
    if(index<0||other<0||other>=preferences.layout.length)return;
    [preferences.layout[index],preferences.layout[other]]=[preferences.layout[other],preferences.layout[index]];
    renderCardSettings();
  });
  $("resetLayoutBtn").addEventListener("click",()=>{
    preferences.layout=JSON.parse(JSON.stringify(defaultLayout));
    preferences.theme="light";preferences.accent="#2868e8";preferences.compact=false;
    setTheme(preferences.theme,preferences.accent,false);$("compactToggle").checked=false;renderCardSettings();
    showToast("Default layout and theme selected. Save preferences to apply.");
  });

  // Jobs and job menus
  ["postJobBtn","addJobInline"].forEach(id=>$(id).addEventListener("click",openJobDialog));
  $("jobForm").addEventListener("submit",addJob);
  $("jobList").addEventListener("click",e=>{
    const button=e.target.closest("[data-job-menu]");if(!button)return;
    const index=Number(button.dataset.jobMenu);
    const job=Array.isArray(demoData.jobs)?demoData.jobs[index]:null;
    const title=job?.title || document.querySelectorAll("#jobList .job-row")[index]?.querySelector(".job-main strong")?.textContent || "job";
    if(confirm(`Close “${title}” in this local demo? Choose Cancel to keep it active.`)){
      if(!Array.isArray(demoData.jobs)){
        demoData.jobs=[...document.querySelectorAll("#jobList .job-row")].map(row=>({
          title:row.querySelector(".job-main strong")?.textContent||"Role",
          type:(row.querySelector(".job-main span")?.textContent||"Full-time").split(" · ")[0],
          location:(row.querySelector(".job-main span")?.textContent||"").split(" · ").slice(1).join(" · "),
          applicants:parseInt(row.querySelector(".applicant-count")?.textContent)||0,status:"Active",icon:"briefcase-business",tone:"blue"
        }));
      }
      if(demoData.jobs[index])demoData.jobs[index].status="Closed";
      persistData();renderJobs();showToast("Job marked closed in this demo. Connect Django for real job changes.");
    }
  });

  // Document handling
  $("uploadBtn").addEventListener("click",()=>$("fileInput").click());
  $("fileInput").addEventListener("change",e=>{uploadFiles(e.target.files);e.target.value="";});
  $("teamList").addEventListener("click",e=>{if(e.target.closest(".team-more"))openTeamManager();});
  $("documentList").addEventListener("click",e=>{
    const remove=e.target.closest("[data-upload-remove]");
    const download=e.target.closest("[data-upload-download]");
    if(remove){
      uploadedDocuments.splice(Number(remove.dataset.uploadRemove),1);renderUploadedDocs();showToast("Removed from this demo list. Server-side files need a Django delete endpoint.");return;
    }
    if(download){
      const doc=uploadedDocuments[Number(download.dataset.uploadDownload)];
      if(doc?.file){
        const url=URL.createObjectURL(doc.file);const a=document.createElement("a");a.href=url;a.download=doc.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      }
      return;
    }
    const mock=e.target.closest(".file-download");
    if(mock){const title=mock.closest(".document-row")?.querySelector("strong")?.textContent||"Hiring sample";const body=`${title}\n\nTalentBridge AI sample document.\nThis preview contains no private company data.`;const url=URL.createObjectURL(new Blob([body],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=`${title.replace(/\.[^.]+$/,"")} - sample.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast("Downloaded a text preview of the sample document.");}
    const sampleRemove=e.target.closest(".file-more");
    if(sampleRemove){const row=sampleRemove.closest(".document-row");if(row&&confirm(`Remove ${row.querySelector("strong")?.textContent||"this sample file"} from this demo list?`)){row.remove();showToast("Sample document removed from this view.");}}
  });
  document.querySelectorAll("[data-doc-filter]").forEach(btn=>btn.addEventListener("click",()=>{activeDocFilter=btn.dataset.docFilter;applyDocumentFilter();}));

  // Team and actions: demo prompts
  $("inviteBtn").addEventListener("click",()=>openPreview("Invite a team member","Design preview only.",`<div class="form-grid"><label>Work email<input id="inviteEmail" type="email" placeholder="colleague@company.com"></label><label>Permission<select id="inviteRole"><option>Recruiter</option><option>Hiring manager</option><option>Admin</option><option>Viewer</option></select></label></div><p class="preview-about">Connect Django and your email service to send real invitations.</p><div style="margin-top:12px"><button class="btn btn-primary" id="sendInviteDemo" type="button">Preview invitation</button></div>`));
  $("manageTeamBtn").addEventListener("click",openTeamManager);
  $("viewAllApplicants").addEventListener("click",()=>focusSection("applicants","Recent applicants are shown below."));
  $("applicantList").addEventListener("click",e=>{const row=e.target.closest(".applicant-row");if(!row)return;const name=row.querySelector("strong")?.textContent||"Candidate",role=row.querySelector("small")?.textContent||"Applicant",status=row.querySelector(".status-pill")?.textContent||"New";openPreview("Applicant quick view","Sample candidate details",`<div class="candidate-preview"><span class="candidate-preview-avatar">${escapeHtml(companyInitials(name))}</span><div><h3>${escapeHtml(name)}</h3><p>${escapeHtml(role)}</p><span class="status-pill">${escapeHtml(status)}</span></div></div><p class="preview-about">Sample applicant preview. Connect Django to show real CVs, contact details, feedback, and application history.</p><div class="modal-footer"><span class="spacer"></span><button type="button" class="btn btn-outline" data-close="previewModal">Close</button><button type="button" class="btn btn-primary" id="shortlistCandidateDemo">Mark shortlisted</button></div>`);$("previewBody").dataset.candidateName=name;});
  $("viewAllJobs").addEventListener("click",()=>focusSection("jobs","Your active jobs are shown below."));
  $("pipelineDetails").addEventListener("click",()=>focusSection("pipeline","Hiring pipeline overview. Figures are sample data in this demo."));
  $("notificationsBtn").addEventListener("click",openNotifications);
  document.querySelectorAll("[data-stat-menu]").forEach(btn=>btn.addEventListener("click",()=>{
    const card=btn.closest("[data-card-id]"); if(!card)return;
    const item=preferences.layout.find(x=>x.id===card.dataset.cardId);
    if(item){item.visible=false;applyLayout();persistPreferences();showToast("Card hidden. Open Customize to add it back.");}
  }));

  // Search across visible lists
  $("globalSearch").addEventListener("input",e=>{
    const q=e.target.value.trim().toLowerCase();
    document.querySelectorAll("#applicantList .applicant-row,#jobList .job-row,#documentList .document-row,#teamList .team-row").forEach(row=>{
      row.hidden=!!q&&!row.textContent.toLowerCase().includes(q);
    });
  });
  document.addEventListener("keydown",e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("globalSearch").focus();}
    if(e.key==="Escape")document.querySelector(".sidebar.open")?.classList.remove("open");
  });
  $("mobileMenu").addEventListener("click",()=> $("sidebar").classList.toggle("open"));
  document.addEventListener("click",e=>{
    if(window.innerWidth<=760&&$("sidebar").classList.contains("open")&&!$("sidebar").contains(e.target)&&!$("mobileMenu").contains(e.target))$("sidebar").classList.remove("open");
  });
  document.querySelectorAll(".main-nav a").forEach(link=>link.addEventListener("click",()=>{
    document.querySelectorAll(".main-nav a").forEach(el=>el.classList.toggle("active",el===link));
    $("sidebar").classList.remove("open");
  }));
  $("downloadChart").addEventListener("click",downloadSampleCsv);
  $("resetDemo").addEventListener("click",()=>{
    if(!confirm("Reset this browser's saved company profile and dashboard preferences to the demo defaults?"))return;
    localStorage.removeItem(PROFILE_KEY);localStorage.removeItem(PREF_KEY);localStorage.removeItem("talentbridge.site.theme.v1");localStorage.removeItem(DATA_KEY);location.reload();
  });
  $("logoutBtn").addEventListener("click",()=>{if(confirm("Leave this dashboard and return to sign in? This demo has no active account session."))window.location.href="../login.html";});

  // Dynamically inserted invitation action
  $("previewBody").addEventListener("click",e=>{
    if(e.target.closest("#shortlistCandidateDemo")){const name=$("previewBody").dataset.candidateName||"Candidate";const row=[...document.querySelectorAll("#applicantList .applicant-row")].find(r=>r.querySelector("strong")?.textContent===name);const pill=row?.querySelector(".status-pill");if(pill){pill.textContent="Shortlisted";pill.classList.remove("new","rejected");pill.classList.add("shortlisted");}$("previewModal").close();showToast(`${name} marked shortlisted in this demo.`);return;}
    if(e.target.closest("#markNotificationsRead")){demoData.notificationsRead=true;persistData();$("previewModal").close();showToast("Notifications marked as read in this browser demo.");return;}
    if(e.target.closest("#addTeamMemberDemo")){const name=$("newTeamName")?.value.trim(),email=$("newTeamEmail")?.value.trim();if(!name||!email||!email.includes("@")){showToast("Enter a name and valid work email.");return;}demoData.team.push({name,email,role:"Recruiter"});persistData();openTeamManager();showToast("Team member added to the local preview.");return;}
    if(e.target.closest("#sendInviteDemo")){
      const email=$("inviteEmail")?.value.trim();
      if(!email||!email.includes("@")){showToast("Enter a valid work email in the invitation preview.");return;}
      showToast(`Invitation preview prepared for ${email}. No email was sent.`);
      $("previewModal").close();
    }
  });
  $("previewBody").addEventListener("submit",e=>{if(e.target.id!=="teamManagerForm")return;e.preventDefault();demoData.team=demoData.team.map((m,i)=>({...m,role:e.target.elements[`role-${i}`]?.value||m.role}));persistData();$("previewModal").close();showToast("Team preview roles saved in this browser.");});
});
