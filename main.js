document.addEventListener('DOMContentLoaded', () => {
  /* Language selector logic */
  const storedLang = localStorage.getItem('lang') || 'en';
  document.documentElement.lang = storedLang;
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = storedLang;
    langSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      localStorage.setItem('lang', newLang);
      document.documentElement.lang = newLang;
      location.reload();
    });
  }

  /* Theme selector logic */
  const storedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.body.classList.add(storedTheme + '-theme');
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = storedTheme;
    themeSelect.addEventListener('change', (e) => {
      const newTheme = e.target.value;
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(newTheme + '-theme');
      localStorage.setItem('theme', newTheme);
    });
  }

  /* Load translations and apply them */
  fetch('translations.json')
    .then(res => res.json())
    .then(translations => {
      const t = translations[storedLang] || translations['en'];

      /* Set page title and translate all elements with data-i18n */
      const titleElement = document.querySelector('[data-i18n="title"]');
      if (titleElement) {
        document.title = titleElement.textContent || t.title;
      }
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
          el.innerText = t[key];
        }
      });

      // Make translations available globally for other scripts
      window.translations = t;
      window.currentLang = storedLang;

      // Dispatch event to notify other scripts that translations are loaded
      window.dispatchEvent(new CustomEvent('translationsLoaded', { detail: { translations: t, lang: storedLang } }));

      // Initialize mobile menu after translations are loaded
      initMobileMenu();
    })
    .catch(err => console.error('Error loading translations:', err));

  /* Mobile Menu Functionality */
  function initMobileMenu() {
    // Check if we're on mobile (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;

    console.log('Mobile menu init - Screen width:', window.innerWidth, 'Is mobile:', isMobile);

    if (!isMobile) {
      console.log('Not initializing mobile menu - desktop detected');
      return; // Don't initialize mobile menu on desktop
    }

    console.log('Initializing mobile menu for mobile device');

    // Create mobile menu toggle button
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '☰';
    mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.style.cssText = `
      display: block;
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      z-index: 101;
      background: var(--header-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      color: var(--fg);
    `;

    // Insert toggle button into header
    const header = document.querySelector('header');
    console.log('Header found:', !!header);

    if (header) {
      header.style.position = 'relative';
      header.appendChild(mobileToggle);
      console.log('Mobile toggle button added to header');
    } else {
      console.error('Header not found!');
      return;
    }

    // Get navigation element
    const nav = document.querySelector('nav');
    console.log('Nav found:', !!nav);

    if (nav && mobileToggle) {
      console.log('Both nav and mobile toggle found, setting up event listeners');
      // Initially hide the nav on mobile
      nav.style.display = 'none';

      // Toggle mobile menu
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = nav.classList.contains('mobile-open');

        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      // Close menu when clicking on a navigation link
      nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
          closeMobileMenu();
        }
      });

      // Close menu when pressing Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('mobile-open')) {
          closeMobileMenu();
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (nav.classList.contains('mobile-open') && !header.contains(e.target)) {
          closeMobileMenu();
        }
      });

      function openMobileMenu() {
        nav.classList.add('mobile-open');
        nav.style.display = 'flex';
        mobileToggle.innerHTML = '✕';
        mobileToggle.setAttribute('aria-expanded', 'true');
      }

      function closeMobileMenu() {
        nav.classList.remove('mobile-open');
        nav.style.display = 'none';
        mobileToggle.innerHTML = '☰';
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    }

    // Re-check on window resize
    window.addEventListener('resize', () => {
      const currentlyMobile = window.innerWidth <= 768;
      if (currentlyMobile !== isMobile) {
        location.reload(); // Reload to reinitialize with correct setup
      }
    });
  }
});