(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileNavigation = window.matchMedia("(max-width: 760px)");

  document.querySelectorAll(".navbar .nav-container").forEach((container, index) => {
    const nav = container.querySelector(".nav-links");
    if (!nav) return;

    if (!nav.id) nav.id = "site-navigation-" + (index + 1);
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-menu-toggle";
    toggle.setAttribute("aria-controls", nav.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
    container.insertBefore(toggle, nav);
    container.closest(".navbar")?.classList.add("has-mobile-menu");

    const setMenuOpen = (open, returnFocus = false) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      if (!open && returnFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
      setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", event => {
      if (event.target.closest("a") && mobileNavigation.matches) setMenuOpen(false);
    });
    document.addEventListener("click", event => {
      if (!container.contains(event.target) && mobileNavigation.matches) setMenuOpen(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false, true);
      }
    });
    mobileNavigation.addEventListener?.("change", event => {
      if (!event.matches) setMenuOpen(false);
    });
  });

  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    const revealSelector = [
      "main > section",
      "body > section",
      ".main-content > section",
      ".employee-section"
    ].join(", ");
    const skipSelector = ".hero, .hero-section, .employee-hero, .pricing-hero, .ov-hero";
    const revealTargets = Array.from(document.querySelectorAll(revealSelector));
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -36px 0px", threshold: 0.08 });

    let revealIndex = 0;
    revealTargets.forEach(target => {
      if (target.matches(skipSelector)) return;
      if (window.getComputedStyle(target).animationName !== "none") return;

      target.classList.add("motion-reveal");
      if (target.getBoundingClientRect().top < window.innerHeight * 0.88) {
        target.classList.add("is-visible");
      } else {
        target.style.setProperty("--motion-delay", Math.min(revealIndex * 70, 280) + "ms");
        observer.observe(target);
      }
      revealIndex += 1;
    });
  }

  document.querySelectorAll(
    "button:not(.menu-toggle):not(.menu):not(.nav-menu-toggle), a.button, .button, .btn, .role-button, .plan-button, .auth-btn"
  ).forEach(control => control.classList.add("motion-interactive"));
})();