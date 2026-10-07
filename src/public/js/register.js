/**
 * Register Page Interactive Logic
 * Handles password visibility toggles, client-side validation, and demo error state toggle.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Password Visibility Toggle Utility
  const setupEyeToggle = (btnId, inputId, iconId) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (btn && input) {
      btn.addEventListener('click', () => {
        const isPass = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPass ? 'text' : 'password');
        if (icon) {
          icon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      });
    }
  };

  setupEyeToggle('toggle-password', 'password', 'eye-icon-1');
  setupEyeToggle('toggle-password-confirm', 'passwordConfirmation', 'eye-icon-2');

  // DOM Elements
  const demoBtn = document.getElementById('toggle-demo-error');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('passwordConfirmation');

  const usernameErrIcon = document.getElementById('username-error-icon');
  const usernameErrText = document.getElementById('username-error-text');
  const emailErrIcon = document.getElementById('email-error-icon');
  const emailErrText = document.getElementById('email-error-text');
  const passwordErrText = document.getElementById('password-error-text');
  const confirmErrText = document.getElementById('confirm-error-text');
  const generalAlert = document.getElementById('general-alert');
  const registerForm = document.getElementById('register-form');

  let isDemoErrorActive = false;

  // Demo Error State Toggle
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      isDemoErrorActive = !isDemoErrorActive;
      const inputs = [usernameInput, emailInput, passwordInput, confirmInput];
      const errorTexts = [usernameErrText, emailErrText, passwordErrText, confirmErrText];

      if (isDemoErrorActive) {
        demoBtn.textContent = 'Sembunyikan Error State';
        demoBtn.classList.replace('bg-indigo-600/20', 'bg-rose-600/20');
        demoBtn.classList.replace('text-indigo-300', 'text-rose-300');

        inputs.forEach(inp => {
          if (inp) {
            inp.classList.remove('border-slate-700/80', 'focus:border-indigo-500', 'focus:ring-indigo-500/20');
            inp.classList.add('border-rose-500', 'focus:border-rose-500', 'ring-2', 'ring-rose-500/20');
          }
        });

        errorTexts.forEach(txt => { if (txt) txt.classList.remove('hidden'); });
        if (usernameErrIcon) usernameErrIcon.classList.remove('hidden');
        if (emailErrIcon) emailErrIcon.classList.remove('hidden');
        if (generalAlert) generalAlert.classList.remove('hidden');

      } else {
        demoBtn.textContent = 'Tampilkan Error State';
        demoBtn.classList.replace('bg-rose-600/20', 'bg-indigo-600/20');
        demoBtn.classList.replace('text-rose-300', 'text-indigo-300');

        inputs.forEach(inp => {
          if (inp) {
            inp.classList.remove('border-rose-500', 'focus:border-rose-500', 'ring-2', 'ring-rose-500/20');
            inp.classList.add('border-slate-700/80', 'focus:border-indigo-500', 'focus:ring-indigo-500/20');
          }
        });

        errorTexts.forEach(txt => { if (txt) txt.classList.add('hidden'); });
        if (usernameErrIcon) usernameErrIcon.classList.add('hidden');
        if (emailErrIcon) emailErrIcon.classList.add('hidden');

        // Check dataset server error status before hiding general alert
        const hasServerError = generalAlert?.dataset?.serverError === 'true';
        if (generalAlert && !hasServerError) {
          generalAlert.classList.add('hidden');
        }
      }

      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  // Client-side quick validation on form submission
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      let hasError = false;

      if (usernameInput && (!usernameInput.value.trim() || usernameInput.value.length < 3)) {
        usernameInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-500/20');
        if (usernameErrText) usernameErrText.classList.remove('hidden');
        if (usernameErrIcon) usernameErrIcon.classList.remove('hidden');
        hasError = true;
      }

      if (emailInput && (!emailInput.value.trim() || !emailInput.value.includes('@'))) {
        emailInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-500/20');
        if (emailErrText) emailErrText.classList.remove('hidden');
        if (emailErrIcon) emailErrIcon.classList.remove('hidden');
        hasError = true;
      }

      if (passwordInput && (!passwordInput.value || passwordInput.value.length < 8)) {
        passwordInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-500/20');
        if (passwordErrText) passwordErrText.classList.remove('hidden');
        hasError = true;
      }

      if (confirmInput && (confirmInput.value !== passwordInput?.value || !confirmInput.value)) {
        confirmInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-500/20');
        if (confirmErrText) confirmErrText.classList.remove('hidden');
        hasError = true;
      }

      if (hasError) {
        if (!isDemoErrorActive && generalAlert) {
          generalAlert.classList.remove('hidden');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  }
});
