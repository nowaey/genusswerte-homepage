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
  }
})();
