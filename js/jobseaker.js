(() => {
  "use strict";

  const savedKey = "talentbridge.jobseeker.saved.v1";
  const form = document.getElementById("search-form");
  const titleInput = document.getElementById("title");
  const locationInput = document.getElementById("location");
  const grid = document.getElementById("job-grid");
  const emptyMessage = document.getElementById("empty");
  const status = document.getElementById("interaction-status");
  const viewAll = document.getElementById("view-all-jobs");
  if (!form || !grid || !status || !emptyMessage) return;

  const cards = Array.from(grid.querySelectorAll(".card"));
  const normalize = value => String(value || "").trim().toLocaleLowerCase();
  const jobKey = card => card.dataset.legacyKey || card.dataset.jobId ||
    (normalize(card.querySelector(".job-name h3")?.textContent) + "@" +
     normalize(card.querySelector(".job-name p")?.textContent));

  function readSavedJobs() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(savedKey) || "[]");
      return new Set(Array.isArray(stored) ? stored.filter(value => typeof value === "string") : []);
    } catch (_) {
      return new Set();
    }
  }

  let savedJobs = readSavedJobs();

  function setBookmarkState(button, card, saved) {
    const title = card.querySelector(".job-name h3")?.textContent.trim() || "Job";
    const company = card.querySelector(".job-name p")?.textContent.trim() || "company";
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", (saved ? "Remove saved " : "Save ") + title + " at " + company);
    button.title = saved ? "Remove from saved jobs" : "Save this job";
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"></path></svg>';
    button.classList.toggle("saved", saved);
  }

  function applyFilters({ announce = true } = {}) {
    const query = normalize(titleInput?.value);
    const location = normalize(locationInput?.value);
    let count = 0;

    cards.forEach(card => {
      const searchable = normalize(card.dataset.title || card.textContent);
      const jobLocation = normalize(card.dataset.location);
      const matches = searchable.includes(query) && jobLocation.includes(location);
      card.hidden = !matches;
      if (matches) count += 1;
    });

    emptyMessage.hidden = count !== 0;
    if (announce) {
      status.textContent = count
        ? count + (count === 1 ? " opportunity matches" : " opportunities match") + " your search."
        : "No matches yet. Try a different title, skill, or location.";
    }
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    applyFilters();
  });

  viewAll?.addEventListener("click", () => {
    if (titleInput) titleInput.value = "";
    if (locationInput) locationInput.value = "";
    applyFilters({ announce: false });
    status.textContent = "Showing all " + cards.length + " sample jobs. Choose a role that feels right for you.";
  });

  cards.forEach(card => {
    const button = card.querySelector(".bookmark");
    if (!button) return;
    const key = jobKey(card);
    setBookmarkState(button, card, savedJobs.has(key));

    button.addEventListener("click", () => {
      const saved = !savedJobs.has(key);
      if (saved) savedJobs.add(key);
      else savedJobs.delete(key);

      let persisted = true;
      try {
        window.localStorage.setItem(savedKey, JSON.stringify(Array.from(savedJobs)));
      } catch (_) {
        persisted = false;
      }
      setBookmarkState(button, card, saved);
      const title = card.querySelector(".job-name h3")?.textContent.trim() || "This job";
      status.textContent = title + (saved ? " saved to your list." : " removed from your saved jobs.") +
        (persisted && saved ? " You can come back to it on this device." : "");
    });
  });

  window.addEventListener("storage", event => {
    if (event.key !== savedKey) return;
    savedJobs = readSavedJobs();
    cards.forEach(card => {
      const button = card.querySelector(".bookmark");
      if (button) setBookmarkState(button, card, savedJobs.has(jobKey(card)));
    });
  });
})();