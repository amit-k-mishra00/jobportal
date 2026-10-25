document.addEventListener("DOMContentLoaded", () => {
  const announce = (form, message) => {
    let status = form.nextElementSibling;
    if (!status || !status.matches("[data-auth-status]")) {
      status = document.createElement("p");
      status.dataset.authStatus = "";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      form.insertAdjacentElement("afterend", status);
    }
    status.textContent = message;
  };

  document.querySelectorAll('form[action="#"]').forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const password = form.querySelector('input[name="password"]');
      announce(form, password
        ? "Your details are valid, but sign-in is not connected to an account service yet."
        : "Your email is valid. Password reset email delivery is not connected yet, so no email was sent.");
    });
  });

  document.querySelectorAll(".social-btn").forEach(button => {
    button.addEventListener("click", () => {
      const provider = button.getAttribute("aria-label")?.replace(/^(Continue with|Sign up with)\s*/i, "") || "This provider";
      window.alert(`${provider} authentication is not connected yet.`);
    });
  });
});