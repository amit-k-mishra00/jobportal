(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const jobForm = $('#job-form');
  if (!jobForm) return;

  const DRAFT_KEY = 'talentbridge-posting-a-job-draft-v1';
  const stepPanels = $$('.form-step');
  const stepTabs = $$('.step-tab');
  const nextButton = $('#next-step');
  const previousButton = $('#previous-step');
  const progressFill = $('#progress-fill');
  const stepCounter = $('#step-counter');
  const progressPercent = $('#progress-percent');
  const formStatus = $('#form-status');
  const skillSet = new Set();
  let currentStep = 0;
  let advancedMode = false;
  let lastFocusedElement = null;

  const field = (id) => document.getElementById(id);
  const getValue = (id) => (field(id)?.value || '').trim();
  const guideMessage = $('#guide-message');
  const guideStage = $('#guide-stage');
  const guideStages = ['ROLE DETAILS', 'REQUIREMENTS', 'JOB DESCRIPTION', 'FINAL REVIEW'];
  function updateGuide() {
    if (!guideMessage || !guideStage) return;
    const role = getValue('job-title');
    const company = getValue('company-name');
    const skills = skillSet.size;
    const roleContext = role ? ` for ${role}${company ? ` at ${company}` : ''}` : '';
    if (advancedMode) {
      guideMessage.textContent = role ? `Every section is open for your ${role}${company ? ` at ${company}` : ''} post. Fill details in any order; your preview updates as you go.` : 'Advanced view shows every field together. Fill sections in any order and use the live preview as you go.';
      guideStage.textContent = 'ADVANCED VIEW · ALL DETAILS VISIBLE';
      return;
    }
    const messages = [
      role ? `Let’s shape a clear post${roleContext}. Add the location and work arrangement so candidates know what to expect.` : 'Start with a clear role title, location, and work setup. I can guide you through the rest.',
      `Choose a focused set of must-haves${roleContext}. A few relevant skills make it easier for the right people to recognize a fit${skills ? `; you have added ${skills}` : ''}.`,
      `Describe the outcomes and day-to-day work${roleContext}. Use the starter if helpful, then edit it so it sounds like your team.`,
      `Your details are ready for a final look${roleContext}. Save your draft, then create an account to post the job.`
    ];
    guideMessage.textContent = messages[currentStep] || messages[0];
    guideStage.textContent = `${guideStages[currentStep] || guideStages[0]} · STEP ${currentStep + 1} OF ${stepPanels.length}`;
  }

  // Add a lightweight toast for actions that need visible feedback.
  function toast(message, type = 'success') {
    const region = $('#toast-region');
    if (!region) return;
    const item = document.createElement('div');
    item.className = `toast${type === 'error' ? ' error' : ''}`;
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = type === 'error' ? '!' : '✓';
    const text = document.createElement('span');
    text.textContent = message;
    item.append(icon, text);
    region.appendChild(item);
    window.setTimeout(() => {
      item.classList.add('toast-out');
      window.setTimeout(() => item.remove(), 280);
    }, 3600);
  }

  function setStatus(message, type = 'success') {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.style.color = type === 'error' ? '#b12a4b' : '';
    formStatus.style.background = type === 'error' ? '#fff1f4' : '';
    formStatus.style.borderColor = type === 'error' ? '#f5d5de' : '';
  }

  // Header navigation is responsive and can be dismissed with Escape.
  const menuToggle = $('#menu-toggle');
  const primaryNav = $('#primary-nav');
  function closeMenu() {
    if (!menuToggle || !primaryNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    primaryNav.classList.remove('is-open');
  }
  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    primaryNav.classList.toggle('is-open', !isOpen);
  });
  $$('.primary-nav a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (primaryNav?.classList.contains('is-open') && !primaryNav.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });

  // The page search highlights feature cards and section headings that match.
  const searchPanel = $('#search-panel');
  $('#search-toggle')?.addEventListener('click', () => {
    const willOpen = searchPanel?.hidden;
    if (!searchPanel) return;
    searchPanel.hidden = !willOpen;
    $('#search-toggle')?.setAttribute('aria-expanded', String(Boolean(willOpen)));
    $('#search-toggle')?.setAttribute('aria-label', willOpen ? 'Close page search' : 'Open page search');
    if (willOpen) $('#site-search')?.focus();
  });
  function runSearch() {
    const input = $('#site-search');
    const term = input?.value.trim().toLowerCase();
    $$('.search-highlight').forEach((el) => el.classList.remove('search-highlight'));
    if (!term) {
      $('#search-hint').textContent = 'Enter a term to search this page.';
      input?.focus();
      return;
    }
    const candidates = $$('h1, h2, h3, h4, .feature-card, .builder-intro, .hero-description, .feature-card p');
    const matches = candidates.filter((el) => el.textContent.toLowerCase().includes(term));
    if (!matches.length) {
      $('#search-hint').textContent = `No matches found for “${term}”. Try “job”, “skills”, or “AI”.`;
      return;
    }
    const target = matches.find((el) => el.matches('.feature-card, h2, h3')) || matches[0];
    target.classList.add('search-highlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('#search-hint').textContent = `${matches.length} matching item${matches.length === 1 ? '' : 's'} found.`;
  }
  $('#run-search')?.addEventListener('click', runSearch);
  $('#site-search')?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); runSearch(); } });

  // Reveal content only when it is close to the viewport.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.11, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  // Dialogs: demo request and candidate sample profile.
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    const focusTarget = $('input, select, button', modal);
    window.setTimeout(() => focusTarget?.focus(), 50);
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    if (!$$('.modal-backdrop').some((el) => !el.hidden)) document.body.classList.remove('modal-open');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
  }
  $$('[data-open-modal]').forEach((button) => button.addEventListener('click', () => openModal(button.dataset.openModal)));
  $$('[data-close-modal]').forEach((button) => button.addEventListener('click', () => closeModal(button.closest('.modal-backdrop'))));
  $$('.modal-backdrop').forEach((modal) => {
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      $$('.modal-backdrop').filter((modal) => !modal.hidden).forEach(closeModal);
      closeMenu();
      if (searchPanel) searchPanel.hidden = true;
    }
  });
  $('#view-profile')?.addEventListener('click', () => openModal('profile-modal'));
  $('#demo-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    $('#demo-status').textContent = 'Thanks — the sample form is complete. Connect a backend to receive real demo requests.';
    toast('Demo request validated. Connect a backend to send it to your team.');
    form.reset();
  });

  // Candidate card bookmark toggle.
  $('#save-candidate')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const saved = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(saved));
    button.textContent = saved ? '★' : '☆';
    button.setAttribute('aria-label', saved ? 'Unsave sample candidate' : 'Save sample candidate');
    toast(saved ? 'Sample candidate saved for this preview.' : 'Sample candidate removed from saved preview.');
  });

  // Work-mode choices update the hidden value and live preview.
  $$('[data-work-mode]').forEach((button) => button.addEventListener('click', () => {
    $$('[data-work-mode]').forEach((chip) => {
      const selected = chip === button;
      chip.classList.toggle('selected', selected);
      chip.setAttribute('aria-pressed', String(selected));
    });
    field('work-mode').value = button.dataset.workMode;
    updatePreview();
  }));

  // Skill chips: suggestions toggle, and custom skills can be added with Enter.
  function renderSkills() {
    const container = $('#selected-skills');
    if (!container) return;
    container.replaceChildren();
    if (!skillSet.size) {
      const empty = document.createElement('span');
      empty.className = 'skills-empty';
      empty.textContent = 'No skills added yet.';
      container.appendChild(empty);
    } else {
      skillSet.forEach((skill) => {
        const token = document.createElement('span');
        token.className = 'skill-token';
        const name = document.createElement('span');
        name.textContent = skill;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove ${skill}`);
        remove.addEventListener('click', () => {
          skillSet.delete(skill);
          renderSkills();
          updatePreview();
          updateSkillSuggestionState();
        });
        token.append(name, remove);
        container.appendChild(token);
      });
    }
    updateSkillSuggestionState();
    updatePreview();
    updateGuide();
  }
  function updateSkillSuggestionState() {
    $$('[data-skill]').forEach((button) => {
      const selected = skillSet.has(button.dataset.skill);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  function addSkill(value, focusInput = true) {
    const skill = String(value || '').trim().replace(/\s+/g, ' ');
    if (!skill) return;
    if (skill.length > 32) { toast('Please keep each skill under 33 characters.', 'error'); return; }
    const existing = [...skillSet].some((item) => item.toLowerCase() === skill.toLowerCase());
    if (existing) { toast(`${skill} is already in the skill list.`, 'error'); return; }
    if (skillSet.size >= 12) { toast('You can add up to 12 skills to this demo post.', 'error'); return; }
    skillSet.add(skill);
    renderSkills();
    const input = field('skill-input');
    if (input) { input.value = ''; if (focusInput) input.focus(); }
  }
  $$('[data-skill]').forEach((button) => button.addEventListener('click', () => {
    const skill = button.dataset.skill;
    if (skillSet.has(skill)) skillSet.delete(skill); else addSkill(skill, false);
    renderSkills();
  }));
  $('#add-skill')?.addEventListener('click', () => addSkill(getValue('skill-input')));
  $('#skill-input')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); addSkill(getValue('skill-input')); }
  });

  // Live preview updates as the user types.
  function initials(name) {
    return String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'TB';
  }
  function updatePreview() {
    const title = getValue('job-title') || 'Your job title';
    const company = getValue('company-name') || 'Your company';
    const location = getValue('job-location') || 'Location will appear here';
    const employment = getValue('employment-type') || 'Employment type';
    const workMode = getValue('work-mode') || 'Hybrid';
    const experience = getValue('experience');
    const salary = getValue('salary');
    const description = getValue('job-description') || 'Your job description will appear here as you fill in the form. Add a clear overview of the role, its responsibilities, and the kind of person who will thrive.';
    $('#preview-job-title').textContent = title;
    $('#preview-company').textContent = company;
    $('#preview-location').textContent = location;
    $('#preview-logo').textContent = initials(company);
    $('#preview-type').textContent = employment;
    $('#preview-mode').textContent = workMode;
    $('#preview-experience').textContent = experience;
    $('#preview-experience').hidden = !experience;
    $('#preview-salary').textContent = salary;
    $('#preview-salary').hidden = !salary;
    $('#preview-description').textContent = description;
    const skillsContainer = $('#preview-skills');
    skillsContainer.replaceChildren();
    if (!skillSet.size) {
      const placeholder = document.createElement('span');
      placeholder.textContent = 'Skills you add will appear here';
      skillsContainer.appendChild(placeholder);
    } else {
      skillSet.forEach((skill) => {
        const chip = document.createElement('span');
        chip.textContent = skill;
        skillsContainer.appendChild(chip);
      });
    }
    const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
    $('.preview-read-time').textContent = `~ ${Math.max(1, Math.ceil(wordCount / 220))} min read`;
    const statusText = $('#skills-error');
    if (statusText && skillSet.size) statusText.textContent = '';
  }
  $$('input,select,textarea', jobForm).forEach((control) => {
    control.addEventListener('input', () => { updatePreview(); updateGuide(); });
    control.addEventListener('change', () => { updatePreview(); updateGuide(); });
  });
  $('#refresh-preview')?.addEventListener('click', () => { updatePreview(); toast('Live preview refreshed.'); });
  $('#description-count')?.addEventListener('click', () => field('job-description')?.focus());
  field('job-description')?.addEventListener('input', () => { $('#description-count').textContent = String(getValue('job-description').length); });
  $('#build-description')?.addEventListener('click', () => {
    const role = getValue('job-title') || 'team member';
    const company = getValue('company-name') || 'our team';
    const location = getValue('job-location');
    const skills = [...skillSet];
    const skillText = skills.length ? skills.join(', ') : 'relevant experience for the role';
    const arrangement = getValue('work-mode') || 'Hybrid';
    const locationLine = location ? `This role is based in ${location} with a ${arrangement.toLowerCase()} arrangement. ` : '';
    const draft = `We are looking for a ${role} to join ${company}. ${locationLine}In this role, you will collaborate with teammates, solve practical challenges, and deliver thoughtful, high-quality work. The right person brings strengths in ${skillText}, communicates clearly, and takes ownership of shared goals. We welcome applicants who are curious, considerate, and excited to make a measurable contribution.`;
    field('job-description').value = draft;
    $('#description-count').textContent = String(draft.length);
    field('job-description').dispatchEvent(new Event('input', { bubbles: true }));
    field('job-description').focus();
    toast('Starter added. Edit it to reflect your role and team.');
  });

  function clearFieldError(control) {
    if (!control) return;
    control.removeAttribute('aria-invalid');
    const error = document.querySelector(`[data-error-for="${control.id}"]`);
    if (error) error.textContent = '';
  }
  function showFieldError(control, message) {
    control.setAttribute('aria-invalid', 'true');
    const error = document.querySelector(`[data-error-for="${control.id}"]`);
    if (error) error.textContent = message;
  }
  function validateStep(stepIndex) {
    let firstInvalid = null;
    const panel = stepPanels[stepIndex];
    if (!panel) return true;
    $$('input[required],select[required],textarea[required]', panel).forEach((control) => {
      clearFieldError(control);
      const value = control.value.trim();
      let message = '';
      if (!value) message = 'This field is required.';
      else if (control.id === 'job-description' && value.length < 30) message = 'Add at least 30 characters so candidates understand the role.';
      else if (control.type === 'email' && !control.validity.valid) message = 'Enter a valid email address.';
      else if (!control.validity.valid) message = 'Please check this value.';
      if (message) {
        showFieldError(control, message);
        if (!firstInvalid) firstInvalid = control;
      }
    });
    if (stepIndex === 1 && !skillSet.size) {
      $('#skills-error').textContent = 'Add at least one key skill to continue.';
      $('#skill-input').setAttribute('aria-invalid', 'true');
      if (!firstInvalid) firstInvalid = $('#skill-input');
    } else {
      $('#skills-error').textContent = '';
      $('#skill-input').removeAttribute('aria-invalid');
    }
    if (firstInvalid) {
      firstInvalid.focus();
      const ownerPanel = firstInvalid.closest('.form-step');
      ownerPanel?.classList.remove('shake');
      void ownerPanel?.offsetWidth;
      ownerPanel?.classList.add('shake');
      setStatus('Please check the highlighted field(s) before continuing.', 'error');
      return false;
    }
    setStatus('');
    return true;
  }
  function updateStepUi() {
    const stepTabList = stepTabs[0]?.parentElement;
    const progressHeading = $('.progress-heading');
    const progressTrack = $('.progress-track');
    const wizardActions = $('.wizard-actions');
    $('#job-builder-card').classList.toggle('is-advanced', advancedMode);
    $('#guided-mode').classList.toggle('active', !advancedMode);
    $('#guided-mode').setAttribute('aria-pressed', String(!advancedMode));
    $('#advanced-mode').classList.toggle('active', advancedMode);
    $('#advanced-mode').setAttribute('aria-pressed', String(advancedMode));
    if (stepTabList) stepTabList.hidden = advancedMode;
    if (progressHeading) progressHeading.hidden = advancedMode;
    if (progressTrack) progressTrack.hidden = advancedMode;
    if (wizardActions) wizardActions.hidden = advancedMode;
    stepPanels.forEach((panel, index) => {
      const isVisible = advancedMode || index === currentStep;
      panel.hidden = !isVisible;
      panel.classList.toggle('active', isVisible);
    });
    stepTabs.forEach((tab, index) => {
      tab.classList.toggle('active', index === currentStep);
      tab.classList.toggle('completed', index < currentStep);
      tab.setAttribute('aria-selected', String(index === currentStep));
      tab.setAttribute('tabindex', index === currentStep ? '0' : '-1');
    });
    const percent = advancedMode ? 100 : Math.round(((currentStep + 1) / stepPanels.length) * 100);
    progressFill.style.width = `${percent}%`;
    stepCounter.textContent = advancedMode ? 'ALL SECTIONS' : `STEP ${currentStep + 1} OF ${stepPanels.length}`;
    progressPercent.textContent = advancedMode ? 'Everything visible' : `${percent}% complete`;
    updateGuide();
    previousButton.disabled = currentStep === 0;
    previousButton.hidden = advancedMode;
    nextButton.hidden = advancedMode || currentStep === stepPanels.length - 1;
    $('#preview-continue').textContent = advancedMode ? 'Go to final review' : currentStep === stepPanels.length - 1 ? 'Review job details' : 'Continue building';
    if (currentStep === 3 || advancedMode) {
      $('#review-checklist').innerHTML = `<div><span>✓</span> ${getValue('job-title') ? 'Job title added' : 'Job title missing'}</div><div><span>✓</span> ${skillSet.size ? `${skillSet.size} skill${skillSet.size === 1 ? '' : 's'} selected` : 'Skills still needed'}</div><div><span>✓</span> ${getValue('job-description').length >= 30 ? 'Description ready to review' : 'Description needs more detail'}</div>`;
    }
  }
  $('#guided-mode')?.addEventListener('click', () => setFormMode(false));
  $('#advanced-mode')?.addEventListener('click', () => setFormMode(true));
  function setFormMode(advanced) {
    advancedMode = advanced;
    updateStepUi();
  }
  function goToStep(index, { validate = false } = {}) {
    if (index < 0 || index >= stepPanels.length) return;
    if (validate && index > currentStep && !validateStep(currentStep)) return;
    currentStep = index;
    updateStepUi();
    updatePreview();
    if (window.matchMedia('(max-width: 900px)').matches) {
      $('#job-builder-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const heading = $('.form-step-title h4', stepPanels[currentStep]);
    if (heading) heading.setAttribute('tabindex', '-1');
  }
  nextButton.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < stepPanels.length - 1) goToStep(currentStep + 1);
    }
  });
  previousButton.addEventListener('click', () => goToStep(currentStep - 1));
  stepTabs.forEach((tab) => tab.addEventListener('click', () => {
    const requested = Number(tab.dataset.stepTarget);
    if (requested > currentStep) {
      // Keep the wizard sequential so validation errors are always visible.
      if (!validateStep(currentStep)) return;
      if (requested > currentStep + 1) {
        toast('Complete each step in order. You can return to any completed step.');
        goToStep(currentStep + 1);
        return;
      }
    }
    goToStep(requested);
  }));
  $('#start-job')?.addEventListener('click', () => {
    goToStep(0);
    $('#job-title').focus({ preventScroll: true });
    $('#job-builder-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#preview-continue')?.addEventListener('click', () => {
    if (advancedMode) {
      $('#review-checklist').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (currentStep === stepPanels.length - 1) {
      $('#job-builder-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('You are on the review step. Use “Create an account to post” when ready.');
    } else {
      goToStep(currentStep + 1, { validate: true });
    }
  });

  // A draft can be persisted locally on this device. This does not publish it online.
  function collectDraft() {
    const values = {};
    $$('input,select,textarea', jobForm).forEach((control) => {
      if (control.id && control.type !== 'button') values[control.id] = control.value;
    });
    return { values, skills: [...skillSet], savedAt: new Date().toISOString(), currentStep };
  }
  function saveDraft(quiet = false) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(collectDraft()));
      if (!quiet) toast('Draft saved in this browser. It has not been published online.');
      setStatus('Draft saved locally in this browser.');
      return true;
    } catch (error) {
      toast('Draft could not be saved. Your browser may block local storage.', 'error');
      return false;
    }
  }
  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object') return;
      Object.entries(draft.values || {}).forEach(([id, value]) => {
        const control = field(id);
        if (control && typeof value === 'string') control.value = value;
      });
      (Array.isArray(draft.skills) ? draft.skills : []).forEach((skill) => { if (typeof skill === 'string') skillSet.add(skill); });
      if (draft.values?.['work-mode']) {
        $$('[data-work-mode]').forEach((button) => {
          const selected = button.dataset.workMode === draft.values['work-mode'];
          button.classList.toggle('selected', selected);
          button.setAttribute('aria-pressed', String(selected));
        });
      }
      currentStep = Number.isInteger(draft.currentStep) ? Math.max(0, Math.min(3, draft.currentStep)) : 0;
      renderSkills();
      updatePreview();
      updateStepUi();
      if (draft.savedAt) {
        const savedDate = new Date(draft.savedAt);
        if (!Number.isNaN(savedDate.getTime())) $('#save-draft').title = `Draft saved ${savedDate.toLocaleString()}`;
      }
    } catch (error) {
      console.warn('TalentBridge draft could not be restored.', error);
    }
  }
  $('#save-draft')?.addEventListener('click', () => saveDraft());

  function downloadBrief() {
    const title = getValue('job-title') || 'Untitled role';
    const lines = [
      'TALENTBRIDGE AI — JOB BRIEF',
      '========================================',
      `Job title: ${title}`,
      `Company: ${getValue('company-name') || 'Not specified'}`,
      `Location: ${getValue('job-location') || 'Not specified'}`,
      `Employment type: ${getValue('employment-type') || 'Not specified'}`,
      `Work arrangement: ${getValue('work-mode') || 'Not specified'}`,
      `Department: ${getValue('department') || 'Not specified'}`,
      `Experience: ${getValue('experience') || 'Not specified'}`,
      `Seniority: ${getValue('seniority') || 'Not specified'}`,
      `Salary range: ${getValue('salary') || 'Not specified'}`,
      `Openings: ${getValue('openings') || '1'}`,
      `Skills: ${[...skillSet].join(', ') || 'Not specified'}`,
      `Application method: ${getValue('application-method') || 'Not specified'}`,
      `Application URL or email: ${getValue('application-link') || 'Not specified'}`,
      '',
      'JOB DESCRIPTION',
      '----------------------------------------',
      getValue('job-description') || 'Not specified',
      '',
      'Generated by TalentBridge AI front-end demo. This file is not a published job listing.'
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'job-brief'}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Your job brief has been downloaded as a text file.');
  }
  $('#download-brief')?.addEventListener('click', downloadBrief);
  $('#publish-job')?.addEventListener('click', () => {
    // Validate every required step, including drafts restored directly to review.
    for (const index of [0, 1, 2]) {
      if (!validateStep(index)) {
        goToStep(index);
        validateStep(index);
        return;
      }
    }
    if (!saveDraft(true)) return;
    setStatus('Draft saved on this device. Create an account to post this job.');
    toast('Draft saved. Continue by creating an account to post this job.');
    window.location.assign('signup-role.html');
  });

  // Update draft UI and clear validation as fields are corrected.
  $$('input,select,textarea', jobForm).forEach((control) => {
    control.addEventListener('input', () => {
      clearFieldError(control);
      if (control.id === 'skill-input') $('#skills-error').textContent = '';
      if (formStatus.textContent) setStatus('');
    });
  });
  $('#current-year').textContent = String(new Date().getFullYear());

  // Start the experience with a restored local draft, if one exists.
  restoreDraft();
  updatePreview();
  updateStepUi();
})();
