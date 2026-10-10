/**
 * Register Page Interactive Logic
 * Handles password visibility toggles, client-side validation, and demo error state toggle.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Password Visibility Toggle Utility
  const setupEyeToggle = (btnId, inputId, iconId) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (btn && input) {
      btn.addEventListener("click", () => {
        const isPass = input.getAttribute("type") === "password";
        input.setAttribute("type", isPass ? "text" : "password");
        if (icon) {
          icon.setAttribute("data-lucide", isPass ? "eye-off" : "eye");
          if (typeof lucide !== "undefined") lucide.createIcons();
        }
      });
    }
  };

  setupEyeToggle("toggle-password", "password", "eye-icon-1");
  setupEyeToggle(
    "toggle-password-confirm",
    "passwordConfirmation",
    "eye-icon-2",
  );

  // DOM Elements
  const generalAlert = document.getElementById("general-alert");
  const registerForm = document.getElementById("register-form");

  function showErrorInputs(input, errorText) {
    console.log(`showErrorInputs called for ${input} with error: ${errorText}`);
    const errorElement = document.querySelector(`#${input}-error-text span`);
    const errorElementIcon = document.getElementById(`${input}-error-icon`);
    const inputElement = document.getElementById(input);
    let hasError = false;

    if (errorElement) {
      errorElement.textContent = errorText;
      errorElement.parentElement.classList.remove("hidden");
      errorElement.parentElement.classList.add("flex");

      hasError = true;
    }
    if (inputElement) {
      inputElement.classList.add(
        "border-rose-500",
        "ring-2",
        "ring-rose-500/20",
      );
      hasError = true;
    }
    if (errorElementIcon) {
      errorElementIcon.classList.remove("hidden");
      hasError = true;
    }
    return hasError;
  }

  function showGeneralError(message) {
    generalAlert.classList.remove("hidden");
    generalAlert.textContent = message || "Terjadi kesalahan pada server";
  }

  async function sendData(form) {
    generalAlert.classList.add("hidden"); // Hide general alert before sending data
    const payload = Object.fromEntries(new FormData(form).entries()); // Convert form data to an object
    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          for (const [field, messageError] of Object.entries(result.errors)) {
            const hasError = showErrorInputs(field, messageError);
            if (!hasError && generalAlert) {
              showGeneralError(
                result.message || "Terjadi kesalahan pada server",
              );
            }
          }
        } else if (generalAlert) {
          showGeneralError(result.message || "Terjadi kesalahan pada server");
        }
        return; // Exit the function after handling errors
      }

      form.reset(); // Reset the form if no errors
      window.location.href = result.redirectTo || "/login"; // Redirect to the specified URL or default to /login
    } catch (err) {
      console.error("Error sending data:", err.message);
      showGeneralError("Tidak dapat terhubung ke server. Silakan coba lagi");
    }
  }

  //cek apakah form register ada sebelum menambahkan event listener
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault(); //mencegah form submit default behavior
      await sendData(registerForm);
    });
  }
});
