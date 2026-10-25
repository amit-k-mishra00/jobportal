document.addEventListener("DOMContentLoaded", () => {
  const successTrack = document.getElementById("successStoriesTrack");
  const successDots = document.getElementById("successCarouselDots");
  const successPrev = document.querySelector(".success-prev");
  const successNext = document.querySelector(".success-next");

  if (successTrack && successDots && successPrev && successNext) {
    const successCards = Array.from(successTrack.querySelectorAll(".success-story-card"));
    let successCurrentIndex = 0;

    const cardsPerPage = () => {
      if (window.matchMedia("(max-width: 600px)").matches) return 1;
      if (window.matchMedia("(max-width: 1100px)").matches) return 2;
      return 3;
    };
    const maxStartIndex = () => Math.max(0, successCards.length - cardsPerPage());
    const pageStarts = () => {
      const lastStart = maxStartIndex();
      const step = cardsPerPage();
      const starts = [];
      for (let index = 0; index <= lastStart; index += step) starts.push(index);
      if (starts[starts.length - 1] !== lastStart) starts.push(lastStart);
      return starts;
    };
    const cardScrollLeft = index => successCards[index].offsetLeft - successTrack.offsetLeft;
    const nearestCardIndex = () => {
      let nearest = 0;
      let nearestDistance = Infinity;
      successCards.forEach((card, index) => {
        const distance = Math.abs(cardScrollLeft(index) - successTrack.scrollLeft);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });
      return nearest;
    };
    const currentPageIndex = starts => {
      let pageIndex = 0;
      starts.forEach((start, index) => {
        if (start <= successCurrentIndex) pageIndex = index;
      });
      return pageIndex;
    };
    const updateSuccessControls = (readTrackPosition = true) => {
      if (!successCards.length) {
        successPrev.disabled = true;
        successNext.disabled = true;
        return;
      }
      if (readTrackPosition) successCurrentIndex = nearestCardIndex();
      const activePage = currentPageIndex(pageStarts());
      successDots.querySelectorAll(".success-dot").forEach((dot, index) => {
        const isActive = index === activePage;
        dot.classList.toggle("active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };
    const goToSuccessCard = index => {
      if (!successCards.length) return;
      successCurrentIndex = Math.max(0, Math.min(index, maxStartIndex()));
      successTrack.scrollTo({
        left: cardScrollLeft(successCurrentIndex),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
      updateSuccessControls(false);
    };
    const renderSuccessDots = () => {
      successDots.replaceChildren();
      pageStarts().forEach((start, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "success-dot";
        dot.setAttribute("aria-label", "Show success stories page " + (index + 1));
        dot.setAttribute("aria-current", "false");
        dot.addEventListener("click", () => goToSuccessCard(start));
        successDots.appendChild(dot);
      });
      updateSuccessControls();
    };
    const moveSuccessPage = direction => {
      const starts = pageStarts();
      if (!starts.length) return;
      const page = currentPageIndex(starts);
      const nextPage = (page + direction + starts.length) % starts.length;
      goToSuccessCard(starts[nextPage]);
    };

    successPrev.addEventListener("click", () => moveSuccessPage(-1));
    successNext.addEventListener("click", () => moveSuccessPage(1));
    successTrack.addEventListener("scroll", () => window.requestAnimationFrame(updateSuccessControls), { passive: true });
    window.addEventListener("resize", () => {
      successCurrentIndex = Math.min(successCurrentIndex, maxStartIndex());
      renderSuccessDots();
      goToSuccessCard(successCurrentIndex);
    });
    renderSuccessDots();
  }

  const feedback = document.createElement("div");
  feedback.className = "site-feedback";
  feedback.id = "site-feedback";
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  document.body.appendChild(feedback);
  let feedbackTimer = 0;
  const announce = message => {
    feedback.textContent = message;
    feedback.classList.add("is-visible");
    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => feedback.classList.remove("is-visible"), 2800);
  };

  const preview = document.createElement("dialog");
  preview.className = "candidate-preview";
  preview.setAttribute("aria-labelledby", "candidate-preview-title");
  preview.innerHTML =
    '<div class="candidate-preview-content">' +
      '<span class="candidate-preview-kicker">CANDIDATE PROFILE</span>' +
      '<h2 id="candidate-preview-title"></h2>' +
      '<p class="candidate-preview-details"></p>' +
      '<p class="candidate-preview-note">This is a sample profile preview.</p>' +
      '<button class="candidate-preview-close" type="button">Close</button>' +
    '</div>';
  document.body.appendChild(preview);
  preview.querySelector(".candidate-preview-close").addEventListener("click", () => preview.close());
  preview.addEventListener("click", event => {
    if (event.target === preview) preview.close();
  });

  document.querySelectorAll(".btn-profile-link").forEach(button => {
    button.addEventListener("click", () => {
      const row = button.closest(".applicant-row");
      if (!row) return;
      preview.querySelector("#candidate-preview-title").textContent =
        row.querySelector(".applicant-name")?.textContent || "Candidate";
      preview.querySelector(".candidate-preview-details").textContent =
        row.querySelector(".applicant-skills")?.textContent || "Profile details are not available.";
      preview.showModal();
    });
  });

  const shortlistKey = "talentbridge.landing.shortlist.v1";
  let shortlist = new Set();
  try {
    const stored = JSON.parse(window.localStorage.getItem(shortlistKey) || "[]");
    if (Array.isArray(stored)) shortlist = new Set(stored.filter(value => typeof value === "string"));
  } catch (_) {
    shortlist = new Set();
  }

  const updateShortlistButton = (button, row, saved) => {
    const name = row.querySelector(".applicant-name")?.textContent?.trim() || "Candidate";
    row.dataset.shortlisted = String(saved);
    row.classList.toggle("is-shortlisted", saved);
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", saved ? "Remove " + name + " from shortlist" : "Shortlist " + name);
    button.title = saved ? "Remove from shortlist" : "Add to shortlist";
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"></path></svg>';
  };

  document.querySelectorAll(".btn-menu-dots").forEach(button => {
    const row = button.closest(".applicant-row");
    if (!row) return;
    const name = row.querySelector(".applicant-name")?.textContent?.trim() || "Candidate";
    const key = name.toLocaleLowerCase();
    updateShortlistButton(button, row, shortlist.has(key));
    button.addEventListener("click", () => {
      const saved = row.dataset.shortlisted !== "true";
      if (saved) shortlist.add(key);
      else shortlist.delete(key);
      let persisted = true;
      try {
        window.localStorage.setItem(shortlistKey, JSON.stringify(Array.from(shortlist)));
      } catch (_) {
        persisted = false;
      }
      updateShortlistButton(button, row, saved);
      announce(name + (saved ? " added to your shortlist." : " removed from your shortlist.") +
        (persisted ? " Saved on this device." : ""));
    });
  });

  document.querySelectorAll(".faq-item").forEach(item => {
    const questionButton = item.querySelector(".faq-question");
    if (!questionButton) return;
    questionButton.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach(otherItem => {
        if (otherItem === item) return;
        otherItem.classList.remove("active");
        otherItem.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
      });
      item.classList.toggle("active", !isActive);
      questionButton.setAttribute("aria-expanded", String(!isActive));
    });
  });
});