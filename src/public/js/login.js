/**
 * Login Page Interactive Logic
 * Handles password visibility, client-side validation, and demo error state toggle.
 */

document.addEventListener('DOMContentLoaded', () => {
  const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');

  const demoBtn = document.getElementById('toggle-demo-error');
  const emailInput = document.getElementById('email');
  const emailErrIcon = document.getElementById('email-error-icon');
  const emailErrText = document.getElementById('email-error-text');
  const passwordErrText = document.getElementById('password-error-text');
  const generalAlert = document.getElementById('general-alert');
  const loginForm = document.getElementById('login-form');

  // Toggle Password Visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      if (eyeIcon) {
        eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  }

  // Interactive Demo Error State Toggle
  let isDemoErrorActive = false;

  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      isDemoErrorActive = !isDemoErrorActive;

      if (isDemoErrorActive) {
        demoBtn.textContent = 'Sembunyikan Error State';
        demoBtn.classList.replace('bg-indigo-600/20', 'bg-rose-600/20');
        demoBtn.classList.replace('text-indigo-300', 'text-rose-300');

        if (emailInput) {
          emailInput.classList.remove('border-slate-700/80', 'focus:border-indigo-500', 'focus:ring-indigo-500/20');
          emailInput.classList.add('border-rose-500', 'focus:border-rose-500', 'ring-2', 'ring-rose-500/20');
        }
        if (emailErrIcon) emailErrIcon.classList.remove('hidden');
        if (emailErrText) emailErrText.classList.remove('hidden');

        if (passwordInput) {
          passwordInput.classList.remove('border-slate-700/80', 'focus:border-indigo-500', 'focus:ring-indigo-500/20');
          passwordInput.classList.add('border-rose-500', 'focus:border-rose-500', 'ring-2', 'ring-rose-500/20');
        }
        if (passwordErrText) passwordErrText.classList.remove('hidden');

        if (generalAlert) generalAlert.classList.remove('hidden');
      } else {
        demoBtn.textContent = 'Tampilkan Error State';
        demoBtn.classList.replace('bg-rose-600/20', 'bg-indigo-600/20');
        demoBtn.classList.replace('text-rose-300', 'text-indigo-300');

        if (emailInput) {
          emailInput.classList.remove('border-rose-500', 'focus:border-rose-500', 'ring-2', 'ring-rose-500/20');
          emailInput.classList.add('border-slate-700/80', 'focus:border-indigo-500', 'focus:ring-indigo-500/20');
        }
        if (emailErrIcon) emailErrIcon.classList.add('hidden');
        if (emailErrText) emailErrText.classList.add('hidden');

        if (passwordInput) {
          passwordInput.classList.remove('border-rose-500', 'focus:border-rose-500', 'ring-2', 'ring-rose-500/20');
          passwordInput.classList.add('border-slate-700/80', 'focus:border-indigo-500', 'focus:ring-indigo-500/20');
        }
        if (passwordErrText) passwordErrText.classList.add('hidden');

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
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      let hasError = false;

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

      if (hasError) {
        if (!isDemoErrorActive && generalAlert) {
          generalAlert.classList.remove('hidden');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  }
});
