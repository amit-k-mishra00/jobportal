(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

  const revealSelector = [
    "main > section",
    "body > section",
    ".main-content > section",
    ".employee-section"
  ].join(", ");
  const skipSelector = ".hero, .hero-section, .employee-hero, .pricing-hero, .ov-hero";
  const revealTargets = Array.from(document.querySelectorAll(revealSelector));
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      activeObserver.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -36px 0px",
    threshold: 0.08
  });

  let revealIndex = 0;
  revealTargets.forEach((target) => {
    if (target.matches(skipSelector)) return;
    if (window.getComputedStyle(target).animationName !== "none") return;

    target.classList.add("motion-reveal");
    const top = target.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.88) {
      target.classList.add("is-visible");
    } else {
      const delay = Math.min(revealIndex * 70, 280);
      target.style.setProperty("--motion-delay", delay + "ms");
      observer.observe(target);
    }
    revealIndex += 1;
  });

  document.querySelectorAll("button:not(.menu-toggle), a.button, .button").forEach((control) => {
    control.classList.add("motion-interactive");
  });
})();