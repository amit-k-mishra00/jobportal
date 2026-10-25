/* TalentBridge AI job seeker dashboard. Demo data persists in this browser only. */
(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const KEY = "tb-jdashboard-simple-v1";
  const defaults = {
    profile:{firstName:"",lastName:"",headline:"",email:"",phone:"",pronouns:"",location:"",bio:"",skills:"",education:"",experience:"",projects:"",certifications:"",achievements:"",publications:"",volunteer:"",portfolio:"",linkedin:"",github:"",resumeUrl:"",desiredRole:"",currentRole:"",industry:"",careerLevel:"",employmentStatus:"",workPreference:"",jobTypes:"",availability:"",noticePeriod:"",preferredLocation:"",willingToRelocate:"",workAuthorization:"",yearsExperience:"",languages:"",interests:"",extraLink:""},
    customFields:[],
    worlds:{publicDisplayName:"",publicTitle:"",publicBio:"",publicSkills:"",publicPortfolio:"",publicLocation:"",publicLinkedin:"",publicGithub:"",showEmail:false,showLocation:true,showSkills:true,showPortfolio:true,showEducation:true,showExperience:true,showProjects:true,showCertifications:true,showAchievements:true,showLanguages:true,showDesiredRole:false,showInterests:false,showLinkedin:false,showGithub:false,showResume:false,showCustomFields:true,showPronouns:false,showPhone:false,showCurrentRole:false,showIndustry:false,showCareerLevel:false,showEmploymentStatus:false,showWorkPreference:false,showJobTypes:false,showAvailability:false,showNoticePeriod:false,showPreferredLocation:false,showYearsExperience:true,showPublications:false,showVolunteer:false,privateNotes:"",privateTargetRole:"",privateSalary:"",privateGoals:"",privateInterview:"",privatePreferences:""},
    card:{theme:"ocean",availability:true,useCustomTheme:false,customColors:false,colorA:"#0b2443",colorB:"#12517a",colorGlow:"#47c8f1",name:"",headline:"",bio:"",skills:"",brand:"TalentBridge AI",brandMark:"✳",kicker:"HELLO, I'M",location:"",footer:"YOUR NEXT MOVE",showBrand:true,showName:true,showHeadline:true,showBio:true,showKicker:true,showSkills:true,showLocation:true,showFooter:true,alignment:"left",shape:"rounded",textScale:100},
    saved:["j2"], applications:[{id:"j1",status:"Applied",date:"Today"}],
    preferences:{accent:"ocean",motion:"full",spacing:"compact",tour:true,customTheme:{enabled:false,name:"My custom theme",accent:"#2678f3",background:"#f5f7fb",panel:"#ffffff",text:"#1b2b42",sidebar:"#081a33",accent2:"#55d4f4",font:"DM Sans",radius:16}}
  };
  const jobs = [
    {id:"j1",title:"Frontend Developer",company:"Google",mark:"G",location:"Remote",type:"Full-time",salary:"₹8–14 LPA",tags:["JavaScript","React","CSS"]},
    {id:"j2",title:"UI/UX Designer",company:"Northstar Studio",mark:"N",location:"Hybrid · Bhopal",type:"Full-time",salary:"₹6–10 LPA",tags:["Figma","UI/UX","Design"]},
    {id:"j3",title:"Software Engineer Intern",company:"Orbit Systems",mark:"O",location:"Remote",type:"Internship",salary:"₹20–35k / month",tags:["Python","APIs","Git"]},
    {id:"j4",title:"Junior Web Developer",company:"Nova Digital",mark:"N",location:"Remote",type:"Full-time",salary:"₹4–7 LPA",tags:["HTML","CSS","JavaScript"]},
    {id:"j5",title:"Product Designer",company:"Pixel & Co.",mark:"P",location:"On-site · Indore",type:"Full-time",salary:"₹7–11 LPA",tags:["Product","Research","Figma"]}
  ];
  const tour = [
    {symbol:"✦",title:"Before we begin, I'm Jerry!",text:"Hey there! I'm Jerry, your TalentBridge AI guide. Think of me as that old friend who knows the place—and a patient teacher when a new button looks confusing. I'll show you each tab and the options inside it. We can take it slowly, and you can ask me questions any time.",tip:"You are in charge. Use Next to learn at your own pace, Back to revisit something, or Esc to close the tour. I'll still be here in the corner.",page:"home",label:"Meet Jerry",voice:"Hi! I'm Jerry. Let's learn this together—no rush, and no silly questions."},
    {symbol:"⌂",title:"Your home base: Overview",text:"This is the dashboard's front porch. The summary cards show how many sample applications and saved jobs you have, plus your profile progress. Below that you'll find jobs to explore and a quick look at your Smart Card.",tip:"When you feel a little lost, come back to Overview for the big picture.",page:"home",label:"Overview",target:".stats",voice:"First, the lay of the land. This is where we start our little journey."},
    {symbol:"⌕",title:"Find jobs: Search",text:"Open Find jobs and enter a job title, company, skill, or location. The location field helps narrow things down—for example, Remote or a city. Press Search when you're ready.",tip:"Try one clear term first, such as 'JavaScript', then refine your search.",page:"jobs",label:"Find jobs · Search",target:"#jobQuery",voice:"Let's look for work that fits you, instead of making you dig through everything."},
    {symbol:"☷",title:"Find jobs: Filters and sorting",text:"The filter chips narrow the list to All jobs, Remote, Full-time, or Internship. The sort menu can arrange roles by company name. Each job card shows the employer, location, type, salary and useful skills.",tip:"Filters work together with your search. Clear the search text if you suddenly see no results.",page:"jobs",label:"Find jobs · Filters",target:"#jobFilters",voice:"These little controls are your shortcuts. A good filter can save you a lot of scrolling."},
    {symbol:"♡",title:"Save a job or track an application",text:"Tap the heart to save a role for later. Tap Apply to add a sample application to your tracker. If you've already added that role, the button takes you to Applications instead.",tip:"This is a front-end demo: Apply does not send a real application to a company.",page:"jobs",label:"Find jobs · Job cards",target:"#jobsList",voice:"Found something interesting? Save it first, or add it to your demo tracker."},
    {symbol:"▤",title:"Applications: Keep your search organized",text:"The Applications tab lists roles you've tracked. Use the status filter to show All, Applied, In review, or Interview. The Next status action cycles a sample application through its stages.",tip:"Think of this as your own checklist. In this demo, status changes stay in this browser.",page:"applications",label:"Applications",target:"#applicationFilter",voice:"Now we keep the paperwork tidy, like a good teacher's class register."},
    {symbol:"◎",title:"Profile: Start with the basics",text:"Your profile is the source for your introduction and Smart Card. Add your first and last name, a professional headline, email, and location. You don't need a profile picture here—your words and skills do the work.",tip:"You can save with the button at the bottom of the form. Name fields are required; the rest can be filled in over time.",page:"profile",label:"Profile · Personal details",target:"#firstName",voice:"Let's start with the basics. Little by little makes a strong profile."},
    {symbol:"✎",title:"Profile: Tell your story",text:"Use About you to explain what interests you and what you want to build next. Education captures courses or certifications; Experience or projects can include internships, volunteering and personal projects. These fields help people understand your strengths.",tip:"A short, specific paragraph is more useful than a long paragraph full of general claims.",page:"profile",label:"Profile · About and experience",target:"#bio",voice:"Here's where your personality and your work start to show. Keep it honest and specific."},
    {symbol:"✧",title:"Profile: Skills and extra details",text:"Skills accepts comma-separated items. You can also add your portfolio, LinkedIn and GitHub links, career status, job preferences, availability, education, projects, certificates, achievements, publications, volunteering, languages, and interests.",tip:"Most fields are optional. Add the details that help tell your story, then press Save profile.",page:"profile",label:"Profile · Skills and options",target:"#skills",voice:"All these fields are optional tools. Fill in the ones that help tell your story."},
    {symbol:"＋",title:"Profile: Add your own fields",text:"Scroll to Your own profile fields. If I haven't included a field you need, give it a label and value, then choose Public or Private. New fields start private, and you can edit or remove them whenever you like.",tip:"A custom field appears on the public preview only when you mark it Public and allow custom fields in Public / Private visibility controls.",page:"profile",label:"Profile · Your own fields",target:".custom-fields-editor",voice:"I can't predict every little detail you might need, pal, so here's a space to make your own."},
    {symbol:"◉",title:"Public profile: Your professional introduction",text:"In Public / Private, Public profile is the version you prepare for other people. You can add a display name, professional title, short intro, public skills, portfolio URL, and public location. A preview on the right shows what the public-facing version looks like.",tip:"The public preview is only a preview in this front-end demo; there is no hosted public profile link yet.",page:"profile-worlds",world:"public",label:"Public / Private · Public profile",target:".world-switch",voice:"Think of this as your shop window: only put things here that you're happy to share."},
    {symbol:"☑",title:"Choose what is visible",text:"The first switches cover email, location, skills, and portfolio. Open More options to decide whether education, experience, projects, certifications, achievements, languages, career preferences, contact methods, and links appear in your public preview. Custom fields have a second check: each one must be marked Public.",tip:"Email and phone start hidden. Keep them private unless you deliberately want them included in a public profile.",page:"profile-worlds",world:"public",label:"Public / Private · Visibility",target:".visibility-list",voice:"You're the one who decides what goes on display. Let's keep your boundaries clear."},
    {symbol:"⌑",title:"Private workspace: Your own planning room",text:"Use the Private workspace tab for personal notes, target role, salary expectations, career goals, interview practice, and job-search preferences. These fields are not included in the public profile preview.",tip:"Important: this demo stores information in local browser storage, not a secure private account. Do not put secrets or sensitive personal information here.",page:"profile-worlds",world:"private",label:"Public / Private · Private workspace",target:"#privateWorldEditor",voice:"This side is for your own plans and reminders. Just remember, this demo isn't a secure vault."},
    {symbol:"▣",title:"Smart Card: Pick a style",text:"Your Smart Card is a compact digital introduction. Choose from Ocean, Violet, Green, Sunset or Monochrome. The big preview changes right away so you can compare looks.",tip:"The Smart Card color theme is separate from your overall dashboard accent color. You can style the card one way and the dashboard another.",page:"smartcard",label:"Smart Card · Color theme",target:"#smartCard",voice:"Now for something fun: let's make a little digital calling card that feels like you."},
    {symbol:"T",title:"Smart Card: Edit the content",text:"Change the card's display name, headline, short introduction and highlighted skills. The availability switch shows or hides the 'Open to opportunities' label. The card preview updates as you type.",tip:"Use Share to share when your browser supports it, or Print / PDF to save a copy. This demo doesn't generate a real QR code or hosted profile URL.",page:"smartcard",label:"Smart Card · Content and availability",target:"#cardNameInput",voice:"The card is yours to shape. Keep it easy to scan and easy to remember."},
    {symbol:"↗",title:"Smart Card: Save and share",text:"Save design keeps the current card settings in this browser. Share tries your browser's sharing feature, or copies the card text if clipboard access is available. Print / PDF opens the browser print dialog.",tip:"Check your name and headline before sharing or printing, and use your browser's 'Save as PDF' choice if available.",page:"smartcard",label:"Smart Card · Sharing tools",target:".share-actions",voice:"One last check, then it's ready to share or print when you need it."},
    {symbol:"✳",title:"Customization: Dashboard color",text:"Customize dashboard has quick preset accent colors for a fast change. Those affect buttons and highlights across the interface. If you want much more control, the Build your own theme section has individual color pickers, fonts and corner roundness.",tip:"Dashboard colors and Smart Card colors can be different—or you can apply your custom palette to the Smart Card too.",page:"customize",label:"Customization · Accent color",target:"#page-customize [data-accent]",voice:"Let's make the place feel like yours. Start with the color you like seeing most."},
    {symbol:"◈",title:"Customization: Build your own theme",text:"This is where you can create a theme from scratch. Choose the accent, page background, panel, text, sidebar, secondary accent, font family, and corner roundness. The little preview changes as you work; Save my theme activates your choices. You can also export or import a theme JSON file to keep or reuse your design.",tip:"If you're just experimenting, no worries: Reset theme returns to the starter palette. The settings are saved in this browser for the demo.",page:"customize",label:"Customization · Theme builder",target:"#customThemeBuilder",voice:"Now we're getting to the fun part. Pick colors you love, and let's make this workspace yours."},
    {symbol:"≈",title:"Customization: Animation level",text:"Full keeps the interface lively. Reduced limits motion while keeping most of the feedback subtle. Off disables the dashboard's animations and transitions. The browser's own reduced-motion preference is also respected.",tip:"Pick Reduced or Off if motion feels distracting or uncomfortable.",page:"customize",label:"Customization · Animation",target:"#motionChoices",voice:"Not everybody likes movement. Choose what feels comfortable for you."},
    {symbol:"▦",title:"Customization: Layout spacing",text:"Comfortable adds breathing room around panels. Compact keeps more information visible in less space. Choose the one that helps you focus.",tip:"You can revisit these choices any time. Your settings are saved in this browser for the demo.",page:"customize",label:"Customization · Spacing",target:"#spacingChoices",voice:"A little more room or a tighter layout—there's no wrong answer, just what suits you."},
    {symbol:"⚙",title:"Settings: Back up your information",text:"Export JSON downloads a backup of your profile and preferences. Choose JSON file imports a backup made by this dashboard. These files may contain personal details, so keep them somewhere private.",tip:"If you import a backup, it replaces the current demo state. Export first if you want to keep a copy of both.",page:"settings",label:"Settings · Import and export",target:"#exportData",voice:"A small backup now can save you some sighs later. Your future self will thank you."},
    {symbol:"↻",title:"Settings: Choose your starting point",text:"Auto-open guided tour on page load controls whether the walkthrough starts automatically. Reset demo clears the saved demo data and returns the dashboard to its starter state after confirmation.",tip:"Turn off auto-open if you prefer to begin on Overview. You can still open Jerry and replay the guide whenever you want.",page:"settings",label:"Settings · Tour and reset",target:"#tourOnLoad",voice:"You can keep the tour on, or turn it off and call me when you need me."},
    {symbol:"♥",title:"That's the tour, friend!",text:"And that's the tour! You now know the main tabs and the options tucked inside them. Take your time, experiment with the settings, and come find me whenever something feels unclear.",tip:"Open the floating Ask Jerry button in the lower-right corner for quick answers about the tab you're viewing.",page:"home",label:"You're ready",voice:"You've got this. I'll be right here in the corner if you need a hand."}
  ];
  let state = load(), filter = "All", query = "", locationQuery = "", tourIndex = 0, toastTimer, tourInvoker = null;
  let activeTourTarget = null, tourSpotlightRaf = 0;

  function clone(x){return JSON.parse(JSON.stringify(x))}
  function load(){
    try{const x=JSON.parse(localStorage.getItem(KEY)||"null");return x?{...clone(defaults),...x,profile:{...defaults.profile,...x.profile},customFields:Array.isArray(x.customFields)?x.customFields:[],worlds:{...defaults.worlds,...x.worlds},card:{...defaults.card,...x.card},preferences:{...defaults.preferences,...x.preferences,customTheme:{...defaults.preferences.customTheme,...(x.preferences?.customTheme||{})}}}:clone(defaults)}
    catch{return clone(defaults)}
  }
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
  function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}
  function go(page, options={}){const el=$("#page-"+page);if(!el)return;$$(".page").forEach(p=>p.classList.toggle("active",p===el));$$(".nav-link[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("#pageLabel").textContent=({home:"Overview",jobs:"Find jobs",applications:"Applications",profile:"Build my profile","profile-worlds":"Public / Private",smartcard:"My Smart Card",customize:"Customize dashboard",settings:"Settings"})[page]||page;$("#sidebar").classList.remove("open");window.scrollTo({top:0,behavior:options.immediate||state.preferences.motion==="off"?"auto":"smooth"});if(page==="jobs")renderJobs();if(page==="applications")renderApplications();if(page==="smartcard")renderCard()}
  function completion(){const p=state.profile;const checks=[
    ["Name added",!!(p.firstName&&p.lastName)],["Professional headline",!!p.headline],["About you",!!p.bio],["Skills listed",!!p.skills],
    ["Education",!!p.education],["Experience / projects",!!(p.experience||p.projects)],["Contact or portfolio link",!!(p.email||p.portfolio||p.linkedin||p.github)],
    ["Career preferences",!!(p.desiredRole||p.workPreference||p.jobTypes)],["Languages",!!p.languages],["Achievements / credentials",!!(p.achievements||p.certifications)]
  ];const completed=checks.filter(x=>x[1]).length;return {checks:checks.map(([label,done])=>({label,done})),percent:Math.round(completed/checks.length*100)}}
  function renderProgress(){const c=completion();$("#progressNumber").textContent=c.percent+"%";$("#progressBar").style.width=c.percent+"%";$("#statProgress").textContent=c.percent+"%";$("#profileChecks").innerHTML=c.checks.map(x=>`<div class="check ${x.done?"done":""}"><i>${x.done?"✓":""}</i>${x.label}</div>`).join("");$("#statApplications").textContent=state.applications.length;$("#statSaved").textContent=state.saved.length}
  function renderCard(options={}){
    const p=state.profile,c=state.card;
    const fullName=`${p.firstName} ${p.lastName}`.trim();
    const name=c.name||fullName||"Your Name";
    const headline=c.headline||p.headline||"Your professional headline";
    const bio=c.bio||p.bio||"A short introduction about what you do, what you care about, and what you want to build next.";
    const skillsText=c.skills||p.skills||"";
    const skills=skillsText.split(",").map(s=>s.trim()).filter(Boolean).slice(0,6);
    const locationText=c.location||p.location||"";
    const themes={ocean:["#0b2443","#12517a","#47c8f1"],violet:["#211744","#56358b","#b59bff"],green:["#073b39","#116b60","#62dfb4"],sunset:["#632c3e","#9c4c4e","#ffbc72"],mono:["#080d18","#29374c","#b7c8dc"]};
    const custom=state.preferences.customTheme||defaults.preferences.customTheme;
    const preset=themes[c.theme]||themes.ocean;
    const colors=c.useCustomTheme?[safeHex(custom.sidebar,"#081a33"),safeHex(custom.accent,"#2678f3"),safeHex(custom.accent2,"#55d4f4")]:c.customColors?[safeHex(c.colorA,preset[0]),safeHex(c.colorB,preset[1]),safeHex(c.colorGlow,preset[2])]:preset;
    const card=$("#smartCard");
    card.style.setProperty("--card-a",colors[0]);card.style.setProperty("--card-b",colors[1]);card.style.setProperty("--card-glow",colors[2]);
    card.style.setProperty("--card-radius",c.shape==="square"?"3px":c.shape==="soft"?"10px":"17px");
    card.style.setProperty("--card-scale",String(Math.min(120,Math.max(85,Number(c.textScale)||100))/100));
    card.style.setProperty("--card-align",c.alignment==="center"?"center":"left");
    card.classList.toggle("card-centered",c.alignment==="center");
    const setText=(id,value)=>{const el=$("#"+id);if(el)el.textContent=value};
    setText("cardName",name);setText("cardHeadline",headline);setText("cardBio",bio);setText("cardLocation",locationText||"Location not added");
    setText("cardBrandText",c.brand||"TalentBridge AI");setText("cardBrandMark",c.brandMark||"✳");setText("cardKicker",c.kicker||"HELLO, I'M");setText("miniCardBrand",(c.brand||"TalentBridge AI").toUpperCase());setText("cardFooter",c.footer||"YOUR NEXT MOVE");
    $("#cardName").hidden=!c.showName;$("#cardHeadline").hidden=!c.showHeadline;$("#cardBio").hidden=!c.showBio;
    const skillsEl=$("#cardSkills");skillsEl.innerHTML=skills.map(s=>`<span>${esc(s)}</span>`).join("");skillsEl.hidden=!c.showSkills||!skills.length;
    $("#cardBrand").hidden=!c.showBrand;$("#cardKicker").hidden=!c.showKicker;$("#cardLocation").hidden=!c.showLocation||!locationText;$("#cardFooter").hidden=!c.showFooter;$("#availabilityLabel").hidden=!c.availability;
    $("#miniName").textContent=name;$("#miniHeadline").textContent=headline;$("#miniSkills").innerHTML=skills.slice(0,4).map(s=>`<span>${esc(s)}</span>`).join("");
    $("#miniSmartCard").style.setProperty("--card1",colors[0]);$("#miniSmartCard").style.setProperty("--card2",colors[1]);
    if(options.syncInputs!==false){
      const values={cardNameInput:c.name,cardHeadlineInput:c.headline,cardBioInput:c.bio,cardSkillsInput:c.skills,cardBrandInput:c.brand,cardBrandMarkInput:c.brandMark,cardKickerInput:c.kicker,cardLocationInput:c.location,cardFooterInput:c.footer,cardColorA:colors[0],cardColorB:colors[1],cardColorGlow:colors[2],cardAlignment:c.alignment||"left",cardShape:c.shape||"rounded",cardTextScale:c.textScale||100};
      Object.entries(values).forEach(([id,value])=>{const el=$("#"+id);if(el&&document.activeElement!==el)el.value=value??""});
      [["cardShowBrand",c.showBrand],["cardShowName",c.showName],["cardShowHeadline",c.showHeadline],["cardShowBio",c.showBio],["cardShowKicker",c.showKicker],["cardShowSkills",c.showSkills],["cardShowLocation",c.showLocation],["cardShowFooter",c.showFooter]].forEach(([id,value])=>{const el=$("#"+id);if(el)el.checked=!!value});
      $("#availabilityToggle").checked=!!c.availability;$("#cardUseCustomTheme").checked=!!c.useCustomTheme;
      $("#cardBioCount").textContent=String((c.bio||"").length);$("#cardScaleValue").textContent=`${c.textScale||100}%`;
    }
    $$("[data-theme]").forEach(b=>b.classList.toggle("selected",!c.useCustomTheme&&!c.customColors&&b.dataset.theme===c.theme));
    renderProgress();
  }
  function renderIdentity(){const p=state.profile;$("#headerName").textContent=p.firstName?`${p.firstName}'s profile ↗`:"Your profile ↗";renderCard()}
  function isSaved(id){return state.saved.includes(id)}
  function hasApplied(id){return state.applications.some(a=>a.id===id)}
  function logo(job){return `<span class="company-mark">${esc(job.mark)}</span>`}
  function jobRow(j){return `<article class="job-row">${logo(j)}<div class="job-info"><h3>${esc(j.title)}</h3><p>${esc(j.company)} · ${esc(j.location)}</p><small>${esc(j.type)} · ${esc(j.salary)}</small></div><div class="job-row-actions"><button class="save-button ${isSaved(j.id)?"saved":""}" data-save="${j.id}" aria-label="Save job">${isSaved(j.id)?"♥":"♡"}</button><button class="button primary small-button" data-apply="${j.id}">${hasApplied(j.id)?"Track":"Apply"}</button></div></article>`}
  function jobCard(j){return `<article class="job-card"><div class="job-card-top">${logo(j)}<div class="job-card-title"><h3>${esc(j.title)}</h3><p>${esc(j.company)}</p></div><button class="save-button ${isSaved(j.id)?"saved":""}" data-save="${j.id}" aria-label="Save job">${isSaved(j.id)?"♥":"♡"}</button></div><div class="job-meta"><span>⌖ ${esc(j.location)}</span><span>◷ ${esc(j.type)}</span></div><div class="tags">${j.tags.map(t=>`<span>${esc(t)}</span>`).join("")}</div><div class="job-card-bottom"><span class="salary">${esc(j.salary)}</span><button class="button primary small-button" data-apply="${j.id}">${hasApplied(j.id)?"View tracker":"Apply now →"}</button></div></article>`}
  function filterJobs(){const q=query.toLowerCase(),l=locationQuery.toLowerCase();return jobs.filter(j=>(filter==="All"||filter==="Remote"&&/remote/i.test(j.location)||filter===j.type)&&(!q||[j.title,j.company,...j.tags].join(" ").toLowerCase().includes(q))&&(!l||j.location.toLowerCase().includes(l)||/remote/i.test(l)&&/remote/i.test(j.location)))}
  function renderHome(){const arr=jobs.slice(0,3);$("#homeJobs").innerHTML=arr.map(jobRow).join("");renderIdentity()}
  function renderJobs(){let arr=filterJobs();if($("#jobSort")?.value==="company")arr.sort((a,b)=>a.company.localeCompare(b.company));$("#jobsList").innerHTML=arr.length?arr.map(jobCard).join():'<div class="empty-state">No roles match those filters. Try another search.</div>';$("#resultCount").textContent=`${arr.length} ${arr.length===1?"role":"roles"} found`}
  function renderApplications(){const f=$("#applicationFilter").value;const arr=state.applications.filter(a=>f==="All"||a.status===f);$("#applicationList").innerHTML=arr.length?arr.map(a=>{const j=jobs.find(x=>x.id===a.id);return `<article class="application-row"><div><strong>${esc(j?.title||"Job application")}</strong><small>${esc(j?.company||"Company")} · ${esc(a.date)}</small></div><span class="status ${a.status==="In review"?"review":a.status==="Interview"?"interview":""}">${esc(a.status)}</span><button class="text-button" data-status="${a.id}">Next status ↗</button></article>`}).join(""):'<div class="empty-state">No applications in this status yet.</div>'}
  function populateProfile(){Object.keys(defaults.profile).forEach(k=>{const el=$("#"+k);if(el)el.value=state.profile[k]??""});$("#bioCount").textContent=$("#bio").value.length;renderCustomFields()}
  function readProfile(){const p={};Object.keys(defaults.profile).forEach(k=>{const el=$("#"+k);p[k]=el?el.value.trim():""});return p}
  function renderCustomFields(){const list=$("#customFieldsList");if(!list)return;const fields=state.customFields||[];list.innerHTML=fields.length?fields.map((f,i)=>`<div class="custom-field-row" data-custom-index="${i}"><label>Field name<input maxlength="50" data-custom-key="label" value="${esc(f.label||"")}" placeholder="Field name"></label><label>Value<input maxlength="300" data-custom-key="value" value="${esc(f.value||"")}" placeholder="Value"></label><label>Visibility<select data-custom-key="visibility"><option value="private" ${f.visibility!=="public"?"selected":""}>Private</option><option value="public" ${f.visibility==="public"?"selected":""}>Public</option></select></label><button type="button" class="remove-custom-field" data-remove-custom="${i}" aria-label="Remove custom field">Remove</button></div>`).join(""):'<p class="muted small">No custom fields yet. Add one whenever you need it.</p>';renderPublicPreview()}
  function addCustomField(){const label=$("#customFieldLabel").value.trim(),value=$("#customFieldValue").value.trim();if(!label||!value){toast("Add both a field name and a value first.");return}state.customFields=state.customFields||[];state.customFields.push({label,value,visibility:$("#customFieldVisibility").value==="public"?"public":"private"});$("#customFieldLabel").value="";$("#customFieldValue").value="";$("#customFieldVisibility").value="private";persist();renderCustomFields();toast("Your custom profile field was added")}
  function populateWorlds(){const w=state.worlds||defaults.worlds;Object.keys(defaults.worlds).forEach(k=>{const el=$("#"+k);if(el){if(el.type==="checkbox")el.checked=!!w[k];else el.value=w[k]||""}});renderPublicPreview()}
  function readWorlds(){const w={};Object.keys(defaults.worlds).forEach(k=>{const el=$("#"+k);w[k]=el?(el.type==="checkbox"?el.checked:el.value.trim()):defaults.worlds[k]});return w}
  function syncWorldFromProfile(force=false){const p=state.profile,w=state.worlds;if(force||!w.publicDisplayName)w.publicDisplayName=`${p.firstName} ${p.lastName}`.trim();if(force||!w.publicTitle)w.publicTitle=p.headline;if(force||!w.publicBio)w.publicBio=p.bio;if(force||!w.publicSkills)w.publicSkills=p.skills;if(force||!w.publicPortfolio)w.publicPortfolio=p.portfolio;if(force||!w.publicLocation)w.publicLocation=p.location;if(force||!w.publicLinkedin)w.publicLinkedin=p.linkedin;if(force||!w.publicGithub)w.publicGithub=p.github}
  function safeExternalUrl(value){try{const u=new URL(String(value||""),window.location.href);return ["http:","https:"].includes(u.protocol)?u.href:""}catch{return ""}}
  function setPublicLink(id,url,label,show){const el=$("#"+id),safeUrl=safeExternalUrl(url);el.hidden=!(show&&safeUrl);if(!el.hidden){el.href=safeUrl;el.textContent=label+" ↗";el.rel="noopener noreferrer"}}
  function renderPublicPreview(){const w=state.worlds||defaults.worlds,p=state.profile;$("#previewPublicName").textContent=w.publicDisplayName||`${p.firstName} ${p.lastName}`.trim()||"Your Name";$("#previewPublicTitle").textContent=w.publicTitle||p.headline||"Your professional title";$("#previewPublicBio").textContent=w.publicBio||"Add a public introduction to tell people what you do and what you want to build next.";const skills=w.showSkills?(w.publicSkills||p.skills||"").split(",").map(s=>s.trim()).filter(Boolean).slice(0,5):[];$("#previewPublicSkills").innerHTML=skills.length?skills.map(s=>`<span>${esc(s)}</span>`).join(""):"<span>Skills hidden</span>";$("#previewPublicLocation").textContent=w.showLocation?(w.publicLocation||p.location||"Location not added"):"Location hidden";
    const detailRows=[['Pronouns',p.pronouns,w.showPronouns],['Phone',p.phone,w.showPhone],['Current role',p.currentRole,w.showCurrentRole],['Industry',p.industry,w.showIndustry],['Career level',p.careerLevel,w.showCareerLevel],['Employment status',p.employmentStatus,w.showEmploymentStatus],['Desired role',p.desiredRole,w.showDesiredRole],['Work preference',p.workPreference,w.showWorkPreference],['Preferred job types',p.jobTypes,w.showJobTypes],['Availability',p.availability,w.showAvailability],['Notice period',p.noticePeriod,w.showNoticePeriod],['Preferred location',p.preferredLocation,w.showPreferredLocation],['Years of experience',p.yearsExperience?`${p.yearsExperience} years`: '',w.showYearsExperience],['Education',p.education,w.showEducation],['Experience',p.experience,w.showExperience],['Projects',p.projects,w.showProjects],['Certifications',p.certifications,w.showCertifications],['Achievements',p.achievements,w.showAchievements],['Languages',p.languages,w.showLanguages],['Interests & strengths',p.interests,w.showInterests],['Publications / talks',p.publications,w.showPublications],['Volunteering / community',p.volunteer,w.showVolunteer]] .filter(([label,value,visible])=>visible&&value);
    $("#previewPublicDetails").innerHTML=detailRows.map(([label,value])=>`<div class="public-detail"><strong>${esc(label)}</strong><span>${esc(value)}</span></div>`).join("");
    const custom=(state.customFields||[]).filter(f=>w.showCustomFields&&f.visibility==="public"&&f.label&&f.value);$("#previewPublicCustomFields").innerHTML=custom.map(f=>`<div class="public-detail"><strong>${esc(f.label)}</strong><span>${esc(f.value)}</span></div>`).join("");
    setPublicLink("previewPublicPortfolio",w.publicPortfolio||p.portfolio,"Portfolio",w.showPortfolio);setPublicLink("previewPublicLinkedin",w.publicLinkedin||p.linkedin,"LinkedIn",w.showLinkedin);setPublicLink("previewPublicGithub",w.publicGithub||p.github,"GitHub",w.showGithub);setPublicLink("previewPublicResume",p.resumeUrl,"Resume",w.showResume);const email=$("#previewPublicEmail");if(w.showEmail&&p.email){email.textContent=p.email;email.hidden=false}else email.hidden=true}
  function publicProfileText(){const w=state.worlds,p=state.profile;const parts=[w.publicDisplayName||`${p.firstName} ${p.lastName}`.trim(),w.publicTitle||p.headline,w.publicBio||p.bio];if(w.showSkills)parts.push("Skills: "+(w.publicSkills||p.skills));if(w.showLocation)parts.push("Location: "+(w.publicLocation||p.location));const pairs=[['Pronouns',p.pronouns,w.showPronouns],['Phone',p.phone,w.showPhone],['Current role',p.currentRole,w.showCurrentRole],['Industry',p.industry,w.showIndustry],['Career level',p.careerLevel,w.showCareerLevel],['Employment status',p.employmentStatus,w.showEmploymentStatus],['Desired role',p.desiredRole,w.showDesiredRole],['Work preference',p.workPreference,w.showWorkPreference],['Preferred job types',p.jobTypes,w.showJobTypes],['Availability',p.availability,w.showAvailability],['Notice period',p.noticePeriod,w.showNoticePeriod],['Preferred location',p.preferredLocation,w.showPreferredLocation],['Years of experience',p.yearsExperience,w.showYearsExperience],['Education',p.education,w.showEducation],['Experience',p.experience,w.showExperience],['Projects',p.projects,w.showProjects],['Certifications',p.certifications,w.showCertifications],['Achievements',p.achievements,w.showAchievements],['Languages',p.languages,w.showLanguages],['Interests & strengths',p.interests,w.showInterests],['Publications / talks',p.publications,w.showPublications],['Volunteering / community',p.volunteer,w.showVolunteer]];pairs.forEach(([label,value,visible])=>{if(visible&&value)parts.push(`${label}: ${value}`)});(state.customFields||[]).forEach(f=>{if(w.showCustomFields&&f.visibility==='public'&&f.label&&f.value)parts.push(`${f.label}: ${f.value}`)});if(w.showPortfolio&&(w.publicPortfolio||p.portfolio))parts.push("Portfolio: "+(w.publicPortfolio||p.portfolio));if(w.showLinkedin&&(w.publicLinkedin||p.linkedin))parts.push("LinkedIn: "+(w.publicLinkedin||p.linkedin));if(w.showGithub&&(w.publicGithub||p.github))parts.push("GitHub: "+(w.publicGithub||p.github));if(w.showResume&&p.resumeUrl)parts.push("Resume: "+p.resumeUrl);if(w.showEmail&&p.email)parts.push("Email: "+p.email);return parts.filter(Boolean).join("\n")}
  function saveWorld(){state.worlds=readWorlds();persist();renderPublicPreview();$("#worldMessage").textContent="Workspace saved in this browser.";toast("Profile workspace saved")}
  function switchWorld(world){const isPrivate=world==="private";$$("[data-world]").forEach(b=>{b.classList.toggle("active",b.dataset.world===world);b.setAttribute("aria-selected",String(b.dataset.world===world))});$("#publicWorldEditor").hidden=isPrivate;$("#privateWorldEditor").hidden=!isPrivate;$("#worldEditorTitle").textContent=isPrivate?"Private workspace":"Public profile";$("#worldEditorSub").textContent=isPrivate?"Personal notes and career planning, not shown in public preview.":"Choose what to share and how it appears.";$("#worldBadge").textContent=isPrivate?"PRIVATE":"PUBLIC";$("#worldNotice").textContent=isPrivate?"🔒 Your private workspace is for your own planning. These fields are not included in the public profile preview.":"🌐 Your public profile is your professional introduction. Only fields marked public are included in the public preview."}
  function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="talentbridge-profile-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Profile backup exported")}
  function importData(file){if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const x=JSON.parse(reader.result);if(!x||typeof x!=="object"||!x.profile)throw new Error("Invalid backup");state={...clone(defaults),...x,profile:{...defaults.profile,...x.profile},customFields:Array.isArray(x.customFields)?x.customFields:[],worlds:{...defaults.worlds,...x.worlds},card:{...defaults.card,...x.card},preferences:{...defaults.preferences,...x.preferences,customTheme:{...defaults.preferences.customTheme,...(x.preferences?.customTheme||{})}}};persist();populateProfile();syncWorldFromProfile();populateWorlds();renderCustomFields();renderHome();renderJobs();renderApplications();renderCard();syncCustomThemeInputs();applyPreferences();toast("Profile backup imported")}catch{toast("That file isn't a valid TalentBridge backup")}};reader.readAsText(file)}
  function saveProfile(e){e?.preventDefault();const p=readProfile();if(!p.firstName||!p.lastName){toast("Please enter your first and last name.");return}if(p.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)){toast("Please enter a valid email.");return}state.profile=p;syncWorldFromProfile();if(!state.card.name)state.card.name=`${p.firstName} ${p.lastName}`.trim();if(!state.card.headline)state.card.headline=p.headline;if(!state.card.bio)state.card.bio=p.bio;if(!state.card.skills)state.card.skills=p.skills;persist();renderHome();renderCard();populateWorlds();$("#profileMessage").textContent="Profile saved in this browser.";toast("Profile saved")}
  function readCard(){
    const c=state.card;
    const textFields={name:"cardNameInput",headline:"cardHeadlineInput",bio:"cardBioInput",skills:"cardSkillsInput",brand:"cardBrandInput",brandMark:"cardBrandMarkInput",kicker:"cardKickerInput",location:"cardLocationInput",footer:"cardFooterInput"};
    Object.entries(textFields).forEach(([key,id])=>{const el=$("#"+id);if(el)c[key]=el.value.trim()});
    c.availability=$("#availabilityToggle").checked;
    [ ["showBrand","cardShowBrand"],["showName","cardShowName"],["showHeadline","cardShowHeadline"],["showBio","cardShowBio"],["showKicker","cardShowKicker"],["showSkills","cardShowSkills"],["showLocation","cardShowLocation"],["showFooter","cardShowFooter"] ].forEach(([key,id])=>{const el=$("#"+id);if(el)c[key]=el.checked});
    c.alignment=$("#cardAlignment").value;c.shape=$("#cardShape").value;c.textScale=Math.min(120,Math.max(85,Number($("#cardTextScale").value)||100));
    c.colorA=safeHex($("#cardColorA").value,"#0b2443");c.colorB=safeHex($("#cardColorB").value,"#12517a");c.colorGlow=safeHex($("#cardColorGlow").value,"#47c8f1");
  }
  function saveCard(){readCard();persist();renderCard();$("#cardMessage").textContent="Your Smart Card design is saved in this browser.";toast("Smart Card saved")}
  function setTheme(theme){readCard();state.card.theme=theme;state.card.useCustomTheme=false;state.card.customColors=false;const palettes={ocean:["#0b2443","#12517a","#47c8f1"],violet:["#211744","#56358b","#b59bff"],green:["#073b39","#116b60","#62dfb4"],sunset:["#632c3e","#9c4c4e","#ffbc72"],mono:["#080d18","#29374c","#b7c8dc"]};const t=palettes[theme]||palettes.ocean;[state.card.colorA,state.card.colorB,state.card.colorGlow]=t;persist();renderCard()}
  function setAccent(accent){state.preferences.accent=accent;if(state.preferences.customTheme)state.preferences.customTheme.enabled=false;persist();syncCustomThemeInputs();applyPreferences();toast("Dashboard accent updated")}
  const THEME_COLORS={accent:"#2678f3",background:"#f5f7fb",panel:"#ffffff",text:"#1b2b42",sidebar:"#081a33",accent2:"#55d4f4"};
  const THEME_FONTS=["DM Sans","Manrope","Inter","Arial","Georgia","system-ui"];
  function safeHex(value,fallback){return /^#[0-9a-f]{6}$/i.test(String(value||""))?String(value):fallback}
  function readCustomTheme(){const old=state.preferences.customTheme||clone(defaults.preferences.customTheme);const readColor=(id,key)=>safeHex($("#"+id)?.value,old[key]||THEME_COLORS[key]);return {enabled:$("#customThemeEnabled")?$("#customThemeEnabled").checked:!!old.enabled,name:$("#customThemeName")?.value.trim().slice(0,40)||old.name||"My custom theme",accent:readColor("customAccent","accent"),background:readColor("customBackground","background"),panel:readColor("customPanel","panel"),text:readColor("customText","text"),sidebar:readColor("customSidebar","sidebar"),accent2:readColor("customAccent2","accent2"),font:THEME_FONTS.includes($("#customFont")?.value)?$("#customFont").value:(old.font||"DM Sans"),radius:Math.max(4,Math.min(28,Number($("#customRadius")?.value||old.radius||16)))} }
  function syncCustomThemeInputs(){const t={...clone(defaults.preferences.customTheme),...(state.preferences.customTheme||{})};const map={customThemeName:"name",customAccent:"accent",customBackground:"background",customPanel:"panel",customText:"text",customSidebar:"sidebar",customAccent2:"accent2",customFont:"font",customRadius:"radius",customThemeEnabled:"enabled"};Object.entries(map).forEach(([id,key])=>{const el=$("#"+id);if(el){if(el.type==="checkbox")el.checked=!!t[key];else el.value=t[key]??""}});$("#customRadiusValue").textContent=(t.radius||16)+"px";renderThemeDemo()}
  function renderThemeDemo(){const t=readCustomTheme(),demo=$("#themeDemo");if(!demo)return;demo.style.setProperty("--demo-accent",t.accent);demo.style.setProperty("--demo-bg",t.background);demo.style.setProperty("--demo-panel",t.panel);demo.style.setProperty("--demo-text",t.text);demo.style.setProperty("--demo-sidebar",t.sidebar);demo.style.setProperty("--demo-accent2",t.accent2);demo.style.setProperty("--demo-radius",t.radius+"px");$("#themeDemoName").textContent=t.name||"My custom theme"}
  function updateCustomThemeDraft(){state.preferences.customTheme=readCustomTheme();$("#customRadiusValue").textContent=state.preferences.customTheme.radius+"px";renderThemeDemo();applyPreferences();persist()}
  function applyPreferences(){
    document.body.classList.toggle("motion-reduced",state.preferences.motion==="reduced");document.body.classList.toggle("motion-off",state.preferences.motion==="off");document.body.classList.toggle("spacing-comfortable",state.preferences.spacing==="comfortable");
    const root=document.body.style, t={...clone(defaults.preferences.customTheme),...(state.preferences.customTheme||{})},enabled=!!t.enabled;
    document.body.classList.toggle("custom-theme-enabled",enabled);
    const vars=["--accent","--accent2","--accent-soft","--bg","--paper","--ink","--muted","--navy","--radius","--custom-font-family","--custom-line"];
    if(enabled){root.setProperty("--accent",safeHex(t.accent,THEME_COLORS.accent));root.setProperty("--accent2",safeHex(t.accent2,THEME_COLORS.accent2));root.setProperty("--accent-soft",`color-mix(in srgb, ${safeHex(t.accent,THEME_COLORS.accent)} 11%, white)`);root.setProperty("--bg",safeHex(t.background,THEME_COLORS.background));root.setProperty("--paper",safeHex(t.panel,THEME_COLORS.panel));root.setProperty("--ink",safeHex(t.text,THEME_COLORS.text));root.setProperty("--muted",safeHex(t.text,THEME_COLORS.text)+"a6");root.setProperty("--navy",safeHex(t.sidebar,THEME_COLORS.sidebar));root.setProperty("--radius",Math.max(4,Math.min(28,Number(t.radius)||16))+"px");root.setProperty("--custom-font-family",`${JSON.stringify(THEME_FONTS.includes(t.font)?t.font:"DM Sans")}, sans-serif`)}else{vars.forEach(v=>root.removeProperty(v))}
    ["violet","green","sunset"].forEach(a=>document.body.classList.toggle("accent-"+a,!enabled&&state.preferences.accent===a));
    $$ ("[data-accent]").forEach(b=>b.classList.toggle("selected",!enabled&&b.dataset.accent===state.preferences.accent));$$("[data-motion]").forEach(b=>b.classList.toggle("selected",b.dataset.motion===state.preferences.motion));$$("[data-spacing]").forEach(b=>b.classList.toggle("selected",b.dataset.spacing===state.preferences.spacing));if($("#tourOnLoad"))$("#tourOnLoad").checked=state.preferences.tour;
  }
  function saveCustomTheme(){state.preferences.customTheme=readCustomTheme();state.preferences.customTheme.enabled=true;$("#customThemeEnabled").checked=true;persist();applyPreferences();renderThemeDemo();$("#themeMessage").textContent=`“${state.preferences.customTheme.name}” is saved and active in this browser.`;toast("Your custom theme is active")}
  function resetCustomTheme(){state.preferences.customTheme=clone(defaults.preferences.customTheme);state.preferences.customTheme.enabled=false;persist();syncCustomThemeInputs();applyPreferences();$("#themeMessage").textContent="Custom theme reset. Preset accent colors are active again.";toast("Custom theme reset")}
  function exportTheme(){const t=readCustomTheme();const payload={app:"TalentBridge AI",type:"custom-theme",version:1,theme:t};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=(t.name||"talentbridge-theme").toLowerCase().replace(/[^a-z0-9]+/g,"-")+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Theme JSON exported")}
  function importTheme(file){if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const raw=JSON.parse(reader.result),t=raw.theme||raw;if(!t||typeof t!=="object")throw new Error("Invalid theme");const current=clone(defaults.preferences.customTheme);current.name=String(t.name||current.name).slice(0,40);["accent","background","panel","text","sidebar","accent2"].forEach(k=>current[k]=safeHex(t[k],current[k]));current.font=THEME_FONTS.includes(t.font)?t.font:current.font;current.radius=Math.max(4,Math.min(28,Number(t.radius)||16));current.enabled=!!t.enabled;state.preferences.customTheme=current;persist();syncCustomThemeInputs();applyPreferences();$("#themeMessage").textContent="Theme imported. Enable it or press Save my theme to apply it.";toast("Theme imported")}catch{toast("That file isn't a valid TalentBridge theme")}};reader.readAsText(file);$("#importTheme").value=""}
  function clearTourSpotlight(){
    const backdrop=$("#tourBackdrop");
    activeTourTarget=null;
    if(backdrop){
      backdrop.classList.remove("has-spotlight");
      ["--tour-hole-left","--tour-hole-top","--tour-hole-w","--tour-hole-h"].forEach(key=>backdrop.style.removeProperty(key));
    }
  }
  function resetTourCardPosition(){
    const box=$("#tourOverlay .tour-box");
    if(!box)return;
    ["position","left","top","right","bottom","margin"].forEach(key=>box.style.removeProperty(key));
    box.classList.remove("tour-box-docked");
  }
  function positionTourCard(target){
    const overlay=$("#tourOverlay"),box=$("#tourOverlay .tour-box");
    if(!box||!target||overlay.hidden){resetTourCardPosition();return}
    // Dock Jerry's explanation in the least-obstructive viewport corner. This matters
    // because a spotlight hole alone is not enough if the dialog itself covers the control.
    box.classList.add("tour-box-docked");
    Object.assign(box.style,{position:"fixed",left:"12px",top:"12px",right:"auto",bottom:"auto",margin:"0"});
    const br=box.getBoundingClientRect(),tr=target.getBoundingClientRect();
    const vw=window.innerWidth,vh=window.innerHeight,pad=12;
    const bw=Math.min(br.width,vw-pad*2),bh=Math.min(br.height,vh-pad*2);
    const lefts=[pad,Math.max(pad,vw-bw-pad)],tops=[pad,Math.max(pad,vh-bh-pad)];
    const expanded={left:tr.left-18,right:tr.right+18,top:tr.top-18,bottom:tr.bottom+18};
    const candidates=[];
    for(const top of tops)for(const left of lefts){
      const overlapW=Math.max(0,Math.min(left+bw,expanded.right)-Math.max(left,expanded.left));
      const overlapH=Math.max(0,Math.min(top+bh,expanded.bottom)-Math.max(top,expanded.top));
      candidates.push({left,top,score:overlapW*overlapH});
    }
    candidates.sort((a,b)=>a.score-b.score);
    box.style.left=Math.round(candidates[0].left)+"px";
    box.style.top=Math.round(candidates[0].top)+"px";
  }
  function updateTourSpotlight(target=activeTourTarget){
    const overlay=$("#tourOverlay"),backdrop=$("#tourBackdrop");
    if(!backdrop||!overlay||overlay.hidden||!target||!target.isConnected){clearTourSpotlight();return}
    const rect=target.getBoundingClientRect();
    if(rect.width<1||rect.height<1){clearTourSpotlight();return}
    activeTourTarget=target;
    // Match the target's real rectangular bounds with a little breathing room for
    // its cyan outline and glow. Clamp it to the viewport on small screens.
    const pad=18;
    const left=Math.max(0,rect.left-pad);
    const top=Math.max(0,rect.top-pad);
    const right=Math.min(window.innerWidth,rect.right+pad);
    const bottom=Math.min(window.innerHeight,rect.bottom+pad);
    backdrop.style.setProperty("--tour-hole-left",`${left}px`);
    backdrop.style.setProperty("--tour-hole-top",`${top}px`);
    backdrop.style.setProperty("--tour-hole-w",`${Math.max(1,right-left)}px`);
    backdrop.style.setProperty("--tour-hole-h",`${Math.max(1,bottom-top)}px`);
    backdrop.classList.add("has-spotlight");
  }
  function scheduleTourSpotlight(){
    if(tourSpotlightRaf)cancelAnimationFrame(tourSpotlightRaf);
    tourSpotlightRaf=requestAnimationFrame(()=>{
      tourSpotlightRaf=0;
      if(activeTourTarget&& !$("#tourOverlay").hidden)positionTourCard(activeTourTarget);
      updateTourSpotlight();
    });
  }
  function openTour(){
    tourInvoker=document.activeElement;tourIndex=0;document.body.classList.add("tour-open");
    $("#tourOverlay").hidden=false;
    document.dispatchEvent(new CustomEvent("jerry:tour-state",{detail:{active:true}}));
    renderTour();$("#tourNext").focus();
  }
  function closeTour(message=""){
    const overlay=$("#tourOverlay");overlay.hidden=true;document.body.classList.remove("tour-open");
    $$(".jerry-tour-focus").forEach(el=>el.classList.remove("jerry-tour-focus"));clearTourSpotlight();resetTourCardPosition();
    document.dispatchEvent(new CustomEvent("jerry:tour-state",{detail:{active:false}}));
    if(tourInvoker&&typeof tourInvoker.focus==="function"&&tourInvoker.isConnected&&!tourInvoker.closest("[hidden]"))tourInvoker.focus();
    if(message)toast(message);
  }
  function renderTour(){
    const t=tour[tourIndex];
    if(t.page){const pageElement=$("#page-"+t.page);if(pageElement&&!pageElement.classList.contains("active"))go(t.page,{immediate:true})}
    if(t.world){const worldTab=$(`[data-world="${t.world}"]`);if(worldTab&&!worldTab.classList.contains("active"))worldTab.click()}
    $$(".jerry-tour-focus").forEach(el=>el.classList.remove("jerry-tour-focus"));
    clearTourSpotlight();resetTourCardPosition();
    $("#tourStep").textContent=`${String(tourIndex+1).padStart(2,"0")} / ${String(tour.length).padStart(2,"0")}`;
    $("#tourStep").setAttribute("aria-label",`Step ${tourIndex+1} of ${tour.length}`);
    $("#tourBar").style.width=((tourIndex+1)/tour.length*100)+"%";
    $("#tourProgress").setAttribute("aria-valuenow",String(tourIndex+1));
    $("#tourProgress").setAttribute("aria-valuemax",String(tour.length));
    $("#tourSymbol").textContent=t.symbol;$("#tourTitle").textContent=t.title;$("#tourDescription").textContent=t.text;
    $("#tourGreeting").textContent=tourIndex===0?"Hi, I'm Jerry!":"Your old pal Jerry is here";
    $("#tourVoice").textContent=t.voice||"Let's take this one step at a time. I'm right here if you need me.";
    $("#tourTarget").textContent=t.target?"Look here: "+t.label:"We're starting together: "+t.label;
    $("#tourTip").textContent=t.tip;
    if(t.target){
      const target=$(t.target);
      if(target){
        target.classList.add("jerry-tour-focus");activeTourTarget=target;
        window.setTimeout(()=>{
          if($("#tourOverlay").hidden)return;
          target.scrollIntoView({block:"center",inline:"nearest",behavior:"auto"});
          positionTourCard(target);
          scheduleTourSpotlight();
          window.setTimeout(scheduleTourSpotlight,120);
        },50);
      }
    }
    $("#tourPrev").disabled=tourIndex===0;
    $("#tourNext").textContent=tourIndex===tour.length-1?"Finish tour ✓":"Next step →";
    $("#tourNext").setAttribute("aria-label",tourIndex===tour.length-1?"Finish guided tour":"Go to next tour step");
  }
  function nextTour(){if(tourIndex===tour.length-1){closeTour("Tour complete — you can replay it from Customize anytime.");return}tourIndex++;renderTour()}
  function previousTour(){if(tourIndex>0){tourIndex--;renderTour()}}
  function applyJob(id){if(hasApplied(id)){go("applications");return}state.applications.unshift({id,status:"Applied",date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short"})});persist();renderHome();renderJobs();renderApplications();toast("Added to your application tracker")}
  function saveJob(id){state.saved=isSaved(id)?state.saved.filter(x=>x!==id):[...state.saved,id];persist();renderHome();renderJobs();toast(isSaved(id)?"Job saved":"Removed from saved jobs")}
  function resetAll(){if(!confirm("Reset all dashboard demo data in this browser?"))return;state=clone(defaults);persist();populateProfile();syncWorldFromProfile(true);populateWorlds();renderCustomFields();renderHome();renderJobs();renderApplications();renderCard();syncCustomThemeInputs();applyPreferences();go("home");toast("Demo reset")}
  function cardPlainText(){const c=state.card;const p=state.profile;const rows=[c.showBrand?`${c.brandMark||"✳"} ${c.brand||"TalentBridge AI"}`:"",c.showName?(c.name||`${p.firstName} ${p.lastName}`.trim()):"",c.showHeadline?(c.headline||p.headline):"",c.showBio?(c.bio||p.bio):"",c.showSkills?(c.skills||p.skills?`Skills: ${c.skills||p.skills}`:""):"",c.showLocation?(c.location||p.location?`Location: ${c.location||p.location}`:""):"",c.showFooter?(c.footer||"YOUR NEXT MOVE"):"",c.availability?"Open to opportunities":"" ];return rows.filter(Boolean).join("\n")}
  async function shareCard(){const text=cardPlainText();try{if(navigator.share)await navigator.share({title:"My TalentBridge AI Smart Card",text});else if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);toast("Card details copied")}else{const temp=document.createElement("textarea");temp.value=text;temp.style.position="fixed";temp.style.opacity="0";document.body.append(temp);temp.select();const ok=document.execCommand("copy");temp.remove();toast(ok?"Card details copied":"Use Print / PDF to save your card")}}catch(e){if(e.name!=="AbortError")toast("Sharing was cancelled")}}
  function downloadCardText(){const blob=new Blob([cardPlainText()+"\n"],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="talentbridge-smart-card.txt";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Card text exported")}
  function bind(){
    document.addEventListener("click",e=>{
      const page=e.target.closest("[data-page]");if(page){e.preventDefault();go(page.dataset.page);return}
      const save=e.target.closest("[data-save]");if(save){saveJob(save.dataset.save);return}
      const apply=e.target.closest("[data-apply]");if(apply){applyJob(apply.dataset.apply);return}
      const status=e.target.closest("[data-status]");if(status){const a=state.applications.find(x=>x.id===status.dataset.status);if(a){const all=["Applied","In review","Interview"];a.status=all[(all.indexOf(a.status)+1)%all.length];persist();renderApplications();toast("Application status updated")}return}
      const filterBtn=e.target.closest("[data-filter]");if(filterBtn){filter=filterBtn.dataset.filter;$$("[data-filter]").forEach(b=>b.classList.toggle("active",b.dataset.filter===filter));renderJobs();return}
      const theme=e.target.closest("[data-theme]");if(theme){setTheme(theme.dataset.theme);return}
      const accent=e.target.closest("[data-accent]");if(accent){setAccent(accent.dataset.accent);return}
      const motion=e.target.closest("[data-motion]");if(motion){state.preferences.motion=motion.dataset.motion;persist();applyPreferences();return}
      const spacing=e.target.closest("[data-spacing]");if(spacing){state.preferences.spacing=spacing.dataset.spacing;persist();applyPreferences();return}
    });
    $("#menuButton").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
    $("#globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){query=e.target.value.trim();locationQuery="";$("#jobQuery").value=query;$("#jobLocation").value="";go("jobs");renderJobs()}});
    $("#searchButton").addEventListener("click",()=>{query=$("#jobQuery").value.trim();locationQuery=$("#jobLocation").value.trim();renderJobs()});
    $("#jobQuery").addEventListener("keydown",e=>{if(e.key==="Enter")$("#searchButton").click()});
    $("#jobLocation").addEventListener("keydown",e=>{if(e.key==="Enter")$("#searchButton").click()});
    $("#jobSort").addEventListener("change",renderJobs);$("#applicationFilter").addEventListener("change",renderApplications);
    $("#profileForm").addEventListener("submit",saveProfile);$("#bio").addEventListener("input",e=>$("#bioCount").textContent=e.target.value.length);
    $("#resetProfile").addEventListener("click",()=>{populateProfile();$("#profileMessage").textContent="Fields restored to last saved details"});
    $$("[data-world]").forEach(b=>b.addEventListener("click",()=>switchWorld(b.dataset.world)));
    $$("#publicWorldEditor input, #publicWorldEditor textarea").forEach(el=>{el.addEventListener("input",()=>{state.worlds=readWorlds();renderPublicPreview()});el.addEventListener("change",()=>{state.worlds=readWorlds();renderPublicPreview()})});
    $("#syncPublicFromProfile").addEventListener("click",()=>{state.worlds=readWorlds();syncWorldFromProfile(true);populateWorlds();persist();$("#worldMessage").textContent="Public fields copied from your main profile. Review visibility before sharing.";toast("Public profile fields updated")});
    $("#saveWorld").addEventListener("click",saveWorld);
    $("#resetWorld").addEventListener("click",()=>{const active=$(".world-tab.active")?.dataset.world;if(active==="private"){["privateNotes","privateTargetRole","privateSalary","privateGoals","privateInterview","privatePreferences"].forEach(id=>$("#"+id).value="")}else{state.worlds={...clone(defaults.worlds),...state.worlds};["publicDisplayName","publicTitle","publicBio","publicSkills","publicPortfolio","publicLocation","publicLinkedin","publicGithub"].forEach(id=>$("#"+id).value="");Object.keys(defaults.worlds).filter(k=>k.startsWith("show")).forEach(id=>{const el=$("#"+id);if(el)el.checked=!!defaults.worlds[id]})}state.worlds=readWorlds();persist();renderPublicPreview();$("#worldMessage").textContent="This workspace was reset.";toast("Workspace reset")});
    $("#copyPublicProfile").addEventListener("click",async()=>{const text=publicProfileText();try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);toast("Visible public profile text copied")}else{const temp=document.createElement("textarea");temp.value=text;temp.style.position="fixed";temp.style.opacity="0";document.body.append(temp);temp.select();const ok=document.execCommand("copy");temp.remove();toast(ok?"Visible public profile text copied":"Copy isn't available here; select the preview text manually")}}catch{toast("Copy isn't available here; select the preview text manually")}});
    $("#addCustomField").addEventListener("click",addCustomField);
    $("#customFieldsList").addEventListener("input",e=>{const row=e.target.closest("[data-custom-index]");if(!row||!e.target.dataset.customKey)return;const i=Number(row.dataset.customIndex),key=e.target.dataset.customKey;if(state.customFields[i]){state.customFields[i][key]=e.target.value;persist();renderPublicPreview()}});
    $("#customFieldsList").addEventListener("change",e=>{const row=e.target.closest("[data-custom-index]");if(!row||!e.target.dataset.customKey)return;const i=Number(row.dataset.customIndex),key=e.target.dataset.customKey;if(state.customFields[i]){state.customFields[i][key]=e.target.value;persist();renderPublicPreview()}});
    $("#customFieldsList").addEventListener("click",e=>{const btn=e.target.closest("[data-remove-custom]");if(!btn)return;const index=Number(btn.dataset.removeCustom);state.customFields.splice(index,1);persist();renderCustomFields();toast("Custom field removed")});
    ["customThemeName","customAccent","customBackground","customPanel","customText","customSidebar","customAccent2","customFont","customRadius","customThemeEnabled"].forEach(id=>{const el=$("#"+id);el.addEventListener("input",updateCustomThemeDraft);el.addEventListener("change",updateCustomThemeDraft)});
    $("#saveCustomTheme").addEventListener("click",saveCustomTheme);$("#resetCustomTheme").addEventListener("click",resetCustomTheme);$("#exportTheme").addEventListener("click",exportTheme);$("#importTheme").addEventListener("change",e=>importTheme(e.target.files?.[0]));
    $("#exportData").addEventListener("click",exportData);$("#importData").addEventListener("change",e=>importData(e.target.files?.[0]));
    ["cardNameInput","cardHeadlineInput","cardBioInput","cardSkillsInput","cardBrandInput","cardBrandMarkInput","cardKickerInput","cardLocationInput","cardFooterInput"].forEach(id=>$("#"+id).addEventListener("input",()=>{readCard();persist();renderCard({syncInputs:false});$("#cardBioCount").textContent=String($("#cardBioInput").value.length)}));
    ["availabilityToggle","cardShowBrand","cardShowName","cardShowHeadline","cardShowBio","cardShowKicker","cardShowSkills","cardShowLocation","cardShowFooter","cardAlignment","cardShape","cardTextScale"].forEach(id=>$("#"+id).addEventListener("input",()=>{readCard();persist();renderCard({syncInputs:false});$("#cardScaleValue").textContent=`${state.card.textScale}%`}));
    ["cardColorA","cardColorB","cardColorGlow"].forEach(id=>$("#"+id).addEventListener("input",()=>{readCard();state.card.customColors=true;state.card.useCustomTheme=false;state.card.theme="custom";persist();renderCard({syncInputs:false})}));
    $("#cardUseCustomTheme").addEventListener("change",e=>{readCard();state.card.useCustomTheme=e.target.checked;if(e.target.checked)state.card.customColors=false;persist();renderCard();toast(e.target.checked?"Smart Card is using your dashboard palette":"Smart Card palette is independent again")});$("#saveCard").addEventListener("click",saveCard);
    $("#resetCard").addEventListener("click",()=>{state.card=clone(defaults.card);persist();renderCard();$("#cardMessage").textContent="Card design reset to its original settings.";toast("Card design reset")});
    $("#shareCard").addEventListener("click",shareCard);$("#printCard").addEventListener("click",()=>window.print());
    $("#downloadCardText").addEventListener("click",downloadCardText);
    $("#replayTour").addEventListener("click",openTour);$("#tourFromCustomize").addEventListener("click",openTour);$("#replayTourBottom").addEventListener("click",openTour);
    $("#tourNext").addEventListener("click",nextTour);$("#tourPrev").addEventListener("click",previousTour);$("#tourSkip").addEventListener("click",()=>closeTour("Tour closed. You can restart it anytime from Customize."));$("#tourClose").addEventListener("click",()=>closeTour());
    $("#tourOnLoad").addEventListener("change",e=>{state.preferences.tour=e.target.checked;persist();toast(e.target.checked?"Guide will open on page load":"Automatic guide is off")});$("#resetAll").addEventListener("click",resetAll);
    $("#tourOverlay").addEventListener("click",e=>{if(e.target===$("#tourOverlay")||e.target===$("#tourBackdrop"))closeTour()});
    window.addEventListener("scroll",()=>{if(!$("#tourOverlay").hidden)scheduleTourSpotlight()},{passive:true,capture:true});
    window.addEventListener("resize",()=>{if(!$("#tourOverlay").hidden)scheduleTourSpotlight()},{passive:true});
    document.addEventListener("keydown",e=>{
      if(!$("#tourOverlay").hidden){
        if(e.key==="Escape"){e.preventDefault();closeTour();return}
        if(e.key==="ArrowRight"){e.preventDefault();nextTour();return}
        if(e.key==="ArrowLeft"){e.preventDefault();previousTour();return}
        if(e.key==="Tab"){
          const focusables=$$("#tourOverlay button:not(:disabled)");const first=focusables[0],last=focusables[focusables.length-1];
          if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
          else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
        }
      }
      if(e.key==="Escape")$("#sidebar").classList.remove("open");
    });
  }
  function init(){populateProfile();syncWorldFromProfile();populateWorlds();renderCustomFields();syncCustomThemeInputs();renderHome();renderJobs();renderApplications();renderCard();applyPreferences();bind();if(state.preferences.tour)setTimeout(openTour,650)}
  document.addEventListener("DOMContentLoaded",init);
})();