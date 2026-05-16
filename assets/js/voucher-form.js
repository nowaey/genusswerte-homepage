/* =========================================================
   VOUCHER-FORM.JS — Genusswerte Bonn
   Form validation · Formspree submit · Success/error handling
   ========================================================= */

(function () {
  'use strict';

  var form        = document.getElementById('gutschein-form');
  var successEl   = document.getElementById('form-success');
  var errorEl     = document.getElementById('form-error');

  if (!form) return;

  /* --- Set minimum date on all date inputs to today ------ */
  function initDateInputs() {
    var today = new Date().toISOString().split('T')[0];
    form.querySelectorAll('input[type="date"]').forEach(function (input) {
      input.setAttribute('min', today);
    });
  }

  /* --- Validate required fields -------------------------- */
  function validate() {
    var valid = true;
    var firstInvalid = null;

    form.querySelectorAll('[required]').forEach(function (field) {
      field.classList.remove('is-invalid');
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    // E-mail format check
    var emailField = form.querySelector('#email');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.classList.add('is-invalid');
      valid = false;
      if (!firstInvalid) firstInvalid = emailField;
    }

    if (firstInvalid) {
      firstInvalid.focus();
    }

    return valid;
  }

  /* --- Submit via Formspree (fetch) ---------------------- */
  function submitForm(e) {
    e.preventDefault();

    // Hide previous messages
    if (errorEl) { errorEl.style.display = 'none'; }

    if (!validate()) {
      if (errorEl) {
        errorEl.textContent = 'Bitte fülle alle Pflichtfelder aus.';
        errorEl.style.display = 'block';
      }
      return;
    }

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Anfrage wird gesendet …';
    }

    var data = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (response) {
      if (response.ok) {
        showSuccess();
      } else {
        response.json().then(function (json) {
          showError(json.errors
            ? json.errors.map(function (e) { return e.message; }).join(', ')
            : 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
        }).catch(function () {
          showError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
        });
      }
    })
    .catch(function () {
      showError('Keine Verbindung. Bitte prüfe Deine Internetverbindung und versuche es erneut.');
    })
    .finally(function () {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Wunschtermin anfragen';
      }
    });
  }

  function showSuccess() {
    form.style.display = 'none';
    if (successEl) {
      successEl.classList.add('is-visible');
      successEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* --- Remove invalid state on user input ---------------- */
  function initLiveValidation() {
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.value.trim()) {
          field.classList.remove('is-invalid');
        }
      });
      field.addEventListener('change', function () {
        if (field.value.trim()) {
          field.classList.remove('is-invalid');
        }
      });
    });
  }

  /* --- Init --------------------------------------------- */
  function init() {
    initDateInputs();
    initLiveValidation();
    form.addEventListener('submit', submitForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
