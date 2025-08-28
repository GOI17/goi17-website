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
    // Create mobile menu toggle button
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '☰';
    mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
    mobileToggle.setAttribute('aria-expanded', 'false');

    // Insert toggle button into header
    const header = document.querySelector('header');
    if (header) {
      header.style.position = 'relative';
      header.appendChild(mobileToggle);
    }

    // Get navigation element
    const nav = document.querySelector('nav');

    if (nav && mobileToggle) {
      // Toggle mobile menu
      mobileToggle.addEventListener('click', () => {
        const isOpen = nav.classList.contains('mobile-open');
        nav.classList.toggle('mobile-open');
        mobileToggle.innerHTML = isOpen ? '☰' : '✕';
        mobileToggle.setAttribute('aria-expanded', !isOpen);

        // Close menu when clicking outside
        if (!isOpen) {
          document.addEventListener('click', closeMenuOnOutsideClick);
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

      function closeMenuOnOutsideClick(e) {
        if (!header.contains(e.target)) {
          closeMobileMenu();
          document.removeEventListener('click', closeMenuOnOutsideClick);
        }
      }

      function closeMobileMenu() {
        nav.classList.remove('mobile-open');
        mobileToggle.innerHTML = '☰';
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    }
  }
});