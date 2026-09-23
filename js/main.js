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
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderNewsletterSuccessUI(form, email) {
    if (!form) return;
    var container = form.parentElement;
    if (!container) return;

    // Éviter les doublons si la boîte de succès existe déjà dans ce conteneur
    if (container.querySelector('.newsletter-success-box')) return;

    var isEn = document.documentElement.lang === 'en';
    var successDiv = document.createElement('div');
    successDiv.className = 'newsletter-success-box';
    successDiv.setAttribute('role', 'status');

    var title = isEn ? 'Subscription confirmed!' : 'Inscription validée !';
    var emailText = email ? ' à <strong>' + escapeHtml(email) + '</strong>' : '';
    var emailTextEn = email ? ' to <strong>' + escapeHtml(email) + '</strong>' : '';

    var msg = isEn
      ? 'A confirmation email has been sent' + emailTextEn + '. Thank you for subscribing to PassageS!'
      : 'Un e-mail de confirmation vient de vous être envoyé' + emailText + '. Merci pour votre inscription à la lettre PassageS !';

    var spamNotice = isEn
      ? '(Please check your spam or junk folder if you don\'t see it within a few minutes)'
      : '(Pensez à vérifier vos courriers indésirables / spams si besoin)';

    var changeLinkText = isEn ? 'Use another email address' : 'Inscrire une autre adresse e-mail';

    successDiv.innerHTML =
      '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">' +
        '<span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #26EFDC; color: #16121F; flex-shrink: 0;">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
        '</span>' +
        '<strong style="color: #26EFDC; font-size: 15px; font-family: var(--font-cairo);">' + title + '</strong>' +
      '</div>' +
      '<p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: #F0ECF8;">' + msg + '</p>' +
      '<p style="margin: 6px 0 0 0; font-size: 11.5px; line-height: 1.4; color: #C9B4FF;"><em>' + spamNotice + '</em></p>' +
      '<button type="button" class="newsletter-reset-btn" style="background: none; border: none; color: #26EFDC; text-decoration: underline; font-size: 11.5px; cursor: pointer; padding: 0; margin-top: 8px; font-family: inherit; display: inline-block;">' + changeLinkText + '</button>';

    // Masquer le formulaire (le champ email disparaît pour cet utilisateur)
    form.style.display = 'none';

    // Masquer le paragraphe RGPD dans ce conteneur
    var rgpd = container.querySelector('.footer-newsletter-rgpd');
    if (rgpd) rgpd.style.display = 'none';

    // Insérer le message de succès à la place du formulaire
    form.insertAdjacentElement('afterend', successDiv);

    // Bouton de réinitialisation si l'utilisateur souhaite inscrire une autre adresse
    var resetBtn = successDiv.querySelector('.newsletter-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        try {
          localStorage.removeItem('passages_newsletter_subscribed');
          localStorage.removeItem('passages_newsletter_email');
        } catch (e) {}

        document.querySelectorAll('.newsletter-success-box').forEach(function (box) {
          box.remove();
        });
        document.querySelectorAll('form[action*="sibforms.com"]').forEach(function (f) {
          f.style.display = '';
          var input = f.querySelector('input[name="EMAIL"]') || f.querySelector('input[type="email"]');
          if (input) {
            input.readOnly = false;
            input.value = '';
          }
          var btn = f.querySelector('button[type="submit"]');
          if (btn) {
            btn.disabled = false;
            btn.textContent = isEn ? 'Subscribe' : 'S\'inscrire';
            btn.style.background = '';
            btn.style.color = '';
          }
          var r = f.parentElement ? f.parentElement.querySelector('.footer-newsletter-rgpd') : null;
          if (r) r.style.display = '';
        });
      });
    }
  }

  function initNewsletterState() {
    try {
      if (localStorage.getItem('passages_newsletter_subscribed') === 'true') {
        var savedEmail = localStorage.getItem('passages_newsletter_email') || '';
        document.querySelectorAll('form[action*="sibforms.com"]').forEach(function (form) {
          renderNewsletterSuccessUI(form, savedEmail);
        });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsletterState);
  } else {
    initNewsletterState();
  }

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
      var emailVal = emailInput.value.trim();

      // Enregistrer dans localStorage pour masquer définitivement le champ pour cet utilisateur
      try {
        localStorage.setItem('passages_newsletter_subscribed', 'true');
        localStorage.setItem('passages_newsletter_email', emailVal);
      } catch (e) {}

      // Dual submission: envoyer aussi en fetch d'arrière-plan
      try {
        if (window.fetch && form.action) {
          var formData = new FormData(form);
          fetch(form.action, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
          }).catch(function () {});
        }
      } catch (e) {}

      // Masquer immédiatement le formulaire et afficher le bloc de succès
      setTimeout(function () {
        document.querySelectorAll('form[action*="sibforms.com"]').forEach(function (f) {
          renderNewsletterSuccessUI(f, emailVal);
        });
      }, 120);

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

  // 6. Gestionnaire du Popup Modal Événementiel (Cycle de Webinaires - 3s)
  function initWebinarPopup() {
    var popup = document.getElementById('webinarPopup');
    if (!popup) return;

    var closeBtn = document.getElementById('closeWebinarPopupBtn');
    var learnMoreBtn = document.getElementById('popupLearnMoreBtn');

    function closePopup() {
      if (typeof popup.close === 'function' && popup.open) {
        popup.close();
      }
      try {
        sessionStorage.setItem('passages_webinar_popup_dismissed', 'true');
      } catch (e) {}
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closePopup);
    }

    if (learnMoreBtn) {
      learnMoreBtn.addEventListener('click', function () {
        closePopup();
        var actualitesSection = document.getElementById('agenda') || document.getElementById('actualites');
        if (actualitesSection) {
          actualitesSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Fermeture lors d'un clic sur l'arrière-plan (backdrop) pour les navigateurs sans closedby natif
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      popup.addEventListener('click', function (event) {
        if (event.target !== popup) return;
        var rect = popup.getBoundingClientRect();
        var isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          closePopup();
        }
      });
    }

    // Écouter l'événement 'close' natif pour marquer comme fermé dans sessionStorage
    popup.addEventListener('close', function () {
      try {
        sessionStorage.setItem('passages_webinar_popup_dismissed', 'true');
      } catch (e) {}
    });

    // Déclencher après 3 secondes si non fermé dans la session actuelle
    var isDismissed = false;
    try {
      isDismissed = sessionStorage.getItem('passages_webinar_popup_dismissed') === 'true';
    } catch (e) {}

    if (!isDismissed) {
      setTimeout(function () {
        if (popup && typeof popup.showModal === 'function' && !popup.open) {
          popup.showModal();
        }
      }, 3000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebinarPopup);
  } else {
    initWebinarPopup();
  }

})();
