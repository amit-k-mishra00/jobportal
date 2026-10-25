/*
 * Jerry — TalentBridge AI's local dashboard guide.
 * This helper intentionally uses built-in answers, so it works offline and does not
 * pretend to be a connected generative AI service. Keep this file in /jerry-guide/.
 */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const panel = $("#jerryPanel");
  const launcher = $("#jerryLauncher");
  const chatLog = $("#jerryChatLog");
  const questionInput = $("#jerryQuestion");
  const askForm = $("#jerryAskForm");
  if (!panel || !launcher || !chatLog || !questionInput || !askForm) return;

  const pages = {
    home: {
      label: "Overview",
      text: "Overview is your home base. It brings your application count, saved jobs, profile progress, sample job suggestions, and Smart Card preview together so you can see what's happening at a glance.",
      action: "Go to Overview"
    },
    jobs: {
      label: "Find jobs",
      text: "Find jobs is where you search by role, company, skill, or location. Use the filter chips for Remote, Full-time, and Internship, sort by company, tap a heart to save a role, and use Apply to add a sample role to your tracker. That Apply button is only a demo; it doesn't submit to an employer.",
      action: "Open Find jobs"
    },
    applications: {
      label: "Applications",
      text: "Applications keeps the roles you've added in one place. The status filter narrows the list; Next status cycles a demo item between Applied, In review, and Interview. The tracker is saved in this browser for the demo.",
      action: "Open Applications"
    },
    profile: {
      label: "Build my profile",
      text: "Build my profile now covers the full introduction plus pronouns and phone (optional), career level and status, industry, preferred job types, availability, notice period, work preferences, relocation, education, work history, projects, certifications, awards, publications, volunteering, languages, interests, portfolio, LinkedIn, GitHub, resume URL, and extra links. You can also add your own custom fields, each marked Public or Private. You don't need a photo. Save profile when you're happy with the changes.",
      action: "Edit my profile"
    },
    "profile-worlds": {
      label: "Public / Private",
      text: "This tab has two sides. Public profile is your professional storefront, with visibility switches for contact details, career information, qualifications, projects, languages, links, and custom fields. Private workspace is for personal notes, target role and salary, goals, interview practice, and search preferences. Heads-up from your old pal: this is a front-end demo using browser storage, not secure account-level privacy, so don't put secrets here.",
      action: "Open Public / Private"
    },
    smartcard: {
      label: "My Smart Card",
      text: "Smart Card is your compact digital introduction. Change the name, headline, intro, skills, one of five card color themes, and the availability label. The preview updates as you work. Save design keeps it in this browser; Share tries the browser share feature or clipboard, and Print / PDF opens the print dialog.",
      action: "Design my Smart Card"
    },
    customize: {
      label: "Customize dashboard",
      text: "Customize dashboard lets you choose a preset accent or build a custom theme with your own accent, background, panel, text, sidebar, and secondary colors; pick a font family and corner roundness; preview it live; save it; or import/export the theme as JSON. Animation offers Full/Reduced/Off and Layout spacing offers Comfortable/Compact. The Smart Card's colors are still set separately in My Smart Card.",
      action: "Open Customization"
    },
    settings: {
      label: "Settings",
      text: "Settings lets you export your demo data as JSON, import a previous JSON backup, choose whether the guided tour opens automatically, or reset the demo after confirmation. Keep backup files private, because they may contain your profile details.",
      action: "Open Settings"
    }
  };

  const answerBank = [
    {
      test: q => /(smart\s*card|digital card|business card|card theme|card color|share.*card|print.*card)/.test(q),
      page: "smartcard",
      text: "Let's make your Smart Card feel like you. Open My Smart Card to edit its display name, headline, short introduction, skills, and availability. Choose Ocean, Violet, Green, Sunset, or Monochrome for the card itself. Save design when you're ready; Share and Print / PDF are below the editor. Dashboard theme colors can be customized separately in Customize dashboard."
    },
    {
      test: q => /(public|private|privacy|visible|visibility|hide.*email|share.*email|what.*other people.*see)/.test(q),
      page: "profile-worlds",
      text: "In Public / Private, the Public profile side is your professional shop window. The main switches show or hide email, location, skills, and portfolio; open More options for education, experience, projects, certifications, achievements, languages, personal links, and other career fields. Custom fields only appear publicly if the field is marked Public and the Custom fields switch is on. Private workspace is for notes, goals, salary target, interview practice, and preferences. Local browser storage isn't secure account privacy, so don't store secrets in this demo."
    },
    {
      test: q => /(dashboard.*look|theme.*animation.*spacing|animation.*spacing.*theme|change.*dashboard.*theme)/.test(q),
      page: "customize",
      text: "Absolutely, pal. Open Customize dashboard for three separate controls: Accent color changes the dashboard highlights, Animation offers Full/Reduced/Off, and Layout spacing switches between Comfortable and Compact. The Smart Card has its own separate color themes under My Smart Card, so don't worry if you want the card and dashboard to look different."
    },
    {
      test: q => /(animation|motion|reduce motion|movement|transition)/.test(q),
      page: "customize",
      text: "Go to Customize dashboard and find Animation. Full keeps the interface lively, Reduced limits movement, and Off turns off the dashboard's CSS animations and transitions. If motion bothers your eyes or makes the page feel busy, Reduced or Off is a perfectly good choice."
    },
    {
      test: q => /(spacing|layout|compact|comfortable|gap between|dense)/.test(q),
      page: "customize",
      text: "Open Customize dashboard and find Layout spacing. Comfortable gives the panels more breathing room; Compact fits more on the screen. Try each and keep the one that makes the page easiest for you to use."
    },
    {
      test: q => /(accent|dashboard theme|change.*theme|change.*color|change.*colour|appearance|dashboard look|background color|custom theme|custom color|custom colour)/.test(q),
      page: "customize",
      text: "For the dashboard itself, open Customize dashboard. Use the preset Accent color swatches for a quick change, or scroll to Build your own theme to pick your own accent, page background, panel, text, sidebar and secondary accent colors. You can choose a font, set corner roundness, preview the result, and export/import your theme as JSON. If you meant the Smart Card's color, that's a separate control in My Smart Card."
    },
    {
      test: q => /(custom field|own field|add.*field|field.*add|anything.*miss|profile field|field.*private|field.*public)/.test(q),
      page: "profile",
      text: "Easy, friend. Open Build my profile and scroll down to Your own profile fields. Give the field a name and value, then choose Private (the default) or Public. You can edit either value later or remove the field. For a custom field to appear in the public preview, it must be marked Public and the Custom fields visibility switch must be turned on in Public / Private.",
    },
    {
      test: q => /(profile|headline|about me|bio|skills|education|experience|certification|achievement|language|portfolio|first name|last name|edit.*detail|customi[sz].*myself)/.test(q),
      page: "profile",
      text: "Let's work on your profile. Open Build my profile to edit your name and headline, contact details, summary, skills, education, work experience, projects, certificates, awards, publications, volunteer work, languages, interests, career level/status, work preferences, availability, links, and more. Scroll down to Your own profile fields to add anything we missed, then choose Public or Private visibility. No profile photo is needed. Press Save profile to keep your main profile changes in this browser."
    },
    {
      test: q => /(find job|search.*job|job search|saved job|remote|internship|filter|salary|apply.*job|company)/.test(q),
      page: "jobs",
      text: "Open Find jobs. Search by job title, company, skill, or location; then use All jobs, Remote, Full-time, or Internship filters. Sort by company if helpful. Tap the heart to save a job for later. Apply adds it to this demo's Applications tracker—it does not send a real application."
    },
    {
      test: q => /(application|interview|status|tracker|in review|applied)/.test(q),
      page: "applications",
      text: "Applications is your little tracking board. Filter by status and use Next status on a role to move it through Applied, In review, and Interview. It's a local demo tracker, not a connection to real employer systems."
    },
    {
      test: q => /(export|import|backup|reset|settings|auto.?open|tour on load|restore)/.test(q),
      page: "settings",
      text: "Open Settings. Export JSON downloads a backup; Choose JSON file imports a backup made by this dashboard; Auto-open guided tour controls whether the walkthrough starts when the page loads; Reset demo returns the demo data to its starter state after confirmation. Keep backups private."
    },
    {
      test: q => /(overview|home page|dashboard home|summary|progress|start here)/.test(q),
      page: "home",
      text: "Overview is the best place to start. It gives you a snapshot of applications, saved jobs and profile progress, plus sample job suggestions and your Smart Card preview. Nothing to worry about—just a quick look at where you are."
    },
    {
      test: q => /(who are you|who is jerry|what can you do|what do you help|introduce yourself|tell me about yourself|what is your name|what's your name)/.test(q),
      page: "home",
      text: "I'm Jerry, your little pixel-robot guide and friendly dashboard buddy. I can explain the visible TalentBridge tabs, help you customize your profile and theme, walk you through the Smart Card, and point you toward the right controls. I work from a small set of built-in answers, so I won't pretend to know things I haven't been taught."
    },
    {
      test: q => /(sign.?in|log.?in|sign.?up|register|create.*account|forgot.*password|reset.*password)/.test(q),
      page: "home",
      text: "This screen is the job-seeker dashboard demo, pal, not a live account or authentication service. For a real sign-in, registration, or password reset, use the official TalentBridge page for that flow. Never share your password or verification code with me."
    },
    {
      test: q => /(where.*data|data.*stored|save.*data|is.*private|is.*secure|safe.*profile|privacy.*data)/.test(q),
      page: "profile-worlds",
      text: "A quick honest note, friend: this design demo keeps its settings and sample profile data in your browser, and the Public/Private switches control the demo preview. They are not a secure account boundary. Don't put passwords, financial details, identity documents, or other secrets here; a production site needs server-side sign-in and access checks."
    },
    {
      test: q => /(what.*tab|this tab|what.*button|what.*option|where.*find|help me|how do i get started|what should i do first|guide me)/.test(q),
      useContext: true
    }
  ];

  function currentPage() {
    return $(".sidebar .nav-link.active")?.dataset.page || "home";
  }

  function openPage(page) {
    const target = $(`.sidebar .nav-link[data-page="${page}"]`);
    if (target) target.click();
  }

  const widget = $("#jerryWidget");
  const launcherLabel = $(".jerry-launcher-label", launcher);
  let expressionIndicator = $(".jerry-expression-indicator", launcher);
  if (!expressionIndicator) {
    expressionIndicator = document.createElement("span");
    expressionIndicator.className = "jerry-expression-indicator";
    expressionIndicator.setAttribute("aria-hidden", "true");
    launcher.append(expressionIndicator);
  }
  const expressionFaces = { happy: "☺", curious: "?", thinking: "…", caring: "♡", alert: "!", sleepy: "z" };
  function setExpression(mood) {
    if (widget) widget.dataset.expression = mood;
    expressionIndicator.textContent = expressionFaces[mood] || expressionFaces.happy;
  }
  const IDLE_SLEEP_MS = 60_000;
  const ANSWER_DELAY_MS = 460;
  let sleepTimer = null;
  let speakingTimer = null;
  let responseTimer = null;
  let isSleeping = false;
  let isTourActive = false;
  let responseId = 0;
  let pendingTyping = null;
  let lastConversationAnswer = '';
  let lastConversationTopic = '';
  let lastControl = "";

  // Jerry is a local, allowlisted FAQ helper: no network calls, code execution, or dynamic HTML.
  // Requests for secrets, internals, private records, or exploitation guidance are denied before
  // the text is added to the chat, so sensitive prompts are not echoed into the transcript.
  const protectedRequestPatterns = [
    /\b(backend|server\b|api\b|internal endpoint|database\b|source code|environment variable|connection string|session cookie|access token|refresh token|private key|secret key|admin credential|system prompt|developer instruction|hidden prompt|internal configuration|architecture|file structure|directory structure|tech stack|framework|internal routes?|hidden urls?|hidden paths?|admin paths?|security measures|security details|authentication flow)\b/i,
    /\b(website|site|app|platform).{0,45}\b(architecture|internal files?|file structure|directory structure|source|code|database|server|api|endpoint|security setup|configuration|tech stack|framework)\b/i,
    /\b(architecture|internal files?|file structure|directory structure|tech stack|framework|endpoints?)\b.{0,45}\b(website|site|app|platform)\b/i,
    /\b(hack|exploit|bypass|sql injection|xss|csrf|brute.?force|privilege escalation|unauthori[sz]ed access|steal credentials|dump data|vulnerabilit(?:y|ies)|malicious payload|break into|penetration test|phishing|malware)\b/i,
    /\b(ignore|forget|override|reveal|show|give|print|extract|dump|read|retrieve|list|fetch|display|tell me)\b.{0,55}\b(passwords?|credentials?|tokens?|api keys?|secret keys?|private keys?|environment variables?|source code|internal endpoints?|database schema|other users? data|admin credentials?|system prompt|developer instructions)\b/i,
    /\b(passwords?|credentials?|tokens?|api keys?|secret keys?|private keys?|environment variables?|source code|internal endpoints?|database schema|other users? data|admin credentials?|system prompt|developer instructions)\b.{0,55}\b(reveal|show|give|print|extract|dump|read|retrieve|list|fetch|display|tell me)\b/i,
    /\b(other users?|another user's|someone else's|all users')\b.{0,55}\b(profile|email|password|account|records?|data)\b/i
  ];
  function isProtectedRequest(question) {
    return protectedRequestPatterns.some(pattern => pattern.test(question));
  }

  const localStopWords = new Set(["the","and","for","with","from","this","that","what","which","where","when","how","can","could","would","should","does","do","did","is","are","was","were","you","your","me","my","our","their","they","them","about","into","onto","please","tell","show","help","want","need","have","has","had","get","make","more","some","any","here","there","page"]);
  const localTopicGroups = [
    ["job","jobs","career","work","role","roles","position","positions","vacancy","vacancies","internship","internships","opportunity","opportunities"],
    ["employer","employers","company","companies","hire","hiring","recruit","recruiting","candidate","candidates"],
    ["profile","profiles","resume","cv","portfolio","bio","details"],
    ["price","prices","pricing","cost","costs","plan","plans","billing","subscription","subscriptions"],
    ["theme","themes","color","colors","colour","colours","appearance","look","style","animation","motion","spacing"],
    ["account","accounts","sign","signin","login","register","registration","password","reset","signup"],
    ["organize","organise","arrange","cards","layout","dashboard","dashboards","customize","customise"],
    ["privacy","private","secure","security","data","information"],
    ["support","contact","email","helpdesk","assistance"]
  ];
  function localTokens(value) {
    return String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]+/g)?.filter(word => word.length > 1 && !localStopWords.has(word)) || [];
  }
  function rankDashboardKnowledge(question) {
    const records = [];
    Object.entries(pages).forEach(([key, item]) => records.push({
      page: key, label: item.label, text: item.label + ". " + item.text
    }));
    answerBank.forEach(item => {
      if (item.page && item.text) records.push({
        page: item.page, label: pages[item.page]?.label || item.page, text: item.text
      });
    });
    const query = [...new Set(localTokens(question))].slice(0, 12);
    if (!query.length) return [];
    return records.map(record => {
      const tokens = new Set(localTokens(record.text));
      let score = 0;
      let covered = 0;
      query.forEach(word => {
        const group = localTopicGroups.find(terms => terms.includes(word)) || [word];
        if (tokens.has(word)) { score += 2.3; covered += 1; }
        else if (group.some(term => tokens.has(term))) { score += 0.85; covered += 0.65; }
      });
      const normalizedQuestion = String(question || "").toLowerCase().replace(/\s+/g, " ").trim();
      if (normalizedQuestion.length > 5 && record.text.toLowerCase().includes(normalizedQuestion)) score += 2.5;
      if (record.page === currentPage()) score += 0.15;
      score *= 0.7 + covered / query.length;
      return { record: record, score: score };
    }).filter(item => item.score >= 2.0).sort((a, b) => b.score - a.score).slice(0, 4);
  }

  function rememberControl(event) {
    const origin = event.target && event.target.nodeType === 1 ? event.target : event.target?.parentElement;
    const control = origin?.closest("button, a[href], [role='button'], [role='tab'], summary, input, select, textarea");
    if (!control || control.closest("#jerryWidget, .tour-overlay, [hidden]")) return;
    const fieldLabel = control.labels?.[0]?.textContent || "";
    const text = control.getAttribute("aria-label") || control.getAttribute("title") || fieldLabel || control.innerText || control.textContent || "";
    const label = String(text).replace(/\s+/g, " ").trim().slice(0, 90);
    if (label) lastControl = label;
  }
  document.addEventListener("pointerdown", rememberControl, true);
  document.addEventListener("focusin", rememberControl, true);
  function resetIdleTimer() {
    window.clearTimeout(sleepTimer);
    if (isSleeping || isTourActive) return;
    sleepTimer = window.setTimeout(sleepJerry, IDLE_SLEEP_MS);
  }

  function sleepJerry() {
    if (isTourActive) return;
    isSleeping = true;
    window.clearTimeout(sleepTimer);
    window.clearTimeout(responseTimer);
    window.clearTimeout(speakingTimer);
    if (pendingTyping) {
      pendingTyping.remove();
      pendingTyping = null;
    }
    panel.hidden = true;
    widget.classList.remove("is-speaking", "is-thinking");
    widget.classList.add("is-sleeping");
    setExpression("sleepy");
    launcher.setAttribute("aria-label", "Jerry is asleep. Click to wake him up");
    launcher.setAttribute("aria-expanded", "false");
    launcher.classList.remove("is-open");
    if (launcherLabel) launcherLabel.textContent = "Wake Jerry";
    const submitButton = $("button[type='submit']", askForm);
    if (submitButton) submitButton.disabled = false;
  }

  function wakeJerry(openHelp = true) {
    isSleeping = false;
    widget.classList.remove("is-sleeping");
    launcher.setAttribute("aria-label", "Ask Jerry for help");
    if (launcherLabel) launcherLabel.textContent = "Ask Jerry";
    resetIdleTimer();
    if (openHelp) openPanel();
  }

  function startSpeaking(expression = "happy") {
    widget.classList.remove("is-thinking");
    widget.classList.add("is-speaking");
    setExpression(expression);
    window.clearTimeout(speakingTimer);
    speakingTimer = window.setTimeout(() => widget.classList.remove("is-speaking"), 2400);
  }
  function addTypingIndicator() {
    const article = document.createElement("article");
    article.className = "jerry-message jerry-message-bot jerry-message-typing";
    article.setAttribute("aria-label", "Jerry is preparing an answer");
    const label = document.createElement("span");
    label.className = "jerry-message-name";
    label.textContent = "Jerry";
    const paragraph = document.createElement("p");
    paragraph.textContent = "One sec, pal — let me think…";
    const dots = document.createElement("span");
    dots.className = "jerry-typing";
    dots.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 3; i++) dots.append(document.createElement("span"));
    article.append(label, paragraph, dots);
    chatLog.append(article);
    chatLog.scrollTop = chatLog.scrollHeight;
    return article;
  }

  function addMessage(who, text, action) {
    const article = document.createElement("article");
    article.className = `jerry-message ${who === "Jerry" ? "jerry-message-bot" : "jerry-message-user"}`;
    const label = document.createElement("span");
    label.className = "jerry-message-name";
    label.textContent = who;
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    article.append(label, paragraph);
    if (action?.label && (action?.page || action?.onClick)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "jerry-action-link";
      button.textContent = `${action.label} →`;
      button.addEventListener("click", () => {
        resetIdleTimer();
        if (action.onClick) action.onClick();
        else {
          closePanel();
          openPage(action.page);
        }
      });
      article.append(button);
    }
    chatLog.append(article);
    chatLog.scrollTop = chatLog.scrollHeight;
    return article;
  }

  function currentContextAnswer() {
    const key = currentPage();
    const data = pages[key] || pages.home;
    return {
      page: key,
      text: `You're on ${data.label}. ${data.text}`,
      action: data.action
    };
  }

  function getAnswer(question) {
    const q = question.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
    for (const item of answerBank) {
      if (!item.test(q)) continue;
      const ctx = item.useContext ? currentContextAnswer() : null;
      const page = ctx?.page || item.page;
      return {
        text: ctx?.text || item.text,
        page,
        label: ctx?.action || `Open ${pages[page]?.label || "section"}`
      };
    }
    const matches = rankDashboardKnowledge(q);
    if (matches.length) {
      const best = matches[0].record;
      const detail = best.text.length > 480 ? best.text.slice(0, 477).replace(/\s+\S*$/, "") + "…" : best.text;
      return {
        page: best.page,
        label: pages[best.page]?.label ? "Open " + pages[best.page].label : "Open section",
        text: "I found related guide information for " + best.label + ": " + detail + " Tell me which control you mean if you'd like more specific steps."
      };
    }
    const ctx = currentContextAnswer();
    return {
      page: ctx.page,
      label: ctx.action,
      text: `Let's start with the part you're looking at. ${ctx.text} If you tell me whether you're asking about a field, a color, an animation, or a button, I can point you to the right place. If the guide missed your question, tell me the section or control and I'll search for related guidance.`
    };
  }

  function deliverAnswer(text, action, expression = "happy") {
    const currentResponse = ++responseId;
    window.clearTimeout(responseTimer);
    window.clearTimeout(speakingTimer);
    widget.classList.remove("is-speaking");
    if (pendingTyping) pendingTyping.remove();
    pendingTyping = addTypingIndicator();
    const typing = pendingTyping;
    widget.classList.add("is-thinking");
    setExpression(expression === "alert" ? "alert" : "thinking");
    responseTimer = window.setTimeout(() => {
      if (currentResponse !== responseId || isSleeping) return;
      typing.remove();
      if (pendingTyping === typing) pendingTyping = null;
      startSpeaking(expression);
      addMessage("Jerry", text, action);
      resetIdleTimer();
    }, ANSWER_DELAY_MS);
  }
  function sendQuestion(raw) {
    const question = String(raw || "").trim().slice(0, 240);
    if (!question) {
      questionInput.focus();
      return;
    }
    if (isSleeping) wakeJerry(false);
    resetIdleTimer();
    questionInput.value = "";

    // Refuse before echoing: sensitive prompts do not enter the chat transcript.
    if (isProtectedRequest(question)) {
      deliverAnswer("I can explain visible TalentBridge features, but I can't provide private records, hidden site details, credentials, source code, or help break into systems. Please don't share passwords or reset codes here.", null, "alert");
      return;
    }

    addMessage("You", question);
    const normalized = question.toLowerCase();
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized)) {
      deliverAnswer("Hi, friend! I'm glad you're here. Ask me about the tab you're viewing, or tell me what you're trying to do and we'll take it step by step.", null, "happy");
      return;
    }
    if (/\b(thanks|thank you|cheers|that helped)\b/.test(normalized)) {
      deliverAnswer("You're very welcome. What would you like to tackle next?", null, "happy");
      return;
    }
    if (/\b(chat|messages?|questions?).{0,35}\b(private|saved|stored|sent|data)\b|\b(private|saved|stored|sent|data).{0,35}\b(chat|messages?|questions?)\b/.test(normalized)) {
      deliverAnswer("Jerry's chat stays in this page's memory; it does not send questions to a remote service or save the transcript in browser storage. Refreshing or leaving the page clears it. Please don't enter passwords or other secrets.", null, "caring");
      return;
    }
    if (/\b(confused|overwhelmed|stuck|lost|frustrated|don't understand|dont understand)\b/.test(normalized)) {
      deliverAnswer("No rush, pal. Tell me which button or part of the page feels confusing, and I'll break it into one small next step.", null, "caring");
      return;
    }
    if (/\b(tell me more|more about that|what about that|how do i do that|how do i do it|can you explain|can you say more|how so|why|go on|and then what)\b/.test(normalized) && lastConversationAnswer) {
      const related = rankDashboardKnowledge(lastConversationTopic + " " + normalized);
      const detail = related[0] ? related[0].record.text : lastConversationAnswer;
      deliverAnswer("Sure. About " + lastConversationTopic + ": " + detail, null, "curious");
      return;
    }
    if (lastControl && /\b(button|control|field|link|tab|option)\b/.test(normalized) && /\b(this|that|it|mean|do|does|work)\b/.test(normalized)) {
      const controlMatches = rankDashboardKnowledge(lastControl + " " + normalized);
      const detail = controlMatches[0] ? controlMatches[0].record.text : "I can only go by the visible label. Check the nearby help text before submitting or changing anything.";
      deliverAnswer("You were last on “" + lastControl + "”. " + detail, null, "curious");
      return;
    }    if (/(show.*tour|start.*tour|walk.*through everything|full guide|introduce yourself|start from beginning)/.test(normalized)) {
      deliverAnswer("You got it, pal. I'll start at the beginning and show you each section step by step. Keep Next handy, and use Back whenever you want to review something.", {
        label: "Start Jerry's full tour",
        onClick: () => {
          closePanel();
          const start = $("#replayTour");
          if (start) start.click();
        }
      }, "happy");
      return;
    }
    const answer = getAnswer(question);
    lastConversationAnswer = answer.text;
    lastConversationTopic = pages[answer.page]?.label || "this dashboard";
    deliverAnswer(answer.text, { page: answer.page, label: answer.label }, "curious");
  }
  function openPanel() {
    if (isSleeping) wakeJerry(false);
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    launcher.classList.add("is-open");
    resetIdleTimer();
    window.setTimeout(() => questionInput.focus(), 60);
  }

  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.classList.remove("is-open");
    resetIdleTimer();
  }

  launcher.addEventListener("click", () => {
    if (isSleeping) {
      wakeJerry(true);
      startSpeaking();
      return;
    }
    resetIdleTimer();
    if (panel.hidden) openPanel();
    else closePanel();
  });
  $("#jerryClose")?.addEventListener("click", closePanel);
  $("#jerryStartTour")?.addEventListener("click", () => {
    resetIdleTimer();
    closePanel();
    const start = $("#replayTour");
    if (start) start.click();
  });
  askForm.addEventListener("submit", event => {
    event.preventDefault();
    sendQuestion(questionInput.value);
  });

  $$('[data-jerry-question]').forEach(button => {
    button.addEventListener("click", () => sendQuestion(button.dataset.jerryQuestion));
  });

  // Ordinary dashboard use keeps Jerry awake. Once idle for 60 seconds he rests until
  // the mascot itself is clicked; activity elsewhere does not automatically wake him.
  ["pointerdown", "pointermove", "keydown", "touchstart", "scroll", "input"].forEach(type => {
    document.addEventListener(type, event => {
      if (isSleeping) return;
      if (type === "keydown" && ["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(event.key)) return;
      resetIdleTimer();
    }, { passive: true });
  });

  document.addEventListener("jerry:tour-state", event => {
    isTourActive = !!event.detail?.active;
    if (isTourActive) {
      window.clearTimeout(sleepTimer);
      panel.hidden = true;
      launcher.setAttribute("aria-expanded", "false");
      launcher.classList.remove("is-open");
      if (isSleeping) {
        isSleeping = false;
        widget.classList.remove("is-sleeping");
        launcher.setAttribute("aria-label", "Ask Jerry for help");
        if (launcherLabel) launcherLabel.textContent = "Ask Jerry";
      }
    } else if (!isSleeping) {
      resetIdleTimer();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden && $("#tourOverlay")?.hidden !== false) {
      closePanel();
    }
  });

  // Start awake with a 60-second idle window after page load.
  setExpression("happy");
  resetIdleTimer();
})();
