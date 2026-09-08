/**
 * PassageS - Script Principal
 * Interactivité globale, initialisation des icônes Lucide, gestion du Header
 * et hydratation dynamique des contenus modifiés via le CMS (Decap / Sveltia)
 */

(function () {
  'use strict';

  // 1. Initialisation des icônes Lucide
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIcons);
  } else {
    initIcons();
  }

  // 2. Ombre et style dynamique du Header au défilement
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 2b. Gestionnaire du Menu Hamburger & Navigation Mobile
  function initMobileMenu() {
    var menuToggle = document.getElementById('menuToggle');
    var mainNav = document.getElementById('mainNav');
    if (!menuToggle || !mainNav) return;

    // Créer ou récupérer le voile d'arrière-plan (backdrop)
    var backdrop = document.getElementById('navBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'navBackdrop';
      backdrop.className = 'nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    function openMenu() {
      menuToggle.classList.add('is-active');
      menuToggle.setAttribute('aria-expanded', 'true');
      var lang = document.documentElement.lang || 'fr';
      menuToggle.setAttribute('aria-label', lang === 'en' ? 'Close menu' : 'Fermer le menu');
      mainNav.classList.add('is-open');
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      menuToggle.classList.remove('is-active');
      menuToggle.setAttribute('aria-expanded', 'false');
      var lang = document.documentElement.lang || 'fr';
      menuToggle.setAttribute('aria-label', lang === 'en' ? 'Open menu' : 'Ouvrir le menu');
      mainNav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    }

    function toggleMenu() {
      var isOpen = mainNav.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    backdrop.addEventListener('click', closeMenu);

    // Fermer le menu lors d'un clic sur un lien dans la navigation
    var navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 840) {
          closeMenu();
        }
      });
    });

    // Fermer le menu avec la touche Échap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });

    // Fermer automatiquement si on redimensionne sur grand écran (> 840px)
    window.addEventListener('resize', function () {
      if (window.innerWidth > 840 && mainNav.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }

  // 3. Gestionnaire de la Newsletter (carte Soutenir et footer avec mécanisme Brevo)
  window.handleNewsletter = function (formEl) {
    var form = formEl && formEl.nodeType === 1 ? formEl : (typeof event !== 'undefined' && event && event.target ? event.target : null);
    var emailInput = form ? (form.querySelector('input[name="EMAIL"]') || form.querySelector('input[type="email"]')) : document.getElementById('newsletterEmail');
    var submitBtn = form ? form.querySelector('button[type="submit"]') : document.getElementById('newsletterBtn');

    if (!emailInput) emailInput = document.getElementById('newsletterEmail');
    if (!submitBtn) submitBtn = document.getElementById('newsletterBtn');

    if (form && typeof form.checkValidity === 'function' && !form.checkValidity()) {
      if (typeof form.reportValidity === 'function') form.reportValidity();
      return false;
    }

    if (emailInput && emailInput.value && (!emailInput.type || emailInput.type !== 'email' || emailInput.checkValidity())) {
      var isEn = document.documentElement.lang === 'en';
      submitBtn.textContent = isEn ? '✓ Thank you! Subscribed' : '✓ Merci ! Inscription validée';
      submitBtn.style.background = '#26EFDC';
      submitBtn.style.color = '#16121F';

      // Allow form submission to capture the value before marking as readonly/disabled
      setTimeout(function () {
        submitBtn.disabled = true;
        if (emailInput) emailInput.readOnly = true;
      }, 50);

      return true;
    }
    return false;
  };

  // 4. Rétrocompatibilité avec les anciens liens d'ancrage / hash (#dispositif, #demande, #en)
  (function handleHashRedirects() {
    var hash = window.location.hash;
    var currentPath = window.location.pathname;
    var isIndex = currentPath.endsWith('/') || currentPath.endsWith('index.html') || currentPath === '';
    
    if (isIndex) {
      if (hash === '#dispositif') {
        window.location.href = 'dispositif.html';
      } else if (hash === '#demande') {
        window.location.href = 'demande.html';
      }
    }
  })();

  // 5. Hydratation automatique des données éditées via le CMS (/admin)
  function hydrateCmsContent() {
    var path = window.location.pathname;
    var isIndex = path.endsWith('/') || path.endsWith('index.html') || path === '';
    var isDispositif = path.endsWith('dispositif.html');

    // Informations générales et coordonnées (sur toutes les pages)
    fetch('content/general.json')
      .then(function(res) { return res.ok ? res.json() : null; })
      .then(function(data) {
        if (!data) return;
        Object.keys(data).forEach(function(key) {
          var els = document.querySelectorAll('[data-cms="' + key + '"]');
          els.forEach(function(el) {
            if (key === 'telephone' && el.tagName === 'A') {
              el.textContent = data[key];
              if (data.telephone_link) el.href = 'tel:' + data.telephone_link;
            } else if (key === 'email' && el.tagName === 'A') {
              el.textContent = data[key];
              el.href = 'mailto:' + data[key];
            } else if (el.querySelector('span')) {
              el.querySelector('span').textContent = data[key];
            } else {
              el.textContent = data[key];
            }
          });
        });
      })
      .catch(function() {});

    // Contenus de la page d'accueil
    if (isIndex) {
      fetch('content/home.json')
        .then(function(res) { return res.ok ? res.json() : null; })
        .then(function(data) {
          if (!data) return;
          Object.keys(data).forEach(function(key) {
            var el = document.querySelector('[data-cms="' + key + '"]');
            if (el) el.textContent = data[key];
          });
        })
        .catch(function() {});
    }

    // Contenus de la page Le Dispositif
    if (isDispositif) {
      fetch('content/dispositif.json')
        .then(function(res) { return res.ok ? res.json() : null; })
        .then(function(data) {
          if (!data) return;
          Object.keys(data).forEach(function(key) {
            var el = document.querySelector('[data-cms="' + key + '"]');
            if (el) el.textContent = data[key];
          });
        })
        .catch(function() {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateCmsContent);
  } else {
    hydrateCmsContent();
  }

})();
