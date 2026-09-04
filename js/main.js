/**
 * PassageS - Script Principal
 * Interactivité globale, initialisation des icônes Lucide et gestion de l'interface
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

  // 3. Gestionnaire de la Newsletter dans le footer
  window.handleNewsletter = function () {
    var emailInput = document.getElementById('newsletterEmail');
    var submitBtn = document.getElementById('newsletterBtn');
    if (emailInput && emailInput.value && (!emailInput.type || emailInput.type !== 'email' || emailInput.checkValidity())) {
      submitBtn.textContent = 'Merci ! Inscription validée';
      submitBtn.style.background = '#26EFDC';
      submitBtn.style.color = '#16121F';
      submitBtn.disabled = true;
      emailInput.disabled = true;
    }
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
      } else if (hash === '#en') {
        window.location.href = 'en.html';
      }
    }
  })();

})();
