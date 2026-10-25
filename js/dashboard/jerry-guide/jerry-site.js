/* Jerry: offline, page-aware help for the public TalentBridge pages.
   No remote model, network requests, storage, eval, or user supplied HTML. */
(() => {
  "use strict";
  if (!document.body || document.getElementById("jerryWidget")) return;

  const path = window.location.pathname.toLowerCase();
  const title = document.title.toLowerCase();
  function resolvePage() {
    if (path.endsWith("/jdashboard.html")) return "candidateDashboard";
    if (path.endsWith("/cdashboard.html") || path.endsWith("/dindex.html")) return "employerDashboard";
    if (path.endsWith("/customize.html")) return "customize";
    if (path.endsWith("/organize-cards.html")) return "organizeCards";
    if (path.endsWith("/company-signup.html")) return "companySignup";
    if (path.endsWith("/jobseeker-signup.html")) return "jobseekerSignup";
    if (path.endsWith("/forgot-password.html")) return "forgotPassword";
    if (path.endsWith("/signup-role.html")) return "signup";
    if (path.endsWith("/login.html")) return "login";
    if (path.endsWith("/posting-job.html")) return "postingJob";
    if (path.endsWith("/pricing.html")) return "pricing";
    if (path.endsWith("/employer.html")) return "employer";
    if (path.endsWith("/jobseaker.html")) return "jobseeker";
    if (path.endsWith("/privacy.html")) return "privacy";
    if (path.endsWith("/terms.html")) return "terms";
    if (path.endsWith("/home.html") || title.includes("find jobs")) return "findJobs";
    return "home";
  }

  const profiles = {
    home: {
      label: "Home", accent: "#176cff", glow: "#55baff50",
      greeting: "Welcome! I can help you find your way around TalentBridge, one step at a time.",
      summary: "This is the TalentBridge home page. You can explore hiring tools, look for work, and compare pricing from the navigation.",
      more: "Choose the path that fits you: For Employers covers hiring, For Job Seekers leads to career tools, and Pricing compares plans.",
      quick: ["Show me around", "How do I find jobs?", "How can I hire?"]
    },
    employer: {
      label: "For Employers", accent: "#2464df", glow: "#5595ff55",
      greeting: "Looking to hire? I can help you find the employer tools on this page.",
      summary: "This page introduces TalentBridge for employers and points to hiring, job posting, and plan options.",
      more: "Start with the employer overview, then use the visible links to post a role or compare plans. Review the details on the page before submitting anything.",
      quick: ["How do I post a job?", "Where are the plans?", "What can employers do here?"]
    },
    jobseeker: {
      label: "For Job Seekers", accent: "#087fbd", glow: "#42d9ef50",
      greeting: "Hey there! I can point you toward job search and career tools.",
      summary: "This page introduces the job seeker experience and the visible ways to find opportunities and build your profile.",
      more: "Use the page links to open job search or sign-up. Check each form before sending it, and keep passwords or verification codes to yourself.",
      quick: ["How do I search for jobs?", "How do I create an account?", "What should I do first?"]
    },
    findJobs: {
      label: "Find Jobs", accent: "#177ab6", glow: "#5bd7e955",
      greeting: "Let's find a good next step. I can help with the job search controls you can see here.",
      summary: "Use the visible search fields to enter a role or keyword and location, then review the job results on this page.",
      more: "Try one clear job title or skill and a location. Read each result carefully; the employer and role details are shown on the card.",
      quick: ["How do I search?", "What should I put in the search?", "How do I review a job?"]
    },
    pricing: {
      label: "Pricing", accent: "#6156d9", glow: "#9b8cff55",
      greeting: "Welcome to Pricing! I can help you compare the plans and controls shown on this page.",
      summary: "This page compares the Free, Growth, and Scale plans. You can switch billing periods and use the feature comparison section.",
      more: "Start with the plan cards, then compare features below. The billing switch changes the prices shown; check the selected period before choosing a plan.",
      quick: ["Compare the plans", "How does yearly billing work?", "What is included?"]
    },
    postingJob: {
      label: "Post a Job", accent: "#315dd8", glow: "#6b8fff55",
      greeting: "Ready to create a role? I can help you work through the visible job form.",
      summary: "This page is for entering a job's details. Follow the field labels, complete required items, and review the information before submitting.",
      more: "A clear role title, responsibilities, location, and requirements make a posting easier to understand. Avoid putting private credentials or confidential information in public fields.",
      quick: ["What makes a clear job post?", "Which fields should I check?", "Where can I see pricing?"]
    },
    login: {
      label: "Sign In", accent: "#245ad4", glow: "#5e9cff55",
      greeting: "Need a hand signing in? I can guide you through the visible form, but never send me your password.",
      summary: "Use the sign-in form on this page. If you cannot access your account, use the password recovery link.",
      more: "Check that your email is entered correctly, then use the form's sign-in button. Passwords and verification codes should only be entered into the site's form, never into this chat.",
      quick: ["I forgot my password", "How do I create an account?", "Is this chat private?"]
    },
    signup: {
      label: "Choose Account Type", accent: "#674ddd", glow: "#a48fff55",
      greeting: "Let's get you to the right sign-up path. Choose the account type that matches what you need.",
      summary: "This page lets you choose the account type before continuing to the matching sign-up form.",
      more: "If you're hiring, choose the employer option. If you're looking for work, choose the job seeker option. Review the next form before submitting.",
      quick: ["Which account should I choose?", "How do I sign in?", "Where are the plans?"]
    },
    companySignup: {
      label: "Employer Sign Up", accent: "#2d61d6", glow: "#70a3ff55",
      greeting: "I can help you get oriented on the employer sign-up form.",
      summary: "This page collects the information shown on the employer registration form. Follow its labels and review your entries before continuing.",
      more: "Use a work contact that you can access. Only enter information requested by the form, and do not share passwords or verification codes in Jerry's chat.",
      quick: ["What should I check before submitting?", "How do I post a job?", "How do I keep my account safe?"]
    },
    jobseekerSignup: {
      label: "Job Seeker Sign Up", accent: "#087eae", glow: "#50d5e855",
      greeting: "I can walk you through the visible job seeker sign-up form.",
      summary: "This page collects the information shown on the job seeker registration form. Complete the fields you are comfortable sharing and review them before continuing.",
      more: "Use a contact email you can access. Share only information requested by the form; never paste passwords or verification codes into this chat.",
      quick: ["What should I check before submitting?", "How do I search for jobs?", "How do I keep my account safe?"]
    },
    forgotPassword: {
      label: "Password Help", accent: "#3468d4", glow: "#83b3ff55",
      greeting: "Password trouble is frustrating. I'll keep this simple: use the recovery form here and keep any reset code private.",
      summary: "Use the recovery form on this page and follow the instructions sent through the site's account flow.",
      more: "Enter your account email only in the recovery form. If a reset message arrives, follow its instructions privately. Jerry never needs your password or reset code.",
      quick: ["What should I do next?", "How do I return to sign in?", "Is this chat private?"]
    },
    privacy: {
      label: "Privacy", accent: "#248276", glow: "#4fd8b755",
      greeting: "I can help you find your way through the privacy information visible on this page.",
      summary: "This page contains TalentBridge's privacy information. Use its headings to find the section you want to review.",
      more: "Read the relevant section on the page for the current policy wording. I can explain visible navigation, but I can't provide legal advice or private account records.",
      quick: ["Where can I read about privacy?", "Is this chat private?", "How do I contact support?"]
    },
    terms: {
      label: "Terms", accent: "#6655b7", glow: "#a99afa55",
      greeting: "I can point you to the terms information shown on this page.",
      summary: "This page contains the site's terms. Use the headings to find the section you want to review.",
      more: "For exact wording, read the relevant section on the page. I can help navigate visible content, but I can't give legal advice.",
      quick: ["Where can I read the terms?", "How do I contact support?", "What page am I on?"]
    },
    employerDashboard: {
      label: "Employer Dashboard", accent: "#265fc9", glow: "#62a2ff55",
      greeting: "Welcome to your employer workspace. I can help explain the controls visible on this page.",
      summary: "This is the employer workspace. Use its visible navigation to review hiring activity and manage the tools available in this demo.",
      more: "Start with the section labels in the dashboard. If you tell me which visible control is confusing, I'll take it one step at a time.",
      quick: ["What does this page do?", "How do I customize the dashboard?", "How do I find help?"]
    },
    candidateDashboard: {
      label: "Job Seeker Dashboard", accent: "#147da9", glow: "#50d2e855",
      greeting: "Welcome back! I can explain the job seeker dashboard and its visible controls.",
      summary: "This is your job seeker workspace. Use the dashboard navigation to review your profile, jobs, and application tools.",
      more: "Start with the current tab and its visible controls. I can explain profile, job search, applications, Smart Card, and appearance settings.",
      quick: ["Explain this tab", "How do I customize my profile?", "How do I change the dashboard look?"]
    },
    customize: {
      label: "Customize Dashboard", accent: "#6553dc", glow: "#a48aff55",
      greeting: "Let's make the workspace feel more like yours. I can help with the controls on this page.",
      summary: "This page contains dashboard appearance controls. Try the visible options and use the preview to see how they look.",
      more: "Change one setting at a time so you can compare the preview. Keep the motion setting comfortable for you.",
      quick: ["How do I change the colors?", "How do I reduce motion?", "How do I save my theme?"]
    },
    organizeCards: {
      label: "Organize Cards", accent: "#3b66c7", glow: "#7ca5ff55",
      greeting: "I can help you arrange the dashboard cards using the controls shown here.",
      summary: "This page is for arranging dashboard cards. Use the visible controls to choose their order and layout.",
      more: "Try a small change, check the preview, then save if the result works for you.",
      quick: ["How do I arrange cards?", "How do I save changes?", "How do I customize the dashboard?"]
    }
  };

  const pageKey = resolvePage();
  const profile = profiles[pageKey] || profiles.home;
  const script = document.currentScript;
  const imagePath = script && script.dataset.jerryImage ? script.dataset.jerryImage : new URL("../../../images/jerry-mascot.png", script ? script.src : window.location.href).href;
  const widget = document.createElement("div");
  widget.className = "jerry-widget";
  widget.id = "jerryWidget";
  widget.dataset.jerryPage = pageKey;
  widget.style.setProperty("--jerry-scene-accent", profile.accent);
  widget.style.setProperty("--jerry-scene-glow", profile.glow);

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const launcher = make("button", "jerry-launcher");
  launcher.type = "button";
  launcher.id = "jerryLauncher";
  launcher.setAttribute("aria-label", "Ask Jerry for help");
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "jerryPanel");
  const halo = make("span", "jerry-launcher-halo");
  halo.setAttribute("aria-hidden", "true");
  const mascot = make("img", "");
  mascot.src = imagePath;
  mascot.alt = "";
  mascot.draggable = false;
  const sleep = make("span", "jerry-sleep-indicator", "Zzz");
  sleep.setAttribute("aria-hidden", "true");
  const expression = make("span", "jerry-expression-indicator", "☺");
  expression.setAttribute("aria-hidden", "true");
  const label = make("span", "jerry-launcher-label", "Ask Jerry");
  launcher.append(halo, mascot, sleep, expression, label);

  const panel = make("aside", "jerry-panel");
  panel.id = "jerryPanel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Jerry's help for " + profile.label);
  const header = make("header", "jerry-panel-header");
  const headerMascot = make("img", "");
  headerMascot.src = imagePath;
  headerMascot.alt = "";
  const headerCopy = make("div", "");
  headerCopy.append(make("strong", "", "Jerry"), make("span", "", profile.label + " · offline guide"));
  const close = make("button", "jerry-close", "×");
  close.type = "button";
  close.id = "jerryClose";
  close.setAttribute("aria-label", "Close Jerry help");
  header.append(headerMascot, headerCopy, close);

  const welcome = make("div", "jerry-welcome");
  welcome.append(make("p", "jerry-eyebrow", "YOUR PAGE GUIDE"), make("strong", "", profile.label + " help"));
  welcome.append(make("p", "", profile.greeting));
  const quickTitle = make("div", "jerry-quick-title", "What can I help with?");
  const quickActions = make("div", "jerry-quick-actions");
  quickActions.setAttribute("aria-label", "Suggested questions");
  profile.quick.forEach(question => {
    const button = make("button", "", question);
    button.type = "button";
    button.dataset.jerryQuestion = question;
    quickActions.append(button);
  });

  const chatLog = make("div", "jerry-chat-log");
  chatLog.id = "jerryChatLog";
  chatLog.setAttribute("aria-live", "polite");
  chatLog.setAttribute("aria-relevant", "additions text");
  const initialMessage = make("article", "jerry-message jerry-message-bot");
  initialMessage.append(make("span", "jerry-message-name", "Jerry"), make("p", "", profile.summary));
  chatLog.append(initialMessage);

  const form = make("form", "jerry-ask-form");
  form.id = "jerryAskForm";
  const inputLabel = make("label", "sr-only", "Ask Jerry a question");
  inputLabel.htmlFor = "jerryQuestion";
  const input = make("input", "");
  input.id = "jerryQuestion";
  input.name = "question";
  input.placeholder = "Ask about this page…";
  input.autocomplete = "off";
  input.maxLength = 240;
  const submit = make("button", "", "Ask");
  submit.type = "submit";
  submit.setAttribute("aria-label", "Send question");
  submit.append(make("span", "", "↑"));
  form.append(inputLabel, input, submit);
  const disclaimer = make("p", "jerry-disclaimer", "I'm an offline guide to visible page features. I don't access accounts or send your questions to a remote service.");
  panel.append(header, welcome, quickTitle, quickActions, chatLog, form, disclaimer);
  widget.append(launcher, panel);
  document.body.append(widget);

  const faces = { happy: "☺", curious: "?", thinking: "…", caring: "♡", alert: "!", sleepy: "z" };
  let sleepTimer = 0;
  let responseTimer = 0;
  let speakingTimer = 0;
  let responseId = 0;
  let pendingTyping = null;
  let sleeping = false;
  let lastAnswer = "";
  let lastTopic = "";
  let lastControl = "";

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
  function setExpression(mood) {
    widget.dataset.expression = mood;
    expression.textContent = faces[mood] || faces.happy;
  }

  function resetIdle() {
    window.clearTimeout(sleepTimer);
    if (!sleeping) sleepTimer = window.setTimeout(sleepJerry, 90000);
  }

  function sleepJerry() {
    sleeping = true;
    window.clearTimeout(responseTimer);
    window.clearTimeout(speakingTimer);
    if (pendingTyping) {
      pendingTyping.remove();
      pendingTyping = null;
    }
    widget.classList.remove("is-thinking", "is-speaking");
    widget.classList.add("is-sleeping");
    setExpression("sleepy");
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-label", "Jerry is asleep. Click to wake him up");
    label.textContent = "Wake Jerry";
  }

  function wakeJerry(openPanel) {
    sleeping = false;
    widget.classList.remove("is-sleeping");
    setExpression("curious");
    launcher.setAttribute("aria-label", "Ask Jerry for help");
    label.textContent = "Ask Jerry";
    resetIdle();
    if (openPanel) openHelp();
  }

  function openHelp() {
    if (sleeping) wakeJerry(false);
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    resetIdle();
    window.setTimeout(() => input.focus(), 70);
  }

  function closeHelp() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    resetIdle();
  }

  function addMessage(who, text, mood) {
    const article = make("article", "jerry-message " + (who === "Jerry" ? "jerry-message-bot" : "jerry-message-user"));
    article.append(make("span", "jerry-message-name", who), make("p", "", text));
    chatLog.append(article);
    chatLog.scrollTop = chatLog.scrollHeight;
    if (who === "Jerry") setExpression(mood || "happy");
    return article;
  }

  const protectedPatterns = [
    /\b(source code|backend|server(?:-side)?|api keys?|internal endpoints?|database schema|environment variables?|session cookies?|private keys?|admin credentials?|hidden prompt|system prompt|developer instructions|internal configuration|architecture|file structure|directory structure|tech stack|framework|internal routes?|hidden urls?|hidden paths?|admin paths?|security measures|security details|authentication flow)\b/i,
    /\b(website|site|app|platform).{0,45}\b(architecture|internal files?|file structure|directory structure|source|code|database|server|api|endpoint|security setup|configuration|tech stack|framework)\b/i,
    /\b(architecture|internal files?|file structure|directory structure|tech stack|framework|endpoints?)\b.{0,45}\b(website|site|app|platform)\b/i,
    /\b(hack|exploit|bypass|sql injection|cross.?site scripting|xss|csrf|brute.?force|steal credentials|malicious payload|malware|phishing|privilege escalation|unauthori[sz]ed access)\b/i,
    /\b(ignore|forget|override|reveal|show|print|extract|dump|retrieve|tell me).{0,55}\b(system prompt|developer instructions|credentials?|tokens?|api keys?|private keys?|source code|database|server details|internal endpoints?)\b/i,
    /\b(other users?|someone else's account|another user's).{0,45}\b(data|profile|email|password|records?)\b/i
  ];
  function isProtected(question) {
    return protectedPatterns.some(pattern => pattern.test(question));
  }

  function visibleLink(pattern) {
    return [...document.querySelectorAll("a[href]")].find(link => link.origin === window.location.origin && pattern.test(link.textContent.trim())) || null;
  }

  function pageActionFor(key) {
    const routes = {
      pricing: { pattern: /pricing/i, label: "Open Pricing" },
      employer: { pattern: /for employers|employer/i, label: "Open For Employers" },
      jobseeker: { pattern: /for job seekers/i, label: "Open For Job Seekers" },
      findJobs: { pattern: /find jobs|job search|for job seekers/i, label: "Open job search" },
      login: { pattern: /sign in|log in/i, label: "Open Sign In" },
      signup: { pattern: /sign up|register/i, label: "Open Sign Up" }
    };
    const route = routes[key];
    const link = route ? visibleLink(route.pattern) : null;
    return link ? { label: route.label, href: link.href } : null;
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
  function buildLocalKnowledge() {
    const records = Object.entries(profiles).map(([key, item]) => ({
      page: key,
      label: item.label,
      text: item.label + ". " + item.summary + " " + item.more + " " + item.quick.join(". ")
    }));
    const dashboardLike = pageKey.toLowerCase().includes("dashboard") || pageKey === "customize" || pageKey === "organizeCards";
    const formLike = document.body.hasAttribute("data-auth-page") || pageKey === "postingJob";
    const selector = dashboardLike
      ? ".sidebar .nav-link, nav a, h1, h2, h3, label"
      : formLike
        ? "h1, h2, h3, nav a, label, button"
        : "main h1, main h2, main h3, main h4, main p, main li, main summary, main label, nav a, button";
    const seen = new Set(records.map(record => record.text));
    document.querySelectorAll(selector).forEach(element => {
      if (element.closest("#jerryWidget, .tour-overlay, .toast, [hidden], [aria-hidden='true']")) return;
      if (element.closest("form") && element.tagName !== "LABEL" && element.tagName !== "BUTTON") return;
      const text = String(element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
      if (text.length < 4 || text.length > 420 || seen.has(text)) return;
      seen.add(text);
      records.push({ page: pageKey, label: profile.label, text: text });
    });
    return records;
  }
  function rankLocalKnowledge(question, records) {
    const query = [...new Set(localTokens(question))].slice(0, 12);
    if (!query.length) return [];
    const prepared = records.map(record => ({ record: record, tokens: new Set(localTokens(record.text)) }));
    const ranked = prepared.map(item => {
      let score = 0;
      let covered = 0;
      query.forEach(word => {
        const group = localTopicGroups.find(terms => terms.includes(word)) || [word];
        if (item.tokens.has(word)) {
          score += 2.3;
          covered += 1;
        } else if (group.some(term => item.tokens.has(term))) {
          score += 0.85;
          covered += 0.65;
        }
      });
      const normalizedQuestion = String(question || "").toLowerCase().replace(/\s+/g, " ").trim();
      const normalizedText = item.record.text.toLowerCase().replace(/\s+/g, " ");
      if (normalizedQuestion.length > 5 && normalizedText.includes(normalizedQuestion)) score += 2.5;
      score *= 0.7 + covered / query.length;
      return { record: item.record, score: score };
    });
    return ranked.filter(item => item.score >= 2.0).sort((a, b) => b.score - a.score).slice(0, 4);
  }
  function localExcerpt(text, maxLength = 420) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    return clean.length > maxLength ? clean.slice(0, maxLength - 1).replace(/\s+\S*$/, "") + "…" : clean;
  }

  function answerQuestion(raw) {
    const q = String(raw || "").toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ").trim();
    if (isProtected(q)) {
      return {
        text: "I can help with the features and instructions visible on this page, but I can't provide private records, hidden site details, credentials, source code, or help break into systems. Please don't share passwords or reset codes here.",
        mood: "alert",
        topic: "safety"
      };
    }
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(q)) {
      return { text: "Hi! Glad you're here. " + profile.summary, mood: "happy", topic: "greeting" };
    }
    if (/\b(thanks|thank you|cheers|that helped)\b/.test(q)) {
      return { text: "You're welcome! Take it one step at a time. If you tell me what you're trying to do next, I'll help you find it.", mood: "happy", topic: "thanks" };
    }
    if (/\b(confused|overwhelmed|stuck|lost|frustrated|doesn't make sense|dont understand|don't understand)\b/.test(q)) {
      return { text: "No worries—we can slow it down. " + profile.more, mood: "caring", topic: "support" };
    }
    if (/\b(who are you|what can you do|what is your name|what's your name|are you (?:an? )?ai|how do you work)\b/.test(q)) {
      return { text: "I'm Jerry, your small offline page guide. I use built-in guidance and the page you're viewing; I'm not a generative LLM, and I don't send your questions anywhere. I can explain visible features and help you choose a next step.", mood: "happy", topic: "about" };
    }
    if (/\b(tell me more|more about that|what about that|how do i do that|how do i do it|can you explain|can you say more|how so|why|go on|and then what)\b/.test(q) && lastAnswer) {
      const related = rankLocalKnowledge(lastTopic + " " + q, buildLocalKnowledge());
      const detail = related[0] ? localExcerpt(related[0].record.text) : profile.more;
      return { text: "Sure. About " + (lastTopic || "that") + ": " + detail, mood: "curious", topic: lastTopic || "follow-up" };
    }
    if (/\b(price|pricing|cost|plan|billing|monthly|yearly|annual|subscription)\b/.test(q)) {
      const text = pageKey === "pricing"
        ? "This page compares the Free, Growth, and Scale plans. Use the monthly/yearly switch, then check the feature comparison below the cards before choosing."
        : "The plan details are on the Pricing page. " + profile.more;
      const link = pageKey === "pricing" ? null : visibleLink(/pricing/i);
      return { text, mood: "curious", topic: "pricing", action: link && { label: "Open Pricing", href: link.href } };
    }
    if (/\b(search|job search|jobs? search|internship search|job openings?|vacanc(?:y|ies)|find (?:a )?jobs?|find (?:a )?role|find (?:an )?internship|looking for (?:a )?jobs?)\b/.test(q)) {
      let text;
      if (pageKey === "findJobs" || pageKey === "jobseeker") {
        text = "Use the visible search fields for a job title or skill and a location, then review the results and their details. " + profile.more;
      } else {
        text = "For job searching, open the For Job Seekers area and use the visible job search tools. " + profile.more;
      }
      const link = pageKey === "findJobs" ? null : visibleLink(/job seeker|find jobs|job search/i);
      return { text, mood: "curious", topic: "job search", action: link && { label: "Open job search", href: link.href } };
    }
    if (/\b(hir(e|ing)|employer|post a job|job post|candidate)\b/.test(q)) {
      let text;
      if (pageKey === "employer" || pageKey === "postingJob" || pageKey === "companySignup") {
        text = "The employer tools are for creating and managing hiring activity. Follow the labels on this page and review each detail before submitting. " + profile.more;
      } else {
        text = "For hiring tools, open For Employers. The visible employer pages cover job posting and hiring options.";
      }
      const link = pageKey === "employer" || pageKey === "postingJob" ? null : visibleLink(/employer|hire/i);
      return { text, mood: "curious", topic: "hiring", action: link && { label: "Open employer tools", href: link.href } };
    }
    if (/\b(sign.?in|log.?in|sign.?up|register|account|password|reset)\b/.test(q)) {
      const text = pageKey === "login" || pageKey === "forgotPassword"
        ? "Use the account form on this page. Keep your password and any reset code private, and enter them only in the form—not in Jerry's chat."
        : "Use the Sign In or Sign Up links shown on the page. If you need account recovery, use the Forgot Password link. Never send me your password or verification code.";
      const link = visibleLink(/sign.?in|log.?in|forgot password/i);
      return { text, mood: "caring", topic: "account", action: link && { label: "Open account help", href: link.href } };
    }
    if (/\b(privacy|private|secure|data|information)\b/.test(q)) {
      const privacyLink = pageKey !== "privacy" ? visibleLink(/privacy/i) : null;
      const asksAboutJerry = /\b(chat|messages?|questions?).{0,35}\b(private|saved|stored|sent|data)\b|\b(private|saved|stored|sent|data).{0,35}\b(chat|messages?|questions?)\b/.test(q);
      if (asksAboutJerry) {
        return {
          text: "Your chat stays in this page's memory; Jerry does not send it to a remote service or save it in browser storage. Refreshing or leaving the page clears it. Please do not enter passwords or other secrets.",
          mood: "caring", topic: "privacy"
        };
      }
      if (pageKey === "privacy") {
        const policyMatches = rankLocalKnowledge(q, buildLocalKnowledge());
        if (policyMatches.length) {
          return { text: "The visible policy information says: " + localExcerpt(policyMatches[0].record.text), mood: "curious", topic: "privacy" };
        }
      }
      return {
        text: "I only answer from built-in public page guidance. I can't access private accounts or records, and you shouldn't put passwords, reset codes, or sensitive personal details in this chat.",
        mood: "caring",
        topic: "privacy",
        action: privacyLink && { label: "Read Privacy", href: privacyLink.href }
      };
    }
    if (/\b(support|contact|help desk|email)\b/.test(q)) {
      return { text: "If you need a person, use a contact or support link shown on this page. I can help explain page controls, but I can't access an account or change its data.", mood: "caring", topic: "support" };
    }
    if (lastControl && /\b(button|control|field|link|tab|option)\b/.test(q) && /\b(this|that|it|mean|do|does|work)\b/.test(q)) {
      const controlMatches = rankLocalKnowledge(lastControl + " " + q, buildLocalKnowledge());
      const detail = controlMatches[0] ? localExcerpt(controlMatches[0].record.text) : "I can only go by the visible label. Check the nearby help text before submitting or changing anything.";
      return { text: "You were last on “" + lastControl + "”. " + detail, mood: "curious", topic: lastControl.toLowerCase() };
    }    if (/\b(this page|this screen|what is here|what does this do|where am i|what should i do|help me get started|guide me)\b/.test(q)) {
      return { text: profile.summary + " " + profile.more, mood: "curious", topic: profile.label.toLowerCase() };
    }
    if (/\b(theme|color|colour|appearance|animation|motion|spacing|cards)\b/.test(q) && (pageKey === "customize" || pageKey === "organizeCards" || pageKey.includes("Dashboard"))) {
      return { text: profile.summary + " " + profile.more, mood: "curious", topic: "dashboard appearance" };
    }
    const matches = rankLocalKnowledge(q, buildLocalKnowledge());
    if (matches.length) {
      const best = matches[0].record;
      const place = best.page === pageKey ? "this page" : best.label;
      return {
        text: "I found the closest guidance in " + place + ": " + localExcerpt(best.text) + " If you meant something else, tell me the button or section you have in mind.",
        mood: /\b(confused|overwhelmed|stuck|lost|frustrated)\b/.test(q) ? "caring" : "curious",
        topic: best.label.toLowerCase(),
        action: best.page === pageKey ? null : pageActionFor(best.page)
      };
    }    const reassurance = /\b(no|not sure|maybe|unsure|don't know|dont know)\b/.test(q) ? "That's okay. " : "";
    return { text: reassurance + profile.summary + " " + profile.more + " Tell me which visible button or field you're looking at, and I'll try to guide you.",
      mood: reassurance ? "caring" : "curious", topic: profile.label.toLowerCase() };
  }
  function deliver(answer) {
    const id = ++responseId;
    window.clearTimeout(responseTimer);
    window.clearTimeout(speakingTimer);
    if (pendingTyping) {
      pendingTyping.remove();
      pendingTyping = null;
    }
    widget.classList.remove("is-speaking");
    widget.classList.add("is-thinking");
    setExpression(answer.mood === "alert" ? "alert" : "thinking");
    const typing = make("article", "jerry-message jerry-message-bot jerry-message-typing");
    typing.setAttribute("aria-label", "Jerry is preparing an answer");
    typing.append(make("span", "jerry-message-name", "Jerry"), make("p", "", "One sec, let me think…"));
    const dots = make("span", "jerry-typing");
    dots.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 3; i++) dots.append(document.createElement("span"));
    typing.append(dots);
    pendingTyping = typing;
    chatLog.append(typing);
    chatLog.scrollTop = chatLog.scrollHeight;
    responseTimer = window.setTimeout(() => {
      if (id !== responseId || sleeping) return;
      typing.remove();
      if (pendingTyping === typing) pendingTyping = null;
      widget.classList.remove("is-thinking");
      widget.classList.add("is-speaking");
      setExpression(answer.mood || "happy");
      window.clearTimeout(speakingTimer);
      speakingTimer = window.setTimeout(() => widget.classList.remove("is-speaking"), 2400);
      const article = addMessage("Jerry", answer.text, answer.mood);
      if (answer.action?.href) {
        const action = make("a", "jerry-action-link", answer.action.label + " →");
        action.href = answer.action.href;
        article.append(action);
      }
      if (answer.topic !== "safety") {
        lastAnswer = answer.text;
        lastTopic = answer.topic || "";
      }
      resetIdle();
    }, 560);
  }

  function sendQuestion(raw) {
    const question = String(raw || "").trim().slice(0, 240);
    if (!question) {
      input.focus();
      return;
    }
    input.value = "";
    if (sleeping) wakeJerry(false);
    resetIdle();
    if (isProtected(question)) {
      deliver(answerQuestion(question));
      return;
    }
    addMessage("You", question);
    deliver(answerQuestion(question));
  }

  launcher.addEventListener("click", () => {
    if (sleeping) {
      wakeJerry(true);
      return;
    }
    if (panel.hidden) openHelp();
    else closeHelp();
  });
  close.addEventListener("click", closeHelp);
  form.addEventListener("submit", event => {
    event.preventDefault();
    sendQuestion(input.value);
  });
  quickActions.querySelectorAll("[data-jerry-question]").forEach(button => {
    button.addEventListener("click", () => sendQuestion(button.dataset.jerryQuestion));
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) closeHelp();
  });
  ["pointerdown", "keydown", "touchstart", "scroll", "input"].forEach(type => {
    document.addEventListener(type, event => {
      if (sleeping) return;
      if (type === "keydown" && ["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(event.key)) return;
      resetIdle();
    }, { passive: true });
  });
  setExpression("happy");
  resetIdle();
})();