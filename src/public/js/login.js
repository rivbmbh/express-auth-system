document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("login-form");
  const generalAlert = document.getElementById("general-alert");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eye-icon");
  const ERROR_CLASSES = ["border-rose-500", "ring-2", "ring-rose-500/20"];

  // --- lihat password ---
  togglePasswordBtn?.addEventListener("click", () => {
    const isPassword = passwordInput.getAttribute("type") === "password";
    passwordInput.setAttribute("type", isPassword ? "text" : "password");
    eyeIcon?.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
    if (typeof lucide !== "undefined") lucide.createIcons();
  });

  // --- tampilkan error umum ---
  function showGeneralError(message) {
    generalAlert.textContent = message || "Terjadi kesalahan pada server";
    generalAlert.classList.remove("hidden");
  }

  // --- tampilkan error input ---
  function setFieldError(field, message) {
    const input = document.getElementById(field);
    const text = document.querySelector(`#${field}-error-text span`);
    const icon = document.getElementById(`${field}-error-icon`);
    if (!input || !text) return false; //input tidak ditemukan

    text.textContent = message;
    text.parentElement.classList.replace("hidden", "flex");
    icon?.classList.remove("hidden");
    input.classList.add(...ERROR_CLASSES);
    return true;
  }

  // --- hapus error sebelumnya ---
  function clearFieldError(field) {
    const input = document.getElementById(field);
    const icon = document.getElementById(`${field}-error-icon`);
    const text = document.getElementById(`${field}-error-text`);

    text?.classList.replace("flex", "hidden");
    icon?.classList.add("hidden");
    input?.classList.remove(...ERROR_CLASSES);
  }

  // --- hapus error saat mengetik ---
  formLogin?.addEventListener("input", (e) => {
    if (e.target.id) clearFieldError(e.target.id);
  });

  // --- kirim request API ---
  async function sendLoginRequest(form) {
    generalAlert.classList.add("hidden");
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        const fieldErrors = Object.entries(result.errors || {});
        const unhandled = fieldErrors.filter(
          ([field, message]) => !setFieldError(field, message),
        );
        if (!fieldErrors.length || unhandled.length) {
          showGeneralError(result.messageError);
        }
        return;
      }
      form.reset();
      window.location.href = result.redirecTo || "/dashboard";
    } catch (err) {
      console.error("Error sending data: ", err);
      showGeneralError(
        "Tidak dapat terhubung ke server. Silahkan coba lagi nanti.",
      );
    }
  }

  // --- ketika form di submit ---
  formLogin?.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("submit form");
    await sendLoginRequest(formLogin);
  });
});
