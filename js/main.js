(function () {
  'use strict';

  var root = document.documentElement;
  var sidebar = document.querySelector('[data-sidebar]');
  var themeToggle = document.querySelector('[data-theme-toggle]');
  var themeLabel = document.querySelector('[data-theme-label]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav-link]'));
  var navList = document.querySelector('[data-nav-list]');
  var indicator = document.querySelector('[data-indicator]');
  var sections = navLinks
    .map(function (link) { return document.getElementById(link.dataset.target); })
    .filter(Boolean);

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Тёмная' : 'Светлая';
  }

  function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved) {
      applyTheme(saved);
    } else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  /* ---------- Mobile menu ---------- */
  function closeMenu() {
    if (!sidebar) return;
    sidebar.classList.remove('sidebar--open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function () {
      var isOpen = sidebar.classList.toggle('sidebar--open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ---------- Sliding indicator ---------- */
  function moveIndicatorTo(link) {
    if (!indicator || !link || !navList) return;
    var isRow = getComputedStyle(navList).flexDirection === 'row';
    var linkRect = link.getBoundingClientRect();
    var listRect = navList.getBoundingClientRect();

    if (isRow) {
      indicator.style.width = linkRect.width + 'px';
      indicator.style.height = '3px';
      indicator.style.transform = 'translateX(' + (linkRect.left - listRect.left) + 'px)';
      indicator.style.top = 'auto';
      indicator.style.bottom = '0';
    } else {
      indicator.style.height = linkRect.height + 'px';
      indicator.style.width = '4px';
      indicator.style.transform = 'translateY(' + (linkRect.top - listRect.top) + 'px)';
    }
  }

  function setActiveLink(targetId) {
    var activeLink = null;
    navLinks.forEach(function (link) {
      var isActive = link.dataset.target === targetId;
      link.classList.toggle('sidebar__nav-link--active', isActive);
      if (isActive) activeLink = link;
    });
    if (activeLink) moveIndicatorTo(activeLink);
  }

  /* ---------- Scroll spy ---------- */
  if ('IntersectionObserver' in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach(function (section) { observer.observe(section); });
  }

  window.addEventListener('resize', function () {
    var current = document.querySelector('.sidebar__nav-link--active');
    if (current) moveIndicatorTo(current);
  });

  /* ---------- Hero: font-cycling word ---------- */
  var cycleWord = document.querySelector('[data-cycle-word]');
  var FONT_CLASSES = [
    'hero__word--code',
    'hero__word--display',
    'hero__word--serif',
    'hero__word--script',
    'hero__word--geo'
  ];

  function initFontCycle() {
    if (!cycleWord) return;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cycleWord.classList.add(FONT_CLASSES[0]);
    if (prefersReducedMotion) return;

    var index = 0;
    setInterval(function () {
      index = (index + 1) % FONT_CLASSES.length;
      cycleWord.classList.add('hero__word--swap');
      setTimeout(function () {
        cycleWord.classList.remove.apply(cycleWord.classList, FONT_CLASSES);
        cycleWord.classList.add(FONT_CLASSES[index]);
        cycleWord.classList.remove('hero__word--swap');
      }, 280);
    }, 2400);
  }

  /* ---------- Custom cursor ---------- */
  function initCursor() {
    var cursor = document.querySelector('[data-cursor]');
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!cursor || !canHover) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('has-custom-cursor');

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var curX = mouseX;
    var curY = mouseY;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (reducedMotion) {
        curX = mouseX;
        curY = mouseY;
        cursor.style.transform = 'translate(' + curX + 'px, ' + curY + 'px) translate(-50%, -50%)';
      }
    });

    if (!reducedMotion) {
      (function tick() {
        curX += (mouseX - curX) * 0.2;
        curY += (mouseY - curY) * 0.2;
        cursor.style.transform = 'translate(' + curX + 'px, ' + curY + 'px) translate(-50%, -50%)';
        requestAnimationFrame(tick);
      })();
    }

    document.addEventListener('mouseover', function (e) {
      cursor.classList.toggle('cursor--light', !!e.target.closest('.section--contacts'));
      if (e.target.closest('a, button, [data-project-card], [data-zoom]')) cursor.classList.add('cursor--active');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, [data-project-card], [data-zoom]')) cursor.classList.remove('cursor--active');
    });
  }

  /* ---------- Hero: floating shapes parallax ---------- */
  function initHeroParallax() {
    var hero = document.getElementById('hero');
    var wraps = hero ? Array.prototype.slice.call(hero.querySelectorAll('[data-depth]')) : [];
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hero || !wraps.length || !canHover || reducedMotion) return;

    var rect = hero.getBoundingClientRect();
    function updateRect() { rect = hero.getBoundingClientRect(); }
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });

    var targetX = 0;
    var targetY = 0;
    var state = wraps.map(function () { return { x: 0, y: 0 }; });

    hero.addEventListener('mousemove', function (e) {
      targetX = (e.clientX - rect.left) / rect.width - 0.5;
      targetY = (e.clientY - rect.top) / rect.height - 0.5;
    });

    hero.addEventListener('mouseleave', function () {
      targetX = 0;
      targetY = 0;
    });

    (function tick() {
      wraps.forEach(function (wrap, i) {
        var depth = parseFloat(wrap.dataset.depth) || 20;
        var goalX = targetX * 2 * depth;
        var goalY = targetY * 2 * depth;
        var st = state[i];
        st.x += (goalX - st.x) * 0.12;
        st.y += (goalY - st.y) * 0.12;
        wrap.style.transform = 'translate(' + st.x.toFixed(2) + 'px, ' + st.y.toFixed(2) + 'px)';
      });
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- Project cards: reveal on scroll ---------- */
  function initProjectReveal() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-project-card], [data-reveal]'));
    if (!cards.length) return;

    cards.forEach(function (card, i) {
      card.style.transitionDelay = (i % 3) * 90 + 'ms';
    });

    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (card) { card.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach(function (card) { observer.observe(card); });
  }

  /* ---------- Project quick-view modal ---------- */
  function initProjectModal() {
    var modal = document.querySelector('[data-project-modal]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-project-card]'));
    if (!modal || !cards.length) return;

    var titleEl = modal.querySelector('[data-modal-title]');
    var metaEl = modal.querySelector('[data-modal-meta]');
    var descEl = modal.querySelector('[data-modal-description]');
    var linkEl = modal.querySelector('[data-modal-link]');
    var detailEl = modal.querySelector('[data-modal-detail]');
    var shotEl = modal.querySelector('[data-modal-shot]');
    var prevBtn = modal.querySelector('[data-modal-prev]');
    var nextBtn = modal.querySelector('[data-modal-next]');
    var closeEls = Array.prototype.slice.call(modal.querySelectorAll('[data-modal-close]'));

    var shotsList = [];
    var shotCount = 1;
    var shotIndex = 0;
    var lastFocused = null;

    function parseShots(raw) {
      if (!raw) return [];
      var items = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var looksLikeImages = items.some(function (s) { return /\.(jpe?g|png|webp|gif|svg)$/i.test(s); });
      return looksLikeImages ? items : [];
    }

    function renderShot() {
      if (shotsList.length) {
        shotEl.classList.remove('is-placeholder-media');
        shotEl.textContent = '';
        var img = shotEl.querySelector('img');
        if (!img) {
          img = document.createElement('img');
          shotEl.appendChild(img);
        }
        img.src = shotsList[shotIndex];
        img.alt = (titleEl.textContent || 'Проект') + ' — скриншот ' + (shotIndex + 1);
      } else {
        shotEl.classList.add('is-placeholder-media');
        shotEl.innerHTML = '';
        shotEl.textContent = 'Скриншот ' + (shotIndex + 1) + ' из ' + shotCount;
      }
    }

    function openModal(card) {
      lastFocused = document.activeElement;

      titleEl.textContent = card.dataset.title || '';
      metaEl.textContent = card.dataset.meta || '';
      descEl.textContent = card.dataset.description || '';

      var link = card.dataset.link || '';
      var detail = card.dataset.detail || '';

      if (link) {
        linkEl.href = link;
        linkEl.style.display = '';
      } else {
        linkEl.style.display = 'none';
      }

      if (detail) {
        detailEl.href = detail;
        detailEl.style.display = '';
      } else {
        detailEl.style.display = 'none';
      }

      shotsList = parseShots(card.dataset.shots);
      shotCount = shotsList.length || parseInt(card.dataset.shots, 10) || 1;
      shotIndex = 0;
      renderShot();

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      modal.querySelector('.project-modal__close').focus();
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function () { openModal(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card);
        }
      });
    });

    closeEls.forEach(function (el) { el.addEventListener('click', closeModal); });

    prevBtn.addEventListener('click', function () {
      shotIndex = (shotIndex - 1 + shotCount) % shotCount;
      renderShot();
    });
    nextBtn.addEventListener('click', function () {
      shotIndex = (shotIndex + 1) % shotCount;
      renderShot();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (modal.classList.contains('is-open')) closeModal();
    });
  }

  /* ---------- Lightbox: увеличение любого элемента с [data-zoom] ---------- */
  function initLightbox() {
    var lightbox = document.querySelector('[data-lightbox]');
    if (!lightbox) return;

    var content = lightbox.querySelector('[data-lightbox-content]');
    var closeEls = Array.prototype.slice.call(lightbox.querySelectorAll('[data-lightbox-close]'));
    var lastFocused = null;
    var prevOverflow = '';

    function open(source) {
      lastFocused = document.activeElement;
      var img = source.tagName === 'IMG' ? source : source.querySelector('img');
      content.innerHTML = '';

      if (img) {
        content.classList.remove('is-placeholder-media');
        var big = document.createElement('img');
        big.src = img.currentSrc || img.src;
        big.alt = img.alt || '';
        content.appendChild(big);
      } else {
        var holder = source.querySelector('.is-placeholder-media') || source;
        content.classList.add('is-placeholder-media');
        content.textContent = holder.textContent.trim();
      }

      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      closeEls[closeEls.length - 1].focus();
    }

    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = prevOverflow;
      if (lastFocused) lastFocused.focus();
    }

    document.addEventListener('click', function (e) {
      var zoomEl = e.target.closest('[data-zoom]');
      if (zoomEl) open(zoomEl);
    });

    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-zoom]')) {
        e.preventDefault();
        open(e.target);
        return;
      }
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        e.preventDefault();
        close();
      }
    });

    closeEls.forEach(function (el) { el.addEventListener('click', close); });
  }

  /* ---------- Page overlay: entrance + transitions between pages ---------- */
  function initPageOverlay() {
    var overlay = document.querySelector('[data-preloader]');
    var heroEls = Array.prototype.slice.call(document.querySelectorAll('.hero-reveal'));
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isHomepage = !!document.getElementById('hero');
    var alreadyShown = false;
    try { alreadyShown = sessionStorage.getItem('vl-intro-shown') === '1'; } catch (err) {}

    function revealHero(stagger) {
      heroEls.forEach(function (el, i) {
        setTimeout(function () { el.classList.add('is-in'); }, stagger ? i * 140 : 0);
      });
    }

    if (!overlay) {
      revealHero(!reducedMotion);
      return;
    }

    if (reducedMotion) {
      overlay.classList.add('is-hidden');
      revealHero(false);
    } else if (isHomepage && !alreadyShown) {
      /* Первый визит на сайт за сессию: длинная кинематографичная заставка + hero по шагам */
      window.addEventListener('load', function () {
        setTimeout(function () {
          overlay.classList.add('is-hidden');
          revealHero(true);
          try { sessionStorage.setItem('vl-intro-shown', '1'); } catch (err) {}
        }, 700);
      });
    } else {
      /* Любая другая загрузка (переход с другой страницы, повторный заход): коротко */
      setTimeout(function () {
        overlay.classList.add('is-hidden');
        revealHero(isHomepage);
      }, 260);
    }

    /* ---- Переход при клике на внутреннюю ссылку ---- */
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link || e.defaultPrevented || e.button !== 0) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var url;
      try { url = new URL(link.getAttribute('href'), window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      if (url.href === window.location.href) return;

      e.preventDefault();
      overlay.classList.remove('is-hidden');
      setTimeout(function () {
        window.location.href = link.href;
      }, reducedMotion ? 0 : 420);
    });
  }

  /* ---------- Init ---------- */
  initTheme();
  initPageOverlay();
  initFontCycle();
  initCursor();
  initHeroParallax();
  initProjectReveal();
  initLightbox();
  initProjectModal();
  window.addEventListener('load', function () {
    setActiveLink(navLinks[0] ? navLinks[0].dataset.target : null);
  });
})();
