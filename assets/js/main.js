/* =========================================================
   MAIN.JS — Genusswerte Bonn
   Mobile nav · Sticky header · Smooth scroll · Scroll animations
   ========================================================= */

(function () {
  'use strict';

  /* --- Mobile Nav Toggle --------------------------------- */
  function initMobileNav() {
    var toggle = document.querySelector('.nav__toggle');
    var menu   = document.querySelector('.nav__menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });

    // Close when a nav link is clicked (mobile)
    menu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Sticky Header ------------------------------------ */
  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 60) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Smooth Scroll for anchor links ------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        var headerHeight = document.querySelector('.site-header')
          ? document.querySelector('.site-header').offsetHeight
          : 0;
        var targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
        // Update URL without jump
        history.pushState(null, '', this.getAttribute('href'));
      });
    });
  }

  /* --- Page Intro Splash --------------------------------- */
  function initPageIntro() {
    var intro = document.getElementById('page-intro');
    if (!intro) return;

    // Nach 1s beginnt CSS-Transition das Overlay wegzublenden (via is-done)
    setTimeout(function () {
      intro.classList.add('is-done');
      // Nach vollständiger Transition aus dem DOM entfernen
      setTimeout(function () { intro.parentNode && intro.parentNode.removeChild(intro); }, 1600);
    }, 1000);
  }

  /* --- Scroll-Animationen (IntersectionObserver) -------- */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.js-animate');
    if (!elements.length || !window.IntersectionObserver) {
      // Fallback: alles sofort einblenden falls kein Observer-Support
      elements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* --- Öffnungszeiten: heutigen Tag markieren ----------- */
  function initOpeningHoursToday() {
    var list = document.querySelector('[data-opening-hours]');
    if (!list) return;

    var today = new Date().getDay(); // 0 = Sonntag, 1 = Montag, ...
    var row = list.querySelector('.hours-list__row[data-day="' + today + '"]');
    if (!row) return;

    row.classList.add('is-today');
    row.setAttribute('aria-current', 'date');

    var dayEl = row.querySelector('.hours-list__day');
    if (dayEl && !row.querySelector('.hours-list__today-label')) {
      var label = document.createElement('span');
      label.className = 'hours-list__today-label';
      label.textContent = 'Heute';
      label.setAttribute('aria-hidden', 'true');
      dayEl.appendChild(label);
    }
  }

  /* --- Tasting Image Loop -------------------------------- */
  function initTastingLoop() {
    var slides = document.querySelectorAll('.tasting-loop__slide');
    if (slides.length < 2) return;

    var current = 0;

    setInterval(function () {
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
    }, 4500);
  }

  /* --- Tasting Cards & Modal ----------------------------- */
  var EUR = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  var DATE_FMT = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  var DATE_LONG = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  var MAX_PERSONS = 6;

  function formatPrice(value) {
    return EUR.format(value);
  }

  function formatDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    return DATE_FMT.format(d);
  }

  function formatDateLong(iso) {
    var d = new Date(iso + 'T00:00:00');
    return DATE_LONG.format(d);
  }

  function renderTastingCards() {
    var grid = document.querySelector('[data-tasting-cards]');
    if (!grid || !window.GW_TASTINGS) return;

    var html = window.GW_TASTINGS.map(function (t, i) {
      return ''
        + '<article class="card tasting-card js-animate" data-delay="' + ((i % 3) + 1) + '" aria-label="' + t.title + '">'
        + '  <div class="card__image">'
        + '    <img src="' + t.image + '" alt="' + t.title + ' — Genusswerte Bonn" width="400" height="300" loading="lazy">'
        + '  </div>'
        + '  <div class="card__body">'
        + '    <span class="card__eyebrow">' + t.category + '</span>'
        + '    <h3 class="card__title">' + t.title + '</h3>'
        + '    <p class="card__description">' + t.description + '</p>'
        + '    <ul class="tasting-card__meta">'
        + '      <li><span>Dauer</span>' + t.duration + '</li>'
        + '      <li><span>Ort</span>' + t.location + '</li>'
        + '    </ul>'
        + '    <p class="card__price">ab ' + formatPrice(t.pricePerPerson) + ' p. P.</p>'
        + '    <div class="card__action">'
        + '      <button type="button" class="btn btn--secondary tasting-card__btn" data-tasting-open="' + t.id + '">Termin auswählen</button>'
        + '    </div>'
        + '  </div>'
        + '</article>';
    }).join('');

    grid.innerHTML = html;

    // Cards in den Scroll-Animations-Observer einhängen
    if (window.IntersectionObserver) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      grid.querySelectorAll('.js-animate').forEach(function (el) { observer.observe(el); });
    } else {
      grid.querySelectorAll('.js-animate').forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  function initTastingModal() {
    var modal = document.getElementById('tasting-modal');
    if (!modal || !window.GW_TASTINGS) return;

    var state = { tasting: null, dateId: null, persons: 1 };

    var el = {
      category:   modal.querySelector('[data-modal-category]'),
      title:      modal.querySelector('[data-modal-title]'),
      description: modal.querySelector('[data-modal-description]'),
      duration:   modal.querySelector('[data-modal-duration]'),
      location:   modal.querySelector('[data-modal-location]'),
      dates:      modal.querySelector('[data-modal-dates]'),
      count:      modal.querySelector('[data-modal-count]'),
      dec:        modal.querySelector('[data-modal-decrement]'),
      inc:        modal.querySelector('[data-modal-increment]'),
      stepperHint: modal.querySelector('[data-modal-stepper-hint]'),
      summary:    modal.querySelector('[data-modal-summary]'),
      sumTitle:   modal.querySelector('[data-summary-title]'),
      sumDate:    modal.querySelector('[data-summary-date]'),
      sumPersons: modal.querySelector('[data-summary-persons]'),
      sumTotal:   modal.querySelector('[data-summary-total]'),
      buy:        modal.querySelector('[data-modal-buy]'),
      notice:     modal.querySelector('[data-modal-notice]'),
      close:      modal.querySelector('[data-modal-close]')
    };

    function getSelectedDate() {
      if (!state.tasting || !state.dateId) return null;
      return state.tasting.availableDates.find(function (d) { return d.id === state.dateId; }) || null;
    }

    function maxPersonsForSelection() {
      var d = getSelectedDate();
      if (!d) return MAX_PERSONS;
      return Math.min(MAX_PERSONS, d.availableSeats);
    }

    function updateStepperState() {
      var d = getSelectedDate();
      var max = maxPersonsForSelection();
      if (state.persons > max) state.persons = max;
      if (state.persons < 1) state.persons = 1;
      el.count.textContent = state.persons;
      el.dec.disabled = state.persons <= 1 || !d;
      el.inc.disabled = !d || state.persons >= max;
      if (!d) {
        el.stepperHint.textContent = 'Wähle zuerst einen Termin.';
      } else if (d.availableSeats < MAX_PERSONS) {
        el.stepperHint.textContent = 'Noch ' + d.availableSeats + ' Plätze frei. Für größere Runden besuche unsere Gruppenanfrage.';
      } else {
        el.stepperHint.textContent = 'Bis ' + MAX_PERSONS + ' Personen — größere Gruppen ab 7 Personen über Gruppenanfrage.';
      }
    }

    function updateSummary() {
      var d = getSelectedDate();
      if (!state.tasting || !d) {
        el.summary.hidden = true;
        el.buy.disabled = true;
        return;
      }
      el.summary.hidden = false;
      el.buy.disabled = false;
      el.sumTitle.textContent = state.tasting.title;
      el.sumDate.textContent = formatDateLong(d.date) + ' · ' + d.time + ' Uhr';
      el.sumPersons.textContent = state.persons + (state.persons === 1 ? ' Person' : ' Personen');
      el.sumTotal.textContent = formatPrice(state.tasting.pricePerPerson * state.persons);
    }

    function renderDates() {
      el.dates.innerHTML = state.tasting.availableDates.map(function (d) {
        var label = formatDate(d.date) + ' · ' + d.time + ' Uhr';
        var seats = d.availableSeats > 0
          ? '<span class="tasting-modal__seats">' + d.availableSeats + ' Plätze frei</span>'
          : '<span class="tasting-modal__seats tasting-modal__seats--full">Ausgebucht</span>';
        return ''
          + '<label class="tasting-modal__date' + (d.availableSeats === 0 ? ' is-disabled' : '') + '">'
          + '  <input type="radio" name="tasting-date" value="' + d.id + '"' + (d.availableSeats === 0 ? ' disabled' : '') + '>'
          + '  <span class="tasting-modal__date-label">' + label + '</span>'
          + '  ' + seats
          + '</label>';
      }).join('');

      el.dates.querySelectorAll('input[name="tasting-date"]').forEach(function (input) {
        input.addEventListener('change', function () {
          state.dateId = input.value;
          var d = getSelectedDate();
          state.persons = d ? Math.min(state.persons, maxPersonsForSelection()) : 1;
          updateStepperState();
          updateSummary();
        });
      });
    }

    function openFor(id) {
      var tasting = window.GW_TASTINGS.find(function (t) { return t.id === id; });
      if (!tasting) return;
      state.tasting = tasting;
      state.dateId = null;
      state.persons = 1;

      el.category.textContent = tasting.category;
      el.title.textContent = tasting.title;
      el.description.textContent = tasting.description;
      el.duration.textContent = 'Dauer: ' + tasting.duration;
      el.location.textContent = tasting.location;

      renderDates();
      updateStepperState();
      updateSummary();
      el.notice.hidden = true;
      el.buy.hidden = false;

      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', '');
      }
      document.body.classList.add('has-modal-open');
    }

    function closeModal() {
      if (typeof modal.close === 'function') {
        modal.close();
      } else {
        modal.removeAttribute('open');
      }
      document.body.classList.remove('has-modal-open');
    }

    // Klick auf Termin-Auswählen-Buttons
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-tasting-open]');
      if (trigger) {
        e.preventDefault();
        openFor(trigger.getAttribute('data-tasting-open'));
      }
    });

    // Stepper
    el.dec.addEventListener('click', function () {
      if (state.persons > 1) {
        state.persons--;
        updateStepperState();
        updateSummary();
      }
    });
    el.inc.addEventListener('click', function () {
      var max = maxPersonsForSelection();
      if (state.persons < max) {
        state.persons++;
        updateStepperState();
        updateSummary();
      }
    });

    // Schließen
    el.close.addEventListener('click', function (e) {
      e.preventDefault();
      closeModal();
    });
    modal.addEventListener('close', function () {
      document.body.classList.remove('has-modal-open');
    });
    // Backdrop-Click (Klick außerhalb des form-Containers)
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    // Kaufen-Button: zeigt Hinweis-Block, kein echter Checkout
    el.buy.addEventListener('click', function (e) {
      e.preventDefault();
      el.notice.hidden = false;
      el.buy.hidden = true;
      el.notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* --- Init on DOM ready -------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initPageIntro();
    initMobileNav();
    initStickyHeader();
    initSmoothScroll();
    initScrollAnimations();
    initTastingLoop();
    initOpeningHoursToday();
    renderTastingCards();
    initTastingModal();
  }
})();
