/* =========================================================
   VOUCHER-FORM.JS — Genusswerte Bonn
   3-Schritt Gutschein-Einlösung via Edge Functions:
   1. validate-voucher  → Code prüfen
   2. get-available-slots → Termine laden & wählen
   3. schedule-voucher  → Termin verbindlich buchen
   ========================================================= */

(function () {
  'use strict';

  /* --- Konfiguration ------------------------------------- */
  var ERROR_MESSAGES = {
    VOUCHER_NOT_FOUND:        'Dieser Code ist uns nicht bekannt. Bitte prüfe die Schreibweise.',
    VOUCHER_NOT_ACTIVE:       'Dieser Gutschein ist nicht mehr aktiv.',
    VOUCHER_EXPIRED:          'Dieser Gutschein ist leider abgelaufen.',
    VOUCHER_ALREADY_RESERVED: 'Für diesen Gutschein ist bereits ein Termin reserviert.',
    SLOT_NO_CAPACITY:         'Dieser Termin ist leider gerade ausgebucht worden. Bitte wähle einen anderen.',
    SLOT_NOT_FOUND:           'Der gewählte Termin wurde nicht gefunden. Bitte wähle einen anderen.',
    INVALID_VOUCHER_CODE:     'Bitte gib einen gültigen Gutscheincode ein.'
  };

  /* --- State --------------------------------------------- */
  var state = {
    code:       null,
    tastingName: null,
    persons:    null,
    slotId:     null,
    slotLabel:  null
  };

  /* --- DOM-Referenzen ------------------------------------ */
  var step1       = document.getElementById('step-1');
  var step2       = document.getElementById('step-2');
  var step3       = document.getElementById('step-3');
  var successEl   = document.getElementById('form-success');

  // Schritt 1
  var codeInput   = document.getElementById('gutschein-code');
  var btnValidate = document.getElementById('btn-validate');
  var validateErr = document.getElementById('validate-error');

  // Schritt 2
  var slotsEl     = document.getElementById('slots-list');
  var slotsErr    = document.getElementById('slots-error');
  var voucherInfo = document.getElementById('voucher-info');

  // Schritt 3
  var scheduleForm  = document.getElementById('schedule-form');
  var scheduleErr   = document.getElementById('schedule-error');
  var chosenSlotEl  = document.getElementById('chosen-slot-info');
  var successBody   = document.getElementById('success-body');

  // Früh abbrechen falls Seite kein Einlöse-Flow hat
  if (!btnValidate) return;

  /* --- Hilfsfunktionen ----------------------------------- */
  function apiBase() {
    return (window.GW_CONFIG && window.GW_CONFIG.apiBase) || '';
  }

  function errMsg(code) {
    return ERROR_MESSAGES[code] || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
  }

  function showErr(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  }

  function hideErr(el) {
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  function setBusy(btn, busy, idleText) {
    btn.disabled = busy;
    btn.textContent = busy ? 'Bitte warten …' : idleText;
  }

  function goTo(from, to) {
    if (from) from.hidden = true;
    if (to)   to.hidden   = false;
    if (to)   to.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function formatDate(dateStr) {
    var p = dateStr.split('-');
    if (p.length !== 3) return dateStr;
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    return d.toLocaleDateString('de-DE', {
      weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  /* =========================================================
     SCHRITT 1 — validate-voucher
     ========================================================= */
  if (codeInput) {
    // Automatisch GROSSSCHREIBEN beim Tippen
    codeInput.addEventListener('input', function () {
      var pos = codeInput.selectionStart;
      codeInput.value = codeInput.value.toUpperCase();
      try { codeInput.setSelectionRange(pos, pos); } catch (e) {}
    });
    // Enter-Taste
    codeInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); btnValidate.click(); }
    });
  }

  btnValidate.addEventListener('click', function () {
    var code = codeInput ? codeInput.value.trim().toUpperCase() : '';
    hideErr(validateErr);

    if (!code) {
      showErr(validateErr, 'Bitte gib deinen Gutscheincode ein.');
      if (codeInput) codeInput.focus();
      return;
    }

    setBusy(btnValidate, true, 'Gutschein prüfen');

    fetch(apiBase() + '/validate-voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voucher_code: code })
    })
    .then(function (res) {
      return res.json().then(function (d) { return { ok: res.ok, data: d }; });
    })
    .then(function (result) {
      setBusy(btnValidate, false, 'Gutschein prüfen');

      if (result.ok && result.data.valid) {
        state.code        = code;
        state.tastingName = result.data.tasting_name || 'Tasting-Gutschein';
        state.persons     = result.data.persons      || '';

        if (voucherInfo) {
          voucherInfo.innerHTML =
            '<p class="voucher-info__title">' + state.tastingName + '</p>'
            + '<p class="voucher-info__meta">Für '
            + state.persons
            + (state.persons === 1 ? ' Person' : ' Personen')
            + '</p>';
        }

        goTo(step1, step2);
        loadSlots();

      } else {
        var errCode = (result.data && result.data.error) ? result.data.error : 'UNKNOWN';
        showErr(validateErr, errMsg(errCode));
      }
    })
    .catch(function () {
      setBusy(btnValidate, false, 'Gutschein prüfen');
      showErr(validateErr, 'Verbindung fehlgeschlagen. Bitte versuche es erneut.');
    });
  });

  /* =========================================================
     SCHRITT 2 — get-available-slots
     ========================================================= */
  function loadSlots() {
    hideErr(slotsErr);
    if (!slotsEl) return;

    slotsEl.innerHTML = '<p class="slots-loading">Verfügbare Termine werden geladen …</p>';

    fetch(apiBase() + '/get-available-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voucher_code: state.code })
    })
    .then(function (res) {
      return res.json().then(function (d) { return { ok: res.ok, data: d }; });
    })
    .then(function (result) {
      if (!result.ok) {
        slotsEl.innerHTML = '';
        showErr(slotsErr, errMsg(result.data && result.data.error));
        return;
      }

      var slots = Array.isArray(result.data) ? result.data : [];

      if (!slots.length) {
        slotsEl.innerHTML = '<div class="slots-empty">'
          + 'Aktuell sind keine Termine verfügbar.<br>'
          + 'Melde dich direkt bei uns &mdash; wir finden gemeinsam einen Termin.'
          + '</div>';
        return;
      }

      slotsEl.innerHTML = slots.map(function (slot) {
        var dateLabel = formatDate(slot.slot_date);
        var seats     = slot.available_seats;
        var label     = dateLabel + ' · ' + slot.slot_time + ' Uhr';
        return '<button class="slot-card" type="button"'
          + ' data-slot-id="'    + slot.slot_id   + '"'
          + ' data-slot-label="' + label          + '"'
          + ' aria-label="Termin ' + dateLabel + ' um ' + slot.slot_time + ' Uhr, ' + seats + ' Plätze frei">'
          + '<span class="slot-card__date">' + dateLabel + '</span>'
          + '<span class="slot-card__time">' + slot.slot_time + ' Uhr</span>'
          + '<span class="slot-card__seats">' + seats + ' Plätze frei</span>'
          + '</button>';
      }).join('');

      slotsEl.querySelectorAll('.slot-card').forEach(function (card) {
        card.addEventListener('click', function () {
          slotsEl.querySelectorAll('.slot-card').forEach(function (c) {
            c.classList.remove('is-selected');
          });
          card.classList.add('is-selected');

          state.slotId    = card.getAttribute('data-slot-id');
          state.slotLabel = card.getAttribute('data-slot-label');

          if (chosenSlotEl) {
            chosenSlotEl.innerHTML =
              '<p class="voucher-info__title">Gewählter Termin</p>'
              + '<p class="voucher-info__meta">' + state.slotLabel + '</p>';
          }

          setTimeout(function () { goTo(step2, step3); }, 180);
        });
      });
    })
    .catch(function () {
      slotsEl.innerHTML = '';
      showErr(slotsErr, 'Verbindung fehlgeschlagen. Bitte versuche es erneut.');
    });
  }

  /* --- Zurück-Buttons ------------------------------------ */
  var btnBack1 = document.getElementById('btn-back-1');
  if (btnBack1) {
    btnBack1.addEventListener('click', function () {
      goTo(step2, step1);
    });
  }

  var btnBack2 = document.getElementById('btn-back-2');
  if (btnBack2) {
    btnBack2.addEventListener('click', function () {
      state.slotId    = null;
      state.slotLabel = null;
      if (slotsEl) {
        slotsEl.querySelectorAll('.slot-card').forEach(function (c) {
          c.classList.remove('is-selected');
        });
      }
      goTo(step3, step2);
    });
  }

  /* =========================================================
     SCHRITT 3 — schedule-voucher
     ========================================================= */
  if (scheduleForm) {

    // Live-Validierung: invalid-Markierung beim Tippen aufheben
    scheduleForm.querySelectorAll('.form-input').forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.value.trim()) field.classList.remove('is-invalid');
      });
    });

    scheduleForm.addEventListener('submit', function (e) {
      e.preventDefault();
      hideErr(scheduleErr);

      // Pflichtfelder prüfen
      var valid = true;
      scheduleForm.querySelectorAll('[required]').forEach(function (field) {
        field.classList.remove('is-invalid');
        if (!field.value.trim()) {
          field.classList.add('is-invalid');
          valid = false;
        }
      });

      // E-Mail-Format
      var emailEl = document.getElementById('s-email');
      if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
        emailEl.classList.add('is-invalid');
        valid = false;
      }

      if (!valid) {
        showErr(scheduleErr, 'Bitte fülle alle Pflichtfelder korrekt aus.');
        return;
      }

      if (!state.slotId) {
        showErr(scheduleErr, 'Kein Termin gewählt. Bitte gehe zurück und wähle einen Termin.');
        return;
      }

      var submitBtn  = scheduleForm.querySelector('[type="submit"]');
      var telefonEl  = document.getElementById('s-telefon');
      var adresseEl  = document.getElementById('s-adresse');
      var nameEl     = document.getElementById('s-name');

      setBusy(submitBtn, true, 'Termin verbindlich buchen');

      fetch(apiBase() + '/schedule-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucher_code:     state.code,
          slot_id:          state.slotId,
          customer_name:    nameEl    ? nameEl.value.trim()    : '',
          customer_email:   emailEl   ? emailEl.value.trim()   : '',
          customer_phone:   telefonEl ? telefonEl.value.trim() : '',
          customer_address: adresseEl ? adresseEl.value.trim() : ''
        })
      })
      .then(function (res) {
        return res.json().then(function (d) { return { ok: res.ok, data: d }; });
      })
      .then(function (result) {
        setBusy(submitBtn, false, 'Termin verbindlich buchen');

        if (result.ok && result.data && result.data.success) {
          showSuccess();
        } else {
          var errCode = (result.data && result.data.error) ? result.data.error : 'UNKNOWN';
          showErr(scheduleErr, errMsg(errCode));

          // Bei ausgebuchtem Slot automatisch zurück zur Terminwahl
          if (errCode === 'SLOT_NO_CAPACITY') {
            setTimeout(function () {
              hideErr(scheduleErr);
              goTo(step3, step2);
              loadSlots();
            }, 2500);
          }
        }
      })
      .catch(function () {
        setBusy(submitBtn, false, 'Termin verbindlich buchen');
        showErr(scheduleErr, 'Verbindung fehlgeschlagen. Bitte versuche es erneut.');
      });
    });
  }

  function showSuccess() {
    if (step1) step1.hidden = true;
    if (step2) step2.hidden = true;
    if (step3) step3.hidden = true;

    if (successBody && state.slotLabel) {
      successBody.textContent =
        'Dein Termin am ' + state.slotLabel
        + ' ist bestätigt. Du erhältst in Kürze eine Bestätigung per E-Mail.';
    }

    if (successEl) {
      successEl.classList.add('is-visible');
      successEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

})();
