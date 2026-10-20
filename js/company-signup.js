
const form = document.getElementById("companySignupForm");

if (form) {
  const password = form.querySelector("#password");
  const confirmPassword = form.querySelector("#confirmPassword");
  const message = form.querySelector("#passwordMessage");
  const strengthLabel = form.querySelector(".strength-label");
  const bars = form.querySelectorAll(".strength-meter span");
  const rules = form.querySelectorAll("[data-rule]");

  const checks = {
    length: value => value.length >= 8,
    upper: value => /[A-Z]/.test(value),
    lower: value => /[a-z]/.test(value),
    number: value => /[0-9]/.test(value),
    special: value => /[^A-Za-z0-9]/.test(value)
  };

  function updatePasswordStrength() {
    const value = password.value;
    let score = 0;

    rules.forEach(rule => {
      const passed = checks[rule.dataset.rule](value);
      rule.classList.toggle("valid", passed);
      if (passed) score++;
    });

    const strength = !value ? "Enter password"
      : score <= 2 ? "Weak"
      : score === 3 ? "Fair"
      : score === 4 ? "Good"
      : "Strong";

    strengthLabel.textContent = strength;

    const colors = {
      Weak: "#dc3545",
      Fair: "#f59e0b",
      Good: "#1674e8",
      Strong: "#078e83"
    };

    bars.forEach((bar, index) => {
      bar.style.background =
        value && index < score
          ? colors[strength]
          : "#d7deea";
    });
  }

  password.addEventListener("input", updatePasswordStrength);

  form.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector("input");
      const showing = input.type === "text";

      input.type = showing ? "password" : "text";
      button.textContent = showing ? "Show" : "Hide";
      button.setAttribute(
        "aria-label",
        showing ? "Show password" : "Hide password"
      );
    });
  });

  confirmPassword.addEventListener("input", () => {
    message.textContent =
      confirmPassword.value && confirmPassword.value !== password.value
        ? "Passwords do not match."
        : "";
  });

  form.addEventListener("submit", event => {
    if (password.value !== confirmPassword.value) {
      event.preventDefault();
      message.textContent = "Passwords do not match.";
      confirmPassword.focus();
      return;
    }

    // Connect this form to your Django registration endpoint
    // before using it to create real accounts.
    event.preventDefault();
    alert("The form is ready for Django integration.");
  });
}
